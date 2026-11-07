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
  ExternalLink,
  Users,
  Building2,
  DollarSign,
  CloudSun,
} from 'lucide-react';
import { LegalPageLayout, type LegalSectionMeta } from '@/components/legal/LegalPageLayout';

const SECTIONS: LegalSectionMeta[] = [
  { id: 'reality-first-core', number: '1', title: 'The Reality-First Principle: Our Foundational Law' },
  { id: 'sourcing-agronomy', number: '2', title: 'How Agricultural Information & Crop Guides Are Sourced' },
  { id: 'sourcing-mandi', number: '3', title: 'Mandi Intelligence: AGMARKNET, eNAM & APMC Auctions' },
  { id: 'sourcing-msp', number: '4', title: 'Statutory Minimum Support Price (MSP) & Procurement Verification' },
  { id: 'sourcing-weather', number: '5', title: 'Numerical Weather Modeling & Meteorological Feeds' },
  { id: 'catalog-vs-commercial', number: '6', title: 'Strict Separation: Reference Catalogue vs Commercial Listings' },
  { id: 'sourcing-agrilabour', number: '7', title: 'AgriLabour Maintenance & Automatic Contract Expiry Lifecycle' },
  { id: 'provenance-timestamps', number: '8', title: 'Data Provenance, Timestamps & Stale Data Detection' },
  { id: 'prohibited-content', number: '9', title: 'Zero Tolerance for Fabricated Data & AI Product Imagery' },
  { id: 'reporting-corrections', number: '10', title: 'Reporting Inaccuracies, Editorial Workflow & Response Timelines' },
];

export function EditorialPolicyClient() {
  return (
    <LegalPageLayout
      title="Editorial & Data Sources Policy"
      subtitle="Our non-negotiable commitment to authentic agricultural data, verifiable agronomic sourcing, transparent provenance, and strict separation between reference benchmarks and live farmer inventory."
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
          KisaanBuddy is built upon a non-negotiable operational principle: <strong>REALITY FIRST</strong>. We never sacrifice authenticity to make the platform look artificially populated, attractive, or commercial.
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
            <strong>ICAR &amp; State Agricultural Universities (SAUs):</strong> Crop cultivation packages of practices, sowing depth guidelines, seed treatment protocols, and fertilizer schedules are adapted from publications of the <a href="https://icar.org.in" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 font-semibold underline">Indian Council of Agricultural Research (ICAR)</a> and premier State Agricultural Universities (PAU Ludhiana, CCSHAU Hisar, UAS Bangalore, TNAU Coimbatore, IARI Pusa).
          </li>
          <li>
            <strong>CIBRC Statutory Approvals:</strong> Any chemical control formulation, fungicide, or herbicide mentioned in diagnostic advisories must strictly align with statutory labels approved by the <strong>Central Insecticides Board &amp; Registration Committee (CIBRC)</strong> under the Insecticides Act, 1968. Banned, restricted, or counterfeit products are never recommended.
          </li>
          <li>
            <strong>Krishi Vigyan Kendra (KVK) Guidance:</strong> Regional disease alerts are aligned with agro-meteorological advisories issued by district KVKs.
          </li>
        </ul>
      </section>

      {/* 3. Mandi Intelligence */}
      <section id="sourcing-mandi" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            3
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Mandi Intelligence: AGMARKNET, eNAM &amp; APMC Auctions
          </h2>
        </div>

        <p>
          Wholesale agricultural market price observations are ingested through authoritative government channels:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>AGMARKNET / Data.gov.in (OGD)</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Real-time daily electronic returns reported by Agricultural Produce Market Committees (APMCs) across Indian states under the Open Government Data (OGD) License. Every record displays the actual mandi yard name, commodity, variety, arrival tonnes, minimum, maximum, and modal auction price.
            </p>
            <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              <span>AGMARKNET Official Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>eNAM (National Agriculture Market)</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Integration framework referencing unified electronic trading portals across 1,000+ regulated mandis. We clearly state: mandi prices are reference auction indicators, not an offer to buy or guaranteed price floor.
            </p>
            <a href="https://enam.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
              <span>eNAM National Agriculture Market</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <strong>Non-Fabrication Policy:</strong> We never generate mathematical interpolations or artificial mandi prices. If an APMC mandi has not submitted auction returns for a commodity, our system explicitly displays: <em>&ldquo;Verified mandi data is currently unavailable for this market.&rdquo;</em>
        </div>
      </section>

      {/* 4. Sourcing MSP */}
      <section id="sourcing-msp" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            4
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Statutory Minimum Support Price (MSP) &amp; Procurement Verification
          </h2>
        </div>

        <p>
          Minimum Support Prices (MSP) displayed across KisaanBuddy are tracked exclusively through gazette notifications:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Cabinet Committee on Economic Affairs (CCEA):</strong> Rates are updated following official press communiqués approved by the CCEA under the Ministry of Agriculture &amp; Farmers Welfare.
          </li>
          <li>
            <strong>Marketing Season Differentiation:</strong> Kharif Marketing Season (KMS) and Rabi Marketing Season (RMS) MSP figures are never combined or interchanged. Every crop card explicitly notes the applicable marketing season (e.g. <em>RMS 2026-27</em>) and effective year.
          </li>
          <li>
            <strong>Designated Nodal Agencies:</strong> Procurement guidelines reference the Food Corporation of India (FCI), NAFED, Cotton Corporation of India (CCI), and authorized state civil supplies corporations (such as MP e-Uparjan, Haryana MFMB, and Punjab Anaaj Kharid) with official portal registration links.
          </li>
        </ul>
      </section>

      {/* 5. Sourcing Weather */}
      <section id="sourcing-weather" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            5
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Numerical Weather Modeling &amp; Meteorological Feeds
          </h2>
        </div>

        <p>
          Weather intelligence combines high-resolution numerical atmospheric forecast models with real-time observational satellite telemetry:
        </p>

        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
            <CloudSun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Open-Meteo &amp; National Weather Feeds</span>
          </div>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            Data is retrieved based on precise GPS coordinates or verified district centroids. Every weather output distinguishes between <strong>current physical observations</strong> (temperature, relative humidity, barometric pressure, wind speed) and <strong>predictive forecasts</strong> (hourly rain probability, multi-day precipitation outlook).
          </p>
          <p className="text-[11px] text-stone-500">
            Source: Numerical weather prediction feeds (ECMWF, GFS, DWD) via Open-Meteo API. Refreshed with short TTL caching to guarantee timely agricultural advisories.
          </p>
        </div>
      </section>

      {/* 6. Catalog vs Commercial */}
      <section id="catalog-vs-commercial" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            6
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

      {/* 7. Sourcing AgriLabour */}
      <section id="sourcing-agrilabour" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            7
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            AgriLabour Maintenance &amp; Automatic Contract Expiry Lifecycle
          </h2>
        </div>

        <p>
          KisaanBuddy AgriLabour operates under strict transparency, wage fairness, and authentic job opportunity governance:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Official Wage Intelligence:</strong> Reference wage data is drawn from the <em>Labour Bureau, Ministry of Labour &amp; Employment (Wage Rates in Rural India - WRRI)</em> and <em>MGNREGA Section 6(1) Notified Wages</em> published by the Ministry of Rural Development.
          </li>
          <li>
            <strong>Automatic Job Lifecycle Management:</strong> Job postings are subjected to continuous expiry evaluation. Any job opening whose application deadline has elapsed or whose field operation duration has passed is automatically marked <code>expired</code> and removed from active search. Cancelled or filled contracts never appear as active vacancies.
          </li>
          <li>
            <strong>No Fake Worker Profiles or Ratings:</strong> Every worker profile represents a phone-authenticated rural laborer, custom hiring operator, or FPO labor collective. We never simulate worker availability, invent artificial vacancies, or fabricate customer reviews.
          </li>
        </ul>
      </section>

      {/* 8. Provenance & Timestamps */}
      <section id="provenance-timestamps" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            8
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Data Provenance, Timestamps &amp; Stale Data Detection
          </h2>
        </div>

        <p>
          Every piece of third-party or external intelligence displayed on KisaanBuddy carries transparent provenance:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li><strong>Source Attribution:</strong> Clearly states the originating agency, testing center, or official mandi market yard.</li>
          <li><strong>Last-Updated Timestamp:</strong> Indicates the exact date and hour when the data was retrieved or verified.</li>
          <li><strong>Stale Data Detection (&gt;48 Hours):</strong> Mandi observations older than 48 hours automatically display an amber alert warning farmers that the rate represents historical reference data and requires local market confirmation before sale.</li>
          <li><strong>Absence of Data:</strong> When genuine external data is temporarily unavailable, we state &ldquo;Verified mandi data is currently unavailable for this market&rdquo; rather than displaying an invented placeholder or simulated estimate.</li>
        </ul>
      </section>

      {/* 9. Prohibited Content */}
      <section id="prohibited-content" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            9
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Zero Tolerance for Fabricated Data &amp; AI Product Imagery
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

      {/* 10. Reporting Inaccuracies & Workflow */}
      <section id="reporting-corrections" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            10
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Reporting Inaccuracies, Editorial Workflow &amp; Response Timelines
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
            <strong>In-App:</strong> Tap the &ldquo;Report Listing&rdquo; button on any produce lot or equipment posting to immediately submit a flag for administrative review.
          </p>
        </div>

        <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300 pt-2">
          <h4 className="font-bold text-stone-900 dark:text-white">Editorial Correction Workflow &amp; Timelines:</h4>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              <strong>Immediate Triage (within 12 hours):</strong> The reported listing or data point is quarantined if there is credible reason to suspect deceptive activity or safety concerns.
            </li>
            <li>
              <strong>Verification &amp; Fact-Check (within 24–48 hours):</strong> Our agronomy or marketplace desk reviews primary sources, contacts the listing owner, or cross-references the official APMC auction sheet.
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
