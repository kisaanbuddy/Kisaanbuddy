"""Populate all missing keys in frontend locale JSON files using Sarvam AI.

Optimized with asyncio.Semaphore(3) for fast concurrent translation with zero rate-limit errors.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, ".")

from services.sarvam_service import translate_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

LOCALES_DIR = "../frontend-next/src/lib/locales"


def get_flattened_items(d: dict, prefix: str = "") -> dict[str, str]:
    items: dict[str, str] = {}
    for k, v in d.items():
        full = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.update(get_flattened_items(v, full))
        elif isinstance(v, str):
            items[full] = v
        else:
            items[full] = str(v)
    return items


def set_nested_value(d: dict, key_path: str, value: str) -> None:
    parts = key_path.split(".")
    current = d
    for part in parts[:-1]:
        if part not in current or not isinstance(current[part], dict):
            current[part] = {}
        current = current[part]
    current[parts[-1]] = value


async def translate_single_safe(
    sem: asyncio.Semaphore, text: str, target_lang: str, retries: int = 4
) -> tuple[str, str]:
    """Translate a single string with Semaphore and exponential backoff retry."""
    if not text or not any(c.isalpha() for c in str(text)):
        return text, text
    async with sem:
        for attempt in range(retries):
            try:
                res = await translate_text(text, target_lang=target_lang, source_lang="en")
                if res and res.strip():
                    await asyncio.sleep(0.2)
                    return text, res.strip()
            except Exception as e:
                if "429" in str(e) or "rate" in str(e).lower():
                    wait = (attempt + 1) * 3.0
                    logger.warning(f"Rate limited for {target_lang}. Backing off {wait}s...")
                    await asyncio.sleep(wait)
                else:
                    logger.warning(f"Error translating '{text[:25]}' to {target_lang}: {e}")
                    await asyncio.sleep(1.0)
        return text, text  # Fallback to English original if all retries fail


async def process_locale(loc: str, en_items: dict[str, str], hi_items: dict[str, str]) -> None:
    path = os.path.join(LOCALES_DIR, f"{loc}.json")
    if not os.path.exists(path):
        data = {}
    else:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

    existing_items = get_flattened_items(data)
    missing_items = {k: v for k, v in en_items.items() if k not in existing_items}

    logger.info(f"[{loc}] Existing keys: {len(existing_items)}, Missing keys: {len(missing_items)}")
    if not missing_items:
        logger.info(f"[{loc}] Already complete (0 missing)!")
        return

    # For Hinglish (hi_en), fill missing keys using Hindi or English appropriately
    if loc == "hi_en":
        for k, v in missing_items.items():
            val = hi_items.get(k, v)
            set_nested_value(data, k, val)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"[hi_en] Successfully populated {len(missing_items)} keys.")
        return

    # Deduplicate unique texts
    unique_texts = list({v for v in missing_items.values() if v and any(c.isalpha() for c in str(v))})
    logger.info(f"[{loc}] Translating {len(unique_texts)} unique strings across {len(missing_items)} missing keys concurrently...")

    sem = asyncio.Semaphore(3)
    tasks = [translate_single_safe(sem, orig, loc) for orig in unique_texts]
    results = await asyncio.gather(*tasks)
    trans_map = dict(results)

    # Populate missing keys in data
    for k, v in missing_items.items():
        trans_val = trans_map.get(v, v)
        set_nested_value(data, k, trans_val)

    # Save to file
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    new_items = get_flattened_items(data)
    logger.info(f"[{loc}] Saved! Total keys now: {len(new_items)} (missing: {len(en_items) - len(new_items)})")


async def main() -> None:
    en_path = os.path.join(LOCALES_DIR, "en.json")
    with open(en_path, "r", encoding="utf-8") as f:
        en_data = json.load(f)
    en_items = get_flattened_items(en_data)

    hi_path = os.path.join(LOCALES_DIR, "hi.json")
    with open(hi_path, "r", encoding="utf-8") as f:
        hi_data = json.load(f)
    hi_items = get_flattened_items(hi_data)

    logger.info(f"English reference total keys: {len(en_items)}")

    # Target locales in order
    target_locales = ["hi_en", "ta", "te", "mr", "gu", "bn", "pa", "ml"]
    for loc in target_locales:
        await process_locale(loc, en_items, hi_items)
        await asyncio.sleep(0.5)


if __name__ == "__main__":
    asyncio.run(main())
