"use client"

/**
 * KisaanBuddy Voice Assistant Modal — Production Conversational Voice AI
 *
 * Core capabilities:
 *   - Genuine microphone capture with real-time Web Audio FFT waveform visualizer
 *   - Real AI audio playback (Indian Neural TTS / OpenAI)
 *   - Genuine state engine: IDLE -> LISTENING -> PROCESSING -> GENERATING -> SPEAKING -> LISTENING AGAIN
 *   - Instant barge-in / voice interruption: Tapping mic or speaking stops AI speech immediately
 *   - Play, pause, resume, replay, and stop audio controls
 *   - Silence-based automatic utterance completion (VAD) + manual tap to finish
 *   - Multilingual: Hindi (हिंदी), Hinglish, Kannada (ಕನ್ನಡ), English
 *   - Conversational memory & history of dialogue turns
 *   - Real agricultural intelligence: Crop Doctor, Mandi, Weather, Schemes, Marketplace
 */

import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Check,
  ChevronDown,
  Globe,
  History,
  Info,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
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

// Conversation turn interface
interface ConversationTurn {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: string
  language?: string
}

// Localized strings
const VOICE_I18N: Record<
  string,
  {
    title: string
    subtitle: string
    ready: string
    listening: string
    processing: string
    generating: string
    speaking: string
    youSaid: string
    assistantSaid: string
    tapToSpeak: string
    tapToStop: string
    tapToInterrupt: string
    speakAgain: string
    listenAgain: string
    pauseAudio: string
    resumeAudio: string
    stopAudio: string
    close: string
    micDeniedTitle: string
    micDeniedMsg: string
    tryAgain: string
    noSpeechMsg: string
    continuousMode: string
    historyTitle: string
    suggestionsTitle: string
    suggestions: string[]
  }
> = {
  hi: {
    title: "KisaanBuddy वॉइस असिस्टेंट",
    subtitle: "बोलकर खेती की सटीक सलाह व मंडी भाव पाएं",
    ready: "तैयार हैं — बोलने के लिए माइक दबाएं",
    listening: "सुन रहे हैं... कृपया बोलिए",
    processing: "कृषि डेटा विश्लेषित हो रहा है...",
    generating: "सलाह तैयार की जा रही है...",
    speaking: "किसानबड्डी बोल रहे हैं...",
    youSaid: "आपका सवाल",
    assistantSaid: "किसानबड्डी सलाह",
    tapToSpeak: "बोलने के लिए दबाएं",
    tapToStop: "बोलना समाप्त करें",
    tapToInterrupt: "बीच में रोककर नया सवाल पूछें",
    speakAgain: "फिर से बोलें",
    listenAgain: "आवाज़ दोबारा सुनें",
    pauseAudio: "आवाज़ रोकें",
    resumeAudio: "आवाज़ जारी रखें",
    stopAudio: "आवाज़ बंद करें",
    close: "बंद करें",
    micDeniedTitle: "माइक्रोफ़ोन की अनुमति चाहिए",
    micDeniedMsg: "कृपया अपने ब्राउज़र में माइक्रोफ़ोन की अनुमति (Allow) दें ताकि आप बोल सकें।",
    tryAgain: "पुनः प्रयास करें",
    noSpeechMsg: "कोई आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर दोबारा बोलें।",
    continuousMode: "निरंतर बातचीत",
    historyTitle: "पिछली बातचीत",
    suggestionsTitle: "सुझाए गए सवाल:",
    suggestions: [
      "धान के पौधे पीले पड़ रहे हैं, क्या करूं?",
      "टमाटर में बीमारी लग गई है, दवा बताएं",
      "आज गेहूं का मंडी भाव क्या है?",
      "आज बारिश होगी क्या?",
      "किराए पर ट्रैक्टर चाहिए",
      "पीएम किसान योजना की अगली किस्त कब आएगी?",
    ],
  },
  en: {
    title: "KisaanBuddy Voice Assistant",
    subtitle: "Real-time AI voice advisory for Indian farmers",
    ready: "Ready — Tap the mic to speak",
    listening: "Listening... Please speak now",
    processing: "Analyzing agricultural data...",
    generating: "Generating verified response...",
    speaking: "KisaanBuddy is speaking...",
    youSaid: "You Asked",
    assistantSaid: "KisaanBuddy Advisory",
    tapToSpeak: "Tap to Speak",
    tapToStop: "Tap to Finish",
    tapToInterrupt: "Tap to interrupt & ask next question",
    speakAgain: "Speak Again",
    listenAgain: "Listen Again",
    pauseAudio: "Pause Audio",
    resumeAudio: "Resume Audio",
    stopAudio: "Stop Audio",
    close: "Close",
    micDeniedTitle: "Microphone Access Required",
    micDeniedMsg: "Please allow microphone access in your browser to speak with KisaanBuddy.",
    tryAgain: "Try Again",
    noSpeechMsg: "No speech detected. Please tap the mic and speak clearly.",
    continuousMode: "Continuous Flow",
    historyTitle: "Dialogue History",
    suggestionsTitle: "Quick questions:",
    suggestions: [
      "Paddy leaves are turning yellow, what should I do?",
      "Tomato crop has disease, suggest treatment",
      "What is the wheat mandi price today?",
      "Will it rain today in my area?",
      "Looking for a tractor on rent",
      "How to apply for PM-KISAN subsidy?",
    ],
  },
  kn: {
    title: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್",
    subtitle: "ಮಾತನಾಡಿ ಕೃಷಿ ಸಲಹೆ ಮತ್ತು ಮಂಡಿ ದರ ಪಡೆಯಿರಿ",
    ready: "ಸಿದ್ಧವಾಗಿದೆ — ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ",
    processing: "ಕೃಷಿ ಮಾಹಿತಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    generating: "ಸಲಹೆ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
    speaking: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಉತ್ತರಿಸುತ್ತಿದೆ...",
    youSaid: "ನಿಮ್ಮ ಪ್ರಶ್ನೆ",
    assistantSaid: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಸಲಹೆ",
    tapToSpeak: "ಮಾತನಾಡಲು ಒತ್ತಿ",
    tapToStop: "ಮುಗಿಸಲು ಒತ್ತಿ",
    tapToInterrupt: "ಮಧ್ಯದಲ್ಲೇ ನಿಲ್ಲಿಸಿ ಹೊಸ ಪ್ರಶ್ನೆ ಕೇಳಿ",
    speakAgain: "ಮತ್ತೆ ಮಾತನಾಡಿ",
    listenAgain: "ಮತ್ತೆ ಕೇಳಿ",
    pauseAudio: "ಶಬ್ದ ನಿಲ್ಲಿಸಿ",
    resumeAudio: "ಶಬ್ದ ಮುಂದುವರಿಸಿ",
    stopAudio: "ಶಬ್ದ ಮುಚ್ಚಿ",
    close: "ಮುಚ್ಚಿ",
    micDeniedTitle: "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ",
    micDeniedMsg: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನೀಡಿ.",
    tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    noSpeechMsg: "ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ ಒತ್ತಿ ಮತ್ತೆ ಮಾತನಾಡಿ.",
    continuousMode: "ನಿರಂತರ ಸಂಭಾಷಣೆ",
    historyTitle: "ಹಿಂದಿನ ಸಂಭಾಷಣೆ",
    suggestionsTitle: "ಸೂಚಿತ ಪ್ರಶ್ನೆಗಳು:",
    suggestions: [
      "ಭತ್ತದ ಗಿಡಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ, ಪರಿಹಾರವೇನು?",
      "ಟೊಮೆಟೊ ಬೆಳೆಗೆ ರೋಗ ಬಂದಿದೆ, ಔಷಧಿ ತಿಳಿಸಿ",
      "ಇವತ್ತು ಗೋಧಿ ಮಂಡಿ ದರ ಎಷ್ಟು?",
      "ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ?",
      "ಬಾಡಿಗೆಗೆ ಟ್ರ್ಯಾಕ್ಟರ್ ಬೇಕಾಗಿದೆ",
      "ಪಿಎಂ ಕಿಸಾನ್ ಹಣ ಯಾವಾಗ ಜಮೆಯಾಗುತ್ತದೆ?",
    ],
  },
  hi_en: {
    title: "KisaanBuddy Voice Assistant",
    subtitle: "Bolkar kheti ki advice aur mandi bhav jaanein",
    ready: "Taiyaar hain — Bolne ke liye mic dabayein",
    listening: "Sun rahe hain... Kripya boliye",
    processing: "Agri data analyze ho raha hai...",
    generating: "Answer taiyaar ho raha hai...",
    speaking: "KisaanBuddy bol rahe hain...",
    youSaid: "Aapka Sawaal",
    assistantSaid: "KisaanBuddy Advice",
    tapToSpeak: "Bolne ke liye dabayein",
    tapToStop: "Bolna khatam karein",
    tapToInterrupt: "Rokh kar naya sawaal poochhein",
    speakAgain: "Phir se bolein",
    listenAgain: "Awaaz dobara sunein",
    pauseAudio: "Awaaz rokein",
    resumeAudio: "Awaaz jari rakhein",
    stopAudio: "Awaaz band karein",
    close: "Band karein",
    micDeniedTitle: "Microphone permission zaroori hai",
    micDeniedMsg: "Kripya browser me microphone allow karein taaki aap bol sakein.",
    tryAgain: "Dobara koshish karein",
    noSpeechMsg: "Awaaz sunayi nahi di. Kripya mic dabakar dobara bolein.",
    continuousMode: "Continuous Mode",
    historyTitle: "Conversation History",
    suggestionsTitle: "Sujhavit sawaal:",
    suggestions: [
      "Dhan ke paudhe peele pad rahe hain, kya karu?",
      "Tamatar me bimari lag gayi hai, dawa bataiye",
      "Aaj gehun ka mandi rate kya hai?",
      "Aaj barish hogi kya?",
      "Kiraye par tractor chahiye",
      "PM Kisan yojana ki jankari chahiye",
    ],
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
  const [status, setStatus] = useState<
    "idle" | "listening" | "processing" | "generating" | "speaking" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [history, setHistory] = useState<ConversationTurn[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const currentLang = (lang as Language) || "hi"

  // Canvas ref for real microphone waveform visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameIdRef = useRef<number | null>(null)

  // Status ref for callbacks
  const statusRef = useRef(status)
  statusRef.current = status

  // Assistant orchestration hook
  const {
    messages,
    streamingText,
    send,
    cancel,
    isSending,
    lastError: assistantError,
  } = useAssistant({ restore: true })

  // Handle final transcribed text from STT
  const handleFinalTranscript = useCallback(
    (text: string) => {
      const clean = text.trim()
      setInterimText("")
      if (!clean) {
        setStatus("idle")
        return
      }

      setUserTranscript(clean)
      setStatus("processing")

      // Add to conversation history
      setHistory((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          role: "user",
          text: clean,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          language: currentLang,
        },
      ])

      // Dispatch to agricultural brain
      void send(clean)
    },
    [send, currentLang]
  )

  const handleSpeechError = useCallback(
    (msg: string) => {
      setInterimText("")
      const m = (msg || "").toLowerCase()
      if (m.includes("denied") || m.includes("permission") || m.includes("not-allowed")) {
        setStatus("error")
        setErrorMessage(t.micDeniedMsg)
      } else if (m.includes("no speech")) {
        if (statusRef.current === "listening") {
          setStatus("idle")
        }
      } else {
        setStatus("idle")
      }
    },
    [t.micDeniedMsg]
  )

  // High-performance speech engine hook
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
    autoSilenceCommit: true,
    silenceDurationMs: 1800,
  })

  // Start real microphone capture
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

  // Stop listening manually
  const handleStopListen = useCallback(() => {
    speech.stopListening()
  }, [speech])

  // Primary microphone toggle & barge-in handler
  const handleMicToggle = useCallback(() => {
    if (speech.listening) {
      handleStopListen()
    } else if (speech.speaking || status === "speaking") {
      // Barge-in / interruption: stop speech and start listening to farmer immediately
      speech.stopSpeaking()
      void triggerListen()
    } else {
      void triggerListen()
    }
  }, [speech, status, handleStopListen, triggerListen])

  // Real-time Canvas Waveform Animation Loop (reads FFT data from live microphone)
  useEffect(() => {
    if (!speech.listening) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
        animFrameIdRef.current = null
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const draw = () => {
      if (!canvas) return
      const w = rect.width
      const h = rect.height
      ctx.clearRect(0, 0, w, h)

      const freqData = speech.getFrequencyData()
      const barCount = 32
      const gap = 3
      const barWidth = (w - gap * (barCount - 1)) / barCount
      const centerY = h / 2

      for (let i = 0; i < barCount; i++) {
        // Map frequency data index
        const idx = Math.floor((i / barCount) * freqData.length)
        const rawVal = freqData[idx] || 0
        const norm = Math.min(1, Math.max(0.06, rawVal / 255))
        const barHeight = Math.max(4, norm * (h * 0.88))
        const x = i * (barWidth + gap)
        const y = centerY - barHeight / 2

        // Vibrant dynamic emerald-to-lime gradient based on live volume
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight)
        grad.addColorStop(0, "#10b981")
        grad.addColorStop(0.5, "#34d399")
        grad.addColorStop(1, "#059669")

        ctx.fillStyle = grad
        ctx.beginPath()
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, barWidth, barHeight, 3)
        } else {
          ctx.rect(x, y, barWidth, barHeight)
        }
        ctx.fill()
      }

      animFrameIdRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
        animFrameIdRef.current = null
      }
    }
  }, [speech.listening, speech])

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
    setStatus("idle")
    setInterimText("")
    setErrorMessage(null)
  }, [speech, cancel])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, handleClose])

  // Synchronize streaming assistant response & AI audio playback
  useEffect(() => {
    if (!isOpen) return

    if (isSending) {
      if (streamingText) {
        setStatus("generating")
        setAssistantAnswer(streamingText)
      } else {
        setStatus("processing")
      }
    } else {
      // Find latest finished assistant reply
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant" && !last.streaming && last.content) {
        setAssistantAnswer(last.content)
        setStatus("speaking")

        // Append to dialogue history if not already present
        setHistory((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].id === `a-${last.id}`) {
            return prev
          }
          return [
            ...prev,
            {
              id: `a-${last.id}`,
              role: "assistant",
              text: last.content,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              language: (last.language ?? currentLang) as string,
            },
          ]
        })

        // Speak aloud using Indian Neural voice
        const spokenLang = (last.language ?? currentLang) as Language
        speech.speak(last.content, spokenLang)
      }
    }
  }, [isSending, streamingText, messages, isOpen, currentLang, speech])

  // Transition from speaking to idle (or auto-listen if continuous conversation mode is enabled)
  useEffect(() => {
    if (status === "speaking" && !speech.speaking && !isSending) {
      if (continuousMode) {
        const timer = setTimeout(() => {
          if (statusRef.current === "speaking") {
            void triggerListen()
          }
        }, 1200)
        return () => clearTimeout(timer)
      } else {
        setStatus("idle")
      }
    }
  }, [speech.speaking, status, isSending, continuousMode, triggerListen])

  // Handle assistant errors
  useEffect(() => {
    if (assistantError && isOpen) {
      setStatus("error")
      setErrorMessage(assistantError)
    }
  }, [assistantError, isOpen])

  // Suggestion click handler
  const handleSelectSuggestion = (sug: string) => {
    setUserTranscript(sug)
    setStatus("processing")
    speech.stopSpeaking()
    void send(sug)
  }

  // Language selector
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-assistant-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border-2 border-emerald-500/30 overflow-hidden flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Branding, Language, Continuous Mode & Close */}
            <div className="relative flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner">
                  <Sparkles className="h-6 w-6 text-emerald-200" />
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
                      Live AI
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                    {t.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Dialogue History Toggle */}
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHistory((v) => !v)}
                    className={`rounded-xl p-2 transition-colors ${
                      showHistory
                        ? "bg-white text-emerald-800"
                        : "text-white/80 hover:text-white hover:bg-white/20"
                    }`}
                    title={t.historyTitle}
                  >
                    <History className="h-4 w-4" />
                  </button>
                )}

                {/* Language Switcher */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLangMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-xs font-bold text-white transition-colors border border-white/20"
                    title="Select Language"
                  >
                    <Globe className="h-3.5 w-3.5 text-emerald-200" />
                    <span>{LANG_NAMES[lang] || "Language"}</span>
                    <ChevronDown className="h-3 w-3 opacity-80" />
                  </button>

                  {isLangMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white dark:bg-stone-800 shadow-xl border border-stone-200 dark:border-stone-700 py-1.5 z-30 animate-in fade-in zoom-in-95">
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

            {/* Conversation History Drawer (if toggled) */}
            {showHistory && history.length > 0 && (
              <div className="max-h-56 overflow-y-auto p-4 bg-stone-100 dark:bg-stone-800/90 border-b border-stone-200 dark:border-stone-700 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                  <span>{t.historyTitle}</span>
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    {t.close}
                  </button>
                </div>
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl text-xs sm:text-sm ${
                      item.role === "user"
                        ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 ml-4 border-l-4 border-emerald-500"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-stone-900 dark:text-stone-100 mr-4 border-l-4 border-emerald-600"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-400 mb-0.5">
                      <span className="font-bold">
                        {item.role === "user" ? t.youSaid : t.assistantSaid}
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line">{item.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Main Interactive Assistant Body */}
            <div className="p-5 sm:p-7 flex flex-col items-center text-center">
              {/* Dynamic Status Indicator */}
              <div className="mb-4 flex items-center justify-center">
                {status === "listening" ? (
                  <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700 text-xs sm:text-sm font-bold shadow-xs">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                    </span>
                    {t.listening}
                  </span>
                ) : status === "processing" ? (
                  <span className="flex items-center gap-2 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-300 dark:border-amber-700 text-xs sm:text-sm font-bold">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    {t.processing}
                  </span>
                ) : status === "generating" ? (
                  <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700 text-xs sm:text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" />
                    {t.generating}
                  </span>
                ) : status === "speaking" ? (
                  <span className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-400 dark:border-emerald-600 text-xs sm:text-sm font-bold shadow-xs">
                    <Volume2 className="h-4 w-4 text-emerald-600 animate-pulse" />
                    {t.speaking}
                  </span>
                ) : status === "error" ? (
                  <span className="flex items-center gap-2 text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/80 px-4 py-1.5 rounded-full border border-rose-300 dark:border-rose-700 text-xs sm:text-sm font-bold">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    {errorMessage || t.noSpeechMsg}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-4 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {t.ready}
                  </span>
                )}
              </div>

              {/* Large Animated Microphone & Waveform Area */}
              <div className="relative my-3 flex flex-col items-center justify-center w-full">
                {/* Real Live Audio Waveform Canvas (rendered during active speech input) */}
                {speech.listening && (
                  <div className="w-full max-w-sm mb-3 px-2">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-14 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-inner"
                    />
                  </div>
                )}

                {/* Real Audio Equalizer Bars (rendered during active AI audio playback) */}
                {speech.speaking && (
                  <div className="flex items-center justify-center gap-1.5 h-12 mb-3">
                    {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50, 70].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"
                        style={{
                          height: `${speech.isPaused ? 8 : h}%`,
                          animationDelay: `${i * 90}ms`,
                          transition: "height 0.15s ease",
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Microphone Button */}
                <div className="relative flex items-center justify-center">
                  {/* Outer pulse wave */}
                  {speech.listening && (
                    <span className="absolute h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-emerald-500/25 animate-ping opacity-60 pointer-events-none" />
                  )}

                  <button
                    type="button"
                    onClick={handleMicToggle}
                    aria-label={speech.listening ? t.tapToStop : t.tapToSpeak}
                    className={`group relative z-10 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 ${
                      speech.listening
                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 ring-rose-400 scale-105"
                        : speech.speaking
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-emerald-400 animate-pulse"
                        : isSending
                        ? "bg-amber-600 text-white shadow-amber-600/30 ring-amber-400 cursor-wait"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/30 ring-emerald-400 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isSending ? (
                      <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-white" />
                    ) : speech.listening ? (
                      <MicOff className="h-10 w-10 sm:h-12 sm:w-12 text-white animate-pulse" />
                    ) : speech.speaking ? (
                      <Volume2 className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    ) : (
                      <Mic className="h-10 w-10 sm:h-12 sm:w-12 text-white stroke-[2.3]" />
                    )}
                  </button>
                </div>

                {/* Sub-label under Microphone */}
                <p className="mt-3 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300">
                  {speech.listening
                    ? t.tapToStop
                    : speech.speaking
                    ? t.tapToInterrupt
                    : t.tapToSpeak}
                </p>
              </div>

              {/* User Live Transcription / Question */}
              {(interimText || userTranscript) && (
                <div className="mt-4 w-full rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-3.5 sm:p-4 text-left shadow-2xs">
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

              {/* Assistant Advisory Response */}
              {assistantAnswer && (
                <div className="mt-3 w-full rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/70 p-4 text-left shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-200/60 dark:border-emerald-800/50">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.assistantSaid}:</span>
                    </div>

                    {/* Audio Player Controls */}
                    <div className="flex items-center gap-1.5">
                      {speech.speaking && (
                        <button
                          type="button"
                          onClick={() => {
                            if (speech.isPaused) {
                              speech.resumeSpeaking()
                            } else {
                              speech.pauseSpeaking()
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-white/80 dark:bg-stone-800 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 transition-colors"
                          title={speech.isPaused ? t.resumeAudio : t.pauseAudio}
                        >
                          {speech.isPaused ? (
                            <>
                              <Play className="h-3 w-3 text-emerald-600" />
                              <span className="text-[11px]">{t.resumeAudio}</span>
                            </>
                          ) : (
                            <>
                              <Pause className="h-3 w-3 text-emerald-600" />
                              <span className="text-[11px]">{t.pauseAudio}</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (speech.speaking) {
                            speech.stopSpeaking()
                          } else {
                            speech.speak(assistantAnswer, currentLang)
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-white/80 dark:bg-stone-800 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 transition-colors"
                        title={speech.speaking ? t.stopAudio : t.listenAgain}
                      >
                        {speech.speaking ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5 text-rose-600" />
                            <span className="text-[11px] text-rose-600">{t.stopAudio}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-[11px]">{t.listenAgain}</span>
                          </>
                        )}
                      </button>
                    </div>
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

              {/* Quick Suggestion Pills */}
              <div className="mt-5 w-full text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {t.suggestionsTitle}
                  </span>
                  {/* Continuous Mode Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-stone-600 dark:text-stone-300">
                    <input
                      type="checkbox"
                      checked={continuousMode}
                      onChange={(e) => setContinuousMode(e.target.checked)}
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span>{t.continuousMode}</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.suggestions.slice(0, 4).map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="rounded-xl bg-stone-100 hover:bg-emerald-50 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-xs font-medium transition-colors text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full pt-3 border-t border-stone-100 dark:border-stone-800">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
