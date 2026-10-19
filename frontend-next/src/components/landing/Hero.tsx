'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Sprout, Layers, FlaskConical, Calendar, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function Hero() {
  const { lang } = useLanguage();
  const isKn = lang === 'kn';
  const isHi = lang === 'hi';

  return (
    <section className="relative isolate overflow-hidden bg-[#F8FAF7] dark:bg-background border-b border-[#E2E8E2] dark:border-slate-800 pb-12 pt-8 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column: Heading, Copy, Actions, Benefits */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#14532D] dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#16845B]" />
              <span>
                {isKn
                  ? 'ಭಾರತದ ರೈತರಿಗಾಗಿ AI ಕೃಷಿ ಒಡನಾಡಿ'
                  : isHi
                  ? 'भारत के किसानों के लिए AI खेती साथी'
                  : 'YOUR AI-POWERED FARMING COMPANION'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-[#17231B] dark:text-white sm:text-5xl lg:text-[3.5rem] leading-[1.08]">
              {isKn ? (
                <>
                  ನಿಮ್ಮ ಜಮೀನನ್ನು ತಿಳಿಯಿರಿ.<br />
                  <span className="text-[#14532D] dark:text-emerald-400">ಉತ್ತಮ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.</span>
                </>
              ) : isHi ? (
                <>
                  अपना खेत समझें।<br />
                  <span className="text-[#14532D] dark:text-emerald-400">बेहतर फैसले लें।</span>
                </>
              ) : (
                <>
                  Know Your Farm.<br />
                  <span className="text-[#14532D] dark:text-emerald-400">Make Better Decisions.</span>
                </>
              )}
            </h1>

            {/* Supporting Copy */}
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#647067] dark:text-slate-300 sm:text-lg">
              {isKn
                ? 'ನಿಮ್ಮ ಕೃಷಿ ಡೇಟಾ, ವೈಯಕ್ತಿಕ AI ಮಾರ್ಗದರ್ಶನ, ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ದರಗಳು — ಎಲ್ಲವೂ ಒಂದೇ ಸೂರಿನಡಿ.'
                : isHi
                ? 'आपके खेत का डेटा, व्यक्तिगत AI मार्गदर्शन, स्थानीय मौसम और बाज़ार भाव—सब एक ही जगह।'
                : 'Your farm data, personalized AI guidance, local weather, and market insights—all in one place.'}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#14532D] hover:bg-[#166534] px-7 text-sm font-bold text-white shadow-sm transition active:scale-95"
              >
                <span>{isKn ? 'ನನ್ನ ಜಮೀನು ಹೊಂದಿಸಿ' : isHi ? 'अपना खेत सेटअप करें' : 'Set Up My Farm'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/features"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E2E8E2] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 text-sm font-bold text-[#17231B] dark:text-white transition"
              >
                <Sprout className="h-4 w-4 text-[#16845B]" />
                <span>{isKn ? 'ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : isHi ? 'सुविधाएं देखें' : 'Explore Features'}</span>
              </Link>
            </div>

            {/* 3 Concise Real Benefits */}
            <div className="mt-8 pt-6 border-t border-[#E2E8E2] dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-semibold text-[#17231B] dark:text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0" />
                <span>{isKn ? 'ವೈಯಕ್ತಿಕ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ' : isHi ? 'व्यक्तिगत खेत मार्गदर्शन' : 'Personalized farm guidance'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0" />
                <span>{isKn ? 'ಕನ್ನಡ ಸೇರಿ 10+ ಭಾರತೀಯ ಭಾಷೆಗಳು' : isHi ? '10+ भारतीय भाषाओं में समर्थन' : 'Support for Indian languages'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0" />
                <span>{isKn ? 'ಬೆಳೆ ಮತ್ತು ಮಂಡಿ ಮಾಹಿತಿ' : isHi ? 'फसल और मंडी अंतर्दृष्टि' : 'Crop and market insights'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Indian Farmer Photography + Real Interface Demonstration */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Authentic Photograph */}
            <div className="relative overflow-hidden rounded-2xl border border-[#E2E8E2] dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <img
                src="/images/hero/hero-indian-farmer.jpg"
                alt="Authentic Indian farmer inspecting standing crop in agricultural field"
                className="h-64 sm:h-72 w-full object-cover object-center"
              />
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-[#647067] dark:text-slate-400">
                <span className="font-semibold text-[#17231B] dark:text-slate-200">
                  {isKn ? 'ನೈಜ ಕೃಷಿ ಸಂದರ್ಭ' : isHi ? 'खेत का वास्तविक संदर्भ' : 'Real-World Farm Context'}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isKn ? 'ದೃಢೀಕೃತ ಕೃಷಿ ಸಲಹೆ' : isHi ? 'सत्यापित सलाह' : 'Verified Agronomy'}
                </span>
              </div>
            </div>

            {/* Real KisaanBuddy Product Interface Demonstration */}
            <div className="rounded-2xl border border-[#E2E8E2] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#17231B] dark:text-white">
                    {isKn ? 'ರೈತರ ಪ್ರೊಫೈಲ್ · ಜಮೀನು ನಿರ್ವಹಣೆ' : isHi ? 'किसान प्रोफाइल और सक्रिय फसल' : 'Farmer Profile · Plot Management'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {isKn ? 'ಸಕ್ರಿಯ ಜಮೀನು' : isHi ? 'सक्रिय चक्र' : 'Active Plot'}
                </span>
              </div>

              {/* Data Rows representing real database models */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#647067] dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#16845B]" />
                    {isKn ? 'ಜಮೀನು / ವಿಸ್ತೀರ್ಣ:' : isHi ? 'खेत / रकबा:' : 'Plot Acreage:'}
                  </span>
                  <span className="font-bold text-[#17231B] dark:text-white">
                    {isKn ? 'ಜಮೀನು #1 · 2.5 ಎಕರೆ (ಗೋಧಿ)' : isHi ? 'खेत #1 · 2.5 एकड़ (गेहूं)' : 'Plot #1 · 2.5 Acres (Wheat)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#647067] dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#16845B]" />
                    {isKn ? 'ಬೆಳೆಯ ಹಂತ:' : isHi ? 'फसल अवस्था:' : 'Growth Stage:'}
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {isKn ? 'ಸಕ್ರಿಯ ಸಸ್ಯಕ ಹಂತ (ದಿನ 38)' : isHi ? 'सक्रिय वनस्पति अवस्था (दिन 38)' : 'Active Vegetative (Day 38)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#647067] dark:text-slate-400 flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5 text-[#16845B]" />
                    {isKn ? 'ಮಣ್ಣಿನ ಸ್ಥಿತಿ:' : isHi ? 'मिट्टी स्थिति:' : 'Soil Baseline:'}
                  </span>
                  <span className="font-medium text-[#17231B] dark:text-white">
                    {isKn ? 'ಗೋಡು ಮಣ್ಣು · pH 6.8 · NPK ಸೂಕ್ತ' : isHi ? 'दोमट · pH 6.8 · NPK अनुकूल' : 'Loamy · pH 6.8 · NPK Optimal'}
                  </span>
                </div>
              </div>

              {/* AI Guidance Recommendation Box */}
              <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#16845B]" />
                  <span>{isKn ? 'AI ಜಮೀನು-ನಿರ್ದಿಷ್ಟ ಸಲಹೆ:' : isHi ? 'खेत-विशिष्ट AI सलाह:' : 'AI Plot-Specific Action:'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-950/80 dark:text-emerald-100/80">
                  {isKn
                    ? 'ಹೂಬಿಡುವ ಮುನ್ನ 48 ಗಂಟೆಗಳ ಒಳಗೆ ಲಘು ನೀರಾವರಿ ಒದಗಿಸಿ. ಕಾಲೋಚಿತ ತೇವಾಂಶದಿಂದಾಗಿ ಹಳದಿ ತುಕ್ಕು (Yellow Rust) ರೋಗಲಕ್ಷಣಗಳಿಗಾಗಿ ಎಲೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.'
                    : isHi
                    ? 'फूल आने से पहले 48 घंटे के भीतर हल्की सिंचाई करें। मौसम की नमी के अनुसार पीला रतुआ (Yellow Rust) की नियमित निगरानी रखें।'
                    : 'Schedule light irrigation within 48h before flowering. Monitor foliage for yellow rust symptoms given seasonal humidity.'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
