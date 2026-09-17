import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { playTransition } from '../utils/audio';

interface Props {
  children: ReactNode;
  className?: string;
}

export function ScreenTransition({ children, className }: Props) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    playTransition();
  }, []);

  const variants = {
    initial: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.985, filter: 'brightness(0.85)' },
    animate: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, scale: 1, filter: 'brightness(1)' },
    exit: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, scale: 1.01, filter: 'brightness(0.7)' },
  };

  const transition = {
    duration: shouldReduceMotion ? 0.15 : 0.38,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };

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
