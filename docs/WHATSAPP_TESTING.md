# WhatsApp Business Platform — Testing Strategy & Verification Guide

This document outlines the testing architecture, test suites, and instructions for verifying the integration locally and in Meta's sandbox.

---

## 1. Test Suite Structure

The test suite is organized into three distinct tiers:
1. **Unit Tests (`backend/tests/test_whatsapp_unit.py`):**
   - Signature verification (HMAC-SHA256).
   - Phone normalization (E.164 conversion).
   - SSRF protection on media URLs.
   - Signed link token generation and tampering detection.
   - Multilingual string rendering (en, hi, kn).
   - Menu keyword parsing.
   - Image validation (sizes, types, dimensions).
   - Conversation state transitions and session expiry.
   - Webhook idempotency and deduplication.
   - Conversation pricing and budget limits.

2. **Integration Tests (`backend/tests/test_whatsapp_integration.py`):**
   - Meta GET webhook challenge verification.
   - Meta POST webhook signature enforcement (403 on invalid signature).
   - Webhook fast acceptance (200 OK).
   - Signed link verification endpoint (`/auth/verify-link`).
   - Health and configuration endpoint (`/health`).
   - Admin stats, ticketing, and test-send endpoints.
   - DPDP privacy and data erasure workflow (`/privacy/request-erasure`).

3. **End-to-End Tests (`backend/tests/test_whatsapp_e2e.py`):**
   - Simulated execution of all 12 complete farmer user journeys.

---

## 2. Executing Automated Tests

Run all WhatsApp test suites:
```bash
# Run unit tests
backend/venv/Scripts/python -m pytest backend/tests/test_whatsapp_unit.py -v

# Run integration tests
backend/venv/Scripts/python -m pytest backend/tests/test_whatsapp_integration.py -v

# Run end-to-end tests (12 journeys)
backend/venv/Scripts/python -m pytest backend/tests/test_whatsapp_e2e.py -v

# Run full project test suite
backend/venv/Scripts/python -m pytest backend/tests -v
```

---

## 3. Real Meta Sandbox Verification
When live Meta sandbox credentials (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEST_RECIPIENT`) are populated in `backend/.env`:

Run the live sandbox verification runner:
```bash
backend/venv/Scripts/python backend/scripts/verify_real_meta_sandbox.py
```

The script will:
1. Verify credentials format and presence.
2. Send an outbound test text message to the verified recipient.
3. Send an interactive test button menu.
4. Report the resulting Meta WAMIDs and HTTP responses.
