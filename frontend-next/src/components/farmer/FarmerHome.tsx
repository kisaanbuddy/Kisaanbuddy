"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  CloudSun,
  MapPin,
  Mic,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Search,
  X,
  Volume2,
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
import { translateCondition } from "@/lib/weather-translations";
import { FarmerFeatureCard } from "./FarmerFeatureCard";
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
    searchPlaceholder: "What would you like to do? (e.g. Wheat price, disease, weather, labour...)",
    searchLabel: "Search farming services",
    quickShortcutsBadge: "QUICK SHORTCUTS",
    quickShortcutsTitle: "Essential Tasks",
    allServicesBadge: "COMPLETE SERVICE DIRECTORY",
    allServicesTitle: "All Farming Services",
    allServicesSubtitle: "Every farming tool in one place — click any service to open directly",
    allCategoryFilter: "All Services",
    weather: "Weather & Farm Advisory",
    safeSpray: "No rain expected today — good condition for field irrigation or spray.",
    rainAlert: "Rain expected soon — hold pesticide spray and ensure field drainage.",
    checkWeatherLink: "View 3-day forecast",
    editFarm: "Change",
    setupFarm: "Set your village and main crop for customized prices & weather",
    officialFootnote:
      "Market rates from AGMARKNET • Weather reports from IMD",
    resultsFound: "services found for",
    clearSearch: "Clear",
    noResultsTitle: "No matching service found",
    noResultsHint: "Try searching with other words, or speak directly to the KisaanBuddy Voice Assistant.",
    askVoiceInstead: "Ask with Voice",
    voicePromptsHeading: "Voice Questions Farmers Often Ask",
    voicePromptsSub: "Tap any question to speak with KisaanBuddy AI:",
    languageLabel: "Language",
  },
  hi: {
    greeting: "नमस्ते किसान भाई",
    subtitle: "आज आपके खेत में क्या मदद चाहिए?",
    voiceTitle: "बोलकर पूछें (वॉइस एआई)",
    voiceBadge: "वॉइस असिस्टेंट",
    voiceHint: "बोलकर पूछें: 'गेहूं का मंडी भाव बताओ', 'टमाटर की पत्ती पर पीले धब्बे'",
    voiceButtonText: "बोलकर पूछें",
    searchPlaceholder: "आप क्या करना चाहते हैं? (उदा. गेहूं का भाव, बीमारी, मौसम, मजदूर, ट्रैक्टर, खाद...)",
    searchLabel: "खेती की सेवाएं खोजें",
    quickShortcutsBadge: "QUICK SHORTCUTS",
    quickShortcutsTitle: "जरूरी काम (Main Tasks)",
    allServicesBadge: "COMPLETE SERVICE DIRECTORY",
    allServicesTitle: "खेती के सभी काम (All Farming Services)",
    allServicesSubtitle: "हर किसान सेवा अब एक ही जगह — सीधे क्लिक करके इस्तेमाल करें",
    allCategoryFilter: "सभी सेवाएं",
    weather: "मौसम व खेती सलाह",
    safeSpray: "आज बारिश की संभावना नहीं है — सिंचाई या कीटनाशक छिड़काव कर सकते हैं।",
    rainAlert: "आज बारिश की संभावना है — कीटनाशक छिड़काव रोकें और जल निकासी का प्रबंध रखें।",
    checkWeatherLink: "पूरा 3 दिन का मौसम अनुमान देखें",
    editFarm: "बदलें",
    setupFarm: "सही भाव और मौसम के लिए अपना गांव और मुख्य फसल जोड़ें",
    officialFootnote:
      "मंडी भाव: AGMARKNET • मौसम: IMD",
    resultsFound: "सेवाएं मिलीं खोज शब्द:",
    clearSearch: "हटाएं",
    noResultsTitle: "कोई सेवा नहीं मिली",
    noResultsHint: "कृपया अन्य शब्दों से खोजें, या किसानबडी वॉइस असिस्टेंट से बोलकर पूछें।",
    askVoiceInstead: "बोलकर पूछें",
    voicePromptsHeading: "किसान भाई अक्सर यह सवाल पूछते हैं",
    voicePromptsSub: "किसी भी सवाल पर टैप करें और तुरंत समाधान पाएं:",
    languageLabel: "भाषा",
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ",
    subtitle: "ಇಂದು ನಿಮ್ಮ ಜಮೀನಿಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?",
    voiceTitle: "ಮಾತನಾಡಿ ಕೇಳಿ (ವಾಯ್ಸ್ ಎಐ)",
    voiceBadge: "ಧ್ವನಿ ಸಹಾಯಕ",
    voiceHint: "ಮಾತನಾಡಿ ಕೇಳಿ: 'ಗೋಧಿ ಮಂಡಿ ಬೆಲೆ', 'ಟೊಮೆಟೊ ಎಲೆ ರೋಗ', 'ಇಂದಿನ ಮಳೆ'",
    voiceButtonText: "ಮಾತನಾಡಿ / Speak",
    searchPlaceholder: "ನೀವು ಏನು ಮಾಡಬೇಕೆಂದು ಬಯಸುತ್ತೀರಿ? (ಉದಾ. ಬೆಲೆ, ರೋಗ, ಹವಾಮಾನ, ಕೂಲಿ, ಟ್ರ್ಯಾಕ್ಟರ್...)",
    searchLabel: "ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ",
    quickShortcutsBadge: "QUICK SHORTCUTS",
    quickShortcutsTitle: "ಅಗತ್ಯ ಕೆಲಸಗಳು (Main Tasks)",
    allServicesBadge: "COMPLETE SERVICE DIRECTORY",
    allServicesTitle: "ಕೃಷಿಯ ಎಲ್ಲಾ ಸೇವೆಗಳು (All Farming Services)",
    allServicesSubtitle: "ಎಲ್ಲಾ ಕೃಷಿ ಸೇವೆಗಳು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ — ನೇರವಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ ಬಳಸಿ",
    allCategoryFilter: "ಎಲ್ಲಾ ಸೇವೆಗಳು",
    weather: "ಹವಾಮಾನ & ಕೃಷಿ ಎಚ್ಚರಿಕೆ",
    safeSpray: "ಇಂದು ಮಳೆಯ ಸಾಧ್ಯತೆ ಇಲ್ಲ — ಔಷಧ ಸಿಂಪಡಣೆ ಅಥವಾ ನೀರಾವರಿಗೆ ಸೂಕ್ತ ಸಮಯ.",
    rainAlert: "ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ — ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ, ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರ ವಹಿಸಿ.",
    checkWeatherLink: "ಮುಂದಿನ 3 ದಿನಗಳ ಪೂರ್ಣ ಹವಾಮಾನ ನೋಡಿ",
    editFarm: "ಬದಲಾಯಿಸಿ",
    setupFarm: "ನಿಖರ ಬೆಲೆ ಮತ್ತು ಹವಾಮಾನಕ್ಕಾಗಿ ನಿಮ್ಮ ಊರು ಮತ್ತು ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ",
    officialFootnote:
      "ಮಂಡಿ ದರಗಳು: AGMARKNET • ಹವಾಮಾನ: IMD",
    resultsFound: "ಸೇವೆಗಳು ದೊರೆತಿವೆ ಹುಡುಕಾಟ:",
    clearSearch: "ತೆರವುಗೊಳಿಸಿ",
    noResultsTitle: "ಯಾವುದೇ ಸೇವೆ ಕಂಡುಬಂದಿಲ್ಲ",
    noResultsHint: "ದಯವಿಟ್ಟು ಬೇರೆ ಪದಗಳಿಂದ ಹುಡುಕಿ, ಅಥವಾ ಕಿಸಾನ್‌ಬಡ್ಡಿ ವಾಯ್ಸ್ ಸಹಾಯಕನಲ್ಲಿ ಮಾತನಾಡಿ ಕೇಳಿ.",
    askVoiceInstead: "ಮಾತನಾಡಿ ಕೇಳಿ",
    voicePromptsHeading: "ರೈತರು ಹೆಚ್ಚಾಗಿ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು",
    voicePromptsSub: "ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಒತ್ತಿ ತಕ್ಷಣ ಪರಿಹಾರ ಪಡೆಯಿರಿ:",
    languageLabel: "ಭಾಷೆ",
  },
} as const;

export function FarmerHome() {
  const { user, ready } = useAuth();
  const { lang, setLang } = useLanguage();

  // Current language resolution:
  const currentLang: "hi" | "en" | "kn" =
    lang === "kn" ? "kn" : lang === "en" ? "en" : "hi";
  const text = COPY[currentLang] || COPY.hi;
  const firstName = user?.name?.trim().split(/\s+/)[0];

  // Saved farm details state
  const [savedVillage, setSavedVillage] = useState<string>("");
  const [savedDistrict, setSavedDistrict] = useState<string>("");
  const [savedCrop, setSavedCrop] = useState<string>("");

  // Weather state
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastBundle | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);

  // Search and category filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryKey | "all">("all");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

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

  // 2. Load hyper-local weather
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      try {
        setWeatherLoading(true);
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
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    }
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasFarmInfo = Boolean(savedVillage || savedDistrict || savedCrop);

  // 4 Primary Shortcuts as specified in Section B
  const primaryShortcuts = useMemo(() => {
    return ALL_SERVICES.filter((item) => item.isQuickShortcut);
  }, []);

  // Filtered services for Search or Category Tab
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      if (activeCategory === "all") return ALL_SERVICES;
      return ALL_SERVICES.filter((item) => item.category === activeCategory);
    }

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

  // Determine rain alert from forecast
  const rainChance = forecast?.daily?.[0]?.chance_of_rain ?? 0;
  const isRainLikely = rainChance > 40;

  // Search quick chips
  const quickSearchChips = [
    { label: currentLang === "kn" ? "🌾 ಗೋಧಿ ಬೆಲೆ" : currentLang === "en" ? "🌾 Wheat Price" : "🌾 गेहूं का भाव", query: currentLang === "kn" ? "ಗೋಧಿ" : currentLang === "en" ? "wheat" : "गेहूं" },
    { label: currentLang === "kn" ? "🍃 ಬೆಳೆ ರೋಗ" : currentLang === "en" ? "🍃 Crop Disease" : "🍃 फसल में बीमारी", query: currentLang === "kn" ? "ರೋಗ" : currentLang === "en" ? "disease" : "बीमारी" },
    { label: currentLang === "kn" ? "🌧️ ಹವಾಮಾನ" : currentLang === "en" ? "🌧️ Weather" : "🌧️ मौसम", query: currentLang === "kn" ? "ಹವಾಮಾನ" : currentLang === "en" ? "weather" : "मौसम" },
    { label: currentLang === "kn" ? "👥 ಕೂಲಿ ಕಾರ್ಮಿಕರು" : currentLang === "en" ? "👥 Labour" : "👥 मजदूर", query: currentLang === "kn" ? "ಕಾರ್ಮಿಕರು" : currentLang === "en" ? "labour" : "मजदूर" },
    { label: currentLang === "kn" ? "🚜 ಟ್ರ್ಯಾಕ್ಟರ್" : currentLang === "en" ? "🚜 Tractor" : "🚜 ट्रैक्टर", query: currentLang === "kn" ? "ಟ್ರ್ಯಾಕ್ಟರ್" : currentLang === "en" ? "tractor" : "ट्रैक्टर" },
    { label: currentLang === "kn" ? "🧪 ರಸಗೊಬ್ಬರ" : currentLang === "en" ? "🧪 Fertilizer" : "🧪 खाद", query: currentLang === "kn" ? "ರಸಗೊಬ್ಬರ" : currentLang === "en" ? "fertilizer" : "खाद" },
    { label: currentLang === "kn" ? "📜 ಸರ್ಕಾರಿ ಯೋಜನೆ" : currentLang === "en" ? "📜 Gov Schemes" : "📜 सरकारी योजना", query: currentLang === "kn" ? "ಯೋಜನೆ" : currentLang === "en" ? "schemes" : "योजना" },
    { label: currentLang === "kn" ? "📒 ಖೇತ್ ಡೈರಿ" : currentLang === "en" ? "📒 Khet Diary" : "📒 खेत डायरी", query: currentLang === "kn" ? "ಡೈರಿ" : currentLang === "en" ? "diary" : "डायरी" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-12">
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION A: HERO / FARMER WELCOME                                       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <section
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
                  <div className="absolute left-0 mt-1.5 w-36 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-1.5 shadow-lg z-30">
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

        {/* ── Prominent Voice-Assistant Button (Primary Action) ── */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => openVoiceAssistant()}
            className="group relative flex w-full text-left min-h-[96px] sm:min-h-[105px] items-center gap-4 sm:gap-6 rounded-2xl bg-emerald-700 dark:bg-emerald-800 hover:bg-emerald-600 px-5 sm:px-7 py-4 sm:py-5 text-white shadow-md hover:shadow-lg active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 cursor-pointer"
          >
            {/* Pulsing Mic Container */}
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs shadow-inner">
              <span className="absolute inset-0 rounded-2xl border-2 border-white/40 animate-ping motion-reduce:animate-none opacity-40" />
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

        {/* ── Feature Discovery Search Bar (Secondary Action) ── */}
        <div className="mt-5">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              className="w-full rounded-2xl border border-stone-200/90 dark:border-stone-700 bg-white dark:bg-stone-900 py-3.5 pl-11 pr-11 text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/15 shadow-xs transition-all"
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

          {/* Quick Keyword Search Chips */}
          <div className="mt-3 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickSearchChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSearchQuery(chip.query)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                  searchQuery.toLowerCase() === chip.query.toLowerCase()
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "border-stone-200/80 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-500/50 hover:bg-stone-50 dark:hover:bg-stone-700/40"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

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
          {/* SECTION B: MAIN TASKS (QUICK SHORTCUTS)                           */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <section aria-labelledby="primary-shortcuts-heading">
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
          </section>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* WEATHER & HYPERLOCAL ADVISORY ALERT                                */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <section aria-label="Weather Alert">
            <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/95 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                      isRainLikely
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                        : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                    }`}
                  >
                    <CloudSun className="h-6 w-6 stroke-[2.2]" aria-hidden="true" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100">
                        {weather
                          ? `${weather.location.name} — ${Math.round(
                              weather.current.temp_c
                            )}°C`
                          : text.weather}
                      </span>
                      {weather && (
                        <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                          (
                          {translateCondition(
                            weather.current.condition,
                            (lang as any) || "hi"
                          )}
                          )
                        </span>
                      )}
                      {isRainLikely ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          <Droplets className="h-3 w-3" />
                          {rainChance}% बारिश
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                          <ShieldCheck className="h-3 w-3" />
                          मौसम साफ
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-snug">
                      {isRainLikely ? text.rainAlert : text.safeSpray}
                    </p>
                  </div>
                </div>

                <Link
                  href="/weather"
                  className="shrink-0 min-h-[44px] px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-700 hover:text-white dark:hover:bg-emerald-700 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{text.checkWeatherLink}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* SECTION C: ALL FARMING SERVICES (COMPLETE DIRECTORY)               */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <section id="all-services-section" aria-labelledby="all-services-heading" className="space-y-6">
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
                {text.allCategoryFilter} ({ALL_SERVICES.length})
              </button>

              {SERVICE_CATEGORIES.map((cat) => {
                const count = ALL_SERVICES.filter((s) => s.category === cat.id).length;
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
              // When "All" is active, display organized by category headings
              <div className="space-y-8">
                {SERVICE_CATEGORIES.map((category) => {
                  const servicesInCat = ALL_SERVICES.filter(
                    (item) => item.category === category.id
                  );
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
              // When a specific category tab is selected
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
          </section>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* VOICE ROUTING SAMPLE QUESTIONS                                     */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <section aria-label="Voice Ideas" className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-[#FAF9F6] dark:bg-stone-900/80 p-5 sm:p-6 shadow-xs">
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
          </section>
        </>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION D: OFFICIAL DATA TRANSPARENCY FOOTNOTE                        */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <footer className="text-center text-[11px] text-stone-500 dark:text-stone-400 py-1">
        <p>{text.officialFootnote}</p>
      </footer>
    </div>
  );
}

export default FarmerHome;
