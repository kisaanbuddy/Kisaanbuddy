# WhatsApp Business Platform — Pricing & Cost Management (India)

## 1. Official Meta Conversation-Based Pricing Model (India Market)

Meta's WhatsApp Business Cloud API charges businesses on a per-conversation basis (24-hour conversational window), categorized into four distinct conversation tiers. Rates are denominated in Indian Rupees (INR) for accounts registered in India.

### Rate Card (Current Meta Cloud API India Rates)

| Category | Rate (INR) | Charge Trigger | Notes |
|---|---|---|---|
| **Service (User-Initiated)** | **₹0.29** | First business reply to incoming farmer message | Covers all messages sent within the 24-hour customer service window. Farmers are never charged. |
| **Utility (Business-Initiated)** | **₹0.12** | Delivery of pre-approved utility template | Used for transactional notifications, crop advisory updates, or weather emergency alerts. |
| **Authentication (OTP)** | **₹0.12** | Delivery of pre-approved authentication template | Used for OTP login or phone verification. |
| **Marketing (Promotional)** | **₹0.73** | Delivery of pre-approved marketing template | Used for broadcasts, seasonal campaigns, product announcements. |

> **Note on Free Service Conversations:** In Meta's revised pricing structure, business-initiated conversations and user-initiated conversations outside free tier allowances are billed according to these category rates.

---

## 2. Conversation Cost Tracking in KisaanBuddy
Every outgoing WhatsApp message processed by KisaanBuddy is evaluated by `backend/services/whatsapp/pricing.py`:
- Inbound messages from farmers: ₹0.00 (not charged to business).
- First outbound response initiating or renewing a 24-hour service window: ₹0.29.
- Subsequent responses within the active 24-hour window: ₹0.00.
- All messages and estimated costs are persisted to `whatsapp_messages` table.

---

## 3. Internal Budget Controls & Alerts
To prevent accidental overspending, KisaanBuddy includes configurable budget guards:
- **Monthly Budget Setting:** `WHATSAPP_MONTHLY_BUDGET_INR` (default: `₹5,000.00`).
- **Warning Threshold:** Triggers a log alert when 80% of budget is reached.
- **Exceeded Flag:** The admin stats endpoint (`/api/whatsapp/admin/stats`) reports `budget_exceeded: true` if accumulated cost crosses the configured limit.
- Genuine farmer queries are never artificially blocked; rather, clear administrative visibility and alerting ensure complete budget transparency.
