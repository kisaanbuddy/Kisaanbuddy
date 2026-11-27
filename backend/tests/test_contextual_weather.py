"""Tests for contextual agricultural weather intelligence & singleflight caching."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from main import app
from services.weather_intelligence import build_contextual_weather_intelligence
from services.weather_service import WeatherOrchestrator


def test_contextual_weather_unavailable_never_fabricates():
    res = build_contextual_weather_intelligence(None, None)
    assert res["available"] is False
    assert res["alerts"] == []
    assert res["advisories"] == {}
    assert "unavailable" in res["reason"].lower()


def test_contextual_weather_alerts_and_advisories():
    now = datetime.now(timezone.utc).isoformat()
    current = {
        "location": {"name": "Ludhiana", "region": "Punjab", "country": "India", "lat": 30.9, "lon": 75.85},
        "current": {
            "temp_c": 26.0,
            "humidity": 82,
            "wind_kph": 22.0,
            "condition": "Light rain",
            "observed_at": now,
        },
        "provider": "openweathermap",
        "cached": False,
        "fetched_at": now,
    }
    forecast = {
        "location": {"name": "Ludhiana", "lat": 30.9, "lon": 75.85},
        "daily": [
            {"date": "2026-11-27", "temp_min_c": 18.0, "temp_max_c": 28.0, "chance_of_rain": 80, "wind_kph": 22.0, "condition": "Rain"},
            {"date": "2026-11-28", "temp_min_c": 17.0, "temp_max_c": 27.0, "chance_of_rain": 40, "wind_kph": 12.0, "condition": "Cloudy"},
        ],
        "hourly": [],
        "provider": "openweathermap",
        "cached": False,
        "fetched_at": now,
    }
    res = build_contextual_weather_intelligence(current, forecast, crop="Wheat", activity="Drone Sprayer")
    assert res["available"] is True
    assert res["provider"] == "openweathermap"
    alert_types = {a["type"] for a in res["alerts"]}
    assert "heavy_rainfall" in alert_types
    assert "wind_caution" in alert_types
    assert "crop_disease_risk" in alert_types
    assert res["advisories"]["irrigation"]["status"] == "postpone"
    assert res["advisories"]["fertilizer"]["status"] == "warning"
    assert res["advisories"]["spraying"]["status"] == "unsafe"
    assert res["advisories"]["disease"]["status"] == "elevated"
    assert res["advisories"]["harvesting"]["status"] == "warning"
    assert res["advisories"]["equipment_booking"]["status"] == "warning"


def test_contextual_weather_endpoint_handles_missing_coords():
    client = TestClient(app)
    resp = client.get("/api/weather/contextual")
    assert resp.status_code == 200
    body = resp.json()
    assert body["available"] is False


def test_weather_orchestrator_singleflight():
    async def _run():
        orch = WeatherOrchestrator()
        calls = 0

        class DummyResult:
            provider = "dummy"
            def model_dump(self, mode="json"):
                return {"provider": "dummy", "current": {"temp_c": 25.0}, "cached": False}

        async def fake_try(op_name, call):
            nonlocal calls
            calls += 1
            await asyncio.sleep(0.05)
            return DummyResult()

        orch._try_providers = fake_try  # type: ignore[method-assign]
        r1, r2, r3 = await asyncio.gather(
            orch.get_current(28.6139, 77.2090),
            orch.get_current(28.6139, 77.2090),
            orch.get_current(28.6139, 77.2090),
        )
        assert calls == 1
        assert r1.provider == "dummy"
        assert r2.provider == "dummy"
        assert r3.provider == "dummy"

    asyncio.run(_run())
