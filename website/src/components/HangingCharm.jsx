import React, { useEffect, useRef } from 'react';
import { playBlessingSound } from '../audio';

export default function HangingCharm({
  charmSrc,
  charmName = 'Talisman',
  size = 110,
  restLen = 100,
  hasBeads = true,
  interactive = true,
  className = '',
  onBless,
}) {
  const pivotRef = useRef(null);
  const threadRef = useRef(null);
  const beadsRef = useRef(null);
  const charmRef = useRef(null);
  const imgRef = useRef(null);

  // Keep all high-frequency physics in ref to prevent React re-renders & jank
  const physRef = useRef({
    angle: 0,
    angularVelocity: 0,
    restLength: restLen,
    currentLength: restLen,
    lengthVelocity: 0,
    isDragging: false,
    history: [],
    lastTime: performance.now(),
  });

  useEffect(() => {
    physRef.current.restLength = restLen;
  }, [restLen]);

  // Blessing sparkle pulse trigger
  const triggerBless = () => {
    playBlessingSound();
    physRef.current.lengthVelocity += 32;
    physRef.current.angularVelocity += (Math.random() > 0.5 ? 1 : -1) * 3.0;

    if (imgRef.current) {
      imgRef.current.classList.remove('ritual-glow');
      void imgRef.current.offsetWidth; // force reflow
      imgRef.current.classList.add('ritual-glow');
    }
    if (onBless) onBless();
  };

  useEffect(() => {
    let animId;

    const updateDOM = (angleDeg, lenPx) => {
      const BEADS_STACK = 32;
      const threadAbove = Math.max(10, lenPx - BEADS_STACK);

      if (pivotRef.current) {
        pivotRef.current.style.transform = `rotate(${angleDeg}deg)`;
      }
      if (threadRef.current) {
        threadRef.current.style.height = `${threadAbove + (hasBeads ? BEADS_STACK : 0)}px`;
      }
      if (beadsRef.current) {
        beadsRef.current.style.transform = `translate3d(-50%, ${threadAbove}px, 0)`;
      }
      if (charmRef.current) {
        charmRef.current.style.transform = `translate3d(-50%, ${threadAbove + (hasBeads ? BEADS_STACK : 0) - 6}px, 0)`;
      }
    };

    const loop = (now) => {
      const p = physRef.current;
      const dt = Math.min((now - p.lastTime) / 1000, 0.035);
      p.lastTime = now;

      const springK = 10.0;
      const damping = 2.2;
      const stretchK = 95.0;
      const stretchDamping = 6.5;
      const MAX_ANGLE = 62;

      if (!p.isDragging) {
        // 1. Angular Pendulum Motion
        const angularAcc = -springK * (p.angle * Math.PI / 180) - damping * p.angularVelocity;
        p.angularVelocity += angularAcc * dt;
        p.angle += p.angularVelocity * (180 / Math.PI) * dt;
        p.angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, p.angle));

        // Organic idle breathing sway if resting
        if (Math.abs(p.angle) < 0.08 && Math.abs(p.angularVelocity) < 0.08) {
          p.angle = Math.sin(now / 1000 * 1.6) * 3.2;
        }

        // 2. Vertical Stretch Elasticity
        const displacement = p.currentLength - p.restLength;
        const lengthAcc = -stretchK * displacement - stretchDamping * p.lengthVelocity;
        p.lengthVelocity += lengthAcc * dt;
        p.currentLength += p.lengthVelocity * dt;

        if (Math.abs(displacement) < 0.15 && Math.abs(p.lengthVelocity) < 0.15) {
          p.currentLength = p.restLength;
          p.lengthVelocity = 0;
        }
      }

      updateDOM(p.angle, p.currentLength);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [hasBeads]);

  // Pointer drag interactions
  useEffect(() => {
    if (!interactive) return;

    const onPointerDown = (clientX, clientY) => {
      const p = physRef.current;
      p.isDragging = true;
      p.angularVelocity = 0;
      p.lengthVelocity = 0;
      p.history = [{ angle: p.angle, length: p.currentLength, t: performance.now() }];
    };

    const onPointerMove = (clientX, clientY) => {
      const p = physRef.current;
      if (!p.isDragging || !pivotRef.current) return;

      const rect = pivotRef.current.getBoundingClientRect();
      const px = rect.left + rect.width / 2;
      const py = rect.top;

      const dx = clientX - px;
      const dy = clientY - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Inverted angle calculation for intuitive left-left / right-right tracking
      const ang = -Math.atan2(dx, Math.max(12, dy)) * (180 / Math.PI);
      const MAX_ANGLE = 62;
      p.angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, ang));

      const minLen = 45;
      const maxLen = 220;
      p.currentLength = Math.max(minLen, Math.min(maxLen, dist - (size * 0.35)));

      p.history.push({ angle: p.angle, length: p.currentLength, t: performance.now() });
      if (p.history.length > 5) p.history.shift();
    };

    const onPointerUp = () => {
      const p = physRef.current;
      if (!p.isDragging) return;
      p.isDragging = false;

      if (p.history.length >= 2) {
        const a = p.history[0];
        const b = p.history[p.history.length - 1];
        const dt = Math.max((b.t - a.t) / 1000, 0.001);

        const degSpeed = (b.angle - a.angle) / dt;
        p.angularVelocity = Math.max(-14, Math.min(14, degSpeed * (Math.PI / 180)));

        const lenSpeed = (b.length - a.length) / dt;
        p.lengthVelocity = Math.max(-250, Math.min(250, lenSpeed));
      }
    };

    const handleMouseDown = (e) => {
      if (e.button !== 0) return;
      onPointerDown(e.clientX, e.clientY);
      e.preventDefault();
    };
    const handleMouseMove = (e) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => onPointerUp();

    const charmEl = charmRef.current;
    if (charmEl) {
      charmEl.addEventListener('mousedown', handleMouseDown);
      charmEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (charmEl) {
        charmEl.removeEventListener('mousedown', handleMouseDown);
        charmEl.removeEventListener('touchstart', handleTouchStart);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [interactive, size]);

  return (
    <div className={`web-canvas-container ${className}`}>
      <div ref={pivotRef} className="web-pivot">
        {/* Braided Golden Metallic Cord */}
        <div ref={threadRef} className="web-thread" />

        {/* Decorative Beads */}
        {hasBeads && (
          <div ref={beadsRef} className="web-beads-container">
            <div className="web-bead-white" />
            <div className="web-bead-eye" />
            <div className="web-bead-white" />
          </div>
        )}

        {/* Charm Wrapper */}
        <div
          ref={charmRef}
          className="web-charm"
          style={{ width: `${size}px`, height: `${size}px` }}
          onClick={triggerBless}
          title="Click to ring blessing or drag to swing"
        >
          <img
            ref={imgRef}
            src={charmSrc}
            alt={charmName}
            draggable="false"
            className="charm-image-layer"
          />
        </div>
      </div>
    </div>
  );
}
