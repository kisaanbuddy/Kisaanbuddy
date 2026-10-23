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
import re
from typing import Literal

log = logging.getLogger(__name__)

Lang = Literal["en", "hi", "kn", "bn", "mr", "te", "ta", "gu", "pa", "bho", "mai"]

# Unicode block ranges (inclusive).
_DEVANAGARI = (0x0900, 0x097F)   # Hindi, Marathi, Sanskrit
_KANNADA = (0x0C80, 0x0CFF)
_BENGALI = (0x0980, 0x09FF)
_GUJARATI = (0x0A80, 0x0AFF)
_GURMUKHI = (0x0A00, 0x0A7F)
_TAMIL = (0x0B80, 0x0BFF)
_TELUGU = (0x0C00, 0x0C7F)

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
    counts = {"hi": 0, "kn": 0, "bn": 0, "gu": 0, "pa": 0, "ta": 0, "te": 0}
    total_letters = 0
    for ch in s:
        cp = ord(ch)
        if ch.isalpha():
            total_letters += 1
        if _DEVANAGARI[0] <= cp <= _DEVANAGARI[1]: counts["hi"] += 1
        elif _KANNADA[0] <= cp <= _KANNADA[1]: counts["kn"] += 1
        elif _BENGALI[0] <= cp <= _BENGALI[1]: counts["bn"] += 1
        elif _GUJARATI[0] <= cp <= _GUJARATI[1]: counts["gu"] += 1
        elif _GURMUKHI[0] <= cp <= _GURMUKHI[1]: counts["pa"] += 1
        elif _TAMIL[0] <= cp <= _TAMIL[1]: counts["ta"] += 1
        elif _TELUGU[0] <= cp <= _TELUGU[1]: counts["te"] += 1

    if total_letters > 0:
        winner, count = max(counts.items(), key=lambda item: item[1])
        if count / total_letters > 0.25:
            return winner  # type: ignore[return-value]

    # Latin script — keyword bias first (catches "barish hogi kya?").
    lowered = s.lower()
    words = {w.strip(".,!?;:()[]\"'") for w in lowered.split()}
    if words & _KANNADA_LATIN_HINTS:
        return "kn"
    if words & _HINDI_LATIN_HINTS:
        # Preserve Roman Hindi as Hinglish.  The chat prompt then answers in
        # the same natural script, and Bulbul can use its code-mixed voice.
        return "hi_en"

    # Fall back to langdetect if available.
    try:
        from langdetect import detect, DetectorFactory  # type: ignore

        DetectorFactory.seed = 0
        code = detect(s)
        if code in ("hi", "mr", "bn", "kn", "te", "ta", "gu", "pa"):
            return code  # type: ignore[return-value]
    except Exception as e:  # ImportError or LangDetectException
        log.debug("langdetect unavailable or failed: %s", e)

    return "en"


def resolve_language(requested: str, text: str) -> Lang:
    """Honour an explicit user choice; else auto-detect."""
    r = (requested or "").lower()
    if r in ("hi", "kn", "en", "bn", "mr", "te", "ta", "gu", "pa", "bho", "mai"):
        return r  # type: ignore[return-value]
    # Spoken/text language-change commands are part of the conversation, not
    # merely UI state.  Match them before script detection so e.g. "Hindi mein
    # baat karo" reliably changes the following response to Hindi.
    lowered = (text or "").casefold()
    if re.search(r"\b(speak|talk|reply|answer)\s+(in\s+)?english\b|\benglish\s+(mein|me)\s+(baat|bolo|boliye)", lowered):
        return "en"
    if re.search(r"\b(hindi|hindī)\s+(mein|me)\s+(baat|bolo|boliye|jawab)|\bhindi\s+(mein|me)\s+baat", lowered):
        return "hi"
    if "ಕನ್ನಡದಲ್ಲಿ" in (text or "") or "ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ" in (text or ""):
        return "kn"
    return detect_language(text)
