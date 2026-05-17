import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PHRASES = [
  'Full-Stack Developer',
  'WebGL Enthusiast',
  'UI/UX Craftsman',
  'Open Source Contributor',
];

const Typewriter = () => {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const blink = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(blink);
  }, []);

  // Typewriter logic
  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < phrase.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setDisplayed(phrase.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, 55 + Math.random() * 40); // slight randomness feels natural
    } else if (!deleting && charIdx === phrase.length) {
      // Pause at end before deleting
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIdx > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayed(phrase.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, 28);
    } else if (deleting && charIdx === 0) {
      // Move to next phrase
      setDeleting(false);
      setPhraseIdx(i => (i + 1) % PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx]);

  return (
    <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
      {displayed}
      <span style={{
        opacity: showCursor ? 1 : 0,
        transition: 'opacity 0.1s',
        marginLeft: '2px',
        fontWeight: 300,
        color: 'var(--accent-color)',
      }}>|</span>
    </span>
  );
};

const Home = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, 40]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      pointerEvents: 'none',
    }}>
      {/* Typewriter subtitle — sits below the particle name in 3D */}
      <motion.div
        style={{ opacity, y, position: 'absolute', bottom: '18vh', textAlign: 'center', pointerEvents: 'none' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
          fontWeight: 300,
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          minHeight: '2em',
        }}>
          — <Typewriter /> —
        </p>
        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{ marginTop: '2.5rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', letterSpacing: '0.2em' }}
        >
          SCROLL ↓
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
