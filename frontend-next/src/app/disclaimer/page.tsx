import type { Metadata } from 'next';
import { DisclaimerClient } from './DisclaimerClient';

export const metadata: Metadata = {
  title: 'Disclaimer | KrishiAI',
  description: 'Disclaimer of liability and AI predictions limits for KrishiAI. Read about our agricultural predictions limitations, mandi rates alerts, and advisory recommendations verification.',
  alternates: {
    canonical: '/disclaimer',
  },
  openGraph: {
    title: 'Disclaimer | KrishiAI',
    description: 'Advisory and liability disclaimers for the KrishiAI smart farming platform.',
    url: '/disclaimer',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}
