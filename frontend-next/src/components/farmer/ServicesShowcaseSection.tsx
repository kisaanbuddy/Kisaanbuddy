"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Stethoscope,
  TrendingUp,
  Store,
  Users,
  FlaskConical,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

interface LocalizedText {
  hi: string;
  en: string;
  kn: string;
}

interface ShowcaseService {
  number: string;
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  badge: LocalizedText;
  statHighlight?: LocalizedText;
  capabilities: LocalizedText[];
  cta: LocalizedText;
  href: string;
  image: string;
  imageAlt: LocalizedText;
  icon: LucideIcon;
  accentColor: string;
}

const SERVICES_DATA: ShowcaseService[] = [
  {
    number: "01",
    id: "crop-doctor",
    title: {
      hi: "फसल डॉक्टर (रोग पहचान)",
      en: "Crop Doctor",
      kn: "ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ (ಬೆಳೆ ರೋಗ ಪತ್ತೆ)",
    },
    description: {
      hi: "Find help when your crop looks unhealthy. पत्ती की फोटो खींचकर तुरंत बीमारी, लक्षण और सटीक दवा जानें।",
      en: "Find help when your crop looks unhealthy. Diagnose fungal blights, rusts, and pests with instant step-by-step remedies.",
      kn: "Find help when your crop looks unhealthy. ಎಲೆಯ ಫೋಟೋ ಮೂಲಕ ತಕ್ಷಣ ರೋಗ ಪತ್ತೆಹಚ್ಚಿ ಸೂಕ್ತ ಔಷಧೋಪಚಾರ ತಿಳಿಯಿರಿ.",
    },
    badge: {
      hi: "त्वरित AI रोग जांच",
      en: "Instant Leaf Analysis",
      kn: "ತ್ವರಿತ ರೋಗ ವಿಶ್ಲೇಷಣೆ",
    },
    statHighlight: {
      hi: "100+ फसलों की रोग लाइब्रेरी",
      en: "100+ Crop Disease Database",
      kn: "100+ ಬೆಳೆ ರೋಗಗಳ ಮಾಹಿತಿ",
    },
    capabilities: [
      {
        hi: "प्रभावित पत्ती की फोटो से तुरंत रोग पहचान",
        en: "Instant photo symptom diagnosis from your phone camera",
        kn: "ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಫೋಟೋ ಮೂಲಕ ತಕ್ಷಣ ರೋಗ ಪತ್ತೆ",
      },
      {
        hi: "नीम तेल व जैविक घरेलू उपचार के सटीक तरीके",
        en: "Organic biological remedies & preventive farm sanitation",
        kn: "ಬೇವಿನ ಎಣ್ಣೆ ಮತ್ತು ಸಾವಯವ ನೈಸರ್ಗಿಕ ಔಷಧ ಸಲಹೆ",
      },
      {
        hi: "अनुमोदित कीटनाशक की प्रति एकड़ सुरक्षित खुराक",
        en: "Approved chemical spray dosage per acre or bigha",
        kn: "ಪ್ರಮಾಣೀಕೃತ ಔಷಧಗಳ ನಿಖರ ಎಕರೆ ಪ್ರಮಾಣ",
      },
    ],
    cta: {
      hi: "Check My Crop / फसल जांचें",
      en: "Check My Crop",
      kn: "Check My Crop / ಬೆಳೆ ಪರೀಕ್ಷಿಸಿ",
    },
    href: "/disease",
    image: "/images/crop-doctor/powdery-mildew-leaf.webp",
    imageAlt: {
      hi: "खेत में बीमारी से प्रभावित पौधे की पत्ती",
      en: "Authentic close-up photography of crop leaves and disease symptoms",
      kn: "ರೋಗಪೀಡಿತ ಬೆಳೆಯ ಎಲೆಯ ಹತ್ತಿರದ ಚಿತ್ರ",
    },
    icon: Stethoscope,
    accentColor: "emerald",
  },
  {
    number: "02",
    id: "mandi-prices",
    title: {
      hi: "मंडी भाव (लाइव APMC दरें)",
      en: "Mandi Prices",
      kn: "ಮಂಡಿ ದರಗಳು (APMC)",
    },
    description: {
      hi: "Check market prices for your crops. अपने जिले और आस-पास की मंडियों में आज के सरकारी भाव और मूल्य रुझान देखें।",
      en: "Check market prices for your crops. Access real-time AGMARKNET APMC wholesale rates and commodity trends.",
      kn: "Check market prices for your crops. ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಮಂಡಿಗಳಲ್ಲಿ ಇಂದಿನ ಸರಕು ದರಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿಯನ್ನು ತಿಳಿಯಿರಿ.",
    },
    badge: {
      hi: "दैनिक AGMARKNET डेटा",
      en: "Live Mandi Rates",
      kn: "ಲೈವ್ ಮಂಡಿ ದರಗಳು",
    },
    statHighlight: {
      hi: "2,400+ सरकारी मंडियां",
      en: "2,400+ APMC Markets",
      kn: "2,400+ ಕೃಷಿ ಮಾರುಕಟ್ಟೆಗಳು",
    },
    capabilities: [
      {
        hi: "गेहूं, धान, कपास और सब्जियों के आज के ताज़ा भाव",
        en: "Real-time rates for wheat, paddy, cotton and local produce",
        kn: "ಗೋಧಿ, ಭತ್ತ, ಹತ್ತಿ ಮತ್ತು ತರಕಾರಿಗಳ ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರ",
      },
      {
        hi: "आस-पास की मंडियों में कीमतों की आसान तुलना",
        en: "Compare nearby wholesale mandis to maximize harvest profits",
        kn: "ಹೆಚ್ಚು ಲಾಭ ಪಡೆಯಲು ಸಮೀಪದ ಮಂಡಿ ದರಗಳ ಹೋಲಿಕೆ",
      },
      {
        hi: "सरकारी MSP व मूल्य उतार-चढ़ाव का ऐतिहासिक चार्ट",
        en: "Official MSP benchmarks and historical price trends",
        kn: "ಸರ್ಕಾರಿ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಮತ್ತು ಬೆಲೆ ಇಳಿಕೆ-ಏರಿಕೆ ವರದಿ",
      },
    ],
    cta: {
      hi: "Check Mandi Prices / भाव देखें",
      en: "Check Mandi Prices",
      kn: "Check Mandi Prices / ದರ ಪರಿಶೀಲಿಸಿ",
    },
    href: "/mandi",
    image: "/images/mandi/grain-market-mandi.webp",
    imageAlt: {
      hi: "अनाज मंडी में अपनी उपज के साथ भारतीय किसान",
      en: "Real Indian agricultural mandi with farmers and produce",
      kn: "ಕೃಷಿ ಉತ್ಪನ್ನಗಳ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ರೈತರು",
    },
    icon: TrendingUp,
    accentColor: "amber",
  },
  {
    number: "03",
    id: "sell-crops",
    title: {
      hi: "फसल बिक्री व खरीदार",
      en: "Sell Your Crops",
      kn: "ಬೆಳೆ ಮಾರಾಟ ಮತ್ತು ಖರೀದಿದಾರರು",
    },
    description: {
      hi: "Find opportunities to sell your farm produce. बिना किसी बिचौलिए के सीधे सत्यापित थोक खरीदारों और व्यापारियों से जुड़ें।",
      en: "Find opportunities to sell your farm produce. Connect directly with verified buyers, mills, and traders with zero commission.",
      kn: "Find opportunities to sell your farm produce. ಯಾವುದೇ ದಲ್ಲಾಳಿಗಳಿಲ್ಲದೆ ನೇರವಾಗಿ ಖರೀದಿದಾರರಿಗೆ ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ.",
    },
    badge: {
      hi: "सीधा खरीदार संपर्क",
      en: "Direct Buyer Access",
      kn: "ನೇರ ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕ",
    },
    statHighlight: {
      hi: "0% बिचौलिया कमीशन",
      en: "0% Middleman Fees",
      kn: "ಯಾವುದೇ ಕಮಿಷನ್ ಇಲ್ಲ",
    },
    capabilities: [
      {
        hi: "अपनी उपज की फोटो व मात्रा डालकर सीधे लिस्टिंग बनाएं",
        en: "List harvest volume and expected price in a few taps",
        kn: "ಬೆಳೆಯ ವಿವರ ಮತ್ತು ನಿರೀಕ್ಷಿತ ಬೆಲೆಯನ್ನು ಸುಲಭವಾಗಿ ಪೋಸ್ಟ್ ಮಾಡಿ",
      },
      {
        hi: "सत्यापित व्यापारियों से सीधी बातचीत और खरीद अनुरोध",
        en: "Direct WhatsApp and phone inquiries from verified buyers",
        kn: "ನೋಂದಾಯಿತ ವ್ಯಾಪಾರಿಗಳೊಂದಿಗೆ ನೇರ ಮಾತುಕತೆ",
      },
      {
        hi: "थोक खरीदारी मांग और स्थानीय खरीद केंद्रों की जानकारी",
        en: "Discover active bulk purchase requirements across your state",
        kn: "ಸಗಟು ಖರೀದಿ ಬೇಡಿಕೆಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಕೇಂದ್ರಗಳ ಮಾಹಿತಿ",
      },
    ],
    cta: {
      hi: "Sell My Crops / फसल बेचें",
      en: "Sell My Crops",
      kn: "Sell My Crops / ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ",
    },
    href: "/marketplace",
    image: "/images/marketplace/vegetable-mandi.webp",
    imageAlt: {
      hi: "सब्जी मंडी में ताजी उपज प्रस्तुत करते विक्रेता",
      en: "Indian farmer harvesting or presenting fresh produce",
      kn: "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ತಾಜಾ ಕೃಷಿ ಉತ್ಪನ್ನಗಳ ಮಾರಾಟ",
    },
    icon: Store,
    accentColor: "emerald",
  },
  {
    number: "04",
    id: "farming-help-labour",
    title: {
      hi: "खेत मजदूर व कृषि मशीनरी",
      en: "Farming Help & Labour",
      kn: "ಕೂಲಿ ಕಾರ್ಮಿಕರು & ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ",
    },
    description: {
      hi: "Find help with farming work, labour and available equipment. बुवाई, निराई और कटाई के लिए मजदूर और किराए पर ट्रैक्टर पाएं।",
      en: "Find help with farming work, labour and available equipment. Hire verified farm workers, tractors, rotavators, and harvesters.",
      kn: "Find help with farming work, labour and available equipment. ಕೃಷಿ ಕೆಲಸಕ್ಕೆ ಕೂಲಿ ಆಳುಗಳು ಮತ್ತು ಬಾಡಿಗೆ ಟ್ರ್ಯಾಕ್ಟರ್ ಪಡೆಯಿರಿ.",
    },
    badge: {
      hi: "विश्वसनीय स्थानीय मजदूर",
      en: "Farm Support Network",
      kn: "ಕೃಷಿ ಸಹಾಯಕ ಜಾಲ",
    },
    statHighlight: {
      hi: "पारदर्शी दैनिक मजदूरी दरें",
      en: "Verified Hourly & Daily Rates",
      kn: "ಪಾರದರ್ಶಕ ದಿನಗೂಲಿ ದರಗಳು",
    },
    capabilities: [
      {
        hi: "खेत में बुवाई, रोपाई और कटाई के लिए कुशल मजदूर समूह",
        en: "Connect with local skilled farm labourers for seasonal peak tasks",
        kn: "ಬಿತ್ತನೆ ಮತ್ತು ಕಟಾವು ಕೆಲಸಕ್ಕೆ ಸ್ಥಳೀಯ ನುರಿತ ಕಾರ್ಮಿಕರು",
      },
      {
        hi: "ट्रैक्टर, कंबाइन हार्वेस्टर और रोटावेटर किराया सेवा",
        en: "Rent nearby tractors, laser levellers, and crop harvesters",
        kn: "ಟ್ರ್ಯಾಕ್ಟರ್, ಹಾರ್ವೆಸ್ಟರ್ ಮತ್ತು ಕೃಷಿ ಉಪಕರಣ ಬಾಡಿಗೆ",
      },
      {
        hi: "अपने क्षेत्र के अन्य किसानों और कारीगरों से सीधा संपर्क",
        en: "Direct phone connection with local equipment operators",
        kn: "ಸ್ಥಳೀಯ ಯಂತ್ರ ಚಾಲಕರೊಂದಿಗೆ ನೇರ ಫೋನ್ ಸಂಪರ್ಕ",
      },
    ],
    cta: {
      hi: "Get Farming Help / मजदूर खोजें",
      en: "Get Farming Help",
      kn: "Get Farming Help / ಸಹಾಯ ಪಡೆಯಿರಿ",
    },
    href: "/worker-connect",
    image: "/images/farmers/farmer-field-tending.webp",
    imageAlt: {
      hi: "खेत में खाद डालते और फसल की देखभाल करते भारतीय किसान",
      en: "Authentic Indian agricultural work and machinery photography",
      kn: "ಹೊಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವ ಭಾರತೀಯ ರೈತ",
    },
    icon: Users,
    accentColor: "sky",
  },
  {
    number: "05",
    id: "soil-health",
    title: {
      hi: "मृदा स्वास्थ्य व खाद सलाह",
      en: "Soil Health & Nutrition",
      kn: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು ರಸಗೊಬ್ಬರ",
    },
    description: {
      hi: "Measure soil nutrients and calculate exact fertilizer quantities. मिट्टी की सेहत सुधारें और अनावश्यक खाद का खर्च बचाएं।",
      en: "Measure soil nutrients and calculate exact fertilizer quantities. Balance NPK ratios, track soil pH, and optimize crop yields.",
      kn: "ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ಸರಿಯಾದ ಪ್ರಮಾಣದ ರಸಗೊಬ್ಬರ ಲೆಕ್ಕಹಾಕಿ ಇಳುವರಿ ಹೆಚ್ಚಿಸಿ.",
    },
    badge: {
      hi: "संतुलित पोषण प्रबंधन",
      en: "Precision Soil Science",
      kn: "ನಿಖರ ಮಣ್ಣು ಪರೀಕ್ಷೆ",
    },
    statHighlight: {
      hi: "खाद के खर्च में 20-30% बचत",
      en: "Save 20-30% on Inputs",
      kn: "ವೆಚ್ಚದಲ್ಲಿ ಗಣನೀಯ ಉಳಿತಾಯ",
    },
    capabilities: [
      {
        hi: "NPK, जैविक कार्बन और pH स्तर की आसान व्याख्या",
        en: "Clear interpretation of Nitrogen, Phosphorus, Potassium and pH",
        kn: "ಸಾರಜನಕ, ರಂಜಕ, ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಪಿಎಚ್ ಮಟ್ಟದ ನಿಖರ ವಿವರ",
      },
      {
        hi: "बीघा और एकड़ के अनुसार यूरिया, डीएपी व पोटाश की सही मात्रा",
        en: "Exact fertilizer quantity calculator tailored to crop and land size",
        kn: "ಎಕರೆಗೆ ತಕ್ಕಂತೆ ಯೂರಿಯಾ, ಡಿಎಪಿ ಸರಿಯಾದ ಪ್ರಮಾಣದ ಲೆಕ್ಕಾಚಾರ",
      },
      {
        hi: "जैविक खाद, गोबर खाद और सूक्ष्म पोषक तत्वों की सिफारिश",
        en: "Organic composting and micronutrient enrichment guidelines",
        kn: "ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶಗಳ ಸಮಗ್ರ ಮಾರ್ಗದರ್ಶಿ",
      },
    ],
    cta: {
      hi: "Check Soil Health / मिट्टी जांचें",
      en: "Check Soil Health",
      kn: "Check Soil Health / ಮಣ್ಣು ಪರೀಕ್ಷಿಸಿ",
    },
    href: "/soil-health",
    image: "/images/soil/soil-ph-testing.webp",
    imageAlt: {
      hi: "मिट्टी के pH और पोषक तत्वों की प्रयोगशाला व क्षेत्रीय जांच",
      en: "Laboratory and field agronomic soil pH and nutrient sampling",
      kn: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ",
    },
    icon: FlaskConical,
    accentColor: "amber",
  },
  {
    number: "06",
    id: "government-schemes",
    title: {
      hi: "सरकारी किसान योजनाएं",
      en: "Government Schemes",
      kn: "ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು",
    },
    description: {
      hi: "Discover central and state agricultural welfare schemes. पीएम-किसान, फसल बीमा, सोलर पंप और ड्रिप अनुदान की जानकारी लें।",
      en: "Discover central and state agricultural welfare schemes. Verified eligibility, application steps, and subsidy subsidies.",
      kn: "ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರದ ಕೃಷಿ ಯೋಜನೆಗಳು, ಸಬ್ಸಿಡಿ ಮತ್ತು ವಿಮಾ ವಿವರಗಳನ್ನು ಸುಲಭವಾಗಿ ತಿಳಿಯಿರಿ.",
    },
    badge: {
      hi: "सत्यापित सरकारी योजनाएं",
      en: "Verified Welfare Portal",
      kn: "ದೃಢೀಕೃತ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    },
    statHighlight: {
      hi: "प्रत्यक्ष डीबीटी सहायता",
      en: "Direct DBT Subsidies",
      kn: "ನೇರ ನಗದು ವರ್ಗಾವಣೆ",
    },
    capabilities: [
      {
        hi: "पीएम-किसान, फसल बीमा, कुसुम सोलर और ड्रिप सब्सिडी गाइड",
        en: "Guides for PM-KISAN, PMFBY crop insurance, and solar pumps",
        kn: "ಪಿಎಂ-ಕಿಸಾನ್, ಫಸಲ್ ಬಿಮಾ ಮತ್ತು ಸೋಲಾರ್ ಪಂಪ್ ಯೋಜನೆಗಳ ಮಾಹಿತಿ",
      },
      {
        hi: "सरल भाषा में पात्रता नियम और जरूरी दस्तावेजों की सूची",
        en: "Check eligibility criteria and required documents in plain language",
        kn: "ಯೋಜನೆಗೆ ಅರ್ಹತೆ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳ ವಿವರ",
      },
      {
        hi: "आधिकारिक सरकारी पोर्टलों के सीधे आवेदन लिंक",
        en: "Direct one-tap links to official state and central scheme portals",
        kn: "ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳಿಗೆ ಅಧಿಕೃತ ನೇರ ಸಂಪರ್ಕ",
      },
    ],
    cta: {
      hi: "View Govt Schemes / योजनाएं देखें",
      en: "View Govt Schemes",
      kn: "View Govt Schemes / ಯೋಜನೆಗಳನ್ನು ನೋಡಿ",
    },
    href: "/schemes",
    image: "/images/crops/indian-paddy-field.webp",
    imageAlt: {
      hi: "ग्रामीण भारत में हरे-भरे धान के खेत और कृषि परिदृश्य",
      en: "Indian rural agricultural landscape and paddy crops",
      kn: "ಭಾರತೀಯ ಕೃಷಿ ಭೂಮಿ ಮತ್ತು ಬೆಳೆಗಳು",
    },
    icon: Landmark,
    accentColor: "indigo",
  },
];

export function ServicesShowcaseSection() {
  const { lang } = useLanguage();
  const currentLang: "hi" | "en" | "kn" =
    lang === "kn" ? "kn" : lang === "en" ? "en" : "hi";

  const SECTION_INTRO = {
    badge: {
      hi: "खेती की प्रमुख सेवाएं",
      en: "COMPREHENSIVE FARMING SUITE",
      kn: "ಕೃಷಿಯ ಸಮಗ್ರ ಸೇವೆಗಳು",
    },
    heading: {
      hi: "खेत का हर काम, अब एक ही जगह",
      en: "Everything Your Farm Needs, All in One Place",
      kn: "ನಿಮ್ಮ ಕೃಷಿಗೆ ಬೇಕಾದ ಎಲ್ಲಾ ಅಗತ್ಯಗಳು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ",
    },
    description: {
      hi: "फसल सुरक्षा से लेकर उपज बिक्री तक, खेती के हर काम को आसान बनाने वाली उपयोगी सेवाएं।",
      en: "From crop care to market opportunities, find useful farming services to make your everyday work easier.",
      kn: "ಬೆಳೆ ಸಂರಕ್ಷಣೆಯಿಂದ ಹಿಡಿದು ಮಾರುಕಟ್ಟೆ ಅವಕಾಶಗಳವರೆಗೆ, ನಿಮ್ಮ ಕೃಷಿ ಕೆಲಸವನ್ನು ಸುಲಭಗೊಳಿಸುವ ಉಪಯುಕ್ತ ಸೇವೆಗಳು.",
    },
  };

  return (
    <section
      id="services-showcase-section"
      aria-label="Agricultural Services Showcase"
      className="space-y-12 sm:space-y-16 py-4"
    >
      {/* ── Section Introduction (Centered, Editorial Heading) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-3xl mx-auto space-y-3 px-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#174B35]/10 dark:bg-emerald-950/60 text-[#174B35] dark:text-emerald-300 border border-[#174B35]/20 dark:border-emerald-800/60 text-xs font-extrabold uppercase tracking-widest shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-[#27834A] dark:text-emerald-400" />
          <span>{SECTION_INTRO.badge[currentLang]}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
          {SECTION_INTRO.heading[currentLang]}
        </h2>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">
          {SECTION_INTRO.description[currentLang]}
        </p>
      </motion.div>

      {/* ── Alternating Service Showcase Units ── */}
      <div className="space-y-10 sm:space-y-14 md:space-y-16">
        {SERVICES_DATA.map((service, index) => {
          const isEven = index % 2 === 0;
          const IconComponent = service.icon;

          return (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.65,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/95 overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                {/* ── Photograph Column ── */}
                <div
                  className={`md:col-span-6 lg:col-span-7 relative min-h-[220px] sm:min-h-[280px] md:min-h-[380px] overflow-hidden bg-stone-100 dark:bg-stone-800 ${
                    isEven ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={service.imageAlt[currentLang]}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 650px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* Gradient lighting mask for editorial polish */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-950/15 to-transparent md:hidden" />

                  {/* Subtle Corner Stat Badge on Image */}
                  {service.statHighlight && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                        {service.statHighlight[currentLang]}
                      </span>
                    </div>
                  )}

                  {/* Mobile service number pill */}
                  <div className="absolute bottom-4 right-4 z-10 md:hidden">
                    <span className="font-mono text-xs font-extrabold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      {service.number}
                    </span>
                  </div>
                </div>

                {/* ── Information Panel Column ── */}
                <div
                  className={`md:col-span-6 lg:col-span-5 p-6 sm:p-8 md:p-9 lg:p-10 flex flex-col justify-between space-y-6 ${
                    isEven ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Service Number & Icon & Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="hidden md:inline-block font-mono text-sm font-extrabold tracking-widest text-[#174B35] dark:text-emerald-400">
                          {service.number}
                        </span>
                        <span className="hidden md:inline-block text-stone-300 dark:text-stone-700">
                          /
                        </span>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-[#174B35] dark:text-emerald-300 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                          <IconComponent className="h-5 w-5 stroke-[2.2]" />
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-[11px] font-bold text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80">
                        {service.badge[currentLang]}
                      </span>
                    </div>

                    {/* Service Title */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight leading-snug">
                      {service.title[currentLang]}
                    </h3>

                    {/* Short Farmer-Friendly Description */}
                    <p className="text-xs sm:text-sm md:text-[15px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      {service.description[currentLang]}
                    </p>

                    {/* Capabilities List (2-3 genuine, existing features) */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80">
                      <ul className="space-y-2.5">
                        {service.capabilities.map((cap, capIdx) => (
                          <li
                            key={capIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#27834A] dark:text-emerald-400 mt-0.5" />
                            <span className="leading-snug">
                              {cap[currentLang]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-4">
                    <Link
                      href={service.href}
                      className="group/btn inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-[#174B35] dark:bg-emerald-700 hover:bg-[#123b2a] dark:hover:bg-emerald-600 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    >
                      <span>{service.cta[currentLang]}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default ServicesShowcaseSection;
