// src/screens/ProfileScreen.tsx
// Private personnel profile screen displaying verified lifetime statistics
// and complete chronological operational history.
// Enforces strict private ownership — only the authenticated user's records are shown.

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, fetchCurrentProfile, type UserProfile } from '../services/authService';
import {
  fetchPlayerStats,
  fetchUserRuns,
  type PlayerStats,
  type GameRunSummary,
} from '../services/gamePersistenceService';
import { RunInspectorModal } from '../components/RunInspectorModal';
import { useGameStore } from '../store/gameStore';
import { getScenario, SCENARIO_CATALOGUE } from '../data';
import type { DisasterType } from '../data/types';
import styles from './ProfileScreen.module.css';

const DISASTER_ICONS: Record<string, string> = {
  earthquake: '🌍',
  fire: '🔥',
  flood: '🌊',
};

const DISASTER_NAMES: Record<string, string> = {
  earthquake: 'Earthquake',
  fire: 'Structure Fire',
  flood: 'Flash Flood',
};

function formatRunDate(isoString: string): string {
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

export default function ProfileScreen() {
  const navigate = useNavigate();
  const authUserId = useGameStore((state) => state.authUserId);
  const setAuthUserId = useGameStore((state) => state.setAuthUserId);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [runs, setRuns] = useState<GameRunSummary[] | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);

  const totalRunsCount = runs?.length ?? 0;
  const completedRunsCount = useMemo(() => {
    return runs?.filter((r) => r.status === 'completed').length ?? 0;
  }, [runs]);
  const incompleteRunsCount = totalRunsCount - completedRunsCount;

  const filteredRuns = useMemo(() => {
    if (!runs) return null;
    if (filter === 'completed') {
      return runs.filter((r) => r.status === 'completed');
    }
    if (filter === 'incomplete') {
      return runs.filter((r) => r.status !== 'completed');
    }
    return runs;
  }, [runs, filter]);

  const loadData = useCallback(async (isRetry = false) => {
    if (!authUserId) return;
    if (isRetry) {
      setLoadingProfile(true);
      setLoadingRuns(true);
    }
    try {
      const [profileData, statsData, runsData] = await Promise.all([
        fetchCurrentProfile(authUserId),
        fetchPlayerStats(authUserId),
        fetchUserRuns(authUserId, 20),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setRuns(runsData);
    } catch {
      // Non-blocking fallback
    } finally {
      setLoadingProfile(false);
      setLoadingRuns(false);
    }
  }, [authUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Teardown continues regardless of network outcome
    } finally {
      navigate('/', { replace: true });
      setAuthUserId(null);
      useGameStore.getState().resetSession();
      setProfile(null);
      setStats(null);
      setRuns(null);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>PERSONNEL DOSSIER // VERIFIED STATUS</span>
          <div className={styles.navActions}>
            <Link to="/select" className={styles.navBtn}>
              SIMULATION CONSOLE
            </Link>
            <Link to="/" className={styles.navBtn}>
              MAIN MENU
            </Link>
            <button type="button" onClick={handleSignOut} className={styles.logoutBtn}>
              DISCONNECT
            </button>
          </div>
        </header>

        <div className={styles.profileCard}>
          <div className={styles.identityArea}>
            <div>
              <h1 className={styles.callsign}>
                {profile?.displayName || profile?.username || 'OPERATOR'}
              </h1>
              <div className={styles.displayName}>
                CALLSIGN: @{profile?.username || 'unknown'}
              </div>
            </div>
            <span className={styles.statusBadge}>ACTIVE OPERATOR</span>
          </div>

          {loadingProfile ? (
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-fog)', padding: '2rem 0' }}>
              RETRIEVING DOSSIER METRICS...
            </div>
          ) : (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>AVERAGE READINESS</span>
                  <span className={styles.statValue}>
                    {stats?.averageScore ? `${Math.round(stats.averageScore)}%` : '0%'}
                  </span>
                  <span className={styles.statSubtext}>NDMA Protocol Adherence</span>
                </div>

                <div className={styles.statBox}>
                  <span className={styles.statLabel}>PEAK SCORE</span>
                  <span className={styles.statValue}>
                    {stats?.bestScore ? `${stats.bestScore}/100` : '0/100'}
                  </span>
                  <span className={styles.statSubtext}>Highest Session Rating</span>
                </div>

                <div className={styles.statBox}>
                  <span className={styles.statLabel}>SIMULATIONS COMPLETED</span>
                  <span className={styles.statValue}>{stats?.completedRuns ?? 0}</span>
                  <span className={styles.statSubtext}>
                    {stats?.totalRuns ?? 0} Total Initiated
                  </span>
                </div>

                <div className={styles.statBox}>
                  <span className={styles.statLabel}>SURVIVAL EVACUATIONS</span>
                  <span className={styles.statValue}>{stats?.survivedRuns ?? 0}</span>
                  <span className={styles.statSubtext}>Safe Evacuation Outcomes</span>
                </div>
              </div>

              <div className={styles.disasterBreakdown}>
                <h3 className={styles.sectionTitle}>DISASTER EXPERIENCE BREAKDOWN</h3>
                <div className={styles.disasterRow}>
                  <div className={styles.disasterBadge}>
                    <span>EARTHQUAKE:</span>
                    <strong>{stats?.earthquakeRuns ?? 0}</strong>
                  </div>
                  <div className={styles.disasterBadge}>
                    <span>STRUCTURE FIRE:</span>
                    <strong>{stats?.fireRuns ?? 0}</strong>
                  </div>
                  <div className={styles.disasterBadge}>
                    <span>FLASH FLOOD:</span>
                    <strong>{stats?.floodRuns ?? 0}</strong>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Operational History Section */}
          <section className={styles.historySection}>
            <div className={styles.historyHeader}>
              <div>
                <h3 className={styles.historyTitle}>OPERATIONAL HISTORY</h3>
                <span className={styles.historySubtitle}>
                  CHRONOLOGICAL RECORD OF INCIDENT SIMULATIONS
                </span>
              </div>
              {runs && runs.length > 0 && (
                <span className={styles.historyCountBadge}>
                  {filter === 'completed'
                    ? `${completedRunsCount} COMPLETED ${completedRunsCount === 1 ? 'RUN' : 'RUNS'}`
                    : filter === 'incomplete'
                    ? `${incompleteRunsCount} INCOMPLETE / TERMINATED`
                    : `${totalRunsCount} LOGGED ${totalRunsCount === 1 ? 'RUN' : 'RUNS'}`}
                </span>
              )}
            </div>

            {/* Status Filter Tabs */}
            {runs && runs.length > 0 && (
              <div className={styles.filterRow} role="tablist" aria-label="Filter simulation history">
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'all'}
                  className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilter('all')}
                >
                  ALL RUNS ({totalRunsCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'completed'}
                  className={`${styles.filterBtn} ${filter === 'completed' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  COMPLETED ({completedRunsCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'incomplete'}
                  className={`${styles.filterBtn} ${filter === 'incomplete' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilter('incomplete')}
                >
                  INCOMPLETE / FAILED ({incompleteRunsCount})
                </button>
              </div>
            )}

            {loadingRuns ? (
              <div className={styles.historyLoadingBox}>
                <span className={styles.pulseDot} aria-hidden="true" />
                <span>RETRIEVING SIMULATION ARCHIVE...</span>
              </div>
            ) : runs === null ? (
              <div className={styles.historyErrorBox}>
                <span className={styles.historyErrorIcon}>⚠</span>
                <div className={styles.historyErrorContent}>
                  <p className={styles.historyErrorText}>
                    UNABLE TO RETRIEVE SIMULATION ARCHIVE.
                  </p>
                  <button
                    type="button"
                    className={styles.retryBtn}
                    onClick={() => loadData(true)}
                  >
                    ↻ RETRY QUERY
                  </button>
                </div>
              </div>
            ) : runs.length === 0 ? (
              <div className={styles.historyEmptyBox}>
                <span className={styles.historyEmptyIcon}>📋</span>
                <p className={styles.historyEmptyTitle}>No simulation history yet.</p>
                <p className={styles.historyEmptySubtext}>
                  Complete an emergency scenario to record tactical survival metrics and protocol evaluation.
                </p>
                <Link to="/select" className={styles.emptyActionBtn}>
                  LAUNCH FIRST SIMULATION
                </Link>
              </div>
            ) : filteredRuns && filteredRuns.length === 0 ? (
              <div className={styles.historyEmptyBox}>
                <span className={styles.historyEmptyIcon}>🔍</span>
                <p className={styles.historyEmptyTitle}>No runs match the selected filter.</p>
                <p className={styles.historyEmptySubtext}>
                  Switch filter view to inspect all archived simulation records.
                </p>
                <button
                  type="button"
                  className={styles.emptyActionBtn}
                  onClick={() => setFilter('all')}
                >
                  SHOW ALL RUNS ({totalRunsCount})
                </button>
              </div>
            ) : (
              <div className={styles.runList}>
                {filteredRuns?.map((run) => {
                  const icon = DISASTER_ICONS[run.disasterType] || '⚠';
                  const scenarioTitle = getScenarioTitle(run.scenarioId, run.disasterType);
                  const isCompleted = run.status === 'completed';
                  const isFailed = run.status === 'failed';
                  const isAbandoned = run.status === 'abandoned';
                  const isInProgress = run.status === 'in_progress';
                  const scoreColor = getScoreColor(run.score);

                  return (
                    <article
                      key={run.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedRunId(run.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedRunId(run.id);
                        }
                      }}
                      className={`${styles.runCard} ${styles.runCardInteractive}`}
                      aria-label={`Inspect black-box telemetry for ${scenarioTitle}`}
                    >
                      <div className={styles.runIdentity}>
                        <span className={styles.runIcon} aria-hidden="true">
                          {icon}
                        </span>
                        <div className={styles.runMeta}>
                          <div className={styles.runScenarioRow}>
                            <h4 className={styles.runScenarioTitle}>{scenarioTitle}</h4>
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
                                : 'IN PROGRESS'}
                            </span>
                          </div>
                          <div className={styles.runDetailsRow}>
                            <span className={styles.runDisasterType}>
                              {DISASTER_NAMES[run.disasterType] || run.disasterType.toUpperCase()}
                            </span>
                            <span className={styles.runDotSeparator}>·</span>
                            <span className={styles.runTimestamp}>
                              {formatRunDate(run.startedAt)}
                            </span>
                            <span className={styles.runDotSeparator}>·</span>
                            <span className={styles.runDecisionsCount}>
                              {run.totalDecisions} {run.totalDecisions === 1 ? 'DECISION' : 'DECISIONS'}
                            </span>
                            {run.durationSeconds !== null && run.durationSeconds > 0 && (
                              <>
                                <span className={styles.runDotSeparator}>·</span>
                                <span className={styles.runDuration}>
                                  {run.durationSeconds}s DURATION
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={styles.runOutcomeArea}>
                        {isCompleted && run.score !== null ? (
                          <div className={styles.runScoreBox}>
                            <div className={styles.scoreRow}>
                              <span className={styles.scoreNum} style={{ color: scoreColor }}>
                                {run.score}
                              </span>
                              <span className={styles.scoreMax}>/100</span>
                            </div>
                            {run.scoreBand && (
                              <span className={styles.scoreBandLabel} style={{ color: scoreColor }}>
                                {run.scoreBand}
                              </span>
                            )}
                            <span className={styles.inspectAffordance} aria-hidden="true">
                              AUDIT TELEMETRY ▶
                            </span>
                          </div>
                        ) : (
                          <div className={styles.nonCompletedBox}>
                            <span className={styles.nonCompletedStatus}>
                              {isFailed ? 'SIMULATION FAILED' : isAbandoned ? 'SESSION ABANDONED' : isInProgress ? 'IN PROGRESS' : 'INCOMPLETE'}
                            </span>
                            <span className={styles.nonCompletedDesc}>NO RATING ISSUED</span>
                            <span className={styles.inspectAffordance} aria-hidden="true">
                              INSPECT LOGS ▶
                            </span>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className={styles.actionRow}>
            <Link to="/select" className={styles.playBtn}>
              LAUNCH SIMULATION CONSOLE
            </Link>
          </div>
        </div>

        {selectedRunId && authUserId && (
          <RunInspectorModal
            runId={selectedRunId}
            userId={authUserId}
            onClose={() => setSelectedRunId(null)}
          />
        )}
      </div>
    </div>
  );
}
