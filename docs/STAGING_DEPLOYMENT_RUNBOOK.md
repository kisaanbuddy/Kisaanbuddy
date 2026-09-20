# KISAANBUDDY BACKEND V2 — CLOUD STAGING DEPLOYMENT RUNBOOK

**Target Environment:** Cloud Staging  
**Architecture:** Next.js (Vercel) → FastAPI API (Render Web Service) → PostgreSQL (Managed DB) + Redis (Managed Cache) + S3 (AWS S3 Media) + Independent Worker (Render Background Worker)  
**Date:** September 20, 2026  
**Document Version:** 1.0 (Staging Deployment Guide)

---

## 1. TARGET STAGING ARCHITECTURE

```text
                                INTERNET
                                   |
                                   v
                          +------------------+
                          | Vercel           |
                          | Next.js Frontend |
                          +--------+---------+
                                   |
                                   | HTTPS
                                   v
                          +------------------+
                          | Render           |
                          | FastAPI API      |
                          +--------+---------+
                                   |
              +--------------------+--------------------+
              |                    |                    |
              v                    v                    v
         PostgreSQL              Redis                 S3
      Managed Database        Managed Redis           AWS S3
                                   |
                                   v
                          +------------------+
                          | Render Worker    |
                          | services.worker  |
                          +------------------+
```

---

## 2. PRODUCTION & STAGING ENVIRONMENT VARIABLE MATRIX

The following variables must be configured in the Render & Vercel Staging Environment dashboards.

| Variable | Purpose | Required? | Target Service | Secret / Public | Safe Example Value | Failure Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Defines deployment mode | Yes | API & Worker | Public | `staging` | Defaults to `development` |
| `DEBUG` | Disables debug mode & tracebacks | Yes | API & Worker | Public | `false` | Enables tracebacks if true |
| `DATABASE_URL` | PostgreSQL connection string | Yes | API & Worker | Secret | `postgresql+psycopg2://user:pass@db.host:5432/dbname` | Fatal engine startup error |
| `REDIS_URL` | Managed Redis connection string | Yes | API & Worker | Secret | `redis://default:pass@redis.host:6379/0` | DB session fallback / Queue error |
| `JWT_SECRET` | HS256 JWT token signing key | Yes | API & Worker | Secret | `<64-char-secure-random-string>` | Fatal fail-fast error on startup |
| `JWT_ALGORITHM` | Algorithm for JWT tokens | No | API & Worker | Public | `HS256` | Defaults to `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Token validity period | No | API & Worker | Public | `1440` | Defaults to 1440 (24 hours) |
| `STORAGE_PROVIDER` | Media storage mode (`s3`/`local`) | Yes | API | Public | `s3` | Defaults to `local` storage |
| `S3_BUCKET_NAME` | AWS S3 bucket name | Yes (if S3) | API | Public | `kisaanbuddy-staging-media` | Falls back to local disk storage |
| `AWS_ACCESS_KEY_ID` | IAM User Access Key | Yes (if S3) | API | Secret | `AKIAIOSFODNN7EXAMPLE` | S3 upload failure (local fallback) |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Key | Yes (if S3) | API | Secret | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | S3 upload failure (local fallback) |
| `AWS_REGION` | AWS Region | Yes (if S3) | API | Public | `ap-south-1` | AWS SDK default region error |
| `TWOFACTOR_API_KEY` | 2Factor SMS Gateway API Key | Optional | API | Secret | `<2factor-api-key>` | Logs warning, mock OTP fallback |
| `GEMINI_API_KEY` | Google Gemini AI API Key | Optional | API | Secret | `<gemini-api-key>` | Offline rule-based AI response |
| `SENSOR_INGEST_TOKEN` | Auth token for IoT devices | Yes | API | Secret | `<secure-sensor-token>` | Rejects telemetry with 401 |
| `ADMIN_EMAILS` | Comma-separated admin emails | Yes | API | Public | `admin@kisaanbuddy.com` | Promotes designated admins on login |
| `NEXT_PUBLIC_API_URL` | API base URL for Next.js | Yes | Frontend | Public | `https://kisaanbuddy-api-staging.onrender.com` | Rewrites default to localhost |

> **SECURITY NOTICE:** Never commit real secret values to Git. All secrets must be injected securely via platform dashboard secret settings (Render Environment / Vercel Environment Variables).

---

## 3. STEP-BY-STEP STAGING DEPLOYMENT RUNBOOK

Follow this exact execution sequence when launching to the cloud staging environment.

### Step 1: Provision Managed PostgreSQL
1. Create a Managed PostgreSQL 15 database instance on Render or AWS RDS.
2. Note the connection URI: `postgresql://<user>:<password>@<db_host>:5432/<db_name>`.
3. Verify network accessibility and connection credentials using `psql` or database client.

### Step 2: Provision Managed Redis
1. Create a Managed Redis 7 instance on Render, Redis Cloud, or AWS ElastiCache.
2. Note the Redis URL: `redis://:<password>@<redis_host>:6379/0` (or `rediss://` for TLS).
3. Test connectivity with `redis-cli ping`.

### Step 3: Provision AWS S3 Storage Bucket
1. Create an S3 bucket named `kisaanbuddy-staging-media` in `ap-south-1`.
2. Disable "Block all public access" selectively or apply a bucket policy allowing public GET access to `uploads/*` objects while keeping PUT/DELETE restricted.
3. Create an AWS IAM user (`kisaanbuddy-staging-s3-user`) with programmatic access and attach an inline policy granting `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on `arn:aws:s3:::kisaanbuddy-staging-media/*`.
4. Generate and save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

### Step 4: Configure Staging Environment Variables
1. In Render, create an **Environment Group** named `kisaanbuddy-staging-env`.
2. Add all environment variables from Section 2 with their secret values.
3. In Vercel, navigate to `frontend-next` project settings → Environment Variables and add `NEXT_PUBLIC_API_URL = https://kisaanbuddy-api-staging.onrender.com`.

### Step 5: Execute Database Migrations
1. Open a temporary shell or one-off job container connected to the managed PostgreSQL database.
2. Run Alembic schema migration:
   ```bash
   alembic upgrade head
   ```
3. Confirm migration completion and verify that `alembic_version` table contains revision `005`.

### Step 6: Deploy FastAPI API Web Service
1. In Render, create a new **Web Service** connected to the GitHub repository.
2. Configuration:
   - **Environment:** Docker
   - **Dockerfile Path:** `Dockerfile`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4`
   - **Health Check Path:** `/health/readiness`
3. Attach `kisaanbuddy-staging-env` Environment Group.
4. Trigger manual or automatic deployment.

### Step 7: Verify API Liveness
1. Perform HTTP request to the deployed API liveness probe:
   ```bash
   curl -i https://kisaanbuddy-api-staging.onrender.com/health/liveness
   ```
2. Verify HTTP response `200 OK` with JSON payload `{"status": "ok"}`.

### Step 8: Verify API Readiness
1. Perform HTTP request to the readiness probe:
   ```bash
   curl -i https://kisaanbuddy-api-staging.onrender.com/health/readiness
   ```
2. Verify HTTP response `200 OK` with JSON payload showing database (`postgres: ok`) and Redis (`redis: ok`) connectivity.

### Step 9: Deploy Background Worker Service
1. In Render, create a new **Background Worker** service connected to the same repository.
2. Configuration:
   - **Environment:** Docker
   - **Dockerfile Path:** `Dockerfile`
   - **Start Command:** `python -m services.worker`
3. Attach the same `kisaanbuddy-staging-env` Environment Group.
4. Deploy the worker process.

### Step 10: Verify Background Worker Logs
1. Open Render Background Worker service logs.
2. Verify startup log entry:
   `[INFO] krishiai.worker: Independent Worker Process started. Listening on queue:tasks...`

### Step 11: Deploy Frontend Staging to Vercel
1. Connect `frontend-next` root directory to Vercel project.
2. Ensure `NEXT_PUBLIC_API_URL` points to `https://kisaanbuddy-api-staging.onrender.com`.
3. Trigger deployment and verify build completion.

### Step 12: Verify Frontend → Staging API Connectivity
1. Open the deployed staging Vercel URL in browser.
2. Inspect network tab and confirm API calls route to `https://kisaanbuddy-api-staging.onrender.com`.

### Step 13: Run Authentication Staging Test
1. Execute OTP registration flow on staging frontend/API.
2. Complete login and inspect response headers to confirm `HttpOnly`, `SameSite=Lax`, and `Secure` cookie flags.
3. Test logout endpoint and verify session token revocation.

### Step 14: Run Sensor Telemetry Staging Test
1. Send HTTP POST telemetry request to `/api/sensor/ingest`:
   ```bash
   curl -X POST https://kisaanbuddy-api-staging.onrender.com/api/sensor/ingest \
     -H "Content-Type: application/json" \
     -H "X-Sensor-Token: <your-staging-sensor-token>" \
     -d '{"device_id": "STAGING-DEV-001", "moisture": 45.2, "temperature": 28.5, "ph": 6.8}'
   ```
2. Verify `200 OK` response. Send duplicate request within 5 seconds and verify deduplication response (`status: skipped`).

### Step 15: Run Async Job Staging Test
1. Submit an async crop analysis job via POST `/api/jobs/submit`:
   ```bash
   curl -X POST https://kisaanbuddy-api-staging.onrender.com/api/jobs/submit \
     -H "Content-Type: application/json" \
     -d '{"task_type": "crop_analysis", "payload": {"crop_name": "Wheat"}}'
   ```
2. Receive `202 Accepted` with `job_id`.
3. Poll job status GET `/api/jobs/<job_id>` until worker completes execution (`status: COMPLETED`).

### Step 16: Run Media Upload Staging Test
1. Upload an image asset to POST `/api/media/upload`.
2. Verify `200 OK` response returning S3 public URL (`https://kisaanbuddy-staging-media.s3.amazonaws.com/uploads/...`).
3. Verify file accessibility via HTTP GET request.

### Step 17: Run Staging Failure Resilience Tests
1. **Redis Interruption:** Temporarily pause Redis connection and verify that `/api/auth/me` falls back to database lookup without throwing 500 errors.
2. **Worker Restart:** Terminate worker process while a job is queued; verify job remains in Redis `queue:tasks` and resumes upon worker restart.

### Step 18: Record Staging Results & Sign-Off
1. Document test execution timestamps, latencies, and outcomes.
2. Confirm zero regressions before scheduling production release.

---

## 4. STAGING SMOKE-TEST CHECKLIST

```text
[ ] 1. Authentication Flow: Register → OTP → Login → Authenticated Route → Session Revocation
[ ] 2. IoT Telemetry Flow: Ingest payload → 5s Redis Dedup → Hot Cache → DB History append
[ ] 3. Async Task Flow: Job Submit (202) → Redis Queue → Worker Execution → Status Poll (COMPLETED)
[ ] 4. Object Storage Flow: Image Upload → AWS S3 Persistence → DB URL Metadata → Retrieval
[ ] 5. Health Probes: /health/liveness (200 OK), /health/readiness (200 OK with DB + Redis)
```

---

## 5. RESILIENCE & FAILURE TEST PROCEDURES

### 5.1 Redis Outage Test
* **Action:** Simulate Redis network partition or restart.
* **Expected Outcome:** StateService automatically queries PostgreSQL `UserSession` table; authentication continues functioning seamlessly. Telemetry ingestion falls back to direct DB append.

### 5.2 Worker Process Crash Test
* **Action:** Send SIGKILL to the background worker process during active job processing.
* **Expected Outcome:** Unacknowledged job remains in Redis queue or dead-letter queue. Worker process auto-restarts and picks up next task without state loss.

### 5.3 Database Connection Pool Exhaustion Test
* **Action:** Issue high-concurrency requests exceeding base `DB_POOL_SIZE`.
* **Expected Outcome:** SQLAlchemy `max_overflow` (20) accommodates burst traffic. Connection pool pre-ping handles recycled socket connections gracefully.

---

*End of Staging Deployment Runbook.*
