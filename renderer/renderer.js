const pivot = document.getElementById('pivot');
const thread = document.getElementById('thread');
const beadsContainer = document.getElementById('beads-container');
const charm = document.getElementById('charm');
const charmInner = document.getElementById('charm-inner');
const charmImg = document.getElementById('charm-img');

// Current dynamic config state
let config = {
  hangingLength: 90,
  charmSize: 110,
  swingElasticity: 10,
  swingDamping: 2.2,
  soundEffects: true
};

let activeCharmData = {
  hasBeads: true
};

// ---------------------------------------------------------------
// 1. Multi-Sound Audio Synthesis for Blessing Ritual
// ---------------------------------------------------------------
let audioCtx = null;
let soundIndex = 0;

function playBlessingSound() {
  if (!config.soundEffects) return;
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
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 1.5);
      });
    } else if (mode === 1) {
      // 2. Tibetan Zen Singing Bowl (Deep sacred harmonic resonance with warm envelope)
      const baseFreq = 432;
      [1, 2, 2.76, 4.05].forEach((mult, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * mult, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4 - idx * 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } else if (mode === 2) {
      // 3. Mystic Harp Sparkle Ripple (D Major Pentatonic)
      const freqs = [587.33, 659.25, 739.99, 880.00, 987.77, 1174.66, 1479.98];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.035 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + 1.1);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 1.2);
      });
    } else if (mode === 3) {
      // 4. Ethereal Wind Chime Cluster
      const freqs = [659.25, 880.00, 1046.50, 1318.51, 1760.00];
      freqs.forEach((freq, idx) => {
        const delay = idx * 0.06 + Math.random() * 0.03;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.15, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 1.7);
      });
    } else {
      // 5. Cosmic Temple Aura (Layered warm harmonic chord)
      const freqs = [329.63, 493.88, 659.25, 987.77, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.18 / (idx * 0.5 + 1), now + idx * 0.02 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.02 + 1.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.02);
        osc.stop(now + idx * 0.02 + 1.9);
      });
    }
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

// ---------------------------------------------------------------
// 2. Click-through Hit Testing
// ---------------------------------------------------------------
window.addEventListener('mousemove', (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const overInteractive = !!(el && el.closest && el.closest('.interactive'));
  if (window.dangle && window.dangle.setIgnoreMouseEvents) {
    window.dangle.setIgnoreMouseEvents(!overInteractive, { forward: true });
  }
});

// ---------------------------------------------------------------
// 3. Dynamic Length & Precision Layout Updater
// ---------------------------------------------------------------
const BEADS_STACK_HEIGHT = 34; // 9px + 1.5px + 13px + 1.5px + 9px = 34px

function updateVisualLayout(lengthPx) {
  const hasBeads = activeCharmData.hasBeads;
  const charmSz = config.charmSize || 110;

  let totalCordLength = lengthPx;
  const topRingFromCharmTop = (11 / 200) * charmSz;
  let charmTop = lengthPx;

  if (hasBeads) {
    const threadAboveBeads = Math.max(10, lengthPx - BEADS_STACK_HEIGHT);
    beadsContainer.style.display = 'flex';
    beadsContainer.style.top = `${threadAboveBeads}px`;
    // Charm gold ring top sits flush at the bottom of the beads stack:
    charmTop = threadAboveBeads + BEADS_STACK_HEIGHT - topRingFromCharmTop;
    // Thread cord extends continuously from top, through the beads, to the ring loop:
    totalCordLength = threadAboveBeads + BEADS_STACK_HEIGHT;
  } else {
    beadsContainer.style.display = 'none';
    charmTop = lengthPx - topRingFromCharmTop;
    totalCordLength = lengthPx;
  }

  thread.style.height = `${totalCordLength}px`;
  charm.style.top = `${charmTop}px`;
  charm.style.width = `${charmSz}px`;
  charm.style.height = `${charmSz}px`;
}

function applyConfig(newConfig) {
  if (!newConfig) return;
  config = { ...config, ...newConfig };

  const offset = config.rightOffset !== undefined ? config.rightOffset : 60;
  if (config.positionMode === 'top-center') {
    pivot.style.left = '50%';
  } else if (config.positionMode === 'top-left') {
    pivot.style.left = `${offset}px`;
  } else {
    pivot.style.left = `calc(100% - ${offset}px)`;
  }

  if (newConfig.activeCharm) {
    activeCharmData = newConfig.activeCharm;
    const active = newConfig.activeCharm;
    if (active.type === 'custom' && active.fullPath) {
      charmImg.src = `file://${active.fullPath.replace(/\\/g, '/')}`;
    } else {
      charmImg.src = `../assets/charms/${active.file || 'evil-eye.svg'}`;
    }
  }

  // Update rest length
  restLength = config.hangingLength || 90;
  if (!dragging) {
    currentLength = restLength;
  }
  updateVisualLayout(currentLength);
}

// ---------------------------------------------------------------
// 4. Stretchable 2D Spring-Pendulum Physics Engine
// ---------------------------------------------------------------
let angle = 0;               // degrees
let angularVelocity = 0;      // rad/s
let restLength = 90;          // px nominal length
let currentLength = 90;       // px stretched length
let lengthVelocity = 0;       // px/s spring bounce velocity

let dragging = false;
const MAX_ANGLE = 65;

let lastFrameTime = performance.now();

function physicsStep(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.04);
  lastFrameTime = now;

  const springK = config.swingElasticity || 10;
  const damping = config.swingDamping || 2.2;
  const stretchK = 95;        // vertical rubber-band spring stiffness
  const stretchDamping = 6.5; // bounce damping

  if (!dragging) {
    // 1. Angular Pendulum Physics
    const angularAcceleration = -springK * (angle * Math.PI / 180) - damping * angularVelocity;
    angularVelocity += angularAcceleration * dt;
    angle += angularVelocity * (180 / Math.PI) * dt;
    angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle));

    // 2. Vertical Rubber-Band Stretch Physics (bouncing back to restLength)
    const stretchDisplacement = currentLength - restLength;
    const lengthAcceleration = -stretchK * stretchDisplacement - stretchDamping * lengthVelocity;
    lengthVelocity += lengthAcceleration * dt;
    currentLength += lengthVelocity * dt;

    // Settle if negligible
    if (Math.abs(stretchDisplacement) < 0.2 && Math.abs(lengthVelocity) < 0.2) {
      currentLength = restLength;
      lengthVelocity = 0;
    }
  }

  // Update transforms
  pivot.style.transform = `rotate(${angle}deg)`;
  updateVisualLayout(currentLength);

  requestAnimationFrame(physicsStep);
}
requestAnimationFrame(physicsStep);

// ---------------------------------------------------------------
// 5. Interactive Drag & Elastic Pull (Fixed left/right direction)
// ---------------------------------------------------------------
let history = [];

function getStaticPivotPoint() {
  const offset = config.rightOffset !== undefined ? config.rightOffset : 60;
  let px = window.innerWidth - offset;
  if (config.positionMode === 'top-center') {
    px = window.innerWidth / 2;
  } else if (config.positionMode === 'top-left') {
    px = offset;
  }
  const py = 20;
  return { px, py };
}

function getRelativeVector(clientX, clientY) {
  const { px, py } = getStaticPivotPoint();
  const dx = clientX - px;
  const dy = clientY - py;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Math.atan2(dx, dy): dx < 0 (left) => negative angle, dx > 0 (right) => positive angle
  const ang = Math.atan2(dx, Math.max(6, dy)) * (180 / Math.PI);
  return { dx, dy, dist, ang };
}

charm.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return; // Left click only
  dragging = true;
  angularVelocity = 0;
  lengthVelocity = 0;
  charm.classList.add('grabbing');
  history = [{ angle, length: currentLength, t: performance.now() }];
  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const { dist, ang } = getRelativeVector(e.clientX, e.clientY);

  angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, ang));

  // Allow stretching downwards elastically
  const minLen = Math.max(35, restLength * 0.5);
  const maxLen = Math.min(320, restLength * 2.8);
  const targetLen = Math.max(minLen, Math.min(maxLen, dist - (config.charmSize * 0.35)));

  currentLength = targetLen;

  history.push({ angle, length: currentLength, t: performance.now() });
  if (history.length > 6) history.shift();
});

window.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  charm.classList.remove('grabbing');

  if (history.length >= 2) {
    const a = history[0];
    const b = history[history.length - 1];
    const dt = Math.max((b.t - a.t) / 1000, 0.001);

    const releasedDegPerSec = (b.angle - a.angle) / dt;
    angularVelocity = Math.max(-15, Math.min(15, releasedDegPerSec * (Math.PI / 180)));

    const releasedLenPerSec = (b.length - a.length) / dt;
    lengthVelocity = Math.max(-300, Math.min(300, releasedLenPerSec));
  }
});

// ---------------------------------------------------------------
// 6. Blessing Ritual Effect (Fixed alignment & sparkles)
// ---------------------------------------------------------------
function triggerRitualEffect() {
  charmInner.classList.remove('ritual');
  void charmInner.offsetWidth; // force reflow
  charmInner.classList.add('ritual');

  playBlessingSound();

  // Create Sparkle Particles around the charm
  const charmRect = charm.getBoundingClientRect();
  const centerX = charmRect.width / 2;
  const centerY = charmRect.height / 2 + 8;

  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'sparkle-particle';
    const rad = (Math.PI * 2 * i) / 16;
    const dist = 35 + Math.random() * 50;
    const tx = Math.cos(rad) * dist + 'px';
    const ty = Math.sin(rad) * dist + 'px';

    p.style.left = `${centerX}px`;
    p.style.top = `${centerY}px`;
    p.style.setProperty('--tx', tx);
    p.style.setProperty('--ty', ty);

    charm.appendChild(p);
    setTimeout(() => p.remove(), 850);
  }

  // Add a satisfying gentle elastic stretch pulse and swing
  lengthVelocity += 35;
  angularVelocity += (Math.random() > 0.5 ? 1 : -1) * 2.0;
}

// ---------------------------------------------------------------
// 7. IPC Registration
// ---------------------------------------------------------------
if (window.dangle) {
  window.dangle.onRitual(() => {
    triggerRitualEffect();
  });

  window.dangle.onConfigUpdated((newConfig) => {
    applyConfig(newConfig);
  });

  // Initial load
  window.dangle.getConfig().then((cfg) => {
    applyConfig(cfg);
  });
}
