# CHANGELOG.md — SURVIVE: Disaster Response Simulator

All meaningful changes to this project are documented here.
Format: `[YYYY-MM-DD] [Phase] — Description`

---

## [2026-09-16] FOUNDATION — Project Documentation & Architecture

### Added
- `AGENTS.md` — Master context file for all coding agents. Contains project purpose, official problem statement, product vision, gameplay principles, visual direction, safety principles, coding rules, context management rules, Git rules, and development workflow.
- `docs/GDD.md` — Full Game Design Document. Defines game vision, target experience, gameplay loop, initial disaster scope (Earthquake/Fire/Flood), player progression, scenario structure (DAG model), decision system, consequence system, scoring concept, preparedness report concept, cinematic experience requirements, and MVP vs optional features.
- `docs/ARCHITECTURE.md` — Technical architecture document. Defines recommended stack (React 18 + TypeScript + Vite + Zustand + Framer Motion + CSS Modules), application folder structure, game-state architecture (Zustand store shape), scenario data model (TypeScript types for DAG nodes), decision/consequence engine design, scoring architecture, data-driven scenario extension pattern, AI integration constraints, deployment architecture (static hosting via Vercel), and testing approach (Vitest + RTL).
- `docs/DECISIONS.md` — Architectural decision log. Records DEC-001 through DEC-008 covering: no backend for MVP, React+TS stack, Zustand state, CSS Modules theming, Framer Motion animations, TypeScript scenario data, AI safety constraints, and DAG scenario structure.
- `docs/PROJECT_STATE.md` — Living project state document. Current phase: FOUNDATION. Documents repository status, completed work, current task, next task (Phase 2 Shell), known issues, important files, and architecture summary.
- `docs/CHANGELOG.md` — This file.

### Architecture Decisions Made
- DEC-001: No backend for MVP
- DEC-002: React + TypeScript as framework
- DEC-003: Zustand for game state
- DEC-004: CSS Modules + CSS custom properties for theming
- DEC-005: Framer Motion for cinematic transitions
- DEC-006: Scenario data as TypeScript (not JSON or CMS)
- DEC-007: Deterministic safety-critical content; AI for narration only
- DEC-008: DAG structure for scenarios

### Status
Foundation complete. No application code exists yet. Ready for Phase 2: Shell.

---

*Entries above this line are complete. New entries are added below in reverse-chronological order.*
