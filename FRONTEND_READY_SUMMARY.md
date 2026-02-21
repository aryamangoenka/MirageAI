# Frontend Integration - Ready for Development

**Status**: ✅ Backend Complete & Documented  
**Date**: February 21, 2026  
**Branch**: Backend

---

## What's Ready

The PlanSight backend is **fully implemented, tested, and documented** with comprehensive guides for frontend integration.

### ✅ Implementation Complete

- **5 REST API endpoints** - All functional and tested
- **Monte Carlo engine** - 1000 simulations in < 100ms
- **AI integration** - Gemini-powered insights with fallbacks
- **Complete schemas** - All request/response types defined
- **Error handling** - Validation and graceful failures
- **CORS configured** - Ready for React/Vue/Next.js

---

## Available Documentation

### 📖 For Frontend Developers

| Document | Purpose | What's Inside |
|----------|---------|---------------|
| **[API_QUICK_REFERENCE.md](backend/API_QUICK_REFERENCE.md)** | Fast lookup | All endpoints, curl examples, quick integration code |
| **[FRONTEND_INTEGRATION_GUIDE.md](backend/FRONTEND_INTEGRATION_GUIDE.md)** | Complete guide | Full request/response schemas, visualization data, example flows |
| **[VISUALIZATION_EXAMPLES.md](backend/VISUALIZATION_EXAMPLES.md)** | Visual design | ASCII mockups, color palettes, chart recommendations |

### 📚 For Backend Reference

| Document | Purpose |
|----------|---------|
| **[backend/README.md](backend/README.md)** | Setup, deployment, architecture |
| **[BACKEND_DEVELOPMENT_PLAN.md](BACKEND_DEVELOPMENT_PLAN.md)** | Original plan and phases |
| **[BACKEND_IMPLEMENTATION_SUMMARY.md](BACKEND_IMPLEMENTATION_SUMMARY.md)** | What was built |

---

## API Endpoints Summary

### Core Simulation
**`POST /simulate`** - Run Monte Carlo analysis  
⚡ Performance: 30-100ms for 1000 simulations  
📊 Returns: Timeline, risks, costs, stress, role allocation

### AI Insights (all with fallbacks if no API key)
**`POST /failure-forecast`** - Generate failure scenarios  
**`POST /executive-summary`** - Leadership summary  
**`POST /task-breakdown`** - 10 prioritized tasks

### Health
**`GET /health`** - Backend status check

---

## Quick Start for Frontend

### 1. Start the Backend

```bash
cd backend
./start.sh
# Server runs on http://localhost:8000
```

### 2. Example Integration (React)

```javascript
const API_BASE = 'http://localhost:8000';

// Run simulation
const runSimulation = async (projectData) => {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
    })
  });
  
  const results = await response.json();
  
  // Display results
  console.log('P50:', results.p50_weeks, 'weeks');
  console.log('P90:', results.p90_weeks, 'weeks');
  console.log('On-time probability:', results.on_time_probability);
  console.log('Team stress:', results.team_stress_index);
  
  return results;
};
```

### 3. Visualize the Data

All endpoints return visualization-ready data:

| Data | Visualization | Library Suggestion |
|------|---------------|-------------------|
| `histogram` array | Bar chart / Line chart | Chart.js, Recharts |
| `risk_scores` object | Radar chart / Grid | Chart.js, D3 |
| `team_stress_index` | Gauge / Progress bar | react-gauge-chart |
| `role_allocation` | Pie / Donut chart | Chart.js, Recharts |
| `p50_cost`, `p90_cost` | Range indicator | Custom CSS |

---

## What Data You Get

### Example Response from `/simulate`:

```json
{
  "on_time_probability": 0.045,
  "expected_overrun_days": 47.1,
  "p50_weeks": 16.8,
  "p90_weeks": 23.9,
  "histogram": [
    {"bucket_center_weeks": 14.5, "count": 15},
    {"bucket_center_weeks": 15.5, "count": 42},
    // ... more buckets for full distribution
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
  }
}
```

### All Fields Explained

See [FRONTEND_INTEGRATION_GUIDE.md](backend/FRONTEND_INTEGRATION_GUIDE.md) for complete field reference and visualization recommendations.

---

## Recommended Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Project Input Form - Left Sidebar]                │
│                                                     │
│  Project name: _________________________            │
│  Scope: [Small] [Medium] [Large]                    │
│  Complexity: ●●●○○                                  │
│  Stack: [React + Node ▼]                            │
│  Deadline: [12] weeks                               │
│  Team: J:[2] M:[2] S:[1]                           │
│  Integrations: [3]                                  │
│  Scope volatility: ────●──── 60%                    │
│                                                     │
│  [RUN SIMULATION]                                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Main Results Panel (Right)                         │
│                                                     │
│  ╔══════════════════════════════════════════╗       │
│  ║  Timeline Distribution (Histogram)       ║       │
│  ║  [Bar Chart showing completion times]    ║       │
│  ║   with P50, P90, Deadline markers        ║       │
│  ╚══════════════════════════════════════════╝       │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │On-Time % │ │P50 Weeks │ │P90 Weeks │            │
│  │  4.5%   │ │  16.8w   │ │  23.9w   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │ Risk Heatmap (4 Dimensions)             │       │
│  │  Integration: 45 | Team: 50             │       │
│  │  Scope: 60       | Learning: 40         │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  ┌──────────┐ ┌─────────────────────────┐          │
│  │  Stress  │ │  Role Allocation        │          │
│  │  67/100  │ │  FE:40% BE:45% DO:15%   │          │
│  │  [Gauge] │ │  [Donut Chart]          │          │
│  └──────────┘ └─────────────────────────┘          │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │ Cost Range                               │       │
│  │  $587K ────────────── $893K             │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  [Collapsible AI Insights Section]                 │
│  > Failure Forecast                                 │
│  > Executive Summary                                │
│  > Task Breakdown                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

See [VISUALIZATION_EXAMPLES.md](backend/VISUALIZATION_EXAMPLES.md) for detailed mockups.

---

## API Keys Setup

### Required for AI Features

Add to `backend/.env`:

```bash
# Gemini API (for AI insights)
LLM_API_KEY=your_gemini_api_key_here

# ElevenLabs (if adding voice features)
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### Getting Keys

**Gemini**: https://makersuite.google.com/app/apikey  
**ElevenLabs**: https://elevenlabs.io/ → Profile → API Keys

**Note**: AI endpoints work without keys (use intelligent fallbacks)

---

## Testing Your Integration

### 1. Health Check
```bash
curl http://localhost:8000/health
# Should return: {"status": "ok"}
```

### 2. Run Test Simulation
```bash
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test",
    "description": "Test project",
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

### 3. Interactive Docs
Visit: http://localhost:8000/docs

Try all endpoints with the built-in UI!

---

## Chart Library Recommendations

### Easy & Beautiful
- **Recharts** - React-native, composable charts
- **Chart.js** - Battle-tested, full-featured

### Maximum Control
- **D3.js** - Complete customization
- **Victory** - React components, animation support

### Specific Widgets
- **react-gauge-chart** - For team stress gauge
- **react-circular-progressbar** - Alternative gauges

### Example (Recharts)

```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function TimelineChart({ histogram }) {
  const data = histogram.map(b => ({
    week: b.bucket_center_weeks,
    count: b.count
  }));
  
  return (
    <BarChart width={600} height={300} data={data}>
      <XAxis dataKey="week" label={{ value: 'Weeks', position: 'bottom' }} />
      <YAxis label={{ value: 'Simulations', angle: -90 }} />
      <Tooltip />
      <Bar dataKey="count" fill="#3B82F6" />
    </BarChart>
  );
}
```

---

## What-If Scenarios

Compare baseline vs modified scenarios:

```javascript
// Baseline simulation
const baseline = await runSimulation(projectData);

// Scenario: Add 1 senior developer
const scenario = await runSimulation({
  ...projectData,
  team_senior: projectData.team_senior + 1
});

// Compare
const improvement = {
  onTimeChance: scenario.on_time_probability - baseline.on_time_probability,
  timelineDiff: scenario.p50_weeks - baseline.p50_weeks,
  costDiff: scenario.p50_cost - baseline.p50_cost,
  stressDiff: scenario.team_stress_index - baseline.team_stress_index
};

console.log('Impact:', {
  onTime: `+${(improvement.onTimeChance * 100).toFixed(0)}%`,
  faster: `${-improvement.timelineDiff.toFixed(1)} weeks`,
  moreExpensive: `+$${improvement.costDiff.toLocaleString()}`,
  lessStress: `${-improvement.stressDiff} points`
});
```

---

## Performance Notes

- **Fast**: Simulation completes in 30-100ms
- **No blocking**: All endpoints are async
- **Parallel**: AI endpoints can be called simultaneously
- **Scalable**: No database, stateless design

---

## Error Handling

### Validation Errors (422)
Frontend should catch and display field-specific errors:

```javascript
try {
  const response = await fetch(`${API_BASE}/simulate`, {...});
  
  if (response.status === 422) {
    const { detail } = await response.json();
    detail.forEach(error => {
      const field = error.loc[error.loc.length - 1];
      showFieldError(field, error.msg);
    });
    return;
  }
  
  const results = await response.json();
  // ... handle success
  
} catch (error) {
  showErrorToast('Failed to run simulation');
}
```

---

## Mobile Considerations

1. **Stack vertically** on mobile
2. **Make charts scrollable** horizontally if needed
3. **Collapse AI insights** into accordions
4. **Use compact gauges** for stress index
5. **Show key metrics first** (on-time %, P50, P90)

See [VISUALIZATION_EXAMPLES.md](backend/VISUALIZATION_EXAMPLES.md) section 10 for mobile layouts.

---

## Color Palette

Use consistent colors for better UX:

- **P50 / Info**: Blue (#3B82F6)
- **P90 / Warning**: Red (#EF4444)
- **Success / On-track**: Green (#10B981)
- **Medium Risk**: Yellow/Orange (#F59E0B)
- **Frontend**: Blue
- **Backend**: Green
- **DevOps**: Orange

See [VISUALIZATION_EXAMPLES.md](backend/VISUALIZATION_EXAMPLES.md) section 10 for full palette.

---

## Next Steps

### 1. Start Backend
```bash
cd backend
./start.sh
```

### 2. Test Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Try interactive docs
open http://localhost:8000/docs
```

### 3. Build Frontend
- Read [FRONTEND_INTEGRATION_GUIDE.md](backend/FRONTEND_INTEGRATION_GUIDE.md)
- Implement project input form
- Call `/simulate` and display results
- Add charts for histogram, risks, stress
- Optionally add AI insights tabs

### 4. Deploy
- Backend: Railway/Render (see [backend/README.md](backend/README.md))
- Frontend: Vercel/Netlify
- Update `CORS_ORIGINS` with production URL

---

## Support Resources

- **Interactive API**: http://localhost:8000/docs
- **Quick Reference**: [API_QUICK_REFERENCE.md](backend/API_QUICK_REFERENCE.md)
- **Full Integration Guide**: [FRONTEND_INTEGRATION_GUIDE.md](backend/FRONTEND_INTEGRATION_GUIDE.md)
- **Visual Examples**: [VISUALIZATION_EXAMPLES.md](backend/VISUALIZATION_EXAMPLES.md)
- **Backend Setup**: [backend/README.md](backend/README.md)

---

## Checklist for Frontend Team

- [ ] Backend running locally (`./backend/start.sh`)
- [ ] Health endpoint returns 200 OK
- [ ] Can call `/simulate` successfully
- [ ] Histogram data displays in chart
- [ ] Risk scores visualized (radar/grid)
- [ ] Team stress gauge working
- [ ] Cost range displayed
- [ ] Role allocation pie chart
- [ ] AI insights load (or show fallbacks)
- [ ] What-if scenarios work
- [ ] Mobile layout tested
- [ ] Error handling implemented

---

**Ready to build!** 🚀

All endpoints are documented, tested, and ready for frontend integration. The backend is production-ready with comprehensive visualization data.

---

**Last Updated**: February 21, 2026  
**Backend Version**: 1.0.0  
**Branch**: Backend  
**Status**: ✅ Ready for Frontend Development
