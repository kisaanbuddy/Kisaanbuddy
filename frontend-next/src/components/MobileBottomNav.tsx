'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Sprout, BarChart3, User } from 'lucide-react';
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
    href: '/chatbot',
    icon: Sparkles,
    labels: {
      en: 'Ask AI',
      hi: 'पूछें AI',
      kn: 'AI ಕೇಳಿ',
      ta: 'AI கேளுங்கள்',
      te: 'AI అడగండి',
      ml: 'AI ചോദിക്കൂ',
      mr: 'AI विचारा',
      bn: 'AI জিজ্ঞাসা',
      pa: 'AI ਪੁੱਛੋ',
      gu: 'AI પૂછો',
      hi_en: 'Ask AI',
    },
  },
  {
    href: '/crop-predictor',
    icon: Sprout,
    labels: {
      en: 'My Farm',
      hi: 'मेरा खेत',
      kn: 'ನನ್ನ ಜಮೀನು',
      ta: 'என் பண்ணை',
      te: 'నా పొలం',
      ml: 'എന്റെ കൃഷി',
      mr: 'माझे शेत',
      bn: 'আমার খামার',
      pa: 'ਮੇਰਾ ਖੇਤ',
      gu: 'મારું ખેતર',
      hi_en: 'Mera Khet',
    },
  },
  {
    href: '/dashboard',
    icon: BarChart3,
    labels: {
      en: 'Insights',
      hi: 'अनुमान',
      kn: 'ಒಳನೋಟಗಳು',
      ta: 'பார்வைகள்',
      te: 'అంచనాలు',
      ml: 'വിവരങ്ങൾ',
      mr: 'अंदाज',
      bn: 'অন্তর্দৃষ্টি',
      pa: 'ਅੰਦਾਜ਼ਾ',
      gu: 'અંદાજ',
      hi_en: 'Insights',
    },
  },
  {
    href: '/profile',
    icon: User,
    labels: {
      en: 'Profile',
      hi: 'प्रोफाइल',
      kn: 'ಪ್ರೊಫೈಲ್',
      ta: 'சுயவிவரம்',
      te: 'ప్రొಫైల్',
      ml: 'പ്രൊഫൈൽ',
      mr: 'प्रोफाइल',
      bn: 'প্রোফাইল',
      pa: 'ਪ੍ਰੋਫਾਈਲ',
      gu: 'પ્રોફાઇલ',
      hi_en: 'Profile',
    },
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-900/10 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(23,75,53,0.08)] backdrop-blur-md md:hidden select-none"
      aria-label="Primary mobile navigation"
    >
      <div className="flex items-center justify-around px-1 py-1">
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
              className={`relative flex min-h-[50px] min-w-[60px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-all active:scale-95 touch-manipulation ${
                isActive
                  ? 'text-emerald-800 dark:text-emerald-400 font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium'
              }`}
            >
              <span
                className={`flex h-8 w-11 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    : 'bg-transparent text-stone-600 dark:text-stone-400'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`text-[11px] leading-tight tracking-tight ${
                  isActive ? 'font-extrabold text-emerald-800 dark:text-emerald-300' : 'font-semibold'
                }`}
              >
                {labelText}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-emerald-700 dark:bg-emerald-400"
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
