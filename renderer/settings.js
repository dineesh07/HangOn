let currentConfig = null;

// DOM Elements
const toggleEnabled = document.getElementById('toggle-enabled');
const toggleSound = document.getElementById('toggle-sound');
const toggleStartup = document.getElementById('toggle-startup');
const statusPill = document.getElementById('status-pill');
const statusText = document.getElementById('status-text');

const sliderHanging = document.getElementById('slider-hanging');
const valHanging = document.getElementById('val-hanging');

const sliderSize = document.getElementById('slider-size');
const valSize = document.getElementById('val-size');

const sliderOffset = document.getElementById('slider-offset');
const valOffset = document.getElementById('val-offset');

const sliderElasticity = document.getElementById('slider-elasticity');
const valElasticity = document.getElementById('val-elasticity');

const charmsGrid = document.getElementById('charms-grid');
const btnUpload = document.getElementById('btn-upload');
const btnRitual = document.getElementById('btn-ritual');
const btnReset = document.getElementById('btn-reset');

// AI Prompt Generator DOM Elements
const promptObject = document.getElementById('prompt-object');
const btnCopyPrompt = document.getElementById('btn-copy-prompt');
const copyBtnText = document.getElementById('copy-btn-text');
const copyIconSvg = document.getElementById('copy-icon-svg');
const promptOutputText = document.getElementById('prompt-output-text');
const btnPromptUpload = document.getElementById('btn-prompt-upload');

// Load Initial Config
async function init() {
  if (!window.dangle) return;
  currentConfig = await window.dangle.getConfig();
  renderConfig(currentConfig);

  window.dangle.onConfigUpdated((cfg) => {
    currentConfig = cfg;
    renderConfig(cfg);
  });

  initPromptGenerator();
}

function renderConfig(cfg) {
  if (!cfg) return;

  const isEnabled = !!cfg.enabled;
  toggleEnabled.checked = isEnabled;
  toggleSound.checked = !!cfg.soundEffects;
  toggleStartup.checked = !!cfg.startOnBoot;

  if (statusPill && statusText) {
    if (isEnabled) {
      statusPill.classList.remove('disabled');
      statusText.textContent = 'Active';
    } else {
      statusPill.classList.add('disabled');
      statusText.textContent = 'Hidden';
    }
  }

  sliderHanging.value = cfg.hangingLength || 90;
  valHanging.textContent = `${cfg.hangingLength || 90}px`;

  sliderSize.value = cfg.charmSize || 110;
  valSize.textContent = `${cfg.charmSize || 110}px`;

  sliderOffset.value = cfg.rightOffset !== undefined ? cfg.rightOffset : 60;
  valOffset.textContent = `${sliderOffset.value}px`;

  sliderElasticity.value = cfg.swingElasticity || 10;
  valElasticity.textContent = `${cfg.swingElasticity || 10}`;

  renderCharmsList(cfg);
}

function renderCharmsList(cfg) {
  charmsGrid.innerHTML = '';

  const presets = cfg.presets || [];
  const customs = cfg.customCharms || [];
  const allCharms = [...presets, ...customs];

  allCharms.forEach((charm) => {
    const card = document.createElement('div');
    const isActive = charm.id === cfg.selectedCharmId;
    card.className = `charm-card ${isActive ? 'active' : ''}`;
    card.title = charm.description || charm.name;

    const imgSrc = charm.type === 'custom' && charm.fullPath
      ? `file://${charm.fullPath.replace(/\\/g, '/')}`
      : `../assets/charms/${charm.file}`;

    let deleteBtnHtml = '';
    if (charm.type === 'custom') {
      deleteBtnHtml = `<button class="btn-delete-charm" title="Delete custom charm" onclick="deleteCustom(event, '${charm.id}')">×</button>`;
    }

    card.innerHTML = `
      <div class="charm-card-active-badge"></div>
      ${deleteBtnHtml}
      <img src="${imgSrc}" alt="${charm.name}" class="charm-card-icon" />
      <div class="charm-card-name">${charm.name}</div>
      <div class="charm-card-tag">${charm.type === 'preset' ? 'Built-in' : 'Custom'}</div>
    `;

    card.addEventListener('click', () => {
      selectCharm(charm.id);
    });

    charmsGrid.appendChild(card);
  });
}

async function selectCharm(charmId) {
  if (!window.dangle) return;
  await window.dangle.updateConfig({ selectedCharmId: charmId });
}

window.deleteCustom = async function(event, charmId) {
  event.stopPropagation();
  if (confirm('Are you sure you want to remove this custom dangle?')) {
    await window.dangle.deleteCustomCharm(charmId);
  }
};

// Event Listeners for Sliders & Toggles
sliderHanging.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  valHanging.textContent = `${val}px`;
  window.dangle.updateConfig({ hangingLength: val });
});

sliderSize.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  valSize.textContent = `${val}px`;
  window.dangle.updateConfig({ charmSize: val });
});

sliderOffset.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  valOffset.textContent = `${val}px`;
  window.dangle.updateConfig({ rightOffset: val });
});

sliderElasticity.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  valElasticity.textContent = `${val}`;
  window.dangle.updateConfig({ swingElasticity: val });
});

toggleEnabled.addEventListener('change', (e) => {
  window.dangle.updateConfig({ enabled: e.target.checked });
});

toggleSound.addEventListener('change', (e) => {
  window.dangle.updateConfig({ soundEffects: e.target.checked });
});

toggleStartup.addEventListener('change', (e) => {
  window.dangle.updateConfig({ startOnBoot: e.target.checked });
});

// Helper Chip functions
window.setHanging = function(val) {
  sliderHanging.value = val;
  valHanging.textContent = `${val}px`;
  window.dangle.updateConfig({ hangingLength: val });
};

window.setSize = function(val) {
  sliderSize.value = val;
  valSize.textContent = `${val}px`;
  window.dangle.updateConfig({ charmSize: val });
};

window.setOffset = function(val) {
  sliderOffset.value = val;
  valOffset.textContent = `${val}px`;
  window.dangle.updateConfig({ rightOffset: val });
};

// Standard Buttons
btnUpload.addEventListener('click', async () => {
  if (!window.dangle) return;
  await window.dangle.pickCustomCharm();
});

btnRitual.addEventListener('click', () => {
  if (window.dangle) {
    window.dangle.performRitual();
  }
});

btnReset.addEventListener('click', async () => {
  if (!confirm('Reset all settings to default values?')) return;
  if (window.dangle) {
    await window.dangle.updateConfig({
      hangingLength: 90,
      charmSize: 110,
      rightOffset: 60,
      swingElasticity: 10,
      swingDamping: 2.2,
      soundEffects: true,
      selectedCharmId: 'evil-eye'
    });
  }
});

// ===============================================================
// AI Charm Prompt Generator Logic
// ===============================================================
function initPromptGenerator() {
  if (!promptOutputText) return;

  // Listeners for inputs
  if (promptObject) {
    promptObject.addEventListener('input', updatePromptOutput);
  }

  document.querySelectorAll('input[name="ai-style"]').forEach((el) => {
    el.addEventListener('change', updatePromptOutput);
  });

  document.querySelectorAll('input[name="ai-format"]').forEach((el) => {
    el.addEventListener('change', updatePromptOutput);
  });

  document.querySelectorAll('input[name="ai-attach"]').forEach((el) => {
    el.addEventListener('change', updatePromptOutput);
  });

  // Copy Prompt Button
  if (btnCopyPrompt) {
    btnCopyPrompt.addEventListener('click', () => {
      const text = promptOutputText.textContent;
      navigator.clipboard.writeText(text).then(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        if (copyIconSvg) {
          copyIconSvg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        }
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Prompt';
          if (copyIconSvg) {
            copyIconSvg.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
          }
        }, 2200);
      });
    });
  }

  // Upload resulting charm shortcut button
  if (btnPromptUpload) {
    btnPromptUpload.addEventListener('click', async () => {
      if (window.dangle) {
        await window.dangle.pickCustomCharm();
      }
    });
  }

  // Initial prompt generation
  updatePromptOutput();
}

function updatePromptOutput() {
  if (!promptOutputText) return;

  const objectVal = promptObject ? promptObject.value.trim() : '';
  const style = document.querySelector('input[name="ai-style"]:checked')?.value || 'enamel';
  const format = document.querySelector('input[name="ai-format"]:checked')?.value || '3d';
  const attach = document.querySelector('input[name="ai-attach"]:checked')?.value || 'loop';

  // 1. Subject description
  let subjectStr = '';
  if (objectVal) {
    subjectStr = `A hanging talisman charm featuring a centered ${objectVal}`;
  } else {
    // Default abstract talisman matching built-in designs
    if (style === 'glass') subjectStr = 'A hanging mystical protective evil-eye talisman amulet';
    else if (style === 'gold') subjectStr = 'A hanging antique prosperity medallion talisman';
    else if (style === 'neon') subjectStr = 'A hanging cyberpunk geometric energy talisman emblem';
    else if (style === 'jade') subjectStr = 'A hanging imperial jade harmony talisman amulet';
    else if (style === 'crystal') subjectStr = 'A hanging mystical quartz prism celestial crystal charm';
    else if (style === 'enamel') subjectStr = 'A hanging lucky geometric badge talisman charm';
  }

  // 2. Material & Style description
  let styleStr = '';
  switch (style) {
    case 'glass':
      styleStr = 'crafted from lustrous cobalt blue, cyan, and white glass with glossy concentric rings and specular optical reflections, Mediterranean nazar aesthetic';
      break;
    case 'gold':
      styleStr = 'crafted from solid polished 24k antique gold with intricate filigree engravings, beveled metallic edges, and warm golden highlights';
      break;
    case 'neon':
      styleStr = 'designed as a futuristic holographic cyber emblem with glowing neon cyan, magenta, and electric violet laser accents';
      break;
    case 'jade':
      styleStr = 'hand-carved from translucent imperial emerald green jade stone with smooth polished luster and delicate engraved relief details';
      break;
    case 'crystal':
      styleStr = 'faceted sparkling celestial quartz crystal gemstone with diamond cuts, rainbow chromatic aberration, and iridescent light refraction';
      break;
    case 'enamel':
      styleStr = 'premium cloisonné glossy enamel with polished gold metallic borders, vibrant contrasting colors, and smooth protective resin coat';
      break;
  }

  // 3. Art & Render Medium
  let formatStr = '';
  switch (format) {
    case '3d':
      formatStr = 'hyper-detailed 3D volumetric render, Octane render 8k, raytraced reflections, studio lighting';
      break;
    case 'vector':
      formatStr = 'crisp minimalist vector graphic, clean bold line-art, flat modern shading, SVG sticker badge style';
      break;
    case 'pixel':
      formatStr = 'crisp retro 16-bit pixel art talisman sprite, clean dithering, vivid color palette, game asset style';
      break;
  }

  // 4. Attachment
  let attachStr = '';
  switch (attach) {
    case 'loop':
      attachStr = 'featuring a polished golden jump ring hanging loop securely attached at the very top center';
      break;
    case 'beads':
      attachStr = 'suspended from a fine golden cord threaded with miniature evil eye protective beads and a top attachment loop';
      break;
    case 'clean':
      attachStr = 'with a clean circular mounting hole at the top edge';
      break;
  }

  // Full Prompt Assembly
  const fullPrompt = `${subjectStr}, ${styleStr}, ${attachStr}, ${formatStr}, perfectly centered composition, clean edges, isolated on pure transparent background, no shadow clipping, PNG format --no background, --v 6.0`;

  promptOutputText.textContent = fullPrompt;
}

// Start
init();

