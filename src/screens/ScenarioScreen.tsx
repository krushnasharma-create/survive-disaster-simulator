// src/screens/ScenarioScreen.tsx
// Core Scenario Decision Gameplay Screen.
// Supports 15s timed decisions, timeout game-over state, randomized choice presentation, and EN/Hinglish localization.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getScenario } from '../data';
import { getNode, evaluateChoice } from '../engine/scenarioRunner';
import { CountdownTimer } from '../components/CountdownTimer';
import { DecisionPanel } from '../components/DecisionPanel';
import { EnvironmentalOverlay } from '../components/EnvironmentalOverlay';
import { useCountdown } from '../hooks/useCountdown';
import { getLocalizedScenario, getUiStrings } from '../i18n';
import { playTimerTick, playDisasterChoiceImpact } from '../utils/audio';
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
    language,
    setLanguage,
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
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [decisionNode?.id, language]);

  // Handle choice selection with 150ms action commitment latch
  const handleSelectChoice = useCallback(
    (choiceId: string, remainingSeconds?: number) => {
      if (!decisionNode) return;

      const evalResult = evaluateChoice(decisionNode, choiceId, remainingSeconds);

      // Find the safer/optimal choice from existing scenario data if current choice was incorrect
      const optimalChoice = decisionNode.choices.find((c) => c.isCorrect);

      // Play physical disaster commitment audio
      playDisasterChoiceImpact(targetDisaster);

      recordDecision(evalResult.record);
      setConsequence({
        consequenceText: evalResult.consequenceText,
        insight: evalResult.insight,
        insightSource: evalResult.insightSource,
        nextNodeId: evalResult.nextNodeId,
        isCorrect: evalResult.isCorrect,
        choiceLabel: evalResult.choice.label,
        optimalChoiceLabel: !evalResult.isCorrect && optimalChoice ? optimalChoice.label : undefined,
      });

      // Brief 150ms commitment pulse gives tactile weight to the decision before transition
      setTimeout(() => {
        navigate(`/disaster/${targetDisaster}/consequence`);
      }, 150);
    },
    [decisionNode, navigate, recordDecision, setConsequence, targetDisaster]
  );

  // Time limit hook — 15 seconds limit
  const timeLimit = decisionNode?.timeLimit;
  const onTimerExpire = useCallback(() => {
    playTimerTick(0);
    setIsTimedOut(true);
  }, []);

  const { remaining } = useCountdown({
    duration: timeLimit || 15,
    autoStart: Boolean(timeLimit),
    onExpire: onTimerExpire,
    resetKey: retryCount,
  });

  // Urgency audio pulse for timed decision countdown
  useEffect(() => {
    if (timeLimit && remaining <= 5 && remaining > 0 && !isTimedOut) {
      playTimerTick(remaining);
    }
  }, [remaining, timeLimit, isTimedOut]);

  const handleRetryScenario = () => {
    setIsTimedOut(false);
    setRetryCount((prev) => prev + 1);
    if (activeScenarioId) {
      useGameStore.getState().selectScenario(activeScenarioId, targetDisaster);
    } else {
      selectDisaster(targetDisaster);
    }
    if (scenario) {
      advanceTo(scenario.startNodeId);
    }
  };

  const handleReturnToSelect = () => {
    setIsTimedOut(false);
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