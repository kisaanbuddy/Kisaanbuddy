import type { Metadata } from 'next';
import MandiClient from './MandiClient';

export const metadata: Metadata = {
  title: 'Live Mandi Prices & Market Rates | मंडी भाव',
  description: 'Track real-time eNAM mandi market rates for crops across India. Get historical price charts, daily trends, and volume indicators.',
  alternates: {
    canonical: '/mandi',
  },
  openGraph: {
    title: 'Live Mandi Prices & Market Rates | मंडी भाव',
    description: 'Track real-time eNAM mandi market rates for crops across India. Get historical price charts, daily trends, and volume indicators.',
    url: '/mandi',
    type: 'website',
  },
};

export default function MandiPage() {
  return <MandiClient />;
}
