'use client';

import Link from 'next/link';
import { Scale, ArrowLeft, Shield, AlertTriangle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language';

export function TermsClient() {
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
            <Scale className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            Terms of Use
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Terms &amp; Conditions</h1>
        <p className="text-xs text-muted-foreground mt-2">Last Updated: June 5, 2026</p>
      </div>

      {/* Policy contents */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using KrishiAI, you agree to be bound by these Terms &amp; Conditions. If you do not agree with all of these terms, you are expressly prohibited from using the platform and must discontinue use immediately.
          </p>
          <p>
            These Terms apply to all visitors, registered farmers, researchers, workers, and others who access or use the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            2. AI Agricultural Predictions Disclaimer
          </h2>
          <p>
            KrishiAI provides crop recommendation models, plant disease diagnostics via leaf image uploads, weather forecasts, and APMC mandi price advisories.
          </p>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs font-medium text-amber-600 dark:text-amber-400">
            <strong>CRITICAL ADVISORY:</strong> All suggestions, recommendations, and diagnostic opinions produced by KrishiAI are powered by artificial intelligence models. They represent mathematical probabilities, NOT certified agricultural expert, agronomist, or chemical engineer guarantees. Farmers must verify all pesticide dosages, fertilizer ratios, and crop schedules with local agricultural extension officers or certified specialists before taking on-field action.
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            👤 3. User Accounts &amp; Registration
          </h2>
          <p>
            To unlock certain features (like saving entries to the Khet Diary or posting jobs to Worker Connect), you must create a user profile. You agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate, current, and complete details during signup.</li>
            <li>Maintain the confidentiality of your credentials and account password.</li>
            <li>Promptly notify us of any security breaches or unauthorized use of your profile.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            ⚠️ 4. Limitation of Liability
          </h2>
          <p>
            In no event shall KrishiAI, its co-founders, or partners be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of crop yield, financial loss from mandi trading, incorrect chemical/organic applications, or system downtime resulting from your use or inability to use our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            📂 5. Intellectual Property
          </h2>
          <p>
            The KrishiAI brand, logos, source code, designs, and AI training weights (excluding open-source model frameworks) are the exclusive property of KrishiAI and its co-founders. You may not copy, scrape, reproduce, or resell any elements of our platform without prior written consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            6. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal action or dispute arising from these Terms shall be resolved in the competent courts of Bihar or Maharashtra, India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            🔧 7. Changes to Terms
          </h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will post notification details of any revisions on this page. By continuing to access or use our platform after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

      </div>
    </div>
  );
}
