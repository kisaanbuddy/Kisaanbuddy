"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "@/lib/voice/VoiceContext";
import { useLanguage, type Lang } from "@/lib/language";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  X,
  TrendingUp,
  Bug,
  CloudSun,
  Tractor,
  Users,
  Bot,
  Volume2,
  VolumeX,
} from "lucide-react";

interface FloatingService {
  id: string;
  nameHi: string;
  nameKn: string;
  nameEn: string;
  emoji: string;
  path: string;
  voiceSample: string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    hover: string;
  };
}

const SERVICES: FloatingService[] = [
  {
    id: "disease",
    nameHi: "AI क्रॉप डॉक्टर",
    nameKn: "AI ಕ್ರಾಪ್ ಡಾಕ್ಟರ್",
    nameEn: "AI Crop Doctor",
    emoji: "🌱",
    path: "/disease",
    voiceSample: "Meri fasal mein bimari hai",
    icon: Bug,
    color: {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-900/60",
      text: "text-rose-700 dark:text-rose-300",
      badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      hover: "hover:border-rose-500 hover:shadow-rose-500/20",
    },
  },
  {
    id: "mandi",
    nameHi: "आज का मंडी भाव",
    nameKn: "ಇಂದಿನ ಮಂಡಿ ದರ",
    nameEn: "Today's Mandi Rates",
    emoji: "📊",
    path: "/mandi",
    voiceSample: "Mandi bhav batao",
    icon: TrendingUp,
    color: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-900/60",
      text: "text-amber-800 dark:text-amber-300",
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      hover: "hover:border-amber-500 hover:shadow-amber-500/20",
    },
  },
  {
    id: "weather",
    nameHi: "मौसम व बारिश अलर्ट",
    nameKn: "ಹವಾಮಾನ ಮತ್ತು ಮಳೆ",
    nameEn: "Weather & Rain Alert",
    emoji: "🌦️",
    path: "/weather",
    voiceSample: "Mausam batao",
    icon: CloudSun,
    color: {
      bg: "bg-sky-50 dark:bg-sky-950/40",
      border: "border-sky-200 dark:border-sky-900/60",
      text: "text-sky-700 dark:text-sky-300",
      badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      hover: "hover:border-sky-500 hover:shadow-sky-500/20",
    },
  },
  {
    id: "marketplace",
    nameHi: "ट्रैक्टर व मशीनरी",
    nameKn: "ಟ್ರ್ಯಾಕ್ಟರ್ ಮತ್ತು ಯಂತ್ರ",
    nameEn: "Tractor & Machinery",
    emoji: "🚜",
    path: "/marketplace",
    voiceSample: "Tractor rent chahiye",
    icon: Tractor,
    color: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-900/60",
      text: "text-emerald-800 dark:text-emerald-300",
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      hover: "hover:border-emerald-500 hover:shadow-emerald-500/20",
    },
  },
  {
    id: "worker-connect",
    nameHi: "एग्री-मजदूर (AgriLabour)",
    nameKn: "ಕೃಷಿ ಕಾರ್ಮಿಕರು",
    nameEn: "AgriLabour Connect",
    emoji: "👨‍🌾",
    path: "/worker-connect",
    voiceSample: "Mazdoor chahiye",
    icon: Users,
    color: {
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      border: "border-indigo-200 dark:border-indigo-900/60",
      text: "text-indigo-800 dark:text-indigo-300",
      badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
      hover: "hover:border-indigo-500 hover:shadow-indigo-500/20",
    },
  },
  {
    id: "chatbot",
    nameHi: "AI कृषि सलाहकार",
    nameKn: "AI ಕೃಷಿ ಸಲಹೆಗಾರ",
    nameEn: "AI Agriculture Advisor",
    emoji: "✨",
    path: "/chatbot",
    voiceSample: "Fertilizer kab dalna hai?",
    icon: Sparkles,
    color: {
      bg: "bg-teal-50 dark:bg-teal-950/40",
      border: "border-teal-200 dark:border-teal-900/60",
      text: "text-teal-800 dark:text-teal-300",
      badge: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
      hover: "hover:border-teal-500 hover:shadow-teal-500/20",
    },
  },
];

export function SpeakHeroControlHub() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    isListening,
    isProcessing,
    isSpeaking,
    audioVolume,
    transcriptLive,
    lastReply,
    startListening,
    stopListening,
    cancelListening,
    pauseAudio,
    resumeAudio,
    replayAudio,
    stopAudio,
    sendVoiceCommand,
    voiceLanguage,
    setVoiceLanguage,
  } = useVoice();

  const { lang, setLang } = useLanguage();

  const isHindi = voiceLanguage === "hi" || voiceLanguage === "hi_en" || lang === "hi";
  const isKannada = voiceLanguage === "kn" || lang === "kn";

  // Collapse when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Keep expanded if active listening or speaking
  useEffect(() => {
    if (isListening || isProcessing || isSpeaking) {
      setIsExpanded(true);
    }
  }, [isListening, isProcessing, isSpeaking]);

  const handleMainButtonClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      void startListening();
    } else if (isListening) {
      stopListening();
    } else {
      void startListening();
    }
  };

  const handleServiceClick = (path: string) => {
    setIsExpanded(false);
    router.push(path);
  };

  const handleVoiceChipClick = (phrase: string) => {
    void sendVoiceCommand(phrase);
  };

  return (
    <div ref={containerRef} className="relative inline-block select-none">
      {/* ─────────────────────────────────────────────────────────────
          2. EXPANDED FLOATING STATE:
          Six Floating Pill-Shaped Shortcuts arranged around & above
          the Speak button
      ───────────────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 z-50 w-[330px] sm:w-[480px] p-4 rounded-3xl bg-white/98 dark:bg-stone-900/98 backdrop-blur-2xl border-2 border-emerald-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200">
          {/* Top Hub Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black tracking-wide text-stone-900 dark:text-white uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {isKannada
                    ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ವಾಯ್ಸ್ ಕಂಟ್ರೋಲ್"
                    : isHindi
                    ? "किसानबड्डी वॉइस कंट्रोल"
                    : "KisaanBuddy Voice Control"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-[10px] font-bold">
                {[
                  { code: "hi", label: "हिन्दी" },
                  { code: "kn", label: "ಕನ್ನಡ" },
                  { code: "en", label: "English" },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setVoiceLanguage(item.code);
                      setLang(item.code as Lang);
                    }}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      voiceLanguage === item.code
                        ? "bg-emerald-600 text-white"
                        : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  cancelListening();
                  stopAudio();
                  setIsExpanded(false);
                }}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Interaction & Decibel Live Visualizer */}
          {(isListening || isProcessing || isSpeaking || transcriptLive || lastReply) && (
            <div className="mb-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/80 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isListening
                        ? "bg-rose-500 animate-ping"
                        : isSpeaking
                        ? "bg-teal-400 animate-pulse"
                        : "bg-amber-400 animate-spin"
                    }`}
                  />
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {isListening
                      ? isKannada
                        ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ"
                        : isHindi
                        ? "सुन रहे हैं... कृपया बोलिए"
                        : "Listening... Speak now"
                      : isProcessing
                      ? isKannada
                        ? "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ..."
                        : isHindi
                        ? "समझ रहे हैं..."
                        : "Processing..."
                      : isKannada
                      ? "ಉತ್ತರಿಸುತ್ತಿದ್ದೇವೆ..."
                      : isHindi
                      ? "किसानबड्डी बोल रहे हैं..."
                      : "KisaanBuddy Speaking..."}
                  </span>
                </div>

                {/* Animated Decibel Wave Bars */}
                {isListening && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(4, Math.min(18, (audioVolume / 100) * 20 * (i * 0.4)))}px`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {transcriptLive && (
                <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {isKannada ? "ನೀವು ಹೇಳಿದ್ದು:" : isHindi ? "आपने कहा:" : "You said:"}
                  </span>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    "{transcriptLive}"
                  </p>
                </div>
              )}

              {lastReply && (
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                    {isKannada ? "ಉತ್ತರ:" : isHindi ? "किसानबड्डी जवाब:" : "Reply:"}
                  </span>
                  <p className="text-xs font-medium text-stone-900 dark:text-stone-100 leading-snug">
                    {lastReply}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-emerald-200 dark:border-emerald-900/40 text-[11px]">
                    {isSpeaking ? (
                      <button
                        type="button"
                        onClick={pauseAudio}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold"
                      >
                        <Pause className="w-3 h-3" />
                        <span>{isKannada ? "ವಿರಾಮ" : isHindi ? "रोकें" : "Pause"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={resumeAudio}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-semibold"
                      >
                        <Play className="w-3 h-3" />
                        <span>{isKannada ? "ಪ್ಲೇ" : isHindi ? "सुनें" : "Play"}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={replayAudio}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isKannada ? "ಮತ್ತೆ" : isHindi ? "दोबारा" : "Replay"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopAudio}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold"
                    >
                      <Square className="w-3 h-3" />
                      <span>{isKannada ? "ನಿಲ್ಲಿಸಿ" : isHindi ? "बंद" : "Stop"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── THE SIX FLOATING PILL BUTTONS ── */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 block px-1">
              {isKannada
                ? "6 ಕಿಸಾನ್ ಸೇವೆಗಳು (ಸ್ಪರ್ಶಿಸಿ):"
                : isHindi
                ? "6 प्रमुख सेवाएं (क्लिक करें या सीधे बोलें):"
                : "6 Floating Services (Tap to Open):"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICES.map((service, index) => {
                const Icon = service.icon;
                const name = isKannada
                  ? service.nameKn
                  : isHindi
                  ? service.nameHi
                  : service.nameEn;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceClick(service.path)}
                    style={{ animationDelay: `${index * 40}ms` }}
                    className={`group px-3 py-2 rounded-full ${service.color.bg} ${service.color.border} ${service.color.hover} border shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-2 text-left cursor-pointer active:scale-95 animate-in fade-in zoom-in-95`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{service.emoji}</span>
                      <span
                        className={`text-xs font-bold ${service.color.text} truncate`}
                      >
                        {name}
                      </span>
                    </div>

                    <span className="text-[10px] text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0">
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Voice Command Chips (Tap to speak) */}
          <div className="pt-3 mt-3 border-t border-stone-200 dark:border-stone-800 space-y-1.5">
            <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 block px-1">
              {isKannada
                ? "ಧ್ವನಿ ಮಾದರಿಗಳು (ಒತ್ತಿ ಮಾತನಾಡಿ):"
                : isHindi
                ? "बोलकर पूछें (सीधे क्लिक करें):"
                : "Try Speaking Naturally:"}
            </span>

            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "🌾 Mandi bhav batao", cmd: "Mandi bhav batao" },
                { label: "🍃 Meri fasal mein bimari hai", cmd: "Meri fasal mein bimari hai" },
                { label: "🌧️ Mausam batao", cmd: "Mausam batao" },
                { label: "🚜 Tractor rent chahiye", cmd: "Tractor rent chahiye" },
                { label: "👨‍🌾 Mazdoor chahiye", cmd: "Mazdoor chahiye" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleVoiceChipClick(item.cmd)}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 dark:bg-stone-800 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-stone-200 dark:border-stone-700 text-[10px] font-medium transition-all"
                >
                  "{item.cmd}"
                </button>
              ))}
            </div>
          </div>

          {/* Little downward notch pointing directly into the Speak button */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:left-12 w-4 h-4 bg-white dark:bg-stone-900 border-r-2 border-b-2 border-emerald-500/40 rotate-45 transform pointer-events-none" />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. DEFAULT STATE:
          The Central Speak / बोलें Button
          - Microphone icon
          - Speak / बोलें text
          - White rounded pill design
          - Existing green theme
          - Subtle breathing animation & glowing border
      ───────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleMainButtonClick}
        aria-label={isListening ? "Stop listening" : "Speak / बोलें KisaanBuddy Voice"}
        title={
          isListening
            ? "Listening... Tap to stop"
            : "Tap to Speak / बोलें or expand 6 KisaanBuddy services"
        }
        className={`relative group inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-full text-sm sm:text-base font-bold shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95 ${
          isListening
            ? "bg-rose-600 text-white border-2 border-rose-400 ring-4 ring-rose-400/40 animate-pulse scale-105"
            : isSpeaking
            ? "bg-emerald-800 text-white border-2 border-emerald-400 ring-4 ring-emerald-400/40"
            : isExpanded
            ? "bg-emerald-800 text-white border-2 border-emerald-600 ring-2 ring-emerald-500/30"
            : "bg-white dark:bg-stone-900 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-600/40 dark:border-emerald-500/50 hover:border-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.02]"
        }`}
      >
        {/* Subtle breathing ring when idle */}
        {!isListening && !isExpanded && (
          <span className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm animate-[pulse_3s_ease-in-out_infinite] pointer-events-none" />
        )}

        {/* Microphone Icon Badge */}
        <div
          className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
            isListening
              ? "bg-white text-rose-600"
              : isExpanded
              ? "bg-white/20 text-white"
              : "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 group-hover:scale-110"
          }`}
        >
          {isListening ? (
            <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
          ) : (
            <Mic className="w-4 h-4 stroke-[2.4]" />
          )}
        </div>

        {/* Button Text Label */}
        <span className="tracking-wide font-extrabold">
          {isListening
            ? isKannada
              ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ..."
              : isHindi
              ? "सुन रहे हैं... बोलिए"
              : "Listening..."
            : isKannada
            ? "ಮಾತನಾಡಿ / Speak"
            : isHindi
            ? "बोलें / Voice"
            : "Speak / बोलें"}
        </span>

        {/* Subtle Indicator Arrow/Dot */}
        <span
          className={`w-2 h-2 rounded-full transition-transform ${
            isListening
              ? "bg-white animate-ping"
              : isExpanded
              ? "bg-emerald-300 rotate-180"
              : "bg-emerald-500 group-hover:scale-125"
          }`}
        />
      </button>
    </div>
  );
}
