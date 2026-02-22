"""
Monte Carlo simulation engine for project completion estimates.
"""

import numpy as np
from models.schemas import SimulationRequest, HistogramBucket


def run_monte_carlo(request: SimulationRequest, base_effort: dict) -> dict:
    """
    Run N Monte Carlo simulations and return aggregated results.
    Returns dict with p50_weeks, p90_weeks, on_time_probability, histogram, etc.
    """
    n_simulations = request.num_simulations
    base_days = base_effort["base_effort_days"]
    scope_volatility = base_effort["scope_volatility_factor"]
    team_size = max(1, base_effort["total_team_size"])

    # Initialize results array
    completion_days = np.zeros(n_simulations)
    
    for i in range(n_simulations):
        # Sample perturbations from distributions
        
        # 1. Scope growth: normal distribution centered at 1.0, std based on volatility
        scope_growth = np.random.normal(1.0, 0.15 * scope_volatility + 0.05)
        scope_growth = max(0.8, min(1.5, scope_growth))
        
        # 2. Integration delays: lognormal for occasional large delays
        integration_delay_factor = 1.0
        if request.integrations > 0:
            # Lognormal: mean near 1.0, with right-skew for rare big delays
            mean_log = 0.0
            std_log = 0.08 * request.integrations
            integration_delay_factor = np.random.lognormal(mean_log, std_log)
            integration_delay_factor = min(1.5, integration_delay_factor)
        
        # 3. Experience variance: junior teams have higher variance
        experience_variance = 1.0
        if base_effort["total_team_size"] > 0:
            junior_ratio = request.team_junior / base_effort["total_team_size"]
            variance_std = 0.1 + (junior_ratio * 0.15)
            experience_variance = np.random.normal(1.0, variance_std)
            experience_variance = max(0.7, min(1.4, experience_variance))
        
        # 4. Random unexpected delays (bugs, miscommunication, etc.)
        # Lognormal centered near 1.0 with occasional spikes
        unexpected_factor = np.random.lognormal(0.0, 0.12)
        unexpected_factor = min(1.3, unexpected_factor)
        
        # Compute this run's total dev-days effort, then convert to calendar days
        # by dividing by team_size (how many people work in parallel).
        effort_days = base_days * scope_growth * integration_delay_factor * experience_variance * unexpected_factor
        calendar_days = effort_days / team_size
        completion_days[i] = calendar_days

    
    # Convert days to weeks (5 work days per week)
    completion_weeks = completion_days / 5.0
    
    # Calculate statistics
    p50_weeks = float(np.percentile(completion_weeks, 50))
    p90_weeks = float(np.percentile(completion_weeks, 90))
    
    # On-time probability
    deadline_weeks = request.deadline_weeks
    on_time_count = np.sum(completion_weeks <= deadline_weeks)
    on_time_probability = float(on_time_count / n_simulations)
    
    # Expected overrun (only for late runs)
    late_runs = completion_weeks[completion_weeks > deadline_weeks]
    if len(late_runs) > 0:
        expected_overrun_days = float(np.mean(late_runs - deadline_weeks) * 5)
    else:
        expected_overrun_days = 0.0
    
    # Build histogram (buckets by week)
    min_week = max(0, int(np.min(completion_weeks)) - 1)
    max_week = int(np.max(completion_weeks)) + 2
    hist, bin_edges = np.histogram(completion_weeks, bins=range(min_week, max_week + 1))
    
    histogram = []
    for i in range(len(hist)):
        bucket_center = (bin_edges[i] + bin_edges[i + 1]) / 2.0
        histogram.append(HistogramBucket(
            bucket_center_weeks=round(bucket_center, 1),
            count=int(hist[i])
        ))
    
    return {
        "p50_weeks": round(p50_weeks, 1),
        "p90_weeks": round(p90_weeks, 1),
        "on_time_probability": round(on_time_probability, 3),
        "expected_overrun_days": round(expected_overrun_days, 1),
        "histogram": histogram,
        "completion_samples": completion_weeks.tolist(),
    }
