'use client';

import React from 'react';
import {
  Lock,
  UserCheck,
  MapPin,
  Camera,
  Mic,
  Store,
  Cookie,
  Server,
  Share2,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { LegalPageLayout, type LegalSectionMeta } from '@/components/legal/LegalPageLayout';

const SECTIONS: LegalSectionMeta[] = [
  { id: 'introduction', number: '1', title: 'Introduction & Core Privacy Commitment' },
  { id: 'information-collected', number: '2', title: 'Information We Collect from Users' },
  { id: 'photos-voice', number: '3', title: 'Farm Photos, Leaf Images & Voice Recordings' },
  { id: 'marketplace-data', number: '4', title: 'Marketplace & Agricultural Labour Data' },
  { id: 'cookies-analytics', number: '5', title: 'Cookies, Telemetry & Analytical Technologies' },
  { id: 'adsense-advertising', number: '6', title: 'Google AdSense & Third-Party Advertising' },
  { id: 'how-google-uses-data', number: '7', title: 'How Google Uses Information on Our Site' },
  { id: 'third-party-integrations', number: '8', title: 'Third-Party Services & Integrations' },
  { id: 'storage-security', number: '9', title: 'How Information is Stored, Used & Secured' },
  { id: 'sharing-policy', number: '10', title: 'Data Sharing & Strict Non-Sale Policy' },
  { id: 'user-rights', number: '11', title: 'User Privacy Rights & Data Control' },
  { id: 'contact-dpo', number: '12', title: 'Grievance Officer & Contact Information' },
];

export function PrivacyClient() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Complete transparency on how KisaanBuddy collects, uses, protects, and handles farm data, photographs, voice recordings, location information, and advertising cookies."
      badge="Data Protection & Privacy"
      badgeIcon={<Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      lastUpdated="November 2026"
      effectiveDate="November 2026"
      currentPath="/privacy"
      sections={SECTIONS}
    >
      {/* 1. Introduction */}
      <section id="introduction" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            1
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Introduction &amp; Core Privacy Commitment
          </h2>
        </div>

        <p>
          Welcome to <strong>KisaanBuddy</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). KisaanBuddy is dedicated to delivering genuine, accessible agricultural intelligence and marketplace connectivity to Indian farmers, growers, mandi traders, agricultural workers, and rural agribusinesses.
        </p>

        <p>
          We hold a fundamental belief: <strong>Indian farmers own their data.</strong> We do not commoditize your confidential farm records, personal mobile numbers, or field geometry. This Privacy Policy details our transparent data handling practices across the KisaanBuddy web platform, progressive web application (PWA), and associated agricultural services.
        </p>

        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Reality-First &amp; Google AdSense Compliance Standard</span>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            This policy is formulated in full alignment with the <em>Digital Personal Data Protection Act (DPDP Act 2023)</em> of India, global fair information practices, and Google Publisher Policies for Google AdSense transparency.
          </p>
        </div>
      </section>

      {/* 2. Information Collected */}
      <section id="information-collected" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            2
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Information We Collect from Users
          </h2>
        </div>

        <p>
          We only collect information necessary to provide functional agricultural advisory, live market rates, localized weather notifications, and trusted peer-to-peer farmer connections:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>A. Account &amp; Profile Information</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              When creating an account or registering as a farmer, worker, or merchant, we may collect your name, mobile telephone number, user category (Farmer, Agricultural Labourer, Equipment Owner, Mandi Trader), preferred language (such as Hindi, English, Kannada, Tamil, Telugu, Marathi, Bengali, or Punjabi), and optional email address.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>B. Farm &amp; Location Information</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              To furnish localized crop advisory, weather forecasts, and APMC mandi rates, we request your approximate or precise geographic location (state, district, taluk/block, or GPS coordinates). You may also voluntarily log your land acreage, soil parameters (Nitrogen, Phosphorus, Potassium, Soil Organic Carbon, pH levels), irrigation sources, and crop sowing dates in tools such as Khet Diary or Soil Monitor.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Photos and Voice */}
      <section id="photos-voice" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            3
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Farm Photos, Leaf Images &amp; Voice Recordings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Uploaded Photographs</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              When using the <strong>Crop Doctor</strong> tool, you upload images of affected plant foliage or fruit. These images are transmitted securely to run computer vision inference for disease detection. Marketplace sellers also upload genuine photographs of tractors, farm machinery, or harvested produce. Under our Reality-First policy, <em>AI-generated or deceptive product photographs are strictly banned.</em>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Voice Recordings &amp; Audio Transcripts</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              To support non-English rural farmers, KisaanBuddy supports spoken voice queries in regional Indian languages. When you tap the microphone, audio data is streamed to our speech recognition model (such as Sarvam AI) to generate text transcripts. Raw audio buffers are deleted immediately following transcript synthesis and are never used to train commercial voice advertising profiles.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Marketplace Data */}
      <section id="marketplace-data" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            4
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Marketplace &amp; Agricultural Labour Data
          </h2>
        </div>

        <p>
          When you participate in the KisaanBuddy <strong>Agriculture Marketplace</strong> or <strong>Agricultural Labour (Worker Connect)</strong> modules:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Listing Information:</strong> We store details of equipment offered for rent or sale (model, horsepower, year, hourly or daily rental rate) or harvested produce (crop variety, quantity in quintals, price expectation).
          </li>
          <li>
            <strong>Labour Postings:</strong> When farmers request harvesting or sowing crews, we store the required worker headcount, crop type, daily wage offer, and village pickup point.
          </li>
          <li>
            <strong>Direct Communication:</strong> Buyer inquiries and seller telephone contacts are displayed only with explicit consent to facilitate genuine local transactions.
          </li>
        </ul>
      </section>

      {/* 5. Cookies & Analytics */}
      <section id="cookies-analytics" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            5
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Cookies, Telemetry &amp; Analytical Technologies
          </h2>
        </div>

        <p>
          KisaanBuddy uses cookies, local browser storage, and anonymous telemetry to operate efficiently. These include:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Strictly Essential Cookies:</strong> Ensure authentication security, prevent CSRF attacks, and enable stable page navigation.
          </li>
          <li>
            <strong>Functional &amp; Preference Cookies:</strong> Save your chosen Indian language preference and theme settings across sessions.
          </li>
          <li>
            <strong>Performance Telemetry:</strong> We utilize Vercel Analytics to measure real-world page load latencies and responsive rendering on 2G/3G/4G rural mobile connections. These telemetry events are aggregated and fully anonymized.
          </li>
        </ul>
      </section>

      {/* 6. Google AdSense & Advertising */}
      <section id="adsense-advertising" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            6
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Google AdSense &amp; Third-Party Advertising
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Important Notice Regarding Online Advertising</span>
          </div>
          <p className="leading-relaxed">
            To keep agricultural advisories, mandi rates, and crop disease diagnosis free for Indian farmers, KisaanBuddy displays non-intrusive advertisements served by <strong>Google AdSense</strong> and approved advertising networks.
          </p>
        </div>

        <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
          <p>
            Please take note of the following advertising disclosures:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Third-Party Vendors &amp; Google:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&rsquo;s prior visits to KisaanBuddy or other websites on the internet.
            </li>
            <li>
              <strong>DoubleClick DART Cookie:</strong> Google&rsquo;s use of advertising cookies (such as the DoubleClick cookie) enables it and its partners to serve advertisements to users based on their visits to our site and/or other sites across the World Wide Web.
            </li>
            <li>
              <strong>Web Beacons, IP Addresses &amp; Identifiers:</strong> Third-party ad servers or ad networks may employ cookies, JavaScript, web beacons, and unique mobile advertising IDs to measure the effectiveness of their advertising campaigns and personalize displayed content. KisaanBuddy has no access to or control over these third-party cookies.
            </li>
            <li>
              <strong>Opt-Out of Personalized Advertising:</strong> Users may opt out of personalized advertising at any time by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Google Ads Settings</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              . Alternatively, users may opt out of a third-party vendor&rsquo;s use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>AboutAds Choices</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              .
            </li>
          </ul>
        </div>
      </section>

      {/* 7. How Google Uses Information */}
      <section id="how-google-uses-data" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            7
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            How Google Uses Information on Our Site
          </h2>
        </div>

        <p>
          In mandatory compliance with Google Publisher Policies, we inform our visitors that when you visit KisaanBuddy, Google may use information about your visit.
        </p>

        <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2 text-xs">
          <p className="text-stone-700 dark:text-stone-300">
            For complete, official details from Google on how data is collected and processed when you use websites partnering with Google AdSense, please review Google&rsquo;s dedicated partner privacy disclosure:
          </p>
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold hover:underline py-1"
          >
            <span>&ldquo;How Google uses information from sites or apps that use our services&rdquo;</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </a>
        </div>
      </section>

      {/* 8. Third-Party Integrations */}
      <section id="third-party-integrations" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            8
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Third-Party Services &amp; Integrations
          </h2>
        </div>

        <p>
          KisaanBuddy connects with carefully vetted agricultural data feeds and technical services:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Open-Meteo &amp; Weather Observations:</strong> Weather forecasts are retrieved via non-tracking geographical queries utilizing district-level coordinates. No farmer identity is sent to meteorological APIs.
          </li>
          <li>
            <strong>Agmarknet &amp; Mandi Portals:</strong> Modal market prices are synchronized from official agricultural produce market committee records.
          </li>
          <li>
            <strong>Sarvam AI:</strong> Used strictly for low-latency Indian speech recognition and localized translation without persisting voice profiles.
          </li>
        </ul>
      </section>

      {/* 9. Storage & Security */}
      <section id="storage-security" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            9
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            How Information is Stored, Used &amp; Secured
          </h2>
        </div>

        <p>
          We employ multi-layer security protections to defend your information against unauthorized access, loss, or disclosure:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-1">
            <strong className="text-stone-900 dark:text-white font-bold">Data in Transit:</strong>
            <p className="text-stone-600 dark:text-stone-400">All data transmitted between your browser and KisaanBuddy is protected with TLS 1.3 / 256-bit SSL encryption.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-1">
            <strong className="text-stone-900 dark:text-white font-bold">Access Controls:</strong>
            <p className="text-stone-600 dark:text-stone-400">Access to operational databases is restricted to authorized engineering personnel via multi-factor authentication.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-1">
            <strong className="text-stone-900 dark:text-white font-bold">Storage Integrity:</strong>
            <p className="text-stone-600 dark:text-stone-400">Database backups are encrypted at rest with regular integrity validation checks.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-1">
            <strong className="text-stone-900 dark:text-white font-bold">Session Expiry:</strong>
            <p className="text-stone-600 dark:text-stone-400">Farmer authentication sessions expire automatically after periods of inactivity to prevent unauthorized access on shared mobile devices.</p>
          </div>
        </div>
      </section>

      {/* 10. Sharing Policy */}
      <section id="sharing-policy" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            10
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Data Sharing &amp; Strict Non-Sale Policy
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 space-y-2 text-xs font-medium">
          <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
            Absolute Guarantee: We Never Sell Farmer Data
          </p>
          <p>
            KisaanBuddy does NOT sell, rent, monetize, or trade farmer personal information, phone numbers, farm locations, or crop yields to commercial marketing brokers, moneylenders, or private agrochemical corporations.
          </p>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300">
          Information is shared only under strict circumstances:
        </p>

        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>With Transacting Parties:</strong> Connecting a buyer directly with a seller or an employer with agricultural labourers, based strictly on mutual consent.
          </li>
          <li>
            <strong>Legal Compliance:</strong> If required by Indian law enforcement or statutory court orders in accordance with prescribed Indian legal process.
          </li>
        </ul>
      </section>

      {/* 11. User Rights */}
      <section id="user-rights" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            11
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            User Privacy Rights &amp; Data Control
          </h2>
        </div>

        <p>
          Under the Indian DPDP Act and international privacy frameworks, you possess the following rights regarding your personal information:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <strong className="text-stone-900 dark:text-white">Right to Access:</strong> You may request a summary of the personal and farm information we hold about you.
          </div>
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <strong className="text-stone-900 dark:text-white">Right to Rectification:</strong> You may edit outdated phone numbers, village names, or marketplace listings directly in your profile.
          </div>
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <strong className="text-stone-900 dark:text-white">Right to Erasure:</strong> You can request complete deletion of your account, history, and uploaded photographs.
          </div>
          <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
            <strong className="text-stone-900 dark:text-white">Right to Withdraw Consent:</strong> You may revoke permission for location access or cookies at any time.
          </div>
        </div>
      </section>

      {/* 12. Contact DPO */}
      <section id="contact-dpo" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            12
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Grievance Officer &amp; Contact Information
          </h2>
        </div>

        <p>
          In accordance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, the details of our Grievance &amp; Privacy Officer are provided below:
        </p>

        <div className="p-5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-2">
          <p className="font-bold text-sm text-stone-900 dark:text-white">
            KisaanBuddy Legal &amp; Data Protection Desk
          </p>
          <p className="text-stone-600 dark:text-stone-300">
            <strong>Email:</strong>{' '}
            <a href="mailto:privacy@kisaanbuddy.com" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
              privacy@kisaanbuddy.com
            </a>{' '}
            (cc:{' '}
            <a href="mailto:info@kisaanbuddy.com" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
              info@kisaanbuddy.com
            </a>
            )
          </p>
          <p className="text-stone-600 dark:text-stone-300">
            <strong>Address:</strong> Patliputra Industrial Area, Patna, Bihar - 800013, India
          </p>
          <p className="text-stone-500 dark:text-stone-400 text-[11px] pt-1">
            Grievance responses are provided within 24–48 business hours.
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
