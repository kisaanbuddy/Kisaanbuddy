"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CloudSun, Sprout, Bug, TrendingUp, Users, Landmark, Activity,
  Layers, DollarSign, BookOpen, Heart, RefreshCw, FileText,
  Loader2, Cpu, MapPin, PlusCircle, ChevronRight, Calendar,
  Thermometer, Droplets, Wind, CheckCircle2, AlertTriangle,
  Smartphone, History, User, Plus, MessageSquare, ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useLanguage } from "@/lib/language"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Recharts components
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts"

/* ─── Interfaces for localStorage Data ─── */
interface DiaryEntry {
  id: string
  date: string
  activity: string
  crop: string
  notes: string
  imageDataUrl?: string
  weather?: string
  createdAt: number
}

interface PriceAlert {
  id: string
  cropName: string
  threshold: number
  direction: "above" | "below"
  createdAt: number
  fired?: boolean
}

/* ─── Motion Presets ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
})

export default function DashboardPage() {
  const { user, ready } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

  // Welcome Greetings State
  const [greeting, setGreeting] = useState("Namaste")
  
  // Real-Time Sensor Mock states (adjustable by sliders)
  const [sensorOnline, setSensorOnline] = useState(true)
  const [moisture, setMoisture] = useState(42) // %
  const [temp, setTemp] = useState(28) // °C
  const [humidity, setHumidity] = useState(65) // %
  const [nitrogen, setNitrogen] = useState(72) // mg/kg
  const [phosphorus, setPhosphorus] = useState(46) // mg/kg
  const [potassium, setPotassium] = useState(148) // mg/kg
  const [ph, setPh] = useState(6.6)
  
  // LocalStorage feeds
  const [diaryLogs, setDiaryLogs] = useState<DiaryEntry[]>([])
  const [mandiAlerts, setMandiAlerts] = useState<PriceAlert[]>([])
  const [mounted, setMounted] = useState(false)

  // Load greetings and local storage inputs
  useEffect(() => {
    const hrs = new Date().getHours()
    if (hrs < 12) setGreeting(t("goodMorning"))
    else if (hrs < 17) setGreeting(t("goodAfternoon"))
    else setGreeting(t("goodEvening"))

    if (typeof window !== "undefined") {
      try {
        const rawDiary = localStorage.getItem("krishiai_khet_diary")
        if (rawDiary) {
          const parsed = JSON.parse(rawDiary) as DiaryEntry[]
          setDiaryLogs(parsed.slice(0, 3)) // Get last 3 logs
        }
        
        const rawAlerts = localStorage.getItem("krishiai_mandi_alerts")
        if (rawAlerts) {
          const parsed = JSON.parse(rawAlerts) as PriceAlert[]
          setMandiAlerts(parsed.slice(0, 3)) // Get top 3 alerts
        }
      } catch (err) {
        console.error("Failed to parse local storage data", err)
      }
    }
  }, [t])

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (ready && !user) {
      router.replace("/login")
    }
  }, [ready, user, router])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Chart data built dynamically from active sensor slider inputs
  const simulatedChartData = useMemo(() => {
    return [
      { day: "Mon", Moisture: 38, Temp: 26, Humidity: 60 },
      { day: "Tue", Moisture: 41, Temp: 27, Humidity: 62 },
      { day: "Wed", Moisture: 35, Temp: 29, Humidity: 58 },
      { day: "Thu", Moisture: 32, Temp: 30, Humidity: 55 },
      { day: "Fri", Moisture: 39, Temp: 28, Humidity: 63 },
      { day: "Sat", Moisture: 45, Temp: 26, Humidity: 68 },
      { day: "Sun (Now)", Moisture: moisture, Temp: temp, Humidity: humidity }
    ]
  }, [moisture, temp, humidity])

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground font-semibold text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          Loading farm console...
        </div>
      </div>
    )
  }

  // Helper activity labels mapping
  const ACTIVITY_ICONS: Record<string, string> = {
    sowing: "🌱",
    irrigation: "💧",
    fertilizer: "🧪",
    spraying: "Shower",
    weeding: "Weed",
    harvest: "🌾",
    ploughing: "🚜",
    observation: "🔍",
    other: "📋"
  }

  return (
    <div className="flex flex-col gap-6 pb-12 select-none">
      
      {/* ─── WELCOME HEADER BANNER ─── */}
      <motion.div 
        {...fadeUp(0)}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-emerald-950/20 via-slate-950 to-teal-950/15 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none -z-10" />
        
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            {t("dashboard.esp32_sensor_online")}
          </span>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white mt-3 flex items-center gap-2">
            {greeting}, <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">{user.name || user.email.split("@")[0]}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold leading-relaxed max-w-xl">
            {t("welcomeBack")}! {t("dashboard.conditions_are_stable")}.
          </p>
        </div>

        {/* Node Status Toggle Switch */}
        <div className="flex items-center gap-3 bg-slate-900/50 border border-white/[0.06] rounded-2xl p-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground">{t("dashboard.all_farm_tools")}</div>
            <button 
              onClick={() => setSensorOnline(!sensorOnline)} 
              className="text-xs font-black text-white hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <span>Node Status:</span>
              <span className={`inline-flex items-center gap-1 ${sensorOnline ? "text-emerald-400" : "text-rose-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full bg-current ${sensorOnline ? "animate-pulse" : ""}`} />
                {sensorOnline ? t("dashboard.esp32_sensor_online") : t("dashboard.iot_node_not_connected")}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── LIVE TELEMETRY GRIDS (Simulated Node) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metric A: Moisture & Climate Telemetry */}
        <motion.div {...fadeUp(0.05)} className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20 rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/[0.04] bg-slate-950/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-emerald-400" />
                Live Telemetry Control panel
              </CardTitle>
              {sensorOnline && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full animate-pulse-glow">
                  LIVE STREAMING
                </span>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Telemetry slider widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Soil Moisture widget */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{t("dashboard.soil_moisture")}</span>
                    <Droplets className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-3xl font-black text-white font-display">{sensorOnline ? moisture : "--"}%</span>
                    <span className="text-[10px] text-emerald-400 block font-semibold mt-1">Optimal Range (35-50%)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    disabled={!sensorOnline}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-30"
                  />
                </div>

                {/* Soil Temperature widget */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{t("dashboard.temperature")}</span>
                    <Thermometer className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-3xl font-black text-white font-display">{sensorOnline ? temp : "--"}°C</span>
                    <span className="text-[10px] text-amber-400 block font-semibold mt-1">Slight Heat Stress &gt; 35°C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    disabled={!sensorOnline}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-30"
                  />
                </div>

                {/* Humidity widget */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{t("dashboard.humidity")}</span>
                    <CloudSun className="h-4 w-4 text-teal-400" />
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-3xl font-black text-white font-display">{sensorOnline ? humidity : "--"}%</span>
                    <span className="text-[10px] text-muted-foreground block font-semibold mt-1">Atmospheric Index</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    disabled={!sensorOnline}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-30"
                  />
                </div>
              </div>

              {/* Warnings / Alerts Box */}
              {!sensorOnline ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-3 text-xs text-rose-400">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>{t("dashboard.iot_node_not_connected")}. Please toggle ESP32 switch to re-establish remote data channel.</span>
                </div>
              ) : moisture < 30 ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3 text-xs text-amber-400 animate-pulse-glow">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span><strong>Warning:</strong> Soil moisture dropped to {moisture}%. Irrigation channel valve activation recommended immediately.</span>
                </div>
              ) : temp > 35 ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-3 text-xs text-rose-400">
                  <AlertTriangle className="h-5 w-5 shrink-0 animate-bounce" />
                  <span><strong>{t("dashboard.heat_stress_alert")}!</strong> Current temperature exceeds 35°C. Evapotranspiration rates are high.</span>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3 text-xs text-emerald-400">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>Telemetry index healthy. Crop suitability margins are optimal.</span>
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* Metric B: Soil Nutrients NPK Grid */}
        <motion.div {...fadeUp(0.1)} className="lg:col-span-1">
          <GlassCard className="border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20 h-full rounded-3xl flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/[0.04] bg-slate-950/30">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-emerald-400" />
                Soil Nutrient Index (NPK)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-center">
              
              {/* Nitrogen */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-white">Nitrogen (N)</span>
                  <span className="text-emerald-400">{sensorOnline ? nitrogen : "--"} mg/kg</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sensorOnline ? (nitrogen / 140) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Phosphorus */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-white">Phosphorus (P)</span>
                  <span className="text-emerald-400">{sensorOnline ? phosphorus : "--"} mg/kg</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${sensorOnline ? (phosphorus / 100) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Potassium */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-white">Potassium (K)</span>
                  <span className="text-emerald-400">{sensorOnline ? potassium : "--"} mg/kg</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${sensorOnline ? (potassium / 280) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Soil pH */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">Soil pH balance:</span>
                <span className="font-black text-white bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                  {sensorOnline ? ph : "--"} (Slightly Acidic)
                </span>
              </div>
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ─── LOCALSTORAGE FEEDS (Diary Logs & Mandi Alerts) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Khet Diary Feed */}
        <motion.div {...fadeUp(0.15)}>
          <GlassCard className="border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20 rounded-3xl overflow-hidden h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/[0.04] bg-slate-950/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
                {t("dashboard.khet_diary")} Recent Logs
              </CardTitle>
              <Link href="/khet-diary" className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors">
                <Plus className="h-3 w-3" /> ADD ENTRY
              </Link>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-center">
              {diaryLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
                  <p>No recent logs found in your Khet Diary.</p>
                  <p className="text-[10px] opacity-75 font-normal mt-1">Start recording crop cycles, irrigation times and fertilizer applications.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {diaryLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-all">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm shrink-0">
                        {ACTIVITY_ICONS[log.activity] || "📋"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white capitalize">{log.activity} · {log.crop}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{log.date}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-semibold">{log.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>

        {/* Right: Active Mandi alerts */}
        <motion.div {...fadeUp(0.2)}>
          <GlassCard className="border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20 rounded-3xl overflow-hidden h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/[0.04] bg-slate-950/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
                Active Mandi Alerts
              </CardTitle>
              <Link href="/mandi" className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors">
                <Plus className="h-3 w-3" /> SET ALERT
              </Link>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-center">
              {mandiAlerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
                  <p>No active price monitors configured.</p>
                  <p className="text-[10px] opacity-75 font-normal mt-1">Set price alarms in Mandi Rates to track commodity value changes.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {mandiAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${alert.fired ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                        <div>
                          <span className="text-xs font-bold text-white capitalize block">{alert.cropName}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Trigger when price goes {alert.direction === "above" ? "above" : "below"}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-400 font-display">₹{alert.threshold.toLocaleString()}/Q</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* ─── CORE PLATFORM MODULES GRID ─── */}
      <motion.div {...fadeUp(0.25)} className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pl-1">
            {t("dashboard.all_farm_tools")}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {[
            { href: "/weather", label: t("dashboard.weather_alerts"), icon: CloudSun, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", desc: "Local rainfall & forecasts" },
            { href: "/disease", label: t("dashboard.disease_detect"), icon: Bug, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", desc: "Leaf upload diagnosis" },
            { href: "/soil-health", label: t("dashboard.soil_health"), icon: Activity, color: "text-teal-400 bg-teal-500/10 border-teal-500/20", desc: "NPK ratios calculator" },
            { href: "/chatbot", label: t("dashboard.ai_chatbot"), icon: MessageSquare, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", desc: "Speak with AI sahayak" },
            { href: "/khet-diary", label: t("dashboard.khet_diary"), icon: BookOpen, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", desc: "Daily farm logbook" },
            { href: "/mandi", label: t("dashboard.mandi_rates"), icon: TrendingUp, color: "text-orange-400 bg-orange-500/10 border-orange-500/20", desc: "APMC live pricing" },
            { href: "/worker-connect", label: t("dashboard.workers"), icon: Users, color: "text-sky-400 bg-sky-500/10 border-sky-500/20", desc: "Find regional labor" },
            { href: "/schemes", label: t("dashboard.schemes"), icon: Landmark, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", desc: "Eligibility checks" },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <Link key={idx} href={item.href}>
                <GlassCard className="border border-white/[0.08] hover:border-emerald-500/30 bg-slate-950/20 backdrop-blur-md p-4 rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 h-full flex flex-col justify-between group">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                      <Icon className="h-5 w-5 shrink-0" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{item.label}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-1">{item.desc}</p>
                  </div>
                </GlassCard>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* ─── HISTORICAL ANALYSIS CHART ─── */}
      <motion.div {...fadeUp(0.3)}>
        <GlassCard className="border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20 rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/[0.04] bg-slate-950/30">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-emerald-400" />
              Telemetry Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72 w-full text-[10px] font-mono">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={simulatedChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(4, 8, 20, 0.95)", 
                        borderColor: "rgba(255,255,255,0.08)",
                        borderRadius: "16px"
                      }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Moisture" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#moistGrad)" name="Soil Moisture (%)" />
                    <Area type="monotone" dataKey="Temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" name="Temperature (°C)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </GlassCard>
      </motion.div>

    </div>
  )
}
