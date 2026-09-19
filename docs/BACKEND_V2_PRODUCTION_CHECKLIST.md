# KisaanBuddy Backend V2 — Final Production Checklist

---

## 1. CONFIGURATION & SECRETS MANAGEMENT
- [x] `ENVIRONMENT=production` enforced in production environments.
- [x] Insecure default `JWT_SECRET` rejected when `DEBUG=false`.
- [x] Hardcoded `TWOFACTOR_API_KEY` default fallback removed.
- [x] CORS origin regex tightened to explicit subdomains (`r"^https:\/\/(kisaanbuddy|krishiai)(-[a-z0-9-]+)?\.vercel\.app$"`).

---

## 2. DATABASE & PERSISTENCE
- [x] Production SQLite usage strictly rejected (`ENVIRONMENT=production` requires PostgreSQL).
- [x] Connection pooling configured (`pool_size=20`, `max_overflow=10`, `pool_recycle=1800`, `pool_pre_ping=True`).
- [x] All foreign key columns indexed across models (`user_id`, `field_id`, `crop_id`, `uploaded_by`, `updated_by`).
- [x] Alembic migration scripts `001` through `005` in place and reversible.

---

## 3. DISTRIBUTED STATE & REDIS
- [x] `RedisClient` connection pooling with graceful in-memory fallback.
- [x] Session revocation token checks backed up by PostgreSQL `UserSession` table when Redis is offline.
- [x] Rate limiting counters key-scoped to 60-second windows.

---

## 4. STORAGE DECOUPLING
- [x] `StorageService` handles media asset offloading to S3 or local volume.
- [x] Binary payloads (`LargeBinary`) removed from SQL upload flows.

---

## 5. ASYNCHRONOUS WORKERS & QUEUES
- [x] Long-running AI crop check and TTS tasks pushed to Redis list `queue:tasks`.
- [x] Independent worker module `services.worker` handles execution with 30s timeout and bounded retries.

---

## 6. OBSERVABILITY & METRICS
- [x] Structured request logging with request ID headers (`X-Request-ID`, `X-Response-Time-MS`).
- [x] Secret & token redaction enforced on all log output.
- [x] Endpoints `/health/liveness`, `/health/readiness`, and `/health/metrics` active.
