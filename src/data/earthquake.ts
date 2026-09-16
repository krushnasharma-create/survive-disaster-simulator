// src/data/earthquake.ts
// Urban Apartment Daytime Earthquake Scenario
// Grounded in public safety principles from NDMA India, SACHET Portal, and 112 ERSS.

import type { Scenario } from './types';

export const earthquakeScenario: Scenario = {
  id: 'earthquake',
  title: 'Urban Seismic Event',
  subtitle: '4th Floor Residential Apartment — 11:47 AM',
  theme: 'earthquake',
  startNodeId: 'eq-d1-shake',
  nodes: {
    'eq-d1-shake': {
      id: 'eq-d1-shake',
      type: 'decision',
      situationText:
        '11:47 AM. The floor beneath you lurches with a sudden, violent vibration. Windowpanes rattle loudly in their frames and fine plaster dust drifts down from the ceiling. A tall wooden storage cabinet tilts as the shaking intensifies.',
      contextHint: 'Violent shaking has begun. Drop, cover, and hold on immediately.',
      timeLimit: 15,
      defaultChoiceId: 'eq-c1-stand-doorway',
      choices: [
        {
          id: 'eq-c1-drop-cover',
          label: 'Drop to your hands and knees, take cover under a sturdy wooden table, and hold on to its legs.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You crouch under the sturdy table and hold tightly to its legs. Moments later, a ceiling lamp fixture and a picture frame fall onto the tabletop, deflecting away safely. You stay sheltered until the primary shaking subsides.',
          insight:
            'NDMA Drop, Cover, and Hold On guidance: Drop to your hands and knees to avoid being thrown, cover your head and torso under sturdy furniture, and hold on until shaking stops completely.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
          nextNodeId: 'eq-d2-gas-hazard',
        },
        {
          id: 'eq-c1-run-stairs',
          label: 'Sprint out the front door immediately to try to reach the building stairwell.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'As you rush for the door, a sharp tremor throws you off balance against the frame. Falling plaster and shattered glass strike your shoulder and forearm, cutting your arm before you manage to brace yourself.',
          insight:
            'NDMA guidelines advise against running outside or into stairwells while ground shaking is active. Falling masonry, glass, and overhead debris pose the greatest danger to people in motion.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
          nextNodeId: 'eq-d2b-injured-hazard',
        },
        {
          id: 'eq-c1-stand-doorway',
          label: 'Stand upright inside the nearest doorway and hold onto the door frame.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'The doorway provides no overhead cover. The unlatched door swings rapidly with the tremor, striking your hands and bruising your fingers as falling ceiling plaster showers down around you.',
          insight:
            'In modern buildings, interior doorways are not reinforced shelters and leave you exposed to swinging doors and falling objects. Sheltering under sturdy furniture provides much better protection.',
          insightSource: 'NDMA Earthquake Preparedness Advice',
          nextNodeId: 'eq-d2b-injured-hazard',
        },
      ],
    },

    'eq-d2-gas-hazard': {
      id: 'eq-d2-gas-hazard',
      type: 'decision',
      situationText:
        'The main ground shaking stops after a tense period. The room has books and broken kitchenware scattered across the floor. In the quiet, you notice the distinct smell of leaking LPG cooking gas from the kitchen area, along with a sparking appliance cable.',
      contextHint: 'Damaged gas connections and electrical short-circuits are primary fire hazards following an earthquake.',
      choices: [
        {
          id: 'eq-c2-gas-power-off',
          label: 'Step carefully to the kitchen, switch off the LPG cylinder regulator valve, and turn off the main electrical MCB breaker.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You promptly turn the LPG cylinder regulator switch to the OFF position and trip the main circuit breaker on the entrance panel. Eliminating ignition sources and isolating the gas removes the immediate fire risk.',
          insight:
            'Turning off domestic gas valves and main electrical switches immediately after shaking stops helps prevent post-earthquake fires and accidental gas ignitions.',
          insightSource: 'NDMA Fire & Disaster Safety Guidelines',
          nextNodeId: 'eq-d3-evac-route',
        },
        {
          id: 'eq-c2-light-switch',
          label: 'Turn on the kitchen light switch to inspect where the gas pipe is leaking.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'Flipping the wall switch creates a tiny internal electrical spark, igniting a pocket of accumulated gas with a sharp flash! You jump back in shock, singeing your arm before smothering the small flame with a damp cloth.',
          insight:
            'Never flip electrical switches, light matches, or use open flames if a gas leak is suspected. Any electrical arc can ignite LPG fumes.',
          insightSource: 'NDMA & 112 ERSS Fire Safety Guidance',
          nextNodeId: 'eq-d3-evac-route',
        },
        {
          id: 'eq-c2-ignore-flee',
          label: 'Ignore the smell and rush out the door immediately into the building corridor.',
          isCorrect: false,
          scoreImpact: -5,
          consequenceText:
            'You leave the apartment with the gas line hissing behind you. While you reach the hallway, you leave an unmitigated fire hazard that puts other occupants and arriving emergency responders at risk.',
          insight:
            'Taking a few moments to turn off the gas cylinder and electricity before leaving helps protect the building from devastating secondary fires.',
          insightSource: 'NDMA Household Emergency Planning',
          nextNodeId: 'eq-d3-evac-route',
        },
      ],
    },

    'eq-d2b-injured-hazard': {
      id: 'eq-d2b-injured-hazard',
      type: 'decision',
      situationText:
        'Your forearm is bleeding from broken glass and dust stings your eyes. The ground shaking has paused, but you smell leaking LPG cooking gas from the kitchen. You are shaken and breathing rapidly.',
      contextHint: 'Control bleeding while ensuring you do not leave an active ignition hazard behind.',
      choices: [
        {
          id: 'eq-c2b-firstaid-gas',
          label: 'Apply firm pressure to your cut with a clean cloth, then quickly shut off the kitchen LPG regulator and electrical main.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Direct pressure slows the bleeding. Keeping calm, you shut off the gas cylinder regulator and trip the main power switch before preparing to evacuate with your identification and keys.',
          insight:
            'Basic first aid prioritizes controlling bleeding with clean direct pressure. Securing obvious gas and power hazards prevents compounding emergency dangers.',
          insightSource: 'NDMA & First Aid Principles',
          nextNodeId: 'eq-d3-evac-route',
        },
        {
          id: 'eq-c2b-panic-flee',
          label: 'Clutch your injured arm and bolt directly into the common hallway in distress.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'In distress, you run into the corridor without dressing your wound or turning off the gas valve, leaving an open hazard and heading downstairs without essential supplies.',
          insight:
            'Panic often leads to hurried actions that leave household hazards unchecked. Taking a moment to compose yourself helps prevent subsequent emergencies.',
          insightSource: 'NDMA Community Safety Guidelines',
          nextNodeId: 'eq-d3-evac-route',
        },
      ],
    },

    'eq-d3-evac-route': {
      id: 'eq-d3-evac-route',
      type: 'decision',
      situationText:
        'You step out into the 4th-floor residential corridor. Neighbours are calling out and alarms echo. Plaster cracks are visible along the walls. You need to descend four floors to ground level.',
      contextHint: 'Vertical evacuation: The passenger elevator is standing with doors open, while the staircase door is accessible.',
      choices: [
        {
          id: 'eq-c3-stairwell',
          label: 'Head into the designated fire staircase, hold the handrail, and walk down at a calm, steady pace.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You use the reinforced staircase, keeping to the right and gripping the handrail. Moving down steadily avoids tripping in the stairwell dust and keeps the pathway clear for others.',
          insight:
            'Always use staircases rather than elevators during an evacuation. Move steadily and hold the handrail to avoid falls or crowd crushes.',
          insightSource: 'NDMA High-Rise Evacuation Guidelines',
          nextNodeId: 'eq-d4-aftershock',
        },
        {
          id: 'eq-c3-elevator',
          label: 'The elevator is open; step inside with two neighbours to reach the ground floor quickly.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'You step into the elevator and press the ground button. Two floors down, an electrical protection breaker trips! The lift shudders to an abrupt halt and stalls in total darkness between floors.',
          insight:
            'Never use elevators during or following an earthquake. Power outages and structural shifts frequently jam elevator cars between floors, trapping occupants inside.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
          nextNodeId: 'eq-d3b-elevator-trap',
        },
        {
          id: 'eq-c3-balcony',
          label: 'Go out onto the corridor balcony to wave down and shout for emergency rescuers.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'As you step onto the external balcony, a cracking sound echoes beneath your feet. You notice stress cracks along the joint where the balcony slab joins the main wall, prompting you to retreat inside immediately.',
          insight:
            'Cantilevered balconies and external projections are vulnerable to damage during seismic events. Avoid gathering on balconies after an earthquake.',
          insightSource: 'General Structural Safety Principles',
          nextNodeId: 'eq-d4-aftershock',
        },
      ],
    },

    'eq-d3b-elevator-trap': {
      id: 'eq-d3b-elevator-trap',
      type: 'decision',
      situationText:
        'You are stuck inside the stalled elevator car in near darkness. Dust filters in through the top vent. A neighbour starts to panic. The building vibrates faintly with ground movement.',
      contextHint: 'Remain calm and avoid risky attempts to climb out into the elevator shaft.',
      choices: [
        {
          id: 'eq-c3b-alarm-call',
          label: 'Turn on your phone flashlight, press the emergency alarm button, and shout through the door seam to people on the floor landing.',
          isCorrect: true,
          scoreImpact: 10,
          consequenceText:
            'Residents and building staff hear the alarm bell. They open the outer landing doors on the 2nd floor and help everyone exit safely onto the landing.',
          insight:
            'If trapped in an elevator, stay calm, use the emergency alarm or phone to alert people outside, and wait for assistance rather than attempting dangerous self-rescue.',
          insightSource: 'General Emergency Preparedness Guidance',
          nextNodeId: 'eq-d4-aftershock',
        },
        {
          id: 'eq-c3b-force-drop',
          label: 'Pry open the inner doors with your hands and try to jump down into the dark shaft opening below.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'You force the doors apart. Looking down reveals exposed cables and a steep drop to the pit. You slip on the threshold, straining your wrist before your neighbour pulls you back into the cabin.',
          insight:
            'Attempting to exit an elevator car into an open shaft without trained rescue personnel carries a severe risk of fatal falls.',
          insightSource: 'General Emergency Preparedness Guidance',
          nextNodeId: 'eq-d4-aftershock',
        },
      ],
    },

    'eq-d4-aftershock': {
      id: 'eq-d4-aftershock',
      type: 'decision',
      situationText:
        'You are on the 2nd-floor stair landing when a sudden rumble vibrates the building — an AFTERSHOCK strikes! The concrete staircase vibrates strongly and small pieces of wall plaster fall.',
      contextHint: 'Ground is vibrating again. React quickly to protect yourself.',
      timeLimit: 15,
      defaultChoiceId: 'eq-c4-stampede',
      choices: [
        {
          id: 'eq-c4-crouch-interior',
          label: 'Crouch low on the landing against the interior wall, protect your head and neck with your arms, and stay still.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You drop low against the solid interior wall, shielding your head and neck with your arms. Plaster fragments bounce off your forearms safely until the tremor subsides.',
          insight:
            'If caught on stairs during an aftershock, crouch low on a landing against an interior structural wall, protect your head and neck, and wait until shaking stops.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
          nextNodeId: 'eq-d5-street-hazard',
        },
        {
          id: 'eq-c4-stampede',
          label: 'Panic and sprint down the remaining flights of stairs as fast as you can.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'The moving stairs throw off your footing. You stumble down several concrete steps, badly spraining your ankle and scraping your knees before reaching the ground lobby.',
          insight:
            'Running down stairs while shaking is active is a frequent cause of severe falls, sprains, and crowd stampedes in emergency stairwells.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
          nextNodeId: 'eq-d5-street-hazard',
        },
        {
          id: 'eq-c4-clutch-railing',
          label: 'Stand upright and grip the decorative metal stair railing tightly with both hands.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'The vibration loosens the railing brackets from the masonry. The railing wobbles under your weight, throwing you off balance before you drop to your knees.',
          insight:
            'Stair railings can bend or loosen under ground movement. Crouching low against a solid interior wall gives much better stability.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
          nextNodeId: 'eq-d5-street-hazard',
        },
      ],
    },

    'eq-d5-street-hazard': {
      id: 'eq-d5-street-hazard',
      type: 'decision',
      situationText:
        'You exit the lobby doors into the open courtyard. Distressed residents are standing directly beneath building balconies and outdoor air conditioner units. Loose overhead utility wires sway in the breeze.',
      contextHint: 'The area directly around high-rise exteriors is vulnerable to falling glass and debris.',
      choices: [
        {
          id: 'eq-c5-open-ground',
          label: 'Move briskly to the center of the open community park, well clear of building walls, glass facades, and power lines.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You walk out to the open park lawn. Moments later, broken window glass and a loose facade panel fall onto the walkway near the building. You are in a clear, safe area.',
          insight:
            'Falling facade glass, tiles, and parapet debris pose major hazards around buildings after an earthquake. Move to an open area away from structures and overhead wires.',
          insightSource: 'NDMA Earthquake Safety Guidelines & SACHET Portal',
          nextNodeId: 'eq-d6-post-comms',
        },
        {
          id: 'eq-c5-under-porch',
          label: 'Stand under the building entrance glass canopy to wait out the commotion.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Debris falling from an upper floor hits the canopy, cracking glass panels overhead and showering grit onto the entrance area.',
          insight:
            'Building entrance canopies and overhangs are vulnerable to falling debris during aftershocks. Clear the immediate perimeter of the building.',
          insightSource: 'NDMA Community Safety Guidelines',
          nextNodeId: 'eq-d6-post-comms',
        },
        {
          id: 'eq-c5-reenter-valuables',
          label: 'Remember you left your house keys and wallet; quickly head back inside the building to retrieve them.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'A building volunteer calls you back, warning of structural damage. Overhead, loose masonry near the entryway fractures and falls near the doorway.',
          insight:
            'Never re-enter a damaged building after an earthquake for personal belongings. Aftershocks can cause weakened structures to collapse without warning.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
          nextNodeId: 'eq-d6-post-comms',
        },
      ],
    },

    'eq-d6-post-comms': {
      id: 'eq-d6-post-comms',
      type: 'decision',
      situationText:
        'You are safely in the open park along with other community members. Cellular voice networks are congested with failing calls. Sirens sound in the distance as emergency services deploy. A neighbour asks how to reach family and whether to call emergency services.',
      contextHint: 'Use telecommunication channels responsibly during widespread emergencies.',
      choices: [
        {
          id: 'eq-c6-sms-sachet-112',
          label: 'Advise sending short text messages (SMS) to family to confirm safety, checking SACHET for alerts, and keeping 112 open for life-threatening emergencies.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Your brief SMS delivers promptly. By keeping cellular voice channels free, emergency services can coordinate ambulances and rescue teams for injured citizens.',
          insight:
            'During major emergencies, cellular voice networks quickly become congested. Use SMS or messaging to check on loved ones, consult official sources like SACHET, and reserve 112 for critical life-threatening situations.',
          insightSource: 'Government of India 112 ERSS & NDMA Advisory',
          nextNodeId: 'eq-outcome-node',
        },
        {
          id: 'eq-c6-spam-voice-calls',
          label: 'Repeatedly redial voice calls to numerous contacts while complaining about network failure.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Every call drops with a network busy signal. Within twenty minutes, your phone battery drops significantly, leaving you with little power for official announcements.',
          insight:
            'Repeated voice call attempts drain phone battery and add to network congestion during disaster response operations.',
          insightSource: '112 ERSS Advisory',
          nextNodeId: 'eq-outcome-node',
        },
        {
          id: 'eq-c6-forward-rumours',
          label: 'Forward unverified audio messages on social media warning of an impending massive earthquake at a specific hour.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'The message causes unnecessary alarm among park evacuees, prompting several people to scramble into the street and hinder arriving emergency vehicles.',
          insight:
            'Earthquakes cannot be predicted by exact time. Rely on official bulletins from authorized agencies like NDMA and IMD, and avoid forwarding unverified warnings.',
          insightSource: 'NDMA Citizen Advisory',
          nextNodeId: 'eq-outcome-node',
        },
      ],
    },

    'eq-outcome-node': {
      id: 'eq-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You have reached safety in an open assembly area. Local emergency responders and disaster management personnel are cordoning off compromised areas. Your calm, informed decisions helped keep you and others safe from critical hazards.',
      nextNodeId: 'eq-report-node',
    },
  },
};