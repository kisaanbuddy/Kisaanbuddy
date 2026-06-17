import type { Metadata } from 'next';
import CropPredictorClient from './CropPredictorClient';

export const metadata: Metadata = {
  title: 'AI Crop Yield Prediction Online | फसल चयन',
  description: 'Input Nitrogen, Phosphorus, Potassium, temperature, humidity, pH, and rainfall to let our Machine Learning models predict the best crop for your farm.',
  alternates: {
    canonical: '/crop-predictor',
  },
  openGraph: {
    title: 'AI Crop Yield Prediction Online | फसल चयन',
    description: 'Input Nitrogen, Phosphorus, Potassium, temperature, humidity, pH, and rainfall to let our Machine Learning models predict the best crop for your farm.',
    url: '/crop-predictor',
    type: 'website',
  },
};

export default function CropPredictorPage() {
  return <CropPredictorClient />;
}
