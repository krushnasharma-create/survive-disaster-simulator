// src/ai/jev/jevAdapter.ts
// Jev Decision Brain Adapter implementing the DecisionBrain interface.
// Connects via the Secure Live AI Gateway (/api/ai) with server-side credential isolation,
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

import { gatewayClient } from '../gateway/gatewayClient';

/**
 * Jev Decision Brain Adapter
 * Communicates with the Secure Live AI Gateway (/api/ai),
 * with immediate, zero-latency fallback to the Deterministic Decision Engine.
 */
export class JevDecisionAdapter implements DecisionBrain {
  public readonly providerName = JEV_PROVIDER_NAME;
  private isLiveConnected = false;

  public isAvailable(): boolean {
    return this.isLiveConnected;
  }

  public setLiveConnected(connected: boolean): void {
    this.isLiveConnected = connected;
  }

  public async recommend(context: AiContext): Promise<AiEnvelope<JevRecommendation>> {
    // 1. Try requesting recommendation through the server-side gateway boundary
    try {
      const gatewayEnvelope = await gatewayClient.recommend(context);
      if (gatewayEnvelope) {
        // Enforce safety firewall on gateway output
        const validation = validateJevEnvelope(gatewayEnvelope);
        if (validation.valid && validation.envelope && validation.envelope.confidence >= JEV_CONFIDENCE_THRESHOLD) {
          if (!validation.envelope.deterministicFallbackUsed) {
            this.isLiveConnected = true;
          }
          return validation.envelope;
        }
      }
    } catch {
      // Fall through to deterministic fallback
    }

    // 2. Unbreakable deterministic fallback
    return generateDeterministicJevFallback(
      context,
      'Live Jev gateway unconfigured or in fallback mode. Using deterministic director.'
    );
  }
}
