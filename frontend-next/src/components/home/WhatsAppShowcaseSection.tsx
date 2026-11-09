"use client";

import React from "react";
import {
  MessageCircle,
  Sparkles,
  Camera,
  TrendingUp,
  ArrowRight,
  CheckCheck,
  ShieldCheck,
  Mic,
  Stethoscope,
  Wifi,
  Battery,
  Paperclip,
  Smile,
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { getWhatsAppBusinessUrl } from "@/components/announcement/AnnouncementPopup";

export function WhatsAppShowcaseSection() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";
  const isKn = lang === "kn";

  const prefilledMessage = isHi
    ? "नमस्ते KisaanBuddy! मुझे मेरी फसल और मंडी भाव के बारे में सलाह चाहिए।"
    : isKn
    ? "ನಮಸ್ಕಾರ KisaanBuddy! ನನಗೆ ಬೆಳೆ ಮತ್ತು ಮಂಡಿ ದರಗಳ ಕುರಿತು ಮಾಹಿತಿ ಬೇಕು."
    : "Hello KisaanBuddy! I need agricultural advice for my crop and mandi prices.";

  const { url: whatsappUrl } = getWhatsAppBusinessUrl(prefilledMessage);

  return (
    <section
      aria-label="KisaanBuddy on WhatsApp"
      className="relative w-full rounded-3xl bg-white dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-10 lg:p-14 shadow-sm overflow-hidden"
    >
      {/* Subtle background ambient glow (SaaS style - minimal, not overwhelming) */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 bg-[#25D366]/[0.06] dark:bg-[#25D366]/[0.03] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        {/* =========================================================
            LEFT SIDE: CONTENT & VALUE PROPOSITION
            ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 sm:space-y-7 text-left">
          {/* Small Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/20 text-emerald-900 dark:text-emerald-300 text-xs font-bold tracking-wider uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>
              {isHi
                ? "व्हाट्सएप पर 24/7 उपलब्ध"
                : isKn
                ? "WhatsApp ನಲ್ಲಿ 24/7 ಲಭ್ಯ"
                : "AVAILABLE 24/7 ON WHATSAPP"}
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.15]">
              {isHi ? (
                <>
                  आपका निजी कृषि सहायक। <br />
                  अब{" "}
                  <span className="bg-gradient-to-r from-[#128C7E] via-[#25D366] to-emerald-600 bg-clip-text text-transparent">
                    WhatsApp
                  </span>{" "}
                  पर भी।
                </>
              ) : isKn ? (
                <>
                  ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. <br />
                  ಈಗ{" "}
                  <span className="bg-gradient-to-r from-[#128C7E] via-[#25D366] to-emerald-600 bg-clip-text text-transparent">
                    WhatsApp
                  </span>{" "}
                  ನಲ್ಲಿ.
                </>
              ) : (
                <>
                  Your Farming Assistant. <br />
                  Now on{" "}
                  <span className="bg-gradient-to-r from-[#128C7E] via-[#25D366] to-emerald-600 bg-clip-text text-transparent">
                    WhatsApp
                  </span>
                  .
                </>
              )}
            </h2>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-normal leading-relaxed max-w-xl pt-1">
              {isHi
                ? "खेती की सटीक सलाह, फसल रोग पहचान, लाइव मंडी भाव और मौसम का हाल — सब कुछ सीधे WhatsApp पर पाएं। कोई अलग ऐप डाउनलोड करने की जरूरत नहीं।"
                : isKn
                ? "ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ, ಬೆಳೆ ರೋಗ ಮಾಹಿತಿ, ನೇರ ಮಂಡಿ ದರಗಳು ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ನೇರವಾಗಿ WhatsApp ಮೂಲಕ ಪಡೆಯಿರಿ."
                : "Get farming guidance, crop disease insights, live mandi prices and weather updates directly through WhatsApp. No separate app required."}
            </p>
          </div>

          {/* 3 Compact Benefit Points with Elegant Icons */}
          <div className="space-y-3.5 pt-1">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isHi ? "त्वरित AI कृषि मार्गदर्शन" : "Instant AI Farming Assistance"}
                </strong>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal">
                  {isHi
                    ? "अपनी भाषा में खाद, सिंचाई व फसल प्रबंधन के सवाल पूछें।"
                    : "Ask agronomy and crop management queries in your local language anytime."}
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isHi ? "फसल फोटो व वॉइस मैसेज भेजें" : "Send Crop Photos & Voice Notes"}
                </strong>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal">
                  {isHi
                    ? "बीमार पत्ती की फोटो खींचकर भेजें या बोलकर समस्या बताएं।"
                    : "Send photos of affected leaves or send voice notes describing the farm problem."}
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isHi ? "मंडी भाव व मौसम अलर्ट" : "Mandi Prices & Weather Updates"}
                </strong>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal">
                  {isHi
                    ? "नज़दीकी APMC मंडियों की ताज़ा दरें व बारिश-स्प्रे अलर्ट प्राप्त करें।"
                    : "Verified APMC mandi rates and hyperlocal spray safety advisory."}
                </p>
              </div>
            </div>
          </div>

          {/* CTA & Trust Indicator */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(37,211,102,0.32)] hover:shadow-[0_6px_22px_rgba(37,211,102,0.45)] transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              >
                {/* Official WhatsApp SVG Icon */}
                <svg
                  className="w-5 h-5 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>
                  {isHi
                    ? "व्हाट्सएप पर चैट शुरू करें →"
                    : isKn
                    ? "WhatsApp ನಲ್ಲಿ ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ →"
                    : "Start Chat on WhatsApp →"}
                </span>
              </a>
            </div>

            {/* Small Trust Indicator */}
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {isHi
                  ? "सरल • तेज़ • 24/7 सक्रिय AI सेवा"
                  : isKn
                  ? "ಸರಳ • ವೇಗ • 24/7 ಲಭ್ಯ"
                  : "Simple • Fast • Available 24/7"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT SIDE: REFINED SMARTPHONE MOCKUP & FLOATING PILLS
            ========================================================= */}
        <div className="lg:col-span-5 xl:col-span-5 relative flex justify-center items-center py-6 sm:py-8 select-none">
          {/* Outer Mockup Container */}
          <div className="relative w-full max-w-[320px] sm:max-w-[340px]">
            {/* ── Floating Pill 1: Crop Diagnosis (Top-Left) ── */}
            <div className="absolute -top-3 -left-2 sm:-left-6 z-30 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
              <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <Stethoscope className="w-3 h-3" />
              </div>
              <span>{isHi ? "फसल रोग निदान" : "Crop Diagnosis"}</span>
            </div>

            {/* ── Floating Pill 2: Live Mandi Prices (Mid-Right) ── */}
            <div className="absolute top-[42%] -right-2 sm:-right-8 z-30 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
              <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-3 h-3" />
              </div>
              <span>{isHi ? "लाइव मंडी भाव" : "Live Mandi Prices"}</span>
            </div>

            {/* ── Floating Pill 3: Voice Assistance (Bottom-Left) ── */}
            <div className="absolute -bottom-3 -left-1 sm:-left-4 z-30 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-[#25D366] flex items-center justify-center">
                <Mic className="w-3 h-3" />
              </div>
              <span>{isHi ? "बोलकर पूछें" : "Voice Assistance"}</span>
            </div>

            {/* ── Smartphone Modern Frame (Realistic SaaS Proportions) ── */}
            <div className="relative rounded-[42px] p-[2.5px] bg-gradient-to-b from-stone-300 via-stone-200 to-stone-400 dark:from-stone-700 dark:via-stone-800 dark:to-stone-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22)]">
              {/* Inner bezel */}
              <div className="rounded-[40px] p-[5px] bg-stone-950">
                {/* Screen Canvas */}
                <div className="rounded-[35px] overflow-hidden bg-[#EFEAE2] dark:bg-[#0b141a] text-stone-900 dark:text-stone-100 flex flex-col justify-between shadow-inner">
                  {/* Status Bar with Dynamic Island */}
                  <div className="relative pt-2 px-5 pb-1 flex items-center justify-between text-[11px] font-semibold bg-[#075E54] text-white">
                    <span className="font-mono text-[10px]">9:41</span>
                    {/* Dynamic Island */}
                    <div className="w-16 h-3.5 bg-black rounded-full flex items-center justify-end px-1 gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#151515]" />
                      <div className="w-1 h-1 rounded-full bg-[#0d2847]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* WhatsApp App Header */}
                  <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between shadow-xs border-t border-[#065047]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 p-0.5 border border-white/30 flex items-center justify-center">
                        <img
                          src="/logo.webp"
                          alt="KisaanBuddy"
                          className="w-full h-full object-contain rounded-full"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="text-left leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs tracking-tight">KisaanBuddy</span>
                          <span className="w-3 h-3 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[7px] font-black">
                            ✓
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-100 font-normal">
                          Online • WhatsApp Service
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Authentic WhatsApp Chat Conversation Canvas */}
                  <div className="p-3.5 space-y-2.5 text-left text-[11px] bg-[#EFEAE2] dark:bg-[#0b141a] min-h-[260px] flex flex-col justify-center">
                    {/* Date Stamp */}
                    <div className="flex justify-center mb-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/90 dark:bg-stone-800/90 text-[10px] font-medium text-stone-600 dark:text-stone-300 shadow-2xs">
                        Today
                      </span>
                    </div>

                    {/* Message 1: Sent by Farmer (Right-aligned, #D9FDD3) */}
                    <div className="flex justify-end">
                      <div className="max-w-[86%] bg-[#D9FDD3] dark:bg-[#005c4b] p-2.5 rounded-2xl rounded-tr-xs shadow-xs text-stone-900 dark:text-stone-100">
                        <p className="text-[11.5px] leading-snug">
                          मेरी गेहूं की फसल में पत्तियां पीली हो रही हैं।
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[9px] text-stone-500 dark:text-stone-300">
                            10:14 AM
                          </span>
                          <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                        </div>
                      </div>
                    </div>

                    {/* Message 2: Response from KisaanBuddy (Left-aligned, White) */}
                    <div className="flex justify-start">
                      <div className="max-w-[88%] bg-white dark:bg-[#202c33] p-2.5 rounded-2xl rounded-tl-xs shadow-xs border border-stone-200/50 dark:border-stone-700/50 text-stone-900 dark:text-stone-100">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[10px] pb-0.5">
                          KisaanBuddy 🌱
                        </p>
                        <p className="text-[11.5px] leading-relaxed">
                          नमस्ते! कृपया फसल की पत्तियों की एक साफ फोटो भेजें। मैं समस्या पहचानने में आपकी मदद करूंगा।
                        </p>
                        <span className="block text-right text-[9px] text-stone-400 pt-1">
                          10:14 AM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Message Input Bar */}
                  <div className="bg-[#F0F2F5] dark:bg-[#1f2c34] p-2 flex items-center gap-1.5 border-t border-stone-200 dark:border-stone-800">
                    <div className="flex-1 bg-white dark:bg-stone-800 rounded-full py-1.5 px-3 flex items-center justify-between text-stone-400 text-xs shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <Smile className="w-3.5 h-3.5" />
                        <span className="text-[10px] text-stone-400">
                          {isHi ? "संदेश लिखें..." : "Type a message..."}
                        </span>
                      </div>
                      <Paperclip className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-xs">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
