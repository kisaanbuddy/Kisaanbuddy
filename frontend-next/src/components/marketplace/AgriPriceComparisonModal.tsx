"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Scale,
  Award,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Loader2,
  Info,
} from "lucide-react";
import {
  AgriProductItem,
  AgriPriceComparisonResult,
  AgriPriceComparisonSection,
  agriProductsApi,
} from "@/lib/farmer-api";
import { useLanguage, type Lang } from "@/lib/language";

interface AgriPriceComparisonModalProps {
  product: AgriProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: AgriProductItem) => void;
}

const COMPARISON_I18N: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    lowestPriceTitle: string;
    lowestPriceSubtitle: string;
    bestValueTitle: string;
    bestValueSubtitle: string;
    alternativesTitle: string;
    alternativesSubtitle: string;
    productCol: string;
    brandCol: string;
    activeCol: string;
    formulationCol: string;
    packCol: string;
    priceCol: string;
    mrpCol: string;
    savingsCol: string;
    sellerCol: string;
    stockCol: string;
    loadingText: string;
    noDataText: string;
    closeBtn: string;
    disclaimerText: string;
    saveBadge: string;
    viewProductBtn: string;
  }
> = {
  en: {
    title: "Smart Price & Formulation Comparison",
    subtitle: "Compare identical active ingredients, approved formulations, and verified seller prices.",
    lowestPriceTitle: "A. Lowest Verified Price",
    lowestPriceSubtitle: "Lowest verified price among products with identical active ingredients.",
    bestValueTitle: "B. Best Value Formulation",
    bestValueSubtitle: "Evaluated on active concentration, formulation stability, brand credibility and delivery.",
    alternativesTitle: "C. Other Suitable Alternatives",
    alternativesSubtitle: "Other CIBRC/FCO approved products registered for the same crop and target condition.",
    productCol: "Product Name",
    brandCol: "Manufacturer & Brand",
    activeCol: "Active Ingredient",
    formulationCol: "Formulation",
    packCol: "Pack Size",
    priceCol: "Selling Price",
    mrpCol: "MRP",
    savingsCol: "Savings",
    sellerCol: "Seller Location",
    stockCol: "Availability",
    loadingText: "Analyzing verified market formulations and prices...",
    noDataText: "No directly comparable formulations found in our verified database.",
    closeBtn: "Close Comparison",
    disclaimerText: "Products are strictly matched by active chemical group, FCO schedule, or approved CIBRC crop label claim. Never substitute across mismatched chemical families without expert agronomy advice.",
    saveBadge: "Save",
    viewProductBtn: "Select & View",
  },
  hi: {
    title: "स्मार्ट मूल्य व दवा फॉर्मूलेशन तुलना",
    subtitle: "समान सक्रिय रासायनिक तत्व, प्रमाणित फॉर्मूलेशन और सत्यापित विक्रेता दरों की सीधी तुलना करें।",
    lowestPriceTitle: "क. सबसे कम सत्यापित मूल्य (Lowest Price)",
    lowestPriceSubtitle: "समान सक्रिय तत्व वाले उत्पादों में सबसे किफायती सत्यापित कीमत।",
    bestValueTitle: "ख. सर्वश्रेष्ठ मूल्य विकल्प (Best Value)",
    bestValueSubtitle: "सक्रिय सांद्रता, तकनीकी गुणवत्ता, ब्रांड विश्वसनीयता और आपूर्ति के आधार पर मूल्यांकित।",
    alternativesTitle: "ग. अन्य उपयुक्त स्वीकृत विकल्प (Other Alternatives)",
    alternativesSubtitle: "इसी फसल व बीमारी के लिए CIBRC / FCO द्वारा अनुशंसित अन्य उत्पाद।",
    productCol: "उत्पाद का नाम",
    brandCol: "निर्माता व ब्रांड",
    activeCol: "सक्रिय तत्व (Active Ingredient)",
    formulationCol: "फॉर्मूलेशन",
    packCol: "पैकिंग",
    priceCol: "विक्रय मूल्य",
    mrpCol: "अधिकतम खुदरा मूल्य (MRP)",
    savingsCol: "बचत",
    sellerCol: "विक्रेता व स्थान",
    stockCol: "उपलब्धता",
    loadingText: "सत्यापित बाजार दरों व फॉर्मूलेशन का विश्लेषण हो रहा है...",
    noDataText: "सत्यापित डेटाबेस में इस फॉर्मूलेशन के सीधे तुलनीय उत्पाद उपलब्ध नहीं हैं।",
    closeBtn: "तुलना बंद करें",
    disclaimerText: "उत्पादों की तुलना केवल रासायनिक संरचना और CIBRC/FCO स्वीकृत लेबल के आधार पर की जाती है। बिना कृषि विशेषज्ञ की सलाह के अलग श्रेणी की दवा का उपयोग न करें।",
    saveBadge: "बचत",
    viewProductBtn: "चुनें व विवरण देखें",
  },
  kn: {
    title: "ಸ್ಮಾರ್ಟ್ ಬೆಲೆ ಮತ್ತು ಸೂತ್ರೀಕರಣ ಹೋಲಿಕೆ",
    subtitle: "ಒಂದೇ ಸಕ್ರಿಯ ಅಂಶಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಮಾರಾಟಗಾರರ ದರಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ.",
    lowestPriceTitle: "ಎ. ಅತ್ಯಂತ ಕಡಿಮೆ ಪರಿಶೀಲಿಸಿದ ಬೆಲೆ",
    lowestPriceSubtitle: "ಒಂದೇ ಸಕ್ರಿಯ ಅಂಶ ಹೊಂದಿರುವ ಉತ್ಪನ್ನಗಳಲ್ಲಿ ಅತ್ಯಂತ ಕಡಿಮೆ ದರ.",
    bestValueTitle: "ಬಿ. ಅತ್ಯುತ್ತಮ ಮೌಲ್ಯದ ಆಯ್ಕೆ",
    bestValueSubtitle: "ಸಕ್ರಿಯ ಸಾಂದ್ರತೆ, ಬ್ರಾಂಡ್ ವಿಶ್ವಾಸಾರ್ಹತೆ ಮತ್ತು ಪೂರೈಕೆ ಆಧಾರಿತ ಮೌಲ್ಯಮಾಪನ.",
    alternativesTitle: "ಸಿ. ಇತರ ಸೂಕ್ತ ಪರ್ಯಾಯಗಳು",
    alternativesSubtitle: "ಇದೇ ಬೆಳೆ ಮತ್ತು ರೋಗಕ್ಕೆ ಅನುಮೋದಿಸಲಾದ ಇತರ ಉತ್ಪನ್ನಗಳು.",
    productCol: "ಉತ್ಪನ್ನದ ಹೆಸರು",
    brandCol: "ತಯಾರಕರು ಮತ್ತು ಬ್ರಾಂಡ್",
    activeCol: "ಸಕ್ರಿಯ ಅಂಶ",
    formulationCol: "ಸೂತ್ರೀಕರಣ",
    packCol: "ಪ್ಯಾಕ್ ಗಾತ್ರ",
    priceCol: "ಮಾರಾಟ ಬೆಲೆ",
    mrpCol: "ಗರಿಷ್ಠ ಮಾರಾಟ ಬೆಲೆ (MRP)",
    savingsCol: "ಉಳಿತಾಯ",
    sellerCol: "ಮಾರಾಟಗಾರರ ಸ್ಥಳ",
    stockCol: "ಲಭ್ಯತೆ",
    loadingText: "ಪರಿಶೀಲಿಸಿದ ಬೆಲೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    noDataText: "ನೇರವಾಗಿ ಹೋಲಿಸಬಹುದಾದ ಉತ್ಪನ್ನಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    closeBtn: "ಮುಚ್ಚಿರಿ",
    disclaimerText: "ಉತ್ಪನ್ನಗಳನ್ನು ಸಕ್ರಿಯ ರಾಸಾಯನಿಕ ಸೂತ್ರದ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ಹೋಲಿಸಲಾಗುತ್ತದೆ.",
    saveBadge: "ಉಳಿತಾಯ",
    viewProductBtn: "ವಿವರಗಳನ್ನು ನೋಡಿ",
  },
  ta: {
    title: "விலை மற்றும் உருவாக்க ஒப்பீடு",
    subtitle: "ஒரே செயலில் உள்ள பொருட்கள் மற்றும் சரிபார்க்கப்பட்ட விலைகளை ஒப்பிடுக.",
    lowestPriceTitle: "அ. குறைந்தபட்ச சரிபார்க்கப்பட்ட விலை",
    lowestPriceSubtitle: "ஒத்த செயலில் உள்ள பொருட்களில் மிகக் குறைந்த விலை.",
    bestValueTitle: "ஆ. சிறந்த மதிப்பு உருவாக்கம்",
    bestValueSubtitle: "செயலில் உள்ள செறிவு, தரம் மற்றும் விநியோகம் அடிப்படையில் மதிப்பிடப்பட்டது.",
    alternativesTitle: "இ. பிற பொருத்தமான மாற்று வழிகள்",
    alternativesSubtitle: "அதே பயிருக்கு அங்கீகரிக்கப்பட்ட பிற தயாரிப்புகள்.",
    productCol: "தயாரிப்பு பெயர்",
    brandCol: "உற்பத்தியாளர்",
    activeCol: "செயலில் உள்ள பொருள்",
    formulationCol: "வடிவம்",
    packCol: "அளவு",
    priceCol: "விற்பனை விலை",
    mrpCol: "அதிகபட்ச விலை",
    savingsCol: "சேமிப்பு",
    sellerCol: "விற்பனையாளர் இடம்",
    stockCol: "கிடைக்கும் நிலை",
    loadingText: "விலைகள் ஆராயப்படுகின்றன...",
    noDataText: "நேரடி ஒப்பீட்டு தயாரிப்புகள் கிடைக்கவில்லை.",
    closeBtn: "மூடு",
    disclaimerText: "வேளாண் நிபுணர் ஆலோசனையின்றி மருந்துகளை மாற்ற வேண்டாம்.",
    saveBadge: "சேமிப்பு",
    viewProductBtn: "தேர்ந்தெடு",
  },
  te: {
    title: "ధర & సూత్రీకరణ పోలిక",
    subtitle: "ఒకే క్రియాశీల రసాయన పదార్థాలు మరియు ధృవీకరించిన ధరలను సరిపోల్చండి.",
    lowestPriceTitle: "ఎ. అతి తక్కువ ధృవీకరించిన ధర",
    lowestPriceSubtitle: "ఒకే క్రియాశీల పదార్థం ఉన్న ఉత్పత్తులలో అతి తక్కువ ధర.",
    bestValueTitle: "బి. ఉత్తమ విలువ సూత్రీకరణ",
    bestValueSubtitle: "సాంద్రత, బ్రాండ్ నమ్మకం మరియు సరఫరా ఆధారంగా మూల్యాంకనం చేయబడింది.",
    alternativesTitle: "సి. ఇతర అనువైన ప్రత్యామ్నాయాలు",
    alternativesSubtitle: "అదే పంట మరియు తెగులుకు ఆమోదించబడిన ఇతర ఉత్పత్తులు.",
    productCol: "ఉత్పత్తి పేరు",
    brandCol: "తయారీదారు",
    activeCol: "క్రియాశీల పదార్థం",
    formulationCol: "ఫార్ములేషన్",
    packCol: "ప్యాకింగ్",
    priceCol: "అమ్మకపు ధర",
    mrpCol: "గరిష్ట రిటైల్ ధర",
    savingsCol: "ఆదా",
    sellerCol: "విక్రేత స్థానం",
    stockCol: "లభ్యత",
    loadingText: "విశ్లేషిస్తోంది...",
    noDataText: "పోల్చదగిన ఉత్పత్తులు కనుగొనబడలేదు.",
    closeBtn: "మూసివేయి",
    disclaimerText: "నిపుణుల సలహా లేకుండా మందులను మార్చవద్దు.",
    saveBadge: "ఆదా",
    viewProductBtn: "వివరాలు చూడండి",
  },
  ml: {
    title: "വിലയും ഘടനയും താരതമ്യം",
    subtitle: "സമാന ഘടകങ്ങളും പരിശോധിച്ച വിലകളും താരതമ്യം ചെയ്യുക.",
    lowestPriceTitle: "എ. ഏറ്റവും കുറഞ്ഞ നിരക്ക്",
    lowestPriceSubtitle: "ഒരേ ഘടകങ്ങളുള്ള ഉൽപ്പന്നങ്ങളിൽ ഏറ്റവും കുറഞ്ഞ വില.",
    bestValueTitle: "ബി. മികച്ച മൂല്യമുള്ള ഉൽപ്പന്നം",
    bestValueSubtitle: "ഗുണനിലവാരവും ബ്രാൻഡ് വിശ്വാസ്യതയും കണക്കിലെടുത്ത് വിലയിരുത്തിയത്.",
    alternativesTitle: "സി. മറ്റ് അനുയോജ്യമായ ബദലുകൾ",
    alternativesSubtitle: "ഇതേ വിളയ്ക്ക് അംഗീകരിച്ച മറ്റ് ഉൽപ്പന്നങ്ങൾ.",
    productCol: "ഉൽപ്പന്നത്തിന്റെ പേര്",
    brandCol: "നിർമ്മാതാവ്",
    activeCol: "സജീവ ഘടകം",
    formulationCol: "രൂപം",
    packCol: "പാക്കറ്റ്",
    priceCol: "വില്പന വില",
    mrpCol: "പരമാവധി വില",
    savingsCol: "ലാഭം",
    sellerCol: "സ്ഥലം",
    stockCol: "ലഭ്യത",
    loadingText: "പരിശോധിക്കുന്നു...",
    noDataText: "താരതമ്യപ്പെടുത്താവുന്ന ഉൽപ്പന്നങ്ങൾ ലഭ്യമല്ല.",
    closeBtn: "അടയ്ക്കുക",
    disclaimerText: "കാർഷിക വിദഗ്ദ്ധോപദേശം കൂടാതെ മരുന്നുകൾ മാറ്റരുത്.",
    saveBadge: "ലാഭം",
    viewProductBtn: "തിരഞ്ഞെടുക്കുക",
  },
  mr: {
    title: "किंमत आणि फॉर्म्युलेशन तुलना",
    subtitle: "समान सक्रिय घटक आणि प्रमाणित विक्रेता दरांची थेट तुलना करा.",
    lowestPriceTitle: "अ. सर्वात कमी सत्यापित किंमत",
    lowestPriceSubtitle: "समान सक्रिय घटक असलेल्या उत्पादनांमध्ये सर्वात कमी किंमत.",
    bestValueTitle: "ब. सर्वोत्तम मूल्य पर्याय",
    bestValueSubtitle: "सक्रिय प्रमाण, तांत्रिक दर्जा आणि विश्वासार्हतेवर आधारित.",
    alternativesTitle: "क. इतर योग्य पर्याय",
    alternativesSubtitle: "याच पिकासाठी शिफारस केलेले इतर पर्याय.",
    productCol: "उत्पादनाचे नाव",
    brandCol: "निर्माता आणि ब्रँड",
    activeCol: "सक्रिय घटक",
    formulationCol: "फॉर्म्युलेशन",
    packCol: "पॅक",
    priceCol: "विक्री किंमत",
    mrpCol: "कमाल किरकोळ किंमत (MRP)",
    savingsCol: "बचत",
    sellerCol: "विक्रेता स्थान",
    stockCol: "उपलब्धता",
    loadingText: "दर तपासत आहे...",
    noDataText: "तुलना करण्यायोग्य उत्पादने आढळली नाहीत.",
    closeBtn: "बंद करा",
    disclaimerText: "कृषी तज्ज्ञांच्या सल्ल्याशिवाय रासायनिक घटक बदलू नका.",
    saveBadge: "बचत",
    viewProductBtn: "निवडा व पहा",
  },
  bn: {
    title: "স্মার্ট মূল্য ও গঠন তুলনা",
    subtitle: "একই সক্রিয় রাসায়নিক উপাদান ও যাচাইকৃত মূল্যের তুলনা করুন।",
    lowestPriceTitle: "ক. সর্বনিম্ন যাচাইকৃত মূল্য",
    lowestPriceSubtitle: "একই সক্রিয় উপাদানযুক্ত পণ্যের মধ্যে সর্বনিম্ন যাচাইকৃত মূল্য।",
    bestValueTitle: "খ. সেরা মূল্যের বিকল্প",
    bestValueSubtitle: "সক্রিয় ঘনত্ব এবং ব্র্যান্ড নির্ভরযোগ্যতার ভিত্তিতে মূল্যায়িত।",
    alternativesTitle: "গ. অন্যান্য উপযুক্ত বিকল্প",
    alternativesSubtitle: "একই ফসলের জন্য অনুমোদিত অন্যান্য পণ্য।",
    productCol: "পণ্যের নাম",
    brandCol: "প্রস্তুতকারক ও ব্র্যান্ড",
    activeCol: "সক্রিয় উপাদান",
    formulationCol: "ফর্মুলেশন",
    packCol: "প্যাকের আকার",
    priceCol: "বিক্রয় মূল্য",
    mrpCol: "এমআরপি (MRP)",
    savingsCol: "সাশ্রয়",
    sellerCol: "বিক্রেতার অবস্থান",
    stockCol: "উপলব্ধতা",
    loadingText: "মূল্য বিশ্লেষণ করা হচ্ছে...",
    noDataText: "তুলনাযোগ্য পণ্য পাওয়া যায়নি।",
    closeBtn: "বন্ধ করুন",
    disclaimerText: "বিশেষজ্ঞের পরামর্শ ছাড়া রাসায়নিক পণ্য পরিবর্তন করবেন না।",
    saveBadge: "সাশ্রয়",
    viewProductBtn: "নির্বাচন করুন",
  },
  pa: {
    title: "ਸਮਾਰਟ ਕੀਮਤ ਅਤੇ ਫਾਰਮੂਲੇਸ਼ਨ ਤੁਲਨਾ",
    subtitle: "ਇੱਕੋ ਜਿਹੇ ਕਿਰਿਆਸ਼ੀਲ ਤੱਤਾਂ ਅਤੇ ਤਸਦੀਕਸ਼ੁਦਾ ਕੀਮਤਾਂ ਦੀ ਤੁਲਨਾ ਕਰੋ।",
    lowestPriceTitle: "ੳ. ਸਭ ਤੋਂ ਘੱਟ ਤਸਦੀਕਸ਼ੁਦਾ ਕੀਮਤ",
    lowestPriceSubtitle: "ਇੱਕੋ ਜਿਹੇ ਤੱਤ ਵਾਲੇ ਉਤਪਾਦਾਂ ਵਿੱਚੋਂ ਸਭ ਤੋਂ ਘੱਟ ਕੀਮਤ।",
    bestValueTitle: "ਅ. ਸਰਬੋਤਮ ਮੁੱਲ ਵਿਕਲਪ",
    bestValueSubtitle: "ਕਿਰਿਆਸ਼ੀਲ ਤੱਤ ਦੀ ਮਾਤਰਾ ਅਤੇ ਭਰੋਸੇਯੋਗਤਾ ਦੇ ਆਧਾਰ 'ਤੇ।",
    alternativesTitle: "ੲ. ਹੋਰ ਢੁਕਵੇਂ ਵਿਕਲਪ",
    alternativesSubtitle: "ਇਸੇ ਫ਼ਸਲ ਲਈ ਪ੍ਰਵਾਨਿਤ ਹੋਰ ਉਤਪਾਦ।",
    productCol: "ਉਤਪਾਦ ਦਾ ਨਾਮ",
    brandCol: "ਨਿਰਮਾਤਾ ਅਤੇ ਬ੍ਰਾਂਡ",
    activeCol: "ਕਿਰਿਆਸ਼ੀਲ ਤੱਤ",
    formulationCol: "ਫਾਰਮੂਲੇਸ਼ਨ",
    packCol: "ਪੈਕ ਦਾ ਆਕਾਰ",
    priceCol: "ਵਿਕਰੀ ਮੁੱਲ",
    mrpCol: "ਐਮ.ਆਰ.ਪੀ. (MRP)",
    savingsCol: "ਬਚਤ",
    sellerCol: "ਵਿਕਰੇਤਾ ਦੀ ਥਾਂ",
    stockCol: "ਉਪਲਬਧਤਾ",
    loadingText: "ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...",
    noDataText: "ਕੋਈ ਤੁਲਨਾਤਮਕ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ।",
    closeBtn: "ਬੰਦ ਕਰੋ",
    disclaimerText: "ਖੇਤੀ ਮਾਹਿਰ ਦੀ ਸਲਾਹ ਤੋਂ ਬਿਨਾਂ ਦਵਾਈ ਨਾ ਬਦਲੋ।",
    saveBadge: "ਬਚਤ",
    viewProductBtn: "ਵੇਖੋ",
  },
  gu: {
    title: "સ્માર્ટ કિંમત અને ફોર્મ્યુલેશન સરખામણી",
    subtitle: "સમાન સક્રિય ઘટકો અને ચકાસાયેલ ભાવોની સીધી સરખામણી કરો.",
    lowestPriceTitle: "અ. સૌથી ઓછી ચકાસાયેલ કિંમત",
    lowestPriceSubtitle: "સમાન સક્રિય ઘટક ધરાવતા ઉત્પાદનોમાં સૌથી ઓછી કિંમત.",
    bestValueTitle: "બ. શ્રેષ્ઠ મૂલ્ય વિકલ્પ",
    bestValueSubtitle: "ગુણવત્તા, બ્રાન્ડ વિશ્વસનીયતા અને સપ્લાય આધારિત મૂલ્યાંકન.",
    alternativesTitle: "ક. અન્ય યોગ્ય વિકલ્પો",
    alternativesSubtitle: "આ જ પાક માટે મંજૂર અન્ય વિકલ્પો.",
    productCol: "ઉત્પાદન નામ",
    brandCol: "ઉત્પાદક અને બ્રાન્ડ",
    activeCol: "સક્રિય ઘટક",
    formulationCol: "ફોર્મ્યુલેશન",
    packCol: "પેકિંગ",
    priceCol: "વેચાણ કિંમત",
    mrpCol: "એમઆરપી (MRP)",
    savingsCol: "બચત",
    sellerCol: "વિક્રેતા સ્થળ",
    stockCol: "ઉપલબ્ધતા",
    loadingText: "ભાવોની તપાસ ચાલુ છે...",
    noDataText: "સરખામણી કરવા યોગ્ય ઉત્પાદનો મળ્યા નથી.",
    closeBtn: "બંધ કરો",
    disclaimerText: "નિષ્ણાત સલાહ વગર રાસાયણિક દવામાં ફેરફાર ન કરો.",
    saveBadge: "બચત",
    viewProductBtn: "પસંદ કરો",
  },
  hi_en: {
    title: "Smart Price & Formulation Comparison",
    subtitle: "Compare identical active ingredients, approved formulations, and verified seller prices.",
    lowestPriceTitle: "A. Lowest Verified Price",
    lowestPriceSubtitle: "Lowest verified price among products with identical active ingredients.",
    bestValueTitle: "B. Best Value Formulation",
    bestValueSubtitle: "Evaluated on active concentration, formulation stability, brand credibility and delivery.",
    alternativesTitle: "C. Other Suitable Alternatives",
    alternativesSubtitle: "Other CIBRC/FCO approved products registered for the same crop and target condition.",
    productCol: "Product Name",
    brandCol: "Manufacturer & Brand",
    activeCol: "Active Ingredient",
    formulationCol: "Formulation",
    packCol: "Pack Size",
    priceCol: "Selling Price",
    mrpCol: "MRP",
    savingsCol: "Savings",
    sellerCol: "Seller Location",
    stockCol: "Availability",
    loadingText: "Analyzing verified market formulations and prices...",
    noDataText: "No directly comparable formulations found in our verified database.",
    closeBtn: "Close Comparison",
    disclaimerText: "Products are strictly matched by active chemical group, FCO schedule, or approved CIBRC crop label claim. Never substitute across mismatched chemical families without expert agronomy advice.",
    saveBadge: "Save",
    viewProductBtn: "Select & View",
  },
};

export function AgriPriceComparisonModal({
  product,
  isOpen,
  onClose,
  onSelectProduct,
}: AgriPriceComparisonModalProps) {
  const { lang } = useLanguage();
  const t = COMPARISON_I18N[lang] || COMPARISON_I18N.en;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AgriPriceComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !product) return;
    setLoading(true);
    setError(null);

    agriProductsApi
      .comparePrices({
        product_id: product.id,
        category: product.category,
        active_ingredient: product.active_ingredient,
        crop: product.target_crops[0],
      })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch price comparison");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6">
        {/* Top Gradient Banner */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

        {/* Modal Header (NO LANGUAGE SELECTOR) */}
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                <Scale className="h-4.5 w-4.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                {product.category.replace(/_/g, " ")}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
              {t.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              {t.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
            aria-label="Close comparison"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Target Product Reference Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Selected Reference Product:
              </span>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 mt-0.5">
                {product.name}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {product.manufacturer} ({product.brand}) •{" "}
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {product.active_ingredient}
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">
                ₹{product.selling_price.toFixed(2)}
              </span>
              <span className="text-xs text-stone-500 block">
                / {product.pack_size}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                {t.loadingText}
              </p>
            </div>
          )}

          {/* Comparison Sections */}
          {!loading && data && (
            <div className="space-y-6">
              {/* SECTION A: LOWEST PRICE */}
              {data.lowest_price && (
                <div className="p-5 rounded-3xl border-2 border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
                        <TrendingDown className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                          {t.lowestPriceTitle}
                        </h4>
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                          {t.lowestPriceSubtitle}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
                      {data.lowest_price.badge_label}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <h5 className="text-base font-black text-stone-900 dark:text-stone-100">
                        {data.lowest_price.product.name}
                      </h5>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        {data.lowest_price.product.manufacturer} •{" "}
                        <span className="font-semibold">{data.lowest_price.product.active_ingredient}</span>
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-stone-400" />
                        <span>
                          {data.lowest_price.product.seller_name} ({data.lowest_price.product.seller_location})
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                          ₹{data.lowest_price.product.selling_price.toFixed(2)}
                        </span>
                        <span className="text-xs text-stone-500">
                          / {data.lowest_price.product.pack_size}
                        </span>
                      </div>
                      {data.lowest_price.savings_vs_mrp ? (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {t.saveBadge} ₹{data.lowest_price.savings_vs_mrp.toFixed(2)} off MRP
                        </span>
                      ) : null}
                      {onSelectProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectProduct(data.lowest_price!.product);
                          }}
                          className="mt-2 h-8 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
                        >
                          {t.viewProductBtn}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200">
                    <strong>Reason:</strong> {data.lowest_price.reason}
                  </div>
                </div>
              )}

              {/* SECTION B: BEST VALUE */}
              {data.best_value && (
                <div className="p-5 rounded-3xl border-2 border-teal-500/40 bg-teal-50/40 dark:bg-teal-950/20 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs shadow-xs">
                        <Award className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-teal-950 dark:text-teal-100">
                          {t.bestValueTitle}
                        </h4>
                        <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80">
                          {t.bestValueSubtitle}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-bold text-xs shadow-xs">
                      {data.best_value.badge_label}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <h5 className="text-base font-black text-stone-900 dark:text-stone-100">
                        {data.best_value.product.name}
                      </h5>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        {data.best_value.product.manufacturer} •{" "}
                        <span className="font-semibold">{data.best_value.product.active_ingredient}</span>
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-stone-400" />
                        <span>
                          {data.best_value.product.seller_name} ({data.best_value.product.seller_location})
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-teal-700 dark:text-teal-400">
                          ₹{data.best_value.product.selling_price.toFixed(2)}
                        </span>
                        <span className="text-xs text-stone-500">
                          / {data.best_value.product.pack_size}
                        </span>
                      </div>
                      {data.best_value.savings_vs_mrp ? (
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                          {t.saveBadge} ₹{data.best_value.savings_vs_mrp.toFixed(2)} off MRP
                        </span>
                      ) : null}
                      {onSelectProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectProduct(data.best_value!.product);
                          }}
                          className="mt-2 h-8 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition"
                        >
                          {t.viewProductBtn}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-teal-500/20 text-xs text-teal-950 dark:text-teal-200">
                    <strong>Reason:</strong> {data.best_value.reason}
                  </div>
                </div>
              )}

              {/* SECTION C: OTHER SUITABLE ALTERNATIVES */}
              {data.alternatives && data.alternatives.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100">
                      {t.alternativesTitle}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {t.alternativesSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.alternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] uppercase font-bold text-stone-500">
                              {alt.product.brand}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                              {alt.badge_label}
                            </span>
                          </div>
                          <h5 className="text-sm font-black text-stone-900 dark:text-stone-100">
                            {alt.product.name}
                          </h5>
                          <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                            {alt.product.active_ingredient}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                            {alt.reason}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between">
                          <span className="text-sm font-black text-stone-900 dark:text-stone-100">
                            ₹{alt.product.selling_price.toFixed(2)}{" "}
                            <span className="text-[10px] font-normal text-stone-500">
                              / {alt.product.pack_size}
                            </span>
                          </span>
                          {onSelectProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectProduct(alt.product);
                              }}
                              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                            >
                              {t.viewProductBtn} →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-Side Specifications Comparison Table */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Detailed Side-by-Side Technical Comparison
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-700">
                        <th className="p-3">{t.productCol}</th>
                        <th className="p-3">{t.activeCol}</th>
                        <th className="p-3">{t.formulationCol}</th>
                        <th className="p-3">{t.packCol}</th>
                        <th className="p-3">{t.priceCol}</th>
                        <th className="p-3">{t.mrpCol}</th>
                        <th className="p-3">{t.sellerCol}</th>
                        <th className="p-3">{t.stockCol}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                      {/* Target Product */}
                      <tr className="bg-emerald-50/30 dark:bg-emerald-950/20 font-medium">
                        <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                          {product.name} (Selected)
                        </td>
                        <td className="p-3 text-stone-700 dark:text-stone-300">{product.active_ingredient}</td>
                        <td className="p-3 text-stone-700 dark:text-stone-300">{product.formulation}</td>
                        <td className="p-3 text-stone-700 dark:text-stone-300">{product.pack_size}</td>
                        <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                          ₹{product.selling_price.toFixed(2)}
                        </td>
                        <td className="p-3 text-stone-400 line-through">₹{product.mrp.toFixed(2)}</td>
                        <td className="p-3 text-stone-600 dark:text-stone-400">{product.seller_location}</td>
                        <td className="p-3 capitalize font-semibold text-emerald-700">
                          {product.stock_status.replace(/_/g, " ")}
                        </td>
                      </tr>

                      {/* Lowest Price Item */}
                      {data.lowest_price && data.lowest_price.product.id !== product.id && (
                        <tr>
                          <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                            {data.lowest_price.product.name} (Lowest)
                          </td>
                          <td className="p-3 text-stone-700 dark:text-stone-300">
                            {data.lowest_price.product.active_ingredient}
                          </td>
                          <td className="p-3 text-stone-700 dark:text-stone-300">
                            {data.lowest_price.product.formulation}
                          </td>
                          <td className="p-3 text-stone-700 dark:text-stone-300">
                            {data.lowest_price.product.pack_size}
                          </td>
                          <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                            ₹{data.lowest_price.product.selling_price.toFixed(2)}
                          </td>
                          <td className="p-3 text-stone-400 line-through">
                            ₹{data.lowest_price.product.mrp.toFixed(2)}
                          </td>
                          <td className="p-3 text-stone-600 dark:text-stone-400">
                            {data.lowest_price.product.seller_location}
                          </td>
                          <td className="p-3 capitalize font-semibold text-emerald-700">
                            {data.lowest_price.product.stock_status.replace(/_/g, " ")}
                          </td>
                        </tr>
                      )}

                      {/* Best Value Item */}
                      {data.best_value && data.best_value.product.id !== product.id && (
                        <tr>
                          <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                            {data.best_value.product.name} (Best Value)
                          </td>
                          <td className="p-3 text-stone-700 dark:text-stone-300">
                            {data.best_value.product.active_ingredient}
                          </td>
                          <td className="p-3 text-stone-700 dark:text-stone-300">
                            {data.best_value.product.formulation}
                          </td>
                          <td className="p-3 text-stone-700 dark:text-stone-300">
                            {data.best_value.product.pack_size}
                          </td>
                          <td className="p-3 font-bold text-teal-700 dark:text-teal-400">
                            ₹{data.best_value.product.selling_price.toFixed(2)}
                          </td>
                          <td className="p-3 text-stone-400 line-through">
                            ₹{data.best_value.product.mrp.toFixed(2)}
                          </td>
                          <td className="p-3 text-stone-600 dark:text-stone-400">
                            {data.best_value.product.seller_location}
                          </td>
                          <td className="p-3 capitalize font-semibold text-emerald-700">
                            {data.best_value.product.stock_status.replace(/_/g, " ")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed flex items-start gap-2">
                <Info className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                <span>{t.disclaimerText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm transition"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
