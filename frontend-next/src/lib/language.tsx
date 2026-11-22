"use client"

import { createContext, useContext, useLayoutEffect, useEffect, useState } from "react"
import en from "./locales/en.json"
import { translateText, translateBatch, translateStructured } from "./translation-client"

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
  // Odia is loaded on demand from the authenticated server translator.  This
  // intentionally remains a machine-translated locale until it is reviewed.
  or: () => translateStructured(en, "or"),
  hi_en: () => import("./locales/hi_en.json").then((m) => m.default),
}

export type Lang = "en" | "hi" | "kn" | "ta" | "te" | "ml" | "mr" | "bn" | "pa" | "gu" | "or" | "hi_en"

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
  or: "ଓଡ଼ିଆ",
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
  or: { native: "ଓଡ଼ିଆ", en: "Odia (machine translated)" },
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
  or: "🇮🇳",
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
    code: "or",
    native: "ଓଡ଼ିଆ",
    en: "Odia (machine translated)",
    scriptChar: "ଅ",
    region: "ଓଡ଼ିଶା",
    greeting: "ନମସ୍କାର କୃଷକ ବନ୍ଧୁ!",
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

// Language packs are loaded only after a language is chosen.
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
  "or",
  "hi_en",
]

export const SESSION_LANG_KEY = "kisaanbuddy_session_lang"
export const SESSION_CONFIRMED_KEY = "kisaanbuddy_session_confirmed"
export const PREFERRED_LANG_KEY = "kisaanbuddy_preferred_lang"

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

function getBrowserLanguage(): Lang | null {
  if (typeof navigator === "undefined") return null
  for (const candidate of navigator.languages ?? [navigator.language]) {
    const normalized = candidate.toLowerCase().replace("_", "-")
    const exact = normalized as Lang
    if (SELECTABLE_LANGS.includes(exact)) return exact

    const base = normalized.split("-")[0] as Lang
    if (SELECTABLE_LANGS.includes(base)) return base
  }
  return null
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

  // A deliberate selection persists across visits.  Browser language is used
  // only for a first visit with no saved preference.
  useLayoutEffect(() => {
    try {
      const preferred = localStorage.getItem(PREFERRED_LANG_KEY) as Lang | null
      const sessionLanguage = sessionStorage.getItem(SESSION_LANG_KEY) as Lang | null
      const candidate =
        (preferred && SELECTABLE_LANGS.includes(preferred) && preferred) ||
        (sessionLanguage && SELECTABLE_LANGS.includes(sessionLanguage) && sessionLanguage) ||
        getBrowserLanguage()

      if (candidate) {
        setLangState(candidate)
        setIsLanguageSelected(true)
        if (typeof document !== "undefined") {
          document.documentElement.lang = candidate
        }
        if (candidate === "en") {
          setTranslations(en)
        } else {
          void loadLocale(candidate).then((data) => {
            setTranslations(data)
          })
        }
      } else {
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

  /** A user selection is intentionally retained locally until reset. */
  const setLang = (l: Lang) => {
    if (!SELECTABLE_LANGS.includes(l)) return
    setLangState(l)
    setIsLanguageSelected(true)

    try {
      sessionStorage.setItem(SESSION_LANG_KEY, l)
      sessionStorage.setItem(SESSION_CONFIRMED_KEY, "true")
      localStorage.setItem(PREFERRED_LANG_KEY, l)
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
      localStorage.removeItem(PREFERRED_LANG_KEY)
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
