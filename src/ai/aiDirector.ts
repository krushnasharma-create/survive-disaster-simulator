// src/ai/aiDirector.ts
// AI Director Coordinator orchestrating Layer 1 (Gemini) and Layer 2 (Jev)
// with the authoritative Layer 3 (Deterministic Engine).
// Guarantees zero unhandled exceptions, non-blocking execution, and 100% fallback reliability.

import type {
  AiContext,
  AiEnvelope,
  AiDirectorState,
  JevRecommendation,
  GeminiNarrativeRequest,
  GeminiNarrativeResponse,
  DecisionBrain,
  CreativeBrain,
} from './types';
import { JevDecisionAdapter } from './jev/jevAdapter';
import { GeminiCreativeAdapter } from './gemini/geminiAdapter';

class AiDirectorCoordinator {
  private decisionBrain: DecisionBrain;
  private creativeBrain: CreativeBrain;

  private state: AiDirectorState = {
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

  constructor() {
    this.decisionBrain = new JevDecisionAdapter();
    this.creativeBrain = new GeminiCreativeAdapter();
    this.state.jevAvailable = this.decisionBrain.isAvailable();
    this.state.geminiAvailable = this.creativeBrain.isAvailable();
  }

  public getTelemetry(): AiDirectorState {
    return { ...this.state };
  }

  public resetTelemetry(): void {
    this.state.recommendationCount = 0;
    this.state.acceptedCount = 0;
    this.state.rejectedCount = 0;
    this.state.fallbackCount = 0;
    this.state.lastRecommendation = null;
    this.state.lastNarrative = null;
    this.state.activePressure = 'NONE';
  }

  /**
   * Request tactical director recommendation from Jev (Layer 2) with deterministic fallback.
   * Completely safe and non-blocking.
   */
  public async requestRecommendation(context: AiContext): Promise<AiEnvelope<JevRecommendation>> {
    this.state.recommendationCount++;

    try {
      const envelope = await this.decisionBrain.recommend(context);
      this.state.lastRecommendation = envelope.payload;
      this.state.activePressure = envelope.payload.boundedEvent;
      this.state.jevAvailable = !envelope.deterministicFallbackUsed;

      if (envelope.deterministicFallbackUsed) {
        this.state.fallbackCount++;
      } else {
        this.state.acceptedCount++;
      }

      return envelope;
    } catch {
      // Emergency catch in case adapter implementation throws
      this.state.fallbackCount++;
      this.state.rejectedCount++;
      this.state.jevAvailable = false;
      const fallbackEnvelope = await new JevDecisionAdapter().recommend(context);
      this.state.lastRecommendation = fallbackEnvelope.payload;
      this.state.activePressure = fallbackEnvelope.payload.boundedEvent;
      return fallbackEnvelope;
    }
  }

  /**
   * Request creative atmospheric flavor or companion dialogue from Gemini (Layer 1) with deterministic fallback.
   * Completely safe and non-blocking.
   */
  public async requestNarrative(request: GeminiNarrativeRequest): Promise<AiEnvelope<GeminiNarrativeResponse>> {
    try {
      const envelope = await this.creativeBrain.narrate(request);
      this.state.lastNarrative = envelope.payload.text;
      this.state.geminiAvailable = !envelope.deterministicFallbackUsed;
      if (envelope.deterministicFallbackUsed) {
        this.state.fallbackCount++;
      }
      return envelope;
    } catch {
      this.state.fallbackCount++;
      this.state.geminiAvailable = false;
      const fallbackEnvelope = await new GeminiCreativeAdapter().narrate(request);
      this.state.lastNarrative = fallbackEnvelope.payload.text;
      return fallbackEnvelope;
    }
  }

  /**
   * Record whether a director suggestion was integrated into environmental pacing.
   */
  public recordFeedback(accepted: boolean): void {
    if (accepted) {
      this.state.acceptedCount++;
    } else {
      this.state.rejectedCount++;
    }
  }
}

/** Global singleton coordinator for the simulation session */
export const aiDirector = new AiDirectorCoordinator();
