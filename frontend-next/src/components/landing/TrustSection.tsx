'use client';

import { ShieldCheck, Database, Cpu, WifiOff, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const TRUST_I18N: Record<string, Record<string, string>> = {
  tag: {
    en: 'TRANSPARENCY & DATA INTEGRITY',
    hi: 'वैज्ञानिक विश्वसनीयता व सुरक्षा',
    kn: 'ವೈಜ್ಞಾನಿಕ ವಿಶ್ವಾಸಾರ್ಹತೆ ಮತ್ತು ಸುರಕ್ಷತೆ',
    mr: 'पारदर्शकता आणि डेटा अखंडता',
    te: 'పారదర్శకత & డేటా సమగ్రత',
    ta: 'வெளிப்படைத்தன்மை & தரவு நம்பகத்தன்மை',
    gu: 'પારદર્શિતા અને ડેટા સુરક્ષા',
    bn: 'স্বচ্ছতা ও ডেটা অখণ্ডতা',
    pa: 'ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਡੇਟਾ ਸੁਰੱਖਿਆ',
    ml: 'സുതാര്യതയും ഡാറ്റാ സമഗ്രതയും',
    hi_en: 'Transparency & Data Integrity',
  },
  title: {
    en: 'Built on Agricultural Science. Engineered for Trust.',
    hi: 'विज्ञान पर आधारित। किसानों के विश्वास पर निर्मित।',
    kn: 'ಕೃಷಿ ವಿಜ್ಞಾನದ ಆಧಾರ. ರೈತರ ನಂಬಿಕೆಯ ಮೇಲೆ ನಿರ್ಮಿತ.',
    mr: 'कृषी विज्ञानाचा आधार. शेतकऱ्यांच्या विश्वासावर निर्मित.',
    te: 'వ్యవసాయ విజ్ఞాన ఆధారితం. రైతుల విశ్వాసంతో నిర్మితం.',
    ta: 'விவசாய அறிவியலை அடிப்படையாகக் கொண்டது. நம்பிக்கையுடன் உருவாக்கப்பட்டது.',
    gu: 'કૃષિ વિજ્ઞાન પર આધારિત. ખેડૂતોના વિશ્વાસ પર નિર્મિત.',
    bn: 'কৃষি বিজ্ঞানের উপর প্রতিষ্ঠিত। কৃষকদের আস্থার ওপর নির্মিত।',
    pa: 'ਖੇਤੀ ਵਿਗਿਆਨ ਤੇ ਆਧਾਰਿਤ। ਕਿਸਾਨਾਂ ਦੇ ਭਰੋਸੇ ਤੇ ਨਿਰਮਿਤ।',
    ml: 'കാർഷിക ശാസ്ത്രത്തിൽ അധിഷ്ഠിതം. വിശ്വാസ്യതയോടെ രൂപകൽപ്പന ചെയ്തത്.',
    hi_en: 'Agri Science par aadharit. Kisanon ke bharose par nirmit.',
  },
  desc: {
    en: 'Farming is a livelihood, not a playground for ungrounded AI hallucinations. We hold every advisory to rigorous agronomic standards.',
    hi: 'खेती कोई प्रयोग नहीं है—यह लाखों परिवारों की आजीविका है। इसलिए KisaanBuddy में कोई मनगढ़ंत दावे नहीं हैं, केवल सत्यापित डेटा और पूर्ण पारदर्शिता है।',
    kn: 'ಕೃಷಿಯು ಕೇವಲ ಪ್ರಯೋಗವಲ್ಲ — ಇದು ಲಕ್ಷಾಂತರ ಕುಟುಂಬಗಳ ಜೀವನೋಪಾಯ. ಆದ್ದರಿಂದ KisaanBuddy ಯಲ್ಲಿ ಯಾವುದೇ ಉತ್ಪ್ರೇಕ್ಷೆಯಿಲ್ಲ, ಕೇವಲ ದೃಢೀಕೃತ ಡೇಟಾ ಮತ್ತು ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕತೆ.',
    mr: 'शेती हा केवळ प्रयोग नाही — ही लाखो कुटुंबांची उपजीविका आहे. म्हणून KisaanBuddy मध्ये केवळ प्रमाणित डेटा आणि संपूर्ण पारदर्शकता आहे.',
    te: 'వ్యవసాయం అనేది కేవలం ప్రయోగం కాదు - ఇది లక్షలాది కుటుంబాల జీవనాధారం. కాబట్టి KisaanBuddy లో ధృవీకరించిన డేటా మరియు పూర్తి పారదర్శకత మాత్రమే ఉంటుంది.',
    ta: 'விவசாயம் என்பது வெறும் பரிசோதனை அல்ல — இது லட்சக்கணக்கான குடும்பங்களின் வாழ்வாதாரம். எனவே KisaanBuddy-யில் சரிபார்க்கப்பட்ட தரவு மட்டுமே வழங்கப்படும்.',
    gu: 'ખેતી માત્ર પ્રયોગ નથી — તે લાખો પરિવારોની આજીવિકા છે. તેથી KisaanBuddy માં માત્ર પ્રમાણિત ડેટા અને સંપૂર્ણ પારદર્શિતા છે.',
    bn: 'চাষাবাদ কোনো সাধারণ পরীক্ষা নয় — এটি লক্ষ লক্ষ পরিবারের জীবিকা। তাই KisaanBuddy-তে কোনো মনগড়া দাবি নেই, কেবল যাচাইকৃত ডেটা আছে।',
    pa: 'ਖੇਤੀ ਕੋਈ ਪ੍ਰਯੋਗ ਨਹੀਂ ਹੈ — ਇਹ ਲੱਖਾਂ ਪਰਿਵਾਰਾਂ ਦੀ ਰੋਜ਼ੀ-ਰੋਟੀ ਹੈ। ਇਸ ਲਈ KisaanBuddy ਵਿੱਚ ਸਿਰਫ਼ ਪ੍ਰਮਾਣਿਤ ਡੇਟਾ ਅਤੇ ਪੂਰੀ ਪਾਰਦਰਸ਼ਤਾ ਹੈ।',
    ml: 'കൃഷി എന്നത് വെറുമൊരു പരീക്ഷണമല്ല — ലക്ഷക്കണക്കിന് കുടുംബങ്ങളുടെ ഉപജീവനമാണ്. അതിനാൽ KisaanBuddy കൃത്യവും ശാസ്ത്രീയവുമായ വിവരങ്ങൾ മാത്രം നൽകുന്നു.',
    hi_en: 'Kheti koi prayog nahi — lakho parivaron ki rozi-roti hai. Isliye verified data aur full transparency.',
  },
  attr_label: {
    en: 'Data Attributions: ',
    hi: 'संस्थागत स्रोत घोषणा: ',
    kn: 'ಸಾಂಸ್ಥಿಕ ಮೂಲ ಪ್ರಕಟಣೆ: ',
    mr: 'संस्थात्मक स्रोत घोषणा: ',
    te: 'డేటా మూలాలు: ',
    ta: 'தரவு மூலங்கள்: ',
    gu: 'સંસ્થાકીય સ્ત્રોત: ',
    bn: 'ডেটার উৎস: ',
    pa: 'ਡੇਟਾ ਦੇ ਸਰੋਤ: ',
    ml: 'ഡാറ്റ ഉറവിടങ്ങൾ: ',
    hi_en: 'Data Sources: ',
  },
  attr_desc: {
    en: 'Mandi pricing powered by AGMARKNET / eNAM portals. Meteorological feeds calibrated with IMD & open weather grids. Crop protection practices conform to ICAR standard packages.',
    hi: 'मंडी भाव AGMARKNET / eNAM पोर्टल से लिए गए हैं। मौसम पूर्वानुमान IMD व ओपन मेटियोलॉजिकल मॉडलों पर आधारित है। फसल पैकेज ICAR संस्तुतियों के अनुरूप हैं।',
    kn: 'ಮಂಡಿ ದರಗಳು AGMARKNET / eNAM ಪೋರ್ಟಲ್‌ನಿಂದ ಪಡೆಯಲಾಗಿದೆ. ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯು IMD ಮತ್ತು ಮುಕ್ತ ಹವಾಮಾನ ಮಾದರಿಗಳನ್ನು ಆಧರಿಸಿದೆ. ಬೆಳೆ ಸಂರಕ್ಷಣಾ ಪದ್ಧತಿಗಳು ICAR ಮಾನದಂಡಗಳಿಗೆ ಅನುಗುಣವಾಗಿವೆ.',
    mr: 'बाजारभाव AGMARKNET / eNAM पोर्टलवरून मिळवले आहेत. हवामान अंदाज IMD वर आधारित आहे. पीक संरक्षण पद्धती ICAR मानकांनुसार आहेत.',
    te: 'మార్కెట్ ధరలు AGMARKNET / eNAM పోర్టల్ నుండి తీసుకోబడ్డాయి. వాతావరణ అంచనా IMD పై ఆధారపడి ఉంటుంది. పంట రక్షణ చర్యలు ICAR ప్రమాణాలకు అనుగుణంగా ఉంటాయి.',
    ta: 'மண்டி விலைகள் AGMARKNET / eNAM தளத்திலிருந்து பெறப்படுகின்றன. வானிலை முன்னறிவிப்பு IMD அடிப்படையிலானது. பயிர் பாதுகாப்பு முறைகள் ICAR பரிந்துரைகளுக்கு உட்பட்டவை.',
    gu: 'મંડી ભાવ AGMARKNET / eNAM પોર્ટલ પરથી લેવાયેલ છે. હવામાન આગાહી IMD પર આધારિત છે. પાક સંરક્ષણ પદ્ધતિઓ ICAR ધોરણો મુજબ છે.',
    bn: 'মান্ডি দর AGMARKNET / eNAM পোর্টাল থেকে প্রাপ্ত। আবহাওয়ার পূর্বাভাস IMD এবং উন্মুক্ত আবহাওয়া মডেলের উপর ভিত্তি করে। শস্য সুরক্ষা ICAR মান অনুযায়ী।',
    pa: 'ਮੰਡੀ ਦੇ ਭਾਅ AGMARKNET / eNAM ਪੋਰਟਲ ਤੋਂ ਲਏ ਗਏ ਹਨ। ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ IMD ਤੇ ਆਧਾਰਿਤ ਹੈ। ਫਸਲ ਸੁਰੱਖਿਆ ਦੇ ਤਰੀਕੇ ICAR ਦੇ ਮਾਪਦੰਡਾਂ ਅਨੁਸਾਰ ਹਨ।',
    ml: 'വിപണി വിലകൾ AGMARKNET / eNAM പോർട്ടലുകളിൽ നിന്ന്. കാലാവസ്ഥാ വിവരങ്ങൾ IMD അടിസ്ഥാനമാക്കി. വിള സംരക്ഷണ രീതികൾ ICAR മാനദണ്ഡങ്ങൾക്ക് അനുസൃതം.',
    hi_en: 'Mandi rates AGMARKNET / eNAM se, Weather forecast IMD se, aur crop protection ICAR guidelines ke mutabiq hai.',
  },
};

const PILLARS_CONFIG = [
  {
    icon: Database,
    title: {
      en: 'Institutional Data Feeds', hi: 'संस्थागत व सरकारी डेटा', kn: 'ಸಾಂಸ್ಥಿಕ ಮತ್ತು ಅಧಿಕೃತ ಡೇಟಾ',
      mr: 'संस्थात्मक व शासकीय डेटा', te: 'సంస్థాగత & అధికారిక డేటా', ta: 'அதிகாரப்பூர்வ அரசு தரவு',
      gu: 'સંસ્થાકીય અને સરકારી ડેટા', bn: 'প্রাতিষ্ঠানিক ও সরকারি ডেটা', pa: 'ਸੰਸਥਾਗਤ ਅਤੇ ਸਰਕਾਰੀ ਡੇਟਾ', ml: 'ഔദ്യോഗിക സർക്കാർ ഡാറ്റ', hi_en: 'Institutional Data Feeds',
    },
    desc: {
      en: 'Grounded in ICAR agronomic research, official AGMARKNET mandi feeds, and satellite-verified meteorological models.',
      hi: 'ICAR (भारतीय कृषि अनुसंधान परिषद) पद्धतियां, AGMARKNET/eNAM दैनिक मंडी भाव, और IMD/उपग्रह मौसम डेटा से सीधे संचालित।',
      kn: 'ICAR (ಭಾರತೀಯ ಕೃಷಿ ಸಂಶೋಧನಾ ಮಂಡಳಿ) ಪದ್ಧತಿಗಳು, AGMARKNET/eNAM ದೈನಂದಿನ ಮಂಡಿ ದರಗಳು ಮತ್ತು IMD/ಉಪಗ್ರಹ ಹವಾಮಾನ ಡೇಟಾದಿಂದ ನೇರವಾಗಿ ನಿಯಂತ್ರಿಸಲ್ಪಡುತ್ತದೆ.',
      mr: 'ICAR कृषी संशोधन, अधिकृत AGMARKNET बाजारभाव आणि उपग्रह हवामान मॉडेल्सवर पूर्णपणे आधारित.',
      te: 'ICAR పరిశోధన, అధికారిక AGMARKNET మార్కెట్ ఫీడ్‌లు మరియు ఉపగ్రహ ఆధారిత వాతావరణ నమూనాలపై ఆధారపడింది.',
      ta: 'ICAR வேளாண் ஆராய்ச்சி, அதிகாரப்பூர்வ AGMARKNET மண்டி நிலவரம் மற்றும் செயற்கைக்கோள் வானிலை மாதிரிகளை அடிப்படையாகக் கொண்டது.',
      gu: 'ICAR કૃષિ સંશોધન, અધિકૃત AGMARKNET મંડી ડેટા અને સેટેલાઇટ હવામાન મોડલ્સ પર સંપૂર્ણ આધારિત.',
      bn: 'ICAR কৃষি গবেষণা, সরকারি AGMARKNET মান্ডি ফিড এবং উপগ্রহ আবহাওয়া মডেলের ওপর প্রতিষ্ঠিত।',
      pa: 'ICAR ਖੇਤੀ ਖੋਜ, ਅਧਿਕਾਰਤ AGMARKNET ਮੰਡੀ ਰਿਕਾਰਡ ਅਤੇ ਉਪਗ੍ਰਹਿ ਮੌਸਮ ਮਾਡਲਾਂ ਤੇ ਪੂਰੀ ਤਰ੍ਹਾਂ ਆਧਾਰਿਤ।',
      ml: 'ICAR കാർഷിക ഗവേഷണം, ഔദ്യോഗിക AGMARKNET വിപണി വിവരങ്ങൾ, ഉപഗ്രഹ കാലാവസ്ഥാ മോഡലുകൾ എന്നിവയിൽ അധിഷ്ഠിതം.',
      hi_en: 'ICAR research, AGMARKNET live mandi feeds aur satellite weather models se powered.',
    },
  },
  {
    icon: Cpu,
    title: {
      en: 'Explainable AI Recommendations', hi: 'पारदर्शी AI सिफारिशें', kn: 'ಪಾರದರ್ಶಕ AI ಶಿಫಾರಸುಗಳು',
      mr: 'स्पष्ट आणि पारदर्शक AI सल्ला', te: 'వివరణాత్మక AI సిఫార్సులు', ta: 'தெளிவான AI பரிந்துரைகள்',
      gu: 'સમજાવી શકાય તેવી AI ભલામણો', bn: 'ব্যাখ্যামূলক AI সুপারিশ', pa: 'ਸਪੱਸ਼ਟ AI ਸਿਫਾਰਸ਼ਾਂ', ml: 'സുതാര്യമായ AI ശുപാർശകൾ', hi_en: 'Explainable AI Guidance',
    },
    desc: {
      en: 'Every alert clearly explains WHY: citing your soil test levels, the active crop stage, and prevailing humidity conditions.',
      hi: 'हम सिर्फ दवा या खाद का नाम नहीं बताते, बल्कि कारण समझाते हैं: मिट्टी का pH क्या था, मौसम कैसा है और यह मात्रा क्यों जरूरी है।',
      kn: 'ನಾವು ಕೇವಲ ಔಷಧ ಅಥವಾ ಗೊಬ್ಬರದ ಹೆಸರನ್ನು ಮಾತ್ರ ಹೇಳುವುದಿಲ್ಲ, ಬದಲಾಗಿ ಕಾರಣವನ್ನು ವಿವರಿಸುತ್ತೇವೆ: ಮಣ್ಣಿನ pH ಎಷ್ಟಿತ್ತು, ಹವಾಮಾನ ಹೇಗಿದೆ ಮತ್ತು ಈ ಪ್ರಮಾಣ ಏಕೆ ಅಗತ್ಯ.',
      mr: 'आम्ही केवळ खताचे नाव सांगत नाही, तर कारणही स्पष्ट करतो: मातीचा सामू (pH), हवामानातील आर्द्रता आणि ही मात्रा का आवश्यक आहे.',
      te: 'ప్రతి హెచ్చరిక స్పష్టమైన కారణాన్ని వివరిస్తుంది: మీ నేల pH, పంట దశ మరియు ప్రస్తుత తేమ ఆధారంగా సలహా ఇస్తుంది.',
      ta: 'ஒவ்வொரு ஆலோசனையும் காரணத்தை விளக்குகிறது: உங்கள் மண்ணின் pH, பயிர் வளர்ச்சி நிலை மற்றும் ஈரப்பதத்தின் அடிப்படையில் கணக்கிடப்படுகிறது.',
      gu: 'દરેક સલાહ સ્પષ્ટ કારણ સાથે અપાય છે: જમીનનું pH, પાકનો તબક્કો અને હવામાનના ભેજને ધ્યાનમાં રાખીને ચોક્કસ માત્રા દર્શાવાય છે.',
      bn: 'প্রতিটি সতর্কবার্তায় কারণ স্পষ্ট করা হয়: মাটির pH, ফসলের পর্যায় এবং আর্দ্রতার পরিস্থিতি উল্লেখ করে সঠিক ডোজ বলা হয়।',
      pa: 'ਹਰ ਸਲਾਹ ਦਾ ਕਾਰਨ ਸਪੱਸ਼ਟ ਦੱਸਿਆ ਜਾਂਦਾ ਹੈ: ਮਿੱਟੀ ਦਾ pH, ਫਸਲ ਦਾ ਪੜਾਅ ਅਤੇ ਮੌਸਮ ਦੀ ਨਮੀ ਨੂੰ ਧਿਆਨ ਵਿੱਚ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।',
      ml: 'ഓരോ ഉപദേശത്തിനും പിന്നിലെ കാരണം വ്യക്തമാക്കുന്നു: മണ്ണിന്റെ pH, വിളയുടെ ഘട്ടം, അന്തരീക്ഷ ഈർപ്പം എന്നിവ വിശദീകരിക്കുന്നു.',
      hi_en: 'Har alert batata hai KYUN: Mitti ka pH, crop growth stage aur humidity dekhkar exact reason explain hota hai.',
    },
  },
  {
    icon: ShieldCheck,
    title: {
      en: 'Strict Farmer Data Privacy', hi: '100% किसान डेटा गोपनीयता', kn: '100% ರೈತರ ಡೇಟಾ ಗೌಪ್ಯತೆ',
      mr: '१००% शेतकरी डेटा गोपनीयता', te: 'రైతు డేటా గోప్యత 100%', ta: 'விவசாயி தரவு பாதுகாப்பு 100%',
      gu: '100% ખેડૂત ડેટા ગોપનીયતા', bn: '১০০% কৃষক ডেটা গোপনীয়তা', pa: '100% ਕਿਸਾਨ ਡੇਟਾ ਗੋਪਨੀਯਤਾ', ml: '100% കർഷക ഡാറ്റാ സുരക്ഷ', hi_en: '100% Farmer Data Privacy',
    },
    desc: {
      en: 'Your farm coordinates, plot sizes, and yield records remain strictly yours. Never sold to commercial aggregators or advertisers.',
      hi: 'आपके खेत की जानकारी और फसल रिकॉर्ड पूरी तरह निजी हैं। इसे कभी किसी बाहरी विज्ञापनदाता या ब्रोकर को नहीं बेचा जाता।',
      kn: 'ನಿಮ್ಮ ಜಮೀನಿನ ಮಾಹಿತಿ ಮತ್ತು ಬೆಳೆ ದಾಖಲೆಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಖಾಸಗಿಯಾಗಿರುತ್ತವೆ. ಇದನ್ನು ಎಂದಿಗೂ ಯಾವುದೇ ಬಾಹ್ಯ ಜಾಹೀರಾತುದಾರರಿಗೆ ಅಥವಾ ಬ್ರೋಕರ್‌ಗಳಿಗೆ ಮಾರಾಟ ಮಾಡಲಾಗುವುದಿಲ್ಲ.',
      mr: 'तुमच्या शेताचे स्थान, क्षेत्रफळ आणि उत्पादनाचा डेटा पूर्णपणे सुरक्षित आहे. तो कधीही जाहिरातदार किंवा दलालांना विकला जात नाही.',
      te: 'మీ పొలం వివరాలు, విస్తీర్ణం మరియు దిగుబడి రికార్డులు పూర్తిగా మీ స్వంతం. ఎప్పుడూ ఏ వాణిజ్య సంస్థలకు విక్రయించబడవు.',
      ta: 'உங்கள் பண்ணை அமைவிடம், நில அளவு மற்றும் விளைச்சல் விவரங்கள் முற்றிலும் பாதுகாப்பானவை. எந்த விளம்பரதாரருக்கும் விற்கப்படாது.',
      gu: 'તમારા ખેતરનું સ્થાન, વિસ્તાર અને ઉત્પાદન ડેટા સંપૂર્ણ સુરક્ષિત છે. ક્યારેય કોઈ તૃતીય પક્ષને વેચવામાં આવતો નથી.',
      bn: 'আপনার খামারের অবস্থান, আয়তন এবং ফলনের রেকর্ড সম্পূর্ণ ব্যক্তিগত। কোনো বিজ্ঞাপনদাতা বা দালালের কাছে বিক্রি করা হয় না।',
      pa: 'ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਰਕਬਾ ਅਤੇ ਝਾੜ ਦਾ ਰਿਕਾਰਡ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸੁਰੱਖਿਅਤ ਹੈ। ਇਹ ਕਦੇ ਵੀ ਕਿਸੇ ਵਪਾਰੀ ਜਾਂ ਇਸ਼ਤਿਹਾਰਬਾਜ਼ ਨੂੰ ਨਹੀਂ ਵੇਚਿਆ ਜਾਂਦਾ।',
      ml: 'നിങ്ങളുടെ ഫാം വിവരങ്ങളും വിളവ് രേഖകളും പൂർണ്ണമായും സുരക്ഷിതമാണ്. ഇവ ഒരിക്കലും മറ്റ് കമ്പനികൾക്ക് നൽകില്ല.',
      hi_en: 'Aapke khet ki details aur crop records strictly private hain. Kisi advertiser ko kabhi sell nahi hota.',
    },
  },
  {
    icon: WifiOff,
    title: {
      en: 'Low-Bandwidth Resilience', hi: 'कमजोर इंटरनेट में भी सक्षम', kn: 'ಕಡಿಮೆ ಇಂಟರ್ನೆಟ್‌ನಲ್ಲೂ ಸಶಕ್ತ',
      mr: 'कमी इंटरनेटमध्येही वेगाने कार्यक्षम', te: 'తక్కువ ఇంటర్నెట్‌లోనూ సమర్థవంతం', ta: 'குறைந்த இணையத்திலும் இயங்கும்',
      gu: 'ધીમા ઇન્ટરનેટમાં પણ સક્ષમ', bn: 'ধীরগতির ইন্টারনেটেও কার্যকর', pa: 'ਕਮਜ਼ੋਰ ਇੰਟਰਨੈੱਟ ਵਿੱਚ ਵੀ ਕਾਰਗਰ', ml: 'കുറഞ്ഞ ഇന്റർനെറ്റിലും പ്രവർത്തിക്കും', hi_en: 'Low-Bandwidth Resilience',
    },
    desc: {
      en: 'Lightweight payloads and offline caching ensure the platform functions seamlessly even on patchy 2G/3G village connections.',
      hi: 'ग्रामीण 2G/3G नेटवर्क और साधारण बजट स्मार्टफोन पर तेजी से लोड होने के लिए विशेष रूप से ऑप्टिमाइज किया गया।',
      kn: 'ಗ್ರಾಮೀಣ 2G/3G ನೆಟ್‌ವರ್ಕ್ ಮತ್ತು ಸಾಮಾನ್ಯ ಬಜೆಟ್ ಸ್ಮಾರ್ಟ್‌ಫೋನ್‌ಗಳಲ್ಲಿ ವೇಗವಾಗಿ ಲೋಡ್ ಆಗುವಂತೆ ವಿಶೇಷವಾಗಿ ಆಪ್ಟಿಮೈಸ್ ಮಾಡಲಾಗಿದೆ.',
      mr: 'ग्रामीण भागातील 2G/3G नेटवर्क आणि सामान्य बजेट स्मार्टफोनवर जलद लोड होण्यासाठी विशेष ऑप्टिमाइझ केलेले.',
      te: 'గ్రామీణ 2G/3G నెట్‌వర్క్‌లు మరియు సాధారణ స్మార్ట్‌ఫోన్‌లలో కూడా వేగంగా పనిచేసేలా ప్రత్యేకంగా రూపొందించబడింది.',
      ta: 'கிராமப்புற 2G/3G இணையம் மற்றும் எளிய ஸ்மார்ட்போன்களிலும் விரைவாக இயங்கும் வகையில் உகந்ததாக்கப்பட்டது.',
      gu: 'ગ્રામીણ 2G/3G નેટવર્ક અને સામાન્ય સ્માર્ટફોન પર ઝડપથી લોડ થાય તે માટે ખાસ ઓપ્ટિમાઇઝ કરેલું.',
      bn: 'গ্রামাঞ্চলের 2G/3G নেটওয়ার্ক এবং সাধারণ স্মার্টফোনে দ্রুত লোড হওয়ার জন্য বিশেষভাবে তৈরি।',
      pa: 'ਪੇਂਡੂ 2G/3G ਨੈੱਟਵਰਕ ਅਤੇ ਆਮ ਬਜਟ ਸਮਾਰਟਫੋਨਾਂ ਤੇ ਤੇਜ਼ੀ ਨਾਲ ਚੱਲਣ ਲਈ ਖਾਸ ਤੌਰ ਤੇ ਡਿਜ਼ਾਈਨ ਕੀਤਾ ਗਿਆ।',
      ml: 'ഗ്രാമീണ 2G/3G നെറ്റ്‌വർക്കുകളിലും സാധാരണ സ്മാർട്ട്‌ഫോണുകളിലും വേഗത്തിൽ പ്രവർത്തിക്കാൻ ഒപ്റ്റിമൈസ് ചെയ്തത്.',
      hi_en: 'Rural 2G/3G networks aur normal budget smartphones par fast load hone ke liye optimized.',
    },
  },
];

export function TrustSection() {
  const { lang } = useLanguage();
  const txt = (key: string): string => TRUST_I18N[key]?.[lang] || TRUST_I18N[key]?.en || '';

  return (
    <section id="trust-science" className="py-16 sm:py-24 bg-card border-b border-border/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
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

        {/* 4 Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS_CONFIG.map((pillar, idx) => {
            const Icon = pillar.icon;
            const pTitle = pillar.title[lang] || pillar.title.en;
            const pDesc = pillar.desc[lang] || pillar.desc.en;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-background p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mb-5 border border-emerald-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold font-display text-foreground mb-2">
                    {pTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Institutional Attribution Footnote */}
        <div className="mt-12 p-4 rounded-xl border border-border/60 bg-muted/30 text-center max-w-4xl mx-auto">
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{txt('attr_label')}</strong>
            {txt('attr_desc')}
          </p>
        </div>

      </div>
    </section>
  );
}
