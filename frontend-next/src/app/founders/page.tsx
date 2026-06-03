"use client"

import Link from "next/link"
import { Mail, Sprout, ArrowLeft, Sparkles, Check, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Founder = {
  name: string
  role: string
  email: string
  bio: string
  initials: string
  gradient: string
  stake: string
}

const FOUNDERS: Founder[] = [
  {
    name: "Aditya Ishwar",
    role: "Founder, CEO & Chief Architect (Head of KrishiAI)",
    email: "adityaoutlier5@gmail.com",
    bio: "Drives the technical vision of KrishiAI — full-stack architecture, AI integrations, and production deployment. Believes technology should reach every farmer's pocket.",
    initials: "AI",
    gradient: "from-emerald-400 to-green-600",
    stake: "20% Stake",
  },
  {
    name: "Utkarsh Sinha",
    role: "Co-Founder & ML Lead (Reporting to CEO)",
    email: "utkarsh.sinha.dev@gmail.com",
    bio: "Owns the ML pipeline — crop recommendation models, disease detection accuracy, and the curated agronomy knowledge base. Turns raw farm data into actionable insights.",
    initials: "US",
    gradient: "from-blue-400 to-indigo-600",
    stake: "20% Stake",
  },
  {
    name: "Ravi Sinha",
    role: "Co-Founder & Operations Lead (Reporting to CEO)",
    email: "sinharavi7088@gmail.com",
    bio: "Leads partnerships, outreach, and on-ground operations. Connects KrishiAI to farming communities and government schemes.",
    initials: "RS",
    gradient: "from-amber-400 to-orange-600",
    stake: "20% Stake",
  },
  {
    name: "Anant Kumar",
    role: "Co-Founder & Product Lead (Reporting to CEO)",
    email: "anant97715@gmail.com",
    bio: "Shapes the user experience and product direction. Focuses on making complex agricultural information accessible to farmers across India.",
    initials: "AK",
    gradient: "from-purple-400 to-fuchsia-600",
    stake: "20% Stake",
  },
  {
    name: "Pranit Powar",
    role: "Co-Founder & Support Lead (Reporting to CEO)",
    email: "pranitpowar1248@gmail.com",
    bio: "Leads farmer onboarding, support, and feedback loops. Makes sure every farmer query is heard and resolved — from sign-up to harvest day.",
    initials: "PP",
    gradient: "from-rose-400 to-pink-600",
    stake: "20% Stake",
  },
]

export default function FoundersPage() {
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
            <span>Back to home</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Meet the founders
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white leading-tight">
            The minds behind <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">KrishiAI</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
            We are a group of dedicated developers building AI-powered agricultural intelligence layers to support farming operations across Indian rural ecosystems.
          </p>
        </div>
      </section>

      {/* FOUNDERS GRID =================================================== */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FOUNDERS.map((f, i) => (
              <motion.div 
                key={f.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <FounderCard founder={f} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT ========================================================= */}
      <section className="px-6 md:px-12 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/[0.08] bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/15 p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none -z-10" />
          
          <div className="max-w-3xl text-center mx-auto space-y-4">
            <h2 className="text-3xl font-black text-white font-display">Get in touch with us</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Have questions, feedback, or interest in partnership opportunities? Drop us a line.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 text-left pt-4">
              {FOUNDERS.slice(0, 3).map((f) => (
                <a
                  key={f.email}
                  href={`mailto:${f.email}`}
                  className="flex flex-col gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] px-5 py-4 hover:border-emerald-500/20 transition-all group"
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
            Ready to try KrishiAI?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Free forever, mobile responsive, and fully localized in multi-language scripts.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/signup">
              <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 px-6 shadow-lg shadow-emerald-500/15">
                Get Started Free
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-white/[0.08] hover:bg-white/[0.03] text-white font-semibold h-11 px-6">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FounderCard({ founder }: { founder: Founder }) {
  return (
    <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative border border-white/[0.08] bg-slate-950/20 hover:border-emerald-500/20 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 p-6 md:p-8">
      {/* Top accent bar */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${founder.gradient}`} />

      <div>
        {/* Initials badge & Stake Badge */}
        <div className="flex justify-between items-center mb-6">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${founder.gradient} text-lg font-black text-white shadow-lg`}
          >
            {founder.initials}
          </div>
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse-glow">
            {founder.stake}
          </span>
        </div>

        {/* Name + role */}
        <h3 className="text-xl font-bold tracking-tight text-white font-display">{founder.name}</h3>
        <p className="mt-1 text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          {founder.role}
        </p>

        {/* Bio */}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground font-medium">{founder.bio}</p>
      </div>

      {/* Action button email */}
      <div className="mt-6 pt-4 border-t border-white/[0.04] space-y-3">
        <a
          href={`mailto:${founder.email}`}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] text-xs font-bold text-white transition-all"
        >
          <Mail className="h-4 w-4 text-emerald-400" />
          <span>Email Founder</span>
        </a>
        <div className="text-[10px] font-mono text-muted-foreground/50 text-center truncate">{founder.email}</div>
      </div>
    </GlassCard>
  )
}
