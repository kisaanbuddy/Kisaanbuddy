# KisaanBuddy — Production Hardening Implementation Plan

**Document Version:** 1.0.0  
**Target Branch:** `feature/farmer-feedback-production-hardening`  
**Execution Standard:** Zero Fabricated Data, Strict Authorization, Complete Hindi Accessibility

---

## 1. Implementation Phases & Prioritization

### P0 — Critical Security, Authorization & Data Integrity
1. **Marketplace Authorization & Ownership Controls:**
   - Enforce authentication on `PATCH /api/marketplace/produce-listings/{item_id}/status` and `PATCH /api/marketplace/buyer-requirements/{item_id}/status`.
   - Restrict status modification to the listing owner (`item.user_id == current_user.id`) or an active administrator (`current_user.is_admin == True`).
   - Associate created produce listings and buyer requirements with `current_user.id` when an authenticated session exists.
2. **Crop Doctor Agronomic Integrity:**
   - Eliminate fallback to `AGRICULTURAL_KNOWLEDGE_BASE[0]` with hardcoded `0.76` confidence when symptom matches are absent.
   - Return an honest `inconclusive` diagnostic response with `confidence: 0.0`, safe cultural observation guidance, and an explicit referral to the nearest Krishi Vigyan Kendra (KVK).
3. **Weather Provider Truthfulness:**
   - Restrict `DemoWeatherProvider` so it is never registered in production and only allowed when `settings.DEBUG == True` and `settings.ENABLE_DEMO_WEATHER == True`.
   - When all external weather providers fail or keys are unconfigured, raise HTTP 503 with an honest error instead of synthesizing fake temperature.

### P1 — Accessibility, Language Synchronization & Real Customer Support
4. **Language Persistence Synchronization:**
   - Implement `PATCH /api/auth/me` in `backend/api/auth.py` allowing authenticated farmers to persist their `language` (`preferred_language`) to the database.
   - Sync language preference between `localStorage` and backend user profile upon login and session initialization.
5. **Real Support Ticket Workflow (`/contact` & `/madad`):**
   - Wire the Contact page form to submit directly to `POST /api/feedback` with `feedback_type: "help"`.
   - Generate and display the real ticket reference number (`KB-FB-XXXXX`) to the farmer with clear follow-up tracking guidance.
   - Preserve client-side fallback options only when the backend is unreachable.
6. **Mandi Unavailable Empty States in Hindi:**
   - Ensure the Mandi UI explicitly renders `"आज मंडी का भाव उपलब्ध नहीं है। कृपया बाद में देखें।"` when external APMC data is unavailable or encounters provider timeout.

### P2 — Automated Verification & Regression Testing
7. **Comprehensive Unit & Integration Test Suite:**
   - Create automated backend tests verifying marketplace ownership authorization, crop disease uncertainty handling, weather 503 behavior, user language update endpoint, and support ticket creation.
   - Run full regression testing across all 115+ test cases.

---

## 2. Risk Mitigation & Rollback Controls
- All code changes are isolated on `feature/farmer-feedback-production-hardening`.
- Database schema changes utilize existing nullable columns (`User.language`, `ProduceListing.user_id`, `BuyerRequirement.user_id`).
- All changes are backwards-compatible with existing client apps and API consumers.
