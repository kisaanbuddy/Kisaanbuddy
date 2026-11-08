"use client";

import React, { useState } from "react";
import { useVoice } from "@/lib/voice/VoiceContext";
import { useLanguage } from "@/lib/language";
import {
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
  Check,
} from "lucide-react";

/**
 * GlobalVoiceController
 * Handles global voice confirmations and global spoken audio playback.
 * Does NOT render any separate floating mic button at the bottom-right corner.
 */
export function GlobalVoiceController() {
  const {
    isSpeaking,
    lastReply,
    pendingConfirmation,
    audioMuted,
    pauseAudio,
    resumeAudio,
    stopAudio,
    replayAudio,
    setAudioMuted,
    confirmPendingAction,
    cancelPendingAction,
  } = useVoice();

  const { lang } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  const isHindi = lang === "hi";
  const isKannada = lang === "kn";

  // Only render if there is an active pending confirmation (e.g., placing an order)
  // or active global audio reply playing that the farmer might want to pause/stop
  if (pendingConfirmation) {
    return (
      <div className="fixed bottom-6 right-4 sm:right-6 z-[60] max-w-sm pointer-events-auto">
        <div className="p-4 rounded-2xl bg-amber-950/95 border-2 border-amber-500/80 text-white space-y-2 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{isKannada ? "ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ" : isHindi ? "पुष्टि आवश्यक है" : "Confirmation Required"}</span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-stone-100">
            {pendingConfirmation.type === "PLACE_ORDER"
              ? `₹${pendingConfirmation.total_amount?.toLocaleString("en-IN")} का ऑर्डर कन्फर्म करें? 'हाँ' या 'नहीं' बोलें।`
              : "इस क्रिया की पुष्टि के लिए 'हाँ' या रद्द करने के लिए 'नहीं' बोलें।"}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={confirmPendingAction}
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isKannada ? "ಹೌದು" : isHindi ? "हाँ, कन्फर्म" : "Confirm"}</span>
            </button>
            <button
              type="button"
              onClick={cancelPendingAction}
              className="flex-1 py-1.5 px-3 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isKannada ? "ಬೇಡ" : isHindi ? "नहीं, रद्द" : "Cancel"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Non-intrusive floating audio player when KisaanBuddy is speaking
  if (isSpeaking && !dismissed && lastReply) {
    return (
      <div className="fixed bottom-6 right-4 sm:right-6 z-[60] max-w-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
        <div className="p-3 rounded-2xl bg-stone-950/95 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-xl space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isKannada ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಉತ್ತರಿಸುತ್ತಿದೆ..." : isHindi ? "किसानबड्डी बोल रहे हैं..." : "KisaanBuddy Speaking..."}</span>
            </span>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-stone-200 line-clamp-2">{lastReply}</p>

          <div className="flex items-center gap-2 pt-1 border-t border-stone-800 text-xs">
            <button
              type="button"
              onClick={pauseAudio}
              className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 font-semibold flex items-center gap-1"
            >
              <Pause className="w-3 h-3" />
              <span>{isKannada ? "ವಿರಾಮ" : isHindi ? "रोकें" : "Pause"}</span>
            </button>
            <button
              type="button"
              onClick={replayAudio}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isKannada ? "ಮತ್ತೆ" : isHindi ? "दोबारा" : "Replay"}</span>
            </button>
            <button
              type="button"
              onClick={stopAudio}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              <span>{isKannada ? "ನಿಲ್ಲಿಸಿ" : isHindi ? "बंद" : "Stop"}</span>
            </button>
            <button
              type="button"
              onClick={() => setAudioMuted(!audioMuted)}
              className={`p-1 rounded text-xs ml-auto ${
                audioMuted ? "bg-red-900/50 text-red-300" : "bg-stone-800 text-stone-300"
              }`}
            >
              {audioMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
