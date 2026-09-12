# Lucky Dangle — Project Overview & Technical Architecture

## 1. Project Vision & Purpose

**Lucky Dangle** is a lightweight, interactive desktop companion and physics-driven talisman application for Windows. It hangs a charming, animated lucky talisman from the top-right corner of your desktop (or custom position) with realistic 2D spring-pendulum physics, customizable threads, multi-sound blessing rituals, and instant system tray quick access.

Whether you treat it as an **Evil Eye (Nazar Amulet)** for warding off bugs and project manager inquiries, a **Maneki-Neko** for prosperity, or your own custom uploaded company logo, Lucky Dangle provides delight and tactile physics without ever interfering with your normal desktop workflow.

---

## 2. Core Features & Capabilities

### A. Physics & Interactive Motion
- **2D Spring-Pendulum Physics Engine**: Simulates both angular oscillation (pendulum gravity and damping) and vertical elongation (Hooke's law elasticity and bounce damping).
- **1:1 Natural Drag & Flick**: Click and drag in any direction; the charm accurately tracks the mouse vector and retains momentum on release.
- **Rubber-Band Elastic Stretch**: Dragging down extends the cord elastically; releasing triggers an energetic vertical bounce before settling.
- **True Transparent Click-Through**: Electron's `setIgnoreMouseEvents` with `{ forward: true }` ensures that 100% of your screen remains fully clickable, only capturing mouse inputs when hovering directly over the charm itself.

### B. Visual Fidelity & Charm Presets
- **Nazar Evil Eye (Custom SVG)**: Hand-crafted SVG with glossy radial glass gradients, concentric iris rings, metallic top ring, and a beaded golden thread (miniature evil-eye bead with specular highlight and white spacers).
- **Built-in Gallery**:
  - *Nazar Evil Eye* (Ancient protection amulet)
  - *Maneki-Neko* (Japanese waving golden cat)
  - *Feng Shui Coin* (Chinese prosperity coin with mystic knot)
  - *Emerald Clover* (Four-leaf clover with dew drops)
  - *Celestial Amethyst* (Faceted glowing crystal shard)
- **Custom Upload Support**: Accepts transparent PNG, animated GIF, WebP, SVG, and JPEG files, automatically stored in application data and selectable from the gallery.

### C. System Tray & Quick Access
- **Single Left-Click**: Instantly toggles the charm between visible (enabled) and hidden (disabled).
- **Right-Click Context Menu**:
  - Enable / Disable toggle
  - Quick charm switching
  - Add custom charm dialog
  - Hanging length presets (Short 50px, Medium 90px, Long 150px)
  - Charm size presets (Small 80px, Medium 110px, Large 150px)
  - Blessing Ritual shortcut (`Ctrl + S`)
  - Settings & Customizer launcher
  - Quit
- **Dynamic Taskbar & Tray Icon**: Automatically reflects the active charm image.

### D. Multi-Sound Blessing Synthesizer
Synthesized in real-time via the browser's **Web Audio API** (zero external MP3/WAV dependencies):
1. **Celestial Crystal Cascade**: Sparkling high harmonic bell arpeggio.
2. **Tibetan Zen Singing Bowl**: Deep 432 Hz warm resonant fundamental tone.
3. **Mystic Harp Sparkle**: Ascending pentatonic harp ripple.
4. **Ethereal Wind Chimes**: Light tubular metallic bell cluster.
5. **Cosmic Temple Aura**: Warm layered harmonic gong chord.

---

## 3. Technology Stack & Directory Structure

```
lucky-dangle/
├── assets/
│   ├── charms/
│   │   ├── evil-eye.svg       # Concentric glass evil eye talisman
│   │   ├── lucky-cat.svg      # Golden waving cat talisman
│   │   ├── gold-coin.svg      # Prosperity coin talisman
│   │   ├── lucky-clover.svg   # 4-leaf clover talisman
│   │   └── mystic-crystal.svg # Amethyst crystal talisman
│   └── tray-icon.png          # System tray icon
├── renderer/
│   ├── index.html             # Overlay window markup & bead styles
│   ├── renderer.js            # Physics engine, audio synth, and IPC listener
│   ├── settings.html          # Minimal light-theme settings UI (Outfit font)
│   ├── settings.css           # Modern aesthetic stylesheet
│   └── settings.js            # Settings UI controller & sliders
├── configStore.js             # Persistent configuration & custom charms manager
├── main.js                    # Electron main process (Tray, Window, Protocol, IPC)
├── preload.js                 # Secure context bridge IPC interface
├── package.json               # Dependencies and build scripts
└── README.md                  # Project documentation
```

### Key Libraries & APIs:
- **Electron 31**: Desktop runtime providing native window management, system tray, transparent screen overlays, global shortcuts, and file dialogs.
- **Web Audio API**: Real-time frequency synthesis for audio effects.
- **Outfit Google Font**: Clean typography for the minimal light theme UI.
- **Vanilla CSS3 & SVG**: High-performance hardware-accelerated animations and resolution-independent vector graphics.

---

## 4. Configuration Schema (`dangle-config.json`)

Stored in `%APPDATA%/my-lucky-dangle/dangle-config.json`:

```json
{
  "enabled": true,
  "selectedCharmId": "evil-eye",
  "positionMode": "top-right",
  "rightOffset": 60,
  "hangingLength": 90,
  "charmSize": 110,
  "swingElasticity": 10,
  "swingDamping": 2.2,
  "soundEffects": true,
  "startOnBoot": false,
  "customCharms": []
}
```

---

## 5. Keyboard Shortcuts & Protocol Handlers

- **`Ctrl + D`**: Toggle Show / Hide overlay
- **`Ctrl + S`**: Trigger Blessing ritual (pulse glow, sparkles, and synthesized chime)
- **Protocol URI**: `luckydangle://bless` (can be triggered from terminal, scripts, or git commit hooks via `start luckydangle://bless`)
