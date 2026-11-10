"""AI4Bharat IndicTrans2 Translation Provider.

Primary self-hosted translation provider.
Dual-mode architecture:
1. Primary: High-performance async HTTP requests to the dedicated IndicTrans2 inference microservice
   (running in GPU/CPU container, Kubernetes pod, or remote VM).
2. Resilient In-Process Engine: Seamless local IndicTrans2Engine failover if the remote HTTP microservice
   is undergoing cold start, container restart, or running in monolithic/testing mode.

Supports all 22 official Indian languages using FLORES-200 language codes.
"""
from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Any, Dict, List, Optional

import httpx

from services.translation.language_router import LanguageRouter, TranslationDirection
from services.translation.providers.base import BaseTranslationProvider

log = logging.getLogger(__name__)

# Default inference microservice URL
DEFAULT_INDICTRANS2_URL = os.getenv("INDICTRANS2_SERVICE_URL", "http://127.0.0.1:8001")


class IndicTrans2Provider(BaseTranslationProvider):
    """Primary provider connecting to AI4Bharat IndicTrans2 inference microservice with local fallback."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 1,
        batch_chunk_size: int = 16,
    ):
        self.base_url = (base_url or DEFAULT_INDICTRANS2_URL).rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.batch_chunk_size = batch_chunk_size
        self._circuit_open = False
        self._circuit_cooldown_until = 0.0
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def name(self) -> str:
        return "indictrans2"

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(self.timeout, connect=2.0),
                headers={"Content-Type": "application/json", "User-Agent": "KisaanBuddy-TranslationClient/1.0"},
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    def _check_circuit(self) -> bool:
        now = time.time()
        if self._circuit_open:
            if now > self._circuit_cooldown_until:
                log.info("IndicTrans2Provider circuit transitioning to HALF-OPEN")
                self._circuit_open = False
                return False
            return True
        return False

    def _trip_circuit(self, cooldown_seconds: float = 15.0):
        self._circuit_open = True
        self._circuit_cooldown_until = time.time() + cooldown_seconds
        log.warning("IndicTrans2Provider remote HTTP circuit TRIPPED. Cooling down for %.1fs", cooldown_seconds)

    def _translate_local(self, text: str, src: str, tgt: str) -> str:
        """Invokes the local IndicTrans2Engine directly."""
        from ml.indictrans2_service.engine import engine as local_engine
        return local_engine.translate(text, src, tgt)

    def _translate_batch_local(self, texts: List[str], src: str, tgt: str) -> List[str]:
        """Invokes the local IndicTrans2Engine batch directly."""
        from ml.indictrans2_service.engine import engine as local_engine
        return local_engine.translate_batch(texts, src, tgt)

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
    ) -> str:
        clean = (text or "").strip()
        if not clean:
            return ""

        direction, src, tgt = LanguageRouter.resolve_direction(source_lang, target_lang)
        if direction == TranslationDirection.IDENTITY:
            return clean

        # If remote circuit is currently open, fail over to local engine directly
        if self._check_circuit():
            try:
                return self._translate_local(clean, src, tgt)
            except Exception as le:
                raise RuntimeError(f"IndicTrans2 local engine error: {le}") from le

        payload = {
            "text": clean,
            "source_language": src,
            "target_language": tgt,
        }

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                client = await self._get_client()
                resp = await client.post("/translate", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    translated = data.get("translated_text", "")
                    if translated:
                        return translated
                    raise ValueError("IndicTrans2 service returned empty translation")
                else:
                    raise RuntimeError(f"IndicTrans2 HTTP {resp.status_code}: {resp.text}")
            except (httpx.ConnectError, httpx.TimeoutException, RuntimeError) as e:
                last_exc = e
                if attempt < self.max_retries:
                    await asyncio.sleep(0.2)
                else:
                    self._trip_circuit()

        # Remote HTTP failed -> invoke local engine
        try:
            log.info("IndicTrans2 remote HTTP unavailable; executing via local engine.")
            return self._translate_local(clean, src, tgt)
        except Exception as local_e:
            raise RuntimeError(f"IndicTrans2 translation failed: {last_exc} (local engine: {local_e})") from last_exc

    async def translate_batch(
        self,
        texts: List[str],
        source_lang: str,
        target_lang: str,
    ) -> List[str]:
        if not texts:
            return []

        direction, src, tgt = LanguageRouter.resolve_direction(source_lang, target_lang)
        if direction == TranslationDirection.IDENTITY:
            return list(texts)

        if self._check_circuit():
            try:
                return self._translate_batch_local(texts, src, tgt)
            except Exception as le:
                raise RuntimeError(f"IndicTrans2 local engine batch error: {le}") from le

        all_results: List[str] = []
        try:
            client = await self._get_client()
            for i in range(0, len(texts), self.batch_chunk_size):
                chunk = texts[i : i + self.batch_chunk_size]
                payload = {
                    "texts": chunk,
                    "source_language": src,
                    "target_language": tgt,
                }
                resp = await client.post("/translate/batch", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    chunk_trans = data.get("translations", [])
                    if len(chunk_trans) == len(chunk):
                        all_results.extend(chunk_trans)
                        continue
                raise RuntimeError(f"IndicTrans2 batch HTTP error: {resp.status_code}")
            return all_results
        except Exception as e:
            self._trip_circuit()
            log.info("IndicTrans2 remote batch unavailable; executing via local engine.")
            try:
                return self._translate_batch_local(texts, src, tgt)
            except Exception as local_e:
                raise RuntimeError(f"IndicTrans2 batch translation failed: {e} (local: {local_e})") from e

    async def is_healthy(self) -> bool:
        if not self._check_circuit():
            try:
                client = await self._get_client()
                resp = await client.get("/health", timeout=1.0)
                if resp.status_code == 200:
                    return True
            except Exception:
                pass
        try:
            from ml.indictrans2_service.engine import engine as local_engine
            return local_engine.get_status().get("status") == "ready"
        except Exception:
            return False
