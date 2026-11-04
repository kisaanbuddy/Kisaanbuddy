import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_sensor_ingest_and_readings():
    # Ingest a sensor reading
    payload = {
        "device_id": "test-esp32-node-1",
        "soil_moisture": 42.5,
        "soil_temperature": 24.2,
        "soil_ph": 6.8,
        "nitrogen": 180.0,
        "phosphorus": 18.5,
        "potassium": 210.0,
        "temperature": 26.1,
        "humidity": 65.0,
    }
    res = client.post("/api/sensor/ingest", json=payload)
    assert res.status_code == 200, res.text
    assert res.json()["device_id"] == "test-esp32-node-1"

    # Health check
    res_health = client.get("/api/sensor/health")
    assert res_health.status_code == 200
    devices = res_health.json()["devices"]
    found = next((d for d in devices if d["device_id"] == "test-esp32-node-1"), None)
    assert found is not None
    assert found["online"] is True

    # Latest reading
    res_latest = client.get("/api/sensor/latest?device_id=test-esp32-node-1")
    assert res_latest.status_code == 200
    data = res_latest.json()
    assert data["soil_moisture"] == 42.5
    assert data["soil_ph"] == 6.8
    assert data["nitrogen"] == 180.0
    assert data["phosphorus"] == 18.5
    assert data["potassium"] == 210.0

    # History
    res_history = client.get("/api/sensor/history?device_id=test-esp32-node-1&limit=10")
    assert res_history.status_code == 200
    history = res_history.json()
    assert len(history) >= 1
    assert history[-1]["device_id"] == "test-esp32-node-1"
