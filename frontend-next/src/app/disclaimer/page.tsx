import type { Metadata } from 'next';
import { DisclaimerClient } from './DisclaimerClient';

export const metadata: Metadata = {
  title: 'Disclaimer | KisaanBuddy',
  description: 'Disclaimer of liability and AI predictions limits for KisaanBuddy. Read about our agricultural predictions limitations, mandi rates alerts, and advisory recommendations verification.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/disclaimer',
  },
  openGraph: {
    title: 'Disclaimer | KisaanBuddy',
    description: 'Advisory and liability disclaimers for the KisaanBuddy smart farming platform.',
    url: 'https://www.kisaanbuddy.com/disclaimer',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}
