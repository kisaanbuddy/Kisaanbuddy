import type { Metadata } from 'next';
import { PrivacyClient } from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | KrishiAI',
  description: 'Privacy Policy for KrishiAI smart agriculture platform. Read about how we collect, store, and process your soil, location, and crop disease diagnosis data in compliance with Google AdSense and global privacy rules.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | KrishiAI',
    description: 'Privacy policy and data protection terms for KrishiAI users.',
    url: '/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
