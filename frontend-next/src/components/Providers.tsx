'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/lib/language';
import { AuthProvider } from '@/lib/auth';
import { AuthGate } from '@/components/AuthGate';
import { LanguageGate } from '@/components/language/LanguageGate';
import { FarmerFeedbackProvider } from '@/components/farmer/FarmerFeedbackContext';
import { FarmerFeedbackModal } from '@/components/farmer/FarmerFeedbackModal';
import { MobileMenuProvider } from '@/components/navigation/MobileMenuContext';
import { CartProvider } from '@/lib/cart/CartContext';
import { VoiceProvider } from '@/lib/voice/VoiceContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="kisaanbuddy-theme"
        >
          {/* LanguageGate: First-time visitors see welcome if fresh session */}
          <LanguageGate>
            <CartProvider>
              <VoiceProvider>
                <FarmerFeedbackProvider>
                  <MobileMenuProvider>
                    <AuthGate>{children}</AuthGate>
                    <FarmerFeedbackModal />
                  </MobileMenuProvider>
                </FarmerFeedbackProvider>
              </VoiceProvider>
            </CartProvider>
          </LanguageGate>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
