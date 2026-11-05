"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  ChevronRight,
  Bot,
  User as UserIcon,
} from "lucide-react"
import { useLanguage, type Lang } from "@/lib/language"
import { motion, AnimatePresence } from "framer-motion"

interface ChatMessage {
  id: string
  sender: "user" | "bot"
  text: string
  timestamp: string
  audioUrl?: string
  isPlaying?: boolean
  isError?: boolean
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  hi: [
    "🌾 गेहूं में पीला रतुआ रोकने के उपाय",
    "💧 2.5 एकड़ खेत के लिए यूरिया की मात्रा",
    "🍅 टमाटर की पत्ती पर काले धब्बे क्यों हैं?",
    "📈 आज की मंडी में सोयाबीन का भाव क्या है?",
    "🛰️ मेरे खेत का सैटेलाइट स्वास्थ्य कैसा है?",
  ],
  kn: [
    "🌾 ಭತ್ತದ ಬೆಳೆಯಲ್ಲಿ ಕೀಟ ಬಾಧೆ ನಿಯಂತ್ರಣ",
    "💧 ಹತ್ತಿ ಬೆಳೆಗೆ ಹನಿ ನೀರಾವರಿ ಸಲಹೆ",
    "📈 ಇಂದಿನ ಮಂಡಿ ದರಗಳು ಎಷ್ಟು?",
    "🧪 ಮಣ್ಣಿನ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ ಎಷ್ಟು ಇರಬೇಕು?",
  ],
  en: [
    "🌾 How to control Yellow Rust in wheat?",
    "💧 Recommended urea dosage for 2.5 acres",
    "🍅 Cause of dark lesions on tomato leaves",
    "📈 Today's soybean and cotton mandi rates",
    "🛰️ What does my farm satellite NDVI indicate?",
  ],
}

export function MobileAIAssistant() {
  const { lang, setLang } = useLanguage()
  const activeLang = lang === "kn" ? "kn" : lang === "hi" ? "hi" : "en"

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text:
        activeLang === "kn"
          ? "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ AI ಸಹಾಯಕ. ನಿಮ್ಮ ಬೆಳೆ, ಮಣ್ಣು, ಹವಾಮಾನ ಅಥವಾ ಮಂಡಿ ದರಗಳ ಬಗ್ಗೆ ಧ್ವನಿ ಮೂಲಕ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಕೇಳಿ."
          : activeLang === "hi"
          ? "नमस्ते! मैं आपका कृषि AI सलाहकार हूँ। आप बोलकर या लिखकर अपनी फसल, मिट्टी, मौसम या खाद के बारे में कोई भी सवाल पूछ सकते हैं।"
          : "Namaste! I am your Krishi AI Assistant. Speak or type any question about your crops, soil, weather, satellite health, or mandi rates.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Web Speech API Voice Input Initialization
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = activeLang === "kn" ? "kn-IN" : activeLang === "hi" ? "hi-IN" : "en-IN"

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInputValue(transcript)
          void handleSendMessage(transcript)
        }
        setIsListening(false)
      }

      rec.onerror = () => {
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang])

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please type your question.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      try {
        recognitionRef.current.start()
      } catch {
        setIsListening(false)
      }
    }
  }

  // Send Message to backend AI
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue("")
    setLoading(true)

    // Build conversation history payload
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }))

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: activeLang,
          history: historyPayload,
        }),
      })

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }

      const data = await res.json()
      const botReply = data.response || data.message || "कृषि सलाह उपलब्ध नहीं हो सकी।"

      const botMsg: ChatMessage = {
        id: "b_" + Date.now(),
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        audioUrl: data.audio_url,
      }

      setMessages((prev) => [...prev, botMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: "err_" + Date.now(),
        sender: "bot",
        text:
          activeLang === "hi"
            ? "नेटवर्क त्रुटि: कृषि सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।"
            : "Network error: Unable to reach the Krishi agricultural server. Please tap retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  // Play / Pause Text-To-Speech
  const handleToggleAudio = async (msg: ChatMessage) => {
    if (playingAudioId === msg.id) {
      currentAudioRef.current?.pause()
      setPlayingAudioId(null)
      return
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
    }

    if (msg.audioUrl) {
      const audio = new Audio(msg.audioUrl)
      currentAudioRef.current = audio
      setPlayingAudioId(msg.id)
      audio.onended = () => setPlayingAudioId(null)
      audio.play().catch(() => setPlayingAudioId(null))
      return
    }

    // Fallback: Web Speech API synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(msg.text)
      utter.lang = activeLang === "kn" ? "kn-IN" : activeLang === "hi" ? "hi-IN" : "en-IN"
      utter.onend = () => setPlayingAudioId(null)
      utter.onerror = () => setPlayingAudioId(null)
      setPlayingAudioId(msg.id)
      window.speechSynthesis.speak(utter)
    }
  }

  // Clear Chat
  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome_reset",
        sender: "bot",
        text:
          activeLang === "hi"
            ? "बातचीत साफ़ कर दी गई है। आप नया सवाल पूछ सकते हैं।"
            : "Conversation cleared. Ask any new farming question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
  }

  const suggestedList = SUGGESTED_QUESTIONS[activeLang] || SUGGESTED_QUESTIONS.en

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-lg mx-auto bg-[#FAF8F5] dark:bg-stone-950 md:hidden select-none">
      {/* 1. COMPACT TOP STATUS BAR */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-stone-900 border-b border-border shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            🌾
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-foreground">Krishi AI Assistant</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-muted-foreground">ICAR & SAU Agronomy Norms</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 active:scale-95 transition-all"
            title="Clear Chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. CHAT STREAM (MESSAGES) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                m.sender === "user"
                  ? "bg-emerald-800 text-white rounded-tr-xs"
                  : m.isError
                  ? "bg-rose-50 text-rose-900 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 rounded-tl-xs"
                  : "bg-white dark:bg-stone-900 text-foreground border border-emerald-100 dark:border-stone-800 rounded-tl-xs"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Bot controls: Audio Playback & Timestamp */}
              {m.sender === "bot" && !m.isError && (
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleToggleAudio(m)}
                    className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold active:scale-95"
                  >
                    {playingAudioId === m.id ? (
                      <>
                        <VolumeX className="h-3 w-3 animate-pulse" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" />
                        <span>Listen / सुनें</span>
                      </>
                    )}
                  </button>
                  <span>{m.timestamp}</span>
                </div>
              )}

              {/* Retry on Error */}
              {m.isError && (
                <div className="pt-2 mt-2 border-t border-rose-200">
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    className="flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>पुनः प्रयास करें / Retry</span>
                  </button>
                </div>
              )}
            </div>

            {m.sender === "user" && (
              <span className="text-[10px] text-muted-foreground mt-0.5 mr-1 font-mono">
                {m.timestamp}
              </span>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-800 max-w-[70%]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
            <span>Krishi AI सोच रहा है...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. SUGGESTED QUESTIONS (HORIZONTAL SWIPE) */}
      <div className="shrink-0 px-3 py-1.5 bg-white/70 dark:bg-stone-900/70 border-t border-border/60">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestedList.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="shrink-0 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 active:scale-95 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PERSISTENT BOTTOM INPUT BAR */}
      <div className="shrink-0 p-2.5 bg-white dark:bg-stone-900 border-t border-border pb-16">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleVoiceListening}
            className={`flex h-11 w-11 items-center justify-center rounded-full shrink-0 shadow-xs transition-all active:scale-90 ${
              isListening
                ? "bg-rose-600 text-white animate-bounce shadow-md"
                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
            }`}
            title="Speak / बोलकर पूछें"
            aria-label="Voice input"
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isListening
                ? "सुन रहे हैं... बोलिए / Listening..."
                : activeLang === "hi"
                ? "खेती का सवाल पूछें..."
                : "Ask farming question..."
            }
            className="flex-1 h-11 px-4 rounded-full border border-border bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-foreground focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all placeholder:text-muted-foreground"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-800 hover:bg-emerald-900 active:scale-90 disabled:opacity-40 text-white shadow-xs shrink-0 transition-all"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
