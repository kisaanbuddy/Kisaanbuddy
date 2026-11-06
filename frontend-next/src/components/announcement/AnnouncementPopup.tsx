"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Sparkles, ArrowRight, Sprout, TrendingUp, ShieldCheck, Tractor, Stethoscope } from "lucide-react";
import { useLanguage, type Lang } from "@/lib/language";
import {
  ANNOUNCEMENT_TRANSLATIONS,
  type AnnouncementContent,
} from "./announcement-translations";

// Session-based storage key so it appears once per browsing session
export const WELCOME_SESSION_KEY = "kisaanbuddy_welcome_session_v2";

export function AnnouncementPopup() {
  const { lang, isReady, isLanguageSelected, isLanguageModalOpen } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);

  // Check session storage on mount & verify language readiness
  useEffect(() => {
    setIsMounted(true);

    // Clean up old persistent localStorage key from legacy announcement
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("kisaanbuddy_announcement_v1_dismissed");
      }
    } catch {
      // Ignore storage access errors in strict sandboxes
    }

    if (!isReady) return;

    // Wait until language selection modal is done so modals never overlap
    if (isLanguageModalOpen) {
      setIsOpen(false);
      return;
    }

    try {
      const sessionSeen = window.sessionStorage.getItem(WELCOME_SESSION_KEY);
      if (!sessionSeen) {
        // Smooth entrance delay right after initial hydration & page ready
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 450);
        return () => clearTimeout(timer);
      }
    } catch {
      // In private browsing mode where sessionStorage might throw
    }
  }, [isReady, isLanguageSelected, isLanguageModalOpen]);

  // Handle dismiss: store in sessionStorage and restore body scroll
  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(WELCOME_SESSION_KEY, "true");
        document.body.style.overflow = "";
      }
    } catch {
      // Storage access blocked fallback
    }
  }, []);

  // Lock background scrolling while modal is open, unlock on dismiss/unmount
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape key closes modal & focus management
  useEffect(() => {
    if (!isOpen) return;

    // Focus the primary CTA on open for immediate keyboard interaction
    const focusTimer = setTimeout(() => {
      ctaButtonRef.current?.focus();
    }, 150);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
        return;
      }

      // Simple focus trapping inside modal
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleDismiss]);

  if (!isMounted) return null;

  const currentLang = (lang as Lang) || "en";
  const content: AnnouncementContent =
    ANNOUNCEMENT_TRANSLATIONS[currentLang] || ANNOUNCEMENT_TRANSLATIONS.en;

  // Animation variants adapting to user reduced motion preference
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: prefersReducedMotion ? 0.1 : 0.35, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.96,
      y: prefersReducedMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.45,
        ease: [0.16, 1, 0.3, 1], // snappy easeOutCubic
      },
    },
    exit: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.97,
      y: prefersReducedMotion ? 0 : 12,
      transition: { duration: 0.22, ease: "easeIn" },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-modal-heading"
          aria-describedby="welcome-modal-description"
          className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          {/* ─── BACKDROP OVERLAY WITH BLUR & AMBIENT DARK GREEN TINT ─── */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleDismiss}
            aria-hidden="true"
            className="fixed inset-0 bg-[#02140d]/80 backdrop-blur-md transition-all"
          />

          {/* ─── MODAL CONTAINER ─── */}
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-2xl sm:max-w-3xl my-auto rounded-3xl overflow-hidden border border-emerald-500/25 bg-gradient-to-br from-[#042017] via-[#062c1e] to-[#021811] text-white shadow-2xl shadow-emerald-950/60 z-10"
          >
            {/* ─── AMBIENT BACKGROUND GLOWS & AGRICULTURAL PATTERNS ─── */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-400/10 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full filter blur-3xl pointer-events-none" />

            {/* Subtle SVG Agricultural Topography & Contour Lines Background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none stroke-emerald-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M0,60 Q200,20 400,80 T800,40 T1200,100" strokeWidth="1.5" />
              <path d="M0,120 Q300,70 600,140 T1200,90" strokeWidth="1.5" />
              <path d="M0,190 Q250,150 500,210 T1000,170 T1200,230" strokeWidth="1.5" />
              <path d="M0,280 Q350,220 700,300 T1200,260" strokeWidth="1.5" />
              <path d="M0,370 Q200,320 500,410 T1000,360 T1200,420" strokeWidth="1.5" />
              <path d="M0,460 Q300,400 600,490 T1200,440" strokeWidth="1.5" />
            </svg>

            {/* Floating Subtle Leaf Accents */}
            {!prefersReducedMotion && (
              <>
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [-2, 4, -2] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 right-16 hidden sm:block opacity-20 pointer-events-none"
                >
                  <Sprout className="w-9 h-9 text-emerald-300" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 6, 0], rotate: [3, -3, 3] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-16 left-8 hidden sm:block opacity-15 pointer-events-none"
                >
                  <Sprout className="w-7 h-7 text-emerald-400" />
                </motion.div>
              </>
            )}

            {/* ─── MODAL CLOSE BUTTON ─── */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={content.closeAria}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 text-stone-200 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#062c1e]"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* ─── MODAL CONTENT ─── */}
            <div className="relative px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-9 space-y-6 sm:space-y-7">
              {/* 1. BRAND HEADER */}
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-center space-y-2 sm:space-y-2.5 max-w-xl mx-auto"
              >
                {/* Brand Tag Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 backdrop-blur-md">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold tracking-widest text-emerald-300 uppercase">
                    KISAANBUDDY • {content.brandTag}
                  </span>
                </div>

                {/* Main Heading */}
                <h2
                  id="welcome-modal-heading"
                  className="text-2xl sm:text-3xl md:text-3.5xl font-extrabold tracking-tight text-white leading-tight"
                >
                  {content.mainHeading}
                </h2>

                {/* Supporting Text */}
                <p className="text-xs sm:text-sm md:text-[15px] text-emerald-100/80 leading-relaxed font-normal">
                  {content.subheading}
                </p>
              </motion.div>

              {/* 2. CENTRAL ANNOUNCEMENT CARD */}
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.45 }}
                className="relative rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 p-5 sm:p-6 md:p-7 shadow-xl shadow-black/20 border border-emerald-500/20 backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
                  {/* Agricultural Motif SVG Icon */}
                  <div className="shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950/70 dark:to-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                    <svg
                      className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-700 dark:text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Modern Sprout & Rising Sunbeam Graphic */}
                      <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12" strokeOpacity="0.25" />
                      <path d="M7 21v-4a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v4" />
                      <path d="M12 3v10" />
                      <path d="M12 8c2.5-2.5 4.5-2 6 0-1.5 2.5-3.5 2-6 0Z" fill="currentColor" fillOpacity="0.15" />
                      <path d="M12 11c-2.5-2.5-4.5-2-6 0 1.5 2.5 3.5 2 6 0Z" fill="currentColor" fillOpacity="0.15" />
                    </svg>
                  </div>

                  {/* Card Text Content */}
                  <div className="space-y-1.5 flex-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>KisaanBuddy Innovation</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight">
                      {content.cardHeading}
                    </h3>
                    <p
                      id="welcome-modal-description"
                      className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed"
                    >
                      {content.cardDescription}
                    </p>
                  </div>
                </div>

                {/* Sub-features Pillar Indicators */}
                <div className="mt-5 pt-4 border-t border-stone-200/80 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/50 dark:border-stone-700/50">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-semibold text-stone-700 dark:text-stone-300 truncate">
                      Mandi Rates
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/50 dark:border-stone-700/50">
                    <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-semibold text-stone-700 dark:text-stone-300 truncate">
                      Crop Doctor
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/50 dark:border-stone-700/50">
                    <Tractor className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-semibold text-stone-700 dark:text-stone-300 truncate">
                      Equipment
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/50 dark:border-stone-700/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-semibold text-stone-700 dark:text-stone-300 truncate">
                      Verified Data
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* 3. CALL TO ACTION BUTTON */}
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="flex items-center justify-center pt-1"
              >
                <button
                  ref={ctaButtonRef}
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:from-emerald-700 active:to-emerald-600 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3.5 sm:py-4 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#062c1e]"
                >
                  <span>{content.ctaButton}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementPopup;
