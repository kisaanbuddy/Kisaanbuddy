'use client';

import { useLanguage } from '@/lib/language';
import { Sprout, Users, Landmark, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function Vision() {
  const { lang } = useLanguage();

  const pillars = [
    { 
      icon: Users, 
      title: t("landing_vision.inclusive_access"), 
      desc: t("landing_vision.by_deploying_voice_search")},
    { 
      icon: Landmark, 
      title: t("landing_vision.scientific_yields"), 
      desc: t("landing_vision.replacing_guess_work_with")},
    { 
      icon: Globe, 
      title: t("landing_vision.sustainable_farming"), 
      desc: t("landing_vision.integrating_weather_forecasting_and")}
  ];

  return (
    <section className="relative overflow-hidden py-24 border-b border-border/20">
      
      {/* Background Graphic Morphs */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/5 via-background to-teal-950/5 -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center relative z-10 space-y-12">
        
        {/* Core Vision Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto animate-float">
            <Sprout className="h-6 w-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
            {t("landing_vision.our_vision_for_the")}<br />
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500 bg-clip-text text-transparent">
              {t("landing_vision.future_of_indian_agriculture")}
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-semibold italic">
            &ldquo;{t("landing_vision.our_mission_is_to")}&rdquo;
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto text-left">
          {pillars.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl border border-border/30 bg-card/20 p-5 flex flex-col gap-2.5 hover:border-emerald-500/20 transition-all duration-300"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
                <p.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 font-display">
                {p.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
