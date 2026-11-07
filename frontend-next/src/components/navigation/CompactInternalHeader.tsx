"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Menu,
  Globe,
  ChevronDown,
  Search,
  Home,
  User as UserIcon,
  LogIn,
  Check,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { dropdownVariants } from "@/lib/motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useLanguage,
  LANG_NAMES,
  LANG_DETAILS,
  SELECTABLE_LANGS,
  type Lang,
} from "@/lib/language";
import { useAuth } from "@/lib/auth";
import { useMobileMenu } from "./MobileMenuContext";
import { trackEvent } from "@/lib/analytics";
import { getModuleConfig } from "./route-utils";

const SearchModal = dynamic(() => import("@/components/SearchModal"), {
  ssr: false,
});

export function CompactInternalHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { user, ready } = useAuth();
  const { openMenu } = useMobileMenu();

  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Scroll listener for sticky elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const moduleConfig = getModuleConfig(pathname);
  const ModuleIcon = moduleConfig.icon;
  const currentTitle =
    moduleConfig.title[lang] || moduleConfig.title.en || "KisaanBuddy";
  const currentSubtitle =
    moduleConfig.subtitle[lang] || moduleConfig.subtitle.en || "";
  const controls = moduleConfig.controls(lang);

  const initials = user
    ? (user.name || user.email || "U")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
          scrolled
            ? "bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-stone-200 dark:border-stone-800 shadow-[0_4px_16px_rgba(23,75,53,0.06)]"
            : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xs"
        }`}
        aria-label={`${currentTitle} Internal Header`}
      >
        <div className="w-full max-w-none px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
            {/* ── 1. LEFT: BRAND & CONTEXTUAL MODULE IDENTITY ── */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              {/* Mobile Hamburger Menu Button (visible on mobile < 768px) */}
              <button
                type="button"
                onClick={openMenu}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-95 transition shrink-0"
                aria-label="Open navigation menu / मेनू खोलें"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>

              {/* Home Logo & Brand */}
              <Link
                href="/"
                className="flex items-center gap-2 group shrink-0 active:scale-95 transition"
                title="Return to Home / होम पर जाएं"
                aria-label="KisaanBuddy Home"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-700 group-hover:bg-emerald-800 flex items-center justify-center text-white font-bold text-base shadow-xs transition">
                  🌾
                </div>
                <div className="hidden xs:flex flex-col leading-tight">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-stone-900 dark:text-white">
                    Kisaan<span className="text-emerald-700 dark:text-emerald-400">Buddy</span>
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium leading-none">
                    Home
                  </span>
                </div>
              </Link>

              {/* Vertical subtle divider */}
              <div
                className="h-6 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block shrink-0"
                aria-hidden="true"
              />

              {/* Contextual Module Identity */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 hidden sm:flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <ModuleIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 tracking-tight truncate leading-tight">
                      {currentTitle}
                    </span>
                    {moduleConfig.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hidden md:inline shrink-0">
                        {moduleConfig.badge}
                      </span>
                    )}
                  </div>
                  {currentSubtitle && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal leading-none truncate hidden lg:block">
                      {currentSubtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── 2. CENTER: MODULE-SPECIFIC CONTEXTUAL CONTROLS ── */}
            <nav
              aria-label={`${currentTitle} Contextual Controls`}
              className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none py-1 max-w-xl xl:max-w-2xl px-2"
            >
              {controls.map((item) => {
                const currentTab = searchParams?.get("tab");
                const isTabMatch = item.queryTab && currentTab === item.queryTab;
                const isExactHrefMatch = !item.queryTab && pathname === item.href;
                const isActive = Boolean(isTabMatch || isExactHrefMatch);

                const ControlIcon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${
                      isActive
                        ? "bg-emerald-700/10 dark:bg-emerald-400/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-700/20 dark:border-emerald-400/20"
                        : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    {ControlIcon && (
                      <ControlIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ── 3. RIGHT: MODULE ACTION, TOOLS, UTILITIES & AUTH ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Optional Primary Module Action CTA */}
              {moduleConfig.primaryAction && (
                <Link
                  href={moduleConfig.primaryAction.href}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {moduleConfig.primaryAction.label[lang] ||
                      moduleConfig.primaryAction.label.en}
                  </span>
                </Link>
              )}

              {/* Universal Search trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-stone-700 transition"
                title="Search / खोजें (Ctrl+K)"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden xl:inline">
                  {lang === "hi" ? "खोजें" : "Search"}
                </span>
                <kbd className="hidden xl:inline-flex items-center rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-1 font-mono text-[9px] text-stone-400">
                  ⌘K
                </kbd>
              </button>

              {/* Return to Home Icon Button */}
              <Link
                href="/"
                className="flex items-center justify-center h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-800 transition"
                title={lang === "hi" ? "होम पेज पर वापस जाएं" : "Return to Home Page"}
                aria-label="Home"
              >
                <Home className="w-3.5 h-3.5" />
              </Link>

              {/* Theme Toggle */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>

              {/* Language Selector Dropdown */}
              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  className="flex items-center gap-1 h-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800 px-2 sm:px-2.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-750 transition"
                  aria-expanded={langOpen}
                  aria-label={`Select language (Current: ${LANG_NAMES[lang]})`}
                >
                  <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline text-xs font-bold">
                    {LANG_NAMES[lang]}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-stone-400 transition-transform duration-150 ${
                      langOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="absolute right-0 top-10 z-50 w-44 max-h-72 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl p-1.5 space-y-0.5"
                    >
                      {SELECTABLE_LANGS.map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => {
                            trackEvent({
                              type: "language_switch",
                              from: lang,
                              to: l,
                            });
                            setLang(l);
                            setLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                            lang === l
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold"
                              : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-xs">
                              {LANG_NAMES[l]}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {LANG_DETAILS[l]?.en}
                            </span>
                          </div>
                          {lang === l && (
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile / Login status */}
              {ready && user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 p-1 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  title={user.name || "Farmer Dashboard"}
                  aria-label="Farmer Profile"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-300 dark:border-emerald-700">
                    {initials}
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 h-8 px-2.5 sm:px-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs transition"
                  title="Login to KisaanBuddy"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {lang === "hi" ? "लॉगिन" : "Login"}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile Contextual Strip (on small screens < 768px) ── */}
        <div className="md:hidden border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/60 dark:bg-stone-900/60 px-3 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-2">
          {controls.map((item) => {
            const currentTab = searchParams?.get("tab");
            const isTabMatch = item.queryTab && currentTab === item.queryTab;
            const isExactHrefMatch = !item.queryTab && pathname === item.href;
            const isActive = Boolean(isTabMatch || isExactHrefMatch);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs font-bold"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
