"use client"

/**
 * KisaanBuddy Voice Assistant Modal
 *
 * Dedicated, farmer-friendly voice assistant overlay.
 * Features:
 *   - Clean green-and-white high-contrast visual design
 *   - Large animated microphone with pulsing sound wave / ripple animations
 *   - 4 clear status indicators: Ready to speak, Listening, Processing, Responding
 *   - Real-time live speech transcription
 *   - Audible speech response powered by Sarvam TTS / browser speech synthesis
 *   - Language-aware (Hindi, English, Kannada, Hinglish, Marathi, Telugu, etc.)
 *   - Robust error handling for mic permissions, silence, and network issues
 *   - Option to speak again, replay audio, or close
 */

import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import type { Language } from "@/lib/assistant-api"
import { useLanguage, type Lang, LANG_NAMES, SELECTABLE_LANGS } from "@/lib/language"
import { useAssistant } from "./useAssistant"
import { useSpeech } from "./useSpeech"
import { VoiceWaveform } from "./VoiceWaveform"

// Global trigger function to open the Voice Assistant from any component or page
export function openVoiceAssistant(initialQuery?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kisaanbuddy:open-voice", {
        detail: { initialQuery, autoStart: true },
      })
    )
  }
}

// Localized strings for the 4 core assistant states and controls
const VOICE_I18N: Record<
  string,
  {
    title: string
    subtitle: string
    ready: string
    listening: string
    listeningHint: string
    processing: string
    responding: string
    youSaid: string
    assistantSaid: string
    tapToSpeak: string
    tapToStop: string
    speakAgain: string
    listenAgain: string
    stopAudio: string
    close: string
    micDeniedTitle: string
    micDeniedMsg: string
    tryAgain: string
    noSpeechMsg: string
    sampleHint: string
  }
> = {
  hi: {
    title: "किसानबड्डी वॉइस असिस्टेंट",
    subtitle: "बोलकर खेती का कोई भी सवाल पूछें",
    ready: "तैयार हैं — बोलने के लिए माइक दबाएं",
    listening: "सुन रहे हैं... कृपया बोलिए",
    listeningHint: "जैसे: 'गेहूं का मंडी भाव बताओ' या 'पत्ती पर पीले धब्बे हैं'",
    processing: "आपकी बात समझ रहे हैं...",
    responding: "किसानबड्डी जवाब दे रहे हैं...",
    youSaid: "आपका सवाल",
    assistantSaid: "किसानबड्डी सलाह",
    tapToSpeak: "बोलने के लिए दबाएं",
    tapToStop: "रोकने के लिए दबाएं",
    speakAgain: "फिर से बोलें",
    listenAgain: "आवाज़ दोबारा सुनें",
    stopAudio: "आवाज़ बंद करें",
    close: "बंद करें",
    micDeniedTitle: "माइक्रोफ़ोन की अनुमति चाहिए",
    micDeniedMsg: "कृपया अपने ब्राउज़र में माइक्रोफ़ोन की अनुमति (Allow) दें ताकि आप बोल सकें।",
    tryAgain: "पुनः प्रयास करें",
    noSpeechMsg: "कोई आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर दोबारा बोलें।",
    sampleHint: "मंडी भाव, फसल रोग, मौसम या सरकारी योजनाओं के बारे में पूछें",
  },
  en: {
    title: "KisaanBuddy Voice Assistant",
    subtitle: "Speak naturally to get instant farming advice",
    ready: "Ready to speak — Tap the mic to begin",
    listening: "Listening... Please speak now",
    listeningHint: "e.g. 'Wheat mandi price today' or 'Yellow spots on tomato leaves'",
    processing: "आपकी बात समझ रहे हैं / Understanding your question...",
    responding: "KisaanBuddy is responding...",
    youSaid: "Your Question",
    assistantSaid: "KisaanBuddy Advisory",
    tapToSpeak: "Tap to Speak",
    tapToStop: "Tap to Finish",
    speakAgain: "Speak Again",
    listenAgain: "Listen Again",
    stopAudio: "Stop Audio",
    close: "Close",
    micDeniedTitle: "Microphone Access Required",
    micDeniedMsg: "Please allow microphone permission in your browser to speak with KisaanBuddy.",
    tryAgain: "Try Again",
    noSpeechMsg: "No speech detected. Please tap the mic and try speaking again.",
    sampleHint: "Ask about crop diseases, mandi prices, weather forecast, or government schemes",
  },
  kn: {
    title: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್",
    subtitle: "ಮಾತನಾಡಿ ಕೃಷಿ ಸಲಹೆ ಪಡೆಯಿರಿ",
    ready: "ಸಿದ್ಧವಾಗಿದೆ — ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ",
    listeningHint: "ಉದಾ: 'ಗೋಧಿ ಮಂಡಿ ದರ ಎಷ್ಟು?' ಅಥವಾ 'ಎಲೆಯ ಮೇಲೆ ಹಳದಿ ಚುಕ್ಕೆಗಳು'",
    processing: "ನಿಮ್ಮ ಮಾತನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ...",
    responding: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಉತ್ತರಿಸುತ್ತಿದೆ...",
    youSaid: "ನಿಮ್ಮ ಪ್ರಶ್ನೆ",
    assistantSaid: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಸಲಹೆ",
    tapToSpeak: "ಮಾತನಾಡಲು ಒತ್ತಿ",
    tapToStop: "ನಿಲ್ಲಿಸಲು ಒತ್ತಿ",
    speakAgain: "ಮತ್ತೆ ಮಾತನಾಡಿ",
    listenAgain: "ಮತ್ತೆ ಕೇಳಿ",
    stopAudio: "ಶಬ್ದ ನಿಲ್ಲಿಸಿ",
    close: "ಮುಚ್ಚಿ",
    micDeniedTitle: "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ",
    micDeniedMsg: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನೀಡಿ.",
    tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    noSpeechMsg: "ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ ಒತ್ತಿ ಮತ್ತೆ ಮಾತನಾಡಿ.",
    sampleHint: "ಮಾರುಕಟ್ಟೆ ದರ, ಬೆಳೆ ರೋಗ, ಹವಾಮಾನ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ",
  },
  hi_en: {
    title: "KisaanBuddy Voice Assistant",
    subtitle: "Bolkar kheti ka koi bhi sawaal poochhein",
    ready: "Taiyaar hain — Bolne ke liye mic dabayein",
    listening: "Sun rahe hain... Kripya boliye",
    listeningHint: "Jaise: 'Gehun ka mandi bhav' ya 'Tamatar ke patte par daag'",
    processing: "आपकी बात समझ रहे हैं...",
    responding: "KisaanBuddy bol rahe hain...",
    youSaid: "Aapka Sawaal",
    assistantSaid: "KisaanBuddy Advice",
    tapToSpeak: "Bolne ke liye dabayein",
    tapToStop: "Rokne ke liye dabayein",
    speakAgain: "Phir se bolein",
    listenAgain: "Awaaz dobara sunein",
    stopAudio: "Awaaz band karein",
    close: "Band karein",
    micDeniedTitle: "Microphone permission zaroori hai",
    micDeniedMsg: "Kripya browser mein microphone allow karein taaki aap bol sakein.",
    tryAgain: "Dobara koshish karein",
    noSpeechMsg: "Awaaz sunayi nahi di. Kripya mic dabakar dobara bolein.",
    sampleHint: "Mandi bhav, fasal bimari, mausam ya yojanaon ke baare mein poochhein",
  },
}

export function VoiceAssistantModal() {
  const { lang, setLang } = useLanguage()
  const activeLangKey = VOICE_I18N[lang] ? lang : "hi"
  const t = VOICE_I18N[activeLangKey] || VOICE_I18N.hi

  const [isOpen, setIsOpen] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [userTranscript, setUserTranscript] = useState("")
  const [assistantAnswer, setAssistantAnswer] = useState("")
  const [status, setStatus] = useState<"ready" | "listening" | "processing" | "responding" | "error">("ready")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  // Language mapping to assistant Language type
  const currentLang = (lang as Language) || "hi"

  // Assistant hook (streaming AI brain + tools)
  const {
    messages,
    streamingText,
    send,
    cancel,
    isSending,
    lastError: assistantError,
  } = useAssistant({ restore: true })

  // Ref to hold current status for callbacks
  const statusRef = useRef(status)
  statusRef.current = status

  // Speech Recognition & TTS hook
  const handleFinalTranscript = useCallback(
    (text: string) => {
      const clean = text.trim()
      setInterimText("")
      if (!clean) {
        setStatus("ready")
        return
      }
      setUserTranscript(clean)
      setStatus("processing")
      // Send question to KisaanBuddy brain
      void send(clean)
    },
    [send]
  )

  const handleSpeechError = useCallback(
    (msg: string) => {
      setInterimText("")
      const m = (msg || "").toLowerCase()
      if (m.includes("denied") || m.includes("permission") || m.includes("not-allowed")) {
        setStatus("error")
        setErrorMessage(t.micDeniedMsg)
      } else if (m.includes("no-speech")) {
        setStatus("ready")
      } else {
        setStatus("ready")
      }
    },
    [t.micDeniedMsg]
  )

  const speech = useSpeech({
    language: currentLang,
    onFinalTranscript: handleFinalTranscript,
    onInterim: (partial) => {
      setInterimText(partial)
      if (statusRef.current !== "listening") {
        setStatus("listening")
      }
    },
    onError: handleSpeechError,
  })

  // Start listening helper
  const triggerListen = useCallback(async () => {
    setErrorMessage(null)
    setInterimText("")
    speech.stopSpeaking()
    setStatus("listening")
    const ok = await speech.startListening()
    if (!ok && !speech.speechSupported) {
      setStatus("error")
      setErrorMessage(t.micDeniedMsg)
    }
  }, [speech, t.micDeniedMsg])

  // Stop listening helper
  const handleStopListen = useCallback(() => {
    speech.stopListening()
    if (interimText) {
      handleFinalTranscript(interimText)
    }
  }, [speech, interimText, handleFinalTranscript])

  // Toggle mic button action
  const handleMicToggle = useCallback(() => {
    if (speech.listening) {
      handleStopListen()
    } else if (speech.speaking) {
      speech.stopSpeaking()
      setStatus("ready")
    } else {
      void triggerListen()
    }
  }, [speech, handleStopListen, triggerListen])

  // Listen for global open event
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ initialQuery?: string; autoStart?: boolean }>
      setIsOpen(true)
      setErrorMessage(null)
      setUserTranscript("")
      setAssistantAnswer("")

      if (customEvent.detail?.initialQuery) {
        const q = customEvent.detail.initialQuery
        setUserTranscript(q)
        setStatus("processing")
        void send(q)
      } else {
        // Automatically start listening right after modal mount
        const timer = setTimeout(() => {
          void triggerListen()
        }, 300)
        return () => clearTimeout(timer)
      }
    }

    window.addEventListener("kisaanbuddy:open-voice", handleOpen)
    return () => window.removeEventListener("kisaanbuddy:open-voice", handleOpen)
  }, [triggerListen, send])

  // Close modal handler
  const handleClose = useCallback(() => {
    speech.stopListening()
    speech.stopSpeaking()
    cancel()
    setIsOpen(false)
    setStatus("ready")
    setInterimText("")
    setErrorMessage(null)
  }, [speech, cancel])

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, handleClose])

  // Watch streaming assistant response
  useEffect(() => {
    if (!isOpen) return

    if (isSending) {
      setStatus("processing")
      if (streamingText) {
        setAssistantAnswer(streamingText)
      }
    } else {
      // Find latest assistant reply
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant" && !last.streaming && last.content) {
        setAssistantAnswer(last.content)
        setStatus("responding")
        // Speak response aloud automatically
        const spokenLang = (last.language ?? currentLang) as Language
        speech.speak(last.content, spokenLang)
      }
    }
  }, [isSending, streamingText, messages, isOpen, currentLang, speech])

  // Sync assistant errors
  useEffect(() => {
    if (assistantError && isOpen) {
      setStatus("error")
      setErrorMessage(assistantError)
    }
  }, [assistantError, isOpen])

  // Update status when speech finishes
  useEffect(() => {
    if (status === "responding" && !speech.speaking && !isSending) {
      // Return to ready state once audio has completed playing
      const timer = setTimeout(() => {
        if (statusRef.current === "responding") {
          setStatus("ready")
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [speech.speaking, status, isSending])

  // Replay speech
  const handleReplaySpeech = () => {
    if (!assistantAnswer) return
    if (speech.speaking) {
      speech.stopSpeaking()
    } else {
      speech.speak(assistantAnswer, currentLang)
    }
  }

  // Switch language
  const handleSelectLanguage = (l: Lang) => {
    setLang(l)
    setIsLangMenuOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-assistant-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border-2 border-emerald-500/20 dark:border-emerald-500/30 overflow-hidden flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header with KisaanBuddy Branding & Controls */}
            <div className="relative flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner">
                  <Sparkles className="h-5 w-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      id="voice-assistant-title"
                      className="text-base sm:text-lg font-black tracking-tight text-white leading-none"
                    >
                      {t.title}
                    </h2>
                    <span className="rounded-full bg-emerald-500/30 border border-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                      AI Voice
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                    {t.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLangMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-xs font-bold text-white transition-colors border border-white/20"
                    title="Change language"
                  >
                    <span>{LANG_NAMES[lang] || "Language"}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                  </button>

                  {isLangMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white dark:bg-stone-800 shadow-xl border border-stone-200 dark:border-stone-700 py-1.5 z-20 animate-in fade-in zoom-in-95">
                      {SELECTABLE_LANGS.slice(0, 5).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => handleSelectLanguage(l)}
                          className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-stone-700 transition-colors ${
                            lang === l
                              ? "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50"
                              : "text-stone-700 dark:text-stone-200"
                          }`}
                        >
                          <span>{LANG_NAMES[l]}</span>
                          {lang === l && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={t.close}
                  className="rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Body */}
            <div className="p-5 sm:p-7 flex flex-col items-center text-center">
              {/* Dynamic Status Banner */}
              <div className="mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition-all shadow-xs">
                {status === "listening" ? (
                  <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                    </span>
                    {t.listening}
                  </span>
                ) : status === "processing" ? (
                  <span className="flex items-center gap-2 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-300 dark:border-amber-700">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    {t.processing}
                  </span>
                ) : status === "responding" ? (
                  <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                    <Volume2 className="h-4 w-4 text-emerald-600 animate-pulse" />
                    {t.responding}
                  </span>
                ) : status === "error" ? (
                  <span className="flex items-center gap-2 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 px-4 py-1.5 rounded-full border border-rose-300 dark:border-rose-700">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    {errorMessage || t.noSpeechMsg}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-4 py-1.5 rounded-full border border-stone-200 dark:border-stone-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {t.ready}
                  </span>
                )}
              </div>

              {/* Large Animated Microphone Section */}
              <div className="relative my-2 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Concentric subtle ripples ONLY when actually recording */}
                  {speech.listening && (
                    <>
                      <span className="absolute h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-emerald-500/20 animate-ping opacity-60 motion-reduce:animate-none" />
                      <span className="absolute h-48 w-48 sm:h-56 sm:w-56 rounded-full bg-emerald-400/15 animate-pulse opacity-50 motion-reduce:animate-none" />
                    </>
                  )}

                  {/* Primary Mic Touch Target with Idle Breathing Pulse */}
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    aria-label={speech.listening ? t.tapToStop : t.tapToSpeak}
                    className={`group relative z-10 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 cursor-pointer ${
                      speech.listening
                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 ring-rose-400 scale-105"
                        : speech.speaking
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-emerald-400 animate-pulse"
                        : isSending
                        ? "bg-amber-600 text-white shadow-amber-600/30 ring-amber-400 cursor-wait"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/30 ring-emerald-400 animate-voice-idle hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isSending ? (
                      <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-white" />
                    ) : speech.listening ? (
                      <MicOff className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    ) : speech.speaking ? (
                      <Volume2 className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    ) : (
                      <Mic className="h-10 w-10 sm:h-12 sm:w-12 text-white stroke-[2.3]" />
                    )}
                  </button>
                </div>

                {/* Sound-wave animation active ONLY when recording; stops immediately when recording stops */}
                <div className="h-10 mt-3 flex items-center justify-center">
                  {speech.listening ? (
                    <div className="flex flex-col items-center gap-1">
                      <VoiceWaveform active={true} />
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{t.tapToStop}</span>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm font-semibold text-stone-500 dark:text-stone-400">
                      {speech.speaking ? t.stopAudio : t.tapToSpeak}
                    </p>
                  )}
                </div>
              </div>

              {(interimText || userTranscript) && (
                <div className="mt-5 w-full rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200/90 dark:border-stone-700/80 p-3.5 sm:p-4 text-left shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                    <Mic className="h-3 w-3" />
                    <span>{t.youSaid}:</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                    {userTranscript}
                    {interimText && (
                      <span className="text-emerald-600 dark:text-emerald-400 italic font-medium ml-1">
                        {interimText}...
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Assistant Answer Container */}
              {assistantAnswer && (
                <div className="mt-3 w-full rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/70 p-4 text-left shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.assistantSaid}:</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleReplaySpeech}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-white/70 dark:bg-stone-800/80 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 transition-colors"
                      title={speech.speaking ? t.stopAudio : t.listenAgain}
                    >
                      {speech.speaking ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 text-rose-600" />
                          <span className="text-rose-600">{t.stopAudio}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{t.listenAgain}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line font-normal">
                    {assistantAnswer}
                  </p>
                </div>
              )}

              {/* Error Recovery Card */}
              {status === "error" && (
                <div className="mt-4 w-full rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 text-left">
                  <p className="text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-200 mb-3">
                    {errorMessage || t.noSpeechMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => void triggerListen()}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{t.tryAgain}</span>
                  </button>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full pt-2 border-t border-stone-100 dark:border-stone-800">
                {assistantAnswer && (
                  <button
                    type="button"
                    onClick={() => void triggerListen()}
                    className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md active:scale-98 transition-all"
                  >
                    <Mic className="h-4 w-4" />
                    <span>{t.speakAgain}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 px-5 py-3 text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>{t.close}</span>
                </button>
              </div>

              {/* Farmer helper hint */}
              <p className="mt-3 text-[11px] text-stone-400 dark:text-stone-500 text-center">
                {t.sampleHint}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
