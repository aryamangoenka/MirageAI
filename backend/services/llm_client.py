"""
LLM client wrapper for Gemini API — task breakdown, failure forecast, executive summary.
"""

import os
import json
import time
from typing import Optional


class LLMClient:
    """Wrapper for Gemini API calls with retries and graceful fallback."""

    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")
        # gemini-1.5-flash is fast, cheap, and reliable for structured JSON output
        self.model_name = os.getenv("LLM_MODEL", "gemini-2.0-flash")
        self.client = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model_name)
                print(f"[LLM] Initialized: {self.model_name}")
            except Exception as e:
                print(f"[LLM] Warning: Could not initialize Gemini client: {e}")

    def _call_llm(self, prompt: str, retries: int = 2) -> Optional[str]:
        """Call Gemini with retries. Returns None if unavailable."""
        if not self.client:
            print("[LLM] No client — falling back to static data")
            return None

        for attempt in range(retries):
            try:
                response = self.client.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"[LLM] Attempt {attempt + 1} failed: {e}")
                if attempt < retries - 1:
                    time.sleep(1.0)

        print("[LLM] All retries failed — using fallback")
        return None

    @staticmethod
    def _strip_json_fences(text: str) -> str:
        """Remove markdown code fences from LLM response."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    # ── Task Breakdown ────────────────────────────────────────────────────────

    def generate_task_breakdown(self, project_context: dict, risks: dict) -> list[dict]:
        """
        Generate 10 ordered implementation tasks specific to this project,
        with role tags (FE/BE/DevOps) and risk flags.
        """
        top_risk = max(risks, key=risks.get) if risks else "integration"

        prompt = f"""Senior tech lead. Generate 10 ordered implementation tasks for:
Project: {project_context['project_name']}
Description: {project_context['description']}
Stack: {project_context['stack']}
Timeline: {project_context['p50_weeks']:.0f}w P50 / {project_context['p90_weeks']:.0f}w P90
Top risk: {top_risk} ({risks.get(top_risk, 0)}/100)

Rules: tasks must be SPECIFIC to this project and stack (not generic). Start with infra/BE foundations. Mix FE/BE/DevOps roles realistically.

Return ONLY a JSON array (no markdown):
[{{"title":"<12 words max>","role":"FE|BE|DevOps","risk_flag":"High Risk|Dependency Bottleneck|Early Validation|null"}},...]

Exactly 10 items."""

        raw = self._call_llm(prompt)

        if raw:
            try:
                tasks = json.loads(self._strip_json_fences(raw))
                # Validate and clean each task
                cleaned = []
                valid_roles = {"FE", "BE", "DevOps"}
                valid_flags = {None, "High Risk", "Dependency Bottleneck", "Early Validation"}
                for t in tasks[:10]:
                    role = t.get("role", "BE")
                    if role not in valid_roles:
                        role = "BE"
                    flag = t.get("risk_flag")
                    if flag not in valid_flags:
                        flag = None
                    cleaned.append({"title": t.get("title", "Implement feature"), "role": role, "risk_flag": flag})
                if len(cleaned) >= 5:
                    return cleaned
            except Exception as e:
                print(f"[LLM] Task JSON parse error: {e}\nRaw: {raw[:200]}")

        # Fallback: stack-aware static tasks
        return self._fallback_tasks(project_context["stack"])

    def _fallback_tasks(self, stack: str) -> list[dict]:
        stack_lower = stack.lower()
        is_mobile = any(x in stack_lower for x in ["react native", "flutter", "swift", "kotlin"])
        is_fe_heavy = any(x in stack_lower for x in ["react", "vue", "angular", "next", "svelte"])

        return [
            {"title": "Set up repository, CI/CD pipeline, and deployment infrastructure", "role": "DevOps", "risk_flag": "Early Validation"},
            {"title": "Design database schema and data models", "role": "BE", "risk_flag": "Dependency Bottleneck"},
            {"title": "Build authentication and authorization layer", "role": "BE", "risk_flag": "High Risk"},
            {"title": "Implement core REST API endpoints", "role": "BE", "risk_flag": "Dependency Bottleneck"},
            {"title": "Integrate third-party services and external APIs", "role": "BE", "risk_flag": "High Risk"},
            {"title": "Build primary UI screens and component library", "role": "FE" if is_fe_heavy or is_mobile else "BE", "risk_flag": None},
            {"title": "Connect frontend to backend APIs with state management", "role": "FE", "risk_flag": "Dependency Bottleneck"},
            {"title": "Set up error monitoring, logging, and alerting", "role": "DevOps", "risk_flag": "Early Validation"},
            {"title": "Write integration and end-to-end test suite", "role": "BE", "risk_flag": None},
            {"title": "Performance optimization, security audit, and load testing", "role": "DevOps", "risk_flag": None},
        ]

    # ── Failure Forecast ──────────────────────────────────────────────────────

    def generate_failure_forecast(self, project_context: dict, worst_runs: dict, risk_scores: dict) -> dict:
        """
        Generate a realistic, project-specific failure sequence and mitigations.
        """
        overrun_weeks = max(0, worst_runs["p90_weeks"] - project_context["deadline_weeks"])
        top_risks = sorted(risk_scores.items(), key=lambda x: x[1], reverse=True)

        prompt = f"""Project risk analyst. Generate a failure forecast for:
Project: {project_context['project_name']}
Description: {project_context['description']}
Stack: {project_context['stack']}
Team: {project_context['team_junior']}j/{project_context['team_mid']}m/{project_context['team_senior']}s devs, {project_context['integrations']} integrations
Deadline: {project_context['deadline_weeks']}w | P90: {worst_runs['p90_weeks']:.1f}w ({overrun_weeks:.1f}w overrun)
Risks: {top_risks[0][0]}={top_risks[0][1]}/100 (top), {top_risks[1][0]}={top_risks[1][1]}/100, {top_risks[2][0]}={top_risks[2][1]}/100

Return ONLY this JSON (no markdown):
{{"failure_story":["Week X: <specific event for THIS project>","Week X: <cascade>","Week X: <secondary failure>","Week X: <team/stakeholder reaction>","Week X: <final missed deadline state>"],"mitigations":["<specific action 1>","<specific action 2>","<specific action 3>"]}}

Each line must reference THIS project's stack/domain. Weeks must be within {project_context['deadline_weeks']}w window."""

        raw = self._call_llm(prompt)

        if raw:
            try:
                result = json.loads(self._strip_json_fences(raw))
                if result.get("failure_story") and result.get("mitigations"):
                    return result
            except Exception as e:
                print(f"[LLM] Forecast JSON parse error: {e}\nRaw: {raw[:200]}")

        # Fallback
        return {
            "failure_story": [
                f"Week {max(1, project_context['deadline_weeks'] // 4)}: {top_risks[0][0].title()} issues surface — "
                f"underestimated complexity in {project_context['stack']} causes initial delays",
                f"Week {max(2, project_context['deadline_weeks'] // 3)}: Junior developers hit steep learning curve, "
                f"senior capacity consumed by code review and unblocking",
                f"Week {max(3, project_context['deadline_weeks'] // 2)}: Scope creep adds unplanned features after "
                f"first stakeholder demo, sprint backlog grows by 30%",
                f"Week {project_context['deadline_weeks'] - 1}: Testing reveals architectural issues requiring "
                f"significant rework of core components",
                f"Week {project_context['deadline_weeks']}: Deadline missed by {overrun_weeks:.0f} weeks — "
                f"emergency scope cut required to ship any working version",
            ],
            "mitigations": [
                f"Address {top_risks[0][0]} risk early: spike in Week 1 to validate all external dependencies",
                "Lock scope strictly after Week 2 — any additions require explicit deferral of existing work",
                f"Pair senior developers with juniors on {project_context['stack']} critical-path tasks from day one",
            ],
        }

    # ── Executive Summary ─────────────────────────────────────────────────────

    def generate_executive_summary(self, project_context: dict, metrics: dict) -> str:
        """
        Generate a concise, business-appropriate executive summary for leadership.
        on_time_probability in metrics is already a percentage (0-100).
        """
        deadline_weeks = project_context.get("deadline_weeks", metrics["p50_weeks"])
        on_time_pct = metrics["on_time_probability"]  # already 0-100 percentage

        if on_time_pct >= 70:
            confidence_label = "high confidence"
            recommendation_focus = "protect scope and maintain current team velocity"
        elif on_time_pct >= 45:
            confidence_label = "moderate confidence"
            recommendation_focus = "lock scope immediately and add buffer to the critical path"
        else:
            confidence_label = "low confidence"
            recommendation_focus = "immediately extend the deadline, reduce scope, or add senior capacity"

        top_risk = max(
            [("integration complexity", metrics["risk_scores"]["integration"]),
             ("team imbalance", metrics["risk_scores"]["team_imbalance"]),
             ("scope creep", metrics["risk_scores"]["scope_creep"])],
            key=lambda x: x[1]
        )

        prompt = f"""Technical PM. Write a 5-sentence executive summary for C-level leadership.

Project: {project_context['project_name']} | Stack: {project_context['stack']}
Team: {project_context['team_junior']}j/{project_context['team_mid']}m/{project_context['team_senior']}s | Deadline: {deadline_weeks}w
On-time: {on_time_pct:.0f}% ({confidence_label}) | P50: {metrics['p50_weeks']:.1f}w | P90: {metrics['p90_weeks']:.1f}w
Cost: ${metrics['p50_cost']:,.0f}–${metrics['p90_cost']:,.0f}
Top risk: {top_risk[0]} ({top_risk[1]}/100) | Integration: {metrics['risk_scores']['integration']}/100 | Scope creep: {metrics['risk_scores']['scope_creep']}/100

Cover: delivery confidence, timeline variance impact, cost range, top risk consequence, recommendation to {recommendation_focus}.
Flowing prose only. No bullets, no headers, no markdown. Output only the summary."""

        raw = self._call_llm(prompt)
        if raw:
            return raw.strip()

        # Fallback
        return (
            f"{project_context['project_name']} has a {on_time_pct:.0f}% probability of meeting the "
            f"{deadline_weeks}-week deadline based on {project_context.get('num_simulations', 1000):,} Monte Carlo simulations. "
            f"The median completion estimate is {metrics['p50_weeks']:.1f} weeks (P50), with a pessimistic scenario "
            f"of {metrics['p90_weeks']:.1f} weeks (P90) — a {metrics['p90_weeks'] - metrics['p50_weeks']:.1f}-week "
            f"variance that should be reflected in contingency planning. "
            f"Estimated project cost ranges from ${metrics['p50_cost']:,.0f} to ${metrics['p90_cost']:,.0f}. "
            f"The highest risk factor is {top_risk[0]} (score: {top_risk[1]}/100), which poses the greatest threat "
            f"to delivery confidence if not addressed in the first two weeks. "
            f"Critical recommendation: {recommendation_focus.capitalize()} to improve the probability envelope before the project progresses past the design phase."
        )
