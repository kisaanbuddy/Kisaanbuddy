import type { Metadata } from 'next';
import { CookieClient } from './CookieClient';

export const metadata: Metadata = {
  title: 'Cookie Policy | KisaanBuddy — Real Agricultural Intelligence',
  description: 'Cookie Policy for KisaanBuddy. Detailed disclosures regarding strictly essential, preference, analytical telemetry, and Google AdSense advertising cookies.',
  alternates: {
    canonical: '/cookie-policy',
  },
  openGraph: {
    title: 'Cookie Policy | KisaanBuddy',
    description: 'Learn about cookies, local storage technologies, and how to manage your privacy choices on KisaanBuddy.',
    url: '/cookie-policy',
    type: 'website',
  },
};

export default function CookiePolicyPage() {
  return <CookieClient />;
}
