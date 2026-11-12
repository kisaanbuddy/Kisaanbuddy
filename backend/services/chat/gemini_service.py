"""Official Google Gen AI SDK service layer for KisaanBuddy.

Centralizes:
  * Secure backend-only client lifecycle using `google-genai`
  * Latest stable Gemini model selection & fallback chain
  * Timeout, bounded exponential retry, and typed quota/billing error handling
  * Image validation & resizing (Pillow) to reduce bandwidth and vision token cost
  * Non-personal TTL response caching (Redis or bounded in-memory)
  * Token usage monitoring & structured usage logging (secret-redacted)
  * Multimodal helpers: Crop Photo Vision, Soil Health Card OCR, Audio STT, Voice Intent
"""
from __future__ import annotations

import asyncio
import base64
import hashlib
import io
import json
import logging
import random
import re
import threading
import time
from collections import deque
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Dict, List, Optional, Tuple, Union

from PIL import Image, ImageOps

from core.config import settings

log = logging.getLogger("krishiai.gemini")
usage_log = logging.getLogger("krishiai.gemini.usage")

MAX_IMAGE_RAW_BYTES = 10 * 1024 * 1024  # 10 MB hard upload cap
MAX_IMAGE_BASE64_CHARS = 14 * 1024 * 1024
MAX_IMAGE_DIMENSION = 1024  # resize longest edge for token/cost optimization
ALLOWED_IMAGE_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}
MIN_IMAGE_DIM = 32


# ---------------------------------------------------------------------------
# Secret redaction
# ---------------------------------------------------------------------------
_SECRET_PATTERNS = (
    re.compile(r"AQ\.[A-Za-z0-9_\-]{20,}"),
    re.compile(r"AIza[A-Za-z0-9_\-]{20,}"),
    re.compile(r"sk-[A-Za-z0-9_\-]{16,}"),
    re.compile(r"(Bearer\s+)[A-Za-z0-9._\-]{16,}", re.IGNORECASE),
    re.compile(r"([?&](?:key|api_key|token)=)[^&\s]+", re.IGNORECASE),
)


def redact_secrets(text: Optional[str]) -> str:
    """Mask API keys or bearer tokens from any error or log text."""
    if not text:
        return ""
    masked = str(text)
    configured = (settings.GEMINI_API_KEY or "").strip()
    if configured and len(configured) >= 8 and configured in masked:
        masked = masked.replace(configured, "***REDACTED***")
    for pat in _SECRET_PATTERNS:
        if pat.groups >= 1:
            masked = pat.sub(r"\1***REDACTED***", masked)
        else:
            masked = pat.sub("***REDACTED***", masked)
    return masked


# ---------------------------------------------------------------------------
# Typed error hierarchy
# ---------------------------------------------------------------------------
class GeminiError(Exception):
    def __init__(
        self,
        message: str,
        *,
        code: str = "gemini_error",
        status_code: int = 503,
        retryable: bool = False,
        user_message: Optional[str] = None,
    ) -> None:
        super().__init__(redact_secrets(message))
        self.code = code
        self.status_code = status_code
        self.retryable = retryable
        self.user_message = user_message or redact_secrets(message)


class GeminiConfigError(GeminiError):
    def __init__(self, message: str = "GEMINI_API_KEY is not configured on the backend.") -> None:
        super().__init__(
            message,
            code="gemini_not_configured",
            status_code=503,
            retryable=False,
            user_message="AI advisor is not configured yet on the server. Please contact support.",
        )


class GeminiBillingError(GeminiError):
    def __init__(self, message: str) -> None:
        super().__init__(
            message,
            code="billing_exhausted",
            status_code=402,
            retryable=False,
            user_message=(
                "Gemini API credits are currently depleted on the server account. "
                "Please top up billing in Google AI Studio or contact the KisaanBuddy administrator."
            ),
        )


class GeminiQuotaError(GeminiError):
    def __init__(self, message: str) -> None:
        super().__init__(
            message,
            code="rate_limited",
            status_code=429,
            retryable=True,
            user_message="AI advisor is receiving high traffic right now. Please try again in a few seconds.",
        )


class GeminiAuthError(GeminiError):
    def __init__(self, message: str) -> None:
        super().__init__(
            message,
            code="auth_failed",
            status_code=503,
            retryable=False,
            user_message="AI advisor authentication failed on the server. Please check backend GEMINI_API_KEY.",
        )


class GeminiBadRequestError(GeminiError):
    def __init__(self, message: str, *, status_code: int = 400) -> None:
        super().__init__(
            message,
            code="invalid_request",
            status_code=status_code,
            retryable=False,
            user_message=redact_secrets(message),
        )


class GeminiModelNotFoundError(GeminiError):
    def __init__(self, message: str) -> None:
        super().__init__(
            message,
            code="model_not_found",
            status_code=404,
            retryable=False,
        )


class GeminiTimeoutError(GeminiError):
    def __init__(self, message: str = "Gemini request timed out.") -> None:
        super().__init__(
            message,
            code="timeout",
            status_code=504,
            retryable=True,
            user_message="The AI advisor took too long to respond. Please try again.",
        )


def classify_genai_error(exc: Exception) -> GeminiError:
    """Map google-genai SDK or transport exceptions to typed GeminiError."""
    if isinstance(exc, GeminiError):
        return exc
    if isinstance(exc, (asyncio.TimeoutError, TimeoutError)):
        return GeminiTimeoutError(str(exc) or "Request timed out.")

    raw_msg = redact_secrets(str(exc))
    low = raw_msg.lower()
    code = getattr(exc, "code", None)
    status = str(getattr(exc, "status", "") or "").upper()

    if code == 402 or "prepayment credits" in low or "billing" in low or "credits are depleted" in low:
        return GeminiBillingError(f"Gemini billing/credits exhausted: {raw_msg}")
    if code in (401, 403) or "permission_denied" in status or "api key not valid" in low or "unauthorized" in low:
        return GeminiAuthError(f"Gemini auth/permission error: {raw_msg}")
    if code == 404 or "not_found" in status or "is not found" in low:
        return GeminiModelNotFoundError(f"Gemini model not found: {raw_msg}")
    if code == 429 or "resource_exhausted" in status or "quota" in low or "rate limit" in low:
        return GeminiQuotaError(f"Gemini quota/rate limit reached: {raw_msg}")
    if code == 400 or "invalid_argument" in status:
        return GeminiBadRequestError(f"Invalid request to Gemini: {raw_msg}")
    if code in (500, 502, 503, 504) or "unavailable" in low or "overloaded" in low or "timed out" in low or "timeout" in low:
        return GeminiError(
            f"Gemini transient error: {raw_msg}",
            code="upstream_unavailable",
            status_code=503,
            retryable=True,
            user_message="AI service is temporarily busy. Please try again shortly.",
        )

    return GeminiError(f"Gemini error: {raw_msg}", code="gemini_error", status_code=503, retryable=False)


# ---------------------------------------------------------------------------
# Token usage monitoring & logging
# ---------------------------------------------------------------------------
class GeminiUsageTracker:
    """Thread-safe rolling telemetry for Gemini API token usage and latency."""

    def __init__(self, max_events: int = 200) -> None:
        self._lock = threading.Lock()
        self._events: deque[Dict[str, Any]] = deque(maxlen=max_events)
        self._totals: Dict[str, Any] = {
            "total_requests": 0,
            "cache_hits": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "billing_errors": 0,
            "quota_errors": 0,
            "prompt_tokens": 0,
            "output_tokens": 0,
            "thoughts_tokens": 0,
            "total_tokens": 0,
            "image_bytes_saved": 0,
            "by_feature": {},
            "by_model": {},
        }

    def record(
        self,
        *,
        feature: str,
        model: str,
        prompt_tokens: int = 0,
        output_tokens: int = 0,
        thoughts_tokens: int = 0,
        total_tokens: int = 0,
        latency_ms: int = 0,
        cached: bool = False,
        status: str = "ok",
        error_code: Optional[str] = None,
        image_bytes_saved: int = 0,
    ) -> None:
        if total_tokens == 0 and (prompt_tokens or output_tokens or thoughts_tokens):
            total_tokens = prompt_tokens + output_tokens + thoughts_tokens

        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "feature": feature,
            "model": model,
            "prompt_tokens": int(prompt_tokens or 0),
            "output_tokens": int(output_tokens or 0),
            "thoughts_tokens": int(thoughts_tokens or 0),
            "total_tokens": int(total_tokens or 0),
            "latency_ms": int(latency_ms or 0),
            "cached": cached,
            "status": status,
            "error_code": error_code,
        }

        with self._lock:
            self._events.append(event)
            t = self._totals
            t["total_requests"] += 1
            if cached:
                t["cache_hits"] += 1
            elif status == "ok":
                t["successful_calls"] += 1
            else:
                t["failed_calls"] += 1
                if error_code == "billing_exhausted":
                    t["billing_errors"] += 1
                elif error_code == "rate_limited":
                    t["quota_errors"] += 1

            t["prompt_tokens"] += event["prompt_tokens"]
            t["output_tokens"] += event["output_tokens"]
            t["thoughts_tokens"] += event["thoughts_tokens"]
            t["total_tokens"] += event["total_tokens"]
            t["image_bytes_saved"] += max(0, int(image_bytes_saved or 0))

            feat_bucket = t["by_feature"].setdefault(
                feature, {"requests": 0, "tokens": 0, "cache_hits": 0, "errors": 0}
            )
            feat_bucket["requests"] += 1
            feat_bucket["tokens"] += event["total_tokens"]
            if cached:
                feat_bucket["cache_hits"] += 1
            if status != "ok":
                feat_bucket["errors"] += 1

            model_bucket = t["by_model"].setdefault(model, {"calls": 0, "tokens": 0})
            if not cached:
                model_bucket["calls"] += 1
                model_bucket["tokens"] += event["total_tokens"]

        usage_log.info(
            "GEMINI_USAGE feature=%s model=%s in_tok=%d out_tok=%d total_tok=%d cached=%s latency_ms=%d status=%s err=%s",
            feature,
            model,
            event["prompt_tokens"],
            event["output_tokens"],
            event["total_tokens"],
            cached,
            event["latency_ms"],
            status,
            error_code or "-",
        )

    def summary(self, recent_limit: int = 25) -> Dict[str, Any]:
        with self._lock:
            events_list = list(self._events)[-max(1, min(200, recent_limit)) :]
            return {
                **json.loads(json.dumps(self._totals)),
                "recent_events": list(reversed(events_list)),
            }

    def reset(self) -> None:
        with self._lock:
            self._events.clear()
            for k in (
                "total_requests",
                "cache_hits",
                "successful_calls",
                "failed_calls",
                "billing_errors",
                "quota_errors",
                "prompt_tokens",
                "output_tokens",
                "thoughts_tokens",
                "total_tokens",
                "image_bytes_saved",
            ):
                self._totals[k] = 0
            self._totals["by_feature"].clear()
            self._totals["by_model"].clear()


usage_tracker = GeminiUsageTracker()


def extract_usage_counts(resp: Any) -> Dict[str, int]:
    """Safely extract token counts from a GenerateContentResponse."""
    um = getattr(resp, "usage_metadata", None)
    if um is None:
        return {"prompt_tokens": 0, "output_tokens": 0, "thoughts_tokens": 0, "total_tokens": 0}
    return {
        "prompt_tokens": int(getattr(um, "prompt_token_count", 0) or 0),
        "output_tokens": int(getattr(um, "candidates_token_count", 0) or 0),
        "thoughts_tokens": int(getattr(um, "thoughts_token_count", 0) or 0),
        "total_tokens": int(getattr(um, "total_token_count", 0) or 0),
    }


# ---------------------------------------------------------------------------
# Non-personal response cache (cost optimization)
# ---------------------------------------------------------------------------
class GeminiResponseCache:
    """Dual-backend TTL cache for deterministic non-personal advisory answers."""

    MAX_MEM_ENTRIES = 500

    def __init__(self) -> None:
        self._mem: Dict[str, Tuple[Dict[str, Any], float]] = {}
        self._lock = asyncio.Lock()
        self._redis = None
        if settings.REDIS_URL:
            try:
                import redis.asyncio as redis_asyncio  # type: ignore

                self._redis = redis_asyncio.from_url(settings.REDIS_URL, decode_responses=True)
            except Exception as e:
                log.warning("Gemini cache Redis init skipped: %s", e)

    @staticmethod
    def build_key(message: str, language: str, model: str) -> str:
        norm = re.sub(r"\s+", " ", (message or "").strip().lower())
        digest = hashlib.sha256(f"{model}|{language}|{norm}".encode("utf-8")).hexdigest()
        return f"krishiai:gemini:resp:{digest}"

    async def get(self, key: str) -> Optional[Dict[str, Any]]:
        if self._redis is not None:
            try:
                raw = await self._redis.get(key)
                if raw:
                    return json.loads(raw)
            except Exception:
                pass
        async with self._lock:
            item = self._mem.get(key)
            if not item:
                return None
            val, exp = item
            if exp <= time.time():
                self._mem.pop(key, None)
                return None
            return val

    async def set(self, key: str, value: Dict[str, Any], ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds or settings.GEMINI_CACHE_TTL_SECONDS
        if ttl <= 0:
            return
        if self._redis is not None:
            try:
                await self._redis.set(key, json.dumps(value, ensure_ascii=False), ex=ttl)
                return
            except Exception:
                pass
        async with self._lock:
            now = time.time()
            expired = [k for k, (_, e) in self._mem.items() if e <= now]
            for k in expired:
                self._mem.pop(k, None)
            while len(self._mem) >= self.MAX_MEM_ENTRIES:
                oldest = min(self._mem.items(), key=lambda kv: kv[1][1])[0]
                self._mem.pop(oldest, None)
            self._mem[key] = (value, now + ttl)


response_cache = GeminiResponseCache()


# ---------------------------------------------------------------------------
# Image validation & cost-optimizing resizer
# ---------------------------------------------------------------------------
def prepare_crop_image(image_input: Union[str, bytes]) -> Tuple[bytes, str, Dict[str, Any]]:
    """Validate and resize an uploaded crop/document image before sending to Gemini.

    Raises GeminiBadRequestError on corrupt, unsupported, or oversized files.
    """
    raw_bytes: bytes
    if isinstance(image_input, str):
        s = image_input.strip()
        if not s:
            raise GeminiBadRequestError("Empty image payload.")
        if len(s) > MAX_IMAGE_BASE64_CHARS:
            raise GeminiBadRequestError("Image payload exceeds 10 MB limit.", status_code=413)
        if s.startswith("data:"):
            header, _, b64_part = s.partition(",")
            if ";base64" not in header.lower() or not b64_part:
                raise GeminiBadRequestError("Invalid base64 image data URL.")
            mime_hdr = header[5:].split(";")[0].lower()
            if mime_hdr not in ("image/jpeg", "image/jpg", "image/png", "image/webp"):
                raise GeminiBadRequestError(f"Unsupported image MIME type: {mime_hdr}. Allowed: JPEG, PNG, WebP.")
            s = b64_part
        try:
            raw_bytes = base64.b64decode(s, validate=True)
        except Exception as e:
            raise GeminiBadRequestError("Invalid base64 image encoding.") from e
    elif isinstance(image_input, (bytes, bytearray)):
        raw_bytes = bytes(image_input)
    else:
        raise GeminiBadRequestError("Invalid image input type.")

    if not raw_bytes:
        raise GeminiBadRequestError("Empty image bytes.")
    if len(raw_bytes) > MAX_IMAGE_RAW_BYTES:
        raise GeminiBadRequestError("Image exceeds 10 MB size limit.", status_code=413)

    try:
        probe = Image.open(io.BytesIO(raw_bytes))
        probe.verify()
        fmt = (probe.format or "").upper()
    except Exception as e:
        raise GeminiBadRequestError("Uploaded file is not a valid or readable image.") from e

    if fmt not in ALLOWED_IMAGE_FORMATS:
        raise GeminiBadRequestError(f"Unsupported image format '{fmt}'. Please upload JPEG, PNG, or WebP.")

    try:
        img = Image.open(io.BytesIO(raw_bytes))
        img = ImageOps.exif_transpose(img)
        orig_w, orig_h = img.size
        if orig_w < MIN_IMAGE_DIM or orig_h < MIN_IMAGE_DIM:
            raise GeminiBadRequestError(
                f"Image resolution ({orig_w}x{orig_h}) is too small for reliable analysis. Please upload a clearer photo."
            )

        resized = False
        if max(orig_w, orig_h) > MAX_IMAGE_DIMENSION:
            img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)
            resized = True

        # Normalize to RGB JPEG for compact, uniform vision input
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            rgba = img.convert("RGBA")
            bg.paste(rgba, mask=rgba.split()[-1])
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

        out_buf = io.BytesIO()
        img.save(out_buf, format="JPEG", quality=82, optimize=True)
        optimized_bytes = out_buf.getvalue()
        final_w, final_h = img.size

        # Keep smaller representation if already tiny PNG/JPEG
        if not resized and fmt in ("JPEG", "JPG") and len(raw_bytes) <= len(optimized_bytes):
            optimized_bytes = raw_bytes

        bytes_saved = max(0, len(raw_bytes) - len(optimized_bytes))
        meta = {
            "original_size_bytes": len(raw_bytes),
            "optimized_size_bytes": len(optimized_bytes),
            "bytes_saved": bytes_saved,
            "original_dimensions": f"{orig_w}x{orig_h}",
            "final_dimensions": f"{final_w}x{final_h}",
            "resized": resized,
        }
        return optimized_bytes, "image/jpeg", meta
    except GeminiBadRequestError:
        raise
    except Exception as e:
        raise GeminiBadRequestError("Failed to process uploaded image.") from e


# ---------------------------------------------------------------------------
# Client factory & model configuration
# ---------------------------------------------------------------------------
_client_singleton = None
_client_key_snapshot: Optional[str] = None
_client_lock = threading.Lock()


def is_gemini_configured() -> bool:
    key = (settings.GEMINI_API_KEY or "").strip()
    return len(key) >= 20


def get_api_key() -> str:
    key = (settings.GEMINI_API_KEY or "").strip()
    if len(key) < 20:
        raise GeminiConfigError()
    return key


def reset_client_cache() -> None:
    global _client_singleton, _client_key_snapshot
    with _client_lock:
        _client_singleton = None
        _client_key_snapshot = None


def get_gemini_client():
    """Return singleton google.genai.Client configured from backend env."""
    global _client_singleton, _client_key_snapshot
    key = get_api_key()
    with _client_lock:
        if _client_singleton is not None and _client_key_snapshot == key:
            return _client_singleton
        from google import genai
        from google.genai import types

        timeout_ms = max(5000, int(float(settings.GEMINI_TIMEOUT_SECONDS) * 1000))
        _client_singleton = genai.Client(
            api_key=key,
            http_options=types.HttpOptions(timeout=timeout_ms, api_version="v1beta"),
        )
        _client_key_snapshot = key
        return _client_singleton


def get_model_chain(for_vision: bool = False) -> List[str]:
    """Ordered unique Gemini models to attempt for text or vision."""
    primary = (settings.GEMINI_VISION_MODEL if for_vision else settings.GEMINI_MODEL).strip()
    fallbacks = [
        m.strip()
        for m in (settings.GEMINI_FALLBACK_MODELS or "").split(",")
        if m.strip()
    ]
    chain: List[str] = []
    for m in [primary, settings.GEMINI_MODEL.strip(), *fallbacks]:
        if m and m not in chain:
            chain.append(m)
    return chain


def build_gemini_tools(openai_tool_schemas: List[Dict[str, Any]]):
    """Convert OpenAI-style function schemas to google.genai Tool declarations."""
    from google.genai import types

    declarations: List[types.FunctionDeclaration] = []
    for item in openai_tool_schemas:
        fn = item.get("function") or {}
        name = fn.get("name")
        if not name:
            continue
        declarations.append(
            types.FunctionDeclaration(
                name=name,
                description=fn.get("description", ""),
                parameters_json_schema=fn.get("parameters") or {"type": "object", "properties": {}},
            )
        )
    return [types.Tool(function_declarations=declarations)] if declarations else []


def make_generate_config(
    *,
    model_name: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.3,
    max_output_tokens: Optional[int] = None,
    tools: Optional[List[Any]] = None,
    response_mime_type: Optional[str] = None,
    disable_thinking_on_flash: bool = True,
):
    """Construct GenerateContentConfig tuned for model capabilities & cost."""
    from google.genai import types

    kwargs: Dict[str, Any] = {
        "temperature": temperature,
    }
    if system_instruction:
        kwargs["system_instruction"] = system_instruction
    if max_output_tokens is not None:
        kwargs["max_output_tokens"] = max_output_tokens
    if tools:
        kwargs["tools"] = tools
    if response_mime_type:
        kwargs["response_mime_type"] = response_mime_type

    # Bound thinking budget on Flash models so latency & output tokens stay predictable.
    # Gemini 2.5 Pro requires thinking enabled, so only set budget=0 on non-Pro models.
    if disable_thinking_on_flash and "flash" in model_name.lower():
        kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=0)

    return types.GenerateContentConfig(**kwargs)


# ---------------------------------------------------------------------------
# Resilient execution with timeout, retries & model fallback
# ---------------------------------------------------------------------------
async def generate_with_retry(
    *,
    contents: Any,
    feature: str,
    models: Optional[List[str]] = None,
    system_instruction: Optional[str] = None,
    temperature: float = 0.3,
    max_output_tokens: Optional[int] = None,
    tools: Optional[List[Any]] = None,
    response_mime_type: Optional[str] = None,
    timeout_seconds: Optional[float] = None,
) -> Tuple[Any, str]:
    """Execute async Gemini generate_content with timeout, retries, and model fallback."""
    client = get_gemini_client()
    attempt_models = models or get_model_chain(for_vision=False)
    timeout = float(timeout_seconds or settings.GEMINI_TIMEOUT_SECONDS)
    max_retries = max(0, int(settings.GEMINI_MAX_RETRIES))

    last_err: Optional[GeminiError] = None
    for model_name in attempt_models:
        config = make_generate_config(
            model_name=model_name,
            system_instruction=system_instruction,
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            tools=tools,
            response_mime_type=response_mime_type,
        )
        for attempt in range(max_retries + 1):
            t0 = time.perf_counter()
            try:
                resp = await asyncio.wait_for(
                    client.aio.models.generate_content(
                        model=model_name,
                        contents=contents,
                        config=config,
                    ),
                    timeout=timeout,
                )
                latency_ms = int((time.perf_counter() - t0) * 1000)
                counts = extract_usage_counts(resp)
                usage_tracker.record(
                    feature=feature,
                    model=model_name,
                    latency_ms=latency_ms,
                    status="ok",
                    **counts,
                )
                return resp, model_name
            except Exception as exc:
                latency_ms = int((time.perf_counter() - t0) * 1000)
                gerr = classify_genai_error(exc)
                last_err = gerr
                usage_tracker.record(
                    feature=feature,
                    model=model_name,
                    latency_ms=latency_ms,
                    status="error",
                    error_code=gerr.code,
                )
                if isinstance(gerr, GeminiModelNotFoundError):
                    log.warning("Gemini model %s unavailable; falling back to next model.", model_name)
                    break
                if gerr.retryable and attempt < max_retries:
                    delay = (0.5 * (2**attempt)) + random.uniform(0.05, 0.25)
                    log.warning(
                        "Gemini transient error on %s (attempt %d/%d): %s; retrying in %.2fs",
                        model_name,
                        attempt + 1,
                        max_retries + 1,
                        gerr.code,
                        delay,
                    )
                    await asyncio.sleep(delay)
                    continue
                if isinstance(gerr, (GeminiBillingError, GeminiAuthError, GeminiBadRequestError)):
                    raise gerr
                break

    raise last_err or GeminiError("Gemini generation failed.")


async def stream_with_retry(
    *,
    contents: Any,
    feature: str,
    models: Optional[List[str]] = None,
    system_instruction: Optional[str] = None,
    temperature: float = 0.3,
    max_output_tokens: Optional[int] = None,
    tools: Optional[List[Any]] = None,
    timeout_seconds: Optional[float] = None,
) -> AsyncIterator[Tuple[Any, str]]:
    """Yield `(chunk, model_name)` from Gemini async streaming with initial-connection retry."""
    client = get_gemini_client()
    attempt_models = models or get_model_chain(for_vision=False)
    timeout = float(timeout_seconds or settings.GEMINI_TIMEOUT_SECONDS)
    max_retries = max(0, int(settings.GEMINI_MAX_RETRIES))

    last_err: Optional[GeminiError] = None
    for model_name in attempt_models:
        config = make_generate_config(
            model_name=model_name,
            system_instruction=system_instruction,
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            tools=tools,
        )
        for attempt in range(max_retries + 1):
            t0 = time.perf_counter()
            yielded_any = False
            last_usage: Dict[str, int] = {"prompt_tokens": 0, "output_tokens": 0, "thoughts_tokens": 0, "total_tokens": 0}
            try:
                stream = await asyncio.wait_for(
                    client.aio.models.generate_content_stream(
                        model=model_name,
                        contents=contents,
                        config=config,
                    ),
                    timeout=timeout,
                )
                async for chunk in stream:
                    yielded_any = True
                    counts = extract_usage_counts(chunk)
                    if counts["total_tokens"] or counts["prompt_tokens"] or counts["output_tokens"]:
                        last_usage = counts
                    yield chunk, model_name

                latency_ms = int((time.perf_counter() - t0) * 1000)
                usage_tracker.record(
                    feature=feature,
                    model=model_name,
                    latency_ms=latency_ms,
                    status="ok",
                    **last_usage,
                )
                return
            except Exception as exc:
                latency_ms = int((time.perf_counter() - t0) * 1000)
                gerr = classify_genai_error(exc)
                last_err = gerr
                usage_tracker.record(
                    feature=feature,
                    model=model_name,
                    latency_ms=latency_ms,
                    status="error",
                    error_code=gerr.code,
                )
                if yielded_any:
                    raise gerr
                if isinstance(gerr, GeminiModelNotFoundError):
                    log.warning("Gemini stream model %s unavailable; falling back.", model_name)
                    break
                if gerr.retryable and attempt < max_retries:
                    delay = (0.5 * (2**attempt)) + random.uniform(0.05, 0.25)
                    log.warning(
                        "Gemini stream retry on %s (%d/%d): %s",
                        model_name,
                        attempt + 1,
                        max_retries + 1,
                        gerr.code,
                    )
                    await asyncio.sleep(delay)
                    continue
                if isinstance(gerr, (GeminiBillingError, GeminiAuthError, GeminiBadRequestError)):
                    raise gerr
                break

    raise last_err or GeminiError("Gemini streaming failed.")


# ---------------------------------------------------------------------------
# Multimodal Domain Helpers (Soil Report OCR, Audio STT, Voice Intent)
# ---------------------------------------------------------------------------
async def extract_soil_report_with_gemini(
    file_bytes: bytes,
    filename: str = "soil_report.pdf",
    content_type: str = "application/pdf",
) -> Dict[str, Any]:
    """Extract structured Soil Health Card metrics using Gemini multimodal document intelligence."""
    from google.genai import types

    if not file_bytes:
        raise GeminiBadRequestError("Empty file provided for soil report extraction.")
    if len(file_bytes) > 15 * 1024 * 1024:
        raise GeminiBadRequestError("Soil report file exceeds 15 MB limit.", status_code=413)

    lower_name = (filename or "").lower()
    ctype = (content_type or "").lower()

    part: Any
    raw_preview = ""
    if "pdf" in ctype or lower_name.endswith(".pdf"):
        if not file_bytes.lstrip().startswith(b"%PDF"):
            raise GeminiBadRequestError("Invalid PDF file header.")
        part = types.Part.from_bytes(data=file_bytes, mime_type="application/pdf")
    elif ctype.startswith("text/") or lower_name.endswith((".txt", ".csv")):
        raw_preview = file_bytes.decode("utf-8", errors="ignore")[:8000]
        part = raw_preview
    else:
        opt_bytes, opt_mime, _ = prepare_crop_image(file_bytes)
        part = types.Part.from_bytes(data=opt_bytes, mime_type=opt_mime)

    system_prompt = (
        "You are an expert Indian agronomist and Soil Health Card (SHC) analyst. "
        "Extract ONLY values explicitly visible in the provided document. "
        "NEVER invent or guess missing laboratory values; return null for any field not clearly present. "
        "Convert Nitrogen/P/K from kg/acre to kg/ha (multiply by 2.471) only if clearly stated in kg/acre; otherwise keep kg/ha. "
        "Return strict JSON with keys: soil_ph (number|null), nitrogen_kg_ha (number|null), "
        "phosphorus_kg_ha (number|null), potassium_kg_ha (number|null), organic_carbon_pct (number|null), "
        "ec_ds_m (number|null), soil_type (string|null), lab_name (string|null), test_date (YYYY-MM-DD|null), "
        "farmer_name (string|null), village_or_district (string|null), "
        "health_summary (concise 1-2 sentence factual summary noting any unreadable/missing fields)."
    )

    resp, _ = await generate_with_retry(
        contents=[part, f"Extract the Soil Health Card fields from '{filename}' into strict JSON."],
        feature="soil_ocr",
        models=get_model_chain(for_vision=False),
        system_instruction=system_prompt,
        temperature=0.1,
        max_output_tokens=700,
        response_mime_type="application/json",
    )

    raw_text = (getattr(resp, "text", None) or "").strip()
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", raw_text, re.DOTALL)
        parsed = json.loads(m.group(0)) if m else {}

    defaults = {
        "soil_ph": None,
        "nitrogen_kg_ha": None,
        "phosphorus_kg_ha": None,
        "potassium_kg_ha": None,
        "organic_carbon_pct": None,
        "ec_ds_m": None,
        "soil_type": None,
        "lab_name": None,
        "test_date": None,
        "farmer_name": None,
        "village_or_district": None,
        "health_summary": "Document analyzed. Please verify extracted parameters against your printed Soil Health Card.",
    }
    defaults.update({k: v for k, v in (parsed or {}).items() if k in defaults})
    defaults["raw_extracted_text"] = raw_preview[:1000] if raw_preview else raw_text[:1000]
    defaults["source_file"] = filename
    return defaults


async def transcribe_audio_with_gemini(
    audio_bytes: bytes,
    mime_type: str = "audio/webm",
    language: Optional[str] = None,
) -> Tuple[str, str]:
    """Transcribe short farmer speech audio in Indian languages using Gemini multimodal audio."""
    from google.genai import types

    lang_hint = language or "auto (Hindi, Hinglish, Kannada, English, or other Indian language)"
    prompt = (
        f"Transcribe the farmer's spoken audio accurately in its original language/script "
        f"(language hint: {lang_hint}). Return ONLY strict JSON: "
        '{"transcript": "...", "language": "hi|kn|en|hi_en|bn|mr|te|ta|gu|pa|ml"}'
    )
    resp, _ = await generate_with_retry(
        contents=[types.Part.from_bytes(data=audio_bytes, mime_type=mime_type), prompt],
        feature="stt",
        models=get_model_chain(for_vision=False),
        temperature=0.0,
        max_output_tokens=300,
        response_mime_type="application/json",
    )
    raw = (getattr(resp, "text", None) or "").strip()
    data = json.loads(raw) if raw.startswith("{") else {}
    transcript = (data.get("transcript") or "").strip()
    detected = (data.get("language") or language or "hi").strip()
    return transcript, detected


async def interpret_voice_command_with_gemini(
    transcript: str,
    page_context: Dict[str, Any],
    language: str,
) -> Dict[str, Any]:
    """Use Gemini to map complex spoken farmer requests into safe KisaanBuddy UI actions."""
    route = page_context.get("current_route", "/")
    visible = page_context.get("visible_items", [])[:5]

    system_prompt = (
        "You are the voice operating brain of the KisaanBuddy agricultural platform. "
        "Translate spoken farmer requests into secure JSON website actions.\n"
        "Permitted action_type values:\n"
        "- NAVIGATE: payload {\"path\": \"/\"|\"/dashboard\"|\"/disease\"|\"/marketplace\"|\"/mandi\"|\"/weather\"|\"/worker-connect\"|\"/schemes\"|\"/farmer-profile\"|\"/orders\"|\"/settings\"|\"/chatbot\"}\n"
        "- SEARCH: payload {\"query\": string, \"target\": \"marketplace\"|\"mandi\"|\"workers\"|\"schemes\"}\n"
        "- FILTER_PRICE: payload {\"maxPrice\": number}\n"
        "- SELECT_ITEM: payload {\"index\": int, \"id\": any}\n"
        "- ADD_TO_CART: payload {\"id\": any, \"name\": string}\n"
        "- TOGGLE_THEME: payload {\"theme\": \"dark\"|\"light\"}\n"
        "- CHANGE_LANGUAGE: payload {\"language\": \"hi\"|\"kn\"|\"en\"|\"hi_en\"}\n"
        "- NOOP: payload {} (for general agricultural questions)\n"
        "Return ONLY strict JSON with keys: action_type, payload, reply_text (in the farmer's language)."
    )
    user_prompt = (
        f"Page: {route}. Visible items: {json.dumps(visible, ensure_ascii=False)}. "
        f"User said: '{transcript}' (language: '{language}')."
    )
    resp, _ = await generate_with_retry(
        contents=user_prompt,
        feature="voice_intent",
        models=get_model_chain(for_vision=False),
        system_instruction=system_prompt,
        temperature=0.1,
        max_output_tokens=350,
        response_mime_type="application/json",
    )
    raw = (getattr(resp, "text", None) or "{}").strip()
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    return json.loads(match.group(0) if match else raw)
