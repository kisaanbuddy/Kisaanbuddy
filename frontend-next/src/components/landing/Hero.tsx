'use client';

import Link from 'next/link';
import { ArrowRight, MessageSquare, Shield, Zap, Sparkles, Sprout, Bug, TrendingUp, CloudSun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/language';

export function Hero() {
  const { t, lang } = useLanguage();

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-background py-12 border-b border-border/10">
      
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px] dark:bg-emerald-500/[0.04]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[130px] dark:bg-green-500/[0.03]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        
        {/* Left Text Column */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          className="flex flex-col gap-6 text-center lg:text-left"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/5 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mx-auto lg:mx-0 select-none shadow-sm animate-pulse-glow">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("landing_hero.india_s_first_ai")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.08] tracking-tight text-foreground">
            {t("heroTitle1")}<br />
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500 bg-clip-text text-transparent">
              {t("heroTitle2")}
            </span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link href="#features">
              <button className="btn-primary flex items-center gap-2 group text-sm h-11 px-6">
                {t("landing_hero.get_started")}
                <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/chatbot">
              <button className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-2.5 text-sm font-bold text-foreground backdrop-blur-md transition-all hover:bg-muted/50 hover:border-border/60 active:scale-95 shadow-sm h-11">
                <MessageSquare className="h-4.5 w-4.5 text-emerald-500" />
                {t("aiChatbot")}
              </button>
            </Link>
          </div>

          {/* Quick Stats/Badges */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-5 pt-4 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>{t("landing_hero.free_early_access")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>{t("landing_hero.multi_language_audio")}</span>
            </div>
          </div>
        </motion.div>

        {/* Right Dashboard Mockup Column */}
        <motion.div 
          initial={{ opacity: 0, x: 30, scale: 0.96 }} 
          animate={{ opacity: 1, x: 0, scale: 1 }} 
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }} 
          className="relative select-none w-full max-w-xl mx-auto lg:max-w-none flex justify-center items-center"
        >
          {/* Card Frame with Glow (Dashboard Mockup) */}
          <div className="relative rounded-3xl p-1 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent shadow-2xl w-full aspect-[4/3] bg-[#040815] border border-border/20 overflow-hidden text-left flex flex-col font-sans select-none">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-card/60 border-b border-border/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                <span className="w-2 h-2 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">{t("landing_hero.krishiai_dashboard_console")}</span>
              <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Content body */}
            <div className="flex-1 p-4 grid grid-cols-3 gap-3 overflow-hidden text-[9px] bg-slate-950/20">
              {/* Left sidebar Mock */}
              <div className="col-span-1 border border-border/20 rounded-xl p-3 bg-card/45 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-extrabold pb-2 border-b border-border/10">
                    <span className="text-xs">🌱</span>
                    <span>{t("quickAccess")}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 font-bold flex items-center gap-1.5">
                      <Sprout className="h-3 w-3" /> {t("dashboard")}
                    </div>
                    <div className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground flex items-center gap-1.5">
                      <Bug className="h-3 w-3" /> {t("diseaseDetect")}
                    </div>
                    <div className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3" /> {t("mandi")}
                    </div>
                    <div className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground flex items-center gap-1.5">
                      <CloudSun className="h-3 w-3" /> {t("weather")}
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 p-2 rounded-lg text-center font-bold">
                  {t("landing_hero.ai_status_active")}
                </div>
              </div>

              {/* Main panels (2 cols) */}
              <div className="col-span-2 space-y-3 flex flex-col justify-between overflow-y-auto">
                {/* Panel row 1: Diagnostic */}
                <div className="rounded-xl border border-border/20 bg-card/35 p-3 flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
                    <span className="font-bold text-foreground">{t("landing_hero.ai_soil_recommendation")}</span>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-1.5 py-0.5 rounded-full">{t("landing_hero.optimal")}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 font-bold text-muted-foreground/85">
                    <div className="bg-background/40 p-1.5 rounded-lg border border-border/15">
                      <span className="block text-[7px] text-muted-foreground">{t("nitrogenLevel")}</span>
                      <span className="text-foreground text-[10px] font-mono">{t("landing_hero.92_mg_kg")}</span>
                    </div>
                    <div className="bg-background/40 p-1.5 rounded-lg border border-border/15">
                      <span className="block text-[7px] text-muted-foreground">{t("phosphorusLevel")}</span>
                      <span className="text-foreground text-[10px] font-mono">{t("landing_hero.48_mg_kg")}</span>
                    </div>
                    <div className="bg-background/40 p-1.5 rounded-lg border border-border/15">
                      <span className="block text-[7px] text-muted-foreground">{t("potassiumLevel")}</span>
                      <span className="text-foreground text-[10px] font-mono">{t("landing_hero.205_mg_kg")}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-extrabold text-emerald-500 flex items-center gap-1.5 mt-0.5">
                    {t("landing_hero.suggested_crop_premium_basmati")}
                  </div>
                </div>

                {/* Panel row 2: Mandi Quotes & Weather Alert */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Mandi Rates Card */}
                  <div className="rounded-xl border border-border/20 bg-card/35 p-3 flex flex-col gap-1.5">
                    <span className="font-bold text-foreground">{t("landing_hero.agra_mandi_potato")}</span>
                    <div className="flex justify-between items-center bg-background/30 p-1.5 rounded-lg border border-border/10 mt-1">
                      <span className="text-foreground font-mono font-bold">₹1,850/Q</span>
                      <span className="text-emerald-500 font-extrabold text-[8px]">{t("landing_hero.50_today")}</span>
                    </div>
                    <div className="text-[7px] text-muted-foreground font-semibold">{t("landing_hero.updated_5_min_ago")}</div>
                  </div>

                  {/* Weather Alert Card */}
                  <div className="rounded-xl border border-border/20 bg-card/35 p-3 flex flex-col gap-1.5 relative overflow-hidden">
                    <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <CloudSun className="h-3 w-3 text-sky-400" /> {t("landing_hero.weather_advisory")}
                    </span>
                    <span className="text-[8px] font-bold text-red-500 uppercase mt-0.5">{t("landing_hero.rain_warning_active")}</span>
                    <p className="text-[7.5px] text-muted-foreground/80 leading-normal font-semibold">
                      {t("landing_hero.heavy_rainfall_predicted_stop")}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Glowing overlay */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
          </div>

          {/* Floaters */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6 }} 
            className="absolute -top-4 -right-4 rounded-2xl glass-panel px-4 py-2.5 shadow-xl border-emerald-500/10 bg-background/80"
          >
            <div className="text-xl font-display font-extrabold text-emerald-500">100%</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t("landing_hero.free_forever")}</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.75 }} 
            className="absolute -bottom-4 -left-4 rounded-2xl glass-panel px-4 py-2.5 shadow-xl border-emerald-500/10 bg-background/80"
          >
            <div className="text-lg font-display font-extrabold text-teal-400">10+</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t("landing_hero.indian_languages")}</div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
