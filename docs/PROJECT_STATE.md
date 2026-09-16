# PROJECT_STATE.md — SURVIVE: Disaster Response Simulator

> This file describes the ACTUAL current state of the repository.
> It must be updated after every meaningful implementation task.
> Never claim a feature exists unless it is implemented and verified.

---

## Current Phase

**PHASE 3 — SCENARIO ENGINE & EARTHQUAKE VERTICAL SLICE** (Safety Reviewed & Fully QA-Verified — Awaiting User Review)

---

## Repository Status

| Item | Status |
|---|---|
| Git repository | Initialized, 2 commits (`b4d34ce`, `71d70c7`) |
| Remote | https://github.com/krushnasharma-create/survive-disaster-simulator.git |
| Branch | main |
| Application code | ✅ Complete deterministic engine, safety-reviewed Earthquake slice |
| Build system | ✅ Vite + React 18 + TypeScript (strict) |
| Dependencies installed | ✅ react-router-dom, zustand, framer-motion |
| TypeScript errors | ✅ 0 errors |
| Build status | ✅ Passes (`npm run build` — 464 modules, 0 errors in 237ms) |
| Runtime status | ✅ PostCSS/Vite UTF-8 BOM bug resolved; dev server 200 OK |
| Safety audit status | ✅ Full audit completed; speculative citations & over-specific claims removed |
| QA test suite status | ✅ 100% passed (graph integrity, timer expiry fallback, optimal & branching paths) |

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
- [x] Cinematic presentation components (`CinematicText`, `CountdownTimer`, `DecisionPanel`, `ScreenTransition`)
- [x] Client-side routing with `AnimatePresence` across all screens
- [x] Milestone commit: `feat: implement cinematic game shell` (`71d70c7`)

### Phase 3 — Scenario Engine & Earthquake Vertical Slice
- [x] **PostCSS/Vite Bug Resolved:** Diagnosed UTF-8 Byte Order Mark (`\uFEFF`) written by PowerShell 5.1 in `package.json` that broke Vite's naive `JSON.parse` loader; stripped BOM across configuration and source files.
- [x] **Scenario Engine:**
  - `src/engine/scenarioRunner.ts` — pure DAG traversal, choice evaluation, speed bonus calculation
  - `src/engine/scoreCalculator.ts` — normalized 0–100 preparedness score, 4 distinct score bands
  - `src/engine/reportBuilder.ts` — decision-by-decision audit trail, conservative NDMA takeaways, 112 ERSS helpline registry
- [x] **Earthquake Vertical Slice:**
  - `src/data/earthquake.ts` — 8 decision nodes + outcome node, urban 4th-floor apartment setting, daytime (11:47 AM).
  - Time-limited decisions (10s on initial tremor with auto-selection on expiry, 12s on staircase aftershock).
  - Branching consequences: running causes physical injury (`eq-d2b-injured-hazard`); taking lift causes power outage and entrapment (`eq-d3b-elevator-trap`).
- [x] **Safety Review & Grounding:**
  - Audited all safety-critical sentences against conservative public preparedness guidance.
  - Removed speculative/unverified citations (e.g. specific building codes, unverified manual names).
  - Replaced over-specific procedural claims with conservative, educational safety rules.
  - Added clear educational simulation disclaimer to `ReportScreen.tsx`.
- [x] **UI Screen Wiring:**
  - `ScenarioScreen.tsx` — live situation narrative, contextual cues, visible countdown timers, choice buttons
  - `ConsequenceScreen.tsx` — narrative outcome, optimal vs high-risk status, official NDMA protocol cards
  - `OutcomeScreen.tsx` — survival resolution narrative, automated score compilation
  - `ReportScreen.tsx` — final score (0–100), performance band, decision replay with official rationales, key takeaways, and verified Indian emergency helplines.

---

## Current Task

Phase 3 implementation, safety review, and QA verification complete. Working tree clean for review. Awaiting user instructions.

---

## Next Task

**PHASE 4 — POLISH & SECONDARY SCENARIOS (FIRE / FLOOD)**
1. Author Fire scenario data model (`src/data/fire.ts`) with Indian fire safety principles.
2. Author Flood scenario data model (`src/data/flood.ts`) with CWC / NDMA flood warning guidelines.
3. Add ambient atmospheric soundscapes.
4. Refine mobile responsiveness.

---

## Known Issues

- Fire and Flood scenarios remain placeholders in selection/intro until authoring in subsequent phases.
- Sound effects and ambient audio are visual/haptic only.

---

## Important Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Master context for all coding agents — READ FIRST |
| `docs/GDD.md` | Game design specification |
| `docs/ARCHITECTURE.md` | Technical architecture and stack decisions |
| `docs/PROJECT_STATE.md` | This file — current state |
| `docs/CHANGELOG.md` | Change history |
| `src/data/types.ts` | Scenario data model types |
| `src/data/earthquake.ts` | Complete Earthquake DAG scenario |
| `src/engine/scenarioRunner.ts` | Deterministic node traversal & choice evaluation |
| `src/engine/scoreCalculator.ts` | Preparedness score calculation |
| `src/engine/reportBuilder.ts` | Preparedness report assembly |
| `src/store/gameStore.ts` | Zustand global state management |