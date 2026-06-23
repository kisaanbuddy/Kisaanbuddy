"""Demo/Mock weather provider to ensure local developers have a fully working, beautiful UI even without API keys."""
from __future__ import annotations

import math
import random
from datetime import datetime, timedelta, timezone
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


class DemoWeatherProvider(WeatherProvider):
    name = "demo"
    priority = 1000  # lowest priority — only runs if no other providers configured / all fail

    @property
    def is_configured(self) -> bool:
        # Always configured so it is registered when there's no other choice.
        return True

    async def fetch_current(self, lat: float, lon: float) -> UnifiedWeather:
        # Return a nice, plausible weather bundle based on coords
        temp_c = 28.5 + random.uniform(-2, 2)
        loc = Location(
            name="Patna (Demo)",
            region="Bihar",
            country="India",
            lat=lat,
            lon=lon,
            timezone="Asia/Kolkata",
        )
        current = CurrentWeather(
            temp_c=round(temp_c, 1),
            temp_f=round(temp_c * 9/5 + 32, 1),
            feels_like_c=round(temp_c + 1.5, 1),
            feels_like_f=round((temp_c + 1.5) * 9/5 + 32, 1),
            humidity=75,
            pressure_mb=1008.0,
            wind_kph=12.5,
            wind_mph=7.8,
            wind_dir="ENE",
            wind_deg=70.0,
            condition="Partly Cloudy",
            condition_code="1003",
            icon="//cdn.weatherapi.com/weather/64x64/day/116.png",
            visibility_km=8.0,
            uv_index=6.0,
            cloud_cover=40,
            is_day=True,
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
        loc = Location(
            name="Patna (Demo)",
            region="Bihar",
            country="India",
            lat=lat,
            lon=lon,
            timezone="Asia/Kolkata",
        )
        
        now = datetime.now(timezone.utc)
        hourly: List[HourPoint] = []
        for i in range(24):
            time_pt = now + timedelta(hours=i)
            t_c = 25.0 + 5.0 * math.sin((i - 6) / 24.0 * 2.0 * math.pi)
            hourly.append(HourPoint(
                time=time_pt,
                temp_c=round(t_c, 1),
                temp_f=round(t_c * 9/5 + 32, 1),
                condition="Partly Cloudy" if i % 3 != 0 else "Patchy rain nearby",
                icon="//cdn.weatherapi.com/weather/64x64/day/116.png" if i % 3 != 0 else "//cdn.weatherapi.com/weather/64x64/day/176.png",
                humidity=70 + int(5 * math.sin(i / 2.0)),
                wind_kph=10.0 + random.uniform(-2, 2),
                chance_of_rain=15 if i % 3 != 0 else 60,
            ))
            
        daily: List[DayPoint] = []
        for i in range(days):
            date_str = (now + timedelta(days=i)).strftime("%Y-%m-%d")
            t_min = 23.0 + random.uniform(-1, 1)
            t_max = 32.0 + random.uniform(-1, 1)
            daily.append(DayPoint(
                date=date_str,
                temp_min_c=round(t_min, 1),
                temp_max_c=round(t_max, 1),
                temp_min_f=round(t_min * 9/5 + 32, 1),
                temp_max_f=round(t_max * 9/5 + 32, 1),
                condition="Sunny" if i % 2 == 0 else "Patchy rain nearby",
                icon="//cdn.weatherapi.com/weather/64x64/day/113.png" if i % 2 == 0 else "//cdn.weatherapi.com/weather/64x64/day/176.png",
                humidity=65,
                wind_kph=12.0,
                chance_of_rain=10 if i % 2 == 0 else 45,
                sunrise="05:30 AM",
                sunset="06:45 PM",
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
        q = query.strip().title()
        if not q:
            q = "Patna"
        return [
            LocationHit(
                name=q,
                region="State",
                country="India",
                lat=28.6139,
                lon=77.2090,
                display_name=f"{q}, State, India",
            )
        ]
