# API Reference

This document maps the primary HTTP endpoints provided by the KisaanBuddy FastAPI backend.

---

## 🔐 Authentication Router
**Prefix:** `/api/auth`

- `POST /register`: Register a new farmer using email + password credentials.
- `POST /send-otp`: Sends a 6-digit OTP to Indian mobile numbers via SMS.
- `POST /verify-otp`: Validates the mobile OTP. If the number is unregistered, returns a temporary registration token. If registered, sets session cookies.
- `POST /login`: Standard password sign-in. Sets secure cookie tokens.
- `POST /google`: Authenticates Google ID credentials.
- `GET /me`: Fetches the authenticated user profile.
- `POST /logout`: Revokes the current session and clears HTTP-only cookies.

---

## 🌦️ Weather Router
**Prefix:** `/api/weather`

- `GET /current?lat=&lon=`: Fetch unified current conditions from active providers.
- `GET /current?q=`: Fetch conditions using city name autocomplete.
- `GET /forecast?lat=&lon=&days=5`: Fetch hourly and 5-day daily forecast graphs.
- `GET /search?q=`: Debounced location autocomplete endpoints.
- `GET /geoip`: Resolves the client's public IP to geographical coordinates.
- `GET /health`: Diagnostic panel showing provider statuses and cache hits.

---

## 💬 Chatbot Assistant Router
**Prefix:** `/api/chat`

- `POST /message`: Streaming assistant messaging endpoint utilizing Server-Sent Events (SSE). Accepts requests with `image_base64` fields for disease diagnosis.
- `POST /stt`: Transcribes multipart audio recordings into text using Whisper-1.
- `POST /tts`: Translates textual responses to audio bytes.
- `POST /session`: Creates or resets assistant memory configurations.
- `GET /health`: Health overview for LLM, STT, and TTS integrations.

---

## 🌾 Machine Learning & Mandi Routers
- `POST /api/ml/recommend`: Mock rule-based crop recommendation based on N-P-K ratios, temperature, and pH values.
- `POST /api/ml/crop-check`: Suitability assessment based on natural language farm queries.
- `GET /api/mandi/crops`: Fetch market prices from the data.gov.in AGMARKNET feed.
