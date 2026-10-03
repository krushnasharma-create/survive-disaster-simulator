// src/screens/ScenarioScreen.tsx
// Core Scenario Decision Gameplay Screen.
// Supports 15s timed decisions, timeout game-over state, randomized choice presentation, and EN/Hinglish localization.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { aiDirector, buildAiContext, adaptiveDirector, buildDirectorContext, getDirectorEvent, generateDeterministicGeminiFallback } from '../ai';
import { evaluateNextGasLeakEvent, getGasLeakEventByNodeId, getOpeningGasLeakNodeId, getGasLeakStory } from '../engine/gasLeakDirector';
import type { DisasterType, DecisionNode } from '../data/types';
import styles from './ScenarioScreen.module.css';

const THEME_MAP: Record<DisasterType, string> = {
  earthquake: 'theme-earthquake',
  fire: 'theme-fire',
  flood: 'theme-flood',
  gas_leak: 'theme-gas-leak',
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
  gas_leak: {
    en: 'Gas Leakage — Real-Time Director Active',
    hinglish: 'Gas Leakage — Real-Time Director Sakriya',
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
    aiDirectorState,
    updateAiDirectorState,
    language,
    setLanguage,
    authUserId,
    activeRunId,
    setActiveRunId,
    runSeed,
  } = useGameStore();

  const [isTimedOut, setIsTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [storyAcknowledged, setStoryAcknowledged] = useState(false);

  const targetDisaster = (disasterId as DisasterType) || activeDisaster || 'earthquake';
  const effectiveScenarioKey = activeScenarioId || targetDisaster;
  const rawScenario = useMemo(() => getScenario(effectiveScenarioKey) || getScenario(targetDisaster), [effectiveScenarioKey, targetDisaster]);

  // Localized scenario
  const scenario = useMemo(() => {
    if (!rawScenario) return undefined;
    return getLocalizedScenario(rawScenario, language);
  }, [rawScenario, language]);

  const ui = useMemo(() => getUiStrings(language), [language]);

  // Localized Panic Band
  const localizedPanicBand = useMemo(() => {
    switch (simulationState.panicBand) {
      case 'CALM': return ui.bandCalm;
      case 'CONTROLLED': return ui.bandControlled;
      case 'ELEVATED': return ui.bandElevated;
      case 'HIGH': return ui.bandHigh;
      case 'CRITICAL': return ui.bandCritical;
      default: return simulationState.panicBand;
    }
  }, [simulationState.panicBand, ui]);

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

  // Localized Environment Status
  const localizedEnvStatus = useMemo(() => {
    switch (simulationState.environmentStatus) {
      case 'STABLE': return ui.statusStable;
      case 'ELEVATED': return ui.bandElevated;
      case 'ESCALATING': return ui.statusEscalating;
      case 'CRITICAL': return ui.bandCritical;
      default: return simulationState.environmentStatus || ui.statusStable;
    }
  }, [simulationState.environmentStatus, ui]);

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

  // Initialize start node if not set (Fresh replay selects opening based on runSeed for gas_leak)
  useEffect(() => {
    if (scenario && !currentNodeId) {
      if (targetDisaster === 'gas_leak' && runSeed !== 0) {
        const openingNodeId = getOpeningGasLeakNodeId(runSeed);
        advanceTo(openingNodeId);
      } else {
        advanceTo(scenario.startNodeId);
      }
    }
  }, [scenario, currentNodeId, advanceTo, targetDisaster, runSeed]);

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

  // Reset timeout, submission, and story states whenever activeNodeId changes
  const isSubmittingRef = useRef(false);
  useEffect(() => {
    setIsTimedOut(false);
    isSubmittingRef.current = false;
    setStoryAcknowledged(false);
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

  // For Gas Leakage, timer only runs once the player has absorbed the unfolding story and pressed Assess & Respond
  const isActionActive = targetDisaster !== 'gas_leak' || storyAcknowledged;

  const { remaining, stop } = useCountdown({
    duration: timeLimit || 15,
    autoStart: Boolean(timeLimit) && isActionActive,
    onExpire: onTimerExpire,
    resetKey: `${activeNodeId}_${retryCount}_${storyAcknowledged ? 'action' : 'story'}`,
  });

  // Track node-specific narrative to guarantee per-request attribution and prevent leak across nodes
  const nodeNarrativeRef = useRef<{
    nodeId: string;
    narrativeText: string | null;
    source: 'gemini' | 'deterministic-fallback';
  }>({
    nodeId: '',
    narrativeText: null,
    source: 'deterministic-fallback',
  });

  // Batch 7: Asynchronous, non-blocking AI Director recommendation request
  useEffect(() => {
    if (!decisionNode) return;

    // Reset current node narrative tracking so previous node cannot leak
    nodeNarrativeRef.current = {
      nodeId: decisionNode.id,
      narrativeText: null,
      source: 'deterministic-fallback',
    };

    const aiCtx = buildAiContext(
      simulationState,
      decisionNode,
      effectiveScenarioKey,
      targetDisaster,
      decisions
    );
    let isCancelled = false;
    aiDirector.requestRecommendation(aiCtx).then((envelope) => {
      if (isCancelled) return;
      updateAiDirectorState({
        lastRecommendation: envelope.payload,
        activePressure: envelope.payload.boundedEvent,
        recommendationCount: aiDirector.getTelemetry().recommendationCount,
        acceptedCount: aiDirector.getTelemetry().acceptedCount,
        fallbackCount: aiDirector.getTelemetry().fallbackCount,
        jevAvailable: !envelope.deterministicFallbackUsed,
      });
    }).catch(() => {
      // Complete safety boundary: zero unhandled errors
    });

    // Layer 1: Gemini Creative atmospheric narration
    aiDirector.requestNarrative({
      type: 'ENVIRONMENTAL_ATMOSPHERE',
      context: aiCtx,
      language,
    }).then((envelope) => {
      if (isCancelled) return;
      if (nodeNarrativeRef.current.nodeId === decisionNode.id) {
        nodeNarrativeRef.current.narrativeText = envelope.payload.text;
        nodeNarrativeRef.current.source = envelope.deterministicFallbackUsed
          ? 'deterministic-fallback'
          : 'gemini';
      }
      updateAiDirectorState({
        lastNarrative: envelope.payload.text,
        geminiAvailable: !envelope.deterministicFallbackUsed,
      });
    }).catch(() => {
      // Complete safety boundary: zero unhandled errors
    });

    return () => {
      isCancelled = true;
    };
  }, [decisionNode, effectiveScenarioKey, targetDisaster, simulationState, decisions, language, updateAiDirectorState]);

  // Handle choice selection with 150ms action commitment latch
  const handleSelectChoice = useCallback(
    (choiceId: string, remainingSeconds?: number) => {
      if (!decisionNode || isSubmittingRef.current) return;
      isSubmittingRef.current = true;
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

      // Batch 7: Attach director recommendation telemetry to decision record
      const currentDirector = aiDirector.getTelemetry();
      const directorEvent = currentDirector.activePressure !== 'NONE' ? currentDirector.activePressure : undefined;
      const directorAdvisory = currentDirector.lastRecommendation?.tacticalAdvisory;

      // Batch 7 & 11: Robust per-request narrative resolution
      // If player commits choice before the in-flight Gemini request finishes,
      // use deterministic fallback for this node (no wait, no leak from previous nodes).
      const currentNodeNarrative = nodeNarrativeRef.current;
      let effectiveNarrative: string;
      let effectiveSource: 'gemini' | 'deterministic-fallback';

      if (currentNodeNarrative.nodeId === decisionNode.id && currentNodeNarrative.narrativeText) {
        effectiveNarrative = currentNodeNarrative.narrativeText;
        effectiveSource = currentNodeNarrative.source;
      } else {
        const aiCtx = buildAiContext(
          simulationState,
          decisionNode,
          effectiveScenarioKey,
          targetDisaster,
          decisions
        );
        const fallbackEnvelope = generateDeterministicGeminiFallback({
          type: 'ENVIRONMENTAL_ATMOSPHERE',
          context: aiCtx,
          language,
        });
        effectiveNarrative = fallbackEnvelope.payload.text;
        effectiveSource = 'deterministic-fallback';
      }

      // Batch 9: Live Adaptive Disaster Director — Pre-Venue Framework Evaluation
      const currentStep = decisions.length + 1;
      const directorCtx = buildDirectorContext(
        simulationState,
        effectiveScenarioKey,
        targetDisaster,
        decisionNode.id,
        currentStep,
        adaptiveDirector.getRecentEvents()
      );
      const directorExecResult = adaptiveDirector.evaluateStep(directorCtx);
      const directorEventDef = getDirectorEvent(directorExecResult.eventId);

      const validationState: 'VALID' | 'REJECTED' | 'COOLDOWN_BLOCKED' =
        directorExecResult.validation.valid
          ? 'VALID'
          : directorExecResult.status === 'COOLDOWN_BLOCKED'
          ? 'COOLDOWN_BLOCKED'
          : 'REJECTED';

      // Batch Gas Leakage: Evaluate Next Dynamic Event via Gas Leak Event Director
      if (targetDisaster === 'gas_leak') {
        const sim = evalResult.nextSimulationState || simulationState;
        if (sim) {
          const nextGasEvent = evaluateNextGasLeakEvent(
            sim,
            decisionNode.id,
            decisions.length + 1,
            [...decisions.map((d) => d.nodeId), decisionNode.id],
            runSeed
          );
          evalResult.nextNodeId = nextGasEvent.nodeId;
        }
      }

      const currentGasEvent = targetDisaster === 'gas_leak' ? getGasLeakEventByNodeId(decisionNode.id) : null;

      const recordWithAi = {
        ...evalResult.record,
        aiDirectorEvent: directorEvent,
        aiTacticalAdvisory: directorAdvisory,
        aiNarrativeContext: effectiveNarrative,
        aiFallbackUsed: effectiveSource === 'deterministic-fallback' || currentDirector.fallbackCount > 0,
        directorEventId: currentGasEvent?.eventId || directorExecResult.eventId,
        directorEventCategory: currentGasEvent ? 'hazardous_materials' : directorEventDef?.category,
        directorSource: currentGasEvent ? ('DETERMINISTIC' as const) : directorExecResult.source,
        directorValidation: validationState,
        directorExecutionStatus: directorExecResult.status,
        directorTriggerReason: currentGasEvent?.defaultReason || directorExecResult.triggerReason,
        directorImpactSummary: currentGasEvent ? `Severity: ${currentGasEvent.severity}` : directorExecResult.narrativeSummary,
      };

      recordDecision(recordWithAi);

      // Advance deterministic simulation state
      updateSimulationState(evalResult.stateDelta, evalResult.isCorrect);

      // Asynchronously queue decision persistence if authenticated (non-blocking)
      if (authUserId && activeRunId) {
        recordPersistenceDecision(
          activeRunId,
          authUserId,
          recordWithAi,
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
        aiDirectorEvent: directorEvent,
        aiTacticalAdvisory: directorAdvisory,
        aiNarrativeContext: effectiveNarrative,
        aiDirectorSource: effectiveSource,
        directorEventId: directorExecResult.eventId,
        directorEventLabel: directorEventDef?.label,
        directorEventCategory: directorEventDef?.category,
        directorSource: directorExecResult.source,
        directorValidation: validationState,
        directorExecutionStatus: directorExecResult.status,
        directorTriggerReason: directorExecResult.triggerReason,
        directorImpactSummary: directorExecResult.narrativeSummary,
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
      effectiveScenarioKey,
      authUserId,
      activeRunId,
      decisions,
      simulationState,
      updateSimulationState,
      stop,
      language,
      runSeed,
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
          <p className={styles.situation}>
            {language === 'hinglish' ? 'Scenario load ho raha hai...' : 'Loading scenario situation...'}
          </p>
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

      {/* Simulation Telemetry HUD Bar (Progressive Disclosure: Layer 1 + Layer 2) */}
      <div className={styles.telemetryBar}>
        {/* Layer 1: Primary Compact Telemetry Strip (Always Visible) */}
        <div className={styles.compactTelemetryStrip}>
          <div className={styles.compactBadgesGroup}>
            <span
              className={styles.compactStressBadge}
              style={{ color: panicBandColor, borderColor: panicBandColor }}
            >
              {ui.stressLevel}: <strong>{localizedPanicBand}</strong> ({simulationState.panic}/100)
            </span>

            <span className={styles.compactHazardBadge}>
              {ui.hazardLevel}: <strong>{simulationState.hazardLevel}%</strong>
            </span>

            {(simulationState.timerModifierSeconds < 0 || (simulationState.difficultyModifierSeconds || 0) < 0) && (
              <div className={styles.timerPenaltyBadge}>
                ⚡ {Math.abs(simulationState.timerModifierSeconds + (simulationState.difficultyModifierSeconds || 0))}s {ui.timePressure}
                {(simulationState.difficultyModifierSeconds || 0) < 0
                  ? ` (${ui.stressLevel} + ${ui.difficultyLevel} L${simulationState.difficultyLevel || 2})`
                  : ` (${ui.stressLevel})`}
              </div>
            )}
            {simulationState.timerModifierSeconds === 0 && (simulationState.difficultyModifierSeconds || 0) > 0 && (
              <div className={styles.timerGraceBadge}>
                ⏱ +{simulationState.difficultyModifierSeconds}s {ui.timeGrace} ({ui.difficultyLevel} L1)
              </div>
            )}
          </div>

          <button
            type="button"
            className={`${styles.statusToggleBtn} ${showSystemStatus ? styles.statusToggleBtnActive : ''}`}
            onClick={() => setShowSystemStatus((prev) => !prev)}
            aria-expanded={showSystemStatus}
            title={showSystemStatus ? ui.hideDetails : ui.showDetails}
          >
            <span>{showSystemStatus ? '▲' : '▼'}</span>
            <span>{ui.systemStatus}</span>
          </button>
        </div>

        {/* Layer 2: Secondary System Status Drawer (Collapsed by Default) */}
        {showSystemStatus && (
          <div className={styles.systemStatusDrawer}>
            <div className={styles.telemetryGroup}>
              <div className={styles.panicHeader}>
                <span className={styles.telemetryLabel}>{ui.psychologicalStress}</span>
                <span
                  className={styles.panicBadge}
                  style={{ color: panicBandColor, borderColor: panicBandColor }}
                >
                  {localizedPanicBand} ({simulationState.panic}/100)
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

            <div className={styles.telemetryStats}>
              <span
                className={`${styles.statChip} ${styles.envChip}`}
                style={{ borderColor: envStatusColor }}
              >
                {ui.environmentalIntegrity}: <strong style={{ color: envStatusColor }}>{localizedEnvStatus}</strong>
              </span>
              <span className={styles.statChip}>
                {ui.squadCohesion}: <strong>{simulationState.squadCohesion ?? 75}%</strong>
              </span>
              <span className={styles.statChip}>
                {ui.cityStatus}: <strong>{simulationState.cityBrain?.macroStatus ?? 'OPERATIONAL'}</strong>
              </span>
              <span className={styles.statChip}>
                {ui.trainingPace}: <strong>{simulationState.trainingBand || 'DEVELOPING'}</strong>
              </span>
              <span className={styles.statChip}>
                {ui.difficultyLevel}: <strong>L{simulationState.difficultyLevel || 2}/5</strong>
              </span>
              <span className={styles.statChip}>
                {ui.hazardLevel}: <strong>{simulationState.hazardLevel}%</strong>
              </span>
              <span className={styles.statChip}>
                {ui.safetyIntegrity}: <strong>{simulationState.safetyIntegrity}%</strong>
              </span>
              {simulationState.visibility < 100 && (
                <span className={styles.statChip}>
                  {ui.visibility}: <strong>{simulationState.visibility}%</strong>
                </span>
              )}
              <span
                className={`${styles.statChip} ${styles.directorChip}`}
                title="Adaptive Disaster Director Framework (Pre-Venue Standby)"
              >
                {ui.directorLabel}: <strong className={styles.directorStandbyText}>{ui.directorStandby}</strong> <span className={styles.directorModeTag}>{ui.directorPreVenue}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Situation & Decision Area */}
      <main className={styles.main}>
        {/* Historical Context & Disclaimer Banner */}
        {scenario.category === 'historical' && scenario.historicalMeta && (
          <div className={styles.historicalBanner}>
            <div className={styles.historicalHeader}>
              <span>
                {language === 'hinglish'
                  ? '📜 ITIHASIK SIMULATION // SHIKSHA HETU RECONSTRUCTION'
                  : '📜 HISTORICAL SIMULATION // EDUCATIONAL RECONSTRUCTION'}
              </span>
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
                    ? (language === 'hinglish' ? 'DVITEEYAK SANKAT CHALU' : 'SECONDARY DISASTER ACTIVE')
                    : (language === 'hinglish' ? 'DVITEEYAK KHATRA ASANNA' : 'SECONDARY THREAT IMMINENT')}
                  : {simulationState.disasterChain.chainTitle}
                </span>
                <span className={styles.chainAlertBadge}>
                  {language === 'hinglish' ? 'CHAIN CHARAN' : 'CHAIN STAGE'} {simulationState.disasterChain.chainStage}/2
                </span>
              </div>
              <p className={styles.chainBannerDesc}>
                {simulationState.disasterChain.chainDescription}
              </p>
            </div>
          )}

        {/* Subtle AI Director Tactical Advisory */}
        {aiDirectorState.activePressure !== 'NONE' && aiDirectorState.lastRecommendation?.tacticalAdvisory && (
          <div className={styles.directorAdvisoryBanner}>
            <span className={styles.directorBannerTag}>
              {language === 'hinglish' ? 'DIRECTOR // PRE-VENUE SANDARBH' : 'DIRECTOR // PRE-VENUE FRAMEWORK'}
            </span>
            <span className={styles.directorBannerText}>{aiDirectorState.lastRecommendation.tacticalAdvisory}</span>
          </div>
        )}

        {/* Dynamic Real-Time Event Banner (Gas Leakage Challenge) */}
        {targetDisaster === 'gas_leak' && (
          (() => {
            const gasEvent = getGasLeakEventByNodeId(decisionNode.id);
            if (!gasEvent) return null;
            return (
              <div className={styles.dynamicEventBanner}>
                <div className={styles.dynamicEventHeader}>
                  <span className={styles.directorActiveBadge}>DIRECTOR: ACTIVE</span>
                  <span className={styles.realtimeEventBadge}>🚨 REAL-TIME EVENT</span>
                  <span
                    className={`${styles.dynamicSeverityBadge} ${
                      styles['severity_' + gasEvent.severity.toLowerCase()]
                    }`}
                  >
                    Severity: {gasEvent.severity}
                  </span>
                </div>
                <div className={styles.dynamicEventTitle}>{gasEvent.label}</div>
                <div className={styles.dynamicEventReason}>
                  <span className={styles.dynamicReasonLabel}>Reason:</span>
                  {gasEvent.defaultReason}
                </div>
              </div>
            );
          })()
        )}

        {/* Story-First Gameplay Experience for Gas Leakage (Vizag 2020 Inspiration) */}
        {targetDisaster === 'gas_leak' && !storyAcknowledged ? (
          (() => {
            const gasStory = getGasLeakStory(decisionNode.id);
            const paragraphs = gasStory
              ? language === 'hinglish'
                ? gasStory.paragraphsHinglish
                : gasStory.paragraphs
              : [decisionNode.situationText];
            const timestamp = gasStory?.timestamp || '03:07 AM';
            const location = gasStory?.location || 'RR Venkatapuram, Visakhapatnam';

            return (
              <motion.div
                key={'story-' + decisionNode.id}
                className={styles.storyCard}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className={styles.storyHeader}>
                  <span className={styles.storyTimeBadge}>{timestamp}</span>
                  <span className={styles.storyLocationBadge}>{location}</span>
                  <span className={styles.storyHistoricalTag}>
                    {language === 'hinglish'
                      ? 'ITIHASIK SANDARBH // VIZAG 2020 INSPIRATION'
                      : 'HISTORICAL INSPIRATION // VIZAG MAY 2020'}
                  </span>
                </div>

                <div className={styles.storyNarrative}>
                  {paragraphs.map((p, idx) => (
                    <p key={idx} className={styles.storyParagraph}>
                      {p}
                    </p>
                  ))}
                </div>

                <div className={styles.situationDeveloping}>
                  <span className={styles.developingIcon} aria-hidden="true">
                    ⚡
                  </span>
                  <div className={styles.developingContent}>
                    <span className={styles.developingLabel}>
                      {language === 'hinglish'
                        ? 'STHITI VIKSIT HO RAHI HAI // DEVELOPING CRISIS:'
                        : 'SITUATION DEVELOPING // ACTIVE THREAT:'}
                    </span>
                    <p className={styles.developingText}>{decisionNode.situationText}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.storyProceedButton}
                  onClick={() => setStoryAcknowledged(true)}
                >
                  <span>
                    {language === 'hinglish'
                      ? 'SITUATION ASSESS KAREIN & ACTION LEIN'
                      : 'ASSESS SITUATION & RESPOND'}
                  </span>
                  <span className={styles.proceedArrow} aria-hidden="true">
                    ▶
                  </span>
                </button>
              </motion.div>
            );
          })()
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}