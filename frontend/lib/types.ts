// ── Request Types ──

export interface SimulationRequest {
  project_name: string
  description: string
  scope_size: "small" | "medium" | "large"
  complexity: number
  tech_stack: string
  deadline_weeks: number
  team_junior: number
  team_mid: number
  team_senior: number
  integrations_count: number
  scope_volatility: number
  num_simulations?: number
}

// ── Response Types ──

export interface SimulationResponse {
  on_time_probability: number
  p50_weeks: number
  p90_weeks: number
  expected_overrun_days: number
  p50_cost: number
  p90_cost: number
  num_simulations: number
  distribution: DistributionBucket[]
  risks: RiskBreakdown
  team_stress: TeamStress
  allocation: SmartAllocation
}

export interface DistributionBucket {
  week: number
  frequency: number
}

export interface RiskBreakdown {
  integration_risk: RiskItem
  team_imbalance_risk: RiskItem
  scope_creep_risk: RiskItem
  learning_curve_risk: RiskItem
}

export interface RiskItem {
  score: number
  level: "Low" | "Medium" | "High"
  uplift: string
  delay_days: number
}

export interface TeamStress {
  score: number
  label: "OK" | "Elevated" | "Critical"
  mitigation: string
}

export interface SmartAllocation {
  frontend_pct: number
  backend_pct: number
  devops_pct: number
  recommendation: string
}

export interface FailureForecastResponse {
  failure_sequence: string[]
  mitigations: string[]
}

export interface TaskItem {
  index: number
  title: string
  role: "FE" | "BE" | "DevOps"
  risk_flag?: "High Risk" | "Dependency Bottleneck" | "Early Validation"
}

export interface TaskBreakdownResponse {
  tasks: TaskItem[]
}

export interface ExecutiveSummaryResponse {
  summary: string
  key_metrics: {
    on_time_probability: number
    p50_weeks: number
    p90_weeks: number
    top_risk: string
  }
}

// ── Execution Plan ──────────────────────────────────────────────────────────

export interface ExecutionPlanTask {
  title: string
  role: "FE" | "BE" | "DevOps"
  priority: "high" | "medium" | "low"
  risk_flag?: "High Risk" | "Dependency Bottleneck" | "Early Validation" | null
}

export interface ExecutionPlanPhase {
  name: string
  week_start: number
  week_end: number
  description: string
  tasks: ExecutionPlanTask[]
  risks: string[]
  milestone: string
}

export interface GoNoGoCheckpoint {
  week: number
  condition: string
}

export interface ExecutionPlanResponse {
  phases: ExecutionPlanPhase[]
  go_no_go_checkpoints: GoNoGoCheckpoint[]
  critical_path_note: string
}
