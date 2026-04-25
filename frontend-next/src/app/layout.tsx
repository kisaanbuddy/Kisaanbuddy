import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
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
            <header className="sticky top-4 z-50 mx-4 md:mx-auto max-w-6xl w-[calc(100%-2rem)] md:w-full glass-panel flex h-16 items-center justify-between px-6 transition-all">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                <Leaf className="h-6 w-6 text-green-500" />
                <span>Krishi<span className="text-green-500">AI</span></span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link href="/weather" className="hover:text-primary transition-colors">Weather</Link>
                <Link href="/crop-predictor" className="hover:text-primary transition-colors">AI Predictor</Link>
                <Link href="/disease" className="hover:text-primary transition-colors">Disease Detect</Link>
                <Link href="/schemes" className="hover:text-primary transition-colors">Schemes</Link>
                <Link href="/mandi" className="hover:text-primary transition-colors">Mandi</Link>
                <Link href="/worker-connect" className="hover:text-primary transition-colors">Worker Connect</Link>
                <Link href="/chatbot" className="hover:text-primary transition-colors">AI Chatbot</Link>
              </nav>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 border-2 border-white/20 shadow-inner"></div>
              </div>
            </header>
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
