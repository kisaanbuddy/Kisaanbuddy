'use client';

import Link from 'next/link';
import { Landmark, ArrowRight, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getHomepageI18n } from '@/lib/homepage-i18n';

interface SchemeCard {
  name: string;
  category: string;
  benefit: string;
  eligibility: string;
  officialUrl: string;
  inAppUrl: string;
}

const OFFICIAL_SCHEMES: SchemeCard[] = [
  {
    name: "PM-KISAN (Kisan Samman Nidhi)",
    category: "Income Support & Direct Benefit Transfer",
    benefit: "₹6,000 per year in 3 equal four-monthly installments of ₹2,000 via DBT",
    eligibility: "All landholding farmer families with cultivable land in their name",
    officialUrl: "https://pmkisan.gov.in",
    inAppUrl: "/schemes?scheme=pm-kisan",
  },
  {
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    category: "Crop Risk & Insurance Coverage",
    benefit: "Comprehensive coverage against non-preventable natural risks; 1.5%–2% farmer premium cap",
    eligibility: "All farmers growing notified crops in notified areas (loanee & non-loanee)",
    officialUrl: "https://pmfby.gov.in",
    inAppUrl: "/schemes?scheme=pmfby",
  },
  {
    name: "Agriculture Infrastructure Fund (AIF)",
    category: "Post-Harvest Infrastructure & Cold Chain",
    benefit: "3% per annum interest subvention on credit up to ₹2 Crore for up to 7 years",
    eligibility: "Primary Agricultural Credit Societies (PACS), FPOs, Agri-entrepreneurs, SHGs",
    officialUrl: "https://agriinfra.dac.gov.in",
    inAppUrl: "/schemes?scheme=aif",
  },
  {
    name: "SMAM (Agricultural Mechanization Sub-Mission)",
    category: "Machinery & Custom Hiring Centre Subsidy",
    benefit: "40% to 50% subsidy on procurement of tractors, power tillers, and CHC setups",
    eligibility: "Individual farmers, cooperative societies, registered FPOs, self-help groups",
    officialUrl: "https://agrimachinery.nic.in",
    inAppUrl: "/schemes?scheme=smam",
  },
];

export function GovernmentSchemesSection() {
  const { lang } = useLanguage();
  const t = getHomepageI18n(lang).schemes;

  return (
    <section id="government-schemes" className="w-full py-12 sm:py-16 bg-stone-50/70 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight">
              {t.title}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline shrink-0 group"
          >
            <span>{t.viewAllSchemes}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OFFICIAL_SCHEMES.map((scheme, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                    {scheme.category}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-400">Official Govt Scheme</span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  {scheme.name}
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">Key Financial Benefit</span>
                    <p className="font-semibold text-stone-800 dark:text-stone-200">{scheme.benefit}</p>
                  </div>

                  <div className="space-y-0.5 text-stone-600 dark:text-stone-400">
                    <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300">Eligibility: </span>
                    <span>{scheme.eligibility}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 text-xs">
                <Link
                  href={scheme.inAppUrl}
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Check Guidelines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-[11px]"
                >
                  <span>{t.officialPortal}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
