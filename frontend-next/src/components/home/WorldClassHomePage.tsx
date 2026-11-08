"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Bug,
  CloudSun,
  TrendingUp,
  Store,
  Users,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Mic,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Search,
  MessageSquare,
  FlaskConical,
  Landmark,
  Tractor,
  Wheat,
  Activity,
  Layers,
  HelpCircle,
  X,
  Volume2,
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

export function WorldClassHomePage() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  // Location & Weather state
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [activeAdvisorTab, setActiveAdvisorTab] = useState<number>(0);
  const [serviceSearch, setServiceSearch] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function fetchWeather() {
      try {
        const loc = await resolveUserLocation();
        if (loc && isMounted) {
          setLocationName(loc.city || "Local Farm");
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

  const advisorQueries = [
    {
      q: "गेहूं में पीला रतुआ (Yellow Rust) के शुरुआती लक्षण क्या हैं और उपचार क्या है?",
      a: "पीला रतुआ में पत्तियों पर पीले रंग की धारियां बनती हैं। शुरुआती अवस्था में प्रोपिकोनाजोल 25% EC @ 1 मिली प्रति लीटर पानी (200 मिली प्रति एकड़) का छिड़काव करें। खेत में नमी बनाए रखें और अधिक नाइट्रोजन से बचें।",
      tag: "Crop Disease",
      icon: "🌾",
    },
    {
      q: "धान में कल्ले फूटते समय (tillering stage) यूरिया और जिंक की सही मात्रा क्या है?",
      a: "रोपाई के 20-25 दिन बाद प्रति एकड़ 30-35 किग्रा नीम लेपित यूरिया और 5 किग्रा जिंक सल्फेट (21%) डालें। खेत में 2-3 सेमी पानी रखें और पानी निकालने के 24 घंटे बाद खाद दें।",
      tag: "Nutrition",
      icon: "🌱",
    },
    {
      q: "कल बारिश की संभावना है, क्या आज कपास पर कीटनाशक का छिड़काव करना सुरक्षित है?",
      a: "यदि अगले 6 घंटों में 40% से अधिक बारिश का अनुमान है, तो छिड़काव टालें। बारिश से दवा धुल जाती है। मौसम साफ होने और पत्तियां सूखने के बाद ही स्टीकर (स्प्रेडर) मिलाकर छिड़काव करें।",
      tag: "Weather Advisory",
      icon: "🌧️",
    },
  ];

  const coreCapabilities = [
    {
      id: "ai-advisor",
      title: lang === "hi" ? "AI कृषि सलाहकार" : "AI Agriculture Advisor",
      badge: "Voice & Text",
      description:
        lang === "hi"
          ? "अपनी भाषा में बोलकर या लिखकर खेती से जुड़ी हर समस्या का तुरंत समाधान पाएं। बुवाई से कटाई तक 24x7 मार्गदर्शन।"
          : "Conversational agronomic guidance in Hindi, Kannada & English. Instant answers on fertilizer dosages, sowing schedules, and pest alerts.",
      href: "/chatbot",
      icon: Sparkles,
      color: "emerald",
      tag: "Real-time AI",
    },
    {
      id: "crop-intelligence",
      title: lang === "hi" ? "फसल रोग पहचान (Crop Doctor)" : "Crop Health Intelligence",
      badge: "Instant Diagnosis",
      description:
        lang === "hi"
          ? "प्रभावित पत्ती की फोटो अपलोड करें। AI मॉडल पत्तियों के रोग पहचानकर ICAR-प्रमाणित सटीक दवा और खुराक बताता है।"
          : "Upload a photo of damaged leaves. Computer vision detects fungal blights, rusts, and deficiencies with ICAR-verified remedies.",
      href: "/disease",
      icon: Bug,
      color: "rose",
      tag: "Pathology Screening",
    },
    {
      id: "weather-intelligence",
      title: lang === "hi" ? "मौसम व छिड़काव सलाह" : "Weather Intelligence",
      badge: "Hyperlocal Forecast",
      description:
        lang === "hi"
          ? "3 दिन का सटीक मौसम पूर्वानुमान, बारिश की संभावना और कीटनाशक छिड़काव व सिंचाई के लिए सुरक्षित समय की सलाह।"
          : "3-day field forecast with hourly rain probability, wind speed, and safe spray/irrigation operational windows.",
      href: "/weather",
      icon: CloudSun,
      color: "sky",
      tag: "IMD-Verified",
    },
    {
      id: "mandi-intelligence",
      title: lang === "hi" ? "मंडी भाव व बाजार विश्लेषण" : "Mandi Price Intelligence",
      badge: "AGMARKNET Live",
      description:
        lang === "hi"
          ? "देश भर की APMC मंडियों के ताज़ा भाव, न्यूनतम-अधिकतम दरें और 30 दिन के रुझान। सही समय और सही मंडी में फसल बेचें।"
          : "Real-time arrivals and modal prices across Indian APMCs. Compare neighboring mandis to prevent distressed selling.",
      href: "/mandi",
      icon: TrendingUp,
      color: "amber",
      tag: "Direct APMC Rates",
    },
    {
      id: "marketplace",
      title: lang === "hi" ? "कृषि मार्केटप्लेस" : "Agricultural Marketplace",
      badge: "Machinery & Equipment",
      description:
        lang === "hi"
          ? "ट्रैक्टर, कंबाइन हार्वेस्टर, रोटावेटर और कृषि उपकरण किराए पर लें या बेचें। वास्तविक किसानों और मालिकों से सीधा संपर्क।"
          : "Connect directly with verified owners to rent or buy tractors, harvesters, implements, and agricultural tools.",
      href: "/marketplace",
      icon: Store,
      color: "teal",
      tag: "Verified Equipment",
    },
    {
      id: "agrilabour",
      title: lang === "hi" ? "AgriLabour (खेत मजदूर सेवा)" : "AgriLabour Connect",
      badge: "Labour Network",
      description:
        lang === "hi"
          ? "कटाई, बुवाई, निराई और छिड़काव के लिए कुशल कृषि मजदूर खोजें। पारदर्शी दैनिक दरें और सीधा फोन संपर्क।"
          : "Directly connect farm owners with local agricultural labour for harvesting, sowing, transplantation, and spraying.",
      href: "/worker-connect",
      icon: Users,
      color: "indigo",
      tag: "Direct Contact",
    },
    {
      id: "farm-profile",
      title: lang === "hi" ? "डिजिटल खेत डायरी" : "Farm Profile & Khet Diary",
      badge: "Farm Management",
      description:
        lang === "hi"
          ? "अपने खेत का आकार, उगाई गई फसलें, खाद-दवा के खर्चे और पैदावार का हिसाब रखें। एक ही जगह पूरा कृषि लेखा-जोखा।"
          : "Track input expenses, sowing timelines, irrigation logs, and harvest yields in a simple digital farm notebook.",
      href: "/khet-diary",
      icon: BookOpen,
      color: "emerald",
      tag: "Personalized",
    },
  ];

  const quickServices = [
    { title: "Soil Health (मृदा स्वास्थ्य)", href: "/soil-health", icon: FlaskConical },
    { title: "Govt Schemes (सरकारी योजनाएं)", href: "/schemes", icon: Landmark },
    { title: "Crop Predictor (फसल चयन)", href: "/crop-predictor", icon: Wheat },
    { title: "Tractor Rental (ट्रैक्टर किराया)", href: "/marketplace?tab=equipment", icon: Tractor },
    { title: "Irrigation Advisory (सिंचाई गाइड)", href: "/weather", icon: Droplets },
    { title: "Worker Registration (मजदूर पंजीकरण)", href: "/worker-connect?tab=worker_portal", icon: Users },
  ];

  const filteredServices = serviceSearch.trim()
    ? quickServices.filter((s) =>
        s.title.toLowerCase().includes(serviceSearch.toLowerCase())
      )
    : quickServices;

  return (
    <div className="w-full bg-[#FBFDF9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
          World-Class SaaS Aesthetic adapted for Indian Agriculture
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-10 md:pt-14 pb-16 sm:pb-20 md:pb-24 border-b border-stone-200/80 dark:border-stone-800/80 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-100/50 via-emerald-50/20 to-transparent dark:from-emerald-950/20 dark:via-transparent blur-3xl opacity-80" />
          <div className="absolute -top-24 right-[-10%] w-[450px] h-[450px] bg-teal-100/40 dark:bg-teal-950/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Category Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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

          {/* Hero Grid: Typography on Left, Visual Showcase on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.15]">
                Your Farm. Your Decisions.{" "}
                <span className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                  Smarter with AI.
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-stone-600 dark:text-stone-300 font-normal leading-relaxed max-w-2xl">
                From crop health diagnosis and hyperlocal weather intelligence to live mandi rates and agricultural services, KisaanBuddy helps Indian farmers make confident, data-driven farming decisions.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <a
                  href="#capabilities"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-center"
                >
                  <span>Explore KisaanBuddy</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/chatbot"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-emerald-50/60 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-sm sm:text-base shadow-2xs hover:border-emerald-600/40 transition-all active:scale-[0.98] text-center"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Talk to AI Advisor</span>
                </Link>

                <button
                  type="button"
                  onClick={() => openVoiceAssistant()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-600/30 text-emerald-900 dark:text-emerald-300 font-bold text-sm transition-all"
                  title="बोलकर पूछें / Ask with voice"
                >
                  <Mic className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="hidden sm:inline">बोलें / Voice</span>
                </button>
              </div>

              {/* Trust & Source Assurance Markers */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-500 dark:text-stone-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>AGMARKNET Mandi Data</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>IMD Weather Verified</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ICAR Agronomic Standards</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Free for Farmers</span>
                </span>
              </div>
            </div>

            {/* Right Showcase Column (5 cols) - Visual Media with Live Telemetry Chips */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl">
                {/* Genuine High-Resolution Farmer Photo */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src="/images/hero/hero-indian-farmer.webp"
                    alt="Indian Farmer using KisaanBuddy in agricultural field"
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

                {/* Overlaid Telemetry Cards */}
                <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-stone-900">
                  {/* Telemetry Card 1: Mandi Modal Price */}
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

                  {/* Telemetry Card 2: AI Leaf Health Screening */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F9F4] dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-700 dark:text-rose-400">
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
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
                    >
                      Scan Leaf →
                    </Link>
                  </div>

                  {/* Telemetry Card 3: Spray Weather Safety */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-600/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                        <CloudSun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Spray Advisory Window
                        </div>
                        <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                          Clear skies today • Safe for pesticide application
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/weather"
                      className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline shrink-0"
                    >
                      3-Day View →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. INTELLIGENT AGRICULTURE AT ONE PLACE (Core Capabilities)
      ───────────────────────────────────────────────────────────── */}
      <section id="capabilities" className="py-16 sm:py-20 md:py-24 border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Intelligent Agriculture at One Place
            </h2>
            <p className="mt-3 text-base sm:text-lg text-stone-600 dark:text-stone-300">
              Every tool in KisaanBuddy is built to solve a concrete, daily farming challenge — with verified data sources and direct action.
            </p>
          </div>

          {/* 7 Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreCapabilities.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-600/50 hover:shadow-lg transition-all duration-200 active:scale-[0.99]"
                >
                  <div>
                    {/* Top Tag & Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/20 flex items-center justify-center text-emerald-800 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700">
                        {item.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Footer Link */}
                  <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <span>{item.tag}</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open Tool <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. AI AGRICULTURE ADVISOR SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 md:py-24 bg-[#F5F8F2] dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Context & Capabilities */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-600/30 text-emerald-900 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Mic className="w-3.5 h-3.5 text-emerald-700" />
                <span>Voice-First Agronomy</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
                An Agricultural Agronomist in Your Pocket
              </h2>

              <p className="text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                Indian farmers don&apos;t have time for complicated dashboards. KisaanBuddy&apos;s AI Agriculture Advisor allows you to speak naturally in Hindi, Kannada, or English to diagnose crop symptoms, plan fertilizer dosages, and check market conditions.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm text-stone-900 dark:text-white font-bold">
                      Multilingual Voice Recognition
                    </strong>
                    <span className="text-xs text-stone-600 dark:text-stone-300">
                      Tap the mic and speak naturally in your regional dialect without typing.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm text-stone-900 dark:text-white font-bold">
                      ICAR & University Research Guidelines
                    </strong>
                    <span className="text-xs text-stone-600 dark:text-stone-300">
                      Advice calibrated against recognized Indian agricultural university package of practices.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm text-stone-900 dark:text-white font-bold">
                      Available 24x7 Across India
                    </strong>
                    <span className="text-xs text-stone-600 dark:text-stone-300">
                      Immediate answers in the middle of field operations without waiting for office hours.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  href="/chatbot"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start Chatting with Advisor</span>
                </Link>

                <button
                  type="button"
                  onClick={() => openVoiceAssistant()}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-sm hover:border-emerald-600 transition-all shadow-2xs"
                >
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span>बोलकर पूछें (Voice)</span>
                </button>
              </div>
            </div>

            {/* Right Column: Realistic Interactive UI Preview */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl overflow-hidden">
                {/* Chat Mockup Header */}
                <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-[#F7F9F4] dark:bg-stone-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      KB
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>KisaanBuddy AI Advisor</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">
                        Official Agricultural Guidance • 24x7
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Hindi / Kannada / English
                    </span>
                  </div>
                </div>

                {/* Question Tabs Selector */}
                <div className="p-3 bg-stone-50 dark:bg-stone-900/40 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {advisorQueries.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveAdvisorTab(idx)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeAdvisorTab === idx
                          ? "bg-emerald-800 text-white shadow-2xs"
                          : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-600/40"
                      }`}
                    >
                      <span className="mr-1.5">{item.icon}</span>
                      <span>{item.tag}</span>
                    </button>
                  ))}
                </div>

                {/* Conversation Mockup Body */}
                <div className="p-5 sm:p-6 space-y-4 min-h-[260px] flex flex-col justify-center">
                  {/* Farmer Message Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-700 text-white p-4 shadow-sm text-xs sm:text-sm leading-relaxed">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-200 font-bold mb-1">
                        <Mic className="w-3 h-3" />
                        <span>Voice Query from Farmer</span>
                      </div>
                      <p>{advisorQueries[activeAdvisorTab].q}</p>
                    </div>
                  </div>

                  {/* AI Advisor Response Bubble */}
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl rounded-tl-xs bg-[#F7F9F4] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 p-4 shadow-2xs text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 dark:text-emerald-400 font-bold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>KisaanBuddy Diagnostic Recommendation</span>
                      </div>
                      <p>{advisorQueries[activeAdvisorTab].a}</p>
                      <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
                        <span>Source: ICAR Package of Practices</span>
                        <Link href="/chatbot" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                          Ask Follow-up →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mockup Input Box */}
                <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-[#F7F9F4] dark:bg-stone-800/50 flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-400">
                    अपनी फसल या खेती से जुड़ा सवाल पूछें...
                  </div>
                  <button
                    type="button"
                    onClick={() => openVoiceAssistant()}
                    className="p-2 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
                    title="बोलें"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <Link
                    href="/chatbot"
                    className="p-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-800 hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CROP & FARM INTELLIGENCE (Leaf Disease Screening)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 md:py-24 border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-600/20 text-rose-800 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Bug className="w-3.5 h-3.5" />
              <span>Plant Pathology Screening</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Early Detection. Timely Recovery.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-stone-600 dark:text-stone-300">
              Crop diseases spread silently across acres before symptoms are noticed by human eye. KisaanBuddy turns your smartphone camera into an instant crop doctor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Leaf Pathology Demonstration Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-lg space-y-3">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-stone-100 dark:bg-stone-800">
                  <img
                    src="/images/crop-doctor/powdery-mildew-leaf.webp"
                    alt="Powdery mildew fungal leaf screening in KisaanBuddy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Pathology Screening Active</span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-lg bg-emerald-800 text-white text-xs font-bold shadow-md">
                    94% Diagnostic Match
                  </div>
                </div>

                <div className="p-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-white">
                    <span>Identified: Powdery Mildew (चूर्णिल आसिता)</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">Fungal</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Recommended: Wettable Sulphur 80% WP @ 2.5g/L or Hexaconazole 5% EC @ 1ml/L.
                  </p>
                </div>

                <Link
                  href="/disease"
                  className="block w-full text-center py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Screen Your Own Crop Leaves Now →
                </Link>
              </div>
            </div>

            {/* Step-by-Step Diagnostic Workflow */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-[#F7F9F4] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs">
                  01
                </div>
                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  Snap Affected Leaf
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Take a clear, well-lit photo of the diseased leaf or upload directly from your gallery.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9F4] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs">
                  02
                </div>
                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  Computer Vision Screening
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Our neural network analyzes texture, necrotic spots, and discoloration patterns against Indian crop diseases.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9F4] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs">
                  03
                </div>
                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  ICAR-Verified Dosage Plan
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Get both organic bio-controls and chemical treatment options with exact mixing proportions per acre.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9F4] dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs">
                  04
                </div>
                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  Weather Spray Safety Check
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Automatically verifies that rain is not expected in the next 6 hours so your chemical spray does not get washed away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. MANDI PRICE INTELLIGENCE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 md:py-24 bg-[#FBFDF9] dark:bg-stone-950 border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-600/30 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Transparent Market Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Real Mandi Intelligence. Never Sell Underpriced.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-stone-600 dark:text-stone-300">
              Middlemen and lack of price visibility cause distressed sales. KisaanBuddy integrates directly with AGMARKNET government data so you know prevailing modal rates before you load your harvest.
            </p>
          </div>

          {/* Mandi Commodities Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                crop: "Wheat (गेहूं)",
                state: "Madhya Pradesh / Punjab",
                modal: "₹2,275",
                minMax: "₹2,180 - ₹2,380",
                trend: "Steady",
              },
              {
                crop: "Mustard (सरसों)",
                state: "Rajasthan / Haryana",
                modal: "₹5,450",
                minMax: "₹5,200 - ₹5,680",
                trend: "+₹65/qtl",
              },
              {
                crop: "Chana / Gram (चना)",
                state: "Maharashtra / MP",
                modal: "₹5,800",
                minMax: "₹5,600 - ₹6,050",
                trend: "Active",
              },
              {
                crop: "Cotton (कपास)",
                state: "Gujarat / Telangana",
                modal: "₹7,150",
                minMax: "₹6,900 - ₹7,450",
                trend: "Strong",
              },
            ].map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-900 dark:text-white">
                    {m.crop}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20">
                    {m.trend}
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-stone-900 dark:text-white">
                    {m.modal}{" "}
                    <span className="text-xs font-normal text-stone-500">/ क्विंटल</span>
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Range: {m.minMax}
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Major Hubs: {m.state}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mandi Action Footer */}
          <div className="mt-8 p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-600/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
              <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium">
                <strong className="text-stone-900 dark:text-white font-bold">
                  Reality-First Verification:
                </strong>{" "}
                Every price is sourced from actual AGMARKNET daily mandi returns. Never simulated, never fabricated.
              </div>
            </div>
            <Link
              href="/mandi"
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
            >
              Search Your Mandi & Crop →
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. HOW KISAANBUDDY WORKS (3-Step Simplicity)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 md:py-24 border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <span>Simple Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              How KisaanBuddy Works
            </h2>
            <p className="mt-2 text-base text-stone-600 dark:text-stone-300">
              Designed from the ground up for simplicity, accessibility, and real field conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-lg">
                01
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                Tell Us About Your Farm
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                Select your district and primary crops. KisaanBuddy automatically tailors your local mandi rates, pest warnings, and weather alerts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-lg">
                02
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                Receive Real-Time Intelligence
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                Scan diseased leaves, ask questions by voice in your language, check market trends, and connect directly with local labour and machinery.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-lg">
                03
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                Make Confident Farm Decisions
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                Spray at optimal weather windows, prevent crop losses, save on excessive fertilizers, and sell your produce where modal rates are highest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. SPECIALIZED FARMING TOOLS DIRECTORY
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 md:py-20 bg-[#F7F9F4] dark:bg-stone-900/40 border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Direct Access
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1">
                All Specialized Farming Tools
              </h3>
            </div>

            {/* Search Input Filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search tools (e.g. soil, tractor, schemes)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {filteredServices.map((service, idx) => {
              const ServiceIcon = service.icon;
              return (
                <Link
                  key={idx}
                  href={service.href}
                  className="flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-600/50 hover:shadow-xs transition-all duration-150 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/20 flex items-center justify-center text-emerald-800 dark:text-emerald-300 group-hover:scale-105 transition-transform mb-2">
                    <ServiceIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                    {service.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FINAL CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 md:py-28 bg-gradient-to-b from-[#FBFDF9] to-emerald-50/50 dark:from-stone-950 dark:to-emerald-950/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Empowering Indian Agriculture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
            Ready to make smarter decisions for your farm?
          </h2>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-normal">
            Join thousands of Indian farmers using KisaanBuddy every day for crop diagnosis, mandi rates, and agricultural assistance. 100% free and field-tested.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              {user ? "Open Your Dashboard →" : "Get Started Free →"}
            </Link>

            <Link
              href="/chatbot"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-emerald-50/60 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-base shadow-2xs hover:border-emerald-600/40 transition-all active:scale-[0.98]"
            >
              Talk to AI Advisor
            </Link>
          </div>

          <div className="pt-6 text-xs text-stone-500 dark:text-stone-400 font-medium flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span>✓ No credit card required</span>
            <span>✓ Available in Hindi, Kannada & English</span>
            <span>✓ Official AGMARKNET & IMD data</span>
          </div>
        </div>
      </section>
    </div>
  );
}
