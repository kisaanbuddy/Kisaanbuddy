"use client"
/**
 * The expanded chat panel — mounted by the floating widget.
 *
 * Wires together:
 *   - useAssistant (session + streaming)
 *   - useSpeech    (browser STT + TTS + server STT fallback)
 *   - ChatMessage / MicButton / LanguagePicker / TranscriptLive
 *
 * Auto-speaks assistant replies once streaming finishes (browser TTS by default —
 * premium TTS can be wired in later via /api/chat/tts without UI changes).
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
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { Language } from "@/lib/assistant-api"
import { ChatMessage } from "./ChatMessage"
import { LanguagePicker } from "./LanguagePicker"
import { MicButton } from "./MicButton"
import { TranscriptLive } from "./TranscriptLive"
import { useAssistant } from "./useAssistant"
import { useSpeech } from "./useSpeech"

const QUICK_PROMPTS: { en: string; hi: string; kn: string; key: string }[] = [
  {
    key: "weather",
    en: "Weather for my farm today?",
    hi: "आज मेरे खेत का मौसम कैसा है?",
    kn: "ಇಂದು ನನ್ನ ಹೊಲದ ಹವಾಮಾನ ಹೇಗಿದೆ?",
  },
  {
    key: "crop",
    en: "Which crop should I plant this season?",
    hi: "इस मौसम में कौन सी फसल लगाऊँ?",
    kn: "ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?",
  },
  {
    key: "schemes",
    en: "What government schemes can help me?",
    hi: "मेरे लिए कौन सी सरकारी योजनाएँ हैं?",
    kn: "ನನಗೆ ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿವೆ?",
  },
]

function pickPrompt(p: (typeof QUICK_PROMPTS)[number], lang: Language) {
  if (lang === "hi") return p.hi
  if (lang === "kn") return p.kn
  return p.en
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
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
      className="glass-panel fixed bottom-24 right-4 z-[60] flex h-[min(620px,calc(100vh-8rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden"
      role="dialog"
      aria-label="KrishiAI assistant"
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-white/20 dark:border-white/5 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow">
            K
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-none truncate">
              KrishiAI
            </div>
            <div className="text-[10px] text-muted-foreground leading-none mt-0.5">
              {activeTool
                ? `Using ${activeTool.replace("_", " ")}…`
                : isSending
                ? "Thinking…"
                : "Online"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LanguagePicker value={language} onChange={setLanguage} />
          <button
            type="button"
            onClick={() => setAutoSpeak((v) => !v)}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
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
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${
              location
                ? "text-green-600 dark:text-green-400"
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
            className="p-1.5 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            title="New conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            title="Close"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3"
      >
        {showQuickPrompts && (
          <div className="flex flex-col items-center text-center px-4 py-6 gap-3">
            <div className="text-sm font-medium">
              {language === "hi"
                ? "नमस्ते! मैं KrishiAI हूँ।"
                : language === "kn"
                ? "ನಮಸ್ಕಾರ! ನಾನು KrishiAI."
                : "Namaste! I'm KrishiAI."}
            </div>
            <div className="text-xs text-muted-foreground">
              {language === "hi"
                ? "मौसम, फसल, या सरकारी योजनाओं के बारे में पूछें।"
                : language === "kn"
                ? "ಹವಾಮಾನ, ಬೆಳೆ, ಅಥವಾ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ."
                : "Ask me about weather, crops, or schemes."}
            </div>
            <div className="flex flex-col w-full gap-1.5 mt-2">
              {QUICK_PROMPTS.map((p) => {
                const label = pickPrompt(p, language)
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => submit(label)}
                    className="text-left text-xs px-3 py-2 rounded-xl border border-border bg-white/60 dark:bg-white/5 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    {label}
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
          <div className="text-[11px] text-red-600 dark:text-red-400 px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/20">
            {lastError}
          </div>
        )}
      </div>

      {/* Interim transcript */}
      <TranscriptLive text={interim} active={speech.listening} />

      {/* Pending image preview pill */}
      {pendingImage && (
        <div className="flex flex-shrink-0 items-center gap-2 border-t border-white/20 dark:border-white/5 px-3 pt-2">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage}
              alt="Selected leaf"
              className="h-14 w-14 rounded-md object-cover ring-1 ring-border"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground">
            <ImageIcon className="mr-1 inline h-3 w-3" />
            {language === "hi"
              ? "Photo bhejne ke liye Send dabao — disease detect karega."
              : language === "kn"
              ? "Send ottiri — roga patte hachuttade."
              : "Hit Send to diagnose this photo."}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="flex flex-shrink-0 items-center gap-2 border-t border-white/20 dark:border-white/5 px-3 py-2.5">
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
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/60"
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
          className="flex-1 rounded-full border border-border bg-white/70 dark:bg-white/5 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400/50"
          disabled={isSending && !!input}
        />
        {isSending ? (
          <button
            type="button"
            onClick={cancel}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/70"
            aria-label="Stop generating"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
          </button>
        ) : input.trim() || pendingImage ? (
          <button
            type="button"
            onClick={() => submit()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow hover:bg-green-600"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
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

// Re-export AnimatePresence so the parent can wrap in one place without reimporting.
export { AnimatePresence as ChatPanelAnimatePresence }
