# PlanSight Backend Development Plan

This document is the single source of truth for backend (FastAPI) development for PlanSight—MirageAI’s predictive project intelligence tool. It is derived from `plan_divided.md` (hackathon playbook) and `plansight-hackathon-mvp_6c0f0e17.plan.md` (MVP PRD).

---

## 1. Backend Scope Summary

- **Role**: Estimation brain, Monte Carlo simulation, risk scoring, cost/role allocation, and LLM-backed narrative endpoints.
- **Stack**: FastAPI, Pydantic, optional NumPy for simulation.
- **Deploy target**: Render/Railway (or similar). `/simulate` must respond in **&lt; 1 second** for 1000 Monte Carlo runs.
- **No auth** for MVP; single-page flow only.

---

## 2. Repository Structure

```
backend/
├── main.py                 # FastAPI app, routes, CORS
├── models/
│   └── schemas.py          # Pydantic: SimulationRequest, SimulationResponse, RiskScores, etc.
├── core/
│   ├── estimation.py       # Base effort, WSCI, integration multiplier, experience variance
│   ├── monte_carlo.py      # N-run simulation, histogram, P50/P90, on-time probability
│   └── risk.py             # Risk scores (4 axes), team stress index, role allocation
├── services/
│   ├── llm_client.py       # Wrapper for Gemini (or chosen provider), retries, errors
│   └── calibration.py     # (Stretch) CSV upload, regression, coefficient update
└── tests/                  # Unit/integration tests for estimation, simulation, endpoints
```

---

## 3. API Endpoints

### 3.1 `GET /health`

- **Purpose**: Liveness/readiness for frontend and deployment.
- **Response**: `{ "status": "ok" }` or similar.

---

### 3.2 `POST /simulate` (Core)

**Request** (`SimulationRequest`):

| Field | Type | Notes |
|-------|------|--------|
| `project_name` | `str` | |
| `description` | `str` | |
| `scope_size` | `Literal["small","medium","large"]` | |
| `complexity` | `int` | 1–5 |
| `stack` | `str` | e.g. "React + Node", affects WSCI |
| `deadline_weeks` | `int` | |
| `team_junior` | `int` | |
| `team_mid` | `int` | |
| `team_senior` | `int` | |
| `integrations` | `int` | 0–6+ buckets |
| `scope_volatility` | `int` | 0–100 |
| `num_simulations` | `int` | Default 1000 |

**Response** (`SimulationResponse`):

| Field | Type | Notes |
|-------|------|--------|
| `on_time_probability` | `float` | 0–1 |
| `expected_overrun_days` | `float` | Mean delay when late |
| `p50_weeks` | `float` | Median completion |
| `p90_weeks` | `float` | 90th percentile |
| `histogram` | `list[HistogramBucket]` | `bucket_center_weeks`, `count` |
| `risk_scores` | `RiskScores` | integration, team_imbalance, scope_creep, learning_curve (0–100) |
| `team_stress_index` | `int` | 0–100 |
| `p50_cost` | `float` | Cost at P50 (internal rate per dev-day) |
| `p90_cost` | `float` | Cost at P90 |
| `currency` | `str` | e.g. "USD" |
| `role_allocation` | `dict` | e.g. `{ "fe": 0.4, "be": 0.45, "devops": 0.15 }` |
| `baseline_metrics` | `dict` | Optional; raw internals for LLM/debug |

**Internal flow**: Request → Estimation (base effort, multipliers) → Monte Carlo (N runs) → Risk + Stress + Role allocation + Cost → Response.

---

### 3.3 `POST /failure-forecast`

- **Request**: Same as `SimulationRequest` (or reference to recent simulation).
- **Behavior**: Reuse or rerun simulation; take worst 10–20% of runs; identify dominant failure factors; call LLM with project + risks + failure drivers.
- **Response**:
  - `failure_story: list[str]` — 3–5 bullet points.
  - `mitigations: list[str]` — Top 3 recommendations.

---

### 3.4 `POST /executive-summary`

- **Request**: Core project inputs + full or summarized `SimulationResponse`.
- **Behavior**: Build prompt from timeline (P50/P90), risks, costs, role mix; call LLM.
- **Response**: `summary_text: str` — 4–8 sentence executive summary.

---

### 3.5 `POST /task-breakdown`

- **Request**: Project title, description, stack + key metrics (top risks, P50/P90).
- **Behavior**: Prompt LLM for 10 ordered implementation tasks with role and risk tags.
- **Response**: `tasks: list[TaskItem]` — each: `title: str`, `role: str`, `risk_flag: Optional[str]`.

---

### 3.6 (Stretch) `POST /calibrate`

- **Request**: CSV upload or JSON (historical projects: duration, team, integrations, stack, complexity, actual completion).
- **Behavior**: Fit coefficients (e.g. LinearRegression), update estimation multipliers in memory for this instance.

---

## 4. Estimation Model (Core Logic)

Implement in `core/estimation.py` (and optionally in `core/risk.py` for risk-specific parts).

- **Base effort (ideal dev-days)**: \( f(\text{scope}, \text{complexity}) \). Map scope (small/medium/large) and complexity (1–5) to a base number of dev-days.
- **Weighted Stack Complexity Index (WSCI)**: Predefined multipliers per stack (e.g. React, Next.js, Python monolith). Multiply base effort by WSCI.
- **Integration multiplier**: Factor based on number (and optionally type) of integrations.
- **Experience variance**: Adjust velocity using senior/junior/mid mix (e.g. seniority factor or effective team strength).
- **Dependency clustering penalty**: Extra penalty when many integrations and high complexity.
- **Scope volatility factor**: Use `scope_volatility` (0–100) to increase variance or uplift in simulation.

Output: **estimated ideal days** and **base risk scores** before Monte Carlo.

---

## 5. Monte Carlo Engine

Implement in `core/monte_carlo.py`.

- For each of **N runs** (default 1000):
  - Sample random perturbations for: scope growth, integration delays, experience variance (from defined distributions).
  - Compute resulting project duration (days/weeks).
- Aggregate:
  - **On-time probability**: Fraction of runs ≤ deadline.
  - **Expected overrun days**: Mean(positive delay) when late.
  - **P50 / P90**: Median and 90th percentile of completion weeks.
  - **Histogram**: Bucket counts (e.g. by week) for charting.

Use NumPy if needed to keep runtime under ~1s for 1000 runs.

---

## 6. Risk & Allocation

Implement in `core/risk.py`.

- **Four risk scores (0–100)** with explicit uplifts where useful:
  - **Integration risk**
  - **Team imbalance risk**
  - **Scope creep risk**
  - **Tooling / learning curve risk**
- **Team Stress Index (0–100)** from:
  - Timeline compression (work required / time available),
  - Role overload (tasks per dev vs threshold),
  - Parallel task density (complexity + integrations per dev).
- **Smart allocation**: From stack and integrations, compute recommended role mix:
  - e.g. `{ "fe": 0.4, "be": 0.45, "devops": 0.15 }`.
- **Cost**: Using a fixed (or configurable) rate per dev-day, compute `p50_cost` and `p90_cost` from P50/P90 duration and team size.

---

## 7. LLM Integration

Implement in `services/llm_client.py`.

- **Provider**: Gemini (or chosen API); configurable via env (e.g. `LLM_API_KEY`, `LLM_MODEL`).
- **Used by**: `/failure-forecast`, `/executive-summary`, `/task-breakdown`.
- **Requirements**: Structured prompts, error handling, retries, timeouts. No streaming required for MVP.
- **Security**: Keys from environment only; no keys in code or logs.

---

## 8. Implementation Phases (Backend-Only)

| Phase | Hours (ref) | Deliverables |
|-------|-------------|--------------|
| **1 – Skeleton** | 0–2 | FastAPI app, `GET /health`, `SimulationRequest` / `SimulationResponse` in `schemas.py`, `POST /simulate` returning dummy but correctly shaped JSON. |
| **2 – Core engine** | 2–6 | `estimation.py` (base effort, WSCI, integration, experience, volatility). `monte_carlo.py` (1000 runs, histogram, P50/P90, on-time probability). `risk.py` (4 risk scores, team stress index). `/simulate` returns real histogram + summary + risk + stress. |
| **3 – Allocation & cost** | 6–12 | Extend `/simulate` with `role_allocation`, `p50_cost`, `p90_cost`, `currency`. Refine risk scores to include explicit uplifts (e.g. “+25% learning risk”). |
| **4 – LLM endpoints** | 12–18 | `llm_client.py` (Gemini wrapper). `POST /failure-forecast`, `POST /task-breakdown`, `POST /executive-summary` with proper request/response models and error handling. |
| **5 – Polish** | 18–24 | Validation on all inputs, edge-case handling, no breaking API changes; freeze schema. Optional: basic tests and load check for `/simulate` &lt; 1s. |

---

## 9. Testing & Performance

- **Unit tests**: Estimation formulas, Monte Carlo distribution shape, risk/stress formulas.
- **Integration tests**: At least `POST /simulate` with known inputs → check response shape and sane ranges (e.g. on_time_probability in [0, 1], P90 ≥ P50).
- **Performance**: Target `/simulate` &lt; 1s for 1000 simulations; add a quick load script or test if needed.

---

## 10. Environment & Deployment

- **Env vars**: e.g. `LLM_API_KEY`, `LLM_MODEL`, `CORS_ORIGINS`, `COST_RATE_PER_DEV_DAY`, `CURRENCY`.
- **CORS**: Configure for frontend origin(s) (local + prod).
- **Deploy**: Single-command or simple pipeline to Render/Railway; health check via `GET /health`.

---

## 11. Stretch (If Time)

- **`POST /calibrate`**: CSV upload, fit regression (e.g. scikit-learn), update estimation coefficients in memory.
- **Logging**: Simple request/LLM-call logging for debugging and demo reliability.
- **Fallback**: If LLM is down, return a minimal non-LLM response or clear error for failure-forecast, task-breakdown, executive-summary.

---

## 12. Definition of Done (Backend)

- [ ] FastAPI app runs with `GET /health` and `POST /simulate` returning full `SimulationResponse` (real logic).
- [ ] `POST /failure-forecast`, `POST /executive-summary`, `POST /task-breakdown` implemented and wired to `llm_client`.
- [ ] All request/response models in `schemas.py` match this plan; API schema frozen for frontend.
- [ ] `/simulate` responds in &lt; 1s for 1000 runs.
- [ ] CORS and env-based config in place; ready for deployment to Render/Railway.

---

*Generated from `plan_divided.md` and `plansight-hackathon-mvp_6c0f0e17.plan.md` for the MirageAI Backend branch.*
