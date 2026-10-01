// scratch/test_all_scenarios_gameplay.ts
// Exhaustive Gameplay QA & Simulation Validation Suite
// Validates all 7 playable scenarios: graph integrity, node transitions,
// deterministic state progression, optimal & suboptimal paths, scoring, and report building.

import assert from 'node:assert';
import { getScenario } from '../src/data/index.js';
import type { DecisionNode, OutcomeNode, DisasterType } from '../src/data/types.js';
import { evaluateChoice, getNode } from '../src/engine/scenarioRunner.js';
import { calculateScore } from '../src/engine/scoreCalculator.js';
import { buildReport } from '../src/engine/reportBuilder.js';
import { createInitialSimulationState } from '../src/engine/simulationState.js';
import type { DecisionRecord } from '../src/store/gameStore.js';

console.log('========================================================');
console.log('🎮 EXHAUSTIVE GAMEPLAY QA & SCENARIO AUDIT SUITE');
console.log('========================================================\n');

const PLAYABLE_SCENARIOS = [
  { id: 'earthquake-urban', disaster: 'earthquake' as DisasterType, name: 'Urban Apartment Earthquake' },
  { id: 'earthquake-workplace', disaster: 'earthquake' as DisasterType, name: 'Commercial Workplace Earthquake' },
  { id: 'earthquake-bhuj-2001', disaster: 'earthquake' as DisasterType, name: 'Bhuj Seismic Emergency' },
  { id: 'fire-residential', disaster: 'fire' as DisasterType, name: 'Structure Fire (Residential)' },
  { id: 'fire-commercial', disaster: 'fire' as DisasterType, name: 'Commercial High-Rise Fire' },
  { id: 'flood-urban', disaster: 'flood' as DisasterType, name: 'Flash Flood (Urban Colony)' },
  { id: 'flood-street', disaster: 'flood' as DisasterType, name: 'Urban Street & Transit Flood' },
];

let totalAssertions = 0;

function check(condition: boolean, msg: string) {
  assert(condition, msg);
  totalAssertions++;
}

// ----------------------------------------------------
// SECTION 1: CATALOGUE & SCENARIO REGISTRY INTEGRITY
// ----------------------------------------------------
console.log('▶ [SECTION 1] Checking Catalogue & Scenario Registry...');

for (const item of PLAYABLE_SCENARIOS) {
  const scenario = getScenario(item.id);
  check(Boolean(scenario), `Scenario "${item.id}" must exist in registry`);
  if (!scenario) continue;

  check(scenario.theme === item.disaster, `Scenario theme matches disaster`);
  check(typeof scenario.title === 'string' && scenario.title.length > 0, `Scenario has title: ${scenario.title}`);
  check(typeof scenario.startNodeId === 'string', `Scenario has startNodeId: ${scenario.startNodeId}`);
  check(Boolean(scenario.nodes[scenario.startNodeId]), `startNodeId exists in nodes dictionary`);

  console.log(`  ✓ ${item.name} (${item.id}): Registered with ${Object.keys(scenario.nodes).length} nodes`);
}

// ----------------------------------------------------
// SECTION 2: GRAPH INTEGRITY & DEAD-END DETECTION
// ----------------------------------------------------
console.log('\n▶ [SECTION 2] Exhaustive Graph Walk & Dead-End Detection for all 7 Scenarios...');

for (const item of PLAYABLE_SCENARIOS) {
  const scenario = getScenario(item.id)!;
  let decisionNodeCount = 0;
  let outcomeNodeCount = 0;

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    check(node.id === nodeId, `Node ID matches key: ${nodeId}`);
    
    if (node.type === 'decision') {
      decisionNodeCount++;
      const decNode = node as DecisionNode;
      check(typeof decNode.situationText === 'string' && decNode.situationText.length > 0, `Node ${nodeId} has situationText`);
      check(Array.isArray(decNode.choices) && decNode.choices.length >= 2, `Node ${nodeId} has at least 2 choices`);

      for (const choice of decNode.choices) {
        check(typeof choice.id === 'string' && choice.id.length > 0, `Choice in ${nodeId} has valid id`);
        check(typeof choice.label === 'string' && choice.label.length > 0, `Choice in ${nodeId} has label`);
        check(typeof choice.consequenceText === 'string' && choice.consequenceText.length > 0, `Choice in ${nodeId} has consequenceText`);
        check(typeof choice.insight === 'string' && choice.insight.length > 0, `Choice in ${nodeId} has insight`);
        check(typeof choice.isCorrect === 'boolean', `Choice in ${nodeId} has boolean isCorrect`);
        check(typeof choice.nextNodeId === 'string', `Choice in ${nodeId} has nextNodeId`);

        // Check target node exists in scenario
        const targetNode = scenario.nodes[choice.nextNodeId];
        check(Boolean(targetNode), `Choice "${choice.id}" in node "${nodeId}" targets existing node "${choice.nextNodeId}"`);
      }
    } else if (node.type === 'outcome') {
      outcomeNodeCount++;
      const outNode = node as OutcomeNode;
      check(typeof outNode.survived === 'boolean', `Outcome node ${nodeId} has boolean survived`);
      check(typeof outNode.narrativeText === 'string' && outNode.narrativeText.length > 0, `Outcome node ${nodeId} has narrativeText`);
    }
  }

  check(decisionNodeCount > 0, `Scenario ${item.id} has decision nodes`);
  check(outcomeNodeCount > 0, `Scenario ${item.id} has outcome nodes`);
  console.log(`  ✓ ${item.name}: Graph verified (${decisionNodeCount} decisions, ${outcomeNodeCount} outcomes, 0 dead-ends)`);
}

// ----------------------------------------------------
// SECTION 3: OPTIMAL PATH SIMULATION (SURVIVABLE RUNS)
// ----------------------------------------------------
console.log('\n▶ [SECTION 3] Simulating Optimal Survival Runs Across All 7 Scenarios...');

for (const item of PLAYABLE_SCENARIOS) {
  const scenario = getScenario(item.id)!;
  let currentNodeId = scenario.startNodeId;
  let simState = createInitialSimulationState(item.disaster);
  const decisionRecords: DecisionRecord[] = [];
  let steps = 0;
  const maxSteps = 20;

  while (steps < maxSteps) {
    steps++;
    const node = getNode(scenario, currentNodeId);
    check(Boolean(node), `Node ${currentNodeId} retrieved successfully`);
    if (!node) break;

    if (node.type === 'outcome') {
      // Terminal node reached
      check((node as OutcomeNode).survived === true, `Optimal path in ${item.id} results in survival`);
      break;
    }

    const decNode = node as DecisionNode;
    // Pick the optimal (isCorrect = true) choice
    const optimalChoice = decNode.choices.find((c) => c.isCorrect) || decNode.choices[0];
    const evalResult = evaluateChoice(
      decNode,
      optimalChoice.id,
      decNode.timeLimit ? Math.floor(decNode.timeLimit / 2) : undefined,
      simState,
      item.disaster
    );

    check(evalResult.isCorrect === true, `Optimal choice evaluated as correct`);
    check(evalResult.scoreImpact > 0, `Optimal choice has positive scoreImpact`);
    check(Boolean(evalResult.nextSimulationState), `nextSimulationState generated`);

    simState = evalResult.nextSimulationState!;
    decisionRecords.push(evalResult.record);
    currentNodeId = evalResult.nextNodeId;
  }

  check(decisionRecords.length >= 2, `Optimal run made at least 2 decisions`);

  // Verify scoring
  const score = calculateScore(decisionRecords);
  check(score.score >= 70, `Optimal run score >= 70 (got ${score.score})`);
  check(score.optimalCount === decisionRecords.length, `All decisions were optimal`);
  check(score.suboptimalCount === 0, `Zero suboptimal decisions`);

  // Verify report generation
  const report = buildReport(decisionRecords, item.disaster);
  check(report.scoreSummary.score === score.score, `Report score matches calculated score`);
  check(report.keyTakeaways.length > 0, `Report includes NDMA takeaways`);
  check(report.officialHelplines.length > 0, `Report includes emergency helplines`);

  console.log(`  ✓ ${item.name}: Optimal run completed in ${decisionRecords.length} steps -> Score: ${score.score}% (${score.band})`);
}

// ----------------------------------------------------
// SECTION 4: SUBOPTIMAL PATH SIMULATION & BUTTERFLY EFFECT
// ----------------------------------------------------
console.log('\n▶ [SECTION 4] Simulating Suboptimal Runs & Butterfly Effect Escalation...');

for (const item of PLAYABLE_SCENARIOS) {
  const scenario = getScenario(item.id)!;
  let currentNodeId = scenario.startNodeId;
  let simState = createInitialSimulationState(item.disaster);
  const decisionRecords: DecisionRecord[] = [];
  let steps = 0;
  const maxSteps = 20;

  while (steps < maxSteps) {
    steps++;
    const node = getNode(scenario, currentNodeId);
    if (!node || node.type === 'outcome') break;

    const decNode = node as DecisionNode;
    // Pick suboptimal choice if available
    const suboptimalChoice = decNode.choices.find((c) => !c.isCorrect) || decNode.choices[decNode.choices.length - 1];
    const evalResult = evaluateChoice(
      decNode,
      suboptimalChoice.id,
      0, // Zero remaining seconds (delayed action)
      simState,
      item.disaster
    );

    check(Boolean(evalResult.nextSimulationState), `Simulation state produced for suboptimal path`);
    simState = evalResult.nextSimulationState!;
    decisionRecords.push(evalResult.record);
    currentNodeId = evalResult.nextNodeId;
  }

  const score = calculateScore(decisionRecords);
  check(score.score < 80, `Suboptimal score is lower than optimal (got ${score.score})`);
  check(score.suboptimalCount > 0, `Suboptimal decisions recorded`);

  const report = buildReport(decisionRecords, item.disaster);
  check(report.decisionReviews.some((r) => !r.isCorrect), `Report contains suboptimal decision reviews`);
  check(report.keyTakeaways.length > 0, `NDMA takeaways provided even after failure`);

  console.log(`  ✓ ${item.name}: Suboptimal path evaluated -> Panic: ${simState.panic}/100, Hazard: ${simState.hazardLevel}%, Score: ${score.score}%`);
}

// ----------------------------------------------------
// SECTION 5: RAPID INTERACTION & TIMEOUT SAFETY
// ----------------------------------------------------
console.log('\n▶ [SECTION 5] Rapid Interaction & Timeout Resilience Checks...');

const testScenario = getScenario('earthquake-urban')!;
const initialNode = getNode(testScenario, testScenario.startNodeId) as DecisionNode;

// 1. Double evaluation idempotency check
const eval1 = evaluateChoice(initialNode, initialNode.choices[0].id);
const eval2 = evaluateChoice(initialNode, initialNode.choices[0].id);
check(eval1.choice.id === eval2.choice.id, 'Idempotent choice evaluation');
check(eval1.nextNodeId === eval2.nextNodeId, 'Idempotent target node resolution');

// 2. Timeout edge condition (0 remaining seconds)
const timedResult = evaluateChoice(initialNode, initialNode.choices[0].id, 0);
check(timedResult.timeBonus === 0, 'Zero speed bonus on timeout');

// 3. Alternative timeline "What If?" presence
check(Boolean(eval1.stateDelta.alternativeBranch), 'What If alternative timeline calculated');
check(typeof eval1.stateDelta.alternativeBranch?.choiceLabel === 'string', 'Alternative timeline has choiceLabel');

console.log('  ✓ Double-click idempotency verified');
console.log('  ✓ Timeout zero-bonus verified');
console.log('  ✓ What If alternative timeline generated');

console.log('\n========================================================');
console.log(`🎉 ALL GAMEPLAY TESTS PASSED! (${totalAssertions} assertions verified)`);
console.log('========================================================');
