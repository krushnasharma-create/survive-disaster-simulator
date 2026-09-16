// src/engine/scoreCalculator.ts
// Pure function for calculating preparedness scores and score bands.

import type { DecisionRecord } from '../store/gameStore';

export type ScoreBand =
  | 'Ready to Respond'
  | 'Good Awareness'
  | 'Needs Preparation'
  | 'Critically Unprepared';

export interface ScoreSummary {
  score: number; // Normalized 0-100
  rawTotal: number;
  maxPossible: number;
  band: ScoreBand;
  bandDescription: string;
  optimalCount: number;
  suboptimalCount: number;
  totalDecisions: number;
}

export function getScoreBand(score: number): { band: ScoreBand; description: string } {
  if (score >= 85) {
    return {
      band: 'Ready to Respond',
      description:
        'Outstanding emergency instincts. Your actions adhered directly to official NDMA disaster response protocols.',
    };
  }
  if (score >= 65) {
    return {
      band: 'Good Awareness',
      description:
        'Solid safety awareness. Minor hesitation or secondary hazards introduced, but critical life-safety was preserved.',
    };
  }
  if (score >= 40) {
    return {
      band: 'Needs Preparation',
      description:
        'Several critical misconceptions exposed. Review the NDMA key takeaways to build instinctive survival reactions.',
    };
  }
  return {
    band: 'Critically Unprepared',
    description:
      'High-risk decisions compromised safety. Practice this simulation again to learn life-saving emergency protocols.',
  };
}

/**
 * Calculates normalized 0-100 preparedness score based on decision history.
 */
export function calculateScore(decisions: DecisionRecord[]): ScoreSummary {
  if (!decisions || decisions.length === 0) {
    return {
      score: 0,
      rawTotal: 0,
      maxPossible: 100,
      band: 'Critically Unprepared',
      bandDescription: 'No decisions recorded.',
      optimalCount: 0,
      suboptimalCount: 0,
      totalDecisions: 0,
    };
  }

  let rawTotal = 0;
  let optimalCount = 0;
  let suboptimalCount = 0;

  for (const d of decisions) {
    rawTotal += d.scoreImpact + (d.timeBonus || 0);
    if (d.isCorrect) {
      optimalCount++;
    } else {
      suboptimalCount++;
    }
  }

  // Maximum potential raw points (assuming avg 20 pts + up to 5 time bonus per decision)
  const maxPossible = decisions.length * 20 + 10;
  const normalized = Math.round(
    Math.min(100, Math.max(0, (rawTotal / maxPossible) * 100))
  );

  const { band, description } = getScoreBand(normalized);

  return {
    score: normalized,
    rawTotal,
    maxPossible,
    band,
    bandDescription: description,
    optimalCount,
    suboptimalCount,
    totalDecisions: decisions.length,
  };
}