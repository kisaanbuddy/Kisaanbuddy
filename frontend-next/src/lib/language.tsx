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
    if (current !== undefined) return current

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
