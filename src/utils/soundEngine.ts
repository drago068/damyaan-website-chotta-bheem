class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private oscillators: (OscillatorNode | AudioNode)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.stopOscillators();

      const now = this.ctx.currentTime;

      // 1. Sub drone (Deep subterranean 48Hz rumble)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(48, now);

      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(0.35, now);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start();
      this.oscillators.push(osc1);

      // 2. Harmonic hollow drone (72Hz fifth with slight detune)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(72, now);

      // Resonant Lowpass filter (Ancient stone chamber acoustics)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);
      filter.Q.setValueAtTime(4.0, now);

      // Slow LFO for breathing green magic pulsation
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, now); // slow breath
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(80, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.oscillators.push(lfo);

      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.2, now);

      osc2.connect(filter);
      filter.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start();
      this.oscillators.push(osc2);

      // Fade master gain up smoothly
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0, now);
      this.masterGain.gain.linearRampToValueAtTime(0.4, now + 2.0);

      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio playback not supported or user gesture needed:', e);
    }
  }

  public stop() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + 1.2);
    setTimeout(() => {
      this.stopOscillators();
    }, 1300);
    this.isPlaying = false;
  }

  private stopOscillators() {
    this.oscillators.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    });
    this.oscillators = [];
  }
}

export const soundEngine = new SoundEngine();
