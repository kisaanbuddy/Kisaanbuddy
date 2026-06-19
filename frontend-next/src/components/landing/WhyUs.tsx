'use client';

import { useLanguage } from '@/lib/language';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhyUs() {
  const { t, lang } = useLanguage();

  const stats = [
    {
      value: "95%",
      label: t("landing_why_us.prediction_accuracy"),
      desc: t("landing_why_us.rigorous_ml_training_sets"),
    },
    {
      value: "24/7",
      label: t("landing_why_us.ai_assistance"),
      desc: t("landing_why_us.multilingual_support_triggers_instant"),
    },
    {
      value: "500+",
      label: t("landing_why_us.crop_types"),
      desc: t("landing_why_us.comprehensive_database_covering_commercial"),
    },
    {
      value: "All-in-One",
      label: t("landing_why_us.platform_integrated"),
      desc: t("landing_why_us.combines_sensors_telemetry_mandi"),
    },
  ];

  return (
    <section className="py-20 bg-muted/15 border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {t("landing_why_us.why_choose_KisaanBuddy")}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {t("landing_why_us.the_trust_standard_in")}{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {t("landing_why_us.digital_agronomy")}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            {t("landing_why_us.we_merge_cutting_edge")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm p-6 hover:shadow-lg hover:border-border/60 transition-all duration-300 flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/5 blur-xl" />
              
              <div className="text-3xl font-display font-black text-emerald-500">
                {s.value}
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  {s.label}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
