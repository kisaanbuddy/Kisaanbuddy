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
import { useSpeech, LANG_TO_BCP47 } from "./useSpeech"
import { actionAcknowledgement, parseVoiceAction, requestedVoiceLanguage, voiceActionUrl, type VoiceFeature } from "@/lib/voice-actions"

interface QuickPromptItem {
  key: string
  icon: string
  prompts: Record<string, string>
}

const QUICK_PROMPTS: QuickPromptItem[] = [
  {
    key: "weather",
    icon: "🌦️",
    prompts: {
      en: "Weather for my farm today?",
      hi: "आज मेरे खेत का मौसम कैसा है?",
      kn: "ಇಂದು ನನ್ನ ಹೊಲದ ಹವಾಮಾನ ಹೇಗಿದೆ?",
      mr: "आज माझ्या शेतातील हवामान कसे आहे?",
      te: "ఈ రోజు నా పొలంలో వాతావరణం ఎలా ఉంది?",
      ta: "இன்று எனது பண்ணையின் வானிலை எப்படி உள்ளது?",
      gu: "આજે મારા ખેતરનું હવામાન કેવું છે?",
      bn: "আজ আমার খামারের আবহাওয়া কেমন?",
      pa: "ਅੱਜ ਮੇਰੇ ਖੇਤ ਦਾ ਮੌਸਮ ਕਿਵੇਂ ਹੈ?",
      ml: "ഇന്ന് എന്റെ തോട്ടത്തിലെ കാലാവസ്ഥ എങ്ങനെയാണ്?",
      hi_en: "Aaj mere khet ka mausam kaisa hai?",
    },
  },
  {
    key: "crop",
    icon: "🌾",
    prompts: {
      en: "Which crop should I plant this season?",
      hi: "इस मौसम में कौन सी फसल लगाऊँ?",
      kn: "ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?",
      mr: "या हंगामात मी कोणते पीक घ्यावे?",
      te: "ఈ సీజన్‌లో నేను ఏ పంట వేయాలి?",
      ta: "இந்த பருவத்தில் நான் எந்த பயிர் நடவு செய்ய வேண்டும்?",
      gu: "આ સિઝનમાં મારે કયો પાક વાવવો જોઈએ?",
      bn: "এই মৌসুমে কোন ফসল রোপণ করা উচিত?",
      pa: "ਇਸ ਸੀਜ਼ਨ ਵਿੱਚ ਮੈਨੂੰ ਕਿਹੜੀ ਫਸਲ ਲਗਾਉਣੀ ਚਾਹੀਦੀ ਹੈ?",
      ml: "ഈ സീസണിൽ ഞാൻ ഏത് വിള നടണം?",
      hi_en: "Is season me kaun si fasal lagayein?",
    },
  },
  {
    key: "schemes",
    icon: "📋",
    prompts: {
      en: "What government schemes can help me?",
      hi: "मेरे लिए कौन सी सरकारी योजनाएँ हैं?",
      kn: "ನನಗೆ ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿವೆ?",
      mr: "माझ्यासाठी कोणत्या सरकारी योजना आहेत?",
      te: "నాకు ఏ ప్రభుత్వ పథకాలు ఉపయోగపడతాయి?",
      ta: "எனக்கு உதவும் அரசு திட்டங்கள் என்ன?",
      gu: "મને કઈ સરકારી યોજનાઓ મદદ કરી શકે છે?",
      bn: "কোন সরকারি প্রকল্পগুলো আমাকে সাহায্য করতে পারে?",
      pa: "ਮੇਰੇ ਲਈ ਕਿਹੜੀਆਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਹਨ?",
      ml: "എനിക്ക് സഹായകരമായ സർക്കാർ പദ്ധതികൾ ഏവ?",
      hi_en: "Mere liye kaun si sarkari yojanaen hain?",
    },
  },
]

function pickPrompt(p: QuickPromptItem, lang: Language): string {
  return p.prompts[lang] || p.prompts.en
}

const GREETINGS: Record<string, string> = {
  en: "Namaste! I'm your KisaanBuddy Assistant.",
  hi: "नमस्ते! मैं आपका किसानमित्र सहायक हूँ।",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕಿಸಾನ್‌ಬಡ್ಡೀ ಸಹಾಯಕ.",
  mr: "नमस्ते! मी तुमचा किसानमित्र सहाय्यक आहे.",
  te: "నమస్కారం! నేను మీ కిసాన్‌బడ్డీ సహాయకుడిని.",
  ta: "வணக்கம்! நான் உங்கள் கிசான்பட்டி உதவியாளர்.",
  gu: "નમસ્તે! હું તમારો કિસાનબડી સહાયક છું.",
  bn: "নমস্কার! আমি আপনার কিষাণবাডি সহকারী।",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਕਿਸਾਨਬੱਡੀ ਸਹਾਇਕ ਹਾਂ।",
  ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കിസാൻബഡ്ഡി അസിസ്റ്റന്റ് ആണ്.",
  hi_en: "Namaste! Main aapka KisaanBuddy sahayak hoon.",
}

const GREETING_SUBS: Record<string, string> = {
  en: "Ask me about real-time weather, crop suitability, or government grants.",
  hi: "मौसम, फसल जांच, या सरकारी योजनाओं के बारे में कुछ भी पूछें।",
  kn: "ಹವಾಮಾನ, ಬೆಳೆ ಪರೀಕ್ಷೆ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.",
  mr: "हवामान, पीक सल्ला किंवा सरकारी योजनांबद्दल काहीही विचारा.",
  te: "వాతావరణం, పంట సలహా లేదా ప్రభుత్వ పథకాల గురించి అడగండి.",
  ta: "வானிலை, பயிர் ஆலோசனை அல்லது அரசு திட்டங்கள் பற்றி கேளுங்கள்.",
  gu: "હવામાન, પાકની માહિતી અથવા સરકારી યોજનાઓ વિશે પૂછો.",
  bn: "আবহাওয়া, ফসলের পরামর্শ বা সরকারি প্রকল্প সম্পর্কে জিজ্ঞাসা করুন।",
  pa: "ਮੌਸਮ, ਫਸਲ ਦੀ ਸਲਾਹ ਜਾਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ।",
  ml: "കാലാവസ്ഥ, വിള ഉപദേശം അല്ലെങ്കിൽ സർക്കാർ പദ്ധതികളെക്കുറിച്ച് ചോദിക്കുക.",
  hi_en: "Mausam, fasal checkup, ya sarkar ki yojnaon ke baare mein poochhein.",
}

const PLACEHOLDERS: Record<string, string> = {
  en: "Ask about weather, crops, or schemes…",
  hi: "अपना सवाल लिखें या माइक दबाएँ…",
  kn: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿರಿ…",
  mr: "तुमचा प्रश्न लिहा किंवा माइक दाबा…",
  te: "మీ ప్రశ్నను టైప్ చేయండి లేదా మైక్ నొక్కండి…",
  ta: "உங்கள் கேள்வியை எழுதுங்கள் அல்லது மைக்கை அழுத்தவும்…",
  gu: "તમારો પ્રશ્ન લખો અથવા માઇક દબાવો…",
  bn: "আপনার প্রশ্ন লিখুন বা মাইক চাপুন…",
  pa: "ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ ਜਾਂ ਮਾਈਕ ਦਬਾਓ…",
  ml: "നിങ്ങളുടെ ചോദ്യം എഴുതുക അല്ലെങ്കിൽ മൈക്ക് അമർത്തുക…",
  hi_en: "Apna sawaal likhein ya mic dabayein…",
}

const LEAF_HELP: Record<string, string> = {
  en: "Hit Send to run AI diagnostics on this leaf.",
  hi: "भेजें दबाकर पत्ती की बीमारी का उपचार पता करें।",
  kn: "Send ಒತ್ತಿರಿ — ರೋಗ ಪತ್ತೆ ಹಚ್ಚಿ ಪರಿಹಾರ ಪಡೆಯಿರಿ.",
  mr: "Send दाबा आणि पानांच्या रोगाचे निदान व उपाय मिळवा.",
  te: "Send నొక్కండి - ఆకు తెగులు నిర్ధారణ మరియు నివారణ పొందండి.",
  ta: "Send அழுத்தவும் - இலை நோய் கண்டறிதல் மற்றும் தீர்வு பெறவும்.",
  gu: "Send દબાવો અને પાંદડાના રોગનું નિદાન અને ઉપાય મેળવો.",
  bn: "Send চাপুন এবং পাতার রোগ নির্ণয় ও প্রতিকার পান।",
  pa: "Send ਦਬਾਓ ਅਤੇ ਪੱਤੇ ਦੀ ਬਿਮਾਰੀ ਦਾ ਇਲਾਜ ਲੱਭੋ।",
  ml: "Send അമർത്തുക - ഇല രോഗനിർണയവും പരിഹാരവും നേടുക.",
  hi_en: "Send dabakar patti ki bimari ka treatment pata karein.",
}

const ATTACH_LABELS: Record<string, string> = {
  en: "Attach a leaf / plant photo (disease detection)",
  hi: "पत्ती / पौधे की फोटो जोड़ें (रोग पहचान)",
  kn: "ಎಲೆ / ಗಿಡದ ಫೋಟೋ ಲಗತ್ತಿಸಿ (ರೋಗ ಪತ್ತೆ)",
  mr: "पानांचा / रोपाचा फोटो जोडा (रोग निदान)",
  te: "ఆకు / మొక్క ఫోటో జోడించండి (తెగులు నిర్ధారణ)",
  ta: "இலை / செடி புகைப்படத்தை இணைக்கவும் (நோய் கண்டறிதல்)",
  gu: "પાંદડા / છોડનો ફોટો જોડો (રોગ નિદાન)",
  bn: "পাতা / গাছের ছবি যুক্ত করুন (রোগ নির্ণয়)",
  pa: "ਪੱਤੇ / ਪੌਦੇ ਦੀ ਫੋਟੋ ਨੱਥੀ ਕਰੋ (ਬਿਮਾਰੀ ਜਾਂਚ)",
  ml: "ഇല / ചെടിയുടെ ഫോട്ടോ അറ്റാച്ചുചെയ്യുക (രോഗനിർണയം)",
  hi_en: "Patti / paude ki photo attach karein (disease detection)",
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const { t, setLang } = useLanguage()
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
  const lastFeatureRef = useRef<VoiceFeature | null>(null)
  const languageSwitchRef = useRef<(text: string) => boolean>(() => false)

  const executeVoiceAction = useCallback((text: string) => {
    const action = parseVoiceAction(text, lastFeatureRef.current)
    if (!action) return false
    lastFeatureRef.current = action.feature
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(actionAcknowledgement(action, language))
      utterance.lang = (language !== "auto" && LANG_TO_BCP47[language]) ? LANG_TO_BCP47[language] : "hi-IN"
      window.speechSynthesis.speak(utterance)
    }
    if (action.historyBack) {
      window.setTimeout(() => window.history.back(), 350)
      return true
    }
    window.setTimeout(() => window.location.assign(voiceActionUrl(action)), 450)
    return true
  }, [language])

  // ---- Speech wiring ----
  const handleFinalTranscript = useCallback(
    (text: string) => {
      setInterim("")
      if (languageSwitchRef.current(text)) return
      // Navigation/searches are safe to run without a confirmation. Pages
      // execute only their own allow-listed parameters; saving remains a
      // separate, confirmed interaction.
      if (executeVoiceAction(text)) return
      // Agricultural questions that do not map to a UI action still go to the
      // backed assistant, which can use its server-side live-data tools.
      void send(text)
    },
    [send, executeVoiceAction]
  )

  const speech = useSpeech({
    language,
    onFinalTranscript: handleFinalTranscript,
    onInterim: (t) => setInterim(t),
    onError: () => {
      setInterim("")
    },
  })

  const applyLanguageSwitch = useCallback((text: string) => {
    const requested = requestedVoiceLanguage(text)
    if (!requested) return false
    setLanguage(requested)
    setLang(requested)
    const confirmation = {
      en: "I will continue in English.",
      hi: "अब मैं हिंदी में बात करूंगा।",
      hi_en: "Ab main Hinglish mein baat karunga.",
      kn: "ಇನ್ನು ನಾನು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುತ್ತೇನೆ.",
    }[requested]
    speech.stopSpeaking()
    speech.speak(confirmation, requested)
    return true
  }, [setLanguage, setLang, speech])

  useEffect(() => {
    languageSwitchRef.current = applyLanguageSwitch
  }, [applyLanguageSwitch])

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
      if (t && !pendingImage && applyLanguageSwitch(t)) {
        setInput("")
        return
      }
      if (t && !pendingImage && executeVoiceAction(t)) return
      const img = pendingImage
      setInput("")
      setPendingImage(null)
      void send(t, img ?? undefined)
    },
    [input, pendingImage, isSending, send, executeVoiceAction, applyLanguageSwitch]
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

  const placeholder = PLACEHOLDERS[language] || PLACEHOLDERS.en

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="glass-panel fixed bottom-24 right-4 z-[60] flex h-[min(600px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden border border-border backdrop-blur-xl bg-card/95 shadow-2xl rounded-3xl text-card-foreground"
      role="dialog"
      aria-label={t("common.KisaanBuddy_assistant")}
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-black shadow-sm shrink-0">
            K
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-foreground leading-none font-display">
              KisaanBuddy Assistant
            </div>
            <div className="text-[9px] text-muted-foreground leading-none mt-1 flex items-center gap-1 font-semibold">
              <span className={`h-1.5 w-1.5 rounded-full ${activeTool || isSending ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
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
            
            <div className="text-xs font-bold text-foreground font-display mt-1">
              {GREETINGS[language] || GREETINGS.en}
            </div>
            
            <div className="text-[11px] text-muted-foreground leading-relaxed max-w-[240px]">
              {GREETING_SUBS[language] || GREETING_SUBS.en}
            </div>

            <div className="flex flex-col w-full gap-2 mt-4 text-left">
              {QUICK_PROMPTS.map((p) => {
                const label = pickPrompt(p, language)
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => submit(label)}
                    className="flex items-center gap-2.5 text-[11px] px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all font-semibold shadow-xs"
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
          <div className="text-[10px] font-bold text-red-500 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            {lastError}
          </div>
        )}
      </div>

      {/* Interim voice transcript live view */}
      <TranscriptLive text={interim} active={speech.listening} />

      {/* Pending image preview */}
      {pendingImage && (
        <div className="flex flex-shrink-0 items-center gap-2 border-t border-border bg-muted/40 px-4 py-2.5">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage}
              alt={t("common.uploaded_leaf")}
              className="h-12 w-12 rounded-xl object-cover border border-border"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border text-foreground hover:text-destructive transition-colors"
              aria-label={t("common.remove_photo")}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground leading-relaxed font-medium">
            <ImageIcon className="mr-1.5 inline h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            {LEAF_HELP[language] || LEAF_HELP.en}
          </div>
        </div>
      )}

      {/* Input composer area */}
      <div className="flex flex-shrink-0 items-center gap-2 border-t border-border bg-muted/30 px-3 py-3">
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
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={ATTACH_LABELS[language] || ATTACH_LABELS.en}
          title={ATTACH_LABELS[language] || ATTACH_LABELS.en}
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
          className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground"
          disabled={isSending && !!input}
        />

        {isSending ? (
          <button
            type="button"
            onClick={cancel}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border text-amber-500"
            aria-label={t("common.stop_generating")}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </button>
        ) : input.trim() || pendingImage ? (
          <button
            type="button"
            onClick={() => submit()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95"
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
