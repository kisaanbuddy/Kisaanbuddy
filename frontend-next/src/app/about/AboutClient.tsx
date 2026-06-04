'use client';

import Link from 'next/link';
import { Sprout, Sparkles, Brain, CloudSun, TrendingUp, Users, Mail, ArrowRight, Shield, Bug, Landmark, BookOpen, FlaskConical, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';

type Founder = {
  name: string;
  role: string;
  email: string;
  bio: string;
  initials: string;
  gradient: string;
};

const FOUNDERS: Founder[] = [
  {
    name: "Aditya Ishwar",
    role: "Founder, CEO & Chief Architect",
    email: "adityaoutlier5@gmail.com",
    bio: "Drives the technical vision of KrishiAI — full-stack architecture, AI integrations, and production deployment. Believes technology should reach every farmer's pocket.",
    initials: "AI",
    gradient: "from-emerald-400 to-green-600",
  },
  {
    name: "Utkarsh Sinha",
    role: "Co-Founder & ML Lead",
    email: "utkarsh.sinha.dev@gmail.com",
    bio: "Owns the ML pipeline — crop recommendation models, disease detection accuracy, and the curated agronomy knowledge base. Turns raw farm data into actionable insights.",
    initials: "US",
    gradient: "from-blue-400 to-indigo-600",
  },
  {
    name: "Ravi Sinha",
    role: "Co-Founder & Operations Lead",
    email: "sinharavi7088@gmail.com",
    bio: "Leads partnerships, outreach, and on-ground operations. Connects KrishiAI to farming communities and government schemes.",
    initials: "RS",
    gradient: "from-amber-400 to-orange-600",
  },
  {
    name: "Anant Kumar",
    role: "Co-Founder & Product Lead",
    email: "anant97715@gmail.com",
    bio: "Shapes the user experience and product direction. Focuses on making complex agricultural information accessible to farmers across India.",
    initials: "AK",
    gradient: "from-purple-400 to-fuchsia-600",
  },
  {
    name: "Pranit Powar",
    role: "Co-Founder & Support Lead",
    email: "pranitpowar1248@gmail.com",
    bio: "Leads farmer onboarding, support, and feedback loops. Makes sure every farmer query is heard and resolved — from sign-up to harvest day.",
    initials: "PP",
    gradient: "from-rose-400 to-pink-600",
  },
];

export function AboutClient() {
  const { t } = useLanguage();

  return (
    <div className="-mt-8 -mx-4 md:-mx-8 flex flex-col relative pb-12 overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[10%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-6 md:px-12 py-16 md:py-24 border-b border-border/20 bg-card/25 backdrop-blur-md">
        <div className="mx-auto max-w-5xl text-center md:text-left">
          <div className="flex justify-center md:justify-start items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t("aboutUs")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-foreground leading-tight">
            Empowering Agriculture with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">KrishiAI</span>
          </h1>
          <p className="mt-4 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
            KrishiAI is an AI-powered smart agriculture ecosystem tailored for Indian farmers. We bridge the gap between advanced machine learning algorithms and ground-level farming techniques to double efficiency, mitigate crop disease risk, and optimize crop yields.
          </p>
        </div>
      </section>

      {/* PLATFORM MISSION, VISION, VALUES */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">Our Mission</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To deliver accessible, local-language AI solutions directly into the hands of every farmer across India, helping them make scientific decisions to improve crop health and farm profitability.
            </p>
          </div>

          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-500">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">Our Vision</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To build a smart, sustainable agricultural ecosystem in rural India where real-time machine learning predictions minimize crop losses and secure fair market value for Kisans.
            </p>
          </div>

          <div className="rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm p-6 flex flex-col gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground font-display">Our Values</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Farmers first. We design all features with voice support and local language interfaces to provide straightforward, actionable insights with minimal technological barriers.
            </p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES LIST */}
      <section className="px-6 md:px-12 py-16 bg-muted/10 border-y border-border/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Advanced Agricultural Features</h2>
            <p className="text-xs text-muted-foreground mt-2">What makes KrishiAI the ultimate AI assistant for smart farming</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bug, title: "Crop Disease AI", desc: "Instantly diagnose crop leaf diseases and receive organic and chemical treatments." },
              { icon: CloudSun, title: "Weather Intelligence", desc: "Hyper-local forecasts with specific warnings for severe rain, humidity, and heat." },
              { icon: TrendingUp, title: "Live Mandi Prices", desc: "APMC market rates tracked in real-time with automatic target alert thresholds." },
              { icon: Sprout, title: "Crop Predictor AI", desc: "Predicts the best crops for your soil chemistry, weather trends, and location." },
              { icon: Landmark, title: "Sarkari Yojnayein", desc: "Easy check for PM-Kisan, PMFBY, KCC eligibility with guides to apply." },
              { icon: BookOpen, title: "Khet Diary", desc: "Keep dynamic logs of farm activity, daily expenditure, and localized weather." }
            ].map((f, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl border border-border/20 bg-background/50 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-foreground font-display">{f.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDERS GRID */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">Meet the Founders</h2>
            <p className="text-xs text-muted-foreground mt-2">The development team behind KrishiAI</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FOUNDERS.map((f, i) => (
              <motion.div 
                key={f.email}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-border/40 bg-card/20 hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 p-6">
                  {/* Accent Line */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.gradient}`} />
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-base font-black text-white shadow-sm`}>
                        {f.initials}
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-foreground font-display">{f.name}</h3>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                      {f.role}
                    </p>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/90 font-medium">
                      {f.bio}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/20">
                    <a
                      href={`mailto:${f.email}`}
                      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-background/50 border border-border/30 hover:bg-muted/50 text-xs font-semibold text-foreground transition-all"
                    >
                      <Mail className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Email Founder</span>
                    </a>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 md:px-12 py-10 text-center">
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-500/10 bg-gradient-to-r from-emerald-950/10 to-teal-950/10 p-8 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-3">
            Optimize Your Harvesting Operations Today
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
            Register a free account, test your crop disease models, and start keeping logs in Khet Diary.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/signup">
              <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 px-5 shadow-lg shadow-emerald-500/15">
                Join Free
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-border/40 hover:bg-white/[0.03] text-foreground font-semibold h-10 px-5">
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
