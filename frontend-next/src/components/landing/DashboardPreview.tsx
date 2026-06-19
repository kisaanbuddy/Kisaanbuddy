'use client';

import { useLanguage } from '@/lib/language';
import { useState } from 'react';
import { Sprout, Bug, TrendingUp, CloudSun, Check, Sparkles, Upload, AlertCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardPreview() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('predictor');

  const tabs = [
    { id: 'predictor', label: t("landing_dashboard.crop_predictor"), icon: Sprout },
    { id: 'detector', label: t("landing_dashboard.disease_detector"), icon: Bug },
    { id: 'mandi', label: t("landing_dashboard.market_analytics"), icon: TrendingUp },
    { id: 'weather', label: t("landing_dashboard.weather_dashboard"), icon: CloudSun },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden border-b border-border/20">
      
      {/* Decorative Blob */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {t("landing_dashboard.interactive_showcase")}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            {t("landing_dashboard.explore_the")}{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              {t("landing_dashboard.KisaanBuddy_dashboard")}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            {t("landing_dashboard.click_through_our_active")}
          </p>
        </div>

        {/* Dynamic Tab Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-muted/20 border border-border/20 p-1.5 rounded-2xl w-fit mx-auto backdrop-blur-sm select-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                  ${active 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Frame */}
        <div className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-between h-full"
            >
              
              {/* Tab 1: Crop Predictor */}
              {activeTab === 'predictor' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mx-auto lg:mx-0">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">{t("landing_dashboard.soil_chemistry_optimizer")}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {t("landing_dashboard.input_your_n_p")}
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("landing_dashboard.dynamic_crop_suggestions")}</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("landing_dashboard.fertilizer_ratio_reports")}</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 select-none">
                      <Sparkles className="h-3.5 w-3.5" /> {t("landing_dashboard.soil_predictor_engine")}
                    </h4>
                    
                    <div className="grid gap-3 grid-cols-3 text-[10px] font-bold text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span>{t("landing_dashboard.nitrogen_n")}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">{t("landing_dashboard.92_mg_kg")}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>{t("landing_dashboard.phosphorus_p")}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">{t("landing_dashboard.48_mg_kg")}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>{t("landing_dashboard.potassium_k")}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">{t("landing_dashboard.205_mg_kg")}</div>
                      </div>
                    </div>

                    <div className="grid gap-3 grid-cols-2 text-[10px] font-bold text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span>{t("landing_dashboard.soil_ph")}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">6.4 ({t("landing_dashboard.slightly_acidic")})</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>{t("landing_dashboard.organic_carbon_oc")}</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">0.65% ({t("landing_dashboard.medium")})</div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm">🌾</div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{t("landing_dashboard.top_suggestion")}</span>
                          <span className="text-xs font-extrabold text-foreground">{t("landing_dashboard.premium_basmati_rice")}</span>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold">{t("landing_dashboard.98_fit_score")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Disease Detector */}
              {activeTab === 'detector' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 mx-auto lg:mx-0">
                      <Bug className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">{t("landing_dashboard.crop_leaf_pathology_ai")}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {t("landing_dashboard.identify_plant_sicknesses_immediately")}
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("landing_dashboard.organic_spray_remedies")}</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("landing_dashboard.chemical_dosage_controls")}</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 select-none">
                      <AlertCircle className="h-3.5 w-3.5" /> {t("landing_dashboard.leaf_diagnosis_console")}
                    </h4>

                    <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-muted/10 relative overflow-hidden select-none min-h-[120px]">
                      {/* Leaf scanning animation representation */}
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/40 animate-pulse" />
                      <Upload className="h-6 w-6 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground font-bold">{t("landing_dashboard.leaf_tomato_spot_png")}</span>
                      <span className="text-[9px] text-emerald-500 font-extrabold uppercase">{t("landing_dashboard.analyzing_features")}</span>
                    </div>

                    <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-foreground">{t("landing_dashboard.tomato_early_blight")}</span>
                          <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/10 px-2 py-0.5 rounded-full font-black">{t("landing_dashboard.high_concern")}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold">{t("landing_dashboard.accuracy")}: 94.7%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                        <strong>{t("landing_dashboard.remedy_suggestion")}:</strong> {t("landing_dashboard.spray_copper_oxychloride_2")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Market Analytics */}
              {activeTab === 'mandi' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mx-auto lg:mx-0">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">{t("landing_dashboard.apmc_mandi_price_alerts")}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {t("landing_dashboard.never_sell_under_value")}
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("landing_dashboard.target_alerts_configuration")}</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("landing_dashboard.price_trend_insights")}</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 select-none">
                      <TrendingUp className="h-3.5 w-3.5" /> {t("landing_dashboard.live_apmc_rates_potato")}
                    </h4>

                    {/* Mock mandi list */}
                    <div className="space-y-2 text-[10px] font-semibold text-muted-foreground">
                      {[
                        { mandi: t("landing_dashboard.agra_mandi_up"), current: "₹1,850/Quintal", change: t("landing_dashboard.50_today")},
                        { mandi: t("landing_dashboard.patna_apmc_bihar"), current: "₹1,920/Quintal", change: t("landing_dashboard.80_today")},
                        { mandi: t("landing_dashboard.pune_apmc_maharashtra"), current: "₹2,100/Quintal", change: t("landing_dashboard.120_today")},
                      ].map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-muted/40 p-2.5 rounded-xl border border-border/20">
                          <div>
                            <span className="text-foreground font-bold">{m.mandi}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-foreground font-extrabold">{m.current}</span>
                            <span className="block text-[8px] text-emerald-500 font-extrabold">{m.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                      <div className="flex items-center gap-2.5">
                        <Bell className="h-4 w-4 text-amber-500" />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase text-muted-foreground font-bold">{t("landing_dashboard.active_target_alert")}</span>
                          <span className="text-xs font-bold text-foreground">{t("landing_dashboard.alert_when_potato_exceeds")}</span>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">{t("landing_dashboard.active")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Weather Dashboard */}
              {activeTab === 'weather' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 mx-auto lg:mx-0">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">{t("landing_dashboard.hyperlocal_weather_advisories")}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {t("landing_dashboard.integrates_weather_api_feeds")}
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("landing_dashboard.7_day_weather_prediction")}</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("landing_dashboard.severe_event_warnings")}</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5 select-none">
                      <CloudSun className="h-3.5 w-3.5" /> {t("landing_dashboard.weather_alert_console")}
                    </h4>

                    <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/20">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">⛈️</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{t("landing_dashboard.heavy_thunderstorms_expected")}</span>
                          <span className="text-[9px] text-muted-foreground font-semibold">{t("landing_dashboard.commencing_in_14_hours")}</span>
                        </div>
                      </div>
                      <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-red-500/20 select-none animate-pulse">{t("landing_dashboard.warning")}</span>
                    </div>

                    <div className="rounded-xl bg-sky-500/5 border border-sky-500/20 p-3.5">
                      <span className="text-[9px] font-extrabold uppercase text-sky-500 block mb-1">{t("landing_dashboard.crop_specific_advisory")}</span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                        <strong>{t("landing_dashboard.wheat")}:</strong> {t("landing_dashboard.do_not_apply_liquid")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
