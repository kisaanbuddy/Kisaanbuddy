import type { Metadata } from 'next';
import { CookieClient } from './CookieClient';

export const metadata: Metadata = {
  title: 'Cookie Policy | KisaanBuddy',
  description: 'Cookie Policy for KisaanBuddy smart agriculture platform. Read about what cookies we use for language preference, session logging, and third-party advertising partners like Google AdSense.',
  alternates: {
    canonical: '/cookie-policy',
  },
  openGraph: {
    title: 'Cookie Policy | KisaanBuddy',
    description: 'Learn how KisaanBuddy uses cookies to personalize your smart farming experience.',
    url: '/cookie-policy',
    type: 'website',
  },
};

export default function CookiePolicyPage() {
  return <CookieClient />;
}
