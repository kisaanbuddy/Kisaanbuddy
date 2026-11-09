# WhatsApp Business Platform Cloud API — Setup Guide

This guide walks through configuring the Meta WhatsApp Business Cloud API for KisaanBuddy.

---

## 1. Prerequisites
- A Meta for Developers account: [developers.facebook.com](https://developers.facebook.com)
- A Meta Business Manager account: [business.facebook.com](https://business.facebook.com)
- A verified phone number or Meta Sandbox test number
- A publicly accessible HTTPS domain (e.g. `https://api.kisaanbuddy.com` or ngrok/Cloudflare tunnel for local development)

---

## 2. Meta App Creation
1. Navigate to [Meta for Developers](https://developers.facebook.com/apps/).
2. Click **Create App** → Select **Other** → Select **Business** type.
3. Name your app (e.g. `KisaanBuddy WhatsApp Assistant`) and link your Business Account.
4. On the App Dashboard, locate **WhatsApp** and click **Set up**.

---

## 3. Gathering API Credentials
In the left sidebar under **WhatsApp** → **API Setup**:
1. **Temporary / Permanent Access Token:**
   - For production, create a System User in Meta Business Settings, grant `whatsapp_business_messaging` permissions, and generate a permanent token.
   - For testing, use the 24-hour test token provided on the API Setup page.
   - Set as `WHATSAPP_ACCESS_TOKEN`.
2. **Phone Number ID:**
   - Under *From*, copy the Phone number ID.
   - Set as `WHATSAPP_PHONE_NUMBER_ID`.
3. **WhatsApp Business Account ID:**
   - Copy the WhatsApp Business Account ID.
   - Set as `WHATSAPP_BUSINESS_ACCOUNT_ID`.
4. **App ID & App Secret:**
   - Go to **App Settings** → **Basic**.
   - Copy App ID (`WHATSAPP_APP_ID`) and App Secret (`WHATSAPP_APP_SECRET`).

---

## 4. Webhook Configuration
1. Under **WhatsApp** → **Configuration**, locate the **Webhook** section.
2. Click **Edit**:
   - **Callback URL:** `https://<YOUR_DEPLOYED_DOMAIN>/api/whatsapp/webhook`
   - **Verify Token:** Set a secure random string (e.g., `KB_WHATSAPP_VERIFY_TOKEN_998877`).
   - Click **Verify and Save**. (FastAPI verifies `hub.verify_token` and echoes `hub.challenge`).
3. Click **Manage Webhook Fields** and subscribe to:
   - `messages` (Incoming farmer messages, text, images, buttons)
   - `message_deliveries` / `statuses` (Sent, delivered, read receipts)

---

## 5. Adding Test Recipients (Sandbox Mode)
In development/sandbox mode:
1. In the **API Setup** page, locate **To** (Recipient Phone Number).
2. Click **Manage phone number list** and add your personal WhatsApp number with country code (`+91...`).
3. Meta will send a 5-digit verification code to that WhatsApp number. Enter the code.
4. Set `WHATSAPP_TEST_RECIPIENT` in `backend/.env` to this verified number.
