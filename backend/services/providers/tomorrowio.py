"""Tomorrow.io provider — fallback.

Docs: https://docs.tomorrow.io/reference/welcome
Free tier: 500 calls/day. Requires API key in TOMORROWIO_API_KEY.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from schemas.weather import (
    CurrentWeather,
    DayPoint,
    ForecastBundle,
    HourPoint,
    Location,
    LocationHit,
    UnifiedWeather,
)
from .base import WeatherProvider


_BASE = "https://api.tomorrow.io/v4"


def _c_to_f(c: float) -> float:
    return round(c * 9 / 5 + 32, 1)


# Tomorrow.io weatherCode → description mapping (subset)
_CODE_MAP = {
    0: "Unknown", 1000: "Clear", 1100: "Mostly Clear", 1101: "Partly Cloudy",
    1102: "Mostly Cloudy", 1001: "Cloudy", 2000: "Fog", 2100: "Light Fog",
    4000: "Drizzle", 4001: "Rain", 4200: "Light Rain", 4201: "Heavy Rain",
    5000: "Snow", 5001: "Flurries", 5100: "Light Snow", 5101: "Heavy Snow",
    6000: "Freezing Drizzle", 6001: "Freezing Rain", 7000: "Ice Pellets",
    8000: "Thunderstorm",
}


def _describe(code: int) -> str:
    return _CODE_MAP.get(int(code), f"Code {code}")


class TomorrowIoProvider(WeatherProvider):
    name = "tomorrowio"
    priority = 30

    async def fetch_current(self, lat: float, lon: float) -> UnifiedWeather:
        data = await self._get(
            f"{_BASE}/weather/realtime",
            params={"location": f"{lat},{lon}", "apikey": self.api_key, "units": "metric"},
        )

        values = (data.get("data") or {}).get("values") or {}
        loc_info = data.get("location") or {}

        temp_c = float(values.get("temperature", 0))
        feels_c = float(values.get("temperatureApparent", temp_c))
        wind_mps = float(values.get("windSpeed", 0) or 0)
        wind_kph = round(wind_mps * 3.6, 1)
        code = int(values.get("weatherCode", 0) or 0)

        loc = Location(
            name=str(loc_info.get("name") or "Unknown"),
            country=None,
            lat=float(loc_info.get("lat", lat)),
            lon=float(loc_info.get("lon", lon)),
        )
        current = CurrentWeather(
            temp_c=round(temp_c, 1),
            temp_f=_c_to_f(temp_c),
            feels_like_c=round(feels_c, 1),
            feels_like_f=_c_to_f(feels_c),
            humidity=int(values.get("humidity", 0) or 0),
            pressure_mb=float(values.get("pressureSurfaceLevel", 0) or 0),
            wind_kph=wind_kph,
            wind_mph=round(wind_mps * 2.23694, 1),
            wind_deg=float(values.get("windDirection", 0) or 0),
            condition=_describe(code),
            condition_code=str(code),
            visibility_km=float(values.get("visibility", 0) or 0),
            uv_index=float(values.get("uvIndex", 0) or 0),
            cloud_cover=int(values.get("cloudCover", 0) or 0),
            observed_at=datetime.now(timezone.utc),
        )
        return UnifiedWeather(
            location=loc,
            current=current,
            provider=self.name,
            cached=False,
            fetched_at=datetime.now(timezone.utc),
        )

    async def fetch_forecast(self, lat: float, lon: float, days: int = 5) -> ForecastBundle:
        data = await self._get(
            f"{_BASE}/weather/forecast",
            params={"location": f"{lat},{lon}", "apikey": self.api_key, "units": "metric",
                    "timesteps": "1h,1d"},
        )

        timelines = data.get("timelines") or {}
        loc_info = data.get("location") or {}
        loc = Location(
            name=str(loc_info.get("name") or "Unknown"),
            lat=float(loc_info.get("lat", lat)),
            lon=float(loc_info.get("lon", lon)),
        )

        hourly: List[HourPoint] = []
        for item in (timelines.get("hourly") or [])[:24]:
            v = item.get("values", {}) or {}
            code = int(v.get("weatherCode", 0) or 0)
            temp_c = float(v.get("temperature", 0))
            hourly.append(HourPoint(
                time=datetime.fromisoformat(item["time"].replace("Z", "+00:00")),
                temp_c=round(temp_c, 1),
                temp_f=_c_to_f(temp_c),
                condition=_describe(code),
                humidity=int(v.get("humidity", 0) or 0),
                wind_kph=round(float(v.get("windSpeed", 0) or 0) * 3.6, 1),
                chance_of_rain=int(v.get("precipitationProbability", 0) or 0),
            ))

        daily: List[DayPoint] = []
        for item in (timelines.get("daily") or [])[:days]:
            v = item.get("values", {}) or {}
            code = int(v.get("weatherCodeMax", 0) or 0)
            tmin = float(v.get("temperatureMin", 0))
            tmax = float(v.get("temperatureMax", 0))
            daily.append(DayPoint(
                date=item["time"][:10],
                temp_min_c=round(tmin, 1),
                temp_max_c=round(tmax, 1),
                temp_min_f=_c_to_f(tmin),
                temp_max_f=_c_to_f(tmax),
                condition=_describe(code),
                humidity=int(v.get("humidityAvg", 0) or 0),
                wind_kph=round(float(v.get("windSpeedAvg", 0) or 0) * 3.6, 1),
                chance_of_rain=int(v.get("precipitationProbabilityAvg", 0) or 0),
                sunrise=v.get("sunriseTime"),
                sunset=v.get("sunsetTime"),
            ))

        return ForecastBundle(
            location=loc,
            hourly=hourly,
            daily=daily,
            provider=self.name,
            cached=False,
            fetched_at=datetime.now(timezone.utc),
        )

    async def search_locations(self, query: str, limit: int = 5) -> List[LocationHit]:
        # Tomorrow.io doesn't have a first-party geocoding endpoint.
        # Falling through to the orchestrator's geocoding chain is handled by it.
        return []
