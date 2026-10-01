// src/ai/director/directorTypes.ts
// Strict TypeScript contracts for the Live Adaptive Disaster Director — Pre-Venue Framework.
// Strict architectural boundary: The Disaster Director NEVER becomes the authority for safety truth.
// The deterministic simulation engine remains the sole authority for safety outcomes and scores.

import type { DisasterType } from '../../data/types';

/** Director operational mode */
export type DirectorMode = 'OFF' | 'PRE_VENUE' | 'VENUE_LIVE';

/** Allowlisted Director event IDs */
export type DirectorEventId =
  | 'ROUTE_CONGESTION'
  | 'AFTERSHOCK_PRESSURE'
  | 'DEBRIS_FALL'
  | 'SMOKE_DENSITY_SURGE'
  | 'COMM_DELAY'
  | 'PANIC_RIPPLE'
  | 'WATER_SURGE'
  | 'POWER_FLICKER';

/** Category classification of Director events */
export type DirectorEventCategory =
  | 'environmental'
  | 'communication'
  | 'panic'
  | 'infrastructure'
  | 'route';

/** Recommendation source classification */
export type DirectorRecommendationSource = 'DETERMINISTIC' | 'JEV' | 'FALLBACK';

/** Sanitized bounded simulation context passed to the Director */
export interface DirectorContext {
  disasterType: DisasterType;
  scenarioId: string;
  currentNodeId: string;
  currentStep: number;
  panic: number;
  panicBand: string;
  hazardLevel: number;
  hazardBand: string;
  safetyIntegrity: number;
  visibility: number;
  difficultyLevel: number;
  squadCohesion: number;
  cityStatus: string;
  emergencyAccess: number;
  utilityStability: number;
  convergenceBand: string;
  disasterChainState?: {
    severity: string;
    chainTitle?: string;
  };
  recentDirectorEvents: DirectorEventId[];
}

/** Definition of an allowlisted Director event in the deterministic registry */
export interface DirectorEvent {
  id: DirectorEventId;
  label: string;
  explanation: string;
  category: DirectorEventCategory;
  compatibleDisasters: readonly DisasterType[];
  minSeverity: number;
  maxSeverity: number;
  cooldownNodes: number;
  eligibility: (context: DirectorContext) => boolean;
  safeFallback: string;
}

/** Structured recommendation envelope emitted by the recommender or Jev */
export interface DirectorRecommendation {
  eventId: DirectorEventId;
  severity: number;
  source: DirectorRecommendationSource;
  triggerReason: string;
  confidence: number;
}

/** Pure validation result returned by the deterministic validator */
export interface DirectorValidationResult {
  valid: boolean;
  eventId: DirectorEventId | 'UNKNOWN';
  rejectionReason?: string;
  clampedSeverity: number;
  event?: DirectorEvent;
  cooldownRemaining?: number;
}

/** Execution status in pre-venue framework */
export type DirectorExecutionStatus =
  | 'STANDBY_FRAMEWORK'
  | 'EXECUTED'
  | 'REJECTED'
  | 'COOLDOWN_BLOCKED';

/** Pure execution result returned by the deterministic executor */
export interface DirectorExecutionResult {
  eventId: DirectorEventId | 'NONE';
  executed: boolean;
  mode: DirectorMode;
  status: DirectorExecutionStatus;
  triggerReason: string;
  source: DirectorRecommendationSource;
  narrativeSummary: string;
  cooldownApplied: number;
  validation: DirectorValidationResult;
}

/** Audit telemetry tracking Director operations across a playthrough */
export interface DirectorAuditTelemetry {
  mode: DirectorMode;
  recommendationsCount: number;
  acceptedCount: number;
  rejectedCount: number;
  fallbackCount: number;
  validationCount: number;
  executionCount: number;
  cooldownBlocks: number;
  sourceBreakdown: {
    deterministic: number;
    jev: number;
    fallback: number;
  };
  eventFrequency: Record<DirectorEventId, number>;
  activeCooldowns: Record<string, number>;
}
