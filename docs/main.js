// -------------------------------------------------------------
// 1. Procedural Multi-Sound Web Audio Synthesizer
// -------------------------------------------------------------
let audioCtx = null;
let soundIndex = 0;

function playBlessingSound() {
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
      // Celestial Crystal Cascade
      const freqs = [523.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.15 / (idx + 1), now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 1.3);
      });
    } else if (mode === 1) {
      // Tibetan Zen Singing Bowl
      const baseFreq = 432;
      [1, 2, 2.76, 4.05].forEach((mult, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * mult, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.16 / (idx + 1), now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0 - idx * 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 2.1);
      });
    } else if (mode === 2) {
      // Mystic Harp Sparkle
      const freqs = [587.33, 659.25, 739.99, 880.00, 987.77, 1174.66, 1479.98];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.035 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + 1.0);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 1.1);
      });
    } else if (mode === 3) {
      // Ethereal Wind Chimes
      const freqs = [659.25, 880.00, 1046.50, 1318.51, 1760.00];
      freqs.forEach((freq, idx) => {
        const delay = idx * 0.06 + Math.random() * 0.02;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.14, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 1.5);
      });
    } else {
      // Cosmic Temple Aura
      const freqs = [329.63, 493.88, 659.25, 987.77, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.16 / (idx * 0.5 + 1), now + idx * 0.02 + 0.03);
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

// -------------------------------------------------------------
// 2. Interactive 2D Spring-Pendulum & Elastic Stretch Engine
// -------------------------------------------------------------
const pivot = document.getElementById('web-pivot');
const thread = document.getElementById('web-thread');
const beads = document.getElementById('web-beads');
const charm = document.getElementById('web-charm');
const charmImg = document.getElementById('hero-charm-img');
const stageWrapper = document.getElementById('hero-stage');

let angle = 0;              // current angle in degrees
let angularVelocity = 0;     // rad/s
let restLength = 100;        // nominal cord length in px
let currentLength = 100;     // stretched cord length
let lengthVelocity = 0;      // vertical bounce velocity
let isDragging = false;
let history = [];
const MAX_ANGLE = 60;

let lastTime = performance.now();

function updateVisuals(lenPx) {
  const BEADS_STACK = 32;
  const threadAbove = Math.max(10, lenPx - BEADS_STACK);
  
  if (beads) {
    beads.style.top = `${threadAbove}px`;
  }
  if (thread) {
    thread.style.height = `${threadAbove + BEADS_STACK}px`;
  }
  if (charm) {
    charm.style.top = `${threadAbove + BEADS_STACK - 6}px`;
  }
  if (pivot) {
    pivot.style.transform = `rotate(${angle}deg)`;
  }
}

function physicsLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.04);
  lastTime = now;

  const springK = 9.5;        // rotational spring stiffness
  const damping = 2.0;        // air resistance damping
  const stretchK = 90;        // vertical rubber-band spring
  const stretchDamping = 6.0;

  if (!isDragging) {
    // 1. Angular Pendulum Motion
    const angularAcc = -springK * (angle * Math.PI / 180) - damping * angularVelocity;
    angularVelocity += angularAcc * dt;
    angle += angularVelocity * (180 / Math.PI) * dt;
    angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle));

    // Gentle idle sway if resting
    if (Math.abs(angle) < 0.1 && Math.abs(angularVelocity) < 0.1) {
      angle = Math.sin(now / 1000 * 1.5) * 2.2;
    }

    // 2. Vertical Stretch Elasticity
    const displacement = currentLength - restLength;
    const lengthAcc = -stretchK * displacement - stretchDamping * lengthVelocity;
    lengthVelocity += lengthAcc * dt;
    currentLength += lengthVelocity * dt;

    if (Math.abs(displacement) < 0.2 && Math.abs(lengthVelocity) < 0.2) {
      currentLength = restLength;
      lengthVelocity = 0;
    }
  }

  updateVisuals(currentLength);
  requestAnimationFrame(physicsLoop);
}
requestAnimationFrame(physicsLoop);

// Mouse drag handlers
if (charm && stageWrapper) {
  charm.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    angularVelocity = 0;
    lengthVelocity = 0;
    history = [{ angle, length: currentLength, t: performance.now() }];
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = pivot.getBoundingClientRect();
    const px = rect.left + rect.width / 2;
    const py = rect.top;

    const dx = e.clientX - px;
    const dy = e.clientY - py;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Inverted angle calculation for correct left-left / right-right tracking
    const ang = -Math.atan2(dx, Math.max(10, dy)) * (180 / Math.PI);
    angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, ang));

    const minLen = 45;
    const maxLen = 220;
    currentLength = Math.max(minLen, Math.min(maxLen, dist - 35));

    history.push({ angle, length: currentLength, t: performance.now() });
    if (history.length > 5) history.shift();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    if (history.length >= 2) {
      const a = history[0];
      const b = history[history.length - 1];
      const dt = Math.max((b.t - a.t) / 1000, 0.001);

      const degSpeed = (b.angle - a.angle) / dt;
      angularVelocity = Math.max(-14, Math.min(14, degSpeed * (Math.PI / 180)));

      const lenSpeed = (b.length - a.length) / dt;
      lengthVelocity = Math.max(-250, Math.min(250, lenSpeed));
    }
  });

  // Click on charm triggers chime and subtle nudge
  charm.addEventListener('click', () => {
    playBlessingSound();
    lengthVelocity += 25;
    angularVelocity += (Math.random() > 0.5 ? 1 : -1) * 2.5;
  });
}

// -------------------------------------------------------------
// 3. Audio Chime Button
// -------------------------------------------------------------
const ringChimeBtn = document.getElementById('ring-chime-btn');
if (ringChimeBtn) {
  ringChimeBtn.addEventListener('click', () => {
    playBlessingSound();
    if (lengthVelocity === 0) {
      lengthVelocity += 30;
      angularVelocity += 2.0;
    }
  });
}

// -------------------------------------------------------------
// 4. Interactive Charm Gallery Switcher
// -------------------------------------------------------------
const charmCards = document.querySelectorAll('.charm-card');
charmCards.forEach((card) => {
  card.addEventListener('click', () => {
    charmCards.forEach((c) => c.classList.remove('active'));
    card.classList.add('active');

    const charmFile = card.getAttribute('data-charm');
    if (charmFile && charmImg) {
      charmImg.src = `assets/charms/${charmFile}`;
      playBlessingSound();
      lengthVelocity += 35;
      angularVelocity += 3.0;
    }
  });
});

// -------------------------------------------------------------
// 5. Developer Code Snippet Copy-to-Clipboard
// -------------------------------------------------------------
const copyBtn = document.getElementById('copy-cmd-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const textToCopy = 'git push && start hangon://bless';
    navigator.clipboard.writeText(textToCopy).then(() => {
      copyBtn.textContent = 'Copied! ✨';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2200);
    });
  });
}
