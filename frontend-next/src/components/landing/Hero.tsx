'use client';

import Link from 'next/link';
import { 
  ArrowRight, Play, CheckCircle2, Sprout, Bug, 
  CloudSun, TrendingUp, FlaskConical, AlertTriangle, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/language';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#030712] py-16 md:py-24 border-b border-white/[0.08]">
      
      {/* ── BACKGROUND: Farmland Texture + Emerald Glows ── */}
      <div className="absolute inset-0 z-0">
        {/* Real Indian farmland subtle overlay */}
        <div 
          className="absolute inset-0 bg-[url('/hero_farmer.png')] bg-cover bg-center opacity-[0.07] mix-blend-luminosity pointer-events-none"
          style={{ filter: 'contrast(1.2) brightness(0.8)' }}
        />
        {/* Soft sunlight filter overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#030712] via-[#051c12]/40 to-[#030712] opacity-90 pointer-events-none" />
        
        {/* Emerald Glow Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-5%] w-[450px] h-[450px] bg-teal-500/8 rounded-full blur-[130px] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* ── LEFT SIDE: SaaS Value Proposition ── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 select-none shadow-lg shadow-emerald-500/5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>KisaanBuddy AI Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.08] tracking-tight text-white">
            {t('hero.title_line1')}<br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              {t('hero.title_line2')} 🌾
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm md:text-base text-gray-300 max-w-xl leading-relaxed font-medium">
            {t('hero.subtitle')}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white flex items-center justify-center gap-2 group text-sm font-extrabold h-12 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                {t('hero.start_free')}
                <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="#demo" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-3 text-sm font-extrabold text-white backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] h-12">
                <Play className="h-4 w-4 fill-white text-white shrink-0" />
                {t('hero.watch_demo')}
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs font-semibold text-gray-400 max-w-md w-full border-t border-white/5">
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>{t('hero.trust_languages')}</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>{t('hero.trust_predictions')}</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>{t('hero.trust_farmers')}</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>{t('hero.trust_accuracy')}</span>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT SIDE: Premium Dashboard Mockup ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="lg:col-span-6 w-full relative"
        >
          {/* Glassmorphism Outer Dashboard Frame */}
          <div className="relative rounded-3xl p-5 md:p-6 bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ambient inner card glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* 1. Crop Recommendation Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="font-bold text-white text-xs flex items-center gap-1.5 animate-pulse-glow">
                  <Sprout className="h-4 w-4 text-emerald-400" />
                  {t('dashboard_mockup.crop_recommendation')}
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                  {t('dashboard_mockup.optimal')}
                </span>
              </div>
              <div className="py-3">
                <div className="text-[10px] text-gray-400 font-semibold">{t('dashboard_mockup.recommended_crop')}:</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-1">{t('dashboard_mockup.basmati_rice')}</div>
              </div>
              <div className="text-[9px] text-gray-500 font-medium">{t('dashboard_mockup.yield_increase')}</div>
            </div>

            {/* 2. Disease Detection Result */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Bug className="h-4 w-4 text-rose-400" />
                  {t('dashboard_mockup.disease_scanner')}
                </span>
                <span className="bg-rose-500/10 text-rose-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                  {t('dashboard_mockup.alert')}
                </span>
              </div>
              <div className="py-2.5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-cover bg-center border border-white/10 shrink-0" style={{ backgroundImage: "url('/hero_farmer.png')" }} />
                <div>
                  <div className="text-[10px] text-white font-extrabold">{t('dashboard_mockup.early_blight_detected')}</div>
                  <div className="text-[8px] text-gray-400 font-semibold">{t('dashboard_mockup.confidence_potato')}</div>
                </div>
              </div>
              <div className="text-[9px] text-emerald-400 font-extrabold">{t('dashboard_mockup.remedy_copper')}</div>
            </div>

            {/* 3. Soil Analysis Report */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 md:col-span-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <FlaskConical className="h-4 w-4 text-teal-400" />
                  {t('dashboard_mockup.soil_health_analysis')}
                </span>
                <span className="text-[9px] text-teal-400 font-extrabold font-mono text-glow">ID: KB-NODE-042</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 py-3">
                <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-xl text-center">
                  <span className="block text-[8px] text-gray-400">{t('dashboard_mockup.nitrogen')}</span>
                  <span className="text-xs font-mono font-extrabold text-white">92 mg/kg</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-xl text-center">
                  <span className="block text-[8px] text-gray-400">{t('dashboard_mockup.phosphorus')}</span>
                  <span className="text-xs font-mono font-extrabold text-white">48 mg/kg</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-xl text-center">
                  <span className="block text-[8px] text-gray-400">{t('dashboard_mockup.potassium')}</span>
                  <span className="text-xs font-mono font-extrabold text-white">205 mg/kg</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[9px] text-gray-400 font-semibold">
                <span>{t('dashboard_mockup.moisture_optimal')}</span>
                <span>{t('dashboard_mockup.ph_neutral')}</span>
              </div>
            </div>

            {/* 4. Weather Advisory */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CloudSun className="h-4 w-4 text-sky-400" />
                  {t('dashboard_mockup.weather_advisory')}
                </span>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              </div>
              <div className="py-2.5">
                <span className="text-[9px] font-bold text-amber-400 uppercase">{t('dashboard_mockup.rain_predicted')}</span>
                <p className="text-[8px] text-gray-400 mt-1 leading-normal font-semibold">
                  {t('dashboard_mockup.urea_warning')}
                </p>
              </div>
              <div className="text-[8px] text-gray-500 font-semibold">Updated 2m ago</div>
            </div>

            {/* 5. Live Mandi Prices */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  {t('dashboard_mockup.mandi_live')}
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded-full">
                  {t('dashboard_mockup.unam_live')}
                </span>
              </div>
              <div className="py-2.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-300 font-bold">{t('dashboard_mockup.agra_potato')}</span>
                  <span className="text-[9px] text-white font-mono font-extrabold">₹1,850/Q</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-300 font-bold">{t('dashboard_mockup.delhi_wheat')}</span>
                  <span className="text-[9px] text-white font-mono font-extrabold">₹2,350/Q</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[8px] text-gray-500">
                <span>Updated 5m ago</span>
                <span className="text-emerald-400 font-bold">+₹50 today</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
