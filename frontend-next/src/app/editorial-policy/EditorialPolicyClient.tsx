'use client';

import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Search,
  Database,
  Layers,
  Clock,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Mail,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { LegalPageLayout, type LegalSectionMeta } from '@/components/legal/LegalPageLayout';

const SECTIONS: LegalSectionMeta[] = [
  { id: 'reality-first-core', number: '1', title: 'The Reality-First Principle: Our Foundational Law' },
  { id: 'sourcing-agronomy', number: '2', title: 'How Agricultural Information & Crop Guides Are Sourced' },
  { id: 'sourcing-mandi-weather', number: '3', title: 'Live Mandi Prices & Weather Intelligence Verification' },
  { id: 'catalog-vs-commercial', number: '4', title: 'Strict Separation: Reference Catalogue vs Commercial Listings' },
  { id: 'provenance-timestamps', number: '5', title: 'Data Provenance, Timestamps & Agency Attribution' },
  { id: 'prohibited-content', number: '6', title: 'Zero Tolerance for Fabricated Data & AI Imagery' },
  { id: 'reporting-inaccuracies', number: '7', title: 'How to Report Inaccurate Information or Deceptive Listings' },
  { id: 'correction-workflow', number: '8', title: 'Editorial Correction Workflow & Response Timelines' },
];

export function EditorialPolicyClient() {
  return (
    <LegalPageLayout
      title="Editorial & Data Sources Policy"
      subtitle="Our non-negotiable commitment to authentic data, verifiable agricultural sourcing, transparent provenance, and strict separation between reference benchmarks and live farmer inventory."
      badge="Editorial Standards & Data Authenticity"
      badgeIcon={<BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      lastUpdated="November 2026"
      effectiveDate="November 2026"
      currentPath="/editorial-policy"
      sections={SECTIONS}
    >
      {/* 1. Reality First Core */}
      <section id="reality-first-core" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            1
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            The Reality-First Principle: Our Foundational Law
          </h2>
        </div>

        <p>
          KisaanBuddy is built upon a non-negotiable operational principle: <strong>REALITY FIRST</strong>. Never sacrifice authenticity to make the platform look populated, attractive, or artificially active.
        </p>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 space-y-2 text-xs">
          <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>The Final Rule: Authenticity Trumps Visual Completeness</span>
          </p>
          <p className="leading-relaxed">
            It is fundamentally better to present fewer genuine products, real farm machinery, and authentic price reports than hundreds of misleading or fabricated listings. This standard applies universally across KisaanBuddy&rsquo;s frontend, backend, APIs, machine learning features, and external integrations.
          </p>
        </div>
      </section>

      {/* 2. Sourcing Agronomy */}
      <section id="sourcing-agronomy" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            2
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            How Agricultural Information &amp; Crop Guides Are Sourced
          </h2>
        </div>

        <p>
          Agricultural science requires rigor. We source our agronomic guidance exclusively from verified, published public research institutions:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>ICAR &amp; State Agricultural Universities (SAUs):</strong> Crop cultivation packages of practices, sowing depth guidelines, seed treatment protocols, and fertilizer schedules are adapted from publications of the Indian Council of Agricultural Research and premier State Agricultural Universities.
          </li>
          <li>
            <strong>CIBRC Statutory Approvals:</strong> Any chemical control formulation, fungicide, or herbicide mentioned in diagnostic advisories must strictly align with statutory labels approved by the <strong>Central Insecticides Board &amp; Registration Committee (CIBRC)</strong> under the Ministry of Agriculture. Banned, restricted, or counterfeit products are never recommended.
          </li>
          <li>
            <strong>Krishi Vigyan Kendra (KVK) Guidance:</strong> Regional disease alerts are aligned with agro-meteorological advisories issued by district KVKs.
          </li>
        </ul>
      </section>

      {/* 3. Sourcing Mandi & Weather */}
      <section id="sourcing-mandi-weather" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            3
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Live Mandi Prices &amp; Weather Intelligence Verification
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>APMC Wholesale Mandi Prices</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Mandi data is aggregated directly from official Agricultural Produce Market Committee (APMC) electronic returns via Agmarknet and validated regional trade registers. We never invent commodity prices or display hypothetical figures. Where real-time arrivals have not been reported, the system explicitly marks data as &ldquo;Last Recorded Auction&rdquo; with its exact date.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Meteorological Observations</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Weather data is obtained from established numerical forecast models and global observational satellite feeds (including Open-Meteo) using verified district-level latitude and longitude coordinates. We never fabricate rainfall forecasts or temperature alerts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Catalog vs Commercial */}
      <section id="catalog-vs-commercial" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            4
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Strict Separation: Reference Catalogue vs Commercial Listings
          </h2>
        </div>

        <p>
          To protect buyers and farmers from confusion, KisaanBuddy enforces a structural separation in our data layer:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 space-y-1.5">
            <div className="font-bold text-stone-900 dark:text-white text-sm">
              Type A: Reference Catalogue Products
            </div>
            <p className="text-stone-600 dark:text-stone-300">
              Government tractor test summaries (such as Central Farm Machinery Training &amp; Testing Institute reports), OEM manufacturer technical specifications, and indicative national price benchmarks. <strong>A reference machinery model is never presented as an available commercial listing.</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 space-y-1.5">
            <div className="font-bold text-stone-900 dark:text-white text-sm">
              Type B: Live Commercial Farmer Listings
            </div>
            <p className="text-stone-600 dark:text-stone-300">
              Actual machinery, implements, seed batches, or harvested commodities listed by real, verified farmers, owners, or local dealers for rent or sale. Every commercial listing must have a real owner, verifiable telephone contact, and genuine real-world location.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Provenance & Timestamps */}
      <section id="provenance-timestamps" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            5
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Data Provenance, Timestamps &amp; Agency Attribution
          </h2>
        </div>

        <p>
          Every piece of third-party or external intelligence displayed on KisaanBuddy carries transparent provenance:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li><strong>Source Attribution:</strong> Clearly states the originating agency, testing center, or official mandi market yard.</li>
          <li><strong>Last-Updated Timestamp:</strong> Indicates the exact date and hour when the data was retrieved or verified.</li>
          <li><strong>Absence of Data:</strong> When genuine external data is temporarily unavailable, we state &ldquo;Data currently unavailable for this mandi/crop&rdquo; rather than displaying an invented placeholder or simulated estimate.</li>
        </ul>
      </section>

      {/* 6. Prohibited Content */}
      <section id="prohibited-content" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            6
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Zero Tolerance for Fabricated Data &amp; AI Imagery
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-900 dark:text-red-200 space-y-2">
          <p className="font-bold text-sm">Strictly Prohibited Across All Subsystems:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>• AI-generated product photographs</div>
            <div>• Fake product listings or phantom inventory</div>
            <div>• Dummy seller accounts or artificial volume</div>
            <div>• Fabricated prices or artificial discounts</div>
            <div>• Invented horsepower or machinery specs</div>
            <div>• Simulated transactions presented as real</div>
            <div>• Unverified agricultural information</div>
            <div>• Random stock images assigned to listings</div>
          </div>
        </div>
      </section>

      {/* 7. Reporting Inaccuracies */}
      <section id="reporting-inaccuracies" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            7
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            How to Report Inaccurate Information or Deceptive Listings
          </h2>
        </div>

        <p>
          We actively encourage farmers, agronomists, traders, and community members to challenge and report any questionable listing, inaccurate mandi rate, or incorrect diagnostic guidance.
        </p>

        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-2 text-xs">
          <p className="font-bold text-stone-900 dark:text-white">Direct Reporting Channels:</p>
          <p className="text-stone-600 dark:text-stone-300">
            <strong>Email:</strong>{' '}
            <a href="mailto:info@kisaanbuddy.com" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
              info@kisaanbuddy.com
            </a>{' '}
            (Subject: <em>&ldquo;Data Inaccuracy Report&rdquo;</em> or <em>&ldquo;Listing Verification Concern&rdquo;</em>)
          </p>
          <p className="text-stone-600 dark:text-stone-300">
            <strong>In-App:</strong> Tap the &ldquo;Feedback&rdquo; button located in the footer or navigation bar to submit real-time corrections.
          </p>
        </div>
      </section>

      {/* 8. Correction Workflow */}
      <section id="correction-workflow" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            8
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Editorial Correction Workflow &amp; Response Timelines
          </h2>
        </div>

        <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
          <p>
            When an inaccuracy report is received by our editorial team:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Immediate Triage (within 12 hours):</strong> The reported listing or data point is quarantined if there is credible reason to suspect deceptive activity or safety concerns.
            </li>
            <li>
              <strong>Verification &amp; Fact-Check (within 24–48 business hours):</strong> Our agronomy or marketplace desk reviews primary sources, contacts the listing owner, or cross-references the official APMC auction sheet.
            </li>
            <li>
              <strong>Resolution:</strong> If inaccurate, the data is promptly corrected or permanently purged. Where significant misinformation could affect farmers, a correction notice is issued.
            </li>
          </ol>
        </div>
      </section>
    </LegalPageLayout>
  );
}
