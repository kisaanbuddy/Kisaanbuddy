import type { Metadata } from 'next';
import { Suspense } from 'react';
import WorkerConnectClient from './WorkerConnectClient';

export const metadata: Metadata = {
  title: 'AgriLabour - Hire Agricultural Labourers & Farm Workers | कृषि मजदूर',
  description: 'Find and hire genuine agricultural workers, harvesting gangs, and tractor operators near you, or post farm job openings on KisaanBuddy.',
  alternates: {
    canonical: '/worker-connect',
  },
  openGraph: {
    title: 'AgriLabour - Hire Agricultural Labourers & Farm Workers | कृषि मजदूर',
    description: 'Find and hire genuine agricultural workers, harvesting gangs, and tractor operators near you, or post farm job openings on KisaanBuddy.',
    url: '/worker-connect',
    type: 'website',
  },
};

export default function WorkerConnectPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy AgriLabour",
    "url": "https://kisaanbuddy.com/worker-connect",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "Premium Agricultural Workforce Marketplace for Indian Farmers. Connect with local verified farm workers, harvesting gangs, and tractor operators."
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
        <WorkerConnectClient />
      </Suspense>
    </div>
  );
}
