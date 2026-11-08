import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Footer } from '@/components/Footer';
import { AssistantGate } from '@/components/AssistantGate';
import { Analytics } from '@vercel/analytics/react';
import { SwRegister } from '@/components/SwRegister';
import Breadcrumbs from '@/components/Breadcrumbs';
import { DeferredAdSense } from '@/components/DeferredAdSense';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileMenuDrawer } from '@/components/navigation/MobileMenuDrawer';
import { AppNavigationShell } from '@/components/navigation/AppNavigationShell';
import { AnnouncementPopup } from '@/components/announcement/AnnouncementPopup';



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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kisaanbuddy.com'),
  title: 'KisaanBuddy — Kheti ka har kaam, ab ek hi jagah | Agriculture Platform',
  description: 'A practical digital companion for Indian farmers that brings crop advice, live mandi rates, farm labour connections, and useful agricultural services together.',
  keywords: ['agriculture', 'farming', 'AI', 'crop disease', 'mandi prices', 'India', 'kisan', 'KisaanBuddy'],
  verification: {
    google: "kfmlZ8-_aU6xz_Fa2Av0DMUDhujjqvjIMIj948TZFns" ,
  },
  icons: { icon: '/favicon.ico', apple: '/icon-192.svg' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KisaanBuddy',
  },
  openGraph: {
    title: 'KisaanBuddy — Kheti ka har kaam, ab ek hi jagah',
    description: 'A practical digital companion for Indian farmers bringing crop advice, mandi rates, and agricultural services together.',
    type: 'website',
    url: 'https://www.kisaanbuddy.com',
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
    title: 'KisaanBuddy — Kheti ka har kaam, ab ek hi jagah',
    description: 'A practical digital companion for Indian farmers bringing crop advice, mandi rates, and agricultural services together.',
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
        <link
          rel="preload"
          as="image"
          href="/images/hero/hero-indian-farmer-mobile.webp"
          type="image/webp"
          fetchPriority="high"
          media="(max-width: 640px)"
        />
        <link
          rel="preload"
          as="image"
          href="/images/hero/hero-indian-farmer.webp"
          type="image/webp"
          fetchPriority="high"
          media="(min-width: 641px)"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "KisaanBuddy",
              "url": "https://www.kisaanbuddy.com",
              "description": "A practical digital companion for Indian farmers that brings crop advice, live mandi rates, farm labour connections, and useful agricultural services together.",
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
              "url": "https://www.kisaanbuddy.com",
              "logo": "https://www.kisaanbuddy.com/icon-192.svg",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.removeItem('kisaanbuddy_lang');
                  localStorage.removeItem('KisaanBuddy_lang');
                  localStorage.removeItem('krishi_lang');
                  document.cookie = 'kisaanbuddy_lang=; Path=/; Max-Age=0; SameSite=Lax';

                  var sessionLang = sessionStorage.getItem('kisaanbuddy_session_lang');
                  if (!sessionLang) {
                    document.documentElement.classList.add('kb-fresh-session');
                  } else {
                    document.documentElement.lang = sessionLang;
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <noscript>
          <style>{`html.kb-fresh-session .app-shell-container, .kb-session-pending { display: block !important; }`}</style>
        </noscript>
      </head>
      <body className="font-sans min-h-screen antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-xl z-50 font-bold shadow-lg transition-all"
          >
            सामग्री पर जाएं / Skip to Content
          </a>
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <AppNavigationShell />
            <main
              id="main-content"
              className="app-main flex-1 w-full page-gutter pt-4 md:pt-6 pb-24 md:pb-12"
            >
              <Breadcrumbs />
              {children}
            </main>
            <Footer />
          </div>
          <AnnouncementPopup />
          <AssistantGate />
          <SwRegister />
          <Analytics />
          <MobileMenuDrawer />
          <MobileBottomNav />
          <DeferredAdSense />
        </Providers>
      </body>
    </html>
  );
}
