"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { useLanguage, type Lang } from "@/lib/language";
import {
  ANNOUNCEMENT_TRANSLATIONS,
  type AnnouncementContent,
} from "./announcement-translations";

// Change this version key whenever a new announcement needs to be broadcast
export const ANNOUNCEMENT_STORAGE_KEY = "kisaanbuddy_announcement_v1_dismissed";

interface FounderItem {
  name: string;
  role: string;
  image: string;
}

const FOUNDERS: FounderItem[] = [
  {
    name: "Aditya Ishwar",
    role: "Founder & CEO",
    image: "/images/founders/aditya-ishwar.webp",
  },
  {
    name: "Utkarsh Sinha",
    role: "Co-Founder & MD",
    image: "/images/founders/utkarsh-sinha.webp",
  },
  {
    name: "Yash Singh",
    role: "Co-Founder & CMO",
    image: "/images/founders/yash-singh.webp",
  },
];

export function AnnouncementPopup() {
  const { lang, isReady, isLanguageSelected } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Check dismissal state in localStorage after client mounts and language is verified
  useEffect(() => {
    setIsMounted(true);
    if (!isReady || !isLanguageSelected) {
      return;
    }

    try {
      const isDismissed = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (!isDismissed) {
        // Small delay ensures smooth entrance right after website load
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage might be blocked in strict private browsing; do not crash
    }
  }, [isReady, isLanguageSelected]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
    } catch {
      // Storage access blocked fallback
    }
  }, []);

  // Keyboard accessibility: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDismiss]);

  if (!isMounted) return null;

  const currentLang = (lang as Lang) || "en";
  const content: AnnouncementContent =
    ANNOUNCEMENT_TRANSLATIONS[currentLang] || ANNOUNCEMENT_TRANSLATIONS.en;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-modal-heading"
          className="fixed inset-0 z-[90] flex items-center justify-center p-3.5 sm:p-5 md:p-8"
        >
          {/* ────────────────────────────────────────────────────────────── */}
          {/* BACKDROP OVERLAY                                               */}
          {/* ────────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={handleDismiss}
            aria-hidden="true"
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-all"
          />

          {/* ────────────────────────────────────────────────────────────── */}
          {/* MODAL CONTAINER (75-80% desktop width, max-w-5xl)              */}
          {/* ────────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 280,
              mass: 0.9,
            }}
            className="relative z-10 w-[94%] sm:w-[90%] md:w-[84%] lg:w-[78%] max-w-5xl max-h-[92vh] overflow-hidden rounded-[26px] sm:rounded-[32px] border border-emerald-500/30 bg-[#FAF9F6] dark:bg-stone-900 shadow-[0_25px_70px_rgba(15,61,41,0.35)] flex flex-col"
          >
            {/* Top Close Button (Desktop & Mobile accessible) */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={content.closeAria}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/25 sm:bg-black/30 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-black/50 hover:scale-105 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            >
              <X className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            </button>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto overscroll-contain">
              {/* ────────────────────────────────────────────────────────── */}
              {/* AGRICULTURAL THEMED HEADER BANNER                          */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#0c3120] via-[#144a32] to-[#0f3d29] px-6 py-8 sm:px-10 sm:py-12 md:py-14 text-white">
                {/* Ambient Radial Glows */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl"
                />

                {/* Subtle Agricultural Background SVG Elements (Wheat & Field Waves) */}
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="farm-pattern"
                      width="60"
                      height="60"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 60 0 L 0 60 M 30 -30 L -30 30 M 90 30 L 30 90"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                        strokeDasharray="3, 4"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#farm-pattern)" />
                </svg>

                {/* Floating Ambient Particles (Subtle Pollen / Sparkles) */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{
                        opacity: 0.2,
                        y: 0,
                        x: i * 80 + 20,
                      }}
                      animate={{
                        opacity: [0.2, 0.7, 0.2],
                        y: [-10, -35, -10],
                        x: [i * 80 + 20, i * 80 + (i % 2 === 0 ? 35 : 5), i * 80 + 20],
                      }}
                      transition={{
                        duration: 4 + (i % 3) * 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.4,
                      }}
                      className="absolute block h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]"
                      style={{
                        top: `${30 + (i * 12) % 50}%`,
                        left: `${(i * 18 + 5) % 95}%`,
                      }}
                    />
                  ))}
                </div>

                {/* Header Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Official Announcement Pill Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-200 shadow-xs mb-4 sm:mb-5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                    <span>{content.badge}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </motion.div>

                  {/* Main Announcement Heading */}
                  <motion.h2
                    id="announcement-modal-heading"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                    className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-tight max-w-3xl"
                  >
                    {content.heading}
                  </motion.h2>

                  {/* Subtle Decorative Wheat Icon Flanks */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="mt-3 flex items-center gap-2 text-emerald-300/80 text-xs sm:text-sm font-medium"
                  >
                    <span className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent via-emerald-400/40 to-emerald-400" />
                    <span className="text-base sm:text-lg">🌾</span>
                    <span className="tracking-wide text-emerald-200/90 font-semibold">KisaanBuddy</span>
                    <span className="text-base sm:text-lg">🌾</span>
                    <span className="h-px w-8 sm:w-14 bg-gradient-to-l from-transparent via-emerald-400/40 to-emerald-400" />
                  </motion.div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* BODY SECTION (SUPPORTING MESSAGE & FOUNDER SIGNATURE)      */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="px-6 py-6 sm:px-10 sm:py-8 md:py-10 space-y-6 sm:space-y-8 bg-gradient-to-b from-[#FAF9F6] via-white to-[#F4F7F2] dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
                {/* Supporting Message Card */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45 }}
                  className="rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-stone-800/60 p-5 sm:p-7 md:p-8 shadow-xs text-center relative overflow-hidden backdrop-blur-xs"
                >
                  <p className="text-base sm:text-lg md:text-xl font-medium text-stone-800 dark:text-stone-200 leading-relaxed sm:leading-loose">
                    &ldquo;{content.messageP1}&rdquo;
                  </p>
                  <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed">
                    {content.messageP2}
                  </p>
                </motion.div>

                {/* ────────────────────────────────────────────────────────── */}
                {/* FOUNDER SIGNATURE SECTION                                  */}
                {/* ────────────────────────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.45 }}
                  className="rounded-2xl sm:rounded-3xl border border-emerald-600/15 dark:border-emerald-700/30 bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/40 dark:from-stone-800/80 dark:via-stone-800/40 dark:to-stone-900/90 p-5 sm:p-7 shadow-xs"
                >
                  {/* Founder Signature Heading with Heart */}
                  <div className="text-center space-y-1 mb-5 sm:mb-6">
                    <p className="font-serif italic text-base sm:text-lg text-stone-600 dark:text-stone-300">
                      {content.withLove}
                    </p>
                    <div className="inline-flex items-center justify-center gap-1.5 text-base sm:text-lg md:text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
                      <span>{content.theFounders}</span>
                    </div>
                  </div>

                  {/* Founder Portraits & Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-1 pb-3">
                    {FOUNDERS.map((founder, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 shadow-2xs transition-all hover:border-emerald-500/40 hover:shadow-xs group"
                      >
                        <div className="relative mb-2.5">
                          <div className="relative h-16 w-16 sm:h-18 sm:w-18 overflow-hidden rounded-full ring-3 ring-emerald-600/30 dark:ring-emerald-500/40 shadow-xs">
                            <Image
                              src={founder.image}
                              alt={founder.name}
                              width={72}
                              height={72}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              priority
                            />
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white ring-2 ring-white dark:ring-stone-900">
                            <ShieldCheck className="h-3 w-3" />
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-black tracking-tight text-stone-900 dark:text-stone-100 uppercase">
                          {founder.name}
                        </h4>
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          {founder.role}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Founders Uppercase Divider Bar */}
                  <div className="mt-3 sm:mt-4 pt-3 border-t border-emerald-900/10 dark:border-stone-700/60 text-center">
                    <p className="text-[11px] sm:text-xs font-black tracking-widest text-stone-700 dark:text-stone-300 uppercase">
                      {content.foundersNames}
                    </p>
                  </div>
                </motion.div>

                {/* ────────────────────────────────────────────────────────── */}
                {/* CALL TO ACTION BUTTON                                      */}
                {/* ────────────────────────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.45 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 pb-2"
                >
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold shadow-md shadow-emerald-900/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    <span>{content.ctaButton}</span>
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default AnnouncementPopup;
