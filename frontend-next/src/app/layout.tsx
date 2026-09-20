import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AssistantGate } from '@/components/AssistantGate';
import { Analytics } from '@vercel/analytics/react';
import { SwRegister } from '@/components/SwRegister';
import Breadcrumbs from '@/components/Breadcrumbs';
import Script from 'next/script';
import { MobileBottomNav } from '@/components/MobileBottomNav';

/* ---------- System font stacks ----------
 * Replaced next/font/google to avoid build-time downloads from
 * fonts.googleapis.com.  The CSS variables --font-sans and --font-display
 * are consumed by Tailwind (tailwind.config.ts) and globals.css.
 *
 * If Inter / Outfit are installed on the system they will be used;
 * otherwise the browser falls back through the standard system-ui stack.
 */
const FONT_SANS =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';
const FONT_DISPLAY =
  'Outfit, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kisaanbuddy.com'),
  title: 'KisaanBuddy — AI for Every Farmer | Smart Agriculture Platform',
  description: 'AI-powered smart farming for Indian farmers - disease detection, crop prediction, live mandi prices, weather alerts, khet diary and more.',
  keywords: ['agriculture', 'farming', 'AI', 'crop disease', 'mandi prices', 'India', 'kisan', 'KisaanBuddy'],
  verification: {
    google: 'Zj7cIm3Lzc1qehD6ThXe1akgMLDrRU5kRFK6ZYEISlI',
  },
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
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="light"
      suppressHydrationWarning
      style={{ '--font-sans': FONT_SANS, '--font-display': FONT_DISPLAY } as React.CSSProperties}
    >
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "KisaanBuddy",
              "url": "https://kisaanbuddy.com",
              "logo": "https://kisaanbuddy.com/icon-192.svg",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "info@kisaanbuddy.com",
                "contactType": "customer support"
              },
              "sameAs": [
                "https://github.com/kisaanbuddy/Kisaanbuddy",
                "https://www.linkedin.com/in/aditya-ishwar",
                "https://www.linkedin.com/in/utkarsh-sinha",
                "https://www.linkedin.com/in/sanidhya-sharma",
                "https://www.linkedin.com/in/yash-singh-33553b2a5"
              ]
            })
          }}
        />
      </head>
      <body className="font-sans min-h-screen antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-xl z-50 font-bold shadow-lg transition-all"
          >
            सामग्री पर जाएं / Skip to Content
          </a>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-24 md:pb-10">
              <Breadcrumbs />
              {children}
            </main>
            <Footer />
          </div>
          <AssistantGate />
          <SwRegister />
          <Analytics />
          <MobileBottomNav />
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
