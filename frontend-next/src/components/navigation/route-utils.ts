import type { Lang } from "@/lib/language";
import {
  Sprout,
  Store,
  Users,
  Bug,
  CloudSun,
  FlaskConical,
  LayoutDashboard,
  Landmark,
  FileText,
  Layers,
  HeartHandshake,
  ShieldCheck,
  Mic,
  User,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Robust Home route detection.
 * Matches exact root path ('/' or ''), ignoring query params and trailing slashes.
 */
export function isHomeRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  const normalized = pathname.split("?")[0].replace(/\/+$/, "");
  return normalized === "";
}

/**
 * Machinery Marketplace detection.
 * Marketplace possesses its own dedicated, self-contained header.
 */
export function isMarketplaceRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const normalized = pathname.split("?")[0].replace(/\/+$/, "");
  return normalized === "/marketplace" || normalized.startsWith("/marketplace/");
}

export interface ModuleControlItem {
  label: string;
  href: string;
  queryTab?: string;
  icon?: LucideIcon;
}

export interface ModuleConfig {
  key: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  badge?: string;
  icon: LucideIcon;
  primaryAction?: {
    label: Record<string, string>;
    href: string;
  };
  controls: (lang: Lang) => ModuleControlItem[];
}

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  fasal: {
    key: "fasal",
    title: {
      en: "Fasal Hub",
      hi: "फसल केंद्र",
      kn: "ಬೆಳೆ ಕೇಂದ್ರ",
      ta: "பயிர் மையம்",
      te: "పంట కేంద్రం",
      mr: "पीक केंद्र",
    },
    subtitle: {
      en: "Crop Advisory, Protection & Health",
      hi: "फसल सलाह, रोग निदान एवं स्वास्थ्य",
      kn: "ಬೆಳೆ ಸಲಹೆ ಮತ್ತು ರಕ್ಷಣೆ",
    },
    badge: "Crop Hub",
    icon: Sprout,
    controls: (lang) => [
      { label: lang === "hi" ? "फसल सलाह" : "Crop Advisory", href: "/crop-predictor", icon: Sprout },
      { label: lang === "hi" ? "फसल डॉक्टर" : "Crop Doctor", href: "/disease", icon: Bug },
      { label: lang === "hi" ? "मिट्टी स्वास्थ्य" : "Soil Health", href: "/soil-health", icon: FlaskConical },
      { label: lang === "hi" ? "उपग्रह विश्लेषण" : "Satellite Radar", href: "/satellite", icon: Layers },
    ],
  },
  mandi: {
    key: "mandi",
    title: {
      en: "Mandi Rates",
      hi: "मंडी भाव",
      kn: "ಮಂಡಿ ದರಗಳು",
      ta: "மண்டி விலைகள்",
      te: "మండి ధరలు",
      mr: "मंडी दर",
    },
    subtitle: {
      en: "Live APMC Prices, Volumes & MSP",
      hi: "लाइव एपीएमसी भाव, आवक और एमएसपी दरें",
      kn: "ಲೈವ್ ಮಾರುಕಟ್ಟೆ ದರಗಳು",
    },
    badge: "Live eNAM",
    icon: Store,
    primaryAction: {
      label: { en: "Post Requirement", hi: "मांग दर्ज करें" },
      href: "/mandi?tab=sell",
    },
    controls: (lang) => [
      { label: lang === "hi" ? "लाइव भाव" : "Live Prices", href: "/mandi?tab=prices", queryTab: "prices", icon: Store },
      { label: lang === "hi" ? "खरीदार मांग" : "Buyer Demands", href: "/mandi?tab=buy", queryTab: "buy", icon: Store },
      { label: lang === "hi" ? "एमएसपी केंद्र" : "MSP Centres", href: "/mandi?tab=gov", queryTab: "gov", icon: Landmark },
      { label: lang === "hi" ? "भाव अलर्ट" : "Price Alerts", href: "/mandi#target-price-alerts", icon: Store },
    ],
  },
  madad: {
    key: "madad",
    title: {
      en: "Madad Hub",
      hi: "किसान सहायता",
      kn: "ರೈತ ಸಹಾಯ",
      ta: "உதவி மையம்",
      te: "సహాయ కేంద్రం",
      mr: "शेतकरी मदत",
    },
    subtitle: {
      en: "Farmer Services, Labour & Government Schemes",
      hi: "मजदूर सेवा, सरकारी योजनाएं एवं सहायता",
      kn: "ಕೃಷಿ ಕಾರ್ಮಿಕ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    },
    badge: "Farmer Support",
    icon: HeartHandshake,
    controls: (lang) => [
      { label: lang === "hi" ? "मजदूर खोजें" : "Labour Hiring", href: "/worker-connect", icon: Users },
      { label: lang === "hi" ? "सरकारी योजनाएं" : "Govt Schemes", href: "/schemes", icon: Landmark },
      { label: lang === "hi" ? "AI सलाहकार" : "AI Advisor", href: "/chatbot", icon: Mic },
      { label: lang === "hi" ? "मंडी सहायता" : "Mandi Help", href: "/mandi", icon: Store },
    ],
  },
  "crop-predictor": {
    key: "crop-predictor",
    title: {
      en: "AI Crop Predictor",
      hi: "AI फसल सलाह",
      kn: "AI ಬೆಳೆ ಸಲಹೆ",
      ta: "AI பயிர் வழிகாட்டி",
      te: "AI పంట సలహాదారు",
      mr: "AI पीक सल्लागार",
    },
    subtitle: {
      en: "Data-driven Crop Selection & Advisory",
      hi: "मिट्टी व मौसम आधारित सटीक फसल चयन",
      kn: "ಖಚಿತ ಬೆಳೆ ಶಿಫಾರಸು",
    },
    badge: "AI Decision Support",
    icon: Sprout,
    primaryAction: {
      label: { en: "Run Analysis", hi: "विश्लेषण करें" },
      href: "/crop-predictor#run-analysis",
    },
    controls: (lang) => [
      { label: lang === "hi" ? "मिट्टी विश्लेषण" : "Soil Parameters", href: "/crop-predictor#soil-analysis", icon: FlaskConical },
      { label: lang === "hi" ? "मौसम सिंक" : "Weather Intelligence", href: "/crop-predictor#weather-intelligence", icon: CloudSun },
      { label: lang === "hi" ? "फसल सिफारिशें" : "Crop Recs", href: "/crop-predictor#crop-recommendations", icon: Sprout },
      { label: lang === "hi" ? "खेत उपग्रह" : "Satellite Radar", href: "/satellite", icon: Layers },
    ],
  },
  disease: {
    key: "disease",
    title: {
      en: "Crop Doctor",
      hi: "फसल डॉक्टर",
      kn: "ಬೆಳೆ ವೈದ್ಯ",
      ta: "பயிர் மருத்துवर",
      te: "పంట డాక్టర్",
      mr: "पीक डॉक्टर",
    },
    subtitle: {
      en: "Instant Plant Disease & Pest Diagnosis",
      hi: "पत्ती की फोटो से तुरंत रोग पहचान व उपचार",
      kn: "ತಕ್ಷಣದ ರೋಗ ಪತ್ತೆ",
    },
    badge: "AI Diagnosis",
    icon: Bug,
    primaryAction: {
      label: { en: "Scan Photo", hi: "फोटो स्कैन करें" },
      href: "/disease#upload-section",
    },
    controls: (lang) => [
      { label: lang === "hi" ? "रोग पहचान" : "Photo Scan", href: "/disease#upload-section", icon: Bug },
      { label: lang === "hi" ? "फसल चुनें" : "Select Crop", href: "/disease#crop-selection", icon: Sprout },
      { label: lang === "hi" ? "उपचार विधि" : "Treatments", href: "/disease#treatment-guide", icon: ShieldCheck },
      { label: lang === "hi" ? "विशेषज्ञ सलाह" : "Ask Expert", href: "/chatbot", icon: Mic },
    ],
  },
  weather: {
    key: "weather",
    title: {
      en: "Weather Intelligence",
      hi: "मौसम पूर्वानुमान",
      kn: "ಹವಾಮಾನ ಮಾಹಿತಿ",
      ta: "வானிலை தகவல்",
      te: "వాతావరణం",
      mr: "हवामान अंदाज",
    },
    subtitle: {
      en: "Hyperlocal Agro-Meteorology & Spray Advisory",
      hi: "खेत स्तर पर मौसम व कीटनाशक स्प्रे सलाह",
      kn: "ಕೃಷಿ ಹವಾಮಾನ ಸಲಹೆ",
    },
    badge: "Hyperlocal",
    icon: CloudSun,
    controls: (lang) => [
      { label: lang === "hi" ? "आज का मौसम" : "Today's Forecast", href: "/weather#current-weather", icon: CloudSun },
      { label: lang === "hi" ? "स्प्रे विंडो" : "Spray Window", href: "/weather#spray-advisory", icon: Sprout },
      { label: lang === "hi" ? "मानसून रडार" : "Monsoon Radar", href: "/satellite", icon: Layers },
    ],
  },
  "soil-health": {
    key: "soil-health",
    title: {
      en: "Soil Health Guide",
      hi: "मृदा स्वास्थ्य",
      kn: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
      ta: "மண் ஆரோக்கியம்",
      te: "నేల ఆరోగ్యం",
      mr: "माती आरोग्य",
    },
    subtitle: {
      en: "NPK Calculator & Soil Test Advisory",
      hi: "मृदा परीक्षण कार्ड व संतुलित उर्वरक मात्रा",
      kn: "ರಸಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    },
    badge: "Soil Card",
    icon: FlaskConical,
    controls: (lang) => [
      { label: lang === "hi" ? "NPK कैलकुलेटर" : "NPK Dosage", href: "/soil-health#npk-calculator", icon: FlaskConical },
      { label: lang === "hi" ? "मृदा परीक्षण" : "Soil Test Guide", href: "/soil-health#soil-test-guide", icon: FileText },
      { label: lang === "hi" ? "जैविक सुधार" : "Organic Guide", href: "/soil-health#organic-guide", icon: Sprout },
    ],
  },
  dashboard: {
    key: "dashboard",
    title: {
      en: "Farmer Dashboard",
      hi: "किसान डैशबोर्ड",
      kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      ta: "டாஷ்போர்டு",
      te: "డాష్‌బోర్డ్",
      mr: "डॅशबोर्ड",
    },
    subtitle: {
      en: "Farm Command Center & KPI Overview",
      hi: "खेत की संपूर्ण स्थिति व दैनिक कार्य",
      kn: "ಕೃಷಿ ನಿರ್ವಹಣಾ ಕೇಂದ್ರ",
    },
    badge: "Command Center",
    icon: LayoutDashboard,
    controls: (lang) => [
      { label: lang === "hi" ? "डैशबोर्ड" : "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: lang === "hi" ? "खेत डायरी" : "Farm Diary", href: "/khet-diary", icon: FileText },
      { label: lang === "hi" ? "मेरा खेत" : "My Farm Profile", href: "/profile", icon: User },
      { label: lang === "hi" ? "उपग्रह निगरानी" : "Satellite", href: "/satellite", icon: Layers },
    ],
  },
  "worker-connect": {
    key: "worker-connect",
    title: {
      en: "Agricultural Labour Hiring",
      hi: "मजदूर सेवा",
      kn: "ಕಾರ್ಮಿಕ ಸಂಪರ್ಕ",
      ta: "பணியாளர் இணைப்பு",
      te: "వర్కర్ కనెక్ట్",
      mr: "कामगार संपर्क",
    },
    subtitle: {
      en: "Agricultural Labour Marketplace & Hiring",
      hi: "सत्यापित कृषि मजदूर, कटाई गैंग व ट्रैक्टर चालक",
      kn: "ಕೃಷಿ ಕಾರ್ಮಿಕ ಮಾರುಕಟ್ಟೆ",
    },
    badge: "Verified Labour",
    icon: Users,
    primaryAction: {
      label: { en: "Post Job", hi: "मजदूर चाहिए" },
      href: "/worker-connect?tab=post_job",
    },
    controls: (lang) => [
      { label: lang === "hi" ? "मजदूर खोजें" : "Find Workers", href: "/worker-connect?tab=find_workers", queryTab: "find_workers", icon: Users },
      { label: lang === "hi" ? "काम खोजें" : "Find Jobs", href: "/worker-connect?tab=find_jobs", queryTab: "find_jobs", icon: FileText },
      { label: lang === "hi" ? "काम पोस्ट करें" : "Post Job", href: "/worker-connect?tab=post_job", queryTab: "post_job", icon: Users },
      { label: lang === "hi" ? "मजदूरी दरें" : "Wage Benchmarks", href: "/worker-connect?tab=wage_benchmarks", queryTab: "wage_benchmarks", icon: Landmark },
    ],
  },
  schemes: {
    key: "schemes",
    title: {
      en: "Govt Schemes",
      hi: "सरकारी योजनाएं",
      kn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
      ta: "அரசுத் திட்டங்கள்",
      te: "ప్రభుత్వ పథకాలు",
      mr: "सरकारी योजना",
    },
    subtitle: {
      en: "Central & State Subsidies, PM-Kisan & DBT",
      hi: "पीएम-किसान, केसीसी व कृषि यंत्र सब्सिडी",
      kn: "ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳು",
    },
    badge: "Verified Subsidies",
    icon: Landmark,
    controls: (lang) => [
      { label: lang === "hi" ? "सभी योजनाएं" : "All Schemes", href: "/schemes", icon: Landmark },
      { label: lang === "hi" ? "पीएम किसान" : "PM-Kisan", href: "/schemes?search=PM-Kisan", icon: ShieldCheck },
      { label: lang === "hi" ? "पात्रता जांचें" : "Check Eligibility", href: "/schemes#eligibility", icon: FileText },
    ],
  },
  "khet-diary": {
    key: "khet-diary",
    title: {
      en: "Farm Diary",
      hi: "खेत डायरी",
      kn: "ಕೃಷಿ ಡೈರಿ",
      ta: "பண்ணை நாட்குறிப்பு",
      te: "వ్యವసాయ డైరీ",
      mr: "शेत डायरी",
    },
    subtitle: {
      en: "Digital Ledger for Costs, Tasks & Harvest",
      hi: "लागत, खाद-बीज खर्च और पैदावार का हिसाब",
      kn: "ಕೃಷಿ ವೆಚ್ಚ ಮತ್ತು ಉತ್ಪಾದನೆ",
    },
    badge: "Digital Ledger",
    icon: FileText,
    controls: (lang) => [
      { label: lang === "hi" ? "सभी रिकॉर्ड" : "All Entries", href: "/khet-diary", icon: FileText },
      { label: lang === "hi" ? "खर्च ब्योरा" : "Expense Log", href: "/khet-diary#expenses", icon: Landmark },
      { label: lang === "hi" ? "फसल पैदावार" : "Harvest Log", href: "/khet-diary#harvest", icon: Sprout },
    ],
  },
  satellite: {
    key: "satellite",
    title: {
      en: "Satellite Intelligence",
      hi: "उपग्रह विश्लेषण",
      kn: "ಉಪಗ್ರಹ ಮಾಹಿತಿ",
      ta: "செயற்கைக்கோள் பகுப்பாய்வு",
      te: "ఉపగ్రహ సమాచారం",
      mr: "उपग्रह विश्लेषण",
    },
    subtitle: {
      en: "Sentinel Multispectral NDVI & Radar Soil Moisture",
      hi: "खेत की हरियाली सूचकांक व नमी का उपग्रह मानचित्र",
      kn: "ಉಪಗ್ರಹ ಬೆಳೆ ಆರೋಗ್ಯ",
    },
    badge: "Sentinel-2 Live",
    icon: Layers,
    controls: (lang) => [
      { label: lang === "hi" ? "NDVI स्वास्थ्य" : "NDVI Crop Health", href: "/satellite", icon: Layers },
      { label: lang === "hi" ? "नमी रडार" : "SAR Moisture", href: "/satellite#moisture", icon: CloudSun },
      { label: lang === "hi" ? "खेत सीमांकन" : "Field Polygon", href: "/satellite#polygon", icon: Sprout },
    ],
  },
  about: {
    key: "about",
    title: {
      en: "About KisaanBuddy",
      hi: "हमारे बारे में",
      kn: "ನಮ್ಮ ಬಗ್ಗೆ",
      ta: "எங்களை பற்றி",
      te: "మా గురించి",
      mr: "आमच्याबद्दल",
    },
    subtitle: {
      en: "Built for India's 140 Million Farmers",
      hi: "भारतीय किसानों के सशक्तिकरण हेतु समर्पित",
      kn: "ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ತಂತ್ರಜ್ಞಾನ",
    },
    badge: "Our Story",
    icon: ShieldCheck,
    controls: (lang) => [
      { label: lang === "hi" ? "परिचय" : "About Us", href: "/about", icon: ShieldCheck },
      { label: lang === "hi" ? "संस्थापक" : "Founders", href: "/founders", icon: Users },
      { label: lang === "hi" ? "प्रभाव" : "Impact", href: "/impact", icon: BarChart3 },
      { label: lang === "hi" ? "संपर्क" : "Contact", href: "/contact", icon: Users },
    ],
  },
  chatbot: {
    key: "chatbot",
    title: {
      en: "AI Farm Advisor",
      hi: "AI कृषि सलाहकार",
      kn: "AI ಕೃಷಿ ಸಲಹೆಗಾರ",
      ta: "AI ஆலோசகர்",
      te: "AI సలహాదారు",
      mr: "AI सल्लागार",
    },
    subtitle: {
      en: "Vernacular Voice & Chat Agronomy Support",
      hi: "अपनी भाषा में बोलकर या लिखकर कृषि समाधान पाएं",
      kn: "ಧ್ವನಿ ಮತ್ತು ಚಾಟ್ ಮೂಲಕ ಸಲಹೆ",
    },
    badge: "Voice & Chat",
    icon: Mic,
    controls: (lang) => [
      { label: lang === "hi" ? "फसल प्रश्न" : "Crop Queries", href: "/chatbot", icon: Sprout },
      { label: lang === "hi" ? "मंडी सहायता" : "Mandi Help", href: "/mandi", icon: Store },
      { label: lang === "hi" ? "रोग पहचान" : "Disease Scan", href: "/disease", icon: Bug },
    ],
  },
  profile: {
    key: "profile",
    title: {
      en: "Farmer Profile",
      hi: "किसान प्रोफ़ाइल",
      kn: "ರೈತರ ಪ್ರೊಫೈಲ್",
      ta: "விவசாயி சுயவிவரம்",
      te: "రైతు ప్రొఫైల్",
      mr: "शेतकरी प्रोफाइल",
    },
    subtitle: {
      en: "Land Records, Crop Selection & Farm Credentials",
      hi: "खेत का रकबा, मुख्य फसलें एवं किसान पहचान",
      kn: "ಜಮೀನಿನ ವಿವರಗಳು",
    },
    badge: "Farm Records",
    icon: User,
    controls: (lang) => [
      { label: lang === "hi" ? "मेरा खेत" : "My Farm", href: "/profile", icon: User },
      { label: lang === "hi" ? "डैशबोर्ड" : "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: lang === "hi" ? "सेटिंग्स" : "Settings", href: "/settings", icon: Settings },
    ],
  },
  reports: {
    key: "reports",
    title: {
      en: "Agricultural Reports",
      hi: "कृषि रिपोर्ट्स",
      kn: "ವರದಿಗಳು",
      ta: "அறிக்கைகள்",
      te: "నివేదికలు",
      mr: "अहवाल",
    },
    subtitle: {
      en: "Agronomic Summaries & Field Audits",
      hi: "खेत विश्लेषण व निर्यात योग्य रिपोर्ट",
      kn: "ಕೃಷಿ ವರದಿಗಳು",
    },
    badge: "Analytics",
    icon: BarChart3,
    controls: (lang) => [
      { label: lang === "hi" ? "डैशबोर्ड" : "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: lang === "hi" ? "खेत डायरी" : "Farm Diary", href: "/khet-diary", icon: FileText },
      { label: lang === "hi" ? "मिट्टी कार्ड" : "Soil Health", href: "/soil-health", icon: FlaskConical },
    ],
  },
};

/**
 * Returns module configuration matching the primary path segment.
 */
export function getModuleConfig(pathname: string | null | undefined): ModuleConfig {
  if (!pathname) {
    return getDefaultModuleConfig("");
  }
  const cleanPath = pathname.split("?")[0].replace(/^\/+|\/+$/g, "");
  const segment = cleanPath.split("/")[0] || "";

  if (MODULE_CONFIGS[segment]) {
    return MODULE_CONFIGS[segment];
  }

  // Related route aliases
  if (segment === "founders" || segment === "impact" || segment === "contact") {
    return MODULE_CONFIGS["about"];
  }
  if (segment === "soil-monitor") {
    return MODULE_CONFIGS["soil-health"];
  }
  if (segment === "crops") {
    return MODULE_CONFIGS["fasal"];
  }
  if (segment === "farmer-profile") {
    return MODULE_CONFIGS["profile"];
  }
  if (segment === "chat") {
    return MODULE_CONFIGS["chatbot"];
  }

  return getDefaultModuleConfig(segment);
}

function getDefaultModuleConfig(segment: string): ModuleConfig {
  const formattedTitle = segment
    ? segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "KisaanBuddy";

  return {
    key: segment || "general",
    title: {
      en: formattedTitle,
      hi: formattedTitle,
    },
    subtitle: {
      en: "KisaanBuddy Smart Farm Platform",
      hi: "किसानबड्डी स्मार्ट कृषि मंच",
    },
    badge: "KisaanBuddy",
    icon: Sprout,
    controls: (lang) => [
      { label: lang === "hi" ? "होम" : "Home", href: "/", icon: Sprout },
      { label: lang === "hi" ? "फसल" : "Fasal", href: "/fasal", icon: Sprout },
      { label: lang === "hi" ? "मंडी" : "Mandi", href: "/mandi", icon: Store },
      { label: lang === "hi" ? "मदद" : "Madad", href: "/madad", icon: HeartHandshake },
      { label: lang === "hi" ? "डैशबोर्ड" : "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  };
}
