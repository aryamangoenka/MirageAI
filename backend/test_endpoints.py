"""
Quick integration test for all endpoints.
"""

import asyncio
import httpx
import uvicorn
from main import app


async def test_all_endpoints():
    """Test all API endpoints."""
    
    config = uvicorn.Config(app, host='127.0.0.1', port=8000, log_level='error')
    server = uvicorn.Server(config)
    
    server_task = asyncio.create_task(server.serve())
    await asyncio.sleep(1)
    
    try:
        async with httpx.AsyncClient() as client:
            print("Testing PlanSight API Endpoints\n" + "="*50)
            
            # 1. Health check
            print("\n1. GET /health")
            resp = await client.get('http://127.0.0.1:8000/health')
            print(f"   Status: {resp.status_code}")
            print(f"   Response: {resp.json()}")
            assert resp.status_code == 200
            
            # 2. Simulate
            print("\n2. POST /simulate")
            sim_req = {
                'project_name': 'E-commerce Platform',
                'description': 'A full-stack e-commerce platform with payment integration',
                'scope_size': 'large',
                'complexity': 4,
                'stack': 'React + Node',
                'deadline_weeks': 12,
                'team_junior': 2,
                'team_mid': 2,
                'team_senior': 1,
                'integrations': 3,
                'scope_volatility': 60,
                'num_simulations': 1000
            }
            resp = await client.post('http://127.0.0.1:8000/simulate', json=sim_req, timeout=10.0)
            print(f"   Status: {resp.status_code}")
            result = resp.json()
            print(f"   P50: {result['p50_weeks']}w, P90: {result['p90_weeks']}w")
            print(f"   On-time probability: {result['on_time_probability']:.1%}")
            print(f"   Team stress: {result['team_stress_index']}/100")
            print(f"   Cost: ${result['p50_cost']:,.0f} - ${result['p90_cost']:,.0f}")
            print(f"   Histogram buckets: {len(result['histogram'])}")
            assert resp.status_code == 200
            
            # 3. Failure forecast
            print("\n3. POST /failure-forecast")
            resp = await client.post('http://127.0.0.1:8000/failure-forecast', json=sim_req, timeout=15.0)
            print(f"   Status: {resp.status_code}")
            result = resp.json()
            print(f"   Failure story ({len(result['failure_story'])} points):")
            for story in result['failure_story'][:2]:
                print(f"     - {story}")
            print(f"   Mitigations ({len(result['mitigations'])} items):")
            for mitigation in result['mitigations'][:2]:
                print(f"     - {mitigation}")
            assert resp.status_code == 200
            
            # 4. Executive summary
            print("\n4. POST /executive-summary")
            exec_req = {
                'project_name': 'E-commerce Platform',
                'description': 'A full-stack e-commerce platform',
                'stack': 'React + Node',
                'p50_weeks': 15.5,
                'p90_weeks': 22.3,
                'on_time_probability': 0.35,
                'p50_cost': 155000,
                'p90_cost': 223000,
                'currency': 'USD',
                'risk_scores': {
                    'integration': 45,
                    'team_imbalance': 50,
                    'scope_creep': 60,
                    'learning_curve': 40
                },
                'role_allocation': {'fe': 0.40, 'be': 0.45, 'devops': 0.15}
            }
            resp = await client.post('http://127.0.0.1:8000/executive-summary', json=exec_req, timeout=15.0)
            print(f"   Status: {resp.status_code}")
            result = resp.json()
            print(f"   Summary: {result['summary_text'][:150]}...")
            assert resp.status_code == 200
            
            # 5. Task breakdown
            print("\n5. POST /task-breakdown")
            task_req = {
                'project_name': 'E-commerce Platform',
                'description': 'A full-stack e-commerce platform',
                'stack': 'React + Node',
                'p50_weeks': 15.5,
                'p90_weeks': 22.3,
                'risk_scores': {
                    'integration': 45,
                    'team_imbalance': 50,
                    'scope_creep': 60,
                    'learning_curve': 40
                }
            }
            resp = await client.post('http://127.0.0.1:8000/task-breakdown', json=task_req, timeout=15.0)
            print(f"   Status: {resp.status_code}")
            result = resp.json()
            print(f"   Tasks ({len(result['tasks'])} total):")
            for i, task in enumerate(result['tasks'][:3], 1):
                print(f"     {i}. [{task['role']}] {task['title']}")
                if task.get('risk_flag'):
                    print(f"        Risk: {task['risk_flag']}")
            assert resp.status_code == 200
            
            print("\n" + "="*50)
            print("✓ All endpoints passed!")
            
    finally:
        server.should_exit = True
        await asyncio.sleep(0.5)


if __name__ == "__main__":
    asyncio.run(test_all_endpoints())
