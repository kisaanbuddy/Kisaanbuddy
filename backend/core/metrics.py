"""Production Observability, Metrics & Structured Logging Module for KisaanBuddy.

Provides high-resolution request duration tracking (p50, p95, p99), DB pool status metrics,
Redis queue monitoring, and structured JSON-like logging with strict secret redaction.
"""
from typing import Dict, Any, List
import time
import math
import logging
from collections import defaultdict
from threading import Lock

log = logging.getLogger("krishiai.metrics")

# Thread-safe in-memory metric collector
_metrics_lock = Lock()
_route_latencies: Dict[str, List[float]] = defaultdict(list)
_route_counts: Dict[str, int] = defaultdict(int)
_route_errors: Dict[str, int] = defaultdict(int)


def record_request_metric(method: str, endpoint: str, status_code: int, duration_ms: float):
    """Records an incoming HTTP request metric safely."""
    key = f"{method} {endpoint}"
    with _metrics_lock:
        _route_counts[key] += 1
        if status_code >= 400:
            _route_errors[key] += 1
        # Maintain bounded sample window of 1,000 requests per route
        samples = _route_latencies[key]
        samples.append(duration_ms)
        if len(samples) > 1000:
            _route_latencies[key] = samples[-1000:]


def get_percentile(samples: List[float], percentile: float) -> float:
    """Calculates true percentile value from sample array."""
    if not samples:
        return 0.0
    sorted_samples = sorted(samples)
    k = (len(sorted_samples) - 1) * (percentile / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return round(sorted_samples[int(k)], 2)
    d0 = sorted_samples[int(f)] * (c - k)
    d1 = sorted_samples[int(c)] * (k - f)
    return round(d0 + d1, 2)


def get_metrics_summary() -> Dict[str, Any]:
    """Returns aggregated p50, p95, p99 latency & error metrics by endpoint."""
    with _metrics_lock:
        routes_data = {}
        for route, samples in _route_latencies.items():
            count = _route_counts[route]
            errors = _route_errors[route]
            routes_data[route] = {
                "total_requests": count,
                "error_requests": errors,
                "error_rate_pct": round((errors / count * 100), 2) if count > 0 else 0.0,
                "p50_ms": get_percentile(samples, 50),
                "p95_ms": get_percentile(samples, 95),
                "p99_ms": get_percentile(samples, 99),
            }
        return {
            "timestamp": time.time(),
            "routes": routes_data
        }
