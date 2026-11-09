"""Multilingual dictionary and localization engine for WhatsApp KisaanBuddy."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

# Supported language codes
SUPPORTED_LANGUAGES = ["en", "hi", "kn"]

DEFAULT_LANGUAGE = "en"

# Multilingual strings
MESSAGES: Dict[str, Dict[str, str]] = {
    "welcome": {
        "en": (
            "Namaste! Welcome to KisaanBuddy.\n\n"
            "Your farming assistant is here to help you.\n\n"
            "Choose what you need help with:"
        ),
        "hi": (
            "नमस्ते! किसानबडी (KisaanBuddy) में आपका स्वागत है।\n\n"
            "आपका कृषि सहायक आपकी सहायता के लिए तैयार है।\n\n"
            "कृपया नीचे दिए गए विकल्पों में से चुनें:"
        ),
        "kn": (
            "ನಮಸ್ಕಾರ! ಕಿಸಾನ್‌ಬಡ್ಡಿಗೆ (KisaanBuddy) ಸುಸ್ವಾಗತ.\n\n"
            "ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ ನಿಮಗೆ ನೆರವಾಗಲು ಸಿದ್ಧರಾಗಿದ್ದಾರೆ.\n\n"
            "ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ:"
        ),
    },
    "menu_header": {
        "en": "KisaanBuddy Menu",
        "hi": "किसानबडी मुख्य मेनू",
        "kn": "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಮುಖ್ಯ ಮೆನು",
    },
    "menu_footer": {
        "en": "Type 'menu' anytime to return here.",
        "hi": "वापस आने के लिए कभी भी 'menu' लिखें।",
        "kn": "ವಾಪಸ್ ಬರಲು ಯಾವಾಗ ಬೇಕಾದರೂ 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ.",
    },
    "select_option": {
        "en": "Select an option from below or reply with a number (1-6):",
        "hi": "नीचे से कोई विकल्प चुनें या नंबर (1-6) लिखकर भेजें:",
        "kn": "ಕೆಳಗಿನ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ ಅಥವಾ ಸಂಖ್ಯೆ (1-6) ಕಳುಹಿಸಿ:",
    },
    "crop_doctor_prompt": {
        "en": (
            "🌾 *Crop Doctor — Plant Disease Diagnosis*\n\n"
            "Please send a clear, close-up photograph of the affected crop leaf, stem, or fruit.\n\n"
            "• Ensure good lighting\n"
            "• Focus on the diseased or spotted part\n\n"
            "Or type 'menu' to return to the main menu."
        ),
        "hi": (
            "🌾 *क्रॉप डॉक्टर — फसल रोग निदान*\n\n"
            "कृपया प्रभावित पौधे की पत्ती, तने या फल की स्पष्ट फोटो भेजें।\n\n"
            "• रोशनी अच्छी होनी चाहिए\n"
            "• रोग या धब्बे वाले भाग पर फोकस करें\n\n"
            "मुख्य मेनू पर लौटने के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🌾 *ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ — ಬೆಳೆ ರೋಗ ಪತ್ತೆ*\n\n"
            "ದಯವಿಟ್ಟು ರೋಗಬಾಧಿತ ಎಲೆ, ಕಾಂಡ ಅಥವಾ ಹಣ್ಣಿನ ಸ್ಪಷ್ಟ ಫೋಟೋವನ್ನು ಕಳುಹಿಸಿ.\n\n"
            "• ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ಫೋಟೋ ತೆಗೆಯಿರಿ\n"
            "• ರೋಗದ ಲಕ್ಷಣವಿರುವ ಭಾಗವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಸೆರೆಹಿಡಿಯಿರಿ\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "crop_doctor_analyzing": {
        "en": "🔬 Analyzing your crop photograph with KisaanBuddy AI Vision...",
        "hi": "🔬 किसानबडी एआई विज़न द्वारा आपकी फसल की फोटो का विश्लेषण किया जा रहा है...",
        "kn": "🔬 ಕಿಸಾನ್‌ಬಡ್ಡಿ AI ಮೂಲಕ ನಿಮ್ಮ ಬೆಳೆ ಫೋಟೋವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    },
    "crop_doctor_invalid_image": {
        "en": (
            "⚠️ The uploaded file is not a valid crop image.\n\n"
            "Please upload a clear JPG, PNG or WebP photograph of the affected plant foliage, or type 'menu' to go back."
        ),
        "hi": (
            "⚠️ भेजी गई फ़ाइल एक मान्य फ़ोटो नहीं है।\n\n"
            "कृपया प्रभावित पौधे की स्पष्ट JPG या PNG फ़ोटो भेजें, या वापस जाने के लिए 'menu' लिखें।"
        ),
        "kn": (
            "⚠️ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್ ಸರಿಯಾದ ಬೆಳೆ ಚಿತ್ರವಲ್ಲ.\n\n"
            "ದಯವಿಟ್ಟು ಸಸ್ಯದ ಸ್ಪಷ್ಟವಾದ JPG ಅಥವಾ PNG ಫೋಟೋವನ್ನು ಕಳುಹಿಸಿ, ಅಥವಾ ಹಿಂತಿರುಗಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "crop_doctor_inference_error": {
        "en": (
            "⚠️ We could not complete the image diagnosis at this moment.\n\n"
            "Please try uploading another clearer photo, or type '6' to connect with an agricultural expert."
        ),
        "hi": (
            "⚠️ इस समय फ़ोटो का निदान पूरा नहीं हो सका।\n\n"
            "कृपया एक और स्पष्ट फ़ोटो भेजें, या कृषि विशेषज्ञ से बात करने के लिए '6' लिखें।"
        ),
        "kn": (
            "⚠️ ಈ ಸಮಯದಲ್ಲಿ ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.\n\n"
            "ದಯವಿಟ್ಟು ಮತ್ತೊಂದು ಸ್ಪಷ್ಟ ಫೋಟೋ ಕಳುಹಿಸಿ, ಅಥವಾ ಕೃಷಿ ತಜ್ಞರ ಸಹಾಯಕ್ಕಾಗಿ '6' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "agri_question_prompt": {
        "en": (
            "🌱 *Agricultural Guidance & Advice*\n\n"
            "Ask any question about crops, irrigation, fertilizer dosage, pest control, or sowing seasons.\n\n"
            "You can type in English, Hindi, or Kannada. Examples:\n"
            "• 'How much water does paddy need?'\n"
            "• 'टमाटर में पत्ती मुड़ने की समस्या कैसे रोकें?'\n"
            "• 'ರಾಗಿ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?'\n\n"
            "Type 'menu' anytime to return."
        ),
        "hi": (
            "🌱 *फसल सलाह और कृषि मार्गदर्शन*\n\n"
            "फसलों, सिंचाई, खाद की मात्रा, कीट नियंत्रण या बुवाई के मौसम के बारे में कोई भी प्रश्न पूछें।\n\n"
            "उदाहरण:\n"
            "• 'टमाटर में पत्ता मरोड़ रोग कैसे रोकें?'\n"
            "• 'धान में यूरिया कब डालना चाहिए?'\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🌱 *ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸಲಹೆ*\n\n"
            "ಬೆಳೆಗಳು, ನೀರಾವರಿ, ರಸಗೊಬ್ಬರ ಬಳಕೆ, ಕೀಟ ನಿಯಂತ್ರಣ ಅಥವಾ ಬಿತ್ತನೆ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.\n\n"
            "ಉದಾಹರಣೆಗೆ:\n"
            "• 'ಭತ್ತದ ಬೆಳೆಗೆ ಎಷ್ಟು ನೀರು ಬೇಕು?'\n"
            "• 'ಟೊಮೆಟೊ ಎಲೆ ಸುರುಟು ರೋಗಕ್ಕೆ ಪರಿಹಾರವೇನು?'\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "weather_info": {
        "en": (
            "🌤️ *Weather Updates & Alerts*\n\n"
            "Stay ahead of rainfall, temperature shifts, and humidity for your farm.\n\n"
            "View detailed local weather forecasts and farming advisories on KisaanBuddy:\n{url}\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "🌤️ *मौसम की जानकारी और चेतावनी*\n\n"
            "अपने खेत के लिए बारिश, तापमान और हवा की सटीक जानकारी प्राप्त करें।\n\n"
            "विस्तृत मौसम पूर्वानुमान और कृषि सलाह देखने के लिए लिंक खोलें:\n{url}\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🌤️ *ಹವಾಮಾನ ಮಾಹಿತಿ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು*\n\n"
            "ನಿಮ್ಮ ಜಮೀನಿನ ಮಳೆ ಮುನ್ಸೂಚನೆ, ತಾಪಮಾನ ಮತ್ತು ತೇವಾಂಶದ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.\n\n"
            "ವಿವರವಾದ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳಿಗಾಗಿ ಈ ಲಿಂಕ್ ತೆರೆಯಿರಿ:\n{url}\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "mandi_info": {
        "en": (
            "📊 *Mandi & Market Prices*\n\n"
            "Access real-time commodity prices across APMC mandis in India.\n\n"
            "Check live prices, modal rates, and market trends:\n{url}\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "📊 *मंडी भाव और बाजार मूल्य*\n\n"
            "देशभर की APMC मंडियों के ताज़ा फसल भाव और रुझान देखें।\n\n"
            "लाइव मंडी भाव देखने के लिए लिंक खोलें:\n{url}\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "📊 *ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮಂಡಿ ದರಗಳು*\n\n"
            "ದೇಶದ APMC ಮಾರುಕಟ್ಟೆಗಳ ಲೈವ್ ಬೆಲೆಗಳು ಮತ್ತು ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ:\n{url}\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "schemes_info": {
        "en": (
            "🏛️ *Government Agricultural Schemes*\n\n"
            "Discover verified central and state government schemes (PM-KISAN, PMFBY, drip irrigation subsidies, etc.).\n\n"
            "Check your eligibility and application steps:\n{url}\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "🏛️ *सरकारी कृषि योजनाएं*\n\n"
            "केंद्र और राज्य सरकार की योजनाओं (PM-किसान, फसल बीमा, ड्रिप सिंचाई सब्सिडी) की सत्यापित जानकारी प्राप्त करें।\n\n"
            "पात्रता और आवेदन प्रक्रिया देखने के लिए लिंक खोलें:\n{url}\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🏛️ *ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು*\n\n"
            "ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಸಬ್ಸಿಡಿ ಸೇರಿದಂತೆ ಪ್ರಮುಖ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ವಿವರಗಳನ್ನು ತಿಳಿಯಿರಿ:\n{url}\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "support_created": {
        "en": (
            "👨‍🌾 *Human Support Request Registered*\n\n"
            "Your assistance request has been recorded.\n"
            "• Ticket ID: *{ticket_id}*\n"
            "• Status: OPEN\n\n"
            "A KisaanBuddy agricultural support agent or local KVK specialist has been notified. They will review your query.\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "👨‍🌾 *सहायता अनुरोध दर्ज किया गया*\n\n"
            "आपका अनुरोध सफलतापूर्वक दर्ज कर लिया गया है।\n"
            "• टिकट आईडी: *{ticket_id}*\n"
            "• स्थिति: खुला (OPEN)\n\n"
            "किसानबडी सहायता टीम या स्थानीय कृषि विज्ञान केंद्र (KVK) विशेषज्ञ को सूचित कर दिया गया है। वे जल्द ही आपसे संपर्क करेंगे।\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "👨‍🌾 *ಮಾನವ ಬೆಂಬಲ ವಿನಂತಿ ದಾಖಲಾಗಿದೆ*\n\n"
            "ನಿಮ್ಮ ಸಹಾಯದ ವಿನಂತಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ.\n"
            "• ಟಿಕೆಟ್ ಐಡಿ: *{ticket_id}*\n"
            "• ಸ್ಥಿತಿ: ತೆರೆದಿದೆ (OPEN)\n\n"
            "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಬೆಂಬಲ ತಂಡ ಅಥವಾ ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರದ ತಜ್ಞರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "language_selection_prompt": {
        "en": (
            "🌐 *Language Selection / भाषा चुनें / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ*\n\n"
            "Please select your preferred language:\n\n"
            "1. English\n"
            "2. हिन्दी (Hindi)\n"
            "3. ಕನ್ನಡ (Kannada)\n\n"
            "Reply with 1, 2, or 3."
        ),
        "hi": (
            "🌐 *भाषा चयन*\n\n"
            "कृपया अपनी पसंदीदा भाषा चुनें:\n\n"
            "1. English\n"
            "2. हिन्दी (Hindi)\n"
            "3. ಕನ್ನಡ (Kannada)\n\n"
            "1, 2, या 3 लिखकर उत्तर दें।"
        ),
        "kn": (
            "🌐 *ಭಾಷೆ ಆಯ್ಕೆ*\n\n"
            "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆರಿಸಿ:\n\n"
            "1. English\n"
            "2. हिन्दी (Hindi)\n"
            "3. ಕನ್ನಡ (Kannada)\n\n"
            "1, 2, ಅಥವಾ 3 ಎಂದು ಉತ್ತರಿಸಿ."
        ),
    },
    "language_updated": {
        "en": "✅ Language set to English. Welcome! Type 'menu' to begin.",
        "hi": "✅ भाषा बदलकर हिन्दी कर दी गई है। स्वागत है! शुरू करने के लिए 'menu' लिखें।",
        "kn": "✅ ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ. ಸುಸ್ವಾಗತ! ಪ್ರಾರಂಭಿಸಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ.",
    },
    "unknown_input": {
        "en": (
            "I didn't quite catch that. Please choose an option from the menu, or reply with a number (1-6).\n\n"
            "Type 'menu' to view options, or '6' for human assistance."
        ),
        "hi": (
            "माफ़ कीजिए, हम समझ नहीं पाए। कृपया मेनू से विकल्प चुनें या संख्या (1-6) लिखकर भेजें।\n\n"
            "विकल्प देखने के लिए 'menu' लिखें या सहायता के लिए '6' लिखें।"
        ),
        "kn": (
            "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೆನುವಿನಿಂದ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಸಂಖ್ಯೆ (1-6) ಕಳುಹಿಸಿ.\n\n"
            "ಮೆನು ನೋಡಲು 'menu' ಅಥವಾ ಬೆಂಬಲಕ್ಕಾಗಿ '6' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "session_expired": {
        "en": "⏳ Your previous session has timed out. Welcome back! Type 'menu' to see options.",
        "hi": "⏳ आपका सत्र समाप्त हो गया था। पुनः स्वागत है! विकल्प देखने के लिए 'menu' लिखें।",
        "kn": "⏳ ನಿಮ್ಮ ಹಿಂದಿನ ಸೆಶನ್ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಸುಸ್ವಾಗತ! ಆಯ್ಕೆಗಳನ್ನು ನೋಡಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ.",
    },
}

# 6 Main Menu items
MENU_ITEMS = [
    {
        "id": "menu_crop_doctor",
        "num": "1",
        "title": {
            "en": "1. Crop Doctor 🌿",
            "hi": "1. क्रॉप डॉक्टर 🌿",
            "kn": "1. ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ 🌿",
        },
        "desc": {
            "en": "Photo-based plant disease diagnosis",
            "hi": "फोटो द्वारा पौधे की बीमारी पहचानें",
            "kn": "ಫೋಟೋ ಮೂಲಕ ಬೆಳೆ ರೋಗ ಪತ್ತೆ",
        },
    },
    {
        "id": "menu_weather",
        "num": "2",
        "title": {
            "en": "2. Weather Updates 🌤️",
            "hi": "2. मौसम पूर्वानुमान 🌤️",
            "kn": "2. ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ 🌤️",
        },
        "desc": {
            "en": "Local rain & temperature alerts",
            "hi": "स्थानीय वर्षा और तापमान अलर्ट",
            "kn": "ಸ್ಥಳೀಯ ಮಳೆ ಮತ್ತು ತಾಪಮಾನ ಎಚ್ಚರಿಕೆ",
        },
    },
    {
        "id": "menu_guidance",
        "num": "3",
        "title": {
            "en": "3. Crop Guidance 🌱",
            "hi": "3. कृषि मार्गदर्शन 🌱",
            "kn": "3. ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ 🌱",
        },
        "desc": {
            "en": "Farming, fertilizer & pest advice",
            "hi": "खाद, सिंचाई व कीट नियंत्रण सलाह",
            "kn": "ರಸಗೊಬ್ಬರ, ಕೀಟ ನಿಯಂತ್ರಣ ಸಲಹೆ",
        },
    },
    {
        "id": "menu_mandi",
        "num": "4",
        "title": {
            "en": "4. Market Prices 📊",
            "hi": "4. मंडी भाव 📊",
            "kn": "4. ಮಾರುಕಟ್ಟೆ ದರ 📊",
        },
        "desc": {
            "en": "Live APMC commodity rates",
            "hi": "ताज़ा APMC मंडी फसल भाव",
            "kn": "ಲೈವ್ APMC ಮಂಡಿ ಬೆಲೆಗಳು",
        },
    },
    {
        "id": "menu_schemes",
        "num": "5",
        "title": {
            "en": "5. Govt Schemes 🏛️",
            "hi": "5. सरकारी योजनाएं 🏛️",
            "kn": "5. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು 🏛️",
        },
        "desc": {
            "en": "Subsidies, PM-Kisan & insurance",
            "hi": "सब्सिडी, पीएम-किसान व फसल बीमा",
            "kn": "ಸಬ್ಸಿಡಿ, ಪಿಎಂ-ಕಿಸಾನ್ ಯೋಜನೆಗಳು",
        },
    },
    {
        "id": "menu_support",
        "num": "6",
        "title": {
            "en": "6. Talk to Support 👨‍🌾",
            "hi": "6. सहायता से बात करें 👨‍🌾",
            "kn": "6. ತಜ್ಞರ ನೆರವು 👨‍🌾",
        },
        "desc": {
            "en": "Connect with an expert agent",
            "hi": "विशेषज्ञ से बात करें",
            "kn": "ಕೃಷಿ ತಜ್ಞರೊಂದಿಗೆ ಮಾತನಾಡಿ",
        },
    },
]


def get_text(key: str, lang: str = DEFAULT_LANGUAGE, **kwargs: Any) -> str:
    """Retrieves localized text with keyword formatting."""
    lang_code = lang if lang in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE
    template = MESSAGES.get(key, {}).get(lang_code) or MESSAGES.get(key, {}).get(DEFAULT_LANGUAGE, "")
    if kwargs:
        try:
            return template.format(**kwargs)
        except Exception:
            return template
    return template


def build_text_menu(lang: str = DEFAULT_LANGUAGE) -> str:
    """Builds farmer-friendly text menu for WhatsApp clients that don't render interactive lists."""
    welcome = get_text("welcome", lang)
    lines = [welcome, ""]
    for item in MENU_ITEMS:
        title = item["title"].get(lang, item["title"]["en"])
        desc = item["desc"].get(lang, item["desc"]["en"])
        lines.append(f"*{title}*\n_{desc}_\n")
    lines.append(get_text("menu_footer", lang))
    return "\n".join(lines)


def parse_menu_selection(text: str) -> Optional[str]:
    """Parses user input to identify menu selection (by number, keyword, or interactive ID)."""
    if not text:
        return None
    normalized = text.strip().lower()

    if normalized in ("1", "crop doctor", "crop_doctor", "menu_crop_doctor", "डॉक्टर", "ರೋಗ"):
        return "crop_doctor"
    if normalized in ("2", "weather", "weather updates", "menu_weather", "मौसम", "ಹವಾಮಾನ"):
        return "weather"
    if normalized in ("3", "crop guidance", "guidance", "menu_guidance", "सलाह", "ಸಲಹೆ"):
        return "guidance"
    if normalized in ("4", "market prices", "mandi", "menu_mandi", "मंडी", "ಮಂಡಿ"):
        return "mandi"
    if normalized in ("5", "govt schemes", "schemes", "menu_schemes", "योजना", "ಯೋಜನೆ"):
        return "schemes"
    if normalized in ("6", "talk to support", "support", "help", "menu_support", "सहायता", "मदद", "ಸಹಾಯ"):
        return "support"
    if normalized in ("language", "lang", "भाषा", "ಭಾಷೆ"):
        return "language"
    return None


def detect_language_choice(text: str) -> Optional[str]:
    """Detects language choice from user reply (e.g. '1', 'English', '2', 'Hindi', etc.)."""
    if not text:
        return None
    normalized = text.strip().lower()
    if normalized in ("1", "en", "english", "angrezi", "ಇಂಗ್ಲಿಷ್"):
        return "en"
    if normalized in ("2", "hi", "hindi", "हिन्दी", "हिंदी", "ಹಿಂದಿ"):
        return "hi"
    if normalized in ("3", "kn", "kannada", "ಕನ್ನಡ", "कन्नड़"):
        return "kn"
    return None
