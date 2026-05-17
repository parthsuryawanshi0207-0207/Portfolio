import React, { useEffect, useRef } from 'react';

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()[]{}|<>/\\~`';

interface MatrixRainProps {
  active: boolean;
}

export const MatrixRain = ({ active }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 16;
    let cols = Math.floor(window.innerWidth / fontSize);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Each column tracks its current Y drop position
    const drops: number[] = Array(cols).fill(1).map(() => Math.random() * -50);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(window.innerWidth / fontSize);
      drops.length = 0;
      for (let i = 0; i < cols; i++) drops.push(Math.random() * -50);
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      // Fade the canvas with a translucent black rect — creates the trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading character is bright white-green
        ctx.fillStyle = '#aaffaa';
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillText(char, x, y);

        // Draw the character behind the lead in neon green
        if (drops[i] > 1) {
          ctx.fillStyle = '#00ff41';
          ctx.font = `${fontSize}px monospace`;
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(trailChar, x, y - fontSize);
        }

        // Reset column to top randomly once it goes past the bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 0.5; // Speed of the fall
      }

      animRef.current = requestAnimationFrame(draw);
    };

    // Clear canvas before starting
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1, // Above 3D canvas (z:0), below glassmorphism sections (z:10)
        pointerEvents: 'none',
      }}
    />
  );
};
