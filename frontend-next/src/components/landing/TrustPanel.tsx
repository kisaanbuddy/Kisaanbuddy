'use client';

import { Users, Sparkles, Languages, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/language';

export function TrustPanel() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Users,
      value: t("hero.trust_farmers"),
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      icon: Sparkles,
      value: t("hero.trust_predictions"),
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
    },
    {
      icon: Languages,
      value: t("hero.trust_languages"),
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      icon: ShieldCheck,
      value: t("hero.trust_accuracy"),
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
    }
  ];

  return (
    <section className="relative z-20 py-10 border-y border-emerald-500/10 bg-[#040814]/40 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3.5 p-4 md:p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all duration-300 shadow-lg group"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform duration-300 ${item.color}`}>
                <item.icon className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-display font-extrabold text-white tracking-tight leading-snug">
                  {item.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
