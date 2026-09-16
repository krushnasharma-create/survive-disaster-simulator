# CHANGELOG.md — SURVIVE: Disaster Response Simulator

All meaningful changes to this project are documented here.
Format: `[YYYY-MM-DD] [Phase] — Description`

## [2026-09-16] PHASE 7D — Multi-Scenario Modern Gameplay (6 Playable Scenarios)
- **Three New Playable Modern Scenarios Authored:**
  - **Earthquake Workplace (`src/data/earthquakeWorkplace.ts`):** High-rise tech park office setting (7th floor). Features 5 decision nodes (`eqw-d1-tremor` through `eqw-d5-assembly-communication`), 15s timed decisions, heavy conference table Drop/Cover/Hold, avoiding falling glass facade hazards, stairwell stampede prevention, and NDMA assembly triage.
  - **Commercial Building Fire (`src/data/fireCommercial.ts`):** Shopping complex & food court setting (3rd floor). Features 5 decision nodes (`frc-d1-alarm-discovery` through `frc-d5-emergency-call-coordination`), 15s timed decisions, manual pull station activation, low crawl under toxic polymer combustion fumes, crowd triage at secondary fire exit, and self-closing fire door isolation.
  - **Urban Transit & Street Flash Flood (`src/data/floodStreet.ts`):** Arterial ring road underpass setting. Features 5 decision nodes (`fls-d1-submerged-underpass` through `fls-d5-shelter-hygiene`), 15s timed decisions, NDMA "Turn Around, Don't Drown" underpass avoidance, headrest steel prong window punch for sinking cars, energized downed power line avoidance, bamboo pole probing for missing stormwater manholes, and post-flood hygiene.
- **Scenario Catalogue & State Management:**
  - Registered new scenarios in `src/data/index.ts` under `SCENARIO_CATALOGUE` with `status: 'playable'`.
  - Added `activeScenarioId` state and `selectScenario(scenarioId, disaster)` action to `src/store/gameStore.ts`.
  - Updated `ScenarioScreen` and `DisasterIntro` to seamlessly resolve specific scenario graphs (`earthquake-workplace`, `fire-commercial`, `flood-street`) with fallback to primary disaster IDs.
  - Maintained strictly locked status ("COMING NEXT") for all historical scenarios (`earthquake-bhuj-2001`, `fire-uphaar-1997`, `flood-mumbai-2005`). Zero fake scenario graphs.
- **Full Bilingual Localization (English + Natural Roman Hinglish):**
  - Created `src/i18n/earthquakeWorkplace.ts`, `src/i18n/fireCommercial.ts`, and `src/i18n/floodStreet.ts` with natural conversational Roman Hinglish translations for all nodes, choices, consequences, and NDMA insights.
  - Registered all new localizations in `src/i18n/index.ts` within `HINGLISH_SCENARIOS`.
- **Preparedness Reporting:**
  - Updated `src/engine/reportBuilder.ts` and `src/screens/ReportScreen.tsx` prefix routing to detect `eqw-`, `frc-`, and `fls-` node IDs, ensuring accurate disaster takeaway selection.
- **UI & Grid Presentation:**
  - Updated `ScenarioSelectScreen.module.css` grid template (`repeat(auto-fit, minmax(290px, 1fr))` with 1050px max width) for responsive 3-card layout across desktop and mobile.
- **Quality Assurance:**
  - Verified 0 TypeScript errors (`npm run build` passes in 280ms).
  - Verified 0 lint errors (`npm run lint`).
  - Verified clean diff (`git diff --check`).

---

## [2026-09-16] PHASE 7A–7C — Multi-Scenario Architecture, Selection Layer & Environmental Immersion
- **Backward-Compatible Scenario Architecture (`src/data/types.ts` & `src/data/index.ts`):**
  - Extended data model with `EnvironmentEvent`, `HistoricalMetadata`, and `ScenarioCatalogueItem`.
  - Added `SCENARIO_CATALOGUE` manifest mapping disasters to Modern Urban (Playable) and authentic Historical Incidents (locked as Coming Next).
  - Maintained complete backward compatibility in `SCENARIOS` mapping aliases for `earthquake`, `fire`, and `flood` with zero duplicate graph bloat.
- **Scenario Selection Console (`src/screens/ScenarioSelectScreen.tsx` & `.module.css`):**
  - Integrated `/disaster/:disasterId/scenarios` route with cinematic 2-column console.
  - Modern Urban scenarios launch playable vertical slices; Historical simulations display date/location metadata and a non-blocking in-theme notice toast.
- **Reusable Environmental Event Overlay (`src/components/EnvironmentalOverlay.tsx` & `.module.css`):**
  - Pure CSS/SVG, `pointer-events: none`, `contain: strict` overlay reacting to active countdown and scenario event triggers.
  - Earthquake: subtle vibration, branching structural fracture cracks around 5s, intense tremor in final seconds.
  - Fire: ambient heat flicker, descending smoke ceiling around 8s, heat pulse around 5s.
  - Flood: dynamic water overlay rising from low to high crest around 8s, rapid current stream lines around 5s.
  - Raised HUD and decision card to `z-index: 10` ensuring 100% clickability and readability.
- **Localization:**
  - Added shared UI strings for English and Roman Hinglish in `src/i18n/types.ts` and `src/i18n/ui.ts`.
- **Quality Assurance & Traversal:**
  - Verified 0 TypeScript errors (`npm run build` passes in 289ms).
  - Verified 0 lint errors (`npm run lint`).
  - Verified clean diff (`git diff --check`).

---

## [2026-09-16] PHASE 7 — Flood Disaster Scenario Vertical Slice
- **Playable Flash Flood Disaster Scenario (`src/data/flood.ts`):**
  - Authored a complete 8-decision scenario with 9 total nodes (`flood-d1-warning` through `flood-outcome-node`).
  - Implemented 2 timed 15-second decisions (`flood-d1-warning` utility isolation and `flood-d4-route-hazard` street crossing hazard).
  - Authored 2 distinct branching paths:
    - Path 1: Elevated vertical refuge (`flood-d2-rising-water`) vs. delayed utility hazard (`flood-d2b-delayed-utility`).
    - Path 2: Safe indoor shelter (`flood-d5-emergency-comm`) vs. rooftop exposure triage (`flood-d6-stranded-rooftop`).
  - Grounded all choices, consequences, and insights strictly in NDMA Urban Flood Management, Central Water Commission (CWC), and 112 ERSS emergency communication protocols.
- **Natural Roman Hinglish Localization (`src/i18n/flood.ts` & `src/i18n/index.ts`):**
  - Fully translated all 9 nodes, 18 choices, consequence evaluations, and official insights into natural conversational Hinglish.
  - Added dedicated `FLOOD_HINGLISH_TAKEAWAYS` for bilingual preparedness reports.
- **Dynamic Preparedness Reporting (`src/engine/reportBuilder.ts` & `src/screens/ReportScreen.tsx`):**
  - Added official `FLOOD_TAKEAWAYS` to `reportBuilder.ts`.
  - Updated `ReportScreen` to render disaster-specific takeaways matching the scenario played in both English and Hinglish.
- **Disaster Selection Console (`src/screens/DisasterSelect.tsx`):**
  - Promoted Flash Flood scenario status from `development` to `playable`.
- **Quality Assurance & Traversal:**
  - Verified 0 TypeScript errors (`npm run build` passes in 255ms).
  - Verified 0 lint errors (`npm run lint`).
  - Verified clean diff (`git diff --check`).
  - Verified non-breaking backward compatibility for Earthquake and Fire scenarios.

---

## [2026-09-16] PHASE 6 — Fire Disaster Scenario Vertical Slice
- **Playable Structure Fire Disaster Scenario (`src/data/fire.ts`):**
  - Authored a complete 8-decision scenario with 10 total nodes (`fire-d1-alarm` through `fire-outcome-node`).
  - Implemented 2 timed 15-second decisions (`fire-d1-alarm` door heat evaluation and `fire-d4-external-escape` fire escape movement).
  - Authored 2 distinct branching paths:
    - Path 1: Corridor crawl (`fire-d2-smoke-crawl`) vs. room seal compartmentalization (`fire-d2b-smoke-room`).
    - Path 2: External fire escape (`fire-d4-external-escape`) vs. room window signaling (`fire-d4b-window-signal`).
  - Grounded all choices, consequences, and insights strictly in NDMA Fire Safety Guidelines and 112 ERSS emergency communication protocols.
- **Natural Roman Hinglish Localization (`src/i18n/fire.ts` & `src/i18n/index.ts`):**
  - Fully translated all 10 nodes, 20 choices, consequence evaluations, and official insights into natural conversational Hinglish.
  - Added dedicated `FIRE_HINGLISH_TAKEAWAYS` for bilingual preparedness reports.
- **Dynamic Preparedness Reporting (`src/engine/reportBuilder.ts` & `src/screens/ReportScreen.tsx`):**
  - Added official `FIRE_TAKEAWAYS` and 101 Fire Emergency Service helpline to `reportBuilder.ts`.
  - Updated `ReportScreen` to render disaster-specific takeaways matching the scenario played in both English and Hinglish.
- **Disaster Selection Console (`src/screens/DisasterSelect.tsx`):**
  - Promoted Structure Fire scenario status from `development` to `playable`.
- **Refactoring & Code Quality:**
  - Fixed unconditional hook ordering in `src/screens/DisasterIntro.tsx`.
  - Verified 0 TypeScript errors (`npm run build` passes in 258ms) and 0 lint errors (`npm run lint`).

---

## [2026-09-16] PHASE 5 — Timed Decisions Overhaul, Answer Randomization & English/Hinglish Mode

### Added
- **15-Second Timed Decisions:**
  - Standardized all time-critical nodes (`eq-d1-shake`, `eq-d4-aftershock`, `fire-d1-alarm`, `flood-d1-warning`) to 15 seconds.
  - Countdowns start at 15s with live countdown and progress indicator.
- **Dedicated Time Expired / Simulation Failed Screen:**
  - When time expires, choices and answers are NEVER leaked or auto-evaluated.
  - Transitions immediately to a dedicated game-over state with `RETRY SCENARIO` and `RETURN TO SELECTION`.
- **Fisher-Yates Answer Choice Randomization:**
  - Shuffles answer choices per decision node dynamically while memoized against `[decisionNode.id, language]` to prevent tick jitter.
  - Eliminates positional bias without altering choice keys or evaluation integrity.
  - Guarantees identical visual styling across all unselected choices prior to selection.
- **Full English / Hinglish Localization System (`src/i18n/`):**
  - Session-persisted language toggle in HUD (`LANG: ENGLISH | HINGLISH`) wired into Zustand store.
  - Complete Roman Hindi + English technical terminology translations for all 9 Earthquake nodes, situation texts, hints, consequences, NDMA insights, key takeaways, score band summaries, and Indian emergency numbers.
  - Dynamic UI string mapping across Main Menu, How to Play, Disaster Selection, Scenario Gameplay, Consequence, Outcome, and Preparedness Report.

---

## [2026-09-16] PHASE 4 — Core Game Structure & Scenario Foundations

### Added
- **Cinematic Main Menu (`src/screens/IntroScreen.tsx` & `.module.css`):**
  - Enhanced opening screen with HUD status (`SIMULATION CONSOLE ACTIVE`), emergency warning badge, official title, and tagline (*"Your decisions determine what happens next."*).
  - Primary action button: `Enter Simulation` navigating directly to Disaster Selection (`/select`).
  - Secondary action buttons: `How to Play` navigating to briefing (`/how-to-play`), and an in-theme `Settings` modal (screen shake toggle, high-contrast HUD toggle, and session reset).
- **How to Play Screen (`src/screens/HowToPlayScreen.tsx` & `.module.css`):**
  - Dedicated briefing screen at `/how-to-play` explaining simulation stakes, real-world grounding, time-critical decisions, and preparedness auditing.
  - Core simulation loop visualization: `SCENARIO → DECISION → CONSEQUENCE → NEXT SITUATION → SCORE`.
  - Return to Main Menu and Enter Simulation quick actions.
- **Disaster Selection Console (`src/screens/DisasterSelect.tsx` & `.module.css`):**
  - Redesigned selection screen to match the HUD terminal aesthetic with scenario codes (`SCN-EQ-01`, `SCN-FR-02`, `SCN-FL-03`).
  - Earthquake designated as `● PLAYABLE` (launches existing complete Earthquake slice).
  - Fire and Flood designated as `○ IN DEVELOPMENT` with in-theme toast notification on click.
  - Added header HUD with `← Main Menu` button.
- **Routing & Navigation Loop (`src/App.tsx` & `src/screens/ReportScreen.tsx`):**
  - Registered `/how-to-play` route with Framer Motion `ScreenTransition`.
  - Added `Main Menu` return action to the Preparedness Report screen, completing the full game loop.
- **Fire Scenario Foundation (`src/data/fire.ts`):**
  - Structured DAG matching the scenario engine: residential structure fire at 02:13 AM.
  - Foundational nodes grounded in NDMA fire safety protocols: back-of-hand door heat check, staying low under toxic smoke, stairwell fire door compartmentalization, and 112 reporting.
- **Flood Scenario Foundation (`src/data/flood.ts`):**
  - Structured DAG matching the scenario engine: low-lying urban colony monsoon flash flood.
  - Foundational nodes grounded in NDMA and CWC flood safety protocols: electrical/gas utility isolation, avoiding deceptive moving waters, and vertical refuge to higher ground.
- **Registry Update (`src/data/index.ts`):**
  - Exported both `fireScenario` and `floodScenario` alongside `earthquakeScenario`.

### Verified
- `npm run build`: ✅ 468 modules transformed, 0 TypeScript errors, 0 build errors in 303ms.
- Engine & DAG Integrity: ✅ 100% graph traversal for Earthquake (9 nodes), Fire (4 nodes), and Flood (3 nodes).
- Earthquake gameplay: ✅ 100% preserved (all branching consequences, 10s & 12s timers, and NDMA insights intact).
- Formatting: `git diff --check` passed with 0 warnings or errors.

---

## [2026-09-16] PHASE 3 — Safety Review & QA Verification

### Safety Audit & Grounding
- **Conservative Attribution:** Audited every safety-critical statement in `src/data/earthquake.ts` and `src/engine/reportBuilder.ts`.
- **Removed Speculative Citations:** Eliminated over-specific, unverified references.
- **Educational Framing:** Replaced over-specific procedural claims with conservative, universally applicable preparedness statements grounded in NDMA public guidance.
- **Educational Disclaimer Added:** Added explicit educational simulation disclaimer to `src/screens/ReportScreen.tsx`.
- **Timer Reset Fixed:** Enhanced `src/hooks/useCountdown.ts` to cleanly reset duration and running state on node changes.

---

## [2026-09-16] PHASE 3 — Scenario Engine & Earthquake Vertical Slice

### Fixed
- **PostCSS / Vite Runtime Crash:** Resolved `[plugin:vite:css] Failed to load PostCSS config SyntaxError: Unexpected token '﻿', "﻿{"... is not valid JSON`. Stripped all BOM markers across project files using clean buffer writes.

### Added
- **`src/engine/scenarioRunner.ts`** — Pure function engine providing DAG node retrieval, choice evaluation, and safety record creation.
- **`src/engine/scoreCalculator.ts`** — Pure scoring engine computing normalized 0-100 preparedness ratings.
- **`src/engine/reportBuilder.ts`** — Pure reporting module assembling step-by-step decision audit replays with NDMA safety citations.
- **`src/data/earthquake.ts`** — Complete playable earthquake vertical slice with 8 branching decision points + outcome node.

---

## [2026-09-16] PHASE 2 — Cinematic Game Shell Implementation

### Added
- **Vite + React 18 + TypeScript** project scaffolded
- **TypeScript strict mode** enabled in `tsconfig.app.json`
- **Dependencies installed:** `react-router-dom` (v6), `zustand`, `framer-motion`
- **Design Tokens & HUD:** Global design tokens and themes created

---

## [2026-09-16] PHASE 1 — Project Documentation & Architecture

### Added
- `AGENTS.md` — master context file for all coding agents
- `docs/GDD.md` — full Game Design Document
- `docs/ARCHITECTURE.md` — technical architecture specification
- `docs/DECISIONS.md` — architectural decision log
- `docs/PROJECT_STATE.md` — living project state document
- `docs/CHANGELOG.md` — this file