// src/components/ScreenTransition.tsx
// Wraps each screen in an AnimatePresence-compatible motion container.
// Provides the consistent cinematic fade+scale transition between all screens.

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

const variants = {
  initial:  { opacity: 0, scale: 0.98 },
  animate:  { opacity: 1, scale: 1 },
  exit:     { opacity: 0, scale: 1.01 },
};

const transition = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

export function ScreenTransition({ children, className }: Props) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
