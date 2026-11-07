import type { Metadata } from 'next';
import { EditorialPolicyClient } from './EditorialPolicyClient';

export const metadata: Metadata = {
  title: 'Editorial & Data Sources Policy | KisaanBuddy — Real Agricultural Intelligence',
  description: 'Our non-negotiable Reality-First policy: verified agricultural data sourcing, strict separation of reference models from live commercial listings, data provenance, and error correction standards.',
  alternates: {
    canonical: '/editorial-policy',
  },
  openGraph: {
    title: 'Editorial & Data Sources Policy | KisaanBuddy',
    description: 'Learn how KisaanBuddy enforces genuine agricultural data, authentic listings, and strict provenance across India.',
    url: '/editorial-policy',
    type: 'website',
  },
};

export default function EditorialPolicyPage() {
  return <EditorialPolicyClient />;
}
