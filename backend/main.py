"""KrishiAI — FastAPI entrypoint.

Responsibilities:
  * Boot the WeatherOrchestrator (opens shared httpx client, picks providers)
  * Register CORS, rate-limiting (slowapi), and exception handlers
  * Mount all routers under /api/*
  * Serve a minimal index so `curl http://localhost:8000/` returns something sane
"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from core.config import settings

# ---------------------------------------------------------------------------
# Rate limiting (optional — system keeps working if slowapi isn't installed)
# ---------------------------------------------------------------------------
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    from slowapi.util import get_remote_address

    _HAS_SLOWAPI = True
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"],
    )
except ImportError:  # pragma: no cover
    _HAS_SLOWAPI = False
    limiter = None

# ---------------------------------------------------------------------------
# Orchestrator + routers
# ---------------------------------------------------------------------------
from services.weather_service import orchestrator
from api import weather, schemes, ml, chatbot, mandi, worker_connect

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("krishiai")


# ---------------------------------------------------------------------------
# Lifespan — starts / stops the weather orchestrator cleanly
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("KrishiAI starting up...")
    await orchestrator.startup()

    try:
        from services import weather_cache
        log.info("Cache backend: %s", weather_cache.cache.__class__.__name__)
    except Exception as e:
        log.warning("Cache init check failed: %s", e)

    try:
        from db.session import engine, Base
        from db import models
        if engine:
            Base.metadata.create_all(bind=engine)
            log.info("Database tables created/verified.")
    except Exception as e:
        log.error("DB init error: %s", e)

    yield

    log.info("KrishiAI shutting down...")
    await orchestrator.shutdown()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="AI-first agricultural platform for Indian farmers.",
    lifespan=lifespan,
)

if _HAS_SLOWAPI and limiter is not None:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
    log.info("Rate limiting enabled: %d req/min per IP", settings.RATE_LIMIT_PER_MINUTE)
else:
    log.warning("slowapi not installed - rate limiting disabled")

_cors_kwargs = dict(
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Weather-Provider", "X-Weather-Cached"],
)
if settings.ALLOWED_ORIGIN_REGEX:
    _cors_kwargs["allow_origin_regex"] = settings.ALLOWED_ORIGIN_REGEX
app.add_middleware(CORSMiddleware, **_cors_kwargs)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled exception on %s %s", request.method, request.url.path)
    if settings.DEBUG:
        detail = f"{type(exc).__name__}: {exc}"
    else:
        detail = "Internal server error"
    return JSONResponse(
        status_code=500,
        content={"detail": detail, "path": request.url.path, "error_type": type(exc).__name__},
    )


app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(schemes.router, prefix="/api/schemes", tags=["Schemes"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(chatbot.router, prefix="/api/chat", tags=["Chatbot"])
app.include_router(mandi.router, prefix="/api/mandi", tags=["Mandi"])
app.include_router(worker_connect.router, prefix="/api/worker-connect", tags=["Worker Connect"])


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_path = os.path.join(BASE_DIR, "frontend")

if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")


@app.get("/", include_in_schema=False)
def read_root():
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "name": settings.PROJECT_NAME,
        "status": "ok",
        "docs": "/docs",
        "endpoints": {
            "weather_current": "/api/weather/current?lat=&lon=",
            "weather_forecast": "/api/weather/forecast?lat=&lon=&days=5",
            "weather_search": "/api/weather/search?q=",
            "weather_geoip": "/api/weather/geoip",
            "weather_health": "/api/weather/health",
        },
    }


@app.get("/health", include_in_schema=False)
def ping():
    """Tiny liveness probe — doesn't hit providers.

    Designed for UptimeRobot / Render health checks. Returns 200 OK
    immediately so external pings stay cheap and the free tier won't
    sleep when this URL is pinged every 5 minutes.
    """
    return {"status": "ok", "service": "krishiai"}
