'use client';

import React from 'react';
import {
  Cookie,
  Shield,
  Eye,
  Settings,
  Sliders,
  ExternalLink,
  CheckCircle2,
  Info,
  Server,
  Layers,
} from 'lucide-react';
import { LegalPageLayout, type LegalSectionMeta } from '@/components/legal/LegalPageLayout';

const SECTIONS: LegalSectionMeta[] = [
  { id: 'what-are-cookies', number: '1', title: 'What Are Cookies & Web Storage Technologies' },
  { id: 'essential-cookies', number: '2', title: 'Category 1: Strictly Essential Cookies' },
  { id: 'functional-cookies', number: '3', title: 'Category 2: Functional & Language Preference Cookies' },
  { id: 'analytics-cookies', number: '4', title: 'Category 3: Performance & Analytics Cookies' },
  { id: 'advertising-cookies', number: '5', title: 'Category 4: Google AdSense & Advertising Cookies' },
  { id: 'third-party-cookies', number: '6', title: 'Third-Party Cookies & Tracking Technologies' },
  { id: 'cookie-inventory', number: '7', title: 'Detailed Cookie Inventory & Purpose Table' },
  { id: 'managing-cookies', number: '8', title: 'Managing Cookie Choices & Browser Opt-Outs' },
  { id: 'policy-updates', number: '9', title: 'Updates to this Cookie Policy & Support' },
];

export function CookieClient() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      subtitle="Clear and comprehensive explanation of how KisaanBuddy uses cookies, local web storage, analytical telemetry, and Google AdSense advertising technologies."
      badge="Cookies & Tracking Transparency"
      badgeIcon={<Cookie className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      lastUpdated="November 2026"
      effectiveDate="November 2026"
      currentPath="/cookie-policy"
      sections={SECTIONS}
    >
      {/* 1. What are cookies */}
      <section id="what-are-cookies" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            1
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            What Are Cookies &amp; Web Storage Technologies
          </h2>
        </div>

        <p>
          Cookies are small text data files placed on your smartphone, tablet, or desktop computer when you browse websites. Cookies help modern web platforms recognize your device, remember chosen regional language dialects (e.g., Hindi, Kannada, Marathi), maintain secure login sessions, and measure page performance.
        </p>

        <p>
          In addition to cookies, KisaanBuddy utilizes modern HTML5 web technologies including <code>localStorage</code>, <code>sessionStorage</code>, and Service Worker caches to provide offline rural resilience, fast page rendering, and instantaneous language switching.
        </p>
      </section>

      {/* 2. Essential Cookies */}
      <section id="essential-cookies" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            2
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Category 1: Strictly Essential Cookies
          </h2>
        </div>

        <p>
          Essential cookies are indispensable to the core functionality and security of KisaanBuddy. Without these cookies, services requested by users cannot be safely provided:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Session Authentication:</strong> Verifies authenticated farmer credentials and maintains active sessions when interacting with the dashboard, mandi alerts, or marketplace inquiries.
          </li>
          <li>
            <strong>Security &amp; CSRF Protection:</strong> Defends against cross-site request forgery and malicious robotic attacks against our agricultural forms.
          </li>
          <li>
            <strong>Routing &amp; Architecture:</strong> Manages web server load distribution and cached page states across Next.js edge networks.
          </li>
        </ul>
      </section>

      {/* 3. Functional Cookies */}
      <section id="functional-cookies" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            3
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Category 2: Functional &amp; Language Preference Cookies
          </h2>
        </div>

        <p>
          Functional cookies allow KisaanBuddy to remember preferences you have customized so you do not need to configure them repeatedly:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Regional Language Selection:</strong> Stores your active agricultural language selection (English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Bengali, Punjabi, Gujarati, or Hinglish) in <code>sessionStorage</code> and secure cookie state.
          </li>
          <li>
            <strong>UI Mode &amp; Contrast:</strong> Remembers your light/dark display theme selection for comfortable reading under bright sunlight in open fields.
          </li>
          <li>
            <strong>Dismissed Banners:</strong> Records when you have acknowledged an announcement or update so you are not repeatedly prompted.
          </li>
        </ul>
      </section>

      {/* 4. Analytics Cookies */}
      <section id="analytics-cookies" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            4
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Category 3: Performance &amp; Analytics Cookies
          </h2>
        </div>

        <p>
          These cookies help us understand how users navigate through KisaanBuddy so we can fix bottlenecks and enhance rural usability:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs text-stone-600 dark:text-stone-300">
          <li>
            <strong>Vercel Web Analytics:</strong> Gathers completely anonymous, privacy-friendly telemetry regarding page load durations, time to first byte, and device viewport categories. No personal identifiable information (PII) is stored or shared.
          </li>
          <li>
            <strong>Diagnostic Error Logs:</strong> Tracks client-side JavaScript crashes or slow network queries so our engineering team can optimize low-bandwidth compatibility.
          </li>
        </ul>
      </section>

      {/* 5. Advertising Cookies */}
      <section id="advertising-cookies" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            5
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Category 4: Google AdSense &amp; Advertising Cookies
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-300 dark:border-emerald-800/40 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Google AdSense Transparency &amp; Partner Sites Disclosure</span>
          </div>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            KisaanBuddy delivers free agricultural services supported in part by third-party advertisements via <strong>Google AdSense</strong>. Google and its advertising partners use cookies to serve ads based on prior visits to our site and other destinations across the web.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-stone-700 dark:text-stone-300">
            <li>Google uses cookies, including the DoubleClick cookie, to show ads based on user interests.</li>
            <li>Third-party advertisers may place or recognize unique cookies, web beacons, or device identifiers on your browser.</li>
            <li>
              For official instructions on how Google collects and uses information across partner websites, please consult{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-800 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
              >
                <span>Google&rsquo;s Partner Sites Disclosure</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              .
            </li>
          </ul>
        </div>
      </section>

      {/* 6. Third-Party Cookies */}
      <section id="third-party-cookies" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            6
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Third-Party Cookies &amp; Tracking Technologies
          </h2>
        </div>

        <p>
          Some third-party tools integrated into our platform set their own cookies to deliver features:
        </p>

        <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
          <li><strong>Google LLC:</strong> Serves contextual and interest-based advertisements through AdSense.</li>
          <li><strong>Vercel Inc.:</strong> Delivers edge infrastructure and performance telemetry.</li>
          <li><strong>OpenStreetMap / Leaflet:</strong> Caches geographical tile images for farm boundary maps without tracking user identity.</li>
        </ul>
      </section>

      {/* 7. Detailed Inventory */}
      <section id="cookie-inventory" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            7
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Detailed Cookie Inventory &amp; Purpose Table
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
          <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-xs">
            <thead className="bg-stone-50 dark:bg-stone-900 font-bold text-stone-800 dark:text-stone-200 text-left">
              <tr>
                <th className="px-4 py-3">Cookie Name</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-300">
              <tr>
                <td className="px-4 py-2.5 font-mono text-stone-900 dark:text-stone-100">kisaanbuddy_session_lang</td>
                <td className="px-4 py-2.5">KisaanBuddy</td>
                <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400">Functional</td>
                <td className="px-4 py-2.5">Remembers farmer language selection</td>
                <td className="px-4 py-2.5">Session</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-stone-900 dark:text-stone-100">auth_token</td>
                <td className="px-4 py-2.5">KisaanBuddy</td>
                <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400">Essential</td>
                <td className="px-4 py-2.5">Secures authenticated farmer sessions</td>
                <td className="px-4 py-2.5">30 Days</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-stone-900 dark:text-stone-100">_va / _vau</td>
                <td className="px-4 py-2.5">Vercel Analytics</td>
                <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400">Analytics</td>
                <td className="px-4 py-2.5">Measures real-world page load speed</td>
                <td className="px-4 py-2.5">1 Year</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-stone-900 dark:text-stone-100">IDE / __gads / DSID</td>
                <td className="px-4 py-2.5">Google AdSense</td>
                <td className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400">Advertising</td>
                <td className="px-4 py-2.5">Serves relevant non-intrusive ads</td>
                <td className="px-4 py-2.5">13 Months</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. Managing Cookies */}
      <section id="managing-cookies" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            8
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Managing Cookie Choices &amp; Browser Opt-Outs
          </h2>
        </div>

        <p>
          You have full authority to accept, decline, or delete cookies at any time:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Browser Cookie Controls</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Most web browsers automatically accept cookies by default. You can adjust your browser settings on Google Chrome, Apple Safari, Mozilla Firefox, or Microsoft Edge to block third-party cookies or alert you before a cookie is stored. Please note that disabling essential cookies may impact platform features.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2 text-sm">
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Advertising Opt-Out Portals</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              To opt out of interest-based ads served by Google and third-party advertising networks, visit:
            </p>
            <div className="space-y-1 pt-1 font-semibold">
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 dark:text-emerald-400 hover:underline block"
              >
                → Google Ads Settings (Personalization Controls)
              </a>
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 dark:text-emerald-400 hover:underline block"
              >
                → Digital Advertising Alliance (DAA) Opt-Out
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Policy Updates */}
      <section id="policy-updates" className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200 dark:border-stone-800">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
            9
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
            Updates to this Cookie Policy &amp; Support
          </h2>
        </div>

        <p>
          We may update this Cookie Policy from time to time to accommodate technical developments or revised advertising standards.
        </p>

        <p className="text-xs text-stone-600 dark:text-stone-300">
          If you have questions regarding our cookie practices, reach our technical privacy desk at <a href="mailto:privacy@kisaanbuddy.com" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">privacy@kisaanbuddy.com</a> or our main office at Patliputra Industrial Area, Patna, Bihar - 800013.
        </p>
      </section>
    </LegalPageLayout>
  );
}
