# Backend Services

This document details the KisaanBuddy FastAPI backend architecture and service layer design.

---

## Technical Architecture

The backend is built on **FastAPI** to leverage asynchronous execution (`async`/`await`) for concurrent I/O operations (fetching external APIs, db calls).

### Directory Layout
- `/api`: Thin controllers/routers exposing endpoints. They validate requests via Pydantic schemas and delegate work to services.
- `/core`: Global configuration settings and rate-limiting modules.
- `/db`: Database schemas, connection factories, and raw migration tools.
- `/schemas`: Request/Response validation models (Pydantic).
- `/services`: Core business logic (weather orchestrator, chat, jobs).
- `/utils`: Helper utilities like geolocation resolution.

---

## Core Backend Services

### 1. Weather Service Orchestrator
- **File:** `services/weather_service.py`
- **Class:** `WeatherOrchestrator`
- **Functionality:** Implements a priority-based fallback chain across four providers. The orchestrator opens a shared async `httpx.AsyncClient` pool on application startup and coordinates caching. Coordinates are rounded to 2 decimal places to maximize local cache hit rate.

### 2. Mandi Pricing API
- **File:** `api/mandi.py`
- **Functionality:** Fetches real-time market data from the government's AGMARKNET API (data.gov.in) with an automatic offline fallback to curated static data in the repository if the government service is offline or rate-limited.

### 3. Worker Connect
- **File:** `services/jobs_service.py`
- **Functionality:** Provides a localized marketplace for agricultural laborers. It implements thread-safe, atomic file writes to `jobs.json` to enable a zero-configuration developer experience.
