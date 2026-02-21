"""
LLM Client for Google Gemini API
Person D - AI & DevOps / Glue Engineer
Phase 1 (Hours 0-2): Core wrapper ready for integration
Phase 4 (Hours 12-18): Wire to actual endpoints
"""

import os
import json
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


@dataclass
class LLMResponse:
    """Structured response from LLM"""
    content: str
    raw_response: Any
    success: bool
    error: Optional[str] = None


class GeminiClient:
    """
    Wrapper for Google Gemini API
    Optimized for PlanSight hackathon use cases:
    - Failure Forecast narratives
    - Executive Summaries
    - AI Task Breakdowns
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-1.5-flash"
    ):
        """
        Initialize Gemini client

        Args:
            api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
            model_name: Model to use (gemini-1.5-flash for speed, gemini-1.5-pro for quality)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name

        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            raise ValueError(
                "Gemini API key not configured. "
                "Get one from https://aistudio.google.com/app/apikey"
            )

        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)

    def generate(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        system_instruction: Optional[str] = None
    ) -> LLMResponse:
        """
        Generate text using Gemini API

        Args:
            prompt: User prompt
            temperature: Creativity (0.0-1.0, lower = more deterministic)
            max_tokens: Max response length
            system_instruction: Optional system/role instruction

        Returns:
            LLMResponse with content and metadata
        """
        try:
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                candidate_count=1
            )

            # Add system instruction if provided
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"{system_instruction}\n\n{prompt}"

            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )

            return LLMResponse(
                content=response.text,
                raw_response=response,
                success=True
            )

        except Exception as e:
            return LLMResponse(
                content="",
                raw_response=None,
                success=False,
                error=str(e)
            )

    def generate_failure_forecast(
        self,
        project_data: Dict[str, Any],
        risk_scores: Dict[str, float],
        worst_case_weeks: float
    ) -> Dict[str, Any]:
        """
        Generate failure forecast narrative

        Args:
            project_data: Project metadata (name, description, stack, etc.)
            risk_scores: Calculated risk scores
            worst_case_weeks: P90 or worst-case timeline

        Returns:
            Dict with failure_story and mitigations
        """
        system_instruction = (
            "You are a technical project risk analyst. "
            "Provide concise, actionable failure scenarios and mitigations. "
            "Be specific and data-driven. Use sharp, technical language."
        )

        prompt = f"""
Project: {project_data.get('project_name')}
Stack: {project_data.get('stack')}
Team: {project_data.get('team_senior')} senior, {project_data.get('team_mid')} mid, {project_data.get('team_junior')} junior
Deadline: {project_data.get('deadline_weeks')} weeks
P90 Timeline: {worst_case_weeks:.1f} weeks

Risk Scores:
- Integration Risk: {risk_scores.get('integration', 0):.0f}/100
- Team Imbalance Risk: {risk_scores.get('team_imbalance', 0):.0f}/100
- Scope Creep Risk: {risk_scores.get('scope_creep', 0):.0f}/100
- Learning Curve Risk: {risk_scores.get('learning_curve', 0):.0f}/100

Generate a failure forecast in JSON format:
{{
  "failure_story": [
    "Bullet point 1 - specific failure sequence",
    "Bullet point 2 - what breaks first",
    "Bullet point 3 - cascade effect"
  ],
  "mitigations": [
    "Mitigation 1 - specific action",
    "Mitigation 2 - specific action",
    "Mitigation 3 - specific action"
  ]
}}

Be specific about WHICH risk factor causes failure and HOW it cascades.
"""

        response = self.generate(
            prompt=prompt,
            temperature=0.6,
            max_tokens=800,
            system_instruction=system_instruction
        )

        if not response.success:
            return {
                "failure_story": ["LLM service unavailable"],
                "mitigations": ["Retry later or check API configuration"]
            }

        try:
            # Parse JSON from response
            # Gemini sometimes wraps JSON in markdown, so strip that
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            return json.loads(content.strip())
        except json.JSONDecodeError:
            # Fallback: parse as plain text
            return {
                "failure_story": [response.content[:200]],
                "mitigations": ["Enable debug mode for full LLM output"]
            }

    def generate_task_breakdown(
        self,
        project_data: Dict[str, Any],
        simulation_results: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """
        Generate AI task breakdown (first 10 tasks)

        Args:
            project_data: Project metadata
            simulation_results: Monte Carlo results and risk scores

        Returns:
            List of tasks with role and risk_flag
        """
        system_instruction = (
            "You are a technical project manager creating execution tasks. "
            "Output tasks in JSON array format. Be specific and technical."
        )

        top_risks = simulation_results.get('risk_scores', {})

        prompt = f"""
Project: {project_data.get('project_name')}
Description: {project_data.get('description', 'N/A')}
Stack: {project_data.get('stack')}
Deadline: {project_data.get('deadline_weeks')} weeks

Top Risks:
- Integration: {top_risks.get('integration', 0):.0f}/100
- Learning Curve: {top_risks.get('learning_curve', 0):.0f}/100

Generate the first 10 critical execution tasks in JSON array format:
[
  {{
    "title": "Task description",
    "role": "FE|BE|DevOps",
    "risk_flag": "High Risk|Dependency Bottleneck|Early Validation|null"
  }}
]

Prioritize tasks by critical path and risk mitigation.
Focus on setup, integrations, and high-risk areas first.
"""

        response = self.generate(
            prompt=prompt,
            temperature=0.5,
            max_tokens=1200,
            system_instruction=system_instruction
        )

        if not response.success:
            return [{
                "title": "LLM service unavailable",
                "role": "DevOps",
                "risk_flag": "High Risk"
            }]

        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            return json.loads(content.strip())
        except json.JSONDecodeError:
            return [{
                "title": "Parse LLM response manually",
                "role": "DevOps",
                "risk_flag": "High Risk"
            }]

    def generate_executive_summary(
        self,
        project_data: Dict[str, Any],
        simulation_results: Dict[str, Any]
    ) -> str:
        """
        Generate executive summary

        Args:
            project_data: Project metadata
            simulation_results: Full simulation output

        Returns:
            Executive summary text (4-8 sentences)
        """
        system_instruction = (
            "You are an executive advisor. "
            "Write concise, data-driven summaries for leadership. "
            "Focus on confidence, risks, and resource needs."
        )

        prompt = f"""
Project: {project_data.get('project_name')}
Stack: {project_data.get('stack')}
Team: {project_data.get('team_senior')} senior, {project_data.get('team_mid')} mid, {project_data.get('team_junior')} junior
Deadline: {project_data.get('deadline_weeks')} weeks

Results:
- On-time Probability: {simulation_results.get('on_time_probability', 0)*100:.0f}%
- Expected Completion (P50): {simulation_results.get('p50_weeks', 0):.1f} weeks
- Worst-Case (P90): {simulation_results.get('p90_weeks', 0):.1f} weeks
- Expected Overrun: {simulation_results.get('expected_overrun_days', 0):.1f} days
- Team Stress Index: {simulation_results.get('team_stress_index', 0):.0f}/100

Top Risks:
{json.dumps(simulation_results.get('risk_scores', {}), indent=2)}

Write a 4-8 sentence executive summary covering:
1. Project confidence score explanation
2. P50/P90 timeline and overrun summary
3. Top 3 risks and recommended mitigations
4. Resource allocation recommendation

Use sharp, technical language. Be direct about risks.
"""

        response = self.generate(
            prompt=prompt,
            temperature=0.6,
            max_tokens=600,
            system_instruction=system_instruction
        )

        if not response.success:
            return "LLM service unavailable. Check API configuration and retry."

        return response.content


# ========================================
# FALLBACK / MOCK MODE (for testing without API key)
# ========================================

class MockGeminiClient:
    """Mock client for testing without API key"""

    def generate_failure_forecast(self, project_data, risk_scores, worst_case_weeks):
        return {
            "failure_story": [
                "Integration delays compound with learning curve (new stack)",
                "Junior devs blocked on complex API integrations",
                "Deadline pressure leads to technical debt and rework"
            ],
            "mitigations": [
                "Add 1 senior dev to unblock integrations early",
                "Allocate 2 weeks for stack learning / spike work",
                "Build integration POCs before full implementation"
            ]
        }

    def generate_task_breakdown(self, project_data, simulation_results):
        return [
            {"title": "Set up project scaffolding and dev environment", "role": "DevOps", "risk_flag": None},
            {"title": "Design API schema and data models", "role": "BE", "risk_flag": "Early Validation"},
            {"title": "Build authentication flow", "role": "BE", "risk_flag": "Dependency Bottleneck"},
            {"title": "Create component library and design system", "role": "FE", "risk_flag": None},
            {"title": "Integrate third-party APIs (Stripe, Auth0)", "role": "BE", "risk_flag": "High Risk"},
            {"title": "Build core user dashboard UI", "role": "FE", "risk_flag": None},
            {"title": "Implement real-time data sync", "role": "BE", "risk_flag": "High Risk"},
            {"title": "Add error handling and logging", "role": "DevOps", "risk_flag": "Early Validation"},
            {"title": "Write integration tests for critical paths", "role": "BE", "risk_flag": None},
            {"title": "Deploy staging environment", "role": "DevOps", "risk_flag": "Dependency Bottleneck"}
        ]

    def generate_executive_summary(self, project_data, simulation_results):
        return (
            f"Project '{project_data.get('project_name')}' has a "
            f"{simulation_results.get('on_time_probability', 0)*100:.0f}% probability of meeting "
            f"the {project_data.get('deadline_weeks')}-week deadline. Expected completion is "
            f"{simulation_results.get('p50_weeks', 0):.1f} weeks (P50), with worst-case at "
            f"{simulation_results.get('p90_weeks', 0):.1f} weeks (P90). Top risks include integration "
            f"complexity and team learning curve. Recommended mitigations: allocate senior dev capacity "
            f"to integration work early, and build POCs for new stack components before full implementation."
        )


# ========================================
# Factory Function
# ========================================

def get_llm_client(use_mock: bool = False) -> GeminiClient:
    """
    Get LLM client (real or mock)

    Args:
        use_mock: If True, return mock client (for testing without API key)

    Returns:
        GeminiClient or MockGeminiClient
    """
    if use_mock:
        return MockGeminiClient()

    try:
        return GeminiClient()
    except ValueError:
        # API key not configured, fall back to mock
        print("WARNING: Gemini API key not configured. Using mock client.")
        return MockGeminiClient()
