'use client';

import Link from 'next/link';
import { Scale, ArrowLeft, Shield, AlertTriangle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function TermsClient() {
  const { t, lang } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-6">
      
      {/* Back button */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>{t("terms.back_to_home")}</span>
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow shadow-emerald-500/10">
            <Scale className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            {t("terms.terms_of_use")}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          {t("terms.terms_conditions")}
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          {t("terms.last_updated_june_5")}
        </p>
      </div>

      {/* Policy contents */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("terms.1_agreement_to_terms")}
          </h2>
          <p>
            {t("terms.by_accessing_or_using")}
          </p>
          <p>
            {t("terms.these_terms_apply_to")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("terms.2_ai_agricultural_predictions")}
          </h2>
          <p>
            {t("terms.KisaanBuddy_provides_crop_recommendation")}
          </p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs font-medium text-amber-600 dark:text-amber-400">
            <strong>{t("terms.critical_advisory")}</strong>{' '}
            {t("terms.all_suggestions_recommendations_and")}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            👤 {t("terms.3_user_accounts_registration")}
          </h2>
          <p>
            {t("terms.to_unlock_certain_features")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            ⚠️ {t("terms.4_limitation_of_liability")}
          </h2>
          <p>
            {t("terms.in_no_event_shall")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            📂 {t("terms.5_intellectual_property")}
          </h2>
          <p>
            {t("terms.the_KisaanBuddy_brand_logos")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("terms.6_governing_law")}
          </h2>
          <p>
            {t("terms.these_terms_shall_be")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🔧 {t("terms.7_changes_to_terms")}
          </h2>
          <p>
            {t("terms.we_reserve_the_right")}
          </p>
        </section>

      </div>
    </div>
  );
}
