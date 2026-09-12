// Procedural Multi-Sound Web Audio Synthesizer (Zero external audio files)
let audioCtx = null;
let soundIndex = 0;

export function playBlessingSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const mode = soundIndex % 5;
    soundIndex++;
    const now = audioCtx.currentTime;

    if (mode === 0) {
      // 1. Celestial Crystal Cascade (C5, G5, C6, E6, G6, C7)
      const freqs = [523.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.16 / (idx + 1), now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 1.3);
      });
    } else if (mode === 1) {
      // 2. Tibetan Zen Singing Bowl (Deep 432 Hz warm harmonic resonance)
      const baseFreq = 432;
      [1, 2, 2.76, 4.05].forEach((mult, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * mult, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0 - idx * 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 2.1);
      });
    } else if (mode === 2) {
      // 3. Mystic Harp Sparkle
      const freqs = [587.33, 659.25, 739.99, 880.00, 987.77, 1174.66, 1479.98];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.035 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + 1.0);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 1.1);
      });
    } else if (mode === 3) {
      // 4. Ethereal Wind Chimes
      const freqs = [659.25, 880.00, 1046.50, 1318.51, 1760.00];
      freqs.forEach((freq, idx) => {
        const delay = idx * 0.06 + Math.random() * 0.02;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.15, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 1.5);
      });
    } else {
      // 5. Cosmic Temple Aura
      const freqs = [329.63, 493.88, 659.25, 987.77, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.18 / (idx * 0.5 + 1), now + idx * 0.02 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.02 + 1.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.02);
        osc.stop(now + idx * 0.02 + 1.6);
      });
    }
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}
