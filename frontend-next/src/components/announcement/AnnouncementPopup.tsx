"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  ArrowRight,
  Sprout,
  Store,
  TrendingUp,
  ShieldCheck,
  CheckCheck,
  PhoneCall,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Wifi,
  ChevronLeft,
  Plus,
  Camera,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

export const ANNOUNCEMENT_STORAGE_KEY = "kisaanbuddy_whatsapp_brand_announcement_seen";
export const PREFILLED_WHATSAPP_MESSAGE = "नमस्ते KisaanBuddy! मुझे खेती से जुड़ी जानकारी चाहिए।";
export const OFFICIAL_WHATSAPP_NUMBER = "916209856252";
export const OFFICIAL_WHATSAPP_URL = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}`;

/**
 * Resolves the official WhatsApp Business URL.
 * Strictly adheres to KisaanBuddy's "Reality First" principle:
 * - Uses NEXT_PUBLIC_WHATSAPP_NUMBER if configured, otherwise defaults to KisaanBuddy's official +91 62098 56252 account.
 * - Generates https://wa.me/916209856252 (or with ?text=... when customMessage is explicitly provided).
 */
export function getWhatsAppBusinessUrl(customMessage?: string) {
  const envPhone =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_KISAANBUDDY_WHATSAPP ||
    OFFICIAL_WHATSAPP_NUMBER;

  const cleanPhone = envPhone.replace(/\D/g, "");
  const formatted =
    cleanPhone.startsWith("91") && cleanPhone.length > 10
      ? cleanPhone
      : cleanPhone.length >= 10
      ? `91${cleanPhone.slice(-10)}`
      : OFFICIAL_WHATSAPP_NUMBER;

  const trimmedMessage = customMessage?.trim();
  const url = trimmedMessage
    ? `https://wa.me/${formatted}?text=${encodeURIComponent(trimmedMessage)}`
    : `https://wa.me/${formatted}`;

  return {
    url,
    isConfigured: true,
    phoneNumber: formatted,
  };
}

/**
 * Official Brand Announcement Popup: "KisaanBuddy is Now on WhatsApp!"
 *
 * Preserves the exact modal design, dimensions, palette, animations,
 * and smartphone mockup while replacing AI Crop Doctor content with
 * the general WhatsApp brand launch.
 */
export function AnnouncementPopup() {
  const { isReady, isLanguageModalOpen, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);

  const ANNOUNCEMENT_I18N: Record<string, {
    badge: string;
    headingPrefix: string;
    headingSuffix: string;
    desc: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustFree: string;
    trustOfficial: string;
    botGreeting: string;
    farmerMsg: string;
  }> = {
    hi: {
      badge: "KISAANBUDDY व्हाट्सएप लॉन्च",
      headingPrefix: "KisaanBuddy अब",
      headingSuffix: "व्हाट्सएप पर भी!",
      desc: "आपका कृषि साथी अब बस एक व्हाट्सएप संदेश की दूरी पर है। खेती की सलाह, फसल मार्गदर्शन, मंडी भाव और जरूरी सूचनाएं सीधे व्हाट्सएप पर प्राप्त करें।",
      card1Title: "खेती सलाह व मार्गदर्शन",
      card1Desc: "फसल के सवालों पर विशेषज्ञों व AI से तुरंत मार्गदर्शन पाएं।",
      card2Title: "कृषि मार्केटप्लेस",
      card2Desc: "उपकरण, बीज और उपज के लिए सत्यापित विक्रेताओं से जुड़ें।",
      card3Title: "दैनिक मंडी भाव जानकारी",
      card3Desc: "सरकारी AGMARKNET मंडियों के ताज़ा भावों से अपडेट रहें।",
      ctaPrimary: "KisaanBuddy से व्हाट्सएप पर चैट करें",
      ctaSecondary: "वेबसाइट देखना जारी रखें",
      trustFree: "मुफ्त कृषि सहायता",
      trustOfficial: "आधिकारिक व्हाट्सएप चैनल",
      botGreeting: "नमस्ते किसान मित्र! KisaanBuddy में आपका स्वागत है। आज हम आपकी खेती में कैसे मदद कर सकते हैं?",
      farmerMsg: "नमस्ते KisaanBuddy! मुझे खेती से जुड़ी जानकारी चाहिए।",
    },
    kn: {
      badge: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ವಾಟ್ಸಾಪ್ ಬಿಡುಗಡೆ",
      headingPrefix: "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಈಗ",
      headingSuffix: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲೂ ಲಭ್ಯ!",
      desc: "ನಿಮ್ಮ ಕೃಷಿ ಸಂಗಾತಿ ಈಗ ಕೇವಲ ಒಂದು ವಾಟ್ಸಾಪ್ ಸಂದೇಶದ ದೂರದಲ್ಲಿದ್ದಾರೆ. ಕೃಷಿ ಮಾಹಿತಿ, ಬೆಳೆ ಮಾರ್ಗದರ್ಶನ, ಮಂಡಿ ದರಗಳು ಮತ್ತು ಪ್ರಮುಖ ಸೂಚನೆಗಳನ್ನು ನೇರವಾಗಿ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಪಡೆಯಿರಿ.",
      card1Title: "ಕೃಷಿ ನೆರವು ಮತ್ತು ಮಾರ್ಗದರ್ಶನ",
      card1Desc: "ಬೆಳೆಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ತ್ವರಿತ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಪರಿಹಾರ ಪಡೆಯಿರಿ.",
      card2Title: "ಕೃಷಿ ಮಾರುಕಟ್ಟೆ",
      card2Desc: "ಉಪಕರಣಗಳು, ಬೀಜಗಳು ಮತ್ತು ಉತ್ಪನ್ನಗಳಿಗಾಗಿ ಮಾರಾಟಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      card3Title: "ದೈನಂದಿನ ಮಂಡಿ ದರ ಮಾಹಿತಿ",
      card3Desc: "ಸರ್ಕಾರಿ AGMARKNET ಮಂಡಿ ದರಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.",
      ctaPrimary: "ಕಿಸಾನ್‌ಬಡ್ಡಿಯೊಂದಿಗೆ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಚಾಟ್ ಮಾಡಿ",
      ctaSecondary: "ವೆಬ್‌ಸೈಟ್ ನೋಡುವುದನ್ನು ಮುಂದುವರಿಸಿ",
      trustFree: "ಉಚಿತ ಕೃಷಿ ನೆರವು",
      trustOfficial: "ಅಧಿಕೃತ ವಾಟ್ಸಾಪ್ ಚಾನೆಲ್",
      botGreeting: "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ಕಿಸಾನ್‌ಬಡ್ಡಿಗೆ ಸುಸ್ವಾಗತ. ಇಂದು ನಿಮ್ಮ ಕೃಷಿಯಲ್ಲಿ ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
      farmerMsg: "ನಮಸ್ಕಾರ ಕಿಸಾನ್‌ಬಡ್ಡಿ! ನನಗೆ ಕೃಷಿ ಸಂಬಂಧಿತ ಮಾಹಿತಿ ಬೇಕು.",
    },
    te: {
      badge: "కిసాన్‌బడ్డీ వాట్సాప్ ప్రారంభం",
      headingPrefix: "కిసాన్‌బడ్డీ ఇప్పుడు",
      headingSuffix: "వాట్సాప్‌లో కూడా!",
      desc: "మీ వ్యవసాయ సహచరుడు ఇప్పుడు ఒక్క వాట్సాప్ సందేశం దూరంలో ఉన్నారు. వ్యవసాయ సమాచారం, పంట మార్గదర్శకత్వం, మార్కెట్ ధరలు నేరుగా వాట్సాప్‌లో పొందండి.",
      card1Title: "వ్యవసాయ సహాయం & మార్గదర్శకత్వం",
      card1Desc: "మీ పంట ప్రశ్నలకు వేగవంతమైన మార్గదర్శకత్వం పొందండి.",
      card2Title: "వ్యవసాయ మార్కెట్‌ప్లేస్",
      card2Desc: "పరికరాలు, విత్తనాల కోసం ధృవీకరించబడిన విక్రేతలతో కనెక్ట్ అవ్వండి.",
      card3Title: "రోజువారీ మార్కెట్ ధరల సమాచారం",
      card3Desc: "తాజా మార్కెట్ ధరల సమాచారాన్ని నిరంతరం తెలుసుకోండి.",
      ctaPrimary: "కిసాన్‌బడ్డీతో వాట్సాప్‌లో చాట్ చేయండి",
      ctaSecondary: "వెబ్‌సైట్‌ను చూడటం కొనసాగించండి",
      trustFree: "ఉచిత వ్యవసాయ సహాయం",
      trustOfficial: "అధికారిక వాట్సాప్ ఛానెల్",
      botGreeting: "నమస్కారం రైతు మిత్రమా! కిసాన్‌బడ్డీకి స్వాగతం. ఈరోజు మీ వ్యవసాయంలో మేము ఎలా సహాయపడగలం?",
      farmerMsg: "నమస్కారం కిసాన్‌బడ్డీ! నాకు వ్యవసాయ సమాచారం కావాలి.",
    },
    ta: {
      badge: "கிசான்பட்டி வாட்ஸ்அப் அறிமுகம்",
      headingPrefix: "கிசான்பட்டி இப்போது",
      headingSuffix: "வாட்ஸ்அப்பிலும்!",
      desc: "உங்கள் விவசாய தோழன் இப்போது ஒரு வாட்ஸ்அப் செய்தி தூரத்தில். வேளாண் தகவல், பயிர் வழிகாட்டுதல், மண்டி விலைகளை நேரடியாக வாட்ஸ்அப்பில் பெறுங்கள்.",
      card1Title: "விவசாய உதவி & வழிகாட்டுதல்",
      card1Desc: "பயிர் கேள்விகளுக்கு உடனடி வழிகாட்டுதல் பெறுங்கள்.",
      card2Title: "வேளாண் சந்தை",
      card2Desc: "கருவிகள், விதைகளுக்காக சரிபார்க்கப்பட்ட விற்பனையாளர்களைத் தொடர்பு கொள்ளுங்கள்.",
      card3Title: "தினசரி மண்டி விலை தகவல்",
      card3Desc: "அரசு அக்மார்க்நெட் மண்டி விலைகளை உடனுக்குடன் தெரிந்து கொள்ளுங்கள்.",
      ctaPrimary: "கிசான்பட்டியுடன் வாட்ஸ்அப்பில் உரையாடுங்கள்",
      ctaSecondary: "வலைத்தளத்தை தொடர்ந்து பார்க்கவும்",
      trustFree: "இலவச வேளாண் உதவி",
      trustOfficial: "அதிகாரப்பூர்வ வாட்ஸ்அப் சேனல்",
      botGreeting: "வணக்கம் உழவர் தோழரே! கிசான்பட்டிக்கு நல்வரவு. இன்று உங்கள் விவசாயத்தில் எவ்வாறு உதவலாம்?",
      farmerMsg: "வணக்கம் கிசான்பட்டி! எனக்கு விவசாய தகவல் தேவை.",
    },
    mr: {
      badge: "किसानबडी व्हॉट्सॲप लाँच",
      headingPrefix: "किसानबडी आता",
      headingSuffix: "व्हॉट्सॲपवर देखील!",
      desc: "तुमचा शेती मित्र आता फक्त एका व्हॉट्सॲप मेसेजच्या अंतरावर आहे. शेतीची माहिती, पीक मार्गदर्शन, बाजार भाव आणि महत्त्वाच्या सूचना थेट व्हॉट्सॲपवर मिळवा.",
      card1Title: "शेती सल्ला व मार्गदर्शन",
      card1Desc: "शेतीच्या प्रश्नांवर त्वरित मार्गदर्शन मिळवा.",
      card2Title: "कृषी मार्केटप्लेस",
      card2Desc: "उपकरणे, बियाणे आणि उत्पादनांसाठी पडताळणी केलेल्या विक्रेत्यांशी जोडा.",
      card3Title: "दैनिक बाजार भाव माहिती",
      card3Desc: "सरकारी AGMARKNET बाजार भावांची ताजी माहिती मिळवा.",
      ctaPrimary: "किसानबडीशी व्हॉट्सॲपवर चॅट करा",
      ctaSecondary: "वेबसाईट पाहणे सुरू ठेवा",
      trustFree: "मोफत शेती मदत",
      trustOfficial: "अधिकृत व्हॉट्सॲप चॅनल",
      botGreeting: "नमस्कार शेतकरी मित्र! किसानबडी मध्ये आपले स्वागत आहे. आज आम्ही आपल्या शेतीमध्ये कशी मदत करू शकतो?",
      farmerMsg: "नमस्कार किसानबडी! मला शेतीविषयक माहिती हवी आहे.",
    },
    en: {
      badge: "KISAANBUDDY WHATSAPP LAUNCH",
      headingPrefix: "KisaanBuddy is Now on",
      headingSuffix: "WhatsApp!",
      desc: "Your farming companion is now just one WhatsApp message away. Get agricultural information, farming guidance, market updates and important notifications directly on WhatsApp.",
      card1Title: "Farming Assistance",
      card1Desc: "Get guidance and answers to your farming questions.",
      card2Title: "Farm Marketplace",
      card2Desc: "Connect with verified sellers for equipment, seeds, and produce.",
      card3Title: "Mandi Price Information",
      card3Desc: "Stay informed about agricultural market prices.",
      ctaPrimary: "Chat with KisaanBuddy on WhatsApp",
      ctaSecondary: "Continue Exploring Website",
      trustFree: "Free Farming Assistance",
      trustOfficial: "Official WhatsApp Channel",
      botGreeting: "Hello farmer friend! Welcome to KisaanBuddy. How can we assist with your farm today?",
      farmerMsg: "Hello KisaanBuddy! I need information regarding farming.",
    },
  };

  const aDict = ANNOUNCEMENT_I18N[lang] || ANNOUNCEMENT_I18N.hi;

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

  const handleCtaClick = () => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
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
              aria-label="Close WhatsApp announcement"
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
              
              {/* LEFT COLUMN: Brand, Headline, Feature Cards, Action Buttons */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5">
                
                {/* Brand Header & Top Badge */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCtaClick}
                  aria-label="Chat with KisaanBuddy on WhatsApp (+91 62098 56252)"
                  className="inline-flex flex-wrap items-center gap-2.5 sm:gap-3 w-fit cursor-pointer hover:opacity-95 transition-opacity"
                >
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

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#075E54] font-extrabold text-xs tracking-wide">
                    {/* WhatsApp Icon */}
                    <svg
                      className="w-3.5 h-3.5 fill-[#25D366]"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>{aDict.badge}</span>
                  </span>
                </a>

                {/* Main Heading & Description */}
                <div className="space-y-1.5">
                  <h2
                    id="whatsapp-announcement-title"
                    className="text-2xl sm:text-3xl lg:text-[34px] font-black text-stone-900 leading-[1.22] tracking-tight"
                  >
                    {aDict.headingPrefix}{" "}
                    <span className="text-[#075E54] underline decoration-[#25D366] decoration-4 underline-offset-4">
                      {aDict.headingSuffix}
                    </span>
                  </h2>
                  <p
                    id="whatsapp-announcement-desc"
                    className="text-stone-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed pt-1"
                  >
                    {aDict.desc}
                  </p>
                </div>

                {/* 3 Feature Cards */}
                <div className="space-y-2 pt-1 sm:pt-2">
                  {/* Card 1: Farming Assistance */}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-800 shrink-0">
                      <Sprout className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span>🌱</span>
                        <span>{aDict.card1Title}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {aDict.card1Desc}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Farm Marketplace */}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100/90 text-sky-800 shrink-0">
                      <Store className="w-5 h-5 text-sky-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span>🛒</span>
                        <span>{aDict.card2Title}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {aDict.card2Desc}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Mandi Price Information */}
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/80 border border-emerald-900/10 shadow-2xs hover:bg-white transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100/90 text-amber-800 shrink-0">
                      <TrendingUp className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span>📊</span>
                        <span>{aDict.card3Title}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {aDict.card3Desc}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary & Secondary CTA Buttons */}
                <div className="pt-2 sm:pt-3 space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Primary Button: Open Official WhatsApp Conversation */}
                    <a
                      ref={ctaButtonRef}
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleCtaClick}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#25D366]/35 transition-all group cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5 fill-white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>{aDict.ctaPrimary}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    {/* Secondary Button: Continue Exploring Website */}
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="inline-flex items-center justify-center px-5 py-3.5 rounded-2xl bg-white/90 hover:bg-stone-100 text-stone-700 hover:text-stone-900 font-bold text-xs sm:text-sm border border-stone-200/90 transition-all cursor-pointer"
                    >
                      <span>{aDict.ctaSecondary}</span>
                    </button>
                  </div>

                  {/* Trust indicator & configuration note */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 pt-0.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{aDict.trustFree}</span>
                    </span>
                    <span>•</span>
                    <span>
                      {isConfigured && phoneNumber ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleCtaClick}
                          className="font-semibold hover:text-[#075E54] hover:underline transition-colors cursor-pointer"
                        >
                          Official Helpline: +{phoneNumber.length === 12 && phoneNumber.startsWith("91") ? `${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 7)} ${phoneNumber.slice(7)}` : phoneNumber}
                        </a>
                      ) : (
                        <span>{aDict.trustOfficial}</span>
                      )}
                    </span>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Realistic Apple iPhone Mockup with WhatsApp UI Preview */}
              <div className="lg:col-span-5 flex justify-center items-center">
                {/* iPhone Outer Hardware Chassis with Side Buttons */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCtaClick}
                  aria-label="Chat with KisaanBuddy on WhatsApp (+91 62098 56252)"
                  className="relative block w-[280px] sm:w-[295px] lg:w-[310px] select-none cursor-pointer transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] rounded-[46px]"
                >
                  {/* Left Side Buttons (Action button, Volume Up, Volume Down) */}
                  <div className="absolute -left-[3px] top-[70px] w-[3px] h-5 bg-slate-500 rounded-l-xs" />
                  <div className="absolute -left-[3px] top-[100px] w-[3px] h-9 bg-slate-500 rounded-l-xs" />
                  <div className="absolute -left-[3px] top-[144px] w-[3px] h-9 bg-slate-500 rounded-l-xs" />
                  {/* Right Side Button (Power / Siri) */}
                  <div className="absolute -right-[3px] top-[108px] w-[3px] h-14 bg-slate-500 rounded-r-xs" />

                  {/* Titanium Curved Perimeter Border */}
                  <div className="rounded-[46px] p-[2.5px] bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-slate-900/60">
                    {/* Ultra-slim Matte Black Bezel */}
                    <div className="rounded-[43.5px] p-[6.5px] bg-slate-950">
                      {/* iPhone Screen Glass */}
                      <div className="relative rounded-[37px] overflow-hidden bg-[#EFEAE2] flex flex-col border border-slate-900/20 shadow-inner">
                        
                        {/* iOS Status Bar with Dynamic Island */}
                        <div className="relative bg-[#075E54] text-white pt-2 px-3.5 pb-1 flex items-center justify-between z-20">
                          {/* Time */}
                          <span className="font-semibold text-[11px] tracking-tight pl-1 font-sans">
                            9:41
                          </span>

                          {/* Dynamic Island Pill */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-[76px] h-[18px] bg-black rounded-full flex items-center justify-end px-2 gap-1 shadow-xs border border-white/5">
                            {/* Camera Sensor Dots */}
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1c2a38]/90 border border-slate-800" />
                            <div className="w-1 h-1 rounded-full bg-[#0d2238]" />
                          </div>

                          {/* Cellular, Wi-Fi & Battery */}
                          <div className="flex items-center gap-1.5 text-white/95 pr-1">
                            {/* Cellular Signal (4 bars) */}
                            <div className="flex items-end gap-[1.5px] h-2.5">
                              <span className="w-[2px] h-1 bg-white rounded-2xs" />
                              <span className="w-[2px] h-1.5 bg-white rounded-2xs" />
                              <span className="w-[2px] h-2 bg-white rounded-2xs" />
                              <span className="w-[2px] h-2.5 bg-white rounded-2xs" />
                            </div>
                            <Wifi className="w-3 h-3 text-white" />
                            {/* Battery */}
                            <div className="flex items-center">
                              <div className="w-3.5 h-2 rounded-[2px] border border-white p-[0.8px] flex items-center">
                                <div className="h-full w-full bg-white rounded-[1px]" />
                              </div>
                              <div className="w-[1px] h-1 bg-white rounded-r-xs -ml-[0.5px]" />
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp iOS Top Header Bar */}
                        <div className="bg-[#075E54] text-white px-2.5 py-1.5 flex items-center justify-between border-t border-[#065047] shadow-xs">
                          <div className="flex items-center gap-1 min-w-0">
                            <ChevronLeft className="w-4 h-4 text-emerald-200 stroke-[2.5] -ml-1 shrink-0" />
                            <div className="relative shrink-0">
                              <img
                                src="/logo.webp"
                                alt="KisaanBuddy"
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full bg-white object-contain p-0.5 border border-white/20"
                              />
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#25D366] border border-[#075E54]" />
                            </div>
                            <div className="flex flex-col min-w-0 text-left pl-0.5">
                              <div className="flex items-center gap-1 leading-tight">
                                <span className="text-[11.5px] font-bold text-white truncate max-w-[105px]">
                                  KisaanBuddy
                                </span>
                                <span className="w-3 h-3 rounded-full bg-[#25D366] text-slate-950 flex items-center justify-center text-[7px] font-black shrink-0">
                                  ✓
                                </span>
                              </div>
                              <span className="text-[9px] text-emerald-200 truncate">
                                Online • WhatsApp Service
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 text-white/90 shrink-0 pr-1">
                            <Video className="w-3.5 h-3.5" />
                            <PhoneCall className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* WhatsApp Chat Conversation UI Preview */}
                        <div className="p-2.5 space-y-2 text-[10.5px] leading-tight min-h-[220px] flex flex-col justify-between">
                          
                          {/* UI Preview Disclaimer Tag */}
                          <div className="flex justify-center">
                            <span className="px-2 py-0.5 rounded-full bg-[#E1DCD3] text-stone-600 text-[8.5px] font-semibold shadow-2xs">
                              UI Preview • WhatsApp
                            </span>
                          </div>

                          <div className="space-y-2">
                            {/* 1. Official Welcome Message Bubble */}
                            <div className="bg-white rounded-xl rounded-tl-none p-2.5 shadow-2xs text-stone-800 max-w-[92%] border border-stone-200/50 space-y-1 text-left">
                              <p className="font-bold text-[#075E54] text-[10px]">
                                KisaanBuddy 🌱
                              </p>
                              <p className="text-stone-700 leading-snug">
                                {aDict.botGreeting}
                              </p>
                              <div className="pt-1 border-t border-stone-100 text-[9px] text-stone-600 space-y-0.5 font-medium">
                                <div>🌱 1. {aDict.card1Title}</div>
                                <div>🛒 2. {aDict.card2Title}</div>
                                <div>📊 3. {aDict.card3Title}</div>
                              </div>
                              <div className="text-[8.5px] text-stone-400 text-right mt-1">
                                10:30 AM
                              </div>
                            </div>

                            {/* 2. Outgoing Farmer Inquiry Bubble */}
                            <div className="bg-[#DCF8C6] rounded-xl rounded-tr-none p-2 shadow-2xs text-stone-900 ml-auto max-w-[85%] border border-[#c4eab0] text-left">
                              <p className="text-stone-900 leading-snug font-medium">
                                {aDict.farmerMsg}
                              </p>
                              <div className="flex items-center justify-end gap-1 text-[8.5px] text-stone-500 mt-1">
                                <span>10:31 AM</span>
                                <CheckCheck className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" />
                              </div>
                            </div>
                          </div>

                          {/* WhatsApp iOS Bottom Input Bar */}
                          <div className="pt-1 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-stone-200/80 flex items-center justify-center shrink-0">
                              <Plus className="w-3 h-3 text-[#007AFF] stroke-[2.5]" />
                            </div>
                            <div className="flex-1 bg-white rounded-full px-2.5 py-1.5 flex items-center justify-between shadow-2xs border border-stone-200/70 text-stone-400 text-[10px]">
                              <span className="flex-1 text-stone-500 truncate text-left">
                                Type a message...
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0 text-stone-400">
                                <Smile className="w-3 h-3 text-stone-400" />
                                <Paperclip className="w-3 h-3 text-stone-400" />
                              </div>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-[#128C7E] flex items-center justify-center text-white shadow-2xs shrink-0">
                              <Mic className="w-3.5 h-3.5" />
                            </div>
                          </div>

                        </div>

                        {/* iPhone Home Indicator Swipe Bar */}
                        <div className="bg-[#EFEAE2] pb-1.5 pt-0.5 flex justify-center">
                          <div className="w-24 h-1 bg-stone-400/80 rounded-full" />
                        </div>

                      </div>
                    </div>
                  </div>
                </a>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementPopup;
