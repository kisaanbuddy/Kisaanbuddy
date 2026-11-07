import type { Metadata } from 'next';
import { PrivacyClient } from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | KisaanBuddy — Real Agricultural Intelligence',
  description: 'Comprehensive Privacy Policy for KisaanBuddy. Learn how we protect farm data, crop photos, voice inputs, location privacy, and ensure full Google AdSense and DPDP Act compliance.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | KisaanBuddy',
    description: 'Learn how KisaanBuddy safeguards Indian farmer data, crop photographs, voice inputs, and complies with Google AdSense privacy policies.',
    url: '/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
