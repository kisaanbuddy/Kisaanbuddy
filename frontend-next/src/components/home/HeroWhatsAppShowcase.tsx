"use client";

import React from "react";
import { MessageCircle, Sparkles, ShieldCheck, ArrowRight, PhoneCall } from "lucide-react";
import { useLanguage, type Lang } from "@/lib/language";
import { HOME_I18N } from "@/lib/homepage-i18n";

export function HeroWhatsAppShowcase() {
  const { lang } = useLanguage();
  const dict = HOME_I18N[lang as Lang] || HOME_I18N.hi;
  const isHi = lang === "hi";

  const whatsappMessage = isHi
    ? "नमस्ते KisaanBuddy! मुझे मेरी फसल और मंडी भाव के बारे में सलाह चाहिए।"
    : "Hello KisaanBuddy! I need advice regarding my crop and live mandi rates.";

  const whatsappUrl = `https://wa.me/919429693427?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-br from-emerald-500/[0.08] via-white to-teal-500/[0.06] dark:from-emerald-950/50 dark:via-stone-900 dark:to-teal-950/30 border-2 border-emerald-600/30 dark:border-emerald-500/30 shadow-[0_20px_50px_rgba(20,83,45,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 sm:p-6 text-center flex flex-col items-center justify-between transition-all overflow-hidden">
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
      <div className="relative z-10 w-full space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 dark:bg-[#25D366]/20 border border-[#25D366]/30 text-emerald-950 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>{isHi ? "24/7 AI व्हाट्सएप साथी" : "24/7 AI WhatsApp Companion"}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          {isHi ? (
            <>
              KisaanBuddy <span className="text-[#25D366]">WhatsApp</span> पर भी!
            </>
          ) : (
            <>
              KisaanBuddy on <span className="text-[#25D366]">WhatsApp</span> Too!
            </>
          )}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
          {isHi
            ? "पत्ती की फोटो भेजें या बोलकर पूछें — रोग निदान, आज का मंडी भाव व मौसम सलाह सीधे अपने व्हाट्सएप पर।"
            : "Send crop leaf photos or voice notes — get instant diagnosis, mandi rates & weather advisory directly on WhatsApp."}
        </p>
      </div>

      {/* Smartphone Mockup Image with Authentic Shadow & Elevation */}
      <div className="relative z-10 my-4 sm:my-5 flex justify-center w-full">
        <div className="relative w-[210px] sm:w-[230px] md:w-[250px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-white dark:bg-stone-900 hover:scale-105 transition-transform duration-300">
          <img
            src="/images/whatsapp-phone-mockup.jpg"
            alt="KisaanBuddy WhatsApp and Voice Interface on Smartphone"
            className="w-full h-auto object-contain"
            loading="eager"
          />
        </div>
      </div>

      {/* Direct WhatsApp Call-to-Action Bar */}
      <div className="relative z-10 w-full space-y-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#25D366]/25 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>{isHi ? "व्हाट्सएप पर चैट शुरू करें →" : "Chat on WhatsApp Now →"}</span>
        </a>

        {/* Provenance and Helpline Assurance Footer */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-stone-500 dark:text-stone-400 font-medium pt-1">
          <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
            <PhoneCall className="w-3 h-3 text-[#25D366]" />
            <span>+91 94296 93427</span>
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
