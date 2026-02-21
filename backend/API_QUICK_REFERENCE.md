# PlanSight API - Quick Reference

**Base URL**: `http://localhost:8000` (dev) or your deployed URL

---

## Endpoints Overview

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|---------------|
| `/health` | GET | Health check | < 1ms |
| `/simulate` | POST | Full Monte Carlo simulation | 30-100ms |
| `/failure-forecast` | POST | AI failure narrative | 1-5s |
| `/executive-summary` | POST | Leadership summary | 1-5s |
| `/task-breakdown` | POST | AI task generation | 1-5s |

---

## 1. Health Check

```bash
curl http://localhost:8000/health
```

**Response**:
```json
{"status": "ok"}
```

---

## 2. Run Simulation

```bash
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "My Project",
    "description": "Project description",
    "scope_size": "medium",
    "complexity": 3,
    "stack": "React + Node",
    "deadline_weeks": 10,
    "team_junior": 1,
    "team_mid": 1,
    "team_senior": 1,
    "integrations": 2,
    "scope_volatility": 50,
    "num_simulations": 1000
  }'
```

**Key Response Fields**:
```json
{
  "on_time_probability": 0.45,      // 0-1 (45% chance)
  "p50_weeks": 16.8,                 // Median outcome
  "p90_weeks": 23.9,                 // Worst-case
  "histogram": [...],                // For charts
  "risk_scores": {
    "integration": 45,               // 0-100
    "team_imbalance": 50,
    "scope_creep": 60,
    "learning_curve": 40
  },
  "team_stress_index": 67,           // 0-100
  "p50_cost": 587500,
  "p90_cost": 892500,
  "currency": "USD",
  "role_allocation": {
    "fe": 0.40,
    "be": 0.45,
    "devops": 0.15
  }
}
```

---

## 3. Failure Forecast

```bash
curl -X POST http://localhost:8000/failure-forecast \
  -H "Content-Type: application/json" \
  -d '{
    # Same body as /simulate
  }'
```

**Response**:
```json
{
  "failure_story": [
    "Integration delays cascade...",
    "Team velocity drops...",
    "Scope creep adds 20-30%...",
    "Testing reveals issues..."
  ],
  "mitigations": [
    "Add 2 senior developers...",
    "Lock scope early...",
    "Build integration mocks..."
  ]
}
```

---

## 4. Executive Summary

```bash
curl -X POST http://localhost:8000/executive-summary \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "My Project",
    "description": "Project description",
    "stack": "React + Node",
    "p50_weeks": 16.8,
    "p90_weeks": 23.9,
    "on_time_probability": 0.45,
    "p50_cost": 587500,
    "p90_cost": 892500,
    "currency": "USD",
    "risk_scores": {
      "integration": 45,
      "team_imbalance": 50,
      "scope_creep": 60,
      "learning_curve": 40
    },
    "role_allocation": {
      "fe": 0.40,
      "be": 0.45,
      "devops": 0.15
    }
  }'
```

**Response**:
```json
{
  "summary_text": "Project has 45% on-time chance. Expected 16.8w (P50), worst 23.9w (P90). Key risks: scope volatility, team imbalance. Cost: $588K-$893K. Recommendation: Lock scope early, add senior dev."
}
```

---

## 5. Task Breakdown

```bash
curl -X POST http://localhost:8000/task-breakdown \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "My Project",
    "description": "Project description",
    "stack": "React + Node",
    "p50_weeks": 16.8,
    "p90_weeks": 23.9,
    "risk_scores": {
      "integration": 45,
      "team_imbalance": 50,
      "scope_creep": 60,
      "learning_curve": 40
    }
  }'
```

**Response**:
```json
{
  "tasks": [
    {
      "title": "Set up CI/CD pipeline",
      "role": "DevOps",
      "risk_flag": "Early Validation"
    },
    {
      "title": "Design core API endpoints",
      "role": "BE",
      "risk_flag": "High Risk"
    }
    // ... 8 more tasks (10 total)
  ]
}
```

---

## Request Body Field Reference

### SimulationRequest (for `/simulate` and `/failure-forecast`)

| Field | Type | Required | Values | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `project_name` | string | ✅ | any | - | Project name |
| `description` | string | ✅ | any | - | Brief description |
| `scope_size` | string | ✅ | "small", "medium", "large" | - | Project scope |
| `complexity` | integer | ✅ | 1-5 | - | Complexity rating |
| `stack` | string | ✅ | any | - | Tech stack |
| `deadline_weeks` | integer | ✅ | > 0 | - | Target deadline |
| `team_junior` | integer | ✅ | ≥ 0 | - | Junior devs |
| `team_mid` | integer | ✅ | ≥ 0 | - | Mid-level devs |
| `team_senior` | integer | ✅ | ≥ 0 | - | Senior devs |
| `integrations` | integer | ✅ | ≥ 0 | - | API integrations |
| `scope_volatility` | integer | ✅ | 0-100 | - | Scope stability |
| `num_simulations` | integer | ❌ | > 0 | 1000 | Monte Carlo runs |

---

## Response Field Reference

### Core Metrics

| Field | Type | Range | Description | Visualize As |
|-------|------|-------|-------------|--------------|
| `on_time_probability` | float | 0-1 | Chance of on-time finish | Gauge / % |
| `expected_overrun_days` | float | ≥ 0 | Avg delay when late | Number |
| `p50_weeks` | float | > 0 | Median completion | Timeline marker |
| `p90_weeks` | float | > 0 | Conservative estimate | Timeline marker |

### Histogram Data

| Field | Type | Description |
|-------|------|-------------|
| `bucket_center_weeks` | float | Week value |
| `count` | integer | # simulations |

**Usage**: Bar chart with buckets on X-axis, counts on Y-axis

### Risk Scores

| Field | Range | Risk Level |
|-------|-------|------------|
| `integration` | 0-100 | 0-33: Low, 34-66: Medium, 67+: High |
| `team_imbalance` | 0-100 | Same |
| `scope_creep` | 0-100 | Same |
| `learning_curve` | 0-100 | Same |

**Optional uplift text**: `{field}_uplift` (e.g., "+25% learning risk")

### Other Metrics

| Field | Type | Description |
|-------|------|-------------|
| `team_stress_index` | integer (0-100) | Burnout risk |
| `p50_cost` | float | Cost at P50 |
| `p90_cost` | float | Cost at P90 |
| `currency` | string | Currency code |
| `role_allocation.fe` | float (0-1) | Frontend % |
| `role_allocation.be` | float (0-1) | Backend % |
| `role_allocation.devops` | float (0-1) | DevOps % |

---

## Error Responses

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "complexity"],
      "msg": "ensure this value is less than or equal to 5",
      "type": "value_error.number.not_le"
    }
  ]
}
```

**Action**: Fix the invalid field(s)

### 500 Server Error

```json
{
  "detail": "Internal server error"
}
```

**Action**: Retry or check backend logs

---

## Environment Variables

Add to backend `.env` file:

```bash
# Required for AI features (optional - has fallbacks)
LLM_API_KEY=your_gemini_api_key

# Optional
ELEVENLABS_API_KEY=your_elevenlabs_key
LLM_MODEL=gemini-1.5-flash
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
COST_RATE_PER_DEV_DAY=500.0
CURRENCY=USD
```

---

## Quick Integration (JavaScript/React)

```javascript
const API_BASE = 'http://localhost:8000';

// 1. Run simulation
const runSimulation = async (projectData) => {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  return await response.json();
};

// 2. Get all insights
const getInsights = async (projectData, simulationResults) => {
  const [forecast, summary, tasks] = await Promise.all([
    fetch(`${API_BASE}/failure-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    }).then(r => r.json()),
    
    fetch(`${API_BASE}/executive-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_name: projectData.project_name,
        description: projectData.description,
        stack: projectData.stack,
        ...simulationResults // spread in p50, p90, costs, etc.
      })
    }).then(r => r.json()),
    
    fetch(`${API_BASE}/task-breakdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_name: projectData.project_name,
        description: projectData.description,
        stack: projectData.stack,
        p50_weeks: simulationResults.p50_weeks,
        p90_weeks: simulationResults.p90_weeks,
        risk_scores: simulationResults.risk_scores
      })
    }).then(r => r.json())
  ]);
  
  return { forecast, summary, tasks };
};

// Usage
const projectData = {
  project_name: "My App",
  description: "A cool app",
  scope_size: "medium",
  complexity: 3,
  stack: "React + Node",
  deadline_weeks: 10,
  team_junior: 1,
  team_mid: 1,
  team_senior: 1,
  integrations: 2,
  scope_volatility: 50,
  num_simulations: 1000
};

const results = await runSimulation(projectData);
const insights = await getInsights(projectData, results);

console.log('Timeline:', results.p50_weeks, 'to', results.p90_weeks, 'weeks');
console.log('On-time chance:', (results.on_time_probability * 100).toFixed(0) + '%');
console.log('Failure forecast:', insights.forecast.failure_story);
```

---

## Chart Data Mapping

### Timeline Chart (Bar/Line)
```javascript
// From histogram array
const chartData = {
  labels: results.histogram.map(b => `${b.bucket_center_weeks}w`),
  datasets: [{
    data: results.histogram.map(b => b.count)
  }]
};
```

### Risk Radar Chart
```javascript
const radarData = {
  labels: ['Integration', 'Team Balance', 'Scope', 'Learning'],
  datasets: [{
    data: [
      results.risk_scores.integration,
      results.risk_scores.team_imbalance,
      results.risk_scores.scope_creep,
      results.risk_scores.learning_curve
    ]
  }]
};
```

### Role Allocation Pie Chart
```javascript
const pieData = {
  labels: ['Frontend', 'Backend', 'DevOps'],
  datasets: [{
    data: [
      results.role_allocation.fe * 100,
      results.role_allocation.be * 100,
      results.role_allocation.devops * 100
    ]
  }]
};
```

---

## Performance Benchmarks

| Endpoint | Typical Response Time | Notes |
|----------|----------------------|-------|
| `/health` | < 1ms | Instant |
| `/simulate` (1000 runs) | 30-100ms | Very fast |
| `/failure-forecast` | 1-5s | LLM call |
| `/executive-summary` | 1-5s | LLM call |
| `/task-breakdown` | 1-5s | LLM call |

**Note**: LLM endpoints have fallbacks if API key not configured

---

## Interactive API Documentation

Visit `http://localhost:8000/docs` for:
- Try-it-out interface
- Full schema documentation
- Example requests/responses
- Error code reference

---

**See Also**:
- [Full Integration Guide](FRONTEND_INTEGRATION_GUIDE.md) - Detailed examples
- [Visualization Examples](VISUALIZATION_EXAMPLES.md) - UI mockups
- [Backend README](README.md) - Setup and deployment

---

**Last Updated**: February 21, 2026  
**API Version**: 1.0.0
