"""
Risk scoring, team stress index, and role allocation.
"""

from models.schemas import SimulationRequest, RiskScores
import os


def calculate_risk_scores(request: SimulationRequest, base_effort: dict) -> RiskScores:
    """
    Calculate four risk scores (0-100) with optional uplift text.
    """
    # 1. Integration risk (0-100)
    integration_risk = min(100, request.integrations * 15)
    integration_uplift = None
    if integration_risk >= 60:
        integration_uplift = f"+{int(integration_risk * 0.3)}% integration complexity"
    elif integration_risk >= 30:
        integration_uplift = f"+{int(integration_risk * 0.2)}% integration overhead"
    
    # 2. Team imbalance risk (junior/senior ratio)
    total_team = base_effort["total_team_size"]
    if total_team == 0:
        team_imbalance_risk = 90
        team_imbalance_uplift = "+50% risk from no assigned team"
    else:
        junior_ratio = request.team_junior / total_team
        senior_ratio = request.team_senior / total_team
        
        # High if too many juniors or no seniors
        if senior_ratio == 0:
            team_imbalance_risk = 80
            team_imbalance_uplift = "+40% risk from no senior oversight"
        elif junior_ratio > 0.6:
            team_imbalance_risk = int(70 * junior_ratio)
            team_imbalance_uplift = f"+{int(junior_ratio * 30)}% junior team velocity drag"
        else:
            team_imbalance_risk = int(30 * junior_ratio)
            team_imbalance_uplift = None
    
    # 3. Scope creep risk (volatility)
    scope_creep_risk = request.scope_volatility
    scope_creep_uplift = None
    if scope_creep_risk >= 70:
        scope_creep_uplift = f"+{int(scope_creep_risk * 0.35)}% scope growth risk"
    elif scope_creep_risk >= 40:
        scope_creep_uplift = f"+{int(scope_creep_risk * 0.25)}% potential scope expansion"
    
    # 4. Learning curve / tooling risk (new stack + complexity)
    wsci = base_effort["wsci"]
    learning_base = int((wsci - 1.0) * 100)
    if request.complexity >= 4:
        learning_risk = min(100, learning_base + 30)
        learning_uplift = f"+{int(learning_risk * 0.3)}% learning curve impact"
    elif wsci > 1.2:
        learning_risk = min(100, learning_base + 15)
        learning_uplift = f"+{int(learning_risk * 0.2)}% new stack learning"
    else:
        learning_risk = learning_base
        learning_uplift = None
    
    return RiskScores(
        integration=integration_risk,
        team_imbalance=team_imbalance_risk,
        scope_creep=scope_creep_risk,
        learning_curve=learning_risk,
        integration_uplift=integration_uplift,
        team_imbalance_uplift=team_imbalance_uplift,
        scope_creep_uplift=scope_creep_uplift,
        learning_curve_uplift=learning_uplift,
    )


def calculate_team_stress_index(request: SimulationRequest, base_effort: dict, mc_results: dict) -> int:
    """
    Calculate team stress index (0-100) from timeline compression, role overload, etc.
    All components use team_size in the denominator so that adding devs reduces stress.
    """
    total_team = base_effort["total_team_size"]
    if total_team == 0:
        return 100

    base_days = base_effort["base_effort_days"]
    available_days = max(1, request.deadline_weeks * 5)

    # 1. Timeline compression: P50 vs deadline.
    #    p50_ratio > 1 means team is expected to be late (very high stress).
    p50_weeks = mc_results.get("p50_weeks", request.deadline_weeks)
    p50_ratio = p50_weeks / request.deadline_weeks if request.deadline_weeks > 0 else 2.0
    timeline_compression = min(100, int(p50_ratio * 80))

    # 2. Role overload: dev-days required per person vs available days.
    #    A ratio of 1.0 means each dev is working at 100% capacity — high stress.
    tasks_per_dev = base_days / total_team
    overload_ratio = tasks_per_dev / available_days
    role_overload = min(100, int(overload_ratio * 100))

    # 3. Parallel task density: coordination overhead per dev.
    task_density = (request.complexity * 5 + request.integrations * 3) / total_team
    parallel_stress = min(100, int(task_density * 4))

    stress_index = int(
        timeline_compression * 0.4 +
        role_overload * 0.3 +
        parallel_stress * 0.3
    )

    return min(100, stress_index)


def calculate_role_allocation(request: SimulationRequest) -> dict[str, float]:
    """
    Calculate recommended role allocation (fe/be/devops) from stack and integrations.
    """
    stack_lower = request.stack.lower()
    
    # Default allocation
    fe_ratio = 0.35
    be_ratio = 0.50
    devops_ratio = 0.15
    
    # Adjust based on stack
    if "react" in stack_lower or "vue" in stack_lower or "angular" in stack_lower or "next.js" in stack_lower:
        fe_ratio = 0.40
        be_ratio = 0.45
    
    if "monolith" in stack_lower or "django" in stack_lower or "rails" in stack_lower:
        fe_ratio = 0.30
        be_ratio = 0.55
    
    if "microservice" in stack_lower or request.integrations > 4:
        devops_ratio = 0.20
        be_ratio -= 0.05
    
    # Normalize to sum to 1.0
    total = fe_ratio + be_ratio + devops_ratio
    return {
        "fe": round(fe_ratio / total, 2),
        "be": round(be_ratio / total, 2),
        "devops": round(devops_ratio / total, 2),
    }


def calculate_cost(p50_weeks: float, p90_weeks: float, team_size: int, rate_per_dev_day: float = None) -> dict:
    """
    Calculate p50_cost and p90_cost from timeline and team size.
    """
    if rate_per_dev_day is None:
        rate_per_dev_day = float(os.getenv("COST_RATE_PER_DEV_DAY", "500.0"))
    
    currency = os.getenv("CURRENCY", "USD")
    
    return {
        "p50_cost": round(p50_weeks * 5 * team_size * rate_per_dev_day, 2),
        "p90_cost": round(p90_weeks * 5 * team_size * rate_per_dev_day, 2),
        "currency": currency,
    }
