import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../data';

interface Line {
  type: 'input' | 'output' | 'error';
  text: string;
}

const ASCII_SKILLS = portfolioData.skills.map(s => {
  const filled = Math.round(s.level / 5);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  return `  ${s.name.padEnd(20)} [${bar}] ${s.level}%`;
});

const COMMANDS: Record<string, string[]> = {
  help: [
    '  Available commands:',
    '  ──────────────────────────────────────',
    '  help       → show this help',
    '  about      → who is Parth?',
    '  skills     → ASCII skill chart',
    '  projects   → list all projects',
    '  contact    → get in touch',
    '  matrix     → you know what this does',
    '  clear      → clear terminal',
    '  exit       → close terminal',
    '',
    '  ── Easter Eggs ────────────────────────',
    '  Type "matrix" here or anywhere on site',
    '  ↑↑↓↓←→←→BA  → 8-bit Konami mode 🎮',
    '  Type "matrix" anywhere → green rain 🟩',
  ],
  about: [
    '  ╔══════════════════════════════════╗',
    '  ║         ABOUT PARTH              ║',
    '  ╚══════════════════════════════════╝',
    '',
    '  A passionate full-stack developer &',
    '  3D web artist obsessed with building',
    '  things that make people go "wow".',
    '',
    '  Currently: Building cool stuff 🚀',
    '  Status:    Available for work ✅',
  ],
  skills: [
    '  ╔══════════════════════════════════╗',
    '  ║           SKILL LEVELS           ║',
    '  ╚══════════════════════════════════╝',
    '',
    ...ASCII_SKILLS,
  ],
  projects: [
    '  ╔══════════════════════════════════╗',
    '  ║             PROJECTS             ║',
    '  ╚══════════════════════════════════╝',
    '',
    ...portfolioData.projects.flatMap(p => [
      `  ▶ ${p.title}`,
      `    ${p.description.slice(0, 60)}...`,
      `    Tech: ${p.tech.join(', ')}`,
      `    GitHub: ${p.github}`,
      '',
    ]),
  ],
  contact: [
    '  ╔══════════════════════════════════╗',
    '  ║          CONTACT INFO            ║',
    '  ╚══════════════════════════════════╝',
    '',
    `  📧 Email   : ${portfolioData.contact.email}`,
    `  💼 LinkedIn: ${portfolioData.contact.linkedin}`,
    `  🐙 GitHub  : ${portfolioData.contact.github}`,
  ],
  matrix: [
    '  Initiating Matrix protocol...',
    '  Wake up, Neo... 🐇',
    '  [MATRIX MODE ACTIVATED]',
  ],
};

export const Terminal = () => {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: '  Welcome to Parth\'s Portfolio Terminal v1.0' },
    { type: 'output', text: '  Type "help" to see available commands.' },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Toggle terminal on ` (backtick) key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Scroll to bottom on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const runCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLines: Line[] = [{ type: 'input', text: `parth@portfolio:~$ ${cmd}` }];

    if (trimmed === '') {
      // do nothing
    } else if (trimmed === 'clear') {
      setLines([]);
      setInput('');
      setHistory(h => [cmd, ...h]);
      setHistoryIdx(-1);
      return;
    } else if (trimmed === 'exit') {
      setOpen(false);
    } else if (trimmed === 'matrix') {
      COMMANDS.matrix.forEach(l => newLines.push({ type: 'output', text: l }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('matrixtoggle', { detail: true }));
        document.body.style.setProperty('--accent-color', '#00ff41');
      }, 800);
    } else if (COMMANDS[trimmed]) {
      COMMANDS[trimmed].forEach(l => newLines.push({ type: 'output', text: l }));
    } else {
      newLines.push({ type: 'error', text: `  command not found: ${trimmed}. Type "help" for commands.` });
    }

    newLines.push({ type: 'output', text: '' });
    setLines(l => [...l, ...newLines]);
    setInput('');
    setHistory(h => [cmd, ...h]);
    setHistoryIdx(-1);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(idx);
      setInput(history[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setInput(idx === -1 ? '' : history[idx]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={() => inputRef.current?.focus()}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(700px, 95vw)',
            height: '320px',
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(0, 255, 65, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 0 60px rgba(0,255,65,0.15), 0 40px 80px rgba(0,0,0,0.8)',
            zIndex: 9500,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '"Outfit", "Cascadia Code", "Fira Code", monospace',
            fontSize: '11.5px',
          }}
        >
          {/* Title bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(0,255,65,0.05)',
            borderBottom: '1px solid rgba(0,255,65,0.15)',
            flexShrink: 0,
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', cursor: 'pointer' }} onClick={() => setOpen(false)} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28ca41' }} />
            <span style={{ marginLeft: '0.5rem', color: 'rgba(0,255,65,0.6)', fontSize: '11px' }}>
              parth@portfolio — terminal
            </span>
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
              Press ` to toggle · ESC to close
            </span>
          </div>

          {/* Output */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', lineHeight: 1.7 }}>
            {lines.map((line, i) => (
              <div key={i} style={{
                color: line.type === 'input' ? '#00ff41'
                  : line.type === 'error' ? '#ff453a'
                  : 'rgba(255,255,255,0.8)',
                whiteSpace: 'pre',
                fontSize: line.type === 'input' ? '13px' : '12px',
              }}>
                {line.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input line */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1rem',
            borderTop: '1px solid rgba(0,255,65,0.15)',
            flexShrink: 0,
          }}>
            <span style={{ color: '#00ff41', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '13px' }}>
              parth@portfolio:~$
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#00ff41', fontFamily: 'inherit', fontSize: '13px',
                caretColor: '#00ff41',
              }}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
