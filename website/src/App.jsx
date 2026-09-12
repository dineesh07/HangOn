import React, { useState, useEffect, useRef } from 'react';
import HangingCharm from './components/HangingCharm';
import { playBlessingSound } from './audio';
import {
  Sparkles,
  Download,
  Bell,
  Check,
  Shield,
  Heart,
  Monitor,
  Sliders,
  Keyboard,
  MousePointer,
  Activity,
  Layers,
  MapPin,
  Scale,
  Package,
  Zap,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

const BASE = import.meta.env.BASE_URL || './';

const INITIAL_CHARMS = [
  { id: 'evil-eye', name: 'Nazar Evil Eye', file: 'evil-eye.svg', src: `${BASE}assets/charms/evil-eye.svg`, bg: 'bg-cyan', blessing: 'Wards off bugs & workspace chaos' },
  { id: 'lucky-cat', name: 'Maneki-Neko', file: 'lucky-cat.svg', src: `${BASE}assets/charms/lucky-cat.svg`, bg: 'bg-gold', blessing: 'Prosperity & serendipity' },
  { id: 'gold-coin', name: 'Feng Shui Coin', file: 'gold-coin.svg', src: `${BASE}assets/charms/gold-coin.svg`, bg: 'bg-gold', blessing: 'Abundance & financial fortune' },
  { id: 'lucky-clover', name: 'Emerald Clover', file: 'lucky-clover.svg', src: `${BASE}assets/charms/lucky-clover.svg`, bg: 'bg-mint', blessing: 'Serendipitous breakthroughs' },
  { id: 'mystic-crystal', name: 'Celestial Crystal', file: 'mystic-crystal.svg', src: `${BASE}assets/charms/mystic-crystal.svg`, bg: 'bg-lavender', blessing: 'Deep focus & mental clarity' },
  { id: 'frangipani', name: 'Frangipani', file: 'frangipani.png', src: `${BASE}assets/charms/frangipani.png`, bg: 'bg-pink', blessing: 'Calm tranquility & renewal' },
  { id: 'beluga-cat', name: 'Beluga Cat', file: 'beluga-cat.png', src: `${BASE}assets/charms/beluga-cat.png`, bg: 'bg-cyan', blessing: 'Wholesome humor & smiles' },
  { id: 'beast-boy', name: 'Beast Boy', file: 'beast-boy.png', src: `${BASE}assets/charms/beast-boy.png`, bg: 'bg-mint', blessing: 'High energy & resilience' },
  { id: 'master-jd', name: 'Master JD', file: 'master-jd.png', src: `${BASE}assets/charms/master-jd.png`, bg: 'bg-gold', blessing: 'Mastery & steady leadership' },
  { id: 'sunflower', name: 'Sunflower', file: 'sunflower.png', src: `${BASE}assets/charms/sunflower.png`, bg: 'bg-gold', blessing: 'Joy, brightness & optimism' },
];

export default function App() {
  const [charmsList, setCharmsList] = useState(INITIAL_CHARMS);
  const [activeCharm, setActiveCharm] = useState(INITIAL_CHARMS[0]);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  // Global Ctrl + Q shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        triggerBlessing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerBlessing = () => {
    playBlessingSound();
    setToastMessage('Blessing Ritual Triggered! (Ctrl + Q)');
    setTimeout(() => {
      setToastMessage('');
    }, 2400);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText('git push && start hangon://bless').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  // Custom User Image Upload Handler
  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 18);

    const newCharm = {
      id: `custom-${Date.now()}`,
      name: cleanName || 'Custom Charm',
      src: objectUrl,
      bg: 'bg-cyan',
      blessing: 'Custom uploaded talisman charm',
      isCustom: true,
    };

    setCharmsList((prev) => [newCharm, ...prev]);
    setActiveCharm(newCharm);
    triggerBlessing();
  };

  return (
    <div className="min-h-screen">

      {/* Toast Notification for Ctrl+Q */}
      {toastMessage && (
        <div className="blessing-toast">
          <Sparkles size={18} color="#fde047" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Custom Charm Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/gif, image/webp, image/svg+xml, image/jpeg"
        onChange={handleCustomUpload}
        style={{ display: 'none' }}
      />

      {/* Sticky Navbar */}
      <nav className="navbar">
        <a href="#" className="nav-brand">
          <img src={`${BASE}assets/icon.png`} alt="Hang On" className="nav-logo-icon" />
          <span>Hang On</span>
        </a>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#gallery">Charms</a></li>
          <li><a href="#settings">Customizer</a></li>
        </ul>

        <div className="nav-actions">
          <a
            href="https://github.com/dineesh07/HangOn"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a href="#download" className="btn btn-primary">
            Download v1.0.0
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">

            <div className="hero-content">
              <h1 className="hero-title">
                Hang something <span className="highlight">LUCKY</span> from your screen.
                <span className="hero-punchline">Or don't. We're not your MOM!!</span>
              </h1>

              <p className="hero-desc">
                Got bored. Made a thing that hangs from your screen. Added physics because why not. Added sounds because apparently that wasn’t enough. It’s free. Have fun.
              </p>

              <div className="hero-ctas">
                <a
                  href={`${BASE}downloads/Hang-On-Setup-1.0.0.exe`}
                  download="Hang-On-Setup-1.0.0.exe"
                  className="btn btn-primary btn-lg"
                >
                  <Download size={20} />
                  Download for Windows (.exe)
                </a>
                <a href="#features" className="btn btn-secondary btn-lg">
                  See How It Works
                </a>
              </div>

              {/* Shortcut Banner */}
              <div className="shortcut-pill-banner">
                <Keyboard size={16} color="#0284c7" />
                <span>Blessing Ritual:</span>
                <span className="kbd-badge">Ctrl</span> + <span className="kbd-badge">Q</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span>Toggle View:</span>
                <span className="kbd-badge">Ctrl</span> + <span className="kbd-badge">D</span>
              </div>

              {/* Meta Notes */}
              <div className="hero-notes">
                <span>
                  <Monitor size={15} />
                  Windows 10 & 11 (64-bit)
                </span>
                <span>•</span>
                <span>
                  <Heart size={15} />
                  100% Free & Open Source
                </span>
                <span>•</span>
                <span>
                  <Shield size={15} />
                  Zero Tracking
                </span>
              </div>
            </div>

            {/* Right: Interactive Live Simulation Rig */}
            <div className="hero-stage-card">
              <div className="hero-stage-header">
                <div className="stage-title">
                  <span className="stage-pulse" />
                  Live Physics Preview
                </div>
                <span className="badge badge-gold">
                  <MousePointer size={13} />
                  Try dragging it
                </span>
              </div>

              <div className="hero-canvas-wrapper" id="hero-stage">
                {/* Code editor background lines for click-through visualization */}
                <div className="canvas-backdrop">
                  <div className="mock-line short" />
                  <div className="mock-line long" />
                  <div className="mock-line med" />
                  <div className="mock-line long" />
                  <div className="mock-line short" />
                </div>

                {/* React 2D Spring Physics Rig */}
                <HangingCharm
                  charmSrc={activeCharm.src}
                  charmName={activeCharm.name}
                  size={110}
                  restLen={100}
                  hasBeads={true}
                  interactive={true}
                  onBless={() => triggerBlessing()}
                />
              </div>

              <div className="stage-instructions">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <MousePointer size={14} />
                  Click or fling to test 2D spring momentum
                </span>
                <div className="stage-buttons">
                  <button onClick={triggerBlessing} className="btn-icon-pill">
                    <Bell size={15} color="#0284c7" />
                    <span>Ring Chime (Ctrl+Q)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-cyan">
              <Activity size={14} />
              Crafted for Peace of Mind
            </span>
            <h2 className="section-title">Designed to charm, never to distract.</h2>
            <p className="section-subtitle">
              Hang On brings tactile physics and good fortune to your workspace without demanding your attention or slowing down your PC.
            </p>
          </div>

          <div className="features-grid">

            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <Activity size={26} />
              </div>
              <h3>2D Spring-Pendulum Physics</h3>
              <p>
                Simulates rotational gravity, air damping, and elastic rubber-band stretching. Drag left or right and release to watch it oscillate with natural momentum.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <Layers size={26} />
              </div>
              <h3>100% Click-Through</h3>
              <p>
                Never interrupts your workflow. Mouse clicks automatically pass right through to your code editor, browser, or games underneath unless you grab the charm directly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <Bell size={26} />
              </div>
              <h3>Procedural Ambient Chimes</h3>
              <p>
                Five warm harmonic audio modes synthesized in real-time via the Web Audio API (Singing Bowl, Crystal Cascade, Mystic Harp, Wind Chimes). Zero audio file overhead.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <Sliders size={26} />
              </div>
              <h3>Custom Uploads & Customizer</h3>
              <p>
                Choose from handcrafted talismans or upload any custom PNG, animated GIF, or SVG (like your team logo or favorite mascot) with instant live preview.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Charm Gallery Section with Inline Spotlight Preview */}
      <section className="section gallery-section" id="gallery">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-lavender">
              <Sparkles size={14} />
              Built-In Talisman Collection
            </span>
            <h2 className="section-title">Find the charm that matches your vibe.</h2>
            <p className="section-subtitle">
              Click any talisman below or upload your own PNG/GIF to see its instant live physics preview right here!
            </p>
          </div>

          <div className="gallery-layout">

            {/* Left: Interactive Gallery Spotlight Card */}
            <div className="gallery-spotlight-card">
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Selected Charm Spotlight
              </div>

              <div className="spotlight-canvas-area">
                <HangingCharm
                  charmSrc={activeCharm.src}
                  charmName={activeCharm.name}
                  size={90}
                  restLen={80}
                  hasBeads={true}
                  interactive={true}
                  onBless={() => triggerBlessing()}
                />
              </div>

              <div className="spotlight-info">
                <div className="spotlight-title">{activeCharm.name}</div>
                <div className="spotlight-blessing">{activeCharm.blessing}</div>
              </div>

              <button onClick={triggerBlessing} className="btn btn-secondary" style={{ width: '100%' }}>
                <Sparkles size={16} color="#f59e0b" />
                Bless Now (Ctrl + Q)
              </button>
            </div>

            {/* Right: Clickable Grid */}
            <div className="gallery-grid">
              {charmsList.map((c) => {
                const isActive = c.id === activeCharm.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveCharm(c);
                      playBlessingSound();
                    }}
                    className={`charm-card ${isActive ? 'active' : ''}`}
                  >
                    <div className={`charm-preview-wrap ${c.bg}`}>
                      <img
                        src={c.src}
                        alt={c.name}
                        className="charm-preview-img"
                        onError={(e) => {
                          e.target.src = `${BASE}assets/icon.png`;
                        }}
                      />
                    </div>
                    <div className="charm-name">{c.name}</div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Settings & Customizer Section */}
      <section className="section" id="settings">
        <div className="container">
          <div className="settings-preview-wrap">

            <div className="settings-pitch">
              <span className="badge badge-gold">
                <Sliders size={14} />
                Full Control
              </span>
              <h2 className="section-title">Fine-tune every stitch and swing.</h2>
              <p className="section-subtitle">
                Adjust cord length, dangle size, elastic stiffness, and oscillation damping directly from the floating settings window or system tray menu.
              </p>
              <ul>
                <li>
                  <span className="icon-badge">
                    <ImageIcon size={15} />
                  </span>
                  <span><strong>Custom Charms:</strong> Add and hang your own custom PNG, GIF, or SVG talisman images.</span>
                </li>
                <li>
                  <span className="icon-badge">
                    <MapPin size={15} />
                  </span>
                  <span><strong>3 Screen Anchor Points:</strong> Top-Right, Top-Center, or Top-Left.</span>
                </li>
                <li>
                  <span className="icon-badge">
                    <Sliders size={15} />
                  </span>
                  <span><strong>Flexible Dimensions:</strong> Length from 50px to 150px, size from 80px to 150px.</span>
                </li>
                <li>
                  <span className="icon-badge">
                    <Zap size={15} />
                  </span>
                  <span><strong>Custom Physics:</strong> From ultra-springy to calm Zen pendulum.</span>
                </li>
                <li>
                  <span className="icon-badge">
                    <Check size={15} />
                  </span>
                  <span><strong>Launch on Boot:</strong> Automatically start alongside Windows.</span>
                </li>
              </ul>
            </div>

            {/* Mockup Window */}
            <div className="mockup-window">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <div className="mockup-dot red" />
                  <div className="mockup-dot yellow" />
                  <div className="mockup-dot green" />
                </div>
                <div className="mockup-title">Hang On Settings & Customizer</div>
                <div style={{ width: '30px' }} />
              </div>

              <div className="mockup-body">
                <div className="mockup-row">
                  <div className="mockup-row-header">
                    <span>Hanging Cord Length</span>
                    <span style={{ color: '#0284c7' }}>90 px</span>
                  </div>
                  <div className="mockup-slider">
                    <div className="mockup-slider-fill" style={{ width: '55%' }} />
                    <div className="mockup-slider-thumb" style={{ left: '55%' }} />
                  </div>
                </div>

                <div className="mockup-row">
                  <div className="mockup-row-header">
                    <span>Talisman Size</span>
                    <span style={{ color: '#0284c7' }}>110 px</span>
                  </div>
                  <div className="mockup-slider">
                    <div className="mockup-slider-fill" style={{ width: '60%' }} />
                    <div className="mockup-slider-thumb" style={{ left: '60%' }} />
                  </div>
                </div>

                <div className="mockup-row">
                  <div className="mockup-row-header">
                    <span>Swing Elasticity</span>
                    <span style={{ color: '#0284c7' }}>10.0</span>
                  </div>
                  <div className="mockup-slider">
                    <div className="mockup-slider-fill" style={{ width: '50%' }} />
                    <div className="mockup-slider-thumb" style={{ left: '50%' }} />
                  </div>
                </div>

                <div className="mockup-toggles">
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>Harmonic Blessing Chimes</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Procedural audio on ritual trigger</div>
                  </div>
                  <div className="mockup-switch" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="section download-section" id="download">
        <div className="container">
          <div className="download-card">
            <img src={`${BASE}assets/icon.png`} alt="Hang On App Icon" className="download-icon" />

            <div>
              <h2 className="section-title">Ready to hang something lucky?</h2>
              <p className="section-subtitle" style={{ marginTop: '8px' }}>
                Get Hang On for Windows today. Free, open-source, and lightweight.
              </p>
            </div>

            <div className="download-buttons">
              <a
                href={`${BASE}downloads/Hang-On-Setup-1.0.0.exe`}
                download="Hang-On-Setup-1.0.0.exe"
                className="btn btn-primary btn-lg"
              >
                <Download size={20} />
                Download for Windows (.exe)
              </a>
            </div>

            <div className="download-meta">
              <span>
                <Package size={15} />
                Version 1.0.0
              </span>
              <span>•</span>
              <span>
                <Monitor size={15} />
                Windows 10 & 11 (64-bit)
              </span>
              <span>•</span>
              <span>
                <Scale size={15} />
                MIT License
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-tagline">
          Built instead of touching some grass.
        </div>
        <div style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 600 }}>
          Made by Dineesh · Unfortunately, there’s more{' '}
          <a
            href="https://dineeshm.vercel.app/"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 700 }}
          >
            Click here
          </a>
        </div>
        <div className="footer-links">
          <a href="https://github.com/dineesh07/HangOn" target="_blank" rel="noreferrer">GitHub Repository</a>
          <span>•</span>
          <a href="https://github.com/dineesh07/HangOn/releases" target="_blank" rel="noreferrer">Releases & Changelog</a>
          <span>•</span>
          <a href="https://github.com/dineesh07/HangOn/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License</a>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
          Hang On © 2026 Dineesh. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
