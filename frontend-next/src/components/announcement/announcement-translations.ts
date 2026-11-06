import type { Lang } from "@/lib/language";

export interface AnnouncementContent {
  brandTag: string;
  mainHeading: string;
  subheading: string;
  cardHeading: string;
  cardDescription: string;
  ctaButton: string;
  closeAria: string;
}

export const ANNOUNCEMENT_TRANSLATIONS: Record<Lang, AnnouncementContent> = {
  en: {
    brandTag: "A BETTER FARMING EXPERIENCE",
    mainHeading: "Farming is getting smarter. 🌱",
    subheading:
      "We are constantly improving KisaanBuddy to make farming decisions simpler, smarter and more helpful for every Indian farmer.",
    cardHeading: "Something better is growing.",
    cardDescription:
      "Our mission is to bring useful agricultural information, smarter farming assistance and trusted solutions closer to every farmer.",
    ctaButton: "Explore KisaanBuddy →",
    closeAria: "Close welcome dialog",
  },
  hi: {
    brandTag: "बेहतर खेती का नया अनुभव",
    mainHeading: "खेती अब और भी समझदार बन रही है। 🌱",
    subheading:
      "हम किसानभाई (KisaanBuddy) को लगातार बेहतर बना रहे हैं ताकि हर भारतीय किसान के निर्णय सरल, सटीक और अधिक मददगार बन सकें।",
    cardHeading: "कुछ बेहतर आकार ले रहा है।",
    cardDescription:
      "हमारा संकल्प है हर किसान तक उपयोगी कृषि जानकारी, स्मार्ट मार्गदर्शन और विश्वसनीय समाधान पहुंचाना।",
    ctaButton: "किसानभाई देखें →",
    closeAria: "स्वागत संदेश बंद करें",
  },
  hi_en: {
    brandTag: "A BETTER FARMING EXPERIENCE",
    mainHeading: "Farming ab aur bhi smart ban rahi hai. 🌱",
    subheading:
      "Hum KisaanBuddy ko har Bharatiya kisan ke liye lagatar aur simple, smart aur helpful bana rahe hain.",
    cardHeading: "Kuch behtar grow ho raha hai.",
    cardDescription:
      "Hamara mission hai har kisan tak sahi kheti jaankari, smart farming assistance aur trusted solutions pahunchana.",
    ctaButton: "Explore KisaanBuddy →",
    closeAria: "Welcome message close karein",
  },
  kn: {
    brandTag: "ಉತ್ತಮ ಕೃಷಿ ಅನುಭವ",
    mainHeading: "ಕೃಷಿ ಈಗ ಇನ್ನಷ್ಟು ಸ್ಮಾರ್ಟ್ ಆಗುತ್ತಿದೆ. 🌱",
    subheading:
      "ಪ್ರತಿಯೊಬ್ಬ ಭಾರತೀಯ ರೈತನಿಗಾಗಿ ಕೃಷಿ ನಿರ್ಧಾರಗಳನ್ನು ಸರಳ, ಸ್ಮಾರ್ಟ್ ಮತ್ತು ಹೆಚ್ಚು ಉಪಯುಕ್ತವಾಗಿಸಲು ನಾವು ಕಿಸಾನ್‌ಬಡ್ಡಿಯನ್ನು ನಿರಂತರವಾಗಿ ಸುಧಾರಿಸುತ್ತಿದ್ದೇವೆ.",
    cardHeading: "ಇನ್ನಷ್ಟು ಉತ್ತಮವಾದುದು ಬೆಳೆಯುತ್ತಿದೆ.",
    cardDescription:
      "ಉಪಯುಕ್ತ ಕೃಷಿ ಮಾಹಿತಿ, ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ನೆರವು ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಪರಿಹಾರಗಳನ್ನು ಪ್ರತಿಯೊಬ್ಬ ರೈತನ ಬಳಿಗೆ ತರುವುದೇ ನಮ್ಮ ಧ್ಯೇಯ.",
    ctaButton: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಅನ್ವೇಷಿಸಿ →",
    closeAria: "ಸ್ವಾಗತ ಸಂದೇಶ ಮುಚ್ಚಿ",
  },
  te: {
    brandTag: "మరింత మెరుగైన వ్యవసాయ అనుభవం",
    mainHeading: "వ్యవసాయం మరింత స్మార్ట్‌గా మారుతోంది. 🌱",
    subheading:
      "ప్రతి భారతీయ రైతు వ్యవసాయ నిర్ణయాలను సులభతరం, స్మార్ట్ మరియు మరింత ఉపయోగకరంగా మార్చడానికి మేము కిసాన్‌బడ్డీని నిరంతరం మెరుగుపరుస్తున్నాము.",
    cardHeading: "మరింత మెరుగైనది ఎదుగుతోంది.",
    cardDescription:
      "ఉపయోగకరమైన వ్యవసాయ సమాచారం, స్మార్ట్ వ్యవసాయ సహాయం మరియు విశ్వసనీయ పరిష్కారాలను ప్రతి రైతుకు అందించడమే మా లక్ష్యం.",
    ctaButton: "కిసాన్‌బడ్డీని చూడండి →",
    closeAria: "స్వాగత సందేశం మూసివేయి",
  },
  ta: {
    brandTag: "சிறந்த விவசாய அனுபவம்",
    mainHeading: "விவசாயம் இப்போது மேலும் சிறந்ததாகிறது. 🌱",
    subheading:
      "ஒவ்வொரு இந்திய விவசாயிக்கும் விவசாய முடிவுகளை எளிமையாகவும் பயனுள்ளதாகவும் மாற்ற கிசான்படியை நாங்கள் தொடர்ந்து மேம்படுத்துகிறோம்.",
    cardHeading: "இன்னும் சிறந்தது உருவாகிறது.",
    cardDescription:
      "பயனுள்ள விவசாயத் தகவல், ஸ்மார்ட் விவசாய உதவி மற்றும் நம்பகமான தீர்வுகளை ஒவ்வொரு விவசாயிக்கும் கொண்டு சேர்ப்பதே எங்கள் நோக்கம்.",
    ctaButton: "கிசான்படியை ஆராயுங்கள் →",
    closeAria: "வரவேற்பு செய்தியை மூடு",
  },
  mr: {
    brandTag: "अधिक उत्तम शेती अनुभव",
    mainHeading: "शेती आता अधिक स्मार्ट होत आहे. 🌱",
    subheading:
      "प्रत्येक भारतीय शेतकऱ्यासाठी शेतीचे निर्णय सोपे, स्मार्ट आणि अधिक उपयुक्त बनवण्यासाठी आम्ही किसानबडीमध्ये सतत सुधारणा करत आहोत.",
    cardHeading: "काहीतरी अधिक उत्तम घडत आहे.",
    cardDescription:
      "उपयुक्त शेती माहिती, स्मार्ट शेती मार्गदर्शन आणि विश्वासार्ह उपाय प्रत्येक शेतकऱ्यापर्यंत पोहोचवणे हे आमचे ध्येय आहे.",
    ctaButton: "किसानबडी पहा →",
    closeAria: "स्वागत संदेश बंद करा",
  },
  bn: {
    brandTag: "উন্নত চাষের নতুন অভিজ্ঞতা",
    mainHeading: "কৃষি এখন আরও স্মার্ট হয়ে উঠছে। 🌱",
    subheading:
      "প্রত্যেক ভারতীয় কৃষকের জন্য চাষের সিদ্ধান্ত সহজ, নির্ভুল এবং অধিক ফলপ্রসূ করতে আমরা কিষাণবাডিকে প্রতিনিয়ত উন্নত করছি।",
    cardHeading: "আরও ভালো কিছু গড়ে উঠছে।",
    cardDescription:
      "দরকারী কৃষি তথ্য, স্মার্ট চাষের সহায়তা এবং বিশ্বস্ত সমাধান প্রতিটি কৃষকের কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য।",
    ctaButton: "কিষাণবাডি দেখুন →",
    closeAria: "স্বাগত বার্তা বন্ধ করুন",
  },
  pa: {
    brandTag: "ਬਿਹਤਰ ਖੇਤੀ ਦਾ ਨਵਾਂ ਤਜਰਬਾ",
    mainHeading: "ਖੇਤੀ ਹੁਣ ਹੋਰ ਵੀ ਸਮਾਰਟ ਹੋ ਰਹੀ ਹੈ। 🌱",
    subheading:
      "ਅਸੀਂ ਹਰ ਭਾਰਤੀ ਕਿਸਾਨ ਲਈ ਖੇਤੀ ਫੈਸਲਿਆਂ ਨੂੰ ਆਸਾਨ, ਸਮਾਰਟ ਅਤੇ ਵਧੇਰੇ ਮਦਦਗਾਰ ਬਣਾਉਣ ਲਈ ਕਿਸਾਨਬੱਡੀ ਨੂੰ ਲਗਾਤਾਰ ਬਿਹਤਰ ਬਣਾ ਰਹੇ ਹਾਂ।",
    cardHeading: "ਕੁਝ ਹੋਰ ਬਿਹਤਰ ਬਣ ਰਿਹਾ ਹੈ।",
    cardDescription:
      "ਸਾਡਾ ਮਕਸਦ ਹਰ ਕਿਸਾਨ ਤੱਕ ਲਾਹੇਵੰਦ ਖੇਤੀ ਜਾਣਕਾਰੀ, ਸਮਾਰਟ ਸਹਾਇਤਾ ਅਤੇ ਭਰੋਸੇਯੋਗ ਹੱਲ ਪਹੁੰਚਾਉਣਾ ਹੈ।" ,
    ctaButton: "ਕਿਸਾਨਬੱਡੀ ਵੇਖੋ →",
    closeAria: "ਸਵਾਗਤ ਸੁਨੇਹਾ ਬੰਦ ਕਰੋ",
  },
  gu: {
    brandTag: "વધુ ઉત્તમ ખેતીનો અનુભવ",
    mainHeading: "ખેતી હવે વધુ સ્માર્ટ બની રહી છે. 🌱",
    subheading:
      "દરેક ભારતીય ખેડૂત માટે ખેતીના નિર્ણયો સરળ, સ્માર્ટ અને વધુ મદદરૂપ બને તે માટે અમે કિસાનબડીને સતત સુધારી રહ્યા છીએ.",
    cardHeading: "કંઈક વધુ સારું આકાર લઈ રહ્યું છે.",
    cardDescription:
      "ઉપયોગી કૃષિ માહિતી, સ્માર્ટ ખેતી સહાય અને વિશ્વાસપાત્ર ઉકેલો દરેક ખેડૂત સુધી પહોંચાડવાનો અમારો સંકલ્પ છે.",
    ctaButton: "કિસાનબડી જુઓ →",
    closeAria: "સ્વાગત સંદેશ બંધ કરો",
  },
  ml: {
    brandTag: "കൂടുതൽ മെച്ചപ്പെട്ട കൃഷി അനുഭവം",
    mainHeading: "കൃഷി കൂടുതൽ സ്മാർട്ടായി മാറുന്നു. 🌱",
    subheading:
      "ഓരോ ഇന്ത്യൻ കർഷകനും കാർഷിക തീരുമാനങ്ങൾ ലളിതവും കൂടുതൽ പ്രയോജനപ്രദവുമാക്കാൻ ഞങ്ങൾ കിസാൻബഡ്ഡിയെ നിരന്തരം മെച്ചപ്പെടുത്തുന്നു.",
    cardHeading: "കൂടുതൽ മികച്ച ഒന്ന് വളരുന്നു.",
    cardDescription:
      "ഉപയോഗപ്രദമായ കാർഷിക വിവരങ്ങളും സ്മാർട്ട് സഹాయവും വിശ്വസനീയമായ പരിಹാരങ്ങളും ഓരോ കർഷകനിലേക്കും എത്തിക്കുക എന്നതാണ് ഞങ്ങളുടെ ദൗത്യം.",
    ctaButton: "കിസാൻബഡ്ഡി കാണുക →",
    closeAria: "സന്ദേശം അടയ്ക്കുക",
  },
};
