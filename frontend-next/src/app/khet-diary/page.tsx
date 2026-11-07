import type { Metadata } from 'next';
import { Suspense } from 'react';
import KhetDiaryClient from './KhetDiaryClient';

export const metadata: Metadata = {
  title: 'Khet Diary — Digital Farm Ledger & Expense Tracker | खेत डायरी | KisaanBuddy',
  description:
    'Maintain daily farm accounts, record crop input costs (seeds, fertilizers, diesel, labor), track mandi sales revenue, and calculate crop-wise profit per acre with KisaanBuddy Khet Diary.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/khet-diary',
  },
  openGraph: {
    title: 'Khet Diary — Digital Farm Ledger & Expense Tracker | KisaanBuddy',
    description:
      'Digital Farm Logbook and Ledger. Record daily farm tasks, input costs, harvest sales revenues, and calculate crop net profit.',
    url: 'https://www.kisaanbuddy.com/khet-diary',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy Khet Diary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khet Diary — Digital Farm Ledger & Expense Tracker | KisaanBuddy',
    description:
      'Digital Farm Logbook and Ledger. Record daily farm tasks, input costs, harvest sales revenues, and calculate crop net profit.',
    images: ['/logo.png'],
  },
};

export default function KhetDiaryPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KisaanBuddy Khet Diary',
    url: 'https://www.kisaanbuddy.com/khet-diary',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'Digital Farm Logbook and Ledger for Indian farmers. Record daily farm activities, track production costs, calculate net profit, and organize records for KCC bank loans.',
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
        name: 'What entries should be recorded in Khet Diary?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Farmers should record sowing dates, seed varieties, fertilizer and pesticide purchases, irrigation fuel expenses, labor wage payouts, crop harvest yields, and APMC mandi sale prices.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does digital farm accounting help with Kisan Credit Card (KCC) loans?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Maintaining organized records of cultivation costs, cash outflows, and harvest yields provides verifiable financial history that bank officers use to evaluate creditworthiness and approve KCC scale-of-finance limits.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my farm financial ledger private?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All personal farm ledger entries, income numbers, and expense amounts are strictly private, encrypted, and accessible only to the authenticated farmer account.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I track expenses across different crops separately?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Khet Diary allows tagging each transaction with specific crops (e.g., Wheat, Mustard, Paddy, Cotton) to calculate exact profit or loss per individual crop.',
        },
      },
    ],
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Crawlable Semantic SEO Overview Header */}
      <section className="sr-only">
        <h1>KisaanBuddy Khet Diary — Complete Digital Agriculture Ledger</h1>
        <p>
          Khet Diary is an intuitive digital ledger purpose-built for Indian farmers to eliminate paper notebooks,
          track cash flows, calculate crop profit margins, and maintain transparent farming financial records.
        </p>
        <h2>Why Maintain Digital Farm Accounts?</h2>
        <p>
          Farming is a seasonal business where multiple expenses (seed packets, land preparation, tractor diesel, fertilizers,
          insecticide sprays, weeding labor, harvest combines, and mandi transport) occur over 4 to 6 months before harvest income is realized.
          Without structured bookkeeping, estimating the actual net income per bigha or acre is difficult.
        </p>
        <h2>Key Benefits for Indian Farmers</h2>
        <ul>
          <li><strong>Input Cost Control:</strong> Track total spending on DAP, Urea, NPK, micronutrients, and crop protection chemicals.</li>
          <li><strong>Accurate Net Profit:</strong> Deduct real production costs from APMC mandi proceeds to evaluate true farm income.</li>
          <li><strong>KCC & Crop Loan Documentation:</strong> Structured records prove actual operational costs to bank credit officers.</li>
          <li><strong>Season-to-Season Comparison:</strong> Compare input costs and yield profits between Kharif and Rabi seasons to plan crop rotations.</li>
        </ul>
      </section>

      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        }
      >
        <KhetDiaryClient />
      </Suspense>
    </div>
  );
}
