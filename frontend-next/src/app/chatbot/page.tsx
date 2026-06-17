import type { Metadata } from 'next';
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
  return <ChatbotClient />;
}
