// src/ai/jev/jevTypes.ts
// Jev Decision Brain contracts and specific payload types.

import type {
  AiEnvelope,
  AiContext,
  JevRecommendation,
  BoundedEventType,
  BoundedNpcIntent,
  BoundedDifficultyRecommendation,
} from '../types';

export interface JevApiRequestPayload {
  version: '1.0';
  requestId: string;
  context: AiContext;
}

export interface JevApiResponsePayload {
  status: 'success' | 'error';
  confidence: number;
  boundedEvent: BoundedEventType;
  npcIntent: BoundedNpcIntent;
  difficultyPressure: BoundedDifficultyRecommendation;
  tacticalAdvisory: string;
  reasoningSummary: string;
}

export type JevEnvelope = AiEnvelope<JevRecommendation>;
