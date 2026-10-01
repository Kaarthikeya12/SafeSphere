// Web Audio API Procedural Synthesizer (Zero external audio file dependencies)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sirenOsc1: OscillatorNode | null = null;
  private sirenOsc2: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenTimer: number | null = null;
  private isSirenActive = false;

  private ringTimer: number | null = null;
  private isRinging = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playBeep(freq = 880, duration = 0.15) {
    try {
      const c = this.getContext();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(0.3, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duration);
    } catch {
      // Audio autoplay restrictions fallback
    }
  }

  startSiren() {
    if (this.isSirenActive) return;
    try {
      const c = this.getContext();
      this.isSirenActive = true;
      const osc1 = c.createOscillator();
      const osc2 = c.createOscillator();
      const gain = c.createGain();

      osc1.type = "sawtooth";
      osc2.type = "square";
      gain.gain.setValueAtTime(0.35, c.currentTime);

      let hi = false;
      osc1.frequency.setValueAtTime(700, c.currentTime);
      osc2.frequency.setValueAtTime(950, c.currentTime);

      this.sirenTimer = window.setInterval(() => {
        if (!this.isSirenActive) return;
        const now = c.currentTime;
        if (hi) {
          osc1.frequency.setTargetAtTime(900, now, 0.05);
          osc2.frequency.setTargetAtTime(1200, now, 0.05);
        } else {
          osc1.frequency.setTargetAtTime(600, now, 0.05);
          osc2.frequency.setTargetAtTime(800, now, 0.05);
        }
        hi = !hi;
      }, 400);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(c.destination);

      osc1.start();
      osc2.start();

      this.sirenOsc1 = osc1;
      this.sirenOsc2 = osc2;
      this.sirenGain = gain;
    } catch {
      // audio error
    }
  }

  stopSiren() {
    if (!this.isSirenActive) return;
    this.isSirenActive = false;
    if (this.sirenTimer) {
      clearInterval(this.sirenTimer);
      this.sirenTimer = null;
    }
    try {
      this.sirenOsc1?.stop();
      this.sirenOsc2?.stop();
      this.sirenOsc1?.disconnect();
      this.sirenOsc2?.disconnect();
      this.sirenGain?.disconnect();
    } catch {
      // ignore
    }
  }

  isSirenPlaying() {
    return this.isSirenActive;
  }

  startRingtone() {
    if (this.isRinging) return;
    this.isRinging = true;

    const ring = () => {
      if (!this.isRinging) return;
      this.playBeep(853, 0.4);
      setTimeout(() => this.isRinging && this.playBeep(960, 0.4), 450);
      setTimeout(() => this.isRinging && this.playBeep(853, 0.4), 900);
      setTimeout(() => this.isRinging && this.playBeep(960, 0.4), 1350);
    };

    ring();
    this.ringTimer = window.setInterval(ring, 3500);
  }

  stopRingtone() {
    this.isRinging = false;
    if (this.ringTimer) {
      clearInterval(this.ringTimer);
      this.ringTimer = null;
    }
  }

  speak(text: string, rate = 1.0) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    window.speechSynthesis.speak(u);
  }

  stopSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
