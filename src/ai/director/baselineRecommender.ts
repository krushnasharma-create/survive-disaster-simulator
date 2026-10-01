// src/ai/director/baselineRecommender.ts
// Pre-Venue Deterministic Baseline Recommendation Logic for the Live Adaptive Disaster Director.
// Evaluates environmental simulation telemetry to propose allowlisted Director event candidates.
// NOTE: This represents the pre-venue architectural framework. The full real-time adaptive
// intelligence and dynamic adaptation models are reserved for the Round 2 venue implementation on 3 October 2026.

import {
  DIRECTOR_EVENT_REGISTRY,
  getCompatibleDirectorEvents,
} from './eventRegistry';
import type {
  DirectorContext,
  DirectorRecommendation,
  DirectorEventId,
} from './directorTypes';

/**
 * Computes a deterministic baseline recommendation from grounded simulation telemetry.
 * 100% offline, deterministic, and safe.
 */
export function generateBaselineRecommendation(
  context: DirectorContext
): DirectorRecommendation {
  let eventId: DirectorEventId = 'ROUTE_CONGESTION';
  let severity = 2;
  let triggerReason = 'Standard evacuation corridor monitoring.';

  // 1. Cascading secondary hazard priority
  if (context.disasterChainState && (context.disasterChainState.severity === 'ACTIVE' || context.disasterChainState.severity === 'IMMINENT')) {
    if (context.disasterType === 'earthquake') {
      eventId = 'AFTERSHOCK_PRESSURE';
      severity = 4;
      triggerReason = `Cascading secondary risk imminent (${context.disasterChainState.chainTitle || 'Structural Cascade'}).`;
    } else if (context.disasterType === 'fire') {
      eventId = 'SMOKE_DENSITY_SURGE';
      severity = 4;
      triggerReason = `Cascading secondary risk imminent (${context.disasterChainState.chainTitle || 'Flashover Cascade'}).`;
    } else {
      eventId = 'WATER_SURGE';
      severity = 4;
      triggerReason = `Cascading secondary risk imminent (${context.disasterChainState.chainTitle || 'Submerged Cascade'}).`;
    }
  }
  // 2. High hazard environment pressure
  else if (context.hazardLevel >= 50 || context.convergenceBand === 'CRITICAL_RISK' || context.convergenceBand === 'HIGH_RISK') {
    if (context.disasterType === 'earthquake') {
      eventId = context.hazardLevel >= 70 ? 'AFTERSHOCK_PRESSURE' : 'DEBRIS_FALL';
      severity = 3;
      triggerReason = `Severe seismic hazard accumulation (${context.hazardLevel}% hazard).`;
    } else if (context.disasterType === 'fire') {
      eventId = context.visibility <= 50 ? 'SMOKE_DENSITY_SURGE' : 'POWER_FLICKER';
      severity = 3;
      triggerReason = `Severe thermal hazard accumulation (${context.hazardLevel}% hazard).`;
    } else {
      eventId = 'WATER_SURGE';
      severity = 3;
      triggerReason = `Severe hydrological hazard accumulation (${context.hazardLevel}% hazard).`;
    }
  }
  // 3. High civilian panic or squad distress
  else if (context.panic >= 50 || context.squadCohesion <= 60) {
    eventId = 'PANIC_RIPPLE';
    severity = 3;
    triggerReason = `Critical crowd stress and companion distress detected (Panic: ${context.panic}/100).`;
  }
  // 4. Low municipal emergency access
  else if (context.emergencyAccess <= 60) {
    eventId = 'ROUTE_CONGESTION';
    severity = 3;
    triggerReason = `Municipal emergency corridor bottleneck (Access: ${context.emergencyAccess}%).`;
  }
  // 5. Utility grid instability
  else if (context.utilityStability <= 60) {
    eventId = 'POWER_FLICKER';
    severity = 2;
    triggerReason = `Critical municipal electrical grid strain (Utility Stability: ${context.utilityStability}%).`;
  }
  // 6. Reduced visibility
  else if (context.visibility <= 70) {
    eventId = context.disasterType === 'fire' ? 'SMOKE_DENSITY_SURGE' : 'ROUTE_CONGESTION';
    severity = 2;
    triggerReason = `Degraded environmental visibility (${context.visibility}%).`;
  }
  // 7. Disaster-specific baseline defaults
  else {
    if (context.disasterType === 'earthquake') {
      eventId = context.currentStep % 2 === 0 ? 'AFTERSHOCK_PRESSURE' : 'DEBRIS_FALL';
      severity = 2;
      triggerReason = 'Standard seismic structural strain baseline.';
    } else if (context.disasterType === 'fire') {
      eventId = context.currentStep % 2 === 0 ? 'SMOKE_DENSITY_SURGE' : 'POWER_FLICKER';
      severity = 2;
      triggerReason = 'Standard structure fire egress monitoring baseline.';
    } else {
      eventId = context.currentStep % 2 === 0 ? 'WATER_SURGE' : 'COMM_DELAY';
      severity = 2;
      triggerReason = 'Standard urban flood water level monitoring baseline.';
    }
  }

  // 8. Fallback to any compatible and eligible event if initial candidate isn't eligible
  const candidateDef = DIRECTOR_EVENT_REGISTRY[eventId];
  if (candidateDef && !candidateDef.eligibility(context)) {
    const compatible = getCompatibleDirectorEvents(context.disasterType);
    const eligible = compatible.find((e) => e.eligibility(context));
    if (eligible) {
      eventId = eligible.id;
      severity = eligible.minSeverity;
      triggerReason = `Standard environmental monitoring baseline (${eligible.label}).`;
    }
  }

  return {
    eventId,
    severity,
    source: 'DETERMINISTIC',
    triggerReason,
    confidence: 88,
  };
}
