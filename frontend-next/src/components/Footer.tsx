'use client';

import Link from 'next/link';
import { Sprout, Heart, Leaf } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-border/20 bg-background/60 dark:bg-card/30 backdrop-blur-xl py-12 mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10">
          
          {/* Column 1: Brand details */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/20 border border-border overflow-hidden p-1 shadow shadow-primary/10">
                <img src="/icon-logo.png" alt="Kisaan Buddy Icon" className="h-full w-full object-contain dark:brightness-110" />
              </div>
              <span className="font-display text-lg tracking-tight">
                <span className="font-black text-foreground">Kisaan</span>
                <span className="font-light text-primary">Buddy</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {t("footerTagline")}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-semibold mt-2">
              <span>{t("madeInIndia")}</span>
              <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse-glow" />
            </div>
          </div>

          {/* Column 2: Platform Features */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("platformFeatures")}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-muted-foreground">
              <Link href="/disease" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Leaf className="h-3 w-3 text-primary" /> {t("diseaseDetect")}
              </Link>
              <Link href="/mandi" className="hover:text-primary transition-colors">
                {t("mandi")}
              </Link>
              <Link href="/chatbot" className="hover:text-primary transition-colors">
                {t("aiChatbot")}
              </Link>
              <Link href="/soil-health" className="hover:text-primary transition-colors">
                {t("soilHealth")}
              </Link>
              <Link href="/schemes" className="hover:text-primary transition-colors">
                {t("schemes")}
              </Link>
            </div>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("company")}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-muted-foreground">
              <Link href="/about" className="hover:text-primary transition-colors">
                {t("aboutUs")}
              </Link>
              <Link href="/founders" className="hover:text-primary transition-colors">
                {t("founders")}
              </Link>
              <Link href="/impact" className="hover:text-primary transition-colors">
                {t("impact")}
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                {t("contactUs")}
              </Link>
            </div>
          </div>

          {/* Column 4: Legal & Policies */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              {t("legal")}
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                {t("privacyPolicy")}
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                {t("termsConditions")}
              </Link>
              <Link href="/disclaimer" className="hover:text-primary transition-colors">
                {t("disclaimerLabel")}
              </Link>
              <Link href="/cookie-policy" className="hover:text-primary transition-colors">
                {t("cookiePolicy")}
              </Link>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="divider-gradient mb-6" />

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground/60 font-medium">
          <p>&copy; {new Date().getFullYear()} Kisaan Buddy &middot; {t("allRightsReserved")}</p>
          <div className="flex items-center gap-4">
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[9px] font-bold border border-primary/20">
              Google AdSense Compliant
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
