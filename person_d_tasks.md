## PlanSight – Person D Task Checklist

**Role**: Person D – AI & DevOps / Glue Engineer  
**Mode**: Single demo deployment only (no production infra)  
**Goal**: Keep the app runnable, fast enough, and demo-ready.

---

## Phase 1 (Hours 0–2): Alignment & Skeleton

- [ ] Set up backend and frontend repos (Git) and connect them to your preferred hosting (e.g., Render/Railway for FastAPI, Vercel/Netlify for React) for **demo use only**.
- [ ] Create `.env` templates for:
  - Backend: LLM API key, base URLs, any secrets needed.
  - Frontend: API base URL pointing to your demo backend.
- [ ] Configure an initial demo deployment:
  - [ ] Deploy a simple FastAPI “Hello World” or `/health` endpoint.
  - [ ] Deploy the React shell app that calls `/health` and logs the result.
- [ ] Use AI to generate deployment config files and minimal CI (only if quick and helpful).

---

## Phase 2 (Hours 2–6): Core Estimation + Monte Carlo + Basic UI

- [ ] Configure CORS and API base URLs for:
  - [ ] Local development.
  - [ ] The single demo backend (no separate prod envs).
- [ ] Help Person B validate `/simulate` performance:
  - [ ] Use a quick script (or AI-generated tool) to hit `/simulate` ~100–1000 times and check it stays under ~1s.
- [ ] Keep the demo backend and frontend deployments updated as core features land:
  - [ ] Verify the form → `/simulate` → results loop works on the **live demo URL**, not just locally.
- [ ] Use AI to write small load scripts and troubleshoot any infra/network issues quickly.

---

## Phase 3 (Hours 6–12): What‑If, Risk Profiler, Smart Allocation, Cost

- [ ] Support Person C by:
  - [ ] Reviewing labels and micro-copy for features like “Failure Forecast”, “Team Stress Index”, “Risk Profiler”.
  - [ ] Proposing short, sharp alternatives using AI (aim for clarity in 2–3 words).
- [ ] Ensure the single demo deployment feels fast from the expected demo network:
  - [ ] Test from the venue network (if possible) or simulate a slower connection.
  - [ ] Prioritize perceived speed (e.g., skeleton loaders, meaningful spinners) over heavy caching or real optimization.

---

## Phase 4 (Hours 12–18): Failure Forecast, AI Task Blueprint, Executive Summary

- [ ] Wire LLM configuration end‑to‑end for demo:
  - [ ] Add LLM API keys to backend `.env` used only for the hackathon demo.
  - [ ] Confirm `/failure-forecast`, `/task-breakdown`, and `/executive-summary` all succeed with real LLM calls.
- [ ] (Optional, if time) Add minimal logging:
  - [ ] Log only enough data (status, latency, generic error messages) to debug issues during testing.
  - [ ] Avoid storing any user content or secrets—this is just for debugging the demo.
- [ ] Work with Person B to add simple fallbacks:
  - [ ] If LLM call fails, show a friendly error in the UI and keep the rest of the dashboard usable.
- [ ] Use AI to draft or refine small observability/fallback snippets.

---

## Phase 5 (Hours 18–24): Polish, Demo Script, Backup Plan

- [ ] Lock in a reliable single demo deployment:
  - [ ] Decide: hosted demo URL (preferred) and/or local + tunnel (like ngrok).
  - [ ] Do a full end‑to‑end run on the exact setup you’ll use in the pitch.
- [ ] Create a **backup demo plan**:
  - [ ] Record a short screen capture of the golden demo path (inputs → simulate → what‑if → failure forecast → summary).
  - [ ] Ensure you can run the app locally without internet if the worst happens (e.g., mock LLM responses).
- [ ] Draft the hackathon submission text (with AI support):
  - [ ] Problem statement.
  - [ ] Solution overview.
  - [ ] Stack and architecture summary.
  - [ ] What makes PlanSight different / why it can be a real product.
- [ ] During pitch:
  - [ ] Be ready to answer questions about AI/LLM usage, architecture, and how this could scale beyond the demo.

---

## Daily Use: Quick One‑Glance Checklist

- [ ] Backend + frontend both reachable at demo URL.
- [ ] `/simulate` is fast enough and stable.
- [ ] LLM endpoints work (or have graceful fallbacks).
- [ ] One backup demo recording exists and is accessible.
- [ ] Submission text and architecture story are finalized.

