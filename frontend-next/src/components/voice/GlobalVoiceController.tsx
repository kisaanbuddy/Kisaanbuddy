"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "@/lib/voice/VoiceContext";
import { useLanguage, type Lang } from "@/lib/language";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
  Check,
  TrendingUp,
  Bug,
  CloudSun,
  Tractor,
  Users,
  Bot,
  ArrowUpRight,
  Radio,
  Send,
  CornerDownLeft,
} from "lucide-react";

interface ServiceShortcut {
  id: string;
  titleHi: string;
  titleKn: string;
  titleEn: string;
  descHi: string;
  descKn: string;
  descEn: string;
  path: string;
  voiceSample: string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
}

const SERVICES: ServiceShortcut[] = [
  {
    id: "disease",
    titleHi: "AI क्रॉप डॉक्टर",
    titleKn: "AI ಕ್ರಾಪ್ ಡಾಕ್ಟರ್",
    titleEn: "AI Crop Doctor",
    descHi: "पत्ती की फोटो से फसल रोग व दवा पहचानें",
    descKn: "ಎಲೆ ಫೋಟೋ ಮೂಲಕ ಬೆಳೆ ರೋಗ ಪತ್ತೆಹಚ್ಚಿ",
    descEn: "Identify crop diseases using photographs",
    path: "/disease",
    voiceSample: "Mere tamatar ke paudhe mein bimari hai",
    icon: Bug,
    color: {
      bg: "bg-rose-500/10 hover:bg-rose-500/20",
      border: "border-rose-500/30 hover:border-rose-400/60",
      text: "text-rose-400",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
  },
  {
    id: "mandi",
    titleHi: "आज का मंडी भाव",
    titleKn: "ಇಂದಿನ ಮಂಡಿ ದರ",
    titleEn: "Today's Mandi Rates",
    descHi: "देश की मंडियों के ताज़ा भाव व आवक देखें",
    descKn: "ಲೈವ್ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಮತ್ತು ಮಂಡಿ ಮಾಹಿತಿ",
    descEn: "View current mandi prices & market info",
    path: "/mandi",
    voiceSample: "Mujhe aaj ka mandi bhav batao",
    icon: TrendingUp,
    color: {
      bg: "bg-amber-500/10 hover:bg-amber-500/20",
      border: "border-amber-500/30 hover:border-amber-400/60",
      text: "text-amber-400",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
  },
  {
    id: "weather",
    titleHi: "मौसम व बारिश अलर्ट",
    titleKn: "ಹವಾಮಾನ ಮತ್ತು ಮಳೆ ಎಚ್ಚರಿಕೆ",
    titleEn: "Weather & Rain Alert",
    descHi: "3 दिन का बारिश पूर्वानुमान व स्प्रे सलाह",
    descKn: "ನಿಖರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಮಳೆ ಎಚ್ಚರಿಕೆ",
    descEn: "Check weather forecasts & rainfall info",
    path: "/weather",
    voiceSample: "Kal baarish hogi kya?",
    icon: CloudSun,
    color: {
      bg: "bg-sky-500/10 hover:bg-sky-500/20",
      border: "border-sky-500/30 hover:border-sky-400/60",
      text: "text-sky-400",
      badge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
  },
  {
    id: "marketplace",
    titleHi: "ट्रैक्टर व मशीनरी",
    titleKn: "ಟ್ರ್ಯಾಕ್ಟರ್ ಮತ್ತು ಯಂತ್ರೋಪಕರಣ",
    titleEn: "Tractor & Machinery",
    descHi: "किराये या खरीद के लिए वास्तविक उपकरण",
    descKn: "ನಿಜವಾದ ಉಪಕರಣ ಬಾಡಿಗೆ ಮತ್ತು ಖರೀದಿ ಪಟ್ಟಿಗಳು",
    descEn: "Explore equipment rental & buying listings",
    path: "/marketplace",
    voiceSample: "Mujhe tractor rent par chahiye",
    icon: Tractor,
    color: {
      bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
      border: "border-emerald-500/30 hover:border-emerald-400/60",
      text: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
  },
  {
    id: "worker-connect",
    titleHi: "एग्री-मजदूर (AgriLabour)",
    titleKn: "ಕೃಷಿ ಕಾರ್ಮಿಕರು (AgriLabour)",
    titleEn: "AgriLabour Connect",
    descHi: "बुवाई व कटाई के लिए कुशल मजदूर खोजें",
    descKn: "ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ಸುಲಭವಾಗಿ ಹುಡುಕಿ",
    descEn: "Find agricultural workers & labour opportunities",
    path: "/worker-connect",
    voiceSample: "Mujhe kheti ke liye mazdoor chahiye",
    icon: Users,
    color: {
      bg: "bg-purple-500/10 hover:bg-purple-500/20",
      border: "border-purple-500/30 hover:border-purple-400/60",
      text: "text-purple-400",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
  },
  {
    id: "chatbot",
    titleHi: "AI कृषि सलाहकार",
    titleKn: "AI ಕೃಷಿ ಸಲಹೆಗಾರ",
    titleEn: "AI Agriculture Advisor",
    descHi: "खाद, बीज, कीटनाशक और फसल प्रबंधन सलाह",
    descKn: "ಬೀಜ, ಗೊಬ್ಬರ, ಕೀಟನಾಶಕಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ",
    descEn: "Ask about seeds, fertilizers & crops",
    path: "/chatbot",
    voiceSample: "Fertilizer kab dalna hai?",
    icon: Sparkles,
    color: {
      bg: "bg-teal-500/10 hover:bg-teal-500/20",
      border: "border-teal-500/30 hover:border-teal-400/60",
      text: "text-teal-400",
      badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    },
  },
];

export function GlobalVoiceController() {
  const router = useRouter();
  const {
    isListening,
    isProcessing,
    isSpeaking,
    continuousMode,
    audioVolume,
    transcriptLive,
    lastReply,
    currentRoute,
    pendingConfirmation,
    audioMuted,
    isHudOpen,
    voiceLanguage,
    setVoiceLanguage,
    startListening,
    stopListening,
    cancelListening,
    toggleContinuousMode,
    pauseAudio,
    resumeAudio,
    stopAudio,
    replayAudio,
    setAudioMuted,
    setIsHudOpen,
    confirmPendingAction,
    cancelPendingAction,
    sendVoiceCommand,
  } = useVoice();

  const { lang, setLang } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);
  const [manualInput, setManualInput] = useState("");

  const isHindi = voiceLanguage === "hi" || voiceLanguage === "hi_en" || lang === "hi";
  const isKannada = voiceLanguage === "kn" || lang === "kn";

  // Listen for global open voice assistant events
  React.useEffect(() => {
    const handleOpenVoice = (e: Event) => {
      const custom = e as CustomEvent<{ initialQuery?: string; autoStart?: boolean }>;
      setIsHudOpen(true);
      if (custom.detail?.initialQuery) {
        void sendVoiceCommand(custom.detail.initialQuery);
      } else if (custom.detail?.autoStart !== false) {
        void startListening();
      }
    };

    window.addEventListener("kisaanbuddy:open-voice", handleOpenVoice);
    return () => {
      window.removeEventListener("kisaanbuddy:open-voice", handleOpenVoice);
    };
  }, [setIsHudOpen, sendVoiceCommand, startListening]);

  const handleServiceClick = (service: ServiceShortcut) => {
    router.push(service.path);
    setIsHudOpen(true);
  };

  const handleVoiceChipClick = (phrase: string) => {
    void sendVoiceCommand(phrase);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    void sendVoiceCommand(manualInput.trim());
    setManualInput("");
  };

  // Status label
  const getStatusText = () => {
    if (isListening) {
      return isKannada
        ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ"
        : isHindi
        ? "सुन रहे हैं... कृपया बोलिए"
        : "Listening... Speak now";
    }
    if (isProcessing) {
      return isKannada
        ? "ಆದೇಶ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ..."
        : isHindi
        ? "आदेश समझ रहे हैं..."
        : "Understanding command...";
    }
    if (isSpeaking) {
      return isKannada
        ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಉತ್ತರಿಸುತ್ತಿದೆ..."
        : isHindi
        ? "किसानबड्डी बोल रहे हैं..."
        : "KisaanBuddy Speaking...";
    }
    return isKannada
      ? "ವಾಯ್ಸ್ ಹಬ್ ಸಿದ್ಧವಾಗಿದೆ"
      : isHindi
      ? "वॉइस हब तैयार है • बोलें या चुनें"
      : "KisaanBuddy Voice Hub Ready";
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. CENTRAL FLOATING AI MICROPHONE (KisaanBuddy AI)
          Fixed bottom-right corner of every page
      ───────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-[60] flex flex-col items-end gap-2 pointer-events-auto select-none">
        {/* Floating Brand Label Pill */}
        {!isHudOpen && (
          <button
            type="button"
            onClick={() => {
              setIsHudOpen(true);
              if (!isListening) void startListening();
            }}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 text-xs font-bold border border-emerald-500/40 shadow-xl backdrop-blur-md hover:border-emerald-400 transition-all hover:scale-105 active:scale-95"
            title="Open KisaanBuddy Voice Assistant"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>
              {isKannada
                ? "ಕಿಸಾನ್‌ಬಡ್ಡಿಗೆ ಕೇಳಿ"
                : isHindi
                ? "बोलें / Ask KisaanBuddy"
                : "Ask KisaanBuddy"}
            </span>
          </button>
        )}

        {/* Primary Circular Voice Button */}
        <div className="relative">
          {/* Subtle Breathing Glow Aura */}
          <span
            className={`absolute -inset-1.5 rounded-full transition-opacity duration-500 pointer-events-none ${
              isListening
                ? "bg-rose-500/40 animate-pulse"
                : isSpeaking
                ? "bg-teal-400/40 animate-pulse"
                : isProcessing
                ? "bg-amber-400/40 animate-pulse"
                : "bg-emerald-500/25 group-hover:bg-emerald-500/40 blur-sm animate-[pulse_3s_ease-in-out_infinite]"
            }`}
          />

          {/* Dynamic Audio Ripple Waves when listening */}
          {isListening && (
            <span
              className="absolute inset-0 rounded-full bg-rose-500/30 pointer-events-none transition-transform duration-75"
              style={{
                transform: `scale(${1 + (audioVolume / 100) * 0.7})`,
                opacity: 0.3 + (audioVolume / 100) * 0.5,
              }}
            />
          )}

          <button
            type="button"
            onClick={() => {
              if (isHudOpen && !isListening) {
                void startListening();
              } else if (isListening) {
                stopListening();
              } else {
                setIsHudOpen(true);
                void startListening();
              }
            }}
            aria-label={isListening ? "Stop voice listening" : "Open KisaanBuddy AI Voice Hub"}
            title={
              isListening
                ? "Listening... Tap to stop"
                : "KisaanBuddy AI: Tap to speak in Hindi, Kannada or English"
            }
            className={`relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 ${
              isListening
                ? "bg-gradient-to-tr from-rose-600 to-red-500 text-white ring-4 ring-rose-400/50 scale-105 shadow-[0_0_30px_rgba(244,63,94,0.6)]"
                : isSpeaking
                ? "bg-gradient-to-tr from-teal-600 to-emerald-600 text-white ring-4 ring-teal-400/50 shadow-[0_0_25px_rgba(20,184,166,0.5)]"
                : isProcessing
                ? "bg-gradient-to-tr from-amber-600 to-orange-500 text-white ring-4 ring-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                : "bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-700 text-white ring-2 ring-emerald-400/40 hover:scale-105 shadow-[0_10px_35px_rgba(6,95,70,0.5)]"
            }`}
          >
            {isListening ? (
              <Square className="w-6 h-6 fill-current animate-pulse z-10" />
            ) : (
              <Mic className="w-6 h-6 md:w-7 md:h-7 z-10" />
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EXPANDABLE AI-POWERED FLOATING VOICE HUB
          Desktop: Floating dock on bottom right
          Mobile: Responsive slide-up bottom sheet
      ───────────────────────────────────────────────────────────── */}
      {isHudOpen && (
        <div className="fixed z-[65] inset-x-0 bottom-0 md:inset-auto md:bottom-24 md:right-4 lg:right-6 pointer-events-auto">
          <div className="w-full md:w-[480px] max-w-full md:max-w-[calc(100vw-32px)] max-h-[88vh] md:max-h-[82vh] flex flex-col rounded-t-3xl md:rounded-3xl bg-stone-950/98 text-white border-t md:border border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden transition-all duration-300">
            {/* ── Top Header Bar ── */}
            <div className="px-4 py-3 bg-gradient-to-r from-stone-900 via-emerald-950/40 to-stone-900 border-b border-stone-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-wide text-white">
                      KisaanBuddy AI
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Voice Hub
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 truncate">{getStatusText()}</p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Continuous listen toggle */}
                <button
                  type="button"
                  onClick={toggleContinuousMode}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    continuousMode
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                  title="Auto-listen again after reply"
                >
                  {isKannada ? "ಆಟೋ-ಲಿಸನ್" : isHindi ? "ऑटो-लिसन" : "Auto-Listen"}
                </button>

                {/* Minimize / Expand */}
                <button
                  type="button"
                  onClick={() => setIsMinimized((v) => !v)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title={isMinimized ? "Expand Hub" : "Minimize Hub"}
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Close Hub */}
                <button
                  type="button"
                  onClick={() => {
                    cancelListening();
                    stopAudio();
                    setIsHudOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  title="Close Voice Hub"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Main Body (if not minimized) ── */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(88vh-60px)] md:max-h-[calc(82vh-60px)]">
                {/* 1. INTERACTIVE SPEECH STATUS & EQUALIZER CONSOLE */}
                <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isListening
                            ? "bg-rose-500 animate-ping"
                            : isSpeaking
                            ? "bg-teal-400 animate-pulse"
                            : isProcessing
                            ? "bg-amber-400 animate-spin"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="text-xs font-bold text-stone-200">
                        {isListening
                          ? isKannada
                            ? "ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ..."
                            : isHindi
                            ? "आवाज़ रिकॉर्ड हो रही है..."
                            : "Listening to your voice..."
                          : isProcessing
                          ? isKannada
                            ? "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ..."
                            : isHindi
                            ? "समझ रहे हैं..."
                            : "Processing..."
                          : isSpeaking
                          ? isKannada
                            ? "ಉತ್ತರಿಸುತ್ತಿದ್ದೇವೆ..."
                            : isHindi
                            ? "बोल रहे हैं..."
                            : "Speaking..."
                          : isKannada
                          ? "ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ"
                          : isHindi
                          ? "माइक दबाकर बोलें"
                          : "Tap Mic to Speak"}
                      </span>
                    </div>

                    {/* Decibel visualizer bars */}
                    {isListening && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <span
                            key={i}
                            className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                            style={{
                              height: `${Math.max(4, Math.min(20, (audioVolume / 100) * 22 * (i * 0.3)))}px`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Farmer Spoken Text (Transcript) */}
                  {transcriptLive && (
                    <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                        {isKannada ? "ನೀವು ಹೇಳಿದ್ದು:" : isHindi ? "आपने कहा:" : "You said:"}
                      </span>
                      <p className="text-sm font-semibold text-emerald-300">"{transcriptLive}"</p>
                    </div>
                  )}

                  {/* AI Spoken Audio & Text Reply */}
                  {lastReply && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        {isKannada ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಉತ್ತರ:" : isHindi ? "किसानबड्डी जवाब:" : "KisaanBuddy:"}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-stone-100 leading-relaxed">
                        {lastReply}
                      </p>

                      {/* Audio Controls */}
                      <div className="flex items-center gap-2 pt-1 border-t border-emerald-900/40">
                        {isSpeaking ? (
                          <button
                            type="button"
                            onClick={pauseAudio}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold"
                          >
                            <Pause className="w-3.5 h-3.5" />
                            <span>{isKannada ? "ವಿರಾಮ" : isHindi ? "रोकें" : "Pause"}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={resumeAudio}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>{isKannada ? "ಪ್ಲೇ" : isHindi ? "सुनें" : "Play"}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={replayAudio}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isKannada ? "ಮತ್ತೆ ಕೇಳಿ" : isHindi ? "दोबारा" : "Replay"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={stopAudio}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>{isKannada ? "ನಿಲ್ಲಿಸಿ" : isHindi ? "बंद" : "Stop"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAudioMuted(!audioMuted)}
                          className={`p-1.5 rounded-lg text-xs ml-auto ${
                            audioMuted ? "bg-red-900/50 text-red-300" : "bg-stone-800 text-stone-300"
                          }`}
                          title={audioMuted ? "Unmute" : "Mute"}
                        >
                          {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Speak Bar inside Hub */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isListening) stopListening();
                        else void startListening();
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        isListening
                          ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                          : "bg-emerald-700 hover:bg-emerald-600 text-white shadow-md hover:scale-[1.01]"
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>
                        {isListening
                          ? isKannada
                            ? "ನಿಲ್ಲಿಸಲು ಒತ್ತಿ (Stop)"
                            : isHindi
                            ? "रोकने के लिए दबाएं"
                            : "Stop Listening"
                          : isKannada
                          ? "ಈಗ ಮಾತನಾಡಿ (Tap to Speak)"
                          : isHindi
                          ? "बोलने के लिए माइक दबाएं"
                          : "Tap to Speak Now"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. CONFIRMATION BANNER (For orders/critical actions) */}
                {pendingConfirmation && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/80 text-white space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>
                        {isKannada ? "ದೃಢೀಕರಣದ ಅಗತ್ಯವಿದೆ" : isHindi ? "स्पष्ट पुष्टि आवश्यक है" : "Confirmation Required"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-stone-100">
                      {pendingConfirmation.type === "PLACE_ORDER"
                        ? isKannada
                          ? `ನೀವು ₹${pendingConfirmation.total_amount?.toLocaleString("en-IN")} ಮೌಲ್ಯದ ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಲು ಬಯಸುವಿರಾ? 'ಹೌದು' ಅಥವಾ 'ಬೇಡ' ಎಂದು ಹೇಳಿ.`
                          : isHindi
                          ? `क्या आप ₹${pendingConfirmation.total_amount?.toLocaleString("en-IN")} का यह ऑर्डर प्लेस करना चाहते हैं? 'हाँ' या 'नहीं' बोलें।`
                          : `Confirm order for ₹${pendingConfirmation.total_amount?.toLocaleString("en-IN")}? Say 'Confirm' or 'Cancel'.`
                        : isKannada
                        ? "ಈ ಕ್ರಿಯೆಯನ್ನು ಖಚಿತಪಡಿಸಲು 'ಹೌದು' ಅಥವಾ ರದ್ದುಗೊಳಿಸಲು 'ಬೇಡ' ಎಂದು ಹೇಳಿ."
                        : isHindi
                        ? "इस क्रिया की पुष्टि के लिए 'हाँ' या रद्द करने के लिए 'नहीं' बोलें।"
                        : "Say 'Confirm' to proceed or 'Cancel' to abort."}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={confirmPendingAction}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isKannada ? "ಹೌದು, ಖಚಿತಪಡಿಸಿ" : isHindi ? "हाँ, कन्फर्म करो" : "Confirm"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelPendingAction}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{isKannada ? "ಬೇಡ, ರದ್ದುಮಾಡಿ" : isHindi ? "नहीं, रद्द करो" : "Cancel"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. SIX FLOATING SERVICE SHORTCUTS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {isKannada
                          ? "6 ಕಿಸಾನ್ ಸೇವೆಗಳು (ನೇರ ಪ್ರವೇಶ)"
                          : isHindi
                          ? "6 प्रमुख सेवाएं (क्लिक करें या बोलें)"
                          : "6 Core Services (Tap or Speak)"}
                      </span>
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">Instant Navigation</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICES.map((service) => {
                      const Icon = service.icon;
                      const title = isKannada
                        ? service.titleKn
                        : isHindi
                        ? service.titleHi
                        : service.titleEn;
                      const desc = isKannada
                        ? service.descKn
                        : isHindi
                        ? service.descHi
                        : service.descEn;

                      return (
                        <div
                          key={service.id}
                          className={`group p-2.5 rounded-xl border ${service.color.border} ${service.color.bg} transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between text-left`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${service.color.badge} border`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleServiceClick(service)}
                                className="w-full text-left font-bold text-xs text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between"
                              >
                                <span className="truncate">{title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </button>
                              <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                                {desc}
                              </p>
                            </div>
                          </div>

                          {/* Quick Voice Prompt Trigger Pill */}
                          <button
                            type="button"
                            onClick={() => handleVoiceChipClick(service.voiceSample)}
                            className="mt-2 w-full text-left px-2 py-1 rounded-md bg-stone-900/80 hover:bg-stone-800 text-[10px] text-stone-300 hover:text-white border border-stone-800 transition-colors flex items-center gap-1.5 truncate"
                            title={`Ask: "${service.voiceSample}"`}
                          >
                            <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate italic font-medium">"{service.voiceSample}"</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. FREQUENT VOICE COMMANDS (ONE-TAP CHIPS) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-400 block">
                    {isKannada
                      ? "ತ್ವರಿತ ಧ್ವನಿ ಆಜ್ಞೆಗಳು (ಸ್ಪರ್ಶಿಸಿ):"
                      : isHindi
                      ? "अक्सर पूछे जाने वाले सवाल (क्लिक करें):"
                      : "Popular Voice Commands (Tap to trigger):"}
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        label: isKannada ? "🌾 ಮಂಡಿ ದರ" : isHindi ? "🌾 मंडी भाव बताओ" : "🌾 Mandi Rates",
                        cmd: "Mujhe aaj ka mandi bhav batao",
                      },
                      {
                        label: isKannada ? "🍃 ಟೊಮೆಟೊ ರೋಗ" : isHindi ? "🍃 टमाटर में बीमारी है" : "🍃 Crop Disease",
                        cmd: "Mere tamatar ke paudhe mein bimari hai",
                      },
                      {
                        label: isKannada ? "🌧️ ಮಳೆ ಬರುತ್ತದೆಯೇ?" : isHindi ? "🌧️ कल बारिश होगी क्या?" : "🌧️ Rain Alert",
                        cmd: "Kal baarish hogi kya?",
                      },
                      {
                        label: isKannada ? "🚜 ಟ್ರ್ಯಾಕ್ಟರ್ ಬಾಡಿಗೆ" : isHindi ? "🚜 ट्रैक्टर रेंट पर चाहिए" : "🚜 Rent Tractor",
                        cmd: "Mujhe tractor rent par chahiye",
                      },
                      {
                        label: isKannada ? "👨‍🌾 ಕೃಷಿ ಕಾರ್ಮಿಕರು" : isHindi ? "👨‍🌾 मजदूर चाहिए" : "👨‍🌾 Farm Labour",
                        cmd: "Mujhe kheti ke liye mazdoor chahiye",
                      },
                      {
                        label: isKannada ? "🧪 ಗೊಬ್ಬರ ಹಾಕುವುದು" : isHindi ? "🧪 खाद कब डालना है?" : "🧪 Fertilizer Dosage",
                        cmd: "Fertilizer kab dalna hai?",
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleVoiceChipClick(item.cmd)}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-emerald-300 text-[11px] font-medium border border-stone-800 hover:border-emerald-500/40 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. TEXT INPUT FALLBACK (Type if mic unavailable) */}
                <form onSubmit={handleManualSubmit} className="pt-1">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder={
                        isKannada
                          ? "ಇಲ್ಲಿ ಬರೆಯಿರಿ ಅಥವಾ ಪ್ರಶ್ನೆ ಕೇಳಿ..."
                          : isHindi
                          ? "यहां लिखें (उदा. मंडी भाव, बारिश, खाद)..."
                          : "Type command (e.g. mandi, rain, tractor)..."
                      }
                      className="w-full pl-3 pr-10 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!manualInput.trim()}
                      className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* 6. VOICE LANGUAGE SELECTOR & FOOTER */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-[11px]">
                  <span className="text-stone-400">
                    {isKannada ? "ಮಾತನಾಡುವ ಭಾಷೆ:" : isHindi ? "बोलने की भाषा:" : "Voice Language:"}
                  </span>
                  <div className="flex items-center gap-1">
                    {[
                      { code: "hi", label: "हिन्दी" },
                      { code: "kn", label: "ಕನ್ನಡ" },
                      { code: "hi_en", label: "Hinglish" },
                      { code: "en", label: "English" },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setVoiceLanguage(item.code);
                          setLang(item.code as Lang);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                          voiceLanguage === item.code
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
