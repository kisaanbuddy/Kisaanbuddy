'use client';

import { Users, Store, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/language';

export function TrustPanel() {
  const { lang } = useLanguage();

  const hiStats = [
    {
      icon: Users,
      value: "2 लाख+",
      label: "संतुष्ट भारतीय किसान",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      icon: Store,
      value: "eNAM सत्यापित",
      label: "ताज़ा मंडी भाव जानकारी",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    {
      icon: ShieldCheck,
      value: "ICAR फसल डेटाबेस",
      label: "कृषि विज्ञान आधारित सलाह",
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20"
    }
  ];

  const enStats = [
    {
      icon: Users,
      value: "2 Lakhs+",
      label: "Happy Indian Farmers",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      icon: Store,
      value: "eNAM Verified",
      label: "Live Market Rates",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    {
      icon: ShieldCheck,
      value: "ICAR Crop DB",
      label: "Scientific Agriculture Advisories",
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20"
    }
  ];

  const stats = lang === 'hi' ? hiStats : enStats;

  return (
    <section className="relative z-20 py-8 border-y border-border/10 bg-background/50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.04] bg-card/25 hover:bg-card/40 hover:border-border/30 transition-all duration-300 shadow-sm"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-extrabold text-foreground">{item.value}</span>
                <span className="text-xs text-muted-foreground/80 font-medium">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
