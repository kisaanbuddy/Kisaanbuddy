"""Fast, deterministic language detection for the KrishiAI assistant.

Strategy:
  1. Unicode script check — Devanagari => hi, Kannada block => kn.
     This is O(n) and 100% reliable for Hindi/Kannada native script.
  2. For Latin-script input, fall back to `langdetect` (if installed) with an
     en/hi/kn constraint list. This catches Hinglish transliterations like
     "barish kab hogi".
  3. Default to English.

We never block on this — if langdetect is missing, we return 'en' and let
the LLM handle it. This keeps the assistant resilient.
"""
from __future__ import annotations

import logging
from typing import Literal

log = logging.getLogger(__name__)

Lang = Literal["en", "hi", "kn"]

# Unicode block ranges (inclusive).
_DEVANAGARI = (0x0900, 0x097F)   # Hindi, Marathi, Sanskrit
_KANNADA = (0x0C80, 0x0CFF)

# Small Hinglish/Kanglish keyword bias so langdetect doesn't misfire on short input.
_HINDI_LATIN_HINTS = {
    "kya", "hai", "hain", "kaise", "kyun", "kyon", "kab", "kahan", "kaun",
    "aap", "apna", "mere", "humara", "tumhara", "batao", "bataiye", "karo",
    "kijiye", "chahiye", "nahi", "nahin", "haan", "accha", "theek", "kheti",
    "fasal", "barish", "mausam", "khad", "mitti", "paani", "subsidy", "yojana",
    "mandi", "bhav", "gehu", "dhan", "chawal", "ganna", "kapas",
}
_KANNADA_LATIN_HINTS = {
    "enu", "yaava", "yaake", "hege", "yaaru", "heli", "heluvudu", "agri",
    "madi", "madbeku", "irbeku", "bedi", "beku", "iralla", "illa", "haudu",
    "bele", "krishi", "matte", "heltira", "helthira",
    # Kannada agri terms transliterated:
    "bhatta", "raagi", "jola", "bhatha", "hoola", "hool",
    "maLe", "male", "mannu", "neeru",  # rain, soil, water
}


def detect_language(text: str) -> Lang:
    """Return 'en', 'hi', or 'kn'. Never raises."""
    if not text or not text.strip():
        return "en"

    s = text.strip()

    # Script-based detection — exact and fast.
    hi_count = kn_count = total_letters = 0
    for ch in s:
        cp = ord(ch)
        if ch.isalpha():
            total_letters += 1
        if _DEVANAGARI[0] <= cp <= _DEVANAGARI[1]:
            hi_count += 1
        elif _KANNADA[0] <= cp <= _KANNADA[1]:
            kn_count += 1

    if total_letters > 0:
        if kn_count / max(total_letters, 1) > 0.25:
            return "kn"
        if hi_count / max(total_letters, 1) > 0.25:
            return "hi"

    # Latin script — keyword bias first (catches "barish hogi kya?").
    lowered = s.lower()
    words = {w.strip(".,!?;:()[]\"'") for w in lowered.split()}
    if words & _KANNADA_LATIN_HINTS:
        return "kn"
    if words & _HINDI_LATIN_HINTS:
        return "hi"

    # Fall back to langdetect if available.
    try:
        from langdetect import detect, DetectorFactory  # type: ignore

        DetectorFactory.seed = 0
        code = detect(s)
        if code in ("hi", "mr", "ne"):  # treat Marathi/Nepali as Hindi for our 3-lang set
            return "hi"
        if code == "kn":
            return "kn"
    except Exception as e:  # ImportError or LangDetectException
        log.debug("langdetect unavailable or failed: %s", e)

    return "en"


def resolve_language(requested: str, text: str) -> Lang:
    """Honour an explicit user choice; else auto-detect."""
    r = (requested or "").lower()
    if r in ("hi", "kn", "en"):
        return r  # type: ignore[return-value]
    return detect_language(text)
