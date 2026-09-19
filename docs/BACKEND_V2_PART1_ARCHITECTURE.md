# KisaanBuddy Backend V2 — Part 1 Architecture Specification
## Production Foundation, Database & Security

---

## 1. ARCHITECTURAL OVERVIEW & OBJECTIVES

KisaanBuddy Backend V2 Part 1 establishes a production-grade, secure, stateless, and scalable foundation for the KisaanBuddy platform. 

### Core Objectives
1. **Database Persistence & Production Safeguards:** Enforce managed PostgreSQL for production environments with connection pooling (`pool_pre_ping`, `pool_size`, `max_overflow`), transactional migration workflows (Alembic), and strict production fallback controls.
2. **Media & Blob Decoupling:** Eliminate binary payload storage (`LargeBinary`) inside relational database tables. Offload media to Object Storage (AWS S3 / Cloudflare R2 / local persistent volume in dev) and store metadata/URIs in SQL tables.
3. **Security Hardening:** 
   - Eliminate hardcoded default API keys and fallback credentials across all configuration files.
   - Restrict Cross-Origin Resource Sharing (CORS) from permissive regex matching to explicit trusted origin validation.
   - Enforce server-side Role-Based Access Control (RBAC) and purge client-side role mutation assumptions.
   - Tighten Content Security Policy (CSP) headers.
4. **Stateful In-Memory Externalization Scaffold:** Abstract process-local memory (`deque`, process-level dictionaries) behind interface layers to prepare for Redis integration across horizontal worker instances.
5. **Comprehensive Deep Health Probes:** Upgrade simple status endpoints to deep health/readiness checks probing database connectivity, cache status, and core service availability.

---

## 2. CURRENT VS INTENDED ARCHITECTURE

```
                      CURRENT ARCHITECTURE (v1 Baseline)
+-------------------------------------------------------------------------------+
| FastApi Monolith (Process-bound RAM: deque, active_sessions, in-memory limit)  |
+-------------------------------------------------------------------------------+
       |                                      |                        |
       v                                      v                        v
 SQLite (krishiai.db)                Hardcoded Secrets         Loose CORS Regex
 (File Lock / LargeBinary Media)     (2FACTOR_API_KEY)         (*.vercel.app)
+-------------------------------------------------------------------------------+
```

```
                     INTENDED PART 1 ARCHITECTURE (v2 Foundation)
+-------------------------------------------------------------------------------+
| FastApi Stateless Monolith (Dependency Injected Services & Secure Settings)   |
+-------------------------------------------------------------------------------+
       |                     |                     |                   |
       v                     v                     v                   v
PostgreSQL / Alembic   Object Storage      Strict CORS Domain   Externalized Cache/
(Connection Pooled)   (S3 Presigned/URL)  Whitelist & Secrets  Session Abstraction
+-------------------------------------------------------------------------------+
```

---

## 3. DATABASE ARCHITECTURE & MIGRATION STRATEGY

### 3.1 Connection Management (`backend/db/session.py`)
- **Production Mode:** Requires `DATABASE_URL` pointing to PostgreSQL (`postgresql+psycopg2://...` or `postgresql+asyncpg://...`). SQLite is strictly disabled when `ENVIRONMENT=production` or `DEBUG=false`.
- **Connection Pooling:** Configured with `pool_pre_ping=True`, `pool_size=20`, `max_overflow=10`, `pool_recycle=1800` to prevent stale/broken connections under auto-scaling loads.
- **Development Mode:** Supports SQLite with explicit WAL (Write-Ahead Logging) pragma and thread checks.

### 3.2 Alembic Migrations
- Migration scripts in `backend/alembic/versions/` govern all DDL changes.
- Automatic creation of indexes on all foreign key references (`user_id`, `field_id`, `author_id`, `crop_cycle_id`) to optimize join queries.

---

## 4. STORAGE DECOUPLING ARCHITECTURE

### 4.1 Media Asset Storage (`backend/db/models.py` & `backend/services/storage.py`)
- `MediaAsset` table schema refactored to remove `Column(LargeBinary)`.
- Replaced with URI string metadata:
  - `storage_path`: S3 key / object path or local file URL.
  - `public_url`: CDN or public HTTP URL for web/mobile client consumption.
  - `content_type`: MIME type (e.g. `image/jpeg`, `image/png`).
  - `size_bytes`: File size in bytes.

---

## 5. SECURITY & AUTHORIZATION HARDENING

### 5.1 Configuration & Secrets Management (`backend/core/config.py`)
- **Zero Hardcoded Secrets:** `TWOFACTOR_API_KEY`, `JWT_SECRET`, and API credentials must be supplied via environment variables. Missing credentials in non-DEBUG environments fail fast on boot.
- **CORS Whitelisting:** `ALLOWED_ORIGIN_REGEX` replaced with strict, explicit domain origin verification matching `https://*.kisaanbuddy.com` or specific trusted domain lists.

### 5.2 RBAC & Auth Security (`backend/api/auth.py` & `frontend-next/src/lib/auth.ts`)
- Role verification enforced strictly server-side through JWT claims and DB user table lookup.
- Client-side founder elevation script overrides removed.

---

## 6. HEALTH & OBSERVABILITY PROBES

### 6.1 Readiness Probe (`/health/readiness` & `/health`)
- Executes SQL `SELECT 1` on PostgreSQL database connection pool.
- Checks media storage access and Redis/Cache availability.
- Returns `HTTP 200 OK` when all dependent systems respond within timeout thresholds, otherwise `HTTP 503 Service Unavailable`.
