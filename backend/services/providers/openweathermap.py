"""OpenWeatherMap provider — primary for KrishiAI.

Uses free-tier endpoints:
  - Current:   /data/2.5/weather
  - Forecast:  /data/2.5/forecast   (5 day / 3 hour)
  - Geocoding: /geo/1.0/direct      (location search)

Docs: https://openweathermap.org/api
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


_BASE = "https://api.openweathermap.org"


def _c_to_f(c: float) -> float:
    return round(c * 9 / 5 + 32, 1)


def _deg_to_cardinal(deg: float) -> str:
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
            "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return dirs[int((deg / 22.5) + 0.5) % 16]


class OpenWeatherMapProvider(WeatherProvider):
    name = "openweathermap"
    priority = 10  # primary — tried first

    # ------------------------------------------------------------------
    async def fetch_current(self, lat: float, lon: float) -> UnifiedWeather:
        data = await self._get(
            f"{_BASE}/data/2.5/weather",
            params={"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"},
        )

        temp_c = float(data["main"]["temp"])
        feels_c = float(data["main"].get("feels_like", temp_c))
        wind_mps = float(data.get("wind", {}).get("speed", 0) or 0)
        wind_kph = round(wind_mps * 3.6, 1)

        cond = (data.get("weather") or [{}])[0]
        sunrise = data.get("sys", {}).get("sunrise")
        sunset = data.get("sys", {}).get("sunset")
        dt = data.get("dt")
        is_day = None
        if sunrise and sunset and dt:
            is_day = sunrise <= dt <= sunset

        loc = Location(
            name=data.get("name") or "Unknown",
            country=data.get("sys", {}).get("country"),
            lat=float(data.get("coord", {}).get("lat", lat)),
            lon=float(data.get("coord", {}).get("lon", lon)),
            timezone=None,
        )
        current = CurrentWeather(
            temp_c=round(temp_c, 1),
            temp_f=_c_to_f(temp_c),
            feels_like_c=round(feels_c, 1),
            feels_like_f=_c_to_f(feels_c),
            humidity=int(data["main"].get("humidity", 0)),
            pressure_mb=float(data["main"].get("pressure", 0) or 0),
            wind_kph=wind_kph,
            wind_mph=round(wind_mps * 2.23694, 1),
            wind_deg=float(data.get("wind", {}).get("deg", 0) or 0),
            wind_dir=_deg_to_cardinal(float(data.get("wind", {}).get("deg", 0) or 0)),
            condition=cond.get("description", "").title(),
            condition_code=str(cond.get("id", "")),
            icon=cond.get("icon"),
            visibility_km=(float(data.get("visibility", 0)) / 1000) if data.get("visibility") else None,
            cloud_cover=int(data.get("clouds", {}).get("all", 0) or 0),
            is_day=is_day,
            observed_at=datetime.fromtimestamp(dt, tz=timezone.utc) if dt else None,
        )
        return UnifiedWeather(
            location=loc,
            current=current,
            provider=self.name,
            cached=False,
            fetched_at=datetime.now(timezone.utc),
        )

    # ------------------------------------------------------------------
    async def fetch_forecast(self, lat: float, lon: float, days: int = 5) -> ForecastBundle:
        # cnt=40 = 5 days * 8 (3-hour slots)
        data = await self._get(
            f"{_BASE}/data/2.5/forecast",
            params={
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric",
                "cnt": min(40, days * 8),
            },
        )

        city = data.get("city", {})
        loc = Location(
            name=city.get("name", "Unknown"),
            country=city.get("country"),
            lat=float(city.get("coord", {}).get("lat", lat)),
            lon=float(city.get("coord", {}).get("lon", lon)),
            timezone=f"UTC{city.get('timezone', 0) // 3600:+d}" if city.get("timezone") is not None else None,
        )

        # Build hourly list (all slots)
        hourly: List[HourPoint] = []
        for item in data.get("list", []):
            temp_c = float(item["main"]["temp"])
            cond = (item.get("weather") or [{}])[0]
            hourly.append(HourPoint(
                time=datetime.fromtimestamp(item["dt"], tz=timezone.utc),
                temp_c=round(temp_c, 1),
                temp_f=_c_to_f(temp_c),
                condition=cond.get("description", "").title(),
                icon=cond.get("icon"),
                humidity=int(item["main"].get("humidity", 0)),
                wind_kph=round(float(item.get("wind", {}).get("speed", 0) or 0) * 3.6, 1),
                chance_of_rain=int(float(item.get("pop", 0) or 0) * 100),
            ))

        # Roll up hourly → daily
        by_day: dict[str, list] = {}
        for h in hourly:
            key = h.time.strftime("%Y-%m-%d")
            by_day.setdefault(key, []).append(h)

        daily: List[DayPoint] = []
        for date_key, points in sorted(by_day.items())[:days]:
            temps_c = [p.temp_c for p in points]
            # Representative condition = mid-day if present, else first
            mid = next((p for p in points if 11 <= p.time.hour <= 14), points[len(points) // 2])
            rain_chances = [p.chance_of_rain or 0 for p in points]
            daily.append(DayPoint(
                date=date_key,
                temp_min_c=round(min(temps_c), 1),
                temp_max_c=round(max(temps_c), 1),
                temp_min_f=_c_to_f(min(temps_c)),
                temp_max_f=_c_to_f(max(temps_c)),
                condition=mid.condition,
                icon=mid.icon,
                humidity=int(sum(p.humidity or 0 for p in points) / len(points)),
                wind_kph=round(sum(p.wind_kph or 0 for p in points) / len(points), 1),
                chance_of_rain=max(rain_chances) if rain_chances else 0,
            ))

        return ForecastBundle(
            location=loc,
            hourly=hourly[:24],  # next 24h shown in UI
            daily=daily,
            provider=self.name,
            cached=False,
            fetched_at=datetime.now(timezone.utc),
        )

    # ------------------------------------------------------------------
    async def search_locations(self, query: str, limit: int = 5) -> List[LocationHit]:
        data = await self._get(
            f"{_BASE}/geo/1.0/direct",
            params={"q": query, "limit": limit, "appid": self.api_key},
        )
        if not isinstance(data, list):
            return []

        hits: List[LocationHit] = []
        for item in data:
            name = item.get("name", "")
            region = item.get("state")
            country = item.get("country")
            parts = [x for x in (name, region, country) if x]
            hits.append(LocationHit(
                name=name,
                region=region,
                country=country,
                lat=float(item["lat"]),
                lon=float(item["lon"]),
                display_name=", ".join(parts),
            ))
        return hits
