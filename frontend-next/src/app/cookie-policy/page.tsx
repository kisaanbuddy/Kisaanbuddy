import type { Metadata } from 'next';
import { CookieClient } from './CookieClient';

export const metadata: Metadata = {
  title: 'Cookie Policy | KrishiAI',
  description: 'Cookie Policy for KrishiAI smart agriculture platform. Read about what cookies we use for language preference, session logging, and third-party advertising partners like Google AdSense.',
  alternates: {
    canonical: '/cookie-policy',
  },
  openGraph: {
    title: 'Cookie Policy | KrishiAI',
    description: 'Learn how KrishiAI uses cookies to personalize your smart farming experience.',
    url: '/cookie-policy',
    type: 'website',
  },
};

export default function CookiePolicyPage() {
  return <CookieClient />;
}
