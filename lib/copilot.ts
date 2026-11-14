// VESTA, the voice copilot: a Gemini Live session that only talks (no mic).
// The page sends it ship updates ("[SHIP] Arrived at …"); it answers out
// loud, and its words stream back as captions.
//
// Create it inside a click handler: audio playback needs a user gesture.

import { GoogleGenAI, type LiveServerMessage, Modality, type Session } from "@google/genai";

import { COPILOT_INSTRUCTION, COPILOT_MODEL, COPILOT_VOICE } from "@/lib/copilot-config";

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
  }

  /** Tell VESTA what just happened; she answers out loud. */
  update(text: string) {
    if (!this.session) return;
    this.session.sendClientContent({
      turns: [{ role: "user", parts: [{ text: `[SHIP] ${text}` }] }],
      turnComplete: true,
    });
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
    this.session?.close();
    this.session = null;
    this.stopPlayback();
    void this.context.close();
  }

  private handle(message: LiveServerMessage) {
    const content = message.serverContent;
    if (!content) return;

    if (content.interrupted) {
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
    if (content.turnComplete) this.caption = "";
  }

  /** Queue a chunk of 16-bit PCM so chunks play back to back. */
  private play(base64: string, mimeType: string) {
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
    this.sources.add(source);
    this.setSpeaking(true);
    source.onended = () => {
      this.sources.delete(source);
      if (this.sources.size === 0) this.setSpeaking(false);
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
