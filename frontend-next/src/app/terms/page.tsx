import type { Metadata } from 'next';
import { TermsClient } from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms & Conditions | KisaanBuddy',
  description: 'Terms and conditions for using KisaanBuddy smart agriculture platform. Read about user obligations, AI diagnostic predictions, liabilities, and intellectual property terms.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/terms',
  },
  openGraph: {
    title: 'Terms & Conditions | KisaanBuddy',
    description: 'Terms of service and user agreements for the KisaanBuddy platform.',
    url: 'https://www.kisaanbuddy.com/terms',
    type: 'website',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
