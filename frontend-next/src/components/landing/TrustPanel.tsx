'use client';

import Link from 'next/link';
import { Sprout, TrendingUp, CloudSun, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function TrustPanel() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const stats = [
    {
      icon: Sprout,
      metric: isHi ? "फसल डॉक्टर" : "Crop Doctor",
      label: isHi ? "रोग पहचान व जैविक उपचार" : "AI disease checks & remedies",
      href: "/disease",
      iconColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      icon: TrendingUp,
      metric: isHi ? "मंडी भाव" : "Mandi Rates",
      label: isHi ? "दैनिक eNAM थोक मंडी भाव" : "Daily eNAM wholesale prices",
      href: "/mandi",
      iconColor: "text-amber-600 bg-amber-500/10 border-amber-500/20"
    },
    {
      icon: CloudSun,
      metric: isHi ? "खेत का मौसम" : "Farm Weather",
      label: isHi ? "सटीक बारिश व तापमान रडार" : "Hyperlocal rain & spray radar",
      href: "/weather",
      iconColor: "text-sky-600 bg-sky-500/10 border-sky-500/20"
    },
    {
      icon: Languages,
      metric: isHi ? "10+ भाषाएं" : "10+ Languages",
      label: isHi ? "भारतीय भाषाओं में उपलब्ध" : "10+ Indian regional languages",
      href: "#",
      iconColor: "text-violet-600 bg-violet-500/10 border-violet-500/20"
    }
  ];

  return (
    <section className="relative z-20 py-6 sm:py-8 border-b border-border/60 bg-muted/10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {stats.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 sm:p-5 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-sm transition-all duration-200 group"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform duration-200 ${item.iconColor}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base font-display font-bold text-foreground tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                  {item.metric}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-normal mt-0.5 leading-tight">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
