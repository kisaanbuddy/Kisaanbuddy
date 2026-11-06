import type { Lang } from "@/lib/language";

export interface AnnouncementContent {
  badge: string;
  heading: string;
  messageP1: string;
  messageP2: string;
  withLove: string;
  theFounders: string;
  foundersNames: string;
  ctaButton: string;
  closeAria: string;
  verifiedBadge: string;
}

export const ANNOUNCEMENT_TRANSLATIONS: Record<Lang, AnnouncementContent> = {
  en: {
    badge: "OFFICIAL ANNOUNCEMENT",
    heading: "A NEW UPDATE IS COMING SOON! ✨",
    messageP1:
      "We are working hard to make KisaanBuddy smarter, simpler and more helpful for every Indian farmer.",
    messageP2: "Something exciting is on its way. Stay connected!",
    withLove: "With Love,",
    theFounders: "The Founders of KisaanBuddy ❤️",
    foundersNames: "ADITYA ISHWAR | UTKARSH SINHA | YASH SINGH",
    ctaButton: "Continue to KisaanBuddy",
    closeAria: "Close announcement",
    verifiedBadge: "Verified Founding Team",
  },
  hi: {
    badge: "आधिकारिक घोषणा",
    heading: "जल्द आ रहा है एक नया अपडेट! ✨",
    messageP1:
      "हम किसानबडी (KisaanBuddy) को देश के हर किसान भाई के लिए और अधिक सरल, सटीक और मददगार बनाने पर दिन-रात काम कर रहे हैं।",
    messageP2: "कुछ बेहद खास और नया आपके लिए तैयार हो रहा है। जुड़े रहें!",
    withLove: "सप्रेम एवं आदर सहित,",
    theFounders: "किसानबडी के संस्थापक ❤️",
    foundersNames: "आदित्य ईश्वर | उत्कर्ष सिन्हा | यश सिंह",
    ctaButton: "किसानबडी पर आगे बढ़ें",
    closeAria: "घोषणा बंद करें",
    verifiedBadge: "संस्थापक दल",
  },
  hi_en: {
    badge: "OFFICIAL ANNOUNCEMENT",
    heading: "EK NAYA UPDATE JALD AA RAHA HAI! ✨",
    messageP1:
      "Hum KisaanBuddy ko har Bharatiya kisan ke liye aur zyada smarter, simple aur helpful banane me lage hue hain.",
    messageP2: "Kuch exciting aur khaas aapke liye aa raha hai. Saath bane rahein!",
    withLove: "With Love & Respect,",
    theFounders: "KisaanBuddy ke Founders ❤️",
    foundersNames: "ADITYA ISHWAR | UTKARSH SINHA | YASH SINGH",
    ctaButton: "KisaanBuddy par aage badhein",
    closeAria: "Announcement band karein",
    verifiedBadge: "Verified Founding Team",
  },
  kn: {
    badge: "ಅಧಿಕೃತ ಪ್ರಕಟಣೆ",
    heading: "ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ ಹೊಸ ಅಪ್‌ಡೇಟ್! ✨",
    messageP1:
      "ಪ್ರತಿಯೊಬ್ಬ ಭಾರತೀಯ ರೈತ ಬಾಂಧವರಿಗೂ ಕಿಸಾನ್‌ಬಡ್ಡಿಯನ್ನು ಇನ್ನಷ್ಟು ಸರಳ, ಬುದ್ಧಿವಂತ ಮತ್ತು ಉಪಯುಕ್ತವಾಗಿಸಲು ನಾವು ನಿರಂತರ ಶ್ರಮಿಸುತ್ತಿದ್ದೇವೆ.",
    messageP2: "ಒಂದು ಅತ್ಯುತ್ಸಾಹಕರ ಮತ್ತು ಹೊಸ ಸೌಲಭ್ಯ ನಿಮ್ಮ ದಾರಿಯಲ್ಲಿದೆ. ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಿ!",
    withLove: "ಪ್ರೀತಿ ಮತ್ತು ಗೌರವಗಳೊಂದಿಗೆ,",
    theFounders: "ಕಿಸಾನ್‌ಬಡ್ಡಿಯ ಸಂಸ್ಥಾಪಕರು ❤️",
    foundersNames: "ಆದಿತ್ಯ ಈಶ್ವರ್ | ಉತ್ಕರ್ಷ್ ಸಿನ್ಹಾ | ಯಶ್ ಸಿಂಗ್",
    ctaButton: "ಕಿಸಾನ್‌ಬಡ್ಡಿಗೆ ಮುಂದುವರಿಯಿರಿ",
    closeAria: "ಪ್ರಕಟಣೆಯನ್ನು ಮುಚ್ಚಿ",
    verifiedBadge: "ದೃಢೀಕೃತ ಸಂಸ್ಥಾಪಕ ತಂಡ",
  },
  te: {
    badge: "అధికారిక ప్రకటన",
    heading: "త్వరలోనే సరికొత్త అప్‌డేట్ రాబోతోంది! ✨",
    messageP1:
      "భారతదేశంలోని ప్రతి రైతు సోదరుడి కోసం కిసాన్‌బడ్డీని మరింత సులభంగా, వేగంగా మరియు ప్రయోజనకరంగా మార్చడానికి మేము నిరంతరం కృషి చేస్తున్నాము.",
    messageP2: "రైతుల కోసం ఎంతో ఆసక్తికరమైన కొత్త విశేషం త్వరలోనే రానుంది. మాతోనే ఉండండి!",
    withLove: "ప్రేమ మరియు ఆప్యాయతలతో,",
    theFounders: "కిసాన్‌బడ్డీ వ్యవస్థాపకులు ❤️",
    foundersNames: "ఆదిత్య ఈశ్వర్ | ఉత్కర్ష్ సిన్హా | యశ్ సింగ్",
    ctaButton: "కిసాన్‌బడ్డీకి కొనసాగండి",
    closeAria: "ప్రకటనను మూసివేయండి",
    verifiedBadge: "వ్యవస్థాపక బృందం",
  },
  ta: {
    badge: "அதிகாரப்பூர்வ அறிவிப்பு",
    heading: "விரைவில் ஒரு புதிய அப்டேட் வரவுள்ளது! ✨",
    messageP1:
      "இந்தியாவின் ஒவ்வொரு விவசாய பெருமக்களுக்கும் கிசான்படியை மேலும் எளிமையாகவும், பயனுள்ளதாகவும் மாற்ற நாங்கள் அர்ப்பணிப்புடன் உழைத்து வருகிறோம்.",
    messageP2: "மிகவும் உற்சாகமூட்டும் புதிய அம்சங்கள் விரைவில் உங்களை வந்தடையவுள்ளன. இணைந்திருங்கள்!",
    withLove: "அன்புடன் மற்றும் மரியாதையுடன்,",
    theFounders: "கிசான்படி நிறுவனர்கள் ❤️",
    foundersNames: "ஆதித்யா ஈஸ்வர் | உத்கர்ஷ் சின்ஹா | யாஷ் சிங்",
    ctaButton: "கிசான்படிக்கு தொடரவும்",
    closeAria: "அறிவிப்பை மூடவும்",
    verifiedBadge: "நிறுவனர் குழு",
  },
  mr: {
    badge: "अधिकृत घोषणा",
    heading: "लवकरच येत आहे एक नवीन अपडेट! ✨",
    messageP1:
      "प्रत्येक भारतीय शेतकरी बांधवासाठी किसानबडी अधिक सोपे, स्मार्ट आणि उपयुक्त बनवण्यासाठी आम्ही मनापासून कार्य करत आहोत.",
    messageP2: "काहीतरी नवीन आणि रोमांचक आपल्यासाठी लवकरच येत आहे. जोडलेले राहा!",
    withLove: "सस्नेह आणि आदरपूर्वक,",
    theFounders: "किसानबडीचे संस्थापक ❤️",
    foundersNames: "आदित्य ईश्वर | उत्कर्ष सिन्हा | यश सिंह",
    ctaButton: "किसानबडीवर पुढे जा",
    closeAria: "घोषणा बंद करा",
    verifiedBadge: "संस्थापक संघ",
  },
  bn: {
    badge: "অফিসিয়াল ঘোষণা",
    heading: "শীঘ্রই আসছে একটি নতুন আপডেট! ✨",
    messageP1:
      "ভারতের প্রতিটি কৃষক বন্ধুর জন্য কিষাণবাডিকে আরও সহজ, নির্ভরযোগ্য ও কার্যকর করে তুলতে আমরা আন্তরিকভাবে কাজ করছি।",
    messageP2: "এক রোমাঞ্চকর নতুন অভিজ্ঞতা শীঘ্রই আপনাদের কাছে আসছে। সাথে থাকুন!",
    withLove: "ভালোবাসা ও শ্রদ্ধার সাথে,",
    theFounders: "কিষাণবাডির প্রতিষ্ঠাতা দল ❤️",
    foundersNames: "আদিত্য ঈশ্বর | উৎকর্ষ সিনহা | যশ সিং",
    ctaButton: "কিষাণবাডিতে এগিয়ে যান",
    closeAria: "ঘোষণা বন্ধ করুন",
    verifiedBadge: "প্রতিষ্ঠাতা দল",
  },
  pa: {
    badge: "ਅਧਿਕਾਰਤ ਐਲਾਨ",
    heading: "ਬਹੁਤ ਜਲਦ ਆ ਰਿਹਾ ਹੈ ਨਵਾਂ ਅਪਡੇਟ! ✨",
    messageP1:
      "ਅਸੀਂ ਹਰ ਭਾਰਤੀ ਕਿਸਾਨ ਭਰਾ ਲਈ ਕਿਸਾਨਬੱਡੀ ਨੂੰ ਹੋਰ ਆਸਾਨ, ਸਮਾਰਟ ਅਤੇ ਲਾਹੇਵੰਦ ਬਣਾਉਣ ਲਈ ਪੂਰੀ ਮਿਹਨਤ ਕਰ ਰਹੇ ਹਾਂ।",
    messageP2: "ਕੁਝ ਬਹੁਤ ਹੀ ਖਾਸ ਅਤੇ ਸ਼ਾਨਦਾਰ ਤੁਹਾਡੇ ਲਈ ਜਲਦ ਆ ਰਿਹਾ ਹੈ। ਸਾਡੇ ਨਾਲ ਜੁੜੇ ਰਹੋ!",
    withLove: "ਪਿਆਰ ਅਤੇ ਸਤਿਕਾਰ ਸਹਿਤ,",
    theFounders: "ਕਿਸਾਨਬੱਡੀ ਦੇ ਸੰਸਥਾਪਕ ❤️",
    foundersNames: "ਆਦਿੱਤਿਆ ਈਸ਼ਵਰ | ਉਤਕਰਸ਼ ਸਿਨਹਾ | ਯਸ਼ ਸਿੰਘ",
    ctaButton: "ਕਿਸਾਨਬੱਡੀ ਵੱਲ ਅੱਗੇ ਵਧੋ",
    closeAria: "ਐਲਾਨ ਬੰਦ ਕਰੋ",
    verifiedBadge: "ਸੰਸਥਾਪਕ ਟੀਮ",
  },
  gu: {
    badge: "સત્તાવાર જાહેરાત",
    heading: "ટૂંક સમયમાં આવી રહ્યું છે નવું અપડેટ! ✨",
    messageP1:
      "ભારતના દરેક ખેડૂત મિત્ર માટે કિસાનબડીને વધુ સરળ, સ્માર્ટ અને ઉપયોગી બનાવવા માટે અમે રાત-દિવસ કાર્ય કરી રહ્યા છીએ.",
    messageP2: "કંઈક ખૂબ જ ખાસ અને રોમાંચક ટૂંક સમયમાં આવી રહ્યું છે. જોડાયેલા રહો!",
    withLove: "સ્નેહ અને આદર સાથે,",
    theFounders: "કિસાનબડીના સ્થાપકો ❤️",
    foundersNames: "આદિત્ય ઈશ્વર | ઉત્કર્ષ સિન્હા | યશ સિંહ",
    ctaButton: "કિસાનબડી પર આગળ વધો",
    closeAria: "જાહેરાત બંધ કરો",
    verifiedBadge: "સ્થાપક ટીમ",
  },
  ml: {
    badge: "ഔദ്യോഗിക അറിയിപ്പ്",
    heading: "പുതിയ അപ്‌ഡേറ്റ് ഉടൻ വരുന്നു! ✨",
    messageP1:
      "ഓരോ ഭാരതീയ കർഷകനും കിസാൻബഡ്ഡിയെ കൂടുതൽ ലളിതവും കാര്യക്ഷമവുമാക്കാൻ ഞങ്ങൾ അർപ്പണബോധത്തോടെ പ്രവർത്തിക്കുന്നു.",
    messageP2: "ആവേശകരമായ പുതിയ സേവനങ്ങൾ ഉടൻ തന്നെ നിങ്ങളിലേക്ക് എത്തുന്നു. കാത്തിരിക്കുക!",
    withLove: "സ്നേഹത്തോടും ആദരവോടും കൂടി,",
    theFounders: "കിസാൻബഡ്ഡി സ്ഥാപകർ ❤️",
    foundersNames: "ആദിത്യ ഈശ്വർ | ഉത്കർഷ് സിൻഹ | യഷ് സിംഗ്",
    ctaButton: "കിസാൻബഡ്ഡിയിലേക്ക് തുടരുക",
    closeAria: "അറിയിപ്പ് അടയ്ക്കുക",
    verifiedBadge: "സ്ഥാപക സംഘം",
  },
};
