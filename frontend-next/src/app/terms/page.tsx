import type { Metadata } from 'next';
import { TermsClient } from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms & Conditions | KisaanBuddy — Real Agricultural Intelligence',
  description: 'Official Terms and Conditions for KisaanBuddy. Review platform governance, agricultural marketplace terms, seller responsibilities, reality-first authenticity rules, and dispute resolution.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | KisaanBuddy',
    description: 'Platform governance, marketplace terms, and user guidelines for KisaanBuddy smart agricultural platform.',
    url: 'https://www.kisaanbuddy.com/terms',
    type: 'website',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
