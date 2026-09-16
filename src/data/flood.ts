// src/data/flood.ts
// Low-Lying Urban Colony Flash Flood Scenario Foundation
// Authoritative Grounding: NDMA Urban Flood Management & Central Water Commission (CWC)

import type { Scenario } from './types';

export const floodScenario: Scenario = {
  id: 'flood',
  title: 'Flash Flood Warning',
  subtitle: 'Low-Lying Urban Colony — Monsoon Cloudburst',
  theme: 'flood',
  startNodeId: 'flood-d1-warning',
  nodes: {
    'flood-d1-warning': {
      id: 'flood-d1-warning',
      type: 'decision',
      situationText:
        'Torrential monsoon rains have triggered flash flooding in your low-lying neighborhood. Water is lapping against your ground-floor doorstep and rising at several inches per minute. An official emergency alert pings your phone advising immediate protective action.',
      contextHint: 'Water is beginning to seep beneath the front door into the living room.',
      timeLimit: 15,
      defaultChoiceId: 'flood-c1-wait-indoors',
      choices: [
        {
          id: 'flood-c1-isolate-utilities',
          label: 'Turn off the main electrical MCB switch and LPG gas valve, collect your emergency kit, and prepare for vertical evacuation.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You immediately flip the main power breaker and isolate the cooking gas. Turning off utilities eliminates the acute risk of electrocution as muddy water enters the ground floor.',
          insight:
            'NDMA Flood Safety Protocol: Always turn off main electricity and gas connections before floodwaters enter living spaces to avoid electrocution and secondary explosions.',
          insightSource: 'NDMA Urban Flood Safety Guidelines',
          nextNodeId: 'flood-d2-water-depth',
        },
        {
          id: 'flood-c1-wait-indoors',
          label: 'Stay in the living room and attempt to towel dry the entrance to block the water.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'A rush of muddy storm runoff bursts through the door seal. Within three minutes, water reaches knee depth, submerging electrical extension cords and sparking an alarming surge before power trips.',
          insight:
            'Never delay evacuation or utility isolation in rapid flash floods. Towels cannot halt rising runoff, and submerged outlets create deadly electrical shock zones.',
          insightSource: 'NDMA Flood Preparedness Directives',
          nextNodeId: 'flood-d2-water-depth',
        },
      ],
    },

    'flood-d2-water-depth': {
      id: 'flood-d2-water-depth',
      type: 'decision',
      situationText:
        'Water on the street outside is swirling at waist depth with strong surface currents. A neighbour is shouting from their vehicle in the road, while your building has an accessible concrete rooftop staircase.',
      contextHint: 'Moving water is deceptive and exerts immense lateral hydraulic force.',
      choices: [
        {
          id: 'flood-c2-rooftop-refuge',
          label: 'Head upstairs to the upper floor and rooftop terrace with drinking water and your phone, awaiting official rescue or water recession.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You ascend to the solid roof terrace above flood levels. From this elevated vantage point, you remain dry and safe while signaling your location to disaster response teams.',
          insight:
            'Seek vertical refuge on upper floors or solid rooftops if trapped by deep or rapid floodwaters. Avoid wading or driving through moving water.',
          insightSource: 'NDMA Flood Evacuation Guidance',
          nextNodeId: 'flood-outcome-node',
        },
        {
          id: 'flood-c2-wade-street',
          label: 'Wade into the flooded street to try to walk toward the main highway across the colony.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'As soon as you step into the street flow, the hidden current knocks you off your feet. Open stormwater manholes beneath the murky water pose a lethal drowning hazard before you cling to a boundary gate.',
          insight:
            'Never walk through moving floodwater. Just 15 cm (6 inches) of moving water can knock an adult off their feet, and submerged open manholes are fatal hazards in urban floods.',
          insightSource: 'NDMA & CWC Flood Safety Advisory',
          nextNodeId: 'flood-outcome-node',
        },
      ],
    },

    'flood-outcome-node': {
      id: 'flood-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You secured high-ground refuge. State Disaster Response teams and local municipal boats have arrived to evacuate residents safely. Your proactive utility shutoff and refusal to enter moving waters preserved life safety.',
      nextNodeId: 'flood-report-node',
    },
  },
};