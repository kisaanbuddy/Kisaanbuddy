"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  XCircle, CheckCircle2, Sprout, CloudSun, TrendingUp,
  BookOpen, Smartphone, Globe2, Camera, Brain, Lightbulb,
  ArrowRight, Star, Shield, Zap, Users, MessageSquare, Bug,
  Play, ChevronRight,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { motion, useInView } from "framer-motion"

/* ─── Animated counter ─────────────────────────── */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1600
    const start = Date.now()
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>
}

/* ─── Section animation wrapper ────────────────── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════ */
export default function LandingPage() {
  const { user, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && user) router.replace("/dashboard")
  }, [ready, user, router])

  return (
    <div className="flex flex-col gap-0 -mt-12 md:-mt-16 -mx-4 md:-mx-8 overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden
        bg-gradient-to-br from-emerald-950/60 via-[#030e07] to-emerald-950/40 dark:from-emerald-950/80">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(34,197,94,0.25),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_70%,rgba(20,184,166,0.15),transparent)]" />
          {/* grid lines */}
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:px-12 lg:grid-cols-2 lg:py-24">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              India's #1 AI Agriculture Platform
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-white">
              Smart Farming
              <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>

            <p className="text-lg text-white/60 max-w-md leading-relaxed">
              Identify crop diseases, predict the best crop to grow, get live mandi prices, and connect with farm workers — all in one platform.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/signup">
                <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-green-500/30 transition-all hover:scale-105 hover:shadow-green-500/40 active:scale-95">
                  Start for Free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/disease">
                <button className="flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15">
                  <Play className="h-4 w-4" /> See Demo
                </button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 pt-2">
              {[
                { icon: Shield, text: "100% Free" },
                { icon: Zap,    text: "Works Offline" },
                { icon: Globe2, text: "Hindi · English · Kannada" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/60">
                  <Icon className="h-4 w-4 text-green-400 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — image card */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80"
                alt="Healthy crops"
                fill priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-4 -right-2 md:-right-6 rounded-2xl bg-white/95 dark:bg-slate-800/95 px-5 py-3 shadow-2xl backdrop-blur-sm"
            >
              <div className="text-3xl font-extrabold text-blue-600">95%</div>
              <div className="text-xs font-medium text-muted-foreground">Disease Accuracy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="absolute -bottom-4 -left-2 md:-left-6 rounded-2xl bg-white/95 dark:bg-slate-800/95 px-5 py-3 shadow-2xl backdrop-blur-sm"
            >
              <div className="text-2xl font-extrabold text-green-600">10K+</div>
              <div className="text-xs font-medium text-muted-foreground">Happy Farmers</div>
            </motion.div>

            {/* AI badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75 }}
              className="absolute bottom-6 right-4 flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md px-3 py-2 text-xs text-white"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              AI Analysis Active
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section className="bg-background border-y border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Farmers Using KrishiAI",  target: 10000, suffix: "+" },
            { label: "Diseases in AI Database",  target: 200,   suffix: "+" },
            { label: "States Covered",           target: 28,    suffix: ""  },
            { label: "Average Accuracy",         target: 95,    suffix: "%"  },
          ].map(({ label, target, suffix }) => (
            <FadeUp key={label} className="text-center">
              <div className="text-4xl font-black gradient-text">
                <AnimatedNumber target={target} suffix={suffix} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">{label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROBLEMS WE SOLVE
      ══════════════════════════════════════════ */}
      <section className="bg-background px-6 md:px-12 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="text-center mb-14">
            <span className="inline-block rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-500 mb-4">
              The Problem
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Farmers face these challenges<br />every single day
            </h2>
          </FadeUp>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              { problem: "Cannot identify crop disease on time",   solution: "Get instant AI diagnosis from a photo"    },
              { problem: "No practical farming guidance available", solution: "Follow step-by-step AI farming guides"    },
              { problem: "No reliable local weather updates",       solution: "Get hyper-local 7-day forecast"          },
              { problem: "Unable to get fair market rates",        solution: "Check live mandi rates — buy or sell"    },
            ].map(({ problem, solution }, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="rounded-2xl border border-border/60 bg-card/40 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all backdrop-blur-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 mt-0.5">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="font-semibold text-sm text-muted-foreground">{problem}</p>
                  </div>
                  <div className="flex items-start gap-3 pl-10">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <p className="font-bold text-sm text-green-600 dark:text-green-400">{solution}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-background via-emerald-50/30 to-background dark:via-emerald-950/15 px-6 md:px-12 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="text-center mb-14">
            <span className="inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-600 mb-4">
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Everything a farmer needs,
              <br />in one platform
            </h2>
          </FadeUp>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Bug     className="h-7 w-7 text-red-500" />,     title: "Crop Disease Diagnosis", body: "Upload crop photo and get instant AI-powered disease identification with organic & chemical treatment, exact dose", href: "/disease", accent: "border-red-500/20 hover:border-red-500/40" },
              { icon: <CloudSun className="h-7 w-7 text-blue-500" />,   title: "Weather Alerts",         body: "Real-time weather updates, 7-day forecasts, and crop-specific advisory for your exact location",                href: "/weather", accent: "border-blue-500/20 hover:border-blue-500/40" },
              { icon: <TrendingUp className="h-7 w-7 text-orange-500" />, title: "Mandi Prices",         body: "Live APMC mandi rates, price trends, and direct buy/sell connections with verified traders",                  href: "/mandi",   accent: "border-orange-500/20 hover:border-orange-500/40" },
              { icon: <BookOpen className="h-7 w-7 text-purple-500" />, title: "Farming Guides",         body: "Expert knowledge, government schemes, video tutorials, and best practices for every crop type",                href: "/schemes", accent: "border-purple-500/20 hover:border-purple-500/40" },
              { icon: <MessageSquare className="h-7 w-7 text-emerald-600" />, title: "AI Chatbot",       body: "Ask anything about farming in Hindi, English or Kannada — powered by GPT-4 with agricultural expertise",      href: "/chatbot", accent: "border-emerald-500/20 hover:border-emerald-500/40", highlighted: true },
              { icon: <Users   className="h-7 w-7 text-teal-500" />,    title: "Worker Connect",         body: "Find skilled farm workers, tractor operators and equipment near you — instant connections",                   href: "/worker-connect", accent: "border-teal-500/20 hover:border-teal-500/40" },
            ].map(({ icon, title, body, href, accent, highlighted }, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <Link href={href} className="block h-full">
                  <div className={`h-full rounded-2xl border bg-card/50 backdrop-blur-sm p-6
                    hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer
                    ${accent} ${highlighted ? "ring-1 ring-green-500/20" : ""}`}>
                    <div className="mb-4">{icon}</div>
                    <h3 className="mb-2 text-lg font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{body}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                      Explore <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 md:px-12 py-20 md:py-28">
        {/* Green gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700" />
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">How It Works</h2>
            <p className="mt-3 text-emerald-100/70 text-base">3 simple steps — no technical knowledge required</p>
          </FadeUp>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { num: "01", icon: <Camera className="h-7 w-7" />, title: "Capture",   body: "Take a photo of the affected leaf or plant with your phone"        },
              { num: "02", icon: <Brain  className="h-7 w-7" />, title: "Analyse",   body: "KrishiAI's AI instantly identifies the disease with 95% accuracy"  },
              { num: "03", icon: <Lightbulb className="h-7 w-7" />, title: "Act",    body: "Get exact treatment, organic options, and prevention guide"         },
            ].map(({ num, icon, title, body }, i) => (
              <FadeUp key={i} delay={i * 0.12} className="text-center text-white">
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                  {icon}
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-green-700 shadow-md">
                    {num}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-emerald-100/70 text-sm leading-relaxed">{body}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="bg-background px-6 md:px-12 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeUp className="text-center mb-14">
            <span className="inline-block rounded-full bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold text-yellow-600 mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Trusted by farmers<br />across India
            </h2>
          </FadeUp>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: "Ramesh Patel", state: "Gujarat",     text: "KrishiAI ne mere cotton ki bimari 2 minute mein pakad li. Pehle doctor ko 200 km door jana padta tha!",   rating: 5 },
              { name: "Sunita Devi",  state: "Uttar Pradesh", text: "Mandi rates daily check karta hoon. Aaj tak sabse achha deal mila is app se. Bohot helpful hai.",        rating: 5 },
              { name: "Arjun Singh",  state: "Punjab",      text: "Weather forecast bilkul sahi hota hai. Pichle season mein 30% zyada fasal ki wajah se yahi app hai.",       rating: 5 },
            ].map(({ name, state, text, rating }, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="rounded-2xl border border-border/60 bg-card/50 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all backdrop-blur-sm">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold">
                      {name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">{state}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20 md:py-24">
        <FadeUp>
          <div className="mx-auto max-w-3xl relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 p-12 md:p-16 text-center text-white shadow-2xl shadow-green-500/30">
            {/* bg blobs */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-teal-400/20 blur-2xl" />

            <div className="relative z-10">
              <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold mb-6">
                Free Forever — No Credit Card
              </span>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                Start farming smarter<br />today
              </h2>
              <p className="text-emerald-100/80 mb-8 max-w-md mx-auto">
                Join 10,000+ Indian farmers already using KrishiAI to protect crops, predict yields, and earn more.
              </p>
              <Link href="/signup">
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-bold text-green-700 shadow-xl hover:scale-105 hover:shadow-2xl active:scale-95 transition-all">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-background border-t border-border/50 px-6 md:px-12 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <Sprout className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-lg">Krishi<span className="text-green-500">AI</span></span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground justify-center">
              <Link href="/founders"      className="hover:text-primary transition-colors">Meet the Team</Link>
              <Link href="/disease"       className="hover:text-primary transition-colors">Disease Detect</Link>
              <Link href="/mandi"         className="hover:text-primary transition-colors">Mandi Prices</Link>
              <Link href="/chatbot"       className="hover:text-primary transition-colors">AI Chatbot</Link>
              <Link href="/weather"       className="hover:text-primary transition-colors">Weather</Link>
              <Link href="/login"         className="hover:text-primary transition-colors">Login</Link>
            </div>
          </div>
          <div className="divider-gradient mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} KrishiAI · Empowering Indian farmers with AI
            </p>
            <p className="text-xs text-muted-foreground">Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
