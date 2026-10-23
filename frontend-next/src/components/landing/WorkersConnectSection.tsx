'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Briefcase, Search, ArrowRight, ShieldCheck, 
  CheckCircle2, Sparkles, MapPin, IndianRupee, Clock,
  Calendar, Check, UserCheck
} from 'lucide-react';
import { useLanguage, type Lang } from '@/lib/language';

interface SectionTranslation {
  badge: string;
  title: string;
  subtitle: string;
  farmerTag: string;
  farmerTitle: string;
  farmerDesc: string;
  farmerActivitiesLabel: string;
  activities: string[];
  farmerBtn: string;
  workerTag: string;
  workerTitle: string;
  workerDesc: string;
  workerBenefitsLabel: string;
  workerBenefits: string[];
  workerBtn: string;
  bannerBadge: string;
  bannerTitle: string;
  bannerDesc: string;
  verifiedLabel: string;
}

const WORKERS_SECTION_I18N: Record<string, SectionTranslation> = {
  en: {
    badge: 'RURAL LABOUR NETWORK',
    title: 'WORKERS CONNECT',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'FOR FARMERS & LANDOWNERS',
    farmerTitle: 'FIND WORKERS',
    farmerDesc: 'Connect with verified local agricultural workers, transplantation crews, and tractor operators for your seasonal farm operations.',
    farmerActivitiesLabel: 'Available for core farming activities:',
    activities: [
      'Paddy transplantation (Ropai)',
      'Sowing and planting',
      'Weeding & intercultural operations',
      'Harvesting & threshing',
      'Irrigation & field canal work',
      'Other farming activities & tractor driving'
    ],
    farmerBtn: 'Find Farm Workers',
    workerTag: 'FOR AGRICULTURAL LABOURERS',
    workerTitle: 'FIND FARMING JOBS',
    workerDesc: 'Discover genuine, verified agricultural work opportunities in nearby fields with transparent wage rates and direct farmer contact.',
    workerBenefitsLabel: 'Why work through Workers Connect:',
    workerBenefits: [
      'Direct connection with farm owners — zero middleman commission',
      'Fair daily & weekly wages aligned with Labour Bureau & MGNREGA benchmarks',
      'Job postings for transplantation, harvesting, weeding, and machinery operations',
      'Privacy protection: your mobile number is shared only upon your consent'
    ],
    workerBtn: 'Find Farming Jobs',
    bannerBadge: 'Genuine Agricultural Network',
    bannerTitle: 'Zero Phantom Listings • Verified Farmers & Real Workers',
    bannerDesc: 'Every requirement is posted by genuine farm owners and verified agricultural workers across India.',
    verifiedLabel: 'Verified Availability'
  },
  hi: {
    badge: 'ग्रामीण श्रम शक्ति नेटवर्क',
    title: 'वर्कर कनेक्ट (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'किसानों और खेत मालिकों के लिए',
    farmerTitle: 'मजदूर खोजें (FIND WORKERS)',
    farmerDesc: 'अपने खेत के मौसमी कार्यों के लिए स्थानीय अनुभवी खेतिहर मजदूरों, रोपाई दलों और ट्रैक्टर चालकों से सीधे संपर्क करें।',
    farmerActivitiesLabel: 'खेती के सभी प्रमुख कार्यों के लिए उपलब्ध:',
    activities: [
      'धान रोपाई (Paddy transplantation - Ropai)',
      'बुवाई और पौधरोपण (Sowing and planting)',
      'निराई-गुड़ाई (Weeding)',
      'फसल कटाई और थ्रेशिंग (Harvesting)',
      'सिंचाई और नाली प्रबंधन (Irrigation)',
      'अन्य कृषि कार्य व ट्रैक्टर संचालन (Other farming activities)'
    ],
    farmerBtn: 'मजदूर खोजें (Find Workers)',
    workerTag: 'खेतिहर मजदूरों और कामगारों के लिए',
    workerTitle: 'कृषि कार्य खोजें (FIND FARMING JOBS)',
    workerDesc: 'अपने आस-पास के खेतों में उपलब्ध कृषि रोजगार खोजें, उचित मजदूरी पाएं और बिना किसी बिचौलिए के सीधे खेत मालिक से जुड़ें।',
    workerBenefitsLabel: 'वर्कर कनेक्ट से जुड़ने के लाभ:',
    workerBenefits: [
      'खेत मालिकों से सीधा संपर्क — आढ़तियों और बिचौलियों का कोई कमीशन नहीं',
      'श्रम ब्यूरो व मनरेगा मानकों के अनुरूप दैनिक व साप्ताहिक मजदूरी',
      'रोपाई, कटाई, निराई और कृषि मशीनरी संचालन के प्रमाणित काम',
      'पूरी गोपनीयता: आपकी सहमति के बिना किसी को फोन नंबर नहीं दिखता'
    ],
    workerBtn: 'काम खोजें (Find Farming Jobs)',
    bannerBadge: 'प्रामाणिक ग्रामीण नेटवर्क',
    bannerTitle: 'कोई फर्जी प्रोफाइल नहीं • वास्तविक किसान और प्रमाणित मजदूर',
    bannerDesc: 'सभी आवश्यकताएं वास्तविक किसानों द्वारा पोस्ट की जाती हैं और वास्तविक पंजीकृत कामगारों द्वारा पूरी की जाती हैं।',
    verifiedLabel: 'प्रमाणित उपलब्धता'
  },
  hi_en: {
    badge: 'RURAL LABOUR NETWORK',
    title: 'WORKERS CONNECT',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'FOR FARMERS & KHET OWNERS',
    farmerTitle: 'FIND WORKERS',
    farmerDesc: 'Apne khet ke mausam ke hisab se verified farm workers, ropai gang aur tractor operators se connect karein.',
    farmerActivitiesLabel: 'Essential kheti activities ke liye available:',
    activities: [
      'Paddy transplantation (Ropai)',
      'Sowing and planting (Bijayi)',
      'Weeding & nirai-gudai',
      'Harvesting & katai',
      'Irrigation & sinchai',
      'Other farming activities & tractor driving'
    ],
    farmerBtn: 'Find Farm Workers',
    workerTag: 'FOR FARM LABOURERS & WORKERS',
    workerTitle: 'FIND FARMING JOBS',
    workerDesc: 'Aas-paas ke kheto me genuine farm jobs discover karein, fair daily wage paayein aur direct kisaan se baat karein.',
    workerBenefitsLabel: 'Workers Connect use karne ke fayde:',
    workerBenefits: [
      'Kisan se direct connection — koi bicholiya commission nahi',
      'Labour Bureau & MGNREGA benchmarks ke mutabiq transparent wages',
      'Ropai, katai, nirai aur tractor kaam ke genuine job postings',
      'Privacy protection: Aapki consent ke bina phone number visible nahi hoga'
    ],
    workerBtn: 'Find Farming Jobs',
    bannerBadge: 'Genuine Agricultural Network',
    bannerTitle: 'Zero Fake Profiles • Real Farmers & Genuine Workers',
    bannerDesc: 'Har ek job posting actual kisaano dwara aur verified rural workers dwara manage hoti hai.',
    verifiedLabel: 'Verified Available'
  },
  kn: {
    badge: 'ಗ್ರಾಮೀಣ ಕಾರ್ಮಿಕ ಜಾಲ',
    title: 'ವರ್ಕರ್ ಕನೆಕ್ಟ್ (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'ರೈತರು ಮತ್ತು ಜಮೀನು ಮಾಲೀಕರಿಗೆ',
    farmerTitle: 'ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಿ (FIND WORKERS)',
    farmerDesc: 'ನಾಟಿ, ಕಟಾವು ಮತ್ತು ಕೃಷಿ ಕೆಲಸಗಳಿಗಾಗಿ ಸ್ಥಳೀಯ ನುರಿತ ಕಾರ್ಮಿಕರು ಮತ್ತು ಯಂತ್ರ ಚಾಲಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    farmerActivitiesLabel: 'ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಕೃಷಿ ಕಾರ್ಯಗಳು:',
    activities: [
      'ಭತ್ತದ ನಾಟಿ (Paddy transplantation - Ropai)',
      'ಬಿತ್ತನೆ ಮತ್ತು ಸಸಿ ನೆಡುವಿಕೆ (Sowing & planting)',
      'ಕಳೆ ಕೀಳುವುದು (Weeding)',
      'ಬೆಳೆ ಕಟಾವು ಮತ್ತು ಒಕ್ಕಣೆ (Harvesting)',
      'ನೀರಾವರಿ ಮತ್ತು ಕಾಲುವೆ ನಿರ್ವಹಣೆ (Irrigation)',
      'ಇತರ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳು & ಟ್ರ್ಯಾಕ್ಟರ್ ಚಾಲನೆ'
    ],
    farmerBtn: 'ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಿ (Find Workers)',
    workerTag: 'ಕೃಷಿ ಕಾರ್ಮಿಕರಿಗೆ',
    workerTitle: 'ಕೃಷಿ ಕೆಲಸ ಹುಡುಕಿ (FIND FARMING JOBS)',
    workerDesc: 'ಹತ್ತಿರದ ಹೊಲಗಳಲ್ಲಿ ಲಭ್ಯವಿರುವ ಕೃಷಿ ಉದ್ಯೋಗಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ ಮತ್ತು ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ.',
    workerBenefitsLabel: 'ವರ್ಕರ್ ಕನೆಕ್ಟ್ ಪ್ರಯೋಜನಗಳು:',
    workerBenefits: [
      'ಜಮೀನು ಮಾಲೀಕರೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ — ಮಧ್ಯವರ್ತಿಗಳ ಕಮಿಷನ್ ಇಲ್ಲ',
      'ಕಾರ್ಮಿಕ ಬ್ಯೂರೋ ಮತ್ತು ಎಂಜಿಎನ್‌ಆರ್‌ಇಜಿಎ ದರಗಳಿಗೆ ಅನುಗುಣವಾದ ಕೂಲಿ',
      'ನಾಟಿ, ಕಟಾವು ಮತ್ತು ಕಳೆ ತೆಗೆಯುವಿಕೆಯ ನೈಜ ಕೆಲಸಗಳು',
      'ಗೌಪ್ಯತೆ ರಕ್ಷಣೆ: ನಿಮ್ಮ ಒಪ್ಪಿಗೆಯ ನಂತರವೇ ಫೋನ್ ಸಂಖ್ಯೆ ಬಹಿರಂಗ'
    ],
    workerBtn: 'ಕೆಲಸ ಹುಡುಕಿ (Find Farming Jobs)',
    bannerBadge: 'ಅಧಿಕೃತ ಕೃಷಿ ಜಾಲ',
    bannerTitle: 'ನೈಜ ರೈತರು • ಪರಿಶೀಲಿಸಿದ ಕೃಷಿ ಕೆಲಸಗಾರರು',
    bannerDesc: 'ಯಾವುದೇ ನಕಲಿ ಪೋಸ್ಟಿಂಗ್‌ಗಳಿಲ್ಲ, ಎಲ್ಲಾ ಅಗತ್ಯತೆಗಳು ನೈಜ ರೈತರ ನೇರ ಸಂಪರ್ಕದೊಂದಿಗೆ.',
    verifiedLabel: 'ಪರಿಶೀಲಿಸಿದ ಲಭ್ಯತೆ'
  },
  ta: {
    badge: 'கிராமப்புற தொழிலாளர் நெட்வொர்க்',
    title: 'வர்க்கர்ஸ் கனெக்ட் (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'விவசாயிகள் மற்றும் நில உரிமையாளர்களுக்கு',
    farmerTitle: 'பண்ணை தொழிலாளர்களைக் கண்டறியுங்கள் (FIND WORKERS)',
    farmerDesc: 'நடவு, அறுவடை மற்றும் பண்ணை வேலைகளுக்கு உள்ளூர் விவசாயத் தொழிலாளர்களை நேரடியாகத் தொடர்பு கொள்ளுங்கள்.',
    farmerActivitiesLabel: 'முக்கிய விவசாயப் பணிகளுக்கு கிடைக்கும்:',
    activities: [
      'நெல் நடவு (Paddy transplantation - Ropai)',
      'விதைப்பு மற்றும் நடுதல் (Sowing & planting)',
      'களை எடுத்தல் (Weeding)',
      'அறுவடை மற்றும் கதிரடித்தல் (Harvesting)',
      'நீர்ப்பாசனம் மற்றும் வாய்க்கால் வேலை (Irrigation)',
      'இதர விவசாய வேலைகள் மற்றும் டிராக்டர் இயக்கம்'
    ],
    farmerBtn: 'தொழிலாளர்களைத் தேடுங்கள் (Find Workers)',
    workerTag: 'விவசாயத் தொழிலாளர்களுக்கு',
    workerTitle: 'பண்ணை வேலைகளைத் தேடுங்கள் (FIND FARMING JOBS)',
    workerDesc: 'அருகிலுள்ள வயல்களில் உள்ள உண்மையான விவசாய வேலை வாய்ப்புகளைக் கண்டறிந்து, தரகு இல்லாமல் நேரடி கூலி பெறுங்கள்.',
    workerBenefitsLabel: 'ஏன் வர்க்கர்ஸ் கனெக்ட்:',
    workerBenefits: [
      'நில உரிமையாளர்களுடன் நேரடித் தொடர்பு — இடைத்தரகர் கமிஷன் இல்லை',
      'அரசு தொழிலாளர் நலத்துறை வழிகாட்டுதலின்படி வெளிப்படையான கூலி',
      'நடவு, களை எடுத்தல் மற்றும் அறுவடை வேலை வாய்ப்புகள்',
      'தனியுரிமைப் பாதுகாப்பு: உங்கள் அனுமதியுடன் மட்டுமே தொலைபேசி எண் பகிரப்படும்'
    ],
    workerBtn: 'வேலைகளைத் தேடுங்கள் (Find Farming Jobs)',
    bannerBadge: 'உண்மையான விவசாய நெட்வொர்க்',
    bannerTitle: 'போலி பட்டியல்கள் இல்லை • உண்மையான விவசாயிகள் மற்றும் தொழிலாளர்கள்',
    bannerDesc: 'ஒவ்வொரு வேலை வாய்ப்பும் சரிபார்க்கப்பட்ட விவசாயிகளால் நேரடியாகப் பதிவிடப்படுகிறது.',
    verifiedLabel: 'சரிபார்க்கப்பட்ட இருப்பு'
  },
  te: {
    badge: 'గ్రామీణ కూలీల నెట్‌వర్క్',
    title: 'వర్కర్స్ కనెక్ట్ (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'రైతులు మరియు భూయజమానుల కోసం',
    farmerTitle: 'కూలీలను కనుగొనండి (FIND WORKERS)',
    farmerDesc: 'వరి నాట్లు, కోతలు మరియు వ్యవసాయ పనుల కోసం స్థానిక నిపుణులైన కూలీలను మరియు ట్రాక్టర్ ఆపరేటర్లను సంప్రదించండి.',
    farmerActivitiesLabel: 'అందుబాటులో ఉన్న వ్యవసాయ పనులు:',
    activities: [
      'వరి నాట్లు (Paddy transplantation - Ropai)',
      'విత్తనాలు వేయడం & నాటడం (Sowing & planting)',
      'కలుపు తీయడం (Weeding)',
      'పంట కోత మరియు నూర్పిడి (Harvesting)',
      'నీటిపారుదల మరియు కాల్వల నిర్వహణ (Irrigation)',
      'ఇతర వ్యవసాయ పనులు & ట్రాక్టర్ నడపడం'
    ],
    farmerBtn: 'కూలీలను వెతకండి (Find Workers)',
    workerTag: 'వ్యవసాయ కూలీల కోసం',
    workerTitle: 'వ్యవసాయ పనులను కనుగొనండి (FIND FARMING JOBS)',
    workerDesc: 'దగ్గరలోని పొలాల్లో అందుబాటులో ఉన్న వ్యవసాయ పనులను తెలుసుకోండి మరియు దళారులు లేకుండా సరైన కూలి పొందండి.',
    workerBenefitsLabel: 'వర్కర్స్ కనెక్ట్ ప్రయోజనాలు:',
    workerBenefits: [
      'రైతులతో ప్రత్యక్ష సంబంధం — మధ్యవర్తుల కమీషన్ ఉండదు',
      'లేబర్ బ్యూరో & ఉపాధి హామీ ప్రామాణిక వేతన రేట్లు',
      'నాట్లు, కలుపు, కోత పనుల నిజమైన నోటిఫికేషన్లు',
      'గోప్యత రక్షణ: మీ అనుమతితో మాత్రమే ఫోన్ నంబర్ కనిపిస్తుంది'
    ],
    workerBtn: 'పనులు వెతకండి (Find Farming Jobs)',
    bannerBadge: 'నిజమైన వ్యవసాయ నెట్‌వర్క్',
    bannerTitle: 'నకిలీ లిస్టింగ్‌లు లేవు • నిజమైన రైతులు మరియు కూలీలు',
    bannerDesc: 'అన్ని ఉద్యోగ వివరాలు నేరుగా రైతుల ద్వారా మాత్రమే నమోదు చేయబడతాయి.',
    verifiedLabel: 'ధృవీకరించబడిన లభ్యత'
  },
  mr: {
    badge: 'ग्रामीण कामगार नेटवर्क',
    title: 'वर्कर्स कनेक्ट (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'शेतकरी आणि शेतमालकांसाठी',
    farmerTitle: 'मजूर शोधा (FIND WORKERS)',
    farmerDesc: 'भात लावणी, पेरणी, निंदणी आणि कापणीसाठी स्थानिक शेतमजूर व ट्रॅक्टर चालकांशी थेट संपर्क साधा.',
    farmerActivitiesLabel: 'शेतीच्या मुख्य कामांसाठी उपलब्ध:',
    activities: [
      'भात लावणी (Paddy transplantation - Ropai)',
      'पेरणी आणि रोपांची लागवड (Sowing & planting)',
      'खुरपणी / निंदणी (Weeding)',
      'पीक कापणी व मळणी (Harvesting)',
      'पाणी व्यवस्थापन व सिंचन (Irrigation)',
      'इतर शेतीकामे व ट्रॅक्टर चालवणे'
    ],
    farmerBtn: 'मजूर शोधा (Find Workers)',
    workerTag: 'शेतमजुरांसाठी',
    workerTitle: 'शेतीची कामे शोधा (FIND FARMING JOBS)',
    workerDesc: 'जवळच्या शेतांमध्ये उपलब्ध असलेली कामे शोधा, योग्य मजुरी मिळवा आणि मध्यस्थांशिवाय थेट शेतकऱ्यांशी बोला.',
    workerBenefitsLabel: 'वर्कर्स कनेक्टचे फायदे:',
    workerBenefits: [
      'शेतकऱ्यांशी थेट संवाद — दलालांचे कोणतेही कमिशन नाही',
      'कामगार ब्युरो व मनरेगा दरांनुसार पारदर्शक मजुरी',
      'लावणी, कापणी आणि निंदणीच्या खऱ्या कामांच्या नोंदी',
      'गोपनीयता: आपल्या संमतीशिवाय मोबाईल नंबर कोणालाही दिसत नाही'
    ],
    workerBtn: 'कामे शोधा (Find Farming Jobs)',
    bannerBadge: 'प्रामाणिक शेती नेटवर्क',
    bannerTitle: 'कोणतेही बनावट प्रोफाइल नाही • खरे शेतकरी व पडताळलेले मजूर',
    bannerDesc: 'प्रत्येक आवश्यकता खऱ्या शेतकऱ्यांद्वारे पोस्ट केली जाते.',
    verifiedLabel: 'पडताळलेली उपलब्धता'
  },
  gu: {
    badge: 'ગ્રામીણ શ્રમિક નેટવર્ક',
    title: 'વર્કર્સ કનેક્ટ (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'ખેડૂતો અને જમીન માલિકો માટે',
    farmerTitle: 'મજૂરો શોધો (FIND WORKERS)',
    farmerDesc: 'રોપણી, વાવણી, નિંદામણ અને લણણી માટે સ્થાનિક ખેત મજૂરો અને ટ્રેક્ટર ચાલકો સાથે સીધો સંપર્ક કરો.',
    farmerActivitiesLabel: 'ખેતીના મુખ્ય કાર્યો માટે ઉપલબ્ધ:',
    activities: [
      'ડાંગર રોપણી (Paddy transplantation - Ropai)',
      'વાવણી અને રોપા વાવવા (Sowing & planting)',
      'નિંદામણ (Weeding)',
      'પાક લણણી અને થ્રેશિંગ (Harvesting)',
      'પિયત અને નીક વ્યવસ્થાપન (Irrigation)',
      'અન્ય ખેતી કાર્યો અને ટ્રેક્ટર ઓપરેશન'
    ],
    farmerBtn: 'મજૂરો શોધો (Find Workers)',
    workerTag: 'ખેતમજૂરો માટે',
    workerTitle: 'ખેતી કામ શોધો (FIND FARMING JOBS)',
    workerDesc: 'નજીકના ખેતરોમાં ઉપલબ્ધ રોજગારની તકો મેળવો અને વચેટીયાઓ વગર સીધા ખેડૂત સાથે જોડાઈ યોગ્ય વેતન મેળવો.',
    workerBenefitsLabel: 'વર્કર્સ કનેક્ટના ફાયદા:',
    workerBenefits: [
      'ખેડૂતો સાથે સીધો સંપર્ક — દલાલનું કોઈ કમિશન નહીં',
      'લેબર બ્યુરો અને મનરેગા મુજબ પારદર્શક મજૂરી દર',
      'રોપણી, લણણી અને નિંદામણના સાચા કામોની માહિતી',
      'સંપૂર્ણ ગોપનીયતા: તમારી સંમતિ વિના ફોન નંબર દેખાશે નહીં'
    ],
    workerBtn: 'કામ શોધો (Find Farming Jobs)',
    bannerBadge: 'અધિકૃત કૃષિ નેટવર્ક',
    bannerTitle: 'કોઈ નકલી લિસ્ટિંગ નહીં • વાસ્તવિક ખેડૂતો અને ચકાસાયેલા શ્રમિકો',
    bannerDesc: 'દરેક જરૂરિયાત વાસ્તવિક ખેડૂતો દ્વારા નોંધાયેલ છે.',
    verifiedLabel: 'ચકાસાયેલ ઉપલબ્ધતા'
  },
  bn: {
    badge: 'গ্রামীণ শ্রমিক নেটওয়ার্ক',
    title: 'ওয়ার্কার্স কানেক্ট (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'কৃষক ও জমির মালিকদের জন্য',
    farmerTitle: 'শ্রমিক খুঁজুন (FIND WORKERS)',
    farmerDesc: 'ধান রোপণ, বোনা, নিড়ানি এবং ফসল কাটার জন্য স্থানীয় নির্ভরযোগ্য কৃষি শ্রমিকদের সাথে সরাসরি যোগাযোগ করুন।',
    farmerActivitiesLabel: 'প্রধান কৃষিকাজের জন্য উপলব্ধ:',
    activities: [
      'ধান রোপণ (Paddy transplantation - Ropai)',
      'বীজ বপন ও চারা রোপণ (Sowing & planting)',
      'নিড়ানি দেওয়া (Weeding)',
      'ফসল কাটা ও মাড়াই (Harvesting)',
      'সেচ ও নর্দমা ব্যবস্থাপনা (Irrigation)',
      'অন্যান্য কৃষিকাজ ও ট্র্যাক্টর চালনা'
    ],
    farmerBtn: 'শ্রমিক খুঁজুন (Find Workers)',
    workerTag: 'কৃষি শ্রমিকদের জন্য',
    workerTitle: 'কৃষিকাজ খুঁজুন (FIND FARMING JOBS)',
    workerDesc: 'কাছের খামারগুলিতে কাজের সুযোগ খুঁজুন, ন্যায্য মজুরি পান এবং কোনো দালাল ছাড়া সরাসরি কৃষকের সাথে কথা বলুন।',
    workerBenefitsLabel: 'ওয়ার্কার্স কানেক্টের সুবিধা:',
    workerBenefits: [
      'খামার মালিকদের সাথে সরাসরি যোগাযোগ — কোনো মধ্যস্বত্বভোগী নেই',
      'লেবার ব্যুরো ও মনরেগা মানদণ্ড অনুযায়ী ন্যায্য মজুরি',
      'রোপণ, নিড়ানি ও ফসল কাটার আসল কাজের বিজ্ঞপ্তি',
      'গোপনীয়তা রক্ষা: আপনার সম্মতি ছাড়া মোবাইল নম্বর প্রকাশ করা হয় না'
    ],
    workerBtn: 'কাজ খুঁজুন (Find Farming Jobs)',
    bannerBadge: 'প্রামাণ্য কৃষি নেটওয়ার্ক',
    bannerTitle: 'কোনো জাল তালিকা নেই • আসল কৃষক ও পরীক্ষিত শ্রমিক',
    bannerDesc: 'প্রতিটি বিজ্ঞপ্তি যাচাইকৃত কৃষকদের দ্বারা পোস্ট করা হয়।',
    verifiedLabel: 'যাচাইকৃত প্রাপ্যতা'
  },
  pa: {
    badge: 'ਪੇਂਡੂ ਮਜ਼ਦੂਰ ਨੈੱਟਵਰਕ',
    title: 'ਵਰਕਰ ਕਨੈਕਟ (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'ਕਿਸਾਨਾਂ ਅਤੇ ਜ਼ਮੀਨ ਮਾਲਕਾਂ ਲਈ',
    farmerTitle: 'ਮਜ਼ਦੂਰ ਲੱਭੋ (FIND WORKERS)',
    farmerDesc: 'ਝੋਨੇ ਦੀ ਲਵਾਈ, ਬਿਜਾਈ, ਗੋਡੀ ਅਤੇ ਵਾਢੀ ਲਈ ਸਥਾਨਕ ਤਜਰਬੇਕਾਰ ਮਜ਼ਦੂਰਾਂ ਅਤੇ ਟਰੈਕਟਰ ਚਾਲਕਾਂ ਨਾਲ ਸਿੱਧਾ ਰਾਬਤਾ ਕਰੋ।',
    farmerActivitiesLabel: 'ਖੇਤੀ ਦੇ ਮੁੱਖ ਕੰਮਾਂ ਲਈ ਉਪਲਬਧ:',
    activities: [
      'ਝੋਨਾ ਲਵਾਈ (Paddy transplantation - Ropai)',
      'ਬਿਜਾਈ ਅਤੇ ਪੌਦ ਲਗਾਉਣਾ (Sowing & planting)',
      'ਗੋਡੀ ਤੇ ਨਦੀਨ ਕੱਢਣਾ (Weeding)',
      'ਵਾਢੀ ਤੇ ਥਰੈਸ਼ਿੰਗ (Harvesting)',
      'ਸਿੰਚਾਈ ਤੇ ਖਾਲਿਆਂ ਦੀ ਸਫ਼ਾਈ (Irrigation)',
      'ਹੋਰ ਖੇਤੀਬਾੜੀ ਕੰਮ ਅਤੇ ਟਰੈਕਟਰ ਚਲਾਉਣਾ'
    ],
    farmerBtn: 'ਮਜ਼ਦੂਰ ਲੱਭੋ (Find Workers)',
    workerTag: 'ਖੇਤ ਮਜ਼ਦੂਰਾਂ ਲਈ',
    workerTitle: 'ਖੇਤੀ ਕੰਮ ਲੱਭੋ (FIND FARMING JOBS)',
    workerDesc: 'ਨੇੜਲੇ ਖੇਤਾਂ ਵਿੱਚ ਉਪਲਬਧ ਕੰਮ ਦੇ ਮੌਕੇ ਲੱਭੋ, ਸਹੀ ਦਿਹਾੜੀ ਪਾਓ ਅਤੇ ਬਿਨਾਂ ਕਿਸੇ ਵਿਚੋਲੇ ਦੇ ਸਿੱਧੇ ਕਿਸਾਨ ਨਾਲ ਗੱਲ ਕਰੋ।',
    workerBenefitsLabel: 'ਵਰਕਰ ਕਨੈਕਟ ਦੇ ਲਾਭ:',
    workerBenefits: [
      'ਕਿਸਾਨਾਂ ਨਾਲ ਸਿੱਧਾ ਸੰਪਰਕ — ਵਿਚੋਲਿਆਂ ਦਾ ਕੋਈ ਕਮਿਸ਼ਨ ਨਹੀਂ',
      'ਲੇਬਰ ਬਿਊਰੋ ਅਤੇ ਮਨਰੇਗਾ ਮਾਪਦੰਡਾਂ ਅਨੁਸਾਰ ਪਾਰਦਰਸ਼ੀ ਮਜ਼ਦੂਰੀ',
      'ਲਵਾਈ, ਵਾਢੀ ਅਤੇ ਗੋਡੀ ਦੇ ਅਸਲੀ ਕੰਮ ਦੀ ਜਾਣਕਾਰੀ',
      'ਗੋਪਨੀਯਤਾ ਸੁਰੱਖਿਆ: ਤੁਹਾਡੀ ਮਨਜ਼ੂਰੀ ਤੋਂ ਬਿਨਾਂ ਫ਼ੋਨ ਨੰਬਰ ਕਿਸੇ ਨੂੰ ਨਹੀਂ ਦਿਖਦਾ'
    ],
    workerBtn: 'ਕੰਮ ਲੱਭੋ (Find Farming Jobs)',
    bannerBadge: 'ਪ੍ਰਮਾਣਿਕ ਖੇਤੀ ਨੈੱਟਵਰਕ',
    bannerTitle: 'ਕੋਈ ਫ਼ਰਜ਼ੀ ਲਿਸਟਿੰਗ ਨਹੀਂ • ਅਸਲ ਕਿਸਾਨ ਅਤੇ ਪ੍ਰਮਾਣਿਤ ਮਜ਼ਦੂਰ',
    bannerDesc: 'ਹਰ ਲੋੜ ਅਸਲ ਕਿਸਾਨਾਂ ਦੁਆਰਾ ਸਿੱਧੀ ਦਰਜ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।',
    verifiedLabel: 'ਪ੍ਰਮਾਣਿਤ ਉਪਲਬਧਤਾ'
  },
  ml: {
    badge: 'ഗ്രാമീണ തൊഴിലാളി ശൃംഖല',
    title: 'വർക്കേഴ്സ് കണക്ട് (WORKERS CONNECT)',
    subtitle: 'Find farm workers or discover farming jobs near you.',
    farmerTag: 'കർഷകർക്കും ഭൂവുടമകൾക്കും',
    farmerTitle: 'തൊഴിലാളികളെ കണ്ടെത്തുക (FIND WORKERS)',
    farmerDesc: 'ഞാറുനടീൽ, വിതയ്ക്കൽ, കള പറിക്കൽ, വിളവെടുപ്പ് എന്നിവയ്ക്കായി പ്രാദേശിക കർഷക തൊഴിലാളികളുമായി ബന്ധപ്പെടുക.',
    farmerActivitiesLabel: 'പ്രധാന കൃഷി ജോലികൾക്കായി ലഭ്യമാണ്:',
    activities: [
      'ഞാറുനടീൽ (Paddy transplantation - Ropai)',
      'വിതയ്ക്കലും നടീലും (Sowing & planting)',
      'കള പറിക്കൽ (Weeding)',
      'വിളവെടുപ്പും മെതിക്കലും (Harvesting)',
      'ജലസേചനവും ചാലു നിർമ്മാണവും (Irrigation)',
      'മറ്റ് കാർഷിക ജോലികളും ട്രാക്ടർ പ്രവർത്തനങ്ങളും'
    ],
    farmerBtn: 'തൊഴിലാളികളെ കണ്ടെത്തുക (Find Workers)',
    workerTag: 'കാർഷിക തൊഴിലാളികൾക്കായി',
    workerTitle: 'കൃഷി ജോലികൾ കണ്ടെത്തുക (FIND FARMING JOBS)',
    workerDesc: 'സമീപത്തെ പാടങ്ങളിൽ ലഭ്യമായ കാർഷിക ജോലികൾ കണ്ടെത്തുക, ന്യായമായ കൂലി നേടുക, നേരിട്ട് കർഷകരുമായി സംസാരിക്കുക.',
    workerBenefitsLabel: 'വർക്കേഴ്സ് കണക്റ്റിന്റെ നേട്ടങ്ങൾ:',
    workerBenefits: [
      'കർഷകരുമായി നേരിട്ടുള്ള ബന്ധം — ഇടനിലക്കാരുടെ കമ്മീഷൻ ഇല്ല',
      'ലേബർ ബ്യൂറോ, തൊഴിലുറപ്പ് നിരക്കുകൾക്കനുസരിച്ചുള്ള കൂലി',
      'നടീൽ, വിളവെടുപ്പ്, കള പറിക്കൽ എന്നിവയ്ക്കുള്ള യഥാർത്ഥ അവസരങ്ങൾ',
      'സ്വകാര്യതാ പരിരക്ഷ: നിങ്ങളുടെ അനുമതിയോടെ മാത്രമേ ഫോൺ നമ്പർ ദൃശ്യമാകൂ'
    ],
    workerBtn: 'ജോലികൾ കണ്ടെത്തുക (Find Farming Jobs)',
    bannerBadge: 'യഥാർത്ഥ കാർഷിക ശൃംഖല',
    bannerTitle: 'വ്യാജ വിവരങ്ങൾ ഇല്ല • യഥാർത്ഥ കർഷകരും തൊഴിലാളികളും',
    bannerDesc: 'എല്ലാ തൊഴിൽ വിവരങ്ങളും യഥാർത്ഥ കർഷകർ നേരിട്ട് നൽകുന്നതാണ്.',
    verifiedLabel: 'സ്ഥിരീകരിച്ച ലഭ്യത'
  }
};

export function WorkersConnectSection() {
  const { lang } = useLanguage();
  const c = WORKERS_SECTION_I18N[lang] || WORKERS_SECTION_I18N.en;

  return (
    <section id="workers-connect-section" className="py-16 sm:py-24 bg-card/60 dark:bg-card/30 border-b border-border/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{c.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {c.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-emerald-700 dark:text-emerald-400 font-semibold leading-relaxed">
            &ldquo;{c.subtitle}&rdquo;
          </p>
        </div>

        {/* 2 Primary Action Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Action A: FIND WORKERS (For Farmers) */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all hover:border-emerald-500/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 mb-4">
                <Users className="h-3.5 w-3.5" />
                <span>{c.farmerTag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">
                {c.farmerTitle}
              </h3>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {c.farmerDesc}
              </p>

              <div className="mt-6 pt-5 border-t border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                  {c.farmerActivitiesLabel}
                </p>

                <ul className="space-y-2.5">
                  {c.activities.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-border/60">
              <Link
                href="/worker-connect?tab=find_workers"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98]"
              >
                <Search className="h-4 w-4" />
                <span>{c.farmerBtn}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Action B: FIND FARMING JOBS (For Agricultural Workers) */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all hover:border-amber-500/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-500/20 mb-4">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{c.workerTag}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">
                {c.workerTitle}
              </h3>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {c.workerDesc}
              </p>

              <div className="mt-6 pt-5 border-t border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                  {c.workerBenefitsLabel}
                </p>

                <ul className="space-y-2.5">
                  {c.workerBenefits.map((ben, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium">
                      <div className="h-4 w-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-border/60">
              <Link
                href="/worker-connect?tab=find_jobs"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-900/20 transition-all active:scale-[0.98]"
              >
                <Briefcase className="h-4 w-4" />
                <span>{c.workerBtn}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Real Network Verification Banner */}
        <div className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {c.bannerBadge}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                {c.bannerTitle}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {c.bannerDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/worker-connect?tab=wage_benchmarks"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Labour Bureau Wage Benchmarks</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
