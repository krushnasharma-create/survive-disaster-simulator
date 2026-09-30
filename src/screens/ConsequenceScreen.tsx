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

            {/* Environmental Forward Propagation Trajectory */}
            {(currentConsequence.propagationSummary || currentConsequence.simulationState.propagationSummary) && (
              <div className={styles.propagationSection}>
                <div className={styles.propagationHeader}>
                  <div className={styles.propagationTitle}>
                    <span aria-hidden="true">🌐</span>
                    <span>FORWARD PROPAGATION // ENVIRONMENTAL TRAJECTORY</span>
                  </div>
                  {currentConsequence.simulationState.convergenceBand && (
                    <span
                      className={`${styles.convergenceTag} ${
                        currentConsequence.simulationState.convergenceBand === 'CRITICAL_RISK'
                          ? styles.convergenceCriticalTag
                          : currentConsequence.simulationState.convergenceBand === 'HIGH_RISK'
                          ? styles.convergenceHighTag
                          : currentConsequence.simulationState.convergenceBand === 'MODERATE_RISK'
                          ? styles.convergenceModerateTag
                          : styles.convergenceLowTag
                      }`}
                    >
                      {currentConsequence.simulationState.convergenceBand.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p className={styles.propagationText}>
                  {currentConsequence.propagationSummary || currentConsequence.simulationState.propagationSummary}
                </p>
              </div>
            )}

            {(currentConsequence.simulationState.timerModifierSeconds < 0 ||
              (currentConsequence.simulationState.difficultyModifierSeconds || 0) < 0) && (
              <div className={styles.shiftWarningBanner}>
                <span>⚠</span>
                <span>
                  {currentConsequence.simulationState.panicBand} STRESS PRESSURE: Combined decision window compressed by{' '}
                  {Math.abs(
                    currentConsequence.simulationState.timerModifierSeconds +
                      (currentConsequence.simulationState.difficultyModifierSeconds || 0)
                  )}
                  s (strict 10s safety floor enforced).
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Behavioral Response (Instinct vs Training & Adaptive Difficulty) */}
        {currentConsequence.simulationState && (
          <motion.div
            className={styles.behaviorCard}
            variants={itemVariants}
            transition={{ duration: 0.44, ease: 'easeOut' }}
          >
            <div className={styles.behaviorHeader}>
              <div className={styles.behaviorTitle}>
                <span aria-hidden="true">🧠</span>
                <span>BEHAVIORAL RESPONSE // INSTINCT VS TRAINING</span>
              </div>
              <span className={styles.difficultyTag}>
                DIFFICULTY: LVL {currentConsequence.simulationState.difficultyLevel || 2}/5
              </span>
            </div>

            <div className={styles.behaviorMetricsRow}>
              <div className={styles.behaviorMetric}>
                <span className={styles.behaviorMetricLabel}>INSTINCTIVE REFLEX</span>
                <span className={styles.behaviorMetricValue}>
                  {currentConsequence.simulationState.instinctBand || 'DEVELOPING'} (
                  {currentConsequence.simulationState.instinctScore ?? 50}/100)
                </span>
              </div>
              <div className={styles.behaviorMetric}>
                <span className={styles.behaviorMetricLabel}>PROTOCOL TRAINING</span>
                <span className={styles.behaviorMetricValue}>
                  {currentConsequence.simulationState.trainingBand || 'DEVELOPING'} (
                  {currentConsequence.simulationState.trainingScore ?? 50}/100)
                </span>
              </div>
              <div className={styles.behaviorMetric}>
                <span className={styles.behaviorMetricLabel}>OPERATOR PROFILE</span>
                <span className={styles.behaviorProfileValue}>
                  {(currentConsequence.simulationState.behaviorProfile || 'BALANCED_RESPONDER').replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className={styles.behaviorSummaryText}>
              {currentConsequence.behaviorSummary ||
                currentConsequence.simulationState.lastBehaviorSummary ||
                'Decision processed under deterministic behavioral evaluation.'}
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