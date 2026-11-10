"""Central Translation Service for KisaanBuddy.

Powered 100% by AI4Bharat IndicTrans2:
- Primary Engine: Standalone IndicTrans2 Inference Microservice
- Resilient In-Process Engine: Seamless local IndicTrans2Engine fallback
- LanguageRouter (FLORES-200 and ISO mappings)
- TranslationCache (L1 Memory, L2 Redis, L3 Database)
- AgriculturalGlossary (Domain terminology protection & brand preservation)
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Dict, List, Optional, Tuple, Union

from core.config import settings
from services.translation.cache import translation_cache, TranslationCache
from services.translation.glossary import glossary, AgriculturalGlossary
from services.translation.language_router import LanguageRouter, TranslationDirection
from services.translation.providers.base import BaseTranslationProvider
from services.translation.providers.indictrans2_provider import IndicTrans2Provider

log = logging.getLogger(__name__)


class TranslationService:
    """Self-hosted Indian language translation orchestrator powered by IndicTrans2."""

    def __init__(
        self,
        provider: Optional[BaseTranslationProvider] = None,
        cache: Optional[TranslationCache] = None,
        glossary_engine: Optional[AgriculturalGlossary] = None,
    ):
        self.router = LanguageRouter()
        self.cache = cache or translation_cache
        self.glossary = glossary_engine or glossary
        self.provider = provider or IndicTrans2Provider()

    async def translate(
        self,
        text: str,
        target_language: str,
        source_language: str = "eng_Latn",
        use_cache: bool = True,
        protect_glossary: bool = True,
    ) -> Dict[str, Any]:
        """Translates a single string with caching, glossary masking, and IndicTrans2 execution."""
        clean_text = (text or "").strip()
        if not clean_text:
            return {
                "translated_text": "",
                "source_language": source_language,
                "target_language": target_language,
                "provider": "identity",
                "cached": False,
            }

        direction, src, tgt = self.router.resolve_direction(source_language, target_language)

        if direction == TranslationDirection.IDENTITY:
            return {
                "translated_text": clean_text,
                "source_language": src,
                "target_language": tgt,
                "provider": "identity",
                "cached": False,
            }

        # 1. Check Cache
        if use_cache:
            cached_res = self.cache.get(clean_text, src, tgt)
            if cached_res is not None:
                cached_text, cached_prov = cached_res
                return {
                    "translated_text": cached_text,
                    "source_language": src,
                    "target_language": tgt,
                    "provider": cached_prov,
                    "cached": True,
                }

        # 2. Agricultural Glossary Protection
        token_map = {}
        text_to_translate = clean_text
        if protect_glossary:
            text_to_translate, token_map = self.glossary.protect_and_mask(clean_text)

        # 3. IndicTrans2 Execution
        translated_raw = await self.provider.translate(
            text=text_to_translate,
            source_lang=src,
            target_lang=tgt,
        )

        if not translated_raw:
            raise RuntimeError(f"Translation returned empty result from provider '{self.provider.name}'")

        # 4. Glossary Restoration & Term Canonicalization
        if protect_glossary and token_map:
            final_text = self.glossary.restore_and_canonicalize(translated_raw, token_map, tgt)
        else:
            final_text = translated_raw

        # 5. Populate Cache
        if use_cache:
            self.cache.set(
                text=clean_text,
                source_language=src,
                target_language=tgt,
                translated_text=final_text,
                provider=self.provider.name,
            )

        return {
            "translated_text": final_text,
            "source_language": src,
            "target_language": tgt,
            "provider": self.provider.name,
            "cached": False,
        }

    async def translate_batch(
        self,
        texts: List[str],
        target_language: str,
        source_language: str = "eng_Latn",
        use_cache: bool = True,
        protect_glossary: bool = True,
    ) -> Dict[str, Any]:
        """Translates multiple strings in batch using IndicTrans2."""
        if not texts:
            return {
                "translations": [],
                "source_language": source_language,
                "target_language": target_language,
                "provider": "identity",
            }

        direction, src, tgt = self.router.resolve_direction(source_language, target_language)

        if direction == TranslationDirection.IDENTITY:
            return {
                "translations": list(texts),
                "source_language": src,
                "target_language": tgt,
                "provider": "identity",
            }

        results: List[Optional[str]] = [None] * len(texts)
        cached_dict: Dict[int, str] = {}
        missing_indices: List[Tuple[int, str]] = []

        # 1. Check Batch Cache
        if use_cache:
            cached_dict, missing_indices = self.cache.get_batch(texts, src, tgt)
            for idx, val in cached_dict.items():
                results[idx] = val
        else:
            missing_indices = [(i, t) for i, t in enumerate(texts)]

        if not missing_indices:
            return {
                "translations": [results[i] for i in range(len(texts))],
                "source_language": src,
                "target_language": tgt,
                "provider": "cache",
            }

        # 2. Prepare missing strings with Glossary Masking
        masked_batch: List[str] = []
        token_maps: List[Dict[str, str]] = []

        for _, orig_text in missing_indices:
            clean = (orig_text or "").strip()
            if not clean:
                masked_batch.append("")
                token_maps.append({})
            elif protect_glossary:
                m_text, t_map = self.glossary.protect_and_mask(clean)
                masked_batch.append(m_text)
                token_maps.append(t_map)
            else:
                masked_batch.append(clean)
                token_maps.append({})

        active_items = [(i, m) for i, m in enumerate(masked_batch) if m]
        active_indices = [item[0] for item in active_items]
        active_texts = [item[1] for item in active_items]

        raw_translations: List[str] = []
        if active_texts:
            raw_translations = await self.provider.translate_batch(
                texts=active_texts,
                source_lang=src,
                target_lang=tgt,
            )

        translated_for_missing: List[str] = [""] * len(missing_indices)
        for sub_idx, trans_text in zip(active_indices, raw_translations):
            translated_for_missing[sub_idx] = trans_text

        # 3. Restore glossary tokens and save to cache
        cache_items_to_save: List[Dict[str, Any]] = []
        for local_idx, (orig_pos, orig_text) in enumerate(missing_indices):
            clean_orig = (orig_text or "").strip()
            if not clean_orig:
                results[orig_pos] = orig_text
                continue

            trans_raw = translated_for_missing[local_idx]
            t_map = token_maps[local_idx]
            if protect_glossary and t_map:
                final_t = self.glossary.restore_and_canonicalize(trans_raw, t_map, tgt)
            else:
                final_t = trans_raw

            results[orig_pos] = final_t
            cache_items_to_save.append({"text": clean_orig, "translated_text": final_t})

        if use_cache and cache_items_to_save:
            self.cache.set_batch(
                items=cache_items_to_save,
                source_language=src,
                target_language=tgt,
                provider=self.provider.name,
            )

        return {
            "translations": [results[i] for i in range(len(texts))],
            "source_language": src,
            "target_language": tgt,
            "provider": self.provider.name,
        }

    async def translate_structured(
        self,
        data: Any,
        target_language: str,
        source_language: str = "eng_Latn",
        keys_to_translate: Optional[List[str]] = None,
    ) -> Any:
        """Translates dynamic nested JSON structures preserving IDs, keys, prices, numbers, and URLs."""
        if not data:
            return data

        target_keys = set(keys_to_translate or [
            "name", "title", "description", "summary", "advice", "market",
            "commodity", "variety", "crop_name", "disease_name", "treatment",
            "recommendation", "category", "status_text"
        ])

        text_pointers: List[Tuple[Any, Union[str, int], str]] = []

        def _collect(obj: Any):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    if isinstance(v, str) and (keys_to_translate is None or k in target_keys):
                        if v.strip() and not v.startswith("http://") and not v.startswith("https://"):
                            text_pointers.append((obj, k, v))
                    else:
                        _collect(v)
            elif isinstance(obj, list):
                for idx, item in enumerate(obj):
                    if isinstance(item, str) and keys_to_translate is None:
                        text_pointers.append((obj, idx, item))
                    else:
                        _collect(item)

        import copy
        cloned = copy.deepcopy(data)
        _collect(cloned)

        if not text_pointers:
            return cloned

        texts_to_batch = [item[2] for item in text_pointers]
        batch_res = await self.translate_batch(
            texts=texts_to_batch,
            target_language=target_language,
            source_language=source_language,
        )

        translated_list = batch_res.get("translations", [])
        for (parent, key_or_idx, _), translated_val in zip(text_pointers, translated_list):
            parent[key_or_idx] = translated_val

        return cloned


# Global singleton instance
translation_service = TranslationService()
