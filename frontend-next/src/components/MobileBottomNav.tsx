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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-1 py-1">
        {NAV_ITEMS.map(({ href, icon: Icon, labelEn, labelHi }) => {
          const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-lg transition-colors ${
                isActive
                  ? 'text-emerald-700'
                  : 'text-gray-500 hover:text-gray-800'
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
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
