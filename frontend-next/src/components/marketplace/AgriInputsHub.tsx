"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Phone,
  MessageSquare,
  Building2,
  MapPin,
  Loader2,
  RotateCcw,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Check,
  ChevronDown,
  Info,
  Bug,
  Leaf,
  Store,
  Truck,
} from "lucide-react";
import {
  AgriProductItem,
  AgriProductCategoryItem,
  agriProductsApi,
} from "@/lib/farmer-api";
import { useLanguage, type Lang } from "@/lib/language";
import { AgriProductDetailModal } from "./AgriProductDetailModal";
import { AgriPriceComparisonModal } from "./AgriPriceComparisonModal";

export interface AgriInputsHubProps {
  onContactProduct?: (product: AgriProductItem) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const COMMON_CROPS = [
  "All",
  "Wheat",
  "Rice",
  "Tomato",
  "Potato",
  "Cotton",
  "Chilli",
  "Maize",
  "Soybean",
  "Mustard",
  "Sugarcane",
  "Onion",
  "Gram",
];

const COMMON_DISEASES = [
  "All",
  "Yellow Rust",
  "Blast",
  "Blight",
  "Whitefly",
  "Aphids",
  "Powdery Mildew",
  "Tikka",
  "Stem Borer",
  "Helicoverpa",
];

const HUB_I18N: Record<
  Lang,
  {
    hubTitle: string;
    hubSubtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    filterBtn: string;
    clearFilters: string;
    cropFilter: string;
    diseaseFilter: string;
    brandFilter: string;
    priceFilter: string;
    stateFilter: string;
    availabilityFilter: string;
    compareBtn: string;
    viewBtn: string;
    buyBtn: string;
    saveTag: string;
    verifiedInputBadge: string;
    noProductsTitle: string;
    noProductsSubtitle: string;
    showingResults: string;
    activeFiltersLabel: string;
    sortRelevance: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    sortNewest: string;
    fromDiagnosisBadge: string;
    fromSoilBadge: string;
  }
> = {
  en: {
    hubTitle: "Farm Inputs & Crop Care Market",
    hubSubtitle: "CIBRC-registered plant protection, FCO fertilizers, certified seeds & micronutrients from authorized suppliers.",
    searchPlaceholder: "Search by crop, disease, chemical name, or brand...",
    allCategories: "All Categories",
    filterBtn: "Filters",
    clearFilters: "Clear All",
    cropFilter: "Crop",
    diseaseFilter: "Target Disease / Pest",
    brandFilter: "Manufacturer & Brand",
    priceFilter: "Price Range",
    stateFilter: "State & District",
    availabilityFilter: "Availability",
    compareBtn: "Compare Prices",
    viewBtn: "View Details",
    buyBtn: "Contact / Buy",
    saveTag: "Save",
    verifiedInputBadge: "Verified Product",
    noProductsTitle: "No matching products found",
    noProductsSubtitle: "Try adjusting your crop, disease, or category filters to explore comparable alternatives.",
    showingResults: "verified products found",
    activeFiltersLabel: "Active Filters:",
    sortRelevance: "Relevance",
    sortPriceLow: "Price: Low to High",
    sortPriceHigh: "Price: High to Low",
    sortNewest: "Recently Verified",
    fromDiagnosisBadge: "Crop Doctor Matched Solution",
    fromSoilBadge: "Soil Health Matched Fertilizer",
  },
  hi: {
    hubTitle: "कृषि आदान, खाद व फसल सुरक्षा बाजार",
    hubSubtitle: "CIBRC पंजीकृत कीटनाशक, FCO प्रमाणित उर्वरक, बीज व सूक्ष्म पोषक तत्व सीधे सत्यापित विक्रेताओं से।",
    searchPlaceholder: "फसल, बीमारी, दवा के तत्व या ब्रांड से खोजें...",
    allCategories: "सभी श्रेणियां",
    filterBtn: "फिल्टर",
    clearFilters: "सभी हटाएं",
    cropFilter: "फसल",
    diseaseFilter: "लक्षित बीमारी / कीट",
    brandFilter: "निर्माता व ब्रांड",
    priceFilter: "मूल्य सीमा",
    stateFilter: "राज्य व जिला",
    availabilityFilter: "उपलब्धता",
    compareBtn: "कीमत तुलना",
    viewBtn: "विवरण देखें",
    buyBtn: "संपर्क / खरीदें",
    saveTag: "बचत",
    verifiedInputBadge: "प्रमाणित उत्पाद",
    noProductsTitle: "कोई उत्पाद नहीं मिला",
    noProductsSubtitle: "कृपया फसल, बीमारी या श्रेणी फिल्टर बदलकर अन्य स्वीकृत विकल्प देखें।",
    showingResults: "प्रमाणित उत्पाद उपलब्ध हैं",
    activeFiltersLabel: "सक्रिय फिल्टर:",
    sortRelevance: "प्रासंगिकता",
    sortPriceLow: "कीमत: कम से अधिक",
    sortPriceHigh: "कीमत: अधिक से कम",
    sortNewest: "हाल ही में सत्यापित",
    fromDiagnosisBadge: "फसल डॉक्टर द्वारा अनुशंसित समाधान",
    fromSoilBadge: "मृदा जांच द्वारा अनुशंसित उर्वरक",
  },
  kn: {
    hubTitle: "ಕೃಷಿ ಪರಿಕರಗಳು ಮತ್ತು ಬೆಳೆ ಸಂರಕ್ಷಣಾ ಮಾರುಕಟ್ಟೆ",
    hubSubtitle: "ಪರಿಶೀಲಿಸಿದ ರಸಗೊಬ್ಬರಗಳು, ಕೀಟನಾಶಕಗಳು ಮತ್ತು ಬೀಜಗಳು.",
    searchPlaceholder: "ಬೆಳೆ, ರೋಗ ಅಥವಾ ರಾಸಾಯನಿಕ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ...",
    allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
    filterBtn: "ಫಿಲ್ಟರ್‌ಗಳು",
    clearFilters: "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ",
    cropFilter: "ಬೆಳೆ",
    diseaseFilter: "ರೋಗ / ಕೀಟ",
    brandFilter: "ಬ್ರಾಂಡ್",
    priceFilter: "ಬೆಲೆ ವ್ಯಾಪ್ತಿ",
    stateFilter: "ರಾಜ್ಯ ಮತ್ತು ಜಿಲ್ಲೆ",
    availabilityFilter: "ಲಭ್ಯತೆ",
    compareBtn: "ಬೆಲೆ ಹೋಲಿಕೆ",
    viewBtn: "ವಿವರಗಳನ್ನು ನೋಡಿ",
    buyBtn: "ಸಂಪರ್ಕಿಸಿ",
    saveTag: "ಉಳಿತಾಯ",
    verifiedInputBadge: "ಪರಿಶೀಲಿಸಿದ ಉತ್ಪನ್ನ",
    noProductsTitle: "ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    noProductsSubtitle: "ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    showingResults: "ಉತ್ಪನ್ನಗಳು ಲಭ್ಯವಿದೆ",
    activeFiltersLabel: "ಸಕ್ರಿಯ ಫಿಲ್ಟರ್‌ಗಳು:",
    sortRelevance: "ಹೆಚ್ಚು ಸೂಕ್ತ",
    sortPriceLow: "ಬೆಲೆ: ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚು",
    sortPriceHigh: "ಬೆಲೆ: ಹೆಚ್ಚಿಂದ ಕಡಿಮೆ",
    sortNewest: "ಇತ್ತೀಚಿನದು",
    fromDiagnosisBadge: "ಬೆಳೆ ವೈದ್ಯ ಶಿಫಾರಸು",
    fromSoilBadge: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಶಿಫಾರಸು",
  },
  ta: {
    hubTitle: "வேளாண் உள்ளீடுகள் மற்றும் பயிர் பராமரிப்பு சந்தை",
    hubSubtitle: "அங்கீகரிக்கப்பட்ட உரங்கள், பூச்சிக்கொல்லிகள் மற்றும் சான்றளிக்கப்பட்ட விதைகள்.",
    searchPlaceholder: "பயிர், நோய் அல்லது பிராண்ட் மூலம் தேடவும்...",
    allCategories: "அனைத்து பிரிவுகள்",
    filterBtn: "வடிகட்டிகள்",
    clearFilters: "அனைத்தையும் அழி",
    cropFilter: "பயிர்",
    diseaseFilter: "இலக்கு நோய் / பூச்சி",
    brandFilter: "பிராண்ட்",
    priceFilter: "விலை வரம்பு",
    stateFilter: "மாநிலம்",
    availabilityFilter: "கிடைக்கும் நிலை",
    compareBtn: "விலை ஒப்பீடு",
    viewBtn: "விவரங்களை பார்க்க",
    buyBtn: "தொடர்பு கொள்ள",
    saveTag: "சேமிப்பு",
    verifiedInputBadge: "சரிபார்க்கப்பட்ட தயாரிப்பு",
    noProductsTitle: "தயாரிப்புகள் எதுவும் கிடைக்கவில்லை",
    noProductsSubtitle: "வடிகட்டிகளை மாற்றி மீண்டும் முயற்சிக்கவும்.",
    showingResults: "தயாரிப்புகள் உள்ளன",
    activeFiltersLabel: "செயலில் உள்ள வடிகட்டிகள்:",
    sortRelevance: "பொருத்தமானது",
    sortPriceLow: "விலை: குறைவு முதல் அதிகம்",
    sortPriceHigh: "விலை: அதிகம் முதல் குறைவு",
    sortNewest: "சமீபத்தியது",
    fromDiagnosisBadge: "பயிர் மருத்துவர் பரிந்துரை",
    fromSoilBadge: "மண் பரிசோதனை பரிந்துரை",
  },
  te: {
    hubTitle: "వ్యవసాయ ఉత్పాదకాలు మరియు పంట సంరక్షణ మార్కెట్",
    hubSubtitle: "ధృవీకరించబడిన ఎరువులు, పురుగుమందులు మరియు విత్తనాలు.",
    searchPlaceholder: "పంట, తెగులు లేదా రసాయన పేరుతో వెతకండి...",
    allCategories: "అన్ని వర్గాలు",
    filterBtn: "ఫిల్టర్లు",
    clearFilters: "అన్నీ తొలగించు",
    cropFilter: "పంట",
    diseaseFilter: "లక్ష్య వ్యాధి / తెగులు",
    brandFilter: "బ్రాండ్",
    priceFilter: "ధర పరిధి",
    stateFilter: "రాష్ట్రం",
    availabilityFilter: "లభ్యత",
    compareBtn: "ధర పోలిక",
    viewBtn: "వివరాలు చూడండి",
    buyBtn: "కొనుగోలు",
    saveTag: "ఆదా",
    verifiedInputBadge: "ధృవీకరించిన ఉత్పత్తి",
    noProductsTitle: "ఉత్పత్తులు కనుగొనబడలేదు",
    noProductsSubtitle: "ఫిల్టర్లను మార్చండి.",
    showingResults: "ఉత్పత్తులు అందుబాటులో ఉన్నాయి",
    activeFiltersLabel: "క్రియాశీల ఫిల్టర్లు:",
    sortRelevance: "ప్రాముఖ్యత",
    sortPriceLow: "ధర: తక్కువ నుండి ఎక్కువ",
    sortPriceHigh: "ధర: ఎక్కువ నుండి తక్కువ",
    sortNewest: "ఇటీవలి",
    fromDiagnosisBadge: "పంట డాక్టర్ సిఫార్సు",
    fromSoilBadge: "నేల పరీక్ష సిఫార్సు",
  },
  ml: {
    hubTitle: "കാർഷിക ഉൽപ്പന്നങ്ങളും വിള സംരക്ഷണ വിപണിയും",
    hubSubtitle: "പരിശോധിച്ച വളങ്ങളും കീടനാശിനികളും വിത്തുകളും.",
    searchPlaceholder: "വിള, രോഗം അല്ലെങ്കിൽ ബ്രാൻഡ് പ്രകാരം തിരയുക...",
    allCategories: "എല്ലാ വിഭാഗങ്ങളും",
    filterBtn: "ഫിൽട്ടറുകൾ",
    clearFilters: "മായ്ക്കുക",
    cropFilter: "വിള",
    diseaseFilter: "രോഗം / കീടങ്ങൾ",
    brandFilter: "ബ്രാൻഡ്",
    priceFilter: "വില പരിധി",
    stateFilter: "സംസ്ഥാനം",
    availabilityFilter: "ലഭ്യത",
    compareBtn: "വില താരതമ്യം",
    viewBtn: "വിശദാംശങ്ങൾ കാണുക",
    buyBtn: "ബന്ധപ്പെടുക",
    saveTag: "ലാഭം",
    verifiedInputBadge: "പരിശോധിച്ച ഉൽപ്പന്നം",
    noProductsTitle: "ഉൽപ്പന്നങ്ങളൊന്നും കണ്ടെത്തിയില്ല",
    noProductsSubtitle: "ഫിൽട്ടറുകൾ മാറ്റി വീണ്ടും ശ്രമിക്കുക.",
    showingResults: "ഉൽപ്പന്നങ്ങൾ ലഭ്യമാണ്",
    activeFiltersLabel: "സജീവ ഫിൽട്ടറുകൾ:",
    sortRelevance: "പൊരുത്തം",
    sortPriceLow: "വില: കുറഞ്ഞത് മുതൽ കൂടുതൽ വരെ",
    sortPriceHigh: "വില: കൂടുതൽ മുതൽ കുറഞ്ഞത് വരെ",
    sortNewest: "ഏറ്റവും പുതിയത്",
    fromDiagnosisBadge: "വിള ഡോക്ടർ ശുപാർശ",
    fromSoilBadge: "മണ്ണ് പരിശോധനാ ശുപാർശ",
  },
  mr: {
    hubTitle: "कृषी निविष्ठा आणि पीक संरक्षण बाजार",
    hubSubtitle: "प्रमाणित खते, कीटकनाशके आणि बियाणे थेट अधिकृत पुरवठादारांकडून.",
    searchPlaceholder: "पीक, रोग किंवा रासायनिक घटकांनुसार शोधा...",
    allCategories: "सर्व प्रवर्ग",
    filterBtn: "फिल्टर",
    clearFilters: "सर्व काढा",
    cropFilter: "पीक",
    diseaseFilter: "लक्षित रोग / कीड",
    brandFilter: "ब्रँड",
    priceFilter: "किंमत मर्यादा",
    stateFilter: "राज्य व जिल्हा",
    availabilityFilter: "उपलब्धता",
    compareBtn: "किंमत तुलना",
    viewBtn: "तपशील पहा",
    buyBtn: "खरेदी / संपर्क",
    saveTag: "बचत",
    verifiedInputBadge: "प्रमाणित उत्पादन",
    noProductsTitle: "कोणतेही उत्पादन आढळले नाही",
    noProductsSubtitle: "कृपया फिल्टर बदलून इतर पर्याय पहा.",
    showingResults: "प्रमाणित उत्पादने उपलब्ध",
    activeFiltersLabel: "सक्रिय फिल्टर:",
    sortRelevance: "सुसंगतता",
    sortPriceLow: "किंमत: कमी ते जास्त",
    sortPriceHigh: "किंमत: जास्त ते कमी",
    sortNewest: "नुकतेच तपासलेले",
    fromDiagnosisBadge: "पीक डॉक्टर शिफारस",
    fromSoilBadge: "माती परीक्षण शिफारस",
  },
  bn: {
    hubTitle: "কৃষি উপকরণ ও ফসল সুরক্ষা বাজার",
    hubSubtitle: "যাচাইকৃত সার, কীটনাশক மற்றும் প্রত্যয়িত বীজ。",
    searchPlaceholder: "ফসল, রোগ বা ব্র্যান্ড দিয়ে অনুসন্ধান করুন...",
    allCategories: "সব বিভাগ",
    filterBtn: "ফিল্টার",
    clearFilters: "সব মুছুন",
    cropFilter: "ফসল",
    diseaseFilter: "রোগ / পোকা",
    brandFilter: "ব্র্যান্ড",
    priceFilter: "মূল্য সীমা",
    stateFilter: "রাজ্য",
    availabilityFilter: "উপলব্ধতা",
    compareBtn: "মূল্য তুলনা",
    viewBtn: "বিস্তারিত দেখুন",
    buyBtn: "যোগাযোগ / কিনুন",
    saveTag: "সাশ্রয়",
    verifiedInputBadge: "যাচাইকৃত পণ্য",
    noProductsTitle: "কোন পণ্য পাওয়া যায়নি",
    noProductsSubtitle: "অন্য ফিল্টার চেষ্টা করুন।",
    showingResults: "পণ্য পাওয়া গেছে",
    activeFiltersLabel: "সক্রিয় ফিল্টার:",
    sortRelevance: "প্রাসঙ্গিকতা",
    sortPriceLow: "দাম: কম থেকে বেশি",
    sortPriceHigh: "দাম: বেশি থেকে কম",
    sortNewest: "নতুন",
    fromDiagnosisBadge: "ফসল ডাক্তার সুপারিশ",
    fromSoilBadge: "মাটি পরীক্ষা সুপারিশ",
  },
  pa: {
    hubTitle: "ਖੇਤੀ ਇਨਪੁਟਸ ਅਤੇ ਫ਼ਸਲ ਸੁਰੱਖਿਆ ਮਾਰਕੀਟ",
    hubSubtitle: "ਤਸਦੀਕਸ਼ੁਦਾ ਖਾਦਾਂ, ਕੀਟਨਾਸ਼ਕ ਅਤੇ ਪ੍ਰਮਾਣਿਤ ਬੀਜ।",
    searchPlaceholder: "ਫ਼ਸਲ, ਬਿਮਾਰੀ ਜਾਂ ਬ੍ਰਾਂਡ ਦੁਆਰਾ ਖੋਜੋ...",
    allCategories: "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ",
    filterBtn: "ਫਿਲਟਰ",
    clearFilters: "ਸਾਰੇ ਹਟਾਓ",
    cropFilter: "ਫ਼ਸਲ",
    diseaseFilter: "ਨਿਸ਼ਾਨਾ ਬਿਮਾਰੀ / ਕੀਟ",
    brandFilter: "ਬ੍ਰਾਂਡ",
    priceFilter: "ਕੀਮਤ ਸੀਮਾ",
    stateFilter: "ਰਾਜ",
    availabilityFilter: "ਉਪਲਬਧਤਾ",
    compareBtn: "ਕੀਮਤ ਤੁਲਨਾ",
    viewBtn: "ਵੇਰਵੇ ਦੇਖੋ",
    buyBtn: "ਸੰਪਰਕ / ਖਰੀਦੋ",
    saveTag: "ਬਚਤ",
    verifiedInputBadge: "ਤਸਦੀਕਸ਼ੁਦਾ ਉਤਪਾਦ",
    noProductsTitle: "ਕੋਈ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ",
    noProductsSubtitle: "ਹੋਰ ਵਿਕਲਪ ਅਜ਼ਮਾਓ।",
    showingResults: "ਉਤਪਾਦ ਉਪਲਬਧ ਹਨ",
    activeFiltersLabel: "ਸਰਗਰਮ ਫਿਲਟਰ:",
    sortRelevance: "ਢੁਕਵਾਂ",
    sortPriceLow: "ਕੀਮਤ: ਘੱਟ ਤੋਂ ਵੱਧ",
    sortPriceHigh: "ਕੀਮਤ: ਵੱਧ ਤੋਂ ਘੱਟ",
    sortNewest: "ਨਵਾਂ",
    fromDiagnosisBadge: "ਫ਼ਸਲ ਡਾਕਟਰ ਦੀ ਸਿਫਾਰਸ਼",
    fromSoilBadge: "ਮਿੱਟੀ ਪਰਖ ਦੀ ਸਿਫਾਰਸ਼",
  },
  gu: {
    hubTitle: "કૃષિ ઇનપુટ્સ અને પાક સંરક્ષણ બજાર",
    hubSubtitle: "પ્રમાણિત ખાતરો, જંતુનાશકો અને બિયારણ.",
    searchPlaceholder: "પાક, રોગ અથવા બ્રાન્ડ દ્વારા શોધો...",
    allCategories: "બધી શ્રેણીઓ",
    filterBtn: "ફિલ્ટર્સ",
    clearFilters: "બધા સાફ કરો",
    cropFilter: "પાક",
    diseaseFilter: "રોગ / જીવાત",
    brandFilter: "બ્રાન્ડ",
    priceFilter: "કિંમત શ્રેણી",
    stateFilter: "રાજ્ય",
    availabilityFilter: "ઉપલબ્ધતા",
    compareBtn: "ભાવ સરખામણી",
    viewBtn: "વિગતો જુઓ",
    buyBtn: "સંપર્ક / ખરીદો",
    saveTag: "બચત",
    verifiedInputBadge: "ચકાસાયેલ ઉત્પાદન",
    noProductsTitle: "કોઈ ઉત્પાદન મળ્યું નથી",
    noProductsSubtitle: "ફિલ્ટર્સ બદલીને ફરી પ્રયાસ કરો.",
    showingResults: "ઉત્પાદનો ઉપલબ્ધ છે",
    activeFiltersLabel: "સક્રિય ફિલ્ટર્સ:",
    sortRelevance: "પ્રસ્તુતતા",
    sortPriceLow: "કિંમત: ઓછી થી વધુ",
    sortPriceHigh: "કિંમત: વધુ થી ઓછી",
    sortNewest: "નવું",
    fromDiagnosisBadge: "પાક ડોક્ટર ભલામણ",
    fromSoilBadge: "જમીન પરીક્ષણ ભલામણ",
  },
  hi_en: {
    hubTitle: "Farm Inputs & Crop Care Market",
    hubSubtitle: "CIBRC-registered plant protection, FCO fertilizers, certified seeds & micronutrients.",
    searchPlaceholder: "Search by crop, disease, chemical name, or brand...",
    allCategories: "All Categories",
    filterBtn: "Filters",
    clearFilters: "Clear All",
    cropFilter: "Crop",
    diseaseFilter: "Target Disease / Pest",
    brandFilter: "Manufacturer & Brand",
    priceFilter: "Price Range",
    stateFilter: "State & District",
    availabilityFilter: "Availability",
    compareBtn: "Compare Prices",
    viewBtn: "View Details",
    buyBtn: "Contact / Buy",
    saveTag: "Save",
    verifiedInputBadge: "Verified Product",
    noProductsTitle: "No matching products found",
    noProductsSubtitle: "Try adjusting your filters.",
    showingResults: "verified products found",
    activeFiltersLabel: "Active Filters:",
    sortRelevance: "Relevance",
    sortPriceLow: "Price: Low to High",
    sortPriceHigh: "Price: High to Low",
    sortNewest: "Recently Verified",
    fromDiagnosisBadge: "Crop Doctor Matched Solution",
    fromSoilBadge: "Soil Health Matched Fertilizer",
  },
};

export function AgriInputsHub({
  onContactProduct,
  selectedCategory: propCategory,
  onSelectCategory,
}: AgriInputsHubProps) {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const t = HUB_I18N[lang] || HUB_I18N.en;

  // Categories & Data States
  const [categories, setCategories] = useState<AgriProductCategoryItem[]>([]);
  const [products, setProducts] = useState<AgriProductItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active Filter States
  const [selectedCategory, setSelectedCategory] = useState(propCategory || "all");

  useEffect(() => {
    if (propCategory !== undefined && propCategory !== selectedCategory) {
      setSelectedCategory(propCategory);
    }
  }, [propCategory]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    onSelectCategory?.(cat);
  };
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [selectedDisease, setSelectedDisease] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Provenance source banner from Crop Doctor or Soil Health
  const [fromCropDoctor, setFromCropDoctor] = useState<{
    crop?: string;
    disease?: string;
    confidence?: string;
  } | null>(null);
  const [fromSoilHealth, setFromSoilHealth] = useState<{
    deficiencies?: string;
    crop?: string;
  } | null>(null);

  // Modals
  const [detailProduct, setDetailProduct] = useState<AgriProductItem | null>(null);
  const [compareProduct, setCompareProduct] = useState<AgriProductItem | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load URL query params on mount (from Crop Doctor / Soil Health)
  useEffect(() => {
    const qCrop = searchParams?.get("crop");
    const qDisease = searchParams?.get("disease");
    const qCategory = searchParams?.get("category");
    const qDeficiency = searchParams?.get("deficiency");
    const qConfidence = searchParams?.get("confidence");

    if (qCrop) setSelectedCrop(qCrop);
    if (qDisease) setSelectedDisease(qDisease);
    if (qCategory) handleCategoryChange(qCategory);

    if (qDisease || qConfidence) {
      setFromCropDoctor({
        crop: qCrop || undefined,
        disease: qDisease || undefined,
        confidence: qConfidence || undefined,
      });
    }

    if (qDeficiency) {
      setFromSoilHealth({
        deficiencies: qDeficiency,
        crop: qCrop || undefined,
      });
    }
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    agriProductsApi
      .listCategories()
      .then((cats: AgriProductCategoryItem[]) => setCategories(cats))
      .catch((err: unknown) => console.warn("Failed to load categories:", err));
  }, []);

  // Fetch products when filters update
  const fetchProducts = useCallback(() => {
    setLoading(true);
    agriProductsApi
      .list({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        crop: selectedCrop !== "All" ? selectedCrop : undefined,
        disease: selectedDisease !== "All" ? selectedDisease : undefined,
        deficiency: searchParams?.get("deficiency") || undefined,
        brand: selectedBrand !== "All" ? selectedBrand : undefined,
        availability: selectedAvailability !== "all" ? selectedAvailability : undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        search: searchQuery.trim() || undefined,
        sort_by: sortBy,
        limit: 50,
      })
      .then((res: { items: AgriProductItem[]; total: number }) => {
        setProducts(res.items);
        setTotalCount(res.total);
      })
      .catch((err: unknown) => {
        console.warn("Failed to load agri products:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    selectedCategory,
    selectedCrop,
    selectedDisease,
    selectedBrand,
    selectedAvailability,
    minPrice,
    maxPrice,
    searchQuery,
    sortBy,
    searchParams,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearAllFilters = () => {
    handleCategoryChange("all");
    setSelectedCrop("All");
    setSelectedDisease("All");
    setSelectedBrand("All");
    setSelectedAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setFromCropDoctor(null);
    setFromSoilHealth(null);
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedCrop !== "All" ||
    selectedDisease !== "All" ||
    selectedBrand !== "All" ||
    selectedAvailability !== "all" ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(searchQuery);

  return (
    <div className="space-y-6">
      {/* ── HEADER & SEARCH BANNER ── */}
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t.verifiedInputBadge}</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {t.hubTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
              {t.hubSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden h-10 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center gap-2 shadow-xs"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{t.filterBtn}</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Match Context Banners */}
        {fromCropDoctor && (
          <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white font-bold text-xs shrink-0">
                <Bug className="h-4 w-4" />
              </span>
              <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-100 font-medium">
                <strong>{t.fromDiagnosisBadge}:</strong> Filtered for{" "}
                <strong className="underline font-bold">
                  {fromCropDoctor.crop ? `${fromCropDoctor.crop} • ` : ""}
                  {fromCropDoctor.disease}
                </strong>
                {fromCropDoctor.confidence ? ` (${Math.round(parseFloat(fromCropDoctor.confidence) * 100)}% match)` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFromCropDoctor(null);
                setSelectedCrop("All");
                setSelectedDisease("All");
              }}
              className="text-xs text-rose-700 dark:text-rose-300 font-bold hover:underline shrink-0"
            >
              Reset
            </button>
          </div>
        )}

        {fromSoilHealth && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-xs shrink-0">
                <Leaf className="h-4 w-4" />
              </span>
              <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 font-medium">
                <strong>{t.fromSoilBadge}:</strong> Showing nutrient replenishment solutions for{" "}
                <strong className="underline font-bold uppercase">{fromSoilHealth.deficiencies}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFromSoilHealth(null)}
              className="text-xs text-amber-700 dark:text-amber-300 font-bold hover:underline shrink-0"
            >
              Reset
            </button>
          </div>
        )}

        {/* Search Bar & Autocomplete */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-12 pl-12 pr-10 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 11 DEDICATED CATEGORIES HORIZONTAL SCROLL PILLS */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
            <span>{t.allCategories} (11)</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === "all"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-500"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>{t.allCategories}</span>
            </button>

            {categories.map((cat) => {
              const localizedName =
                lang === "hi"
                  ? cat.name_hi
                  : lang === "kn"
                  ? cat.name_kn
                  : cat.name_en;
              const isSelected = selectedCategory === cat.slug;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-500"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{localizedName}</span>
                  {cat.product_count !== undefined && cat.product_count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300"
                      }`}
                    >
                      {cat.product_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ACTIVE FILTERS STRIP ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-stone-100/80 dark:bg-stone-800/80 text-xs">
          <span className="font-bold text-stone-500">{t.activeFiltersLabel}</span>

          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
              Category: {selectedCategory.replace(/_/g, " ")}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => handleCategoryChange("all")}
              />
            </span>
          )}

          {selectedCrop !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
              Crop: {selectedCrop}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => setSelectedCrop("All")}
              />
            </span>
          )}

          {selectedDisease !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-semibold">
              Target: {selectedDisease}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => setSelectedDisease("All")}
              />
            </span>
          )}

          {selectedBrand !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold">
              Brand: {selectedBrand}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => setSelectedBrand("All")}
              />
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold">
              Search: "{searchQuery}"
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-75"
                onClick={() => setSearchQuery("")}
              />
            </span>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-auto text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t.clearFilters}</span>
          </button>
        </div>
      )}

      {/* ── MAIN WORKSPACE: SIDEBAR FILTERS + PRODUCTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 select-none">
          <div className="p-5 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t.filterBtn}</span>
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                >
                  {t.clearFilters}
                </button>
              )}
            </div>

            {/* Quick Crop Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                {t.cropFilter}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_CROPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCrop(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedCrop === c
                        ? "bg-emerald-700 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Disease Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                {t.diseaseFilter}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DISEASES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDisease(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedDisease === d
                        ? "bg-rose-700 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                {t.brandFilter}
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Brands</option>
                <option value="IFFCO">IFFCO</option>
                <option value="Bayer">Bayer CropScience</option>
                <option value="Syngenta">Syngenta India</option>
                <option value="Tata Rallis">Tata Rallis India</option>
                <option value="UPL">UPL Limited</option>
                <option value="Dhanuka">Dhanuka Agritech</option>
                <option value="PI Industries">PI Industries</option>
                <option value="Coromandel">Coromandel Gromor</option>
                <option value="NFL">National Fertilizers (NFL)</option>
                <option value="KRIBHCO">KRIBHCO</option>
                <option value="Mahadhan">Deepak Fertilisers (Mahadhan)</option>
                <option value="FMC">FMC India</option>
                <option value="BASF">BASF India</option>
                <option value="Multiplex">Multiplex Group</option>
                <option value="Aries Agro">Aries Agro</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                {t.priceFilter} (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                {t.availabilityFilter}
              </label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Availability</option>
                <option value="available_to_buy">Available to Buy (In Stock)</option>
                <option value="contact_seller">Contact Seller</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </aside>

        {/* PRODUCTS LISTING VIEW (COL-SPAN-3) */}
        <main className="lg:col-span-3 space-y-4">
          {/* Results Summary & Sorting Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
              <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{totalCount}</strong>{" "}
              {t.showingResults}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold focus:outline-none"
              >
                <option value="relevance">{t.sortRelevance}</option>
                <option value="price_asc">{t.sortPriceLow}</option>
                <option value="price_desc">{t.sortPriceHigh}</option>
                <option value="newest">{t.sortNewest}</option>
              </select>

              <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-700 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded ${viewMode === "grid" ? "bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white" : "text-stone-400"}`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1 rounded ${viewMode === "list" ? "bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white" : "text-stone-400"}`}
                  title="List view"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-3xl bg-stone-100 dark:bg-stone-800/60 animate-pulse border border-stone-200 dark:border-stone-800"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="p-12 text-center rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900/60 space-y-3">
              <Store className="h-10 w-10 text-stone-400 mx-auto" />
              <h3 className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-200">
                {t.noProductsTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                {t.noProductsSubtitle}
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.clearFilters}</span>
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              {products.map((p) => {
                const savings = Math.max(0, p.mrp - p.selling_price);
                return (
                  <div
                    key={p.id}
                    className="group rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          {p.brand}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <ShieldCheck className="h-3 w-3" />
                          <span>
                            {p.is_cibrc_approved
                              ? "CIBRC"
                              : p.is_fco_approved
                              ? "FCO 1985"
                              : "Verified"}
                          </span>
                        </span>
                      </div>

                      {/* Product Name & Active Ingredient */}
                      <div>
                        <h4
                          onClick={() => setDetailProduct(p)}
                          className="text-base font-black text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 cursor-pointer transition line-clamp-1"
                        >
                          {p.name}
                        </h4>
                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5 line-clamp-1">
                          {p.active_ingredient}
                        </p>
                      </div>

                      {/* Target Crops Pills */}
                      <div className="flex flex-wrap gap-1">
                        {p.target_crops.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium"
                          >
                            {c}
                          </span>
                        ))}
                        {p.target_crops.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md text-stone-400 font-semibold">
                            +{p.target_crops.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Price Section */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                            ₹{p.selling_price.toFixed(2)}
                          </span>
                          {savings > 0 && (
                            <span className="text-xs line-through text-stone-400">
                              ₹{p.mrp.toFixed(2)}
                            </span>
                          )}
                          <span className="text-xs text-stone-500 font-medium">
                            / {p.pack_size}
                          </span>
                        </div>
                        {savings > 0 && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            {t.saveTag} ₹{savings.toFixed(2)} ({Math.round((savings / p.mrp) * 100)}% off)
                          </span>
                        )}
                      </div>

                      {/* Seller Location & Stock Status */}
                      <div className="text-[11px] text-stone-500 space-y-1">
                        <p className="flex items-center gap-1 line-clamp-1">
                          <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                          <span>{p.seller_name} • {p.district}, {p.state}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCompareProduct(p)}
                        className="flex-1 h-9 px-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        title={t.compareBtn}
                      >
                        <Scale className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="truncate">{t.compareBtn}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDetailProduct(p)}
                        className="h-9 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-xs shrink-0"
                      >
                        <span>{t.viewBtn}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ── */}
      <AgriProductDetailModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onComparePrices={(prod) => setCompareProduct(prod)}
        onContactSeller={(prod) => {
          if (onContactProduct) onContactProduct(prod);
        }}
      />

      <AgriPriceComparisonModal
        product={compareProduct}
        isOpen={Boolean(compareProduct)}
        onClose={() => setCompareProduct(null)}
        onSelectProduct={(prod) => setDetailProduct(prod)}
      />
    </div>
  );
}
