# CHANGELOG.md — SURVIVE: Disaster Response Simulator

All meaningful changes to this project are documented here.
Format: `[YYYY-MM-DD] [Phase] — Description`

## [2026-10-01] FIX — AI Gateway Vercel Node Runtime & NodeNext Resolution
- **ESM-Compatible .js Specifiers for Vercel Node16/NodeNext Runtime:**
  - Resolved TypeScript `TS2835` compiler errors occurring during Vercel serverless function builds of `api/ai.ts` under `Node16`/`NodeNext` module resolution.
  - Added explicit `.js` extensions across all server-reachable AI gateway imports: `api/ai.ts`, `src/ai/gateway/gatewayCore.ts`, `src/ai/gateway/contextValidator.ts`, `src/ai/gateway/serverProviders.ts`, `src/ai/gateway/gatewayTypes.ts`, `src/ai/gateway/gatewayClient.ts`, `src/ai/jev/jevAdapter.ts`, `src/ai/gemini/geminiAdapter.ts`, `src/ai/safetyFirewall.ts`, and `src/ai/types.ts`.
  - Created `tsconfig.server.json` dedicated to serverless functions in `api/` with `module: "nodenext"` and `moduleResolution: "nodenext"`, and added reference to root `tsconfig.json` for unified `tsc -b` compilation.
  - Set default Gemini model to `gemini-3.5-flash-lite` in `src/ai/gemini/geminiPolicy.ts`.
  - Added focused server-side smoke test suite (`scratch/test_api_ai_smoke.ts`) verifying `GET`, `POST`, error boundaries, and NodeNext resolution.

## [2026-10-01] PHASE 3 (Batch 11) — Live Gemini Provider Integration
- **Live Gemini Provider Integration via `@google/genai`:**
  - Upgraded `ServerGeminiProvider` (`src/ai/gateway/serverProviders.ts`) from deterministic fallback-only behavior to a live server-side Google Gemini integration using the official `@google/genai` SDK (`^2.25.0`).
  - Isolated credential management entirely on the server via `GEMINI_API_KEY` and configurable `GEMINI_MODEL` (defaulting to `gemini-3.5-flash-lite`), with `.env.example` updated with explanatory placeholders.
  - Zero browser leakage: verified via production rollup build that `@google/genai` is cleanly tree-shaken and strictly absent from client browser bundles (`dist/assets/*.js`).
- **Safety Firewall & Operational Policy Constraints:**
  - Enforced structured JSON output schema (`responseSchema`: `text`, `tone`) and max output tokens (140) to eliminate markdown bloat and unparsed payload risk.
  - Reduced server-side Gemini timeout to `2500ms` (`GEMINI_TIMEOUT_MS`), providing an operational buffer before the client gateway's `2800ms` abort deadline.
  - Routed all live responses through `validateGeminiEnvelope` in the Safety Firewall, rejecting any out-of-bounds, malicious, or safety-critical tampering.
  - Enforced strict sanitized error handling: provider network or timeout errors cleanly log and gracefully return deterministic fallback without leaking internal stack traces or secrets.
- **Bilingual Support (English & Authentic Roman Hinglish):**
  - Added language propagation (`language?: 'en' | 'hinglish'`) to `GeminiNarrativeRequest`.
  - Added language-specific system instructions enforcing authentic Roman Hinglish (Latin script only, natural conversational Hindi written in English letters, zero Devanagari) when `language === 'hinglish'`.
  - Upgraded `generateDeterministicGeminiFallback` in `src/ai/gemini/geminiAdapter.ts` to supply deterministic Roman Hinglish fallback narratives alongside English fallback.
- **Gameplay HUD Integration & Asynchronous Pacing:**
  - `ScenarioScreen`: Asynchronously requests creative atmospheric narration (`requestNarrative`) on node load according to the active language, updating `aiDirectorState` without blocking user choices or timers.
  - `ConsequenceScreen`: Seamlessly attaches and displays `aiNarrativeContext` or fallback advisory within the AI Director narrative card with firewall disclaimer.
- **State Invariance & Safety Architecture Integrity:**
  - Guaranteed 100% simulation invariance: Google Gemini functions solely as a bounded creative/narrative layer.
  - The deterministic SURVIVE engine remains the sole authority for safety truth, score, survival outcomes, hazard level, panic level, safety integrity, visibility, NPC states, city states, disaster chains, and decision branching.
  - Jev Advisory Brain remains in deterministic fallback mode (no live integration, zero invented endpoints).
  - Disaster Director remains strictly in `PRE_VENUE` framework mode ahead of the 3 October 2026 venue final.
- **Verification & QA:**
  - Dedicated Batch 11 test suite (`scratch/test_batch11_gemini.ts`): **25/25 assertions passed** covering missing key fallback, language branching, custom model specification, gateway status, malicious injection rejection, bundle secret scanning, and graceful degradation.
  - `npm run lint`: 0 errors.
  - `npm run build`: 0 errors (570 modules compiled, zero secrets in bundle).
  - `git diff --check`: 0 whitespace errors.

## [2026-10-01] PHASE 3 (Batch 10) — Player Experience + Information Hierarchy & Complete Hinglish Localization
- **Information Hierarchy & Progressive Disclosure:**
  - **ScenarioScreen:**
    - Established Layer 1 HUD focus: player immediately perceives the core emergency with scenario title, compact stress badge, compact hazard badge, countdown timer, situation narrative card, decision question, and prominent action choices.
    - Added Layer 2 collapsible System Status drawer (`SYSTEM STATUS [▼/▲]`), collapsed by default, revealing detailed environmental integrity, squad cohesion, city macro status, training pace, adaptive difficulty, hazard, safety integrity, visibility, and director status on demand.
  - **ConsequenceScreen:**
    - Prioritized primary consequence flow: Decision evaluation badge, Your Action card, Immediate Consequence / New Risk card, Safer Response card, Authoritative NDMA Grounding card, and prominent Continue Simulation action button.
    - Encapsulated deep simulation systems inside Layer 3 collapsible Advanced Incident Analysis drawer (`ADVANCED ANALYSIS [▼/▲]`), collapsed by default (housing Butterfly Effect, Dynamic Hazard Propagation, Behavioral Profile, NPC Survival Squad, City Brain, Multi-Disaster Chain, Alternative Timeline What-If, AI Director, and Disaster Director Pre-Venue framework).
  - **ReportScreen:**
    - Restructured flow to show immediate learning outcomes first: Preparedness Rating, Numerical Score & Optimal Decision Summary, Decision-by-Decision Replay breakdown, and Key NDMA Takeaways.
    - Encapsulated all 9 audit modules inside collapsible Deep Incident Analysis & Simulation Audits section (`DEEP INCIDENT ANALYSIS & SIMULATION AUDITS [▼/▲]`), collapsed by default (housing Stress Regulation, Environmental Containment, Behavior & Instinct vs Training, NPC Survival Squad, City Brain & Infrastructure, Multi-Disaster Chain, Alternative Timeline What-If, AI Director Architecture, and Disaster Director Pre-Venue audit).
    - Preserved official Emergency Helplines, Educational Disclaimer, Guest persistence banner, and action buttons.
- **Complete Roman Hinglish Localization:**
  - Standardized all shared UI strings into `src/i18n/types.ts` and `src/i18n/ui.ts` for English and Hinglish.
  - Localized every badge, drawer toggle button, telemetry metric, status chip, consequence card title, audit label, footer action, and menu text without hardcoded one-offs.
- **Deterministic Simulation & Safety Integrity Invariance:**
  - 100% preservation of NDMA safety truth, scoring calculations, panic engine formulas, adaptive difficulty, and timer constraints ($\ge 10\text{s}$).
  - All 6 regression simulation suites pass (Batch 9, Batch 8, Batch 7, Batch 5/6, Batch 3/4, Batch 2).
  - Zero Supabase database schema modifications.

## [2026-10-01] PHASE 3 (Batch 9) — Live Adaptive Disaster Director — Pre-Venue Framework
- **Pre-Venue Architecture & Hackathon Final Alignment:**
  - Architected the pre-venue foundation for the Live Adaptive Disaster Director ahead of the Round 2 offline final on 3 October 2026.
  - Strictly enforced the pre-venue framework boundary: the system operates in `PRE_VENUE` Standby mode with full atmospheric pacing and telemetry logging, while full runtime adaptive mutation is reserved for onsite deployment at the venue.
- **Deterministic Event Registry (`src/ai/director/eventRegistry.ts`):**
  - Registered the complete allowlist of 8 Director events with disaster compatibility and deterministic eligibility predicates:
    - `ROUTE_CONGESTION` (earthquake, fire, flood) — evacuation bottlenecks under strained municipal access or crowd panic
    - `AFTERSHOCK_PRESSURE` (earthquake) — secondary tremors under active seismic hazard or high risk convergence
    - `DEBRIS_FALL` (earthquake, fire) — architectural shatter obstructing pathways
    - `SMOKE_DENSITY_SURGE` (fire) — combustion gasses billowing into stairwells
    - `COMM_DELAY` (earthquake, flood) — emergency network tower congestion
    - `PANIC_RIPPLE` (earthquake, fire, flood) — crowd anxiety and companion distress contagion
    - `WATER_SURGE` (flood) — torrential runoff and drainage backflow
    - `POWER_FLICKER` (earthquake, fire, flood) — transformer faults and emergency circuit tripping
  - Rejects all unknown, out-of-bounds, or invented event candidates.
- **Deterministic Validation & Cooldown Boundary (`src/ai/director/cooldownTracker.ts`, `src/ai/director/directorValidator.ts`):**
  - Pure offline validation pipeline checking allowlist membership, disaster compatibility, eligibility predicates, cooldown satisfaction, and clamping severity bounds (1 to 5).
  - Enforces per-run cooldown windows (2 nodes) to prevent event spamming and preserve atmospheric pacing.
- **Pre-Venue Execution Coordinator (`src/ai/director/adaptiveDirector.ts`, `src/ai/director/directorExecutor.ts`):**
  - Singleton `adaptiveDirector` coordinating the evaluation pipeline across playthrough steps.
  - In `PRE_VENUE` mode, sets `status: 'STANDBY_FRAMEWORK'` and applies cooldowns and narrative pacing without altering core simulation state.
  - Supports automatic session resets on scenario re-selection or retry.
- **State Invariance (AI ON === AI OFF):**
  - Guaranteed 100% state invariance: the Disaster Director NEVER becomes the authority for safety truth.
  - The deterministic simulation engine remains the sole authority for panic, hazard, safetyIntegrity, visibility, training/instinct scores, difficulty level, NPC state, city state, disaster chain state, and survival outcomes.
- **UI & HUD Integrations (`src/screens/`, `src/components/`):**
  - `ScenarioScreen`: Displays non-intrusive HUD chip `DIRECTOR: STANDBY [PRE-VENUE]` and recommendation advisory banner when active.
  - `ConsequenceScreen`: Dedicated card `DISASTER DIRECTOR // PRE-VENUE FRAMEWORK` displaying event, category, trigger reason, source badge, validation state, and pre-venue framework compliance notice.
  - `ReportScreen`: Dedicated audit card `DISASTER DIRECTOR AUDIT (PRE-VENUE FRAMEWORK)` with step evaluation counts, registry validation metrics, cooldown blocks, source breakdown, and pre-venue disclaimer banner.
  - `RunInspectorModal`: Flight recorder client-side telemetry reconstruction for Director events with zero Supabase schema migrations.
- **Verification & QA:**
  - Dedicated Batch 9 test suite (`scratch/test_batch9_simulation.ts`): **742 assertions verified** across all 7 scenarios with 100% pass rate.
  - Regression test suites passed: Batch 8 (979 assertions), Batch 7 (944 assertions), Batch 5/6 (964 assertions), Batch 3/4 (789 assertions), Batch 2 (100%).
  - `npm run lint`: 0 errors.
  - `npm run build`: 0 errors (565 modules compiled).
  - `git diff --check`: 0 whitespace errors.

## [2026-10-01] PHASE 3 (Batch 8) — AI Architecture: Secure Live AI Gateway Foundation
- **Server-Side AI Gateway Boundary (`api/ai.ts`, `src/ai/gateway/`):**
  - Architected a secure serverless boundary using Vercel Serverless Function entry point (`api/ai.ts`) supporting both Web Standard (`POST`, `GET`) and Node.js handler signatures.
  - Core modular gateway orchestration (`src/ai/gateway/gatewayCore.ts`) coordinating validation, dispatch, timeout controls, and safety firewall execution.
- **Strict Credential Isolation & Secret Safety:**
  - Environment variables isolated to server side only: `GEMINI_API_KEY`, `JEV_API_URL`, `JEV_API_KEY`.
  - Zero `VITE_` secret prefixes in client code; client bundles contain zero provider credentials or private endpoints.
  - Template `.env.example` documents variable names only with zero hardcoded values.
  - Neither live provider keys nor fake endpoints exist in source code or client assets.
- **Inbound Context Allowlist & Payload Protection (`src/ai/gateway/contextValidator.ts`):**
  - Enforces strict 16 KB payload ceiling (`MAX_GATEWAY_PAYLOAD_BYTES`).
  - Scans for and rejects unauthorized sensitive fields (`apiKey`, `password`, `service_role`, `token`, `auth`, `email`).
  - Rejects script injection (`<script>`, `eval(`) and simulated state mutation attempts (`safety=`, `score=`, `survived=`).
  - Enforces numerical bounds and allowlisted disaster types on `AiContext`.
- **Server-Side Provider Abstractions (`src/ai/gateway/serverProviders.ts`):**
  - `ServerJevProvider`: Checks server environment, executes bounded timeout queries with `AbortController`, enforces `validateJevEnvelope`, and returns deterministic fallback when unconfigured or failing.
  - `ServerGeminiProvider`: Checks server environment, executes bounded timeout queries with `AbortController`, enforces `validateGeminiEnvelope`, and returns deterministic fallback when unconfigured or failing.
- **Client Boundary Integration (`src/ai/gateway/gatewayClient.ts`, `src/ai/jev/jevAdapter.ts`, `src/ai/gemini/geminiAdapter.ts`):**
  - Client adapters communicate through `gatewayClient` to `/api/ai`.
  - Non-blocking client timeouts (2800ms) guarantee zero gameplay stalls; immediate fallback engages if gateway is unreachable (e.g. offline, local dev server without backend).
  - Explicit and honest UI status: remains in `DETERMINISTIC FALLBACK` mode with zero false "LIVE" claims.
- **Verification & QA:**
  - Dedicated Batch 8 simulation suite (`test_batch8_simulation.ts`): **979/979 assertions passed** across all 7 scenarios.
  - Confirmed state invariance: **AI ON === AI OFF** (scores, hazards, safety integrity, panic, NPC status, city state, disaster chain, and outcomes remain 100% identical).
  - Regressions verified: Batch 7 (944/944 passed), Batch 5/6 (964/964 passed), Batch 3/4 (789/789 passed), Batch 2 (100% passed).
  - `npm run lint`: 0 errors.
  - `npm run build`: 0 errors (557 modules compiled).
  - `git diff --check`: 0 whitespace warnings.

## [2026-09-30] PHASE 3 (Batch 7) — AI Architecture: JEV + GEMINI Two-Brain System & Safety Firewall
- **Three-Layer AI Architecture (`src/ai/types.ts`, `src/ai/aiDirector.ts`):**
  - Architected a clear, safety-critical separation of concerns:
    - **Layer 1 — Gemini Creative Brain (`src/ai/gemini/`):** Bounded narrative enrichment, contextual NPC dialogue, and educational reflections (strictly clamped: max 2 sentences, <= 280 chars). Gemini has ZERO authority over simulation state, scoring, or survival outcomes.
    - **Layer 2 — Jev Decision Brain (`src/ai/jev/`):** Strategic event recommendation, bounded NPC intent, and dynamic difficulty pressure recommendations. Operates via structured recommendation envelopes (`JevRecommendation`) without mutating game state.
    - **Layer 3 — Authoritative Deterministic Simulation Engine (`src/engine/`):** Sole authority for all safety-critical consequences, state deltas (panic, hazard, safety, visibility), convergence, squad dynamics, city brain, multi-disaster chains, and survival scores.
- **Safety Architecture Firewall (`src/ai/safetyFirewall.ts`):**
  - Strict allowlist filtering for bounded event types (`ROUTE_CONGESTION`, `AFTERSHOCK_PRESSURE`, `DEBRIS_FALL`, `SMOKE_DENSITY_SURGE`, `COMM_DELAY`, `PANIC_RIPPLE`, `WATER_SURGE`, `POWER_FLICKER`, `STANDARD_PROGRESSION`).
  - Validation guards enforce confidence threshold (>= 60), schema compliance, length bounds, and rejection of injection payloads (`eval`, `script`, state mutation tokens like `safety=`, `score=`, etc.).
  - Automatic fallback to deterministic engine on firewall rejection or network failure.
- **State Invariance & Zero Gameplay Disruption:**
  - Guaranteed invariant: AI ON === AI OFF. Core simulation outcomes, scores, and DAG transitions remain 100% identical regardless of whether AI recommendations are present or absent.
  - Fully asynchronous, non-blocking requests with abort controllers and deterministic fallback generation. Zero latency impact on per-decision timers (>= 10s floor preserved) or player interactions.
- **Zero-Migration Historical Replay Telemetry (`src/components/RunInspectorModal.tsx`):**
  - Enhanced client-side telemetry reconstruction (`reconstructRunTelemetry`) with deterministic AI Director events and fallback indicators without altering the Supabase database schema.
- **HUD & UI Integrations (`src/screens/`):**
  - ScenarioScreen: Live `DIRECTOR: {event}` HUD badge, non-intrusive tactical advisory banner above situation card.
  - ConsequenceScreen: Dedicated **AI DIRECTOR // CONTEXT** panel with provider badge (`GEMINI CREATIVE BRAIN` vs `DETERMINISTIC FALLBACK`) and non-authoritative NDMA grounding notice.
  - ReportScreen: Comprehensive **AI DIRECTOR & TWO-BRAIN ARCHITECTURE AUDIT** card with provider status, event counters, fallback audit, safety architecture firewall banner, and decision replay chips.
- **Verification & QA:**
  - Simulation suite (`scratch/test_batch7_simulation.ts`) passed 944 assertions across all 7 scenarios, verifying invariance, firewall allowlists, fallback determinism, and timer preservation.
  - Batch 5/6 (964/964), Batch 3/4 (789/789), and Batch 2 regression suites passing 100%.
  - `npm run lint`: 0 errors.
  - `npm run build`: 0 errors.
  - `git diff --check`: 0 whitespace errors.

## [2026-09-30] PHASE 3 (Batch 5 & 6) — Deep Simulation Systems: NPC Survival Squad + City Brain & Multi-Disaster Chain + Alternative Timeline
- **Deterministic NPC Survival Squad Engine (`src/engine/simulationState.ts`):**
  - Architected modular companion model (`NpcMember`) with distinct roles (`MEDIC`, `TECHNICIAN`, `ELDER`, `GUIDE`, `VULNERABLE_CIVILIAN`), individual health/safety (0–100), trust (0–100), stress (0–100), and statuses (`SAFE`, `STABLE`, `DISTRESSED`, `INJURED`, `CRITICAL`).
  - Implemented authentic disaster-specific companion squads:
    - Earthquake: Dr. Aarti (Medic), Kabir (Technician), Sunita (Elder).
    - Fire: Captain Verma (Guide), Ananya (Medic), Rohan (Vulnerable civilian).
    - Flood: Vikram (Guide), Nurse Deepa (Medic), Tariq (Technician).
  - Derived holistic Squad Cohesion score (0–100) dynamically weighted by average trust (40%), member safety (35%), and stress resilience (25%).
  - Implemented deterministic Specialist Synergies: Active Medic provides panic buffer (-3) during trauma when cohesion >= 65; active Technician provides hazard buffer (-2 to -3) during structural/utility crises when cohesion >= 65.
  - Authentic context-driven dialogue barks reflecting live member status and stress tiers.
- **City Brain Municipal Crisis Simulation (`src/engine/simulationState.ts`):**
  - Macro-level municipal infrastructure and emergency response modeling: `infrastructureIntegrity` (0–100), `trafficFlow` (0–100), `emergencyAccess` (0–100), `publicOrder` (0–100), `utilityStability` (0–100), and `responderAvailability` (0–100).
  - Categorical City Macro Status: `OPERATIONAL`, `STRAINED`, `OVERWHELMED`, `CRITICAL_GRIDLOCK`.
  - Micro-decisions cascade into city grid: prompt utility shutdowns safeguard grid integrity and clear emergency corridors; delayed alerts or stampedes reduce public order and block rescue access.
- **Multi-Disaster Secondary Hazard Chain Engine (`src/engine/simulationState.ts`):**
  - Deterministic secondary disaster escalation:
    - Earthquake -> Gas Leak & Electrical Fire (`CHAIN-EQ-GAS-ARC`).
    - Flood -> Submerged Grid Electrocution & Contaminated Runoff (`CHAIN-FL-ELEC-SEW`).
    - Fire -> Structural Collapse & Toxic Polymer Flashover (`CHAIN-FR-STRUCT-TOX`).
  - Dynamic Chain Severity progression: `INACTIVE` -> `MONITORING` -> `IMMINENT` -> `ACTIVE` -> `CONTAINED`.
  - Deterministic trigger calibration: activates when city utility stability <= 45 or local hazard level >= 65; transitions to `CONTAINED` when player takes prompt NDMA protective actions while chain is imminent/active.
- **Alternative Timeline & "What If?" Counterfactual Engine (`src/engine/simulationState.ts`):**
  - Pure, non-mutating counterfactual simulator `simulateAlternativeChoice(node, chosenChoiceId, stateAtDecision, disasterType)`.
  - Evaluates unchosen paths to project counterfactual panic, hazard, safety, squad cohesion, and emergency access.
  - Dynamically synthesizes divergence summary and classifies regret/validation level (`STRONG_VALIDATION`, `MARGINAL_DIFFERENCE`, `TACTICAL_REGRET`, `CRITICAL_MISTAKE`).
  - 100% deterministic rule-based evaluation without runtime LLMs or hallucinations.
- **Scenario HUD & Telemetry Extensions (`src/screens/ScenarioScreen.tsx`, `.module.css`):**
  - Added live `SQUAD: {cohesion}%` and `CITY: {status}` chips with dynamic status-color mapping to the telemetry HUD bar.
  - Added dynamic **Multi-Disaster Chain Warning Banner** (`.chainBannerActive`, `.chainBannerImminent`) providing immediate visual and tactical alert when cascading crises threaten.
- **Consequence Screen Multi-System Cards (`src/screens/ConsequenceScreen.tsx`, `.module.css`):**
  - Added **NPC SURVIVAL SQUAD // COMPANION STATUS** card: shows overall squad cohesion gauge, individual member cards with role badges, status pills, trust/stress/safety bars, and contextual spoken dialogue barks.
  - Added **CITY BRAIN // MUNICIPAL CRISIS IMPACT** card: tracks infrastructure integrity, emergency access, utility stability, and public order with live deltas.
  - Added **MULTI-DISASTER CHAIN** card: alerts player when secondary cascade is active/imminent or confirms successful containment.
  - Added **ALTERNATIVE TIMELINE // WHAT IF?** card: displays the unchosen counterfactual action, projected metrics, divergence summary, and regret tag.
- **Report Screen Quad-System Audits (`src/screens/ReportScreen.tsx`, `.module.css`):**
  - Dedicated **NPC SURVIVAL SQUAD & COMPANION AUDIT**: final cohesion, casualty count, companion roster with final health/trust/stress and bilingual NDMA evaluation.
  - Dedicated **CITY BRAIN & MUNICIPAL INFRASTRUCTURE AUDIT**: final municipal status, emergency access corridor rating, utility stability, and civic resilience assessment.
  - Dedicated **MULTI-DISASTER CHAIN & SECONDARY HAZARDS**: cascading threat status, trigger timeline, containment assessment, and NDMA cascading risk protocol grounding.
  - Dedicated **ALTERNATIVE TIMELINES & WHAT-IF ANALYSIS**: comparative breakdown of key divergent junctures, highlighting catastrophic traps avoided and alternative outcomes.
  - Enriched Decision Breakdown replay cards with `SQUAD`, `CITY`, and `CHAIN` tags, plus `🔀 What If` branch comparative explanations.
- **Run Inspector Modal Replay Telemetry (`src/components/RunInspectorModal.tsx`, `.module.css`):**
  - Extended client-side deterministic telemetry reconstruction (`reconstructRunTelemetry`) with squad cohesion, city macro status, chain severity, and alternative timeline counterfactuals.
  - Enriched historical run cards with `SQUAD: XX%`, `CITY: {status}`, `CHAIN: {status}` chips, and expandable `What If` comparative panels without modifying Supabase database schema.
- **Verification & QA:**
  - Automated simulation test (`scratch/test_batch5_batch6_simulation.ts`) verified 100% pass across all 7 scenarios with 964 assert validations (squad dynamics, city brain metrics, chain state progression, counterfactual evaluation, timer floor >= 10s, and determinism).
  - Regression tests `scratch/test_batch3_batch4_simulation.ts` (789/789 passed) and `scratch/test_batch2_simulation.ts` (100% passed).
  - `npm run lint`: 0 errors.
  - `npm run build`: 0 errors.
  - `git diff --check`: 0 whitespace warnings.

## [2026-09-30] PHASE 3 (Batch 3 & 4) — Deep Simulation Systems: Instinct vs Training & Adaptive Difficulty
- **Deterministic Instinct vs Training Behavioral Model (`src/engine/simulationState.ts`):**
  - Architected dual-axis behavioral scoring: `instinctScore` (0–100, initial 50) tracking intuitive crisis reflexes and `trainingScore` (0–100, initial 50) tracking NDMA protocol compliance and structured response.
  - Defined bounded behavioral bands: `INSTINCTIVE` (0–35), `DEVELOPING` (36–60), `TRAINED` (61–80), `DISCIPLINED` (81–100).
  - Derived 5 holistic behavioral archetypes: `DISCIPLINED_SURVIVOR` (High training + High instinct), `METHODICAL_OPERATOR` (High training + Low instinct), `IMPULSIVE_RESPONDER` (High instinct + Low training), `VULNERABLE_HESITANT` (Low training + Low instinct), and `BALANCED_RESPONDER` (Balanced growth).
  - Captured dynamic behavioral signals: `RAPID_DECISIVE_SAFE`, `HESITANT_SAFE_RECOVERY`, `MEASURED_PROTOCOL_ADHERENCE`, `HIGH_STRESS_COMPOSURE`, `POST_ERROR_RECOVERY`, `IMPULSIVE_RISK_REFLEX`, `HESITANT_PARALYSIS`, `PANIC_COMPROMISE`, and `COMPOUNDING_ERROR`.
  - Safety grounding: Behavioral scores are purely evaluative; they never override deterministic NDMA safety outcomes.
- **Deterministic Adaptive Difficulty System (`src/engine/simulationState.ts`):**
  - Implemented bounded `difficultyLevel` (1–5, initial 2: Standard baseline) that adapts to demonstrated operator competence.
  - Anti-Death-Spiral & Relief Protection: Critical panic (>= 70) or consecutive errors immediately downscale difficulty to prevent impossible spirals and grant a stabilized recovery window.
  - Hysteresis Hold: Difficulty requires sustained performance (>= 2 consecutive optimal decisions, panic <= 45, training >= 55) to escalate, preventing rapid oscillation between decisions.
  - Environmental Hazard Scaling: Level 4–5 slightly intensifies hazard impact on errors (+3%), while Level 1 mitigates hazard impact (-3%) to foster learning.
  - Timer Pressure Modifiers: Level 1 (+1s grace), Level 2 (0s baseline), Level 3 (-1s), Level 4 (-2s), Level 5 (-3s).
  - **Strict Safety Floor:** Composed timer modifier `Math.max(10, baseTimer + panicModifier + difficultyModifier)` strictly guarantees that decision windows NEVER fall below 10 seconds under any condition.
- **Scenario HUD & Telemetry Extensions (`src/screens/ScenarioScreen.tsx`, `ScenarioScreen.module.css`):**
  - Added live `TRAIN: {band}` and `DIFF: L{lvl}/5` chips to the telemetry HUD bar.
  - Added dynamic combined pressure indicator (`⚡ Xs PRESSURE (PANIC + DIFF Lx)`) and Level 1 assisted grace badge (`⏱ +1s GRACE (DIFF L1)`).
- **Consequence Screen Behavioral Response Card (`src/screens/ConsequenceScreen.tsx`, `ConsequenceScreen.module.css`):**
  - Added dedicated **BEHAVIORAL RESPONSE // INSTINCT VS TRAINING** card displaying active Instinctive Reflex, Protocol Training scores and bands, Operator Profile, and Difficulty Level with deterministic narrative feedback.
- **Report Screen Behavior & Adaptation Audit (`src/screens/ReportScreen.tsx`, `ReportScreen.module.css`):**
  - Integrated dedicated **Behavior & Adaptation Audit** section featuring final Instinct & Training metrics, Peak Difficulty reached, Primary Behavioral Asset, Observed Vulnerability, Operator Survival Profile with bilingual NDMA explanation, and overall adaptation trajectory (`IMPROVED`, `STABILIZED`, `COMPROMISED`).
  - Enriched Decision Breakdown replay cards with `DIFF: Lx`, `TRAIN: {band}`, and `🧠 Behavior` evaluation notes.
- **Run Inspector Modal Replay Telemetry (`src/components/RunInspectorModal.tsx`):**
  - Extended client-side deterministic telemetry reconstruction (`reconstructRunTelemetry`) with difficulty, training band, instinct score, and training score.
  - Added `DIFF: Lx` and `TRAIN: {band}` chips to historical flight recorder cards without any Supabase schema changes.
- **Verification & QA:**
  - Automated simulation test (`scratch/test_batch3_batch4_simulation.ts`) verified 100% pass across all 7 scenarios with 789 individual assert validations (bounded scores, timer floor >= 10s, determinism, anti-spiral relief).
  - Regression test (`scratch/test_batch2_simulation.ts`) confirmed 100% pass on all 7 scenarios.
  - `npm run lint`: 0 errors.
  - `npm run build`: 0 errors.
  - `git diff --check`: 0 whitespace warnings.

## [2026-09-30] PHASE 3 (Batch 2) — Deep Simulation Systems: Dynamic Hazard Propagation & Advanced Convergence
- **Hazard Convergence Risk Engine & Pure Evaluation (`src/engine/simulationState.ts`):**
  - Designed multi-tiered Hazard Convergence Risk Bands: `LOW_RISK`, `MODERATE_RISK`, `HIGH_RISK`, `CRITICAL_RISK`.
  - Defined categorical environmental statuses: `STABLE`, `ELEVATED`, `ESCALATING`, `CRITICAL`.
  - Implemented pure evaluation function `calculatePropagationSummary(disasterType, convergenceBand, hazardLevel, safetyIntegrity, visibility, isCorrect)` delivering disaster-specific grounded narrative trajectories for Earthquake, Fire, Flood, and generic scenarios without runtime LLM generation.
  - Implemented `getConvergenceContext(state, disasterType)` delivering real-time tactical environmental advisories, modifiers, and briefing context without modifying underlying NDMA safety truths.
  - Initialized deterministic disaster baselines in `createInitialSimulationState(disasterType)` (Earthquake: 30% hazard / 80% visibility; Fire: 35% hazard / 70% visibility; Flood: 25% hazard / 85% visibility).
  - Extended `applySimulationState` to calculate cumulative `hazardEscalationCount`, `recoveryEventCount`, and forward `propagationSummary`.
- **Gameplay Telemetry & Hazard Convergence Advisory (`src/screens/ScenarioScreen.tsx`, `ScenarioScreen.module.css`):**
  - Added real-time `ENV: {status}` badge to the simulation telemetry HUD bar with dynamic color mapping (Green `#39d353` → Amber `#ecc94b` → Orange `#ed8936` → Red `#f56565`).
  - Added dynamic **Hazard Convergence Advisory Banner** (`.convergenceBanner`) rendered above the situation card whenever `convergenceBand !== 'LOW_RISK'`. Shows warning icon, advisory title, environmental modifier badge, and contextual warning text.
  - Updated `handleSelectChoice` to pass `targetDisaster` to `evaluateChoice` and pass `propagationSummary` forward to `setConsequence`.
- **Forward Environmental Trajectory in Consequences (`src/screens/ConsequenceScreen.tsx`, `ConsequenceScreen.module.css`):**
  - Integrated dedicated **FORWARD PROPAGATION // ENVIRONMENTAL TRAJECTORY** card inside the Situation Shift block.
  - Displays the active convergence risk band badge (`LOW RISK`, `MODERATE RISK`, `HIGH RISK`, `CRITICAL RISK`) alongside the forward narrative consequence explaining how current environmental degradation impacts subsequent movement.
- **Comprehensive Environmental Containment & Hazard Audit (`src/screens/ReportScreen.tsx`, `ReportScreen.module.css`):**
  - Added dedicated **Environmental Containment & Hazard Audit** section to the Preparedness Report.
  - Computes and visualizes: Peak Hazard Reached, Lowest Safety Integrity, Lowest Visibility, Total Hazard Escalations, and Containment Recoveries.
  - Derives authoritative Containment Rating (`OPTIMAL`, `CONTROLLED`, `COMPROMISED`, `CRITICAL_BREACH`) with bilingual NDMA-aligned containment evaluations.
  - Enriched Decision Replay items with real-time `RISK: BAND` and `HAZARD: XX%` chips, plus forward propagation narrative notes.
- **Flight Recorder Decision Replay Telemetry (`src/components/RunInspectorModal.tsx`, `RunInspectorModal.module.css`):**
  - Implemented client-side deterministic telemetry reconstruction (`reconstructRunTelemetry`): runs simulation state evaluation over historical run decision sequences without requiring Supabase schema changes or database migrations.
  - Displays `RISK`, `HAZARD`, `SAFETY`, and `VISIBILITY` chips on each historical chronological decision card.
- **Verification & QA:**
  - Automated simulation test (`scratch/test_batch2_simulation.ts`) verified 100% pass across all 7 scenarios.
  - `npm run lint`: 0 errors.
  - `npm run build`: 0 errors (strict TypeScript verbatimModuleSyntax verified).
  - `git diff --check`: 0 whitespace warnings.

## [2026-09-30] PHASE 3 (Batch 1) — Deep Simulation Systems: Butterfly Effect, Panic Engine & Timer Lifecycle Polish
- **Deterministic Butterfly Effect & Simulation State Engine (`src/engine/simulationState.ts`):**
  - Architected a pure-function simulation state machine tracking multi-dimensional disaster variables: `panic` (clamped 0–100), `panicBand` (`CALM`, `CONTROLLED`, `ELEVATED`, `HIGH`, `CRITICAL`), `hazardLevel` (0–100), `safetyIntegrity` (0–100), `visibility` (0–100), and dynamic `timerModifierSeconds` (0 to -5s).
  - Implemented pure evaluation function `calculateDecisionDelta(currentState, choice, node, remainingSeconds)`:
    - Safe/optimal decisions reduce panic (with streak bonuses for consecutive optimal actions) and reinforce safety integrity.
    - Suboptimal/high-risk actions escalate panic and hazard level while degrading safety integrity and visibility.
    - Rapid hesitation (<3s remaining on timed nodes) induces a hesitation panic surcharge (+4 pts).
    - Preserves pure mathematical determinism: zero `Math.random()`, zero runtime LLM generation, strictly safety-grounded in NDMA / SACHET principles.
- **Panic Engine & Dynamic Decision Pressure (`src/screens/ScenarioScreen.tsx`, `ScenarioScreen.module.css`):**
  - Dynamic Countdown Scaling: In-game 15s timers are modulated by player stress level: `CALM` (0s), `CONTROLLED` (0s), `ELEVATED` (-2s), `HIGH` (-3s), `CRITICAL` (-5s).
  - Enforced a hard minimum timer floor of 10 seconds under all conditions to ensure fair, playable, and NDMA-verifiable gameplay without unfair instant timeouts.
  - Implemented HUD Psychological Stress & Telemetry Bar:
    - Real-time animated panic gauge with dynamic color mapping (green `#39d353` → calm green `#68d391` → amber `#ecc94b` → orange `#ed8936` → red `#f56565`).
    - Explicit panic pressure indicator formatted to exact delta spec: `⚡ -2s PANIC PRESSURE` (dynamic `{modifier}s` display).
    - Compact secondary metrics displaying `HAZARD`, `SAFETY`, and `VISIBILITY`.
  - Added procedural auditory panic alert pulse (`playPanicSpike` in `src/utils/audio.ts`) on transitioning into `HIGH` or `CRITICAL` stress bands.
- **Timer Lifecycle Stabilization & Scenario Graph Completion (`src/hooks/useCountdown.ts`, `ScenarioScreen.tsx`, `src/data/*.ts`):**
  - **Comprehensive Scenario Timer Coverage:** Added `timeLimit: 15` across all decision nodes across all 7 scenarios (`earthquake.ts`, `fire.ts`, `flood.ts`, `earthquakeWorkplace.ts`, `fireCommercial.ts`, `floodStreet.ts`, `historicalBhuj.ts`), eliminating the regression where timers vanished after the initial decision due to missing node time limits.
  - **Pruned Hook Interval Leaks:** Enhanced `useCountdown.ts` by ensuring interval teardown on `duration` / `resetKey` changes, wrapping interval clear operations in `useCallback`, and setting reset key to `${activeNodeId}_${retryCount}` for clean per-decision countdown instantiation.
  - **Choice Commitment Latch:** Added immediate countdown freeze via `stop()` upon selecting a choice, preventing intervals from running during consequence transitions.
  - **Timeout Screen Reliability:** Maintained robust dedicated timeout state with `RETRY DECISION` and `ABORT SIMULATION` without memory leaks or duplicate writes.
- **Situation Shift (Butterfly Effect) Feedback (`src/screens/ConsequenceScreen.tsx`, `ConsequenceScreen.module.css`):**
  - Integrated dedicated **SITUATION SHIFT // BUTTERFLY EFFECT** card between choice outcome and authoritative NDMA safety insight.
  - Directional delta metrics pills displaying exact situational shifts: `▲ +22 Panic`, `▲ +25% Hazard`, `▼ -25% Safety`, `▼ -40% Visibility`.
  - Consequence shift narrative explaining how the player's action fundamentally altered their immediate environment and psychological composure.
  - Dynamic stress warning banner displaying exact stress tier context (`{currentConsequence.simulationState.panicBand} STRESS PRESSURE:`) instead of static labels.
- **Stress Regulation & Panic Audit (`src/screens/ReportScreen.tsx`, `ReportScreen.module.css`):**
  - Added dedicated **Stress Regulation & Panic Audit** section to the Preparedness Report.
  - Computes peak panic reached, final panic level, and total countdown compression nodes experienced during the simulation.
  - Renders authoritative stress management evaluation assessing tactical composure against official crisis psychology recommendations.
  - Enriched Decision-by-Decision Replay cards with per-step stress indicators (`STRESS: HIGH (64/100)`) and situational shift records.
- **DecisionPanel Runtime Crash & Pseudo-Random Shuffle Fix (`ScenarioScreen.tsx`, `DecisionPanel.tsx`):**
  - Resolved `Uncaught TypeError: Cannot read properties of undefined (reading 'id')` in `DecisionPanel.tsx` caused by a signed integer 32-bit bitwise overflow in `ScenarioScreen.tsx`'s pseudo-random choice shuffle. The signed modulus `% 233280` yielded negative numbers, leading to negative swap index `j = -1` and introducing `undefined` elements into the `displayedChoices` array.
  - Replaced signed calculation with an unsigned 32-bit Mulberry32 PRNG (`>>> 0`), guaranteeing strictly positive random floats in $[0, 1)$ and valid swap indices $j \in [0, i]$.
  - Added a defensive boundary in `DecisionPanel.tsx` logging invalid choice objects to console diagnostics rather than crashing the component tree.
  - Formally verified all 176 decision nodes and choices across all 7 disaster scenarios with an automated audit script, confirming 100% data integrity and zero undefined choices.
- **Quality & Verification:**
  - Passes `npm run lint` with 0 errors.
  - Passes `npm run build` with 0 errors (strict TypeScript verbatimModuleSyntax verified).
  - Passes `git diff --check` with 0 whitespace issues.
  - 100% backward-compatible: preserves guest mode, Supabase auth/persistence, and audio playback.

## [2026-09-27] PHASE 12 (Step 4) — Consistent Operator Navigation & Session UX Audit
- **Standardized Operator Navigation (`OperatorBadge.tsx`, `OperatorBadge.module.css`):**
  - Implemented a unified `OperatorBadge` component rendering clean dark terminal HUD status pills across safe non-game screens (`/`, `/how-to-play`, `/select`, `/disaster/:disasterId/scenarios`, and `/disaster/:disasterId/report`).
  - Authenticated state displays a green pulsing indicator with `OPERATOR: ONLINE`, routing directly to the private dossier at `/profile`.
  - Guest/unauthenticated state provides a clean `LOGIN` action routing to `/auth/login` without leaking private record affordances.
  - Active gameplay screens (`ScenarioScreen`, `ConsequenceScreen`, `OutcomeScreen`, `DisasterIntro`) strictly prohibit operator navigation, eliminating accidental aborts during live 15-second simulation runs.
- **Preparedness Report Navigation (`ReportScreen.tsx`):**
  - Integrated `OperatorBadge` in top HUD bar next to language toggle.
  - Added an explicit `OPERATOR DOSSIER` secondary action button in the completion footer for authenticated operators, enabling seamless transitions from scenario completion to viewing updated stats and telemetry in the Decision Replay Inspector.
- **Dossier Quick Launch (`ProfileScreen.tsx`):**
  - Added direct `SIMULATION CONSOLE` link in the profile header navigation bar, enabling quick transitions from the personnel dossier into disaster selection without returning to the main menu.
- **Stabilized AuthGuard Navigation & Eliminated Re-render Loop (`AuthGuard.tsx`, `App.tsx`, `gameStore.ts`):**
  - Resolved runtime `Maximum update depth exceeded` and Chrome navigation throttling bug caused by React Router's `<Navigate>` component executing inside Framer Motion's `AnimatePresence mode="wait"` exit animations.
  - Replaced `<Navigate>` with a single-flight `useNavigate` call guarded by a persistent ref latch (`hasRedirectedRef`) inside `useEffect`, returning `null` while unauthenticated.
  - Placed `<AuthGuard>` outside `<ScreenTransition>` on `/profile` so unauthenticated visitors never mount or animate the protected route container.
  - Guarded Zustand store actions (`setAuthUserId`, `setAuthLoading`) against redundant state updates with identical values, preventing cascading subscriber re-renders.
  - Reordered `handleSignOut` in `ProfileScreen.tsx` to initiate router navigation to `/` before state teardown, preventing conflicting redirect attempts to `/auth/login`.
- **Autoplay-Compliant Procedural Hover Audio (`audio.ts`):**
  - Added user gesture activation latch (`hasUserInteracted`) listening for initial pointer/keyboard interaction before initializing or resuming Web Audio API context during UI hover events.
  - Completely eliminated yellow browser autoplay warnings (`AudioContext was not allowed to start`) during pre-interaction hovering.

## [2026-09-27] PHASE 12 — Player Profile Dashboard, Operational History & Decision Replay Inspector
- **Authentication Hydration & Session Restoration (`src/App.tsx`, `AuthGuard.tsx`, `gameStore.ts`):**
  - Resolved page refresh regression on `/profile` where `AuthGuard` local state could become stranded in an infinite clearance check.
  - Centralized `isAuthLoading` in Zustand store and coordinated root session hydration (`subscribeToAuthChanges` + `getSession`) with single-flight resolution latch.
- **Operational History Semantic Alignment (`ProfileScreen.tsx`, `ProfileScreen.module.css`):**
  - Audited and resolved semantic ambiguity between lifetime stats (`SIMULATIONS COMPLETED`) and query archive count (`LOGGED RUNS`).
  - Implemented client-side status filter tabs (`ALL RUNS`, `COMPLETED`, `INCOMPLETE / FAILED`) with synchronized breakdown counts.
  - Made run lifecycle status explicitly visible across cards (`EVACUATED`, `NON-SURVIVAL`, `TIMEOUT`, `ABANDONED`, `IN PROGRESS`).
  - Added filter-empty states and click affordances (`AUDIT TELEMETRY ▶`, `INSPECT LOGS ▶`).
- **Black-Box Decision Replay & Incident Inspector (`RunInspectorModal.tsx`, `RunInspectorModal.module.css`):**
  - Implemented in-app incident replay inspector modal backed by user-scoped `fetchRunDetails(runId, userId)`.
  - Displays executive summary: scenario title, disaster category, preparedness score, score band, date/time, duration, and decision efficiency.
  - Renders chronological timeline of all recorded decisions with step numbers, situation context, committed operator action, deterministic emergency consequence, and authoritative NDMA safety protocol insights with source citations.
  - Features dedicated loading, empty, and error fallback states, full keyboard accessibility (Escape to close), backdrop blur, and responsive mobile optimization.
  - Strictly read-only; zero synthetic decision injection; preserves RLS ownership boundaries.

## [2026-09-26] PHASE 11 — Supabase Auth & Persistence Foundation
- **Supabase Integration & Zero-Risk Environment (`src/lib/supabase.ts`, `.env.example`, `.gitignore`):**
  - Added `@supabase/supabase-js` without bundle lock-in.
  - Added `.env.example` template with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
  - Added explicit `.gitignore` rules for all `.env` and `.env.local` files to guarantee zero secrets enter version control.
  - Provided a resilient fallback client in `src/lib/supabase.ts` ensuring guest/offline play functions seamlessly without credentials.
- **Deterministic PostgreSQL Migrations (`supabase/migrations/`):**
  - Created 7 sequential, reproducible SQL migrations: `01_create_profiles.sql`, `02_create_player_stats.sql`, `03_create_auth_trigger.sql`, `04_create_game_runs.sql`, `05_create_decisions.sql`, `06_create_stats_trigger.sql`, `07_enable_rls_and_policies.sql`.
  - Hardened `SECURITY DEFINER` trigger with strict `search_path = public, pg_temp;` to provision profiles and stats on registration.
  - Implemented granular, private-only RLS policies across all tables. Zero anonymous access. Prohibited client-side updates and deletes on historical decisions and aggregate stats.
- **Ordered FIFO Persistence Queue (`src/services/gamePersistenceService.ts`):**
  - Implemented a per-run FIFO promise queue guaranteeing that decisions and run finalization arrive in Supabase in strict deterministic sequence.
  - Fire-and-forget: Network latency never blocks timer countdowns, screen transitions, or tactile choice latches.
- **Authentication Lifecycle & UI (`src/services/authService.ts`, `AuthScreen.tsx`, `AuthGuard.tsx`):**
  - Email/password authentication with server-validated username metadata.
  - Cinematic SURVIVE styling with clear validation feedback and sanitized error messages.
  - Protected `/profile` route with automatic session restoration.
- **Private Player Dossier (`src/screens/ProfileScreen.tsx`):**
  - Displays authenticated user's callsign, average readiness rating, peak score, completed simulations, survival count, and disaster breakdown.
- **Simulation Loop Persistence Integration (`DisasterIntro.tsx`, `ScenarioScreen.tsx`, `ReportScreen.tsx`):**
  - Non-blocking run start, incremental decision queuing, and finalization on report mount.
  - Unauthenticated guests play completely locally with zero network calls and full report generation.
- **Persistence Stabilization & Session Guards (`AuthScreen.tsx`, `gamePersistenceService.ts`):**
  - Ensured `authUserId` is only populated in store when a valid session token is confirmed.
  - Added pre-flight active session verification in `startRun`, `recordDecision`, `finalizeRun`, and `failRun` to prevent unauthenticated/mismatched payloads from violating RLS.
  - Wiped lingering auth state when choosing 'Continue as Guest'.

## [2026-09-26] ROUND 2 — Production Upgrade Safety Checkpoint
- **Baseline tag created:** `pre-production-upgrade` → commit `d3b3755` — annotated, pushed to `origin`.
- **Documentation updated:** `docs/PROJECT_STATE.md` updated with Round 2 venue date (3 October 2026), production upgrade plan, Supabase persistence intent, frozen constraints, main-branch workflow, and agent handoff note.
- **No application code changed.** Working tree clean. Build and lint verified before commit.

## [2026-09-18] ROUND 1 SUBMISSION — Hack 2 Ignite 2026
- **Submission commit:** `d3b3755 docs: finalize judge-ready README`
- Comprehensive 19-section judge-ready README.md published covering: live demo, demo video, gameplay flow, tech stack, safety principles, NDMA grounding, scenario catalogue, USP differentiation, known limitations, and AI disclosure.
- Live deployment: `https://survive-disaster-simulator.vercel.app/`
- Demo video: `https://youtu.be/voib2X3qVCs`
- Team: Team COSMIC — Hack 2 Ignite 2026 (Problem Statement GD-02)


- **Main Menu Console Activity Indicator (`src/screens/IntroScreen.tsx` & `.module.css`):**
  - Integrated subtle terminal blinking cursor indicator (`.consoleCursor`) in the top HUD status line beside `SIMULATION CONSOLE ACTIVE`.
  - Provides immediate visual feedback that the simulation console is live upon initial page load without adding clutter.
- **Transition Assessment:**
  - Evaluated intermediate consequence-to-scenario transition; preserved immediate state navigation to maintain 100% deterministic test reliability and instantaneous user responsiveness.
- **Claim & Documentation Safety Verification:**
  - Standardized factual terminology across documentation, avoiding unsupported statistical absolutes in favor of defensible architectural claims (client-side execution, procedural Web Audio API, NDMA grounding, Playwright verification).
- **Verification & QA:**
  - Build passes cleanly (`npm run build`).
  - Lint clean (`npm run lint`).
  - Git diff clean (`git diff --check`).
  - Automated browser verification passed across all 7 scenarios, Bhuj replay persistence, 15s timer retry reset, Hinglish UI, and mobile viewport 390x844.

## [2026-09-17] PHASE 9.5 — Game Feel & Cinematic Juice Pass
- **Zero-Dependency Procedural Audio Engine (`src/utils/audio.ts`):**
  - Synthesizes all audio natively with the Web Audio API (`AudioContext`, gain nodes, biquad filters, and dynamics compressor).
  - Autoplay-compliant; lazily resumes on user gesture without throwing unhandled exceptions.
  - Implemented tactile procedural sound effects: UI hover micro-clicks, button selections, screen transition swooshes, urgency timer pulse (heartbeat tick at $\le 5$s and timeout buzzer at $0$s), disaster-specific choice impact (low earthquake sub-thud, fire white-noise whoosh, flood resonant surge), and consequence reveal chords (harmonic chime for safe choices, low dissonant chord for risks).
- **Choice Commitment Latch (`src/components/DecisionPanel.tsx` & `.module.css`, `ScenarioScreen.tsx`):**
  - Added an instant choice locking latch on user click: displays an amber `ACTION COMMITTED` status badge, dims opposing choices, triggers the disaster impact SFX, and enforces a 150ms tactile pause before navigation.
  - Transforms static link clicks into a visceral sense of taking an emergency action under pressure.
- **Sequential Consequence Stagger (`src/screens/ConsequenceScreen.tsx`):**
  - Replaced immediate layout pop-in with a 4-beat sequential reveal: Header Status $\to$ Player Action $\to$ Consequence / New Risk $\to$ Safer Response & NDMA Insight $\to$ Continue Action.
  - Triggers consequence reveal audio upon mounting.
- **Cinematic Screen Transitions (`src/components/ScreenTransition.tsx`):**
  - Snappy 380ms transition with subtle scale and brightness modulation.
  - Fully disabled under `prefers-reduced-motion: reduce`.
- **Atmospheric Environmental Overlays (`src/components/EnvironmentalOverlay.tsx` & `.module.css`):**
  - Added particulate dust motes for earthquake, radial heat distortion waves for fire, and undulating water reflections for flood.
  - Fully non-blocking with `pointer-events: none` and `contain: strict`.
- **Verification & QA:**
  - Build passes cleanly (`npm run build`).
  - Lint clean (`npm run lint`).
  - Git diff clean (`git diff --check`).
  - Automated browser verification passed across all 7 scenarios, Bhuj replay persistence, 15s timer retry reset, Hinglish UI, and mobile viewport 390x844.

## [2026-09-17] PHASE 9 — Judge-Ready UX Polish & Consequence-Driven USP
- **P0-1: Exact Replay Scenario Context (`src/screens/ReportScreen.tsx`):**
  - Updated `handlePlayAgain` to preserve `activeScenarioId` in query parameter (`/intro?scenario=${activeScenarioId}`).
  - Resolves issue where replaying Bhuj 2001 defaulted back to the Urban scenario.
- **P0-2 & P0-3: Consequence Chain & Safer Response (`src/screens/ConsequenceScreen.tsx`, `.module.css`, `ScenarioScreen.tsx`, `gameStore.ts`):**
  - Restructured feedback hierarchy into an intuitive crisis sequence: `YOUR ACTION → CONSEQUENCE / NEW RISK → SAFER RESPONSE (NDMA) → PROTOCOL GROUNDING`.
  - Displayed the player's chosen action explicitly.
  - Implemented dynamic "Safer Response" callout for suboptimal decisions using static scenario data (`optimalChoiceLabel`), ensuring zero LLM hallucination risk.
- **P0-4: Always-on Environmental Atmosphere (`src/components/EnvironmentalOverlay.tsx`, `.module.css`, `ScenarioScreen.tsx`):**
  - Enabled continuous subtle environmental effects across untimed and timed nodes (`active={true}`).
  - Added subtle `rumblePassive` keyframe animation for untimed earthquake nodes and continuous background glow/water layers.
  - Retained `pointer-events: none` and `contain: strict` to guarantee 100% clickability and performance.
- **P1-1: Truthful Outcome Presentation (`src/screens/OutcomeScreen.tsx`, `.module.css`):**
  - Conditioned outcome title, icon, and narrative on `currentOutcome.survived`.
  - Non-surviving/suboptimal paths render `⚠️ Critical Incident` with warning styling instead of generic "Survived — Evacuated".
- **P1-2: Score-Band Aware Color Coding (`src/screens/ReportScreen.tsx`):**
  - Dynamically styled the final preparedness score and band rating: Green ($\ge 85$), Amber ($65\text{--}84$), Orange ($40\text{--}64$), and Red ($<40$).
  - Prevents poor performance from displaying in misleading green safe accents.
- **P1-3: Complete Roman Hinglish UI (`src/i18n/types.ts`, `src/i18n/ui.ts`, `DisasterIntro.tsx`, `CountdownTimer.tsx`, `gameStore.ts`):**
  - Added Roman Hinglish translations for gameplay actions ("Scenario Mein Pravaish Karein", "Abhi Faisla Karein").
  - Preserved session language across simulation resets.
- **Quality Assurance & Verification:**
  - Verified 0 TypeScript errors (`npm run build`).
  - Verified 0 lint errors (`npm run lint`).
  - Verified clean diff (`git diff --check`).
  - Verified in Google Chrome via Playwright across all 7 scenarios, Bhuj replay, timer reset, Hinglish UI, and mobile viewport 390x844.

---

## [2026-09-16] PHASE 7E — Bhuj 2001 Historical Simulation (7 Playable Scenarios)
- **Historical Fact Research & Source Verification (`docs/research/BHUJ_2001_RESEARCH.md`):**
  - Documented 26 January 2001 morning Republic Day timeline (~08:46 AM IST), Kutch epicenter (~Chobari/Bhachau/Bhuj), scale discrepancies (IMD 6.9 $M_L$ vs. USGS 7.7 $M_w$), official casualty ranges (GSDMA ~13,805 vs. NIDM/MHA ~20,000+), unreinforced masonry structural failures, and institutional aftermath (formation of GSDMA and NDMA).
- **Playable Bhuj 2001 Historical Scenario (`src/data/historicalBhuj.ts`):**
  - Authored a complete 6-decision node graph with outcome (`bhj-d1-morning-shock` through `bhj-outcome-node`).
  - Features 3 timed 15-second decisions (`bhj-d1`, `bhj-d3`, `bhj-d5`).
  - Implemented 2 branching paths:
    - Path 1: Solid wooden table shelter (`bhj-d2-masonry-triage`) vs. doorway/exterior running injuries (`bhj-d2b-injured-evacuation`).
    - Path 2: Prompt evacuation to open courtyard vs. delaying inside compromised masonry for material valuables.
  - Sourced all decision evaluations and insights strictly from NDMA Earthquake Safety Protocols, NIDM case studies, and EERI 2001 reconnaissance.
- **Natural Roman Hinglish Localization (`src/i18n/historicalBhuj.ts` & `src/i18n/index.ts`):**
  - Fully translated all 7 nodes, choices, consequences, insights, and outcome into natural Roman Hinglish.
  - Registered `historicalBhujHinglish` in `HINGLISH_SCENARIOS` under `earthquake-bhuj-2001`.
- **Historical Simulation Context & Disclaimer UI (`src/screens/ScenarioScreen.tsx` & `.module.css`):**
  - Integrated dedicated historical banner presenting verified incident metadata and explicit educational disclaimer clarifying fictionalized civilian perspective.
- **Scenario Catalogue & Routing Promotion (`src/data/index.ts` & `src/screens/DisasterIntro.tsx`):**
  - Promoted `earthquake-bhuj-2001` from `coming_soon` to `playable` in `SCENARIO_CATALOGUE`.
  - Added tailored intro setting and narrative in `DisasterIntro.tsx`.
  - Maintained strictly locked status for historical fire (Uphaar 1997) and flood (Mumbai 2005) scenarios.
- **Quality Assurance:**
  - Verified 0 TypeScript errors (`npm run build` passes in 268ms).
  - Verified 0 lint errors (`npm run lint`).
  - Verified clean diff (`git diff --check`).

---

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