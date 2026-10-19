'use client';

import Link from 'next/link';
import {
  Mic, Bug, Sprout, FlaskConical, BookOpen, Landmark,
  ArrowRight, Sparkles, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';

interface AdvisoryTool {
  key: string;
  icon: any;
  title: string;
  subtitle: string;
  desc: string;
  href: string;
  badge: string;
  badgeColor: string;
}

export function FarmingIntelligenceSection() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).advisory;

  const tools: AdvisoryTool[] = [
    {
      key: 'chatbot',
      icon: Mic,
      title: 'AI Farming Assistant',
      subtitle: 'Voice & text agricultural advisor',
      desc: 'Ask farming questions in Hindi, Marathi, Kannada, Telugu or English with real-time agronomic guidance.',
      href: '/chatbot',
      badge: 'Voice AI',
      badgeColor: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
    },
    {
      key: 'disease',
      icon: Bug,
      title: 'Crop Doctor & Disease Diagnosis',
      subtitle: 'AI leaf image scan',
      desc: 'Upload crop leaf photos for instant diagnosis of 80+ crop diseases and certified organic/chemical treatments.',
      href: '/disease',
      badge: 'Vision AI',
      badgeColor: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20',
    },
    {
      key: 'crop_advisory',
      icon: Sprout,
      title: 'Scientific Crop Advisory',
      subtitle: 'Soil & climate matched crops',
      desc: 'Select optimal crops based on soil nutrients, rainfall forecasts, and historical regional market demand.',
      href: '/crop-predictor',
      badge: 'Decision Support',
      badgeColor: 'bg-green-500/10 text-green-800 dark:text-green-300 border-green-500/20',
    },
    {
      key: 'soil_health',
      icon: FlaskConical,
      title: 'Soil Health & Fertilizer Calculator',
      subtitle: 'NPK dosage optimizer',
      desc: 'Calculate precise Urea, DAP, and Potash requirements per acre from Soil Health Card parameters to prevent waste.',
      href: '/soil-health',
      badge: 'Nutrient Matrix',
      badgeColor: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
    },
    {
      key: 'khet_diary',
      icon: BookOpen,
      title: 'Khet Diary (Farm Ledger)',
      subtitle: 'Input expense & harvest revenue',
      desc: 'Track seed, fertilizer, irrigation and labour expenses per plot to calculate net season profitability.',
      href: '/khet-diary',
      badge: 'Accounting',
      badgeColor: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/20',
    },
    {
      key: 'schemes',
      icon: Landmark,
      title: 'Government Agriculture Schemes',
      subtitle: 'Subsidies & DBT benefits',
      desc: 'Explore official central and state programs including PM-KISAN, PMFBY crop insurance, and mechanization subsidies.',
      href: '/schemes',
      badge: 'Direct Benefit',
      badgeColor: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/20',
    },
  ];

  return (
    <section id="farming-intelligence" className="w-full py-12 sm:py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300">
            {t.subtitle}
          </p>
        </div>

        {/* 6-Card Supporting Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.key}
                href={tool.href}
                className="rounded-2xl p-5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 hover:border-emerald-500/60 hover:bg-white dark:hover:bg-stone-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-stone-500">
                      {tool.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{t.launchTool}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
