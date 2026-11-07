import type { Metadata } from 'next';
import { DisclaimerClient } from './DisclaimerClient';

export const metadata: Metadata = {
  title: 'Legal & Agricultural Disclaimer | KisaanBuddy — Real Agricultural Intelligence',
  description: 'Advisory and legal disclaimer for KisaanBuddy. Review guidance regarding AI crop leaf disease diagnosis, live mandi rates, weather data, and the non-governmental status of our platform.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/disclaimer',
  },
  openGraph: {
    title: 'Legal & Agricultural Disclaimer | KisaanBuddy',
    description: 'Advisory scope and legal limits of AI crop recommendations, mandi prices, and weather data on KisaanBuddy.',
    url: 'https://www.kisaanbuddy.com/disclaimer',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}
