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

        {/* Situation Shift (Butterfly Effect) Card */}
        {currentConsequence.simulationState && (
          <motion.div
            className={styles.shiftCard}
            variants={itemVariants}
            transition={{ duration: 0.42, ease: 'easeOut' }}
          >
            <div className={styles.shiftHeader}>
              <div className={styles.shiftTitle}>
                <span aria-hidden="true">⚡</span>
                <span>SITUATION SHIFT // BUTTERFLY EFFECT</span>
              </div>
              <span
                className={styles.shiftBandTag}
                style={{
                  color:
                    currentConsequence.simulationState.panicBand === 'CALM'
                      ? '#39d353'
                      : currentConsequence.simulationState.panicBand === 'CONTROLLED'
                      ? '#68d391'
                      : currentConsequence.simulationState.panicBand === 'ELEVATED'
                      ? '#ecc94b'
                      : currentConsequence.simulationState.panicBand === 'HIGH'
                      ? '#ed8936'
                      : '#f56565',
                  borderColor:
                    currentConsequence.simulationState.panicBand === 'CALM'
                      ? '#39d353'
                      : currentConsequence.simulationState.panicBand === 'CONTROLLED'
                      ? '#68d391'
                      : currentConsequence.simulationState.panicBand === 'ELEVATED'
                      ? '#ecc94b'
                      : currentConsequence.simulationState.panicBand === 'HIGH'
                      ? '#ed8936'
                      : '#f56565',
                }}
              >
                STRESS: {currentConsequence.simulationState.panicBand} ({currentConsequence.simulationState.panic}/100)
              </span>
            </div>

            <p className={styles.shiftSummary}>
              {currentConsequence.shiftSummary || currentConsequence.simulationState.lastShiftSummary}
            </p>

            <div className={styles.shiftMetricsGrid}>
              {currentConsequence.stateDelta && (
                <>
                  <span
                    className={`${styles.metricBadge} ${
                      currentConsequence.stateDelta.panicChange > 0
                        ? styles.metricBadgeDanger
                        : currentConsequence.stateDelta.panicChange < 0
                        ? styles.metricBadgeSafe
                        : styles.metricBadgeNeutral
                    }`}
                  >
                    {currentConsequence.stateDelta.panicChange > 0
                      ? `▲ +${currentConsequence.stateDelta.panicChange} Panic`
                      : currentConsequence.stateDelta.panicChange < 0
                      ? `▼ ${currentConsequence.stateDelta.panicChange} Panic`
                      : `● Panic Stable`}
                  </span>

                  <span
                    className={`${styles.metricBadge} ${
                      currentConsequence.stateDelta.hazardChange > 0
                        ? styles.metricBadgeWarning
                        : currentConsequence.stateDelta.hazardChange < 0
                        ? styles.metricBadgeSafe
                        : styles.metricBadgeNeutral
                    }`}
                  >
                    {currentConsequence.stateDelta.hazardChange > 0
                      ? `▲ +${currentConsequence.stateDelta.hazardChange}% Hazard`
                      : currentConsequence.stateDelta.hazardChange < 0
                      ? `▼ ${currentConsequence.stateDelta.hazardChange}% Hazard`
                      : `● Hazard Unchanged`}
                  </span>

                  <span
                    className={`${styles.metricBadge} ${
                      currentConsequence.stateDelta.safetyChange > 0
                        ? styles.metricBadgeSafe
                        : currentConsequence.stateDelta.safetyChange < 0
                        ? styles.metricBadgeDanger
                        : styles.metricBadgeNeutral
                    }`}
                  >
                    {currentConsequence.stateDelta.safetyChange > 0
                      ? `▲ +${currentConsequence.stateDelta.safetyChange}% Safety`
                      : currentConsequence.stateDelta.safetyChange < 0
                      ? `▼ ${currentConsequence.stateDelta.safetyChange}% Safety`
                      : `● Safety Stable`}
                  </span>

                  {currentConsequence.stateDelta.visibilityChange !== 0 && (
                    <span
                      className={`${styles.metricBadge} ${
                        currentConsequence.stateDelta.visibilityChange < 0
                          ? styles.metricBadgeWarning
                          : styles.metricBadgeSafe
                      }`}
                    >
                      {currentConsequence.stateDelta.visibilityChange < 0
                        ? `▼ ${currentConsequence.stateDelta.visibilityChange}% Visibility`
                        : `▲ +${currentConsequence.stateDelta.visibilityChange}% Visibility`}
                    </span>
                  )}
                </>
              )}
            </div>

            {currentConsequence.simulationState.timerModifierSeconds < 0 && (
              <div className={styles.shiftWarningBanner}>
                <span>⚠</span>
                <span>
                  {currentConsequence.simulationState.panicBand} STRESS PRESSURE: Heightened panic will compress your next decision window by {Math.abs(currentConsequence.simulationState.timerModifierSeconds)} seconds (min 10s floor).
                </span>
              </div>
            )}
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