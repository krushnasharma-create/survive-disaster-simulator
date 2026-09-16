// src/engine/reportBuilder.ts
// Pure function for assembling comprehensive preparedness reports.

import type { DecisionRecord } from '../store/gameStore';
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

export const INDIA_EMERGENCY_HELPLINES = [
  {
    title: 'National Emergency Response Support System (ERSS)',
    number: '112',
    purpose: 'Unified emergency phone number for Police, Fire, and Medical emergency services across India.',
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
 */
export function buildReport(decisions: DecisionRecord[]): PreparednessReport {
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

  return {
    scoreSummary,
    decisionReviews,
    keyTakeaways: EARTHQUAKE_TAKEAWAYS,
    officialHelplines: INDIA_EMERGENCY_HELPLINES,
  };
}