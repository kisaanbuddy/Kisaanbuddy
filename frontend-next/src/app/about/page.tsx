import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us | KisaanBuddy',
  description: 'Learn about KisaanBuddy - an AI-powered smart agriculture platform designed to help Indian farmers optimize crop yields, detect diseases, monitor soil health, and track live mandi prices.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | KisaanBuddy',
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
    'name': 'KisaanBuddy',
    'url': siteUrl,
    'logo': `${siteUrl}/icon-192.svg`,
    'description': 'AI-powered smart agriculture platform for Indian farmers.',
    'sameAs': [
      'https://github.com/adityaoutlier5/KisaanBuddy'
    ]
  };

  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'About KisaanBuddy',
    'url': `${siteUrl}/about`,
    'description': 'Learn about the vision, features, and co-founders of KisaanBuddy - India\'s leading smart farming platform.'
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is KisaanBuddy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "KisaanBuddy is an AI-powered smart agriculture advisor platform. It helps Indian farmers identify crop leaf diseases, monitor soil health, check live APMC mandi prices, and receive real-time weather advisories."
        }
      },
      {
        "@type": "Question",
        "name": "Is there any fee to use KisaanBuddy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, KisaanBuddy's core advisory features, crop scanners, mandi checks, and scheme advisory tools are completely free for farmers across India."
        }
      },
      {
        "@type": "Question",
        "name": "How does the disease detection tool work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI model analyzes uploaded crop leaf photographs to instantly diagnose pathogens (like blight, blast, or rust) and suggest targeted organic remedies and chemical treatments."
        }
      }
    ]
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <AboutClient />
    </>
  );
}
