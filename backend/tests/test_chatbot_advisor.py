"""Comprehensive tests for KisaanBuddy Google Gemini AI Advisor, multimodal crop analysis,
multilingual support (English, Hindi, Hinglish, Kannada), cost optimization, security, and failure handling.
"""
from __future__ import annotations

import base64
import io
import json
import os
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from PIL import Image

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-testing-only")
os.environ.setdefault("DEBUG", "1")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from core.config import settings
from db.models import User
from db.session import Base, get_db
from main import app
from services.auth_service import create_access_token
from services.chat import gemini_service
from services.chat.language_detect import detect_language, resolve_language
from services.chat.prompts import build_system_messages
from services.chat.stt_service import _normalise_lang

client = TestClient(app)


def _make_jpeg_data_url(width: int = 1600, height: int = 1200, color=(40, 120, 45)) -> str:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


def _fake_stream_chunk(text: str = "", prompt_tokens: int = 120, output_tokens: int = 45, finish_reason: str = "STOP"):
    part = SimpleNamespace(text=text, function_call=None, thought_signature=None)
    cand = SimpleNamespace(
        finish_reason=finish_reason if text else None,
        content=SimpleNamespace(parts=[part]),
    )
    usage = SimpleNamespace(
        prompt_token_count=prompt_tokens,
        candidates_token_count=output_tokens,
        thoughts_token_count=0,
        total_token_count=prompt_tokens + output_tokens,
    )
    return SimpleNamespace(text=text, candidates=[cand], usage_metadata=usage)


def _fake_tool_chunk(name: str, args: dict):
    fc = SimpleNamespace(name=name, args=args)
    part = SimpleNamespace(text=None, function_call=fc, thought_signature=b"sig")
    cand = SimpleNamespace(
        finish_reason=None,
        content=SimpleNamespace(parts=[part]),
    )
    usage = SimpleNamespace(
        prompt_token_count=90,
        candidates_token_count=20,
        thoughts_token_count=0,
        total_token_count=110,
    )
    return SimpleNamespace(text=None, candidates=[cand], usage_metadata=usage)


def test_prompts_include_structured_agricultural_sections():
    msgs = build_system_messages("hi", {"city": "Karnal"}, "मेरे गेहूं में पीला रतुआ है")
    combined = "\n".join(m["content"] for m in msgs)
    for heading in (
        "Problem Identified",
        "Possible Causes",
        "Recommended Solution",
        "Step-by-Step Instructions",
        "Precautions",
        "When to Contact an Agricultural Expert",
    ):
        assert heading in combined
    assert "DISEASE-DIAGNOSIS MODE" in combined
    assert "Hindi" in combined
    assert "NEVER claim a disease is definitively identified from an unclear" in combined


def test_multilingual_detection_hindi_hinglish_kannada():
    assert detect_language("मेरे धान के पत्ते पीले पड़ रहे हैं") == "hi"
    assert detect_language("mere gehun me peela ratua lag gaya hai kya karein") == "hi_en"
    assert detect_language("ನನ್ನ ಭತ್ತದ ಬೆಳೆಯಲ್ಲಿ ರೋಗ ಕಾಣಿಸಿದೆ") == "kn"
    assert resolve_language("hi_en", "wheat crop advice") == "hi_en"
    assert resolve_language("kn", "hello") == "kn"
    assert resolve_language("ml", "hello") == "ml"


def test_stt_normalise_lang_supports_indian_languages():
    assert _normalise_lang("hi-IN") == "hi"
    assert _normalise_lang("hi_en") == "hi_en"
    assert _normalise_lang("kn-IN") == "kn"
    assert _normalise_lang("ml-IN") == "ml"
    assert _normalise_lang("ta-IN") == "ta"
    assert _normalise_lang("te-IN") == "te"
    assert _normalise_lang("en-IN") == "en"


def test_image_validation_and_cost_resizing():
    large_data_url = _make_jpeg_data_url(width=2400, height=1800)
    opt_bytes, mime, meta = gemini_service.prepare_crop_image(large_data_url)
    assert mime == "image/jpeg"
    assert meta["resized"] is True
    out_img = Image.open(io.BytesIO(opt_bytes))
    assert max(out_img.size) == 1024

    # Corrupt non-image payload must fail cleanly
    try:
        gemini_service.prepare_crop_image("data:image/jpeg;base64,bm90LWFuLWltYWdl")
        assert False, "Expected GeminiBadRequestError for invalid image bytes"
    except gemini_service.GeminiBadRequestError:
        pass

    # Tiny (<32px) image must fail cleanly
    tiny_url = _make_jpeg_data_url(width=16, height=16)
    try:
        gemini_service.prepare_crop_image(tiny_url)
        assert False, "Expected GeminiBadRequestError for tiny image"
    except gemini_service.GeminiBadRequestError:
        pass


def test_secret_redaction_masks_gemini_keys():
    raw = "Error calling API with AQ.FakeTestKey1234567890abcdefghijklmnop and AIzaSyD12345678901234567890"
    masked = gemini_service.redact_secrets(raw)
    assert "AQ.FakeTestKey" not in masked
    assert "AIzaSyD" not in masked
    assert "***REDACTED***" in masked


def test_chat_session_lifecycle_and_health():
    health_res = client.get("/api/chat/health")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert "tools_enabled" in health_data
    assert "get_weather" in health_data["tools_enabled"]
    assert "get_mandi_prices" in health_data["tools_enabled"]
    assert "diagnose_crop_disease" in health_data["tools_enabled"]
    assert not any("sarvam" in p["name"].lower() for p in health_data["providers"])

    create_res = client.post("/api/chat/session", json={"language": "hi", "location": {"city": "Karnal"}})
    assert create_res.status_code == 200
    sid = create_res.json()["id"]

    get_res = client.get(f"/api/chat/session/{sid}")
    assert get_res.status_code == 200
    assert get_res.json()["language"] == "hi"

    del_res = client.delete(f"/api/chat/session/{sid}")
    assert del_res.status_code == 200


def test_chat_streaming_text_and_tool_calls_with_gemini():
    gemini_service.usage_tracker.reset()

    async def fake_stream_with_retry(**kwargs):
        contents = kwargs["contents"]
        # First pass triggers get_weather tool, second pass streams final text
        if len(contents) == 1:
            yield _fake_tool_chunk("get_weather", {"city": "Karnal"}), "gemini-2.5-flash"
        else:
            yield _fake_stream_chunk("### Problem Identified\nWheat Yellow Rust "), "gemini-2.5-flash"
            yield _fake_stream_chunk("management advice.\n\n### Precautions\nWear gloves."), "gemini-2.5-flash"

    with patch("services.chat.chat_service.is_gemini_configured", return_value=True), \
         patch("services.chat.chat_service.stream_with_retry", side_effect=fake_stream_with_retry), \
         patch("services.chat.chat_service.run_tool", new=AsyncMock(return_value={"location": "Karnal", "temperature_c": 24})):
        with client.stream(
            "POST",
            "/api/chat/message",
            json={
                "message": "What is today's weather in Karnal for wheat spraying?",
                "language": "en",
                "location": {"city": "Karnal"},
                "stream": True,
            },
        ) as response:
            assert response.status_code == 200
            raw_body = b"".join(response.iter_bytes()).decode("utf-8")

    assert "event: session" in raw_body
    assert "event: tool_start" in raw_body
    assert "event: tool_end" in raw_body
    assert "event: token" in raw_body
    assert "event: done" in raw_body
    assert "get_weather" in raw_body


def test_multimodal_crop_image_streaming_in_hindi_and_kannada():
    img_data_url = _make_jpeg_data_url(width=1600, height=1200)

    async def fake_vision_stream(**kwargs):
        # Confirm resized image Part was passed cleanly
        user_content = kwargs["contents"][-1]
        assert len(user_content.parts) == 2
        yield _fake_stream_chunk("### Problem Identified\nपत्तियों पर भूरे धब्बे दिख रहे हैं (Unclear angle, Confidence: Low)."), "gemini-2.5-pro"

    with patch("services.chat.chat_service.is_gemini_configured", return_value=True), \
         patch("services.chat.chat_service.stream_with_retry", side_effect=fake_vision_stream):
        with client.stream(
            "POST",
            "/api/chat/message",
            json={
                "message": "मेरी धान की पत्ती की जांच करें",
                "language": "hi",
                "image_base64": img_data_url,
                "stream": True,
            },
        ) as response:
            assert response.status_code == 200
            raw_body = b"".join(response.iter_bytes()).decode("utf-8")

    assert "event: token" in raw_body
    assert "event: done" in raw_body
    assert "gemini-2.5-pro" in raw_body

    # Also test Kannada text non-stream reply
    async def fake_kn_stream(**kwargs):
        yield _fake_stream_chunk("ರೈತ ಸ್ನೇಹಿತರೇ, ಭತ್ತದ ಸಸಿ ನಾಟಿ ಮಾಡುವ ಮೊದಲು ಬೀಜೋಪಚಾರ ಮಾಡಿ."), "gemini-2.5-flash"

    with patch("services.chat.chat_service.is_gemini_configured", return_value=True), \
         patch("services.chat.chat_service.stream_with_retry", side_effect=fake_kn_stream):
        res_kn = client.post(
            "/api/chat/message",
            json={"message": "ಭತ್ತದ ಬೀಜೋಪಚಾರ ಹೇಗೆ ಮಾಡಬೇಕು?", "language": "kn", "stream": False},
        )
    assert res_kn.status_code == 200
    kn_data = res_kn.json()
    assert kn_data["language"] == "kn"
    assert kn_data["provider"].startswith("google-genai:")
    assert "ರೈತ" in kn_data["content"]


def test_response_caching_for_non_personal_queries():
    calls = {"count": 0}

    async def fake_stream(**kwargs):
        calls["count"] += 1
        yield _fake_stream_chunk("Drip irrigation saves 40-60% water compared to flood irrigation."), "gemini-2.5-flash"

    unique_q = "Explain drip irrigation benefits for sugarcane?"
    with patch("services.chat.chat_service.is_gemini_configured", return_value=True), \
         patch("services.chat.chat_service.stream_with_retry", side_effect=fake_stream):
        r1 = client.post("/api/chat/message", json={"message": unique_q, "language": "en", "stream": False})
        r2 = client.post("/api/chat/message", json={"message": unique_q, "language": "en", "stream": False})

    assert r1.status_code == 200 and r1.json()["cached"] is False
    assert r2.status_code == 200 and r2.json()["cached"] is True
    assert calls["count"] == 1


def test_gemini_billing_and_quota_error_handling():
    # 1. Billing error (402) emitted cleanly via SSE & HTTP 402 for non-stream
    async def fake_billing_fail(**kwargs):
        raise gemini_service.GeminiBillingError("Your prepayment credits are depleted.")
        yield  # pragma: no cover

    with patch("services.chat.chat_service.is_gemini_configured", return_value=True), \
         patch("services.chat.chat_service.stream_with_retry", side_effect=fake_billing_fail):
        res = client.post(
            "/api/chat/message",
            json={"message": "What is soil pH for cotton?", "language": "en", "stream": False},
        )
        assert res.status_code == 402
        assert "credits" in res.json()["detail"].lower()

        with client.stream(
            "POST",
            "/api/chat/message",
            json={"message": "What is soil pH for cotton?", "language": "en", "stream": True},
        ) as sse_res:
            assert sse_res.status_code == 200
            raw = b"".join(sse_res.iter_bytes()).decode("utf-8")
            assert "event: error" in raw
            assert "billing_exhausted" in raw

    # 2. Model 404 fallback + transient 429 retry inside generate_with_retry
    call_log = []

    class FakeAPIError(Exception):
        def __init__(self, code, status, msg):
            super().__init__(msg)
            self.code = code
            self.status = status

    async def fake_generate_content(*, model, contents, config):
        call_log.append(model)
        if model == "gemini-2.5-flash" and len(call_log) == 1:
            raise FakeAPIError(404, "NOT_FOUND", "model not found")
        if model == "gemini-2.5-flash-lite" and len(call_log) == 2:
            raise FakeAPIError(429, "RESOURCE_EXHAUSTED", "rate limit")
        return SimpleNamespace(
            text="Recovered answer",
            usage_metadata=SimpleNamespace(prompt_token_count=10, candidates_token_count=5, thoughts_token_count=0, total_token_count=15),
        )

    fake_client = MagicMock()
    fake_client.aio.models.generate_content = fake_generate_content

    import asyncio
    with patch("services.chat.gemini_service.get_gemini_client", return_value=fake_client), \
         patch.object(settings, "GEMINI_MAX_RETRIES", 1):
        resp, used_model = asyncio.run(
            gemini_service.generate_with_retry(
                contents="hello",
                feature="test",
                models=["gemini-2.5-flash", "gemini-2.5-flash-lite"],
            )
        )
    assert resp.text == "Recovered answer"
    assert used_model == "gemini-2.5-flash-lite"
    assert call_log == ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-flash-lite"]


def test_usage_endpoint_requires_admin_and_session_idor_blocked():
    # Unauthenticated access to /api/chat/usage must fail with 401
    r_unauth = client.get("/api/chat/usage")
    assert r_unauth.status_code == 401

    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    try:
        farmer = User(phone_number="9999900001", name="Test Farmer", role="Farmer", is_active=True)
        admin = User(phone_number="9999900002", name="Test Admin", role="Admin", is_active=True)
        db.add_all([farmer, admin])
        db.commit()
        db.refresh(farmer)
        db.refresh(admin)

        farmer_token = create_access_token({"sub": str(farmer.id), "phone": farmer.phone_number, "role": farmer.role})
        admin_token = create_access_token({"sub": str(admin.id), "phone": admin.phone_number, "role": admin.role})

        # Non-admin farmer blocked with 403
        r_farmer = client.get("/api/chat/usage", headers={"Authorization": f"Bearer {farmer_token}"})
        assert r_farmer.status_code == 403

        # Admin succeeds
        r_admin = client.get("/api/chat/usage", headers={"Authorization": f"Bearer {admin_token}"})
        assert r_admin.status_code == 200
        assert r_admin.json()["provider"] == "google-genai"

        # Cross-user session IDOR check
        sess_res = client.post("/api/chat/session", json={"language": "hi"}, headers={"Authorization": f"Bearer {farmer_token}"})
        assert sess_res.status_code == 200
        sid = sess_res.json()["id"]
        other_get = client.get(f"/api/chat/session/{sid}", headers={"Authorization": f"Bearer {admin_token}"})
        assert other_get.status_code == 403
        owner_get = client.get(f"/api/chat/session/{sid}", headers={"Authorization": f"Bearer {farmer_token}"})
        assert owner_get.status_code == 200
    finally:
        app.dependency_overrides.clear()
        db.close()
        Base.metadata.drop_all(bind=engine)
