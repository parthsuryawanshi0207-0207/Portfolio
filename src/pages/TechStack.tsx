import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { portfolioData } from '../data';
import { playTickSound } from '../utils/audio';

const MagneticChip = ({ children }: { children: React.ReactNode }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    playTickSound();
  };

  return (
    <motion.div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-color)', color: '#000' }}
      whileTap={{ scale: 0.95 }}
      style={{
        padding: '1.2rem 2.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '3rem',
        fontSize: '1.2rem',
        fontWeight: 600,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        display: 'inline-block'
      }}
    >
      {children}
    </motion.div>
  );
};

import { HackerText } from '../components/HackerText';

const TechStack = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.2 1"]
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div 
      ref={ref}
      style={{ scale: scaleProgress, opacity: opacityProgress, minHeight: '100vh', padding: '10rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <HackerText text="Tech Stack" className="heading-primary" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', margin: 0 }} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
        {portfolioData.techStack.map((category, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'white', opacity: 0.9 }}>
              {category.category}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {category.items.map((item, itemIdx) => (
                <motion.div 
                  key={itemIdx}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25, delay: itemIdx * 0.05 }}
                >
                  <MagneticChip>
                    {item}
                  </MagneticChip>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TechStack;
