# ARCHITECTURE.md — SURVIVE: Disaster Response Simulator

**Version:** 0.1 — Foundation
**Last Updated:** 2026-09-16
**Status:** Proposed (Pre-implementation)

---

## 1. Guiding Principle

This is a 48-hour hackathon. Architecture must be:
- **Minimal** — no microservices, no unnecessary infrastructure
- **Fast to build** — familiar tooling, predictable patterns
- **Easy to hand off** — clear folder structure, one concern per file
- **Easy to demo** — deploys to a static host with a single command

---

## 2. Recommended Frontend Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | **React 18 + TypeScript** | Component model maps well to game screens/nodes; TS prevents state bugs |
| Build tool | **Vite** | Instant HMR, zero-config, fast production builds |
| Routing | **React Router v6** | Client-side routing; no SSR needed |
| State management | **Zustand** | Lightweight, no boilerplate, great for game state |
| Styling | **CSS Modules + custom properties** | Full design control; disaster-specific themes via CSS vars |
| Animation | **Framer Motion** | Production-quality cinematic transitions with minimal code |
| Fonts | **Google Fonts** (self-hosted subset) | Strong typographic identity |

**No backend for MVP.** All scenario data is static TypeScript. All state is in-browser.

---

## 3. Application Structure

```
survive-disaster-simulator/
|
+-- public/                    # Static assets
|   +-- fonts/                 # Self-hosted font files
|   +-- images/                # Disaster background images
|
+-- src/
|   +-- main.tsx               # App entry point
|   +-- App.tsx                # Root component + router
|   |
|   +-- screens/               # Top-level screen components (one per game state)
|   |   +-- IntroScreen.tsx    # Cinematic game intro
|   |   +-- DisasterSelect.tsx # Disaster selection screen
|   |   +-- DisasterIntro.tsx  # Per-disaster cinematic intro
|   |   +-- ScenarioScreen.tsx # Main gameplay (situation + decision)
|   |   +-- ConsequenceScreen.tsx
|   |   +-- OutcomeScreen.tsx  # End-of-disaster outcome
|   |   +-- ReportScreen.tsx   # Preparedness score + report
|   |
|   +-- components/            # Reusable UI components
|   |   +-- CinematicText.tsx  # Typewriter / reveal text component
|   |   +-- DecisionPanel.tsx  # Decision options panel
|   |   +-- CountdownTimer.tsx # Visible countdown timer
|   |   +-- ScoreBar.tsx
|   |   +-- ScreenTransition.tsx
|   |
|   +-- engine/                # Core game logic (pure functions, no UI)
|   |   +-- scenarioRunner.ts  # Traverses scenario DAG
|   |   +-- scoreCalculator.ts # Computes preparedness score
|   |   +-- reportBuilder.ts   # Assembles preparedness report data
|   |
|   +-- data/                  # Deterministic scenario data (safety-critical)
|   |   +-- types.ts           # TypeScript types for scenario data model
|   |   +-- earthquake.ts      # Earthquake scenario DAG
|   |   +-- fire.ts            # Fire scenario DAG
|   |   +-- flood.ts           # Flood scenario DAG
|   |
|   +-- store/
|   |   +-- gameStore.ts       # Zustand global game state
|   |
|   +-- styles/
|   |   +-- global.css
|   |   +-- themes/
|   |   |   +-- earthquake.css
|   |   |   +-- fire.css
|   |   |   +-- flood.css
|   |   +-- animations.css
|   |
|   +-- hooks/
|       +-- useCountdown.ts
|       +-- useScenario.ts
|
+-- docs/                      # Project documentation
+-- AGENTS.md
+-- index.html
+-- vite.config.ts
+-- tsconfig.json
+-- package.json
```

---

## 4. Game-State Architecture

Game state is managed by a single **Zustand store** (`src/store/gameStore.ts`).

```typescript
interface GameState {
  // Session
  hasSeenIntro: boolean;

  // Disaster selection
  activeDisaster: 'earthquake' | 'fire' | 'flood' | null;

  // Scenario traversal
  currentNodeId: string;
  visitedNodes: string[];

  // Decision tracking (for scoring + report)
  decisions: DecisionRecord[];  // { nodeId, choiceId, isCorrect, scoreImpact }

  // Score
  totalScore: number;

  // Actions
  selectDisaster: (disaster: DisasterType) => void;
  recordDecision: (record: DecisionRecord) => void;
  advanceTo: (nodeId: string) => void;
  resetSession: () => void;
}
```

State is **not persisted to localStorage** for MVP.

---

## 5. Scenario Data Model

All scenario content lives in `src/data/` as TypeScript objects.

```typescript
// src/data/types.ts

export type NodeType = 'intro' | 'decision' | 'consequence' | 'outcome' | 'report';

export interface BaseNode {
  id: string;
  type: NodeType;
  nextNodeId?: string;
}

export interface IntroNode extends BaseNode {
  type: 'intro';
  narrativeText: string;
  atmosphere: string;
  nextNodeId: string;
}

export interface DecisionNode extends BaseNode {
  type: 'decision';
  situationText: string;
  contextHint?: string;
  choices: Choice[];
  timeLimit?: number;
  defaultChoiceId?: string;
}

export interface Choice {
  id: string;
  label: string;
  isCorrect: boolean;
  scoreImpact: number;
  consequenceText: string;
  insight: string;       // Sourced preparedness fact — primary: NDMA/SACHET/112 ERSS; supplementary: FEMA/Red Cross
  nextNodeId: string;
}

export interface OutcomeNode extends BaseNode {
  type: 'outcome';
  survived: boolean;
  narrativeText: string;
  nextNodeId: string;
}

export interface ReportNode extends BaseNode {
  type: 'report';
  // Dynamically assembled from game state
}

export type ScenarioNode = IntroNode | DecisionNode | OutcomeNode | ReportNode;

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  theme: 'earthquake' | 'fire' | 'flood';
  startNodeId: string;
  nodes: Record<string, ScenarioNode>;
}
```

---

## 6. Decision / Consequence Model

The scenario engine (`src/engine/scenarioRunner.ts`) is a **pure function**:

1. Receives: current node ID + player's choice ID
2. Looks up the choice in the current node
3. Returns: `{ nextNodeId, consequenceText, insight, scoreImpact }`

No side effects. The Zustand store dispatches the result.

```
Player selects choice
→ scenarioRunner.evaluateChoice(currentNode, choiceId)
→ Returns ConsequenceResult
→ Store records decision (for report)
→ Store advances to nextNodeId
→ Screen renders next node type
```

---

## 7. Scoring Architecture

```typescript
// src/engine/scoreCalculator.ts

interface DecisionRecord {
  nodeId: string;
  choiceId: string;
  isCorrect: boolean;
  scoreImpact: number;
  timeBonus?: number;
}

// Score = sum of (scoreImpact + timeBonus) per decision
// Normalized to 100-point scale based on max possible score for the scenario
// Clamped to [0, 100]
```

Score is computed **once at the end**, not incrementally, to preserve tension.

---

## 8. Data-Driven Scenarios

Adding a new disaster requires only:
1. Create `src/data/newdisaster.ts` — a `Scenario` object
2. Create `src/styles/themes/newdisaster.css` — visual theme
3. Register in `DisasterSelect.tsx`

No engine changes, no store changes, no routing changes.

---

## 9. AI Integration (Future, Safety-Constrained)

AI may be added post-MVP for:
- Adaptive narration (rewrites scene text in player's preferred style)
- Personalized feedback (tailored learning summary)
- Difficulty adjustment

**Hard constraints (non-negotiable):**
- AI never generates `Choice.insight` or any safety-critical guidance
- AI never determines `Choice.isCorrect` or `Choice.scoreImpact`
- AI may only write flavor/narration text wrapping pre-approved static facts
- AI output is rendered only in "narrative" UI zones, never in decision/consequence system

**Integration point:** `src/services/aiNarrator.ts` wraps AI calls. The engine never calls AI.

---

## 10. Deployment Architecture

**MVP:** Static hosting — no server required.

| Option | Notes |
|---|---|
| **GitHub Pages** | Zero cost, deploys from main via GitHub Actions |
| **Vercel** | One-click deploy, preview URLs per PR — recommended |
| **Netlify** | Alternative to Vercel |

**Build command:** `npm run build` → outputs to `dist/`
No environment variables required for MVP.

For AI integration: Vercel Edge Function or Firebase Function proxies Gemini API calls.

---

## 11. Testing Approach

| Test type | Tool | Coverage target |
|---|---|---|
| Unit — engine logic | Vitest | scenarioRunner, scoreCalculator, reportBuilder |
| Unit — data integrity | Vitest | Validate scenario DAG has no broken node references |
| Component | React Testing Library | DecisionPanel, CountdownTimer, ScoreBar |
| E2E (optional) | Playwright | Full gameplay flow: intro → decision → report |

**Data-integrity test (high priority):** A Vitest test that walks every scenario DAG and asserts:
- Every `nextNodeId` references a valid node
- Every `Choice.nextNodeId` references a valid node
- Every scenario has a reachable `outcome` node
