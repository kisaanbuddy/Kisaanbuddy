import type { Metadata } from 'next';
import { Suspense } from 'react';
import WorkerConnectClient from './WorkerConnectClient';

export const metadata: Metadata = {
  title: 'Worker Connect - Hire Farm Labours & Find Jobs | कृषि मजदूर सेवा',
  description: 'Connect with local farm owners looking to hire workers, or post agricultural job openings for harvesting, sowing, weeding, and tractor operations.',
  alternates: {
    canonical: '/worker-connect',
  },
  openGraph: {
    title: 'Worker Connect - Hire Farm Labours & Find Jobs | कृषि मजदूर सेवा',
    description: 'Connect with local farm owners looking to hire workers, or post agricultural job openings for harvesting, sowing, weeding, and tractor operations.',
    url: '/worker-connect',
    type: 'website',
  },
};

export default function WorkerConnectPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy Worker Connect",
    "url": "https://kisaanbuddy.com/worker-connect",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "Multilingual Farm Labor and Job Marketplace. Connects local farm owners with agricultural workers, helping post jobs for sowing, weeding, harvesting, and machinery operations."
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
