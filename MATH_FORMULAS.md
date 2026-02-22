# PlanSight — Math Formulas & Model Reference

This document explains every formula used in the simulation engine, what each variable means, how changing a variable affects the output, and how each formula feeds into the final dashboard metrics.

---

## Table of Contents

1. [Phase 1 — Base Effort Estimation](#1-phase-1--base-effort-estimation)
2. [Phase 2 — Monte Carlo Simulation](#2-phase-2--monte-carlo-simulation)
3. [Phase 3 — Risk Scores](#3-phase-3--risk-scores)
4. [Phase 4 — Team Stress Index](#4-phase-4--team-stress-index)
5. [Phase 5 — Role Allocation](#5-phase-5--role-allocation)
6. [Phase 6 — Cost Projection](#6-phase-6--cost-projection)
7. [How Variables Affect Final Metrics (Summary Table)](#7-how-variables-affect-final-metrics)

---

## 1. Phase 1 — Base Effort Estimation

**File:** `backend/core/estimation.py`

This phase converts the raw project inputs into a single number: **total dev-days of effort required** for the whole team. Every other calculation depends on this number.

---

### 1.1 Raw Base Days

```
base_days = scope_base + (complexity × scope_multiplier)
```

| Variable | Meaning | Effect |
|---|---|---|
| `scope_base` | Minimum effort floor for the scope size. `small=50`, `medium=100`, `large=200` dev-days | Higher scope → bigger floor → more total effort |
| `complexity` | User-input 1–5 rating of technical difficulty | Each +1 adds `scope_multiplier` more dev-days |
| `scope_multiplier` | Scales complexity impact per scope. `small=10`, `medium=20`, `large=40` | Larger projects are more sensitive to complexity increases |

**Example:** Medium scope, complexity 3 → `100 + (3 × 20) = 160 dev-days`

**Effect on metrics:** `base_days` is the starting point for everything. A higher value pushes P50, P90, and costs upward.

---

### 1.2 Weighted Stack Complexity Index (WSCI)

```
wsci = STACK_WSCI[stack]   (lookup table, defaults to 1.0)
```

| Stack | WSCI | Rationale |
|---|---|---|
| Go | 0.85 | Compiled, fast, simple tooling |
| FastAPI | 0.90 | Minimal, Pythonic, low boilerplate |
| Flask / Vue | 0.95 | Lightweight frameworks |
| React / Python monolith | 1.00 | Industry standard baseline |
| React + Python / Vue + Node | 1.15 | Two-layer integration overhead |
| React + Node / Ruby on Rails | 1.20 | Full-stack coordination |
| Next.js | 1.25 | SSR complexity added |
| Angular | 1.30 | Opinionated, verbose framework |
| .NET | 1.35 | Enterprise boilerplate |
| Spring Boot | 1.40 | JVM ecosystem overhead |
| Rust | 1.50 | Low-level memory management complexity |

**Effect on metrics:** WSCI multiplies `base_days` directly. Choosing Rust vs Go can add ~76% more effort for the same scope. Also feeds into the Learning Curve Risk score.

---

### 1.3 Integration Multiplier

```
integration_multiplier = 1.0 + (integrations × 0.08)

if integrations > 4:
    integration_multiplier += 0.15  (complexity spike penalty)
```

| Variable | Meaning | Effect |
|---|---|---|
| `integrations` | Number of external APIs/services the project connects to (0–6+) | Each integration adds 8% overhead |
| `0.08` | Per-integration overhead rate | Fixed constant — each API adds coordination, auth, error handling, mocking |
| `0.15` | High-integration penalty | Kicks in above 4 integrations — coordination overhead grows super-linearly |

**Example:** 3 integrations → `1.0 + (3 × 0.08) = 1.24` (+24% effort)
5 integrations → `1.0 + (5 × 0.08) + 0.15 = 1.55` (+55% effort)

**Effect on metrics:** Multiplies `base_days`. More integrations → longer timeline, higher cost, higher Integration Risk score, and wider Monte Carlo spread.

---

### 1.4 Experience Factor

```
senior_ratio = team_senior / total_team
mid_ratio    = team_mid    / total_team
junior_ratio = team_junior / total_team

experience_factor = (senior_ratio × 1.0) + (mid_ratio × 1.2) + (junior_ratio × 1.6)
```

| Variable | Meaning | Effect |
|---|---|---|
| `senior_ratio` | Fraction of team that is senior | Contributes least overhead (1.0× — they are the baseline) |
| `mid_ratio` | Fraction of team that is mid-level | Adds 20% more effort per hour worked vs seniors |
| `junior_ratio` | Fraction of team that is junior | Adds 60% more effort per hour worked vs seniors |
| `1.0 / 1.2 / 1.6` | Seniority weights | Reflect slower velocity, more rework, and mentoring overhead for less senior devs |

**Range:** 1.0 (all seniors, minimum) → 1.6 (all juniors, maximum)

**Example:**
- 1 junior, 2 mid, 1 senior → `(0.25×1.0) + (0.5×1.2) + (0.25×1.6) = 1.25`
- All seniors → `1.0` (fastest possible team)
- All juniors → `1.6` (60% more effort required)

**Effect on metrics:** Multiplies `base_days`. More juniors → higher effort, longer P50/P90, higher costs. Also feeds variance into Monte Carlo via `experience_variance`.

---

### 1.5 Dependency Clustering Penalty

```
if complexity ≥ 4 AND integrations ≥ 3:
    dependency_penalty = 1.20

elif complexity ≥ 3 AND integrations ≥ 5:
    dependency_penalty = 1.15

else:
    dependency_penalty = 1.00
```

| Variable | Meaning | Effect |
|---|---|---|
| `complexity` | How technically difficult the project is (1–5) | High complexity creates tangled dependencies |
| `integrations` | Number of external connections | Many integrations under high complexity compound coordination cost |
| `1.20 / 1.15` | Clustering penalty multipliers | Applied when both dimensions are high simultaneously |

**Rationale:** A project with 4+ complexity and 3+ integrations is not just additive — the dependencies between subsystems create combinatorial overhead (scheduling, interface contracts, debugging across boundaries).

**Effect on metrics:** Adds an additional multiplier on top of all other factors. Only triggers in genuinely complex, integration-heavy scenarios.

---

### 1.6 Final Base Effort (dev-days)

```
base_effort_days = base_days × wsci × integration_multiplier × experience_factor × dependency_penalty
```

This is a single number representing **total team dev-days** — if the whole team worked in a vacuum with no randomness, this is how much effort the project would take. Calendar time is then computed by dividing by team size (people work in parallel).

---

## 2. Phase 2 — Monte Carlo Simulation

**File:** `backend/core/monte_carlo.py`

The Monte Carlo engine runs `N` independent simulations (default: 1,000). Each simulation adds realistic randomness on top of `base_effort_days`. The distribution of outcomes gives us P50, P90, on-time probability, and the histogram curve.

---

### 2.1 Per-Simulation Effort Calculation

Each of the N simulations independently samples four random factors and combines them:

```
effort_days[i] = base_effort_days
                 × scope_growth[i]
                 × integration_delay[i]
                 × experience_variance[i]
                 × unexpected_factor[i]

calendar_days[i] = effort_days[i] / team_size

completion_weeks[i] = calendar_days[i] / 5
```

---

### 2.2 Scope Growth (per simulation)

```
scope_growth ~ Normal(μ=1.0, σ = 0.15 × scope_volatility_factor + 0.05)
scope_growth = clamp(scope_growth, min=0.8, max=1.5)
```

| Variable | Meaning | Effect |
|---|---|---|
| `Normal(μ, σ)` | Gaussian random draw | Most simulations cluster around 1.0 (no scope change) |
| `scope_volatility_factor` | `scope_volatility / 100` from user input (0–1) | Higher volatility → wider standard deviation → more spread simulations |
| `μ = 1.0` | No scope change as the expected case | On average, scope doesn't grow |
| `σ` | Standard deviation of scope variation | At 0% volatility: σ=0.05 (very tight). At 100% volatility: σ=0.20 (wide spread) |
| `clamp(0.8, 1.5)` | Bounds scope change to realistic range | Prevents absurd outliers (scope can't shrink more than 20% or grow more than 50%) |

**Effect on metrics:** Higher `scope_volatility` → wider histogram curve → larger gap between P50 and P90 → higher expected overrun. It doesn't change the P50 much but dramatically increases P90 and spreads risk.

---

### 2.3 Integration Delay Factor (per simulation)

```
if integrations > 0:
    integration_delay ~ LogNormal(μ_log=0.0, σ_log = 0.08 × integrations)
    integration_delay = clamp(integration_delay, max=1.5)
else:
    integration_delay = 1.0
```

| Variable | Meaning | Effect |
|---|---|---|
| `LogNormal` | Right-skewed distribution | Most simulations have small delays; rare simulations have large ones (realistic for API failures, rate limits, doc gaps) |
| `μ_log = 0.0` | Log-space mean at 0 → real-space median ≈ 1.0 | Most runs assume no extra delay |
| `σ_log = 0.08 × integrations` | Delay spread scales with integration count | Each integration adds 8% more variance in log-space |
| `max=1.5` | Cap at +50% delay | Prevents unrealistic extreme delays |

**Rationale:** Integration delays are inherently right-skewed — usually fine, occasionally catastrophic. LogNormal captures this better than Normal.

**Effect on metrics:** More integrations → heavier right tail → P90 increases faster than P50 → on-time probability drops.

---

### 2.4 Experience Variance (per simulation)

```
junior_ratio = team_junior / total_team
variance_std = 0.1 + (junior_ratio × 0.15)

experience_variance ~ Normal(μ=1.0, σ=variance_std)
experience_variance = clamp(experience_variance, min=0.7, max=1.4)
```

| Variable | Meaning | Effect |
|---|---|---|
| `junior_ratio` | Fraction of junior devs | Higher junior ratio → more variance in each simulation |
| `variance_std` | Std dev of the experience noise | At 0% juniors: σ=0.10. At 100% juniors: σ=0.25 |
| `clamp(0.7, 1.4)` | Bounds individual run variance | Senior teams can be 30% faster than expected; junior teams up to 40% slower |

**Effect on metrics:** All-senior teams have tight histograms (predictable). All-junior teams have wide histograms and higher P90. On-time probability is more sensitive to seniority when deadlines are tight.

---

### 2.5 Unexpected Factor (per simulation)

```
unexpected_factor ~ LogNormal(μ_log=0.0, σ_log=0.12)
unexpected_factor = clamp(unexpected_factor, max=1.3)
```

| Variable | Meaning | Effect |
|---|---|---|
| `LogNormal(0.0, 0.12)` | General "unknown unknowns" noise | Represents bugs, sick days, miscommunication, environment issues |
| `σ_log = 0.12` | Fixed moderate variance | Always present regardless of inputs — projects always have surprises |
| `max = 1.3` | Cap at +30% delay | Keeps simulations realistic |

**Effect on metrics:** Adds a constant baseline of randomness to all projects. Even a perfectly estimated, all-senior, no-integration project won't show 100% on-time probability because of this term.

---

### 2.6 Calendar Time Conversion

```
calendar_days = effort_days / team_size
completion_weeks = calendar_days / 5
```

| Variable | Meaning | Effect |
|---|---|---|
| `effort_days` | Total dev-effort for this simulation run | Raw "person-days" of work |
| `team_size` | `team_junior + team_mid + team_senior` | More people → work done in less calendar time (parallelism) |
| `/ 5` | Convert days → weeks (5 working days/week) | Standardizes output to weeks for all metrics |

**Effect on metrics:** Adding more developers directly compresses calendar time (inversely proportional). Doubling the team halves calendar days, assuming no coordination overhead (the experience and parallel stress factors capture that overhead separately).

---

### 2.7 Aggregated Output Statistics

After all N simulations are complete:

**P50 (Median Completion)**
```
P50 = 50th percentile of completion_weeks[]
```
50% of simulation runs finish at or before this many weeks. This is the "most likely" outcome.

**P90 (Pessimistic Completion)**
```
P90 = 90th percentile of completion_weeks[]
```
90% of simulation runs finish at or before this many weeks. Use this for contract deadlines and contingency planning.

**On-Time Probability**
```
on_time_probability = count(completion_weeks ≤ deadline_weeks) / N
```
The fraction of simulations that finished by the deadline. Displayed as a percentage on the dashboard.

**Expected Overrun (days)**
```
late_runs = completion_weeks where completion_weeks > deadline_weeks
expected_overrun_days = mean(late_runs - deadline_weeks) × 5
```
Average number of days past the deadline, calculated only over the runs that were actually late. If no runs are late, this is 0.

**Histogram**
Each simulation result is binned into integer-week buckets. The histogram is the probability distribution curve displayed in the UI. A wider, flatter curve means higher uncertainty.

---

## 3. Phase 3 — Risk Scores

**File:** `backend/core/risk.py`

Four risk scores are computed independently on a 0–100 scale. They are displayed in the Risk Heatmap.

---

### 3.1 Integration Risk

```
integration_risk = min(100, integrations × 15)
```

| Variable | Meaning | Effect |
|---|---|---|
| `integrations` | Number of external APIs/services | Linear: each integration adds 15 risk points |
| `× 15` | Risk weight per integration | 0 integrations = 0 risk. 7+ integrations = capped at 100 |
| `min(100, ...)` | Caps at maximum | Prevents overflow |

**Uplift text:** Shown when score ≥ 30. At score ≥ 60: "+X% integration complexity". Between 30–59: "+X% integration overhead".

**Effect on dashboard:** Shown as the "Integration" card in the Risk Heatmap. Also feeds into the Gemini failure forecast and executive summary prompts.

---

### 3.2 Team Imbalance Risk

```
junior_ratio = team_junior / total_team
senior_ratio = team_senior / total_team

if senior_ratio == 0:
    team_imbalance_risk = 80

elif junior_ratio > 0.6:
    team_imbalance_risk = int(70 × junior_ratio)

else:
    team_imbalance_risk = int(30 × junior_ratio)
```

| Variable | Meaning | Effect |
|---|---|---|
| `senior_ratio == 0` | No seniors on team | Fixed high penalty (80) — no experienced oversight |
| `junior_ratio` | Fraction of team that is junior | Drives risk score; above 0.6 threshold triggers a steeper curve |
| `70 × junior_ratio` | High-junior-ratio path | At 80% juniors: risk = 56. At 100% juniors: risk = 70 |
| `30 × junior_ratio` | Low-junior-ratio path | At 30% juniors: risk = 9 (well-balanced team) |

**Effect on dashboard:** Shown as "Team Imbalance" in Risk Heatmap. All-junior teams signal high coordination cost. Teams with no seniors get a hard 80/100 penalty.

---

### 3.3 Scope Creep Risk

```
scope_creep_risk = scope_volatility   (direct pass-through, 0-100)
```

| Variable | Meaning | Effect |
|---|---|---|
| `scope_volatility` | User-input percentage of how likely requirements change (0–100) | 1:1 mapping to risk score |

**Uplift text:** At ≥ 70: "+X% scope growth risk". At ≥ 40: "+X% potential scope expansion".

**Effect on dashboard:** This is the most directly user-controlled risk score. High scope volatility also widens the Monte Carlo distribution (via `scope_growth` variance).

---

### 3.4 Learning Curve Risk

```
learning_base = int((wsci - 1.0) × 100)

if complexity ≥ 4:
    learning_risk = min(100, learning_base + 30)

elif wsci > 1.2:
    learning_risk = min(100, learning_base + 15)

else:
    learning_risk = learning_base
```

| Variable | Meaning | Effect |
|---|---|---|
| `wsci` | Weighted Stack Complexity Index (see §1.2) | Base learning risk = how far WSCI is above 1.0, scaled to 0–100 |
| `learning_base` | WSCI-derived baseline risk | Go (0.85 WSCI) → -15 → clamped to 0. Rust (1.5 WSCI) → 50 baseline |
| `+30` | High complexity bonus | At complexity 4–5, any stack is harder to learn under pressure |
| `+15` | Moderate WSCI bonus | For stacks above 1.2 WSCI at moderate complexity |

**Effect on dashboard:** Stacks with high WSCI AND high complexity both contribute. A React (1.0) project at complexity 3 scores 0. A Spring Boot (1.4) project at complexity 4 scores min(100, 40+30)=70.

---

## 4. Phase 4 — Team Stress Index

**File:** `backend/core/risk.py`

The Team Stress Index (0–100) is a composite score measuring how hard the team will be pushed. It drives the `"OK" / "Elevated" / "Critical"` label on the dashboard gauge.

```
stress_index = (timeline_compression × 0.4)
             + (role_overload × 0.3)
             + (parallel_stress × 0.3)
```

---

### 4.1 Timeline Compression (40% weight)

```
p50_ratio = P50_weeks / deadline_weeks

timeline_compression = min(100, int(p50_ratio × 80))
```

| Variable | Meaning | Effect |
|---|---|---|
| `P50_weeks` | Median expected completion from Monte Carlo | If P50 > deadline, team is expected to be late |
| `deadline_weeks` | User-input target deadline | Denominator — tighter deadlines increase ratio |
| `p50_ratio` | How far over/under deadline P50 is | 1.0 = exactly on time. 1.25 = 25% past deadline at median |
| `× 80` | Scale ratio to 0–100 range | At p50_ratio=1.25 (25% late): score = 100. At p50_ratio=0.75: score = 60 |

**Effect:** This is the biggest component (40% weight). A project where P50 already exceeds the deadline is at near-maximum stress.

---

### 4.2 Role Overload (30% weight)

```
tasks_per_dev = base_effort_days / total_team
overload_ratio = tasks_per_dev / available_days
role_overload = min(100, int(overload_ratio × 100))
```

| Variable | Meaning | Effect |
|---|---|---|
| `base_effort_days` | Total dev-days of effort needed | More effort → more work per person |
| `total_team` | Number of people | More people → less work per person (reduces stress) |
| `tasks_per_dev` | Effort each developer must carry | Inversely proportional to team size |
| `available_days` | `deadline_weeks × 5` — total working days in the schedule | Longer deadline → more available days → lower ratio |
| `overload_ratio` | Tasks vs available time per person | 1.0 = 100% utilization (no slack). >1.0 = overloaded |

**Effect:** Adding one more developer reduces `tasks_per_dev` and directly lowers `role_overload`. This is why adding senior devs improves this component.

---

### 4.3 Parallel Task Density (30% weight)

```
task_density = (complexity × 5 + integrations × 3) / total_team

parallel_stress = min(100, int(task_density × 4))
```

| Variable | Meaning | Effect |
|---|---|---|
| `complexity` | Project complexity 1–5 | Each point adds 5 to the numerator — more complex = more parallel threads to manage |
| `integrations` | Number of external services | Each adds 3 to the numerator — integrations create parallel blocking dependencies |
| `total_team` | Team size | Larger team distributes coordination burden — reduces per-person density |
| `× 4` | Scale to 0–100 | At complexity=3, integrations=2, team=4: density=(15+6)/4=5.25, stress=min(100, 21) |

**Effect:** Large teams with moderate complexity have low parallel stress. Small teams (1–2 people) with high complexity and many integrations spike quickly to high stress.

---

### 4.4 Final Stress Index

```
stress_index = (timeline_compression × 0.4) + (role_overload × 0.3) + (parallel_stress × 0.3)
stress_index = clamp(stress_index, 0, 100)
```

**Dashboard labels:**
- `0–39` → **OK** (green) — sustainable pace
- `40–69` → **Elevated** (amber) — monitor workload
- `70–100` → **Critical** (red) — burnout risk, restructure needed

---

## 5. Phase 5 — Role Allocation

**File:** `backend/core/risk.py`

Calculates recommended percentage split of effort across Frontend (FE), Backend (BE), and DevOps roles, based on the tech stack and integration count.

```
Base allocation:
  fe_ratio    = 0.35
  be_ratio    = 0.50
  devops_ratio = 0.15

Adjustments:
  if stack contains React/Vue/Angular/Next.js:
      fe_ratio = 0.40
      be_ratio = 0.45

  if stack contains monolith/Django/Rails:
      fe_ratio = 0.30
      be_ratio = 0.55

  if stack contains microservices OR integrations > 4:
      devops_ratio = 0.20
      be_ratio    -= 0.05

Final:
  fe     = fe_ratio     / (fe_ratio + be_ratio + devops_ratio)
  be     = be_ratio     / (fe_ratio + be_ratio + devops_ratio)
  devops = devops_ratio / (fe_ratio + be_ratio + devops_ratio)
```

**Effect on dashboard:** Shown in the Allocation stacked bar chart. DevOps share increases for integration-heavy or microservice projects. FE-heavy stacks shift budget toward frontend work.

---

## 6. Phase 6 — Cost Projection

**File:** `backend/core/risk.py`

```
p50_cost = P50_weeks × 5 × team_size × rate_per_dev_day
p90_cost = P90_weeks × 5 × team_size × rate_per_dev_day
```

| Variable | Meaning | Effect |
|---|---|---|
| `P50_weeks` / `P90_weeks` | Monte Carlo timeline estimates | Longer timelines → higher cost directly |
| `× 5` | Working days per week | Converts weeks to days |
| `team_size` | `team_junior + team_mid + team_senior` | Larger teams cost more per day (all devs billed equally at this rate) |
| `rate_per_dev_day` | Daily cost per developer. Default: `$500/dev/day` (configurable via `COST_RATE_PER_DEV_DAY` in `.env`) | Higher rate → proportionally higher cost |

**Example:** P50=12 weeks, team=4, rate=$500 → `12 × 5 × 4 × 500 = $120,000`

**Limitation:** All developers are billed at the same daily rate. In reality, seniors cost more. For a hackathon demo, a single blended rate is a deliberate simplification.

**Effect on dashboard:** Shown as P50 Cost and P90 Cost in the Prediction Snapshot header. The spread between P50 and P90 cost represents financial risk from timeline variance.

---

## 7. How Variables Affect Final Metrics

| Input Variable | P50 | P90 | On-Time % | Overrun Days | Stress Index | Integration Risk | Scope Creep Risk | Team Imbalance | Learning Curve |
|---|---|---|---|---|---|---|---|---|---|
| ↑ Scope (small→large) | ↑ Strong | ↑ Strong | ↓ | ↑ | ↑ | — | — | — | — |
| ↑ Complexity (1→5) | ↑ Moderate | ↑ Moderate | ↓ | ↑ | ↑ | — | — | — | ↑ |
| ↑ Integrations | ↑ Moderate | ↑ Strong | ↓ | ↑ Strong | ↑ | ↑ Strong | — | — | — |
| ↑ Team size (add devs) | ↓ Strong | ↓ Strong | ↑ Strong | ↓ | ↓ | — | — | — | — |
| Add senior → junior | ↑ Moderate | ↑ Moderate | ↓ | ↑ | ↑ | — | — | ↑ Strong | — |
| Add junior → senior | ↓ Moderate | ↓ Moderate | ↑ | ↓ | ↓ | — | — | ↓ Strong | — |
| ↑ Scope Volatility | — slight | ↑ Strong | ↓ | ↑ | — | — | ↑ Strong | — | — |
| ↑ Deadline | — | — | ↑ Strong | ↓ | ↓ | — | — | — | — |
| Higher WSCI stack | ↑ Moderate | ↑ Moderate | ↓ | ↑ | — | — | — | — | ↑ Strong |

**Legend:**
- `↑ Strong` — large positive effect on that metric
- `↑ Moderate` — noticeable but secondary effect
- `↓` — reduces/improves the metric
- `—` — no direct effect on this metric
- Cost always follows P50/P90 (same direction, proportional)
