"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
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

    // Do not show while language selection modal is active
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
        }, 400);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage might be blocked in strict sandboxes
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

  // Animation variants
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
        ease: [0.16, 1, 0.3, 1],
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
          {/* ─── BACKDROP OVERLAY ─── */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleDismiss}
            aria-hidden="true"
            className="fixed inset-0 bg-[#02130c]/85 backdrop-blur-md transition-all"
          />

          {/* ─── MODAL CONTAINER (Max 1050px width x 760px height) ─── */}
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[1050px] max-h-[92vh] md:max-h-[760px] my-auto flex flex-col rounded-3xl overflow-hidden border border-emerald-500/25 bg-gradient-to-br from-[#021810] via-[#05291b] to-[#01140c] text-white shadow-2xl shadow-black/80 z-10"
          >
            {/* ─── AMBIENT ATMOSPHERIC LIGHTING & TOPOGRAPHIC PATTERNS ─── */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-600/10 rounded-full filter blur-3xl pointer-events-none" />

            {/* Subtle Agricultural Topography Contour Lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none stroke-emerald-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M0,80 Q250,30 500,100 T1000,60 T1400,120" strokeWidth="1.5" />
              <path d="M0,160 Q350,90 700,180 T1400,110" strokeWidth="1.5" />
              <path d="M0,250 Q300,190 600,270 T1200,210 T1400,290" strokeWidth="1.5" />
              <path d="M0,360 Q450,280 900,380 T1400,330" strokeWidth="1.5" />
              <path d="M0,480 Q280,410 650,520 T1300,450 T1400,530" strokeWidth="1.5" />
              <path d="M0,600 Q400,510 800,630 T1400,570" strokeWidth="1.5" />
            </svg>

            {/* ─── CLOSE BUTTON WITH ROTATION MICRO-INTERACTION ─── */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={content.closeAria}
              className="absolute top-4 right-4 sm:top-5 sm:right-6 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 text-stone-200 hover:text-white backdrop-blur-md border border-white/10 transition-all duration-200 cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#05291b]"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:rotate-90" />
            </button>

            {/* ─── SCROLLABLE INNER BODY ─── */}
            <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 space-y-6 sm:space-y-8 scrollbar-thin scrollbar-thumb-emerald-800/40">
              
              {/* ─── 1. TWO-COLUMN HERO COMPOSITION (DESKTOP) ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-2">
                
                {/* LEFT COLUMN: BRAND MESSAGE & HEADLINE */}
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="lg:col-span-7 space-y-3 sm:space-y-4 text-center lg:text-left"
                >
                  {/* Upper Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 backdrop-blur-md">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest text-emerald-300 uppercase">
                      {content.badge}
                    </span>
                  </div>

                  {/* Main Heading with Gradient Accent on "Smarter Future" */}
                  <h2
                    id="welcome-modal-heading"
                    className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight"
                  >
                    <span>{content.headingPrefix}</span>
                    <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                      {content.headingHighlight}
                    </span>
                    <span>{content.headingSuffix}</span>
                  </h2>

                  {/* Supporting Message */}
                  <p
                    id="welcome-modal-description"
                    className="text-xs sm:text-sm md:text-[15px] text-emerald-100/85 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0"
                  >
                    {content.subheading}
                  </p>
                </motion.div>

                {/* RIGHT COLUMN: AGRICULTURAL VISUAL ILLUSTRATION */}
                <motion.div
                  initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.45 }}
                  className="lg:col-span-5 flex justify-center items-center"
                >
                  <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none aspect-[16/11] rounded-2xl bg-gradient-to-br from-emerald-950/60 to-[#021e14]/80 border border-emerald-500/20 shadow-lg p-3 sm:p-4 overflow-hidden flex items-center justify-center">
                    
                    {/* Background Radial Sunlight */}
                    <div className="absolute top-2 right-4 w-28 h-28 bg-emerald-400/20 rounded-full filter blur-2xl pointer-events-none" />

                    {/* Integrated Agricultural Landscape SVG */}
                    <svg
                      className="w-full h-full max-h-[170px]"
                      viewBox="0 0 360 220"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="fieldHill1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#065f46" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#064e3b" stopOpacity="0.9" />
                        </linearGradient>
                        <linearGradient id="fieldHill2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#047857" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
                        </linearGradient>
                      </defs>

                      {/* Rising Sun */}
                      <circle cx="270" cy="65" r="28" fill="url(#sunGlow)" />
                      <circle cx="270" cy="65" r="42" stroke="#34d399" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Background Mountain Contours */}
                      <path d="M0,140 Q100,105 200,135 T360,120 L360,220 L0,220 Z" fill="url(#fieldHill1)" />
                      
                      {/* Foreground Field Furrows */}
                      <path d="M0,165 Q120,135 240,165 T360,150 L360,220 L0,220 Z" fill="url(#fieldHill2)" />
                      <path d="M30,175 Q130,152 230,175 T360,165" stroke="#6ee7b7" strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
                      <path d="M10,195 Q140,172 260,195 T360,185" stroke="#6ee7b7" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />

                      {/* Stylized Grain Stalk / Sprout */}
                      <g transform="translate(110, 55)">
                        <path d="M20,120 Q18,60 20,20" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        {/* Leaf Ears */}
                        <path d="M20,95 Q35,80 32,65 Q20,75 20,95 Z" fill="#6ee7b7" fillOpacity="0.75" />
                        <path d="M20,80 Q5,65 8,50 Q20,60 20,80 Z" fill="#34d399" fillOpacity="0.75" />
                        <path d="M20,60 Q35,45 32,30 Q20,40 20,60 Z" fill="#6ee7b7" fillOpacity="0.85" />
                        <path d="M20,45 Q5,30 8,15 Q20,25 20,45 Z" fill="#34d399" fillOpacity="0.85" />
                        {/* Top Grain Head */}
                        <path d="M20,20 Q20,2 20,-2 Q20,2 20,20 Z" fill="#a7f3d0" />
                        <circle cx="20" cy="15" r="4" fill="#a7f3d0" />
                      </g>
                    </svg>

                    {/* Integrated Floating Smart Telemetry Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#021b12]/90 border border-emerald-500/30 backdrop-blur-md text-[10px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live Intelligence</span>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#021b12]/90 border border-teal-500/30 backdrop-blur-md text-[10px] font-bold text-teal-300">
                      <span>✓ 100% Authentic</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ─── 2. REFINED FEATURE SHOWCASE: 4 ELEGANT TILES ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* TILE 01: MANDI INTELLIGENCE */}
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/40 backdrop-blur-md shadow-sm transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      {/* Icon */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                          <polyline points="16 7 22 7 22 13" />
                        </svg>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400/60">{content.f1Number}</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-emerald-200 transition-colors">
                        {content.f1Title}
                      </h3>
                      <p className="text-xs text-stone-300/90 leading-relaxed font-normal mt-1">
                        {content.f1Desc}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* TILE 02: CROP DOCTOR */}
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/40 backdrop-blur-md shadow-sm transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      {/* Icon */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9a9 9 0 0 1-9-9 9 9 0 0 1 9-9Z" />
                          <path d="m21 21-4.35-4.35" />
                          <path d="M11 8v6" />
                          <path d="M8 11h6" />
                        </svg>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400/60">{content.f2Number}</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-emerald-200 transition-colors">
                        {content.f2Title}
                      </h3>
                      <p className="text-xs text-stone-300/90 leading-relaxed font-normal mt-1">
                        {content.f2Desc}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* TILE 03: FARM MARKETPLACE */}
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/40 backdrop-blur-md shadow-sm transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      {/* Icon */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 7h18" />
                          <path d="M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
                          <rect x="3" y="7" width="18" height="14" rx="2" />
                          <circle cx="8" cy="14" r="2" />
                          <circle cx="16" cy="14" r="2" />
                        </svg>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400/60">{content.f3Number}</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-emerald-200 transition-colors">
                        {content.f3Title}
                      </h3>
                      <p className="text-xs text-stone-300/90 leading-relaxed font-normal mt-1">
                        {content.f3Desc}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* TILE 04: TRUSTED INFORMATION */}
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/40 backdrop-blur-md shadow-sm transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      {/* Icon */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400/60">{content.f4Number}</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-emerald-200 transition-colors">
                        {content.f4Title}
                      </h3>
                      <p className="text-xs text-stone-300/90 leading-relaxed font-normal mt-1">
                        {content.f4Desc}
                      </p>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* ─── 3. REFINED CALL TO ACTION & SUPPORTING LINE ─── */}
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="flex flex-col items-center justify-center pt-2 pb-1 space-y-2"
              >
                <button
                  ref={ctaButtonRef}
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm sm:text-base px-8 sm:px-11 py-3.5 sm:py-4 shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#05291b]"
                >
                  <span>{content.ctaButton}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
                <p className="text-[11px] sm:text-xs text-emerald-300/70 font-medium tracking-wide">
                  {content.ctaSubtext}
                </p>
              </motion.div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementPopup;
