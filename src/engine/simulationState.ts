// src/engine/simulationState.ts
// Deterministic Simulation State & Panic Engine for SURVIVE.
// Models evolving crisis dynamics (panic, hazard intensity, safety integrity, visibility).
// Evaluates state transitions purely based on player choices, time pressure, and decision streaks.
// All transitions are strictly bounded, clamped, and deterministic (no Date.now, no Math.random).

import type { DisasterType, Choice, DecisionNode } from '../data/types';

export type PanicBand = 'CALM' | 'CONTROLLED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type ConvergenceRiskBand = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK';
export type EnvironmentStatus = 'STABLE' | 'ELEVATED' | 'ESCALATING' | 'CRITICAL';
export type BehavioralBand = 'INSTINCTIVE' | 'DEVELOPING' | 'TRAINED' | 'DISCIPLINED';
export type BehaviorProfile =
  | 'DISCIPLINED_SURVIVOR'
  | 'METHODICAL_OPERATOR'
  | 'IMPULSIVE_RESPONDER'
  | 'VULNERABLE_HESITANT'
  | 'BALANCED_RESPONDER';

// ── Batch 5 Types: NPC Survival Squad & City Brain ──
export type NpcRole = 'MEDIC' | 'GUIDE' | 'TECHNICIAN' | 'ELDER' | 'VULNERABLE_CIVILIAN';
export type NpcStatus = 'SAFE' | 'STABLE' | 'DISTRESSED' | 'INJURED' | 'CRITICAL';

export interface NpcMember {
  id: string;
  name: string;
  role: NpcRole;
  trust: number; // 0–100
  stress: number; // 0–100
  safety: number; // 0–100
  status: NpcStatus;
  dialogue?: string;
}

export type CityMacroStatus = 'OPERATIONAL' | 'STRAINED' | 'CRITICAL_DISRUPTION';

export interface CityBrainState {
  infrastructureIntegrity: number; // 0–100
  trafficFlow: number; // 0–100
  emergencyAccess: number; // 0–100
  publicOrder: number; // 0–100
  utilityStability: number; // 0–100
  responderAvailability: number; // 0–100
  macroStatus: CityMacroStatus;
  macroSummary: string;
}

// ── Batch 6 Types: Multi-Disaster Chain & Alternative Timeline ──
export type ChainSeverity = 'NONE' | 'IMMINENT' | 'ACTIVE' | 'CONTAINED';

export interface DisasterChainState {
  chainStage: number; // 0: None, 1: Imminent, 2: Active
  secondaryDisaster: 'gas_leak' | 'electrical_hazard' | 'structural_collapse' | null;
  chainSeverity: ChainSeverity;
  chainTitle: string;
  chainDescription: string;
  chainTriggerNodeId?: string;
  isContained: boolean;
  containmentAction?: string;
}

export type RegretLevel =
  | 'OPTIMAL_CHOICE_MADE'
  | 'MARGINAL_DIFFERENCE'
  | 'MISSED_OPTIMAL_PATH'
  | 'CRITICAL_MISTAKE_AVOIDED';

export interface AlternativeTimelineBranch {
  choiceId: string;
  choiceLabel: string;
  isCorrect: boolean;
  scoreImpact: number;
  consequenceText: string;
  projectedPanic: number;
  projectedHazard: number;
  projectedSafety: number;
  projectedSquadCohesion: number;
  projectedCityAccess: number;
  divergenceSummary: string;
  regretLevel: RegretLevel;
}

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

  // ── Batch 3 & 4 Extensions: Instinct vs Training & Adaptive Difficulty ──
  /** Intuitive reflex score bounded 0–100 */
  instinctScore: number;
  /** NDMA protocol adherence and crisis training score bounded 0–100 */
  trainingScore: number;
  /** Categorical qualitative band for instinct */
  instinctBand: BehavioralBand;
  /** Categorical qualitative band for training */
  trainingBand: BehavioralBand;
  /** Composite behavioral archetype profile */
  behaviorProfile: BehaviorProfile;
  /** Deterministic adaptive difficulty level bounded 1–5 */
  difficultyLevel: number;
  /** Seconds modified by adaptive difficulty (e.g. +1, 0, -1, -2, -3) */
  difficultyModifierSeconds: number;
  /** Peak difficulty level reached during simulation */
  peakDifficulty: number;
  /** Lowest difficulty level reached during simulation */
  lowestDifficulty: number;
  /** Most recent behavioral evaluation note */
  lastBehaviorSummary?: string;
  /** Primary behavioral signal triggered on last decision */
  lastBehaviorSignal?: string;

  // ── Batch 5 & 6 Extensions: NPC Squad, City Brain, Multi-Disaster Chain & Alternative Branch ──
  /** NPC Companion squad members in current simulation */
  squadMembers: NpcMember[];
  /** Composite squad cohesion score bounded 0–100 */
  squadCohesion: number;
  /** City Brain macro-environmental municipal crisis status */
  cityBrain: CityBrainState;
  /** Multi-disaster cascading secondary hazard state */
  disasterChain: DisasterChainState;
  /** Evaluated counterfactual alternative timeline branch for the last decision */
  alternativeBranch?: AlternativeTimelineBranch | null;
}

export interface SimulationStateDelta {
  panicChange: number;
  hazardChange: number;
  safetyChange: number;
  visibilityChange: number;
  shiftSummary: string;
  propagationSummary?: string;
  // Batch 3 & 4 extensions
  instinctChange: number;
  trainingChange: number;
  difficultyChange: number;
  behaviorSummary: string;
  behaviorSignal: string;
  // Batch 5 & 6 extensions
  squadTrustChange?: number;
  squadStressChange?: number;
  squadSafetyChange?: number;
  squadCohesionChange?: number;
  cityAccessChange?: number;
  cityUtilityChange?: number;
  chainTriggered?: boolean;
  chainContained?: boolean;
  chainSummary?: string;
  alternativeBranch?: AlternativeTimelineBranch | null;
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
 * Maps a numeric behavior score (0–100) to its qualitative category.
 * Used for both Instinctive Reflex and Protocol Training bands.
 */
export function getBehavioralBand(score: number): BehavioralBand {
  if (score <= 35) return 'INSTINCTIVE';
  if (score <= 60) return 'DEVELOPING';
  if (score <= 80) return 'TRAINED';
  return 'DISCIPLINED';
}

/**
 * Derives a holistic behavioral archetype from instinct and training balance.
 */
export function getBehaviorProfile(instinctScore: number, trainingScore: number): BehaviorProfile {
  if (trainingScore >= 70 && instinctScore >= 65) return 'DISCIPLINED_SURVIVOR';
  if (trainingScore >= 65 && instinctScore < 50) return 'METHODICAL_OPERATOR';
  if (instinctScore >= 65 && trainingScore < 50) return 'IMPULSIVE_RESPONDER';
  if (trainingScore < 45 && instinctScore < 45) return 'VULNERABLE_HESITANT';
  return 'BALANCED_RESPONDER';
}

/**
 * Returns bilingual human-readable explanation for a behavioral profile.
 */
export function getProfileDescription(profile: BehaviorProfile, language?: string): string {
  if (language === 'hinglish') {
    switch (profile) {
      case 'DISCIPLINED_SURVIVOR':
        return 'Anushasit Survivor // Sahaj pratikriya aur NDMA training poori tarah santulit; aapatkal mein tez aur surakshit faisle.';
      case 'METHODICAL_OPERATOR':
        return 'Methodical Operator // High protocol niyam paalan; vishwasneey aur savdhan, par tezi se ghat rahe samay mein thodi jhijhak.';
      case 'IMPULSIVE_RESPONDER':
        return 'Impulsive Responder // Tez reflex aur quick action, par NDMA suraksha protocols se behakne ke kaaran high-risk traps ka khatra.';
      case 'VULNERABLE_HESITANT':
        return 'Vulnerable & Hesitant // Stress aur faisle mein deri se survival margins kam ho gaye; protocol abhyas ki zarurat.';
      case 'BALANCED_RESPONDER':
        return 'Balanced Responder // Santulit buniyaadi jagrukta; pratikriya aur seekh ke beech accha talmel.';
    }
  }

  switch (profile) {
    case 'DISCIPLINED_SURVIVOR':
      return 'Disciplined Survivor // Instinct and NDMA training are unified; swift, composed, and structurally sound under crisis pressure.';
    case 'METHODICAL_OPERATOR':
      return 'Methodical Operator // High protocol adherence and deliberate evaluation; highly reliable though cautious under rapid time constraints.';
    case 'IMPULSIVE_RESPONDER':
      return 'Impulsive Responder // High speed and reflex energy, but frequently ungrounded by NDMA protocols; vulnerable to cascading hazard traps.';
    case 'VULNERABLE_HESITANT':
      return 'Vulnerable & Hesitant // Compounding stress and delayed commitment degrade survival margins; needs structured protocol drilling.';
    case 'BALANCED_RESPONDER':
      return 'Balanced Responder // Steady foundational awareness; balancing reactive instinct with active situational learning.';
  }
}

/**
 * Returns the timer modifier in seconds based on adaptive difficulty level (1–5).
 * Level 1 grants +1s grace; higher levels apply calibrated pressure (-1s to -3s).
 */
export function getDifficultyTimerModifier(level: number): number {
  switch (level) {
    case 1:
      return 1; // +1s grace
    case 2:
      return 0; // standard baseline
    case 3:
      return -1; // -1s tightened
    case 4:
      return -2; // -2s demanding
    case 5:
      return -3; // -3s extreme
    default:
      return 0;
  }
}

/**
 * Deterministically evaluates adaptive difficulty changes (1–5) based on player performance,
 * panic stress, decision streaks, and training scores. Employs hysteresis to prevent rapid oscillation.
 */
export function calculateAdaptiveDifficultyChange(
  currentLevel: number,
  panic: number,
  _isCorrect: boolean,
  consecutiveOptimal: number,
  consecutiveSuboptimal: number,
  trainingScore: number,
  _instinctScore: number
): number {
  // 1. Anti-Death-Spiral & High Panic Stabilization
  // If panic is critical (>= 70), immediately grant relief to prevent unfair compound failure
  if (panic >= 70 && currentLevel > 1) {
    return -1;
  }

  // 2. Struggling Recovery Window
  // Consecutive errors drop difficulty by 1 (down to min 1) to offer stabilization
  if (consecutiveSuboptimal >= 2 && currentLevel > 1) {
    return -1;
  }

  // 3. Earned Difficulty Escalation
  // Steady, calm, well-trained performance gradually scales difficulty by +1 (up to max 5)
  if (consecutiveOptimal >= 2 && panic <= 45 && trainingScore >= 55 && currentLevel < 5) {
    return 1;
  }

  // 4. Hysteresis Hold: maintain current difficulty without oscillation
  return 0;
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
 * Pure function to calculate composite squad cohesion (0–100) from member metrics.
 */
export function calculateSquadCohesion(members: NpcMember[]): number {
  if (!members || members.length === 0) return 50;
  const total = members.reduce((sum, m) => {
    // 40% trust, 40% safety, 20% stress resilience (100 - stress)
    const score = 0.4 * m.trust + 0.4 * m.safety + 0.2 * (100 - m.stress);
    return sum + score;
  }, 0);
  return clamp(Math.round(total / members.length), 0, 100);
}

/**
 * Initializes deterministic companion squad tailored by disaster scenario domain.
 */
export function createInitialNpcSquad(disasterType?: DisasterType | null): NpcMember[] {
  if (disasterType === 'earthquake') {
    return [
      {
        id: 'npc-rohan',
        name: 'Rohan',
        role: 'GUIDE',
        trust: 75,
        stress: 25,
        safety: 85,
        status: 'STABLE',
        dialogue: 'Stairwells might be compromised, stay close and watch for falling masonry!',
      },
      {
        id: 'npc-sharma',
        name: 'Mrs. Sharma',
        role: 'ELDER',
        trust: 80,
        stress: 40,
        safety: 75,
        status: 'DISTRESSED',
        dialogue: 'Beta, my legs are shaking... I will follow your lead.',
      },
      {
        id: 'npc-vikram',
        name: 'Vikram',
        role: 'TECHNICIAN',
        trust: 70,
        stress: 30,
        safety: 80,
        status: 'STABLE',
        dialogue: 'Checking main lines. If you smell gas, do NOT flip electrical switches!',
      },
    ];
  }

  if (disasterType === 'fire') {
    return [
      {
        id: 'npc-arjun',
        name: 'Arjun',
        role: 'TECHNICIAN',
        trust: 75,
        stress: 35,
        safety: 75,
        status: 'STABLE',
        dialogue: 'Check doors with the back of your hand before turning handles. Keep low!',
      },
      {
        id: 'npc-sunita',
        name: 'Dr. Sunita',
        role: 'MEDIC',
        trust: 85,
        stress: 25,
        safety: 85,
        status: 'STABLE',
        dialogue: 'Cover your mouth and nose with a damp cloth to filter particulate smoke.',
      },
      {
        id: 'npc-kabir',
        name: 'Kabir',
        role: 'VULNERABLE_CIVILIAN',
        trust: 65,
        stress: 55,
        safety: 70,
        status: 'DISTRESSED',
        dialogue: "There's too much smoke... which way do we go?!",
      },
    ];
  }

  if (disasterType === 'flood') {
    return [
      {
        id: 'npc-raju',
        name: 'Raju',
        role: 'GUIDE',
        trust: 80,
        stress: 30,
        safety: 80,
        status: 'STABLE',
        dialogue: 'Stay away from stormwater drains and open manholes! Seek higher ground!',
      },
      {
        id: 'npc-verma',
        name: 'Mr. Verma',
        role: 'ELDER',
        trust: 75,
        stress: 45,
        safety: 70,
        status: 'DISTRESSED',
        dialogue: 'The water is rising past my knees... hold onto the railing.',
      },
      {
        id: 'npc-ananya',
        name: 'Ananya',
        role: 'MEDIC',
        trust: 85,
        stress: 25,
        safety: 85,
        status: 'STABLE',
        dialogue: 'Avoid walking through floodwaters—open wounds risk severe sepsis.',
      },
    ];
  }

  // Fallback generic squad
  return [
    {
      id: 'npc-lead',
      name: 'Kavita',
      role: 'GUIDE',
      trust: 75,
      stress: 30,
      safety: 80,
      status: 'STABLE',
      dialogue: 'Maintain buddy check and follow standard evacuation protocols.',
    },
    {
      id: 'npc-supp',
      name: 'Deepak',
      role: 'TECHNICIAN',
      trust: 70,
      stress: 35,
      safety: 75,
      status: 'STABLE',
      dialogue: 'Keep watch for utility hazards and structural displacement.',
    },
    {
      id: 'npc-civ',
      name: 'Asha',
      role: 'VULNERABLE_CIVILIAN',
      trust: 70,
      stress: 50,
      safety: 75,
      status: 'DISTRESSED',
      dialogue: 'Stay together, please!',
    },
  ];
}

/**
 * Initializes City Brain macro-environmental state calibrated by disaster archetype.
 */
export function createInitialCityBrain(disasterType?: DisasterType | null): CityBrainState {
  if (disasterType === 'earthquake') {
    return {
      infrastructureIntegrity: 60,
      trafficFlow: 55,
      emergencyAccess: 65,
      publicOrder: 70,
      utilityStability: 50,
      responderAvailability: 70,
      macroStatus: 'STRAINED',
      macroSummary:
        'Seismic tremors have strained municipal bridges and triggered localized utility trips across the urban sector.',
    };
  }

  if (disasterType === 'fire') {
    return {
      infrastructureIntegrity: 75,
      trafficFlow: 70,
      emergencyAccess: 80,
      publicOrder: 80,
      utilityStability: 65,
      responderAvailability: 85,
      macroStatus: 'OPERATIONAL',
      macroSummary:
        'Municipal fire department dispatched to commercial/residential sector; primary access lanes remain open.',
    };
  }

  if (disasterType === 'flood') {
    return {
      infrastructureIntegrity: 50,
      trafficFlow: 40,
      emergencyAccess: 45,
      publicOrder: 65,
      utilityStability: 55,
      responderAvailability: 60,
      macroStatus: 'STRAINED',
      macroSummary:
        'Low-lying arterial roads inundated; storm drainage backflow impacting municipal transport arteries.',
    };
  }

  return {
    infrastructureIntegrity: 70,
    trafficFlow: 65,
    emergencyAccess: 70,
    publicOrder: 75,
    utilityStability: 65,
    responderAvailability: 75,
    macroStatus: 'OPERATIONAL',
    macroSummary: 'Municipal crisis coordination network activated.',
  };
}

/**
 * Initializes Multi-Disaster cascading secondary hazard state.
 */
export function createInitialDisasterChain(disasterType?: DisasterType | null): DisasterChainState {
  if (disasterType === 'earthquake') {
    return {
      chainStage: 0,
      secondaryDisaster: 'gas_leak',
      chainSeverity: 'NONE',
      chainTitle: 'SECONDARY HAZARD: RUPTURED GAS LINE & ELECTRICAL ARC',
      chainDescription:
        'Structural racking poses severe risk of sheared piped gas connections and live wiring exposure.',
      isContained: false,
    };
  }

  if (disasterType === 'flood') {
    return {
      chainStage: 0,
      secondaryDisaster: 'electrical_hazard',
      chainSeverity: 'NONE',
      chainTitle: 'SECONDARY HAZARD: SUBMERGED GRID & ENERGIZED RUNOFF',
      chainDescription:
        'Rising water encroachment threatens subterranean transformer vaults and energized junction boxes.',
      isContained: false,
    };
  }

  if (disasterType === 'fire') {
    return {
      chainStage: 0,
      secondaryDisaster: 'structural_collapse',
      chainSeverity: 'NONE',
      chainTitle: 'SECONDARY HAZARD: LOAD-BEARING FAILURE & EGRESS BLOCKADE',
      chainDescription:
        'Thermal degradation of floor assemblies and structural trusses threatens imminent transit collapse.',
      isContained: false,
    };
  }

  return {
    chainStage: 0,
    secondaryDisaster: null,
    chainSeverity: 'NONE',
    chainTitle: 'SECONDARY THREAT CHAIN',
    chainDescription: 'Monitoring potential cascading emergency risks.',
    isContained: false,
  };
}

/**
 * Simulates a counterfactual alternative player choice deterministically.
 * Evaluates divergence in Panic, Hazard, Safety, Squad Cohesion, and City Access without mutating live state.
 */
export function simulateAlternativeChoice(
  node: DecisionNode,
  chosenChoiceId: string,
  stateAtDecision: SimulationState,
  disasterType?: DisasterType | null
): AlternativeTimelineBranch | null {
  const otherChoices = node.choices.filter((c) => c.id !== chosenChoiceId);
  if (otherChoices.length === 0) return null;

  const chosenChoice = node.choices.find((c) => c.id === chosenChoiceId);
  const chosenIsCorrect = chosenChoice?.isCorrect ?? false;

  // Select target alternative:
  // If chosen choice was suboptimal, pick the optimal alternative to illustrate the missed path.
  // If chosen choice was optimal, pick the most severe suboptimal alternative to illustrate avoided disaster.
  let targetAlt: Choice;
  if (!chosenIsCorrect) {
    targetAlt = otherChoices.find((c) => c.isCorrect) || otherChoices[0];
  } else {
    const wrongChoices = otherChoices.filter((c) => !c.isCorrect);
    if (wrongChoices.length > 0) {
      targetAlt = wrongChoices.reduce((min, c) => (c.scoreImpact < min.scoreImpact ? c : min), wrongChoices[0]);
    } else {
      targetAlt = otherChoices[0];
    }
  }

  // Clone stateAtDecision safely
  const clonedState: SimulationState = {
    ...stateAtDecision,
    squadMembers: stateAtDecision.squadMembers?.map((m) => ({ ...m })) ?? createInitialNpcSquad(disasterType),
    cityBrain: { ...(stateAtDecision.cityBrain ?? createInitialCityBrain(disasterType)) },
    disasterChain: { ...(stateAtDecision.disasterChain ?? createInitialDisasterChain(disasterType)) },
  };

  const altDelta = calculateDecisionDelta(clonedState, targetAlt, node);
  const altProjectedState = applySimulationState(clonedState, altDelta, targetAlt.isCorrect, disasterType);

  let regretLevel: RegretLevel = 'MARGINAL_DIFFERENCE';
  let divergenceSummary = '';

  if (chosenIsCorrect && !targetAlt.isCorrect) {
    regretLevel = 'CRITICAL_MISTAKE_AVOIDED';
    divergenceSummary = `Choosing "${targetAlt.label}" would have spiked panic by +${altDelta.panicChange}, reduced squad cohesion, and degraded municipal corridor safety. Your disciplined decision avoided this compound crisis.`;
  } else if (!chosenIsCorrect && targetAlt.isCorrect) {
    regretLevel = 'MISSED_OPTIMAL_PATH';
    divergenceSummary = `Choosing "${targetAlt.label}" was the NDMA-aligned protocol. It would have mitigated panic by ${Math.abs(
      altDelta.panicChange
    )} points, stabilized squad trust, and kept emergency access routes viable.`;
  } else if (chosenIsCorrect && targetAlt.isCorrect) {
    regretLevel = 'OPTIMAL_CHOICE_MADE';
    divergenceSummary = `Both choices represented viable containment strategies, though "${chosenChoice?.label}" prioritized immediate localized protection.`;
  } else {
    regretLevel = 'MARGINAL_DIFFERENCE';
    divergenceSummary = `Alternative choice "${targetAlt.label}" also carried substantial operational hazards under current crisis parameters.`;
  }

  return {
    choiceId: targetAlt.id,
    choiceLabel: targetAlt.label,
    isCorrect: targetAlt.isCorrect,
    scoreImpact: targetAlt.scoreImpact,
    consequenceText: targetAlt.consequenceText,
    projectedPanic: altProjectedState.panic,
    projectedHazard: altProjectedState.hazardLevel,
    projectedSafety: altProjectedState.safetyIntegrity,
    projectedSquadCohesion: altProjectedState.squadCohesion,
    projectedCityAccess: altProjectedState.cityBrain.emergencyAccess,
    divergenceSummary,
    regretLevel,
  };
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

  const instinctScore = 50;
  const trainingScore = 50;
  const instinctBand = getBehavioralBand(instinctScore);
  const trainingBand = getBehavioralBand(trainingScore);
  const behaviorProfile = getBehaviorProfile(instinctScore, trainingScore);
  const difficultyLevel = 2; // Standard operational baseline
  const difficultyModifierSeconds = getDifficultyTimerModifier(difficultyLevel);

  const squadMembers = createInitialNpcSquad(disasterType);
  const squadCohesion = calculateSquadCohesion(squadMembers);
  const cityBrain = createInitialCityBrain(disasterType);
  const disasterChain = createInitialDisasterChain(disasterType);

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
    // Batch 3 & 4 baselines
    instinctScore,
    trainingScore,
    instinctBand,
    trainingBand,
    behaviorProfile,
    difficultyLevel,
    difficultyModifierSeconds,
    peakDifficulty: difficultyLevel,
    lowestDifficulty: difficultyLevel,
    lastBehaviorSummary: 'Baseline crisis readiness initialized.',
    lastBehaviorSignal: 'STANDARD_INITIALIZATION',
    // Batch 5 & 6 baselines
    squadMembers,
    squadCohesion,
    cityBrain,
    disasterChain,
    alternativeBranch: null,
  };
}

/**
 * Evaluates the deterministic delta produced by a player choice.
 * Factoring in correctness, score impact, remaining seconds, decision streaks,
 * instinct vs training dynamics, and adaptive difficulty.
 */
export function calculateDecisionDelta(
  currentState: SimulationState,
  choice: Choice,
  node: DecisionNode,
  remainingSeconds?: number
): SimulationStateDelta {
  // If choice explicitly defines custom state deltas, use them as baseline
  const custom = choice.stateDelta;

  const timeLimit = node.timeLimit;
  const isTimed = Boolean(timeLimit && timeLimit > 0);
  const remainingRatio = isTimed && remainingSeconds !== undefined ? remainingSeconds / (timeLimit || 15) : 0.5;
  const isFast = isTimed && remainingRatio >= 0.6;
  const isHesitant = isTimed && remainingSeconds !== undefined && remainingSeconds <= 3;
  const inSeverePanic = currentState.panic >= 60;
  const wasRecovering = currentState.consecutiveSuboptimal >= 1 && choice.isCorrect;

  // Specialist Synergy bonuses from high squad cohesion
  const hasMedic = currentState.squadMembers?.some((m) => m.role === 'MEDIC' && m.status !== 'CRITICAL') ?? false;
  const hasTech = currentState.squadMembers?.some((m) => m.role === 'TECHNICIAN' && m.status !== 'CRITICAL') ?? false;
  const squadSynergyActive = (currentState.squadCohesion ?? 50) >= 65;

  const medicPanicBonus = squadSynergyActive && hasMedic ? (choice.isCorrect ? -3 : -3) : 0;
  const techHazardBonus = squadSynergyActive && hasTech ? (choice.isCorrect ? -3 : -2) : 0;

  // Adaptive difficulty scaling:
  // Demanding difficulty (>= 4) slightly intensifies hazard on errors (+3)
  // Low difficulty (1) mitigates hazard on errors (-3) to allow learning
  const difficultyHazardBias =
    !choice.isCorrect
      ? (currentState.difficultyLevel ?? 2) >= 4
        ? 3
        : (currentState.difficultyLevel ?? 2) === 1
        ? -3
        : 0
      : 0;

  let instinctChange = 0;
  let trainingChange = 0;
  let behaviorSignal = '';
  let behaviorSummary = '';

  // Squad and City Brain Deltas
  const squadTrustChange = choice.isCorrect ? 6 : -10;
  const squadStressChange = choice.isCorrect ? -8 : 14;
  const squadSafetyChange = choice.isCorrect ? 8 : -14;
  const squadCohesionChange = choice.isCorrect ? 6 : -10;
  const cityAccessChange = choice.isCorrect ? 4 : -8;
  const cityUtilityChange = choice.isCorrect ? 3 : -7;

  if (choice.isCorrect) {
    // ── Optimal / Protective Decision ──
    const streakBonus = currentState.consecutiveOptimal >= 1 ? -4 : 0;
    const rapidDecisiveBonus =
      node.timeLimit && remainingSeconds && remainingSeconds >= Math.floor(node.timeLimit * 0.6)
        ? -3
        : 0;

    const panicChange = custom?.panicChange ?? (-12 + streakBonus + rapidDecisiveBonus + medicPanicBonus);
    const hazardChange = custom?.hazardChange ?? (-15 + techHazardBonus);
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

    // Behavioral Signals & Instinct vs Training Dynamics
    if (isFast) {
      instinctChange = 6;
      trainingChange = 6;
      behaviorSignal = 'RAPID_DECISIVE_SAFE';
      behaviorSummary = 'Swift, confident protocol execution under immediate time constraints.';
    } else if (isHesitant) {
      instinctChange = -3;
      trainingChange = 4;
      behaviorSignal = 'HESITANT_SAFE_RECOVERY';
      behaviorSummary = 'Hesitation observed near time limit, but safe protocol was successfully maintained.';
    } else {
      instinctChange = 3;
      trainingChange = 5;
      behaviorSignal = 'MEASURED_PROTOCOL_ADHERENCE';
      behaviorSummary = 'Measured and steady application of safety guidelines.';
    }

    if (inSeverePanic) {
      trainingChange += 5;
      instinctChange += 3;
      behaviorSignal = 'HIGH_STRESS_COMPOSURE';
      behaviorSummary = 'Superb psychological composure; adhered to protocol despite severe crisis panic.';
    }

    if (wasRecovering) {
      trainingChange += 6;
      instinctChange += 3;
      behaviorSignal = 'POST_ERROR_RECOVERY';
      behaviorSummary = 'Effective post-error recovery; adapted cleanly to prevent compounding hazard.';
    }

    if (currentState.consecutiveOptimal >= 2) {
      trainingChange += 3;
      instinctChange += 2;
    }

    // Check Multi-Disaster Chain Containment
    const isChainActive =
      currentState.disasterChain?.chainSeverity === 'ACTIVE' ||
      currentState.disasterChain?.chainSeverity === 'IMMINENT';

    return {
      panicChange,
      hazardChange,
      safetyChange,
      visibilityChange,
      shiftSummary,
      instinctChange,
      trainingChange,
      difficultyChange: 0,
      behaviorSummary,
      behaviorSignal,
      squadTrustChange,
      squadStressChange,
      squadSafetyChange,
      squadCohesionChange,
      cityAccessChange,
      cityUtilityChange,
      chainContained: isChainActive,
      chainTriggered: false,
    };
  } else {
    // ── Suboptimal / High-Risk Decision ──
    const streakPenalty = currentState.consecutiveSuboptimal >= 1 ? 8 : 0;
    const severePenalty = choice.scoreImpact <= -20 ? 8 : 0;
    const hesitationPenalty =
      node.timeLimit && remainingSeconds !== undefined && remainingSeconds <= 3 ? 5 : 0;

    const panicChange = custom?.panicChange ?? (18 + streakPenalty + severePenalty + hesitationPenalty + medicPanicBonus);
    const hazardChange = custom?.hazardChange ?? (20 + severePenalty + difficultyHazardBias + techHazardBonus);
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

    // Behavioral Signals & Instinct vs Training Dynamics
    if (isFast) {
      instinctChange = 4; // reflex was swift
      trainingChange = -8; // but ungrounded in safety protocol
      behaviorSignal = 'IMPULSIVE_RISK_REFLEX';
      behaviorSummary = 'Impulsive reflex action bypassed safety protocols, introducing immediate exposure.';
    } else if (isHesitant) {
      instinctChange = -7;
      trainingChange = -6;
      behaviorSignal = 'HESITANT_PARALYSIS';
      behaviorSummary = 'Prolonged hesitation degraded decision window, leading to a compromised reaction.';
    } else {
      instinctChange = -3;
      trainingChange = -6;
      behaviorSignal = 'SUBOPTIMAL_ACTION';
      behaviorSummary = 'Action diverged from NDMA emergency protocols, elevating operational vulnerability.';
    }

    if (inSeverePanic) {
      trainingChange -= 3;
      instinctChange -= 4;
      behaviorSignal = 'PANIC_COMPROMISE';
      behaviorSummary = 'Severe psychological stress triggered judgment degradation under crisis pressure.';
    }

    if (currentState.consecutiveSuboptimal >= 1) {
      trainingChange -= 5;
      instinctChange -= 3;
      behaviorSignal = 'COMPOUNDING_ERROR';
      behaviorSummary = 'Consecutive high-risk decisions compromised safety margins and escalated systemic threat.';
    }

    // Check Multi-Disaster Chain Trigger
    const currentUtil = currentState.cityBrain?.utilityStability ?? 60;
    const projectedUtil = currentUtil + cityUtilityChange;
    const projectedHazard = currentState.hazardLevel + hazardChange;
    const chainTriggered = projectedUtil <= 45 || projectedHazard >= 65;

    return {
      panicChange,
      hazardChange,
      safetyChange,
      visibilityChange,
      shiftSummary,
      instinctChange,
      trainingChange,
      difficultyChange: 0,
      behaviorSummary,
      behaviorSignal,
      squadTrustChange,
      squadStressChange,
      squadSafetyChange,
      squadCohesionChange,
      cityAccessChange,
      cityUtilityChange,
      chainTriggered,
      chainContained: false,
    };
  }
}

/**
 * Pure function that applies a state delta to current simulation state,
 * enforcing hard bounds (0–100) and updating streaks, panic band, convergence risk,
 * environmental status, forward propagation narrative, instinct vs training scores,
 * adaptive difficulty with hysteresis, squad cohesion, city brain, and disaster chains.
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

  // Behavioral updates: Bounded [0, 100]
  const instinctScore = clamp(
    (currentState.instinctScore ?? 50) + (delta.instinctChange || 0),
    0,
    100
  );
  const trainingScore = clamp(
    (currentState.trainingScore ?? 50) + (delta.trainingChange || 0),
    0,
    100
  );
  const instinctBand = getBehavioralBand(instinctScore);
  const trainingBand = getBehavioralBand(trainingScore);
  const behaviorProfile = getBehaviorProfile(instinctScore, trainingScore);

  const consecutiveOptimal = isCorrect ? currentState.consecutiveOptimal + 1 : 0;
  const consecutiveSuboptimal = !isCorrect ? currentState.consecutiveSuboptimal + 1 : 0;

  // Adaptive difficulty with hysteresis
  const currentDiff = currentState.difficultyLevel ?? 2;
  const difficultyDelta = calculateAdaptiveDifficultyChange(
    currentDiff,
    panic,
    isCorrect,
    consecutiveOptimal,
    consecutiveSuboptimal,
    trainingScore,
    instinctScore
  );
  const difficultyLevel = clamp(currentDiff + difficultyDelta, 1, 5);
  const difficultyModifierSeconds = getDifficultyTimerModifier(difficultyLevel);
  const peakDifficulty = Math.max(currentState.peakDifficulty ?? currentDiff, difficultyLevel);
  const lowestDifficulty = Math.min(currentState.lowestDifficulty ?? currentDiff, difficultyLevel);

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

  // ── Batch 5: NPC Squad State Updates ──
  const squadTrustChange = delta.squadTrustChange ?? (isCorrect ? 6 : -10);
  const squadStressChange = delta.squadStressChange ?? (isCorrect ? -8 : 14);
  const squadSafetyChange = delta.squadSafetyChange ?? (isCorrect ? 8 : -14);

  const squadMembers: NpcMember[] = (currentState.squadMembers ?? createInitialNpcSquad(resolvedDisasterType)).map((member) => {
    const trust = clamp(member.trust + squadTrustChange, 0, 100);
    const stress = clamp(member.stress + squadStressChange, 0, 100);
    const safety = clamp(member.safety + squadSafetyChange, 0, 100);

    let status: NpcStatus = 'STABLE';
    let dialogue = member.dialogue;

    if (safety <= 25) {
      status = 'CRITICAL';
      dialogue = `${member.name} is severely compromised! Immediate medical stabilization required!`;
    } else if (safety <= 45) {
      status = 'INJURED';
      dialogue = `${member.name} sustained injury from debris/smoke; moving at reduced speed.`;
    } else if (stress >= 70) {
      status = 'DISTRESSED';
      dialogue = `${member.name} is struggling with intense crisis panic; needs clear direction.`;
    } else if (safety >= 75 && stress <= 35) {
      status = 'SAFE';
      dialogue = `${member.name} is composed and holding secure perimeter position.`;
    } else {
      status = 'STABLE';
    }

    return {
      ...member,
      trust,
      stress,
      safety,
      status,
      dialogue,
    };
  });

  const squadCohesion = calculateSquadCohesion(squadMembers);

  // ── Batch 5: City Brain State Updates ──
  const baseCity = currentState.cityBrain ?? createInitialCityBrain(resolvedDisasterType);
  const infraDelta = isCorrect ? 3 : -6;
  const trafficDelta = isCorrect ? 4 : -7;
  const accessDelta = delta.cityAccessChange ?? (isCorrect ? 4 : -8);
  const orderDelta = isCorrect ? 3 : -5;
  const utilityDelta = delta.cityUtilityChange ?? (isCorrect ? 3 : -7);
  const responderDelta = isCorrect ? 2 : -4;

  const infrastructureIntegrity = clamp(baseCity.infrastructureIntegrity + infraDelta, 0, 100);
  const trafficFlow = clamp(baseCity.trafficFlow + trafficDelta, 0, 100);
  const emergencyAccess = clamp(baseCity.emergencyAccess + accessDelta, 0, 100);
  const publicOrder = clamp(baseCity.publicOrder + orderDelta, 0, 100);
  const utilityStability = clamp(baseCity.utilityStability + utilityDelta, 0, 100);
  const responderAvailability = clamp(baseCity.responderAvailability + responderDelta, 0, 100);

  const macroScore = Math.round((emergencyAccess + utilityStability + infrastructureIntegrity) / 3);
  let macroStatus: CityMacroStatus = 'OPERATIONAL';
  let macroSummary = '';

  if (macroScore <= 40) {
    macroStatus = 'CRITICAL_DISRUPTION';
    macroSummary = 'Municipal emergency corridor gridlock. 112 response units delayed; utility failures compounding sector hazards.';
  } else if (macroScore <= 65) {
    macroStatus = 'STRAINED';
    macroSummary = 'Municipal infrastructure under significant strain. Emergency response viable but transit corridors restricted.';
  } else {
    macroStatus = 'OPERATIONAL';
    macroSummary = 'Emergency response corridors clear; municipal utility systems stabilized by disciplined incident containment.';
  }

  const cityBrain: CityBrainState = {
    infrastructureIntegrity,
    trafficFlow,
    emergencyAccess,
    publicOrder,
    utilityStability,
    responderAvailability,
    macroStatus,
    macroSummary,
  };

  // ── Batch 6: Multi-Disaster Chain Updates ──
  const baseChain = currentState.disasterChain ?? createInitialDisasterChain(resolvedDisasterType);
  let chainStage = baseChain.chainStage;
  let chainSeverity: ChainSeverity = baseChain.chainSeverity;
  let isContained = baseChain.isContained;
  let containmentAction = baseChain.containmentAction;

  if (delta.chainContained) {
    isContained = true;
    chainSeverity = 'CONTAINED';
    chainStage = Math.max(0, chainStage - 1);
    containmentAction = isCorrect ? 'Disciplined safety protocol neutralized secondary hazard ignition.' : undefined;
  } else if (delta.chainTriggered) {
    chainStage = 2;
    chainSeverity = 'ACTIVE';
    isContained = false;
  } else if (hazardLevel >= 55 || utilityStability <= 50) {
    if (chainSeverity !== 'ACTIVE' && !isContained) {
      chainStage = 1;
      chainSeverity = 'IMMINENT';
    }
  }

  const disasterChain: DisasterChainState = {
    ...baseChain,
    chainStage,
    chainSeverity,
    isContained,
    containmentAction,
  };

  return {
    panic,
    panicBand,
    hazardLevel,
    safetyIntegrity,
    visibility,
    timerModifierSeconds,
    consecutiveOptimal,
    consecutiveSuboptimal,
    lastShiftSummary: delta.shiftSummary,
    convergenceBand,
    environmentStatus,
    propagationSummary,
    disasterType: resolvedDisasterType,
    hazardEscalationCount: currentState.hazardEscalationCount + (isEscalation ? 1 : 0),
    recoveryEventCount: currentState.recoveryEventCount + (isRecovery ? 1 : 0),
    // Batch 3 & 4
    instinctScore,
    trainingScore,
    instinctBand,
    trainingBand,
    behaviorProfile,
    difficultyLevel,
    difficultyModifierSeconds,
    peakDifficulty,
    lowestDifficulty,
    lastBehaviorSummary: delta.behaviorSummary,
    lastBehaviorSignal: delta.behaviorSignal,
    // Batch 5 & 6
    squadMembers,
    squadCohesion,
    cityBrain,
    disasterChain,
    alternativeBranch: delta.alternativeBranch ?? currentState.alternativeBranch ?? null,
  };
}
