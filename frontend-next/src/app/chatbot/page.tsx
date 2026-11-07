import type { Metadata } from 'next';
import { Suspense } from 'react';
import ChatbotClient from './ChatbotClient';
import { MessageSquare, Mic, ShieldAlert, Sparkles, Sprout, Bot } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Agronomist Voice Assistant & Farming Chatbot | कृषक चैटबॉट | KisaanBuddy',
  description:
    'Speak or text with India\'s intelligent AI Agronomist in Hindi, Kannada, Telugu, Tamil, Marathi, Punjabi, Bengali, and English. Get instant crop protection advice, fertilizer schedules, mandi price alerts, and govt scheme answers.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/chatbot',
  },
  openGraph: {
    title: 'AI Agronomist Voice Assistant & Farming Chatbot | KisaanBuddy',
    description:
      'Multilingual AI Agronomist for Indian farmers. Ask crop protection, disease remedies, fertilizer dosages, and mandi rates in 11 Indian languages.',
    url: 'https://www.kisaanbuddy.com/chatbot',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy AI Agronomist Voice Chatbot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agronomist Voice Assistant & Farming Chatbot | KisaanBuddy',
    description:
      'Multilingual AI Agronomist for Indian farmers. Ask crop protection, disease remedies, fertilizer dosages, and mandi rates in 11 Indian languages.',
    images: ['/logo.png'],
  },
};

export default function ChatbotPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KisaanBuddy AI Agronomist Chatbot',
    url: 'https://www.kisaanbuddy.com/chatbot',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5. Optional microphone for voice.',
    description:
      'Voice-First Multilingual Agricultural AI Assistant. Answers farming queries on crop diseases, organic remedies, fertilizer schedules, and market prices across 11 Indian regional languages.',
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
          text: 'The assistant understands and replies in 11 languages: Hindi, English, Kannada, Telugu, Tamil, Marathi, Bengali, Gujarati, Punjabi, Malayalam, and Hinglish via both voice and text.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I upload a picture of a diseased crop leaf to the chatbot?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can attach a photo of the affected plant leaf directly in the chat interface. The AI will inspect visible fungal or bacterial symptoms and provide immediate diagnosis and remedies.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the AI chemical dosage recommendations final?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. While our models are trained on scientific agronomic guidelines, crop stage, soil type, and weather conditions vary. Farmers should always cross-verify pesticide concentrations with their local Krishi Vigyan Kendra (KVK) officer and read the manufacturer product label.',
        },
      },
    ],
  };

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

      {/* Crawlable Semantic SEO Overview Header */}
      <section className="rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/60 p-6 md:p-8 shadow-xs space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Bot className="w-3.5 h-3.5" />
            <span>Voice-First AI Agronomist & Farming Companion</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-foreground tracking-tight">
            Ask Your AI Agronomist: Instant Crop Advice in Your Language
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Empowering Indian farmers with instant, conversational agricultural guidance.
            Simply tap the microphone to ask questions about crop health, fertilizer timing, mandi rates, and government schemes in your mother tongue.
          </p>
        </div>

        {/* Semantic Guide: What Farmers Can Ask */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">🌿 Plant Health & Disease</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Identify yellow leaf spots, rust, powdery mildew, and stem borers with organic bio-control and recommended sprays.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">🧪 Fertilizer Schedules</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Calculate exact basal and top-dressing dosages for Urea, DAP, MOP, and Zinc based on crop growth stages.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">📈 Mandi Prices & MSP</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Track live mandi commodity rates across APMC markets and verify current official Minimum Support Prices.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border/50 bg-background space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">🏛️ Govt Schemes & Subsidies</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Check eligibility criteria and required documents for PM-KISAN, KCC loans, PM-Kusum, and crop insurance.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive AI Chat & Voice Assistant Interface */}
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        }
      >
        <ChatbotClient />
      </Suspense>
    </div>
  );
}
