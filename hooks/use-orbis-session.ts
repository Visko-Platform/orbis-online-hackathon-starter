"use client";

import { useReactor, useReactorMessage } from "@reactor-team/js-sdk";
import { useEffect, useRef, useState } from "react";
import { useOrbisReferencePrompt } from "./use-orbis-reference-prompt";
import { useOrbisTimeline } from "./use-orbis-timeline";

import {
  preferredOrbisResolution,
  STABLE_RESOLUTIONS,
  type OrbisMessage,
  unwrapOrbisMessage,
} from "@/lib/orbis";
import { openOrbisRun, type OrbisOpeningSignals } from "@/lib/orbis-opening";
import { orbisPromptPayload } from "@/lib/orbis-prompt";

export function useOrbisSession(
  clearJwt: () => void,
  getCurrentJwt: () => string | null,
) {
  const { status, sessionId, connect, disconnect, sendCommand, uploadFile } =
    useReactor((state) => ({
      status: state.status,
      sessionId: state.sessionId,
      connect: state.connect,
      disconnect: state.disconnect,
      sendCommand: state.sendCommand,
      uploadFile: state.uploadFile,
    }));

  const reference = useOrbisReferencePrompt();
  const { image, prompt, describingImage } = reference;
  const [resolution, setResolution] = useState("");
  const [availableResolutions, setAvailableResolutions] = useState(STABLE_RESOLUTIONS);
  const reportedResolutions = useRef<string[]>([]);
  const [muted, setMuted] = useState(true);
  const [busy, setBusy] = useState(false);
  const [nanoBusy, setNanoBusy] = useState(false);
  const [runStarted, setRunStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [imageStatus, setImageStatus] = useState("");
  const [error, setError] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  const previousStatus = useRef(status);
  const disconnecting = useRef(false);
  const openingSignals = useRef<OrbisOpeningSignals>({});
  const expectsImageForRun = useRef(false);

  const connected = status === "ready";
  const controlsBusy = busy || nanoBusy;
  const timing = useOrbisTimeline();
  const stopTiming = timing.stop;

  useEffect(() => {
    if (
      status === "disconnected" &&
      previousStatus.current !== "disconnected"
    ) {
      stopTiming();
      setRunStarted(false);
      setPaused(false);
      setImageStatus("");
      reportedResolutions.current = [];
      setAvailableResolutions(STABLE_RESOLUTIONS);
    }
    previousStatus.current = status;
  }, [status, stopTiming]);

  useEffect(() => {
    const handlePageHide = (event: PageTransitionEvent) => {
      // A page entering the back-forward cache is suspended, not closed.
      if (event.persisted || !sessionId) return;

      const jwt = getCurrentJwt();
      if (!jwt) return;

      // keepalive asks the browser to finish uploading this small request even
      // after the document starts unloading. The server then terminates only
      // the session owned by this session-scoped JWT.
      void fetch("/api/session-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, jwt }),
        keepalive: true,
      }).catch(() => {
        // The page is leaving, so there is nowhere useful to surface failure.
      });
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [getCurrentJwt, sessionId]);

  const runAction = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateRunState = (message: OrbisMessage) => {
    if (message.type === "state") {
      if (typeof message.started === "boolean") setRunStarted(message.started);
      if (typeof message.paused === "boolean") setPaused(message.paused);
      if (message.has_image === false && !message.started) setImageStatus("");
    } else if (message.type === "generation_started") {
      setRunStarted(true);
      setPaused(false);
      if (message.image_conditioned === true) {
        setImageStatus("Orbis started from this image");
      } else if (
        message.image_conditioned === false &&
        expectsImageForRun.current
      ) {
        setImageStatus("Orbis started without image conditioning");
        setError("Orbis started without the uploaded image.");
      }
    } else if (message.type === "generation_paused") {
      timing.stopEstimating();
      setPaused(true);
    } else if (message.type === "generation_resumed") {
      setPaused(false);
    } else if (
      message.type === "generation_complete" ||
      message.type === "generation_reset"
    ) {
      stopTiming();
      setRunStarted(false);
      setPaused(false);
    }
  };

  useReactorMessage((raw: unknown) => {
    const message = unwrapOrbisMessage(raw);

    if (message.type === "conditions_ready") {
      openingSignals.current.conditions?.();
    }

    if (message.type === "state" && message.has_image === true) {
      openingSignals.current.image?.();
    }

    if (message.type === "state" && message.available_resolutions) {
      const reported = message.available_resolutions.map(String);
      if (reported.length && reported.join() !== reportedResolutions.current.join()) {
        reportedResolutions.current = reported;
        setAvailableResolutions(reported);
      }
    }

    if (!disconnecting.current) {
      if (message.type === "generation_started" || (message.type === "state" && message.started === true)) {
        openingSignals.current.started?.();
      }
      updateRunState(message);
    }

    if (message.type === "command_error") {
      setError(
        `${message.command || "command"}: ${message.reason || "rejected"}`,
      );
      if (message.command === "start") {
        stopTiming();
        setRunStarted(false);
      }
    }

    if (message.type) {
      setEvents((current) => [message.type!, ...current].slice(0, 8));
    }
  });

  const startGeneration = async (startImage: File | null, runPrompt: string) => {
    expectsImageForRun.current = Boolean(startImage);
    const available = reportedResolutions.current.length ? reportedResolutions.current : STABLE_RESOLUTIONS;
    const deliveryResolution = available.includes(resolution) ? resolution : preferredOrbisResolution(available);
    timing.prepare(deliveryResolution, Boolean(startImage));
    await openOrbisRun({
      sendCommand,
      uploadFile,
      signals: openingSignals.current,
      image: startImage,
      prompt: runPrompt,
      resolution: deliveryResolution,
      imageAccepted: ({ width, height }) => {
        const dimensions = width && height ? ` (${width}×${height})` : "";
        setImageStatus(`Orbis accepted image${dimensions}`);
        setEvents((current) => ["image_accepted", ...current].slice(0, 8));
      },
      conditionsReady: () => {
        timing.render();
        setEvents((current) => ["conditions_ready", ...current].slice(0, 8));
      },
    });
  };

  const selectImage = (nextImage: File | null) => {
    reference.selectImage(nextImage);
    setImageStatus("");
  };

  const ensureConnected = async () => {
    if (connected) return;
    clearJwt();
    await connect();
  };

  const startScene = async (startImage: File | null, text: string, openingDirection?: string) => {
    const scene = text.trim();
    const accepted = await runAction(async () => {
      if (!scene) throw new Error("Enter a starting prompt.");
      timing.begin(!connected);
      try {
        await ensureConnected();
        await startGeneration(startImage, [scene, openingDirection].filter(Boolean).join("\n\n"));
      } catch (error) {
        stopTiming();
        throw error;
      }
    });
    return accepted ? scene : null;
  };

  const startFromNanoOutput = async (
    editedImage: File,
    groundedPrompt: string,
  ) => {
    reference.loadPreparedImage(editedImage, groundedPrompt);
    await startScene(editedImage, groundedPrompt);
  };

  const sendSteeringPrompt = async (payload: ReturnType<typeof orbisPromptPayload>) => {
    const reply = unwrapOrbisMessage(await sendCommand("set_prompt", payload));
    if (reply?.type !== "prompt_accepted") throw new Error(reply?.reason || "Orbis did not accept the edit.");
  };

  const steer = (text: string = prompt) =>
    runAction(async () => {
      if (!text.trim()) throw new Error("Enter a prompt before steering.");
      await sendSteeringPrompt(orbisPromptPayload(text, "steering"));
    });

  const disconnectSession = async () => {
    disconnecting.current = true;
    stopTiming();
    setRunStarted(false);
    setPaused(false);

    // Remove ReactorView before closing the WebRTC tracks it is playing.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    try {
      const disconnected = await runAction(() => disconnect());
      if (disconnected) clearJwt();
    } finally {
      disconnecting.current = false;
    }
  };

  return {
    status,
    connected,
    controlsBusy,
    describingImage,
    promptError: reference.promptError,
    runStarted,
    paused,
    muted,
    prompt,
    image,
    imageStatus,
    resolution: availableResolutions.includes(resolution) ? resolution : "",
    preferredResolution: preferredOrbisResolution(availableResolutions),
    availableResolutions,
    error,
    events,
    timeline: timing.timeline,
    onFirstFrame: timing.firstFrame,
    connectSession: () => runAction(ensureConnected),
    disconnectSession,
    toggleMuted: () => setMuted((current) => !current),
    setPrompt: reference.setPrompt,
    selectImage,
    loadPreparedImage: reference.loadPreparedImage,
    setResolution,
    startRun: () => startScene(image, prompt),
    startScene,
    startFromNanoOutput,
    setNanoBusy,
    steer: () => steer(),
    steerWithPrompt: steer,
    sendSteeringPrompt,
    pause: () => runAction(() => sendCommand("pause", {})),
    resume: () => runAction(() => sendCommand("resume", {})),
    reset: () => runAction(() => sendCommand("reset", {})),
  };
}

export type OrbisSession = ReturnType<typeof useOrbisSession>;
