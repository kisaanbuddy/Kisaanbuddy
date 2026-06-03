"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle, Leaf, ArrowRight, CloudSun, BrainCircuit,
  Thermometer, Droplets, Wind, TrendingUp, Sprout,
  Store, MessageSquare, Bug, ChevronRight, Zap, Activity,
  Users, Star, Shield, BookOpen, FlaskConical, Landmark,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentByCoords, resolveUserLocation, type UnifiedWeather } from "@/lib/weather-api"
import { UnitProvider } from "@/components/weather/unit-context"
import { WeatherCard } from "@/components/weather/WeatherCard"
import { useAuth } from "@/lib/auth"
import { useLanguage } from '@/lib/language'

/* ─── Motion presets ─────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay },
})
const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay },
})

/* ─── Time-based greeting ────────────────────────── */
function getGreeting(name?: string) {
  const h = new Date().getHours()
  const prefix =
    h < 12 ? "Suprabhat 🌅" : h < 17 ? "Namaskar ☀️" : "Shubh Sandhya 🌙"
  return name ? `${prefix}, ${name}!` : `${prefix}!`
}

/* ─── Quick-stat card data ───────────────────────── */
function QuickStatCard({
  icon, label, value, unit, sub, colorClass, delay,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  unit?: string
  sub?: string
  colorClass: string
  delay: number
}) {
  return (
    <motion.div {...scaleIn(delay)}>
      <div className={`relative overflow-hidden rounded-2xl border border-border/30 p-5 card-lift
        bg-gradient-to-br ${colorClass} backdrop-blur-md hover:border-primary/20 shadow-sm`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/40 border border-border/20 backdrop-blur-sm shadow-inner">
            {icon}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">{value}</span>
          {unit && <span className="text-xs font-semibold text-muted-foreground/90 ml-0.5">{unit}</span>}
        </div>
        {sub && <p className="mt-1.5 text-[10px] text-muted-foreground/80 font-medium">{sub}</p>}
        {/* decorative blob */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-primary/5 blur-xl" />
      </div>
    </motion.div>
  )
}

/* ─── Feature shortcut card ──────────────────────── */
function FeatureCard({
  icon, label, desc, href, accent, delay,
}: {
  icon: React.ReactNode; label: string; desc: string
  href: string; accent: string; delay: number
}) {
  return (
    <motion.div {...fadeUp(delay)}>
      <Link href={href} className="group block h-full">
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm p-5
          hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
          <div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${accent} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
              {icon}
            </div>
            <h3 className="font-display font-bold text-sm mb-1 text-foreground group-hover:text-emerald-500 transition-colors">{label}</h3>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed mb-4">{desc}</p>
          </div>
          <div className="relative flex justify-end">
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </div>
          {/* hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
            bg-gradient-to-br from-transparent to-emerald-500/3 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Alert tile ─────────────────────────────────── */
function AlertTile({ title, body, tone = "warn" }: { title: string; body: string; tone?: "warn" | "good" | "neutral" }) {
  const styles = {
    warn:    "border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/2 text-amber-800 dark:text-amber-300",
    good:    "border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-emerald-500/2 text-emerald-800 dark:text-emerald-300",
    neutral: "border-border/40 bg-muted/20 text-muted-foreground",
  }
  const icons = {
    warn:    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />,
    good:    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />,
    neutral: <Activity className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />,
  }
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${styles[tone]} backdrop-blur-sm`}>
      {icons[tone]}
      <div>
        <h4 className="font-semibold text-xs md:text-sm">{title}</h4>
        <p className="mt-1 text-[11px] opacity-85 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   ROOT EXPORT
   ═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, ready } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login")
    }
  }, [ready, user, router])

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground font-semibold text-sm">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading your farm...
        </div>
      </div>
    )
  }

  return <UnitProvider><DashboardInner user={user} /></UnitProvider>
}

/* ─── Dashboard inner (needs auth) ─────────────────── */
function DashboardInner({ user }: { user: any }) {
  const [weather, setWeather]   = useState<UnifiedWeather | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [sensorData, setSensor] = useState<{temperature?: number; humidity?: number; soil_moisture?: number} | null>(null)

  /* fetch weather */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true); setError(null)
        const r = await resolveUserLocation()
        const data = await getCurrentByCoords(r.lat, r.lon)
        if (!cancelled) setWeather(data)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load weather.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  /* try fetching latest sensor data */
  useEffect(() => {
    fetch("/api/sensor/latest", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSensor(d) })
      .catch(() => {})
  }, [])

  const humidityAlert = weather && weather.current.humidity >= 75
  const heatAlert     = weather && weather.current.temp_c >= 38

  const displayName = user?.name || user?.email?.split("@")[0] || ""

  return (
    <div className="flex flex-col gap-6 pb-6">

      {/* ── Guest Banner ── */}
      {!user && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-3 text-xs md:text-sm">
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            Bina account ke use kar rahe hain — data save nahi hoga.
          </span>
          <a href="/signup" className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 transition-all active:scale-95">
            Free Account Banao
          </a>
        </div>
      )}

      {/* ── GREETING HERO ──────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061810] via-[#0b2b1e] to-[#04100b] border border-emerald-500/10 p-7 md:p-10 text-white shadow-2xl">
        {/* Background shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/5 blur-[80px]" />
          <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-[#14b8a6]/3 blur-[90px]" />
          <div className="absolute right-1/3 bottom-0 h-32 w-32 rounded-full bg-emerald-400/5 blur-xl animate-float" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight leading-snug">
              {getGreeting(displayName)}
            </h1>
            <p className="text-muted-foreground/90 text-xs md:text-sm max-w-md leading-relaxed">
              Your smart farm is active. Real-time data, AI insights, and market prices — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/crop-predictor">
              <button className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-3 shadow-md hover:shadow-glow-primary active:scale-95 transition-all">
                <Sprout className="h-4 w-4" /> Predict Crop
              </button>
            </Link>
            <Link href="/chatbot">
              <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-xs px-5 py-3 hover:bg-white/10 transition-all backdrop-blur-sm">
                <MessageSquare className="h-4 w-4 text-emerald-400" /> Ask AI
              </button>
            </Link>
          </div>
        </div>
        
        {/* Live indicator */}
        <div className="relative z-10 mt-6 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">KrishiAI Live — data updating</span>
        </div>
      </motion.div>

      {/* ── QUICK STATS ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard
          delay={0.05}
          icon={<Thermometer className="h-5 w-5 text-orange-400" />}
          label="Temperature"
          value={
            sensorData?.temperature != null
              ? sensorData.temperature.toFixed(1)
              : weather
              ? Math.round(weather.current.temp_c)
              : "--"
          }
          unit="°C"
          sub={sensorData ? "Field sensor node" : "Local forecast"}
          colorClass="from-orange-500/5 to-amber-500/2 border-orange-500/10"
        />
        <QuickStatCard
          delay={0.1}
          icon={<Droplets className="h-5 w-5 text-emerald-400" />}
          label="Humidity"
          value={
            sensorData?.humidity != null
              ? Math.round(sensorData.humidity)
              : weather
              ? weather.current.humidity
              : "--"
          }
          unit="%"
          sub={sensorData ? "DHT22 sensor" : "Local forecast"}
          colorClass="from-emerald-500/5 to-teal-500/2 border-emerald-500/10"
        />
        <QuickStatCard
          delay={0.15}
          icon={<Leaf className="h-5 w-5 text-teal-400" />}
          label="Soil Moisture"
          value={sensorData?.soil_moisture != null ? Math.round(sensorData.soil_moisture) : "--"}
          unit={sensorData ? "%" : ""}
          sub={sensorData ? "Soil sensor online" : "Connect ESP32 node"}
          colorClass="from-teal-500/5 to-emerald-500/2 border-teal-500/10"
        />
        <QuickStatCard
          delay={0.2}
          icon={<Wind className="h-5 w-5 text-indigo-400" />}
          label="Wind Speed"
          value={weather ? Math.round(weather.current.wind_kph) : "--"}
          unit="km/h"
          sub={weather ? weather.current.condition : "Fetching forecast..."}
          colorClass="from-indigo-500/5 to-purple-500/2 border-indigo-500/10"
        />
      </div>

      {/* ── WEATHER + SIDE CARDS ───────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div {...fadeUp(0.1)} className="col-span-1 md:col-span-2">
          <WeatherCard data={weather} loading={loading} error={error} onRetry={() => location.reload()} />
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="col-span-1 flex flex-col gap-4">
          {/* AI Suggestions card */}
          <GlassCard className="bg-gradient-to-br from-emerald-500/5 via-teal-500/2 to-transparent border-emerald-500/10 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-display text-foreground font-bold">
                <BrainCircuit className="h-4.5 w-4.5 text-emerald-500 animate-pulse-glow rounded-full" />
                AI Crop Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                Enter your soil NPK, pH, and weather parameters — our ML model recommends high-yield crops.
              </p>
              <Link href="/crop-predictor">
                <Button className="w-full text-xs font-semibold py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/10 hover:shadow-glow-primary gap-1.5 active:scale-95">
                  <Sprout className="h-4 w-4" /> Predict Now
                </Button>
              </Link>
              <Link href="/disease">
                <Button variant="outline" className="w-full text-xs font-semibold py-2.5 border-amber-500/20 text-amber-500 hover:bg-amber-500/5 hover:border-amber-500/30 gap-1.5">
                  <Bug className="h-4 w-4" /> Disease Scan
                </Button>
              </Link>
            </CardContent>
          </GlassCard>

          {/* Khet Diary card */}
          <GlassCard className="bg-gradient-to-br from-teal-500/5 via-emerald-500/2 to-transparent border-teal-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-display text-foreground font-bold">
                <BookOpen className="h-4.5 w-4.5 text-teal-400" />
                Khet Diary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-[11px] text-muted-foreground/80 mb-3 leading-relaxed">
                Rozaana ka record — log sowings, irrigation cycles, harvests, and pest logs.
              </p>
              <Link href="/khet-diary">
                <Button className="w-full text-xs font-semibold py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm gap-1.5 active:scale-95">
                  <BookOpen className="h-4 w-4" /> Open Diary
                </Button>
              </Link>
            </CardContent>
          </GlassCard>

          {/* Soil Health card */}
          <GlassCard className="bg-gradient-to-br from-indigo-500/5 via-teal-500/2 to-transparent border-indigo-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-display text-foreground font-bold">
                <FlaskConical className="h-4.5 w-4.5 text-indigo-400" />
                Mitti Jaanch
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-[11px] text-muted-foreground/80 mb-3 leading-relaxed">
                Log soil NPK + pH stats — get custom fertilizer recommendations.
              </p>
              <Link href="/soil-health">
                <Button variant="outline" className="w-full text-xs font-semibold py-2.5 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500/30 gap-1.5 active:scale-95">
                  Check Soil <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── FEATURE SHORTCUTS ──────────────────────── */}
      <motion.section {...fadeUp(0.25)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground/90 flex items-center gap-2">
            <Zap className="h-4.5 w-4.5 text-amber-400" /> Quick Access
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground/60">All farm tools</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FeatureCard delay={0.05} href="/mandi" icon={<Store className="h-5 w-5 text-orange-400" />}
            label="Mandi Rates" desc="Live APMC crop market prices" accent="bg-orange-500/5 text-orange-400 border border-orange-500/10" />
          <FeatureCard delay={0.08} href="/khet-diary" icon={<BookOpen className="h-5 w-5 text-emerald-400" />}
            label="Khet Diary" desc="Daily farm activity logs" accent="bg-emerald-500/5 text-emerald-400 border border-emerald-500/10" />
          <FeatureCard delay={0.1} href="/soil-health" icon={<FlaskConical className="h-5 w-5 text-teal-400" />}
            label="Soil Health" desc="NPK status + advice" accent="bg-teal-500/5 text-teal-400 border border-teal-500/10" />
          <FeatureCard delay={0.13} href="/schemes" icon={<Landmark className="h-5 w-5 text-indigo-400" />}
            label="Schemes" desc="Govt farm scheme eligibility" accent="bg-indigo-500/5 text-indigo-400 border border-indigo-500/10" />
          <FeatureCard delay={0.15} href="/worker-connect" icon={<Users className="h-5 w-5 text-pink-400" />}
            label="Workers" desc="Hire farm labor via WhatsApp" accent="bg-pink-500/5 text-pink-400 border border-pink-500/10" />
          <FeatureCard delay={0.2} href="/chatbot" icon={<MessageSquare className="h-5 w-5 text-emerald-400" />}
            label="AI Chatbot" desc="Resolve doubts in regional languages" accent="bg-emerald-500/5 text-emerald-400 border border-emerald-500/10" />
          <FeatureCard delay={0.25} href="/disease" icon={<Bug className="h-5 w-5 text-red-400" />}
            label="Disease Detect" desc="Photo-based crop diagnosis" accent="bg-red-500/5 text-red-400 border border-red-500/10" />
          <FeatureCard delay={0.3} href="/weather" icon={<CloudSun className="h-5 w-5 text-sky-400" />}
            label="Weather Alerts" desc="7-day local rain forecasts" accent="bg-sky-500/5 text-sky-400 border border-sky-500/10" />
        </div>
      </motion.section>

      {/* ── SMART ALERTS ───────────────────────────── */}
      <motion.section {...fadeUp(0.3)}>
        <h2 className="mb-4 flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-muted-foreground/90">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-400" /> Smart Farm Alerts
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {humidityAlert && (
            <AlertTile
              tone="warn"
              title="High Humidity Warning"
              body={`Humidity is ${weather!.current.humidity}% in ${weather!.location.name}. Watch for fungal infections — consider adjusting irrigation.`}
            />
          )}
          {heatAlert && (
            <AlertTile
              tone="warn"
              title="Heat Stress Alert"
              body={`${Math.round(weather!.current.temp_c)}°C right now. Shade-sensitive crops may need extra water and mulching.`}
            />
          )}
          {!humidityAlert && !heatAlert && weather && (
            <AlertTile
              tone="good"
              title="Conditions are Stable"
              body={`No unusual weather risks detected in ${weather.location.name} right now. Good day to inspect your fields.`}
            />
          )}
          {sensorData && (
            <AlertTile
              tone="good"
              title="ESP32 Sensor Online"
              body={`Field sensor node is actively reporting data: Temp ${sensorData.temperature?.toFixed(1)}°C · Humidity ${sensorData.humidity?.toFixed(0)}% · Soil Moisture ${sensorData.soil_moisture?.toFixed(0)}%.`}
            />
          )}
          {!sensorData && (
            <AlertTile
              tone="neutral"
              title="IoT Node Not Connected"
              body="Connect your ESP32 sensor hardware to track live micro-climate and soil conditions directly on your dashboard."
            />
          )}
        </div>
      </motion.section>

      {/* ── FOOTER DIVIDER ─────────────────────────── */}
      <div className="divider-gradient mt-4" />
      <motion.p {...fadeUp(0.35)} className="text-center text-[10px] text-muted-foreground/60 pb-2 font-medium">
        KrishiAI &middot; Empowering Indian Farmers with AI &middot; Data updates every 15 minutes
      </motion.p>
    </div>
  )
}
