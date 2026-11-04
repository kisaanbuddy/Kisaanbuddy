'use client';

import React, { useEffect } from 'react';
import {
  PRIMARY_FARMER_LANGS,
  SELECTABLE_LANGS,
  LANG_NAMES,
  LANG_DETAILS,
  type Lang,
  type LanguageMeta,
} from '@/lib/language';
import { X, Check, Globe, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Lang;
  onSelect: (lang: Lang) => void;
}

export function LanguageSelectionModal({
  isOpen,
  onClose,
  currentLang,
  onSelect,
}: LanguageSelectionModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (code: Lang) => {
    trackEvent({ type: 'language_switch', from: currentLang, to: code });
    onSelect(code);
    onClose();
  };

  // Additional regional languages supported beyond the primary 8
  const additionalLangs: Lang[] = ['pa', 'ml', 'hi_en'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-language-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 text-stone-900 dark:text-white"
        style={{
          fontFamily:
            'Inter, "Noto Sans Devanagari", "Noto Sans Kannada", "Noto Sans Telugu", "Noto Sans Tamil", "Noto Sans Bengali", "Noto Sans Gujarati", system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 id="modal-language-title" className="text-lg sm:text-xl font-bold tracking-tight">
                भाषा बदलें <span className="text-emerald-600 dark:text-emerald-400 font-semibold">/</span> Change Language
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                अपनी पसंदीदा भाषा चुनें &bull; Select your preferred language
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="बंद करें / Close"
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 8 Primary Language Cards */}
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2.5">
            प्रमुख भारतीय भाषाएं &bull; Primary Languages
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {PRIMARY_FARMER_LANGS.map((langItem: LanguageMeta) => {
              const isSelected = currentLang === langItem.code;
              return (
                <button
                  key={langItem.code}
                  type="button"
                  onClick={() => handleSelect(langItem.code)}
                  className={`group relative flex flex-col items-start justify-between rounded-2xl p-3 text-left transition-all duration-150 outline-hidden min-h-[84px] ${
                    isSelected
                      ? 'border-2 border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {langItem.scriptChar}
                    </span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-600 text-white px-1.5 py-0.5 text-[10px] font-bold">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>सक्रिय</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400 group-hover:text-emerald-600">
                        चुनें
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-col">
                    <span className="text-base font-bold text-stone-900 dark:text-white leading-tight">
                      {langItem.native}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      {langItem.en}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Languages Section */}
        <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
            अन्य क्षेत्रीय भाषाएं &bull; Other Regional Options
          </p>
          <div className="grid grid-cols-3 gap-2">
            {additionalLangs.map((code) => {
              const isSelected = currentLang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-muted'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span>{LANG_NAMES[code]}</span>
                    <span className="text-[10px] text-stone-400 font-normal">{LANG_DETAILS[code]?.en}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-5 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            भाषा बदलते ही तुरंत लागू होगी &bull; Instant update without reload
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 px-3.5 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 transition-colors"
          >
            बंद करें / Done
          </button>
        </div>
      </div>
    </div>
  );
}
