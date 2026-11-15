class LooksMic extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;
    this.phase = 0;
    this.sum = 0;
    this.count = 0;
    this.samples = new Int16Array(320);
    this.size = 0;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    for (const sample of channel) {
      this.sum += sample;
      this.count++;
      this.phase++;
      if (this.phase < this.ratio) continue;
      const average = Math.max(-1, Math.min(1, this.sum / this.count));
      this.samples[this.size++] = average * (average < 0 ? 32768 : 32767);
      this.sum = 0;
      this.count = 0;
      this.phase -= this.ratio;
      if (this.size === this.samples.length) {
        this.port.postMessage(this.samples.buffer, [this.samples.buffer]);
        this.samples = new Int16Array(320);
        this.size = 0;
      }
    }
    return true;
  }
}

registerProcessor("looks-mic", LooksMic);
