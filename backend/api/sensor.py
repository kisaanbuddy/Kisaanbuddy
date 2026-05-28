"""
KrishiAI — Live sensor ingestion routes.

Hardware (ESP32 sensor node) POSTs field readings here; the Crop Predictor
frontend reads the latest values to auto-fill its temperature / humidity
sliders.

Endpoints:
  POST /api/sensor/ingest   — ESP32 pushes a reading (auth via shared token)
  GET  /api/sensor/latest   — newest reading (optionally ?device_id=...)
  GET  /api/sensor/history  — recent readings for a device (debug/graphing)
  GET  /api/sensor/health   — which devices are online + last-seen seconds

Storage is in-memory (a bounded deque per device). That is intentional: live
sensor values are ephemeral and only the most-recent reading matters for the
predictor. Restarting the backend simply clears the cache; the ESP32 re-posts
within one POST_INTERVAL. Swap in Redis/DB later if you need persistence.
"""
from __future__ import annotations

import os
import time
from collections import deque
from threading import Lock
from typing import Dict, List, Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
# Optional shared secret. If SENSOR_INGEST_TOKEN is set in the environment,
# the ESP32 must send it as the `X-Sensor-Token` header. If unset, ingestion
# is open (fine for a hackathon / LAN demo).
INGEST_TOKEN = os.getenv("SENSOR_INGEST_TOKEN", "").strip()

# How many recent readings to keep per device.
HISTORY_LEN = 50

# A device is considered "online" if seen within this many seconds.
ONLINE_WINDOW_S = 120


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class SensorReading(BaseModel):
    """Payload the ESP32 sensor node POSTs to /api/sensor/ingest."""
    device_id: str = Field("krishiai-node-1", max_length=64,
                           description="Unique id for this sensor node")
    temperature: Optional[float] = Field(
        None, ge=-40, le=85, description="Air temperature °C (DHT22)")
    humidity: Optional[float] = Field(
        None, ge=0, le=100, description="Relative humidity %% (DHT22)")
    soil_temperature: Optional[float] = Field(
        None, ge=-40, le=125, description="Soil temperature °C (DS18B20)")
    soil_moisture: Optional[float] = Field(
        None, ge=0, le=100, description="Soil moisture %% (capacitive)")
    raw_moisture: Optional[int] = Field(
        None, description="Raw ADC value (for calibration/debug)")


class StoredReading(SensorReading):
    """A reading plus server-side metadata."""
    received_at: float = Field(..., description="Unix epoch seconds (server)")
    age_seconds: float = Field(0, description="Seconds since received")


class IngestResponse(BaseModel):
    ok: bool = True
    device_id: str
    received_at: float
    message: str = "stored"


class DeviceStatus(BaseModel):
    device_id: str
    online: bool
    last_seen_seconds: float
    readings_stored: int


class HealthResponse(BaseModel):
    devices: List[DeviceStatus]
    server_time: float


# ---------------------------------------------------------------------------
# In-memory store (thread-safe — uvicorn workers may use a threadpool)
# ---------------------------------------------------------------------------
_store: Dict[str, deque] = {}
_lock = Lock()


def _decorate(reading: dict) -> StoredReading:
    """Attach a fresh age_seconds to a stored reading dict."""
    now = time.time()
    out = dict(reading)
    out["age_seconds"] = round(now - reading["received_at"], 1)
    return StoredReading(**out)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.post("/ingest", response_model=IngestResponse)
def ingest_reading(
    reading: SensorReading,
    x_sensor_token: Optional[str] = Header(default=None),
):
    """Receive one reading from a sensor node and cache it."""
    if INGEST_TOKEN and x_sensor_token != INGEST_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Sensor-Token")

    now = time.time()
    record = reading.dict()
    record["received_at"] = now

    with _lock:
        if reading.device_id not in _store:
            _store[reading.device_id] = deque(maxlen=HISTORY_LEN)
        _store[reading.device_id].append(record)

    return IngestResponse(device_id=reading.device_id, received_at=now)


@router.get("/latest", response_model=StoredReading)
def latest_reading(device_id: Optional[str] = None):
    """Return the most recent reading.

    If `device_id` is given, returns that device's latest reading; otherwise
    returns the newest reading across all devices (handy when there is only
    one node).
    """
    with _lock:
        if not _store:
            raise HTTPException(status_code=404, detail="No sensor data received yet")

        if device_id is not None:
            dq = _store.get(device_id)
            if not dq:
                raise HTTPException(
                    status_code=404,
                    detail=f"No data for device_id '{device_id}'",
                )
            return _decorate(dq[-1])

        # Newest reading across every device
        newest = max(
            (dq[-1] for dq in _store.values() if dq),
            key=lambda r: r["received_at"],
        )
        return _decorate(newest)


@router.get("/history", response_model=List[StoredReading])
def reading_history(device_id: str, limit: int = 20):
    """Return the most recent `limit` readings for a device (newest last)."""
    with _lock:
        dq = _store.get(device_id)
        if not dq:
            raise HTTPException(
                status_code=404, detail=f"No data for device_id '{device_id}'"
            )
        items = list(dq)[-max(1, min(limit, HISTORY_LEN)):]
        return [_decorate(r) for r in items]


@router.get("/health", response_model=HealthResponse)
def sensor_health():
    """List known devices and whether they are currently online."""
    now = time.time()
    with _lock:
        devices = []
        for dev_id, dq in _store.items():
            if not dq:
                continue
            last_seen = now - dq[-1]["received_at"]
            devices.append(
                DeviceStatus(
                    device_id=dev_id,
                    online=last_seen <= ONLINE_WINDOW_S,
                    last_seen_seconds=round(last_seen, 1),
                    readings_stored=len(dq),
                )
            )
    return HealthResponse(devices=devices, server_time=now)
