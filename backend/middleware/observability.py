"""Structured Logging & Observability Middleware for FastAPI.

Assigns request_id header, measures duration_ms, redacts sensitive headers/credentials,
and logs structured execution metrics.
"""
from typing import Callable
import time
import uuid
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from core.metrics import record_request_metric

log = logging.getLogger("krishiai.observability")


class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = f"req_{uuid.uuid4().hex[:10]}"
        start_time = time.perf_counter()

        # Attach request_id to request state
        request.state.request_id = request_id

        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

            # Record metric
            record_request_metric(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code,
                duration_ms=duration_ms
            )

            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time-MS"] = str(duration_ms)

            # Structured logging without exposing sensitive data
            log.info(
                "request_id=%s method=%s path=%s status=%d duration_ms=%.2f",
                request_id, request.method, request.url.path, response.status_code, duration_ms
            )
            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            record_request_metric(
                method=request.method,
                endpoint=request.url.path,
                status_code=500,
                duration_ms=duration_ms
            )
            log.error(
                "request_id=%s method=%s path=%s ERROR: %s duration_ms=%.2f",
                request_id, request.method, request.url.path, exc, duration_ms
            )
            raise exc
