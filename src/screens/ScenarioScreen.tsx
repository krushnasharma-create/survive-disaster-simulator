// src/screens/ScenarioScreen.tsx
// Core Scenario Decision Gameplay Screen.
// Supports 15s timed decisions, timeout game-over state, randomized choice presentation, and EN/Hinglish localization.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getScenario } from '../data';
import { getNode, evaluateChoice } from '../engine/scenarioRunner';
import { getConvergenceContext } from '../engine/simulationState';
import { CountdownTimer } from '../components/CountdownTimer';
import { DecisionPanel } from '../components/DecisionPanel';
import { EnvironmentalOverlay } from '../components/EnvironmentalOverlay';
import { useCountdown } from '../hooks/useCountdown';
import { getLocalizedScenario, getUiStrings } from '../i18n';
import { playTimerTick, playDisasterChoiceImpact, playPanicSpike } from '../utils/audio';
import { recordDecision as recordPersistenceDecision, startRun, failRun } from '../services/gamePersistenceService';
import type { DisasterType, DecisionNode } from '../data/types';
import styles from './ScenarioScreen.module.css';

const THEME_MAP: Record<DisasterType, string> = {
  earthquake: 'theme-earthquake',
  fire: 'theme-fire',
  flood: 'theme-flood',
};

const LABEL_MAP: Record<DisasterType, { en: string; hinglish: string }> = {
  earthquake: {
    en: 'Earthquake — Seismic Event Active',
    hinglish: 'Earthquake — Bhukamp Ka Sankat',
  },
  fire: {
    en: 'Structure Fire — Alarm Active',
    hinglish: 'Structure Fire — Aag Ka Sankat',
  },
  flood: {
    en: 'Flash Flood — Evacuation Warning',
    hinglish: 'Flash Flood — Baadh Ki Warning',
  },
};

export default function ScenarioScreen() {
  const { disasterId } = useParams<{ disasterId: string }>();
  const navigate = useNavigate();

  const {
    activeDisaster,
    activeScenarioId,
    currentNodeId,
    selectDisaster,
    advanceTo,
    recordDecision,
    setConsequence,
    setOutcome,
    decisions,
    simulationState,
    updateSimulationState,
    language,
    setLanguage,
    authUserId,
    activeRunId,
    setActiveRunId,
  } = useGameStore();

  const [isTimedOut, setIsTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const targetDisaster = (disasterId as DisasterType) || activeDisaster || 'earthquake';
  const effectiveScenarioKey = activeScenarioId || targetDisaster;
  const rawScenario = useMemo(() => getScenario(effectiveScenarioKey) || getScenario(targetDisaster), [effectiveScenarioKey, targetDisaster]);

  // Localized scenario
  const scenario = useMemo(() => {
    if (!rawScenario) return undefined;
    return getLocalizedScenario(rawScenario, language);
  }, [rawScenario, language]);

  const ui = useMemo(() => getUiStrings(language), [language]);

  // Dynamic Panic Band Color
  const panicBandColor = useMemo(() => {
    switch (simulationState.panicBand) {
      case 'CALM':
        return 'var(--color-safe, #39d353)';
      case 'CONTROLLED':
        return '#68d391';
      case 'ELEVATED':
        return 'var(--color-warning, #ecc94b)';
      case 'HIGH':
        return '#ed8936';
      case 'CRITICAL':
        return 'var(--color-danger, #f56565)';
    }
  }, [simulationState.panicBand]);

  // Dynamic Hazard Convergence & Advisory Context
  const convergenceContext = useMemo(
    () => getConvergenceContext(simulationState, targetDisaster),
    [simulationState, targetDisaster]
  );

  // Dynamic Environment Status Color
  const envStatusColor = useMemo(() => {
    switch (simulationState.environmentStatus) {
      case 'STABLE':
        return 'var(--color-safe, #39d353)';
      case 'ELEVATED':
        return 'var(--color-warning, #ecc94b)';
      case 'ESCALATING':
        return '#ed8936';
      case 'CRITICAL':
        return 'var(--color-danger, #f56565)';
      default:
        return 'var(--color-cloud)';
    }
  }, [simulationState.environmentStatus]);

  // Ensure active disaster is synchronized in store
  useEffect(() => {
    if (!activeDisaster && scenario) {
      selectDisaster(targetDisaster);
    }
  }, [activeDisaster, scenario, selectDisaster, targetDisaster]);

  // Initialize start node if not set
  useEffect(() => {
    if (scenario && !currentNodeId) {
      advanceTo(scenario.startNodeId);
    }
  }, [scenario, currentNodeId, advanceTo]);

  const activeNodeId = currentNodeId || scenario?.startNodeId || '';
  const currentNode = scenario ? getNode(scenario, activeNodeId) : undefined;

  // Handle outcome nodes encountered directly
  useEffect(() => {
    if (currentNode && currentNode.type === 'outcome') {
      setOutcome({
        survived: currentNode.survived,
        narrativeText: currentNode.narrativeText,
        nextNodeId: currentNode.nextNodeId,
      });
      navigate(`/disaster/${targetDisaster}/outcome`, { replace: true });
    }
  }, [currentNode, navigate, setOutcome, targetDisaster]);

  const decisionNode = currentNode && currentNode.type === 'decision'
    ? (currentNode as DecisionNode)
    : undefined;

  // Stable randomized choice order per decision node (prevents option 1 bias)
  const displayedChoices = useMemo(() => {
    if (!decisionNode) return [];
    const arr = [...decisionNode.choices];
    // Deterministic pseudo-random shuffle based on node id (prevents option 1 bias)
    let seed = 0;
    for (let i = 0; i < decisionNode.id.length; i++) {
      seed = (seed * 31 + decisionNode.id.charCodeAt(i)) >>> 0;
    }
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed + 0x6D2B79F5) >>> 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      const rnd = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      const j = Math.floor(rnd * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }, [decisionNode]);

  // Reset timeout state whenever activeNodeId changes
  useEffect(() => {
    setIsTimedOut(false);
  }, [activeNodeId]);

  // Time limit hook — 15 seconds limit with Panic Engine & Adaptive Difficulty modifiers, clamped to strict 10s floor
  const rawTimeLimit = decisionNode?.timeLimit;
  const timeLimit = rawTimeLimit
    ? Math.max(
        10,
        rawTimeLimit +
          simulationState.timerModifierSeconds +
          (simulationState.difficultyModifierSeconds || 0)
      )
    : undefined;

  const onTimerExpire = useCallback(() => {
    playTimerTick(0);
    setIsTimedOut(true);
  }, []);

  const { remaining, stop } = useCountdown({
    duration: timeLimit || 15,
    autoStart: Boolean(timeLimit),
    onExpire: onTimerExpire,
    resetKey: `${activeNodeId}_${retryCount}`,
  });

  // Handle choice selection with 150ms action commitment latch
  const handleSelectChoice = useCallback(
    (choiceId: string, remainingSeconds?: number) => {
      if (!decisionNode) return;
      stop(); // Immediately stop the timer to freeze countdown and clear interval

      const evalResult = evaluateChoice(decisionNode, choiceId, remainingSeconds, simulationState, targetDisaster);

      // Find the safer/optimal choice from existing scenario data if current choice was incorrect
      const optimalChoice = decisionNode.choices.find((c) => c.isCorrect);

      // Play physical disaster commitment audio
      playDisasterChoiceImpact(targetDisaster);

      // Auditory feedback: Alert chime on entering severe panic bands
      if (
        evalResult.nextSimulationState &&
        (evalResult.nextSimulationState.panicBand === 'HIGH' ||
          evalResult.nextSimulationState.panicBand === 'CRITICAL') &&
        evalResult.stateDelta.panicChange > 0
      ) {
        playPanicSpike(evalResult.nextSimulationState.panicBand);
      }

      recordDecision(evalResult.record);

      // Advance deterministic simulation state
      updateSimulationState(evalResult.stateDelta, evalResult.isCorrect);

      // Asynchronously queue decision persistence if authenticated (non-blocking)
      if (authUserId && activeRunId) {
        recordPersistenceDecision(
          activeRunId,
          authUserId,
          evalResult.record,
          decisions.length + 1,
          remainingSeconds
        );
      }

      setConsequence({
        consequenceText: evalResult.consequenceText,
        insight: evalResult.insight,
        insightSource: evalResult.insightSource,
        nextNodeId: evalResult.nextNodeId,
        isCorrect: evalResult.isCorrect,
        choiceLabel: evalResult.choice.label,
        optimalChoiceLabel: !evalResult.isCorrect && optimalChoice ? optimalChoice.label : undefined,
        simulationState: evalResult.nextSimulationState,
        stateDelta: evalResult.stateDelta,
        shiftSummary: evalResult.nextSimulationState?.lastShiftSummary,
        propagationSummary: evalResult.nextSimulationState?.propagationSummary,
        behaviorSummary: evalResult.stateDelta.behaviorSummary,
        behaviorSignal: evalResult.stateDelta.behaviorSignal,
        squadMembers: evalResult.nextSimulationState?.squadMembers,
        squadCohesion: evalResult.nextSimulationState?.squadCohesion,
        cityBrain: evalResult.nextSimulationState?.cityBrain,
        disasterChain: evalResult.nextSimulationState?.disasterChain,
        alternativeBranch: evalResult.stateDelta.alternativeBranch ?? evalResult.nextSimulationState?.alternativeBranch,
      });

      // Brief 150ms commitment pulse gives tactile weight to the decision before transition
      setTimeout(() => {
        navigate(`/disaster/${targetDisaster}/consequence`);
      }, 150);
    },
    [
      decisionNode,
      navigate,
      recordDecision,
      setConsequence,
      targetDisaster,
      authUserId,
      activeRunId,
      decisions.length,
      simulationState,
      updateSimulationState,
      stop,
    ]
  );

  // Urgency audio pulse for timed decision countdown
  useEffect(() => {
    if (timeLimit && remaining <= 5 && remaining > 0 && !isTimedOut) {
      playTimerTick(remaining);
    }
  }, [remaining, timeLimit, isTimedOut]);

  const handleRetryScenario = () => {
    setIsTimedOut(false);
    setRetryCount((prev) => prev + 1);

    // If authenticated, close previous timed-out run as 'failed' in background
    if (authUserId && activeRunId) {
      failRun(activeRunId, authUserId, 'failed');
    }

    // Reset local store scenario decisions and traversal
    const currentScenarioKey = activeScenarioId;
    if (currentScenarioKey) {
      useGameStore.getState().selectScenario(currentScenarioKey, targetDisaster);
    } else {
      selectDisaster(targetDisaster);
    }

    // Start a completely fresh game run for the new attempt
    if (authUserId) {
      const finalScenarioId = currentScenarioKey || `${targetDisaster}-urban`;
      const newRunId = startRun(authUserId, targetDisaster, finalScenarioId);
      setActiveRunId(newRunId);
    } else {
      setActiveRunId(null);
    }

    if (scenario) {
      advanceTo(scenario.startNodeId);
    }
  };

  const handleReturnToSelect = () => {
    setIsTimedOut(false);
    if (authUserId && activeRunId) {
      failRun(activeRunId, authUserId, 'abandoned');
      setActiveRunId(null);
    }
    navigate('/select');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hinglish' : 'en');
  };

  const themeClass = THEME_MAP[targetDisaster] || 'theme-earthquake';
  const labelText = LABEL_MAP[targetDisaster]?.[language] || LABEL_MAP[targetDisaster]?.en || 'Emergency Simulation';

  // Dedicated Timeout Screen
  if (isTimedOut) {
    return (
      <div className={`${styles.screen} ${themeClass} scanlines`}>
        <motion.div
          className={styles.timeoutContainer}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className={styles.timeoutAlertBadge}>
            ⚠ {ui.timeExpired}
          </span>

          <h1 className={styles.timeoutTitle}>{ui.timeExpired}</h1>

          <p className={styles.timeoutMessage}>{ui.timeoutMessage}</p>

          <div className={styles.timeoutStatus}>
            STATUS: {ui.simulationFailed}
          </div>

          <div className={styles.timeoutActions}>
            <button
              className={styles.timeoutPrimaryBtn}
              onClick={handleRetryScenario}
            >
              {ui.retryScenario}
            </button>
            <button
              className={styles.timeoutSecondaryBtn}
              onClick={handleReturnToSelect}
            >
              {ui.returnToSelect}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!scenario || !decisionNode) {
    return (
      <div className={`${styles.screen} ${themeClass}`}>
        <div className={styles.main}>
          <p className={styles.situation}>Loading scenario situation...</p>
        </div>
      </div>
    );
  }

  const stepNumber = decisions.length + 1;

  return (
    <div className={`${styles.screen} ${themeClass} scanlines`}>
      {/* Environmental Atmosphere & Urgency Overlay */}
      <EnvironmentalOverlay
        disasterType={targetDisaster}
        remainingSeconds={timeLimit ? remaining : 999}
        events={decisionNode.environmentEvents}
        active={true}
      />

      {/* HUD Header */}
      <header className={styles.hud}>
        <div className={styles.hudLeft}>
          <span className={styles.hudDisaster}>{labelText}</span>
          <span className={styles.hudBadge}>{ui.activeSimulation}</span>
        </div>
        <div className={styles.hudRight}>
          <button
            className={styles.langToggle}
            onClick={toggleLanguage}
            title="Switch Language (English / Hinglish)"
          >
            LANG: {language === 'en' ? 'ENGLISH' : 'HINGLISH'}
          </button>
          <span className={styles.hudNode}>
            {ui.decisionNumber} {String(stepNumber).padStart(2, '0')}
          </span>
        </div>
      </header>

      {/* Simulation Telemetry HUD Bar (Panic Engine + Environmental Integrity) */}
      <div className={styles.telemetryBar}>
        <div className={styles.telemetryGroup}>
          <div className={styles.panicHeader}>
            <span className={styles.telemetryLabel}>PSYCHOLOGICAL STRESS</span>
            <span
              className={styles.panicBadge}
              style={{ color: panicBandColor, borderColor: panicBandColor }}
            >
              {simulationState.panicBand} ({simulationState.panic}/100)
            </span>
          </div>
          <div className={styles.panicMeterTrack}>
            <div
              className={styles.panicMeterFill}
              style={{
                width: `${simulationState.panic}%`,
                backgroundColor: panicBandColor,
              }}
            />
          </div>
        </div>

        {(simulationState.timerModifierSeconds < 0 || (simulationState.difficultyModifierSeconds || 0) < 0) && (
          <div className={styles.timerPenaltyBadge}>
            ⚡ {Math.abs(simulationState.timerModifierSeconds + (simulationState.difficultyModifierSeconds || 0))}s PRESSURE
            {(simulationState.difficultyModifierSeconds || 0) < 0
              ? ` (PANIC + DIFF L${simulationState.difficultyLevel || 2})`
              : ' (PANIC)'}
          </div>
        )}
        {simulationState.timerModifierSeconds === 0 && (simulationState.difficultyModifierSeconds || 0) > 0 && (
          <div className={styles.timerGraceBadge}>
            ⏱ +{simulationState.difficultyModifierSeconds}s GRACE (DIFF L1)
          </div>
        )}

        <div className={styles.telemetryStats}>
          <span
            className={`${styles.statChip} ${styles.envChip}`}
            style={{ borderColor: envStatusColor }}
          >
            ENV: <strong style={{ color: envStatusColor }}>{simulationState.environmentStatus || 'STABLE'}</strong>
          </span>
          <span className={styles.statChip}>
            SQUAD: <strong>{simulationState.squadCohesion ?? 75}%</strong>
          </span>
          <span className={styles.statChip}>
            CITY: <strong>{simulationState.cityBrain?.macroStatus ?? 'OPERATIONAL'}</strong>
          </span>
          <span className={styles.statChip}>
            TRAIN: <strong>{simulationState.trainingBand || 'DEVELOPING'}</strong>
          </span>
          <span className={styles.statChip}>
            DIFF: <strong>L{simulationState.difficultyLevel || 2}/5</strong>
          </span>
          <span className={styles.statChip}>
            HAZARD: <strong>{simulationState.hazardLevel}%</strong>
          </span>
          <span className={styles.statChip}>
            SAFETY: <strong>{simulationState.safetyIntegrity}%</strong>
          </span>
          {simulationState.visibility < 100 && (
            <span className={styles.statChip}>
              VIS: <strong>{simulationState.visibility}%</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Situation & Decision Area */}
      <main className={styles.main}>
        {/* Historical Context & Disclaimer Banner */}
        {scenario.category === 'historical' && scenario.historicalMeta && (
          <div className={styles.historicalBanner}>
            <div className={styles.historicalHeader}>
              <span>📜 HISTORICAL SIMULATION // EDUCATIONAL RECONSTRUCTION</span>
              <span>·</span>
              <span>{scenario.historicalMeta.eventTitle}</span>
            </div>
            <p className={styles.historicalDisclaimer}>
              {scenario.historicalMeta.disclaimer}
            </p>
          </div>
        )}

        {/* Dynamic Hazard Convergence Advisory */}
        {convergenceContext.band !== 'LOW_RISK' && (
          <div
            className={`${styles.convergenceBanner} ${
              convergenceContext.band === 'CRITICAL_RISK'
                ? styles.convergenceCritical
                : convergenceContext.band === 'HIGH_RISK'
                ? styles.convergenceHigh
                : styles.convergenceModerate
            }`}
          >
            <div className={styles.convergenceHeader}>
              <span className={styles.convergenceIcon} aria-hidden="true">
                {convergenceContext.band === 'CRITICAL_RISK' ? '⚡' : '⚠'}
              </span>
              <span className={styles.convergenceTitle}>
                {convergenceContext.advisoryTitle}
              </span>
              <span className={styles.convergenceBadge}>
                {convergenceContext.environmentalModifier}
              </span>
            </div>
            <p className={styles.convergenceText}>{convergenceContext.advisoryText}</p>
          </div>
        )}

        {/* Multi-Disaster Secondary Hazard Chain Alert */}
        {simulationState.disasterChain &&
          (simulationState.disasterChain.chainSeverity === 'ACTIVE' ||
            simulationState.disasterChain.chainSeverity === 'IMMINENT') && (
            <div
              className={`${styles.chainBanner} ${
                simulationState.disasterChain.chainSeverity === 'ACTIVE'
                  ? styles.chainBannerActive
                  : styles.chainBannerImminent
              }`}
            >
              <div className={styles.chainBannerHeader}>
                <span className={styles.chainAlertIcon}>⚡</span>
                <span className={styles.chainAlertTitle}>
                  {simulationState.disasterChain.chainSeverity === 'ACTIVE'
                    ? 'SECONDARY DISASTER ACTIVE'
                    : 'SECONDARY THREAT IMMINENT'}
                  : {simulationState.disasterChain.chainTitle}
                </span>
                <span className={styles.chainAlertBadge}>
                  CHAIN STAGE {simulationState.disasterChain.chainStage}/2
                </span>
              </div>
              <p className={styles.chainBannerDesc}>
                {simulationState.disasterChain.chainDescription}
              </p>
            </div>
          )}

        {/* Situation Card */}
        <motion.div
          key={decisionNode.id + language}
          className={styles.situationCard}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <p className={styles.situation}>{decisionNode.situationText}</p>

          {decisionNode.contextHint && (
            <div className={styles.contextHint}>
              <span aria-hidden="true">⚡</span>
              <span>{decisionNode.contextHint}</span>
            </div>
          )}
        </motion.div>

        {/* Decision & Choice Section */}
        <div className={styles.decisionSection}>
          <div className={styles.decisionHeader}>
            <span className={styles.decisionLabel}>{ui.selectAction}</span>
          </div>

          {/* Countdown timer if node is timed (15s) */}
          {timeLimit && (
            <div style={{ marginBottom: '1rem' }}>
              <CountdownTimer
                remaining={remaining}
                total={timeLimit}
                label={ui.decideNow}
              />
            </div>
          )}

          {/* Decision Choices — Randomized Presentation Order */}
          <DecisionPanel
            key={decisionNode.id + language}
            choices={displayedChoices}
            onSelect={(choiceId) => handleSelectChoice(choiceId, remaining)}
          />
        </div>
      </main>
    </div>
  );
}