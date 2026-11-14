import { ORBIS_MODEL_NAME, ORBIS_TRACKS, preferredOrbisResolution, requestReactorJwt, setOrbisResolution, unwrapOrbisMessage } from "@/lib/orbis";
import { orbisPromptPayload } from "@/lib/orbis-prompt";
import { prepareOrbisReference } from "@/lib/orbis-reference";
import type { Reactor } from "@reactor-team/js-sdk";

export function openTake(image: File, prompt: string, resolution: string, video: HTMLVideoElement, report: {
  status: (value: string) => void;
  firstFrame: () => void;
  ended: (error?: string) => void;
}) {
  const abort = new AbortController();
  let client: Reactor | undefined;
  let jwt: string | undefined;
  let conditionsReady: (() => void) | undefined;
  let availableResolutions: string[] = [];
  let editing = false;
  let frameCallback: number | undefined;
  let firstFrameTimer: number | undefined;

  const cleanupSession = () => {
    const sessionId = client?.getSessionId();
    if (!sessionId || !jwt) return;
    void fetch("/api/session-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, jwt }),
      keepalive: true,
    }).catch(() => {});
  };

  function close() {
    if (abort.signal.aborted) return;
    abort.abort();
    window.removeEventListener("pagehide", leave);
    if (frameCallback !== undefined) video.cancelVideoFrameCallback(frameCallback);
    clearTimeout(firstFrameTimer);
    video.srcObject = null;
    void client?.disconnect().catch(cleanupSession);
  }

  function end(error?: string) {
    if (abort.signal.aborted) return;
    close();
    report.ended(error);
  }

  async function command(name: string, data: Record<string, unknown>, ack?: string) {
    abort.signal.throwIfAborted();
    const reply = unwrapOrbisMessage(await client!.sendCommand(name, data));
    abort.signal.throwIfAborted();
    if (!reply || reply.type === "command_error" || (ack && reply.type !== ack)) {
      throw new Error(reply?.reason || `Orbis did not accept ${name}.`);
    }
  }

  const leave = () => { cleanupSession(); end(); };
  window.addEventListener("pagehide", leave);
  report.status("Connecting to Orbis…");
  const connect = async () => {
    const [sdk, token] = await Promise.all([import("@reactor-team/js-sdk"), requestReactorJwt()]);
    abort.signal.throwIfAborted();
    jwt = token;
    client = new sdk.Reactor({ modelName: ORBIS_MODEL_NAME, modelTracks: [...ORBIS_TRACKS], readyTimeoutMs: 90_000 });
    client.on("trackReceived", (name, track) => {
      if (abort.signal.aborted || name !== "main_video") return;
      video.srcObject = new MediaStream([track]);
      frameCallback = video.requestVideoFrameCallback(() => {
        clearTimeout(firstFrameTimer);
        report.firstFrame();
      });
      void video.play().catch(() => end("Couldn’t play the Orbis video."));
    });
    client.on("message", (raw) => {
      const message = unwrapOrbisMessage(raw);
      if (message.type === "state" && message.available_resolutions?.length) {
        availableResolutions = message.available_resolutions;
      }
      if (message.type === "conditions_ready") conditionsReady?.();
      if (message.type === "generation_complete") end();
      if (message.type === "command_error" && message.command === "start") {
        end(message.reason || "Orbis rejected the take.");
      }
      if (message.type === "generation_started" && message.image_conditioned === false) {
        end("Orbis started without the selected image.");
      }
    });
    client.on("statusChanged", (status) => {
      if (status === "disconnected") end("The Orbis session disconnected.");
    });
    await client.connect(token);
    if (abort.signal.aborted) cleanupSession();
  };

  void (async () => {
    try {
      const [reference] = await Promise.all([prepareOrbisReference(image), connect()]);
      abort.signal.throwIfAborted();
      report.status("Starting take…");
      await setOrbisResolution(
        (name, data) => client!.sendCommand(name, data),
        resolution || preferredOrbisResolution(availableResolutions),
      );
      abort.signal.throwIfAborted();
      const file = await client!.uploadFile(reference, { name: reference.name });
      await command("set_image", { image: file }, "image_accepted");
      const ready = new Promise<void>((resolve) => { conditionsReady = resolve; });
      await command("set_prompt", orbisPromptPayload(prompt, "opening", true), "prompt_accepted");
      const wait = AbortSignal.any([abort.signal, AbortSignal.timeout(15_000)]);
      let onAbort: (() => void) | undefined;
      try {
        await Promise.race([ready, new Promise<never>((_, reject) => {
          onAbort = () => reject(new Error("Orbis conditions weren’t ready."));
          if (wait.aborted) onAbort();
          else wait.addEventListener("abort", onAbort, { once: true });
        })]);
      } finally {
        conditionsReady = undefined;
        if (onAbort) wait.removeEventListener("abort", onAbort);
      }
      firstFrameTimer = window.setTimeout(() => end("Orbis didn’t deliver a video frame. Try again."), 90_000);
      // Start may produce a state event without a direct reply. Playback is
      // confirmed by the first frame, with command errors handled separately.
      const start = unwrapOrbisMessage(await client!.sendCommand("start", {}));
      if (start?.type === "command_error") throw new Error(start.reason || "Orbis rejected the take.");
    } catch (error) {
      end(error instanceof Error ? error.message : "Couldn’t start the take.");
    }
  })();

  return {
    close,
    async apply(prompt: string) {
      if (editing) throw new Error("Wait for the current Orbis action to finish.");
      editing = true;
      try {
        await command("set_prompt", orbisPromptPayload(prompt, "steering"), "prompt_accepted");
      } finally {
        editing = false;
      }
    },
  };
}
