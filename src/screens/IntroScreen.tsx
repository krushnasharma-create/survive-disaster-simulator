// src/screens/IntroScreen.tsx
// Cinematic game intro — the first thing the player sees.
// Must immediately communicate: "This is a disaster survival simulation."
// Shown once per browser session.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicText } from '../components/CinematicText';
import { useGameStore } from '../store/gameStore';
import styles from './IntroScreen.module.css';

const TAGLINE =
  'Real emergencies. Real decisions. Real consequences.';

export default function IntroScreen() {
  const navigate = useNavigate();
  const markIntroSeen = useGameStore((s) => s.markIntroSeen);
  const [phase, setPhase] = useState<'alert' | 'title' | 'ready'>('alert');

  const handleAlertDone = () => setPhase('title');
  const handleTaglineDone = () => setPhase('ready');

  const handleStart = () => {
    markIntroSeen();
    navigate('/select');
  };

  return (
    <div className={`${styles.screen} scanlines`}>
      <div className={styles.content}>
        {/* — Emergency alert badge — */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className={styles.alert}>
            <CinematicText
              text="⚠ EMERGENCY PREPAREDNESS SIMULATION"
              speed={28}
              showCursor={false}
              onComplete={handleAlertDone}
            />
          </span>
        </motion.div>

        {/* — Main title — */}
        <AnimatePresence>
          {phase !== 'alert' && (
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 40, letterSpacing: '0.2em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.04em' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              SURVIVE
            </motion.h1>
          )}
        </AnimatePresence>

        {/* — Subtitle — */}
        <AnimatePresence>
          {phase !== 'alert' && (
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Disaster Response Simulator
            </motion.p>
          )}
        </AnimatePresence>

        {/* — Divider — */}
        <AnimatePresence>
          {phase !== 'alert' && (
            <motion.div
              className={styles.divider}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          )}
        </AnimatePresence>

        {/* — Tagline — */}
        <AnimatePresence>
          {phase !== 'alert' && (
            <motion.p
              className={styles.tagline}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <CinematicText
                text={TAGLINE}
                speed={40}
                showCursor={false}
                onComplete={handleTaglineDone}
              />
            </motion.p>
          )}
        </AnimatePresence>

        {/* — Start button — */}
        <AnimatePresence>
          {phase === 'ready' && (
            <motion.button
              className={styles.startBtn}
              onClick={handleStart}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Begin Simulation
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.footer}>
        GD-02 · Hack 2 Ignite · Disaster Preparedness Initiative
      </div>
    </div>
  );
}
