import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getScenario } from '../data';
import { getNode } from '../engine/scenarioRunner';
import { getLocalizedScenario, getUiStrings } from '../i18n';
import { playConsequenceReveal } from '../utils/audio';
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
  const shouldReduceMotion = useReducedMotion();

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

  // Play consequence reveal audio on mounting
  useEffect(() => {
    if (currentConsequence) {
      playConsequenceReveal(currentConsequence.isCorrect);
    }
  }, [currentConsequence]);

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

  const itemVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <div className={`${styles.screen} ${themeClass} scanlines`}>
      <motion.div
        className={styles.container}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: shouldReduceMotion ? 0.05 : 0.15 }}
      >
        {/* Header with status badge */}
        <motion.header
          className={styles.header}
          variants={itemVariants}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <span className={styles.eyebrow}>{ui.decisionEvaluation}</span>
          <span
            className={`${styles.statusBadge} ${
              currentConsequence.isCorrect ? styles.statusOptimal : styles.statusSuboptimal
            }`}
          >
            {currentConsequence.isCorrect ? ui.optimalAction : ui.highRiskAction}
          </span>
        </motion.header>

        {/* Your Action */}
        <motion.div
          className={styles.actionTaken}
          variants={itemVariants}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <span className={styles.actionLabel}>{ui.yourAction}</span>
          <span className={styles.actionText}>{currentConsequence.choiceLabel}</span>
        </motion.div>

        {/* Consequence / New Risk Narrative */}
        <motion.div
          className={styles.consequenceBox}
          variants={itemVariants}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className={styles.consequenceHeading}>{ui.newRisk}</div>
          <p className={styles.consequenceText}>{currentConsequence.consequenceText}</p>
        </motion.div>

        {/* Safer Response — deterministic learning feedback for suboptimal decisions */}
        {!currentConsequence.isCorrect && currentConsequence.optimalChoiceLabel && (
          <motion.div
            className={styles.saferResponseCard}
            variants={itemVariants}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className={styles.saferResponseHeader}>
              <span aria-hidden="true">✓</span>
              <span>{ui.saferResponse}</span>
            </div>
            <p className={styles.saferResponseText}>
              {currentConsequence.optimalChoiceLabel}
            </p>
          </motion.div>
        )}

        {/* Authoritative Safety Insight */}
        <motion.div
          className={styles.insightCard}
          variants={itemVariants}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className={styles.insightHeader}>
            <span aria-hidden="true">🛡️</span>
            <span>{ui.protocolGrounding}</span>
          </div>
          <p className={styles.insightText}>{currentConsequence.insight}</p>
          <div className={styles.insightSource}>
            Official Source: {currentConsequence.insightSource}
          </div>
        </motion.div>

        {/* Continue Action */}
        <motion.div
          className={styles.footerActions}
          variants={itemVariants}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.button
            className={styles.continueBtn}
            onClick={handleContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {ui.continueSimulation}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}