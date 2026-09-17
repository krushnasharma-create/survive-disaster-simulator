import { useState } from 'react';
import { motion } from 'framer-motion';
import { playHover, playSelect } from '../utils/audio';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClick = (choiceId: string) => {
    if (disabled || selectedId) return;
    setSelectedId(choiceId);
    playSelect();
    onSelect(choiceId);
  };

  return (
    <div className={styles.panel}>
      {choices.map((choice, i) => {
        const isSelected = selectedId === choice.id;
        const isOther = selectedId !== null && !isSelected;

        return (
          <motion.button
            key={choice.id}
            className={`${styles.choice} ${isSelected ? styles.choiceSelected : ''} ${isOther ? styles.choiceDimmed : ''}`}
            onClick={() => handleClick(choice.id)}
            onMouseEnter={() => !disabled && !selectedId && playHover()}
            disabled={disabled || selectedId !== null}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: isOther ? 0.4 : 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
            whileTap={!selectedId ? { scale: 0.99 } : undefined}
            aria-label={`Option ${i + 1}: ${choice.label}`}
          >
            <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
            {choice.label}
            {isSelected && <span className={styles.lockedBadge}>ACTION COMMITTED</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
