# PlanSight - Hackathon Submission
**Person D - AI & DevOps / Glue Engineer**
**Draft for final submission text**

---

## 🎯 Challenge Track
**Primary**: Predictive Project Blueprinting System
**Secondary**: Best Use of Gemini API, Best AI/ML Hack

---

## 🚀 Project Name
**PlanSight - Predictive Project Intelligence**

---

## 📋 Tagline
*"Simulate your project's future before it fails."*

---

## 🎬 Problem Statement

**70% of software projects miss their deadlines.**

Why? Because estimation is broken:
- Teams rely on gut-feeling guesses
- Spreadsheets can't model risk or team dynamics
- Nobody accounts for integration complexity, junior dev learning curves, or scope creep
- By the time you realize you're late, it's too late to course-correct

**The cost?** Burnt-out engineers, blown budgets, and broken stakeholder trust.

---

## 💡 Solution Overview

**PlanSight** is an AI-powered predictive project intelligence tool that transforms rough project requirements into a data-driven execution plan with **probabilistic timelines, risk heatmaps, and failure forecasts**.

Unlike traditional estimation tools (static spreadsheets, gut-feel planning), PlanSight uses:
1. **Monte Carlo Simulation** to model 1000+ possible futures and give you a probability distribution (not a single number)
2. **Risk Profiling** that quantifies integration complexity, team imbalance, scope volatility, and learning curve penalties
3. **AI-Powered Failure Forecasting** (via Google Gemini) that generates realistic failure narratives and actionable mitigations
4. **What-If Scenarios** that let you test changes (add 1 senior dev, extend deadline by 2 weeks) and see the impact live

**For hackathon judges**: This isn't a chatbot or task manager. It's a **predictive execution intelligence layer** that gives you the data to make smarter resourcing and timeline decisions **before** you start coding.

---

## 🏆 How We Address the Challenge Requirements

### Core Requirements (MVP)
✅ **Intelligent Intake**: Dynamic form capturing Project DNA (Scope, Stack, Complexity, Team Seniority, Integrations, Deadline, Scope Volatility)
✅ **The "Brain" (Estimation Logic)**: Rule-based engine using formula:
   `Total Effort = (Base Complexity × Stack Multiplier × Integration Factor) ÷ Team Seniority × Scope Volatility`
✅ **Risk Profiler**: Flags "red zones" with explicit uplifts (e.g., "New stack increases risk by 25% → +1.5 weeks at P90")
✅ **Smart Allocation**: Automated role suggestion (FE/BE/DevOps) based on stack and integration profile
✅ **Executive Dashboard**: Visual summary with timeline (P50/P90, on-time probability), cost projections, and resource distribution

### Bonus Features ("Wow" Factor)
✅ **What-If Simulator**: Adjust senior dev count, deadline, or integrations and watch the timeline curve morph in real-time
✅ **AI-Generated Task Breakdown**: Google Gemini API generates the first 10 execution tasks, tagged by role (FE/BE/DevOps) and risk flags
✅ **Failure Forecast Mode**: AI analyzes worst-case Monte Carlo runs and generates a 3-5 bullet failure story + top 3 mitigations
✅ **Team Stress Index**: Quantifies burnout risk (0-100) based on timeline compression and workload per dev
✅ **Executive Summary**: One-click AI-generated leadership brief ready to copy/paste

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python) - High-performance API server
- **Pydantic** - Type-safe request/response models
- **NumPy** - Monte Carlo simulation engine
- **Google Gemini API** - AI narrative generation (failure forecasts, task breakdowns, summaries)
- **Python dotenv** - Environment configuration

### Frontend
- **React** (Vite + TypeScript) - Fast, modern UI
- **Chart.js / Recharts** - Probability distribution visualization
- **TailwindCSS** - Clean, responsive design system

### DevOps & Infrastructure
- **Localhost Demo** - Running on local backend (FastAPI) + local frontend (Vite dev server)
- **CORS Configuration** - Secure cross-origin requests
- **Load Testing** - Async Python script validating <1s P90 latency for `/simulate`
- **Environment Templates** - `.env.template` for easy setup

### AI Integration
- **Google Gemini 1.5 Flash** - Fast, cost-effective model for structured outputs
- **Structured Prompting** - JSON output format for failure forecasts and task breakdowns
- **Fallback Mode** - Mock client for testing without API key

---

## 🎨 Differentiation (Why PlanSight Wins)

### 1. **Innovation**
- **First** hackathon project to combine Monte Carlo simulation + AI failure forecasting + team stress modeling in a single tool
- Not just "AI slapped on top" - AI is used strategically for narrative generation where it adds unique value

### 2. **Technical Execution**
- Real Monte Carlo engine (1000 runs, <1s latency)
- Risk scores are **tied to actual formula inputs** (not fake numbers)
- Gemini API integration for structured JSON outputs (failure stories, task lists, summaries)
- Clean separation of concerns: estimation engine, Monte Carlo module, risk calculator, LLM client

### 3. **Usefulness & Impact**
- Solves a **real pain point** judges understand (we've all been on late projects)
- Executive dashboard gives leadership the data they need to make resourcing decisions
- What-If simulator lets you test mitigation strategies before committing

### 4. **UX & Polish**
- Single-page app with cinematic what-if animation (baseline → scenario curve morph)
- Sharp, technical micro-copy (no fluff)
- Color-coded risk bands (green/yellow/red) for instant clarity
- Clean, responsive layout optimized for demo flow

### 5. **Scalability & Real-World Potential**
- Architecture supports historical calibration (upload past projects to tune coefficients)
- Designed to integrate with Jira/Linear for continuous re-simulation as tasks complete
- MongoDB integration ready for storing calibration data and project history

---

## 🎯 Target Prize Categories

1. **Predictive Project Blueprinting System** ← Exact match for challenge requirements
2. **Best Use of Gemini API** ← Structured prompts for failure forecasts, task breakdowns, executive summaries
3. **Best AI/ML Hack** ← Monte Carlo simulation + AI narrative generation
4. **Best Software Hack** ← Strong technical execution, clean architecture
5. **Best UI/UX Hack** ← Polished dashboard with animated what-if scenarios
6. **Best Use of MongoDB Atlas** ← (If implemented) Storing calibration data and project history

---

## 📊 Demo Flow (90 Seconds)

**[0:00-0:15] Problem Setup**
> "70% of software projects miss their deadlines because estimation is broken. PlanSight simulates your project's future before it fails."

**[0:15-0:30] Live Demo - Baseline Simulation**
> [Person C enters project: React + FastAPI, 4 devs, 12-week deadline, 3 integrations]
> "Run Simulation → 42% on-time probability, P90 = 18.7 weeks. We're likely to be 6.7 weeks late."

**[0:30-0:45] What-If Scenario**
> [Adjust: Remove 1 senior dev]
> "Watch what happens when we lose our senior engineer. On-time probability drops to 31%, P90 jumps to 21.3 weeks."

**[0:45-1:00] Failure Forecast**
> "Show Me How This Fails → AI analyzes the worst Monte Carlo runs and generates a realistic failure sequence:
> - Integration delays compound with learning curve
> - Junior devs blocked on complex APIs
> - Deadline pressure leads to technical debt"

**[1:00-1:15] AI Task Breakdown**
> "Generate Task Breakdown → Gemini API suggests the first 10 critical tasks, prioritized by risk and tagged by role (FE/BE/DevOps)."

**[1:15-1:30] Executive Summary**
> "Export Executive Summary → One click generates a leadership-ready brief with timeline, costs, risks, and mitigations."

**[1:30 - End] Wrap-Up**
> "PlanSight gives you the data to make smarter resourcing decisions before you start coding. Built with FastAPI, React, and Google Gemini API."

---

## ❓ Judge Q&A Defense Points

**Q: "How accurate is this?"**
A: It uses structured risk factors and Monte Carlo sampling. With time, teams can upload historical projects to calibrate it (architecture already supports this). Even without calibration, it's more accurate than gut-feel guesses because it models variance and risk systematically.

**Q: "Why AI? Couldn't you just use formulas?"**
A: Formulas drive the numbers (Monte Carlo, risk scores). AI is used only where it adds unique value: producing nuanced task breakdowns, failure narratives, and executive summaries that would be hard to template. It's strategic AI use, not "AI for AI's sake."

**Q: "Could this be a real product?"**
A: Absolutely. Next steps:
- Deeper calibration with historical project data (CSV upload already architected)
- Integrate with Jira/Linear to track actual progress vs predictions
- Continuous re-simulation as tasks complete (adaptive forecasting)
- Team analytics dashboard (burnout prediction, velocity trends)

**Q: "What about MongoDB Atlas prize?"**
A: We designed the architecture to support MongoDB for storing calibration data and project history. If we have time, we'll implement the `/calibrate` endpoint with CSV upload and coefficient tuning via scikit-learn regression.

---

## 🔗 Links

- **GitHub Repository**: https://github.com/aryamangoenka/MirageAI
- **Live Demo**: Localhost (available during judging)
- **Documentation**: `/docs` folder in repo
- **Submission Video**: [TBD - record screen capture of golden demo path]

---

## 👥 Team & Roles

- **Person A** - Product & Simulation Lead (PM + formulas)
- **Person B** - Backend Engineer (FastAPI, Monte Carlo, risk engine)
- **Person C** - Frontend Engineer (React, UI/UX, animations)
- **Person D** - AI & DevOps / Glue Engineer (Gemini integration, CORS, load testing, deployment, submission text)

**AI Usage**: All team members used AI heavily for code generation, refactoring, prompt design, and testing.

---

## 🏅 Why We Should Win

1. **Perfect alignment** with "Predictive Project Blueprinting System" challenge requirements (all core + all bonus features)
2. **Strategic AI use** via Google Gemini API (structured JSON outputs, not generic chat)
3. **Real technical depth** - Monte Carlo simulation, risk modeling, team stress index
4. **Judges can relate** - we've all been on late projects; this solves a real pain point
5. **Polished UX** - cinematic what-if animation, clean dashboard, sharp micro-copy
6. **Real-world potential** - clear roadmap to production (calibration, Jira integration, continuous forecasting)

---

**Built for [Hackathon Name]**
**Powered by Google Gemini API**
**GitHub**: https://github.com/aryamangoenka/MirageAI
