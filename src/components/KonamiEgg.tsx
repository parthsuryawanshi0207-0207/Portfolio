import React, { useEffect, useState } from 'react';

const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a'
];

// Chiptune jingle synthesized via Web Audio
const playChiptune = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.09);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.1);
    });
  } catch (_) {}
};

export const KonamiEgg = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let progress: string[] = [];
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && active) {
        setActive(false);
        document.body.classList.remove('konami');
        return;
      }
      progress.push(e.key);
      if (progress.length > KONAMI.length) progress = progress.slice(-KONAMI.length);
      if (progress.join(',') === KONAMI.join(',')) {
        setActive(a => {
          const next = !a;
          if (next) { document.body.classList.add('konami'); playChiptune(); }
          else document.body.classList.remove('konami');
          return next;
        });
        progress = [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 99990, background: '#000', border: '4px solid #00ff00',
      padding: '0.8rem 2rem', fontFamily: '"Press Start 2P", monospace',
      fontSize: '0.8rem', color: '#00ff00',
      imageRendering: 'pixelated',
      boxShadow: '0 0 20px #00ff00',
      animation: 'konami-blink 1s step-end infinite'
    }}>
      ▶ CHEAT CODE ACTIVATED ◀ &nbsp;&nbsp; [ESC] to exit
    </div>
  );
};
