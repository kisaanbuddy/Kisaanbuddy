"""Centralized Voice Operating System Orchestrator for KisaanBuddy.

Pipeline:
  Microphone -> STT (Google SR / Gemini Audio) -> Intent Recognition (Deterministic + Gemini)
  -> Context Manager -> Action Registry -> Safe Execution -> AI Response -> TTS (Edge Neural / Google TTS)
"""
from __future__ import annotations

import base64
import logging
import re
import struct
import uuid
from typing import Any, Dict, List, Optional, Tuple

from services.chat import tts_service
from services.chat.gemini_service import (
    interpret_voice_command_with_gemini,
    is_gemini_configured,
    redact_secrets,
)

log = logging.getLogger(__name__)

# Number words mapping across English, Hindi, Hinglish, and Kannada
NUMBER_WORDS = {
    # English
    "first": 1, "1st": 1, "one": 1, "second": 2, "2nd": 2, "two": 2,
    "third": 3, "3rd": 3, "three": 3, "fourth": 4, "4th": 4, "four": 4,
    "fifth": 5, "5th": 5, "five": 5,
    # Hinglish & Hindi Transliterated
    "pehla": 1, "ek": 1, "dusra": 2, "do": 2, "teesra": 3, "teen": 3,
    "chautha": 4, "char": 4, "panchwa": 5, "panch": 5,
    # Devanagari Hindi
    "पहला": 1, "दूसरा": 2, "तीसरा": 3, "चौथा": 4, "पांचवा": 5,
    # Kannada
    "ondaneya": 1, "modala": 1, "ಒಂದನೇ": 1, "ಮೊದಲ": 1,
    "eradaneya": 2, "ಎರಡನೇ": 2, "ಎರಡನೆಯ": 2,
    "mooruneya": 3, "ಮೂರನೇ": 3, "ಮೂರನೆಯ": 3,
    "naalkaneya": 4, "ನಾಲ್ಕನೇ": 4, "ನಾಲ್ಕನೆಯ": 4,
    "aidaneya": 5, "ಐದನೇ": 5, "ಐದನೆಯ": 5,
}

CONFIRM_WORDS = {
    "yes", "haan", "ha", "confirm", "kardo", "kar do", "theek hai", "thik hai",
    "sahi hai", "ho", "sari", "houthu", "proceed", "place", "order kardo", "bilkul",
    "हाँ", "कन्फर्म", "कर दो", "हೌದು", "ಖಚಿತಪಡಿಸಿ"
}

CANCEL_WORDS = {
    "no", "nahi", "na", "cancel", "roko", "mat karo", "beda", "bedi", "stop",
    "rehne do", "hatao", "chhod do", "नहीं", "रद्द", "ಬೇಡ", "ನಿಲ್ಲಿಸಿ"
}


def _create_minimal_wav_pcm() -> bytes:
    """Generate a valid, minimal PCM WAV audio container (for graceful quota fallback)."""
    num_samples = 4000
    sample_rate = 16000
    num_channels = 1
    bytes_per_sample = 2
    byte_rate = sample_rate * num_channels * bytes_per_sample
    block_align = num_channels * bytes_per_sample
    data_size = num_samples * bytes_per_sample
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", chunk_size, b"WAVE",
        b"fmt ", 16, 1, num_channels, sample_rate, byte_rate, block_align, 16,
        b"data", data_size
    )
    # Silence PCM samples
    pcm = b"\x00" * data_size
    return header + pcm


class VoiceOrchestrator:
    """Core Voice AI brain for full website voice control."""

    def __init__(self) -> None:
        pass

    def detect_language(self, text: str, fallback: str = "hi") -> str:
        """Heuristic language detection for Indic scripts, Kannada, and English."""
        t = (text or "").strip()
        if not t:
            return fallback

        # Kannada script Unicode range 0C80–0CFF
        if re.search(r"[\u0C80-\u0CFF]", t):
            return "kn"
        # Devanagari script Unicode range 0900–097F
        if re.search(r"[\u0900-\u097F]", t):
            return "hi"

        lower = t.lower()
        hinglish_words = ["karo", "kholo", "dikhao", "batao", "chahiye", "jao", "mera", "bhav", "patte", "gehun", "fasal"]
        if any(w in lower for w in hinglish_words):
            return "hi_en"

        kannada_latin = ["beku", "madi", "nodona", "thotisi", "bidi", "hogi", "elli", "raita"]
        if any(w in lower for w in kannada_latin):
            return "kn"

        return fallback if fallback in ("hi", "kn", "hi_en", "en") else "hi"

    async def interpret_command(
        self,
        transcript: str,
        page_context: Dict[str, Any],
        language: Optional[str] = None,
        session_id: Optional[str] = None,
        want_audio: bool = True,
    ) -> Dict[str, Any]:
        """Convert farmer voice utterance into a verified, permissioned website action."""
        clean_text = (transcript or "").strip()
        if not clean_text:
            return {
                "action": {"action_type": "NOOP", "payload": {}, "safety_level": "SAFE", "requires_confirmation": False},
                "reply_text": "Kripya bolen, main aapki sahayata ke liye taiyar hoon.",
                "language": language or "hi",
                "session_id": session_id or str(uuid.uuid4()),
                "pending_action": None,
            }

        detected_lang = self.detect_language(clean_text, fallback=language or "hi")
        active_lang = language or detected_lang

        current_route = page_context.get("current_route", "/")
        visible_items = page_context.get("visible_items", [])
        selected_item = page_context.get("selected_item")
        cart_items = page_context.get("cart_items", [])
        cart_total = page_context.get("cart_total", 0.0)
        pending_action = page_context.get("pending_action")

        lower = clean_text.lower()

        # -------------------------------------------------------------------
        # 1. Check for Pending Confirmation (High Safety Gates)
        # -------------------------------------------------------------------
        if pending_action:
            p_type = pending_action.get("type")
            is_confirm = any(re.search(r"\b" + re.escape(w) + r"\b", lower) for w in CONFIRM_WORDS) or any(w in clean_text for w in ["हाँ", "कन्फर्म", "हೌದು", "ಖಚಿತಪಡಿಸಿ"])
            is_cancel = any(re.search(r"\b" + re.escape(w) + r"\b", lower) for w in CANCEL_WORDS) or any(w in clean_text for w in ["नहीं", "रद्द", "ಬೇಡ"])

            if is_confirm:
                if p_type == "PLACE_ORDER":
                    reply = self._get_localized_string(
                        active_lang,
                        hi="आपका ऑर्डर सफलतापूर्वक दर्ज कर लिया गया है। विवरण ऑर्डर्स पेज पर उपलब्ध है।",
                        kn="ನಿಮ್ಮ ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ. ವಿವರಗಳು ಆರ್ಡರ್ಸ್ ಪುಟದಲ್ಲಿ ಲಭ್ಯವಿದೆ.",
                        en="Your order has been placed successfully. Details are on the orders page.",
                        hi_en="Aapka order confirm ho gaya hai. Details Orders page par dekh sakte hain."
                    )
                    action = {
                        "action_type": "CONFIRM_ACTION",
                        "payload": {"confirmed_action": "PLACE_ORDER", "order_data": pending_action.get("payload", {})},
                        "safety_level": "SAFE",
                        "requires_confirmation": False,
                    }
                    return await self._build_response(action, reply, active_lang, session_id, None, want_audio)

                if p_type == "CLEAR_CART":
                    reply = self._get_localized_string(
                        active_lang,
                        hi="आपकी कार्ट पूरी तरह खाली कर दी गई है।",
                        kn="ನಿಮ್ಮ ಕಾರ್ಟ್ ಸಂಪೂರ್ಣವಾಗಿ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.",
                        en="Your cart has been cleared.",
                        hi_en="Aapka cart clear kar diya gaya hai."
                    )
                    action = {
                        "action_type": "CLEAR_CART",
                        "payload": {},
                        "safety_level": "SAFE",
                        "requires_confirmation": False,
                    }
                    return await self._build_response(action, reply, active_lang, session_id, None, want_audio)

            if is_cancel:
                reply = self._get_localized_string(
                    active_lang,
                    hi="कार्य रद्द कर दिया गया है।",
                    kn="ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.",
                    en="Action has been cancelled.",
                    hi_en="Action cancel kar diya gaya hai."
                )
                action = {
                    "action_type": "CANCEL_ACTION",
                    "payload": {},
                    "safety_level": "SAFE",
                    "requires_confirmation": False,
                }
                return await self._build_response(action, reply, active_lang, session_id, None, want_audio)

        # -------------------------------------------------------------------
        # 2. Fast Rule-Based Intent Matching (Zero Latency Execution)
        # -------------------------------------------------------------------

        # A. Navigation: Back / Go Back
        if any(w in lower for w in ["go back", "wapas jao", "piche jao", "hindakke hogi", "back jao", "peeche"]) or "ಹಿಂದಕ್ಕೆ" in clean_text or "वापस" in clean_text:
            reply = self._get_localized_string(active_lang, hi="वापस जा रहे हैं।", kn="ಹಿಂದಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.", en="Going back.", hi_en="Wapas ja rahe hain.")
            return await self._build_response({"action_type": "GO_BACK", "payload": {}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # B. Navigation: Home
        if any(w in lower for w in ["go home", "go to home", "home page", "home par jao", "mukhya prishth", "maneyige hogi", "home jao"]) or "ಮುಖಪುಟ" in clean_text or "होम पेज" in clean_text:
            reply = self._get_localized_string(active_lang, hi="होम पेज खोल रहे हैं।", kn="ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.", en="Opening home page.", hi_en="Home page khol rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # C. Navigation: Marketplace
        if (
            any(w in lower for w in ["marketplace", "market place", "bazaar", "open marketplace", "go to marketplace", "bazar dikhao", "marukatte"])
            or any(w in clean_text for w in ["ಮಾರುಕಟ್ಟೆ", "ಮಾರ್ಕೆಟ್‌ಪ್ಲೇಸ್", "मार्केटप्लेस", "बाज़ार"])
        ) and not any(w in lower for w in ["mandi bhav", "mandi price", "rates"]):
            reply = self._get_localized_string(active_lang, hi="कृषि उपकरण मार्केटप्लेस खोल रहे हैं।", kn="ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening marketplace.", hi_en="Marketplace open kar rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/marketplace"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # D. Navigation: Crop Doctor / Disease
        if (
            any(w in lower for w in ["crop doctor", "disease", "fasal rog", "bimari", "doctor", "kisan doctor", "beley roga", "fashal rog"])
            or any(w in clean_text for w in ["ಕ್ರಾಪ್ ಡಾಕ್ಟರ್", "ಬೆಳೆ ರೋಗ", "ರೋಗ", "क्रॉप डॉक्टर", "फसल रोग", "बीमारी", "फसल की बीमारी"])
        ):
            reply = self._get_localized_string(active_lang, hi="क्रॉप डॉक्टर खोल रहे हैं। यहां आप फसल की पत्ती की जांच कर सकते हैं।", kn="ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ. ಬೆಳೆ ರೋಗ ತಪಾಸಣೆ ಮಾಡಬಹುದು.", en="Opening Crop Doctor for plant disease diagnosis.", hi_en="Crop Doctor open kar rahe hain. Yahan leaf scan kar sakte hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/disease"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # E. Navigation: Mandi Prices
        if (
            any(w in lower for w in ["mandi price", "mandi bhav", "bhav", "mandi dar", "bhav dikhao", "mandi dharagalu", "rates"])
            or any(w in clean_text for w in ["ಮಂಡಿ", "ಮಂಡಿ ದರ", "ದರ", "मंडी भाव", "मंडी दर", "भाव"])
        ):
            reply = self._get_localized_string(active_lang, hi="ताज़ा मंडी भाव खोल रहे हैं।", kn="ಲೈವ್ ಮಂಡಿ ದರಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Showing live mandi prices.", hi_en="Live mandi bhav khol rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/mandi"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # F. Navigation: Weather
        if (
            any(w in lower for w in ["weather", "mausam", "barish", "havamana", "rain forecast"])
            or any(w in clean_text for w in ["ಹವಾಮಾನ", "ಮಳೆ", "मौसम", "बारिश"])
        ):
            reply = self._get_localized_string(active_lang, hi="मौसम पूर्वानुमान खोल रहे हैं।", kn="ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening weather forecast.", hi_en="Mausam jaankari khol rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/weather"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # G. Navigation: Agricultural Labour / Workers
        if (
            any(w in lower for w in ["labour", "labor", "workers", "majdoor", "kamdar", "karmikaru", "krishi karmikaru", "worker connect"])
            or any(w in clean_text for w in ["ಕಾರ್ಮಿಕ", "ಮಜದೂರ್", "मजदूर", "श्रमिक", "कामदार"])
        ):
            reply = self._get_localized_string(active_lang, hi="कृषि मजदूर सेवा खोल रहे हैं।", kn="ಕೃಷಿ ಕಾರ್ಮಿಕರ ವಿಭಾಗ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening agricultural labour connect.", hi_en="Agri labour connect khol rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/worker-connect"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # H. Navigation: Government Schemes
        if (
            any(w in lower for w in ["schemes", "scheme", "yojana", "sarkari yojana", "pm kisan", "subsidy", "sarakaari yojanegalu"])
            or any(w in clean_text for w in ["ಯೋಜನೆ", "ಸರ್ಕಾರಿ ಯೋಜನೆ", "योजना", "सरकारी योजना", "सब्सिडी"])
        ):
            reply = self._get_localized_string(active_lang, hi="सरकारी कृषि योजनाएं खोल रहे हैं।", kn="ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening government agricultural schemes.", hi_en="Government schemes khol rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/schemes"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # I. Navigation: Dashboard
        if any(w in lower for w in ["dashboard", "my dashboard", "deshboard"]) or "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" in clean_text or "डैशबोर्ड" in clean_text:
            reply = self._get_localized_string(active_lang, hi="आपका डैशबोर्ड खोल रहे हैं।", kn="ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening your dashboard.", hi_en="Aapka dashboard open kar rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/dashboard"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # J. Navigation: Profile / Farm Profile
        if any(w in lower for w in ["profile", "my profile", "farm profile", "khet profile", "nanna profile"]) or "ಪ್ರೊಫೈಲ್" in clean_text or "प्रोफाइल" in clean_text:
            reply = self._get_localized_string(active_lang, hi="फार्म प्रोफाइल खोल रहे हैं।", kn="ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening farm profile.", hi_en="Farmer profile open kar rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/farmer-profile"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # K. Navigation: Orders / Cart
        if any(w in lower for w in ["orders", "my orders", "show orders", "view orders", "cart dikhao", "open cart", "nanna orders"]) or "ಆರ್ಡರ್ಸ್" in clean_text or "ऑर्डर्स" in clean_text:
            reply = self._get_localized_string(active_lang, hi="आपके ऑर्डर्स और कार्ट खोल रहे हैं।", kn="ನಿಮ್ಮ ಆರ್ಡರ್ಸ್ ಮತ್ತು ಕಾರ್ಟ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening your orders and cart.", hi_en="Aapke orders aur cart khol rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/orders"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # L. Navigation: Settings
        if any(w in lower for w in ["settings", "setting"]) or "ಸೆಟ್ಟಿಂಗ್ಸ್" in clean_text or "सेटिंग्स" in clean_text:
            reply = self._get_localized_string(active_lang, hi="सेटिंग्स खोल रहे हैं।", kn="ಸೆಟ್ಟಿಂಗ್ಸ್ ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening settings.", hi_en="Settings khol rahe hain.")
            return await self._build_response({"action_type": "NAVIGATE", "payload": {"path": "/settings"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # M. Theme: Dark Mode / Light Mode
        if any(w in lower for w in ["dark mode", "night mode", "dark theme"]) or "ಡಾರ್ಕ್ ಮೋಡ್" in clean_text or "डार्क मोड" in clean_text:
            reply = self._get_localized_string(active_lang, hi="डार्क मोड चालू कर दिया गया है।", kn="ಡಾರ್ಕ್ ಮೋಡ್ ಆನ್ ಮಾಡಲಾಗಿದೆ.", en="Dark mode activated.", hi_en="Dark mode on kar diya gaya hai.")
            return await self._build_response({"action_type": "TOGGLE_THEME", "payload": {"theme": "dark"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        if any(w in lower for w in ["light mode", "day mode", "light theme", "white mode"]) or "ಲೈಟ್ ಮೋಡ್" in clean_text or "लाइट मोड" in clean_text:
            reply = self._get_localized_string(active_lang, hi="लाइट मोड चालू कर दिया गया है।", kn="ಲೈಟ್ ಮೋಡ್ ಆನ್ ಮಾಡಲಾಗಿದೆ.", en="Light mode activated.", hi_en="Light mode on kar diya gaya hai.")
            return await self._build_response({"action_type": "TOGGLE_THEME", "payload": {"theme": "light"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # N. Language Switching
        if any(w in lower for w in ["kannada", "kannad", "ಕನ್ನಡ"]):
            reply = "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"
            return await self._build_response({"action_type": "CHANGE_LANGUAGE", "payload": {"language": "kn"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, "kn", session_id, None, want_audio)

        if any(w in lower for w in ["hindi mein", "hindi karo", "hindi bhasha", "हिन्दी"]):
            reply = "भाषा बदलकर हिन्दी कर दी गई है। बोलिए, मैं क्या मदद करूँ?"
            return await self._build_response({"action_type": "CHANGE_LANGUAGE", "payload": {"language": "hi"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, "hi", session_id, None, want_audio)

        if any(w in lower for w in ["english mein", "change to english", "switch to english", "english language"]) or "english" in lower:
            reply = "Switched language to English. How can I assist you with your farming today?"
            return await self._build_response({"action_type": "CHANGE_LANGUAGE", "payload": {"language": "en"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, "en", session_id, None, want_audio)

        if any(w in lower for w in ["hinglish"]):
            reply = "Language Hinglish mein set ho gayi hai. Batayein kheti mein kya madad chahiye?"
            return await self._build_response({"action_type": "CHANGE_LANGUAGE", "payload": {"language": "hi_en"}, "safety_level": "SAFE", "requires_confirmation": False}, reply, "hi_en", session_id, None, want_audio)

        # O. Notifications
        if any(w in lower for w in ["notifications", "notification", "suchna", "alerts", "suchnayein"]) or "ಸೂಚನೆಗಳು" in clean_text or "सूचनाएं" in clean_text:
            reply = self._get_localized_string(active_lang, hi="नोटिफ़िकेशन और अलर्ट्स खोल रहे हैं।", kn="ಸೂಚನೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ.", en="Opening notifications and alerts.", hi_en="Notifications panel open kar rahe hain.")
            return await self._build_response({"action_type": "OPEN_NOTIFICATIONS", "payload": {}, "safety_level": "SAFE", "requires_confirmation": False}, reply, active_lang, session_id, None, want_audio)

        # P. Search: "search for urea fertilizer", "search wheat in karnal", etc.
        search_match = re.search(r"(?:search for|search|khojo|dhoondho|huduku)\s+(.+)", lower)
        if search_match:
            raw_q = search_match.group(1).strip()
            clean_q = re.sub(r"[^\w\s]", "", raw_q).strip()
            reply = self._get_localized_string(
                active_lang,
                hi=f"'{clean_q}' के लिए खोज रहे हैं।",
                kn=f"'{clean_q}' ಗಾಗಿ ಹುಡುಕುತ್ತಿದ್ದೇವೆ.",
                en=f"Searching for '{clean_q}'.",
                hi_en=f"'{clean_q}' search kar rahe hain."
            )
            target = "marketplace" if "mandi" not in lower else "mandi"
            return await self._build_response(
                {"action_type": "SEARCH", "payload": {"query": clean_q, "target": target}, "safety_level": "SAFE", "requires_confirmation": False},
                reply, active_lang, session_id, None, want_audio
            )

        # Q. Context-Aware: Price Filter ("filter products below 500", "saste product dikhao", "show cheaper products")
        if any(w in lower for w in ["cheaper", "saste", "kam keemat", "kadime bele"]) or any(w in clean_text for w in ["ಕಡಿಮೆ ಬೆಲೆ", "ಸಸ್ತೆ", "कम कीमत", "सस्ते"]):
            max_p = 500.0
            if visible_items:
                prices = [float(it.get("price", 0)) for it in visible_items if it.get("price")]
                if prices:
                    avg_p = sum(prices) / len(prices)
                    max_p = max(500.0, round(avg_p * 0.7, -2))

            reply = self._get_localized_string(
                active_lang,
                hi=f"₹{int(max_p)} से कम कीमत के उत्पाद दिखाए जा रहे हैं।",
                kn=f"₹{int(max_p)} ಕ್ಕಿಂತ ಕಡಿಮೆ ಬೆಲೆಯ ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇವೆ.",
                en=f"Filtering products below ₹{int(max_p)}.",
                hi_en=f"₹{int(max_p)} se saste products filter kar diye hain."
            )
            return await self._build_response(
                {"action_type": "FILTER_PRICE", "payload": {"maxPrice": max_p}, "safety_level": "SAFE", "requires_confirmation": False},
                reply, active_lang, session_id, None, want_audio
            )

        price_match = re.search(r"(?:below|under|se kam|kamti|kam|ಕ್ಕಿಂತ ಕಡಿಮೆ)\s*(?:₹|rs|rupees)?\s*(\d+)", lower)
        if price_match:
            val = float(price_match.group(1))
            reply = self._get_localized_string(
                active_lang,
                hi=f"₹{int(val)} से कम कीमत के उत्पाद फ़िल्टर किए गए।",
                kn=f"₹{int(val)} ಕ್ಕಿಂತ ಕಡಿಮೆ ಬೆಲೆಯ ಉತ್ಪನ್ನಗಳನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಲಾಗಿದೆ.",
                en=f"Filtered products priced below ₹{int(val)}.",
                hi_en=f"₹{int(val)} se kam wale products filter ho gaye hain."
            )
            return await self._build_response(
                {"action_type": "FILTER_PRICE", "payload": {"maxPrice": val}, "safety_level": "SAFE", "requires_confirmation": False},
                reply, active_lang, session_id, None, want_audio
            )

        # R. Sort Products by Price ("sort products by price", "keemat ke hisab se lagao")
        if any(w in lower for w in ["sort by price", "sort products by price", "keemat se lagao", "price sort", "beleya mele sort"]):
            sort_order = "price_asc" if not any(w in lower for w in ["high to low", "jyada", "mehenga"]) else "price_desc"
            reply = self._get_localized_string(
                active_lang,
                hi="उत्पादों को कीमत के अनुसार क्रमबद्ध कर दिया गया है।",
                kn="ಉತ್ಪನ್ನಗಳನ್ನು ಬೆಲೆಯ ಆಧಾರದ ಮೇಲೆ ಜೋಡಿಸಲಾಗಿದೆ.",
                en="Products sorted by price.",
                hi_en="Products price ke hisaab se sort ho gaye hain."
            )
            return await self._build_response(
                {"action_type": "SORT_PRODUCTS", "payload": {"sortBy": sort_order}, "safety_level": "SAFE", "requires_confirmation": False},
                reply, active_lang, session_id, None, want_audio
            )

        # S. Context-Aware: Add To Cart ("add this product to cart", "cart mein jodo", "kartige serisi")
        if (
            re.search(r"\badd\b.*\bcart\b", lower)
            or re.search(r"\bcart\b.*(?:add|jodo|daalo|serisi)", lower)
            or any(w in clean_text for w in ["ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ", "ಕಾರ್ಟಿಗೆ ಸೇರಿಸಿ", "कार्ट में जोड़ो", "कार्ट में डालो"])
        ):
            target_prod = selected_item
            if not target_prod and visible_items:
                target_prod = visible_items[0]

            if target_prod:
                prod_name = target_prod.get("name", "Product")
                reply = self._get_localized_string(
                    active_lang,
                    hi=f"'{prod_name}' को आपकी कार्ट में जोड़ दिया गया है।",
                    kn=f"'{prod_name}' ಅನ್ನು ನಿಮ್ಮ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ.",
                    en=f"Added '{prod_name}' to your cart.",
                    hi_en=f"'{prod_name}' aapke cart mein add ho gaya hai."
                )
                action = {
                    "action_type": "ADD_TO_CART",
                    "payload": target_prod,
                    "safety_level": "SAFE",
                    "requires_confirmation": False,
                }
                return await self._build_response(action, reply, active_lang, session_id, None, want_audio)
            else:
                reply = self._get_localized_string(
                    active_lang,
                    hi="कार्ट में जोड़ने के लिए कृपया पहले कोई उत्पाद चुनें या मार्केटप्लेस खोलें।",
                    kn="ದಯವಿಟ್ಟು ಮೊದಲು ಉತ್ಪನ್ನವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
                    en="Please select a product first or open the marketplace to add to cart.",
                    hi_en="Pehle koi product select karein taaki cart mein add kiya ja sake."
                )
                return await self._build_response(
                    {"action_type": "NAVIGATE", "payload": {"path": "/marketplace"}, "safety_level": "SAFE", "requires_confirmation": False},
                    reply, active_lang, session_id, None, want_audio
                )

        # T. Context-Aware: Item Selection by Index ("open the second product", "dusra product kholo")
        for word, idx in NUMBER_WORDS.items():
            matched = False
            if word in clean_text:
                matched = True
            elif re.search(r"\b" + re.escape(word) + r"\b", lower):
                matched = True

            if matched and any(p in lower or p in clean_text for p in ["product", "item", "option", "machinery", "tractor", "utpann", "ಉತ್ಪನ್ನ", "उत्पाद"]):
                target_item = None
                if visible_items and len(visible_items) >= idx:
                    target_item = visible_items[idx - 1]

                item_name = target_item.get("name") if target_item else f"{idx}rd item"
                reply = self._get_localized_string(
                    active_lang,
                    hi=f"नंबर {idx} का उत्पाद '{item_name}' खोल रहे हैं।",
                    kn=f"ಸಂಖ್ಯೆ {idx} ರ ಉತ್ಪನ್ನ '{item_name}' ತೆರೆಯುತ್ತಿದ್ದೇವೆ.",
                    en=f"Opening product #{idx}: '{item_name}'.",
                    hi_en=f"Item number {idx} '{item_name}' open kar rahe hain."
                )
                action = {
                    "action_type": "SELECT_ITEM",
                    "payload": {
                        "index": idx,
                        "item": target_item,
                        "id": target_item.get("id") if target_item else None
                    },
                    "safety_level": "SAFE",
                    "requires_confirmation": False,
                }
                return await self._build_response(action, reply, active_lang, session_id, None, want_audio)

        # U. Remove from cart ("remove this item", "cart se hatao")
        if any(w in lower for w in ["remove this item", "remove item", "cart se hatao", "hata do", "hatao", "teravugolisi"]):
            reply = self._get_localized_string(
                active_lang,
                hi="आइटम को कार्ट से हटा दिया गया है।",
                kn="ಐಟಂ ಅನ್ನು ಕಾರ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.",
                en="Item removed from cart.",
                hi_en="Item cart se remove kar diya gaya hai."
            )
            action = {
                "action_type": "REMOVE_FROM_CART",
                "payload": {"item": cart_items[0] if cart_items else None},
                "safety_level": "SAFE",
                "requires_confirmation": False,
            }
            return await self._build_response(action, reply, active_lang, session_id, None, want_audio)

        # V. High Safety Action: Place Order ("place order", "order kar do", "order kardo")
        if any(w in lower for w in ["place order", "place my order", "order kar do", "order kardo", "order madi", "buy now"]):
            if not cart_items:
                reply = self._get_localized_string(
                    active_lang,
                    hi="आपकी कार्ट अभी खाली है। कृपया पहले मार्केटप्लेस से कोई उत्पाद चुनें।",
                    kn="ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮೊದಲು ಉತ್ಪನ್ನವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
                    en="Your cart is empty. Please select a product from the marketplace first.",
                    hi_en="Aapka cart khali hai. Pehle marketplace se koi item cart mein add karein."
                )
                return await self._build_response(
                    {"action_type": "NAVIGATE", "payload": {"path": "/marketplace"}, "safety_level": "SAFE", "requires_confirmation": False},
                    reply, active_lang, session_id, None, want_audio
                )

            item_count = len(cart_items)
            total_amt = cart_total or sum(float(i.get("price", 0)) * int(i.get("quantity", 1)) for i in cart_items)
            reply = self._get_localized_string(
                active_lang,
                hi=f"आपकी कार्ट में {item_count} उत्पाद हैं जिनका कुल मूल्य ₹{int(total_amt)} है। क्या आप ऑर्डर कन्फर्म करना चाहते हैं? कृपया 'हाँ' या 'नहीं' बोलें।",
                kn=f"ನಿಮ್ಮ ಕಾರ್ಟ್‌ನಲ್ಲಿ {item_count} ಉತ್ಪನ್ನಗಳಿವೆ, ಒಟ್ಟು ₹{int(total_amt)}. ನೀವು ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಲು ಬಯಸುವಿರಾ? ದಯವಿಟ್ಟು 'ಹೌದು' ಅಥವಾ 'ಬೇಡ' ಎಂದು ಹೇಳಿ.",
                en=f"You have {item_count} items in your cart totaling ₹{int(total_amt)}. Are you sure you want to place this order? Please say 'Confirm' or 'Cancel'.",
                hi_en=f"Aapke cart mein {item_count} items hain total ₹{int(total_amt)}. Kya aap order confirm karna chahte hain? Kripya 'Haan' ya 'Nahi' bolein."
            )
            p_action = {
                "type": "PLACE_ORDER",
                "payload": {"items": cart_items, "total": total_amt},
                "items_count": item_count,
                "total_amount": total_amt,
            }
            action = {
                "action_type": "AWAIT_CONFIRMATION",
                "payload": p_action,
                "safety_level": "REQUIRES_CONFIRMATION",
                "requires_confirmation": True,
            }
            return await self._build_response(action, reply, active_lang, session_id, p_action, want_audio)

        # -------------------------------------------------------------------
        # 3. LLM Conversational Intent Recognition (Google Gemini)
        # -------------------------------------------------------------------
        try:
            return await self._query_gemini_llm(clean_text, page_context, active_lang, session_id, want_audio)
        except Exception as e:
            log.warning("Gemini voice intent fallback error: %s", redact_secrets(str(e)))
            reply = self._get_localized_string(
                active_lang,
                hi="मैंने आपकी बात सुनी। आप वेबसाइट के किसी भी हिस्से जैसे मार्केटप्लेस, मंडी भाव या मौसम पर जाने के लिए बोल सकते हैं।",
                kn="ನಾನು ನಿಮ್ಮ ಮಾತನ್ನು ಕೇಳಿದೆ. ಮಾರುಕಟ್ಟೆ, ಮಂಡಿ ದರ ಅಥವಾ ಹವಾಮಾನ ನೋಡಲು ನೀವು ಆಜ್ಞೆ ನೀಡಬಹುದು.",
                en="I heard your command. You can speak to navigate to marketplace, mandi prices, or weather.",
                hi_en="Maine aapki baat suni. Aap marketplace, mandi bhav ya weather ke liye bol sakte hain."
            )
            return await self._build_response(
                {"action_type": "NOOP", "payload": {}, "safety_level": "SAFE", "requires_confirmation": False},
                reply, active_lang, session_id, None, want_audio
            )

    async def _query_gemini_llm(
        self,
        transcript: str,
        page_context: Dict[str, Any],
        language: str,
        session_id: Optional[str],
        want_audio: bool,
    ) -> Dict[str, Any]:
        """Use Google Gemini to interpret complex conversational queries into structured website actions."""
        if not is_gemini_configured():
            raise ValueError("GEMINI_API_KEY unconfigured")

        data = await interpret_voice_command_with_gemini(
            transcript=transcript,
            page_context=page_context,
            language=language,
        )

        act_type = data.get("action_type", "NOOP")
        payload = data.get("payload", {})
        reply_text = data.get("reply_text") or "Aapke anurodh par karyawahi ki gayi."

        action = {
            "action_type": act_type,
            "payload": payload,
            "safety_level": "SAFE",
            "requires_confirmation": False,
        }
        return await self._build_response(action, reply_text, language, session_id, None, want_audio)

    async def _build_response(
        self,
        action: Dict[str, Any],
        reply_text: str,
        language: str,
        session_id: Optional[str],
        pending_action: Optional[Dict[str, Any]],
        want_audio: bool,
    ) -> Dict[str, Any]:
        """Synthesize Indian neural TTS audio and bundle response."""
        audio_b64 = None
        audio_mime = None

        if want_audio and reply_text:
            try:
                short_lang = (language or "hi").split("-")[0].lower()
                if language == "hi_en":
                    short_lang = "hi_en"
                tts_out = await tts_service.synthesize(text=reply_text, language=short_lang)
                if hasattr(tts_out, "audio") and getattr(tts_out, "audio", None):
                    audio_b64 = base64.b64encode(tts_out.audio).decode("ascii")
                    audio_mime = getattr(tts_out, "mime", "audio/mpeg")
            except Exception as e:
                log.warning("Voice TTS synthesis skipped/fallback: %s", e)
                fallback_wav = _create_minimal_wav_pcm()
                audio_b64 = base64.b64encode(fallback_wav).decode("ascii")
                audio_mime = "audio/wav"

        return {
            "action": action,
            "reply_text": reply_text,
            "reply_audio_base64": audio_b64,
            "reply_audio_mime": audio_mime,
            "language": language,
            "session_id": session_id or str(uuid.uuid4()),
            "pending_action": pending_action,
        }

    def _get_localized_string(self, lang: str, hi: str, kn: str, en: str, hi_en: str) -> str:
        if lang == "kn":
            return kn
        if lang == "en":
            return en
        if lang == "hi_en":
            return hi_en
        return hi


voice_orchestrator = VoiceOrchestrator()
