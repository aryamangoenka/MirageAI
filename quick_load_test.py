"""Quick load test for /simulate endpoint"""
import asyncio
import aiohttp
import time
import statistics


async def test_simulate():
    payload = {
        "project_name": "Load Test",
        "description": "Testing performance",
        "scope_size": "medium",
        "complexity": 3,
        "stack": "React + FastAPI",
        "deadline_weeks": 12,
        "team_junior": 1,
        "team_mid": 2,
        "team_senior": 1,
        "integrations": 3,
        "scope_volatility": 30,
        "num_simulations": 1000
    }

    latencies = []
    errors = 0

    async with aiohttp.ClientSession() as session:
        for i in range(50):
            start = time.perf_counter()
            try:
                async with session.post('http://localhost:8000/simulate', json=payload, timeout=10) as resp:
                    if resp.status == 200:
                        await resp.json()
                        latency = (time.perf_counter() - start) * 1000
                        latencies.append(latency)
                    else:
                        errors += 1
            except Exception as e:
                errors += 1

            if (i + 1) % 10 == 0:
                print(f"  [{i+1}/50] completed")

    if latencies:
        print(f"\n{'='*60}")
        print(f"LOAD TEST RESULTS")
        print(f"{'='*60}")
        print(f"Total Requests:  50")
        print(f"Successful:      {len(latencies)}")
        print(f"Failed:          {errors}")
        print(f"\nLatency (ms):")
        print(f"  Min:     {min(latencies):.1f} ms")
        print(f"  Mean:    {statistics.mean(latencies):.1f} ms")
        print(f"  Median:  {statistics.median(latencies):.1f} ms")
        print(f"  P90:     {statistics.quantiles(latencies, n=10)[8]:.1f} ms")
        print(f"  Max:     {max(latencies):.1f} ms")

        p90 = statistics.quantiles(latencies, n=10)[8]
        if p90 < 1000:
            print(f"\n✅ EXCELLENT: P90 latency {p90:.0f}ms (target: <1000ms)")
        else:
            print(f"\n⚠️  SLOW: P90 latency {p90:.0f}ms (target: <1000ms)")
        print(f"{'='*60}")


asyncio.run(test_simulate())
