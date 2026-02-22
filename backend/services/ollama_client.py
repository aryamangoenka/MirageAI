"""
Ollama client for generating AI-powered execution plans.

Call chain:
  1. Local Ollama (gemini-3-flash-preview via ollama Python SDK)
  2. Cloud Gemini fallback (if Ollama call fails)
  3. Project-aware deterministic plan (last resort)
"""

import json
import os
from typing import Any, Dict, Optional

from .llm_client import LLMClient


# ── Shared helpers ────────────────────────────────────────────────────────────

def _strip_json_fences(text: str) -> str:
    """Strip markdown fences, 'thought' prefixes, and anything before the first { or [."""
    text = text.strip()
    # Handle markdown code fences
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    # Gemini thinking models emit "thought\n{...}" or similar — find the real JSON
    brace = text.find("{")
    bracket = text.find("[")
    if brace == -1 and bracket == -1:
        return text
    if brace == -1:
        return text[bracket:]
    if bracket == -1:
        return text[brace:]
    return text[min(brace, bracket):]


def _looks_like_plan(data: Any) -> bool:
    if not isinstance(data, dict):
        return False
    phases = data.get("phases")
    if not isinstance(phases, list) or not phases:
        return False
    required = ("name", "week_start", "week_end", "description", "tasks", "milestone")
    return all(k in phases[0] for k in required)


def _build_prompt(project_context: Dict[str, Any], simulation_data: Dict[str, Any]) -> str:
    risks = simulation_data.get("risk_scores", {})
    top_risk = max(risks, key=lambda k: risks.get(k, 0)) if risks else "integration"
    on_time = simulation_data.get("on_time_probability", 50)
    confidence = "low" if on_time < 40 else "moderate" if on_time < 70 else "high"

    return f"""You are a senior delivery lead. Generate a realistic, phased execution plan for this specific software project.

PROJECT DETAILS
Name: {project_context['project_name']}
Description: {project_context['description']}
Tech Stack: {project_context['stack']}
Team: {project_context['team_junior']} junior devs, {project_context['team_mid']} mid devs, {project_context['team_senior']} senior devs
External Integrations: {project_context['integrations']}
Deadline: {project_context['deadline_weeks']} weeks
Complexity: {project_context['complexity']}/5

SIMULATION RESULTS
Expected completion: {simulation_data['p50_weeks']:.1f} weeks (P50), {simulation_data['p90_weeks']:.1f} weeks worst case (P90)
On-time confidence: {on_time:.0f}% ({confidence})
Top risk area: {top_risk.replace('_', ' ')} ({risks.get(top_risk, 0)}/100)
Risks: integration={risks.get('integration',0)}/100, team_imbalance={risks.get('team_imbalance',0)}/100, scope_creep={risks.get('scope_creep',0)}/100, learning_curve={risks.get('learning_curve',0)}/100

INSTRUCTIONS
- Create exactly 3-4 phases that fit within the {project_context['deadline_weeks']}-week deadline
- week_start and week_end for each phase must be integers within 1..{project_context['deadline_weeks']}
- Every task title must explicitly mention "{project_context['project_name']}" or "{project_context['stack']}"
- Each phase must have 2-4 tasks
- role must be exactly one of: "FE", "BE", "DevOps"
- priority must be exactly one of: "high", "medium", "low"
- risk_flag must be exactly one of: "High Risk", "Dependency Bottleneck", "Early Validation", or null
- Address the top risk ({top_risk.replace('_', ' ')}) with at least one specific task or risk note

Return ONLY valid JSON — no explanation, no markdown fences, no extra text:
{{
  "phases": [
    {{
      "name": "short phase label",
      "week_start": 1,
      "week_end": 3,
      "description": "2-sentence description specific to {project_context['project_name']} and {project_context['stack']}",
      "tasks": [
        {{
          "title": "concrete task mentioning {project_context['project_name']} or {project_context['stack']}",
          "role": "BE",
          "priority": "high",
          "risk_flag": "Dependency Bottleneck"
        }}
      ],
      "risks": ["one-line risk relevant to this phase and project"],
      "milestone": "specific deliverable for {project_context['project_name']}"
    }}
  ],
  "go_no_go_checkpoints": [
    {{
      "week": 4,
      "condition": "specific go/no-go condition for {project_context['project_name']}"
    }}
  ],
  "critical_path_note": "1-2 sentences about the critical path for {project_context['project_name']} using {project_context['stack']}, referencing the top risk."
}}"""


# ── Main client ───────────────────────────────────────────────────────────────

class OllamaClient:
    """
    Generates project-specific execution plans using Ollama (primary)
    with Gemini cloud and project-aware static fallbacks.
    """

    def __init__(self) -> None:
        self.model_name = os.getenv("OLLAMA_MODEL", "gemini-3-flash-preview")

    def _call_ollama(self, prompt: str) -> Optional[str]:
        """
        Call Ollama using the official Python SDK's chat() API.
        Returns model response text or None on any failure.
        """
        try:
            from ollama import chat, ChatResponse  # type: ignore[import]

            response: ChatResponse = chat(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                options={"temperature": 0.3, "num_predict": 8192},
            )
            content = response.message.content
            if isinstance(content, str) and content.strip():
                print(f"[Ollama] Got response ({len(content)} chars)")
                return content
            print(f"[Ollama] Empty response from {self.model_name}")
            return None
        except Exception as exc:
            print(f"[Ollama] chat() failed: {type(exc).__name__}: {exc}")
            return None

    def _call_gemini(self, prompt: str) -> Optional[str]:
        """Use the existing Gemini LLMClient as a cloud fallback."""
        try:
            llm = LLMClient()
            if not llm.client:
                print("[Ollama] Gemini fallback: no API client initialized")
                return None
            raw = llm._call_llm(prompt)  # type: ignore[attr-defined]
            if raw:
                print("[Ollama] Got Gemini fallback response")
            return raw
        except Exception as exc:
            print(f"[Ollama] Gemini fallback failed: {exc}")
            return None

    def generate_execution_plan(
        self,
        project_context: Dict[str, Any],
        simulation_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate a structured execution plan.
        Returns a validated plan dict — always succeeds (falls back to static if needed).
        """
        prompt = _build_prompt(project_context, simulation_data)

        # 1️⃣ Ollama (local, primary)
        raw = self._call_ollama(prompt)
        if raw:
            try:
                parsed = json.loads(_strip_json_fences(raw))
                if _looks_like_plan(parsed):
                    print("[Ollama] ✓ Using Ollama execution plan")
                    return parsed
                print(f"[Ollama] Schema mismatch: keys={list(parsed.keys()) if isinstance(parsed, dict) else type(parsed)}")
            except json.JSONDecodeError as exc:
                print(f"[Ollama] JSON parse error: {exc}\nRaw snippet: {raw[:400]}")

        # 2️⃣ Gemini cloud (fallback)
        raw = self._call_gemini(prompt)
        if raw:
            try:
                parsed = json.loads(_strip_json_fences(raw))
                if _looks_like_plan(parsed):
                    print("[Ollama] ✓ Using Gemini execution plan (fallback)")
                    return parsed
            except json.JSONDecodeError as exc:
                print(f"[Ollama] Gemini JSON parse error: {exc}")

        # 3️⃣ Project-aware static plan (always unique per project)
        print("[Ollama] ✓ Using project-aware static plan (all AI unavailable)")
        return _static_plan(project_context, simulation_data)


# ── Project-aware static fallback ────────────────────────────────────────────

def _static_plan(
    project_context: Dict[str, Any],
    simulation_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Deterministic but project-specific fallback plan.
    Uses the actual project name, stack, team, integrations, and risk scores.
    """
    name = project_context["project_name"]
    stack = project_context["stack"]
    deadline = int(project_context.get("deadline_weeks", 8))
    integrations = int(project_context.get("integrations", 0))
    complexity = int(project_context.get("complexity", 3))
    juniors = int(project_context.get("team_junior", 1))
    mids = int(project_context.get("team_mid", 1))
    seniors = int(project_context.get("team_senior", 1))

    risks = simulation_data.get("risk_scores", {})
    top_risk = max(risks, key=lambda k: risks.get(k, 0), default="integration")
    on_time = simulation_data.get("on_time_probability", 50)
    p50 = float(simulation_data.get("p50_weeks", deadline))

    stack_lower = stack.lower()
    is_fe = any(x in stack_lower for x in ["react", "vue", "angular", "next", "svelte", "flutter"])
    primary_fe = "FE" if is_fe else "BE"

    # Phase boundaries
    ph1_end = max(2, round(min(p50, deadline) * 0.28))
    ph2_end = max(ph1_end + 2, round(min(p50, deadline) * 0.65))
    ph3_end = max(ph2_end + 1, min(round(p50), deadline - 1))
    ph4_start = min(ph3_end + 1, deadline)

    phases = [
        {
            "name": "Foundation",
            "week_start": 1,
            "week_end": ph1_end,
            "description": (
                f"Establish the {stack} architecture and CI/CD pipeline for {name}. "
                f"Validate all {integrations} external dependencies before feature work begins."
            ),
            "tasks": [
                {"title": f"Set up {stack} monorepo, CI/CD, and cloud environments for {name}", "role": "DevOps", "priority": "high", "risk_flag": "Early Validation"},
                {"title": f"Design {name} data model, API contracts, and system architecture", "role": "BE", "priority": "high", "risk_flag": "Dependency Bottleneck"},
                *([{"title": f"Spike and validate all {integrations} external API integrations for {name}", "role": "BE", "priority": "high", "risk_flag": "Early Validation"}] if integrations > 0 else []),
                *([{"title": f"Run {stack} learning spikes and share findings across {juniors + mids + seniors}-person team", "role": "BE", "priority": "high", "risk_flag": "Early Validation"}] if risks.get("learning_curve", 0) > 50 else []),
            ],
            "risks": [f"Architecture decisions made here constrain all {name} development downstream."],
            "milestone": f"{name} skeleton deployed to staging with CI pipeline passing",
        },
        {
            "name": "Core Features",
            "week_start": ph1_end + 1,
            "week_end": ph2_end,
            "description": (
                f"Build the primary user-facing features and business logic of {name} in {stack}. "
                f"{seniors} senior dev(s) should own architecture and unblocking."
            ),
            "tasks": [
                {"title": f"Implement {name} core business logic and {stack} data layer", "role": "BE", "priority": "high", "risk_flag": "High Risk"},
                {"title": f"Build primary {name} UI screens and component system", "role": primary_fe, "priority": "high", "risk_flag": None},
                {"title": f"Connect {name} frontend to backend APIs with full error handling", "role": "FE", "priority": "medium", "risk_flag": "Dependency Bottleneck"},
            ],
            "risks": [
                f"Integration between {stack} layers may surface hidden complexity.",
                *([f"Team imbalance ({risks['team_imbalance']}/100) — junior workload must be supervised closely."] if risks.get("team_imbalance", 0) > 40 else []),
            ],
            "milestone": f"Core {name} user journeys working end-to-end with real data",
        },
        {
            "name": "Secondary Features & Polish",
            "week_start": ph2_end + 1,
            "week_end": ph3_end,
            "description": (
                f"Complete secondary features and edge cases for {name}. "
                f"Scope must be frozen — no new features accepted after this phase starts."
            ),
            "tasks": [
                {"title": f"Implement remaining {name} backlog features by priority", "role": "BE", "priority": "medium", "risk_flag": None},
                {"title": f"Add error states, empty states, and loading UX across {name}", "role": primary_fe, "priority": "medium", "risk_flag": None},
                *([{"title": f"Harden all {integrations} {name} integrations with retry logic and fallbacks", "role": "BE", "priority": "high", "risk_flag": "High Risk"}] if integrations > 1 else []),
            ],
            "risks": [f"Any scope additions now directly threaten the {deadline}-week {name} deadline."],
            "milestone": f"Feature-complete {name} ready for quality assurance",
        },
        {
            "name": "Hardening & Launch",
            "week_start": ph4_start,
            "week_end": deadline,
            "description": (
                f"Stabilise, test, and prepare {name} for launch. "
                f"With {on_time:.0f}% on-time confidence, every buffer day matters."
            ),
            "tasks": [
                {"title": f"Run {name} end-to-end and regression suite on {stack}", "role": "BE", "priority": "high", "risk_flag": "Early Validation"},
                {"title": f"Set up {name} monitoring, alerting, and incident runbook", "role": "DevOps", "priority": "medium", "risk_flag": None},
                {"title": f"Performance and security review of {name} critical paths", "role": "DevOps" if complexity >= 3 else "BE", "priority": "medium", "risk_flag": None},
            ],
            "risks": [
                "Insufficient hardening time is the most common source of rough launches.",
                *([f"Scope creep risk ({risks['scope_creep']}/100) — strictly reject any new feature requests."] if risks.get("scope_creep", 0) > 50 else []),
            ],
            "milestone": f"{name} passing all acceptance criteria and ready to ship",
        },
    ]

    checkpoints = [
        {"week": ph1_end, "condition": f"{name} architecture approved, CI green, and all external integrations confirmed."},
        {"week": ph2_end, "condition": f"Core {name} user journeys demoable end-to-end with real or sandbox data."},
        {"week": ph3_end, "condition": f"{name} feature-complete — no new scope will be accepted from this point."},
    ]

    risk_notes = {
        "integration": f"External integrations are the critical path for {name}. Validate all {integrations} integrations in Week 1 to prevent cascade delays.",
        "scope_creep": f"Scope discipline is the critical path. Any unplanned {name} feature compresses the {max(0, deadline - round(p50))}-week launch buffer.",
        "team_imbalance": f"Senior capacity is the critical path. With {seniors} senior dev(s), protect their time rigorously — they are the unblocking resource for all {juniors + mids} other developers.",
        "learning_curve": f"The {stack} learning curve is the critical path for {name} — front-load spikes and pair programming in Phase 1 to prevent compounding delays later.",
    }

    return {
        "phases": phases,
        "go_no_go_checkpoints": checkpoints,
        "critical_path_note": risk_notes.get(top_risk, f"The critical path for {name} runs through the core {stack} integration layer."),
    }
