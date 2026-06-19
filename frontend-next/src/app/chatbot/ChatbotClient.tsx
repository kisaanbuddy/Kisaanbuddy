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

const ONBOARDING_HELPERS = {
  en: {
    title: "Quick Ask Templates",
    desc: "Tap any of these common topics to ask the AI assistant immediately:",
    suggestions: [
      { text: "What is the current Minimum Support Price (MSP) for Wheat in Punjab?", label: "Wheat MSP" },
      { text: "My tomato leaves have yellow rings and black spots. What disease is this and how do I treat it?", label: "Tomato Disease" },
      { text: "What is the ideal NPK ratio for sugarcane crops in Maharashtra?", label: "Sugarcane NPK" },
      { text: "How can I apply for PM-Kisan Samman Nidhi scheme in Rajasthan?", label: "PM-Kisan Scheme" }
    ],
    guideTitle: "How to Use KisaanBuddy Voice AI",
    guideSteps: [
      "Tap the microphone button and speak in your preferred language (Hindi, Kannada, Telugu, etc.).",
      "Tap the camera button to upload or take a photo of a diseased leaf for instant AI diagnostics.",
      "Click the speaker icon on any AI response to listen to it in your local language."
    ],
    faqTitle: "Voice Assistant Frequently Asked Questions",
  },
  hi: {
    title: "त्वरित प्रश्न सुझाव",
    desc: "एआई सहायक से तुरंत पूछने के लिए नीचे दिए गए किसी भी विषय पर टैप करें:",
    suggestions: [
      { text: "पंजाब में गेहूं के लिए वर्तमान न्यूनतम समर्थन मूल्य (MSP) क्या है?", label: "गेहूं का MSP" },
      { text: "मेरे टमाटर के पत्तों पर पीले छल्ले और काले धब्बे हैं। यह कौन सा रोग है और इसका इलाज क्या है?", label: "टमाटर का रोग" },
      { text: "महाराष्ट्र में गन्ने की फसल के लिए आदर्श NPK अनुपात क्या है?", label: "गन्ने का NPK" },
      { text: "मैं राजस्थान में पीएम-किसान सम्मान निधि योजना के लिए कैसे आवेदन कर सकता हूं?", label: "पीएम-किसान योजना" }
    ],
    guideTitle: "किसानमित्र वॉयस एआई का उपयोग कैसे करें",
    guideSteps: [
      "माइक्रोफोन बटन पर टैप करें और अपनी पसंदीदा भाषा (हिंदी, कन्नड़, तेलुगु आदि) में बोलें।",
      "त्वरित एआई निदान के लिए रोगग्रस्त पत्ती की फोटो अपलोड करने के लिए कैमरा बटन पर टैप करें।",
      "अपनी स्थानीय भाषा में सुनने के लिए किसी भी एआई उत्तर पर स्पीकर आइकन पर क्लिक करें।"
    ],
    faqTitle: "वॉयस असिस्टेंट के बारे में अक्सर पूछे जाने वाले प्रश्न (FAQ)",
  }
}

const CHATBOT_FAQS = {
  en: [
    {
      q: "How does KisaanBuddy Voice Assistant work?",
      a: "It uses your device's microphone to capture your speech, converts it to text, processes it using our specialized agricultural AI model, and responds both in text and spoken audio in your selected language."
    },
    {
      q: "Which Indian languages are supported?",
      a: "Currently, KisaanBuddy supports voice recognition and speech playback in Hindi, Kannada, Telugu, Tamil, Marathi, Bengali, and English."
    },
    {
      q: "How do I use the camera features for disease detection?",
      a: "Tap the camera icon next to the mic, select or take a photo of the affected crop leaf, then tap the mic and speak your question. The AI will analyze the visual symptoms and provide a diagnostic response."
    },
    {
      q: "Is there any charge for using this service?",
      a: "No, KisaanBuddy is completely free for all Indian farmers. Standard internet data charges from your mobile operator may apply."
    },
    {
      q: "Why is the voice feature not working on my phone?",
      a: "Voice speech recognition works best on Google Chrome on Android devices. Make sure you have granted microphone permissions to the website. iOS users can use speech recognition inside Safari as well."
    },
    {
      q: "Can I use KisaanBuddy offline?",
      a: "No, KisaanBuddy requires an active internet connection (works fine on low-speed 3G or 4G) to process voice queries and query the AI database."
    },
    {
      q: "How accurate is the agricultural advice?",
      a: "The advice is based on official agricultural packages of practices and research. However, since farming conditions vary dynamically by region, always cross-verify critical inputs with local block officers or Krishi Vigyan Kendras."
    },
    {
      q: "Are my voice recordings saved by KisaanBuddy?",
      a: "No, we only process the audio in real-time to transcribe it into text. Your voice recordings are not stored on our servers, protecting your privacy."
    },
    {
      q: "How do I change the language of the voice responses?",
      a: "The assistant automatically speaks in the language you select in the top navigation bar of KisaanBuddy. Simply change the language there, and the assistant will match it."
    },
    {
      q: "Can KisaanBuddy help me with mandi rates and weather info too?",
      a: "Yes. You can speak queries like 'What is the mandi rate of potato in Indore?' or 'Show weather forecast for Bhopal' and the AI will fetch the latest details for you."
    }
  ],
  hi: [
    {
      q: "किसानमित्र वॉयस असिस्टेंट कैसे काम करता है?",
      a: "यह आपके डिवाइस के माइक्रोफ़ोन का उपयोग करके आपकी आवाज़ को रिकॉर्ड करता है, उसे टेक्स्ट में बदलता है, और हमारे कृषि एआई मॉडल की मदद से आपकी चुनी हुई भाषा में लिखित और बोलकर उत्तर देता है।"
    },
    {
      q: "कौन सी भारतीय भाषाएं समर्थित हैं?",
      a: "वर्तमान में, किसानमित्र हिंदी, कन्नड़, तेलुगु, तमिल, मराठी, बंगाली और अंग्रेजी में आवाज पहचान और आवाज उत्तर का समर्थन करता है।"
    },
    {
      q: "रोग पहचान के लिए कैमरा सुविधा का उपयोग कैसे करें?",
      a: "माइक के बगल में स्थित कैमरा आइकन पर टैप करें, प्रभावित फसल की पत्ती की फोटो चुनें या लें, फिर माइक दबाकर अपना प्रश्न बोलें। एआई लक्षणों का विश्लेषण करके आपको बीमारी का नाम और उपचार बताएगा।"
    },
    {
      q: "क्या इस सेवा का उपयोग करने के लिए कोई शुल्क है?",
      a: "नहीं, किसानमित्र सभी भारतीय किसानों के लिए पूरी तरह से मुफ्त है। आपके मोबाइल ऑपरेटर द्वारा केवल इंटरनेट डेटा शुल्क लागू हो सकते हैं।"
    },
    {
      q: "मेरे फोन पर वॉयस फीचर काम क्यों नहीं कर रहा है?",
      a: "आवाज पहचान की सुविधा एंड्रॉइड डिवाइस पर गूगल क्रोम (Google Chrome) ब्राउज़र में सबसे अच्छी तरह काम करती है। सुनिश्चित करें कि आपने वेबसाइट को माइक्रोफोन का उपयोग करने की अनुमति दी है।"
    },
    {
      q: "क्या मैं किसानमित्र का ऑफ़लाइन उपयोग कर सकता हूँ?",
      a: "नहीं, वॉयस प्रश्नों को प्रोसेस करने और एआई डेटाबेस से उत्तर प्राप्त करने के लिए एक सक्रिय इंटरनेट कनेक्शन की आवश्यकता होती है।"
    },
    {
      q: "प्रदान की गई कृषि सलाह कितनी सटीक है?",
      a: "सलाह आधिकारिक कृषि विज्ञान केंद्रों और विश्वविद्यालयों की प्रथाओं पर आधारित है। फिर भी, क्षेत्रीय परिस्थितियों के अनुसार बदलाव हो सकते हैं, इसलिए किसी भी बड़े निवेश से पहले स्थानीय कृषि अधिकारियों से सलाह लें।"
    },
    {
      q: "क्या मेरी वॉयस रिकॉर्डिंग को किसानमित्र द्वारा सहेजा जाता है?",
      a: "नहीं, हम आवाज को केवल वास्तविक समय में टेक्स्ट में बदलने के लिए प्रोसेस करते हैं। आपकी निजता की सुरक्षा के लिए आपकी वॉयस रिकॉर्डिंग हमारे सर्वर पर सहेजी नहीं जाती है।"
    },
    {
      q: "मैं आवाज प्रतिक्रियाओं की भाषा कैसे बदल सकता हूँ?",
      a: "सहायक स्वचालित रूप से उस भाषा में बोलता है जिसे आप किसानमित्र के शीर्ष नेविगेशन बार में चुनते हैं। बस वहां भाषा बदलें, और सहायक उसे अपना लेगा।"
    },
    {
      q: "क्या किसानमित्र मुझे मंडी भाव और मौसम की जानकारी भी दे सकता है?",
      a: "हाँ। आप 'इंदौर में आलू का मंडी भाव क्या है?' या 'भोपाल के मौसम का हाल बताओ' जैसे सवाल बोल सकते हैं और एआई आपको नवीनतम जानकारी प्रदान करेगा।"
    }
  ]
}

function ChatbotInner() {
  const { t, lang: globalLang } = useLanguage()
  const searchParams = useSearchParams()

  const [activeLang, setActiveLang] = useState<Lang>("hi")
  const [messages, setMessages] = useState<Message[]>([])
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null)
  
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

            {/* Empty state onboarding helper dashboard & FAQs */}
            {messages.length <= 1 && (
              <div className="mt-8 border-t border-white/[0.06] pt-8 space-y-8 animate-fade-in text-left">
                {/* Onboarding suggestions */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3">
                    {activeLang === 'en' ? ONBOARDING_HELPERS.en.title : ONBOARDING_HELPERS.hi.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4 font-semibold">
                    {activeLang === 'en' ? ONBOARDING_HELPERS.en.desc : ONBOARDING_HELPERS.hi.desc}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(activeLang === 'en' ? ONBOARDING_HELPERS.en.suggestions : ONBOARDING_HELPERS.hi.suggestions).map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => sendQuery(sug.text, null)}
                        className="text-left p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all group flex flex-col gap-1 cursor-pointer animate-fade-in"
                      >
                        <span className="text-xs font-black text-emerald-400/90 group-hover:text-emerald-400 transition-colors">
                          {sug.label}
                        </span>
                        <span className="text-xs text-muted-foreground leading-relaxed font-medium">
                          "{sug.text}"
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simple guide steps */}
                <div className="bg-white/[0.01] border border-white/[0.04] p-4.5 rounded-2xl">
                  <h4 className="text-xs font-black text-white mb-3">
                    {activeLang === 'en' ? ONBOARDING_HELPERS.en.guideTitle : ONBOARDING_HELPERS.hi.guideTitle}
                  </h4>
                  <ul className="space-y-2.5">
                    {(activeLang === 'en' ? ONBOARDING_HELPERS.en.guideSteps : ONBOARDING_HELPERS.hi.guideSteps).map((step, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2.5 leading-relaxed font-semibold">
                        <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FAQ section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3">
                    {activeLang === 'en' ? ONBOARDING_HELPERS.en.faqTitle : ONBOARDING_HELPERS.hi.faqTitle}
                  </h4>
                  <div className="space-y-2">
                    {(activeLang === 'en' ? CHATBOT_FAQS.en : CHATBOT_FAQS.hi).map((faq, i) => {
                      const isOpen = faqOpenIndex === i
                      return (
                        <div 
                          key={i} 
                          className="rounded-xl border border-white/[0.04] bg-white/[0.01] overflow-hidden transition-all duration-300"
                        >
                          <button
                            type="button"
                            onClick={() => setFaqOpenIndex(isOpen ? null : i)}
                            className="w-full text-left p-3.5 flex justify-between items-center text-xs font-black text-white hover:bg-white/[0.02] transition-colors cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <span className="text-muted-foreground text-sm font-light leading-none shrink-0 ml-2">
                              {isOpen ? '−' : '+'}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="p-3.5 pt-0 border-t border-white/[0.03] text-xs text-muted-foreground leading-relaxed bg-white/[0.005] font-medium animate-fade-in">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
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
