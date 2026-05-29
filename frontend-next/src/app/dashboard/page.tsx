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

/* ─── Motion presets ─────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
})
const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut", delay },
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
      <div className={`relative overflow-hidden rounded-2xl border p-5 card-lift
        bg-gradient-to-br ${colorClass} backdrop-blur-sm`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 dark:bg-black/20">
            {icon}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest opacity-60">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight">{value}</span>
          {unit && <span className="text-sm font-medium opacity-70">{unit}</span>}
        </div>
        {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
        {/* decorative blob */}
        <div className="pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
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
      <Link href={href}>
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5
          hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${accent}`}>
            {icon}
          </div>
          <h3 className="font-bold text-sm mb-1 group-hover:text-green-500 transition-colors">{label}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          <ChevronRight className="absolute right-4 bottom-4 h-4 w-4 text-muted-foreground/40 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
          {/* hover glow */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
            bg-gradient-to-br from-transparent to-green-500/5 pointer-events-none`} />
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Alert tile ─────────────────────────────────── */
function AlertTile({ title, body, tone = "warn" }: { title: string; body: string; tone?: "warn" | "good" | "neutral" }) {
  const styles = {
    warn:    "border-amber-500/25 bg-gradient-to-r from-amber-500/10 to-orange-500/5 text-amber-700 dark:text-amber-300",
    good:    "border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 to-green-500/5 text-emerald-700 dark:text-emerald-300",
    neutral: "border-border/60 bg-muted/30 text-muted-foreground",
  }
  const icons = {
    warn:    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />,
    good:    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />,
    neutral: <Activity className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />,
  }
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${styles[tone]}`}>
      {icons[tone]}
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="mt-0.5 text-xs opacity-85 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) router.replace("/login")
  }, [ready, user, router])

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
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
    <div className="flex flex-col gap-8 pb-6">

      {/* ── GREETING HERO ──────────────────────────── */}
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-7 md:p-10 text-white shadow-2xl shadow-green-500/25">
        {/* Background shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 animate-spin-slow" />
          <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-black/10 blur-2xl" />
          <div className="absolute right-1/3 bottom-0 h-32 w-32 rounded-full bg-yellow-300/10 blur-xl animate-float" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-green-200 text-sm font-medium mb-1 tracking-wide">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-snug">
              {getGreeting(displayName)}
            </h1>
            <p className="mt-2 text-green-100/80 text-sm max-w-md">
              Your smart farm is active. Real-time data, AI insights, and market prices — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/crop-predictor">
              <button className="flex items-center gap-2 rounded-full bg-white text-green-700 font-bold text-sm px-5 py-2.5 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
                <Sprout className="h-4 w-4" /> Predict Crop
              </button>
            </Link>
            <Link href="/chatbot">
              <button className="flex items-center gap-2 rounded-full bg-white/15 border border-white/25 text-white font-semibold text-sm px-5 py-2.5 hover:bg-white/25 transition-all backdrop-blur-sm">
                <MessageSquare className="h-4 w-4" /> Ask AI
              </button>
            </Link>
          </div>
        </div>
        {/* Live indicator */}
        <div className="relative z-10 mt-5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-200" />
          </span>
          <span className="text-xs text-green-200 font-medium">KrishiAI Live — data updating</span>
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
          sub={sensorData ? "From field sensor" : "From weather"}
          colorClass="from-orange-500/15 to-amber-500/10 border-orange-500/20 text-orange-900 dark:text-orange-100"
        />
        <QuickStatCard
          delay={0.1}
          icon={<Droplets className="h-5 w-5 text-sky-400" />}
          label="Humidity"
          value={
            sensorData?.humidity != null
              ? Math.round(sensorData.humidity)
              : weather
              ? weather.current.humidity
              : "--"
          }
          unit="%"
          sub={sensorData ? "DHT22 reading" : "From weather"}
          colorClass="from-sky-500/15 to-blue-500/10 border-sky-500/20 text-sky-900 dark:text-sky-100"
        />
        <QuickStatCard
          delay={0.15}
          icon={<Leaf className="h-5 w-5 text-emerald-500" />}
          label="Soil Moisture"
          value={sensorData?.soil_moisture != null ? Math.round(sensorData.soil_moisture) : "--"}
          unit={sensorData ? "%" : ""}
          sub={sensorData ? "Capacitive sensor" : "Connect ESP32"}
          colorClass="from-emerald-500/15 to-green-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-100"
        />
        <QuickStatCard
          delay={0.2}
          icon={<Wind className="h-5 w-5 text-violet-400" />}
          label="Wind"
          value={weather ? Math.round(weather.current.wind_kph) : "--"}
          unit="km/h"
          sub={weather ? weather.current.condition : "Fetching..."}
          colorClass="from-violet-500/15 to-purple-500/10 border-violet-500/20 text-violet-900 dark:text-violet-100"
        />
      </div>

      {/* ── WEATHER + SIDE CARDS ───────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div {...fadeUp(0.1)} className="col-span-1 md:col-span-2">
          <WeatherCard data={weather} loading={loading} error={error} onRetry={() => location.reload()} />
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="col-span-1 flex flex-col gap-4">
          {/* AI Suggestions card */}
          <GlassCard className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-green-500/15 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BrainCircuit className="h-4 w-4 text-green-500" />
                AI Crop Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your soil NPK, pH, and weather data — our ML model picks the highest-yield crop.
              </p>
              <Link href="/crop-predictor">
                <Button className="w-full text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-emerald-700 gap-2">
                  <Sprout className="h-4 w-4" /> Predict Now
                </Button>
              </Link>
              <Link href="/disease">
                <Button variant="outline" className="w-full text-sm border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/8 gap-2">
                  <Bug className="h-4 w-4" /> Disease Scan
                </Button>
              </Link>
            </CardContent>
          </GlassCard>

          {/* Khet Diary card */}
          <GlassCard className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/15">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                Khet Diary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-3">
                Rozaana ka record — sowing, irrigation, disease log karo.
              </p>
              <Link href="/khet-diary">
                <Button className="w-full text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm gap-2">
                  <BookOpen className="h-4 w-4" /> Open Diary
                </Button>
              </Link>
            </CardContent>
          </GlassCard>

          {/* Soil Health card */}
          <GlassCard className="bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent border-teal-500/15">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FlaskConical className="h-4 w-4 text-teal-500" />
                Mitti Jaanch
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-3">
                NPK + pH daalo — AI fertilizer schedule banega.
              </p>
              <Link href="/soil-health">
                <Button variant="outline" className="w-full text-sm border-teal-500/30 hover:bg-teal-500/8 gap-2">
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
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" /> Quick Access
          </h2>
          <span className="text-xs text-muted-foreground">All tools</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FeatureCard delay={0.05} href="/mandi" icon={<Store className="h-5 w-5 text-orange-600" />}
            label="Mandi Rates" desc="Live APMC crop prices" accent="bg-orange-500/10 text-orange-500" />
          <FeatureCard delay={0.08} href="/khet-diary" icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
            label="Khet Diary" desc="Daily farm activity log" accent="bg-emerald-500/10 text-emerald-500" />
          <FeatureCard delay={0.1} href="/soil-health" icon={<FlaskConical className="h-5 w-5 text-teal-600" />}
            label="Soil Health" desc="NPK + fertilizer advice" accent="bg-teal-500/10 text-teal-500" />
          <FeatureCard delay={0.13} href="/schemes" icon={<Landmark className="h-5 w-5 text-blue-600" />}
            label="Schemes" desc="Check eligibility + apply" accent="bg-blue-500/10 text-blue-500" />
          <FeatureCard delay={0.15} href="/worker-connect" icon={<Users className="h-5 w-5 text-violet-600" />}
            label="Workers" desc="Hire labour via WhatsApp" accent="bg-violet-500/10 text-violet-500" />
          <FeatureCard delay={0.2} href="/chatbot" icon={<MessageSquare className="h-5 w-5 text-purple-600" />}
            label="AI Chatbot" desc="Ask in Hindi / English" accent="bg-purple-500/10 text-purple-500" />
          <FeatureCard delay={0.25} href="/disease" icon={<Bug className="h-5 w-5 text-red-600" />}
            label="Disease" desc="Photo-based diagnosis" accent="bg-red-500/10 text-red-500" />
          <FeatureCard delay={0.3} href="/weather" icon={<CloudSun className="h-5 w-5 text-sky-600" />}
            label="Weather" desc="7-day forecast + alerts" accent="bg-sky-500/10 text-sky-500" />
        </div>
      </motion.section>

      {/* ── SMART ALERTS ───────────────────────────── */}
      <motion.section {...fadeUp(0.3)}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Smart Farm Alerts
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
              body={`Field sensor is active — Temp ${sensorData.temperature?.toFixed(1)}°C · Humidity ${sensorData.humidity?.toFixed(0)}% · Soil ${sensorData.soil_moisture?.toFixed(0)}%.`}
            />
          )}
          {!sensorData && (
            <AlertTile
              tone="neutral"
              title="IoT Sensor Not Connected"
              body="Connect your ESP32 sensor node to get live soil moisture and field temperature on this dashboard."
            />
          )}
        </div>
      </motion.section>

      {/* ── FOOTER DIVIDER ─────────────────────────── */}
      <div className="divider-gradient mt-2" />
      <motion.p {...fadeUp(0.35)} className="text-center text-xs text-muted-foreground pb-2">
        KrishiAI · Empowering Indian Farmers with AI · Data updates every 15 minutes
      </motion.p>
    </div>
  )
}
