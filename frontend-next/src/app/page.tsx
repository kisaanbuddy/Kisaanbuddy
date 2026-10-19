import type { Metadata } from 'next';
import { MarketplaceHero } from '@/components/landing/MarketplaceHero';
import { MandiIntelligenceSection } from '@/components/landing/MandiIntelligenceSection';
import { BuySellProduceSection } from '@/components/landing/BuySellProduceSection';
import { WorkersConnectHomeSection } from '@/components/landing/WorkersConnectHomeSection';
import { EquipmentCatalogueSection } from '@/components/landing/EquipmentCatalogueSection';
import { FarmingIntelligenceSection } from '@/components/landing/FarmingIntelligenceSection';
import { GovernmentSchemesSection } from '@/components/landing/GovernmentSchemesSection';
import { MarketplaceTrustSection } from '@/components/landing/MarketplaceTrustSection';

export const metadata: Metadata = {
  title: 'KisaanBuddy — Agricultural Marketplace & Farm Intelligence for Indian Farmers',
  description: 'Connect with verified buyers, track live e-NAM mandi prices, hire farm workers and harvester crews, explore agricultural equipment, and access AI crop advisory.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KisaanBuddy — Agricultural Marketplace & Farm Intelligence for Indian Farmers',
    description: 'Connect with verified buyers, track live e-NAM mandi prices, hire farm workers and harvester crews, explore agricultural equipment, and access AI crop advisory.',
    url: '/',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-0 -mt-6 md:-mt-10 -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-hidden">
      
      {/* 1. Marketplace Hero: Your Farm. Your Market. Better Opportunities. */}
      <MarketplaceHero />

      {/* 2. Primary Priority: Mandi Bhav & Market Intelligence (Immediately after Hero) */}
      <MandiIntelligenceSection />

      {/* 3. Primary Priority: Buy & Sell Agricultural Produce (Two clear pathways) */}
      <BuySellProduceSection />

      {/* 4. Secondary Priority: Workers Connect & Farm Jobs (Prominent two-card structure) */}
      <WorkersConnectHomeSection />

      {/* 5. Supporting Feature: Agricultural Equipment Catalogue */}
      <EquipmentCatalogueSection />

      {/* 6. Supporting Feature: Farming Intelligence & AI Advisory (No standalone weather card) */}
      <FarmingIntelligenceSection />

      {/* 7. Official Resources: Government Schemes & Subsidies */}
      <GovernmentSchemesSection />

      {/* 8. Trust & Marketplace Transparency: Verified Public Data & Zero Fabricated Metrics */}
      <MarketplaceTrustSection />

    </div>
  );
}
