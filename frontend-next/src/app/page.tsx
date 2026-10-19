import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { TrustPanel } from '@/components/landing/TrustPanel';
import { ValueProposition } from '@/components/landing/ValueProposition';
import { FarmerProfileSection } from '@/components/landing/FarmerProfileSection';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { MarketplaceSection } from '@/components/landing/MarketplaceSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { Founders } from '@/components/landing/Founders';
import { FinalCTA } from '@/components/landing/FinalCTA';

export const metadata: Metadata = {
  title: 'KisaanBuddy - Smart Agriculture Advisor | किसान सलाहकार',
  description: "India's dedicated farm intelligence platform. Real-time crop recommendations, eNAM mandi rates, hyperlocal weather advisories, soil health management, and AI crop disease diagnosis.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KisaanBuddy - Smart Agriculture Advisor | किसान सलाहकार',
    description: "India's dedicated farm intelligence platform. Real-time crop recommendations, eNAM mandi rates, hyperlocal weather advisories, soil health management, and AI crop disease diagnosis.",
    url: '/',
    type: 'website',
  }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-0 -mt-10 md:-mt-14 -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Trust Metrics Quick Bar */}
      <TrustPanel />

      {/* 3. Core Value Proposition: Everything Your Farm Needs */}
      <ValueProposition />

      {/* 4. Farmer Profile: Your Farm Has Its Own Digital Identity */}
      <FarmerProfileSection />

      {/* 5. Product Showcase: Built Around Your Real Farming Needs */}
      <ProductShowcase />

      {/* 6. Tools for Every Stage of Farming (9 Core Tools) */}
      <Features />

      {/* 7. How It Works (3-Step Practical Workflow) */}
      <HowItWorks />

      {/* 8. Marketplace: Connect Your Harvest to Market Opportunities */}
      <MarketplaceSection />

      {/* 9. Trust, Science & Data Privacy */}
      <TrustSection />

      {/* 10. Meet the Team / Founders */}
      <Founders />

      {/* 11. Final Call-to-Action Banner */}
      <FinalCTA />

    </div>
  );
}
