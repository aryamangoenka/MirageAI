# PlanSight - Localhost Deployment Guide
**Person D - AI & DevOps / Glue Engineer**
**Target**: Hackathon Demo (Localhost Only)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Python 3.10+** (check: `python --version`)
- **Node.js 18+** (check: `node --version`)
- **Git** (check: `git --version`)

---

## 📦 Backend Setup (FastAPI)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
```bash
# Copy template
cp .env.template .env

# Edit .env and add your Gemini API key
# Get key from: https://aistudio.google.com/app/apikey
```

**Minimum Required `.env` Settings:**
```bash
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-1.5-flash
HOST=127.0.0.1
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 5. Run Backend Server
```bash
# From backend/ directory
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
✓ CORS configured for origins: ['http://localhost:3000', 'http://localhost:5173']
INFO:     Application startup complete.
```

### 6. Test Backend
Open browser: http://127.0.0.1:8000/docs
- You should see FastAPI Swagger documentation
- Test `/health` endpoint - should return `{"status": "healthy"}`

---

## 🎨 Frontend Setup (React + Vite)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables
```bash
# Copy template
cp .env.template .env

# Edit .env (usually no changes needed for localhost)
```

**Minimum Required `.env` Settings:**
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run Frontend Dev Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**Expected Output:**
```
  VITE v5.0.11  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 5. Test Frontend
Open browser: http://localhost:5173
- You should see PlanSight UI
- Try submitting a test project

---

## 🧪 Testing the Full Stack

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### 2. Test /simulate Endpoint
```bash
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Project",
    "description": "Testing simulation",
    "scope_size": "medium",
    "complexity": 3,
    "stack": "React + FastAPI",
    "deadline_weeks": 12,
    "team_junior": 1,
    "team_mid": 2,
    "team_senior": 1,
    "integrations": 3,
    "scope_volatility": 30,
    "num_simulations": 100
  }'
```

### 3. Run Load Test (Optional)
```bash
# From project root
python testing/load_test.py --quick

# Full load test
python testing/load_test.py --requests 100

# Stress test
python testing/load_test.py --stress
```

**Target Performance:**
- P90 latency < 1000ms
- 100% success rate

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
**Solution**: Activate virtual environment and reinstall dependencies
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Problem**: `ValueError: Gemini API key not configured`
**Solution**: Add valid API key to `backend/.env`
- Get key from: https://aistudio.google.com/app/apikey
- Update `.env`: `GEMINI_API_KEY=your_actual_key_here`

**Problem**: Port 8000 already in use
**Solution**: Change port in `.env` and restart
```bash
PORT=8001
```

**Problem**: CORS errors in browser console
**Solution**: Check `ALLOWED_ORIGINS` in `backend/.env` matches frontend URL
```bash
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend Issues

**Problem**: `npm install` fails
**Solution**: Clear cache and retry
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem**: API calls failing (Network Error)
**Solution**:
1. Check backend is running: http://localhost:8000/health
2. Verify `VITE_API_BASE_URL` in `frontend/.env`
3. Check CORS configuration in backend

**Problem**: Frontend not updating after code changes
**Solution**: Vite should hot-reload automatically. If not:
```bash
# Stop dev server (Ctrl+C)
# Clear Vite cache
rm -rf .vite
# Restart
npm run dev
```

---

## 🎬 Demo Day Checklist

### Pre-Demo Setup (30 minutes before)

**Backend:**
- [ ] Pull latest code: `git pull origin person-d-devops`
- [ ] Activate venv: `source venv/bin/activate`
- [ ] Start server: `uvicorn main:app --reload --host 127.0.0.1 --port 8000`
- [ ] Test health endpoint: http://localhost:8000/health
- [ ] Test Swagger docs: http://localhost:8000/docs

**Frontend:**
- [ ] Pull latest code (if shared branch)
- [ ] Start dev server: `npm run dev`
- [ ] Open browser: http://localhost:5173
- [ ] Test form submission with demo data

**Network:**
- [ ] Ensure stable Wi-Fi connection
- [ ] Test API call latency (should be <100ms on localhost)
- [ ] Have backup: pre-recorded screen capture

### Golden Demo Data (Pre-fill for speed)

**Project:**
- Name: "E-commerce Platform Rebuild"
- Description: "Migrate legacy PHP monolith to React + FastAPI microservices"
- Scope: Large
- Complexity: 4
- Stack: "React + FastAPI + PostgreSQL"
- Team: 1 Junior, 2 Mid, 1 Senior
- Integrations: 5 (Stripe, Auth0, SendGrid, S3, Algolia)
- Deadline: 12 weeks
- Scope Volatility: 40

**Expected Results:**
- On-time probability: ~35%
- P50: ~15 weeks
- P90: ~19 weeks
- High integration risk, medium learning curve risk

---

## 🚨 Backup Plan (If Demo Fails)

### Option 1: Pre-Recorded Screen Capture
- Record full demo flow (baseline → what-if → failure forecast → summary)
- Save to `demo/backup_recording.mp4`
- Play video if live demo breaks

### Option 2: Localhost Fallback
- Run backend + frontend on local machine (no network dependency)
- Use mock LLM client if Gemini API fails
  - In `backend/services/llm_client.py`, use `MockGeminiClient` instead

### Option 3: Static Screenshots
- Capture screenshots of each major screen
- Save to `demo/screenshots/`
- Walk through screenshots if servers crash

---

## 📊 Performance Benchmarks (Target)

| Metric | Target | Actual |
|--------|--------|--------|
| `/simulate` P90 latency | <1000ms | _TBD_ |
| `/simulate` success rate | 100% | _TBD_ |
| Frontend load time | <2s | _TBD_ |
| Time to first render | <500ms | _TBD_ |

Run benchmarks before demo:
```bash
python testing/load_test.py --requests 100
```

---

## 🔐 Security Notes

**For Hackathon Demo Only:**
- `.env` files are git-ignored (API keys safe)
- CORS restricted to localhost origins
- No authentication required (demo mode)
- No production deployment (local only)

**DO NOT:**
- Commit `.env` files with real API keys
- Expose backend to public internet
- Use production database credentials

---

## 📚 Additional Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Gemini API Docs**: https://ai.google.dev/docs
- **React + Vite Docs**: https://vitejs.dev/guide/
- **Load Testing Guide**: See `testing/load_test.py` docstring

---

## 🆘 Emergency Contacts (Team)

- **Person A (Product)**: [Contact info]
- **Person B (Backend)**: [Contact info]
- **Person C (Frontend)**: [Contact info]
- **Person D (DevOps)**: You!

---

**Last Updated**: Phase 1 (Hours 0-2)
**Next Update**: After backend `/simulate` endpoint is live (Phase 2)
