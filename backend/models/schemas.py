from typing import Optional, Literal
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    """Request model for project simulation."""
    project_name: str
    description: str
    scope_size: Literal["small", "medium", "large"]
    complexity: int = Field(..., ge=1, le=5, description="Complexity rating 1-5")
    stack: str = Field(..., description="Tech stack (e.g., 'React + Node')")
    deadline_weeks: int = Field(..., gt=0, description="Target deadline in weeks")
    team_junior: int = Field(..., ge=0, description="Number of junior developers")
    team_mid: int = Field(..., ge=0, description="Number of mid-level developers")
    team_senior: int = Field(..., ge=0, description="Number of senior developers")
    integrations: int = Field(..., ge=0, description="Number of integrations (0-6+)")
    scope_volatility: int = Field(..., ge=0, le=100, description="Scope volatility 0-100")
    num_simulations: int = Field(1000, gt=0, description="Number of Monte Carlo runs")


class HistogramBucket(BaseModel):
    """Single bucket in the completion time histogram."""
    bucket_center_weeks: float
    count: int


class RiskScores(BaseModel):
    """Risk scores across four dimensions (0-100)."""
    integration: int = Field(..., ge=0, le=100)
    team_imbalance: int = Field(..., ge=0, le=100)
    scope_creep: int = Field(..., ge=0, le=100)
    learning_curve: int = Field(..., ge=0, le=100)
    integration_uplift: Optional[str] = None
    team_imbalance_uplift: Optional[str] = None
    scope_creep_uplift: Optional[str] = None
    learning_curve_uplift: Optional[str] = None


class SimulationResponse(BaseModel):
    """Full simulation result with timeline, risks, costs, and allocation."""
    on_time_probability: float = Field(..., ge=0, le=1)
    expected_overrun_days: float = Field(..., ge=0)
    p50_weeks: float
    p90_weeks: float
    histogram: list[HistogramBucket]
    risk_scores: RiskScores
    team_stress_index: int = Field(..., ge=0, le=100)
    p50_cost: float
    p90_cost: float
    currency: str
    role_allocation: dict[str, float]
    baseline_metrics: Optional[dict] = None


class FailureForecastResponse(BaseModel):
    """Failure forecast with narrative and mitigations."""
    failure_story: list[str] = Field(..., description="3-5 bullet points describing failure scenario")
    mitigations: list[str] = Field(..., description="Top 3 mitigation recommendations")


class ExecutiveSummaryRequest(BaseModel):
    """Request for executive summary generation."""
    project_name: str
    description: str
    stack: str
    p50_weeks: float
    p90_weeks: float
    on_time_probability: float
    p50_cost: float
    p90_cost: float
    currency: str
    risk_scores: RiskScores
    role_allocation: dict[str, float]


class ExecutiveSummaryResponse(BaseModel):
    """Executive summary response."""
    summary_text: str = Field(..., description="4-8 sentence executive summary")


class TaskItem(BaseModel):
    """Single task in the AI-generated task breakdown."""
    title: str
    role: str = Field(..., description="FE, BE, or DevOps")
    risk_flag: Optional[str] = Field(None, description="e.g., 'High Risk', 'Dependency Bottleneck'")


class TaskBreakdownRequest(BaseModel):
    """Request for AI task breakdown."""
    project_name: str
    description: str
    stack: str
    p50_weeks: float
    p90_weeks: float
    risk_scores: RiskScores


class TaskBreakdownResponse(BaseModel):
    """Task breakdown response."""
    tasks: list[TaskItem] = Field(..., description="10 ordered implementation tasks")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
