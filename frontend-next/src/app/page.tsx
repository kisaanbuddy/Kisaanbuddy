import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { TrustPanel } from '@/components/landing/TrustPanel';
import { Founders } from '@/components/landing/Founders';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { Technology } from '@/components/landing/Technology';
import { FinalCTA } from '@/components/landing/FinalCTA';

export const metadata: Metadata = {
  title: 'Kisaan Buddy - Smart Agriculture Advisor | किसान सलाहकार',
  description: "India's Hindi-first farming intelligence platform. Real-time crop recommendations, eNAM mandi rates, local weather advisories, and crop disease detection.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Kisaan Buddy - Smart Agriculture Advisor | किसान सलाहकार',
    description: "India's Hindi-first farming intelligence platform. Real-time crop recommendations, eNAM mandi rates, local weather advisories, and crop disease detection.",
    url: '/',
    type: 'website',
  }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-0 -mt-10 md:-mt-14 -mx-4 md:-mx-8 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Trust Metrics Section */}
      <TrustPanel />

      {/* 3. Founder Section */}
      <Founders />

      {/* 4. Features Section */}
      <Features />

      {/* 5. Testimonials Section - Hidden for AdSense compliance until 3-5 genuine reviews exist */}
      {/* <Testimonials /> */}

      {/* 6. Technology Flow Section */}
      <Technology />

      {/* 7. Final Call-to-Action Banner */}
      <FinalCTA />

    </div>
  );
}
