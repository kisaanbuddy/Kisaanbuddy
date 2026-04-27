"use client"

import Link from "next/link"
import { Mail, Linkedin, Github, Sprout, ArrowLeft } from "lucide-react"

type Founder = {
  name: string
  role: string
  email: string
  bio: string
  initials: string
  gradient: string
}

const FOUNDERS: Founder[] = [
  {
    name: "Aditya Ishwar",
    role: "Co-Founder & Lead Engineer",
    email: "adityaoutlier5@gmail.com",
    bio: "Drives the technical vision of KrishiAI — full-stack architecture, AI integrations, and production deployment. Believes technology should reach every farmer's pocket.",
    initials: "AI",
    gradient: "from-emerald-400 to-green-600",
  },
  {
    name: "Utkarsh Sinha",
    role: "Co-Founder & ML / Data Science",
    email: "utkarsh.sinha.dev@gmail.com",
    bio: "Owns the ML pipeline — crop recommendation models, disease detection accuracy, and the curated agronomy knowledge base. Turns raw farm data into actionable insights.",
    initials: "US",
    gradient: "from-blue-400 to-indigo-600",
  },
  {
    name: "Ravi Sinha",
    role: "Co-Founder & Operations",
    email: "sinharavi7088@gmail.com",
    bio: "Leads partnerships, outreach, and on-ground operations. Connects KrishiAI to farming communities and government schemes.",
    initials: "RS",
    gradient: "from-amber-400 to-orange-600",
  },
  {
    name: "Anant Kumar",
    role: "Co-Founder & Product",
    email: "anant97715@gmail.com",
    bio: "Shapes the user experience and product direction. Focuses on making complex agricultural information accessible to farmers across India.",
    initials: "AK",
    gradient: "from-purple-400 to-fuchsia-600",
  },
  {
    name: "Pranit Powar",
    role: "Co-Founder & Customer Support",
    email: "pranitpowar1248@gmail.com",
    bio: "Leads farmer onboarding, support, and feedback loops. Makes sure every farmer query is heard and resolved — from sign-up to harvest day.",
    initials: "PP",
    gradient: "from-rose-400 to-pink-600",
  },
]

export default function FoundersPage() {
  return (
    <div className="-mt-8 -mx-4 md:-mx-8 flex flex-col">
      {/* HERO ============================================================ */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-background dark:to-emerald-950/30 px-6 md:px-12 py-14 md:py-20">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600">
              <Sprout className="h-7 w-7 text-white" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
              Meet the Team
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            The minds behind <span className="text-green-600">KrishiAI</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Three engineers building an AI-powered agricultural assistant for Indian farmers.
            Empowering farmers with technology, one query at a time.
          </p>
        </div>
      </section>

      {/* FOUNDERS GRID =================================================== */}
      <section className="bg-background px-6 md:px-12 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FOUNDERS.map((f) => (
              <FounderCard key={f.email} founder={f} />
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT ========================================================= */}
      <section className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 md:px-12 py-14 md:py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Get in touch</h2>
          <p className="mt-3 text-emerald-50">
            Have a question, a partnership idea, or feedback? We&apos;d love to hear from you.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {FOUNDERS.map((f) => (
              <a
                key={f.email}
                href={`mailto:${f.email}`}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-5 py-4 hover:bg-white/20 transition-all"
              >
                <Mail className="h-5 w-5" />
                <div className="text-xs uppercase tracking-wider opacity-80">{f.name.split(" ")[0]}</div>
                <div className="break-all text-sm font-medium">{f.email}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA ============================================================= */}
      <section className="bg-emerald-50/50 dark:bg-emerald-950/20 px-6 md:px-12 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to try KrishiAI?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Free forever, mobile friendly, multi-language.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <button className="rounded-full bg-green-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:bg-green-700 hover:scale-105">
                Get Started Free
              </button>
            </Link>
            <Link href="/">
              <button className="rounded-full border-2 border-green-600 bg-transparent px-8 py-3.5 text-sm font-semibold text-green-600 transition-all hover:bg-green-600 hover:text-white">
                Learn More
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
    <div className="group relative overflow-hidden rounded-3xl border bg-card p-6 md:p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Gradient accent strip */}
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${founder.gradient}`} />

      {/* Avatar */}
      <div
        className={`mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${founder.gradient} text-2xl font-extrabold text-white shadow-lg`}
      >
        {founder.initials}
      </div>

      {/* Name + role */}
      <h3 className="text-2xl font-bold tracking-tight">{founder.name}</h3>
      <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
        {founder.role}
      </p>

      {/* Bio */}
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{founder.bio}</p>

      {/* Contact row */}
      <div className="mt-6 flex items-center gap-3 border-t pt-4">
        <a
          href={`mailto:${founder.email}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/40 px-4 py-2.5 text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/60 transition-colors"
        >
          <Mail className="h-4 w-4" />
          <span className="truncate">Email</span>
        </a>
      </div>

      <p className="mt-3 break-all text-xs text-muted-foreground">{founder.email}</p>
    </div>
  )
}
