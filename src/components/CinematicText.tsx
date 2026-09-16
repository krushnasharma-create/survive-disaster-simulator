// src/components/CinematicText.tsx
// Typewriter-style text reveal. Renders characters one at a time.
// Calls onComplete when all text is visible.

import { useState, useEffect, useRef } from 'react';
import styles from './CinematicText.module.css';

interface Props {
  text: string;
  speed?: number;        // ms per character
  onComplete?: () => void;
  showCursor?: boolean;
  className?: string;
}

export function CinematicText({
  text,
  speed = 35,
  onComplete,
  showCursor = true,
  className,
}: Props) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={`${styles.container} ${className ?? ''}`}>
      {displayed}
      {showCursor && !done && <span className={styles.cursor} aria-hidden="true" />}
    </span>
  );
}
