# PlanSight — AI-Powered Predictive Project Intelligence

PlanSight transforms raw project requirements into a data-driven execution plan. It stress-tests software delivery plans before they fail using probabilistic simulation, deterministic risk scoring, and local AI reasoning.

> "Most projects fail because teams underestimate risk. PlanSight simulates project futures before they happen."

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Full Stack Architecture](#full-stack-architecture)
3. [Quick Start](#quick-start)
4. [User Inputs (Intake Form)](#user-inputs-intake-form)
5. [Estimation Engine — All Formulas](#estimation-engine--all-formulas)
6. [Monte Carlo Simulation](#monte-carlo-simulation)
7. [Risk Scoring](#risk-scoring)
8. [Team Stress Index](#team-stress-index)
9. [Cost Projection](#cost-projection)
10. [Role Allocation](#role-allocation)
11. [AI Integrations](#ai-integrations)
12. [Frontend Features & Visualizations](#frontend-features--visualizations)
13. [API Reference](#api-reference)
14. [Environment Variables](#environment-variables)
15. [File Structure](#file-structure)

---

## System Overview

PlanSight is a two-layer system:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Deterministic Engine** | Python (FastAPI) | Base effort, risk scores, stress index, cost — all rule-based with no randomness |
| **Probabilistic Engine** | NumPy Monte Carlo | Runs N simulations with stochastic perturbations to produce P50/P90/on-time confidence |
| **AI — Execution Plan** | Ollama (`gemini-3-flash-preview`) | Local LLM generates a phased, project-specific execution plan |
| **AI — Insights** | Google Gemini API (`gemini-2.0-flash`) | Cloud LLM generates failure forecasts, task breakdowns, executive summaries |
| **AI — Advisor** | ElevenLabs Conversational AI | Voice-based project advisor pre-loaded with all simulation context as dynamic variables |
| **Frontend** | Next.js + React + TypeScript | Dashboard with tabs, charts, animations, and insight panels |

---

## Full Stack Architecture

```
MirageAI/
├── backend/
│   ├── main.py                      # FastAPI app, all routes, CORS
│   ├── models/
│   │   └── schemas.py               # Pydantic request/response models
│   ├── core/
│   │   ├── estimation.py            # Base effort, WSCI, multipliers
│   │   ├── monte_carlo.py           # N-run Monte Carlo simulation
│   │   └── risk.py                  # Risk scores, stress, allocation, cost
│   └── services/
│       ├── llm_client.py            # Gemini API: failure forecast, tasks, summary
│       └── ollama_client.py         # Ollama: execution plan (local AI)
│
└── frontend/
    ├── app/
    │   ├── dashboard/page.tsx        # Main dashboard page
    │   └── globals.css               # Animations and global styles
    ├── components/dashboard/
    │   ├── intake-form.tsx           # Project input form
    │   ├── results-dashboard.tsx     # Tab navigation and content router
    │   ├── hero-metrics.tsx          # Top-level key metric cards
    │   ├── execution-plan.tsx        # Overview tab — AI execution plan
    │   ├── monte-carlo-analysis.tsx  # Probability tab — histogram + stats
    │   ├── fan-chart.tsx             # Scenarios tab — timeline uncertainty
    │   ├── risk-heatmap.tsx          # Risk & Team tab — four risk axes
    │   ├── team-stress.tsx           # Team stress gauge
    │   ├── allocation-chart.tsx      # Role allocation chart
    │   ├── what-if-panel.tsx         # What-If simulator panel
    │   ├── insight-panels.tsx        # Executive Summary slide-out panel
    │   ├── navbar.tsx                # Top navigation bar
    │   └── advisor-wrapper.tsx       # ElevenLabs advisor wrapper
    ├── components/
    │   └── ConversationalAdvisor.tsx # ElevenLabs widget with dynamic variables
    └── lib/
        ├── app-state.tsx             # Global React context (all state)
        ├── api-client.ts             # All backend API calls
        ├── types.ts                  # TypeScript type definitions
        └── mock-data.ts              # Fallback demo data
```

---

## Quick Start

### Backend

```bash
# 1. Create and activate virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt
pip install ollama               # for local AI execution plan

# 3. Configure environment
cp .env.template .env
# Edit .env — add LLM_API_KEY (Gemini) and set OLLAMA_MODEL

# 4. Start Ollama and pull the model (for execution plan)
ollama serve                     # in a separate terminal
ollama pull gemini-3-flash-preview

# 5. Run the backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# API docs: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# UI: http://localhost:3000
```

---

## User Inputs (Intake Form)

Every simulation starts from these inputs, captured in the frontend intake form:

| Field | Type | Description |
|-------|------|-------------|
| `project_name` | string | Name of the project |
| `description` | string | Brief project description |
| `scope_size` | `small` \| `medium` \| `large` | Overall project scale |
| `complexity` | int 1–5 | Technical complexity rating |
| `tech_stack` | string | Technology stack (e.g. `React + FastAPI`) |
| `deadline_weeks` | int > 0 | Target delivery deadline in weeks |
| `team_junior` | int ≥ 0 | Number of junior developers |
| `team_mid` | int ≥ 0 | Number of mid-level developers |
| `team_senior` | int ≥ 0 | Number of senior developers |
| `integrations_count` | int ≥ 0 | Number of external API/service integrations |
| `scope_volatility` | int 0–100 | Likelihood of scope changes (maps directly to scope creep risk) |
| `num_simulations` | int | Number of Monte Carlo runs (default: 1000) |

---

## Estimation Engine — All Formulas

All formulas are deterministic (no randomness). They produce the `base_effort_days` that seeds the Monte Carlo simulation.

### Step 1 — Base Days (Scope × Complexity)

```
scope_base:
  small  → 50  dev-days  (complexity_multiplier = 10)
  medium → 100 dev-days  (complexity_multiplier = 20)
  large  → 200 dev-days  (complexity_multiplier = 40)

base_days = scope_base + (complexity × complexity_multiplier)
```

**Effect**: Larger scope and higher complexity linearly increase the total work estimate before any team or stack adjustments.

---

### Step 2 — Weighted Stack Complexity Index (WSCI)

WSCI reflects how much harder a given tech stack is to deliver compared to a baseline (React = 1.0).

| Stack | WSCI |
|-------|------|
| Go | 0.85 |
| FastAPI | 0.90 |
| Flask / Vue | 0.95 |
| React / Python monolith | 1.00 |
| Django / Vue + Node | 1.10 |
| React + Python | 1.15 |
| React + Node / Rails | 1.20 |
| Next.js | 1.25 |
| Angular | 1.30 |
| .NET | 1.35 |
| Spring Boot | 1.40 |
| Rust | 1.50 |
| (unrecognised stack) | 1.00 |

**Effect**: A Rust project requires 50% more effort than an equivalent React project, all else equal.

---

### Step 3 — Integration Multiplier

```
integration_multiplier = 1.0 + (integrations × 0.08)

if integrations > 4:
    integration_multiplier += 0.15   (extra penalty for high coordination)
```

**Effect**: Each external API integration adds 8% to effort. Five or more integrations add an additional flat 15% penalty for coordination overhead.

---

### Step 4 — Experience Factor

```
total_team   = team_junior + team_mid + team_senior
senior_ratio = team_senior / total_team
mid_ratio    = team_mid    / total_team
junior_ratio = team_junior / total_team

experience_factor = (senior_ratio × 1.0)
                  + (mid_ratio    × 1.2)
                  + (junior_ratio × 1.6)
```

Weight meaning:
- **Senior (1.0)**: Baseline — most efficient, produces the least overhead.
- **Mid (1.2)**: 20% slower than senior; needs occasional guidance.
- **Junior (1.6)**: 60% more costly than senior; requires supervision and rework.

**Effect**: A fully junior team takes 60% longer than a fully senior team for the same scope.

---

### Step 5 — Dependency Clustering Penalty

Applied when both complexity and integrations are high simultaneously (many moving pieces interacting under high technical difficulty):

```
if complexity ≥ 4 AND integrations ≥ 3:
    dependency_penalty = 1.20

elif complexity ≥ 3 AND integrations ≥ 5:
    dependency_penalty = 1.15

else:
    dependency_penalty = 1.00
```

**Effect**: High-complexity projects with many integrations carry an additional 15–20% penalty for the non-linear difficulty of coordinating simultaneous dependencies.

---

### Step 6 — Final Base Effort

```
base_effort_days = base_days
                 × wsci
                 × integration_multiplier
                 × experience_factor
                 × dependency_penalty
```

This is the total team dev-days of work (not calendar time). Calendar time is derived during simulation by dividing by team size.

---

## Monte Carlo Simulation

The simulation runs `num_simulations` independent trials (default: 1,000). Each trial applies stochastic perturbations to `base_effort_days` to model real-world uncertainty.

### Per-Run Calculation

For each simulation run `i`:

#### 1. Scope Growth (Normal Distribution)
```
scope_volatility_factor = scope_volatility / 100

scope_growth ~ Normal(μ=1.0, σ=0.15×scope_volatility_factor + 0.05)
scope_growth = clamp(scope_growth, 0.8, 1.5)
```
Represents the risk that requirements grow. Higher `scope_volatility` widens the distribution.

#### 2. Integration Delay Factor (Log-Normal)
```
if integrations > 0:
    std_log = 0.08 × integrations
    integration_delay_factor ~ LogNormal(μ_log=0.0, σ_log=std_log)
    integration_delay_factor = clamp(integration_delay_factor, 0, 1.5)
else:
    integration_delay_factor = 1.0
```
Log-normal is used because integration delays are right-skewed: usually small, occasionally catastrophic.

#### 3. Experience Variance (Normal)
```
junior_ratio     = team_junior / total_team
variance_std     = 0.1 + (junior_ratio × 0.15)
experience_variance ~ Normal(μ=1.0, σ=variance_std)
experience_variance = clamp(experience_variance, 0.7, 1.4)
```
Junior-heavy teams have higher output variance — some weeks are very productive, others blocked.

#### 4. Unexpected Delays (Log-Normal)
```
unexpected_factor ~ LogNormal(μ_log=0.0, σ_log=0.12)
unexpected_factor = clamp(unexpected_factor, 0, 1.3)
```
Catches unforeseen events: bugs, infrastructure issues, team absences.

#### 5. Run Result
```
effort_days_i   = base_effort_days
                × scope_growth
                × integration_delay_factor
                × experience_variance
                × unexpected_factor

calendar_days_i = effort_days_i / team_size   # parallel work

completion_weeks_i = calendar_days_i / 5      # 5 work days per week
```

### Aggregated Outputs

After all N runs:

```
P50 (median)          = percentile(completion_weeks, 50)
P90 (worst case)      = percentile(completion_weeks, 90)

on_time_probability   = count(completion_weeks ≤ deadline_weeks) / N

expected_overrun_days = mean((late_runs - deadline_weeks) × 5)
                        [only for runs that exceeded the deadline]
```

### Histogram

Completion weeks are bucketed into a frequency histogram (one bucket per week). This is what powers the **Probability** tab bar chart — each bar shows how many of the 1,000 simulated timelines ended in that week. The histogram reveals whether the distribution is narrow (predictable) or fat-tailed (high uncertainty).

---

## Risk Scoring

Four independent risk axes, each scored 0–100. All are deterministic (no simulation needed).

### 1. Integration Risk

```
integration_risk = min(100, integrations × 15)
```

| Score | Interpretation |
|-------|---------------|
| 0–29 | Low — manageable API surface |
| 30–59 | Moderate — worth spiking in Week 1 |
| 60–100 | High — integration is the critical path |

### 2. Team Imbalance Risk

```
if total_team == 0:
    team_imbalance_risk = 90        # no team defined

elif team_senior == 0:
    team_imbalance_risk = 80        # no oversight whatsoever

elif junior_ratio > 0.6:
    team_imbalance_risk = int(70 × junior_ratio)

else:
    team_imbalance_risk = int(30 × junior_ratio)
```

A team of 3 juniors / 0 seniors (ratio = 1.0) hits a score of 70. A team with 1 senior and 1 junior (ratio = 0.5) scores 15.

### 3. Scope Creep Risk

```
scope_creep_risk = scope_volatility   (direct 1:1 mapping, 0-100)
```

This is the user's own assessment of how likely requirements are to change.

### 4. Learning Curve Risk

```
learning_base = int((wsci - 1.0) × 100)

if complexity ≥ 4:
    learning_risk = min(100, learning_base + 30)

elif wsci > 1.2:
    learning_risk = min(100, learning_base + 15)

else:
    learning_risk = learning_base
```

A `wsci` of 1.5 (Rust) at complexity 4 produces `learning_base = 50`, then `+30` for high complexity → risk of 80.

### Risk Uplift Labels

Each risk score is annotated with a contextual uplift string shown in the UI (e.g. `"+24% integration complexity"`):

```
integration_uplift  shown if integration_risk ≥ 30
scope_uplift        shown if scope_creep_risk ≥ 40
learning_uplift     shown if complexity ≥ 4 or wsci > 1.2
```

---

## Team Stress Index

A composite 0–100 score estimating burnout and overload risk. Three components, each capped at 100:

### Component 1 — Timeline Compression (weight: 40%)

```
p50_ratio           = p50_weeks / deadline_weeks
timeline_compression = min(100, int(p50_ratio × 80))
```

If P50 equals the deadline, `p50_ratio = 1.0` → compression = 80 (high stress). If P50 is 50% of deadline, compression = 40.

### Component 2 — Role Overload (weight: 30%)

```
tasks_per_dev   = base_effort_days / total_team
available_days  = deadline_weeks × 5
overload_ratio  = tasks_per_dev / available_days
role_overload   = min(100, int(overload_ratio × 100))
```

An `overload_ratio` of 1.0 means each developer must produce one day of work every calendar day — 100% utilisation with no buffer. Values above 1.0 are capped at 100.

### Component 3 — Parallel Task Density (weight: 30%)

```
task_density  = (complexity × 5 + integrations × 3) / total_team
parallel_stress = min(100, int(task_density × 4))
```

Captures coordination overhead: more complexity, more integrations, and fewer people all increase mental load per developer.

### Final Score

```
stress_index = (timeline_compression × 0.4)
             + (role_overload        × 0.3)
             + (parallel_stress      × 0.3)

stress_index = min(100, stress_index)
```

### Stress Bands

| Range | Label | Interpretation |
|-------|-------|---------------|
| 0–40 | Healthy | Sustainable pace, adequate capacity |
| 40–70 | Elevated | Watch for burnout signals, monitor velocity |
| 70–100 | Critical | High likelihood of team burnout or delivery failure |

---

## Cost Projection

```
rate = COST_RATE_PER_DEV_DAY   (default: $500 USD per developer per day)

p50_cost = p50_weeks × 5 × total_team × rate
p90_cost = p90_weeks × 5 × total_team × rate
```

Cost scales with both timeline (P50 or P90) and team size. The range `p50_cost → p90_cost` represents the expected-to-pessimistic budget envelope.

---

## Role Allocation

Recommended allocation of effort across Frontend (FE), Backend (BE), and DevOps is derived from the tech stack:

| Stack type | FE | BE | DevOps |
|-----------|----|----|--------|
| Default | 35% | 50% | 15% |
| React / Vue / Angular / Next.js | 40% | 45% | 15% |
| Monolith / Django / Rails | 30% | 55% | 15% |
| Microservices or integrations > 4 | −5% BE | same | 20% |

All ratios are normalised to sum to 100% after adjustments. This drives the **Allocation Chart** in the Risk & Team tab.

---

## AI Integrations

### 1. Execution Plan — Ollama (Local, `gemini-3-flash-preview`)

**Endpoint**: `POST /execution-plan`

**Trigger**: Fired automatically in the background immediately after "Run Simulation" completes. Result is stored in global state — opening the Overview tab does not re-trigger the call.

**How it works**:
1. The backend builds a detailed prompt using all project inputs, P50/P90 timelines, on-time probability, and all four risk scores.
2. The `OllamaClient` calls the locally-running `gemini-3-flash-preview` model via the official Ollama Python SDK (`ollama.chat()`).
3. The model returns structured JSON (phases, tasks, milestones, risks, go/no-go checkpoints, critical path note).
4. The backend validates and coerces each field through Pydantic before returning.

**Fallback chain** (if any step fails):
```
1. Ollama (local gemini-3-flash-preview)
       ↓ on failure
2. Gemini cloud API (gemini-2.0-flash)
       ↓ on failure
3. Project-aware static plan (deterministic, uses project name, stack, team, risks)
```

**Output structure**:
```json
{
  "phases": [
    {
      "name": "Foundation",
      "week_start": 1,
      "week_end": 3,
      "description": "...",
      "tasks": [
        {
          "title": "...",
          "role": "BE",
          "priority": "high",
          "risk_flag": "Early Validation"
        }
      ],
      "risks": ["..."],
      "milestone": "..."
    }
  ],
  "go_no_go_checkpoints": [
    { "week": 3, "condition": "..." }
  ],
  "critical_path_note": "..."
}
```

**Task `role`**: `FE` | `BE` | `DevOps`
**Task `priority`**: `high` | `medium` | `low`
**Task `risk_flag`**: `High Risk` | `Dependency Bottleneck` | `Early Validation` | `null`

---

### 2. Failure Forecast — Gemini API

**Endpoint**: `POST /failure-forecast`

**How it works**: The backend re-runs `calculate_base_effort`, `run_monte_carlo`, and `calculate_risk_scores` to get the latest simulation context, then sends a structured prompt to Gemini. The prompt includes the project name, stack, team composition, deadline, P90 overrun, and top 3 risk scores. The LLM returns a chronological failure narrative (5 bullet points keyed to specific weeks) and 3 targeted mitigations.

**Output**:
```json
{
  "failure_story": [
    "Week 3: Integration with payment API blocks BE team...",
    "Week 6: Junior developers hit React learning curve...",
    ...
  ],
  "mitigations": [
    "Spike all external APIs in Week 1",
    "Lock scope after first stakeholder demo",
    "Pair seniors with juniors on critical-path tasks"
  ]
}
```

**Fallback**: If Gemini is unavailable, a project-aware static narrative is returned using the top risk, stack, and deadline from the request.

---

### 3. Task Blueprint — Gemini API

**Endpoint**: `POST /task-breakdown`

**How it works**: The LLM receives the project name, description, stack, P50/P90, and the top risk axis. It returns exactly 10 implementation tasks ordered by dependency and criticality, each tagged with a role and an optional risk flag.

**Output**:
```json
{
  "tasks": [
    { "title": "Set up CI/CD and staging environment", "role": "DevOps", "risk_flag": "Early Validation" },
    { "title": "Design core data model and API schema", "role": "BE", "risk_flag": "Dependency Bottleneck" },
    ...
  ]
}
```

**Fallback**: A stack-aware static task list (infrastructure → auth → API → UI → testing → performance).

---

### 4. Executive Summary — Gemini API

**Endpoint**: `POST /executive-summary`

**Trigger**: Same as the execution plan — fired in the background on "Run Simulation" and cached in global state. Opening the Summary panel does not re-trigger the call.

**How it works**: The LLM receives project name, stack, team composition, deadline, on-time probability, P50/P90, cost range, and top risk. It produces 5 sentences of flowing executive prose suitable for C-level stakeholders. No bullet points, no markdown.

**Confidence routing**:
```
on_time_probability ≥ 70%  → "high confidence" → protect scope
on_time_probability ≥ 45%  → "moderate confidence" → lock scope, add buffer
on_time_probability < 45%  → "low confidence" → extend deadline, reduce scope, or add seniors
```

**Output**:
```json
{
  "summary_text": "ShopEasy has a 38% probability of meeting its 10-week deadline..."
}
```

---

### 5. Conversational Advisor — ElevenLabs

**Component**: `ConversationalAdvisor.tsx`

An ElevenLabs voice agent embedded in the dashboard. Every simulation result is serialised into dynamic variables and injected into the ElevenLabs widget at load time, so the agent can answer questions about the specific project being analysed.

**Dynamic variables sent to ElevenLabs**:

| Variable | Source |
|---------|--------|
| `project_name`, `project_description` | Form inputs |
| `scope_size`, `complexity_level`, `stack_type` | Form inputs |
| `deadline_weeks`, `integrations_count`, `scope_volatility` | Form inputs |
| `team_juniors`, `team_mids`, `team_seniors` | Form inputs |
| `effective_team_size` | Computed: `juniors×0.7 + mids×1.0 + seniors×1.3` |
| `on_time_probability`, `p50_weeks`, `p90_weeks` | Monte Carlo outputs |
| `expected_overrun_weeks`, `num_simulations` | Monte Carlo outputs |
| `integration_risk`, `team_imbalance_risk`, `scope_creep_risk`, `learning_curve_risk` | Risk engine |
| `*_risk_level`, `*_risk_delay` | Risk engine (label + delay days) |
| `top_risk` | Derived — highest-scoring risk axis |
| `team_stress_index`, `team_stress_level`, `team_stress_mitigation` | Stress engine |
| `p50_cost`, `p90_cost`, `currency` | Cost engine |
| `allocation_frontend`, `allocation_backend`, `allocation_devops` | Allocation engine |
| `ui_task_list` | Full formatted execution plan from Ollama (phases + tasks) |
| `ui_task_count` | Total task count |
| `ui_task_roles` | Unique roles present in the plan |
| `ui_task_priorities` | Unique priorities in the plan |
| `ui_task_risk_tags` | Unique risk flags in the plan |
| `ui_phase_count` | Number of phases |
| `ui_critical_path` | Critical path note from Ollama |
| `ui_go_no_go_checkpoints` | Go/no-go checkpoint summary |

The agent is governed by a system prompt that instructs it to treat `ui_task_list` as the authoritative task list and never contradict the displayed UI content.

---

## Frontend Features & Visualizations

### Hero Metrics (always visible after simulation)

Four headline cards shown at the top of every result:

| Metric | Label | Description |
|--------|-------|-------------|
| `on_time_probability` | "Chance of on-time" | % of simulations that finished by the deadline |
| `p50_weeks` | "Expected finish" | Median completion across all simulations |
| `p90_weeks` | "Worst case" | 90th percentile — 10% of simulations take longer than this |
| `p50_cost` / `p90_cost` | "Cost range" | Budget envelope from P50 to P90 timeline |

All metrics animate on load with count-up effects. If a What-If scenario is active, delta arrows and signed differences appear against the baseline.

---

### Tab 1 — Overview (Execution Plan)

Displays the AI-generated phased execution plan from Ollama. Features:
- **Visual timeline bar**: Each phase is rendered as a coloured segment proportional to its week span. Go/no-go checkpoints appear as vertical markers.
- **Phase selector pills**: Click any phase to navigate to its detail view.
- **Phase detail**: Shows description, all tasks (role badge + priority dot + risk flag), and phase-specific risks.
- **Go/no-go checkpoints**: Week-keyed conditions the team must pass before proceeding.
- **Critical path note**: One to two sentences from the AI about the highest-risk delivery dependency.
- **Regenerate button**: Re-fires the Ollama call on demand.

---

### Tab 2 — Probability (Monte Carlo Distribution)

A bar chart (Recharts) of the completion week histogram. Features:
- Each bar represents one week-bucket; bar height = number of simulations landing in that week.
- **P50 reference line**: Vertical line at the median completion week.
- **P90 reference line**: Vertical line at the 90th-percentile completion week.
- **Deadline reference line**: Vertical line at the user's target deadline.
- Bars left of the deadline are coloured green (on-time scenarios); bars right are red.
- **Advanced statistics accordion**: Shows full percentile table (P10, P25, P50, P75, P90) and simulation count.

---

### Tab 3 — Scenarios (Fan Chart / Timeline Uncertainty)

A fan chart showing the range of possible project timelines from optimistic (P10) to pessimistic (P90). The vertical axis shows weeks ahead of or behind schedule. Used to communicate timeline uncertainty visually without requiring the user to interpret a histogram.

---

### Tab 4 — Risk & Team

Three components:

**Risk Radar (Risk Heatmap)**
Four risk cards, one per axis. Each shows:
- Score bar (0–100) with colour coding (green/amber/red)
- Severity emoji badge
- Plain-language explanation of the risk
- Uplift label (e.g. "+24% integration overhead")

**Team Stress Gauge**
A 10-segment gauge showing the stress index score. Includes:
- Emoji indicator
- Scale labels (Healthy → Elevated → Critical)
- Mitigation text specific to the stress level

**Allocation Chart**
Role allocation as a pie chart and percentage breakdown (FE / BE / DevOps). Includes individual mini-bars per role with trail-in animations.

---

### What-If Simulator

A side panel that lets users adjust three parameters against the baseline:
- Number of senior developers (±1, ±2)
- Number of integrations (±1, ±2)
- Deadline (±2 weeks, ±4 weeks)

After adjustment, a new simulation runs against the modified parameters. Results are shown as a `baseline → new value` comparison grid with directional arrows and `+X vs baseline` delta labels. The full simulation re-runs so all tabs update with the What-If data.

---

### Executive Summary Panel (slide-out)

Accessible via the **Summary** button in the navbar. Triggered once on "Run Simulation" and cached — reopening the panel does not re-generate the summary.

Contents:
- **Chance of on-time** metric card
- **Expected → Worst case** timeline card
- **Biggest risk** card
- **Summary prose**: 5-sentence AI-generated executive narrative (Gemini)
- **Copy as text** button

---

## API Reference

All endpoints are at `http://localhost:8000`. Interactive Swagger docs: `http://localhost:8000/docs`.

### `GET /health`
```json
// Response
{ "status": "ok" }
```

---

### `POST /simulate`
Run full Monte Carlo simulation, risk scoring, cost projection, and role allocation.

**Request**:
```json
{
  "project_name": "ShopEasy",
  "description": "E-commerce platform with payments",
  "scope_size": "large",
  "complexity": 4,
  "stack": "Next.js + Django",
  "deadline_weeks": 10,
  "team_junior": 2,
  "team_mid": 1,
  "team_senior": 1,
  "integrations": 3,
  "scope_volatility": 50,
  "num_simulations": 1000
}
```

**Response**:
```json
{
  "on_time_probability": 0.38,
  "expected_overrun_days": 12.4,
  "p50_weeks": 9.1,
  "p90_weeks": 12.3,
  "histogram": [
    { "bucket_center_weeks": 7.5, "count": 42 },
    { "bucket_center_weeks": 8.5, "count": 130 }
  ],
  "risk_scores": {
    "integration": 45,
    "team_imbalance": 25,
    "scope_creep": 50,
    "learning_curve": 40,
    "integration_uplift": "+9% integration overhead",
    "scope_creep_uplift": "+12% potential scope expansion"
  },
  "team_stress_index": 68,
  "p50_cost": 227500.0,
  "p90_cost": 307500.0,
  "currency": "USD",
  "role_allocation": { "fe": 0.40, "be": 0.45, "devops": 0.15 },
  "baseline_metrics": {
    "base_effort_days": 182.4,
    "wsci": 1.25,
    "integration_multiplier": 1.24,
    "experience_factor": 1.25
  }
}
```

---

### `POST /failure-forecast`
Generate AI failure narrative and mitigations.

**Request**: Same schema as `/simulate`.

**Response**:
```json
{
  "failure_story": [
    "Week 2: Django ORM performance issues block backend...",
    "Week 5: Payment integration delays cascade into frontend...",
    "Week 8: Scope additions from stakeholder demo inflate backlog..."
  ],
  "mitigations": [
    "Spike all payment integrations in Week 1",
    "Lock scope after first demo",
    "Add senior backend capacity for ORM layer"
  ]
}
```

---

### `POST /task-breakdown`
Generate 10 ordered implementation tasks.

**Request**:
```json
{
  "project_name": "ShopEasy",
  "description": "E-commerce platform with payments",
  "stack": "Next.js + Django",
  "p50_weeks": 9.1,
  "p90_weeks": 12.3,
  "risk_scores": { "integration": 45, "team_imbalance": 25, "scope_creep": 50, "learning_curve": 40 }
}
```

**Response**:
```json
{
  "tasks": [
    { "title": "Set up Next.js + Django monorepo and CI/CD", "role": "DevOps", "risk_flag": "Early Validation" },
    { "title": "Design ShopEasy product and order data models", "role": "BE", "risk_flag": "Dependency Bottleneck" },
    { "title": "Integrate Stripe payment gateway", "role": "BE", "risk_flag": "High Risk" }
  ]
}
```

---

### `POST /executive-summary`
Generate C-level executive summary prose.

**Request**:
```json
{
  "project_name": "ShopEasy",
  "description": "...",
  "stack": "Next.js + Django",
  "p50_weeks": 9.1,
  "p90_weeks": 12.3,
  "on_time_probability": 38.0,
  "p50_cost": 227500,
  "p90_cost": 307500,
  "currency": "USD",
  "risk_scores": { "integration": 45, "team_imbalance": 25, "scope_creep": 50, "learning_curve": 40 },
  "role_allocation": { "fe": 0.40, "be": 0.45, "devops": 0.15 },
  "deadline_weeks": 10,
  "team_junior": 2,
  "team_mid": 1,
  "team_senior": 1
}
```

**Response**:
```json
{
  "summary_text": "ShopEasy currently carries a 38% probability of meeting its 10-week deadline..."
}
```

---

### `POST /execution-plan`
Generate a phased, AI-reasoned execution plan via Ollama.

**Request**:
```json
{
  "project_name": "ShopEasy",
  "description": "E-commerce platform with payments",
  "stack": "Next.js + Django",
  "deadline_weeks": 10,
  "team_junior": 2,
  "team_mid": 1,
  "team_senior": 1,
  "integrations": 3,
  "scope_volatility": 50,
  "complexity": 4,
  "scope_size": "large",
  "p50_weeks": 9.1,
  "p90_weeks": 12.3,
  "on_time_probability": 38.0,
  "risk_scores": { "integration": 45, "team_imbalance": 25, "scope_creep": 50, "learning_curve": 40 }
}
```

**Response**:
```json
{
  "phases": [
    {
      "name": "Foundation & Integration Spike",
      "week_start": 1,
      "week_end": 3,
      "description": "Establish the Next.js + Django architecture...",
      "tasks": [
        { "title": "Set up ShopEasy monorepo and CI/CD", "role": "DevOps", "priority": "high", "risk_flag": "Early Validation" }
      ],
      "risks": ["Architecture decisions constrain all downstream work"],
      "milestone": "ShopEasy skeleton deployed to staging"
    }
  ],
  "go_no_go_checkpoints": [
    { "week": 3, "condition": "All payment integrations validated in sandbox" }
  ],
  "critical_path_note": "External payment and shipping integrations are the critical path..."
}
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_API_KEY` | — | Google Gemini API key (for failure forecast, tasks, summary) |
| `LLM_MODEL` | `gemini-2.0-flash` | Gemini model name |
| `OLLAMA_MODEL` | `gemini-3-flash-preview` | Ollama model for execution plan |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed frontend origins |
| `COST_RATE_PER_DEV_DAY` | `500.0` | Cost per developer per working day (USD) |
| `CURRENCY` | `USD` | Currency code for cost display |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `http://localhost:8000`) |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | ElevenLabs conversational agent ID |
| `NEXT_PUBLIC_ELEVENLABS_API_KEY` | ElevenLabs API key |

---

## File Structure

```
backend/
├── main.py                    # FastAPI app, CORS, all route handlers
├── requirements.txt           # Python dependencies
├── .env                       # Active environment variables (git-ignored)
├── .env.template              # Template for environment setup
├── models/
│   └── schemas.py             # All Pydantic request/response models
├── core/
│   ├── estimation.py          # Base effort, WSCI lookup, multipliers
│   ├── monte_carlo.py         # N-run simulation with NumPy
│   └── risk.py                # Risk scores, stress index, allocation, cost
└── services/
    ├── llm_client.py          # Gemini API wrapper (tasks, forecast, summary)
    └── ollama_client.py       # Ollama SDK wrapper (execution plan)

frontend/
├── app/
│   ├── dashboard/page.tsx     # Root dashboard page, layout
│   └── globals.css            # Animations (bounce-in, trail-in, sweep-in, etc.)
├── components/
│   ├── ConversationalAdvisor.tsx       # ElevenLabs widget + dynamic variable builder
│   └── dashboard/
│       ├── intake-form.tsx             # Project input form
│       ├── results-dashboard.tsx       # Tab router (Overview/Probability/Scenarios/Risk)
│       ├── hero-metrics.tsx            # Top headline metric cards
│       ├── execution-plan.tsx          # Overview tab — Ollama plan renderer
│       ├── monte-carlo-analysis.tsx    # Probability tab — histogram chart
│       ├── fan-chart.tsx               # Scenarios tab — timeline fan
│       ├── risk-heatmap.tsx            # Risk Radar — four axes
│       ├── team-stress.tsx             # Team Stress Gauge
│       ├── allocation-chart.tsx        # Role Allocation chart
│       ├── what-if-panel.tsx           # What-If scenario controls
│       ├── insight-panels.tsx          # Executive Summary slide-out panel
│       ├── navbar.tsx                  # Top navigation bar
│       └── advisor-wrapper.tsx         # Reads global state, passes to advisor
└── lib/
    ├── app-state.tsx           # React context: all global state + background fetches
    ├── api-client.ts           # All fetch calls to backend + response transforms
    ├── types.ts                # TypeScript interfaces for all data shapes
    └── mock-data.ts            # Demo data fallback when backend is unreachable
```

---

## Performance

| Operation | Typical latency |
|-----------|----------------|
| `/simulate` (1,000 runs) | < 100 ms |
| `/execution-plan` via Ollama | 10–20 s (local AI) |
| `/executive-summary` via Gemini | 2–5 s |
| `/failure-forecast` via Gemini | 2–5 s |
| Full page initial load | < 1 s |

The backend is fully stateless — no database required. All state lives in the frontend React context.

---

## License

MIT
