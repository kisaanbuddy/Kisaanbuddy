# KisaanBuddy Backend V2 — Part 2 State Audit Specification
## Process-Local State Inventory & Externalization Plan

---

## 1. INVENTORY OF PROCESS-LOCAL STATE

| Component | Current Location | Purpose | Lifetime | Must Survive Restart? | Must Be Shared Across Instances? | Target Classification |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **Live Sensor Telemetry** | `backend/api/sensor.py` (`_store: Dict[str, deque]`) | Holds newest 50 telemetry readings per device ID for fast client query | Ephemeral / 15-second ingest cycles | No | **YES** | `SHARED_STATE_REQUIRED` (Redis String / Hash) & `PERSISTENT_DATABASE_STATE` (PostgreSQL `SensorReadingHistory`) |
| **Active Auth Sessions** | `backend/api/auth.py` (`active_sessions: dict[int, list[dict]]`) | Tracks multi-device user logins and active session tokens | Session TTL (30 days) | **YES** | **YES** | `PERSISTENT_DATABASE_STATE` (`UserSession` DB table) & `SHARED_STATE_REQUIRED` (Redis Session Revocation Token Set) |
| **Weather API Cache** | `backend/services/weather_cache.py` (`cache: Dict[str, Tuple[float, Any]]`) | Prevents duplicate upstream weather API calls | 5 to 60 minutes TTL | No | **YES** | `CACHE` (Redis Key/Value with TTL) |
| **IP Rate Limiter** | `slowapi` (`Limiter` in `backend/main.py`) | Prevents API flooding and brute force attacks | 1 minute rolling window | No | **YES** | `SHARED_STATE_REQUIRED` (Redis Rate Limiter Key) |
| **Async AI / Disease Detection / TTS Jobs** | Synchronous execution in `backend/api/ml.py` & `backend/api/chatbot.py` | Runs Gemini inference, image disease analysis, and Sarvam/OpenAI speech TTS synthesis | Request duration | **YES** | **YES** | `QUEUE` (Redis-backed Async Task Queue + Job State Hash) |
| **Media Binary Uploads** | `StorageService` (`backend/services/storage.py`) | Serves user & owner uploaded images | Permanent | **YES** | **YES** | `OBJECT_STORAGE` (S3 / Local volume abstraction) |

---

## 2. CLASSIFICATION STRATEGY

1. **`SHARED_STATE_REQUIRED` -> Redis Key/Value & Redis Hashes**
   - Telemetry latest state: `sensor:latest:{device_id}` (Redis Hash / String with TTL).
   - Session revocation tokens: `session:revoked:{token}`.
   - Rate limit counters: `ratelimit:{ip}:{endpoint}`.

2. **`PERSISTENT_DATABASE_STATE` -> PostgreSQL**
   - Historical sensor telemetry readings: `sensor_readings_history` table in PostgreSQL.
   - User account & authentication data: `users`, `user_sessions`, `user_otps` tables.

3. **`QUEUE` -> Redis-backed Async Worker Pool (ARQ / Celery)**
   - Disease detection image processing.
   - TTS voice synthesis generation.

4. **`CACHE` -> Redis String Keys with TTL**
   - Weather forecasts & mandi market prices.
