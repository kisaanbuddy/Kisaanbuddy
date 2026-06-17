'use client';

import Link from 'next/link';
import { Lock, ArrowLeft, Shield, ShieldCheck, Eye, Cookie } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function PrivacyClient() {
  const { t, lang } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-6">
      
      {/* Back button */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>{t("privacy.back_to_home")}</span>
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow shadow-emerald-500/10">
            <Lock className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            {t("privacy.legal_document")}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          {t("privacy.privacy_policy")}
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          {t("privacy.last_updated_june_5")}
        </p>
      </div>

      {/* Policy contents */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("privacy.1_introduction")}
          </h2>
          <p>
            {t("privacy.welcome_to_krishiai")}
          </p>
          <p>
            {t("privacy.this_privacy_policy_applies")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("privacy.2_information_we_collect")}
          </h2>
          <p>
            {t("privacy.we_collect_personal_information")}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{t("privacy.account_information")}</strong>{' '}
              {t("privacy.names_email_addresses_phone")}
            </li>
            <li>
              <strong className="text-foreground">{t("privacy.farming_inputs")}</strong>{' '}
              {t("privacy.soil_health_parameters_nitrogen")}
            </li>
            <li>
              <strong className="text-foreground">{t("privacy.crop_disease_images")}</strong>{' '}
              {t("privacy.plant_leaves_and_crop")}
            </li>
            <li>
              <strong className="text-foreground">{t("privacy.location_data")}</strong>{' '}
              {t("privacy.approximate_or_precise_gps")}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Cookie className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("privacy.3_google_adsense_third")}
          </h2>
          <p>
            {t("privacy.we_use_google_adsense")}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t("privacy.google_uses_the_doubleclick")}</li>
            <li>
              {t("privacy.users_may_opt_out")}{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline hover:text-emerald-600">
                {t("privacy.ads_settings")}
              </a>.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("privacy.4_how_we_use")}
          </h2>
          <p>
            {t("privacy.we_process_your_information")}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t("privacy.providing_and_delivering_agricultural")}</li>
            <li>{t("privacy.analyzing_uploaded_plant_leaf")}</li>
            <li>{t("privacy.facilitating_connections_between_local")}</li>
            <li>{t("privacy.displaying_relevant_government_schemes")}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🛡️ {t("privacy.5_gdpr_ccpa_compliance")}
          </h2>
          <p>
            {t("privacy.if_you_are_accessing")}
          </p>
          <p>
            {t("privacy.to_exercise_any_of")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🔒 {t("privacy.6_data_security")}
          </h2>
          <p>
            {t("privacy.we_implement_appropriate_technical")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            📞 {t("privacy.7_contact_us")}
          </h2>
          <p>
            {t("privacy.if_you_have_questions")}
          </p>
          <div className="rounded-xl border border-border/20 bg-muted/15 p-4 space-y-1 font-semibold text-foreground max-w-sm mt-2">
            <p>{t("privacy.krishiai_development_team")}</p>
            <p className="font-mono text-xs text-muted-foreground">Email: privacy@kisaanbuddy.com</p>
            <p className="font-mono text-xs text-muted-foreground">{t("privacy.url_https_krishiaiindia_vercel")}</p>
          </div>
        </section>

      </div>
    </div>
  );
}
