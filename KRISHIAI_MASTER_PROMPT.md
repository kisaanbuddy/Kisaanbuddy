# KrishiAI — Developer Master Prompt
### Industry-Level Complete Reference · Version 2.0 · May 2026

> **How to use this document:** Paste the entire contents of this file into any LLM (Claude, GPT-4, Gemini, Cursor, Copilot) before asking it to build, debug, extend, or review any part of KrishiAI. This single file gives the AI enough context to act as a senior engineer who has read every line of the codebase.

---

## 0. PROJECT IDENTITY

| Field | Value |
|---|---|
| **Product name** | KrishiAI |
| **Tagline** | AI Smart Farmer Decision Intelligence |
| **Mission** | Make Indian farmers — especially rural, low-literacy, low-connectivity — as informed as a PhD agronomist, in their own language, for free |
| **Live URL** | https://krishiai-steel.vercel.app |
| **GitHub** | https://github.com/adityaoutlier5-dotcom/krishiai |
| **Primary users** | Smallholder farmers across India (Hindi, Kannada, English speakers) |
| **Monetisation** | None (free public good); future: SaaS B2B for agri-input companies |

---

## 1. SYSTEM ARCHITECTURE — BIRD'S EYE VIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│  FIELD LAYER (IoT)                                                  │
│  ESP32 + DHT22 + Capacitive Soil Moisture v2.0 + OLED              │
│  → POST /api/sensor/ingest every 15 s over WiFi                     │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ HTTP JSON
┌───────────────────────▼─────────────────────────────────────────────┐
│  BACKEND  (FastAPI · Python 3.11 · Uvicorn)                         │
│  Deployed on Render  ·  https://krishiai-backend.onrender.com       │
│                                                                     │
│  /api/weather/*   /api/ml/*    /api/chat/*    /api/sensor/*         │
│  /api/mandi/*     /api/schemes /api/worker-connect/*                │
│                                                                     │
│  Services: ChatOrchestrator (GPT-4o / Gemini 1.5 Pro)              │
│            WeatherOrchestrator (OpenWeatherMap → WeatherAPI →       │
│              Tomorrow.io → AccuWeather fallback chain)              │
│            STT/TTS (Web Speech API; Sarvam.ai planned)             │
│            ML Recommender (mock; swap .pkl when trained)            │
│            In-memory sensor store (sensor.py)                       │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ REST + SSE (Server-Sent Events)
┌───────────────────────▼─────────────────────────────────────────────┐
│  FRONTEND  (Next.js 14 · React 18 · TypeScript · Tailwind CSS)      │
│  Deployed on Vercel  ·  https://krishiai-steel.vercel.app           │
│                                                                     │
│  Pages: /  /dashboard  /crop-predictor  /disease  /weather         │
│         /mandi  /schemes  /chatbot  /worker-connect  /founders      │
│         /login  /signup                                             │
│                                                                     │
│  Rewrites: /api/* → http://backend:8000/api/*  (next.config.ts)    │
└─────────────────────────────────────────────────────────────────────┘
```

### Data flow principles
- Frontend **never** calls external APIs directly — all proxied through backend.
- Backend uses a **provider-fallback chain** for weather (4 providers).
- Chat uses a **model-fallback chain** for LLM (12 Gemini models + GPT-4o).
- ESP32 pushes sensor data to backend; frontend polls `/api/sensor/latest`.
- Auth is **JWT-in-localStorage** (custom `useAuth` hook) — no next-auth.
- No server components used (all `"use client"`); PWA-ready.

---

## 2. COMPLETE FILE TREE (annotated)

```
KrishiAI/
│
├── backend/                          ← FastAPI Python app
│   ├── main.py                       ← App entry: CORS, rate-limit, router mount
│   ├── requirements.txt              ← All Python deps
│   ├── .env                          ← Secrets (gitignored)
│   ├── .env.example                  ← Template for secrets
│   │
│   ├── core/
│   │   └── config.py                 ← Pydantic Settings (all env vars)
│   │
│   ├── api/                          ← Thin route controllers
│   │   ├── weather.py                ← GET /current /forecast /search /geoip /health
│   │   ├── ml.py                     ← POST /recommend  POST /crop-check
│   │   ├── chatbot.py                ← POST /message  /stream  /stt  /tts  /session /health
│   │   ├── mandi.py                  ← GET /crops  GET /crop/{id}
│   │   ├── schemes.py                ← GET /schemes  (static JSON dataset)
│   │   ├── worker_connect.py         ← POST /jobs  GET /jobs  PUT /jobs/{id}
│   │   └── sensor.py                 ← POST /ingest  GET /latest  GET /history  GET /health
│   │
│   ├── services/
│   │   ├── weather_service.py        ← WeatherOrchestrator (4-provider fallback)
│   │   ├── weather_cache.py          ← Redis / in-memory cache layer
│   │   └── chat/
│   │       ├── chat_service.py       ← ChatOrchestrator (LLM routing, tool calls, SSE)
│   │       ├── prompts.py            ← BASE_SYSTEM_PROMPT + DISEASE_DIAGNOSIS_PROMPT + TOOL_SCHEMAS
│   │       ├── tools.py              ← Tool executors (get_weather, recommend_crop, list_schemes…)
│   │       ├── memory.py             ← SessionStore (in-memory, bounded deque)
│   │       ├── knowledge.py          ← RAG: embeds .md knowledge files, returns top-k chunks
│   │       ├── language_detect.py    ← Script detection (Devanagari / Kannada / Latin)
│   │       ├── stt_service.py        ← Speech-to-text (Web Speech API passthrough + Sarvam stub)
│   │       └── tts_service.py        ← Text-to-speech (browser TTS; Sarvam.ai integration stub)
│   │
│   ├── db/
│   │   ├── session.py                ← SQLAlchemy engine + Base (SQLite default)
│   │   └── models.py                 ← User, Crop, FarmerField, DiseaseDetection, ChatInteraction, WorkerJob
│   │
│   ├── schemas/
│   │   └── chatbot.py                ← AssistantRequest, AssistantReply, SessionState, Message, LocationHint
│   │
│   └── data/knowledge/
│       ├── disease_diagnosis_protocol.md   ← Curated disease KB (RAG source)
│       └── soil_irrigation.md              ← Soil / irrigation facts (RAG source)
│
├── frontend-next/                    ← Next.js 14 app
│   ├── next.config.ts                ← API rewrites → backend
│   ├── tailwind.config.ts            ← Tailwind config (uses CSS variables)
│   ├── package.json
│   │
│   └── src/
│       ├── app/
│       │   ├── globals.css           ← DESIGN SYSTEM: glassmorphism, animations, tokens
│       │   ├── layout.tsx            ← Root layout: Header + ThemeProvider + AssistantGate
│       │   ├── page.tsx              ← Landing page (dark hero, stats, services, CTA)
│       │   ├── dashboard/page.tsx    ← Auth-gated: greeting, stat cards, weather, shortcuts
│       │   ├── crop-predictor/page.tsx  ← ML predictor sliders + SensorAutoFill + AskFarmAI
│       │   ├── disease/page.tsx      ← Drag-drop upload + SSE diagnosis stream
│       │   ├── weather/page.tsx      ← Full weather hub (hourly + 7-day forecast)
│       │   ├── mandi/page.tsx        ← APMC prices grid + detail + buy/sell flow
│       │   ├── schemes/page.tsx      ← Govt scheme cards with YouTube embeds
│       │   ├── chatbot/page.tsx      ← Full-screen chat (uses AssistantWidget)
│       │   ├── worker-connect/page.tsx  ← Job board (post + search farm labour)
│       │   ├── founders/page.tsx     ← Team page
│       │   ├── login/page.tsx        ← Email/password login
│       │   └── signup/page.tsx       ← Registration
│       │
│       ├── components/
│       │   ├── Header.tsx            ← Sticky nav: icons + active pill + user avatar + mobile drawer
│       │   ├── ThemeProvider.tsx     ← next-themes wrapper
│       │   ├── ThemeToggle.tsx       ← Dark/light toggle button
│       │   ├── LocationAutoFill.tsx  ← "Auto-fill from location" (weather → predictor sliders)
│       │   ├── SensorAutoFill.tsx    ← "Read ESP32 sensor" → predictor sliders
│       │   ├── AskFarmAI.tsx         ← Crop suitability AI widget (POST /api/ml/crop-check)
│       │   ├── AssistantGate.tsx     ← Floating chat bubble (renders on all pages)
│       │   ├── SchemeVideo.tsx       ← Lazy YouTube embed for scheme cards
│       │   └── ui/
│       │       ├── button.tsx        ← shadcn-style Button
│       │       ├── card.tsx          ← Card + GlassCard + CardHeader + CardTitle + CardContent
│       │       ├── input.tsx         ← Input component
│       │       ├── label.tsx
│       │       └── slider.tsx        ← Radix UI-based slider (for predictor)
│       │   └── assistant/
│       │       ├── AssistantWidget.tsx   ← Chat panel orchestrator
│       │       ├── ChatPanel.tsx         ← Message list + input bar
│       │       ├── ChatMessage.tsx       ← Bubble renderer (markdown-safe)
│       │       ├── LanguagePicker.tsx    ← Hindi/English/Kannada/Auto selector
│       │       ├── MicButton.tsx         ← Web Speech API voice input
│       │       ├── TranscriptLive.tsx    ← Live STT transcript overlay
│       │       ├── useAssistant.tsx      ← SSE stream hook + session management
│       │       └── useSpeech.tsx         ← STT/TTS hook
│       │   └── weather/
│       │       ├── WeatherCard.tsx       ← Current conditions card (used on dashboard)
│       │       ├── HourlyForecast.tsx    ← Scrollable hourly chart
│       │       ├── DailyForecast.tsx     ← 7-day forecast tiles
│       │       ├── LocationSearch.tsx    ← Debounced city search
│       │       ├── UnitToggle.tsx        ← °C / °F toggle
│       │       ├── unit-context.tsx      ← React context for unit preference
│       │       └── weather-icons.tsx     ← SVG weather icon map
│       │
│       └── lib/
│           ├── auth.ts               ← useAuth hook, loginUser, logoutUser, JWT decode
│           ├── weather-api.ts        ← Client-side weather fetch helpers
│           ├── assistant-api.ts      ← streamMessage() SSE reader, AssistantRequest type
│           └── utils.ts              ← cn() (clsx + tailwind-merge)
│
├── hardware/
│   └── krishiai_sensor_node/
│       └── krishiai_sensor_node.ino  ← Complete ESP32 Arduino firmware
│
├── HARDWARE_SETUP.md                 ← Wiring diagrams, calibration, library list
├── SHOPPING_LIST.md                  ← Bill of materials with Amazon/Robu links
├── KrishiAI_Hardware_Architecture_v1.0.docx  ← 88KB full IoT architecture doc
├── README.md                         ← Quickstart guide
├── render.yaml                       ← Render.com deployment spec
├── run-all.bat / start.bat / start.ps1  ← Local dev launchers
└── PUSH-UI-UPGRADE.bat               ← Git commit + push script (clears lock too)
```

---

## 3. BACKEND — ALL API ENDPOINTS

### 3.1 Weather  `/api/weather`

| Method | Path | Params | Returns |
|--------|------|--------|---------|
| GET | `/current` | `lat`, `lon` OR `q` (city) | `UnifiedWeather` |
| GET | `/forecast` | `lat`, `lon`, `days` (1–7) | `ForecastResponse` |
| GET | `/search` | `q` (city name) | `[{name, lat, lon, country}]` |
| GET | `/geoip` | *(none — uses request IP)* | `{lat, lon, city, country}` |
| GET | `/health` | *(none)* | Provider status + cache hit rate |

**Provider fallback order:** OpenWeatherMap → WeatherAPI → Tomorrow.io → AccuWeather  
**Cache:** Redis (if `REDIS_URL` set) else in-memory. TTL: current=5min, forecast=15min, search=1h.

`UnifiedWeather` shape:
```json
{
  "location": { "name": "Mumbai", "country": "IN", "lat": 19.07, "lon": 72.87 },
  "current": {
    "temp_c": 32.1, "feels_like_c": 36.0, "humidity": 78, "wind_kph": 14.0,
    "wind_dir": "SW", "condition": "Thunderstorm", "icon_code": "11d",
    "pressure_mb": 1005, "visibility_km": 6.0, "uv_index": 7
  },
  "provider": "openweathermap",
  "cached": false,
  "fetched_at": "2026-05-28T13:22:00Z"
}
```

---

### 3.2 Machine Learning  `/api/ml`

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/recommend` | `{N,P,K,temperature,humidity,ph,rainfall}` | `{recommended_crop, confidence, input_features}` |
| POST | `/crop-check` | `{N,P,K,temp,humidity,ph,rainfall,query}` | `CropCheckResponse` |

**`/recommend`** — currently a rule-based mock. Replace `backend/api/ml.py → recommend_crop()` with a real `.pkl` scikit-learn model when trained. The 7 input features are the standard Crop Recommendation Dataset features.

**`/crop-check`** — AI-powered. Extracts the crop from the `query` string (40+ crops, multilingual), calls the LLM with a strict JSON system prompt, returns structured suitability assessment:
```json
{
  "crop": "wheat",
  "suitability": "Suitable",
  "confidence": 88,
  "reason": ["Temperature 22°C — wheat ke liye ideal hai", "..."],
  "suggestions": ["50 kg DAP basal daalein", "..."],
  "alternatives": ["barley", "chickpea", "mustard"]
}
```

---

### 3.3 Chat / AI Assistant  `/api/chat`

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/stream` | `AssistantRequest` | SSE stream |
| POST | `/message` | `AssistantRequest` | `AssistantReply` JSON |
| POST | `/stt` | `{audio_base64, language}` | `{transcript, confidence}` |
| POST | `/tts` | `{text, language, voice}` | `{audio_base64, format}` |
| POST | `/session` | `{language, location}` | `{session_id}` |
| GET | `/health` | — | `{llm_configured, model, memory_backend, tools_enabled}` |

**`AssistantRequest` schema:**
```typescript
{
  session_id: string | null,   // null = new session
  message: string,
  language: "auto" | "hi" | "en" | "kn",
  stream: boolean,
  want_audio: boolean,
  image_base64: string | null,  // data: URI for disease diagnosis
  location?: { lat?, lon?, city? }
}
```

**SSE event types:** `session` → `tool_start` → `tool_end` → `token` (×N) → `done` | `error`

**Tool call flow:**
```
User message
  ↓ build_system_messages() → inject BASE_SYSTEM_PROMPT + optional DISEASE_DIAGNOSIS_PROMPT
  ↓ format_knowledge_context() → RAG retrieval from .md knowledge base
  ↓ LLM call with TOOL_SCHEMAS (function calling)
  ↓ if tool_calls → run_tool() in parallel → append results → loop (max 3 rounds)
  ↓ final LLM call → stream tokens → done
```

**Available LLM tools:**  
`get_weather`, `get_forecast`, `recommend_crop`, `list_schemes`, `post_job`, `search_jobs`, `suggest_wage`

**Model routing:**
- `GEMINI_API_KEY` starts with `AIza` → Google Gemini direct (12-model fallback chain starting with `gemini-1.5-flash-latest`)
- `OPENAI_API_KEY` → OpenAI / OpenRouter
- Disease image path → tries `gemini-1.5-pro-latest` first, temp=0.1, max_tokens=1500
- Fallback triggers: `NOT_FOUND`, `404`, `quota exceeded`, `resource_exhausted`

---

### 3.4 Mandi (Market Prices)  `/api/mandi`

| Method | Path | Returns |
|--------|------|---------|
| GET | `/crops` | `{ crops: MandiCrop[] }` |
| GET | `/crop/{id}` | `MandiCrop` |

`MandiCrop` has: `id, name, variety, price, unit, mandi, state, category, trend (up/down/stable), change_percent, min_price, max_price, modal_price, arrival_tonnes`

Currently returns mock APMC data. To go live: integrate with [data.gov.in Agmarknet API](https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi) or scrape state portals.

---

### 3.5 Government Schemes  `/api/schemes`

| Method | Path | Params | Returns |
|--------|------|--------|---------|
| GET | `/schemes` | `?state=`, `?category=` | `[Scheme]` |

Each `Scheme`: `{id, name, description, eligibility, benefit_amount, apply_url, youtubeLink, category, state_specific}`

Static dataset in `backend/api/schemes.py`. Add schemes by appending to the `SCHEMES_DATA` list.

---

### 3.6 Worker Connect  `/api/worker-connect`

| Method | Path | Body / Params | Returns |
|--------|------|---------------|---------|
| GET | `/jobs` | `?state=`, `?work_type=`, `?lat=`, `?lon=`, `?radius_km=` | `[WorkerJob]` |
| POST | `/jobs` | `WorkerJobCreate` | `WorkerJob` |
| PUT | `/jobs/{id}` | `{status}` | `WorkerJob` |

`WorkerJobCreate`: `{work_type, village, district, state, workers_needed, wage_amount, wage_unit, duration_days, contact_name, contact_phone, notes?, lat?, lon?}`

Jobs are persisted in SQLite via SQLAlchemy `WorkerJob` model. The AI chatbot can call `post_job` and `search_jobs` tools to interact with this endpoint conversationally.

---

### 3.7 IoT Sensor  `/api/sensor`

| Method | Path | Auth Header | Body / Params | Returns |
|--------|------|-------------|---------------|---------|
| POST | `/ingest` | `X-Sensor-Token` (optional) | `SensorReading` | `IngestResponse` |
| GET | `/latest` | — | `?device_id=` | `StoredReading` |
| GET | `/history` | — | `?device_id=&limit=` | `[StoredReading]` |
| GET | `/health` | — | — | `HealthResponse` (online/offline per device) |

`SensorReading`: `{device_id, temperature?, humidity?, soil_temperature?, soil_moisture?, raw_moisture?}`

Storage is in-memory (bounded deque, 50 readings per device). A device is "online" if seen within 120 seconds. Token auth controlled by `SENSOR_INGEST_TOKEN` env var (leave empty for open LAN use).

---

## 4. DATABASE SCHEMA

Engine: SQLite by default (`KrishiAI/backend/krishiai.db`). Switch to PostgreSQL by setting `DATABASE_URL` in `.env`.

```sql
users (id PK, phone_number UNIQUE, name, language, lat, lon, created_at)
crops (id PK, name UNIQUE, scientific_name, description)
farmer_fields (id PK, user_id FK, field_name, polygon_geojson, crop_id FK, sowing_date, soil_type)
disease_detections (id PK, user_id FK, field_id FK, image_url, detected_disease, confidence, remedy_suggested, detected_at)
chat_interactions (id PK, user_id FK, query_text, query_audio_url, response_text, response_audio_url, language, interacted_at)
worker_jobs (id PK, work_type, location, workers_needed, wage, contact_number, created_at)
```

> Note: The current auth system stores users in localStorage. The DB `users` table is ready for a proper backend auth flow when you add it.

---

## 5. ENVIRONMENT VARIABLES (complete list)

```ini
# backend/.env

# App
DEBUG=false
PROJECT_NAME=KrishiAI API

# LLM — pick ONE approach:
GEMINI_API_KEY=AIza...                # Google Gemini direct (PREFERRED for free tier)
OPENAI_API_KEY=sk-...                 # OpenAI or OpenRouter
OPENAI_BASE_URL=https://openrouter.ai/api/v1   # Optional: for OpenRouter
OPENAI_CHAT_MODEL=gemini-1.5-flash-latest      # Override model

# Weather (primary + fallbacks — configure as many as you have)
OPENWEATHERMAP_API_KEY=...
WEATHERAPI_API_KEY=...
TOMORROWIO_API_KEY=...
ACCUWEATHER_API_KEY=...

# Database (default: SQLite)
DATABASE_URL=sqlite:///./krishiai.db
# For Postgres: DATABASE_URL=postgresql://user:pass@host/dbname

# Cache
REDIS_URL=redis://localhost:6379/0    # Optional — falls back to in-memory

# Rate limiting
RATE_LIMIT_PER_MINUTE=60
CHAT_RATE_LIMIT_PER_MINUTE=30

# IoT
SENSOR_INGEST_TOKEN=                  # Optional shared secret for ESP32

# Voice (optional future providers)
SARVAM_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp.json

# CORS (already includes Vercel wildcard — add custom domains here)
# ALLOWED_ORIGINS=["https://myapp.com"]
```

---

## 6. FRONTEND — ALL PAGES

### 6.1 Public pages (no auth required)
| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing: dark hero, animated stats, services, testimonials, CTA |
| `/login` | `app/login/page.tsx` | Email + password login (custom JWT) |
| `/signup` | `app/signup/page.tsx` | Registration form |
| `/disease` | `app/disease/page.tsx` | Disease detection (works without login) |
| `/founders` | `app/founders/page.tsx` | Team profiles |

### 6.2 Auth-gated pages (redirect to `/login` if no JWT)
| Route | File | Key features |
|-------|------|--------------|
| `/dashboard` | `app/dashboard/page.tsx` | Greeting, 4 stat cards, weather card, feature shortcuts, alerts |
| `/crop-predictor` | `app/crop-predictor/page.tsx` | 7-param ML predictor + sensor sync + AI suitability widget |
| `/weather` | `app/weather/page.tsx` | Full weather hub with forecast + location search |
| `/mandi` | `app/mandi/page.tsx` | Crop price grid + category filter + buy/sell flow |
| `/schemes` | `app/schemes/page.tsx` | Govt scheme cards + YouTube embeds |
| `/chatbot` | `app/chatbot/page.tsx` | Full-screen chat interface |
| `/worker-connect` | `app/worker-connect/page.tsx` | Farm labour marketplace |

---

## 7. AUTHENTICATION SYSTEM

Custom lightweight JWT auth (no NextAuth, no Supabase).

**Client-side (`src/lib/auth.ts`):**
- `useAuth()` hook — reads `localStorage.getItem("krishiai_user")`, returns `{user, ready}`
- `loginUser(email, password)` — calls `POST /api/auth/login`, stores JWT in localStorage
- `logoutUser()` — clears localStorage, redirects to `/`
- User object shape: `{ id, name, email, token, phone? }`

**Auth guard pattern (every protected page):**
```typescript
const { user, ready } = useAuth()
useEffect(() => {
  if (ready && !user) router.replace("/login")
}, [ready, user, router])
if (!ready || !user) return <LoadingSpinner />
```

**To upgrade to proper backend auth:** Add `POST /api/auth/login` and `POST /api/auth/register` to FastAPI, issue real JWTs signed with a secret, validate them as Bearer tokens on protected routes.

---

## 8. AI SYSTEM — COMPLETE PIPELINE

### 8.1 System prompt architecture
Three layered prompts, combined per turn:

```
1. BASE_SYSTEM_PROMPT          (always injected)
   KrishiAI persona + full agri knowledge:
   - 7 seasonal crop calendars (Kharif/Rabi/Zaid)
   - Fertilizer doses per acre for 8 major crops
   - IPM pest management (with chemical doses + PPE rules)
   - 8 government schemes (exact amounts + apply URLs)
   - State-by-state regional notes (Punjab to Kerala)
   - Soil + irrigation rules of thumb
   - Market / MSP guidance
   - Response style rules (specific, actionable, numbered)
   - Safety rules (no banned pesticides, no burning residue)

2. DISEASE_DIAGNOSIS_PROMPT    (injected when: image uploaded OR disease keywords detected)
   Senior plant pathologist role + 200+ disease database covering:
   Cereals / Vegetables / Pulses / Cash Crops / Fruits / Nutrient Deficiencies
   + 6-step silent diagnostic reasoning + strict 10-section output format

3. WORKER_ASSISTANT_PROMPT     (injected when: job/labour keywords detected)
   Rural job marketplace specialist + tool usage rules for post_job/search_jobs

4. LANGUAGE CONTRACT           (always injected, language-specific)
   Forces reply in user's script (Hindi/Devanagari, Kannada, English)

5. LOCATION CONTEXT            (injected when location available)
   "USER LOCATION CONTEXT: city=X, lat=Y, lon=Z"

6. RAG KNOWLEDGE CONTEXT       (injected when relevant chunks found)
   Top-4 chunks from disease_diagnosis_protocol.md + soil_irrigation.md
```

### 8.2 Disease diagnosis output format (10 sections)
```
1. 🌾 Crop: <scientific + common name>
2. 🦠 Disease: <specific disease + scientific name>
3. 📊 Confidence: High/Medium/Low + reason
4. 📖 Problem Explanation: 2-3 farmer-friendly sentences
5. ⚠️ Causes: 3-5 specific contributing factors
6. 🏠 Organic Treatment: ≥2 items WITH quantities
7. 💊 Chemical Treatment: name + formulation + dose/L + interval + PPE warning
8. 🚜 Prevention: 4-6 bullets
9. 🔴 Severity: Low/Medium/High + rationale
10. 💰 Market Advice: yield impact + sell/hold + enam.gov.in
```

### 8.3 Language detection logic (`language_detect.py`)
```python
# Priority order:
1. Script detection: contains Devanagari → "hi", contains Kannada → "kn"
2. Keyword detection: Hindi/Kannada trigger words
3. langdetect library fallback
4. User's explicit language param
```

### 8.4 Session memory
- `SessionStore` uses in-memory dict: `{session_id → SessionState}`
- `SessionState`: `{id, messages: deque(maxlen=40), language, location, created_at}`
- `SessionStore.trim_for_prompt()`: keeps last 20 messages, truncates long ones to 800 chars
- No persistent sessions across server restarts (by design for MVP)

---

## 9. FRONTEND DESIGN SYSTEM (`globals.css`)

### CSS Custom Properties (tokens)
```css
/* Light mode */
--background: 140 15% 97%
--primary: 151 60% 38%        /* KrishiAI green */
--glass-bg: rgba(255,255,255,0.65)
--glass-border: rgba(255,255,255,0.3)
--gradient-brand: linear-gradient(135deg, #16a34a, #059669, #0d9488)

/* Dark mode */
--background: 224 40% 6%      /* deep dark blue-black */
--primary: 151 55% 45%
--glass-bg: rgba(10,15,30,0.6)
```

### Key utility classes
| Class | Effect |
|-------|--------|
| `.glass-panel` | Glassmorphism card (blur + border + shadow) |
| `.gradient-text` | Brand green gradient text |
| `.card-lift` | Hover: translateY(-4px) + shadow |
| `.animate-float` | 4s bob up/down |
| `.animate-pulse-glow` | 2.5s green glow pulse |
| `.animate-shimmer` | Loading shimmer sweep |
| `.animate-spin-slow` | 8s rotation |
| `.divider-gradient` | 1px green gradient horizontal rule |
| `.glow-green/sky/amber/purple` | Coloured box-shadow |

### Component library
- `GlassCard` — the primary card (glassmorphism + hover lift)
- `Button` — shadcn-style variants: default, outline, ghost
- `Slider` — Radix UI with Tailwind styling (used in crop predictor)
- `Input`, `Label` — form controls
- All icons from `lucide-react`
- Animations via `framer-motion`

---

## 10. IoT HARDWARE LAYER

### Sensor node hardware
| Component | Role | Pin (ESP32) |
|-----------|------|-------------|
| ESP32 DevKit V1 | WiFi MCU, main controller | — |
| DHT22 (AM2302) | Air temp + humidity | GPIO 4 |
| Capacitive Soil Moisture v2.0 | Soil moisture % | GPIO 34 (ADC1) |
| DS18B20 waterproof | Soil temperature | GPIO 5 |
| SSD1306 OLED 0.96" | Status display | I2C SDA=21 SCL=22 |

### Firmware logic (`hardware/krishiai_sensor_node.ino`)
```
setup():
  analogReadResolution(12)       // 0-4095 range
  dht.begin() + ds18b20.begin()
  OLED init (optional, continues without)
  connectWiFi()
  lastPost = millis() - POST_INTERVAL  // post immediately on first loop

loop():
  if WiFi disconnected → reconnect
  if millis() - lastPost >= POST_INTERVAL_MS (15000):
    read DHT22 → temperature, humidity
    read DS18B20 → soilTemp
    read soil ADC (median of 7 samples) → soilPercent()
    build JSON payload → sendReading() via HTTP POST
    showOLED() → display all 4 values + WiFi status

soilPercent():
  maps ADC [SOIL_AIR_VALUE(3200) .. SOIL_WATER_VALUE(1300)] → [0% .. 100%]
  CALIBRATE: put probe in dry air → note raw value → put in water → note value
```

### Data flow: ESP32 → Website
```
ESP32 POST /api/sensor/ingest
  → backend/api/sensor.py → stores in _store[device_id] deque
  → GET /api/sensor/latest (from SensorAutoFill.tsx)
  → handleSensorFill() → setParams({temperature, humidity})
  → crop predictor sliders update automatically
```

### Libraries needed (Arduino IDE)
```
DHT sensor library by Adafruit (v1.4.6+)
DallasTemperature + OneWire (for DS18B20)
Adafruit SSD1306 + Adafruit GFX Library (for OLED)
```

---

## 11. DEPLOYMENT

### Frontend — Vercel
```
Project: krishiai-steel
Framework: Next.js 14
Build: npm run build
Root: frontend-next/
Env: NEXT_PUBLIC_API_URL=https://krishiai-backend.onrender.com
```
Every push to `main` auto-deploys. Preview deploys on PRs.

### Backend — Render.com
```yaml
# render.yaml
services:
  - type: web
    name: krishiai-backend
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GEMINI_API_KEY   fromGroup: secrets
      - key: OPENWEATHERMAP_API_KEY  fromGroup: secrets
```

Free tier → spins down after 15 min inactivity. First request ~30s cold start. Use UptimeRobot pinging `/health` every 5 min to stay warm.

### Local development
```powershell
# Terminal 1 — Backend
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd frontend-next
npm run dev
# Opens http://localhost:3000
# API calls proxy to http://127.0.0.1:8000 via next.config.ts rewrites
```

Or just double-click `run-all.bat` which does both.

---

## 12. CURRENT STATUS (what's real vs mock)

| Feature | Status | Notes |
|---------|--------|-------|
| Weather (current + forecast) | ✅ LIVE | 4-provider fallback, cached |
| Disease detection (AI vision) | ✅ LIVE | GPT-4o / Gemini Pro vision |
| AI Chatbot (text) | ✅ LIVE | SSE streaming, tool calls |
| Crop recommendation (ML) | 🟡 MOCK | Rule-based; swap `.pkl` model |
| Crop suitability AI | ✅ LIVE | LLM JSON output |
| Mandi prices | 🟡 MOCK | Static dataset; integrate Agmarknet API |
| Government schemes | 🟡 STATIC | Accurate but manual update needed |
| Worker Connect (jobs board) | ✅ LIVE | SQLite persisted |
| IoT sensor ingest | ✅ LIVE | In-memory; add Redis for persistence |
| Auth (login/signup) | 🟡 PARTIAL | Frontend only (localStorage JWT) |
| STT / TTS (voice) | 🟡 PARTIAL | Web Speech API (browser-only) |
| Push notifications | ⏳ TODO | Service worker ready (PWA manifest) |
| Offline mode | ⏳ TODO | PWA manifest exists, SW not wired |

---

## 13. WHAT TO BUILD NEXT — PRIORITY ROADMAP

### P0 — Must-have for production
1. **Real ML crop model** — train RandomForest / XGBoost on [Kaggle Crop Recommendation Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset), save as `crop_model.pkl`, load in `backend/api/ml.py`
2. **Backend auth** — `POST /api/auth/register` + `/login` returning real JWTs; `Depends(get_current_user)` on protected routes
3. **Live Mandi data** — integrate `data.gov.in` Agmarknet API (free, JSON, updated daily)
4. **Persistent sessions** — move `SessionStore` from in-memory deque to Redis

### P1 — High value
5. **SMS/WhatsApp fallback** — Twilio or MSG91 for farmers without smartphones
6. **Disease image history** — store detections to `disease_detections` table; farmer can review past scans
7. **PWA offline mode** — cache disease diagnosis prompts + scheme data via Service Worker
8. **Sarvam.ai TTS** — replace browser TTS with high-quality Indian language voices

### P2 — Growth
9. **Real yield predictions** — time-series model using ICRISAT / IMD data per district
10. **Field mapping** — GeoJSON polygon editor on a map; per-field crop tracking
11. **FPO / multi-tenant** — one login for Farmer Producer Organisations
12. **Android app** — Capacitor.js wrapper around the existing PWA (minimal effort)

---

## 14. CODE CONVENTIONS

### Backend
- **One router file per domain**, thin controllers (≤50 lines). Business logic in `services/`.
- All settings via `core/config.py` (Pydantic BaseSettings). Never `os.getenv()` directly.
- Async everywhere (`async def`, `AsyncOpenAI`, `httpx.AsyncClient`).
- Pydantic models for all request/response bodies. No bare dicts as API contracts.
- Logging: `log = logging.getLogger(__name__)` — never `print()`.
- Fallback-first: every external API call has a try/except with degraded response.

### Frontend
- All pages are `"use client"` components (no RSC for now).
- State: `useState` + `useEffect`. No Redux. No Zustand (yet).
- API calls: plain `fetch()`. No axios. No React Query (yet).
- Styling: Tailwind utility classes only. No inline styles. No CSS Modules.
- Component naming: `PascalCase.tsx`. Hooks: `use*.tsx`.
- Never import from `@/app/*` — only `@/components/*` and `@/lib/*`.
- Framer Motion for page-level animations; CSS animations for micro-interactions.

### Git
- Branch: feature branches → `main`. No develop branch.
- Commit format: `feat(module): description` | `fix(module): description` | `chore: description`
- Use `PUSH-UI-UPGRADE.bat` (or any `PUSH-*.bat`) for Windows git push — handles lock file clearing.

---

## 15. SECURITY CHECKLIST

| Item | Status |
|------|--------|
| API keys in `.env` (gitignored) | ✅ |
| CORS restricted to Vercel + localhost | ✅ |
| Rate limiting (slowapi) on all routes | ✅ (60/min IP) |
| Chat rate limit separate (30/min) | ✅ |
| Sensor token auth (optional) | ✅ |
| No API keys in frontend code | ✅ |
| Banned pesticide list enforced in prompt | ✅ |
| No LLM-generated phone numbers passed to user | ✅ |
| HTTPS enforced (Vercel + Render) | ✅ |
| Input validation (Pydantic) on all endpoints | ✅ |
| **Auth tokens in localStorage** (XSS risk) | ⚠️ Move to HttpOnly cookie |
| **No CSRF protection** | ⚠️ Add when backend auth is real |
| **SQLite in production** | ⚠️ Switch to PostgreSQL |
| **Sensor store in-memory** (lost on restart) | ⚠️ Add Redis persistence |

---

## 16. QUICK REFERENCE — KEY FUNCTIONS

| Function | File | What it does |
|----------|------|-------------|
| `ChatOrchestrator.stream_chat()` | `services/chat/chat_service.py` | Full LLM pipeline: system prompt → RAG → tool loop → SSE stream |
| `ChatOrchestrator._call_with_fallbacks()` | same | LLM call with 12-model Gemini fallback chain |
| `build_system_messages()` | `services/chat/prompts.py` | Composes base + disease + worker + lang + location prompts |
| `_looks_like_disease_query()` | same | 80+ keyword heuristic in 3 languages |
| `extract_crop_from_query()` | `api/ml.py` | Finds crop name from Hindi/Kannada/English text (40+ crops) |
| `resolveUserLocation()` | `lib/weather-api.ts` | Browser GPS → if denied, IP geolocation fallback |
| `streamMessage()` | `lib/assistant-api.ts` | Async generator that reads SSE stream from `/api/chat/stream` |
| `useAuth()` | `lib/auth.ts` | Reads JWT from localStorage, decodes, returns `{user, ready}` |
| `soilPercent()` | `hardware/krishiai_sensor_node.ino` | Maps ADC value → 0-100% moisture using calibrated min/max |
| `format_knowledge_context()` | `services/chat/knowledge.py` | RAG: embeds query, finds top-k chunks from .md knowledge base |

---

## 17. HOW TO EXTEND KRISHIAI — PRACTICAL PATTERNS

### Add a new backend route
```python
# 1. Create backend/api/my_feature.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/data")
def get_data():
    return {"hello": "world"}

# 2. Register in backend/main.py
from api import my_feature
app.include_router(my_feature.router, prefix="/api/my-feature", tags=["My Feature"])
```

### Add a new frontend page
```typescript
// 1. Create frontend-next/src/app/my-page/page.tsx
"use client"
export default function MyPage() { return <div>Hello</div> }

// 2. Add to Header.tsx NAV_LINKS array
{ href: '/my-page', label: 'My Page', icon: SomeIcon },
```

### Add a new LLM tool
```python
# 1. Add schema to TOOL_SCHEMAS in prompts.py
{ "type": "function", "function": { "name": "my_tool", "description": "...", "parameters": {...} } }

# 2. Add executor in tools.py
async def my_tool_handler(args: dict) -> dict:
    return {"result": "..."}

# 3. Register in run_tool() dispatcher in tools.py
if name == "my_tool":
    return await my_tool_handler(args)
```

### Add a new crop to ML recogniser
```python
# In backend/api/ml.py → CROP_KEYWORDS dict
"hemp": ["hemp", "भांग", "bhang", "ಗಾಂಜಾ"],
```

### Add a new government scheme
```python
# In backend/api/schemes.py → SCHEMES_DATA list
{
    "id": 15,
    "name": "PM-PRANAM",
    "description": "Promotes alternative fertilisers and organic farming",
    "eligibility": "All farmers using chemical fertilisers",
    "benefit_amount": "State-dependent incentive",
    "apply_url": "https://daf.gov.in",
    "youtubeLink": "https://youtube.com/watch?v=...",
    "category": "subsidy",
    "state_specific": None,
},
```

---

## 18. PROMPT TEMPLATES FOR COMMON TASKS

Use these when asking an AI assistant to work on specific parts of KrishiAI:

### Fix a bug
> "I'm working on KrishiAI (context: KRISHIAI_MASTER_PROMPT.md). In `[file]`, the `[function]` function has this bug: `[describe bug]`. The expected behavior is `[expected]`. Current behavior: `[actual]`. Please fix it."

### Build a new feature
> "In KrishiAI, I need to add `[feature name]`. It should work like: `[description]`. It needs to call `[endpoint]` and show `[UI description]`. Follow the existing patterns — use GlassCard for UI, async/await for API calls, Pydantic for backend schemas."

### Review code
> "Review this KrishiAI code for correctness, security, and adherence to our conventions (see KRISHIAI_MASTER_PROMPT.md Section 14): `[paste code]`"

### Debug an API error
> "KrishiAI's `[endpoint]` is returning `[error]`. The handler is in `[file]`. The request body is `[json]`. What's wrong and how do I fix it?"

### Extend the AI chatbot
> "Add a new capability to KrishiAI's chatbot: when a user asks about [topic], it should [behavior]. The AI prompt is in `backend/services/chat/prompts.py`. Should I add a new tool, extend BASE_SYSTEM_PROMPT, or create a new specialist prompt like DISEASE_DIAGNOSIS_PROMPT?"

---

*This document was auto-generated from the KrishiAI codebase on 2026-05-28.*  
*Maintainer: Utkarsh Sinha (utkarsh.sinha.dev@gmail.com)*  
*License: MIT — Free for use by any Indian farmer, NGO, or agri-tech company.*
