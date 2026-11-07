import type { Metadata } from 'next';
import { Suspense } from 'react';
import WorkerConnectClient from './WorkerConnectClient';
import { Users, Briefcase, ShieldCheck, IndianRupee, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AgriLabour — Hire Agricultural Labourers & Farm Workers | कृषि मजदूर | KisaanBuddy',
  description:
    'Find and hire genuine agricultural workers, harvesting gangs, and tractor operators near you, or post farm job openings on KisaanBuddy with zero agent commission.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/worker-connect',
  },
  openGraph: {
    title: 'AgriLabour — Hire Agricultural Labourers & Farm Workers | कृषि मजदूर | KisaanBuddy',
    description:
      'Connect local farm owners with skilled agricultural labor. Find harvesting crews, tractor drivers, and daily farm jobs with official wage benchmarks.',
    url: 'https://www.kisaanbuddy.com/worker-connect',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy AgriLabour Worker Connect',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriLabour — Hire Agricultural Labourers & Farm Workers | KisaanBuddy',
    description:
      'Connect local farm owners with skilled agricultural labor. Find harvesting crews, tractor drivers, and daily farm jobs with official wage benchmarks.',
    images: ['/logo.png'],
  },
};

export default function WorkerConnectPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KisaanBuddy AgriLabour Worker Connect',
    url: 'https://www.kisaanbuddy.com/worker-connect',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'Multilingual Agricultural Employment & Labor Exchange. Connects farm owners with verified agricultural workers, harvesting gangs, and tractor operators across Indian rural districts.',
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
        name: 'Is there any commission or middleman fee on AgriLabour Worker Connect?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. KisaanBuddy charges 0% commission. Farm owners and agricultural laborers communicate and negotiate daily wage terms directly with complete transparency.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is worker and farmer phone number privacy protected?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Personal mobile numbers remain hidden on public profiles. Contact details are securely revealed only when both parties mutually accept a contact or job application request.',
        },
      },
      {
        '@type': 'Question',
        name: 'What farm operations are covered under Worker Connect?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The platform covers Paddy transplanting, Wheat harvesting, Sugarcane cutting, Cotton picking, Tractor tillage and laser leveling, Drone/HTP spraying, and general farm maintenance.',
        },
      },
    ],
  };

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

      {/* Crawlable Semantic Overview Section */}
      <section className="rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/60 p-6 md:p-8 shadow-xs space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Users className="w-3.5 h-3.5" />
            <span>0% Commission Agricultural Labor & Job Exchange</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-foreground tracking-tight">
            AgriLabour: Verified Farm Labor Network & Rural Employment Directory
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Finding reliable farm workers during peak sowing and harvesting seasons is critical for crop survival. 
            KisaanBuddy AgriLabour directly links farm owners with skilled daily wage laborers, tractor operators, and harvesting crews without commission or middleman fees.
          </p>
        </div>

        {/* Labor Exchange Principles */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <IndianRupee className="w-4 h-4" />
              <span>Zero Middleman Commission</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              100% of agreed daily wages go directly from farm owner to agricultural worker. No contractor cuts or platform deductions.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Identity & Skill Badges</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Workers and farm owners complete basic phone verification. Operators can list tractor, sprayer, and harvesting experience.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
              <span>Direct Village Coordination</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Filter available workers or farm vacancies by district and block (tehsil) to hire nearby laborers and minimize travel costs.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Agricultural Labor Marketplace Tabs & Listings */}
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        }
      >
        <WorkerConnectClient />
      </Suspense>
    </div>
  );
}
