// VESTA, the voice copilot: a Gemini Live session that only talks (no mic).
// The page sends it ship updates ("[SHIP] Arrived at …"); it answers out
// loud, and its words stream back as captions.
//
// Create it inside a click handler: audio playback needs a user gesture.

import { GoogleGenAI, type LiveServerMessage, Modality, type Session } from "@google/genai";

import { COPILOT_MODEL, COPILOT_SESSION_CONFIG } from "@/lib/copilot-config";

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
  /** A spoken order: run it and return a short result for VESTA. */
  onTool?: (name: string, args: Record<string, unknown>) => string | Promise<string>;
  /** What the captain said (live transcription while they talk). */
  onHeard?: (text: string) => void;
};

// Microphone tap: posts raw mono samples from the audio thread.
const TAP_WORKLET = `
class VestaTap extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) this.port.postMessage(channel.slice(0));
    return true;
  }
}
registerProcessor("vesta-tap", VestaTap);`;

export class Copilot {
  private session: Session | null = null;
  private context: AudioContext;
  private output: GainNode;
  private analyser: AnalyserNode;
  private levelBuffer = new Float32Array(512);
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
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 512;
    this.output.connect(this.analyser);
  }

  private resumeHandle: string | null = null;
  private reconnecting = false;
  private failures = 0;

  async connect() {
    void this.context.resume();
    const response = await fetch("/api/live-token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ handle: this.resumeHandle ?? undefined }),
    });
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
    const session = await ai.live.connect({
      model: COPILOT_MODEL,
      // Must match the config the token is locked to (same shared object).
      config: COPILOT_SESSION_CONFIG,
      callbacks: {
        onmessage: (message) => this.handle(message),
        onerror: () => this.events.onError("Copilot connection error"),
        onclose: () => {
          // Only the live socket counts; an old one closing after a swap doesn't.
          if (this.closed || this.session !== session) return;
          void this.reconnect();
        },
      },
    });
    this.session = session;
    this.failures = 0;
    this.flushIfQuiet();
  }

  /** Google closed the socket (time limit, goAway, blip): come straight back,
   * resuming the same conversation when we have a handle. Messages sent
   * meanwhile wait in the queue. */
  private async reconnect() {
    if (this.closed || this.reconnecting) return;
    this.reconnecting = true;
    const old = this.session;
    this.session = null;
    this.replying = false;
    old?.close();
    while (!this.closed && this.failures < 4) {
      try {
        await this.connect();
        break;
      } catch {
        this.failures += 1;
        // A stale handle can fail to resume: retry fresh after the first miss.
        if (this.failures >= 2) this.resumeHandle = null;
        await new Promise((resolve) => window.setTimeout(resolve, 1_000 * this.failures));
      }
    }
    this.reconnecting = false;
    if (!this.session && !this.closed) this.events.onError("Copilot went offline");
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

  /** How loud she is right now, 0–1 (RMS of her output): drives the orb. */
  level() {
    this.analyser.getFloatTimeDomainData(this.levelBuffer);
    let sum = 0;
    for (const sample of this.levelBuffer) sum += sample * sample;
    return Math.min(1, Math.sqrt(sum / this.levelBuffer.length) * 4);
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

  // ---- Push-to-talk. While the captain holds the talk key, the mic streams
  // 16 kHz PCM; activityStart/End mark the turn (no automatic detection, so
  // ship audio and VESTA's own voice can never trigger one).
  private mic: { context: AudioContext; stream: MediaStream; node: AudioWorkletNode } | null = null;
  private talking = false;
  private heard = "";
  private pendingSamples: number[] = [];

  async startTalking() {
    if (!this.session || this.talking) return;
    this.talking = true;
    this.heard = "";
    this.pending = null;
    this.stopPlayback(); // barge in: the captain is talking
    this.session.sendRealtimeInput({ activityStart: {} });
    try {
      if (!this.mic) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        const context = new AudioContext({ sampleRate: 16_000 });
        const url = URL.createObjectURL(new Blob([TAP_WORKLET], { type: "application/javascript" }));
        await context.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);
        const node = new AudioWorkletNode(context, "vesta-tap");
        node.port.onmessage = (event: MessageEvent<Float32Array>) => this.onSamples(event.data);
        context.createMediaStreamSource(stream).connect(node);
        this.mic = { context, stream, node };
      }
      void this.mic.context.resume();
    } catch {
      this.talking = false;
      this.session?.sendRealtimeInput({ activityEnd: {} });
      this.events.onError("Microphone unavailable");
    }
  }

  stopTalking() {
    if (!this.talking) return;
    this.talking = false;
    this.flushSamples();
    this.replying = true; // she'll answer; hold ship updates until she has
    this.session?.sendRealtimeInput({ activityEnd: {} });
  }

  private onSamples(samples: Float32Array) {
    if (!this.talking) return;
    for (const sample of samples) this.pendingSamples.push(sample);
    if (this.pendingSamples.length >= 1_600) this.flushSamples(); // ~100 ms
  }

  private flushSamples() {
    if (!this.pendingSamples.length || !this.session) return;
    const pcm = new Int16Array(this.pendingSamples.length);
    this.pendingSamples.forEach((sample, index) => {
      pcm[index] = Math.max(-1, Math.min(1, sample)) * 0x7fff;
    });
    this.pendingSamples = [];
    let binary = "";
    const bytes = new Uint8Array(pcm.buffer);
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    this.session.sendRealtimeInput({ audio: { data: btoa(binary), mimeType: "audio/pcm;rate=16000" } });
  }

  private async runTools(calls: { id?: string; name?: string; args?: Record<string, unknown> }[]) {
    const responses = [];
    for (const call of calls) {
      let result = "Done.";
      try {
        result = (await this.events.onTool?.(call.name ?? "", call.args ?? {})) ?? "Not available.";
      } catch (caught) {
        result = `Failed: ${caught instanceof Error ? caught.message : String(caught)}`;
      }
      responses.push({ id: call.id, name: call.name, response: { result } });
    }
    this.session?.sendToolResponse({ functionResponses: responses });
  }

  close() {
    this.closed = true;
    this.mic?.stream.getTracks().forEach((track) => track.stop());
    void this.mic?.context.close();
    if (this.replyTimer) window.clearTimeout(this.replyTimer);
    this.session?.close();
    this.session = null;
    this.stopPlayback();
    void this.context.close();
  }

  private handle(message: LiveServerMessage) {
    const update = message.sessionResumptionUpdate;
    if (update?.resumable && update.newHandle) this.resumeHandle = update.newHandle;
    // The server warns before it drops us; swap sockets after her current
    // line so she isn't cut off mid-sentence.
    if (message.goAway) {
      const doomed = this.session;
      const swap = () => {
        if (this.closed || this.session !== doomed) return;
        if (this.replying || this.sources.size > 0) window.setTimeout(swap, 300);
        else void this.reconnect();
      };
      swap();
    }
    if (message.toolCall?.functionCalls?.length) void this.runTools(message.toolCall.functionCalls);
    const content = message.serverContent;
    if (!content) return;

    const heard = content.inputTranscription?.text;
    if (heard) {
      this.heard += heard;
      this.events.onHeard?.(this.heard.trim());
    }

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
