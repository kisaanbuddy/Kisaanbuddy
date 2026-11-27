# KisaanBuddy Platform Knowledge Base

## Company Information and Mission
KisaanBuddy (also known as KrishiAI) is an agricultural technology platform built to support Indian farmers with authentic, science-grounded farming guidance, verified marketplace connections, and transparent equipment rental discovery. KisaanBuddy follows a strict **Reality First** principle: every product listing, rental equipment record, price, and agricultural recommendation must come from a genuine, verifiable source.

## Supported Platform Features
KisaanBuddy provides the following core features on the web platform (`https://kisaanbuddy.in`) and WhatsApp AI Assistant:
- **AI Farming Assistant (`/chat`)**: Multilingual conversational assistant for crop selection, sowing, irrigation, soil health, pest management, harvesting, farming expenses, and verified government schemes.
- **Agricultural Marketplace (`/marketplace`)**: Browse verified agricultural inputs (seeds, fertilizers, crop protection, farm tools) with genuine prices, product images, and seller/manufacturer details, plus produce listings and buyer requirements.
- **Equipment Rental (`/marketplace?tab=equipment`)**: Discover farm machinery (tractors, harvesters, rotavators, seed drills, sprayers, threshers) offered for rent or sale by real owners, FPOs, and Custom Hiring Centres (CHCs) by state, district, or PIN code. Reference manufacturer/FMTTI catalog models are strictly separated from active commercial rental listings.
- **Crop Disease Detection (`/disease`)**: Upload crop or leaf photographs for AI visual symptom assessment, possible disease discussion with uncertainty caveats, and option to request review by an agricultural expert.
- **Crop Predictor & Recommendations (`/crop-predictor`)**: Data-driven crop suitability guidance based on soil N-P-K, pH, temperature, humidity, and rainfall.
- **Soil Health & Analysis (`/soil-health`, `/soil-monitor`)**: Soil test tracking, pH/organic carbon interpretation, and scientific soil amendment recommendations.
- **Irrigation Assistance**: Crop-stage irrigation scheduling and water-saving guidance integrated with field conditions and relevant weather forecasts.
- **Mandi Prices (`/mandi`)**: Live agricultural market (mandi) price observations from AGMARKNET / data.gov.in.
- **Government Schemes (`/schemes`)**: Verified central and state agricultural schemes with official source URLs and eligibility checklists.
- **Voice Assistant**: Multilingual speech-to-text (voice notes) and neural text-to-speech across Indian languages.
- **Weather Information**: Weather data is not offered as a standalone feature; it is used only when it meaningfully supports irrigation, spraying, sowing, or harvesting decisions.

## Supported Languages
KisaanBuddy supports multilingual communication across Indian languages including:
- English (`en`)
- Hindi (`hi`) and Hinglish (`hi_en`)
- Bhojpuri (`bho`)
- Maithili (`mai`)
- Kannada (`kn`)
- Telugu (`te`)
- Tamil (`ta`)
- Bengali (`bn`)
- Marathi (`mr`)
- Punjabi (`pa`)
- Gujarati (`gu`)
- Odia (`or`)
- Malayalam (`ml`)

## Marketplace Policy and Product Enquiries
- Products in the KisaanBuddy Marketplace include verified agricultural inputs with authentic specifications, prices, and seller/supplier attribution.
- Farmers can search by keyword, category, crop, disease, soil deficiency, brand, or budget (`max_price`), compare products, view product images, and open direct product links on `/marketplace`.
- KisaanBuddy never fabricates stock availability, discounts, or seller details.

## Equipment Rental, Booking, and Cancellation Policy
- Equipment rental listings are posted by verified farmers, equipment owners, FPOs, and Custom Hiring Centres (CHCs).
- Reference catalog entries (FMTTI / OEM specifications) are informational benchmarks only and are never presented as available rental units.
- **Booking Requests**: Submitting a booking or rental request creates an inquiry (`#INQ-<id>`) sent directly to the equipment owner/provider. A booking is **not confirmed** until the provider or backend confirms availability and terms.
- **Explicit Confirmation**: The AI Assistant always asks for explicit farmer confirmation before creating or cancelling a booking request.
- **Cancellation Policy**: Farmers can cancel pending (`submitted` or `in_discussion`) booking requests anytime before provider acceptance without penalty through WhatsApp ("My Bookings") or the website. Once accepted by a provider, cancellation is subject to direct coordination with the provider.

## Account Management and WhatsApp Linking
- Farmers can manage their profile, farms, fields, soil tests, and bookings on the website (`/profile`, `/farmer-profile`, `/settings`, `/orders`).
- **Secure Account Linking**: A WhatsApp phone number does **not** automatically grant access to an existing website account. To view personal farm data or website bookings on WhatsApp, farmers must complete OTP or signed-token verification.
- Users can type `STOP` anytime on WhatsApp to opt out of promotional messages, `START` to opt back in, `MENU` for the main menu, `LANGUAGE` to switch languages, or `HELP` for assistance.

## Customer Support
- Farmers can report login issues, navigation questions, product or rental enquiries, booking issues, technical errors, complaints, or feedback directly in WhatsApp or at `/contact`.
- Unresolved issues generate a genuine backend support ticket with reference format `KB-SUP-YYYYMMDD-XXXX`.

## Privacy Policy and Terms Summary
- Privacy Policy (`/privacy`) and Terms & Conditions (`/terms`) govern all platform usage.
- KisaanBuddy follows India's Digital Personal Data Protection (DPDP) principles: personal data, farm records, and conversation context are stored only with user consent, never shared with unauthorized third parties, and can be erased upon request via privacy controls.
- Disclaimer (`/disclaimer`): AI crop disease assessments and agricultural advisories are decision-support tools and not a substitute for certified laboratory testing or local Krishi Vigyan Kendra (KVK) agronomist inspection.

## Frequently Asked Questions (FAQ)
- **How do I search products within my budget?** Just ask naturally, e.g., "Mujhe ₹5,000 ke andar water pump chahiye" or select "Buy Agricultural Products" from the menu.
- **How do I rent a tractor or farm equipment?** Ask for the equipment, district/PIN code, and date (e.g., "Mujhe kal kheti ke liye tractor chahiye") or select "Rent Farm Equipment".
- **Can I send a voice note or leaf photo?** Yes! Send a voice note in your language or a clear photo of a diseased leaf, equipment, or soil test report directly in WhatsApp.
- **How do I check or cancel my booking?** Select "My Bookings" or ask "Meri booking ka status kya hai?".
