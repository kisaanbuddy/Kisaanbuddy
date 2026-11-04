# KisaanBuddy — Deployment & Rollback Runbook
**Branch:** `feature/farmer-feedback-production-hardening`  
**Date:** November 2026  
**Audience:** DevOps, Release Management, Engineering On-Call  

---

## 1. Architecture & Hosting Topology
- **Frontend:** Next.js 14 App Router, hosted on Vercel or Node.js container cluster.
- **Backend:** FastAPI (Python 3.11+ / Uvicorn / Gunicorn), hosted on Render / AWS ECS.
- **Database:** PostgreSQL (Production) / SQLite (Development/Test), managed with SQLAlchemy migrations.
- **Object Storage / CDN:** Cloud storage for farmer crop photos and audio payloads.

---

## 2. Pre-Deployment Verification Checklist

Before initiating production deployment:
- [x] All 121 backend automated tests passing (`pytest backend/tests`).
- [x] Zero uncommitted debug or dummy fixtures in production branches.
- [x] Environment variables verified in production dashboard:
  - `SARVAM_API_KEY` (Configured)
  - `DATA_GOV_IN_API_KEY` (Configured)
  - `OPENWEATHER_API_KEY` (Configured)
  - `ENABLE_DEMO_WEATHER=False` (Strictly False)
  - `DEBUG=False` (Strictly False)
  - `SECRET_KEY` (Production cryptographic secret)
- [x] Backwards-compatible database schema changes confirmed (`language` column on `User` model defaults to `'en'`).

---

## 3. Step-by-Step Deployment Procedure

### Step 3.1: Database Migration
Apply schema updates (additive only; zero table locks):
```bash
cd backend
alembic upgrade head
```
*Note: The `language` column addition in `User` is nullable with a default value of `'en'`, allowing immediate rollback without schema conflict.*

### Step 3.2: Backend Deployment
Deploy the updated container image to the backend staging/production cluster:
1. Build and push production image:
   ```bash
   docker build -t krishiai-backend:hardening -f backend/Dockerfile .
   ```
2. Deploy image to cluster with zero-downtime rolling restart (minimum healthy instances = 2).
3. Validate backend health:
   ```bash
   curl -f https://api.kisaanbuddy.in/api/health
   ```

### Step 3.3: Frontend Deployment
1. Build frontend bundle:
   ```bash
   cd frontend-next
   npm run build
   ```
2. Trigger production deployment on Vercel:
   ```bash
   vercel --prod
   ```
3. Verify live endpoints:
   - Check landing page loads in Hindi and English.
   - Verify `/mandi` and `/contact` load correctly.

---

## 4. Rollback Procedure

If severe regressions occur during post-release smoke testing:

### 4.1 Frontend Rollback (< 2 minutes)
1. Navigate to Vercel Dashboard -> Deployments.
2. Select previous stable deployment hash and click **"Instant Rollback"** (or run `vercel rollback`).
3. Flush Cloudflare / CDN cache if enabled.

### 4.2 Backend Rollback (< 5 minutes)
1. In Render / AWS ECS, roll back deployment to previous image tag:
   ```bash
   aws ecs update-service --cluster krishiai-prod --service api --force-new-deployment --task-definition krishiai-backend:previous-stable
   ```
2. Verify rollback health check at `https://api.kisaanbuddy.in/api/health`.

### 4.3 Database Rollback Safety
- The additions introduced in this hardening release (`language` column on `User` and `FarmerProfile`) are completely backwards-compatible with the previous backend code.
- No schema rollback is required; previous backend versions simply ignore the new column.

---

## 5. Post-Deployment Smoke Tests
Execute the following manual verification steps immediately after rollout:
1. **Language Switching:** Open `/`, toggle from English to Hindi. Refresh page. Ensure Hindi persists.
2. **Support Ticket:** Visit `/contact`, submit a query, verify receipt of `KB-FB-XXXXX` ticket number.
3. **Mandi Prices:** Visit `/mandi`, query a district. Ensure no raw uncaught errors occur.
4. **Crop Doctor Uncertainty:** Query an unclassified symptom. Verify diagnostic engine returns honest KVK referral rather than default Wheat Rust.
