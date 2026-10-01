// src/ai/types.ts
// Core serializable contracts and types for Jev + Gemini Two-Brain Architecture.
// Strict safety boundary: AI recommendations and narrations NEVER determine safety-critical simulation state.

import type { DisasterType } from '../data/types.js';

/** AI Provider source classification */
export type AiSource = 'jev' | 'gemini' | 'deterministic-fallback';

/** Allowlist of bounded environmental director events */
export type BoundedEventType =
  | 'NONE'
  | 'ROUTE_CONGESTION'
  | 'AFTERSHOCK_PRESSURE'
  | 'STRUCTURAL_CREAK'
  | 'SMOKE_POCKET'
  | 'WATER_SURGE'
  | 'DOWNED_LINE'
  | 'PANIC_CROWD'
  | 'COMMUNICATION_STATIC';

/** Allowlist of bounded companion/NPC director intents */
export type BoundedNpcIntent =
  | 'ASSIST'
  | 'WARN'
  | 'HESITATE'
  | 'GUIDE'
  | 'STABILIZE';

/** Allowlist of bounded difficulty recommendations */
export type BoundedDifficultyRecommendation =
  | 'HOLD'
  | 'INCREASE'
  | 'STABILIZE'
  | 'RECOVER';

/** Sanitized, minimal simulation context for AI providers (zero secrets, zero private user info) */
export interface AiContext {
  disasterType: DisasterType;
  scenarioId: string;
  nodeId: string;
  situationTitle: string;
  panicBand: string;
  panicLevel: number;
  hazardBand: string;
  hazardLevel: number;
  convergenceBand: string;
  environmentStatus: string;
  difficultyLevel: number;
  squadSummary: {
    cohesion: number;
    activeCount: number;
    distressedCount: number;
    roles: string[];
  };
  citySummary: {
    macroStatus: string;
    emergencyAccess: number;
    utilityStability: number;
  };
  chainStatus: {
    severity: string;
    chainTitle?: string;
  };
  recentDecisions: Array<{
    nodeId: string;
    choiceLabel: string;
    isCorrect: boolean;
  }>;
}

/** Standard serializable envelope for all AI recommendations */
export interface AiEnvelope<T> {
  requestId: string;
  contextVersion: string;
  source: AiSource;
  /** Bounded confidence 0-100 */
  confidence: number;
  timestamp: number;
  allowedActions: string[];
  expirationMs: number;
  reasoningSummary: string;
  deterministicFallbackUsed: boolean;
  payload: T;
}

/** Bounded tactical recommendation payload from Jev Decision Brain */
export interface JevRecommendation {
  type: 'DIRECTOR_RECOMMENDATION';
  boundedEvent: BoundedEventType;
  npcIntent: BoundedNpcIntent;
  difficultyPressure: BoundedDifficultyRecommendation;
  /** Max 120 chars tactical advisory */
  tacticalAdvisory: string;
}

/** Request envelope for Gemini Creative Brain */
export interface GeminiNarrativeRequest {
  type: 'NPC_DIALOGUE' | 'CONSEQUENCE_NARRATION' | 'ENVIRONMENTAL_ATMOSPHERE' | 'EDUCATIONAL_FLAVOR';
  context: AiContext;
  speakerRole?: string;
  speakerName?: string;
  maxSentences?: number;
  language?: 'en' | 'hinglish';
}

/** Narrative payload returned by Gemini Creative Brain */
export interface GeminiNarrativeResponse {
  type: 'NPC_DIALOGUE' | 'CONSEQUENCE_NARRATION' | 'ENVIRONMENTAL_ATMOSPHERE' | 'EDUCATIONAL_FLAVOR';
  /** Max 2 sentences, bounded length */
  text: string;
  speaker?: string;
  tone: 'URGENT' | 'CAUTIOUS' | 'STABILIZING' | 'INFORMATIVE';
}

/** Telemetry tracking AI director operations throughout a playthrough */
export interface AiDirectorState {
  mode: 'ACTIVE' | 'FALLBACK_ONLY' | 'DISABLED';
  jevAvailable: boolean;
  geminiAvailable: boolean;
  lastRecommendation: JevRecommendation | null;
  lastNarrative: string | null;
  recommendationCount: number;
  acceptedCount: number;
  rejectedCount: number;
  fallbackCount: number;
  activePressure: BoundedEventType;
}

/** Provider interface for Layer 2: Decision Brain (Jev) */
export interface DecisionBrain {
  readonly providerName: string;
  isAvailable(): boolean;
  recommend(context: AiContext): Promise<AiEnvelope<JevRecommendation>>;
}

/** Provider interface for Layer 1: Creative Brain (Gemini) */
export interface CreativeBrain {
  readonly providerName: string;
  isAvailable(): boolean;
  narrate(request: GeminiNarrativeRequest): Promise<AiEnvelope<GeminiNarrativeResponse>>;
}
