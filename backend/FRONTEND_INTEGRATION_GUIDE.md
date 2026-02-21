# Frontend Integration Guide - PlanSight API

Complete API documentation for frontend integration with visualization examples.

**Base URL**: `http://localhost:8000` (development) or your deployed backend URL

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Endpoint Reference](#endpoint-reference)
3. [Visualization Data Structures](#visualization-data-structures)
4. [Example Integration Flow](#example-integration-flow)
5. [Error Handling](#error-handling)
6. [Environment Setup](#environment-setup)

---

## Quick Start

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)

Add your production domain to `CORS_ORIGINS` environment variable if needed.

### Testing Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Interactive API docs
open http://localhost:8000/docs
```

---

## Endpoint Reference

### 1. Health Check

**Endpoint**: `GET /health`

**Purpose**: Check if backend is running

**Request**: None

**Response**:
```json
{
  "status": "ok"
}
```

**Frontend Usage**:
```javascript
const checkBackend = async () => {
  const response = await fetch('http://localhost:8000/health');
  const data = await response.json();
  return data.status === 'ok';
};
```

---

### 2. Project Simulation (Core Endpoint)

**Endpoint**: `POST /simulate`

**Purpose**: Run full Monte Carlo simulation with risk analysis, cost estimation, and timeline prediction

**Request Body**:
```json
{
  "project_name": "E-commerce Platform",
  "description": "Full-stack e-commerce with payment integration",
  "scope_size": "large",
  "complexity": 4,
  "stack": "React + Node",
  "deadline_weeks": 12,
  "team_junior": 2,
  "team_mid": 2,
  "team_senior": 1,
  "integrations": 3,
  "scope_volatility": 60,
  "num_simulations": 1000
}
```

**Field Descriptions**:

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `project_name` | string | any | Project name |
| `description` | string | any | Brief project description |
| `scope_size` | string | "small", "medium", "large" | Project scope |
| `complexity` | integer | 1-5 | Complexity rating (1=simple, 5=very complex) |
| `stack` | string | any | Tech stack (e.g., "React + Node", "Next.js", "Django") |
| `deadline_weeks` | integer | > 0 | Target deadline in weeks |
| `team_junior` | integer | ≥ 0 | Number of junior developers |
| `team_mid` | integer | ≥ 0 | Number of mid-level developers |
| `team_senior` | integer | ≥ 0 | Number of senior developers |
| `integrations` | integer | ≥ 0 | Number of external integrations/APIs |
| `scope_volatility` | integer | 0-100 | How likely scope is to change (0=stable, 100=very volatile) |
| `num_simulations` | integer | > 0 | Number of Monte Carlo runs (default: 1000) |

**Response**:
```json
{
  "on_time_probability": 0.045,
  "expected_overrun_days": 47.1,
  "p50_weeks": 16.8,
  "p90_weeks": 23.9,
  "histogram": [
    {"bucket_center_weeks": 14.5, "count": 15},
    {"bucket_center_weeks": 15.5, "count": 42},
    {"bucket_center_weeks": 16.5, "count": 87},
    // ... more buckets
  ],
  "risk_scores": {
    "integration": 45,
    "team_imbalance": 50,
    "scope_creep": 60,
    "learning_curve": 40,
    "integration_uplift": "+15% integration complexity",
    "scope_creep_uplift": "+25% scope growth risk"
  },
  "team_stress_index": 67,
  "p50_cost": 587500.0,
  "p90_cost": 892500.0,
  "currency": "USD",
  "role_allocation": {
    "fe": 0.40,
    "be": 0.45,
    "devops": 0.15
  },
  "baseline_metrics": {
    "base_effort_days": 84.6,
    "wsci": 1.2,
    "integration_multiplier": 1.16,
    "experience_factor": 1.27
  }
}
```

**Response Field Descriptions**:

| Field | Type | Range | Description | Visualization |
|-------|------|-------|-------------|---------------|
| `on_time_probability` | float | 0-1 | Probability of finishing on time | Percentage gauge |
| `expected_overrun_days` | float | ≥ 0 | Average delay in days when late | Number display |
| `p50_weeks` | float | > 0 | Median completion time (50th percentile) | Timeline marker |
| `p90_weeks` | float | > 0 | Worst-case completion time (90th percentile) | Timeline marker |
| `histogram` | array | - | Distribution of completion times | Bar chart / Line chart |
| `risk_scores` | object | 0-100 each | Four risk dimensions | Radar chart / Heat map |
| `team_stress_index` | integer | 0-100 | Burnout risk indicator | Gauge / Progress bar |
| `p50_cost` | float | ≥ 0 | Cost at P50 completion | Currency display |
| `p90_cost` | float | ≥ 0 | Cost at P90 completion | Currency display |
| `currency` | string | - | Currency code | - |
| `role_allocation` | object | 0-1 each (sum=1) | Recommended team split | Pie chart / Donut chart |

**Performance**: Completes in 30-100ms for 1000 simulations

---

### 3. Failure Forecast

**Endpoint**: `POST /failure-forecast`

**Purpose**: Generate AI-powered failure narrative and mitigation strategies

**Request Body**: Same as `/simulate` request

**Response**:
```json
{
  "failure_story": [
    "Integration delays cascade due to API instability and third-party dependencies",
    "Team velocity drops as junior members struggle with React + Node learning curve",
    "Scope creep adds unplanned features, expanding timeline by 20-30%",
    "Testing phase reveals architectural issues requiring significant refactor"
  ],
  "mitigations": [
    "Add 2 senior developer(s) or extend deadline by 4 weeks",
    "Lock scope early and defer non-critical features to post-MVP",
    "Build integration mocks and test harnesses upfront to derisk dependencies"
  ]
}
```

**Frontend Usage**:
```javascript
const getFailureForecast = async (projectData) => {
  const response = await fetch('http://localhost:8000/failure-forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  const { failure_story, mitigations } = await response.json();
  
  // Display in modal or collapsible section
  return { failureStory: failure_story, mitigations };
};
```

**Visualization**: 
- Display `failure_story` as numbered/bulleted list
- Show `mitigations` as actionable cards or checklist

**Note**: If `LLM_API_KEY` is not configured, returns intelligent fallback based on risk scores.

---

### 4. Executive Summary

**Endpoint**: `POST /executive-summary`

**Purpose**: Generate leadership-ready project summary

**Request Body**:
```json
{
  "project_name": "E-commerce Platform",
  "description": "Full-stack e-commerce platform",
  "stack": "React + Node",
  "p50_weeks": 15.5,
  "p90_weeks": 22.3,
  "on_time_probability": 0.35,
  "p50_cost": 155000,
  "p90_cost": 223000,
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
}
```

**Response**:
```json
{
  "summary_text": "E-commerce Platform has a 35% chance of meeting the 15-week deadline. Expected completion is 15.5 weeks (P50) with a worst-case of 22.3 weeks (P90). Key risks include scope volatility (60/100) and team imbalance (50/100), driven by junior team composition and high integration complexity. Estimated cost ranges from $155,000 to $223,000. Critical recommendation: Lock scope early to maintain schedule confidence and consider adding one senior developer to improve team velocity and reduce learning curve delays."
}
```

**Frontend Usage**:
```javascript
// After getting simulation results
const getSummary = async (simulationResponse) => {
  const summaryRequest = {
    project_name: originalRequest.project_name,
    description: originalRequest.description,
    stack: originalRequest.stack,
    p50_weeks: simulationResponse.p50_weeks,
    p90_weeks: simulationResponse.p90_weeks,
    on_time_probability: simulationResponse.on_time_probability,
    p50_cost: simulationResponse.p50_cost,
    p90_cost: simulationResponse.p90_cost,
    currency: simulationResponse.currency,
    risk_scores: simulationResponse.risk_scores,
    role_allocation: simulationResponse.role_allocation
  };
  
  const response = await fetch('http://localhost:8000/executive-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(summaryRequest)
  });
  
  const { summary_text } = await response.json();
  return summary_text;
};
```

**Visualization**: Display in a card with "Copy to Clipboard" button

---

### 5. Task Breakdown

**Endpoint**: `POST /task-breakdown`

**Purpose**: Generate AI-powered prioritized task list with role assignments

**Request Body**:
```json
{
  "project_name": "E-commerce Platform",
  "description": "Full-stack e-commerce platform",
  "stack": "React + Node",
  "p50_weeks": 15.5,
  "p90_weeks": 22.3,
  "risk_scores": {
    "integration": 45,
    "team_imbalance": 50,
    "scope_creep": 60,
    "learning_curve": 40
  }
}
```

**Response**:
```json
{
  "tasks": [
    {
      "title": "Set up CI/CD pipeline and deployment infrastructure",
      "role": "DevOps",
      "risk_flag": "Early Validation"
    },
    {
      "title": "Design and implement core API endpoints",
      "role": "BE",
      "risk_flag": "High Risk"
    },
    {
      "title": "Build authentication and authorization system",
      "role": "BE",
      "risk_flag": "Dependency Bottleneck"
    },
    {
      "title": "Create UI component library and design system",
      "role": "FE",
      "risk_flag": null
    },
    // ... 6 more tasks (10 total)
  ]
}
```

**Task Fields**:

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `title` | string | - | Task description |
| `role` | string | "FE", "BE", "DevOps" | Assigned role |
| `risk_flag` | string or null | "High Risk", "Dependency Bottleneck", "Early Validation", null | Risk indicator |

**Frontend Usage**:
```javascript
const getTaskBreakdown = async (projectData, riskScores) => {
  const response = await fetch('http://localhost:8000/task-breakdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_name: projectData.project_name,
      description: projectData.description,
      stack: projectData.stack,
      p50_weeks: simulationResponse.p50_weeks,
      p90_weeks: simulationResponse.p90_weeks,
      risk_scores: riskScores
    })
  });
  
  const { tasks } = await response.json();
  return tasks;
};
```

**Visualization**:
- Display as numbered list or Kanban-style cards
- Color-code by role (FE=blue, BE=green, DevOps=orange)
- Badge or icon for `risk_flag` when present

---

## Visualization Data Structures

### Timeline Distribution (Histogram)

The `histogram` field in `/simulate` response provides data for a timeline distribution chart.

**Example Data**:
```json
{
  "histogram": [
    {"bucket_center_weeks": 12.5, "count": 5},
    {"bucket_center_weeks": 13.5, "count": 18},
    {"bucket_center_weeks": 14.5, "count": 42},
    {"bucket_center_weeks": 15.5, "count": 87},
    {"bucket_center_weeks": 16.5, "count": 134},
    {"bucket_center_weeks": 17.5, "count": 156},
    {"bucket_center_weeks": 18.5, "count": 142},
    // ... continues
  ]
}
```

**Recommended Visualizations**:

1. **Bar Chart** (Recommended):
```javascript
// Using Chart.js example
const chartData = {
  labels: histogram.map(b => `${b.bucket_center_weeks}w`),
  datasets: [{
    label: 'Completion Probability',
    data: histogram.map(b => b.count),
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    borderColor: 'rgb(59, 130, 246)',
    borderWidth: 1
  }]
};

// Add vertical lines for P50, P90, and deadline
const p50Line = { x: p50_weeks, label: 'P50' };
const p90Line = { x: p90_weeks, label: 'P90' };
const deadlineLine = { x: deadline_weeks, label: 'Deadline' };
```

2. **Smooth Line Chart**:
```javascript
// For a probability distribution curve
const smoothData = {
  labels: histogram.map(b => b.bucket_center_weeks),
  datasets: [{
    label: 'Probability Density',
    data: histogram.map(b => b.count),
    fill: true,
    tension: 0.4, // Smooth curve
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  }]
};
```

### Risk Heatmap

The `risk_scores` object provides data for a 4-axis risk visualization.

**Example Data**:
```json
{
  "integration": 45,
  "team_imbalance": 50,
  "scope_creep": 60,
  "learning_curve": 40
}
```

**Recommended Visualizations**:

1. **Radar Chart**:
```javascript
const radarData = {
  labels: ['Integration', 'Team Balance', 'Scope Stability', 'Learning Curve'],
  datasets: [{
    label: 'Risk Levels',
    data: [
      risk_scores.integration,
      risk_scores.team_imbalance,
      risk_scores.scope_creep,
      risk_scores.learning_curve
    ],
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgb(239, 68, 68)',
    pointBackgroundColor: 'rgb(239, 68, 68)'
  }]
};
```

2. **Color-Coded Cards**:
```javascript
const riskCards = [
  {
    label: 'Integration Risk',
    value: risk_scores.integration,
    color: getRiskColor(risk_scores.integration), // 0-33: green, 34-66: yellow, 67+: red
    uplift: risk_scores.integration_uplift
  },
  // ... other risks
];

function getRiskColor(score) {
  if (score < 34) return 'green';
  if (score < 67) return 'yellow';
  return 'red';
}
```

### Team Stress Gauge

The `team_stress_index` (0-100) is perfect for a gauge/meter visualization.

**Recommended Visualization**:

```javascript
// Using a gauge library or custom SVG
const stressConfig = {
  value: team_stress_index,
  min: 0,
  max: 100,
  zones: [
    { from: 0, to: 33, color: '#10B981', label: 'OK' },
    { from: 34, to 66, color: '#F59E0B', label: 'Elevated' },
    { from: 67, to: 100, color: '#EF4444', label: 'Critical' }
  ]
};
```

### Role Allocation (Pie/Donut Chart)

The `role_allocation` object shows team composition.

**Example Data**:
```json
{
  "fe": 0.40,
  "be": 0.45,
  "devops": 0.15
}
```

**Recommended Visualization**:

```javascript
const pieData = {
  labels: ['Frontend', 'Backend', 'DevOps'],
  datasets: [{
    data: [
      role_allocation.fe * 100,
      role_allocation.be * 100,
      role_allocation.devops * 100
    ],
    backgroundColor: [
      'rgb(59, 130, 246)',   // Blue for FE
      'rgb(16, 185, 129)',   // Green for BE
      'rgb(251, 146, 60)'    // Orange for DevOps
    ]
  }]
};
```

### Cost Range Visualization

Display P50 and P90 costs as a range.

**Recommended Visualization**:

```javascript
// Range indicator
const costDisplay = {
  optimistic: p50_cost,
  pessimistic: p90_cost,
  difference: p90_cost - p50_cost,
  percentage: ((p90_cost - p50_cost) / p50_cost * 100).toFixed(0)
};

// HTML example
<div class="cost-range">
  <div class="cost-bar">
    <span class="p50">${p50_cost.toLocaleString()}</span>
    <div class="range-line"></div>
    <span class="p90">${p90_cost.toLocaleString()}</span>
  </div>
  <p class="variance">±{percentage}% variance</p>
</div>
```

---

## Example Integration Flow

### Complete Frontend Flow Example

```javascript
// 1. User submits project form
const projectData = {
  project_name: "E-commerce Platform",
  description: "Full-stack e-commerce",
  scope_size: "large",
  complexity: 4,
  stack: "React + Node",
  deadline_weeks: 12,
  team_junior: 2,
  team_mid: 2,
  team_senior: 1,
  integrations: 3,
  scope_volatility: 60,
  num_simulations: 1000
};

// 2. Run simulation
const runSimulation = async () => {
  try {
    const response = await fetch('http://localhost:8000/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) throw new Error('Simulation failed');
    
    const results = await response.json();
    
    // 3. Display main results
    displayTimeline(results.histogram, results.p50_weeks, results.p90_weeks);
    displayRiskHeatmap(results.risk_scores);
    displayStressGauge(results.team_stress_index);
    displayCostRange(results.p50_cost, results.p90_cost, results.currency);
    displayRoleAllocation(results.role_allocation);
    
    // 4. Load AI insights (parallel)
    const [failureForecast, execSummary, tasks] = await Promise.all([
      getFailureForecast(projectData),
      getExecutiveSummary(results),
      getTaskBreakdown(projectData, results.risk_scores)
    ]);
    
    // 5. Display AI insights
    displayFailureForecast(failureForecast);
    displayExecutiveSummary(execSummary);
    displayTaskList(tasks);
    
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage('Failed to run simulation');
  }
};

// Helper function for executive summary
const getExecutiveSummary = async (simulationResults) => {
  const summaryRequest = {
    project_name: projectData.project_name,
    description: projectData.description,
    stack: projectData.stack,
    p50_weeks: simulationResults.p50_weeks,
    p90_weeks: simulationResults.p90_weeks,
    on_time_probability: simulationResults.on_time_probability,
    p50_cost: simulationResults.p50_cost,
    p90_cost: simulationResults.p90_cost,
    currency: simulationResults.currency,
    risk_scores: simulationResults.risk_scores,
    role_allocation: simulationResults.role_allocation
  };
  
  const response = await fetch('http://localhost:8000/executive-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(summaryRequest)
  });
  
  const { summary_text } = await response.json();
  return summary_text;
};
```

### What-If Scenario Comparison

```javascript
// Compare baseline vs modified scenario
const runWhatIf = async (baselineData, modifications) => {
  const scenarioData = { ...baselineData, ...modifications };
  
  const [baseline, scenario] = await Promise.all([
    fetch('http://localhost:8000/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(baselineData)
    }).then(r => r.json()),
    
    fetch('http://localhost:8000/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioData)
    }).then(r => r.json())
  ]);
  
  // Show side-by-side comparison
  displayComparison({
    baseline: {
      onTime: baseline.on_time_probability,
      p50: baseline.p50_weeks,
      p90: baseline.p90_weeks,
      cost: baseline.p50_cost,
      stress: baseline.team_stress_index
    },
    scenario: {
      onTime: scenario.on_time_probability,
      p50: scenario.p50_weeks,
      p90: scenario.p90_weeks,
      cost: scenario.p50_cost,
      stress: scenario.team_stress_index
    }
  });
};

// Example: Add 1 senior developer
runWhatIf(projectData, { team_senior: projectData.team_senior + 1 });
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 422 | Validation Error | Check request fields against schema |
| 500 | Server Error | Retry or show error message |

### Validation Errors

If you send invalid data, you'll get a 422 response:

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

**Frontend Handling**:
```javascript
try {
  const response = await fetch('http://localhost:8000/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  
  if (response.status === 422) {
    const { detail } = await response.json();
    detail.forEach(error => {
      const field = error.loc[error.loc.length - 1];
      showFieldError(field, error.msg);
    });
    return;
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const results = await response.json();
  // ... handle results
  
} catch (error) {
  console.error('API Error:', error);
  showErrorToast('Failed to run simulation');
}
```

### LLM Fallback Behavior

When `LLM_API_KEY` is not configured or LLM calls fail:
- `/failure-forecast`: Returns intelligent risk-based fallback
- `/executive-summary`: Returns template-based summary with actual metrics
- `/task-breakdown`: Returns stack-aware default task list

The frontend will still get valid responses, just without AI-generated content.

---

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Required for LLM features (optional - has fallbacks)
LLM_API_KEY=your_gemini_api_key_here

# Optional - ElevenLabs for voice synthesis (if implementing)
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Optional overrides
LLM_MODEL=gemini-1.5-flash
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourapp.com
COST_RATE_PER_DEV_DAY=500.0
CURRENCY=USD
```

### Getting API Keys

**Gemini API Key**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Copy and add to `.env` as `LLM_API_KEY`

**ElevenLabs API Key** (if adding voice features):
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up and navigate to Profile → API Keys
3. Copy and add to `.env` as `ELEVENLABS_API_KEY`

### Starting the Backend

```bash
cd backend
./start.sh
# Server starts on http://localhost:8000
```

---

## Chart Library Recommendations

### Recommended Libraries

1. **Chart.js** - Simple, flexible charting
   - Good for: Histogram, line charts, pie charts
   - Install: `npm install chart.js react-chartjs-2`

2. **Recharts** - React-native charting
   - Good for: All chart types, very React-friendly
   - Install: `npm install recharts`

3. **D3.js** - Maximum customization
   - Good for: Custom visualizations, complex interactions
   - Install: `npm install d3`

4. **React-Gauge-Chart** - Gauge visualizations
   - Good for: Team stress index
   - Install: `npm install react-gauge-chart`

### Example Chart Component (React + Chart.js)

```javascript
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function TimelineChart({ histogram, p50, p90, deadline }) {
  const data = {
    labels: histogram.map(b => `${b.bucket_center_weeks}w`),
    datasets: [{
      label: 'Completion Probability',
      data: histogram.map(b => b.count),
      backgroundColor: histogram.map(b => {
        if (b.bucket_center_weeks <= deadline) return 'rgba(16, 185, 129, 0.5)';
        return 'rgba(239, 68, 68, 0.5)';
      })
    }]
  };
  
  const options = {
    plugins: {
      title: { display: true, text: 'Project Timeline Distribution' },
      annotation: {
        annotations: {
          p50Line: {
            type: 'line',
            xMin: p50,
            xMax: p50,
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            label: { content: 'P50', enabled: true }
          },
          p90Line: {
            type: 'line',
            xMin: p90,
            xMax: p90,
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 2,
            label: { content: 'P90', enabled: true }
          }
        }
      }
    }
  };
  
  return <Bar data={data} options={options} />;
}
```

---

## Testing Checklist

Before integrating, verify:

- [ ] Backend health check returns 200 OK
- [ ] `/simulate` completes in < 1 second
- [ ] Histogram data has multiple buckets (typically 20-100)
- [ ] Risk scores are in 0-100 range
- [ ] Role allocation sums to approximately 1.0
- [ ] Cost values are positive numbers
- [ ] LLM endpoints return valid arrays/strings (even without API key)
- [ ] CORS allows requests from your frontend origin

---

## Support & Resources

- **Interactive API Docs**: `http://localhost:8000/docs`
- **Backend README**: `backend/README.md`
- **Backend Source**: `backend/` directory
- **Test Suite**: Run `python backend/test_endpoints.py`

---

**Last Updated**: February 21, 2026  
**API Version**: 1.0.0  
**Backend Status**: ✅ Production Ready
