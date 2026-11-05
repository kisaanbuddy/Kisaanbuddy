"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Mic,
  ArrowRight,
  Search,
  X,
  Check,
  ChevronDown,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage, type Lang, LANG_NAMES } from "@/lib/language";
import { farmerProfileApi } from "@/lib/farmer-api";
import {
  resolveUserLocation,
  getCurrentByCoords,
  getForecastByCoords,
  type UnifiedWeather,
  type ForecastBundle,
} from "@/lib/weather-api";
import { FarmerFeatureCard } from "./FarmerFeatureCard";
import { CropDoctorVisualDemo } from "./CropDoctorVisualDemo";
import { openVoiceAssistant } from "@/components/assistant/VoiceAssistantModal";
import {
  ALL_SERVICES,
  SERVICE_CATEGORIES,
  VOICE_SAMPLE_QUERIES,
  type ServiceCategoryKey,
  type ServiceItem,
} from "./farmerServicesData";

const COPY = {
  en: {
    greeting: "Namaste Farmer Friend",
    subtitle: "What help do you need with your farm today?",
    voiceTitle: "Speak to KisaanBuddy",
    voiceBadge: "Voice Assistant",
    voiceHint: "Tap to ask in your language: 'Wheat mandi price', 'Tomato leaf spots'",
    voiceButtonText: "Speak / बोलें",
    searchPlaceholder: "Search services (e.g. Wheat price, disease, weather, labour, tractor, schemes...)",
    searchLabel: "Search farming services",
    searchSuggestionsTitle: "Suggested for Farmers",
    quickShortcutsBadge: "QUICK SHORTCUTS",
    quickShortcutsTitle: "Essential Tasks",
    allServicesBadge: "COMPLETE SERVICE DIRECTORY",
    allServicesTitle: "All Farming Services",
    allServicesSubtitle: "Every farming tool in one place — click any service to open directly",
    allCategoryFilter: "All Services",
    editFarm: "Change",
    setupFarm: "Set your village and main crop for customized prices & advisory",
    officialFootnote:
      "Market rates from AGMARKNET • Weather advisory from IMD",
    resultsFound: "services found for",
    clearSearch: "Clear",
    noResultsTitle: "No matching service found",
    noResultsHint: "Try searching with other words, or speak directly to the KisaanBuddy Voice Assistant.",
    askVoiceInstead: "Ask with Voice",
    voicePromptsHeading: "Voice Questions Farmers Often Ask",
    voicePromptsSub: "Tap any question to speak with KisaanBuddy AI:",
    languageLabel: "Language",
    fieldPhotoAlt: "Indian farmer tending crops in agricultural field",
    fieldBannerCaption: "Field-tested advisory and direct marketplace connection for Indian farmers",
  },
  hi: {
    greeting: "नमस्ते किसान भाई",
    subtitle: "आज आपके खेत में क्या मदद चाहिए?",
    voiceTitle: "बोलकर पूछें (वॉइस एआई)",
    voiceBadge: "वॉइस असिस्टेंट",
    voiceHint: "बोलकर पूछें: 'गेहूं का मंडी भाव बताओ', 'टमाटर की पत्ती पर पीले धब्बे'",
    voiceButtonText: "बोलकर पूछें",
    searchPlaceholder: "सेवाएं खोजें (उदा. गेहूं का भाव, बीमारी, मौसम, मजदूर, ट्रैक्टर, खाद, योजनाएं...)",
    searchLabel: "खेती की सेवाएं खोजें",
    searchSuggestionsTitle: "अक्सर खोजी जाने वाली सेवाएं",
    quickShortcutsBadge: "QUICK SHORTCUTS",
    quickShortcutsTitle: "जरूरी काम (Main Tasks)",
    allServicesBadge: "COMPLETE SERVICE DIRECTORY",
    allServicesTitle: "खेती के सभी काम (All Farming Services)",
    allServicesSubtitle: "हर किसान सेवा अब एक ही जगह — सीधे क्लिक करके इस्तेमाल करें",
    allCategoryFilter: "सभी सेवाएं",
    editFarm: "बदलें",
    setupFarm: "सही भाव और सलाह के लिए अपना गांव और मुख्य फसल जोड़ें",
    officialFootnote:
      "मंडी भाव: AGMARKNET • मौसम डेटा: IMD",
    resultsFound: "सेवाएं मिलीं खोज शब्द:",
    clearSearch: "हटाएं",
    noResultsTitle: "कोई सेवा नहीं मिली",
    noResultsHint: "कृपया अन्य शब्दों से खोजें, या किसानबडी वॉइस असिस्टेंट से बोलकर पूछें।",
    askVoiceInstead: "बोलकर पूछें",
    voicePromptsHeading: "किसान भाई अक्सर यह सवाल पूछते हैं",
    voicePromptsSub: "किसी भी सवाल पर टैप करें और तुरंत समाधान पाएं:",
    languageLabel: "भाषा",
    fieldPhotoAlt: "खेत में फसल की देखभाल करते भारतीय किसान",
    fieldBannerCaption: "भारतीय किसानों के लिए विश्वसनीय कृषि सलाह और सीधी मंडी कनेक्टिविटी",
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ",
    subtitle: "ಇಂದು ನಿಮ್ಮ ಜಮೀನಿಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?",
    voiceTitle: "ಮಾತನಾಡಿ ಕೇಳಿ (ವಾಯ್ಸ್ ಎಐ)",
    voiceBadge: "ಧ್ವನಿ ಸಹಾಯಕ",
    voiceHint: "ಮಾತನಾಡಿ ಕೇಳಿ: 'ಗೋಧಿ ಮಂಡಿ ಬೆಲೆ', 'ಟೊಮೆಟೊ ಎಲೆ ರೋಗ', 'ಇಂದಿನ ಮಳೆ'",
    voiceButtonText: "ಮಾತನಾಡಿ / Speak",
    searchPlaceholder: "ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ (ಉದಾ. ಬೆಲೆ, ರೋಗ, ಹವಾಮಾನ, ಕೂಲಿ, ಟ್ರ್ಯಾಕ್ಟರ್, ಯೋಜನೆಗಳು...)",
    searchLabel: "ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ",
    searchSuggestionsTitle: "ಹೆಚ್ಚಾಗಿ ಹುಡುಕುವ ಸೇವೆಗಳು",
    quickShortcutsBadge: "QUICK SHORTCUTS",
    quickShortcutsTitle: "ಅಗತ್ಯ ಕೆಲಸಗಳು (Main Tasks)",
    allServicesBadge: "COMPLETE SERVICE DIRECTORY",
    allServicesTitle: "ಕೃಷಿಯ ಎಲ್ಲಾ ಸೇವೆಗಳು (All Farming Services)",
    allServicesSubtitle: "ಎಲ್ಲಾ ಕೃಷಿ ಸೇವೆಗಳು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ — ನೇರವಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ ಬಳಸಿ",
    allCategoryFilter: "ಎಲ್ಲಾ ಸೇವೆಗಳು",
    editFarm: "ಬದಲಾಯಿಸಿ",
    setupFarm: "ನಿಖರ ಬೆಲೆ ಮತ್ತು ಸಲಹೆಗಾಗಿ ನಿಮ್ಮ ಊರು ಮತ್ತು ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ",
    officialFootnote:
      "ಮಂಡಿ ದರಗಳು: AGMARKNET • ಹವಾಮಾನ ಮಾಹಿತಿ: IMD",
    resultsFound: "ಸೇವೆಗಳು ದೊರೆತಿವೆ ಹುಡುಕಾಟ:",
    clearSearch: "ತೆರವುಗೊಳಿಸಿ",
    noResultsTitle: "ಯಾವುದೇ ಸೇವೆ ಕಂಡುಬಂದಿಲ್ಲ",
    noResultsHint: "ದಯವಿಟ್ಟು ಬೇರೆ ಪದಗಳಿಂದ ಹುಡುಕಿ, ಅಥವಾ ಕಿಸಾನ್‌ಬಡ್ಡಿ ವಾಯ್ಸ್ ಸಹಾಯಕನಲ್ಲಿ ಮಾತನಾಡಿ ಕೇಳಿ.",
    askVoiceInstead: "ಮಾತನಾಡಿ ಕೇಳಿ",
    voicePromptsHeading: "ರೈತರು ಹೆಚ್ಚಾಗಿ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು",
    voicePromptsSub: "ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಒತ್ತಿ ತಕ್ಷಣ ಪರಿಹಾರ ಪಡೆಯಿರಿ:",
    languageLabel: "ಭಾಷೆ",
    fieldPhotoAlt: "ಹೊಲದಲ್ಲಿ ಕೃಷಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವ ಭಾರತೀಯ ರೈತ",
    fieldBannerCaption: "ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ವಿಶ್ವಾಸಾರ್ಹ ಕೃಷಿ ಸಲಹೆ ಮತ್ತು ಮಂಡಿ ಸಂಪರ್ಕ",
  },
} as const;

interface SearchSuggestion {
  icon: string;
  query: string;
  label: { hi: string; en: string; kn: string };
  category: string;
}

const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  {
    icon: "🌾",
    query: "wheat",
    label: {
      hi: "गेहूं व अन्य फसलों का मंडी भाव",
      en: "Wheat & Grain Mandi Rates",
      kn: "ಗೋಧಿ & ಧಾನ್ಯಗಳ ಮಂಡಿ ದರ",
    },
    category: "Mandi",
  },
  {
    icon: "🍃",
    query: "disease",
    label: {
      hi: "फसल में बीमारी पहचान (क्रॉप डॉक्टर)",
      en: "Crop Disease Diagnosis (Crop Doctor)",
      kn: "ಬೆಳೆ ರೋಗ ಪತ್ತೆ (ಕ್ರಾಪ್ ಡಾಕ್ಟರ್)",
    },
    category: "Crop Care",
  },
  {
    icon: "🌧️",
    query: "weather",
    label: {
      hi: "मौसम, बारिश व सुरक्षित छिड़काव खिड़की",
      en: "Weather, Rain Risk & Safe Spray Window",
      kn: "ಹವಾಮಾನ, ಮಳೆ & ಸಿಂಪರಣೆ ಮುನ್ಸೂಚನೆ",
    },
    category: "Weather",
  },
  {
    icon: "👥",
    query: "labour",
    label: {
      hi: "खेत मजदूर व लेबर सहायता",
      en: "Farm Labour & Field Workers",
      kn: "ಕೂಲಿ ಕಾರ್ಮಿಕರ ಸಂಪರ್ಕ",
    },
    category: "Support",
  },
  {
    icon: "🚜",
    query: "tractor",
    label: {
      hi: "ट्रैक्टर व कृषि उपकरण किराया",
      en: "Tractor & Machinery Rental",
      kn: "ಟ್ರ್ಯಾಕ್ಟರ್ ಮತ್ತು ಯಂತ್ರೋಪಕರಣ ಬಾಡಿಗೆ",
    },
    category: "Marketplace",
  },
  {
    icon: "📜",
    query: "schemes",
    label: {
      hi: "सरकारी किसान योजनाएं व सब्सिडी",
      en: "Government Schemes & Subsidies",
      kn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿ",
    },
    category: "Schemes",
  },
  {
    icon: "🧪",
    query: "fertilizer",
    label: {
      hi: "खाद व पोषण मात्रा की सही गणना",
      en: "Fertilizer Calculator & Soil Health",
      kn: "ರಸಗೊಬ್ಬರ ಮತ್ತು ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
    },
    category: "Soil",
  },
  {
    icon: "📒",
    query: "diary",
    label: {
      hi: "खेत डायरी - खर्च व कमाई का हिसाब",
      en: "Khet Diary - Farm Income & Expenses",
      kn: "ಖೇತ್ ಡೈರಿ - ಆದಾಯ ಮತ್ತು ವೆಚ್ಚ",
    },
    category: "Management",
  },
];

// Animation variant definitions for natural, calm staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

export function FarmerHome() {
  const { user, ready } = useAuth();
  const { lang, setLang } = useLanguage();

  const currentLang: "hi" | "en" | "kn" =
    lang === "kn" ? "kn" : lang === "en" ? "en" : "hi";
  const text = COPY[currentLang] || COPY.hi;
  const firstName = user?.name?.trim().split(/\s+/)[0];

  // Saved farm details state
  const [savedVillage, setSavedVillage] = useState<string>("");
  const [savedDistrict, setSavedDistrict] = useState<string>("");
  const [savedCrop, setSavedCrop] = useState<string>("");

  // Weather state (preserved for voice, AI advisory, background context)
  const [, setWeather] = useState<UnifiedWeather | null>(null);
  const [, setForecast] = useState<ForecastBundle | null>(null);

  // Search, suggestions & category filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryKey | "all">("all");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 1. Load saved farm profile (backend if user logged in, or localStorage for guest)
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const local = localStorage.getItem("kisaanbuddy_farmer_profile");
        if (local) {
          const parsed = JSON.parse(local);
          if (isMounted) {
            if (parsed.village) setSavedVillage(parsed.village);
            if (parsed.district) setSavedDistrict(parsed.district);
            if (parsed.primaryCrop) setSavedCrop(parsed.primaryCrop);
          }
        }
      } catch {
        // ignore storage parse errors
      }

      if (user) {
        try {
          const prof = await farmerProfileApi.get();
          if (prof && isMounted) {
            if (prof.village_name) setSavedVillage(prof.village_name);
            if (prof.district_name) setSavedDistrict(prof.district_name);
            if (prof.primary_crop) setSavedCrop(prof.primary_crop);
          }
        } catch {
          // ignore network failures
        }
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Load hyper-local weather in background (preserved for voice assistant & search)
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      try {
        const resolved = await resolveUserLocation(3500);
        const [cur, fc] = await Promise.all([
          getCurrentByCoords(resolved.lat, resolved.lon).catch(() => null),
          getForecastByCoords(resolved.lat, resolved.lon, 3).catch(() => null),
        ]);
        if (isMounted) {
          if (cur) setWeather(cur);
          if (fc) setForecast(fc);
        }
      } catch (err) {
        console.warn("Home weather fetch non-critical error:", err);
      }
    }
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasFarmInfo = Boolean(savedVillage || savedDistrict || savedCrop);

  // Essential tasks shortcuts: Exclude weather from shortcuts
  const primaryShortcuts = useMemo(() => {
    return ALL_SERVICES.filter(
      (item) => item.isQuickShortcut && item.id !== "weather-alerts"
    );
  }, []);

  // Filtered services for Search: Weather IS searchable when requested
  // When no search query, weather is excluded from homepage cards per Part 1
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      if (activeCategory === "all") {
        return ALL_SERVICES.filter((item) => item.id !== "weather-alerts");
      }
      return ALL_SERVICES.filter(
        (item) => item.category === activeCategory && item.id !== "weather-alerts"
      );
    }

    // Weather is fully searchable!
    return ALL_SERVICES.filter((item) => {
      const matchTitle =
        item.title.hi.toLowerCase().includes(q) ||
        item.title.en.toLowerCase().includes(q) ||
        item.title.kn.toLowerCase().includes(q);
      const matchDesc =
        item.description.hi.toLowerCase().includes(q) ||
        item.description.en.toLowerCase().includes(q) ||
        item.description.kn.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) =>
        k.toLowerCase().includes(q)
      );
      const matchCategory =
        activeCategory === "all" || item.category === activeCategory;

      return (matchTitle || matchDesc || matchKeywords) && matchCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-auto max-w-5xl space-y-7 pb-12"
    >
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION A: HERO / FARMER WELCOME                                       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <motion.section
        variants={itemVariants}
        aria-label="Welcome Banner"
        className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-[#FAF9F6] dark:bg-stone-900/90 p-5 sm:p-6 md:p-8 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                {text.greeting}
                {ready && firstName ? `, ${firstName}` : ""} 👋
              </span>

              {/* Language Switcher Pill */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1 text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-emerald-500/50 transition-colors shadow-2xs"
                  aria-expanded={langMenuOpen}
                >
                  <span>🌐 {LANG_NAMES[lang as Lang] || "हिंदी"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                </button>

                {langMenuOpen && (
                  <div className="absolute left-0 mt-1.5 w-36 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-1.5 shadow-lg z-30 animate-in fade-in zoom-in-95">
                    {(["hi", "en", "kn"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          setLang(l);
                          setLangMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3.5 py-1.5 text-xs font-semibold ${
                          lang === l
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold"
                            : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50"
                        }`}
                      >
                        <span>{LANG_NAMES[l]}</span>
                        {lang === l && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
              {text.subtitle}
            </h1>
          </div>

          {/* Saved farm location badge or setup prompt */}
          <div className="shrink-0">
            {hasFarmInfo ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-white dark:bg-stone-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 shadow-xs">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {[savedVillage, savedDistrict].filter(Boolean).join(", ")}
                  {savedCrop ? ` • 🌾 ${savedCrop}` : ""}
                </span>
                <Link
                  href="/farmer-profile"
                  className="ml-1.5 font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {text.editFarm}
                </Link>
              </div>
            ) : (
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-800/90 px-4 py-2.5 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 hover:border-emerald-600/50 transition-colors shadow-2xs"
              >
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{text.setupFarm}</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Prominent Voice-Assistant Button (Part 3: Calm Idle Breathing Pulse) ── */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => openVoiceAssistant()}
            className="group relative flex w-full text-left min-h-[96px] sm:min-h-[105px] items-center gap-4 sm:gap-6 rounded-2xl bg-emerald-700 dark:bg-emerald-800 hover:bg-emerald-600 px-5 sm:px-7 py-4 sm:py-5 text-white shadow-md hover:shadow-lg active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 cursor-pointer"
          >
            {/* Idle Breathing Pulse Container (2.8s calm pulse, non-distracting) */}
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs shadow-inner animate-voice-idle">
              <Mic className="h-7 w-7 sm:h-8 sm:w-8 text-white stroke-[2.4]" aria-hidden="true" />
            </div>

            {/* Voice Prompt Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="block text-lg sm:text-2xl font-extrabold tracking-tight">
                  {text.voiceTitle}
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  {text.voiceBadge}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm md:text-base text-emerald-50 leading-snug">
                {text.voiceHint}
              </p>
            </div>

            {/* Voice Action Button Badge */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shrink-0 group-hover:bg-white/30 transition-colors">
              <span>{text.voiceButtonText}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {/* ── Feature Discovery Search Bar with Enhanced Interactive Suggestions (Part 6) ── */}
        <div ref={searchContainerRef} className="relative mt-5">
          <div className="relative">
            <label htmlFor="feature-search" className="sr-only">
              {text.searchLabel}
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="feature-search"
              type="text"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchFocused(true);
              }}
              placeholder={text.searchPlaceholder}
              className="w-full rounded-2xl border border-stone-200/90 dark:border-stone-700 bg-white dark:bg-stone-900 py-3.5 pl-11 pr-11 text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/15 shadow-xs transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={text.clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Interactive Suggestions Popover: Appears on focus, language-aware, includes weather */}
          <AnimatePresence>
            {searchFocused && !searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-3 shadow-xl space-y-1"
              >
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 mb-1">
                  <span>{text.searchSuggestionsTitle}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Tap to search
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-60 overflow-y-auto">
                  {SEARCH_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item.query);
                        setSearchFocused(false);
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="font-semibold truncate">
                        {item.label[currentLang]}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION: SEARCH RESULTS (Only shown when user is searching)            */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {searchQuery.trim() !== "" ? (
        <section aria-label="Search Results" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                SEARCH RESULTS
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                {filteredServices.length} {text.resultsFound} &ldquo;{searchQuery}&rdquo;
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{text.clearSearch}</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredServices.map((service) => (
                <FarmerFeatureCard
                  key={service.id}
                  title={service.title[currentLang]}
                  description={service.description[currentLang]}
                  icon={service.icon}
                  href={service.href}
                  iconColor={service.iconColor}
                  badge={service.badge?.[currentLang]}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                <HelpCircle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {text.noResultsTitle}
                </h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                  {text.noResultsHint}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-2 text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  {text.clearSearch}
                </button>
                <button
                  type="button"
                  onClick={() => openVoiceAssistant()}
                  className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Mic className="h-4 w-4" />
                  <span>{text.askVoiceInstead}</span>
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ────────────────────────────────────────────────────────────────── */}
          {/* SECTION B: ESSENTIAL TASKS (PRIMARY SHORTCUTS)                     */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <motion.section variants={itemVariants} aria-labelledby="primary-shortcuts-heading">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  id="primary-shortcuts-heading"
                  className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100"
                >
                  {text.quickShortcutsTitle}
                </h2>
              </div>
              <a
                href="#all-services-section"
                className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{text.allCategoryFilter}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Desktop 2-column grid / Mobile 1 or 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {primaryShortcuts.map((service) => (
                <FarmerFeatureCard
                  key={service.id}
                  title={service.title[currentLang]}
                  description={service.description[currentLang]}
                  icon={service.icon}
                  href={service.href}
                  iconColor={service.iconColor}
                  badge={service.badge?.[currentLang]}
                />
              ))}
            </div>
          </motion.section>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* SECTION C: CROP DOCTOR VISUAL DEMONSTRATION (PART 7)               */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <CropDoctorVisualDemo />
          </motion.div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* SECTION D: AUTHENTIC PHOTOGRAPHY FEATURE CARD (PART 8)             */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <motion.section
            variants={itemVariants}
            aria-label="Field Companion"
            className="group relative rounded-3xl overflow-hidden border border-stone-200/90 dark:border-stone-800 bg-stone-900 text-white shadow-xs"
          >
            <div className="relative aspect-21/9 min-h-[140px] sm:min-h-[180px] w-full overflow-hidden">
              <Image
                src="/images/farmers/farmer-field-tending.webp"
                alt={text.fieldPhotoAlt}
                fill
                priority={false}
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover opacity-75 group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 sm:bottom-6 sm:left-7 sm:right-7 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 border border-white/20 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-xs">
                    <Sparkles className="h-3 w-3" />
                    KisaanBuddy Field Companion
                  </span>
                  <p className="mt-1.5 text-xs sm:text-sm font-semibold text-stone-200">
                    {text.fieldBannerCaption}
                  </p>
                </div>
                <Link
                  href="/chatbot"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs border border-white/30 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shrink-0"
                >
                  <span>AI Advisor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.section>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* SECTION E: ALL FARMING SERVICES (COMPLETE DIRECTORY)               */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <motion.section
            variants={itemVariants}
            id="all-services-section"
            aria-labelledby="all-services-heading"
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2
                  id="all-services-heading"
                  className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100"
                >
                  {text.allServicesTitle}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                  {text.allServicesSubtitle}
                </p>
              </div>
            </div>

            {/* Category Navigation / Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none border-b border-stone-200/80 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  activeCategory === "all"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {text.allCategoryFilter} ({ALL_SERVICES.filter((s) => s.id !== "weather-alerts").length})
              </button>

              {SERVICE_CATEGORIES.map((cat) => {
                const count = ALL_SERVICES.filter(
                  (s) => s.category === cat.id && s.id !== "weather-alerts"
                ).length;
                const CatIcon = cat.icon;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    <CatIcon className="h-4 w-4" />
                    <span>{cat.title[currentLang]}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Service Category Sections */}
            {activeCategory === "all" ? (
              <div className="space-y-8">
                {SERVICE_CATEGORIES.map((category) => {
                  const servicesInCat = ALL_SERVICES.filter(
                    (item) => item.category === category.id && item.id !== "weather-alerts"
                  );
                  if (servicesInCat.length === 0) return null;
                  const CategoryIcon = category.icon;

                  return (
                    <div key={category.id} className="space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
                          <CategoryIcon className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                            {category.title[currentLang]}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400 leading-snug">
                            {category.description[currentLang]}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                        {servicesInCat.map((service) => (
                          <FarmerFeatureCard
                            key={service.id}
                            title={service.title[currentLang]}
                            description={service.description[currentLang]}
                            icon={service.icon}
                            href={service.href}
                            iconColor={service.iconColor}
                            badge={service.badge?.[currentLang]}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredServices.map((service) => (
                  <FarmerFeatureCard
                    key={service.id}
                    title={service.title[currentLang]}
                    description={service.description[currentLang]}
                    icon={service.icon}
                    href={service.href}
                    iconColor={service.iconColor}
                    badge={service.badge?.[currentLang]}
                  />
                ))}
              </div>
            )}
          </motion.section>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* SECTION F: VOICE ROUTING SAMPLE QUESTIONS                          */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <motion.section
            variants={itemVariants}
            aria-label="Voice Ideas"
            className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-[#FAF9F6] dark:bg-stone-900/80 p-5 sm:p-6 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100">
                  {text.voicePromptsHeading}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  {text.voicePromptsSub}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openVoiceAssistant()}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                <span>{text.voiceTitle}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              {VOICE_SAMPLE_QUERIES.map((q, idx) => {
                const QIcon = q.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openVoiceAssistant(q.text[currentLang])}
                    className="group flex items-center text-left gap-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-3.5 shadow-2xs hover:border-emerald-500/50 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      <QIcon className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      &ldquo;{q.text[currentLang]}&rdquo;
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        </>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION G: OFFICIAL DATA TRANSPARENCY FOOTNOTE                        */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <footer className="text-center text-[11px] text-stone-500 dark:text-stone-400 py-1">
        <p>{text.officialFootnote}</p>
      </footer>
    </motion.div>
  );
}

export default FarmerHome;
