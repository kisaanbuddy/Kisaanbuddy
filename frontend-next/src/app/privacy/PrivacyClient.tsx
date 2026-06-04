'use client';

import Link from 'next/link';
import { Lock, ArrowLeft, Shield, ShieldCheck, Eye, Cookie } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function PrivacyClient() {
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
            <Lock className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            Legal Document
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mt-2">Last Updated: June 5, 2026</p>
      </div>

      {/* Policy contents */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            1. Introduction
          </h2>
          <p>
            Welcome to KrishiAI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We operate the KrishiAI smart agriculture platform accessible at <span className="text-emerald-500 font-semibold">https://krishiaiindia.vercel.app</span>. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this policy or our practices, please contact us at <span className="font-mono text-foreground">adityaoutlier5@gmail.com</span>.
          </p>
          <p>
            This Privacy Policy applies to all information collected through our website, web application, chatbot, disease diagnosis upload interfaces, and any related services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            2. Information We Collect
          </h2>
          <p>We collect personal information that you voluntarily provide to us when registering, using our services, or contacting us. This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Account Information:</strong> Names, email addresses, phone numbers, and encrypted passwords.</li>
            <li><strong className="text-foreground">Farming Inputs:</strong> Soil health parameters (Nitrogen, Phosphorus, Potassium levels, soil pH, organic carbon content) and land size statistics.</li>
            <li><strong className="text-foreground">Crop Disease Images:</strong> Plant leaves and crop pictures uploaded by you to our Crop Disease AI diagnostics. These images are processed to identify pathogens.</li>
            <li><strong className="text-foreground">Location Data:</strong> Approximate or precise GPS location details provided by your browser to resolve hyper-local weather alerts and mandi market prices.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Cookie className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            3. Google AdSense &amp; Third-Party Cookies
          </h2>
          <p>
            We use Google AdSense to serve advertisements on our website. Google, as a third-party vendor, uses cookies to serve ads on our site. Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site or other sites on the Internet.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Google uses the <strong className="text-foreground">DoubleClick DART cookie</strong> to serve ads.</li>
            <li>Users may opt out of personalized advertising by visiting Google&apos;s <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline hover:text-emerald-600">Ads Settings</a>.</li>
            <li>Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline hover:text-emerald-600">aboutads.info</a>.</li>
          </ul>
          <p>
            When you visit KrishiAI, third-party cookies may be placed on your browser to collect anonymous behavioral details (e.g., pages viewed, time spent) to target relevant advertisements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            4. How We Use Your Information
          </h2>
          <p>We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, and compliance with our legal obligations. This includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Providing and delivering agricultural insights (such as soil assessments, crop predictions, and weather warnings).</li>
            <li>Analyzing uploaded plant leaf images to determine crop diseases and recommend organic or chemical remedies.</li>
            <li>Facilitating connections between local farmers and farm workers via Worker Connect.</li>
            <li>Displaying relevant government schemes eligibility.</li>
            <li>Serving personalized or non-personalized advertisements via Google AdSense.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🛡️ 5. GDPR &amp; CCPA Compliance
          </h2>
          <p>
            If you are accessing KrishiAI from the European Union (EU) or California (USA), you have specific data protection rights under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA). These rights include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The right to request access to and receive copies of the personal data we hold about you.</li>
            <li>The right to request rectification of inaccurate data or deletion of your records.</li>
            <li>The right to withdraw your consent to data processing (e.g., location settings or camera uploads) at any time.</li>
            <li>The right to opt-out of the sale of your personal information (note: we do not sell farmer or user data to third parties).</li>
          </ul>
          <p>To exercise any of these rights, please contact our administrator at <span className="font-mono text-foreground">adityaoutlier5@gmail.com</span>.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🔒 6. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our services is at your own risk. You should only access our services within a secure environment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            📞 7. Contact Us
          </h2>
          <p>
            If you have questions or comments about this policy, you can contact us at:
          </p>
          <div className="rounded-xl border border-border/20 bg-muted/15 p-4 space-y-1 font-semibold text-foreground max-w-sm mt-2">
            <p>KrishiAI Development Team</p>
            <p className="font-mono text-xs text-muted-foreground">Email: adityaoutlier5@gmail.com</p>
            <p className="font-mono text-xs text-muted-foreground">URL: https://krishiaiindia.vercel.app</p>
          </div>
        </section>

      </div>
    </div>
  );
}
