"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Globe,
  Bell,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  MapPin,
  Check,
  X,
} from "lucide-react"
import { useLanguage, LANG_NAMES, LANG_DETAILS, SELECTABLE_LANGS, type Lang } from "@/lib/language"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  currentLocationName?: string
}

export function MobileAppHeader({ currentLocationName }: Props) {
  const pathname = usePathname()
  const { lang, setLang } = useLanguage()
  const { user, ready } = useAuth()
  const [langModalOpen, setLangModalOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const initials = user
    ? (user.name || user.email || "U")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-emerald-900/10 dark:border-stone-800 shadow-[0_2px_12px_rgba(23,75,53,0.04)] pt-[env(safe-area-inset-top)] md:hidden">
        <div className="flex h-14 items-center justify-between px-3.5">
          {/* Left: Krishi AI Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black shadow-xs text-sm">
              🌾
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-emerald-950 dark:text-emerald-50">
                  Krishi<span className="text-emerald-700 dark:text-emerald-400">AI</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  किसान
                </span>
              </div>
              {currentLocationName ? (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate max-w-[130px]">
                  <MapPin className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{currentLocationName}</span>
                </div>
              ) : (
                <span className="text-[9px] font-semibold text-muted-foreground">
                  Smart Farm Assistant
                </span>
              )}
            </div>
          </Link>

          {/* Right: Language Pill + Notification + Profile */}
          <div className="flex items-center gap-1.5">
            {/* Language Selector Pill */}
            <button
              type="button"
              onClick={() => setLangModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/50 text-xs font-bold text-emerald-800 dark:text-emerald-300 active:scale-95 transition-all"
              aria-label="Select language"
            >
              <Globe className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
              <span>{LANG_NAMES[lang as Lang] || "हिंदी"}</span>
              <ChevronDown className="h-2.5 w-2.5 opacity-70" />
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-stone-700 dark:text-stone-300 hover:bg-muted active:scale-95 transition-all"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-stone-900" />
            </button>

            {/* Profile Avatar */}
            <Link
              href={user ? "/profile" : "/login"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/80 dark:border-emerald-700 bg-emerald-100/60 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 text-xs font-extrabold active:scale-95 transition-all"
              aria-label="Account profile"
            >
              {user ? initials : <UserIcon className="h-4 w-4" />}
            </Link>
          </div>
        </div>
      </header>

      {/* Language Selection Bottom Sheet / Modal */}
      <AnimatePresence>
        {langModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLangModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card p-4 pb-8 shadow-2xl md:hidden space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-foreground">अपनी भाषा चुनें / Select Language</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLangModalOpen(false)}
                  className="h-7 w-7 rounded-full flex items-center justify-center bg-muted text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 max-h-[60vh] overflow-y-auto">
                {SELECTABLE_LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setLang(l)
                      setLangModalOpen(false)
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      lang === l
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-2xs"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <div>
                      <div className="text-sm">{LANG_NAMES[l]}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">
                        {LANG_DETAILS[l]?.en}
                      </div>
                    </div>
                    {lang === l && <Check className="h-4 w-4 text-emerald-700 shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {notificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card p-4 pb-8 shadow-2xl md:hidden space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-foreground">कृषि सूचनाएं / Agricultural Alerts</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="h-7 w-7 rounded-full flex items-center justify-center bg-muted text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300">
                    🌾 सैटेलाइट पास उपलब्ध (Copernicus Sentinel-2)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    आपके खेत के निर्देशांकों के लिए नवीनतम सैटेलाइट पास प्रोसेस हो चुका है। औसत NDVI 0.14 मापा गया है।
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <div className="font-bold text-foreground">
                    ☁️ मौसम परामर्श
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    आज मौसम सामान्य और सूखा रहेगा। हल्की सिंचाई या कीटनाशक छिड़काव के लिए अनुकूल समय है।
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
