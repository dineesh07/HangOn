const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const DEFAULT_CONFIG = {
  enabled: true,
  selectedCharmId: 'evil-eye',
  positionMode: 'top-right', // 'top-right', 'top-center', 'top-left', 'custom'
  rightOffset: 60, // px from right edge of screen
  hangingLength: 90, // px (thread length)
  charmSize: 110, // px (width/height of charm)
  swingElasticity: 10,
  swingDamping: 2.2,
  soundEffects: true,
  startOnBoot: false,
  customCharms: []
};

const PRESET_CHARMS = [
  {
    id: 'evil-eye',
    name: 'Nazar Evil Eye',
    type: 'preset',
    file: 'evil-eye.svg',
    hasBeads: true,
    description: 'Ancient talisman protecting against negative energy and bringing good fortune'
  },
  {
    id: 'lucky-cat',
    name: 'Maneki-Neko (Lucky Cat)',
    type: 'preset',
    file: 'lucky-cat.svg',
    hasBeads: false,
    description: 'Traditional Japanese waving cat attracting wealth, luck and success'
  },
  {
    id: 'gold-coin',
    name: 'Feng Shui Lucky Coin',
    type: 'preset',
    file: 'gold-coin.svg',
    hasBeads: true,
    description: 'Chinese prosperity coin bound with red mystic knot for abundance'
  },
  {
    id: 'lucky-clover',
    name: 'Emerald Four-Leaf Clover',
    type: 'preset',
    file: 'lucky-clover.svg',
    hasBeads: false,
    description: 'Rare lucky clover symbolizing hope, faith, love and pure luck'
  },
  {
    id: 'mystic-crystal',
    name: 'Celestial Amethyst',
    type: 'preset',
    file: 'mystic-crystal.svg',
    hasBeads: true,
    description: 'Radiant crystal shard for clarity, focus, and cosmic blessings'
  }
];

class ConfigStore {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'dangle-config.json');
    this.customCharmsDir = path.join(app.getPath('userData'), 'custom-charms');
    this.ensureDirs();
    this.data = this.loadConfig();
  }

  ensureDirs() {
    try {
      if (!fs.existsSync(this.customCharmsDir)) {
        fs.mkdirSync(this.customCharmsDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create custom charms dir:', err);
    }
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('Failed to read config, falling back to defaults:', err);
    }
    return { ...DEFAULT_CONFIG };
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  }

  get(key) {
    return this.data[key];
  }

  getAll() {
    return {
      ...this.data,
      presets: PRESET_CHARMS
    };
  }

  set(key, value) {
    this.data[key] = value;
    this.saveConfig();
  }

  update(partial) {
    this.data = { ...this.data, ...partial };
    this.saveConfig();
  }

  addCustomCharm(filePath, customName) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const id = 'custom_' + Date.now();
      const name = customName || path.basename(filePath, ext);
      const targetFilename = `${id}${ext}`;
      const targetPath = path.join(this.customCharmsDir, targetFilename);

      fs.copyFileSync(filePath, targetPath);

      const charmObj = {
        id,
        name,
        type: 'custom',
        file: targetFilename,
        fullPath: targetPath,
        ext,
        hasBeads: false,
        description: 'Custom user uploaded dangle'
      };

      if (!this.data.customCharms) {
        this.data.customCharms = [];
      }
      this.data.customCharms.push(charmObj);
      this.data.selectedCharmId = id;
      this.saveConfig();
      return charmObj;
    } catch (err) {
      console.error('Failed to add custom charm:', err);
      throw err;
    }
  }

  removeCustomCharm(id) {
    if (!this.data.customCharms) return;
    const charm = this.data.customCharms.find(c => c.id === id);
    if (charm && charm.fullPath && fs.existsSync(charm.fullPath)) {
      try {
        fs.unlinkSync(charm.fullPath);
      } catch (e) {}
    }
    this.data.customCharms = this.data.customCharms.filter(c => c.id !== id);
    if (this.data.selectedCharmId === id) {
      this.data.selectedCharmId = 'evil-eye';
    }
    this.saveConfig();
  }

  getActiveCharm() {
    const activeId = this.data.selectedCharmId;
    const preset = PRESET_CHARMS.find(p => p.id === activeId);
    if (preset) return preset;

    if (this.data.customCharms) {
      const custom = this.data.customCharms.find(c => c.id === activeId);
      if (custom) return custom;
    }

    return PRESET_CHARMS[0];
  }
}

module.exports = {
  ConfigStore,
  PRESET_CHARMS,
  DEFAULT_CONFIG
};
