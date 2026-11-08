"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  ArrowRight,
  Sprout,
  BellRing,
  CloudSun,
  ShieldCheck,
  Check,
  CheckCheck,
  PhoneCall,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

export const WHATSAPP_STORAGE_KEY = "kisaanbuddy_whatsapp_announcement_seen";
export const PREFILLED_HINDI_MESSAGE = "नमस्ते KisaanBuddy! मुझे खेती से जुड़ी जानकारी चाहिए।";

/**
 * Resolves the official WhatsApp Business URL.
 * Strictly adheres to KisaanBuddy's "Reality First" principle:
 * - If NEXT_PUBLIC_WHATSAPP_NUMBER is configured, generates: https://wa.me/<number>?text=...
 * - If not configured, uses the official universal wa.me link: https://wa.me/?text=...
 * - NEVER fabricates or hardcodes a fake phone number.
 */
export function getWhatsAppBusinessUrl(customMessage: string = PREFILLED_HINDI_MESSAGE) {
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

  // Authentic official wa.me universal format without fabricated phone number
  return {
    url: `https://wa.me/?text=${encodedText}`,
    isConfigured: false,
    phoneNumber: null,
  };
}

/**
 * Premium WhatsApp Announcement Popup for KisaanBuddy.
 * Announces: "अब KisaanBuddy WhatsApp पर भी!"
 *
 * Design features:
 * - Light cream and pale green background
 * - KisaanBuddy green brand palette
 * - Realistic phone mockup on right with KisaanBuddy WhatsApp chat conversation
 * - Subtle agricultural illustration at the bottom
 * - Accessible modal dialog with focus management, Escape key, and outside click dismiss
 * - sessionStorage-based display (shows once per session, triggers again on new session)
 */
export function AnnouncementPopup() {
  const { isReady, isLanguageModalOpen } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);

  const { url: waUrl, isConfigured, phoneNumber } = getWhatsAppBusinessUrl();

  // Handle dismiss: record in sessionStorage so it doesn't reappear in same session
  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(WHATSAPP_STORAGE_KEY, "true");
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
      const hasSeen = window.sessionStorage.getItem(WHATSAPP_STORAGE_KEY);
      if (!hasSeen) {
        // Subtle entrance delay right after page hydration
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

  const handleCtaClick = () => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(WHATSAPP_STORAGE_KEY, "true");
      }
    } catch {}
    setIsOpen(false);
  };

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
            aria-labelledby="whatsapp-announcement-title"
            aria-describedby="whatsapp-announcement-desc"
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
              aria-label="पॉपअप बंद करें / Close announcement"
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
                {/* Rolling Farm Hills */}
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
                {/* Wheat Stalk Silhouettes */}
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
              
              {/* LEFT COLUMN: Brand, Headline, Benefits, CTA */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5">
                
                {/* Brand Header & Official Badge */}
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

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#075E54] font-bold text-xs">
                    {/* WhatsApp Icon */}
                    <svg
                      className="w-4 h-4 fill-[#25D366]"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>आधिकारिक सेवा</span>
                  </span>
                </div>

                {/* Main Headline */}
                <div className="space-y-1.5">
                  <h2
                    id="whatsapp-announcement-title"
                    className="text-2xl sm:text-3xl lg:text-[34px] font-black text-stone-900 leading-[1.22] tracking-tight"
                  >
                    अब KisaanBuddy{" "}
                    <span className="text-[#075E54] underline decoration-[#25D366] decoration-4 underline-offset-4">
                      WhatsApp
                    </span>{" "}
                    पर भी!
                  </h2>
                  <p
                    id="whatsapp-announcement-desc"
                    className="text-stone-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed pt-1"
                  >
                    अब पाएं खेती से जुड़ी जानकारी, सलाह और जरूरी अपडेट्स सीधे अपने WhatsApp पर – आसान, तेज़ और आपके पास!
                  </p>
                </div>

                {/* 3 Core Benefits */}
                <div className="space-y-2 pt-1 sm:pt-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-800 shrink-0">
                      <Sprout className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        1. फसल से जुड़ी सलाह
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        रोग पहचान, सही खाद-बीज और विशेषज्ञ की राय
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100/90 text-amber-800 shrink-0">
                      <BellRing className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        2. महत्वपूर्ण खेती अपडेट्स
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        ताजा मंडी भाव, सरकारी योजनाएं और कृषि अलर्ट
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100/90 text-sky-800 shrink-0">
                      <CloudSun className="w-5 h-5 text-sky-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        3. मौसम की जानकारी
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        बारिश का पूर्वानुमान और तापमान संबंधी चेतावनियां
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary CTA & Direct Connect Note */}
                <div className="pt-2 sm:pt-3 space-y-2">
                  <a
                    ref={ctaButtonRef}
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCtaClick}
                    className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#25D366]/35 transition-all group cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5 fill-white"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>अब WhatsApp पर जुड़ें</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Trust indicator and configuration status */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 pt-0.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>निःशुल्क किसान सेवा</span>
                    </span>
                    <span>•</span>
                    <span>
                      {isConfigured && phoneNumber ? (
                        <span>हेल्पलाइन: +{phoneNumber}</span>
                      ) : (
                        <span>1-क्लिक सीधा संवाद</span>
                      )}
                    </span>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Realistic Phone Mockup with WhatsApp Conversation */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="w-[270px] sm:w-[290px] lg:w-[305px] bg-[#0F172A] rounded-[36px] p-2.5 shadow-2xl shadow-emerald-950/25 border-4 border-slate-700/60 ring-1 ring-slate-900/40 relative select-none">
                  
                  {/* Phone Speaker & Dynamic Island Camera */}
                  <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto mb-1.5 flex items-center justify-end px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  </div>

                  {/* Phone Screen */}
                  <div className="bg-[#EFEAE2] rounded-[26px] overflow-hidden flex flex-col border border-slate-800/10 shadow-inner">
                    
                    {/* WhatsApp Top Header */}
                    <div className="bg-[#075E54] text-white px-2.5 py-2 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-white text-xs font-bold">←</span>
                        <div className="relative">
                          <img
                            src="/logo.webp"
                            alt="KisaanBuddy WhatsApp"
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full bg-white object-contain p-0.5"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#25D366] border border-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white truncate max-w-[95px]">
                              KisaanBuddy
                            </span>
                            {/* Official Green Check Badge */}
                            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-[#25D366] text-white text-[8px] font-black">
                              ✓
                            </span>
                          </div>
                          <span className="text-[9px] text-emerald-200 truncate">
                            ऑनलाइन • Official
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/90 shrink-0">
                        <Video className="w-3.5 h-3.5" />
                        <PhoneCall className="w-3.5 h-3.5" />
                        <MoreVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* WhatsApp Chat Conversation Body */}
                    <div className="p-2.5 space-y-2 text-[10.5px] leading-tight min-h-[220px] flex flex-col justify-between">
                      
                      {/* Date Pill */}
                      <div className="flex justify-center">
                        <span className="px-2 py-0.5 rounded-full bg-[#E1DCD3] text-stone-600 text-[9px] font-semibold shadow-2xs">
                          आज • TODAY
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* 1. Incoming Message from KisaanBuddy */}
                        <div className="bg-white rounded-xl rounded-tl-none p-2 shadow-2xs text-stone-800 max-w-[92%] border border-stone-200/50">
                          <p className="font-bold text-[#075E54] text-[10px] mb-0.5">
                            KisaanBuddy Support 🌱
                          </p>
                          <p className="text-stone-700 leading-snug">
                            नमस्ते किसान भाई! 🙏 KisaanBuddy WhatsApp पर आपका स्वागत है।
                          </p>
                          <div className="mt-1 pt-1 border-t border-stone-100 text-[9.5px] text-stone-600 space-y-0.5 font-medium">
                            <div>🌾 1. फसल से जुड़ी सलाह</div>
                            <div>📢 2. महत्वपूर्ण खेती अपडेट्स</div>
                            <div>🌦️ 3. मौसम की जानकारी</div>
                          </div>
                          <div className="text-[8.5px] text-stone-400 text-right mt-1">
                            10:30 AM
                          </div>
                        </div>

                        {/* 2. Outgoing Message from Farmer (Prefilled welcome message) */}
                        <div className="bg-[#DCF8C6] rounded-xl rounded-tr-none p-2 shadow-2xs text-stone-900 ml-auto max-w-[88%] border border-[#c4eab0]">
                          <p className="text-stone-900 leading-snug font-medium">
                            {PREFILLED_HINDI_MESSAGE}
                          </p>
                          <div className="flex items-center justify-end gap-1 text-[8.5px] text-stone-500 mt-1">
                            <span>10:31 AM</span>
                            <CheckCheck className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" />
                          </div>
                        </div>

                        {/* 3. Fast automated response from KisaanBuddy */}
                        <div className="bg-white rounded-xl rounded-tl-none p-2 shadow-2xs text-stone-800 max-w-[85%] border border-stone-200/50">
                          <p className="text-stone-700 leading-snug">
                            जी अवश्य! अपनी फसल का नाम या प्रश्न साझा करें, हमारी टीम तुरंत सहायता करेगी। 🌾
                          </p>
                          <div className="text-[8.5px] text-stone-400 text-right mt-0.5">
                            10:31 AM
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Bottom Chat Input Bar */}
                      <div className="pt-2 flex items-center gap-1.5">
                        <div className="flex-1 bg-white rounded-full px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xs border border-stone-200/70 text-stone-400 text-[10px]">
                          <Smile className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="flex-1 text-stone-500 truncate">
                            संदेश लिखें...
                          </span>
                          <Paperclip className="w-3 h-3 text-stone-400 shrink-0" />
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#128C7E] flex items-center justify-center text-white shadow-2xs shrink-0">
                          <Mic className="w-3.5 h-3.5" />
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
