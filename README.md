# KisaanBuddy — Smart Agricultural Intelligence Platform

KisaanBuddy is an AI-first agricultural decision support system designed specifically for Indian farmers. The platform integrates localized weather forecasting, government mandi prices, scheme discovery, and a multilingual voice-enabled assistant to help farmers make informed decisions about crop management, harvesting, and sales.

The system is structured as a stateless FastAPI backend and a Next.js PWA frontend, optimized to perform reliably under unstable rural network conditions.

---

## 🛠️ System Architecture Overview

KisaanBuddy is designed to be highly modular. Each functional domain is decoupled into independent service modules in the backend, communicating with the frontend via typed REST endpoints and Server-Sent Events (SSE).

```
+--------------------------------------------------------------+
|                         Next.js Web PWA                      |
+--------------------------------------------------------------+
                                |
                 HTTP REST / SSE Stream (/api/*)
                                |
                                v
+--------------------------------------------------------------+
|                        FastAPI Server                        |
+--------------------------------------------------------------+
       |                  |                  |             |
       v                  v                  v             v
+-------------+    +-------------+    +-------------+ +----------+
|   Weather   |    |    Voice    |    |    Mandi    | |  Worker  |
|Orchestrator |    |  Assistant  |    | Pricing API | | Connect  |
+-------------+    +-------------+    +-------------+ +----------+
       |                  |                  |             |
  (Multi-API     (Google/Sarvam/LLM)    (Agmarknet    (Flat-file /
  Cache Chain)                          Live API)      SQLite DB)
```

### Decoupled Core Services
1. **Weather Orchestrator:** Implements a fallback chain across OpenWeatherMap, WeatherAPI, Tomorrow.io, and AccuWeather. Coordinates are rounded to 2 decimal places to maximize local cache hits. It falls back to an in-memory TTL dictionary if Redis is unconfigured.
2. **Voice + Chat Assistant:** Uses Server-Sent Events (SSE) to stream agricultural guidance in Hindi, Kannada, and English (including Hinglish/transliterations). Integrates tool use (weather, mandi prices, schemes) and vision capability to analyze crop diseases from uploaded plant photos.
3. **Mandi Pricing Service:** Integrates with the official Indian AGMARKNET repository via data.gov.in. Uses a mock data fallback when the external government gateway experiences downtime.
4. **Worker Connect Marketplace:** A local job matching board allowing farmers to find agricultural labor. Backed by a thread-safe, atomically-replaced flat-file repository for zero-infrastructure setups.

---

## 💻 Tech Stack

### Backend
- **Core Framework:** Python 3.11 with FastAPI (async orchestration)
- **Database ORM:** SQLAlchemy (SQLite locally, pre-wired for PostgreSQL in production)
- **Rate Limiting:** SlowAPI (IP-based limit enforcement)
- **NLP / ML:** Scikit-Learn, Pandas, NumPy, OpenAI SDK (for LLM and Whisper STT)

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** TailwindCSS, Framer Motion (for interface animations)
- **Components:** Radix UI primitives
- **Analytics:** Vercel Web Analytics

---

## 🚀 Local Developer Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your environment variables:
   Copy `.env.example` to `.env` and fill in your API keys (e.g., `OPENWEATHERMAP_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`).
5. Run the development server:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

The Swagger UI documentation is available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend-next
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```

The application runs locally on `http://localhost:3000`.

---

## 🧪 Running Unit Tests

The backend includes a comprehensive unit test suite covering user authentication, OTP generation, rate-limiting, and session management.

Run tests using the virtual environment python:
```bash
cd backend
python -m unittest discover -s tests
```

---

## ☁️ Deployment

### Backend (FastAPI)
The backend is configured for deployment on **Render.com** (Oregon region) using the included `render.yaml` specification.
- Ensure all environment variables are added in the Render Dashboard environment settings.
- Database migrations are automatically verified and executed on startup within the application lifecycle lifespan.

### Frontend (Next.js)
The frontend is optimized for deployment on **Vercel**.
- Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed Render URL.
- Setup redirects and API proxies inside `next.config.mjs` for clean routing.
