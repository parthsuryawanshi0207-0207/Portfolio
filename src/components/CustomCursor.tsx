import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { initAudio } from '../utils/audio';
import { isTouchDevice } from '../utils/gyroscope';

interface InkParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
  thickness: number;
}

let particleId = 0;

export const CustomCursor = () => {
  // Hide completely on touch devices — they use touch ripple instead
  if (isTouchDevice()) return null;

  const [isClicking, setIsClicking] = useState(false);
  const [inkParticles, setInkParticles] = useState<InkParticle[]>([]);
  const lastPos = useRef({ x: -100, y: -100 });
  const lastTime = useRef(0);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const spawnInk = useCallback((x: number, y: number, speed: number) => {
    if (speed < 18) return;
    const count = Math.min(Math.floor(speed / 12), 8);
    const newParticles: InkParticle[] = Array.from({ length: count }, () => ({
      id: particleId++,
      x,
      y,
      angle: Math.random() * 360,
      length: 8 + Math.random() * speed * 0.4,
      thickness: 1 + Math.random() * 2,
    }));
    setInkParticles(prev => [...prev.slice(-40), ...newParticles]);
  }, []);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(now - lastTime.current, 1);
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt * 16;

      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      spawnInk(e.clientX, e.clientY, speed);

      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;
    };

    const handleMouseDown = () => { initAudio(); setIsClicking(true); };
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [spawnInk]);

  const springConfig = { stiffness: 1500, damping: 50, mass: 0.1 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  return (
    <>
      {/* Ink Splatter Particles */}
      <AnimatePresence>
        {inkParticles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scaleX: 1, scaleY: 1 }}
            animate={{ opacity: 0, scaleX: 0.2, scaleY: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onAnimationComplete={() =>
              setInkParticles(prev => prev.filter(pp => pp.id !== p.id))
            }
            style={{
              position: 'fixed',
              left: p.x,
              top: p.y,
              width: `${p.length}px`,
              height: `${p.thickness}px`,
              background: 'white',
              borderRadius: '2px',
              pointerEvents: 'none',
              zIndex: 9998,
              mixBlendMode: 'difference',
              transformOrigin: '0% 50%',
              transform: `translate(-50%, -50%) rotate(${p.angle}deg)`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Outer Ring */}
      <motion.div
        animate={{ scale: isClicking ? 0.5 : 1, borderWidth: isClicking ? '4px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        style={{
          position: 'fixed', left: 0, top: 0,
          x: cursorX, y: cursorY,
          width: '40px', height: '40px',
          borderRadius: '50%',
          border: '2px solid white',
          backgroundColor: 'transparent',
          pointerEvents: 'none', zIndex: 99999,
          translateX: '-50%', translateY: '-50%',
          mixBlendMode: 'difference',
        }}
      />
      {/* Inner Dot */}
      <motion.div
        animate={{ scale: isClicking ? 2 : 1, opacity: isClicking ? 0 : 1 }}
        style={{
          position: 'fixed', left: 0, top: 0,
          x: mouseX, y: mouseY,
          width: '8px', height: '8px',
          borderRadius: '50%',
          backgroundColor: 'white',
          pointerEvents: 'none', zIndex: 99999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
        }}
      />
    </>
  );
};
