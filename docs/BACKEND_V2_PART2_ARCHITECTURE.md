# KisaanBuddy Backend V2 — Part 2 Architecture Specification
## Scalability, Distributed State, Async Processing & Storage

---

## 1. ARCHITECTURE OVERVIEW

Part 2 transforms KisaanBuddy from a single-instance monolith into a **stateless, horizontally scalable modular monolith** backed by distributed Redis infrastructure, an asynchronous job processing queue, and persistent object storage.

```
                    ┌───────────────┐
                    │  Next.js 14   │
                    │   Frontend    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    FastAPI    │
                    │   Instances   │
                    └───────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
     PostgreSQL           Redis          Object Storage
   (Relational DB)     (State/Cache)     (Media Assets)
          │                 │
          │                 ↓
          │            Job Queue
          │                 │
          │          ┌──────┴──────┐
          │          ↓             ↓
          │       Worker 1      Worker 2
          │          │             │
          └──────────┴─────────────┘
```

---

## 2. CORE COMPONENT HIGHLIGHTS

1. **Distributed State & Redis Client (`backend/infrastructure/redis.py` & `backend/services/state_service.py`):**
   - Externalizes process-local `deque` and dictionaries to Redis with fallback to in-memory store.
2. **Telemetry Ingestion Engine (`backend/api/sensor.py`):**
   - Telemetry written to shared Redis state for hot dashboard queries, and deduplicated PostgreSQL `sensor_readings_history` table for cold analytics.
3. **Async Task Queue (`backend/services/job_service.py` & `backend/api/jobs.py`):**
   - Enqueues heavy AI crop analyses and TTS jobs with status polling (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`).
4. **Decoupled Object Storage (`backend/services/storage.py`):**
   - Offloads media binary payloads from PostgreSQL to S3 / local volume storage.
