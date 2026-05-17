import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const themes = [
    { id: 'theme1', name: 'Dark Neon' },
    { id: 'theme2', name: 'Minimal Mono' },
    { id: 'theme3', name: 'Cyberpunk' },
  ] as const;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 flex flex-col gap-2 p-3 rounded-2xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}
            >
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: theme === t.id ? 'var(--accent-color)' : 'transparent',
                    color: theme === t.id ? (t.id === 'theme2' ? '#fff' : '#000') : 'var(--text-color)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--accent-color)',
            color: '#000',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <Palette size={24} />
        </motion.button>
      </div>
    </div>
  );
};
