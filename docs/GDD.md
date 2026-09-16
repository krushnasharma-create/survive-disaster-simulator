# GDD — Game Design Document
## SURVIVE: Disaster Response Simulator

**Version:** 0.1 — Foundation
**Last Updated:** 2026-09-16
**Status:** Design (Pre-implementation)

---

## 1. Game Vision

SURVIVE puts the player inside a real disaster. Every decision they make has a consequence. The goal is not to entertain with spectacle but to build genuine instinct and preparedness knowledge through visceral, time-pressured decision-making.

The player should finish each scenario knowing not just what the "right answers" were, but *why* — because they felt the consequences of their choices.

---

## 2. Target Experience

| Dimension | Target |
|---|---|
| **Platform** | Browser (desktop-first, mobile-friendly) |
| **Session length** | 10-20 minutes per disaster |
| **Tone** | Serious, cinematic, atmospheric |
| **Emotional arc** | Tension → urgency → consequence → reflection |
| **Learning outcome** | Player retains 3-5 key preparedness actions per disaster |
| **Replayability** | High — branching consequences reward replaying with better decisions |

---

## 3. Gameplay Loop

```
GAME INTRO (cinematic, first time only)
      |
DISASTER SELECTION SCREEN
(Earthquake / Fire / Flood)
      |
CINEMATIC DISASTER INTRO
(Story setup — atmosphere, character, place)
      |
SITUATION → DECISION PHASE
  [Situation narrative]
  [Time-pressured decision (2-4 options)]
  [Decision → Consequence]
  [New situation (informed by decision)]
  [Repeat — 4-7 decision points per path]
      |
OUTCOME SCREEN
(Did you survive? What happened?)
      |
PREPAREDNESS SCORE + REPORT
(Per-decision breakdown + learning summary)
      |
PLAY AGAIN (same or different disaster)
```

---

## 4. Initial Disaster Scope

### 4.1 Earthquake
- **Setting:** Urban apartment building, daytime
- **Opening:** Ground begins to shake without warning
- **Key preparedness themes:** Drop/Cover/Hold On, safe vs. unsafe locations, aftershock readiness, gas leak awareness, evacuation timing, communication plan
- **Decision count:** 5-6 branching decision points

### 4.2 Fire
- **Setting:** Residential home, night
- **Opening:** Smoke alarm sounds while family is asleep
- **Key preparedness themes:** Escape routes, staying low, door-check before opening, meeting point, calling 112 (India Emergency Response Support System), never re-entering a burning building
- **Decision count:** 5-6 branching decision points

### 4.3 Flood
- **Setting:** Suburban neighborhood, extreme rainfall / flash flood warning
- **Opening:** Emergency alert received on phone while at home
- **Key preparedness themes:** Vertical evacuation vs. horizontal, never driving through flood water, emergency kit, shelter-in-place vs. evacuate decision, communication
- **Decision count:** 5-6 branching decision points

---

## 5. Player Progression

There is no persistent account-level progression for the hackathon MVP.

Within a single session:
- Player accumulates a **Preparedness Score** (0-100) from decision quality
- Score feeds into a final **Preparedness Report**
- Report shows per-decision feedback and 3-5 key learning takeaways

Optional (post-MVP): persistent login, score history, leaderboard.

---

## 6. Scenario Structure

Each scenario is a **directed acyclic graph (DAG)** of nodes.

```
Node Types:
  INTRO       — cinematic/narrative only, no decision
  DECISION    — presents situation + player choices
  CONSEQUENCE — shows result of choice, narrative feedback
  BRANCH      — selects the next node based on prior decisions
  OUTCOME     — end-of-disaster resolution (survived / partial / critical)
  REPORT      — preparedness score + learning summary
```

Each DECISION node has:
- `situationText` — narrative description of what is happening
- `contextHint` (optional) — brief environmental detail or sensory cue
- `choices[]` — 2-4 player options
  - `label` — choice text (action-oriented, first person)
  - `scoreImpact` — points added/subtracted
  - `isCorrect` — boolean (used for feedback)
  - `consequenceText` — what immediately happens as a result
  - `nextNodeId` — where the scenario continues
- `timeLimit` (optional) — seconds before the default option auto-activates

---

## 7. Decision System Concept

- Decisions are presented as **action choices**, not quiz answers
- Language is always first-person, present-tense, active: "Run to the stairwell" not "The correct action is to use the stairs"
- **2-4 options per decision** — never just 2 if more realistic options exist
- Some decisions may have a **time limit** (countdown timer)
- The "best" option is not always obvious — this mirrors real emergencies
- Partially correct choices should have intermediate consequences, not binary good/bad
- One option per scenario may be a *common misconception* (e.g. using elevator during earthquake) — this is explicitly taught through consequence

---

## 8. Consequence System Concept

- Consequences are **narrative, not lecture** — the player experiences what happens
- After experiencing the consequence, a brief **preparedness insight** (1-2 sentences) is shown with its source. Sources follow this priority order:
  1. **Primary:** NDMA (National Disaster Management Authority, India), SACHET portal, or India's 112 ERSS guidelines
  2. **Supplementary:** FEMA or Red Cross — only when no equivalent Indian guidance exists and the guidance is universally applicable
- Consequences affect the **next situation** — a poor choice in node 2 may create a harder situation in node 3
- A "wrong" choice should not immediately end the game unless genuinely fatal
- Fatal choices (e.g. re-entering a burning building, driving through a flooded road) may end the scenario early with a specific outcome screen

---

## 9. Scoring Concept

| Metric | Weight |
|---|---|
| Decision quality (correct / partial / incorrect) | 70% |
| Speed bonus (timed decision answered quickly) | 10% |
| Survival outcome | 20% |

**Score bands:**
| Score | Label |
|---|---|
| 85-100 | Ready to Respond |
| 65-84 | Good Awareness |
| 40-64 | Needs Preparation |
| 0-39 | Critically Unprepared |

Score is calculated at the end of the scenario, not revealed decision by decision, to preserve tension.

---

## 10. Preparedness Report Concept

Displayed after each completed scenario:

1. **Survival outcome** — brief narrative of what happened
2. **Preparedness score** — score band + numeric
3. **Decision replay** — each decision, the player's choice, and a brief explanation of the ideal choice and why
4. **3-5 Key Takeaways** — actionable, sourced preparedness tips from the scenario
5. **Next disaster prompt** — encourage the player to try another disaster

---

## 11. Cinematic Experience Requirements

- **Game intro:** full-screen cinematic opening sequence on first launch. Dramatic typography, atmospheric visuals.
- **Disaster intro:** per-disaster cinematic intro establishing setting, character, atmosphere.
- **Transitions:** dramatic, intentional — no default browser transitions. Crossfade, zoom, or typewriter effects for text.
- **Typography:** large, strong, intentionally chosen. Not generic sans-serif at 16px.
- **Color palette:** disaster-specific.
  - Earthquake = grays, dust, fractured concrete palette
  - Fire = deep orange, smoke, black
  - Flood = deep teal, murky, emergency blue
- **Countdown timer UI:** visible, tension-building, creates urgency.
- **Audio (optional / post-MVP):** ambient disaster soundscapes, tension music, UI audio feedback.

---

## 12. MVP vs Optional Features

### MVP (Required for Hackathon)
- [ ] Cinematic game intro
- [ ] Disaster selection screen (3 disasters)
- [ ] Per-disaster cinematic intro
- [ ] Scenario engine (node traversal, decision/consequence)
- [ ] Earthquake scenario (full, branching)
- [ ] Fire scenario (full, branching)
- [ ] Flood scenario (full, branching)
- [ ] Decision timer (at least on 1 node per scenario)
- [ ] Preparedness score calculation
- [ ] Preparedness report screen
- [ ] Replay / select another disaster

### Optional (If Time Permits)
- [ ] User login / profile
- [ ] Score persistence / history
- [ ] Leaderboard
- [ ] A fourth disaster scenario
- [ ] AI-generated adaptive narration
- [ ] Ambient audio / soundscapes
- [ ] Mobile-optimised layout
- [ ] Animated environmental particle effects
- [ ] Share score (social)
