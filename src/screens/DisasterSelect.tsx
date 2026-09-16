// src/screens/DisasterSelect.tsx
// Atmospheric disaster selection screen.
// Three disaster cards — each with its own colour identity.
// Navigates to /disaster/:id/intro on selection.

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import type { DisasterType } from '../data/types';
import styles from './DisasterSelect.module.css';

interface DisasterCard {
  id: DisasterType;
  icon: string;
  title: string;
  tag: string;
  description: string;
  accent: string;
  glow: string;
}

const DISASTERS: DisasterCard[] = [
  {
    id: 'earthquake',
    icon: '🌍',
    title: 'Earthquake',
    tag: 'Seismic Event',
    description: 'The ground gives way. Seconds matter. Where you are determines if you survive.',
    accent: '#e8a020',
    glow: 'rgba(232, 160, 32, 0.2)',
  },
  {
    id: 'fire',
    icon: '🔥',
    title: 'Fire',
    tag: 'Structure Fire',
    description: 'Smoke fills the corridor. Every door is a decision. Every second costs you.',
    accent: '#ff4500',
    glow: 'rgba(255, 69, 0, 0.2)',
  },
  {
    id: 'flood',
    icon: '🌊',
    title: 'Flood',
    tag: 'Flash Flood',
    description: 'The water is rising. The alert is live. You have minutes to decide.',
    accent: '#00a8cc',
    glow: 'rgba(0, 168, 204, 0.2)',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function DisasterSelect() {
  const navigate = useNavigate();
  const selectDisaster = useGameStore((s) => s.selectDisaster);

  const handleSelect = (id: DisasterType) => {
    selectDisaster(id);
    navigate(`/disaster/${id}/intro`);
  };

  return (
    <div className={styles.screen}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className={styles.eyebrow}>Choose Your Scenario</p>
        <h1 className={styles.heading}>Select Disaster</h1>
      </motion.div>

      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {DISASTERS.map((d) => (
          <motion.button
            key={d.id}
            className={styles.card}
            variants={cardVariants}
            onClick={() => handleSelect(d.id)}
            style={
              {
                '--card-accent': d.accent,
                '--card-glow': d.glow,
              } as React.CSSProperties
            }
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Select ${d.title} scenario`}
          >
            <span className={styles.cardIcon} aria-hidden="true">{d.icon}</span>
            <span className={styles.cardTitle}>{d.title}</span>
            <span className={styles.cardTag}>{d.tag}</span>
            <p className={styles.cardDesc}>{d.description}</p>
            <span className={styles.cardArrow}>Enter scenario →</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
