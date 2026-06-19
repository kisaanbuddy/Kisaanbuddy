'use client';

import Link from 'next/link';
import { Cookie, ArrowLeft, Shield, Eye, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function CookieClient() {
  const { t, lang } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-6">
      
      {/* Back button */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>{t("cookie_policy.back_to_home")}</span>
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow shadow-emerald-500/10">
            <Cookie className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            {t("cookie_policy.cookie_consent")}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          {t("cookie_policy.cookie_policy")}
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          {t("cookie_policy.last_updated_june_5")}
        </p>
      </div>

      {/* Policy contents */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("cookie_policy.1_what_are_cookies")}
          </h2>
          <p>
            {t("cookie_policy.cookies_are_small_text")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("cookie_policy.2_how_KisaanBuddy_uses")}
          </h2>
          <p>
            {t("cookie_policy.we_use_both_first")}
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">{t("cookie_policy.essential_cookies")}</strong>{' '}
              {t("cookie_policy.these_cookies_are_critical")}
            </li>
            <li>
              <strong className="text-foreground">{t("cookie_policy.preference_cookies")}</strong>{' '}
              {t("cookie_policy.these_cookies_allow_us")}
            </li>
            <li>
              <strong className="text-foreground">{t("cookie_policy.analytics_cookies")}</strong>{' '}
              {t("cookie_policy.we_run_telemetry_scripts")}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🎯 {t("cookie_policy.3_google_adsense_cookies")}
          </h2>
          <p>
            {t("cookie_policy.third_party_vendors_including")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            {t("cookie_policy.4_managing_your_cookie")}
          </h2>
          <p>
            {t("cookie_policy.you_have_the_right")}
          </p>
          <p>
            {t("cookie_policy.to_opt_out_of")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            ✉️ {t("cookie_policy.5_more_information")}
          </h2>
          <p>
            {t("cookie_policy.for_any_further_questions")}
          </p>
        </section>

      </div>
    </div>
  );
}
