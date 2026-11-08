"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  ArrowRight,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  Bug,
  FlaskConical,
  CloudSun,
  Sparkles,
  Camera,
  Activity,
} from "lucide-react";
import { useLanguage, type Lang } from "@/lib/language";

export const ANNOUNCEMENT_STORAGE_KEY = "kisaanbuddy_feature_announcement_seen_v2";
export const PREFILLED_WHATSAPP_MESSAGE = "Hello KisaanBuddy! I need guidance regarding crop disease diagnosis and farm updates.";

/**
 * Resolves the official WhatsApp Business URL.
 * Strictly adheres to KisaanBuddy's "Reality First" principle:
 * - If NEXT_PUBLIC_WHATSAPP_NUMBER is configured, generates: https://wa.me/<number>?text=...
 * - If not configured, uses the official universal wa.me link: https://wa.me/?text=...
 * - NEVER fabricates or hardcodes a fake phone number.
 */
export function getWhatsAppBusinessUrl(customMessage: string = PREFILLED_WHATSAPP_MESSAGE) {
  const envPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_KISAANBUDDY_WHATSAPP ||
    "";

  const cleanPhone = envPhone.replace(/\D/g, "");
  const encodedText = encodeURIComponent(customMessage);

  if (cleanPhone && cleanPhone.length >= 10) {
    const formatted =
      cleanPhone.startsWith("91") && cleanPhone.length > 10
        ? cleanPhone
        : `91${cleanPhone.slice(-10)}`;
    return {
      url: `https://wa.me/${formatted}?text=${encodedText}`,
      isConfigured: true,
      phoneNumber: formatted,
    };
  }

  return {
    url: `https://wa.me/?text=${encodedText}`,
    isConfigured: false,
    phoneNumber: null,
  };
}

interface AnnouncementContent {
  badge: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  b1Title: string;
  b1Desc: string;
  b2Title: string;
  b2Desc: string;
  b3Title: string;
  b3Desc: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustTag1: string;
  trustTag2: string;
  mockupTitle: string;
  mockupSubtitle: string;
  mockupScanLabel: string;
  mockupMatchLabel: string;
  mockupDisease: string;
  mockupSeverity: string;
  mockupTreatment: string;
  mockupSprayWindow: string;
  mockupActionBtn: string;
}

const CONTENT: Record<string, AnnouncementContent> = {
  en: {
    badge: "✦ NEW AI FEATURE LAUNCH",
    headlinePrefix: "Introducing ",
    headlineHighlight: "AI Crop Doctor 2.0",
    headlineSuffix: "",
    description:
      "Diagnose crop diseases instantly with AI. Upload any leaf photo to identify pests and infections with ICAR-verified scientific remedies in seconds.",
    b1Title: "1. Instant Leaf Photo Diagnosis",
    b1Desc: "AI-powered detection for blights, rust, mildew, and pest damage",
    b2Title: "2. Certified Treatment Plans",
    b2Desc: "Organic and chemical remedies with exact dosage and safety guides",
    b3Title: "3. Spray Weather & Risk Advisory",
    b3Desc: "Optimal spray windows based on wind speed, rain, and humidity",
    ctaPrimary: "Try AI Crop Doctor Free",
    ctaSecondary: "Ask on WhatsApp",
    trustTag1: "100% Free for Farmers",
    trustTag2: "ICAR-Backed Remedies",
    mockupTitle: "AI Crop Doctor",
    mockupSubtitle: "Instant Leaf Screening • Active",
    mockupScanLabel: "Tomato Leaf • Analyzed",
    mockupMatchLabel: "94% Match • High Confidence",
    mockupDisease: "Early Blight (Alternaria solani)",
    mockupSeverity: "Early Stage • Leaf Spotting",
    mockupTreatment: "Mancozeb 75% WP @ 2g/L water",
    mockupSprayWindow: "Optimal spray window today (Wind 6 km/h)",
    mockupActionBtn: "View Full Treatment Guide →",
  },
  hi: {
    badge: "✦ नया एआई फीचर लॉन्च",
    headlinePrefix: "पेश है ",
    headlineHighlight: "एआई क्रॉप डॉक्टर 2.0",
    headlineSuffix: "",
    description:
      "फसल के रोगों की तुरंत एआई से पहचान करें। पत्ते की फोटो अपलोड करें और सेकंडों में प्रमाणित उपचार, सही मात्रा और मौसम सलाह पाएं।",
    b1Title: "1. तुरंत पत्ता फोटो जांच",
    b1Desc: "झुलसा, फफूंद, कीट और रोगों की सटीक एआई पहचान",
    b2Title: "2. प्रमाणित उपचार व दवाइयां",
    b2Desc: "जैविक व रासायनिक समाधान सही मात्रा और उपयोग विधि के साथ",
    b3Title: "3. छिड़काव मौसम सलाह",
    b3Desc: "हवा की गति और बारिश के आधार पर सही छिड़काव समय",
    ctaPrimary: "क्रॉप डॉक्टर अभी आज़माएं",
    ctaSecondary: "व्हाट्सएप पर पूछें",
    trustTag1: "किसानों के लिए पूर्णतः निःशुल्क",
    trustTag2: "वैज्ञानिक कृषि सलाह",
    mockupTitle: "क्रॉप डॉक्टर एआई",
    mockupSubtitle: "पत्ता जांच • सक्रिय",
    mockupScanLabel: "टमाटर का पत्ता • जांच पूर्ण",
    mockupMatchLabel: "94% सटीकता • उच्च विश्वास",
    mockupDisease: "अगेती झुलसा (अर्ली ब्लाइट)",
    mockupSeverity: "प्रारंभिक अवस्था • धब्बेदार पत्ते",
    mockupTreatment: "मैंकोजेब 75% WP @ 2 ग्राम/लीटर",
    mockupSprayWindow: "आज छिड़काव के लिए अनुकूल मौसम (हवा 6 किमी/घंटा)",
    mockupActionBtn: "उपचार विवरण देखें →",
  },
};

/**
 * Premium Feature Announcement Popup for KisaanBuddy.
 * Highlights the newly launched "AI Crop Doctor 2.0" feature.
 *
 * Design features:
 * - Crisp English copy with full bilingual capability
 * - Light cream and pale green brand background
 * - Realistic phone mockup showcasing the live AI Crop Doctor screening & remedy
 * - Seamless integration with direct feature routing (/disease) and WhatsApp connectivity
 * - sessionStorage-based visit control (once per session)
 * - Accessible modal dialog with focus management, Escape key, and outside click dismiss
 */
export function AnnouncementPopup() {
  const { lang, isReady, isLanguageModalOpen } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);

  const currentLang = (lang as Lang) === "hi" ? "hi" : "en";
  const t = CONTENT[currentLang] || CONTENT.en;

  const { url: waUrl, isConfigured, phoneNumber } = getWhatsAppBusinessUrl();

  // Dismiss popup and persist in sessionStorage
  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
        document.body.style.overflow = "";
      }
    } catch {
      // Storage access blocked in strict privacy sandboxes
    }
  }, []);

  // Check sessionStorage on mount
  useEffect(() => {
    setIsMounted(true);

    if (!isReady) return;

    // Do not show while language selection modal is active
    if (isLanguageModalOpen) {
      setIsOpen(false);
      return;
    }

    try {
      const hasSeen = window.sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 550);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback
    }
  }, [isReady, isLanguageModalOpen]);

  // Lock background scrolling while open
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

  // Keyboard accessibility: Escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = setTimeout(() => {
      ctaButtonRef.current?.focus();
    }, 160);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
        return;
      }

      // Trap focus inside modal
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/65 backdrop-blur-xs overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.25 }}
          onClick={handleDismiss}
          role="presentation"
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feature-announcement-title"
            aria-describedby="feature-announcement-desc"
            className="relative w-full max-w-4xl my-auto bg-gradient-to-br from-[#FEFDF9] via-[#F7FAF4] to-[#EEF7EC] text-stone-900 rounded-3xl border border-emerald-900/10 dark:border-emerald-700/20 shadow-2xl shadow-emerald-950/25 overflow-hidden"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 0 : 16 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 300,
              duration: prefersReducedMotion ? 0.15 : 0.35,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close feature announcement"
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-30 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 border border-emerald-900/10 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Subtle Agricultural Background Watermark / Bottom Silhouette */}
            <div
              className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 1200 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 60 Q 300 20, 600 50 T 1200 40 L 1200 120 L 0 120 Z"
                  fill="#10b981"
                  fillOpacity="0.18"
                />
                <path
                  d="M0 80 Q 400 40, 800 70 T 1200 65 L 1200 120 L 0 120 Z"
                  fill="#059669"
                  fillOpacity="0.25"
                />
                <g stroke="#0f5132" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
                  <path d="M60 120 L60 85 M60 95 Q50 90 48 82 M60 90 Q70 85 72 77 M60 85 Q52 78 50 70 M60 80 Q68 73 70 65" />
                  <path d="M140 120 L140 90 M140 100 Q130 95 128 88 M140 95 Q150 90 152 82 M140 90 Q132 82 130 75" />
                  <path d="M220 120 L220 82 M220 92 Q210 87 208 80 M220 87 Q230 82 232 74" />
                  <path d="M980 120 L980 85 M980 95 Q970 90 968 82 M980 90 Q990 85 992 77 M980 85 Q972 78 970 70" />
                  <path d="M1060 120 L1060 90 M1060 100 Q1050 95 1048 88 M1060 95 Q1070 90 1072 82" />
                  <path d="M1140 120 L1140 85 M1140 95 Q1130 90 1128 82 M1140 90 Q1150 85 1152 77" />
                </g>
              </svg>
            </div>

            {/* Inner Content Grid */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-5 sm:p-7 md:p-9 lg:p-10 items-center">
              
              {/* LEFT COLUMN: Brand, Headline, Benefits, Action Buttons */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5">
                
                {/* Brand Header & Feature Badge */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 border border-emerald-900/10 shadow-2xs">
                    <img
                      src="/logo.webp"
                      alt="KisaanBuddy Logo"
                      width={28}
                      height={28}
                      className="w-7 h-7 object-contain"
                    />
                    <span className="font-display font-black text-base sm:text-lg text-stone-900 tracking-tight">
                      Kisaan<span className="text-[#0f5132]">Buddy</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-extrabold text-xs tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.badge}</span>
                  </span>
                </div>

                {/* Main Headline & Description */}
                <div className="space-y-1.5">
                  <h2
                    id="feature-announcement-title"
                    className="text-2xl sm:text-3xl lg:text-[34px] font-black text-stone-900 leading-[1.22] tracking-tight"
                  >
                    {t.headlinePrefix}
                    <span className="text-[#0f5132] underline decoration-emerald-400 decoration-4 underline-offset-4">
                      {t.headlineHighlight}
                    </span>
                    {t.headlineSuffix}
                  </h2>
                  <p
                    id="feature-announcement-desc"
                    className="text-stone-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed pt-1"
                  >
                    {t.description}
                  </p>
                </div>

                {/* 3 Core Feature Highlights */}
                <div className="space-y-2 pt-1 sm:pt-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-800 shrink-0">
                      <Camera className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        {t.b1Title}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {t.b1Desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100/90 text-amber-800 shrink-0">
                      <FlaskConical className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        {t.b2Title}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {t.b2Desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100/90 text-sky-800 shrink-0">
                      <CloudSun className="w-5 h-5 text-sky-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        {t.b3Title}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {t.b3Desc}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Primary Feature Launch & Secondary WhatsApp Link */}
                <div className="pt-2 sm:pt-3 space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Primary Button: Direct Access to AI Crop Doctor */}
                    <Link
                      ref={ctaButtonRef}
                      href="/disease"
                      onClick={handleDismiss}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#0f5132] hover:bg-[#146c43] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-900/25 transition-all group cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>{t.ctaPrimary}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Secondary Button: Official WhatsApp Channel */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleDismiss}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] font-bold text-xs sm:text-sm border border-[#25D366]/30 transition-all cursor-pointer"
                      title="Open WhatsApp Help Desk"
                    >
                      <svg
                        className="w-4 h-4 fill-[#25D366]"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>{t.ctaSecondary}</span>
                    </a>
                  </div>

                  {/* Trust indicator and configuration status */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 pt-0.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.trustTag1}</span>
                    </span>
                    <span>•</span>
                    <span>{t.trustTag2}</span>
                    {isConfigured && phoneNumber && (
                      <>
                        <span>•</span>
                        <span>Helpline: +{phoneNumber}</span>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Realistic Phone Mockup with AI Crop Doctor in Action */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="w-[270px] sm:w-[290px] lg:w-[305px] bg-[#0F172A] rounded-[36px] p-2.5 shadow-2xl shadow-emerald-950/25 border-4 border-slate-700/60 ring-1 ring-slate-900/40 relative select-none">
                  
                  {/* Phone Speaker & Dynamic Island Camera */}
                  <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto mb-1.5 flex items-center justify-end px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  </div>

                  {/* Phone Screen Glass */}
                  <div className="bg-[#F8FAF6] rounded-[26px] overflow-hidden flex flex-col border border-slate-800/10 shadow-inner">
                    
                    {/* App Header Inside Phone */}
                    <div className="bg-[#0f5132] text-white px-3 py-2 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src="/logo.webp"
                          alt="Crop Doctor"
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full bg-white object-contain p-0.5"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {t.mockupTitle}
                            </span>
                            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-emerald-400 text-[#0f5132] text-[8px] font-black">
                              ✓
                            </span>
                          </div>
                          <span className="text-[8.5px] text-emerald-200 truncate">
                            {t.mockupSubtitle}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-[9px] font-bold">
                        AI Ready
                      </span>
                    </div>

                    {/* App Screen Content: Live Crop Disease Detection Result */}
                    <div className="p-2.5 space-y-2 text-[10.5px] leading-tight min-h-[220px] flex flex-col justify-between">
                      
                      <div className="space-y-2">
                        {/* 1. Leaf Scan Status Card */}
                        <div className="bg-white rounded-xl p-2.5 shadow-2xs border border-emerald-500/20 flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shrink-0 relative">
                            <Sprout className="w-5 h-5 text-emerald-700" />
                            <div className="absolute inset-0 rounded-xl border border-emerald-400/50 animate-ping opacity-25" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-stone-900 text-[11px] truncate">
                              {t.mockupScanLabel}
                            </div>
                            <div className="text-[9.5px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{t.mockupMatchLabel}</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Detected Disease Card */}
                        <div className="bg-amber-50/90 rounded-xl p-2 shadow-2xs border border-amber-200/70">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[10px]">
                            <Bug className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span className="truncate">{t.mockupDisease}</span>
                          </div>
                          <div className="text-[9px] text-amber-800/90 mt-1 flex items-center justify-between">
                            <span>Status: {t.mockupSeverity}</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-200/60 font-semibold text-[8px]">
                              Screened
                            </span>
                          </div>
                        </div>

                        {/* 3. Certified Treatment Remedy */}
                        <div className="bg-white rounded-xl p-2 shadow-2xs border border-stone-200/60 space-y-1">
                          <div className="flex items-center gap-1.5 text-stone-900 font-bold text-[10px]">
                            <FlaskConical className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Recommended Solution:</span>
                          </div>
                          <div className="text-[9.5px] font-semibold text-stone-800 pl-5">
                            {t.mockupTreatment}
                          </div>
                          <div className="text-[8.5px] text-stone-500 pl-5 flex items-center gap-1 pt-0.5">
                            <CloudSun className="w-3 h-3 text-sky-500 shrink-0" />
                            <span className="truncate">{t.mockupSprayWindow}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mockup Button Link to /disease */}
                      <div className="pt-1.5">
                        <Link
                          href="/disease"
                          onClick={handleDismiss}
                          className="block w-full py-2 rounded-xl bg-[#0f5132] hover:bg-[#146c43] text-white text-center font-bold text-[10px] shadow-xs transition-colors"
                        >
                          {t.mockupActionBtn}
                        </Link>
                        <div className="flex items-center justify-center gap-1.5 text-[8.5px] text-stone-400 mt-1.5 text-center">
                          <span>✓ Verified by Agricultural Experts</span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementPopup;
