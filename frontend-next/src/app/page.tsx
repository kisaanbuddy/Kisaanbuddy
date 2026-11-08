import type { Metadata } from 'next';
import { WorldClassHomePage } from '@/components/home/WorldClassHomePage';

export const metadata: Metadata = {
  title: 'KisaanBuddy — Your Farm. Your Decisions. Smarter with AI | Indian Agriculture Platform',
  description:
    'From crop health diagnosis and weather intelligence to live mandi rates and agricultural services, KisaanBuddy helps Indian farmers make smarter farming decisions.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KisaanBuddy — Your Farm. Your Decisions. Smarter with AI',
    description:
      'From crop health diagnosis and weather intelligence to live mandi rates and agricultural services, KisaanBuddy helps Indian farmers make smarter farming decisions.',
    url: '/',
    type: 'website',
  },
};

export default function LandingPage() {
  return <WorldClassHomePage />;
}
