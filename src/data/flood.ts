// src/data/flood.ts
// Low-Lying Urban Colony Flash Flood Disaster Scenario
// Grounded in verified public safety principles from NDMA India, Central Water Commission (CWC), and 112 ERSS.

import type { Scenario } from './types';

export const floodScenario: Scenario = {
  id: 'flood',
  title: 'Flash Flood Hazard',
  subtitle: 'Low-Lying Urban Colony — Monsoon Cloudburst',
  theme: 'flood',
  startNodeId: 'flood-d1-warning',
  nodes: {
    // NODE 1: Initial Inundation & Utility Isolation (Timed: 15s)
    'flood-d1-warning': {
      id: 'flood-d1-warning',
      type: 'decision',
      situationText:
        'A monsoon cloudburst triggers sudden urban flash flooding. Muddy storm runoff is rising at several inches per minute, lapping against your ground-floor porch. An emergency flash alert pings your phone advising immediate protective action.',
      contextHint: 'Water is beginning to seep beneath the front door into your living area.',
      timeLimit: 15,
      defaultChoiceId: 'flood-c1-wait-indoors',
      choices: [
        {
          id: 'flood-c1-isolate-utilities',
          label: 'Switch off the main electrical MCB breaker and LPG cylinder valve immediately, grab your essential emergency kit, and prepare to move.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You flip the main MCB breaker and isolate the LPG cylinder valve. Shutting off power and gas prevents life-threatening electrocution and secondary explosions as floodwaters enter the house.',
          insight:
            'Public emergency preparedness guidance recommends shutting off electrical mains and gas supplies before floodwater enters the premises to eliminate acute electrocution and fire hazards.',
          insightSource: 'NDMA Urban Flood Safety Advisory',
          nextNodeId: 'flood-d2-rising-water',
        },
        {
          id: 'flood-c1-wait-indoors',
          label: 'Attempt to roll up door rugs and pile towels at the entrance to keep the water from entering the living room.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'A rush of muddy floodwater bursts through the door seal, immediately soaking the towels. The water reaches calf-depth within minutes, submerging electrical floor sockets and creating an imminent shock hazard.',
          insight:
            'Never delay personal safety to block rapidly rising floodwater with towels or rugs. Rising urban runoff carries tremendous volume, and submerged electrical outlets create lethal shock zones.',
          insightSource: 'NDMA Flood Preparedness Guidelines',
          nextNodeId: 'flood-d2b-delayed-utility',
        },
      ],
    },

    // NODE 2A: Rising Water — Vertical Refuge vs. Outdoor Departure (Branch 1, Primary)
    'flood-d2-rising-water': {
      id: 'flood-d2-rising-water',
      type: 'decision',
      situationText:
        'The ground floor is covered in several inches of water. Outside, the street has transformed into a torrential muddy canal with swirling debris. Your two-storey house has an internal concrete staircase leading to upper rooms and a solid rooftop.',
      contextHint: 'The street outside has deep, moving water with obscured hazards.',
      choices: [
        {
          id: 'flood-c2-vertical-evac',
          label: 'Move valuables, clean drinking water, your mobile phone, and first-aid supplies upstairs to the first floor and rooftop.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You ascend upstairs with critical supplies. From the elevated first floor, you are completely out of reach of the rising ground-level water, retaining a secure vantage point.',
          insight:
            'In sudden flash floods where safe ground evacuation routes are submerged, seeking vertical refuge on upper floors or sturdy rooftops protects against strong street currents and open drain hazards.',
          insightSource: 'NDMA Flood Safety Protocol',
          nextNodeId: 'flood-d3-indoor-hazard',
        },
        {
          id: 'flood-c2-drive-car',
          label: 'Wade out to your sedan parked in the driveway and attempt to drive through the flooded street to reach higher ground.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'As you enter the vehicle and reverse into the street, the car quickly stalls in deep water. The force of the moving flow begins shifting the vehicle sideways toward a storm drain, forcing you to scramble out in panic.',
          insight:
            'Never attempt to drive through floodwater. Vehicles can quickly stall, lose tyre traction, and be swept away by moving currents. Submerged roads may also have collapsed under the surface.',
          insightSource: 'Public Flood Safety Advisory',
          nextNodeId: 'flood-d4-route-hazard',
        },
      ],
    },

    // NODE 2B: Rising Water — Delayed Utility Isolation (Branch 1, Secondary)
    'flood-d2b-delayed-utility': {
      id: 'flood-d2b-delayed-utility',
      type: 'decision',
      situationText:
        'Water is knee-deep in your ground-floor hallway. You hear buzzing from a submerged wall socket, and the main electrical panel is located across the flooded room.',
      contextHint: 'Standing in floodwater near live electrical sources carries severe electrocution risk.',
      choices: [
        {
          id: 'flood-c2b-avoid-live-water',
          label: 'Do not step into the electrified water; immediately retreat up the dry stairs to the upper floor and alert neighbours not to enter.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'You avoid entering the energized pool of water and take refuge upstairs. Moments later, the neighbourhood transformer trips, cutting power to the colony.',
          insight:
            'Never wade through standing water if live electrical wires or submerged outlets might be energized. Electrocution is one of the leading secondary causes of death during urban floods.',
          insightSource: 'NDMA Urban Flood Safety Guidelines',
          nextNodeId: 'flood-d3-indoor-hazard',
        },
        {
          id: 'flood-c2b-wade-to-breaker',
          label: 'Wade through the knee-deep water with bare feet to reach the electrical panel and flip the switch.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'As you step closer to the submerged extension cord, a painful electric shock numbs your legs. You barely manage to pull yourself onto the staircase railing before collapsing in shock.',
          insight:
            'Never approach or walk through water that may carry an active electrical charge. If the main breaker cannot be safely reached without contacting water, do not attempt to touch it.',
          insightSource: 'Public Electrical Safety Advisory',
          nextNodeId: 'flood-d3-indoor-hazard',
        },
      ],
    },

    // NODE 3: Indoor Hazards & Survival Essentials
    'flood-d3-indoor-hazard': {
      id: 'flood-d3-indoor-hazard',
      type: 'decision',
      situationText:
        'You are safely on the first floor, but tap water suddenly runs brownish and muddy from the faucets. Power is completely out across the area. You need to secure drinking water and sanitation for an uncertain duration.',
      contextHint: 'Floodwaters routinely contaminate municipal water distribution pipelines and domestic storage sumps.',
      choices: [
        {
          id: 'flood-c3-safe-drinking-water',
          label: 'Store your existing bottled water carefully, avoid drinking unboiled tap water, and keep emergency food supplies elevated.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'You conserve safe bottled drinking water and keep all perishables protected from contamination. You avoid waterborne illnesses that commonly surge during urban floods.',
          insight:
            'Floodwaters carry dangerous pathogens and pollutants that easily contaminate domestic water pipes and ground sumps. Only consume bottled, boiled, or properly disinfected water.',
          insightSource: 'NDMA Health & Sanitation Guidelines in Disasters',
          nextNodeId: 'flood-d4-route-hazard',
        },
        {
          id: 'flood-c3-drink-tap-water',
          label: 'Fill buckets and drink from the municipal tap since the water pressure is still running.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'The tap water smells foul and contains suspended silt. Ingesting contaminated flood runoff puts you at immediate risk of severe gastrointestinal infection and dehydration.',
          insight:
            'Never drink municipal or ground sump tap water during or immediately after a flood unless it has been thoroughly boiled or officially certified as safe.',
          insightSource: 'Public Health Disaster Advisory',
          nextNodeId: 'flood-d4-route-hazard',
        },
      ],
    },

    // NODE 4: Route Hazard — External Evacuation vs. Remaining Put (Branch 2, Timed: 15s)
    'flood-d4-route-hazard': {
      id: 'flood-d4-route-hazard',
      type: 'decision',
      situationText:
        'Looking out from the balcony, you see a neighbour shouting that a relief truck is parked on the high road four blocks away. Between your house and the road is an intersection with chest-deep, fast-moving muddy runoff and submerged open drains.',
      contextHint: 'Moving floodwater conceals missing manhole covers, live downed wires, and strong undertows.',
      timeLimit: 15,
      defaultChoiceId: 'flood-c4-rush-relief-truck',
      choices: [
        {
          id: 'flood-c4-remain-elevated',
          label: 'Stay in your secure elevated location upstairs; do not attempt to cross the chest-deep current on foot without emergency rescue equipment.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You remain on your sturdy upper balcony. A few minutes later, you watch a wooden pole and sharp sheet metal drift rapidly through the intersection, demonstrating how hazardous crossing would have been.',
          insight:
            'Do not attempt to walk or swim through fast-flowing floodwater. Hidden debris, swept-away obstacles, missing manhole covers, and powerful hydrodynamic drag make wading extremely hazardous.',
          insightSource: 'NDMA Flood Evacuation Guidance',
          nextNodeId: 'flood-d5-emergency-comm',
        },
        {
          id: 'flood-c4-rush-relief-truck',
          label: 'Step down into the street and try to push through the chest-deep water to reach the relief truck.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'The fierce current immediately knocks you against a concrete pillar. Submerged debris bruises your shins, and you are nearly pulled toward an open stormwater drain before scrambling back to your gate.',
          insight:
            'Walking in deep, fast-moving floodwater is a leading cause of urban flood casualties. Hidden open drains and rapid currents can sweep away even strong adults within seconds.',
          insightSource: 'Central Water Commission (CWC) Flood Safety Guidance',
          nextNodeId: 'flood-d6-stranded-rooftop',
        },
      ],
    },

    // NODE 5: Emergency Communication & Coordination (From remaining elevated)
    'flood-d5-emergency-comm': {
      id: 'flood-d5-emergency-comm',
      type: 'decision',
      situationText:
        'Your phone battery is at 42%. Mobile network signals are intermittent. You need to alert emergency authorities of your location and find out the local flood forecast.',
      contextHint: 'Conserving phone battery and sending concise text data is critical during power outages.',
      choices: [
        {
          id: 'flood-c5-conserve-battery-sms',
          label: 'Switch phone to battery-saver mode, send your exact address and coordinates via SMS to family and 112 ERSS, and monitor official weather bulletins.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Your SMS reaches the 112 ERSS emergency log and your family with exact coordinates. By conserving your battery, your phone remains operational throughout the night.',
          insight:
            'During prolonged power outages in disasters, conserve mobile battery power. Send concise SMS messages or emergency SOS location beacons instead of making battery-draining video calls.',
          insightSource: '112 ERSS Emergency Communication Guidelines',
          nextNodeId: 'flood-d7-rescue-signaling',
        },
        {
          id: 'flood-c5-stream-social-media',
          label: 'Continuously stream live video on social media and keep screen brightness on full to show the street flooding.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Live streaming exhausts your battery to 4% within forty minutes. When a rescue boat passes nearby later, your phone is completely dead and you cannot transmit your location.',
          insight:
            'Never drain crucial battery reserves on non-essential multimedia streaming during an active emergency. Keep communication channels open for life-saving rescue coordination.',
          insightSource: 'NDMA Disaster Communication Advisory',
          nextNodeId: 'flood-d7-rescue-signaling',
        },
      ],
    },

    // NODE 6: Stranded Situation — Rooftop Exposure (From risky street attempt)
    'flood-d6-stranded-rooftop': {
      id: 'flood-d6-stranded-rooftop',
      type: 'decision',
      situationText:
        'Having retreated from the violent street current, you are soaked, shivering, and trapped on the rooftop as rain continues to pour heavily. Night is approaching.',
      contextHint: 'Hypothermia and exposure are significant risks during extended monsoon rain.',
      choices: [
        {
          id: 'flood-c6-seek-dry-cover',
          label: 'Move under the rooftop stairwell canopy, wring out soaked clothing, and wrap yourself in dry curtains or plastic sheeting to conserve body heat.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'You find shelter under the concrete overhead tank canopy and insulate yourself from the driving wind and rain, stabilizing your core body temperature.',
          insight:
            'Prolonged exposure to rain and wet clothes can cause hypothermia even in tropical climates. Always seek overhead cover and protect against wind chill while awaiting rescue.',
          insightSource: 'Public Emergency Health Advisory',
          nextNodeId: 'flood-d7-rescue-signaling',
        },
        {
          id: 'flood-c6-stay-in-open-rain',
          label: 'Stand in the open rain at the edge of the terrace waving your arms continuously in hopes someone sees you from far away.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Standing in the cold driving monsoon downpour brings on uncontrollable shivering and exhaustion, reducing your ability to alert rescuers when they actually approach.',
          insight:
            'Do not remain exposed to heavy rain unnecessarily. Conserve physical energy and stay shielded from the weather until rescue craft or search teams are within visual or audible range.',
          insightSource: 'Emergency Preparedness Standard',
          nextNodeId: 'flood-d7-rescue-signaling',
        },
      ],
    },

    // NODE 7: Final Rescue & Evacuation Protocol
    'flood-d7-rescue-signaling': {
      id: 'flood-d7-rescue-signaling',
      type: 'decision',
      situationText:
        'The sound of an outboard motor echoes through the colony. A National Disaster Response Force (NDRF) inflatable rescue boat navigates into your street, scanning the buildings with searchlights.',
      contextHint: 'Rescuers need clear, unmistakable visual signals and disciplined boarding compliance.',
      choices: [
        {
          id: 'flood-c7-signal-and-board-calmly',
          label: 'Wave a bright cloth and shine a flashlight at the boat, call out calmly, and follow the NDRF rescue crew\'s specific boarding instructions without pushing.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'The NDRF boat crew spots your distinct signal immediately. They bring the boat alongside your balcony, help you put on a personal flotation life jacket, and transfer you safely on board.',
          insight:
            'Use bright cloths, whistles, or flashlights to signal search-and-rescue teams. When boarding rescue boats, follow crew instructions strictly and maintain boat balance.',
          insightSource: 'NDRF Water Rescue & Evacuation Protocol',
          nextNodeId: 'flood-outcome-node',
        },
        {
          id: 'flood-c7-jump-into-boat',
          label: 'Leap directly from the first-floor railing toward the rescue boat as soon as it nears your house to ensure you get a seat.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'Your sudden leap nearly capsizes the inflatable boat. You land heavily on another evacuee, injuring your ankle and causing panic among the occupants before the crew secures the craft.',
          insight:
            'Never jump into or rush a rescue craft. Inflatable boats can easily capsize or tear under sudden impact, endangering everyone on board. Always wait for rescuer instructions.',
          insightSource: 'NDRF Water Rescue Safety Guidelines',
          nextNodeId: 'flood-outcome-node',
        },
      ],
    },

    // FINAL OUTCOME NODE
    'flood-outcome-node': {
      id: 'flood-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You have been safely evacuated from the inundated colony by NDRF rescue personnel. Your proactive decision to isolate electrical and gas utilities, seek elevated refuge, avoid moving flood currents, and cooperate with rescue teams preserved life safety.',
      nextNodeId: 'flood-report-node',
    },
  },
};