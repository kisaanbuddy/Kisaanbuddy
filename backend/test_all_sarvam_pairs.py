import json
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-testing-only")
os.environ.setdefault("DEBUG", "1")

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

pairs = [
    ("en-IN", "kn-IN", "Healthy soil leads to bumper harvest."),
    ("hi-IN", "kn-IN", "मिट्टी की जांच करने से सही खाद की जानकारी मिलती है।"),
    ("kn-IN", "en-IN", "ಉತ್ತಮ ಬೆಳೆ ಇಳುವರಿಗೆ ಸಕಾಲಿಕ ನೀರಾವರಿ ಅಗತ್ಯವಾಗಿದೆ."),
    ("kn-IN", "hi-IN", "ರೈತರಿಗೆ ಬೆಳೆ ರೋಗ ತಡೆಗಟ್ಟಲು ನಿಖರ ಮಾಹಿತಿ ಬೇಕು."),
    ("en-IN", "hi-IN", "Timely pest management saves crops from destruction."),
    ("hi-IN", "en-IN", "फसल बीमा से किसानों को जोखिम से सुरक्षा मिलती है।"),
]

print("=== TESTING SARVAM TRANSLATION ACROSS ALL 6 PAIRS ===")
all_passed = True
for src, tgt, text in pairs:
    payload = {
        "text": text,
        "source_lang": src,
        "target_lang": tgt,
        "mode": "formal"
    }
    r = client.post("/api/sarvam/translate", json=payload)
    print(f"\n[{src} -> {tgt}]")
    print(f"Input:  {text}")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        res = r.json()
        print(f"Output: {res.get('translated_text')}")
    else:
        print(f"Error:  {r.text}")
        all_passed = False

if all_passed:
    print("\n>>> ALL 6 SARVAM TRANSLATION PAIRS PASSED SUCCESSFULLY!")
else:
    print("\n>>> SOME TRANSLATIONS FAILED!")
