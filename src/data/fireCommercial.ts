// src/data/fireCommercial.ts
// Commercial Shopping Mall & Multiplex Enclosure Fire Scenario
// Grounded in public safety principles from NDMA India, Delhi Fire Service, and 112 ERSS.

import type { Scenario } from './types';

export const fireCommercialScenario: Scenario = {
  id: 'fire-commercial',
  disasterType: 'fire',
  category: 'modern',
  title: 'Commercial Complex Fire & Smoke',
  subtitle: 'Multi-Storey Shopping Complex · 06:45 PM',
  theme: 'fire',
  startNodeId: 'frc-d1-alarm-discovery',
  nodes: {
    // NODE 1: Initial Discovery & Alarm in Food Court (Timed: 15s)
    'frc-d1-alarm-discovery': {
      id: 'frc-d1-alarm-discovery',
      type: 'decision',
      situationText:
        '06:45 PM. You are on the 3rd floor of a crowded commercial complex. A sharp klaxon sounds, and dense grey smoke starts rolling out from a restaurant kitchen exhaust shaft. Shoppers look around in confusion as someone screams that a kitchen deep-fryer exploded.',
      contextHint: 'The food court is rapidly filling with toxic grease smoke. People are beginning to mill toward the central escalators.',
      timeLimit: 15,
      defaultChoiceId: 'frc-c1-central-escalator',
      environmentEvents: [
        { triggerAtSeconds: 5, effectType: 'smoke', intensity: 'medium' },
      ],
      choices: [
        {
          id: 'frc-c1-locate-fire-exit',
          label: 'Immediately scan overhead signage for the green illuminated Fire Exit staircase door, bypass the central atrium escalators, and instruct nearby shoppers to follow you.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You quickly spot the green running-man Fire Exit sign and lead six nearby shoppers through the self-closing fire door into the pressurized concrete escape stairwell, avoiding the escalating crowd surge at the escalators.',
          insight:
            'NDMA and National Building Code guidance states that central escalators and elevators are not rated fire exits and rapidly channel smoke upwards. Always head immediately toward enclosed, illuminated fire exit stairs.',
          insightSource: 'NDMA Commercial Building Fire Safety',
          nextNodeId: 'frc-d2-corridor-visibility',
        },
        {
          id: 'frc-c1-central-escalator',
          label: 'Rush toward the central glass escalators to ride down to the ground floor atrium.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'The automatic building fire system has already shut power to the escalators. A massive bottleneck forms as dozens of panicked shoppers jam onto the stationary stairs while heavy smoke rises up the central atrium shaft.',
          insight:
            'Building management systems automatically halt escalators during fire alarms. Escalator shafts act as open flues for superheated smoke, making them critical hazard zones.',
          insightSource: 'NDMA Fire Safety Guidelines',
          nextNodeId: 'frc-d2b-atrium-crowd-triage',
        },
        {
          id: 'frc-c1-investigate-kitchen',
          label: 'Walk closer to the restaurant kitchen to check if the fire is small enough to put out with a fire extinguisher.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'A secondary fireball rolls across the kitchen ceiling. A blast of stinging, aerosolized oil smoke hits your face, making your eyes water and inducing coughing before you turn back in distress.',
          insight:
            'Grease and commercial kitchen fires can rapidly escalate with flashovers and grease vapor explosions. Untrained civilians should prioritize immediate evacuation and alarm propagation rather than fighting commercial grease fires.',
          insightSource: 'NDMA Fire Service Operational Guidance',
          nextNodeId: 'frc-d2b-atrium-crowd-triage',
        },
      ],
    },

    // NODE 2A: Smoke Corridor Navigation (Primary Path from clean exit)
    'frc-d2-corridor-visibility': {
      id: 'frc-d2-corridor-visibility',
      type: 'decision',
      situationText:
        'Inside the rear service passage leading to the fire stairwell, light smoke has seeped past an unlatched access door. Visibility is dropping at head height, but the air near the floor tiles is significantly clearer.',
      contextHint: 'Thermal layering: heat and lethal carbon monoxide collect near the ceiling.',
      choices: [
        {
          id: 'frc-c2-crouch-walk-wall',
          label: 'Drop to a low crouch, cover your mouth and nose with your sleeve, keep one hand in contact with the left wall, and advance toward the staircase door.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Crouching keeps your head below the toxic thermal smoke layer. Keeping contact with the wall ensures you do not lose orientation in the dim emergency lighting, reaching the fire door without inhaling smoke.',
          insight:
            'Staying low beneath the smoke ceiling protects against superheated gases and asphyxiating carbon monoxide. Using the perimeter wall ensures navigation even in near-zero visibility.',
          insightSource: 'NDMA Fire Evacuation Standard',
          nextNodeId: 'frc-d3-stairwell-blocked-door',
        },
        {
          id: 'frc-c2-walk-upright-fast',
          label: 'Walk briskly upright while holding your breath, trying to clear the corridor quickly.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Walking upright forces you to inhale the hot ceiling smoke layer after a few seconds. The acrid fumes trigger uncontrollable coughing and disorientation, forcing you to stop and kneel.',
          insight:
            'Holding breath while walking upright is ineffective; inhalation reflex triggers quickly under exertion. Dropping low is the only reliable way to access cooler, oxygenated air.',
          insightSource: 'NDMA Fire Survival Advisory',
          nextNodeId: 'frc-d3-stairwell-blocked-door',
        },
      ],
    },

    // NODE 2B: Atrium Crowd Triage (Branch Path from early mistake)
    'frc-d2b-atrium-crowd-triage': {
      id: 'frc-d2b-atrium-crowd-triage',
      type: 'decision',
      situationText:
        'You are caught near the choked central atrium. Smoke is pouring across the 3rd-floor ceiling. A mother with a toddler is stumbling against the escalator railing as people push blindly toward the dead steps.',
      contextHint: 'Break the crowd funnel by diverting people to the side service exit.',
      choices: [
        {
          id: 'frc-c2b-divert-crowd',
          label: 'Shout loudly pointing toward the illuminated rear service exit: "EXIT IS THIS WAY! FOLLOW ME!" and assist the mother away from the escalator crush.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Your clear, authoritative direction breaks the panic funnel. A dozen shoppers turn away from the stalled escalator and follow you safely into the clear service corridor.',
          insight:
            'In public fire emergencies, panic and group mimicry often funnel crowds into dead ends. Vocal leadership and pointing out secondary emergency exits saves lives.',
          insightSource: 'NDMA Crowd Management Guidelines',
          nextNodeId: 'frc-d3-stairwell-blocked-door',
        },
        {
          id: 'frc-c2b-push-escalator',
          label: 'Push harder into the stalled escalator crowd to force your way down the steps.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Someone trips on the metal steps ahead. The surge causes a pileup; you are bruised against the glass balustrade and breathe in hot smoke before you manage to pull yourself backward.',
          insight:
            'Crowd crushes on escalators and stairways during evacuations lead to catastrophic trampling injuries and fatal smoke exposure.',
          insightSource: 'NDMA Crowd Safety Protocol',
          nextNodeId: 'frc-d3-stairwell-blocked-door',
        },
      ],
    },

    // NODE 3: Stairwell Access & Smoke Door Sealing (Timed: 15s)
    'frc-d3-stairwell-blocked-door': {
      id: 'frc-d3-stairwell-blocked-door',
      type: 'decision',
      situationText:
        'You reach the heavy 2-hour fire-rated steel staircase door. As you herd the evacuees through, you see smoke beginning to billow from the service corridor into the stairwell enclosure behind you. An unlatched wedge is holding the fire door slightly open.',
      contextHint: 'Fire stairwells remain safe only if fire-rated doors are kept tightly closed.',
      timeLimit: 15,
      defaultChoiceId: 'frc-c3-leave-propped',
      choices: [
        {
          id: 'frc-c3-kick-wedge-seal',
          label: 'Kick away the door wedge and ensure the heavy steel door clicks shut fully behind the group before descending.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'The heavy door clicks into its magnetic latch with a firm thud, completely isolating the stairwell from the smoke and flames in the corridor. The air in the stairwell remains clean and breathable.',
          insight:
            'Fire doors save lives by compartmentalizing smoke and flames. Propping open or wedging fire doors turns enclosed staircases into toxic chimneys.',
          insightSource: 'NDMA & National Building Code of India',
          nextNodeId: 'frc-d4-ground-exit-triage',
        },
        {
          id: 'frc-c3-leave-propped',
          label: 'Leave the door wedged open so any stragglers behind you can find the stairwell without having to push the heavy door.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'Within two minutes, black smoke from the corridor rushes through the open gap and funnels rapidly down the stairwell shaft, contaminating the primary escape route for everyone.',
          insight:
            'Never wedge a fire door open during an evacuation. Modern fire doors have external push-bars that allow easy entry while keeping smoke strictly compartmentalized.',
          insightSource: 'NDMA Fire Safety Advisory',
          nextNodeId: 'frc-d4-ground-exit-triage',
        },
      ],
    },

    // NODE 4: Ground-Floor Exit Discharge & Exterior Perimeter
    'frc-d4-ground-exit-triage': {
      id: 'frc-d4-ground-exit-triage',
      type: 'decision',
      situationText:
        'You descend the stairs and push open the final ground-level discharge exit door, spilling out onto the rear delivery alleyway of the complex. Fire engines are screaming into the main front courtyard. Overhead on the 3rd floor, restaurant facade windows are blowing out from heat.',
      contextHint: 'Glass shards and commercial grease flare-ups can shower the rear perimeter.',
      choices: [
        {
          id: 'frc-c4-move-cross-street',
          label: 'Immediately guide the evacuees across the service alley into the open parking lot 80 meters away, clear of overhead glass and arriving emergency tenders.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'You lead the group across the road to the open tarmac. Moments later, a shattered tempered-glass window pane cascades down onto the service alley where you were just standing.',
          insight:
            'Discharge exits often release occupants into perimeter drop zones. Evacuees must immediately clear the building footprint by at least 1.5 times the structure height to avoid falling facade glass.',
          insightSource: 'NDMA Commercial Complex Evacuation',
          nextNodeId: 'frc-d5-emergency-call-coordination',
        },
        {
          id: 'frc-c4-linger-alley-record',
          label: 'Linger against the alley wall to record video of the billowing roof smoke on your phone.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Falling masonry fragments and flying glass slivers bounce off the pavement nearby, showering your clothes with debris as security personnel scream at you to clear the access route.',
          insight:
            'Lingering near the base of a burning structure for photos or social media blocks responding fire tenders and exposes you to deadly falling glass and thermal debris.',
          insightSource: 'NDMA Public Safety Warning',
          nextNodeId: 'frc-d5-emergency-call-coordination',
        },
      ],
    },

    // NODE 5: Emergency 112 / 101 Coordination
    'frc-d5-emergency-call-coordination': {
      id: 'frc-d5-emergency-call-coordination',
      type: 'decision',
      situationText:
        'In the safe open parking lot, you observe arriving fire brigade personnel connecting hoses to the municipal hydrants. A fire officer with a megaphone is asking if anyone knows the exact location of the fire origin.',
      contextHint: 'Provide precise tactical information to incident commanders.',
      choices: [
        {
          id: 'frc-c5-report-officer',
          label: 'Approach the Incident Command officer and state concisely: "3rd floor food court, north-east restaurant kitchen, exhaust duct fire, customers evacuated via Fire Exit B."',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'The officer relays the exact coordinates to the breathing-apparatus search team over wireless. Your concise report enables firefighters to deploy suppression lines straight to the 3rd-floor duct within three minutes.',
          insight:
            'Providing direct, concise tactical intelligence (floor, quadrant, fuel source, evacuation route status) to Incident Commanders significantly accelerates rescue and containment operations.',
          insightSource: 'NDMA & Fire Service Incident Command System',
          nextNodeId: 'frc-outcome-node',
        },
        {
          id: 'frc-c5-shout-unstructured',
          label: 'Shout vaguely that the entire building is burning down and tell people on social media not to come near the city.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Your emotional outburst causes unnecessary panic among gathered families in the parking lot and fails to give firefighters the critical kitchen duct location.',
          insight:
            'Unstructured panic reports distract first responders and propagate rumors. Clear factual reporting is the most vital civil contribution during an incident.',
          insightSource: 'NDMA Emergency Communication Principles',
          nextNodeId: 'frc-outcome-node',
        },
      ],
    },

    // OUTCOME NODE
    'frc-outcome-node': {
      id: 'frc-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You successfully evacuated the crowded commercial complex, avoided deadly escalator flue traps, kept the fire stairwell sealed, cleared the glass perimeter, and provided actionable intelligence to the incident commander. Fire brigade units successfully contained the grease fire to the 3rd-floor duct.',
      nextNodeId: '',
    },
  },
};
