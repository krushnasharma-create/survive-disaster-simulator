// src/ai/jev/jevAdapter.ts
// Jev Decision Brain Adapter implementing the DecisionBrain interface.
// Communicates with optional external Jev endpoint if configured,
// with immediate, non-blocking fallback to the Deterministic Decision Engine.

import type {
  DecisionBrain,
  AiContext,
  AiEnvelope,
  JevRecommendation,
  BoundedEventType,
  BoundedNpcIntent,
  BoundedDifficultyRecommendation,
} from '../types';
import {
  JEV_PROVIDER_NAME,
  JEV_CONFIDENCE_THRESHOLD,
  JEV_TIMEOUT_MS,
  JEV_EXPIRATION_MS,
} from './jevPolicy';
import { validateJevEnvelope } from '../safetyFirewall';

/**
 * Deterministic Decision Engine acting as the unbreakable fallback for Jev.
 * Computes bounded environmental director suggestions based on grounded simulation state.
 */
export function generateDeterministicJevFallback(
  context: AiContext,
  reasoning = 'Deterministic rule-based simulation director fallback.'
): AiEnvelope<JevRecommendation> {
  let boundedEvent: BoundedEventType = 'NONE';
  let npcIntent: BoundedNpcIntent = 'GUIDE';
  let difficultyPressure: BoundedDifficultyRecommendation = 'HOLD';
  let tacticalAdvisory = 'Standard NDMA tactical corridor. Proceed with alert composure.';

  // 1. Prioritize cascading multi-disaster chain threats
  if (context.chainStatus.severity === 'ACTIVE' || context.chainStatus.severity === 'IMMINENT') {
    if (context.disasterType === 'earthquake') {
      boundedEvent = 'AFTERSHOCK_PRESSURE';
      npcIntent = 'WARN';
      tacticalAdvisory = 'Secondary gas line rupture reported nearby. Exercise extreme vigilance.';
    } else if (context.disasterType === 'fire') {
      boundedEvent = 'SMOKE_POCKET';
      npcIntent = 'GUIDE';
      tacticalAdvisory = 'Toxic smoke pocket detected along exit stairwell. Keep low to ground.';
    } else {
      boundedEvent = 'WATER_SURGE';
      npcIntent = 'STABILIZE';
      tacticalAdvisory = 'Submerged electrical line hazard detected downstream. Halt progression.';
    }
    difficultyPressure = 'INCREASE';
  }
  // 2. High panic / crowd disturbance
  else if (context.panicBand === 'HIGH' || context.panicBand === 'CRITICAL') {
    boundedEvent = 'PANIC_CROWD';
    npcIntent = 'STABILIZE';
    tacticalAdvisory = 'Group composure destabilizing. Maintain voice contact and clear spacing.';
    difficultyPressure = 'RECOVER';
  }
  // 3. Infrastructure and municipal corridor access degradation
  else if (context.citySummary.emergencyAccess < 50) {
    boundedEvent = 'ROUTE_CONGESTION';
    npcIntent = 'GUIDE';
    tacticalAdvisory = 'Corridor congestion reported. Follow marked emergency exits.';
    difficultyPressure = 'HOLD';
  }
  // 4. Structural or environmental instability
  else if (context.hazardLevel >= 60) {
    boundedEvent = context.disasterType === 'earthquake' ? 'STRUCTURAL_CREAK' : 'COMMUNICATION_STATIC';
    npcIntent = 'WARN';
    tacticalAdvisory = 'Local environmental integrity degraded. Verify pathway before moving.';
    difficultyPressure = 'HOLD';
  }

  return {
    requestId: `jev-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    contextVersion: '1.0',
    source: 'deterministic-fallback',
    confidence: 90,
    timestamp: Date.now(),
    allowedActions: [boundedEvent],
    expirationMs: JEV_EXPIRATION_MS,
    reasoningSummary: reasoning,
    deterministicFallbackUsed: true,
    payload: {
      type: 'DIRECTOR_RECOMMENDATION',
      boundedEvent,
      npcIntent,
      difficultyPressure,
      tacticalAdvisory,
    },
  };
}

/**
 * Jev Decision Brain Adapter
 */
export class JevDecisionAdapter implements DecisionBrain {
  public readonly providerName = JEV_PROVIDER_NAME;
  private readonly apiUrl: string | undefined;

  constructor() {
    // Optional environment variable configuration
    this.apiUrl = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_JEV_API_URL as string | undefined)
      : undefined;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiUrl && this.apiUrl.trim().length > 0);
  }

  public async recommend(context: AiContext): Promise<AiEnvelope<JevRecommendation>> {
    // If not configured, immediately return deterministic fallback without network overhead
    if (!this.isAvailable()) {
      return generateDeterministicJevFallback(context, 'Jev API endpoint unconfigured. Using deterministic director.');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), JEV_TIMEOUT_MS);

      const response = await fetch(this.apiUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          version: '1.0',
          requestId: `jev-req-${Date.now()}`,
          context,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return generateDeterministicJevFallback(
          context,
          `Jev endpoint returned HTTP ${response.status}. Fallback activated.`
        );
      }

      const rawJson = await response.json();

      // Enforce strict safety firewall
      const validation = validateJevEnvelope(rawJson);
      if (!validation.valid || !validation.envelope) {
        return generateDeterministicJevFallback(
          context,
          `Jev output rejected by Safety Firewall: ${validation.error || 'Unknown error'}`
        );
      }

      if (validation.envelope.confidence < JEV_CONFIDENCE_THRESHOLD) {
        return generateDeterministicJevFallback(
          context,
          `Jev confidence ${validation.envelope.confidence}% below threshold (${JEV_CONFIDENCE_THRESHOLD}%).`
        );
      }

      return validation.envelope;
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const reason = isTimeout
        ? `Jev request timed out after ${JEV_TIMEOUT_MS}ms.`
        : `Jev network error: ${err instanceof Error ? err.message : 'Unknown'}`;

      return generateDeterministicJevFallback(context, `${reason} Deterministic fallback activated.`);
    }
  }
}
