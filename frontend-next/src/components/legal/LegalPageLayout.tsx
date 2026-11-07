'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Printer,
  ChevronRight,
  Lock,
  FileText,
  AlertTriangle,
  Cookie,
  BookOpen,
  Mail,
  MapPin,
  ExternalLink,
  CheckCircle2,
  List,
} from 'lucide-react';
import { PageTransition } from '@/components/motion/MotionComponents';

export interface LegalSectionMeta {
  id: string;
  title: string;
  number?: string;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon?: React.ReactNode;
  lastUpdated?: string;
  effectiveDate?: string;
  currentPath: string;
  sections: LegalSectionMeta[];
  children: React.ReactNode;
}

const ALL_POLICIES = [
  {
    title: 'Privacy Policy',
    href: '/privacy',
    description: 'Detailed explanation of user data collection, farm photos, location privacy, and Google AdSense technologies.',
    icon: Lock,
  },
  {
    title: 'Terms & Conditions',
    href: '/terms',
    description: 'User eligibility, marketplace direct-connection rules, seller responsibilities, and platform governance.',
    icon: FileText,
  },
  {
    title: 'Legal Disclaimer',
    href: '/disclaimer',
    description: 'Advisory scope of AI crop diagnostic tools, weather feeds, and indicative wholesale mandi market rates.',
    icon: AlertTriangle,
  },
  {
    title: 'Cookie Policy',
    href: '/cookie-policy',
    description: 'Transparency regarding essential, preference, analytics, and Google AdSense advertising cookies.',
    icon: Cookie,
  },
  {
    title: 'Editorial & Data Sources',
    href: '/editorial-policy',
    description: 'Our non-negotiable Reality-First policy: verified agronomic sourcing, genuine listings, and correction process.',
    icon: BookOpen,
  },
];

export function LegalPageLayout({
  title,
  subtitle,
  badge,
  badgeIcon,
  lastUpdated = 'November 2026',
  effectiveDate = 'November 2026',
  currentPath,
  sections,
  children,
}: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const relatedPolicies = ALL_POLICIES.filter((p) => p.href !== currentPath);

  return (
    <PageTransition className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <Link href="/" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-400">Legal &amp; Transparency</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 dark:text-stone-100 font-bold" aria-current="page">
            {title}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
            title="Print document for records"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
            <span className="hidden sm:inline">Print Document</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Hero Header Card */}
      <header className="relative overflow-hidden rounded-3xl border border-emerald-900/10 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/70 via-white to-stone-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 p-6 sm:p-8 md:p-10 mb-8 shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            {badgeIcon || <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            <span>{badge}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-stone-900 dark:text-white leading-[1.12]">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-normal max-w-3xl">
            {subtitle}
          </p>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 text-xs text-stone-500 dark:text-stone-400 border-t border-emerald-900/10 dark:border-stone-800">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Last Revised: <strong className="text-stone-800 dark:text-stone-200 font-semibold">{lastUpdated}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Effective Date: <strong className="text-stone-800 dark:text-stone-200 font-semibold">{effectiveDate}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Standard: <strong className="text-stone-800 dark:text-stone-200 font-semibold">Google Quality &amp; Reality-First Compliant</strong></span>
            </span>
          </div>

        </div>
      </header>

      {/* Mobile Table of Contents Dropdown Button */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            <List className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Table of Contents ({sections.length} Sections)</span>
          </span>
          <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${isMobileTocOpen ? 'rotate-90' : ''}`} />
        </button>

        {isMobileTocOpen && (
          <nav className="mt-2 p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-lg space-y-1 text-xs">
            {sections.map((section, idx) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setIsMobileTocOpen(false)}
                className={`block px-3 py-2 rounded-xl transition-colors font-medium ${
                  activeSection === section.id
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <span className="text-stone-400 mr-2">{section.number || `${idx + 1}.`}</span>
                {section.title}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sticky Table of Contents on Desktop */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-100 dark:border-stone-800 text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <List className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Table of Contents</span>
            </div>
            
            <nav className="space-y-1 text-xs max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {sections.map((section, idx) => {
                const isActive = activeSection === section.id;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`group flex items-start gap-2.5 px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200'
                      }`}
                    >
                      {section.number || idx + 1}
                    </span>
                    <span className="leading-snug">{section.title}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Quick Support & Grievance Contact Box */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Legal &amp; Privacy Officer</span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Have questions regarding our policies or wish to exercise data rights?
            </p>
            <div className="space-y-1.5 font-medium text-stone-700 dark:text-stone-300">
              <a
                href="mailto:privacy@kisaanbuddy.com"
                className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>privacy@kisaanbuddy.com</span>
              </a>
              <div className="flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>Patliputra Industrial Area, Patna, Bihar - 800013</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content Column */}
        <main className="lg:col-span-8 space-y-8">
          <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 md:p-10 shadow-xs space-y-10 text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
            {children}
          </div>

          {/* Related Policies Navigation Cards */}
          <section aria-label="Related Policies" className="space-y-4 pt-4">
            <h2 className="text-lg font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Related Legal &amp; Trust Documents</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPolicies.map((policy) => {
                const IconComponent = policy.icon;
                return (
                  <Link
                    key={policy.href}
                    href={policy.href}
                    className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all shadow-xs group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                          <span>{policy.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {policy.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Official Footnote / Compliance statement */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-6 text-xs text-stone-500 dark:text-stone-400 space-y-2">
            <p className="font-semibold text-stone-700 dark:text-stone-300">
              KisaanBuddy Genuine Agricultural Identity &amp; Compliance Commitment:
            </p>
            <p>
              KisaanBuddy is an independent digital platform dedicated to supporting Indian agriculture. We operate under strict transparency rules: authentic data sourcing, no simulated listings, verified seller accounts, and clear user privacy controls.
            </p>
            <p>
              Inquiries regarding terms, privacy, copyright, or data corrections can be addressed to our administrative office at <span className="text-stone-700 dark:text-stone-300 font-medium">Patliputra Industrial Area, Patna, Bihar - 800013</span> or via email at <a href="mailto:info@kisaanbuddy.com" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline">info@kisaanbuddy.com</a>.
            </p>
          </div>

        </main>

      </div>

    </PageTransition>
  );
}
