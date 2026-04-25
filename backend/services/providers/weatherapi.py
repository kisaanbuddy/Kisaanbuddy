"""WeatherAPI.com provider — fallback.

Docs: https://www.weatherapi.com/docs/
Free tier: 1M calls/month, includes forecast + search.
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


_BASE = "https://api.weatherapi.com/v1"


def _c_to_f(c: float) -> float:
    return round(c * 9 / 5 + 32, 1)


class WeatherAPIProvider(WeatherProvider):
    name = "weatherapi"
    priority = 20

    async def fetch_current(self, lat: float, lon: float) -> UnifiedWeather:
        data = await self._get(
            f"{_BASE}/current.json",
            params={"key": self.api_key, "q": f"{lat},{lon}", "aqi": "no"},
        )

        loc_data = data.get("location", {})
        cur = data.get("current", {})
        cond = cur.get("condition", {}) or {}

        loc = Location(
            name=loc_data.get("name", "Unknown"),
            region=loc_data.get("region"),
            country=loc_data.get("country"),
            lat=float(loc_data.get("lat", lat)),
            lon=float(loc_data.get("lon", lon)),
            timezone=loc_data.get("tz_id"),
        )
        current = CurrentWeather(
            temp_c=float(cur.get("temp_c", 0)),
            temp_f=float(cur.get("temp_f", 0)),
            feels_like_c=float(cur.get("feelslike_c", 0)),
            feels_like_f=float(cur.get("feelslike_f", 0)),
            humidity=int(cur.get("humidity", 0)),
            pressure_mb=float(cur.get("pressure_mb", 0) or 0),
            wind_kph=float(cur.get("wind_kph", 0) or 0),
            wind_mph=float(cur.get("wind_mph", 0) or 0),
            wind_dir=cur.get("wind_dir"),
            wind_deg=float(cur.get("wind_degree", 0) or 0),
            condition=cond.get("text", ""),
            condition_code=str(cond.get("code", "")),
            icon=cond.get("icon"),
            visibility_km=float(cur.get("vis_km", 0) or 0),
            uv_index=float(cur.get("uv", 0) or 0),
            cloud_cover=int(cur.get("cloud", 0) or 0),
            is_day=bool(cur.get("is_day", 1)),
            observed_at=datetime.fromtimestamp(cur.get("last_updated_epoch", 0), tz=timezone.utc)
                if cur.get("last_updated_epoch") else None,
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
            f"{_BASE}/forecast.json",
            params={"key": self.api_key, "q": f"{lat},{lon}", "days": min(10, days), "aqi": "no", "alerts": "no"},
        )

        loc_data = data.get("location", {})
        loc = Location(
            name=loc_data.get("name", "Unknown"),
            region=loc_data.get("region"),
            country=loc_data.get("country"),
            lat=float(loc_data.get("lat", lat)),
            lon=float(loc_data.get("lon", lon)),
            timezone=loc_data.get("tz_id"),
        )

        hourly: List[HourPoint] = []
        daily: List[DayPoint] = []

        for day in (data.get("forecast", {}).get("forecastday") or []):
            d = day.get("day", {})
            astro = day.get("astro", {})
            cond = d.get("condition", {}) or {}
            daily.append(DayPoint(
                date=day.get("date", ""),
                temp_min_c=float(d.get("mintemp_c", 0)),
                temp_max_c=float(d.get("maxtemp_c", 0)),
                temp_min_f=float(d.get("mintemp_f", 0)),
                temp_max_f=float(d.get("maxtemp_f", 0)),
                condition=cond.get("text", ""),
                icon=cond.get("icon"),
                humidity=int(d.get("avghumidity", 0)),
                wind_kph=float(d.get("maxwind_kph", 0) or 0),
                chance_of_rain=int(d.get("daily_chance_of_rain", 0) or 0),
                sunrise=astro.get("sunrise"),
                sunset=astro.get("sunset"),
            ))
            for h in day.get("hour", []):
                hcond = h.get("condition", {}) or {}
                hourly.append(HourPoint(
                    time=datetime.fromtimestamp(h.get("time_epoch", 0), tz=timezone.utc),
                    temp_c=float(h.get("temp_c", 0)),
                    temp_f=float(h.get("temp_f", 0)),
                    condition=hcond.get("text", ""),
                    icon=hcond.get("icon"),
                    humidity=int(h.get("humidity", 0)),
                    wind_kph=float(h.get("wind_kph", 0) or 0),
                    chance_of_rain=int(h.get("chance_of_rain", 0) or 0),
                ))

        return ForecastBundle(
            location=loc,
            hourly=hourly[:24],
            daily=daily[:days],
            provider=self.name,
            cached=False,
            fetched_at=datetime.now(timezone.utc),
        )

    async def search_locations(self, query: str, limit: int = 5) -> List[LocationHit]:
        data = await self._get(
            f"{_BASE}/search.json",
            params={"key": self.api_key, "q": query},
        )
        if not isinstance(data, list):
            return []

        hits: List[LocationHit] = []
        for item in data[:limit]:
            parts = [item.get("name"), item.get("region"), item.get("country")]
            parts = [p for p in parts if p]
            hits.append(LocationHit(
                name=item.get("name", ""),
                region=item.get("region"),
                country=item.get("country"),
                lat=float(item["lat"]),
                lon=float(item["lon"]),
                display_name=", ".join(parts),
            ))
        return hits
