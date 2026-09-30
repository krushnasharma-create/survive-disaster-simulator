// src/engine/simulationState.ts
// Deterministic Simulation State & Panic Engine for SURVIVE.
// Models evolving crisis dynamics (panic, hazard intensity, safety integrity, visibility).
// Evaluates state transitions purely based on player choices, time pressure, and decision streaks.
// All transitions are strictly bounded, clamped, and deterministic (no Date.now, no Math.random).

import type { DisasterType, Choice, DecisionNode } from '../data/types';

export type PanicBand = 'CALM' | 'CONTROLLED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface SimulationState {
  /** Panic score bounded 0–100 */
  panic: number;
  /** Qualitative psychological band */
  panicBand: PanicBand;
  /** Environmental hazard severity bounded 0–100 */
  hazardLevel: number;
  /** Physical and operational safety integrity bounded 0–100 */
  safetyIntegrity: number;
  /** Environmental visibility percentage bounded 0–100 */
  visibility: number;
  /** Seconds modified on timed decisions (e.g. 0, -2, -3, -5) */
  timerModifierSeconds: number;
  /** Streak of consecutive correct/optimal safety decisions */
  consecutiveOptimal: number;
  /** Streak of consecutive suboptimal/dangerous decisions */
  consecutiveSuboptimal: number;
  /** Narrative summary of the most recent state shift (butterfly effect) */
  lastShiftSummary?: string;
}

export interface SimulationStateDelta {
  panicChange: number;
  hazardChange: number;
  safetyChange: number;
  visibilityChange: number;
  shiftSummary: string;
}

/**
 * Maps a numeric panic value (0–100) to its qualitative category.
 */
export function getPanicBand(panic: number): PanicBand {
  if (panic <= 20) return 'CALM';
  if (panic <= 40) return 'CONTROLLED';
  if (panic <= 60) return 'ELEVATED';
  if (panic <= 80) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Returns the timer modifier in seconds based on current panic band.
 * High panic reduces available decision time, reflecting psychological cognitive narrowing.
 * Fairly clamped so decisions are never shorter than 10 seconds.
 */
export function getTimerModifier(panicBand: PanicBand): number {
  switch (panicBand) {
    case 'CALM':
    case 'CONTROLLED':
      return 0;
    case 'ELEVATED':
      return -2;
    case 'HIGH':
      return -3;
    case 'CRITICAL':
      return -5;
  }
}

/**
 * Clamps a number between a minimum and maximum value.
 */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Initializes simulation state with deterministic baselines calibrated by disaster archetype.
 */
export function createInitialSimulationState(disasterType?: DisasterType | null): SimulationState {
  let panic = 20;
  let hazardLevel = 25;
  let safetyIntegrity = 85;
  let visibility = 85;

  if (disasterType === 'earthquake') {
    panic = 25; // Sudden ground tremor creates immediate alertness
    hazardLevel = 30; // Shaking and structural disruption
    visibility = 80; // Fine ceiling dust
  } else if (disasterType === 'fire') {
    panic = 30; // Shrill smoke alarm at 2 AM triggers acute adrenaline
    hazardLevel = 35; // Active thermal combustion
    visibility = 70; // Pre-existing smoke wisps
  } else if (disasterType === 'flood') {
    panic = 20; // Early warning phase
    hazardLevel = 25; // Inflow from storm runoff
    visibility = 85; // Heavy rain
  }

  const panicBand = getPanicBand(panic);
  const timerModifierSeconds = getTimerModifier(panicBand);

  return {
    panic,
    panicBand,
    hazardLevel,
    safetyIntegrity,
    visibility,
    timerModifierSeconds,
    consecutiveOptimal: 0,
    consecutiveSuboptimal: 0,
  };
}

/**
 * Evaluates the deterministic delta produced by a player choice.
 * Factoring in correctness, score impact, remaining seconds, and previous decision streaks.
 */
export function calculateDecisionDelta(
  currentState: SimulationState,
  choice: Choice,
  node: DecisionNode,
  remainingSeconds?: number
): SimulationStateDelta {
  // If choice explicitly defines custom state deltas, use them as baseline
  const custom = choice.stateDelta;

  if (choice.isCorrect) {
    // ── Optimal / Protective Decision ──
    const streakBonus = currentState.consecutiveOptimal >= 1 ? -4 : 0;
    const rapidDecisiveBonus =
      node.timeLimit && remainingSeconds && remainingSeconds >= Math.floor(node.timeLimit * 0.6)
        ? -3
        : 0;

    const panicChange = custom?.panicChange ?? (-12 + streakBonus + rapidDecisiveBonus);
    const hazardChange = custom?.hazardChange ?? -15;
    const safetyChange = custom?.safetyChange ?? 10;
    const visibilityChange = custom?.visibilityChange ?? 5;

    let shiftSummary = custom?.shiftSummary;
    if (!shiftSummary) {
      if (currentState.panic >= 60) {
        shiftSummary = 'Decisive protective action stabilized critical panic and halted hazard escalation.';
      } else {
        shiftSummary = 'Controlled response mitigated immediate risk and maintained situational composure.';
      }
    }

    return {
      panicChange,
      hazardChange,
      safetyChange,
      visibilityChange,
      shiftSummary,
    };
  } else {
    // ── Suboptimal / High-Risk Decision ──
    const streakPenalty = currentState.consecutiveSuboptimal >= 1 ? 8 : 0;
    const severePenalty = choice.scoreImpact <= -20 ? 8 : 0;
    const hesitationPenalty =
      node.timeLimit && remainingSeconds !== undefined && remainingSeconds <= 3 ? 5 : 0;

    const panicChange = custom?.panicChange ?? (18 + streakPenalty + severePenalty + hesitationPenalty);
    const hazardChange = custom?.hazardChange ?? (20 + severePenalty);
    const safetyChange = custom?.safetyChange ?? (-20 - severePenalty);
    const visibilityChange = custom?.visibilityChange ?? (-15);

    let shiftSummary = custom?.shiftSummary;
    if (!shiftSummary) {
      if (severePenalty > 0) {
        shiftSummary = 'Critical safety compromise triggered acute panic spike and compounded environmental danger.';
      } else {
        shiftSummary = 'Compromised action escalated stress levels and degraded personal safety integrity.';
      }
    }

    return {
      panicChange,
      hazardChange,
      safetyChange,
      visibilityChange,
      shiftSummary,
    };
  }
}

/**
 * Pure function that applies a state delta to current simulation state,
 * enforcing hard bounds (0–100) and updating streaks, panic band, and timer pressure.
 */
export function applySimulationState(
  currentState: SimulationState,
  delta: SimulationStateDelta,
  isCorrect: boolean
): SimulationState {
  const panic = clamp(currentState.panic + delta.panicChange, 0, 100);
  const hazardLevel = clamp(currentState.hazardLevel + delta.hazardChange, 0, 100);
  const safetyIntegrity = clamp(currentState.safetyIntegrity + delta.safetyChange, 0, 100);
  const visibility = clamp(currentState.visibility + delta.visibilityChange, 0, 100);

  const panicBand = getPanicBand(panic);
  const timerModifierSeconds = getTimerModifier(panicBand);

  return {
    panic,
    panicBand,
    hazardLevel,
    safetyIntegrity,
    visibility,
    timerModifierSeconds,
    consecutiveOptimal: isCorrect ? currentState.consecutiveOptimal + 1 : 0,
    consecutiveSuboptimal: !isCorrect ? currentState.consecutiveSuboptimal + 1 : 0,
    lastShiftSummary: delta.shiftSummary,
  };
}
