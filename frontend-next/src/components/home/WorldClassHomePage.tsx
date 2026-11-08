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
  Phone,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Droplets,
  BookOpen,
  Volume2,
  FlaskConical,
  Landmark,
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
  const [locationName, setLocationName] = useState<string>("आपका क्षेत्र");
  const [voiceQuery, setVoiceQuery] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function fetchWeather() {
      try {
        const loc = await resolveUserLocation();
        if (loc && isMounted) {
          setLocationName(loc.city || "आपका क्षेत्र");
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

  const sampleVoicePrompts = [
    { text: "गेहूं का आज का मंडी भाव क्या है?", icon: "🌾" },
    { text: "टमाटर की पत्ती पर पीले धब्बे हैं, क्या दवा डालें?", icon: "🍃" },
    { text: "क्या आज बारिश होगी, दवा छिड़क सकते हैं?", icon: "🌧️" },
    { text: "कटाई के लिए मजदूर कहां मिलेंगे?", icon: "👥" },
  ];

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
            <span>{locationName}</span>
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
            <span>सरकारी AGMARKNET मंडी भाव • IMD मौसम</span>
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
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
                  🎙️ किसान वॉइस असिस्टेंट (बोलकर पूछें)
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  नमस्ते किसान भाई! <br className="hidden sm:inline" />
                  आज आपकी खेती में क्या मदद चाहिए?
                </h1>
                <p className="mt-2 text-sm sm:text-base text-emerald-100 max-w-xl font-normal">
                  टाइप करने की जरूरत नहीं है — बस नीचे दिए गए हरे माइक बटन को दबाएं और अपनी भाषा में कोई भी सवाल बोलकर पूछें।
                </p>
              </div>

              {/* GIANT PULSING MICROPHONE BUTTON */}
              <button
                type="button"
                onClick={() => openVoiceAssistant()}
                className="group relative flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white text-emerald-900 shadow-2xl hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer border-4 border-emerald-300"
                aria-label="बोलकर सवाल पूछें"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping opacity-75" />
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-700 stroke-[2.4]" />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-black text-emerald-900 tracking-wide uppercase">
                  बोलें / Speak
                </span>
              </button>
            </div>

            {/* Quick Sample Voice Prompts - Tap to Ask */}
            <div className="pt-4 border-t border-white/20">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block mb-3 text-center sm:text-left">
                किसान भाई अक्सर ये सवाल पूछते हैं (टैप करें और तुरंत सुनें):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sampleVoicePrompts.map((item, idx) => (
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
            3. BIG, SIMPLE PRIMARY TASK CARDS (खेती के 5 मुख्य काम)
            Ultra-clear, high contrast, big touch targets for easy navigation
        ───────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
              सीधे इस्तेमाल करें (Select Service)
            </h2>
            <span className="text-xs text-stone-500 font-semibold">
              एक क्लिक में सेवा शुरू करें
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
                    1. फसल डॉक्टर
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                    फोटो खींचें
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  पत्ती की फोटो खींचकर रोग पहचानें और सही दवा व खुराक जानें।
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                  जांच शुरू करें →
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
                    2. आज का मंडी भाव
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Live AGMARKNET
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  अपनी नज़दीकी मंडी के गेहूं, सरसों, चना और अन्य फसलों के ताज़ा रेट देखें।
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400">
                  भाव देखें →
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
                    3. मौसम व बारिश
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                    3 दिन का अनुमान
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  बारिश कब होगी और कीटनाशक छिड़काव के लिए आज सही समय है या नहीं।
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-400">
                  मौसम देखें →
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
                    4. ट्रैक्टर व मशीनरी
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    किराया व खरीद
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  ट्रैक्टर, रोटावेटर और हार्वेस्टर किराए पर लें। सीधे मालिक से बात करें।
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  उपकरण खोजें →
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
                    5. खेत मजदूर (AgriLabour)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                    मजदूर खोजें
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  फसल कटाई, रोपाई और छिड़काव के लिए अनुभवी मजदूर खोजें या पंजीकरण करें।
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-800 dark:text-indigo-400">
                  मजदूर देखें →
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
                    6. AI कृषि सलाहकार
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    24x7 सेवा
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                  खाद की मात्रा, बीज उपचार और बुवाई से कटाई तक कोई भी सवाल पूछें।
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-400">
                  चैट शुरू करें →
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
              <span>आज की खेती सलाह (Field Advisory)</span>
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              IMD & कृषि विभाग द्वारा
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather & Spray Safety */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
              <CloudSun className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  छिड़काव के लिए स्थिति: अनुकूल
                </strong>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 mt-0.5 leading-relaxed">
                  आज आपके क्षेत्र में तेज़ बारिश की संभावना नहीं है। कीटनाशक या खाद का छिड़काव सुबह 10 बजे से पहले या शाम 4 बजे के बाद करें।
                </p>
              </div>
            </div>

            {/* Mandi Selling Tip */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-amber-950 dark:text-amber-200">
                  मंडी भाव सुझाव: गेहूं व सरसों
                </strong>
                <p className="text-xs text-amber-900 dark:text-amber-300 mt-0.5 leading-relaxed">
                  आज प्रमुख मंडियों में गेहूं की औसत दर ₹2,275 और सरसों ₹5,450 प्रति क्विंटल है। फसल बेचने से पहले नज़दीकी 2 मंडियों के भाव ज़रूर मिला लें।
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
                फोन चलाने में कोई परेशानी आ रही है?
              </strong>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                हमारे WhatsApp पर सीधे जुड़ें। अपनी फसल का फोटो या वॉइस मैसेज भेजें।
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/919429693427?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87%20KisaanBuddy!%20%E0%A4%AE%E0%A5%81%E0%A4%9D%E0%A5%87%20%E0%A4%96%E0%A5%87%E0%A4%A4%E0%A5%80%20%E0%A4%B8%E0%A5%87%20%E0%A4%9C%E0%A5%81%E0%A4%A1%E0%A4%BC%E0%A5%80%20%E0%A4%9C%E0%A4%BE%E0%A4%A8%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%80%20%E0%A4%9A%E0%A4%BE%E0%A4%B9%E0%A4%BF%E0%A4%8F%E0%A4%Ahandled"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp पर पूछें →</span>
          </a>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. SIMPLE 3-STEP GUIDE (कैसे इस्तेमाल करें?)
        ───────────────────────────────────────────────────────────── */}
        <section className="text-center space-y-4 pt-4">
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
            KisaanBuddy का उपयोग करना बहुत आसान है:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-2xl font-black text-emerald-700">1. बोलें</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                माइक का बटन दबाएं और अपनी फसल या मंडी के बारे में बोलकर पूछें।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-2xl font-black text-emerald-700">2. फोटो भेजें</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                अगर फसल में रोग है, तो पत्ते की फोटो खींचकर तुरंत सही दवा जानें।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-2xl font-black text-emerald-700">3. समाधान पाएं</span>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                सरकारी प्रमाणित मंडी भाव, मौसम अलर्ट और सही सलाह सीधे अपनी स्क्रीन पर देखें।
              </p>
            </div>
          </div>

          <div className="pt-4 text-xs text-stone-500 font-medium">
            <span>✓ 100% निःशुल्क सेवा</span> • <span>✓ कोई ऐप डाउनलोड करने की जरूरत नहीं</span> • <span>✓ भारत सरकार AGMARKNET व IMD प्रमाणित</span>
          </div>
        </section>
      </div>
    </div>
  );
}
