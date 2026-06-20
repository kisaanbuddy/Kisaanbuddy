import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AssistantGate } from '@/components/AssistantGate';
import { Analytics } from '@vercel/analytics/react';
import { SwRegister } from '@/components/SwRegister';
import Breadcrumbs from '@/components/Breadcrumbs';
import Script from 'next/script';
 
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kisaanbuddy.com'),
  title: 'KisaanBuddy — AI for Every Farmer | Smart Agriculture Platform',
  description: 'AI-powered smart farming for Indian farmers - disease detection, crop prediction, live mandi prices, weather alerts, khet diary and more.',
  keywords: ['agriculture', 'farming', 'AI', 'crop disease', 'mandi prices', 'India', 'kisan', 'KisaanBuddy'],
  icons: { icon: '/favicon.ico', apple: '/icon-192.svg' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KisaanBuddy',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KisaanBuddy — AI for Every Farmer',
    description: 'Empowering Indian farmers with AI-powered tools',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'KisaanBuddy — AI for Every Farmer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KisaanBuddy — AI for Every Farmer',
    description: 'Empowering Indian farmers with AI-powered tools',
    images: ['/logo.png'],
  },
  other: {
    'google-adsense-account': 'ca-pub-3770486100255800',
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "KisaanBuddy",
              "url": "https://kisaanbuddy.com",
              "description": "AI-powered smart farming for Indian farmers - disease detection, crop prediction, live mandi prices, weather alerts, khet diary and more.",
              "inLanguage": ["en", "hi", "kn", "ta", "te", "ml", "mr", "bn", "pa", "gu"]
            })
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-xl z-50 font-bold shadow-lg transition-all"
          >
            सामग्री पर जाएं / Skip to Content
          </a>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pt-10 md:pt-14 pb-6">
              <Breadcrumbs />
              {children}
            </main>
            <Footer />
          </div>
          <AssistantGate />
          <SwRegister />
          <Analytics />
          <Script
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3770486100255800"
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        </Providers>
      </body>
    </html>
  );
}
