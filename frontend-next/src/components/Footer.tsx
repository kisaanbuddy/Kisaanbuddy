'use client';

import Link from 'next/link';
import { Heart, Leaf, Github, Linkedin, MapPin, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-border bg-card/60 backdrop-blur-md py-12 mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10">
          
          {/* Column 1: Brand details */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 p-1">
                <img src="/icon-logo.png" alt="Kisaan Buddy Icon" className="h-full w-full object-contain" />
              </div>
              <span className="font-display text-lg tracking-tight">
                <span className="font-bold text-foreground">Kisaan</span>
                <span className="font-light text-primary">Buddy</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {t("footerTagline")}
            </p>
            <div className="text-[11px] text-muted-foreground space-y-1 mt-1 font-medium">
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>Noida: H-12, Sector 63, UP - 201301</span>
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>Patna: Patliputra Industrial Area, BH - 800013</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <a href="mailto:info@kisaanbuddy.com" className="hover:text-primary transition-colors">info@kisaanbuddy.com</a>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-1">
              <span>{t("madeInIndia")}</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
            </div>
          </div>

          {/* Column 2: Platform Features */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t("platformFeatures")}
            </p>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <Link href="/disease" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <Leaf className="h-3 w-3 text-primary" /> {t("diseaseDetect")}
              </Link>
              <Link href="/mandi" className="hover:text-foreground transition-colors">
                {t("mandi")}
              </Link>
              <Link href="/chatbot" className="hover:text-foreground transition-colors">
                {t("aiChatbot")}
              </Link>
              <Link href="/soil-health" className="hover:text-foreground transition-colors">
                {t("soilHealth")}
              </Link>
              <Link href="/schemes" className="hover:text-foreground transition-colors">
                {t("schemes")}
              </Link>
              <Link href="/khet-diary" className="hover:text-foreground transition-colors">
                {t("ui.footer.khet_diary")}
              </Link>
            </div>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t("company")}
            </p>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                {t("aboutUs")}
              </Link>
              <Link href="/founders" className="hover:text-foreground transition-colors">
                {t("founders")}
              </Link>
              <Link href="/impact" className="hover:text-foreground transition-colors">
                {t("impact")}
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                {t("contactUs")}
              </Link>
            </div>
          </div>

          {/* Column 4: Legal & Policies */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t("legal")}
            </p>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                {t("privacyPolicy")}
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                {t("termsConditions")}
              </Link>
              <Link href="/disclaimer" className="hover:text-foreground transition-colors">
                {t("disclaimerLabel")}
              </Link>
              <Link href="/cookie-policy" className="hover:text-foreground transition-colors">
                {t("cookiePolicy")}
              </Link>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-border/80 mb-6" />

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium">
          <p>&copy; {new Date().getFullYear()} Kisaan Buddy &middot; {t("allRightsReserved")}</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/kisaanbuddy/Kisaanbuddy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
              title="GitHub"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
            <span className="text-border">|</span>
            <a
              href="https://www.linkedin.com/in/yash-singh-33553b2a5"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
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
