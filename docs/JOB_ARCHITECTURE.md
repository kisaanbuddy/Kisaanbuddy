# KisaanBuddy Backend V2 — Asynchronous Job Architecture

---

## 1. ASYNC TASK PROCESSING ENGINE

Long-running, computationally expensive, or high-latency tasks (AI disease diagnosis, voice TTS synthesis) run off the main HTTP request loop using the `JobService` worker queue.

---

## 2. API ENDPOINTS

- `POST /api/jobs/submit`: Submits job request, returns `job_id` and HTTP 202 Accepted.
- `GET /api/jobs/{job_id}`: Polls current job status, execution progress, and result payload.

---

## 3. JOB LIFECYCLE & RETRY BEHAVIOR

```
[ PENDING ] ──► [ RUNNING ] ──► [ COMPLETED ]
                      │
                      └── (Failure) ──► Retries (1..3) ──► [ FAILED ]
```

- **Timeout Protection:** 30-second execution deadline per attempt.
- **Bounded Retries:** Maximum 3 attempts with exponential backoff (2s, 4s, 8s).
- **Persistence:** Job state persisted in Redis key `job:{job_id}` with 3-day TTL.
