"use client"

import Link from "next/link"
import { Mail, Sprout, ArrowLeft, Sparkles, Check, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language"

type Founder = {
  name: string
  role: string
  email: string
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
      email: "aditya@krishiaiindia.com",
      bio: t("founders.drives_the_technical_vision"),
      initials: "AI",
      gradient: "from-emerald-400 to-green-600",
      stake: t("founders.founder"),
      image: "/aditya.png",
    },
    {
      name: "Utkarsh Sinha",
      role: t("founders.co_founder_managing_director"),
      email: "utkarsh@krishiaiindia.com",
      bio: t("founders.owns_the_ml_pipeline"),
      initials: "US",
      gradient: "from-blue-400 to-indigo-600",
      stake: t("founders.co_founder"),
      image: "/utkarsh.png",
    },
    {
      name: "Sanidhya Sharma",
      role: t("founders.co_founder_cto"),
      email: "sanidhya@krishiaiindia.com",
      bio: t("founders.steers_krishiai_s_technical"),
      initials: "SS",
      gradient: "from-purple-400 to-fuchsia-600",
      stake: t("founders.co_founder"),
      image: "/sanidhya.png",
    },
    {
      name: "Yash Singh",
      role: t("founders.co_founder_cmo"),
      email: "yash@krishiaiindia.com",
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
  const badgeColorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse-glow";

  return (
    <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-white/[0.08] bg-slate-950/20 hover:border-emerald-500/40 hover:-translate-y-2 hover:scale-[1.01] backdrop-blur-md shadow-lg hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 p-6 md:p-8">
      {/* Top accent bar */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${founder.gradient}`} />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        {/* Initials/Portrait & Stake Badge */}
        <div className="flex justify-between items-center mb-6">
          {founder.image ? (
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/[0.15] shadow-lg shadow-emerald-500/10 transition-all duration-300 group-hover:scale-105">
              <img
                src={founder.image}
                alt={founder.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${founder.gradient} text-lg font-black text-white shadow-lg shadow-emerald-500/10`}
            >
              {founder.initials}
            </div>
          )}
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold border ${badgeColorClass}`}>
            {founder.stake}
          </span>
        </div>

        {/* Name + role */}
        <h3 className="text-xl font-bold tracking-tight text-white font-display group-hover:text-emerald-400 transition-colors">{founder.name}</h3>
        <p className="mt-1 text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          {founder.role}
        </p>

        {/* Bio */}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground font-medium">{founder.bio}</p>
      </div>

      {/* Action button email */}
      <div className="mt-6 pt-4 border-t border-white/[0.04] space-y-3 relative z-10">
        <a
          href={`mailto:${founder.email}`}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-xs font-bold text-white transition-all duration-200"
        >
          <Mail className="h-4 w-4 text-emerald-400 group-hover:text-white transition-colors" />
          <span>{t("founders.email_founder_stake")}</span>
        </a>
        <div className="text-[10px] font-mono text-muted-foreground/50 text-center truncate">{founder.email}</div>
      </div>
    </GlassCard>
  )
}
