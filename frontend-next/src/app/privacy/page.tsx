import type { Metadata } from 'next';
import { PrivacyClient } from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | KisaanBuddy',
  description: 'Privacy Policy for KisaanBuddy smart agriculture platform. Read about how we collect, store, and process your soil, location, and crop disease diagnosis data in compliance with Google AdSense and global privacy rules.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | KisaanBuddy',
    description: 'Privacy policy and data protection terms for KisaanBuddy users.',
    url: '/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
