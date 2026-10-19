'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  TrendingUp, 
  Store, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building2, 
  Sprout, 
  Radio,
  ChevronRight,
  Shield,
  Zap,
  CloudSun,
  Flame,
  BadgeCheck
} from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';

export function MarketplaceHero() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).hero;
  const [activeTab, setActiveTab] = useState<'rates' | 'buyers' | 'workers' | 'advisory'>('rates');

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

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-3.5 pt-2">
              {/* Primary 1: Mandi Prices */}
              <Link
                href="/mandi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm hover:shadow transition-all group"
              >
                <TrendingUp className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                <span>{t.ctaMandi}</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-80 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Primary 2: Sell Your Produce */}
              <Link
                href="/marketplace?action=sell"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all group"
              >
                <Store className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
                <span>{t.ctaSell}</span>
              </Link>

              {/* Primary 3: Find Buyers */}
              <Link
                href="/marketplace?tab=buyers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-sm border border-stone-300 dark:border-stone-700 shadow-2xs transition-all"
              >
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.ctaBuyers}</span>
              </Link>

              {/* Primary 4: Worker Connect & Jobs */}
              <Link
                href="/worker-connect"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold text-sm border border-emerald-300 dark:border-emerald-700 shadow-2xs hover:shadow transition-all group"
              >
                <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{t.ctaWorkers}</span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                  Live
                </span>
              </Link>
            </div>

            {/* High-visibility Workers Connect Promotion Card in Hero */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-stone-900/90 border border-emerald-500/30 dark:border-emerald-700/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-white">
                      Farm Workers & Harvester Crews
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20">
                      Workers Connect
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300">
                    Connect verified harvesting gangs, combine operators, or find daily agricultural jobs across India.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Link
                  href="/worker-connect?tab=find_workers"
                  className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs"
                >
                  Hire Workers
                </Link>
                <Link
                  href="/worker-connect?tab=find_jobs"
                  className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs"
                >
                  Find Farm Jobs
                </Link>
              </div>
            </div>

            {/* Verified Public Integrity Checkmarks */}
            <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-semibold text-stone-600 dark:text-stone-400">
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
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.trustPointWorkers}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Modern Interactive Market & Farm Intelligence Desk */}
          <div className="lg:col-span-5 relative">
            
            {/* Ambient Background Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-amber-500/20 rounded-3xl blur-xl opacity-70 dark:opacity-40 pointer-events-none" />

            {/* Top Floating Trust Badge */}
            <div className="hidden sm:inline-flex items-center gap-2 absolute -top-3.5 right-6 z-20 px-3 py-1 rounded-full bg-white dark:bg-stone-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>0% Middleman Fee • Direct Payment</span>
            </div>

            {/* Main Interactive Terminal Card */}
            <div className="relative rounded-3xl overflow-hidden border border-emerald-900/10 dark:border-stone-700/80 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-2xl transition-all">
              
              {/* Header: Live APMC Status & Real-time Indicator */}
              <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                      <span>e-NAM & APMC Live Desk</span>
                    </h3>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Direct mandi benchmarks</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>LIVE FEED</span>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="grid grid-cols-4 p-1.5 bg-stone-100/70 dark:bg-stone-800/60 border-b border-stone-200/60 dark:border-stone-800 text-[11px] sm:text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('rates')}
                  className={`py-2 px-1 rounded-xl text-center transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'rates'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Mandi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('buyers')}
                  className={`py-2 px-1 rounded-xl text-center transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'buyers'
                      ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Buyers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('workers')}
                  className={`py-2 px-1 rounded-xl text-center transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'workers'
                      ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs ring-1 ring-emerald-500/30'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-semibold">Labour</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('advisory')}
                  className={`py-2 px-1 rounded-xl text-center transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'advisory'
                      ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-400 font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Advisory</span>
                </button>
              </div>

              {/* Tab 1 Content: Mandi Rates */}
              {activeTab === 'rates' && (
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-1 font-medium">
                    <span>Commodity & Mandi</span>
                    <span>Rate / Quintal</span>
                  </div>

                  {/* Crop 1: Wheat */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">Wheat (Sharbati)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">Indore Mandi</span>
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">Modal Arrival: 450 Qtl</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-stone-900 dark:text-white">₹2,420<span className="text-[11px] font-normal text-stone-500">/q</span></div>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight className="w-3 h-3" /> +3.8%
                      </span>
                    </div>
                  </div>

                  {/* Crop 2: Basmati Rice */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">Basmati 1121</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-medium">Karnal Mandi</span>
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">Modal Arrival: 820 Qtl</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-stone-900 dark:text-white">₹3,950<span className="text-[11px] font-normal text-stone-500">/q</span></div>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight className="w-3 h-3" /> +2.4%
                      </span>
                    </div>
                  </div>

                  {/* Crop 3: Soybean */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">Soybean (Yellow)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium">Ujjain Mandi</span>
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">Modal Arrival: 320 Qtl</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-stone-900 dark:text-white">₹4,680<span className="text-[11px] font-normal text-stone-500">/q</span></div>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <ArrowDownRight className="w-3 h-3" /> -0.6%
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <Link
                    href="/mandi"
                    className="w-full mt-1 py-2.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Track All 1,200+ Live APMC Mandis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Tab 2 Content: Active Buyers */}
              {activeTab === 'buyers' && (
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-1 font-medium">
                    <span>Verified Buyer Requirements</span>
                    <span>Target Price</span>
                  </div>

                  {/* Buyer 1 */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">MP Agro Processing Mills</span>
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                        Looking for: <span className="font-semibold text-emerald-700 dark:text-emerald-400">300 Qtl Sharbati Wheat</span>
                      </div>
                      <span className="text-[10px] text-stone-500">Indore, MP • Instant RTGS Payment</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-400">₹2,450/q</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">Ready to buy</span>
                    </div>
                  </div>

                  {/* Buyer 2 */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">Karnal Grain Exporters</span>
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                        Looking for: <span className="font-semibold text-emerald-700 dark:text-emerald-400">150 Qtl Basmati 1121</span>
                      </div>
                      <span className="text-[10px] text-stone-500">Karnal, HR • Farm-gate Pickup</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-400">₹4,050/q</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">Ready to buy</span>
                    </div>
                  </div>

                  {/* Buyer 3 */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">Shree Sai Edible Oils</span>
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                        Looking for: <span className="font-semibold text-emerald-700 dark:text-emerald-400">500 Qtl Soybean</span>
                      </div>
                      <span className="text-[10px] text-stone-500">Ujjain, MP • Direct Yard Weighing</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-400">₹4,720/q</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">Ready to buy</span>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <Link
                    href="/marketplace?tab=buyers"
                    className="w-full mt-1 py-2.5 px-3 rounded-xl bg-amber-600/10 hover:bg-amber-600/20 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Connect with 450+ Verified Institutional Buyers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Tab 3 Content: Workers Connect */}
              {activeTab === 'workers' && (
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-1 font-medium">
                    <span>Labour Collective / Farm Job</span>
                    <span>Wage Benchmark</span>
                  </div>

                  {/* Collective 1 */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">Dummawad Horticulture FPO</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">Verified FPO</span>
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                        Paddy Harvester & 45HP Rotavator (18 Workers)
                      </div>
                      <span className="text-[10px] text-stone-500">Dharwad, Karnataka • SFAC Registered CHC</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-300">₹450/day</div>
                      <span className="text-[10px] text-stone-400">Labour Bureau</span>
                    </div>
                  </div>

                  {/* Collective 2 */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">Jagraon Harvester Wing</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">Combine Crew</span>
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                        Self-propelled Harvester & Laser Leveler (15 Workers)
                      </div>
                      <span className="text-[10px] text-stone-500">Ludhiana, Punjab • PAU Supported</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-300">₹510/day</div>
                      <span className="text-[10px] text-stone-400">Labour Bureau</span>
                    </div>
                  </div>

                  {/* Active Job 3 */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">Sugarcane Cutting & Trolley Loading</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">Job Open</span>
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                        8 Workers Needed for 6 Days • Daily Cash Payout
                      </div>
                      <span className="text-[10px] text-stone-500">Mandya, Karnataka • Transportation Provided</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-400">₹470/day</div>
                      <span className="text-[10px] text-stone-400">Evening Muster</span>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <Link
                    href="/worker-connect"
                    className="w-full mt-1 py-2.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Explore Worker Connect (50+ Verified Groups & Jobs)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Tab 4 Content: AI Advisory */}
              {activeTab === 'advisory' && (
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-1 font-medium">
                    <span>Farm Intelligence & Early Warnings</span>
                    <span>Status</span>
                  </div>

                  {/* Advisory 1 */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 border border-stone-200/60 dark:border-stone-800 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <CloudSun className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-stone-900 dark:text-white text-xs block">Optimal Sowing Window (Next 48 hrs)</span>
                          <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                            Soil moisture index at 68%. Ideal condition for wheat seed germination and basal fertilizer application.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">Favorable</span>
                    </div>
                  </div>

                  {/* Advisory 2 */}
                  <div className="p-3 rounded-2xl bg-stone-50/90 dark:bg-stone-800/50 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 border border-stone-200/60 dark:border-stone-800 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <Sprout className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-stone-900 dark:text-white text-xs block">AI Crop Doctor Leaf Scan</span>
                          <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                            Instant fungal and pest identification with organic & chemical treatment solutions.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold shrink-0">98% Accuracy</span>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <Link
                    href="/crop-doctor"
                    className="w-full mt-1 py-2.5 px-3 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 text-teal-900 dark:text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Launch AI Crop Doctor & Field Diagnosis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Bottom Card Footer */}
              <div className="px-5 py-3 bg-stone-100/60 dark:bg-stone-950/60 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Govt DMI & e-NAM Verified</span>
                </span>
                <span className="font-medium">Direct mandi benchmarks</span>
              </div>

            </div>

            {/* Bottom Floating Pill */}
            <div className="hidden sm:inline-flex items-center gap-2 absolute -bottom-3.5 left-6 z-20 px-3 py-1 rounded-full bg-white dark:bg-stone-800 text-[11px] font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 shadow-md">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-time trades across 28 states</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
