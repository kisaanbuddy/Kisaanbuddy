import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureShowcaseSection } from '@/components/landing/FeatureShowcaseSection';
import { MandiIntelligenceSection } from '@/components/landing/MandiIntelligenceSection';
import { BuySellProduceSection } from '@/components/landing/BuySellProduceSection';
import { WorkersConnectHomeSection } from '@/components/landing/WorkersConnectHomeSection';
import { MarketplaceTrustSection } from '@/components/landing/MarketplaceTrustSection';

export const metadata: Metadata = {
  title: 'KisaanBuddy — Everything You Need to Farm Smarter | Agricultural Services for Indian Farmers',
  description: 'Your complete farming companion. Check real-time mandi prices, connect with buyers, hire farm workers, diagnose crop diseases with AI, and discover government schemes.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KisaanBuddy — Everything You Need to Farm Smarter',
    description: 'Your complete farming companion. Check real-time mandi prices, connect with buyers, hire farm workers, diagnose crop diseases with AI, and discover government schemes.',
    url: '/',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-0 -mt-6 md:-mt-10 -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-hidden">
      
      {/* SECTION 1: HERO — "Everything You Need to Farm Smarter." */}
      <HeroSection />

      {/* SECTION 2: FEATURE SHOWCASE — Clean 8-Card Responsive Agricultural Grid */}
      <FeatureShowcaseSection />

      {/* LIVE WORKFLOW 1: Mandi Price Intelligence & Daily APMC Rates */}
      <MandiIntelligenceSection />

      {/* LIVE WORKFLOW 2: Buy & Sell Agricultural Produce Directly */}
      <BuySellProduceSection />

      {/* LIVE WORKFLOW 3: Workers Connect & Farm Labour Jobs */}
      <WorkersConnectHomeSection />

      {/* INSTITUTIONAL TRUST: Verified Public Integrity & Zero Fabricated Metrics */}
      <MarketplaceTrustSection />

    </div>
  );
}
