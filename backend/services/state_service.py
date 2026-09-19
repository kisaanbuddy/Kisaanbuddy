"""Distributed State Service for KisaanBuddy Backend V2.

Encapsulates state access patterns (live sensor readings, session revocation,
distributed rate limit counters) using the Redis infrastructure client.
"""
from typing import Optional, Dict, Any, List
import time
import logging

from infrastructure.redis import redis_client

log = logging.getLogger("krishiai.state")


class StateService:
    def __init__(self, client=redis_client):
        self.client = client

    # --- Live Sensor Telemetry State ---
    def save_latest_sensor_reading(self, device_id: str, reading: Dict[str, Any], history_len: int = 50) -> bool:
        """Stores the latest sensor telemetry reading in Redis / shared state."""
        key_latest = f"sensor:latest:{device_id}"
        key_history = f"sensor:history:{device_id}"

        # Save latest reading
        self.client.set_json(key_latest, reading, ex=86400 * 7)  # 7-day TTL

        # Update short history deque list in shared state
        history = self.client.get_json(key_history) or []
        history.append(reading)
        if len(history) > history_len:
            history = history[-history_len:]
        self.client.set_json(key_history, history, ex=86400 * 7)
        return True

    def get_latest_sensor_reading(self, device_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves the newest reading for a specific device ID."""
        key_latest = f"sensor:latest:{device_id}"
        return self.client.get_json(key_latest)

    def get_sensor_history(self, device_id: str) -> List[Dict[str, Any]]:
        """Retrieves short telemetry history for a specific device ID."""
        key_history = f"sensor:history:{device_id}"
        return self.client.get_json(key_history) or []

    # --- Distributed Session Revocation ---
    def revoke_session_token(self, token: str, ttl_seconds: int = 86400 * 30) -> bool:
        """Marks a session token as revoked in shared state."""
        key = f"session:revoked:{token}"
        return self.client.set(key, "1", ex=ttl_seconds)

    def is_session_revoked(self, token: str) -> bool:
        """Checks if a session token is revoked."""
        key = f"session:revoked:{token}"
        return self.client.get(key) is not None

    # --- Distributed Rate Limiting Support ---
    def is_rate_limited(self, identifier: str, limit: int, window_seconds: int = 60) -> bool:
        """Simple token-bucket / counter rate check across instances."""
        key = f"ratelimit:{identifier}:{int(time.time() // window_seconds)}"
        val = self.client.get(key)
        count = int(val) if val else 0
        if count >= limit:
            return True
        self.client.set(key, str(count + 1), ex=window_seconds * 2)
        return False


state_service = StateService()
