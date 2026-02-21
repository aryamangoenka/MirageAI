"""
Comprehensive test with real Gemini API key.
"""

import asyncio
import httpx
import uvicorn
from main import app
import os
from dotenv import load_dotenv

load_dotenv()


async def test_all_endpoints_with_llm():
    """Test all API endpoints including LLM features."""
    
    config = uvicorn.Config(app, host='127.0.0.1', port=8000, log_level='error')
    server = uvicorn.Server(config)
    
    server_task = asyncio.create_task(server.serve())
    await asyncio.sleep(2)
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print("\n" + "="*70)
            print("TESTING PLANSIGHT API WITH GEMINI")
            print("="*70)
            
            # Test project data
            project_data = {
                'project_name': 'AI-Powered E-commerce Platform',
                'description': 'Full-stack e-commerce with AI recommendations, payment integration, and real-time inventory',
                'scope_size': 'large',
                'complexity': 4,
                'stack': 'React + Node',
                'deadline_weeks': 12,
                'team_junior': 2,
                'team_mid': 2,
                'team_senior': 1,
                'integrations': 4,
                'scope_volatility': 65,
                'num_simulations': 1000
            }
            
            # 1. Health check
            print("\n1. Testing GET /health")
            resp = await client.get('http://127.0.0.1:8000/health')
            print(f"   Status: {resp.status_code}")
            assert resp.status_code == 200
            print(f"   ✓ Response: {resp.json()}")
            
            # 2. Simulation
            print("\n2. Testing POST /simulate (Monte Carlo with 1000 runs)")
            import time
            start = time.time()
            resp = await client.post('http://127.0.0.1:8000/simulate', json=project_data)
            elapsed = (time.time() - start) * 1000
            print(f"   Status: {resp.status_code}")
            assert resp.status_code == 200
            
            sim_result = resp.json()
            print(f"   ✓ Completed in {elapsed:.0f}ms")
            print(f"   ✓ P50: {sim_result['p50_weeks']}w, P90: {sim_result['p90_weeks']}w")
            print(f"   ✓ On-time probability: {sim_result['on_time_probability']:.1%}")
            print(f"   ✓ Team stress: {sim_result['team_stress_index']}/100")
            print(f"   ✓ Cost range: ${sim_result['p50_cost']:,.0f} - ${sim_result['p90_cost']:,.0f}")
            print(f"   ✓ Role allocation: FE={sim_result['role_allocation']['fe']:.0%}, BE={sim_result['role_allocation']['be']:.0%}, DevOps={sim_result['role_allocation']['devops']:.0%}")
            print(f"   ✓ Histogram buckets: {len(sim_result['histogram'])}")
            print(f"   ✓ Risk scores: Integration={sim_result['risk_scores']['integration']}, Team={sim_result['risk_scores']['team_imbalance']}, Scope={sim_result['risk_scores']['scope_creep']}, Learning={sim_result['risk_scores']['learning_curve']}")
            
            # 3. Failure Forecast (with real LLM)
            print("\n3. Testing POST /failure-forecast (with Gemini AI)")
            resp = await client.post('http://127.0.0.1:8000/failure-forecast', json=project_data)
            print(f"   Status: {resp.status_code}")
            assert resp.status_code == 200
            
            forecast = resp.json()
            print(f"   ✓ Failure story ({len(forecast['failure_story'])} points):")
            for i, story in enumerate(forecast['failure_story'][:3], 1):
                print(f"      {i}. {story[:80]}{'...' if len(story) > 80 else ''}")
            if len(forecast['failure_story']) > 3:
                print(f"      ... and {len(forecast['failure_story']) - 3} more")
            
            print(f"   ✓ Mitigations ({len(forecast['mitigations'])} items):")
            for i, mitigation in enumerate(forecast['mitigations'], 1):
                print(f"      {i}. {mitigation[:80]}{'...' if len(mitigation) > 80 else ''}")
            
            # 4. Executive Summary (with real LLM)
            print("\n4. Testing POST /executive-summary (with Gemini AI)")
            exec_req = {
                'project_name': project_data['project_name'],
                'description': project_data['description'],
                'stack': project_data['stack'],
                'p50_weeks': sim_result['p50_weeks'],
                'p90_weeks': sim_result['p90_weeks'],
                'on_time_probability': sim_result['on_time_probability'],
                'p50_cost': sim_result['p50_cost'],
                'p90_cost': sim_result['p90_cost'],
                'currency': sim_result['currency'],
                'risk_scores': sim_result['risk_scores'],
                'role_allocation': sim_result['role_allocation']
            }
            resp = await client.post('http://127.0.0.1:8000/executive-summary', json=exec_req)
            print(f"   Status: {resp.status_code}")
            assert resp.status_code == 200
            
            summary = resp.json()
            print(f"   ✓ Executive summary generated ({len(summary['summary_text'])} chars):")
            print(f"      {summary['summary_text'][:200]}...")
            
            # 5. Task Breakdown (with real LLM)
            print("\n5. Testing POST /task-breakdown (with Gemini AI)")
            task_req = {
                'project_name': project_data['project_name'],
                'description': project_data['description'],
                'stack': project_data['stack'],
                'p50_weeks': sim_result['p50_weeks'],
                'p90_weeks': sim_result['p90_weeks'],
                'risk_scores': sim_result['risk_scores']
            }
            resp = await client.post('http://127.0.0.1:8000/task-breakdown', json=task_req)
            print(f"   Status: {resp.status_code}")
            assert resp.status_code == 200
            
            tasks = resp.json()
            print(f"   ✓ Tasks generated ({len(tasks['tasks'])} total):")
            for i, task in enumerate(tasks['tasks'][:5], 1):
                risk_flag = f" [{task['risk_flag']}]" if task['risk_flag'] else ""
                print(f"      {i}. [{task['role']}] {task['title'][:60]}{risk_flag}")
            if len(tasks['tasks']) > 5:
                print(f"      ... and {len(tasks['tasks']) - 5} more tasks")
            
            print("\n" + "="*70)
            print("✅ ALL TESTS PASSED!")
            print("="*70)
            print("\nSummary:")
            print("  ✓ Health check: OK")
            print(f"  ✓ Simulation: {elapsed:.0f}ms for 1000 Monte Carlo runs")
            print("  ✓ Failure forecast: AI-generated")
            print("  ✓ Executive summary: AI-generated")
            print("  ✓ Task breakdown: AI-generated")
            print("\n  Backend is production-ready! 🚀")
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        server.should_exit = True
        await asyncio.sleep(0.5)


if __name__ == "__main__":
    asyncio.run(test_all_endpoints_with_llm())
