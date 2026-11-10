import type { Metadata } from 'next';
import { Suspense } from 'react';
import ChatbotClient from './ChatbotClient';
import { Bot, Sprout, ShieldAlert, Sparkles, Building2, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Farming Command Centre & Voice Agronomist | कृषक चैटबॉट | KisaanBuddy',
  description:
    'Multilingual, voice-first AI Farming Command Centre for Indian farmers. Speak or text in Hindi, Kannada, Telugu, Tamil, Marathi, Bengali, and English for crop diagnosis, fertilizer schedules, mandi prices, and nearby Krishi Vigyan Kendra contacts.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/chatbot',
  },
  openGraph: {
    title: 'AI Farming Command Centre & Voice Agronomist | KisaanBuddy',
    description:
      'Voice-first AI Agronomist & Farming Command Centre. Real-time crop diagnostics, ICAR-grounded agronomic advice, and verified government agricultural contacts across India.',
    url: 'https://www.kisaanbuddy.com/chatbot',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy AI Farming Command Centre',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Farming Command Centre | KisaanBuddy',
    description:
      'Voice-first AI Agronomist for Indian farmers. Get instant crop disease diagnosis, fertilizer advice, and nearby agriculture officer phone numbers.',
    images: ['/logo.png'],
  },
};

export default function ChatbotPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KisaanBuddy AI Farming Command Centre',
    url: 'https://www.kisaanbuddy.com/chatbot',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5. Optional microphone for voice.',
    description:
      'Voice-First Multilingual Agricultural AI Command Centre. Answers farming queries on crop diseases, organic remedies, fertilizer schedules, and connects farmers with verified nearby Krishi Vigyan Kendra (KVK) officers.',
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
          text: 'The assistant understands and replies in 11 Indian languages: Hindi, English, Kannada, Telugu, Tamil, Marathi, Bengali, Gujarati, Punjabi, Malayalam, and Hinglish via both voice and text.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I upload a picture of a diseased crop leaf to the chatbot?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can snap or attach a photo of the affected plant leaf. The AI inspects visible fungal or bacterial symptoms and provides calibrated diagnosis and CIBRC-registered treatment remedies.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I contact my nearest government agricultural officer or KVK?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Agricultural Intelligence sidebar identifies your district via browser location or manual selection and provides verified direct telephone numbers, emails, and addresses for your District Agriculture Officer, KVK, and Soil Testing Lab, with a national fallback to the Kisan Call Centre (1800-180-1551).',
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Main Interactive AI Command Centre Container */}
      <div className="rounded-3xl border border-border/70 overflow-hidden shadow-sm bg-card">
        <Suspense
          fallback={
            <div className="min-h-[500px] flex flex-col items-center justify-center gap-3 text-muted-foreground font-semibold">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="text-xs">Initializing AI Farming Command Centre...</p>
            </div>
          }
        >
          <ChatbotClient />
        </Suspense>
      </div>

      {/* Semantic Guide & Official Source Transparency Section */}
      <section className="rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/60 p-6 md:p-8 shadow-xs space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Reality First: Scientific Grounding & Verified Contacts</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display text-foreground tracking-tight">
            How KisaanBuddy AI Delivers Grounded Farming Intelligence
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            KisaanBuddy strictly rejects simulated data, fake seller numbers, and unverified chemical dosages.
            All agricultural advisories are retrieved from authoritative Indian institutions including ICAR,
            CIBRC, IMD, and State Agricultural Universities. When direct district contacts are unavailable,
            farmers are immediately connected with the official Ministry of Agriculture Kisan Call Centre.
          </p>
        </div>

        {/* 4 Feature Guide Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
              🌿 Crop Diagnostics & CIBRC Dosages
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Identify yellow leaf spots, rusts, and borers with bio-control remedies and official pre-harvest intervals (PHI).
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
              🧪 Balanced Fertilizer Scheduling
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Calculate basal and top-dressing dosages for Urea, DAP, MOP, and Zinc based on your soil type and crop growth stage.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
              🏛️ Official KVK & Officer Directory
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Discover verified telephone numbers and physical addresses for Krishi Vigyan Kendras, DAOs, and soil testing labs.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
              📞 24x7 Kisan Call Centre Fallback
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Immediate connection with DAC&FW Toll-Free Advisory (1800-180-1551) in 22 regional Indian languages.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
