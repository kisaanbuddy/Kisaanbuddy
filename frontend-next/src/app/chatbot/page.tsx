"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Send, Bot, User, Loader2, RefreshCw } from "lucide-react"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Message = { id: number, text: string, sender: "bot" | "user" }

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I am your KrishiAI expert assistant. Im equipped with knowledge about Indian agriculture, crops, and market prices. How can I help you today?", sender: "bot" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => scrollToBottom(), [messages, isTyping])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: "user" }])
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: "bot" }])
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Demo Mode Reply: Im a bit overloaded right now, but a smart AI would respond here!", sender: "bot" }])
      }
    } catch {
       setMessages(prev => [...prev, { id: Date.now() + 1, text: "Offline Mode Mode: Could not connect to the backend server. Make sure it's running on 8000.", sender: "bot" }])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return alert("Speech recognition not supported.")

    if (isListening) return; // Prevent double trigger
    
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      // Automatically send
      setTimeout(() => document.getElementById("send-btn")?.click(), 500)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Bot className="h-8 w-8 text-primary" /> Multi-Lingual Agronomist AI
        </h1>
        <p className="text-muted-foreground">Ask questions in English, Hindi, or local dialects using voice.</p>
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
                className={`flex gap-4 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${msg.sender === "bot" ? "bg-primary/20 text-primary border border-primary/30" : "bg-blue-500/20 text-blue-500 border border-blue-500/30"}`}>
                  {msg.sender === "bot" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed relative ${
                  msg.sender === "bot" 
                    ? "bg-secondary text-secondary-foreground rounded-tl-sm border border-black/5 dark:border-white/5" 
                    : "bg-blue-600 text-white rounded-tr-sm shadow-md"
                }`}>
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
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className={`h-12 w-12 rounded-full flex-shrink-0 transition-all ${isListening ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30 animate-pulse" : "hover:bg-primary/10 hover:text-primary"}`}
              onClick={toggleListen}
            >
              <Mic className={`h-5 w-5 ${isListening ? "animate-bounce" : ""}`} />
            </Button>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening closely..." : "Ask your agriculture question..."}
              className="flex-1 h-12 bg-background border-2 rounded-full px-6 focus-visible:ring-primary/50 text-base shadow-sm"
              disabled={isListening}
            />
            <Button type="submit" id="send-btn" disabled={!input.trim() || isTyping} className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg flex-shrink-0 p-0 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <Send className="h-5 w-5 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 opacity-60">
              <RefreshCw className="h-3 w-3" /> KrishiAI may occasionally produce inaccurate answers.
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
