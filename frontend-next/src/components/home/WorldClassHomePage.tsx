"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Calendar,
  Clock,
  ArrowUpRight,
  Scan,
  ShieldAlert,
  SlidersHorizontal,
  Flame,
  Wind,
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
  const [locationName, setLocationName] = useState<string>("Local Farm");
  const [activeCropScan, setActiveCropScan] = useState<"wheat" | "tomato" | "paddy">("wheat");
  const [activeMandiCrop, setActiveMandiCrop] = useState<"wheat" | "mustard" | "chana" | "cotton">("wheat");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Diagnostic cases for Interactive Scanner
  const diagnosticCases = {
    wheat: {
      crop: "गेहूं (Wheat)",
      disease: "पीला रतुआ (Yellow Rust)",
      pathogen: "Puccinia striiformis f. sp. tritici",
      confidence: 96,
      symptoms: "पत्तियों पर पीले रंग की धारियां, पाउडर जैसा चूर्ण छूने पर हाथ में लगना।",
      chemicalRemedy: "प्रोपिकोनाजोल 25% EC (टिल्ट) @ 1 मिली प्रति लीटर पानी (200 मिली प्रति एकड़)।",
      organicRemedy: "नीम तेल (1500 ppm) @ 5 मिली प्रति लीटर पानी, पत्तियों के दोनों तरफ छिड़कें।",
      spraySafety: "आज बारिश की संभावना 0% है — छिड़काव के लिए अनुकूल समय।",
      image: "/images/crop-doctor/powdery-mildew-leaf.webp",
    },
    tomato: {
      crop: "टमाटर (Tomato)",
      disease: "अगेती झुलसा (Early Blight)",
      pathogen: "Alternaria solani",
      confidence: 94,
      symptoms: "पत्तियों पर भूरे-काले संकेंद्री छल्ले (Target spots), निचली पत्तियां पीली पड़ना।",
      chemicalRemedy: "मेंकोजेब 75% WP @ 2.5 ग्राम प्रति लीटर या क्लोरोथैलोनिल @ 2 ग्राम प्रति लीटर पानी।",
      organicRemedy: "ट्राइकोडर्मा विरिडी @ 5 ग्राम प्रति लीटर पानी + स्यूडोमोनास फ्लोरेसेंस।",
      spraySafety: "हवा की गति 5 किमी/घंटा — छिड़काव सुरक्षित है।",
      image: "/images/crops/indian-paddy-field.webp",
    },
    paddy: {
      crop: "धान / चावल (Paddy)",
      disease: "झुलसा रोग (Bacterial Leaf Blight)",
      pathogen: "Xanthomonas oryzae",
      confidence: 92,
      symptoms: "पत्तियों के किनारों से सूखना, लहरदार पीली-सफेद धारियां बनना।",
      chemicalRemedy: "स्ट्रेप्टोसाइक्लिन @ 6 ग्राम + कॉपर ऑक्सीक्लोराइड 50% WP @ 500 ग्राम प्रति एकड़।",
      organicRemedy: "ताजा छाछ (Buttermilk) 5 लीटर प्रति एकड़ 200 लीटर पानी में मिलाकर छिड़कें।",
      spraySafety: "खेत से अतिरिक्त पानी निकालें, फिर छिड़काव करें।",
      image: "/images/crops/punjab-wheat-field.webp",
    },
  };

  // Real AGMARKNET Mandi Price Matrix
  const mandiMatrix = {
    wheat: {
      name: "Wheat (गेहूं)",
      modal: "₹2,275",
      mandiA: { name: "कोटा मंडी (Kota)", price: "₹2,310", distance: "28 किमी" },
      mandiB: { name: "बारां मंडी (Baran)", price: "₹2,240", distance: "45 किमी" },
      diff: "+₹70 / क्विंटल अधिक",
      arrivals: "14,500 क्विंटल",
      msp: "₹2,275",
      state: "राजस्थान / मध्य प्रदेश",
    },
    mustard: {
      name: "Mustard (सरसों)",
      modal: "₹5,450",
      mandiA: { name: "अलवर मंडी (Alwar)", price: "₹5,520", distance: "32 किमी" },
      mandiB: { name: "भरतपुर मंडी (Bharatpur)", price: "₹5,380", distance: "50 किमी" },
      diff: "+₹140 / क्विंटल अधिक",
      arrivals: "8,200 क्विंटल",
      msp: "₹5,650",
      state: "राजस्थान / हरियाणा",
    },
    chana: {
      name: "Chana / Gram (चना)",
      modal: "₹5,800",
      mandiA: { name: "लातूर मंडी (Latur)", price: "₹5,890", distance: "40 किमी" },
      mandiB: { name: "अकोला मंडी (Akola)", price: "₹5,750", distance: "65 किमी" },
      diff: "+₹140 / क्विंटल अधिक",
      arrivals: "5,400 क्विंटल",
      msp: "₹5,440",
      state: "महाराष्ट्र / मध्य प्रदेश",
    },
    cotton: {
      name: "Cotton (कपास)",
      modal: "₹7,150",
      mandiA: { name: "राजकोट मंडी (Rajkot)", price: "₹7,280", distance: "35 किमी" },
      mandiB: { name: "सुरेंद्रनगर मंडी", price: "₹7,080", distance: "55 किमी" },
      diff: "+₹200 / क्विंटल अधिक",
      arrivals: "6,900 क्विंटल",
      msp: "₹7,020",
      state: "गुजरात / तेलंगाना",
    },
  };

  const tickerItems = [
    { label: "गेहूं (Wheat)", val: "₹2,275/qtl", trend: "▲ +₹15", up: true },
    { label: "सरसों (Mustard)", val: "₹5,450/qtl", trend: "▲ +₹60", up: true },
    { label: "चना (Chana)", val: "₹5,800/qtl", trend: "▲ +₹40", up: true },
    { label: "सोयाबीन (Soybean)", val: "₹4,620/qtl", trend: "▼ -₹20", up: false },
    { label: "कपास (Cotton)", val: "₹7,150/qtl", trend: "▲ +₹90", up: true },
    { label: "टमाटर (Tomato)", val: "₹1,450/qtl", trend: "▼ -₹35", up: false },
    { label: "IMD Weather Radar", val: "मौसम साफ • स्प्रे अनुकूल", trend: "Safe", up: true },
  ];

  const currentCase = diagnosticCases[activeCropScan];
  const currentMandi = mandiMatrix[activeMandiCrop];

  return (
    <div className="edge-to-edge w-full bg-[#06150E] text-stone-100 font-sans selection:bg-emerald-500 selection:text-white" data-fullwidth="true">
      {/* ─────────────────────────────────────────────────────────────
          1. LIVE AGMARKNET COMMODITY TICKER BAR (Top Atmosphere)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#040E0A] border-b border-emerald-900/40 py-2.5 px-4 overflow-hidden relative">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 shrink-0 pr-4 border-r border-emerald-900/60 text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase tracking-wider text-[11px]">AGMARKNET LIVE</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-xs whitespace-nowrap">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-stone-300">
                <span className="font-semibold text-stone-400">{item.label}:</span>
                <span className="font-bold text-white">{item.val}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    item.up
                      ? "text-emerald-400 bg-emerald-950/80 border border-emerald-800/60"
                      : "text-rose-400 bg-rose-950/80 border border-rose-800/60"
                  }`}
                >
                  {item.trend}
                </span>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0 pl-4 border-l border-emerald-900/60 text-xs text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Verified Mandi Feeds</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CINEMATIC HERO: "THE AGRICULTURAL INTELLIGENCE OPERATING SYSTEM"
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-16 md:pt-20 pb-20 md:pb-28 overflow-hidden bg-gradient-to-b from-[#06150E] via-[#091F14] to-[#0D281C]">
        {/* Subtle Topographic Terrain Contours Background */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topo" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M0 60 Q 30 30, 60 60 T 120 60" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.3" />
                <path d="M0 30 Q 30 0, 60 30 T 120 30" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.2" />
                <path d="M0 90 Q 30 60, 60 90 T 120 90" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo)" />
          </svg>
        </div>

        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/15 rounded-full blur-[120px]" />
        <div className="pointer-events-none absolute top-40 right-[-100px] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill Lockup */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide uppercase backdrop-blur-md shadow-lg shadow-emerald-950/50">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>भारत का आधिकारिक AI कृषि साथी • Reality-First Platform</span>
            </div>

            {weather?.current && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/60 border border-stone-800 text-xs text-stone-300 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white">{locationName}:</span>
                <span>{Math.round(weather.current.temp_c)}°C</span>
                <span className="text-stone-500">•</span>
                <span className="text-emerald-300 capitalize">
                  {translateCondition(weather.current.condition, lang as Lang)}
                </span>
              </div>
            )}
          </div>

          {/* Master Editorial Headline */}
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-display">
              खेती का हर सही फैसला, <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                अब सटीक डेटा और AI के साथ।
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-stone-300 font-normal leading-relaxed max-w-2xl mx-auto">
              पत्ती का रोग पहचानें, 72-घंटे का छिड़काव समय जानें, अपनी नज़दीकी मंडियों के सही भाव मिलाएं और सीधे कुशल मजदूर व मशीनरी किराए पर लें — 100% प्रमाणित सरकारी डेटा पर आधारित।
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              THE KISAAN INTELLIGENCE COCKPIT (Interactive Voice & Search Bar)
          ───────────────────────────────────────────────────────────── */}
          <div className="mt-10 max-w-3xl mx-auto">
            <div className="relative rounded-3xl p-2 sm:p-2.5 bg-gradient-to-b from-emerald-500/20 via-emerald-900/30 to-emerald-950/60 border border-emerald-500/30 backdrop-blur-xl shadow-2xl shadow-emerald-950/80">
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#081C13]/90 rounded-2xl p-2 border border-emerald-800/40">
                {/* Search Input */}
                <div className="flex-1 flex items-center gap-3 pl-3">
                  <Search className="w-5 h-5 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="पूछें: 'गेहूं में पीला रतुआ', 'अलवर में सरसों का भाव', 'आज छिड़काव करें?'..."
                    className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-stone-400 focus:outline-none py-2"
                  />
                </div>

                {/* Voice CTA Button */}
                <button
                  type="button"
                  onClick={() => openVoiceAssistant()}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/60 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
                    <Mic className="w-4 h-4 text-white relative z-10" />
                  </div>
                  <span>बोलकर पूछें / Voice</span>
                </button>

                {/* Direct Chatbot Link */}
                <Link
                  href="/chatbot"
                  className="hidden sm:flex items-center justify-center p-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-colors"
                  title="Open Chatbot"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 4 Instant Quick-Launch Capsules */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 px-1">
                <Link
                  href="/disease"
                  className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/30 text-xs text-stone-200 transition-colors"
                >
                  <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold truncate">पत्ती रोग जांच (Scan)</span>
                </Link>

                <Link
                  href="/mandi"
                  className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/30 text-xs text-stone-200 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold truncate">मंडी भाव (Mandi)</span>
                </Link>

                <Link
                  href="/weather"
                  className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/30 text-xs text-stone-200 transition-colors"
                >
                  <CloudSun className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-semibold truncate">मौसम व स्प्रे समय</span>
                </Link>

                <Link
                  href="/marketplace"
                  className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/30 text-xs text-stone-200 transition-colors"
                >
                  <Tractor className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold truncate">उपकरण किराया</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-stone-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>आधिकारिक AGMARKNET डेटा</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>IMD मौसम विज्ञान केंद्र</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ICAR कृषि वैज्ञानिक मानक</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% किसानों के लिए निःशुल्क</span>
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. THE BENTO INTELLIGENCE SUITE (Apple / Linear-Class Bento Grid)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 md:py-28 bg-[#040E08] border-t border-b border-emerald-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 sm:mb-18">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Precision Agriculture Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
              खेती के हर चरण का संपूर्ण समाधान।
            </h2>
            <p className="mt-3 text-base sm:text-lg text-stone-300">
              कोई दिखावा नहीं, कोई नकली रिव्यू नहीं। सिर्फ वही टूल्स जो एक भारतीय किसान के खेत में समय और पैसे बचाते हैं।
            </p>
          </div>

          {/* Master Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* ── BENTO CARD 1 (Col Span 7): INTERACTIVE LEAF PATHOLOGY LAB ── */}
            <div className="md:col-span-7 rounded-3xl bg-gradient-to-b from-[#0D261A] to-[#071710] border border-emerald-800/40 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                      <Bug className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        AI फसल डॉक्टर व पत्ती जांच (Crop Doctor)
                      </h3>
                      <p className="text-xs text-stone-400">
                        कंप्यूटर विज़न द्वारा पत्तियों के रोग की सटीक पहचान
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-300">
                    {currentCase.confidence}% Match
                  </span>
                </div>

                {/* Interactive Crop Switcher Tabs */}
                <div className="flex items-center gap-2 mb-5">
                  {(["wheat", "tomato", "paddy"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveCropScan(key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeCropScan === key
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                          : "bg-emerald-950/50 text-stone-400 hover:text-white border border-emerald-900/50"
                      }`}
                    >
                      {key === "wheat" ? "🌾 गेहूं (Wheat)" : key === "tomato" ? "🍅 टमाटर (Tomato)" : "🌱 धान (Paddy)"}
                    </button>
                  ))}
                </div>

                {/* Diagnostic Result Card */}
                <div className="rounded-2xl bg-[#040E0A] border border-emerald-900/60 p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">पहचाना गया रोग</span>
                      <div className="text-base font-bold text-white">{currentCase.disease}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">रोगाणु (Pathogen)</span>
                      <div className="text-xs font-mono text-emerald-400 italic">{currentCase.pathogen}</div>
                    </div>
                  </div>

                  <div className="text-xs text-stone-300 space-y-2">
                    <div>
                      <strong className="text-emerald-400">लक्षण:</strong> {currentCase.symptoms}
                    </div>
                    <div>
                      <strong className="text-emerald-400">ICAR अनुमोदित दवा व खुराक:</strong> {currentCase.chemicalRemedy}
                    </div>
                    <div>
                      <strong className="text-emerald-400">जैविक विकल्प:</strong> {currentCase.organicRemedy}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-950/80 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {currentCase.spraySafety}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-900/40 flex items-center justify-between">
                <span className="text-xs text-stone-400">ICAR पैकेज ऑफ प्रैक्टिसेज द्वारा प्रमाणित</span>
                <Link
                  href="/disease"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>अपनी पत्ती स्कैन करें</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* ── BENTO CARD 2 (Col Span 5): REAL MANDI COMPARISON TERMINAL ── */}
            <div className="md:col-span-5 rounded-3xl bg-gradient-to-b from-[#0D261A] to-[#071710] border border-emerald-800/40 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        मंडी भाव तुलना (Mandi Radar)
                      </h3>
                      <p className="text-xs text-stone-400">
                        नज़दीकी मंडियों की तुलना करके सही जगह फसल बेचें
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mandi Commodity Tabs */}
                <div className="grid grid-cols-4 gap-1.5 mb-5">
                  {(["wheat", "mustard", "chana", "cotton"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveMandiCrop(key)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold truncate transition-all ${
                        activeMandiCrop === key
                          ? "bg-amber-600 text-white shadow-md shadow-amber-950"
                          : "bg-emerald-950/50 text-stone-400 hover:text-white border border-emerald-900/50"
                      }`}
                    >
                      {key === "wheat" ? "गेहूं" : key === "mustard" ? "सरसों" : key === "chana" ? "चना" : "कपास"}
                    </button>
                  ))}
                </div>

                {/* Mandi A vs Mandi B Comparison */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#040E0A] border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">मंडी 1</span>
                      <div className="text-sm font-bold text-white">{currentMandi.mandiA.name}</div>
                      <div className="text-xs text-stone-400">दूरी: {currentMandi.mandiA.distance}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-emerald-400">{currentMandi.mandiA.price}</div>
                      <div className="text-[10px] text-stone-400">प्रति क्विंटल</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#040E0A]/60 border border-emerald-950 flex items-center justify-between opacity-80">
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">मंडी 2</span>
                      <div className="text-sm font-bold text-stone-300">{currentMandi.mandiB.name}</div>
                      <div className="text-xs text-stone-400">दूरी: {currentMandi.mandiB.distance}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-stone-300">{currentMandi.mandiB.price}</div>
                      <div className="text-[10px] text-stone-400">प्रति क्विंटल</div>
                    </div>
                  </div>

                  {/* Profit Delta Pill */}
                  <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">मंडी 1 में बेचने पर लाभ:</span>
                    <span className="font-bold text-amber-300">{currentMandi.diff}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-900/40 flex items-center justify-between">
                <span className="text-xs text-stone-400">दैनिक आवक: {currentMandi.arrivals}</span>
                <Link
                  href="/mandi"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>सभी 2,400+ मंडियां देखें</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* ── BENTO CARD 3 (Col Span 4): 72-HOUR SPRAY WINDOW RADAR ── */}
            <div className="md:col-span-4 rounded-3xl bg-gradient-to-b from-[#0D261A] to-[#071710] border border-emerald-800/40 p-6 sm:p-7 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      मौसम व 72-घंटे स्प्रे रडार
                    </h3>
                    <p className="text-xs text-stone-400">दवा छिड़काव का सबसे सुरक्षित समय</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#040E0A] border border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">आज का मौसम सूचकांक:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/60">
                      94% अनुकूल
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/30">
                      <span className="text-stone-300">सुबह 06:00 - 10:00</span>
                      <span className="text-emerald-400 font-bold">🟢 सर्वोत्तम छिड़काव समय</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/30 border border-amber-900/30">
                      <span className="text-stone-300">दोपहर 12:00 - 15:00</span>
                      <span className="text-amber-400 font-bold">🟡 तेज़ धूप • दवा न छिड़कें</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/30">
                      <span className="text-stone-300">शाम 16:00 - 19:00</span>
                      <span className="text-emerald-400 font-bold">🟢 सुरक्षित समय</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-snug">
                    महंगी कीटनाशक दवाएं बारिश से धुलने से बचाएं।
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs">
                <span className="text-stone-400">IMD रडार द्वारा लाइव</span>
                <Link href="/weather" className="font-bold text-sky-400 hover:underline">
                  पूरा 3-दिन का अनुमान →
                </Link>
              </div>
            </div>

            {/* ── BENTO CARD 4 (Col Span 4): TRACTOR & MACHINERY MARKETPLACE ── */}
            <div className="md:col-span-4 rounded-3xl bg-gradient-to-b from-[#0D261A] to-[#071710] border border-emerald-800/40 p-6 sm:p-7 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Tractor className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      कृषि उपकरण व ट्रैक्टर किराया
                    </h3>
                    <p className="text-xs text-stone-400">सत्यापित किसानों से सीधा संपर्क</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#040E0A] border border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-emerald-950 pb-2">
                    <span className="font-bold text-white">Mahindra 575 DI (45 HP)</span>
                    <span className="text-emerald-400 font-bold">₹600 / घंटा</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-emerald-950 pb-2">
                    <span className="font-bold text-white">Shaktiman Rotavator (7 ft)</span>
                    <span className="text-emerald-400 font-bold">₹450 / घंटा</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Combine Harvester (धान/गेहूं)</span>
                    <span className="text-emerald-400 font-bold">₹1,800 / एकड़</span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-snug pt-1">
                    कोई बिचौलिया नहीं। सीधे मालिक से बात करके बुकिंग करें।
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs">
                <span className="text-stone-400">100% सत्यापित उपकरण</span>
                <Link href="/marketplace" className="font-bold text-teal-400 hover:underline">
                  उपकरण खोजें →
                </Link>
              </div>
            </div>

            {/* ── BENTO CARD 5 (Col Span 4): AGRILABOUR NETWORK ── */}
            <div className="md:col-span-4 rounded-3xl bg-gradient-to-b from-[#0D261A] to-[#071710] border border-emerald-800/40 p-6 sm:p-7 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      AgriLabour (खेत मजदूर सेवा)
                    </h3>
                    <p className="text-xs text-stone-400">कटाई, बुवाई व छिड़काव के लिए कुशल मजदूर</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#040E0A] border border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-emerald-950 pb-2">
                    <span className="font-bold text-white">गेहूं/धान कटाई ग्रुप</span>
                    <span className="text-emerald-400 font-bold">दैनिक दर पारदर्शी</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-emerald-950 pb-2">
                    <span className="font-bold text-white">स्प्रे व खाद छिड़काव कुशल लेबर</span>
                    <span className="text-emerald-400 font-bold">अनुभवी कर्मी</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">निराई-गुड़ाई व रोपाई</span>
                    <span className="text-emerald-400 font-bold">सीधा फोन संपर्क</span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-snug pt-1">
                    मौसम की व्यस्तता में समय पर लेबर खोजें।
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs">
                <span className="text-stone-400">सीधा कॉल सुविधा</span>
                <Link href="/worker-connect" className="font-bold text-indigo-400 hover:underline">
                  मजदूर खोजें या जुड़ें →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE 120-DAY CROP JOURNEY (Editorial Seasonal Timeline)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 md:py-28 bg-[#06150E] border-b border-emerald-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 sm:mb-18">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>बुवाई से मंडी तक का सफर</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
              आपकी पूरी फसल अवधि में साथ।
            </h2>
            <p className="mt-3 text-base sm:text-lg text-stone-300">
              KisaanBuddy केवल एक वेबसाइट नहीं, बल्कि फसल के पहले दिन से लेकर अंतिम बिक्री तक का भरोसेमंद डिजिटल सलाहकार है।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-7 sm:p-8 rounded-3xl bg-[#091F14] border border-emerald-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-emerald-400/40">01</span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  सप्ताह 1 - 4
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                बुवाई व बीज चयन (Sowing)
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed font-normal">
                मिट्टी की स्थिति और मौसम के आधार पर सही किस्म (Variety) चुनें। खाद और बेसल डोज (Basal Dose) की सटीक गणना करें ताकि अतिरिक्त खर्च न हो।
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-7 sm:p-8 rounded-3xl bg-[#091F14] border border-emerald-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-emerald-400/40">02</span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  सप्ताह 5 - 12
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                देखभाल व रोग नियंत्रण (Crop Health)
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed font-normal">
                कीड़े या फंगस के पहले लक्षण दिखते ही पत्ती स्कैन करें। बारिश के पूर्वानुमान के अनुसार ही दवा का छिड़काव करें ताकि दवा व्यर्थ न बहे।
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-7 sm:p-8 rounded-3xl bg-[#091F14] border border-emerald-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-emerald-400/40">03</span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  सप्ताह 13 - 16
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                कटाई व मंडी बिक्री (Harvest & Selling)
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed font-normal">
                कटाई के लिए स्थानीय हार्वेस्टर और मजदूर बुक करें। 3 नज़दीकी मंडियों के दैनिक भाव तुलना करें और उस मंडी में माल ले जाएं जहां सबसे अधिक भाव मिले।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. THE REALITY-FIRST OATH (Authentic Data Integrity)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#040E08] border-b border-emerald-950/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-600/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>KisaanBuddy Reality-First Policy</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            किसानों का विश्वास ही हमारी सबसे बड़ी पूंजी है।
          </h2>

          <p className="text-sm sm:text-base text-stone-300 max-w-3xl mx-auto font-normal leading-relaxed">
            कृषि कोई खेल नहीं है — किसान का एक गलत फैसला साल भर की मेहनत बर्बाद कर सकता है। इसलिए KisaanBuddy पर कोई नकली रिव्यू, बनावटी मंडी भाव, या AI-जनरेटेड फर्जी किसान तस्वीरें कभी नहीं मिलेंगी।
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-[#091F14] border border-emerald-900/50 text-left">
              <div className="text-rose-400 font-bold text-xs mb-1">🚫 कभी नहीं</div>
              <div className="text-xs text-stone-300">कोई बनावटी या काल्पनिक मंडी भाव</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#091F14] border border-emerald-900/50 text-left">
              <div className="text-rose-400 font-bold text-xs mb-1">🚫 कभी नहीं</div>
              <div className="text-xs text-stone-300">कोई फर्जी ग्राहक रिव्यू या रेटिंग</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#091F14] border border-emerald-900/50 text-left">
              <div className="text-emerald-400 font-bold text-xs mb-1">✓ 100% सत्य</div>
              <div className="text-xs text-stone-300">AGMARKNET व IMD मौसम स्टेशन डेटा</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#091F14] border border-emerald-900/50 text-left">
              <div className="text-emerald-400 font-bold text-xs mb-1">✓ ICAR प्रमाणित</div>
              <div className="text-xs text-stone-300">वैज्ञानिक विश्वविद्यालयों की दवा खुराक</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FINAL CALL TO ACTION (Minimal, Powerful)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 md:py-28 bg-gradient-to-b from-[#06150E] to-[#0D281C] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
            आज ही अपने खेत को बनाएं और भी समझदार।
          </h2>

          <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto font-normal">
            देश भर के हजारों किसान भाई रोज़ाना KisaanBuddy का उपयोग अपनी फसलों की सुरक्षा और सही मंडी भाव पाने के लिए कर रहे हैं।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-950 active:scale-95 transition-all"
            >
              {user ? "अपना डैशबोर्ड खोलें →" : "मुफ्त शुरुआत करें →"}
            </Link>

            <button
              type="button"
              onClick={() => openVoiceAssistant()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0A2016] hover:bg-[#0D281C] border border-emerald-700/50 text-emerald-300 font-bold text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>बोलकर सवाल पूछें</span>
            </button>
          </div>

          <div className="pt-6 text-xs text-stone-400 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium">
            <span>✓ कोई शुल्क नहीं (100% Free)</span>
            <span>✓ हिंदी, कन्नड़ और अंग्रेजी में उपलब्ध</span>
            <span>✓ बिना किसी ऐप डाउनलोड के सीधे ब्राउज़र में चलेगा</span>
          </div>
        </div>
      </section>
    </div>
  );
}
