import type { Metadata } from 'next';
import { ContactClient } from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | KisaanBuddy',
  description: 'Have any questions, issues, or partnership proposals? Get in touch with the KisaanBuddy co-founding team. Write us directly or send a query through our contact form.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | KisaanBuddy',
    description: 'Connect with KisaanBuddy founders and support teams.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kisaanbuddy.com';
  
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Contact KisaanBuddy',
    'url': `${siteUrl}/contact`,
    'description': 'Contact page for KisaanBuddy with co-founders emails, support details, and inquiry form.',
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'contact@kisaanbuddy.com',
      'contactType': 'customer support',
      'availableLanguage': ['English', 'Hindi', 'Kannada']
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <ContactClient />
    </>
  );
}
