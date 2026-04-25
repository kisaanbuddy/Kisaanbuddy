"""WeatherOrchestrator — the brain.

Responsibilities:
  1. Own the shared httpx client and the list of configured providers.
  2. Serve requests from cache when fresh.
  3. On cache miss, try providers in priority order; if one fails, try the next.
  4. Normalize & cache the response.
  5. Expose health info.

Public entry points (used by api/weather.py):
    get_current(lat, lon)
    get_forecast(lat, lon, days)
    search(query, limit)
    reverse_geocode(lat, lon)   # picks location name from any provider
    get_health()
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import List, Optional

import httpx

from core.config import settings
from schemas.weather import (
    ForecastBundle,
    HealthResponse,
    LocationHit,
    ProviderHealth,
    UnifiedWeather,
)
from services.providers import (
    AccuWeatherProvider,
    OpenWeatherMapProvider,
    ProviderError,
    TomorrowIoProvider,
    WeatherAPIProvider,
    WeatherProvider,
)
from services import weather_cache

log = logging.getLogger(__name__)


@dataclass
class OrchestratorResult:
    """Wraps any response with metadata the route can use."""
    payload: dict
    provider: str
    from_cache: bool


class WeatherOrchestrator:
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
        self._providers: List[WeatherProvider] = []

    # ------------------------------------------------------------------
    # Lifecycle — called from main.py lifespan
    # ------------------------------------------------------------------
    async def startup(self) -> None:
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(settings.API_TIMEOUT, connect=3.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
            headers={"User-Agent": "KrishiAI/1.0"},
        )

        candidates: List[WeatherProvider] = [
            OpenWeatherMapProvider(settings.OPENWEATHERMAP_API_KEY, self._client),
            WeatherAPIProvider(settings.WEATHERAPI_API_KEY, self._client),
            TomorrowIoProvider(settings.TOMORROWIO_API_KEY, self._client),
            AccuWeatherProvider(settings.ACCUWEATHER_API_KEY, self._client),
        ]

        configured = [p for p in candidates if p.is_configured]
        configured.sort(key=lambda p: p.priority)
        self._providers = configured

        log.info(
            "WeatherOrchestrator ready with %d provider(s): %s",
            len(self._providers),
            [p.name for p in self._providers],
        )

        if not self._providers:
            log.error("NO weather providers configured — set at least OPENWEATHERMAP_API_KEY")

    async def shutdown(self) -> None:
        if self._client:
            await self._client.aclose()

    @property
    def providers(self) -> List[WeatherProvider]:
        return self._providers

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def get_current(self, lat: float, lon: float) -> OrchestratorResult:
        key = weather_cache.make_key("current", lat, lon)
        hit = await weather_cache.cache.get(key)
        if hit:
            hit["cached"] = True
            return OrchestratorResult(payload=hit, provider=hit.get("provider", "?"), from_cache=True)

        result = await self._try_providers(
            op_name="fetch_current",
            call=lambda p: p.fetch_current(lat, lon),
        )
        payload = result.model_dump(mode="json")
        await weather_cache.cache.set(key, payload, settings.CACHE_TTL_CURRENT)
        return OrchestratorResult(payload=payload, provider=result.provider, from_cache=False)

    async def get_forecast(self, lat: float, lon: float, days: int = 5) -> OrchestratorResult:
        key = weather_cache.make_key("forecast", lat, lon, str(days))
        hit = await weather_cache.cache.get(key)
        if hit:
            hit["cached"] = True
            return OrchestratorResult(payload=hit, provider=hit.get("provider", "?"), from_cache=True)

        result = await self._try_providers(
            op_name="fetch_forecast",
            call=lambda p: p.fetch_forecast(lat, lon, days),
        )
        payload = result.model_dump(mode="json")
        await weather_cache.cache.set(key, payload, settings.CACHE_TTL_FORECAST)
        return OrchestratorResult(payload=payload, provider=result.provider, from_cache=False)

    async def search(self, query: str, limit: int = 5) -> List[LocationHit]:
        # Cache search results aggressively — location names rarely change.
        key = f"weather:search:{query.lower().strip()}:{limit}"
        hit = await weather_cache.cache.get(key)
        if hit and isinstance(hit, list):
            return [LocationHit(**h) for h in hit]

        errors: List[str] = []
        for provider in self._providers:
            try:
                hits = await provider.search_locations(query, limit)
            except ProviderError as e:
                errors.append(f"{provider.name}: {e}")
                continue
            except Exception as e:  # pragma: no cover
                log.exception("Unexpected error in %s.search", provider.name)
                errors.append(f"{provider.name}: {e}")
                continue
            if hits:
                payload = [h.model_dump(mode="json") for h in hits]
                await weather_cache.cache.set(key, payload, settings.CACHE_TTL_SEARCH)
                return hits

        log.warning("Location search failed for %r: %s", query, "; ".join(errors))
        return []

    def get_health(self) -> HealthResponse:
        providers = [
            ProviderHealth(name=p.name, configured=p.is_configured, priority=p.priority)
            for p in self._providers
        ]
        return HealthResponse(
            providers=providers,
            cache_backend=weather_cache.backend_name(),
            rate_limit=f"{settings.RATE_LIMIT_PER_MINUTE}/minute",
        )

    # ------------------------------------------------------------------
    # Internal fallback loop
    # ------------------------------------------------------------------
    async def _try_providers(self, op_name: str, call):
        if not self._providers:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=503,
                detail="No weather providers configured on the server",
            )

        errors: List[str] = []
        for provider in self._providers:
            try:
                log.debug("Trying %s.%s", provider.name, op_name)
                result = await call(provider)
                log.info("%s served by %s", op_name, provider.name)
                return result
            except ProviderError as e:
                log.warning("%s failed on %s: %s", provider.name, op_name, e)
                errors.append(f"{provider.name}: {e}")
                continue
            except Exception as e:  # pragma: no cover
                log.exception("%s raised unexpected error", provider.name)
                errors.append(f"{provider.name}: {e}")
                continue

        from fastapi import HTTPException
        raise HTTPException(
            status_code=502,
            detail=f"All weather providers failed. Errors: {' | '.join(errors)}",
        )


# Module-level singleton, wired up in main.py lifespan.
orchestrator = WeatherOrchestrator()
