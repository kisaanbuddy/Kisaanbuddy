# WhatsApp Business Platform — Environment Configuration

All environment variables used by the WhatsApp integration are managed through Pydantic BaseSettings in `backend/core/config.py`.

---

## 1. Environment Variables Reference

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `WHATSAPP_ACCESS_TOKEN` | String | Yes (Prod) | `None` | Meta Cloud API System User access token. |
| `WHATSAPP_PHONE_NUMBER_ID`| String | Yes (Prod) | `None` | Meta Cloud API Phone Number ID. |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | String | Optional | `None` | Meta WhatsApp Business Account (WABA) ID. |
| `WHATSAPP_APP_ID` | String | Optional | `None` | Meta Application ID. |
| `WHATSAPP_APP_SECRET` | String | Yes (Prod) | `None` | Meta App Secret used for HMAC-SHA256 signature verification. |
| `WHATSAPP_VERIFY_TOKEN` | String | Yes (Prod) | `None` | Custom secret token configured in Meta Webhook settings. |
| `WHATSAPP_API_VERSION` | String | No | `v21.0` | Meta Graph API version. |
| `WHATSAPP_TEST_RECIPIENT` | String | Optional | `None` | Verified recipient number in Sandbox mode (E.164 e.g. `+919876543210`). |
| `WHATSAPP_SIGNATURE_VERIFICATION` | Boolean | No | `True` | Enforces HMAC-SHA256 signature check. |
| `WHATSAPP_MONTHLY_BUDGET_INR` | Float | No | `5000.0` | Internal monthly spend alert threshold in INR. |
| `FRONTEND_BASE_URL` | String | No | `http://localhost:3000` | Web application base URL for generating contextual links. |
| `REDIS_URL` | String | No | `None` | Redis connection URL for state machine and deduplication. |

---

## 2. Token Security & Rotation Procedure

### 2.1 Never Commit Secrets
- Never commit actual access tokens, app secrets, or verify tokens to Git repositories.
- Use `.env` locally (which is ignored by `.gitignore`).
- In production, set secrets directly in your host dashboard (e.g. Render, Railway, AWS ECS secrets manager).

### 2.2 Token Lifetime & System User Recommendation
- Temporary 24-hour developer tokens will expire and break outbound messaging.
- For production, always create a **System User** in Meta Business Settings:
  1. Go to Business Settings → Users → System Users.
  2. Create a System User with role `Admin`.
  3. Assign WhatsApp Assets to the System User.
  4. Generate Token with `whatsapp_business_messaging` and `whatsapp_business_management` permissions.
  5. Select expiration: `Never`.

### 2.3 Token Rotation
To rotate tokens without downtime:
1. Generate a new System User token in Meta Business Manager.
2. Update `WHATSAPP_ACCESS_TOKEN` in the production environment variables.
3. Restart backend workers. The client immediately picks up the new token.
4. Verify by calling `/api/whatsapp/admin/send-test`.
5. Revoke the old token in Meta Business Settings.
