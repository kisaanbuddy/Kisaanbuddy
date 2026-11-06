"""FastAPI HTTP Route Tests for Voice Operating System.

Tests /api/voice/interpret and /api/voice/health with real FastAPI TestClient.
"""
from __future__ import annotations

import os
import sys

# Ensure backend root in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_voice_health_endpoint():
    res = client.get("/api/voice/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["status"] == "active"
    assert "NAVIGATE" in data["permitted_actions"]
    assert "PLACE_ORDER" in data["permitted_actions"]
    print("[PASS] /api/voice/health returned active Voice OS state")


def test_voice_interpret_navigation():
    payload = {
        "transcript": "Open marketplace.",
        "page_context": {
            "current_route": "/",
            "visible_items": [],
            "cart_items": [],
            "cart_total": 0.0,
        },
        "language": "en",
        "want_audio": False,
    }
    res = client.post("/api/voice/interpret", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["action"]["action_type"] == "NAVIGATE"
    assert data["action"]["payload"]["path"] == "/marketplace"
    print("[PASS] /api/voice/interpret correctly navigated to /marketplace")


def test_voice_interpret_confirmation_gate():
    payload = {
        "transcript": "Place order",
        "page_context": {
            "current_route": "/marketplace",
            "visible_items": [],
            "cart_items": [{"id": "item-1", "name": "Bio-fertilizer", "price": 400, "quantity": 1}],
            "cart_total": 400.0,
        },
        "language": "hi",
        "want_audio": False,
    }
    res = client.post("/api/voice/interpret", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["action"]["safety_level"] == "REQUIRES_CONFIRMATION"
    assert data["pending_action"]["type"] == "PLACE_ORDER"
    print("[PASS] /api/voice/interpret triggered safety confirmation gate for financial order")


if __name__ == "__main__":
    test_voice_health_endpoint()
    test_voice_interpret_navigation()
    test_voice_interpret_confirmation_gate()
    print("\nALL FASTAPI VOICE API ENDPOINT TESTS PASSED!")
