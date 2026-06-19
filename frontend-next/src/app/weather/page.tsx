import type { Metadata } from 'next';
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
  return <WeatherClient />;
}
