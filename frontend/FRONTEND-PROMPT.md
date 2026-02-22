# PlanSight Frontend Generation Prompt

Use this prompt to have another AI generate a compatible frontend for the PlanSight backend.

---

## Prompt

```
Build a Next.js 16 (App Router, TypeScript, Tailwind CSS v4) frontend for "PlanSight" — a predictive project intelligence dashboard.

DESIGN SYSTEM (DARK FUTURISTIC MINIMAL):
- Background: deep charcoal-blue (#17171f / oklch(0.10 0.005 260))
- Card surfaces: slightly lighter (#1f1f2d / oklch(0.14 0.005 260)) with backdrop-blur, 60% opacity for glassy effect
- ONE accent color: cyan (oklch(0.72 0.19 195)) used for primary buttons, active states, key highlights
- Text: off-white (#f0f0f0 / oklch(0.95 0 0)) for headings, muted gray for labels/helper text
- Borders: subtle (oklch(0.22 0.01 260)), never bright
- Glow effects: subtle box-shadow glow on cards using accent color at 15% opacity, stronger on hover
- Ambient background: radial gradient of accent at 3-5% opacity behind hero sections
- Subtle noise texture overlay at 1.5% opacity for depth
- Typography: Inter font, tight tracking for headings, relaxed line-height for body
- Radius: 0.75rem (rounded-xl) consistently on all cards
- NO gradients on buttons. NO glassmorphism overuse. Keep it executive-grade.

STRUCTURE:
1. Landing page at "/" with:
   - Sticky navbar with backdrop-blur (bg-background/60)
   - Full-height hero: big tagline "Simulate your project's future before it fails."
   - Animated hero visual: a preview card showing a canvas-drawn histogram with count-up "42% On-Time" metric, P50/P90 markers
   - Stats strip (1,000+ simulations, 4 risk dimensions, <2s analysis, P50/P90)
   - "How it works" section: 4 cards with icons (Intake, Simulation, What-If, Failure Forecast)
   - Feature grid: 2x2 bento of capabilities
   - Trust strip: "Probabilistic, not vibes", "Explainable risk factors", "Built for leads & founders"
   - Final CTA: "Run a simulation in 30 seconds"
   - Minimal footer

2. Dashboard at "/dashboard" — two-column layout:
   - Left (38%): "Project DNA" intake form + What-If Simulator (appears after first run)
   - Right (62%): Results Dashboard
   - Sticky top bar with step indicator (Intake → Simulation → Insights) + insight panel triggers

3. Right-side Sheet panels for: Failure Forecast, AI Task Blueprint, Executive Summary

API CLIENT:
- 4 POST endpoints: /simulate, /failure-forecast, /task-breakdown, /executive-summary
- Set base URL via NEXT_PUBLIC_API_URL env var
- Falls back to realistic mock data with simulated latency when API is unavailable
- Mock data uses jitter() function — never round numbers (42.3%, not 50%)

KEY TYPES:
- SimulationRequest: { project_name, description, scope_size ("small"|"medium"|"large"), complexity (1-5), tech_stack, deadline_weeks, team_junior, team_mid, team_senior, integrations_count (0-6), scope_volatility (0-100), num_simulations? }
- SimulationResponse: { on_time_probability, p50_weeks, p90_weeks, expected_overrun_days, p50_cost, p90_cost, num_simulations, distribution: [{week, frequency}], risks: {integration_risk, team_imbalance_risk, scope_creep_risk, learning_curve_risk} (each: {score, level, uplift, delay_days}), team_stress: {score, label, mitigation}, allocation: {frontend_pct, backend_pct, devops_pct, recommendation} }
- FailureForecastResponse: { failure_sequence: string[], mitigations: string[] }
- TaskBreakdownResponse: { tasks: [{index, title, role ("FE"|"BE"|"DevOps"), risk_flag?}] }
- ExecutiveSummaryResponse: { summary: string, key_metrics: {on_time_probability, p50_weeks, p90_weeks, top_risk} }

CRITICAL UX RULES:
1. Every input change must cause a visible output change.
2. Animate ONLY meaningful data: count-up numbers, chart data transitions, risk deltas. NO animation on static UI.
3. Strict visual hierarchy: On-time probability hero (largest), timeline chart, risk heatmap. Everything else quieter.
4. Mock data uses jitter — realistic variance, never clean round numbers.
5. Charts crossfade/morph between baseline and scenario. Never hard re-render.
6. "Load Demo" button pre-fills form with a realistic project.
7. Empty state before first run. Skeleton loaders during simulation. "Running 1,000 simulations..." loading text.
8. ONE card style (glow-card), ONE button style, ONE accent color, ONE font. Zero visual inconsistency.
9. Failure Forecast, Task Blueprint, Summary in Sheet panels — not on main screen.
10. Hero metrics card gets a subtle border glow-pulse when probability updates.

WHAT-IF SIMULATOR:
- Appears only after first simulation run
- Controls: Senior Dev delta (-1/0/+1), Integrations delta (-1/0/+1), Deadline delta (-2w/0/+2w)
- Auto-runs scenario with 400ms debounce on any change
- Baseline vs Scenario toggle
- Comparison grid: shows old → new value with color-coded deltas (green=good, red=bad)

CHART (Recharts ComposedChart):
- Bars for scenario frequency, dashed Area overlay for baseline
- X: completion weeks, Y: frequency
- P50/P90 reference lines with labels
- Dark-themed tooltip with blur backdrop
- Smooth 600ms animation on data change

COMPONENT STRUCTURE:
- lib/types.ts — TypeScript interfaces
- lib/api-client.ts — API functions with mock fallback
- lib/mock-data.ts — Realistic generators with jitter
- lib/app-state.tsx — React context for all shared state
- components/landing/hero-visual.tsx — Canvas-drawn animated preview card
- components/dashboard/navbar.tsx — Step indicator + panel triggers
- components/dashboard/intake-form.tsx — Full form with validation
- components/dashboard/what-if-panel.tsx — Scenario controls with debounce
- components/dashboard/results-dashboard.tsx — Orchestrator with loading/empty states
- components/dashboard/hero-metrics.tsx — Probability, P50, P90, overrun, costs with pulse glow
- components/dashboard/distribution-chart.tsx — Recharts with baseline overlay
- components/dashboard/risk-heatmap.tsx — 4 risk tiles with progress bars
- components/dashboard/team-stress.tsx — Score gauge with bar
- components/dashboard/allocation-chart.tsx — Stacked bar with legend
- components/dashboard/count-up.tsx — Animated number with easing
- components/dashboard/insight-panels.tsx — Sheet-based panels for insights

CSS UTILITIES (add to globals.css):
- .glow-card: box-shadow with accent at 15% opacity, stronger on hover
- .ambient-bg: radial gradient background with subtle accent
- .noise-overlay::before: fixed SVG noise at 1.5% opacity
- .pulse-glow: keyframe animation for metric updates
- .glow-border: accent border at 30% opacity for active states
```

---

This prompt contains everything needed to reproduce the PlanSight frontend with the correct types, API contract, dark futuristic design system, and UX rules.
