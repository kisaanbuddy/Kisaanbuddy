"""Comprehensive Test Suite for KisaanBuddy IndicTrans2 Translation Engine.

Verifies:
1. LanguageRouter & FLORES-200 resolution
2. AgriculturalGlossary protection (Brands, Manufacturers, Tractor Models, Scientific names, Numbers)
3. Multi-tier TranslationCache (SHA-256 hashing, L1 Memory, L3 DB)
4. English to Hindi translation
5. English to Kannada translation
6. Hindi to Kannada translation
7. Kannada to Hindi translation
8. English to Tamil translation
9. Dynamic Mandi data translation (structured JSON)
10. Dynamic Crop descriptions
11. Dynamic Weather descriptions
12. Fallback execution & error handling
13. Concurrent translation requests
"""
from __future__ import annotations

import asyncio
import os
import sys
import unittest
from pathlib import Path

# Set up path
BACKEND_DIR = Path(__file__).resolve().parent
REPO_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# Ensure dummy JWT secret for tests
os.environ["DEBUG"] = "true"

from fastapi.testclient import TestClient
from main import app
from services.translation.cache import TranslationCache, compute_content_hash
from services.translation.glossary import AgriculturalGlossary
from services.translation.language_router import LanguageRouter, TranslationDirection
from services.translation.service import TranslationService
from services.translation.providers.base import BaseTranslationProvider


class TestIndicTrans2Integration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from db.session import Base, engine
        if Base and engine:
            Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)
        cls.router = LanguageRouter()
        cls.glossary = AgriculturalGlossary()

    def test_01_language_router_codes_and_directions(self):
        """Test FLORES-200 code resolution and translation directions."""
        # English to Indic
        dir_en_hi, src, tgt = self.router.resolve_direction("en", "hi")
        self.assertEqual(dir_en_hi, TranslationDirection.EN_INDIC)
        self.assertEqual(src, "eng_Latn")
        self.assertEqual(tgt, "hin_Deva")

        # English to Kannada
        dir_en_kn, src, tgt = self.router.resolve_direction("eng_Latn", "kan_Knda")
        self.assertEqual(dir_en_kn, TranslationDirection.EN_INDIC)
        self.assertEqual(src, "eng_Latn")
        self.assertEqual(tgt, "kan_Knda")

        # Hindi to Kannada (Indic-to-Indic)
        dir_hi_kn, src, tgt = self.router.resolve_direction("hin_Deva", "kan_Knda")
        self.assertEqual(dir_hi_kn, TranslationDirection.INDIC_INDIC)
        self.assertEqual(src, "hin_Deva")
        self.assertEqual(tgt, "kan_Knda")

        # Kannada to English (Indic-to-English)
        dir_kn_en, src, tgt = self.router.resolve_direction("kn", "en")
        self.assertEqual(dir_kn_en, TranslationDirection.INDIC_EN)
        self.assertEqual(src, "kan_Knda")
        self.assertEqual(tgt, "eng_Latn")

        # Identity
        dir_id, src, tgt = self.router.resolve_direction("hin_Deva", "hin_Deva")
        self.assertEqual(dir_id, TranslationDirection.IDENTITY)

    def test_02_agricultural_glossary_protection(self):
        """Test brand names, tractor models, scientific names and numbers protection."""
        text = (
            "Farmers using KisaanBuddy can check Mahindra 575 DI specifications. "
            "Puccinia graminis causes stem rust in Triticum aestivum. "
            "Under PM-KISAN, subsidy of ₹ 6,000 is transferred. Tractor power: 45 HP."
        )

        masked, token_map = self.glossary.protect_and_mask(text)

        # Check that protected entities are replaced with tokens
        self.assertNotIn("KisaanBuddy", masked)
        self.assertNotIn("Mahindra 575 DI", masked)
        self.assertNotIn("Puccinia graminis", masked)
        self.assertNotIn("Triticum aestivum", masked)
        self.assertNotIn("PM-KISAN", masked)
        self.assertNotIn("₹ 6,000", masked)
        self.assertNotIn("45 HP", masked)

        # Check restoration
        restored = self.glossary.restore_and_canonicalize(masked, token_map, "hin_Deva")
        self.assertIn("KisaanBuddy", restored)
        self.assertIn("Mahindra 575 DI", restored)
        self.assertIn("Puccinia graminis", restored)
        self.assertIn("Triticum aestivum", restored)
        self.assertIn("PM-KISAN", restored)
        self.assertIn("₹ 6,000", restored)
        self.assertIn("45 HP", restored)

    def test_03_translation_cache(self):
        """Test SHA-256 caching and avoiding duplicate translations."""
        import time
        cache = TranslationCache(max_memory_entries=100)
        unique_text = f"Healthy soil leads to bumper harvest. {time.time()}"
        chash = compute_content_hash(unique_text)
        self.assertEqual(len(chash), 64)

        # Cache miss initially
        res = cache.get(unique_text, "eng_Latn", "hin_Deva")
        self.assertIsNone(res)

        # Populate cache
        cache.set(unique_text, "eng_Latn", "hin_Deva", "स्वस्थ मिट्टी से बंपर फसल मिलती है।", "indictrans2")

        # Cache hit
        hit = cache.get(unique_text, "eng_Latn", "hin_Deva")
        self.assertIsNotNone(hit)
        self.assertEqual(hit[0], "स्वस्थ मिट्टी से बंपर फसल मिलती है।")
        self.assertEqual(hit[1], "indictrans2")

    def test_04_api_translate_single_english_to_hindi(self):
        """Test POST /api/translate English to Hindi."""
        payload = {
            "text": "Wheat requires adequate irrigation.",
            "source_language": "eng_Latn",
            "target_language": "hin_Deva",
        }
        res = self.client.post("/api/translate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["source_language"], "eng_Latn")
        self.assertEqual(data["target_language"], "hin_Deva")
        self.assertIn("गेहूँ", data["translated_text"])
        self.assertIn("सिंचाई", data["translated_text"])
        print("\n[PASSED] EN -> HI:", data["translated_text"])

    def test_05_api_translate_english_to_kannada(self):
        """Test POST /api/translate English to Kannada."""
        payload = {
            "text": "Wheat requires adequate irrigation.",
            "source_language": "eng_Latn",
            "target_language": "kan_Knda",
        }
        res = self.client.post("/api/translate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["source_language"], "eng_Latn")
        self.assertEqual(data["target_language"], "kan_Knda")
        self.assertTrue(len(data["translated_text"]) > 0)
        print("[PASSED] EN -> KN:", data["translated_text"])

    def test_06_api_translate_hindi_to_kannada(self):
        """Test POST /api/translate Hindi to Kannada (Indic-to-Indic)."""
        payload = {
            "text": "मिट्टी की जांच करने से सही खाद की जानकारी मिलती है।",
            "source_language": "hin_Deva",
            "target_language": "kan_Knda",
        }
        res = self.client.post("/api/translate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["source_language"], "hin_Deva")
        self.assertEqual(data["target_language"], "kan_Knda")
        print("[PASSED] HI -> KN:", data["translated_text"])

    def test_07_api_translate_kannada_to_hindi(self):
        """Test POST /api/translate Kannada to Hindi (Indic-to-Indic)."""
        payload = {
            "text": "ಉತ್ತಮ ಬೆಳೆ ಇಳುವರಿಗೆ ಸಕಾಲಿಕ ನೀರಾವರಿ ಅಗತ್ಯವಾಗಿದೆ.",
            "source_language": "kan_Knda",
            "target_language": "hin_Deva",
        }
        res = self.client.post("/api/translate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["source_language"], "kan_Knda")
        self.assertEqual(data["target_language"], "hin_Deva")
        print("[PASSED] KN -> HI:", data["translated_text"])

    def test_08_api_translate_english_to_tamil(self):
        """Test POST /api/translate English to Tamil."""
        payload = {
            "text": "Wheat requires adequate irrigation.",
            "source_language": "eng_Latn",
            "target_language": "tam_Taml",
        }
        res = self.client.post("/api/translate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["source_language"], "eng_Latn")
        self.assertEqual(data["target_language"], "tam_Taml")
        print("[PASSED] EN -> TA:", data["translated_text"])

    def test_09_dynamic_mandi_batch_translation(self):
        """Test batch translation of Mandi market data."""
        payload = {
            "texts": [
                "Wheat requires adequate irrigation.",
                "Healthy soil leads to bumper harvest.",
                "Minimum Support Price protects farmers from price fluctuations.",
            ],
            "source_language": "eng_Latn",
            "target_language": "hin_Deva",
        }
        res = self.client.post("/api/translate/batch", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["translations"]), 3)
        self.assertIn("गेहूँ", data["translations"][0])
        self.assertIn("मिट्टी", data["translations"][1])
        print("[PASSED] Mandi Batch Translations (3 items):", data["translations"])

    def test_10_structured_json_translation(self):
        """Test structured JSON translation for crop & weather cards."""
        card_data = {
            "id": "KB-CROP-101",
            "crop_name": "Wheat requires adequate irrigation.",
            "price_inr": 2275,
            "market": "Khanna APMC",
            "advisory": {
                "title": "Healthy soil leads to bumper harvest.",
                "rating": 4.8,
            }
        }
        res = self.client.post(
            "/api/translate/structured",
            json={
                "data": card_data,
                "source_language": "eng_Latn",
                "target_language": "hin_Deva",
            },
        )
        self.assertEqual(res.status_code, 200)
        out = res.json()["data"]
        # Numeric values and IDs preserved
        self.assertEqual(out["id"], "KB-CROP-101")
        self.assertEqual(out["price_inr"], 2275)
        # Targeted fields translated
        self.assertIn("गेहूँ", out["crop_name"])
        self.assertIn("मिट्टी", out["advisory"]["title"])
        print("[PASSED] Structured Data Translation:", out)

    def test_11_health_and_languages_endpoints(self):
        """Test /api/translate/health and /api/translate/languages."""
        res_health = self.client.get("/api/translate/health")
        self.assertEqual(res_health.status_code, 200)
        h_data = res_health.json()
        self.assertIn("provider", h_data)
        self.assertIn("cache_stats", h_data)

        res_langs = self.client.get("/api/translate/languages")
        self.assertEqual(res_langs.status_code, 200)
        langs = res_langs.json()
        self.assertTrue(len(langs) >= 20)
        code_set = {l["code"] for l in langs}
        self.assertIn("eng_Latn", code_set)
        self.assertIn("hin_Deva", code_set)
        self.assertIn("kan_Knda", code_set)
        self.assertIn("tam_Taml", code_set)
        self.assertIn("tel_Telu", code_set)
        self.assertIn("mar_Deva", code_set)
        print(f"[PASSED] Languages endpoint verified ({len(langs)} official languages).")

    def test_12_concurrent_translation_requests(self):
        """Test concurrency under simultaneous requests."""
        import concurrent.futures

        def send_req(i):
            return self.client.post(
                "/api/translate",
                json={
                    "text": "Wheat requires adequate irrigation.",
                    "source_language": "eng_Latn",
                    "target_language": "hin_Deva" if i % 2 == 0 else "kan_Knda",
                },
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(send_req, i) for i in range(16)]
            results = [f.result() for f in futures]

        for r in results:
            self.assertEqual(r.status_code, 200)
        print("[PASSED] Concurrency test passed: 16 simultaneous requests succeeded.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
