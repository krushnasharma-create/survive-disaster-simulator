# PROJECT_STATE.md — SURVIVE: Disaster Response Simulator

> This file describes the ACTUAL current state of the repository.
> It must be updated after every meaningful implementation task.
> Never claim a feature exists unless it is implemented and verified.

---

## Current Phase

**PHASE 2 — SHELL** (Complete — awaiting review & commit)

---

## Repository Status

| Item | Status |
|---|---|
| Git repository | Initialized, 1 commit |
| Remote | https://github.com/krushnasharma-create/survive-disaster-simulator.git |
| Branch | main |
| Application code | ✅ Scaffolded and verified |
| Build system | ✅ Vite + React 18 + TypeScript (strict) |
| Dependencies installed | ✅ react-router-dom, zustand, framer-motion |
| TypeScript errors | ✅ 0 |
| Build status | ✅ Passes (`npm run build` — 452 modules, 0 errors) |

---

## Completed Work

- [x] Repository inspected — confirmed empty (Git only)
- [x] `AGENTS.md` created — master context file for all agents
- [x] `docs/GDD.md` created — full game design document
- [x] `docs/ARCHITECTURE.md` created — technical architecture proposal
- [x] `docs/DECISIONS.md` created — architectural decision log (DEC-001 through DEC-008)
- [x] `docs/PROJECT_STATE.md` created — this file
- [x] `docs/CHANGELOG.md` created — changelog initialized
- [x] Vite + React 18 + TypeScript scaffolded
- [x] Dependencies installed: react-router-dom, zustand, framer-motion
- [x] TypeScript strict mode enabled (`tsconfig.app.json`)
- [x] Global CSS design tokens created (`src/styles/global.css`)
- [x] Disaster theme CSS created (`earthquake.css`, `fire.css`, `flood.css`)
- [x] Shared animations CSS created (`src/styles/animations.css`)
- [x] Scenario data types defined (`src/data/types.ts`)
- [x] Zustand game store created (`src/store/gameStore.ts`)
- [x] `useCountdown` hook created (`src/hooks/useCountdown.ts`)
- [x] `CinematicText` component (typewriter reveal) created
- [x] `CountdownTimer` component created
- [x] `DecisionPanel` component created
- [x] `ScreenTransition` component (Framer Motion) created
- [x] `IntroScreen` — cinematic game intro with typewriter sequence and phased reveal
- [x] `DisasterSelect` — atmospheric 3-card disaster selection screen
- [x] `DisasterIntro` — per-disaster cinematic intro with typewriter narrative
- [x] `ScenarioScreen` — stub (navigable, awaits Phase 3 scenario engine)
- [x] `ConsequenceScreen` — stub (navigable, awaits Phase 3)
- [x] `OutcomeScreen` — stub (navigable, awaits Phase 3)
- [x] `ReportScreen` — structural shell with score display and navigation
- [x] `App.tsx` — React Router v6 client-side routing with AnimatePresence
- [x] `main.tsx` — entry point, BrowserRouter, global style imports
- [x] `index.html` — updated title, Google Fonts (Bebas Neue, Inter, Share Tech Mono)
- [x] Build verified: `npm run build` — 0 TypeScript errors, 0 build errors

---

## Current Task

Shell implementation complete. NOT YET COMMITTED. Awaiting user review.

---

## Next Task

**PHASE 3 — SCENARIO ENGINE**

Tasks in order:
1. Implement `src/engine/scenarioRunner.ts` — pure function DAG traversal
2. Implement `src/engine/scoreCalculator.ts` — score computation
3. Implement `src/engine/reportBuilder.ts` — report data assembly
4. Write earthquake scenario data (`src/data/earthquake.ts`)
5. Write fire scenario data (`src/data/fire.ts`)
6. Write flood scenario data (`src/data/flood.ts`)
7. Write Vitest data-integrity tests for all 3 scenarios
8. Wire ScenarioScreen to live scenario data
9. Wire ConsequenceScreen to engine output
10. Wire OutcomeScreen to engine output
11. Wire ReportScreen to scored decisions
12. Commit: `feat: implement scenario engine`

---

## Known Issues

- `ScenarioScreen`, `ConsequenceScreen`, `OutcomeScreen` are deliberate stubs — they contain placeholder content until Phase 3 engine is implemented. This is accurate and expected.
- `ReportScreen` shows score 0 until the engine provides real decision data.
- No `.gitignore` for `dist/` — confirm node_modules and dist are in .gitignore (Vite scaffold includes this by default).

---

## Important Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Master context for all coding agents — READ FIRST |
| `docs/GDD.md` | Game design specification |
| `docs/ARCHITECTURE.md` | Technical architecture and stack decisions |
| `docs/DECISIONS.md` | Architectural decision log |
| `docs/PROJECT_STATE.md` | This file — current state |
| `docs/CHANGELOG.md` | Change history |
| `src/data/types.ts` | Scenario data model types |
| `src/store/gameStore.ts` | Zustand global game state |
| `src/engine/` | Scenario engine (NOT YET IMPLEMENTED — Phase 3) |
| `src/data/earthquake.ts` | Earthquake scenario (NOT YET IMPLEMENTED — Phase 3) |
| `src/data/fire.ts` | Fire scenario (NOT YET IMPLEMENTED — Phase 3) |
| `src/data/flood.ts` | Flood scenario (NOT YET IMPLEMENTED — Phase 3) |

---

## Architecture Summary

- **Stack:** React 18 + TypeScript (strict) + Vite + Zustand + Framer Motion + CSS Modules
- **No backend** — all scenario data will be static TypeScript
- **Routing:** React Router v6, client-side, AnimatePresence transitions
- **Scenario structure:** DAG of typed nodes (types defined, data not yet written)
- **Engine:** Not yet implemented (Phase 3)
- **Deployment:** Static hosting (Vercel recommended); `npm run build` outputs `dist/`
