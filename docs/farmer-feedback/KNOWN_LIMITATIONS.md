# KisaanBuddy — Known Limitations & Operational Boundaries
**Branch:** `feature/farmer-feedback-production-hardening`  
**Date:** November 2026  
**Audience:** Customer Support, Product Team, Engineering Operations  

---

## 1. Overview
In accordance with **Rule 6 (Do Not Claim Perfect Reliability)**, this document articulates known system boundaries, third-party dependencies, device limitations, and edge cases in the current KisaanBuddy platform.

---

## 2. External Service & API Limitations

### 2.1 AGMARKNET Mandi Price Feeds
- **Provider:** `data.gov.in` Open Data Platform.
- **Limitation:** APMC wholesale data is updated by mandi officials once or twice daily. Some regional mandis do not report data on Sundays, national holidays, or local strikes.
- **Platform Behavior:** If a specific commodity has no arrivals reported for the current date, KisaanBuddy reports: *"आज मंडी का भाव उपलब्ध नहीं है। कृपया बाद में देखें।"* (Today's mandi price is unavailable. Please check back later).
- **Guarantee:** The platform will never invent or interpolate missing mandi rates.

### 2.2 Indic Voice Processing (Sarvam AI)
- **Dependency:** Requires valid `SARVAM_API_KEY` configured in the backend environment.
- **Network Requirement:** High-latency 2G/EDGE cellular connections can result in audio transcription timeouts.
- **Fallback:** Browser-native Web Speech API acts as local fallback where supported; manual text and quick-option buttons are always accessible.

### 2.3 Weather Data Availability
- **Provider:** OpenWeatherMap API.
- **Limitation:** Free tier provides 3-hour interval forecasts. Ultra-hyperlocal microclimates (e.g. mountainous valleys) may exhibit slight deviations from village-level rainfall.

---

## 3. Device & Browser Compatibility

### 3.1 Mobile Browser Audio Permissions (iOS Safari & Android Chrome)
- **Constraint:** Mobile operating systems require an explicit user gesture (tap/click) before playing audio streams or requesting microphone access.
- **Handling:** Voice recording cannot auto-start upon page load. Farmers must tap the microphone button explicitly.
- **Microphone Rejection:** If a farmer denies microphone access, a friendly banner instructs how to enable permissions in browser site settings, and the text keyboard remains active.

### 3.2 Low-Memory Mobile Devices
- **Constraint:** Budget smartphones with < 2GB RAM running multiple background applications.
- **Optimization:** Frontend assets are statically bundled and optimized with Next.js code splitting to maintain lightweight memory footprints.

---

## 4. Linguistic & Agronomic Boundaries

### 4.1 Dialect Variations
- **Language Support:** Core translations are provided in standard Modern Standard Hindi (खड़ी बोली) tailored for agricultural comprehension.
- **Limitation:** Extreme localized idioms or village-specific colloquial terms may not always be recognized by speech recognition.

### 4.2 Agronomic Diagnostic Scope
- **Knowledge Base Scope:** Covers major Indian field crops (Wheat, Rice, Cotton, Maize, Sugarcane, Potato, Tomato, Mustard, Gram).
- **Limitation:** Exotic horticulture or rare regional crops with complex overlapping fungal symptoms will return `status: "inconclusive"`.
- **Safety Directive:** Farmers are referred to their district Krishi Vigyan Kendra (KVK) rather than given speculative pesticide recommendations.
