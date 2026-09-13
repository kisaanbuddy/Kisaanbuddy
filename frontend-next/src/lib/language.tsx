"use client"

import { createContext, useContext, useLayoutEffect, useEffect, useState } from "react"
import en from "./locales/en.json"
import hi from "./locales/hi.json"

export type Lang = "en" | "hi" | "kn" | "ta" | "te" | "ml" | "mr" | "bn" | "pa" | "gu" | "hi_en"

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  hi: "हिंदी",
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

// These are the only locales exposed until a locale has complete application
// coverage. This prevents a user from selecting a partially translated UI.
export const SELECTABLE_LANGS: Lang[] = ["hi", "en"]

// We keep en and hi statically
export const T: Record<string, any> = { en, hi }

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
    te: "స్మార్ట్ హబ్",
    ml: "ಸ್ಮಾರ್ಟ್ ಹಬ್",
    mr: "स्मार्ट हब",
    bn: "স্মার্ট হাব",
    pa: "ਸਮਾਰਟ ਹੱਬ",
    gu: "સ્માર્ટ હબ",
    hi_en: "Smart Hub"
  }
}

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => any
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => {
    const parts = key.split(".")
    let current: any = T.en
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part]
      } else {
        return key
      }
    }
    if (current && typeof current === "object" && key in NAMESPACE_TITLES) {
      return NAMESPACE_TITLES[key]["en"]
    }
    return current
  },
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")
  const [translations, setTranslations] = useState<any>(en)

  useLayoutEffect(() => {
    // Local storage key migration layer
    let saved = localStorage.getItem("kisaanbuddy_lang") as Lang | null
    if (!saved) {
      saved = localStorage.getItem("KisaanBuddy_lang") as Lang | null
      if (saved) {
        localStorage.setItem("kisaanbuddy_lang", saved)
        localStorage.removeItem("KisaanBuddy_lang")
      }
    }

    if (saved && SELECTABLE_LANGS.includes(saved)) {
      setLangState(saved)
    } else {
      setLangState("en")
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      let base: any = en
      try {
        if (lang === "hi") base = hi
        else if (lang !== "en") base = (await import(`./locales/${lang}.json`)).default
      } catch {
        base = en
      }
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
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    if (!SELECTABLE_LANGS.includes(l)) return
    setLangState(l)
    localStorage.setItem("kisaanbuddy_lang", l)
    document.cookie = `kisaanbuddy_lang=${l}; Path=/; Max-Age=31536000; SameSite=Lax`
    localStorage.removeItem("KisaanBuddy_lang") // Clean up old reference
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

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
