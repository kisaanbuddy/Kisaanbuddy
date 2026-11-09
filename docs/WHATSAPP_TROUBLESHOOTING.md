# WhatsApp Business Platform — Troubleshooting Guide

This guide provides diagnostics and resolutions for common integration issues.

---

## 1. Webhook Verification Errors

### Error: "The URL couldn't be validated. Callback verification failed with code 403."
- **Root Cause:** The `hub.verify_token` sent by Meta does not match `WHATSAPP_VERIFY_TOKEN` configured in `backend/.env`.
- **Resolution:**
  1. Check `WHATSAPP_VERIFY_TOKEN` in `backend/.env`.
  2. Ensure the exact same string is pasted into Meta's Webhook configuration dialog.
  3. Ensure the server is accessible over public HTTPS (Meta cannot reach `http://localhost`).

### Error: "Invalid webhook HMAC signature (HTTP 403 Forbidden)"
- **Root Cause:** Meta sends an `X-Hub-Signature-256` header signed with your Meta App Secret. If `WHATSAPP_APP_SECRET` is unset or incorrect, signature validation fails.
- **Resolution:**
  1. Retrieve your App Secret from Meta App Dashboard → App Settings → Basic → App Secret.
  2. Set `WHATSAPP_APP_SECRET` in `backend/.env`.

---

## 2. Outbound Messaging Failures

### Error: "HTTP 401 Unauthorized" from Graph API
- **Root Cause:** Expired or revoked `WHATSAPP_ACCESS_TOKEN`.
- **Resolution:**
  1. Temporary developer tokens expire after 24 hours.
  2. Generate a permanent System User token with `whatsapp_business_messaging` permissions in Meta Business Settings.
  3. Update `WHATSAPP_ACCESS_TOKEN` in `.env`.

### Error: "HTTP 400 Bad Request — (#131030) Recipient phone number not in allowed list"
- **Root Cause:** When the Meta app is in Development / Sandbox mode, messages can only be sent to numbers explicitly verified in the sandbox recipient list.
- **Resolution:**
  1. Go to WhatsApp → API Setup in Meta Dashboard.
  2. Under "To", click "Manage phone number list" and add the target recipient number.
  3. Complete SMS verification on that number.

### Error: "HTTP 429 Too Many Requests"
- **Root Cause:** Meta Cloud API throughput rate limit reached.
- **Resolution:**
  - `WhatsAppClient._post_with_retry` automatically applies exponential backoff and retries transient 429 errors up to 3 times.

---

## 3. Media & Image Diagnosis Issues

### Error: "Rejected unsafe media URL domain (SSRF protection)"
- **Root Cause:** The image URL does not originate from Meta's approved domains (`lookaside.fbsbx.com`, `graph.facebook.com`, `*.fbcdn.net`).
- **Resolution:**
  - Only media IDs received directly from Meta webhooks should be downloaded via `download_media()`.

### Error: "The uploaded file is not a valid crop image"
- **Root Cause:** The uploaded image is corrupted, too small (< 32x32px), or not a supported image format (JPEG, PNG, WebP).
- **Resolution:**
  - Ask the farmer to upload a clear foliage photo in daylight.

---

## 4. Helpful Diagnostic Commands

```bash
# Check integration health
curl -s http://localhost:8000/api/whatsapp/health | jq .

# Check usage stats
curl -s http://localhost:8000/api/whatsapp/admin/stats | jq .

# Run real Meta sandbox verification
python backend/scripts/verify_real_meta_sandbox.py
```
