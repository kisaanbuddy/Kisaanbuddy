"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Send, Bot, User, RefreshCw, MicOff, Sparkles, Check, ArrowRight, ShieldAlert } from "lucide-react"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Message = { id: number; text: string; sender: "bot" | "user" }
type Lang = "hi-IN" | "en-IN" | "kn-IN"

const LANG_LABELS: Record<Lang, string> = {
  "hi-IN": "हिंदी (Hindi)",
  "en-IN": "English",
  "kn-IN": "ಕನ್ನಡ (Kannada)",
}

const WELCOME: Record<Lang, string> = {
  "hi-IN": "Namaste! Main aapka KrishiAI sahayak hoon. Apni fasal, mitti, mausam ya koi bhi kheti ki samasya poochh sakte hain — Hindi mein bilkul.",
  "en-IN": "Hello! I am your KrishiAI assistant. Ask me anything about crops, soil, weather, or farming — in Hindi, English, or Kannada.",
  "kn-IN": "Namaskara! Nanu nimma KrishiAI sahayaka. Bele, manu, havamana athava yavarade krishi samasye keli — Kannada alli.",
}

const PLACEHOLDER: Record<Lang, string> = {
  "hi-IN": "Hindi mein poochho... jaise 'tamatar ke patte peele pad rahe hain'",
  "en-IN": "Ask in English... like 'my tomato leaves are yellowing'",
  "kn-IN": "Kannada nalli keli...",
}

const SUGGESTIONS: Record<Lang, { text: string; icon: string }[]> = {
  "hi-IN": [
    { text: "Tamatar ke patte peele pad rahe hain, kya karein?", icon: "🍅" },
    { text: "Agle 3 dino ka mausam kaisa rahega?", icon: "🌦️" },
    { text: "Dhan ki fasal ke liye kaunsi khad sabse achhi hai?", icon: "🌾" },
    { text: "PM Kisan Yojana ke liye eligibility kya hai?", icon: "📋" },
  ],
  "en-IN": [
    { text: "My tomato leaves are turning yellow, what should I do?", icon: "🍅" },
    { text: "What is the weather forecast for the next 3 days?", icon: "🌦️" },
    { text: "Which fertilizer is best for paddy cultivation?", icon: "🌾" },
    { text: "What are the eligibility criteria for PM Kisan scheme?", icon: "📋" },
  ],
  "kn-IN": [
    { text: "ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ, ಏನು ಮಾಡಬೇಕು?", icon: "🍅" },
    { text: "ಮುಂದಿನ 3 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಏನು?", icon: "🌦️" },
    { text: "ಭತ್ತದ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಉತ್ತಮ?", icon: "🌾" },
    { text: "ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆಯ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಯಾವುವು?", icon: "📋" },
  ],
}

function ChatbotInner() {
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Lang>("hi-IN")
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: WELCOME["hi-IN"], sender: "bot" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-fill from homepage voice demo (?q=...)
  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setInput(decodeURIComponent(q))
  }, [searchParams])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => scrollToBottom(), [messages, isTyping])

  // Update welcome message when lang changes
  const switchLang = (newLang: Lang) => {
    setLang(newLang)
    setMessages([{ id: Date.now(), text: WELCOME[newLang], sender: "bot" }])
  }

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault()
    const userMsg = (overrideText || input).trim()
    if (!userMsg) return

    setInput("")
    setInterimText("")
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: "user" }])
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, language: lang }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: "bot" }])
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: lang === "hi-IN"
            ? "Server se jawab nahi mila. Internet check karein ya thodi der baad try karein."
            : "Could not connect to server. Please check your connection and try again.",
          sender: "bot"
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: lang === "hi-IN"
          ? "Backend server se connect nahi ho pa raha. Ensure karein ki server chal raha ho."
          : "Could not connect to backend. Make sure the server is running.",
        sender: "bot"
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleListen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert(lang === "hi-IN"
        ? "Aapka browser voice support nahi karta. Google Chrome use karein."
        : "Voice not supported in this browser. Please use Google Chrome.")
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = lang
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: any) => {
      let interim = ""
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      if (final) {
        setInput(prev => prev + final)
        setInterimText("")
      } else {
        setInterimText(interim)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      setInterimText("")
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText("")
    }

    recognition.start()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto relative pb-4">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[80px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Bot className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white flex items-center gap-2">
              Voice AI Assistant
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Agent Live
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Speak or type in your regional language
            </p>
          </div>
        </div>

        {/* Language selector tabs */}
        <div className="flex rounded-xl border border-white/[0.08] bg-slate-950/40 p-1 gap-1">
          {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => switchLang(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                lang === l
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/15"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {LANG_LABELS[l].split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col border border-white/[0.08] backdrop-blur-md shadow-2xl bg-slate-950/20 rounded-3xl relative">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isBot = msg.sender === "bot"
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div className={`mt-1.5 flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center shadow-md relative ${
                    isBot
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                  }`}>
                    {isBot ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                    {isBot && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group transition-all duration-300 ${
                    isBot
                      ? "bg-white/[0.03] border border-white/[0.04] text-white/90 rounded-tl-sm"
                      : "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-tr-sm font-medium shadow-lg shadow-emerald-500/10"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex gap-3 max-w-[85%] mr-auto"
            >
              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Bot className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div className="bg-white/[0.03] border border-white/[0.04] p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-11">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips - Only display when the welcome message is the only one */}
        {messages.length === 1 && !isTyping && (
          <div className="px-6 pb-2 pt-4 border-t border-white/[0.04] bg-slate-950/20 backdrop-blur-sm">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Suggested topics
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS[lang]?.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(undefined, chip.text)}
                  className="flex items-center justify-between text-left p-3 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] text-xs text-white/80 hover:text-white font-medium hover:border-emerald-500/20 transition-all group"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{chip.icon}</span>
                    <span className="truncate">{chip.text}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-400 transition-colors shrink-0 ml-2 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-white/[0.06] bg-slate-950/40 backdrop-blur-3xl m-2 rounded-2xl shadow-inner">
          <form onSubmit={handleSend} className="flex gap-2">
            {/* Mic voice record */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              title={lang === "hi-IN" ? (isListening ? "Band karein" : "Hindi mein bolein") : (isListening ? "Stop" : "Speak")}
              className={`h-12 w-12 rounded-xl flex-shrink-0 transition-all border-white/[0.08] relative overflow-hidden ${
                isListening
                  ? "bg-rose-500/20 text-rose-500 border-rose-500/40 hover:bg-rose-500/30 ring-2 ring-rose-500/20"
                  : "bg-slate-900/60 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 text-muted-foreground"
              }`}
              onClick={toggleListen}
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 relative z-10" />
                  <span className="absolute inset-0 bg-rose-500/15 animate-ping rounded-xl" />
                </>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            {/* Input fields */}
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening
                  ? (lang === "hi-IN" ? "Sun raha hoon..." : "Listening...")
                  : PLACEHOLDER[lang]}
                className="h-12 bg-slate-950/60 border border-white/[0.08] focus:border-emerald-500/40 rounded-xl px-4 focus-visible:ring-emerald-500/10 focus-visible:ring-offset-0 text-sm shadow-sm w-full text-white placeholder:text-muted-foreground/60"
                disabled={isListening}
              />
              {interimText && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 pointer-events-none truncate max-w-[85%]">
                  {interimText}
                </div>
              )}
            </div>

            {/* Send Message Button */}
            <Button
              type="submit"
              id="send-btn"
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 flex-shrink-0 p-0 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Send className="h-4.5 w-4.5 ml-0.5" />
            </Button>
          </form>

          {/* Listening State Audio Waves simulation */}
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-3 flex items-center justify-center gap-2 bg-rose-500/5 border border-rose-500/15 rounded-xl p-2"
            >
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-1.5 bg-rose-500 rounded animate-[pulse_0.6s_infinite_alternate]" />
                <span className="w-0.5 h-3 bg-rose-500 rounded animate-[pulse_0.4s_infinite_alternate_0.1s]" />
                <span className="w-0.5 h-2 bg-rose-500 rounded animate-[pulse_0.5s_infinite_alternate_0.2s]" />
                <span className="w-0.5 h-1.5 bg-rose-500 rounded animate-[pulse_0.6s_infinite_alternate]" />
              </div>
              <span className="text-[10px] text-rose-400 font-bold">
                {lang === "hi-IN" ? "Aapki aawaz sun raha hoon... bolna band hone par process hoga" : "Recording voice... processing will trigger when you stop speaking"}
              </span>
            </motion.div>
          )}

          {/* Footer disclaimer */}
          <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>AI advisor metrics. Always confirm diagnostics with localized agronomy professionals.</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default function ChatbotPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground font-semibold">Configuring voice AI pipeline...</div>}>
      <ChatbotInner />
    </Suspense>
  )
}
