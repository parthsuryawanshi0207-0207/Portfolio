import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Lock scroll while loading
    document.body.style.overflow = 'hidden';

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoaded(true), 400); // Pause briefly at 100%
          setTimeout(() => {
            document.body.style.overflow = 'auto'; // Unlock scroll
            onComplete();
          }, 1500); // Wait for split animation
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 1; // Random glitchy jumps
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'auto' // block clicks underneath
          }}
        >
          {/* Top Panel sliding up */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: '-100vh' }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50vh', backgroundColor: '#050505', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          />
          {/* Bottom Panel sliding down */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: '100vh' }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50vh', backgroundColor: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}
          />
          
          {/* Percentage Counter */}
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'relative',
              zIndex: 10,
              fontSize: 'clamp(5rem, 15vw, 12rem)',
              fontWeight: 800,
              color: 'white',
              mixBlendMode: 'difference',
              fontVariantNumeric: 'tabular-nums',
              display: 'flex',
              alignItems: 'baseline'
            }}
          >
            {Math.min(progress, 100).toString().padStart(3, '0')}
            <span style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--accent-color)', marginLeft: '10px' }}>%</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
