import type { LiveServerMessage, Session } from "@google/genai";
import { pcmWave } from "./pinch-pcm";
import { responseError, transcribeAudio } from "./requests";

export function openLiveAudio(report: { transcript: (text: string) => void; status: (text: string) => void; error: (text: string) => void }) {
  const context = new AudioContext();
  const abort = new AbortController();
  const players = new Set<AudioBufferSourceNode>();
  let session: Session | undefined;
  let mic: MediaStream | undefined;
  let worklet: AudioWorkletNode | undefined;
  let source: MediaStreamAudioSourceNode | undefined;
  let sink: GainNode | undefined;
  let mode: "idle" | "listening" | "processing" | "speaking" = "idle";
  let transcript = "";
  let finalReply = "";
  let liveFailed = false;
  let fallingBack = false;
  let sent = 0;
  const chunks: ArrayBuffer[] = [];
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
    sink?.disconnect();
    sink = undefined;
  }

  function disconnected() {
    if (abort.signal.aborted) return;
    liveFailed = true;
    if (mode === "processing") {
      if (finalReply) complete(finalReply);
      else void fallback();
    }
    if (mode === "speaking") fail("Gemini Live disconnected. You can read the question in the composer.");
  }
  window.addEventListener("offline", disconnected);

  function close() {
    if (abort.signal.aborted) return;
    abort.abort();
    window.removeEventListener("offline", disconnected);
    clearTimeout(deadline);
    releaseMic();
    chunks.length = 0;
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

  function complete(text = "") {
    clearTimeout(deadline);
    releaseMic();
    mode = "idle";
    transcript = "";
    finalReply = "";
    chunks.length = 0;
    sent = 0;
    fallingBack = false;
    if (liveFailed) close();
    report.status("");
    if (text) report.transcript(text);
  }

  async function fallback() {
    if (fallingBack || abort.signal.aborted) return;
    fallingBack = true;
    clearTimeout(deadline);
    let text = "";
    let error = "No speech detected. Try again or type your reply.";
    try {
      text = await transcribeAudio(pcmWave(chunks), abort.signal);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Couldn’t transcribe your reply.";
    }
    if (abort.signal.aborted) return;
    if (!turnDone) liveFailed = true;
    const reply = text || transcript.trim();
    if (reply) complete(reply);
    else fail(error);
  }

  function flush() {
    if (!session || liveFailed) return;
    try {
      while (sent < chunks.length) {
        const data = btoa(String.fromCharCode(...new Uint8Array(chunks[sent])));
        session.sendRealtimeInput({ audio: { data, mimeType: "audio/pcm;rate=16000" } });
        sent++;
      }
    } catch { disconnected(); }
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
      if (content.turnComplete) turnDone = true;
      if (finalReply) {
        if (turnDone) complete(finalReply);
        return;
      }
      const input = content.inputTranscription;
      transcript += input?.text || "";
      if (input?.finished && transcript.trim() && !liveFailed && !fallingBack) {
        finalReply = transcript.trim();
        if (turnDone) { complete(finalReply); return; }
        // Drain the reply turn before allowing the next question to start.
        mode = "processing";
        releaseMic();
        report.status("Transcribing…");
        clearTimeout(deadline);
        deadline = setTimeout(disconnected, 3000);
      } else if (content.turnComplete && mode === "listening" && sent) {
        // A model turn can end before its input transcript arrives.
        stop(false);
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
    fetch("/api/looks/live-token", {
      method: "POST", signal: AbortSignal.any([abort.signal, AbortSignal.timeout(12_000)]),
    }).then(async (response) => {
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
    if (mode === "listening") flush();
    return connected;
  });
  void connection.catch(disconnected);

  function stop(sendEnd = true) {
    if (mode !== "listening") return;
    mode = "processing";
    releaseMic();
    report.status("Transcribing…");
    clearTimeout(deadline);
    if (!chunks.length) { fail("No microphone audio was captured. Check your input and try again."); return; }
    if (liveFailed || !session) { void fallback(); return; }
    flush();
    if (liveFailed) return;
    try { if (sendEnd) session.sendRealtimeInput({ audioStreamEnd: true }); }
    catch { disconnected(); return; }
    deadline = setTimeout(() => { void fallback(); }, 4000);
  }

  return {
    get closed() { return abort.signal.aborted; },
    close,
    stop: () => stop(),
    async listen() {
      if (mode !== "idle") return;
      mode = "listening";
      turnDone = false;
      report.status("Starting mic…");
      deadline = setTimeout(() => fail("No microphone audio was captured. Check your input and try again."), 15_000);
      try {
        const [stream] = await Promise.all([navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        }).then((opened) => {
          if (abort.signal.aborted || mode !== "listening") opened.getTracks().forEach((track) => track.stop());
          else mic = opened;
          return opened;
        }), context.audioWorklet.addModule("/looks-mic.js"), resumed]);
        if (abort.signal.aborted || mode !== "listening") return;
        worklet = new AudioWorkletNode(context, "looks-mic");
        sink = context.createGain();
        sink.gain.value = 0;
        worklet.connect(sink).connect(context.destination);
        source = context.createMediaStreamSource(stream);
        worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
          if (mode !== "listening" || abort.signal.aborted) return;
          if (!chunks.length) {
            report.status("Listening…");
            clearTimeout(deadline);
            deadline = setTimeout(stop, 15_000);
          }
          chunks.push(event.data);
          flush();
        };
        source.connect(worklet);
      } catch {
        fail("Couldn’t start the microphone. Check your browser settings or type your reply.");
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
        if (abort.signal.aborted || liveFailed) throw new Error("Gemini Live disconnected.");
        connected.sendRealtimeInput({ text: `Read this question aloud, verbatim: ${JSON.stringify(text)}` });
      } catch { fail("Couldn’t play the question. You can read it in the composer."); }
    },
  };
}
