import type { Metadata } from 'next';
import { Suspense } from 'react';
import SchemesClient from './SchemesClient';
import ALL_SCHEMES_DATA from '@/lib/schemes-data.json';
import { CheckCircle2, FileText, IndianRupee, Landmark, ExternalLink, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Government Agriculture Schemes & Subsidy Eligibility | सरकारी योजनाएं | KisaanBuddy',
  description:
    'Search and check eligibility for verified central and state agriculture schemes: PM-KISAN, Kisan Credit Card (KCC), PMFBY Crop Insurance, PM-KUSUM Solar Pumps, and tractor mechanization subsidies with required documents.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/schemes',
  },
  openGraph: {
    title: 'Government Agriculture Schemes & Subsidy Eligibility | KisaanBuddy',
    description:
      'Search verified Indian agriculture schemes: PM-KISAN, KCC, PMFBY, PM-KUSUM, and farm machinery subsidies with eligibility checklists.',
    url: 'https://www.kisaanbuddy.com/schemes',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy Govt Agriculture Schemes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Government Agriculture Schemes & Subsidy Eligibility | KisaanBuddy',
    description:
      'Search verified Indian agriculture schemes: PM-KISAN, KCC, PMFBY, PM-KUSUM, and farm machinery subsidies with eligibility checklists.',
    images: ['/logo.png'],
  },
};

export default function SchemesPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KisaanBuddy Govt Schemes Advisor',
    url: 'https://www.kisaanbuddy.com/schemes',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'Indian Government Agricultural Schemes Database & Eligibility Advisor. Check benefits, documents required, and official application portals for PM-Kisan, KCC, PM-Kusum, and PMFBY.',
    provider: {
      '@type': 'Organization',
      name: 'KisaanBuddy',
      url: 'https://www.kisaanbuddy.com',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I check my PM-KISAN beneficiary status?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Visit the official PM-KISAN portal (pmkisan.gov.in), click on "Know Your Status", enter your Registration Number or mobile number with captcha, and complete OTP verification to see installment transfer status.',
        },
      },
      {
        '@type': 'Question',
        name: 'What documents are required to apply for a Kisan Credit Card (KCC)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The standard documents include: Aadhaar Card, PAN Card, land revenue record (Khasra/Khatauni/7/12 extract/RoR), declaration of crops grown/cultivation area, and passport size photographs submitted to your local commercial or cooperative bank branch.',
        },
      },
      {
        '@type': 'Question',
        name: 'What subsidy is provided under the PM-KUSUM scheme for solar pumps?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Under PM-KUSUM Component-B, the Central and State Governments provide up to 60% subsidy (30% Central + 30% State) for standalone solar agriculture pumps (3 HP to 10 HP), with bank loans covering up to 30%, meaning the farmer pays only 10% upfront.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who is eligible for PM Fasal Bima Yojana (PMFBY)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All farmers including sharecroppers and tenant farmers growing notified insurable crops in notified areas are eligible. Farmers with KCC crop loans are covered automatically through their bank unless opted out in writing.',
        },
      },
    ],
  };

  // Select top verified featured schemes for server-rendered HTML
  const featuredSchemes = ALL_SCHEMES_DATA.slice(0, 6);

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Crawlable Semantic Overview & Directory */}
      <section className="rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/60 p-6 md:p-8 shadow-xs space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Landmark className="w-3.5 h-3.5" />
            <span>National Agricultural Schemes Database 2026</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-foreground tracking-tight">
            Government Agriculture Schemes, Subsidies & Benefits Guide
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Explore verified central and state agriculture programs designed to support Indian farmers with direct income transfers,
            low-interest crop credit, solar irrigation pump subsidies, and risk mitigation against crop failure.
          </p>
        </div>

        {/* Server-Rendered Featured Scheme Cards for Search Engines */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="rounded-2xl border border-border/60 bg-background p-5 flex flex-col justify-between space-y-3.5 hover:border-emerald-500/40 transition-all shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    {scheme.jurisdiction}
                  </span>
                  <span className="text-muted-foreground">{scheme.category.replace('_', ' ')}</span>
                </div>

                <h2 className="text-base font-bold text-foreground font-display leading-snug">
                  {scheme.name}
                </h2>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                  <span>{scheme.benefit}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {scheme.overview || scheme.description}
                </p>

                <div className="pt-2 border-t border-border/40 space-y-1.5 text-[11px]">
                  <span className="font-semibold text-foreground block">Key Eligibility:</span>
                  <p className="text-muted-foreground leading-snug">{scheme.eligibility_criteria_text}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Portal
                </span>
                <a
                  href={scheme.application_url || scheme.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Scheme Finder & Personalized Eligibility Calculator */}
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        }
      >
        <SchemesClient />
      </Suspense>
    </div>
  );
}
