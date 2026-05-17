import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { portfolioData } from '../data';
import { HackerText } from '../components/HackerText';
import { GlitchText } from '../components/GlitchText';

const Experience = () => {
  const ref = useRef(null);
  const timelineRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.3 1"]
  });

  // For the SVG timeline draw progress
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });

  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // SVG path length is 100% — we animate pathLength from 0 to 1
  const pathLength = useTransform(timelineProgress, [0, 1], [0, 1]);
  const glowOpacity = useTransform(timelineProgress, [0, 0.1], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale: scaleProgress, opacity: opacityProgress, minHeight: '100vh', padding: '10rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <HackerText text="Experience & Leadership" className="heading-primary" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', margin: 0 }} />
      </div>

      {/* Timeline container */}
      <div ref={timelineRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4rem' }}>

        {/* Glowing SVG vertical line */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, transform: 'translateX(-50%)', width: '2px', pointerEvents: 'none', zIndex: 0 }}>
          {/* Background static line */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', borderRadius: '1px' }} />
          {/* Animated glowing line */}
          <motion.svg
            viewBox="0 0 2 1000"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: glowOpacity }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.line
              x1="1" y1="0" x2="1" y2="1000"
              stroke="var(--accent-color)"
              strokeWidth="2"
              filter="url(#glow)"
              style={{ pathLength }}
            />
          </motion.svg>
        </div>

        {portfolioData.experiences.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3, delay: i * 0.1 }}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '45%',
              alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
            }}
          >
            {/* Timeline dot */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.3, type: 'spring', stiffness: 500 }}
              style={{
                position: 'absolute',
                top: '2rem',
                [i % 2 === 0 ? 'right' : 'left']: '-5%',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'var(--accent-color)',
                boxShadow: '0 0 20px var(--accent-color), 0 0 40px var(--accent-color)',
                border: '3px solid #050505',
                zIndex: 2
              }}
            />
            <div
              className="card"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                padding: '2.5rem',
                borderRadius: '2rem'
              }}
            >
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
                <GlitchText text={exp.title} />
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent-color)', fontSize: '1.1rem', fontWeight: 600 }}>{exp.organization}</span>
                <span style={{ opacity: 0.7, fontSize: '1rem' }}>{exp.duration}</span>
              </div>
              <p style={{ lineHeight: 1.8, fontSize: '1.1rem', opacity: 0.8 }}>{exp.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Experience;

