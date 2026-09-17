// src/screens/OutcomeScreen.tsx
// Displays the final scenario outcome and transitions to the Preparedness Report.

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { calculateScore } from '../engine/scoreCalculator';
import { getUiStrings } from '../i18n';
import type { DisasterType } from '../data/types';
import styles from './OutcomeScreen.module.css';

const THEME_MAP: Record<DisasterType, string> = {
  earthquake: 'theme-earthquake',
  fire: 'theme-fire',
  flood: 'theme-flood',
};

export default function OutcomeScreen() {
  const { disasterId } = useParams<{ disasterId: string }>();
  const navigate = useNavigate();

  const {
    activeDisaster,
    currentOutcome,
    decisions,
    finaliseScore,
    language,
  } = useGameStore();

  const targetDisaster = (disasterId as DisasterType) || activeDisaster || 'earthquake';
  const themeClass = THEME_MAP[targetDisaster] || 'theme-earthquake';
  const ui = getUiStrings(language);

  // Compute and finalize score on entering outcome
  useEffect(() => {
    const summary = calculateScore(decisions);
    finaliseScore(summary.score);
  }, [decisions, finaliseScore]);

  const handleViewReport = () => {
    navigate(`/disaster/${targetDisaster}/report`);
  };

  const isSurvived = currentOutcome?.survived ?? true;

  const outcomeText =
    currentOutcome?.narrativeText ||
    (isSurvived
      ? (language === 'hinglish'
        ? 'Aap surakshit khule maidan mein pahunch gaye hain. Emergency 112 services ne pahunch kar area ko cordon off kar diya hai.'
        : 'You successfully evacuated the building and reached open assembly grounds. NDRF personnel and emergency 112 services have secured the sector.')
      : ui.criticalOutcomeSubtext);

  return (
    <div className={`${styles.screen} ${themeClass} scanlines`}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={styles.statusIcon} aria-hidden="true">
          {isSurvived ? '🛡️' : '⚠️'}
        </span>

        <p className={`${styles.eyebrow} ${!isSurvived ? styles.eyebrowCritical : ''}`}>
          {ui.scenarioResolution}
        </p>

        <h1 className={styles.title}>
          {isSurvived ? ui.survivedEvacuated : ui.criticalIncident}
        </h1>

        <div className={`${styles.divider} ${!isSurvived ? styles.dividerCritical : ''}`} />

        <p className={styles.narrative}>{outcomeText}</p>

        <motion.button
          className={styles.reportBtn}
          onClick={handleViewReport}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {ui.viewReport}
        </motion.button>
      </motion.div>
    </div>
  );
}