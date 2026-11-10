"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  CheckCheck,
  Wifi,
  Battery,
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { getWhatsAppBusinessUrl } from "@/components/announcement/AnnouncementPopup";

export function HeroWhatsAppShowcase() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";
  
  const WHATSAPP_I18N: Record<string, {
    badge: string;
    titlePrefix: string;
    titleSuffix: string;
    subtitle: string;
    farmerMsg: string;
    botMsg: string;
    ctaBtn: string;
    sampleMsg: string;
  }> = {
    hi: {
      badge: "24/7 AI व्हाट्सएप साथी",
      titlePrefix: "KisaanBuddy",
      titleSuffix: "पर भी!",
      subtitle: "पत्ती की फोटो भेजें या बोलकर पूछें — रोग निदान, आज का मंडी भाव व मौसम सलाह सीधे WhatsApp पर पाएं।",
      farmerMsg: "मेरी गेहूं की फसल में पत्तियां पीली हो रही हैं।",
      botMsg: "नमस्ते! कृपया फसल की पत्तियों की एक साफ फोटो भेजें। मैं समस्या पहचानने में आपकी मदद करूंगा।",
      ctaBtn: "व्हाट्सएप पर चैट शुरू करें →",
      sampleMsg: "नमस्ते KisaanBuddy! मुझे मेरी फसल और मंडी भाव के बारे में सलाह चाहिए।",
    },
    kn: {
      badge: "24/7 AI ವಾಟ್ಸಾಪ್ ಸಹಾಯಕ",
      titlePrefix: "ಕಿಸಾನ್‌ಬಡ್ಡಿ",
      titleSuffix: "ನಲ್ಲೂ ಲಭ್ಯ!",
      subtitle: "ಎಲೆಯ ಫೋಟೋ ಕಳುಹಿಸಿ ಅಥವಾ ಧ್ವನಿ ಸಂದೇಶ ಕಳುಹಿಸಿ — ರೋಗ ಪತ್ತೆ, ಮಂಡಿ ದರ ಮತ್ತು ಹವಾಮಾನ ಸಲಹೆ ವಾಟ್ಸಾಪ್‌ನಲ್ಲೇ ಪಡೆಯಿರಿ.",
      farmerMsg: "ನನ್ನ ಗೋಧಿ ಬೆಳೆಯಲ್ಲಿ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ.",
      botMsg: "ನಮಸ್ಕಾರ! ದಯವಿಟ್ಟು ಬೆಳೆಯ ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಕಳುಹಿಸಿ. ರೋಗ ಪತ್ತೆಹಚ್ಚಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
      ctaBtn: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ →",
      sampleMsg: "ನಮಸ್ಕಾರ ಕಿಸಾನ್‌ಬಡ್ಡಿ! ನನ್ನ ಬೆಳೆ ಮತ್ತು ಮಂಡಿ ದರದ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕು.",
    },
    te: {
      badge: "24/7 AI వాట్సాప్ సహాయకుడు",
      titlePrefix: "కిసాన్‌బడ్డీ",
      titleSuffix: "లో కూడా!",
      subtitle: "ఆకుల ఫోటో పంపండి లేదా మాట్లాడి అడగండి — తెగులు నిర్ధారణ, మార్కెట్ ధరలు మరియు వాతావరణ సలహాలు వాట్సాప్‌లో పొందండి.",
      farmerMsg: "నా గోధుమ పంటలో ఆకులు పసుపు రంగులోకి మారుతున్నాయి.",
      botMsg: "నమస్కారం! దయచేసి పంట ఆకుల స్పష్టమైన ఫోటో పంపండి. సమస్యను గుర్తించడంలో మీకు సహాయం చేస్తాను.",
      ctaBtn: "వాట్సాప్‌లో చాట్ ప్రారంభించండి →",
      sampleMsg: "నమస్కారం కిసాన్‌బడ్డీ! నా పంట మరియు మార్కెట్ ధరల గురించి సలహా కావాలి.",
    },
    ta: {
      badge: "24/7 AI வாட்ஸ்அப் தோழன்",
      titlePrefix: "கிசான்பட்டி",
      titleSuffix: "விலும் உண்டு!",
      subtitle: "இலை புகைப்படத்தை அனுப்புங்கள் அல்லது குரல் செய்தி அனுப்புங்கள் — நோய் கண்டறிதல், மண்டி விலைகள் வாட்ஸ்அப்பில் பெறுங்கள்.",
      farmerMsg: "என் கோதுமை பயிரில் இலைகள் மஞ்சளாக மாறுகின்றன.",
      botMsg: "வணக்கம்! பயிர் இலையின் தெளிவான புகைப்படத்தை அனுப்பவும். நோய் கண்டறிய உதவுகிறேன்.",
      ctaBtn: "வாட்ஸ்அப்பில் உரையாடுங்கள் →",
      sampleMsg: "வணக்கம் கிசான்பட்டி! எனது பயிர் மற்றும் மண்டி விலைகள் குறித்து ஆலோசனை வேண்டும்.",
    },
    mr: {
      badge: "24/7 AI व्हॉट्सॲप साथी",
      titlePrefix: "किसानबडी",
      titleSuffix: "वर देखील!",
      subtitle: "पानाचा फोटो पाठवा किंवा बोलून विचारा — रोग निदान, आजचे बाजार भाव आणि हवामान सल्ला थेट WhatsApp वर मिळवा.",
      farmerMsg: "माझ्या गव्हाच्या पिकावर पाने पिवळी पडत आहेत.",
      botMsg: "नमस्कार! कृपया पिकाच्या पानाचा स्पष्ट फोटो पाठवा. समस्या ओळखण्यात मी मदत करेन.",
      ctaBtn: "व्हॉट्सॲपवर चॅट सुरू करा →",
      sampleMsg: "नमस्कार किसानबडी! मला माझ्या पिकाबद्दल आणि बाजारभावाबद्दल सल्ला हवा आहे.",
    },
    en: {
      badge: "24/7 AI WhatsApp Companion",
      titlePrefix: "KisaanBuddy on",
      titleSuffix: "Too!",
      subtitle: "Send crop leaf photos or voice notes — get instant diagnosis, mandi rates & weather advisory directly on WhatsApp.",
      farmerMsg: "Yellowing leaves observed in my wheat crop.",
      botMsg: "Hello! Please send a clear photo of the crop leaves. I will assist you in identifying the issue.",
      ctaBtn: "Chat on WhatsApp Now →",
      sampleMsg: "Hello KisaanBuddy! I need advice regarding my crop and live mandi rates.",
    },
  };

  const wDict = WHATSAPP_I18N[lang] || WHATSAPP_I18N.hi;

  const { url: whatsappUrl } = getWhatsAppBusinessUrl(wDict.sampleMsg);

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-br from-emerald-500/[0.08] via-white to-teal-500/[0.06] dark:from-emerald-950/50 dark:via-stone-900 dark:to-teal-950/30 border-2 border-emerald-600/30 dark:border-emerald-500/30 shadow-[0_20px_50px_rgba(20,83,45,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 sm:p-5 text-center flex flex-col items-center justify-between transition-all overflow-hidden">
      {/* Decorative ambient radial glows */}
      <div
        className="absolute -top-14 -right-14 w-48 h-48 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-14 -left-14 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header Badge & Title */}
      <div className="relative z-10 w-full space-y-1.5 mb-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 dark:bg-[#25D366]/20 border border-[#25D366]/30 text-emerald-950 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>{wDict.badge}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          {wDict.titlePrefix} <span className="text-[#25D366]">WhatsApp</span> {wDict.titleSuffix}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
          {wDict.subtitle}
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODERN IPHONE / FLAGSHIP SMARTPHONE UI MOCKUP
      ───────────────────────────────────────────────────────────── */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={wDict.ctaBtn}
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="group relative z-10 my-2 sm:my-3 block w-[290px] sm:w-[315px] md:w-[325px] lg:w-[335px] xl:w-[345px] cursor-pointer will-change-transform"
      >
        {/* Outer Phone Border & Realistic Metallic Ring */}
        <div className="relative rounded-[46px] p-[3px] bg-gradient-to-b from-stone-400 via-stone-300 to-stone-500 dark:from-stone-600 dark:via-stone-700 dark:to-stone-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.4)] group-hover:shadow-[0_30px_70px_-15px_rgba(37,211,102,0.3)] group-hover:scale-[1.02] transition-all duration-300">
          {/* Inner Matte Bezel */}
          <div className="rounded-[43px] p-[7px] bg-stone-950">
            {/* Screen Glass */}
            <div className="relative rounded-[36px] overflow-hidden bg-[#EFEAE2] dark:bg-[#0b141a] text-stone-900 dark:text-stone-100 flex flex-col justify-between shadow-inner">
              
              {/* iPhone Status Bar with Dynamic Island */}
              <div className="relative pt-2 px-5 pb-1 flex items-center justify-between text-[11px] font-semibold bg-[#075E54] text-white">
                <span className="font-mono text-[10px]">9:41</span>
                {/* Dynamic Island Pill */}
                <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-1.5 gap-1 shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#151515] border border-stone-800" />
                  <div className="w-1 h-1 rounded-full bg-[#0d2847]" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* WhatsApp App Top Bar */}
              <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between shadow-sm border-t border-[#065047]">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 text-white" />
                  <div className="relative w-8 h-8 rounded-full bg-white/20 p-0.5 flex items-center justify-center shrink-0">
                    <img
                      src="/logo.webp"
                      alt="KisaanBuddy"
                      className="w-full h-full object-contain rounded-full"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] border-2 border-[#075E54] rounded-full" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-xs font-bold text-white">KisaanBuddy</span>
                      <span className="w-3 h-3 rounded-full bg-[#25D366] text-stone-950 flex items-center justify-center text-[7px] font-black">
                        ✓
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-200 leading-none">
                      Online • WhatsApp Service
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Video className="w-4 h-4" />
                  <Phone className="w-3.5 h-3.5" />
                  <MoreVertical className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* WhatsApp Chat Canvas */}
              <div className="p-3 space-y-2 text-left text-[11px] bg-[#EFEAE2] dark:bg-[#0b141a] min-h-[265px] relative">
                {/* Date Pill */}
                <div className="flex justify-center mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/85 dark:bg-stone-800/80 text-[10px] font-medium text-stone-600 dark:text-stone-300 shadow-2xs">
                    UI Preview • WhatsApp
                  </span>
                </div>

                {/* Message 1: Outgoing from Farmer */}
                <div className="flex justify-end">
                  <div className="max-w-[86%] bg-[#D9FDD3] dark:bg-[#005c4b] p-2.5 rounded-2xl rounded-tr-xs shadow-xs text-stone-900 dark:text-stone-100">
                    <p className="text-[11.5px] leading-snug">
                      {wDict.farmerMsg}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-[9px] text-stone-500 dark:text-stone-300">
                        10:14 AM
                      </span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                    </div>
                  </div>
                </div>

                {/* Message 2: Incoming from KisaanBuddy */}
                <div className="flex justify-start">
                  <div className="max-w-[88%] bg-white dark:bg-[#202c33] p-2.5 rounded-2xl rounded-tl-xs shadow-xs border border-stone-200/50 dark:border-stone-700/50 space-y-1">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[10px]">
                      KisaanBuddy 🌱
                    </p>
                    <p className="text-stone-900 dark:text-stone-100 text-[11.5px] leading-relaxed">
                      {wDict.botMsg}
                    </p>
                    <span className="block text-right text-[9px] text-stone-400 pt-0.5">
                      10:14 AM
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Bottom Chat Input Bar */}
              <div className="bg-[#F0F2F5] dark:bg-[#1f2c34] p-2 flex items-center gap-1.5 border-t border-stone-200 dark:border-stone-800">
                <div className="flex-1 bg-white dark:bg-stone-800 rounded-full py-1 px-3 flex items-center justify-between text-stone-400 text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[10px] text-stone-500">
                      Type a message...
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Paperclip className="w-3 h-3" />
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Mic className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* iPhone Home Indicator Swipe Bar */}
              <div className="bg-[#F0F2F5] dark:bg-[#1f2c34] pb-1 pt-0.5 flex justify-center">
                <div className="w-24 h-1 bg-stone-400 dark:bg-stone-600 rounded-full" />
              </div>

            </div>
          </div>
        </div>
      </motion.a>

      {/* Direct WhatsApp Action Button */}
      <div className="relative z-10 w-full space-y-2 mt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#25D366]/25 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>{wDict.ctaBtn}</span>
        </a>

        {/* Provenance and Helpline Assurance Footer - Zero Phone Numbers */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-stone-500 dark:text-stone-400 font-medium pt-1">
          <span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
            <span>{isHi ? "24/7 सक्रिय AI सेवा" : "24/7 Active AI Service"}</span>
          </span>
          <span>•</span>
          <span>{isHi ? "100% निःशुल्क" : "100% Free"}</span>
          <span>•</span>
          <span>{isHi ? "हिंदी, कन्नड़ व अंग्रेजी" : "Hindi, Kannada & English"}</span>
        </div>
      </div>
    </div>
  );
}
