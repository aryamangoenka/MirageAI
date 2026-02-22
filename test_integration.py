#!/usr/bin/env python3
"""Quick integration test to verify backend response structure"""
import requests
import json

# Test backend simulation endpoint
test_request = {
    "project_name": "Test Project",
    "description": "Quick integration test",
    "scope_size": "medium",
    "complexity": 5,
    "stack": "React + FastAPI",
    "deadline_weeks": 8,
    "team_junior": 1,
    "team_mid": 1,
    "team_senior": 1,
    "integrations": 2,
    "scope_volatility": 3,
    "num_simulations": 100
}

try:
    response = requests.post("http://localhost:8000/simulate", json=test_request)
    response.raise_for_status()

    data = response.json()

    print("✓ Backend responded successfully")
    print("\nResponse structure:")
    print(json.dumps(data, indent=2))

    # Verify expected fields
    required_fields = [
        "on_time_probability", "expected_overrun_days", "p50_weeks", "p90_weeks",
        "histogram", "risk_scores", "team_stress_index", "p50_cost", "p90_cost",
        "currency", "role_allocation"
    ]

    missing = [f for f in required_fields if f not in data]
    if missing:
        print(f"\n✗ Missing fields: {missing}")
    else:
        print("\n✓ All expected fields present")

    # Check histogram structure
    if "histogram" in data and len(data["histogram"]) > 0:
        print(f"\n✓ Histogram has {len(data['histogram'])} buckets")
        print(f"  Sample bucket: {data['histogram'][0]}")

    # Check risk scores
    if "risk_scores" in data:
        print(f"\n✓ Risk scores: {data['risk_scores']}")

except Exception as e:
    print(f"✗ Error: {e}")
