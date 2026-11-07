"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { translations } from "./translations"

export type Lang = "en" | "hi" | "kn"

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: (k) => k })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    try {
      localStorage.removeItem("krishi_lang")
      const saved = sessionStorage.getItem("kisaanbuddy_session_lang") as Lang | null
      if (saved && ["en", "hi", "kn"].includes(saved)) setLangState(saved)
    } catch {}
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    try { sessionStorage.setItem("kisaanbuddy_session_lang", l) } catch {}
  }

  function t(key: string): string {
    const d = translations[lang] as Record<string, string>
    return d?.[key] ?? (translations.en as Record<string, string>)?.[key] ?? key
  }

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
