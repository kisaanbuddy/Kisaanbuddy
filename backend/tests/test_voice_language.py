"""Regression tests for voice-language routing without provider credentials."""
import unittest

from services.chat.language_detect import detect_language, resolve_language


class VoiceLanguageDetectionTests(unittest.TestCase):
    def test_detects_native_hindi(self):
        self.assertEqual(detect_language("आज मौसम कैसा है?"), "hi")

    def test_detects_hinglish_without_forcing_english(self):
        self.assertEqual(
            detect_language("Aaj mandi mein gehu ka rate kya hai?"),
            "hi_en",
        )

    def test_detects_kannada(self):
        self.assertEqual(detect_language("ಇವತ್ತು ಹವಾಮಾನ ಹೇಗಿದೆ?"), "kn")

    def test_recognises_spoken_language_switches(self):
        self.assertEqual(resolve_language("auto", "Hindi mein baat karo"), "hi")
        self.assertEqual(resolve_language("auto", "Speak in English"), "en")
        self.assertEqual(resolve_language("auto", "ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ"), "kn")


if __name__ == "__main__":
    unittest.main()
