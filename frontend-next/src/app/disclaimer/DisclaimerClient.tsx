'use client';

import React from 'react';
import {
  AlertTriangle,
  Leaf,
  CloudSun,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  Building2,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { LegalPageLayout, type LegalSectionMeta } from '@/components/legal/LegalPageLayout';

const SECTIONS: LegalSectionMeta[] = [
  { id: 'general-disclaimer', number: '1', title: 'General Informational Nature of Agricultural Advice' },
  { id: 'ai-disease-limits', number: '2', title: 'AI-Generated Crop Disease Diagnosis Limits' },
  { id: 'chemical-safety', number: '3', title: 'Chemical Pesticide & Agrochemical Safety Advisory' },
  { id: 'weather-data', number: '4', title: 'Weather Intelligence & Meteorological Alert Limits' },
  { id: 'mandi-rates', number: '5', title: 'Live Mandi Wholesale Commodity Price Dynamics' },
  { id: 'no-guarantees', number: '6', title: 'No Guaranteed Crop Yield, Profit, or MSP Realization' },
  { id: 'independent-verification', number: '7', title: 'Mandatory Independent Verification Obligation' },
  { id: 'non-government', number: '8', title: 'Independent Private Entity (Non-Governmental) Notice' },
];

export function DisclaimerClient() {
  return (
    <LegalPageLayout
      title="Legal & Agricultural Disclaimer"
      subtitle="Critical operational guidance regarding the advisory nature of our artificial intelligence models, computer vision crop diagnosis, mandi rates, and weather intelligence."
      badge="Advisory & Liability Disclaimer"
      badgeIcon={<AlertTriangle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      lastUpdated="November 2026"
      effectiveDate="November 2026"
      currentPath="/disclaimer"
      sections={SECTIONS}
    >
      {/* 1. General Disclaimer */}
      <section id="general-disclaimer" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            1
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            General Informational Nature of Agricultural Advice
          </h2>
        </div>

        <p>
          All content, automated suggestions, fertilizer calculators, agronomic schedules, disease analyses, and seasonal guidance delivered through <strong>KisaanBuddy</strong> are provided strictly for <strong>educational and informational guidance purposes</strong>.
        </p>

        <p>
          Agricultural science is inherently dependent on biological factors, micro-climates, soil physical dynamics, prior field chemical histories, irrigation quality, and rapid biological mutations. Digital guidance must never be considered exhaustive, absolute, or applicable universally to every farm plot without contextual assessment.
        </p>
      </section>

      {/* 2. AI Disease Limits */}
      <section id="ai-disease-limits" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            2
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            AI-Generated Crop Disease Diagnosis Limits
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
            <Leaf className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Computer Vision &amp; Diagnostic Models Are Indicative</span>
          </div>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            Our <strong>Crop Doctor</strong> utilizes deep learning models trained on agricultural plant leaf datasets. While highly accurate under optimal conditions, image-based machine learning inference is subject to operational limitations:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-700 dark:text-stone-300">
            <li>Camera resolution, glare, shadows, focal blur, or multiple co-occurring deficiencies can impact classification confidence.</li>
            <li>Early-stage bacterial infections can closely mimic fungal spots or mechanical leaf tearing.</li>
            <li><strong>AI diagnosis is not a substitute for physical inspection</strong> by certified agronomists, plant pathologists, or extension scientists at your local Krishi Vigyan Kendra (KVK).</li>
          </ul>
        </div>
      </section>

      {/* 3. Chemical Safety */}
      <section id="chemical-safety" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            3
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Chemical Pesticide &amp; Agrochemical Safety Advisory
          </h2>
        </div>

        <p>
          Whenever biological remedies or chemical treatments (such as fungicides, insecticides, bactericides, or micronutrient sprays) are referenced:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            Farmers must strictly read the physical manufacturer container label, approved statutory dosages, and pre-harvest intervals (PHI) authorized by the <strong>Central Insecticides Board &amp; Registration Committee (CIBRC)</strong>.
          </li>
          <li>
            Never mix unapproved tank-mix combinations without verifying compatibility.
          </li>
          <li>
            Always utilize appropriate personal protective equipment (PPE), masks, and eye protection during spray applications. KisaanBuddy disclaims liability for improper chemical handling or crop phytotoxicity.
          </li>
        </ul>
      </section>

      {/* 4. Weather Data */}
      <section id="weather-data" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            4
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Weather Intelligence &amp; Meteorological Alert Limits
          </h2>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-xs">
          <CloudSun className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-semibold text-stone-900 dark:text-white">External Meteorological Dependency</p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Weather forecasts, rainfall projections, humidity readings, and heat wave advisories are aggregated from third-party meteorological observation APIs (such as Open-Meteo) and regional meteorological station sensors. Micro-climate cloudbursts, sudden localized hail, or unseasonal frost may occur without digital warning. Critical irrigation or harvest decisions should account for on-ground local sky conditions.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Mandi Rates */}
      <section id="mandi-rates" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            5
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Live Mandi Wholesale Commodity Price Dynamics
          </h2>
        </div>

        <p>
          Market prices published in the <strong>Mandi Prices</strong> module are synchronized from official agricultural produce market committee (APMC) returns and published wholesale lot auctions:
        </p>

        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
          <li>Displayed rates represent recorded minimum, maximum, and modal price points from previous auction rounds.</li>
          <li>Actual realization at the physical mandi yard gate varies significantly based on moisture content percentage, foreign matter foreign matter percentage, grain luster, variety purity, and arrival volumes on the trading day.</li>
          <li>KisaanBuddy does not guarantee that a trader or commission agent will purchase produce at the displayed platform benchmark rate.</li>
        </ul>
      </section>

      {/* 6. No Guarantees */}
      <section id="no-guarantees" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            6
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            No Guaranteed Crop Yield, Profit, or MSP Realization
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs space-y-2">
          <p className="font-bold text-stone-900 dark:text-white">
            Explicit Disclaimer of Financial &amp; Agronomic Outcomes:
          </p>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            KisaanBuddy makes no express or implied warranty that adopting recommendations generated by our AI tools, soil analyses, or crop calendars will result in increased yield, specific crop quality grades, lower operational expenditures, or profitable sale prices. Agricultural returns are subject to natural, biological, and commodity market forces outside human technological control.
          </p>
        </div>
      </section>

      {/* 7. Mandatory Verification */}
      <section id="independent-verification" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            7
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Mandatory Independent Verification Obligation
          </h2>
        </div>

        <p>
          Users agree to independently evaluate and cross-verify any critical agricultural strategy before committing capital, purchasing inputs, spraying chemicals, or signing delivery contracts. Please consult:
        </p>

        <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600 dark:text-stone-300">
          <li>Your local Block Agricultural Officer (BAO) or Village Agricultural Assistant (VAA).</li>
          <li>Scientists at your nearest Krishi Vigyan Kendra (KVK).</li>
          <li>Agronomy faculty at State Agricultural Universities (SAUs).</li>
          <li>Licensed agrochemical retailers possessing genuine seed and pesticide dealer permits.</li>
        </ul>
      </section>

      {/* 8. Non-Government Entity */}
      <section id="non-government" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            8
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Independent Private Entity (Non-Governmental) Notice
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-100">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Clarification of Institutional Status</span>
          </div>
          <p className="leading-relaxed">
            <strong>KisaanBuddy is a private, independent agricultural technology platform.</strong> KisaanBuddy is NOT an official agency, department, statutory board, or direct affiliate of the Government of India, the Ministry of Agriculture &amp; Farmers Welfare, or any State Department of Agriculture.
          </p>
          <p className="leading-relaxed">
            Government welfare schemes (such as PM-KISAN, PMFBY, or Sub-Mission on Agricultural Mechanization) described on the platform are provided solely for farmer awareness. For official applications, sanction letters, and beneficiary disbursements, farmers are directed to the respective official government portals (.gov.in / .nic.in).
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
