'use client';

import { useLanguage } from '@/lib/language';
import { Database, Cpu, Smartphone, ArrowRight, Sparkles, Satellite, CloudRain } from 'lucide-react';
import { motion } from 'framer-motion';

export function Technology() {
  const { t } = useLanguage();

  const steps = [
    {
      id: "01",
      title: t("technology.satellite_data"),
      desc: t("technology.satellite_desc"),
      icon: Satellite,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
      accent: "from-emerald-500 to-teal-500"
    },
    {
      id: "02",
      title: t("technology.weather_apis"),
      desc: t("technology.weather_desc"),
      icon: CloudRain,
      color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/25",
      accent: "from-sky-500 to-blue-500"
    },
    {
      id: "03",
      title: t("technology.ai_models"),
      desc: t("technology.ai_desc"),
      icon: Cpu,
      color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/25",
      accent: "from-teal-500 to-emerald-500"
    },
    {
      id: "04",
      title: t("technology.farmer_ui"),
      desc: t("technology.farmer_desc"),
      icon: Smartphone,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
      accent: "from-amber-500 to-emerald-500"
    }
  ];

  return (
    <section id="technology" className="py-24 bg-background relative overflow-hidden border-b border-border/50">
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-emerald-500/[0.03] blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-teal-500/[0.03] blur-[110px] pointer-events-none" />

      <div className="w-full px-4 md:px-8 relative z-10">
        
        {/* Title Block */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-xs select-none">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("technology.badge") || "Agritech Architecture"}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-foreground">
            {t("technology.title")}
          </h2>
          
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
            {t("technology.subtitle")}
          </p>
        </div>

        {/* Tech Flow Grid */}
        <div className="grid gap-6 md:grid-cols-4 relative w-full">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative flex flex-col items-start text-left rounded-2xl border border-border/70 bg-card/80 dark:bg-card/50 backdrop-blur-md p-6 hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
              >
                {/* Step ID Pill */}
                <div className="w-full flex items-center justify-between mb-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform duration-300 ${step.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-black tracking-wider text-muted-foreground/60 bg-muted/50 px-2.5 py-1 rounded-lg border border-border/40">
                    {step.id}
                  </span>
                </div>

                <h3 className="text-base font-bold font-display text-foreground mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {step.desc}
                </p>

                {/* Arrow indicator for next steps (Desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-12 -right-4 z-20 items-center justify-center h-8 w-8 rounded-full bg-card border border-border text-muted-foreground shadow-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-all">
                    <ArrowRight className="h-3.5 w-3.5" />
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
