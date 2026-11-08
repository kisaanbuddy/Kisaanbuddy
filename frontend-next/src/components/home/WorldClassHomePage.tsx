"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Bug,
  TrendingUp,
  CloudSun,
  Tractor,
  Users,
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage, type Lang } from "@/lib/language";
import { openVoiceAssistant } from "@/components/assistant/VoiceAssistantModal";
import { SpeakHeroControlHub } from "@/components/voice/SpeakHeroControlHub";
import {
  resolveUserLocation,
  getCurrentByCoords,
  type UnifiedWeather,
} from "@/lib/weather-api";
import { translateCondition } from "@/lib/weather-translations";
import { HOME_I18N } from "@/lib/homepage-i18n";

export function WorldClassHomePage() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  // Load language dictionary dynamically based on selected language
  const dict = HOME_I18N[lang as Lang] || HOME_I18N.hi;

  // Location & Weather state
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function fetchWeather() {
      try {
        const loc = await resolveUserLocation();
        if (loc && isMounted) {
          setLocationName(loc.city || "");
          const w = await getCurrentByCoords(loc.lat, loc.lon);
          if (w && isMounted) setWeather(w);
        }
      } catch {
        // Fallback silently if offline or blocked
      }
    }
    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayLocation = locationName || dict.liveBar.yourRegion;
  const whatsappUrl = `https://wa.me/919429693427?text=${encodeURIComponent(dict.whatsapp.messageText)}`;

  return (
    <div className="edge-to-edge w-full bg-[#FBFDF9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen" data-fullwidth="true">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP LIVE FARM BAR (Location + Weather + Helpline)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#EBF3EC] dark:bg-stone-900 border-b border-emerald-900/10 dark:border-stone-800 py-2.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Location & Today's Temperature */}
          <div className="flex items-center gap-2 font-semibold text-emerald-950 dark:text-emerald-300">
            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{displayLocation}</span>
            {weather?.current && (
              <>
                <span className="text-stone-400">•</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {Math.round(weather.current.temp_c)}°C
                </span>
                <span className="text-stone-600 dark:text-stone-300 capitalize">
                  ({translateCondition(weather.current.condition, lang as Lang)})
                </span>
              </>
            )}
          </div>

          {/* Official Verification Note */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-900 dark:text-emerald-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{dict.liveBar.officialData}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION (EXACT REFERENCE FROM SCREENSHOT)
            Left: Typography, Headline, 3 CTA Buttons (Explore, AI Advisor,
                  and Central Speak / बोलें Control Hub with 6 Floating Pills)
            Right: Live Field Intelligence telemetry card
        ───────────────────────────────────────────────────────────── */}
        <section className="space-y-6 pt-2">
          {/* Top Live Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/20 text-emerald-900 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Intelligent Agriculture Platform for India</span>
            </div>

            {/* Live Weather Indicator Chip */}
            {weather?.current && (
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-stone-900 dark:text-white">
                  {weather.location?.name || locationName || "Local Farm"}:
                </span>
                <span>{Math.round(weather.current.temp_c)}°C</span>
                <span className="text-stone-400">•</span>
                <span className="capitalize">{translateCondition(weather.current.condition, lang as Lang)}</span>
              </div>
            )}
          </div>

          {/* Hero Grid: Typography on Left, Visual Telemetry on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.15]">
                Your Farm. Your Decisions.{" "}
                <span className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                  Smarter with AI.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-normal leading-relaxed max-w-2xl">
                From crop health diagnosis and hyperlocal weather intelligence to live mandi rates and agricultural services, KisaanBuddy helps Indian farmers make confident, data-driven farming decisions.
              </p>

              {/* Call to Actions - Including Central Speak Control Hub Anchor */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#capabilities"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <span>Explore KisaanBuddy</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/chatbot"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-stone-900 hover:bg-emerald-50/60 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-sm sm:text-base shadow-2xs hover:border-emerald-600/40 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Talk to AI Advisor</span>
                </Link>

                {/* THE CENTRAL SPEAK / बोलें CONTROL HUB WITH 6 FLOATING SERVICES */}
                <SpeakHeroControlHub />
              </div>

              {/* Trust & Source Assurance Markers */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-500 dark:text-stone-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>AGMARKNET Mandi Data</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>IMD Weather Verified</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ICAR Agronomic Standards</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Free for Farmers</span>
                </span>
              </div>
            </div>

            {/* Right Visual Showcase: Live Field Intelligence Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl">
                {/* Authentic Agricultural Field Photo */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src="/images/crops/indian-paddy-field.webp"
                    alt="Authentic agricultural field in India"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-xl px-3 py-1.5 border border-stone-200/80 dark:border-stone-700 shadow-md flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Live Field Intelligence</span>
                  </div>
                </div>

                {/* Overlaid Live Telemetry Rows */}
                <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-stone-900">
                  {/* Row 1: Mandi Modal Price */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F9F4] dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xs">
                        ₹
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>Wheat (गेहूं)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                            AGMARKNET
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          Average Modal Rate: ₹2,275 / क्विंटल
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/mandi"
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
                    >
                      Compare Mandis →
                    </Link>
                  </div>

                  {/* Row 2: Crop Pathology Leaf Diagnosis */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F9F4] dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-700 dark:text-rose-400 font-bold text-xs">
                        <Bug className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span>Leaf Diagnosis</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold">
                            ICAR Dosages
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          Early screening for blights & rusts
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/disease"
                      className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline shrink-0"
                    >
                      Scan Leaf →
                    </Link>
                  </div>

                  {/* Row 3: Weather Spray Advisory Window */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F9F4] dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-700 dark:text-sky-400 font-bold text-xs">
                        <CloudSun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Spray Advisory Window
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          Clear skies today • Safe for pesticide application
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/weather"
                      className="text-xs font-bold text-sky-700 dark:text-sky-400 hover:underline shrink-0"
                    >
                      3-Day View →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. BIG, SIMPLE PRIMARY TASK CARDS WITH AUTHENTIC THUMBNAILS
        ───────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
              {dict.cardsHeading}
            </h2>
            <span className="text-xs text-stone-500 font-semibold">
              {dict.cardsSubheading}
            </span>
          </div>

          {/* KisaanBuddy AI Voice Hub interactive launcher banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-white border border-emerald-500/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Mic className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">KisaanBuddy AI Voice Hub</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    6 Services • 100% Voice
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  {lang === "kn"
                    ? "ಬರೆಯಲು ಕಷ್ಟವೇ? ಮೈಕ್ ಒತ್ತಿ ನೇರವಾಗಿ ಮಾತನಾಡಿ — 6 ಸೇವೆಗಳು ನಿಮ್ಮ ಧ್ವನಿಯಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ"
                    : lang === "hi"
                    ? "टाइप करने की जरूरत नहीं — नीचे दी गई किसी भी सेवा के लिए सिर्फ बोलें"
                    : "Speak naturally in Hindi, Kannada or English to control all 6 agricultural services"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openVoiceAssistant()}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{lang === "kn" ? "ಧ್ವನಿ ಹಬ್ ತೆರೆಯಿರಿ" : lang === "hi" ? "वॉइस हब खोलें" : "Open Voice Hub"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Crop Doctor (पत्ती की फोटो खींचें) */}
            <Link
              href="/disease"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-rose-200 dark:border-rose-950/60 hover:border-rose-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden active:scale-[0.99]"
            >
              {/* Authentic Leaf Pathology Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src="/images/crop-doctor/powdery-mildew-leaf.webp"
                  alt="Crop Leaf Disease Detection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  <span>AI Crop Doctor</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.cropDoctor.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {dict.cards.cropDoctor.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.cropDoctor.desc}
                  </p>
                  {/* Voice Shortcut Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openVoiceAssistant("Mere tamatar ke paudhe mein bimari hai");
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900 text-[11px] font-semibold text-rose-800 dark:text-rose-300 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Mic className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="italic truncate">बोलें: "टमाटर में बीमारी है"</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-rose-500">Ask AI →</span>
                  </button>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                  {dict.cards.cropDoctor.cta}
                </span>
              </div>
            </Link>

            {/* Card 2: Mandi Rates (आज का मंडी भाव) */}
            <Link
              href="/mandi"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-amber-200 dark:border-amber-950/60 hover:border-amber-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden active:scale-[0.99]"
            >
              {/* Authentic Mandi Grain Market Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src="/images/mandi/grain-market-mandi.webp"
                  alt="APMC Mandi Grain Market"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>AGMARKNET Feeds</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.mandi.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {dict.cards.mandi.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.mandi.desc}
                  </p>
                  {/* Voice Shortcut Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openVoiceAssistant("Mujhe aaj ka mandi bhav batao");
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-900 text-[11px] font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Mic className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="italic truncate">बोलें: "आज का मंडी भाव बताओ"</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-amber-500">Ask AI →</span>
                  </button>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400">
                  {dict.cards.mandi.cta}
                </span>
              </div>
            </Link>

            {/* Card 3: Weather (मौसम व स्प्रे समय) */}
            <Link
              href="/weather"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-sky-200 dark:border-sky-950/60 hover:border-sky-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden active:scale-[0.99]"
            >
              {/* Authentic Monsoon Weather Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src="/images/weather/monsoon-farmland.webp"
                  alt="Farmland Weather and Rain Forecast"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-sky-400" />
                  <span>IMD Radar</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.weather.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {dict.cards.weather.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.weather.desc}
                  </p>
                  {/* Voice Shortcut Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openVoiceAssistant("Kal baarish hogi kya?");
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-900 text-[11px] font-semibold text-sky-800 dark:text-sky-300 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Mic className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="italic truncate">बोलें: "कल बारिश होगी क्या?"</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-sky-500">Ask AI →</span>
                  </button>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-400">
                  {dict.cards.weather.cta}
                </span>
              </div>
            </Link>

            {/* Card 4: Tractor & Machinery (ट्रैक्टर व उपकरण) */}
            <Link
              href="/marketplace"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-200 dark:border-emerald-950/60 hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden active:scale-[0.99]"
            >
              {/* Authentic Tractor Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center p-2">
                <img
                  src="/images/marketplace/tractors/mahindra-575.webp"
                  alt="Farm Tractor and Machinery Rental"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Tractor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Equipment Rental</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.machinery.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {dict.cards.machinery.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.machinery.desc}
                  </p>
                  {/* Voice Shortcut Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openVoiceAssistant("Mujhe tractor rent par chahiye");
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-900 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="italic truncate">बोलें: "ट्रैक्टर रेंट पर चाहिए"</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600">Ask AI →</span>
                  </button>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  {dict.cards.machinery.cta}
                </span>
              </div>
            </Link>

            {/* Card 5: AgriLabour (खेत मजदूर) */}
            <Link
              href="/worker-connect"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-indigo-200 dark:border-indigo-950/60 hover:border-indigo-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden active:scale-[0.99]"
            >
              {/* Authentic Farm Workers Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center p-2">
                <img
                  src="/images/agrilabour-hero-farmers.png"
                  alt="AgriLabour Farm Workers"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AgriLabour</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.agrilabour.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                    {dict.cards.agrilabour.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.agrilabour.desc}
                  </p>
                  {/* Voice Shortcut Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openVoiceAssistant("Mujhe kheti ke liye mazdoor chahiye");
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-900 text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="italic truncate">बोलें: "खेती के लिए मजदूर चाहिए"</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-indigo-500">Ask AI →</span>
                  </button>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-800 dark:text-indigo-400">
                  {dict.cards.agrilabour.cta}
                </span>
              </div>
            </Link>

            {/* Card 6: AI Chatbot (24x7 सलाह) */}
            <Link
              href="/chatbot"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-teal-200 dark:border-teal-950/60 hover:border-teal-500 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden active:scale-[0.99]"
            >
              {/* Authentic Lush Green Crop Field Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src="/images/crops/punjab-wheat-field.webp"
                  alt="Agricultural Field Advisory"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>24x7 AI Advisor</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.aiAdvisor.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {dict.cards.aiAdvisor.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.aiAdvisor.desc}
                  </p>
                  {/* Voice Shortcut Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openVoiceAssistant("Fertilizer kab dalna hai?");
                    }}
                    className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-900 text-[11px] font-semibold text-teal-800 dark:text-teal-300 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Mic className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="italic truncate">बोलें: "खाद कब डालना है?"</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-teal-600">Ask AI →</span>
                  </button>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-400">
                  {dict.cards.aiAdvisor.cta}
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. TODAY'S FIELD ADVISORY (आज की मुख्य सलाह)
        ───────────────────────────────────────────────────────────── */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{dict.advisory.title}</span>
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              {dict.advisory.source}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather & Spray Safety */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
              <CloudSun className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  {dict.advisory.weatherStatusTitle}
                </strong>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 mt-0.5 leading-relaxed">
                  {dict.advisory.weatherStatusDesc}
                </p>
              </div>
            </div>

            {/* Mandi Selling Tip */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-amber-950 dark:text-amber-200">
                  {dict.advisory.mandiTipTitle}
                </strong>
                <p className="text-xs text-amber-900 dark:text-amber-300 mt-0.5 leading-relaxed">
                  {dict.advisory.mandiTipDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. WHATSAPP DIRECT ASSISTANCE BAR (With Phone Mockup)
        ───────────────────────────────────────────────────────────── */}
        <section className="rounded-3xl bg-[#25D366]/10 border-2 border-[#25D366]/30 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-7 h-7 fill-current" />
            </div>
            <div>
              <strong className="block text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                {dict.whatsapp.title}
              </strong>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-0.5">
                {dict.whatsapp.desc}
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>{dict.whatsapp.cta}</span>
          </a>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. SIMPLE 3-STEP GUIDE (उपयोग कैसे करें?)
        ───────────────────────────────────────────────────────────── */}
        <section className="text-center space-y-4 pt-4">
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
            {dict.howItWorks.heading}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
              <span className="text-2xl font-black text-emerald-700">{dict.howItWorks.step1Title}</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                {dict.howItWorks.step1Desc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
              <span className="text-2xl font-black text-emerald-700">{dict.howItWorks.step2Title}</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                {dict.howItWorks.step2Desc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
              <span className="text-2xl font-black text-emerald-700">{dict.howItWorks.step3Title}</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                {dict.howItWorks.step3Desc}
              </p>
            </div>
          </div>

          <div className="pt-4 text-xs text-stone-500 font-medium">
            <span>{dict.howItWorks.footerNote}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
