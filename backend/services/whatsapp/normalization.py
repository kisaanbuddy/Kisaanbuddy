"""Central Message Normalization Layer for WhatsApp Business Cloud API.

Provides uniform, robust extraction and normalization for all incoming Meta message payloads:
- Ordinary text messages
- Interactive list selections (list_reply: id, title, description)
- Interactive button selections (button_reply: id, title)
- Template quick-reply buttons (button: payload, text)
- Image messages (id, mime_type, caption)
- Location messages (latitude, longitude, name, address)
- Document messages (id, filename, mime_type, caption)
- Audio / Voice notes
- Empty, unsupported, and malformed messages

Ensures menu selections and global commands resolve reliably regardless of:
- Whether the farmer taps an interactive list, taps a button, or types
- Leading numbers, dots, spaces, emojis, or punctuation
- Indic numerals (Devanagari १-७, Kannada ೧-೭)
- English, Hindi, and Kannada full titles and keywords
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class NormalizedMessage:
    raw_message: Dict[str, Any]
    message_id: str
    message_type: str  # text, interactive_list, interactive_button, template_button, image, location, document, audio, unsupported
    text: str          # unified textual representation
    selected_id: Optional[str] = None
    selected_title: Optional[str] = None
    selected_description: Optional[str] = None
    image_id: Optional[str] = None
    media_id: Optional[str] = None
    mime_type: Optional[str] = None
    caption: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    location_address: Optional[str] = None
    menu_selection: Optional[str] = None  # canonical: crop_doctor, guidance, weather, mandi, schemes, support, website
    global_command: Optional[str] = None  # menu, language, help, stop, start, greeting
    detected_language: Optional[str] = None  # en, hi, kn (if language selection)

    @property
    def menu_choice(self) -> Optional[str]:
        return self.menu_selection

    @property
    def image_mime_type(self) -> Optional[str]:
        return self.mime_type


NormalizedWhatsAppMessage = NormalizedMessage


# Mapping of canonical stable IDs
STABLE_ID_TO_ACTION = {
    "crop_doctor": "crop_doctor",
    "menu_crop_doctor": "crop_doctor",
    "1": "crop_doctor",
    "guidance": "guidance",
    "menu_guidance": "guidance",
    "agriculture_question": "guidance",
    "2": "guidance",
    "weather": "weather",
    "menu_weather": "weather",
    "3": "weather",
    "mandi": "mandi",
    "menu_mandi": "mandi",
    "4": "mandi",
    "schemes": "schemes",
    "menu_schemes": "schemes",
    "5": "schemes",
    "support": "support",
    "menu_support": "support",
    "human_support": "support",
    "6": "support",
    "website": "website",
    "menu_website": "website",
    "7": "website",
}

# Indic to ASCII numeral translation tables
INDIC_NUMERALS = {
    "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7",
    "೧": "1", "೨": "2", "೩": "3", "೪": "4", "೫": "5", "೬": "6", "೭": "7",
}

NUMBER_TO_ACTION = {
    "1": "crop_doctor",
    "2": "guidance",
    "3": "weather",
    "4": "mandi",
    "5": "schemes",
    "6": "support",
    "7": "website",
}

# Regex to detect leading option numbers: "4. Mandi Prices", "1) Crop Doctor", "4", "४. मंडी भाव"
LEADING_NUMBER_PATTERN = re.compile(r"^\s*[\(\[]?([1-7१-७೧-೭])[\)\]\.\:\-\s]*(.*)$", re.IGNORECASE)


def normalize_indic_numerals(text: str) -> str:
    """Replaces Devanagari and Kannada digits with ASCII 1-7."""
    res = []
    for ch in text:
        res.append(INDIC_NUMERALS.get(ch, ch))
    return "".join(res)


def resolve_menu_action(text_or_id: Optional[str]) -> Optional[str]:
    """Resolves an arbitrary input token, full row title, or interactive ID to a canonical menu action."""
    if not text_or_id:
        return None

    raw = text_or_id.strip()
    low = raw.lower()

    # 1. Direct stable ID lookup
    if low in STABLE_ID_TO_ACTION:
        return STABLE_ID_TO_ACTION[low]

    # 2. Check for leading digit: "4. Mandi Prices", "1) Crop Doctor", "4", "४. मंडी भाव", "೪. ಮಂಡಿ ಬೆಲೆಗಳು"
    match = LEADING_NUMBER_PATTERN.match(raw)
    if match:
        digit_char = match.group(1)
        ascii_digit = INDIC_NUMERALS.get(digit_char, digit_char)
        if ascii_digit in NUMBER_TO_ACTION:
            return NUMBER_TO_ACTION[ascii_digit]

    # 3. Check if input is a natural language sentence or question rather than a menu choice
    normalized_text = normalize_indic_numerals(low)
    words = normalized_text.split()
    if len(words) >= 4 or "?" in normalized_text:
        return None

    # Keyword matching across English, Hindi, and Kannada for concise menu commands
    # Crop doctor
    if any(k in normalized_text for k in [
        "crop doctor", "crop_doctor", "plant doctor",
        "क्रॉप डॉक्टर", "फसल डॉक्टर", "पौधे का डॉक्टर",
        "ಕ್ರಾಪ್ ಡಾಕ್ಟರ್", "ಬೆಳೆ ವೈದ್ಯ",
    ]):
        return "crop_doctor"

    # Agricultural guidance / Ask question
    if any(k in normalized_text for k in [
        "agri question", "guidance", "ask question", "farming question",
        "कृषि प्रश्न", "सवाल पूछें", "खेती की सलाह",
        "ಕೃಷಿ ಪ್ರಶ್ನೆ", "ಪ್ರಶ್ನೆ ಕೇಳಿ",
    ]):
        return "guidance"

    # Weather
    if any(k in normalized_text for k in [
        "weather updates", "weather forecast", "weather",
        "मौसम पूर्वानुमान", "मौसम की जानकारी", "मौसम",
        "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ", "ಹವಾಮಾನ ಮಾಹಿತಿ", "ಹವಾಮಾನ",
    ]):
        return "weather"

    # Mandi
    if any(k in normalized_text for k in [
        "mandi prices", "market prices", "apmc prices", "mandi rates", "mandi",
        "मंडी भाव", "बाजार भाव", "मंडी दर", "मंडी",
        "ಮಾರುಕಟ್ಟೆ ದರ", "ಮಂಡಿ ಬೆಲೆ", "ಮಂಡಿ ದರ", "ಮಂಡಿ",
    ]):
        return "mandi"

    # Govt schemes
    if any(k in normalized_text for k in [
        "govt schemes", "government schemes", "schemes", "pm-kisan",
        "सरकारी योजनाएं", "सरकारी योजना", "योजनाएं",
        "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", "ಸರ್ಕಾರಿ ಯೋಜನೆ", "ಯೋಜನೆಗಳು",
    ]):
        return "schemes"

    # Support / Human agent
    if any(k in normalized_text for k in [
        "talk to support", "human support", "contact support", "support agent", "support",
        "विशेषज्ञ सहायता", "सपोर्ट", "सहायता एजेंट",
        "ಬೆಂಬಲ ಪಡೆಯಿರಿ", "ತಜ್ಞರ ನೆರವು",
    ]):
        return "support"

    # Website
    if any(k in normalized_text for k in [
        "visit kisaanbuddy", "kisaanbuddy website", "website", "portal", "kisaanbuddy.com",
        "किसानबडी पोर्टल", "वेबसाइट",
        "ಕಿಸಾನ್‌ಬಡ್ಡಿ ವೆಬ್", "ವೆಬ್‌ಸೈಟ್",
    ]):
        return "website"

    return None


def resolve_global_command(text: Optional[str]) -> Optional[str]:
    """Identifies global commands: menu, language, help, stop, start, greeting."""
    if not text:
        return None

    norm = text.strip().lower()

    # Greetings
    if norm in {
        "hi", "hello", "hey", "namaste", "namaskar", "namaskara", "namaskaram", "namasteji", "vanakkam", "pranam", "start bot",
        "नमस्ते", "नमस्कार", "प्रणाम", "हलो", "ಹಲೋ", "ನಮಸ್ಕಾರ", "ನಮಸ್ತೆ",
    }:
        return "greeting"

    # Menu
    if norm in {"menu", "main menu", "home", "back", "मेनू", "मेन्यु", "ಮೆನು", "ಮುಖ್ಯ ಮೆನು"}:
        return "menu"

    # Language
    if norm in {
        "lang", "language", "change language", "select language",
        "भाषा", "भाषा बदलें", "ಭಾಷೆ", "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    }:
        return "language"

    # Help
    if norm in {"help", "guide", "commands", "options", "मदद", "सहायता", "ಸಹಾಯ"}:
        return "help"

    # Stop (Opt-out)
    if norm in {
        "stop", "unsubscribe", "opt out", "optout", "cancel", "quit",
        "बंद", "रोकें", "ನಿಲ್ಲಿಸಿ",
    }:
        return "stop"

    # Start (Opt-in)
    if norm in {
        "start", "subscribe", "opt in", "optin", "resume",
        "शुरू", "चालू करें", "ಪ್ರಾರಂಭಿಸಿ",
    }:
        return "start"

    return None


def resolve_language_selection(text: Optional[str]) -> Optional[str]:
    """Identifies language selection (1=English, 2=Hindi, 3=Kannada)."""
    if not text:
        return None
    norm = normalize_indic_numerals(text.strip().lower())
    if norm in {"1", "en", "english", "angrezi", "इंग्लिश", "lang_en"}:
        return "en"
    if norm in {"2", "hi", "hindi", "हिन्दी", "हिंदी", "lang_hi"}:
        return "hi"
    if norm in {"3", "kn", "kannada", "ಕನ್ನಡ", "lang_kn"}:
        return "kn"
    return None


def normalize_incoming_message(raw_msg: Dict[str, Any]) -> NormalizedMessage:
    """Transforms a raw Meta webhook message dict into a normalized representation."""
    msg_id = raw_msg.get("id", "")
    msg_type = raw_msg.get("type", "unknown")

    unified_text = ""
    selected_id: Optional[str] = None
    selected_title: Optional[str] = None
    selected_description: Optional[str] = None
    image_id: Optional[str] = None
    media_id: Optional[str] = None
    mime_type: Optional[str] = None
    caption: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    location_address: Optional[str] = None

    if msg_type == "text":
        unified_text = raw_msg.get("text", {}).get("body", "").strip()

    elif msg_type == "interactive":
        interactive = raw_msg.get("interactive", {})
        itype = interactive.get("type")
        if itype == "list_reply":
            msg_type = "interactive_list"
            reply = interactive.get("list_reply", {})
            selected_id = reply.get("id")
            selected_title = reply.get("title")
            selected_description = reply.get("description")
            unified_text = selected_title or selected_id or ""
        elif itype == "button_reply":
            msg_type = "interactive_button"
            reply = interactive.get("button_reply", {})
            selected_id = reply.get("id")
            selected_title = reply.get("title")
            unified_text = selected_title or selected_id or ""

    elif msg_type == "button":
        msg_type = "template_button"
        btn = raw_msg.get("button", {})
        selected_id = btn.get("payload")
        selected_title = btn.get("text")
        unified_text = selected_title or selected_id or ""

    elif msg_type == "image":
        img = raw_msg.get("image", {})
        image_id = img.get("id")
        media_id = image_id
        mime_type = img.get("mime_type", "image/jpeg")
        caption = img.get("caption")
        unified_text = caption or ""

    elif msg_type == "location":
        loc = raw_msg.get("location", {})
        latitude = loc.get("latitude")
        longitude = loc.get("longitude")
        location_name = loc.get("name")
        location_address = loc.get("address")
        unified_text = location_name or location_address or f"{latitude}, {longitude}"

    elif msg_type in ("document", "audio", "video", "voice"):
        media = raw_msg.get(msg_type, {})
        media_id = media.get("id")
        mime_type = media.get("mime_type")
        caption = media.get("caption")
        unified_text = caption or ""

    # Parse potential actions
    menu_action = resolve_menu_action(selected_id) or resolve_menu_action(selected_title) or resolve_menu_action(unified_text)
    global_cmd = resolve_global_command(selected_id) or resolve_global_command(selected_title) or resolve_global_command(unified_text)
    lang_choice = resolve_language_selection(selected_id) or resolve_language_selection(selected_title) or resolve_language_selection(unified_text)

    return NormalizedMessage(
        raw_message=raw_msg,
        message_id=msg_id,
        message_type=msg_type,
        text=unified_text,
        selected_id=selected_id,
        selected_title=selected_title,
        selected_description=selected_description,
        image_id=image_id,
        media_id=media_id,
        mime_type=mime_type,
        caption=caption,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        location_address=location_address,
        menu_selection=menu_action,
        global_command=global_cmd,
        detected_language=lang_choice,
    )
