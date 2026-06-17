import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { Founders } from '@/components/landing/Founders';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { Vision } from '@/components/landing/Vision';
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

      {/* 2. Founder Section */}
      <Founders />

      {/* 3. Features Section */}
      <Features />

      {/* 4. How It Works Section */}
      <HowItWorks />

      {/* 5. Interactive Demo Dashboard Preview */}
      <DashboardPreview />

      {/* 6. About Section */}
      <Vision />

      {/* 7. Final Call-to-Action Banner */}
      <FinalCTA />

    </div>
  );
}
