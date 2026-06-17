"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  CloudSun, Sprout, Bug, TrendingUp, Users, Landmark, Activity,
  BookOpen, ChevronRight, Thermometer, Droplets, Mic, MessageCircle,
  Phone, AlertTriangle, Cpu, Volume2, Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useLanguage, Lang } from "@/lib/language"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularGauge } from "@/components/dashboard/CircularGauge"
import { ActionableAdvisory } from "@/components/dashboard/ActionableAdvisory"

// Recharts components
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts"

/* ─── Motion Presets ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
})

/* ─── 10-Language Farmer Dictionary ─── */
const localDict: Record<Lang, Record<string, string>> = {
  hi: {
    title: "मेरे खेत का हाल",
    welcome: "नमस्ते",
    sub: "आपके खेत की लाइव जानकारी यहाँ उपलब्ध है",
    sensorStatus: "सेंसर कनेक्शन:",
    connected: "सेंसर चालू है 🟢",
    disconnected: "सेंसर बंद है 🔴",
    voiceReadBtn: "📢 खेत का हाल आवाज़ में सुनें",
    voiceQueryBtn: "🎙️ बोलकर समस्या पूछें",
    voiceQuerySub: "जैसे: 'आलू में कौन सी खाद डालें?'",
    whatsAppShareBtn: "💬 व्हाट्सएप पर रिपोर्ट भेजें",
    whatsAppSupportBtn: "🟢 व्हाट्सएप सहायता टीम",
    agriAdvisorBtn: "📞 कृषि डॉक्टर से बात करें",
    moistureLabel: "💧 मिट्टी की नमी (जमीन का पानी)",
    tempLabel: "☀️ तापमान (गर्मी या ठंड)",
    humidityLabel: "💨 हवा की नमी (हवा में पानी)",
    npkLabel: "🌾 मिट्टी की ताकत (मुख्य खाद)",
    phLabel: "🧪 मिट्टी का स्वास्थ्य (pH)",
    nitrogen: "नाइट्रोजन (यूरिया खाद)",
    phosphorus: "फास्फोरस (सुपर खाद)",
    potassium: "पोटेशियम (पोटाश खाद)",
    moistureLow: "खेत सूखा है, अभी पानी डालें! ❌",
    moistureGood: "नमी बिल्कुल सही है, पानी की आवश्यकता नहीं है। ✅",
    moistureHigh: "पानी ज्यादा है, जल निकासी करें। ⚠️",
    tempLow: "ठंड अधिक है, फसलों का ध्यान रखें। ❄️",
    tempGood: "तापमान फसल के लिए अनुकूल है। ✅",
    tempHigh: "गर्मी बहुत ज्यादा है, खेत में नमी बनाए रखें। ⚠️",
    humidityHigh: "हवा में पानी ज्यादा है, कीड़े लगने का खतरा है! ⚠️",
    humidityGood: "हवा की नमी अनुकूल है। ✅",
    npkSub: "नाइट्रोजन, फास्फोरस और पोटाश का स्तर",
    phSub: "मिट्टी का स्वास्थ्य (6.0 से 7.5 सर्वोत्तम है)",
    historyTitle: "पिछले दिनों का हाल",
    listening: "आपकी आवाज़ सुनी जा रही है...",
    notSupported: "आपका फ़ोन बोलकर पूछने का समर्थन नहीं करता है।"
  },
  en: {
    title: "My Farm Condition",
    welcome: "Namaste",
    sub: "Check your live farm status below",
    sensorStatus: "Sensor Connection:",
    connected: "Sensor Connected 🟢",
    disconnected: "Sensor Disconnected 🔴",
    voiceReadBtn: "📢 Listen to Farm Status (Voice)",
    voiceQueryBtn: "🎙️ Ask Problem by Speaking",
    voiceQuerySub: "e.g., 'What fertilizer to use for wheat?'",
    whatsAppShareBtn: "💬 Share Report on WhatsApp",
    whatsAppSupportBtn: "🟢 WhatsApp Support Team",
    agriAdvisorBtn: "📞 Call Agri Expert",
    moistureLabel: "💧 Soil Moisture (Water in Soil)",
    tempLabel: "☀️ Temperature (Heat / Cold)",
    humidityLabel: "💨 Air Moisture (Humidity)",
    npkLabel: "🌾 Soil Nutrients (Fertilizer strength)",
    phLabel: "🧪 Soil Health (pH balance)",
    nitrogen: "Nitrogen (Urea Level)",
    phosphorus: "Phosphorus (Super Level)",
    potassium: "Potassium (Potash Level)",
    moistureLow: "Soil is dry, water it now! ❌",
    moistureGood: "Moisture is perfect, no watering needed. ✅",
    moistureHigh: "Too much water, drain the field. ⚠️",
    tempLow: "It is very cold, protect the crops. ❄️",
    tempGood: "Temperature is ideal for crop growth. ✅",
    tempHigh: "Too hot, keep soil moist. ⚠️",
    humidityHigh: "Air is very damp, pest alert! ⚠️",
    humidityGood: "Air moisture is normal. ✅",
    npkSub: "Nitrogen, Phosphorus, and Potassium levels",
    phSub: "Soil health status (6.0 to 7.5 is best)",
    historyTitle: "Past Days Trend",
    listening: "Listening to your voice...",
    notSupported: "Voice query is not supported by your browser."
  },
  kn: {
    title: "ನನ್ನ ಹೊಲದ ಪರಿಸ್ಥಿತಿ",
    welcome: "ನಮಸ್ತೆ",
    sub: "ನಿಮ್ಮ ಹೊಲದ ಲೈವ್ ಮಾಹಿತಿ ಇಲ್ಲಿದೆ",
    sensorStatus: "ಸೆನ್ಸರ್ ಸಂಪರ್ಕ:",
    connected: "ಸೆನ್ಸರ್ ಆನ್ ಆಗಿದೆ 🟢",
    disconnected: "ಸೆನ್ಸರ್ ಆಫ್ ಆಗಿದೆ 🔴",
    voiceReadBtn: "📢 ಹೊಲದ ಸ್ಥيتಿಯನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ",
    voiceQueryBtn: "🎙️ ಧ್ವನಿಯ ಮೂಲಕ समस्या ಕೇಳಿ",
    voiceQuerySub: "ಉದಾಹರಣೆಗೆ: 'ಗೋಧಿಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?'",
    whatsAppShareBtn: "💬 ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ವರದಿ ಕಳುಹಿಸಿ",
    whatsAppSupportBtn: "🟢 ವಾಟ್ಸಾಪ್ ಸಹಾಯ ತಂಡ",
    agriAdvisorBtn: "📞 ಕೃಷಿ ವೈದ್ಯರೊಂದಿಗೆ ಮಾತನಾಡಿ",
    moistureLabel: "💧 ಮಣ್ಣಿನ ತೇವಾಂಶ (ಮಣ್ಣಿನಲ್ಲಿರುವ ನೀರು)",
    tempLabel: "☀️ ತಾಪಮಾನ (ಬಿಸಿಲು ಅಥವಾ ಚಳಿ)",
    humidityLabel: "💨 ಗಾಳಿಯ ತೇವಾಂಶ",
    npkLabel: "🌾 ಮಣ್ಣಿನ ಶಕ್ತಿ (ಮುಖ್ಯ ಗೊಬ್ಬರ)",
    phLabel: "🧪 ಮಣ್ಣಿನ ಆರೋಗ್ಯ (pH)",
    nitrogen: "ಸಾರಜನಕ (ಯೂರಿಯಾ ಗೊಬ್ಬರ)",
    phosphorus: "ರಂಜಕ (ಸೂಪರ್ ಗೊಬ್ಬರ)",
    potassium: "ਪੋਟਾਸ਼ੀਅਮ (ਪੋਟਾਸ਼ ಗೊಬ್ಬರ)",
    moistureLow: "ನೆಲ ಒಣಗಿದೆ, ಈಗಲೇ ನೀರು ಹಾಕಿ! ❌",
    moistureGood: "ತೇവാಂಶ ಸರಿಯಾಗಿದೆ, ನೀರು ಹಾಕುವ ಅಗತ್ಯವಿಲ್ಲ. ✅",
    moistureHigh: "ನೀರು ಹೆಚ್ಚಾಗಿದೆ, ನೀರು ಹೊರಹಾಕಿ. ⚠️",
    tempLow: "ਚੜ੍ਹੀ ਚੜ੍ਹ ਹੈ, ਪਿਕਾਂ ਦੀ ਦੇਖਭਾਲ ਕਰੋ। ❄️",
    tempGood: "ತಾಪಮಾನ ಬೆಳೆಗೆ ಸೂಕ್ತವಾಗಿದೆ. ✅",
    tempHigh: "ಬಿಸಿಲು ಹೆಚ್ಚಾಗಿದೆ, ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಇರಿಸಿ. ⚠️",
    humidityHigh: "ಗಾಳಿಯಲ್ಲಿ ತೇವಾಂಶ ಹೆಚ್ಚಾಗಿದೆ, ಕೀಟಗಳ ಅಪಾಯವಿದೆ! ⚠️",
    humidityGood: "ಗಾಳಿಯ ತೇವಾಂಶ ಸರಿಯಾಗಿದೆ. ✅",
    npkSub: "ಸಾರಜನಕ, ರಂಜಕ ಮತ್ತು ಪೊಟ್ಯಾಸಿಯಮ್ ಮಟ್ಟ",
    phSub: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸ್ಥಿತಿ",
    historyTitle: "ಕಳೆದ ದಿನಗಳ ಸ್ಥಿತಿ",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...",
    notSupported: "ನಿಮ್ಮ ಫೋನ್ ಧ್ವನಿ ಪ್ರಶ್ನೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ."
  },
  ta: {
    title: "என் விவசாய நிலைமை",
    welcome: "வணக்கம்",
    sub: "உங்கள் நிலத்தின் நேரடி தகவல் இங்கே",
    sensorStatus: "சென்சார் இணைப்பு:",
    connected: "சென்சார் ஆன் செய்யப்பட்டுள்ளது 🟢",
    disconnected: "சென்சார் ஆஃப் செய்யப்பட்டுள்ளது 🔴",
    voiceReadBtn: "📢 விவசாய நில நிலவரத்தை குரலில் கேட்க",
    voiceQueryBtn: "🎙️ பேசி கேள்வி கேட்க",
    voiceQuerySub: "உதாரணம்: 'கோதுமைக்கு என்ன உரம் போட வேண்டும்?'",
    whatsAppShareBtn: "💬 வாட்ஸ்அப்பில் அறிக்கை அனுப்ப",
    whatsAppSupportBtn: "🟢 வாட்ஸ்அப் உதவி குழு",
    agriAdvisorBtn: "📞 விவசாய மருத்துவரிடம் பேச",
    moistureLabel: "💧 மண் ஈரப்பதம் (நிலத்தின் தண்ணீர்)",
    tempLabel: "☀️ வெப்பநிலை (வெப்பம் அல்லது குளிர்)",
    humidityLabel: "💨 காற்றின் ஈரப்பதம்",
    npkLabel: "🌾 மண்ணின் வலிமை (முக்கிய உரம்)",
    phLabel: "🧪 மண்ணின் ஆரோக்கியம் (pH)",
    nitrogen: "நைட்ரஜன் (யூரியா உரம்)",
    phosphorus: "பாஸ்பரஸ் (சூப்பர் உரம்)",
    potassium: "பொட்டாசியம் (பொட்டாஷ் உரம்)",
    moistureLow: "நிலம் வறண்டுள்ளது, உடனடியாக தண்ணீர் பாய்ச்சவும்! ❌",
    moistureGood: "ஈரப்பதம் சரியாக உள்ளது, தண்ணீர் தேவையில்லை. ✅",
    moistureHigh: "தண்ணீர் அதிகமாக உள்ளது, வடிகால் அமைக்கவும். ⚠️",
    tempLow: "குளிர் அதிகமாக உள்ளது, பயிர்களை பாதுகாக்கவும். ❄️",
    tempGood: "வெப்பநிலை பயிர்களுக்கு ஏற்றது. ✅",
    tempHigh: "வெப்பம் அதிகமாக உள்ளது, நிலத்தை ஈரப்பதமாக வைக்கவும். ⚠️",
    humidityHigh: "காற்றில் ஈரப்பதம் அதிகம், பூச்சி தாக்குதல் அபாயம்! ⚠️",
    humidityGood: "காற்றின் ஈரப்பதம் சரியாக உள்ளது. ✅",
    npkSub: "நைட்ரஜன், பாஸ்பரஸ் மற்றும் பொட்டாசியம் அளவு",
    phSub: "மண் ஆரோக்கிய நிலை",
    historyTitle: "கடந்த நாட்களின் நிலைமை",
    listening: "கேட்கிறது...",
    notSupported: "உங்கள் போன் குரல் தேடலை ஆதரிக்கவில்லை."
  },
  te: {
    title: "నా పొలం పరిస్థితి",
    welcome: "నమస్తే",
    sub: "మీ పొలం యొక్క లైవ్ సమాచారం ఇక్కడ చూడండి",
    sensorStatus: "సెన్సార్ కనెక్షన్:",
    connected: "సెన్సార్ ఆన్ లో ఉంది 🟢",
    disconnected: "సెన్సార్ ఆఫ్ లో ఉంది 🔴",
    voiceReadBtn: "📢 పొలం వివరాలు వాయిస్ లో వినండి",
    voiceQueryBtn: "🎙️ మాట్లాడి సమస్య అడగండి",
    voiceQuerySub: "ఉదాహరణ: 'గోధుమ పంటకు ఏ ఎరువు వేయాలి?'",
    whatsAppShareBtn: "💬 వాట్సాప్‌లో నివేదిక పంపండి",
    whatsAppSupportBtn: "🟢 వాట్సాప్ సహాయ బృందం",
    agriAdvisorBtn: "📞 వ్యవసాయ డాక్టర్ తో మాట్లాడండి",
    moistureLabel: "💧 మట్టి తేమ (భూమిలోని నీరు)",
    tempLabel: "☀️ ఉష్ణోగ్రత (ఎండ లేదా చలి)",
    humidityLabel: "💨 గాలిలోని తేమ",
    npkLabel: "🌾 మట్టి బలం (ముఖ్యమైన ఎరువులు)",
    phLabel: "🧪 మట్టి ఆరోగ్యం (pH)",
    nitrogen: "నైట్రోజన్ (యూరియా ఎరువు)",
    phosphorus: "ఫాస్పరస్ (సూపర్ ఎరువు)",
    potassium: "పొటాషియం (పొటాష్ ఎరువు)",
    moistureLow: "పొలం ఎండిపోయింది, వెంటనే నీరు పెట్టండి! ❌",
    moistureGood: "తేమ సరిగ్గా ఉంది, నీరు పెట్టాల్సిన పనిలేదు. ✅",
    moistureHigh: "నీరు ఎక్కువగా ఉంది, నీటిని బయటకు పంపండి. ⚠️",
    tempLow: "చలి ఎక్కువగా ఉంది, పంటలను కాపాడండి. ❄️",
    tempGood: "ఉష్ణోగ్రత పంటకు అనుకూలంగా ఉంది. ✅",
    tempHigh: "ఎండ ఎక్కువగా ఉంది, పొలంలో తేమను కాపాడండి. ⚠️",
    humidityHigh: "గాలిలో తేమ ఎక్కువ, పురుగులు పట్టే అవకాశం ఉంది! ⚠️",
    humidityGood: "గాలి తేమ అనుకూలంగా ఉంది. ✅",
    npkSub: "నైట్రోజన్, ఫాస్పరస్ మరియు పొటాషియం స్థాయిలు",
    phSub: "మట్టి ఆరోగ్య స్థితి",
    historyTitle: "గత కొన్ని రోజుల పొలం స్థితి",
    listening: "వింటున్నాము...",
    notSupported: "మీ ఫోన్ వాయిస్ క్వెరీని సపోర్ట్ చేయదు."
  },
  ml: {
    title: "എന്റെ കൃഷിയിടത്തിന്റെ അവസ്ഥ",
    welcome: "നമസ്തേ",
    sub: "നിങ്ങളുടെ കൃഷിയിടത്തിന്റെ വിവരങ്ങൾ ഇവിടെ കാണാം",
    sensorStatus: "സെൻസർ കണക്ഷൻ:",
    connected: "സെൻസർ ഓൺ ആണ് 🟢",
    disconnected: "സെൻസർ ഓഫ് ആണ് 🔴",
    voiceReadBtn: "📢 കൃഷിയിടത്തിന്റെ അവസ്ഥ ശബ്ദത്തിൽ കേൾക്കൂ",
    voiceQueryBtn: "🎙️ സംസാരിച്ച് സംശയം ചോദിക്കൂ",
    voiceQuerySub: "ഉദാഹരണത്തിന്: 'ഗോതമ്പിന് ഏത് വളമാണ് ഇടേണ്ടത്?'",
    whatsAppShareBtn: "💬 വാട്സാപ്പിൽ റിപ്പോർട്ട് അയക്കൂ",
    whatsAppSupportBtn: "🟢 വാട്സാപ്പ് സഹായ സംഘം",
    agriAdvisorBtn: "📞 കൃഷി ഡോക്ടറെ വിളിക്കൂ",
    moistureLabel: "💧 മണ്ണിലെ ഈർപ്പം (മണ്ണിലെ വെള്ളം)",
    tempLabel: "☀️ താപനില (ചൂട് അല്ലെങ്കിൽ തണുപ്പ്)",
    humidityLabel: "💨 വായുവിലെ ഈർപ്പം",
    npkLabel: "🌾 മണ്ണിന്റെ കരുത്ത് (പ്രധാന വളങ്ങൾ)",
    phLabel: "🧪 മണ്ണിന്റെ ആരോഗ്യം (pH)",
    nitrogen: "നൈട്രജൻ (യൂറിയ വളം)",
    phosphorus: "ഫോസ്ഫറസ് (സൂപ്പർ വളം)",
    potassium: "പൊട്ടാസ്യം (പൊട്ടാഷ് വളം)",
    moistureLow: "മണ്ണ് വരണ്ടുണങ്ങിയിരിക്കുന്നു, ഉടൻ നനയ്ക്കുക! ❌",
    moistureGood: "ഈർപ്പം കൃത്യമാണ്, നനയ്ക്കേണ്ടതില്ല. ✅",
    moistureHigh: "വെള്ളം കൂടുതലാണ്, വാർന്നു കളയുക. ⚠️",
    tempLow: "തണുപ്പ് കൂടുതലാണ്, വിളകൾ സംരക്ഷിക്കുക. ❄️",
    tempGood: "താപനില വിളകൾക്ക് അനുകൂലമാണ്. ✅",
    tempHigh: "ചൂട് വളരെ കൂടുതലാണ്, മണ്ണിൽ ഈർപ്പം നിലനിർത്തുക. ⚠️",
    humidityHigh: "വായുവിലെ ഈർപ്പം കൂടുതൽ, കീടബാധയ്ക്ക് സാധ്യത! ⚠️",
    humidityGood: "വായുവിലെ ഈർപ്പം അനുയോജ്യമാണ്. ✅",
    npkSub: "നൈട്രജൻ, ഫോസ്ഫറസ്, പൊട്ടാസ്യം അളവ്",
    phSub: "മണ്ണിന്റെ ആരോഗ്യ നില",
    historyTitle: "കഴിഞ്ഞ ദിവസങ്ങളിലെ അവസ്ഥ",
    listening: "ശ്രദ്ധിക്കുന്നു...",
    notSupported: "നിങ്ങളുടെ ഫോൺ വോയ്‌സ് കമാൻഡ് പിന്തുണയ്ക്കുന്നില്ല."
  },
  mr: {
    title: "माझ्या शेताची स्थिती",
    welcome: "नमस्ते",
    sub: "तुमच्या शेताची थेट माहिती येथे पहा",
    sensorStatus: "सेन्सर कनेक्शन:",
    connected: "सेन्सर चालू आहे 🟢",
    disconnected: "सेन्सर बंद आहे 🔴",
    voiceReadBtn: "📢 शेताची माहिती आवाजात ऐका",
    voiceQueryBtn: "🎙️ बोलून समस्या विचारा",
    voiceQuerySub: "उदा. 'गव्हासाठी कोणते खत वापरावे?'",
    whatsAppShareBtn: "💬 व्हॉट्सॲपवर माहिती पाठवा",
    whatsAppSupportBtn: "🟢 व्हॉट्सॲप मदत टीम",
    agriAdvisorBtn: "📞 कृषी डॉक्टरांशी बोला",
    moistureLabel: "💧 मातीतील ओलावा (जमिनीतील पाणी)",
    tempLabel: "☀️ तापमान (उष्णता किंवा थंडी)",
    humidityLabel: "💨 हवेतील दमटपणा (हवेतील पाणी)",
    npkLabel: "🌾 मातीची ताकद (मुख्य खत)",
    phLabel: "🧪 मातीचे आरोग्य (pH)",
    nitrogen: "नायट्रोजन (युरिया खत)",
    phosphorus: "फॉस्फरस (सुपर खत)",
    potassium: "पोटॅशियम (पोटॅश खत)",
    moistureLow: "शेत कोरडे आहे, लगेच पाणी द्या! ❌",
    moistureGood: "ओलावा अगदी योग्य आहे, पाणी देण्याची गरज नाही. ✅",
    moistureHigh: "पाणी जास्त आहे, निचरा करा. ⚠️",
    tempLow: "थंडी जास्त आहे, पिकांची काळजी घ्या. ❄️",
    tempGood: "तापमान पिकासाठी अनुकूल आहे. ✅",
    tempHigh: "उष्णता खूप जास्त आहे, शेतात ओलावा ठेवा. ⚠️",
    humidityHigh: "हवेत पाणी जास्त आहे, कीड लागण्याचा धोका आहे! ⚠️",
    humidityGood: "हवेतील ओलावा योग्य आहे. ✅",
    npkSub: "नायट्रोजन, फॉस्फरस आणि पोटॅशियम पातळी",
    phSub: "मातीचे आरोग्य",
    historyTitle: "मागील काही दिवसांची स्थिती",
    listening: "ऐकत आहे...",
    notSupported: "तुमचा फोन व्हॉइस शोध समर्थित करत नाही."
  },
  bn: {
    title: "আমার খামারের অবস্থা",
    welcome: "নমস্কার",
    sub: "আপনার খামারের লাইভ তথ্য এখানে দেখুন",
    sensorStatus: "সেন্সর কানেকশন:",
    connected: "সেন্সর চালু আছে 🟢",
    disconnected: "সেন্সর বন্ধ আছে 🔴",
    voiceReadBtn: "📢 খামারের অবস্থা মুখে শুনুন",
    voiceQueryBtn: "🎙️ মুখে বলে সমস্যা জিজ্ঞেস করুন",
    voiceQuerySub: "যেমন: 'গমের জন্য কোন সার দেব?'",
    whatsAppShareBtn: "💬 হোয়াটসঅ্যাপে রিপোর্ট পাঠান",
    whatsAppSupportBtn: "🟢 হোয়াটসঅ্যাপ সহায়তা টিম",
    agriAdvisorBtn: "📞 কৃষি ডাক্তারের সাথে কথা বলুন",
    moistureLabel: "💧 মাটির আর্দ্রতা (মাটির জল)",
    tempLabel: "☀️ তাপমাত্রা (গরম বা ঠান্ডা)",
    humidityLabel: "💨 বাতাসের আর্দ্রতা (বাতাসে জল)",
    npkLabel: "🌾 মাটির শক্তি (প্রধান সার)",
    phLabel: "🧪 মাটির স্বাস্থ্য (pH)",
    nitrogen: "নাইট্রোজেন (ইউরিয়া সার)",
    phosphorus: "ফসফরাস (সুপার সার)",
    potassium: "পটাশিয়াম (পটাশ সার)",
    moistureLow: "জমি শুকিয়ে গেছে, এখনই জল দিন! ❌",
    moistureGood: "আর্দ্রতা একদম ঠিক আছে, জল দেওয়ার প্রয়োজন নেই। ✅",
    moistureHigh: "জল বেশি আছে, জল নিকাশি করুন। ⚠️",
    tempLow: "ঠান্ডা বেশি আছে, ফসলের যত্ন নিন। ❄️",
    tempGood: "তাপমাত্রা ফসলের জন্য অনুকূল। ✅",
    tempHigh: "গরম খুব বেশি, জমিতে আর্দ্রতা বজায় রাখুন। ⚠️",
    humidityHigh: "বাতাসে আর্দ্রতা বেশি, পোকা লাগার ভয় আছে! ⚠️",
    humidityGood: "বাতাসের আর্দ্রতা অনুকূল। ✅",
    npkSub: "নাইট্রোজেন, ফসফরাস এবং পটাশিয়ামের মাত্রা",
    phSub: "মাটির স্বাস্থ্যের অবস্থা",
    historyTitle: "গত কয়েক দিনের অবস্থা",
    listening: "শুনছি...",
    notSupported: "আপনার ফোন ভয়েস সার্চ সাপোর্ট করে না।"
  },
  pa: {
    title: "ਮੇਰੇ ਖੇਤ ਦੀ ਸਥਿਤੀ",
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
    sub: "ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਲਾਈਵ ਜਾਣਕਾਰੀ ਇੱਥੇ ਦੇਖੋ",
    sensorStatus: "ਸੈਂਸਰ ਕੁਨੈਕਸ਼ਨ:",
    connected: "ਸੈਂਸਰ ਚਾਲੂ ਹੈ 🟢",
    disconnected: "ਸੈਂਸਰ ਬੰਦ ਹੈ 🔴",
    voiceReadBtn: "📢 ਖੇਤ ਦਾ ਹਾਲ ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣੋ",
    voiceQueryBtn: "🎙️ ਬੋਲ ਕੇ ਸਵਾਲ ਪੁੱਛੋ",
    voiceQuerySub: "ਜਿਵੇਂ: 'ਕਣਕ ਵਿੱਚ ਕਿਹੜੀ ਖਾਦ ਪਾਈਏ?'",
    whatsAppShareBtn: "💬 ਵਟਸਐਪ ਤੇ ਰਿਪੋਰਟ ਭੇਜੋ",
    whatsAppSupportBtn: "🟢 ਵਟਸਐਪ ਸਹਾਇਤਾ ਟੀਮ",
    agriAdvisorBtn: "📞 ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਨਾਲ ਗੱਲ ਕਰੋ",
    moistureLabel: "💧 ਮਿੱਟੀ ਦੀ ਨਮੀ (ਜ਼ਮੀਨ ਦਾ ਪਾਣੀ)",
    tempLabel: "☀️ ਤਾਪਮਾਨ (ਗਰਮੀ ਜਾਂ ਸਰਦੀ)",
    humidityLabel: "💨 ਹਵਾ ਦੀ ਨਮੀ (ਹਵਾ ਵਿੱਚ ਪਾਣੀ)",
    npkLabel: "🌾 ਮਿੱਟੀ ਦੀ ਤਾਕਤ (ਮੁੱਖ ਖਾਦ)",
    phLabel: "🧪 ਮਿੱਟੀ ਦੀ ਸਿਹਤ (pH)",
    nitrogen: "ਨਾਈਟ੍ਰੋਜਨ (ਯੂਰੀਆ ਖਾਦ)",
    phosphorus: "ਫਾਸਫੋਰਸ (ਸੁਪਰ ਖਾਦ)",
    potassium: "ਪੋਟਾਸ਼ੀਅਮ (ਪੋਟਾਸ਼ ਖਾਦ)",
    moistureLow: "ਖੇਤ ਸੁੱਕਾ ਹੈ, ਹੁਣੇ ਪਾਣੀ ਲਾਓ! ❌",
    moistureGood: "ਨਮੀ ਬਿਲਕੁਲ ਸਹੀ ਹੈ, ਪਾਣੀ ਦੀ ਲੋੜ ਨਹੀਂ। ✅",
    moistureHigh: "ਪਾਣੀ ਜ਼ਿਆਦਾ ਹੈ, ਪਾਣੀ ਬਾਹਰ ਕੱਢੋ। ⚠️",
    tempLow: "ਸਰਦੀ ਜ਼ਿਆਦਾ ਹੈ, ਫਸਲਾਂ ਦਾ ਧਿਆਨ ਰੱਖੋ। ❄️",
    tempGood: "ਤਾਪਮਾਨ ਫਸਲ ਲਈ ਅਨੁਕੂਲ ਹੈ। ✅",
    tempHigh: "ਗਰਮੀ ਬਹੁਤ ਜ਼ਿਆਦਾ ਹੈ, ਖੇਤ ਵਿੱਚ ਨਮੀ ਰੱਖੋ। ⚠️",
    humidityHigh: "ਹਵਾ ਵਿੱਚ ਨਮੀ ਜ਼ਿਆਦਾ ਹੈ, ਕੀੜੇ ਲੱਗਣ ਦਾ ਖਤਰਾ ਹੈ! ⚠️",
    humidityGood: "ਹਵਾ ਦੀ ਨਮੀ ਅਨੁਕੂਲ ਹੈ। ✅",
    npkSub: "ਨਾਈਟ੍ਰੋਜਨ, ਫਾਸਫੋਰਸ ਅਤੇ ਪੋਟਾਸ਼ੀਅਮ ਦਾ ਪੱਧਰ",
    phSub: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਦੀ ਸਥਿਤੀ",
    historyTitle: "ਪਿਛਲੇ ਦਿਨਾਂ ਦਾ ਹਾਲ",
    listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
    notSupported: "ਤੁਹਾਡਾ ਫ਼ੋਨ ਵੌਇਸ ਖੋਜ ਦਾ ਸਮਰਥਨ ਨਹੀਂ ਕਰਦਾ।"
  },
  gu: {
    title: "મારા ખેતરની સ્થિતિ",
    welcome: "નમસ્તે",
    sub: "તમારા ખેતરની લાઈવ માહિતી અહીં જુઓ",
    sensorStatus: "સેન્સર કનેક્શન:",
    connected: "સેન્સર ચાલુ છે 🟢",
    disconnected: "સેન્સર બંધ છે 🔴",
    voiceReadBtn: "📢 ખેતરની સ્થિતિ અવાજમાં સાંભળો",
    voiceQueryBtn: "🎙️ બોલીને સમસ્યા પૂછો",
    voiceQuerySub: "જેમ કે: 'ઘઉંમાં કયું ખાતર નાખવું?'",
    whatsAppShareBtn: "💬 વોટ્સએપ પર રિપોર્ટ મોકલો",
    whatsAppSupportBtn: "🟢 વોટ્સએપ સહાયતા ટીમ",
    agriAdvisorBtn: "📞 કૃષિ ડોક્ટર સાથે વાત કરો",
    moistureLabel: "💧 જમીનની ભેજ (જમીનમાં પાણી)",
    tempLabel: "☀️ તાપમાન (ગરમી કે ઠંડી)",
    humidityLabel: "💨 હવામાં ભેજ (હવામાં પાણી)",
    npkLabel: "🌾 જમીનની તાકાત (મુખ્ય ખાતરો)",
    phLabel: "🧪 જમીનનું આરોગ્ય (pH)",
    nitrogen: "નાઇટ્રોજન (યુરિયા ખાતર)",
    phosphorus: "ફોસ્ફરસ (સુપર ખાતર)",
    potassium: "પોટેશિયમ (પોટાશ ખાતર)",
    moistureLow: "ખેતર સૂકું છે, હમણાં જ પાણી આપો! ❌",
    moistureGood: "ભેજ યોગ્ય છે, પાણીની જરૂર નથી. ✅",
    moistureHigh: "પાણી વધારે છે, નિકાલ કરો. ⚠️",
    tempLow: "ઠંડી વધારે છે, પાકનું ધ્યાન રાખો. ❄️",
    tempGood: "તાપમાન પાક માટે અનુકૂળ છે. ✅",
    tempHigh: "ગરમી ઘણી વધારે છે, ખેતરમાં ભેજ જાળવો. ⚠️",
    humidityHigh: "હવામાં ભેજ વધારે છે, કીટકનો ઉપદ્રવ થઈ શકે! ⚠️",
    humidityGood: "હવામાં ભેજ યોગ્ય છે. ✅",
    npkSub: "નાઇટ્રોજન, ફોસ્ફરસ અને પોટેશિયમનું સ્તર",
    phSub: "જમીનના આરોગ્યની સ્થિતિ",
    historyTitle: "છેલ્લા દિવસોની સ્થિતિ",
    listening: "સાંભળી રહ્યા છીએ...",
    notSupported: "તમારો ફોન વોઇસ સર્ચ સપોર્ટ કરતો નથી."
  },
  hi_en: {
    title: "Mere Khet Ka Haal",
    welcome: "Namaste",
    sub: "Aapke khet ki live jaankari yahan uplabdh hai",
    sensorStatus: "Sensor Connection:",
    connected: "Sensor chalu hai 🟢",
    disconnected: "Sensor band hai 🔴",
    voiceReadBtn: "📢 Khet ka haal aawaz mein sunein",
    voiceQueryBtn: "🎙️ Bolkar samasya poochein",
    voiceQuerySub: "Jaise: 'Aloo mein kaun si khaad dalein?'",
    whatsAppShareBtn: "💬 WhatsApp par report bhejein",
    whatsAppSupportBtn: "🟢 WhatsApp sahayata team",
    agriAdvisorBtn: "📞 Krishi doctor se baat karein",
    moistureLabel: "💧 Mitti ki nami (jameen ka paani)",
    tempLabel: "☀️ Tapmaan (garmi ya thand)",
    humidityLabel: "💨 Hawa ki nami (hawa mein paani)",
    npkLabel: "🌾 Mitti ki taqat (mukhya khaad)",
    phLabel: "🧪 Mitti ka swasthya (pH)",
    nitrogen: "Nitrogen (urea khaad)",
    phosphorus: "Phosphorus (super khaad)",
    potassium: "Potassium (potash khaad)",
    moistureLow: "Khet sookha hai, abhi paani dalein! ❌",
    moistureGood: "Nami bilkul sahi hai, paani ki aavashyakta nahi hai. ✅",
    moistureHigh: "Paani jyada hai, jal nikaasi karein. ⚠️",
    tempLow: "Thand adhik hai, faslon ka dhyaan rakhein. ❄️",
    tempGood: "Tapmaan fasal ke liye anukool hai. ✅",
    tempHigh: "Garmi bahut jyada hai, khet mein nami banaye rakhein. ⚠️",
    humidityHigh: "Hawa mein paani jyada hai, keede lagne ka khatra hai! ⚠️",
    humidityGood: "Hawa ki nami anukool hai. ✅",
    npkSub: "Nitrogen, Phosphorus aur Potassium ka star",
    phSub: "Mitti ka swasthya (6.0 se 7.5 sarvottam hai)",
    historyTitle: "Pichle dino ka haal",
    listening: "Aapke aawaz suni ja rahi hai...",
    notSupported: "Aapka phone bolkar poochne ka samarthan nahi karta hai."
  }
}

export default function DashboardPage() {
  const { user, ready } = useAuth()
  const router = useRouter()
  const { t, lang } = useLanguage()

  // Welcome Greetings State
  const [greeting, setGreeting] = useState("Namaste")
  
  // Real-Time Sensor states (fetched dynamically from real ESP32 database)
  const [sensorOnline, setSensorOnline] = useState(false)
  const [moisture, setMoisture] = useState(0) // %
  const [temp, setTemp] = useState(0) // °C
  const [humidity, setHumidity] = useState(0) // %
  const [nitrogen, setNitrogen] = useState(72) // mg/kg
  const [phosphorus, setPhosphorus] = useState(46) // mg/kg
  const [potassium, setPotassium] = useState(148) // mg/kg
  const [ph, setPh] = useState(6.6)

  const [mounted, setMounted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSimulated, setIsSimulated] = useState(false)

  // Localized dictionary selector
  const lt = useMemo(() => {
    return localDict[lang as Lang] || localDict.hi
  }, [lang])

  // Poll real-time sensor data from physical backend database every 5 seconds
  const fetchLatestSensor = async () => {
    if (isSimulated) return
    try {
      const res = await fetch("/api/sensor/latest")
      if (res.ok) {
        const data = await res.json()
        setMoisture(Math.round(data.soil_moisture ?? 42))
        setTemp(Math.round(data.temperature ?? data.soil_temperature ?? 28))
        setHumidity(Math.round(data.humidity ?? 65))
        if (data.nitrogen) setNitrogen(data.nitrogen)
        if (data.phosphorus) setPhosphorus(data.phosphorus)
        if (data.potassium) setPotassium(data.potassium)
        if (data.ph_level) setPh(data.ph_level)
        setSensorOnline(true)
      } else {
        setSensorOnline(false)
      }
    } catch (err) {
      setSensorOnline(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    const hrs = new Date().getHours()
    if (hrs < 12) setGreeting(t("goodMorning"))
    else if (hrs < 17) setGreeting(t("goodAfternoon"))
    else setGreeting(t("goodEvening"))

    // Initial fetch
    fetchLatestSensor()
    // Poll every 5 seconds
    const interval = setInterval(fetchLatestSensor, 5000)
    return () => clearInterval(interval)
  }, [t])

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (ready && !user) {
      router.replace("/login")
    }
  }, [ready, user, router])

  // Chart data built dynamically from active sensor readings
  const simulatedChartData = useMemo(() => {
    return [
      { day: "Mon", Moisture: 38, Temp: 26, Humidity: 60 },
      { day: "Tue", Moisture: 41, Temp: 27, Humidity: 62 },
      { day: "Wed", Moisture: 35, Temp: 29, Humidity: 58 },
      { day: "Thu", Moisture: 32, Temp: 30, Humidity: 55 },
      { day: "Fri", Moisture: 39, Temp: 28, Humidity: 63 },
      { day: "Sat", Moisture: 45, Temp: 26, Humidity: 68 },
      { day: "Sun (Now)", Moisture: moisture, Temp: temp, Humidity: humidity }
    ]
  }, [moisture, temp, humidity])

  // Text-To-Speech (Read aloud status)
  const speakStatus = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel() // Stop any current audio

    let txt = ""
    if (lang === "hi") {
      txt = `नमस्ते, ${user?.name || "किसान भाई"}। आपके खेत का हाल इस प्रकार है। `
      if (!sensorOnline) {
        txt += `सेंसर डिवाइस अभी बंद है। कृपया अपने खेत का लाइव डेटा प्राप्त करने के लिए सेंसर हब को चालू करें।`
      } else {
        txt += `मिट्टी की नमी ${moisture} प्रतिशत है। `
        if (moisture < 30) txt += `खेत सूखा है, अभी पानी डालें। `
        else if (moisture > 55) txt += `पानी ज्यादा है, पानी बाहर निकालें। `
        else txt += `नमी बिल्कुल सही है। `

        txt += `तापमान ${temp} डिग्री सेल्सियस है। `
        if (temp > 35) txt += `गर्मी बहुत ज्यादा है, खेत में नमी बनाए रखें। `
        else if (temp < 15) txt += `ठंड अधिक है। `
        else txt += `तापमान अनुकूल है। `

        txt += `मिट्टी में नाइट्रोजन ${nitrogen}, फास्फोरस ${phosphorus}, और पोटाश ${potassium} मिलीग्राम प्रति किलोग्राम है। मिट्टी उपजाऊ और स्वस्थ है।`
      }
    } else {
      txt = `Hello, ${user?.name || "Farmer"}. Here is your farm status report. `
      if (!sensorOnline) {
        txt += `Your sensor device is currently offline. Please turn on your sensor hub to receive live readings.`
      } else {
        txt += `Soil moisture is ${moisture} percent. `
        if (moisture < 30) txt += `Soil is dry, irrigation is needed immediately. `
        else if (moisture > 55) txt += `Water level is high. `
        else txt += `Moisture is healthy. `

        txt += `Temperature is ${temp} degrees Celsius. `
        if (temp > 35) txt += `Heat stress is high, maintain moisture. `
        else if (temp < 15) txt += `Cold stress is high. `
        else txt += `Temperature is optimal. `

        txt += `Soil nutrients are: Nitrogen ${nitrogen}, Phosphorus ${phosphorus}, and Potassium ${potassium}. Soil quality is very good.`
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
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript
      setIsListening(false)
      if (spokenText) {
        router.push(`/chatbot?q=${encodeURIComponent(spokenText)}`)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Share report on WhatsApp
  const shareOnWhatsApp = () => {
    let text = `🌾 *कृषि रिपोर्ट (KrishiAI)* 🌾\n`
    text += `👤 *किसान:* ${user?.name || "किसान भाई"}\n`
    text += `📅 *दिनांक:* ${new Date().toLocaleDateString()}\n\n`
    if (!sensorOnline) {
      text += `🚨 *सेंसर वर्तमान में ऑफ़लाइन है।*\n`
    } else {
      text += `💧 *मिट्टी की नमी:* ${moisture}% (${moisture < 30 ? "सूखा है" : moisture > 55 ? "ज्यादा पानी" : "बिल्कुल सही"})\n`
      text += `☀️ *तापमान:* ${temp}°C\n`
      text += `💨 *हवा की नमी:* ${humidity}%\n`
      text += `🧪 *मिट्टी स्वास्थ्य (pH):* ${ph}\n\n`
      text += `🧪 *मुख्य पोषक तत्व (NPK):*\n`
      text += `  • नाइट्रोजन: ${nitrogen} mg/kg\n`
      text += `  • फास्फोरस: ${phosphorus} mg/kg\n`
      text += `  • पोटाश: ${potassium} mg/kg\n\n`
    }
    text += `📲 *KrishiAI से प्राप्त रिपोर्ट*`

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  // Open WhatsApp directly for help
  const openWhatsAppSupport = () => {
    let text = `नमस्ते! मुझे KrishiAI कृषि सलाहकार से बात करनी है। `
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
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          खेत का डेटा लोड हो रहा है...
        </div>
      </div>
    )
  }

  // Dynamic status styling helpers
  const moistureAdvice = moisture < 30 ? lt.moistureLow : moisture > 55 ? lt.moistureHigh : lt.moistureGood
  const moistureColor = moisture < 30 ? "border-red-500/35 bg-red-500/5 text-red-400" : moisture > 55 ? "border-amber-500/35 bg-amber-500/5 text-amber-400" : "border-emerald-500/35 bg-emerald-500/5 text-emerald-400"
  
  const tempAdvice = temp < 15 ? lt.tempLow : temp > 35 ? lt.tempHigh : lt.tempGood
  const tempColor = temp < 15 ? "border-blue-500/35 bg-blue-500/5 text-blue-400" : temp > 35 ? "border-orange-500/35 bg-orange-500/5 text-orange-400" : "border-emerald-500/35 bg-emerald-500/5 text-emerald-400"

  const humidityAdvice = humidity > 80 ? lt.humidityHigh : lt.humidityGood
  const humidityColor = humidity > 80 ? "border-amber-500/35 bg-amber-500/5 text-amber-400" : "border-emerald-500/35 bg-emerald-500/5 text-emerald-400"

  return (
    <div className="flex flex-col gap-6 pb-12 select-none text-white max-w-5xl mx-auto px-1">
      
      {/* ─── 1. FARM WELCOME HEADER BANNER (WARM AGRICULTURAL COLORS) ─── */}
      <motion.div 
        {...fadeUp(0)}
        className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-[#0a0f0a] to-[#121c10]/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute top-0 right-0 w-[180px] h-[180px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none -z-10" />
        
        <div className="space-y-1.5 flex-1">
          <h1 className="text-3xl font-black text-white font-display">
            {greeting}, <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-green-500 bg-clip-text text-transparent">{user.name}</span>
          </h1>
          <p className="text-sm text-muted-foreground font-semibold">
            {lt.sub}।
          </p>
        </div>

        {/* Device Switch Button (Simplified terminology) */}
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 shrink-0 w-full md:w-auto justify-between select-none">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${sensorOnline ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-rose-500/10 text-rose-400 border-rose-500/25"}`}>
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">{lt.sensorStatus}</div>
              <div className={`text-xs font-black flex items-center gap-1.5 ${sensorOnline ? "text-emerald-400" : "text-rose-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-current ${sensorOnline ? "animate-pulse" : ""}`} />
                {sensorOnline ? lt.connected : lt.disconnected}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── 2. READ-ALOUD & VOICE SUPPORT ROW (WHATSAPP STYLE USABILITY) ─── */}
      <motion.div {...fadeUp(0.02)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Read-Aloud Voice Button */}
        <button
          onClick={speakStatus}
          className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-base font-bold text-white shadow-lg hover:shadow-emerald-600/15 active:scale-[0.98] transition-all hover:brightness-105 border border-emerald-500/20"
        >
          <Volume2 className="h-5.5 w-5.5" />
          <span>{lt.voiceReadBtn}</span>
        </button>

        {/* Voice Query Microphone Button */}
        <button
          onClick={handleVoiceQuery}
          className={`flex h-14 items-center justify-center gap-3 rounded-2xl text-base font-bold text-white shadow-lg active:scale-[0.98] transition-all border ${
            isListening 
              ? "bg-rose-600 animate-pulse border-rose-500" 
              : "bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-amber-600/15 border-amber-500/20 hover:brightness-105"
          }`}
        >
          <Mic className="h-5.5 w-5.5" />
          <div>
            <span>{isListening ? lt.listening : lt.voiceQueryBtn}</span>
            {!isListening && <div className="text-[10px] font-normal text-white/80">{lt.voiceQuerySub}</div>}
          </div>
        </button>
      </motion.div>

      {/* ─── 3. FARM STATUS SLIDER CARDS / OFFLINE BANNER (REAL HARDWARE CHECK) ─── */}
      {!sensorOnline ? (
        <motion.div {...fadeUp(0.05)}>
          <GlassCard className="border border-white/[0.06] bg-[#0c0f0a]/50 p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-white">सेंसर डिवाइस बंद है (ऑफ़लाइन)</h3>
            <p className="text-sm text-muted-foreground/80 max-w-md leading-relaxed">
              आपका KrishiAI स्मार्ट हब (सेंसर डिवाइस) अभी कनेक्टेड नहीं है। जैसे ही आप अपने खेत में लगे डिवाइस को चालू करेंगे, मिट्टी की नमी और तापमान की लाइव जानकारी यहाँ अपने आप दिखाई देने लगेगी।
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full font-bold select-none animate-pulse mb-2">
              डिवाइस कनेक्शन की लगातार जांच की जा रही है...
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsSimulated(true)
                  setMoisture(42)
                  setTemp(28)
                  setHumidity(65)
                  setSensorOnline(true)
                }}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                🔬 सेंसर डेटा सिम्युलेट करें (चेक करने के लिए) / Simulate Sensor Data
              </button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric A: Soil Moisture Gauge */}
            <motion.div {...fadeUp(0.05)}>
              <CircularGauge
                value={moisture}
                label={lt.moistureLabel.split(" (")[0]}
                unit="%"
                icon={Droplets}
                iconColor="text-sky-400"
                strokeColor="stroke-sky-500"
                glowColor="bg-sky-500"
                advice={moistureAdvice}
                adviceClass={moistureColor}
              />
            </motion.div>

            {/* Metric B: Soil Temp Gauge */}
            <motion.div {...fadeUp(0.08)}>
              <CircularGauge
                value={temp}
                label={lt.tempLabel.split(" (")[0]}
                unit="°C"
                icon={Thermometer}
                iconColor="text-orange-400"
                strokeColor="stroke-orange-500"
                glowColor="bg-orange-500"
                advice={tempAdvice}
                adviceClass={tempColor}
              />
            </motion.div>

            {/* Metric C: Air Moisture/Humidity Gauge */}
            <motion.div {...fadeUp(0.12)}>
              <CircularGauge
                value={humidity}
                label={lt.humidityLabel.split(" (")[0]}
                unit="%"
                icon={CloudSun}
                iconColor="text-teal-400"
                strokeColor="stroke-teal-500"
                glowColor="bg-teal-500"
                advice={humidityAdvice}
                adviceClass={humidityColor}
              />
            </motion.div>
          </div>

          {/* Actionable advisories section */}
          <motion.div {...fadeUp(0.13)}>
            <ActionableAdvisory
              moisture={moisture}
              temp={temp}
              humidity={humidity}
              lang={lang}
            />
          </motion.div>

          {/* ─── 4. SOIL QUALITY & HEALTH CARD (FARMER FRIENDLY TERMS) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Soil Nutrients (NPK) */}
            <motion.div {...fadeUp(0.15)} className="md:col-span-2">
              <GlassCard className="border border-white/[0.06] bg-[#0c0f0a]/50 p-5 rounded-3xl overflow-hidden h-full flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-white/[0.04] p-0 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-emerald-400" />
                    {lt.npkLabel}
                  </CardTitle>
                  <span className="text-[10px] text-muted-foreground font-bold">{lt.npkSub}</span>
                </CardHeader>
                <CardContent className="p-0 pt-4 space-y-4">
                  
                  {/* Nitrogen */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground">{lt.nitrogen}</span>
                      <span className="text-emerald-400">{nitrogen} mg/kg (सही मात्रा)</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(nitrogen / 140) * 100}%` }} />
                    </div>
                  </div>

                  {/* Phosphorus */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground">{lt.phosphorus}</span>
                      <span className="text-emerald-400">{phosphorus} mg/kg (सही मात्रा)</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(phosphorus / 100) * 100}%` }} />
                    </div>
                  </div>

                  {/* Potassium */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground">{lt.potassium}</span>
                      <span className="text-emerald-400">{potassium} mg/kg (सही मात्रा)</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(potassium / 280) * 100}%` }} />
                    </div>
                  </div>

                </CardContent>
              </GlassCard>
            </motion.div>

            {/* Soil Health (pH) */}
            <motion.div {...fadeUp(0.18)} className="md:col-span-1">
              <GlassCard className="border border-white/[0.06] bg-[#0c0f0a]/50 p-5 rounded-3xl overflow-hidden h-full flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-white/[0.04] p-0 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    {lt.phLabel}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-6 space-y-4 text-center">
                  <div className="text-5xl font-black text-white font-display">{ph}</div>
                  <div className="text-xs text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl inline-block">
                    उपजाऊ मिट्टी (सामान्य) 🌱
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-2">
                    {lt.phSub}।
                  </p>
                </CardContent>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}

      {/* ─── 5. WHATSAPP & EXPERT COORDINATION BUTTONS ─── */}
      <motion.div {...fadeUp(0.2)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WhatsApp Share Button */}
        <button
          onClick={shareOnWhatsApp}
          className="flex h-12 items-center justify-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 text-sm font-bold text-white transition-all active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5 text-emerald-400" />
          <span>{lt.whatsAppShareBtn}</span>
        </button>

        {/* WhatsApp Support Button */}
        <button
          onClick={openWhatsAppSupport}
          className="flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:border-[#25D366]/40 text-sm font-bold text-[#25D366] transition-all active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5 text-[#25D366]" />
          <span>{lt.whatsAppSupportBtn}</span>
        </button>

        {/* Phone Call support */}
        <a
          href="tel:919876543210"
          className="flex h-12 items-center justify-center gap-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 text-sm font-bold text-blue-400 transition-all active:scale-[0.98]"
        >
          <Phone className="h-5 w-5 text-blue-400" />
          <span>{lt.agriAdvisorBtn}</span>
        </a>
      </motion.div>

      {/* ─── 6. FARM TOOLS NAVIGATION GRID (LARGE TOUCH TARGETS & EMOJIS) ─── */}
      <motion.div {...fadeUp(0.22)} className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60 pl-1">
          {t("dashboard.all_farm_tools")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/weather", label: t("dashboard.weather_alerts"), icon: CloudSun, color: "text-blue-400 bg-blue-500/10 border-blue-500/25", emoji: "🌦️", desc: "बारिश और मौसम" },
            { href: "/disease", label: t("dashboard.disease_detect"), icon: Bug, color: "text-rose-400 bg-rose-500/10 border-rose-500/25", emoji: "🐛", desc: "रोग की पहचान" },
            { href: "/soil-health", label: t("dashboard.soil_health"), icon: Activity, color: "text-teal-400 bg-teal-500/10 border-teal-500/25", emoji: "🧪", desc: "खाद की सलाह" },
            { href: "/chatbot", label: t("dashboard.ai_chatbot"), icon: Mic, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", emoji: "🤖", desc: "AI सहायक (बोलें)" },
            { href: "/khet-diary", label: t("dashboard.khet_diary"), icon: BookOpen, color: "text-amber-400 bg-amber-500/10 border-amber-500/25", emoji: "📒", desc: "रोज का लेखा-जोखा" },
            { href: "/mandi", label: t("dashboard.mandi_rates"), icon: TrendingUp, color: "text-orange-400 bg-orange-500/10 border-orange-500/25", emoji: "📈", desc: "मंडी के भाव" },
            { href: "/worker-connect", label: t("dashboard.workers"), icon: Users, color: "text-sky-400 bg-sky-500/10 border-sky-500/25", emoji: "🚜", desc: "मजदूर और मशीन" },
            { href: "/schemes", label: t("dashboard.schemes"), icon: Landmark, color: "text-purple-400 bg-purple-500/10 border-purple-500/25", emoji: "🏛️", desc: "सरकारी योजनाएं" },
          ].map((item, idx) => {
            return (
              <Link key={idx} href={item.href}>
                <GlassCard className="border border-white/[0.06] hover:border-emerald-500/30 bg-[#0c0f0a]/50 p-4.5 rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 h-full flex flex-col justify-between group">
                  <div className="flex items-start justify-between">
                    <span className="text-2xl select-none">{item.emoji}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">{item.label}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-1">{item.desc}</p>
                  </div>
                </GlassCard>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* ─── 7. SIMPLIFIED PAST WEATHER TREND CHART (ONLY SHOW WHEN ONLINE) ─── */}
      {sensorOnline && (
        <motion.div {...fadeUp(0.25)}>
          <GlassCard className="border border-white/[0.06] bg-[#0c0f0a]/50 rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/[0.04]">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                {lt.historyTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 w-full text-[10px] font-mono">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={simulatedChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "rgba(4, 8, 20, 0.95)", 
                          borderColor: "rgba(255,255,255,0.08)",
                          borderRadius: "16px"
                        }}
                        labelStyle={{ color: "#fff", fontWeight: "bold" }}
                      />
                      <Area type="monotone" dataKey="Moisture" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#moistGrad)" name={lt.moistureLabel.split(" (")[0]} />
                      <Area type="monotone" dataKey="Temp" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGrad)" name={lt.tempLabel.split(" (")[0]} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>
      )}

    </div>
  )
}
