// src/ai/director/eventRegistry.ts
// Deterministic Event Registry for the Live Adaptive Disaster Director.
// All Director events must be registered here. Arbitrary or unknown events are strictly rejected.

import type { DisasterType } from '../../data/types';
import type {
  DirectorEvent,
  DirectorEventId,
  DirectorContext,
} from './directorTypes';

export const ALLOWED_DIRECTOR_EVENT_IDS: readonly DirectorEventId[] = [
  'ROUTE_CONGESTION',
  'AFTERSHOCK_PRESSURE',
  'DEBRIS_FALL',
  'SMOKE_DENSITY_SURGE',
  'COMM_DELAY',
  'PANIC_RIPPLE',
  'WATER_SURGE',
  'POWER_FLICKER',
] as const;

/**
 * Deterministic registry of all allowlisted Director events with strict eligibility functions.
 */
export const DIRECTOR_EVENT_REGISTRY: Record<DirectorEventId, DirectorEvent> = {
  ROUTE_CONGESTION: {
    id: 'ROUTE_CONGESTION',
    label: 'Route Congestion & Bottleneck',
    explanation: 'Evacuation corridors choked by panic-driven bottlenecks or stalled transit.',
    category: 'route',
    compatibleDisasters: ['earthquake', 'fire', 'flood'],
    minSeverity: 1,
    maxSeverity: 5,
    cooldownNodes: 2,
    eligibility: (ctx: DirectorContext) =>
      ctx.emergencyAccess <= 75 || ctx.panic >= 40 || ctx.cityStatus !== 'OPERATIONAL',
    safeFallback: 'Maintain primary egress route with orderly spacing and disciplined pacing.',
  },

  AFTERSHOCK_PRESSURE: {
    id: 'AFTERSHOCK_PRESSURE',
    label: 'Secondary Aftershock Tremor',
    explanation: 'Secondary seismic pulses destabilize compromised masonry and ceiling grids.',
    category: 'environmental',
    compatibleDisasters: ['earthquake'],
    minSeverity: 1,
    maxSeverity: 5,
    cooldownNodes: 2,
    eligibility: (ctx: DirectorContext) =>
      ctx.disasterType === 'earthquake' && (ctx.hazardLevel >= 15 || ctx.convergenceBand !== 'LOW_RISK'),
    safeFallback: 'Drop, Cover, and Hold On beneath structural load-bearing cover immediately.',
  },

  DEBRIS_FALL: {
    id: 'DEBRIS_FALL',
    label: 'Falling Debris & Structural Shatter',
    explanation: 'Falling architectural facade, broken glass, or ceiling fixtures obstruct path.',
    category: 'infrastructure',
    compatibleDisasters: ['earthquake', 'fire'],
    minSeverity: 1,
    maxSeverity: 4,
    cooldownNodes: 2,
    eligibility: (ctx: DirectorContext) =>
      (ctx.disasterType === 'earthquake' || ctx.disasterType === 'fire') &&
      (ctx.hazardLevel >= 25 || ctx.safetyIntegrity <= 80),
    safeFallback: 'Shield head and vital organs with sturdy materials or folded arms.',
  },

  SMOKE_DENSITY_SURGE: {
    id: 'SMOKE_DENSITY_SURGE',
    label: 'Toxic Smoke Density Surge',
    explanation: 'Combustion gases billow into stairwells, degrading thermal safety and visibility.',
    category: 'environmental',
    compatibleDisasters: ['fire'],
    minSeverity: 1,
    maxSeverity: 5,
    cooldownNodes: 2,
    eligibility: (ctx: DirectorContext) =>
      ctx.disasterType === 'fire' && (ctx.visibility <= 85 || ctx.hazardLevel >= 20),
    safeFallback: 'Drop beneath the smoke layer and cover airway with damp cloth.',
  },

  COMM_DELAY: {
    id: 'COMM_DELAY',
    label: 'Emergency Telecom Network Congestion',
    explanation: 'Network tower overload delays dispatch coordination and emergency broadcast.',
    category: 'communication',
    compatibleDisasters: ['earthquake', 'flood'],
    minSeverity: 1,
    maxSeverity: 3,
    cooldownNodes: 2,
    eligibility: (ctx: DirectorContext) =>
      (ctx.disasterType === 'earthquake' || ctx.disasterType === 'flood') &&
      (ctx.utilityStability <= 70 || ctx.panic >= 50),
    safeFallback: 'Avoid voice calls; send brief SMS texts to conserve battery and bandwidth.',
  },

  PANIC_RIPPLE: {
    id: 'PANIC_RIPPLE',
    label: 'Civilian Panic Contagion',
    explanation: 'Unchecked crowd anxiety threatens to trigger stampedes at exit bottlenecks.',
    category: 'panic',
    compatibleDisasters: ['earthquake', 'fire', 'flood'],
    minSeverity: 1,
    maxSeverity: 4,
    cooldownNodes: 2,
    eligibility: (ctx: DirectorContext) =>
      ctx.panic >= 30 || ctx.squadCohesion <= 70,
    safeFallback: 'Issue calm, authoritative verbal directions to steady nearby companions.',
  },

  WATER_SURGE: {
    id: 'WATER_SURGE',
    label: 'Torrential Runoff & Water Surge',
    explanation: 'Drainage backflow rapidly inundates low-lying ground escape avenues.',
    category: 'environmental',
    compatibleDisasters: ['flood'],
    minSeverity: 1,
    maxSeverity: 5,
    cooldownNodes: 2,
    eligibility: (ctx: DirectorContext) =>
      ctx.disasterType === 'flood' && (ctx.hazardLevel >= 20 || ctx.emergencyAccess <= 70),
    safeFallback: 'Seek immediate high ground; never step or drive into moving water.',
  },

  POWER_FLICKER: {
    id: 'POWER_FLICKER',
    label: 'Electrical Grid Tripping & Blackout',
    explanation: 'Transformer faults extinguish primary illumination and trigger emergency circuits.',
    category: 'infrastructure',
    compatibleDisasters: ['earthquake', 'fire', 'flood'],
    minSeverity: 1,
    maxSeverity: 4,
    cooldownNodes: 2,
    eligibility: (ctx: DirectorContext) =>
      ctx.utilityStability <= 65 || ctx.hazardLevel >= 30,
    safeFallback: 'Bypass electric elevators completely; use stairwells and secondary lighting.',
  },
};

/**
 * Checks whether an event ID is registered in the allowlist.
 */
export function isAllowlistedDirectorEvent(eventId: unknown): eventId is DirectorEventId {
  return typeof eventId === 'string' && ALLOWED_DIRECTOR_EVENT_IDS.includes(eventId as DirectorEventId);
}

/**
 * Retrieves an event from the registry, or null if unknown.
 */
export function getDirectorEvent(eventId: unknown): DirectorEvent | null {
  if (isAllowlistedDirectorEvent(eventId)) {
    return DIRECTOR_EVENT_REGISTRY[eventId];
  }
  return null;
}

/**
 * Returns all registered events compatible with a disaster type.
 */
export function getCompatibleDirectorEvents(disasterType: DisasterType): DirectorEvent[] {
  return Object.values(DIRECTOR_EVENT_REGISTRY).filter((event) =>
    event.compatibleDisasters.includes(disasterType)
  );
}
