'use client';

import React, { useState } from 'react';
import { PRIMARY_FARMER_LANGS, type Lang, type LanguageMeta } from '@/lib/language';
import { Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface FarmerLanguageWelcomeScreenProps {
  onSelect: (lang: Lang) => void;
}

export function FarmerLanguageWelcomeScreen({ onSelect }: FarmerLanguageWelcomeScreenProps) {
  const [selectedCode, setSelectedCode] = useState<Lang | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardClick = (langCode: Lang) => {
    if (isSubmitting) return;
    setSelectedCode(langCode);
  };

  const handleContinue = () => {
    if (!selectedCode || isSubmitting) return;
    setIsSubmitting(true);
    // Smooth transition
    setTimeout(() => {
      onSelect(selectedCode);
    }, 200);
  };

  const selectedMeta = PRIMARY_FARMER_LANGS.find((l) => l.code === selectedCode);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="अपनी भाषा चुनें / Choose your language"
      className="fixed inset-0 z-[9999] flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#f3f9f4] via-[#ffffff] to-[#fbf7ee] text-stone-900 select-none antialiased"
      style={{
        fontFamily:
          'Inter, "Noto Sans Devanagari", "Noto Sans Kannada", "Noto Sans Telugu", "Noto Sans Tamil", "Noto Sans Bengali", "Noto Sans Gujarati", system-ui, sans-serif',
      }}
    >
      {/* Decorative ambient background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-40">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
        {/* Brand Header */}
        <div className="mb-5 flex flex-col items-center text-center sm:mb-6">
          <div className="mb-2.5 flex items-center justify-center gap-2 rounded-full border border-emerald-600/15 bg-white/90 px-4 py-1 shadow-xs backdrop-blur-sm">
            <span className="text-xl">🌱</span>
            <span className="font-display text-lg font-black tracking-tight sm:text-xl">
              <span className="text-stone-900">Kisaan</span>
              <span className="text-emerald-700">Buddy</span>
            </span>
          </div>

          {/* Welcoming Heading */}
          <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-4xl md:text-[2.5rem] leading-tight">
            अपनी भाषा चुनें
          </h1>
          <p className="text-base font-bold text-stone-800 sm:text-xl mt-0.5">
            Choose your language
          </p>

          {/* Multilingual / Farmer supporting text */}
          <p className="mt-2 max-w-xl text-xs sm:text-sm font-medium text-stone-600 leading-relaxed">
            आप अपनी पसंद की भाषा में KisaanBuddy इस्तेमाल कर सकते हैं।
          </p>
          <p className="text-[11px] sm:text-xs text-stone-500 font-normal">
            Use KisaanBuddy in the language you are most comfortable with.
          </p>
        </div>

        {/* 8 Language Selection Cards Grid */}
        <div
          role="radiogroup"
          aria-label="उपलब्ध भाषाएं / Available languages"
          className="grid w-full grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-4 max-w-3xl"
        >
          {PRIMARY_FARMER_LANGS.map((langItem: LanguageMeta) => {
            const isSelected = selectedCode === langItem.code;
            return (
              <button
                key={langItem.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleCardClick(langItem.code)}
                disabled={isSubmitting}
                className={`group relative flex flex-col items-start justify-between rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-150 outline-hidden min-h-[92px] sm:min-h-[104px] cursor-pointer ${
                  isSelected
                    ? 'scale-[1.02] border-2 border-emerald-600 bg-white ring-4 ring-emerald-600/20 shadow-md shadow-emerald-700/15'
                    : 'border border-stone-200/90 bg-white/95 hover:border-emerald-500 hover:bg-emerald-50/40 hover:scale-[1.01] active:scale-[0.98]'
                }`}
              >
                {/* Top Row: Script Character Badge & Selection Checkmark */}
                <div className="flex w-full items-center justify-between">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl font-bold transition-colors ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50 border border-emerald-200/70 text-emerald-800 group-hover:bg-emerald-100 group-hover:text-emerald-900'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{langItem.scriptChar}</span>
                  </div>

                  {/* Active Indicator or Subtle Radio Circle */}
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white scale-110 shadow-xs'
                        : 'border border-stone-300 bg-stone-50 group-hover:border-emerald-400'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Bottom Details: Native Name & English Name */}
                <div className="mt-2.5 flex flex-col">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-emerald-900 leading-snug">
                    {langItem.native}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-stone-500 group-hover:text-stone-700">
                      {langItem.en}
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      &bull; {langItem.region}
                    </span>
                  </div>
                </div>

                {/* Subtle highlight border pulse on tap */}
                {isSelected && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-emerald-600 animate-pulse pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button: आगे बढ़ें / Continue */}
        <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-sm">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedCode || isSubmitting}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 font-extrabold text-sm sm:text-base shadow-md transition-all duration-200 ${
              selectedCode && !isSubmitting
                ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-emerald-700/25 cursor-pointer active:scale-[0.98]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300/50 shadow-none'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>{selectedMeta?.greeting || 'लोड हो रहा है...'}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>आगे बढ़ें / Continue</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
          
          <p className="text-[11px] text-stone-500 font-medium text-center">
            {selectedCode 
              ? `चयनित: ${selectedMeta?.native} (${selectedMeta?.en})`
              : 'आगे बढ़ने के लिए कोई एक भाषा चुनें / Select a language to proceed'}
          </p>
        </div>
      </main>

      {/* Footer Trust Strip */}
      <footer className="relative z-10 border-t border-stone-200/80 bg-white/70 py-3 px-4 text-center backdrop-blur-xs">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] sm:text-xs font-semibold text-stone-600">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            100% निःशुल्क कृषि सेवा &bull; Free Agricultural Services
          </span>
          <span className="hidden sm:inline text-stone-300">&bull;</span>
          <span>बिना किसी पंजीकरण के सीधे उपयोग &bull; No Login Required</span>
          <span className="hidden sm:inline text-stone-300">&bull;</span>
          <span className="text-emerald-800">🌾 भारत के किसानों के लिए समर्पित</span>
        </div>
      </footer>
    </div>
  );
}
