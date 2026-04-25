# 🌾 KrishiAI — Smart Farmer Decision Intelligence

AI-first platform for Indian farmers: crop disease detection, yield/price prediction, government schemes, multilingual voice chatbot, and real-time weather.

Built per the **KrishiAI Blueprint** (Phase 1–13): FastAPI backend + Next.js PWA frontend.

---

## ✨ Features (MVP)

| Module | Endpoint | Status |
|---|---|---|
| Current weather (coords or city) | `GET /api/weather/current` | ✅ Multi-provider with fallback |
| Hourly + daily forecast | `GET /api/weather/forecast` | ✅ Multi-provider with fallback |
| Location autocomplete | `GET /api/weather/search` | ✅ Debounced on frontend |
| IP geolocation | `GET /api/weather/geoip` | ✅ Fallback for blocked browser geo |
| Provider/cache health | `GET /api/weather/health` | ✅ Diagnostics |
| Crop recommendation (N-P-K + weather) | `POST /api/ml/recommend` | 🟡 Mock model — swap in trained `.pkl` |
| Government schemes | `GET /api/schemes` | 🟡 Static dataset |
| Multilingual voice + chat assistant | `POST /api/chat/message` (SSE), `/stt`, `/tts`, `/session`, `/health` | ✅ Streaming, tool use, Hindi/Kannada/English |
| Disease detection | `POST /api/v1/disease/detect` | ⏳ Planned — CNN on PlantVillage |

---

## 📁 Project Structure

```
KrishiAI/
├── backend/                  # FastAPI app
│   ├── api/                  # Route handlers (thin controllers)
│   │   ├── weather.py
│   │   ├── ml.py
│   │   ├── schemes.py
│   │   └── chatbot.py
│   ├── core/                 # App settings (pydantic-settings)
│   │   └── config.py
│   ├── schemas/              # Pydantic request/response models
│   ├── services/             # Business logic + 3rd-party API calls
│   │   └── weather_service.py
│   ├── db/                   # SQLAlchemy models + session
│   │   ├── session.py
│   │   └── models.py
│   ├── crud/                 # DB access helpers
│   ├── main.py               # FastAPI entrypoint
│   ├── requirements.txt
│   ├── .env                  # secrets (gitignored)
│   └── .env.example
├── frontend-next/            # Next.js 14 PWA (primary)
│   └── src/app/
│       ├── page.tsx          # Home
│       ├── chatbot/page.tsx
│       ├── crop-predictor/page.tsx
│       └── schemes/page.tsx
├── frontend/                 # Legacy plain HTML (kept for reference)
├── .vscode/                  # VS Code launch + Python settings
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart

### 1. Backend (FastAPI)

```powershell
cd backend

# Activate existing venv (already present)
.\venv\Scripts\activate

# Install updated deps (adds httpx, pydantic-settings, python-multipart)
pip install -r requirements.txt

# .env already has the real OpenWeatherMap key configured.
# Run dev server:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open:

- Docs (Swagger): <http://localhost:8000/docs>
- Weather smoke test: <http://localhost:8000/api/weather/current?q=Delhi>
- Health: <http://localhost:8000/api/weather/health>

### 2. Frontend (Next.js)

```powershell
cd frontend-next
npm install
npm run dev
```

Opens on <http://localhost:3000>. Talks to backend at `http://localhost:8000` (configure via `NEXT_PUBLIC_API_URL` if deployed).

---

## 🔑 API Keys

All secrets live in `backend/.env` (gitignored). Template: `backend/.env.example`.

| Var | Needed for | Get one |
|---|---|---|
| `OPENWEATHERMAP_API_KEY` | Weather module | <https://home.openweathermap.org/api_keys> |
| `WEATHERAPI_API_KEY` | (Optional fallback) | <https://www.weatherapi.com/signup.aspx> |
| `OPENAI_API_KEY` | Chatbot (LLM) | <https://platform.openai.com/api-keys> |

> **Note:** Freshly generated OpenWeatherMap keys take roughly **10 minutes** to activate. If you see a 401 immediately after creating, wait and retry.

---

## 🧩 Blueprint → Code Map

| Blueprint section | Lives in |
|---|---|
| Phase 2 — Modules (CV, NLP, Time-Series, Reco, KG) | `backend/services/` (one file per engine) |
| Phase 4 — Model strategy | `backend/ml_models/` (trained weights go here, gitignored) |
| Phase 12 — Backend folder structure | `backend/{api,core,crud,db,schemas,services}` |
| Phase 12 — DB schema (users, crops, fields, detections, chats) | `backend/db/models.py` |
| Phase 12 — API routes (`/api/v1/...`) | `backend/api/*.py` |
| Phase 10 — Offline-first PWA | `frontend-next/` (Next.js + service worker — TODO) |

---

## 🗺️ MVP Roadmap (Blueprint Phase 7)

- **Week 1–2:** Weather integration, basic UI, PWA shell
- **Week 3–4:** Disease detection CNN (PlantVillage dataset), NLP backend stub
- **Week 5–6:** Closed beta with 50–100 farmers

Current progress: weather ✅, crop reco (mock) ✅, schemes (static) ✅, chatbot (stub) 🟡, disease detection ⏳.

---

## 🧪 Quick test (after starting backend)

```bash
curl "http://localhost:8000/api/weather/current?q=Lucknow"
curl "http://localhost:8000/api/weather/current?lat=28.6139&lon=77.2090"
curl -X POST http://localhost:8000/api/ml/recommend \
  -H "Content-Type: application/json" \
  -d '{"N":90,"P":42,"K":43,"temperature":27,"humidity":80,"ph":6.5,"rainfall":220}'
```

---

## 🌦️ Weather System Architecture

The weather module is the flagship feature — production-grade, highly available, and designed to work reliably across patchy rural internet.

### Provider chain (auto-fallback)

Priority order, lowest → highest. A miss/error on one provider automatically falls through to the next.

| # | Provider | Priority | Free tier | Notes |
|---|---|---|---|---|
| 1 | OpenWeatherMap | 10 | 60/min, 1M/month | Primary; best global coverage |
| 2 | WeatherAPI.com | 20 | 1M/month | Best hourly granularity |
| 3 | Tomorrow.io | 30 | 500/day | High-quality agri-relevant fields |
| 4 | AccuWeather | 40 | 50/day | Last resort; limited quota |

Missing keys disable their provider automatically — the system works with just one key set.

### Caching

Dual-backend cache with identical async interface:

- **Redis** (`redis.asyncio`) if `REDIS_URL` is set — recommended for prod.
- **In-memory TTL dict** fallback — fine for dev, zero infra needed.

TTLs per endpoint: current **5 min**, forecast **15 min**, location search **1 hr**. Cache keys round coords to 2 decimals (~1 km radius) to maximise hit rate without hurting accuracy.

### Geolocation

Three-step chain on the frontend: **Browser Geolocation API → `/api/weather/geoip` (ip-api.com) → Delhi default**. Private/loopback IPs are skipped server-side.

### Rate limiting

Per-IP via **slowapi**, default **60 req/min**. Location search is lenient (2× default) because it fires per keystroke.

### Data flow

```
Browser ──► Next.js rewrite /api/weather/*  ──►  FastAPI router (rate-limited)
                                                        │
                                                        ▼
                                          WeatherOrchestrator (async)
                                                        │
                                        ┌───────────────┼───────────────┐
                                        ▼               ▼               ▼
                                  Cache (Redis   Provider chain    Health probe
                                  or in-mem)    (OWM → Wx →
                                                  Tomorrow →
                                                  AccuWx)
```

### Frontend surface

- `src/lib/weather-api.ts` — typed client (`getCurrentByCoords`, `getForecastByCoords`, `searchLocations`, `resolveUserLocation`, …)
- `src/components/weather/` — `WeatherCard`, `LocationSearch` (debounced), `HourlyForecast`, `DailyForecast`, `UnitToggle`, `UnitProvider`
- `src/app/weather/page.tsx` — full dashboard at `/weather`
- `src/app/page.tsx` — home uses `WeatherCard` directly for at-a-glance conditions

### Deployment & scaling

1. Set all provider keys you have access to in production `.env` — the orchestrator auto-activates them.
2. Point `REDIS_URL` at managed Redis (Upstash, Elasticache, etc.) — shared cache across replicas.
3. Put the FastAPI app behind Uvicorn workers + Nginx/Caddy. Horizontal scaling is trivial because the orchestrator is stateless aside from the httpx client pool.
4. For edge/PWA deploys, the Next.js app can run on Vercel; `next.config.mjs` rewrites `/api/*` to the FastAPI origin.
5. Swap `GEOIP_PROVIDER_URL` for a paid service (ipinfo, MaxMind) if you exceed 45 req/min.

---

## 🗣️ Voice + Chat Assistant Architecture

KrishiAI's voice assistant is a production-grade, streaming, multilingual agent tailored to Indian farmers. It's implemented as a fully modular subsystem so providers (LLM, STT, TTS) and the UI widget can be swapped without touching the rest of the app.

### Capabilities

- **Languages:** English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ) — both script-native and "Hinglish" Latin-script are detected per turn; the LLM replies in the user's language by contract, not literal translation.
- **Modes:** text chat, voice (press mic), or mixed. Browser Web Speech API is used when available for zero-latency STT/TTS; Whisper + server-side TTS kick in otherwise.
- **Streaming:** tokens arrive via Server-Sent Events so responses feel instant (<2 s to first token on typical broadband).
- **Tool use:** the LLM can call backend tools in parallel during a turn — `get_weather`, `get_forecast`, `recommend_crop`, `list_schemes`. All are read-only and sandboxed (errors are returned as JSON, never raised).
- **Voice interruption:** tapping the mic while the assistant is speaking instantly cancels TTS.
- **Sticky context:** language preference, location (lat/lon), and session id are persisted in `localStorage` so the widget survives navigations.
- **Graceful degradation:** if Sarvam/Google/OpenAI TTS aren't configured, the server returns a JSON hint and the browser's SpeechSynthesis speaks the reply. If Whisper isn't available, browser STT is used exclusively.

### Endpoints

| Route | Method | Purpose |
|---|---|---|
| `/api/chat/message` | POST | Send a message. `stream: true` (default) → SSE; `stream: false` → JSON reply. |
| `/api/chat/stt` | POST (multipart) | Transcribe uploaded audio via Whisper-1. Returns `{transcript, language, …}`. |
| `/api/chat/tts` | POST | Synthesize speech. Returns `audio/*` bytes or a JSON hint for browser fallback. |
| `/api/chat/session` | POST / GET / DELETE | Create / fetch / reset a chat session (in-memory or Redis). |
| `/api/chat/health` | GET | Provider + memory + rate-limit status. |
| `/api/chat/` | POST | Legacy `{message} → {reply}` endpoint — kept for the old `/chatbot` page. |

All `/api/chat/*` routes are rate-limited per IP via `CHAT_RATE_LIMIT_PER_MINUTE` (default 30/min).

### SSE event stream

Each turn yields ordered events:

```
event: session     data: {"session_id":"…","language":"hi"}
event: tool_start  data: {"name":"get_weather"}
event: tool_end    data: {"name":"get_weather","ok":true}
event: token       data: {"text":"आज का मौसम "}
…
event: done        data: {"session_id":"…","message_id":"…","used_tools":["get_weather"],"finish_reason":"stop"}
```

### Backend layout

```
backend/services/chat/
├── __init__.py
├── language_detect.py     # script-based + langdetect fallback (en/hi/kn)
├── memory.py              # SessionStore: in-memory ↔ Redis; sliding TTL
├── prompts.py             # system prompt + language contract + TOOL_SCHEMAS
├── tools.py               # sandboxed registry: get_weather / get_forecast /
│                          #                     recommend_crop / list_schemes
├── stt_service.py         # Whisper wrapper (AsyncOpenAI)
├── tts_service.py         # Sarvam Bulbul -> Google Neural2 -> OpenAI tts-1
│                          #                                 -> browser hint
└── chat_service.py        # ChatOrchestrator: tool-call loop + SSE stream
```

The orchestrator runs the tool-call rounds non-streaming (clean JSON tool args, bounded by `MAX_TOOL_ROUNDS=3`), then switches to streaming for the final text pass — avoiding the OpenAI streaming-with-tools edge cases.

### Frontend layout

```
frontend-next/src/
├── lib/assistant-api.ts          # typed client + SSE parser
└── components/assistant/
    ├── AssistantWidget.tsx       # floating FAB, mounted once in layout.tsx
    ├── ChatPanel.tsx             # expanded panel (messages + composer)
    ├── ChatMessage.tsx           # role-coloured bubble + tool chips
    ├── MicButton.tsx             # mic toggle with listening pulse
    ├── LanguagePicker.tsx        # auto / EN / हिं / ಕನ್ನ
    ├── TranscriptLive.tsx        # interim STT preview
    ├── useAssistant.tsx          # session + streaming state
    └── useSpeech.tsx             # browser STT/TTS + MediaRecorder (Whisper)
```

`<AssistantWidget />` is mounted exactly once in `src/app/layout.tsx` so it floats on every page without touching existing routes. The panel is loaded with `next/dynamic({ ssr: false })` so browser-only APIs (SpeechRecognition, SpeechSynthesis, MediaRecorder) never execute server-side.

### Swapping providers

Every provider sits behind a thin adapter in `services/chat/*`. To swap LLMs, change `OPENAI_CHAT_MODEL` (or extend `chat_service.py` with another client). To add Bhashini/AI4Bharat for STT/TTS, add a new function and insert it into the fallback chain in `stt_service.py` / `tts_service.py` — no other code needs to change.

### Configuration

```
OPENAI_API_KEY=sk-…                 # required for LLM + Whisper STT
OPENAI_CHAT_MODEL=gpt-4o-mini       # or gpt-4o
SARVAM_API_KEY=…                    # optional — Indic Bulbul TTS
GOOGLE_APPLICATION_CREDENTIALS=…    # optional — Neural2 TTS (absolute path)
CHAT_RATE_LIMIT_PER_MINUTE=30       # per-IP, separate from weather limit
```

---

## 📜 License

TBD (add LICENSE file before public release).
