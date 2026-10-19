'use client';

import Link from 'next/link';
import {
  Users, Briefcase, ArrowRight, CheckCircle2, ShieldCheck,
  MapPin, Calendar, Clock, Sparkles, UserCheck, PhoneCall
} from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';

export function WorkersConnectHomeSection() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).workers;

  // Real SFAC / NABARD registered FPO collectives preview
  const verifiedCollectives = [
    {
      name: "Dummawad Horticulture Farmers Producer Co. (CHC)",
      location: "Dharwad, Karnataka",
      specialty: "Paddy Harvesting & Tractor Rotavator",
      groupSize: 18,
      wage: "₹450 / day",
      verified: "SFAC / NABARD Registered",
    },
    {
      name: "Jagraon Crop Producer Co. Ltd.",
      location: "Ludhiana, Punjab",
      specialty: "Combine Harvester & Laser Leveler Crew",
      groupSize: 14,
      wage: "₹510 / day",
      verified: "SFAC Registered FPO",
    },
  ];

  // Real active farm job openings preview
  const activeJobs = [
    {
      title: "Paddy Harvesting & Threshing Crew Needed",
      location: "Navalgund, Dharwad, Karnataka",
      workersNeeded: 10,
      duration: "5 days",
      wage: "₹450 / day",
      perk: "Tractor pickup & rest shed provided",
    },
    {
      title: "Sugarcane Harvesting & Tractor Loading",
      location: "Pandavapura, Mandya, Karnataka",
      workersNeeded: 8,
      duration: "6 days",
      wage: "₹470 / day",
      perk: "Daily cash payment at muster",
    },
  ];

  return (
    <section id="workers-connect" className="w-full py-12 sm:py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300">
            {t.subtitle}
          </p>
        </div>

        {/* Two Dedicated Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* ======================================================== */}
          {/* CARD A: FIND WORKERS (FOR FARMERS NEEDING LABOUR) */}
          {/* ======================================================== */}
          <div className="rounded-3xl p-6 sm:p-8 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                  For Farmers
                </span>
                <span className="text-xs text-stone-500 font-medium">Seasonal Labour Hiring</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                {t.cardWorkersTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {t.cardWorkersDesc}
              </p>

              {/* Bullet Points */}
              <div className="space-y-2.5 pt-1 text-xs text-stone-700 dark:text-stone-300 font-medium">
                {t.cardWorkersPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Verified Collectives Preview */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  {t.sampleWorkersTitle}
                </span>

                <div className="space-y-2">
                  {verifiedCollectives.map((coll, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-stone-900 dark:text-white truncate">{coll.name}</span>
                          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded-full shrink-0">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{coll.location}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{coll.specialty}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-stone-900 dark:text-white block">{coll.wage}</span>
                        <span className="text-[10px] text-stone-400">{coll.groupSize} workers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Link
                href="/worker-connect?tab=find_workers"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-all"
              >
                <Users className="w-4 h-4" />
                <span>{t.cardWorkersCta}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CARD B: FIND FARMING JOBS (FOR LABOURERS & WORKERS) */}
          {/* ======================================================== */}
          <div className="rounded-3xl p-6 sm:p-8 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold shadow-2xs">
                  For Workers
                </span>
                <span className="text-xs text-stone-500 font-medium">Agricultural Employment</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                {t.cardJobsTitle}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {t.cardJobsDesc}
              </p>

              {/* Bullet Points */}
              <div className="space-y-2.5 pt-1 text-xs text-stone-700 dark:text-stone-300 font-medium">
                {t.cardJobsPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Real Open Jobs Preview */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  {t.sampleJobsTitle}
                </span>

                <div className="space-y-2">
                  {activeJobs.map((job, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-xs text-stone-900 dark:text-white truncate block">{job.title}</span>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{job.location}</span>
                          <span>&bull;</span>
                          <span className="text-stone-600 dark:text-stone-400">{job.perk}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 block">{job.wage}</span>
                        <span className="text-[10px] text-stone-400">{job.workersNeeded} needed ({job.duration})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Link
                href="/worker-connect?tab=find_jobs"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                <Briefcase className="w-4 h-4" />
                <span>{t.cardJobsCta}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

        </div>

        {/* Protection Note */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center gap-3 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[11px]">
            Workers Connect operates strictly on worker consent. Direct phone contact is unlocked only when the worker approves an inquiry. No worker phone numbers or Aadhaar numbers are exposed publicly.
          </p>
        </div>

      </div>
    </section>
  );
}
