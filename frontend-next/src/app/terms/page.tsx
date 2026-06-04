import type { Metadata } from 'next';
import { TermsClient } from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms & Conditions | KrishiAI',
  description: 'Terms and conditions for using KrishiAI smart agriculture platform. Read about user obligations, AI diagnostic predictions, liabilities, and intellectual property terms.',
  openGraph: {
    title: 'Terms & Conditions | KrishiAI',
    description: 'Terms of service and user agreements for the KrishiAI platform.',
    url: 'https://krishiaiindia.vercel.app/terms',
    type: 'website',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
