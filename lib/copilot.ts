// VESTA, the voice copilot: a Gemini Live session that only talks (no mic).
// The page sends it ship updates ("[SHIP] Arrived at …"); it answers out
// loud, and its words stream back as captions.
//
// Create it inside a click handler: audio playback needs a user gesture.

import { GoogleGenAI, type LiveServerMessage, Modality, type Session } from "@google/genai";

import { COPILOT_INSTRUCTION, COPILOT_MODEL, COPILOT_VOICE } from "@/lib/copilot-config";

/** How much a ship update matters when VESTA is already talking. */
export enum Priority {
  /** Colour: observations, route teasers. Dropped if something newer waits. */
  Low = 0,
  /** Launch, jumps, arrivals, drive-time warnings. */
  Normal = 1,
  /** Alerts and the mission finale: cut in immediately. */
  Urgent = 2,
}

type CopilotEvents = {
  onCaption: (text: string) => void;
  onSpeaking: (speaking: boolean) => void;
  onError: (message: string) => void;
};

export class Copilot {
  private session: Session | null = null;
  private context: AudioContext;
  private output: GainNode;
  private playhead = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private caption = "";
  private speaking = false;
  private closed = false;

  constructor(private events: CopilotEvents) {
    this.context = new AudioContext();
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __vesta?: Copilot }).__vesta = this;
    }
    this.output = this.context.createGain();
    this.output.gain.value = 1;
    this.output.connect(this.context.destination);
  }

  async connect() {
    void this.context.resume();
    const response = await fetch("/api/live-token", { method: "POST" });
    const result = (await response.json().catch(() => ({}))) as {
      token?: string;
      error?: string;
    };
    if (!response.ok || !result.token) {
      throw new Error(result.error || "Copilot token request failed");
    }

    const ai = new GoogleGenAI({
      apiKey: result.token,
      httpOptions: { apiVersion: "v1alpha" },
    });
    this.session = await ai.live.connect({
      model: COPILOT_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: COPILOT_VOICE } } },
        outputAudioTranscription: {},
        systemInstruction: COPILOT_INSTRUCTION,
      },
      callbacks: {
        onmessage: (message) => this.handle(message),
        onerror: () => this.events.onError("Copilot connection error"),
        onclose: () => {
          if (!this.closed) this.events.onError("Copilot went offline");
        },
      },
    });
    this.flushIfQuiet();
  }

  // ---- Speaking queue. Gemini sends her transcript faster than she speaks
  // it, so a new message mid-sentence would interrupt her and discard the
  // audio still queued: the subtitle shows, the voice doesn't. So she always
  // finishes her line first. While she talks, only the most important (then
  // newest) message waits; URGENT ones (alerts) cut in immediately.
  private replying = false;
  private replyTimer: number | null = null;
  private pending: { text: string; priority: Priority } | null = null;

  /** Tell VESTA what just happened; she answers out loud. */
  update(text: string, priority: Priority = Priority.Normal) {
    if (this.closed) return;
    // Not connected yet: hold the message; connect() sends it.
    const quiet = Boolean(this.session) && !this.replying && this.sources.size === 0;
    if (quiet || (priority === Priority.Urgent && this.session)) {
      this.pending = null;
      this.send(text);
    } else if (!this.pending || priority >= this.pending.priority) {
      this.pending = { text, priority };
    }
  }

  private send(text: string) {
    this.replying = true;
    if (this.replyTimer) window.clearTimeout(this.replyTimer);
    // Safety net: never stay "busy" if a turn-complete gets lost.
    this.replyTimer = window.setTimeout(() => {
      this.replying = false;
      this.flushIfQuiet();
    }, 15_000);
    this.session?.sendClientContent({
      turns: [{ role: "user", parts: [{ text: `[SHIP] ${text}` }] }],
      turnComplete: true,
    });
  }

  private flushIfQuiet() {
    if (!this.session || this.replying || this.sources.size > 0 || !this.pending) return;
    const next = this.pending;
    this.pending = null;
    this.send(next.text);
  }

  /** Show VESTA what's outside: one JPEG frame (base64) of the live view. */
  sendFrame(base64Jpeg: string) {
    this.session?.sendRealtimeInput({
      video: { data: base64Jpeg, mimeType: "image/jpeg" },
    });
  }

  private volume = 1;
  private muted = false;

  /** Her share of the World ⟷ VESTA mix (0–1). */
  setVolume(volume: number) {
    this.volume = volume;
    this.applyGain();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyGain();
  }

  private applyGain() {
    this.output.gain.setTargetAtTime(
      this.muted ? 0 : this.volume,
      this.context.currentTime,
      0.05,
    );
  }

  close() {
    this.closed = true;
    if (this.replyTimer) window.clearTimeout(this.replyTimer);
    this.session?.close();
    this.session = null;
    this.stopPlayback();
    void this.context.close();
  }

  private handle(message: LiveServerMessage) {
    const content = message.serverContent;
    if (!content) return;

    if (content.interrupted) {
      this.debug.interruptions += 1;
      this.stopPlayback();
      this.caption = "";
    }

    for (const part of content.modelTurn?.parts ?? []) {
      const data = part.inlineData?.data;
      if (data) this.play(data, part.inlineData?.mimeType ?? "");
    }

    const words = content.outputTranscription?.text;
    if (words) {
      this.caption += words;
      this.events.onCaption(this.caption.trim());
    }
    if (content.turnComplete) {
      this.caption = "";
      this.replying = false;
      if (this.replyTimer) window.clearTimeout(this.replyTimer);
      this.flushIfQuiet();
    }
  }

  /** Queue a chunk of 16-bit PCM so chunks play back to back. */
  /** Dev diagnostics: what VESTA's audio pipeline is actually doing. */
  readonly debug = { chunks: 0, seconds: 0, interruptions: 0, mimeTypes: new Set<string>(), state: () => this.context.state, gain: () => this.output.gain.value };

  private play(base64: string, mimeType: string) {
    this.debug.chunks += 1;
    this.debug.mimeTypes.add(mimeType);
    const rate = Number(/rate=(\d+)/.exec(mimeType)?.[1] ?? 24_000);
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const samples = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
    const buffer = this.context.createBuffer(1, samples.length, rate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) channel[i] = samples[i] / 32_768;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.output);
    const start = Math.max(this.context.currentTime + 0.03, this.playhead);
    source.start(start);
    this.playhead = start + buffer.duration;
    this.debug.seconds += buffer.duration;
    this.sources.add(source);
    this.setSpeaking(true);
    source.onended = () => {
      this.sources.delete(source);
      if (this.sources.size === 0) {
        this.setSpeaking(false);
        this.flushIfQuiet();
      }
    };
  }

  private stopPlayback() {
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    }
    this.sources.clear();
    this.playhead = 0;
    this.setSpeaking(false);
  }

  private setSpeaking(speaking: boolean) {
    if (speaking === this.speaking) return;
    this.speaking = speaking;
    this.events.onSpeaking(speaking);
  }
}
