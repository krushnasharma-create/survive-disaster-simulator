// src/components/DecisionPanel.tsx
// Renders player choice buttons for a DecisionNode.
// Does NOT evaluate choices — that is the engine's job.

import { motion } from 'framer-motion';
import styles from './DecisionPanel.module.css';

interface Choice {
  id: string;
  label: string;
}

interface Props {
  choices: Choice[];
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
}

export function DecisionPanel({ choices, onSelect, disabled = false }: Props) {
  return (
    <div className={styles.panel}>
      {choices.map((choice, i) => (
        <motion.button
          key={choice.id}
          className={styles.choice}
          onClick={() => !disabled && onSelect(choice.id)}
          disabled={disabled}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
          whileTap={{ scale: 0.99 }}
          aria-label={`Option ${i + 1}: ${choice.label}`}
        >
          <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
          {choice.label}
        </motion.button>
      ))}
    </div>
  );
}
