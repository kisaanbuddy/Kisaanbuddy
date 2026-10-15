import type { Metadata } from 'next';
import { Suspense } from 'react';
import WeatherClient from './WeatherClient';

export const metadata: Metadata = {
  title: 'Farm Weather Forecast | KisaanBuddy',
  description: 'Get real-time weather forecasts, humidity, wind speeds, and hyper-local agricultural weather advice for your crops.',
  alternates: {
    canonical: '/weather',
  },
  openGraph: {
    title: 'Farm Weather Forecast | KisaanBuddy',
    description: 'Get real-time weather forecasts, humidity, wind speeds, and hyper-local agricultural weather advice for your crops.',
    url: '/weather',
    type: 'website',
  },
};

export default function WeatherPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KisaanBuddy Farm Weather Forecast",
    "url": "https://kisaanbuddy.com/weather",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5. Requires location access.",
    "description": "Hyper-local Farm Weather Forecasting Tool. Get real-time agricultural weather forecasts, humidity, wind speed, and tailored spray advisories."
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <Suspense fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }>
        <WeatherClient />
      </Suspense>
    </div>
  );
}
