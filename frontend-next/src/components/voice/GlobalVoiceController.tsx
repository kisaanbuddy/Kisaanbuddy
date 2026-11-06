"use client";

import React, { useState } from "react";
import { useVoice } from "@/lib/voice/VoiceContext";
import { useLanguage, type Lang, LANG_NAMES } from "@/lib/language";
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
  Radio,
  Layers,
  ArrowRight,
} from "lucide-react";

export function GlobalVoiceController() {
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
  } = useVoice();

  const { lang, setLang } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);

  const isHindi = voiceLanguage === "hi" || voiceLanguage === "hi_en";
  const isKannada = voiceLanguage === "kn";

  // Contextual command suggestions based on active route
  const getContextualTips = () => {
    if (currentRoute.includes("/marketplace")) {
      return isKannada
        ? ["ಎರಡನೇ ಉತ್ಪನ್ನ ತೆರೆಯಿರಿ", "ಕಡಿಮೆ ಬೆಲೆಯ ಉತ್ಪನ್ನಗಳನ್ನು ತೋರಿಸಿ", "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ", "ಆರ್ಡರ್ ಮಾಡಿ"]
        : isHindi
        ? ["दूसरा प्रोडक्ट खोलो", "सस्ते उत्पाद दिखाओ", "कार्ट में जोड़ो", "ऑर्डर कर दो"]
        : ["Open the second product", "Show cheaper products", "Add to cart", "Place order"];
    }
    if (currentRoute.includes("/mandi")) {
      return isKannada
        ? ["ಗೋಧಿ ಮಂಡಿ ದರ ಎಷ್ಟು?", "ಕರ್ನಾಟಕ ಮಂಡಿ ತೋರಿಸಿ", "ಹಿಂದಕ್ಕೆ ಹೋಗಿ"]
        : isHindi
        ? ["गेहूं का मंडी भाव बताओ", "करनाल मंडी दिखाओ", "सब्जियों के भाव"]
        : ["Wheat mandi price", "Karnal mandi rates", "Go back"];
    }
    if (currentRoute.includes("/weather")) {
      return isKannada
        ? ["ನಾಳೆ ಮಳೆ ಬರುತ್ತದೆಯೇ?", "ಇಂದಿನ ತಾಪಮಾನ ಎಷ್ಟು?"]
        : isHindi
        ? ["कल बारिश होगी क्या?", "आज का मौसम कैसा रहेगा?"]
        : ["Will it rain tomorrow?", "Show 5-day forecast"];
    }
    if (currentRoute.includes("/disease")) {
      return isKannada
        ? ["ಎಲೆಯ ಮೇಲೆ ಹಳದಿ ಚುಕ್ಕೆಗಳು ಇವೆ", "ಟೊಮೆಟೊ ರೋಗ ಪರಿಹಾರ"]
        : isHindi
        ? ["पत्ती पर पीले धब्बे हैं", "गेहूं में रतुआ रोग की दवा"]
        : ["Yellow spots on leaves", "Tomato blight cure"];
    }
    if (currentRoute.includes("/worker-connect")) {
      return isKannada
        ? ["ಟ್ರ್ಯಾಕ್ಟರ್ ಚಾಲಕರನ್ನು ತೋರಿಸಿ", "ಕಾರ್ಮಿಕರ ಪಟ್ಟಿ"]
        : isHindi
        ? ["ट्रैक्टर ड्राइवर ढूंढो", "कटाई के लिए मजदूर दिखाओ"]
        : ["Find tractor drivers", "Show harvesting labour"];
    }
    if (currentRoute.includes("/orders")) {
      return isKannada
        ? ["ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಿ", "ಕಾರ್ಟ್ ತೆರವುಗೊಳಿಸಿ", "ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗಿ"]
        : isHindi
        ? ["ऑर्डर कन्फर्म करो", "कार्ट खाली करो", "मार्केटप्लेस खोलो"]
        : ["Confirm order", "Clear cart", "Open marketplace"];
    }
    // Global fallback
    return isKannada
      ? ["ಮಾರುಕಟ್ಟೆ ತೆರೆಯಿರಿ", "ಮಂಡಿ ದರ ತೋರಿಸಿ", "ಡಾರ್ಕ್ ಮೋಡ್ ಆನ್ ಮಾಡಿ", "ಕನ್ನಡ ಭಾಷೆ ಮಾಡಿ"]
      : isHindi
      ? ["मार्केटप्लेस खोलो", "मंडी भाव दिखाओ", "डार्क मोड ऑन करो", "कन्नड़ भाषा करो"]
      : ["Open marketplace", "Show mandi prices", "Turn on dark mode", "Change language to Kannada"];
  };

  const tips = getContextualTips();

  return (
    <>
      {/* ─── 1. PERSISTENT FLOATING MICROPHONE BUTTON (GLOBAL) ─── */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end gap-2 pointer-events-auto">
        {/* Continuous mode badge */}
        {continuousMode && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-800 text-white shadow-md animate-pulse border border-emerald-400">
            {isKannada ? "ಆಟೋ-ಲಿಸನ್ ಸಕ್ರಿಯ" : isHindi ? "ऑटो-लिसन चालू" : "Auto-Listen Active"}
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            if (isListening) {
              stopListening();
            } else {
              void startListening();
            }
          }}
          aria-label={isListening ? "Stop voice listening" : "Start KisaanBuddy voice control"}
          title={isListening ? "Listening... Tap to stop" : "Speak to control entire website"}
          className={`relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 ${
            isListening
              ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-400/50 scale-105"
              : isSpeaking
              ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-400/50"
              : "bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-white/30 hover:scale-105"
          }`}
        >
          {/* Animated decibel ripples based on real volume */}
          {isListening && (
            <span
              className="absolute inset-0 rounded-full bg-red-500 pointer-events-none transition-transform duration-75"
              style={{
                transform: `scale(${1 + (audioVolume / 100) * 0.6})`,
                opacity: 0.3 + (audioVolume / 100) * 0.4,
              }}
            />
          )}

          {isSpeaking && (
            <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/40 pointer-events-none" />
          )}

          {isListening ? (
            <Square className="w-6 h-6 fill-current animate-pulse z-10" />
          ) : (
            <Mic className="w-6 h-6 md:w-7 md:h-7 z-10" />
          )}
        </button>
      </div>

      {/* ─── 2. EXPANDED VOICE HUD DOCK (HIGH CONTRAST & RESPONSIVE) ─── */}
      {isHudOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[55] px-2 sm:px-4 pb-2 md:pb-4 pointer-events-none">
          <div className="max-w-2xl mx-auto bg-stone-900/95 dark:bg-stone-950/95 text-white rounded-2xl shadow-2xl border border-stone-700/80 backdrop-blur-xl pointer-events-auto overflow-hidden transition-all duration-300">
            {/* Top Bar / Status */}
            <div className="px-4 py-2.5 bg-stone-800/80 border-b border-stone-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isListening
                      ? "bg-red-500 animate-ping"
                      : isSpeaking
                      ? "bg-emerald-400 animate-pulse"
                      : isProcessing
                      ? "bg-amber-400 animate-spin"
                      : "bg-emerald-500"
                  }`}
                />
                <span className="text-xs font-bold tracking-wide text-stone-200">
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
                      ? "आदेश समझ रहे हैं..."
                      : "Processing command..."
                    : isSpeaking
                    ? isKannada
                      ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಉತ್ತರಿಸುತ್ತಿದೆ..."
                      : isHindi
                      ? "किसानबड्डी बोल रहे हैं..."
                      : "KisaanBuddy is speaking..."
                    : isKannada
                    ? "ವಾಯ್ಸ್ ಕಂಟ್ರೋಲ್ ಸಿದ್ಧವಾಗಿದೆ"
                    : isHindi
                    ? "वॉइस कंट्रोल तैयार है"
                    : "Voice Control Ready"}
                </span>

                {/* Real decibel visualizer bar */}
                {isListening && (
                  <div className="flex items-center gap-0.5 ml-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="w-1 bg-red-400 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(4, Math.min(18, (audioVolume / 100) * 20 * (i * 0.35)))}px`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* HUD Controls */}
              <div className="flex items-center gap-1.5">
                {/* Continuous toggle */}
                <button
                  type="button"
                  onClick={toggleContinuousMode}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                    continuousMode
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                  }`}
                  title="Auto-listen again after AI responds"
                >
                  {isKannada ? "ಆಟೋ-ಲಿಸನ್" : isHindi ? "ऑटो-लिसन" : "Continuous"}
                </button>

                {/* Minimize / Expand */}
                <button
                  type="button"
                  onClick={() => setIsMinimized((v) => !v)}
                  className="p-1 rounded text-stone-400 hover:text-white"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Close HUD */}
                <button
                  type="button"
                  onClick={() => {
                    cancelListening();
                    stopAudio();
                    setIsHudOpen(false);
                  }}
                  className="p-1 rounded text-stone-400 hover:text-white"
                  title="Close HUD"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Body (if not minimized) */}
            {!isMinimized && (
              <div className="p-4 space-y-3">
                {/* A. Live Farmer Utterance Display */}
                {transcriptLive && (
                  <div className="p-2.5 rounded-xl bg-stone-800/90 border border-stone-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                      {isKannada ? "ನೀವು ಹೇಳಿದ್ದು:" : isHindi ? "आपने कहा:" : "You said:"}
                    </span>
                    <p className="text-sm font-semibold text-emerald-300">"{transcriptLive}"</p>
                  </div>
                )}

                {/* B. AI Spoken Response Display */}
                {lastReply && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      {isKannada ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಉತ್ತರ:" : isHindi ? "किसानबड्डी जवाब:" : "KisaanBuddy Response:"}
                    </span>
                    <p className="text-sm font-medium text-stone-100 leading-relaxed">{lastReply}</p>

                    {/* Audio Playback Toolbar */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-900/40">
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
                        <span>{isKannada ? "ಮತ್ತೆ ಕೇಳಿ" : isHindi ? "दोबारा सुनें" : "Replay"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={stopAudio}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>{isKannada ? "ನಿಲ್ಲಿಸಿ" : isHindi ? "बंद करें" : "Stop"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAudioMuted(!audioMuted)}
                        className={`p-1.5 rounded-lg text-xs ml-auto ${
                          audioMuted ? "bg-red-900/50 text-red-300" : "bg-stone-800 text-stone-300"
                        }`}
                        title={audioMuted ? "Unmute audio" : "Mute audio"}
                      >
                        {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* C. CRITICAL CONFIRMATION BANNER (HIGH SAFETY GATES) */}
                {pendingConfirmation && (
                  <div className="p-3.5 rounded-xl bg-amber-950/80 border-2 border-amber-500/80 text-white space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>{isKannada ? "ದೃಢೀಕರಣದ ಅಗತ್ಯವಿದೆ" : isHindi ? "स्पष्ट पुष्टि आवश्यक है" : "Confirmation Required"}</span>
                    </div>

                    <p className="text-sm font-semibold text-stone-100">
                      {pendingConfirmation.type === "PLACE_ORDER"
                        ? isKannada
                          ? `ನೀವು ₹${pendingConfirmation.total_amount?.toLocaleString("en-IN")} ಮೌಲ್ಯದ ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಲು ಬಯಸುವಿರಾ? 'ಹೌದು' ಅಥವಾ 'ಬೇಡ' ಎಂದು ಹೇಳಿ.`
                          : isHindi
                          ? `क्या आप ₹${pendingConfirmation.total_amount?.toLocaleString("en-IN")} का यह ऑर्डर प्लेस करना चाहते हैं? 'हाँ' या 'नहीं' बोलें।`
                          : `Confirm placing this order for ₹${pendingConfirmation.total_amount?.toLocaleString("en-IN")}? Say 'Confirm' or 'Cancel'.`
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

                {/* D. CONTEXTUAL COMMAND SUGGESTIONS */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-semibold mb-1.5">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>{isKannada ? "ಈ ಪುಟದಲ್ಲಿ ನೀವು ಹೇಳಬಹುದು:" : isHindi ? "इस पेज पर बोलें:" : "Try saying:"}</span>
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">{currentRoute}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tips.map((tip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          void startListening();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700/50 transition-colors"
                      >
                        "{tip}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Switcher Row */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-[11px]">
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
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          voiceLanguage === item.code
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-800 text-stone-400 hover:text-stone-200"
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
