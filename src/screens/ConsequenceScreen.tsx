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

        {/* NPC Companion Squad Card */}
        {currentConsequence.simulationState?.squadMembers && currentConsequence.simulationState.squadMembers.length > 0 && (
          <motion.div
            className={styles.squadCard}
            variants={itemVariants}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className={styles.squadHeader}>
              <div className={styles.squadTitle}>
                <span aria-hidden="true">👥</span>
                <span>NPC SURVIVAL SQUAD // COMPANION STATUS</span>
              </div>
              <span className={styles.squadCohesionBadge}>
                COHESION: {currentConsequence.simulationState.squadCohesion ?? 75}%
              </span>
            </div>

            <div className={styles.squadList}>
              {currentConsequence.simulationState.squadMembers.map((member) => (
                <div key={member.id} className={styles.squadMemberRow}>
                  <div className={styles.squadMemberTop}>
                    <span className={styles.squadMemberName}>
                      {member.name}
                      <span className={styles.squadRoleTag}>{member.role}</span>
                    </span>
                    <span
                      className={`${styles.squadMemberStatus} ${
                        member.status === 'SAFE'
                          ? styles.statusSafe
                          : member.status === 'STABLE'
                          ? styles.statusStable
                          : member.status === 'DISTRESSED'
                          ? styles.statusDistressed
                          : member.status === 'INJURED'
                          ? styles.statusInjured
                          : styles.statusCritical
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                  <div className={styles.squadMemberStats}>
                    <span>Trust: {member.trust}%</span>
                    <span>Stress: {member.stress}%</span>
                    <span>Safety: {member.safety}%</span>
                  </div>
                  {member.dialogue && (
                    <div className={styles.squadMemberBark}>
                      "{member.dialogue}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* City Brain Macro Environmental Impact Card */}
        {currentConsequence.simulationState?.cityBrain && (
          <motion.div
            className={styles.cityCard}
            variants={itemVariants}
            transition={{ duration: 0.46, ease: 'easeOut' }}
          >
            <div className={styles.cityHeader}>
              <div className={styles.cityTitle}>
                <span aria-hidden="true">🏙️</span>
                <span>CITY BRAIN // MUNICIPAL CRISIS IMPACT</span>
              </div>
              <span
                className={`${styles.cityMacroTag} ${
                  currentConsequence.simulationState.cityBrain.macroStatus === 'OPERATIONAL'
                    ? styles.cityMacroOperational
                    : currentConsequence.simulationState.cityBrain.macroStatus === 'STRAINED'
                    ? styles.cityMacroStrained
                    : styles.cityMacroCritical
                }`}
              >
                STATUS: {currentConsequence.simulationState.cityBrain.macroStatus}
              </span>
            </div>

            <div className={styles.cityGrid}>
              <div className={styles.cityMetric}>
                <span className={styles.cityMetricLabel}>INFRASTRUCTURE</span>
                <span className={styles.cityMetricValue}>
                  {currentConsequence.simulationState.cityBrain.infrastructureIntegrity}%
                </span>
              </div>
              <div className={styles.cityMetric}>
                <span className={styles.cityMetricLabel}>EMERGENCY ACCESS</span>
                <span className={styles.cityMetricValue}>
                  {currentConsequence.simulationState.cityBrain.emergencyAccess}%
                </span>
              </div>
              <div className={styles.cityMetric}>
                <span className={styles.cityMetricLabel}>UTILITY STABILITY</span>
                <span className={styles.cityMetricValue}>
                  {currentConsequence.simulationState.cityBrain.utilityStability}%
                </span>
              </div>
              <div className={styles.cityMetric}>
                <span className={styles.cityMetricLabel}>PUBLIC ORDER</span>
                <span className={styles.cityMetricValue}>
                  {currentConsequence.simulationState.cityBrain.publicOrder}%
                </span>
              </div>
            </div>

            <p className={styles.citySummaryText}>
              {currentConsequence.simulationState.cityBrain.macroSummary}
            </p>
          </motion.div>
        )}

        {/* Multi-Disaster Chain Card */}
        {currentConsequence.simulationState?.disasterChain &&
          currentConsequence.simulationState.disasterChain.chainSeverity !== 'NONE' && (
            <motion.div
              className={styles.chainCard}
              variants={itemVariants}
              transition={{ duration: 0.47, ease: 'easeOut' }}
            >
              <div className={styles.chainHeader}>
                <div className={styles.chainTitle}>
                  <span aria-hidden="true">⛓️</span>
                  <span>MULTI-DISASTER CHAIN // {currentConsequence.simulationState.disasterChain.chainTitle}</span>
                </div>
                <span
                  className={`${styles.chainSeverityBadge} ${
                    currentConsequence.simulationState.disasterChain.chainSeverity === 'ACTIVE'
                      ? styles.chainSeverityActive
                      : currentConsequence.simulationState.disasterChain.chainSeverity === 'IMMINENT'
                      ? styles.chainSeverityImminent
                      : styles.chainSeverityContained
                  }`}
                >
                  {currentConsequence.simulationState.disasterChain.chainSeverity}
                </span>
              </div>
              <p className={styles.chainText}>
                {currentConsequence.simulationState.disasterChain.containmentAction ||
                  currentConsequence.simulationState.disasterChain.chainDescription}
              </p>
            </motion.div>
          )}

        {/* Alternative Timeline ("What If?") Card */}
        {currentConsequence.alternativeBranch && (
          <motion.div
            className={styles.altCard}
            variants={itemVariants}
            transition={{ duration: 0.48, ease: 'easeOut' }}
          >
            <div className={styles.altHeader}>
              <div className={styles.altTitle}>
                <span aria-hidden="true">🔀</span>
                <span>ALTERNATIVE TIMELINE // WHAT IF?</span>
              </div>
              <span
                className={`${styles.altRegretTag} ${
                  currentConsequence.alternativeBranch.regretLevel === 'CRITICAL_MISTAKE_AVOIDED'
                    ? styles.regretAvoided
                    : currentConsequence.alternativeBranch.regretLevel === 'MISSED_OPTIMAL_PATH'
                    ? styles.regretMissed
                    : currentConsequence.alternativeBranch.regretLevel === 'OPTIMAL_CHOICE_MADE'
                    ? styles.regretOptimal
                    : styles.regretMarginal
                }`}
              >
                {currentConsequence.alternativeBranch.regretLevel.replace(/_/g, ' ')}
              </span>
            </div>

            <div className={styles.altChoiceBox}>
              <strong>Alternative Choice Evaluated:</strong> "{currentConsequence.alternativeBranch.choiceLabel}"
            </div>

            <div className={styles.altMetricsGrid}>
              <div className={styles.altMetricItem}>
                <span className={styles.altMetricLabel}>PROJECTED PANIC</span>
                <span className={styles.altMetricValue}>
                  {currentConsequence.alternativeBranch.projectedPanic}/100
                </span>
              </div>
              <div className={styles.altMetricItem}>
                <span className={styles.altMetricLabel}>PROJECTED HAZARD</span>
                <span className={styles.altMetricValue}>
                  {currentConsequence.alternativeBranch.projectedHazard}%
                </span>
              </div>
              <div className={styles.altMetricItem}>
                <span className={styles.altMetricLabel}>PROJECTED SAFETY</span>
                <span className={styles.altMetricValue}>
                  {currentConsequence.alternativeBranch.projectedSafety}%
                </span>
              </div>
              <div className={styles.altMetricItem}>
                <span className={styles.altMetricLabel}>SQUAD COHESION</span>
                <span className={styles.altMetricValue}>
                  {currentConsequence.alternativeBranch.projectedSquadCohesion}%
                </span>
              </div>
            </div>

            <p className={styles.altSummaryText}>
              {currentConsequence.alternativeBranch.divergenceSummary}
            </p>
          </motion.div>
        )}

        {/* Batch 7: AI Director Context & Atmospheric Flavor Card */}
        {((currentConsequence.aiDirectorEvent && currentConsequence.aiDirectorEvent !== 'NONE') || currentConsequence.aiTacticalAdvisory) && (
          <motion.div
            className={styles.aiDirectorCard}
            variants={itemVariants}
            transition={{ duration: 0.44, ease: 'easeOut' }}
          >
            <div className={styles.aiDirectorHeader}>
              <span className={styles.aiDirectorBadge}>AI DIRECTOR // CONTEXT</span>
              <span className={styles.aiDirectorSourceBadge}>
                {currentConsequence.aiDirectorSource === 'gemini'
                  ? 'GEMINI CREATIVE BRAIN'
                  : 'DETERMINISTIC FALLBACK'}
              </span>
            </div>
            <p className={styles.aiDirectorNarrativeText}>
              "{currentConsequence.aiTacticalAdvisory || 'Environmental corridor pressure detected. Maintain tactical focus on marked exit pathways.'}"
            </p>
            <div className={styles.aiDirectorDisclaimer}>
              * Non-authoritative atmospheric context. Safety truth is strictly governed by NDMA protocols below.
            </div>
          </motion.div>
        )}

        {/* Batch 9: Disaster Director // Pre-Venue Framework Card */}
        {currentConsequence.directorEventId && currentConsequence.directorEventId !== 'NONE' && (
          <motion.div
            className={styles.directorFrameworkCard}
            variants={itemVariants}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className={styles.directorFrameworkHeader}>
              <div className={styles.directorFrameworkTitle}>
                <span className={styles.directorFrameworkIcon} aria-hidden="true">🎬</span>
                <span>DISASTER DIRECTOR // PRE-VENUE FRAMEWORK</span>
              </div>
              <div className={styles.directorFrameworkBadges}>
                <span
                  className={`${styles.directorStatusBadge} ${
                    currentConsequence.directorExecutionStatus === 'STANDBY_FRAMEWORK'
                      ? styles.directorStatusStandby
                      : currentConsequence.directorExecutionStatus === 'EXECUTED'
                      ? styles.directorStatusExecuted
                      : styles.directorStatusBlocked
                  }`}
                >
                  {currentConsequence.directorExecutionStatus === 'STANDBY_FRAMEWORK'
                    ? 'STANDBY (PRE-VENUE)'
                    : currentConsequence.directorExecutionStatus}
                </span>
                <span className={styles.directorSourceBadge}>
                  SOURCE: {currentConsequence.directorSource || 'DETERMINISTIC'}
                </span>
              </div>
            </div>

            <div className={styles.directorEventBanner}>
              <div className={styles.directorEventLabel}>
                <strong>EVENT:</strong> {currentConsequence.directorEventLabel || currentConsequence.directorEventId}
              </div>
              <span className={styles.directorCategoryTag}>
                CATEGORY: {currentConsequence.directorEventCategory?.toUpperCase() || 'ENVIRONMENTAL'}
              </span>
            </div>

            <div className={styles.directorFrameworkGrid}>
              <div className={styles.directorFrameworkItem}>
                <span className={styles.directorFrameworkItemLabel}>TRIGGER REASON</span>
                <span className={styles.directorFrameworkItemVal}>
                  {currentConsequence.directorTriggerReason || 'Simulation telemetry threshold satisfied.'}
                </span>
              </div>
              <div className={styles.directorFrameworkItem}>
                <span className={styles.directorFrameworkItemLabel}>VALIDATION STATE</span>
                <span
                  className={`${styles.directorFrameworkItemVal} ${
                    currentConsequence.directorValidation === 'VALID'
                      ? styles.validationValid
                      : styles.validationBlocked
                  }`}
                >
                  {currentConsequence.directorValidation || 'VALID'}
                </span>
              </div>
            </div>

            {currentConsequence.directorImpactSummary && (
              <p className={styles.directorImpactText}>
                {currentConsequence.directorImpactSummary}
              </p>
            )}

            <div className={styles.directorFrameworkNotice}>
              🛡️ PRE-VENUE COMPLIANCE NOTICE: Full runtime adaptive branching is scheduled for the Round 2 offline final (3 Oct 2026). In this framework build, the Director is advisory and standing by. Safety truth remains 100% deterministic.
            </div>
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