import React, { useRef, useEffect } from 'react';

interface ParticleTextProps {
  text: string;
}

class TextParticle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
  vx: number;
  vy: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 1.5 + 0.8;
    this.baseX = x;
    this.baseY = y;
    this.density = (Math.random() * 30) + 15; // Higher density for stronger push
    this.color = color;
    this.vx = 0;
    this.vy = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update(mouse: { x: number | null, y: number | null, radius: number }) {
    if (mouse.x != null && mouse.y != null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (mouse.radius - distance) / mouse.radius;
        const directionX = forceDirectionX * force * this.density;
        const directionY = forceDirectionY * force * this.density;

        // Playable push (stronger than minimal, less than explosive)
        this.vx -= directionX;
        this.vy -= directionY;
      }
    }

    // Smooth spring back to base position - lower value means looser, more fluid spring
    this.vx += (this.baseX - this.x) * 0.008; // Extremely slow return
    this.vy += (this.baseY - this.y) * 0.008;

    // Apply friction (higher friction value like 0.9 or 0.92 means they slide further before stopping)
    this.vx *= 0.92;
    this.vy *= 0.92;

    this.x += this.vx;
    this.y += this.vy;
  }
}

class AmbientParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 0.5;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update(mouse: { x: number | null, y: number | null, radius: number }, canvasWidth: number, canvasHeight: number) {
    if (mouse.x != null && mouse.y != null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (mouse.radius - distance) / mouse.radius;
        // Float away from mouse
        this.vx -= forceDirectionX * force * 0.2;
        this.vy -= forceDirectionY * force * 0.2;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Wrap around screen
    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;
  }
}

export const ParticleText: React.FC<ParticleTextProps> = ({ text }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let textParticles: TextParticle[] = [];
    let ambientParticles: AmbientParticle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 150 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const init = () => {
      canvas.width = container.clientWidth;
      canvas.height = Math.min(container.clientHeight, 400);

      textParticles = [];
      ambientParticles = [];
      const fontSize = Math.min(canvas.width / 4, 160);
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#00f0ff';

      ctx.fillStyle = 'white';
      ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0, y2 = textCoordinates.height; y < y2; y += 3) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x += 3) {
          if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
            const isAccent = Math.random() > 0.8;
            textParticles.push(new TextParticle(x, y, isAccent ? accentColor : `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`));
          }
        }
      }

      // Add ambient scattered particles
      const ambientCount = 100;
      for (let i = 0; i < ambientCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const isAccent = Math.random() > 0.8;
        const color = isAccent ? accentColor : `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
        ambientParticles.push(new AmbientParticle(x, y, color));
      }
    };

    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw text particles
      for (let i = 0; i < textParticles.length; i++) {
        textParticles[i].draw(ctx);
        textParticles[i].update(mouse);
      }

      // Update and draw ambient particles
      for (let i = 0; i < ambientParticles.length; i++) {
        ambientParticles[i].draw(ctx);
        ambientParticles[i].update(mouse, canvas.width, canvas.height);
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [text]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'auto' }} />
    </div>
  );
};
