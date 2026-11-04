# KisaanBuddy — Integration Audit & External Services
**Branch:** `feature/farmer-feedback-production-hardening`  
**Date:** November 2026  
**Audience:** Technical Architecture, QA, DevOps  

---

## 1. Overview
This document audits all external services, third-party APIs, and data sources integrated into KisaanBuddy. Under **Rule 1 (Zero Dummy/Fabricated Data)**, this audit details the live operational status, failover behavior, authentication requirements, and sandbox/demo boundaries for each integration.

---

## 2. External Integration Registry

| Service / Integration | Provider | Purpose | Auth Mechanism | Live Status | Downtime / Failover Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mandi Price Feed** | AGMARKNET via `data.gov.in` | Real-time commodity APMC wholesale prices across Indian mandis | API Key (`DATA_GOV_IN_API_KEY`) | Operational | Return genuine empty state with localized notification (`"आज मंडी का भाव उपलब्ध नहीं है। कृपया बाद में देखें।"`). **Never generate fake prices.** |
| **Weather Forecast & Alerts** | OpenWeatherMap / IMD API | 5-day agro-meteorological forecast, rainfall, and spray conditions | API Key (`OPENWEATHER_API_KEY`) | Operational | If unconfigured or API unreachable, return `null` / empty advisory with explanatory UI. `DemoWeatherProvider` is strictly disabled unless `DEBUG=True` AND `ENABLE_DEMO_WEATHER=True`. |
| **Indic Voice STT / TTS** | Sarvam AI API (`api.sarvam.ai`) | Indian language speech-to-text and text-to-speech (Hindi, Bhojpuri, etc.) | Bearer Token (`SARVAM_API_KEY`) | Operational | Native browser Web Speech API (`webkitSpeechRecognition` / `speechSynthesis`) acts as zero-cost local fallback if Sarvam is unconfigured or offline. |
| **SMS / OTP Service** | Fast2SMS / Twilio | Farmer mobile login verification via 6-digit OTP | API Key (`FAST2SMS_API_KEY` / `TWILIO_AUTH_TOKEN`) | Configured | In development/test mode, OTP is logged to server console. In production, real SMS delivery is enforced; failure triggers user retry prompt. |
| **Agronomic Disease Knowledge** | ICAR / State Agri Universities Knowledge Base | Offline rule-based expert system & symptom matcher | Embedded Engine | Active | When symptoms are ambiguous or confidence is low, diagnostic engine returns `status: "inconclusive"` and recommends visiting the nearest Krishi Vigyan Kendra (KVK). |

---

## 3. Strict Demo / Mock Isolation Policies

To uphold trust with Indian farmers, simulated or mock data must never masquerade as real-world data:

### 3.1 Weather Provider Boundary
- **Code Location:** `backend/services/providers/demo.py` & `backend/core/config.py`
- **Enforcement Rule:**
  ```python
  @property
  def is_configured(self) -> bool:
      # STRICT CHECK: Only allow demo weather if explicitly permitted in development mode.
      return bool(settings.DEBUG and getattr(settings, "ENABLE_DEMO_WEATHER", False))
  ```
- **Guarantee:** In production environments (`DEBUG=False`), the demo weather provider is never loaded. If no external weather provider is configured, the system explicitly reports weather service unconfigured rather than showing synthetic temperatures or rainfall.

### 3.2 Crop Disease Diagnosis Boundary
- **Code Location:** `backend/services/disease_knowledge_engine.py` & `backend/api/disease.py`
- **Enforcement Rule:**
  - Removed fallback to default Rust diseases (`AGRICULTURAL_KNOWLEDGE_BASE[:2]`).
  - If a farmer's symptom query does not match genuine agronomic criteria, the API returns:
    ```json
    {
      "status": "inconclusive",
      "confidence": 0.0,
      "disease_name": null,
      "message": "आपके द्वारा बताए गए लक्षणों से किसी निश्चित बीमारी की पहचान नहीं हो सकी। कृपया अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ से संपर्क करें।"
    }
    ```
- **Guarantee:** Farmers are never instructed to apply chemical pesticides based on arbitrary fallback data.

### 3.3 Marketplace & Agricultural Workers
- **Code Location:** `backend/api/marketplace.py` & `backend/services/labour_marketplace_service.py`
- **Enforcement Rule:**
  - Marketplace listings and worker collectives are sourced strictly from authentic registered users and FPOs.
  - Zero synthetic buyer quotations or phantom worker availability cards. Empty listings display honest "No listings currently available in your district" messaging.

---

## 4. Verification & Health Monitoring

All external integrations provide health checks surfaced via the `/api/health` and `/api/admin/metrics` endpoints:
- Mandi API latency & upstream response status code.
- Weather provider connectivity.
- Sarvam AI credit / quota status.
- Database query latency and connection pool metrics.
