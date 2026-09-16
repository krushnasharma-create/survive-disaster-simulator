# DECISIONS.md — Architectural & Product Decision Log
## SURVIVE: Disaster Response Simulator

Decisions are recorded here with context, alternatives considered, and rationale.
This prevents revisiting resolved decisions and helps agents understand *why* the codebase looks the way it does.

---

## Decision Log

---

### DEC-001 — No Backend for MVP

**Date:** 2026-09-16
**Status:** Decided
**Decision:** MVP will have no backend server. All scenario data is static TypeScript. All state is in-browser.

**Context:** 48-hour hackathon. Backend introduces deployment complexity, auth complexity, API latency, and error surface.

**Alternatives considered:**
- Firebase Firestore for user scores — adds auth setup, Firestore rules, network calls
- Node.js Express API — adds a server to deploy and maintain
- Supabase — fast but still adds external dependency and auth setup

**Rationale:** The core experience is entirely client-side. No gameplay feature requires a server. Persistent scores and leaderboards are explicitly optional post-MVP. Ship the game; add persistence if time permits.

---

### DEC-002 — React + TypeScript over plain HTML/JS or Vue

**Date:** 2026-09-16
**Status:** Decided
**Decision:** Use React 18 with TypeScript.

**Context:** The game has many distinct screens, complex state transitions, and a data-driven scenario system that benefits from component reuse.

**Alternatives considered:**
- Plain HTML/CSS/JS — fast to start, but routing, state, and transitions become unmanageable at this complexity
- Vue 3 — equally valid; React chosen for wider team familiarity

**Rationale:** React's component model maps directly to game screens. TypeScript's type system enforces the scenario data model. Vite gives fast HMR. The ecosystem (Framer Motion, Zustand) provides everything needed.

---

### DEC-003 — Zustand over Redux / Context API for Game State

**Date:** 2026-09-16
**Status:** Decided
**Decision:** Use Zustand for global game state.

**Context:** Game state is a single shared object (active disaster, current node, decisions, score). It needs to be accessible from multiple components without prop drilling.

**Alternatives considered:**
- Redux Toolkit — significant boilerplate, overkill for a single global state object
- React Context API — fine for simple state but causes unwanted re-renders; harder to use outside components
- Jotai / Recoil — atomic state models are a poor fit for a single coherent game state object

**Rationale:** Zustand is ~1KB, zero-boilerplate, works outside React components (useful for the engine), and has a simple API. Perfect for a hackathon.

---

### DEC-004 — CSS Modules + CSS Custom Properties over Tailwind or Styled Components

**Date:** 2026-09-16
**Status:** Decided
**Decision:** Use CSS Modules with CSS custom properties (variables) for theming.

**Context:** The design calls for a cinematic, game-like UI with disaster-specific visual themes. Visual identity is a core deliverable.

**Alternatives considered:**
- Tailwind CSS — utility classes fight against custom atmospheric design; hard to make Tailwind sites feel un-generic
- Styled Components — runtime-in-JS CSS; adds bundle weight
- SCSS modules — valid; CSS custom properties achieve the same theming without a preprocessor

**Rationale:** CSS Modules give component-scoped styles. CSS custom properties allow disaster-specific themes to be applied by swapping a single class on the root element. Zero runtime overhead. Full design control.

---

### DEC-005 — Framer Motion for Cinematic Transitions

**Date:** 2026-09-16
**Status:** Decided
**Decision:** Use Framer Motion for screen transitions and animation.

**Context:** Dramatic, intentional transitions are a core part of the cinematic experience requirement.

**Alternatives considered:**
- CSS animations only — harder to sequence complex multi-element animations
- GSAP — powerful but heavyweight; Framer Motion is more idiomatic in React
- React Spring — similar capability; Framer Motion has better documentation and more cinematic presets

**Rationale:** Framer Motion's AnimatePresence + motion.div pattern maps directly to screen transitions. Good enough to make transitions feel premium without custom animation code.

---

### DEC-006 — Scenario Data as TypeScript, Not JSON

**Date:** 2026-09-16
**Status:** Decided
**Decision:** Scenario data is defined as TypeScript objects in `src/data/`, not as JSON files or a CMS.

**Context:** Emergency preparedness content is safety-critical. All content must be version-controlled, typed, and reviewable.

**Alternatives considered:**
- JSON files — lose TypeScript type-checking on content; no compile-time validation of node references
- Headless CMS (Contentful, Sanity) — external service dependency; content not version-controlled in Git; unacceptable for safety-critical content
- Markdown with frontmatter — decision structure needs strict typing

**Rationale:** TypeScript objects are type-checked at compile time. The scenario data model enforces structural correctness. A Vitest data-integrity test can walk the DAG and assert all node references are valid. Impossible to ship a broken scenario silently.

---

### DEC-007 — Deterministic Safety-Critical Content; AI for Narration Only

**Date:** 2026-09-16
**Status:** Decided
**Decision:** All decision correctness (isCorrect), score impacts, and preparedness insights (Choice.insight) are static, deterministic, and sourced from authoritative Indian guidance first. Source priority:
1. **Primary:** NDMA (National Disaster Management Authority, India), SACHET portal, Government of India 112 ERSS guidelines
2. **Supplementary:** FEMA or Red Cross — only when no equivalent Indian guidance exists and the guidance is universally applicable

AI may only generate flavor/narrative text.

**Context:** This is a safety-education application targeting Indian users. Incorrect or US-centric emergency guidance could cause real harm or confuse users in an Indian emergency context (e.g., dialling 911 instead of 112).

**Rationale:** An LLM can hallucinate or generate plausible-sounding but incorrect emergency instructions. The distinction between "narrative experience" and "safety guidance" must be architecturally enforced. NDMA/SACHET is the authoritative source for Indian disaster preparedness guidance. By making AI a separate aiNarrator service that only wraps pre-approved static facts with narrative language, we guarantee the safety-critical core is never under AI control.

---

### DEC-008 — Directed Acyclic Graph (DAG) for Scenario Structure

**Date:** 2026-09-16
**Status:** Decided
**Decision:** Scenarios are modelled as DAGs of typed nodes. The engine traverses nodes by following nextNodeId references.

**Context:** Branching scenarios that respond to player decisions require a graph structure, not a linear array of questions.

**Alternatives considered:**
- Linear array with if/else branching logic — becomes unmaintainable at 5+ decision points
- Tree structure — a DAG is more general (multiple paths can converge to the same outcome node, reducing content duplication)
- State machine (XState) — powerful but adds complexity; for this scenario depth a simple DAG traversal is sufficient

**Rationale:** A DAG stored as a Record<string, ScenarioNode> is simple to implement, test (walk all node IDs), and extend (add new nodes without changing the engine). The engine is a pure function that knows nothing about specific scenarios.

---

## Open Questions

| ID | Question | Status |
|---|---|---|
| OQ-001 | Should the game support anonymous play without login? | Assumed YES for MVP (no auth needed) |
| OQ-002 | Should timed decisions have audio (tick sound)? | Deferred to polish phase |
| OQ-003 | Is a fourth disaster (e.g. Tornado) in scope? | Only if first three are fully polished with time remaining |
| OQ-004 | Mobile layout: full parity or graceful degradation? | Graceful degradation; desktop is primary for demo |
