"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  XCircle,
  CheckCircle2,
  Sprout,
  CloudSun,
  TrendingUp,
  BookOpen,
  Smartphone,
  Globe2,
  Camera,
  Brain,
  Lightbulb,
} from "lucide-react"

import { useAuth } from "@/lib/auth"

export default function LandingPage() {
  const { user, ready } = useAuth()
  const router = useRouter()

  // If user is already logged in, send them to the dashboard.
  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard")
    }
  }, [ready, user, router])

  return (
    <div className="flex flex-col gap-0 -mt-12 md:-mt-16 -mx-4 md:-mx-8">
      {/* HERO ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-background dark:to-emerald-950/30 px-6 md:px-12 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="text-green-600">For Farmers</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                AI Revolution in
              </span>
              <br />
              <span className="text-blue-600">Farming</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Identify crop diseases &middot; Use farmer guides &middot; Get weather updates &middot; Get fair prices
            </p>

            <p className="text-sm text-muted-foreground/80">
              Empowering Farmers with AI-Powered Agriculture Platform
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/signup">
                <button className="rounded-full bg-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:bg-green-700 hover:scale-105 active:scale-95">
                  Get Started
                </button>
              </Link>
              <Link href="/disease">
                <button className="rounded-full border-2 border-green-600 bg-transparent px-8 py-3.5 text-base font-semibold text-green-600 transition-all hover:bg-green-600 hover:text-white">
                  Check Crop
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <Badge>100% Free</Badge>
              <Badge>Works Offline</Badge>
              <Badge>Multi-Language</Badge>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 opacity-20" />
              <Image
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80"
                alt="Healthy crops"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -top-4 right-4 md:-right-4 rounded-2xl bg-white px-5 py-3 shadow-xl dark:bg-slate-800">
              <div className="text-3xl font-extrabold text-blue-600">95%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="absolute -bottom-4 left-4 md:-left-4 rounded-2xl bg-white px-5 py-3 shadow-xl dark:bg-slate-800">
              <div className="text-2xl font-extrabold text-green-600">10K+</div>
              <div className="text-sm text-muted-foreground">Happy Farmers</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS ======================================================= */}
      <section className="bg-background px-6 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl md:text-4xl font-bold">
            We solve farmers&apos; problems
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <ProblemCard
              problem="Cannot identify crop disease on time"
              solution="Get instant answer from AI"
            />
            <ProblemCard
              problem="Lack of practical farming guidance"
              solution="Follow step-by-step farming guides"
            />
            <ProblemCard
              problem="No reliable weather updates"
              solution="Get 15-day forecast"
            />
            <ProblemCard
              problem="Unable to get fair market rates"
              solution="Check live mandi rates"
            />
          </div>
        </div>
      </section>

      {/* SERVICES ======================================================= */}
      <section className="bg-gradient-to-b from-background to-emerald-50/40 dark:to-emerald-950/20 px-6 md:px-12 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
            <p className="mt-3 text-muted-foreground">
              Complete agricultural solution for modern farmers — all in one platform
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={<Sprout className="h-7 w-7 text-green-600" />}
              title="Crop Disease Diagnosis"
              body="Upload crop photo and get instant AI-powered disease identification with treatment"
              href="/disease"
            />
            <ServiceCard
              icon={<CloudSun className="h-7 w-7 text-blue-500" />}
              title="Weather Alerts"
              body="Real-time weather updates, forecasts, and crop-specific advisory"
              href="/weather"
            />
            <ServiceCard
              icon={<TrendingUp className="h-7 w-7 text-orange-500" />}
              title="Market Prices"
              body="Live mandi rates, price trends, and profit calculators"
              href="/mandi"
            />
            <ServiceCard
              icon={<BookOpen className="h-7 w-7 text-purple-500" />}
              title="Farming Guides"
              body="Expert knowledge, video tutorials, and best practices"
              href="/schemes"
            />
            <ServiceCard
              icon={<Smartphone className="h-7 w-7 text-emerald-600" />}
              title="Mobile Friendly"
              body="Works on any device, even with slow internet"
              highlighted
            />
            <ServiceCard
              icon={<Globe2 className="h-7 w-7 text-teal-500" />}
              title="Market Resources"
              body="Direct links to trusted government portals, loan schemes, and agri-marketplaces"
              href="/worker-connect"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS =================================================== */}
      <section className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 md:px-12 py-16 md:py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-14 text-center text-3xl md:text-4xl font-bold">How It Works</h2>

          <div className="grid gap-12 md:grid-cols-3">
            <StepCard
              num="1"
              title="Take Photo"
              body="Upload crop image from your phone"
              icon={<Camera className="h-7 w-7" />}
            />
            <StepCard
              num="2"
              title="AI Analysis"
              body="Get instant disease diagnosis"
              icon={<Brain className="h-7 w-7" />}
            />
            <StepCard
              num="3"
              title="Get Solution"
              body="Follow treatment recommendations"
              icon={<Lightbulb className="h-7 w-7" />}
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA ====================================================== */}
      <section className="bg-emerald-50/50 dark:bg-emerald-950/20 px-6 md:px-12 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Start today and make farming easier
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of farmers already using KrishiAI for better farming
          </p>
          <Link href="/signup">
            <button className="mt-8 rounded-full bg-green-600 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-green-500/25 transition-all hover:bg-green-700 hover:scale-105 active:scale-95">
              Sign Up Free
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER ========================================================= */}
      <footer className="bg-background px-6 md:px-12 py-8 border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} KrishiAI &middot; Empowering Indian farmers
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-primary">Login</Link>
            <Link href="/signup" className="hover:text-primary">Sign Up</Link>
            <Link href="/chatbot" className="hover:text-primary">Chatbot</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ----------------------------- helper components -----------------------

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <CheckCircle2 className="h-5 w-5 text-green-600" />
      <span>{children}</span>
    </div>
  )
}

function ProblemCard({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="rounded-2xl border border-rose-200/40 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900/40 p-6 transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500">
          <XCircle className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold">{problem}</h3>
      </div>
      <div className="mt-4 flex items-start gap-3 pl-10">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <p className="font-medium text-green-700 dark:text-green-400">{solution}</p>
      </div>
    </div>
  )
}

function ServiceCard({
  icon,
  title,
  body,
  href,
  highlighted = false,
}: {
  icon: React.ReactNode
  title: string
  body: string
  href?: string
  highlighted?: boolean
}) {
  const Inner = (
    <div
      className={`h-full rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${
        highlighted ? "border-green-500/40 ring-1 ring-green-500/20" : "border-border"
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  )
  return href ? <Link href={href}>{Inner}</Link> : Inner
}

function StepCard({
  num,
  title,
  body,
  icon,
}: {
  num: string
  title: string
  body: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-extrabold text-green-600 shadow-xl">
        {num}
        <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-emerald-50/90">{body}</p>
    </div>
  )
}
