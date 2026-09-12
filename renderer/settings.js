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

// Load Initial Config
async function init() {
  if (!window.dangle) return;
  currentConfig = await window.dangle.getConfig();
  renderConfig(currentConfig);

  window.dangle.onConfigUpdated((cfg) => {
    currentConfig = cfg;
    renderConfig(cfg);
  });
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

// Buttons
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

// Start
init();
