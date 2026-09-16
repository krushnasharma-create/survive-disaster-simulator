// src/data/index.ts
import type { DisasterType, Scenario } from './types';
import { earthquakeScenario } from './earthquake';
import { earthquakeWorkplaceScenario } from './earthquakeWorkplace';
import { fireScenario } from './fire';
import { fireCommercialScenario } from './fireCommercial';
import { floodScenario } from './flood';
import { floodStreetScenario } from './floodStreet';

export interface ScenarioCatalogueItem {
  id: string;
  disasterType: DisasterType;
  category: 'modern' | 'historical';
  title: string;
  subtitle: string;
  location?: string;
  date?: string;
  description: string;
  status: 'playable' | 'coming_soon';
  code: string;
}

export const SCENARIO_CATALOGUE: Record<DisasterType, ScenarioCatalogueItem[]> = {
  earthquake: [
    {
      id: 'earthquake-urban',
      disasterType: 'earthquake',
      category: 'modern',
      title: 'Urban Apartment Earthquake',
      subtitle: 'Modern Multi-Storey Residential · 11:47 AM',
      description: 'Sudden seismic shockwave hits a high-density urban apartment. Structural tremor navigation, gas hazard isolation, and exterior collapse perimeter clearance.',
      status: 'playable',
      code: 'SCN-EQ-01',
    },
    {
      id: 'earthquake-workplace',
      disasterType: 'earthquake',
      category: 'modern',
      title: 'Commercial Workplace Earthquake',
      subtitle: '7th Floor Tech Park Office · 03:22 PM',
      description: 'Midday seismic shock in an open-plan office. Heavy desk sheltering, corridor conduit hazard navigation, stairwell aftershocks, and assembly roll-call.',
      status: 'playable',
      code: 'SCN-EQ-02',
    },
    {
      id: 'earthquake-bhuj-2001',
      disasterType: 'earthquake',
      category: 'historical',
      title: 'Bhuj Seismic Emergency',
      subtitle: 'Historical Simulation · Kutch, Gujarat',
      location: 'Bhuj, Gujarat',
      date: '26 January 2001',
      description: 'A major morning earthquake strikes the Kutch region on Republic Day. Masonry building collapse hazards, open ground evacuation, and immediate community response.',
      status: 'coming_soon',
      code: 'HIST-EQ-2001',
    },
  ],
  fire: [
    {
      id: 'fire-residential',
      disasterType: 'fire',
      category: 'modern',
      title: 'Structure Fire & Smoke Inundation',
      subtitle: 'Residential Multi-Storey Building · 02:13 AM',
      description: 'Midnight smoke alarm discovery. Thermal door checks, low crawling beneath toxic smoke ceiling, fire-door compartmentalization, and 112 ERSS coordination.',
      status: 'playable',
      code: 'SCN-FR-02',
    },
    {
      id: 'fire-commercial',
      disasterType: 'fire',
      category: 'modern',
      title: 'Commercial Complex Fire & Smoke',
      subtitle: 'Multi-Storey Shopping Complex · 06:45 PM',
      description: 'Evening restaurant exhaust fire in a crowded complex. Escalator flue bypass, low smoke corridor crawl, fire door sealing, and incident command reporting.',
      status: 'playable',
      code: 'SCN-FR-03',
    },
    {
      id: 'fire-uphaar-1997',
      disasterType: 'fire',
      category: 'historical',
      title: 'Commercial Complex Enclosure Fire',
      subtitle: 'Historical Simulation · Green Park, Delhi',
      location: 'Delhi',
      date: '13 June 1997',
      description: 'Transformer explosion triggers thick smoke infiltration in an enclosed public auditorium. Exit path obstruction, asphyxiation avoidance, and structural crowd movement.',
      status: 'coming_soon',
      code: 'HIST-FR-1997',
    },
  ],
  flood: [
    {
      id: 'flood-urban',
      disasterType: 'flood',
      category: 'modern',
      title: 'Flash Flood Inundation',
      subtitle: 'Low-Lying Urban Colony · Monsoon Cloudburst',
      description: 'Rapidly rising urban storm runoff. Immediate MCB power isolation, vertical terrace refuge, moving water hazard avoidance, and NDRF rescue signaling.',
      status: 'playable',
      code: 'SCN-FL-03',
    },
    {
      id: 'flood-street',
      disasterType: 'flood',
      category: 'modern',
      title: 'Urban Street & Transit Flood',
      subtitle: 'Arterial Ring Road Underpass · 07:15 PM',
      description: 'Submerged railway underpass commute decision. Avoiding vehicle entrapment, navigating downed power lines, stick probing open drains, and relief center hygiene.',
      status: 'playable',
      code: 'SCN-FL-04',
    },
    {
      id: 'flood-mumbai-2005',
      disasterType: 'flood',
      category: 'historical',
      title: 'Mumbai Deluge Crisis',
      subtitle: 'Historical Simulation · Mumbai, Maharashtra',
      location: 'Mumbai, Maharashtra',
      date: '26 July 2005',
      description: 'Record torrential precipitation causes unprecedented metropolis-wide flash flooding. Power grid shutdown, vehicle stranding, and high-ground vertical shelter.',
      status: 'coming_soon',
      code: 'HIST-FL-2005',
    },
  ],
};

export const SCENARIOS: Record<string, Scenario> = {
  earthquake: earthquakeScenario,
  'earthquake-urban': earthquakeScenario,
  'earthquake-workplace': earthquakeWorkplaceScenario,
  fire: fireScenario,
  'fire-residential': fireScenario,
  'fire-commercial': fireCommercialScenario,
  flood: floodScenario,
  'flood-urban': floodScenario,
  'flood-street': floodStreetScenario,
};

export function getScenario(idOrDisaster: string): Scenario | undefined {
  return SCENARIOS[idOrDisaster];
}

export function getScenariosForDisaster(disaster: DisasterType): ScenarioCatalogueItem[] {
  return SCENARIO_CATALOGUE[disaster] || [];
}