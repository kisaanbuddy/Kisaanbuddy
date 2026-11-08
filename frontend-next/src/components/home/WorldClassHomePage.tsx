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
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* ─────────────────────────────────────────────────────────────
            2. GIANT VOICE-FIRST ASSISTANT CARD (बोलकर पूछें)
            Built specifically for farmers who prefer speaking over typing
        ───────────────────────────────────────────────────────────── */}
        <section className="relative rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-[#174B35] text-white p-6 sm:p-8 md:p-10 shadow-xl overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="pointer-events-none absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />

          <div className="relative space-y-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
                  {dict.voiceCard.badge}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {dict.voiceCard.greeting}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-emerald-100 max-w-xl font-normal">
                  {dict.voiceCard.subtitle}
                </p>
              </div>

              {/* GIANT PULSING MICROPHONE BUTTON */}
              <button
                type="button"
                onClick={() => openVoiceAssistant()}
                className="group relative flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white text-emerald-900 shadow-2xl hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer border-4 border-emerald-300"
                aria-label={dict.voiceCard.voiceBtn}
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping opacity-75" />
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-700 stroke-[2.4]" />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-black text-emerald-900 tracking-wide uppercase">
                  {dict.voiceCard.voiceBtn}
                </span>
              </button>
            </div>

            {/* Quick Sample Voice Prompts - Tap to Ask */}
            <div className="pt-4 border-t border-white/20">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block mb-3 text-center sm:text-left">
                {dict.voiceCard.faqPromptHeading}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dict.voiceCard.prompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openVoiceAssistant()}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left text-xs sm:text-sm text-white transition-colors cursor-pointer"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-semibold flex-1 leading-snug">{item.text}</span>
                    <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. BIG, SIMPLE PRIMARY TASK CARDS (खेती के मुख्य काम)
            Ultra-clear, high contrast, big touch targets for easy navigation
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 1: Crop Doctor (पत्ती की फोटो खींचें) */}
            <Link
              href="/disease"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-rose-200 dark:border-rose-950/60 hover:border-rose-500 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
                <Bug className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {dict.cards.cropDoctor.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                    {dict.cards.cropDoctor.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  {dict.cards.cropDoctor.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                  {dict.cards.cropDoctor.cta}
                </span>
              </div>
            </Link>

            {/* Card 2: Mandi Rates (आज का मंडी भाव) */}
            <Link
              href="/mandi"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-amber-200 dark:border-amber-950/60 hover:border-amber-500 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {dict.cards.mandi.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {dict.cards.mandi.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  {dict.cards.mandi.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400">
                  {dict.cards.mandi.cta}
                </span>
              </div>
            </Link>

            {/* Card 3: Weather (मौसम व स्प्रे समय) */}
            <Link
              href="/weather"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-sky-200 dark:border-sky-950/60 hover:border-sky-500 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900 flex items-center justify-center text-sky-600 shrink-0 group-hover:scale-105 transition-transform">
                <CloudSun className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {dict.cards.weather.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                    {dict.cards.weather.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  {dict.cards.weather.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-400">
                  {dict.cards.weather.cta}
                </span>
              </div>
            </Link>

            {/* Card 4: Tractor & Machinery (ट्रैक्टर व उपकरण) */}
            <Link
              href="/marketplace"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-200 dark:border-emerald-950/60 hover:border-emerald-600 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                <Tractor className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {dict.cards.machinery.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {dict.cards.machinery.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  {dict.cards.machinery.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  {dict.cards.machinery.cta}
                </span>
              </div>
            </Link>

            {/* Card 5: AgriLabour (खेत मजदूर) */}
            <Link
              href="/worker-connect"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-indigo-200 dark:border-indigo-950/60 hover:border-indigo-500 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-700 shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                    {dict.cards.agrilabour.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                    {dict.cards.agrilabour.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  {dict.cards.agrilabour.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-800 dark:text-indigo-400">
                  {dict.cards.agrilabour.cta}
                </span>
              </div>
            </Link>

            {/* Card 6: AI Chatbot (24x7 सलाह) */}
            <Link
              href="/chatbot"
              className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-teal-200 dark:border-teal-950/60 hover:border-teal-500 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 flex items-center justify-center text-teal-700 shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {dict.cards.aiAdvisor.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {dict.cards.aiAdvisor.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  {dict.cards.aiAdvisor.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-400">
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
            5. WHATSAPP DIRECT ASSISTANCE BAR
            For farmers who struggle with websites, direct WhatsApp access
        ───────────────────────────────────────────────────────────── */}
        <section className="rounded-3xl bg-[#25D366]/10 border-2 border-[#25D366]/30 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <strong className="block text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                {dict.whatsapp.title}
              </strong>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                {dict.whatsapp.desc}
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
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
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-2xl font-black text-emerald-700">{dict.howItWorks.step1Title}</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                {dict.howItWorks.step1Desc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-2xl font-black text-emerald-700">{dict.howItWorks.step2Title}</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                {dict.howItWorks.step2Desc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
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
