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

    # --- Authentication & Session Security ---
    # Production must provide this explicitly; development may generate one at boot.
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

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
        "https://kisaanbuddy.com",
        "https://www.kisaanbuddy.com",
        "https://krishiai.vercel.app",
        "https://kisaanbuddy.vercel.app",
    ]
    # Regex pattern for allowed origins — covers Vercel preview & production deploys
    # like https://krishiai-git-feature-branch-username.vercel.app
    ALLOWED_ORIGIN_REGEX: Optional[str] = r"^https:\/\/.*\.vercel\.app$"

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

    # --- SMS / OTP Provider Settings ---
    OTP_PROVIDER: str = "2factor"
    TWOFACTOR_API_KEY: Optional[str] = "3dee1f51-ace8-11f1-90d7-0200cd936042"
    OTP_EXPIRY_MINUTES: int = 5
    OTP_RESEND_SECONDS: int = 30
    MAX_OTP_ATTEMPTS: int = 5
    OTP_RATE_LIMIT: int = 3
    OTP_RATE_WINDOW_MINUTES: int = 10
    SESSION_DAYS: int = 30

    # --- Production Feature Flags ---
    ENABLE_OTP_AUTH: bool = True
    ENABLE_SMS_PROVIDER: bool = True
    ENABLE_MULTI_DEVICE: bool = True
    ENABLE_SECURITY_LOCKS: bool = True

    # Google ID token validation. Required only when Google sign-in is enabled.
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Comma-separated owner emails. This is server configuration only and is
    # never sent to the browser. Matching accounts are promoted to Admin when
    # they authenticate, so an initial owner can be designated without a UI.
    ADMIN_EMAILS: str = "admin@kisaanbuddy.com,aditya@kisaanbuddy.com,utkarsh@kisaanbuddy.com,yash@kisaanbuddy.com,info@kisaanbuddy.com"

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()


def is_configured_admin(email: Optional[str]) -> bool:
    if not email:
        return False
    configured = {value.strip().casefold() for value in settings.ADMIN_EMAILS.split(",") if value.strip()}
    return email.casefold() in configured


def validate_production_settings() -> None:
    """Require a stable signing secret outside explicitly local development."""
    insecure_values = {
        "",
        "change_me_to_a_random_secret",
        "krishiai_production_grade_secret_key_change_me_later",
    }
    if not settings.JWT_SECRET or settings.JWT_SECRET.strip() in insecure_values:
        if not settings.DEBUG:
            raise RuntimeError("JWT_SECRET must be configured securely when DEBUG is false.")
        import secrets
        settings.JWT_SECRET = secrets.token_urlsafe(48)
        import logging
        logging.getLogger("krishiai").info("JWT_SECRET automatically initialized with secure token.")
