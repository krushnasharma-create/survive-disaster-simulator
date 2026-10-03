// src/store/gameStore.ts
// Zustand global game state. Single source of truth for the entire session.

import { create } from 'zustand';
import type { DisasterType } from '../data/types';
import { isSupabaseConfigured } from '../lib/supabase';
import type {
  SimulationState,
  SimulationStateDelta,
  ConvergenceRiskBand,
  EnvironmentStatus,
  BehavioralBand,
  BehaviorProfile,
  NpcMember,
  CityBrainState,
  CityMacroStatus,
  DisasterChainState,
  ChainSeverity,
  AlternativeTimelineBranch,
} from '../engine/simulationState';
import {
  createInitialSimulationState,
  applySimulationState,
} from '../engine/simulationState';
import type { AiDirectorState, BoundedEventType } from '../ai/types';
import type {
  DirectorEventId,
  DirectorRecommendationSource,
  DirectorExecutionStatus,
} from '../ai/director/directorTypes';
import { adaptiveDirector } from '../ai/director/adaptiveDirector';

export interface DecisionRecord {
  nodeId: string;
  situationText: string;
  choiceId: string;
  choiceLabel: string;
  isCorrect: boolean;
  scoreImpact: number;
  timeBonus: number;
  consequenceText: string;
  insight: string;
  insightSource: string;
  nextNodeId: string;
  /** Simulation State telemetry recorded at the moment of decision */
  panicLevel?: number;
  panicBand?: string;
  hazardLevel?: number;
  safetyIntegrity?: number;
  visibility?: number;
  convergenceBand?: ConvergenceRiskBand;
  environmentStatus?: EnvironmentStatus;
  propagationSummary?: string;
  stateShiftSummary?: string;
  stateDelta?: SimulationStateDelta;
  /** Batch 3 & 4 Extensions: Instinct vs Training & Adaptive Difficulty Telemetry */
  instinctScore?: number;
  trainingScore?: number;
  instinctBand?: BehavioralBand;
  trainingBand?: BehavioralBand;
  behaviorProfile?: BehaviorProfile;
  difficultyLevel?: number;
  behaviorSignal?: string;
  behaviorSummary?: string;
  /** Batch 5 & 6 Extensions: NPC Squad, City Brain, Multi-Disaster Chain, Alternative Timeline */
  squadCohesion?: number;
  squadMembers?: NpcMember[];
  cityMacroStatus?: CityMacroStatus;
  cityEmergencyAccess?: number;
  cityUtilityStability?: number;
  chainSeverity?: ChainSeverity;
  chainTitle?: string;
  alternativeBranch?: AlternativeTimelineBranch | null;
  /** Batch 7 Extensions: Jev & Gemini Two-Brain Architecture Telemetry */
  aiDirectorEvent?: BoundedEventType;
  aiTacticalAdvisory?: string;
  aiFallbackUsed?: boolean;
  aiNarrativeContext?: string;
  /** Batch 9 Extensions: Live Adaptive Disaster Director — Pre-Venue Framework Telemetry */
  directorEventId?: DirectorEventId | string;
  directorEventCategory?: string;
  directorSource?: DirectorRecommendationSource;
  directorValidation?: 'VALID' | 'REJECTED' | 'COOLDOWN_BLOCKED';
  directorExecutionStatus?: DirectorExecutionStatus;
  directorTriggerReason?: string;
  directorImpactSummary?: string;
}

export interface ConsequenceState {
  consequenceText: string;
  insight: string;
  insightSource: string;
  nextNodeId: string;
  isCorrect: boolean;
  choiceLabel: string;
  /** Label of the safest/correct choice — shown when player chose incorrectly (P0-3) */
  optimalChoiceLabel?: string;
  /** Butterfly Effect & Panic state passed to consequence screen */
  simulationState?: SimulationState;
  stateDelta?: SimulationStateDelta;
  shiftSummary?: string;
  propagationSummary?: string;
  /** Batch 3 & 4 Extensions: Behavioral and adaptation feedback */
  behaviorSummary?: string;
  behaviorSignal?: string;
  /** Batch 5 & 6 Extensions: NPC Squad, City Brain, Multi-Disaster Chain, Alternative Timeline */
  squadMembers?: NpcMember[];
  squadCohesion?: number;
  cityBrain?: CityBrainState;
  disasterChain?: DisasterChainState;
  alternativeBranch?: AlternativeTimelineBranch | null;
  /** Batch 7 Extensions: Jev & Gemini Two-Brain Architecture */
  aiDirectorEvent?: BoundedEventType;
  aiTacticalAdvisory?: string;
  aiNarrativeContext?: string;
  aiDirectorSource?: string;
  /** Batch 9 Extensions: Live Adaptive Disaster Director — Pre-Venue Framework */
  directorEventId?: DirectorEventId | string;
  directorEventLabel?: string;
  directorEventCategory?: string;
  directorSource?: DirectorRecommendationSource;
  directorValidation?: 'VALID' | 'REJECTED' | 'COOLDOWN_BLOCKED';
  directorExecutionStatus?: DirectorExecutionStatus;
  directorTriggerReason?: string;
  directorImpactSummary?: string;
}

export interface OutcomeState {
  survived: boolean;
  narrativeText: string;
  nextNodeId: string;
}

interface GameState {
  // ── Session ─────────────────────────────────────────
  hasSeenIntro: boolean;

  // ── Active disaster & scenario ─────────────────────
  activeDisaster: DisasterType | null;
  activeScenarioId: string | null;

  // ── Scenario traversal ───────────────────────────────
  currentNodeId: string;
  visitedNodes: string[];

  // ── Active consequence & outcome states ─────────────
  currentConsequence: ConsequenceState | null;
  currentOutcome: OutcomeState | null;

  // ── Decision history (drives scoring + report) ───────
  decisions: DecisionRecord[];

  // ── Computed score (finalised at report screen) ──────
  totalScore: number;

  // ── Simulation Engine (Panic Engine + Butterfly Effect) ─
  simulationState: SimulationState;

  // ── Language Mode ────────────────────────────────────
  language: 'en' | 'hinglish';

  // ── Authentication & Persistence ───────────────────
  authUserId: string | null;
  isAuthLoading: boolean;
  activeRunId: string | null;
  runSeed: number;

  // ── AI Director (Layer 1 & 2 Two-Brain Telemetry) ────
  aiDirectorState: AiDirectorState;

  // ── Actions ──────────────────────────────────────────
  setAuthUserId: (id: string | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setActiveRunId: (runId: string | null) => void;
  setRunSeed: (seed: number) => void;
  setLanguage: (language: 'en' | 'hinglish') => void;
  markIntroSeen: () => void;
  selectDisaster: (disaster: DisasterType) => void;
  selectScenario: (scenarioId: string, disaster: DisasterType) => void;
  advanceTo: (nodeId: string) => void;
  setConsequence: (consequence: ConsequenceState | null) => void;
  setOutcome: (outcome: OutcomeState | null) => void;
  recordDecision: (record: DecisionRecord) => void;
  updateSimulationState: (delta: SimulationStateDelta, isCorrect: boolean) => void;
  setSimulationState: (simulationState: SimulationState) => void;
  updateAiDirectorState: (patch: Partial<AiDirectorState>) => void;
  finaliseScore: (score: number) => void;
  resetSession: () => void;
}

const initialAiDirectorState: AiDirectorState = {
  mode: 'ACTIVE',
  jevAvailable: false,
  geminiAvailable: false,
  lastRecommendation: null,
  lastNarrative: null,
  recommendationCount: 0,
  acceptedCount: 0,
  rejectedCount: 0,
  fallbackCount: 0,
  activePressure: 'NONE',
};

const initialState = {
  language: 'en' as const,
  hasSeenIntro: false,
  activeDisaster: null,
  activeScenarioId: null,
  currentNodeId: '',
  visitedNodes: [] as string[],
  currentConsequence: null as ConsequenceState | null,
  currentOutcome: null as OutcomeState | null,
  decisions: [] as DecisionRecord[],
  totalScore: 0,
  simulationState: createInitialSimulationState(),
  aiDirectorState: initialAiDirectorState,
  authUserId: null as string | null,
  isAuthLoading: isSupabaseConfigured,
  activeRunId: null as string | null,
  runSeed: 0,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setAuthUserId: (id) =>
    set((state) => {
      if (state.authUserId === id && !state.isAuthLoading) {
        return state;
      }
      return { authUserId: id, isAuthLoading: false };
    }),

  setAuthLoading: (loading) =>
    set((state) => {
      if (state.isAuthLoading === loading) {
        return state;
      }
      return { isAuthLoading: loading };
    }),

  setActiveRunId: (runId) => set({ activeRunId: runId }),

  setRunSeed: (seed) => set({ runSeed: seed }),

  setLanguage: (language) => set({ language }),

  markIntroSeen: () => set({ hasSeenIntro: true }),

  selectDisaster: (disaster) => {
    adaptiveDirector.resetSession();
    // Deterministic fresh seed per run (falls back to timestamp hash)
    const newSeed = (Date.now() ^ Math.floor(Math.random() * 100000)) >>> 0;
    set({
      activeDisaster: disaster,
      activeScenarioId: null,
      currentNodeId: '',
      visitedNodes: [],
      currentConsequence: null,
      currentOutcome: null,
      decisions: [],
      totalScore: 0,
      runSeed: newSeed,
      simulationState: createInitialSimulationState(disaster),
      activeRunId: null,
    });
  },

  selectScenario: (scenarioId, disaster) => {
    adaptiveDirector.resetSession();
    set({
      activeDisaster: disaster,
      activeScenarioId: scenarioId,
      currentNodeId: '',
      visitedNodes: [],
      currentConsequence: null,
      currentOutcome: null,
      decisions: [],
      totalScore: 0,
      simulationState: createInitialSimulationState(disaster),
      activeRunId: null,
    });
  },

  advanceTo: (nodeId) =>
    set((state) => ({
      currentNodeId: nodeId,
      visitedNodes: [...state.visitedNodes, nodeId],
    })),

  setConsequence: (consequence) => set({ currentConsequence: consequence }),

  setOutcome: (outcome) => set({ currentOutcome: outcome }),

  recordDecision: (record) =>
    set((state) => ({
      decisions: [...state.decisions, record],
    })),

  updateSimulationState: (delta, isCorrect) =>
    set((state) => ({
      simulationState: applySimulationState(state.simulationState, delta, isCorrect, state.activeDisaster),
    })),

  setSimulationState: (simulationState) => set({ simulationState }),

  updateAiDirectorState: (patch) =>
    set((state) => ({
      aiDirectorState: { ...state.aiDirectorState, ...patch },
    })),

  finaliseScore: (score) => set({ totalScore: score }),

  resetSession: () => {
    adaptiveDirector.resetSession();
    set((state) => ({
      ...initialState,
      language: state.language,
      authUserId: state.authUserId,
      isAuthLoading: false,
    }));
  },
}));