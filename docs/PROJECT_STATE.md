# PROJECT_STATE.md — SURVIVE: Disaster Response Simulator

> This file describes the ACTUAL current state of the repository.
> It must be updated after every meaningful implementation task.
> Never claim a feature exists unless it is implemented and verified.

---

## Current Phase

**PHASE 6 — FIRE DISASTER SCENARIO VERTICAL SLICE** (Implemented & Verified — Ready for Commit)

---

## Repository Status

| Item | Status |
|---|---|
| Git repository | Initialized, 4 commits (`b4d34ce`, `71d70c7`, `c5e6324`, `6245967`) |
| Remote | https://github.com/krushnasharma-create/survive-disaster-simulator.git |
| Branch | main |
| Application code | ✅ 2 complete playable disaster vertical slices (Earthquake & Structure Fire), master visual language preserved, 15s timed decisions, dedicated failure screen, Fisher-Yates randomization, full English + Hinglish localization |
| Build system | ✅ Vite + React 18 + TypeScript (strict) |
| Dependencies installed | ✅ react-router-dom, zustand, framer-motion |
| TypeScript errors | ✅ 0 errors |
| Build status | ✅ Passes (`npm run build` — 473 modules, 0 errors in 258ms) |
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

## Current Task

Phase 6 Fire Disaster Scenario implementation complete and verified. Ready to commit.

---

## Next Task

**FLOOD DISASTER SCENARIO VERTICAL SLICE (PHASE 7)**
1. Author complete 7–9 node DAG for Flash Flood scenario (`src/data/flood.ts`).
2. Implement Roman Hinglish localization for Flash Flood (`src/i18n/flood.ts`).
3. Integrate flood takeaways and activate flood in `DisasterSelect.tsx`.
4. Integrate audio design / sound effects.

---

## Known Issues

- Flood remains designated as "IN DEVELOPMENT" on the selection console until Phase 7.
- Ambient audio effects are currently visual/haptic only.

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
| `src/data/fire.ts` | Fire scenario foundation |
| `src/data/flood.ts` | Flood scenario foundation |
| `src/engine/scenarioRunner.ts` | Deterministic node traversal & choice evaluation |
| `src/engine/scoreCalculator.ts` | Preparedness score calculation |
| `src/engine/reportBuilder.ts` | Preparedness report assembly |