"use client"
import { useLanguage } from '@/lib/language'
import { trackEvent } from '@/lib/analytics'
import { TermTooltip } from '@/components/ui/TermTooltip'

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Store,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ShoppingCart,
  Tag,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  IndianRupee,
  Wheat,
  Loader2,
  X,
  Package,
  Users,
  ArrowUpDown,
  Bell,
  BellRing,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Recharts imports for premium financial view
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/* ------------------------------------------------------------------ */
/*  Multilingual eNAM Instructions                                     */
/* ------------------------------------------------------------------ */
const ENAM_LANG = {
  en: {
    title: "Fill this on eNAM",
    state: "State",
    apmc: "APMC / Mandi",
    commodity: "Commodity",
    price: "Price",
    proceed: "Go to eNAM ↗",
    note: "eNAM — Government of India's official mandi. Real buyers, real payments.",
  },
  hi: {
    title: "eNAM पर यह भरें",
    state: "राज्य",
    apmc: "मंडी",
    commodity: "फसल",
    price: "भाव",
    proceed: "eNAM पर जाएं ↗",
    note: "eNAM — भारत सरकार की आधिकारिक मंडी। असली खरीदार, असली भुगतान।",
  },
  kn: {
    title: "eNAM ನಲ್ಲಿ ಇದನ್ನು ತುಂಬಿ",
    state: "ರಾಜ್ಯ",
    apmc: "ಮಂಡಿ",
    commodity: "ಬೆಳೆ",
    price: "ಬೆಲೆ",
    proceed: "eNAM ಗೆ ಹೋಗಿ ↗",
    note: "eNAM — ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಮಂಡಿ। ನೈಜ ಖರೀದಿದಾರರು, ನೈಜ ಪಾವತಿ.",
  },
}

const ALERT_LANG = {
  en: {
    panelTitle: "Target Price Notifications",
    setupMonitors: "Setup push price monitors for selected commodities",
    activeMonitors: (count: number) => `${count} active monitors`,
    enableNotifications: "Enable Notifications",
    checkStatus: "Check Status",
    cancel: "Cancel",
    addTargetPrice: "Add Target Price",
    cropCommodity: "Crop / Commodity",
    selectCommodity: "Select commodity",
    triggerRule: "Trigger Rule",
    goesAbove: "Goes Above",
    goesBelow: "Goes Below",
    targetPriceLabel: "Target (₹ per Qtl)",
    targetPricePlaceholder: "Target price",
    createTrigger: "Create Trigger"
  },
  hi: {
    panelTitle: "लक्ष्य मूल्य सूचनाएं",
    setupMonitors: "चयनित फसलों के लिए मूल्य अलर्ट सेट करें",
    activeMonitors: (count: number) => `${count} सक्रिय अलर्ट`,
    enableNotifications: "सूचनाएं सक्षम करें",
    checkStatus: "स्थिति जांचें",
    cancel: "रद्द करें",
    addTargetPrice: "लक्ष्य मूल्य जोड़ें",
    cropCommodity: "फसल / वस्तु",
    selectCommodity: "फसल चुनें",
    triggerRule: "अलर्ट नियम",
    goesAbove: "ऊपर जाने पर",
    goesBelow: "नीचे जाने पर",
    targetPriceLabel: "लक्ष्य (₹ प्रति क्विंटल)",
    targetPricePlaceholder: "लक्ष्य मूल्य",
    createTrigger: "अलर्ट सेट करें"
  },
  kn: {
    panelTitle: "ಗುರಿ ಬೆಲೆ ಅಧಿಸೂಚನೆಗಳು",
    setupMonitors: "ಆಯ್ಕೆ ಮಾಡಿದ ಬೆಳೆಗಳಿಗೆ ಬೆಲೆ ಅಲರ್ಟ್ ಸೆಟ್ ಮಾಡಿ",
    activeMonitors: (count: number) => `${count} ಸಕ್ರಿಯ ಅಲರ್ಟ್‌ಗಳು`,
    enableNotifications: "ಅಧಿಸೂಚನೆ ಸಕ್ರಿಯಗೊಳಿಸಿ",
    checkStatus: "ಸ್ಥಿತಿ ಪರೀಕ್ಷಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    addTargetPrice: "ಗುರಿ ಬೆಲೆ ಸೇರಿಸಿ",
    cropCommodity: "ಬೆಳೆ / ಪದಾರ್ಥ",
    selectCommodity: "ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ",
    triggerRule: "ನಿಯಮ",
    goesAbove: "ಹೆಚ್ಚಾದಾಗ",
    goesBelow: "ಕಡಿಮೆಯಾದಾಗ",
    targetPriceLabel: "ಗುರಿ ಬೆಲೆ (₹ ಪ್ರತಿ ಕ್ವಿಂಟಾಲ್)",
    targetPricePlaceholder: "ಗುರಿ ಬೆಲೆ",
    createTrigger: "ಅಲರ್ಟ್ ರಚಿಸಿ"
  }
}

const MANDI_PAGE_LANG = {
  en: {
    enamConnected: "eNAM Connected Mandi",
    mandi: "Mandi",
    marketplace: "Marketplace",
    heroDesc: "Real-time commodity valuation indexes from national APMC centers. Place orders, monitor trading trends, or list inventories directly with automated government verification.",
    totalCrops: "Total Crops",
    mandiArrivals: "Mandi Arrivals",
    searchPlaceholder: "Search commodities, APMC mandis, states...",
    syncingIndex: "Synchronizing Mandi Pricing Index...",
    noCommodities: "No commodities found matching filter.",
    returnMarketplace: "Return to Marketplace",
    varietyLabel: "Specific variety: ",
    livePriceIndex: "Live Price Index",
    arrivalTonnes: "Arrival Tonnes",
    low: "Low",
    currentModel: "Current Model",
    high: "High",
    apmcMandi: "APMC Mandi",
    stateCenter: "State Center",
    priceHistory: "Market Price History",
    historyTrend: "Historical fluctuation trend for the past 7 days",
    liveGraph: "Live Graph",
    buy: "Buy",
    sell: "Sell",
    retry: "Retry Connection",
    removeAlert: "Remove alert",
  },
  hi: {
    enamConnected: "eNAM कनेक्टेड मंडी",
    mandi: "मंडी",
    marketplace: "बाजार",
    heroDesc: "राष्ट्रीय APMC केंद्रों से वास्तविक समय में फसल मूल्य सूचकांक। सीधे सरकारी सत्यापन के साथ ऑर्डर दें, व्यापार के रुझान देखें या अपनी फसल सूचीबद्ध करें।",
    totalCrops: "कुल फसलें",
    mandiArrivals: "मंडी आवक",
    searchPlaceholder: "फसलें, APMC मंडियां, राज्य खोजें...",
    syncingIndex: "मंडी मूल्य सूचकांक सिंक किया जा रहा है...",
    noCommodities: "फिल्टर से मेल खाने वाली कोई फसल नहीं मिली।",
    returnMarketplace: "बाजार पर वापस जाएं",
    varietyLabel: "विशिष्ट किस्म: ",
    livePriceIndex: "लाइव मूल्य सूचकांक",
    arrivalTonnes: "आवक टन",
    low: "न्यूनतम",
    currentModel: "वर्तमान मॉडल",
    high: "अधिकतम",
    apmcMandi: "APMC मंडी",
    stateCenter: "राज्य केंद्र",
    priceHistory: "बाजार मूल्य इतिहास",
    historyTrend: "पिछले 7 दिनों के लिए ऐतिहासिक उतार-चढ़ाव का रुझान",
    liveGraph: "लाइव ग्राफ",
    buy: "खरीदें",
    sell: "बेचें",
    retry: "कनेक्शन पुनः प्रयास करें",
    removeAlert: "अलर्ट हटाएं",
  },
  kn: {
    enamConnected: "eNAM ಸಂಪರ್ಕಿತ ಮಂಡಿ",
    mandi: "ಮಂಡಿ",
    marketplace: "ಮಾರುಕಟ್ಟೆ",
    heroDesc: "ರಾಷ್ಟ್ರೀಯ APMC ಕೇಂದ್ರಗಳಿಂದ ನೈಜ-ಸಮಯದ ಬೆಳೆ ಮೌಲ್ಯ ಸೂಚ್ಯಂಕಗಳು. ಆರ್ಡರ್ ಮಾಡಿ, ವ್ಯಾಪಾರ ಪ್ರವೃತ್ತಿ ಗಮನಿಸಿ, ಅಥವಾ ಸರ್ಕಾರದ ಪರಿಶೀಲನೆಯೊಂದಿಗೆ ನಿಮ್ಮ ದಾಸ್ತಾನು ಪಟ್ಟಿ ಮಾಡಿ.",
    totalCrops: "ಒಟ್ಟು ಬೆಳೆಗಳು",
    mandiArrivals: "ಮಂಡಿ ಆವಕ",
    searchPlaceholder: "ಬೆಳೆಗಳು, APMC ಮಂಡಿಗಳು, ರಾಜ್ಯಗಳನ್ನು ಹುಡುಕಿ...",
    syncingIndex: "ಮಂಡಿ ಬೆಲೆ ಸೂಚ್ಯಂಕವನ್ನು ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    noCommodities: "ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಪದಾರ್ಥಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    returnMarketplace: "ಮಾರುಕಟ್ಟೆಗೆ ಹಿಂತಿರುಗಿ",
    varietyLabel: "ನಿರ್ದಿಷ್ಟ ತಳಿ: ",
    livePriceIndex: "ಲೈವ್ ಬೆಲೆ ಸೂಚ್ಯಂಕ",
    arrivalTonnes: "ಆವಕ ಟನ್‌ಗಳು",
    low: "ಕಡಿಮೆ",
    currentModel: "ಪ್ರಸ್ತುತ ಮಾದರಿ",
    high: "ಹೆಚ್ಚು",
    apmcMandi: "APMC ಮಂಡಿ",
    stateCenter: "ರಾಜ್ಯ ಕೇಂದ್ರ",
    priceHistory: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಇತಿಹಾಸ",
    historyTrend: "ಕಳೆದ 7 ದಿನಗಳ ಐತಿಹಾಸಿಕ ಏರಿಳಿತದ ಪ್ರವೃತ್ತಿ",
    liveGraph: "ಲೈವ್ ಗ್ರಾಫ್",
    buy: "ಖರೀದಿಸಿ",
    sell: "ಮಾರಿ",
    retry: "ಮರುಸಂಪರ್ಕಿಸಿ",
    removeAlert: "ಅಲರ್ಟ್ ತೆಗೆದುಹಾಕಿ",
  }
}

const TRADE_LANG = {
  en: {
    tradeCommodity: "Trade Commodity",
    tradeDesc: "Initiate instant trading signals or direct transactions across our verified regional logistics networks.",
    buy: "Buy",
    sell: "Sell",
    connectingBroker: "Connecting eNAM broker...",
    securingPipeline: "Securing encrypted pipeline with registered trading agents for",
    in: "in",
    agentConnected: "eNAM Agent Connected!",
    nam: "National Agriculture Market",
    govIndia: "Govt of India • Verification Center",
    tradingValue: "Trading Value",
    cancel: "Cancel",
  },
  hi: {
    tradeCommodity: "फसल का व्यापार",
    tradeDesc: "हमारे सत्यापित क्षेत्रीय लॉजिस्टिक्स नेटवर्क पर त्वरित व्यापार संकेत या सीधे लेनदेन शुरू करें।",
    buy: "खरीदें",
    sell: "बेचें",
    connectingBroker: "eNAM ब्रोकर से कनेक्ट किया जा रहा है...",
    securingPipeline: "सत्यापित ट्रेडिंग एजेंटों के साथ सुरक्षित एन्क्रिप्टेड कनेक्शन स्थापित किया जा रहा है - ",
    in: "मंडी:",
    agentConnected: "eNAM एजेंट कनेक्ट हो गया!",
    nam: "राष्ट्रीय कृषि बाजार (eNAM)",
    govIndia: "भारत सरकार • सत्यापन केंद्र",
    tradingValue: "व्यापार मूल्य",
    cancel: "रद्द करें",
  },
  kn: {
    tradeCommodity: "ಬೆಳೆ ವ್ಯಾಪಾರ",
    tradeDesc: "ನಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಪ್ರಾದೇಶಿಕ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ನೆಟ್‌ವರ್ಕ್‌ಗಳಲ್ಲಿ ತ್ವರಿತ ವ್ಯಾಪಾರ ಸಂಕೇತಗಳು ಅಥವಾ ನೇರ ವಹಿವಾಟುಗಳನ್ನು ಪ್ರಾರಂಭಿಸಿ.",
    buy: "ಖರೀದಿಸಿ",
    sell: "ಮಾರಿ",
    connectingBroker: "eNAM ಬ್ರೋಕರ್ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...",
    securingPipeline: "ನೋಂದಾಯಿತ ವ್ಯಾಪಾರ ಏಜೆಂಟ್‌ಗಳೊಂದಿಗೆ ಸುರಕ್ಷಿತ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಸಂಪರ್ಕ ಸಾಧಿಸಲಾಗುತ್ತಿದೆ - ಬೆಳೆ:",
    in: "ಮಂಡಿ:",
    agentConnected: "eNAM ಏಜೆಂಟ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ!",
    nam: "ರಾಷ್ಟ್ರೀಯ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ (eNAM)",
    govIndia: "ಭಾರತ ಸರ್ಕಾರ • ಪರಿಶೀಲನಾ ಕೇಂದ್ರ",
    tradingValue: "ವ್ಯಾಪಾರದ ಮೌಲ್ಯ",
    cancel: "ರದ್ದುಮಾಡಿ",
  }
}

const CATEGORY_LANG = {
  en: {
    Cereal: "Cereal",
    Oilseed: "Oilseed",
    Pulse: "Pulse",
    Fiber: "Fiber",
    Vegetable: "Vegetable",
    "Cash Crop": "Cash Crop",
    All: "All"
  },
  hi: {
    Cereal: "अनाज",
    Oilseed: "तिलहन",
    Pulse: "दलहन",
    Fiber: "रेशेदार फसल",
    Vegetable: "सब्जी",
    "Cash Crop": "नकदी फसल",
    All: "सभी"
  },
  kn: {
    Cereal: "ಧಾನ್ಯಗಳು",
    Oilseed: "ಎಣ್ಣೆಕಾಳುಗಳು",
    Pulse: "ಬೇಳೆಕಾಳುಗಳು",
    Fiber: "ನಾರಿನ ಬೆಳೆಗಳು",
    Vegetable: "ತರಕಾರಿ",
    "Cash Crop": "ನಗದು ಬೆಳೆ",
    All: "ಎಲ್ಲಾ"
  }
} as any

const DATA_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    // Crop names
    "Wheat (गेहूं)": "गेहूं",
    "Rice (चावल)": "चावल",
    "Soybean (सोयाबीन)": "सोयाबीन",
    "Cotton (कपास)": "कपास",
    "Mustard (सरसों)": "सरसों",
    "Chana (चना)": "चना",
    "Tur/Arhar Dal (तूर दाल)": "तूर दाल (अरहर)",
    "Onion (प्याज)": "प्याज",
    "Potato (आलू)": "आलू",
    "Sugarcane (गन्ना)": "गन्ना",
    "Maize (मक्का)": "मक्का",
    "Groundnut (मूंगफली)": "मूंगफली",
    // Varieties
    "Sharbati": "शरबती",
    "Basmati 1121": "बासमती 1121",
    "Yellow": "पीला",
    "Medium Staple": "मध्यम रेशा",
    "Laha": "लाहा",
    "Desi": "देशी",
    "FAQ": "एफएक्यू (सामान्य)",
    "Nasik Red": "नाशिक लाल",
    "Jyoti": "ज्योति",
    "Co-0238": "को-0238",
    "Bold": "बोल्ड",
    // States
    "Madhya Pradesh": "मध्य प्रदेश",
    "Haryana": "हरियाणा",
    "Gujarat": "गुजरात",
    "Rajasthan": "राजस्थान",
    "Maharashtra": "महाराष्ट्र",
    "Karnataka": "कर्नाटक",
    "Uttar Pradesh": "उत्तर प्रदेश",
    // Mandis
    "Indore Mandi": "इंदौर मंडी",
    "Karnal Mandi": "करनाल मंडी",
    "Ujjain Mandi": "उज्जयिनी मंडी",
    "Rajkot Mandi": "राजकोट मंडी",
    "Alwar Mandi": "अलवर मंडी",
    "Latur Mandi": "लातूर मंडी",
    "Gulbarga Mandi": "गुलबर्गा मंडी",
    "Nashik Mandi": "नाशिक मंडी",
    "Agra Mandi": "आगरा मंडी",
    "Muzaffarnagar Mandi": "मुजफ्फरनगर मंडी",
    "Davangere Mandi": "दावणगेरे मंडी",
    "Junagadh Mandi": "जूनागढ़ मंडी",
    "per quintal": "प्रति क्विंटल",
    "Tons": "टन",
  },
  kn: {
    // Crop names
    "Wheat (गेहूं)": "ಗೋಧಿ",
    "Rice (चावल)": "ಅಕ್ಕಿ",
    "Soybean (सोयाबीन)": "ಸೋಯಾಬೀನ್",
    "Cotton (कपास)": "ಹತ್ತಿ",
    "Mustard (सरसों)": "ಸಾಸಿವೆ",
    "Chana (चना)": "ಕಡಲೆ",
    "Tur/Arhar Dal (तूर दाल)": "ತೊಗರಿ ಬೇಳೆ",
    "Onion (प्याज)": "ಈರುಳ್ಳಿ",
    "Potato (आलू)": "ಆಲೂಗಡ್ಡೆ",
    "Sugarcane (गन्ना)": "ಕಬ್ಬು",
    "Maize (मक्का)": "ಮೆಕ್ಕೆಜೋಳ",
    "Groundnut (मूंगफली)": "ಕಡಲೆಕಾಯಿ",
    // Varieties
    "Sharbati": "ಶರಬತಿ",
    "Basmati 1121": "ಬಾಸ್ಮತಿ 1121",
    "Yellow": "ಹಳದಿ",
    "Medium Staple": "ಮಧ್ಯಮ ಸ್ಟೇಪಲ್",
    "Laha": "ಲಹಾ",
    "Desi": "ದೇಸಿ",
    "FAQ": "FAQ (ಸಾಮಾನ್ಯ)",
    "Nasik Red": "ನಾಸಿಕ್ ಕೆಂಪು",
    "Jyoti": "ಜ್ಯೋತಿ",
    "Co-0238": "ಕೋ-0238",
    "Bold": "ಬೋಲ್ಡ್",
    // States
    "Madhya Pradesh": "ಮಧ್ಯಪ್ರದೇಶ",
    "Haryana": "ಹರಿಯಾಣ",
    "Gujarat": "ಗುಜರಾತ್",
    "Rajasthan": "ರಾಜಸ್ಥಾನ",
    "Maharashtra": "ಮಹಾರಾಷ್ಟ್ರ",
    "Karnataka": "ಕರ್ನಾಟಕ",
    "Uttar Pradesh": "ಉತ್ತರ ಪ್ರದೇಶ",
    // Mandis
    "Indore Mandi": "ಇಂದೋರ್ ಮಂಡಿ",
    "Karnal Mandi": "ಕರ್ನಾಲ್ ಮಂಡಿ",
    "Ujjain Mandi": "ಉಜ್ಜಯಿನಿ ಮಂಡಿ",
    "Rajkot Mandi": "ರಾಜಕೋಟ್ ಮಂಡಿ",
    "Alwar Mandi": "ಅಲ್ವಾರ್ ಮಂಡಿ",
    "Latur Mandi": "ಲಾತೂರ್ ಮಂಡಿ",
    "Gulbarga Mandi": "ಗುಲ್ಬರ್ಗ ಮಂಡಿ",
    "Nashik Mandi": "ನಾಸಿಕ್ ಮಂಡಿ",
    "Agra Mandi": "ಆಗ್ರಾ ಮಂಡಿ",
    "Muzaffarnagar Mandi": "ಮುಜಫರ್‌ನಗರ ಮಂಡಿ",
    "Davangere Mandi": "ದಾವಣಗೆರೆ ಮಂಡಿ",
    "Junagadh Mandi": "ಜುನಾಗಢ್ ಮಂಡಿ",
    "per quintal": "ಪ್ರತಿ ಕ್ವಿಂಟಾಲ್",
    "Tons": "ಟನ್ಗಳು",
  },
  en: {
    "Wheat (गेहूं)": "Wheat",
    "Rice (चावल)": "Rice",
    "Soybean (सोयाबीन)": "Soybean",
    "Cotton (कपास)": "Cotton",
    "Mustard (सरसों)": "Mustard",
    "Chana (चना)": "Chana",
    "Tur/Arhar Dal (तूर दाल)": "Tur/Arhar Dal",
    "Onion (प्याज)": "Onion",
    "Potato (आलू)": "Potato",
    "Sugarcane (गन्ना)": "Sugarcane",
    "Maize (मक्का)": "Maize",
    "Groundnut (मूंगफلی)": "Groundnut",
  }
}

function translateData(val: string, lang: "en" | "hi" | "kn"): string {
  if (!val) return val
  return DATA_TRANSLATIONS[lang]?.[val] ?? DATA_TRANSLATIONS[lang]?.[val.trim()] ?? val
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface MandiCrop {
  id: number
  name: string
  variety: string
  price: number
  unit: string
  mandi: string
  state: string
  category: string
  trend: "up" | "down" | "stable"
  change_percent: number
  min_price: number
  max_price: number
  modal_price: number
  arrival_tonnes: number
}

/* ------------------------------------------------------------------ */
/*  Category Info Map                                                 */
/* ------------------------------------------------------------------ */
const CATEGORY_COLORS: Record<string, string> = {
  Cereal: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400",
  Oilseed: "from-lime-500/10 to-green-500/10 border-lime-500/20 text-lime-400",
  Pulse: "from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-400",
  Fiber: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400",
  Vegetable: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400",
  "Cash Crop": "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 text-purple-400",
}

/* ------------------------------------------------------------------ */
/*  Price Alert System                                                 */
/* ------------------------------------------------------------------ */
const ALERT_KEY = "KisaanBuddy_mandi_alerts"
interface PriceAlert { id: string; cropName: string; threshold: number; direction: "above" | "below"; createdAt: number; fired?: boolean }
function readAlerts(): PriceAlert[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(ALERT_KEY) || "[]") } catch { return [] } }
function saveAlerts(a: PriceAlert[]) { if (typeof window !== "undefined") localStorage.setItem(ALERT_KEY, JSON.stringify(a)) }

function PriceAlertPanel({ crops }: { crops: MandiCrop[] }) {
  const { t, lang } = useLanguage()
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => readAlerts())
  const [showForm, setShowForm] = useState(false)
  const [newCrop, setNewCrop] = useState("")
  const [newThreshold, setNewThreshold] = useState("")
  const [newDir, setNewDir] = useState<"above" | "below">("above")
  const [permGranted, setPermGranted] = useState(false)
  const [checking, setChecking] = useState(false)
  
  const activeAlertLang = (lang === "hi" || lang === "kn") ? lang : "en"
  const currentLang = ALERT_LANG[activeAlertLang]

  useEffect(() => { if (typeof window !== "undefined" && "Notification" in window) setPermGranted(Notification.permission === "granted") }, [])
  
  const requestPerm = async () => { if (!("Notification" in window)) return; const r = await Notification.requestPermission(); setPermGranted(r === "granted") }
  
  const addAlert = () => {
    if (!newCrop || !newThreshold) return
    const alert: PriceAlert = { id: Date.now().toString(36), cropName: newCrop, threshold: parseFloat(newThreshold), direction: newDir, createdAt: Date.now() }
    const updated = [...alerts, alert]; setAlerts(updated); saveAlerts(updated); setShowForm(false); setNewCrop(""); setNewThreshold("")
  }
  
  const removeAlert = (id: string) => { const u = alerts.filter((a) => a.id !== id); setAlerts(u); saveAlerts(u) }
  
  const checkNow = useCallback(() => {
    if (!permGranted || crops.length === 0) return; setChecking(true)
    const updated = alerts.map((alert) => {
      const match = crops.find((c) => c.name.toLowerCase().includes(alert.cropName.toLowerCase()))
      if (!match) return alert
      const triggered = alert.direction === "above" ? match.modal_price >= alert.threshold : match.modal_price <= alert.threshold
      if (triggered && !alert.fired) { 
        const notifTitle = t("mandi.KisaanBuddy_mandi_alert");
        const cropTranslated = translateData(match.name, activeAlertLang);
        const notifBody = t("mandi.translatedata_match_name_lang")
          .replace("${translateData(match.name, lang)}", cropTranslated)
          .replace("${match.modal_price}", match.modal_price.toString());
        
        new Notification(notifTitle, { 
          body: notifBody, 
          icon: "/icon-192.svg" 
        }); 
        return { ...alert, fired: true } 
      }
      return alert
    }); setAlerts(updated); saveAlerts(updated); setTimeout(() => setChecking(false), 800)
  }, [alerts, crops, permGranted, lang])

  const uniqueCrops = Array.from(new Set(crops.map((c) => c.name))).sort()

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md p-4 relative overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Bell className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-white text-sm font-display">{currentLang.panelTitle}</div>
            <div className="text-xs text-muted-foreground">{alerts.length === 0 ? currentLang.setupMonitors : currentLang.activeMonitors(alerts.length)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {!permGranted && (
            <button 
              onClick={requestPerm} 
              className="text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all"
            >
              <BellRing className="h-3.5 w-3.5" /> {currentLang.enableNotifications}
            </button>
          )}
          {permGranted && alerts.length > 0 && (
            <button 
              onClick={checkNow} 
              disabled={checking} 
              className="text-xs rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] px-3.5 py-2 text-white font-semibold flex items-center gap-1.5 transition-all"
            >
              {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />} {currentLang.checkStatus}
            </button>
          )}
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="text-xs rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-amber-400 font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> {showForm ? currentLang.cancel : currentLang.addTargetPrice}
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-center gap-2 text-xs rounded-full px-3 py-1.5 border transition-all ${
                alert.fired 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              <span>{translateData(alert.cropName, activeAlertLang)} {alert.direction === "above" ? "≥" : "≤"} ₹{alert.threshold}</span>
              <button 
                onClick={() => removeAlert(alert.id)} 
                className="hover:text-white transition-colors"
                title={t("mandi.remove_alert")}
              >
                <X className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="mt-4 pt-4 border-t border-white/[0.04] grid gap-4 sm:flex sm:items-end sm:flex-wrap">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{currentLang.cropCommodity}</span>
            <select 
              value={newCrop} 
              onChange={(e) => setNewCrop(e.target.value)} 
              className="w-full sm:w-48 rounded-xl border border-white/[0.08] bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="" className="bg-slate-900">{currentLang.selectCommodity}</option>
              {uniqueCrops.map((c) => <option key={c} value={c} className="bg-slate-900">{translateData(c, activeAlertLang)}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{currentLang.triggerRule}</span>
            <div className="flex p-0.5 rounded-xl border border-white/[0.08] bg-slate-950">
              <button 
                onClick={() => setNewDir("above")} 
                type="button"
                className={`text-[11px] rounded-lg px-3 py-1.5 font-bold transition-all ${newDir === "above" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-white"}`}
              >
                {currentLang.goesAbove}
              </button>
              <button 
                onClick={() => setNewDir("below")} 
                type="button"
                className={`text-[11px] rounded-lg px-3 py-1.5 font-bold transition-all ${newDir === "below" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-white"}`}
              >
                {currentLang.goesBelow}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{currentLang.targetPriceLabel}</span>
            <input 
              type="number" 
              value={newThreshold} 
              onChange={(e) => setNewThreshold(e.target.value)} 
              placeholder={currentLang.targetPricePlaceholder} 
              className="w-full sm:w-32 rounded-xl border border-white/[0.08] bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" 
            />
          </div>
          <Button 
            onClick={addAlert} 
            disabled={!newCrop || !newThreshold} 
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 px-4 disabled:opacity-50 transition-all text-xs"
          >
            {currentLang.createTrigger}
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function MandiPage() {
  const { t, lang: appLang } = useLanguage()
  const [crops, setCrops] = useState<MandiCrop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<MandiCrop | null>(null)
  const [buySellMode, setBuySellMode] = useState<"buy" | "sell" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle")
  const [lang, setLang] = useState<"en" | "hi" | "kn">((appLang === "hi" || appLang === "kn") ? appLang : "en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLang((appLang === "hi" || appLang === "kn") ? appLang : "en")
  }, [appLang])

  useEffect(() => {
    setMounted(true)
  }, [])

  /* ---- Fetch crops from backend ---- */
  useEffect(() => {
    let cancelled = false
    async function fetchCrops() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/mandi/crops")
        if (!res.ok) throw new Error("Failed to fetch crop data")
        const data = await res.json()
        if (!cancelled) setCrops(data.crops)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load mandi data.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCrops()
    return () => { cancelled = true }
  }, [])

  /* ---- Derived data ---- */
  const categories = useMemo(() => {
    const cats = new Set(crops.map((c) => c.category))
    return ["All", ...Array.from(cats)]
  }, [crops])

  const filteredCrops = useMemo(() => {
    return crops.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = categoryFilter === "All" || c.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [crops, searchQuery, categoryFilter])

  /* ---- Simulate connection ---- */
  function handleConnect(mode: "buy" | "sell") {
    setBuySellMode(mode)
    setConnectionStatus("connecting")
    setTimeout(() => setConnectionStatus("connected"), 2000)
  }

  function handleBack() {
    setSelectedCrop(null)
    setBuySellMode(null)
    setConnectionStatus("idle")
  }

  // Generate historical data wave for Recharts
  const chartData = useMemo(() => {
    if (!selectedCrop) return []
    const days = 8
    const data = []
    const basePrice = selectedCrop.modal_price || selectedCrop.price
    const spread = selectedCrop.max_price - selectedCrop.min_price
    const variance = spread > 0 ? spread : basePrice * 0.12

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      
      let price = 0
      if (i === 0) {
        price = selectedCrop.price
      } else {
        const noise = (Math.sin(i * 1.6) + Math.cos(i * 0.9)) / 2 
        price = Math.round(basePrice + noise * (variance * 0.6))
        price = Math.max(selectedCrop.min_price, Math.min(selectedCrop.max_price, price))
      }

      data.push({
        date: dateString,
        Price: price,
      })
    }
    return data
  }, [selectedCrop])

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12 relative">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[10%] w-[350px] h-[350px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* ---- Page Header ---- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-orange-950/20 via-slate-950 to-emerald-950/15 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400 mb-3">
              <Store className="h-3.5 w-3.5" />
              {MANDI_PAGE_LANG[lang].enamConnected}
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white flex items-center gap-3">
              {MANDI_PAGE_LANG[lang].mandi} <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">{MANDI_PAGE_LANG[lang].marketplace}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              {MANDI_PAGE_LANG[lang].heroDesc}
            </p>
          </div>
          {/* Stats widget */}
          <div className="flex gap-3 flex-wrap">
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-4 min-w-[120px] backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{MANDI_PAGE_LANG[lang].totalCrops}</div>
              <div className="text-xl font-extrabold text-white flex items-center gap-1.5">
                <Package className="h-4.5 w-4.5 text-orange-400" />
                {crops.length}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-4 min-w-[150px] backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{MANDI_PAGE_LANG[lang].mandiArrivals}</div>
              <div className="text-xl font-extrabold text-white flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-emerald-400" />
                {crops.reduce((a, c) => a + c.arrival_tonnes, 0).toLocaleString()} {t("mandi.t")}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Price Alert Panel */}
      <PriceAlertPanel crops={crops} />

      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/*  CROP LIST VIEW                                               */}
        {/* ============================================================ */}
        {!selectedCrop && (
          <motion.div
            key="crop-list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            {/* Search + Filter bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="mandi-search"
                  type="text"
                  placeholder={MANDI_PAGE_LANG[lang].searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl border border-white/[0.08] bg-slate-950/40 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-white font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap items-center overflow-x-auto pb-1 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                      categoryFilter === cat
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/15"
                        : "border-white/[0.08] bg-slate-950/40 hover:bg-white/[0.04] text-muted-foreground hover:text-white"
                    }`}
                  >
                    {CATEGORY_LANG[lang]?.[cat] || cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                <p className="text-muted-foreground text-sm font-medium">{MANDI_PAGE_LANG[lang].syncingIndex}</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <GlassCard className="border border-red-500/20 bg-red-500/5 p-8 text-center rounded-2xl">
                <p className="text-red-400 font-bold">{error}</p>
                <Button variant="outline" className="mt-4 border-white/[0.08]" onClick={() => location.reload()}>
                  {MANDI_PAGE_LANG[lang].retry}
                </Button>
              </GlassCard>
            )}

            {/* Crop cards grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCrops.map((crop, i) => (
                  <CropCard
                    key={crop.id}
                    crop={crop}
                    index={i}
                    onClick={() => {
                      trackEvent({ type: 'mandi_search', crop: crop.name, state: crop.state, lang: lang });
                      setSelectedCrop(crop);
                    }}
                    lang={lang}
                  />
                ))}
                {filteredCrops.length === 0 && (
                  <div className="col-span-full text-center py-20">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-semibold">{MANDI_PAGE_LANG[lang].noCommodities}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  CROP DETAIL + BUY/SELL VIEW                                  */}
        {/* ============================================================ */}
        {selectedCrop && (
          <motion.div
            key="crop-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors w-fit pb-2"
            >
              <ArrowLeft className="h-4.5 w-4.5" /> {MANDI_PAGE_LANG[lang].returnMarketplace}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Crop detail card */}
              <GlassCard className="lg:col-span-3 overflow-hidden border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20">
                <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(selectedCrop.category)}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r ${CATEGORY_COLORS[selectedCrop.category] || "from-gray-500/20 to-gray-500/20 text-gray-500"}`}>
                        {CATEGORY_LANG[lang]?.[selectedCrop.category] || selectedCrop.category}
                      </span>
                      <CardTitle className="text-3xl font-black font-display text-white mt-3">{translateData(selectedCrop.name, lang)}</CardTitle>
                      <p className="text-muted-foreground text-xs mt-1">{MANDI_PAGE_LANG[lang].varietyLabel}<span className="font-semibold text-white/80">{translateData(selectedCrop.variety, lang)}</span></p>
                    </div>
                    <TrendBadge trend={selectedCrop.trend} change={selectedCrop.change_percent} size="lg" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price display row */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">{MANDI_PAGE_LANG[lang].livePriceIndex}</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <IndianRupee className="h-5 w-5 text-emerald-400" />
                        <span className="text-3xl font-black text-emerald-400 font-display">
                          {selectedCrop.price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs font-medium">/{translateData(selectedCrop.unit, lang)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">{MANDI_PAGE_LANG[lang].arrivalTonnes}</span>
                      <span className="text-xl font-bold text-white block mt-1">{selectedCrop.arrival_tonnes.toLocaleString()} {t("mandi.tons")}</span>
                    </div>
                  </div>

                  {/* Price Range Visualizer */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                      <span>{t("mandi.low")}: ₹{selectedCrop.min_price.toLocaleString()}</span>
                      <span className="text-white">{t("mandi.current_model")}: ₹{selectedCrop.modal_price.toLocaleString()}</span>
                      <span>{t("mandi.high")}: ₹{selectedCrop.max_price.toLocaleString()}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-slate-900 overflow-hidden">
                      {/* Range slider indicator */}
                      <div
                        className="absolute top-0 h-full w-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                        style={{
                          left: `${((selectedCrop.modal_price - selectedCrop.min_price) / (selectedCrop.max_price - selectedCrop.min_price)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <InfoTile icon={<MapPin className="h-4 w-4 text-orange-400" />} label={MANDI_PAGE_LANG[lang].apmcMandi} value={translateData(selectedCrop.mandi, lang)} />
                    <InfoTile icon={<MapPin className="h-4 w-4 text-emerald-400" />} label={MANDI_PAGE_LANG[lang].stateCenter} value={translateData(selectedCrop.state, lang)} />
                  </div>

                  {/* Historical Graph Chart */}
                  <div className="pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs uppercase font-bold text-white tracking-wider block">{MANDI_PAGE_LANG[lang].priceHistory}</span>
                        <span className="text-[10px] text-muted-foreground">{MANDI_PAGE_LANG[lang].historyTrend}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {MANDI_PAGE_LANG[lang].liveGraph}
                      </span>
                    </div>
                    
                    <div className="h-56 w-full pr-4 pt-2">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="date" 
                              stroke="rgba(255,255,255,0.2)" 
                              fontSize={9} 
                              tickLine={false} 
                              axisLine={false} 
                              className="font-mono text-muted-foreground"
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.2)" 
                              fontSize={9} 
                              tickLine={false} 
                              axisLine={false} 
                              domain={['auto', 'auto']}
                              className="font-mono text-muted-foreground"
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#090d16', 
                                borderColor: 'rgba(255,255,255,0.08)', 
                                borderRadius: '14px',
                                fontSize: '12px',
                                color: '#fff'
                              }} 
                              labelStyle={{ color: '#64748b', fontWeight: 'bold' }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Price" 
                              stroke="#10b981" 
                              strokeWidth={2.5} 
                              fillOpacity={1} 
                              fill="url(#priceGlow)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </CardContent>
              </GlassCard>

              {/* Buy/Sell Panel */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <BuySellPanel
                  crop={selectedCrop}
                  mode={buySellMode}
                  connectionStatus={connectionStatus}
                  onConnect={handleConnect}
                  onReset={() => { setBuySellMode(null); setConnectionStatus("idle") }}
                  lang={lang}
                  onLangChange={setLang}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Crop Card ---- */
function CropCard({ crop, index, onClick, lang }: { crop: MandiCrop; index: number; onClick: () => void; lang: "en" | "hi" | "kn" }) {
  const { t } = useLanguage()
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <GlassCard
        className="cursor-pointer group overflow-hidden relative border border-white/[0.08] backdrop-blur-md shadow-lg hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 bg-slate-950/20 h-full flex flex-col justify-between"
        onClick={onClick}
      >
        <div>
          {/* Top accent bar */}
          <div className={`h-1.5 bg-gradient-to-r ${getCategoryGradient(crop.category)}`} />

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${CATEGORY_COLORS[crop.category] || "from-gray-500/20 to-gray-500/20 text-gray-500"}`}>
                  {CATEGORY_LANG[lang]?.[crop.category] || crop.category}
                </span>
                <CardTitle className="text-base font-extrabold text-white mt-3 group-hover:text-emerald-400 transition-colors truncate font-display">
                  {translateData(crop.name, lang)}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{translateData(crop.variety, lang)}</p>
              </div>
              <TrendBadge trend={crop.trend} change={crop.change_percent} />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Price */}
            <div className="flex items-baseline gap-1 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl justify-between">
              <span className="text-[10px] text-muted-foreground font-semibold">{t("mandi.modal_price")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-400 font-display">
                  ₹{crop.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/{translateData(crop.unit, lang)}</span>
              </div>
            </div>

            {/* Mandi + State */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
              <span className="truncate">{translateData(crop.mandi, lang)}, {translateData(crop.state, lang)}</span>
            </div>
          </CardContent>
        </div>

        <div className="px-6 pb-6">
          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <Button
              size="sm"
              className="flex-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/10 rounded-xl"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> {MANDI_PAGE_LANG[lang].buy}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-white/[0.08] hover:bg-white/[0.03] text-orange-400 font-bold rounded-xl"
            >
              <Tag className="h-3.5 w-3.5 mr-1" /> {MANDI_PAGE_LANG[lang].sell}
            </Button>
          </div>
        </div>

        {/* Hover accent glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </GlassCard>
    </motion.div>
  )
}

/* ---- Buy / Sell Panel ---- */
function BuySellPanel({
  crop,
  mode,
  connectionStatus,
  onConnect,
  onReset,
  lang,
  onLangChange,
}: {
  crop: MandiCrop
  mode: "buy" | "sell" | null
  connectionStatus: "idle" | "connecting" | "connected"
  onConnect: (m: "buy" | "sell") => void
  onReset: () => void
  lang: "en" | "hi" | "kn"
  onLangChange: (l: "en" | "hi" | "kn") => void
}) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      {/* Choose action */}
      <GlassCard className="border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-md font-bold font-display text-white">
            <ArrowUpDown className="h-4.5 w-4.5 text-orange-400" />
            Trade Commodity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Initiate instant trading signals or direct transactions across our verified regional logistics networks.
          </p>
          <div className="flex gap-3">
            <Button
              className={`flex-1 text-xs font-bold h-10 rounded-xl transition-all ${
                mode === "buy"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              }`}
              onClick={() => onConnect("buy")}
              disabled={connectionStatus === "connecting"}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-2" />
              Buy
            </Button>
            <Button
              className={`flex-1 text-xs font-bold h-10 rounded-xl transition-all ${
                mode === "sell"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20"
              }`}
              onClick={() => onConnect("sell")}
              disabled={connectionStatus === "connecting"}
            >
              <Tag className="h-3.5 w-3.5 mr-2" />
              Sell
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Connection status */}
      <AnimatePresence mode="wait">
        {mode && (
          <motion.div
            key={`${mode}-${connectionStatus}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard
              className={`border-2 backdrop-blur-md shadow-xl ${
                connectionStatus === "connected"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : connectionStatus === "connecting"
                  ? "border-amber-500/30 bg-amber-500/5 animate-pulse"
                  : "border-white/[0.08] bg-slate-950/20"
              }`}
            >
              <CardContent className="pt-6 space-y-4">
                {connectionStatus === "connecting" && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                    <p className="text-sm font-bold text-white font-display">
                      Connecting eNAM broker...
                    </p>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      Securing encrypted pipeline with registered trading agents for{" "}
                      <span className="font-semibold text-white">{crop.name}</span> in {crop.mandi}
                    </p>
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold text-sm font-display">
                        eNAM Agent Connected!
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-400 to-emerald-500 flex items-center justify-center text-white font-black text-[10px] shadow-md shadow-orange-500/10">
                          eNAM
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">{t("mandi.national_agriculture_market")}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Govt of India • Verification Center
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        {crop.mandi}, {crop.state}
                      </div>

                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">{t("mandi.trading_value")}</p>
                          <p className="text-base font-extrabold text-emerald-400 font-display">
                            ₹{crop.price.toLocaleString()}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              /{crop.unit}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Language switcher */}
                    <div className="flex gap-1.5 justify-center">
                      {(["hi", "en", "kn"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => onLangChange(l)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            lang === l
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/15"
                              : "border-white/[0.08] text-muted-foreground hover:bg-white/[0.04]"
                          }`}
                        >
                          {l === "hi" ? "हिंदी" : l === "kn" ? "ಕನ್ನಡ" : "English"}
                        </button>
                      ))}
                    </div>

                    {/* eNAM fill instructions */}
                    <div className="rounded-xl p-3.5 space-y-2 border border-emerald-500/20 bg-emerald-500/5">
                      <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {ENAM_LANG[lang].title}:
                      </p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] text-muted-foreground font-medium">
                        <span>{ENAM_LANG[lang].state}:</span>
                        <span className="font-bold text-white text-right">{crop.state}</span>
                        <span>{ENAM_LANG[lang].commodity}:</span>
                        <span className="font-bold text-white text-right">{crop.name.split("(")[0].trim()}</span>
                        <span>{ENAM_LANG[lang].price}:</span>
                        <span className="font-bold text-emerald-400 text-right">&#x20B9;{crop.price.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/15 rounded-xl h-10"
                        onClick={() => {
                          const commodity = crop.name.split("(")[0].trim()
                          const url = `https://enam.gov.in/web/dashboard/trade-data?state=${encodeURIComponent(crop.state)}&commodity=${encodeURIComponent(commodity)}`
                          window.open(url, "_blank", "noopener,noreferrer")
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        {ENAM_LANG[lang].proceed}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-white/[0.08] hover:bg-white/[0.03] text-muted-foreground hover:text-white rounded-xl text-xs h-10" 
                        onClick={onReset}
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-[9px] text-muted-foreground/80 leading-relaxed text-center">
                      {ENAM_LANG[lang].note}
                    </p>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Educational Guide Section ── */}
      <section className="mt-12 border-t border-white/[0.08] pt-10 select-none">
        {lang === "hi" ? (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 मंडी भाव क्या हैं और <TermTooltip term="MSP" lang={lang}>न्यूनतम समर्थन मूल्य (MSP)</TermTooltip> कैसे काम करता है?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                कृषि क्षेत्र में मंडी भाव का तात्पर्य उन दरों से है जिन पर कृषि उपज (जैसे अनाज, दलहन, तिलहन और सब्जियां) विभिन्न थोक बाजारों (कृषि उपज विपणन समितियों या APMC) में बेची जाती हैं। मंडी भाव दैनिक मांग और आपूर्ति के आधार पर उतार-चढ़ाव करते हैं। फसलों के विपणन को स्थिरता देने के लिए भारत सरकार <TermTooltip term="MSP" lang={lang}>न्यूनतम समर्थन मूल्य (MSP)</TermTooltip> लागू करती है।
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3">
                <h3 className="text-lg font-bold text-amber-400 font-display">📈 <TermTooltip term="MSP" lang={lang}>न्यूनतम समर्थन मूल्य (MSP)</TermTooltip> और इसकी आवश्यकता</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  सरकार प्रत्येक फसल सीजन से पहले कृषि लागत और मूल्य आयोग (CACP) की सिफारिशों पर 22 अनिवार्य फसलों के लिए <TermTooltip term="MSP" lang={lang}>न्यूनतम समर्थन मूल्य (MSP)</TermTooltip> की घोषणा करती है। यह किसानों के लिए एक सुरक्षा कवच है, जिससे बाजार में कीमतों में भारी गिरावट आने पर भी वे अपनी फसल एक निश्चित दर पर सरकार को बेच सकें। यह उत्तर प्रदेश, पंजाब और हरियाणा के गेहूं और धान उत्पादक किसानों के लिए विशेष रूप से सहायक है।
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3">
                <h3 className="text-lg font-bold text-amber-400 font-display">💻 राष्ट्रीय कृषि बाजार (eNAM) क्या है?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  eNAM (इलेक्ट्रॉनिक नेशनल एग्रीकल्चर मार्केट) भारत सरकार द्वारा शुरू किया गया एक अखिल भारतीय इलेक्ट्रॉनिक ट्रेडिंग पोर्टल है। यह पोर्टल मौजूदा APMC मंडियों को एक नेटवर्क में जोड़कर किसानों को अपनी उपज की ऑनलाइन नीलामी करने की सुविधा देता है। इससे बिचौलियों की भूमिका कम होती है और राजस्थान या मध्य प्रदेश का किसान भी सीधे देश के किसी भी कोने के खरीदार से बेहतर मूल्य प्राप्त कर सकता है।
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 font-display">📊 मंडी में बेहतर मूल्य प्राप्त करने की गाइड</h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
                <div className="space-y-2 border-r border-white/[0.06] pr-4">
                  <h4 className="font-extrabold text-white">1. ग्रेडिंग और छंटाई</h4>
                  <p>فसल बेचने से पहले उसकी सफाई और छंटाई जरूर करें। कंकड़-पत्थर और टूटे दाने अलग करने से मंडी में 10% से 15% तक अधिक दाम मिलता है।</p>
                </div>
                <div className="space-y-2 border-r border-white/[0.06] px-4">
                  <h4 className="font-extrabold text-white">2. नमी की जांच</h4>
                  <p>मंडियों में अनाज में नमी का स्तर मापा जाता है। मानक नमी (आमतौर पर 12-14%) से अधिक होने पर दाम घटा दिए जाते हैं। फसल को धूप में अच्छी तरह सुखाकर ही मंडी ले जाएं।</p>
                </div>
                <div className="space-y-2 pl-4">
                  <h4 className="font-extrabold text-white">3. ऑफ-सीजन बिक्री</h4>
                  <p>कटाई के तुरंत बाद सभी किसान एक साथ मंडी में फसल लाते हैं, जिससे आपूर्ति बढ़ने के कारण दाम गिर जाते हैं। यदि संभव हो तो उपज का भंडारण करें और 2-3 महीने बाद बेचें जब कीमतें बढ़ती हैं।</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ अक्सर पूछे जाने वाले प्रश्न (FAQs)</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. न्यूनतम समर्थन मूल्य (MSP) कौन निर्धारित करता है?</h4>
                  <p>भारत सरकार का कृषि लागत और मूल्य आयोग (CACP) लागत और विभिन्न कारकों का विश्लेषण कर MSP की सिफारिश करता है, और इसे आर्थिक मामलों की कैबिनेट समिति द्वारा मंजूरी दी जाती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. मंडी में मेरी फसल का भुगतान कब और कैसे होता है?</h4>
                  <p>APMC नियमों के अनुसार आढ़ती या व्यापारी को तौल के दिन ही या अधिकतम 24-48 घंटों के भीतर सीधे किसान के बैंक खाते में आरटीजीएस/ऑनलाइन माध्यम से भुगतान करना होता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. eNAM पोर्टल पर पंजीकरण कैसे करें?</h4>
                  <p>किसान नजदीकी मंडी कार्यालय में जाकर या सीधे eNAM की वेबसाइट पर अपना आधार, बैंक विवरण और भूमि दस्तावेज अपलोड कर निःशुल्क पंजीकरण करा सकते हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. मॉडल प्राइस (Modal Price) का क्या अर्थ है?</h4>
                  <p>मॉडल प्राइस का अर्थ है वह औसत दर जिस पर मंडी में उस दिन उस फसल की सबसे अधिक मात्रा बेची गई। यह न तो अधिकतम मूल्य होता है और न ही न्यूनतम मूल्य।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. यदि कोई व्यापारी MSP से कम पर फसल खरीदे तो क्या करें?</h4>
                  <p>MSP सरकारी खरीद केंद्रों (जैसे FCI, NAFED) पर ही लागू होता है। निजी मंडियों या व्यापारियों पर इसे कानूनी रूप से थोपा नहीं जा सकता, इसलिए सरकारी खरीद केंद्रों पर ही उपज बेचने का प्रयास करें।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. क्या सब्जियों और फलों पर भी MSP मिलता है?</h4>
                  <p>नहीं, वर्तमान में केवल 22 खरीफ और रबी फसलों पर ही केंद्र सरकार द्वारा MSP घोषित किया जाता है। सब्जियां और फल खराब होने वाली श्रेणी में आते हैं और इनका मूल्य मांग पर निर्भर होता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. मंडी में आढ़त शुल्क (Commission) कौन देता है?</h4>
                  <p>नए नियमों के तहत आढ़त या कमिशन का भुगतान खरीदार (व्यापारी) करता है। किसानों से किसी भी तरह का आढ़त शुल्क काटना अवैध है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. क्या दूसरे राज्य की मंडी में फसल बेचना संभव है?</h4>
                  <p>हाँ, eNAM पोर्टल और 'एक देश, एक बाजार' नीति के तहत किसान देश की किसी भी मंडी में अपनी फसल बेचने के लिए स्वतंत्र हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. फसल के कबाड़ (Trash) या डंठल को कैसे साफ करें?</h4>
                  <p>फसलों की मड़ाई (Threshing) और ओसाई (Winnowing) के आधुनिक यंत्रों का उपयोग कर हवा की मदद से हल्के तिनकों को फसल से आसानी से अलग किया जा सकता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. क्या KisaanBuddy पर भाव वास्तविक समय में अपडेट होते हैं?</h4>
                  <p>हाँ, KisaanBuddy भारत सरकार के विपणन और निरीक्षण निदेशालय (AGMARKNET) के सर्वरों से जुड़े लाइव एपीआई के माध्यम से हर दिन के मंडी भाव अपडेट करता है।</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 What Are Mandi Prices and How Does Minimum Support Price (MSP) Work?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                Mandi prices refer to the wholesale market rates at which agricultural produce (such as cereals, oilseeds, pulses, and fresh vegetables) are traded inside Agricultural Produce Market Committees (APMCs). These rates fluctuate daily based on supply and demand dynamics. To protect farm revenues, the Government of India institutes the Minimum Support Price (MSP) framework.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3">
                <h3 className="text-lg font-bold text-amber-400 font-display">📈 Minimum Support Price (MSP) and Farm Protection</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  MSP is declared by the central government prior to each sowing cycle based on recommendations from the Commission for Agricultural Costs and Prices (CACP) for 22 mandated crops. It acts as an economic safety net, guaranteeing that farmers can sell their harvests at a baseline price even if open market rates crash. This is especially vital for wheat and paddy cultivators in Punjab, Haryana, and Uttar Pradesh.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3">
                <h3 className="text-lg font-bold text-amber-400 font-display">💻 What is the eNAM Digital Trade Portal?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  eNAM (Electronic National Agriculture Market) is an all-India online trading portal launched by the central government. It links existing physical APMC mandies into a single digital market, allowing farmers to auction their products online. By eliminating middlemen commissions, it enables cultivators from states like Rajasthan or Madhya Pradesh to secure maximum payouts from buyers nationwide.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 font-display">📊 Mandi Profit Optimization Guide</h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
                <div className="space-y-2 border-r border-white/[0.06] pr-4">
                  <h4 className="font-extrabold text-white">1. Grading & Cleaning</h4>
                  <p>Sort and grade your grains to remove chaff, stones, and broken seeds. Clean bags fetch 10% to 15% higher bids in auctions compared to uncleaned lots.</p>
                </div>
                <div className="space-y-2 border-r border-white/[0.06] px-4">
                  <h4 className="font-extrabold text-white">2. Moisture Control</h4>
                  <p>Mandi agents measure moisture percentages. Anything above standard limits (typically 12-14%) results in price deductions. Air-dry your grains under the sun before dispatch.</p>
                </div>
                <div className="space-y-2 pl-4">
                  <h4 className="font-extrabold text-white">3. Off-Season Supply</h4>
                  <p>Avoid dumping crops immediately after harvest when supplies peak and prices drop. If storage facilities are accessible, delay sales by 2 to 3 months to sell during peak market demand.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ Mandi Prices FAQs</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. Who calculates the MSP rate?</h4>
                  <p>It is recommended by the CACP based on cost of cultivation and domestic/international demand, and approved by the Cabinet Committee on Economic Affairs (CCEA).</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. What is the standard payment duration in mandis?</h4>
                  <p>Under APMC acts, commission agents must settle payments directly to the farmer's bank account via RTGS/online transfer within 24 to 48 hours of weighing.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. How do I register on the eNAM platform?</h4>
                  <p>Farmers can sign up online for free via the eNAM official portal or by visiting their local APMC office with their bank account, Aadhaar card, and land patta.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. What does "Modal Price" mean?</h4>
                  <p>Modal Price is the most frequently occurring rate at which the highest volume of a specific crop was sold in the mandi during that day.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. Can I demand MSP from a private trader?</h4>
                  <p>No, MSP is only legally binding for government procurement agencies. Private traders buy based on open-market demand, which is why utilizing government silos is recommended.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. Are fruits and vegetables covered under MSP?</h4>
                  <p>No, currently only 22 grains, pulses, oilseeds, and cotton are covered under the central government's MSP framework.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. Who pays the commission agent's fee?</h4>
                  <p>The buyer (trader) is responsible for commission fees. Deducting commission or mandi fee from the farmer's payout is strictly illegal.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. Is it possible to sell crops to other states?</h4>
                  <p>Yes, eNAM and inter-state trade permits allow selling to buyers located anywhere in India.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. How do we remove dirt and stones from paddy?</h4>
                  <p>Run grain pre-cleaners or perform manual winnowing to let wind carry away empty husks and light dirt particles.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. Where does KisaanBuddy get its mandi prices from?</h4>
                  <p>We aggregate mandi prices daily through live connections to the Ministry of Agriculture's AGMARKNET databases.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function TrendBadge({ trend, change, size = "sm" }: { trend: string; change: number; size?: "sm" | "lg" }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const color = trend === "up" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.1)]" : trend === "down" ? "text-rose-400 bg-rose-500/10 border border-rose-500/10" : "text-muted-foreground bg-white/[0.03] border border-white/[0.04]"
  const sizeClass = size === "lg" ? "px-3 py-1.5 text-xs gap-1.5 rounded-xl" : "px-2.5 py-1 text-[9px] gap-1 rounded-lg"
  return (
    <span className={`inline-flex items-center font-bold tracking-tight ${color} ${sizeClass}`}>
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {change > 0 ? "+" : ""}{change}%
    </span>
  )
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
        {icon} 
        <span>{label}</span>
      </div>
      <p className="text-sm font-bold text-white truncate">{value}</p>
    </div>
  )
}

function getCategoryGradient(category: string): string {
  const map: Record<string, string> = {
    Cereal: "from-amber-400 to-yellow-500",
    Oilseed: "from-lime-400 to-green-500",
    Pulse: "from-orange-400 to-red-500",
    Fiber: "from-blue-400 to-indigo-500",
    Vegetable: "from-emerald-400 to-teal-500",
    "Cash Crop": "from-purple-400 to-fuchsia-500",
  }
  return map[category] || "from-gray-400 to-gray-500"
}
