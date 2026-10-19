'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const HOW_I18N: Record<string, Record<string, string>> = {
  tag: {
    en: 'SIMPLE 3-STEP WORKFLOW',
    hi: 'सरल 3 चरणों में काम',
    kn: 'ಸರಳ 3 ಹಂತಗಳ ಕಾರ್ಯವಿಧಾನ',
    mr: 'सोप्या ३ पायऱ्यांची कार्यपद्धती',
    te: 'సులభమైన 3 దశల ప్రక్రియ',
    ta: 'எளிய 3 படி செயல்முறை',
    gu: 'સરળ 3 તબક્કાની પ્રક્રિયા',
    bn: 'সহজ ৩টি ধাপের কার্যপ্রণালী',
    pa: 'ਸਧਾਰਨ 3 ਪੜਾਵਾਂ ਦੀ ਕਾਰਜਪ੍ਰਣਾਲੀ',
    ml: 'ലളിതമായ 3 ഘട്ട പ്രക്രിയ',
    hi_en: 'Simple 3-Step Workflow',
  },
  title: {
    en: 'How KisaanBuddy Works.',
    hi: 'KisaanBuddy कैसे काम करता है।',
    kn: 'KisaanBuddy ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
    mr: 'KisaanBuddy कसे कार्य करते.',
    te: 'KisaanBuddy ఎలా పనిచేస్తుంది.',
    ta: 'KisaanBuddy எவ்வாறு செயல்படுகிறது.',
    gu: 'KisaanBuddy કેવી રીતે કાર્ય કરે છે.',
    bn: 'KisaanBuddy কীভাবে কাজ করে।',
    pa: 'KisaanBuddy ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ।',
    ml: 'KisaanBuddy എങ്ങനെ പ്രവർത്തിക്കുന്നു.',
    hi_en: 'KisaanBuddy Kaise Kaam Karta Hai.',
  },
  desc: {
    en: 'A transparent, reliable pathway from setting up your digital plot to taking profitable decisions on harvest day.',
    hi: 'बिना किसी जटिलता के, आपके मोबाइल फोन पर उपलब्ध 3 आसान चरण जो आपकी खेती के हर फैसले को मजबूत बनाते हैं।',
    kn: 'ಯಾವುದೇ ಗೊಂದಲವಿಲ್ಲದೆ, ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರುವ 3 ಸುಲಭ ಹಂತಗಳು ನಿಮ್ಮ ಕೃಷಿ ನಿರ್ಧಾರಗಳನ್ನು ಬಲಪಡಿಸುತ್ತವೆ.',
    mr: 'कोणत्याही अडचणींशिवाय तुमच्या मोबाईलवर उपलब्ध ३ सोप्या पायऱ्या ज्या शेतीचा प्रत्येक निर्णय मजबूत करतात.',
    te: 'ఎలాంటి సంక్లిష్టత లేకుండా, మీ మొబైల్ ఫోన్‌లో 3 సాధారణ దశలతో వ్యవసాయ నిర్ణయాలను బలోపేతం చేసుకోండి.',
    ta: 'எந்தவித சிக்கலும் இல்லாமல், உங்கள் மொபைலில் உள்ள 3 எளிய படிகள் உங்கள் விவசாய முடிவுகளை வலுப்படுத்துகின்றன.',
    gu: 'કોઈપણ મુશ્કેલી વગર, તમારા મોબાઈલ પર 3 સરળ પગલાં જે ખેતીના દરેક નિર્ણયને મજબૂત બનાવે છે.',
    bn: 'কোনও জটিলতা ছাড়াই আপনার মোবাইলে ৩টি সহজ ধাপ আপনার কৃষিকাজের প্রতিটি সিদ্ধান্তকে শক্তিশালী করে।',
    pa: 'ਬਿਨਾਂ ਕਿਸੇ ਝੰਜਟ ਦੇ ਤੁਹਾਡੇ ਮੋਬਾਈਲ ਤੇ 3 ਆਸਾਨ ਪੜਾਅ ਜੋ ਖੇਤੀ ਦੇ ਹਰ ਫੈਸਲੇ ਨੂੰ ਮਜ਼ਬੂਤ ਬਣਾਉਂਦੇ ਹਨ।',
    ml: 'സങ്കീർണ്ണതകളില്ലാതെ, നിങ്ങളുടെ മൊബൈലിൽ ലഭ്യമായ 3 ലളിതമായ ഘട്ടങ്ങളിലൂടെ കൃഷി കൂടുതൽ ലാഭകരമാക്കുക.',
    hi_en: 'Bina kisi jhanjhat ke aapke mobile par 3 aasan steps jo har decision ko strong banayein.',
  },
  cta_start: {
    en: 'Get Started For Free',
    hi: 'निःशुल्क शुरुआत करें',
    kn: 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ',
    mr: 'मोफत सुरुवात करा',
    te: 'ఉచితంగా ప్రారంభించండి',
    ta: 'இலவசமாக தொடங்குங்கள்',
    gu: 'મફતમાં શરૂઆત કરો',
    bn: 'বিনামূল্যে শুরু করুন',
    pa: 'ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ',
    ml: 'സൗജന്യമായി ആരംഭിക്കുക',
    hi_en: 'Free Me Shuru Karein',
  },
};

const STEPS_DATA = [
  {
    step: '01',
    title: {
      en: 'Set Up Your Farm Profile', hi: 'अपना खेत प्रोफाइल दर्ज करें', kn: 'ನಿಮ್ಮ ಜಮೀನಿನ ಪ್ರೊಫೈಲ್ ದಾಖಲಿಸಿ',
      mr: 'तुमचे शेत प्रोफाइल नोंदवा', te: 'మీ పొలం ప్రొఫైల్‌ను నమోదు చేయండి', ta: 'உங்கள் பண்ணை சுயவிவரத்தை அமைக்கவும்',
      gu: 'તમારું ખેતર પ્રોફાઇલ નોંધો', bn: 'আপনার খামার প্রোফাইল নিবন্ধন করুন', pa: 'ਆਪਣਾ ਖੇਤ ਪ੍ਰੋਫਾਈਲ ਦਰਜ ਕਰੋ', ml: 'നിങ്ങളുടെ ഫാം പ്രൊഫൈൽ നൽകുക', hi_en: 'Apna Khet Profile Register Karein',
    },
    subtitle: {
      en: 'Land, Soil & Crop Identity', hi: 'भूमि, मिट्टी व फसल की जानकारी', kn: 'ಭೂಮಿ, ಮಣ್ಣು ಮತ್ತು ಬೆಳೆ ಗುರುತು',
      mr: 'जमीन, माती व पीक ओळख', te: 'భూమి, నేల & పంట వివరాలు', ta: 'நிலம், மண் & பயிர் விவரம்',
      gu: 'જમીન, માટી અને પાકની માહિતી', bn: 'জমি, মাটি ও ফসলের তথ্য', pa: 'ਜ਼ਮੀਨ, ਮਿੱਟੀ ਅਤੇ ਫਸਲ ਦੀ ਜਾਣਕਾਰੀ', ml: 'ഭൂമി, മണ്ണ്, വിള വിവരങ്ങൾ', hi_en: 'Zameen, Mitti & Fasal Identity',
    },
    desc: {
      en: 'Enter your plot sizes, soil characteristics, irrigation sources, and current crop varieties. Takes under two minutes on mobile.',
      hi: 'अपने खेतों का रकबा, मिट्टी का प्रकार (काली, दोमट, बलुई), उपलब्ध सिंचाई और बोई गई फसल की किस्म जोड़ें। सिर्फ 2 मिनट का समय लगता है।',
      kn: 'ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ, ಮಣ್ಣಿನ ಗುಣಲಕ್ಷಣಗಳು (ಕಪ್ಪು, ಕೆಂಪು, ಗೋಡು), ನೀರಾವರಿ ಮೂಲಗಳು ಮತ್ತು ಪ್ರಸ್ತುತ ಬೆಳೆ ತಳಿಗಳನ್ನು ನಮೂದಿಸಿ. ಮೊಬೈಲ್‌ನಲ್ಲಿ ಕೇವಲ 2 ನಿಮಿಷ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.',
      mr: 'तुमच्या शेताचे क्षेत्रफळ, मातीचा प्रकार (काळी, गाळाची), उपलब्ध सिंचन आणि पेरणी केलेल्या पिकाची जात जोडा. मोबाईलवर फक्त २ मिनिटे लागतात.',
      te: 'మీ పొలం విస్తీర్ణం, నేల రకం (నల్లరేగడి, ఎర్రనేల), నీటిపారుదల వనరులు మరియు విత్తిన పంట రకాన్ని నమోదు చేయండి. కేవలం 2 నిమిషాలు పడుతుంది.',
      ta: 'நிலப் பரப்பளவு, மண் வகை (கரிசல், வண்டல்), பாசன ஆதாரங்கள் மற்றும் பயிர் வகைகளைப் பதிவு செய்யுங்கள். மொபைலில் 2 நிமிடங்கள் மட்டுமே ஆகும்.',
      gu: 'તમારા ખેતરનો વિસ્તાર, જમીનનો પ્રકાર (કાળી, ગોરાડુ), સિંચાઈ સ્ત્રોતો અને વાવેલા પાકની જાત ઉમેરો. માત્ર 2 મિનિટ લાગે છે.',
      bn: 'জমির পরিমাণ, মাটির ধরন (কালো, দোআঁশ), সেচ ব্যবস্থা এবং বর্তমান ফসলের জাত যোগ করুন। মোবাইলে মাত্র ২ মিনিট সময় লাগে।',
      pa: 'ਆਪਣੇ ਖੇਤ ਦਾ ਰਕਬਾ, ਮਿੱਟੀ ਦੀ ਕਿਸਮ, ਸਿੰਚਾਈ ਦੇ ਸਾਧਨ ਅਤੇ ਬੀਜੀ ਗਈ ਫਸਲ ਦੀ ਕਿਸਮ ਦਰਜ ਕਰੋ। ਸਿਰਫ਼ 2 ਮਿੰਟ ਲੱਗਦੇ ਹਨ।',
      ml: 'ഭൂമിയുടെ വിസ്തീർണ്ണം, മണ്ണിന്റെ തരം, ജലസേചന ഉറവിടങ്ങൾ, നിലവിലെ വിള ഇനങ്ങൾ എന്നിവ രേഖപ്പെടുത്തുക. മൊബൈലിൽ 2 മിനിറ്റ് മതി.',
      hi_en: 'Khet ka acreage, mitti ka type, sinchai source aur crop variety add karein. Sirf 2 minute lagte hain.',
    },
    points: [
      {
        en: 'Plot-wise acreage and land tenure', hi: 'प्लॉट-वार रकबा और स्वामित्व', kn: 'ಪ್ಲಾಟ್‌ವಾರು ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಮಾಲೀಕತ್ವ',
        mr: 'प्लॉटनुसार क्षेत्रफळ आणि मालकी', te: 'ప్లాట్ వారీగా విస్తీర్ణం మరియు యాజమాన్యం', ta: 'நிலப் பரப்பளவு மற்றும் உரிமை விவரம்',
        gu: 'પ્લોટ મુજબ વિસ્તાર અને માલિકી', bn: 'প্লট অনুযায়ী আয়তন এবং মালিকানা', pa: 'ਪਲਾਟ ਅਨੁਸਾਰ ਰਕਬਾ ਅਤੇ ਮਾਲਕੀ', ml: 'പ്ലോട്ട് തിരിച്ചുള്ള വിസ്തീർണ്ണവും ഉടമസ്ഥതയും', hi_en: 'Plot-wise acreage aur ownership',
      },
      {
        en: 'Soil test metrics or estimated texture', hi: 'मृदा स्वास्थ्य कार्ड या अनुमानित pH', kn: 'ಮಣ್ಣಿನ ಪರೀಕ್ಷಾ ವರದಿ ಅಥವಾ ಅಂದಾಜು pH',
        mr: 'माती परीक्षण अहवाल किंवा अंदाजे pH', te: 'నేల పరీక్ష నివేదిక లేదా అంచనా pH', ta: 'மண் பரிசோதனை அறிக்கை அல்லது pH',
        gu: 'જમીન ચકાસણી રિપોર્ટ અથવા અંદાજિત pH', bn: 'মৃত্তিকা পরীক্ষার রিপোর্ট বা আনুমানিক pH', pa: 'ਮਿੱਟੀ ਟੈਸਟ ਰਿਪੋਰਟ ਜਾਂ ਅੰਦਾਜ਼ਨ pH', ml: 'മണ്ണ് പരിശോധനാ റിപ്പോർട്ട് അല്ലെങ്കിൽ pH', hi_en: 'Soil Health Card ya estimated pH',
      },
      {
        en: 'Sowing date and active growth stage', hi: 'बुवाई की तारीख और वर्तमान चरण', kn: 'ಬಿತ್ತನೆ ದಿನಾಂಕ ಮತ್ತು ಪ್ರಸ್ತುತ ಬೆಳವಣಿಗೆ ಹಂತ',
        mr: 'पेरणीची तारीख आणि सद्य वाढीचा टप्पा', te: 'విత్తిన తేదీ మరియు ప్రస్తుత పెరుగుదల దశ', ta: 'விதைத்த தேதி மற்றும் தற்போதைய வளர்ச்சி நிலை',
        gu: 'વાવણીની તારીખ અને વર્તમાન વિકાસ તબક્કો', bn: 'বপনের তারিখ এবং বর্তমান বৃদ্ধির পর্যায়', pa: 'ਬਿਜਾਈ ਦੀ ਮਿਤੀ ਅਤੇ ਮੌਜੂਦਾ ਵਿਕਾਸ ਪੜਾਅ', ml: 'വിത്ത് വിതച്ച തീയതിയും നിലവിലെ വളർച്ചയും', hi_en: 'Buwai ki date aur growth stage',
      },
    ],
    indicator: {
      en: 'Step 1: Free 2-minute registration', hi: 'चरण 1: 2 मिनट में सेटअप', kn: 'ಹಂತ 1: 2 ನಿಮಿಷಗಳಲ್ಲಿ ಉಚಿತ ನೋಂದಣಿ',
      mr: 'पायरी १: २ मिनिटांत मोफत नोंदणी', te: 'దశ 1: 2 నిమిషాల్లో ఉచిత నమోదు', ta: 'படி 1: 2 நிமிடங்களில் இலவச பதிவு',
      gu: 'તબક્કો 1: 2 મિનિટમાં મફત નોંધણી', bn: 'ধাপ ১: ২ মিনিটে বিনামূল্যে নিবন্ধন', pa: 'ਪੜਾਅ 1: 2 ਮਿੰਟਾਂ ਵਿੱਚ ਮੁਫ਼ਤ ਰਜਿਸਟ੍ਰੇਸ਼ਨ', ml: 'ഘട്ടം 1: 2 മിനിറ്റിൽ സൗജന്യ രജിസ്ട്രേഷൻ', hi_en: 'Step 1: 2 Minute me Free Registration',
    },
  },
  {
    step: '02',
    title: {
      en: 'Get Context-Aware Guidance', hi: 'खेत-विशिष्ट AI सलाह पाएं', kn: 'ಜಮೀನು-ನಿರ್ದಿಷ್ಟ AI ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ',
      mr: 'शेतानुसार सानुकूल AI सल्ला मिळवा', te: 'పొలానికి అనుగుణంగా AI సలహా పొందండి', ta: 'நிலத்திற்கேற்ற AI வழிகாட்டுதல் பெறுங்கள்',
      gu: 'ખેતર મુજબ સચોટ AI સલાહ મેળવો', bn: 'খামার-নির্দিষ্ট AI পরামর্শ পান', pa: 'ਖੇਤ-ਵਿਸ਼ੇਸ਼ AI ਸਲਾਹ ਪ੍ਰਾਪਤ ਕਰੋ', ml: 'ഫാം-അധിഷ്ഠിത AI മാർഗ്ഗനിർദ്ദേശം നേടുക', hi_en: 'Khet-Specific AI Guidance Payein',
    },
    subtitle: {
      en: 'Weather, Nutrients & Crop Doctor', hi: 'मौसम, खाद व रोग का सटीक तालमेल', kn: 'ಹವಾಮಾನ, ಪೋಷಕಾಂಶ ಮತ್ತು ಬೆಳೆ ರಕ್ಷಣೆ',
      mr: 'हवामान, खते व पीक डॉक्टर', te: 'వాతావరణం, ఎరువులు & పంట డాక్టర్', ta: 'வானிலை, உரங்கள் & பயிர் மருத்துவர்',
      gu: 'હવામાન, ખાતર અને પાક ડોક્ટર', bn: 'আবহাওয়া, সার ও ফসল ডাক্তার', pa: 'ਮੌਸਮ, ਖਾਦ ਅਤੇ ਫਸਲ ਡਾਕਟਰ', ml: 'കാലാവസ്ഥ, വളം & വിള ഡോക്ടർ', hi_en: 'Mausam, Khad & Crop Doctor',
    },
    desc: {
      en: 'The platform correlates your farm parameters with live satellite weather, nutrient deficit models, and ICAR-backed agronomic guidelines.',
      hi: 'हमारा AI आपके खेत के डेटा को मौसम पूर्वानुमान, मिट्टी की जरूरत और ICAR कृषि पद्धतियों से जोड़कर सटीक सिफारिशें तैयार करता है।',
      kn: 'ನಮ್ಮ ವೇದಿಕೆಯು ನಿಮ್ಮ ಜಮೀನಿನ ಮಾಹಿತಿಯನ್ನು ಉಪಗ್ರಹ ಹವಾಮಾನ, ಪೋಷಕಾಂಶ ಕೊರತೆ ಮಾದರಿಗಳು ಮತ್ತು ICAR ಕೃಷಿ ಮಾರ್ಗಸೂಚಿಗಳೊಂದಿಗೆ ಜೋಡಿಸಿ ನಿಖರ ಶಿಫಾರಸುಗಳನ್ನು ನೀಡುತ್ತದೆ.',
      mr: 'आमची प्रणाली तुमच्या शेताच्या माहितीला थेट उपग्रह हवामान, पोषण कमतरता निकष व ICAR मार्गदर्शक तत्त्वांशी जोडून अचूक सल्ला देते.',
      te: 'మా ప్లాట్‌ఫారమ్ మీ పొలం డేటాను ప్రత్యక్ష ఉపగ్రహ వాతావరణం, నేల పోషకాల అవసరాలు మరియు ICAR మార్గదర్శకాలతో అనుసంధానిస్తుంది.',
      ta: 'செயற்கைக்கோள் வானிலை, மண் ஊட்டச்சத்து குறைபாடுகள் மற்றும் ICAR வழிகாட்டுதல்களை இணைத்து துல்லியமான பரிந்துரைகளை வழங்குகிறது.',
      gu: 'અમારી સિસ્ટમ ખેતરના ડેટાને ઉપગ્રહ હવામાન, જમીન પોષક તત્ત્વો અને ICAR માર્ગદર્શિકા સાથે જોડીને ચોક્કસ ભલામણો આપે છે.',
      bn: 'আমাদের প্ল্যাটফর্ম উপগ্রহ আবহাওয়া, মাটির পুষ্টি ঘাটতি এবং ICAR নির্দেশিকা মিলিয়ে সঠিক পরামর্শ প্রদান করে।',
      pa: 'ਸਾਡਾ ਪਲੇਟਫਾਰਮ ਉਪਗ੍ਰਹਿ ਮੌਸਮ, ਮਿੱਟੀ ਦੇ ਪੌਸ਼ਟਿਕ ਤੱਤਾਂ ਅਤੇ ICAR ਮਾਪਦੰਡਾਂ ਦੇ ਆਧਾਰ ਤੇ ਸਹੀ ਸਲਾਹ ਦਿੰਦਾ ਹੈ।',
      ml: 'ഉപഗ്രഹ കാലാവസ്ഥ, മണ്ണിലെ പോഷകക്കുറവ്, ICAR കാർഷിക മാർഗ്ഗനിർദ്ദേശങ്ങൾ എന്നിവ അടിസ്ഥാനമാക്കി കൃത്യമായ ശുപാർശകൾ നൽകുന്നു.',
      hi_en: 'Platform aapke khet data ko satellite weather, nutrient models aur ICAR guidelines ke sath combine karta hai.',
    },
    points: [
      {
        en: 'Instant visual disease identification', hi: 'पत्ती की फोटो से तुरंत रोग पहचान', kn: 'ಎಲೆಯ ಫೋಟೋ ಮೂಲಕ ತಕ್ಷಣದ ರೋಗ ಪತ್ತೆ',
        mr: 'पानाच्या फोटोद्वारे त्वरित रोग निदान', te: 'ఆకు ఫోటో ద్వారా తక్షణ తెగులు గుర్తింపు', ta: 'இலை புகைப்படத்தின் மூலம் உடனடி நோய் கண்டறிதல்',
        gu: 'પાંદડાના ફોટાથી તરત રોગ ઓળખ', bn: 'পাতার ছবি থেকে তাৎক্ষণিক রোগ নির্ণয়', pa: 'ਪੱਤੇ ਦੀ ਫੋਟੋ ਤੋਂ ਤੁਰੰਤ ਬਿਮਾਰੀ ਜਾਂਚ', ml: 'ഇലയുടെ ഫോട്ടോയിലൂടെ തത്സമയ രോഗനിർണയം', hi_en: 'Leaf photo se instant disease identification',
      },
      {
        en: 'Safe spraying & irrigation windows', hi: 'छिड़काव और सिंचाई के लिए सुरक्षित खिड़की', kn: 'ಸಿಂಪರಣೆ ಮತ್ತು ನೀರಾವರಿಗೆ ಸುರಕ್ಷಿತ ಅವಧಿ',
        mr: 'फवारणी व पाणी देण्यासाठी सुरक्षित वेळ', te: 'పిచికారీ మరియు నీటిపారుదల కోసం సరైన సమయం', ta: 'தெளிப்பு மற்றும் பாசனத்திற்கான பாதுகாப்பான நேரம்',
        gu: 'છંટકાવ અને સિંચાઈ માટે અનુકૂળ સમય', bn: 'স্প্রে ও সেচের জন্য নিরাপদ সময়', pa: 'ਸਪਰੇਅ ਅਤੇ ਸਿੰਚਾਈ ਲਈ ਸੁਰੱਖਿਅਤ ਸਮਾਂ', ml: 'മരുന്ന് തളിക്കാനും നനയ്ക്കാനുമുള്ള സുരക്ഷിത സമയം', hi_en: 'Spraying aur sinchai ke safe windows',
      },
      {
        en: 'Stage-specific NPK fertilizer dosage', hi: 'यूरिया और डीएपी की संतुलित खुराक', kn: 'ಬೆಳೆಯ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ NPK ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ',
        mr: 'वाढीच्या टप्प्यानुसार NPK खतांचे अचूक प्रमाण', te: 'దశల వారీగా NPK ఎరువుల మోతాదు', ta: 'வளர்ச்சி நிலைக்கு ஏற்ப NPK உர அளவு',
        gu: 'વિકાસ તબક્કા મુજબ NPK ખાતરનું સંતુલિત પ્રમાણ', bn: 'পর্যায় অনুযায়ী NPK সারের ভারসাম্যপূর্ণ মাত্রা', pa: 'ਪੜਾਅ ਅਨੁਸਾਰ NPK ਖਾਦ ਦੀ ਸੰਤੁਲਿਤ ਖੁਰਾਕ', ml: 'ഘട്ടത്തിനനുസരിച്ചുള്ള NPK വളപ്രയോഗം', hi_en: 'Growth stage ke according NPK fertilizer dose',
      },
    ],
    indicator: {
      en: 'Step 2: Continuous agronomic sync', hi: 'चरण 2: 24/7 AI निगरानी', kn: 'ಹಂತ 2: 24/7 ನಿರಂತರ AI ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ',
      mr: 'पायरी २: २४/७ सातत्यपूर्ण AI शेती सल्ला', te: 'దశ 2: 24/7 నిరంతర AI వ్యవసాయ సలహా', ta: 'படி 2: 24/7 தொடர் AI விவசாய வழிகாட்டுதல்',
      gu: 'તબક્કો 2: 24/7 અવિરત AI માર્ગદર્શન', bn: 'ধাপ ২: ২৪/৭ অবিরাম AI কৃষি পরামর্শ', pa: 'ਪੜਾਅ 2: 24/7 ਨਿਰੰਤਰ AI ਖੇਤੀ ਸਲਾਹ', ml: 'ഘട്ടം 2: 24/7 തത്സമയ AI കാർഷിക പിന്തുണ', hi_en: 'Step 2: 24/7 Continuous AI Agronomy',
    },
  },
  {
    step: '03',
    title: {
      en: 'Execute & Maximize Value', hi: 'सही निर्णय लें और समय पर बेचें', kn: 'ಸರಿಯಾದ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ ಮತ್ತು ಮೌಲ್ಯ ಹೆಚ್ಚಿಸಿ',
      mr: 'योग्य अंमलबजावणी करा व नफा वाढवा', te: 'సరైన చర్యలు చేపట్టి లాభాలను పెంచుకోండి', ta: 'சரியான நடவடிக்கை எடுத்து லாபத்தை உயர்த்துங்கள்',
      gu: 'યોગ્ય પગલાં લો અને મહત્તમ નફો મેળવો', bn: 'সঠিক সিদ্ধান্ত নিন এবং সর্বোচ্চ লাভ পান', pa: 'ਸਹੀ ਕਦਮ ਚੁੱਕੋ ਅਤੇ ਵੱਧ ਮੁਨਾਫ਼ਾ ਕਮਾਓ', ml: 'ശരിയായ നടപടിയിലൂടെ വരുമാനം വർദ്ധിപ്പിക്കുക', hi_en: 'Execute Karein & Value Maximize Karein',
    },
    subtitle: {
      en: 'Field Actions & Mandi Realization', hi: 'कम लागत, बेहतर पैदावार और उचित मूल्य', kn: 'ಕಡಿಮೆ ವೆಚ್ಚ, ಉತ್ತಮ ಇಳುವರಿ ಮತ್ತು ಸೂಕ್ತ ಬೆಲೆ',
      mr: 'कमी खर्च, उत्तम उत्पादन आणि योग्य भाव', te: 'తక్కువ ఖర్చు, అధిక దిగుబడి & సరైన ధర', ta: 'குறைந்த செலவு, சிறந்த விளைச்சல் & உகந்த விலை',
      gu: 'ઓછો ખર્ચ, વધુ ઉત્પાદન અને વ્યાજબી ભાવ', bn: 'কম খরচ, ভালো ফলন ও ন্যায্য মূল্য', pa: 'ਘੱਟ ਲਾਗਤ, ਬਿਹਤਰ ਝਾੜ ਅਤੇ ਸਹੀ ਭਾਅ', ml: 'കുറഞ്ഞ ചെലവ്, മികച്ച വിളവ്, ഉയർന്ന വില', hi_en: 'Kam Lagat, Behtar Yield & Sahi Bhav',
    },
    desc: {
      en: 'Take prompt field action to protect yields, control disease outbreaks early, and compare nearby mandi trends to sell profitably.',
      hi: 'खेत में समय पर सही कदम उठाएं, फसल का नुकसान बचाएं, और पास की मंडियों के भाव तुलना करके अपनी फसल का अधिकतम मूल्य पाएं।',
      kn: 'ಇಳುವರಿಯನ್ನು ರಕ್ಷಿಸಲು ತಕ್ಷಣ ಜಮೀನಿನಲ್ಲಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ, ರೋಗಗಳನ್ನು ಆರಂಭದಲ್ಲೇ ನಿಯಂತ್ರಿಸಿ ಮತ್ತು ಲಾಭದಾಯಕವಾಗಿ ಮಾರಾಟ ಮಾಡಲು ಹತ್ತಿರದ ಮಂಡಿ ದರಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ.',
      mr: 'उत्पादनाचे रक्षण करण्यासाठी शेतात त्वरित पावले उचला, रोगांचा प्रादुर्भाव सुरुवातीसच थांबवा आणि फायदेशीर विक्रीसाठी बाजारभाव तपासा.',
      te: 'దిగుబడిని రక్షించడానికి సకాలంలో చర్యలు తీసుకోండి, తెగుళ్లను ముందుగానే నివారించండి మరియు సమీప మార్కెట్ ధరలను పోల్చి లాభదాయకంగా విక్రయించండి.',
      ta: 'விளைச்சலைப் பாதுகாக்க உடனடி நடவடிக்கை எடுங்கள், பயிர் நோய்களை ஆரம்பத்திலேயே கட்டுப்படுத்துங்கள் மற்றும் சிறந்த விலையில் விற்க அருகிலுள்ள மண்டிகளை ஒப்பிடுங்கள்.',
      gu: 'ઉત્પાદન બચાવવા માટે ખેતરમાં સમયસર પગલાં ભરો, રોગોને શરૂઆતમાં જ નિયંત્રિત કરો અને નજીકની મંડીઓના ભાવ સરખાવી નફો વધારો.',
      bn: 'ফলন রক্ষা করতে সঠিক সময়ে ব্যবস্থা নিন, রোগবালাই শুরুতেই দমন করুন এবং নিকটস্থ মান্ডির দর তুলনা করে লাভজনকভাবে বিক্রি করুন।',
      pa: 'ਝਾੜ ਨੂੰ ਬਚਾਉਣ ਲਈ ਸਮੇਂ ਸਿਰ ਕਦਮ ਚੁੱਕੋ, ਬਿਮਾਰੀਆਂ ਨੂੰ ਸ਼ੁਰੂ ਵਿੱਚ ਹੀ ਕੰਟਰੋਲ ਕਰੋ ਅਤੇ ਮੁਨਾਫ਼ੇ ਨਾਲ ਵੇਚਣ ਲਈ ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ ਦੇ ਭਾਅ ਮਿਲਾਓ।',
      ml: 'വിളവ് സംരക്ഷിക്കാൻ കൃത്യസമയത്ത് നടപടിയെടുക്കുക, രോഗങ്ങളെ തുടക്കത്തിലേ നിയന്ത്രിക്കുക, മികച്ച വിലയ്ക്കായി സമീപ വിപണികൾ താരതമ്യം ചെയ്യുക.',
      hi_en: 'Yield protect karne ke liye field actions lein, disease control karein aur nearby mandi rates compare karke bechein.',
    },
    points: [
      {
        en: 'Track input costs in Khet Diary', hi: 'खेत डायरी में खाद-दवा का खर्च दर्ज', kn: 'ಖೇತ್ ಡೈರಿಯಲ್ಲಿ ಒಳಹರಿವಿನ ವೆಚ್ಚಗಳ ನಿರ್ವಹಣೆ',
        mr: 'शेत डायरीत खते व औषधांचा खर्च नोंदवा', te: 'ఖేత్ డైరీలో పెట్టుబడి ఖర్చులను నమోదు చేయండి', ta: 'பண்ணை நாட்குறிப்பில் செலவுகளைப் பதிவு செய்யுங்கள்',
        gu: 'ખેતર ડાયરીમાં ખાતર-દવાનો ખર્ચ નોંધો', bn: 'ক্ষেত ডায়েরিতে সার-ওষুধের খরচ লিখুন', pa: 'ਖੇਤ ਡਾਇਰੀ ਵਿੱਚ ਖਾਦ ਤੇ ਦਵਾਈਆਂ ਦਾ ਖਰਚਾ ਲਿਖੋ', ml: 'ഫാം ഡയറിയിൽ ചെലവുകൾ രേഖപ്പെടുത്തുക', hi_en: 'Khet Diary me kharch note karein',
      },
      {
        en: 'Compare 1,000+ APMC & eNAM rates', hi: '1,000+ मंडियों के ताज़ा भाव तुलना', kn: '1,000+ APMC & eNAM ಮಂಡಿ ದರಗಳ ಹೋಲಿಕೆ',
        mr: '१,०००+ एपीएमसी व ई-नाम मंड्यांचे भाव तपासा', te: '1,000+ మార్కెట్ల ప్రత్యక్ష ధరలను పోల్చండి', ta: '1,000+ வேளாண் ஒழுங்குமுறை விற்பனைக் கூடங்களின் விலை ஒப்பீடு',
        gu: '1,000+ એપીએમસી અને ઈ-નામ મંડીના ભાવ સરખાવો', bn: '১,০০০+ এপিএমসি ও ই-নাম মান্ডি দর তুলনা', pa: '1,000+ ਏਪੀਐਮਸੀ ਅਤੇ ਈ-ਨਾਮ ਮੰਡੀ ਦੇ ਰੇਟ ਮਿਲਾਓ', ml: '1,000+ മണ്ടി നിരക്കുകൾ താരതമ്യം ചെയ്യുക', hi_en: '1,000+ APMC & eNAM rates compare karein',
      },
      {
        en: 'Connect directly with buyers on marketplace', hi: 'मार्केटप्लेस में सीधे खरीदारों से जुड़ें', kn: 'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನೇರವಾಗಿ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕ',
        mr: 'मार्केटप्लेसवर खरेदीदारांशी थेट संपर्क साधा', te: 'మార్కెట్‌ప్లేస్‌లో కొనుగోలుదారులతో నేరుగా కనెక్ట్ అవ్వండి', ta: 'சந்தையில் வாங்குபவர்களுடன் நேரடியாக இணையுங்கள்',
        gu: 'માર્કેટપ્લેસ પર ખરીદદારો સાથે સીધા સંપર્ક કરો', bn: 'মার্কেটপ্লেসে ক্রেতাদের সাথে সরাসরি যুক্ত হন', pa: 'ਮਾਰਕੀਟਪਲੇਸ ਤੇ ਖਰੀਦਦਾਰਾਂ ਨਾਲ ਸਿੱਧਾ ਜੁੜੋ', ml: 'വിപണിയിൽ വാങ്ങുന്നവരുമായി നേരിട്ട് ബന്ധപ്പെടുക', hi_en: 'Marketplace me seedhe buyers se connect karein',
      },
    ],
    indicator: {
      en: 'Step 3: Measurable harvest value', hi: 'चरण 3: वास्तविक मुनाफा', kn: 'ಹಂತ 3: ಅಳೆಯಬಹುದಾದ ಕಟಾವು ಮೌಲ್ಯ ಮತ್ತು ಲಾಭ',
      mr: 'पायरी ३: प्रत्यक्ष नफा आणि वाढीव मूल्य', te: 'దశ 3: కొలవదగిన దిగుబడి విలువ & లాభం', ta: 'படி 3: அளவிடக்கூடிய அறுவடை மதிப்பு & லாபம்',
      gu: 'તબક્કો 3: વાસ્તવિક નફો અને વધારાનું મૂલ્ય', bn: 'ধাপ ৩: পরিমাপযোগ্য ফলন মূল্য ও লাভ', pa: 'ਪੜਾਅ 3: ਅਸਲ ਮੁਨਾਫ਼ਾ ਅਤੇ ਵੱਧ ਕਮਾਈ', ml: 'ഘട്ടം 3: ഉയർന്ന വിളവെടുപ്പ് വരുമാനം', hi_en: 'Step 3: Measurable Harvest Value & Profit',
    },
  },
];

export function HowItWorks() {
  const { lang } = useLanguage();
  const txt = (key: string): string => HOW_I18N[key]?.[lang] || HOW_I18N[key]?.en || '';

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-card relative border-b border-border/60 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{txt('tag')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {txt('title')}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {txt('desc')}
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
          {STEPS_DATA.map((s, idx) => {
            const title = s.title[lang] || s.title.en;
            const subtitle = s.subtitle[lang] || s.subtitle.en;
            const desc = s.desc[lang] || s.desc.en;
            const indicator = s.indicator[lang] || s.indicator.en;

            return (
              <div
                key={s.step}
                className="relative rounded-2xl border border-border/80 bg-background p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  {/* Step Pill & Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-white font-mono font-bold text-base shadow-md shadow-emerald-950/20">
                      {s.step}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {subtitle}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-display text-foreground mb-3 leading-snug">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                    {desc}
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2.5 pt-4 border-t border-border/50 mb-6">
                    {s.points.map((pt, pIdx) => {
                      const text = pt[lang] || pt.en;
                      return (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs text-foreground/80">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="font-medium leading-tight">{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Micro Indicator */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    {indicator}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to start */}
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all active:scale-[0.98]"
          >
            <span>{txt('cta_start')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
