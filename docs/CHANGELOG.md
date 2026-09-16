# CHANGELOG.md — SURVIVE: Disaster Response Simulator

All meaningful changes to this project are documented here.
Format: `[YYYY-MM-DD] [Phase] — Description`

---

## [2026-09-16] PHASE 3 — Safety Review & QA Verification

### Safety Audit & Grounding
- **Conservative Attribution:** Audited every safety-critical statement in `src/data/earthquake.ts` and `src/engine/reportBuilder.ts`.
- **Removed Speculative Citations:** Eliminated over-specific, unverified references (such as specific building code numbers, invented manual titles like "NDRF Lift Rescue Standard Operating Procedures", and ungrounded distance rules like "distance equal to building height").
- **Educational Framing:** Replaced over-specific procedural claims with conservative, universally applicable preparedness statements grounded in NDMA public guidance.
- **Educational Disclaimer Added:** Added explicit educational simulation disclaimer to `src/screens/ReportScreen.tsx` stating that this simulation is for general awareness and does not replace official emergency services or certified training.
- **Timer Reset Fixed:** Enhanced `src/hooks/useCountdown.ts` to cleanly reset remaining duration and running state whenever navigating between nodes with different time limits.

### QA Verification
- **Build:** `npm run build` passes with 0 TypeScript errors and 0 build errors (464 modules in 237ms).
- **DAG Integrity:** 100% of nodes in `earthquakeScenario` verified for valid choice counts, non-empty nextNodeIds, and presence of authoritative insights.
- **Timer Expiry Verification:** Verified that `eq-d1-shake` automatically falls back to `defaultChoiceId` with zero time bonus upon timer expiration.
- **Suboptimal Branching Verification:** Verified that selecting high-risk actions dynamically routes through `eq-d2b-injured-hazard` (injury complication) and `eq-d3b-elevator-trap` (power failure entrapment) before safely reaching `eq-outcome-node`.
- **Optimal Path Verification:** Verified that adhering to NDMA protocols routes through safe utility isolation and stairwell evacuation, yielding a 99/100 (`Ready to Respond`) score.
- **Formatting:** `git diff --check` passes with zero formatting or whitespace issues.

---

## [2026-09-16] PHASE 3 — Scenario Engine & Earthquake Vertical Slice

### Fixed
- **PostCSS / Vite Runtime Crash:** Resolved `[plugin:vite:css] Failed to load PostCSS config SyntaxError: Unexpected token '﻿', "﻿{"... is not valid JSON`. Identified that Windows PowerShell 5.1 `Set-Content -Encoding UTF8` automatically prepended a UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`) to `package.json`, which caused Vite's naive `JSON.parse` loader to fail during CSS transformation. Stripped all BOM markers across project files using clean buffer writes.

### Added
- **`src/engine/scenarioRunner.ts`** — Pure function engine providing DAG node retrieval (`getNode`), choice evaluation with speed bonus calculation (`evaluateChoice`), and safety record creation.
- **`src/engine/scoreCalculator.ts`** — Pure scoring engine computing normalized 0-100 preparedness ratings, decision accuracy ratio, and assigning authoritative performance bands (`Ready to Respond`, `Good Awareness`, `Needs Preparation`, `Critically Unprepared`).
- **`src/engine/reportBuilder.ts`** — Pure reporting module assembling step-by-step decision audit replays with NDMA safety citations, 5 key earthquake takeaways, and official Indian emergency helpline directory (112 ERSS, NDMA Control Room, SACHET portal).
- **`src/data/earthquake.ts`** — Complete playable earthquake vertical slice with 8 branching decision points + outcome node:
  - `eq-d1-shake`: 10-second timed decision during initial tremor (Drop, Cover, Hold On vs running vs doorway).
  - `eq-d2-gas-hazard` & `eq-d2b-injured-hazard`: Secondary hazards post-tremor (LPG cylinder regulator shut-off and electrical main breaker tripping; hemorrhage control).
  - `eq-d3-evac-route` & `eq-d3b-elevator-trap`: High-rise vertical evacuation dilemma (fire staircase vs elevator power trap vs cantilever balcony).
  - `eq-d4-aftershock`: 12-second timed aftershock on stair landing (interior load-bearing wall crouch vs panic stampede).
  - `eq-d5-street-hazard`: Exterior street hazard evasion (open park field vs facade canopy death trap vs re-entering for valuables).
  - `eq-d6-post-comms`: Telecommunication protocol during disaster (SMS/SACHET vs network call congestion vs rumour forwarding).
  - `eq-outcome-node`: Resolution narrative transitioning to report.
- **`src/data/index.ts`** — Scenario registry and lookup exports.
- **`src/store/gameStore.ts`** — Enhanced with active consequence and outcome tracking, decision logging, and session reset.
- **UI Screen Wiring:**
  - `ScenarioScreen.tsx`: Wired to live scenario DAG, dynamic countdown timers, and animated choice interaction.
  - `ConsequenceScreen.tsx`: Wired to immediate narrative feedback and authoritative NDMA / 112 ERSS protocol cards.
  - `OutcomeScreen.tsx`: Wired to resolution status and automated score compilation.
  - `ReportScreen.tsx`: Interactive report displaying final score, performance metrics, decision replay with official rationales, key takeaways, and helpline directories.

---

## [2026-09-16] PHASE 2 — Cinematic Game Shell Implementation

### Added
- **Vite + React 18 + TypeScript** project scaffolded
- **TypeScript strict mode** enabled in `tsconfig.app.json`
- **Dependencies installed:** `react-router-dom` (v6), `zustand`, `framer-motion`
- **`index.html`** — updated title ("SURVIVE — Disaster Response Simulator"), Google Fonts (Bebas Neue, Inter, Share Tech Mono)
- **`src/styles/global.css`** — full design token system (CSS custom properties)
- **`src/styles/themes/earthquake.css`** — earthquake visual theme
- **`src/styles/themes/fire.css`** — fire visual theme
- **`src/styles/themes/flood.css`** — flood visual theme
- **`src/styles/animations.css`** — shared keyframe animations
- **`src/data/types.ts`** — scenario DAG data model types
- **`src/store/gameStore.ts`** — Zustand game store
- **`src/hooks/useCountdown.ts`** — countdown timer hook
- **`src/components/CinematicText.tsx`** — typewriter character-reveal component
- **`src/components/CountdownTimer.tsx`** — visual countdown bar
- **`src/components/DecisionPanel.tsx`** — animated choice buttons
- **`src/components/ScreenTransition.tsx`** — Framer Motion AnimatePresence wrapper
- **`src/screens/IntroScreen.tsx`** — cinematic game intro
- **`src/screens/DisasterSelect.tsx`** — atmospheric disaster selection
- **`src/screens/DisasterIntro.tsx`** — per-disaster cinematic intro
- **`src/App.tsx`** — React Router v6 client-side routing
- **`src/main.tsx`** — entry point

---

## [2026-09-16] PHASE 1 — Project Documentation & Architecture

### Added
- `AGENTS.md` — master context file for all coding agents
- `docs/GDD.md` — full Game Design Document
- `docs/ARCHITECTURE.md` — technical architecture specification
- `docs/DECISIONS.md` — architectural decision log
- `docs/PROJECT_STATE.md` — living project state document
- `docs/CHANGELOG.md` — this file