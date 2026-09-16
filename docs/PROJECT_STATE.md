# PROJECT_STATE.md — SURVIVE: Disaster Response Simulator

> This file describes the ACTUAL current state of the repository.
> It must be updated after every meaningful implementation task.
> Never claim a feature exists unless it is implemented and verified.

---

## Current Phase

**PHASE 1 — FOUNDATION**

---

## Repository Status

| Item | Status |
|---|---|
| Git repository | Initialized |
| Remote | https://github.com/krushnasharma-create/survive-disaster-simulator.git |
| Branch | main |
| Application code | NOT YET CREATED |
| Build system | NOT YET CONFIGURED |
| Dependencies | NOT YET INSTALLED |

---

## Completed Work

- [x] Repository inspected — confirmed empty (Git only)
- [x] `AGENTS.md` created — master context file for all agents
- [x] `docs/GDD.md` created — full game design document
- [x] `docs/ARCHITECTURE.md` created — technical architecture proposal
- [x] `docs/DECISIONS.md` created — architectural decision log (DEC-001 through DEC-008)
- [x] `docs/PROJECT_STATE.md` created — this file
- [x] `docs/CHANGELOG.md` created — changelog initialized

---

## Current Task

Foundation documentation complete. Awaiting approval to proceed to Phase 2.

---

## Next Task

**PHASE 2 — SHELL**

Tasks in order:
1. Initialize Vite + React 18 + TypeScript project (`npm create vite@latest`)
2. Install core dependencies: React Router v6, Zustand, Framer Motion
3. Configure TypeScript strict mode (`tsconfig.json`)
4. Set up `src/` folder structure per ARCHITECTURE.md
5. Create global CSS reset and design tokens (`src/styles/global.css`)
6. Create the three disaster CSS themes (stubs) (`src/styles/themes/`)
7. Create the Zustand game store stub (`src/store/gameStore.ts`)
8. Create stub screen components (IntroScreen, DisasterSelect, ScenarioScreen, ReportScreen)
9. Wire up React Router between stub screens
10. Verify the app renders in the browser (game shell visible, no errors)
11. Commit: `feat: implement cinematic game shell`

---

## Known Issues

None at this stage — no application code exists yet.

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

---

## Architecture Summary

- **Stack:** React 18 + TypeScript + Vite + Zustand + Framer Motion + CSS Modules
- **No backend for MVP** — all scenario data is static TypeScript
- **Scenario structure:** Directed Acyclic Graph (DAG) of typed nodes
- **Engine:** Pure function in `src/engine/scenarioRunner.ts` — no UI, no side effects
- **Safety:** All safety-critical content (isCorrect, scoreImpact, insight) is static; AI may only generate narration
- **Deployment:** Static hosting (Vercel recommended)
