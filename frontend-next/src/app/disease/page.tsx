import type { Metadata } from 'next';
import DiseaseClient from './DiseaseClient';

export const metadata: Metadata = {
  title: 'Crop Leaf Disease Detection Online | फसल की बीमारी की पहचान',
  description: 'Upload a photo of your crop leaf and get instant diagnosis, organic remedies, and chemical treatment guidelines.',
  alternates: {
    canonical: '/disease',
  },
  openGraph: {
    title: 'Crop Leaf Disease Detection Online | फसल की बीमारी की पहचान',
    description: 'Upload a photo of your crop leaf and get instant diagnosis, organic remedies, and chemical treatment guidelines.',
    url: '/disease',
    type: 'website',
  }
};

export default function DiseasePage() {
  return <DiseaseClient />;
}
