// src/data/index.ts
import type { DisasterType, Scenario } from './types';
import { earthquakeScenario } from './earthquake';
import { fireScenario } from './fire';
import { floodScenario } from './flood';

export const SCENARIOS: Record<DisasterType, Scenario> = {
  earthquake: earthquakeScenario,
  fire: fireScenario,
  flood: floodScenario,
};

export function getScenario(id: DisasterType): Scenario | undefined {
  return SCENARIOS[id];
}