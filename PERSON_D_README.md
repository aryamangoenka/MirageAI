# Person D Deliverables - PlanSight Hackathon
**Role**: AI & DevOps / Glue Engineer
**Branch**: `person-d-devops`

---

## ✅ Phase 1 Deliverables (Hours 0-2) - COMPLETED

### 1. Infrastructure Setup
- [x] Created `person-d-devops` branch
- [x] Set up `.gitignore` for sensitive files
- [x] Created environment templates for backend and frontend

### 2. Environment Configuration
**Files Created:**
- `backend/.env.template` - Backend environment variables (Gemini API, CORS, server config)
- `frontend/.env.template` - Frontend environment variables (API base URL, feature flags)

**Key Configurations:**
- Gemini API integration setup (gemini-1.5-flash for speed)
- CORS configuration for localhost (ports 3000, 5173)
- Monte Carlo simulation defaults (1000 runs)
- Cost calculation defaults ($800/dev-day)

### 3. LLM Integration (Gemini API)
**File**: `backend/services/llm_client.py` (418 lines)

**Features:**
- ✅ Full Gemini API wrapper with error handling
- ✅ `generate_failure_forecast()` - Structured JSON failure stories + mitigations
- ✅ `generate_task_breakdown()` - First 10 tasks with role tags and risk flags
- ✅ `generate_executive_summary()` - Leadership-ready narrative
- ✅ `MockGeminiClient` - Fallback for testing without API key
- ✅ Factory function `get_llm_client()` with auto-fallback

**Optimizations:**
- Structured prompts for JSON outputs
- Temperature tuning (0.5-0.7) for consistency
- Graceful error handling and fallbacks
- Markdown-wrapped JSON parsing

### 4. CORS Configuration
**File**: `backend/utils/cors_config.py`

**Features:**
- ✅ FastAPI CORS middleware setup
- ✅ Environment-based origin configuration
- ✅ Secure defaults (specific origins, no wildcards)
- ✅ Helper function for documentation

**Usage:**
```python
from utils.cors_config import configure_cors
app = FastAPI()
configure_cors(app)
```

### 5. Load Testing Infrastructure
**File**: `testing/load_test.py` (251 lines)

**Features:**
- ✅ Async load testing with configurable concurrency
- ✅ Latency measurement (min, mean, median, P90, P95, P99)
- ✅ Success rate tracking
- ✅ Performance assessment (target: P90 < 1s)
- ✅ JSON export for CI/CD integration

**Usage:**
```bash
python testing/load_test.py --quick      # 50 requests
python testing/load_test.py --requests 100  # Custom count
python testing/load_test.py --stress     # 1000 requests
```

### 6. LLM Client Testing
**File**: `testing/test_llm_client.py`

**Features:**
- ✅ Mock client tests (no API key required)
- ✅ Real API client tests (with Gemini API)
- ✅ Validates all three LLM endpoints (failure forecast, task breakdown, summary)

**Usage:**
```bash
python testing/test_llm_client.py --mock  # Test without API key
python testing/test_llm_client.py         # Test with real API
```

### 7. Documentation

#### Micro-Copy Guide
**File**: `docs/MICROCOPY.md` (321 lines)

**Contents:**
- Sharp, technical UI labels (optimized for engineering judges)
- Input field labels and helper text
- Dashboard section titles
- Risk profiler terminology
- Loading/error state messages
- Accessibility (ARIA) labels
- Color scheme (green/yellow/red risk bands)

**Style**: Sharp & Technical
- "Failure Forecast" not "How This Could Fail"
- "Team Stress Index" not "Team Burnout Risk"
- "P90" not "90th Percentile"

#### Submission Text
**File**: `docs/SUBMISSION.md` (387 lines)

**Contents:**
- Problem statement (70% of projects miss deadlines)
- Solution overview (predictive intelligence, not chatbot)
- Challenge requirements mapping (all core + all bonus features)
- Tech stack breakdown
- Differentiation (5 key points)
- Demo script (90-second flow)
- Judge Q&A defense points
- Prize category targeting

**Target Prizes:**
1. Predictive Project Blueprinting System (main)
2. Best Use of Gemini API
3. Best AI/ML Hack
4. Best Software Hack
5. Best UI/UX Hack
6. Best Use of MongoDB Atlas (if implemented)

#### Deployment Guide
**File**: `docs/DEPLOYMENT_LOCALHOST.md` (360 lines)

**Contents:**
- Backend setup (Python venv, FastAPI, uvicorn)
- Frontend setup (Node.js, React, Vite)
- Environment configuration steps
- Testing procedures
- Troubleshooting guide
- Demo day checklist
- Backup plan (pre-recorded video, mock LLM client)
- Performance benchmarks

### 8. Dependencies
**File**: `backend/requirements.txt`

**Core Dependencies:**
- FastAPI 0.109.0
- Uvicorn 0.27.0 (ASGI server)
- Pydantic 2.5.3 (validation)
- google-generativeai 0.3.2 (Gemini API)
- NumPy 1.26.3 (Monte Carlo)
- python-dotenv 1.0.0 (environment)
- aiohttp 3.9.1 (load testing)

**Optional (commented):**
- scikit-learn (for /calibrate endpoint)
- pandas (for CSV upload)
- pymongo/motor (for MongoDB Atlas integration)

### 9. Python Package Structure
**Files Created:**
- `backend/__init__.py`
- `backend/services/__init__.py`
- `backend/utils/__init__.py`

Makes directories proper Python packages for clean imports.

---

## 📊 Summary of Deliverables

| Category | Files | Lines of Code | Status |
|----------|-------|---------------|--------|
| Configuration | 3 | ~100 | ✅ Done |
| LLM Integration | 1 | 418 | ✅ Done |
| Infrastructure | 2 | ~300 | ✅ Done |
| Testing | 2 | ~350 | ✅ Done |
| Documentation | 3 | ~1,068 | ✅ Done |
| Dependencies | 1 | 38 | ✅ Done |
| Package Setup | 3 | 3 | ✅ Done |
| **Total** | **15** | **~2,277** | **✅ Done** |

---

## 🎯 What's Ready for Integration

### For Person B (Backend Engineer)
✅ **Ready to use immediately:**
- `backend/.env.template` - Copy to `.env` and add Gemini API key
- `backend/requirements.txt` - Install dependencies
- `backend/services/llm_client.py` - Import and use in endpoints
- `backend/utils/cors_config.py` - Add to `main.py` for CORS

**Example integration:**
```python
# In backend/main.py
from utils.cors_config import configure_cors
from services.llm_client import get_llm_client

app = FastAPI()
configure_cors(app)

llm_client = get_llm_client(use_mock=False)

@app.post("/failure-forecast")
async def failure_forecast(request: SimulationRequest):
    # ... run Monte Carlo simulation ...
    forecast = llm_client.generate_failure_forecast(
        project_data=request.dict(),
        risk_scores=risk_scores,
        worst_case_weeks=p90_weeks
    )
    return forecast
```

### For Person C (Frontend Engineer)
✅ **Ready to use immediately:**
- `frontend/.env.template` - Copy to `.env` (usually no changes needed)
- `docs/MICROCOPY.md` - Use exact labels for consistency

**Key labels to use:**
- Section title: "Intelligent Intake – Project DNA"
- Primary button: "Run Simulation"
- Risk section: "Risk Profiler & Heatmap Dashboard"
- Stress metric: "Team Stress Index"

### For Person A (Product Lead)
✅ **Ready to review:**
- `docs/SUBMISSION.md` - Draft hackathon submission text
- `docs/MICROCOPY.md` - UI terminology aligned with challenge brief
- `docs/DEPLOYMENT_LOCALHOST.md` - Demo day deployment guide

---

## 🔄 Next Phase Tasks (Hours 2-6)

### Phase 2: Integration & Testing
- [ ] Wait for Person B to implement `/simulate` endpoint
- [ ] Run load tests: `python testing/load_test.py --requests 100`
- [ ] Validate P90 latency < 1s
- [ ] Test CORS with frontend (once Person C has UI ready)
- [ ] Update deployment guide with actual setup steps

### Phase 3-4: LLM Endpoint Integration
- [ ] Wait for Person B to create `/failure-forecast`, `/task-breakdown`, `/executive-summary` endpoints
- [ ] Test LLM integration end-to-end
- [ ] Add fallback error handling for LLM failures
- [ ] (Optional) Add minimal logging for debugging

### Phase 5: Demo Preparation
- [ ] Lock deployment setup (backend + frontend running locally)
- [ ] Create backup demo video (pre-record golden path)
- [ ] Finalize submission text with team
- [ ] Test full demo flow 3+ times

---

## 🧪 Testing Checklist

### LLM Client
```bash
cd /Users/aryamangoenka/Desktop/MirageAI
python testing/test_llm_client.py --mock  # Should pass without API key
```

### Load Testing (Once /simulate exists)
```bash
python testing/load_test.py --quick
# Target: P90 < 1000ms, 100% success rate
```

### End-to-End (Once frontend + backend ready)
1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Submit test project, verify results

---

## 📦 How to Use These Deliverables

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.template .env
# Edit .env and add Gemini API key
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.template .env
npm run dev
```

### Run Tests
```bash
# Mock LLM client (no API key)
python testing/test_llm_client.py --mock

# Load test (once backend is live)
python testing/load_test.py --quick
```

---

## 🎯 Prize Strategy Alignment

**Target Prizes (in priority order):**
1. **Predictive Project Blueprinting System** ← Main target, perfect alignment
2. **Best Use of Gemini API** ← Structured prompts for failure forecasts, task breakdowns, summaries
3. **Best AI/ML Hack** ← Monte Carlo + AI integration
4. **Best Software Hack** ← Strong technical execution
5. **Best UI/UX Hack** ← (Person C's work + our micro-copy guide)

**Gemini API Usage:**
- Failure Forecast: AI analyzes worst Monte Carlo runs → narrative + mitigations
- Task Breakdown: AI generates first 10 tasks with role tags and risk flags
- Executive Summary: AI produces leadership-ready brief with timeline, risks, costs

---

## 🔗 Quick Links

- **Branch**: `person-d-devops`
- **Main Repo**: https://github.com/aryamangoenka/MirageAI
- **Gemini API Key**: https://aistudio.google.com/app/apikey
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Vite Docs**: https://vitejs.dev/

---

## 🆘 Troubleshooting

**Problem**: LLM client fails with API key error
**Solution**:
1. Get API key from https://aistudio.google.com/app/apikey
2. Add to `backend/.env`: `GEMINI_API_KEY=your_key_here`
3. Test with: `python testing/test_llm_client.py`

**Problem**: CORS errors in browser console
**Solution**:
1. Check `ALLOWED_ORIGINS` in `backend/.env`
2. Should include frontend URL: `http://localhost:5173`
3. Restart backend after changing `.env`

**Problem**: Load test shows slow latency (P90 > 1s)
**Solution**:
1. Check `num_simulations` in request (default 1000)
2. Try reducing to 500 for demo
3. Profile Monte Carlo loop (Person B's optimization)

---

**Status**: Phase 1 Complete ✅
**Next**: Wait for Person B's `/simulate` endpoint, then run load tests
**Last Updated**: Phase 1 (Hours 0-2)
