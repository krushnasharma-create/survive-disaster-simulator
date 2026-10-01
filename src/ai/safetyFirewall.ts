// src/ai/safetyFirewall.ts
// Strict Safety Firewall establishing a hard boundary between AI output and the simulation engine.
// All AI recommendations must pass through this validator before reaching the UI or director.

import type {
  AiEnvelope,
  JevRecommendation,
  GeminiNarrativeResponse,
  BoundedEventType,
  BoundedNpcIntent,
  BoundedDifficultyRecommendation,
} from './types';

export const ALLOWED_BOUNDED_EVENTS: readonly BoundedEventType[] = [
  'NONE',
  'ROUTE_CONGESTION',
  'AFTERSHOCK_PRESSURE',
  'STRUCTURAL_CREAK',
  'SMOKE_POCKET',
  'WATER_SURGE',
  'DOWNED_LINE',
  'PANIC_CROWD',
  'COMMUNICATION_STATIC',
] as const;

export const ALLOWED_NPC_INTENTS: readonly BoundedNpcIntent[] = [
  'ASSIST',
  'WARN',
  'HESITATE',
  'GUIDE',
  'STABILIZE',
] as const;

export const ALLOWED_DIFFICULTY_PRESSURES: readonly BoundedDifficultyRecommendation[] = [
  'HOLD',
  'INCREASE',
  'STABILIZE',
  'RECOVER',
] as const;

const FORBIDDEN_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /\beval\s*\(/i,
  /\b(score|safety|hazard|panic|cohesion)\s*[:=]/i,
  /\b(survived|game_over|dead|fail|pass)\s*[:=]/i,
  /\bdelete\b/i,
  /\bwindow\b/i,
  /\bdocument\b/i,
];

/** Check if text contains forbidden script injection or state mutation attempts */
export function containsForbiddenPatterns(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return FORBIDDEN_PATTERNS.some((pat) => pat.test(text));
}

/** Sanitize and clamp string length */
export function sanitizeString(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
}

export interface ValidationResult<T> {
  valid: boolean;
  error?: string;
  envelope?: AiEnvelope<T>;
}

/**
 * Validates a Jev recommendation envelope against the strict safety allowlist and bounds.
 * Rejects any unknown event, low confidence (< 60), invalid intent, or injection payload.
 */
export function validateJevEnvelope(
  envelope: unknown,
  expectedContextVersion?: string
): ValidationResult<JevRecommendation> {
  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, error: 'Envelope must be a non-null object' };
  }

  const env = envelope as Partial<AiEnvelope<Partial<JevRecommendation>>>;

  if (typeof env.requestId !== 'string' || !env.requestId) {
    return { valid: false, error: 'Missing or invalid requestId' };
  }

  if (expectedContextVersion && env.contextVersion !== expectedContextVersion) {
    return { valid: false, error: 'Context version mismatch / expired recommendation' };
  }

  if (typeof env.confidence !== 'number' || isNaN(env.confidence) || env.confidence < 0 || env.confidence > 100) {
    return { valid: false, error: 'Confidence must be a number between 0 and 100' };
  }

  if (env.confidence < 60) {
    return { valid: false, error: `Confidence ${env.confidence} is below minimum threshold (60)` };
  }

  const payload = env.payload;
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Missing recommendation payload' };
  }

  if (payload.type !== 'DIRECTOR_RECOMMENDATION') {
    return { valid: false, error: 'Invalid recommendation type' };
  }

  if (!ALLOWED_BOUNDED_EVENTS.includes(payload.boundedEvent as BoundedEventType)) {
    return { valid: false, error: `Event "${String(payload.boundedEvent)}" is not in allowlist` };
  }

  if (!ALLOWED_NPC_INTENTS.includes(payload.npcIntent as BoundedNpcIntent)) {
    return { valid: false, error: `NPC intent "${String(payload.npcIntent)}" is not in allowlist` };
  }

  if (!ALLOWED_DIFFICULTY_PRESSURES.includes(payload.difficultyPressure as BoundedDifficultyRecommendation)) {
    return { valid: false, error: `Difficulty pressure "${String(payload.difficultyPressure)}" is not in allowlist` };
  }

  if (payload.tacticalAdvisory && containsForbiddenPatterns(payload.tacticalAdvisory)) {
    return { valid: false, error: 'Forbidden pattern detected in tactical advisory' };
  }

  const sanitizedAdvisory = sanitizeString(payload.tacticalAdvisory || '', 120);

  const sanitizedEnvelope: AiEnvelope<JevRecommendation> = {
    requestId: env.requestId,
    contextVersion: env.contextVersion || '1.0',
    source: env.source === 'jev' ? 'jev' : 'deterministic-fallback',
    confidence: Math.round(env.confidence),
    timestamp: typeof env.timestamp === 'number' ? env.timestamp : Date.now(),
    allowedActions: Array.isArray(env.allowedActions) ? env.allowedActions.map((a) => String(a)) : [],
    expirationMs: typeof env.expirationMs === 'number' ? env.expirationMs : 15000,
    reasoningSummary: sanitizeString(env.reasoningSummary || '', 160),
    deterministicFallbackUsed: Boolean(env.deterministicFallbackUsed),
    payload: {
      type: 'DIRECTOR_RECOMMENDATION',
      boundedEvent: payload.boundedEvent as BoundedEventType,
      npcIntent: payload.npcIntent as BoundedNpcIntent,
      difficultyPressure: payload.difficultyPressure as BoundedDifficultyRecommendation,
      tacticalAdvisory: sanitizedAdvisory,
    },
  };

  return { valid: true, envelope: sanitizedEnvelope };
}

/**
 * Validates a Gemini creative narrative envelope.
 * Enforces length boundaries, non-empty text, and disallows state mutations or procedural contradictions.
 */
export function validateGeminiEnvelope(
  envelope: unknown
): ValidationResult<GeminiNarrativeResponse> {
  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, error: 'Narrative envelope must be a non-null object' };
  }

  const env = envelope as Partial<AiEnvelope<Partial<GeminiNarrativeResponse>>>;

  if (typeof env.requestId !== 'string' || !env.requestId) {
    return { valid: false, error: 'Missing or invalid requestId' };
  }

  const payload = env.payload;
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Missing narrative payload' };
  }

  if (typeof payload.text !== 'string' || !payload.text.trim()) {
    return { valid: false, error: 'Narrative text must be non-empty string' };
  }

  if (containsForbiddenPatterns(payload.text)) {
    return { valid: false, error: 'Forbidden pattern detected in narrative text' };
  }

  // Bound text length: max 280 chars
  const sanitizedText = sanitizeString(payload.text, 280);

  const allowedTones = ['URGENT', 'CAUTIOUS', 'STABILIZING', 'INFORMATIVE'] as const;
  const tone = allowedTones.includes(payload.tone as any) ? (payload.tone as any) : 'INFORMATIVE';

  const sanitizedEnvelope: AiEnvelope<GeminiNarrativeResponse> = {
    requestId: env.requestId,
    contextVersion: env.contextVersion || '1.0',
    source: env.source === 'gemini' ? 'gemini' : 'deterministic-fallback',
    confidence: typeof env.confidence === 'number' ? Math.max(0, Math.min(100, env.confidence)) : 80,
    timestamp: typeof env.timestamp === 'number' ? env.timestamp : Date.now(),
    allowedActions: [],
    expirationMs: 30000,
    reasoningSummary: sanitizeString(env.reasoningSummary || '', 160),
    deterministicFallbackUsed: Boolean(env.deterministicFallbackUsed),
    payload: {
      type: payload.type || 'ENVIRONMENTAL_ATMOSPHERE',
      text: sanitizedText,
      speaker: sanitizeString(payload.speaker || '', 40),
      tone,
    },
  };

  return { valid: true, envelope: sanitizedEnvelope };
}
