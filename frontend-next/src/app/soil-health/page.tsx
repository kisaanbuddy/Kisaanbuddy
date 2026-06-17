import type { Metadata } from 'next';
import SoilHealthClient from './SoilHealthClient';

export const metadata: Metadata = {
  title: 'Soil Health & Fertilizer Recommendation AI | मिट्टी परीक्षण',
  description: 'Enter your soil card parameters to receive a detailed soil health report, custom NPK fertilizer dosages, and organic amendments advice.',
  alternates: {
    canonical: '/soil-health',
  },
  openGraph: {
    title: 'Soil Health & Fertilizer Recommendation AI | मिट्टी परीक्षण',
    description: 'Enter your soil card parameters to receive a detailed soil health report, custom NPK fertilizer dosages, and organic amendments advice.',
    url: '/soil-health',
    type: 'website',
  },
};

export default function SoilHealthPage() {
  return <SoilHealthClient />;
}
