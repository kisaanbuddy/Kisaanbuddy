import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { AssistantGate } from '@/components/AssistantGate';
import { Analytics } from '@vercel/analytics/react';
import { SwRegister } from '@/components/SwRegister';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KrishiAI | Smart Agriculture Platform',
  description: 'AI-powered smart farming for Indian farmers - disease detection, crop prediction, live mandi prices, weather alerts and more.',
  keywords: ['agriculture', 'farming', 'AI', 'crop disease', 'mandi prices', 'India', 'kisan'],
  icons: { icon: '/favicon.ico', apple: '/icon-192.svg' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KrishiAI',
  },
  openGraph: {
    title: 'KrishiAI - Smart Agriculture Platform',
    description: 'Empowering Indian farmers with AI-powered tools',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0fdf4' },
    { media: '(prefers-color-scheme: dark)',  color: '#040815' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pt-10 md:pt-14 pb-6">
              {children}
            </main>
          </div>
          <AssistantGate />
          <SwRegister />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
