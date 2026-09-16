// src/components/CountdownTimer.tsx
// Visible countdown bar + seconds readout. Used on timed decision nodes.

import styles from './CountdownTimer.module.css';

interface Props {
  remaining: number;
  total: number;
  className?: string;
}

export function CountdownTimer({ remaining, total, className }: Props) {
  const progress = Math.max(0, remaining / total) * 100;
  const isUrgent = remaining <= 5;

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} role="timer" aria-live="off">
      <div className={styles.header}>
        <span>Decide now</span>
        <span className={`${styles.seconds} ${isUrgent ? styles.urgent : ''}`}>
          {remaining}s
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.bar} ${isUrgent ? styles.urgent : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
