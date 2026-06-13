"use client"

import { createContext, useContext, useEffect, useState } from "react"
import en from "./locales/en.json"
import hi from "./locales/hi.json"
import kn from "./locales/kn.json"
import ta from "./locales/ta.json"
import te from "./locales/te.json"
import ml from "./locales/ml.json"
import mr from "./locales/mr.json"
import bn from "./locales/bn.json"
import pa from "./locales/pa.json"
import gu from "./locales/gu.json"

export type Lang = "en" | "hi" | "kn" | "ta" | "te" | "ml" | "mr" | "bn" | "pa" | "gu"

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
}

export const T: Record<Lang, any> = { en, hi, kn, ta, te, ml, mr, bn, pa, gu }

const NAMESPACE_TITLES: Record<string, Record<string, string>> = {
  dashboard: {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    ta: "டாஷ்போர்டு",
    te: "డాష్‌బోర్డ్",
    ml: "ഡാഷ്‌ബോർഡ്",
    mr: "डॅशबोर्ड",
    bn: "ড্যাশবোর্ড",
    pa: "ਡੈਸ਼ਬੋਰਡ",
    gu: "ડેશબોર્ડ"
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
    gu: "હવામાન"
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
    gu: "મંડી દર"
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
    gu: "યોજનાઓ"
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
    gu: "સ્થાપક"
  },
  hardware: {
    en: "Smart Hub",
    hi: "स्मार्ट हब",
    kn: "ಸ್ಮಾರ್ಟ್ ಹಬ್",
    ta: "ஸ்மார்ட் ஹப்",
    te: "స్మార్ట్ హబ్",
    ml: "സ്മാർട്ട് ഹബ്",
    mr: "स्मार्ट हब",
    bn: "স্মার্ট হাব",
    pa: "ਸਮਾਰਟ ਹੱਬ",
    gu: "સ્માર્ટ હબ"
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

  useEffect(() => {
    const saved = localStorage.getItem("krishiai_lang") as Lang | null
    if (saved && saved in T) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("krishiai_lang", l)
  }

  const t = (key: string) => {
    const parts = key.split(".")
    
    // Attempt translation in active language
    let current: any = T[lang]
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
    current = T.en
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
