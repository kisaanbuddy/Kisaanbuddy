import type { Metadata } from 'next';
import { Suspense } from 'react';
import MandiClient from './MandiClient';

export const metadata: Metadata = {
  title: 'Live Mandi Prices & Market Rates | मंडी भाव',
  description: 'Track real-time eNAM mandi market rates for crops across India. Get historical price charts, daily trends, and volume indicators.',
  alternates: {
    canonical: '/mandi',
  },
  openGraph: {
    title: 'Live Mandi Prices & Market Rates | मंडी भाव',
    description: 'Track real-time eNAM mandi market rates for crops across India. Get historical price charts, daily trends, and volume indicators.',
    url: '/mandi',
    type: 'website',
  },
};

export default function MandiPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy Live Mandi Prices Index",
    "url": "https://kisaanbuddy.com/mandi",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "Live APMC Mandi Market Prices Tracker. Get real-time commodity trading rates, daily models, volumes, and MSP benchmarks across Indian states."
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <Suspense fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }>
        <MandiClient />
      </Suspense>
    </div>
  );
}
