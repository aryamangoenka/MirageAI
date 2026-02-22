# PlanSight API Endpoints

Base URL: Set via `NEXT_PUBLIC_API_URL` environment variable.

All endpoints accept `POST` requests with JSON body and return JSON responses.

---

## 1. POST /simulate

Run a Monte Carlo simulation on a project configuration.

### Request Body

```json
{
  "project_name": "string",
  "description": "string",
  "scope_size": "small" | "medium" | "large",
  "complexity": 1-5,
  "tech_stack": "string",
  "deadline_weeks": number,
  "team_junior": number,
  "team_mid": number,
  "team_senior": number,
  "integrations_count": number (0-6),
  "scope_volatility": number (0-100),
  "num_simulations": number (optional, default 1000)
}
```

### Response Body

```json
{
  "on_time_probability": number (0-100),
  "p50_weeks": number,
  "p90_weeks": number,
  "expected_overrun_days": number,
  "p50_cost": number,
  "p90_cost": number,
  "num_simulations": number,
  "distribution": [
    { "week": number, "frequency": number }
  ],
  "risks": {
    "integration_risk": {
      "score": number (0-100),
      "level": "Low" | "Medium" | "High",
      "uplift": "string (e.g. '+18% delay')",
      "delay_days": number
    },
    "team_imbalance_risk": { ... same shape },
    "scope_creep_risk": { ... same shape },
    "learning_curve_risk": { ... same shape }
  },
  "team_stress": {
    "score": number (0-100),
    "label": "OK" | "Elevated" | "Critical",
    "mitigation": "string"
  },
  "allocation": {
    "frontend_pct": number,
    "backend_pct": number,
    "devops_pct": number,
    "recommendation": "string"
  }
}
```

---

## 2. POST /failure-forecast

Generate a failure sequence and mitigations based on simulation results.

### Request Body

```json
{
  "sim_id": "string (optional)"
}
```

### Response Body

```json
{
  "failure_sequence": [
    "string (e.g. 'Week 2: Integration API documentation proves incomplete...')"
  ],
  "mitigations": [
    "string (e.g. 'Pre-validate all third-party API contracts...')"
  ]
}
```

---

## 3. POST /task-breakdown

Generate an AI-powered task blueprint in dependency order.

### Request Body

```json
{
  "sim_id": "string (optional)"
}
```

### Response Body

```json
{
  "tasks": [
    {
      "index": number,
      "title": "string",
      "role": "FE" | "BE" | "DevOps",
      "risk_flag": "High Risk" | "Dependency Bottleneck" | "Early Validation" | null
    }
  ]
}
```

---

## 4. POST /executive-summary

Generate a concise executive summary from simulation data.

### Request Body

```json
{
  "simulation": { ... full SimulationResponse object }
}
```

### Response Body

```json
{
  "summary": "string (4-8 sentence executive summary)",
  "key_metrics": {
    "on_time_probability": number,
    "p50_weeks": number,
    "p90_weeks": number,
    "top_risk": "string"
  }
}
```

---

## Error Handling

All endpoints should return standard HTTP error codes:

- `400` - Invalid request body
- `500` - Internal server error

Error response format:

```json
{
  "error": "string (error message)"
}
```

---

## Notes

- The frontend gracefully falls back to mock data when the API is unavailable.
- The `distribution` array in `/simulate` should contain approximately 15-25 buckets spanning the plausible timeline range.
- Risk scores should be between 0-100, where higher means more risk.
- The `allocation` percentages should roughly sum to 100.
- The `failure_sequence` should contain 3-6 chronologically ordered failure events.
- The `mitigations` array should contain 2-4 actionable prevention steps.
- The `tasks` array should contain 8-12 tasks in dependency order.
