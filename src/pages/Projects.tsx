import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { portfolioData } from '../data';
import { HackerText } from '../components/HackerText';
import { playTickSound } from '../utils/audio';

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  github: string;
  live: string;
  color: string;
}

const TiltCard = ({ project }: { project: Project }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -12, y: dx * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playTickSound();
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: isHovered ? 1.03 : 1,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transition: 'box-shadow 0.3s ease',
        borderRadius: '1.5rem',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `1px solid ${isHovered ? project.color : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isHovered
          ? `0 0 40px ${project.color}33, 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`
          : '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding: '2.5rem',
        cursor: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glowing top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }} />

      {/* Subtle shine layer that moves with the tilt */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '1.5rem', pointerEvents: 'none',
        background: `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 + tilt.x * 2}%, rgba(255,255,255,0.04) 0%, transparent 70%)`,
      }} />

      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
        {project.title}
      </h2>
      <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.75, marginBottom: '2rem' }}>
        {project.description}
      </p>

      {/* Tech tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        {project.tech.map(t => (
          <span key={t} style={{
            padding: '0.3rem 0.9rem',
            borderRadius: '99px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: `${project.color}22`,
            border: `1px solid ${project.color}55`,
            color: project.color,
          }}>{t}</span>
        ))}
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {[{ label: '⌥ GitHub', href: project.github }, { label: '↗ Live', href: project.live }].map(link => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.08, backgroundColor: project.color, color: '#000' }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '99px',
              border: `1px solid ${project.color}77`,
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'white',
              background: 'transparent',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {link.label}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['0 1', '1.2 1'] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale, minHeight: '100vh', padding: '10rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <HackerText text="Projects" className="heading-primary" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', margin: 0 }} />
        <p style={{ opacity: 0.5, marginTop: '1rem', fontSize: '1.1rem' }}>
          Hover over the cards — they're watching your cursor 👁️
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {portfolioData.projects.map(project => (
          <TiltCard key={project.id} project={project} />
        ))}
      </div>
    </motion.div>
  );
};

export default Projects;
