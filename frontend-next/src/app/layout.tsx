import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { AssistantWidget } from '@/components/assistant/AssistantWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KrishiAI | Premium Smart Agriculture',
  description: 'AI Smart Agriculture Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 pt-12 md:pt-16">
              {children}
            </main>
          </div>
          <AssistantWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
