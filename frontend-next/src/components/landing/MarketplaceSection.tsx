'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Store, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const MARKET_I18N: Record<string, {
  badge: string;
  title: string;
  desc: string;
  sellerTag: string;
  sellerTitle: string;
  sellerDesc: string;
  sellerFeatures: [string, string, string];
  sellerBtn: string;
  buyerTag: string;
  buyerTitle: string;
  buyerDesc: string;
  buyerFeatures: [string, string, string];
  buyerBtn: string;
  bannerBadge: string;
  bannerTitle: string;
  bannerDesc: string;
}> = {
  en: {
    badge: 'DIRECT AGRI TRADE',
    title: 'Connect Your Harvest to Market Opportunities.',
    desc: 'Empowering farmers with open commercial access. List your harvested produce, discover bulk buyers, or lease agricultural machinery with zero hidden fees.',
    sellerTag: 'FOR FARMERS & SELLERS',
    sellerTitle: 'Sell Produce & Rent Equipment',
    sellerDesc: 'List your harvested grains, vegetables, fruit lots, or rent out farm machinery. Receive inquiries directly from verified local buyers and aggregators.',
    sellerFeatures: [
      'Showcase your harvest directly to verified buyers, local traders, and FPOs',
      'Negotiate fair market rates without unexpected middleman commissions',
      'List unused tractors, rotavators, and sprayers for farm machinery rental',
    ],
    sellerBtn: 'List on Marketplace',
    buyerTag: 'FOR TRADERS & FPOs',
    buyerTitle: 'Source Directly from Farms',
    buyerDesc: 'Search farmer-listed lots across districts. Access detailed variety specifications, moisture estimations, and transparent harvest timelines.',
    buyerFeatures: [
      'Source fresh, graded produce directly from village farms at harvest',
      'Filter by harvest date, quantity in quintals, crop variety, and district',
      'Contact verified farmers directly with transparent phone & WhatsApp links',
    ],
    buyerBtn: 'Browse Available Produce',
    bannerBadge: 'Transparent & Verified',
    bannerTitle: 'Connecting Real Farmers with Real Buyers',
    bannerDesc: 'No phantom listings. Every batch is tied to verified grower profiles and local harvest seasons.',
  },
  hi: {
    badge: 'किसान से खरीदार सीधा संपर्क',
    title: 'अपनी फसल को सीधे बाजार के अवसरों से जोड़ें।',
    desc: 'खेत में पसीना बहाने के बाद उपज का सही मूल्य मिलना हर किसान का अधिकार है। KisaanBuddy मार्केटप्लेस आपको सीधे थोक खरीदारों और स्थानीय किसानों से जोड़ता है।',
    sellerTag: 'किसानों और विक्रेताओं के लिए',
    sellerTitle: 'उपज बेचें व उपकरण किराए पर दें',
    sellerDesc: 'अपनी कटी हुई फसल (गेहूं, धान, सब्जियां, फल) या किराए पर देने योग्य कृषि उपकरण आसानी से लिस्ट करें। खरीदार सीधे आपसे फोन पर संपर्क करेंगे।',
    sellerFeatures: [
      'सीधे खरीदार, व्यापारी और FPO तक अपनी फसल की जानकारी पहुंचाएं',
      'बिचौलियों और अनावश्यक कमीशन के बिना उचित दाम तय करें',
      'ट्रैक्टर, कंबाइन हार्वेस्टर व स्प्रेयर किराए पर देने की सुविधा',
    ],
    sellerBtn: 'मार्केटप्लेस में लिस्ट करें',
    buyerTag: 'खरीदारों व FPO के लिए',
    buyerTitle: 'सीधे खेत से थोक खरीद',
    buyerDesc: 'स्थानीय किसानों द्वारा सीधे सूचीबद्ध की गई ताजी उपज देखें। मात्रा, किस्म और स्थान के अनुसार फिल्टर करके स्रोत से सीधे डील करें।',
    buyerFeatures: [
      'सीधे किसान के खेत से ताजी उपज और प्रामाणिक गुणवत्ता',
      'मात्रा, फसल किस्म, कटाई की तारीख और स्थान का साफ विवरण',
      'सत्यापित किसान प्रोफाइल और पारदर्शी संपर्क',
    ],
    buyerBtn: 'उपलब्ध फसलें देखें',
    bannerBadge: 'पारदर्शी व सुरक्षित',
    bannerTitle: 'सत्यापित किसान और वास्तविक उत्पादन',
    bannerDesc: 'कोई नकली ब्रोकर नहीं। हर लिस्टिंग वास्तविक किसान और उसके सत्यापित फार्म प्रोफाइल से जुड़ी होती है।',
  },
  kn: {
    badge: 'ರೈತರಿಂದ ಖರೀದಿದಾರರಿಗೆ ನೇರ ಸಂಪರ್ಕ',
    title: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಮಾರುಕಟ್ಟೆ ಅವಕಾಶಗಳಿಗೆ ನೇರವಾಗಿ ಜೋಡಿಸಿ.',
    desc: 'ಜಮೀನಿನಲ್ಲಿ ಬೆವರು ಸುರಿಸಿದ ನಂತರ ಬೆಳೆಗೆ ನ್ಯಾಯಯುತ ಬೆಲೆ ಪಡೆಯುವುದು ಪ್ರತಿ ರೈತನ ಹಕ್ಕು. KisaanBuddy ಮಾರುಕಟ್ಟೆಯು ನಿಮ್ಮನ್ನು ನೇರವಾಗಿ ಸಗಟು ಖರೀದಿದಾರರು ಮತ್ತು ಸ್ಥಳೀಯ ರೈತರೊಂದಿಗೆ ಜೋಡಿಸುತ್ತದೆ.',
    sellerTag: 'ರೈತರು ಮತ್ತು ಮಾರಾಟಗಾರರಿಗಾಗಿ',
    sellerTitle: 'ಬೆಳೆ ಮಾರಾಟ ಮತ್ತು ಸಲಕರಣೆ ಬಾಡಿಗೆ',
    sellerDesc: 'ನಿಮ್ಮ ಕಟಾವು ಮಾಡಿದ ಬೆಳೆ ಅಥವಾ ಬಾಡಿಗೆಗೆ ಲಭ್ಯವಿರುವ ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಸುಲಭವಾಗಿ ಪಟ್ಟಿ ಮಾಡಿ. ಖರೀದಿದಾರರು ನೇರವಾಗಿ ನಿಮ್ಮನ್ನು ಫೋನ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.',
    sellerFeatures: [
      'ದೃಢೀಕೃತ ಖರೀದಿದಾರರು, ಸ್ಥಳೀಯ ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು FPO ಗಳಿಗೆ ನೇರವಾಗಿ ನಿಮ್ಮ ಬೆಳೆಯ ವಿವರಗಳನ್ನು ತಲುಪಿಸಿ',
      'ಮಧ್ಯವರ್ತಿಗಳು ಮತ್ತು ಅನಗತ್ಯ ಕಮಿಷನ್ ಇಲ್ಲದೆ ಸೂಕ್ತ ಮಾರುಕಟ್ಟೆ ದರ ನಿಗದಿಪಡಿಸಿ',
      'ಬಳಸದ ಟ್ರ್ಯಾಕ್ಟರ್, ರೋಟಾವೇಟರ್ ಮತ್ತು ಸ್ಪ್ರೇಯರ್‌ಗಳನ್ನು ಬಾಡಿಗೆಗೆ ನೀಡುವ ಸೌಲಭ್ಯ',
    ],
    sellerBtn: 'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿ',
    buyerTag: 'ವ್ಯಾಪಾರಿಗಳು ಮತ್ತು FPO ಗಳಿಗಾಗಿ',
    buyerTitle: 'ಜಮೀನಿನಿಂದಲೇ ನೇರ ಸಗಟು ಖರೀದಿ',
    buyerDesc: 'ಸ್ಥಳೀಯ ರೈತರು ನೇರವಾಗಿ ಪಟ್ಟಿ ಮಾಡಿರುವ ತಾಜಾ ಉತ್ಪನ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ. ಪ್ರಮಾಣ, ತಳಿ ಮತ್ತು ಸ್ಥಳದ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ ಮೂಲದಿಂದಲೇ ನೇರವಾಗಿ ವ್ಯವಹರಿಸಿ.',
    buyerFeatures: [
      'ರೈತರ ಜಮೀನಿನಿಂದಲೇ ನೇರವಾಗಿ ತಾಜಾ ಉತ್ಪನ್ನ ಮತ್ತು ಅಧಿಕೃತ ಗುಣಮಟ್ಟ',
      'ಪ್ರಮಾಣ, ಬೆಳೆ ತಳಿ, ಕಟಾವು ದಿನಾಂಕ ಮತ್ತು ಜಿಲ್ಲೆಯ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ',
      'ದೃಢೀಕೃತ ರೈತರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಪಾರದರ್ಶಕ ನೇರ ಸಂಪರ್ಕ',
    ],
    buyerBtn: 'ಲಭ್ಯವಿರುವ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    bannerBadge: 'ಪಾರದರ್ಶಕ ಮತ್ತು ಸುರಕ್ಷಿತ',
    bannerTitle: 'ನೈಜ ರೈತರನ್ನು ನೈಜ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವುದು',
    bannerDesc: 'ಯಾವುದೇ ನಕಲಿ ಬ್ರೋಕರ್‌ಗಳಿಲ್ಲ. ಪ್ರತಿಯೊಂದು ಪಟ್ಟಿಯು ದೃಢೀಕೃತ ರೈತ ಮತ್ತು ಅವರ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್‌ನೊಂದಿಗೆ ಜೋಡಿಸಲ್ಪಟ್ಟಿರುತ್ತದೆ.',
  },
  mr: {
    badge: 'शेतकरी ते थेट खरेदीदार व्यापार',
    title: 'तुमच्या पिकाला थेट बाजारातील संधींशी जोडा.',
    desc: 'शेतात घाम गाळल्यानंतर पिकाला योग्य भाव मिळणे हा प्रत्येक शेतकऱ्याचा हक्क आहे. KisaanBuddy मार्केटप्लेस तुम्हाला थेट घाऊक खरेदीदार आणि स्थानिक शेतकऱ्यांशी जोडते.',
    sellerTag: 'शेतकरी आणि विक्रेत्यांसाठी',
    sellerTitle: 'उत्पादन विका आणि अवजारे भाड्याने द्या',
    sellerDesc: 'तुमचे काढलेले पीक (धान्य, भाजीपाला, फळे) किंवा भाड्याने देण्याची कृषी अवजारे सहजपणे सूचीबद्ध करा. खरेदीदार थेट तुमच्याशी फोनवर संपर्क साधतील.',
    sellerFeatures: [
      'सत्यापित खरेदीदार, स्थानिक व्यापारी आणि FPO पर्यंत तुमच्या पिकाची माहिती थेट पोहोचवा',
      'दलाल आणि अनावश्यक कमिशनशिवाय योग्य बाजारभाव ठरवा',
      'ट्रॅक्टर, रोटाव्हेटर आणि स्प्रेअर भाड्याने देण्याची सोय',
    ],
    sellerBtn: 'मार्केटप्लेसमध्ये नोंदवा',
    buyerTag: 'व्यापारी व FPO साठी',
    buyerTitle: 'थेट शेतातून घाऊक खरेदी',
    buyerDesc: 'स्थानिक शेतकऱ्यांनी थेट सूचीबद्ध केलेली ताजी उत्पादने शोधा. प्रमाण, जात आणि स्थानानुसार फिल्टर करून थेट स्त्रोताकडून खरेदी करा.',
    buyerFeatures: [
      'कापणीच्या वेळी थेट गावातील शेतातून ताजे आणि दर्जेदार उत्पादन मिळवा',
      'कापणीची तारीख, क्विंटलमधील प्रमाण, पिकाची जात आणि जिल्ह्यानुसार फिल्टर करा',
      'सत्यापित शेतकऱ्यांशी थेट फोन व व्हॉट्सॲपवर संपर्क साधा',
    ],
    buyerBtn: 'उपलब्ध पिके पहा',
    bannerBadge: 'पारदर्शक आणि सुरक्षित',
    bannerTitle: 'खरे शेतकरी आणि खरे खरेदीदार यांना जोडणे',
    bannerDesc: 'कोणतेही बनावट दलाल नाहीत. प्रत्येक सूची थेट सत्यापित शेतकरी आणि त्यांच्या फार्म प्रोफाइलशी जोडलेली असते.',
  },
  te: {
    badge: 'రైతుల నుండి నేరుగా కొనుగోలుదారులకు',
    title: 'మీ పంటను నేరుగా మార్కెట్ అవకాశాలతో అనుసంధానించండి.',
    desc: 'పొలంలో కష్టపడి పండించిన పంటకు గిట్టుబాటు ధర పొందడం ప్రతి రైతు హక్కు. KisaanBuddy మార్కెట్‌ప్లేస్ మిమ్మల్ని నేరుగా హోల్‌సేల్ కొనుగోలుదారులు మరియు రైతులతో కలుపుతుంది.',
    sellerTag: 'రైతులు మరియు విక్రేతల కోసం',
    sellerTitle: 'పంట అమ్మకం & పరికరాల అద్దె',
    sellerDesc: 'మీ పంట దిగుబడిని లేదా అద్దెకు ఇవ్వగల వ్యవసాయ యంత్రాలను సులభంగా లిస్ట్ చేయండి. కొనుగోలుదారులు నేరుగా ఫోన్ ద్వారా మిమ్మల్ని సంప్రదిస్తారు.',
    sellerFeatures: [
      'ధృవీకరించబడిన కొనుగోలుదారులు, వ్యాపారులు మరియు FPO లకు నేరుగా మీ పంట వివరాలు అందించండి',
      'దళారులు మరియు అనవసర కమీషన్లు లేకుండా సరసమైన ధరను నిర్ణయించండి',
      'ట్రాక్టర్లు, రోటావfeaturesేటర్లు మరియు స్ప్రేయర్లను అద్దెకు ఇచ్చే సదుపాయం',
    ],
    sellerBtn: 'మార్కెట్‌ప్లేస్‌లో చేర్చండి',
    buyerTag: 'వ్యాపారులు & FPO ల కోసం',
    buyerTitle: 'పొలాల నుండి నేరుగా హోల్‌సేల్ కొనుగోలు',
    buyerDesc: 'రైతులు నేరుగా నమోదు చేసిన తాజా ఉత్పత్తులను పరిశీలించండి. పరిమాణం, రకం మరియు జిల్లా ఆధారంగా ఫిల్టర్ చేసి నేరుగా కొనుగోలు చేయండి.',
    buyerFeatures: [
      'రైతు పొలం నుండి నేరుగా తాజా నాణ్యమైన ఉత్పత్తుల సేకరణ',
      'కోత తేదీ, క్వింటాళ్ల పరిమాణం, పంట రకం మరియు జిల్లా ప్రకారం శోధించండి',
      'ధృవీకరించబడిన రైతులతో పారదర్శక ఫోన్ మరియు వాట్సాప్ సంభాషణ',
    ],
    buyerBtn: 'అందుబాటులో ఉన్న పంటలు చూడండి',
    bannerBadge: 'పారదర్శకం & సురక్షితం',
    bannerTitle: 'నిజమైన రైతులను నిజమైన కొనుగోలుదారులతో కలపడం',
    bannerDesc: 'ఎటువంటి దళారులు లేరు. ప్రతి లిస్టింగ్ ధృవీకరించబడిన రైతు ప్రొఫైల్‌తో ముడిపడి ఉంటుంది.',
  },
  ta: {
    badge: 'விவசாயிகளிடமிருந்து நேரடியாக வாங்குபவர்களுக்கு',
    title: 'உங்கள் விளைச்சலை நேரடி சந்தை வாய்ப்புகளுடன் இணையுங்கள்.',
    desc: 'நிலத்தில் உழைத்த பிறகு பயிருக்கு நியாயமான விலை பெறுவது ஒவ்வொரு விவசாயியின் உரிமை. KisaanBuddy சந்தை உங்களை நேரடியாக மொத்த விற்பனையாளர்கள் மற்றும் விவசாயிகளுடன் இணைக்கிறது.',
    sellerTag: 'விவசாயிகள் மற்றும் விற்பனையாளர்களுக்கு',
    sellerTitle: 'விளைச்சல் விற்பனை & உபகரண வாடகை',
    sellerDesc: 'உங்கள் அறுவடை செய்த பயிர்கள் அல்லது வாடகைக்கு விடக்கூடிய விவசாயக் கருவிகளை எளிதாக பட்டியலிடுங்கள். வாங்குபவர்கள் உங்களை நேரடியாகத் தொடர்பு கொள்வார்கள்.',
    sellerFeatures: [
      'சரிபார்க்கப்பட்ட வாங்குபவர்கள், உள்ளூர் வியாபாரிகள் மற்றும் FPO-க்களுக்கு உங்கள் பயிர் விவரங்களை நேரடியாக கொண்டு சேருங்கள்',
      'இடைத்தரகர்கள் மற்றும் மறைமுக கமிஷன்கள் இன்றி நியாயமான விலையை முடிவு செய்யுங்கள்',
      'டிராக்டர், ரோட்டாவேட்டர் மற்றும் தெளிப்பான்களை வாடகைக்கு வழங்கும் வசதி',
    ],
    sellerBtn: 'சந்தையில் பட்டியலிடுங்கள்',
    buyerTag: 'வியாபாரிகள் & FPO-க்களுக்கு',
    buyerTitle: 'பண்ணைகளிலிருந்து நேரடி மொத்த கொள்முதல்',
    buyerDesc: 'உள்ளூர் விவசாயிகள் நேரடியாக பட்டியலிட்டுள்ள புதிய விளைபொருட்களைக் கண்டறியுங்கள். அளவு, ரகம் மற்றும் இருப்பிட அடிப்படையில் வடிகட்டி நேரடியாக ஒப்பந்தம் செய்யுங்கள்.',
    buyerFeatures: [
      'அறுவடையின் போது கிராமத்துப் பண்ணைகளிலிருந்து நேரடியாக புதிய தரமான விளைபொருட்கள்',
      'அறுவடை தேதி, குவிண்டால் அளவு, பயிர் ரகம் மற்றும் மாவட்ட வாரியாக தேடுங்கள்',
      'சரிபார்க்கப்பட்ட விவசாயிகளுடன் வெளிப்படையான தொலைபேசி & வாட்ஸ்அப் தொடர்பு',
    ],
    buyerBtn: 'கிடைக்கும் பயிர்களைப் பார்க்கவும்',
    bannerBadge: 'வெளிப்படையானது & பாதுகாப்பானது',
    bannerTitle: 'உண்மையான விவசாயிகளையும் உண்மையான வாங்குபவர்களையும் இணைப்பது',
    bannerDesc: 'போலி இடைத்தரகர்கள் இல்லை. ஒவ்வொரு பட்டியலும் சரிபார்க்கப்பட்ட விவசாயியின் சுயவிவரத்துடன் இணைக்கப்பட்டுள்ளது.',
  },
  gu: {
    badge: 'ખેડૂતોથી સીધા ખરીદદારો સુધી',
    title: 'તમારા પાકને બજારની તકો સાથે સીધો જોડો.',
    desc: 'ખેતરમાં પરસેવો પાડ્યા પછી પાકનું યોગ્ય મૂલ્ય મેળવવું એ દરેક ખેડૂતનો અધિકાર છે. KisaanBuddy માર્કેટપ્લેસ તમને સીધા જથ્થાબંધ ખરીદદારો સાથે જોડે છે.',
    sellerTag: 'ખેડૂતો અને વેચાણકર્તાઓ માટે',
    sellerTitle: 'પાક વેચો અને સાધનો ભાડે આપો',
    sellerDesc: 'તમારો પાક (અનાજ, શાકભાજી, ફળો) અથવા ભાડે આપવા યોગ્ય કૃષિ સાધનો સરળતાથી લિસ્ટ કરો. ખરીદદારો સીધો ફોન પર સંપર્ક કરશે.',
    sellerFeatures: [
      'ચકાસાયેલ ખરીદદારો, વેપારીઓ અને FPO સુધી તમારા પાકની વિગતો સીધી પહોંચાડો',
      'દલાલો અને બિનજરૂરી કમિશન વિના વાજબી ભાવ નક્કી કરો',
      'ટ્રેક્ટર, રોટાવેટર અને સ્પ્રેયર ભાડે આપવાની સુવિધા',
    ],
    sellerBtn: 'માર્કેટપ્લેસમાં લિસ્ટ કરો',
    buyerTag: 'વેપારીઓ અને FPO માટે',
    buyerTitle: 'સીધા ખેતરમાંથી જથ્થાબંધ ખરીદી',
    buyerDesc: 'સ્થાનિક ખેડૂતો દ્વારા સીધા લિસ્ટેડ કરાયેલ તાજો માલ જુઓ. જથ્થો, જાત અને સ્થળ મુજબ ફિલ્ટર કરી સીધો સોદો કરો.',
    buyerFeatures: [
      'કાપણી સમયે સીધા ખેતરમાંથી તાજો અને ગુણવત્તાયુક્ત માલ મેળવો',
      'કાપણી તારીખ, ક્વિન્ટલમાં જથ્થો, પાકની જાત અને જિલ્લા મુજબ ફિલ્ટર કરો',
      'ચકાસાયેલ ખેડૂતો સાથે સીધો ફોન અને વોટ્સએપ સંપર્ક',
    ],
    buyerBtn: 'ઉપલબ્ધ પાક જુઓ',
    bannerBadge: 'પારદર્શક અને સુરક્ષિત',
    bannerTitle: 'વાસ્તવિક ખેડૂતો અને વાસ્તવિક ખરીદદારોનું જોડાણ',
    bannerDesc: 'કોઈ નકલી દલાલ નહીં. દરેક લિસ્ટિંગ ચકાસાયેલ ખેડૂત પ્રોફાઇલ સાથે જોડાયેલું છે.',
  },
  bn: {
    badge: 'কৃষক থেকে সরাসরি ক্রেতা বাণিজ্য',
    title: 'আপনার ফসলকে সরাসরি বাজারের সুযোগের সাথে সংযুক্ত করুন।',
    desc: 'জমিতে ঘাম ঝরানোর পর ফসলের ন্যায্য মূল্য পাওয়া প্রতিটি কৃষকের অধিকার। KisaanBuddy মার্কেটপ্লেস আপনাকে সরাসরি পাইকারি ক্রেতাদের সাথে সংযুক্ত করে।',
    sellerTag: 'কৃষক ও বিক্রেতাদের জন্য',
    sellerTitle: 'ফসল বিক্রি ও সরঞ্জাম ভাড়া দিন',
    sellerDesc: 'আপনার উৎপাদিত ফসল বা ভাড়ার জন্য কৃষি যন্ত্রপাতি সহজে তালিকাভুক্ত করুন। ক্রেতারা সরাসরি আপনার সাথে যোগাযোগ করবেন।',
    sellerFeatures: [
      'যাচাইকৃত ক্রেতা, ব্যবসায়ী এবং FPO-এর কাছে সরাসরি ফসলের তথ্য পৌঁছান',
      'দালাল এবং অপ্রয়োজনীয় কমিশন ছাড়া ন্যায্য বাজারদর নির্ধারণ করুন',
      'ট্রাক্টর, রোটাভেটর এবং স্প্রেয়ার ভাড়া দেওয়ার সুবিধা',
    ],
    sellerBtn: 'মার্কেটপ্লেসে তালিকাভুক্ত করুন',
    buyerTag: 'ব্যবসায়ী ও FPO-এর জন্য',
    buyerTitle: 'সরাসরি জমি থেকে পাইকারি ক্রয়',
    buyerDesc: 'স্থানীয় কৃষকদের দ্বারা সরাসরি তালিকাভুক্ত তাজা ফসল খুঁজুন। পরিমাণ, জাত এবং জেলা অনুযায়ী ফিল্টার করে সরাসরি কিনুন।',
    buyerFeatures: [
      'ফসল কাটার সময় সরাসরি গ্রাম্য খামার থেকে তাজা ও মানসম্মত ফসল পান',
      'কাটার তারিখ, কুইন্টাল পরিমাণ, ফসলের জাত ও জেলা অনুযায়ী অনুসন্ধান করুন',
      'যাচাইকৃত কৃষকদের সাথে সরাসরি ফোন ও হোয়াটসঅ্যাপে যোগাযোগ',
    ],
    buyerBtn: 'উপলব্ধ ফসল দেখুন',
    bannerBadge: 'স্বচ্ছ ও নিরাপদ',
    bannerTitle: 'আসল কৃষক ও আসল ক্রেতাদের সংযোগ',
    bannerDesc: 'কোনো ভুয়ো দালাল নেই। প্রতিটি তালিকা যাচাইকৃত কৃষক প্রোফাইলের সাথে যুক্ত।',
  },
  pa: {
    badge: 'ਕਿਸਾਨ ਤੋਂ ਸਿੱਧਾ ਖਰੀਦਦਾਰ ਵਪਾਰ',
    title: 'ਆਪਣੀ ਫਸਲ ਨੂੰ ਸਿੱਧੇ ਬਾਜ਼ਾਰ ਦੇ ਮੌਕਿਆਂ ਨਾਲ ਜੋੜੋ।',
    desc: 'ਖੇਤ ਵਿੱਚ ਮਿਹਨਤ ਤੋਂ ਬਾਅਦ ਫਸਲ ਦਾ ਸਹੀ ਮੁੱਲ ਮਿਲਣਾ ਹਰ ਕਿਸਾਨ ਦਾ ਹੱਕ ਹੈ। KisaanBuddy ਮਾਰਕਿਟਪਲੇਸ ਤੁਹਾਨੂੰ ਸਿੱਧੇ ਥੋਕ ਖਰੀਦਦਾਰਾਂ ਨਾਲ ਜੋੜਦਾ ਹੈ।',
    sellerTag: 'ਕਿਸਾਨਾਂ ਅਤੇ ਵੇਚਣ ਵਾਲਿਆਂ ਲਈ',
    sellerTitle: 'ਉਪਜ ਵੇਚੋ ਅਤੇ ਸੰਦ ਕਿਰਾਏ ਤੇ ਦਿਓ',
    sellerDesc: 'ਆਪਣੀ ਕੱਟੀ ਹੋਈ ਫਸਲ ਜਾਂ ਕਿਰਾਏ ਦੇ ਖੇਤੀ ਸੰਦ ਆਸਾਨੀ ਨਾਲ ਲਿਸਟ ਕਰੋ। ਖਰੀਦਦਾਰ ਸਿੱਧੇ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨਗੇ।',
    sellerFeatures: [
      'ਤਸਦੀਕਸ਼ੁਦਾ ਖਰੀਦਦਾਰਾਂ, ਵਪਾਰੀਆਂ ਅਤੇ FPO ਤੱਕ ਆਪਣੀ ਫਸਲ ਦੀ ਜਾਣਕਾਰੀ ਪਹੁੰਚਾਓ',
      'ਵਿਚੋਲਿਆਂ ਅਤੇ ਬੇਲੋੜੇ ਕਮਿਸ਼ਨ ਤੋਂ ਬਿਨਾਂ ਵਾਜਬ ਭਾਅ ਤੈਅ ਕਰੋ',
      'ਟਰੈਕਟਰ, ਰੋਟਾਵੇਟਰ ਅਤੇ ਸਪਰੇਅਰ ਕਿਰਾਏ ਤੇ ਦੇਣ ਦੀ ਸਹੂਲਤ',
    ],
    sellerBtn: 'ਮਾਰਕਿਟਪਲੇਸ ਵਿੱਚ ਲਿਸਟ ਕਰੋ',
    buyerTag: 'ਵਪਾਰੀਆਂ ਅਤੇ FPO ਲਈ',
    buyerTitle: 'ਸਿੱਧੇ ਖੇਤਾਂ ਤੋਂ ਥੋਕ ਖਰੀਦ',
    buyerDesc: 'ਸਥਾਨਕ ਕਿਸਾਨਾਂ ਦੁਆਰਾ ਸੂਚੀਬੱਧ ਤਾਜ਼ੀ ਉਪਜ ਦੇਖੋ। ਮਾਤਰਾ, ਕਿਸਮ ਅਤੇ ਜ਼ਿਲ੍ਹੇ ਅਨੁਸਾਰ ਫਿਲਟਰ ਕਰਕੇ ਸਿੱਧਾ ਸੌਦਾ ਕਰੋ।',
    buyerFeatures: [
      'ਵਾਢੀ ਸਮੇਂ ਸਿੱਧੇ ਪਿੰਡਾਂ ਦੇ ਖੇਤਾਂ ਤੋਂ ਤਾਜ਼ੀ ਅਤੇ ਮਿਆਰੀ ਉਪਜ ਪ੍ਰਾਪਤ ਕਰੋ',
      'ਵਾਢੀ ਦੀ ਤਾਰੀਖ, ਕੁਇੰਟਲਾਂ ਵਿੱਚ ਮਾਤਰਾ, ਫਸਲ ਦੀ ਕਿਸਮ ਅਤੇ ਜ਼ਿਲ੍ਹੇ ਅਨੁਸਾਰ ਫਿਲਟਰ ਕਰੋ',
      'ਤਸਦੀਕਸ਼ੁਦਾ ਕਿਸਾਨਾਂ ਨਾਲ ਸਿੱਧਾ ਫੋਨ ਅਤੇ ਵਟਸਐਪ ਸੰਪਰਕ',
    ],
    buyerBtn: 'ਉਪਲਬਧ ਫਸਲਾਂ ਦੇਖੋ',
    bannerBadge: 'ਪਾਰਦਰਸ਼ੀ ਅਤੇ ਸੁਰੱਖਿਅਤ',
    bannerTitle: 'ਅਸਲ ਕਿਸਾਨਾਂ ਅਤੇ ਅਸਲ ਖਰੀਦਦਾਰਾਂ ਦਾ ਮੇਲ',
    bannerDesc: 'ਕੋਈ ਨਕਲੀ ਦਲਾਲ ਨਹੀਂ। ਹਰ ਲਿਸਟਿੰਗ ਪ੍ਰਮਾਣਿਤ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਨਾਲ ਜੁੜੀ ਹੋਈ ਹੈ।',
  },
  ml: {
    badge: 'കർഷകരിൽ നിന്ന് നേരിട്ടുള്ള കാർഷിക വ്യാപാരം',
    title: 'നിങ്ങളുടെ വിളവെടുപ്പിനെ നേരിട്ട് വിപണി അവസരങ്ങളുമായി ബന്ധിപ്പിക്കുക.',
    desc: 'പാടത്ത് വിയർപ്പൊഴുക്കിയ ശേഷം ഉൽപ്പന്നങ്ങൾക്ക് ന്യായവില ലഭിക്കുക എന്നത് ഓരോ കർഷകന്റെയും അവകാശമാണ്. KisaanBuddy മാർക്കറ്റ്പ്ലേസ് നിങ്ങളെ മൊത്തവ്യാപാരികളുമായി നേരിട്ട് ബന്ധിപ്പിക്കുന്നു.',
    sellerTag: 'കർഷകർക്കും വിൽപ്പനക്കാർക്കും',
    sellerTitle: 'വിളകൾ വിൽക്കുക, ഉപകരണങ്ങൾ വാടകയ്ക്ക് നൽകുക',
    sellerDesc: 'വിളവെടുത്ത ധാന്യങ്ങൾ, പച്ചക്കറികൾ, പഴങ്ങൾ എന്നിവയോ കാർഷിക ഉപകരണങ്ങളോ എളുപ്പത്തിൽ ലിസ്റ്റ് ചെയ്യുക. വ്യാപാരികൾ നിങ്ങളെ നേരിട്ട് വിളിക്കും.',
    sellerFeatures: [
      'സ്ഥിരീകരിച്ച വാങ്ങലുകാർ, പ്രാദേശിക വ്യാപാരികൾ, FPO-കൾ എന്നിവരിലേക്ക് വിളവിവരങ്ങൾ എത്തിക്കുക',
      'ഇടനിലക്കാരും അനാവശ്യ കമ്മീഷനുകളുമില്ലാതെ ന്യായമായ വിപണി നിരക്ക് ഉറപ്പാക്കുക',
      'ട്രാക്ടർ, റോട്ടാവേറ്റർ, സ്പ്രേയർ എന്നിവ വാടകയ്ക്ക് നൽകാനുള്ള സൗകര്യം',
    ],
    sellerBtn: 'മാർക്കറ്റ്പ്ലേസിൽ ലിസ്റ്റ് ചെയ്യുക',
    buyerTag: 'വ്യാപാരികൾക്കും FPO-കൾക്കും',
    buyerTitle: 'പാടങ്ങളിൽ നിന്ന് നേരിട്ട് മൊത്തമായി വാങ്ങുക',
    buyerDesc: 'കർഷകർ നേരിട്ട് നൽകുന്ന പുതിയ കാർഷിക ഉൽപ്പന്നങ്ങൾ കണ്ടെത്തുക. അളവ്, ഇനം, ജില്ല എന്നിവയനുസരിച്ച് ഫിൽട്ടർ ചെയ്യാം.',
    buyerFeatures: [
      'വിളവെടുപ്പ് സമയത്ത് നേരിട്ട് ഗ്രാമീണ ഫാമുകളിൽ നിന്ന് പുതിയ ഗുണനിലവാരമുള്ള ഉൽപ്പന്നങ്ങൾ',
      'വിളവെടുപ്പ് തീയതി, ക്വിന്റൽ അളവ്, വിള ഇനം, ജില്ല എന്നിവ അടിസ്ഥാനമാക്കി തെരഞ്ഞെടുക്കുക',
      'സ്ഥിരീകരിച്ച കർഷകരുമായി നേരിട്ടുള്ള ഫോൺ, വാട്ട്‌സ്ആപ്പ് ആശയവിനിമയം',
    ],
    buyerBtn: 'ലഭ്യമായ വിളകൾ കാണുക',
    bannerBadge: 'സുതാര്യവും സുരക്ഷിതവും',
    bannerTitle: 'യഥാർത്ഥ കർഷകരെ യഥാർത്ഥ വാങ്ങലുകാരുമായി ബന്ധിപ്പിക്കുന്നു',
    bannerDesc: 'വ്യാജ ഇടനിലക്കാരില്ല. എല്ലാ ലിസ്റ്റിംഗുകളും സ്ഥിരീകരിച്ച കർഷക പ്രൊഫൈലുകളുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു.',
  },
  hi_en: {
    badge: 'DIRECT AGRI TRADE',
    title: 'Apni Fasal ko Seedhe Market ke Maukon se Jodein.',
    desc: 'Khet me mehnat ke baad fasal ka sahi daam milna har kisaan ka haq hai. KisaanBuddy marketplace aapko seedhe wholesale buyers aur local kisaano se jodta hai.',
    sellerTag: 'FOR FARMERS & SELLERS',
    sellerTitle: 'Fasal Bechein & Equipment Rent Karein',
    sellerDesc: 'Apni harvested grains, vegetables ya agricultural machinery easily list karein. Verified buyers seedhe aapko phone karenge.',
    sellerFeatures: [
      'Verified buyers, local traders aur FPOs tak apni fasal ki details seedhe pahunchayein',
      'Bina middlemen commissions ke fair market rate decide karein',
      'Tractor, rotavator aur sprayers rent pe dene ki facility',
    ],
    sellerBtn: 'Marketplace me List Karein',
    buyerTag: 'FOR TRADERS & FPOs',
    buyerTitle: 'Seedhe Khet se Wholesale Kharidari',
    buyerDesc: 'Local kisaano dwara direct list ki gayi fresh produce dekhein. Quantity, variety aur location ke hisaab se filter karein.',
    buyerFeatures: [
      'Harvest ke time seedhe gaon ke kheton se fresh graded produce prapt karein',
      'Harvest date, quintals quantity, crop variety aur district ke hisaab se filter karein',
      'Verified farmers ke sath transparent phone aur WhatsApp contact',
    ],
    buyerBtn: 'Available Produce Dekhein',
    bannerBadge: 'Transparent & Verified',
    bannerTitle: 'Real Farmers ko Real Buyers se Jodna',
    bannerDesc: 'Koi fake broker nahi. Har listing verified farmer profile aur local harvest season se judi hoti hai.',
  },
};

export function MarketplaceSection() {
  const { lang } = useLanguage();
  const c = MARKET_I18N[lang] || MARKET_I18N.en;

  return (
    <section id="marketplace" className="py-16 sm:py-24 bg-background relative border-b border-border/60 overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute right-0 bottom-0 w-[500px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{c.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-foreground leading-[1.15]">
            {c.title}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {c.desc}
          </p>
        </div>

        {/* Dual Pathway Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-center mb-12">
          
          {/* Pathway 1: For Farmers (Sellers) */}
          <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    {c.sellerTag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    {c.sellerTitle}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                {c.sellerDesc}
              </p>

              <div className="space-y-3 pt-4 border-t border-border/50 mb-8">
                {c.sellerFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/85">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98]"
            >
              <span>{c.sellerBtn}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Pathway 2: For Buyers & Aggregators */}
          <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    {c.buyerTag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    {c.buyerTitle}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
                {c.buyerDesc}
              </p>

              <div className="space-y-3 pt-4 border-t border-border/50 mb-8">
                {c.buyerFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/85">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-bold text-sm shadow-xs transition-colors"
            >
              <span>{c.buyerBtn}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Real Authentic Photography Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-border shadow-lg">
          <img
            src="/images/marketplace/vegetable-mandi.jpg"
            alt="Farmers and traders weighing and trading freshly harvested vegetables at rural agricultural market"
            className="w-full h-56 sm:h-72 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-xl text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{c.bannerBadge}</span>
              </span>
              <h4 className="text-xl sm:text-2xl font-bold font-display leading-tight mb-2">
                {c.bannerTitle}
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {c.bannerDesc}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
