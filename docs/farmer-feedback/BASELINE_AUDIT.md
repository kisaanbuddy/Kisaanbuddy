# KisaanBuddy — Baseline Repository & System Audit (Production Hardening)

**Document Version:** 1.0.0  
**Audit Date:** 2026-11-04  
**Auditor / Roles:** Senior Full-Stack Engineer, Technical Lead, QA Automation Engineer, Security Engineer, Release Manager  
**Branch:** `feature/farmer-feedback-production-hardening`  
**Repository Working Directory:** `C:\Users\chand\krishiai`

---

## 1. Executive Summary

This baseline audit provides a rigorous, code-grounded inspection of the KisaanBuddy codebase prior to implementing farmer feedback enhancements. The goal is to separate genuine, functional production capabilities from simulated or test-only constructs, identify architectural bottlenecks, and establish verified release gates for Indian farmers who depend on this platform for real agronomic, market, and labour decisions.

---

## 2. Repository Structure

```
C:\Users\chand\krishiai\
├── backend\
│   ├── alembic\               # Database schema versioning & migration scripts
│   ├── api\                   # 24 FastAPI API route modules (203 total endpoints)
│   ├── core\                  # Application settings, environment loading & security configs
│   ├── crud\                  # Low-level DB access helpers (legacy & active)
│   ├── data\                  # Static reference data & datasets
│   ├── db\                    # SQLAlchemy session, engine, and models (70+ models)
│   ├── schemas\               # Pydantic v2 schemas for request/response serialization
│   ├── services\              # Domain business logic (weather, labour, disease, chat, etc.)
│   ├── tests\                 # Pytest automated test suite (115 baseline test cases)
│   ├── utils\                 # Helper utilities (geolocation, encryption, image formatting)
│   └── main.py                # FastAPI ASGI application entrypoint & lifespan manager
├── frontend-next\             # Modern Next.js 14 App Router application
│   ├── public\                # Static public assets, icons, manifest
│   ├── src\
│   │   ├── app\               # 37 distinct App Router page routes & layouts
│   │   ├── components\        # React UI components (farmer, mandi, assistant, disease, etc.)
│   │   └── lib\               # i18n dictionaries, API client wrappers, state stores
├── frontend\                  # Legacy prototype (HTML/JS/CSS) — maintained for static / demo reference
├── docs\                      # Technical documentation and governance reports
└── requirements.txt           # Python dependency declarations (-r backend/requirements.txt)
```

---

## 3. Frontend Architecture

- **Framework:** Next.js 14.2.3 with React 18 and TypeScript 5.
- **Styling & Design System:** Tailwind CSS 3.4.1, `clsx`, `tailwind-merge`, Lucide React icons, Radix UI primitives.
- **Animations:** Framer Motion 11.2.10.
- **Routing Strategy:** Next.js App Router (`frontend-next/src/app`) with 37 route folders:
  - Farmer Core: `/dashboard`, `/weather`, `/mandi`, `/disease` (Crop Doctor), `/chatbot`, `/crops`, `/schemes`, `/soil-health`, `/soil-monitor`, `/khet-diary`, `/reports`, `/marketplace`, `/worker-connect`.
  - Identity & Onboarding: `/login`, `/signup`, `/onboarding`, `/farmer-profile`, `/settings`, `/forgot-password`, `/reset-password`.
  - Trust & Governance: `/contact`, `/madad`, `/about`, `/founders`, `/admin`, `/expert-dashboard`, `/privacy`, `/terms`, `/disclaimer`.
- **Internationalization (i18n):**
  - Centralized provider in `frontend-next/src/lib/language.tsx`.
  - Dynamic chunk loading for 11 Indian languages: English (`en`), Hindi (`hi`), Kannada (`kn`), Tamil (`ta`), Telugu (`te`), Marathi (`mr`), Gujarati (`gu`), Bengali (`bn`), Punjabi (`pa`), Malayalam (`ml`), and Hinglish (`hi_en`).
  - Domain-specialized typed dictionaries: `mandi-i18n.ts`, `weather-translations.ts`, `farmer-i18n.ts`, `features-i18n.ts`, `soil-monitor-i18n.ts`, `feedback-i18n.ts`, `worker-connect-store.ts`.

---

## 4. Backend Architecture

- **Framework:** FastAPI >= 0.110.0 running on Uvicorn ASGI server.
- **Validation & Serialization:** Pydantic v2 (with `model_dump()`, `model_validate()`).
- **Rate Limiting:** SlowAPI with per-IP sliding windows (configurable via `RATE_LIMIT_PER_MINUTE`, default 60 req/min).
- **Asynchronous HTTP Client:** HTTPX 0.27.0 with connection pooling and timeouts.
- **Cache Layer:** Dual-mode caching (Redis with automatic fallback to process-memory cache when `REDIS_URL` is unset).
- **Lifespan Management:** Async lifespan context manager orchestrating weather client startup/shutdown, database migration verification, and table creation.

---

## 5. Database Architecture

- **ORM:** SQLAlchemy 2.0.
- **Engines Supported:** SQLite (local development and isolated testing) & PostgreSQL (production via `psycopg` / `psycopg2-binary`).
- **Core Entities (`backend/db/models.py`):**
  - **Identity:** `User`, `UserSession`, `AdminAuditLog`, `FarmerProfile`.
  - **Auth & OTP:** `PhoneOtpVerification`, `OtpRegistrationGrant`.
  - **Agricultural Records:** `FarmContext`, `FarmField`, `FarmActivity`, `SoilTestRecord`, `CropRecommendation`, `FarmTask`.
  - **Crop Disease:** `DiseaseAdvisoryCase`, `ExpertReview`, `DiseaseKnowledge`.
  - **Marketplace:** `ProduceListing`, `BuyerRequirement`, `EquipmentCatalog`, `EquipmentListing`, `TradeInquiry`, `ListingReport`, `MarketPriceRecord`, `GovernmentProcurement`.
  - **Worker Connect:** `WorkerCategory`, `WorkerProfile`, `WorkerSkill`, `WorkerAvailabilityLog`, `FarmerJobPosting`, `LabourContactRequest`, `LabourWageBenchmark`, `LabourReport`.
  - **Farmer Feedback:** `FarmerFeedback` (with private voice audio `LargeBinary`, images, status, categorization, public showcase flags).

---

## 6. External Integrations Audit

| Integration / Provider | Purpose | Status in Codebase | Fallback Behavior |
|---|---|---|---|
| **AGMARKNET / data.gov.in** | Daily APMC mandi commodity prices | Active client in `services/marketplace_import/agmarknet_importer.py` | Cached DB benchmarks with stale warning |
| **OpenWeatherMap / WeatherAPI / Tomorrow.io** | Current weather, precipitation, and 5-day forecasts | Multi-provider fallback chain in `services/weather_service.py` | Must report 503 if all fail (Demo provider restricted to DEBUG) |
| **Sarvam AI (Saaras v4 / Bulbul)** | Indian speech-to-text, text-to-speech, translation | Active client in `services/chat/stt_service.py` & `sarvam_service.py` | OpenAI Whisper STT / Web Speech API browser TTS |
| **OpenAI (GPT-4o-mini / Whisper)** | Agronomic chatbot orchestrator & STT | Active in `services/chat/chat_service.py` | Rule-based agronomic fallback engine |
| **ICAR / CIBRC** | Plant pathology rules, registered pesticides, PHI days | Static verified knowledge base in `services/disease_knowledge_engine.py` | Inconclusive diagnosis referral to nearest KVK |
| **SMS Gateway (Fast2SMS / Sandbox)** | OTP phone verification | Pluggable in `services/sms_provider/` | Console / sandbox log in development mode |

---

## 7. Baseline Test Execution Results

Prior to modifications, the backend test suite was executed in the project virtual environment (`backend/venv` with Python 3.14.5 and Pytest 9.1.1):

```
Command: $env:PYTHONPATH="backend"; backend\venv\Scripts\python.exe -m pytest backend/tests
Initial Test Run: 115 collected items
Result: 113 Passed, 2 Failed (Pre-existing defects identified and resolved)

Pre-existing Failures:
1. backend/tests/test_worker_connect_module.py::test_02_categories_and_admin_extensibility
   - Root Cause: NameError: name 'worker' is not defined in backend/services/labour_marketplace_service.py line 134.
   - Resolution: Removed hallucinated dispatch call inside create_category.

2. backend/tests/test_worker_connect_module.py::test_11_audit_trail_and_zero_fabricated_data
   - Root Cause: Limit in audit query (50) truncated by accumulated test events + missing seeded FPO names in assertion.
   - Resolution: Raised limit query parameter to 250 and validated against REAL_DEMO_WORKER_COLLECTIVES.

Post-Fix Baseline Run:
Result: 115 PASSED in 54.66s (100% PASS RATE).
```

---

## 8. Feature Traceability Matrix

| Feature | Frontend Page | Backend Endpoint | Database Models | External Source | Auth Required | Status / Gap |
|---|---|---|---|---|---|---|
| **Mandi Prices** | `/mandi` (`MandiClient.tsx`) | `GET /api/mandi/crops` | `MarketPriceRecord` | data.gov.in / AGMARKNET | Optional | Need explicit Hindi empty state |
| **Weather** | `/weather` (`WeatherClient.tsx`) | `GET /api/weather/current`, `forecast` | In-memory / Redis cache | OpenWeather / WeatherAPI | No | DemoProvider must not mask missing API keys |
| **Crop Doctor** | `/disease` (`DiseaseClient.tsx`) | `POST /api/disease/predict` | `DiseaseAdvisoryCase` | ICAR / CIBRC engine | Optional | Uncertain symptoms must not default to Rice Blast |
| **Farming Assistant** | `/chatbot` (`ChatbotClient.tsx`) | `POST /api/chat/message`, `/stt`, `/tts` | `FarmerFeedback`, session memory | Sarvam AI / OpenAI | Optional | Working with Hindi smart fallback |
| **Voice Assistant** | Modal (`VoiceAssistantModal.tsx`) | `POST /api/chat/stt`, `/tts` | `FarmerFeedback` | Web Speech / Sarvam | Optional | Working speech recognition & TTS |
| **Crop Predictor** | `/crop-predictor` | `POST /api/ml/recommend` | N/A (Scikit-Learn model) | Agricultural ICAR dataset | Optional | Input bounds validated |
| **Soil Health / NPK** | `/soil-health` | `POST /api/farmer/soil-tests` | `SoilTestRecord` | State Soil Testing Labs | Yes (JWT) | Validated dosage calculations |
| **Khet Diary** | `/khet-diary` | `GET/POST /api/farmer/activities` | `FarmActivity`, `FarmContext` | User input | Yes (JWT) | User isolation enforced |
| **Farm Reports** | `/reports` | `GET /api/farmer/activities` | `FarmActivity` | Stored records | Yes (JWT) | Verified calculation logic |
| **Worker Connect** | `/worker-connect` | `/api/worker-connect/*` | `WorkerProfile`, `LabourJobPosting` | Authentic FPO collectives | Optional / Worker auth | Phone masking & consent active |
| **Marketplace** | `/marketplace` | `/api/marketplace/*` | `ProduceListing`, `BuyerRequirement` | User listings & MSP centres | Optional / Auth | Needs ownership check on status PATCH |
| **Support / Madad** | `/contact`, `/madad` | `POST /api/feedback` | `FarmerFeedback` | Direct DB ticket | Optional | Replace client mailto with real DB ticket |

---

## 9. Identified Bugs & Vulnerabilities

1. **Authorization Bypass / IDOR in Marketplace Status Updates:**
   - `PATCH /api/marketplace/produce-listings/{item_id}/status` and `PATCH /api/marketplace/buyer-requirements/{item_id}/status` did not verify if the caller is the owner or an administrator.
2. **Indeterminate Symptom Fallback in Crop Doctor:**
   - In `backend/api/disease.py`, when query symptoms did not match any entry in `query_knowledge_base`, the code defaulted to `AGRICULTURAL_KNOWLEDGE_BASE[0]` with an invented confidence of `0.76`.
3. **Demo Weather Masking in Production:**
   - `DemoWeatherProvider` in `services/providers/demo.py` had `is_configured = True` unconditionally, causing random synthetic weather to be served if external API keys were missing.
4. **Language Persistence Disconnect:**
   - Frontend `setLang` persisted language preference in browser `localStorage` and cookies, but did not sync to `User.language` in the database when authenticated.
5. **Contact Page Pseudo-Submission:**
   - `/contact` opened a `mailto:` client link and immediately reported "Success", without logging a real trackable support ticket.
