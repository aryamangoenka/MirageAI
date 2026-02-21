# PlanSight - UI Micro-Copy Guide
**Person D - AI & DevOps / Glue Engineer**
**Style**: Sharp & Technical (for engineering judges)

---

## Core Dashboard Labels

### Intelligent Intake Section
- **Section Title**: `"Intelligent Intake – Project DNA"`
- **Subtitle**: `"Define your project parameters for simulation"`

### Input Fields
- **Project Name**: `"Project Name"`
- **Description**: `"Brief Description (optional)"`
- **Scope Size**: `"Scope Size"` (Small / Medium / Large)
- **Complexity**: `"Technical Complexity"` (slider 1-5)
  - Helper text: `"1 = CRUD app, 5 = Distributed system"`
- **Tech Stack**: `"Primary Tech Stack"`
- **Team Composition**:
  - `"Senior Devs"`, `"Mid-Level Devs"`, `"Junior Devs"`
  - Helper text: `"Senior = 5+ years, Mid = 2-5 years, Junior = <2 years"`
- **Integrations**: `"External Integrations"`
  - Helper text: `"Third-party APIs, payment gateways, auth providers"`
- **Deadline**: `"Target Deadline (weeks)"`
- **Scope Volatility**: `"Scope Volatility Risk"`
  - Helper text: `"How likely are requirements to change? (0-100)"`

### Buttons
- **Primary Action**: `"Run Simulation"` or `"Simulate Project"`
- **Secondary Actions**:
  - `"Show Failure Forecast"`
  - `"Generate Task Breakdown"`
  - `"Export Executive Summary"`
  - `"Reset Inputs"`

---

## Results Dashboard

### Timeline Section
- **Title**: `"Predictive Timeline Distribution"`
- **Metrics**:
  - `"On-Time Probability: 42%"`
  - `"Expected Completion (P50): 14.2 weeks"`
  - `"Worst-Case (P90): 18.7 weeks"`
  - `"Expected Overrun: +12 days"`
- **Chart Label**: `"Monte Carlo Simulation (1000 runs)"`

### Risk Profiler & Heatmap
- **Section Title**: `"Risk Profiler & Heatmap Dashboard"`
- **Risk Cards**:
  - `"Integration Risk"`
    - Subtitle: `"Third-party API dependencies"`
    - Band labels: `Low (0-30)` | `Medium (31-60)` | `High (61-100)`
  - `"Team Imbalance Risk"`
    - Subtitle: `"Junior/Senior ratio skew"`
  - `"Scope Creep Risk"`
    - Subtitle: `"Requirements volatility"`
  - `"Learning Curve Risk"`
    - Subtitle: `"New stack adoption penalty"`
- **Risk Uplift Text Examples**:
  - `"New stack: +25% learning risk → +1.5 weeks at P90"`
  - `"High integration count: +30% delay risk → +2.1 weeks"`
  - `"Junior-heavy team: +20% velocity penalty → +1.2 weeks"`

### Team Stress Index
- **Title**: `"Team Stress Index"`
- **Gauge Levels**:
  - `0-40: "Sustainable"`
  - `41-70: "Elevated Pressure"`
  - `71-100: "Critical Burnout Risk"`
- **Mitigation Text**:
  - `"Add 1 senior dev to reduce stress by 18 points"`
  - `"Extend deadline by 2 weeks to reach sustainable level"`

### Smart Allocation
- **Title**: `"Smart Allocation"`
- **Subtitle**: `"Recommended role distribution for this stack"`
- **Chart Label**: `"FE / BE / DevOps effort split"`
- **Text Example**: `"Recommended: 40% FE (1.2 devs), 45% BE (1.3 devs), 15% DevOps (0.5 dev)"`

### Cost Projections
- **Title**: `"Cost Projections"`
- **Metrics**:
  - `"P50 Cost: $67,200 USD"`
  - `"P90 Cost: $89,600 USD"`
  - `"Risk Premium: +$22,400 (33%)"`

---

## What-If Simulator

### Section Title
- `"What-If Scenario Simulator"`

### Toggle Labels
- `"Baseline"` vs `"Scenario"`
- **Controls**:
  - `"Add/Remove Senior Dev"`
  - `"Adjust Deadline (±2 weeks)"`
  - `"Add/Remove API Integration"`

### Comparison View
- **Side-by-Side Metrics**:
  - `"Baseline → Scenario"`
  - `"42% → 38% on-time probability"`
  - `"14.2 → 15.8 weeks (P50)"`
  - `"18.7 → 21.3 weeks (P90)"`

---

## Failure Forecast Modal

### Title
- `"Failure Forecast"`

### Subtitle
- `"Most likely failure scenario based on worst 10% of Monte Carlo runs"`

### Content Sections
- **Failure Sequence**:
  - Title: `"How This Project Fails"`
  - Format: Bulleted list (3-5 items)
- **Mitigations**:
  - Title: `"Recommended Mitigations"`
  - Format: Numbered list (top 3)

### Buttons
- `"Close"` or `"Apply Mitigations to Scenario"`

---

## AI Task Breakdown

### Section Title
- `"AI-Generated Task Breakdown"`

### Subtitle
- `"First 10 critical execution tasks, prioritized by impact"`

### Task Card Format
```
[Role Badge: FE/BE/DevOps] [Risk Flag: High Risk / Dependency Bottleneck / Early Validation]
Task: "Set up authentication flow with OAuth2"
```

### Export Button
- `"Export to CSV"` or `"Copy Task List"`

---

## Executive Summary Panel

### Title
- `"Executive Summary"`

### Subtitle
- `"AI-generated leadership brief"`

### Content
- 4-8 sentence narrative covering:
  - Confidence score
  - P50/P90 timeline
  - Top 3 risks
  - Resource recommendations

### Buttons
- `"Copy as Text"`
- `"Download as PDF"` (stretch goal)
- `"Share Link"` (stretch goal)

---

## Loading & Error States

### Loading Messages
- `"Running Monte Carlo simulation (1000 samples)..."`
- `"Calculating risk scores..."`
- `"Generating failure forecast..."`
- `"Analyzing project with AI..."`

### Error Messages
- **API Failure**: `"Simulation failed. Check backend connection and retry."`
- **LLM Failure**: `"AI service unavailable. Showing baseline metrics only."`
- **Validation Error**: `"Invalid input: Team must have at least 1 developer."`

### Empty States
- **No Results Yet**: `"Configure your project and run simulation to see results."`
- **No Risks Detected**: `"Low-risk project. All factors within acceptable thresholds."`

---

## Tooltips & Helper Text

### Monte Carlo Explanation
> "Monte Carlo simulation runs your project 1000 times with randomized risk factors to produce a probability distribution of outcomes."

### P50 / P90 Explanation
> "P50 (median): 50% of simulations finish by this date. P90: 90% finish by this date (worst-case buffer)."

### Risk Score Explanation
> "Risk scores (0-100) measure specific failure drivers. Scores above 60 are considered high-risk."

### Team Stress Index Explanation
> "Team Stress Index combines timeline compression, workload per dev, and task complexity. Scores above 70 indicate burnout risk."

---

## Footer / Attribution

### Hackathon Branding
- `"Built for [Hackathon Name] | Powered by Google Gemini API"`
- `"Targeting: Predictive Project Blueprinting System Challenge"`

### Links
- `"View on GitHub"`
- `"Documentation"`
- `"About the Team"`

---

## Accessibility Labels (ARIA)

- **Simulate Button**: `aria-label="Run Monte Carlo simulation for project timeline"`
- **Risk Cards**: `aria-label="Integration risk score: 72 out of 100, high risk"`
- **Chart**: `aria-label="Timeline probability distribution from Monte Carlo simulation"`

---

## Notes for Person C (Frontend Engineer)

- **Consistency**: Use these exact labels across all components
- **Tone**: Sharp, technical, data-driven (no fluff)
- **Abbreviations**: P50/P90 (not "50th percentile" in UI labels)
- **Numbers**: Always show 1 decimal for weeks/days, 0 decimals for percentages and scores
- **Units**: Always include units (weeks, days, USD, %)
- **Colors**:
  - Low risk: Green (#10B981)
  - Medium risk: Yellow (#F59E0B)
  - High risk: Red (#EF4444)
  - Primary action: Blue (#3B82F6)
