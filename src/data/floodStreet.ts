// src/data/floodStreet.ts
// Monsoon Transit & Street Flash Flood Scenario
// Grounded in public safety principles from NDMA India, Central Water Commission (CWC), and 112 ERSS.

import type { Scenario } from './types';

export const floodStreetScenario: Scenario = {
  id: 'flood-street',
  disasterType: 'flood',
  category: 'modern',
  title: 'Urban Street & Transit Flood',
  subtitle: 'Arterial Ring Road Underpass · 07:15 PM',
  theme: 'flood',
  startNodeId: 'fls-d1-submerged-underpass',
  nodes: {
    // NODE 1: Commute Decision at Flooded Underpass (Timed: 15s)
    'fls-d1-submerged-underpass': {
      id: 'fls-d1-submerged-underpass',
      type: 'decision',
      situationText:
        '07:15 PM. You are driving home during a relentless monsoon cloudburst. Ahead, the low-lying railway underpass is submerged beneath opaque brown stormwater. Two stalled hatchbacks are already half-floating in the dip. Vehicles behind you are honking aggressively for you to push through.',
      contextHint: 'Submerged underpass depth is completely obscured. Vehicles ahead are losing traction.',
      timeLimit: 15,
      defaultChoiceId: 'fls-c1-drive-through',
      environmentEvents: [
        { triggerAtSeconds: 5, effectType: 'water_rise', intensity: 'medium' },
      ],
      choices: [
        {
          id: 'fls-c1-turn-around',
          label: 'Refuse to enter the underpass. Put on hazard flashers, turn around onto the elevated service flyover ramp, and seek higher ground.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You turn your vehicle safely onto the elevated bypass ramp. Within ten minutes, runoff from the storm drains inundates the underpass completely, submerging the stalled cars up to their rooflines.',
          insight:
            'NDMA "Turn Around, Don\'t Drown" guidance explicitly warns that over half of all flood-related fatalities occur in vehicles. As little as 30 to 60 cm of moving water can float a passenger vehicle.',
          insightSource: 'NDMA Urban Flood Safety Advisory',
          nextNodeId: 'fls-d2-abandoned-vehicle-safety',
        },
        {
          id: 'fls-c1-drive-through',
          label: 'Accelerate through the middle of the dip in low gear to push a bow-wave and make it across.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'Water surges into the engine air intake within twenty meters. The engine stalls violently, electronics short-circuit, and buoyant hydraulic forces lift your tires off the asphalt, leaving you stranded and adrift.',
          insight:
            'Driving through floodwaters inevitably sucks water into the air intake, causing catastrophic engine hydro-lock. Rising floodwater creates buoyant lift that eliminates steering and braking.',
          insightSource: 'NDMA Flood Guidelines & Traffic Advisory',
          nextNodeId: 'fls-d2b-stranded-vehicle-triage',
        },
        {
          id: 'fls-c1-park-underpass-edge',
          label: 'Pull over to the curb right before the water line and wait inside your idling car for the rain to ease.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Storm runoff rapidly expands back along the roadway. Water levels rise around your tires, submerging your tailpipe and exhaust within minutes.',
          insight:
            'Parking near the edge of rapidly rising runoff leaves you vulnerable to backwater surges. Always actively move to elevated terrain.',
          insightSource: 'NDMA Flood Preparedness Guidelines',
          nextNodeId: 'fls-d2b-stranded-vehicle-triage',
        },
      ],
    },

    // NODE 2A: Elevated Service Flyover (Primary Path from clean turn)
    'fls-d2-abandoned-vehicle-safety': {
      id: 'fls-d2-abandoned-vehicle-safety',
      type: 'decision',
      situationText:
        'You reach the elevated service flyover, safely above the inundated underpass. However, a police wireless alert broadcasts that an upstream municipal drainage canal has breached, and arterial road traffic is completely gridlocked. Rain continues falling at 40 mm per hour.',
      contextHint: 'Elevated ground safety: Secure your vehicle without blocking emergency tenders.',
      choices: [
        {
          id: 'fls-c2-park-multilevel-walk',
          label: 'Pull off the road into an elevated multi-level public car parking structure, park on the 2nd level, and walk into an adjacent commercial building for shelter.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Your vehicle is safely stored above potential ground-surge levels, leaving the flyover carriageway completely clear for responding NDRF and police emergency vehicles.',
          insight:
            'Parking elevated off main transit arteries protects private property while preventing vehicle gridlocks that delay heavy disaster rescue vehicles.',
          insightSource: 'NDMA Urban Flood Management',
          nextNodeId: 'fls-d3-downed-power-hazard',
        },
        {
          id: 'fls-c2-stay-in-gridlock',
          label: 'Keep your car idling in the center lane of the flyover gridlock with the air conditioning running.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Two hours in dead stationary gridlock exhausts your fuel tank, and an arriving emergency ambulance is forced to squeeze onto the narrow shoulder to bypass the jam.',
          insight:
            'Prolonged idling in gridlock wastes fuel and blocks emergency corridors. Securing vehicles in designated off-road elevated spaces is the optimal civil protocol.',
          insightSource: 'Traffic Police & NDMA Disaster Protocol',
          nextNodeId: 'fls-d3-downed-power-hazard',
        },
      ],
    },

    // NODE 2B: Stranded Vehicle Escape (Branch Path from early mistake)
    'fls-d2b-stranded-vehicle-triage': {
      id: 'fls-d2b-stranded-vehicle-triage',
      type: 'decision',
      situationText:
        'Your stalled car is floating in cold, muddy water reaching halfway up the door panels. Electrical power is dead, and external water pressure is holding the driver door firmly shut against the frame.',
      contextHint: 'Differential hydraulic pressure: Doors cannot open until internal and external pressure equalizes, or exit via window.',
      choices: [
        {
          id: 'fls-c2b-roll-window-escape',
          label: 'Unbuckle seatbelt immediately, open or roll down the window (or break a side window using an emergency tool), exit to the car roof, and signal for rescue.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'You escape through the side window and climb onto the car roof. From this elevated position, you remain above the floodwaters until nearby civil defense volunteers assist you to safety.',
          insight:
            'When a vehicle is surrounded by water, water pressure against the outside makes doors nearly impossible to open until pressure equalizes. Escaping immediately through a window before water reaches the roof is the safest evacuation route.',
          insightSource: 'NDMA Vehicle Flood Safety Guidelines',
          nextNodeId: 'fls-d3-downed-power-hazard',
        },
        {
          id: 'fls-c2b-push-door-hard',
          label: 'Stay strapped in your seat and throw your entire body weight against the door to force it open.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'External water pressure keeps the door pressed shut. Precious seconds are lost as muddy water seeps through the door seals and into the footwells.',
          insight:
            'You cannot overcome water pressure against a submerged car door. Wasting energy on the door traps occupants inside as the vehicle cabin fills with water.',
          insightSource: 'NDMA Vehicle Flood Safety Guidelines',
          nextNodeId: 'fls-d3-downed-power-hazard',
        },
      ],
    },

    // NODE 3: Downed Power Lines & Open Manhole Crossing (Timed: 15s)
    'fls-d3-downed-power-hazard': {
      id: 'fls-d3-downed-power-hazard',
      type: 'decision',
      situationText:
        'You are moving on foot toward a high-ground shelter complex. A 30-meter flooded street crossing lies ahead. Knee-deep muddy water obscures the road surface. On the opposite pavement, a severed utility pole cable is dangling into the water, with intermittent white sparks.',
      contextHint: 'Water conducts electricity; submerged floodwaters conceal missing manhole covers.',
      timeLimit: 15,
      defaultChoiceId: 'fls-c3-wade-fast',
      choices: [
        {
          id: 'fls-c3-halt-detour-high',
          label: 'Do not enter the water. Turn back immediately, take the longer elevated concrete pedestrian bridge, and warn other pedestrians to stay back.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You halt two approaching commuters and lead them up the concrete pedestrian overpass. Moments later, an electrical surge causes the submerged transformer nearby to hum loudly, proving the water was energized.',
          insight:
            'Never step into floodwaters near dangling power lines or electrical poles. Electrical current travels through flooded streets, creating invisible lethal shock hazard zones.',
          insightSource: 'NDMA Electrical Hazard Protocol in Floods',
          nextNodeId: 'fls-d4-water-probe-shelter',
        },
        {
          id: 'fls-c3-wade-fast',
          label: 'Wade across rapidly hugging the opposite side of the street away from where the sparks are visible.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'As you step into the knee-deep water, you feel a sharp electric tingling sensation up your legs. You leap backwards onto the dry curb just before full muscle lockup occurs.',
          insight:
            'Energized floodwaters carry voltage gradients over wide radii. Any tingling in water indicates active electrocution risk requiring immediate withdrawal.',
          insightSource: 'NDMA Electrical Safety Advisory',
          nextNodeId: 'fls-d4-water-probe-shelter',
        },
      ],
    },

    // NODE 4: Flooded Footpath & Open Drainage Hazards
    'fls-d4-water-probe-shelter': {
      id: 'fls-d4-water-probe-shelter',
      type: 'decision',
      situationText:
        'You descend the pedestrian overpass near the shelter entrance. A 10-meter stretch of calf-deep, murky runoff crosses the apron. In urban floods, water pressure frequently pops open heavy municipal stormwater manhole covers, creating invisible underwater suction vortexes.',
      contextHint: 'Murky floodwater conceals lethal open manholes and missing drain grates.',
      choices: [
        {
          id: 'fls-c4-probe-stick',
          label: 'Pick up a sturdy wooden bamboo pole from nearby road construction to firmly probe each footstep before placing weight, moving along the masonry compound wall.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Probing ahead with the pole, you suddenly feel the stick plunge 4 feet into an open, missing-cover drain grate. You step wide around the vortex safely and reach the dry building steps.',
          insight:
            'NDMA pedestrian safety guidance mandates probing floodwaters with a stick or pole to detect displaced stormwater manholes, uncovered drains, and washed-out pavement.',
          insightSource: 'NDMA Urban Flood Safety Protocol',
          nextNodeId: 'fls-d5-shelter-hygiene',
        },
        {
          id: 'fls-c4-walk-blindly',
          label: 'Walk forward normally through the water looking straight ahead at the open shelter doors.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Your right leg drops into an uncovered stormwater gutter. You scrape your shin deeply and narrowly avoid being pulled in by the suction before pulling yourself out.',
          insight:
            'Walking blindly in opaque urban floodwaters without testing the depth with a probe frequently causes severe plunge injuries and drownings in open sewers.',
          insightSource: 'NDMA Monsoon Safety Advisory',
          nextNodeId: 'fls-d5-shelter-hygiene',
        },
      ],
    },

    // NODE 5: Shelter Entry & Public Health Hygiene
    'fls-d5-shelter-hygiene': {
      id: 'fls-d5-shelter-hygiene',
      type: 'decision',
      situationText:
        'You enter the dry 2nd-floor community flood relief center. You are drenched in muddy storm runoff, and your legs have small cuts from road debris. A relief volunteer is distributing dry blankets, bottled water, and first-aid kits.',
      contextHint: 'Prevent water-borne bacterial infections and water contamination.',
      choices: [
        {
          id: 'fls-c5-sanitize-drink-bottled',
          label: 'Wash and sanitize skin scrapes with clean bottled water and antiseptic, dispose of soaked socks, and drink only verified packaged drinking water.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Disinfecting your abrasions prevents severe leptospirosis and bacterial infections prevalent in urban sewage-mixed runoff. You register your presence with the relief coordinator.',
          insight:
            'Floodwaters contain high concentrations of untreated sewage and bacteria. Cleaning cuts immediately with antiseptic and consuming only boiled or sealed bottled water prevents acute water-borne illnesses.',
          insightSource: 'NDMA Public Health & Epidemic Prevention',
          nextNodeId: 'fls-outcome-node',
        },
        {
          id: 'fls-c5-drink-tap-neglect',
          label: 'Drink straight from the bathroom tap and leave your soaked shoes and muddy clothes on while sleeping.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'The building municipal pipeline has suffered flood backflow contamination. Neglecting wound care leads to an inflamed skin infection by morning.',
          insight:
            'Municipal water systems are frequently contaminated during floods. Never drink unboiled tap water or ignore open cuts exposed to flood runoff.',
          insightSource: 'NDMA Health Advisory for Flood Disasters',
          nextNodeId: 'fls-outcome-node',
        },
      ],
    },

    // OUTCOME NODE
    'fls-outcome-node': {
      id: 'fls-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You successfully navigated the urban transit flash flood: avoided the death-trap submerged underpass, navigated around downed electrical hazards, probed for missing manhole grates, and reached elevated community relief safely. Local authorities and NDRF rescue boats have secured the flooded arterial corridor.',
      nextNodeId: '',
    },
  },
};
