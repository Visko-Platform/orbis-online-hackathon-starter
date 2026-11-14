import type { LiveServerMessage, Session } from "@google/genai";
import { pcmWave } from "./pinch-pcm";
import { responseError, transcribeAudio } from "./requests";

const microphone = { audio: { echoCancellation: true, noiseSuppression: true } };
const clipLimit = 750;
const chunksPerPacket = 5;

export function preparePinchAudio() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone access is unavailable in this browser.");
  const context = new AudioContext();
  const lifetime = new AbortController();
  const ready = Promise.all([
    context.resume(), context.audioWorklet.addModule("/looks-mic.js"), import("@google/genai"),
  ]);
  void ready.catch(() => {});
  const permission = navigator.mediaDevices.getUserMedia(microphone).then((stream) => {
    stream.getTracks().forEach((track) => track.stop());
  });

  function connect(message: (message: LiveServerMessage) => void, failed: () => void, signal: AbortSignal) {
    return Promise.all([ready, fetch("/api/looks/live-token?mode=transcribe", {
      method: "POST", signal,
    }).then(async (response) => {
      if (!response.ok) throw await responseError(response);
      return response.json() as Promise<{ token: string; model: string }>;
    })]).then(async ([[, , { GoogleGenAI, Modality }], auth]) => {
      signal.throwIfAborted();
      const ai = new GoogleGenAI({ apiKey: auth.token, apiVersion: "v1alpha" });
      const session = await ai.live.connect({
        model: auth.model,
        config: {
          responseModalities: [Modality.TEXT], inputAudioTranscription: {},
          realtimeInputConfig: { automaticActivityDetection: { disabled: true } },
        },
        callbacks: { onmessage: message, onerror: failed, onclose: failed },
      });
      if (signal.aborted) { session.close(); signal.throwIfAborted(); }
      return session;
    });
  }

  let handlers: { message: (message: LiveServerMessage) => void; failed: () => void } | undefined;
  let expires = Date.now() + 45_000;
  const warm = connect((message) => handlers?.message(message), () => {
    expires = 0;
    handlers?.failed();
  }, lifetime.signal);
  void warm.catch(() => { expires = 0; });

  return {
    ready: Promise.all([ready, permission]),
    close() {
      lifetime.abort();
      void warm.then((session) => session.close()).catch(() => {});
      void context.close().catch(() => {});
    },
    begin(caption: (text: string) => void, status: (text: string) => void, complete: (text: string, error?: string) => void) {
      const job = new AbortController();
      const signal = AbortSignal.any([job.signal, lifetime.signal]);
      let session: Session | undefined;
      let mic: MediaStream | undefined;
      let source: MediaStreamAudioSourceNode | undefined;
      let sink: GainNode | undefined;
      let worklet: AudioWorkletNode | undefined;
      let released = false;
      let liveFailed = false;
      let fallbackStarted = false;
      let sent = 0;
      let final = "";
      let interim = "";
      let timer: ReturnType<typeof setTimeout>;
      const chunks: ArrayBuffer[] = [];
      status("Starting microphone…");

      function stopMic() {
        mic?.getTracks().forEach((track) => track.stop());
        source?.disconnect();
        if (worklet) { worklet.port.onmessage = null; worklet.disconnect(); }
        sink?.disconnect();
        mic = source = worklet = sink = undefined;
      }

      function settle(text?: string, error?: string) {
        if (job.signal.aborted) return;
        job.abort();
        signal.removeEventListener("abort", cancel);
        clearTimeout(timer);
        stopMic();
        session?.close();
        chunks.length = 0;
        if (text !== undefined && !lifetime.signal.aborted) complete(text, error);
      }

      function cancel() { settle(); }

      function failed() {
        liveFailed = true;
        if (released) void finalize();
      }

      async function finalize() {
        if (signal.aborted || fallbackStarted) return;
        if (final) { settle(final); return; }
        if (!chunks.length) {
          settle("", "No microphone audio was captured. Check the selected input and try again.");
          return;
        }
        fallbackStarted = true;
        try {
          const text = await transcribeAudio(pcmWave(chunks), AbortSignal.any([signal, AbortSignal.timeout(20_000)]));
          settle(text || interim, text || interim ? undefined : "No speech detected. Speak while holding the pinch.");
        } catch {
          settle(interim, interim ? undefined : "Transcription failed. Try another pinch.");
        }
      }

      function message({ serverContent }: LiveServerMessage) {
        if (signal.aborted || !serverContent) return;
        const result = serverContent.inputTranscription?.text?.trim();
        if (result) {
          final = [final, result].filter(Boolean).join(" ");
          interim = "";
        }
        interim = serverContent.interimInputTranscription?.text ?? interim;
        caption([final, interim].filter(Boolean).join(" "));
        if (released && result) settle(final);
      }

      function flush(force = false) {
        if (!session || liveFailed) return;
        while (chunks.length - sent >= chunksPerPacket || (force && sent < chunks.length)) {
          const packet = chunks.slice(sent, sent + chunksPerPacket);
          const bytes = packet.flatMap((chunk) => Array.from(new Uint8Array(chunk)));
          session.sendRealtimeInput({ audio: {
            data: btoa(String.fromCharCode(...bytes)), mimeType: "audio/pcm;rate=16000",
          } });
          sent += packet.length;
        }
      }

      signal.addEventListener("abort", cancel, { once: true });
      const useWarm = !handlers && Date.now() < expires;
      if (useWarm) handlers = { message, failed };
      else if (!handlers) void warm.then((connection) => connection.close()).catch(() => {});
      void (useWarm ? warm : connect(message, failed, signal)).then((connection) => {
        if (signal.aborted) { connection.close(); return; }
        session = connection;
        session.sendRealtimeInput({ activityStart: {} });
        flush(released);
        if (released) session.sendRealtimeInput({ activityEnd: {} });
      }).catch(failed);

      void Promise.all([ready, permission.then(async () => {
        if (released || signal.aborted) return;
        const stream = await navigator.mediaDevices.getUserMedia(microphone);
        if (released || signal.aborted) stream.getTracks().forEach((track) => track.stop());
        else mic = stream;
      })]).then(() => {
        if (!mic || released || signal.aborted) return;
        source = context.createMediaStreamSource(mic);
        worklet = new AudioWorkletNode(context, "looks-mic");
        sink = context.createGain();
        sink.gain.value = 0;
        worklet.connect(sink).connect(context.destination);
        worklet.port.onmessage = ({ data }: MessageEvent<ArrayBuffer>) => {
          if (released || signal.aborted || chunks.length >= clipLimit) return;
          if (!chunks.length) status("Listening…");
          chunks.push(data);
          try { flush(); } catch { failed(); }
        };
        source.connect(worklet);
      }).catch((error: unknown) => {
        settle("", error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access denied. Check your browser settings."
          : "Can’t start the microphone. Check your selected input.");
      });

      function end() {
        if (released || signal.aborted) return;
        released = true;
        stopMic();
        clearTimeout(timer);
        status("Transcribing…");
        if (!chunks.length || liveFailed) { void finalize(); return; }
        try {
          flush(true);
          session?.sendRealtimeInput({ activityEnd: {} });
        } catch { failed(); return; }
        timer = setTimeout(() => { void finalize(); }, 3000);
      }

      timer = setTimeout(end, 15_000);
      return { end, cancel };
    },
  };
}
