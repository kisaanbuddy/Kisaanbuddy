'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/lib/language';
import { AuthProvider } from '@/lib/auth';
import { AuthGate } from '@/components/AuthGate';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          storageKey="kisaanbuddy-theme"
        >
          <AuthGate>{children}</AuthGate>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
