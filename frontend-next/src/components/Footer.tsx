'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Leaf,
  TrendingUp,
  CloudSun,
  Lock,
  FileText,
  AlertTriangle,
  Cookie,
  BookOpen,
  Info,
  Compass,
  Building2,
  ChevronRight,
  Sparkles,
  Phone,
} from 'lucide-react';
import { useLanguage, LANG_NAMES } from '@/lib/language';
import { useFarmerFeedback } from '@/components/farmer/FarmerFeedbackContext';

export function Footer() {
  const pathname = usePathname();
  const { lang, openLanguageModal } = useLanguage();
  const { openFeedback } = useFarmerFeedback();

  if (pathname === '/chatbot' || pathname?.startsWith('/chatbot/')) {
    return null;
  }

  return (
    <footer
      className="w-full relative border-t border-emerald-900/10 dark:border-stone-800 bg-white dark:bg-stone-950 mt-auto text-stone-700 dark:text-stone-300 transition-colors"
      role="contentinfo"
      aria-label="KisaanBuddy Platform Footer"
    >
      {/* Top Agricultural Reality & Trust Banner */}
      <div className="border-b border-emerald-900/10 dark:border-stone-800 bg-emerald-50/40 dark:bg-emerald-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Reality-First Platform</span>
              </span>
              <span className="text-stone-600 dark:text-stone-300 font-medium text-center md:text-left">
                Every product, mandi price, and diagnostic advisory is backed by authentic data sources.
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-stone-500 dark:text-stone-400 font-medium">
              <button
                type="button"
                onClick={() => openLanguageModal()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-900/10 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:border-emerald-600/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all shadow-2xs cursor-pointer font-semibold"
                aria-label={`भाषा बदलें / Select Language (Current: ${LANG_NAMES[lang] || 'English'})`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>🌐 {LANG_NAMES[lang] || 'Language'}</span>
              </button>

              <button
                type="button"
                onClick={() => openFeedback()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-900/10 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:border-emerald-600/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all shadow-2xs cursor-pointer font-semibold"
                title="Share suggestions or report inaccurate data"
              >
                <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Farmer Feedback</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Four-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* ========================================================= */}
          {/* SECTION 1: ABOUT KISAANBUDDY (Span 4 on LG)               */}
          {/* ========================================================= */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo.webp"
                alt="KisaanBuddy Brand Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-display text-xl tracking-tight">
                <span className="font-black text-stone-900 dark:text-white">Kisaan</span>
                <span className="font-black text-[#0f5132] dark:text-emerald-400">Buddy</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-md">
              KisaanBuddy is an authentic agricultural technology platform purpose-built for Indian farmers. We bridge farm-level challenges with transparent mandi prices, genuine equipment and crop marketplace listings, certified crop leaf diagnosis, and agricultural labour coordination.
            </p>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-md">
              Built on our strict <strong>Reality-First standard</strong>: zero fake listings, no AI-generated product photographs, and verifiable data provenance for every agricultural decision.
            </p>

            {/* Quick Feature Badges */}
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
              <Link
                href="/disease"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Crop Doctor</span>
              </Link>
              <Link
                href="/mandi"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Live Mandi</span>
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Agri Marketplace</span>
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: QUICK LINKS (Span 3 on LG)                     */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Quick Links</span>
            </h2>
            <nav aria-label="Core agricultural tools" className="space-y-2 text-xs font-semibold">
              <Link
                href="/"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Home</span>
              </Link>
              <Link
                href="/disease"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Crop Doctor (Disease Detection)</span>
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Agriculture Marketplace</span>
              </Link>
              <Link
                href="/mandi"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Live Mandi Prices</span>
              </Link>
              <Link
                href="/worker-connect"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>AgriLabour (Agricultural Workforce)</span>
              </Link>
              <Link
                href="/weather"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Weather Intelligence &amp; Alerts</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Contact Us</span>
              </Link>
            </nav>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: LEGAL & POLICIES (Span 3 on LG)                */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Legal &amp; Policies</span>
            </h2>
            <nav aria-label="Legal and trust policies" className="space-y-2 text-xs font-semibold">
              <Link
                href="/privacy"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Privacy Policy</span>
              </Link>
              <Link
                href="/terms"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Terms &amp; Conditions</span>
              </Link>
              <Link
                href="/disclaimer"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Legal &amp; Agronomic Disclaimer</span>
              </Link>
              <Link
                href="/cookie-policy"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <Cookie className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Cookie Policy</span>
              </Link>
              <Link
                href="/editorial-policy"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Editorial &amp; Data Sources Policy</span>
              </Link>
            </nav>
          </div>

          {/* ========================================================= */}
          {/* SECTION 4: COMPANY (Span 2 on LG)                         */}
          {/* ========================================================= */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Company</span>
            </h2>
            <nav aria-label="Company information" className="space-y-2 text-xs font-semibold">
              <Link
                href="/about"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>About Us</span>
              </Link>
              <Link
                href="/about#mission"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Our Mission</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Contact Us</span>
              </Link>
              <button
                type="button"
                onClick={() => openFeedback()}
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-0.5 group text-left cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
                <span>Farmer Feedback</span>
              </button>
            </nav>
          </div>

        </div>

        {/* Subtle Horizontal Divider */}
        <div className="border-t border-emerald-900/10 dark:border-stone-800 my-8" />

        {/* Contact Info & Physical Address Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-400 font-medium text-center md:text-left">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
            <a
              href="mailto:info@kisaanbuddy.com"
              className="inline-flex items-center gap-1.5 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            >
              <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>info@kisaanbuddy.com</span>
            </a>

            <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>

            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Patliputra Industrial Area, Patna, Bihar - 800013, India</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span>Made with dedication in India</span>
              <Heart className="h-3.5 w-3.5 text-red-500 fill-current inline" />
            </span>
          </div>

        </div>

        {/* AdSense Compliance & Copyright Row */}
        {/* pb-28 on mobile guarantees no obstruction by fixed MobileBottomNav */}
        <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 dark:text-stone-400 text-center sm:text-left pb-28 sm:pb-20 md:pb-4">
          <p className="max-w-3xl leading-relaxed">
            KisaanBuddy is an independent agritech platform. We operate under strict transparency rules: authentic data sourcing, no simulated listings, verified seller accounts, and clear user privacy controls. All trademarks and agricultural data sources belong to their respective authorities.
          </p>
          <p className="shrink-0 font-medium">
            Copyright &copy; 2026 KisaanBuddy. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
