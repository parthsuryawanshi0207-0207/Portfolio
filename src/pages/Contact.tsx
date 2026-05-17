import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { portfolioData } from '../data';
import { User, Code, Mail } from 'lucide-react';
import { playTickSound } from '../utils/audio';

const MagneticButton = ({ children, href }: { children: React.ReactNode, href: string }) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    playTickSound();
  };

  return (
    <motion.a
      ref={buttonRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '3rem',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        textDecoration: 'none',
        flex: '1 1 300px',
        minHeight: '200px',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '2rem',
        color: 'white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'var(--accent-color)' }}
    >
      {children}
    </motion.a>
  );
};

import { HackerText } from '../components/HackerText';

const Contact = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.8 1"]
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div 
      ref={ref}
      style={{ scale: scaleProgress, opacity: opacityProgress, minHeight: '100vh', padding: '10rem 2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
    >
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}>
        <HackerText text="Let's Connect" className="heading-primary" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', margin: 0 }} />
      </div>
      
      <p style={{ textAlign: 'center', marginBottom: '6rem', fontSize: '1.5rem', opacity: 0.8, maxWidth: '800px', margin: '0 auto 6rem auto' }}>
        I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <MagneticButton href={`mailto:${portfolioData.contact.email}`}>
          <Mail size={40} color="var(--accent-color)" />
          Email Me
        </MagneticButton>
        
        <MagneticButton href={portfolioData.contact.linkedin}>
          <User size={40} color="var(--accent-color)" />
          LinkedIn
        </MagneticButton>
        
        <MagneticButton href={portfolioData.contact.github}>
          <Code size={40} color="var(--accent-color)" />
          GitHub
        </MagneticButton>
      </div>
    </motion.div>
  );
};

export default Contact;
