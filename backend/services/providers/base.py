"""Abstract base class for all weather providers.

A provider must:
  - Tell the orchestrator whether it's configured (has API key).
  - Fetch current weather, forecast, and do location search.
  - Normalize all responses to the unified schema in schemas/weather.py.

Network / auth / rate-limit errors are wrapped in ProviderError so the
orchestrator can fall through to the next provider.
"""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import List, Optional

import httpx

from schemas.weather import UnifiedWeather, LocationHit, ForecastBundle

log = logging.getLogger(__name__)


class ProviderError(Exception):
    """Raised when a provider fails in a way the orchestrator should handle."""


class ProviderUnavailable(ProviderError):
    """Raised when a provider is not configured (no API key) — not an error."""


class WeatherProvider(ABC):
    """Base class. Concrete providers must set `name` and implement the 4 methods."""

    name: str = "base"
    priority: int = 100  # lower = tried first

    def __init__(self, api_key: Optional[str], client: httpx.AsyncClient):
        self.api_key = api_key
        self.client = client

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    # ------------------------------------------------------------------
    # Subclass contract
    # ------------------------------------------------------------------
    @abstractmethod
    async def fetch_current(self, lat: float, lon: float) -> UnifiedWeather:
        """Fetch current weather for a coordinate. Returns UnifiedWeather."""
        raise NotImplementedError

    @abstractmethod
    async def fetch_forecast(self, lat: float, lon: float, days: int = 5) -> ForecastBundle:
        """Fetch hourly + daily forecast. Returns ForecastBundle."""
        raise NotImplementedError

    @abstractmethod
    async def search_locations(self, query: str, limit: int = 5) -> List[LocationHit]:
        """Location autocomplete — returns list of matching places."""
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------
    async def _get(self, url: str, params: Optional[dict] = None, timeout: float = 5.0) -> dict:
        """GET with consistent error handling — always raises ProviderError on failure."""
        try:
            resp = await self.client.get(url, params=params, timeout=timeout)
        except httpx.TimeoutException as e:
            raise ProviderError(f"{self.name}: timeout after {timeout}s") from e
        except httpx.HTTPError as e:
            raise ProviderError(f"{self.name}: network error: {e}") from e

        if resp.status_code == 401 or resp.status_code == 403:
            raise ProviderError(f"{self.name}: auth failed ({resp.status_code})")
        if resp.status_code == 429:
            raise ProviderError(f"{self.name}: rate limited")
        if resp.status_code == 404:
            raise ProviderError(f"{self.name}: location not found")
        if resp.status_code >= 400:
            raise ProviderError(f"{self.name}: HTTP {resp.status_code}: {resp.text[:200]}")

        try:
            return resp.json()
        except ValueError as e:
            raise ProviderError(f"{self.name}: invalid JSON") from e
