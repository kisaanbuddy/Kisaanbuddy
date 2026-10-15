import type { Metadata } from 'next';
import { Suspense } from 'react';
import SchemesClient from './SchemesClient';

export const metadata: Metadata = {
  title: 'Government Agriculture Schemes Eligibility | सरकारी योजनाएं',
  description: 'Search and find government agricultural schemes, subsidy eligibilities, PM-KISAN tracking, and soil testing benefits for Indian farmers.',
  alternates: {
    canonical: '/schemes',
  },
  openGraph: {
    title: 'Government Agriculture Schemes Eligibility | सरकारी योजनाएं',
    description: 'Search and find government agricultural schemes, subsidy eligibilities, PM-KISAN tracking, and soil testing benefits for Indian farmers.',
    url: '/schemes',
    type: 'website',
  },
};

export default function SchemesPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy Govt Schemes Advisor",
    "url": "https://kisaanbuddy.com/schemes",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "Indian Government Agricultural Schemes Database. Check eligibility, benefits, and documents required for schemes like PM-Kisan, KCC, PM-Kusum, and PMFBY."
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
        <SchemesClient />
      </Suspense>
    </div>
  );
}
