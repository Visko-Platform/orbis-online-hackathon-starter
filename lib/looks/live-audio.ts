import type { LiveServerMessage, Session } from "@google/genai";
import { responseError } from "./requests";

export function openLiveAudio(report: { transcript: (text: string) => void; status: (text: string) => void; error: (text: string) => void }) {
  const context = new AudioContext();
  const abort = new AbortController();
  const players = new Set<AudioBufferSourceNode>();
  let session: Session | undefined;
  let mic: MediaStream | undefined;
  let worklet: AudioWorkletNode | undefined;
  let source: MediaStreamAudioSourceNode | undefined;
  let mode: "idle" | "listening" | "processing" | "speaking" = "idle";
  let transcript = "";
  let transcriptDelivered = false;
  let queuedUntil = 0;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let turnDone = false;

  function releaseMic() {
    mic?.getTracks().forEach((track) => track.stop());
    mic = undefined;
    source?.disconnect();
    source = undefined;
    if (worklet) { worklet.port.onmessage = null; worklet.disconnect(); }
    worklet = undefined;
  }

  function disconnected() { fail("Gemini Live disconnected. You can continue by typing."); }
  window.addEventListener("offline", disconnected);

  function close() {
    if (abort.signal.aborted) return;
    abort.abort();
    window.removeEventListener("offline", disconnected);
    clearTimeout(deadline);
    releaseMic();
    players.forEach((player) => player.stop());
    players.clear();
    session?.close();
    void context.close().catch(() => {});
  }

  function fail(message: string) {
    if (abort.signal.aborted) return;
    close();
    report.error(message);
  }

  function complete() {
    clearTimeout(deadline);
    releaseMic();
    mode = "idle";
    report.status("");
    deliverTranscript();
    transcript = "";
    transcriptDelivered = false;
  }

  function deliverTranscript() {
    const text = transcript.trim();
    if (!text || transcriptDelivered) return;
    transcriptDelivered = true;
    report.transcript(text);
  }

  function play(data: string, mimeType: string) {
    const bytes = Uint8Array.from(atob(data), (value) => value.charCodeAt(0));
    const view = new DataView(bytes.buffer);
    const count = Math.floor(view.byteLength / 2);
    if (!count) return;
    const rate = Number(mimeType.match(/rate=(\d+)/)?.[1] ?? 24000);
    const buffer = context.createBuffer(1, count, rate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < count; i++) channel[i] = view.getInt16(i * 2, true) / 32768;
    const player = context.createBufferSource();
    player.buffer = buffer;
    player.connect(context.destination);
    player.onended = () => {
      players.delete(player);
      if (turnDone && !players.size && mode === "speaking") complete();
    };
    players.add(player);
    const start = Math.max(context.currentTime, queuedUntil);
    player.start(start);
    queuedUntil = start + buffer.duration;
  }

  function onMessage(message: LiveServerMessage) {
    if (abort.signal.aborted) return;
    const content = message.serverContent;
    if (!content) return;
    if (mode === "listening" || mode === "processing") {
      const input = content.inputTranscription;
      transcript += input?.text || "";
      if (input?.finished && transcript.trim() && !transcriptDelivered) {
        releaseMic();
        clearTimeout(deadline);
        mode = "processing";
        report.status("Transcribing…");
        deadline = setTimeout(complete, 5_000);
        deliverTranscript();
      }
      if (content.turnComplete) {
        releaseMic();
        clearTimeout(deadline);
        mode = "processing";
        // Transcription can arrive independently of the end-of-turn event.
        if (transcriptDelivered) complete();
        else deadline = setTimeout(complete, 350);
      }
    } else if (mode === "speaking") {
      for (const part of content.modelTurn?.parts ?? []) {
        const audio = part.inlineData;
        if (audio?.data && audio.mimeType?.startsWith("audio/pcm")) play(audio.data, audio.mimeType);
      }
      if (content.turnComplete) {
        turnDone = true;
        if (!players.size) complete();
      }
    }
  }

  const resumed = context.resume();
  const connection = Promise.all([
    import("@google/genai"),
    fetch("/api/looks/live-token", { method: "POST", signal: abort.signal }).then(async (response) => {
      if (!response.ok) throw await responseError(response);
      return response.json() as Promise<{ token: string; model: string }>;
    }),
    resumed,
  ]).then(async ([{ GoogleGenAI, Modality }, auth]) => {
    abort.signal.throwIfAborted();
    const ai = new GoogleGenAI({ apiKey: auth.token, apiVersion: "v1alpha" });
    const connected = await ai.live.connect({ model: auth.model, config: {
      responseModalities: [Modality.AUDIO], inputAudioTranscription: {},
      systemInstruction: "Read aloud the supplied question verbatim when asked. For microphone input, acknowledge briefly. Do not ask questions of your own.",
    }, callbacks: { onmessage: onMessage, onerror: disconnected, onclose: disconnected } });
    if (abort.signal.aborted) { connected.close(); abort.signal.throwIfAborted(); }
    session = connected;
    return connected;
  });
  void connection.catch((error) => fail(error instanceof Error ? error.message : "Couldn’t connect to Gemini Live."));

  function stop() {
    if (mode !== "listening") return;
    mode = "processing";
    releaseMic();
    try { session?.sendRealtimeInput({ audioStreamEnd: true }); }
    catch { disconnected(); return; }
    report.status("Transcribing…");
    clearTimeout(deadline);
    deadline = setTimeout(() => transcript.trim() ? complete() : fail("No speech was received. Try again or type your reply."), 5000);
  }

  return {
    close,
    stop,
    async listen() {
      if (mode !== "idle") return;
      mode = "listening";
      report.status("Starting mic…");
      deadline = setTimeout(() => fail("Couldn’t start Gemini Live. You can continue by typing."), 15_000);
      try {
        const [connected, stream] = await Promise.all([connection, navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        }).then((opened) => {
          if (abort.signal.aborted || mode !== "listening") opened.getTracks().forEach((track) => track.stop());
          else mic = opened;
          return opened;
        }), context.audioWorklet.addModule("/looks-mic.js")]);
        if (abort.signal.aborted || mode !== "listening") return;
        worklet = new AudioWorkletNode(context, "looks-mic", { numberOfOutputs: 0 });
        source = context.createMediaStreamSource(stream);
        worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
          if (mode !== "listening" || abort.signal.aborted) return;
          const data = btoa(String.fromCharCode(...new Uint8Array(event.data)));
          try { connected.sendRealtimeInput({ audio: { data, mimeType: "audio/pcm;rate=16000" } }); }
          catch { disconnected(); }
        };
        source.connect(worklet);
        report.status("Listening…");
        clearTimeout(deadline);
        deadline = setTimeout(stop, 15_000);
      } catch {
        fail("Microphone or Gemini Live unavailable. You can continue by typing.");
      }
    },
    async speak(text: string) {
      if (mode !== "idle") return;
      mode = "speaking";
      turnDone = false;
      report.status("Speaking…");
      deadline = setTimeout(() => fail("Couldn’t play the question. You can read it in the composer."), 15_000);
      try {
        const connected = await connection;
        connected.sendRealtimeInput({ text: `Read this question aloud, verbatim: ${JSON.stringify(text)}` });
      } catch { fail("Couldn’t play the question. You can read it in the composer."); }
    },
  };
}
