"""
Load Testing Script for /simulate endpoint
Person D - DevOps / Glue Engineer
Phase 2 (Hours 2-6): Validate /simulate performance

Usage:
    python testing/load_test.py --endpoint http://localhost:8000/simulate --requests 100
    python testing/load_test.py --quick  # 50 requests
    python testing/load_test.py --stress  # 1000 requests
"""

import asyncio
import aiohttp
import time
import statistics
import argparse
from typing import List, Dict, Any
import json


DEFAULT_PAYLOAD = {
    "project_name": "Load Test Project",
    "description": "Testing /simulate performance",
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


async def send_request(
    session: aiohttp.ClientSession,
    url: str,
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    """Send single request and measure latency"""
    start = time.perf_counter()

    try:
        async with session.post(url, json=payload) as response:
            data = await response.json()
            end = time.perf_counter()

            return {
                "success": response.status == 200,
                "status_code": response.status,
                "latency_ms": (end - start) * 1000,
                "response_size_bytes": len(json.dumps(data))
            }
    except Exception as e:
        end = time.perf_counter()
        return {
            "success": False,
            "status_code": 0,
            "latency_ms": (end - start) * 1000,
            "error": str(e)
        }


async def run_load_test(
    endpoint: str,
    num_requests: int,
    payload: Dict[str, Any],
    concurrency: int = 10
) -> List[Dict[str, Any]]:
    """
    Run load test with specified concurrency

    Args:
        endpoint: API endpoint URL
        num_requests: Total number of requests to send
        payload: Request payload
        concurrency: Number of concurrent requests

    Returns:
        List of result dicts
    """
    results = []

    async with aiohttp.ClientSession() as session:
        # Create batches of concurrent requests
        for i in range(0, num_requests, concurrency):
            batch_size = min(concurrency, num_requests - i)
            tasks = [
                send_request(session, endpoint, payload)
                for _ in range(batch_size)
            ]

            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)

            # Progress indicator
            print(f"  [{i + batch_size}/{num_requests}] completed", end="\r")

    print()  # New line after progress
    return results


def analyze_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze load test results"""
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]

    if not successful:
        return {
            "error": "All requests failed",
            "failure_rate": 1.0,
            "total_requests": len(results)
        }

    latencies = [r["latency_ms"] for r in successful]

    return {
        "total_requests": len(results),
        "successful_requests": len(successful),
        "failed_requests": len(failed),
        "success_rate": len(successful) / len(results),
        "failure_rate": len(failed) / len(results),
        "latency_stats": {
            "min_ms": min(latencies),
            "max_ms": max(latencies),
            "mean_ms": statistics.mean(latencies),
            "median_ms": statistics.median(latencies),
            "p90_ms": statistics.quantiles(latencies, n=10)[8] if len(latencies) > 10 else max(latencies),
            "p95_ms": statistics.quantiles(latencies, n=20)[18] if len(latencies) > 20 else max(latencies),
            "p99_ms": statistics.quantiles(latencies, n=100)[98] if len(latencies) > 100 else max(latencies),
            "stdev_ms": statistics.stdev(latencies) if len(latencies) > 1 else 0
        }
    }


def print_report(analysis: Dict[str, Any]):
    """Print formatted test report"""
    print("\n" + "="*60)
    print("LOAD TEST REPORT")
    print("="*60)

    if "error" in analysis:
        print(f"❌ ERROR: {analysis['error']}")
        return

    print(f"\n📊 SUMMARY")
    print(f"  Total Requests:      {analysis['total_requests']}")
    print(f"  Successful:          {analysis['successful_requests']} ({analysis['success_rate']*100:.1f}%)")
    print(f"  Failed:              {analysis['failed_requests']} ({analysis['failure_rate']*100:.1f}%)")

    stats = analysis['latency_stats']
    print(f"\n⏱️  LATENCY (milliseconds)")
    print(f"  Min:                 {stats['min_ms']:.1f} ms")
    print(f"  Mean:                {stats['mean_ms']:.1f} ms")
    print(f"  Median:              {stats['median_ms']:.1f} ms")
    print(f"  P90:                 {stats['p90_ms']:.1f} ms")
    print(f"  P95:                 {stats['p95_ms']:.1f} ms")
    print(f"  P99:                 {stats['p99_ms']:.1f} ms")
    print(f"  Max:                 {stats['max_ms']:.1f} ms")
    print(f"  Std Dev:             {stats['stdev_ms']:.1f} ms")

    # Performance assessment
    print(f"\n✅ PERFORMANCE ASSESSMENT")
    if stats['p90_ms'] < 1000:
        print(f"  🟢 EXCELLENT: P90 latency under 1s ({stats['p90_ms']:.0f}ms)")
    elif stats['p90_ms'] < 2000:
        print(f"  🟡 ACCEPTABLE: P90 latency {stats['p90_ms']:.0f}ms (target: <1s)")
    else:
        print(f"  🔴 SLOW: P90 latency {stats['p90_ms']:.0f}ms (optimize Monte Carlo)")

    if analysis['success_rate'] == 1.0:
        print(f"  🟢 RELIABLE: 100% success rate")
    elif analysis['success_rate'] > 0.95:
        print(f"  🟡 MOSTLY RELIABLE: {analysis['success_rate']*100:.1f}% success rate")
    else:
        print(f"  🔴 UNSTABLE: {analysis['success_rate']*100:.1f}% success rate")

    print("="*60 + "\n")


async def main():
    parser = argparse.ArgumentParser(description="Load test PlanSight /simulate endpoint")
    parser.add_argument("--endpoint", default="http://localhost:8000/simulate", help="API endpoint URL")
    parser.add_argument("--requests", type=int, default=100, help="Number of requests")
    parser.add_argument("--concurrency", type=int, default=10, help="Concurrent requests")
    parser.add_argument("--quick", action="store_true", help="Quick test (50 requests)")
    parser.add_argument("--stress", action="store_true", help="Stress test (1000 requests)")

    args = parser.parse_args()

    # Adjust for quick/stress flags
    if args.quick:
        args.requests = 50
        args.concurrency = 5
    elif args.stress:
        args.requests = 1000
        args.concurrency = 20

    print(f"\n🚀 Starting load test...")
    print(f"  Endpoint:    {args.endpoint}")
    print(f"  Requests:    {args.requests}")
    print(f"  Concurrency: {args.concurrency}")
    print()

    start_time = time.perf_counter()
    results = await run_load_test(
        endpoint=args.endpoint,
        num_requests=args.requests,
        payload=DEFAULT_PAYLOAD,
        concurrency=args.concurrency
    )
    end_time = time.perf_counter()

    total_duration = end_time - start_time
    print(f"✓ Completed in {total_duration:.2f}s")

    analysis = analyze_results(results)
    analysis["total_duration_s"] = total_duration
    analysis["requests_per_second"] = args.requests / total_duration

    print_report(analysis)

    # Export to JSON for CI/CD
    with open("testing/load_test_results.json", "w") as f:
        json.dump(analysis, f, indent=2)
    print(f"📄 Results saved to testing/load_test_results.json")


if __name__ == "__main__":
    asyncio.run(main())
