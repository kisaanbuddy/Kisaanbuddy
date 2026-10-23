'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Sprout, TestTube2, Tractor } from 'lucide-react';
import { useLanguage } from '@/lib/language';

type ProfileContent = {
  eyebrow: string;
  title: string;
  desc: string;
  highlights: [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
  ];
  ctaBuild: string;
  ctaSample: string;
  bannerTag: string;
  bannerTitle: string;
  cardBadge: string;
  cardLandLabel: string;
  cardLandType: string;
  cardCropLabel: string;
  cardCropPlot: string;
  cardSoilLabel: string;
  cardSoilTag: string;
  cardIrrLabel: string;
  cardIrrType: string;
  cardIrrPump: string;
  privacyTitle: string;
  privacyDesc: string;
};

const PROFILE_I18N: Record<string, ProfileContent> = {
  en: {
    eyebrow: 'PERMANENT DIGITAL FARM PROFILE',
    title: 'Your Farm Has Its Own Digital Identity.',
    desc: 'Generic advice rarely works in the field. KisaanBuddy creates a permanent digital memory of your soil health, crop varieties, sowing dates, and irrigation methods—delivering advice tuned to your exact reality.',
    highlights: [
      {
        title: 'Multi-Plot Land Mapping',
        desc: 'Organize your farmland into distinct plots with precise acreage, soil type, and water source.'
      },
      {
        title: 'Soil Health & NPK Records',
        desc: 'Track lab-tested or estimated pH, Nitrogen, Phosphorus, and Potassium for exact fertilizer dosing.'
      },
      {
        title: 'Crop Stage & Harvest Tracking',
        desc: 'Log sowing dates and crop varieties to get stage-specific agronomic alerts from tillering to maturity.'
      },
      {
        title: 'Irrigation & Machinery Registry',
        desc: 'Personalize weather-smart irrigation advisories based on whether you use drip, canal, or tube-well.'
      }
    ],
    ctaBuild: 'Build Your Farm Profile',
    ctaSample: 'View Sample Profile',
    bannerTag: 'Scientific Soil Diagnostics',
    bannerTitle: 'Direct integration with ICAR soil health parameters and laboratory reports',
    cardBadge: 'Verified Farmer',
    cardLandLabel: 'Land Size',
    cardLandType: 'Owned',
    cardCropLabel: 'Active Crop',
    cardCropPlot: 'Plot 1 • 2.5 Ac',
    cardSoilLabel: 'Soil pH & NPK',
    cardSoilTag: 'Lab Verified ✓',
    cardIrrLabel: 'Irrigation',
    cardIrrType: 'Tube-well',
    cardIrrPump: 'Electric Pump',
    privacyTitle: 'Private & Protected: ',
    privacyDesc: 'Your farm data is encrypted and used strictly to personalize your agronomic recommendations.'
  },
  hi: {
    eyebrow: 'डिजिटल किसान पहचान',
    title: 'आपके खेत की अपनी डिजिटल पहचान।',
    desc: 'सामान्य सलाह किसी काम की नहीं होती। KisaanBuddy आपके खेत के रकबे, मिट्टी के परीक्षण, फसल की किस्म और बुवाई की तारीख को याद रखता है—ताकि AI आपको वही सलाह दे जो आपके खेत के लिए 100% सही हो।',
    highlights: [
      {
        title: 'खेत और प्लॉट मैपिंग',
        desc: 'अपने प्रत्येक खेत (रकबा, मिट्टी प्रकार, सिंचाई साधन) का अलग रिकॉर्ड रखें।'
      },
      {
        title: 'मृदा स्वास्थ्य कार्ड (NPK & pH)',
        desc: 'प्रयोगशाला जांच या अनुमानित डेटा दर्ज करें। AI उसी अनुसार खाद की सही मात्रा बताएगा।'
      },
      {
        title: 'फसल व बुवाई की तारीखें',
        desc: 'गेहूं, धान, सरसों या दलहन—बुवाई से लेकर कटाई तक हर चरण की तारीख दर्ज करें।'
      },
      {
        title: 'सिंचाई और उपकरण प्रोफाइल',
        desc: 'ड्रिप, ट्यूबवेल या नहर—उपलब्ध संसाधनों के आधार पर ही पानी देने का सुझाव।'
      }
    ],
    ctaBuild: 'अपना फार्म प्रोफाइल बनाएं',
    ctaSample: 'प्रोफाइल डेमो देखें',
    bannerTag: 'प्रमाणित वैज्ञानिक आधार',
    bannerTitle: 'मृदा स्वास्थ्य प्रयोगशाला परीक्षण डेटा के साथ सीधा जुड़ाव',
    cardBadge: 'सत्यापित किसान',
    cardLandLabel: 'कुल रकबा',
    cardLandType: 'स्वामित्व (पुश्तैनी)',
    cardCropLabel: 'सक्रिय फसल',
    cardCropPlot: 'प्लॉट 1 • 2.5 एकड़',
    cardSoilLabel: 'मिट्टी का pH व NPK',
    cardSoilTag: 'लैब सत्यापित ✓',
    cardIrrLabel: 'सिंचाई',
    cardIrrType: 'ट्यूबवेल',
    cardIrrPump: 'इलेक्ट्रिक पंप',
    privacyTitle: 'गोपनीय और सुरक्षित: ',
    privacyDesc: 'आपका कृषि डेटा केवल आपके व्यक्तिगत सुझावों के लिए सुरक्षित रहता है। इसे कभी किसी बाहरी कंपनी को नहीं बेचा जाता।'
  },
  kn: {
    eyebrow: 'ಶಾಶ್ವತ ಡಿಜಿಟಲ್ ಕೃಷಿ ಪ್ರೊಫೈಲ್',
    title: 'ನಿಮ್ಮ ಜಮೀನಿಗಿದೆ ತನ್ನದೇ ಆದ ಡಿಜಿಟಲ್ ಗುರುತು.',
    desc: 'ಸಾಮಾನ್ಯ ಸಲಹೆಗಳು ಕೃಷಿಯಲ್ಲಿ ಉಪಯುಕ್ತವಾಗುವುದಿಲ್ಲ. KisaanBuddy ನಿಮ್ಮ ಮಣ್ಣಿನ ಆರೋಗ್ಯ, ಬೆಳೆ ತಳಿಗಳು, ಬಿತ್ತನೆ ದಿನಾಂಕಗಳು ಮತ್ತು ನೀರಾವರಿ ವಿಧಾನಗಳ ಶಾಶ್ವತ ಡಿಜಿಟಲ್ ನೆನಪನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ — ನಿಮ್ಮ ಜಮೀನಿಗೆ 100% ಸೂಕ್ತವಾದ ಸಲಹೆಯನ್ನು ನೀಡುತ್ತದೆ.',
    highlights: [
      {
        title: 'ಜಮೀನು ಮತ್ತು ಪ್ಲಾಟ್ ಮ್ಯಾಪಿಂಗ್',
        desc: 'ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಜಮೀನಿನ (ವಿಸ್ತೀರ್ಣ, ಮಣ್ಣಿನ ವಿಧ, ನೀರಾವರಿ ಸೌಲಭ್ಯ) ಪ್ರತ್ಯೇಕ ದಾಖಲೆಯನ್ನು ನಿರ್ವಹಿಸಿ.'
      },
      {
        title: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ (NPK & pH)',
        desc: 'ಪ್ರಯೋಗಾಲಯ ಪರೀಕ್ಷೆ ಅಥವಾ ಅಂದಾಜು ಡೇಟಾ ದಾಖಲಿಸಿ. AI ಅದಕ್ಕೆ ತಕ್ಕಂತೆ ರಸಗೊಬ್ಬರದ ನಿಖರ ಪ್ರಮಾಣವನ್ನು ತಿಳಿಸುತ್ತದೆ.'
      },
      {
        title: 'ಬೆಳೆ ಮತ್ತು ಬಿತ್ತನೆ ದಿನಾಂಕಗಳು',
        desc: 'ಗೋಧಿ, ಭತ್ತ, ಸಾಸಿವೆ ಅಥವಾ ಬೇಳೆಕಾಳುಗಳು — ಬಿತ್ತನೆಯಿಂದ ಕಟಾವಿನವರೆಗೆ ಪ್ರತಿ ಹಂತದ ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಿ.'
      },
      {
        title: 'ನೀರಾವರಿ ಮತ್ತು ಸಲಕರಣೆಗಳ ಪ್ರೊಫೈಲ್',
        desc: 'ಹನಿ ನೀರಾವರಿ, ಕೊಳವೆಬಾವಿ ಅಥವಾ ಕಾಲುವೆ — ಲಭ್ಯವಿರುವ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಆಧರಿಸಿಯೇ ನೀರಾವರಿ ಸಲಹೆ.'
      }
    ],
    ctaBuild: 'ನಿಮ್ಮ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ',
    ctaSample: 'ಮಾದರಿ ಪ್ರೊಫೈಲ್ ನೋಡಿ',
    bannerTag: 'ಪ್ರಮಾಣೀಕೃತ ವೈಜ್ಞಾನಿಕ ಆಧಾರ',
    bannerTitle: 'ICAR ಮಣ್ಣಿನ ಆರೋಗ್ಯ ನಿಯತಾಂಕಗಳು ಮತ್ತು ಲ್ಯಾಬ್ ವರದಿಗಳೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ',
    cardBadge: 'ದೃಢೀಕೃತ ರೈತ',
    cardLandLabel: 'ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ',
    cardLandType: 'ಸ್ವಂತ ಜಮೀನು',
    cardCropLabel: 'ಸಕ್ರಿಯ ಬೆಳೆ',
    cardCropPlot: 'ಪ್ಲಾಟ್ 1 • 2.5 ಎಕರೆ',
    cardSoilLabel: 'ಮಣ್ಣಿನ pH ಮತ್ತು NPK',
    cardSoilTag: 'ಲ್ಯಾಬ್ ಪರಿಶೀಲಿತ ✓',
    cardIrrLabel: 'ನೀರಾವರಿ',
    cardIrrType: 'ಕೊಳವೆಬಾವಿ',
    cardIrrPump: 'ವಿದ್ಯುತ್ ಪಂಪ್',
    privacyTitle: 'ಖಾಸಗಿ ಮತ್ತು ಸುರಕ್ಷಿತ: ',
    privacyDesc: 'ನಿಮ್ಮ ಕೃಷಿ ಡೇಟಾವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದ್ದು, ಕೇವಲ ನಿಮ್ಮ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ವೈಯಕ್ತೀಕರಿಸಲು ಬಳಸಲಾಗುತ್ತದೆ.'
  },
  mr: {
    eyebrow: 'कायमस्वरूपी डिजिटल शेतकरी प्रोफाइल',
    title: 'तुमच्या शेताची स्वतःची डिजिटल ओळख.',
    desc: 'सर्वसाधारण सल्ला शेतात कामी येत नाही. KisaanBuddy तुमच्या मातीचे आरोग्य, पिकांच्या जाती, पेरणीच्या तारखा आणि सिंचन पद्धती लक्षात ठेवते - ज्यामुळे १००% अचूक सल्ला मिळतो.',
    highlights: [
      {
        title: 'जमीन व प्लॉट मॅपिंग',
        desc: 'तुमच्या प्रत्येक शेताची (क्षेत्रफळ, मातीचा प्रकार, सिंचन साधन) स्वतंत्र नोंद ठेवा.'
      },
      {
        title: 'मृदा आरोग्य पत्रिका (NPK & pH)',
        desc: 'प्रयोगशाळा तपासणी किंवा अंदाजित डेटा नोंदवा. AI त्यानुसार खतांची योग्य मात्रा सांगेल.'
      },
      {
        title: 'पीक आणि पेरणीच्या तारखा',
        desc: 'गहू, भात, सोयाबीन किंवा हरभरा — पेरणीपासून कापणीपर्यंत प्रत्येक टप्प्याची नोंद ठेवा.'
      },
      {
        title: 'सिंचन व यंत्रसामग्री प्रोफाइल',
        desc: 'ठिबक, विहीर, कूपनलिका किंवा कालवा — उपलब्ध साधनांनुसारच पाण्याचे योग्य नियोजन.'
      }
    ],
    ctaBuild: 'तुमचे फार्म प्रोफाइल तयार करा',
    ctaSample: 'नमुना प्रोफाइल पहा',
    bannerTag: 'प्रमाणित वैज्ञानिक आधार',
    bannerTitle: 'ICAR मृदा आरोग्य निकष आणि लॅब अहवालांशी थेट जोडणी',
    cardBadge: 'सत्यापित शेतकरी',
    cardLandLabel: 'एकूण क्षेत्र',
    cardLandType: 'स्वतःची जमीन',
    cardCropLabel: 'सध्याचे पीक',
    cardCropPlot: 'प्लॉट १ • २.५ एकर',
    cardSoilLabel: 'मातीचे pH व NPK',
    cardSoilTag: 'लॅब प्रमाणित ✓',
    cardIrrLabel: 'सिंचन',
    cardIrrType: 'कूपनलिका',
    cardIrrPump: 'इलेक्ट्रिक पंप',
    privacyTitle: 'गोपनीय आणि सुरक्षित: ',
    privacyDesc: 'तुमचा कृषी डेटा सुरक्षित आणि एनक्रिप्ट केलेला आहे, जो फक्त तुमच्या शेतीच्या सल्ल्यासाठी वापरला जातो.'
  },
  te: {
    eyebrow: 'శాశ్వత డిజిటల్ ఫార్మ్ ప్రొఫైల్',
    title: 'మీ పొలానికి ఒక ప్రత్యేక డిజిటల్ గుర్తింపు.',
    desc: 'సాధారణ సలహాలు పొలంలో పనిచేయవు. KisaanBuddy మీ నేల ఆరోగ్యం, పంట రకాలు, విత్తిన తేదీలు మరియు నీటిపారుదల విధానాలను గుర్తుంచుకుంటుంది — మీకు సరైన సలహాలను అందిస్తుంది.',
    highlights: [
      {
        title: 'భూమి మరియు ప్లాట్ మ్యాపింగ్',
        desc: 'మీ ప్రతి పొలం (విస్తీర్ణం, నేల రకం, నీటి వనరులు) వివరాలను విడిగా నమోదు చేయండి.'
      },
      {
        title: 'నేల ఆరోగ్య కార్డ్ (NPK & pH)',
        desc: 'ల్యాబ్ పరీక్ష లేదా అంచనా వివరాలు నమోదు చేయండి. AI తదనుగుణంగా ఎరువుల మోతాదును తెలుపుతుంది.'
      },
      {
        title: 'పంట మరియు విత్తిన తేదీలు',
        desc: 'వరి, పత్తి, మిరప లేదా అపరాలు — విత్తిన నాటి నుండి కోత వరకు ప్రతి దశను నమోదు చేయండి.'
      },
      {
        title: 'నీటిపారుదల మరియు పరికరాల ప్రొఫైల్',
        desc: 'డ్రిప్, బోరుబావి లేదా కాలువ — అందుబాటులో ఉన్న వనరుల ఆధారంగానే నీటి సలహాలు.'
      }
    ],
    ctaBuild: 'మీ ఫార్మ్ ప్రొఫైల్ సృష్టించండి',
    ctaSample: 'నమూనా ప్రొఫైల్ చూడండి',
    bannerTag: 'ధృవీకరించబడిన శాస్త్రీయ ఆధారం',
    bannerTitle: 'ICAR నేల ఆరోగ్య ప్రమాణాలు మరియు ల్యాబ్ నివేదికలతో ప్రత్యక్ష అనుసంధానం',
    cardBadge: 'ధృవీకరించబడిన రైతు',
    cardLandLabel: 'మొత్తం విస్తీర్ణం',
    cardLandType: 'స్వంత భూమి',
    cardCropLabel: 'ప్రస్తుత పంట',
    cardCropPlot: 'ప్లాట్ 1 • 2.5 ఎకరాలు',
    cardSoilLabel: 'నేల pH & NPK',
    cardSoilTag: 'ల్యాబ్ ధృవీకరించినది ✓',
    cardIrrLabel: 'నీటిపారుదల',
    cardIrrType: 'బోరుబావి',
    cardIrrPump: 'విద్యుత్ మోటారు',
    privacyTitle: 'వ్యక్తిగతం & సురక్షితం: ',
    privacyDesc: 'మీ వ్యవసాయ డేటా సురక్షితంగా ఉంటుంది మరియు మీ వ్యక్తిగత సలహాల కోసం మాత్రమే ఉపయోగించబడుతుంది.'
  },
  ta: {
    eyebrow: 'நிரந்தர டிஜிட்டல் பண்ணை விவரக்குறிப்பு',
    title: 'உங்கள் பண்ணைக்கு ஒரு பிரத்யேக டிஜிட்டல் அடையாளம்.',
    desc: 'பொதுவான ஆலோசனைகள் களத்தில் பயனளிக்காது. KisaanBuddy உங்கள் மண் வளம், பயிர் ரகங்கள், விதைப்பு தேதிகள் மற்றும் பாசன முறைகளை நினைவில் கொண்டு 100% துல்லியமான வழிகாட்டலை வழங்குகிறது.',
    highlights: [
      {
        title: 'நிலம் மற்றும் பரப்பளவு மேப்பிங்',
        desc: 'உங்கள் ஒவ்வொரு பண்ணையையும் (பரப்பளவு, மண் வகை, நீர் ஆதாரம்) தனித்தனியாக நிர்வகிக்கவும்.'
      },
      {
        title: 'மண் வள அட்டை (NPK & pH)',
        desc: 'ஆய்வக சோதனை அல்லது தோராய தகவல்களைப் பதிவு செய்யுங்கள். AI துல்லியமான உர அளவை பரிந்துரைக்கும்.'
      },
      {
        title: 'பயிர் மற்றும் விதைப்பு தேதிகள்',
        desc: 'நெல், கரும்பு, பருத்தி அல்லது காய்கறிகள் — விதைப்பு முதல் அறுவடை வரை அனைத்து நிலைகளையும் கண்காணிக்கவும்.'
      },
      {
        title: 'பாசனம் மற்றும் இயந்திரங்கள் விவரக்குறிப்பு',
        desc: 'சொட்டுநீர் பாசனம், ஆழ்துளை கிணறு அல்லது வாய்க்கால் — உள்ள ஆதாரங்களின் அடிப்படையில் மட்டுமே நீர் பாசன ஆலோசனை.'
      }
    ],
    ctaBuild: 'உங்கள் பண்ணை சுயவிவரத்தை உருவாக்கவும்',
    ctaSample: 'மாதிரி சுயவிவரத்தைக் காண்க',
    bannerTag: 'சான்றளிக்கப்பட்ட அறிவியல் அடிப்படை',
    bannerTitle: 'ICAR மண் வள அளவீடுகள் மற்றும் ஆய்வக அறிக்கைகளுடன் நேரடி இணைப்பு',
    cardBadge: 'சரிபார்க்கப்பட்ட விவசாயி',
    cardLandLabel: 'மொத்த நிலம்',
    cardLandType: 'சொந்த நிலம்',
    cardCropLabel: 'தற்போதைய பயிர்',
    cardCropPlot: 'பிளாட் 1 • 2.5 ஏக்கர்',
    cardSoilLabel: 'மண் pH & NPK',
    cardSoilTag: 'ஆய்வக சான்றளிக்கப்பட்டது ✓',
    cardIrrLabel: 'பாசனம்',
    cardIrrType: 'ஆழ்துளை கிணறு',
    cardIrrPump: 'மின் மோட்டார்',
    privacyTitle: 'தனியுரிமை & பாதுகாப்பு: ',
    privacyDesc: 'உங்கள் பண்ணைத் தரவு முற்றிலும் பாதுகாப்பானது, இது உங்கள் வேளாண் பரிந்துரைகளுக்காக மட்டுமே பயன்படுத்தப்படுகிறது.'
  },
  gu: {
    eyebrow: 'કાયમી ડિજિટલ ફાર્મ પ્રોફાઇલ',
    title: 'તમારા ખેતરની પોતાની ડિજિટલ ઓળખ.',
    desc: 'સામાન્ય સલાહ ખેતીમાં કામ નથી આવતી. KisaanBuddy તમારી જમીનનું આરોગ્ય, પાકની જાત, વાવણીની તારીખ અને પિયત પદ્ધતિ યાદ રાખે છે — જેથી તમને ૧૦૦% સાચી સલાહ મળે.',
    highlights: [
      {
        title: 'જમીન અને પ્લોટ મેપિંગ',
        desc: 'તમારા દરેક ખેતરનો (વિસ્તાર, જમીનનો પ્રકાર, પાણીનો સ્ત્રોત) અલગ રેકોર્ડ રાખો.'
      },
      {
        title: 'સોઇલ હેલ્થ કાર્ડ (NPK અને pH)',
        desc: 'લેબોરેટરી તપાસ અથવા અંદાજિત વિગતો નોંધો. AI તે મુજબ ખાતરનો સાચો જથ્થો જણાવશે.'
      },
      {
        title: 'પાક અને વાવણીની તારીખો',
        desc: 'કપાસ, મગફળી, ઘઉં કે જીરું — વાવણીથી લઈને લણણી સુધીના દરેક તબક્કાની નોંધ રાખો.'
      },
      {
        title: 'પિયત અને સાધનોની પ્રોફાઇલ',
        desc: 'ટપક પદ્ધતિ, બોરવેલ કે નહેર — ઉપલબ્ધ સાધનોના આધારે જ પાણી આપવાની સલાહ.'
      }
    ],
    ctaBuild: 'તમારી ફાર્મ પ્રોફાઇલ બનાવો',
    ctaSample: 'ડેમો પ્રોફાઇલ જુઓ',
    bannerTag: 'પ્રમાણિત વૈજ્ઞાનિક આધાર',
    bannerTitle: 'ICAR જમીન આરોગ્ય માપદંડો અને લેબ રિપોર્ટ સાથે સીધું જોડાણ',
    cardBadge: 'ચકાસાયેલ ખેડૂત',
    cardLandLabel: 'કુલ જમીન',
    cardLandType: 'પોતાની જમીન',
    cardCropLabel: 'ચાલુ પાક',
    cardCropPlot: 'પ્લોટ ૧ • ૨.૫ એકર',
    cardSoilLabel: 'જમીન pH & NPK',
    cardSoilTag: 'લેબ ચકાસાયેલ ✓',
    cardIrrLabel: 'પિયત',
    cardIrrType: 'બોરવેલ',
    cardIrrPump: 'ઇલેક્ટ્રિક પંપ',
    privacyTitle: 'ગોપનીય અને સુરક્ષિત: ',
    privacyDesc: 'તમારો કૃષિ ડેટા એન્ક્રિપ્ટેડ છે અને માત્ર તમારી ખેતીની સલાહ માટે જ ઉપયોગમાં લેવાય છે.'
  },
  bn: {
    eyebrow: 'স্থায়ী ডিজিটাল খামার প্রোফাইল',
    title: 'আপনার খামারের নিজস্ব ডিজিটাল পরিচয়।',
    desc: 'সাধারণ পরামর্শ চাষের কাজে আসে না। KisaanBuddy আপনার মাটির স্বাস্থ্য, ফসলের জাত, বোনার তারিখ এবং সেচ ব্যবস্থার স্থায়ী ডিজিটাল রেকর্ড রাখে — যাতে ১০০% সঠিক পরামর্শ পাওয়া যায়।',
    highlights: [
      {
        title: 'জমি ও প্লট ম্যাপিং',
        desc: 'আপনার প্রতিটি জমির (আয়তন, মাটির ধরন, সেচ সুবিধা) আলাদা রেকর্ড রাখুন।'
      },
      {
        title: 'সয়েল হেলথ কার্ড (NPK ও pH)',
        desc: 'ল্যাব পরীক্ষার বা আনুমানিক তথ্য নথিভুক্ত করুন। AI সেই অনুযায়ী সারের সঠিক মাত্রা জানাবে।'
      },
      {
        title: 'ফসল ও বোনার তারিখ',
        desc: 'ধান, পাট, গম বা ডালশস্য — বীজ বোনা থেকে কাটা পর্যন্ত প্রতিটি পর্যায়ের তারিখ রেকর্ড করুন।'
      },
      {
        title: 'সেচ ও যন্ত্রপাতি প্রোফাইল',
        desc: 'ড্রিপ, সাবমার্সিবল বা খাল — প্রাপ্ত সম্পদের ভিত্তিতেই সেচের সঠিক পরামর্শ।'
      }
    ],
    ctaBuild: 'আপনার ফার্ম প্রোফাইল তৈরি করুন',
    ctaSample: 'নমুনা প্রোফাইল দেখুন',
    bannerTag: 'প্রমাণিত বৈজ্ঞানিক ভিত্তি',
    bannerTitle: 'ICAR মাটির স্বাস্থ্য নির্দেশক এবং ল্যাব রিপোর্টের সাথে সরাসরি সংযুক্তি',
    cardBadge: 'যাচাইকৃত কৃষক',
    cardLandLabel: 'মোট জমি',
    cardLandType: 'নিজের জমি',
    cardCropLabel: 'বর্তমান ফসল',
    cardCropPlot: 'প্লট ১ • ২.৫ একর',
    cardSoilLabel: 'মাটির pH ও NPK',
    cardSoilTag: 'ল্যাব যাচাইকৃত ✓',
    cardIrrLabel: 'সেচ ব্যবস্থা',
    cardIrrType: 'সাবমার্সিবল',
    cardIrrPump: 'বৈদ্যুতিক পাম্প',
    privacyTitle: 'গোপনীয় ও সুরক্ষিত: ',
    privacyDesc: 'আপনার কৃষি তথ্য সম্পূর্ণরূপে এনক্রিপ্ট করা থাকে এবং শুধুমাত্র আপনার কৃষি পরামর্শের জন্যই ব্যবহৃত হয়।'
  },
  pa: {
    eyebrow: 'ਪੱਕੀ ਡਿਜੀਟਲ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ',
    title: 'ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਆਪਣੀ ਡਿਜੀਟਲ ਪਛਾਣ।',
    desc: 'ਆਮ ਸਲਾਹ ਖੇਤ ਵਿੱਚ ਕੰਮ ਨਹੀਂ ਆਉਂਦੀ। KisaanBuddy ਤੁਹਾਡੀ ਮਿੱਟੀ ਦੀ ਸਿਹਤ, ਫਸਲ ਦੀ ਕਿਸਮ, ਬਿਜਾਈ ਦੀ ਮਿਤੀ ਅਤੇ ਸਿੰਚਾਈ ਦੇ ਤਰੀਕੇ ਯਾਦ ਰੱਖਦਾ ਹੈ — ਤਾਂ ਜੋ ਤੁਹਾਨੂੰ 100% ਸਹੀ ਸਲਾਹ ਮਿਲੇ।',
    highlights: [
      {
        title: 'ਜ਼ਮੀਨ ਅਤੇ ਪਲਾਟ ਮੈਪਿੰਗ',
        desc: 'ਆਪਣੇ ਹਰੇਕ ਖੇਤ (ਰਕਬਾ, ਮਿੱਟੀ ਦੀ ਕਿਸਮ, ਪਾਣੀ ਦਾ ਸਾਧਨ) ਦਾ ਵੱਖਰਾ ਰਿਕਾਰਡ ਰੱਖੋ।'
      },
      {
        title: 'ਸੋਇਲ ਹੈਲਥ ਕਾਰਡ (NPK & pH)',
        desc: 'ਲੈਬ ਟੈਸਟ ਜਾਂ ਅੰਦਾਜ਼ਨ ਡੇਟਾ ਦਰਜ ਕਰੋ। AI ਉਸ ਅਨੁਸਾਰ ਖਾਦ ਦੀ ਸਹੀ ਮਾਤਰਾ ਦੱਸੇਗਾ।'
      },
      {
        title: 'ਫਸਲ ਅਤੇ ਬਿਜਾਈ ਦੀਆਂ ਤਾਰੀਖਾਂ',
        desc: 'ਕਣਕ, ਝੋਨਾ, ਨਰਮਾ ਜਾਂ ਸਰ੍ਹੋਂ — ਬਿਜਾਈ ਤੋਂ ਲੈ ਕੇ ਵਾਢੀ ਤੱਕ ਹਰ ਪੜਾਅ ਦਾ ਰਿਕਾਰਡ ਰੱਖੋ।'
      },
      {
        title: 'ਸਿੰਚਾਈ ਅਤੇ ਮਸ਼ੀਨਰੀ ਪ੍ਰੋਫਾਈਲ',
        desc: 'ਡ੍ਰਿਪ, ਟਿਊਬਵੈੱਲ ਜਾਂ ਨਹਿਰ — ਉਪਲਬਧ ਸਾਧਨਾਂ ਦੇ ਆਧਾਰ ਤੇ ਹੀ ਸਿੰਚਾਈ ਦੀ ਸਲਾਹ।'
      }
    ],
    ctaBuild: 'ਆਪਣੀ ਫਾਰਮ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',
    ctaSample: 'ਨਮੂਨਾ ਪ੍ਰੋਫਾਈਲ ਦੇਖੋ',
    bannerTag: 'ਪ੍ਰਮਾਣਿਤ ਵਿਗਿਆਨਕ ਆਧਾਰ',
    bannerTitle: 'ICAR ਮਿੱਟੀ ਸਿਹਤ ਮਾਪਦੰਡਾਂ ਅਤੇ ਲੈਬ ਰਿਪੋਰਟਾਂ ਨਾਲ ਸਿੱਧਾ ਜੋੜ',
    cardBadge: 'ਤਸਦੀਕਸ਼ੁਦਾ ਕਿਸਾਨ',
    cardLandLabel: 'ਕੁੱਲ ਰਕਬਾ',
    cardLandType: 'ਮਲਕੀਅਤ (ਆਪਣੀ)',
    cardCropLabel: 'ਮੌਜੂਦਾ ਫਸਲ',
    cardCropPlot: 'ਪਲਾਟ 1 • 2.5 ਏਕੜ',
    cardSoilLabel: 'ਮਿੱਟੀ ਦਾ pH & NPK',
    cardSoilTag: 'ਲੈਬ ਤਸਦੀਕਸ਼ੁਦਾ ✓',
    cardIrrLabel: 'ਸਿੰਚਾਈ',
    cardIrrType: 'ਟਿਊਬਵੈੱਲ',
    cardIrrPump: 'ਇਲੈਕਟ੍ਰਿਕ ਮੋਟਰ',
    privacyTitle: 'ਗੁਪਤ ਅਤੇ ਸੁਰੱਖਿਅਤ: ',
    privacyDesc: 'ਤੁਹਾਡਾ ਖੇਤੀ ਡੇਟਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸੁਰੱਖਿਅਤ ਹੈ ਅਤੇ ਸਿਰਫ਼ ਨਿੱਜੀ ਖੇਤੀ ਸਲਾਹ ਲਈ ਹੀ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ।'
  },
  ml: {
    eyebrow: 'സ്ഥിരം ഡിജിറ്റൽ ഫാം പ്രൊഫൈൽ',
    title: 'നിങ്ങളുടെ കൃഷിയിടത്തിന് സ്വന്തമായി ഒരു ഡിജിറ്റൽ ഐഡന്റിറ്റി.',
    desc: 'പൊതുവായ ഉപദേശങ്ങൾ കൃഷിയിടത്തിൽ ഉപകരിക്കില്ല. KisaanBuddy നിങ്ങളുടെ മണ്ണിന്റെ ആരോഗ്യം, വിള ഇനങ്ങൾ, വിതച്ച തീയതികൾ, ജലസേചന രീതികൾ എന്നിവ ഓർമ്മിക്കുകയും 100% അനുയോജ്യമായ ഉപദേശം നൽകുകയും ചെയ്യുന്നു.',
    highlights: [
      {
        title: 'ഭൂമിയും പ്ലോട്ട് മാപ്പിംഗും',
        desc: 'നിങ്ങളുടെ ഓരോ പ്ലോട്ടിന്റെയും (വിസ്തീർണ്ണം, മണ്ണിന്റെ തരം, ജലസ്രോതസ്സ്) പ്രത്യേക വിവരങ്ങൾ സൂക്ഷിക്കുക.'
      },
      {
        title: 'സോയിൽ ഹെൽത്ത് കാർഡ് (NPK & pH)',
        desc: 'ലാബ് പരിശോധനയോ ഏകദേശ വിവരങ്ങളോ രേഖപ്പെടുത്തുക. AI കൃത്യമായ വളത്തിന്റെ അളവ് നിർദ്ദേശിക്കും.'
      },
      {
        title: 'വിളയും നടീൽ തീയതികളും',
        desc: 'നെല്ല്, കുരുമുളക്, പച്ചക്കറികൾ — നടീൽ മുതൽ വിളവെടുപ്പ് വരെയുള്ള ഓരോ ഘട്ടങ്ങളും രേഖപ്പെടുത്തുക.'
      },
      {
        title: 'ജലസേചനവും യന്ത്രസാമഗ്രികളും',
        desc: 'ഡ്രിപ്പ്, കുഴൽക്കിണർ അല്ലെങ്കിൽ കനാൽ — ലഭ്യമായ സ്രോതസ്സുകൾക്കനുസരിച്ചുള്ള നന ശുപാർശകൾ.'
      }
    ],
    ctaBuild: 'നിങ്ങളുടെ ഫാം പ്രൊഫൈൽ ഉണ്ടാക്കുക',
    ctaSample: 'മാതൃകാ പ്രൊഫൈൽ കാണുക',
    bannerTag: 'ശാസ്ത്രീയ മണ്ണ് പരിശോധന',
    bannerTitle: 'ICAR മണ്ണ് ആരോഗ്യ മാനദണ്ഡങ്ങളുമായും ലാബ് റിപ്പോർട്ടുകളുമായും നേരിട്ടുള്ള ബന്ധം',
    cardBadge: 'സ്ഥിരീകരിച്ച കർഷകൻ',
    cardLandLabel: 'ആകെ ഭൂമി',
    cardLandType: 'സ്വന്തം ഭൂമി',
    cardCropLabel: 'നിലവിലെ വിള',
    cardCropPlot: 'പ്ലോട്ട് 1 • 2.5 ഏക്കർ',
    cardSoilLabel: 'മണ്ണ് pH & NPK',
    cardSoilTag: 'ലാബ് പരിശോധിച്ചത് ✓',
    cardIrrLabel: 'ജലസേചനം',
    cardIrrType: 'കുഴൽക്കിണർ',
    cardIrrPump: 'ഇലക്ട്രിക് മോട്ടോർ',
    privacyTitle: 'സ്വകാര്യവും സുരക്ഷിതവും: ',
    privacyDesc: 'നിങ്ങളുടെ കാർഷിക വിവരങ്ങൾ പൂർണ്ണമായും എൻക്രിപ്റ്റ് ചെയ്തതാണ്, കാർഷിക നിർദ്ദേശങ്ങൾക്കായി മാത്രം ഉപയോഗിക്കുന്നു.'
  },
  hi_en: {
    eyebrow: 'PERMANENT DIGITAL FARM PROFILE',
    title: 'Aapke Khet ki Apni Digital Pehchan.',
    desc: 'Generic advice khet me kaam nahi aati. KisaanBuddy aapki soil health, crop varieties, sowing dates aur irrigation methods ko yaad rakhta hai—taaki advice 100% accurate ho.',
    highlights: [
      {
        title: 'Multi-Plot Land Mapping',
        desc: 'Apne har khet (acreage, soil type, water source) ka alag record maintain karein.'
      },
      {
        title: 'Soil Health & NPK Records',
        desc: 'Lab-tested ya estimated pH, NPK details enter karein. AI exact fertilizer dosage batayega.'
      },
      {
        title: 'Crop Stage & Sowing Dates',
        desc: 'Gehun, dhaan, sarson ya pulses—sowing se lekar harvest tak har stage log karein.'
      },
      {
        title: 'Irrigation & Machinery Registry',
        desc: 'Drip, tubewell ya canal—available resources ke base par hi irrigation advisory.'
      }
    ],
    ctaBuild: 'Apna Farm Profile Banayein',
    ctaSample: 'Sample Profile Dekhein',
    bannerTag: 'Scientific Soil Diagnostics',
    bannerTitle: 'Direct integration with ICAR soil health parameters and laboratory reports',
    cardBadge: 'Verified Farmer',
    cardLandLabel: 'Land Size',
    cardLandType: 'Owned',
    cardCropLabel: 'Active Crop',
    cardCropPlot: 'Plot 1 • 2.5 Ac',
    cardSoilLabel: 'Soil pH & NPK',
    cardSoilTag: 'Lab Verified ✓',
    cardIrrLabel: 'Irrigation',
    cardIrrType: 'Tube-well',
    cardIrrPump: 'Electric Pump',
    privacyTitle: 'Private & Protected: ',
    privacyDesc: 'Aapka farm data encrypted rehta hai aur strictly aapki agronomic recommendations ke liye hi use hota hai.'
  }
};

const HIGHLIGHT_ICONS = [MapPin, TestTube2, Sprout, Tractor];

export function FarmerProfileSection() {
  const { lang } = useLanguage();
  const c = PROFILE_I18N[lang] || PROFILE_I18N.en;

  return (
    <section id="farmer-profile" className="py-16 sm:py-24 bg-background relative border-b border-border/60 overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute right-0 top-1/4 w-[450px] h-[450px] bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Eyebrow & Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{c.eyebrow}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {c.title}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {c.desc}
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Interactive Feature Highlight Cards */}
          <div className="lg:col-span-6 space-y-4">
            {c.highlights.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[i] || Sprout;
              return (
                <div 
                  key={i}
                  className="p-5 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground font-display flex items-center gap-2">
                      {h.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link 
                href="/signup" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98]"
              >
                <span>{c.ctaBuild}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/profile" 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-sm transition-colors"
              >
                <span>{c.ctaSample}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Authentic UI Showcase & Real Photo */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Real Photography Header Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-md">
              <img 
                src="/images/soil/soil-ph-testing.jpg" 
                alt="Agricultural specialist evaluating soil sample and testing nutrients"
                className="w-full h-48 sm:h-56 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4 sm:p-5">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                    {c.bannerTag}
                  </span>
                  <p className="text-white text-xs sm:text-sm font-semibold">
                    {c.bannerTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Profile Card Representation */}
            <div className="rounded-2xl border border-border/90 bg-card p-5 sm:p-6 shadow-lg relative">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                    KB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">Chandra Shekhar</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {c.cardBadge}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Village Rampur, Shamli, Uttar Pradesh</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  ID: #KB-8241
                </span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-border/60">
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{c.cardLandLabel}</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">4.2 Acres</span>
                  <span className="text-[10px] text-muted-foreground">{c.cardLandType}</span>
                </div>
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{c.cardCropLabel}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 block">Wheat HD-3086</span>
                  <span className="text-[10px] text-muted-foreground">{c.cardCropPlot}</span>
                </div>
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{c.cardSoilLabel}</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">6.8 (Medium N)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{c.cardSoilTag}</span>
                </div>
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-muted-foreground text-[10px] block uppercase font-bold tracking-wider">{c.cardIrrLabel}</span>
                  <span className="font-bold text-foreground text-sm mt-0.5 block">{c.cardIrrType}</span>
                  <span className="text-[10px] text-muted-foreground">{c.cardIrrPump}</span>
                </div>
              </div>

              {/* AI Context Engine Note */}
              <div className="pt-3 flex items-start gap-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-foreground">{c.privacyTitle}</strong>
                  {c.privacyDesc}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
