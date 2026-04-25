"""Application settings — loaded from .env via pydantic-settings."""
import os
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# Absolute path to the .env file that sits next to the backend/ directory.
# This works regardless of which directory uvicorn / the process is launched from.
_ENV_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")


class Settings(BaseSettings):
    # --- App ---
    PROJECT_NAME: str = "KrishiAI API"
    DEBUG: bool = False

    # --- Weather providers (primary + fallbacks) ---
    OPENWEATHERMAP_API_KEY: Optional[str] = None
    WEATHERAPI_API_KEY: Optional[str] = None
    TOMORROWIO_API_KEY: Optional[str] = None
    ACCUWEATHER_API_KEY: Optional[str] = None
    # Legacy alias some old code referenced — kept for back-compat.
    WEATHER_API_KEY: Optional[str] = None

    # --- Chatbot / Voice assistant ---
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: Optional[str] = None  # e.g. https://openrouter.ai/api/v1
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    # Optional premium TTS providers (scaffolded — activate by setting the key).
    SARVAM_API_KEY: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None  # path to GCP service-account JSON
    # Per-IP rate limit for /api/chat/* endpoints. Separate from weather limit.
    CHAT_RATE_LIMIT_PER_MINUTE: int = 30

    # --- CORS ---
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ]
    # Regex pattern for allowed origins — covers Vercel preview deploys
    # like https://krishiai-git-feature-branch-username.vercel.app
    # Default permits any *.vercel.app subdomain. Set to "" to disable.
    ALLOWED_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"

    # --- HTTP / perf ---
    API_TIMEOUT: float = 5.0  # per-provider request timeout

    # --- Cache ---
    REDIS_URL: Optional[str] = None  # e.g. redis://localhost:6379/0
    CACHE_TTL_SECONDS: int = 300  # legacy default
    CACHE_TTL_CURRENT: int = 300  # 5 min
    CACHE_TTL_FORECAST: int = 900  # 15 min
    CACHE_TTL_SEARCH: int = 3600  # 1 hour

    # --- Rate limiting ---
    RATE_LIMIT_PER_MINUTE: int = 60  # per IP

    # --- Geolocation ---
    GEOIP_PROVIDER_URL: str = "http://ip-api.com/json"  # free, no key, 45 req/min

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
