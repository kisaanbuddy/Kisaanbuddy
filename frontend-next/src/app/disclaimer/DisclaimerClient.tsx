'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Leaf, CloudSun, TrendingUp, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function DisclaimerClient() {
  const { t, lang } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-6">
      
      {/* Back button */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>{t("disclaimer.back_to_home")}</span>
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow shadow-emerald-500/10">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            {t("disclaimer.legal_disclaimer")}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          {t("disclaimer.advisory_disclaimer")}
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          {t("disclaimer.last_updated_june_5")}
        </p>
      </div>

      {/* Policy contents */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("disclaimer.1_general_disclaimer")}
          </h2>
          <p>
            {t("disclaimer.all_information_provided_on")}
          </p>
          <p>
            {t("disclaimer.the_content_is_provided")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Leaf className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("disclaimer.2_ai_plant_disease")}
          </h2>
          <p>
            {t("disclaimer.our_crop_disease_ai")}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {t("disclaimer.machine_learning_models_can")}
            </li>
            <li>
              {t("disclaimer.recommended_pesticides_insecticides_fungicides")}
            </li>
            <li>
              {t("disclaimer.we_are_not_responsible")}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <CloudSun className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("disclaimer.3_weather_intelligence_alerts")}
          </h2>
          <p>
            {t("disclaimer.weather_data_is_compiled")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("disclaimer.4_live_mandi_prices")}
          </h2>
          <p>
            {t("disclaimer.market_prices_are_updated")}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t("disclaimer.the_prices_displayed_might")}</li>
            <li>{t("disclaimer.set_target_notifications_are")}</li>
            <li>{t("disclaimer.krishiai_does_not_guarantee")}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🏛️ {t("disclaimer.5_government_schemes_eligibility")}
          </h2>
          <p>
            {t("disclaimer.krishiai_offers_an_interactive")}
          </p>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <strong>{t("disclaimer.government_representation_disclaimer")}</strong>{' '}
            {t("disclaimer.krishiai_is_a_private")}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            📞 {t("disclaimer.6_support_questions")}
          </h2>
          <p>
            {t("disclaimer.if_you_require_professional")}
          </p>
        </section>

      </div>
    </div>
  );
}
