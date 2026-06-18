"use client"

import { useLanguage } from '@/lib/language'
import { useState, useRef, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Camera, 
  Trash2, 
  Database, 
  RefreshCw, 
  Check, 
  X, 
  Sparkles,
  ShieldAlert,
  History
} from "lucide-react"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Message = { 
  id: string; 
  text: string; 
  sender: "bot" | "user";
  language: string;
  audioUrl?: string;
  imageUrl?: string;
  isPlaying?: boolean;
}

type Lang = "hi" | "en" | "kn" | "te" | "ta" | "bn" | "mr"

const LANG_CONFIG: Record<Lang, { label: string; speechCode: string; welcome: string; placeholder: string }> = {
  hi: {
    label: "हिंदी (Hindi)",
    speechCode: "hi-IN",
    welcome: "नमस्ते! मैं आपका किसान मित्र एआई सहायक हूँ। बोलने के लिए नीचे दिए गए माइक को दबाएं।",
    placeholder: "बोलने के लिए माइक दबाएं..."
  },
  kn: {
    label: "ಕನ್ನಡ (Kannada)",
    speechCode: "kn-IN",
    welcome: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕಿಸಾನ್ ಮಿತ್ರ ಎಐ ಸಹಾಯಕ. ಮಾತನಾಡಲು ಕೆಳಗಿನ ಮೈಕ್ ಒತ್ತಿರಿ.",
    placeholder: "ಮಾತನಾಡಲು ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿರಿ..."
  },
  en: {
    label: "English",
    speechCode: "en-US",
    welcome: "Hello! I am your KisaanBuddy AI assistant. Tap the microphone below to talk to me.",
    placeholder: "Tap microphone to speak..."
  },
  te: {
    label: "తెలుగు (Telugu)",
    speechCode: "te-IN",
    welcome: "నమస్తే! నేను మీ కిసాన్ మిత్ర ఎఐ సహాయకుడిని. మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి.",
    placeholder: "మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి..."
  },
  ta: {
    label: "தமிழ் (Tamil)",
    speechCode: "ta-IN",
    welcome: "வணக்கம்! நான் உங்கள் கிசான் மித்ரா எஐ உதவியாளர். பேச மைக்ரோஃபோனைத் தட்டவும்.",
    placeholder: "பேச மைக்ரோஃபோனைத் தட்டவும்..."
  },
  bn: {
    label: "বাংলা (Bengali)",
    speechCode: "bn-IN",
    welcome: "নমস্কার! আমি আপনার কিষাণ মিত্র এআই সহকারী। কথা বলতে নিচের মাইক টিপুন।",
    placeholder: "কথা বলতে মাইক টিপুন..."
  },
  mr: {
    label: "मराठी (Marathi)",
    speechCode: "mr-IN",
    welcome: "नमस्कार! मी तुमचा किसान मित्र एआय सहाय्यक आहे. बोलण्यासाठी खालील माइक दाबा.",
    placeholder: "बोलण्यासाठी माइक दाबा..."
  }
}

const CACHE_NAME = "kisaanbuddy-tts-audio-cache"

function ChatbotInner() {
  const { t, lang: globalLang } = useLanguage()
  const searchParams = useSearchParams()

  const [activeLang, setActiveLang] = useState<Lang>("hi")
  const [messages, setMessages] = useState<Message[]>([])
  
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Camera & Image state
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Map global UI language to our local voice assistant languages
  useEffect(() => {
    if (globalLang === "kn") setActiveLang("kn")
    else if (globalLang === "en") setActiveLang("en")
    else if (globalLang === "te") setActiveLang("te")
    else if (globalLang === "ta") setActiveLang("ta")
    else if (globalLang === "bn") setActiveLang("bn")
    else if (globalLang === "mr") setActiveLang("mr")
    else setActiveLang("hi")
  }, [globalLang])

  // Pre-load welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        text: LANG_CONFIG[activeLang].welcome,
        sender: "bot",
        language: activeLang
      }
    ])
  }, [activeLang])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  // Stop current audio playback
  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    setMessages(prev => prev.map(m => ({ ...m, isPlaying: false })))
    setIsSpeaking(false)
  }

  // Play synthetic TTS audio (either cached locally, retrieved from backend, or browser fallback)
  const playAudio = async (text: string, language: string, msgId: string) => {
    stopCurrentAudio()
    
    try {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPlaying: true } : m))
      setIsSpeaking(true)

      // 1. Try Cache API first
      const cache = await caches.open(CACHE_NAME)
      const cacheKey = `/api/chat/tts?text=${encodeURIComponent(text)}&lang=${language}`
      const cachedResponse = await cache.match(cacheKey)

      let audioUrl = ""

      if (cachedResponse) {
        const blob = await cachedResponse.blob()
        audioUrl = URL.createObjectURL(blob)
      } else {
        // 2. Fetch from Backend
        const res = await fetch("/api/chat/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            language: language,
            prefer_browser: false
          })
        })

        if (!res.ok) throw new Error("TTS endpoint error")

        const contentType = res.headers.get("content-type") || ""
        if (contentType.includes("json")) {
          const data = await res.json()
          if (data.browser) {
            // Browser speech synthesis fallback
            speakViaBrowser(text, data.voice_suggestion || "hi-IN", msgId)
            return
          }
        }

        // Cache the successful audio response
        const responseClone = res.clone()
        await cache.put(cacheKey, responseClone)

        const blob = await res.blob()
        audioUrl = URL.createObjectURL(blob)
      }

      // Play the audio
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio
      audio.onended = () => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPlaying: false } : m))
        setIsSpeaking(false)
      }
      audio.onerror = () => {
        // Fallback if audio file fails to load
        speakViaBrowser(text, language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-US", msgId)
      }
      audio.play()

    } catch (err) {
      console.warn("TTS backend error, falling back to Web Speech Synthesis API:", err)
      speakViaBrowser(text, language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-US", msgId)
    }
  }

  // Browser speech synthesis utility
  const speakViaBrowser = (text: string, voiceCode: string, msgId: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPlaying: false } : m))
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel() // Stop any current speaking
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voiceCode
    utterance.onend = () => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPlaying: false } : m))
      setIsSpeaking(false)
    }
    utterance.onerror = () => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPlaying: false } : m))
      setIsSpeaking(false)
    }
    window.speechSynthesis.speak(utterance)
  }

  // Send spoken query to LLM Brain
  const sendQuery = async (queryText: string, imageBase64: string | null) => {
    if (!queryText.trim()) return
    
    stopCurrentAudio()
    
    const userMsgId = Date.now().toString()
    const botMsgId = (Date.now() + 1).toString()

    // Add user message with attached photo if exists
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        text: queryText,
        sender: "user",
        language: activeLang,
        imageUrl: imageBase64 || undefined
      }
    ])
    
    setAttachedImage(null) // Reset attached crop photo
    setIsThinking(true)

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          language: activeLang,
          stream: false,
          image_base64: imageBase64 || undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botReply = data.content || data.reply || "Sorry, I could not generate a reply."
        
        setMessages(prev => [
          ...prev,
          {
            id: botMsgId,
            text: botReply,
            sender: "bot",
            language: activeLang
          }
        ])
        
        setIsThinking(false)
        // Automatically play TTS for bot response
        playAudio(botReply, activeLang, botMsgId)
      } else {
        throw new Error("API responded with error")
      }
    } catch (error) {
      console.error("Chat Error:", error)
      const errorMsg = "माफ़ कीजिये, अभी संपर्क नहीं हो पा रहा है। कृपया दोबारा प्रयास करें।"
      setMessages(prev => [
        ...prev,
        {
          id: botMsgId,
          text: errorMsg,
          sender: "bot",
          language: activeLang
        }
      ])
      setIsThinking(false)
      speakViaBrowser(errorMsg, "hi-IN", botMsgId)
    }
  }

  // Handle Web Speech API Speech Recognition
  const toggleListen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome on Android.")
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    stopCurrentAudio()

    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = LANG_CONFIG[activeLang].speechCode
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setInterimText("")
    }

    recognition.onresult = (event: any) => {
      let interim = ""
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) final += transcript
        else interim += transcript
      }
      
      if (final) {
        setInterimText(final)
      } else {
        setInterimText(interim)
      }
    }

    recognition.onerror = (err: any) => {
      console.error("Speech Recognition Error:", err)
      setIsListening(false)
      setInterimText("")
    }

    recognition.onend = () => {
      setIsListening(false)
      // Send the query automatically when speaking ends
      if (interimText.trim()) {
        sendQuery(interimText, attachedImage)
      }
    }

    recognition.start()
  }

  // Photo uploads
  const triggerCamera = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Choose a file under 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachedImage(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeAttachedImage = () => {
    setAttachedImage(null)
  }

  const handleLangSelect = (code: Lang) => {
    stopCurrentAudio()
    setActiveLang(code)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto relative pb-2 px-3 md:px-0">
      {/* Decorative Blurs */}
      <div className="absolute top-0 left-[-20%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-20%] w-[350px] h-[350px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none -z-10" />

      {/* Language Switcher bar */}
      <div className="flex overflow-x-auto gap-1.5 py-3 custom-scrollbar scrollbar-none shrink-0 border-b border-white/[0.06] mb-3">
        {(Object.keys(LANG_CONFIG) as Lang[]).map((code) => {
          const isSelected = activeLang === code
          return (
            <button
              key={code}
              onClick={() => handleLangSelect(code)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-300 whitespace-nowrap border ${
                isSelected
                  ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/15 scale-105"
                  : "bg-white/[0.02] border-white/[0.04] text-muted-foreground hover:text-white"
              }`}
            >
              {LANG_CONFIG[code].label}
            </button>
          )
        })}
      </div>

      {/* Main layout split (Top: Giant mic, Bottom: bubble list) */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden gap-4">
        
        {/* UPPER PORTION: Voice control panel */}
        <div className="flex flex-col items-center justify-center py-6 relative select-none">
          
          {/* Audio ripples */}
          <div className="relative h-44 w-44 flex items-center justify-center">
            <AnimatePresence>
              {isListening && (
                <>
                  <motion.div
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-emerald-500/15 border border-emerald-500/30"
                  />
                  <motion.div
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.7, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut", delay: 0.5 }}
                    className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  />
                </>
              )}
            </AnimatePresence>

            {/* Microphone primary button */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={toggleListen}
              className={`h-32 w-32 rounded-full border flex flex-col items-center justify-center relative z-10 transition-all duration-300 shadow-2xl ${
                isListening
                  ? "bg-gradient-to-tr from-rose-500 to-red-400 border-rose-400 text-white ring-4 ring-rose-500/25"
                  : isSpeaking
                  ? "bg-gradient-to-tr from-sky-500 to-indigo-500 border-sky-400 text-white animate-pulse"
                  : attachedImage
                  ? "bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-400 text-white ring-4 ring-emerald-500/10"
                  : "bg-slate-900 border-white/[0.08] hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300"
              }`}
            >
              {isListening ? (
                <MicOff className="h-10 w-10 animate-bounce" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </motion.button>

            {/* Photo upload camera floating button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <Button
              onClick={triggerCamera}
              className={`absolute bottom-0 right-0 h-11 w-11 rounded-full p-0 flex items-center justify-center z-20 border transition-all duration-300 hover:scale-110 ${
                attachedImage 
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-lg" 
                  : "bg-slate-800 border-white/[0.08] hover:bg-slate-700 text-muted-foreground hover:text-white"
              }`}
            >
              <Camera className="h-4.5 w-4.5" />
            </Button>
          </div>

          {/* Attached Image Thumbnail */}
          {attachedImage && (
            <div className="mt-4 flex items-center gap-2 bg-slate-900 border border-white/[0.06] rounded-xl p-1.5 pr-3 animate-fade-in shadow-lg">
              <img src={attachedImage} className="h-10 w-10 object-cover rounded-lg border border-white/[0.08]" alt="Attached leaf" />
              <div className="text-[10px] text-white/90 font-semibold flex flex-col">
                <span>Photo attached</span>
                <span className="text-muted-foreground">Tap mic to speak question</span>
              </div>
              <button onClick={removeAttachedImage} className="p-1 rounded-full hover:bg-white/[0.08] text-muted-foreground hover:text-white ml-2">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Subtitle instructions / transcripts */}
          <div className="text-center mt-6 min-h-12 max-w-md px-4">
            {isListening ? (
              <span className="text-rose-400 font-bold text-sm animate-pulse flex items-center gap-1.5 justify-center">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                {interimText || LANG_CONFIG[activeLang].placeholder}
              </span>
            ) : isThinking ? (
              <span className="text-emerald-400 font-bold text-sm animate-pulse">
                {t("voice_assistant.status_thinking")}
              </span>
            ) : isSpeaking ? (
              <span className="text-sky-400 font-bold text-sm flex items-center gap-2 justify-center">
                <Volume2 className="h-4.5 w-4.5 animate-bounce" />
                {t("voice_assistant.status_speaking")}
              </span>
            ) : (
              <p className="text-muted-foreground text-xs font-semibold leading-relaxed">
                {LANG_CONFIG[activeLang].placeholder}
              </p>
            )}
          </div>
        </div>

        {/* LOWER PORTION: WhatsApp style Conversation bubbles */}
        <GlassCard className="flex-1 overflow-hidden flex flex-col border border-white/[0.08] backdrop-blur-md shadow-2xl bg-slate-950/20 rounded-3xl relative">
          
          <div className="px-5 py-3 border-b border-white/[0.04] bg-slate-950/40 backdrop-blur-md flex items-center justify-between shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-black flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              {t("voice_assistant.history")}
            </span>
            {messages.length > 1 && (
              <button 
                onClick={() => setMessages([{ id: "welcome", text: LANG_CONFIG[activeLang].welcome, sender: "bot", language: activeLang }])}
                className="text-[10px] text-muted-foreground hover:text-white font-bold flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-xl transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {/* List scroll panel */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isBot = msg.sender === "bot"
                const showPlay = isBot && msg.id !== "welcome"
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-2 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                  >
                    {/* Message Bubble wrapper */}
                    <div className={`rounded-2xl p-3 text-xs md:text-sm leading-relaxed relative flex flex-col gap-2 transition-all duration-300 shadow-md ${
                      isBot
                        ? "bg-slate-900/60 border border-white/[0.04] text-white/90 rounded-tl-sm"
                        : "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-tr-sm font-semibold"
                    }`}>
                      
                      {/* Optional attached query image */}
                      {msg.imageUrl && (
                        <div className="rounded-lg overflow-hidden border border-white/10 max-h-40 overflow-hidden mb-1">
                          <img src={msg.imageUrl} className="w-full object-cover max-h-40" alt="Query reference crop" />
                        </div>
                      )}

                      {/* Text content block */}
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Audio voice note button */}
                      {showPlay && (
                        <div className="flex items-center gap-2 pt-1.5 border-t border-white/[0.05] mt-1 shrink-0">
                          <button
                            onClick={() => msg.isPlaying ? stopCurrentAudio() : playAudio(msg.text, msg.language, msg.id)}
                            className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                              msg.isPlaying 
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                            }`}
                          >
                            {msg.isPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current ml-0.5" />}
                          </button>
                          
                          {/* Animated voice sound waves visualization */}
                          {msg.isPlaying ? (
                            <div className="flex items-center gap-0.5 h-3 px-1">
                              <span className="w-0.5 h-2 bg-emerald-400 rounded animate-[pulse_0.4s_infinite_alternate]" />
                              <span className="w-0.5 h-3 bg-emerald-400 rounded animate-[pulse_0.3s_infinite_alternate_0.1s]" />
                              <span className="w-0.5 h-1.5 bg-emerald-400 rounded animate-[pulse_0.5s_infinite_alternate_0.2s]" />
                              <span className="w-0.5 h-2 bg-emerald-400 rounded animate-[pulse_0.4s_infinite_alternate]" />
                            </div>
                          ) : (
                            <span className="text-[9px] text-muted-foreground font-semibold">
                              Tap to hear response
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {isThinking && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-start gap-2 max-w-[85%] mr-auto"
              >
                <div className="bg-slate-900/60 border border-white/[0.04] p-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-9">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer warning */}
          <div className="p-3 border-t border-white/[0.04] bg-slate-950/40 text-center flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground/60 shrink-0">
            <ShieldAlert className="h-3 w-3 shrink-0" />
            <span>AI advisor recommendations. Always cross-verify with local agronomists.</span>
          </div>

        </GlassCard>

      </div>
    </div>
  )
}

export default function ChatbotPage() {
  const { t } = useLanguage()
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground font-semibold">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
        <span>Configuring Voice-First AI Pipeline...</span>
      </div>
    }>
      <ChatbotInner />
    </Suspense>
  )
}
