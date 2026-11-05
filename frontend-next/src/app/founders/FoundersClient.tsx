"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Sprout,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users2,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language";
import TrustTestimonials from "@/components/TrustTestimonials";
import { FOUNDERS_DATA, type FounderProfile } from "@/lib/data/founders-data";
import { FounderCard } from "@/components/founders/FounderCard";
import { FounderModal } from "@/components/founders/FounderModal";

export default function FoundersPage() {
  const { t } = useLanguage();
  const [selectedFounder, setSelectedFounder] = useState<FounderProfile | null>(null);

  return (
    <div className="-mt-8 -mx-4 md:-mx-8 flex flex-col relative pb-12 overflow-hidden bg-background">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-4 sm:px-6 md:px-12 py-12 md:py-20 border-b border-border/50 bg-muted/20 backdrop-blur-md">
        <div className="w-full">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t("founders.back_to_home")}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              {t("founders.meet_the_team")}
            </span>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700">
              RV College of Engineering (RVCE) Alumni
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[1.1]">
            {t("founders.the_minds_behind")}{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              {t("founders.KisaanBuddy")}
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            Founded by engineers from RV College of Engineering, Bengaluru. We are dedicated to building high-integrity, authentic artificial intelligence systems that empower Indian farmers with verified crop intelligence, real-time APMC mandi prices, and vernacular voice accessibility.
          </p>

          {/* Quick Credibility Trust Badges */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600 dark:text-stone-300 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Authentic Founder Profiles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified LinkedIn Credentials</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Incubated Agricultural Innovation</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDERS GRID SECTION */}
      <section className="px-4 sm:px-6 md:px-12 py-12 md:py-16">
        <div className="w-full">
          {/* Section Subheading */}
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
              Leadership Team
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-stone-900 dark:text-stone-50 tracking-tight">
              Dedicated Founders & Chief Architects
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              Meet the founders spearheading product architecture, machine learning engineering, and grassroots agricultural outreach.
            </p>
          </div>

          {/* 3-Column Equal Width Desktop, 2-Col Tablet, 1-Col Mobile */}
          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {FOUNDERS_DATA.map((founder, i) => (
              <motion.div
                key={founder.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="h-full flex"
              >
                <FounderCard
                  founder={founder}
                  onViewProfile={(f) => setSelectedFounder(f)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL PARTNERSHIP & ETHOS STRIP */}
      <section className="px-4 sm:px-6 md:px-12 py-10 bg-emerald-500/5 border-y border-emerald-500/20">
        <div className="w-full grid gap-6 sm:grid-cols-3 text-center sm:text-left">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-stone-900/60 border border-emerald-200/50 dark:border-emerald-800/50 shadow-2xs">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Reality First Principle</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Zero fabricated specs, dummy reviews, or AI-generated photos. Authenticity over visual vanity across all features.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-stone-900/60 border border-emerald-200/50 dark:border-emerald-800/50 shadow-2xs">
            <Users2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Field-Tested Usability</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Tested directly with real farming communities and APMC traders across Karnataka, Bihar, and Maharashtra.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-stone-900/60 border border-emerald-200/50 dark:border-emerald-800/50 shadow-2xs">
            <HeartHandshake className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Open to Institutional Partnerships</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Collaborating with KVK agricultural science centers, incubators, FPOs, and agronomic research organizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & TRUST */}
      <section className="px-4 sm:px-6 md:px-12 py-16 border-t border-border/50 bg-muted/10">
        <div className="w-full">
          <TrustTestimonials />
        </div>
      </section>

      {/* CONTACT BANNER */}
      <section className="px-4 sm:px-6 md:px-12 py-16">
        <div className="w-full rounded-3xl border border-border/70 bg-card/80 dark:bg-card/50 p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none -z-10" />

          <div className="max-w-4xl text-center mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground font-display">
              {t("founders.get_in_touch_with")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium">
              Have questions, feedback, partnership proposals, or investment inquiries? Connect directly with the founding team.
            </p>

            <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-3 text-left pt-2">
              {FOUNDERS_DATA.map((f) => (
                <a
                  key={f.id}
                  href={`mailto:${f.email}`}
                  className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-muted/40 hover:bg-muted/70 hover:border-emerald-500/30 px-5 py-4 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
                      {f.name}
                    </span>
                    <Mail className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="text-xs font-bold text-foreground truncate">{f.email}</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{f.role}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 md:px-12 py-10 md:py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-foreground">
            {t("founders.ready_to_try_KisaanBuddy")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed font-medium">
            {t("founders.free_forever_mobile_responsive")}
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <Link href="/signup">
              <button className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold h-11 px-7 shadow-lg shadow-emerald-600/25 flex items-center gap-2 group transition-all text-sm active:scale-[0.98] cursor-pointer">
                <span>{t("founders.get_started_free")}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/">
              <button className="rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-foreground font-semibold h-11 px-7 text-sm shadow-xs transition-all active:scale-[0.98] cursor-pointer">
                <span>{t("founders.learn_more")}</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Full Profile Modal */}
      <FounderModal
        founder={selectedFounder}
        onClose={() => setSelectedFounder(null)}
      />
    </div>
  );
}
