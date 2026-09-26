// src/services/gamePersistenceService.ts
// Asynchronous, non-blocking persistence service for simulation sessions.
// Enforces a strict FIFO promise queue per game run to guarantee that
// decisions and run finalization are persisted in exact sequence.

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { DecisionRecord } from '../store/gameStore';
import type { DisasterType } from '../data/types';
import type { ScoreSummary } from '../engine/scoreCalculator';

export interface PlayerStats {
  userId: string;
  totalRuns: number;
  completedRuns: number;
  survivedRuns: number;
  averageScore: number;
  bestScore: number;
  earthquakeRuns: number;
  fireRuns: number;
  floodRuns: number;
  updatedAt: string;
}

export interface FinalizeRunPayload {
  survived: boolean;
  scoreSummary: ScoreSummary;
  durationSeconds?: number;
}

// In-memory queue map guaranteeing FIFO order per runId
const runQueues = new Map<string, Promise<void>>();

function enqueue(runId: string, task: () => Promise<void>): void {
  const currentChain = runQueues.get(runId) || Promise.resolve();
  const nextChain = currentChain
    .then(async () => {
      try {
        await task();
      } catch (err) {
        // Safe, non-blocking warning. Local game state is never interrupted.
        if (import.meta.env.DEV) {
          console.warn(`[PersistenceQueue] Task for run ${runId} completed with fallback:`, err);
        }
      }
    })
    .catch(() => {
      // Absorb any unexpected rejection to preserve chain progression
    });

  runQueues.set(runId, nextChain);
}

/**
 * Initializes a new game run record in Supabase in the background.
 * Returns the client-generated UUID immediately so gameplay never blocks.
 */
export function startRun(
  userId: string,
  disasterType: DisasterType,
  scenarioId: string
): string | null {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return null;
  }

  const runId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  enqueue(runId, async () => {
    if (!supabase) return;

    // Verify active session matching userId before issuing insert
    const { data: sessionData } = await supabase.auth.getSession();
    const activeUserId = sessionData?.session?.user?.id;
    if (!activeUserId || activeUserId !== userId) {
      if (import.meta.env.DEV) {
        console.warn(
          `[Persistence] startRun skipped: active session (${activeUserId ?? 'none'}) does not match supplied userId (${userId}).`
        );
      }
      return;
    }

    const { error } = await supabase.from('game_runs').insert({
      id: runId,
      user_id: userId,
      disaster_type: disasterType,
      scenario_id: scenarioId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });

    if (error && import.meta.env.DEV) {
      console.warn('[Persistence] startRun insert failed:', error.message);
    }
  });

  return runId;
}

/**
 * Records a single committed decision in the run queue.
 * Strictly scheduled after startRun and preceding decisions.
 */
export function recordDecision(
  runId: string | null,
  userId: string | null,
  record: DecisionRecord,
  stepOrder: number,
  remainingSeconds?: number
): void {
  if (!isSupabaseConfigured || !supabase || !runId || !userId) {
    return;
  }

  enqueue(runId, async () => {
    if (!supabase) return;

    // Verify active session matching userId before issuing insert
    const { data: sessionData } = await supabase.auth.getSession();
    const activeUserId = sessionData?.session?.user?.id;
    if (!activeUserId || activeUserId !== userId) {
      if (import.meta.env.DEV) {
        console.warn(
          `[Persistence] recordDecision step ${stepOrder} skipped: active session (${activeUserId ?? 'none'}) does not match supplied userId (${userId}).`
        );
      }
      return;
    }

    const { error } = await supabase.from('decisions').insert({
      run_id: runId,
      user_id: userId,
      step_order: stepOrder,
      node_id: record.nodeId,
      situation_text: record.situationText,
      choice_id: record.choiceId,
      choice_label: record.choiceLabel,
      is_correct: record.isCorrect,
      score_impact: record.scoreImpact,
      time_bonus: record.timeBonus || 0,
      remaining_seconds: remainingSeconds ?? null,
      consequence_text: record.consequenceText,
      insight: record.insight,
      insight_source: record.insightSource,
      next_node_id: record.nextNodeId,
      created_at: new Date().toISOString(),
    });

    if (error && import.meta.env.DEV) {
      console.warn(`[Persistence] recordDecision step ${stepOrder} failed:`, error.message);
    }
  });
}

/**
 * Finalizes the game run record in Supabase.
 * Executes strictly after all queued decisions for this run have finished.
 */
export function finalizeRun(
  runId: string | null,
  userId: string | null,
  payload: FinalizeRunPayload
): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !runId || !userId) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    enqueue(runId, async () => {
      if (!supabase) {
        resolve();
        return;
      }

      // Verify active session matching userId before issuing update
      const { data: sessionData } = await supabase.auth.getSession();
      const activeUserId = sessionData?.session?.user?.id;
      if (!activeUserId || activeUserId !== userId) {
        if (import.meta.env.DEV) {
          console.warn(
            `[Persistence] finalizeRun skipped: active session (${activeUserId ?? 'none'}) does not match supplied userId (${userId}).`
          );
        }
        runQueues.delete(runId);
        resolve();
        return;
      }

      const { error } = await supabase
        .from('game_runs')
        .update({
          status: 'completed',
          survived: payload.survived,
          score: payload.scoreSummary.score,
          raw_total: payload.scoreSummary.rawTotal,
          max_possible: payload.scoreSummary.maxPossible,
          score_band: payload.scoreSummary.band,
          optimal_count: payload.scoreSummary.optimalCount,
          suboptimal_count: payload.scoreSummary.suboptimalCount,
          total_decisions: payload.scoreSummary.totalDecisions,
          duration_seconds: payload.durationSeconds ?? null,
          completed_at: new Date().toISOString(),
        })
        .eq('id', runId)
        .eq('user_id', userId)
        .eq('status', 'in_progress');

      if (error && import.meta.env.DEV) {
        console.warn('[Persistence] finalizeRun failed:', error.message);
      }

      // Clean up queue memory after completion
      runQueues.delete(runId);
      resolve();
    });
  });
}

/**
 * Terminates an in-progress game run with a terminal status ('failed' or 'abandoned').
 * Strictly scheduled in the FIFO queue so preceding decisions settle first.
 */
export function failRun(
  runId: string | null,
  userId: string | null,
  terminalStatus: 'failed' | 'abandoned' = 'failed'
): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !runId || !userId) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    enqueue(runId, async () => {
      if (!supabase) {
        resolve();
        return;
      }

      // Verify active session matching userId before issuing update
      const { data: sessionData } = await supabase.auth.getSession();
      const activeUserId = sessionData?.session?.user?.id;
      if (!activeUserId || activeUserId !== userId) {
        if (import.meta.env.DEV) {
          console.warn(
            `[Persistence] failRun (${terminalStatus}) skipped: active session (${activeUserId ?? 'none'}) does not match supplied userId (${userId}).`
          );
        }
        runQueues.delete(runId);
        resolve();
        return;
      }

      const { error } = await supabase
        .from('game_runs')
        .update({
          status: terminalStatus,
          survived: false,
          completed_at: new Date().toISOString(),
        })
        .eq('id', runId)
        .eq('user_id', userId)
        .eq('status', 'in_progress');

      if (error && import.meta.env.DEV) {
        console.warn(`[Persistence] failRun (${terminalStatus}) failed:`, error.message);
      }

      runQueues.delete(runId);
      resolve();
    });
  });
}

/**
 * Fetches private lifetime player stats for the authenticated user.
 */
export async function fetchPlayerStats(userId: string): Promise<PlayerStats | null> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      totalRuns: data.total_runs,
      completedRuns: data.completed_runs,
      survivedRuns: data.survived_runs,
      averageScore: Number(data.average_score) || 0,
      bestScore: data.best_score,
      earthquakeRuns: data.earthquake_runs,
      fireRuns: data.fire_runs,
      floodRuns: data.flood_runs,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}
