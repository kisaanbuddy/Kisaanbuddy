import type { Metadata } from 'next';
import { Suspense } from 'react';
import MarketplaceClient from './MarketplaceClient';

export const metadata: Metadata = {
  title: 'Krishi Marketplace — Buy & Sell Farm Produce & Machinery | किसान बाज़ार | KisaanBuddy',
  description:
    'Connect directly with verified agricultural buyers, trade fresh harvest produce at transparent mandi rates, and rent or purchase tractors and farming equipment across India with zero middlemen.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/marketplace',
  },
  openGraph: {
    title: 'Krishi Marketplace — Buy & Sell Farm Produce & Machinery | KisaanBuddy',
    description:
      'Direct farm-to-buyer agricultural marketplace. Connect with verified institutional buyers, browse verified farm machinery, and list crop harvests.',
    url: 'https://www.kisaanbuddy.com/marketplace',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy Krishi Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Krishi Marketplace — Buy & Sell Farm Produce & Machinery | KisaanBuddy',
    description:
      'Direct farm-to-buyer agricultural marketplace. Connect with verified institutional buyers, browse verified farm machinery, and list crop harvests.',
    images: ['/logo.png'],
  },
};

export default function MarketplacePage() {
  const marketplaceSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'KisaanBuddy Krishi Marketplace',
    url: 'https://www.kisaanbuddy.com/marketplace',
    description:
      'Multilingual Indian agricultural marketplace connecting farmers directly with institutional commodity buyers, custom hiring centers, and tractor dealerships.',
    provider: {
      '@type': 'Organization',
      name: 'KisaanBuddy',
      url: 'https://www.kisaanbuddy.com',
    },
    about: [
      { '@type': 'Thing', name: 'Farm Equipment Rental and Sale' },
      { '@type': 'Thing', name: 'Direct Farm Produce Trading' },
      { '@type': 'Thing', name: 'Verified Agricultural Buyers' },
    ],
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }}
      />

      {/* Crawlable Semantic SEO Overview Header */}
      <section className="sr-only">
        <h1>KisaanBuddy Agricultural Marketplace & Farm Machinery Hub</h1>
        <p>
          Welcome to KisaanBuddy Marketplace — a dedicated digital trading platform for Indian agriculture. 
          Our marketplace provides three core services for kisan brothers across all Indian states:
        </p>
        <h2>1. Verified Institutional Buyers & Direct Produce Trading</h2>
        <p>
          Sell wheat, paddy, pulses, mustard, soybeans, onions, and fresh vegetables directly to verified millers, exporters, and wholesale buyers at competitive mandi-benchmarked prices with transparent payments.
        </p>
        <h2>2. Farm Machinery & Tractor Hiring (Custom Hiring Centers)</h2>
        <p>
          Browse, rent, or buy verified agricultural machinery including Mahindra, Swaraj, John Deere, and Sonalika tractors, combine harvesters, laser levellers, rotavators, seed drills, and power sprayers with local availability.
        </p>
        <h2>3. Farm Inputs & Equipment Specifications</h2>
        <p>
          Inspect technical HP ratings, PTO specifications, implement compatibilities, and manufacturer warranty information verified under official agricultural engineering benchmarks.
        </p>
      </section>

      <Suspense
        fallback={
          <div className="min-h-[450px] flex flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
            <span className="text-xs text-muted-foreground font-medium">Loading Krishi Marketplace...</span>
          </div>
        }
      >
        <MarketplaceClient />
      </Suspense>
    </div>
  );
}
