// src/screens/ConsequenceScreen.tsx
// Displays immediate consequences of player action alongside authoritative NDMA insights.

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getScenario } from '../data';
import { getNode } from '../engine/scenarioRunner';
import type { DisasterType } from '../data/types';
import styles from './ConsequenceScreen.module.css';

const THEME_MAP: Record<DisasterType, string> = {
  earthquake: 'theme-earthquake',
  fire: 'theme-fire',
  flood: 'theme-flood',
};

export default function ConsequenceScreen() {
  const { disasterId } = useParams<{ disasterId: string }>();
  const navigate = useNavigate();

  const {
    activeDisaster,
    currentConsequence,
    advanceTo,
    setOutcome,
  } = useGameStore();

  const targetDisaster = (disasterId as DisasterType) || activeDisaster || 'earthquake';
  const scenario = getScenario(targetDisaster);

  const themeClass = THEME_MAP[targetDisaster] || 'theme-earthquake';

  // If no active consequence recorded, return to scenario
  if (!currentConsequence) {
    return (
      <div className={`${styles.screen} ${themeClass}`}>
        <div className={styles.container}>
          <p style={{ color: 'var(--color-cloud)' }}>No active consequence available.</p>
          <button
            className={styles.continueBtn}
            onClick={() => navigate(`/disaster/${targetDisaster}/scenario`)}
          >
            Return to Scenario
          </button>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    const nextNodeId = currentConsequence.nextNodeId;

    if (!scenario || !nextNodeId) {
      navigate(`/disaster/${targetDisaster}/report`);
      return;
    }

    const nextNode = getNode(scenario, nextNodeId);

    if (nextNode && nextNode.type === 'outcome') {
      setOutcome({
        survived: nextNode.survived,
        narrativeText: nextNode.narrativeText,
        nextNodeId: nextNode.nextNodeId,
      });
      navigate(`/disaster/${targetDisaster}/outcome`);
    } else {
      advanceTo(nextNodeId);
      navigate(`/disaster/${targetDisaster}/scenario`);
    }
  };

  return (
    <div className={`${styles.screen} ${themeClass} scanlines`}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header with status badge */}
        <header className={styles.header}>
          <span className={styles.eyebrow}>Decision Evaluation</span>
          <span
            className={`${styles.statusBadge} ${
              currentConsequence.isCorrect ? styles.statusOptimal : styles.statusSuboptimal
            }`}
          >
            {currentConsequence.isCorrect ? '✓ Optimal Protocol' : '⚠ High-Risk Action'}
          </span>
        </header>

        {/* Action Taken */}
        <div className={styles.actionTaken}>
          <strong>Action Taken:</strong> {currentConsequence.choiceLabel}
        </div>

        {/* Consequence Narrative */}
        <div className={styles.consequenceBox}>
          <div className={styles.consequenceHeading}>Immediate Outcome</div>
          <p className={styles.consequenceText}>{currentConsequence.consequenceText}</p>
        </div>

        {/* Authoritative Safety Insight */}
        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <span aria-hidden="true">🛡️</span>
            <span>Emergency Protocol Grounding</span>
          </div>
          <p className={styles.insightText}>{currentConsequence.insight}</p>
          <div className={styles.insightSource}>
            Official Source: {currentConsequence.insightSource}
          </div>
        </div>

        {/* Continue Action */}
        <div className={styles.footerActions}>
          <motion.button
            className={styles.continueBtn}
            onClick={handleContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue Simulation →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}