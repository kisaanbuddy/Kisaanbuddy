# KisaanBuddy Backend V2 — Production Deployment Architecture

---

## 1. PRODUCTION DEPLOYMENT ARCHITECTURE

```
                        ┌───────────────┐
                        │   Next.js 14  │
                        │    Frontend   │  (Vercel Edge - Mumbai bom1)
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  FastAPI API  │
                        │   Web Node    │  (Render / Docker Container)
                        └───────┬───────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ↓                     ↓                     ↓
    Managed Postgres      Managed Redis          AWS S3 / R2
    (AWS RDS / Render)    (Upstash / Render)     Object Storage
          │                     │
          │                     ▼
          │               `queue:tasks`
          │                     │
          │            ┌────────┴────────┐
          │            ↓                 ↓
          │        Worker 1          Worker N    (Independent Worker Containers)
          │
          └───────────────────────────────────────────► External APIs
                                                        (Weather / Gemini / 2Factor)
```

---

## 2. PRODUCTION ENVIRONMENT MATRIX

| Component | Target Provider | Configuration Entry | Fail-Fast Behavior |
| :--- | :--- | :--- | :--- |
| **API Web Server** | Render / Container Host | `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4` | Fails on boot if `JWT_SECRET` is insecure in production mode. |
| **Async Worker** | Render Background Worker | `python -m services.worker` | Restarts automatically on crash; bounded 30s timeouts prevent job hangs. |
| **Database** | Managed PostgreSQL | `DATABASE_URL=postgresql+psycopg2://...` | Fails on boot if `ENVIRONMENT=production` and `DATABASE_URL` is SQLite. |
| **Shared State & Cache**| Managed Redis | `REDIS_URL=redis://...` | Falls back to PostgreSQL DB for session revocation if Redis drops. |
| **Object Storage** | AWS S3 / Cloudflare R2 | `STORAGE_PROVIDER=s3`, `S3_BUCKET_NAME=...` | Rejects file uploads if bucket credentials fail. |
