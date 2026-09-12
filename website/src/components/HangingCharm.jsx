import React, { useEffect, useRef } from 'react';
import { playBlessingSound } from '../audio';

export default function HangingCharm({
  charmSrc,
  charmName,
  size = 110,
  restLen = 100,
  hasBeads = true,
  interactive = true,
  className = '',
  onBless,
}) {
  const containerRef = useRef(null);
  const pivotRef = useRef(null);
  const threadRef = useRef(null);
  const beadsRef = useRef(null);
  const charmRef = useRef(null);
  const imgRef = useRef(null);

  // Physics state stored in refs to avoid React re-renders in animation loop
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

  // Update restLen if prop changes
  useEffect(() => {
    physRef.current.restLength = restLen;
  }, [restLen]);

  // Blessing sparkle pulse trigger
  const triggerBless = () => {
    playBlessingSound();
    physRef.current.lengthVelocity += 35;
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

    const updateDOM = (lenPx) => {
      const BEADS_STACK = 32;
      const threadAbove = Math.max(10, lenPx - BEADS_STACK);

      if (beadsRef.current) {
        beadsRef.current.style.top = `${threadAbove}px`;
      }
      if (threadRef.current) {
        threadRef.current.style.height = `${threadAbove + (hasBeads ? BEADS_STACK : 0)}px`;
      }
      if (charmRef.current) {
        charmRef.current.style.top = `${threadAbove + (hasBeads ? BEADS_STACK : 0) - 6}px`;
      }
      if (pivotRef.current) {
        pivotRef.current.style.transform = `rotate(${physRef.current.angle}deg)`;
      }
    };

    const loop = (now) => {
      const p = physRef.current;
      const dt = Math.min((now - p.lastTime) / 1000, 0.04);
      p.lastTime = now;

      const springK = 9.5;
      const damping = 2.0;
      const stretchK = 90;
      const stretchDamping = 6.0;
      const MAX_ANGLE = 60;

      if (!p.isDragging) {
        // 1. Angular Pendulum Motion
        const angularAcc = -springK * (p.angle * Math.PI / 180) - damping * p.angularVelocity;
        p.angularVelocity += angularAcc * dt;
        p.angle += p.angularVelocity * (180 / Math.PI) * dt;
        p.angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, p.angle));

        // Subtle idle breathing sway if resting
        if (Math.abs(p.angle) < 0.08 && Math.abs(p.angularVelocity) < 0.08) {
          p.angle = Math.sin(now / 1000 * 1.5) * 2.5;
        }

        // 2. Vertical Stretch Elasticity
        const displacement = p.currentLength - p.restLength;
        const lengthAcc = -stretchK * displacement - stretchDamping * p.lengthVelocity;
        p.lengthVelocity += lengthAcc * dt;
        p.currentLength += p.lengthVelocity * dt;

        if (Math.abs(displacement) < 0.2 && Math.abs(p.lengthVelocity) < 0.2) {
          p.currentLength = p.restLength;
          p.lengthVelocity = 0;
        }
      }

      updateDOM(p.currentLength);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [hasBeads]);

  // Global mouse / touch drag handlers
  useEffect(() => {
    if (!interactive) return;

    const handlePointerDown = (clientX, clientY) => {
      const p = physRef.current;
      p.isDragging = true;
      p.angularVelocity = 0;
      p.lengthVelocity = 0;
      p.history = [{ angle: p.angle, length: p.currentLength, t: performance.now() }];
    };

    const handlePointerMove = (clientX, clientY) => {
      const p = physRef.current;
      if (!p.isDragging || !pivotRef.current) return;

      const rect = pivotRef.current.getBoundingClientRect();
      const px = rect.left + rect.width / 2;
      const py = rect.top;

      const dx = clientX - px;
      const dy = clientY - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Inverted angle calculation for correct left-left / right-right tracking
      const ang = -Math.atan2(dx, Math.max(10, dy)) * (180 / Math.PI);
      const MAX_ANGLE = 60;
      p.angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, ang));

      const minLen = 45;
      const maxLen = 220;
      p.currentLength = Math.max(minLen, Math.min(maxLen, dist - (size * 0.3)));

      p.history.push({ angle: p.angle, length: p.currentLength, t: performance.now() });
      if (p.history.length > 5) p.history.shift();
    };

    const handlePointerUp = () => {
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

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      handlePointerDown(e.clientX, e.clientY);
      e.preventDefault();
    };

    const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    const onTouchStart = (e) => {
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    const charmEl = charmRef.current;
    if (charmEl) {
      charmEl.addEventListener('mousedown', onMouseDown);
      charmEl.addEventListener('touchstart', onTouchStart, { passive: true });
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      if (charmEl) {
        charmEl.removeEventListener('mousedown', onMouseDown);
        charmEl.removeEventListener('touchstart', onTouchStart);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [interactive, size]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex justify-center select-none ${className}`}
    >
      <div ref={pivotRef} className="web-pivot">
        <div ref={threadRef} className="web-thread" />
        {hasBeads && (
          <div ref={beadsRef} className="web-beads-container">
            <div className="web-bead-white" />
            <div className="web-bead-eye" />
            <div className="web-bead-white" />
          </div>
        )}
        <div
          ref={charmRef}
          className="web-charm"
          style={{ width: `${size}px`, height: `${size}px` }}
          onClick={triggerBless}
          title="Click to bless or drag to swing"
        >
          <img
            ref={imgRef}
            src={charmSrc}
            alt={charmName}
            className="w-full h-full object-contain pointer-events-none transition-transform duration-200"
          />
        </div>
      </div>
    </div>
  );
}
