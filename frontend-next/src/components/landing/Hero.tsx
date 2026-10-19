'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Sprout, Layers, FlaskConical, Calendar, ShieldCheck } from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/language';

const HERO_CONTENT: Record<string, Record<string, any>> = {
  eyebrow: {
    en: 'YOUR AI-POWERED FARMING COMPANION',
    hi: 'भारत के किसानों के लिए AI खेती साथी',
    kn: 'ಭಾರತದ ರೈತರಿಗಾಗಿ AI ಕೃಷಿ ಒಡನಾಡಿ',
    mr: 'भारतातील शेतकऱ्यांसाठी AI कृषी साथीदार',
    te: 'భారతీయ రైతుల కోసం AI వ్యవసాయ సహచరుడు',
    ta: 'இந்திய விவசாயிகளுக்கான AI விவசாயத் தோழன்',
    gu: 'ભારતના ખેડૂતો માટે AI કૃષિ સાથી',
    bn: 'ভারতের কৃষকদের জন্য AI কৃষি সহচর',
    pa: 'ਭਾਰਤ ਦੇ ਕਿਸਾਨਾਂ ਲਈ AI ਖੇਤੀ ਸਾਥੀ',
    ml: 'ഇന്ത്യൻ കർഷകർക്കായി AI കൃഷി സഹായി',
    hi_en: 'Bharat ke Kisano ke liye AI Kheti Saathi',
  },
  title1: {
    en: 'Know Your Farm.',
    hi: 'अपना खेत समझें।',
    kn: 'ನಿಮ್ಮ ಜಮೀನನ್ನು ತಿಳಿಯಿರಿ.',
    mr: 'आपली शेती समजून घ्या.',
    te: 'మీ పొలాన్ని అర్థం చేసుకోండి.',
    ta: 'உங்கள் பண்ணையை அறிந்து கொள்ளுங்கள்.',
    gu: 'તમારું ખેતર સમજો.',
    bn: 'আপনার খামার জানুন।',
    pa: 'ਆਪਣੇ ਖੇਤ ਨੂੰ ਜਾਣੋ।',
    ml: 'നിങ്ങളുടെ കൃഷിസ്ഥലം അറിയുക.',
    hi_en: 'Apna Khet Samjhein.',
  },
  title2: {
    en: 'Make Better Decisions.',
    hi: 'बेहतर फैसले लें।',
    kn: 'ಉತ್ತಮ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.',
    mr: 'अधिक चांगले निर्णय घ्या.',
    te: 'మంచి నిర్ణయాలు తీసుకోండి.',
    ta: 'சிறந்த முடிவுகளை எடுங்கள்.',
    gu: 'વધુ સારા નિર્ણયો લો.',
    bn: 'আরও ভালো সিদ্ধান্ত নিন।',
    pa: 'ਬਿਹਤਰ ਫੈਸਲੇ ਲਓ।',
    ml: 'മികച്ച തീരുമാനങ്ങൾ എടുക്കുക.',
    hi_en: 'Behtar Faisle Lein.',
  },
  subtitle: {
    en: 'Your farm data, personalized AI guidance, local weather, and market insights—all in one place.',
    hi: 'आपके खेत का डेटा, व्यक्तिगत AI मार्गदर्शन, स्थानीय मौसम और बाज़ार भाव—सब एक ही जगह।',
    kn: 'ನಿಮ್ಮ ಕೃಷಿ ಡೇಟಾ, ವೈಯಕ್ತಿಕ AI ಮಾರ್ಗದರ್ಶನ, ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ದರಗಳು — ಎಲ್ಲವೂ ಒಂದೇ ಸೂರಿನಡಿ.',
    mr: 'तुमचा शेती डेटा, वैयक्तिक AI सल्ला, स्थानिक हवामान आणि बाजारभाव — सर्व एकाच ठिकाणी.',
    te: 'మీ పొలం డేటా, వ్యక్తిగత AI మార్గదర్శకత్వం, స్థానిక వాతావరణం మరియు మార్కెట్ ధరలు - అన్నీ ఒకే చోట.',
    ta: 'உங்கள் பண்ணை தரவு, தனிப்பயனாக்கப்பட்ட AI வழிகாட்டுதல், உள்ளூர் வானிலை மற்றும் சந்தை விலை — அனைத்தும் ஒரே இடத்தில்.',
    gu: 'તમારા ખેતરનો ડેટા, વ્યક્તિગત AI માર્ગદર્શન, સ્થાનિક હવામાન અને બજાર ભાવ — બધું એક જ જગ્યાએ.',
    bn: 'আপনার খামারের ডেটা, ব্যক্তিগতকৃত AI নির্দেশিকা, স্থানীয় আবহাওয়া এবং বাজারের দর — সবই এক জায়গায়।',
    pa: 'ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਡੇਟਾ, ਨਿੱਜੀ AI ਸਲਾਹ, ਸਥਾਨਕ ਮੌਸਮ ਅਤੇ ਮੰਡੀ ਦੇ ਭਾਅ — ਸਭ ਇੱਕੋ ਥਾਂ।',
    ml: 'നിങ്ങളുടെ ഫാം ഡാറ്റ, വ്യക്തിഗത AI മാർഗ്ഗനിർദ്ദേശം, പ്രാദേശിക കാലാവസ്ഥ, വിപണി വിവരങ്ങൾ — എല്ലാം ഒരിടത്ത്.',
    hi_en: 'Aapke khet ka data, personalized AI guidance, local mausam aur market rates — sab ek hi jagah.',
  },
  cta_setup: {
    en: 'Set Up My Farm',
    hi: 'अपना खेत सेटअप करें',
    kn: 'ನನ್ನ ಜಮೀನು ಹೊಂದಿಸಿ',
    mr: 'माझी शेती सेट करा',
    te: 'నా పొలాన్ని సెటప్ చేయండి',
    ta: 'என் பண்ணையை அமைக்குக',
    gu: 'મારું ખેતર સેટ કરો',
    bn: 'আমার খামার সেট আপ করুন',
    pa: 'ਆਪਣਾ ਖੇਤ ਸੈੱਟਅੱਪ ਕਰੋ',
    ml: 'എന്റെ ഫാം സജ്ജീകരിക്കുക',
    hi_en: 'Apna Khet Setup Karein',
  },
  cta_explore: {
    en: 'Explore Features',
    hi: 'सुविधाएं देखें',
    kn: 'ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    mr: 'वैशिष्ट्ये पहा',
    te: 'ఫీచర్లను అన్వేషించండి',
    ta: 'அம்சங்களை காண்க',
    gu: 'વિશેષતાઓ જુઓ',
    bn: 'বৈশিষ্ট্যগুলি দেখুন',
    pa: 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਵੇਖੋ',
    ml: 'സവിശേഷതകൾ കാണുക',
    hi_en: 'Features Dekhein',
  },
  benefit_guidance: {
    en: 'Personalized farm guidance',
    hi: 'व्यक्तिगत खेत मार्गदर्शन',
    kn: 'ವೈಯಕ್ತಿಕ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ',
    mr: 'वैयक्तिक शेती मार्गदर्शन',
    te: 'వ్యక్తిగత పొలం మార్గదర్శకత్వం',
    ta: 'தனிப்பயனாக்கப்பட்ட பண்ணை வழிகாட்டுதல்',
    gu: 'વ્યક્તિગત ખેતી માર્ગદર્શન',
    bn: 'ব্যক্তিগত খামার নির্দেশিকা',
    pa: 'ਨਿੱਜੀ ਖੇਤੀ ਸਲਾਹ',
    ml: 'വ്യക്തിഗത ഫാം മാർഗ്ഗനിർദ്ദേശം',
    hi_en: 'Personalized Khet Guidance',
  },
  benefit_languages: {
    en: 'Support for Indian languages',
    hi: '10+ भारतीय भाषाओं में समर्थन',
    kn: 'ಕನ್ನಡ ಸೇರಿ 10+ ಭಾರತೀಯ ಭಾಷೆಗಳು',
    mr: 'मराठीसह 10+ भारतीय भाषांमध्ये',
    te: 'తెలుగుతో సహా 10+ భారతీయ భాషలు',
    ta: 'தமிழ் உட்பட 10+ இந்திய மொழிகள்',
    gu: 'ગુજરાતી સહિત 10+ ભારતીય ભાષાઓ',
    bn: 'বাংলা সহ 10+ ভারতীয় ভাষা',
    pa: 'ਪੰਜਾਬੀ ਸਮੇਤ 10+ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ',
    ml: 'മലയാളം ഉൾപ്പെടെ 10+ ഇന്ത്യൻ ഭാഷകൾ',
    hi_en: '10+ Indian Languages Support',
  },
  benefit_insights: {
    en: 'Crop and market insights',
    hi: 'फसल और मंडी अंतर्दृष्टि',
    kn: 'ಬೆಳೆ ಮತ್ತು ಮಂಡಿ ಮಾಹಿತಿ',
    mr: 'पीक आणि मंडी माहिती',
    te: 'పంట మరియు మండి సమాచారం',
    ta: 'பயிர் மற்றும் மண்டி விவரங்கள்',
    gu: 'પાક અને બજાર માહિતી',
    bn: 'ফসল এবং মান্ডি অন্তর্দৃষ্টি',
    pa: 'ਫਸਲ ਅਤੇ ਮੰਡੀ ਦੀ ਜਾਣਕਾਰੀ',
    ml: 'വിളയും വിപണി വിവരങ്ങളും',
    hi_en: 'Fasal & Mandi Insights',
  },
  card_context: {
    en: 'Real-World Farm Context',
    hi: 'खेत का वास्तविक संदर्भ',
    kn: 'ನೈಜ ಕೃಷಿ ಸಂದರ್ಭ',
    mr: 'शेतीचा खरा संदर्भ',
    te: 'నిజమైన పొలం సందర్భం',
    ta: 'உண்மையான பண்ணை சூழல்',
    gu: 'ખેતરનો વાસ્તવિક સંદર્ભ',
    bn: 'খামারের আসল প্রেক্ষাপট',
    pa: 'ਖੇਤ ਦਾ ਅਸਲ ਸੰਦਰਭ',
    ml: 'യഥാർത്ഥ ഫാം പശ്ചാത്തലം',
    hi_en: 'Khet ka Real Context',
  },
  card_verified: {
    en: 'Verified Agronomy',
    hi: 'सत्यापित सलाह',
    kn: 'ದೃಢೀಕೃತ ಕೃಷಿ ಸಲಹೆ',
    mr: 'प्रमाणित कृषी सल्ला',
    te: 'ధృవీకరించిన వ్యవసాయ సలహా',
    ta: 'சரிபார்க்கப்பட்ட வேளாண்மை',
    gu: 'પ્રમાણિત કૃષિ સલાહ',
    bn: 'যাচাইকৃত কৃষিবিদ্যা',
    pa: 'ਪ੍ਰਮਾਣਿਤ ਖੇਤੀ ਸਲਾਹ',
    ml: 'സ്ഥിരീകരിച്ച കാർഷിക സയൻസ്',
    hi_en: 'Verified Agronomy',
  },
  card_title: {
    en: 'Farmer Profile · Plot Management',
    hi: 'किसान प्रोफाइल और सक्रिय फसल',
    kn: 'ರೈತರ ಪ್ರೊಫೈಲ್ · ಜಮೀನು ನಿರ್ವಹಣೆ',
    mr: 'शेतकरी प्रोफाइल · शेत व्यवस्थापन',
    te: 'రైతు ప్రొఫైల్ · పొలం నిర్వహణ',
    ta: 'விவசாயி சுயவிவரம் · நில மேலாண்மை',
    gu: 'ખેડૂત પ્રોફાઇલ · ખેતર વ્યવસ્થાપન',
    bn: 'কৃষক প্রোফাইল · জমি ব্যবস্থাপনা',
    pa: 'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ · ਖੇਤ ਪ੍ਰਬੰਧਨ',
    ml: 'കർഷക പ്രൊഫൈൽ · ഫാം മാനേജ്മെന്റ്',
    hi_en: 'Farmer Profile · Khet Management',
  },
  card_active: {
    en: 'Active Plot',
    hi: 'सक्रिय चक्र',
    kn: 'ಸಕ್ರಿಯ ಜಮೀನು',
    mr: 'सक्रिय शेत',
    te: 'యాక్టివ్ ప్లాట్',
    ta: 'செயலில் உள்ள நிலம்',
    gu: 'સક્રિય ખેતર',
    bn: 'সক্রিয় জমি',
    pa: 'ਸਰਗਰਮ ਪਲਾਟ',
    ml: 'സജീവ പ്ലോട്ട്',
    hi_en: 'Active Plot',
  },
  card_acreage_label: {
    en: 'Plot Acreage:',
    hi: 'खेत / रकबा:',
    kn: 'ಜಮೀನು / ವಿಸ್ತೀರ್ಣ:',
    mr: 'शेत / क्षेत्रफळ:',
    te: 'పొలం విస్తీర్ణం:',
    ta: 'நிலப் பரப்பளவு:',
    gu: 'ખેતર / વિસ્તાર:',
    bn: 'জমির পরিমাণ:',
    pa: 'ਖੇਤ ਦਾ ਰਕਬਾ:',
    ml: 'പ്ലോട്ട് വിസ്തീർണ്ണം:',
    hi_en: 'Khet / Rakba:',
  },
  card_acreage_val: {
    en: 'Plot #1 · 2.5 Acres (Wheat)',
    hi: 'खेत #1 · 2.5 एकड़ (गेहूं)',
    kn: 'ಜಮೀನು #1 · 2.5 ಎಕರೆ (ಗೋಧಿ)',
    mr: 'शेत #1 · 2.5 एकर (गहू)',
    te: 'ప్లాట్ #1 · 2.5 ఎకరాలు (గోధుమ)',
    ta: 'நிலம் #1 · 2.5 ஏக்கர் (கோதுமை)',
    gu: 'ખેતર #1 · 2.5 એકર (ઘઉં)',
    bn: 'জমি #১ · ২.৫ একর (গম)',
    pa: 'ਖੇਤ #1 · 2.5 ਏਕੜ (ਕਣਕ)',
    ml: 'പ്ലോട്ട് #1 · 2.5 ഏക്കർ (ഗോതമ്പ്)',
    hi_en: 'Khet #1 · 2.5 Acres (Gehu)',
  },
  card_stage_label: {
    en: 'Growth Stage:',
    hi: 'फसल अवस्था:',
    kn: 'ಬೆಳೆಯ ಹಂತ:',
    mr: 'वाढीचा टप्पा:',
    te: 'వృద్ధి దశ:',
    ta: 'வளர்ச்சி நிலை:',
    gu: 'વિકાસ તબક્કો:',
    bn: 'বৃদ্ধির পর্যায়:',
    pa: 'ਵਾਧੇ ਦਾ ਪੜਾਅ:',
    ml: 'വളർച്ചാ ഘട്ടം:',
    hi_en: 'Growth Stage:',
  },
  card_stage_val: {
    en: 'Active Vegetative (Day 38)',
    hi: 'सक्रिय वनस्पति अवस्था (दिन 38)',
    kn: 'ಸಕ್ರಿಯ ಸಸ್ಯಕ ಹಂತ (ದಿನ 38)',
    mr: 'सक्रिय वनस्पती वाढ (दिवस ३८)',
    te: 'శాఖా వృద్ధి దశ (రోజు 38)',
    ta: 'செயலில் உள்ள தாவர வளர்ச்சி (நாள் 38)',
    gu: 'સક્રિય વનસ્પતિ તબક્કો (દિવસ 38)',
    bn: 'সক্রিয় উদ্ভিজ্জ পর্যায় (দিন ৩৮)',
    pa: 'ਸਰਗਰਮ ਵਿਕਾਸ ਪੜਾਅ (ਦਿਨ 38)',
    ml: 'വളർച്ചാ ഘട്ടം (ദിവസം 38)',
    hi_en: 'Active Vegetative (Day 38)',
  },
  card_soil_label: {
    en: 'Soil Baseline:',
    hi: 'मिट्टी स्थिति:',
    kn: 'ಮಣ್ಣಿನ ಸ್ಥಿತಿ:',
    mr: 'मातीची स्थिती:',
    te: 'నేల స్థితి:',
    ta: 'மண் நிலை:',
    gu: 'જમીન સ્થિતિ:',
    bn: 'মাটির অবস্থা:',
    pa: 'ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ:',
    ml: 'മണ്ണിന്റെ അവസ്ഥ:',
    hi_en: 'Mitti Baseline:',
  },
  card_soil_val: {
    en: 'Loamy · pH 6.8 · NPK Optimal',
    hi: 'दोमट · pH 6.8 · NPK अनुकूल',
    kn: 'ಗೋಡು ಮಣ್ಣು · pH 6.8 · NPK ಸೂಕ್ತ',
    mr: 'गाळाची माती · pH 6.8 · NPK योग्य',
    te: 'ఒండ్రు నేల · pH 6.8 · NPK అనుకూలం',
    ta: 'வண்டல் மண் · pH 6.8 · NPK உகந்தது',
    gu: 'ગોરાડુ જમીન · pH 6.8 · NPK ઉત્તમ',
    bn: 'দোআঁশ মাটি · pH ৬.৮ · NPK অনুকূল',
    pa: 'ਦੋਮਟ ਮਿੱਟੀ · pH 6.8 · NPK ਅਨੁਕੂਲ',
    ml: 'എക്കൽ മണ്ണ് · pH 6.8 · NPK അനുയോജ്യം',
    hi_en: 'Domat Mitti · pH 6.8 · NPK Optimal',
  },
  card_action_label: {
    en: 'AI Plot-Specific Action:',
    hi: 'खेत-विशिष्ट AI सलाह:',
    kn: 'AI ಜಮೀನು-ನಿರ್ದಿಷ್ಟ ಸಲಹೆ:',
    mr: 'AI शेत-विशिष्ट सल्ला:',
    te: 'AI పొలం-నిర్దిష్ట కార్యాచరణ:',
    ta: 'AI நிலம்-குறிப்பிட்ட செயல்பாடு:',
    gu: 'AI ખેતર-વિશિષ્ટ સલાહ:',
    bn: 'AI জমি-নির্দিষ্ট পদক্ষেপ:',
    pa: 'AI ਖੇਤ-ਵਿਸ਼ੇਸ਼ ਕਾਰਵਾਈ:',
    ml: 'AI ഫാം-പ്രത്യേക നടപടി:',
    hi_en: 'AI Khet Action:',
  },
  card_action_desc: {
    en: 'Schedule light irrigation within 48h before flowering. Monitor foliage for yellow rust symptoms given seasonal humidity.',
    hi: 'फूल आने से पहले 48 घंटे के भीतर हल्की सिंचाई करें। मौसम की नमी के अनुसार पीला रतुआ (Yellow Rust) की नियमित निगरानी रखें।',
    kn: 'ಹೂಬಿಡುವ ಮುನ್ನ 48 ಗಂಟೆಗಳ ಒಳಗೆ ಲಘು ನೀರಾವರಿ ಒದಗಿಸಿ. ಕಾಲೋಚಿತ ತೇವಾಂಶದಿಂದಾಗಿ ಹಳದಿ ತುಕ್ಕು (Yellow Rust) ರೋಗಲಕ್ಷಣಗಳಿಗಾಗಿ ಎಲೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.',
    mr: 'फुलोरा येण्यापूर्वी ४८ तासांत हलके पाणी द्या. हवामानातील आर्द्रतेमुळे पिवळा तांबेरा (Yellow Rust) लक्षणांवर लक्ष ठेवा.',
    te: 'పూత పూయడానికి ముందు 48 గంటల్లో తేలికపాటి నీటిపారుదల ఇవ్వండి. వాతావరణ తేమ వల్ల పసుపు తుప్పు (Yellow Rust) తెగులుపై నిఘా ఉంచండి.',
    ta: 'பூக்கும் முன் 48 மணி நேரத்திற்குள் லேசான பாசனம் திட்டமிடுங்கள். ஈரப்பதம் காரணமாக மஞ்சள் துரு (Yellow Rust) அறிகுறிகளைக் கண்காணிக்கவும்.',
    gu: 'ફૂલ આવતા પહેલા 48 કલાકમાં હળવી સિંચાઈ કરો. ભેજને કારણે પાંદડામાં પીળા ગેરુ (Yellow Rust) રોગના લક્ષણો પર નજર રાખો.',
    bn: 'ফুল আসার আগে ৪৮ ঘণ্টার মধ্যে হালকা সেচ দিন। আর্দ্রতার কারণে পাতায় হলুদ মরিচা (Yellow Rust) রোগের লক্ষণ লক্ষ্য রাখুন।',
    pa: 'ਫੁੱਲ ਆਉਣ ਤੋਂ ਪਹਿਲਾਂ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਹਲਕੀ ਸਿੰਚਾਈ ਕਰੋ। ਨਮੀ ਕਾਰਨ ਪੀਲੀ ਕੁੰਗੀ (Yellow Rust) ਦੇ ਲੱਛਣਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।',
    ml: 'പൂവിടുന്നതിന് 48 മണിക്കൂർ മുമ്പ് നേരിയ നന നൽകുക. ഈർപ്പം കാരണം മഞ്ഞ തുരുമ്പ് (Yellow Rust) ലക്ഷണങ്ങൾ നിരീക്ഷിക്കുക.',
    hi_en: 'Phool aane se pehle 48 ghante me halki sinchai karein. Nami ke karan Yellow Rust ke lakshano par nazar rakhein.',
  },
};

export function Hero() {
  const { lang } = useLanguage();
  const txt = (key: string): string => {
    return HERO_CONTENT[key]?.[lang] || HERO_CONTENT[key]?.en || '';
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#F8FAF7] dark:bg-background border-b border-[#E2E8E2] dark:border-slate-800 pb-12 pt-8 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column: Heading, Copy, Actions, Benefits */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#14532D] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#16845B]" />
              <span>{txt('eyebrow')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-[#17231B] dark:text-white sm:text-5xl lg:text-[3.5rem] leading-[1.08]">
              {txt('title1')}<br />
              <span className="text-[#14532D] dark:text-emerald-400">{txt('title2')}</span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#647067] dark:text-slate-300 sm:text-lg">
              {txt('subtitle')}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#14532D] hover:bg-[#166534] px-7 text-sm font-bold text-white shadow-sm transition active:scale-95"
              >
                <span>{txt('cta_setup')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/features"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E2E8E2] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 text-sm font-bold text-[#17231B] dark:text-white transition"
              >
                <Sprout className="h-4 w-4 text-[#16845B]" />
                <span>{txt('cta_explore')}</span>
              </Link>
            </div>

            {/* 3 Concise Real Benefits */}
            <div className="mt-8 pt-6 border-t border-[#E2E8E2] dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-semibold text-[#17231B] dark:text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0" />
                <span>{txt('benefit_guidance')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0" />
                <span>{txt('benefit_languages')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0" />
                <span>{txt('benefit_insights')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Indian Farmer Photography + Real Interface Demonstration */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Authentic Photograph */}
            <div className="relative overflow-hidden rounded-2xl border border-[#E2E8E2] dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <img
                src="/images/hero/hero-indian-farmer.jpg"
                alt="Authentic Indian farmer inspecting standing crop in agricultural field"
                className="h-64 sm:h-72 w-full object-cover object-center"
              />
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-[#647067] dark:text-slate-400">
                <span className="font-semibold text-[#17231B] dark:text-slate-200">
                  {txt('card_context')}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {txt('card_verified')}
                </span>
              </div>
            </div>

            {/* Real KisaanBuddy Product Interface Demonstration */}
            <div className="rounded-2xl border border-[#E2E8E2] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#17231B] dark:text-white">
                    {txt('card_title')}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {txt('card_active')}
                </span>
              </div>

              {/* Data Rows representing real database models */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#647067] dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#16845B]" />
                    {txt('card_acreage_label')}
                  </span>
                  <span className="font-bold text-[#17231B] dark:text-white">
                    {txt('card_acreage_val')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#647067] dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#16845B]" />
                    {txt('card_stage_label')}
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {txt('card_stage_val')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#647067] dark:text-slate-400 flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5 text-[#16845B]" />
                    {txt('card_soil_label')}
                  </span>
                  <span className="font-medium text-[#17231B] dark:text-white">
                    {txt('card_soil_val')}
                  </span>
                </div>
              </div>

              {/* AI Guidance Recommendation Box */}
              <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#16845B]" />
                  <span>{txt('card_action_label')}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-950/80 dark:text-emerald-100/80">
                  {txt('card_action_desc')}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
