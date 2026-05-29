"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Send, Bot, User, RefreshCw, MicOff } from "lucide-react"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Message = { id: number; text: string; sender: "bot" | "user" }
type Lang = "hi-IN" | "en-IN" | "kn-IN"

const LANG_LABELS: Record<Lang, string> = {
  "hi-IN": "हिंदी",
  "en-IN": "English",
  "kn-IN": "ಕನ್ನಡ",
}

const WELCOME: Record<Lang, string> = {
  "hi-IN": "Namaste! Main aapka KrishiAI sahayak hoon. Apni fasal, mitti, mausam ya koi bhi kheti ki samasya poochh sakte hain — Hindi mein bilkul.",
  "en-IN": "Hello! I am your KrishiAI assistant. Ask me anything about crops, soil, weather, or farming — in Hindi, English, or Kannada.",
  "kn-IN": "Namaskara! Nanu nimma KrishiAI sahayaka. Bele, manu, havamana athava yavarade krishi samasye keli — Kannada alli.",
}

const PLACEHOLDER: Record<Lang, string> = {
  "hi-IN": "Hindi mein poochho... jaise 'mere tamatar mein bimari hai'",
  "en-IN": "Ask in English... like 'my tomato leaves are yellowing'",
  "kn-IN": "Kannada nalli keli...",
}

export default function ChatbotPage() {
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
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Bot className="h-8 w-8 text-primary" /> Hindi Voice AI
        </h1>
        <p className="text-muted-foreground mt-1">
          {lang === "hi-IN" ? "Hindi mein bolein ya likhein — AI samajhta hai" : "Speak or type in your language"}
        </p>
      </div>

      {/* Language toggle */}
      <div className="flex justify-center gap-2 mb-4">
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => switchLang(l)}
            className={"px-4 py-1.5 rounded-full text-sm font-semibold transition-all " +
              (lang === l
                ? "bg-primary text-white shadow-md"
                : "border border-border text-muted-foreground hover:bg-muted/60")}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      <GlassCard className="flex-1 overflow-hidden flex flex-col bg-background/80 shadow-2xl relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={"flex gap-4 max-w-[85%] " + (msg.sender === "user" ? "ml-auto flex-row-reverse" : "")}
              >
                <div className={"mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm " +
                  (msg.sender === "bot"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-blue-500/20 text-blue-500 border border-blue-500/30")}>
                  {msg.sender === "bot" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={"p-4 rounded-2xl text-[15px] leading-relaxed " +
                  (msg.sender === "bot"
                    ? "bg-secondary text-secondary-foreground rounded-tl-sm border border-black/5 dark:border-white/5"
                    : "bg-blue-600 text-white rounded-tr-sm shadow-md")}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="mt-1 flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-secondary p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-12">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-card/50 backdrop-blur-3xl m-2 rounded-2xl border border-white/10 shadow-inner">
          <form onSubmit={handleSend} className="flex gap-2">
            {/* Mic Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              title={lang === "hi-IN" ? (isListening ? "Band karein" : "Hindi mein bolein") : (isListening ? "Stop" : "Speak")}
              className={"h-12 w-12 rounded-full flex-shrink-0 transition-all " +
                (isListening
                  ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30 animate-pulse"
                  : "hover:bg-primary/10 hover:text-primary")}
              onClick={toggleListen}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Input */}
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening
                  ? (lang === "hi-IN" ? "Sun raha hoon..." : "Listening...")
                  : PLACEHOLDER[lang]}
                className="h-12 bg-background border-2 rounded-full px-6 focus-visible:ring-primary/50 text-base shadow-sm w-full"
                disabled={isListening}
              />
              {interimText && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60 pointer-events-none truncate max-w-[80%]">
                  {interimText}
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              id="send-btn"
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg flex-shrink-0 p-0 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            >
              <Send className="h-5 w-5 ml-0.5" />
            </Button>
          </form>

          {/* Voice hint */}
          {isListening && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs text-red-500 font-medium">
                {lang === "hi-IN" ? "Sun raha hoon — bolein, ruk jaane par automatically band ho jayega" : "Listening — will stop automatically when you finish"}
              </span>
            </div>
          )}

          <div className="text-center mt-2">
            <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 opacity-60">
              <RefreshCw className="h-3 w-3" />
              {lang === "hi-IN" ? "KrishiAI kabhi kabhi galat jawab de sakta hai — doctor ya krishi officer se zarur salah lein." : "KrishiAI may occasionally produce inaccurate answers."}
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
