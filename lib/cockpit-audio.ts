// Cockpit sound effects, synthesized with Web Audio (no audio files).
//   - engine: a steady low hum (two detuned oscillators + filtered rumble)
//   - teleport(): quantum charge-up, shimmer and sweep for a jump
//   - arrive(): a deep "thoom" with a sparkle tail on arrival
// Orbis supplies the world's own sound; these sit underneath it.
// Create inside a click handler: browsers only allow audio after a gesture.

export class CockpitAudio {
  private context: AudioContext;
  private master: GainNode;
  private engineGain: GainNode;
  private engineFilter: BiquadFilterNode;
  private oscillators: OscillatorNode[] = [];
  /** Engine oscillator base pitches, and the throttle's pitch multiplier. */
  private basePitch: number[] = [];
  private pitch = 1;
  private cutoff = 220;
  private noise: AudioBufferSourceNode;

  constructor() {
    this.context = new AudioContext();
    const context = this.context;
    this.master = context.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(context.destination);

    // ---- Engine hum.
    this.engineGain = context.createGain();
    this.engineGain.gain.value = 0;
    this.engineFilter = context.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.value = 220;
    this.engineFilter.Q.value = 0.8;
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.master);

    for (const [type, frequency, level] of [
      ["sawtooth", 46, 0.22],
      ["sawtooth", 46.7, 0.22],
      ["triangle", 92.4, 0.12],
    ] as const) {
      const osc = context.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      const gain = context.createGain();
      gain.gain.value = level;
      osc.connect(gain).connect(this.engineFilter);
      osc.start();
      this.oscillators.push(osc);
      this.basePitch.push(frequency);
    }

    // Slow wobble on the filter so the hum breathes.
    const lfo = context.createOscillator();
    lfo.frequency.value = 0.18;
    const lfoDepth = context.createGain();
    lfoDepth.gain.value = 40;
    lfo.connect(lfoDepth).connect(this.engineFilter.frequency);
    lfo.start();
    this.oscillators.push(lfo);

    // Brown-noise rumble.
    this.noise = context.createBufferSource();
    this.noise.buffer = this.brownNoise(4);
    this.noise.loop = true;
    const rumble = context.createBiquadFilter();
    rumble.type = "lowpass";
    rumble.frequency.value = 140;
    const rumbleGain = context.createGain();
    rumbleGain.gain.value = 0.55;
    this.noise.connect(rumble).connect(rumbleGain).connect(this.engineFilter);
    this.noise.start();
  }

  /** Fade the engine in (call after the click that created this). */
  start() {
    void this.context.resume();
    const now = this.context.currentTime;
    this.engineGain.gain.cancelScheduledValues(now);
    this.engineGain.gain.setTargetAtTime(0.16, now, 0.8);
  }

  /** Throttle 0–3 (reverse, drift, cruise, boost): engine pitch and brightness. */
  setThrottle(level: number) {
    const now = this.context.currentTime;
    this.pitch = [0.9, 0.8, 1, 1.4][level] ?? 1;
    this.cutoff = [240, 170, 220, 420][level] ?? 220;
    this.engineFilter.frequency.setTargetAtTime(this.cutoff, now, 0.6);
    this.oscillators.slice(0, 3).forEach((osc, index) => {
      osc.frequency.setTargetAtTime(this.basePitch[index] * this.pitch, now, 0.6);
    });
  }

  setMuted(muted: boolean) {
    this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.context.currentTime, 0.05);
  }

  /** Quantum charge-up → shimmer → sweep. About 2.2 s. */
  teleport() {
    const context = this.context;
    const now = context.currentTime;

    // Engine strains while the jump charges, then settles.
    const filter = this.engineFilter.frequency;
    filter.cancelScheduledValues(now);
    filter.setValueAtTime(filter.value, now);
    filter.linearRampToValueAtTime(900, now + 1.2);
    filter.setTargetAtTime(this.cutoff, now + 1.4, 0.6);
    for (const [index, osc] of this.oscillators.slice(0, 3).entries()) {
      const base = this.basePitch[index] * this.pitch;
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.linearRampToValueAtTime(base * 1.8, now + 1.2);
      osc.frequency.setTargetAtTime(base, now + 1.4, 0.5);
    }

    // Rising charge: two sine chirps a fifth apart.
    for (const [from, to] of [
      [180, 1400],
      [270, 2100],
    ]) {
      const osc = context.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(from, now);
      osc.frequency.exponentialRampToValueAtTime(to, now + 1.3);
      const gain = this.envelope(now, 0.0001, 0.07, 1.25, 0.25);
      osc.connect(gain).connect(this.master);
      osc.start(now);
      osc.stop(now + 1.6);
    }

    // Shimmer: a cloud of quick bell-like pings climbing in pitch.
    for (let i = 0; i < 26; i += 1) {
      const at = now + 0.15 + (i / 26) * 1.15 + Math.random() * 0.05;
      const pitch = 1200 + (i / 26) * 2600 + Math.random() * 500;
      this.ping(at, pitch, 0.045, 0.25);
    }

    // The sweep: filtered noise rushing past at the moment of the jump.
    const sweep = context.createBufferSource();
    sweep.buffer = this.whiteNoise(1.4);
    const band = context.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.2;
    band.frequency.setValueAtTime(400, now + 1.0);
    band.frequency.exponentialRampToValueAtTime(5000, now + 1.45);
    band.frequency.exponentialRampToValueAtTime(300, now + 2.2);
    const sweepGain = this.envelope(now + 1.0, 0.0001, 0.35, 0.35, 0.8);
    sweep.connect(band).connect(sweepGain).connect(this.master);
    sweep.start(now + 1.0);
  }

  /** Lower the engine while the copilot talks, so she's easy to hear. */
  duck(ducked: boolean) {
    this.engineGain.gain.setTargetAtTime(ducked ? 0.06 : 0.16, this.context.currentTime, 0.25);
  }

  /** Event alert: a soft two-tone chime, three times. */
  alert() {
    const now = this.context.currentTime;
    for (let i = 0; i < 3; i += 1) {
      for (const [offset, frequency] of [
        [0, 880],
        [0.16, 660],
      ]) {
        const at = now + i * 0.5 + offset;
        const osc = this.context.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = frequency;
        const gain = this.envelope(at, 0.0001, 0.12, 0.01, 0.22);
        osc.connect(gain).connect(this.master);
        osc.start(at);
        osc.stop(at + 0.3);
      }
    }
  }

  /** Detonation: a noise blast through a closing filter over a sub drop. */
  explode() {
    const context = this.context;
    const now = context.currentTime;

    const blast = context.createBufferSource();
    blast.buffer = this.whiteNoise(3);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(5000, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 2.6);
    const blastGain = this.envelope(now, 0.0001, 0.9, 0.02, 2.8);
    blast.connect(filter).connect(blastGain).connect(this.master);
    blast.start(now);

    const sub = context.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(90, now);
    sub.frequency.exponentialRampToValueAtTime(24, now + 2.2);
    const subGain = this.envelope(now, 0.0001, 0.8, 0.03, 2.4);
    sub.connect(subGain).connect(this.master);
    sub.start(now);
    sub.stop(now + 2.6);
  }

  /** Arrival: a deep drop with a short sparkle tail. */
  arrive() {
    const context = this.context;
    const now = context.currentTime;

    const boom = context.createOscillator();
    boom.type = "sine";
    boom.frequency.setValueAtTime(130, now);
    boom.frequency.exponentialRampToValueAtTime(36, now + 0.9);
    const boomGain = this.envelope(now, 0.0001, 0.5, 0.05, 1.1);
    boom.connect(boomGain).connect(this.master);
    boom.start(now);
    boom.stop(now + 1.4);

    for (let i = 0; i < 12; i += 1) {
      const at = now + 0.05 + i * 0.045 + Math.random() * 0.03;
      this.ping(at, 3200 - i * 140 + Math.random() * 300, 0.03, 0.35);
    }
  }

  dispose() {
    void this.context.close();
  }

  // ---- helpers

  private ping(at: number, frequency: number, level: number, decay: number) {
    const context = this.context;
    const carrier = context.createOscillator();
    carrier.type = "sine";
    carrier.frequency.value = frequency;
    // A touch of FM gives the ping a glassy, bell-like edge.
    const modulator = context.createOscillator();
    modulator.frequency.value = frequency * 2.76;
    const depth = context.createGain();
    depth.gain.value = frequency * 0.6;
    modulator.connect(depth).connect(carrier.frequency);
    const gain = this.envelope(at, 0.0001, level, 0.005, decay);
    const pan = context.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    carrier.connect(gain).connect(pan).connect(this.master);
    carrier.start(at);
    modulator.start(at);
    carrier.stop(at + decay + 0.1);
    modulator.stop(at + decay + 0.1);
  }

  /** Gain node with an attack-hold-release envelope starting at `at`. */
  private envelope(at: number, floor: number, peak: number, attack: number, release: number) {
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(floor, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + Math.max(attack, 0.005));
    gain.gain.exponentialRampToValueAtTime(floor, at + attack + release);
    return gain;
  }

  private whiteNoise(seconds: number) {
    const buffer = this.context.createBuffer(
      1,
      Math.round(this.context.sampleRate * seconds),
      this.context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private brownNoise(seconds: number) {
    const buffer = this.whiteNoise(seconds);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      last = (last + 0.02 * data[i]) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }
}
