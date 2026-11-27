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

      {/* Crawlable Semantic Overview (sr-only so interactive tool is first) */}
      <section className="sr-only">
        <h1>Scientific Soil Health Assessment & Customized Fertilizer Dosage</h1>
        <p>
          Analyze Soil Health Card parameters including NPK, soil pH, and Organic Carbon to get customized fertilizer dosage guidance.
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
