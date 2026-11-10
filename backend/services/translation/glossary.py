"""Agricultural Glossary & Terminology Protection Engine for KisaanBuddy.

Protects and standardizes:
1. Brand names: 'KisaanBuddy', 'Kisaan Buddy'
2. Manufacturer names: 'Mahindra', 'John Deere', 'Swaraj', 'Sonalika', 'Tafe', 'Escorts',
   'Kubota', 'New Holland', 'Eicher', 'Massey Ferguson', 'Captain', 'Solis', 'VST', 'Preet',
   'Farmtrac', 'Powertrac', 'Indo Farm'
3. Tractor model lines: 'Mahindra 575 DI', 'Swaraj 744 FE', 'Powertrac 439', 'John Deere 5050 D', etc.
4. Scientific crop & pathogen names: 'Triticum aestivum', 'Oryza sativa', 'Zea mays',
   'Puccinia graminis', 'Magnaporthe oryzae', 'Xanthomonas oryzae', etc.
5. Official government scheme & market identifiers: 'MSP', 'APMC', 'e-NAM', 'PM-KISAN', 'PMFBY',
   'KCC', 'IFFCO', 'NABARD', 'ICAR', 'FPO', 'SHG', 'PDS', 'DBT'
6. Preserves technical tokens: URLs, email addresses, alphanumeric IDs, currency, and numerical metrics
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Dict, List, Optional, Pattern, Set, Tuple

log = logging.getLogger(__name__)

# Absolute Protected Entities (Never translated or transliterated)
PROTECTED_BRANDS: List[str] = [
    "KisaanBuddy",
    "Kisaan Buddy",
    "KrishiAI",
]

PROTECTED_MANUFACTURERS: List[str] = [
    "Mahindra",
    "John Deere",
    "Swaraj",
    "Sonalika",
    "Tafe",
    "Escorts",
    "Kubota",
    "New Holland",
    "Eicher",
    "Massey Ferguson",
    "Captain",
    "Solis",
    "VST",
    "Preet",
    "Farmtrac",
    "Powertrac",
    "Indo Farm",
    "Standard",
    "Gromax",
    "Force Motors",
]

# Common Tractor Models regex patterns
TRACTOR_MODELS: List[str] = [
    r"Mahindra\s+(?:575\s*DI|475\s*DI|275\s*DI|OJA\s*\d+|Yuvo\s*Tech\+\s*\d+|Arjun\s*Novo\s*\d+)",
    r"Swaraj\s+(?:744\s*FE|744\s*XT|855\s*FE|735\s*FE|963\s*FE|Target\s*\d+)",
    r"John\s*Deere\s+(?:5050\s*D|5105|5210\s*Gear\s*Pro|5310\s*CRDI|5045\s*D)",
    r"Powertrac\s+(?:439\s*Plus|Euro\s*\d+|Diesel\s*Saver\s*\d+)",
    r"Farmtrac\s+(?:60\s*PowerMax|45\s*Smart|6055)",
    r"Sonalika\s+(?:DI\s*745\s*III|DI\s*35|Sikander\s*DI\s*\d+|Tiger\s*\d+)",
    r"Eicher\s+(?:380|485|551|333|242|557)",
    r"Massey\s*Ferguson\s+(?:241\s*DI|1035\s*DI|9500|7250)",
    r"Kubota\s+(?:MU\s*4501|MU\s*5502|B\s*2441|Neostar\s*\d+)",
    r"New\s*Holland\s+(?:3630\s*TX\s*Super|3230\s*NX|3600-2\s*TX)",
]

# Scientific Names (Binomial Nomenclature for Crops & Plant Pathogens)
SCIENTIFIC_NAMES: List[str] = [
    "Triticum aestivum",
    "Oryza sativa",
    "Zea mays",
    "Solanum tuberosum",
    "Solanum lycopersicum",
    "Gossypium hirsutum",
    "Saccharum officinarum",
    "Glycine max",
    "Cicer arietinum",
    "Brassica juncea",
    "Puccinia graminis",
    "Puccinia striiformis",
    "Magnaporthe oryzae",
    "Xanthomonas oryzae",
    "Rhizoctonia solani",
    "Fusarium oxysporum",
    "Bipolaris oryzae",
    "Alternaria solani",
    "Phytophthora infestans",
    "Helminthosporium turcicum",
    "Colletotrichum falcatum",
    "Cercospora personata",
]

# Official Commodity & Scheme Identifiers
OFFICIAL_IDENTIFIERS: List[str] = [
    "PM-KISAN",
    "PMKISAN",
    "PMFBY",
    "e-NAM",
    "eNAM",
    "APMC",
    "MSP",
    "KCC",
    "IFFCO",
    "KRIBHCO",
    "NABARD",
    "ICAR",
    "FPO",
    "SHG",
    "PDS",
    "DBT",
    "RKVY",
    "MIDH",
    "NFSM",
    "ATMA",
    "PMKSY",
]

# Standard Agricultural Terminology Canonical Translations (key -> lang -> canonical translation)
# Maps English domain concepts to authentic, vetted regional agricultural terminology
AGRICULTURAL_TERM_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "minimum support price": {
        "hin_Deva": "न्यूनतम समर्थन मूल्य (MSP)",
        "kan_Knda": "ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP)",
        "tam_Taml": "குறைந்தபட்ச ஆதரவு விலை (MSP)",
        "tel_Telu": "కనీస మద్దతు ధర (MSP)",
        "mar_Deva": "किमान आधारभूत किंमत (MSP)",
        "ben_Beng": "ন্যূনতম সহায়ক মূল্য (MSP)",
        "guj_Gujr": "ટેકાના લઘુત્તમ ભાવ (MSP)",
    },
    "soil health card": {
        "hin_Deva": "मृदा स्वास्थ्य कार्ड",
        "kan_Knda": "ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್",
        "tam_Taml": "மண் வள அட்டை",
        "tel_Telu": "నేల ఆరోగ్య కార్డు",
        "mar_Deva": "मृदा आरोग्य पत्रिका",
        "ben_Beng": "মৃত্তিকা স্বাস্থ্য কার্ড",
        "guj_Gujr": "જમીન સ્વાસ્થ્ય કાર્ડ",
    },
    "crop insurance": {
        "hin_Deva": "फसल बीमा",
        "kan_Knda": "ಬೆಳೆ ವಿಮೆ",
        "tam_Taml": "பயிர் காப்பீடு",
        "tel_Telu": "పంట బీమా",
        "mar_Deva": "पीक विमा",
        "ben_Beng": "ফসল বীমা",
        "guj_Gujr": "પાક વીમો",
    },
    "adequate irrigation": {
        "hin_Deva": "पर्याप्त सिंचाई",
        "kan_Knda": "ಸಮರ್ಪಕ ನೀರಾವರಿ",
        "tam_Taml": "போதுமான பாசனம்",
        "tel_Telu": "తగినంత నీటిపారుదల",
        "mar_Deva": "पुरेसे सिंचन",
        "ben_Beng": "পর্যাপ্ত সেচ",
        "guj_Gujr": "પૂરતી સિંચાઈ",
    },
    "bumper harvest": {
        "hin_Deva": "बंपर फसल",
        "kan_Knda": "ಉತ್ತಮ ಇಳುವರಿ",
        "tam_Taml": "அமோக விளைச்சல்",
        "tel_Telu": "బంపర్ దిగుబడి",
        "mar_Deva": "भरघोस पीक",
        "ben_Beng": "প্রচুর ফলন",
        "guj_Gujr": "વિપુલ પાક",
    },
}

# Regex patterns for Technical Tokens that must NOT be altered
REGEX_PATTERNS = [
    # URLs
    re.compile(r"https?://[^\s<>\"'{}|\\^`]+", re.IGNORECASE),
    # Email addresses
    re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    # Template variables e.g. {var}, {{var}}, {0}
    re.compile(r"\{\{?[A-Za-z0-9_\-\.]+\}?\}"),
    # Alphanumeric record IDs: e.g. KB-TRAC-1234, CASE-998
    re.compile(r"\b[A-Z]{2,6}-[A-Z0-9_\-]{3,20}\b"),
    # Currency with amounts: e.g. ₹ 5,000, Rs. 2500, INR 10,000
    re.compile(r"(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?"),
    # Technical specs: e.g. 50 HP, 1200 RPM, 2.5 acre, 5 kg/ha, 45 quintal, 32°C, 85%
    re.compile(r"\b\d+(?:\.\d+)?\s*(?:HP|hp|RPM|rpm|kg|quintal|ton|acre|hectare|acres|hectares|mm|cm|km/h|°C|%)\b"),
]


class AgriculturalGlossary:
    """Glossary engine that masks protected terminology before translation and restores it after."""

    def __init__(self, custom_terms_file: Optional[str] = None):
        self._custom_translations: Dict[str, Dict[str, str]] = {}
        if custom_terms_file and os.path.exists(custom_terms_file):
            try:
                with open(custom_terms_file, "r", encoding="utf-8") as f:
                    self._custom_translations = json.load(f)
            except Exception as e:
                log.warning("Could not load custom terms from %s: %s", custom_terms_file, e)

        # Build master regex patterns
        self._build_matchers()

    def _build_matchers(self):
        # 1. Exact phrase protected terms (case-sensitive where appropriate)
        exact_terms = list(PROTECTED_BRANDS) + list(OFFICIAL_IDENTIFIERS) + list(PROTECTED_MANUFACTURERS) + list(SCIENTIFIC_NAMES)
        # Sort by length descending to match longest phrases first
        exact_terms.sort(key=len, reverse=True)
        escaped_terms = [re.escape(t) for t in exact_terms]
        self._exact_pattern = re.compile(r"\b(" + "|".join(escaped_terms) + r")\b")

        # 2. Tractor model regexes
        self._tractor_patterns = [re.compile(p, re.IGNORECASE) for p in TRACTOR_MODELS]

    def protect_and_mask(self, text: str) -> Tuple[str, Dict[str, str]]:
        """Replaces sensitive and protected entities with non-translatable placeholder tokens.

        Returns:
            (masked_text, replacement_map) where replacement_map maps '__KB_PROT_X__' -> original_text
        """
        if not text or not text.strip():
            return text, {}

        masked = text
        token_map: Dict[str, str] = {}
        counter = 0

        # Helper to assign placeholder
        def add_token(match_text: str) -> str:
            nonlocal counter
            # Reuse existing token if identical string already mapped
            for t_id, orig in token_map.items():
                if orig == match_text:
                    return t_id
            placeholder = f"__KB_PROT_{counter}__"
            token_map[placeholder] = match_text
            counter += 1
            return placeholder

        # 1. Mask URLs, emails, template placeholders, currency, and specs
        for pat in REGEX_PATTERNS:
            def _sub_regex(m):
                return add_token(m.group(0))
            masked = pat.sub(_sub_regex, masked)

        # 2. Mask tractor models
        for pat in self._tractor_patterns:
            def _sub_tractor(m):
                return add_token(m.group(0))
            masked = pat.sub(_sub_tractor, masked)

        # 3. Mask exact brands, manufacturers, scientific names, official identifiers
        def _sub_exact(m):
            return add_token(m.group(0))
        masked = self._exact_pattern.sub(_sub_exact, masked)

        return masked, token_map

    def restore_and_canonicalize(
        self,
        translated_text: str,
        token_map: Dict[str, str],
        target_lang: str,
    ) -> str:
        """Restores the original masked entities and applies target-language canonical agricultural terms."""
        if not translated_text:
            return ""

        result = translated_text

        # 1. Restore masked tokens
        # Some MT models might add accidental spaces inside placeholder: e.g. '__ KB _ PROT _ 0 __'
        for placeholder, original in token_map.items():
            if placeholder in result:
                result = result.replace(placeholder, original)
            else:
                # Handle whitespace or case variations produced by tokenizers
                raw_id = placeholder.replace("__", "").strip()  # e.g. KB_PROT_0
                loose_pattern = re.compile(
                    r"__\s*" + re.escape(raw_id).replace("_", r"\s*_\s*") + r"\s*__",
                    re.IGNORECASE,
                )
                result = loose_pattern.sub(original, result)

        # 2. Apply canonical agricultural terminology if configured
        target_norm = target_lang.strip()
        for term_en, translations in {**AGRICULTURAL_TERM_TRANSLATIONS, **self._custom_translations}.items():
            if target_norm in translations:
                canonical = translations[target_norm]
                # If the raw English term appears untranslated in the output, replace it with canonical
                term_pat = re.compile(r"\b" + re.escape(term_en) + r"\b", re.IGNORECASE)
                result = term_pat.sub(canonical, result)

        return result


# Singleton instance
glossary = AgriculturalGlossary()
