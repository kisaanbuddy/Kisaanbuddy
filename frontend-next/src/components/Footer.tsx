'use client';

import Link from 'next/link';
import {
  Heart,
  Store,
  Users,
  Wrench,
  ShieldCheck,
  Mail,
  MapPin,
  Globe,
  MessageSquareHeart,
  ChevronDown,
} from 'lucide-react';
import { useLanguage, LANG_NAMES } from '@/lib/language';
import { useFarmerFeedback } from '@/components/farmer/FarmerFeedbackContext';
import { useState } from 'react';

export function Footer() {
  const { lang, openLanguageModal } = useLanguage();
  const { openFeedback } = useFarmerFeedback();
  const [showLegalMenu, setShowLegalMenu] = useState(false);

  return (
    <footer className="w-full relative border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
        
        {/* Main Horizontal Row: Left (Brand & Tagline) | Center (4 Nav Links) | Right (Tools & Language) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* LEFT: Logo & Short Tagline */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1.5 shrink-0">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <img
                src="/logo.webp"
                alt="KisaanBuddy Logo"
                width={28}
                height={28}
                className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-display text-lg tracking-tight">
                <span className="font-black text-stone-900 dark:text-white">Kisaan</span>
                <span className="font-extrabold text-[#0f5132] dark:text-emerald-400">Buddy</span>
              </span>
            </Link>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm leading-relaxed">
              India&apos;s agricultural marketplace connecting farmers, buyers and farm services.
            </p>
          </div>

          {/* CENTER: Four Primary Navigation Links with Forest-Green Icons */}
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" aria-label="Footer navigation">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#0f5132] dark:hover:text-emerald-300 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-stone-200/70 dark:border-stone-800 transition-all shadow-2xs group"
            >
              <Store className="w-4 h-4 text-[#0f5132] dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Marketplace</span>
            </Link>

            <Link
              href="/worker-connect"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#0f5132] dark:hover:text-emerald-300 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-stone-200/70 dark:border-stone-800 transition-all shadow-2xs group"
            >
              <Users className="w-4 h-4 text-[#0f5132] dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>AgriLabour</span>
            </Link>

            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#0f5132] dark:hover:text-emerald-300 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-stone-200/70 dark:border-stone-800 transition-all shadow-2xs group"
            >
              <Wrench className="w-4 h-4 text-[#0f5132] dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Farming Tools</span>
            </Link>

            {/* Official & Legal with Quick Popover/Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLegalMenu(!showLegalMenu)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#0f5132] dark:hover:text-emerald-300 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-stone-200/70 dark:border-stone-800 transition-all shadow-2xs group cursor-pointer"
                aria-expanded={showLegalMenu}
              >
                <ShieldCheck className="w-4 h-4 text-[#0f5132] dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Official &amp; Legal</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${showLegalMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLegalMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLegalMenu(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50 text-xs font-semibold space-y-0.5">
                    <Link
                      href="/privacy"
                      onClick={() => setShowLegalMenu(false)}
                      className="block px-3.5 py-1.5 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-[#0f5132] dark:hover:text-emerald-300 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/terms"
                      onClick={() => setShowLegalMenu(false)}
                      className="block px-3.5 py-1.5 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-[#0f5132] dark:hover:text-emerald-300 transition-colors"
                    >
                      Terms &amp; Conditions
                    </Link>
                    <Link
                      href="/disclaimer"
                      onClick={() => setShowLegalMenu(false)}
                      className="block px-3.5 py-1.5 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-[#0f5132] dark:hover:text-emerald-300 transition-colors"
                    >
                      Legal Disclaimer
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setShowLegalMenu(false)}
                      className="block px-3.5 py-1.5 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-[#0f5132] dark:hover:text-emerald-300 transition-colors"
                    >
                      About Us &amp; Mission
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* RIGHT: Language Switcher & Feedback */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openLanguageModal()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-emerald-500 hover:text-[#0f5132] dark:hover:text-emerald-400 transition-colors shadow-2xs cursor-pointer"
              aria-label={`भाषा बदलें / Change Language (Current: ${LANG_NAMES[lang]})`}
            >
              <Globe className="h-3.5 w-3.5 text-[#0f5132] dark:text-emerald-400" />
              <span>🌐 {LANG_NAMES[lang] || 'Language'}</span>
            </button>

            <button
              type="button"
              onClick={() => openFeedback()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-emerald-500 hover:text-[#0f5132] dark:hover:text-emerald-400 transition-colors shadow-2xs cursor-pointer"
              title="Help Us Improve"
            >
              <MessageSquareHeart className="h-3.5 w-3.5 text-[#0f5132] dark:text-emerald-400" />
              <span>Feedback</span>
            </button>
          </div>

        </div>

        {/* Thin Subtle Divider */}
        <div className="border-t border-stone-200/80 dark:border-stone-800/80 my-5" />

        {/* BOTTOM: Contact Email, One Genuine Address, Made in India & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400 font-medium text-center md:text-left">
          
          {/* Contact Email & Business Address */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5">
            <a
              href="mailto:info@kisaanbuddy.com"
              className="inline-flex items-center gap-1.5 hover:text-[#0f5132] dark:hover:text-emerald-400 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-[#0f5132] dark:text-emerald-400 shrink-0" />
              <span>info@kisaanbuddy.com</span>
            </a>

            <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>

            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#0f5132] dark:text-emerald-400 shrink-0" />
              <span>Patliputra Industrial Area, Patna, Bihar - 800013</span>
            </span>
          </div>

          {/* Dedication & Copyright */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <span>Made with dedication in India</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
            </span>

            <span className="text-stone-300 dark:text-stone-700">•</span>

            <span>Copyright © 2026 KisaanBuddy. All Rights Reserved.</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
