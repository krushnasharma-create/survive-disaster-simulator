// src/screens/DisasterIntro.tsx
// Per-disaster cinematic intro. Establishes setting, atmosphere, urgency.
// Reads disaster ID from URL param. Navigates to /disaster/:id/scenario on proceed.
// NOTE: Actual scenario gameplay is NOT implemented yet (Phase 3).

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicText } from '../components/CinematicText';
import { useGameStore } from '../store/gameStore';
import type { DisasterType } from '../data/types';
import styles from './DisasterIntro.module.css';

interface DisasterConfig {
  theme: string;
  icon: string;
  title: string;
  setting: string;
  narrative: string;
}

const CONFIGS: Record<DisasterType, DisasterConfig> = {
  earthquake: {
    theme: 'theme-earthquake',
    icon: '🌍',
    title: 'Earthquake',
    setting: 'Urban apartment — 11:47 AM',
    narrative:
      'You are on the fourth floor of a residential building in the city. Without warning, the floor lurches beneath you. A deep, rolling shudder moves through the walls. You have seconds.',
  },
  fire: {
    theme: 'theme-fire',
    icon: '🔥',
    title: 'Fire',
    setting: 'Residential home — 02:13 AM',
    narrative:
      'You wake to the screech of a smoke alarm. The room is dark. There is heat near the door. Somewhere in the house, your family is asleep. You have moments.',
  },
  flood: {
    theme: 'theme-flood',
    icon: '🌊',
    title: 'Flood',
    setting: 'Suburban home — Flash flood warning active',
    narrative:
      'Your phone screams with an emergency alert. Through the window you see water moving fast down the street. The drains are overwhelmed. The warning says: act now.',
  },
};

export default function DisasterIntro() {
  const { disasterId } = useParams<{ disasterId: string }>();
  const navigate = useNavigate();
  const [textDone, setTextDone] = useState(false);

  const config = CONFIGS[disasterId as DisasterType];

  const selectDisaster = useGameStore((s) => s.selectDisaster);

  useEffect(() => {
    if (!config) navigate('/select', { replace: true });
  }, [config, navigate]);

  if (!config) return null;

  const handleProceed = () => {
    selectDisaster(disasterId as DisasterType);
    navigate(`/disaster/${disasterId}/scenario`);
  };

  return (
    <div className={`${styles.screen} ${config.theme}`}>
      <motion.p
        className={styles.badge}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {config.setting}
      </motion.p>

      <motion.div
        className={styles.icon}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        {config.icon}
      </motion.div>

      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {config.title}
      </motion.h1>

      <motion.div
        className={styles.divider}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      />

      <motion.p
        className={styles.narrative}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <CinematicText
          text={config.narrative}
          speed={30}
          onComplete={() => setTextDone(true)}
        />
      </motion.p>

      <AnimatePresence>
        {textDone && (
          <motion.button
            className={styles.proceed}
            onClick={handleProceed}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            Enter Scenario
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
