'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/lib/language';
import { AuthProvider } from '@/lib/auth';
import { AuthGate } from '@/components/AuthGate';
import { LanguageGate } from '@/components/language/LanguageGate';
import { FarmerFeedbackProvider } from '@/components/farmer/FarmerFeedbackContext';
import { FarmerFeedbackModal } from '@/components/farmer/FarmerFeedbackModal';
import { MobileMenuProvider } from '@/components/navigation/MobileMenuContext';

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
          {/* LanguageGate: First-time visitors see ONLY the language
              welcome screen.  Placed above AuthGate so that even a
              first-time visitor landing on a protected path
              (e.g. /dashboard via bookmark) sees the language screen
              before any authentication redirect fires. */}
          <LanguageGate>
            <FarmerFeedbackProvider>
              <MobileMenuProvider>
                <AuthGate>{children}</AuthGate>
                <FarmerFeedbackModal />
              </MobileMenuProvider>
            </FarmerFeedbackProvider>
          </LanguageGate>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
