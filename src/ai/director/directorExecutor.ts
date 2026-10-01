// src/ai/director/directorExecutor.ts
// Deterministic Event Executor for the Live Adaptive Disaster Director — Pre-Venue Framework.
// Pure execution boundary enforcing safety truth immutability.
// The Director NEVER directly mutates panic, hazard, safetyIntegrity, visibility, score, or survival outcomes.

import { validateDirectorRecommendation } from './directorValidator';
import type { DirectorCooldownTracker } from './cooldownTracker';
import type {
  DirectorContext,
  DirectorRecommendation,
  DirectorExecutionResult,
  DirectorMode,
} from './directorTypes';

/**
 * Deterministic executor boundary for Director events.
 * Coordinates validation, per-run cooldown registration, and framework execution telemetry.
 */
export function executeDirectorEvent(
  recommendation: DirectorRecommendation,
  context: DirectorContext,
  cooldownTracker: DirectorCooldownTracker,
  mode: DirectorMode = 'PRE_VENUE'
): DirectorExecutionResult {
  // If director is turned OFF, bypass immediately
  if (mode === 'OFF') {
    return {
      eventId: 'NONE',
      executed: false,
      mode: 'OFF',
      status: 'REJECTED',
      triggerReason: 'Director mode is OFF.',
      source: recommendation.source,
      narrativeSummary: 'Disaster Director is disabled.',
      cooldownApplied: 0,
      validation: {
        valid: false,
        eventId: 'UNKNOWN',
        clampedSeverity: 1,
        rejectionReason: 'Director mode is OFF.',
      },
    };
  }

  // 1. Run pure deterministic validation pipeline
  const validation = validateDirectorRecommendation(recommendation, context, cooldownTracker);

  // 2. Handle validation failures
  if (!validation.valid || !validation.event) {
    const isCooldown = validation.rejectionReason?.includes('cooldown');
    return {
      eventId: validation.eventId !== 'UNKNOWN' ? validation.eventId : 'NONE',
      executed: false,
      mode,
      status: isCooldown ? 'COOLDOWN_BLOCKED' : 'REJECTED',
      triggerReason: recommendation.triggerReason,
      source: recommendation.source,
      narrativeSummary: validation.rejectionReason || 'Director recommendation failed deterministic validation.',
      cooldownApplied: 0,
      validation,
    };
  }

  const event = validation.event;

  // 3. Execution based on mode
  if (mode === 'PRE_VENUE') {
    // Record deterministic cooldown trigger
    cooldownTracker.recordTrigger(event.id, context.currentStep, event.cooldownNodes);

    // Pre-venue framework behavior: records framework hook telemetry and atmospheric pacing.
    // The genuine live adaptive mutation behavior will be implemented during the Round 2 venue session on 3 Oct 2026.
    return {
      eventId: event.id,
      executed: true,
      mode: 'PRE_VENUE',
      status: 'STANDBY_FRAMEWORK',
      triggerReason: recommendation.triggerReason,
      source: recommendation.source,
      narrativeSummary: `[PRE-VENUE FRAMEWORK] ${event.label}: ${event.explanation} (Advisory protocol: "${event.safeFallback}").`,
      cooldownApplied: event.cooldownNodes,
      validation,
    };
  }

  // VENUE_LIVE mode placeholder for 3 October 2026 onsite implementation
  cooldownTracker.recordTrigger(event.id, context.currentStep, event.cooldownNodes);
  return {
    eventId: event.id,
    executed: true,
    mode: 'VENUE_LIVE',
    status: 'EXECUTED',
    triggerReason: recommendation.triggerReason,
    source: recommendation.source,
    narrativeSummary: `[VENUE LIVE] ${event.label} executed with severity ${validation.clampedSeverity}/5.`,
    cooldownApplied: event.cooldownNodes,
    validation,
  };
}
