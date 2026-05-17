import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const characters = '!<>-_\\/[]{}—=+*^?#_';

export const HackerText = ({ text, style, className }: { text: string, style?: React.CSSProperties, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) {
      setDisplayText(text.replace(/./g, ' '));
      return;
    }
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split("")
          .map((letter, index) => {
            if (letter === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 6; // Controls how fast it resolves (smaller = slower)
    }, 40);

    return () => clearInterval(interval);
  }, [isInView, text]);

  return (
    <motion.h1 
      ref={ref} 
      className={className} 
      style={style}
    >
      {displayText}
    </motion.h1>
  );
};
