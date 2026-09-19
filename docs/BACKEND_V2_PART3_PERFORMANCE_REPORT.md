# KisaanBuddy Backend V2 — Performance & Capacity Benchmark Audit Report

---

## 1. BENCHMARK METHODOLOGY & TEST ENVIRONMENT

### Test Environment & Execution Profile
- **Test Runner:** `loadtest/loadtest_runner.py` using FastAPI `TestClient` (in-process ASGI transport via `httpx`).
- **Concurrency Model:** ThreadPoolExecutor simulating concurrent HTTP client threads.
- **Host System:** Windows 10/11, Python 3.11.9, local SQLite/PostgreSQL pool.
- **Scope Note:** Benchmarks measure in-process application & ORM throughput. They do NOT include physical network interface overhead or public Internet latency.

---

## 2. DIRECTLY MEASURED BENCHMARK RESULTS

| Endpoint / Workload | Method | Request Count | Concurrency | Sustainable RPS | p50 Latency | p95 Latency | Error Rate | Benchmark Scope |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Readiness Endpoint Throughput** | `GET /health/readiness` | 1,000 | 25 | **234.23 RPS** | 103.55 ms | 130.54 ms | **0.0%** | Directly Measured |
| **IoT Telemetry Ingestion Endpoint** | `POST /api/sensor/ingest` | 1,000 | 25 | **154.00 RPS** | 160.95 ms | 190.26 ms | **0.0%** | Directly Measured |
| **Telemetry History Queries** | `GET /api/sensor/history` | 1,000 | 25 | **173.18 RPS** | 140.45 ms | 181.92 ms | **0.0%** | Directly Measured |
| **Async Job Queue Submissions** | `POST /api/jobs/submit` | 500 | 10 | **21.37 RPS** | 512.95 ms | 530.72 ms | **0.0%** | Directly Measured |

---

## 3. MATHEMATICALLY EXTRAPOLATED FLEET CAPACITY

- **Directly Measured Ingestion Rate:** `154.00 readings/sec` on `/api/sensor/ingest`.
- **Configured ESP32 Node Sampling Interval:** 1 reading every 15 seconds per node (`POST_INTERVAL_MS = 15000`).
- **Mathematical Extrapolation:**  
  $$154.00 \text{ readings/sec} \times 15 \text{ seconds} = \mathbf{2,310 \text{ devices}}$$
- **Precise Classification:** This 2,310 figure is a **mathematical extrapolation** based on single-process endpoint throughput rather than a directly endurance-tested physical device fleet.

---

## 4. ARCHITECTURALLY VERIFIED PROPERTIES

- **Horizontal Scalability:** Application state (sessions, rate limits, live telemetry) is externalized to Redis and PostgreSQL. The application does not depend on process-local shared state, making it architecturally scalable across multiple FastAPI instances. Multi-instance network load balancing remains unmeasured.
- **Session Revocation Fallback:** When Redis is unconfigured or unreachable, `StateService.is_session_revoked()` falls back to PostgreSQL database queries (`UserSession.is_revoked`), preventing insecure per-process memory fallbacks.
- **Asynchronous Worker Queue:** Tasks pushed to Redis list `queue:tasks` and consumed by independent worker (`services.worker`). Tasks feature 30-second execution deadlines and max 3 retries with exponential backoff.

---

## 5. KNOWN WORKER ARCHITECTURAL BOTTLENECKS

- **Serial Worker Execution:** Single worker process handles jobs serially. Under mock 500ms AI tasks, single-worker processing yields ~21.37 jobs/sec. Scaling to multiple worker processes (`python -m services.worker` multi-process pool) is recommended for increased async task throughput.

---

## 6. UNTESTED / UNVERIFIED PROPERTIES

- **Long-Duration Endurance:** Multi-day continuous heavy load soak tests.
- **Physical Network Latency:** Real cellular/WiFi network latency and SSL/TLS handshake overhead from ESP32 hardware.
- **Cloud Infrastructure Scale:** AWS S3 multi-region bucket upload latencies under high concurrency.
