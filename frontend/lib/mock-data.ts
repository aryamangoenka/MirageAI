import type {
  SimulationResponse,
  FailureForecastResponse,
  TaskBreakdownResponse,
  ExecutiveSummaryResponse,
  DistributionBucket,
} from "./types"

function jitter(base: number, range: number): number {
  return +(base + (Math.random() - 0.5) * range).toFixed(1)
}

function generateDistribution(p50: number, p90: number): DistributionBucket[] {
  const buckets: DistributionBucket[] = []
  const mean = p50
  const stdDev = (p90 - p50) / 1.28
  for (let week = Math.max(1, Math.floor(mean - 3 * stdDev)); week <= Math.ceil(mean + 3 * stdDev); week++) {
    const z = (week - mean) / stdDev
    const freq = Math.round(1000 * Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI)))
    buckets.push({ week, frequency: Math.max(1, freq + Math.round((Math.random() - 0.5) * 8)) })
  }
  return buckets
}

export function generateMockSimulation(overrides?: Partial<SimulationResponse>): SimulationResponse {
  const onTime = jitter(42, 16)
  const p50 = jitter(14, 4)
  const p90 = jitter(21, 5)
  const overrun = jitter(18, 10)

  return {
    on_time_probability: onTime,
    p50_weeks: p50,
    p90_weeks: p90,
    expected_overrun_days: overrun,
    p50_cost: jitter(48000, 12000),
    p90_cost: jitter(72000, 18000),
    num_simulations: 1000,
    distribution: generateDistribution(p50, p90),
    risks: {
      integration_risk: { score: jitter(62, 20), level: "Medium", uplift: `+${jitter(18, 8)}% delay`, delay_days: jitter(6, 4) },
      team_imbalance_risk: { score: jitter(45, 20), level: "Medium", uplift: `+${jitter(12, 6)}% delay`, delay_days: jitter(4, 3) },
      scope_creep_risk: { score: jitter(71, 20), level: "High", uplift: `+${jitter(25, 10)}% delay`, delay_days: jitter(9, 5) },
      learning_curve_risk: { score: jitter(33, 16), level: "Low", uplift: `+${jitter(8, 4)}% delay`, delay_days: jitter(3, 2) },
    },
    team_stress: {
      score: jitter(58, 20),
      label: "Elevated",
      mitigation: "Consider redistributing integration tasks across mid-level developers to reduce senior bottleneck.",
    },
    allocation: {
      frontend_pct: jitter(40, 10),
      backend_pct: jitter(45, 10),
      devops_pct: jitter(15, 6),
      recommendation: "Recommended: 1.2 FE, 1.4 BE, 0.4 DevOps (shared)",
    },
    ...overrides,
  }
}

export function generateMockScenario(baseline: SimulationResponse, seniorDelta: number, integrationsDelta: number, deadlineDelta: number): SimulationResponse {
  const probShift = seniorDelta * 8 - integrationsDelta * 5 + deadlineDelta * 3
  const newProb = Math.max(5, Math.min(95, baseline.on_time_probability + probShift + jitter(0, 4)))
  const weekShift = -seniorDelta * 1.2 + integrationsDelta * 0.8 - deadlineDelta * 0.5
  const newP50 = Math.max(2, baseline.p50_weeks + weekShift + jitter(0, 0.8))
  const newP90 = Math.max(newP50 + 2, baseline.p90_weeks + weekShift * 1.3 + jitter(0, 1))
  const stressShift = -seniorDelta * 10 + integrationsDelta * 6 - deadlineDelta * 3

  return {
    ...baseline,
    on_time_probability: +newProb.toFixed(1),
    p50_weeks: +newP50.toFixed(1),
    p90_weeks: +newP90.toFixed(1),
    expected_overrun_days: +(baseline.expected_overrun_days - probShift * 0.4 + jitter(0, 3)).toFixed(1),
    p50_cost: +(baseline.p50_cost + weekShift * 3200 + jitter(0, 2000)).toFixed(0),
    p90_cost: +(baseline.p90_cost + weekShift * 4500 + jitter(0, 3000)).toFixed(0),
    distribution: generateDistribution(newP50, newP90),
    team_stress: {
      ...baseline.team_stress,
      score: Math.max(10, Math.min(100, +(baseline.team_stress.score + stressShift + jitter(0, 4)).toFixed(0))),
      label: baseline.team_stress.score + stressShift > 70 ? "Critical" : baseline.team_stress.score + stressShift > 40 ? "Elevated" : "OK",
    },
  }
}

export function generateMockFailureForecast(): FailureForecastResponse {
  return {
    failure_sequence: [
      "Week 2: Integration API documentation proves incomplete, causing 3-day discovery phase",
      "Week 4: Senior developer pulled to firefight production issue, creating 5-day bottleneck",
      "Week 6: Scope creep from stakeholder feedback adds 2 unplanned features to sprint backlog",
      "Week 8: Testing reveals data model mismatch, requiring schema migration and 4-day rework",
      "Week 10: Deployment pipeline fails under load, revealing untested concurrency edge case",
    ],
    mitigations: [
      "Pre-validate all third-party API contracts in Week 1 with integration smoke tests",
      "Assign a dedicated backup senior developer for critical-path tasks to reduce bus factor",
      "Implement a formal change request process with impact scoring before accepting scope additions",
    ],
  }
}

export function generateMockTaskBreakdown(): TaskBreakdownResponse {
  return {
    tasks: [
      { index: 1, title: "Set up CI/CD pipeline and staging environment", role: "DevOps", risk_flag: "Early Validation" },
      { index: 2, title: "Design and implement database schema", role: "BE", risk_flag: "High Risk" },
      { index: 3, title: "Build authentication and authorization layer", role: "BE", risk_flag: "Dependency Bottleneck" },
      { index: 4, title: "Scaffold frontend application with routing", role: "FE" },
      { index: 5, title: "Implement core API endpoints", role: "BE", risk_flag: "High Risk" },
      { index: 6, title: "Build primary user interface components", role: "FE" },
      { index: 7, title: "Integrate third-party services and APIs", role: "BE", risk_flag: "Dependency Bottleneck" },
      { index: 8, title: "Connect frontend to backend APIs", role: "FE" },
      { index: 9, title: "End-to-end testing and performance optimization", role: "FE", risk_flag: "Early Validation" },
      { index: 10, title: "Production deployment and monitoring setup", role: "DevOps" },
    ],
  }
}

export function generateMockExecutiveSummary(sim: SimulationResponse): ExecutiveSummaryResponse {
  const topRisk = Object.entries(sim.risks).reduce((a, b) => (a[1].score > b[1].score ? a : b))
  const riskName = topRisk[0].replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return {
    summary: `Based on ${sim.num_simulations.toLocaleString()} Monte Carlo simulations, this project has a ${sim.on_time_probability}% probability of completing on time. The median completion timeline is ${sim.p50_weeks} weeks (P50), with a pessimistic estimate of ${sim.p90_weeks} weeks (P90), representing a potential overrun of ${sim.expected_overrun_days} days. The estimated cost ranges from $${sim.p50_cost.toLocaleString()} to $${sim.p90_cost.toLocaleString()}. The highest risk factor is ${riskName} at a score of ${topRisk[1].score}/100, which could contribute an additional ${topRisk[1].delay_days} days of delay. Team stress is currently rated as "${sim.team_stress.label}" (${sim.team_stress.score}/100). We recommend focusing mitigation efforts on the top risk factor and considering team composition adjustments to improve the probability envelope.`,
    key_metrics: {
      on_time_probability: sim.on_time_probability,
      p50_weeks: sim.p50_weeks,
      p90_weeks: sim.p90_weeks,
      top_risk: riskName,
    },
  }
}

export const DEMO_FORM_DATA = {
  project_name: "FinTrack Mobile App",
  description: "Cross-platform mobile application for personal finance tracking with bank integration, budgeting tools, and AI-powered spending insights.",
  scope_size: "medium" as const,
  complexity: 3,
  tech_stack: "React Native",
  deadline_weeks: 12,
  team_junior: 1,
  team_mid: 2,
  team_senior: 1,
  integrations_count: 3,
  scope_volatility: 45,
  num_simulations: 1000,
}
