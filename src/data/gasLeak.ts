// src/data/gasLeak.ts
// Gas Leakage Scenario Graph — NDMA / 112 ERSS / PESO aligned.
// Evaluated dynamically in real-time by the Gas Leak Event Director.
// All choices include deterministic scoring, state deltas, and authoritative safety protocols.

import type { Scenario, DecisionNode, OutcomeNode, ReportNode } from './types';

export const gasLeakScenario: Scenario = {
  id: 'gas-leak-facility',
  disasterType: 'gas_leak',
  category: 'modern',
  title: 'Hazardous Gas Leakage & Atmospheric Vapor Surge',
  subtitle: 'Dynamic Utility Corridor & Enclosed Facility · 10:15 AM',
  theme: 'gas_leak',
  startNodeId: 'gas-event-detect',
  nodes: {
    // ── 1. Event: GAS LEAK DETECTED ──────────────────────────────────────────
    'gas-event-detect': {
      id: 'gas-event-detect',
      type: 'decision',
      timeLimit: 15,
      situationText:
        'A sharp, rotten-egg mercaptan sulfur odor suddenly permeates the corridor. Inside the utility meter room, an audible pressurized hissing sound echoes from a severed distribution line. Gas alarms are chirping and occupants are starting to panic. You have seconds.',
      contextHint: 'NDMA Chemical & Gas Safety Protocol: Immediately eliminate spark sources and secure the primary isolation valve.',
      choices: [
        {
          id: 'gas-d1-isolate-valve',
          label: 'Isolate main gas quarter-turn valve, open exterior windows for natural ventilation, and order upwind evacuation without touching switches.',
          isCorrect: true,
          scoreImpact: 25,
          consequenceText:
            'You grabbed an insulated tool, immediately threw the quarter-turn brass valve perpendicular to the pipe, and propped open outward windows. Gas supply ceased instantly and natural breezes began diluting trapped vapors.',
          insight:
            'According to NDMA and City Gas safety guidelines, the primary isolation valve should be turned perpendicular to the supply pipe immediately. Natural cross-ventilation dilutes the gas without introducing electrical ignition risks.',
          insightSource: 'NDMA Hazardous Materials & Chemical Incident Guidelines',
          nextNodeId: 'gas-event-evac-alert',
          stateDelta: {
            panicChange: -12,
            hazardChange: -20,
            safetyChange: 18,
            visibilityChange: 15,
            shiftSummary: 'Main supply shutoff halted active gas discharge. Natural cross-ventilation began diluting explosive vapors.',
          },
        },
        {
          id: 'gas-d1-electric-fan',
          label: 'Turn on the overhead lights and electric exhaust fan to inspect the pipe and blow out the fumes quickly.',
          isCorrect: false,
          scoreImpact: -30,
          consequenceText:
            'Flipping the wall switch produced an instantaneous electrical contact arc! A loud whoosh and blue combustion flare ignited near the ceiling fixture. You narrowly scrambled back as intense heat singed the room.',
          insight:
            'NEVER touch electrical light switches, doorbells, or standard exhaust fans in a gas leak zone. Standard AC switches produce an internal arc that instantly ignites flammable methane or propane at the Lower Explosive Limit (LEL).',
          insightSource: 'Petroleum and Explosives Safety Organisation (PESO) Advisory',
          nextNodeId: 'gas-event-ignition',
          stateDelta: {
            panicChange: 28,
            hazardChange: 30,
            safetyChange: -30,
            visibilityChange: -15,
            shiftSummary: 'CRITICAL ARROW: Wall switch generated an internal electrical arc, creating acute flash-fire ignition danger.',
          },
        },
        {
          id: 'gas-d1-seal-room',
          label: 'Close the utility room door tightly to trap the smell inside, and wait 15 minutes to see if maintenance arrives.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'Sealing the room without isolating the valve allowed pressurized gas to accumulate into a highly explosive stoichiometric mixture. Gas seeped through electrical conduits into the adjoining stairwells, causing coughing and dizziness.',
          insight:
            'Confining flammable gas inside an unventilated room creates an explosive bomb. Uncontrolled leaks must be isolated at the source and ventilated outward away from populated areas.',
          insightSource: '112 ERSS Hazardous Material Emergency Guide',
          nextNodeId: 'gas-event-vent-fail',
          stateDelta: {
            panicChange: 18,
            hazardChange: 22,
            safetyChange: -20,
            visibilityChange: -25,
            shiftSummary: 'Enclosing the gas leak without isolation created a concentrated explosive pocket in the building core.',
          },
        },
      ],
    } as DecisionNode,

    // ── 2. Event: HIGH GAS CONCENTRATION ────────────────────────────────────
    'gas-event-high-conc': {
      id: 'gas-event-high-conc',
      type: 'decision',
      timeLimit: 15,
      situationText:
        'Gas concentration has breached safe operational thresholds (>40% LEL). Occupants report acute dizziness, nausea, and burning eyes. The air feels heavy and suffocating as vapors displace breathable oxygen along the transit hallway.',
      contextHint: 'Asphyxiation Hazard: Hydrocarbon vapors displace breathable air. Protect airways and evacuate vertically away from vapor accumulation.',
      choices: [
        {
          id: 'gas-d2-damp-cloth-evac',
          label: 'Cover mouth and nose with a damp cloth, stay low beneath the rising vapor layer, and lead immediate evacuation upwind to the street.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Crawling low under the heavy vapor envelope shielded lungs from acute asphyxiation. You guided the squad into fresh exterior air, immediately relieving respiratory distress.',
          insight:
            'A damp cloth filters particulate odorants and provides temporary thermal airway protection. Staying low beneath lighter-than-air or turbulent gas plumes preserves vital oxygen until outside.',
          insightSource: 'NDMA Medical Guidelines for Chemical Emergencies',
          nextNodeId: 'gas-event-evac-alert',
          stateDelta: {
            panicChange: -10,
            hazardChange: -15,
            safetyChange: 15,
            visibilityChange: 10,
            shiftSummary: 'Low-level airway protection and swift egress prevented acute gas inhalation casualties.',
          },
        },
        {
          id: 'gas-d2-tape-repair',
          label: 'Attempt to wrap duct tape and a rag around the hissing pipe rupture while holding your breath inside the plume.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'Pipeline line pressure instantly ruptured the duct tape. High-velocity gas blasted directly into your face, triggering severe hydrocarbon disorientation and temporary incapacitation.',
          insight:
            'Never attempt amateur mechanical repairs on pressurized gas pipelines. High-pressure gas causes rapid cryogenic skin burns and sudden loss of consciousness.',
          insightSource: 'PESO Pipeline Safety Protocol',
          nextNodeId: 'gas-event-ignition',
          stateDelta: {
            panicChange: 22,
            hazardChange: 20,
            safetyChange: -25,
            visibilityChange: -10,
            shiftSummary: 'Failed amateur pipe patch exacerbated line rupture and caused severe chemical exposure.',
          },
        },
        {
          id: 'gas-d2-wait-landing',
          label: 'Instruct occupants to sit down on the stairwell landing and rest while waiting for the building supervisor.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'Stagnant vapors accumulated heavily in the stairwell envelope. Multiple occupants became semi-conscious due to severe oxygen displacement, creating a critical evacuation delay.',
          insight:
            'Never allow people to rest or wait in low-lying or enclosed corridors during a gas emergency. Oxygen displacement occurs rapidly, leading to loss of consciousness in under 3 minutes.',
          insightSource: 'NDMA Chemical Disaster Preparedness Manual',
          nextNodeId: 'gas-event-vent-fail',
          stateDelta: {
            panicChange: 20,
            hazardChange: 18,
            safetyChange: -22,
            visibilityChange: -15,
            shiftSummary: 'Delaying in the stairwell caused severe oxygen depletion among companions.',
          },
        },
      ],
    } as DecisionNode,

    // ── 3. Event: IGNITION RISK ──────────────────────────────────────────────
    'gas-event-ignition': {
      id: 'gas-event-ignition',
      type: 'decision',
      timeLimit: 15,
      situationText:
        'CRITICAL IGNITION THREAT: The vapor-air mixture is inside the explosive limits (5%–15%). Outside the exit door, a delivery driver is about to kick-start a scooter, and an electrical junction relay is buzzing and arcing.',
      contextHint: 'Explosion Danger: Any mechanical spark, vehicle ignition, or static electricity will detonate the vapor cloud.',
      choices: [
        {
          id: 'gas-d3-halt-spark',
          label: 'Shout loud authoritative halt commands to prevent vehicle starting, extinguish all cigarettes, and enforce a 100m upwind exclusion perimeter.',
          isCorrect: true,
          scoreImpact: 25,
          consequenceText:
            'Your commanding shouts halted the driver before the ignition key turned. You redirected bystanders away from the sparking relay and pushed the perimeter 100 meters upwind.',
          insight:
            'Vehicle spark plugs, starter motors, and cigarettes are the most common triggers for external vapor cloud explosions (VCE). A 100-meter exclusion zone upwind neutralizes blast shockwave danger.',
          insightSource: 'NDMA Incident Command Guidelines for Hazmat Explosives',
          nextNodeId: 'gas-event-responder',
          stateDelta: {
            panicChange: -15,
            hazardChange: -20,
            safetyChange: 20,
            visibilityChange: 10,
            shiftSummary: 'Authoritative spark elimination neutralized imminent explosive detonation sources.',
          },
        },
        {
          id: 'gas-d3-pull-mcb',
          label: 'Rush to the main electric distribution box next to the meter room and violently pull down the building master MCB switch.',
          isCorrect: false,
          scoreImpact: -30,
          consequenceText:
            'Throwing a heavy inductive electrical breaker created a blinding high-voltage arc inside the panel! A deafening pressure bang blew off the panel cover and singed the entry corridor.',
          insight:
            'Do NOT operate electrical circuit breakers or switches inside a gas-contaminated structure. Heavy breakers create significant internal electrical arcs that detonate flammable gas.',
          insightSource: 'Central Electricity Authority (CEA) Safety Guidelines',
          nextNodeId: 'gas-outcome-critical',
          stateDelta: {
            panicChange: 35,
            hazardChange: 35,
            safetyChange: -35,
            visibilityChange: -20,
            shiftSummary: 'Throwing high-voltage breaker triggered severe electrical arc flash inside explosive envelope.',
          },
        },
        {
          id: 'gas-d3-use-phone',
          label: 'Pull out your mobile phone directly in the center of the gas plume and dial family members to ask what to do.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'Operating an uncertified non-intrinsically safe consumer phone within an active vapor envelope violated basic hazmat safety. A bystander knocked the phone away in panic.',
          insight:
            'Consumer mobile phones are not certified intrinsically safe (ATEX/IECEx). Radio frequency transmissions and battery contacts can ignite sensitive hydrocarbon vapor clouds.',
          insightSource: 'Petroleum and Explosives Safety Organisation (PESO)',
          nextNodeId: 'gas-event-evac-alert',
          stateDelta: {
            panicChange: 18,
            hazardChange: 15,
            safetyChange: -18,
            visibilityChange: 0,
            shiftSummary: 'Operating mobile phone in explosive envelope breached Hazmat safety protocols.',
          },
        },
      ],
    } as DecisionNode,

    // ── 4. Event: VENTILATION FAILURE ────────────────────────────────────────
    'gas-event-vent-fail': {
      id: 'gas-event-vent-fail',
      type: 'decision',
      timeLimit: 15,
      situationText:
        'Air circulation has stalled. Dense pockets of gas have settled in basement sumps and enclosed utility shafts. Without convective airflow, the vapor cloud is expanding horizontally toward residential living spaces.',
      contextHint: 'Ventilation Dynamics: Flammable gases require natural cross-draft dilution without using spark-generating powered mechanical blowers.',
      choices: [
        {
          id: 'gas-d4-natural-crossdraft',
          label: 'Prop open exterior building doors and open ground-level louvers to generate natural convective cross-draft without electric fans.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Propping open opposing doors established a vigorous natural thermal draft. Stagnant gas pockets were flushed out into open outdoor space where natural atmospheric dispersion diluted them below the LEL.',
          insight:
            'Natural convective cross-ventilation creates passive air exchange without any spark hazard. Outdoor atmospheric dilution rapidly drops gas concentration below the flammable range.',
          insightSource: 'NDMA Standard Operating Procedure for Toxic Gas Dispersal',
          nextNodeId: 'gas-event-responder',
          stateDelta: {
            panicChange: -10,
            hazardChange: -18,
            safetyChange: 15,
            visibilityChange: 20,
            shiftSummary: 'Natural convective cross-ventilation cleared stagnant vapor pockets without electrical spark risks.',
          },
        },
        {
          id: 'gas-d4-plug-blower',
          label: 'Plug in an industrial extension cord and portable blower fan to force the gas out of the basement.',
          isCorrect: false,
          scoreImpact: -30,
          consequenceText:
            'Plugging into the wall receptacle generated a sharp spark. The universal motor on the portable blower emitted continuous brush arcing, triggering a localized flash fire at the outlet!',
          insight:
            'Standard portable fans use universal brush motors that continuously spark during operation. Only certified explosion-proof positive pressure ventilators (PPV) may be used near gas.',
          insightSource: 'Fire Services Hazmat Equipment Guidelines',
          nextNodeId: 'gas-event-ignition',
          stateDelta: {
            panicChange: 30,
            hazardChange: 28,
            safetyChange: -30,
            visibilityChange: -10,
            shiftSummary: 'Universal blower motor sparking ignited localized vapor flash fire.',
          },
        },
        {
          id: 'gas-d4-retreat-storeroom',
          label: 'Retreat with your companions into a windowless interior storeroom and lock the door to avoid the draft.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'The windowless storeroom had zero air turnover. Gas filtered through door undersides, trapping everyone in an oxygen-depleted dead end.',
          insight:
            'Never shelter in interior windowless rooms during a gas leak. Gas penetrates door thresholds, turning unventilated rooms into lethal asphyxiation chambers.',
          insightSource: '112 ERSS Structural Emergency Protocols',
          nextNodeId: 'gas-event-high-conc',
          stateDelta: {
            panicChange: 22,
            hazardChange: 22,
            safetyChange: -25,
            visibilityChange: -20,
            shiftSummary: 'Sheltering in windowless room created unventilated entrapment hazard.',
          },
        },
      ],
    } as DecisionNode,

    // ── 5. Event: EVACUATION ALERT ──────────────────────────────────────────
    'gas-event-evac-alert': {
      id: 'gas-event-evac-alert',
      type: 'decision',
      timeLimit: 15,
      situationText:
        'COMMUNITY EVACUATION: Panic has erupted among building occupants. People are shouting, grabbing luggage, and crowding the narrow exit gate. Some confused residents are running downwind toward the gas dispersion plume.',
      contextHint: 'Evacuation Orientation: Gas plumes disperse downwind. Evacuate UPWIND and perpendicular to the wind direction.',
      choices: [
        {
          id: 'gas-d5-upwind-marshall',
          label: 'Take command: direct all occupants UPWIND and crosswind away from the plume trajectory toward the open assembly ground.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Your clear commands redirected the crowd away from the toxic downwind path. All occupants safely reached the upwind assembly ground, well clear of the vapor footprint.',
          insight:
            'Always evacuate UPWIND (against the wind direction) or CROSSWIND (perpendicular to wind). Moving downwind places evacuees directly in the path of expanding toxic and flammable vapors.',
          insightSource: 'NDMA Evacuation Management Guidelines',
          nextNodeId: 'gas-event-responder',
          stateDelta: {
            panicChange: -15,
            hazardChange: -12,
            safetyChange: 20,
            visibilityChange: 10,
            shiftSummary: 'Upwind crowd marshaling safely guided occupants away from vapor dispersion path.',
          },
        },
        {
          id: 'gas-d5-run-downwind',
          label: 'Follow the crowd downwind along the main alleyway where the sulfur odor is dispersing.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'Running downwind led evacuees straight into the heaviest settling cloud of gas. Multiple people collapsed with severe coughing and eye irritation.',
          insight:
            'Fleeing downwind travels at the same speed as the moving vapor plume, maximizing exposure duration and increasing respiratory collapse risk.',
          insightSource: 'NDMA Chemical Emergency Guidelines',
          nextNodeId: 'gas-event-high-conc',
          stateDelta: {
            panicChange: 25,
            hazardChange: 20,
            safetyChange: -20,
            visibilityChange: -15,
            shiftSummary: 'Evacuating downwind trapped occupants inside the dense migrating vapor cloud.',
          },
        },
        {
          id: 'gas-d5-balcony-shelter',
          label: 'Instruct residents to stay on upper balconies overlooking the ruptured pipe and wait for instructions.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'Rising gas plumes enveloped the upper balconies. Residents were trapped directly above the leak source with escalating panic and toxic fumes.',
          insight:
            'Natural gas (methane) is lighter than air and rises upward along building facades, saturating upper balconies and window openings. Vertical evacuation into exterior ground is essential.',
          insightSource: 'NDMA Urban Chemical Safety Manual',
          nextNodeId: 'gas-event-ignition',
          stateDelta: {
            panicChange: 20,
            hazardChange: 20,
            safetyChange: -25,
            visibilityChange: -10,
            shiftSummary: 'Upper balcony shelter exposed residents to rising thermal gas envelope.',
          },
        },
      ],
    } as DecisionNode,

    // ── 6. Event: EMERGENCY RESPONDER ARRIVAL ────────────────────────────────
    'gas-event-responder': {
      id: 'gas-event-responder',
      type: 'decision',
      timeLimit: 15,
      situationText:
        '112 ERSS Fire & Hazmat response tenders have arrived on scene with sirens wailing. The Fire Station Officer requests an immediate situation report: status of the main isolation valve, leak location, and headcount.',
      contextHint: 'Incident Handover: Provide concise, factual information: valve status, leak location, evacuated headcount, and known injuries.',
      choices: [
        {
          id: 'gas-d6-concise-handover',
          label: 'Deliver concise sit-rep: confirm isolation valve state, pipeline fracture location, confirmed upwind headcount, and clear hazmat perimeter.',
          isCorrect: true,
          scoreImpact: 25,
          consequenceText:
            'Your professional briefing allowed the Fire Brigade to deploy multigas detectors and positive-pressure ventilation fans immediately. The incident was brought under total control without casualties.',
          insight:
            'Accurate civilian briefings save critical minutes for first responders. Informing them of the exact valve status and building layout allows targeted containment without search delays.',
          insightSource: '112 ERSS Incident Command Protocols',
          nextNodeId: 'gas-outcome-containment',
          stateDelta: {
            panicChange: -20,
            hazardChange: -25,
            safetyChange: 25,
            visibilityChange: 15,
            shiftSummary: 'Flawless incident handover enabled swift Hazmat capping and total threat containment.',
          },
        },
        {
          id: 'gas-d6-reenter-belongings',
          label: 'Attempt to slip past the firefighter cordon back into your apartment to collect your laptop and documents.',
          isCorrect: false,
          scoreImpact: -30,
          consequenceText:
            'Firefighters had to physically tackle and extract you from the contaminated lobby. Your reckless re-entry delayed emergency operations and exposed you to toxic residual gas.',
          insight:
            'NEVER re-enter an active hazmat exclusion zone under any circumstances until authorities officially declare the area safe. Material possessions can be replaced; lives cannot.',
          insightSource: 'NDMA Standard Operating Procedures for Disaster Zones',
          nextNodeId: 'gas-outcome-critical',
          stateDelta: {
            panicChange: 25,
            hazardChange: 20,
            safetyChange: -30,
            visibilityChange: -10,
            shiftSummary: 'Re-entering active hazmat zone breached emergency cordons and endangered responders.',
          },
        },
        {
          id: 'gas-d6-argue-vehicle',
          label: 'Demand that firefighters allow you to drive your car out of the basement parking lot immediately.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Your argument distracted the incident commander. Starting a car in the basement would have caused a devastating ignition. Responders firmly ordered you to the perimeter.',
          insight:
            'Internal combustion engines are prime ignition sources for vapor clouds. Vehicles must remain switched off within 100 meters of any gas leak.',
          insightSource: 'PESO Gas Safety Regulations',
          nextNodeId: 'gas-outcome-containment',
          stateDelta: {
            panicChange: 10,
            hazardChange: 5,
            safetyChange: -15,
            visibilityChange: 0,
            shiftSummary: 'Distracted emergency command and delayed deployment of gas monitoring equipment.',
          },
        },
      ],
    } as DecisionNode,

    // ── OUTCOMES ─────────────────────────────────────────────────────────────
    'gas-outcome-containment': {
      id: 'gas-outcome-containment',
      type: 'outcome',
      survived: true,
      narrativeText:
        'INCIDENT CONTAINED // SUCCESSFUL HAZMAT RESOLUTION.\n\nYour disciplined, NDMA-aligned decision-making prevented a catastrophic blast. By isolating the main supply, maintaining natural ventilation, avoiding electrical arcs, and directing an orderly upwind evacuation, you protected every occupant. Fire Services and City Gas authorities safely capped the severed pipeline.',
      nextNodeId: 'gas-report',
    } as OutcomeNode,

    'gas-outcome-critical': {
      id: 'gas-outcome-critical',
      type: 'outcome',
      survived: false,
      narrativeText:
        'CRITICAL INCIDENT // EXPLOSIVE DEFLAGRATION.\n\nElectrical arcing or unmitigated gas accumulation triggered a sudden vapor cloud deflagration. Structural blast damage and severe flash burns resulted from protocol divergence. Emergency medical rescue units were required to extract casualties from the debris.',
      nextNodeId: 'gas-report',
    } as OutcomeNode,

    'gas-report': {
      id: 'gas-report',
      type: 'report',
    } as ReportNode,
  },
};
