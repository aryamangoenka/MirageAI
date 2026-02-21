# PlanSight Backend API

FastAPI backend for PlanSight - AI-powered predictive project intelligence tool.

## Features

- **Monte Carlo Simulation**: 1000-run simulations completing in < 100ms
- **Risk Analysis**: Four-axis risk scoring (integration, team imbalance, scope creep, learning curve)
- **Cost Estimation**: P50/P90 cost projections with configurable rates
- **Team Stress Index**: Burnout risk assessment (0-100)
- **AI-Powered Insights**: LLM-generated failure forecasts, executive summaries, and task breakdowns

## Quick Start

### 1. Install Dependencies

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your LLM_API_KEY (optional - has fallbacks)
```

### 3. Run Server

```bash
# Development
python main.py

# Or with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Test API

```bash
# Run integration tests
python test_endpoints.py

# Or visit interactive docs
open http://localhost:8000/docs
```

## API Endpoints

### `GET /health`
Health check for deployment readiness.

**Response**: `{"status": "ok"}`

---

### `POST /simulate`
Run full project simulation with Monte Carlo, risk, cost, and allocation.

**Request**:
```json
{
  "project_name": "E-commerce Platform",
  "description": "Full-stack e-commerce with payments",
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

**Response**: Includes `p50_weeks`, `p90_weeks`, `on_time_probability`, `risk_scores`, `team_stress_index`, `p50_cost`, `p90_cost`, `role_allocation`, `histogram`.

---

### `POST /failure-forecast`
Generate narrative failure scenario and mitigations using LLM.

**Request**: Same as `/simulate`

**Response**:
```json
{
  "failure_story": ["...", "...", "..."],
  "mitigations": ["...", "...", "..."]
}
```

---

### `POST /executive-summary`
Generate leadership-ready executive summary using LLM.

**Request**:
```json
{
  "project_name": "...",
  "description": "...",
  "stack": "...",
  "p50_weeks": 15.5,
  "p90_weeks": 22.3,
  "on_time_probability": 0.35,
  "p50_cost": 155000,
  "p90_cost": 223000,
  "currency": "USD",
  "risk_scores": {...},
  "role_allocation": {...}
}
```

**Response**: `{"summary_text": "..."}`

---

### `POST /task-breakdown`
Generate 10 prioritized tasks with role and risk tags using LLM.

**Request**:
```json
{
  "project_name": "...",
  "description": "...",
  "stack": "...",
  "p50_weeks": 15.5,
  "p90_weeks": 22.3,
  "risk_scores": {...}
}
```

**Response**:
```json
{
  "tasks": [
    {"title": "...", "role": "BE", "risk_flag": "High Risk"},
    ...
  ]
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_API_KEY` | - | Gemini API key (optional, has fallbacks) |
| `LLM_MODEL` | `gemini-1.5-flash` | LLM model name |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed frontend origins |
| `COST_RATE_PER_DEV_DAY` | `500.0` | Cost per developer per day (USD) |
| `CURRENCY` | `USD` | Currency for cost estimates |

## Architecture

```
backend/
├── main.py                 # FastAPI app, routes, CORS
├── models/
│   └── schemas.py          # Pydantic request/response models
├── core/
│   ├── estimation.py       # Base effort, WSCI, multipliers
│   ├── monte_carlo.py      # N-run simulation, P50/P90
│   └── risk.py             # Risk scores, stress, allocation, cost
└── services/
    ├── llm_client.py       # Gemini wrapper with fallbacks
    └── calibration.py      # (Stretch) CSV calibration
```

## Performance

- `/simulate` with 1000 runs: **< 100ms**
- Full test suite: **< 3s**
- No database required (stateless)

## Deployment

### Railway / Render

```bash
# Set environment variables in dashboard
LLM_API_KEY=your_key_here
COST_RATE_PER_DEV_DAY=500.0

# Deploy command
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Docker (Optional)

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## License

MIT
