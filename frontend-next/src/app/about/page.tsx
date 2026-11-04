import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us — Building Technology That Understands Farming | KisaanBuddy',
  description:
    'Learn about KisaanBuddy — an AI-powered agricultural advisory platform bringing practical machine learning, live AGMARKNET mandi rates, and vernacular weather intelligence to Indian farmers.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us — Building Technology That Understands Farming | KisaanBuddy',
    description:
      'An ambitious attempt to bring AI, agricultural intelligence and accessible technology closer to India’s farmers.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kisaanbuddy.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KisaanBuddy',
    url: siteUrl,
    logo: `${siteUrl}/icon-192.svg`,
    description:
      'AI-powered agricultural advisory and decision intelligence platform for Indian farmers.',
    sameAs: [
      'https://github.com/adityaoutlier5/KisaanBuddy',
      'https://www.linkedin.com/in/aditya-ishwar',
      'https://www.linkedin.com/in/utkarsh-sinha',
      'https://www.linkedin.com/in/yash-singh-33553b2a5',
    ],
    founder: [
      {
        '@type': 'Person',
        name: 'Aditya Ishwar',
        jobTitle: 'Founder, CEO & Chief Architect',
        sameAs: 'https://www.linkedin.com/in/aditya-ishwar',
      },
      {
        '@type': 'Person',
        name: 'Utkarsh Sinha',
        jobTitle: 'Co-Founder & Managing Director',
        sameAs: 'https://www.linkedin.com/in/utkarsh-sinha',
      },
      {
        '@type': 'Person',
        name: 'Yash Singh',
        jobTitle: 'Co-Founder & CMO',
        sameAs: 'https://www.linkedin.com/in/yash-singh-33553b2a5',
      },
    ],
  };

  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About KisaanBuddy',
    url: `${siteUrl}/about`,
    description:
      'Discover why KisaanBuddy exists, our product architecture, agricultural ecosystem vision, and the founding team building technology that understands farming.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is KisaanBuddy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KisaanBuddy is an AI-powered agricultural advisory platform being developed to make agricultural knowledge, market intelligence, and farm decision-making accessible and practical for Indian farmers. It brings together crop advisory, plant leaf disease scanning, live APMC mandi prices, weather forecasts, and government scheme information in simple, understandable interactions.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does KisaanBuddy approach data authenticity?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Authenticity is our non-negotiable principle. We do not invent prices, fake testimonials, or fabricate agricultural specs. Every mandi price is linked to its official AGMARKNET source and date, crop agronomy is grounded in documented Indian agricultural practices, and we strictly distinguish between currently operational features and long-term roadmap ambitions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who is building KisaanBuddy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KisaanBuddy is being built by a founding team of three engineers: Aditya Ishwar (Founder, CEO & Chief Architect), Utkarsh Sinha (Co-Founder & Managing Director - ML & Agronomy Systems), and Yash Singh (Co-Founder & CMO - Farmer Outreach & Growth).',
        },
      },
      {
        '@type': 'Question',
        name: 'Is KisaanBuddy free for Indian farmers to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, KisaanBuddy’s core advisory features, crop scanners, mandi checks, and scheme advisory tools are completely free for farmers across India.',
        },
      },
    ],
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
