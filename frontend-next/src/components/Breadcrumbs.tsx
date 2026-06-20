'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const EXTRA_TRANSLATIONS: Record<string, Record<string, string>> = {
  home: {
    en: "Home",
    hi: "मुख्य पृष्ठ",
    kn: "ಮುಖಪುಟ",
    ta: "முகப்பு",
    te: "హోమ్",
    ml: "ഹോം",
    mr: "मुख्यपृष्ठ",
    bn: "হোম",
    pa: "ਹੋਮ",
    gu: "હોમ",
    hi_en: "Home"
  },
  blog: {
    en: "Blog",
    hi: "ब्लॉग",
    kn: "ಬ್ಲಾಗ್",
    ta: "வலைப்பதிவு",
    te: "ಬ್ಲಾಗ్",
    ml: "ಬ്ലോഗ്",
    mr: "ब्लॉग",
    bn: "ব্লগ",
    pa: "ਬਲੌਗ",
    gu: "બ્લોગ",
    hi_en: "Blog"
  }
};

const segmentToKeyMap: Record<string, string> = {
  'dashboard': 'dashboard',
  'weather': 'weather',
  'crop-predictor': 'aiPredictor',
  'disease': 'diseaseDetect',
  'soil-health': 'soilHealth',
  'schemes': 'schemes',
  'mandi': 'mandi',
  'worker-connect': 'workers',
  'chatbot': 'aiChatbot',
  'khet-diary': 'khetDiary',
  'about': 'aboutUs',
  'founders': 'founders',
  'contact': 'contactUs',
  'privacy': 'privacyPolicy',
  'terms': 'termsConditions',
  'disclaimer': 'disclaimerLabel',
  'cookie-policy': 'cookiePolicy',
  'impact': 'impact'
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { lang, t } = useLanguage();

  if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);

  const getLabel = (segment: string, key?: string) => {
    if (segment in EXTRA_TRANSLATIONS) {
      return EXTRA_TRANSLATIONS[segment][lang] || EXTRA_TRANSLATIONS[segment]['en'];
    }
    if (key) {
      const translated = t(key);
      if (translated !== key) return translated;
    }
    // Fallback formatting: capitalize and replace dashes
    return segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const homeLabel = EXTRA_TRANSLATIONS.home[lang] || EXTRA_TRANSLATIONS.home.en;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 md:space-x-2 text-xs text-muted-foreground mb-6 select-none flex-wrap">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-emerald-500 transition-colors font-semibold"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{homeLabel}</span>
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = '/' + segments.slice(0, index + 1).join('/');
        const key = segmentToKeyMap[segment];
        const label = getLabel(segment, key);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            {isLast ? (
              <span className="font-bold text-foreground truncate max-w-[180px] sm:max-w-xs" aria-current="page">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-emerald-500 transition-colors font-semibold truncate max-w-[180px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
