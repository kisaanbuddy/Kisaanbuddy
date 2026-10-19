'use client';

import Link from 'next/link';
import { ArrowRight, Bug, CloudSun, Landmark, ScanLine, ShoppingBasket, Sparkles, Sprout, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language';

type JourneyStep = {
  number: string;
  title: string;
  body: string;
};

type JourneyContent = {
  eyebrow: string;
  title: string;
  desc: string;
  bannerTitle: string;
  bannerSub: string;
  ctaText: string;
  steps: [JourneyStep, JourneyStep, JourneyStep, JourneyStep];
  tools: [string, string, string, string];
};

const JOURNEY_I18N: Record<string, JourneyContent> = {
  en: {
    eyebrow: 'A decision system for your farm',
    title: 'Not just information. A clear way forward.',
    desc: 'KisaanBuddy connects every signal to a useful step for your farm—so you can spend less time guessing and more time preparing.',
    bannerTitle: 'Practical, In-Field Agronomic Support',
    bannerSub: 'Tailored to your specific soil, crop stage, and local weather',
    ctaText: 'Open my farm dashboard',
    steps: [
      { number: '01', title: 'Farm data', body: 'Your crops, location and farm conditions' },
      { number: '02', title: 'AI insight', body: 'Weather, crop health and market context together' },
      { number: '03', title: 'Clear recommendation', body: 'What to do, when to do it and what to watch' },
      { number: '04', title: 'Better outcomes', body: 'Lower risk, better preparation and smarter selling' },
    ],
    tools: [
      'Check crop health',
      'Plan for weather',
      'Compare mandi prices',
      'Find useful schemes'
    ]
  },
  hi: {
    eyebrow: 'खेती के लिए निर्णय प्रणाली',
    title: 'सिर्फ जानकारी नहीं। आगे क्या करना है, वह भी।',
    desc: 'KisaanBuddy हर सिग्नल को आपके खेत के लिए एक उपयोगी कदम से जोड़ता है—ताकि आप कम अनुमान लगाएं और बेहतर तैयारी करें।',
    bannerTitle: 'खेत में सीधे काम आने वाली सलाह',
    bannerSub: 'हर सलाह आपके खेत और मौसम पर आधारित है',
    ctaText: 'मेरा फार्म डैशबोर्ड खोलें',
    steps: [
      { number: '01', title: 'खेत की जानकारी', body: 'आपकी फसल, जगह और खेती की स्थिति' },
      { number: '02', title: 'AI की समझ', body: 'मौसम, सेहत और बाजार को एक साथ समझें' },
      { number: '03', title: 'स्पष्ट सलाह', body: 'क्या करें, कब करें और किस बात पर नजर रखें' },
      { number: '04', title: 'बेहतर परिणाम', body: 'कम जोखिम, बेहतर तैयारी और स्मार्ट बिक्री' },
    ],
    tools: [
      'फसल की जांच',
      'मौसम के अनुसार योजना',
      'मंडी भाव देखें',
      'काम की योजनाएं खोजें'
    ]
  },
  kn: {
    eyebrow: 'ಕೃಷಿಗಾಗಿ ನಿರ್ಧಾರ ವ್ಯವಸ್ಥೆ',
    title: 'ಕೇವಲ ಮಾಹಿತಿಯಲ್ಲ. ಸ್ಪಷ್ಟ ಮುನ್ನಡೆಯ ಮಾರ್ಗ.',
    desc: 'KisaanBuddy ಪ್ರತಿ ಮುನ್ಸೂಚನೆಯನ್ನು ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತವಾದ ಮುಂದಿನ ಕ್ರಮಕ್ಕೆ ಜೋಡಿಸುತ್ತದೆ — ಇದರಿಂದ ನೀವು ಊಹಿಸುವುದನ್ನು ಕಡಿಮೆ ಮಾಡಿ ಉತ್ತಮ ಸಿದ್ಧತೆ ಮಾಡಿಕೊಳ್ಳಬಹುದು.',
    bannerTitle: 'ಜಮೀನಿನಲ್ಲಿ ನೇರವಾಗಿ ಉಪಯುಕ್ತವಾಗುವ ಸಲಹೆ',
    bannerSub: 'ಪ್ರತಿ ಸಲಹೆಯು ನಿಮ್ಮ ಮಣ್ಣು, ಬೆಳೆ ಹಂತ ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನವನ್ನು ಆಧರಿಸಿದೆ',
    ctaText: 'ನನ್ನ ಫಾರ್ಮ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ',
    steps: [
      { number: '01', title: 'ಜಮೀನಿನ ಮಾಹಿತಿ', body: 'ನಿಮ್ಮ ಬೆಳೆಗಳು, ಸ್ಥಳ ಮತ್ತು ಕೃಷಿ ಪರಿಸ್ಥಿತಿ' },
      { number: '02', title: 'AI ಒಳನೋಟ', body: 'ಹವಾಮಾನ, ಬೆಳೆ ಆರೋಗ್ಯ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಸಂದರ್ಭ' },
      { number: '03', title: 'ಸ್ಪಷ್ಟ ಶಿಫಾರಸು', body: 'ಏನು ಮಾಡಬೇಕು, ಯಾವಾಗ ಮಾಡಬೇಕು ಮತ್ತು ಯಾವ ಬಗ್ಗೆ ನಿಗಾ ಇಡಬೇಕು' },
      { number: '04', title: 'ಉತ್ತಮ ಫಲಿತಾಂಶ', body: 'ಕಡಿಮೆ ಅಪಾಯ, ಉತ್ತಮ ಸಿದ್ಧತೆ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಮಾರಾಟ' },
    ],
    tools: [
      'ಬೆಳೆ ಆರೋಗ್ಯ ಪರಿಶೀಲಿಸಿ',
      'ಹವಾಮಾನಕ್ಕೆ ತಕ್ಕ ಯೋಜನೆ',
      'ಮಂಡಿ ದರಗಳನ್ನು ಹೋಲಿಸಿ',
      'ಉಪಯುಕ್ತ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ'
    ]
  },
  mr: {
    eyebrow: 'शेतीसाठी निर्णय प्रणाली',
    title: 'फक्त माहिती नाही. पुढे काय करायचे, तेही.',
    desc: 'KisaanBuddy प्रत्येक माहितीला तुमच्या शेतासाठी उपयुक्त कृतीशी जोडते - ज्यामुळे अंदाज लावणे कमी आणि अचूक तयारी जास्त होते.',
    bannerTitle: 'शेतात थेट उपयोगी पडणारा सल्ला',
    bannerSub: 'प्रत्येक सल्ला तुमच्या माती, पिकाचा टप्पा आणि स्थानिक हवामानावर आधारित',
    ctaText: 'माझे फार्म डॅशबोर्ड उघडा',
    steps: [
      { number: '01', title: 'शेताची माहिती', body: 'तुमची पिके, स्थान आणि शेतीची स्थिती' },
      { number: '02', title: 'AI अंतर्दृष्टी', body: 'हवामान, पीक आरोग्य आणि बाजार संदर्भ एकत्र' },
      { number: '03', title: 'स्पष्ट शिफारस', body: 'काय करावे, कधी करावे आणि कशावर लक्ष ठेवावे' },
      { number: '04', title: 'उत्तम परिणाम', body: 'कमी जोखीम, चांगली तयारी आणि स्मार्ट विक्री' },
    ],
    tools: [
      'पीक आरोग्य तपासा',
      'हवामानानुसार नियोजन करा',
      'बाजारभाव तपासा',
      'शासकीय योजना शोधा'
    ]
  },
  te: {
    eyebrow: 'వ్యవసాయానికి నిర్ణయ వ్యవస్థ',
    title: 'కేవలం సమాచారం మాత్రమే కాదు. స్పష్టమైన కార్యాచరణ మార్గం.',
    desc: 'KisaanBuddy ప్రతి సంకేతాన్ని మీ పొలానికి ఉపయోగపడే తదుపరి చర్యతో అనుసంధానిస్తుంది — తద్వారా మీరు అంచనాలు తగ్గించి మెరుగైన ఫలితాలు పొందవచ్చు.',
    bannerTitle: 'క్షేత్రస్థాయిలో నేరుగా ఉపయోగపడే సలహా',
    bannerSub: 'మీ నిర్దిష్ట నేల, పంట దశ మరియు స్థానిక వాతావరణానికి అనుగుణంగా రూపొందించబడింది',
    ctaText: 'నా ఫార్మ్ డ్యాష్‌బోర్డ్ తెరవండి',
    steps: [
      { number: '01', title: 'పొలం సమాచారం', body: 'మీ పంటలు, ప్రదేశం మరియు సాగు పరిస్థితులు' },
      { number: '02', title: 'AI అవగాహన', body: 'వాతావరణం, పంట ఆరోగ్యం మరియు మార్కెట్ సమాచారం ఒకేచోట' },
      { number: '03', title: 'స్పష్టమైన సిఫార్సు', body: 'ఏం చేయాలి, ఎప్పుడు చేయాలి మరియు దేనిపై నిఘా ఉంచాలి' },
      { number: '04', title: 'ఉత్తమ ఫలితాలు', body: 'తక్కువ నష్టభయం, మెరుగైన సన్నద్ధత మరియు తెలివైన అమ్మకం' },
    ],
    tools: [
      'పంట ఆరోగ్యం తనిఖీ చేయండి',
      'వాతావరణానికి తగిన ప్రణాళిక',
      'మార్కెట్ ధరలు పోల్చండి',
      'ప్రభుత్వ పథకాలను కనుగొనండి'
    ]
  },
  ta: {
    eyebrow: 'விவசாயத்திற்கான முடிவெடுக்கும் அமைப்பு',
    title: 'வெறும் தகவல் மட்டுமல்ல. தெளிவான முன்னேற்றப் பாதை.',
    desc: 'KisaanBuddy ஒவ்வொரு எச்சரிக்கையையும் உங்கள் பண்ணைக்கு பயனுள்ள அடுத்த கட்ட நடவடிக்கையுடன் இணைக்கிறது — யூகங்களைக் குறைத்து சிறப்பாக திட்டமிடுங்கள்.',
    bannerTitle: 'களத்தில் நேரடியாக பயன்படும் விவசாய ஆலோசனை',
    bannerSub: 'உங்கள் மண், பயிர் நிலை மற்றும் உள்ளூர் வானிலைக்கு ஏற்ப வடிவமைக்கப்பட்டது',
    ctaText: 'என் பண்ணை டாஷ்போர்டைத் திறக்கவும்',
    steps: [
      { number: '01', title: 'பண்ணைத் தகவல்', body: 'உங்கள் பயிர்கள், இருப்பிடம் மற்றும் நிலத்தின் நிலை' },
      { number: '02', title: 'AI நுண்ணறிவு', body: 'வானிலை, பயிர் ஆரோக்கியம் மற்றும் சந்தை சூழல் ஒன்றாக' },
      { number: '03', title: 'தெளிவான பரிந்துரை', body: 'என்ன செய்ய வேண்டும், எப்போது செய்ய வேண்டும், எதை கவனிக்க வேண்டும்' },
      { number: '04', title: 'சிறந்த விளைவுகள்', body: 'குறைந்த ஆபத்து, சிறந்த தயாரிப்பு மற்றும் புத்திசாலித்தனமான விற்பனை' },
    ],
    tools: [
      'பயிர் ஆரோக்கியத்தை சோதிக்கவும்',
      'வானிலைக்கேற்ப திட்டமிடவும்',
      'மண்டி விலைகளை ஒப்பிடவும்',
      'பயனுள்ள திட்டங்களைக் கண்டறியவும்'
    ]
  },
  gu: {
    eyebrow: 'ખેતી માટે નિર્ણય પ્રણાલી',
    title: 'માત્ર માહિતી નહીં. આગળનું સ્પષ્ટ પગલું પણ.',
    desc: 'KisaanBuddy દરેક સંકેતને તમારા ખેતર માટે ઉપયોગી પગલા સાથે જોડે છે — જેથી તમે અનુમાન લગાવ્યા વગર યોગ્ય તૈયારી કરી શકો.',
    bannerTitle: 'ખેતરમાં સીધી ઉપયોગી સલાહ',
    bannerSub: 'તમારી ચોક્કસ જમીન, પાકનો તબક્કો અને સ્થાનિક હવામાન પર આધારિત',
    ctaText: 'મારું ફાર્મ ડેશબોર્ડ ખોલો',
    steps: [
      { number: '01', title: 'ખેતરની માહિતી', body: 'તમારા પાક, સ્થળ અને ખેતીની સ્થિતિ' },
      { number: '02', title: 'AI સમજણ', body: 'હવામાન, પાક આરોગ્ય અને બજાર સંજોગો એક સાથે' },
      { number: '03', title: 'સ્પષ્ટ ભલામણ', body: 'શું કરવું, ક્યારે કરવું અને શેના પર નજર રાખવી' },
      { number: '04', title: 'શ્રેષ્ઠ પરિણામ', body: 'ઓછું જોખમ, ઉત્તમ તૈયારી અને સ્માર્ટ વેચાણ' },
    ],
    tools: [
      'પાક આરોગ્ય ચકાસો',
      'હવામાન મુજબ યોજના બનાવો',
      'મંડી ભાવ સરખાવો',
      'ઉપયોગી યોજનાઓ શોધો'
    ]
  },
  bn: {
    eyebrow: 'চাষের জন্য সিদ্ধান্ত ব্যবস্থা',
    title: 'শুধু তথ্য নয়। স্পষ্ট এগিয়ে যাওয়ার পথ।',
    desc: 'KisaanBuddy প্রতিটি পূর্বাভাসকে আপনার খামারের উপযোগী পদক্ষেপে রূপান্তরিত করে — যাতে আন্দাজ কমিয়ে নিখুঁত প্রস্তুতি নেওয়া যায়।',
    bannerTitle: 'জমিতে সরাসরি কাজের কৃষি পরামর্শ',
    bannerSub: 'আপনার মাটির ধরন, ফসলের পর্যায় এবং স্থানীয় আবহাওয়া অনুযায়ী',
    ctaText: 'আমার ফার্ম ড্যাশবোর্ড খুলুন',
    steps: [
      { number: '01', title: 'খামারের তথ্য', body: 'আপনার ফসল, অবস্থান এবং জমির অবস্থা' },
      { number: '02', title: 'AI অন্তর্দৃষ্টি', body: 'আবহাওয়া, ফসলের স্বাস্থ্য ও বাজার তথ্য একসাথে' },
      { number: '03', title: 'স্পষ্ট সুপারিশ', body: 'কী করবেন, কখন করবেন এবং কীসের ওপর নজর রাখবেন' },
      { number: '04', title: 'উন্নত ফলাফল', body: 'কম ঝুঁকি, ভালো প্রস্তুতি এবং বুদ্ধিমান বিক্রয়' },
    ],
    tools: [
      'ফসলের স্বাস্থ্য পরীক্ষা করুন',
      'আবহাওয়া অনুযায়ী পরিকল্পনা',
      'মান্ডি দর তুলনা করুন',
      'কাজের সরকারি প্রকল্প খুঁজুন'
    ]
  },
  pa: {
    eyebrow: 'ਖੇਤੀ ਲਈ ਫੈਸਲਾ ਪ੍ਰਣਾਲੀ',
    title: 'ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਨਹੀਂ। ਅੱਗੇ ਕੀ ਕਰਨਾ ਹੈ, ਉਹ ਵੀ।',
    desc: 'KisaanBuddy ਹਰ ਸੰਕੇਤ ਨੂੰ ਤੁਹਾਡੇ ਖੇਤ ਲਈ ਲਾਹੇਵੰਦ ਕਦਮ ਨਾਲ ਜੋੜਦਾ ਹੈ — ਤਾਂ ਜੋ ਤੁਸੀਂ ਅੰਦਾਜ਼ੇ ਘੱਟ ਲਗਾਓ ਅਤੇ ਬਿਹਤਰ ਤਿਆਰੀ ਕਰੋ।',
    bannerTitle: 'ਖੇਤ ਵਿੱਚ ਸਿੱਧੀ ਕੰਮ ਆਉਣ ਵਾਲੀ ਸਲਾਹ',
    bannerSub: 'ਤੁਹਾਡੀ ਜ਼ਮੀਨ, ਫਸਲ ਦੇ ਪੜਾਅ ਅਤੇ ਸਥਾਨਕ ਮੌਸਮ ਅਨੁਸਾਰ ਤਿਆਰ',
    ctaText: 'ਮੇਰਾ ਫਾਰਮ ਡੈਸ਼ਬੋਰਡ ਖੋਲ੍ਹੋ',
    steps: [
      { number: '01', title: 'ਖੇਤ ਦਾ ਡੇਟਾ', body: 'ਤੁਹਾਡੀਆਂ ਫਸਲਾਂ, ਸਥਾਨ ਅਤੇ ਖੇਤੀ ਦੇ ਹਾਲਾਤ' },
      { number: '02', title: 'AI ਸੂਝ', body: 'ਮੌਸਮ, ਸਿਹਤ ਅਤੇ ਮੰਡੀ ਦੀ ਸਥਿਤੀ ਇਕੱਠੇ ਸਮਝੋ' },
      { number: '03', title: 'ਸਪੱਸ਼ਟ ਸਿਫ਼ਾਰਸ਼', body: 'ਕੀ ਕਰਨਾ ਹੈ, ਕਦੋਂ ਕਰਨਾ ਹੈ ਅਤੇ ਕਿਸ ਗੱਲ ਤੇ ਨਜ਼ਰ ਰੱਖਣੀ ਹੈ' },
      { number: '04', title: 'ਬਿਹਤਰ ਨਤੀਜੇ', body: 'ਘੱਟ ਜੋਖਮ, ਵਧੀਆ ਤਿਆਰੀ ਅਤੇ ਸਮਾਰਟ ਵਿਕਰੀ' },
    ],
    tools: [
      'ਫਸਲ ਦੀ ਸਿਹਤ ਜਾਂਚੋ',
      'ਮੌਸਮ ਅਨੁਸਾਰ ਯੋਜਨਾ ਬਣਾਓ',
      'ਮੰਡੀ ਭਾਅ ਮਿਲਾਓ',
      'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲੱਭੋ'
    ]
  },
  ml: {
    eyebrow: 'കൃഷിക്കായുള്ള തീരുമാന സംവിധാനം',
    title: 'കേവലം വിവരങ്ങൾ മാത്രമല്ല. മുന്നോട്ടുള്ള വ്യക്തമായ മാർഗ്ഗം.',
    desc: 'KisaanBuddy ഓരോ വിവരങ്ങളെയും നിങ്ങളുടെ കൃഷിയിടത്തിന് പ്രയോജനകരമായ നടപടികളുമായി ബന്ധിപ്പിക്കുന്നു — ഊഹങ്ങൾ കുറച്ച് മികച്ച മുൻകരുതലുകൾ എടുക്കാം.',
    bannerTitle: 'പാടത്ത് നേരിട്ട് ഉപയോഗപ്രദമാകുന്ന കാർഷിക പിന്തുണ',
    bannerSub: 'നിങ്ങളുടെ നിർദ്ദിഷ്ട മണ്ണ്, വിളയുടെ ഘട്ടം, പ്രാദേശിക കാലാവസ്ഥ എന്നിവയ്ക്കനുസരിച്ച്',
    ctaText: 'ഫാം ഡാഷ്‌ബോർഡ് തുറക്കുക',
    steps: [
      { number: '01', title: 'ഫാം ഡാറ്റ', body: 'വിളകൾ, സ്ഥലം, കാർഷിക സാഹചര്യങ്ങൾ' },
      { number: '02', title: 'AI ഉൾക്കാഴ്ച', body: 'കാലാവസ്ഥയും വിള ആരോഗ്യവും വിപണി വിവരങ്ങളും ഒരുമിച്ച്' },
      { number: '03', title: 'വ്യക്തമായ നിർദ്ദേശം', body: 'എന്തു ചെയ്യണം, എപ്പോൾ ചെയ്യണം, എന്ത് ശ്രദ്ധിക്കണം' },
      { number: '04', title: 'മികച്ച ഫലങ്ങൾ', body: 'കുറഞ്ഞ അപകടസാധ്യത, മികച്ച തയ്യാറെടുപ്പ്, സമർത്ഥമായ വിപണനം' },
    ],
    tools: [
      'വിള ആരോഗ്യം പരിശോധിക്കുക',
      'കാലാവസ്ഥയ്ക്കനുസരിച്ച് പ്ലാൻ ചെയ്യുക',
      'മാർക്കറ്റ് വില താരതമ്യം ചെയ്യുക',
      'ഉപകാരപ്രദമായ പദ്ധതികൾ കണ്ടെത്തുക'
    ]
  },
  hi_en: {
    eyebrow: 'A decision system for your farm',
    title: 'Sirf information nahi. Aage kya karna hai, wo bhi.',
    desc: 'KisaanBuddy har signal ko aapke khet ke liye ek useful step se jodta hai—taaki aap kam guess karein aur behtar tayyari karein.',
    bannerTitle: 'Khet me seedhe kaam aane wali advice',
    bannerSub: 'Aapki soil, crop stage aur local weather ke hisaab se personalized',
    ctaText: 'Mera farm dashboard kholein',
    steps: [
      { number: '01', title: 'Farm data', body: 'Aapki crops, location aur khet ki condition' },
      { number: '02', title: 'AI insight', body: 'Mausam, crop health aur market context ek sath' },
      { number: '03', title: 'Clear recommendation', body: 'Kya karein, kab karein aur kis baat par dhyan dein' },
      { number: '04', title: 'Better outcomes', body: 'Kam risk, behtar preparation aur smart selling' },
    ],
    tools: [
      'Crop health check karein',
      'Weather ke hisaab se plan karein',
      'Mandi rates compare karein',
      'Kaam ki schemes khojein'
    ]
  }
};

const TOOL_CONFIG = [
  { href: '/disease', icon: ScanLine, tone: 'bg-rose-500/10 text-rose-700' },
  { href: '/weather', icon: CloudSun, tone: 'bg-sky-500/10 text-sky-700' },
  { href: '/mandi', icon: TrendingUp, tone: 'bg-amber-500/10 text-amber-700' },
  { href: '/schemes', icon: Landmark, tone: 'bg-violet-500/10 text-violet-700' },
];

export function DecisionJourney() {
  const { lang } = useLanguage();
  const c = JOURNEY_I18N[lang] || JOURNEY_I18N.en;

  const stepIcons = [Sprout, Sparkles, Bug, ShoppingBasket];

  return (
    <section className="border-y border-border/70 bg-card py-14 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:px-8">
        <div>
          <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" />{c.eyebrow}</p>
          <h2 className="mt-3 max-w-md text-3xl font-bold tracking-[-.04em] text-foreground sm:text-4xl">
            {c.title}
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            {c.desc}
          </p>
          <div className="my-5 relative overflow-hidden rounded-2xl border border-border/80 shadow-xs">
            <img
              src="/images/farmers/farmer-field-tending.jpg"
              alt="Indian farmer managing crop field and nutrient application"
              className="h-44 w-full object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-[11px]">
              <span className="font-semibold block">{c.bannerTitle}</span>
              <span className="text-slate-300 text-[10px]">{c.bannerSub}</span>
            </div>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary/80">
            {c.ctaText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative rounded-[1.5rem] border border-border bg-[#f8faf5] p-4 sm:p-6 dark:bg-card">
          <div className="absolute bottom-7 left-[15%] top-7 hidden border-l border-dashed border-primary/30 sm:block" />
          <div className="relative grid gap-3">
            {c.steps.map(({ number, title, body }, idx) => {
              const Icon = stepIcons[idx] || Sparkles;
              return (
                <div key={number} className="relative z-10 grid grid-cols-[42px_1fr] gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs sm:grid-cols-[42px_72px_1fr] sm:items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm">{number}</span>
                  <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex"><Icon className="h-4 w-4" /></span>
                  <div><p className="text-xs font-bold text-foreground">{title}</p><p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{body}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {TOOL_CONFIG.map(({ href, icon: Icon, tone }, idx) => (
          <Link key={href} href={href} className="group rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
            <p className="mt-3 text-xs font-bold text-foreground group-hover:text-primary">{c.tools[idx]}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
