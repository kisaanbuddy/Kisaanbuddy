'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Mic, TrendingUp, UserRound, Store, Settings, Sprout } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const NAV_ITEMS: { href: string; icon: any; labels: Record<string, string> }[] = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    labels: {
      en: 'Command',
      hi: 'खेत',
      kn: 'ಮುಖ್ಯಪುಟ',
      ta: 'முகப்பு',
      te: 'కమాండ్',
      ml: 'കമാൻഡ്',
      mr: 'कमांड',
      bn: 'কমান্ড',
      pa: 'ਕਮਾਂਡ',
      gu: 'કમાન્ડ',
      hi_en: 'Command',
    },
  },
  {
    href: '/profile',
    icon: Sprout,
    labels: {
      en: 'Plots',
      hi: 'फसलें',
      kn: 'ಜಮೀನು',
      ta: 'நிலங்கள்',
      te: 'పొలాలు',
      ml: 'പ്ലോട്ടുകൾ',
      mr: 'शेतजमीन',
      bn: 'জমি',
      pa: 'ਖੇਤ',
      gu: 'જમીન',
      hi_en: 'Khet',
    },
  },
  {
    href: '/chatbot',
    icon: Mic,
    labels: {
      en: 'AI Advisor',
      hi: 'AI सलाह',
      kn: 'AI ಸಲಹೆಗಾರ',
      ta: 'AI ஆலோசகர்',
      te: 'AI సలహాదారు',
      ml: 'AI ഉപദേശകൻ',
      mr: 'AI सल्लागार',
      bn: 'AI উপদেষ্টা',
      pa: 'AI ਸਲਾਹਕਾਰ',
      gu: 'AI સલાહકાર',
      hi_en: 'AI Salah',
    },
  },
  {
    href: '/marketplace',
    icon: Store,
    labels: {
      en: 'Market',
      hi: 'बाज़ार',
      kn: 'ಮಾರುಕಟ್ಟೆ',
      ta: 'சந்தை',
      te: 'మార్కెట్',
      ml: 'വിപണി',
      mr: 'बाजारपेठ',
      bn: 'বাজার',
      pa: 'ਮੰਡੀ',
      gu: 'બજાર',
      hi_en: 'Market',
    },
  },
  {
    href: '/settings',
    icon: Settings,
    labels: {
      en: 'Settings',
      hi: 'सेटिंग्स',
      kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      ta: 'அமைப்புகள்',
      te: 'సెట్టింగ్‌లు',
      ml: 'ക്രമീകരണങ്ങൾ',
      mr: 'सेटिंग्ज',
      bn: 'সেটিংস',
      pa: 'ਸੈਟਿੰਗਾਂ',
      gu: 'સેટિંગ્સ',
      hi_en: 'Settings',
    },
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-18px_rgba(24,57,42,.28)] backdrop-blur md:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, labels }) => {
          const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={labels[lang] || labels.en}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 min-w-[56px] min-h-[48px] rounded-lg transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-all ${isActive ? 'scale-110' : ''} ${href === '/chatbot' ? 'stroke-[2.2]' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] leading-none mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {labels[lang] || labels.en}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
