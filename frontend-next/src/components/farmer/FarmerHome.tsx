"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CloudSun,
  MapPin,
  Mic,
  Sprout,
  Store,
  Stethoscope,
  TrendingUp,
  Users,
  Wheat,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Wind,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { farmerProfileApi } from "@/lib/farmer-api";
import {
  resolveUserLocation,
  getCurrentByCoords,
  getForecastByCoords,
  type UnifiedWeather,
  type ForecastBundle,
} from "@/lib/weather-api";
import { translateCondition } from "@/lib/weather-translations";

const COPY = {
  en: {
    greeting: "Namaste",
    subtitle: "What would you like to do today?",
    voice: "Speak to KisaanBuddy",
    voiceHint: "Tap to ask in your language: 'Wheat mandi price', 'Tomato leaf spots'",
    crop: "Crop Problem",
    cropNote: "Photo or symptom diagnosis",
    mandi: "Today's Mandi Price",
    mandiNote: "Nearby market rates",
    sell: "Sell My Crop",
    sellNote: "Direct buyers & mandi",
    help: "Farming Help",
    helpNote: "Labour, tractor & schemes",
    weather: "Weather Alert",
    seeAll: "See all services",
    editFarm: "Change",
    setupFarm: "Set your village and main crop for customized prices & weather",
    safeSpray: "No rain expected today — good condition for field irrigation or spray.",
    rainAlert: "Rain expected soon — hold pesticide spray and ensure field drainage.",
    checkWeatherLink: "View full 3-day forecast",
  },
  hi: {
    greeting: "नमस्ते",
    subtitle: "आज आपको किस काम में मदद चाहिए?",
    voice: "किसानबडी से बोलकर पूछें",
    voiceHint: "बोलकर पूछें: 'गेहूं का मंडी भाव बताओ', 'टमाटर की पत्ती पर दाग'",
    crop: "फसल की समस्या",
    cropNote: "पत्ती की फोटो से बीमारी पहचानें",
    mandi: "आज का मंडी भाव",
    mandiNote: "आस-पास की मंडियों के भाव",
    sell: "अपनी फसल बेचें",
    sellNote: "सीधे खरीदार व मंडी लिस्टिंग",
    help: "खेती में मदद",
    helpNote: "मजदूर, ट्रैक्टर व सरकारी योजनाएं",
    weather: "मौसम व खेती सलाह",
    seeAll: "सभी सेवाएं देखें",
    editFarm: "बदलें",
    setupFarm: "सही भाव और मौसम के लिए अपना गांव और मुख्य फसल जोड़ें",
    safeSpray: "आज बारिश की संभावना नहीं है — सिंचाई या कीटनाशक छिड़काव कर सकते हैं।",
    rainAlert: "आज बारिश की संभावना है — कीटनाशक छिड़काव रोकें और जल निकासी का प्रबंध रखें।",
    checkWeatherLink: "पूरा 3 दिन का मौसम अनुमान देखें",
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ",
    subtitle: "ಇಂದು ಯಾವ ಕೆಲಸಕ್ಕೆ ಸಹಾಯ ಬೇಕು?",
    voice: "ಕಿಸಾನ್‌ಬಡ್ಡಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ",
    voiceHint: "ಮಾತನಾಡಿ ಕೇಳಿ: 'ಗೋಧಿ ಮಂಡಿ ಬೆಲೆ', 'ಟೊಮೆಟೊ ಎಲೆ ರೋಗ'",
    crop: "ಬೆಳೆ ಸಮಸ್ಯೆ",
    cropNote: "ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ಪರಿಹಾರ ಪಡೆಯಿರಿ",
    mandi: "ಇಂದಿನ ಮಂಡಿ ಬೆಲೆ",
    mandiNote: "ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆ ದರಗಳು",
    sell: "ನನ್ನ ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ",
    sellNote: "ನೇರ ಖರೀದಿದಾರರು ಮತ್ತು ಮಂಡಿ",
    help: "ಕೃಷಿ ಸಹಾಯ",
    helpNote: "ಕೂಲಿ ಕಾರ್ಮಿಕರು, ಟ್ರ್ಯಾಕ್ಟರ್, ಯೋಜನೆ",
    weather: "ಹವಾಮಾನ & ಕೃಷಿ ಎಚ್ಚರಿಕೆ",
    seeAll: "ಎಲ್ಲಾ ಸೇವೆಗಳು",
    editFarm: "ಬದಲಾಯಿಸಿ",
    setupFarm: "ನಿಖರ ಬೆಲೆ ಮತ್ತು ಹವಾಮಾನಕ್ಕಾಗಿ ನಿಮ್ಮ ಊರು ಮತ್ತು ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ",
    safeSpray: "ಇಂದು ಮಳೆಯ ಸಾಧ್ಯತೆ ಇಲ್ಲ — ಔಷಧ ಸಿಂಪಡಣೆ ಅಥವಾ ನೀರಾವರಿಗೆ ಸೂಕ್ತ ಸಮಯ.",
    rainAlert: "ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ — ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ, ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರ ವಹಿಸಿ.",
    checkWeatherLink: "ಮುಂದಿನ 3 ದಿನಗಳ ಪೂರ್ಣ ಹವಾಮಾನ ನೋಡಿ",
  },
} as const;

export function FarmerHome() {
  const { user, ready } = useAuth();
  const { lang } = useLanguage();
  const text = COPY[lang as keyof typeof COPY] || COPY.en;
  const firstName = user?.name?.trim().split(/\s+/)[0];

  // Saved farm details state
  const [savedVillage, setSavedVillage] = useState<string>("");
  const [savedDistrict, setSavedDistrict] = useState<string>("");
  const [savedCrop, setSavedCrop] = useState<string>("");

  // Weather state
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastBundle | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);

  // 1. Load saved farm profile (backend if user logged in, or localStorage for guest)
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      // Check localStorage first for instant display
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
        // ignore
      }

      // If user is authenticated, sync with server profile
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

  // 4 Primary Shortcuts as requested in IA
  const primaryShortcuts = [
    {
      href: "/disease",
      icon: Stethoscope,
      title: text.crop,
      note: text.cropNote,
      color: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
    },
    {
      href: "/mandi",
      icon: TrendingUp,
      title: text.mandi,
      note: text.mandiNote,
      color: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
    },
    {
      href: "/mandi?tab=sell",
      icon: Wheat,
      title: text.sell,
      note: text.sellNote,
      color: "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
    {
      href: "/madad",
      icon: Users,
      title: text.help,
      note: text.helpNote,
      color: "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
    },
  ];

  // Determine rain alert from forecast
  const rainChance = forecast?.daily?.[0]?.chance_of_rain ?? 0;
  const isRainLikely = rainChance > 40;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6">
      {/* ── 1. WELCOME MESSAGE & SAVED FARM BANNER ── */}
      <section className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900/90 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary dark:text-emerald-400">
              {text.greeting}
              {ready && firstName ? `, ${firstName}` : ""}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
              {text.subtitle}
            </h1>
          </div>

          {/* Saved farm badge / setup prompt */}
          {hasFarmInfo ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-white dark:bg-stone-800 px-3.5 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-xs">
              <MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>
                {[savedVillage, savedDistrict].filter(Boolean).join(", ")}
                {savedCrop ? ` • 🌾 ${savedCrop}` : ""}
              </span>
              <Link
                href="/farmer-profile"
                className="ml-1 font-bold text-primary dark:text-emerald-400 hover:underline"
              >
                {text.editFarm}
              </Link>
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-800/80 px-3.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:border-primary/50 transition-colors"
            >
              <MapPin className="h-4 w-4 text-stone-500 shrink-0" />
              <span>{text.setupFarm}</span>
            </Link>
          )}
        </div>
      </section>

      {/* ── 2. PROMINENT VOICE ASSISTANT HERO ── */}
      <section aria-label="Voice Assistant">
        <Link
          href="/chatbot?listen=1"
          className="group relative flex min-h-[110px] items-center gap-4 sm:gap-6 rounded-2xl bg-primary px-5 py-5 text-white shadow-md transition-all hover:bg-primary/95 hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 sm:px-7"
        >
          {/* Animated Mic Target */}
          <div className="relative flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs shadow-inner">
            <span className="absolute inset-0 rounded-2xl border-2 border-white/40 animate-ping motion-reduce:animate-none opacity-40" />
            <Mic className="h-8 w-8 text-white stroke-[2.4]" aria-hidden="true" />
          </div>

          {/* Voice Prompt Text */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="block text-xl sm:text-2xl font-extrabold tracking-tight">
                {text.voice}
              </span>
              <span className="hidden sm:inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                Voice AI
              </span>
            </div>
            <p className="mt-1 text-sm sm:text-base text-white/90 leading-snug">
              {text.voiceHint}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-bold text-white shrink-0 group-hover:bg-white/30 transition-colors">
            <span>बोलें / Speak</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </section>

      {/* ── 3. FOUR PRIMARY SHORTCUTS ── */}
      <section aria-labelledby="primary-shortcuts-heading">
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary dark:text-emerald-400">
              Quick Shortcuts
            </p>
            <h2
              id="primary-shortcuts-heading"
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100"
            >
              जरूरी काम (Main Tasks)
            </h2>
          </div>
          <Link
            href="/fasal"
            className="text-sm font-bold text-primary dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{text.seeAll}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {primaryShortcuts.map(({ href, icon: Icon, title, note, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-[140px] flex-col justify-between rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/95 p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border ${color} shadow-xs transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-6 w-6 stroke-[2.2]" aria-hidden="true" />
                </span>
                <span className="text-stone-400 group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">
                  {title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-tight">
                  {note}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. RELEVANT WEATHER & FARMING ADVISORY ALERT ── */}
      <section aria-label="Weather Alert">
        <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/95 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                  isRainLikely
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-sky-50 text-sky-800 border-sky-200"
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

                <p className="mt-1.5 text-sm sm:text-base text-stone-700 dark:text-stone-200 leading-snug">
                  {isRainLikely ? text.rainAlert : text.safeSpray}
                </p>
              </div>
            </div>

            <Link
              href="/weather"
              className="shrink-0 min-h-[44px] px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-primary hover:text-white dark:hover:bg-primary text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{text.checkWeatherLink}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. TRANSPARENT OFFICIAL DATA FOOTNOTE ── */}
      <footer className="rounded-xl border border-stone-200/60 dark:border-stone-800/60 bg-[#FAF8F5]/60 dark:bg-stone-900/50 p-4 text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            मंडी दरें और मौसम रिपोर्ट आधिकारिक स्रोतों (Agmarknet / IMD) से
            नियमित अपडेट की जाती हैं। फसल बेचने से पहले अपनी स्थानीय मंडी से
            दरों की पुष्टि अवश्य करें।
          </p>
        </div>
      </footer>
    </div>
  );
}
