import type { Metadata } from 'next';
import { Suspense } from 'react';
import CropPredictorClient from './CropPredictorClient';
import { Sprout, BrainCircuit, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Crop Predictor & Soil Suitability Recommendation | फसल चयन | KisaanBuddy',
  description:
    'Use scientific machine learning to predict the most profitable crops for your field. Analyze Soil Health Card N-P-K nutrients, soil pH, temperature, and rainfall thresholds for maximum crop yield.',
  alternates: {
    canonical: 'https://www.kisaanbuddy.com/crop-predictor',
  },
  openGraph: {
    title: 'AI Crop Predictor & Soil Suitability Recommendation | KisaanBuddy',
    description:
      'Input Nitrogen, Phosphorus, Potassium, temperature, humidity, pH, and rainfall to let AI models predict the best crop for your farmland.',
    url: 'https://www.kisaanbuddy.com/crop-predictor',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy AI Crop Predictor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Crop Predictor & Soil Suitability Recommendation | KisaanBuddy',
    description:
      'Input Nitrogen, Phosphorus, Potassium, temperature, humidity, pH, and rainfall to let AI models predict the best crop for your farmland.',
    images: ['/logo.png'],
  },
};

export default function CropPredictorPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'KisaanBuddy AI Crop Predictor',
    url: 'https://www.kisaanbuddy.com/crop-predictor',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'Scientific Crop Recommendation Engine. Calculates optimal crop choices by matching Soil Health Card parameters (N, P, K, pH) with local agro-climatic temperature and rainfall data.',
    provider: {
      '@type': 'Organization',
      name: 'KisaanBuddy',
      url: 'https://www.kisaanbuddy.com',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the AI Crop Predictor choose the best crop?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The model analyzes 7 agro-climatic variables: available Soil Nitrogen (N), Phosphorus (P), Potassium (K), soil pH level, ambient temperature, relative humidity, and expected rainfall to match optimal biological growth conditions for specific crops.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where can I find the Nitrogen, Phosphorus, and Potassium values for my field?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can find your field\'s N-P-K nutrient values on your official Government Soil Health Card issued by the Department of Agriculture, or by testing a soil sample at your nearest Krishi Vigyan Kendra (KVK).',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is soil pH critical for crop selection?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Soil pH controls nutrient availability to plant root systems. Soils with pH below 6.0 are acidic and require liming for pulses or wheat, while alkaline soils (pH above 8.0) can lock micronutrients like zinc and iron.',
        },
      },
    ],
  };

  const cropBenchmarks = [
    {
      crop: 'Rice (Paddy)',
      season: 'Kharif',
      nitrogen: '80 - 120 kg/ha',
      ph: '5.5 - 7.0',
      water: 'High (>180 mm)',
      temp: '22°C - 32°C',
    },
    {
      crop: 'Wheat',
      season: 'Rabi',
      nitrogen: '60 - 120 kg/ha',
      ph: '6.0 - 7.5',
      water: 'Moderate (50 - 100 mm)',
      temp: '12°C - 25°C',
    },
    {
      crop: 'Cotton',
      season: 'Kharif',
      nitrogen: '70 - 110 kg/ha',
      ph: '6.5 - 8.0',
      water: 'Moderate (70 - 120 mm)',
      temp: '20°C - 34°C',
    },
    {
      crop: 'Maize',
      season: 'Kharif / Rabi',
      nitrogen: '80 - 120 kg/ha',
      ph: '5.8 - 7.2',
      water: 'Moderate (80 - 160 mm)',
      temp: '18°C - 30°C',
    },
    {
      crop: 'Sugarcane',
      season: 'Annual',
      nitrogen: '100 - 150 kg/ha',
      ph: '6.0 - 7.8',
      water: 'High (>140 mm)',
      temp: '24°C - 35°C',
    },
    {
      crop: 'Potato',
      season: 'Rabi',
      nitrogen: '70 - 100 kg/ha',
      ph: '5.2 - 6.5',
      water: 'Moderate (40 - 80 mm)',
      temp: '12°C - 22°C',
    },
  ];

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Crawlable Semantic Overview (sr-only so interactive tool is first) */}
      <section className="sr-only">
        <h1>Scientific Crop Recommendation & Field Suitability Analysis</h1>
        <p>
          Select suitable crops based on soil chemistry, NPK levels, soil pH, and regional climate parameters.
        </p>
      </section>

      {/* Interactive Crop Prediction Tool & Sliders */}
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        }
      >
        <CropPredictorClient />
      </Suspense>
    </div>
  );
}
