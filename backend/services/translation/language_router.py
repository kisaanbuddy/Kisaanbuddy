"""Language Router for KisaanBuddy Translation Services.

Maps between:
- Short codes used by KisaanBuddy frontend ('en', 'hi', 'kn', 'ta', 'te', 'mr', 'gu', 'bn', 'pa', 'ml', 'hi_en')
- Official FLORES-200 / IndicTrans2 language codes ('eng_Latn', 'hin_Deva', 'kan_Knda', etc.)

Routes translation tasks to the appropriate IndicTrans2 direction:
- EN_INDIC (English to Indic)
- INDIC_EN (Indic to English)
- INDIC_INDIC (Indic to Indic)
"""
from __future__ import annotations

from enum import Enum
from typing import Dict, Optional, Tuple


class TranslationDirection(str, Enum):
    EN_INDIC = "en-indic"
    INDIC_EN = "indic-en"
    INDIC_INDIC = "indic-indic"
    IDENTITY = "identity"


# Official FLORES-200 codes recognized by AI4Bharat IndicTrans2
INDICTRANS2_LANGUAGES: Dict[str, str] = {
    "eng_Latn": "English",
    "hin_Deva": "Hindi",
    "kan_Knda": "Kannada",
    "tam_Taml": "Tamil",
    "tel_Telu": "Telugu",
    "mar_Deva": "Marathi",
    "ben_Beng": "Bengali",
    "guj_Gujr": "Gujarati",
    "mal_Mlym": "Malayalam",
    "pan_Guru": "Punjabi",
    "ory_Orya": "Odia",
    "asm_Beng": "Assamese",
    "mai_Deva": "Maithili",
    "san_Deva": "Sanskrit",
    "sat_Olck": "Santali",
    "snd_Arab": "Sindhi (Arabic)",
    "snd_Deva": "Sindhi (Devanagari)",
    "urd_Arab": "Urdu",
    "dgo_Deva": "Dogri",
    "gom_Deva": "Konkani",
    "kas_Arab": "Kashmiri (Arabic)",
    "kas_Deva": "Kashmiri (Devanagari)",
    "brx_Deva": "Bodo",
    "mni_Beng": "Manipuri (Bengali)",
    "mni_Mtei": "Manipuri (Meitei)",
    "npi_Deva": "Nepali",
}

# Mapping short codes & common variants to IndicTrans2 FLORES-200 codes
SHORT_TO_INDICTRANS2: Dict[str, str] = {
    "en": "eng_Latn",
    "eng": "eng_Latn",
    "en-in": "eng_Latn",
    "en-us": "eng_Latn",
    "en-gb": "eng_Latn",
    "hi": "hin_Deva",
    "hin": "hin_Deva",
    "hindi": "hin_Deva",
    "hi-in": "hin_Deva",
    "hi_en": "hin_Deva",  # Hinglish normalizes to Hindi target
    "kn": "kan_Knda",
    "kan": "kan_Knda",
    "kannada": "kan_Knda",
    "kn-in": "kan_Knda",
    "ta": "tam_Taml",
    "tam": "tam_Taml",
    "tamil": "tam_Taml",
    "ta-in": "tam_Taml",
    "te": "tel_Telu",
    "tel": "tel_Telu",
    "telugu": "tel_Telu",
    "te-in": "tel_Telu",
    "mr": "mar_Deva",
    "mar": "mar_Deva",
    "marathi": "mar_Deva",
    "mr-in": "mar_Deva",
    "gu": "guj_Gujr",
    "guj": "guj_Gujr",
    "gujarati": "guj_Gujr",
    "gu-in": "guj_Gujr",
    "bn": "ben_Beng",
    "ben": "ben_Beng",
    "bengali": "ben_Beng",
    "bn-in": "ben_Beng",
    "pa": "pan_Guru",
    "pan": "pan_Guru",
    "punjabi": "pan_Guru",
    "pa-in": "pan_Guru",
    "ml": "mal_Mlym",
    "mal": "mal_Mlym",
    "malayalam": "mal_Mlym",
    "ml-in": "mal_Mlym",
    "or": "ory_Orya",
    "od": "ory_Orya",
    "ory": "ory_Orya",
    "odia": "ory_Orya",
    "as": "asm_Beng",
    "asm": "asm_Beng",
    "assamese": "asm_Beng",
    "mai": "mai_Deva",
    "maithili": "mai_Deva",
    "sa": "san_Deva",
    "san": "san_Deva",
    "sanskrit": "san_Deva",
    "ur": "urd_Arab",
    "urd": "urd_Arab",
    "urdu": "urd_Arab",
    "ne": "npi_Deva",
    "npi": "npi_Deva",
    "nepali": "npi_Deva",
    "kok": "gom_Deva",
    "konkani": "gom_Deva",
}

# Mapping IndicTrans2 FLORES codes to 2-letter ISO/frontend codes
INDICTRANS2_TO_SHORT: Dict[str, str] = {
    "eng_Latn": "en",
    "hin_Deva": "hi",
    "kan_Knda": "kn",
    "tam_Taml": "ta",
    "tel_Telu": "te",
    "mar_Deva": "mr",
    "ben_Beng": "bn",
    "guj_Gujr": "gu",
    "mal_Mlym": "ml",
    "pan_Guru": "pa",
    "ory_Orya": "od",
    "asm_Beng": "as",
    "mai_Deva": "mai",
    "san_Deva": "sa",
    "urd_Arab": "ur",
    "npi_Deva": "ne",
}

# Official IndicTrans2 model checkpoints
INDICTRANS2_MODELS = {
    TranslationDirection.EN_INDIC: "ai4bharat/indictrans2-en-indic-dist-200M",
    TranslationDirection.INDIC_EN: "ai4bharat/indictrans2-indic-en-dist-200M",
    TranslationDirection.INDIC_INDIC: "ai4bharat/indictrans2-indic-indic-dist-320M",
}

INDICTRANS2_1B_MODELS = {
    TranslationDirection.EN_INDIC: "ai4bharat/indictrans2-en-indic-1B",
    TranslationDirection.INDIC_EN: "ai4bharat/indictrans2-indic-en-1B",
    TranslationDirection.INDIC_INDIC: "ai4bharat/indictrans2-indic-indic-1B",
}


class LanguageRouter:
    """Intelligent language code normalization and direction resolver."""

    @staticmethod
    def normalize_to_indictrans(code: Optional[str], default: str = "eng_Latn") -> str:
        """Converts any supported representation (short, BCP-47, ISO) to IndicTrans2 FLORES-200 code."""
        if not code:
            return default
        raw = code.strip()
        if raw in INDICTRANS2_LANGUAGES:
            return raw

        clean = raw.lower().replace("_", "-")
        if clean in SHORT_TO_INDICTRANS2:
            return SHORT_TO_INDICTRANS2[clean]

        parts = clean.split("-")
        if parts[0] in SHORT_TO_INDICTRANS2:
            return SHORT_TO_INDICTRANS2[parts[0]]

        return default

    @staticmethod
    def to_short_code(indictrans_code: str) -> str:
        """Converts an IndicTrans2 FLORES-200 code to frontend 2-letter code."""
        return INDICTRANS2_TO_SHORT.get(indictrans_code, "en")

    @classmethod
    def resolve_direction(cls, source_code: str, target_code: str) -> Tuple[TranslationDirection, str, str]:
        """Resolves translation direction and normalized language pair."""
        src = cls.normalize_to_indictrans(source_code, default="eng_Latn")
        tgt = cls.normalize_to_indictrans(target_code, default="hin_Deva")

        if src == tgt:
            return TranslationDirection.IDENTITY, src, tgt

        if src == "eng_Latn" and tgt != "eng_Latn":
            return TranslationDirection.EN_INDIC, src, tgt
        elif src != "eng_Latn" and tgt == "eng_Latn":
            return TranslationDirection.INDIC_EN, src, tgt
        else:
            return TranslationDirection.INDIC_INDIC, src, tgt

    @classmethod
    def get_model_for_direction(cls, direction: TranslationDirection, use_1b: bool = False) -> str:
        models = INDICTRANS2_1B_MODELS if use_1b else INDICTRANS2_MODELS
        return models.get(direction, INDICTRANS2_MODELS[TranslationDirection.EN_INDIC])
