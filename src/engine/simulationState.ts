// src/engine/simulationState.ts
// Deterministic Simulation State & Panic Engine for SURVIVE.
// Models evolving crisis dynamics (panic, hazard intensity, safety integrity, visibility).
// Evaluates state transitions purely based on player choices, time pressure, and decision streaks.
// All transitions are strictly bounded, clamped, and deterministic (no Date.now, no Math.random).

import type { DisasterType, Choice, DecisionNode } from '../data/types';

export type PanicBand = 'CALM' | 'CONTROLLED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type ConvergenceRiskBand = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK';
export type EnvironmentStatus = 'STABLE' | 'ELEVATED' | 'ESCALATING' | 'CRITICAL';

export interface ConvergenceContext {
  band: ConvergenceRiskBand;
  status: EnvironmentStatus;
  advisoryTitle: string;
  advisoryText: string;
  environmentalModifier: string;
}

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

  // ── Batch 2 Extensions: Dynamic Hazard Propagation & Advanced Convergence ──
  /** Bounded Convergence Risk Tier derived deterministically from hazard & safety */
  convergenceBand: ConvergenceRiskBand;
  /** Environmental macro status for HUD telemetry */
  environmentStatus: EnvironmentStatus;
  /** Deterministic forward propagation narrative explaining how prior decisions alter upcoming situation */
  propagationSummary?: string;
  /** Disaster archetype identifier for specialized domain propagation */
  disasterType?: DisasterType | null;
  /** Total number of hazard escalations across the run */
  hazardEscalationCount: number;
  /** Total number of environmental recovery/stabilization events */
  recoveryEventCount: number;
}

export interface SimulationStateDelta {
  panicChange: number;
  hazardChange: number;
  safetyChange: number;
  visibilityChange: number;
  shiftSummary: string;
  propagationSummary?: string;
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
 * Maps environmental hazard level and safety integrity to a bounded Convergence Risk Tier.
 * Pure mathematical mapping; guarantees consistent evaluation across all runs.
 */
export function getConvergenceBand(hazardLevel: number, safetyIntegrity: number): ConvergenceRiskBand {
  if (hazardLevel >= 75 || safetyIntegrity <= 35) return 'CRITICAL_RISK';
  if (hazardLevel >= 55 || safetyIntegrity <= 55) return 'HIGH_RISK';
  if (hazardLevel >= 35 || safetyIntegrity <= 75) return 'MODERATE_RISK';
  return 'LOW_RISK';
}

/**
 * Derives environmental macro status from convergence risk band.
 */
export function getEnvironmentStatus(convergenceBand: ConvergenceRiskBand): EnvironmentStatus {
  switch (convergenceBand) {
    case 'LOW_RISK':
      return 'STABLE';
    case 'MODERATE_RISK':
      return 'ELEVATED';
    case 'HIGH_RISK':
      return 'ESCALATING';
    case 'CRITICAL_RISK':
      return 'CRITICAL';
  }
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
 * Generates a bounded, deterministic propagation narrative grounded in official emergency principles.
 * Communicates explicitly how previous actions altered environmental dynamics for the next decision.
 */
export function calculatePropagationSummary(
  disasterType: DisasterType | null | undefined,
  convergenceBand: ConvergenceRiskBand,
  _hazardLevel: number,
  _safetyIntegrity: number,
  _visibility: number,
  isCorrect: boolean
): string {
  if (disasterType === 'earthquake') {
    switch (convergenceBand) {
      case 'CRITICAL_RISK':
        return 'Severe structural racking and fractured load-bearing walls have heavily compromised the building envelope. Active collapse zones and falling debris severely narrow safe movement along upcoming routes.';
      case 'HIGH_RISK':
        return 'Elevated structural vibration and ceiling detachment have degraded pathway integrity. Overhead fixtures and perimeter facades remain unstable for the next phase.';
      case 'MODERATE_RISK':
        return 'Persistent seismic shockwaves and masonry dust create localized obstacles. Maintain situational awareness as transit routes remain partially obstructed.';
      case 'LOW_RISK':
        return isCorrect
          ? 'Disciplined protective cover preserved physical integrity and avoided secondary debris exposure. Interior transit corridors remain viable.'
          : 'Minor masonry dislodgement noted along transit routes, but primary structural framework remains stable.';
    }
  }

  if (disasterType === 'fire') {
    switch (convergenceBand) {
      case 'CRITICAL_RISK':
        return 'Superheated toxic smoke and upward thermal draft currents have saturated upper pathways. Low crawl visibility is severely compromised and radiant heat limits viable exit corridors.';
      case 'HIGH_RISK':
        return 'Accelerating smoke accumulation and thermal layering have decreased corridor visibility. Acrid fumes are beginning to penetrate unsealed access points.';
      case 'MODERATE_RISK':
        return 'Moderate particulate smoke has drifted into circulation areas. Maintain low-level movement along interior perimeters to stay beneath the thermal layer.';
      case 'LOW_RISK':
        return isCorrect
          ? 'Effective compartmentalization and rapid evacuation alignment minimized toxic gas exposure. Stairwell enclosures and exit paths remain tenable.'
          : 'Localized smoke wisps present in corridors; door seals must remain tight to prevent smoke migration.';
    }
  }

  if (disasterType === 'flood') {
    switch (convergenceBand) {
      case 'CRITICAL_RISK':
        return 'Rapidly surging muddy runoff and submerged drainage vortices have inundated low ground. Hydrodynamic drag and concealed open manholes create lethal immersion hazards for transit.';
      case 'HIGH_RISK':
        return 'Rising floodwaters have submerged electrical conduits and eliminated ground-level traction. Exterior movement carries severe open-drain and stalled-current danger.';
      case 'MODERATE_RISK':
        return 'Turbid stormwater continues rising along domestic entryways. Low-lying spaces are increasingly compromised, necessitating immediate elevated refuge.';
      case 'LOW_RISK':
        return isCorrect
          ? 'Proactive utility isolation and rapid vertical refuge preserved dry sanctuary. Exposure to contaminated street runoff and energized water was successfully prevented.'
          : 'Ground water levels are accumulating steadily; stay elevated and avoid testing unknown depths.';
    }
  }

  // Generic fallback
  switch (convergenceBand) {
    case 'CRITICAL_RISK':
      return 'Extreme environmental hazards severely restrict viable survival corridors. Immediate caution required.';
    case 'HIGH_RISK':
      return 'Compounding situational risks have elevated pressure and degraded safe operational margins.';
    case 'MODERATE_RISK':
      return 'Localized hazards persist in the immediate vicinity. Monitor peripheral threats carefully.';
    case 'LOW_RISK':
      return 'Controlled responses have maintained viable evacuation conditions and preserved situational stability.';
  }
}

/**
 * Returns contextual advisory information for the ScenarioScreen based on the player's convergence risk profile.
 * Never alters underlying NDMA safety truths, but dynamically adapts situational pressure and briefing context.
 */
export function getConvergenceContext(
  state: SimulationState,
  disasterType?: DisasterType | null
): ConvergenceContext {
  const type = disasterType || state.disasterType;

  switch (state.convergenceBand) {
    case 'CRITICAL_RISK':
      return {
        band: 'CRITICAL_RISK',
        status: 'CRITICAL',
        advisoryTitle: 'CRITICAL HAZARD CONVERGENCE',
        advisoryText:
          type === 'fire'
            ? `Dense thermal smoke layer and severe oxygen depletion. Visibility at ${state.visibility}%. Extreme caution required on all egress routes.`
            : type === 'flood'
            ? `Deep hydrodynamic current and submerged infrastructure hazards. Safety integrity degraded to ${state.safetyIntegrity}%. Zero margin for hesitation.`
            : `Severe structural instability and active collapse envelope. Safety integrity degraded to ${state.safetyIntegrity}%. Hazard intensity at ${state.hazardLevel}%.`,
        environmentalModifier: 'HIGH DANGER // ELEVATED STRESS',
      };
    case 'HIGH_RISK':
      return {
        band: 'HIGH_RISK',
        status: 'ESCALATING',
        advisoryTitle: 'ESCALATING HAZARD CONDITIONS',
        advisoryText:
          type === 'fire'
            ? `Smoke accumulation accelerating. Low-level visibility reduced to ${state.visibility}%. Stay beneath thermal boundary.`
            : type === 'flood'
            ? `Rising water depth and drainage backflow detected. Traction degraded; avoid submerged electrical conductors.`
            : `Fractured masonry and falling debris along transit path. Hazard intensity at ${state.hazardLevel}%.`,
        environmentalModifier: 'ESCALATING HAZARD // NARROW MARGINS',
      };
    case 'MODERATE_RISK':
      return {
        band: 'MODERATE_RISK',
        status: 'ELEVATED',
        advisoryTitle: 'ELEVATED SITUATIONAL AWARENESS',
        advisoryText: 'Environmental conditions require active vigilance. Scan surroundings and prioritize clear exit paths.',
        environmentalModifier: 'ACTIVE HAZARDS // MONITOR CORRIDORS',
      };
    case 'LOW_RISK':
      return {
        band: 'LOW_RISK',
        status: 'STABLE',
        advisoryTitle: 'STABILIZED CRISIS ENVIRONMENT',
        advisoryText: 'Controlled decision-making has mitigated acute hazards. Maintain disciplined NDMA standard operating procedures.',
        environmentalModifier: 'STABLE PATHWAY // CONTROLLED',
      };
  }
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
  const convergenceBand = getConvergenceBand(hazardLevel, safetyIntegrity);
  const environmentStatus = getEnvironmentStatus(convergenceBand);
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
    convergenceBand,
    environmentStatus,
    disasterType,
    hazardEscalationCount: 0,
    recoveryEventCount: 0,
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
 * enforcing hard bounds (0–100) and updating streaks, panic band, convergence risk,
 * environmental status, and forward propagation narrative.
 */
export function applySimulationState(
  currentState: SimulationState,
  delta: SimulationStateDelta,
  isCorrect: boolean,
  disasterType?: DisasterType | null
): SimulationState {
  const panic = clamp(currentState.panic + delta.panicChange, 0, 100);
  const hazardLevel = clamp(currentState.hazardLevel + delta.hazardChange, 0, 100);
  const safetyIntegrity = clamp(currentState.safetyIntegrity + delta.safetyChange, 0, 100);
  const visibility = clamp(currentState.visibility + delta.visibilityChange, 0, 100);

  const panicBand = getPanicBand(panic);
  const convergenceBand = getConvergenceBand(hazardLevel, safetyIntegrity);
  const environmentStatus = getEnvironmentStatus(convergenceBand);
  const timerModifierSeconds = getTimerModifier(panicBand);

  const resolvedDisasterType = disasterType ?? currentState.disasterType;
  const propagationSummary =
    delta.propagationSummary ||
    calculatePropagationSummary(
      resolvedDisasterType,
      convergenceBand,
      hazardLevel,
      safetyIntegrity,
      visibility,
      isCorrect
    );

  const isEscalation = delta.hazardChange > 0;
  const isRecovery = delta.hazardChange <= 0 && isCorrect;

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
    convergenceBand,
    environmentStatus,
    propagationSummary,
    disasterType: resolvedDisasterType,
    hazardEscalationCount: currentState.hazardEscalationCount + (isEscalation ? 1 : 0),
    recoveryEventCount: currentState.recoveryEventCount + (isRecovery ? 1 : 0),
  };
}
