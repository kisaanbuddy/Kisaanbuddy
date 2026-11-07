'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sprout,
  Sparkles,
  Brain,
  CloudSun,
  TrendingUp,
  Mail,
  ArrowRight,
  Shield,
  Target,
  Layers,
  Cpu,
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Linkedin,
  Wheat,
  Activity,
  ArrowUpRight,
  Workflow,
  Smartphone,
  Eye,
  HeartHandshake,
  Database,
  Radio,
  FileCheck2,
  Building2,
  CircleDot,
  Clock,
  Sparkle,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';
import { PublicImprovementsSection } from '@/components/farmer/PublicImprovementsSection';

// ============================================================================
// DATA DEFINITIONS & VERIFIED GROUND TRUTH
// ============================================================================

interface Founder {
  id: string;
  name: string;
  role: string;
  focusArea: string;
  email: string;
  linkedin: string;
  image: string;
  initials: string;
  shortBio: string;
  verifiedDetails: string[];
  responsibilities: string[];
}

const FOUNDERS: Founder[] = [
  {
    id: 'aditya',
    name: 'Aditya Ishwar',
    role: 'Founder, CEO & Chief Architect',
    focusArea: 'Full-Stack Architecture & AI Systems Integration',
    email: 'info@kisaanbuddy.com',
    linkedin: 'https://www.linkedin.com/in/aditya-ishwar',
    image: '/images/founders/aditya-ishwar.webp',
    initials: 'AI',
    shortBio:
      'Drives the technical vision and engineering roadmap of KisaanBuddy. Leads full-stack architecture, conversational AI integrations, and production deployment with the conviction that advanced agricultural software must be practical and accessible to every Indian farmer.',
    verifiedDetails: [
      'Founder and principal architect of KisaanBuddy',
      'Oversees end-to-end cloud infrastructure, Next.js frontend, and FastAPI backend',
      'Designs voice-first interaction layers and Sarvam AI multilingual workflows',
      'Focuses on lightweight, low-latency mobile experiences for rural connectivity',
    ],
    responsibilities: [
      'Core Platform Architecture & System Engineering',
      'Conversational AI Workflows & Sarvam AI Integration',
      'Production Deployment & Performance Optimization',
      'Technical Product Strategy & Code Quality',
    ],
  },
  {
    id: 'utkarsh',
    name: 'Utkarsh Sinha',
    role: 'Co-Founder & Managing Director',
    focusArea: 'Machine Learning Pipelines & Agricultural Data Systems',
    email: 'info@kisaanbuddy.com',
    linkedin: 'https://www.linkedin.com/in/utkarsh-sinha',
    image: '/images/founders/utkarsh-sinha.webp',
    initials: 'US',
    shortBio:
      'Directs the machine learning and agricultural intelligence pipelines at KisaanBuddy. Focuses on crop advisory algorithms, disease diagnosis accuracy, and AGMARKNET market price pipelines to turn raw agricultural data into actionable guidance.',
    verifiedDetails: [
      'Co-Founder managing agricultural intelligence and data science',
      'Architects crop recommendation engines and plant pathology vision models',
      'Maintains data integrity pipelines for APMC mandi rates and agro-climatic datasets',
      'Ensures agronomic recommendations remain grounded in verified agricultural science',
    ],
    responsibilities: [
      'Crop Advisory & Pathology Machine Learning Models',
      'AGMARKNET Mandi Price Ingestion & Health Checks',
      'Agronomy Knowledge Base & Soil Chemistry Intelligence',
      'Data Integrity, Validation & Fallback Systems',
    ],
  },
  {
    id: 'yash',
    name: 'Yash Singh',
    role: 'Co-Founder & CMO',
    focusArea: 'Farmer Outreach, Rural Adoption & Community Engagement',
    email: 'info@kisaanbuddy.com',
    linkedin: 'https://www.linkedin.com/in/yash-singh-33553b2a5',
    image: '/images/founders/yash-singh.webp',
    initials: 'YS',
    shortBio:
      'Leads grassroots outreach, farmer feedback loops, and user adoption for KisaanBuddy. Works directly with farming communities to understand real field obstacles and ensure the platform solves authentic everyday agricultural problems.',
    verifiedDetails: [
      'Co-Founder directing rural outreach and platform growth',
      'Facilitates direct farmer usability testing and field feedback collection',
      'Bridges product development with ground-level community requirements',
      'Champions vernacular communication and rural accessibility across the platform',
    ],
    responsibilities: [
      'Rural Community Outreach & Farmer Onboarding',
      'User Experience Feedback & Ground Truth Testing',
      'Strategic Partnerships & Agricultural Extension Engagement',
      'Vernacular Content Strategy & Product Communication',
    ],
  },
];

const PROBLEM_STAGES = [
  {
    number: '01',
    title: 'Fragmented Information',
    badge: 'Information Silos',
    summary:
      'Farmers frequently search across multiple disconnected channels — local seed dealers, distant APMC notice boards, general television forecasts, and government portals.',
    reality:
      'Weather apps rarely explain what rain means for a specific crop stage; mandi notice boards are out-of-date; and soil advisories are often locked in technical laboratory reports that are difficult to interpret.',
    image: '/images/crops/punjab-wheat-field.webp',
    imageAlt: 'Agricultural crop field in Punjab',
    caption: 'Verified agronomic field conditions — fragmented information slows critical field decisions.',
  },
  {
    number: '02',
    title: 'Digital Complexity',
    badge: 'User Friction',
    summary:
      'Agricultural technology should be easy to understand and use, even for people who are not comfortable with complicated digital platforms.',
    reality:
      'Most modern digital tools are built with dense dashboards, multi-step menus, and English terminology designed for urban desks, making them unwieldy for a farmer operating a smartphone in bright sunlight.',
    image: '/images/farmers/farmer-field-tending.webp',
    imageAlt: 'Indian farmer tending crops in agricultural field',
    caption: 'Field reality: Tools must work effortlessly on mobile devices with high sunlight legibility.',
  },
  {
    number: '03',
    title: 'Information Accessibility',
    badge: 'Linguistic Gap',
    summary:
      'Useful information should be accessible in familiar languages and through simple interactions like voice and conversation.',
    reality:
      'Valuable scientific agronomy is routinely published in academic English or formal administrative prose. Without native voice and natural conversational interfaces, crucial guidance remains out of reach.',
    image: '/images/crops/indian-paddy-field.jpg',
    imageAlt: 'Paddy fields in rural India during monsoon season',
    caption: 'Guidance must speak the farmer’s language, both linguistically and culturally.',
  },
  {
    number: '04',
    title: 'Market Intelligence',
    badge: 'Commercial Gap',
    summary:
      'Knowing the market price is useful, but understanding when, where, and how to sell is equally important for farm livelihood.',
    reality:
      'A price quote on a board does not guarantee a buyer or account for transportation costs. Farmers frequently suffer distress sales at mandi gates because they lack forward market visibility and nearby demand transparency.',
    image: '/images/mandi/grain-market-mandi.webp',
    imageAlt: 'Indian grain market mandi with harvest produce',
    caption: 'APMC wholesale market: transparency must bridge the gap between price quotes and real sales.',
  },
];

const ECOSYSTEM_PILLARS = [
  {
    number: '01',
    title: 'Crop Intelligence',
    status: 'Live & Operational',
    statusType: 'live' as const,
    description:
      'Helping farmers evaluate crop varieties, calculate optimal sowing windows based on season, and track crop development stages with actionable agronomic guidance.',
    keyPoints: [
      'Crop suitability based on agro-climatic zones',
      'Targeted fertilizer and nutrient scheduling',
      'AI-assisted crop disease leaf diagnosis',
    ],
  },
  {
    number: '02',
    title: 'Weather Intelligence',
    status: 'Live & Operational',
    statusType: 'live' as const,
    description:
      'Making meteorological forecasts practical by translating rainfall, humidity, and wind velocity into specific agricultural impact advisories for standing crops.',
    keyPoints: [
      'Hyper-local 5-day weather forecasts',
      'Sowing, spraying, and harvesting alerts',
      'Extreme weather and monsoon progression indicators',
    ],
  },
  {
    number: '03',
    title: 'Soil Intelligence',
    status: 'Live & Operational',
    statusType: 'live' as const,
    description:
      'Developing tools to interpret soil test parameters (N-P-K, pH, organic carbon) and generate balanced soil replenishment recommendations.',
    keyPoints: [
      'Soil Health Card data translation',
      'pH balancing and micronutrient deficiency guides',
      'Crop-to-soil compatibility assessments',
    ],
  },
  {
    number: '04',
    title: 'Mandi Intelligence',
    status: 'Live & Operational',
    statusType: 'live' as const,
    description:
      'Providing daily APMC mandi wholesale arrival prices directly sourced from AGMARKNET datasets, tracking price trends, and comparing nearby district markets.',
    keyPoints: [
      'Official AGMARKNET APMC price feeds',
      'Daily min, max, and modal price discovery',
      'District-level mandi comparison across commodities',
    ],
  },
  {
    number: '05',
    title: 'Agricultural Marketplace',
    status: 'In Active Development',
    statusType: 'dev' as const,
    description:
      'Moving beyond merely displaying prices to bridging the information gap between price discovery and real commercial selling opportunities: PRICE → DECISION → BUYER → SALE.',
    keyPoints: [
      'Direct farm produce listings for verified buyers',
      'Farm equipment & machinery rental access',
      'Transparent price realization without middlemen distortion',
    ],
  },
  {
    number: '06',
    title: 'Contextual Farm Profile',
    status: 'Long-Term Product Direction',
    statusType: 'future' as const,
    description:
      'A unified digital farm ledger capturing farm location, acreage, soil history, crop varieties, sowing dates, irrigation cycles, input expenses, and harvest yields.',
    keyPoints: [
      'Longitudinal record of farm health and expenses',
      'Tailored advisories calibrated to historical plot data',
      'Simplified farm balance sheet and profitability tracking',
    ],
  },
];

const PRINCIPLES = [
  {
    icon: Compass,
    title: 'Simplicity First',
    subtitle: 'Understandable to Actual Users',
    description:
      'An agricultural platform must be intuitive from the very first interaction. We eliminate deep dashboard hierarchies, cryptic agricultural acronyms, and unnecessary digital barriers.',
  },
  {
    icon: Wheat,
    title: 'Context Matters',
    subtitle: 'Grounded in Local Reality',
    description:
      'Generic advice is dangerous in farming. A recommendation for wheat in Punjab during January is completely irrelevant for paddy in coastal Odisha. Every insight must account for crop, location, soil, and season.',
  },
  {
    icon: Smartphone,
    title: 'Accessibility By Default',
    subtitle: 'Language & Device Inclusivity',
    description:
      'Technology should never exclude someone because of language or digital comfort. We prioritize conversational interfaces, voice interactions, and clear local language support.',
  },
  {
    icon: Shield,
    title: 'Data Responsibility',
    subtitle: 'Clear Provenance & Limitations',
    description:
      'We clearly state the source of external information (such as AGMARKNET or meteorological agencies) and display last-updated timestamps. When verified data is unavailable, we state it honestly rather than inventing numbers.',
  },
  {
    icon: Target,
    title: 'Practical Utility',
    subtitle: 'Outcome Over Technology Hype',
    description:
      'Our success is not measured by the complexity of our machine learning models, but by whether a farmer saved a crop, avoided an unnecessary pesticide cost, or gained fair market value at the mandi.',
  },
];

const JOURNEY_STAGES = [
  {
    step: 'Phase 1',
    title: 'Idea & Ground Observation',
    description:
      'Noticing the severe disconnect between advanced agricultural research and the daily information hurdles faced by smallholder Indian farmers.',
  },
  {
    step: 'Phase 2',
    title: 'Problem Understanding',
    description:
      'Analyzing real farmer workflows: crop selection, weather anxiety, pest outbreaks, and the opaque nature of regional APMC mandi pricing.',
  },
  {
    step: 'Phase 3',
    title: 'Product Architecture',
    description:
      'Designing a clean Next.js and FastAPI software stack engineered for mobile devices, high sunlight readability, and minimal network overhead.',
  },
  {
    step: 'Phase 4',
    title: 'Conversational AI Integration',
    description:
      'Integrating Sarvam AI capabilities to enable vernacular Hindi and Hinglish conversational assistance, making agricultural knowledge conversational.',
  },
  {
    step: 'Phase 5',
    title: 'Agricultural Data Layer',
    description:
      'Connecting live AGMARKNET APMC mandi price feeds and hyper-local meteorological telemetry, establishing transparent source attribution.',
  },
  {
    step: 'Phase 6',
    title: 'Continuous Improvement',
    description:
      'Iterating the platform based on direct user feedback, hardening system reliability, and expanding practical agricultural decision tools.',
  },
];

const BELIEFS = [
  'Every farmer deserves access to understandable agricultural information.',
  'Technology should reduce complexity, not create it.',
  'Better information can lead to better-informed decisions.',
  'Agricultural innovation should begin with understanding farmers.',
];

const FAQS = [
  {
    question: 'What is KisaanBuddy?',
    answer:
      'KisaanBuddy is an AI-powered agricultural advisory platform being developed to make agricultural knowledge, market intelligence, and farm decision-making accessible and practical for Indian farmers. It brings together crop advisory, plant leaf disease scanning, live APMC mandi prices, weather forecasts, and government scheme information in simple, understandable interactions.',
  },
  {
    question: 'How does KisaanBuddy approach data authenticity?',
    answer:
      'Authenticity is our non-negotiable principle. We do not invent prices, fake testimonials, or fabricate agricultural specs. Every mandi price is linked to its official AGMARKNET source and date, crop agronomy is grounded in documented Indian agricultural practices, and we strictly distinguish between currently operational features and long-term roadmap ambitions.',
  },
  {
    question: 'How is conversational AI used in KisaanBuddy?',
    answer:
      'KisaanBuddy integrates conversational AI (including Sarvam AI when API configurations are active) to allow farmers to ask questions naturally in conversational language, including Hindi and Hinglish, without having to navigate complex search menus or technical filters.',
  },
  {
    question: 'Who is building KisaanBuddy?',
    answer:
      'KisaanBuddy is being built by a dedicated founding team of three engineers: Aditya Ishwar (Founder, CEO & Chief Architect), Utkarsh Sinha (Co-Founder & Managing Director - ML & Agronomy Systems), and Yash Singh (Co-Founder & CMO - Farmer Outreach & Growth).',
  },
  {
    question: 'Is KisaanBuddy free for Indian farmers to use?',
    answer:
      'Yes. KisaanBuddy’s core advisory features — including crop disease identification, APMC mandi checks, weather advisories, and government scheme eligibility guides — are completely free for farmers across India.',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AboutClient() {
  const { t, lang } = useLanguage();
  const prefersReduced = useReducedMotion();

  // Active founder tab state for detailed profile view
  const [activeFounderId, setActiveFounderId] = useState<string>('aditya');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedFounder = FOUNDERS.find((f) => f.id === activeFounderId) || FOUNDERS[0];

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="-mt-6 md:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 flex flex-col bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
      {/* =================================================================== */}
      {/* 1. HERO SECTION: BUILDING TECHNOLOGY THAT UNDERSTANDS FARMING       */}
      {/* =================================================================== */}
      <section id="mission" className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background pt-12 md:pt-20 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        {/* Subtle agricultural grid & geometric accent */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(#27834a_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-15 dark:opacity-10 pointer-events-none"
        />

        <div className="relative mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Mission Narrative & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Category pill */}
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-600/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <Sprout className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>ABOUT KISAANBUDDY</span>
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium text-muted-foreground">REALITY-FIRST AGRITECH</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
                Building Technology That Understands{' '}
                <span className="text-emerald-700 dark:text-emerald-400 underline decoration-emerald-500/30 decoration-wavy decoration-2 underline-offset-8">
                  Farming.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal max-w-2xl">
                An ambitious attempt to bring AI, agricultural intelligence and accessible technology closer to the people who need it most — India&apos;s farmers.
              </p>

              {/* Key Philosophy Anchor */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-xs sm:text-sm text-foreground/90 font-medium flex items-start gap-3">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px] shrink-0 mt-0.5">
                  Core Belief:
                </span>
                <span>
                  Technology should make farming easier, not more complicated. Farmers should never have to navigate confusing dashboards or decipher technical jargon to make essential agricultural decisions.
                </span>
              </div>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/features">
                  <Button className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                    <span>Explore KisaanBuddy</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#founding-team">
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-xl border-border/80 hover:bg-muted font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <span>Meet Our Founding Team</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </a>
              </div>

              {/* Telemetry verification badges */}
              <div className="pt-4 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>AGMARKNET Mandi Feeds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Sarvam AI Vernacular</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Zero Fabricated Data</span>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Editorial Imagery & Live Indicator */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-xl">
                {/* Real photographic asset */}
                <div className="relative aspect-[4/3] w-full bg-muted">
                  <Image
                    src="/images/hero/hero-indian-farmer.webp"
                    alt="Indian farmer standing in healthy green agricultural field"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Caption badge */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-semibold tracking-wide uppercase text-emerald-300">
                      Authentic Agricultural Context
                    </p>
                    <p className="text-sm font-medium mt-0.5 leading-snug text-white/95">
                      Ground reality in Indian agriculture is where technology must perform, not in an abstract laboratory.
                    </p>
                  </div>
                </div>

                {/* Floating Telemetry card */}
                <div className="p-4 sm:p-5 bg-card/95 border-t border-border/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground">
                      PLATFORM ARCHITECTURE
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                      <CircleDot className="h-2 w-2 animate-pulse text-emerald-600" />
                      Active Development
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-muted/40 p-2.5 border border-border/30">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Farmer Interaction</div>
                      <div className="font-semibold text-foreground mt-0.5">Voice & Multilingual</div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2.5 border border-border/30">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Data Transparency</div>
                      <div className="font-semibold text-foreground mt-0.5">Traceable Sources</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. THE CORE STORY — WHY KISAANBUDDY EXISTS                          */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/30">
        <div className="mx-auto w-full">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3">
              THE CORE STORY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              Farming is complex. Getting the right guidance shouldn&apos;t be.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              KisaanBuddy is building a smarter, simpler way for farmers to understand their farms, access agricultural intelligence and make more informed decisions.
            </p>
          </div>

          {/* Everyday Decisions Grid */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold font-display text-foreground mb-4 flex items-center gap-2">
              <Wheat className="h-5 w-5 text-emerald-600" />
              <span>The Decisions Indian Farmers Make Every Season</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Farming in India is not a static routine. Smallholders regularly confront high-stakes decisions with direct consequences for their family&apos;s financial security:
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Which Crop to Cultivate', desc: 'Matching seasonal market trends, seed availability, and local water resources.' },
                { title: 'When to Sow', desc: 'Predicting monsoon arrival and soil temperature to protect delicate germination.' },
                { title: 'How to Manage Crop Health', desc: 'Diagnosing fungal blights and pest attacks before they ravage standing fields.' },
                { title: 'Which Inputs to Apply', desc: 'Balancing fertilizers and micro-nutrients without falling prey to costly dealer upselling.' },
                { title: 'Nearby Mandi Activity', desc: 'Tracking wholesale arrivals and fluctuating APMC modal rates across districts.' },
                { title: 'When & Where to Sell', desc: 'Deciding whether to harvest immediately, transport produce, or hold for better demand.' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/40 bg-muted/20 p-4 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-500/[0.03] -mx-6 -mb-6 p-6 rounded-b-2xl">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                Agricultural information is fragmented across government databases, seed packets, and local traders. Language barriers and complicated digital interfaces further isolate farmers. KisaanBuddy is engineered to eliminate this friction.
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/features">
                  <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    Explore Platform
                  </Button>
                </Link>
                <a href="#founding-team">
                  <Button size="sm" variant="outline" className="rounded-lg">
                    Meet Founding Team
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. THE PROBLEM WE WANT TO SOLVE (4 CONNECTED VISUAL STAGES)        */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="mx-auto w-full">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 block">
              FOUR CORE CHALLENGES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              Technology Has Advanced. Agricultural Accessibility Must Advance Too.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              We did not build KisaanBuddy to demonstrate flashy AI. We built it because modern digital technology continues to bypass the practical realities of Indian smallholder farmers.
            </p>
          </div>

          {/* Connected 4 Stages Flow */}
          <div className="space-y-12">
            {PROBLEM_STAGES.map((stage, idx) => (
              <div
                key={stage.number}
                className="relative rounded-2xl border border-border/60 bg-card p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden"
              >
                {/* Stage Indicator Bar */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-sm">
                    {stage.number}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {stage.badge}
                  </span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <h3 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                      {stage.title}
                    </h3>
                    <p className="text-base text-foreground/90 font-medium leading-relaxed">
                      {stage.summary}
                    </p>
                    <div className="rounded-xl bg-muted/30 border border-border/40 p-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground font-semibold block mb-1">
                        The Ground Reality:
                      </strong>
                      {stage.reality}
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border/50 bg-muted shadow-sm">
                      <Image
                        src={stage.image}
                        alt={stage.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 35vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <p className="absolute bottom-3 left-3 right-3 text-[11px] text-white/95 font-medium leading-tight">
                        {stage.caption}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. OUR APPROACH — HOW KISAANBUDDY IS BEING BUILT                    */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/30">
        <div className="mx-auto w-full">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 block">
              PRODUCT ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              From Information to Intelligent Agricultural Decisions.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              We approach agricultural technology not as an isolated chatbot, but as a multi-tier system engineered to turn messy, fragmented data into verified farm actions.
            </p>
          </div>

          {/* 4-Layer Architecture Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Layer A */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Layer A
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-foreground mb-2">
                  Farmer Interaction Layer
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Making interaction natural through multiple sensory modes rather than complex forms:
                </p>
                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Conversational assistance with intuitive text and voice queries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Image-based leaf disease scanning via camera upload</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>High-contrast, mobile-first layouts designed for outdoor readability</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border/30 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Status: Operational on mobile web & desktop
              </div>
            </div>

            {/* Layer B */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Layer B
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-foreground mb-2">
                  AI Intelligence Layer
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Processing natural farmer queries and generating contextual agricultural responses:
                </p>
                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Sarvam AI integration for Hindi and Hinglish conversational comprehension</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Domain-curated agronomic system prompts to reduce hallucination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Confidence thresholds: admitting when reliable data is unavailable</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border/30 text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                Status: Active with Sarvam AI API endpoints & fallback
              </div>
            </div>

            {/* Layer C */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                    <Database className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Layer C
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-foreground mb-2">
                  Agricultural Data Layer
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Aggregating and verifying live operational data feeds across the Indian agrarian network:
                </p>
                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>AGMARKNET APMC wholesale mandi rates with date timestamps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>Hyper-local weather telemetry (rainfall, humidity, temperature)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>Agronomy crop database covering Kharif, Rabi & Zaid cycles</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border/30 text-[11px] text-sky-700 dark:text-sky-400 font-semibold">
                Status: Live integrations with verified fallback sources
              </div>
            </div>

            {/* Layer D */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Workflow className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Layer D
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-foreground mb-2">
                  Agricultural Decision Layer
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Transforming raw observations into specific next steps:
                </p>
                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Actionable advice: when to delay irrigation before sudden rainfall</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Mandi price arbitration: whether neighboring APMC rates offset transit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Pest treatment protocols: pairing organic remedies with chemical dosage</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-border/30 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                Status: Iterative advisory engine evolving with farmer input
              </div>
            </div>
          </div>

          {/* Decision Philosophy Flow: Information -> Understanding -> Decision -> Action */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-6 sm:p-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                OUR CORE PHILOSOPHY
              </span>
              <h4 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                The Decision Pipeline
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Every feature we build must move the farmer through these four continuous stages.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {[
                {
                  step: '01',
                  label: 'INFORMATION',
                  detail: 'Verified raw data: APMC rates, rainfall forecasts, soil pH readings.',
                },
                {
                  step: '02',
                  label: 'UNDERSTANDING',
                  detail: 'Translating numbers into plain vernacular context: what rain means for your wheat.',
                },
                {
                  step: '03',
                  label: 'DECISION',
                  detail: 'Evaluating alternatives: spray today vs wait; sell at local mandi vs district hub.',
                },
                {
                  step: '04',
                  label: 'ACTION',
                  detail: 'Taking confident, timely action on the field with minimized financial risk.',
                },
              ].map((stage, idx) => (
                <div
                  key={stage.step}
                  className="rounded-xl border border-border/50 bg-card p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1">
                      {stage.step}
                    </div>
                    <div className="text-sm font-extrabold font-display text-foreground mb-2">
                      {stage.label}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {stage.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground font-medium">
              We do not claim every stage is fully automated. KisaanBuddy is an advisory partner that augments, rather than replaces, the farmer&apos;s lifelong wisdom.
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. OUR VISION — A FARMER-CENTRIC AGRICULTURAL PLATFORM               */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="mx-auto w-full">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 block">
              LONG-TERM VISION
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              We Are Thinking Beyond Agricultural Chatbots.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Conversational AI is only the entry point. The broader ambition is a connected agricultural ecosystem where information, markets, and farm operations converge into one intuitive companion.
            </p>
          </div>

          {/* Ecosystem Visualization Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ECOSYSTEM_PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-200 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-emerald-600">
                      PILLAR {pillar.number}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        pillar.statusType === 'live'
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300'
                          : pillar.statusType === 'dev'
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300'
                          : 'bg-muted text-muted-foreground border-border/40'
                      }`}
                    >
                      {pillar.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-foreground mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {pillar.description}
                  </p>

                  <ul className="space-y-2 border-t border-border/40 pt-3">
                    {pillar.keyPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-foreground/80">
                        <ChevronRight className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Marketplace Specific Callout */}
          <div className="mt-12 rounded-2xl border border-border/60 bg-muted/20 p-6 md:p-8">
            <div className="grid lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Marketplace Roadmap
                </span>
                <h4 className="text-xl font-bold font-display text-foreground mt-1">
                  Bridging the Gap: PRICE → DECISION → BUYER → SALE
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  Knowing the mandi price is only half the battle. Our ongoing product direction is to help farmers move from knowing price trends to securing authentic commercial transactions, connecting verified local inventory with genuine buyers without predatory intermediary margins.
                </p>
              </div>
              <div className="lg:col-span-4 flex justify-start lg:justify-end">
                <Link href="/marketplace">
                  <Button variant="outline" className="rounded-xl border-border/80 font-semibold text-xs">
                    View Verified Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. WHAT MAKES OUR APPROACH DIFFERENT?                               */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/30">
        <div className="mx-auto w-full">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 block">
              OUR GUIDING PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              Built Around the Farmer, Not the Technology.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              We test every feature against a simple standard: does this make practical sense for an Indian farmer standing in the middle of a muddy field?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRINCIPLES.map((principle, idx) => {
              const Icon = principle.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm hover:border-emerald-500/40 transition-colors"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold font-display text-foreground">
                      {principle.title}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                      {principle.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 7. MEET OUR FOUNDING TEAM — THREE MINDS. ONE AGRICULTURAL VISION.   */}
      {/* =================================================================== */}
      <section id="founding-team" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40 scroll-mt-12">
        <div className="mx-auto w-full">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-3">
              <Sparkle className="h-3.5 w-3.5" />
              <span>THE FOUNDING TEAM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              Three Minds. One Agricultural Vision.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              KisaanBuddy is being built by a founding team that believes technology can create meaningful change in agriculture.
            </p>
          </div>

          {/* Three Founder Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {FOUNDERS.map((f) => (
              <div
                key={f.id}
                onClick={() => setActiveFounderId(f.id)}
                className={`group cursor-pointer rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between bg-card ${
                  activeFounderId === f.id
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'border-border/60 hover:border-emerald-500/40 shadow-sm'
                }`}
              >
                <div>
                  {/* Photo area */}
                  <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-muted mb-5 border border-border/40">
                    <Image
                      src={f.image}
                      alt={`Portrait of ${f.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="text-xl font-bold font-display text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-1">
                    {f.role}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {f.focusArea}
                  </p>
                  <p className="text-xs text-foreground/80 mt-3 leading-relaxed ">
                    {f.shortBio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span>{activeFounderId === f.id ? 'Viewing Details' : 'View Focus & Details'}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-emerald-600 hover:border-emerald-500 transition-colors"
                      aria-label={`${f.name}'s verified LinkedIn profile`}
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href={`mailto:${f.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-emerald-600 hover:border-emerald-500 transition-colors"
                      aria-label={`Email ${f.name}`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expandable Active Founder Detail Panel */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between pb-6 border-b border-border/40">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  FOUNDER PROFILE & FOCUS
                </span>
                <h3 className="text-2xl font-bold font-display text-foreground mt-1">
                  {selectedFounder.name}
                </h3>
                <p className="text-sm font-semibold text-muted-foreground">
                  {selectedFounder.role} — {selectedFounder.focusArea}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={selectedFounder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs font-semibold hover:border-emerald-500 text-foreground"
                >
                  <Linkedin className="h-4 w-4 text-emerald-600" />
                  <span>LinkedIn Profile</span>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                </a>
                <a
                  href={`mailto:${selectedFounder.email}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Direct</span>
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                  Verified Project Responsibilities
                </h4>
                <ul className="space-y-2">
                  {selectedFounder.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                  Engineering & Operational Focus
                </h4>
                <ul className="space-y-2">
                  {selectedFounder.verifiedDetails.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/30 text-[11px] text-muted-foreground">
              <strong>Ground Truth Policy:</strong> Founder credentials and biographies reflect verified project contributions. KisaanBuddy does not invent corporate accolades, artificial designations, or synthetic founder portraits.
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 8. OUR TECHNOLOGY PHILOSOPHY                                        */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-card/30">
        <div className="mx-auto w-full">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 block">
              TECHNICAL PHILOSOPHY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              AI Is the Engine. Farmer Understanding Is the Purpose.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              We select our technology stack solely based on whether it survives the constraints of rural Indian infrastructure: erratic cellular bandwidth, bright sunlight glare, and multilingual vernacular queries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-4">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold font-display text-foreground mb-2">
                  Sarvam AI & Vernacular NLP
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  English-centric LLMs fail to comprehend agricultural dialect subtleties. We integrate Sarvam AI models trained natively on Indian linguistic structures to parse Hindi and Hinglish queries naturally without robotic translation artifacts.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Verified Indian Language NLP
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 mb-4">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold font-display text-foreground mb-2">
                  Official AGMARKNET Pipelines
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Rather than scraping unverified classifieds, our mandi price intelligence pulls from AGMARKNET feeds, displaying minimum, maximum, and modal commodity rates alongside timestamped provenance.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                Live Mandi Price Transparency
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 mb-4">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold font-display text-foreground mb-2">
                  Next.js Edge & Mobile-First
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Built with Next.js 14 and Tailwind CSS for rapid client rendering on 3G and 4G networks. All components are tested for single-hand mobile operation and daylight contrast standards.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border/40 text-[11px] text-sky-700 dark:text-sky-400 font-semibold">
                Ultra-Low Latency Mobile Shell
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 9. OUR JOURNEY — BUILDING KISAANBUDDY ITERATIVELY                   */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="mx-auto w-full">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 block">
              DEVELOPMENT JOURNEY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              Building KisaanBuddy Iteratively.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              We do not fabricate milestone dates or invented user numbers. KisaanBuddy is being built step-by-step through real engineering and genuine agricultural understanding.
            </p>
          </div>

          <div className="relative border-l border-border/60 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-10">
            {JOURNEY_STAGES.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-card border-2 border-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                </span>

                <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-bold font-display text-foreground mt-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 10. WHAT WE BELIEVE & CLOSING                                       */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-gradient-to-b from-card/30 to-background">
        <div className="mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3 block">
              CORE PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              What We Believe
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {BELIEFS.map((belief, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 flex items-start gap-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0 mt-0.5">
                  0{idx + 1}
                </div>
                <p className="text-base sm:text-lg font-bold font-display text-foreground leading-snug">
                  &ldquo;{belief}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {/* Final Callout Banner */}
          <div className="rounded-3xl border border-emerald-600/30 bg-gradient-to-br from-emerald-950/10 via-background to-teal-950/10 p-8 sm:p-12 text-center shadow-lg">
            <h3 className="text-3xl sm:text-4xl font-black font-display text-foreground mb-4">
              We Are Just Getting Started.
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
              KisaanBuddy is a work in progress, driven by a bigger ambition: making agricultural intelligence more accessible, practical and farmer-centric.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/features">
                <Button className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                  <span>Explore the Platform</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="h-12 px-8 rounded-xl border-border/80 font-semibold">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 11. FREQUENTLY ASKED QUESTIONS (AUTHENTIC FAQ)                      */}
      {/* =================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        <div className="mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2 block">
              TRANSPARENCY & CLARITY
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Straightforward answers about our technology, data sourcing, and founding mission.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border/60 bg-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 12. PUBLIC IMPROVEMENTS SECTION (TRANSPARENCY FEEDBACK)             */}
      {/* =================================================================== */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-card/20">
        <div className="mx-auto w-full">
          <PublicImprovementsSection />
        </div>
      </div>
    </div>
  );
}
