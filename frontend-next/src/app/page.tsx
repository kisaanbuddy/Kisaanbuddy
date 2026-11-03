import type { Metadata } from 'next';
import { FarmerHome } from '@/components/farmer/FarmerHome';

export const metadata: Metadata = {
  title: 'KisaanBuddy — Kheti ka har kaam, ab ek hi jagah | Digital Companion for Indian Farmers',
  description:
    'Fasal ki salah paayein, mazdoor dhoondhein, mandi ke bhaav dekhein aur buyers se judein — ek hi platform par. Real-time mandi prices, direct buyer connections, farm workers, crop doctor, and verified government schemes.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KisaanBuddy — Kheti ka har kaam, ab ek hi jagah',
    description:
      'Fasal ki salah paayein, mazdoor dhoondhein, mandi ke bhaav dekhein aur buyers se judein — ek hi platform par.',
    url: '/',
    type: 'website',
  },
};

export default function LandingPage() {
  return <FarmerHome />;
}
