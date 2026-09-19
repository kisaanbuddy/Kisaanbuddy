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

from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.session import get_db
from db import models
from services.state_service import state_service

router = APIRouter()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
INGEST_TOKEN = os.getenv("SENSOR_INGEST_TOKEN", "").strip()
HISTORY_LEN = 50
ONLINE_WINDOW_S = 120

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class SensorReading(BaseModel):
    """Payload the ESP32 sensor node POSTs to /api/sensor/ingest."""
    device_id: str = Field("krishiai-node-1", max_length=64, description="Unique id for this sensor node")
    temperature: Optional[float] = Field(None, ge=-40, le=85, description="Air temperature °C (DHT22)")
    humidity: Optional[float] = Field(None, ge=0, le=100, description="Relative humidity % (DHT22)")
    soil_temperature: Optional[float] = Field(None, ge=-40, le=125, description="Soil temperature °C (DS18B20)")
    soil_moisture: Optional[float] = Field(None, ge=0, le=100, description="Soil moisture % (capacitive)")
    raw_moisture: Optional[int] = Field(None, description="Raw ADC value (for calibration/debug)")


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
# In-memory store (thread-safe fallback layer)
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
    db: Session = Depends(get_db),
):
    """Receive one reading from a sensor node, store in Redis & persist to DB."""
    if INGEST_TOKEN and x_sensor_token != INGEST_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Sensor-Token")

    now = time.time()
    record = reading.dict()
    record["received_at"] = now

    # 1. Update shared Redis / memory state
    state_service.save_latest_sensor_reading(reading.device_id, record, history_len=HISTORY_LEN)

    # 2. Local process memory fallback for zero-latency single worker queries
    with _lock:
        if reading.device_id not in _store:
            _store[reading.device_id] = deque(maxlen=HISTORY_LEN)
        _store[reading.device_id].append(record)

    # 3. Deduplicated PostgreSQL persistence
    try:
        last_history = db.query(models.SensorReadingHistory).filter(
            models.SensorReadingHistory.device_id == reading.device_id
        ).order_by(models.SensorReadingHistory.received_at.desc()).first()

        is_duplicate = False
        if last_history and (now - last_history.received_at < 5.0):
            if (last_history.temperature == reading.temperature and
                last_history.humidity == reading.humidity and
                last_history.soil_moisture == reading.soil_moisture):
                is_duplicate = True

        if not is_duplicate:
            db_record = models.SensorReadingHistory(
                device_id=reading.device_id,
                temperature=reading.temperature,
                humidity=reading.humidity,
                soil_temperature=reading.soil_temperature,
                soil_moisture=reading.soil_moisture,
                raw_moisture=reading.raw_moisture,
                received_at=now,
            )
            db.add(db_record)
            db.commit()
    except Exception as dbe:
        db.rollback()
        # Non-fatal log if DB table is uninitialized in test environment
        import logging
        logging.getLogger("krishiai.sensor").warning("DB telemetry persistence bypassed: %s", dbe)

    return IngestResponse(device_id=reading.device_id, received_at=now)


@router.get("/latest", response_model=StoredReading)
def latest_reading(device_id: Optional[str] = None):
    """Return the most recent reading from shared Redis state or fallback."""
    if device_id is not None:
        latest = state_service.get_latest_sensor_reading(device_id)
        if not latest:
            with _lock:
                dq = _store.get(device_id)
                if dq:
                    latest = dq[-1]
        if not latest:
            raise HTTPException(status_code=404, detail=f"No data for device_id '{device_id}'")
        if time.time() - latest["received_at"] > ONLINE_WINDOW_S:
            raise HTTPException(status_code=404, detail="Sensor offline (stale)")
        return _decorate(latest)

    # Newest reading across all devices
    with _lock:
        if not _store:
            raise HTTPException(status_code=404, detail="No sensor data received yet")
        newest = max((dq[-1] for dq in _store.values() if dq), key=lambda r: r["received_at"])
        if time.time() - newest["received_at"] > ONLINE_WINDOW_S:
            raise HTTPException(status_code=404, detail="All sensors are offline (stale)")
        return _decorate(newest)


@router.get("/history", response_model=List[StoredReading])
def reading_history(device_id: str, limit: int = 20, db: Session = Depends(get_db)):
    """Return recent telemetry readings for a device."""
    # Try shared Redis state history
    history = state_service.get_sensor_history(device_id)
    if history:
        items = history[-max(1, min(limit, HISTORY_LEN)):]
        return [_decorate(r) for r in items]

    # Fallback to PostgreSQL database history
    db_rows = []
    try:
        db_rows = db.query(models.SensorReadingHistory).filter(
            models.SensorReadingHistory.device_id == device_id
        ).order_by(models.SensorReadingHistory.received_at.desc()).limit(limit).all()
    except Exception as dbe:
        import logging
        logging.getLogger("krishiai.sensor").warning("DB history query fallback: %s", dbe)

    if not db_rows:
        with _lock:
            dq = _store.get(device_id)
            if not dq:
                raise HTTPException(status_code=404, detail=f"No data for device_id '{device_id}'")
            items = list(dq)[-max(1, min(limit, HISTORY_LEN)):]
            return [_decorate(r) for r in items]

    db_rows.reverse()
    items = [
        {
            "device_id": row.device_id,
            "temperature": row.temperature,
            "humidity": row.humidity,
            "soil_temperature": row.soil_temperature,
            "soil_moisture": row.soil_moisture,
            "raw_moisture": row.raw_moisture,
            "received_at": row.received_at,
        }
        for row in db_rows
    ]
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
