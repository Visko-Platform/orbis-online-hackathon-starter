"use client";

// Push-to-talk recorder. Browsers record webm/opus, which Gemini does not take
// reliably, so the clip is decoded and re-encoded as 16 kHz mono WAV
// (about 32 KB per second).

const TARGET_RATE = 16_000;

export type Recorder = { stop: () => Promise<Blob | null>; cancel: () => void };

export async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const startedAt = performance.now();
  recorder.start();

  const release = () => stream.getTracks().forEach((track) => track.stop());

  return {
    cancel: () => {
      if (recorder.state !== "inactive") recorder.stop();
      release();
    },
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = async () => {
          release();
          // Ignore accidental taps.
          if (performance.now() - startedAt < 400 || !chunks.length) {
            resolve(null);
            return;
          }
          try {
            resolve(await toWav(new Blob(chunks, { type: recorder.mimeType })));
          } catch {
            resolve(null);
          }
        };
        recorder.stop();
      }),
  };
}

async function toWav(blob: Blob) {
  const context = new AudioContext();
  const decoded = await context.decodeAudioData(await blob.arrayBuffer());
  await context.close();
  const frames = Math.ceil(decoded.duration * TARGET_RATE);
  const offline = new OfflineAudioContext(1, frames, TARGET_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  const samples = rendered.getChannelData(0);

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, text: string) =>
    [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  });
  return new Blob([buffer], { type: "audio/wav" });
}

// Fetch every line's voice in parallel, then play them in order.
export function prefetchVoices(
  lines: { text: string; speaker: string; delivery?: string }[],
) {
  return lines.map((line) =>
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(line),
    })
      .then((response) => (response.ok ? response.blob() : null))
      .catch(() => null),
  );
}

export function playBlob(blob: Blob, register: (audio: HTMLAudioElement) => void) {
  return new Promise<void>((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    register(audio);
    const done = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.onpause = done;
    audio.play().catch(done);
  });
}

// Last resort when every TTS model is out of quota: the browser's own voices,
// cast per character so the king, the queen and Lysa don't share one voice.
const BROWSER_CASTING: Record<string, { names: string[]; pitch: number; rate: number }> = {
  king: { names: ["Daniel", "Arthur", "Google UK English Male", "Alex"], pitch: 0.85, rate: 1 },
  slaver: { names: ["Fred", "Ralph", "Google UK English Male", "Alex"], pitch: 0.6, rate: 1.1 },
  physician: { names: ["Arthur", "Daniel", "Alex"], pitch: 0.75, rate: 0.9 },
  guard: { names: ["Alex", "Aaron", "Google US English"], pitch: 0.9, rate: 1.1 },
  queen: { names: ["Kate", "Fiona", "Google UK English Female", "Samantha"], pitch: 1, rate: 0.95 },
  lysa: { names: ["Samantha", "Ava", "Tessa", "Google US English"], pitch: 1.2, rate: 1 },
  narrator: { names: ["Moira", "Karen", "Fiona", "Samantha"], pitch: 0.9, rate: 0.9 },
};

function pickVoice(names: string[]) {
  const voices = speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en"));
  for (const name of names) {
    const match = voices.find((voice) => voice.name.startsWith(name));
    if (match) return match;
  }
  return voices[0];
}

export function speakWithBrowser(
  text: string,
  speaker: string,
  register: (stop: () => void) => void,
) {
  return new Promise<void>((resolve) => {
    if (typeof speechSynthesis === "undefined") {
      resolve();
      return;
    }
    const casting = BROWSER_CASTING[speaker] ?? BROWSER_CASTING.narrator;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = /[\u4e00-\u9fff]/.test(text) ? undefined : pickVoice(casting.names);
    if (voice) utterance.voice = voice;
    utterance.pitch = casting.pitch;
    utterance.rate = casting.rate;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    register(() => {
      speechSynthesis.cancel();
      resolve();
    });
    speechSynthesis.speak(utterance);
  });
}

// Live captions while the player holds the mic (Chrome's built-in speech
// recognition). Shows their words as they talk, and lets the director work
// from text instead of audio, which is faster. Where it's unavailable this
// returns null and the recorded audio is used instead.
type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: RecognitionResultList }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type LiveCaption = { stop: () => Promise<string> };

export function startLiveCaption(onText: (text: string) => void, lang = "en-US"): LiveCaption | null {
  const Ctor = (window as unknown as { webkitSpeechRecognition?: new () => Recognition; SpeechRecognition?: new () => Recognition })
    .SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = true;
  let text = "";
  let ended = false;
  let finish: (() => void) | null = null;
  recognition.onresult = (event) => {
    text = Array.from(event.results)
      .map((result) => result[0]?.transcript ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    onText(text);
  };
  recognition.onend = () => {
    ended = true;
    finish?.();
  };
  recognition.onerror = () => {
    ended = true;
    finish?.();
  };
  try {
    recognition.start();
  } catch {
    return null;
  }
  return {
    stop: () =>
      new Promise((resolve) => {
        if (ended) {
          resolve(text);
          return;
        }
        // Give the recognizer a moment to finalize the last words.
        const timer = setTimeout(() => resolve(text), 700);
        finish = () => {
          clearTimeout(timer);
          resolve(text);
        };
        recognition.stop();
      }),
  };
}
