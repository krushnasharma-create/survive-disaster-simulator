# PROJECT_STATE.md — SURVIVE: Disaster Response Simulator

> This file describes the ACTUAL current state of the repository.
> It must be updated after every meaningful implementation task.
> Never claim a feature exists unless it is implemented and verified.

---

## Current Phase

**PHASE 9.5 — GAME FEEL / CINEMATIC JUICE PASS** (Implemented & Verified — Clean Build & Browser Verified)

---

## Repository Status

| Item | Status |
|---|---|
| Git repository | Initialized, clean working tree |
| Remote | https://github.com/krushnasharma-create/survive-disaster-simulator.git |
| Branch | main |
| Application code | ✅ 7 complete playable disaster scenarios with enhanced cinematic game feel: zero-dependency procedural Web Audio API sound effects (hover ticks, select clicks, screen transitions, urgent timer pulse, disaster choice impact thud/whoosh/surge, and consequence reveal chimes); interactive choice commitment latching with 'ACTION COMMITTED' visual badge; staggered consequence reveal hierarchy; environmental dust motes, heat distortion, and water shimmer VFX; exact scenario replay; full English + Roman Hinglish localization across all shared gameplay UI and 7 scenario graphs |
| Build system | ✅ Vite + React 18 + TypeScript (strict) |
| Dependencies installed | ✅ react-router-dom, zustand, framer-motion |
| TypeScript errors | ✅ 0 errors |
| Build status | ✅ Passes (`npm run build` — 486 modules, 0 errors in 277ms) |
| Master visual language | ✅ Dark, cinematic, HUD-inspired aesthetic strictly preserved across all screens |

---

## Completed Work

### Phase 1 — Foundation
- [x] `AGENTS.md` — Master context file for all coding agents
- [x] `docs/GDD.md` — Full game design specification (India 112 ERSS & NDMA aligned)
- [x] `docs/ARCHITECTURE.md` — Technical architecture and data models
- [x] `docs/DECISIONS.md` — Architectural decision log (DEC-001 through DEC-008)
- [x] `docs/PROJECT_STATE.md` — Living project state tracking
- [x] `docs/CHANGELOG.md` — Detailed change history
- [x] Milestone commit: `feat: initialize game foundation` (`b4d34ce`)

### Phase 2 — Shell
- [x] Vite + React 18 + TypeScript (strict mode) application scaffold
- [x] Global design tokens and animations in CSS custom properties
- [x] Disaster-specific atmospheric themes (`earthquake.css`, `fire.css`, `flood.css`)
- [x] Milestone commit: `feat: implement cinematic game shell` (`71d70c7`)

### Phase 3 — Scenario Engine & Earthquake Vertical Slice
- [x] Scenario Engine (`scenarioRunner.ts`, `scoreCalculator.ts`, `reportBuilder.ts`)
- [x] Playable Earthquake Vertical Slice (`src/data/earthquake.ts`) with 8 branching decision nodes, timer expiry, NDMA safety protocol insights, and prepared report
- [x] Milestone commit: `feat: add earthquake disaster simulation` (`c5e6324`)

### Phase 4 — Core Game Structure & Scenario Foundations
- [x] **Cinematic Main Menu (`IntroScreen.tsx`):**
  - Atmospheric opening screen with emergency alert badge, massive typography, official tagline ("Your decisions determine what happens next.")
  - Primary action: "Enter Simulation" $\to$ `/select`
  - Secondary actions: "How to Play" $\to$ `/how-to-play`, and in-theme "Settings" modal (visual tremors, high-contrast HUD, reset progress)
- [x] **How to Play Screen (`HowToPlayScreen.tsx`):**
  - Dedicated briefing screen explaining pressure, time-critical decisions, branching consequences, and preparedness scoring
  - Step-by-step Core Simulation Loop diagram: `SCENARIO → DECISION → CONSEQUENCE → NEXT SITUATION → SCORE`
- [x] **Enhanced Disaster Selection Console (`DisasterSelect.tsx`):**
  - Simulation terminal with scenario codes (`SCN-EQ-01`, `SCN-FR-02`, `SCN-FL-03`)
  - Earthquake marked as `● PLAYABLE` (launches existing complete Earthquake slice)
  - Fire and Flood marked as `○ IN DEVELOPMENT` with in-theme toast notice on selection
- [x] **Fire & Flood Scenario Foundations (`src/data/fire.ts`, `src/data/flood.ts`):**
  - Structured DAGs grounded in NDMA protocols, exported in `src/data/index.ts`.

### Phase 5 — Timed Decisions, Answer Randomization & English/Hinglish Mode
- [x] **15-Second Timed Decisions:**
  - All timed nodes (`eq-d1-shake`, `eq-d4-aftershock`, `fire-d1-alarm`, `flood-d1-warning`) standardized to a 15-second countdown limit.
- [x] **Dedicated Time Expired / Simulation Failed Screen:**
  - When time expires, does NOT auto-select choices or reveal answers.
  - Immediately transitions to a dedicated failure state with `RETRY SCENARIO` and `RETURN TO SELECTION`.
- [x] **Answer Choice Randomization:**
  - Shuffles choice presentation order using Fisher-Yates algorithm memoized by `[decisionNode.id, language]`.
  - Avoids option-1 positional bias while keeping internal choice IDs and scoring intact.
  - Stable during countdown ticks to prevent re-render jitter.
  - Preserves identical styling across all unselected choices (no answer leakage).
- [x] **English / Hinglish Localization System:**
  - Complete `src/i18n/` localization system with session-persisted language toggle in HUD.
  - Natural Roman Hindi + technical terminology for all 9 Earthquake nodes, hints, choices, consequences, insights, takeaways, and helplines.
  - Localized UI across Main Menu, How to Play, Disaster Selection, Scenario HUD, Consequence, Outcome, and Preparedness Report.

### Phase 6 — Fire Disaster Scenario Vertical Slice
- [x] **Full Fire Scenario DAG (`src/data/fire.ts`):**
  - Complete 8-decision scenario with 10 total nodes (`fire-d1-alarm` to `fire-outcome-node`).
  - 2 timed 15-second nodes (`fire-d1-alarm` door heat evaluation and `fire-d4-external-escape` fire escape congestion).
  - 2 distinct branching paths (`fire-d2b-smoke-room` for room seal vs. corridor crawl, and `fire-d3-staircase-block` to `fire-d4-external-escape` or `fire-d4b-window-signal`).
  - Safety grounding in NDMA Fire Safety Guidelines and 112 ERSS emergency reporting protocols.
- [x] **Roman Hinglish Localization (`src/i18n/fire.ts` & `src/i18n/index.ts`):**
  - Full natural Roman Hindi translations for all 10 nodes, 20 choices, consequence outcomes, and official NDMA insights.
  - Dedicated `FIRE_HINGLISH_TAKEAWAYS` array exported for bilingual preparedness report.
- [x] **Dynamic Preparedness Report & Takeaways (`src/engine/reportBuilder.ts` & `src/screens/ReportScreen.tsx`):**
  - Added `FIRE_TAKEAWAYS` and 101 Fire Emergency Service helpline in `reportBuilder.ts`.
  - `ReportScreen` dynamically detects fire decisions and displays disaster-appropriate takeaways in both English and Hinglish.
- [x] **Playable Selection Activation (`src/screens/DisasterSelect.tsx`):**
  - Marked Structure Fire as `● PLAYABLE` in the Disaster Selection Console.
- [x] **Bugfixes & Quality Assurance:**
  - Fixed unconditional hook ordering in `DisasterIntro.tsx`.
  - Zero lint errors, zero build errors.

---

### Phase 7 — Flood Disaster Scenario Vertical Slice
- [x] **Full Flood Scenario DAG (`src/data/flood.ts`):**
  - Complete 8-decision scenario with 9 total nodes (`flood-d1-warning` through `flood-outcome-node`).
  - 2 timed 15-second nodes (`flood-d1-warning` utility isolation and `flood-d4-route-hazard` street crossing hazard).
  - 2 distinct branching paths:
    - Path 1: Elevated vertical refuge (`flood-d2-rising-water`) vs. delayed utility hazard (`flood-d2b-delayed-utility`).
    - Path 2: Safe indoor shelter (`flood-d5-emergency-comm`) vs. rooftop exposure triage (`flood-d6-stranded-rooftop`).
  - Strict grounding in NDMA Urban Flood Management, Central Water Commission (CWC), and 112 ERSS protocols.
- [x] **Roman Hinglish Localization (`src/i18n/flood.ts` & `src/i18n/index.ts`):**
  - Full natural Roman Hindi translations for all 9 nodes, 18 choices, consequence outcomes, and official NDMA/CWC insights.
  - Dedicated `FLOOD_HINGLISH_TAKEAWAYS` array exported for bilingual preparedness report.
- [x] **Dynamic Preparedness Report & Takeaways (`src/engine/reportBuilder.ts` & `src/screens/ReportScreen.tsx`):**
  - Added official `FLOOD_TAKEAWAYS` and 101/1078 emergency helplines in `reportBuilder.ts`.
  - `ReportScreen` dynamically detects flood decisions and displays disaster-appropriate takeaways in both English and Hinglish.
- [x] **Playable Selection Activation (`src/screens/DisasterSelect.tsx`):**
  - Marked Flash Flood as `● PLAYABLE` in the Disaster Selection Console.
- [x] **Comprehensive Quality Assurance:**
  - Zero TypeScript errors (`npm run build` passes in 255ms).
  - Zero lint errors (`npm run lint`).
  - Zero whitespace/formatting warnings (`git diff --check`).
  - Complete non-breaking regression verification for Earthquake and Fire scenarios.

### Phase 7A–7C — Multi-Scenario Architecture, Selection Layer & Environmental Immersion
- [x] **Backward-Compatible Scenario Architecture (`src/data/types.ts` & `src/data/index.ts`):**
  - Extended data model with `EnvironmentEvent`, `HistoricalMetadata`, and `ScenarioCatalogueItem`.
  - Added `SCENARIO_CATALOGUE` manifest mapping disasters to Modern Urban (Playable) and authentic Historical Incidents (locked as Coming Next).
  - Maintained complete backward compatibility in `SCENARIOS` mapping aliases for `earthquake`, `fire`, and `flood` with zero duplicate graph bloat.
- [x] **Scenario Selection Layer (`src/screens/ScenarioSelectScreen.tsx` & `.module.css`):**
  - Integrated `/disaster/:disasterId/scenarios` route with cinematic 2-column console.
  - Modern Urban scenarios launch playable vertical slices; Historical simulations display date/location metadata and a non-blocking in-theme notice toast.
- [x] **Reusable Environmental Event Overlay (`src/components/EnvironmentalOverlay.tsx` & `.module.css`):**
  - Pure CSS/SVG, `pointer-events: none`, `contain: strict` overlay reacting to active countdown and scenario event triggers.
  - Earthquake: subtle vibration, branching structural fracture cracks around 5s, intense tremor in final seconds.
  - Fire: ambient heat flicker, descending smoke ceiling around 8s, heat pulse around 5s.
  - Flood: dynamic water overlay rising from low to high crest around 8s, rapid current stream lines around 5s.
  - Raised HUD and decision card to `z-index: 10` ensuring 100% clickability and readability.
- [x] **Localization:**
  - Added shared UI strings for English and Roman Hinglish in `src/i18n/types.ts` and `src/i18n/ui.ts`.

### Phase 7D — Multi-Scenario Modern Gameplay
- [x] **New Modern Scenarios (English + Roman Hinglish):**
  - `src/data/earthquakeWorkplace.ts`: High-rise tech park office earthquake scenario with drop/cover/hold under heavy conference tables, glass curtain-wall hazards, pressurized stairwells, stampede prevention, and NDMA assembly triage.
  - `src/data/fireCommercial.ts`: Commercial shopping complex & food court fire scenario with manual pull alarm, smoke crawl under toxic polymer combustion fumes, crowd triage at secondary fire exit, and self-closing fire door isolation.
  - `src/data/floodStreet.ts`: Arterial ring road monsoon flash flood & commute scenario with "Turn Around, Don't Drown" underpass avoidance, headrest window punch for sinking vehicles, energized downed line detours, bamboo stick probing for displaced manholes, and antiseptic hygiene.
- [x] **Scenario Registry & State Management:**
  - Registered all 3 new scenarios in `SCENARIOS` and `SCENARIO_CATALOGUE` (`src/data/index.ts`) as active playable modern scenarios.
  - Preserved strict locked / "COMING NEXT" status for historical scenarios (`earthquake-bhuj-2001`, `fire-uphaar-1997`, `flood-mumbai-2005`). Zero fake scenario graphs.
  - Updated `gameStore` with `activeScenarioId` tracking and `selectScenario` action.
  - Updated `ScenarioScreen` and `DisasterIntro` to resolve both disaster defaults and specific scenario graphs seamlessly.
- [x] **Full Bilingual Support:**
  - Localized `earthquakeWorkplaceHinglish`, `fireCommercialHinglish`, and `floodStreetHinglish` registered in `HINGLISH_SCENARIOS` (`src/i18n/index.ts`).
- [x] **Responsive Scenario Selection Grid:**
  - Refined `ScenarioSelectScreen.module.css` grid layout (`repeat(auto-fit, minmax(290px, 1fr))` with 1050px max width) for balanced 3-card presentation.

### Phase 9 — Judge-Ready UX Polish & Consequence-Driven USP
- [x] **P0-1 — Replay Exact Scenario Context (`src/screens/ReportScreen.tsx`):**
  - Preserves `activeScenarioId` during replay navigation via `?scenario=${activeScenarioId}`.
  - Verified: Replaying Bhuj 2001 lands on Bhuj 2001, not the default Urban scenario.
- [x] **P0-2 — Consequence Chain UX (`src/screens/ConsequenceScreen.tsx` & `.module.css`):**
  - Restructured decision feedback into a clear emergency sequence: `YOUR ACTION → CONSEQUENCE / NEW RISK → SAFER RESPONSE (NDMA) → PROTOCOL GROUNDING`.
  - Displays the player's actual chosen option prominently above the consequence narrative.
- [x] **P0-3 — Safer Response Learning Feedback (`src/screens/ConsequenceScreen.tsx`, `ScenarioScreen.tsx`, `gameStore.ts`):**
  - For suboptimal choices, dynamically displays the NDMA-aligned safer alternative directly from deterministic scenario data (`optimalChoiceLabel`).
  - Zero safety instruction hallucination, zero LLM dependencies.
- [x] **P0-4 — Environmental Atmosphere (`src/components/EnvironmentalOverlay.tsx` & `.module.css`, `ScenarioScreen.tsx`):**
  - Enabled continuous subtle environmental immersion across all decision nodes (`active={true}`).
  - Added non-distracting passive micro-rumble for untimed earthquake nodes and continuous background glow/water layers.
  - Zero pointer-events interference, controls remain 100% clickable.
- [x] **P1-1 — Truthful Outcome Screen (`src/screens/OutcomeScreen.tsx` & `.module.css`):**
  - Replaced hardcoded "Survived — Evacuated" success framing with dynamic evaluation of `currentOutcome.survived`.
  - Suboptimal outcomes render warning status (`⚠️ Critical Incident`), amber accents, and path-specific narrative.
- [x] **P1-2 — Score Visual Polish (`src/screens/ReportScreen.tsx`):**
  - Dynamically colors the final score value and band based on actual performance (Green for Ready to Respond $\ge 85$, Amber/Orange for intermediate, Red for Critically Unprepared $<40$).
  - Prevents poor scores from visually appearing safe.
- [x] **P1-3 — Complete Roman Hinglish UI (`src/i18n/types.ts`, `src/i18n/ui.ts`, `DisasterIntro.tsx`, `CountdownTimer.tsx`):**
  - Added localized strings for "Enter Scenario" (`Scenario Mein Pravaish Karein`) and "Decide Now" (`Abhi Faisla Karein`).
  - Preserved session language across full simulation restarts in `gameStore.ts`.

### Phase 9.5 — Game Feel & Cinematic Juice Pass
- [x] **Zero-Dependency Procedural Web Audio API Engine (`src/utils/audio.ts`):**
  - Synthesizes all audio in real time using native browser oscillators, filters, white-noise buffers, and master compression. Zero external asset weight or latency.
  - Fully autoplay-compliant; initializes and unlocks only upon genuine user interactions.
  - Implemented crisp sound effects: UI hover micro-clicks, button confirmations, screen transitions, urgent timer ticking ($\le 5$s), timeout buzzer, disaster-specific impact thud/whoosh/surge, and consequence reveal chimes (harmonic major triad for correct, dissonant chord for risk).
- [x] **Choice Commitment Latch (`src/components/DecisionPanel.tsx` & `.module.css`):**
  - Instantly locks selected choice upon click, dims other options, displays an "ACTION COMMITTED" indicator badge, and plays the disaster impact SFX.
  - 150ms tactile latch delay gives players immediate confirmation that their action is registered before the consequence transition.
- [x] **Staggered Consequence Reveal (`src/screens/ConsequenceScreen.tsx`):**
  - Replaced jarring static renders with a sequential 4-beat crisis reveal: Status Header $\to$ Your Action $\to$ Consequence / New Risk $\to$ Safer Response / Protocol Grounding $\to$ Continue Action.
  - Synchronized with procedural harmonic/dissonant consequence audio feedback.
- [x] **Atmospheric Environmental Overlays (`src/components/EnvironmentalOverlay.tsx` & `.module.css`):**
  - Added floating dust motes for earthquake, radial heat shimmering for fire, and undulating water reflections for flood.
  - Preserved `pointer-events: none` and `contain: strict` to ensure 0 input blocking and 60 FPS performance.
  - Full support for `prefers-reduced-motion: reduce`.

---

## Current Task

Phase 9.5 Game Feel & Cinematic Juice Pass completed and verified in Google Chrome.

---

## Next Task

**PHASE 10 — HACKATHON DEMO & PRESENTATION READINESS**
1. Rehearsal of live demo script focusing on core USP (action $\to$ consequence $\to$ safer response).
2. Final review of pitch points grounded in NDMA India and 112 ERSS.

---

## Known Issues

- None blocking. All 7 scenarios, replay flows, timer resets, and bilingual UI are fully verified in headless Chrome.

---

## Important Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Master context for all coding agents — READ FIRST |
| `docs/GDD.md` | Game design specification |
| `docs/ARCHITECTURE.md` | Technical architecture and stack decisions |
| `docs/PROJECT_STATE.md` | This file — current state |
| `docs/CHANGELOG.md` | Change history |
| `src/screens/IntroScreen.tsx` | Cinematic Main Menu screen |
| `src/screens/HowToPlayScreen.tsx` | How to Play briefing screen |
| `src/screens/DisasterSelect.tsx` | Disaster Selection Console |
| `src/data/earthquake.ts` | Completed Earthquake scenario vertical slice |
| `src/data/fire.ts` | Completed Fire scenario vertical slice |
| `src/data/flood.ts` | Completed Flood scenario vertical slice |
| `src/engine/scenarioRunner.ts` | Deterministic node traversal & choice evaluation |
| `src/engine/scoreCalculator.ts` | Preparedness score calculation |
| `src/engine/reportBuilder.ts` | Preparedness report assembly |