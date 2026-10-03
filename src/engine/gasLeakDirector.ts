// src/engine/gasLeakDirector.ts
// Deterministic Event Director & Generator for Gas Leakage.
// Dynamically evaluates live crisis simulation state (gas concentration, ventilation,
// ignition risk, panic, NPC squad cohesion, utility stability, emergency access).
// Selects the appropriate next real-time Gas Leakage event without fixed static linear paths.
// Pure deterministic logic, zero random dependencies for testability and judge demo.

import type { SimulationState } from './simulationState';

export type GasLeakEventId =
  | 'GAS_LEAK_DETECTED'
  | 'EVACUATION_ALERT'
  | 'HIGH_GAS_CONCENTRATION'
  | 'IGNITION_RISK'
  | 'VENTILATION_FAILURE'
  | 'EMERGENCY_RESPONDER_ARRIVAL';

export type GasLeakSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GasLeakEventDefinition {
  eventId: GasLeakEventId;
  nodeId: string;
  label: string;
  severity: GasLeakSeverity;
  defaultReason: string;
  cooldownNodes: number;
}

export const GAS_LEAK_EVENTS: Record<GasLeakEventId, GasLeakEventDefinition> = {
  GAS_LEAK_DETECTED: {
    eventId: 'GAS_LEAK_DETECTED',
    nodeId: 'gas-event-detect',
    label: 'GAS LEAK DETECTED',
    severity: 'HIGH',
    defaultReason: 'Pungent mercaptan odor detected; indoor gas concentration crossed 25% safety threshold.',
    cooldownNodes: 2,
  },
  HIGH_GAS_CONCENTRATION: {
    eventId: 'HIGH_GAS_CONCENTRATION',
    nodeId: 'gas-event-high-conc',
    label: 'HIGH GAS CONCENTRATION',
    severity: 'HIGH',
    defaultReason: 'Gas concentration crossed 45% threshold; acute toxic exposure and asphyxiation risk.',
    cooldownNodes: 2,
  },
  IGNITION_RISK: {
    eventId: 'IGNITION_RISK',
    nodeId: 'gas-event-ignition',
    label: 'IGNITION RISK',
    severity: 'CRITICAL',
    defaultReason: 'Ignition risk crossed safety threshold; flammable vapor envelope exposed to active spark sources.',
    cooldownNodes: 2,
  },
  VENTILATION_FAILURE: {
    eventId: 'VENTILATION_FAILURE',
    nodeId: 'gas-event-vent-fail',
    label: 'VENTILATION FAILURE',
    severity: 'HIGH',
    defaultReason: 'Air exchange dropped below critical margin; gas pocketing detected in unventilated enclosures.',
    cooldownNodes: 2,
  },
  EVACUATION_ALERT: {
    eventId: 'EVACUATION_ALERT',
    nodeId: 'gas-event-evac-alert',
    label: 'EVACUATION ALERT',
    severity: 'HIGH',
    defaultReason: 'Evacuation protocol triggered; uncoordinated perimeter clearance and upwind crowd guidance required.',
    cooldownNodes: 2,
  },
  EMERGENCY_RESPONDER_ARRIVAL: {
    eventId: 'EMERGENCY_RESPONDER_ARRIVAL',
    nodeId: 'gas-event-responder',
    label: 'EMERGENCY RESPONDER ARRIVAL',
    severity: 'MEDIUM',
    defaultReason: '112 ERSS Fire & Hazmat response units staged on scene; incident command handover required.',
    cooldownNodes: 2,
  },
};

export interface GasLeakEvaluationResult {
  nodeId: string;
  eventId?: GasLeakEventId;
  label?: string;
  severity?: GasLeakSeverity;
  triggerReason?: string;
  isOutcome: boolean;
  survived?: boolean;
}

export interface GasLeakStateMetrics {
  gasExposure: number; // 0-100 (derived from hazardLevel)
  ventilation: number; // 0-100 (derived from visibility)
  ignitionRisk: number; // 0-100 (derived from utility stability, disaster chain, and hazard)
  panic: number; // 0-100
  npcSafety: number; // 0-100 (squad cohesion)
  utilityStability: number; // 0-100
  emergencyAccess: number; // 0-100
}

/**
 * Extracts normalized Gas Leak metrics from SimulationState.
 */
export function extractGasLeakMetrics(state: SimulationState): GasLeakStateMetrics {
  const gasExposure = state.hazardLevel;
  const ventilation = state.visibility;
  const utilityStability = state.cityBrain?.utilityStability ?? 70;
  const emergencyAccess = state.cityBrain?.emergencyAccess ?? 75;
  const panic = state.panic;
  const npcSafety = state.squadCohesion ?? 75;

  // Ignition risk scales inversely with utility stability and directly with gas exposure
  let ignitionRisk = Math.round((100 - utilityStability) * 0.5 + gasExposure * 0.5);
  if (state.disasterChain?.chainStage && state.disasterChain.chainStage > 0) {
    ignitionRisk = Math.min(100, ignitionRisk + 25);
  }
  if (state.disasterChain?.chainSeverity === 'ACTIVE') {
    ignitionRisk = Math.min(100, ignitionRisk + 20);
  }

  return {
    gasExposure,
    ventilation,
    ignitionRisk,
    panic,
    npcSafety,
    utilityStability,
    emergencyAccess,
  };
}

/**
 * Finds event definition by its scenario node ID.
 */
export function getGasLeakEventByNodeId(nodeId: string): GasLeakEventDefinition | null {
  const found = Object.values(GAS_LEAK_EVENTS).find((e) => e.nodeId === nodeId);
  return found || null;
}

/**
 * Evaluates the new SimulationState and returns the next dynamic Gas Leakage node.
 * Evaluates:
 * 1. Initial start condition -> GAS_LEAK_DETECTED
 * 2. Outcome thresholds (step >= 4 or concluding step 5)
 * 3. State-driven priority rules: Ignition Risk, Ventilation Failure, High Concentration, Evacuation Alert, Responder Arrival
 * 4. Cooldown tracking to prevent duplicate spamming
 * 5. Deterministic seed variation to resolve tie-breakers across replays
 */
export function evaluateNextGasLeakEvent(
  state: SimulationState,
  _currentNodeId: string,
  stepNumber: number,
  visitedNodeIds: string[] = [],
  seed: number = 0
): GasLeakEvaluationResult {
  const metrics = extractGasLeakMetrics(state);

  // Outcome resolution rules
  // After 3 or 4 decisions: if either containment is achieved or critical failure reached
  if (stepNumber >= 4) {
    // Favorable containment: low hazard, high safety, and either responder arrived or evac finished
    if (metrics.gasExposure <= 35 && state.safetyIntegrity >= 65) {
      return {
        nodeId: 'gas-outcome-containment',
        isOutcome: true,
        survived: true,
      };
    }
    // Severe compromise: acute explosion hazard or collapsed safety integrity
    if (metrics.gasExposure >= 75 || state.safetyIntegrity <= 25 || metrics.ignitionRisk >= 80) {
      return {
        nodeId: 'gas-outcome-critical',
        isOutcome: true,
        survived: false,
      };
    }
  }

  // Hard stop at step 5 to prevent infinite loops
  if (stepNumber >= 5) {
    const survived = state.safetyIntegrity >= 50 && metrics.gasExposure <= 55;
    return {
      nodeId: survived ? 'gas-outcome-containment' : 'gas-outcome-critical',
      isOutcome: true,
      survived,
    };
  }

  // Calculate cooldowns: an event is blocked if it is in recent visited history
  const isCooldownBlocked = (eventNodeId: string): boolean => {
    const lastVisited = visitedNodeIds.slice(-2); // 2-node cooldown
    return lastVisited.includes(eventNodeId);
  };

  // Priority Evaluation:
  // 1. Critical Ignition Risk: Spark hazard / explosive atmosphere threshold
  if (
    (metrics.ignitionRisk >= 60 || metrics.utilityStability <= 45 || state.disasterChain?.chainStage > 0) &&
    !isCooldownBlocked(GAS_LEAK_EVENTS.IGNITION_RISK.nodeId)
  ) {
    const def = GAS_LEAK_EVENTS.IGNITION_RISK;
    return {
      nodeId: def.nodeId,
      eventId: def.eventId,
      label: def.label,
      severity: 'CRITICAL',
      triggerReason: `Ignition risk spiked to ${metrics.ignitionRisk}%; spark sources detected near flammable gas envelope.`,
      isOutcome: false,
    };
  }

  // 2. Ventilation Failure: Air exchange collapsed / trapped gas in enclosed space
  if (
    metrics.ventilation <= 55 &&
    !isCooldownBlocked(GAS_LEAK_EVENTS.VENTILATION_FAILURE.nodeId)
  ) {
    const def = GAS_LEAK_EVENTS.VENTILATION_FAILURE;
    return {
      nodeId: def.nodeId,
      eventId: def.eventId,
      label: def.label,
      severity: 'HIGH',
      triggerReason: `Ventilation degraded to ${metrics.ventilation}%; unventilated enclosure trapping dense combustible gas pockets.`,
      isOutcome: false,
    };
  }

  // 3. High Gas Concentration: Exposure crossed safety limit
  if (
    metrics.gasExposure >= 45 &&
    !isCooldownBlocked(GAS_LEAK_EVENTS.HIGH_GAS_CONCENTRATION.nodeId)
  ) {
    const def = GAS_LEAK_EVENTS.HIGH_GAS_CONCENTRATION;
    return {
      nodeId: def.nodeId,
      eventId: def.eventId,
      label: def.label,
      severity: 'HIGH',
      triggerReason: `Gas exposure crossed the event threshold (${metrics.gasExposure}%); acute toxic and asphyxiation risk.`,
      isOutcome: false,
    };
  }

  // 4. Evacuation Alert: High panic or uncoordinated crowd movement
  if (
    (metrics.panic >= 35 || metrics.npcSafety <= 75 || metrics.emergencyAccess <= 75) &&
    !isCooldownBlocked(GAS_LEAK_EVENTS.EVACUATION_ALERT.nodeId)
  ) {
    const def = GAS_LEAK_EVENTS.EVACUATION_ALERT;
    return {
      nodeId: def.nodeId,
      eventId: def.eventId,
      label: def.label,
      severity: 'HIGH',
      triggerReason: `Psychological panic reached ${metrics.panic}%; perimeter evacuation coordination urgently required.`,
      isOutcome: false,
    };
  }

  // 5. Emergency Responder Arrival: Orderly progression or high emergency access
  if (
    (stepNumber >= 3 || metrics.emergencyAccess >= 65 || metrics.gasExposure <= 40) &&
    !isCooldownBlocked(GAS_LEAK_EVENTS.EMERGENCY_RESPONDER_ARRIVAL.nodeId)
  ) {
    const def = GAS_LEAK_EVENTS.EMERGENCY_RESPONDER_ARRIVAL;
    return {
      nodeId: def.nodeId,
      eventId: def.eventId,
      label: def.label,
      severity: 'MEDIUM',
      triggerReason: '112 ERSS Fire & Hazmat response units staged on scene; incident command handover required.',
      isOutcome: false,
    };
  }

  // Deterministic Fallback: Find first candidate event not on cooldown and not already visited
  const candidateEvents: GasLeakEventId[] = [
    'EVACUATION_ALERT',
    'HIGH_GAS_CONCENTRATION',
    'VENTILATION_FAILURE',
    'EMERGENCY_RESPONDER_ARRIVAL',
    'IGNITION_RISK',
    'GAS_LEAK_DETECTED',
  ];

  for (const eventId of candidateEvents) {
    const def = GAS_LEAK_EVENTS[eventId];
    if (!isCooldownBlocked(def.nodeId) && !visitedNodeIds.includes(def.nodeId)) {
      return {
        nodeId: def.nodeId,
        eventId: def.eventId,
        label: def.label,
        severity: def.severity,
        triggerReason: def.defaultReason,
        isOutcome: false,
      };
    }
  }

  // If all unvisited events exhausted, pick any event not immediately on cooldown
  const candidatePool = [...candidateEvents];
  if (seed > 0 && candidatePool.length > 0) {
    const offset = Math.abs(seed + stepNumber) % candidatePool.length;
    candidatePool.push(...candidatePool.splice(0, offset));
  }

  for (const eventId of candidatePool) {
    const def = GAS_LEAK_EVENTS[eventId];
    if (!isCooldownBlocked(def.nodeId)) {
      return {
        nodeId: def.nodeId,
        eventId: def.eventId,
        label: def.label,
        severity: def.severity,
        triggerReason: def.defaultReason,
        isOutcome: false,
      };
    }
  }

  // Ultimate fallback to Emergency Responder Arrival
  const fallbackDef = GAS_LEAK_EVENTS.EMERGENCY_RESPONDER_ARRIVAL;
  return {
    nodeId: fallbackDef.nodeId,
    eventId: fallbackDef.eventId,
    label: fallbackDef.label,
    severity: fallbackDef.severity,
    triggerReason: fallbackDef.defaultReason,
    isOutcome: false,
  };
}

/**
 * Deterministically selects the opening scenario event based on a run seed.
 * Fresh replay uses a new seed so the opening situation varies across runs,
 * while the exact same seed produces the identical starting event.
 * Seed 0 maps to the standard start node 'gas-event-detect' (SCN-GL-01).
 */
export function getOpeningGasLeakNodeId(seed: number = 0): string {
  const openings = [
    GAS_LEAK_EVENTS.GAS_LEAK_DETECTED.nodeId,      // 'gas-event-detect' (Standard Vizag midnight opening)
    GAS_LEAK_EVENTS.VENTILATION_FAILURE.nodeId,    // 'gas-event-vent-fail' (Enclosed stairwell cold fog)
    GAS_LEAK_EVENTS.HIGH_GAS_CONCENTRATION.nodeId, // 'gas-event-high-conc' (Rapid vapor envelope surge)
  ];
  const idx = Math.abs(Math.floor(seed)) % openings.length;
  return openings[idx];
}

export interface GasLeakStory {
  timestamp: string;
  location: string;
  paragraphs: string[];
  paragraphsHinglish: string[];
}

/**
 * Contextual story narrative for each dynamic Gas Leakage event.
 * Inspired by the historical timeline of the Visakhapatnam (Vizag) May 2020 styrene leak,
 * establishing a serious, immersive, story-first experience rather than an MCQ.
 */
export const GAS_LEAK_STORIES: Record<string, GasLeakStory> = {
  'gas-event-detect': {
    timestamp: '03:07 AM',
    location: 'RR Venkatapuram, Visakhapatnam',
    paragraphs: [
      'The neighborhood is unusually quiet. Most residents are fast asleep.',
      'You wake suddenly. Your eyes sting slightly with a sharp, prickling sensation. There is an unfamiliar, suffocating synthetic smell in the air.',
      'Outside, a dog barks erratically down the lane. Through the window, shadows move as confused residents step onto their verandas, shining flashlights into the dim street.',
    ],
    paragraphsHinglish: [
      'Colony bilkul shaant hai. Zyadatar log gehri neend mein hain.',
      'Aapki aankh achanak khulti hai. Aankhon mein jalan aur gale mein ajeeb chubhan mehsoos hoti hai. Hawa mein ek anjaan, teekhi chemical smell fail rahi hai.',
      'Bahar gali mein kuch log confused hokar gharon se nikal rahe hain, phone ki torch se andhere mein dekhne ki koshish kar rahe hain.',
    ],
  },
  'gas-event-high-conc': {
    timestamp: '03:16 AM',
    location: 'Ground Level Living Enclosure',
    paragraphs: [
      'The airborne chemical vapor has settled low across the floorboards, thickening into a dense, greyish ground haze.',
      'Breathing becomes labored. In the adjoining room, occupants are coughing with watery eyes and sudden nausea.',
      'Every passing second without respiratory protection accelerates acute chemical exposure.',
    ],
    paragraphsHinglish: [
      'Chemical vapor zameen ke paas baith kar ek gehra dhuandhaar badal bana raha hai.',
      'Saans lena mushkil ho raha hai. Paas ke kamre mein log lagatar khaans rahe hain aur chakkar aane ki shikayat kar rahe hain.',
      'Bina mask ya kapde ke har beetta second zehrele vapor ko lungs ke andar bhej raha hai.',
    ],
  },
  'gas-event-ignition': {
    timestamp: '03:22 AM',
    location: 'Building Corridor & Utility Junction',
    paragraphs: [
      'A volatile, flammable vapor envelope now fills the unventilated hallway.',
      'Near the electrical meter board, an overhead fluorescent fitting hums erratically with tiny visible sparks.',
      'A single light switch click or mobile phone charger spark here could trigger an instantaneous flash-fire blast.',
    ],
    paragraphsHinglish: [
      'Hawa mein flammable vapor ka khatarnak badal pura bhar chuka hai.',
      'Meter box ke paas corridor ki tube light tezi se flicker kar rahi hai aur halki sparking ki aawaaz aa rahi hai.',
      'Is mahol mein ek chhota sa switch spark bhi bhayanak aag aur blast trigger kar sakta hai.',
    ],
  },
  'gas-event-vent-fail': {
    timestamp: '03:11 AM',
    location: 'Central Stairwell Core, Gopalapatnam',
    paragraphs: [
      'A cold, heavy chemical fog is silently pooling in the enclosed stairwell.',
      'Natural cross-breezes cannot enter. Stagnant toxic gas is pocketing in high concentrations around closed doors and landings.',
      'Visibility down the passageway has deteriorated, and the air feels thick and starved of oxygen.',
    ],
    paragraphsHinglish: [
      'Bina ventilation wale stairwell mein thandi chemical fog tezi se jama ho rahi hai.',
      'Kamarron aur corridor mein hawa ka flow bilkul band hai. Gas zameen aur kono mein khatarnak level par ikatthi ho rahi hai.',
      'Hallway mein visibility dhundhli ho chuki hai aur oxygen ki kami saaf mehsoos ho rahi hai.',
    ],
  },
  'gas-event-evac-alert': {
    timestamp: '03:25 AM',
    location: 'Colony Main Access Road',
    paragraphs: [
      'Distress alarms and shouting echo across the settlement as panic spreads through the street.',
      'Families are stumbling out in disarray. In the confusion, several groups are running downwind toward the industrial facility perimeter.',
      'Without immediate, disciplined command to redirect the crowd upwind, dozens will run straight into the densest toxic plume.',
    ],
    paragraphsHinglish: [
      'Galiyon mein cheekh-pukaar mach gayi hai aur logo mein afra-tafri fail rahi hai.',
      'Parivar raat ke kapdon mein bahar bhaag rahe hain. Darr ke maare kai log seedhe hawa ke rukh (downwind) plant ki taraf bhaagne lage hain.',
      'Agar unhe turant upwind safe zone ki taraf guide nahi kiya gaya, toh wo seedhe zehrele badal mein phas jayenge.',
    ],
  },
  'gas-event-responder': {
    timestamp: '03:32 AM',
    location: 'Emergency Perimeter & Hazmat Staging Area',
    paragraphs: [
      'Emergency flashing beacons cut through the hazy chemical mist as 112 ERSS Fire & Hazmat tenders arrive on scene.',
      'Responders in chemical respirators are establishing a 100-meter exclusion zone and deploying multi-gas detectors.',
      'The Incident Commander spots you at the perimeter barrier and urgently requests an operational handover.',
    ],
    paragraphsHinglish: [
      '112 ERSS Fire aur Hazmat gaadiyan siren bajate hue outer boundary par pahunch chuki hain.',
      'Chemical masks pehne firefighters boundary cordoning kar rahe hain aur monitoring equipment nikaal rahe hain.',
      'Incident commander aapko dekh kar turant ground situation aur pipeline status ki report maangta hai.',
    ],
  },
};

export function getGasLeakStory(nodeId: string): GasLeakStory | null {
  return GAS_LEAK_STORIES[nodeId] || null;
}

