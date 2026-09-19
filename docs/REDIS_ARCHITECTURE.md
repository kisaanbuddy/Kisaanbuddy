# KisaanBuddy Backend V2 — Redis Architecture & Caching Specification

---

## 1. REDIS ROLE & TOPOLOGY

Redis acts as a high-performance **shared state & cache layer** sitting between the stateless FastAPI application instances and the PostgreSQL database.

```
FastAPI Instance 1     FastAPI Instance 2     FastAPI Instance 3
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                       Redis Shared Instance
             ┌─────────────────┼─────────────────┐
             ↓                 ↓                 ↓
       State Store        Cache Store       Async Queue
```

---

## 2. NAMESPACE PREFIXES & TTL SPECIFICATION

| Prefix | Pattern | Purpose | TTL | Invalidation Strategy | Fallback Behavior |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `sensor:latest:` | `sensor:latest:{device_id}` | Newest telemetry JSON per ESP32 node | 7 Days | Overwritten on POST | Fallback to in-memory deque |
| `sensor:history:` | `sensor:history:{device_id}` | Recent telemetry deque list per device | 7 Days | Overwritten on POST | Fallback to PostgreSQL |
| `session:revoked:` | `session:revoked:{token}` | Blacklisted session tokens | 30 Days | Expired automatically | Query `UserSession.is_revoked` DB |
| `job:` | `job:{job_id}` | Async task payload, status & result | 3 Days | Expired automatically | DB / Task log |
| `weather:` | `weather:{lat}:{lon}` | Weather provider API response | 15 Min | Expired automatically | Fetch from weather orchestrator |
| `mandi:` | `mandi:{market}:{crop}` | Mandi commodity price response | 1 Hour | Expired automatically | Query Mandi API |
| `ratelimit:` | `ratelimit:{ip}:{window}` | Counter for rate limiting per IP | 60 Sec | Expired automatically | Permit request |

---

## 3. RESILIENCE & FAILURE DEGRADATION

If Redis becomes unreachable:
1. `RedisClient` catches socket errors and automatically switches to process-local in-memory fallback.
2. Database requests and authentication validation continue without interruption.
3. `/health/readiness` probe reports degradation but keeps service active.
