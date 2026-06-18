'use client';

import { useLanguage } from '@/lib/language';
import { Database, Cpu, Smartphone, ArrowRight, Sparkles, Satellite, CloudRain } from 'lucide-react';
import { motion } from 'framer-motion';

export function Technology() {
  const { t } = useLanguage();

  const steps = [
    {
      id: 1,
      title: t("technology.satellite_data"),
      desc: t("technology.satellite_desc"),
      icon: Satellite,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5"
    },
    {
      id: 2,
      title: t("technology.weather_apis"),
      desc: t("technology.weather_desc"),
      icon: CloudRain,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20 shadow-teal-500/5"
    },
    {
      id: 3,
      title: t("technology.ai_models"),
      desc: t("technology.ai_desc"),
      icon: Cpu,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5"
    },
    {
      id: 4,
      title: t("technology.farmer_ui"),
      desc: t("technology.farmer_desc"),
      icon: Smartphone,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20 shadow-teal-500/5"
    }
  ];

  return (
    <section className="py-24 bg-[#02050e] relative overflow-hidden border-b border-border/10">
      
      {/* Glow backgrounds */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.02] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-teal-500/[0.02] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            {t("technology.badge") || "Agritech Architecture"}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white">
            {t("technology.title")}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-xl mx-auto leading-relaxed font-semibold">
            {t("technology.subtitle")}
          </p>
        </div>

        {/* Tech Flow Grid */}
        <div className="grid gap-6 md:grid-cols-4 relative max-w-6xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative flex flex-col items-center md:items-start text-center md:text-left bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] hover:border-emerald-500/25 transition-all duration-300 shadow-xl group"
              >
                
                {/* Icon Circle */}
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg group-hover:scale-105 transition-transform duration-300 ${step.color}`}>
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="text-base font-extrabold font-display text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {step.desc}
                </p>

                {/* Arrow indicator for next steps (Desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-10 -right-4 z-20 items-center justify-center h-8 w-8 rounded-full bg-[#040814] border border-white/10 text-muted-foreground/50 shadow group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
