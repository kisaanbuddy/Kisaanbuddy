import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { AssistantGate } from '@/components/AssistantGate';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KrishiAI | Smart Agriculture Platform',
  description: 'AI-powered smart farming for Indian farmers — disease detection, crop prediction, live mandi prices, weather alerts and more.',
  keywords: ['agriculture', 'farming', 'AI', 'crop disease', 'mandi prices', 'India', 'kisan'],
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'KrishiAI — Smart Agriculture Platform',
    description: 'Empowering Indian farmers with AI-powered tools',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0fdf4' },
    { media: '(prefers-color-scheme: dark)',  color: '#030e07' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pt-10 md:pt-14 pb-6">
              {children}
            </main>
          </div>
          <AssistantGate />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
