import React, { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  style?: React.CSSProperties;
  className?: string;
}

export const GlitchText = ({ text, style, className }: GlitchTextProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      className={`glitch-text ${className || ''}`}
      data-text={text}
      style={style}
    >
      {text}
    </span>
  );
};
