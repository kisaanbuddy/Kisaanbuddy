# KisaanBuddy — Production Test Plan
**Branch:** `feature/farmer-feedback-production-hardening`  
**Date:** November 2026  
**Audience:** QA Automation, Release Management, Core Engineering  

---

## 1. Objectives & Scope
This test plan defines the automated and manual verification strategy for the Farmer Feedback Production Hardening release of KisaanBuddy (`krishiai`).

The hardening release addresses:
1. Zero fabricated / mock data in production (Rule 1 compliance across weather, disease, marketplace, and workers).
2. Complete bilingual accessibility (Hindi & English), persistent user language preference (`User.language` & `FarmerProfile.preferred_language`), and native terminology.
3. Voice-first speech interface resilience (bilingual fallback, graceful microphone denial handling, Sarvam STT/TTS integration).
4. Direct support ticket tracking via `/api/feedback` (`KB-FB-XXXXX` reference tracking) replacing dead `mailto:` links.
5. Inconclusive diagnostic honesty and KVK escalation for unclassified crop symptoms (no false-positive rust diagnoses).
6. Authorization and IDOR remediation on marketplace listings and buyer requirements.

---

## 2. Test Architecture & Environment

### 2.1 Backend Test Environment
- **Framework:** `pytest 9.1.1` with `httpx` / Starlette `TestClient`
- **Database Engine:** Isolated SQLite in-memory / temporary test databases (`sqlite:///./test.db` with auto-teardown per session)
- **Execution Command:**
  ```powershell
  $env:PYTHONPATH="backend"
  backend\venv\Scripts\python.exe -m pytest backend/tests -v
  ```
- **Coverage Suite:**
  - `test_admin.py` (Admin controls, audit logs, metrics)
  - `test_auth.py` & `test_otp_auth.py` (Authentication, OTP lifecycle, session tokens)
  - `test_disease_advisory_engine.py` & `test_disease_classifier.py` (Agronomic integrity, disease rules)
  - `test_farmer_feedback.py` (Feedback submissions, issue categorization, admin review)
  - `test_farmer_profile.py` (Profile persistence, crop holdings, location metadata)
  - `test_mandi_marketplace_suite.py` & `test_marketplace_pipeline.py` (Produce listings, price alerts, buyer quotes)
  - `test_sarvam.py` (Indic voice STT/TTS payload contracts and fallbacks)
  - `test_schemes_assistant.py` (Government scheme retrieval and eligibility rules)
  - `test_sensor.py` (IoT telemetry ingestion and threshold triggers)
  - `test_voice_language.py` (Language switching and voice query routing)
  - `test_worker_connect_module.py` (Agricultural labour collectives, FPO verification, contact workflows)
  - `test_production_hardening.py` (**NEW**: Agronomic uncertainty, IDOR prevention, weather truthfulness, language persistence, support ticket ingestion)

### 2.2 Frontend Validation Environment
- **Framework:** Next.js 14 / TypeScript / React 18
- **Browser Automation & Rendering:** Chrome / Chromium (Web Speech API, Sarvam audio playback, mobile responsive viewport 360x800 and desktop 1920x1080)
- **Target Pages:**
  - `/` (Bilingual landing page, instant language switch)
  - `/mandi` (Real AGMARKNET feed, honest Hindi empty state `"आज मंडी का भाव उपलब्ध नहीं है। कृपया बाद में देखें।"`)
  - `/crop-doctor` (Genuine image upload / symptom questionnaire, KVK advisory on low confidence)
  - `/contact` (Support ticket generation with real `KB-FB-` reference ID)
  - `/marketplace` (Produce listing create/view, unauthorized patch rejection)
  - `/soil-monitor` (Bilingual sensor readings with live indicators)

---

## 3. Test Cases & Verification Matrix

| Test Suite | File | Focus Area | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TH-01** | `test_production_hardening.py` | Weather Demo Isolation | `DemoWeatherProvider.is_configured` is strictly `False` when `ENABLE_DEMO_WEATHER=False`. |
| **TH-02** | `test_production_hardening.py` | Crop Doctor Inconclusive Handling | Querying unrecognized symptoms returns `confidence: 0.0`, `status: "inconclusive"`, and KVK referral. |
| **TH-03** | `test_production_hardening.py` | User Language Persistence | `PATCH /api/auth/me` with `{"language": "hi"}` returns 200 and persists to DB. |
| **TH-04** | `test_production_hardening.py` | Produce Listing IDOR Prevention | User B cannot update status of produce listing owned by User A (403 Forbidden). |
| **TH-05** | `test_production_hardening.py` | Buyer Requirement IDOR Prevention | User B cannot update status of requirement owned by User A (403 Forbidden). |
| **TH-06** | `test_production_hardening.py` | Support Ticket Generation | `POST /api/feedback` creates ticket, returns 201 Created and `KB-FB-` tracking ID. |
| **TH-07** | `test_worker_connect_module.py` | Agricultural Labour Collectives | Authentic FPOs seeded in test DB; worker availability queries conform to verified collectives. |
| **TH-08** | `test_voice_language.py` | Voice Language Fallback | Speech queries in Hindi correctly routed to Indic pipeline; fallback to text if STT fails. |

---

## 4. Acceptance Criteria & Pass Gates
1. **Zero Test Regressions:** 100% of baseline tests (115 items) and hardening tests (6 items) must pass (Total: 121 tests).
2. **Zero Dummy/Simulated Data in Production Mode:**
   - No mock buyer profiles or fabricated transaction ledgers.
   - Mandi page handles API downtime with honest status messages rather than synthesized prices.
   - Crop Doctor diagnoses must never return default "Wheat Rust" when symptoms do not match.
3. **Security Sign-Off:**
   - All state-mutating endpoints verify ownership (`user_id == current_user.id` or `role == "admin"`).
   - Bearer token authentication verified alongside session cookies.
4. **Localization Complete:**
   - Hindi strings used natively without Sanskritized or overly academic phrasing.
   - Storage of language preference maintained across sessions.
