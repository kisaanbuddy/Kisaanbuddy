'use client';

import Link from 'next/link';
import { 
  ArrowRight, BookOpen, Bug, CloudSun, FlaskConical, 
  Landmark, MessageSquare, ShoppingBag, Sparkles, UserCheck 
} from 'lucide-react';
import { useLanguage } from '@/lib/language';

const FEATURES_I18N: Record<string, Record<string, string>> = {
  section_tag: {
    en: 'COMPLETE AGRI-TECH ECOSYSTEM',
    hi: 'खेती के हर चरण के लिए टूल्स',
    kn: 'ಸಮಗ್ರ ಕೃಷಿ-ತಂತ್ರಜ್ಞಾನ ಪರಿಸರ ವ್ಯವಸ್ಥೆ',
    mr: 'संपूर्ण कृषी-तंत्रज्ञान परिसंस्था',
    te: 'పూర్తి వ్యవసాయ సాంకేతిక వ్యవస్థ',
    ta: 'முழுமையான விவசாய தொழில்நுட்ப அமைப்பு',
    gu: 'સંપૂર્ણ કૃષિ-ટેક ઇકોસિસ્ટમ',
    bn: 'সম্পূর্ণ কৃষি-প্রযুক্তি ইকোসিস্টেম',
    pa: 'ਸੰਪੂਰਨ ਖੇਤੀ-ਤਕਨਾਲੋਜੀ ਈਕੋਸਿਸਟਮ',
    ml: 'സമ്പൂർണ്ണ കാർഷിക സാങ്കേതിക ആവാസവ്യവസ്ഥ',
    hi_en: 'Kheti ke Har Charan ke liye Tools',
  },
  section_title: {
    en: 'Tools for Every Stage of Farming.',
    hi: 'खेती के हर चरण के लिए समर्पित समाधान।',
    kn: 'ಕೃಷಿಯ ಪ್ರತಿ ಹಂತಕ್ಕೂ ಸೂಕ್ತ ಪರಿಹಾರಗಳು.',
    mr: 'शेतीच्या प्रत्येक टप्प्यासाठी समर्पित साधने.',
    te: 'వ్యవసాయంలోని ప్రతి దశకు ప్రత్యేక సాధనాలు.',
    ta: 'விவசாயத்தின் ஒவ்வொரு கட்டத்திற்கும் பிரத்யேக கருவிகள்.',
    gu: 'ખેતીના દરેક તબક્કા માટે સમર્પિત સાધનો.',
    bn: 'চাষের প্রতিটি ধাপের জন্য নিবেদিত সরঞ্জাম।',
    pa: 'ਖੇਤੀ ਦੇ ਹਰ ਪੜਾਅ ਲਈ ਸਮਰਪਿਤ ਟੂਲਜ਼।',
    ml: 'കൃഷിയുടെ ഓരോ ഘട്ടത്തിനുമുള്ള പ്രത്യേക ഉപകരണങ്ങൾ.',
    hi_en: 'Kheti ke Har Kadam ke liye Dedicated Solutions.',
  },
  section_desc: {
    en: 'From pre-sowing soil preparation to harvest sales in the wholesale mandi, explore 9 purpose-built tools designed for Indian farming conditions.',
    hi: 'बुवाई से लेकर मंडी में बिक्री तक—KisaanBuddy के 9 कोर टूल्स आपको हर कदम पर वैज्ञानिक व व्यावहारिक सहायता प्रदान करते हैं।',
    kn: 'ಬಿತ್ತನೆ ಪೂರ್ವ ಭೂಮಿ ಸಿದ್ಧತೆಯಿಂದ ಹಿಡಿದು ಮಂಡಿಯಲ್ಲಿ ಮಾರಾಟದವರೆಗೆ — ಭಾರತೀಯ ಕೃಷಿ ಪರಿಸ್ಥಿತಿಗಾಗಿ ನಿರ್ಮಿಸಲಾದ 9 ಪರಿಕರಗಳು.',
    mr: 'पेरणीपूर्व मशागतीपासून ते घाऊक बाजारातील विक्रीपर्यंत — भारतीय शेतीसाठी बनवलेली ९ खास साधने.',
    te: 'విత్తనాలు వేయడం నుండి మార్కెట్లో విక్రయాల వరకు — భారతీయ వ్యవసాయ పరిస్థితుల కోసం రూపొందించిన 9 సాధనాలు.',
    ta: 'விதைப்புக்கு முந்தைய நில தயாரிப்பு முதல் சந்தை விற்பனை வரை — இந்திய விவசாயத்திற்காக உருவாக்கப்பட்ட 9 கருவிகள்.',
    gu: 'વાવણી પહેલાંની જમીન તૈયારીથી લઈને મંડી વેચાણ સુધી — ભારતીય ખેતી માટે બનેલા 9 સાધનો.',
    bn: 'বীজ বপনের প্রস্তুতি থেকে মান্ডিতে বিক্রি পর্যন্ত — ভারতীয় কৃষির জন্য তৈরি ৯টি বিশেষ সরঞ্জাম।',
    pa: 'ਬਿਜਾਈ ਤੋਂ ਲੈ ਕੇ ਮੰਡੀ ਵਿਕਰੀ ਤੱਕ — ਭਾਰਤੀ ਖੇਤੀ ਲਈ ਬਣਾਏ ਗਏ 9 ਖਾਸ ਟੂਲਜ਼।',
    ml: 'വിതയ്ക്കുന്നതിന് മുമ്പുള്ള നിലമൊരുക്കൽ മുതൽ വിപണിയിലെ വിൽപ്പന വരെ — ഇന്ത്യൻ കൃഷിക്കായി രൂപകൽപ്പന ചെയ്ത 9 ഉപകരണങ്ങൾ.',
    hi_en: 'Buwai se lekar mandi sales tak — Indian farming ke liye 9 purpose-built smart tools.',
  },
  launch: {
    en: 'Launch Tool',
    hi: 'उपयोग करें',
    kn: 'ಪರಿಕರ ತೆರೆಯಿರಿ',
    mr: 'सुरू करा',
    te: 'ప్రారంభించండి',
    ta: 'தொடங்குக',
    gu: 'શરૂ કરો',
    bn: 'শুরু করুন',
    pa: 'ਸ਼ੁਰੂ ਕਰੋ',
    ml: 'തുടങ്ങുക',
    hi_en: 'Launch Karein',
  },
};

const TOOLS_CONFIG = [
  {
    key: 'profile',
    icon: UserCheck,
    href: '/profile',
    topGradient: 'from-emerald-500 to-green-600',
    accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    tag: {
      en: 'Farm Identity', hi: 'डिजिटल पहचान', kn: 'ಡಿಜಿಟಲ್ ಗುರುತು',
      mr: 'डिजिटल ओळख', te: 'డిజిటల్ గుర్తింపు', ta: 'டிஜிட்டல் அடையாளம்',
      gu: 'ડિજિટલ ઓળખ', bn: 'ডিজিটাল পরিচয়', pa: 'ਡਿਜੀਟਲ ਪਛਾਣ', ml: 'ഡിജിറ്റൽ ഐഡന്റിറ്റി', hi_en: 'Farm Identity',
    },
    title: {
      en: 'Farmer & Farm Profile', hi: 'किसान व खेत प्रोफाइल', kn: 'ರೈತ ಮತ್ತು ಜಮೀನು ಪ್ರೊಫೈಲ್',
      mr: 'शेतकरी व शेत प्रोफाइल', te: 'రైతు & పొలం ప్రొఫైల్', ta: 'விவசாயி & பண்ணை சுயவிவரம்',
      gu: 'ખેડૂત અને ખેતર પ્રોફાઇલ', bn: 'কৃষক ও খামার প্রোফাইল', pa: 'ਕਿਸਾਨ ਅਤੇ ਖੇਤ ਪ੍ਰੋਫਾਈਲ', ml: 'കർഷക & ഫാം പ്രൊഫൈൽ', hi_en: 'Farmer & Farm Profile',
    },
    desc: {
      en: 'Store plot acreage, soil types, irrigation infrastructure, and equipment for permanent farm memory.',
      hi: 'अपने सभी खेतों का रकबा, मिट्टी प्रकार, उपलब्ध सिंचाई व उपकरण सुरक्षित दर्ज रखें।',
      kn: 'ನಿಮ್ಮ ಎಲ್ಲಾ ಜಮೀನುಗಳ ವಿಸ್ತೀರ್ಣ, ಮಣ್ಣಿನ ಪ್ರಕಾರ, ಲಭ್ಯವಿರುವ ನೀರಾವರಿ ಮತ್ತು ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ದಾಖಲಿಸಿ.',
      mr: 'तुमच्या शेताचे क्षेत्रफळ, मातीचा प्रकार, सिंचन व्यवस्था व अवजारे कायमस्वरूपी नोंदवून ठेवा.',
      te: 'పొలం విస్తీర్ణం, నేల రకాలు, నీటిపారుదల వసతులు మరియు పరికరాలను సురక్షితంగా నమోదు చేసుకోండి.',
      ta: 'நிலப் பரப்பளவு, மண் வகைகள், பாசன வசதிகள் மற்றும் உபகரணங்களை நிரந்தரமாக பதிவு செய்யுங்கள்.',
      gu: 'ખેતરનો વિસ્તાર, જમીનનો પ્રકાર, સિંચાઈ વ્યવસ્થા અને ઓજારો સુરક્ષિત રીતે નોંધો.',
      bn: 'জমির আয়তন, মাটির ধরন, সেচ ব্যবস্থা এবং কৃষি যন্ত্রপাতি স্থায়ীভাবে রেকর্ড করুন।',
      pa: 'ਖੇਤ ਦਾ ਰਕਬਾ, ਮਿੱਟੀ ਦੀ ਕਿਸਮ, ਸਿੰਚਾਈ ਦੇ ਸਾਧਨ ਅਤੇ ਸੰਦ ਸੁਰੱਖਿਅਤ ਦਰਜ ਕਰੋ।',
      ml: 'ഭൂമിയുടെ വിസ്തീർണ്ണം, മണ്ണിന്റെ തരം, ജലസേചന സൗകര്യങ്ങൾ, ഉപകരണങ്ങൾ എന്നിവ രേഖപ്പെടുത്തുക.',
      hi_en: 'Apne khet ka acreage, mitti type, irrigation aur equipment permanently save karein.',
    },
  },
  {
    key: 'disease',
    icon: Bug,
    href: '/disease',
    topGradient: 'from-rose-500 to-red-600',
    accent: 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25',
    tag: {
      en: 'Computer Vision', hi: 'कंप्यूटर विजन', kn: 'ಕಂಪ್ಯೂಟರ್ ವಿಷನ್',
      mr: 'कॉम्प्युटर व्हिजन', te: 'కంప్యూటర్ విజన్', ta: 'கம்ப்யூட்டர் விஷன்',
      gu: 'કમ્પ્યુટર વિઝન', bn: 'কম্পিউটার ভিশন', pa: 'ਕੰਪਿਊਟਰ ਵਿਜ਼ਨ', ml: 'കമ്പ്യൂട്ടർ വിഷൻ', hi_en: 'Computer Vision',
    },
    title: {
      en: 'AI Crop Doctor', hi: 'फसल डॉक्टर AI', kn: 'ಬೆಳೆ ಡಾಕ್ಟರ್ AI',
      mr: 'पीक डॉक्टर AI', te: 'పంట డాక్టర్ AI', ta: 'பயிர் மருத்துவர் AI',
      gu: 'પાક ડોક્ટર AI', bn: 'ফসল ডাক্তার AI', pa: 'ਫਸਲ ਡਾਕਟਰ AI', ml: 'വിള ഡോക്ടർ AI', hi_en: 'Crop Doctor AI',
    },
    desc: {
      en: 'Instant visual leaf diagnosis identifying fungal blights, rusts, and pests with ICAR-approved remedies.',
      hi: 'बीमार पत्ती की फोटो खींचें। AI तुरंत फफूंद, कीट या पोषक तत्व कमी पहचानकर जैविक उपाय देगा।',
      kn: 'ರೋಗಪೀಡಿತ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ. AI ತಕ್ಷಣವೇ ಶಿಲೀಂಧ್ರ, ಕೀಟ ಅಥವಾ ಪೋಷಕಾಂಶಗಳ ಕೊರತೆಯನ್ನು ಗುರುತಿಸಿ ಜೈವಿಕ ಪರಿಹಾರ ನೀಡುತ್ತದೆ.',
      mr: 'आजारी पानाचा फोटो काढा. AI लगेच बुरशी, कीड किंवा पोषण कमतरता ओळखून योग्य उपाय देईल.',
      te: 'వ్యాధి సోకిన ఆకు ఫోటో తీయండి. AI వెంటనే తెగులు, పురుగులు లేదా పోషకాల లోపాన్ని గుర్తించి నివారణ చర్యలు అందిస్తుంది.',
      ta: 'பாதிக்கப்பட்ட இலையின் புகைப்படத்தை எடுக்கவும். AI பூஞ்சை, பூச்சி அல்லது ஊட்டச்சத்து குறைபாட்டை கண்டறிந்து தீர்வு வழங்கும்.',
      gu: 'બીમાર પાંદડાનો ફોટો પાડો. AI તરત જ ફૂગ, જીવાત કે પોષક તત્ત્વોની ખામી ઓળખી સચોટ ઉપાય આપશે.',
      bn: 'আক্রান্ত পাতার ছবি তুলুন। AI তাৎক্ষণিকভাবে ছত্রাক, পোকা বা পুষ্টির ঘাটতি শনাক্ত করে প্রতিকার দেবে।',
      pa: 'ਬਿਮਾਰ ਪੱਤੇ ਦੀ ਫੋਟੋ ਖਿੱਚੋ। AI ਤੁਰੰਤ ਉੱਲੀ, ਕੀੜੇ ਜਾਂ ਪੌਸ਼ਟਿਕ ਤੱਤਾਂ ਦੀ ਘਾਟ ਪਛਾਣ ਕੇ ਹੱਲ ਦੇਵੇਗਾ।',
      ml: 'രോഗം ബാധിച്ച ഇലയുടെ ഫോട്ടോ എടുക്കുക. AI ഫംഗസ്, കീടങ്ങൾ അല്ലെങ്കിൽ പോഷകക്കുറവ് കണ്ടെത്തി പ്രതിവിധി നൽകും.',
      hi_en: 'Bimar patti ki photo lein. AI turant bimari pehchankar safe solution batayega.',
    },
  },
  {
    key: 'chatbot',
    icon: MessageSquare,
    href: '/chatbot',
    topGradient: 'from-teal-500 to-emerald-600',
    accent: 'text-teal-700 dark:text-teal-400 bg-teal-500/10 border-teal-500/25',
    tag: {
      en: 'Voice & Text AI', hi: 'आवाज व चैट', kn: 'ಧ್ವನಿ ಮತ್ತು ಚಾಟ್ AI',
      mr: 'आवाज व चॅट AI', te: 'వాయిస్ & చాట్ AI', ta: 'குரல் & சாட் AI',
      gu: 'વોઇસ અને ચેટ AI', bn: 'ভয়েস ও চ্যাট AI', pa: 'ਆਵਾਜ਼ ਅਤੇ ਚੈਟ AI', ml: 'വോയ്‌സ് & ചാറ്റ് AI', hi_en: 'Voice & Text AI',
    },
    title: {
      en: 'Multilingual Farm Advisor', hi: 'AI कृषि सहायक', kn: 'AI ಕೃಷಿ ಸಹಾಯಕ',
      mr: 'AI शेती सल्लागार', te: 'AI వ్యవసాయ సలహాదారు', ta: 'AI விவசாய ஆலோசகர்',
      gu: 'AI કૃષિ સલાહકાર', bn: 'AI কৃষি উপদেষ্টা', pa: 'AI ਖੇਤੀ ਸਲਾਹਕਾਰ', ml: 'AI കാർഷിക ഉപദേശകൻ', hi_en: 'AI Krishi Sahayak',
    },
    desc: {
      en: 'Ask agronomic questions naturally by voice or text in Hindi, Marathi, Telugu, Tamil, Kannada and all major Indian languages.',
      hi: 'हिंदी, मराठी, तेलुगु, तमिल, कन्नड़ सहित अपनी भाषा में बोलकर या लिखकर खेती का कोई भी सवाल पूछें।',
      kn: 'ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಯಾವುದೇ ಭಾರತೀಯ ಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿ ಅಥವಾ ಪಠ್ಯದ ಮೂಲಕ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಮುಕ್ತವಾಗಿ ಕೇಳಿ.',
      mr: 'मराठी, हिंदी किंवा कोणत्याही भारतीय भाषेत बोलून किंवा लिहून शेतीविषयक कोणतेही प्रश्न विचारा.',
      te: 'తెలుగు, హిందీ లేదా మీ ప్రాంతీయ భాషలో మాట్లాడి లేదా టైప్ చేసి వ్యవసాయ ప్రశ్నలు అడగండి.',
      ta: 'தமிழ், இந்தி அல்லது உங்கள் தாய்மொழியில் பேசியோ எழுதியோ விவசாய கேள்விகளைக் கேளுங்கள்.',
      gu: 'ગુજરાતી, હિન્દી કે તમારી ભાષામાં બોલીને અથવા લખીને ખેતી સંબંધિત પ્રશ્નો પૂછો.',
      bn: 'বাংলা, হিন্দি বা আপনার মাতৃভাষায় কথা বলে বা লিখে কৃষির যেকোনো প্রশ্ন জিজ্ঞাসা করুন।',
      pa: 'ਪੰਜਾਬੀ, ਹਿੰਦੀ ਜਾਂ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਖੇਤੀ ਦੇ ਸਵਾਲ ਪੁੱਛੋ।',
      ml: 'മലയാളം, ഹിന്ദി അല്ലെങ്കിൽ നിങ്ങളുടെ ഭാഷയിൽ സംസാരിച്ചോ എഴുതിയോ കാർഷിക സംശയങ്ങൾ ചോദിക്കാം.',
      hi_en: 'Hindi, Marathi, Telugu, Tamil ya apni bhasha me bolkar kheti ke sawal poochhein.',
    },
  },
  {
    key: 'soil',
    icon: FlaskConical,
    href: '/soil-health',
    topGradient: 'from-amber-500 to-emerald-600',
    accent: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
    tag: {
      en: 'NPK Matrix', hi: 'NPK मैट्रिक्स', kn: 'NPK ಮ್ಯಾಟ್ರಿಕ್ಸ್',
      mr: 'NPK मॅट्रिक्स', te: 'NPK మ్యాట్రిక్స్', ta: 'NPK மேட்ரிக்ஸ்',
      gu: 'NPK મેટ્રિક્સ', bn: 'NPK ম্যাট্রিক্স', pa: 'NPK ਮੈਟ੍ਰਿਕਸ', ml: 'NPK മാട്രിക്സ്', hi_en: 'NPK Matrix',
    },
    title: {
      en: 'Soil Health Intelligence', hi: 'मृदा स्वास्थ्य विश्लेषण', kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ',
      mr: 'माती आरोग्य विश्लेषण', te: 'నేల ఆరోగ్య విశ్లేషణ', ta: 'மண் வள பகுப்பாய்வு',
      gu: 'જમીન આરોગ્ય વિશ્લેષણ', bn: 'মাটির স্বাস্থ্য বিশ্লেষণ', pa: 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਜਾਂਚ', ml: 'മണ്ണ് ആരോഗ്യ വിശകലനം', hi_en: 'Mitti Health Analysis',
    },
    desc: {
      en: 'Balanced fertilizer calculator based on Soil Health Card metrics, cutting waste and optimizing yields.',
      hi: 'मृदा स्वास्थ्य कार्ड के अनुसार यूरिया, डीएपी और पोटाश की सटीक मात्रा जानें।',
      kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಪ್ರಕಾರ ಯೂರಿಯಾ, ಡಿಎಪಿ ಮತ್ತು ಪೊಟ್ಯಾಷ್‌ನ ನಿಖರ ಪ್ರಮಾಣವನ್ನು ತಿಳಿಯಿರಿ.',
      mr: 'सॉईल हेल्थ कार्डनुसार युरिया, डीएपी आणि पोटॅशचे अचूक प्रमाण जाणून खतांचा खर्च वाचवा.',
      te: 'సాయిల్ హెల్త్ కార్డ్ ఆధారంగా యూరియా, డిఎపి మరియు పొటాష్ ఖచ్చితమైన మోతాదును తెలుసుకోండి.',
      ta: 'மண் சுகாதார அட்டை அளவீடுகளின்படி யூரியா, டிஏபி மற்றும் பொட்டாஷ் சரியான அளவைக் கணக்கிடுங்கள்.',
      gu: 'સોઇલ હેલ્થ કાર્ડ મુજબ યુરિયા, ડીએપી અને પોટાશની ચોક્કસ માત્રા જાણી ખાતરનો ખર્ચ ઘટાડો.',
      bn: 'সয়েল হেলথ কার্ডের উপর ভিত্তি করে ইউরিয়া, ডিএপি এবং পটাশের সঠিক পরিমাণ জানুন।',
      pa: 'ਮਿੱਟੀ ਸਿਹਤ ਕਾਰਡ ਅਨੁਸਾਰ ਯੂਰੀਆ, ਡੀਏਪੀ ਅਤੇ ਪੋਟਾਸ਼ ਦੀ ਸਹੀ ਮਾਤਰਾ ਜਾਣੋ।',
      ml: 'സോയിൽ ഹെൽത്ത് കാർഡ് അടിസ്ഥാനമാക്കി കൃത്യമായ വളപ്രയോഗം കണക്കാക്കുക.',
      hi_en: 'Soil Health Card ke hisab se Urea, DAP, Potash ki exact matra jaano.',
    },
  },
  {
    key: 'weather',
    icon: CloudSun,
    href: '/weather',
    topGradient: 'from-sky-500 to-blue-600',
    accent: 'text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/25',
    tag: {
      en: 'Hyperlocal Radar', hi: 'स्प्रे रडार', kn: 'ಸ್ಪ್ರೇ ರಾಡಾರ್',
      mr: 'स्प्रे रडार', te: 'స్ప్రే రాడార్', ta: 'ஸ்ப்ரே ரேடார்',
      gu: 'સ્પ્રે રડાર', bn: 'স্প্রে রাডার', pa: 'ਸਪਰੇਅ ਰਾਡਾਰ', ml: 'സ്പ്രേ റഡാർ', hi_en: 'Spray Radar',
    },
    title: {
      en: 'Weather & Spray Radar', hi: 'मौसम व स्प्रे एडवाइजरी', kn: 'ಹವಾಮಾನ ಮತ್ತು ಸ್ಪ್ರೇ ಸಲಹೆ',
      mr: 'हवामान व फवारणी सल्ला', te: 'వాతావరణం & స్ప్రే సలహా', ta: 'வானிலை & தெளிப்பு ஆலோசனை',
      gu: 'હવામાન અને છંટકાવ સલાહ', bn: 'આબહাওয়া ও স্প্রে পরামর্শ', pa: 'ਮੌਸਮ ਅਤੇ ਸਪਰੇਅ ਸਲਾਹ', ml: 'കാലാവസ്ഥ & സ്പ്രേ ഉപദേശം', hi_en: 'Mausam & Spray Radar',
    },
    desc: {
      en: 'Pinpoint hourly rain probabilities and wind speeds to determine safe pesticide and irrigation windows.',
      hi: 'घंटे-दर-घंटे बारिश की संभावना और हवा की गति से कीटनाशक छिड़काव का सही समय चुनें।',
      kn: 'ಗಂಟೆ-ಗಂಟೆಯ ಮಳೆ ಸಾಧ್ಯತೆ ಮತ್ತು ಗಾಳಿಯ ವೇಗವನ್ನು ನೋಡಿ ಕೀಟನಾಶಕ ಸಿಂಪರಣೆಗೆ ಸರಿಯಾದ ಸಮಯವನ್ನು ಆರಿಸಿ.',
      mr: 'तासागणिक पावसाची शक्यता आणि वाऱ्याचा वेग तपासून कीटकनाशक फवारणीची योग्य वेळ ठरवा.',
      te: 'గంటల వారీగా వర్ష సూచన మరియు గాలి వేగాన్ని చూసి పురుగుమందుల పిచికారీకి సరైన సమయాన్ని ఎంచుకోండి.',
      ta: 'மணிநேர மழை வாய்ப்பு மற்றும் காற்றின் வேகத்தைக் கொண்டு பூச்சிக்கொல்லி தெளிப்பதற்கான உகந்த நேரத்தைத் திட்டமிடுங்கள்.',
      gu: 'કલાક મુજબ વરસાદની શક્યતા અને પવનની ગતિ ચકાસી દવાનો છંટકાવ કરવાનો યોગ્ય સમય પસંદ કરો.',
      bn: 'ঘণ্টা অনুযায়ী বৃষ্টির সম্ভাবনা ও বাতাসের গতি দেখে কীটনাশক স্প্রে করার সঠিক সময় নির্ধারণ করুন।',
      pa: 'ਘੰਟੇਵਾਰ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਅਤੇ ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ਵੇਖ ਕੇ ਕੀਟਨਾਸ਼ਕ ਛਿੜਕਾਅ ਦਾ ਸਹੀ ਸਮਾਂ ਚੁਣੋ।',
      ml: 'മണിക്കൂർ തോറുമുള്ള മഴ സാധ്യതയും കാറ്റിന്റെ വേഗതയും അടിസ്ഥാനമാക്കി കീടനാശിനി തളിക്കാൻ അനുയോജ്യമായ സമയം കണ്ടെത്തുക.',
      hi_en: 'Ghante-dar-ghante baarish aur hawa ki speed dekhkar spray ka sahi time chunein.',
    },
  },
  {
    key: 'mandi',
    icon: ShoppingBag,
    href: '/mandi',
    topGradient: 'from-amber-500 to-orange-500',
    accent: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
    tag: {
      en: 'eNAM Live', hi: '1,000+ मंडियां', kn: '1,000+ ಮಂಡಿಗಳು',
      mr: '१,०००+ मंडया', te: '1,000+ మార్కెట్లు', ta: '1,000+ மண்டிகள்',
      gu: '1,000+ મંડીઓ', bn: '১,০০০+ মান্ডি', pa: '1,000+ ਮੰਡੀਆਂ', ml: '1,000+ മണ്ടികൾ', hi_en: '1,000+ Mandiyan',
    },
    title: {
      en: 'Live Mandi Rates & Trends', hi: 'दैनिक मंडी भाव व ट्रेंड', kn: 'ದೈನಂದಿನ ಮಂಡಿ ದರಗಳು ಮತ್ತು ಟ್ರೆಂಡ್',
      mr: 'थेट मंडी दर व ट्रेंड', te: 'లైవ్ మండి ధరలు & ట్రెండ్స్', ta: 'நேரலை மண்டி விலைகள் & போக்குகள்',
      gu: 'લાઈવ મંડી ભાવ અને ટ્રેન્ડ', bn: 'লাইভ মান্ডি দর ও ট্রেন্ড', pa: 'ਲਾਈਵ ਮੰਡੀ ਰੇਟ ਅਤੇ ਰੁਝਾਨ', ml: 'തത്സമയ വിപണി നിരക്കുകൾ', hi_en: 'Live Mandi Rates & Trends',
    },
    desc: {
      en: 'Daily APMC modal prices, arrival volumes, and 7-day trend indicators across government mandis.',
      hi: '120+ फसलों के न्यूनतम, अधिकतम और मॉडल भाव। 7-दिवसीय मूल्य रुझान के साथ सही समय पर बेचें।',
      kn: '120+ ಬೆಳೆಗಳ ಕನಿಷ್ಠ, ಗರಿಷ್ಠ ಮತ್ತು ಮಾದರಿ ದರಗಳು. 7 ದಿನಗಳ ಬೆಲೆ ಟ್ರೆಂಡ್‌ನೊಂದಿಗೆ ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಮಾರಾಟ ಮಾಡಿ.',
      mr: '१२०+ पिकांचे किमान, कमाल व सरासरी भाव. ७ दिवसांच्या भावाचा ट्रेंड तपासून योग्य वेळी विक्री करा.',
      te: '120+ పంటల కనీస, గరిష్ట మరియు సగటు ధరలు. 7 రోజుల ట్రెండ్‌తో సరైన సమయంలో విక్రయించండి.',
      ta: '120+ பயிர்களுக்கான குறைந்தபட்ச, அதிகபட்ச மற்றும் மாதிரி விலைகள். 7 நாள் விலை போக்குடன் சரியான நேரத்தில் விற்கவும்.',
      gu: '120+ પાકના લઘુત્તમ, મહત્તમ અને મોડલ ભાવ. 7 દિવસના ટ્રેન્ડ સાથે સાચા સમયે વેચાણ કરો.',
      bn: '১২০+ ফসলের সর্বনিম্ন, সর্বোচ্চ এবং গড় দর। ৭ দিনের মূল্য ট্রেন্ড দেখে সঠিক সময়ে ফসল বিক্রি করুন।',
      pa: '120+ ਫਸਲਾਂ ਦੇ ਘੱਟੋ-ਘੱਟ, ਵੱਧ ਤੋਂ ਵੱਧ ਅਤੇ ਔਸਤ ਭਾਅ। 7 ਦਿਨਾਂ ਦੇ ਰੁਝਾਨ ਨਾਲ ਸਹੀ ਸਮੇਂ ਵੇਚੋ।',
      ml: '120+ വിളകളുടെ കുറഞ്ഞ, കൂടിയ, ശരാശരി വിലകൾ. 7 ദിവസത്തെ ട്രെൻഡ് നോക്കി മികച്ച സമയത്ത് വിൽക്കുക.',
      hi_en: '120+ faslon ke modal rates aur 7-day price trend dekhkar sahi time par bechein.',
    },
  },
  {
    key: 'schemes',
    icon: Landmark,
    href: '/schemes',
    topGradient: 'from-indigo-500 to-purple-600',
    accent: 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    tag: {
      en: 'Govt Subsidies', hi: 'सरकारी लाभ', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
      mr: 'शासकीय योजना', te: 'ప్రభుత్వ పథకాలు', ta: 'அரசு மானியங்கள்',
      gu: 'સરકારી સબસિડી', bn: 'সরকারি ভর্তুকি', pa: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ', ml: 'സർക്കാർ സബ്‌സിഡികൾ', hi_en: 'Govt Subsidies',
    },
    title: {
      en: 'Government Schemes Matcher', hi: 'सरकारी योजनाएं व सब्सिडी', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿ',
      mr: 'शासकीय योजना व अनुदान', te: 'ప్రభుత్వ పథకాలు & రాయితీలు', ta: 'அரசு திட்டங்கள் & மானியங்கள்',
      gu: 'સરકારી યોજનાઓ અને સબસિડી', bn: 'সরকারি প্রকল্প ও ভর্তুকি', pa: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਸਬਸਿਡੀ', ml: 'സർക്കാർ പദ്ധതികളും സബ്‌സിഡികളും', hi_en: 'Sarkari Yojnaen & Subsidy',
    },
    desc: {
      en: 'Discover central and state agricultural schemes with clear eligibility criteria and direct links.',
      hi: 'PM-किसान, फसल बीमा, सोलर पंप और ड्रिप सब्सिडी के लिए पात्रता और आवेदन प्रक्रिया जानें।',
      kn: 'ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ, ಸೋಲಾರ್ ಪಂಪ್ ಮತ್ತು ಹನಿ ನೀರಾವರಿ ಸಬ್ಸಿಡಿಗಳ ಅರ್ಹತೆ ಹಾಗೂ ಅರ್ಜಿ ವಿಧಾನ ತಿಳಿಯಿರಿ.',
      mr: 'पीएम-किसान, पीक विमा, सौर पंप आणि ठिबक सिंचन अनुदानासाठी पात्रता व अर्ज प्रक्रिया जाणून घ्या.',
      te: 'పీఎం-కిసాన్, పంట బీమా, సోలార్ పంపులు మరియు డ్రిప్ సబ్సిడీల అర్హత మరియు దరఖాస్తు విధానం తెలుసుకోండి.',
      ta: 'பிஎம்-கிசான், பயிர் காப்பீடு, சோலார் பம்ப் மற்றும் சொட்டுநீர் பாசன மானியங்களுக்கான தகுதி மற்றும் விண்ணப்ப முறை.',
      gu: 'પીએમ-કિસાન, પાક વીમો, સોલર પંપ અને ટપક સિંચાઈ સબસિડીની પાત્રતા અને અરજી પ્રક્રિયા જાણો.',
      bn: 'পিএম-কিসান, ফসল বিমা, সৌর পাম্প এবং ড্রিপ সেচ ভর্তুকির যোগ্যতা ও আবেদন প্রক্রিয়া জানুন।',
      pa: 'ਪੀਐਮ-ਕਿਸਾਨ, ਫਸਲ ਬੀਮਾ, ਸੋਲਰ ਪੰਪ ਅਤੇ ਤੁਪਕਾ ਸਿੰਚਾਈ ਸਬਸਿਡੀ ਦੀ ਯੋਗਤਾ ਅਤੇ ਅਪਲਾਈ ਕਰਨ ਦਾ ਤਰੀਕਾ।',
      ml: 'പിഎം-കിസാൻ, വിള ഇൻഷുറൻസ്, സോളാർ പമ്പ്, തുള്ളിനന സബ്‌സിഡികൾ എന്നിവയുടെ യോഗ്യതയും അപേക്ഷാരീതിയും അറിയുക.',
      hi_en: 'PM-Kisan, Fasal Bima, Solar Pump aur Drip subsidy ki eligibility aur application process jaano.',
    },
  },
  {
    key: 'marketplace',
    icon: ShoppingBag,
    href: '/marketplace',
    topGradient: 'from-emerald-600 to-teal-500',
    accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    tag: {
      en: 'Direct Trade', hi: 'सीधी खरीद-बिक्री', kn: 'ನೇರ ಖರೀದಿ-ಮಾರಾಟ',
      mr: 'थेट खरेदी-विक्री', te: 'ప్రత్యక్ష కొనుగోలు-విక్రయం', ta: 'நேரடி வர்த்தகம்',
      gu: 'સીધી ખરીદ-વેચાણ', bn: 'সরাসরি কেনাবেচা', pa: 'ਸਿੱਧੀ ਖਰੀਦ-ਵੇਚ', ml: 'നേരിട്ടുള്ള വ്യാപാരം', hi_en: 'Direct Trade',
    },
    title: {
      en: 'Agricultural Marketplace', hi: 'किसान मार्केटप्लेस', kn: 'ಕೃಷಿ ಮಾರುಕಟ್ಟೆ',
      mr: 'शेतकरी बाजारपेठ', te: 'వ్యవసాయ మార్కెట్‌ప్లేస్', ta: 'விவசாய சந்தை',
      gu: 'કૃષિ માર્કેટપ્લેસ', bn: 'কৃষি মার্কেটপ্লেস', pa: 'ਖੇਤੀਬਾੜੀ ਮਾਰਕੀਟਪਲੇਸ', ml: 'കാർഷിക വിപണി', hi_en: 'Kisan Marketplace',
    },
    desc: {
      en: 'Connect directly with local buyers, FPOs, and fellow farmers to trade produce and lease machinery.',
      hi: 'अपनी फसल, बीज या किराए के उपकरण सीधे अन्य किसानों और खरीदारों के साथ साझा करें।',
      kn: 'ನಿಮ್ಮ ಬೆಳೆ, ಬೀಜ ಅಥವಾ ಬಾಡಿಗೆ ಉಪಕರಣಗಳನ್ನು ಇತರ ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರೊಂದಿಗೆ ನೇರವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ.',
      mr: 'आपले पीक, बियाणे किंवा भाडेतत्त्वावरील अवजारे इतर शेतकरी आणि खरेदीदारांशी थेट जोडून विका.',
      te: 'మీ పంట, విత్తనాలు లేదా అద్దె పరికరాలను ఇతర రైతులు మరియు కొనుగోలుదారులతో నేరుగా వ్యాపారం చేయండి.',
      ta: 'உங்கள் விளைபொருட்கள், விதைகள் அல்லது வாடகை உபகரணங்களை நேரடியாக பிற விவசாயிகள் மற்றும் வாங்குபவர்களிடம் விற்கலாம்.',
      gu: 'તમારો પાક, બિયારણ અથવા ભાડાના ઓજારો અન્ય ખેડૂતો અને ખરીદદારો સાથે સીધા શેર કરો.',
      bn: 'আপনার ফসল, বীজ বা ভাড়ার যন্ত্রপাতি সরাসরি অন্যান্য কৃষক এবং ক্রেতাদের কাছে বিক্রি করুন।',
      pa: 'ਆਪਣੀ ਫਸਲ, ਬੀਜ ਜਾਂ ਕਿਰਾਏ ਦੇ ਸੰਦ ਦੂਜੇ ਕਿਸਾਨਾਂ ਅਤੇ ਖਰੀਦਦਾਰਾਂ ਨਾਲ ਸਿੱਧੇ ਸਾਂਝੇ ਕਰੋ।',
      ml: 'നിങ്ങളുടെ വിളകൾ, വിത്തുകൾ, വാടക ഉപകരണങ്ങൾ എന്നിവ മറ്റ് കർഷകരുമായും വാങ്ങുന്നവരുമായും നേരിട്ട് വ്യാപാരം ചെയ്യുക.',
      hi_en: 'Apni fasal, beej ya kiraye ke equipment seedhe farmers aur buyers ke sath share karein.',
    },
  },
  {
    key: 'khet-diary',
    icon: BookOpen,
    href: '/khet-diary',
    topGradient: 'from-green-600 to-emerald-700',
    accent: 'text-green-700 dark:text-green-400 bg-green-500/10 border-green-500/25',
    tag: {
      en: 'Farm Ledger', hi: 'डिजिटल बहीखाता', kn: 'ಡಿಜಿಟಲ್ ಕೃಷಿ ಖಾತೆ',
      mr: 'डिजिटल वहीखाते', te: 'డిజిటల్ లెడ్జర్', ta: 'பண்ணை கணக்கு புத்தகம்',
      gu: 'ડિજિટલ ખાતાવહી', bn: 'ডিজিটাল খতিয়ান', pa: 'ਡਿਜੀਟਲ ਵਹੀ-ਖਾਤਾ', ml: 'ഫാം ലെഡ്ജർ', hi_en: 'Digital Bahikhata',
    },
    title: {
      en: 'Khet Diary & Field Logs', hi: 'खेत डायरी व खर्च रिकॉर्ड', kn: 'ಖೇತ್ ಡೈರಿ ಮತ್ತು ವೆಚ್ಚ ದಾಖಲೆ',
      mr: 'शेत डायरी व खर्च नोंद', te: 'ఖేత్ డైరీ & ఖర్చుల రికార్డు', ta: 'பண்ணை நாட்குறிப்பு & செலவு பதிவு',
      gu: 'ખેતર ડાયરી અને ખર્ચ નોંધ', bn: 'ক্ষেত ডায়েরি ও খরচ রেকর্ড', pa: 'ਖੇਤ ਡਾਇਰੀ ਅਤੇ ਖਰਚਾ ਰਿਕਾਰਡ', ml: 'ഫാം ഡയറിയും ചെലവ് രേഖകളും', hi_en: 'Khet Diary & Kharch Record',
    },
    desc: {
      en: 'Log daily farm activities, fertilizer applications, and operational expenses for clear seasonal profitability.',
      hi: 'बीज, खाद, दवाई और मजदूरी का खर्च लिखें। हर सीजन के मुनाफे का साफ हिसाब रखें।',
      kn: 'ಬೀಜ, ಗೊಬ್ಬರ, ಔಷಧಿ ಮತ್ತು ಕೂಲಿ ವೆಚ್ಚಗಳನ್ನು ದಾಖಲಿಸಿ. ಪ್ರತಿ ಸೀಸನ್‌ನ ಲಾಭ-ನಷ್ಟದ ನಿಖರ ಲೆಕ್ಕವಿಡಿ.',
      mr: 'बियाणे, खते, औषधे आणि मजुरीचा खर्च नोंदवा. प्रत्येक हंगामातील नफ्याचा स्पष्ट हिशोब ठेवा.',
      te: 'విత్తనాలు, ఎరువులు, మందులు మరియు కూలీల ఖర్చులను రాయండి. ప్రతి సీజన్ లాభనష్టాల లెక్క సరిగ్గా ఉంచండి.',
      ta: 'விதை, உரம், மருந்து மற்றும் கூலி செலவுகளைப் பதிவு செய்யுங்கள். ஒவ்வொரு பருவத்தின் லாபத்தையும் தெளிவாகக் கணக்கிடுங்கள்.',
      gu: 'બિયારણ, ખાતર, દવા અને મજૂરીનો ખર્ચ લખો. દરેક સિઝનના નફા-નુકસાનનો ચોખ્ખો હિસાબ રાખો.',
      bn: 'বীজ, সার, কীটনাশক এবং মজুরির খরচ লিপিবদ্ধ করুন। প্রতিটি মৌসুমের লাভের স্পষ্ট হিসাব রাখুন।',
      pa: 'ਬੀਜ, ਖਾਦ, ਦਵਾਈ ਅਤੇ ਮਜ਼ਦੂਰੀ ਦਾ ਖਰਚਾ ਲਿਖੋ। ਹਰ ਸੀਜ਼ਨ ਦੇ ਮੁਨਾਫ਼ੇ ਦਾ ਸਾਫ਼ ਹਿਸਾਬ ਰੱਖੋ।',
      ml: 'വിത്ത്, വളം, കീടനാശിനി, കൂലി ചെലവുകൾ രേഖപ്പെടുത്തുക. ഓരോ സീസണിലെയും ലാഭം വ്യക്തമായി അറിയുക.',
      hi_en: 'Beej, khaad, dawai aur mazdoori ka kharcha likhein. Har season ke munafey ka hisaab rakhein.',
    },
  },
];

export function Features() {
  const { lang } = useLanguage();
  const txt = (key: string): string => FEATURES_I18N[key]?.[lang] || FEATURES_I18N[key]?.en || '';

  return (
    <section id="features" className="py-16 sm:py-24 bg-background relative border-b border-border/60">
      {/* Background glow */}
      <div className="absolute inset-x-0 top-1/4 h-[400px] bg-emerald-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{txt('section_tag')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {txt('section_title')}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {txt('section_desc')}
          </p>
        </div>

        {/* 9-Tool Grid */}
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS_CONFIG.map((tool, idx) => {
            const Icon = tool.icon;
            const tag = tool.tag[lang] || tool.tag.en;
            const title = tool.title[lang] || tool.title.en;
            const desc = tool.desc[lang] || tool.desc.en;

            return (
              <Link
                key={idx}
                href={tool.href}
                className="group relative rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Top Accent Gradient Bar */}
                <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${tool.topGradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div>
                  {/* Icon & Category Tag Header */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform duration-200 ${tool.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted border border-border/60 text-muted-foreground text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
                      {tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mb-2 text-lg font-display font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                    {desc}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{txt('launch')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
