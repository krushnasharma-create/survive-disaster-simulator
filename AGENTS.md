# AGENTS.md — SURVIVE: Disaster Response Simulator
<!-- READ THIS FILE BEFORE EVERY TASK. DO NOT SKIP. -->

---

## Project Purpose

SURVIVE is a premium browser-based cinematic disaster survival simulation built for the Hack 2 Ignite 48-hour hackathon.

**Official Problem Statement (GD-02):**
> Create a simulation game that teaches disaster preparedness and emergency response.

The project must feel like an actual interactive survival game — not a quiz app, not a SaaS dashboard, not a static educational webpage.

---

## Product Vision

A cinematic, browser-based game where the player is placed inside a real disaster scenario. Their decisions determine what happens next. The experience teaches genuine emergency preparedness through consequences, not lectures.

**Intended flow:**
```
LOGIN
→ CINEMATIC GAME INTRO
→ DISASTER SELECTION
→ CINEMATIC DISASTER STORY
→ SHORT CONTEXT / IMPORTANT INFORMATION
→ SURVIVAL CHALLENGES
→ TIME-CRITICAL PLAYER DECISIONS
→ CONSEQUENCES
→ BRANCHING / CHANGING SITUATIONS
→ SCORING
→ PREPAREDNESS REPORT
→ SELECT ANOTHER DISASTER
```

**Initial disasters:** Earthquake, Fire, Flood. A fourth may be added only if the first three are polished.

---

## Core Gameplay Principle

**NOT this:**
```
Question → Correct/Wrong → Next Question
```

**THIS:**
```
Scenario → Player Decision → Decision Evaluation
→ Consequence → New Situation → Player Decision
→ Consequence → Final Preparedness Score
```

The player's decisions must meaningfully affect the subsequent situation wherever practical. The goal is the feeling:
> "I am inside an emergency. My decisions determine what happens next."

---

## Visual / UX Principles

- Cinematic, immersive, atmospheric, serious, game-like
- Premium minimal HUD
- Strong typography, dramatic transitions
- Environmental / disaster-specific visual storytelling
- The first 30 seconds must communicate: *"This is a disaster survival simulation."*

**Avoid:**
- Generic gradients everywhere
- Generic glassmorphism SaaS layouts
- Excessive cards / dashboard UI
- Generic AI landing-page aesthetics
- Unnecessary navbar-heavy layouts

---

## Safety Principles

Emergency guidance is safety-critical.

- Core scenario decisions and consequences are **deterministic** and based on credible, India-first emergency-preparedness sources:
  - **Primary:** NDMA (National Disaster Management Authority, India), SACHET portal, Government of India 112 ERSS (Emergency Response Support System)
  - **Supplementary:** FEMA, Red Cross — only when no equivalent Indian guidance exists and the guidance is universally applicable
- AI (if integrated) may be used for: personalized feedback, adaptive difficulty, narration, learning summaries, controlled scenario variation.
- AI must **never** freely invent emergency instructions or safety-critical consequences.
- All safety-critical content must be reviewed and stored as static/deterministic data, not generated at runtime by an LLM.

---

## Coding Rules

1. Read this file and `docs/PROJECT_STATE.md` before every task.
2. Identify files relevant to the task. Inspect those. Do NOT recursively inspect the entire repo.
3. Do NOT rewrite working code without justification.
4. Do NOT change architecture without documenting the reason in `docs/DECISIONS.md`.
5. Do NOT add dependencies without a clear reason.
6. Never invent requirements. If requirements are ambiguous, document the question in `docs/DECISIONS.md`.
7. Keep code focused: one concern per file, small functions, clear naming.
8. Write for readability first; optimise only when necessary.
9. Prefer TypeScript strict mode throughout.
10. Do NOT create fake or placeholder gameplay that pretends to be complete.

---

## Context-Management Rules

**Before every task:**
1. Read `AGENTS.md`.
2. Read `docs/PROJECT_STATE.md`.
3. Identify files directly relevant to the task.
4. Inspect those specific files.
5. Do NOT scan the whole repository unless genuinely necessary.

**After every meaningful implementation task:**
1. Test the change (manually or automated).
2. Update `docs/PROJECT_STATE.md` to reflect actual current state.
3. Update `docs/CHANGELOG.md` when relevant.
4. Report: files changed, what changed, tests performed, known issues, recommended next task.
5. Never claim a feature exists unless it is implemented and verified.

---

## Git Rules

Maintain a clean, meaningful Git history reflecting genuine development.

**Good commit messages:**
```
feat: initialize game foundation
feat: implement cinematic game shell
feat: add disaster selection screen
feat: implement scenario engine
feat: add earthquake gameplay
feat: implement consequence branching
fix: resolve scenario progression bug
docs: update project architecture
chore: configure build tooling
```

**Forbidden commit messages:**
- `final`, `final2`, `test123`, `abc`, `final-final`, `asdf`, `wip`

- Do NOT manipulate timestamps or fabricate development history.
- Commit after each meaningful unit of work.
- One commit per logical change.

---

## Current Development Workflow

1. **FOUNDATION** (current) — documentation and architecture
2. **SHELL** — cinematic scaffolding: app skeleton, routing, game shell, dummy screens
3. **SCENARIO ENGINE** — deterministic scenario/decision/consequence data model + engine
4. **EARTHQUAKE** — full earthquake scenario gameplay
5. **FIRE** — full fire scenario gameplay
6. **FLOOD** — full flood scenario gameplay
7. **SCORING & REPORT** — preparedness score + report screen
8. **POLISH** — cinematic transitions, audio, atmosphere, visual effects
9. **DEPLOYMENT** — build, deploy, QA

See `docs/PROJECT_STATE.md` for the current phase and task.
