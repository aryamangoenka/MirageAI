from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from models.schemas import (
    SimulationRequest,
    SimulationResponse,
    HealthResponse,
    FailureForecastResponse,
    ExecutiveSummaryRequest,
    ExecutiveSummaryResponse,
    TaskBreakdownRequest,
    TaskBreakdownResponse,
    HistogramBucket,
    RiskScores,
)

app = FastAPI(title="PlanSight API", version="1.0.0")

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for liveness/readiness probes."""
    return HealthResponse(status="ok")


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(request: SimulationRequest):
    """
    Run full project simulation with Monte Carlo, risk analysis, and cost estimation.
    """
    from core.estimation import calculate_base_effort
    from core.monte_carlo import run_monte_carlo
    from core.risk import (
        calculate_risk_scores,
        calculate_team_stress_index,
        calculate_role_allocation,
        calculate_cost,
    )
    
    # Phase 2: Real estimation + Monte Carlo + risk
    base_effort = calculate_base_effort(request)
    mc_results = run_monte_carlo(request, base_effort)
    risk_scores = calculate_risk_scores(request, base_effort)
    team_stress = calculate_team_stress_index(request, base_effort, mc_results)
    
    # Phase 3: Role allocation and cost
    role_allocation = calculate_role_allocation(request)
    cost_data = calculate_cost(
        mc_results["p50_weeks"],
        mc_results["p90_weeks"],
        base_effort["total_team_size"]
    )
    
    return SimulationResponse(
        on_time_probability=mc_results["on_time_probability"],
        expected_overrun_days=mc_results["expected_overrun_days"],
        p50_weeks=mc_results["p50_weeks"],
        p90_weeks=mc_results["p90_weeks"],
        histogram=mc_results["histogram"],
        risk_scores=risk_scores,
        team_stress_index=team_stress,
        p50_cost=cost_data["p50_cost"],
        p90_cost=cost_data["p90_cost"],
        currency=cost_data["currency"],
        role_allocation=role_allocation,
        baseline_metrics={
            "base_effort_days": base_effort["base_effort_days"],
            "wsci": base_effort["wsci"],
            "integration_multiplier": base_effort["integration_multiplier"],
            "experience_factor": base_effort["experience_factor"],
        },
    )


@app.post("/failure-forecast", response_model=FailureForecastResponse)
async def failure_forecast(request: SimulationRequest):
    """
    Generate failure forecast with narrative and mitigations using LLM.
    """
    from core.estimation import calculate_base_effort
    from core.monte_carlo import run_monte_carlo
    from core.risk import calculate_risk_scores
    from services.llm_client import LLMClient
    
    # Run simulation to get worst-case data
    base_effort = calculate_base_effort(request)
    mc_results = run_monte_carlo(request, base_effort)
    risk_scores = calculate_risk_scores(request, base_effort)
    
    # Prepare context for LLM
    project_context = {
        "project_name": request.project_name,
        "description": request.description,
        "stack": request.stack,
        "team_junior": request.team_junior,
        "team_mid": request.team_mid,
        "team_senior": request.team_senior,
        "integrations": request.integrations,
        "deadline_weeks": request.deadline_weeks,
    }
    
    worst_runs = {
        "p90_weeks": mc_results["p90_weeks"],
    }
    
    risk_data = {
        "integration": risk_scores.integration,
        "team_imbalance": risk_scores.team_imbalance,
        "scope_creep": risk_scores.scope_creep,
        "learning_curve": risk_scores.learning_curve,
    }
    
    # Generate forecast using LLM
    llm_client = LLMClient()
    result = llm_client.generate_failure_forecast(project_context, worst_runs, risk_data)
    
    return FailureForecastResponse(
        failure_story=result["failure_story"],
        mitigations=result["mitigations"],
    )


@app.post("/executive-summary", response_model=ExecutiveSummaryResponse)
async def executive_summary(request: ExecutiveSummaryRequest):
    """
    Generate executive summary for leadership using LLM.
    """
    from services.llm_client import LLMClient
    
    project_context = {
        "project_name": request.project_name,
        "description": request.description,
        "stack": request.stack,
        "team_size": sum([
            request.role_allocation.get("fe", 0),
            request.role_allocation.get("be", 0),
            request.role_allocation.get("devops", 0)
        ]) * 3,
        "team_senior": 1,
        "team_mid": 1,
        "team_junior": 1,
        "deadline_weeks": int(request.p50_weeks),
    }
    
    metrics = {
        "on_time_probability": request.on_time_probability,
        "p50_weeks": request.p50_weeks,
        "p90_weeks": request.p90_weeks,
        "p50_cost": request.p50_cost,
        "p90_cost": request.p90_cost,
        "team_stress_index": 50,
        "risk_scores": {
            "integration": request.risk_scores.integration,
            "team_imbalance": request.risk_scores.team_imbalance,
            "scope_creep": request.risk_scores.scope_creep,
        },
    }
    
    llm_client = LLMClient()
    summary_text = llm_client.generate_executive_summary(project_context, metrics)
    
    return ExecutiveSummaryResponse(summary_text=summary_text)


@app.post("/task-breakdown", response_model=TaskBreakdownResponse)
async def task_breakdown(request: TaskBreakdownRequest):
    """
    Generate AI task breakdown with role and risk tags using LLM.
    """
    from services.llm_client import LLMClient
    from models.schemas import TaskItem
    
    project_context = {
        "project_name": request.project_name,
        "description": request.description,
        "stack": request.stack,
        "p50_weeks": request.p50_weeks,
        "p90_weeks": request.p90_weeks,
    }
    
    risks = {
        "integration": request.risk_scores.integration,
        "team_imbalance": request.risk_scores.team_imbalance,
        "learning_curve": request.risk_scores.learning_curve,
    }
    
    llm_client = LLMClient()
    tasks_data = llm_client.generate_task_breakdown(project_context, risks)
    
    # Convert to TaskItem objects
    tasks = [
        TaskItem(
            title=task["title"],
            role=task["role"],
            risk_flag=task.get("risk_flag")
        )
        for task in tasks_data
    ]
    
    return TaskBreakdownResponse(tasks=tasks)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
