// src/components/RunInspectorModal.tsx
// In-app Black-Box Incident Replay & Decision Inspector.
// Displays detailed chronological decisions, NDMA compliance, and educational insights.

import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchRunDetails, type RunDetailView, type RunDecisionDetail } from '../services/gamePersistenceService';
import { getScenario, SCENARIO_CATALOGUE } from '../data';
import {
  createInitialSimulationState,
  calculateDecisionDelta,
  applySimulationState,
  simulateAlternativeChoice,
  type AlternativeTimelineBranch,
} from '../engine/simulationState';
import { buildAiContext, generateDeterministicJevFallback } from '../ai';
import type { DisasterType, DecisionNode } from '../data/types';
import styles from './RunInspectorModal.module.css';

interface RunInspectorModalProps {
  runId: string;
  userId: string;
  onClose: () => void;
}

const DISASTER_ICONS: Record<string, string> = {
  earthquake: '🌍',
  fire: '🔥',
  flood: '🌊',
};

const DISASTER_NAMES: Record<string, string> = {
  earthquake: 'Earthquake Simulation',
  fire: 'Structure Fire Incident',
  flood: 'Flash Flood Incident',
};

function formatDetailDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

function getScenarioTitle(scenarioId: string, disasterType: DisasterType): string {
  const scenario = getScenario(scenarioId);
  if (scenario?.title) return scenario.title;

  const catalogueList = SCENARIO_CATALOGUE[disasterType] || [];
  const found = catalogueList.find((c) => c.id === scenarioId);
  if (found?.title) return found.title;

  return scenarioId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'var(--color-fog)';
  if (score >= 85) return 'var(--color-safe)';
  if (score >= 65) return 'var(--color-warning)';
  if (score >= 40) return '#ff9f40';
  return 'var(--color-danger)';
}

function reconstructRunTelemetry(
  disasterType: DisasterType,
  scenarioId: string,
  decisions: RunDecisionDetail[]
) {
  const scenario = getScenario(scenarioId) || getScenario(disasterType);
  let currentState = createInitialSimulationState(disasterType);
  const telemetryByStepId: Record<
    string,
    {
      hazardLevel: number;
      safetyIntegrity: number;
      visibility: number;
      convergenceBand: string;
      environmentStatus: string;
      difficultyLevel: number;
      trainingBand: string;
      instinctScore: number;
      trainingScore: number;
      squadCohesion: number;
      cityMacroStatus: string;
      chainSeverity: string;
      alternativeBranch: AlternativeTimelineBranch | null;
      aiDirectorEvent?: string;
    }
  > = {};

  for (const step of decisions) {
    let nextState = currentState;
    let altBranch: AlternativeTimelineBranch | null = null;
    let aiDirectorEvent: string | undefined;

    if (scenario && scenario.nodes[step.nodeId] && scenario.nodes[step.nodeId].type === 'decision') {
      const node = scenario.nodes[step.nodeId] as DecisionNode;
      const choice = node.choices.find((c) => c.id === step.choiceId);
      if (choice) {
        altBranch = simulateAlternativeChoice(node, step.choiceId, currentState, disasterType);
        const delta = calculateDecisionDelta(
          currentState,
          choice,
          node,
          step.remainingSeconds ?? undefined
        );
        nextState = applySimulationState(currentState, delta, step.isCorrect, disasterType);
      }

      const aiContext = buildAiContext(currentState, node, scenarioId, disasterType);
      const jevRec = generateDeterministicJevFallback(aiContext);
      if (jevRec.payload.boundedEvent !== 'NONE') {
        aiDirectorEvent = jevRec.payload.boundedEvent;
      }
    } else {
      const delta = {
        panicChange: step.isCorrect ? -12 : 18,
        hazardChange: step.isCorrect ? -15 : 20,
        safetyChange: step.isCorrect ? 10 : -20,
        visibilityChange: step.isCorrect ? 5 : -15,
        shiftSummary: step.isCorrect
          ? 'Controlled response mitigated immediate risk and maintained situational composure.'
          : 'Compromised action escalated stress levels and degraded personal safety integrity.',
        instinctChange: step.isCorrect ? 3 : -3,
        trainingChange: step.isCorrect ? 5 : -6,
        difficultyChange: 0,
        behaviorSummary: step.isCorrect
          ? 'Measured application of emergency safety guidance.'
          : 'Suboptimal protocol adherence under crisis pressure.',
        behaviorSignal: step.isCorrect ? 'MEASURED_PROTOCOL_ADHERENCE' : 'SUBOPTIMAL_ACTION',
      };
      nextState = applySimulationState(currentState, delta, step.isCorrect, disasterType);
    }

    telemetryByStepId[step.id] = {
      hazardLevel: nextState.hazardLevel,
      safetyIntegrity: nextState.safetyIntegrity,
      visibility: nextState.visibility,
      convergenceBand: nextState.convergenceBand,
      environmentStatus: nextState.environmentStatus,
      difficultyLevel: nextState.difficultyLevel,
      trainingBand: nextState.trainingBand,
      instinctScore: nextState.instinctScore,
      trainingScore: nextState.trainingScore,
      squadCohesion: nextState.squadCohesion,
      cityMacroStatus: nextState.cityBrain?.macroStatus ?? 'OPERATIONAL',
      chainSeverity: nextState.disasterChain?.chainSeverity ?? 'NONE',
      alternativeBranch: altBranch,
      aiDirectorEvent,
    };

    currentState = nextState;
  }

  return telemetryByStepId;
}

export function RunInspectorModal({ runId, userId, onClose }: RunInspectorModalProps) {
  const [data, setData] = useState<RunDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRunDetails = useCallback(async () => {
    if (!runId || !userId) return;
    setLoading(true);
    setError(null);

    try {
      const details = await fetchRunDetails(runId, userId);
      if (details) {
        setData(details);
      } else {
        setError('Unable to decrypt flight recorder telemetry for this simulation.');
      }
    } catch {
      setError('Connection failure while retrieving flight recorder archive.');
    } finally {
      setLoading(false);
    }
  }, [runId, userId]);

  useEffect(() => {
    loadRunDetails();
  }, [loadRunDetails]);

  // Handle escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const run = data?.run;
  const rawDecisions = data?.decisions;
  const decisions = useMemo(() => rawDecisions || [], [rawDecisions]);

  const stepTelemetry = useMemo(() => {
    if (!run || decisions.length === 0) return {};
    return reconstructRunTelemetry(run.disasterType, run.scenarioId, decisions);
  }, [run, decisions]);

  const scenarioTitle = run ? getScenarioTitle(run.scenarioId, run.disasterType) : 'SIMULATION';
  const disasterName = run ? DISASTER_NAMES[run.disasterType] || run.disasterType.toUpperCase() : '';
  const disasterIcon = run ? DISASTER_ICONS[run.disasterType] || '⚠' : '⚠';
  const scoreColor = run ? getScoreColor(run.score) : 'var(--color-fog)';

  const isCompleted = run?.status === 'completed';
  const isFailed = run?.status === 'failed';
  const isAbandoned = run?.status === 'abandoned';
  const isInProgress = run?.status === 'in_progress';

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-modal-title"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.eyebrow}>BLACK-BOX RECORDER // INCIDENT AUDIT</span>
            <h2 id="inspector-modal-title" className={styles.title}>
              {scenarioTitle}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Incident Replay"
          >
            ✕ ESC
          </button>
        </header>

        {/* Modal Body */}
        <div className={styles.body}>
          {loading ? (
            <div className={styles.stateBox}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span>DECRYPTING BLACK-BOX DECISION LOGS...</span>
            </div>
          ) : error || !run ? (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠</span>
              <p className={styles.errorText}>
                {error || 'Unable to retrieve incident telemetry.'}
              </p>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={loadRunDetails}
              >
                ↻ RETRY DECRYPTION
              </button>
            </div>
          ) : (
            <>
              {/* Executive Incident Summary Strip */}
              <section className={styles.summaryCard} aria-label="Run Summary">
                <div className={styles.summaryTopRow}>
                  <div className={styles.disasterBadgeArea}>
                    <span className={styles.disasterIcon} aria-hidden="true">
                      {disasterIcon}
                    </span>
                    <span className={styles.disasterLabel}>{disasterName}</span>
                  </div>

                  <span
                    className={`${styles.statusPill} ${
                      isCompleted
                        ? run.survived
                          ? styles.statusSurvived
                          : styles.statusCasualty
                        : isFailed
                        ? styles.statusFailed
                        : isAbandoned
                        ? styles.statusAbandoned
                        : styles.statusInProgress
                    }`}
                  >
                    {isCompleted
                      ? run.survived
                        ? 'EVACUATED'
                        : 'NON-SURVIVAL'
                      : isFailed
                      ? 'TIMEOUT'
                      : isAbandoned
                      ? 'ABANDONED'
                      : isInProgress
                      ? 'IN PROGRESS'
                      : 'INCOMPLETE'}
                  </span>
                </div>

                <div className={styles.summaryMetricsGrid}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>PREPAREDNESS SCORE</span>
                    <span className={styles.metricValue} style={{ color: scoreColor }}>
                      {run.score !== null ? `${run.score}/100` : 'UNRATED'}
                    </span>
                    <span className={styles.metricSubtext}>
                      {run.scoreBand || (isCompleted ? 'Calculated' : 'Simulation Terminated')}
                    </span>
                  </div>

                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>SIMULATION TIME</span>
                    <span className={styles.metricValue}>
                      {formatDetailDate(run.startedAt)}
                    </span>
                    <span className={styles.metricSubtext}>
                      {run.completedAt ? 'Run Concluded' : 'Initiated'}
                    </span>
                  </div>

                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>ELAPSED DURATION</span>
                    <span className={styles.metricValue}>
                      {run.durationSeconds !== null && run.durationSeconds > 0
                        ? `${Math.floor(run.durationSeconds / 60)}m ${run.durationSeconds % 60}s`
                        : '--'}
                    </span>
                    <span className={styles.metricSubtext}>
                      Total Operational Time
                    </span>
                  </div>

                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>ACTION EFFICIENCY</span>
                    <span className={styles.metricValue}>
                      {isCompleted && (run.optimalCount > 0 || run.suboptimalCount > 0)
                        ? `${run.optimalCount} Optimal / ${run.suboptimalCount} Deficit`
                        : `${run.totalDecisions} Decisions`}
                    </span>
                    <span className={styles.metricSubtext}>
                      NDMA Protocol Alignment
                    </span>
                  </div>
                </div>
              </section>

              {/* Chronological Action Timeline */}
              <section className={styles.timelineSection} aria-label="Decision Replay">
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    CHRONOLOGICAL ACTION LOG & PROTOCOL ADHERENCE ({decisions.length})
                  </h3>
                </div>

                {decisions.length === 0 ? (
                  <div className={styles.emptyDecisions}>
                    <p className={styles.emptyTitle}>
                      NO DECISION TELEMETRY RECORDED
                    </p>
                    <p className={styles.emptyDesc}>
                      This simulation was terminated before the operator committed their first decision node.
                    </p>
                  </div>
                ) : (
                  <div className={styles.decisionsList}>
                    {decisions.map((step) => {
                      const isOptimal = step.isCorrect;
                      const formattedStepNum = String(step.stepOrder).padStart(2, '0');

                      return (
                        <article
                          key={step.id}
                          className={`${styles.decisionCard} ${
                            isOptimal ? styles.decisionCardOptimal : styles.decisionCardSuboptimal
                          }`}
                        >
                          {/* Step Header */}
                          <div className={styles.stepHeader}>
                            <div className={styles.stepBadgeArea}>
                              <span className={styles.stepNum}>STEP {formattedStepNum}</span>
                              <span
                                className={`${styles.adherenceBadge} ${
                                  isOptimal ? styles.adherenceOptimal : styles.adherenceSuboptimal
                                }`}
                              >
                                {isOptimal ? '✓ NDMA ADHERENT' : '▲ PROTOCOL DEFICIT'}
                              </span>
                            </div>

                            <div className={styles.scoreImpactArea}>
                              <span
                                className={
                                  step.scoreImpact >= 0
                                    ? styles.scoreImpactPositive
                                    : styles.scoreImpactNegative
                                }
                              >
                                {step.scoreImpact >= 0 ? `+${step.scoreImpact}` : step.scoreImpact} PTS
                              </span>

                              {step.timeBonus > 0 && (
                                <span className={styles.timeBonusPill}>
                                  +{step.timeBonus}s SPEED BONUS
                                </span>
                              )}

                              {step.remainingSeconds !== null && (
                                <span className={styles.timerRemaining}>
                                  ⏱ {step.remainingSeconds}s remaining
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Environmental Telemetry Chips */}
                          {stepTelemetry[step.id] && (
                            <div className={styles.telemetryChipsRow}>
                              <span
                                className={styles.telemetryChip}
                                style={{
                                  color:
                                    stepTelemetry[step.id].convergenceBand === 'CRITICAL_RISK'
                                      ? '#f56565'
                                      : stepTelemetry[step.id].convergenceBand === 'HIGH_RISK'
                                      ? '#ed8936'
                                      : stepTelemetry[step.id].convergenceBand === 'MODERATE_RISK'
                                      ? '#ecc94b'
                                      : '#39d353',
                                  borderColor:
                                    stepTelemetry[step.id].convergenceBand === 'CRITICAL_RISK'
                                      ? 'rgba(245, 101, 101, 0.4)'
                                      : stepTelemetry[step.id].convergenceBand === 'HIGH_RISK'
                                      ? 'rgba(237, 137, 54, 0.4)'
                                      : stepTelemetry[step.id].convergenceBand === 'MODERATE_RISK'
                                      ? 'rgba(236, 201, 75, 0.4)'
                                      : 'rgba(57, 211, 83, 0.4)',
                                }}
                              >
                                RISK: {stepTelemetry[step.id].convergenceBand.replace('_', ' ')}
                              </span>
                              <span
                                className={styles.telemetryChip}
                                style={{ color: '#e9d5ff', borderColor: 'rgba(168, 85, 247, 0.4)' }}
                              >
                                DIFF: <strong>L{stepTelemetry[step.id].difficultyLevel}</strong>
                              </span>
                              {stepTelemetry[step.id].squadCohesion !== undefined && (
                                <span
                                  className={styles.telemetryChip}
                                  style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                                >
                                  SQUAD: <strong>{stepTelemetry[step.id].squadCohesion}%</strong>
                                </span>
                              )}
                              {stepTelemetry[step.id].cityMacroStatus && (
                                <span
                                  className={styles.telemetryChip}
                                  style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                                >
                                  CITY: <strong>{stepTelemetry[step.id].cityMacroStatus}</strong>
                                </span>
                              )}
                              {stepTelemetry[step.id].chainSeverity && stepTelemetry[step.id].chainSeverity !== 'NONE' && (
                                <span
                                  className={styles.telemetryChip}
                                  style={{ color: '#ff5252', borderColor: 'rgba(255, 82, 82, 0.4)' }}
                                >
                                  CHAIN: <strong>{stepTelemetry[step.id].chainSeverity}</strong>
                                </span>
                              )}
                              {stepTelemetry[step.id].aiDirectorEvent && (
                                <span
                                  className={styles.telemetryChip}
                                  style={{ color: '#90cdf4', borderColor: 'rgba(99, 179, 237, 0.4)' }}
                                >
                                  DIRECTOR: <strong>{stepTelemetry[step.id].aiDirectorEvent?.replace(/_/g, ' ')}</strong>
                                </span>
                              )}
                              <span
                                className={styles.telemetryChip}
                                style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                              >
                                TRAIN: <strong>{stepTelemetry[step.id].trainingBand}</strong>
                              </span>
                              <span className={styles.telemetryChip}>
                                HAZARD: <strong>{stepTelemetry[step.id].hazardLevel}%</strong>
                              </span>
                              <span className={styles.telemetryChip}>
                                SAFETY: <strong>{stepTelemetry[step.id].safetyIntegrity}%</strong>
                              </span>
                              {stepTelemetry[step.id].visibility < 100 && (
                                <span className={styles.telemetryChip}>
                                  VISIBILITY: <strong>{stepTelemetry[step.id].visibility}%</strong>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Situation Context */}
                          <div className={styles.block}>
                            <span className={styles.blockLabel}>CRISIS SITUATION</span>
                            <p className={styles.situationText}>{step.situationText}</p>
                          </div>

                          {/* Operator Action Taken */}
                          <div className={styles.actionBlock}>
                            <span className={styles.blockLabel}>ACTION COMMITTED BY OPERATOR</span>
                            <div className={styles.actionContent}>
                              <span className={styles.actionIcon} aria-hidden="true">
                                ▶
                              </span>
                              <p className={styles.actionText}>{step.choiceLabel}</p>
                            </div>
                          </div>

                          {/* Alternative Branch Telemetry */}
                          {stepTelemetry[step.id]?.alternativeBranch && (
                            <div className={styles.altBranchBlock}>
                              <span className={styles.altBranchLabel}>
                                🔀 WHAT-IF BRANCH ({stepTelemetry[step.id].alternativeBranch?.regretLevel.replace(/_/g, ' ')})
                              </span>
                              <p className={styles.altBranchSummary}>
                                Alternative: "{stepTelemetry[step.id].alternativeBranch?.choiceLabel}" →{' '}
                                {stepTelemetry[step.id].alternativeBranch?.divergenceSummary}
                              </p>
                            </div>
                          )}

                          {/* Emergency Consequence */}
                          <div className={styles.consequenceBlock}>
                            <span className={styles.blockLabel}>EMERGENCY CONSEQUENCE</span>
                            <p className={styles.consequenceText}>{step.consequenceText}</p>
                          </div>

                          {/* NDMA Safety Insight */}
                          <div className={styles.insightCard}>
                            <div className={styles.insightHeader}>
                              <span className={styles.insightHeading}>
                                OFFICIAL SAFETY PROTOCOL INSIGHT
                              </span>
                              {step.insightSource && (
                                <span className={styles.insightSource}>
                                  {step.insightSource}
                                </span>
                              )}
                            </div>
                            <p className={styles.insightText}>{step.insight}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <span className={styles.footerScoreNote}>
            {run?.id ? `INCIDENT ARCHIVE REFERENCE: ${run.id}` : ''}
          </span>
          <button
            type="button"
            className={styles.footerCloseBtn}
            onClick={onClose}
          >
            RETURN TO OPERATIONAL DOSSIER
          </button>
        </footer>
      </div>
    </div>
  );
}
