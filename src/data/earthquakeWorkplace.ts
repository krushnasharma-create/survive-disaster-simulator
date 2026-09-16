// src/data/earthquakeWorkplace.ts
// Workplace / Commercial Office Daytime Earthquake Scenario
// Grounded in public safety principles from NDMA India, SACHET Portal, and 112 ERSS.

import type { Scenario } from './types';

export const earthquakeWorkplaceScenario: Scenario = {
  id: 'earthquake-workplace',
  disasterType: 'earthquake',
  category: 'modern',
  title: 'Commercial Workplace Earthquake',
  subtitle: '7th Floor Tech Park Office · 03:22 PM',
  theme: 'earthquake',
  startNodeId: 'eqw-d1-tremor',
  nodes: {
    // NODE 1: Initial Seismic Shockwave in Open-Plan Office (Timed: 15s)
    'eqw-d1-tremor': {
      id: 'eqw-d1-tremor',
      type: 'decision',
      situationText:
        '03:22 PM. You are working in a 7th-floor open-plan office when the floor violently heaves. False ceiling panels buckle and crash down, computer monitors topple off desks, and large peripheral glass facade windows flex with terrifying groans.',
      contextHint: 'Heavy overhead fixtures and perimeter glass are collapsing around your workstation.',
      timeLimit: 15,
      defaultChoiceId: 'eqw-c1-balcony-window',
      environmentEvents: [
        { triggerAtSeconds: 5, effectType: 'crack', intensity: 'medium' },
      ],
      choices: [
        {
          id: 'eqw-c1-drop-desk',
          label: 'Drop immediately under your heavy office work desk, cover your neck with your hands, and grip the steel frame firmly.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You dive under the heavy steel-framed desk. Moments later, two overhead fluorescent light fixtures and metal ceiling grid slats crash onto the desk surface, deflecting away safely. You remain covered until the shaking ceases.',
          insight:
            'NDMA Drop, Cover, and Hold On guidance emphasizes immediate sheltering under heavy furniture in modern high-rise offices to protect against falling light fixtures, false ceilings, and ductwork.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
          nextNodeId: 'eqw-d2-corridor-debris',
        },
        {
          id: 'eqw-c1-rush-elevator',
          label: 'Sprint across the open floor toward the central elevator lobby before the building power cuts out.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Violent floor accelerations throw you sideways into a row of metal filing cabinets. A falling ceiling panel strikes your shoulder, bruising your collarbone, while the elevators chime out with automated emergency brake lockouts.',
          insight:
            'Attempting to run or use elevators during an earthquake exposes you to severe falling debris hazards. Moving elevators often become death traps due to counterweight derailment and grid failures.',
          insightSource: 'NDMA High-Rise Evacuation Protocols',
          nextNodeId: 'eqw-d2b-injured-escape',
        },
        {
          id: 'eqw-c1-balcony-window',
          label: 'Move toward the outer glass facade wall to peer outside and check the severity of street damage.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Structural racking forces shatter a large pane of the exterior curtain wall. Spraying tempered glass fragments slice your hands and jacket as you are forced to retreat in panic.',
          insight:
            'Exterior glass curtain walls flex and shatter under seismic shear forces. NDMA advisories explicitly warn against standing near windows or exterior glass facades during tremors.',
          insightSource: 'NDMA High-Rise Earthquake Advisory',
          nextNodeId: 'eqw-d2b-injured-escape',
        },
      ],
    },

    // NODE 2A: Office Corridor Navigation (Primary Path from clean shelter)
    'eqw-d2-corridor-debris': {
      id: 'eqw-d2-corridor-debris',
      type: 'decision',
      situationText:
        'The primary tremor stops. The floor is carpeted with plaster dust, sheared cables, and smashed monitors. Colleague voices echo through the haze. Emergency battery lighting flickers on. The main office exit door is partially jammed by a tilted bookcase.',
      contextHint: 'Clear the exit safely and check for active power lines before leading coworkers out.',
      choices: [
        {
          id: 'eqw-c2-team-clear-exit',
          label: 'Call two nearby colleagues, shift the bookcase together, and inspect exposed ceiling cables before stepping into the main stairwell corridor.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Working together, you safely push the bookcase aside without causing further collapse. You spot a live severed electrical conduit sparking on the floor and guide everyone around it into the fire stairwell vestibule.',
          insight:
            'Organized teamwork and scanning for dangling electrical conduits prevents secondary electrocution injuries following seismic disruptions in commercial buildings.',
          insightSource: 'NDMA Workplace Emergency Protocols',
          nextNodeId: 'eqw-d3-staircase-choice',
        },
        {
          id: 'eqw-c2-force-door-alone',
          label: 'Ram the jammed door alone with your shoulder to force it open immediately.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Your shoulder impact dislodges a heavy metal cable tray hanging from the fractured ceiling, which swings down and grazes your back, slowing down the exit for everyone.',
          insight:
            'Hastily forcing jammed structures without assessing overhead anchor points risks triggering secondary debris falls in damaged commercial buildings.',
          insightSource: 'NDMA Workplace Safety Protocols',
          nextNodeId: 'eqw-d3-staircase-choice',
        },
      ],
    },

    // NODE 2B: Injured Evacuation (Branch Path from early mistake)
    'eqw-d2b-injured-escape': {
      id: 'eqw-d2b-injured-escape',
      type: 'decision',
      situationText:
        'Nursing your injured shoulder in the dusty haze, you find the office exit partially obstructed. Panic is spreading among coworkers, and someone is shouting that the elevators are dead. Smoke from shorted wiring begins drifting from the server room.',
      contextHint: 'Triage panic, locate a first-aid kit or grab emergency floor wardens.',
      choices: [
        {
          id: 'eqw-c2b-rally-warden',
          label: 'Locate the office floor emergency warden kit, wrap your shoulder with a sling, and direct coworkers to move calmly toward Fire Exit B.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Your calm direction suppresses the panic. Coworkers fall into an orderly line behind the designated floor warden, avoiding the smoking server room and entering the reinforced fire stairwell.',
          insight:
            'Designated emergency floor warden kits and calm, assertive communication prevent deadly stampedes in high-occupancy corporate facilities.',
          insightSource: 'NDMA Commercial Building Evacuation',
          nextNodeId: 'eqw-d3-staircase-choice',
        },
        {
          id: 'eqw-c2b-blind-rush',
          label: 'Shout for everyone to run and push your way through the bottlenecked office doorway.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Your shouting causes a surge toward the door. Two coworkers stumble over fallen cables in the doorway, creating a dangerous crush that traps people in the accumulating smoke.',
          insight:
            'Shouting and rushing creates bottlenecks at exits. Orderly evacuation maintains consistent throughput and protects vulnerable occupants.',
          insightSource: 'NDMA Emergency Crowd Safety Principles',
          nextNodeId: 'eqw-d3-staircase-choice',
        },
      ],
    },

    // NODE 3: Stairwell Descent & Aftershock Hazard (Timed: 15s)
    'eqw-d3-staircase-choice': {
      id: 'eqw-d3-staircase-choice',
      type: 'decision',
      situationText:
        'You enter Fire Staircase B and begin descending from the 7th floor. At the 4th-floor landing, a sharp Magnitude 5.2 aftershock hits. The concrete stairwell rumbles violently, and dust cascades down the central stairwell shaft.',
      contextHint: 'The staircase is vibrating heavily during an active aftershock.',
      timeLimit: 15,
      defaultChoiceId: 'eqw-c3-continue-sprinting',
      choices: [
        {
          id: 'eqw-c3-crouch-landing',
          label: 'Halt immediately, crouch low against the reinforced interior concrete wall on the landing, protect your head, and wait until the tremor stops.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Crouching low on the landing keeps you from falling down the steps. Dislodged concrete spalls fall harmlessly down the center opening. When the vibration ceases, you resume descending steadily.',
          insight:
            'Running down stairs during an active tremor frequently causes catastrophic falls. NDMA guidance instructs evacuees caught on stairwells to crouch against interior structural walls until shaking ceases.',
          insightSource: 'NDMA Stairway Safety Protocol',
          nextNodeId: 'eqw-d4-lobby-hazard',
        },
        {
          id: 'eqw-c3-continue-sprinting',
          label: 'Speed up and leap down the remaining flights to get out before the stairwell collapses.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'The sudden tremor lurches the steps beneath your feet. You slip on loose concrete grit, twisting your ankle and tumbling down four steps onto the lower landing.',
          insight:
            'Moving rapidly on vibrating stairs almost inevitably results in severe falls and fractures, compounding emergency response challenges.',
          insightSource: 'NDMA Stairway Safety Protocol',
          nextNodeId: 'eqw-d4-lobby-hazard',
        },
      ],
    },

    // NODE 4: Ground Lobby Hazard Navigation (Primary)
    'eqw-d4-lobby-hazard': {
      id: 'eqw-d4-lobby-hazard',
      type: 'decision',
      situationText:
        'You emerge into the ground-floor corporate atrium. The expansive glass skylight high above has partially fractured. Outside the glass revolving doors, decorative stone cladding from the 3rd-floor exterior facade is crashing onto the main driveway.',
      contextHint: 'Falling exterior cladding and revolving doors pose severe exit hazards.',
      choices: [
        {
          id: 'eqw-c4-side-canopy-exit',
          label: 'Bypass the glass revolving door, use the reinforced side emergency push-bar exit, and cover your head with a hard briefcase while sprinting clear of the building perimeter.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'The emergency push-bar opens smoothly. Using your briefcase as a shield against falling architectural fragments, you cross the 50-meter perimeter collapse zone swiftly to the open lawn.',
          insight:
            'Revolving doors frequently bind under structural warping. NDMA recommends using standard hinged emergency exits and moving well clear of exterior facades where falling masonry and glass are most lethal.',
          insightSource: 'NDMA High-Rise Evacuation Guidelines',
          nextNodeId: 'eqw-d5-assembly-communication',
        },
        {
          id: 'eqw-c4-atrium-wait',
          label: 'Wait inside the spacious glass atrium until security guards announce that the exterior driveway is safe.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'While you wait, another minor aftershock shakes loose two heavy panes from the fractured overhead skylight, showering the atrium floor with dangerous glass shards.',
          insight:
            'Glass-covered atriums are hazardous post-earthquake zones due to fractured overhead glazing. Continuous evacuation to open ground is essential.',
          insightSource: 'NDMA Building Safety Advisory',
          nextNodeId: 'eqw-d5-assembly-communication',
        },
      ],
    },

    // NODE 5: Open Assembly Ground & Communication
    'eqw-d5-assembly-communication': {
      id: 'eqw-d5-assembly-communication',
      type: 'decision',
      situationText:
        'You reach the designated open assembly ground in the office park center, 100 meters away from all tower facades. Hundreds of employees are gathering. Mobile networks are jammed as everyone attempts voice calls simultaneously.',
      contextHint: 'Communicate safety status without contributing to cellular voice network collapse.',
      choices: [
        {
          id: 'eqw-c5-sms-checkin',
          label: 'Send brief SMS / text messages to family confirming your safety, check in with the corporate floor safety marshal, and keep voice lines open for 112 emergency services.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Your SMS transmits immediately despite cellular congestion. You complete the roll-call with the safety marshal, confirming everyone from your team is accounted for safely.',
          insight:
            'During major disasters, voice networks overload instantly. NDMA and 112 ERSS advise using short text messages to notify loved ones, leaving cellular channels clear for life-critical emergency dispatches.',
          insightSource: '112 ERSS Emergency Communication Standard',
          nextNodeId: 'eqw-outcome-node',
        },
        {
          id: 'eqw-c5-repeated-calls',
          label: 'Continuously hit redial on voice calls and live-stream the building damage on social media.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Repeated voice attempts drain your battery to 12% without connecting, tying up cellular bandwidth while you fail to check in with the safety marshal.',
          insight:
            'Repeated redialing congests emergency networks and rapidly exhausts battery power needed for subsequent emergency updates.',
          insightSource: 'NDMA Telecommunication Advisory',
          nextNodeId: 'eqw-outcome-node',
        },
      ],
    },

    // OUTCOME NODE
    'eqw-outcome-node': {
      id: 'eqw-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You successfully navigated the 7th-floor office earthquake, avoided elevator traps, weathered the stairwell aftershock, cleared the facade collapse perimeter, and accounted for your team on the assembly ground. NDRF structural triage teams and 112 medical units have secured the tech park.',
      nextNodeId: '',
    },
  },
};
