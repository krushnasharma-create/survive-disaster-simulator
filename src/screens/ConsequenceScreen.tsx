// src/screens/ConsequenceScreen.tsx
// Displays immediate consequences of player action alongside authoritative NDMA insights.
// Fully localized with English and Hinglish language support.

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getScenario } from '../data';
import { getNode } from '../engine/scenarioRunner';
import { getLocalizedScenario, getUiStrings } from '../i18n';
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
    activeScenarioId,
    currentConsequence,
    advanceTo,
    setOutcome,
    language,
  } = useGameStore();

  const targetDisaster = (disasterId as DisasterType) || activeDisaster || 'earthquake';
  const effectiveScenarioKey = activeScenarioId || targetDisaster;
  const rawScenario = getScenario(effectiveScenarioKey) || getScenario(targetDisaster);
  const scenario = rawScenario ? getLocalizedScenario(rawScenario, language) : undefined;
  const ui = getUiStrings(language);

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
            {ui.returnToSelect}
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
          <span className={styles.eyebrow}>{ui.decisionEvaluation}</span>
          <span
            className={`${styles.statusBadge} ${
              currentConsequence.isCorrect ? styles.statusOptimal : styles.statusSuboptimal
            }`}
          >
            {currentConsequence.isCorrect ? ui.optimalAction : ui.highRiskAction}
          </span>
        </header>

        {/* Action Taken */}
        <div className={styles.actionTaken}>
          <strong>{ui.actionTakenLabel}</strong> {currentConsequence.choiceLabel}
        </div>

        {/* Consequence Narrative */}
        <div className={styles.consequenceBox}>
          <div className={styles.consequenceHeading}>{ui.immediateOutcome}</div>
          <p className={styles.consequenceText}>{currentConsequence.consequenceText}</p>
        </div>

        {/* Authoritative Safety Insight */}
        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <span aria-hidden="true">🛡️</span>
            <span>{ui.protocolGrounding}</span>
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
            {ui.continueSimulation}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}