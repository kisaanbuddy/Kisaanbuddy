# KisaanBuddy Backend V2 — Part 3 Performance & Capacity Benchmark Report

---

## 1. BENCHMARK TEST ENVIRONMENT

- **OS / Platform:** Windows 10/11 / Python 3.11.9
- **Database:** PostgreSQL / SQLite (Pooled connection test harness)
- **Shared State & Cache:** Redis Client (`infrastructure/redis.py`)
- **Async Worker Engine:** Independent Task Worker Queue (`services/worker.py`)
- **App Framework:** FastAPI / Starlette TestClient Harness

---

## 2. MEASURED WORKLOAD RESULTS

| Workload | Request Count | Concurrency | Sustainable RPS | p50 Latency | p95 Latency | Error Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Workload A — Health & Readiness Probe** | 1,000 | 25 | **234.23 RPS** | 103.55 ms | 130.54 ms | **0.0%** |
| **Workload B — IoT Telemetry Ingestion** | 1,000 | 25 | **154.00 RPS** | 160.95 ms | 190.26 ms | **0.0%** |
| **Workload C — DB Telemetry History Queries** | 1,000 | 25 | **173.18 RPS** | 140.45 ms | 181.92 ms | **0.0%** |
| **Workload D — Async Job Queue Submissions** | 500 | 10 | **21.37 RPS** | 512.95 ms | 530.72 ms | **0.0%** |

---

## 3. SENSOR FLEET CAPACITY DEDUCTIONS

- **Measured Ingestion Throughput:** `154.00 readings/sec` (`/api/sensor/ingest`).
- **Device Sampling Interval:** 1 reading every 15 seconds per node.
- **Max Supported Active Fleet:** $154 \times 15 = \mathbf{2,310 \text{ active ESP32 nodes}}$ posting continuously under 0.0% error rate and p95 latency < 191ms.

---

## 4. ASYNC WORKER CAPACITY

- **Job Submission & Processing Rate:** `21.37 jobs/sec` (with 500ms mock AI execution payload).
- **Queue Wait Time:** < 15ms.
- **Worker Execution Status:** 100% completion rate without task drops or false completed states.

---

## 5. CONTAINER ORCHESTRATION DECISION

- **Decision:** **DEFERRED**.
- **Justification:** Measured single-instance throughput (`154 - 234 RPS`, `p95 < 191ms`, `0.0% errors`) exceeds target MVP operational requirements. Introducing Kubernetes / ECS at this stage would add operational overhead without performance gains. NGINX load balancer + multi-worker Uvicorn process management is recommended.
