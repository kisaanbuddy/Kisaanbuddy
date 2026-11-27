"use client";

import React from "react";
import { openVoiceAssistant } from "@/components/assistant/VoiceAssistantModal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, MessagesSquare, UserRound, Wrench } from "lucide-react";
import { useLanguage, type Lang } from "@/lib/language";
import { BOTTOM_NAV_I18N, DRAWER_I18N } from "@/lib/mobile-nav-i18n";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  if (pathname === "/chatbot" || pathname?.startsWith("/chatbot/")) {
    return null;
  }

  const labels = BOTTOM_NAV_I18N[lang as Lang] || BOTTOM_NAV_I18N.en;

  const NAV_ITEMS = [
    {
      href: "/",
      icon: Home,
      label: labels.home,
      isActive: pathname === "/" || pathname === "",
    },
    {
      href: "/mandi",
      icon: TrendingUp,
      label: labels.mandi,
      isActive: Boolean(pathname === "/mandi" || pathname?.startsWith("/mandi/")),
    },
    { href: "/chatbot", icon: MessagesSquare, label: lang === "hi" ? "पूछें" : "Ask AI", isActive: pathname === "/chatbot" },
    { href: "/profile", icon: UserRound, label: lang === "hi" ? "खाता" : (lang === "en" ? "Account" : (DRAWER_I18N[lang] || DRAWER_I18N.en).items.profile.title), isActive: pathname === "/profile" || pathname === "/login" || pathname === "/settings" },
    {
      href: "/features",
      icon: Wrench,
      label: lang === "hi" ? "सेवाएँ" : labels.tools,
      isActive: Boolean(
        pathname === "/features" ||
          pathname?.startsWith("/features/") ||
          pathname === "/disease" ||
          pathname?.startsWith("/disease/") ||
          pathname === "/crop-predictor" ||
          pathname?.startsWith("/crop-predictor/") ||
          pathname === "/soil-health" ||
          pathname?.startsWith("/soil-health/") ||
          pathname === "/satellite" ||
          pathname?.startsWith("/satellite/") ||
          pathname === "/khet-diary" ||
          pathname?.startsWith("/khet-diary/")
      ),
    },
  ];

  return (
    <nav
      className="kb-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-900/10 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(23,75,53,0.08)] backdrop-blur-md md:hidden select-none"
      aria-label="Primary mobile navigation"
    >
      <div className="grid grid-cols-5 w-full max-w-lg mx-auto px-1 py-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, isActive }) => {
          return (
            <Link
              key={href}
              href={href}
              onClick={href === "/chatbot" ? (event) => { event.preventDefault(); openVoiceAssistant(); } : undefined}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl py-1 px-0.5 transition-all active:scale-95 touch-manipulation ${
                isActive
                  ? "text-emerald-800 dark:text-emerald-400 font-bold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium"
              }`}
            >
              <span
                className={`flex h-7 w-10 sm:w-11 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                    : "bg-transparent text-stone-600 dark:text-stone-400"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform ${
                    isActive ? "scale-105 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`text-[11px] leading-snug text-center break-words max-w-full px-0.5 ${
                  isActive
                    ? "font-extrabold text-emerald-800 dark:text-emerald-300"
                    : "font-semibold"
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-emerald-700 dark:bg-emerald-400"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
