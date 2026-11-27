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

      {/* Crawlable Semantic Overview (sr-only so interactive tool is first) */}
      <section className="sr-only">
        <h1>Government Agriculture Schemes, Subsidies & Benefits Guide</h1>
        <p>
          Explore central and state agriculture programs for Indian farmers including income support, crop insurance, credit, and irrigation subsidies.
        </p>
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
