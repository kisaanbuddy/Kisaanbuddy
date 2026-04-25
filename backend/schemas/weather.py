"""Unified weather schemas.

All providers normalize their responses into these models, so the frontend
always sees the same shape regardless of which API served the data.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ----------------------------------------------------------------------
# Location
# ----------------------------------------------------------------------
class Location(BaseModel):
    name: str
    region: Optional[str] = None
    country: Optional[str] = None
    lat: float
    lon: float
    timezone: Optional[str] = None


class LocationHit(BaseModel):
    """Used by autocomplete / search endpoints."""
    name: str
    region: Optional[str] = None
    country: Optional[str] = None
    lat: float
    lon: float
    # Stable string the client can send back to disambiguate
    display_name: str


# ----------------------------------------------------------------------
# Current weather
# ----------------------------------------------------------------------
class CurrentWeather(BaseModel):
    temp_c: float
    temp_f: float
    feels_like_c: float
    feels_like_f: float
    humidity: int = Field(..., ge=0, le=100)
    pressure_mb: Optional[float] = None
    wind_kph: float = 0.0
    wind_mph: float = 0.0
    wind_dir: Optional[str] = None
    wind_deg: Optional[float] = None
    condition: str = ""
    condition_code: Optional[str] = None
    icon: Optional[str] = None  # icon hint the frontend can map
    visibility_km: Optional[float] = None
    uv_index: Optional[float] = None
    cloud_cover: Optional[int] = None
    is_day: Optional[bool] = None
    observed_at: Optional[datetime] = None


class UnifiedWeather(BaseModel):
    """The single shape the API always returns for /current."""
    location: Location
    current: CurrentWeather
    provider: str
    cached: bool = False
    fetched_at: datetime


# ----------------------------------------------------------------------
# Forecast
# ----------------------------------------------------------------------
class HourPoint(BaseModel):
    time: datetime
    temp_c: float
    temp_f: float
    condition: str
    icon: Optional[str] = None
    humidity: Optional[int] = None
    wind_kph: Optional[float] = None
    chance_of_rain: Optional[int] = None  # percent


class DayPoint(BaseModel):
    date: str  # YYYY-MM-DD
    temp_min_c: float
    temp_max_c: float
    temp_min_f: float
    temp_max_f: float
    condition: str
    icon: Optional[str] = None
    humidity: Optional[int] = None
    wind_kph: Optional[float] = None
    chance_of_rain: Optional[int] = None
    sunrise: Optional[str] = None
    sunset: Optional[str] = None


class ForecastBundle(BaseModel):
    location: Location
    hourly: List[HourPoint] = []
    daily: List[DayPoint] = []
    provider: str
    cached: bool = False
    fetched_at: datetime


# ----------------------------------------------------------------------
# Legacy shape kept for backwards compat with old frontend code.
# ----------------------------------------------------------------------
class WeatherResponse(BaseModel):
    """DEPRECATED — kept so /api/weather existing callers don't break."""
    name: str
    main: dict
    weather: list
    wind: dict


class ForecastDay(BaseModel):
    date: str
    avg_temp: float
    condition: str
    humidity: float


class ForecastResponse(BaseModel):
    city: str
    forecast: List[ForecastDay]


# ----------------------------------------------------------------------
# Health
# ----------------------------------------------------------------------
class ProviderHealth(BaseModel):
    name: str
    configured: bool
    priority: int


class HealthResponse(BaseModel):
    providers: List[ProviderHealth]
    cache_backend: str
    rate_limit: str
