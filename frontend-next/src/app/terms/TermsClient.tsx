'use client';

import React from 'react';
import {
  FileText,
  UserCheck,
  ShieldAlert,
  Store,
  Scale,
  CreditCard,
  Ban,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { LegalPageLayout, type LegalSectionMeta } from '@/components/legal/LegalPageLayout';

const SECTIONS: LegalSectionMeta[] = [
  { id: 'agreement', number: '1', title: 'Agreement to Terms & Acceptance' },
  { id: 'user-eligibility', number: '2', title: 'User Eligibility & Account Registration' },
  { id: 'account-security', number: '3', title: 'Account Responsibilities & Security' },
  { id: 'platform-usage', number: '4', title: 'Permitted Agricultural Platform Usage' },
  { id: 'marketplace-rules', number: '5', title: 'Agriculture Marketplace Framework' },
  { id: 'seller-buyer-duties', number: '6', title: 'Seller & Buyer Responsibilities' },
  { id: 'prohibited-activities', number: '7', title: 'Strictly Prohibited Activities & Reality-First Rule' },
  { id: 'service-availability', number: '8', title: 'Platform Availability & Rural Connectivity' },
  { id: 'payments-transactions', number: '9', title: 'Payments & Transaction Responsibilities' },
  { id: 'liability-disclaimer', number: '10', title: 'Limitation of Liability & Warranty Disclaimers' },
  { id: 'dispute-resolution', number: '11', title: 'Dispute Resolution & Governing Law (Patna, Bihar)' },
  { id: 'amendments', number: '12', title: 'Modifications to Terms & Severability' },
];

export function TermsClient() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="The official terms of service, governance framework, and marketplace guidelines establishing rights, safety, and responsibilities across the KisaanBuddy agricultural platform."
      badge="Legal & Terms of Service"
      badgeIcon={<FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      lastUpdated="November 2026"
      effectiveDate="November 2026"
      currentPath="/terms"
      sections={SECTIONS}
    >
      {/* 1. Agreement */}
      <section id="agreement" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            1
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Agreement to Terms &amp; Acceptance
          </h2>
        </div>

        <p>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Farmer&rdquo;, &ldquo;You&rdquo;) and <strong>KisaanBuddy</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By accessing, browsing, downloading, or using any feature of the KisaanBuddy platform, progressive web application, or associated services, you agree to be bound by these Terms and our Privacy Policy.
        </p>

        <p>
          If you do not agree with any part of these terms, you must discontinue your use of KisaanBuddy immediately.
        </p>
      </section>

      {/* 2. User Eligibility */}
      <section id="user-eligibility" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            2
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            User Eligibility &amp; Account Registration
          </h2>
        </div>

        <p>
          To register for an account or publish marketplace listings on KisaanBuddy:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Legal Capacity:</strong> You must be at least 18 years of age and capable of entering into legally enforceable contracts under the Indian Contract Act, 1872.
          </li>
          <li>
            <strong>Agricultural Standing:</strong> You must be a practicing farmer, cultivator, agricultural labourer, registered mandi trader/commission agent, equipment owner, or authorized rural enterprise representative.
          </li>
          <li>
            <strong>Accurate Representation:</strong> You agree to provide true, accurate, current, and complete information during mobile OTP verification or profile setup.
          </li>
        </ul>
      </section>

      {/* 3. Account Security */}
      <section id="account-security" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            3
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Account Responsibilities &amp; Security
          </h2>
        </div>

        <p>
          You are responsible for maintaining the confidentiality of your mobile authentication codes and account access credentials. You agree to:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>Never share your account OTP or delegate unauthorized third parties to list machinery or labour contracts on your behalf without verified consent.</li>
          <li>Promptly notify KisaanBuddy at <a href="mailto:info@kisaanbuddy.com" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">info@kisaanbuddy.com</a> if you suspect unauthorized access or security breaches of your telephone number.</li>
          <li>Accept responsibility for all activities and transactions executed under your authenticated mobile number.</li>
        </ul>
      </section>

      {/* 4. Platform Usage */}
      <section id="platform-usage" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            4
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Permitted Agricultural Platform Usage
          </h2>
        </div>

        <p>
          KisaanBuddy grants you a non-exclusive, non-transferable, revocable license to access our agricultural information, crop diagnostic engines, mandi feeds, weather forecasts, and marketplace tools solely for legitimate farming and agricultural commerce purposes.
        </p>

        <p>
          You may not scrape, systematically copy, automated-query, or index KisaanBuddy content for commercial resale without prior written authorization.
        </p>
      </section>

      {/* 5. Marketplace Rules */}
      <section id="marketplace-rules" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            5
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Agriculture Marketplace Framework
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
          <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
            <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Facilitation Role &amp; Direct Connection</span>
          </h3>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            KisaanBuddy acts as a technology intermediary enabling farmers, equipment owners, commodity purchasers, and agricultural labourers to discover and connect with each other directly. Unless explicitly stated in writing, <strong>KisaanBuddy is not a broker, manufacturer, auctioneer, or transacting party</strong> in the physical sale or hire of machinery, produce, or farm labour.
          </p>
        </div>
      </section>

      {/* 6. Seller & Buyer Duties */}
      <section id="seller-buyer-duties" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            6
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Seller &amp; Buyer Responsibilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
              Seller Obligations
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              <li>Must hold genuine ownership or documented legal authority over listed machinery, seeds, or crops.</li>
              <li>Must upload authentic, unedited photos of the actual item—no AI generated renders or stock photographs.</li>
              <li>Must accurately disclose tractor horsepower, operating hours, implement defects, and true rental/sale prices.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">
              Buyer Obligations
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              <li>Exercise due diligence by physically inspecting machinery, crop lot moisture, and registration papers prior to final payment.</li>
              <li>Adhere to agreed payment terms and hourly tractor rental meters upon completion of field operations.</li>
              <li>Refrain from making frivolous inquiries or unverified low-ball offers that disrupt genuine trade.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Prohibited Activities */}
      <section id="prohibited-activities" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            7
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Strictly Prohibited Activities &amp; Reality-First Rule
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-3">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-xs uppercase tracking-wider">
            <Ban className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>Zero-Tolerance Reality-First Standard</span>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            The following actions are strictly prohibited and result in immediate, permanent account suspension, listing removal, and potential reporting to local agricultural authorities:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-red-900 dark:text-red-300">
            <li>Uploading AI-generated, synthetic, or stock photographs to represent physical tractors or crops.</li>
            <li>Creating fake or dummy seller accounts, phantom inventory, or fabricated commercial volume.</li>
            <li>Publishing invented specifications, fake customer reviews, or artificial prices to mislead farmers.</li>
            <li>Posting unapproved chemical pesticides banned under the Insecticides Act, 1968.</li>
            <li>Exploitative or deceptive agricultural labour postings that violate minimum wage statutory protections.</li>
          </ul>
        </div>
      </section>

      {/* 8. Service Availability */}
      <section id="service-availability" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            8
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Platform Availability &amp; Rural Connectivity
          </h2>
        </div>

        <p>
          While we strive for 24/7/365 availability and optimize KisaanBuddy for low-bandwidth 2G/3G rural networks through Progressive Web App caching, we do not guarantee uninterrupted uptime. Scheduled maintenance, telecom disruptions, or upstream government mandi server outages may temporarily affect access without liability.
        </p>
      </section>

      {/* 9. Payments */}
      <section id="payments-transactions" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            9
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Payments &amp; Transaction Responsibilities
          </h2>
        </div>

        <p>
          Physical settlement, cash-on-delivery, and direct UPI transfers between farmers, labourers, and equipment providers occur directly between the transacting parties. KisaanBuddy imposes zero hidden commission fees on direct farmer-to-farmer connections. When third-party digital payment gateways are enabled, their respective transaction terms and RBI compliance frameworks apply.
        </p>
      </section>

      {/* 10. Liability Disclaimer */}
      <section id="liability-disclaimer" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            10
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Limitation of Liability &amp; Warranty Disclaimers
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-stone-700 dark:text-stone-300 space-y-2">
          <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>&ldquo;As Is&rdquo; Agricultural Advisory Notice</span>
          </p>
          <p>
            To the maximum extent permitted by applicable Indian law, KisaanBuddy and its developers disclaim all express or implied warranties, including merchantability, fitness for a particular agronomic purpose, or title. In no event shall KisaanBuddy be liable for crop loss, reduced agricultural yields, machinery breakdown, extreme weather damage, or mandi price variances.
          </p>
        </div>
      </section>

      {/* 11. Dispute Resolution */}
      <section id="dispute-resolution" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            11
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Dispute Resolution &amp; Governing Law (Patna, Bihar)
          </h2>
        </div>

        <p>
          These Terms and any dispute arising under or in connection with KisaanBuddy shall be governed by and construed in accordance with the laws of the Republic of India.
        </p>

        <p className="text-xs text-stone-600 dark:text-stone-300">
          In the event of a dispute, parties agree to first attempt good-faith informal mediation for a period of thirty (30) days by contacting our administrative desk. If unresolved, the courts situated in <strong>Patna, Bihar, India</strong> shall possess exclusive jurisdiction over all legal claims.
        </p>
      </section>

      {/* 12. Amendments */}
      <section id="amendments" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            12
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Modifications to Terms &amp; Severability
          </h2>
        </div>

        <p>
          We reserve the right to revise or update these Terms periodically to reflect evolving agricultural features, statutory regulations, or operational enhancements. Continued use of KisaanBuddy after the posting of revised terms indicates your acceptance.
        </p>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-600 dark:text-stone-400">
          For legal inquiries regarding these Terms, contact our legal counsel team at <a href="mailto:info@kisaanbuddy.com" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">info@kisaanbuddy.com</a>.
        </div>
      </section>
    </LegalPageLayout>
  );
}
