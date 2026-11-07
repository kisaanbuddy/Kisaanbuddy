import type { Metadata } from 'next';
import { Suspense } from 'react';
import SoilHealthClient from './SoilHealthClient';
import { TestTube, Sparkles, Sprout, ShieldCheck, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Soil Health Card Analysis & Fertilizer Dosage Advisor | मिट्टी परीक्षण | KisaanBuddy',
  description:
    'Interpret your Soil Health Card test values online. Calculate custom scientific N-P-K fertilizer dosages, soil pH corrections (lime/gypsum), and organic carbon amendments for Indian farmland.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/soil-health',
  },
  openGraph: {
    title: 'Soil Health Card Analysis & Fertilizer Dosage Advisor | KisaanBuddy',
    description:
      'Enter your Soil Health Card parameters to receive precision fertilizer dosages, pH corrections, and soil organic carbon advice.',
    url: 'https://www.kisaanbuddy.com/soil-health',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy AI Soil Health Advisor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soil Health Card Analysis & Fertilizer Dosage Advisor | KisaanBuddy',
    description:
      'Enter your Soil Health Card parameters to receive precision fertilizer dosages, pH corrections, and soil organic carbon advice.',
    images: ['/logo.png'],
  },
};

export default function SoilHealthPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KisaanBuddy AI Soil Health & Fertilizer Advisor',
    url: 'https://www.kisaanbuddy.com/soil-health',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'Precision Soil Card Analyst. Translates laboratory soil test values (N, P, K, pH, OC, EC) into actionable crop-specific fertilizer schedules and organic soil improvement advice.',
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
        name: 'What parameters are tested in a Government Soil Health Card?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The card reports 12 key parameters: Primary macronutrients (Nitrogen, Phosphorus, Potassium), Secondary nutrient (Sulphur), Micronutrients (Zinc, Iron, Copper, Manganese, Boron), and Physical parameters (pH, Electrical Conductivity, and Organic Carbon).',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I correct acidic or alkaline agricultural soil?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Acidic soils (pH < 6.0) are treated by applying agricultural lime (calcium carbonate) or dolomite to raise pH. Alkaline / sodic soils (pH > 8.2) are treated by applying agricultural gypsum (calcium sulphate) accompanied by organic green manuring (dhaincha) and sulfur.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why should farmers avoid excessive Urea application?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Over-applying Urea supplies excessive nitrogen, causing weak elongated stems that lodge in rains, increasing pest susceptibility, and leaching nitrates into groundwater while wasting farmer input expenses.',
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
            <TestTube className="w-3.5 h-3.5" />
            <span>Soil Health Card Intelligence & Fertilizer Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-foreground tracking-tight">
            Scientific Soil Health Assessment & Customized Fertilizer Dosage
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Healthy soil is the foundation of high crop productivity. 
            Rather than relying on generic fertilizer bags, use your official Soil Health Card parameters to apply exactly the nutrients your crops need, reducing cultivation costs and restoring long-term soil fertility.
          </p>
        </div>

        {/* Essential Soil Parameter Guide */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">🌱 N-P-K Macro Nutrients</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Nitrogen (N):</strong> Powers tillering and green foliage. <br />
              <strong>Phosphorus (P):</strong> Stimulates early root expansion. <br />
              <strong>Potassium (K):</strong> Enhances grain weight and disease immunity.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">⚖️ Soil Reaction (pH Level)</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Optimal nutrient absorption occurs between pH 6.5 and 7.5. Acidic or alkaline extremes chemically lock essential minerals away from plant root absorption.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">🍂 Soil Organic Carbon (SOC)</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Target &gt;0.75% Organic Carbon to maximize water holding capacity, encourage beneficial mycorrhizae, and prevent soil compaction.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/80 italic border-t border-border/40 pt-3">
          * Note: NPK and pH recommendations are advisory baselines aligned with Indian Council of Agricultural Research (ICAR) guidelines. Optimal field application rates depend on specific crop variety, irrigation method, previous crop residue, and local agro-climatic conditions. Consult your district Krishi Vigyan Kendra (KVK) for farm-specific prescriptions.
        </p>
      </section>

      {/* Interactive Soil Health Card Calculator & AI Advisor */}
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        }
      >
        <SoilHealthClient />
      </Suspense>
    </div>
  );
}
