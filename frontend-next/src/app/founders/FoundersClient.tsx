"use client"

import Link from "next/link"
import { Mail, Sprout, ArrowLeft, Sparkles, Linkedin, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language"
import TrustTestimonials from "@/components/TrustTestimonials"

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
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/aditya-ishwar",
      bio: t("founders.drives_the_technical_vision"),
      initials: "AI",
      gradient: "from-emerald-500 via-teal-500 to-emerald-600",
      stake: t("founders.founder"),
      image: "/aditya.png",
    },
    {
      name: "Utkarsh Sinha",
      role: t("founders.co_founder_managing_director"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/utkarsh-sinha",
      bio: t("founders.owns_the_ml_pipeline"),
      initials: "US",
      gradient: "from-teal-500 via-emerald-500 to-cyan-600",
      stake: t("founders.co_founder"),
      image: "/utkarsh.png",
    },
    {
      name: "Yash Singh",
      role: t("founders.co_founder_cmo"),
      email: "info@kisaanbuddy.com",
      linkedin: "https://www.linkedin.com/in/yash-singh-33553b2a5",
      bio: t("founders.co_founder_and_chief"),
      initials: "YS",
      gradient: "from-amber-500 via-orange-500 to-emerald-600",
      stake: t("founders.co_founder"),
      image: "/yash.png",
    },
  ]

  return (
    <div className="-mt-8 -mx-4 md:-mx-8 flex flex-col relative pb-12 overflow-hidden bg-background">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden px-6 md:px-12 py-16 md:py-20 border-b border-border/50 bg-muted/20 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t("founders.back_to_home")}</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              {t("founders.meet_the_team")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-foreground leading-[1.1]">
            {t("founders.the_minds_behind")}{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              {t("founders.KisaanBuddy")}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            {t("founders.we_are_a_group")}
          </p>
        </div>
      </section>

      {/* FOUNDERS GRID */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {founders.map((f, i) => (
              <motion.div 
                key={f.email + f.name}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <FounderCard founder={f} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & TRUST */}
      <section className="px-6 md:px-12 py-16 border-t border-border/50 bg-muted/10">
        <div className="mx-auto max-w-5xl">
          <TrustTestimonials />
        </div>
      </section>

      {/* CONTACT BANNER */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-6xl rounded-3xl border border-border/70 bg-card/80 dark:bg-card/50 p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none -z-10" />
          
          <div className="max-w-4xl text-center mx-auto space-y-4">
            <h2 className="text-3xl font-black text-foreground font-display">
              {t("founders.get_in_touch_with")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium">
              {t("founders.have_questions_feedback_or")}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left pt-2">
              {founders.map((f) => (
                <a
                  key={f.email + f.name}
                  href={`mailto:${f.email}`}
                  className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-muted/40 hover:bg-muted/70 hover:border-emerald-500/30 px-5 py-4 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">{f.name.split(" ")[0]}</span>
                    <Mail className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="text-xs font-bold text-foreground truncate">{f.email}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-10 md:py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-3xl font-black font-display text-foreground">
            {t("founders.ready_to_try_KisaanBuddy")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed font-medium">
            {t("founders.free_forever_mobile_responsive")}
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <Link href="/signup">
              <button className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold h-11 px-7 shadow-lg shadow-emerald-600/25 flex items-center gap-2 group transition-all text-sm active:scale-[0.98]">
                <span>{t("founders.get_started_free")}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/">
              <button className="rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-foreground font-semibold h-11 px-7 text-sm shadow-xs transition-all active:scale-[0.98]">
                {t("founders.learn_more")}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div className="h-full flex flex-col justify-between group overflow-hidden relative border border-border/70 bg-card/80 dark:bg-card/50 hover:border-emerald-500/40 hover:-translate-y-1.5 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 rounded-2xl text-center">
      {/* Top accent bar */}
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${founder.gradient}`} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Stake Badge */}
        <span className="absolute top-0 right-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400">
          {founder.stake}
        </span>

        {/* Circular Profile Image */}
        <div className="relative mt-3 mb-5">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 blur-sm group-hover:opacity-50 transition-opacity duration-500" />
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border group-hover:border-emerald-500/60 shadow-lg transition-all duration-300 bg-muted flex items-center justify-center">
            {founder.image ? (
              <img
                src={founder.image}
                alt={founder.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${founder.gradient} text-xl font-black text-white`}>
                {founder.initials}
              </div>
            )}
          </div>
        </div>

        {/* Name + role */}
        <h3 className="text-base font-bold tracking-tight text-foreground font-display group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
          {founder.name}
        </h3>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {founder.role}
        </p>

        {/* Bio */}
        <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground font-medium min-h-[72px]">
          {founder.bio}
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-5 pt-3.5 border-t border-border/50 flex gap-2 relative z-10">
        <a
          href={founder.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-muted/60 border border-border/70 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-xs font-bold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-[0.98] transition-all duration-200"
        >
          <Linkedin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>LinkedIn</span>
        </a>
        <a
          href={`mailto:${founder.email}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 border border-border/70 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-[0.98] transition-all duration-200"
          title={`Email ${founder.name.split(" ")[0]}`}
        >
          <Mail className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
