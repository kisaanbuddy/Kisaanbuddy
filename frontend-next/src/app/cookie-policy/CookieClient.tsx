'use client';

import Link from 'next/link';
import { Cookie, ArrowLeft, Shield, Eye, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function CookieClient() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-6">
      
      {/* Back button */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to home</span>
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow shadow-emerald-500/10">
            <Cookie className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            Cookie Consent
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Cookie Policy</h1>
        <p className="text-xs text-muted-foreground mt-2">Last Updated: June 5, 2026</p>
      </div>

      {/* Policy contents */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text files placed on your computer or mobile device by websites that you visit. They are widely used to make websites work more efficiently, improve your navigation experience, and provide information to the website owners.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            2. How KrishiAI Uses Cookies
          </h2>
          <p>
            We use both first-party and third-party cookies on our platform to support different operational functions. The cookies we utilize fall under the following categories:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Essential Cookies:</strong> These cookies are critical to authorize user sessions and keep you logged into your account. Without these cookies, features like Khet Diary logs or custom profile tracking cannot be provided.
            </li>
            <li>
              <strong className="text-foreground">Preference Cookies:</strong> These cookies allow us to remember decisions you make, such as your selected translation language (<span className="font-mono font-bold text-foreground">krishiai_lang</span>). This prevents you from having to select your language script on every page refresh.
            </li>
            <li>
              <strong className="text-foreground">Analytics Cookies:</strong> We run telemetry scripts (e.g. Vercel Analytics) that deploy anonymous cookie structures. These monitor site loading latency, page visits, and click rates to help us optimize backend server response times.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🎯 3. Google AdSense Cookies
          </h2>
          <p>
            Third-party vendors, including Google AdSense, use cookies to serve advertisements based on your prior visits to KrishiAI or other web portals.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visits to our site.</li>
            <li>These cookies collect non-personally identifiable metrics (such as geographical region or category interest groups) to optimize display ads.</li>
            <li>The primary tracking script utilized is the DoubleClick DART cookie.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            4. Managing Your Cookie Preferences
          </h2>
          <p>
            You have the right to decide whether to accept or reject cookies. Most web browsers are configured to accept cookies by default. You can modify your browser settings to clear existing cookies or block new cookies altogether.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To opt out of Google&apos;s personalized advertising cookies, navigate to Google&apos;s <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline font-bold">Ads Settings</a>.</li>
            <li>To block other third-party cookies, visit the Digital Advertising Alliance&apos;s portal at <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline font-bold">aboutads.info</a>.</li>
            <li>Please note that if you choose to reject essential cookies, some portions of our platform (such as logging in or saving settings) may not function correctly.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            ✉️ 5. More Information
          </h2>
          <p>
            For any further questions regarding our cookie disclosures, please send us a mail at <span className="font-mono text-foreground font-bold">adityaoutlier5@gmail.com</span> or contact us via our form on the Contact page.
          </p>
        </section>

      </div>
    </div>
  );
}
