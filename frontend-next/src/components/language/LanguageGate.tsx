'use client';

import React from 'react';
import { useLanguage } from '@/lib/language';
import { FarmerLanguageWelcomeScreen } from './FarmerLanguageWelcomeScreen';
import { LanguageSelectionModal } from './LanguageSelectionModal';

export function LanguageGate({ children }: { children: React.ReactNode }) {
  const {
    isReady,
    isLanguageSelected,
    lang,
    setLang,
    isLanguageModalOpen,
    closeLanguageModal,
  } = useLanguage();

  // 1. While determining storage/cookie state on client
  if (!isReady) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#f3f9f4] via-white to-[#fbf7ee]"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200 text-2xl shadow-xs">
            🌱
          </div>
          <span className="font-display font-black text-xl tracking-tight text-stone-900">
            Kisaan<span className="text-emerald-700">Buddy</span>
          </span>
        </div>
      </div>
    );
  }

  // 2. First-time visitor: MUST show ONLY the language selection screen.
  // The normal homepage, navbar, footer, etc. are NOT rendered.
  if (!isLanguageSelected) {
    return (
      <FarmerLanguageWelcomeScreen
        onSelect={(selectedLang) => {
          setLang(selectedLang);
        }}
      />
    );
  }

  // 3. Returning visitor or once language is selected: render the full application
  return (
    <>
      {children}
      <LanguageSelectionModal
        isOpen={isLanguageModalOpen}
        onClose={closeLanguageModal}
        currentLang={lang}
        onSelect={(selectedLang) => {
          setLang(selectedLang);
        }}
      />
    </>
  );
}
