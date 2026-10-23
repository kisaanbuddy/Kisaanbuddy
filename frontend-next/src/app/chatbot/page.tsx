import type { Metadata } from 'next';
import { Suspense } from 'react';
import ChatbotClient from './ChatbotClient';

export const metadata: Metadata = {
  title: 'AI Agronomist Chatbot & Voice Assistant | कृषक चैटबॉट',
  description: 'Ask our smart AI Agronomist questions about crop protection, disease prevention, fertilizer dosage, organic farming, and government schemes in Hindi, English, or Kannada.',
  alternates: {
    canonical: '/chatbot',
  },
  openGraph: {
    title: 'AI Agronomist Chatbot & Voice Assistant | कृषक चैटबॉट',
    description: 'Ask our smart AI Agronomist questions about crop protection, disease prevention, fertilizer dosage, organic farming, and government schemes in Hindi, English, or Kannada.',
    url: '/chatbot',
    type: 'website',
  },
};

export default function ChatbotPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy AI Agronomist Chatbot",
    "url": "https://kisaanbuddy.com/chatbot",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5. Requires microphone access.",
    "description": "Multilingual AI Agricultural Chatbot and Voice Assistant. Speak or type crop protection, soil health, pesticide dosage, and schemes queries in 11 Indian languages."
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
        <ChatbotClient />
      </Suspense>
    </div>
  );
}
