"""
Base effort estimation, WSCI, integration multiplier, experience variance.
"""

from models.schemas import SimulationRequest


# Base effort mapping: scope x complexity -> TOTAL team dev-days (not per-person).
# Calibrated for realistic teams of 3-6 people; calendar time = dev-days / team_size.
# small ≈ 1-4 week project for a 4-person team at medium complexity.
# medium ≈ 8-14 week project for a 4-person team at medium complexity.
# large ≈ 20-30 week project for a 4-person team at medium complexity.
SCOPE_BASE_DAYS = {
    "small":  {"base": 50,  "complexity_multiplier": 10},
    "medium": {"base": 100, "complexity_multiplier": 20},
    "large":  {"base": 200, "complexity_multiplier": 40},
}

# Weighted Stack Complexity Index (WSCI)
STACK_WSCI = {
    "react": 1.0,
    "react + node": 1.2,
    "react + python": 1.15,
    "next.js": 1.25,
    "vue": 0.95,
    "vue + node": 1.15,
    "angular": 1.3,
    "python monolith": 1.0,
    "django": 1.1,
    "flask": 0.95,
    "fastapi": 0.9,
    "ruby on rails": 1.2,
    "laravel": 1.15,
    "spring boot": 1.4,
    ".net": 1.35,
    "go": 0.85,
    "rust": 1.5,
    "default": 1.0,
}


def calculate_base_effort(request: SimulationRequest) -> dict:
    """
    Calculate base effort in dev-days from scope and complexity.
    Returns dict with base_effort_days and other estimation factors.
    """
    # 1. Base effort from scope and complexity
    scope_config = SCOPE_BASE_DAYS[request.scope_size]
    base_days = scope_config["base"] + (request.complexity * scope_config["complexity_multiplier"])
    
    # 2. WSCI (stack complexity)
    stack_key = request.stack.lower().strip()
    wsci = STACK_WSCI.get(stack_key, STACK_WSCI["default"])
    
    # 3. Integration multiplier
    integration_multiplier = 1.0 + (request.integrations * 0.08)
    if request.integrations > 4:
        integration_multiplier += 0.15
    
    # 4. Experience variance (team seniority)
    total_team = request.team_junior + request.team_mid + request.team_senior
    if total_team == 0:
        experience_factor = 1.5
    else:
        senior_ratio = request.team_senior / total_team
        mid_ratio = request.team_mid / total_team
        junior_ratio = request.team_junior / total_team
        
        # Weighted experience: senior=1.0, mid=1.2, junior=1.6
        experience_factor = (senior_ratio * 1.0) + (mid_ratio * 1.2) + (junior_ratio * 1.6)
    
    # 5. Dependency clustering penalty (high complexity + many integrations)
    dependency_penalty = 1.0
    if request.complexity >= 4 and request.integrations >= 3:
        dependency_penalty = 1.2
    elif request.complexity >= 3 and request.integrations >= 5:
        dependency_penalty = 1.15
    
    # 6. Scope volatility factor (affects variance, not base)
    scope_volatility_factor = request.scope_volatility / 100.0
    
    # Final effort calculation
    ideal_days = base_days * wsci * integration_multiplier * experience_factor * dependency_penalty
    
    return {
        "base_effort_days": round(ideal_days, 1),
        "wsci": wsci,
        "integration_multiplier": round(integration_multiplier, 2),
        "experience_factor": round(experience_factor, 2),
        "dependency_penalty": round(dependency_penalty, 2),
        "scope_volatility_factor": round(scope_volatility_factor, 2),
        "total_team_size": total_team,
    }
