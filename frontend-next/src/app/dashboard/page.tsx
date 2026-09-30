"use client"

import { useState, useEffect, useMemo } from "react"
import {
  CloudSun, Sprout, Bug, TrendingUp, Users, Landmark, Activity,
  BookOpen, ChevronRight, Thermometer, Droplets, Mic, MessageCircle,
  Phone, AlertTriangle, Cpu, Volume2, Loader2, Share2, Sparkles,
  Calendar, CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useLanguage, Lang } from "@/lib/language"
import { trackEvent } from "@/lib/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularGauge } from "@/components/dashboard/CircularGauge"
import { ActionableAdvisory } from "@/components/dashboard/ActionableAdvisory"


/* ─── 10-Language Farmer Dictionary ─── */
const localDict: Record<Lang, Record<string, string>> = {
  hi: {
    title: "मेरे खेत का हाल",
    welcome: "नमस्ते",
    sub: "आपके खेत की लाइव जानकारी और कृषि परामर्श",
    sensorStatus: "सेंसर स्थिति",
    connected: "कनेक्टेड (चालू)",
    disconnected: "ऑफ़लाइन (बंद)",
    voiceReadBtn: "खेत का हाल सुनें",
    voiceQueryBtn: "बोलकर पूछें",
    voiceQuerySub: "जैसे: 'आलू में कौन सी खाद डालें?'",
    whatsAppShareBtn: "व्हाट्सएप रिपोर्ट",
    whatsAppSupportBtn: "कृषि सहायता टीम",
    agriAdvisorBtn: "कृषि विशेषज्ञ कॉल",
    moistureLabel: "मिट्टी की नमी",
    tempLabel: "तापमान",
    humidityLabel: "हवा की नमी",
    npkLabel: "मिट्टी पोषक तत्व (NPK)",
    phLabel: "मिट्टी का स्वास्थ्य (pH)",
    nitrogen: "नाइट्रोजन (N)",
    phosphorus: "फास्फोरस (P)",
    potassium: "पोटेशियम (K)",
    moistureLow: "खेत सूखा है, सिंचाई की आवश्यकता है ❌",
    moistureGood: "नमी बिल्कुल सही है ✅",
    moistureHigh: "पानी ज्यादा है, जल निकासी करें ⚠️",
    tempLow: "ठंड अधिक है, फसलों का ध्यान रखें ❄️",
    tempGood: "तापमान फसल के लिए अनुकूल है ✅",
    tempHigh: "गर्मी अधिक है, नमी बनाए रखें ⚠️",
    humidityHigh: "हवा में नमी अधिक, कीट का खतरा ⚠️",
    humidityGood: "हवा की नमी अनुकूल है ✅",
    npkSub: "नाइट्रोजन, फास्फोरस और पोटाश स्तर",
    phSub: "इष्टतम सीमा 6.0 से 7.5",
    historyTitle: "पिछले 7 दिनों का रुझान",
    listening: "आपकी आवाज़ सुनी जा रही है...",
    notSupported: "आपका ब्राउज़र वॉइस सपोर्ट नहीं करता।"
  },
  en: {
    title: "Farm Overview",
    welcome: "Namaste",
    sub: "Live field metrics and actionable intelligence",
    sensorStatus: "Sensor Status",
    connected: "Online & Active",
    disconnected: "Offline",
    voiceReadBtn: "Listen to Status",
    voiceQueryBtn: "Ask by Voice",
    voiceQuerySub: "e.g. 'Best fertilizer for wheat?'",
    whatsAppShareBtn: "Share on WhatsApp",
    whatsAppSupportBtn: "WhatsApp Support",
    agriAdvisorBtn: "Call Agri Doctor",
    moistureLabel: "Soil Moisture",
    tempLabel: "Field Temperature",
    humidityLabel: "Air Humidity",
    npkLabel: "Soil Nutrients (NPK)",
    phLabel: "Soil Health (pH)",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    moistureLow: "Soil dry, irrigation needed ❌",
    moistureGood: "Moisture is optimal ✅",
    moistureHigh: "High water saturation ⚠️",
    tempLow: "Cold stress alert ❄️",
    tempGood: "Temperature is ideal ✅",
    tempHigh: "Heat stress alert ⚠️",
    humidityHigh: "High humidity, pest risk ⚠️",
    humidityGood: "Air humidity normal ✅",
    npkSub: "Nitrogen, Phosphorus, and Potassium",
    phSub: "Ideal range 6.0 to 7.5",
    historyTitle: "Past 7-Day Trend",
    listening: "Listening to your voice...",
    notSupported: "Voice query is not supported by your browser."
  },
  kn: {
    title: "ನನ್ನ ಹೊಲದ ಪರಿಸ್ಥಿತಿ",
    welcome: "ನಮಸ್ತೆ",
    sub: "ನಿಮ್ಮ ಹೊಲದ ಲೈವ್ ಮಾಹಿತಿ ಇಲ್ಲಿದೆ",
    sensorStatus: "ಸೆನ್ಸರ್ ಸ್ಥಿತಿ",
    connected: "ಸಕ್ರಿಯವಾಗಿದೆ",
    disconnected: "ಆಫ್‌ಲೈನ್ ಆಗಿದೆ",
    voiceReadBtn: "ಸ್ಥಿತಿ ಆಲಿಸಿ",
    voiceQueryBtn: "ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ",
    voiceQuerySub: "ಉದಾ: 'ಗೋಧಿಗೆ ಯಾವ ಗೊಬ್ಬರ?'",
    whatsAppShareBtn: "ವಾಟ್ಸಾಪ್ ವರದಿ",
    whatsAppSupportBtn: "ವಾಟ್ಸಾಪ್ ಸಹಾಯ",
    agriAdvisorBtn: "ಕೃಷಿ ತಜ್ಞರ ಕರೆ",
    moistureLabel: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    tempLabel: "ತಾಪಮಾನ",
    humidityLabel: "ಗಾಳಿಯ ತೇವಾಂಶ",
    npkLabel: "ಮಣ್ಣಿನ ಶಕ್ತಿ (NPK)",
    phLabel: "ಮಣ್ಣಿನ pH ಮಟ್ಟ",
    nitrogen: "ಸಾರಜನಕ (N)",
    phosphorus: "ರಂಜಕ (P)",
    potassium: "ಪೊಟ್ಯಾಸಿಯಮ್ (K)",
    moistureLow: "ನೆಲ ಒಣಗಿದೆ, ನೀರು ಹಾಕಿ ❌",
    moistureGood: "ತೇವಾಂಶ ಸರಿಯಾಗಿದೆ ✅",
    moistureHigh: "ನೀರು ಹೆಚ್ಚಾಗಿದೆ ⚠️",
    tempLow: "ಚಳಿ ಹೆಚ್ಚಾಗಿದೆ ❄️",
    tempGood: "ತಾಪಮಾನ ಸೂಕ್ತವಾಗಿದೆ ✅",
    tempHigh: "ಬಿಸಿಲು ಹೆಚ್ಚಾಗಿದೆ ⚠️",
    humidityHigh: "ಕೀಟಗಳ ಅಪಾಯವಿದೆ ⚠️",
    humidityGood: "ಗಾಳಿಯ ತೇವಾಂಶ ಸರಿಯಾಗಿದೆ ✅",
    npkSub: "ಪೋಷಕಾಂಶಗಳ ಮಟ್ಟ",
    phSub: "ಸೂಕ್ತ ಮಟ್ಟ 6.0 - 7.5",
    historyTitle: "ಕಳೆದ ದಿನಗಳ ಪ್ರವೃತ್ತಿ",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...",
    notSupported: "ನಿಮ್ಮ ಫೋನ್ ಧ್ವನಿ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ."
  },
  ta: {
    title: "என் விவசாய நிலைமை",
    welcome: "வணக்கம்",
    sub: "உங்கள் நிலத்தின் நேரடி தகவல் இங்கே",
    sensorStatus: "சென்சார் நிலை",
    connected: "இயங்குகிறது",
    disconnected: "இணைக்கப்படவில்லை",
    voiceReadBtn: "நிலவரம் கேட்க",
    voiceQueryBtn: "குரல் கேள்வி",
    voiceQuerySub: "உதாரணம்: 'பயிருக்கு என்ன உரம்?'",
    whatsAppShareBtn: "வாட்ஸ்அப் அறிக்கை",
    whatsAppSupportBtn: "வாட்ஸ்அப் உதவி",
    agriAdvisorBtn: "விவசாய மருத்துவர்",
    moistureLabel: "மண் ஈரப்பதம்",
    tempLabel: "வெப்பநிலை",
    humidityLabel: "காற்றின் ஈரப்பதம்",
    npkLabel: "மண் சத்துக்கள் (NPK)",
    phLabel: "மண் pH",
    nitrogen: "நைட்ரஜன் (N)",
    phosphorus: "பாஸ்பரஸ் (P)",
    potassium: "பொட்டாசியம் (K)",
    moistureLow: "நிலம் வறண்டுள்ளது ❌",
    moistureGood: "ஈரப்பதம் சரியானது ✅",
    moistureHigh: "தண்ணீர் அதிகம் ⚠️",
    tempLow: "குளிர் அதிகம் ❄️",
    tempGood: "வெப்பநிலை சாதகம் ✅",
    tempHigh: "வெப்பம் அதிகம் ⚠️",
    humidityHigh: "பூச்சி அபாயம் ⚠️",
    humidityGood: "ஈரப்பதம் சரியானது ✅",
    npkSub: "சத்துக்கள் அளவு",
    phSub: "சிறந்த வரம்பு 6.0 - 7.5",
    historyTitle: "கடந்த நாட்களின் நிலைமை",
    listening: "கேட்கிறது...",
    notSupported: "குரல் தேடல் கிடைக்கவில்லை."
  },
  te: {
    title: "నా పొలం పరిస్థితి",
    welcome: "నమస్తే",
    sub: "మీ పొలం యొక్క లైవ్ సమాచారం",
    sensorStatus: "సెన్సార్ స్థితి",
    connected: "కనెక్ట్ అయింది",
    disconnected: "ఆఫ్‌లైన్",
    voiceReadBtn: "వివరాలు వినండి",
    voiceQueryBtn: "వాయిస్ ప్రశ్న",
    voiceQuerySub: "ఉదా: 'పంటకు ఏ ఎరువు వేయాలి?'",
    whatsAppShareBtn: "వాట్సాప్ నివేదిక",
    whatsAppSupportBtn: "వాట్సాప్ సహాయం",
    agriAdvisorBtn: "వ్యవసాయ నిపుణులు",
    moistureLabel: "మట్టి తేమ",
    tempLabel: "ఉష్ణోగ్రత",
    humidityLabel: "గాలిలోని తేమ",
    npkLabel: "మట్టి బలం (NPK)",
    phLabel: "మట్టి pH",
    nitrogen: "నైట్రోజన్ (N)",
    phosphorus: "ఫాస్పరస్ (P)",
    potassium: "పొటాషియం (K)",
    moistureLow: "పొలం ఎండిపోయింది ❌",
    moistureGood: "తేమ సరిగ్గా ఉంది ✅",
    moistureHigh: "నీరు ఎక్కువ ⚠️",
    tempLow: "చలి ఎక్కువ ❄️",
    tempGood: "ఉష్ణోగ్రత అనుకూలం ✅",
    tempHigh: "ఎండ ఎక్కువ ⚠️",
    humidityHigh: "పురుగుల ప్రమాదం ⚠️",
    humidityGood: "తేమ అనుకూలం ✅",
    npkSub: "పోషకాల స్థాయిలు",
    phSub: "సరైన పరిధి 6.0 - 7.5",
    historyTitle: "గత కొన్ని రోజుల స్థితి",
    listening: "వింటున్నాము...",
    notSupported: "వాయిస్ క్వెరీ సపోర్ట్ లేదు."
  },
  ml: {
    title: "കൃഷിയിടം", welcome: "നമസ്തേ", sub: "ലൈവ് കൃഷി വിവരങ്ങൾ",
    sensorStatus: "സെൻസർ", connected: "ഓൺ ആണ്", disconnected: "ഓഫ് ആണ്",
    voiceReadBtn: "ശബ്ദത്തിൽ കേൾക്കൂ", voiceQueryBtn: "സംശയം ചോദിക്കൂ", voiceQuerySub: "ഏത് വളം ഉപയോഗിക്കണം?",
    whatsAppShareBtn: "വാട്സാപ്പ് റിപ്പോർട്ട്", whatsAppSupportBtn: "വാട്സാപ്പ് സഹായം", agriAdvisorBtn: "കൃഷി വിദഗ്ദ്ധൻ",
    moistureLabel: "മണ്ണിലെ ഈർപ്പം", tempLabel: "താപനില", humidityLabel: "വായുവിലെ ഈർപ്പം",
    npkLabel: "മണ്ണ് പോഷകങ്ങൾ", phLabel: "മണ്ണ് pH", nitrogen: "നൈട്രജൻ", phosphorus: "ഫോസ്ഫറസ്", potassium: "പൊട്ടാസ്യം",
    moistureLow: "നനയ്ക്കുക ❌", moistureGood: "ഈർപ്പം കൃത്യം ✅", moistureHigh: "വെള്ളം കൂടുതൽ ⚠️",
    tempLow: "തണുപ്പ് ❄️", tempGood: "അനുകൂലം ✅", tempHigh: "ചൂട് ⚠️", humidityHigh: "കീടബാധ സാധ്യത ⚠️", humidityGood: "സാധാരണം ✅",
    npkSub: "പോഷക നിലവാരം", phSub: "പരിധി 6.0 - 7.5", historyTitle: "കഴിഞ്ഞ ദിവസങ്ങൾ", listening: "ശ്രദ്ധിക്കുന്നു...", notSupported: "പിന്തുണയില്ല."
  },
  mr: {
    title: "शेताची स्थिती", welcome: "नमस्ते", sub: "थेट शेती माहिती आणि सल्ला",
    sensorStatus: "सेन्सर स्थिती", connected: "चालू आहे", disconnected: "बंद आहे",
    voiceReadBtn: "माहिती ऐका", voiceQueryBtn: "बोलून विचारा", voiceQuerySub: "उदा. 'कोणते खत वापरावे?'",
    whatsAppShareBtn: "व्हॉट्सॲप रिपोर्ट", whatsAppSupportBtn: "व्हॉट्सॲप मदत", agriAdvisorBtn: "कृषी डॉक्टर",
    moistureLabel: "मातीतील ओलावा", tempLabel: "तापमान", humidityLabel: "हवेतील दमटपणा",
    npkLabel: "मातीची ताकद (NPK)", phLabel: "माती pH", nitrogen: "नायट्रोजन", phosphorus: "फॉस्फरस", potassium: "पोटॅशियम",
    moistureLow: "पाणी द्या ❌", moistureGood: "ओलावा योग्य ✅", moistureHigh: "पाणी जास्त ⚠️",
    tempLow: "थंडी जास्त ❄️", tempGood: "तापमान अनुकूल ✅", tempHigh: "उष्णता जास्त ⚠️", humidityHigh: "कीड धोका ⚠️", humidityGood: "योग्य ✅",
    npkSub: "पोषक द्रव्य पातळी", phSub: "योग्य स्तर 6.0 - 7.5", historyTitle: "मागील कल", listening: "ऐकत आहे...", notSupported: "सपोर्ट नाही."
  },
  bn: {
    title: "খামারের অবস্থা", welcome: "নমস্কার", sub: "লাইভ খামার তথ্য ও পরামর্শ",
    sensorStatus: "সেন্সর", connected: "সক্রিয়", disconnected: "অফলাইন",
    voiceReadBtn: "রিপোর্ট শুনুন", voiceQueryBtn: "মুখে বলুন", voiceQuerySub: "যেমন: 'কোন সার দেব?'",
    whatsAppShareBtn: "হোয়াটসঅ্যাপ রিপোর্ট", whatsAppSupportBtn: "সহায়তা টিম", agriAdvisorBtn: "কৃষি বিশেষজ্ঞ",
    moistureLabel: "মাটির আর্দ্রতা", tempLabel: "তাপমাত্রা", humidityLabel: "বাতাসের আর্দ্রতা",
    npkLabel: "মাটির পুষ্টি (NPK)", phLabel: "মাটির pH", nitrogen: "নাইট্রোজেন", phosphorus: "ফসফরাস", potassium: "পটাশিয়াম",
    moistureLow: "জল দিন ❌", moistureGood: "আর্দ্রতা ঠিক ✅", moistureHigh: "জল বেশি ⚠️",
    tempLow: "ঠান্ডা ❄️", tempGood: "অনুকূল ✅", tempHigh: "গরম ⚠️", humidityHigh: "পোকার ভয় ⚠️", humidityGood: "স্বাভাবিক ✅",
    npkSub: "পুষ্টির মাত্রা", phSub: "আদর্শ 6.0 - 7.5", historyTitle: "বিগত দিনের ট্রেন্ড", listening: "শুনছি...", notSupported: "সাপোর্ট নেই।"
  },
  pa: {
    title: "ਖੇਤ ਦੀ ਸਥਿਤੀ", welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", sub: "ਲਾਈਵ ਖੇਤ ਜਾਣਕਾਰੀ ਅਤੇ ਸਲਾਹ",
    sensorStatus: "ਸੈਂਸਰ", connected: "ਚਾਲੂ ਹੈ", disconnected: "ਬੰਦ ਹੈ",
    voiceReadBtn: "ਹਾਲ ਸੁਣੋ", voiceQueryBtn: "ਬੋਲ ਕੇ ਪੁੱਛੋ", voiceQuerySub: "ਜਿਵੇਂ: 'ਕਿਹੜੀ ਖਾਦ ਪਾਈਏ?'",
    whatsAppShareBtn: "ਵਟਸਐਪ ਰਿਪੋਰਟ", whatsAppSupportBtn: "ਮਦਦ ਟੀਮ", agriAdvisorBtn: "ਖੇਤੀ ਮਾਹਿਰ",
    moistureLabel: "ਮਿੱਟੀ ਦੀ ਨਮੀ", tempLabel: "ਤਾਪਮਾਨ", humidityLabel: "ਹਵਾ ਦੀ ਨਮੀ",
    npkLabel: "ਮਿੱਟੀ ਤਾਕਤ (NPK)", phLabel: "ਮਿੱਟੀ pH", nitrogen: "ਨਾਈਟ੍ਰੋਜਨ", phosphorus: "ਫਾਸਫੋਰਸ", potassium: "ਪੋਟਾਸ਼ੀਅਮ",
    moistureLow: "ਪਾਣੀ ਲਾਓ ❌", moistureGood: "ਨਮੀ ਠੀਕ ✅", moistureHigh: "ਪਾਣੀ ਜ਼ਿਆਦਾ ⚠️",
    tempLow: "ਸਰਦੀ ❄️", tempGood: "ਅਨੁਕੂਲ ✅", tempHigh: "ਗਰਮੀ ⚠️", humidityHigh: "ਕੀੜਿਆਂ ਦਾ ਖਤਰਾ ⚠️", humidityGood: "ਠੀਕ ✅",
    npkSub: "ਪੌਸ਼ਟਿਕ ਤੱਤ", phSub: "ਸਹੀ 6.0 - 7.5", historyTitle: "ਪਿਛਲਾ ਰੁਝਾਨ", listening: "ਸੁਣ ਰਿਹਾ ਹੈ...", notSupported: "ਸਪੋਰਟ ਨਹੀਂ ਹੈ।"
  },
  gu: {
    title: "ખેતરની સ્થિતિ", welcome: "નમસ્તે", sub: "લાઈવ ખેતી માહિતી અને સલાહ",
    sensorStatus: "સેન્સર", connected: "ચાલુ છે", disconnected: "ઓફલાઇન",
    voiceReadBtn: "માહિતી સાંભળો", voiceQueryBtn: "બોલીને પૂછો", voiceQuerySub: "જેમ કે: 'કયું ખાતર વાપરવું?'",
    whatsAppShareBtn: "વોટ્સએપ રિપોર્ટ", whatsAppSupportBtn: "સહાયતા ટીમ", agriAdvisorBtn: "કૃષિ નિષ્ણાત",
    moistureLabel: "જમીનની ભેજ", tempLabel: "તાપમાન", humidityLabel: "હવામાં ભેજ",
    npkLabel: "પોષક તત્વો (NPK)", phLabel: "જમીનનું pH", nitrogen: "નાઇટ્રોજન", phosphorus: "ફોસ્ફરસ", potassium: "પોટેશિયમ",
    moistureLow: "પાણી આપો ❌", moistureGood: "ભેજ યોગ્ય ✅", moistureHigh: "પાણી વધુ ⚠️",
    tempLow: "ઠંડી ❄️", tempGood: "અનુકૂળ ✅", tempHigh: "ગરમી ⚠️", humidityHigh: "જીવાતનો ભય ⚠️", humidityGood: "યોગ્ય ✅",
    npkSub: "તત્વોનું સ્તર", phSub: "આદર્શ 6.0 - 7.5", historyTitle: "પાછલા દિવસોનો ટ્રેન્ડ", listening: "સાંભળી રહ્યા છીએ...", notSupported: "સપોર્ટ નથી."
  },
  hi_en: {
    title: "Mere Khet Ka Haal", welcome: "Namaste", sub: "Live farm metrics & advisory",
    sensorStatus: "Sensor Status", connected: "Online (Active)", disconnected: "Offline",
    voiceReadBtn: "Khet ka haal sunein", voiceQueryBtn: "Bolkar poochein", voiceQuerySub: "e.g. 'Aloo mein konsi khaad dalein?'",
    whatsAppShareBtn: "WhatsApp Report", whatsAppSupportBtn: "WhatsApp Support", agriAdvisorBtn: "Call Agri Doctor",
    moistureLabel: "Mitti ki nami", tempLabel: "Tapmaan", humidityLabel: "Hawa ki nami",
    npkLabel: "Mitti nutrients (NPK)", phLabel: "Mitti pH", nitrogen: "Nitrogen", phosphorus: "Phosphorus", potassium: "Potassium",
    moistureLow: "Paani dalein ❌", moistureGood: "Nami sahi hai ✅", moistureHigh: "Paani jyada hai ⚠️",
    tempLow: "Thand jyada ❄️", tempGood: "Tapmaan sahi ✅", tempHigh: "Garmi jyada ⚠️", humidityHigh: "Keede ka khatra ⚠️", humidityGood: "Nami normal ✅",
    npkSub: "Nutrient levels", phSub: "Best range 6.0 - 7.5", historyTitle: "Pichle dino ka trend", listening: "Sun rahe hain...", notSupported: "Support nahi hai."
  }
}

export default function DashboardPage() {
  const { user, ready } = useAuth()
  const router = useRouter()
  const { t, lang } = useLanguage()

  const [greeting, setGreeting] = useState("Namaste")
  
  // Real-Time Sensor states (fetched dynamically from real ESP32 database)
  const [sensorOnline, setSensorOnline] = useState(false)
  const [moisture, setMoisture] = useState(0) // %
  const [temp, setTemp] = useState(0) // °C
  const [humidity, setHumidity] = useState(0) // %
  const [nitrogen, setNitrogen] = useState(0) // mg/kg
  const [phosphorus, setPhosphorus] = useState(0) // mg/kg
  const [potassium, setPotassium] = useState(0) // mg/kg
  const [ph, setPh] = useState(0)

  const [isListening, setIsListening] = useState(false)

  // Localized dictionary selector
  const lt = useMemo(() => {
    return localDict[lang as Lang] || localDict.hi
  }, [lang])

  // Poll real-time sensor data from physical backend database every 5 seconds
  const fetchLatestSensor = async () => {
    try {
      const res = await fetch("/api/sensor/latest")
      if (res.ok) {
        const data = await res.json()
        setMoisture(Math.round(data.soil_moisture ?? 0))
        setTemp(Math.round(data.temperature ?? data.soil_temperature ?? 0))
        setHumidity(Math.round(data.humidity ?? 0))
        if (typeof data.nitrogen === "number") setNitrogen(data.nitrogen)
        if (typeof data.phosphorus === "number") setPhosphorus(data.phosphorus)
        if (typeof data.potassium === "number") setPotassium(data.potassium)
        if (typeof data.ph_level === "number") setPh(data.ph_level)
        setSensorOnline(true)
      } else {
        setSensorOnline(false)
      }
    } catch (err) {
      setSensorOnline(false)
    }
  }

  useEffect(() => {
    const hrs = new Date().getHours()
    if (hrs < 12) setGreeting(t("goodMorning"))
    else if (hrs < 17) setGreeting(t("goodAfternoon"))
    else setGreeting(t("goodEvening"))

    fetchLatestSensor()
    const interval = setInterval(fetchLatestSensor, 5000)
    return () => clearInterval(interval)
  }, [t])

  // Auth guard is handled by AuthGate in Providers.tsx — no redirect needed here.


  // Text-To-Speech (Read aloud status)
  const speakStatus = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    let txt = ""
    if (lang === "hi") {
      txt = `नमस्ते, ${user?.name || "किसान साथी"}। आपके खेत का हाल इस प्रकार है। `
      if (!sensorOnline) {
        txt += `सेंसर डिवाइस अभी ऑफ़लाइन है। कृपया अपने खेत का लाइव डेटा प्राप्त करने के लिए सेंसर डिवाइस चालू करें।`
      } else {
        txt += `मिट्टी की नमी ${moisture} प्रतिशत है। `
        if (moisture < 30) txt += `खेत सूखा है, सिंचाई आवश्यक है। `
        else if (moisture > 55) txt += `पानी अधिक है, जल निकासी करें। `
        else txt += `नमी बिल्कुल सही है। `

        txt += `तापमान ${temp} डिग्री सेल्सियस है। `
        txt += `मिट्टी में नाइट्रोजन ${nitrogen}, फास्फोरस ${phosphorus}, और पोटाश ${potassium} मिलीग्राम प्रति किलोग्राम है।`
      }
    } else {
      txt = `Hello, ${user?.name || "Farmer"}. Here is your farm condition report. `
      if (!sensorOnline) {
        txt += `Sensor is offline. Please turn on your sensor hub to receive live readings.`
      } else {
        txt += `Soil moisture is ${moisture} percent. `
        if (moisture < 30) txt += `Soil is dry, irrigation is recommended. `
        else if (moisture > 55) txt += `Moisture level is high. `
        else txt += `Moisture is optimal. `

        txt += `Temperature is ${temp} degrees Celsius. `
        txt += `Nutrient levels: Nitrogen ${nitrogen}, Phosphorus ${phosphorus}, Potassium ${potassium}.`
      }
    }

    const utterance = new SpeechSynthesisUtterance(txt)
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US"
    window.speechSynthesis.speak(utterance)
  }

  // Speech-To-Text (Voice input query)
  const handleVoiceQuery = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert(lt.notSupported)
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const recognition = new SR()
    recognition.lang = lang === "hi" ? "hi-IN" : "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript
      setIsListening(false)
      if (spokenText) {
        router.push(`/chatbot?q=${encodeURIComponent(spokenText)}`)
      }
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  // Share report on WhatsApp
  const shareOnWhatsApp = () => {
    let text = `🌾 *कृषि रिपोर्ट (KisaanBuddy)* 🌾\n`
    text += `👤 *किसान:* ${user?.name || "किसान साथी"}\n`
    text += `📅 *दिनांक:* ${new Date().toLocaleDateString()}\n\n`
    if (!sensorOnline) {
      text += `🚨 *सेंसर वर्तमान में ऑफ़लाइन है।*\n`
    } else {
      text += `💧 *मिट्टी की नमी:* ${moisture}%\n`
      text += `☀️ *तापमान:* ${temp}°C\n`
      text += `💨 *हवा की नमी:* ${humidity}%\n`
      text += `🧪 *मिट्टी स्वास्थ्य (pH):* ${ph}\n\n`
      text += `🧪 *मुख्य पोषक तत्व (NPK):*\n`
      text += `  • नाइट्रोजन: ${nitrogen} mg/kg\n`
      text += `  • फास्फोरस: ${phosphorus} mg/kg\n`
      text += `  • पोटाश: ${potassium} mg/kg\n\n`
    }
    text += `📲 *KisaanBuddy से प्राप्त प्रमाणित रिपोर्ट*`

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    trackEvent({ type: 'whatsapp_share', url: url, title: 'Dashboard Farm Sensor Report' })
    window.open(url, "_blank")
  }

  // Open WhatsApp directly for help
  const openWhatsAppSupport = () => {
    let text = `नमस्ते! मुझे KisaanBuddy कृषि सलाहकार से परामर्श लेना है। `
    if (sensorOnline) {
      text += `मेरे खेत में नमी ${moisture}%, तापमान ${temp}°C है।`
    }
    const url = `https://wa.me/919876543210?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground font-semibold text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading farm overview...
        </div>
      </div>
    )
  }

  // Dynamic advice styling
  const moistureAdvice = moisture < 30 ? lt.moistureLow : moisture > 55 ? lt.moistureHigh : lt.moistureGood
  const moistureColor = moisture < 30 ? "border-destructive/30 bg-destructive/10 text-destructive" : moisture > 55 ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300" : "border-primary/30 bg-primary/10 text-primary-900 dark:text-primary"

  const tempAdvice = temp < 15 ? lt.tempLow : temp > 35 ? lt.tempHigh : lt.tempGood
  const tempColor = temp < 15 ? "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300" : temp > 35 ? "border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-300" : "border-primary/30 bg-primary/10 text-primary-900 dark:text-primary"

  const humidityAdvice = humidity > 80 ? lt.humidityHigh : lt.humidityGood
  const humidityColor = humidity > 80 ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300" : "border-primary/30 bg-primary/10 text-primary-900 dark:text-primary"

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-6xl mx-auto">
      
      {/* ─── 1. FARM WELCOME HEADER BANNER ─── */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-7 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>KisaanBuddy Smart Farm Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-tight">
            {greeting}, <span className="text-primary">{user.name}</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {lt.sub}
          </p>
        </div>

        {/* Device Status & Simulation Trigger */}
        <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl p-3 shrink-0 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
              sensorOnline
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}>
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">{lt.sensorStatus}</div>
              <div className={`text-xs font-bold flex items-center gap-1.5 ${
                sensorOnline ? "text-primary" : "text-destructive"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-current ${sensorOnline ? "animate-pulse" : ""}`} />
                {sensorOnline ? lt.connected : lt.disconnected}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── 2. VOICE QUICK ACTIONS ROW ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <button
          type="button"
          onClick={speakStatus}
          className="flex h-12 items-center justify-center gap-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <Volume2 className="h-4 w-4" />
          <span>{lt.voiceReadBtn}</span>
        </button>

        <button
          type="button"
          onClick={handleVoiceQuery}
          className={`flex h-12 items-center justify-center gap-2.5 rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-[0.98] ${
            isListening
              ? "bg-destructive text-destructive-foreground animate-pulse"
              : "border border-border bg-card hover:bg-muted text-foreground"
          }`}
        >
          <Mic className={`h-4 w-4 ${isListening ? "" : "text-primary"}`} />
          <div className="flex items-center gap-1.5">
            <span>{isListening ? lt.listening : lt.voiceQueryBtn}</span>
            {!isListening && (
              <span className="hidden sm:inline text-xs text-muted-foreground font-normal">
                ({lt.voiceQuerySub})
              </span>
            )}
          </div>
        </button>
      </div>

      {/* ─── 3. LIVE SOIL & WEATHER CONDITIONS ─── */}
      {!sensorOnline ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">सेंसर डिवाइस ऑफ़लाइन है / Sensor Offline</h3>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            आपके खेत में लगा KisaanBuddy IoT सेंसर अभी कनेक्टेड नहीं है। डिवाइस ऑन करते ही लाइव डेटा अपने आप अपडेट होगा।
          </p>
          <Link href="/worker-connect" className="btn-secondary h-9 text-xs">
            Find local farming support
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CircularGauge
              value={moisture}
              label={lt.moistureLabel}
              unit="%"
              icon={Droplets}
              iconColor="text-sky-500"
              strokeColor="stroke-sky-500"
              advice={moistureAdvice}
              adviceClass={moistureColor}
            />

            <CircularGauge
              value={temp}
              label={lt.tempLabel}
              unit="°C"
              icon={Thermometer}
              iconColor="text-orange-500"
              strokeColor="stroke-orange-500"
              advice={tempAdvice}
              adviceClass={tempColor}
            />

            <CircularGauge
              value={humidity}
              label={lt.humidityLabel}
              unit="%"
              icon={CloudSun}
              iconColor="text-teal-500"
              strokeColor="stroke-teal-500"
              advice={humidityAdvice}
              adviceClass={humidityColor}
            />
          </div>

          {/* Actionable advisories section */}
          <ActionableAdvisory
            moisture={moisture}
            temp={temp}
            humidity={humidity}
            lang={lang}
          />

          {/* Soil Nutrients (NPK) & Soil Health (pH) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 p-5 flex flex-col justify-between">
              <CardHeader className="p-0 pb-3 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-primary" />
                  <span>{lt.npkLabel}</span>
                </CardTitle>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">{lt.npkSub}</span>
              </CardHeader>
              <CardContent className="p-0 pt-4 space-y-3.5">
                {/* Nitrogen */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">{lt.nitrogen}</span>
                    <span className="text-foreground font-semibold font-mono">{nitrogen} mg/kg</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((nitrogen / 140) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Phosphorus */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">{lt.phosphorus}</span>
                    <span className="text-foreground font-semibold font-mono">{phosphorus} mg/kg</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min((phosphorus / 100) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Potassium */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">{lt.potassium}</span>
                    <span className="text-foreground font-semibold font-mono">{potassium} mg/kg</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((potassium / 280) * 100, 100)}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Soil Health (pH) */}
            <Card className="p-5 flex flex-col justify-between text-center">
              <CardHeader className="p-0 pb-3 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>{lt.phLabel}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-5 space-y-3">
                <div className="text-4xl font-bold font-display text-foreground">{ph}</div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>उपजाऊ मिट्टी (Optimal)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {lt.phSub}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ─── 4. WHATSAPP & EXPERT COORDINATION ROW ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={shareOnWhatsApp}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
        >
          <Share2 className="h-4 w-4 text-primary" />
          <span>{lt.whatsAppShareBtn}</span>
        </button>

        <button
          type="button"
          onClick={openWhatsAppSupport}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 text-xs font-semibold text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366]/15 transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <span>{lt.whatsAppSupportBtn}</span>
        </button>

        <a
          href="tel:919876543210"
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-500/15 transition-colors"
        >
          <Phone className="h-4 w-4 text-sky-500" />
          <span>{lt.agriAdvisorBtn}</span>
        </a>
      </div>

      {/* ─── 5. FARM TOOLS NAVIGATION GRID ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("dashboard.all_farm_tools")}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { href: "/weather", label: t("dashboard.weather_alerts"), icon: CloudSun, desc: "मौसम और बारिश अलर्ट", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
            { href: "/disease", label: t("dashboard.disease_detect"), icon: Bug, desc: "पत्ती रोग पहचान AI", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
            { href: "/crop-predictor", label: t("aiPredictor"), icon: Sprout, desc: "सटीक फसल चयन मॉडल", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
            { href: "/soil-health", label: t("dashboard.soil_health"), icon: Activity, desc: "खाद व पोषण गणना", color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
            { href: "/mandi", label: t("dashboard.mandi_rates"), icon: TrendingUp, desc: "लाइव eNAM APMC भाव", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
            { href: "/khet-diary", label: "Khet Diary", icon: BookOpen, desc: "डिजिटल खर्च बहीखाता", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
            { href: "/worker-connect", label: t("dashboard.workers"), icon: Users, desc: "मजदूर व ट्रैक्टर सेवा", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
            { href: "/schemes", label: t("dashboard.schemes"), icon: Landmark, desc: "सरकारी योजनाएं व सब्सिडी", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
          ].map((item, idx) => {
            const ToolIcon = item.icon
            return (
              <Link key={idx} href={item.href}>
                <div className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-xs transition-all duration-150 h-full flex flex-col justify-between group">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg border ${item.color}`}>
                      <ToolIcon className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
