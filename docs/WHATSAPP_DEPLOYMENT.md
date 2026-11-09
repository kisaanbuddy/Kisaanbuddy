# WhatsApp Business Platform — Production Deployment Guide

## 1. Deployment Topology
The WhatsApp integration runs inside the FastAPI application, utilizing:
- **FastAPI Backend (Uvicorn / Gunicorn)** on Render, AWS, or Railway.
- **PostgreSQL Database** for persistent records (`whatsapp_users`, `whatsapp_messages`, `whatsapp_support_tickets`, `whatsapp_link_tokens`, `disease_detections`).
- **Redis (Optional, Recommended)** for state machine TTL caching and instant webhook idempotency.
- **Public HTTPS Endpoint** for Meta Webhook delivery.

---

## 2. Preparing the Production Environment

### 2.1 Database Migrations
When starting the FastAPI application, SQLAlchemy automatically creates any missing tables during the lifespan startup event:
```python
Base.metadata.create_all(bind=engine)
```
For SQLite or PostgreSQL deployments, tables `whatsapp_users`, `whatsapp_messages`, `whatsapp_support_tickets`, and `whatsapp_link_tokens` are provisioned automatically.

### 2.2 Storage Configuration
Photos uploaded by farmers on WhatsApp are stored in `backend/data/uploads/crop_doctor`.
- Ensure write permissions on the directory:
  ```bash
  mkdir -p backend/data/uploads/crop_doctor
  chmod 755 backend/data/uploads/crop_doctor
  ```
- If deploying with ephemeral filesystems (e.g. Render free tier), mount a persistent disk or connect Supabase Storage via `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 3. Webhook Setup on Meta Dashboard
1. Ensure your backend is deployed with a valid SSL/TLS certificate (HTTPS is mandatory for Meta).
2. Go to **Meta for Developers** → Your App → **WhatsApp** → **Configuration**.
3. Set Callback URL:
   `https://<your-backend-domain>/api/whatsapp/webhook`
4. Set Verify Token matching `WHATSAPP_VERIFY_TOKEN`.
5. Verify Webhook.
6. Subscribe to fields: `messages`, `message_deliveries`.

---

## 4. Health Checks and Monitoring Endpoints
- **Liveness & Config Check:**
  `GET https://<your-domain>/api/whatsapp/health`
  Returns JSON:
  ```json
  {
    "status": "configured",
    "configured": true,
    "phone_number_id_set": true,
    "access_token_set": true,
    "app_secret_set": true,
    "verify_token_set": true,
    "redis_connected": true,
    "message_count_24h": 42
  }
  ```

- **Usage & Cost Monitoring:**
  `GET https://<your-domain>/api/whatsapp/admin/stats`

- **Support Tickets:**
  `GET https://<your-domain>/api/whatsapp/admin/tickets`

---

## 5. Rollback Procedure
If unexpected issues arise in production:
1. Temporarily unsubscribe from the `messages` webhook in Meta App Dashboard, or set `WHATSAPP_SIGNATURE_VERIFICATION=true` with a rotated secret.
2. The core website (`/`, `/disease`, `/mandi`, `/weather`) will remain 100% operational, as WhatsApp routes are isolated.
3. Revert to previous Git commit using standard deployment rollbacks.
