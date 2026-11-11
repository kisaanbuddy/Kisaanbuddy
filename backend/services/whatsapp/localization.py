"""Multilingual dictionary and localization engine for WhatsApp KisaanBuddy.

Supports English (en), Hindi (hi), and Kannada (kn) across all farmer conversation paths.
Maintains authentic, practical, and respectful agricultural language suitable for Indian farmers.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

# Supported language codes
SUPPORTED_LANGUAGES = ["en", "hi", "kn"]
DEFAULT_LANGUAGE = "en"

# Multilingual strings
MESSAGES: Dict[str, Dict[str, str]] = {
    "first_time_welcome": {
        "en": (
            "Namaste! Welcome to KisaanBuddy 🌾\n\n"
            "Your authentic agricultural assistant is here to support you.\n\n"
            "Please select your language to get started:"
        ),
        "hi": (
            "नमस्ते! किसानबडी (KisaanBuddy) 🌾 में आपका स्वागत है।\n\n"
            "आपका प्रामाणिक कृषि सहायक आपकी सहायता के लिए तैयार है।\n\n"
            "कृपया शुरू करने के लिए अपनी भाषा चुनें:"
        ),
        "kn": (
            "ನಮಸ್ಕಾರ! ಕಿಸಾನ್‌ಬಡ್ಡಿಗೆ (KisaanBuddy) 🌾 ಸುಸ್ವಾಗತ.\n\n"
            "ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಕೃಷಿ ಸಹಾಯಕ ನಿಮಗೆ ನೆರವಾಗಲು ಸಿದ್ಧರಾಗಿದ್ದಾರೆ.\n\n"
            "ದಯವಿಟ್ಟು ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:"
        ),
    },
    "returning_welcome": {
        "en": (
            "Namaste! Welcome back to KisaanBuddy 🌾\n\n"
            "How can we help your farm today?"
        ),
        "hi": (
            "नमस्ते! किसानबडी (KisaanBuddy) 🌾 में पुनः स्वागत है।\n\n"
            "आज हम आपकी खेती के लिए क्या सहायता कर सकते हैं?"
        ),
        "kn": (
            "ನಮಸ್ಕಾರ! ಕಿಸಾನ್‌ಬಡ್ಡಿಗೆ (KisaanBuddy) 🌾 ಮರಳಿ ಸುಸ್ವಾಗತ.\n\n"
            "ಇಂದು ನಿಮ್ಮ ಕೃಷಿಗೆ ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
        ),
    },
    "welcome": {
        "en": (
            "Namaste! Welcome to KisaanBuddy 🌾\n\n"
            "Choose a service from below:"
        ),
        "hi": (
            "नमस्ते! किसानबडी (KisaanBuddy) 🌾\n\n"
            "कृपया नीचे दिए गए विकल्पों में से चुनें:"
        ),
        "kn": (
            "ನಮಸ್ಕಾರ! ಕಿಸಾನ್‌ಬಡ್ಡಿ (KisaanBuddy) 🌾\n\n"
            "ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ:"
        ),
    },
    "menu_header": {
        "en": "KisaanBuddy Menu",
        "hi": "किसानबडी मुख्य मेनू",
        "kn": "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಮುಖ್ಯ ಮೆನು",
    },
    "menu_footer": {
        "en": "Reply with 1-7 or type 'menu' anytime.",
        "hi": "1-7 लिखकर उत्तर दें या कभी भी 'menu' लिखें।",
        "kn": "1-7 ಎಂದು ಉತ್ತರಿಸಿ ಅಥವಾ ಯಾವಾಗ ಬೇಕಾದರೂ 'menu' ಟೈಪ್ ಮಾಡಿ.",
    },
    "select_option": {
        "en": "Select an option from below or reply with a number (1-7):",
        "hi": "नीचे से कोई विकल्प चुनें या नंबर (1-7) लिखकर भेजें:",
        "kn": "ಕೆಳಗಿನ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ ಅಥವಾ ಸಂಖ್ಯೆ (1-7) ಕಳುಹಿಸಿ:",
    },
    "language_selection_prompt": {
        "en": (
            "🌐 *Language Selection / भाषा चुनें / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ*\n\n"
            "Please select your preferred language:\n\n"
            "1. English\n"
            "2. हिन्दी (Hindi)\n"
            "3. ಕನ್ನಡ (Kannada)\n\n"
            "Reply with *1*, *2*, or *3*."
        ),
        "hi": (
            "🌐 *भाषा चयन / Language Selection*\n\n"
            "कृपया अपनी पसंदीदा भाषा चुनें:\n\n"
            "1. English\n"
            "2. हिन्दी (Hindi)\n"
            "3. ಕನ್ನಡ (Kannada)\n\n"
            "*1*, *2*, या *3* लिखकर उत्तर दें।"
        ),
        "kn": (
            "🌐 *ಭಾಷೆ ಆಯ್ಕೆ / Language Selection*\n\n"
            "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆರಿಸಿ:\n\n"
            "1. English\n"
            "2. हिन्दी (Hindi)\n"
            "3. ಕನ್ನಡ (Kannada)\n\n"
            "*1*, *2*, ಅಥವಾ *3* ಎಂದು ಉತ್ತರಿಸಿ."
        ),
    },
    "language_updated": {
        "en": "✅ Language set to English. Welcome to KisaanBuddy!",
        "hi": "✅ भाषा हिन्दी में सेट कर दी गई है। किसानबडी में आपका स्वागत है!",
        "kn": "✅ ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ. ಕಿಸಾನ್‌ಬಡ್ಡಿಗೆ ಸುಸ್ವಾಗತ!",
    },
    "help_message": {
        "en": (
            "🌾 *KisaanBuddy Farmer Assistant Guide*\n\n"
            "Available Services:\n"
            "• *1. Crop Doctor* — Upload a leaf/plant photo for AI disease diagnosis and verified ICAR remedies.\n"
            "• *2. Ask Agriculture Question* — Farming, fertilizer, pest control, or sowing advice in natural language.\n"
            "• *3. Weather Updates* — Location-based rainfall, temperature, and farming advisories.\n"
            "• *4. Mandi Prices* — Real-time APMC commodity rates from AGMARKNET.\n"
            "• *5. Government Schemes* — Verified subsidies, PM-Kisan, PMFBY details and eligibility.\n"
            "• *6. Talk to Support* — Log an assistance ticket with agricultural specialists.\n"
            "• *7. Visit Website* — Open www.kisaanbuddy.com\n\n"
            "*Universal Commands:*\n"
            "• *MENU* — Return to main menu from any step\n"
            "• *LANGUAGE* — Change English, Hindi, or Kannada\n"
            "• *HELP* — Show this guidance message\n"
            "• *STOP* — Opt out of promotional/announcement messages\n"
            "• *START* — Opt in to promotional updates and announcements"
        ),
        "hi": (
            "🌾 *किसानबडी कृषि सहायक मार्गदर्शिका*\n\n"
            "उपलब्ध सेवाएं:\n"
            "• *1. क्रॉप डॉक्टर* — पौधे/पत्ती की फोटो भेजें और रोग व उपचार जानें।\n"
            "• *2. कृषि प्रश्न पूछें* — बुवाई, खाद, सिंचाई व कीट नियंत्रण के सवाल पूछें।\n"
            "• *3. मौसम पूर्वानुमान* — स्थान-आधारित बारिश, तापमान व कृषि सलाह।\n"
            "• *4. मंडी भाव* — APMC मंडियों के ताज़ा और सत्यापित फसल भाव।\n"
            "• *5. सरकारी योजनाएं* — पीएम-किसान, फसल बीमा, सब्सिडी व पात्रता।\n"
            "• *6. सहायता से बात करें* — कृषि विशेषज्ञों से सहायता अनुरोध दर्ज करें।\n"
            "• *7. पोर्टल पर जाएं* — वेबसाइट www.kisaanbuddy.com खोलें।\n\n"
            "*प्रमुख कमांड:*\n"
            "• *MENU* — कहीं से भी मुख्य मेनू पर लौटें\n"
            "• *LANGUAGE* — भाषा (हिन्दी/English/ಕನ್ನಡ) बदलें\n"
            "• *HELP* — यह सहायता संदेश देखें\n"
            "• *STOP* — प्रचार संदेश और अपडेट बंद करें\n"
            "• *START* — कृषि अपडेट व घोषणाएं पुनः चालू करें"
        ),
        "kn": (
            "🌾 *ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕೃಷಿ ಸಹಾಯಕ ಮಾರ್ಗದರ್ಶಿ*\n\n"
            "ಲಭ್ಯವಿರುವ ಸೇವೆಗಳು:\n"
            "• *1. ಕ್ರಾಪ್ ಡಾಕ್ಟರ್* — ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಪರಿಹಾರಕ್ಕಾಗಿ ಫೋಟೋ ಕಳುಹಿಸಿ.\n"
            "• *2. ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ* — ರಸಗೊಬ್ಬರ, ನೀರಾವರಿ, ಕೀಟ ನಿಯಂತ್ರಣ ಸಲಹೆ ಪಡೆಯಿರಿ.\n"
            "• *3. ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ* — ಮಳೆ, ತಾಪಮಾನ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳು.\n"
            "• *4. ಮಾರುಕಟ್ಟೆ ದರ* — ನೈಜ APMC ಮಂಡಿ ಬೆಲೆಗಳು.\n"
            "• *5. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು* — ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಸಬ್ಸಿಡಿ ವಿವರಗಳು.\n"
            "• *6. ತಜ್ಞರ ನೆರವು* — ಕೃಷಿ ಅಧಿಕಾರಿಗಳಿಗೆ ಸಹಾಯದ ವಿನಂತಿ ಕಳುಹಿಸಿ.\n"
            "• *7. ವೆಬ್‌ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ* — www.kisaanbuddy.com ತೆರೆಯಿರಿ.\n\n"
            "*ಉಪಯುಕ್ತ ಕಮಾಂಡ್‌ಗಳು:*\n"
            "• *MENU* — ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು\n"
            "• *LANGUAGE* — ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಲು\n"
            "• *HELP* — ಈ ಮಾರ್ಗದರ್ಶನ ನೋಡಲು\n"
            "• *STOP* — ಪ್ರಚಾರ ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿಲ್ಲಿಸಲು\n"
            "• *START* — ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಪುನರಾರಂಭಿಸಲು"
        ),
    },
    "stop_confirmation": {
        "en": (
            "🛑 *Promotional Notifications Paused*\n\n"
            "You will no longer receive promotional updates or non-essential announcements.\n\n"
            "• Your active farming queries, Crop Doctor scans, and support services remain 100% available.\n"
            "• Reply *START* anytime to resume farming alerts and feature updates.\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "🛑 *प्रचार सूचनाएं रोक दी गई हैं*\n\n"
            "आपको अब प्रचार या गैर-जरूरी सूचनाएं नहीं भेजी जाएंगी।\n\n"
            "• आपकी सक्रिय खेती सलाह, क्रॉप डॉक्टर जांच व सहायता सेवाएं हमेशा चालू रहेंगी।\n"
            "• कृषि अलर्ट और नए अपडेट पुनः शुरू करने के लिए कभी भी *START* लिखें।\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🛑 *ಪ್ರಚಾರ ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ*\n\n"
            "ನಿಮಗೆ ಇನ್ನು ಮುಂದೆ ಪ್ರಚಾರದ ನವೀಕರಣಗಳು ಬರುವುದಿಲ್ಲ.\n\n"
            "• ನಿಮ್ಮ ಬೆಳೆ ವೈದ್ಯ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಕೃಷಿ ಪ್ರಶ್ನೆಗಳ ಸೇವೆಗಳು ಎಂದಿನಂತೆ ಮುಂದುವರಿಯುತ್ತವೆ.\n"
            "• ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪುನರಾರಂಭಿಸಲು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ *START* ಎಂದು ಕಳುಹಿಸಿ.\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "start_confirmation": {
        "en": (
            "✅ *Farming Updates & Announcements Resumed*\n\n"
            "You are now subscribed to authentic KisaanBuddy farming advisories, seasonal tips, and platform updates.\n\n"
            "Reply *STOP* anytime to opt out of promotional notifications.\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "✅ *कृषि अपडेट व सूचनाएं पुनः सक्रिय*\n\n"
            "आपको किसानबडी की सत्यापित कृषि सलाह, मौसमी सुझाव और नए फीचर्स की जानकारी मिलती रहेगी।\n\n"
            "प्रचार सूचनाएं रोकने के लिए कभी भी *STOP* लिखें।\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "✅ *ಕೃಷಿ ಮಾಹಿತಿ ಮತ್ತು ನವೀಕರಣಗಳು ಸಕ್ರಿಯಗೊಂಡಿವೆ*\n\n"
            "ನೀವು ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕೃಷಿ ಸಲಹೆಗಳು ಮತ್ತು ಹೊಸ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ನೋಂದಾಯಿಸಿಕೊಂಡಿದ್ದೀರಿ.\n\n"
            "ಬೇಡವೆಂದಲ್ಲಿ ಯಾವಾಗ ಬೇಕಾದರೂ *STOP* ಎಂದು ಕಳುಹಿಸಿ.\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
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
            "🌱 *Ask an Agriculture Question*\n\n"
            "Ask any question about crops, irrigation, fertilizer dosage, pest management, or sowing seasons.\n\n"
            "Examples:\n"
            "• 'How much water does paddy need at flowering stage?'\n"
            "• 'टमाटर में पत्ती मुड़ने की समस्या कैसे रोकें?'\n"
            "• 'ರಾಗಿ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?'\n\n"
            "Type 'menu' anytime to return."
        ),
        "hi": (
            "🌱 *फसल सलाह और कृषि प्रश्न*\n\n"
            "फसलों, सिंचाई, खाद की मात्रा, कीट नियंत्रण या बुवाई के बारे में कोई भी प्रश्न पूछें।\n\n"
            "उदाहरण:\n"
            "• 'टमाटर में पत्ता मरोड़ रोग कैसे रोकें?'\n"
            "• 'धान में यूरिया कब डालना चाहिए?'\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🌱 *ಕೃಷಿ ಪ್ರಶ್ನೆ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ*\n\n"
            "ಬೆಳೆಗಳು, ನೀರಾವರಿ, ರಸಗೊಬ್ಬರ ಬಳಕೆ, ಕೀಟ ನಿಯಂತ್ರಣ ಅಥವಾ ಬಿತ್ತನೆ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.\n\n"
            "ಉದಾಹರಣೆಗೆ:\n"
            "• 'ಭತ್ತದ ಬೆಳೆಗೆ ಎಷ್ಟು ನೀರು ಬೇಕು?'\n"
            "• 'ಟೊಮೆಟೊ ಎಲೆ ಸುರುಟು ರೋಗಕ್ಕೆ ಪರಿಹಾರವೇನು?'\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "weather_prompt": {
        "en": (
            "🌤️ *Weather Updates & Advisories*\n\n"
            "Please reply with your Village, City, District, or PIN Code to view local weather and farming advisories.\n\n"
            "Or view live weather directly on KisaanBuddy:\n{url}\n\n"
            "(Type 'menu' to return to the main menu.)"
        ),
        "hi": (
            "🌤️ *मौसम पूर्वानुमान और कृषि सलाह*\n\n"
            "अपने क्षेत्र का मौसम जानने के लिए कृपया अपने गांव, शहर, जिले का नाम या पिन कोड लिखकर भेजें।\n\n"
            "या किसानबडी पर सीधे मौसम देखें:\n{url}\n\n"
            "(मुख्य मेनू के लिए 'menu' लिखें।)"
        ),
        "kn": (
            "🌤️ *ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆ*\n\n"
            "ಸ್ಥಳೀಯ ಹವಾಮಾನವನ್ನು ತಿಳಿಯಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಗ್ರಾಮ, ನಗರ, ಜಿಲ್ಲೆಯ ಹೆಸರು ಅಥವಾ ಪಿನ್ ಕೋಡ್ ಕಳುಹಿಸಿ.\n\n"
            "ಅಥವಾ ನೇರವಾಗಿ ಕಿಸಾನ್‌ಬಡ್ಡಿಯಲ್ಲಿ ಹವಾಮಾನ ನೋಡಿ:\n{url}\n\n"
            "(ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ.)"
        ),
    },
    "weather_info": {
        "en": (
            "🌤️ *Weather Forecast & Farming Advisory*\n\n"
            "• *Location:* {location}\n"
            "• *Condition:* {condition}\n"
            "• *Temperature:* {temp}°C\n"
            "• *Rainfall Probability:* {rain_prob}%\n"
            "• *Humidity:* {humidity}%\n"
            "• *Wind Speed:* {wind_kph} km/h\n\n"
            "🌾 *Field Advisory:*\n{advisory}\n\n"
            "📊 *View Full 7-Day Farm Forecast:*\n{url}\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "🌤️ *मौसम पूर्वानुमान और कृषि सलाह*\n\n"
            "• *स्थान:* {location}\n"
            "• *मौसम:* {condition}\n"
            "• *तापमान:* {temp}°C\n"
            "• *बारिश की संभावना:* {rain_prob}%\n"
            "• *हवा में नमी:* {humidity}%\n"
            "• *हवा की गति:* {wind_kph} किमी/घंटा\n\n"
            "🌾 *खेत कार्य सलाह:*\n{advisory}\n\n"
            "📊 *अगले 7 दिनों का विस्तृत मौसम देखें:*\n{url}\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🌤️ *ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆ*\n\n"
            "• *ಸ್ಥಳ:* {location}\n"
            "• *ಸ್ಥಿತಿ:* {condition}\n"
            "• *ತಾಪಮಾನ:* {temp}°C\n"
            "• *ಮಳೆಯ ಸಂಭವನೀಯತೆ:* {rain_prob}%\n"
            "• *ಆರ್ದ್ರತೆ:* {humidity}%\n"
            "• *ಗಾಳಿಯ ವೇಗ:* {wind_kph} ಕಿಮೀ/ಗಂಟೆ\n\n"
            "🌾 *ಕೃಷಿ ಸಲಹೆ:*\n{advisory}\n\n"
            "📊 *ಸಂಪೂರ್ಣ 7 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಗಾಗಿ:*\n{url}\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "weather_fallback": {
        "en": (
            "🌤️ *Weather Updates*\n\n"
            "Track rainfall, humidity, and temperature alerts for your farm.\n\n"
            "View live forecasts and agricultural weather advisories on KisaanBuddy:\n{url}\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "🌤️ *मौसम की जानकारी*\n\n"
            "अपने खेत के लिए बारिश, तापमान और हवा की सटीक जानकारी प्राप्त करें:\n{url}\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🌤️ *ಹವಾಮಾನ ಮಾಹಿತಿ*\n\n"
            "ನಿಮ್ಮ ಜಮೀನಿನ ಮಳೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ತಾಪಮಾನದ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ:\n{url}\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "mandi_prompt": {
        "en": (
            "📊 *Mandi & Market Prices*\n\n"
            "Please reply with the crop or commodity name (e.g. Wheat, Tomato, Onion, Cotton, Paddy) or district to check recent APMC prices.\n\n"
            "Or view live APMC mandi prices on KisaanBuddy:\n{url}\n\n"
            "(Type 'menu' to return to the main menu.)"
        ),
        "hi": (
            "📊 *मंडी भाव और बाजार मूल्य*\n\n"
            "ताज़ा APMC मंडी भाव जानने के लिए कृपया फसल या वस्तु का नाम (जैसे गेहूं, टमाटर, प्याज, धान, कपास) या जिला लिखकर भेजें।\n\n"
            "या किसानबडी पर सीधे मंडी भाव देखें:\n{url}\n\n"
            "(मुख्य मेनू के लिए 'menu' लिखें।)"
        ),
        "kn": (
            "📊 *ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮಂಡಿ ದರಗಳು*\n\n"
            "ಇತ್ತೀಚಿನ APMC ದರಗಳನ್ನು ತಿಳಿಯಲು ಬೆಳೆಯ ಹೆಸರು (ಉದಾ. ಭತ್ತ, ರಾಗಿ, ಈರುಳ್ಳಿ, ಟೊಮೆಟೊ, ಹತ್ತಿ) ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ಕಳುಹಿಸಿ.\n\n"
            "ಅಥವಾ ನೇರವಾಗಿ ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ:\n{url}\n\n"
            "(ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ.)"
        ),
    },
    "mandi_info": {
        "en": (
            "📊 *Mandi & Market Prices*\n\n"
            "{records_text}\n\n"
            "🔍 *Explore all APMC markets & price trends on KisaanBuddy:*\n{url}\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "📊 *मंडी भाव और बाजार मूल्य*\n\n"
            "{records_text}\n\n"
            "🔍 *सभी मंडियों के लाइव भाव और चार्ट देखने के लिए लिंक खोलें:*\n{url}\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "📊 *ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮಂಡಿ ದರಗಳು*\n\n"
            "{records_text}\n\n"
            "🔍 *ಎಲ್ಲಾ ಮಾರುಕಟ್ಟೆ ದರಗಳು ಮತ್ತು ಪ್ರವೃತ್ತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲು:*\n{url}\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "mandi_fallback": {
        "en": (
            "📊 *Mandi & Market Prices*\n\n"
            "Real-time commodity arrivals and modal prices across Indian APMC mandis.\n\n"
            "Check live rates, price alerts, and market trends:\n{url}\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "📊 *मंडी भाव और बाजार मूल्य*\n\n"
            "देशभर की APMC मंडियों के ताज़ा फसल भाव और रुझान देखें:\n{url}\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "📊 *ಮಾರುಕಟ್ಟೆ ದರಗಳು*\n\n"
            "ದೇಶದ APMC ಮಾರುಕಟ್ಟೆಗಳ ಲೈವ್ ಬೆಲೆಗಳು ಮತ್ತು ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ:\n{url}\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "schemes_info": {
        "en": (
            "🏛️ *Verified Government Agricultural Schemes*\n\n"
            "1. *PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)*\n"
            "• Benefit: ₹6,000/year (3 installments of ₹2,000 directly to bank accounts)\n"
            "• Eligibility: Landholding farmer families with cultivable land\n"
            "• Official Portal: https://pmkisan.gov.in\n\n"
            "2. *PMFBY (Pradhan Mantri Fasal Bima Yojana)*\n"
            "• Benefit: Low-cost crop insurance against non-preventable natural risks\n"
            "• Farmer Premium: Capped at 1.5% - 2% for food/oilseed crops\n"
            "• Official Portal: https://pmfby.gov.in\n\n"
            "3. *PM-KMY (Pradhan Mantri Kisan Maandhan Yojana)*\n"
            "• Benefit: ₹3,000/month assured old-age pension after 60 years\n"
            "• Eligibility: Small & marginal farmers (18-40 years) with up to 2 ha land\n\n"
            "🔍 *Check your eligibility for 15+ central & state schemes on KisaanBuddy:*\n{url}\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "🏛️ *सत्यापित सरकारी कृषि योजनाएं*\n\n"
            "1. *पीएम-किसान (PM-KISAN)*\n"
            "• लाभ: ₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तों में सीधे बैंक खाते में)\n"
            "• पात्रता: खेती योग्य भूमि वाले सभी भूमिधारक किसान परिवार\n"
            "• आधिकारिक पोर्टल: https://pmkisan.gov.in\n\n"
            "2. *प्रधानमंत्री फसल बीमा योजना (PMFBY)*\n"
            "• लाभ: प्राकृतिक आपदाओं से फसल नुकसान पर व्यापक बीमा कवर\n"
            "• किसान प्रीमियम: केवल 1.5% - 2% (खाद्य व तिलहन फसलें)\n"
            "• आधिकारिक पोर्टल: https://pmfby.gov.in\n\n"
            "3. *पीएम किसान मानधन योजना (PM-KMY)*\n"
            "• लाभ: 60 वर्ष की आयु के बाद ₹3,000 प्रति माह सुनिश्चित पेंशन\n"
            "• पात्रता: 18-40 वर्ष के छोटे और सीमांत किसान (2 हेक्टेयर तक भूमि)\n\n"
            "🔍 *अपनी पात्रता जांचने और आवेदन करने के लिए लिंक खोलें:*\n{url}\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "🏛️ *ದೃಢೀಕೃತ ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು*\n\n"
            "1. *ಪಿಎಂ-ಕಿಸಾನ್ (PM-KISAN)*\n"
            "• ಸೌಲಭ್ಯ: ವಾರ್ಷಿಕ ₹6,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ (3 ಕಂತುಗಳಲ್ಲಿ)\n"
            "• ಅರ್ಹತೆ: ಸಾಗುವಳಿ ಭೂಮಿ ಹೊಂದಿರುವ ಎಲ್ಲಾ ರೈತ ಕುಟುಂಬಗಳು\n"
            "• ಅಧಿಕೃತ ತಾಣ: https://pmkisan.gov.in\n\n"
            "2. *ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ (PMFBY)*\n"
            "• ಸೌಲಭ್ಯ: ಅನಿರೀಕ್ಷಿತ ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳಿಂದ ಬೆಳೆ ನಷ್ಟಕ್ಕೆ ಸಮಗ್ರ ವಿಮೆ\n"
            "• ಅಧಿಕೃತ ತಾಣ: https://pmfby.gov.in\n\n"
            "3. *ಪಿಎಂ ಕಿಸಾನ್ ಮಾನ್‌ಧನ್ ಯೋಜನೆ (PM-KMY)*\n"
            "• ಸೌಲಭ್ಯ: 60 ವರ್ಷ ತುಂಬಿದ ನಂತರ ಮಾಸಿಕ ₹3,000 ನಿಶ್ಚಿತ ಪಿಂಚಣಿ\n"
            "• ಅರ್ಹತೆ: 18-40 ವಯಸ್ಸಿನ ಸಣ್ಣ ಮತ್ತು ಅಂಚಿನ ರೈತರು\n\n"
            "🔍 *ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ಈ ಲಿಂಕ್ ತೆರೆಯಿರಿ:*\n{url}\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "support_prompt": {
        "en": (
            "👨‍🌾 *KisaanBuddy Agricultural Support*\n\n"
            "Please describe your question or issue in detail (e.g. crop affected, symptoms, or problem faced).\n\n"
            "Our agricultural specialists review requests during working hours.\n\n"
            "(Type 'menu' anytime to return to the main menu.)"
        ),
        "hi": (
            "👨‍🌾 *किसानबडी कृषि सहायता*\n\n"
            "कृपया अपनी समस्या या प्रश्न का विवरण लिखकर भेजें (जैसे फसल का नाम, समस्या, या कोई कठिनाई)।\n\n"
            "हमारी कृषि सहायता टीम कार्य समय के दौरान इसकी समीक्षा करती है।\n\n"
            "(मुख्य मेनू पर लौटने के लिए 'menu' लिखें।)"
        ),
        "kn": (
            "👨‍🌾 *ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕೃಷಿ ತಜ್ಞರ ನೆರವು*\n\n"
            "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ಬರೆದು ಕಳುಹಿಸಿ (ಬೆಳೆಯ ಹೆಸರು, ರೋಗಲಕ್ಷಣ ಅಥವಾ ಸಮಸ್ಯೆ).\n\n"
            "ನಮ್ಮ ಕೃಷಿ ಬೆಂಬಲ ತಂಡವು ಕೆಲಸದ ಸಮಯದಲ್ಲಿ ಇದನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.\n\n"
            "(ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ.)"
        ),
    },
    "support_created": {
        "en": (
            "👨‍🌾 *Support Request Registered*\n\n"
            "Your assistance request has been recorded:\n"
            "• Ticket ID: *{ticket_id}*\n"
            "• Status: OPEN\n\n"
            "Our agricultural support team reviews recorded tickets during working hours. We will follow up directly with your query.\n\n"
            "Type 'menu' to return to the main menu."
        ),
        "hi": (
            "👨‍🌾 *सहायता अनुरोध दर्ज किया गया*\n\n"
            "आपका अनुरोध सफलतापूर्वक दर्ज कर लिया गया है:\n"
            "• टिकट आईडी: *{ticket_id}*\n"
            "• स्थिति: खुला (OPEN)\n\n"
            "हमारी कृषि सहायता टीम कार्य समय में दर्ज टिकटों की समीक्षा करती है और आपसे संपर्क करेगी।\n\n"
            "मुख्य मेनू के लिए 'menu' लिखें।"
        ),
        "kn": (
            "👨‍🌾 *ಮಾನವ ಬೆಂಬಲ ವಿನಂತಿ ದಾಖಲಾಗಿದೆ*\n\n"
            "ನಿಮ್ಮ ಸಹಾಯದ ವಿನಂತಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ:\n"
            "• ಟಿಕೆಟ್ ಐಡಿ: *{ticket_id}*\n"
            "• ಸ್ಥಿತಿ: ತೆರೆದಿದೆ (OPEN)\n\n"
            "ನಮ್ಮ ಕೃಷಿ ತಜ್ಞರ ತಂಡವು ಕೆಲಸದ ಸಮಯದಲ್ಲಿ ಪರಿಶೀಲಿಸಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.\n\n"
            "ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "website_info": {
        "en": (
            "🌐 *Welcome to KisaanBuddy Web Portal*\n\n"
            "Access our full agricultural platform including satellite farm health, real-time APMC mandi charts, community discussion, and crop calculators:\n\n"
            "👉 {url}\n\n"
            "Type 'menu' anytime to return to the WhatsApp menu."
        ),
        "hi": (
            "🌐 *किसानबडी वेब पोर्टल*\n\n"
            "सैटेलाइट खेत निगरानी, लाइव मंडी भाव ग्राफ, किसान समुदाय और कृषि कैलकुलेटर के लिए पोर्टल पर जाएं:\n\n"
            "👉 {url}\n\n"
            "व्हाट्सएप मेनू पर लौटने के लिए कभी भी 'menu' लिखें।"
        ),
        "kn": (
            "🌐 *ಕಿಸಾನ್‌ಬಡ್ಡಿ ವೆಬ್ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ*\n\n"
            "ಉಪಗ್ರಹ ಕೃಷಿ ಆರೋಗ್ಯ, ಲೈವ್ ಮಾರುಕಟ್ಟೆ ಚಾರ್ಟ್‌ಗಳು ಮತ್ತು ಎಲ್ಲಾ ಕೃಷಿ ಪರಿಕರಗಳಿಗಾಗಿ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ:\n\n"
            "👉 {url}\n\n"
            "ವಾಟ್ಸಾಪ್ ಮೆನುಗೆ ಮರಳಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "unknown_input": {
        "en": (
            "I didn't quite catch that. Please reply with a number (1–7) or type 'menu' to view options.\n\n"
            "1. Crop Doctor 🌿\n"
            "2. Ask Agri Question 🌱\n"
            "3. Weather Updates 🌤️\n"
            "4. Mandi Prices 📊\n"
            "5. Govt Schemes 🏛️\n"
            "6. Talk to Support 👨‍🌾\n"
            "7. Visit KisaanBuddy 🌐\n\n"
            "• Type 'help' for full guide."
        ),
        "hi": (
            "माफ़ कीजिए, हम समझ नहीं पाए। कृपया संख्या (1–7) लिखकर भेजें या मेनू देखने के लिए 'menu' लिखें।\n\n"
            "1. क्रॉप डॉक्टर 🌿\n"
            "2. कृषि प्रश्न पूछें 🌱\n"
            "3. मौसम पूर्वानुमान 🌤️\n"
            "4. मंडी भाव 📊\n"
            "5. सरकारी योजनाएं 🏛️\n"
            "6. विशेषज्ञ सहायता 👨‍🌾\n"
            "7. किसानबडी पोर्टल 🌐\n\n"
            "• सहायता के लिए 'help' लिखें।"
        ),
        "kn": (
            "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಂಖ್ಯೆ (1–7) ಕಳುಹಿಸಿ ಅಥವಾ ಆಯ್ಕೆಗಳನ್ನು ನೋಡಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ.\n\n"
            "1. ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ 🌿\n"
            "2. ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ 🌱\n"
            "3. ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ 🌤️\n"
            "4. ಮಾರುಕಟ್ಟೆ ದರ 📊\n"
            "5. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು 🏛️\n"
            "6. ಬೆಂಬಲ ಪಡೆಯಿರಿ 👨‍🌾\n"
            "7. ಕಿಸಾನ್‌ಬಡ್ಡಿ ವೆಬ್ 🌐\n\n"
            "• ಮಾಹಿತಿಗಾಗಿ 'help' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
        ),
    },
    "session_expired": {
        "en": "⏳ Your previous session has timed out. Welcome back! Type 'menu' to view options.",
        "hi": "⏳ आपका सत्र समाप्त हो गया था। पुनः स्वागत है! विकल्प देखने के लिए 'menu' लिखें।",
        "kn": "⏳ ನಿಮ್ಮ ಹಿಂದಿನ ಸೆಶನ್ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಸುಸ್ವಾಗತ! ಆಯ್ಕೆಗಳನ್ನು ನೋಡಲು 'menu' ಎಂದು ಟೈಪ್ ಮಾಡಿ.",
    },
}

# Exactly 7 Main Menu Items
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
            "en": "Upload crop photo for diagnosis & advice",
            "hi": "फसल की फोटो भेजें, रोग व उपचार जानें",
            "kn": "ಬೆಳೆ ಫೋಟೋ ಕಳುಹಿಸಿ, ರೋಗ ಪತ್ತೆ ಮಾಡಿ",
        },
    },
    {
        "id": "menu_guidance",
        "num": "2",
        "title": {
            "en": "2. Ask Agri Question 🌱",
            "hi": "2. कृषि प्रश्न पूछें 🌱",
            "kn": "2. ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ 🌱",
        },
        "desc": {
            "en": "Farming, fertilizer & pest advice in plain words",
            "hi": "खाद, सिंचाई व कीट नियंत्रण के सवाल पूछें",
            "kn": "ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ನೈಸರ್ಗಿಕ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ",
        },
    },
    {
        "id": "menu_weather",
        "num": "3",
        "title": {
            "en": "3. Weather Updates 🌤️",
            "hi": "3. मौसम पूर्वानुमान 🌤️",
            "kn": "3. ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ 🌤️",
        },
        "desc": {
            "en": "Location-based rain & temperature advisories",
            "hi": "स्थान-आधारित मौसम व कृषि सलाह",
            "kn": "ಸ್ಥಳ ಆಧಾರಿತ ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಸಲಹೆ",
        },
    },
    {
        "id": "menu_mandi",
        "num": "4",
        "title": {
            "en": "4. Mandi Prices 📊",
            "hi": "4. मंडी भाव 📊",
            "kn": "4. ಮಾರುಕಟ್ಟೆ ದರ 📊",
        },
        "desc": {
            "en": "Real APMC commodity prices & market rates",
            "hi": "ताज़ा APMC मंडी फसल भाव व बाजार दरें",
            "kn": "ನೈಜ APMC ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಮತ್ತು ದರಗಳು",
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
            "en": "Verified schemes, eligibility & benefits",
            "hi": "सत्यापित योजनाएं, पात्रता व लाभ",
            "kn": "ದೃಢೀಕೃತ ಯೋಜನೆಗಳು, ಅರ್ಹತೆ ಮತ್ತು ಪ್ರಯೋಜನಗಳು",
        },
    },
    {
        "id": "menu_support",
        "num": "6",
        "title": {
            "en": "6. Talk to Support 👨‍🌾",
            "hi": "6. विशेषज्ञ सहायता 👨‍🌾",
            "kn": "6. ಬೆಂಬಲ ಪಡೆಯಿರಿ 👨‍🌾",
        },
        "desc": {
            "en": "Create a support request for agricultural specialists",
            "hi": "कृषि विशेषज्ञों से सहायता अनुरोध दर्ज करें",
            "kn": "ಕೃಷಿ ತಜ್ಞರ ನೆರವಿಗಾಗಿ ವಿನಂತಿ ದಾಖಲಿಸಿ",
        },
    },
    {
        "id": "menu_website",
        "num": "7",
        "title": {
            "en": "7. Visit KisaanBuddy 🌐",
            "hi": "7. किसानबडी पोर्टल 🌐",
            "kn": "7. ಕಿಸಾನ್‌ಬಡ್ಡಿ ವೆಬ್ 🌐",
        },
        "desc": {
            "en": "Explore web tools at www.kisaanbuddy.com",
            "hi": "वेब पोर्टल www.kisaanbuddy.com पर जाएं",
            "kn": "www.kisaanbuddy.com ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ",
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
    else:
        # Default empty string for optional placeholders like url if called without kwargs
        try:
            return template.format(url="")
        except Exception:
            return template


def build_text_menu(lang: str = DEFAULT_LANGUAGE) -> str:
    """Builds farmer-friendly numbered text menu for WhatsApp clients that don't render interactive lists."""
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
    clean_text = text.strip().lower()
    normalized = re.sub(r"[!?,.:;\"'()\[\]{}*~_`#/<>\\]", "", clean_text).strip()

    # 1. Crop Doctor
    if normalized in ("1", "crop doctor", "crop_doctor", "menu_crop_doctor", "डॉक्टर", "ರೋಗ", "disease", "photo"):
        return "crop_doctor"

    # 2. Ask Agriculture Question
    if normalized in (
        "2",
        "ask an agriculture question",
        "ask question",
        "agriculture question",
        "crop guidance",
        "guidance",
        "menu_guidance",
        "सलाह",
        "प्रश्न",
        "सવાલ",
        "ಸಲಹೆ",
        "ಪ್ರಶ್ನೆ",
    ):
        return "guidance"

    # 3. Weather Updates
    if normalized in ("3", "weather", "weather updates", "menu_weather", "मौसम", "हवामान", "ಹವಾಮಾನ", "rain", "temperature"):
        return "weather"

    # 4. Mandi Prices
    if normalized in ("4", "market prices", "mandi", "mandi prices", "menu_mandi", "मंडी", "मंडी भाव", "ಮಂಡಿ", "ಮಾರುಕಟ್ಟೆ", "ದರ"):
        return "mandi"

    # 5. Govt Schemes
    if normalized in ("5", "govt schemes", "government schemes", "schemes", "menu_schemes", "योजना", "सरकारी योजना", "ಯೋಜನೆ", "ಸಬ್ಸಿಡಿ"):
        return "schemes"

    # 6. Talk to Support
    if normalized in ("6", "talk to support", "support", "help", "agent", "human", "menu_support", "सहायता", "मदद", "ಸಹಾಯ"):
        return "support"

    # 7. Visit KisaanBuddy
    if normalized in ("7", "visit kisaanbuddy", "visit", "website", "web", "portal", "menu_website", "वेबसाइट", "ತಾಣ"):
        return "website"

    # Language command
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
    if normalized in ("2", "hi", "hindi", "हिन्दी", "हिंदी", "हಿಂದಿ"):
        return "hi"
    if normalized in ("3", "kn", "kannada", "ಕನ್ನಡ", "कन्नड़"):
        return "kn"
    return None


def is_hi_greeting(text: str) -> bool:
    """Checks if text matches standard greetings."""
    if not text:
        return False
    norm = text.strip().lower()
    greetings = {
        "hi", "hello", "hey", "namaste", "namaskar", "namaskara", "vanakkam",
        "नमस्ते", "नमस्कार", "प्रणाम", "ನಮಸ್ಕಾರ", "ನಮಸ್ತೆ",
    }
    return norm in greetings


def is_menu_command(text: str) -> bool:
    """Checks if text is a command to return to main menu."""
    if not text:
        return False
    norm = text.strip().lower()
    return norm in ("menu", "main menu", "home", "start menu", "0", "मेनू", "ಮೆನು", "ಮುಖ್ಯ ಮೆನು")


def is_language_command(text: str) -> bool:
    """Checks if text is a command to switch language."""
    if not text:
        return False
    norm = text.strip().lower()
    return norm in ("language", "lang", "change language", "भाषा", "भाषा बदलें", "ಭಾಷೆ", "ಭಾಷೆ ಬದಲಾಯಿಸಿ")


def is_help_command(text: str) -> bool:
    """Checks if text requests help/commands."""
    if not text:
        return False
    norm = text.strip().lower()
    return norm in ("help", "info", "commands", "guide", "सहायता", "मदद", "ಸಹಾಯ", "ಮಾಹಿತಿ")


def is_stop_command(text: str) -> bool:
    """Checks if text requests opt-out of promotional notifications."""
    if not text:
        return False
    norm = text.strip().lower()
    stop_words = {
        "stop", "unsubscribe", "optout", "opt-out", "cancel", "halt",
        "रद्द", "रद्द करें", "बंद", "बंद करें", "रोकें",
        "ನಿಲ್ಲಿಸು", "ಬೇಡ", "ರದ್ದು",
    }
    return norm in stop_words


def is_start_command(text: str) -> bool:
    """Checks if text requests opt-in to notifications."""
    if not text:
        return False
    norm = text.strip().lower()
    start_words = {
        "start", "subscribe", "optin", "opt-in", "resume", "unstop",
        "शुरू", "शुरू करें", "प्रारंभ", "ಪ್ರಾರಂಭ", "ಮುಂದುವರಿಸಿ",
    }
    return norm in start_words
