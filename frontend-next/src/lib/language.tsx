"use client"

import { createContext, useContext, useLayoutEffect, useEffect, useState } from "react"
import en from "./locales/en.json"
import { translateText, translateBatch } from "./translation-client"

// Dynamic loaders for non-default languages to eliminate ~900 KB of unused JSON from initial bundle
const LOCALE_LOADERS: Record<Lang, () => Promise<any>> = {
  en: async () => en,
  hi: () => import("./locales/hi.json").then((m) => m.default),
  kn: () => import("./locales/kn.json").then((m) => m.default),
  ta: () => import("./locales/ta.json").then((m) => m.default),
  te: () => import("./locales/te.json").then((m) => m.default),
  mr: () => import("./locales/mr.json").then((m) => m.default),
  gu: () => import("./locales/gu.json").then((m) => m.default),
  bn: () => import("./locales/bn.json").then((m) => m.default),
  pa: () => import("./locales/pa.json").then((m) => m.default),
  ml: () => import("./locales/ml.json").then((m) => m.default),
  hi_en: () => import("./locales/hi_en.json").then((m) => m.default),
}

export type Lang = "en" | "hi" | "kn" | "ta" | "te" | "ml" | "mr" | "bn" | "pa" | "gu" | "hi_en"

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
  ta: "தமிழ்",
  te: "తెలుగు",
  ml: "മലയാളം",
  mr: "मराठी",
  bn: "বাংলা",
  pa: "ਪੰਜਾਬੀ",
  gu: "ગુજરાતી",
  hi_en: "Hinglish",
}

export const LANG_DETAILS: Record<Lang, { native: string; en: string }> = {
  en: { native: "English", en: "English" },
  hi: { native: "हिन्दी", en: "Hindi" },
  kn: { native: "ಕನ್ನಡ", en: "Kannada" },
  ta: { native: "தமிழ்", en: "Tamil" },
  te: { native: "తెలుగు", en: "Telugu" },
  ml: { native: "മലയാളം", en: "Malayalam" },
  mr: { native: "मराठी", en: "Marathi" },
  bn: { native: "বাংলা", en: "Bengali" },
  pa: { native: "ਪੰਜਾਬੀ", en: "Punjabi" },
  gu: { native: "ગુજરાતી", en: "Gujarati" },
  hi_en: { native: "Hinglish", en: "Hinglish" },
}

export const LANG_FLAGS: Record<Lang, string> = {
  en: "🇬🇧",
  hi: "🇮🇳",
  kn: "🇮🇳",
  ta: "🇮🇳",
  te: "🇮🇳",
  ml: "🇮🇳",
  mr: "🇮🇳",
  bn: "🇮🇳",
  pa: "🇮🇳",
  gu: "🇮🇳",
  hi_en: "🇮🇳",
}

export interface LanguageMeta {
  code: Lang
  native: string
  en: string
  scriptChar: string
  region: string
  greeting: string
}

export const PRIMARY_FARMER_LANGS: LanguageMeta[] = [
  {
    code: "hi",
    native: "हिन्दी",
    en: "Hindi",
    scriptChar: "अ",
    region: "उत्तर व मध्य भारत",
    greeting: "नमस्ते किसान जी!",
  },
  {
    code: "kn",
    native: "ಕನ್ನಡ",
    en: "Kannada",
    scriptChar: "ಅ",
    region: "ಕರ್ನಾಟಕ",
    greeting: "ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ!",
  },
  {
    code: "te",
    native: "తెలుగు",
    en: "Telugu",
    scriptChar: "అ",
    region: "ఆంధ్రప్రదేశ్ & తెలంగాణ",
    greeting: "నమస్కారం రైతు సోదరులారా!",
  },
  {
    code: "ta",
    native: "தமிழ்",
    en: "Tamil",
    scriptChar: "அ",
    region: "தமிழ்நாடு",
    greeting: "வணக்கம் விவசாய பெருமக்களே!",
  },
  {
    code: "mr",
    native: "मराठी",
    en: "Marathi",
    scriptChar: "अ",
    region: "महाराष्ट्र",
    greeting: "नमस्कार शेतकरी बांधवांनो!",
  },
  {
    code: "bn",
    native: "বাংলা",
    en: "Bengali",
    scriptChar: "অ",
    region: "পশ্চিমবঙ্গ ও ত্রিপুরা",
    greeting: "নমস্কার কৃষক বন্ধু!",
  },
  {
    code: "gu",
    native: "ગુજરાતી",
    en: "Gujarati",
    scriptChar: "અ",
    region: "ગુજરાત",
    greeting: "નમસ્તે ખેડૂત મિત્રો!",
  },
  {
    code: "en",
    native: "English",
    en: "English",
    scriptChar: "En",
    region: "All India",
    greeting: "Welcome Farmer!",
  },
]

// All 11 supported Indian languages
export const SELECTABLE_LANGS: Lang[] = [
  "en",
  "hi",
  "kn",
  "ta",
  "te",
  "mr",
  "gu",
  "bn",
  "pa",
  "ml",
  "hi_en",
]

export const SESSION_LANG_KEY = "kisaanbuddy_session_lang"
export const SESSION_CONFIRMED_KEY = "kisaanbuddy_session_confirmed"

// In-memory cache of loaded locales (English bundled statically as instant fallback)
export const T: Record<string, any> = { en }

export async function loadLocale(targetLang: Lang): Promise<any> {
  if (T[targetLang]) return T[targetLang]
  const loader = LOCALE_LOADERS[targetLang]
  if (!loader) return en
  try {
    const data = await loader()
    T[targetLang] = data
    return data
  } catch (err) {
    console.error(`Failed to load locale: ${targetLang}`, err)
    return en
  }
}

function applyOverrides(base: any, overrides: Record<string, string>) {
  const next = structuredClone(base)
  for (const [key, value] of Object.entries(overrides)) {
    const parts = key.split(".")
    let target = next
    for (const part of parts.slice(0, -1)) {
      if (target?.[part] === undefined || target?.[part] === null) target[part] = {}
      target = target[part]
    }
    if (target && parts.length) target[parts[parts.length - 1]] = value
  }
  return next
}

const NAMESPACE_TITLES: Record<string, Record<string, string>> = {
  dashboard: {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    ta: "டாஷ்போர்டு",
    te: "దాష్‌బోర్డ్",
    ml: "ഡാഷ്‌ബോർഡ്",
    mr: "डॅशबोर्ड",
    bn: "ড্যাশবোর্ড",
    pa: "ਡੈਸ਼ਬੋਰਡ",
    gu: "ડેશબોર્ડ",
    hi_en: "Dashboard"
  },
  weather: {
    en: "Weather",
    hi: "मौसम",
    kn: "ಹವಾಮಾನ",
    ta: "வானிலை",
    te: "హవామానం",
    ml: "കാലാവസ്ഥ",
    mr: "हवामान",
    bn: "আবহাওয়া",
    pa: "ਮੌਸਮ",
    gu: "હવામાન",
    hi_en: "Mausam"
  },
  mandi: {
    en: "Mandi",
    hi: "मंडी",
    kn: "ಮಂಡಿ",
    ta: "மண்டி விலைகள்",
    te: "మండి ధరలు",
    ml: "മണ്ടി നിരക്കുകൾ",
    mr: "मंडी दर",
    bn: "মান্ডি দর",
    pa: "ਮੰਡੀ ਰੇਟ",
    gu: "મંડી દર",
    hi_en: "Mandi Rates"
  },
  schemes: {
    en: "Schemes",
    hi: "योजनाएं",
    kn: "ಯೋಜನೆಗಳು",
    ta: "திட்டங்கள்",
    te: "పథకాలు",
    ml: "പദ്ധതികൾ",
    mr: "योजना",
    bn: "প্রকল্প",
    pa: "ਯੋਜਨਾਵਾਂ",
    gu: "યોજનાઓ",
    hi_en: "Govt Schemes"
  },
  founders: {
    en: "Founders",
    hi: "संस्थापक",
    kn: "ಸ್ಥಾಪಕರು",
    ta: "நிறுவனர்கள்",
    te: "వ్యవస్థాపకులు",
    ml: "സ്ഥാപകർ",
    mr: "संस्थापक",
    bn: "প্রতিষ্ঠাতা",
    pa: "ਸੰਸਥਾਪਕ",
    gu: "સ્થાપક",
    hi_en: "Founders"
  },
  hardware: {
    en: "Smart Hub",
    hi: "स्मार्ट हब",
    kn: "ಸ್ಮಾರ್ಟ್ ಹಬ್",
    ta: "ஸ்மார்ட் ஹப்",
    te: "ಸ್ಮಾರ್ಟ್ ಹಬ್",
    ml: "ಸ್ಮಾರ್ಟ್ ಹಬ್",
    mr: "स्मार्ट हब",
    bn: "স্মার্ট হাব",
    pa: "ਸਮਾਰਟ ਹੱਬ",
    gu: "સ્માર્ટ હબ",
    hi_en: "Smart Hub"
  }
}

export interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => any
  isReady: boolean
  isLanguageSelected: boolean
  isLanguageModalOpen: boolean
  openLanguageModal: () => void
  closeLanguageModal: () => void
  resetLanguagePreference: () => void
  translateDynamic: (text: string) => Promise<string>
  translateDynamicBatch: (texts: string[]) => Promise<string[]>
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "hi",
  setLang: () => {},
  t: (key) => key,
  isReady: false,
  isLanguageSelected: false,
  isLanguageModalOpen: false,
  openLanguageModal: () => {},
  closeLanguageModal: () => {},
  resetLanguagePreference: () => {},
  translateDynamic: async (text) => text,
  translateDynamicBatch: async (texts) => texts,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi")
  const [translations, setTranslations] = useState<any>(en)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false)

  // Session-scoped language detection:
  // Shows language selection screen on EVERY fresh visit.
  // Re-uses selection only within the current active browser tab session.
  useLayoutEffect(() => {
    // 1. Proactively clear any legacy permanent language storage to avoid auto-selection
    try {
      localStorage.removeItem("kisaanbuddy_farmer_lang_confirmed")
      localStorage.removeItem("kisaanbuddy_lang_confirmed")
      localStorage.removeItem("kisaanbuddy_lang")
      localStorage.removeItem("KisaanBuddy_lang")
      localStorage.removeItem("krishi_lang")
      localStorage.removeItem("krishiai_lang")
      document.cookie = "kisaanbuddy_lang=; Path=/; Max-Age=0"
      document.cookie = "kisaanbuddy_farmer_lang_confirmed=; Path=/; Max-Age=0"
    } catch {
      // Storage might be restricted in some browser privacy modes
    }

    // 2. Read session-scoped storage
    try {
      const isConfirmed = sessionStorage.getItem(SESSION_CONFIRMED_KEY) === "true"
      const saved = sessionStorage.getItem(SESSION_LANG_KEY) as Lang | null

      if (isConfirmed && saved && SELECTABLE_LANGS.includes(saved)) {
        setLangState(saved)
        setIsLanguageSelected(true)
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved
        }
        if (saved === "en") {
          setTranslations(en)
        } else {
          void loadLocale(saved).then((data) => {
            setTranslations(data)
          })
        }
      } else {
        // Fresh browsing session: language selection screen MUST be displayed
        setIsLanguageSelected(false)
      }
    } catch {
      setIsLanguageSelected(false)
    }

    setIsReady(true)
  }, [])

  // Content override loader (non-blocking fallback to bundled JSON)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      let base: any = T[lang] || (lang === "en" ? en : await loadLocale(lang))
      try {
        const response = await fetch(`/api/content/${lang}`, { cache: "no-store" })
        const overrides = response.ok ? await response.json() : {}
        if (!cancelled) setTranslations(applyOverrides(base, overrides))
      } catch {
        if (!cancelled) setTranslations(base)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [lang])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang
    }
  }, [lang])

  /**
   * Session-scoped language change.
   * Persists to sessionStorage ONLY for the current browsing session.
   * Never permanently writes to localStorage, cookies, or user database.
   */
  const setLang = (l: Lang) => {
    if (!SELECTABLE_LANGS.includes(l)) return
    setLangState(l)
    setIsLanguageSelected(true)

    try {
      sessionStorage.setItem(SESSION_LANG_KEY, l)
      sessionStorage.setItem(SESSION_CONFIRMED_KEY, "true")
      if (typeof document !== "undefined") {
        document.documentElement.lang = l
      }
    } catch {
      // Graceful fallback if storage restricted
    }

    if (l === "en") {
      setTranslations(en)
    } else {
      void loadLocale(l).then((data) => {
        setTranslations(data)
      })
    }
  }

  const openLanguageModal = () => setIsLanguageModalOpen(true)
  const closeLanguageModal = () => setIsLanguageModalOpen(false)

  const resetLanguagePreference = () => {
    try {
      sessionStorage.removeItem(SESSION_LANG_KEY)
      sessionStorage.removeItem(SESSION_CONFIRMED_KEY)
    } catch {}
    setIsLanguageSelected(false)
  }

  const t = (key: string) => {
    const parts = key.split(".")
    
    // Attempt translation in active language
    let current: any = translations
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part]
      } else {
        current = undefined
        break
      }
    }
    if (current !== undefined) {
      if (current && typeof current === "object" && key in NAMESPACE_TITLES) {
        return NAMESPACE_TITLES[key][lang] ?? NAMESPACE_TITLES[key]["en"]
      }
      return current
    }

    // Fallback to English
    current = en
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part]
      } else {
        current = undefined
        break
      }
    }
    if (current && typeof current === "object" && key in NAMESPACE_TITLES) {
      return NAMESPACE_TITLES[key][lang] ?? NAMESPACE_TITLES[key]["en"]
    }
    return current ?? key
  }

  const translateDynamic = async (text: string): Promise<string> => {
    if (!text || !text.trim() || lang === "en") return text
    return translateText({ text, targetLang: lang, sourceLang: "en" })
  }

  const translateDynamicBatch = async (texts: string[]): Promise<string[]> => {
    if (!texts || texts.length === 0 || lang === "en") return texts
    return translateBatch(texts, lang, "en")
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        isReady,
        isLanguageSelected,
        isLanguageModalOpen,
        openLanguageModal,
        closeLanguageModal,
        resetLanguagePreference,
        translateDynamic,
        translateDynamicBatch,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

/**
 * Convenient hook for translating dynamic asynchronous data (Mandi, Weather,
 * Crop details, Tractor specs, AI Advisor) into active user language.
 */
export function useDynamicTranslation() {
  const { lang, translateDynamic, translateDynamicBatch } = useLanguage()
  return {
    lang,
    translate: translateDynamic,
    translateBatch: translateDynamicBatch,
  }
}
