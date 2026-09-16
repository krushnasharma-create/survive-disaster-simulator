// src/engine/scenarioRunner.ts
// Pure function engine for scenario node retrieval and player decision evaluation.

import type { Scenario, ScenarioNode, DecisionNode, Choice } from '../data/types';
import type { DecisionRecord } from '../store/gameStore';

export interface EvaluationResult {
  choice: Choice;
  consequenceText: string;
  insight: string;
  insightSource: string;
  isCorrect: boolean;
  scoreImpact: number;
  timeBonus: number;
  nextNodeId: string;
  record: DecisionRecord;
}

/**
 * Retrieves a specific node by ID from a scenario.
 */
export function getNode(scenario: Scenario, nodeId: string): ScenarioNode | undefined {
  return scenario.nodes[nodeId];
}

/**
 * Evaluates a player choice against a decision node.
 * Calculates time bonus if decision is timed and answered with remaining seconds.
 */
export function evaluateChoice(
  node: DecisionNode,
  choiceId: string,
  remainingSeconds?: number
): EvaluationResult {
  const choice = node.choices.find((c) => c.id === choiceId);
  if (!choice) {
    throw new Error(`Choice ID "${choiceId}" not found in node "${node.id}"`);
  }

  // Calculate speed bonus if timed and answered quickly (positive choice only)
  let timeBonus = 0;
  if (choice.isCorrect && node.timeLimit && remainingSeconds && remainingSeconds > 0) {
    // Up to 5 bonus points for rapid decisive action
    timeBonus = Math.min(5, Math.ceil((remainingSeconds / node.timeLimit) * 5));
  }

  const record: DecisionRecord = {
    nodeId: node.id,
    situationText: node.situationText,
    choiceId: choice.id,
    choiceLabel: choice.label,
    isCorrect: choice.isCorrect,
    scoreImpact: choice.scoreImpact,
    timeBonus,
    consequenceText: choice.consequenceText,
    insight: choice.insight,
    insightSource: choice.insightSource,
    nextNodeId: choice.nextNodeId,
  };

  return {
    choice,
    consequenceText: choice.consequenceText,
    insight: choice.insight,
    insightSource: choice.insightSource,
    isCorrect: choice.isCorrect,
    scoreImpact: choice.scoreImpact,
    timeBonus,
    nextNodeId: choice.nextNodeId,
    record,
  };
}