import type { Metadata } from 'next';
import FoundersClient from './FoundersClient';

export const metadata: Metadata = {
  title: 'Meet the Founders | KrishiAI',
  description: 'Read about the creators, developers, and visionaries behind KrishiAI smart farming assistance platform.',
  alternates: {
    canonical: '/founders',
  },
  openGraph: {
    title: 'Meet the Founders | KrishiAI',
    description: 'Read about the creators, developers, and visionaries behind KrishiAI smart farming assistance platform.',
    url: '/founders',
    type: 'website',
  },
};

export default function FoundersPage() {
  return <FoundersClient />;
}
