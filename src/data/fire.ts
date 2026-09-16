// src/data/fire.ts
// Residential Multi-Storey Fire Scenario Foundation
// Authoritative Grounding: NDMA Residential Fire Safety & Delhi Fire Service Guidance

import type { Scenario } from './types';

export const fireScenario: Scenario = {
  id: 'fire',
  title: 'Structure Fire Hazard',
  subtitle: 'Residential Multi-Storey Building — 02:13 AM',
  theme: 'fire',
  startNodeId: 'fire-d1-alarm',
  nodes: {
    'fire-d1-alarm': {
      id: 'fire-d1-alarm',
      type: 'decision',
      situationText:
        '02:13 AM. The shrill, piercing beep of a smoke alarm jolts you awake. The bedroom is pitch dark. Through the gap beneath your closed bedroom door, you see a faint orange flicker and a grey wisp of acrid smoke creeping along the floorboards.',
      contextHint: 'Your bedroom door is closed. Heat and smoke are active on the other side.',
      timeLimit: 15,
      defaultChoiceId: 'fire-c1-open-wide',
      choices: [
        {
          id: 'fire-c1-back-of-hand',
          label: 'Touch the door and metal doorknob lightly with the back of your hand to test for heat before attempting to open it.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'The metal knob is moderately cool. Kneeling low, you brace your shoulder against the door and crack it open two inches. You observe light smoke in the corridor at head height, but the path toward the main exit is navigable.',
          insight:
            'Always test closed doors and doorknobs with the back of your hand before opening. A warm door indicates intense fire on the other side that can trigger an explosive flashover if opened.',
          insightSource: 'NDMA Fire Safety Protocols',
          nextNodeId: 'fire-d2-smoke-crawl',
        },
        {
          id: 'fire-c1-open-wide',
          label: 'Fling the bedroom door open immediately to sprint down the corridor to the front door.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Flinging the door open creates an instant draft. A sudden rush of superheated air and thick, stinging black smoke billows into your bedroom, blinding you and triggering a severe coughing fit.',
          insight:
            'Never open a door rapidly during a fire. If fire or smoke is present outside, opening the door feeds oxygen to the blaze and draws lethal toxic gases directly into your room.',
          insightSource: 'NDMA Residential Fire Directives',
          nextNodeId: 'fire-d2-smoke-crawl',
        },
      ],
    },

    'fire-d2-smoke-crawl': {
      id: 'fire-d2-smoke-crawl',
      type: 'decision',
      situationText:
        'You are in the hallway. Thick, dark smoke is billowing across the ceiling and descending. Visibility is dropping rapidly. The exit staircase door is thirty feet ahead at the end of the passage.',
      contextHint: 'Toxic smoke rises to the ceiling; breathable air remains near the floor.',
      choices: [
        {
          id: 'fire-c2-crawl-low',
          label: 'Drop to your hands and knees and crawl beneath the smoke layer, keeping your head 1 to 2 feet above the floor.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'By staying low beneath the rising thermal smoke layer, you breathe cooler, cleaner air and can see the baseboards along the hallway, reaching the staircase door safely.',
          insight:
            'In a fire, superheated toxic gases and smoke rise toward the ceiling. Cleaner air and better visibility remain in the bottom 30 to 60 cm of the room. Always crawl low under smoke.',
          insightSource: 'NDMA & Fire Emergency Standards',
          nextNodeId: 'fire-d3-staircase',
        },
        {
          id: 'fire-c2-run-upright',
          label: 'Stand upright and jog briskly through the hallway holding your breath.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'Standing upright places your airway directly inside the dense smoke ceiling. Two breaths of toxic carbon monoxide burn your throat and disorient you, causing you to stumble against the wall.',
          insight:
            'Smoke inhalation is the primary cause of fatalities in building fires. Standing upright exposes your respiratory tract to lethal superheated gases.',
          insightSource: 'NDMA & Fire Safety Guidelines',
          nextNodeId: 'fire-d3-staircase',
        },
      ],
    },

    'fire-d3-staircase': {
      id: 'fire-d3-staircase',
      type: 'decision',
      situationText:
        'You reach the landing. You must descend four floors to the ground exit. The elevator door is closed nearby, and the fire staircase door is in front of you.',
      contextHint: 'Vertical evacuation during an active structure fire.',
      choices: [
        {
          id: 'fire-c3-stairs-close-door',
          label: 'Enter the fire staircase, close the fire door firmly behind you, and descend steadily using the handrail.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Closing the fire door compartmentalizes the smoke, preventing it from flooding the stairwell. You descend the stairs in clear air and exit through the ground-level discharge door.',
          insight:
            'Closing doors behind you slows the spread of fire and smoke throughout escape stairwells. Always use designated fire stairs and never elevators in a fire.',
          insightSource: 'NDMA High-Rise Fire Evacuation Guidelines',
          nextNodeId: 'fire-outcome-node',
        },
        {
          id: 'fire-c3-elevator',
          label: 'Press the elevator call button to try to ride down quickly to the ground floor.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'The elevator does not respond. Power fails as electrical cables burn, wasting precious seconds while smoke continues to build in the corridor.',
          insight:
            'Never use elevators in a fire. Electrical failure can stall the car, and elevator shafts act as natural chimneys channeling toxic smoke and heat.',
          insightSource: 'NDMA Fire Safety Guidelines',
          nextNodeId: 'fire-outcome-node',
        },
      ],
    },

    'fire-outcome-node': {
      id: 'fire-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You have evacuated to a safe outdoor assembly area well clear of the building. Emergency fire tenders from 112 have arrived on scene to conduct fire suppression and ensure all occupants are accounted for.',
      nextNodeId: 'fire-report-node',
    },
  },
};