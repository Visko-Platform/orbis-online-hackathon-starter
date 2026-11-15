"use client";

import { useReactor, useReactorMessage } from "@reactor-team/js-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

import { type OrbisMessage, unwrapOrbisMessage } from "@/lib/orbis";
import { timed, track } from "@/lib/telemetry";

// Billing: Orbis Stable is ~$0.0097 per connected second.
export const ORBIS_USD_PER_SECOND = 0.0097;
// Minimum spacing between prompts: one chunk is ~1.8 s; faster just queues morphs.
// Steering is chunk-aligned (guide: a set_prompt lands at the next ~1.8 s chunk boundary): at most one prompt per chunk,
// released as soon as a chunk completes; newest input wins. Fallback timer if a chunk event is missed.
const STEER_FALLBACK_MS = 2500;
export const OUTPUT_RESOLUTION = "1080p";
// Auto-disconnect after this much inactivity to stop billing.
const IDLE_DISCONNECT_MS = 15 * 60_000; // demo-friendly; Lifecast reconnects automatically on the next page

export type LogEntry = {
  id: number;
  at: number;
  kind: "take" | "cut" | "steer" | "morph" | "system" | "error";
  label?: string;
  text: string;
  imageUrl?: string;
};

type Telemetry = {
  chunk: number;
  fps?: number;
  width?: number;
  height?: number;
  resolution?: string;
  imageConditioned?: boolean;
};

let logId = 0;

export function useOrbisStudio(
  clearJwt: () => void,
  getCurrentJwt: () => string | null,
) {
  const {
    status,
    sessionId,
    connect,
    disconnect,
    sendCommand,
    uploadFile,
    requestClip,
    downloadClipAsFile,
  } = useReactor((s) => ({
    status: s.status,
    sessionId: s.sessionId,
    connect: s.connect,
    disconnect: s.disconnect,
    sendCommand: s.sendCommand,
    uploadFile: s.uploadFile,
    requestClip: s.requestClip,
    downloadClipAsFile: s.downloadClipAsFile,
  }));

  const connected = status === "ready";
  const [runStarted, setRunStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [telemetry, setTelemetry] = useState<Telemetry>({ chunk: 0 });
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [pendingSteer, setPendingSteer] = useState<string | null>(null);
  const [scenePrompt, setScenePrompt] = useState("");
  const sceneRef = useRef("");
  sceneRef.current = scenePrompt;
  const [muted, setMuted] = useState(false);
  /** Realtime readout: last measured steer -> next chunk, and click -> first frames for cuts. */
  /** While a cut primes (first chunk has no frames), the UI holds the cut's still image instead of a black frame. */
  const [priming, setPriming] = useState<string | null>(null);
  const [latency, setLatency] = useState<{ kind: "steer" | "cut"; ms: number; at: number } | null>(null);

  const lastSteerAt = useRef(0);
  const steerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ prompt: string; label?: string; kind: LogEntry["kind"]; queuedAt: number } | null>(null);
  const conditionsResolver = useRef<(() => void) | null>(null);
  const lastActivity = useRef(Date.now());
  const recentPrompts = useRef<string[]>([]);
  const disconnecting = useRef(false);
  // ---- profiling marks ----
  const connectClickAt = useRef<number | null>(null);
  const takeMarks = useRef<{ kind: string; clickAt: number; startSentAt?: number; startedLogged?: boolean; framesLogged?: boolean } | null>(null);
  const lastChunkAt = useRef<number | null>(null);
  const steerSentAt = useRef<number | null>(null);
  const steerChunks = useRef(0);
  const sentSinceChunk = useRef(false);
  const flushSteerRef = useRef<() => Promise<void>>(async () => undefined);

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "at">) => {
    setLog((current) => [{ ...entry, id: ++logId, at: Date.now() }, ...current].slice(0, 60));
  }, []);

  const touch = () => {
    lastActivity.current = Date.now();
  };

  // ---- connection bookkeeping ----
  useEffect(() => {
    if (connectClickAt.current !== null && status !== "disconnected") {
      track(`orbis.connect.${status}`, performance.now() - connectClickAt.current);
      if (status === "ready") connectClickAt.current = null;
    }
  }, [status]);

  useEffect(() => {
    if (connected) setConnectedAt((t) => t ?? Date.now());
    if (status === "disconnected") {
      setConnectedAt(null);
      setRunStarted(false);
      setPaused(false);
      setTelemetry({ chunk: 0 });
    }
  }, [connected, status]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close the session when the page goes away (bfcache-safe).
  useEffect(() => {
    const onHide = (event: PageTransitionEvent) => {
      if (event.persisted || !sessionId) return;
      const jwt = getCurrentJwt();
      if (!jwt) return;
      void fetch("/api/session-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, jwt }),
        keepalive: true,
      }).catch(() => undefined);
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [getCurrentJwt, sessionId]);

  // Dev-only: register the session so `npm run dev` can sweep it on restart.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !sessionId) return;
    const jwt = getCurrentJwt();
    if (!jwt) return;
    void fetch("/api/session-registry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, jwt }),
    }).catch(() => undefined);
  }, [getCurrentJwt, sessionId]);

  // ---- model messages ----
  useReactorMessage((raw: unknown) => {
    const m = unwrapOrbisMessage(raw) as OrbisMessage & Record<string, unknown>;
    if (m.type === "conditions_ready") {
      conditionsResolver.current?.();
      conditionsResolver.current = null;
    }
    if (disconnecting.current) return;
    const nowMs = performance.now();
    const take = takeMarks.current;
    if (m.type === "generation_started" && take?.startSentAt && !take.startedLogged) {
      take.startedLogged = true;
      track("orbis.take.generation_started", nowMs - take.startSentAt, { kind: take.kind });
    }
    if (m.type === "chunk_complete") {
      sentSinceChunk.current = false;
      if (pendingRef.current) void flushSteerRef.current();
      const frames = Number(m.frames_emitted ?? 0);
      if (lastChunkAt.current !== null) track("orbis.chunk.interval", nowMs - lastChunkAt.current, { frames, chunk: m.chunk_index });
      lastChunkAt.current = nowMs;
      if (take?.startSentAt && !take.framesLogged && frames > 0) {
        take.framesLogged = true;
        track("orbis.take.first_frames_after_start", nowMs - take.startSentAt, { kind: take.kind });
        track(`orbis.${take.kind}.click_to_first_frames`, nowMs - take.clickAt, { kind: take.kind });
        setPriming(null);
        setLatency({ kind: "cut", ms: nowMs - take.clickAt, at: Date.now() });
      }
      if (steerSentAt.current !== null) {
        steerChunks.current += 1;
        if (steerChunks.current === 1) track("orbis.steer.to_next_chunk", nowMs - steerSentAt.current);
        if (steerChunks.current >= 2) {
          // first chunk generated with the new prompt has been delivered = visible on screen
          track("orbis.steer.to_visible", nowMs - steerSentAt.current);
          setLatency({ kind: "steer", ms: nowMs - steerSentAt.current, at: Date.now() });
          steerSentAt.current = null;
        }
      }
    }
    if (m.type === "command_error") track("orbis.command_error", 0, { ok: false, command: m.command, reason: String(m.reason ?? "").slice(0, 160) });
    switch (m.type) {
      case "state":
        if (typeof m.started === "boolean") setRunStarted(m.started);
        if (typeof m.paused === "boolean") setPaused(m.paused);
        if (typeof m.session_chunk === "number" || typeof m.current_chunk === "number") {
          const chunk = (typeof m.session_chunk === "number" ? m.session_chunk : m.current_chunk) as number;
          setTelemetry((t) => ({ ...t, chunk }));
        }
        break;
      case "generation_started":
        setRunStarted(true);
        setPaused(false);
        setTelemetry({
          chunk: 0,
          fps: m.fps as number,
          width: m.width,
          height: m.height,
          resolution: m.resolution as string,
          imageConditioned: m.image_conditioned,
        });
        break;
      case "generation_paused":
        setPaused(true);
        break;
      case "generation_resumed":
        setPaused(false);
        break;
      case "generation_complete":
      case "generation_reset":
        setRunStarted(false);
        setPaused(false);
        break;
      case "command_error":
        setError(`${m.command || "command"}: ${m.reason || "rejected"}`);
        addLog({ kind: "error", text: `${m.command}: ${m.reason}` });
        break;
    }
  });

  // ---- idle auto-disconnect ----
  const disconnectSession = useCallback(async () => {
    disconnecting.current = true;
    if (steerTimer.current) clearTimeout(steerTimer.current);
    pendingRef.current = null;
    setPendingSteer(null);
    setRunStarted(false);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    try {
      await disconnect();
      if (process.env.NODE_ENV === "development" && sessionId) {
        await fetch("/api/session-registry", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }).catch(() => undefined);
      }
      clearJwt();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      disconnecting.current = false;
    }
  }, [clearJwt, disconnect, sessionId]);

  useEffect(() => {
    if (!connected) return;
    if (now - lastActivity.current > IDLE_DISCONNECT_MS) {
      addLog({ kind: "system", text: "Auto-disconnected after 15 idle minutes (billing stopped)." });
      void disconnectSession();
    }
  }, [addLog, connected, disconnectSession, now]);

  // ---- actions ----
  const guard = async (label: string, action: () => Promise<void>) => {
    touch();
    setBusy(label);
    setError("");
    try {
      await action();
      return true;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(message);
      addLog({ kind: "error", text: message });
      setPriming(null);
      return false;
    } finally {
      setBusy("");
    }
  };

  const connectSession = () =>
    guard("Connecting (a cold GPU can take a few minutes)…", async () => {
      lastActivity.current = Date.now();
      connectClickAt.current = performance.now();
      await timed("orbis.connect.call", () => connect());
      addLog({ kind: "system", text: "Connected to Orbis." });
    });

  const waitConditions = () => {
    let timer: ReturnType<typeof setTimeout>;
    const promise = new Promise<void>((resolve, reject) => {
      timer = setTimeout(() => {
        conditionsResolver.current = null;
        reject(new Error("Timed out waiting for conditions_ready"));
      }, 20_000);
      conditionsResolver.current = () => {
        clearTimeout(timer);
        resolve();
      };
    });
    return {
      promise,
      cancel: () => {
        clearTimeout(timer);
        conditionsResolver.current = null;
      },
    };
  };

  /**
   * Start a fresh take from an image + prompt. If a run is active this is a
   * hard CUT: reset -> set_image -> set_prompt -> start.
   */
  const takeInFlight = useRef(false);
  const queuedTake = useRef<{ image: File | null; prompt: string; opts: { kind?: "take" | "cut"; label?: string; imageUrl?: string } } | null>(null);
  /** One take/cut at a time: overlapping resets were wiping each other's prompt. The newest request waits its turn. */
  const startTake = async (
    image: File | null,
    prompt: string,
    opts: { kind?: "take" | "cut"; label?: string; imageUrl?: string } = {},
  ): Promise<boolean> => {
    if (takeInFlight.current) {
      queuedTake.current = { image, prompt, opts };
      return false;
    }
    takeInFlight.current = true;
    try {
      return await startTakeNow(image, prompt, opts);
    } finally {
      takeInFlight.current = false;
      const next = queuedTake.current;
      queuedTake.current = null;
      if (next) void startTake(next.image, next.prompt, next.opts);
    }
  };

  const startTakeNow = (
    image: File | null,
    prompt: string,
    opts: { kind?: "take" | "cut"; label?: string; imageUrl?: string } = {},
  ) =>
    guard(opts.kind === "cut" ? "Cutting to shot…" : "Starting take…", async () => {
      if (!connected) throw new Error("Connect to Orbis first.");
      if (!prompt.trim()) throw new Error("A prompt is required.");
      if (steerTimer.current) clearTimeout(steerTimer.current);
      pendingRef.current = null;
      setPendingSteer(null);
      const kind = opts.kind ?? "take";
      takeMarks.current = { kind, clickAt: performance.now() };
      if (opts.imageUrl) setPriming(opts.imageUrl);
      lastChunkAt.current = null;

      // Always reset first: a cut must replace whatever is running (reset is valid in any state).
      await timed("orbis.cmd.reset", () => sendCommand("reset", {}), { kind });
      setRunStarted(false);
      // Audio on for every take (picture-driven sound; survives reset, but cheap to re-assert).
      await timed("orbis.cmd.set_audio_enabled", () => sendCommand("set_audio_enabled", { audio_enabled: true }));
      // Deliver 1080p (1920x1080) instead of the 2K default; read at start, survives reset.
      await timed("orbis.cmd.set_resolution", () => sendCommand("set_resolution", { resolution: OUTPUT_RESOLUTION }));
      if (image) {
        const ref = await timed("orbis.upload", () => uploadFile(image, { name: image.name }), { kind, bytes: image.size });
        const reply = await timed("orbis.cmd.set_image", () => sendCommand("set_image", { image: ref }), { kind });
        const msg = reply ? unwrapOrbisMessage(reply) : null;
        if (!msg || msg.type !== "image_accepted") {
          throw new Error(`Orbis did not accept the image${msg?.reason ? `: ${msg.reason}` : ""}.`);
        }
      }
      // passthrough: our prompts are already written for the model, so skip Orbis' server-side rewrite
      // (it occasionally took 10 s and timed out, aborting the cut after reset = frozen stream). Retry once.
      const ready = waitConditions();
      let promptReply = await timed("orbis.cmd.set_prompt", () => sendCommand("set_prompt", { prompt: prompt.trim(), passthrough: true }), { kind });
      if (!promptReply) {
        promptReply = await timed("orbis.cmd.set_prompt_retry", () => sendCommand("set_prompt", { prompt: prompt.trim(), passthrough: true }), { kind });
      }
      if (!promptReply) {
        ready.cancel();
        throw new Error("Orbis did not accept the prompt.");
      }
      // The prompt_accepted reply already confirms; give the broadcast at most a short grace period.
      await timed("orbis.wait.conditions_ready", () => Promise.race([ready.promise.catch(() => undefined), new Promise((r) => setTimeout(r, 1500))]), { kind });
      ready.cancel();
      takeMarks.current.startSentAt = performance.now();
      await timed("orbis.cmd.start", () => sendCommand("start", {}), { kind });
      track(`orbis.${kind}.click_to_start_sent`, takeMarks.current.startSentAt - takeMarks.current.clickAt, { kind });
      setRunStarted(true);
      setPaused(false);
      lastSteerAt.current = Date.now();
      sentSinceChunk.current = false;
      setScenePrompt(prompt.trim());
      recentPrompts.current = [prompt.trim()];
      addLog({ kind: opts.kind ?? "take", label: opts.label, text: prompt.trim(), imageUrl: opts.imageUrl });
    });

  const flushSteer = useCallback(async () => {
    if (steerTimer.current) clearTimeout(steerTimer.current);
    steerTimer.current = null;
    const next = pendingRef.current;
    pendingRef.current = null;
    setPendingSteer(null);
    if (!next) return;
    sentSinceChunk.current = true;
    lastSteerAt.current = Date.now();
    track("orbis.steer.queue_wait", performance.now() - next.queuedAt, { kind: next.kind });
    steerSentAt.current = performance.now();
    steerChunks.current = 0;
    const anchored = sceneRef.current ? `${sceneRef.current} ${next.prompt}` : next.prompt;
    const reply = await timed("orbis.steer.ack", () => sendCommand("set_prompt", { prompt: anchored, passthrough: true }), { kind: next.kind });
    if (!reply) {
      addLog({ kind: "error", text: `Steer not accepted: ${next.prompt}` });
      return;
    }
    recentPrompts.current = [...recentPrompts.current, next.prompt].slice(-6);
    addLog({ kind: next.kind, label: next.label, text: next.prompt });
  }, [addLog, sendCommand]);

  flushSteerRef.current = flushSteer;

  /** Morph the running stream with a text prompt. Rate-limited; latest wins. */
  const steer = (prompt: string, label?: string, kind: LogEntry["kind"] = "steer") => {
    touch();
    if (!connected || !runStarted) {
      setError("Start a take before steering.");
      return;
    }
    pendingRef.current = { prompt: prompt.trim(), label, kind, queuedAt: pendingRef.current?.queuedAt ?? performance.now() };
    setPendingSteer(label ?? prompt.trim());
    if (!sentSinceChunk.current) {
      void flushSteer(); // nothing sent this chunk: send now, it lands at the upcoming boundary
      return;
    }
    // already sent this chunk: hold (newest wins) until the next chunk_complete releases it
    if (steerTimer.current) clearTimeout(steerTimer.current);
    steerTimer.current = setTimeout(() => void flushSteer(), STEER_FALLBACK_MS);
  };

  const exportClip = (seconds: number, filename: string) =>
    guard(`Exporting last ${seconds}s…`, async () => {
      const clip = await timed("orbis.clip.request", () => requestClip(seconds), { seconds });
      const blob = await timed("orbis.clip.download", () => downloadClipAsFile(clip, null), { seconds });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      addLog({ kind: "system", text: `Exported ${seconds}s clip → ${filename}` });
    });

  const connectedSeconds = connectedAt ? Math.max(0, Math.round((now - connectedAt) / 1000)) : 0;

  return {
    status,
    connected,
    runStarted,
    paused,
    busy,
    error,
    setError,
    log,
    addLog,
    telemetry,
    pendingSteer,
    latency,
    priming,
    scenePrompt,
    recentPrompts: () => recentPrompts.current,
    muted,
    toggleMuted: () => setMuted((m) => !m),
    connectedSeconds,
    costUsd: connectedSeconds * ORBIS_USD_PER_SECOND,
    idleSecondsLeft: connected
      ? Math.max(0, Math.round((IDLE_DISCONNECT_MS - (now - lastActivity.current)) / 1000))
      : 0,
    connectSession,
    disconnectSession,
    startTake,
    steer,
    pause: () => guard("Pausing…", async () => void (await sendCommand("pause", {}))),
    resume: () => guard("Resuming…", async () => void (await sendCommand("resume", {}))),
    reset: () => guard("Resetting…", async () => void (await sendCommand("reset", {}))),
    exportClip,
    touch,
  };
}

export type OrbisStudio = ReturnType<typeof useOrbisStudio>;
