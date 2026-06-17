import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us | KrishiAI',
  description: 'Learn about KrishiAI - an AI-powered smart agriculture platform designed to help Indian farmers optimize crop yields, detect diseases, monitor soil health, and track live mandi prices.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | KrishiAI',
    description: 'Empowering Indian farmers with cutting-edge AI technologies.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kisaanbuddy.com';
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'KrishiAI',
    'url': siteUrl,
    'logo': `${siteUrl}/icon-192.svg`,
    'description': 'AI-powered smart agriculture platform for Indian farmers.',
    'sameAs': [
      'https://github.com/adityaoutlier5/krishiai'
    ]
  };

  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'About KrishiAI',
    'url': `${siteUrl}/about`,
    'description': 'Learn about the vision, features, and co-founders of KrishiAI - India\'s leading smart farming platform.'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <AboutClient />
    </>
  );
}
