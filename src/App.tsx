import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Scene3D } from './components/Scene3D';
import { CustomCursor } from './components/CustomCursor';
import { SmoothScroll } from './components/SmoothScroll';
import { Loader } from './components/Loader';
import { MatrixRain } from './components/MatrixRain';
import { GyroPermissionButton } from './components/GyroPermissionButton';

import Home from './pages/Home';
import Experience from './pages/Experience';
import TechStack from './pages/TechStack';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import Contact from './pages/Contact';
import { KonamiEgg } from './components/KonamiEgg';
import { Terminal } from './components/Terminal';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMatrix, setIsMatrix] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => setIsMatrix((e as CustomEvent).detail);
    window.addEventListener('matrixtoggle', handler);
    return () => window.removeEventListener('matrixtoggle', handler);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <SmoothScroll>
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      <MatrixRain active={isMatrix} />
      <KonamiEgg />
      <GyroPermissionButton />
      <Terminal />
      <CustomCursor />
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'var(--accent-color)',
          transformOrigin: '0%',
          scaleX,
          zIndex: 100
        }}
      />
      
      <Navigation />
      <ThemeSwitcher />
      <Scene3D />
      
      <main style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        <section id="home"><Home /></section>
        
        {/* Glassmorphism background container to beautifully blur the 3D scene when scrolling down */}
        <div style={{ 
          background: 'rgba(5, 5, 5, 0.75)', 
          backdropFilter: 'blur(30px)', 
          WebkitBackdropFilter: 'blur(30px)', 
          position: 'relative', 
          zIndex: 10, 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.8)',
          pointerEvents: 'auto',
          overflow: 'hidden'
        }}>
          {/* Ambient Gradient Orbs */}
          <motion.div 
            animate={{ 
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              scale: [1, 1.2, 0.8, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', top: '10%', left: '10%', width: '50vw', height: '50vw', background: 'var(--accent-color)', borderRadius: '50%', filter: 'blur(200px)', opacity: 0.15, zIndex: -1, pointerEvents: 'none' }}
          />
          <motion.div 
            animate={{ 
              x: [0, -150, 150, 0],
              y: [0, 150, -150, 0],
              scale: [1, 0.8, 1.3, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', bottom: '20%', right: '10%', width: '60vw', height: '60vw', background: 'var(--secondary-accent)', borderRadius: '50%', filter: 'blur(250px)', opacity: 0.1, zIndex: -1, pointerEvents: 'none' }}
          />
          
          <section id="experience"><Experience /></section>
          <section id="tech-stack"><TechStack /></section>
          <section id="projects"><Projects /></section>
          <section id="skills"><Skills /></section>
          <section id="contact"><Contact /></section>
        </div>
      </main>
    </SmoothScroll>
  );
}

export default App;
