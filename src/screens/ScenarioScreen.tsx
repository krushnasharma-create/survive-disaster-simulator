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
import { useCountdown } from '../hooks/useCountdown';
import { getLocalizedScenario, getUiStrings } from '../i18n';
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

  const targetDisaster = (disasterId as DisasterType) || activeDisaster || 'earthquake';
  const rawScenario = useMemo(() => getScenario(targetDisaster), [targetDisaster]);

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

  // Handle choice selection
  const handleSelectChoice = useCallback(
    (choiceId: string, remainingSeconds?: number) => {
      if (!decisionNode) return;

      const evalResult = evaluateChoice(decisionNode, choiceId, remainingSeconds);

      recordDecision(evalResult.record);
      setConsequence({
        consequenceText: evalResult.consequenceText,
        insight: evalResult.insight,
        insightSource: evalResult.insightSource,
        nextNodeId: evalResult.nextNodeId,
        isCorrect: evalResult.isCorrect,
        choiceLabel: evalResult.choice.label,
      });

      navigate(`/disaster/${targetDisaster}/consequence`);
    },
    [decisionNode, navigate, recordDecision, setConsequence, targetDisaster]
  );

  // Time limit hook — 15 seconds limit
  const timeLimit = decisionNode?.timeLimit;
  const onTimerExpire = useCallback(() => {
    // When time expires, do NOT auto-select the choice or reveal the solution.
    // Transition to the dedicated Time Expired / Simulation Failed screen.
    setIsTimedOut(true);
  }, []);

  const { remaining } = useCountdown({
    duration: timeLimit || 15,
    autoStart: Boolean(timeLimit),
    onExpire: onTimerExpire,
  });

  const handleRetryScenario = () => {
    setIsTimedOut(false);
    selectDisaster(targetDisaster);
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
              <CountdownTimer remaining={remaining} total={timeLimit} />
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