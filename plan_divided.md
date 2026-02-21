## PlanSight – 4‑Person Hackathon Playbook

**Hackathon length**: ~24 hours  
**Stack**: FastAPI (backend) + React (frontend) + LLM API

### Roles

- **Person A – Product & Simulation Lead (PM + light data science)**
- **Person B – Backend Engineer (FastAPI)**
- **Person C – Frontend Engineer (React UI/UX)**
- **Person D – AI & DevOps / Glue Engineer**

All four are expected to **use AI heavily** for coding, refactoring, writing prompts, testing, and docs.

---

## Phase 1 (Hours 0–2): Alignment & Skeleton

### Person A – Product & Simulation Lead
- **Responsibilities**
  - Lock the story: 1‑sentence value prop, demo path, Q&A angles.
  - Define **Intelligent Intake – Project DNA** fields (exact labels and options).
  - Draft first pass of estimation formula:
    - Base Complexity
    - Stack Multiplier
    - Team Seniority factor
    - Integration multiplier
    - Scope volatility factor
  - Write a 1‑page “Predictive Project Blueprinting System” summary mirroring the brief.
- **Use AI for**
  - Turning rough ideas into a clean formula spec and short PRD excerpts.
  - Generating example project scenarios for testing.

### Person B – Backend Engineer
- **Responsibilities**
  - Scaffold FastAPI project, health check route.
  - Set up `SimulationRequest` / `SimulationResponse` models.
  - Wire basic `/simulate` endpoint returning dummy but correctly‑shaped data.
- **Use AI for**
  - FastAPI boilerplate, Pydantic models, test stubs.

### Person C – Frontend Engineer
- **Responsibilities**
  - Scaffold React (or Vite React TS) app.
  - Build static layout:
    - Left: **Intelligent Intake – Project DNA** form.
    - Right: placeholder cards for timeline, risk, stress, task breakdown.
  - Call `/health` and log result.
- **Use AI for**
  - Component skeletons, form validation, layout suggestions.

### Person D – AI & DevOps / Glue
- **Responsibilities**
  - Set up repos, CI basics if easy.
  - Create `.env` templates and LLM config placeholders.
  - Choose a simple demo deployment target (Render/Railway for backend, Vercel/Netlify for frontend) and test a “Hello World” deploy for the hackathon demo.
- **Use AI for**
  - Deployment config, Docker (if needed), environment docs.

---

## Phase 2 (Hours 2–6): Core Estimation + Monte Carlo + Basic UI

### Person A – Product & Simulation Lead
- **Responsibilities**
  - Finalize numeric ranges and coefficients:
    - Mapping Scope/Complexity → base dev‑days.
    - Stack multipliers.
    - Integration penalties.
    - Seniority/experience factor.
    - Stress index formula.
  - Define how we compute **on‑time probability**, **P50**, **P90** from Monte Carlo samples.
- **Use AI for**
  - Sanity‑checking formulas and tuning coefficients quickly.

### Person B – Backend Engineer
- **Responsibilities**
  - Implement:
    - Base effort calculation.
    - Monte Carlo simulation (1000 runs).
    - Risk scores (Integration, Team Imbalance, Scope Creep, Learning Curve).
    - Team Stress Index.
  - Return histogram + summary stats in `/simulate`.
- **Use AI for**
  - Writing simulation loops, using numpy if helpful, quick benchmark tests.

### Person C – Frontend Engineer
- **Responsibilities**
  - Hook real `/simulate` call to form submit.
  - Render:
    - On‑time probability, P50, P90.
    - Simple timeline chart (histogram or line).
    - Risk cards + stress index placeholder.
- **Use AI for**
  - Chart integrations, state management patterns.

### Person D – AI & DevOps / Glue
- **Responsibilities**
  - Ensure CORS and API URL configs for local + demo environment (no production envs).
  - Help B with quick load tests so `/simulate` stays under ~1s.
  - Keep the single demo deployment updated so the team can test the live demo URL.
- **Use AI for**
  - Writing small load scripts, troubleshooting errors, infra config.

---

## Phase 3 (Hours 6–12): What‑If, Risk Profiler, Smart Allocation, Cost

### Person A – Product & Simulation Lead
- **Responsibilities**
  - Define rules for **Smart Allocation**:
    - For each stack type, % FE / % BE / % DevOps.
  - Define cost model:
    - Rate per dev‑day.
    - How to compute `p50_cost`, `p90_cost`.
  - Tune thresholds for Low/Med/High risk bands.
- **Use AI for**
  - Converting rough heuristics into clear, documented rules.

### Person B – Backend Engineer
- **Responsibilities**
  - Extend `/simulate` to include:
    - `role_allocation` (FE/BE/DevOps percentages).
    - `p50_cost`, `p90_cost`, `currency`.
  - Refine risk scores to output explicit uplifts (e.g., “+25% learning risk”).
- **Use AI for**
  - Refactoring estimation logic, adding tests for edge cases.

### Person C – Frontend Engineer
- **Responsibilities**
  - Implement **What‑If panel**:
    - Toggle senior dev count, deadline, integrations.
    - Show Baseline vs Scenario metrics side‑by‑side.
  - Animate chart morph between Baseline and Scenario.
  - Implement **Risk Profiler & Heatmap Dashboard**:
    - Risk cards with color, band labels, and uplift text.
- **Use AI for**
  - Implementing smooth chart transitions and clean card CSS.

### Person D – AI & DevOps / Glue
- **Responsibilities**
  - Help design UI micro‑copy: short, sharp labels (e.g., “Failure Forecast”, “Team Stress Index”).
  - Make sure the one demo deployment feels fast enough from the demo location (optimize for perceived speed, not production SLAs).
- **Use AI for**
  - Generating micro‑copy options and quick UX reviews.

---

## Phase 4 (Hours 12–18): Failure Forecast, AI Task Blueprint, Executive Summary

### Person A – Product & Simulation Lead
- **Responsibilities**
  - Design prompts for:
    - **Failure Forecast**: failure story + top 3 mitigations.
    - **AI Task Blueprint**: first 10 tasks with role + risk tags.
    - **Executive Summary**: leadership‑friendly narrative.
- **Use AI for**
  - Iterating on prompts until outputs feel sharp and concise.

### Person B – Backend Engineer
- **Responsibilities**
  - Implement:
    - `/failure-forecast` (reuse worst Monte Carlo runs).
    - `/task-breakdown`.
    - `/executive-summary`.
  - Integrate `llm_client` with chosen provider (e.g., Gemini).
- **Use AI for**
  - Client wrapper code, error handling, retry logic, tests.

### Person C – Frontend Engineer
- **Responsibilities**
  - Build:
    - **Failure Forecast** modal/panel.
    - **AI‑Generated Task Breakdown** list UI.
    - **Executive Summary** panel with “Copy as text” button.
- **Use AI for**
  - Component design, UX copy, clipboard logic.

### Person D – AI & DevOps / Glue
- **Responsibilities**
  - Plug in LLM API keys in a demo-only `.env` (no production secrets or real user data).
  - (Optional) Add minimal logging just to debug demo issues (no long-term monitoring stack).
  - Help demo‑proof any flaky API interactions.
- **Use AI for**
  - Observability snippets, fallback strategies.

---

## Phase 5 (Hours 18–24): Polish, Demo Script, Backup Plan

### Person A – Product & Simulation Lead
- **Responsibilities**
  - Own the **90‑second pitch script**:
    - Problem → Solution → Live demo steps → Why we win.
  - Write concise answers for likely judge questions (accuracy, AI justification, real‑world roadmap).
- **Use AI for**
  - Drafting and tightening the script and Q&A bullets.

### Person B – Backend Engineer
- **Responsibilities**
  - Stabilize: handle edge cases, add simple validation, fix any crashes.
  - Freeze the API schema; avoid last‑minute breaking changes.
- **Use AI for**
  - Quick static analysis and refactor suggestions.

### Person C – Frontend Engineer
- **Responsibilities**
  - UI polish: spacing, typography, responsive behavior, loading states, error banners.
  - Ensure the golden demo path feels cinematic but fast.
- **Use AI for**
  - CSS refinements and accessibility tweaks.

### Person D – AI & DevOps / Glue
- **Responsibilities**
  - Lock in a single demo deployment (or local + tunnel) and confirm it’s reliable enough for the live pitch.
  - Create a **backup demo plan**:
    - Pre‑recorded screen capture in case of Wi‑Fi issues.
    - Local backend fallback if possible.
- **Use AI for**
  - Generating a short written submission (problem, solution, stack, differentiation).

---

## Golden Demo Script (Who Says What)

- **Person A (Voice)**: Narrates problem, solution, and transitions.
- **Person C (Driver)**: Operates the UI during live demo.
- **Person B**: Ready to answer technical questions on modeling and Monte Carlo.
- **Person D**: Ready to answer AI/LLM, architecture, and deployment questions.

Everyone uses AI throughout to move faster, but **ownership is clear**:  
A = story & formulas, B = backend brain, C = front‑of‑house experience, D = AI + glue + reliability.