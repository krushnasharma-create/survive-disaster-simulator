// src/data/fire.ts
// Residential Multi-Storey Building Fire Disaster Scenario
// Grounded in public safety principles from NDMA India, Delhi Fire Service, and 112 ERSS.

import type { Scenario } from './types';

export const fireScenario: Scenario = {
  id: 'fire',
  title: 'Structure Fire Hazard',
  subtitle: 'Residential Multi-Storey Building — 02:13 AM',
  theme: 'fire',
  startNodeId: 'fire-d1-alarm',
  nodes: {
    // NODE 1: Initial Discovery & Thermal Evaluation (Timed: 15s)
    'fire-d1-alarm': {
      id: 'fire-d1-alarm',
      type: 'decision',
      situationText:
        '02:13 AM. The shrill, piercing beep of a smoke alarm jolts you awake. The bedroom is pitch dark. Through the gap beneath your closed bedroom door, you see a faint orange flicker and a grey wisp of acrid smoke creeping along the floorboards.',
      contextHint: 'Your bedroom door is closed. Heat and smoke are active on the other side.',
      timeLimit: 15,
      defaultChoiceId: 'fire-c1-open-wide',
      environmentEvents: [
        { triggerAtSeconds: 5, effectType: 'smoke', intensity: 'medium' },
      ],
      choices: [
        {
          id: 'fire-c1-back-of-hand',
          label: 'Touch the door and metal doorknob lightly with the back of your hand to test for heat before opening.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'The metal knob is moderately cool. Kneeling low, you brace your shoulder against the door and crack it open two inches. You observe light smoke in the corridor at head height, but the path toward the main exit is navigable.',
          insight:
            'Always test closed doors and doorknobs with the back of your hand before opening. A warm door indicates intense fire on the other side that can trigger an explosive flashover if opened.',
          insightSource: 'NDMA Fire Safety Guidelines',
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
          insightSource: 'NDMA Fire Safety Guidelines',
          nextNodeId: 'fire-d2b-smoke-room',
        },
      ],
    },

    // NODE 2A: Smoke in Corridor — Movement Strategy (From cool door)
    'fire-d2-smoke-crawl': {
      id: 'fire-d2-smoke-crawl',
      type: 'decision',
      situationText:
        'You are in the hallway. Thick, dark smoke is billowing across the ceiling and gradually descending. Visibility is dropping rapidly. The exit staircase door is thirty feet ahead at the end of the passage.',
      contextHint: 'Toxic smoke rises to the ceiling; cleaner air remains near the floor.',
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
          insightSource: 'NDMA & Fire Service Safety Guidelines',
          nextNodeId: 'fire-d3-staircase-block',
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
          insightSource: 'NDMA Fire Safety Guidelines',
          nextNodeId: 'fire-d3-staircase-block',
        },
      ],
    },

    // NODE 2B: Bedroom Compromised — Branch Pathway (From opening door rapidly)
    'fire-d2b-smoke-room': {
      id: 'fire-d2b-smoke-room',
      type: 'decision',
      situationText:
        'Dense smoke has flooded the corridor and is pouring into your bedroom. Stepping into the hallway now without protection will cause rapid suffocation. You have moments before the room fills completely.',
      contextHint: 'The hallway is impassable without sealing or respiratory protection.',
      choices: [
        {
          id: 'fire-c2b-retreat-seal',
          label: 'Pull the bedroom door shut immediately, seal the bottom gap with a damp bedsheet, and move toward the window to signal for help.',
          isCorrect: true,
          scoreImpact: 15,
          consequenceText:
            'Closing the door and wedging the damp sheet beneath the frame creates a vital smoke barrier. The air inside stabilizes, buying critical time while you open the window slightly for fresh air.',
          insight:
            'If your primary escape route is blocked by thick smoke, isolate yourself in a room with a window, close doors, seal crevices with wet cloth to prevent smoke penetration, and signal your location.',
          insightSource: 'NDMA Residential Fire Directives',
          nextNodeId: 'fire-d4b-window-signal',
        },
        {
          id: 'fire-c2b-blind-dash',
          label: 'Cover your face with your dry shirt collar and sprint blindly into the smoke-filled hallway.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'Dry fabric provides zero protection against carbon monoxide or toxic particulates. Blinded by thick soot, you lose your bearings in the corridor, coughing uncontrollably before colliding with the stairwell door frame.',
          insight:
            'Dry cloth does not filter out toxic gases like carbon monoxide. Running blindly into dense smoke leads to rapid disorientation and respiratory incapacitation.',
          insightSource: 'NDMA Fire Emergency Standards',
          nextNodeId: 'fire-d3-staircase-block',
        },
      ],
    },

    // NODE 3: Staircase Barrier & Exit Assessment (Branching Point)
    'fire-d3-staircase-block': {
      id: 'fire-d3-staircase-block',
      type: 'decision',
      situationText:
        'You reach the main staircase landing on the 3rd floor. You open the stairwell door and discover thick smoke rising up the shaft from a lower floor. The passenger elevator doors stand open with an emergency indicator blinking.',
      contextHint: 'The stairwell has become an active chimney for rising heat and smoke.',
      choices: [
        {
          id: 'fire-c3-reclose-alternate',
          label: 'Close the fire door immediately to seal the smoke shaft, and divert across the floor to the secondary external fire escape stairwell.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Closing the door prevents the staircase smoke from spreading across the floor. You move quickly along the illuminated emergency signs to the external steel fire escape on the building rear.',
          insight:
            'If an escape stairwell is filled with smoke, do not enter it. Close the door to keep smoke compartmentalized and use an alternate escape route or external fire escape.',
          insightSource: 'NDMA High-Rise Building Safety Guidelines',
          nextNodeId: 'fire-d4-external-escape',
        },
        {
          id: 'fire-c3-enter-smoke-stairs',
          label: 'Grip the stairwell handrail and attempt to push downward through the rising smoke.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'After descending half a flight, intense rising heat and impenetrable black smoke force you to retreat onto the landing, gasping for breath with severely irritated eyes.',
          insight:
            'Never attempt to travel downward through heavy smoke in a stairwell. Rising heat and toxic concentrations increase lower down near the fire source.',
          insightSource: 'NDMA Fire Safety Guidelines',
          nextNodeId: 'fire-d4-external-escape',
        },
        {
          id: 'fire-c3-take-elevator',
          label: 'Step into the open elevator hoping it will drop you quickly to the ground floor before power fails.',
          isCorrect: false,
          scoreImpact: -30,
          consequenceText:
            'As soon as you enter, the elevator panel sparks and the car shudders to a halt between floors. You are trapped in a metal shaft that acts as a natural chimney for rising smoke.',
          insight:
            'Never use elevators during a building fire. Power failure can stall the car between floors, and elevator shafts rapidly channel fatal heat and toxic smoke.',
          insightSource: 'NDMA Fire Safety Protocols',
          nextNodeId: 'fire-d5-evacuate-ground',
        },
      ],
    },

    // NODE 4A: Secondary External Fire Escape (Timed: 15s)
    'fire-d4-external-escape': {
      id: 'fire-d4-external-escape',
      type: 'decision',
      situationText:
        'You push open the exit door to the external steel fire escape. Fresh night air hits you, but smoke is venting from windows two floors below. A neighbor in front of you freezes in panic on the metal grating.',
      contextHint: 'Maintain steady progress without triggering panic or crowd collapse on narrow stairs.',
      timeLimit: 15,
      defaultChoiceId: 'fire-c4-push-past',
      choices: [
        {
          id: 'fire-c4-guide-calmly',
          label: 'Firmly grasp the handrail with one hand, place a steadying hand on your neighbor, and urge them forward at a controlled pace.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Your firm voice snaps your neighbor out of their freeze. You both descend the external stairs steadily, avoiding slips on the damp metal treads and keeping the exit flow moving.',
          insight:
            'During emergency evacuations, maintain composure, hold handrails, and assist panicked occupants firmly. Orderly movement prevents fatal falls and crushes on narrow fire escapes.',
          insightSource: 'NDMA Disaster Management Principles',
          nextNodeId: 'fire-d5-evacuate-ground',
        },
        {
          id: 'fire-c4-push-past',
          label: 'Shove past your neighbor roughly to sprint down the spiral staircase as fast as possible.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Forcing your way past causes your neighbor to stumble against the railing. You slip on a metal tread, bruising your shin before regaining balance and continuing down in disarray.',
          insight:
            'Pushing and shoving during stairwell evacuations frequently causes falls and blockages that endanger everyone behind you.',
          insightSource: 'NDMA Public Safety Advisory',
          nextNodeId: 'fire-d5-evacuate-ground',
        },
      ],
    },

    // NODE 4B: Window Signal Branch (From sealed room)
    'fire-d4b-window-signal': {
      id: 'fire-d4b-window-signal',
      type: 'decision',
      situationText:
        'You are isolated in the bedroom. The door is sealed with damp cloth, holding the smoke at bay. You are at the window. Below in the courtyard, flashing red emergency lights reflect off the tarmac.',
      contextHint: 'Communicate your exact location to arriving emergency responders.',
      choices: [
        {
          id: 'fire-c4b-bright-cloth-light',
          label: 'Hang a bright white or light-colored cloth out the window and shine your phone flashlight directly onto it while shouting your floor number.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Firefighters on the ground spot the illuminated cloth immediately. A crew positions a hydraulic ladder platform toward your 3rd-floor window within minutes.',
          insight:
            'If trapped in a room during a fire, display a light-colored cloth or towel from the window and use a flashlight to signal rescuers. Keep windows closed as much as possible to prevent drawing exterior smoke in.',
          insightSource: 'NDMA Fire Rescue Advisory',
          nextNodeId: 'fire-d6-emergency-call',
        },
        {
          id: 'fire-c4b-break-glass-shout',
          label: 'Smash the window glass completely with a chair and lean far out shouting at passersby.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Breaking the glass creates an intense upward draft that sucks smoke from beneath the door across the bedroom ceiling. Shards also fall onto the emergency path below.',
          insight:
            'Do not break windows completely unless specifically instructed by rescuers. An open window creates an exhaust draft that pulls smoke and fire into the room.',
          insightSource: 'NDMA Residential Fire Guidance',
          nextNodeId: 'fire-d6-emergency-call',
        },
      ],
    },

    // NODE 5: Ground-Level Exit & Building Perimeter Clearance
    'fire-d5-evacuate-ground': {
      id: 'fire-d5-evacuate-ground',
      type: 'decision',
      situationText:
        'You reach the ground floor exit door and push out into the night. Thick smoke is pouring from upper balconies, and burning debris is showering near the building entrance. A crowd of onlookers has gathered right outside the doorway.',
      contextHint: 'Falling glass and thermal hazards make the immediate building perimeter hazardous.',
      choices: [
        {
          id: 'fire-c5-clear-perimeter',
          label: 'Move immediately away from the building exterior to the designated assembly area across the road, well clear of falling debris.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'You cross the access road to the open lawn area. Moments later, a shattered window pane from the 4th floor crashes onto the pathway you just vacated.',
          insight:
            'After escaping a burning building, move immediately to a designated assembly area far away from structures. Falling glass, burning debris, and collapsing facade elements pose severe ground hazards.',
          insightSource: 'NDMA Evacuation Safety Standards',
          nextNodeId: 'fire-d6-emergency-call',
        },
        {
          id: 'fire-c5-linger-entrance',
          label: 'Stop directly outside the main glass entrance doors to search your pockets for car keys and personal belongings.',
          isCorrect: false,
          scoreImpact: -20,
          consequenceText:
            'A falling fragment of shattered glass strikes the pavement inches from your feet. Arriving emergency personnel push you back urgently to clear access for fire hoses.',
          insight:
            'Never linger near building entrances during an active fire. Keep doorways completely clear for arriving emergency responders and escaping occupants.',
          insightSource: 'NDMA Fire Response Guidelines',
          nextNodeId: 'fire-d6-emergency-call',
        },
        {
          id: 'fire-c5-reenter-belongings',
          label: 'Turn back toward the lobby to retrieve important documents left in your ground-floor mailbox.',
          isCorrect: false,
          scoreImpact: -30,
          consequenceText:
            'You attempt to re-enter, but a wall of hot black smoke surges through the lobby entrance. A firefighter catches your arm and pulls you back firmly, reprimanding you.',
          insight:
            'Never re-enter a burning building under any circumstances. Material possessions can be replaced; fire conditions deteriorate with extreme, unpredictable speed.',
          insightSource: 'NDMA Life-Safety Rules',
          nextNodeId: 'fire-d6-emergency-call',
        },
      ],
    },

    // NODE 6: Emergency Communication & Accurate Reporting
    'fire-d6-emergency-call': {
      id: 'fire-d6-emergency-call',
      type: 'decision',
      situationText:
        'You are safely at the assembly perimeter. The local fire department has not yet arrived on scene. You take out your mobile phone to contact emergency services.',
      contextHint: 'Providing structured, actionable information ensures rapid emergency response.',
      choices: [
        {
          id: 'fire-c6-call-112-structured',
          label: 'Dial 112 (Emergency Response Support System), clearly stating the exact building address, floor of the fire, whether occupants are trapped, and the nearest landmark.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'The 112 ERSS dispatcher logs the precise location, confirms fire tender dispatch, and relays details of trapped upper-floor occupants directly to the inbound fire crew.',
          insight:
            'When calling 112 ERSS during a fire, provide exact building details, floor location, presence of trapped individuals, and access landmarks to optimize response deployment.',
          insightSource: '112 ERSS Emergency Protocol',
          nextNodeId: 'fire-d7-assembly-accountability',
        },
        {
          id: 'fire-c6-post-social-media',
          label: 'Open a social media app to livestream the flames and ask followers if anyone has called the fire department.',
          isCorrect: false,
          scoreImpact: -25,
          consequenceText:
            'Streaming wastes critical minutes. Bystanders assume someone else called 112, delaying official response dispatch while the fire spreads to adjacent apartments.',
          insight:
            'Never rely on social media during a life-threatening crisis. Direct telephone communication to 112 ERSS is the only verified method to trigger immediate emergency service dispatch.',
          insightSource: 'NDMA & 112 ERSS Advisory',
          nextNodeId: 'fire-d7-assembly-accountability',
        },
      ],
    },

    // NODE 7: Assembly Area & Rescuer Accountability
    'fire-d7-assembly-accountability': {
      id: 'fire-d7-assembly-accountability',
      type: 'decision',
      situationText:
        'Sirens wail as three fire tenders pull up to the building. Firefighters begin laying hose lines. The incident commander is setting up a command post near the entrance gate.',
      contextHint: 'Coordination and roll-call assist emergency responders in rescue targeting.',
      choices: [
        {
          id: 'fire-c7-report-commander',
          label: 'Approach the Incident Commander calmly, confirm your identity and flat number, and report any neighbors you know were still inside.',
          isCorrect: true,
          scoreImpact: 20,
          consequenceText:
            'Your concise report gives the search-and-rescue team immediate operational intelligence, allowing them to target specific flats rather than conducting a blind search.',
          insight:
            'At the assembly area, report immediately to emergency personnel. Provide factual information about missing or trapped occupants to direct life-saving search operations.',
          insightSource: 'NDMA Emergency Management Standard',
          nextNodeId: 'fire-outcome-node',
        },
        {
          id: 'fire-c7-wander-off',
          label: 'Leave the assembly area without telling anyone to walk to a 24-hour tea stall down the street.',
          isCorrect: false,
          scoreImpact: -15,
          consequenceText:
            'Unaccounted for on the resident list, firefighters risk their lives re-entering your building section to search for you, diverting resources away from real danger zones.',
          insight:
            'Always stay at the designated assembly point until roll call is completed. Unaccounted-for occupants lead firefighters to conduct high-risk search operations unnecessarily.',
          insightSource: 'NDMA Incident Command Guidelines',
          nextNodeId: 'fire-outcome-node',
        },
      ],
    },

    // FINAL OUTCOME NODE
    'fire-outcome-node': {
      id: 'fire-outcome-node',
      type: 'outcome',
      survived: true,
      narrativeText:
        'You have successfully evacuated the structure fire and assisted emergency response personnel at the assembly area. 112 ERSS fire units have contained the blaze and secured the building.',
      nextNodeId: 'fire-report-node',
    },
  },
};