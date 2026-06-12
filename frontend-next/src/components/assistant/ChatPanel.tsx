"use client"
import { useLanguage } from '@/lib/language'
/**
 * The expanded chat panel — mounted by the floating widget.
 *
 * Wires together:
 *   - useAssistant (session + streaming)
 *   - useSpeech    (browser STT + TTS + server STT fallback)
 *   - ChatMessage / MicButton / LanguagePicker / TranscriptLive
 */
import { AnimatePresence, motion } from "framer-motion"
import {
  Image as ImageIcon,
  Loader2,
  MapPin,
  MapPinOff,
  Paperclip,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
  X,
  Sparkles,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { Language } from "@/lib/assistant-api"
import { ChatMessage } from "./ChatMessage"
import { LanguagePicker } from "./LanguagePicker"
import { MicButton } from "./MicButton"
import { TranscriptLive } from "./TranscriptLive"
import { useAssistant } from "./useAssistant"
import { useSpeech } from "./useSpeech"

const QUICK_PROMPTS: { en: string; hi: string; kn: string; key: string; icon: string }[] = [
  {
    key: "weather",
    en: "Weather for my farm today?",
    hi: "आज मेरे खेत का मौसम कैसा है?",
    kn: "ಇಂದು ನನ್ನ ಹೊಲದ ಹವಾಮಾನ ಹೇಗಿದೆ?",
    icon: "🌦️",
  },
  {
    key: "crop",
    en: "Which crop should I plant this season?",
    hi: "इस मौसम में कौन सी फसल लगाऊँ?",
    kn: "ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?",
    icon: "🌾",
  },
  {
    key: "schemes",
    en: "What government schemes can help me?",
    hi: "मेरे लिए कौन सी सरकारी योजनाएँ हैं?",
    kn: "ನನಗೆ ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿವೆ?",
    icon: "📋",
  },
]

function pickPrompt(p: (typeof QUICK_PROMPTS)[number], lang: Language) {
  if (lang === "hi") return p.hi
  if (lang === "kn") return p.kn
  return p.en
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage()
  const {
    messages,
    activeTool,
    language,
    setLanguage,
    location,
    shareLocation,
    clearLocation,
    send,
    cancel,
    reset,
    isSending,
    lastError,
  } = useAssistant()

  const [input, setInput] = useState("")
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [interim, setInterim] = useState("")
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const lastSpokenIdRef = useRef<string | null>(null)

  // ---- Speech wiring ----
  const handleFinalTranscript = useCallback(
    (text: string) => {
      setInterim("")
      // Auto-send after STT so voice UX feels conversational.
      void send(text)
    },
    [send]
  )

  const speech = useSpeech({
    language,
    onFinalTranscript: handleFinalTranscript,
    onInterim: (t) => setInterim(t),
    onError: () => {
      setInterim("")
    },
  })

  // Voice interruption: if user taps the mic, kill any TTS immediately.
  const toggleMic = useCallback(() => {
    if (speech.listening) {
      speech.stopListening()
    } else {
      speech.stopSpeaking()
      void speech.startListening()
    }
  }, [speech])

  // Auto-scroll on new message / stream token.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  // Auto-speak the latest assistant message once it finishes streaming.
  useEffect(() => {
    if (!autoSpeak) return
    const last = messages[messages.length - 1]
    if (!last || last.role !== "assistant" || last.streaming) return
    if (!last.content) return
    if (lastSpokenIdRef.current === last.id) return
    lastSpokenIdRef.current = last.id
    const spokenLang = (last.language ?? language) as Language
    speech.speak(last.content, spokenLang)
  }, [messages, autoSpeak, language, speech])

  // ---- Submit handler ----
  const submit = useCallback(
    (text?: string) => {
      const t = (text ?? input).trim()
      if ((!t && !pendingImage) || isSending) return
      const img = pendingImage
      setInput("")
      setPendingImage(null)
      void send(t, img ?? undefined)
    },
    [input, pendingImage, isSending, send]
  )

  // Read a chosen file as a base64 data URL — capped at ~6 MB so the request
  // payload stays small enough for any backend.
  const onPickImage = useCallback((file: File | null | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) return
    if (file.size > 6 * 1024 * 1024) {
      window.alert(
        language === "hi"
          ? "Photo 6 MB se chhoti honi chahiye."
          : "Image must be smaller than 6 MB.",
      )
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      if (result) setPendingImage(result)
    }
    reader.readAsDataURL(file)
  }, [language])

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
    },
    [submit]
  )

  const showQuickPrompts = useMemo(() => messages.length === 0, [messages])

  const placeholder =
    language === "hi"
      ? "अपना सवाल लिखें या माइक दबाएँ…"
      : language === "kn"
      ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿರಿ…"
      : "Ask about weather, crops, or schemes…"

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="glass-panel fixed bottom-24 right-4 z-[60] flex h-[min(600px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden border border-white/[0.08] backdrop-blur-xl bg-slate-950/70 shadow-2xl rounded-3xl"
      role="dialog"
      aria-label={t("common.krishiai_assistant")}
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] bg-slate-950/40 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-black shadow-sm shrink-0">
            K
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white leading-none font-display">
              KrishiAI Assistant
            </div>
            <div className="text-[9px] text-muted-foreground leading-none mt-1 flex items-center gap-1 font-semibold">
              <span className={`h-1.5 w-1.5 rounded-full ${activeTool || isSending ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-pulse"}`} />
              <span>
                {activeTool
                  ? `Using ${activeTool.replace("_", " ")}…`
                  : isSending
                  ? "Thinking…"
                  : "Online"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <LanguagePicker value={language} onChange={setLanguage} />
          
          <button
            type="button"
            onClick={() => setAutoSpeak((v) => !v)}
            className={`p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors ${autoSpeak ? "text-emerald-400" : "text-muted-foreground"}`}
            title={autoSpeak ? "Mute voice replies" : "Unmute voice replies"}
            aria-label={autoSpeak ? "Mute voice replies" : "Unmute voice replies"}
          >
            {autoSpeak ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              location ? clearLocation() : void shareLocation()
            }
            className={`p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors ${
              location
                ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10"
                : "text-muted-foreground"
            }`}
            title={
              location
                ? `Location shared (${location.lat?.toFixed(2)}, ${location.lon?.toFixed(2)})`
                : "Share location for local weather"
            }
            aria-label={location ? "Clear location" : "Share location"}
          >
            {location ? (
              <MapPin className="h-4 w-4" />
            ) : (
              <MapPinOff className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => void reset()}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-white/[0.04] hover:text-white transition-colors"
            title={t("common.new_conversation")}
            aria-label={t("common.reset_conversation")}
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-white/[0.04] hover:text-white transition-colors"
            title={t("common.close")}
            aria-label={t("common.close_assistant")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 custom-scrollbar"
      >
        {showQuickPrompts && (
          <div className="flex flex-col items-center text-center px-2 py-6 gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            
            <div className="text-xs font-bold text-white font-display mt-1">
              {language === "hi"
                ? "Namaste! Main KrishiAI sahayak hoon."
                : language === "kn"
                ? "Namaskara! Nanu KrishiAI."
                : "Namaste! I'm your KrishiAI Assistant."}
            </div>
            
            <div className="text-[11px] text-muted-foreground leading-relaxed max-w-[240px]">
              {language === "hi"
                ? "Mausam, fasal checkup, ya sarkar ki yojnaon ke baare mein kuch bhi poochhein."
                : language === "kn"
                ? "Havamana, bele, athava yojanegala bagge keli."
                : "Ask me about real-time weather, crop suitability, or government grants."}
            </div>

            <div className="flex flex-col w-full gap-2 mt-4 text-left">
              {QUICK_PROMPTS.map((p) => {
                const label = pickPrompt(p, language)
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => submit(label)}
                    className="flex items-center gap-2.5 text-[11px] px-3.5 py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] hover:border-emerald-500/20 text-white/90 hover:text-white transition-all font-semibold"
                  >
                    <span>{p.icon}</span>
                    <span className="truncate flex-1">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        
        {messages.map((m) => (
          <ChatMessage key={m.id} msg={m} />
        ))}
        
        {lastError && (
          <div className="text-[10px] font-bold text-red-400 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            {lastError}
          </div>
        )}
      </div>

      {/* Interim voice transcript live view */}
      <TranscriptLive text={interim} active={speech.listening} />

      {/* Pending image preview */}
      {pendingImage && (
        <div className="flex flex-shrink-0 items-center gap-2 border-t border-white/[0.06] bg-slate-950/40 px-4 py-2.5">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage}
              alt={t("common.uploaded_leaf")}
              className="h-12 w-12 rounded-xl object-cover border border-white/[0.08]"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border border-white/[0.08] text-white hover:text-rose-400 transition-colors"
              aria-label={t("common.remove_photo")}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
            <ImageIcon className="mr-1.5 inline h-3.5 w-3.5 text-emerald-400" />
            {language === "hi"
              ? "Send dabakar patti ki bimari ka treatment pata karein."
              : language === "kn"
              ? "Send ottiri — bimari detect aaguttade."
              : "Hit Send to run AI diagnostics on this leaf."}
          </div>
        </div>
      )}

      {/* Input composer area */}
      <div className="flex flex-shrink-0 items-center gap-2 border-t border-white/[0.06] bg-slate-950/40 px-3 py-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            onPickImage(e.target.files?.[0])
            if (e.target) e.target.value = ""
          }}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-white/[0.08] hover:bg-white/[0.04] text-muted-foreground hover:text-white transition-colors"
          aria-label={
            language === "hi"
              ? "Patti ki photo bhejo"
              : language === "kn"
              ? "Ele photo kalisi"
              : "Attach a leaf photo"
          }
          title={
            language === "hi"
              ? "Patti / paude ki photo bhejo (disease detection)"
              : "Attach a leaf / plant photo (disease detection)"
          }
          disabled={isSending}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-white/[0.08] bg-slate-950/60 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-muted-foreground/60"
          disabled={isSending && !!input}
        />

        {isSending ? (
          <button
            type="button"
            onClick={cancel}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-white/[0.08] text-amber-400"
            aria-label={t("common.stop_generating")}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </button>
        ) : input.trim() || pendingImage ? (
          <button
            type="button"
            onClick={() => submit()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95"
            aria-label={t("common.send_message")}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        ) : (
          <MicButton
            listening={speech.listening}
            disabled={!speech.speechSupported}
            onToggle={toggleMic}
          />
        )}
      </div>
    </motion.div>
  )
}

export { AnimatePresence as ChatPanelAnimatePresence }
