// src/screens/ScenarioScreen.tsx
// Core Scenario Decision Gameplay Screen.
// Powered by the deterministic scenario engine.

import { useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { getScenario } from '../data';
import { getNode, evaluateChoice } from '../engine/scenarioRunner';
import { CountdownTimer } from '../components/CountdownTimer';
import { DecisionPanel } from '../components/DecisionPanel';
import { useCountdown } from '../hooks/useCountdown';
import type { DisasterType, DecisionNode } from '../data/types';
import styles from './ScenarioScreen.module.css';

const THEME_MAP: Record<DisasterType, string> = {
  earthquake: 'theme-earthquake',
  fire: 'theme-fire',
  flood: 'theme-flood',
};

const LABEL_MAP: Record<DisasterType, string> = {
  earthquake: 'Earthquake — Seismic Event Active',
  fire: 'Structure Fire — Alarm Active',
  flood: 'Flash Flood — Evacuation Warning',
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
  } = useGameStore();

  const targetDisaster = (disasterId as DisasterType) || activeDisaster || 'earthquake';
  const scenario = useMemo(() => getScenario(targetDisaster), [targetDisaster]);

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

  // Time limit hook
  const timeLimit = decisionNode?.timeLimit;
  const onTimerExpire = useCallback(() => {
    if (!decisionNode) return;
    const fallbackChoiceId = decisionNode.defaultChoiceId || decisionNode.choices[0].id;
    handleSelectChoice(fallbackChoiceId, 0);
  }, [decisionNode, handleSelectChoice]);

  const { remaining } = useCountdown({
    duration: timeLimit || 10,
    autoStart: Boolean(timeLimit),
    onExpire: onTimerExpire,
  });

  const themeClass = THEME_MAP[targetDisaster] || 'theme-earthquake';
  const labelText = LABEL_MAP[targetDisaster] || 'Emergency Response Simulation';

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
          <span className={styles.hudBadge}>LIVE SIMULATION</span>
        </div>
        <span className={styles.hudNode}>
          DECISION {String(stepNumber).padStart(2, '0')}
        </span>
      </header>

      {/* Main Situation & Decision Area */}
      <main className={styles.main}>
        {/* Situation Card */}
        <motion.div
          key={decisionNode.id}
          className={styles.situationCard}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
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
            <span className={styles.decisionLabel}>Select Your Action</span>
          </div>

          {/* Countdown timer if node is timed */}
          {timeLimit && (
            <div style={{ marginBottom: '1rem' }}>
              <CountdownTimer remaining={remaining} total={timeLimit} />
            </div>
          )}

          {/* Decision Choices */}
          <DecisionPanel
            choices={decisionNode.choices}
            onSelect={(choiceId) => handleSelectChoice(choiceId, remaining)}
          />
        </div>
      </main>
    </div>
  );
}