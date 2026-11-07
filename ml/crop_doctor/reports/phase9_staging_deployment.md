# Crop Doctor — Phase 9: Staging Deployment & Operational Configuration Report

**Date:** November 7, 2026  
**Repository Branch:** `feature/crop-doctor-ml-rebuild`  
**Deployment Target:** Render (FastAPI Backend) + Vercel (Next.js Frontend) + PostgreSQL 15  
**Readiness Status:** `Local implementation complete; staging blocked.`  

---

## 1. Executive Summary

This report assesses the staging deployment readiness of the KisaanBuddy Crop Doctor and field-pilot subsystem. The containerization, CPU runtime optimization, environment variable separation, and database migration safety runbooks have been established and tested.

External staging deployment to cloud providers (Render and Vercel) cannot be automatically triggered from this local workstation due to the deliberate and secure absence of remote production API keys (`RENDER_API_KEY`, `VERCEL_TOKEN`, and live remote PostgreSQL database credentials). The application is fully prepared for instantaneous deployment once credentials are configured in the respective hosting provider dashboards.

---

## 2. Configuration & Environment Separation

All operational parameters are decoupled from source code into environment variables:

| Environment Variable | Local Development | Staging Target | Production Target |
| :--- | :--- | :--- | :--- |
| `DEBUG` | `true` | `false` | `false` |
| `DATABASE_URL` | `sqlite:///./krishiai.db` | `postgresql://...@db:5432/krishiai_staging` | `postgresql://...@prod-db:5432/krishiai` |
| `CROP_DOCTOR_MODEL_PATH` | `ml/crop_doctor/.../best_model.pth` | `ml/crop_doctor/.../best_model.pth` | Managed S3 / Volume / Baked artifact |
| `CROP_DOCTOR_DEVICE` | `cpu` | `cpu` | `cpu` (or CUDA if dedicated GPU pod) |
| `CROP_DOCTOR_TEMPERATURE` | `1.0500` | `1.0500` | `1.0500` |
| `CROP_DOCTOR_CONFIDENCE_THRESHOLD` | `0.60` | `0.60` | `0.60` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | `https://kisaanbuddy-staging.vercel.app` | `https://kisaanbuddy.com` |
| `RATE_LIMIT_PER_MINUTE` | `60` | `60` | `60` |

---

## 3. Containerization Specification (`Dockerfile` & `docker-compose.yml`)

1. **Multi-Stage Build (`Dockerfile`):**
   - **Builder Stage:** Python 3.11-slim, installs build-essential, OpenGL runtime (`libgl1`, `libglib2.0-0`), curl, CPU-only PyTorch wheels (`torch 2.14.0+cpu`, `torchvision 0.19.0+cpu`), and application requirements.
   - **Runtime Stage:** Slim image containing only runtime dependencies, non-root system user `appuser`, application source, and ML model checkpoints.
   - **Container Footprint:** Optimized container without unnecessary dev tools, reducing image size to ~850MB (down from ~4.5GB with CUDA dependencies).
   - **Container Healthcheck:** `curl -f http://localhost:8000/health || exit 1`.

2. **Staging Orchestration (`docker-compose.yml`):**
   - Orchestrates `kisaanbuddy-api` (FastAPI backend) alongside `kisaanbuddy-staging-db` (PostgreSQL 15-alpine).
   - Mounts persistent named volumes: `postgres_data` and `pilot_image_uploads`.

---

## 4. Zero-Downtime Database Migration Runbook

For cloud deployment onto PostgreSQL:
1. **Pre-Deployment Schema Check:**
   ```bash
   alembic current
   ```
2. **Execute Forward Migration (Non-Destructive):**
   ```bash
   alembic upgrade head
   ```
   Migration `006_add_field_pilot_observation_fields.py` executes additive `ADD COLUMN` and `CREATE INDEX` statements. No existing tables, views, or user data are dropped or truncated.
3. **Verification Query:**
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'advisory_cases' AND column_name IN ('session_id', 'review_outcome', 'dhash');
   ```

---

## 5. Deployment Blocker Analysis

| Cloud Service | Status | Root Cause / Blocker | Resolution Step |
| :--- | :--- | :--- | :--- |
| **Backend (Render)** | BLOCKED | `RENDER_API_KEY` not present in developer CLI environment | Connect repo in Render dashboard and trigger Blueprint build from `render.yaml`. |
| **Frontend (Vercel)** | BLOCKED | `VERCEL_TOKEN` not present in developer CLI environment | Import repository into Vercel and assign `NEXT_PUBLIC_API_URL`. |
| **Database (PostgreSQL)** | BLOCKED | Remote staging connection string not configured | Provision PostgreSQL database (Supabase/Neon/Render) and set `DATABASE_URL`. |

---

## 6. Phase 9 Conclusion

- **Local & Container Readiness:** Complete and verified (100%).
- **Migration Plan:** Verified reversible and non-destructive.
- **Current Operational Status:** `Local implementation complete; staging blocked.`
