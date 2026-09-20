'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CloudSun, Bug, TrendingUp, Mic } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const NAV_ITEMS = [
  { href: '/', icon: Home, labelEn: 'Home', labelHi: 'होम' },
  { href: '/weather', icon: CloudSun, labelEn: 'Weather', labelHi: 'मौसम' },
  { href: '/disease', icon: Bug, labelEn: 'Disease', labelHi: 'रोग' },
  { href: '/mandi', icon: TrendingUp, labelEn: 'Mandi', labelHi: 'मंडी' },
  { href: '/chatbot', icon: Mic, labelEn: 'AI Chat', labelHi: 'AI चैट' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-18px_rgba(24,57,42,.28)] backdrop-blur md:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {NAV_ITEMS.map(({ href, icon: Icon, labelEn, labelHi }) => {
          const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-lg transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-all ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] leading-none mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {isHi ? labelHi : labelEn}
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
