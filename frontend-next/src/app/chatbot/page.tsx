import type { Metadata } from 'next';
import { Suspense } from 'react';
import ChatbotClient from './ChatbotClient';

export const metadata: Metadata = {
  title: 'AI Farming Advisor & Voice Agronomist | कृषक AI सलाहकार | KisaanBuddy',
  description:
    'Multilingual, voice-first AI Agricultural Advisor for Indian farmers. Speak or type in Hindi, Kannada, Telugu, Tamil, Marathi, Bengali, Gujarati, Punjabi, Malayalam, and English for crop diagnosis, fertilizer schedules, mandi prices, and nearby Krishi Vigyan Kendra contacts.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/chatbot',
  },
  openGraph: {
    title: 'AI Farming Advisor & Voice Agronomist | KisaanBuddy',
    description:
      'Voice-first AI Agronomist for Indian farmers. Real-time crop diagnostics, ICAR-grounded agronomic advice, and verified government agricultural contacts across India.',
    url: 'https://www.kisaanbuddy.com/chatbot',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy AI Agricultural Advisor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Farming Advisor | KisaanBuddy',
    description:
      'Voice-first AI Agronomist for Indian farmers. Get instant crop disease diagnosis, fertilizer advice, and nearby agriculture officer phone numbers.',
    images: ['/logo.png'],
  },
};

export default function ChatbotPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KisaanBuddy AI Agricultural Advisor',
    url: 'https://www.kisaanbuddy.com/chatbot',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5. Optional microphone for voice.',
    description:
      'Voice-First Multilingual Agricultural AI Advisor. Answers farming queries on crop diseases, organic remedies, fertilizer schedules, mandi prices, weather, and connects farmers with verified nearby Krishi Vigyan Kendra (KVK) officers.',
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
        name: 'What languages does the KisaanBuddy AI Agronomist support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The assistant understands and replies across Indian languages including Hindi, English, Kannada, Telugu, Tamil, Marathi, Bengali, Gujarati, Punjabi, Malayalam, and Hinglish via both voice and text.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I upload a picture of a diseased crop leaf to the chatbot?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can snap or attach a photo of the affected plant leaf. The AI inspects visible symptoms and provides calibrated diagnosis and CIBRC-registered treatment remedies.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I contact my nearest government agricultural officer or KVK?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The collapsible Agriculture Department & Helplines panel identifies your district via browser location or manual selection and provides verified direct telephone numbers, emails, and addresses for your District Agriculture Officer, KVK, and Soil Testing Lab, with a national fallback to the Kisan Call Centre (1800-180-1551).',
        },
      },
    ],
  };

  return (
    <div data-fullwidth="true" className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Full-Screen Voice-First AI Advisor Experience */}
      <Suspense
        fallback={
          <div className="h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] w-full flex flex-col items-center justify-center gap-3 bg-[#F5F9F5] dark:bg-stone-950 text-muted-foreground font-semibold">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="text-xs">Loading KisaanBuddy AI Advisor...</p>
          </div>
        }
      >
        <ChatbotClient />
      </Suspense>

      {/* Crawlable Semantic Guide for Search Engines */}
      <section className="sr-only">
        <h2>How KisaanBuddy AI Delivers Grounded Farming Intelligence</h2>
        <p>
          KisaanBuddy strictly rejects simulated data, fake seller numbers, and unverified chemical dosages.
          Agricultural advisories are grounded in authoritative Indian institutions including ICAR,
          CIBRC, IMD, AGMARKNET, and State Agricultural Universities, with direct fallback to the
          official Ministry of Agriculture Kisan Call Centre (1800-180-1551).
        </p>
      </section>
    </div>
  );
}
