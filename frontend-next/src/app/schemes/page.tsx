import type { Metadata } from 'next';
import SchemesClient from './SchemesClient';

export const metadata: Metadata = {
  title: 'Government Agriculture Schemes Eligibility | सरकारी योजनाएं',
  description: 'Search and find government agricultural schemes, subsidy eligibilities, PM-KISAN tracking, and soil testing benefits for Indian farmers.',
  alternates: {
    canonical: '/schemes',
  },
  openGraph: {
    title: 'Government Agriculture Schemes Eligibility | सरकारी योजनाएं',
    description: 'Search and find government agricultural schemes, subsidy eligibilities, PM-KISAN tracking, and soil testing benefits for Indian farmers.',
    url: '/schemes',
    type: 'website',
  },
};

export default function SchemesPage() {
  return <SchemesClient />;
}
