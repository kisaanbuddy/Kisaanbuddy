import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { TrustPanel } from '@/components/landing/TrustPanel';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhyUs } from '@/components/landing/WhyUs';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { Testimonials } from '@/components/landing/Testimonials';
import { Vision } from '@/components/landing/Vision';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';

export const metadata: Metadata = {
  title: 'KrishiAI - Smart Agriculture Advisor | किसान सलाहकार',
  description: "India's Hindi-first farming intelligence platform. Real-time crop recommendations, eNAM mandi rates, local weather advisories, and crop disease detection.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KrishiAI - Smart Agriculture Advisor | किसान सलाहकार',
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

      {/* Trust Panel */}
      <TrustPanel />

      {/* 2. Features Section */}
      <Features />

      {/* 3. How It Works Section */}
      <HowItWorks />

      {/* 4. Why KrishiAI Statistics Section */}
      <WhyUs />

      {/* 5. Interactive Demo Dashboard Preview */}
      <DashboardPreview />

      {/* 6. Farmer Testimonials */}
      <Testimonials />

      {/* 7. Vision Statement Section */}
      <Vision />

      {/* 8. Frequently Asked Questions Accordion */}
      <FAQ />

      {/* 9. Final Call-to-Action Banner */}
      <FinalCTA />

    </div>
  );
}
