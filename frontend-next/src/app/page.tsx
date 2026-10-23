import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/HeroSection';
import { QuickActionsSection } from '@/components/landing/QuickActionsSection';
import { MandiIntelligenceSection } from '@/components/landing/MandiIntelligenceSection';
import { BuySellProduceSection } from '@/components/landing/BuySellProduceSection';
import { WorkersConnectHomeSection } from '@/components/landing/WorkersConnectHomeSection';
import { CropDoctorHomeSection } from '@/components/landing/CropDoctorHomeSection';
import { GovernmentSchemesSection } from '@/components/landing/GovernmentSchemesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { MarketplaceTrustSection } from '@/components/landing/MarketplaceTrustSection';

export const metadata: Metadata = {
  title: 'KisaanBuddy — Kheti ka har kaam, ab ek hi jagah | Digital Companion for Indian Farmers',
  description: 'Fasal ki salah paayein, mazdoor dhoondhein, mandi ke bhaav dekhein aur buyers se judein — ek hi platform par. Real-time mandi prices, direct buyer connections, farm workers, crop doctor, and verified government schemes.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KisaanBuddy — Kheti ka har kaam, ab ek hi jagah',
    description: 'Fasal ki salah paayein, mazdoor dhoondhein, mandi ke bhaav dekhein aur buyers se judein — ek hi platform par.',
    url: '/',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-0 -mt-6 md:-mt-10 -mx-4 sm:-mx-6 lg:-mx-8 overflow-x-hidden">
      
      {/* SECTION 1: HERO — "Kheti ka har kaam, ab ek hi jagah." */}
      <HeroSection />

      {/* SECTION 2: QUICK ACTIONS — 6 Prominent, Consistent Service Cards */}
      <QuickActionsSection />

      {/* SECTION 3: MANDI INTELLIGENCE — Live e-NAM & APMC Market Rates */}
      <MandiIntelligenceSection />

      {/* SECTION 4: MARKETPLACE — Buy & Sell Agricultural Produce Directly */}
      <BuySellProduceSection />

      {/* SECTION 5: WORKERS CONNECT — Find Farm Labour & Sowing/Harvest Crews */}
      <WorkersConnectHomeSection />

      {/* SECTION 6: CROP DOCTOR — Simple Leaf Diagnosis Steps & KVK Escalation */}
      <CropDoctorHomeSection />

      {/* SECTION 7: GOVERNMENT SCHEMES — Benefits, Eligibility & Official Portals */}
      <GovernmentSchemesSection />

      {/* SECTION 8: HOW IT WORKS — 3 Simple Farmer Journey Steps */}
      <HowItWorks />

      {/* SECTION 9: TRUST & TRANSPARENCY — Data Sources & Dispute Resolution */}
      <MarketplaceTrustSection />

    </div>
  );
}
