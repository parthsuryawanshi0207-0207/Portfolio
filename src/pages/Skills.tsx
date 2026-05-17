import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface SkillBarProps {
  name: string;
  level: number;
  index: number;
}

const SkillBar = ({ name, level, index }: SkillBarProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = level / 60; // reach target in ~60 steps
    const interval = setInterval(() => {
      start += step;
      if (start >= level) { setCount(level); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [isInView, level]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.07, type: 'spring', bounce: 0.3 }}
      style={{ marginBottom: '2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>{name}</span>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-color)', fontVariantNumeric: 'tabular-nums' }}>
          {count}%
        </span>
      </div>
      {/* Track */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{ duration: 1, delay: index * 0.07 + 0.2, ease: [0.25, 1, 0.5, 1] }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, var(--accent-color), var(--secondary-accent))`,
            borderRadius: '99px',
            boxShadow: '0 0 12px var(--accent-color)',
          }}
        />
      </div>
    </motion.div>
  );
};

import { portfolioData } from '../data';
import { HackerText } from '../components/HackerText';

const Skills = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', padding: '10rem 2rem', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <HackerText text="Skills" className="heading-primary" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', margin: 0 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 5rem' }}>
        {portfolioData.skills.map((skill, i) => (
          <SkillBar key={skill.name} name={skill.name} level={skill.level} index={i} />
        ))}
      </div>
    </motion.div>
  );
};

export default Skills;
