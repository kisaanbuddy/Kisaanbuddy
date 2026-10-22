'use client';

import Link from 'next/link';
import { Heart, Leaf, Github, Linkedin, MapPin, Mail, ExternalLink, Store, Users, Wrench, Landmark } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="w-full relative border-t border-stone-200/80 dark:border-stone-800/80 bg-gradient-to-b from-white to-[#fbfbf9] dark:from-stone-900 dark:to-stone-950 py-14 mt-auto select-none overflow-hidden">
      {/* Top subtle highlight gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Contact */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3.5">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.jpeg" alt="KisaanBuddy Logo" className="w-7 h-7 object-contain" />
              <span className="font-display text-lg tracking-tight">
                <span className="font-extrabold text-stone-900 dark:text-white">Kisaan</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Buddy</span>
              </span>
            </Link>
            <p className="text-xs text-stone-500 leading-relaxed">
              India's dedicated agricultural marketplace and intelligence platform. Connecting farmers with real wholesale markets, verified buyers, and skilled farm labour.
            </p>
            <div className="text-[11px] text-stone-500 space-y-1.5 font-medium pt-1">
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Noida: H-12, Sector 63, UP - 201301</span>
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Patna: Patliputra Industrial Area, BH - 800013</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <a href="mailto:info@kisaanbuddy.com" className="hover:text-emerald-600 transition-colors">info@kisaanbuddy.com</a>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium pt-1">
              <span>Made with dedication in India</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
            </div>
          </div>

          {/* Column 2: Marketplace */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-white flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Marketplace</span>
            </p>
            <div className="flex flex-col gap-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
              <Link href="/mandi" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Mandi Bhav & Intelligence
              </Link>
              <Link href="/marketplace?action=sell" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Sell Your Harvest
              </Link>
              <Link href="/marketplace?tab=buyers" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Verified Buyer Requirements
              </Link>
              <Link href="/marketplace?tab=equipment" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Equipment & Machinery
              </Link>
            </div>
          </div>

          {/* Column 3: Workers Connect */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Workers Connect</span>
            </p>
            <div className="flex flex-col gap-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
              <Link href="/worker-connect?tab=find_workers" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Find Farm Workers
              </Link>
              <Link href="/worker-connect?tab=find_jobs" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Find Farming Jobs
              </Link>
              <Link href="/worker-connect?tab=worker_portal" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Worker Registration
              </Link>
              <Link href="/worker-connect?tab=post_job" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Post Labour Requirement
              </Link>
              <Link href="/worker-connect?tab=wage_benchmarks" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Labour Bureau Benchmarks
              </Link>
            </div>
          </div>

          {/* Column 4: Farming Tools */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-white flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Farming Tools</span>
            </p>
            <div className="flex flex-col gap-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
              <Link href="/chatbot" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                AI Farming Assistant
              </Link>
              <Link href="/disease" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Crop Doctor (Vision AI)
              </Link>
              <Link href="/crop-predictor" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Crop Selection Advisory
              </Link>
              <Link href="/soil-health" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Soil Health & NPK Dosage
              </Link>
              <Link href="/khet-diary" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Khet Diary (Expenses)
              </Link>
              <Link href="/reports" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Farm Reports & Summary
              </Link>
            </div>
          </div>

          {/* Column 5: Government Resources & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-white flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official & Legal</span>
            </p>
            <div className="flex flex-col gap-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
              <Link href="/schemes" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Government Schemes
              </Link>
              <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                <span>PM-KISAN Portal</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://enam.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                <span>National e-NAM Portal</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <div className="border-t border-stone-200 dark:border-stone-800 my-1" />
              <Link href="/privacy" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/disclaimer" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Legal Disclaimer
              </Link>
              <Link href="/about" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                About Us & Founders
              </Link>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-stone-200 dark:border-stone-800" />

        {/* Bottom copyright and social row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-medium text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} KisaanBuddy &middot; Built for Indian Farmers &middot; All Rights Reserved</p>
          <div className="flex items-center justify-center sm:justify-end gap-4">
            <a
              href="https://github.com/kisaanbuddy/Kisaanbuddy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              title="GitHub"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <a
              href="https://www.linkedin.com/in/aditya-ishwar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              title="LinkedIn"
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
