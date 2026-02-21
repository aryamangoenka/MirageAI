"""
LLM client wrapper for Gemini or other providers.
"""

import os
from typing import Optional
import json
import time


class LLMClient:
    """Wrapper for LLM API calls with retries and error handling."""
    
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")
        self.model = os.getenv("LLM_MODEL", "gemini-1.5-flash")
        self.client = None
        
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model)
            except Exception as e:
                print(f"Warning: Could not initialize Gemini client: {e}")
    
    def _call_llm(self, prompt: str, retries: int = 2, timeout: float = 10.0) -> Optional[str]:
        """
        Call LLM with retries and error handling.
        Returns None if LLM is unavailable or fails.
        """
        if not self.client:
            return None
        
        for attempt in range(retries):
            try:
                response = self.client.generate_content(prompt)
                return response.text
            except Exception as e:
                if attempt < retries - 1:
                    time.sleep(0.5)
                else:
                    print(f"LLM call failed after {retries} attempts: {e}")
                    return None
        return None
    
    def generate_failure_forecast(self, project_context: dict, worst_runs: list, risk_scores: dict) -> dict:
        """
        Generate failure story and mitigations from worst simulation runs.
        """
        prompt = f"""You are a project risk analyst. Based on the following project simulation data, generate a realistic failure forecast.

Project: {project_context['project_name']}
Description: {project_context['description']}
Stack: {project_context['stack']}
Team: {project_context['team_junior']} junior, {project_context['team_mid']} mid, {project_context['team_senior']} senior
Integrations: {project_context['integrations']}
Deadline: {project_context['deadline_weeks']} weeks

Risk Scores (0-100):
- Integration Risk: {risk_scores['integration']}
- Team Imbalance Risk: {risk_scores['team_imbalance']}
- Scope Creep Risk: {risk_scores['scope_creep']}
- Learning Curve Risk: {risk_scores['learning_curve']}

Simulation results show P90 completion at {worst_runs['p90_weeks']:.1f} weeks vs {project_context['deadline_weeks']} week deadline.

Generate a JSON response with:
1. "failure_story": array of 3-5 bullet points describing the most likely failure sequence
2. "mitigations": array of top 3 concrete mitigation actions

Return ONLY valid JSON, no markdown formatting."""

        response_text = self._call_llm(prompt)
        
        if not response_text:
            # Fallback if LLM unavailable
            return {
                "failure_story": [
                    "Integration delays cascade due to API instability and third-party dependencies",
                    f"Team velocity drops as junior members struggle with {project_context['stack']} learning curve",
                    "Scope creep adds unplanned features, expanding timeline by 20-30%",
                    "Testing phase reveals architectural issues requiring significant refactor",
                ],
                "mitigations": [
                    f"Add {max(1, project_context['team_junior'])} senior developer(s) or extend deadline by {int(worst_runs['p90_weeks'] - project_context['deadline_weeks'])} weeks",
                    "Lock scope early and defer non-critical features to post-MVP",
                    "Build integration mocks and test harnesses upfront to derisk dependencies",
                ],
            }
        
        try:
            # Try to parse JSON from response
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            result = json.loads(cleaned.strip())
            return result
        except:
            # Fallback parsing
            return {
                "failure_story": [line.strip() for line in response_text.split('\n') if line.strip()][:5],
                "mitigations": ["Review LLM output for structured mitigations"],
            }
    
    def generate_executive_summary(self, project_context: dict, metrics: dict) -> str:
        """
        Generate executive summary text from project and metrics.
        """
        prompt = f"""You are a technical project manager preparing an executive summary for leadership. 

Project: {project_context['project_name']}
Description: {project_context['description']}
Stack: {project_context['stack']}
Team: {project_context['team_size']} developers ({project_context['team_senior']} senior, {project_context['team_mid']} mid, {project_context['team_junior']} junior)

Simulation Results:
- On-time probability: {metrics['on_time_probability']:.1%}
- Expected completion: P50 = {metrics['p50_weeks']:.1f} weeks, P90 = {metrics['p90_weeks']:.1f} weeks
- Deadline: {project_context['deadline_weeks']} weeks
- Estimated cost: ${metrics['p50_cost']:,.0f} (P50) to ${metrics['p90_cost']:,.0f} (P90)
- Team stress index: {metrics['team_stress_index']}/100

Top Risks:
- Integration: {metrics['risk_scores']['integration']}/100
- Team imbalance: {metrics['risk_scores']['team_imbalance']}/100
- Scope creep: {metrics['risk_scores']['scope_creep']}/100

Write a concise 4-8 sentence executive summary covering: timeline confidence, key risks, cost range, and one critical recommendation. Use clear, business-appropriate language."""

        response_text = self._call_llm(prompt)
        
        if not response_text:
            # Fallback if LLM unavailable
            return (
                f"{project_context['project_name']} has a {metrics['on_time_probability']:.0%} chance of meeting the {project_context['deadline_weeks']}-week deadline. "
                f"Expected completion is {metrics['p50_weeks']:.1f} weeks (P50) with a worst-case of {metrics['p90_weeks']:.1f} weeks (P90). "
                f"Key risks include integration complexity ({metrics['risk_scores']['integration']}/100) and scope volatility. "
                f"Estimated cost ranges from ${metrics['p50_cost']:,.0f} to ${metrics['p90_cost']:,.0f}. "
                f"Critical recommendation: {'Add senior resources or extend timeline' if metrics['on_time_probability'] < 0.5 else 'Lock scope early to maintain schedule confidence'}."
            )
        
        return response_text.strip()
    
    def generate_task_breakdown(self, project_context: dict, risks: dict) -> list[dict]:
        """
        Generate 10 ordered tasks with role and risk tags.
        """
        prompt = f"""You are a technical lead planning execution for a software project.

Project: {project_context['project_name']}
Description: {project_context['description']}
Stack: {project_context['stack']}
Timeline: {project_context['p50_weeks']:.1f} weeks (P50), {project_context['p90_weeks']:.1f} weeks (P90)

Top Risk Areas:
- Integration complexity: {risks['integration']}/100
- Team imbalance: {risks['team_imbalance']}/100
- Learning curve: {risks['learning_curve']}/100

Generate exactly 10 implementation tasks ordered by priority/critical path. For each task, provide:
- "title": clear, actionable task description
- "role": one of "FE", "BE", or "DevOps"
- "risk_flag": null, "High Risk", "Dependency Bottleneck", or "Early Validation"

Return ONLY valid JSON array with no markdown formatting:
[{{"title": "...", "role": "...", "risk_flag": "..."}}, ...]"""

        response_text = self._call_llm(prompt)
        
        if not response_text:
            # Fallback if LLM unavailable
            stack_lower = project_context['stack'].lower()
            is_fe_heavy = any(x in stack_lower for x in ['react', 'vue', 'angular', 'next'])
            
            return [
                {"title": "Set up CI/CD pipeline and deployment infrastructure", "role": "DevOps", "risk_flag": "Early Validation"},
                {"title": "Design and implement core API endpoints", "role": "BE", "risk_flag": "High Risk"},
                {"title": "Build authentication and authorization system", "role": "BE", "risk_flag": "Dependency Bottleneck"},
                {"title": "Create UI component library and design system", "role": "FE", "risk_flag": None} if is_fe_heavy else {"title": "Set up database schema and migrations", "role": "BE", "risk_flag": "Dependency Bottleneck"},
                {"title": "Implement external API integrations", "role": "BE", "risk_flag": "High Risk"},
                {"title": "Build frontend state management and data flows", "role": "FE", "risk_flag": None},
                {"title": "Set up monitoring and error tracking", "role": "DevOps", "risk_flag": "Early Validation"},
                {"title": "Implement responsive layouts and mobile optimization", "role": "FE", "risk_flag": None},
                {"title": "Write integration tests for critical paths", "role": "BE", "risk_flag": "Dependency Bottleneck"},
                {"title": "Performance optimization and load testing", "role": "DevOps", "risk_flag": None},
            ]
        
        try:
            # Try to parse JSON from response
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            tasks = json.loads(cleaned.strip())
            return tasks[:10]
        except:
            # Fallback
            return [{"title": f"Task {i+1} from LLM", "role": "BE", "risk_flag": None} for i in range(10)]
