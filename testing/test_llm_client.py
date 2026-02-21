"""
Test Script for LLM Client (Gemini API)
Person D - AI & DevOps / Glue Engineer
Phase 1 (Hours 0-2): Validate LLM client before integration

Usage:
    # Test with mock client (no API key needed)
    python testing/test_llm_client.py --mock

    # Test with real Gemini API (requires API key in .env)
    python testing/test_llm_client.py
"""

import sys
import os
import argparse
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from services.llm_client import GeminiClient, MockGeminiClient, get_llm_client


def test_mock_client():
    """Test mock client (no API key required)"""
    print("\n" + "="*60)
    print("Testing Mock LLM Client")
    print("="*60)

    client = MockGeminiClient()

    # Test failure forecast
    print("\n1. Testing Failure Forecast Generation...")
    project_data = {
        "project_name": "Test Project",
        "stack": "React + FastAPI",
        "team_senior": 1,
        "team_mid": 2,
        "team_junior": 1,
        "deadline_weeks": 12
    }
    risk_scores = {
        "integration": 72,
        "team_imbalance": 45,
        "scope_creep": 60,
        "learning_curve": 55
    }

    result = client.generate_failure_forecast(project_data, risk_scores, 18.5)
    print("✓ Failure Story:")
    for i, story in enumerate(result.get("failure_story", []), 1):
        print(f"  {i}. {story}")

    print("\n✓ Mitigations:")
    for i, mitigation in enumerate(result.get("mitigations", []), 1):
        print(f"  {i}. {mitigation}")

    # Test task breakdown
    print("\n2. Testing Task Breakdown Generation...")
    simulation_results = {
        "risk_scores": risk_scores,
        "on_time_probability": 0.42,
        "p50_weeks": 14.2,
        "p90_weeks": 18.5
    }

    tasks = client.generate_task_breakdown(project_data, simulation_results)
    print(f"✓ Generated {len(tasks)} tasks:")
    for i, task in enumerate(tasks[:5], 1):  # Show first 5
        risk_flag = f" [{task['risk_flag']}]" if task.get('risk_flag') else ""
        print(f"  {i}. [{task['role']}]{risk_flag} {task['title']}")

    # Test executive summary
    print("\n3. Testing Executive Summary Generation...")
    summary = client.generate_executive_summary(project_data, simulation_results)
    print("✓ Summary:")
    print(f"  {summary[:200]}...")

    print("\n" + "="*60)
    print("✓ Mock client tests passed!")
    print("="*60)


def test_real_client():
    """Test real Gemini API client (requires API key)"""
    print("\n" + "="*60)
    print("Testing Real Gemini API Client")
    print("="*60)

    try:
        client = GeminiClient()
        print(f"✓ Client initialized with model: {client.model_name}")
    except ValueError as e:
        print(f"❌ Error: {e}")
        print("\nTo test with real Gemini API:")
        print("1. Get API key from: https://aistudio.google.com/app/apikey")
        print("2. Add to backend/.env: GEMINI_API_KEY=your_key_here")
        print("3. Rerun this test")
        return

    # Test basic generation
    print("\n1. Testing Basic Text Generation...")
    response = client.generate(
        prompt="Explain Monte Carlo simulation in one sentence.",
        temperature=0.5,
        max_tokens=100
    )

    if response.success:
        print(f"✓ Response: {response.content}")
    else:
        print(f"❌ Error: {response.error}")
        return

    # Test failure forecast
    print("\n2. Testing Failure Forecast Generation...")
    project_data = {
        "project_name": "E-commerce Platform Rebuild",
        "description": "Migrate legacy PHP to React + FastAPI",
        "stack": "React + FastAPI + PostgreSQL",
        "team_senior": 1,
        "team_mid": 2,
        "team_junior": 1,
        "deadline_weeks": 12
    }
    risk_scores = {
        "integration": 72,
        "team_imbalance": 45,
        "scope_creep": 60,
        "learning_curve": 55
    }

    result = client.generate_failure_forecast(project_data, risk_scores, 18.5)
    print("✓ Failure Story:")
    for i, story in enumerate(result.get("failure_story", []), 1):
        print(f"  {i}. {story}")

    print("\n✓ Mitigations:")
    for i, mitigation in enumerate(result.get("mitigations", []), 1):
        print(f"  {i}. {mitigation}")

    # Test task breakdown
    print("\n3. Testing Task Breakdown Generation...")
    simulation_results = {
        "risk_scores": risk_scores,
        "on_time_probability": 0.42,
        "p50_weeks": 14.2,
        "p90_weeks": 18.5
    }

    tasks = client.generate_task_breakdown(project_data, simulation_results)
    print(f"✓ Generated {len(tasks)} tasks:")
    for i, task in enumerate(tasks[:5], 1):
        risk_flag = f" [{task['risk_flag']}]" if task.get('risk_flag') else ""
        print(f"  {i}. [{task['role']}]{risk_flag} {task['title']}")

    print("\n" + "="*60)
    print("✓ Real API client tests passed!")
    print("="*60)


def main():
    parser = argparse.ArgumentParser(description="Test LLM Client")
    parser.add_argument("--mock", action="store_true", help="Use mock client (no API key required)")

    args = parser.parse_args()

    if args.mock:
        test_mock_client()
    else:
        print("\nAttempting to use real Gemini API client...")
        print("(Use --mock flag to test without API key)")
        test_real_client()


if __name__ == "__main__":
    main()
