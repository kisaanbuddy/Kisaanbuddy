import type { Metadata } from 'next';
import { DisclaimerClient } from './DisclaimerClient';

export const metadata: Metadata = {
  title: 'Disclaimer | KrishiAI',
  description: 'Disclaimer of liability and AI predictions limits for KrishiAI. Read about our agricultural predictions limitations, mandi rates alerts, and advisory recommendations verification.',
  openGraph: {
    title: 'Disclaimer | KrishiAI',
    description: 'Advisory and liability disclaimers for the KrishiAI smart farming platform.',
    url: 'https://krishiaiindia.vercel.app/disclaimer',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}
