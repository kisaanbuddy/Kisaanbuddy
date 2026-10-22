"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language'
import ALL_SCHEMES_DATA from '@/lib/schemes-data.json'
import { Search, X, Landmark, Cpu, HelpCircle, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { modalBackdropVariants, modalDialogVariants } from '@/lib/motion'

interface SearchResultItem {
  id: string
  title: string
  desc: string
  link: string
  category: 'tool' | 'scheme' | 'faq'
  answer?: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const TOOLS_I18N: Record<string, {
  id: string;
  link: string;
  name: Record<string, string>;
  desc: Record<string, string>;
}> = {
  weather: {
    id: 'weather',
    link: '/weather',
    name: {
      en: 'Farm Weather Forecast & Advisory',
      hi: 'कृषि मौसम पूर्वानुमान और सलाह',
      kn: 'ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಸಲಹೆ',
      mr: 'शेती हवामान अंदाज आणि सल्ला',
      te: 'వ్యవసాయ వాతావరణ సూచన & సలహా',
      ta: 'பண்ணை வானிலை முன்னறிவிப்பு & ஆலோசனை',
      gu: 'ખેતી હવામાન આગાહી અને સલાહ',
      bn: 'কৃষি আবহাওয়ার পূর্বাভাস ও পরামর্শ',
      pa: 'ਖੇਤੀਬਾੜੀ ਮੌਸਮ ਅਨੁਮਾਨ ਅਤੇ ਸਲਾਹ',
      ml: 'കാർഷിക കാലാവസ്ഥാ പ്രവചനവും നിർദ്ദേശങ്ങളും',
      hi_en: 'Farm Weather Forecast & Advisory'
    },
    desc: {
      en: 'Hyper-local weather warnings, humidity, and rain alerts for crops.',
      hi: 'फसलों के लिए हाइपर-लोकल मौसम चेतावनी, आर्द्रता और बारिश के अलर्ट।',
      kn: 'ಬೆಳೆಗಳಿಗೆ ಹೈಪರ್-ಲೋಕಲ್ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು, ಆರ್ದ್ರತೆ ಮತ್ತು ಮಳೆಯ ಮುನ್ಸೂಚನೆ.',
      mr: 'पिकांसाठी स्थानिक हवामान इशारे, आर्द्रता आणि पावसाचे अलर्ट.',
      te: 'పంటల కోసం వాతావరణ హెచ్చరికలు, తేమ మరియు వర్షం అలర్ట్‌లు.',
      ta: 'பயிர்களுக்கான உள்ளூர் வானிலை எச்சரிக்கைகள் மற்றும் மழைத் தகவல்கள்.',
      gu: 'પાક માટે સ્થાનિક હવામાન ચેતવણીઓ, ભેજ અને વરસાદની માહિતી.',
      bn: 'ফসলের জন্য আবহাওয়ার সতর্কতা, আর্দ্রতা এবং বৃষ্টির পূর্বাভাস।',
      pa: 'ਫਸਲਾਂ ਲਈ ਸਥਾਨਕ ਮੌਸਮ ਚਿਤਾਵਨੀਆਂ, ਨਮੀ ਅਤੇ ਮੀਂਹ ਦੇ ਅਲਰਟ।',
      ml: 'വിളകൾക്കായുള്ള പ്രാദേശിക കാലാവസ്ഥാ മുന്നറിയിപ്പുകളും മഴ വിവരങ്ങളും.',
      hi_en: 'Crops ke liye hyper-local weather warnings aur rain alerts.'
    }
  },
  mandi: {
    id: 'mandi',
    link: '/mandi',
    name: {
      en: 'Mandi Rates & MSP Tracker',
      hi: 'मंडी भाव और एमएसपी (MSP) ट्रैकर',
      kn: 'ಮಂಡಿ ದರಗಳು ಮತ್ತು MSP ಟ್ರ್ಯಾಕರ್',
      mr: 'बाजारभाव व हमीभाव (MSP) ट्रॅकर',
      te: 'మార్కెట్ ధరలు & MSP ట్రాకర్',
      ta: 'மண்டி விலைகள் & MSP டிராக்கர்',
      gu: 'મંડી ભાવો અને ટેકાના ભાવ (MSP) ટ્રેકર',
      bn: 'মান্ডি দর ও MSP ট্র্যাকার',
      pa: 'ਮੰਡੀ ਭਾਅ ਅਤੇ MSP ਟਰੈਕਰ',
      ml: 'മാർക്കറ്റ് നിരക്കുകളും താങ്ങുവിലയും',
      hi_en: 'Mandi Rates & MSP Tracker'
    },
    desc: {
      en: 'Real-time APMC crop rates and eNAM registration guides.',
      hi: 'वास्तविक समय एपीएमसी फसल दरें और ई-नाम पंजीकरण गाइड।',
      kn: 'ನೈಜ ಸಮಯದ APMC ಬೆಳೆ ದರಗಳು ಮತ್ತು eNAM ಮಾರ್ಗದರ್ಶಿ.',
      mr: 'थेट बाजार समिती भाव आणि ई-नाम नोंदणी मार्गदर्शक.',
      te: 'రియల్ టైమ్ వ్యవసాయ మార్కెట్ ధరలు మరియు eNAM గైడ్.',
      ta: 'நேரலை மண்டி விலைகள் மற்றும் eNAM பதிவு வழிகாட்டி.',
      gu: 'વાસ્તવિક સમયના માર્કેટ યાર્ડ ભાવો અને eNAM માર્ગદર્શિકા.',
      bn: 'রিয়েল-টাইম এপিএমসি দর এবং ই-নাম নিবন্ধন গাইড।',
      pa: 'ਅਸਲ ਸਮੇਂ ਦੇ ਏਪੀਐਮਸੀ ਭਾਅ ਅਤੇ ਈ-ਨਾਮ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਗਾਈਡ।',
      ml: 'തത്സമയ മാർക്കറ്റ് നിരക്കുകളും eNAM രജിസ്ട്രേഷൻ വിവരങ്ങളും.',
      hi_en: 'Real-time APMC crop rates aur eNAM guide.'
    }
  },
  'crop-predictor': {
    id: 'crop-predictor',
    link: '/crop-predictor',
    name: {
      en: 'Crop Selection Predictor',
      hi: 'फसल चयन भविष्यवाणी सलाहकार',
      kn: 'ಬೆಳೆ ಆಯ್ಕೆ ಮುನ್ಸೂಚನೆ',
      mr: 'पीक निवड सल्लागार',
      te: 'పంట ఎంపిక ప్రిడిక్టర్',
      ta: 'பயிர் தேர்வு கணிப்பாளர்',
      gu: 'પાક પસંદગી સલાહકાર',
      bn: 'ফসল নির্বাচন নির্দেশিকা',
      pa: 'ਫਸਲ ਚੋਣ ਸਲਾਹਕਾਰ',
      ml: 'വിള തെരഞ്ഞെടുപ്പ് നിർദ്ദേശങ്ങൾ',
      hi_en: 'Crop Selection Predictor'
    },
    desc: {
      en: 'AI model to predict suitable crops based on soil nutrients and rain.',
      hi: 'मिट्टी के पोषक तत्वों और वर्षा के आधार पर उपयुक्त फसलों की भविष्यवाणी।',
      kn: 'ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳು ಮತ್ತು ಮಳೆಯ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ಬೆಳೆಗಳನ್ನು ಸೂಚಿಸುವ AI.',
      mr: 'मातीचे घटक व पावसाच्या आधारावर योग्य पिकांची शिफारस.',
      te: 'నేల పోషకాలు మరియు వర్షపాతం ఆధారంగా అనువైన పంటల సూచన.',
      ta: 'மண் வளம் மற்றும் மழையளவின் அடிப்படையில் பொருத்தமான பயிர் தேர்வு.',
      gu: 'જમીનના પોષક તત્ત્વો અને વરસાદ આધારિત યોગ્ય પાકની આગાહી.',
      bn: 'মাটির পুষ্টি ও বৃষ্টিপাতের ভিত্তিতে উপযুক্ত ফসল নির্ধারণ।',
      pa: 'ਮਿੱਟੀ ਦੇ ਤੱਤਾਂ ਅਤੇ ਮੀਂਹ ਦੇ ਆਧਾਰ ਤੇ ਢੁਕਵੀਆਂ ਫਸਲਾਂ ਦੀ ਚੋਣ।',
      ml: 'മണ്ണിലെ പോഷകങ്ങളുടെയും മഴയുടെയും അടിസ്ഥാനത്തിൽ അനുയോജ്യമായ വിള കണ്ടെത്തൽ.',
      hi_en: 'Soil nutrients aur rain ke hisaab se suitable crops prediction.'
    }
  },
  'soil-health': {
    id: 'soil-health',
    link: '/soil-health',
    name: {
      en: 'Soil Health & NPK Analyzer',
      hi: 'मृदा स्वास्थ्य और एनपीके (NPK) विश्लेषक',
      kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು NPK ವಿಶ್ಲೇಷಕ',
      mr: 'माती आरोग्य आणि NPK विश्लेषक',
      te: 'నేల ఆరోగ్యం & NPK విశ్లేషణ',
      ta: 'மண் வளம் மற்றும் NPK பகுப்பாய்வு',
      gu: 'જમીન આરોગ્ય અને NPK વિશ્લેષક',
      bn: 'মাটি স্বাস্থ্য ও NPK বিশ্লেষক',
      pa: 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਅਤੇ NPK ਵਿਸ਼ਲੇਸ਼ਕ',
      ml: 'മണ്ണ് ആരോഗ്യവും NPK വിശകലനവും',
      hi_en: 'Soil Health & NPK Analyzer'
    },
    desc: {
      en: 'Input soil test results to get instant nitrogen, phosphorus, potash advice.',
      hi: 'त्वरित नाइट्रोजन, फास्फोरस, पोटाश सलाह प्राप्त करने के लिए मृदा परीक्षण परिणाम दर्ज करें।',
      kn: 'ಸಾರಜನಕ, ರಂಜಕ, ಪೊಟ್ಯಾಶ್ ನಿಖರ ಸಲಹೆಗಾಗಿ ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ ನಮೂದಿಸಿ.',
      mr: 'अचूक खत व्यवस्थापनासाठी माती चाचणी अहवाल नोंदवा.',
      te: 'నత్రజని, భాస్వరం, పొటాష్ సలహాల కోసం నేల పరీక్ష వివరాలు నమోదు చేయండి.',
      ta: 'சரியான உர அளவிற்கு மண் பரிசோதனை முடிவுகளை உள்ளிடவும்.',
      gu: 'યોગ્ય ખાતર સલાહ માટે જમીન ચકાસણી પરિણામો દાખલ કરો.',
      bn: 'সঠিক সার প্রয়োগের জন্য মাটি পরীক্ষার ফলাফল ইনপুট করুন।',
      pa: 'ਸਹੀ ਖਾਦ ਦੀ ਸਲਾਹ ਲਈ ਮਿੱਟੀ ਪਰਖ ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ।',
      ml: 'കൃത്യമായ വളപ്രയോഗത്തിനായി മണ്ണ് പരിശോധനാ ഫലങ്ങൾ രേഖപ്പെടുത്തുക.',
      hi_en: 'Soil test results enter karke instant NPK advice lein.'
    }
  },
  chatbot: {
    id: 'chatbot',
    link: '/chatbot',
    name: {
      en: 'Voice AI Crop Assistant',
      hi: 'कृषि वॉयस एआई सहायक (किसानमित्र)',
      kn: 'ಧ್ವನಿ AI ಕೃಷಿ ಸಹಾಯಕ (ಕಿಸಾನ್‌ಮಿತ್ರ)',
      mr: 'व्हॉइस AI शेती मित्र (KisaanBuddy)',
      te: 'వాయిస్ AI వ్యవసాయ సహాయకుడు',
      ta: 'குரல்வழி AI வேளாண் உதவியாளர்',
      gu: 'વોઇસ AI ખેતી સહાયક',
      bn: 'ভয়েস AI কৃষি সহায়ক',
      pa: 'ਆਵਾਜ਼ੀ AI ਖੇਤੀ ਸਹਾਇਕ',
      ml: 'വോയ്‌സ് AI കാർഷിക സഹായി',
      hi_en: 'Voice AI Crop Assistant'
    },
    desc: {
      en: 'Speak in native language to get disease diagnostics and farming tips.',
      hi: 'रोग निदान और खेती के टिप्स प्राप्त करने के लिए अपनी मातृभाषा में बोलें।',
      kn: 'ರೋಗ ಪತ್ತೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳಿಗಾಗಿ ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲೇ ಮಾತನಾಡಿ.',
      mr: 'रोग निदान व शेती सल्ल्यासाठी आपल्या भाषेत बोला.',
      te: 'వ్యాధి నిర్ధారణ మరియు సాగు సలహాల కోసం మీ సొంత భాషలో మాట్లాడండి.',
      ta: 'நோய் கண்டறிதல் மற்றும் விவசாய குறிப்புகளுக்கு உங்கள் தாய்மொழியில் பேசுங்கள்.',
      gu: 'રોગ નિદાન અને ખેતીની સલાહ માટે તમારી માતૃભાષામાં બોલો.',
      bn: 'রোগ নির্ণয় ও চাষের পরামর্শ পেতে নিজের মাতৃভাষায় কথা বলুন।',
      pa: 'ਰੋਗਾਂ ਦੀ ਪਛਾਣ ਅਤੇ ਖੇਤੀ ਸੁਝਾਵਾਂ ਲਈ ਆਪਣੀ ਮਾਂ-ਬੋਲੀ ਵਿੱਚ ਗੱਲ ਕਰੋ।',
      ml: 'രോഗനിർണയത്തിനും കാർഷിക നിർദ്ദേശങ്ങൾക്കുമായി സ്വന്തം ഭാഷയിൽ സംസാരിക്കുക.',
      hi_en: 'Apni bhasha me bolkar bimari diagnose aur farming tips lein.'
    }
  },
  'worker-connect': {
    id: 'worker-connect',
    link: '/worker-connect',
    name: {
      en: 'Farm Labor Worker Connect',
      hi: 'मजदूर और कृषि रोजगार खोज',
      kn: 'ಕೃಷಿ ಕಾರ್ಮಿಕರ ಸಂಪರ್ಕ',
      mr: 'कृषी मजूर व रोजगार संपर्क',
      te: 'వ్యవసాయ కూలీల కనెక్ట్',
      ta: 'விவசாய தொழிலாளர் இணைப்பு',
      gu: 'ખેત મજૂર અને રોજગાર કનેક્ટ',
      bn: 'কৃষি শ্রমিক সংযোগ',
      pa: 'ਖੇਤੀ ਮਜ਼ਦੂਰ ਸੰਪਰਕ',
      ml: 'കാർഷിക തൊഴിലാളി കണക്ട്',
      hi_en: 'Farm Labor Worker Connect'
    },
    desc: {
      en: 'Hire local farm workers or find agriculture labor jobs.',
      hi: 'स्थानीय कृषि श्रमिकों को काम पर रखें या कृषि श्रम नौकरियां खोजें।',
      kn: 'ಸ್ಥಳೀಯ ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಕೃಷಿ ಉದ್ಯೋಗಗಳನ್ನು ಹುಡುಕಿ.',
      mr: 'स्थानिक शेतमजुरांना कामावर ठेवा किंवा शेतीकामाचे रोजगार शोधा.',
      te: 'స్థానిక వ్యవసాయ కూలీలను పొందండి లేదా వ్యవసాయ పనులను వెతకండి.',
      ta: 'உள்ளூர் விவசாயத் தொழிலாளர்களைக் கண்டறியுங்கள் அல்லது வேலை வாய்ப்புகளைப் பெறுங்கள்.',
      gu: 'સ્થાનિક ખેત મજૂરો મેળવો અથવા કૃષિ રોજગાર શોધો.',
      bn: 'স্থানীয় কৃষি শ্রমিক খুঁজুন বা চাষের কাজের সুযোগ পান।',
      pa: 'ਸਥਾਨਕ ਖੇਤ ਮਜ਼ਦੂਰ ਲੱਭੋ ਜਾਂ ਖੇਤੀ ਰੁਜ਼ਗਾਰ ਪ੍ਰਾਪਤ ਕਰੋ।',
      ml: 'പ്രാദേശിക കാർഷിക തൊഴിലാളികളെ കണ്ടെത്തുക അല്ലെങ്കിൽ തൊഴിൽ കണ്ടെത്തുക.',
      hi_en: 'Local farm workers hire karein ya labor jobs khojein.'
    }
  },
  'khet-diary': {
    id: 'khet-diary',
    link: '/khet-diary',
    name: {
      en: 'Khet-Diary Farm Ledger',
      hi: 'खेत-डायरी कृषि बहीखाता',
      kn: 'ಖೇತ್-ಡೈರಿ ಕೃಷಿ ಲೆಕ್ಕಪುಸ್ತಕ',
      mr: 'खेत-डायरी शेती जमा-खर्च वही',
      te: 'ఖేత్-డైరీ వ్యవసాయ ఖాతా పుస్తకం',
      ta: 'பண்ணை வரவு-செலவு கணக்கு புத்தகம்',
      gu: 'ખેત-ડાયરી કૃષિ ખાતાવહી',
      bn: 'ক্ষেত-ডায়েরি খামার খতিয়ান',
      pa: 'ਖੇਤ-ਡਾਇਰੀ ਖੇਤੀਬਾੜੀ ਖਾਤਾ-ਬਹੀ',
      ml: 'ഫാം കണക്കുപുസ്തകം',
      hi_en: 'Khet-Diary Farm Ledger'
    },
    desc: {
      en: 'Log seed, fertilizer, water, and labor expenses to audit profits.',
      hi: 'मुनाफे का हिसाब लगाने के लिए बीज, उर्वरक, पानी और श्रम खर्च दर्ज करें।',
      kn: 'ಲಾಭ-ನಷ್ಟದ ಲೆಕ್ಕಾಚಾರಕ್ಕಾಗಿ ಬೀಜ, ಗೊಬ್ಬರ, ನೀರು ಮತ್ತು ಕೂಲಿ ವೆಚ್ಚ ದಾಖಲಿಸಿ.',
      mr: 'नफ्याचा अचूक हिशोब लावण्यासाठी बियाणे, खते आणि मजुरीचा खर्च नोंदवा.',
      te: 'లాభాలను లెక్కించడానికి విత్తనాలు, ఎరువులు మరియు కూలీల ఖర్చులు నమోదు చేయండి.',
      ta: 'லாபத்தை அறிய விதை, உரம், நீர் மற்றும் கூலி செலவுகளைப் பதிவு செய்யுங்கள்.',
      gu: 'નફાના સચોટ હિસાબ માટે બિયારણ, ખાતર અને મજૂરી ખર્ચ નોંધો.',
      bn: 'লাভের হিসাব রাখতে বীজ, সার, সেচ এবং শ্রম খরচ লিপিবদ্ধ করুন।',
      pa: 'ਮੁਨਾਫੇ ਦਾ ਹਿਸਾਬ ਲਗਾਉਣ ਲਈ ਬੀਜ, ਖਾਦ, ਪਾਣੀ ਅਤੇ ਮਜ਼ਦੂਰੀ ਦੇ ਖਰਚੇ ਦਰਜ ਕਰੋ।',
      ml: 'ലാഭം കണക്കാക്കുന്നതിനായി വിത്ത്, വളം, വെള്ളം, തൊഴിലാളി ചെലവുകൾ രേഖപ്പെടുത്തുക.',
      hi_en: 'Profit audit ke liye beej, fertilizer, paani aur labor expenses log karein.'
    }
  }
}

const MODAL_STRINGS: Record<string, {
  placeholder: string;
  emptyPrompt: string;
  noResults: string;
  noResultsSub: string;
}> = {
  en: {
    placeholder: "Search tools, schemes, and help...",
    emptyPrompt: "Enter keywords (e.g. MSP, wheat disease, soil pH) to search KisaanBuddy",
    noResults: "No results found",
    noResultsSub: "Try checking your spelling or using different keywords."
  },
  hi: {
    placeholder: "उपकरण, योजनाएं और सहायता खोजें...",
    emptyPrompt: "किसानमित्र खोजने के लिए कीवर्ड (जैसे MSP, गेहूं रोग, मिट्टी का पीएच) दर्ज करें",
    noResults: "कोई परिणाम नहीं मिला",
    noResultsSub: "कृपया अपनी वर्तनी जांचें या अन्य कीवर्ड का उपयोग करें।"
  },
  kn: {
    placeholder: "ಪರಿಕರಗಳು, ಯೋಜನೆಗಳು ಮತ್ತು ಸಹಾಯವನ್ನು ಹುಡುಕಿ...",
    emptyPrompt: "ಹುಡುಕಲು ಪದಗಳನ್ನು ನಮೂದಿಸಿ (ಉದಾ: MSP, ಗೋಧಿ ರೋಗ, ಮಣ್ಣಿನ pH)",
    noResults: "ಯಾವುದೇ ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ",
    noResultsSub: "ದಯವಿಟ್ಟು ಕಾಗುಣಿತವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಬೇರೆ ಪದಗಳನ್ನು ಬಳಸಿ."
  },
  mr: {
    placeholder: "टूल्स, योजना आणि मदत शोधा...",
    emptyPrompt: "शोधण्यासाठी कीवर्ड टाका (उदा. हमीभाव, गव्हावरील रोग, मातीचा सामू)",
    noResults: "कोणतेही निकाल आढळले नाहीत",
    noResultsSub: "कृपया शब्द तपासा किंवा वेगळे कीवर्ड वापरून पहा."
  },
  te: {
    placeholder: "సాధనాలు, పథకాలు మరియు సహాయం కోసం వెతకండి...",
    emptyPrompt: "శోధించడానికి కీవర్డ్‌లు నమోదు చేయండి (ఉదా: MSP, గోధుమ తెగులు, నేల pH)",
    noResults: "ఎటువంటి ఫలితాలు లభించలేదు",
    noResultsSub: "దయచేసి అక్షరక్రమాన్ని తనిఖీ చేయండి లేదా వేరే పదాలతో ప్రయత్నించండి."
  },
  ta: {
    placeholder: "கருவிகள், திட்டங்கள் மற்றும் உதவியைத் தேடுங்கள்...",
    emptyPrompt: "தேட சொற்களை உள்ளிடவும் (எ.கா. MSP, கோதுமை நோய், மண் pH)",
    noResults: "முடிவுகள் எதுவும் இல்லை",
    noResultsSub: "தயவுசெய்து எழுத்துப் பிழைகளைச் சரிபார்க்கவும் அல்லது வேறு வார்த்தைகளைப் பயன்படுத்தவும்."
  },
  gu: {
    placeholder: "સાધનો, યોજનાઓ અને મદદ શોધો...",
    emptyPrompt: "શોધવા માટે શબ્દો દાખલ કરો (દા.ત. MSP, ઘઉંનો રોગ, જમીન pH)",
    noResults: "કોઈ પરિણામ મળ્યું નથી",
    noResultsSub: "કૃપા કરીને જોડણી તપાસો અથવા અન્ય શબ્દો વાપરીને પ્રયાસ કરો."
  },
  bn: {
    placeholder: "সরঞ্জাম, প্রকল্প এবং সহায়তা খুঁজুন...",
    emptyPrompt: "অনুসন্ধানের জন্য শব্দ লিখুন (যেমন MSP, গমের রোগ, মাটির pH)",
    noResults: "কোনো ফলাফল পাওয়া যায়নি",
    noResultsSub: "বানান পরীক্ষা করুন অথবা অন্য কোনো শব্দ দিয়ে চেষ্টা করুন।"
  },
  pa: {
    placeholder: "ਸੰਦ, ਸਕੀਮਾਂ ਅਤੇ ਮਦਦ ਲੱਭੋ...",
    emptyPrompt: "ਲੱਭਣ ਲਈ ਸ਼ਬਦ ਦਰਜ ਕਰੋ (ਜਿਵੇਂ MSP, ਕਣਕ ਦੀ ਬਿਮਾਰੀ, ਮਿੱਟੀ ਦਾ pH)",
    noResults: "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ",
    noResultsSub: "ਕਿਰਪਾ ਕਰਕੇ ਸ਼ਬਦ-ਜੋੜਾਂ ਦੀ ਜਾਂਚ ਕਰੋ ਜਾਂ ਵੱਖਰੇ ਸ਼ਬਦ ਵਰਤੋ।"
  },
  ml: {
    placeholder: "ടൂളുകൾ, പദ്ധതികൾ, സഹായം എന്നിവ തിരയുക...",
    emptyPrompt: "തിരയാൻ വാക്കുകൾ നൽകുക (ഉദാ: MSP, ഗോതമ്പ് രോഗം, മണ്ണ് pH)",
    noResults: "ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല",
    noResultsSub: "ദയവായി അക്ഷരവിന്യാസം പരിശോധിക്കുക അല്ലെങ്കിൽ മറ്റ് വാക്കുകൾ ഉപയോഗിക്കുക."
  },
  hi_en: {
    placeholder: "Tools, schemes aur help search karein...",
    emptyPrompt: "Search karne ke liye keywords dalein (e.g. MSP, wheat disease, soil pH)",
    noResults: "No results found",
    noResultsSub: "Please spelling check karein ya different keywords use karein."
  }
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { lang } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const s = MODAL_STRINGS[lang] || MODAL_STRINGS.en

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    const tempResults: SearchResultItem[] = []

    // 1. Index Tools across localized dictionaries
    Object.values(TOOLS_I18N).forEach(tool => {
      const toolName = tool.name[lang] || tool.name.hi || tool.name.en
      const toolDesc = tool.desc[lang] || tool.desc.hi || tool.desc.en
      const enName = tool.name.en.toLowerCase()
      const hiName = (tool.name.hi || '').toLowerCase()
      const curName = toolName.toLowerCase()
      const curDesc = toolDesc.toLowerCase()

      if (curName.includes(q) || curDesc.includes(q) || enName.includes(q) || hiName.includes(q)) {
        tempResults.push({
          id: `tool-${tool.id}`,
          title: toolName,
          desc: toolDesc,
          link: tool.link,
          category: 'tool'
        })
      }
    })

    // 2. Index Schemes
    ALL_SCHEMES_DATA.forEach(scheme => {
      const name = scheme.name.toLowerCase()
      const desc = scheme.description.toLowerCase()
      const benefit = scheme.benefit.toLowerCase()
      if (name.includes(q) || desc.includes(q) || benefit.includes(q)) {
        tempResults.push({
          id: `scheme-${scheme.id}`,
          title: scheme.name,
          desc: scheme.description,
          link: `/schemes?id=${scheme.id}`,
          category: 'scheme'
        })
      }
    })

    return tempResults.slice(0, 8)
  }, [query, lang])

  const handleSelect = (link: string) => {
    router.push(link)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-background/80 dark:bg-black/80 backdrop-blur-sm"
        >
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            variants={modalDialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md flex flex-col max-h-[500px]"
          >
        {/* Input Header */}
        <div className="flex items-center border-b border-border px-4 py-3 shrink-0">
          <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={s.placeholder}
            className="flex-1 bg-transparent border-0 outline-none text-foreground text-sm px-3 placeholder:text-muted-foreground"
          />
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {query.trim() === '' ? (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-3xl block mb-3">🌾</span>
              <p className="text-xs font-semibold leading-relaxed">
                {s.emptyPrompt}
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.link)}
                  className="w-full text-left p-3.5 rounded-xl border border-border hover:border-emerald-500/40 bg-card hover:bg-muted/50 flex items-start gap-3.5 transition-all group cursor-pointer"
                >
                  <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    {item.category === 'tool' && <Cpu className="h-4 w-4" />}
                    {item.category === 'scheme' && <Landmark className="h-4 w-4" />}
                    {item.category === 'faq' && <HelpCircle className="h-4 w-4" />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {item.title}
                      </h4>
                      <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                    {item.answer && (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg mt-2 leading-relaxed font-semibold">
                        {item.answer}
                      </p>
                    )}
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-3xl block mb-3">📭</span>
              <h4 className="text-xs font-black text-foreground">
                {s.noResults}
              </h4>
              <p className="text-[10px] mt-1 font-semibold">
                {s.noResultsSub}
              </p>
            </div>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
