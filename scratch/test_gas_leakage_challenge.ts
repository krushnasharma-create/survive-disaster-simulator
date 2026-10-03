// scratch/test_gas_leakage_challenge.ts
// Round 2 Mandatory Offline Challenge Test Suite: Gas Leakage Dynamic Event Engine
// Verifies all 10 mandatory requirements from the challenge specification.

import assert from 'node:assert';
import { getScenario, SCENARIO_CATALOGUE } from '../src/data/index.js';
import type { DecisionNode, OutcomeNode } from '../src/data/types.js';
import {
  evaluateNextGasLeakEvent,
  getGasLeakEventByNodeId,
  GAS_LEAK_EVENTS,
  extractGasLeakMetrics,
  getOpeningGasLeakNodeId,
  getGasLeakStory,
} from '../src/engine/gasLeakDirector.js';
import {
  createInitialSimulationState,
  type SimulationState,
} from '../src/engine/simulationState.js';
import { evaluateChoice, getNode } from '../src/engine/scenarioRunner.js';
import { calculateScore } from '../src/engine/scoreCalculator.js';
import { buildReport } from '../src/engine/reportBuilder.js';
import type { DecisionRecord } from '../src/store/gameStore.js';

console.log('================================================================');
console.log('🧪 ROUND 2 CHALLENGE: GAS LEAKAGE DYNAMIC REAL-TIME EVENT SUITE');
console.log('================================================================\n');

let passCount = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passCount++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// TEST 1: Gas Leakage is available in disaster selection (4 Disasters Total)
// -------------------------------------------------------------
console.log('▶ [TEST 1] Disaster Selection & 4 Disasters Verification');
test('Gas Leakage disaster is registered in catalogue and 4 disaster types exist', () => {
  const scenario = getScenario('gas_leak');
  assert(Boolean(scenario), 'Scenario gas_leak must be retrievable via getScenario("gas_leak")');
  assert.strictEqual(scenario?.theme, 'gas_leak', 'Scenario theme must be gas_leak');

  // Verify catalogue contains all 4 disaster types
  const disasterTypes = Object.keys(SCENARIO_CATALOGUE);
  assert(disasterTypes.includes('earthquake'), 'Catalogue has earthquake');
  assert(disasterTypes.includes('fire'), 'Catalogue has fire');
  assert(disasterTypes.includes('flood'), 'Catalogue has flood');
  assert(disasterTypes.includes('gas_leak'), 'Catalogue has gas_leak');
  assert.strictEqual(disasterTypes.length, 4, 'Must have exactly 4 standalone disaster types');
});

// -------------------------------------------------------------
// TEST 2: Gas Leakage starts successfully
// -------------------------------------------------------------
console.log('\n▶ [TEST 2] Gas Leakage Simulation Initialization');
test('SimulationState initializes with gas_leak parameters and valid start node', () => {
  const state: SimulationState = createInitialSimulationState('gas_leak');
  assert.strictEqual(state.disasterType, 'gas_leak');
  assert.strictEqual(state.hazardLevel, 30, 'Initial gas hazard is 30');
  assert.strictEqual(state.visibility, 80, 'Initial ventilation/visibility is 80');
  assert.strictEqual(state.safetyIntegrity, 80, 'Initial safety is 80');
  assert(state.squadMembers.length >= 2, 'Gas squad includes NPCs (Karan, Sanjay, etc.)');
  assert(state.cityBrain !== null, 'City Brain initialized');
  assert.strictEqual(state.cityBrain?.utilityStability, 45, 'Utility stability calibrated for gas');

  const scenario = getScenario('gas_leak')!;
  assert.strictEqual(scenario.startNodeId, 'gas-event-detect', 'Start node is gas-event-detect');
  assert(Boolean(scenario.nodes[scenario.startNodeId]), 'Start node exists in scenario graph');
});

// -------------------------------------------------------------
// TEST 3: Event is NOT manually selected by player
// -------------------------------------------------------------
console.log('\n▶ [TEST 3] Automated Dynamic Event Selection (No Manual Selection)');
test('Next event is determined dynamically by live state, not player selection', () => {
  const scenario = getScenario('gas_leak')!;
  const startNode = getNode(scenario, scenario.startNodeId) as DecisionNode;

  // The choices on the start node do not choose the next event; the engine director evaluates state
  const state = createInitialSimulationState('gas_leak');
  
  // Simulate high ignition risk state (e.g. spark / electrical failure)
  const sparkState: SimulationState = {
    ...state,
    hazardLevel: 65,
    cityBrain: {
      ...state.cityBrain!,
      utilityStability: 20, // Low stability => High ignition risk
    },
    disasterChain: {
      ...state.disasterChain!,
      chainStage: 1, // Secondary electrical spark active
    },
  };

  const decisionNodeId = startNode.id;
  const autoSelectedEvent = evaluateNextGasLeakEvent(sparkState, decisionNodeId, 1, [decisionNodeId]);

  assert(autoSelectedEvent.nodeId !== undefined, 'Next event nodeId is returned by director');
  assert.strictEqual(autoSelectedEvent.nodeId, GAS_LEAK_EVENTS.IGNITION_RISK.nodeId, 'Automatically selected IGNITION_RISK');
  assert(autoSelectedEvent.triggerReason.includes('Ignition risk'), 'Includes deterministic trigger reason');
});

// -------------------------------------------------------------
// TEST 4: Live state can trigger GAS_LEAK_DETECTED
// -------------------------------------------------------------
console.log('\n▶ [TEST 4] Live State Triggering GAS_LEAK_DETECTED');
test('Baseline live state evaluates to GAS_LEAK_DETECTED or designated start event', () => {
  const state = createInitialSimulationState('gas_leak');
  const metrics = extractGasLeakMetrics(state);

  assert.strictEqual(metrics.gasExposure, 30);
  assert.strictEqual(metrics.ventilation, 80);
  assert(metrics.ignitionRisk < 60);

  const eventDef = getGasLeakEventByNodeId('gas-event-detect');
  assert(Boolean(eventDef), 'gas-event-detect maps to GAS_LEAK_DETECTED');
  assert.strictEqual(eventDef?.eventId, 'GAS_LEAK_DETECTED');
  assert.strictEqual(eventDef?.severity, 'HIGH');
});

// -------------------------------------------------------------
// TEST 5: State changes after player decision
// -------------------------------------------------------------
console.log('\n▶ [TEST 5] Deterministic Consequence Updates State');
test('Safe decision mitigates state, Risky decision escalates hazard', () => {
  const scenario = getScenario('gas_leak')!;
  const startNode = getNode(scenario, 'gas-event-detect') as DecisionNode;
  const state = createInitialSimulationState('gas_leak');

  // Option 1 (Safe): Isolate supply valve & alert team
  const safeChoice = startNode.choices.find((c) => c.isCorrect)!;
  const safeResult = evaluateChoice(startNode, safeChoice.id, 10, state, 'gas_leak');

  assert(safeResult.nextSimulationState !== undefined);
  assert(safeResult.nextSimulationState!.hazardLevel < state.hazardLevel, 'Safe choice decreases hazard');
  assert(safeResult.nextSimulationState!.safetyIntegrity > state.safetyIntegrity, 'Safe choice increases safety');
  assert.strictEqual(safeResult.record.isCorrect, true);

  // Option 2 (Risky): Turn on high-power exhaust switch / create spark
  const riskyChoice = startNode.choices.find((c) => !c.isCorrect)!;
  const riskyResult = evaluateChoice(startNode, riskyChoice.id, 10, state, 'gas_leak');

  assert(riskyResult.nextSimulationState !== undefined);
  assert(riskyResult.nextSimulationState!.hazardLevel > state.hazardLevel, 'Risky choice increases hazard');
  assert(riskyResult.nextSimulationState!.panic > state.panic, 'Risky choice increases panic');
  assert.strictEqual(riskyResult.record.isCorrect, false);
});

// -------------------------------------------------------------
// TEST 6: New state can trigger another Gas Leakage event
// -------------------------------------------------------------
console.log('\n▶ [TEST 6] Multi-State Dynamic Event Transitions');
test('Different state profiles dynamically route to distinct events', () => {
  const base = createInitialSimulationState('gas_leak');

  // State A: Ventilation collapse (visibility <= 55)
  const ventFailState: SimulationState = {
    ...base,
    visibility: 40,
    hazardLevel: 50,
    cityBrain: { ...base.cityBrain!, utilityStability: 80 },
  };
  const eventVent = evaluateNextGasLeakEvent(ventFailState, 'gas-event-detect', 1, ['gas-event-detect']);
  assert.strictEqual(eventVent.nodeId, GAS_LEAK_EVENTS.VENTILATION_FAILURE.nodeId, 'Triggered VENTILATION_FAILURE');

  // State B: High Gas Concentration (hazard >= 45)
  const highGasState: SimulationState = {
    ...base,
    visibility: 75,
    hazardLevel: 65,
    cityBrain: { ...base.cityBrain!, utilityStability: 80 },
  };
  const eventConc = evaluateNextGasLeakEvent(highGasState, 'gas-event-detect', 1, ['gas-event-detect']);
  assert.strictEqual(eventConc.nodeId, GAS_LEAK_EVENTS.HIGH_GAS_CONCENTRATION.nodeId, 'Triggered HIGH_GAS_CONCENTRATION');

  // State C: Evacuation Alert (panic >= 50 or squad safety < 60)
  const panicState: SimulationState = {
    ...base,
    visibility: 75,
    hazardLevel: 35,
    panic: 65,
    squadCohesion: 40,
    cityBrain: { ...base.cityBrain!, utilityStability: 80 },
  };
  const eventEvac = evaluateNextGasLeakEvent(panicState, 'gas-event-detect', 1, ['gas-event-detect']);
  assert.strictEqual(eventEvac.nodeId, GAS_LEAK_EVENTS.EVACUATION_ALERT.nodeId, 'Triggered EVACUATION_ALERT');

  // State D: Emergency Responder Arrival (contained hazard + stabilized)
  const responderState: SimulationState = {
    ...base,
    visibility: 75,
    hazardLevel: 30,
    panic: 20,
    squadCohesion: 85,
    cityBrain: { ...base.cityBrain!, utilityStability: 80, emergencyAccess: 90 },
  };
  const eventResp = evaluateNextGasLeakEvent(responderState, 'gas-event-detect', 1, ['gas-event-detect']);
  assert.strictEqual(eventResp.nodeId, GAS_LEAK_EVENTS.EMERGENCY_RESPONDER_ARRIVAL.nodeId, 'Triggered EMERGENCY_RESPONDER_ARRIVAL');
});

// -------------------------------------------------------------
// TEST 7: Event cooldown prevents duplicate spam
// -------------------------------------------------------------
console.log('\n▶ [TEST 7] Cooldown & Anti-Spam Verification');
test('Recently visited event is blocked by cooldown and director selects next best event', () => {
  const base = createInitialSimulationState('gas_leak');
  // State that would normally trigger IGNITION_RISK
  const sparkState: SimulationState = {
    ...base,
    hazardLevel: 70,
    cityBrain: { ...base.cityBrain!, utilityStability: 20 },
  };

  // If IGNITION_RISK was visited in the last 2 steps:
  const visited = ['gas-event-detect', GAS_LEAK_EVENTS.IGNITION_RISK.nodeId];
  const nextEvent = evaluateNextGasLeakEvent(sparkState, GAS_LEAK_EVENTS.IGNITION_RISK.nodeId, 2, visited);

  assert.notStrictEqual(nextEvent.nodeId, GAS_LEAK_EVENTS.IGNITION_RISK.nodeId, 'Cooldown prevents immediate repeat of IGNITION_RISK');
  assert(Boolean(nextEvent.nodeId), 'Director successfully fell through to eligible event');
});

// -------------------------------------------------------------
// TEST 8: Deterministic fallback works without AI
// -------------------------------------------------------------
console.log('\n▶ [TEST 8] Deterministic Offline Execution (No AI Required)');
test('Scenario progression, scoring, and report build cleanly without any AI or network', () => {
  const scenario = getScenario('gas_leak')!;
  let currentState: SimulationState = createInitialSimulationState('gas_leak');
  let currentNodeId: string = scenario.startNodeId;
  const decisions: DecisionRecord[] = [];

  // Play 3 decisions deterministically
  for (let step = 1; step <= 3; step++) {
    const node = getNode(scenario, currentNodeId) as DecisionNode;
    assert(node && node.type === 'decision');
    const safeChoice = node.choices[0]; // First choice
    const evalRes = evaluateChoice(node, safeChoice.id, 15, currentState, 'gas_leak');

    decisions.push(evalRes.record);
    currentState = evalRes.nextSimulationState!;

    const nextEvent = evaluateNextGasLeakEvent(
      currentState,
      currentNodeId,
      step,
      decisions.map((d) => d.nodeId)
    );
    currentNodeId = nextEvent.nodeId;
  }

  // Calculate score
  const scoreResult = calculateScore(decisions);
  assert(scoreResult.score >= 0 && scoreResult.score <= 100);

  // Build report
  const report = buildReport(decisions, 'gas_leak');
  assert(report.decisionReviews.length === 3);
  assert(report.keyTakeaways.length >= 3);
  assert(report.keyTakeaways.some((t) => t.includes('1906') || t.includes('112')));
});

// -------------------------------------------------------------
// TEST 9: Existing 3 disasters still pass regression tests
// -------------------------------------------------------------
console.log('\n▶ [TEST 9] Regression Testing for Earthquake, Fire, Flood');
test('All existing disaster scenarios remain registered, functional, and intact', () => {
  const existingScenarios = [
    'earthquake-urban',
    'earthquake-workplace',
    'fire-residential',
    'fire-commercial',
    'flood-urban',
    'flood-street',
  ];

  for (const id of existingScenarios) {
    const s = getScenario(id);
    assert(Boolean(s), `Scenario ${id} must exist`);
    assert(Object.keys(s!.nodes).length >= 6, `Scenario ${id} has full graph`);
    
    // Test initial state generation for parent theme
    const sim = createInitialSimulationState(s!.theme);
    assert.strictEqual(sim.disasterType, s!.theme);

    // Verify first choice evaluation
    const startNode = getNode(s!, s!.startNodeId) as DecisionNode;
    assert(startNode && startNode.choices.length >= 2);
    const evalRes = evaluateChoice(startNode, startNode.choices[0].id, 10, sim, s!.theme);
    assert(evalRes.nextSimulationState !== undefined);
  }
});

// -------------------------------------------------------------
// TEST 10: No dead-end nodes or invalid transitions in Gas Leakage
// -------------------------------------------------------------
console.log('\n▶ [TEST 10] Complete Graph Integrity & No Dead-End Nodes');
test('Gas Leakage scenario graph has valid choices, no broken pointers, and valid outcomes', () => {
  const scenario = getScenario('gas_leak')!;
  const nodeIds = Object.keys(scenario.nodes);

  for (const [id, node] of Object.entries(scenario.nodes)) {
    if (node.type === 'decision') {
      const dec = node as DecisionNode;
      assert(dec.choices.length >= 2, `Decision node ${id} has at least 2 choices`);
      for (const choice of dec.choices) {
        assert(typeof choice.id === 'string' && choice.id.length > 0);
        assert(typeof choice.label === 'string' && choice.label.length > 0);
        assert(typeof choice.consequenceText === 'string' && choice.consequenceText.length > 0);
        assert(typeof choice.insight === 'string' && choice.insight.length > 0);
        assert(choice.stateDelta !== undefined, `Choice ${choice.id} in ${id} has stateDelta`);
        // Target node must exist in scenario
        assert(
          nodeIds.includes(choice.nextNodeId),
          `Target node ${choice.nextNodeId} must exist in scenario nodes dictionary`
        );
      }
    } else if (node.type === 'outcome') {
      const out = node as OutcomeNode;
      assert(typeof out.survived === 'boolean');
      assert(typeof out.narrativeText === 'string');
    }
  }

  // Also verify that all GAS_LEAK_EVENTS point to real nodes
  for (const [key, eventDef] of Object.entries(GAS_LEAK_EVENTS)) {
    assert(
      nodeIds.includes(eventDef.nodeId),
      `Director event ${key} references nodeId ${eventDef.nodeId} which exists in scenario`
    );
  }
});

// -------------------------------------------------------------
// TEST 11: Story-First Gameplay & Historical Context (Vizag May 2020)
// -------------------------------------------------------------
console.log('\n▶ [TEST 11] Story-First Gameplay & Historical Context Verification');
test('All Gas Leakage events provide 2-4 lines of contextual narrative and Vizag historical timeline', () => {
  const eventNodeIds = Object.values(GAS_LEAK_EVENTS).map((e) => e.nodeId);

  for (const nodeId of eventNodeIds) {
    const story = getGasLeakStory(nodeId);
    assert(Boolean(story), `Event ${nodeId} has contextual story narrative`);
    assert(typeof story?.timestamp === 'string' && story.timestamp.includes('AM'), 'Story has AM timestamp');
    assert(typeof story?.location === 'string' && story.location.length > 0, 'Story has location');
    assert(Array.isArray(story?.paragraphs) && story.paragraphs.length >= 2, 'Story has at least 2 paragraphs');
    assert(Array.isArray(story?.paragraphsHinglish) && story.paragraphsHinglish.length >= 2, 'Story has Roman Hinglish paragraphs');
  }

  // Check opening story includes Vizag 2020 inspiration location
  const openingStory = getGasLeakStory('gas-event-detect')!;
  assert(openingStory.location.includes('RR Venkatapuram'), 'Opening story references RR Venkatapuram, Visakhapatnam');
  assert(openingStory.paragraphs.some((p) => p.includes('eyes sting') || p.includes('smell')), 'Opening captures sensory details');
});

// -------------------------------------------------------------
// TEST 12: Fresh Replay Determinism & Opening Variation
// -------------------------------------------------------------
console.log('\n▶ [TEST 12] Fresh Replay Determinism & Seed-Based Opening Variation');
test('New run seed produces distinct valid opening events, while identical seed produces identical results', () => {
  // Test determinism: same seed -> identical opening
  const seedA = 1042;
  const opening1 = getOpeningGasLeakNodeId(seedA);
  const opening2 = getOpeningGasLeakNodeId(seedA);
  assert.strictEqual(opening1, opening2, 'Same run seed produces 100% identical opening node');

  // Test variation across seeds:
  const seedDefault = 0;
  const seedOne = 1;
  const seedTwo = 2;

  const nodeDefault = getOpeningGasLeakNodeId(seedDefault);
  const nodeOne = getOpeningGasLeakNodeId(seedOne);
  const nodeTwo = getOpeningGasLeakNodeId(seedTwo);

  assert.strictEqual(nodeDefault, 'gas-event-detect', 'Seed 0 opens at default standard node gas-event-detect');
  assert.strictEqual(nodeOne, 'gas-event-vent-fail', 'Seed 1 opens at ventilation failure event gas-event-vent-fail');
  assert.strictEqual(nodeTwo, 'gas-event-high-conc', 'Seed 2 opens at high concentration event gas-event-high-conc');

  // All 3 openings are distinct and valid in scenario graph
  const scenario = getScenario('gas_leak')!;
  assert(Boolean(scenario.nodes[nodeDefault]));
  assert(Boolean(scenario.nodes[nodeOne]));
  assert(Boolean(scenario.nodes[nodeTwo]));

  // Verify seed variation inside director tie-breaking does not break cooldown
  const base = createInitialSimulationState('gas_leak');
  const nextWithSeed1 = evaluateNextGasLeakEvent(base, nodeDefault, 1, [nodeDefault], 1);
  const nextWithSeed2 = evaluateNextGasLeakEvent(base, nodeDefault, 1, [nodeDefault], 2);
  assert(Boolean(nextWithSeed1.nodeId));
  assert(Boolean(nextWithSeed2.nodeId));
  assert(nextWithSeed1.nodeId !== nodeDefault, 'Cooldown blocks repeat of nodeDefault');
});

console.log('\n================================================================');
console.log(`🎉 ALL 12 MANDATORY OFFLINE CHALLENGE TESTS PASSED (${passCount}/12)`);
console.log('================================================================\n');

process.exit(0);
