import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us — Building Technology That Understands Farming | KisaanBuddy',
  description:
    'Learn about KisaanBuddy — an AI-powered agricultural advisory platform bringing practical machine learning, live AGMARKNET mandi rates, and vernacular weather intelligence to Indian farmers.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/about',
  },
  openGraph: {
    title: 'About Us — Building Technology That Understands Farming | KisaanBuddy',
    description:
      'An ambitious attempt to bring AI, agricultural intelligence and accessible technology closer to India’s farmers.',
    url: 'https://www.kisaanbuddy.com/about',
    type: 'website',
  },
};

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kisaanbuddy.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KisaanBuddy',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      'AI-powered smart agriculture platform designed to empower Indian farmers with intelligent crop diagnostics, live mandi rates, weather alerts, and soil nutrition advisories.',
    founder: [
      {
        '@type': 'Person',
        name: 'Aditya Ishwar',
        jobTitle: 'Founder & Head of Product',
      },
      {
        '@type': 'Person',
        name: 'Utkarsh Sinha',
        jobTitle: 'Co-Founder & Head of Operations',
      },
      {
        '@type': 'Person',
        name: 'Yash Singh',
        jobTitle: 'Co-Founder & Head of Technology',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <AboutClient />
    </>
  );
}
