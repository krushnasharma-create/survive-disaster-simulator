// src/data/index.ts
import type { DisasterType, Scenario } from './types';
import { earthquakeScenario } from './earthquake';

export const SCENARIOS: Record<DisasterType, Scenario> = {
  earthquake: earthquakeScenario,
  fire: {
    id: 'fire',
    title: 'Structure Fire Hazard',
    subtitle: 'Residential Home — 02:13 AM',
    theme: 'fire',
    startNodeId: '',
    nodes: {},
  },
  flood: {
    id: 'flood',
    title: 'Flash Flood Warning',
    subtitle: 'Low-Lying Urban Colony — Monsoon Cloudburst',
    theme: 'flood',
    startNodeId: '',
    nodes: {},
  },
};

export function getScenario(id: DisasterType): Scenario | undefined {
  return SCENARIOS[id];
}