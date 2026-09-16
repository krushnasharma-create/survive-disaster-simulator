# CHANGELOG.md — SURVIVE: Disaster Response Simulator

All meaningful changes to this project are documented here.
Format: `[YYYY-MM-DD] [Phase] — Description`

---

## [2026-09-16] SHELL — Cinematic Game Shell Implementation

### Added
- **Vite + React 18 + TypeScript** project scaffolded
- **TypeScript strict mode** enabled in `tsconfig.app.json`
- **Dependencies installed:** `react-router-dom` (v6), `zustand`, `framer-motion`
- **`index.html`** — updated title ("SURVIVE — Disaster Response Simulator"), Google Fonts (Bebas Neue, Inter, Share Tech Mono)
- **`src/styles/global.css`** — full design token system (CSS custom properties): typography scale, spacing, motion easing, colour palette, disaster theme override pattern
- **`src/styles/themes/earthquake.css`** — earthquake visual theme (amber, dust, concrete palette)
- **`src/styles/themes/fire.css`** — fire visual theme (deep orange, ember, smoke palette)
- **`src/styles/themes/flood.css`** — flood visual theme (deep teal, murky water, emergency blue palette)
- **`src/styles/animations.css`** — shared keyframe animations (flicker, pulse-glow, type-cursor, shake, breath, fade-up, countdown-drain)
- **`src/data/types.ts`** — complete TypeScript type definitions for the scenario DAG data model (Scenario, ScenarioNode, DecisionNode, Choice, OutcomeNode, etc.)
- **`src/store/gameStore.ts`** — Zustand game store (hasSeenIntro, activeDisaster, currentNodeId, visitedNodes, decisions, totalScore + all actions)
- **`src/hooks/useCountdown.ts`** — countdown timer hook (start/stop/reset, progress ratio, onExpire callback)
- **`src/components/CinematicText.tsx`** — typewriter character-reveal component with blinking cursor
- **`src/components/CountdownTimer.tsx`** — visual countdown bar + seconds readout with urgency state
- **`src/components/DecisionPanel.tsx`** — animated player choice buttons (staggered entrance, focus/hover states)
- **`src/components/ScreenTransition.tsx`** — Framer Motion AnimatePresence wrapper for cinematic screen transitions
- **`src/screens/IntroScreen.tsx`** — cinematic game intro: phased reveal (alert badge → title → tagline typewriter → CTA), scanline overlay, atmospheric
- **`src/screens/DisasterSelect.tsx`** — atmospheric 3-card disaster selection: earthquake/fire/flood with per-disaster accent colours, hover glow, staggered card entrance
- **`src/screens/DisasterIntro.tsx`** — per-disaster cinematic intro: setting badge, disaster icon, typewriter narrative, themed background, proceed CTA
- **`src/screens/ScenarioScreen.tsx`** — stub screen with minimal HUD; placeholder for Phase 3 scenario engine
- **`src/screens/ConsequenceScreen.tsx`** — stub screen; placeholder for Phase 3
- **`src/screens/OutcomeScreen.tsx`** — stub screen; placeholder for Phase 3
- **`src/screens/ReportScreen.tsx`** — structural shell: score display (getScoreBand logic), play again / select disaster navigation
- **`src/App.tsx`** — React Router v6 client-side routing with AnimatePresence for all 7 screen routes
- **`src/main.tsx`** — entry point: StrictMode, BrowserRouter, global CSS imports

### Build Result
- `npm run build` — ✅ 0 TypeScript errors, 0 build errors, 452 modules, 2.38s

### Not Yet Implemented (intentional stubs)
- Scenario engine (`src/engine/`)
- Scenario data (`src/data/earthquake.ts`, `fire.ts`, `flood.ts`)
- ScenarioScreen real gameplay
- ConsequenceScreen real content
- OutcomeScreen real content
- Score calculation from real decision data

---

## [2026-09-16] FOUNDATION — Project Documentation & Architecture

### Added
- `AGENTS.md` — master context file for all coding agents
- `docs/GDD.md` — full Game Design Document
- `docs/ARCHITECTURE.md` — technical architecture specification
- `docs/DECISIONS.md` — architectural decision log (DEC-001 through DEC-008)
- `docs/PROJECT_STATE.md` — living project state document
- `docs/CHANGELOG.md` — this file

### Architecture Decisions Made
- DEC-001: No backend for MVP
- DEC-002: React + TypeScript as framework
- DEC-003: Zustand for game state
- DEC-004: CSS Modules + CSS custom properties for theming
- DEC-005: Framer Motion for cinematic transitions
- DEC-006: Scenario data as TypeScript
- DEC-007: Deterministic safety-critical content (NDMA/SACHET primary); AI for narration only
- DEC-008: DAG structure for scenarios

---

*Entries above this line are complete. New entries are added below in reverse-chronological order.*
