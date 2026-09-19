# KisaanBuddy Backend V2 — Part 3 Architecture Baseline Specification

---

## 1. COMPONENT TOPOLOGY

```
                        ┌───────────────┐
                        │   Next.js 14  │
                        │    Frontend   │
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ NGINX / ALB   │
                        │ Load Balancer │
                        └───────┬───────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ↓                     ↓                     ↓
    FastAPI Node 1        FastAPI Node 2        FastAPI Node N
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ↓                     ↓                     ↓
     PostgreSQL               Redis              StorageService
   (Relational DB)       (State & Queue)         (S3 / Volume)
          │                     │
          │                     ▼
          │               `queue:tasks`
          │                     │
          │            ┌────────┴────────┐
          │            ↓                 ↓
          │        Worker 1          Worker N
          │
          └───────────────────────────────────────────► External APIs
                                                        (Weather / Gemini / 2Factor)
```

---

## 2. COMPONENT METRICS INVENTORY

| Component | Technology | Primary Function | Monitored Metric | Target Metric |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway / App** | FastAPI / Uvicorn | RESTful API execution & validation | Latency (p50, p95, p99), RPS, HTTP status error rates | p95 < 200ms, Error rate < 0.1% |
| **Database Pool** | PostgreSQL / SQLAlchemy | Relational storage & history | Connection pool saturation, active connections, query latency | Pool utilization < 80% |
| **Cache & Shared State** | Redis | Ephemeral session revocation, rate-limits & hot telemetry | Memory usage, command latency, queue depth (`queue:tasks`) | Latency < 5ms, queue backlog < 50 |
| **Background Worker** | Python Async Worker (`services.worker`) | AI inference, TTS voice generation, heavy computation | Job execution time, queue wait time, failure rate | Execution time < 30s |
| **Media Storage** | S3 / Local Storage | Image & audio asset delivery | Upload latency, storage capacity | Upload < 1.0s |
