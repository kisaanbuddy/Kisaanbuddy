'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Store, Users, CheckCircle2, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';

export function MarketplaceHero() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).hero;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 border-b border-stone-200/80 dark:border-stone-800">
      {/* Background subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle & Primary Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Category Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-600/20 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-emerald-950 dark:text-white tracking-tight leading-[1.12]">
              {t.title}
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {t.subtitle}
            </p>

            {/* 3 Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              {/* Primary 1: Mandi Prices */}
              <Link
                href="/mandi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm hover:shadow transition-all group"
              >
                <TrendingUp className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                <span>{t.ctaMandi}</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-80 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Primary 2: Sell Your Produce */}
              <Link
                href="/marketplace?action=sell"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all group"
              >
                <Store className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
                <span>{t.ctaSell}</span>
              </Link>

              {/* Primary 3: Find Buyers */}
              <Link
                href="/marketplace?tab=buyers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-sm border border-stone-300 dark:border-stone-700 shadow-2xs transition-all"
              >
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.ctaBuyers}</span>
              </Link>
            </div>

            {/* Verified Public Integrity Checkmarks */}
            <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-semibold text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.trustPoint1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.trustPoint2}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.trustPoint3}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Authentic Agricultural Photography & Live Marketplace Signal */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl bg-white dark:bg-stone-900">
              <img
                src="/images/hero/hero-indian-farmer.jpg"
                alt="Indian farmer in wheat field examining produce"
                className="w-full h-[340px] sm:h-[400px] object-cover object-center transform hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* In-Photo Live APMC Market Context Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-md">
                <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-white pb-1.5 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>e-NAM Wholesale Trading</span>
                  </div>
                  <span className="text-[11px] font-medium text-stone-500">Official Daily Mandi Data</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-800/60">
                    <span className="text-[10px] text-stone-500 block">Wheat (Indore)</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">₹2,275/q</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-800/60">
                    <span className="text-[10px] text-stone-500 block">Basmati (Karnal)</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">₹3,850/q</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-800/60">
                    <span className="text-[10px] text-stone-500 block">Soybean (Ujjain)</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">₹4,600/q</span>
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
