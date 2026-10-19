"use client";

import Link from "next/link";
import {
  Sparkles,
  Layers,
  Bug,
  CloudSun,
  FlaskConical,
  TrendingUp,
  Store,
  Landmark,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Languages,
  Cpu,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

export function FeaturesClient() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";
  const isKn = lang === "kn";

  const features = [
    {
      icon: Sparkles,
      title: isKn ? "AI ಕೃಷಿ ಸಲಹೆಗಾರ" : isHi ? "एआई कृषि सलाहकार" : "AI Farm Advisor",
      category: isKn ? "ಬುದ್ಧಿವಂತ ಸಲಹೆ" : isHi ? "बुद्धिमान सलाह" : "Intelligent Advisory",
      image: "/images/farmers/farmer-field-tending.jpg",
      imageAlt: "Indian farmer working in field managing nutrient application",
      description: isKn
        ? "ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಬೆಳೆ ತಳಿ, ಬಿತ್ತನೆ ದಿನಾಂಕ, ಮಣ್ಣಿನ ಪಿಎಚ್ ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ವೈಯಕ್ತೀಕರಿಸಿದ ಸಂಭಾಷಣಾ ಕೃಷಿ ಸಹಾಯಕ. ಧ್ವನಿ ಇನ್‌ಪುಟ್‌ನೊಂದಿಗೆ 10 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯವಿದೆ."
        : isHi
        ? "आपकी विशिष्ट फसल किस्म, बुवाई की तारीख, मिट्टी के पीएच और सूक्ष्म जलवायु के अनुसार व्यक्तिगत कृषि सहायक। वॉयस इनपुट के साथ 10 भारतीय भाषाओं में उपलब्ध।"
        : "Conversational agronomy assistant personalized to your specific crop variety, sowing date, soil pH, and microclimate. Available in 10 Indian languages with voice input.",
      href: "/chatbot",
      cta: isKn ? "AI ಸಲಹೆ ಪಡೆಯಿರಿ" : isHi ? "एआई सलाहकार से पूछें" : "Consult AI Advisor",
      accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      icon: Layers,
      title: isKn ? "ರೈತರ ಪ್ರೊಫೈಲ್ & ಜಮೀನು ಮ್ಯಾಪಿಂಗ್" : isHi ? "किसान प्रोफाइल और खेत मैपिंग" : "Farmer Profile & Plot Mapping",
      category: isKn ? "ಕೃಷಿ ನಿರ್ವಹಣೆ" : isHi ? "फार्म प्रबंधन" : "Farm Management",
      image: "/images/crops/indian-paddy-field.jpg",
      imageAlt: "Lush green agricultural crop field in rural India",
      description: isKn
        ? "ನಿಖರವಾದ, ಋತುಮಾನದ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಜಮೀನು ವಿಸ್ತೀರ್ಣ, ಮಣ್ಣಿನ ಪ್ರಕಾರ, ನೀರಾವರಿ ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಪ್ರತ್ಯೇಕ ಪ್ಲಾಟ್-ಟು-ಬೆಳೆ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸುವ ಶಾಶ್ವತ ಡಿಜಿಟಲ್ ಗುರುತು."
        : isHi
        ? "मौसम भर सटीक मार्गदर्शन के लिए रकबा, मिट्टी का प्रकार, सिंचाई सुविधाएं और व्यक्तिगत भूखंड-वार फसल विवरण संग्रहीत करने वाली स्थायी डिजिटल पहचान।"
        : "A permanent digital identity storing acreage, soil type, irrigation facilities, and individual plot-to-crop mappings for tailored, season-long guidance.",
      href: "/profile",
      cta: isKn ? "ಕೃಷಿ ಪ್ರೊಫೈಲ್ ನಿರ್ವಹಿಸಿ" : isHi ? "फार्म प्रोफ़ाइल प्रबंधित करें" : "Manage Farm Profile",
      accent: "text-teal-700 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300",
    },
    {
      icon: Bug,
      title: isKn ? "ಬೆಳೆ ರೋಗ ತಪಾಸಣೆ (ಕ್ರಾಪ್ ಡಾಕ್ಟರ್)" : isHi ? "फसल डॉक्टर (रोग निदान)" : "Crop Doctor",
      category: isKn ? "ರೋಗ ರೋಗನಿರ್ಣಯ" : isHi ? "रोग निदान" : "Disease Diagnostics",
      image: "/images/crop-doctor/powdery-mildew-leaf.jpg",
      imageAlt: "Close-up of crop leaf diagnosed with fungal mildew",
      description: isKn
        ? "ಕಂಪ್ಯೂಟರ್ ದೃಷ್ಟಿ ತಂತ್ರಜ್ಞಾನದಿಂದ ಚಾಲಿತವಾದ ತ್ವರಿತ ದೃಶ್ಯ ರೋಗ ಪತ್ತೆಹಚ್ಚುವಿಕೆ. ರೋಗಲಕ್ಷಣಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು, ಶಿಲೀಂಧ್ರ ಒತ್ತಡವನ್ನು ನಿರ್ಣಯಿಸಲು ಮತ್ತು ಅನುಮೋದಿತ ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳನ್ನು ಪಡೆಯಲು ಎಲೆಯ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ."
        : isHi
        ? "कंप्यूटर विजन द्वारा संचालित तुरंत दृश्य रोग पहचान। लक्षणों का निदान करने, फंगल संक्रमण का आकलन करने और अनुमोदित उपचार प्राप्त करने के लिए पत्ती का फोटो अपलोड करें।"
        : "Instant visual disease identification powered by computer vision. Upload a leaf photo to diagnose symptoms, assess fungal pressure, and receive approved treatment steps.",
      href: "/disease",
      cta: isKn ? "ಬೆಳೆ ಪರೀಕ್ಷಿಸಿ" : isHi ? "फसल की जांच करें" : "Diagnose Crops",
      accent: "text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300",
    },
    {
      icon: CloudSun,
      title: isKn ? "ಕೃಷಿ-ಹವಾಮಾನ & ಕಾರ್ಯಾಚರಣೆಯ ಮುನ್ನೆಚ್ಚರಿಕೆ" : isHi ? "कृषि-मौसम और परिचालन जोखिम" : "Agro-Weather & Operational Risk",
      category: isKn ? "ಜಮೀನು ಹವಾಮಾನ" : isHi ? "खेत का मौसम" : "Field Climate",
      image: "/images/weather/monsoon-farmland.jpg",
      imageAlt: "Indian agricultural landscape under monsoon clouds",
      description: isKn
        ? "ಕಾರ್ಯಾಚರಣೆಯ ನಿರ್ಧಾರ ಬೆಂಬಲದೊಂದಿಗೆ ಸಂಯೋಜಿಸಲ್ಪಟ್ಟ ಹೈಪರ್-ಲೋಕಲ್ ಮುನ್ಸೂಚನೆ: ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ ಸಮಯ, ಸೂಕ್ತ ನೀರಾವರಿ ಸಮಯ ಮತ್ತು ಶಾಖದ ಒತ್ತಡದ ಎಚ್ಚರಿಕೆಗಳು."
        : isHi
        ? "कार्यात्मक निर्णय समर्थन के साथ स्थानीय मौसम पूर्वानुमान: कीटनाशक छिड़काव उपयुक्तता, इष्टतम सिंचाई समय और हीट स्ट्रेस अलर्ट।"
        : "Hyperlocal forecast combined with operational decision support: pesticide spray suitability, optimal irrigation windows, and heat stress alerts.",
      href: "/weather",
      cta: isKn ? "ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ" : isHi ? "पूर्वानुमान देखें" : "Check Forecast",
      accent: "text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300",
    },
    {
      icon: FlaskConical,
      title: isKn ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ & ಪೋಷಕಾಂಶ ಸಮತೋಲನ" : isHi ? "मृदा स्वास्थ्य और पोषक तत्व संतुलन" : "Soil Health & Nutrient Balancer",
      category: isKn ? "ಮಣ್ಣು ವಿಜ್ಞಾನ" : isHi ? "मृदा विज्ञान" : "Soil Science",
      image: "/images/soil/soil-ph-testing.jpg",
      imageAlt: "Scientific field soil pH and nutrient test with color chart",
      description: isKn
        ? "N-P-K ನಿಕ್ಷೇಪಗಳು, ಸಾವಯವ ಇಂಗಾಲದ ಶೇಕಡಾವಾರು ಮತ್ತು ಮಣ್ಣಿನ ಪಿಎಚ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ. ಪ್ರಯೋಗಾಲಯ-ಪರಿಶೀಲಿಸಿದ ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ರೈತರ ಅಂದಾಜುಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಗುರುತಿಸುತ್ತದೆ."
        : isHi
        ? "एन-पी-के भंडार, जैविक कार्बन प्रतिशत और मिट्टी के पीएच को ट्रैक करें। प्रयोगशाला-सत्यापित मृदा स्वास्थ्य कार्ड और किसान अनुमानों के बीच स्पष्ट अंतर करता है।"
        : "Track N-P-K reserves, organic carbon percentage, and soil pH. Distinguishes lab-verified Soil Health Cards from baseline farmer estimates.",
      href: "/soil-health",
      cta: isKn ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ನೋಡಿ" : isHi ? "मृदा स्वास्थ्य देखें" : "View Soil Health",
      accent: "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300",
    },
    {
      icon: TrendingUp,
      title: isKn ? "ಮಂಡಿ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ" : isHi ? "मंडी बाज़ार इंटेलिजेंस" : "Mandi Market Intelligence",
      category: isKn ? "ಮಾರುಕಟ್ಟೆ ದರಗಳು" : isHi ? "मंडी भाव" : "Market Prices",
      image: "/images/mandi/grain-market-mandi.jpg",
      imageAlt: "Wholesale grain market with bags of harvested crops",
      description: isKn
        ? "ಅಧಿಕೃತ AGMARKNET ಫೀಡ್‌ಗಳಿಂದ ಚಾಲಿತವಾದ ಭಾರತೀಯ APMC ಮಂಡಿಗಳಲ್ಲಿ ನೈಜ-ಸಮಯದ ಸರಕು ಆಗಮನ ದರಗಳು. ಪ್ರಾದೇಶಿಕ ದರಗಳು ಮತ್ತು ಸ್ಪಾಟ್ ಬೆಲೆ ಪ್ರವೃತ್ತಿಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ."
        : isHi
        ? "आधिकारिक AGMARKNET फ़ीड द्वारा संचालित भारतीय APMC मंडियों में वास्तविक समय की वस्तु आवक दरें। क्षेत्रीय दरों और हाजिर मूल्य रुझानों की तुलना करें।"
        : "Real-time commodity arrival rates across Indian APMC mandis powered by official AGMARKNET feeds. Compare regional rates and spot price trends.",
      href: "/mandi",
      cta: isKn ? "ಮಂಡಿ ದರಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ" : isHi ? "मंडी भाव ट्रैक करें" : "Track Mandi Rates",
      accent: "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      icon: Store,
      title: isKn ? "ನೇರ ಮಾರುಕಟ್ಟೆ (ಖರೀದಿದಾರರು & ಮಾರಾಟಗಾರರು)" : isHi ? "सीधा बाज़ार (खरीदार और विक्रेता)" : "Direct Marketplace (Buyers & Sellers)",
      category: isKn ? "ವ್ಯಾಪಾರ & ಒಳಹರಿವುಗಳು" : isHi ? "व्यापार और आदान" : "Trade & Inputs",
      image: "/images/marketplace/vegetable-mandi.jpg",
      imageAlt: "Vegetable mandi vendor with fresh crates of farm produce",
      description: isKn
        ? "ಮಧ್ಯವರ್ತಿಗಳ ಶೋಷಣೆಯಿಲ್ಲದೆ ರೈತರು, ಪರಿಶೀಲಿಸಿದ ಸಾಂಸ್ಥಿಕ ಖರೀದಿದಾರರು, ಎಫ್‌ಪಿಒಗಳು ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ ಕೃಷಿ ಪರಿಕರಗಳ ಮಾರಾಟಗಾರರ ನಡುವೆ ನೇರ ಸಂಪರ್ಕ."
        : isHi
        ? "बिचौलियों के शोषण के बिना किसानों, सत्यापित संस्थागत खरीदारों, एफपीओ और प्रमाणित कृषि इनपुट विक्रेताओं के बीच सीधा संपर्क।"
        : "Direct connection between farmers, verified institutional buyers, FPOs, and certified agricultural input sellers without middleman exploitation.",
      href: "/marketplace",
      cta: isKn ? "ಮಾರುಕಟ್ಟೆ ಅನ್ವೇಷಿಸಿ" : isHi ? "बाज़ार देखें" : "Explore Marketplace",
      accent: "text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300",
    },
    {
      icon: Landmark,
      title: isKn ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಶೋಧ" : isHi ? "सरकारी योजनाओं की खोज" : "Government Schemes Discovery",
      category: isKn ? "ರೈತ ಕಲ್ಯಾಣ" : isHi ? "किसान कल्याण" : "Farmer Welfare",
      image: "/images/hero/hero-indian-farmer.jpg",
      imageAlt: "Indian farmer in field accessing agricultural subsidies",
      description: isKn
        ? "ಅಧಿಕೃತ ಮಾರ್ಗಸೂಚಿಗಳು ಮತ್ತು ನೇರ ಅರ್ಜಿ ಲಿಂಕ್‌ಗಳೊಂದಿಗೆ ರಾಜ್ಯ ಮತ್ತು ಕೇಂದ್ರ ಕೃಷಿ ಯೋಜನೆಗಳ (ಪಿಎಂ-ಕಿಸಾನ್, ಪಿಎಂಎಫ್‌ಬಿವೈ, ಹನಿ ನೀರಾವರಿ ಸಬ್ಸಿಡಿಗಳು, ಸೌರ ಪಂಪ್‌ಗಳು) ಫಿಲ್ಟರ್ ಮಾಡಬಹುದಾದ ಕ್ಯಾಟಲಾಗ್."
        : isHi
        ? "आधिकारिक दिशा-निर्देशों और सीधे आवेदन लिंक के साथ राज्य और केंद्रीय कृषि योजनाओं (पीएम-किसान, पीएमएफबीवाई, ड्रिप सब्सिडी, सोलर पंप) की सूची।"
        : "Filterable catalog of state and central agricultural schemes (PM-Kisan, PMFBY, drip subsidies, solar pumps) with official guidelines and direct application links.",
      href: "/schemes",
      cta: isKn ? "ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ" : isHi ? "योजनाएं खोजें" : "Discover Schemes",
      accent: "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      icon: BookOpen,
      title: isKn ? "ಹೊಲ ಡೈರಿ & ಬೆಳೆ ಜೀವನಚಕ್ರಗಳು" : isHi ? "खेत डायरी और फसल जीवनचक्र" : "Khet Diary & Crop Lifecycles",
      category: isKn ? "ಕೃಷಿ ದಾಖಲೆಗಳು" : isHi ? "फार्म रिकॉर्ड्स" : "Farm Records",
      image: "/images/crops/punjab-wheat-field.jpg",
      imageAlt: "Healthy wheat crop field in Phagwara Punjab",
      description: isKn
        ? "ನಿಮ್ಮ ನಿಜವಾದ ಋತುಮಾನದ ಲಾಭದಾಯಕತೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ರಸಗೊಬ್ಬರ ಬಳಕೆ, ಸಿಂಪಡಣೆ, ಕೊಯ್ಲು, ಕಾರ್ಮಿಕ ವೆಚ್ಚಗಳು ಮತ್ತು ಬೆಳೆ ಮಾರಾಟದ ಆದಾಯವನ್ನು ದಾಖಲಿಸಲು ಡಿಜಿಟಲ್ ಲೆಡ್ಜರ್."
        : isHi
        ? "अपनी वास्तविक मौसमी लाभप्रदता को समझने के लिए उर्वरक अनुप्रयोगों, छिड़काव, कटाई, श्रम व्यय और फसल बिक्री राजस्व को दर्ज करने के लिए डिजिटल बहीखाता।"
        : "Digital ledger to log fertilizer applications, sprayings, harvests, labour expenses, and crop sale revenues to understand your true seasonal profitability.",
      href: "/khet-diary",
      cta: isKn ? "ಹೊಲ ಡೈರಿ ತೆರೆಯಿರಿ" : isHi ? "खेत डायरी खोलें" : "Open Khet Diary",
      accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: isKn ? "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ" : isHi ? "अपना फार्म प्रोफाइल बनाएं" : "Create Your Farm Profile",
      description: isKn
        ? "ನಿಮ್ಮ ಗ್ರಾಮದ ಸ್ಥಳ, ಒಟ್ಟು ಜಮೀನು ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಲಭ್ಯವಿರುವ ನೀರಾವರಿ ಸೌಲಭ್ಯಗಳನ್ನು ನೋಂದಾಯಿಸಿ."
        : isHi
        ? "अपने गांव का स्थान, कुल भूमि का आकार और उपलब्ध सिंचाई सुविधाएं दर्ज करें।"
        : "Register your village location, total land size, and available irrigation facilities.",
    },
    {
      step: "02",
      title: isKn ? "ಬೆಳೆಗಳು ಮತ್ತು ಜಮೀನು ವಿವರಗಳನ್ನು ಸೇರಿಸಿ" : isHi ? "फसलें और खेत विवरण जोड़ें" : "Add Crops & Field Details",
      description: isKn
        ? "ನಿಮ್ಮ ಪ್ಲಾಟ್‌ಗಳು, ಸಕ್ರಿಯ ಬೆಳೆಗಳು, ಬೀಜ ತಳಿಗಳು ಮತ್ತು ಬಿತ್ತನೆ ದಿನಾಂಕಗಳನ್ನು ನಕ್ಷೆ ಮಾಡಿ."
        : isHi
        ? "अपने भूखंडों, सक्रिय फसलों, बीज की किस्मों और बुवाई की तारीखों को मैप करें।"
        : "Map your plots, active crops, seed varieties, and sowing dates.",
    },
    {
      step: "03",
      title: isKn ? "ವೈಯಕ್ತಿಕ ಕೃಷಿ ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಿರಿ" : isHi ? "व्यक्तिगत फार्म अंतर्दृष्टि प्राप्त करें" : "Get Personalized Farm Insights",
      description: isKn
        ? "ನಿಮ್ಮ ನೈಜ ಮಣ್ಣಿನ ಸ್ಥಿತಿ, ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆ ಹಂತಗಳಿಗೆ ಅನುಗುಣವಾಗಿ AI ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ."
        : isHi
        ? "अपनी वास्तविक मिट्टी की स्थिति, मौसम और फसल के चरणों के अनुरूप एआई मार्गदर्शन प्राप्त करें।"
        : "Receive AI guidance tailored to your actual soil status, weather, and crop stages.",
    },
    {
      step: "04",
      title: isKn ? "ಚಟುವಟಿಕೆಗಳನ್ನು ಯೋಜಿಸಿ & ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ" : isHi ? "गतिविधियों की योजना बनाएं और खरीदारों से जुड़ें" : "Plan Activities & Connect with Buyers",
      description: isKn
        ? "ದೈನಂದಿನ ಕೃಷಿ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ನಿಗದಿಪಡಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಕೊಯ್ಲಿಗೆ ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರನ್ನು ಕಂಡುಕೊಳ್ಳಿ."
        : isHi
        ? "दैनिक कृषि कार्यों को शेड्यूल करें और अपनी फसल के लिए सत्यापित खरीदारों को खोजें।"
        : "Schedule daily farm operations and discover verified buyers for your harvest.",
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto pt-4 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {isKn ? "ಸಂಪೂರ್ಣ ಕೃಷಿ ವೇದಿಕೆ" : isHi ? "संपूर्ण कृषि मंच" : "Complete Agricultural Platform"}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isKn
            ? "ಕೃಷಿ ಚಕ್ರದ ಪ್ರತಿಯೊಂದು ಹಂತಕ್ಕೂ ನಿರ್ಮಿಸಲಾದ ಉಪಕರಣಗಳು"
            : isHi
            ? "खेती के हर चरण के लिए बनाए गए उपकरण"
            : "Tools Built for Every Step of the Farming Cycle"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          {isKn
            ? "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಬಿತ್ತನೆ ವೇಳಾಪಟ್ಟಿಯಿಂದ ಹಿಡಿದು ಕೀಟ ನಿರ್ವಹಣೆ, ಮಂಡಿ ಬೆಲೆಗಳು ಮತ್ತು ಕೊಯ್ಲು ಖರೀದಿದಾರರವರೆಗೆ — KisaanBuddy ನಿಮಗೆ ಬೆಳೆ ಇಳುವರಿ ಮತ್ತು ಕೃಷಿ ಲಾಭವನ್ನು ಗರಿಷ್ಠಗೊಳಿಸಲು ನೆರವಾಗುತ್ತದೆ."
            : isHi
            ? "मृदा परीक्षण और बुवाई के समय से लेकर कीट प्रबंधन, मंडी भाव और फसल खरीदारों तक—KisaanBuddy आपको फसल की पैदावार और मुनाफ़ा अधिकतम करने में मदद करता है।"
            : "From soil testing and sowing schedules to pest management, mandi prices, and harvest buyers—KisaanBuddy gives you the edge to maximize crop yield and farm profit."}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-500/50 transition duration-200"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur shadow-xs border border-white/20">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${item.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-800/40 relative overflow-hidden">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            {isKn ? "ಸರಳ 4-ಹಂತದ ಪ್ರಕ್ರಿಯೆ" : isHi ? "सरल 4-चरणीय प्रक्रिया" : "Simple 4-Step Process"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">
            {isKn ? "ನಿಮ್ಮ ಜಮೀನಿಗಾಗಿ KisaanBuddy ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ" : isHi ? "आपके खेत के लिए KisaanBuddy कैसे काम करता है" : "How KisaanBuddy Works for Your Farm"}
          </h2>
          <p className="text-sm text-emerald-100/80 mt-2">
            {isKn
              ? "ಯಾವುದೇ ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯಗಳ ಅಗತ್ಯವಿಲ್ಲ. ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳು ಮತ್ತು ಧ್ವನಿ ಇನ್‌ಪುಟ್‌ನ ಬೆಂಬಲದೊಂದಿಗೆ ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ."
              : isHi
              ? "किसी तकनीकी कौशल की आवश्यकता नहीं है। क्षेत्रीय भाषाओं और वॉयस इनपुट के समर्थन के साथ भारतीय किसानों के लिए डिज़ाइन किया गया।"
              : "No technical skills required. Designed for Indian farmers with support for regional languages and voice input."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((w) => (
            <div
              key={w.step}
              className="bg-emerald-900/50 backdrop-blur-sm border border-emerald-700/40 rounded-2xl p-5 space-y-2"
            >
              <div className="text-2xl font-black text-emerald-400">{w.step}</div>
              <h3 className="text-sm font-bold text-white">{w.title}</h3>
              <p className="text-xs text-emerald-100/70 leading-relaxed">{w.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Capabilities & Technology Integrity */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isKn ? "ಪರಿಶೀಲಿಸಿದ ಸಾಮರ್ಥ್ಯಗಳು & ಮುಕ್ತ ಮಾನದಂಡಗಳು" : isHi ? "सत्यापित क्षमताएं और खुले मानक" : "Verified Capabilities & Open Standards"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isKn
              ? "ಅಧಿಕೃತ ಡೇಟಾ ಮೂಲಗಳು ಮತ್ತು ಗೌಪ್ಯತೆ-ಆಧಾರಿತ ಭಾರತೀಯ ಇಂಜಿನಿಯರಿಂಗ್‌ನ ಬೆಂಬಲದೊಂದಿಗೆ"
              : isHi
              ? "आधिकारिक डेटा स्रोतों और गोपनीयता-केंद्रित भारतीय इंजीनियरिंग द्वारा समर्थित"
              : "Backed by official data sources and privacy-first Indian engineering"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                {isKn ? "10 ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳು & ಧ್ವನಿ" : isHi ? "10 क्षेत्रीय भाषाएं और आवाज" : "10 Regional Languages & Voice"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isKn
                  ? "ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್, ತೆಲುಗು, ತಮಿಳು, ಮಲಯಾಳಂ, ಮರಾಠಿ, ಬಂಗಾಳಿ, ಪಂಜಾಬಿ ಮತ್ತು ಗುಜರಾತಿ."
                  : isHi
                  ? "हिंदी, अंग्रेजी, कन्नड़, तेलुगु, तमिल, मलयालम, मराठी, बंगाली, पंजाबी और गुजराती।"
                  : "Hindi, English, Kannada, Telugu, Tamil, Malayalam, Marathi, Bengali, Punjabi, and Gujarati."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                {isKn ? "ಅಧಿಕೃತ APMC ಫೀಡ್‌ಗಳು" : isHi ? "आधिकारिक APMC फ़ीड" : "Official APMC Feeds"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isKn
                  ? "AGMARKNET ದೈನಂದಿನ ಆಗಮನಗಳು ಮತ್ತು ಮಂಡಿ ಬೆಲೆ ಬುಲೆಟಿನ್‌ಗಳೊಂದಿಗೆ ನೇರ ಸಂಯೋಜನೆ."
                  : isHi
                  ? "AGMARKNET दैनिक आवक और मंडी मूल्य बुलेटिन के साथ सीधा एकीकरण।"
                  : "Direct integration with AGMARKNET daily arrivals and mandi price bulletins."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                {isKn ? "ಯಂತ್ರಾಂಶ ಸ್ವತಂತ್ರ" : isHi ? "हार्डवेयर स्वतंत्र" : "Hardware Independent"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isKn
                  ? "ಲಭ್ಯವಿದ್ದರೆ ಭೌತಿಕ ESP32 ಮಣ್ಣಿನ ಸಂವೇದಕಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ, ಅಥವಾ ಉಪಗ್ರಹ ಹವಾಮಾನ ಮತ್ತು ಹಸ್ತಚಾಲಿತ ದಾಖಲೆಗಳ ಮೂಲಕ ಸಂಪೂರ್ಣ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಆನಂದಿಸಿ."
                  : isHi
                  ? "यदि उपलब्ध हो तो भौतिक ESP32 मिट्टी सेंसर कनेक्ट करें, या उपग्रह मौसम और मैन्युअल रिकॉर्ड के माध्यम से पूर्ण सुविधाओं का आनंद लें।"
                  : "Connect physical ESP32 soil probes if available, or enjoy full features through satellite weather & manual records."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="text-center py-6">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-95"
        >
          <span>{isKn ? "ಉಚಿತ ಕೃಷಿ ಸೆಟಪ್ ಪ್ರಾರಂಭಿಸಿ" : isHi ? "मुफ्त फार्म सेटअप शुरू करें" : "Start Free Farm Setup"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
