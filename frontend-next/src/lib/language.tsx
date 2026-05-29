"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Lang = "en" | "hi" | "kn"

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  hi: "हिंदी",
  kn: "ಕನ್ನಡ",
}

export const LANG_FLAGS: Record<Lang, string> = {
  en: "🇬🇧",
  hi: "🇮🇳",
  kn: "🇮🇳",
}

/* ══════════════════════════════════════════════════
   TRANSLATIONS
══════════════════════════════════════════════════ */
export const T = {
  en: {
    // NAV
    dashboard: "Dashboard", weather: "Weather", aiPredictor: "AI Predictor",
    diseaseDetect: "Disease Detect", khetDiary: "Khet Diary", soilHealth: "Soil Health",
    schemes: "Schemes", mandi: "Mandi", workers: "Workers", aiChatbot: "AI Chatbot",
    founders: "Founders", login: "Login", logout: "Sign out", signUp: "Sign Up Free",

    // HOMEPAGE HERO
    heroBadge: "Early Access – Completely Free",
    heroTitle1: "Your Farm,",
    heroTitle2: "AI Powered",
    heroSubtitle: "Detect crop disease, check mandi prices, test soil health — all in Hindi, with just a mic click.",
    tryNow: "Try Now",
    createAccount: "Create Free Account",
    noAccountNeeded: "No account needed",
    hindiVoiceSupport: "Hindi Voice Support",
    multiLang: "Hindi · English · Kannada",
    freeBadge: "Free",
    freeForever: "Forever",
    aiFeatures: "AI Features",

    // VOICE SECTION
    voiceBadge: "New Feature",
    voiceTitle1: "Speak in Hindi,",
    voiceTitle2: "AI will respond instantly",
    voiceSubtitle: "No need to type. Just press mic and tell your crop problem — AI understands Hindi.",
    clickAndSpeak: "Click here and say: 'my wheat leaves are turning yellow'",
    youSaid: "You said:",
    askAI: "Ask AI",
    voiceHints: ["my tomatoes have black spots", "what is today's potato price in mandi", "which fertilizer to use for wheat"],

    // PROBLEMS
    problemBadge: "Farmer's Pain",
    problemTitle1: "These problems every farmer",
    problemTitle2: "faces every day",
    problems: [
      { p: "Cannot identify crop disease on time", s: "Take photo — AI diagnoses in 2 seconds" },
      { p: "Not getting fair price in mandi", s: "Live mandi rates + sell at the right time" },
      { p: "Don't know which fertilizer to use", s: "Do soil test, get AI recommendation" },
      { p: "Hours wasted finding farm workers", s: "Get workers instantly via Worker Connect" },
    ],

    // FEATURES
    featuresBadge: "All In One Place",
    featuresTitle1: "Everything a farmer needs,",
    featuresTitle2: "all here",
    features: [
      { title: "Crop Disease AI",      body: "Take photo — AI instantly identifies disease, gives organic and chemical treatment with exact dose" },
      { title: "Hindi Voice AI",       body: "Speak and AI listens. Ask questions in Hindi, English, Kannada — any language" },
      { title: "Live Mandi Prices",    body: "Today's APMC mandi rate, set price alert when rate crosses your threshold" },
      { title: "Soil Health AI",       body: "Enter NPK, pH, OC — AI tells which fertilizer, how much, crop-wise recommendation" },
      { title: "Khet Diary",           body: "Log daily farm activity — photo, weather, notes. Complete farm record in one place" },
      { title: "Weather Alert",        body: "7-day forecast for your farm, crop-specific advisory. Stay alert before rain" },
      { title: "Govt Schemes",         body: "PM-Kisan, PMFBY, KCC — check eligibility and apply directly. 12+ schemes in one place" },
      { title: "Crop Predictor",       body: "Based on your soil, weather, location — AI tells which crop will be best next season" },
      { title: "Worker Connect",       body: "Workers, tractor, harvester — all nearby workers in one place. Call or WhatsApp directly" },
    ],
    useIt: "Use it",
    newBadge: "New",

    // HOW IT WORKS
    howTitle: "How Does It Work?",
    howSubtitle: "3 simple steps — no technical knowledge required",
    howSteps: [
      { title: "Speak or Take Photo", body: "Say it in Hindi or take a crop photo — both work" },
      { title: "AI Analyses",         body: "KrishiAI AI understands your problem and instantly diagnoses" },
      { title: "Get Solution",        body: "Exact treatment, dose, govt scheme — all in Hindi" },
    ],

    // EARLY ACCESS
    betaBadge: "In Beta",
    betaTitle: "You will be among our first users",
    betaSubtitle: "We are building now. Your feedback is our roadmap — we will build the features you want.",
    createFreeAccount: "Create Free Account",
    tryWithoutAccount: "Try Without Account",

    // FOOTER
    footerTagline: "Empowering Indian farmers with AI",
    madeInIndia: "Made with love in India",

    // DASHBOARD
    goodMorning: "Good Morning", goodAfternoon: "Good Afternoon", goodEvening: "Good Evening",
    welcomeBack: "Welcome back",
    guestBanner: "Using without account — data will not be saved.",
    createFreeAccountBtn: "Create Free Account",
    quickAccess: "Quick Access",
    recentActivity: "Recent Activity",
    farmInsights: "Farm Insights",

    // MANDI
    mandiTitle: "Live Mandi Prices",
    mandiSubtitle: "Today's APMC rates across India",
    searchCrop: "Search crop...",
    priceAlerts: "Price Alerts",
    setAlert: "Set Alert",
    above: "Above", below: "Below",
    addAlert: "Add Alert",
    noAlerts: "No alerts set",
    applyNow: "Apply Now",

    // DISEASE
    diseaseTitle: "Crop Disease Detection",
    diseaseSubtitle: "Upload crop photo for instant AI diagnosis",
    uploadPhoto: "Upload Photo",
    diagnose: "Diagnose",
    orDrag: "or drag and drop here",

    // WEATHER
    weatherTitle: "Weather Forecast",
    weatherSubtitle: "7-day hyper-local forecast for your farm",
    detectLocation: "Detect My Location",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    feelsLike: "Feels Like",

    // CHATBOT
    chatTitle: "Hindi Voice AI",
    chatSubtitle: "Speak or type in your language — AI understands",
    chatPlaceholder: "Ask in English... like 'my tomato leaves are yellowing'",
    listening: "Listening...",
    stopListening: "Stop",
    speakBtn: "Speak",
    disclaimer: "KrishiAI may occasionally produce inaccurate answers.",

    // SCHEMES
    schemesTitle: "Sarkari Yojnayein",
    schemesSubtitle: "central schemes · Check eligibility and apply directly.",
    checkEligibility: "Check Eligibility",
    reset: "Reset",
    landAcres: "Land (acres)",
    category: "Category",
    age: "Age",
    showSchemes: "Show My Schemes",
    matchingSchemes: "matching schemes",
    central: "Central",

    // SOIL HEALTH
    soilTitle: "Soil Health & Fertilizer AI",
    soilSubtitle: "Enter your soil details — get AI-powered fertilizer recommendation",
    selectCrop: "Select Crop",
    areaHectares: "Area (hectares)",
    nitrogenLevel: "Nitrogen (N)",
    phosphorusLevel: "Phosphorus (P)",
    potassiumLevel: "Potassium (K)",
    phLevel: "Soil pH",
    organicCarbon: "Organic Carbon",
    getRecommendation: "Get AI Recommendation",
    analyzing: "Analysing...",
    low: "Low", medium: "Medium", high: "High",

    // KHET DIARY
    diaryTitle: "Khet Diary",
    diarySubtitle: "Daily farm activity log",
    addEntry: "Add Entry",
    activityType: "Activity Type",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    noEntries: "No entries yet",

    // WORKER CONNECT
    workerTitle: "Worker Connect",
    workerSubtitle: "Find skilled farm workers near you",
    callBtn: "Call",
    whatsappBtn: "WhatsApp",
    perDay: "/day",
  },

  hi: {
    // NAV
    dashboard: "डैशबोर्ड", weather: "मौसम", aiPredictor: "AI प्रेडिक्टर",
    diseaseDetect: "बीमारी पहचान", khetDiary: "खेत डायरी", soilHealth: "मिट्टी स्वास्थ्य",
    schemes: "योजनाएं", mandi: "मंडी", workers: "मजदूर", aiChatbot: "AI चैटबॉट",
    founders: "संस्थापक", login: "लॉगिन", logout: "लॉग आउट", signUp: "मुफ्त साइन अप",

    // HOMEPAGE HERO
    heroBadge: "अर्ली एक्सेस – बिल्कुल मुफ्त",
    heroTitle1: "अपनी खेती,",
    heroTitle2: "AI की शक्ति",
    heroSubtitle: "फसल की बीमारी पहचानें, मंडी भाव जानें, मिट्टी जांचें — सब हिंदी में, सिर्फ एक mic क्लिक पर।",
    tryNow: "अभी Try करें",
    createAccount: "मुफ्त Account बनाएं",
    noAccountNeeded: "Account जरूरी नहीं",
    hindiVoiceSupport: "हिंदी Voice सपोर्ट",
    multiLang: "हिंदी · English · ಕನ್ನಡ",
    freeBadge: "मुफ्त",
    freeForever: "हमेशा के लिए",
    aiFeatures: "AI फीचर्स",

    // VOICE SECTION
    voiceBadge: "नया फीचर",
    voiceTitle1: "हिंदी में बोलें,",
    voiceTitle2: "AI तुरंत जवाब देगा",
    voiceSubtitle: "Type करने की जरूरत नहीं। बस mic दबाएं और अपनी फसल की समस्या बताएं — AI हिंदी समझता है।",
    clickAndSpeak: "यहाँ click करें और बोलें: 'मेरे गेहूं के पत्ते पीले हो रहे हैं'",
    youSaid: "आपने कहा:",
    askAI: "AI से पूछो",
    voiceHints: ["मेरे टमाटर में काले धब्बे हैं", "आज मंडी में आलू का भाव क्या है", "गेहूं के लिए कौनसी खाद डालें"],

    // PROBLEMS
    problemBadge: "किसान की तकलीफ",
    problemTitle1: "ये problems हर किसान",
    problemTitle2: "रोज face करता है",
    problems: [
      { p: "फसल की बीमारी समय पर नहीं पकड़ आती", s: "Photo लो — AI 2 second में diagnose करेगा" },
      { p: "मंडी में सही भाव नहीं मिलता", s: "Live मंडी rates + सही समय पर बेचो" },
      { p: "कौनसी खाद डालें — किसी को पता नहीं", s: "Soil test करें, AI से recommendation लो" },
      { p: "मजदूर ढूंढने में घंटे जाते हैं", s: "Worker Connect से तुरंत मजदूर लो" },
    ],

    // FEATURES
    featuresBadge: "सब एक जगह",
    featuresTitle1: "एक किसान को जो चाहिए,",
    featuresTitle2: "सब यहाँ है",
    features: [
      { title: "फसल बीमारी AI",        body: "Photo खिंचो — AI तुरंत बीमारी पकड़ेगा, organic और chemical दोनों treatment बताएगा" },
      { title: "हिंदी Voice AI",        body: "बोलें और AI सुनेगा। हिंदी, English, Kannada — किसी भी भाषा में सवाल पूछो" },
      { title: "Live मंडी भाव",         body: "आज का APMC मंडी rate, price alert set करो जब भाव आपकी threshold cross करे" },
      { title: "मिट्टी स्वास्थ्य AI",   body: "NPK, pH, OC enter करो — AI बताएगा कौनसी खाद कितनी डालें, crop-wise recommendation" },
      { title: "खेत डायरी",             body: "हर दिन की खेत activity log करो — photo, weather, notes. अपनी खेती का पूरा record एक जगह" },
      { title: "मौसम Alert",            body: "आपके खेत के लिए 7-दिन का forecast, फसल-specific advisory. बारिश से पहले सावधान रहो" },
      { title: "सरकारी योजनाएं",        body: "PM-किसान, PMFBY, KCC — eligibility check करो और सीधा apply करो। 12+ schemes एक जगह" },
      { title: "Crop Predictor",        body: "अपनी मिट्टी, मौसम, location के basis पर AI बताएगा कौन सी फसल best रहेगी अगले season में" },
      { title: "Worker Connect",        body: "मजदूर, tractor, harvester — सब nearby workers एक जगह। Call या WhatsApp पे सीधा contact" },
    ],
    useIt: "Use करें",
    newBadge: "नया",

    // HOW IT WORKS
    howTitle: "कैसे काम करता है?",
    howSubtitle: "3 simple steps — कोई technical knowledge नहीं चाहिए",
    howSteps: [
      { title: "बोलें या Photo लो", body: "Hindi में बोलें या फसल की photo खिंचो — दोनों काम करते हैं" },
      { title: "AI Analyse करता है", body: "KrishiAI का AI आपकी बात समझता है और instantly diagnose करता है" },
      { title: "Solution पाइए",      body: "Exact treatment, dose, सरकारी योजना — सब Hindi में मिलेगा" },
    ],

    // EARLY ACCESS
    betaBadge: "Beta में हैं",
    betaTitle: "आप हमारे पहले users में से एक होंगे",
    betaSubtitle: "हम अभी build कर रहे हैं। आपका feedback ही हमारा roadmap है — features जो आप चाहते हो, वही बनाएंगे।",
    createFreeAccount: "मुफ्त Account बनाएं",
    tryWithoutAccount: "बिना Account Try करें",

    // FOOTER
    footerTagline: "AI से भारतीय किसानों को सशक्त बनाना",
    madeInIndia: "भारत में प्यार से बनाया",

    // DASHBOARD
    goodMorning: "सुप्रभात", goodAfternoon: "शुभ दोपहर", goodEvening: "शुभ संध्या",
    welcomeBack: "वापस आपका स्वागत है",
    guestBanner: "बिना account के use कर रहे हैं — data save नहीं होगा।",
    createFreeAccountBtn: "मुफ्त Account बनाएं",
    quickAccess: "Quick Access",
    recentActivity: "हाल की गतिविधि",
    farmInsights: "खेत Insights",

    // MANDI
    mandiTitle: "Live मंडी भाव",
    mandiSubtitle: "पूरे भारत में आज के APMC rates",
    searchCrop: "फसल खोजें...",
    priceAlerts: "Price Alerts",
    setAlert: "Alert Set करें",
    above: "से ऊपर", below: "से नीचे",
    addAlert: "Alert जोड़ें",
    noAlerts: "कोई alert नहीं",
    applyNow: "अभी Apply करें",

    // DISEASE
    diseaseTitle: "फसल बीमारी पहचान",
    diseaseSubtitle: "तुरंत AI diagnosis के लिए फसल की photo upload करें",
    uploadPhoto: "Photo Upload करें",
    diagnose: "Diagnose करें",
    orDrag: "या यहाँ drag और drop करें",

    // WEATHER
    weatherTitle: "मौसम पूर्वानुमान",
    weatherSubtitle: "आपके खेत के लिए 7-दिन का hyper-local forecast",
    detectLocation: "मेरी Location पहचानें",
    humidity: "नमी",
    windSpeed: "हवा की गति",
    feelsLike: "महसूस होता है",

    // CHATBOT
    chatTitle: "हिंदी Voice AI",
    chatSubtitle: "अपनी भाषा में बोलें या लिखें — AI समझता है",
    chatPlaceholder: "हिंदी में पूछो... जैसे 'मेरे टमाटर में बीमारी है'",
    listening: "सुन रहा हूं...",
    stopListening: "बंद करें",
    speakBtn: "बोलें",
    disclaimer: "KrishiAI कभी कभी गलत जवाब दे सकता है — doctor या कृषि officer से जरूर सलाह लें।",

    // SCHEMES
    schemesTitle: "सरकारी योजनाएं",
    schemesSubtitle: "केंद्रीय योजनाएं · पात्रता जांचें और सीधे आवेदन करें।",
    checkEligibility: "पात्रता जांचें",
    reset: "Reset",
    landAcres: "जमीन (एकड़)",
    category: "वर्ग",
    age: "उम्र",
    showSchemes: "मेरे लिए Schemes दिखाओ",
    matchingSchemes: "matching schemes",
    central: "केंद्रीय",

    // SOIL HEALTH
    soilTitle: "मिट्टी स्वास्थ्य & खाद AI",
    soilSubtitle: "अपनी मिट्टी की details enter करें — AI-powered खाद recommendation पाएं",
    selectCrop: "फसल चुनें",
    areaHectares: "क्षेत्रफल (हेक्टेयर)",
    nitrogenLevel: "नाइट्रोजन (N)",
    phosphorusLevel: "फास्फोरस (P)",
    potassiumLevel: "पोटेशियम (K)",
    phLevel: "मिट्टी pH",
    organicCarbon: "Organic Carbon",
    getRecommendation: "AI Recommendation लो",
    analyzing: "विश्लेषण हो रहा है...",
    low: "कम", medium: "मध्यम", high: "अधिक",

    // KHET DIARY
    diaryTitle: "खेत डायरी",
    diarySubtitle: "रोज की खेत गतिविधि log",
    addEntry: "Entry जोड़ें",
    activityType: "गतिविधि प्रकार",
    notes: "Notes",
    save: "Save करें",
    cancel: "रद्द करें",
    noEntries: "अभी कोई entry नहीं",

    // WORKER CONNECT
    workerTitle: "Worker Connect",
    workerSubtitle: "आपके पास skilled farm workers खोजें",
    callBtn: "कॉल",
    whatsappBtn: "WhatsApp",
    perDay: "/दिन",
  },

  kn: {
    // NAV
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", weather: "ಹವಾಮಾನ", aiPredictor: "AI ಭವಿಷ್ಯಕಾರ",
    diseaseDetect: "ರೋಗ ಪತ್ತೆ", khetDiary: "ಹೊಲ ಡೈರಿ", soilHealth: "ಮಣ್ಣು ಆರೋಗ್ಯ",
    schemes: "ಯೋಜನೆಗಳು", mandi: "ಮಂಡಿ", workers: "ಕೆಲಸಗಾರರು", aiChatbot: "AI ಚಾಟ್‌ಬಾಟ್",
    founders: "ಸಂಸ್ಥಾಪಕರು", login: "ಲಾಗಿನ್", logout: "ಲಾಗ್ ಔಟ್", signUp: "ಉಚಿತ ಸೈನ್ ಅಪ್",

    // HOMEPAGE HERO
    heroBadge: "ಅರ್ಲಿ ಆಕ್ಸೆಸ್ – ಸಂಪೂರ್ಣ ಉಚಿತ",
    heroTitle1: "ನಿಮ್ಮ ಕೃಷಿ,",
    heroTitle2: "AI ಶಕ್ತಿ",
    heroSubtitle: "ಬೆಳೆ ರೋಗ ಪತ್ತೆ, ಮಂಡಿ ಬೆಲೆ ತಿಳಿಯಿರಿ, ಮಣ್ಣು ಪರೀಕ್ಷೆ — ಎಲ್ಲವೂ ಕನ್ನಡದಲ್ಲಿ.",
    tryNow: "ಈಗ Try ಮಾಡಿ",
    createAccount: "ಉಚಿತ Account ತೆರೆಯಿರಿ",
    noAccountNeeded: "Account ಅಗತ್ಯವಿಲ್ಲ",
    hindiVoiceSupport: "ಕನ್ನಡ Voice ಸಪೋರ್ಟ್",
    multiLang: "ಹಿಂದಿ · English · ಕನ್ನಡ",
    freeBadge: "ಉಚಿತ",
    freeForever: "ಯಾವಾಗಲೂ",
    aiFeatures: "AI ವೈಶಿಷ್ಟ್ಯಗಳು",

    // VOICE SECTION
    voiceBadge: "ಹೊಸ ವೈಶಿಷ್ಟ್ಯ",
    voiceTitle1: "ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ,",
    voiceTitle2: "AI ತಕ್ಷಣ ಉತ್ತರಿಸುತ್ತದೆ",
    voiceSubtitle: "ಟೈಪ್ ಮಾಡಬೇಕಿಲ್ಲ. Mic ಒತ್ತಿ ನಿಮ್ಮ ಬೆಳೆ ಸಮಸ್ಯೆ ಹೇಳಿ — AI ಕನ್ನಡ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತದೆ.",
    clickAndSpeak: "ಇಲ್ಲಿ click ಮಾಡಿ ಮತ್ತು ಹೇಳಿ: 'ನನ್ನ ಗೋಧಿ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ'",
    youSaid: "ನೀವು ಹೇಳಿದ್ದು:",
    askAI: "AI ಕೇಳಿ",
    voiceHints: ["ನನ್ನ ಟೊಮೆಟೊಗಳಲ್ಲಿ ಕಪ್ಪು ಕಲೆಗಳಿವೆ", "ಇಂದು ಮಂಡಿಯಲ್ಲಿ ಆಲೂ ಬೆಲೆ ಏನು", "ಗೋಧಿಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು"],

    // PROBLEMS
    problemBadge: "ರೈತರ ಸಮಸ್ಯೆ",
    problemTitle1: "ಈ ಸಮಸ್ಯೆಗಳನ್ನು ಪ್ರತಿ ರೈತ",
    problemTitle2: "ಪ್ರತಿ ದಿನ ಎದುರಿಸುತ್ತಾನೆ",
    problems: [
      { p: "ಬೆಳೆ ರೋಗ ಸಮಯಕ್ಕೆ ಗುರುತಿಸಲಾಗುವುದಿಲ್ಲ", s: "ಫೋಟೋ ತೆಗೆಯಿರಿ — AI 2 ಸೆಕೆಂಡ್‌ನಲ್ಲಿ ಪತ್ತೆ ಮಾಡುತ್ತದೆ" },
      { p: "ಮಂಡಿಯಲ್ಲಿ ಸರಿಯಾದ ಬೆಲೆ ಸಿಗುವುದಿಲ್ಲ", s: "Live ಮಂಡಿ ದರ + ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ ಮಾರಿ" },
      { p: "ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕೆಂದು ತಿಳಿಯುವುದಿಲ್ಲ", s: "ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿ, AI ಸಲಹೆ ಪಡೆಯಿರಿ" },
      { p: "ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಲು ಗಂಟೆಗಳು ತೆಗೆಯುತ್ತದೆ", s: "Worker Connect ನಿಂದ ತಕ್ಷಣ ಕೆಲಸಗಾರ ಸಿಗುತ್ತಾರೆ" },
    ],

    // FEATURES
    featuresBadge: "ಎಲ್ಲವೂ ಒಂದೆಡೆ",
    featuresTitle1: "ರೈತನಿಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ,",
    featuresTitle2: "ಇಲ್ಲಿಯೇ ಇದೆ",
    features: [
      { title: "ಬೆಳೆ ರೋಗ AI",          body: "ಫೋಟೋ ತೆಗೆಯಿರಿ — AI ತಕ್ಷಣ ರೋಗ ಪತ್ತೆ ಮಾಡಿ organic ಮತ್ತು chemical ಚಿಕಿತ್ಸೆ ಹೇಳುತ್ತದೆ" },
      { title: "ಕನ್ನಡ Voice AI",         body: "ಮಾತನಾಡಿ, AI ಕೇಳುತ್ತದೆ. ಕನ್ನಡ, English, ಹಿಂದಿ — ಯಾವ ಭಾಷೆಯಲ್ಲಾದರೂ ಕೇಳಿ" },
      { title: "Live ಮಂಡಿ ದರ",          body: "ಇಂದಿನ APMC ಮಂಡಿ ದರ, ಬೆಲೆ alert ಸೆಟ್ ಮಾಡಿ ನಿಮ್ಮ threshold ದಾಟಿದಾಗ" },
      { title: "ಮಣ್ಣು ಆರೋಗ್ಯ AI",       body: "NPK, pH, OC ನಮೂದಿಸಿ — AI ಯಾವ ಗೊಬ್ಬರ, ಎಷ್ಟು ಹಾಕಬೇಕೆಂದು ಹೇಳುತ್ತದೆ" },
      { title: "ಹೊಲ ಡೈರಿ",              body: "ದೈನಂದಿನ ಕೃಷಿ ಚಟುವಟಿಕೆ log ಮಾಡಿ — ಫೋಟೋ, ಹವಾಮಾನ, notes. ಎಲ್ಲ ದಾಖಲೆ ಒಂದೆಡೆ" },
      { title: "ಹವಾಮಾನ Alert",           body: "ನಿಮ್ಮ ಹೊಲಕ್ಕೆ 7-ದಿನದ forecast, ಬೆಳೆ-ನಿರ್ದಿಷ್ಟ ಸಲಹೆ. ಮಳೆಗೆ ಮೊದಲು ಎಚ್ಚರಿಕೆ" },
      { title: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",      body: "PM-ಕಿಸಾನ್, PMFBY, KCC — ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ ನೇರ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ. 12+ ಯೋಜನೆಗಳು ಒಂದೆಡೆ" },
      { title: "Crop Predictor",        body: "ನಿಮ್ಮ ಮಣ್ಣು, ಹವಾಮಾನ, ಸ್ಥಳದ ಆಧಾರದಲ್ಲಿ AI ಮುಂದಿನ season ಯಾವ ಬೆಳೆ ಉತ್ತಮ ಎಂದು ಹೇಳುತ್ತದೆ" },
      { title: "Worker Connect",        body: "ಕೆಲಸಗಾರರು, ಟ್ರ್ಯಾಕ್ಟರ್, ಹಾರ್ವೆಸ್ಟರ್ — ಹತ್ತಿರದ workers ಒಂದೆಡೆ. Call ಅಥವಾ WhatsApp ನಲ್ಲಿ ನೇರ contact" },
    ],
    useIt: "ಬಳಸಿ",
    newBadge: "ಹೊಸದು",

    // HOW IT WORKS
    howTitle: "ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?",
    howSubtitle: "3 ಸರಳ ಹಂತಗಳು — ತಾಂತ್ರಿಕ ಜ್ಞಾನ ಅಗತ್ಯವಿಲ್ಲ",
    howSteps: [
      { title: "ಮಾತನಾಡಿ ಅಥವಾ ಫೋಟೋ ತೆಗೆಯಿರಿ", body: "ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ ಅಥವಾ ಬೆಳೆ ಫೋಟೋ ತೆಗೆಯಿರಿ — ಎರಡೂ ಕಾರ್ಯ ಮಾಡುತ್ತದೆ" },
      { title: "AI ವಿಶ್ಲೇಷಿಸುತ್ತದೆ",         body: "KrishiAI AI ನಿಮ್ಮ ಮಾತು ಅರ್ಥಮಾಡಿಕೊಂಡು ತಕ್ಷಣ diagnose ಮಾಡುತ್ತದೆ" },
      { title: "ಪರಿಹಾರ ಪಡೆಯಿರಿ",             body: "Exact ಚಿಕಿತ್ಸೆ, dose, ಸರ್ಕಾರಿ ಯೋಜನೆ — ಎಲ್ಲವೂ ಕನ್ನಡದಲ್ಲಿ" },
    ],

    // EARLY ACCESS
    betaBadge: "Beta ನಲ್ಲಿದ್ದೇವೆ",
    betaTitle: "ನೀವು ನಮ್ಮ ಮೊದಲ users ಪೈಕಿ ಒಬ್ಬರಾಗಿರುತ್ತೀರಿ",
    betaSubtitle: "ನಾವು ಈಗ build ಮಾಡುತ್ತಿದ್ದೇವೆ. ನಿಮ್ಮ feedback ನಮ್ಮ roadmap — ನೀವು ಬಯಸಿದ features ತಯಾರಿಸುತ್ತೇವೆ.",
    createFreeAccount: "ಉಚಿತ Account ತೆರೆಯಿರಿ",
    tryWithoutAccount: "Account ಇಲ್ಲದೆ Try ಮಾಡಿ",

    // FOOTER
    footerTagline: "AI ನಿಂದ ಭಾರತೀಯ ರೈತರನ್ನು ಸಬಲೀಕರಣ",
    madeInIndia: "ಭಾರತದಲ್ಲಿ ಪ್ರೀತಿಯಿಂದ ತಯಾರಿಸಲಾಗಿದೆ",

    // DASHBOARD
    goodMorning: "ಶುಭೋದಯ", goodAfternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ", goodEvening: "ಶುಭ ಸಂಜೆ",
    welcomeBack: "ಮರಳಿ ಸ್ವಾಗತ",
    guestBanner: "Account ಇಲ್ಲದೆ ಬಳಸುತ್ತಿದ್ದೀರಿ — data save ಆಗುವುದಿಲ್ಲ.",
    createFreeAccountBtn: "ಉಚಿತ Account ತೆರೆಯಿರಿ",
    quickAccess: "Quick Access",
    recentActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
    farmInsights: "ಹೊಲ Insights",

    // MANDI
    mandiTitle: "Live ಮಂಡಿ ದರ",
    mandiSubtitle: "ಭಾರತಾದ್ಯಂತ ಇಂದಿನ APMC ದರಗಳು",
    searchCrop: "ಬೆಳೆ ಹುಡುಕಿ...",
    priceAlerts: "ಬೆಲೆ Alerts",
    setAlert: "Alert ಸೆಟ್ ಮಾಡಿ",
    above: "ಮೇಲೆ", below: "ಕೆಳಗೆ",
    addAlert: "Alert ಸೇರಿಸಿ",
    noAlerts: "Alerts ಇಲ್ಲ",
    applyNow: "ಈಗ Apply ಮಾಡಿ",

    // DISEASE
    diseaseTitle: "ಬೆಳೆ ರೋಗ ಪತ್ತೆ",
    diseaseSubtitle: "ತಕ್ಷಣ AI diagnosis ಗಾಗಿ ಬೆಳೆ ಫೋಟೋ upload ಮಾಡಿ",
    uploadPhoto: "ಫೋಟೋ Upload ಮಾಡಿ",
    diagnose: "Diagnose ಮಾಡಿ",
    orDrag: "ಅಥವಾ ಇಲ್ಲಿ drag ಮತ್ತು drop ಮಾಡಿ",

    // WEATHER
    weatherTitle: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
    weatherSubtitle: "ನಿಮ್ಮ ಹೊಲಕ್ಕೆ 7-ದಿನದ hyper-local forecast",
    detectLocation: "ನನ್ನ Location ಪತ್ತೆ ಮಾಡಿ",
    humidity: "ಆರ್ದ್ರತೆ",
    windSpeed: "ಗಾಳಿ ವೇಗ",
    feelsLike: "ಅನ್ನಿಸುತ್ತಿದೆ",

    // CHATBOT
    chatTitle: "ಕನ್ನಡ Voice AI",
    chatSubtitle: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಬರೆಯಿರಿ — AI ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತದೆ",
    chatPlaceholder: "ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ... ಉದಾ 'ನನ್ನ ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ'",
    listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ...",
    stopListening: "ನಿಲ್ಲಿಸಿ",
    speakBtn: "ಮಾತನಾಡಿ",
    disclaimer: "KrishiAI ಕೆಲವೊಮ್ಮೆ ತಪ್ಪಾದ ಉತ್ತರ ನೀಡಬಹುದು — doctor ಅಥವಾ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",

    // SCHEMES
    schemesTitle: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    schemesSubtitle: "ಕೇಂದ್ರ ಯೋಜನೆಗಳು · ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ ನೇರ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
    checkEligibility: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ",
    reset: "Reset",
    landAcres: "ಭೂಮಿ (ಎಕರೆ)",
    category: "ವರ್ಗ",
    age: "ವಯಸ್ಸು",
    showSchemes: "ನನಗಾಗಿ Schemes ತೋರಿಸಿ",
    matchingSchemes: "matching schemes",
    central: "ಕೇಂದ್ರ",

    // SOIL HEALTH
    soilTitle: "ಮಣ್ಣು ಆರೋಗ್ಯ & ಗೊಬ್ಬರ AI",
    soilSubtitle: "ನಿಮ್ಮ ಮಣ್ಣಿನ details ನಮೂದಿಸಿ — AI ಗೊಬ್ಬರ ಸಲಹೆ ಪಡೆಯಿರಿ",
    selectCrop: "ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ",
    areaHectares: "ಪ್ರದೇಶ (ಹೆಕ್ಟೇರ್)",
    nitrogenLevel: "ನೈಟ್ರೋಜನ್ (N)",
    phosphorusLevel: "ಫಾಸ್ಫರಸ್ (P)",
    potassiumLevel: "ಪೊಟ್ಯಾಸಿಯಮ್ (K)",
    phLevel: "ಮಣ್ಣು pH",
    organicCarbon: "Organic Carbon",
    getRecommendation: "AI Recommendation ಪಡೆಯಿರಿ",
    analyzing: "ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    low: "ಕಡಿಮೆ", medium: "ಮಧ್ಯಮ", high: "ಹೆಚ್ಚು",

    // KHET DIARY
    diaryTitle: "ಹೊಲ ಡೈರಿ",
    diarySubtitle: "ದೈನಂದಿನ ಕೃಷಿ ಚಟುವಟಿಕೆ log",
    addEntry: "Entry ಸೇರಿಸಿ",
    activityType: "ಚಟುವಟಿಕೆ ಪ್ರಕಾರ",
    notes: "Notes",
    save: "Save ಮಾಡಿ",
    cancel: "ರದ್ದು ಮಾಡಿ",
    noEntries: "ಇನ್ನೂ entries ಇಲ್ಲ",

    // WORKER CONNECT
    workerTitle: "Worker Connect",
    workerSubtitle: "ಹತ್ತಿರದ skilled farm workers ಹುಡುಕಿ",
    callBtn: "ಕರೆ",
    whatsappBtn: "WhatsApp",
    perDay: "/ದಿನ",
  },
} as const

/* ══════════════════════════════════════════════════
   CONTEXT
══════════════════════════════════════════════════ */
type TranslationKey = string

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => any
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "hi",
  setLang: () => {},
  t: (key) => (T.en as any)[key],
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi")

  useEffect(() => {
    const saved = localStorage.getItem("krishiai_lang") as Lang | null
    if (saved && saved in T) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("krishiai_lang", l)
  }

  const t = (key: string) => (T[lang] as any)[key] ?? (T.en as any)[key]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
