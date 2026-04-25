"""AccuWeather provider — fallback.

Docs: https://developer.accuweather.com/apis
Free tier: 50 calls/day. Requires a 2-step lookup (location key → weather),
so we cache the location key aggressively.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List, Tuple

from schemas.weather import (
    CurrentWeather,
    DayPoint,
    ForecastBundle,
    HourPoint,
    Location,
    LocationHit,
    UnifiedWeather,
)
from .base import ProviderError, WeatherProvider


_BASE = "http://dataservice.accuweather.com"


def _c_to_f(c: float) -> float:
    return round(c * 9 / 5 + 32, 1)


class AccuWeatherProvider(WeatherProvider):
    name = "accuweather"
    priority = 40

    # in-memory location-key cache (small, rarely changes)
    _loc_key_cache: Dict[Tuple[float, float], Tuple[str, dict]] = {}

    async def _resolve_location_key(self, lat: float, lon: float) -> Tuple[str, dict]:
        key_round = (round(lat, 2), round(lon, 2))
        cached = self._loc_key_cache.get(key_round)
        if cached:
            return cached

        data = await self._get(
            f"{_BASE}/locations/v1/cities/geoposition/search",
            params={"apikey": self.api_key, "q": f"{lat},{lon}"},
        )
        if not isinstance(data, dict) or "Key" not in data:
            raise ProviderError(f"{self.name}: could not resolve location key")

        loc_key = data["Key"]
        self._loc_key_cache[key_round] = (loc_key, data)
        return loc_key, data

    async def fetch_current(self, lat: float, lon: float) -> UnifiedWeather:
        loc_key, loc_info = await self._resolve_location_key(lat, lon)

        items = await self._get(
            f"{_BASE}/currentconditions/v1/{loc_key}",
            params={"apikey": self.api_key, "details": "true"},
        )
        if not items:
            raise ProviderError(f"{self.name}: empty response")
        cur = items[0]

        temp_c = float(cur.get("Temperature", {}).get("Metric", {}).get("Value", 0))
        feels_c = float(cur.get("RealFeelTemperature", {}).get("Metric", {}).get("Value", temp_c))
        wind_kph = float(cur.get("Wind", {}).get("Speed", {}).get("Metric", {}).get("Value", 0))

        loc = Location(
            name=loc_info.get("LocalizedName", "Unknown"),
            region=(loc_info.get("AdministrativeArea") or {}).get("LocalizedName"),
            country=(loc_info.get("Country") or {}).get("LocalizedName"),
            lat=float((loc_info.get("GeoPosition") or {}).get("Latitude", lat)),
            lon=float((loc_info.get("GeoPosition") or {}).get("Longitude", lon)),
            timezone=(loc_info.get("TimeZone") or {}).get("Name"),
        )
        current = CurrentWeather(
            temp_c=round(temp_c, 1),
            temp_f=_c_to_f(temp_c),
            feels_like_c=round(feels_c, 1),
            feels_like_f=_c_to_f(feels_c),
            humidity=int(cur.get("RelativeHumidity", 0) or 0),
            pressure_mb=float(cur.get("Pressure", {}).get("Metric", {}).get("Value", 0) or 0),
            wind_kph=wind_kph,
            wind_mph=round(wind_kph * 0.621371, 1),
            wind_dir=(cur.get("Wind") or {}).get("Direction", {}).get("English"),
            wind_deg=float((cur.get("Wind") or {}).get("Direction", {}).get("Degrees", 0) or 0),
            condition=cur.get("WeatherText", ""),
            condition_code=str(cur.get("WeatherIcon", "")),
            icon=str(cur.get("WeatherIcon", "")),
            visibility_km=float(cur.get("Visibility", {}).get("Metric", {}).get("Value", 0) or 0),
            uv_index=float(cur.get("UVIndex", 0) or 0),
            cloud_cover=int(cur.get("CloudCover", 0) or 0),
            is_day=bool(cur.get("IsDayTime", True)),
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
        loc_key, loc_info = await self._resolve_location_key(lat, lon)

        # 5-day daily forecast (free tier only offers 1d or 5d)
        daily_endpoint = 5 if days > 1 else 1
        daily_data = await self._get(
            f"{_BASE}/forecasts/v1/daily/{daily_endpoint}day/{loc_key}",
            params={"apikey": self.api_key, "metric": "true", "details": "true"},
        )
        # 12-hour hourly (free tier)
        hourly_data = await self._get(
            f"{_BASE}/forecasts/v1/hourly/12hour/{loc_key}",
            params={"apikey": self.api_key, "metric": "true", "details": "true"},
        )

        loc = Location(
            name=loc_info.get("LocalizedName", "Unknown"),
            region=(loc_info.get("AdministrativeArea") or {}).get("LocalizedName"),
            country=(loc_info.get("Country") or {}).get("LocalizedName"),
            lat=float((loc_info.get("GeoPosition") or {}).get("Latitude", lat)),
            lon=float((loc_info.get("GeoPosition") or {}).get("Longitude", lon)),
            timezone=(loc_info.get("TimeZone") or {}).get("Name"),
        )

        hourly: List[HourPoint] = []
        for item in (hourly_data or [])[:24]:
            temp_c = float(item.get("Temperature", {}).get("Value", 0))
            hourly.append(HourPoint(
                time=datetime.fromisoformat(item["DateTime"].replace("Z", "+00:00"))
                    if "DateTime" in item else datetime.now(timezone.utc),
                temp_c=round(temp_c, 1),
                temp_f=_c_to_f(temp_c),
                condition=item.get("IconPhrase", ""),
                icon=str(item.get("WeatherIcon", "")),
                humidity=int(item.get("RelativeHumidity", 0) or 0),
                wind_kph=float(item.get("Wind", {}).get("Speed", {}).get("Value", 0) or 0),
                chance_of_rain=int(item.get("PrecipitationProbability", 0) or 0),
            ))

        daily: List[DayPoint] = []
        for d in (daily_data.get("DailyForecasts") or [])[:days]:
            tmin = float(d.get("Temperature", {}).get("Minimum", {}).get("Value", 0))
            tmax = float(d.get("Temperature", {}).get("Maximum", {}).get("Value", 0))
            day = d.get("Day", {}) or {}
            daily.append(DayPoint(
                date=(d.get("Date", "") or "")[:10],
                temp_min_c=round(tmin, 1),
                temp_max_c=round(tmax, 1),
                temp_min_f=_c_to_f(tmin),
                temp_max_f=_c_to_f(tmax),
                condition=day.get("IconPhrase", ""),
                icon=str(day.get("Icon", "")),
                chance_of_rain=int(day.get("RainProbability", 0) or 0),
                sunrise=(d.get("Sun") or {}).get("Rise"),
                sunset=(d.get("Sun") or {}).get("Set"),
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
        # AccuWeather's free autocomplete endpoint does not return coordinates,
        # and LocationHit requires lat/lon. Rather than do a second /details
        # call per hit (which burns the 50 calls/day free tier), we skip search
        # on AccuWeather and let the orchestrator fall through to OWM /
        # WeatherAPI, both of which return coords on the first call.
        _ = query, limit  # silence unused-arg linters
        return []
