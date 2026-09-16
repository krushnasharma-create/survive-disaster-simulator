// src/engine/reportBuilder.ts
// Pure function for assembling comprehensive preparedness reports.

import type { DecisionRecord } from '../store/gameStore';
import type { DisasterType } from '../data/types';
import { calculateScore, type ScoreSummary } from './scoreCalculator';

export interface DecisionReviewItem {
  step: number;
  nodeId: string;
  situationText: string;
  choiceLabel: string;
  isCorrect: boolean;
  scoreImpact: number;
  timeBonus: number;
  consequenceText: string;
  insight: string;
  insightSource: string;
}

export interface PreparednessReport {
  scoreSummary: ScoreSummary;
  decisionReviews: DecisionReviewItem[];
  keyTakeaways: string[];
  officialHelplines: Array<{ title: string; number: string; purpose: string }>;
}

export const EARTHQUAKE_TAKEAWAYS: string[] = [
  'DROP, COVER, AND HOLD ON: Protect your head and torso under sturdy furniture. Avoid running outside while ground shaking is active.',
  'NEUTRALIZE SECONDARY HAZARDS: Switch off LPG cylinder regulators and electrical mains once shaking stops to help prevent fires.',
  'NEVER USE ELEVATORS: Use designated fire staircases. If an aftershock hits while on stairs, crouch on the landing against an interior wall.',
  'CLEAR BUILDING EXTERIORS: Falling glass, parapet debris, and air conditioner units present severe hazards. Move to an open area away from structures.',
  'USE SMS & KEEP 112 CLEAR: Cellular voice networks congest quickly. Use text messages to reach family, and reserve 112 for urgent life-threatening emergencies.',
];

export const FIRE_TAKEAWAYS: string[] = [
  'TEST DOORS BEFORE OPENING: Always test closed doors and doorknobs with the back of your hand. A warm door indicates intense heat and fire on the other side.',
  'CRAWL LOW UNDER SMOKE: Superheated toxic smoke rises toward the ceiling. Cooler, breathable air and visibility remain in the lowest 30 to 60 cm.',
  'SEAL DOORS IF TRAPPED: If your exit path is impassable, close doors, seal bottom crevices with damp cloth to block toxic smoke, and signal your location from a window.',
  'NEVER USE ELEVATORS: Electrical failure frequently stalls elevator cars between floors, and elevator shafts act as natural chimneys for lethal smoke.',
  'CALL 112 ERSS WITH PRECISE DETAILS: Give the dispatcher the exact address, floor of the fire, trapped individuals, and nearest landmarks immediately.',
];

export const FLOOD_TAKEAWAYS: string[] = [
  'SHUT OFF ELECTRICAL & GAS MAINS EARLY: Disconnect the main electrical MCB breaker and LPG cylinder before floodwaters enter living spaces to eliminate electrocution and fire hazards.',
  'SEEK VERTICAL REFUGE: When streets are flooded, retreat to an upper floor or sturdy rooftop terrace rather than attempting risky ground evacuation through moving water.',
  'NEVER WALK OR DRIVE THROUGH FLOODWATER: Moving floodwaters hide open stormwater manholes, structural washouts, and downed power lines. Even shallow moving water can sweep pedestrians and vehicles away.',
  'SECURE SAFE DRINKING WATER: Floodwaters heavily contaminate domestic pipelines and underground sumps. Only consume boiled, filtered, or bottled drinking water to avoid severe illness.',
  'CONSERVE PHONE BATTERY & USE SMS: Extend mobile phone battery life by keeping screens dimmed and using concise SMS messages to communicate location coordinates to 112 ERSS.',
];

export const INDIA_EMERGENCY_HELPLINES = [
  {
    title: 'National Emergency Response Support System (ERSS)',
    number: '112',
    purpose: 'Unified emergency phone number for Police, Fire, and Medical emergency services across India.',
  },
  {
    title: 'Fire Emergency Service (Direct)',
    number: '101',
    purpose: 'Direct national fire brigade emergency helpline (integrated with 112).',
  },
  {
    title: 'NDMA Disaster Helpline',
    number: '1078',
    purpose: 'National Disaster Management Authority toll-free disaster helpline.',
  },
  {
    title: 'SACHET Disaster Alert Portal',
    number: 'sachet.ndma.gov.in',
    purpose: 'Government of India geospatial multi-hazard alert and safety advisory portal.',
  },
];

/**
 * Builds a structured preparedness report from decision history.
 * Optionally tailors key takeaways to the active disaster type.
 */
export function buildReport(decisions: DecisionRecord[], disasterType?: DisasterType): PreparednessReport {
  const scoreSummary = calculateScore(decisions);

  const decisionReviews: DecisionReviewItem[] = decisions.map((d, index) => ({
    step: index + 1,
    nodeId: d.nodeId,
    situationText: d.situationText || 'Emergency situation',
    choiceLabel: d.choiceLabel || 'Decision made',
    isCorrect: d.isCorrect,
    scoreImpact: d.scoreImpact,
    timeBonus: d.timeBonus || 0,
    consequenceText: d.consequenceText,
    insight: d.insight,
    insightSource: d.insightSource,
  }));

  // Infer disaster type from decision node IDs if not explicitly passed
  const isFire = disasterType === 'fire' || decisions.some((d) => d.nodeId.startsWith('fire-') || d.nodeId.startsWith('frc-'));
  const isFlood = disasterType === 'flood' || decisions.some((d) => d.nodeId.startsWith('flood-') || d.nodeId.startsWith('fls-'));

  let keyTakeaways = EARTHQUAKE_TAKEAWAYS;
  if (isFire) {
    keyTakeaways = FIRE_TAKEAWAYS;
  } else if (isFlood) {
    keyTakeaways = FLOOD_TAKEAWAYS;
  }

  return {
    scoreSummary,
    decisionReviews,
    keyTakeaways,
    officialHelplines: INDIA_EMERGENCY_HELPLINES,
  };
}