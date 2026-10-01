// src/ai/contextBuilder.ts
// Deterministic context builder creating sanitized, minimal context for the AI director.
// Zero secrets, zero credentials, zero private player data.

import type { DisasterType, DecisionNode } from '../data/types';
import type { SimulationState } from '../engine/simulationState';
import type { DecisionRecord } from '../store/gameStore';
import type { AiContext } from './types';

/**
 * Builds a sanitized, serializable context snapshot for AI director evaluation.
 * Exposes strictly simulation telemetry without any user-identifying metadata or credentials.
 */
export function buildAiContext(
  simulationState: SimulationState,
  node: DecisionNode,
  scenarioId: string,
  disasterType: DisasterType,
  recentDecisions: DecisionRecord[] = []
): AiContext {
  // Extract bounded squad summary
  const squad = simulationState.squadMembers || [];
  const activeCount = squad.filter((m) => m.status === 'SAFE' || m.status === 'STABLE').length;
  const distressedCount = squad.filter(
    (m) => m.status === 'DISTRESSED' || m.status === 'INJURED' || m.status === 'CRITICAL'
  ).length;
  const roles = squad.map((m) => m.role);

  // Extract bounded city summary
  const city = simulationState.cityBrain;
  const citySummary = {
    macroStatus: city?.macroStatus || 'OPERATIONAL',
    emergencyAccess: city?.emergencyAccess ?? 85,
    utilityStability: city?.utilityStability ?? 80,
  };

  // Extract bounded chain summary
  const chain = simulationState.disasterChain;
  const chainStatus = {
    severity: chain?.chainSeverity || 'INACTIVE',
    chainTitle: chain?.chainTitle,
  };

  // Slice last 3 decisions for localized context
  const recentHistory = recentDecisions.slice(-3).map((d) => ({
    nodeId: d.nodeId,
    choiceLabel: d.choiceLabel.slice(0, 80),
    isCorrect: d.isCorrect,
  }));

  return {
    disasterType,
    scenarioId,
    nodeId: node.id,
    situationTitle: node.situationText.slice(0, 100),
    panicBand: simulationState.panicBand,
    panicLevel: simulationState.panic,
    hazardBand: simulationState.convergenceBand,
    hazardLevel: simulationState.hazardLevel,
    convergenceBand: simulationState.convergenceBand,
    environmentStatus: simulationState.environmentStatus,
    difficultyLevel: simulationState.difficultyLevel,
    squadSummary: {
      cohesion: simulationState.squadCohesion,
      activeCount,
      distressedCount,
      roles,
    },
    citySummary,
    chainStatus,
    recentDecisions: recentHistory,
  };
}
