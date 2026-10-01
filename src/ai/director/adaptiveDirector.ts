// src/ai/director/adaptiveDirector.ts
// Live Adaptive Disaster Director — Pre-Venue Coordinator.
// Manages director modes, deterministic evaluation pipeline, telemetry aggregation,
// and session resets while strictly preserving safety-critical state immutability.

import { DirectorCooldownTracker } from './cooldownTracker';
import { generateBaselineRecommendation } from './baselineRecommender';
import { executeDirectorEvent } from './directorExecutor';
import { ALLOWED_DIRECTOR_EVENT_IDS } from './eventRegistry';
import type { DisasterType } from '../../data/types';
import type { SimulationState } from '../../engine/simulationState';
import type {
  DirectorMode,
  DirectorContext,
  DirectorRecommendation,
  DirectorExecutionResult,
  DirectorAuditTelemetry,
  DirectorEventId,
} from './directorTypes';

class AdaptiveDisasterDirectorCoordinator {
  private mode: DirectorMode = 'PRE_VENUE';
  private cooldownTracker: DirectorCooldownTracker = new DirectorCooldownTracker();
  private recentEvents: DirectorEventId[] = [];

  private telemetry: DirectorAuditTelemetry = {
    mode: 'PRE_VENUE',
    recommendationsCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    fallbackCount: 0,
    validationCount: 0,
    executionCount: 0,
    cooldownBlocks: 0,
    sourceBreakdown: {
      deterministic: 0,
      jev: 0,
      fallback: 0,
    },
    eventFrequency: {
      ROUTE_CONGESTION: 0,
      AFTERSHOCK_PRESSURE: 0,
      DEBRIS_FALL: 0,
      SMOKE_DENSITY_SURGE: 0,
      COMM_DELAY: 0,
      PANIC_RIPPLE: 0,
      WATER_SURGE: 0,
      POWER_FLICKER: 0,
    },
    activeCooldowns: {},
  };

  public getMode(): DirectorMode {
    return this.mode;
  }

  public setMode(mode: DirectorMode): void {
    this.mode = mode;
    this.telemetry.mode = mode;
  }

  public getRecentEvents(): DirectorEventId[] {
    return [...this.recentEvents];
  }

  public resetSession(): void {
    this.cooldownTracker.reset();
    this.recentEvents = [];
    this.telemetry = {
      mode: this.mode,
      recommendationsCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      fallbackCount: 0,
      validationCount: 0,
      executionCount: 0,
      cooldownBlocks: 0,
      sourceBreakdown: {
        deterministic: 0,
        jev: 0,
        fallback: 0,
      },
      eventFrequency: {
        ROUTE_CONGESTION: 0,
        AFTERSHOCK_PRESSURE: 0,
        DEBRIS_FALL: 0,
        SMOKE_DENSITY_SURGE: 0,
        COMM_DELAY: 0,
        PANIC_RIPPLE: 0,
        WATER_SURGE: 0,
        POWER_FLICKER: 0,
      },
      activeCooldowns: {},
    };
  }

  /**
   * Evaluates the current scenario step through the strict Director pipeline.
   * Priority: Validated Jev suggestion -> Deterministic Baseline Fallback.
   */
  public evaluateStep(
    context: DirectorContext,
    candidateRecommendation?: DirectorRecommendation | null
  ): DirectorExecutionResult {
    this.telemetry.recommendationsCount++;

    let targetRec: DirectorRecommendation;

    // 1. If an external candidate (e.g. from Jev) was supplied, test it
    if (candidateRecommendation && candidateRecommendation.source === 'JEV') {
      this.telemetry.validationCount++;
      const result = executeDirectorEvent(
        candidateRecommendation,
        context,
        this.cooldownTracker,
        this.mode
      );

      if (result.executed) {
        this.recordSuccess(result);
        this.telemetry.sourceBreakdown.jev++;
        return result;
      }

      // Candidate failed validation or was on cooldown: seamlessly fall back
      this.telemetry.rejectedCount++;
      if (result.status === 'COOLDOWN_BLOCKED') {
        this.telemetry.cooldownBlocks++;
      }
      this.telemetry.fallbackCount++;
      this.telemetry.sourceBreakdown.fallback++;

      // Compute deterministic baseline fallback
      targetRec = generateBaselineRecommendation(context);
      targetRec.source = 'FALLBACK';
      targetRec.triggerReason = `Jev suggestion rejected (${result.validation.rejectionReason || 'Invalid'}). Fallback engaged: ${targetRec.triggerReason}`;
    } else {
      // 2. Default: Deterministic baseline recommendation
      targetRec = generateBaselineRecommendation(context);
      this.telemetry.sourceBreakdown.deterministic++;
    }

    // 3. Execute target recommendation
    this.telemetry.validationCount++;
    const finalResult = executeDirectorEvent(
      targetRec,
      context,
      this.cooldownTracker,
      this.mode
    );

    if (finalResult.executed) {
      this.recordSuccess(finalResult);
    } else {
      this.telemetry.rejectedCount++;
      if (finalResult.status === 'COOLDOWN_BLOCKED') {
        this.telemetry.cooldownBlocks++;
      }
    }

    return finalResult;
  }

  private recordSuccess(result: DirectorExecutionResult): void {
    this.telemetry.acceptedCount++;
    this.telemetry.executionCount++;

    if (result.eventId !== 'NONE' && ALLOWED_DIRECTOR_EVENT_IDS.includes(result.eventId)) {
      this.telemetry.eventFrequency[result.eventId] =
        (this.telemetry.eventFrequency[result.eventId] || 0) + 1;
      this.recentEvents.push(result.eventId);
      if (this.recentEvents.length > 5) {
        this.recentEvents.shift();
      }
    }
  }

  public getTelemetry(currentStep: number): DirectorAuditTelemetry {
    return {
      ...this.telemetry,
      activeCooldowns: this.cooldownTracker.getCooldownState(currentStep),
    };
  }

  public getCooldownTracker(): DirectorCooldownTracker {
    return this.cooldownTracker;
  }
}

/** Global singleton coordinator for the Live Adaptive Disaster Director */
export const adaptiveDirector = new AdaptiveDisasterDirectorCoordinator();

/**
 * Builds a sanitized, bounded simulation context for the Director.
 * Contains zero secrets, zero credentials, and strictly simulation metrics.
 */
export function buildDirectorContext(
  simulationState: SimulationState,
  scenarioId: string,
  disasterType: DisasterType,
  currentNodeId: string,
  currentStep: number,
  recentEvents: DirectorEventId[] = []
): DirectorContext {
  return {
    disasterType,
    scenarioId,
    currentNodeId,
    currentStep,
    panic: simulationState.panic,
    panicBand: simulationState.panicBand,
    hazardLevel: simulationState.hazardLevel,
    hazardBand: simulationState.convergenceBand,
    safetyIntegrity: simulationState.safetyIntegrity,
    visibility: simulationState.visibility,
    difficultyLevel: simulationState.difficultyLevel,
    squadCohesion: simulationState.squadCohesion ?? 100,
    cityStatus: simulationState.cityBrain?.macroStatus ?? 'OPERATIONAL',
    emergencyAccess: simulationState.cityBrain?.emergencyAccess ?? 85,
    utilityStability: simulationState.cityBrain?.utilityStability ?? 80,
    convergenceBand: simulationState.convergenceBand,
    disasterChainState: simulationState.disasterChain
      ? {
          severity: simulationState.disasterChain.chainSeverity,
          chainTitle: simulationState.disasterChain.chainTitle,
        }
      : undefined,
    recentDirectorEvents: recentEvents,
  };
}
