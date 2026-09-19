"""KisaanBuddy Backend V2 — Reproducible Load Testing Harness.

Simulates realistic concurrent workloads (Lightweight API, DB-heavy history queries,
Sensor telemetry POSTs, and Async Job submissions) and outputs actual measured RPS,
p50, p95, p99 latencies, and error rates.
"""
from typing import Dict, Any, List, Tuple
import time
import math
import concurrent.futures
from fastapi.testclient import TestClient

import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app

client = TestClient(app)


def measure_endpoint(method: str, url: str, json_data: Dict = None, headers: Dict = None) -> Tuple[float, int]:
    """Executes a single HTTP request and measures latency and status code."""
    start = time.perf_counter()
    try:
        if method == "POST":
            res = client.post(url, json=json_data, headers=headers)
        else:
            res = client.get(url, headers=headers)
        duration_ms = (time.perf_counter() - start) * 1000.0
        return duration_ms, res.status_code
    except Exception:
        duration_ms = (time.perf_counter() - start) * 1000.0
        return duration_ms, 500


def get_percentile(samples: List[float], p: float) -> float:
    if not samples:
        return 0.0
    s = sorted(samples)
    idx = (len(s) - 1) * (p / 100.0)
    return round(s[int(idx)], 2)


def run_workload_benchmark(name: str, fn, total_requests: int = 1000, concurrency: int = 25) -> Dict[str, Any]:
    """Runs a concurrent load benchmark for a specific workload function."""
    print(f"--- Running Benchmark: {name} (Total: {total_requests}, Concurrency: {concurrency}) ---")
    start_time = time.perf_counter()

    latencies: List[float] = []
    errors = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(fn, i) for i in range(total_requests)]
        for future in concurrent.futures.as_completed(futures):
            duration_ms, status_code = future.result()
            latencies.append(duration_ms)
            if status_code >= 400:
                errors += 1

    total_duration_sec = time.perf_counter() - start_time
    rps = round(total_requests / total_duration_sec, 2)
    error_rate = round((errors / total_requests) * 100.0, 2)

    result = {
        "workload": name,
        "concurrency": concurrency,
        "total_requests": total_requests,
        "total_seconds": round(total_duration_sec, 2),
        "rps": rps,
        "error_rate_pct": error_rate,
        "p50_ms": get_percentile(latencies, 50),
        "p95_ms": get_percentile(latencies, 95),
        "p99_ms": get_percentile(latencies, 99),
    }

    print(f"Results: {rps} RPS | p50: {result['p50_ms']}ms | p95: {result['p95_ms']}ms | Error: {error_rate}%\n")
    return result


def main():
    print("=======================================================================")
    print(" KISAANBUDDY BACKEND V2 — REAL MEASURED CAPACITY LOAD TEST ")
    print("=======================================================================\n")

    # Workload A: Lightweight Readiness Probe
    def workload_a(i):
        return measure_endpoint("GET", "/health/readiness")

    # Workload B: Sensor Ingestion (15s telemetry stream)
    def workload_b(i):
        payload = {
            "device_id": f"load-node-{(i % 50) + 1}",
            "temperature": 27.5 + (i % 5),
            "humidity": 60.0 + (i % 10),
            "soil_temperature": 23.0,
            "soil_moisture": 50.0,
            "raw_moisture": 2000,
        }
        return measure_endpoint("POST", "/api/sensor/ingest", json_data=payload)

    # Workload C: Database Telemetry History Lookup
    def workload_c(i):
        dev_id = f"load-node-{(i % 50) + 1}"
        return measure_endpoint("GET", f"/api/sensor/history?device_id={dev_id}&limit=10")

    # Workload D: Async Job Submission & Polling
    def workload_d(i):
        payload = {"task_type": "crop_analysis", "payload": {"crop_name": "Wheat"}}
        dur1, status1 = measure_endpoint("POST", "/api/jobs/submit", json_data=payload)
        return dur1, status1

    results = []
    results.append(run_workload_benchmark("Workload A — Health & Readiness Probe", workload_a, total_requests=1000, concurrency=25))
    results.append(run_workload_benchmark("Workload B — IoT Telemetry Ingestion", workload_b, total_requests=1000, concurrency=25))
    results.append(run_workload_benchmark("Workload C — DB Telemetry History Queries", workload_c, total_requests=1000, concurrency=25))
    results.append(run_workload_benchmark("Workload D — Async Job Queue Submissions", workload_d, total_requests=500, concurrency=10))

    print("=======================================================================")
    print(" BENCHMARK SUMMARY TABLE ")
    print("=======================================================================")
    for r in results:
        print(f"{r['workload']:<40} | RPS: {r['rps']:<7} | p95: {r['p95_ms']}ms | Errors: {r['error_rate_pct']}%")


if __name__ == "__main__":
    main()
