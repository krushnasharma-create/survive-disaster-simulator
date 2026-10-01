// src/ai/director/directorValidator.ts
// Pure, deterministic validator for the Live Adaptive Disaster Director.
// Evaluates recommendations against allowlists, disaster compatibility, eligibility conditions,
// per-run cooldown windows, and severity boundaries without LLM or network dependency.

import {
  isAllowlistedDirectorEvent,
  getDirectorEvent,
} from './eventRegistry';
import type { DirectorCooldownTracker } from './cooldownTracker';
import type {
  DirectorContext,
  DirectorRecommendation,
  DirectorValidationResult,
  DirectorEventId,
} from './directorTypes';

/**
 * Pure deterministic validation pipeline for any Director recommendation (baseline or Jev).
 */
export function validateDirectorRecommendation(
  recommendation: DirectorRecommendation,
  context: DirectorContext,
  cooldownTracker: DirectorCooldownTracker
): DirectorValidationResult {
  // 1. Check if event is allowlisted
  if (!isAllowlistedDirectorEvent(recommendation.eventId)) {
    return {
      valid: false,
      eventId: 'UNKNOWN',
      rejectionReason: `Event "${recommendation.eventId}" is not in the allowlisted Director registry.`,
      clampedSeverity: 1,
    };
  }

  const event = getDirectorEvent(recommendation.eventId)!;
  const eventId = event.id as DirectorEventId;

  // 2. Check disaster compatibility
  if (!event.compatibleDisasters.includes(context.disasterType)) {
    return {
      valid: false,
      eventId,
      rejectionReason: `Event "${event.label}" is incompatible with disaster type "${context.disasterType}".`,
      clampedSeverity: 1,
      event,
    };
  }

  // 3. Check current state eligibility conditions
  if (!event.eligibility(context)) {
    return {
      valid: false,
      eventId,
      rejectionReason: `Simulation state at node "${context.currentNodeId}" does not satisfy eligibility criteria for "${event.label}".`,
      clampedSeverity: 1,
      event,
    };
  }

  // 4. Check cooldown satisfaction
  if (cooldownTracker.isOnCooldown(eventId, context.currentStep)) {
    const remaining = cooldownTracker.getRemainingCooldown(eventId, context.currentStep);
    return {
      valid: false,
      eventId,
      rejectionReason: `Event "${event.label}" is on cooldown (${remaining} decision${remaining > 1 ? 's' : ''} remaining).`,
      clampedSeverity: 1,
      event,
      cooldownRemaining: remaining,
    };
  }

  // 5. Clamp and validate severity bounds
  let clampedSeverity = recommendation.severity;
  if (typeof clampedSeverity !== 'number' || Number.isNaN(clampedSeverity)) {
    clampedSeverity = event.minSeverity;
  } else {
    clampedSeverity = Math.max(event.minSeverity, Math.min(event.maxSeverity, Math.round(clampedSeverity)));
  }

  // Validation passed
  return {
    valid: true,
    eventId,
    clampedSeverity,
    event,
    cooldownRemaining: 0,
  };
}
