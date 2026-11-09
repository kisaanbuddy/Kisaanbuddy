"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Sparkles,
  Bug,
  TrendingUp,
  CloudSun,
  Tractor,
  Users,
  Landmark,
  FlaskConical,
  Sprout,
  Layers,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Scan,
  Volume2,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Stethoscope,
  BarChart3,
  CalendarDays,
  FileCheck2,
} from "lucide-react";
import { openVoiceAssistant } from "@/components/assistant/VoiceAssistantModal";
import { useLanguage, type Lang } from "@/lib/language";

type FilterTab = "all" | "ai" | "market" | "agronomy";

interface FeatureCardProps {
  titleEn: string;
  titleHi: string;
  badgeEn: string;
  badgeHi: string;
  descEn: string;
  descHi: string;
  actionEn: string;
  actionHi: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: {
    border: string;
    borderHover: string;
    bgHover: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
  };
  metrics?: { en: string; hi: string };
  pillTags?: Array<{ en: string; hi: string }>;
  isWide?: boolean;
}

export function HeroFeatureShowcase() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const isHi = lang === "hi";

  const quickPrompts = [
    {
      en: "Yellow Rust cure?",
      hi: "पीला रतुआ का इलाज?",
      query: "गेहूं में पीला रतुआ का इलाज क्या है?",
    },
    {
      en: "Today's Mandi rate?",
      hi: "आज का मंडी भाव?",
      query: "आज का प्रमुख मंडी भाव क्या है?",
    },
    {
      en: "Best spray time?",
      hi: "स्प्रे का सही समय?",
      query: "आज कीटनाशक छिड़काव का सही समय क्या है?",
    },
  ];

  return (
    <div className="relative w-full rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/90 dark:border-stone-800 shadow-[0_20px_50px_rgba(20,83,45,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3.5 sm:p-5 transition-all">
      {/* Decorative ambient background glows */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────────────────────────
          1. DASHBOARD TELEMETRY TOP BAR & FILTER TABS
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200">
            {isHi ? "किसानबडी एग्रीटेक सुइट" : "KisaanBuddy Agro-OS"}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20">
            {isHi ? "14 सेवाएं सक्रिय" : "14 Services Active"}
          </span>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px] font-semibold text-stone-600 dark:text-stone-400">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-emerald-800 text-white shadow-2xs font-bold"
                : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
            }`}
          >
            {isHi ? "सभी सेवाएं" : "All Services"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "ai"
                ? "bg-emerald-800 text-white shadow-2xs font-bold"
                : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
            }`}
          >
            AI & Disease
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("market")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "market"
                ? "bg-emerald-800 text-white shadow-2xs font-bold"
                : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
            }`}
          >
            Mandi & Labour
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agronomy")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "agronomy"
                ? "bg-emerald-800 text-white shadow-2xs font-bold"
                : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
            }`}
          >
            Weather & Soil
          </button>
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        {/* ─────────────────────────────────────────────────────────────
            2. CENTRAL FLAGSHIP FEATURE: AI FARMING ADVISOR & VOICE AI ASSISTANT
            (Prominently featured, interactive, with voice waveforms and prompts)
        ───────────────────────────────────────────────────────────── */}
        {(activeTab === "all" || activeTab === "ai") && (
          <div className="group relative rounded-2xl bg-gradient-to-br from-emerald-500/[0.09] via-emerald-500/[0.03] to-teal-500/[0.09] dark:from-emerald-950/60 dark:via-stone-900 dark:to-teal-950/40 border-2 border-emerald-600/35 dark:border-emerald-500/35 p-3.5 sm:p-4 hover:border-emerald-600/60 transition-all duration-300 shadow-sm hover:shadow-md">
            {/* Flagship Header Telemetry */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1">
                  <span>{isHi ? "फ्लैगशिप AI सेवा" : "Flagship AI Command Hub"}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-600/15 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20">
                  10+ Indian Languages
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  ⚡ 0.8s Voice Response
                </span>
              </div>
            </div>

            {/* Core Flagship Description & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <span>{isHi ? "AI फार्मिंग एडवाइजर व वॉयस असिस्टेंट" : "AI Farming Advisor & Voice AI"}</span>
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-md">
                  {isHi
                    ? "अपनी बोली में बोलें या चैट करें — फसल रोग निदान, दैनिक मंडी भाव, मौसम अलर्ट व सरकारी योजनाओं का तुरंत समाधान।"
                    : "Speak or chat in Hindi, Kannada or English for instant agronomist diagnosis, live mandi rates & weather advisory."}
                </p>
              </div>

              {/* Action Buttons: Voice AI + Chatbot Advisor */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() => openVoiceAssistant()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 group/btn cursor-pointer"
                  title={isHi ? "बोलकर पूछें (Voice AI)" : "Tap to speak in your language"}
                >
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-2 bg-white rounded-full animate-[pulse_1.1s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-3 bg-white rounded-full animate-[pulse_0.9s_ease-in-out_infinite]" />
                  </div>
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isHi ? "बोलें (Voice)" : "Voice AI"}</span>
                </button>

                <Link
                  href="/chatbot"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 border border-emerald-600/30 text-emerald-900 dark:text-emerald-300 font-bold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <span>{isHi ? "AI चैट →" : "Talk to AI →"}</span>
                </Link>
              </div>
            </div>

            {/* Quick Clickable Query Prompts */}
            <div className="mt-3 pt-2.5 border-t border-emerald-900/10 dark:border-emerald-500/10 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                {isHi ? "बोलकर पूछें:" : "Quick Voice Queries:"}
              </span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openVoiceAssistant(q.query)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-stone-800/80 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/80 border border-stone-200/80 dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-300 transition-all text-left cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{isHi ? q.hi : q.en}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. DYNAMIC ASYMMETRIC BENTO SUITE: DIFFERENT-SIZED SAAS CARDS
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Card 1: Crop Disease Detection & Leaf Diagnosis */}
          {(activeTab === "all" || activeTab === "ai") && (
            <Link
              href="/disease"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/[0.04] to-white dark:from-rose-950/30 dark:to-stone-900 border border-stone-200/90 dark:border-stone-700/80 hover:border-rose-500/50 hover:shadow-[0_8px_25px_rgba(244,63,94,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      ICAR Validated
                    </span>
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors flex items-center gap-1">
                  <span>{isHi ? "फसल रोग व पत्ती जांच (Leaf Diagnosis)" : "Crop Disease & Leaf Diagnosis"}</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                  {isHi
                    ? "पत्ती की फोटो स्कैन करें — 40+ रोगों की पहचान व प्रमाणित उपचार खुराक।"
                    : "AI leaf camera scan with instant pathogen diagnosis & ICAR dosage guide."}
                </p>

                {/* Micro Sub-Feature Pills */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "पत्ती स्कैन" : "Leaf Scan"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "दवा खुराक" : "Treatment Rx"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-400">
                <span>{isHi ? "पत्ती स्कैन करें →" : "Scan Leaf Now →"}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Card 2: Live Mandi Prices & Mandi Comparison */}
          {(activeTab === "all" || activeTab === "market") && (
            <Link
              href="/mandi"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/[0.04] to-white dark:from-amber-950/30 dark:to-stone-900 border border-stone-200/90 dark:border-stone-700/80 hover:border-amber-500/50 hover:shadow-[0_8px_25px_rgba(245,158,11,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                    ₹
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    AGMARKNET Live
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>{isHi ? "लाइव मंडी भाव व तुलना" : "Live Mandi & Price Comparison"}</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                  {isHi
                    ? "2,500+ सरकारी एपीएमसी मंडियों के मॉडल भाव, एमएसपी और पास की मंडियों की तुलना।"
                    : "Real-time modal rates from 2,500+ APMC mandis, MSP benchmarks & price trends."}
                </p>

                {/* Micro Sub-Feature Pills */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "भाव तुलना" : "Mandi Comparison"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "दैनिक भाव" : "Daily APMC"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <span>{isHi ? "मंडी भाव तुलना →" : "Compare Mandis →"}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Card 3: Weather Intelligence & Spray Advisory */}
          {(activeTab === "all" || activeTab === "agronomy") && (
            <Link
              href="/weather"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/[0.04] to-white dark:from-sky-950/30 dark:to-stone-900 border border-stone-200/90 dark:border-stone-700/80 hover:border-sky-500/50 hover:shadow-[0_8px_25px_rgba(14,165,233,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-700 dark:text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                    <CloudSun className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
                    IMD Verified
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1">
                  <span>{isHi ? "मौसम व स्प्रे विंडो (Spray Advisory)" : "Weather & Spray Advisory"}</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                  {isHi
                    ? "घंटेवार बारिश अलर्ट और कीटनाशक छिड़काव का सबसे सुरक्षित समय।"
                    : "Hyperlocal precipitation alerts and agronomic spray window calculation."}
                </p>

                {/* Micro Sub-Feature Pills */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold">
                    {isHi ? "स्प्रे विंडो" : "Spray Window"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "7-दिवसीय मौसम" : "7-Day Radar"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-sky-700 dark:text-sky-400">
                <span>{isHi ? "स्प्रे समय देखें →" : "Check Spray Time →"}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Card 4: Agricultural Labour (AgriLabour Connect) */}
          {(activeTab === "all" || activeTab === "market") && (
            <Link
              href="/worker-connect"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/[0.04] to-white dark:from-indigo-950/30 dark:to-stone-900 border border-stone-200/90 dark:border-stone-700/80 hover:border-indigo-500/50 hover:shadow-[0_8px_25px_rgba(99,102,241,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                    Direct Hire
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <span>{isHi ? "कृषि मजदूर सेवा (AgriLabour)" : "Agricultural Labour (AgriLabour)"}</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                  {isHi
                    ? "सत्यापित कटाई गैंग, ट्रैक्टर ड्राइवर व दैनिक मजदूर बिना किसी दलाली खोजें।"
                    : "Hire verified harvesting gangs, tractor operators & daily agricultural workers."}
                </p>

                {/* Micro Sub-Feature Pills */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "कटाई गैंग" : "Harvest Gangs"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "0% कमीशन" : "Zero Middleman"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                <span>{isHi ? "मजदूर खोजें →" : "Hire Workers →"}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Card 5: Farm Marketplace */}
          {(activeTab === "all" || activeTab === "market") && (
            <Link
              href="/marketplace"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.04] to-white dark:from-emerald-950/30 dark:to-stone-900 border border-stone-200/90 dark:border-stone-700/80 hover:border-emerald-500/50 hover:shadow-[0_8px_25px_rgba(16,185,129,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Tractor className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                    Real Sellers
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>{isHi ? "कृषि यंत्र बाजार (Farm Marketplace)" : "Farm Marketplace"}</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                  {isHi
                    ? "सत्यापित किसानों से ट्रैक्टर, हार्वेस्टर व उपकरण सीधे खरीदें या किराए पर लें।"
                    : "Buy, sell & rent verified tractors, implements & farm machinery."}
                </p>

                {/* Micro Sub-Feature Pills */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "ट्रैक्टर / उपकरण" : "Tractors & Gear"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "किराया / खरीद" : "Rent & Buy"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                <span>{isHi ? "उपकरण देखें →" : "Browse Gear →"}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Card 6: Government Schemes & Subsidies */}
          {(activeTab === "all" || activeTab === "agronomy" || activeTab === "market") && (
            <Link
              href="/schemes"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/[0.04] to-white dark:from-purple-950/30 dark:to-stone-900 border border-stone-200/90 dark:border-stone-700/80 hover:border-purple-500/50 hover:shadow-[0_8px_25px_rgba(168,85,247,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                    DBT Direct
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1">
                  <span>{isHi ? "सरकारी योजनाएं व सब्सिडी" : "Government Schemes"}</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                  {isHi
                    ? "पीएम-किसान, पीएमएफबीवाई फसल बीमा व कृषि अनुदान पात्रता की जांच करें।"
                    : "PM-Kisan, PMFBY crop insurance, solar pump subsidies & DBT eligibility."}
                </p>

                {/* Micro Sub-Feature Pills */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "पीएम-किसान" : "PM-Kisan"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    {isHi ? "फसल बीमा" : "PMFBY Insurance"}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-400">
                <span>{isHi ? "पात्रता जांचें →" : "Check Eligibility →"}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. PRECISION AGRONOMY TRIAD: SOIL, CROP PREDICTOR, KNOWLEDGE
            (Sleek 3-column micro-bento row showing authentic depth)
        ───────────────────────────────────────────────────────────── */}
        {(activeTab === "all" || activeTab === "agronomy") && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 7. Soil Intelligence */}
            <Link
              href="/soil-health"
              className="group relative flex flex-col justify-between p-3 rounded-2xl bg-[#FBFDF9] dark:bg-stone-800/60 border border-stone-200/90 dark:border-stone-700/80 hover:border-teal-500/50 hover:shadow-[0_8px_20px_rgba(20,184,166,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <FlaskConical className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Soil Card
                  </span>
                </div>
                <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {isHi ? "मृदा स्वास्थ्य (Soil)" : "Soil Intelligence"}
                </h5>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                  {isHi ? "संतुलित NPK मात्रा व मृदा कार्ड विश्लेषण" : "Scientific NPK dosage & soil health card"}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-[10px] font-bold text-teal-700 dark:text-teal-400">
                <span>{isHi ? "NPK गणना →" : "Calculate NPK →"}</span>
                <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* 8. Crop Recommendations */}
            <Link
              href="/crop-predictor"
              className="group relative flex flex-col justify-between p-3 rounded-2xl bg-[#FBFDF9] dark:bg-stone-800/60 border border-stone-200/90 dark:border-stone-700/80 hover:border-emerald-500/50 hover:shadow-[0_8px_20px_rgba(34,197,94,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Sprout className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Precision Yield
                  </span>
                </div>
                <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {isHi ? "फसल चयन सलाह" : "Crop Predictor"}
                </h5>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                  {isHi ? "मौसम व मिट्टी अनुसार अधिकतम पैदावार फसल" : "Data-driven high-yield crop selection"}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                <span>{isHi ? "फसल चुनें →" : "Predict Crop →"}</span>
                <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* 9. Farming Knowledge & Satellite Radar */}
            <Link
              href="/crops"
              className="group relative flex flex-col justify-between p-3 rounded-2xl bg-[#FBFDF9] dark:bg-stone-800/60 border border-stone-200/90 dark:border-stone-700/80 hover:border-cyan-500/50 hover:shadow-[0_8px_20px_rgba(6,182,212,0.12)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                    NDVI Radar
                  </span>
                </div>
                <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                  {isHi ? "खेत ज्ञान व उपग्रह रडार" : "Farming Knowledge"}
                </h5>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                  {isHi ? "फसल गाइड, खेत डायरी व उपग्रह स्वास्थ्य मॉनिटर" : "Crop library, logs & satellite NDVI radar"}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
                <span>{isHi ? "खेत ज्ञान देखें →" : "View Field →"}</span>
                <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. AUTHENTIC PROVENANCE & ECOSYSTEM ASSURANCE FOOTER
        ───────────────────────────────────────────────────────────── */}
        <div className="pt-2 px-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {isHi ? "100% सत्यापित भारतीय कृषि मंच" : "100% Authentic Indian Agritech Platform"}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
            AGMARKNET • IMD • ICAR • DBT
          </span>
        </div>
      </div>
    </div>
  );
}
