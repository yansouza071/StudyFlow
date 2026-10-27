// Web Audio API Synthesizer - pure client-side, zero external files required
export const soundService = {
  playTone(freq: number = 587.33, type: OscillatorType = 'sine', duration: number = 0.4): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio might be blocked by browser policy until user interaction
    }
  },

  playFocusComplete(): void {
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chime
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.6);
        }, idx * 140);
      });
    } catch (e) {
      console.error(e);
    }
  },

  playBreakEnd(): void {
    try {
      const notes = [783.99, 659.25, 523.25];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.4);
        }, idx * 120);
      });
    } catch (e) {
      console.error(e);
    }
  },

  playTaskComplete(): void {
    this.playTone(880, 'sine', 0.25);
  },
};
