// src/data/historicalBhuj.ts
// 2001 Gujarat (Bhuj) Earthquake — Historical Simulation Scenario
// Grounded in verified documentation from NDMA India, IMD, NIDM, GSDMA, and EERI.

import type { Scenario } from './types';

export const historicalBhujScenario: Scenario = {
  id: 'earthquake-bhuj-2001',
  disasterType: 'earthquake',
  category: 'historical',
  title: 'Bhuj 2001 Seismic Emergency',
  subtitle: 'Kutch District, Gujarat · 26 January 2001 · 08:46 AM',
  theme: 'earthquake',
  startNodeId: 'bhj-d1-morning-shock',
  historicalMeta: {
    eventTitle: '2001 Gujarat (Bhuj) Earthquake',
    date: '26 January 2001',
    location: 'Kutch District, Gujarat, India',
    historicalContext:
      'On the morning of Republic Day 2001 at ~08:46 AM, a catastrophic intraplate earthquake (recorded at Magnitude 6.9 Richter by IMD / Mw 7.7 by USGS) struck the Kutch region of Gujarat. Towns including Bhuj, Bhachau, and Anjar suffered extensive destruction, with unreinforced masonry structures collapsing across the region. This national tragedy served as the primary catalyst for modernizing India\'s institutional disaster response architecture, leading to the creation of the GSDMA and the National Disaster Management Authority (NDMA).',
    disclaimer:
      'EDUCATIONAL RECONSTRUCTION: This simulation combines documented historical context with a fictionalized civilian perspective. The character, building layout, dialogue, and decision sequence are educational gameplay constructs and do not depict a specific historical individual.',
  },
  nodes: {
    // NODE 1: Initial Seismic Shockwave in Masonry Home (Timed: 15s)
    'bhj-d1-morning-shock': {
      id: 'bhj-d1-morning-shock',
      type: 'decision',
      situationText:
        '26 January 2001 · 08:46 AM. You are on the ground floor of a traditional two-storey stone-and-brick masonry building on the edge of Bhuj. Republic Day radio broadcasts are playing when the ground heaves violently. Walls crack diagonally with loud fractures, lime plaster showers down, and heavy clay roof tiles begin dislodging overhead.',
      contextHint: 'Unreinforced stone masonry walls are fracturing under intense lateral shear forces.',
      timeLimit: 15,
      defaultChoiceId: 'bhj-c1-bolt-outside',
      environmentEvents: [
        { triggerAtSeconds: 5, effectType: 'crack', intensity: 'high' },
        { triggerAtSeconds: 10, effectType: 'vibration', intensity: 'high' },
      ],
      choices: [
        {
          id: 'bhj-c1-table-shelter',
          label: 'Drop immediately under a heavy solid-wood dining table, clasp your hands firmly over the back of your neck, and hold onto the table legs.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You dive under the heavy wooden table just as ceiling plaster, broken masonry chunks, and wooden rafters crash onto the tabletop. The solid wood deflects the falling debris, protecting your skull and spine while the violent ground acceleration continues for nearly ninety seconds.',
          insight:
            'NDMA Drop, Cover, and Hold On protocols emphasize taking immediate cover under sturdy furniture. During severe shaking, unreinforced masonry walls and heavy roofs shed lethal debris inward and outward; attempting to run across shaking floors causes falls and direct impact injuries.',
          insightSource: 'NDMA Earthquake Safety Guidelines & EERI 2001 Report',
          nextNodeId: 'bhj-d2-masonry-triage',
        },
        {
          id: 'bhj-c1-bolt-outside',
          label: 'Sprint toward the front door to escape into the narrow village lane before the walls collapse.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Violent ground shaking tosses you to your knees in the doorway threshold. Moments later, a decorative brick parapet and stone sunshade from the floor above sheer off, crashing onto the stone steps inches away and showering your head and shoulders with razor-sharp masonry shards.',
          insight:
            'Running outside during active earthquake shaking is one of the leading causes of trauma in masonry-dense settlements. Falling parapets, sunshades, and roof tiles create deadly "drop zones" along exterior building perimeters.',
          insightSource: 'NDMA Earthquake Safety Protocol',
          nextNodeId: 'bhj-d2b-injured-evacuation',
        },
        {
          id: 'bhj-c1-stand-doorframe',
          label: 'Stand upright inside an interior doorway arch without holding on, waiting for the tremor to subside.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'The door frame twists as unreinforced load-bearing walls shift out of plumb. The swinging wooden door slams violently against your arm, and falling plaster from the lintel strikes your unprotected head.',
          insight:
            'Modern engineering assessments have debunked doorways as universal earthquake shelters. In non-engineered masonry buildings, unreinforced door lintels frequently crack and fail under seismic distortion.',
          insightSource: 'NDMA & NIDM Structural Earthquake Advisory',
          nextNodeId: 'bhj-d2b-injured-evacuation',
        },
      ],
    },

    // NODE 2A: Damaged Structure Triage (Primary Path from clean shelter)
    'bhj-d2-masonry-triage': {
      id: 'bhj-d2-masonry-triage',
      type: 'decision',
      situationText:
        'The primary ground shaking subsides, leaving an eerie silence broken only by distant cries and thick white limestone dust. Looking up from under the table, you see wide diagonal "X" shear cracks splitting both exterior load-bearing walls. The upper floor timbers are sagging precariously.',
      contextHint: 'Severely cracked unreinforced masonry structures can pancake completely during early aftershocks.',
      choices: [
        {
          id: 'bhj-c2-evacuate-now',
          label: 'Evacuate the damaged building immediately through the clear rear courtyard door into the open, leaving all non-essential belongings behind.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'You step out into the open courtyard without hesitation. Less than two minutes later, a heavy aftershock rumbles through, causing the unstable second-storey masonry wall you just vacated to partially buckle inward.',
          insight:
            'Post-earthquake surveys from the 2001 Gujarat earthquake proved that compromised masonry buildings often collapse entirely during early aftershocks. Immediate evacuation to open space without lingering for personal property is life-critical.',
          insightSource: 'GSDMA & EERI Gujarat Earthquake Reconnaissance',
          nextNodeId: 'bhj-d3-narrow-street-debris',
        },
        {
          id: 'bhj-c2-gather-valuables',
          label: 'Quickly search the bedroom cupboards for family jewelry, cash savings, and land documents before stepping out.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'As you rummage through the cupboards, an early aftershock rattles the weakened structure. A heavy wall cupboard topples over, pinning your legs against the bedframe and filling the room with choking plaster dust.',
          insight:
            'Never delay evacuation to retrieve material valuables from a damaged structure. Seismic damage leaves buildings structurally unpredictable and highly susceptible to pancake collapse under minor aftershocks.',
          insightSource: 'NDMA Post-Earthquake Safety Principles',
          nextNodeId: 'bhj-d3-narrow-street-debris',
        },
      ],
    },

    // NODE 2B: Injured Evacuation (Branch Path from early doorframe/running mistake)
    'bhj-d2b-injured-evacuation': {
      id: 'bhj-d2b-injured-evacuation',
      type: 'decision',
      situationText:
        'Nursing a bleeding scalp laceration and bruised ribs from falling parapet rubble, you pull yourself upright in the dust-choked doorway. The walls around you are severely fractured, and a dazed neighbor is shouting in panic from across the lane.',
      contextHint: 'Control personal bleeding quickly and move clear of the compromised building envelope.',
      choices: [
        {
          id: 'bhj-c2b-press-wound-exit',
          label: 'Press a clean cotton handkerchief firmly against your scalp wound, assist your shaken neighbor, and move steadily toward the open village square.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Direct pressure stems the scalp bleeding. Supporting your neighbor, you navigate away from the leaning walls and reach the safety of the wide street junction.',
          insight:
            'Applying direct pressure to lacerations controls bleeding effectively while maintaining situational awareness to evacuate away from structurally damaged buildings.',
          insightSource: 'NDMA Emergency First Aid & Triage Guidelines',
          nextNodeId: 'bhj-d3-narrow-street-debris',
        },
        {
          id: 'bhj-c2b-sit-doorstep',
          label: 'Sit down directly on the exterior doorstep to rest and wait for an ambulance or emergency vehicle to arrive.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Sitting directly beneath the fractured two-storey facade leaves you dangerously exposed. Dislodged roof tiles continue sliding off the eaves, landing around you as regional phone networks fail completely.',
          insight:
            'Never rest or wait directly adjacent to damaged masonry facades. In widespread regional disasters, municipal emergency vehicles face severe road blockages and delayed dispatch.',
          insightSource: 'NDMA Disaster Management Advisory',
          nextNodeId: 'bhj-d3-narrow-street-debris',
        },
      ],
    },

    // NODE 3: Narrow Street Navigation & Overhead Facade Hazards (Timed: 15s)
    'bhj-d3-narrow-street-debris': {
      id: 'bhj-d3-narrow-street-debris',
      type: 'decision',
      situationText:
        'You enter the main lane leading toward the town maidan. The street is narrow—barely four meters wide—flanked by ancient two-storey stone residences. Rubble piles line both curbs. Overhead, heavy stone balconies and cracked parapet walls tilt precariously toward the lane.',
      contextHint: 'Overhead masonry drop zones: Avoid walking immediately under exterior walls and overhangs.',
      timeLimit: 15,
      defaultChoiceId: 'bhj-c3-hug-walls',
      choices: [
        {
          id: 'bhj-c3-centerline-protect',
          label: 'Walk down the exact centerline of the street, hold a thick folded blanket or sturdy bag over your head, and keep moving toward the open town ground.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Staying in the middle of the narrow lane keeps you outside the immediate drop zone of the building facades. Overhead protection guards against falling mortar pebbles as you safely navigate the debris.',
          insight:
            'In dense historical towns with narrow street corridors, walking along the centerline with improvised head protection reduces exposure to falling cornices, parapets, and facade stones.',
          insightSource: 'NDMA Urban Earthquake Safety Protocol',
          nextNodeId: 'bhj-d4-utility-secondary',
        },
        {
          id: 'bhj-c3-hug-walls',
          label: 'Hug the exterior building walls closely beneath overhangs, believing the balconies will act as roofs against falling debris.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'A cantilevered stone balcony three meters ahead gives way under structural strain, dumping hundreds of kilograms of rubble onto the exact curb line where you were walking.',
          insight:
            'Overhanging balconies and sunshades are often the first structural elements to collapse during post-earthquake readjustments. Hugging exterior walls places occupants directly in the impact zone.',
          insightSource: 'EERI Gujarat Reconnaissance & NDMA Guidelines',
          nextNodeId: 'bhj-d4-utility-secondary',
        },
      ],
    },

    // NODE 4: Secondary Utility Hazards (Power & Gas)
    'bhj-d4-utility-secondary': {
      id: 'bhj-d4-utility-secondary',
      type: 'decision',
      situationText:
        'At the lane intersection, an electrical transformer pole has toppled, draping tangled high-voltage wires across a pool of leaking water. Beside it, an overturned tea stall is hissing loudly with the unmistakable pungent odor of leaking domestic LPG gas.',
      contextHint: 'Severed electrical conductors and flammable gas leaks are prime triggers for secondary post-earthquake infernos.',
      choices: [
        {
          id: 'bhj-c4-isolate-warn',
          label: 'Halt the evacuees immediately, steer everyone in a wide arc around the downed cables, warn nearby neighbors not to light matches or cigarettes, and continue toward the open maidan.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Your vigilance prevents two approaching villagers from stepping into the wet area near the cables. Shouting gas warnings prevents someone from striking a match, averting a secondary firestorm.',
          insight:
            'Secondary fires and electrical shock hazards frequently claim lives after major earthquakes. Treat all downed wires as live and strictly prohibit open flames or sparks anywhere near gas leaks.',
          insightSource: 'NDMA Earthquake Secondary Hazard Protocols',
          nextNodeId: 'bhj-d5-aftershock-open-ground',
        },
        {
          id: 'bhj-c4-step-over-cables',
          label: 'Step carefully over the tangled black cables since the neighborhood power appears to be out, and strike a lighter to inspect the tea stall regulator.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'Striking an open flame near the leaking LPG vapor triggers a sudden flash fireball that scorches your clothes and eyebrows, sending panic through the retreating crowd.',
          insight:
            'Never assume downed electrical cables are dead, and never ignite open flames near suspected gas leaks. Leaking LPG pools in low areas and ignites with minimal spark energy.',
          insightSource: 'NDMA Fire & Gas Safety Guidelines',
          nextNodeId: 'bhj-d5-aftershock-open-ground',
        },
      ],
    },

    // NODE 5: Open Ground Assembly & Severe Aftershock (Timed: 15s)
    'bhj-d5-aftershock-open-ground': {
      id: 'bhj-d5-aftershock-open-ground',
      type: 'decision',
      situationText:
        'You finally reach the expansive open town maidan, clear of all structures and power lines. Hundreds of survivors are gathering. Suddenly, the earth roars again—a violent Magnitude 5+ aftershock strikes, rolling the ground beneath your feet. Several terrified people start sprinting back toward houses.',
      contextHint: 'During open-ground aftershocks, keep people low and prevent panic rushes toward weakened structures.',
      timeLimit: 15,
      defaultChoiceId: 'bhj-c5-rush-back-check',
      choices: [
        {
          id: 'bhj-c5-drop-open-calm',
          label: 'Drop to your knees on the open ground, sit low to maintain balance, protect your head, and shout loudly for people to stay in the open and away from buildings.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Sitting low on the open ground protects you from loss of balance. Across the perimeter of the field, two previously damaged boundary walls collapse, but everyone who remained in the center is completely unharmed.',
          insight:
            'Major earthquakes are invariably followed by dangerous aftershocks. Staying low on wide open ground away from buildings, overhead wires, and walls is the safest survival posture.',
          insightSource: 'NDMA Aftershock Preparedness Advisory',
          nextNodeId: 'bhj-d6-community-response',
        },
        {
          id: 'bhj-c5-rush-back-check',
          label: 'Run back toward the edge of the street to check if your relatives\' homes have survived the aftershock.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'As you sprint back toward the street edge, a standing compound wall collapses outward, sending heavy brick blocks rolling across the grass, bruising your shins and forcing you to retreat.',
          insight:
            'Never rush toward buildings during an aftershock. Weakened structures shed debris with minimal provocation, creating lethal hazards for anyone near the building perimeter.',
          insightSource: 'NDMA Building Safety Protocols',
          nextNodeId: 'bhj-d6-community-response',
        },
      ],
    },

    // NODE 6: Community Mutual Aid & Emergency Coordination
    'bhj-d6-community-response': {
      id: 'bhj-d6-community-response',
      type: 'decision',
      situationText:
        'On the town maidan, the full scale of the regional catastrophe becomes apparent: telecommunication towers are down, landlines are severed, and local government offices have collapsed. Civilian mutual aid is the immediate lifeline before military and state relief convoys can mobilize.',
      contextHint: 'Organize mutual aid: prioritize bleeding triage, water distribution, and physical messenger dispatch.',
      choices: [
        {
          id: 'bhj-c6-organize-aid',
          label: 'Help establish an orderly community triage point: coordinate clean drinking water, use clean cloths for pressure dressings, avoid moving suspected spinal injuries without backboards, and send cyclists toward the district highway to guide incoming relief.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Your structured community triage stabilizes eight injured neighbors, protects victims with suspected spinal fractures from worsening injury, and provides clear navigation coordinates for arriving rescue units.',
          insight:
            'In catastrophic regional disasters where communications and lifelines are severed, organized community first-response and careful casualty handling preserve lives during the critical initial hours.',
          insightSource: 'NDMA Community Disaster Response Framework',
          nextNodeId: 'bhj-outcome-node',
        },
        {
          id: 'bhj-c6-crowd-rumors',
          label: 'Gather in anxious huddles speculating about dam collapses and repeatedly dial dead telephone numbers while ignoring injured neighbors on the field.',
          isCorrect: false,
          scoreImpact: -10,
          consequenceText:
            'Unsubstantiated rumors cause unnecessary panic across the maidan, wasting precious daylight while preventable blood loss weakens injured survivors.',
          insight:
            'Rumors and panic in disaster assembly areas deplete morale and divert attention from urgent community care. Direct, calm mutual aid is essential during the golden hours of relief.',
          insightSource: 'NDMA Disaster Psychology & Community Resilience',
          nextNodeId: 'bhj-outcome-node',
        },
      ],
    },

    // OUTCOME NODE
    'bhj-outcome-node': {
      id: 'bhj-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You survived the 2001 Bhuj seismic emergency: you protected yourself under sturdy furniture against unreinforced masonry collapse, navigated narrow street drop zones safely, avoided secondary fire hazards, withstood severe aftershocks on open ground, and contributed to organized community first response. This historic tragedy led directly to the creation of the Gujarat State Disaster Management Authority (GSDMA) and the National Disaster Management Authority (NDMA), revolutionizing India\'s disaster preparedness.',
      nextNodeId: '',
    },
  },
};
