"""IP-based geolocation using ip-api.com (free, no key, 45 req/min).

Used as a fallback when the browser geolocation API is unavailable or denied.
"""
from __future__ import annotations

import logging
from typing import Optional

import httpx
from fastapi import Request

from core.config import settings

log = logging.getLogger(__name__)


def get_client_ip(request: Request) -> Optional[str]:
    """Best-effort client IP extraction. Honors common reverse-proxy headers."""
    # X-Forwarded-For can be "client, proxy1, proxy2"
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    real = request.headers.get("x-real-ip")
    if real:
        return real.strip()
    return request.client.host if request.client else None


async def geolocate_ip(ip: Optional[str]) -> Optional[dict]:
    """Return {lat, lon, city, country} for the IP, or None."""
    # Don't bother for loopback / private IPs — no one will be in rural India
    # hitting the API from 127.0.0.1 in production, so just return None.
    if not ip or ip.startswith(("127.", "10.", "192.168.", "172.", "::1")):
        return None

    url = f"{settings.GEOIP_PROVIDER_URL}/{ip}"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
    except httpx.HTTPError as e:
        log.warning("geoip lookup failed for %s: %s", ip, e)
        return None

    if resp.status_code >= 400:
        return None

    data = resp.json()
    if data.get("status") != "success":
        return None

    return {
        "ip": ip,
        "lat": float(data["lat"]),
        "lon": float(data["lon"]),
        "city": data.get("city"),
        "region": data.get("regionName"),
        "country": data.get("country"),
        "country_code": data.get("countryCode"),
        "timezone": data.get("timezone"),
    }
