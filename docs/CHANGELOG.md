# CHANGELOG.md — SURVIVE: Disaster Response Simulator

All meaningful changes to this project are documented here.
Format: `[YYYY-MM-DD] [Phase] — Description`

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