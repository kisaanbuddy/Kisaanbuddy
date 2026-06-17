"use client"

import Link from "next/link"
import { Mail, Sprout, ArrowLeft, Sparkles, Check, ArrowRight, Linkedin } from "lucide-react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language"

type Founder = {
  name: string
  role: string
  email: string
  linkedin: string
  bio: string
  initials: string
  gradient: string
  stake: string
  image: string
}

export default function FoundersPage() {
  const { t, lang } = useLanguage();

  const founders: Founder[] = [
    {
      name: "Aditya Ishwar",
      role: t("founders.founder_ceo_chief_architect"),
      email: "Team@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/aditya-ishwar",
      bio: t("founders.drives_the_technical_vision"),
      initials: "AI",
      gradient: "from-emerald-400 to-green-600",
      stake: t("founders.founder"),
      image: "/aditya.png",
    },
    {
      name: "Utkarsh Sinha",
      role: t("founders.co_founder_managing_director"),
      email: "Team@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/utkarsh-sinha",
      bio: t("founders.owns_the_ml_pipeline"),
      initials: "US",
      gradient: "from-blue-400 to-indigo-600",
      stake: t("founders.co_founder"),
      image: "/utkarsh.png",
    },
    {
      name: "Sanidhya Sharma",
      role: t("founders.co_founder_cto"),
      email: "Team@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/sanidhya-sharma",
      bio: t("founders.steers_krishiai_s_technical"),
      initials: "SS",
      gradient: "from-purple-400 to-fuchsia-600",
      stake: t("founders.co_founder"),
      image: "",
    },
    {
      name: "Yash Singh",
      role: t("founders.co_founder_cmo"),
      email: "Team@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/yash-singh",
      bio: t("founders.co_founder_and_chief"),
      initials: "YS",
      gradient: "from-rose-400 to-pink-600",
      stake: t("founders.co_founder"),
      image: "/yash.png",
    },
  ]

  return (
    <div className="-mt-8 -mx-4 md:-mx-8 flex flex-col relative pb-12 overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[10%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* HERO ============================================================ */}
      <section className="relative overflow-hidden px-6 md:px-12 py-16 md:py-24 border-b border-white/[0.06] bg-slate-950/20 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t("founders.back_to_home")}</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t("founders.meet_the_team")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white leading-tight">
            {t("founders.the_minds_behind")}{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">
              {t("founders.krishiai")}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("founders.we_are_a_group")}
          </p>
        </div>
      </section>

      {/* FOUNDERS GRID =================================================== */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {founders.map((f, i) => (
              <motion.div 
                key={f.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <FounderCard founder={f} lang={lang} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT ========================================================= */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/[0.08] bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/15 p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none -z-10" />
          
          <div className="max-w-4xl text-center mx-auto space-y-4">
            <h2 className="text-3xl font-black text-white font-display">
              {t("founders.get_in_touch_with")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {t("founders.have_questions_feedback_or")}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left pt-4">
              {founders.map((f) => (
                <a
                  key={f.email}
                  href={`mailto:${f.email}`}
                  className="flex flex-col gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] px-5 py-4 hover:border-emerald-500/20 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-extrabold">{f.name.split(" ")[0]}</span>
                    <Mail className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="text-xs font-bold text-white truncate">{f.email}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA ============================================================= */}
      <section className="px-6 md:px-12 py-10 md:py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl font-black font-display text-white">
            {t("founders.ready_to_try_krishiai")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t("founders.free_forever_mobile_responsive")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/signup">
              <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 px-6 shadow-lg shadow-emerald-500/15">
                {t("founders.get_started_free")}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-white/[0.08] hover:bg-white/[0.03] text-white font-semibold h-11 px-6">
                {t("founders.learn_more")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FounderCard({ founder, lang }: { founder: Founder; lang: string }) {
  const { t } = useLanguage();
  const badgeColorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";

  return (
    <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-white/[0.06] bg-slate-950/40 hover:border-emerald-500/30 hover:-translate-y-1.5 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 p-6 md:p-8 rounded-2xl text-center">
      {/* Top accent bar */}
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${founder.gradient}`} />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Stake Badge */}
        <span className={`absolute top-0 right-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest border ${badgeColorClass}`}>
          {founder.stake}
        </span>

        {/* Large Circular Profile Image */}
        <div className="relative mt-4 mb-6">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative h-28 w-28 rounded-full overflow-hidden border border-white/10 group-hover:border-emerald-400/50 shadow-2xl transition-all duration-300 bg-slate-900">
            {founder.image ? (
              <img
                src={founder.image}
                alt={founder.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${founder.gradient} text-2xl font-black text-white`}>
                {founder.initials}
              </div>
            )}
          </div>
        </div>

        {/* Name + role */}
        <h3 className="text-lg font-bold tracking-tight text-white font-display group-hover:text-emerald-400 transition-colors duration-300">
          {founder.name}
        </h3>
        <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          {founder.role}
        </p>

        {/* Bio */}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground font-medium min-h-[96px]">
          {founder.bio}
        </p>
      </div>

      {/* Action buttons (LinkedIn primary + Mail secondary) */}
      <div className="mt-6 pt-4 border-t border-white/[0.04] flex gap-2.5 relative z-10">
        <a
          href={founder.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900/60 border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 text-xs font-bold text-slate-300 hover:text-emerald-400 active:scale-[0.98] transition-all duration-200"
        >
          <Linkedin className="h-4 w-4 text-emerald-400" />
          <span>LinkedIn</span>
        </a>
        <a
          href={`mailto:${founder.email}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 active:scale-[0.98] transition-all duration-200"
          title={`Email ${founder.name.split(" ")[0]}`}
        >
          <Mail className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
        </a>
      </div>
    </GlassCard>
  );
}
