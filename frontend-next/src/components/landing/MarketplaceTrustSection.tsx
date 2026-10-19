'use client';

import { ShieldCheck, Database, Lock, Globe, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';

export function MarketplaceTrustSection() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).trust;

  const pillars = [
    {
      icon: Database,
      title: t.pillar1Title,
      desc: t.pillar1Desc,
      tag: "Verified Sources",
    },
    {
      icon: ShieldCheck,
      title: t.pillar2Title,
      desc: t.pillar2Desc,
      tag: "Truth in Data",
    },
    {
      icon: Lock,
      title: t.pillar3Title,
      desc: t.pillar3Desc,
      tag: "Privacy by Design",
    },
    {
      icon: Globe,
      title: t.pillar4Title,
      desc: t.pillar4Desc,
      tag: "10+ Languages",
    },
  ];

  return (
    <section id="trust-transparency" className="w-full py-12 sm:py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300">
            {t.subtitle}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pil, idx) => {
            const Icon = pil.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl p-5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      {pil.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 dark:text-white leading-snug">
                    {pil.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {pil.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit & Dispute Reporting Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-400">
          <div className="space-y-1">
            <span className="font-bold text-stone-900 dark:text-white block">
              Marketplace Dispute & Content Reporting
            </span>
            <p className="text-[11px] leading-relaxed max-w-2xl">
              Encountered an inaccurate listing, misleading price quote, or unresponsive contact? Every listing includes direct flag & reporting workflows for platform administrative review.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              Admin Moderated
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
