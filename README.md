# SURVIVE — Disaster Response Simulator

**Decide. Consequence. Adapt. Survive.**

*Built for Hack 2 Ignite 2026 • Problem Statement GD-02 • Team COSMIC*

[![Hackathon](https://img.shields.io/badge/Hackathon-Hack_2_Ignite_2026-orange.svg)](https://github.com/krushnasharma-create/survive-disaster-simulator)
[![Problem Statement](https://img.shields.io/badge/Track-GD--02_Game_Dev-red.svg)](https://github.com/krushnasharma-create/survive-disaster-simulator)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_%7C_TypeScript_6-blue.svg)](https://react.dev/)
[![Bundler](https://img.shields.io/badge/Bundler-Vite_8-646CFF.svg)](https://vite.dev/)
[![Safety Guidance](https://img.shields.io/badge/Safety_Source-NDMA_%7C_112_ERSS-green.svg)](https://ndma.gov.in/)
[![Audio Engine](https://img.shields.io/badge/Sound-Web_Audio_API_(Procedural)-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## 🚀 Live Demo & 🎬 Demo Video

- **Live Web Prototype:** **[Play SURVIVE Live](https://survive-disaster-simulator.vercel.app/)**
  *Interactive browser simulation prototype deployed on Vercel. Works directly on modern desktop and mobile browsers.*
- **Demo Video:** **[Watch the SURVIVE Demo](https://youtu.be/voib2X3qVCs)**
  *Short product demonstration showing the disaster simulation flow, time-critical decisions, consequence-driven gameplay, historical reconstruction, and preparedness reporting.*
- **GitHub Repository:** [https://github.com/krushnasharma-create/survive-disaster-simulator](https://github.com/krushnasharma-create/survive-disaster-simulator)

---

## 1. Executive Summary

**SURVIVE** is a browser-based, high-stakes emergency response simulator created to transform disaster preparedness education. Rather than subjecting learners to static brochures or generic multiple-choice quizzes, SURVIVE places players directly inside evolving crisis environments where every second counts and every decision creates realistic physical consequences.

From the shuddering high-rises of an urban earthquake and the toxic smoke of a commercial complex fire, to street-level flash floods and historical catastrophes like the **2001 Gujarat (Bhuj) Earthquake**, SURVIVE immerses players in authentic emergency situations grounded strictly in **National Disaster Management Authority (NDMA)** and **Government of India 112 Emergency Response Support System (ERSS)** guidelines.

```
+----------------------------------------------------------------------------------------------------+
|                                    SURVIVE GAMEPLAY ARCHITECTURE                                   |
|                                                                                                    |
|  [ Crisis Event ] ---> [ 15s Urgency Countdown ] ---> [ Player Decision ]                          |
|                                                              |                                     |
|                                                              v                                     |
|  [ Final Preparedness Report ] <--- [ Branching Situation ] <--- [ Consequence & Environmental Shift ]|
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Problem Statement & Hackathon Context

- **Hackathon:** Hack 2 Ignite 2026 (48-Hour Hackathon)
- **Problem Statement (GD-02):** *"Create a simulation game that teaches disaster preparedness and emergency response."*
- **Team:** Team COSMIC
- **Lead Developer:** Krushna Sharma ([@krushnasharma-create](https://github.com/krushnasharma-create))

### The Critical Problem
In high-stress emergencies, human panic and cognitive overload cause decision paralysis or deadly mistakes—such as rushing toward crowded elevators during tremors, opening hot doors during structural fires, or stepping into energized floodwaters. Traditional safety education fails because:
1. **Passive reading creates zero muscle memory:** Memorizing guidelines does not train real-time decision-making under stress.
2. **Trivia quiz apps test recall, not survival intuition:** Standard multiple-choice questions offer obvious "right" answers without demonstrating why dangerous instinctual habits prove fatal.
3. **Lack of consequence feedback:** When an action has no visible aftermath, the learner never experiences the risk.

### The SURVIVE Solution
SURVIVE bridges this gap through **consequence-driven interactive simulation**. Players face ticking countdowns, procedural audio-visual stress cues, and branching scenario graphs where choices actively alter room hazards, trap routes, or protect human life.

---

## 3. The Core Differentiator: Consequence-Driven vs Traditional Quiz

| Traditional Disaster Quiz | SURVIVE Disaster Simulator |
| :--- | :--- |
| `Question → Answer → Next Question` | `Decision → Consequence → New Risk → Next Decision → Outcome → Replay` |
| Turn-based, untimed | Real-time 15-second countdown with heartbeat urgency |
| Abstract score deduction (+10 / -10) | Physical environmental state changes (blocked stairwells, smoke buildup) |
| Static vector icons or generic SaaS cards | Non-blocking CSS/SVG environmental overlay, screen rumble, dynamic vignettes |
| Silent or static audio files | Pure procedural **Web Audio API** sound synthesis (zero external audio files) |
| Generic internet survival tips | Grounded in official **NDMA (India)**, **SACHET**, and **112 ERSS** guidance |
| English-only | **Bilingual**: English + Colloquial Roman Hinglish |
| Hypothetical trivia | Documented historical reconstruction (**2001 Bhuj Earthquake**) |

---

## 4. Disaster & Scenario Catalogue

SURVIVE includes **7 fully playable deterministic scenarios** across 3 disaster classifications, alongside documented historical reconstructions:

### 🌋 Earthquake Scenarios
*Ground motion, non-structural hazards, aftershocks, and structural collapse.*
- **Urban High-Rise (`earthquake-urban`) [Playable]:** Caught on the 10th floor of a residential tower during sudden violent shaking. Focus: *Drop, Cover, Hold On*, avoiding window glass, securing head protection, resisting elevator urges, and isolating gas lines post-tremor.
- **Corporate Workplace (`earthquake-workplace`) [Playable]:** Inside a 7th-floor commercial office complex during peak work hours. Focus: False ceiling collapse, falling server equipment, managing stairwell bottlenecks, and assembling in designated open zones.
- **Bhuj 2001 Historical (`earthquake-bhuj-2001`) [Playable Educational Reconstruction]:** Historical simulation of the 26 January 2001 Republic Day earthquake in Kutch, Gujarat (Mw 7.7). Focus: Unreinforced masonry hazards, severe dust blinding, aftershock avoidance, and immediate neighborhood triage.

### 🔥 Fire Scenarios
*Toxic smoke propagation, thermal radiation, asphyxiation avoidance, and safe egress.*
- **Residential Apartment (`fire-residential`) [Playable]:** Midnight kitchen electrical fire spreading rapidly through an apartment corridor. Focus: Backdraft prevention (feeling door handles), crawling under the thermal smoke layer, creating wet cloth door seals, and balcony signaling.
- **Commercial Complex (`fire-commercial`) [Playable]:** Evening restaurant exhaust fire in a crowded multi-storey shopping complex. Focus: Avoiding stampedes, identifying low-level emergency illuminated egress signage, smoke filtration, and guiding others calmly.

### 🌊 Flood Scenarios
*Flash inundation, electrical hazards, urban drainage collapse, and vehicle entrapment.*
- **Urban Flash Flood (`flood-urban`) [Playable]:** Sudden monsoon cloudburst inundating a ground-floor residential home. Focus: Main breaker isolation, vertical evacuation to upper levels, water contamination awareness, and roof signaling.
- **Street Stranded (`flood-street`) [Playable]:** Caught inside a vehicle on a waterlogged road as water levels rise to the door handles. Focus: Timing vehicle evacuation before door pressure lock, avoiding hidden open manholes, and dodging downed electric cables.

### ⏳ Extended Roadmap Scenarios
- **Uphaar Cinema Fire 1997 (`fire-uphaar-1997`) [Locked / Coming Soon]:** Historical simulation of the Delhi cinema tragedy focusing on electrical transformer fires, toxic carbon monoxide inhalation, and unblocked exit enforcement.
- **Mumbai Floods 2005 (`flood-mumbai-2005`) [Locked / Coming Soon]:** Extreme urban deluge simulation focusing on public transport failure, walking through flood currents, and community mutual aid.

---

## 5. How Gameplay Works — The Core Loop

```
+-----------------------------------------------------------------------------------+
| 1. DISASTER SELECT  -> Select Earthquake, Fire, or Flood scenario                |
| 2. CONTEXT BRIEFING -> Read scenario location, situational parameters, & hazards  |
| 3. TIMED DECISION   -> 15-second countdown to choose one of 3 realistic actions   |
| 4. CONSEQUENCE      -> Immediate physical evaluation: health, stress, environment |
| 5. SITUATION SHIFT  -> Next branch loads based on previous choices                |
| 6. FINAL DEBRIEF    -> 0-100% Preparedness Score, mistake breakdown, NDMA tips   |
| 7. SCENARIO REPLAY  -> Instant replay with randomized option ordering             |
+-----------------------------------------------------------------------------------+
```

1. **Environmental Assessment:** The player reviews the crisis context, current structural state, and visual hazard cues.
2. **Time-Critical Decision:** A 15-second timer begins ticking. A procedurally generated heartbeat accelerates in audio pitch and tempo as time elapses.
3. **Randomized Choice Presentation:** Options are shuffled dynamically using the Fisher-Yates algorithm each run to prevent mechanical memorization.
4. **Immediate Consequence:** The player's choice directly evaluates into physical outcomes. Suboptimal choices cause health and stress penalties and trigger hazardous environmental state changes (e.g., stairwells collapsing, smoke spreading into hallways).
5. **Branching Situations:** The player navigates forward through a Directed Acyclic Graph (DAG) until reaching a final survival state.
6. **Detailed Preparedness Report:** A comprehensive debrief categorizes all actions into **Safe**, **Suboptimal**, and **Dangerous**, calculating an overall preparedness score and providing official NDMA Standard Operating Procedures for each choice.

---

## 6. Scenario Engine & Branching Architecture

SURVIVE's scenario engine is built as a pure, deterministic state machine in TypeScript:

- **Directed Acyclic Graph (DAG):** Scenarios are modeled as strongly typed node graphs (`ScenarioNode`). Each node defines the narrative context, hazard indicators, visual FX triggers, and valid choices.
- **Deterministic Outcomes:** In safety-critical emergency training, algorithmic hallucinations cannot be tolerated. Consequences are strictly verified against established disaster management doctrines.
- **Zustand State Store:** Global game state (`gameStore.ts`) tracks:
  - Active scenario and active node pointer
  - Player health, vitality, and cumulative stress
  - Decision history and timestamped choices
  - Environmental intensity (screen rumble, visual cue flags)
  - Language selection (`en` / `hinglish`)
- **Option Randomization:** Choice positions are shuffled on every attempt, ensuring players evaluate actions based on merits rather than memorizing option "A" or "B".
- **Client-Side Hydration:** All scenario models are loaded locally in memory, allowing screen transitions and branching decisions to execute instantly with zero network latency.

---

## 7. Safety Grounding & Public Policy Alignment

Every survival challenge, correct response, and consequence explanation in SURVIVE is aligned with official guidelines published by public disaster management authorities:

1. **National Disaster Management Authority (NDMA, India):**
   - *Earthquake Safety:* "Drop, Cover, and Hold On"; avoiding exterior walls and windows; turning off LPG gas cylinders and electrical mains after shaking stops.
   - *Fire Safety:* "Stop, Drop, and Roll"; testing doors with the back of the hand; crawling below smoke where breathable air remains; sealing door gaps with damp cloth.
   - *Urban Flooding:* Turning off power before water enters; avoiding walking or driving through moving water; staying clear of fallen electrical poles and submerged transformers.
2. **SACHET Portal (NDMA Early Warning System):**
   - Integration of color-coded weather alerts and institutional warning response protocols.
3. **112 Emergency Response Support System (ERSS):**
   - Reinforcing the single pan-India emergency number (112) for all emergency services (Police, Fire, Ambulance, SDRF).
4. **Gujarat State Disaster Management Authority (GSDMA) & IMD:**
   - Grounded seismic data and historical safety evaluations for the 2001 Bhuj scenario.

> **Safety Notice:** SURVIVE is an educational simulation prototype created for Hack 2 Ignite 2026. It is designed to raise general safety awareness and does not guarantee survival in real-world emergencies. It does not carry official government certification and is not a substitute for certified first responder training. In any real emergency, immediately call **112**.

---

## 8. Historical Reconstruction: 2001 Gujarat (Bhuj) Earthquake

The Bhuj simulation (`earthquake-bhuj-2001`) recreates the morning of **26 January 2001** (08:46 AM IST, Mw 7.7) as an educational historical reconstruction:

- **Research Baseline:** Researched using official government documentation, EERI (Earthquake Engineering Research Institute) reports, and IIT Kanpur reconnaissance studies. See [`docs/research/BHUJ_2001_RESEARCH.md`](docs/research/BHUJ_2001_RESEARCH.md).
- **Educational Objective:** Teaches players how unreinforced masonry (URM) structures behave under extreme shaking, why sudden pancake collapses occur, how to survive dense post-collapse dust clouds, and how to conduct community search-and-rescue safely without triggering secondary collapses.
- **Respectful Treatment:** Authored with solemn respect for the victims and survivors, avoiding sensationalism while honoring the courage of first responders and citizen volunteers.

---

## 9. Procedural Audio & Visual Immersion

SURVIVE achieves atmospheric tension without heavy media downloads by utilizing mathematical sound synthesis and lightweight CSS/SVG overlays:

### Procedural Web Audio API Engine (`src/utils/audio.ts`)
- **Zero External Audio Files:** The application synthesizes sound effects dynamically in real time using the browser's native `AudioContext`, `OscillatorNode`, and `BiquadFilterNode` APIs.
- **Dynamic Heartbeat:** A dual-pulse sub-bass sine wave oscillator (55 Hz) whose tempo dynamically ramps up as the 15-second decision countdown timer runs low.
- **Seismic Tremor Synth:** Modulated low-pass filtered noise combined with a 40 Hz sub-bass sine wave, generating visceral seismic rumbling during earthquake events.
- **Fire Crackle & Roar:** Bandpass filtered pink noise with micro-bursts that synthesize realistic crackling embers.
- **Flood Water Rush:** Dual multi-pole biquad filters sweeping through noise buffers, creating surging torrent acoustics.
- **Autoplay Compliance:** AudioContext is initialized lazily and strictly adheres to modern browser user-gesture policies.

### Non-Blocking Environmental Overlay (`src/components/EnvironmentalOverlay.tsx`)
- **Subtle Atmospheric Layers:** CSS animations and SVG elements that depict structural wall cracks, ambient dust motes, rising smoke haze, and rising water levels.
- **Dynamic Screen Rumble:** Tiered CSS shake animations (Passive / Active / Urgent) synchronized with active scenario timers and tremor events.
- **Non-Interfering HUD:** Environmental effects run with `pointer-events: none` at lower z-indexes to ensure player touch and click interactions remain completely responsive.

---

## 10. Dual-Language Accessibility (English & Roman Hinglish)

To ensure emergency preparedness reaches a broad audience across India, SURVIVE includes a real-time bilingual switcher:

- **English:** Clear, precise international emergency terminology.
- **Roman Hinglish:** Natural, colloquial Hindi-English as spoken across urban India (e.g., *"Darwaza kholne se pehle handle touch karke temperature check karein"*).
- **Instant Reactive Switching:** Toggle languages instantly anywhere in the app without losing gameplay state or resetting active countdown timers.

---

## 11. Preparedness Evaluation & Scoring System

At the conclusion of each scenario, the player receives a detailed **Preparedness Scorecard (0–100%)**:

- **Score Calculation:** Normalized 0–100 preparedness score based on decision safety weights and response urgency.
- **Four Performance Bands:**
  - **Ready to Respond (85–100%):** Outstanding emergency instincts; direct adherence to NDMA protocols.
  - **Good Awareness (65–84%):** Solid safety awareness; minor secondary hazards introduced.
  - **Needs Preparation (40–64%):** Critical safety misconceptions exposed; review required.
  - **Critically Unprepared (< 40%):** High-risk actions compromised life-safety.
- **Detailed Action Breakdown:** Every decision is reviewed step-by-step with situation context, player choice, outcome, and educational insights.
- **Official Takeaways & Helplines:** Scenario-specific takeaways and direct contact numbers (112 ERSS, 101 Fire, 1078 NDMA, SACHET portal).
- **Exact Scenario Replay:** Clicking "Replay Scenario" reloads the exact disaster scenario the player just attempted, enabling iterative learning while context is fresh.

---

## 12. AI Usage & Disclosure

In accordance with Hack 2 Ignite hackathon transparency requirements, the following discloses all AI tooling used in this project:

- **AI-Assisted Development:** Google Antigravity / Gemini was utilized as an agentic pair programmer for TypeScript drafting, refactoring, code quality audits, and documentation formatting.
- **Design & Research Synthesis:** AI tools assisted in synthesizing public disaster management reports and outlining scenario narrative structures.
- **Deterministic Gameplay Guarantee:** **Zero generative AI is executed at runtime.** All safety-critical scenarios, decision options, consequences, scoring calculations, and NDMA guidelines are 100% deterministic, authored in static TypeScript, and human-verified. This eliminates the possibility of runtime hallucinations in life-safety education.

---

## 13. System Architecture & Tech Stack

```
+---------------------------------------------------------------------------------------+
|                                    APPLICATION CORE                                   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [ User Interface - React 19 ]                                                        |
|  +----------------+  +-------------------+  +-----------------+  +-----------------+  |
|  | IntroScreen    |  | DisasterSelection |  | ScenarioScreen  |  | ReportScreen    |  |
|  +----------------+  +-------------------+  +-----------------+  +-----------------+  |
|          |                     |                     |                    |           |
|          +---------------------+---------------------+--------------------+           |
|                                        |                                              |
|                                        v                                              |
|  [ Global State Store - Zustand 5 ] <=================> [ Scenario Engine ]           |
|  - Active Scenario & Node Pointer                       - Deterministic DAG Nodes     |
|  - Vitality, Stress, Decision History                   - Safety Scoring Calculator   |
|  - Language Mode (EN / Hinglish)                        - Option Shuffler             |
|                                                                                       |
|  [ Audio & Visual Subsystems ]                                                        |
|  - Web Audio API (Procedural Heartbeat, Tremors, Fire Noise, Alarms)                  |
|  - CSS & SVG Environmental Overlay (Screen Rumble, Dust, Smoke, Water)                |
|                                                                                       |
|  [ Public Safety Grounding ]                                                          |
|  - NDMA India Guidelines / 112 ERSS Protocols / SACHET Advisories                     |
+---------------------------------------------------------------------------------------+
```

### Dependencies & Tooling

| Package / Tool | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Component architecture, declarative rendering, hooks |
| **React DOM** | `^19.2.8` | DOM rendering layer for React 19 |
| **React Router DOM** | `^7.18.4` | Client-side routing and browser history management |
| **Zustand** | `^5.0.15` | Lightweight, unopinionated reactive global state store |
| **Framer Motion** | `^13.3.0` | Cinematic transitions and animated layout elements |
| **TypeScript** | `~6.0.2` | Static type safety and strict scenario interface validation |
| **Vite** | `^8.3.0` | Build bundler and instant local development server |
| **Oxlint** | `^1.81.0` | Fast Rust-based code linter |

---

## 14. Repository Structure

```
survive-disaster-simulator/
├── docs/                             # Engineering & Hackathon Documentation
│   ├── ARCHITECTURE.md               # Detailed system architecture specification
│   ├── CHANGELOG.md                  # Milestone-by-milestone development changelog
│   ├── DECISIONS.md                  # Architectural Decision Records (ADRs)
│   ├── GDD.md                        # Game Design Document & mechanics bible
│   ├── PROJECT_STATE.md              # Current milestone state and verification log
│   └── research/
│       └── BHUJ_2001_RESEARCH.md     # Research baseline for 2001 Gujarat earthquake
├── public/                           # Static assets
├── src/
│   ├── components/                   # UI & presentation components
│   │   ├── CinematicText.tsx         # Animated narrative text display
│   │   ├── EnvironmentalOverlay.tsx  # CSS/SVG environmental effects & screen rumble
│   │   ├── LanguageToggle.tsx        # English / Hinglish language switch
│   │   ├── Layout.tsx                # Universal game shell & minimal HUD
│   │   └── Timer.tsx                 # Real-time SVG countdown display
│   ├── data/                         # Scenario datasets & schemas
│   │   ├── disasters.ts              # Disaster metadata (Earthquake, Fire, Flood)
│   │   ├── index.ts                  # Master scenario catalogue & registry
│   │   ├── types.ts                  # TypeScript scenario type definitions
│   │   ├── earthquake.ts             # Urban Apartment Earthquake scenario
│   │   ├── earthquakeWorkplace.ts    # Commercial Workplace Earthquake scenario
│   │   ├── historicalBhuj.ts         # Bhuj 2001 Historical scenario
│   │   ├── fire.ts                   # Residential Apartment Fire scenario
│   │   ├── fireCommercial.ts         # Commercial Complex Fire scenario
│   │   ├── flood.ts                  # Urban Flash Flood scenario
│   │   └── floodStreet.ts            # Stranded Vehicle Flood scenario
│   ├── engine/                       # Simulation engine logic
│   │   ├── reportBuilder.ts          # Comprehensive preparedness report builder
│   │   └── scoreCalculator.ts        # 0-100 score & performance band calculator
│   ├── hooks/                        # Custom React hooks
│   │   └── useCountdown.ts           # Resilient interval countdown with retry support
│   ├── i18n/                         # Internationalization
│   │   └── index.ts                  # English & Roman Hinglish translation dictionaries
│   ├── screens/                      # Main screen views
│   │   ├── IntroScreen.tsx           # Cinematic briefing & orientation
│   │   ├── DisasterSelectScreen.tsx  # Disaster category & scenario picker
│   │   ├── ScenarioScreen.tsx        # Active gameplay, decision options, & timer
│   │   ├── ConsequenceScreen.tsx     # Immediate physical aftermath & debrief
│   │   └── ReportScreen.tsx          # Preparedness score, mistake audit, & replay
│   ├── store/
│   │   └── gameStore.ts              # Zustand global state store
│   ├── utils/
│   │   └── audio.ts                  # Pure Web Audio API procedural sound engine
│   ├── App.tsx                       # Root application component & routes
│   └── main.tsx                      # Vite React entrypoint
├── package.json                      # Dependencies and npm scripts
├── tsconfig.json                     # TypeScript strict configuration
└── vite.config.ts                    # Vite bundler configuration
```

---

## 15. Getting Started & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- A modern browser supporting the **Web Audio API** and modern CSS (Chrome, Edge, Firefox, Safari).

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/krushnasharma-create/survive-disaster-simulator.git
   cd survive-disaster-simulator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173`.

### Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles TypeScript (`tsc -b`) and generates production bundle in `dist/`. |
| `npm run preview` | Locally serves the optimized production build from `dist/`. |
| `npm run lint` | Runs Oxlint across all source files. |

---

## 16. Architectural Decisions & Documentation Links

For deep dives into design rationale, review the project documentation:

- **Game Design Document:** [`docs/GDD.md`](docs/GDD.md) — Mechanics, gameplay loops, and design philosophy.
- **System Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Component contracts, state flows, and data schemas.
- **Architectural Decision Records:** [`docs/DECISIONS.md`](docs/DECISIONS.md) — Rationale for key engineering choices:
  - *ADR-01:* Deterministic DAG over runtime LLMs for safety-critical reliability.
  - *ADR-02:* Procedural Web Audio API synthesis over static audio files.
  - *ADR-03:* Roman Hinglish support for accessible Indian context.
  - *ADR-04:* Exact scenario replay for immediate mistake correction.
- **Historical Research Base:** [`docs/research/BHUJ_2001_RESEARCH.md`](docs/research/BHUJ_2001_RESEARCH.md) — Primary source documentation for the 2001 Bhuj simulation.
- **Changelog:** [`docs/CHANGELOG.md`](docs/CHANGELOG.md) — Complete phase-by-phase development log.
- **Project State:** [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) — Current milestone status and verification records.

---

## 17. Current Milestones & Future Roadmap

### Completed Milestones
- [x] **Phase 1: Architecture & Foundation** — Defined data schemas, GDD, and deterministic DAG engine.
- [x] **Phase 2: Game Shell & HUD** — Built cinematic app shell, minimal emergency HUD, and screen routing.
- [x] **Phase 3: Scenario Engine Implementation** — Zustand state integration, consequence evaluator, and node navigation.
- [x] **Phase 4: Earthquake Module** — Urban High-Rise and Workplace scenarios fully playable.
- [x] **Phase 5: Fire Module** — Residential Kitchen and Commercial Multiplex scenarios fully playable.
- [x] **Phase 6: Flood Module** — Urban Inundation and Stranded Vehicle scenarios fully playable.
- [x] **Phase 7: Historical Simulation (Bhuj 2001)** — Research base and playable Mw 7.7 earthquake reconstruction.
- [x] **Phase 8: Procedural Audio & VFX** — Web Audio API heartbeat, tremor, fire, and flood synths + CSS/SVG overlays.
- [x] **Phase 9: UI/UX & Polish** — Consequence transition polish, timer retry resilience, bilingual Hinglish system.
- [x] **Phase 10: Final Judge Readiness** — Browser smoke testing, Vercel deployment, demo video, and documentation.

### Future Roadmap
- **Offline Progressive Web App (PWA):** Enable offline emergency quick-reference guides during cellular blackout scenarios.
- **Historical Disasters Expansion:** Implementation of the **1997 Uphaar Cinema Fire** and **2005 Mumbai Deluge** scenarios.
- **Classroom / Workshop Mode:** Multi-user synchronous drill mode for schools and workplace disaster safety training.
- **Additional Regional Languages:** Expansion to include Devanagari Hindi, Tamil, Telugu, Bengali, and Marathi.

---

## 18. Team & Acknowledgements

### Team COSMIC
- **Krushna Sharma** — Architecture, Simulation Engine, Game Design, & Frontend Engineering
  GitHub: [@krushnasharma-create](https://github.com/krushnasharma-create)

### Acknowledgements
- **Hack 2 Ignite 2026** Organizers and Mentors for the GD-02 problem statement.
- **National Disaster Management Authority (NDMA, India)** for public safety documentation and open guidance resources.
- India's first responders, NDRF, SDRF, and citizen volunteers who protect lives during natural and human-induced disasters.

---

## 19. Public Safety Disclaimer & Project Licensing

> **IMPORTANT PUBLIC SAFETY NOTICE:**
> **SURVIVE is an educational simulation game designed solely to raise general awareness about disaster preparedness.**
> It does not substitute for certified first aid, disaster rescue training, or professional emergency directives. In any real-world emergency in India, **immediately dial 112** (All-in-One Emergency Helpline) or contact local disaster management authorities.

### Project Licensing
This project was developed as an open-source educational submission for **Hack 2 Ignite 2026** by Team COSMIC.
Copyright &copy; 2026 Krushna Sharma (Team COSMIC). All rights reserved.
