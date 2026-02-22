import type {
  SimulationRequest,
  SimulationResponse,
  FailureForecastResponse,
  TaskBreakdownResponse,
  ExecutiveSummaryResponse,
} from "./types"
import {
  generateMockSimulation,
  generateMockFailureForecast,
  generateMockTaskBreakdown,
  generateMockExecutiveSummary,
  generateMockScenario,
} from "./mock-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

// Backend response types
interface BackendSimulationResponse {
  on_time_probability: number
  expected_overrun_days: number
  p50_weeks: number
  p90_weeks: number
  histogram: Array<{ bucket_center_weeks: number; count: number }>
  risk_scores: {
    integration: number
    team_imbalance: number
    scope_creep: number
    learning_curve: number
  }
  team_stress_index: number
  p50_cost: number
  p90_cost: number
  currency: string
  role_allocation: {
    fe: number
    be: number
    devops: number
  }
  baseline_metrics: any
}

interface BackendFailureForecastResponse {
  failure_story: string[]
  mitigations: string[]
}

interface BackendTaskItem {
  title: string
  role: "FE" | "BE" | "DevOps"
  risk_flag: string | null
}

interface BackendTaskBreakdownResponse {
  tasks: BackendTaskItem[]
}

interface BackendExecutiveSummaryResponse {
  summary_text: string
}

// Transform backend responses to frontend format
function transformSimulationResponse(backend: BackendSimulationResponse, numSimulations: number): SimulationResponse {
  const getRiskLevel = (score: number): "Low" | "Medium" | "High" => {
    if (score >= 60) return "High"
    if (score >= 30) return "Medium"
    return "Low"
  }

  const getUplift = (score: number, type: string): string => {
    if (score >= 60) return `High ${type} risk (+${Math.round(score * 0.03)}w impact)`
    if (score >= 30) return `Medium ${type} risk (+${Math.round(score * 0.02)}w impact)`
    return `Low ${type} risk`
  }

  const getStressLabel = (stress: number): "OK" | "Elevated" | "Critical" => {
    if (stress >= 70) return "Critical"
    if (stress >= 40) return "Elevated"
    return "OK"
  }

  // Backend on_time_probability is a fraction (0–1); convert to percentage for display
  const onTimePct = +(backend.on_time_probability * 100).toFixed(1)

  // Backend role_allocation values are fractions (0–1); convert to percentages
  const fePct = +(backend.role_allocation.fe * 100).toFixed(0)
  const bePct = +(backend.role_allocation.be * 100).toFixed(0)
  const devopsPct = +(backend.role_allocation.devops * 100).toFixed(0)

  return {
    on_time_probability: onTimePct,
    p50_weeks: backend.p50_weeks,
    p90_weeks: backend.p90_weeks,
    expected_overrun_days: backend.expected_overrun_days,
    p50_cost: backend.p50_cost,
    p90_cost: backend.p90_cost,
    num_simulations: numSimulations,
    distribution: backend.histogram.map((b) => ({
      week: Math.round(b.bucket_center_weeks),
      frequency: b.count,
    })),
    risks: {
      integration_risk: {
        score: backend.risk_scores.integration,
        level: getRiskLevel(backend.risk_scores.integration),
        uplift: getUplift(backend.risk_scores.integration, "integration"),
        delay_days: Math.round(backend.risk_scores.integration * 0.5),
      },
      team_imbalance_risk: {
        score: backend.risk_scores.team_imbalance,
        level: getRiskLevel(backend.risk_scores.team_imbalance),
        uplift: getUplift(backend.risk_scores.team_imbalance, "team imbalance"),
        delay_days: Math.round(backend.risk_scores.team_imbalance * 0.4),
      },
      scope_creep_risk: {
        score: backend.risk_scores.scope_creep,
        level: getRiskLevel(backend.risk_scores.scope_creep),
        uplift: getUplift(backend.risk_scores.scope_creep, "scope creep"),
        delay_days: Math.round(backend.risk_scores.scope_creep * 0.6),
      },
      learning_curve_risk: {
        score: backend.risk_scores.learning_curve,
        level: getRiskLevel(backend.risk_scores.learning_curve),
        uplift: getUplift(backend.risk_scores.learning_curve, "learning curve"),
        delay_days: Math.round(backend.risk_scores.learning_curve * 0.5),
      },
    },
    team_stress: {
      score: backend.team_stress_index,
      label: getStressLabel(backend.team_stress_index),
      mitigation:
        backend.team_stress_index >= 70
          ? "Add senior dev or extend deadline by 2+ weeks"
          : backend.team_stress_index >= 40
          ? "Monitor workload closely"
          : "Current pace is sustainable",
    },
    allocation: {
      frontend_pct: fePct,
      backend_pct: bePct,
      devops_pct: devopsPct,
      recommendation: `Recommended: ${fePct}% FE, ${bePct}% BE, ${devopsPct}% DevOps`,
    },
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) {
    throw new Error("NO_API")
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  try {
    // Transform frontend request to backend format
    const backendRequest = {
      project_name: req.project_name,
      description: req.description,
      scope_size: req.scope_size,
      complexity: req.complexity,
      stack: req.tech_stack, // frontend uses tech_stack, backend uses stack
      deadline_weeks: req.deadline_weeks,
      team_junior: req.team_junior,
      team_mid: req.team_mid,
      team_senior: req.team_senior,
      integrations: req.integrations_count, // frontend uses integrations_count, backend uses integrations
      scope_volatility: req.scope_volatility,
      num_simulations: req.num_simulations || 1000,
    }

    const backendResponse = await post<BackendSimulationResponse>("/simulate", backendRequest)
    return transformSimulationResponse(backendResponse, backendRequest.num_simulations)
  } catch (error) {
    console.error("API error, using mock data:", error)
    await delay(1200 + Math.random() * 800)
    return generateMockSimulation()
  }
}

export async function runScenario(
  baseline: SimulationResponse,
  seniorDelta: number,
  integrationsDelta: number,
  deadlineDelta: number
): Promise<SimulationResponse> {
  try {
    // For now, use mock scenario since backend doesn't have a scenario endpoint
    await delay(600 + Math.random() * 400)
    return generateMockScenario(baseline, seniorDelta, integrationsDelta, deadlineDelta)
  } catch {
    await delay(600 + Math.random() * 400)
    return generateMockScenario(baseline, seniorDelta, integrationsDelta, deadlineDelta)
  }
}

export async function fetchFailureForecast(req: SimulationRequest): Promise<FailureForecastResponse> {
  try {
    const backendRequest = {
      project_name: req.project_name,
      description: req.description,
      scope_size: req.scope_size,
      complexity: req.complexity,
      stack: req.tech_stack,
      deadline_weeks: req.deadline_weeks,
      team_junior: req.team_junior,
      team_mid: req.team_mid,
      team_senior: req.team_senior,
      integrations: req.integrations_count,
      scope_volatility: req.scope_volatility,
      num_simulations: req.num_simulations || 1000,
    }

    const backendResponse = await post<BackendFailureForecastResponse>("/failure-forecast", backendRequest)
    return {
      failure_sequence: backendResponse.failure_story,
      mitigations: backendResponse.mitigations,
    }
  } catch (error) {
    console.error("API error, using mock data:", error)
    await delay(800 + Math.random() * 600)
    return generateMockFailureForecast()
  }
}

export async function fetchTaskBreakdown(
  req: SimulationRequest,
  sim: SimulationResponse
): Promise<TaskBreakdownResponse> {
  try {
    const backendRequest = {
      project_name: req.project_name,
      description: req.description,
      stack: req.tech_stack,
      p50_weeks: sim.p50_weeks,
      p90_weeks: sim.p90_weeks,
      risk_scores: {
        integration: sim.risks.integration_risk.score,
        team_imbalance: sim.risks.team_imbalance_risk.score,
        scope_creep: sim.risks.scope_creep_risk.score,
        learning_curve: sim.risks.learning_curve_risk.score,
      },
    }

    const backendResponse = await post<BackendTaskBreakdownResponse>("/task-breakdown", backendRequest)
    return {
      tasks: backendResponse.tasks.map((task, idx) => ({
        index: idx + 1,
        title: task.title,
        role: task.role,
        risk_flag: task.risk_flag as any,
      })),
    }
  } catch (error) {
    console.error("API error, using mock data:", error)
    await delay(700 + Math.random() * 500)
    return generateMockTaskBreakdown()
  }
}

export async function fetchExecutiveSummary(
  req: SimulationRequest,
  sim: SimulationResponse
): Promise<ExecutiveSummaryResponse> {
  try {
    const backendRequest = {
      project_name: req.project_name,
      description: req.description,
      stack: req.tech_stack,
      p50_weeks: sim.p50_weeks,
      p90_weeks: sim.p90_weeks,
      on_time_probability: sim.on_time_probability,
      p50_cost: sim.p50_cost,
      p90_cost: sim.p90_cost,
      currency: "USD",
      risk_scores: {
        integration: sim.risks.integration_risk.score,
        team_imbalance: sim.risks.team_imbalance_risk.score,
        scope_creep: sim.risks.scope_creep_risk.score,
        learning_curve: sim.risks.learning_curve_risk.score,
      },
      role_allocation: {
        fe: sim.allocation.frontend_pct,
        be: sim.allocation.backend_pct,
        devops: sim.allocation.devops_pct,
      },
    }

    const backendResponse = await post<BackendExecutiveSummaryResponse>("/executive-summary", backendRequest)

    // Determine top risk
    const risks = [
      { name: "Integration", score: sim.risks.integration_risk.score },
      { name: "Team Imbalance", score: sim.risks.team_imbalance_risk.score },
      { name: "Scope Creep", score: sim.risks.scope_creep_risk.score },
      { name: "Learning Curve", score: sim.risks.learning_curve_risk.score },
    ]
    const topRisk = risks.reduce((max, r) => (r.score > max.score ? r : max)).name

    return {
      summary: backendResponse.summary_text,
      key_metrics: {
        on_time_probability: sim.on_time_probability,
        p50_weeks: sim.p50_weeks,
        p90_weeks: sim.p90_weeks,
        top_risk: topRisk,
      },
    }
  } catch (error) {
    console.error("API error, using mock data:", error)
    await delay(900 + Math.random() * 600)
    return generateMockExecutiveSummary(sim)
  }
}
