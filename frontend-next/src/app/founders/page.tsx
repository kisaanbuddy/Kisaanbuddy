import type { Metadata } from 'next';
import FoundersClient from './FoundersClient';

export const metadata: Metadata = {
  title: 'Meet the Founders | KisaanBuddy',
  description: 'Read about the creators, developers, and visionaries behind KisaanBuddy smart farming assistance platform.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/founders',
  },
  openGraph: {
    title: 'Meet the Founders | KisaanBuddy',
    description: 'Read about the creators, developers, and visionaries behind KisaanBuddy smart farming assistance platform.',
    url: 'https://www.kisaanbuddy.com/founders',
    type: 'website',
  },
};

export default function FoundersPage() {
  return <FoundersClient />;
}
