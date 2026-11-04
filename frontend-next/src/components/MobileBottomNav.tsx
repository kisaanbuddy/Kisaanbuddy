'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HandHelping, Home, Sprout, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const NAV_ITEMS = [
  {
    href: '/',
    icon: Home,
    labels: {
      en: 'Home',
      hi: 'होम',
      kn: 'ಮುಖಪುಟ',
      ta: 'முகப்பு',
      te: 'హోమ్',
      ml: 'ഹോം',
      mr: 'मुख्यपृष्ठ',
      bn: 'হোম',
      pa: 'ਮੁੱਖ ਪੰਨਾ',
      gu: 'હોમ',
      hi_en: 'Home',
    },
  },
  {
    href: '/fasal',
    icon: Sprout,
    labels: {
      en: 'Fasal',
      hi: 'फसल',
      kn: 'ಬೆಳೆ',
      ta: 'பயிர்',
      te: 'పంట',
      ml: 'വിള',
      mr: 'पीक',
      bn: 'ফসল',
      pa: 'ਫਸਲ',
      gu: 'પાક',
      hi_en: 'Fasal',
    },
  },
  {
    href: '/mandi',
    icon: TrendingUp,
    labels: {
      en: 'Mandi',
      hi: 'मंडी',
      kn: 'ಮಂಡಿ',
      ta: 'மண்டி',
      te: 'ಮಂಡಿ',
      ml: 'മണ്ടി',
      mr: 'मंडी',
      bn: 'মান্ডি',
      pa: 'ਮੰਡੀ',
      gu: 'મંડી',
      hi_en: 'Mandi',
    },
  },
  {
    href: '/madad',
    icon: HandHelping,
    labels: {
      en: 'Madad',
      hi: 'मदद',
      kn: 'ಸಹಾಯ',
      ta: 'உதவி',
      te: 'సహాయం',
      ml: 'സಹಾಯം',
      mr: 'मदत',
      bn: 'সাহায্য',
      pa: 'ਮਦਦ',
      gu: 'ಮਦદ',
      hi_en: 'Madad',
    },
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/90 dark:border-stone-800 bg-[#FAF8F5]/95 dark:bg-stone-900/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(20,40,30,0.08)] backdrop-blur-md md:hidden"
      aria-label="Primary bottom navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, labels }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname?.startsWith(href);
          const labelText = labels[lang as keyof typeof labels] || labels.en;

          return (
            <Link
              key={href}
              href={href}
              aria-label={labelText}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex min-h-[52px] min-w-[70px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all active:scale-95 ${
                isActive
                  ? 'text-primary dark:text-emerald-400 font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 dark:bg-emerald-950/60'
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.9]'
                  }`}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`text-[12px] leading-tight tracking-tight ${
                  isActive ? 'font-bold text-primary dark:text-emerald-300' : 'font-medium'
                }`}
              >
                {labelText}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-primary dark:bg-emerald-400"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
