'use client';

import Link from 'next/link';
import { Layers, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const VALUE_I18N: Record<string, Record<string, string>> = {
  tag: {
    en: 'A Unified Farming Platform',
    hi: 'एकीकृत कृषि मंच',
    kn: 'ಸಮಗ್ರ ಕೃಷಿ ವೇದಿಕೆ',
    mr: 'एकीकृत कृषी व्यासपीठ',
    te: 'సమగ్ర వ్యవసాయ వేదిక',
    ta: 'ஒருங்கிணைந்த விவசாய தளம்',
    gu: 'સંકલિત કૃષિ પ્લેટફોર્મ',
    bn: 'সমন্বিত কৃষি প্ল্যাটফর্ম',
    pa: 'ਸੰਯੁਕਤ ਖੇਤੀ ਮੰਚ',
    ml: 'സംയോജിത കാർഷിക പ്ലാറ്റ്‌ഫോം',
    hi_en: 'A Unified Farming Platform',
  },
  title: {
    en: 'Everything Your Farm Needs. One Intelligent Platform.',
    hi: 'आपके खेत की हर ज़रूरत। एक सरल मंच पर।',
    kn: 'ನಿಮ್ಮ ಕೃಷಿಯ ಪ್ರತಿಯೊಂದು ಅಗತ್ಯಕ್ಕೂ. ಒಂದು ಬುದ್ಧಿವಂತ ವೇದಿಕೆ.',
    mr: 'तुमच्या शेताची प्रत्येक गरज. एकाच बुद्धिमान व्यासपीठावर.',
    te: 'మీ వ్యవసాయానికి అవసరమైనవన్నీ. ఒకే వేదికపై.',
    ta: 'உங்கள் பண்ணைக்கு தேவையான அனைத்தும். ஒரே தளத்தில்.',
    gu: 'તમારા ખેતરની દરેક જરૂરિયાત. એક જ સ્માર્ટ પ્લેટફોર્મ પર.',
    bn: 'আপনার খামারের প্রতিটি প্রয়োজন। একটি বুদ্ধিমান প্ল্যাটফর্মে।',
    pa: 'ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਹਰ ਲੋੜ। ਇੱਕੋ ਬੁੱਧੀਮਾਨ ਮੰਚ ਤੇ।',
    ml: 'നിങ്ങളുടെ ഫാമിന് ആവശ്യമായതെല്ലാം. ഒരൊറ്റ സ്മാർട്ട് പ്ലാറ്റ്‌ഫോമിൽ.',
    hi_en: 'Aapke Khet ki Har Zaroorat. Ek Smart Platform par.',
  },
  desc: {
    en: 'Keep your farm information organized, get guidance relevant to your crops, understand local conditions, and explore opportunities to sell your produce.',
    hi: 'खेत की जानकारी व्यवस्थित रखें, अपनी फसलों के अनुसार सलाह पाएं, स्थानीय मौसम समझें और फसल बेचने के सही अवसर तलाशें।',
    kn: 'ನಿಮ್ಮ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ವ್ಯವಸ್ಥಿತವಾಗಿರಿಸಿ, ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ತಕ್ಕಂತೆ ಸಲಹೆ ಪಡೆಯಿರಿ, ಸ್ಥಳೀಯ ಹವಾಮಾನವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ ಮತ್ತು ಉತ್ತಮ ಮಾರುಕಟ್ಟೆ ಅವಕಾಶಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.',
    mr: 'शेतीची माहिती व्यवस्थित ठेवा, पिकांनुसार सानुकूल सल्ला मिळवा, स्थानिक हवामान समजून घ्या आणि योग्य बाजारपेठेचा शोध घ्या.',
    te: 'మీ వ్యవసాయ సమాచారాన్ని క్రమబద్ధీకరించండి, పంటలకు అనువైన సలహాలను పొందండి, స్థానిక వాతావరణాన్ని అర్థం చేసుకోండి మరియు ఉత్పత్తులను లాభదాయకంగా విక్రయించండి.',
    ta: 'உங்கள் பண்ணைத் தகவல்களை ஒழுங்கமைக்கவும், பயிர்களுக்கு ஏற்ற ஆலோசனைகளைப் பெறவும், உள்ளூர் காலநிலையைப் புரிந்து கொள்ளவும், சிறந்த சந்தை வாய்ப்புகளைக் கண்டறியவும்.',
    gu: 'ખેતરની માહિતી વ્યવસ્થિત રાખો, પાક મુજબ સચોट માર્ગદર્શન મેળવો, સ્થાનિક વાતાવરણ સમજો અને ઉપજ વેચવાની શ્રેષ્ઠ તકો શોધો.',
    bn: 'আপনার খামারের তথ্য গুছিয়ে রাখুন, ফসলের উপযোগী পরামর্শ পান, স্থানীয় আবহাওয়া বুঝুন এবং ফসল বিক্রির সেরা সুযোগ খুঁজুন।',
    pa: 'ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ ਵਿਵਸਥਿਤ ਰੱਖੋ, ਫਸਲਾਂ ਅਨੁਸਾਰ ਸਲਾਹ ਲਓ, ਸਥਾਨਕ ਮੌਸਮ ਸਮਝੋ ਅਤੇ ਫਸਲ ਵੇਚਣ ਦੇ ਸਹੀ ਮੌਕੇ ਲੱਭੋ।',
    ml: 'ഫാം വിവരങ്ങൾ ചിട്ടയായി സൂക്ഷിക്കുക, വിളകൾക്കനുയോജ്യമായ ഉപദേശങ്ങൾ നേടുക, കാലാവസ്ഥ അറിയുക, ഉൽപ്പന്നങ്ങൾ മികച്ച വിലയ്ക്ക് വിൽക്കുക.',
    hi_en: 'Khet ki information organize karein, crop-specific guidance lein, local weather samjhein aur market opportunities explore karein.',
  },
};

const PROPS_DATA = [
  {
    icon: Layers,
    title: {
      en: 'Understand Your Farm', hi: 'अपने खेत को समझें', kn: 'ನಿಮ್ಮ ಜಮೀನನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
      mr: 'आपली शेती समजून घ्या', te: 'మీ పొలాన్ని అర్థం చేసుకోండి', ta: 'உங்கள் பண்ணையை புரிந்து கொள்ளுங்கள்',
      gu: 'તમારું ખેતર સમજો', bn: 'আপনার খামার বুঝুন', pa: 'ਆਪਣੇ ਖੇਤ ਨੂੰ ਸਮਝੋ', ml: 'നിങ്ങളുടെ ഫാം അറിയുക', hi_en: 'Apne Khet ko Samjhein',
    },
    tag: {
      en: 'Structured Farm Data', hi: 'डिजिटल पहचान', kn: 'ವ್ಯವಸ್ಥಿತ ಕೃಷಿ ಡೇಟಾ',
      mr: 'संरचित शेती डेटा', te: 'వ్యవస్థీకృత పొలం డేటా', ta: 'முறைப்படுத்தப்பட்ட பண்ணை தரவு',
      gu: 'વ્યવસ્થિત ખેતર ડેટા', bn: 'কাঠামোগত খামার ডেটা', pa: 'ਸੰਰਚਿਤ ਖੇਤ ਡੇਟਾ', ml: 'ക്രമീകരിച്ച ഫാം ഡാറ്റ', hi_en: 'Structured Farm Data',
    },
    description: {
      en: 'Maintain a structured, permanent record of your farm acreage, individual plots, crop varieties, soil tests, and seasonal farming activities.',
      hi: 'अपने खेत, विभिन्न प्लॉट्स, फसल किस्मों, मिट्टी परीक्षणों और गतिविधियों का व्यवस्थित डिजिटल रिकॉर्ड रखें।',
      kn: 'ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ, ಪ್ರತ್ಯೇಕ ಪ್ಲಾಟ್‌ಗಳು, ಬೆಳೆ ತಳಿಗಳು, ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಋತುವಿನ ಚಟುವಟಿಕೆಗಳ ಶಾಶ್ವತ ಡಿಜಿಟಲ್ ದಾಖಲೆಯನ್ನು ನಿರ್ವಹಿಸಿ.',
      mr: 'तुमच्या शेताचे क्षेत्रफळ, स्वतंत्र प्लॉट्स, पिकांच्या जाती, माती परीक्षण आणि हंगामातील कामांची कायमस्वरूपी नोंद ठेवा.',
      te: 'మీ పొలం విస్తీర్ణం, వ్యక్తిగత ప్లాట్లు, పంట రకాలు, నేల పరీక్షలు మరియు కాలానుగుణ కార్యకలాపాల శాశ్వత రికార్డును నిర్వహించండి.',
      ta: 'உங்கள் நிலப்பரப்பு, தனித்தனி நிலங்கள், பயிர் வகைகள், மண் பரிசோதனை மற்றும் பருவகால செயல்பாடுகளின் நிரந்தர டிஜிட்டல் பதிவை வைத்திருங்கள்.',
      gu: 'તમારા ખેતરનો વિસ્તાર, વ્યક્તિગત પ્લોટ, પાકની જાતો, જમીન પરીક્ષણો અને મોસમી કામગીરીનો કાયમી ડિજિટલ રેકોર્ડ રાખો.',
      bn: 'আপনার জমির পরিমাণ, পৃথক প্লট, ফসলের জাত, মৃত্তিকা পরীক্ষা এবং মৌসুমী কাজের একটি স্থায়ী রেকর্ড বজায় রাখুন।',
      pa: 'ਆਪਣੇ ਖੇਤ ਦਾ ਰਕਬਾ, ਵੱਖ-ਵੱਖ ਪਲਾਟ, ਫਸਲ ਦੀਆਂ ਕਿਸਮਾਂ, ਮਿੱਟੀ ਟੈਸਟ ਅਤੇ ਮੌਸਮੀ ਕੰਮਾਂ ਦਾ ਪੱਕਾ ਰਿਕਾਰਡ ਰੱਖੋ।',
      ml: 'നിങ്ങളുടെ ഭൂമിയുടെ വിസ്തീർണ്ണം, പ്ലോട്ടുകൾ, വിളകൾ, മണ്ണ് പരിശോധനകൾ, സീസണൽ പ്രവർത്തനങ്ങൾ എന്നിവയുടെ സ്ഥിരമായ രേഖ സൂക്ഷിക്കുക.',
      hi_en: 'Apne khet, plots, crop varieties, soil tests aur activities ka permanent digital record rakhein.',
    },
    link: '/profile',
    linkText: {
      en: 'View Farm Profile', hi: 'फार्म प्रोफाइल देखें', kn: 'ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ',
      mr: 'फार्म प्रोफाइल पहा', te: 'ఫార్మ్ ప్రొఫైల్ చూడండి', ta: 'பண்ணை விவரத்தை காண்க',
      gu: 'ખેતર પ્રોફાઇલ જુઓ', bn: 'খামার প্রোফাইল দেখুন', pa: 'ਫਾਰਮ ਪ੍ਰੋਫਾਈਲ ਵੇਖੋ', ml: 'ഫാം പ്രൊഫൈൽ കാണുക', hi_en: 'Farm Profile Dekhein',
    },
  },
  {
    icon: Sparkles,
    title: {
      en: 'Make Informed Decisions', hi: 'सटीक और समय पर फैसले लें', kn: 'ಮಾಹಿತಿಯುತ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ',
      mr: 'माहितीपूर्ण आणि अचूक निर्णय घ्या', te: 'సమగ్ర సమాచారంతో నిర్ణయాలు తీసుకోండి', ta: 'தகவலறிந்த முடிவுகளை எடுங்கள்',
      gu: 'માહિતગાર અને સચોટ નિર્ણયો લો', bn: 'সঠিক তথ্যের ভিত্তিতে সিদ্ধান্ত নিন', pa: 'ਜਾਣਕਾਰੀ ਭਰਪੂਰ ਫੈਸਲੇ ਲਓ', ml: 'കൃത്യമായ തീരുമാനങ്ങൾ എടുക്കുക', hi_en: 'Informed Decisions Lein',
    },
    tag: {
      en: 'Context-Aware Guidance', hi: 'AI फसल सलाह', kn: 'AI ಕೃಷಿ ಸಲಹೆ',
      mr: 'AI पीक सल्ला', te: 'AI పంట సలహా', ta: 'AI பயிர் ஆலோசனை',
      gu: 'AI પાક સલાહ', bn: 'AI ফসল পরামর্শ', pa: 'AI ਫਸਲ ਸਲਾਹ', ml: 'AI വിള ഉപദേശം', hi_en: 'Context-Aware Guidance',
    },
    description: {
      en: 'Replace generic advice with guidance generated from your actual crop variety, sowing timeline, soil nutrient balance, and microclimate.',
      hi: 'सामान्य सलाह के बजाय अपने खेत के डेटा, वास्तविक मौसम पूर्वानुमान और ICAR दिशानिर्देशों पर आधारित मार्गदर्शन पाएं।',
      kn: 'ಸಾಮಾನ್ಯ ಸಲಹೆಯ ಬದಲು ನಿಮ್ಮ ನಿಜವಾದ ಬೆಳೆ ತಳಿ, ಬಿತ್ತನೆ ಸಮಯ, ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನ ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನವನ್ನು ಆಧರಿಸಿ ಸೂಕ್ತ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.',
      mr: 'साध्या सामान्य सल्ल्याऐवजी तुमच्या पिकाची जात, पेरणीचा काळ, जमिनीतील पोषण आणि स्थानिक हवामानावर आधारित मार्गदर्शन मिळवा.',
      te: 'సాధారణ సలహాలకు బదులుగా మీ పంట రకం, విత్తిన సమయం, నేల పోషకాల సమతుల్యత మరియు వాతావరణం ఆధారంగా మార్గదర్శకత్వం పొందండి.',
      ta: 'பொதுவான ஆலோசனைகளுக்குப் பதிலாக பயிர் வகை, விதைப்பு காலம், மண் சத்துக்கள் மற்றும் உள்ளூர் காலநிலைக்கு ஏற்ப துல்லியமான வழிகாட்டுதல் பெறுங்கள்.',
      gu: 'સામાન્ય સલાહને બદલે પાકની જાત, વાવણીનો સમય, જમીનના પોષક તત્ત્વો અને સ્થાનિક વાતાવરણ પર આધારિત માર્ગદર્શન મેળવો.',
      bn: 'সাধারণ উপদেশের পরিবর্তে আপনার আসল ফসলের জাত, বপনের সময়, মাটির পুষ্টি এবং স্থানীয় আবহাওয়ার উপর ভিত্তি করে পরামর্শ পান।',
      pa: 'ਆਮ ਸਲਾਹ ਦੀ ਥਾਂ ਆਪਣੀ ਫਸਲ ਦੀ ਕਿਸਮ, ਬਿਜਾਈ ਦੇ ਸਮੇਂ, ਮਿੱਟੀ ਦੇ ਪੌਸ਼ਟਿਕ ਤੱਤਾਂ ਅਤੇ ਸਥਾਨਕ ਮੌਸਮ ਅਨੁਸਾਰ ਸਲਾਹ ਲਓ।',
      ml: 'സാധാരണ ഉപദേശങ്ങൾക്ക് പകരം നിങ്ങളുടെ വിള ഇനം, വിതച്ച സമയം, മണ്ണിന്റെ ഗുണം, പ്രാദേശിക കാലാവസ്ഥ എന്നിവ അടിസ്ഥാനമാക്കി മാർഗ്ഗനിർദ്ദേശം നേടുക.',
      hi_en: 'Generic advice ke badle crop variety, sowing date, soil nutrients aur local mausam ke hisab se guidance paayein.',
    },
    link: '/chatbot',
    linkText: {
      en: 'Consult AI Advisor', hi: 'AI सलाहकार से पूछें', kn: 'AI ಸಲಹೆಗಾರರನ್ನು ಕೇಳಿ',
      mr: 'AI सल्लागाराला विचारा', te: 'AI సలహాదారుని అడగండి', ta: 'AI ஆலோசகரிடம் கேளுங்கள்',
      gu: 'AI સલાહકારને પૂછો', bn: 'AI উপদেষ্টাকে জিজ্ঞাসা করুন', pa: 'AI ਸਲਾਹਕਾਰ ਤੋਂ ਪੁੱਛੋ', ml: 'AI ഉപദേശകനോട് ചോദിക്കുക', hi_en: 'AI Advisor se Poochhein',
    },
  },
  {
    icon: TrendingUp,
    title: {
      en: 'Discover Market Opportunities', hi: 'मंडी और बाज़ार के अवसर खोजें', kn: 'ಮಾರುಕಟ್ಟೆ ಅವಕಾಶಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
      mr: 'बाजारपेठेतील उत्तम संधी शोधा', te: 'మార్కెట్ అవకాశాలను అన్వేషించండి', ta: 'சந்தை வாய்ப்புகளைக் கண்டறியுங்கள்',
      gu: 'બજારની શ્રેષ્ઠ તકો શોધો', bn: 'বাজারের নতুন সুযোগ খুঁজুন', pa: 'ਮੰਡੀ ਅਤੇ ਬਾਜ਼ਾਰ ਦੇ ਮੌਕੇ ਲੱਭੋ', ml: 'വിപണി അവസരങ്ങൾ കണ്ടെത്തുക', hi_en: 'Market Opportunities Khojein',
    },
    tag: {
      en: 'Direct Trade', hi: 'पारदर्शी व्यापार', kn: 'ನೇರ ವ್ಯಾಪಾರ',
      mr: 'थेट व पारदर्शक व्यापार', te: 'ప్రత్యక్ష వ్యాపారం', ta: 'நேரடி வர்த்தகம்',
      gu: 'સીધો વેપાર', bn: 'সরাসরি বাণিজ্য', pa: 'ਸਿੱਧਾ ਵਪਾਰ', ml: 'നേരിട്ടുള്ള വ്യാപാരം', hi_en: 'Direct Trade',
    },
    description: {
      en: 'Compare real-time AGMARKNET APMC mandi arrival prices and connect your standing harvest directly to institutional buyers and FPOs.',
      hi: 'सरकारी AGMARKNET मंडियों के लाइव भाव देखें और प्रमाणित खरीदारों व FPO से सीधे जुड़कर बिचौलियों का खर्च बचाएं।',
      kn: 'ಸರ್ಕಾರಿ AGMARKNET ಮಂಡಿಗಳ ನೈಜ-ಸಮಯದ ದರಗಳನ್ನು ಹೋಲಿಸಿ ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ ಖರೀದಿದಾರರು ಹಾಗೂ FPO ಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ ಮಧ್ಯವರ್ತಿಗಳ ವೆಚ್ಚವನ್ನು ಉಳಿಸಿ.',
      mr: 'अधिकृत AGMARKNET बाजारभाव तपासा आणि खरेदीदार व शेतकरी उत्पादक कंपन्यांशी (FPO) थेट जोडून दलालांचा खर्च वाचवा.',
      te: 'అధికారిక AGMARKNET మార్కెట్ ధరలను పోల్చండి మరియు కొనుగోలుదారులు, FPOలతో నేరుగా అనుసంధానమై దళారుల ఖర్చులను నివారించండి.',
      ta: 'நேரலை AGMARKNET மண்டி விலைகளை ஒப்பிட்டு, அங்கீகரிக்கப்பட்ட வாங்குபவர்கள் மற்றும் FPO-க்களுடன் நேரடியாக இணைந்து இடைத்தரகர் செலவை சேமிக்கவும்.',
      gu: 'સરકારી AGMARKNET મંડીના લાઈવ ભાવ સરખાવો અને ખરીદદારો તથા FPO સાથે સીધા જોડાઈ વચેટિયાઓનો ખર્ચ બચાવો.',
      bn: 'সরকারি AGMARKNET মান্ডির সরাসরি দর তুলনা করুন এবং বিশ্বস্ত ক্রেতা ও FPO-এর সাথে সরাসরি যুক্ত হয়ে মধ্যস্বত্বভোগীদের খরচ বাঁচান।',
      pa: 'ਸਰਕਾਰੀ AGMARKNET ਮੰਡੀ ਦੇ ਲਾਈਵ ਰੇਟ ਵੇਖੋ ਅਤੇ ਖਰੀਦਦਾਰਾਂ ਤੇ FPOs ਨਾਲ ਸਿੱਧੇ ਜੁੜ ਕੇ ਵਿਚੋਲਿਆਂ ਦਾ ਖਰਚਾ ਬਚਾਓ।',
      ml: 'തത്സമയ AGMARKNET വിപണി വിലകൾ താരതമ്യം ചെയ്യുക, വാങ്ങുന്നവരുമായും FPO-കളുമായും നേരിട്ട് ബന്ധപ്പെട്ട് ഇടനിലക്കാരെ ഒഴിവാക്കുക.',
      hi_en: 'Live AGMARKNET mandi rates compare karein aur verified buyers & FPOs se connect hokar middlemen cost bachayein.',
    },
    link: '/marketplace',
    linkText: {
      en: 'Explore Marketplace', hi: 'मार्केटप्लेस देखें', kn: 'ಮಾರುಕಟ್ಟೆ ಅನ್ವೇಷಿಸಿ',
      mr: 'मार्केटप्लेस पहा', te: 'మార్కెట్‌ప్లేస్‌ను అన్వేషించండి', ta: 'சந்தையை ஆராயுங்கள்',
      gu: 'માર્કેટપ્લેસ જુઓ', bn: 'মার্কেটপ্লেস দেখুন', pa: 'ਮਾਰਕੀਟਪਲੇਸ ਵੇਖੋ', ml: 'വിപണി പരിശോധിക്കുക', hi_en: 'Marketplace Dekhein',
    },
  },
];

export function ValueProposition() {
  const { lang } = useLanguage();
  const txt = (key: string): string => VALUE_I18N[key]?.[lang] || VALUE_I18N[key]?.en || '';

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-card border-b border-[#E2E8E2] dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16845B] dark:text-emerald-400">
            {txt('tag')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] dark:text-white tracking-tight">
            {txt('title')}
          </h2>
          <p className="text-base text-[#647067] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {txt('desc')}
          </p>
        </div>

        {/* 3 Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROPS_DATA.map((item, idx) => {
            const Icon = item.icon;
            const title = item.title[lang] || item.title.en;
            const tag = item.tag[lang] || item.tag.en;
            const description = item.description[lang] || item.description.en;
            const linkText = item.linkText[lang] || item.linkText.en;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#E2E8E2] dark:border-slate-800 bg-[#F8FAF7] dark:bg-slate-900/60 p-7 flex flex-col justify-between hover:border-emerald-600/40 transition duration-200 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#14532D] dark:text-emerald-300">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#647067] dark:text-slate-400">
                      {tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#17231B] dark:text-white mb-2.5">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#647067] dark:text-slate-400 leading-relaxed mb-6">
                    {description}
                  </p>
                </div>

                <Link
                  href={item.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14532D] dark:text-emerald-400 hover:text-[#16845B] transition pt-4 border-t border-[#E2E8E2]/80 dark:border-slate-800"
                >
                  <span>{linkText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
