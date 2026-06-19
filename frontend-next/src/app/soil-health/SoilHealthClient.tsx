"use client"
import { useLanguage } from '@/lib/language'
/**
 * KisaanBuddy — Soil Health & Fertilizer Recommendation
 *
 * Farmer inputs soil test card values (N, P, K, pH, OC) + crop selection.
 * AI gives precise fertilizer recommendations + organic amendments.
 * Results streamed from the KisaanBuddy assistant backend.
 */
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Info,
  Leaf,
  Loader2,
  RefreshCw,
  Sparkles,
  TestTube,
  Zap,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { streamMessage, type Language } from "@/lib/assistant-api"
import { Card, GlassCard, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ─── Types ───────────────────────────────────────────────────────────────────

type NPKLevel = "low" | "medium" | "high" | ""
type PHLevel = "acidic" | "neutral" | "alkaline" | ""

interface SoilForm {
  crop: string
  nitrogen: NPKLevel
  phosphorus: NPKLevel
  potassium: NPKLevel
  ph: PHLevel
  organicCarbon: NPKLevel
  area: string
  language: Language
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CROPS = [
  "Wheat (Gehun)", "Rice / Paddy (Chawal)", "Maize (Makka)", "Cotton (Kapas)",
  "Sugarcane (Ganna)", "Soybean", "Groundnut (Moongfali)", "Tomato", "Onion",
  "Potato", "Chilli / Mirchi", "Turmeric (Haldi)", "Mustard (Sarson)",
  "Banana (Kela)", "Mango (Aam)", "Other"
]

const LEVEL_OPTIONS: { value: NPKLevel; label: string; color: string; hoverColor: string; activeColor: string }[] = [
  { 
    value: "low",    
    label: "Low / Kam",      
    color: "text-rose-500 border-rose-500/30 bg-rose-500/5",
    hoverColor: "hover:border-rose-500/50 hover:bg-rose-500/10",
    activeColor: "bg-rose-500/20 border-rose-500 text-rose-400 ring-2 ring-rose-500/20"
  },
  { 
    value: "medium", 
    label: "Medium / Madhyam", 
    color: "text-amber-500 border-amber-500/30 bg-amber-500/5",
    hoverColor: "hover:border-amber-500/50 hover:bg-amber-500/10",
    activeColor: "bg-amber-500/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/20"
  },
  { 
    value: "high",   
    label: "High / Zyada",   
    color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
    hoverColor: "hover:border-emerald-500/50 hover:bg-emerald-500/10",
    activeColor: "bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20"
  },
]

const PH_OPTIONS: { value: PHLevel; label: string; range: string; color: string; hoverColor: string; activeColor: string }[] = [
  { 
    value: "acidic",   
    label: "Acidic",   
    range: "< 6.5",      
    color: "text-orange-500 border-orange-500/30 bg-orange-500/5",
    hoverColor: "hover:border-orange-500/50 hover:bg-orange-500/10",
    activeColor: "bg-orange-500/20 border-orange-500 text-orange-400 ring-2 ring-orange-500/20"
  },
  { 
    value: "neutral",  
    label: "Neutral",  
    range: "6.5 – 7.5", 
    color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
    hoverColor: "hover:border-emerald-500/50 hover:bg-emerald-500/10",
    activeColor: "bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20"
  },
  { 
    value: "alkaline", 
    label: "Alkaline", 
    range: "> 7.5",     
    color: "text-sky-500 border-sky-500/30 bg-sky-500/5",
    hoverColor: "hover:border-sky-500/50 hover:bg-sky-500/10",
    activeColor: "bg-sky-500/20 border-sky-500 text-sky-400 ring-2 ring-sky-500/20"
  },
]

const INITIAL: SoilForm = {
  crop: "",
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  ph: "",
  organicCarbon: "",
  area: "1",
  language: "hi",
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(f: SoilForm): string {
  const lang = f.language === "hi" ? "Hindi" : f.language === "kn" ? "Kannada" : "English"
  return `You are KisaanBuddy's expert agronomist. Based on the soil health card readings below, give a precise fertilizer recommendation.

Soil Report:
- Crop: ${f.crop}
- Farm area: ${f.area} acre(s)
- Nitrogen (N): ${f.nitrogen || "unknown"}
- Phosphorus (P): ${f.phosphorus || "unknown"}
- Potassium (K): ${f.potassium || "unknown"}
- pH: ${f.ph || "unknown"}
- Organic Carbon: ${f.organicCarbon || "unknown"}

Respond in ${lang} using this exact structure:

## 🌱 Mitti Ki Samasya (Soil Issues)
(1–3 key problems detected from the readings)

## 💊 Fertilizer Recommendation (Per Acre)
(Table format: Fertilizer name | Quantity | When to apply)
Include both chemical and organic options.

## 🌿 Organic Amendments
(Specific compost / vermicompost / green manure advice)

## ⚠️ Precautions
(2–3 important warnings)

## 📅 Application Schedule
(Week-by-week or stage-wise schedule for ${f.crop})

Keep language simple — farmer-friendly. Use local product names (Urea, DAP, MOP, SSP etc.)
`
}

// ─── Nutrient Picker Component ─────────────────────────────────────────────────

function NutrientPicker({
  label, symbol, value, onChange, unit,
}: { label: string; symbol: string; value: NPKLevel; onChange: (v: NPKLevel) => void; unit: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold rounded-lg bg-teal-500/10 border border-teal-500/20 w-6 h-6 flex items-center justify-center text-teal-400">
            {symbol}
          </span>
          <span className="text-sm font-medium text-foreground/90">{label}</span>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground/80 px-2 py-0.5 rounded bg-muted/20 border border-border/30">
          {unit}
        </span>
      </div>
      <div className="flex gap-2">
        {LEVEL_OPTIONS.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(isActive ? "" : opt.value)}
              className={`flex-1 text-[11px] rounded-xl border py-2.5 font-medium transition-all duration-300 ${
                isActive 
                  ? opt.activeColor 
                  : "border-border/40 bg-muted/5 hover:border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Visual Gauge Ring Component ───────────────────────────────────────────────

function GaugeRing({ value, label, symbol }: { value: NPKLevel; label: string; symbol: string }) {
  let percent = 15
  let color = "stroke-muted/20"
  let glowColor = "shadow-none"
  let statusText = "Pending"
  let textColor = "text-muted-foreground"

  if (value === "low") {
    percent = 35
    color = "stroke-rose-500"
    glowColor = "drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]"
    statusText = "Low / Kam"
    textColor = "text-rose-400"
  } else if (value === "medium") {
    percent = 65
    color = "stroke-amber-500"
    glowColor = "drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]"
    statusText = "Medium / Madhyam"
    textColor = "text-amber-400"
  } else if (value === "high") {
    percent = 95
    color = "stroke-emerald-500"
    glowColor = "drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
    statusText = "High / Zyada"
    textColor = "text-emerald-400"
  }

  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm shadow-sm">
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-white/[0.05]"
            strokeWidth="3.5"
            fill="transparent"
          />
          <motion.circle
            cx="24"
            cy="24"
            r={radius}
            className={`${color} ${glowColor}`}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold font-display text-white">{symbol}</span>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        <div className={`text-xs font-bold mt-0.5 ${textColor}`}>{statusText}</div>
      </div>
    </div>
  )
}

// ─── Main Soil Page Component ──────────────────────────────────────────────────

export default function SoilHealthPage() {
  const { t, lang } = useLanguage()
  const [form, setForm] = useState<SoilForm>(() => ({ ...INITIAL, language: (lang === "hi" || lang === "kn") ? lang : "en" }))
  
  useEffect(() => {
    setForm((f) => ({ ...f, language: (lang === "hi" || lang === "kn") ? lang : "en" }))
  }, [lang])

  const [response, setResponse] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const upd = <K extends keyof SoilForm>(k: K, v: SoilForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const isReady = form.crop && (form.nitrogen || form.phosphorus || form.potassium || form.ph)

  const run = useCallback(async () => {
    if (!isReady) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setResponse("")
    setDone(false)
    setError(null)
    setStreaming(true)

    try {
      const prompt = buildPrompt(form)
      for await (const chunk of streamMessage(
        { message: prompt, language: form.language, stream: true },
        ctrl.signal
      )) {
        if (ctrl.signal.aborted) break
        if (chunk.type === "token") setResponse((r) => r + chunk.text)
        if (chunk.type === "done") setDone(true)
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError")
        setError(e.message || "Something went wrong")
    } finally {
      setStreaming(false)
    }
  }, [form, isReady])

  const reset = () => {
    abortRef.current?.abort()
    setForm({ ...INITIAL, language: (lang === "hi" || lang === "kn") ? lang : "en" })
    setResponse("")
    setDone(false)
    setError(null)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 relative">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-[10%] w-[250px] h-[250px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-950/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 mb-3">
              <FlaskConical className="h-3.5 w-3.5" />
              Mitti Jaanch Center · Soil Diagnostics
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white">
              Soil Health <span className="bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">{t("soil_health.diagnostics")}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Enter your soil health card parameters or test values. Our agronomist AI model computes exact nutrient ratios and generates custom fertilization schedules.
            </p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10 shrink-0">
            <TestTube className="h-7 w-7" />
          </div>
        </div>
      </motion.div>

      {/* Main UI Layout */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        {/* Left Column — Interactive inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="border border-white/[0.08] backdrop-blur-md p-6 space-y-6 shadow-xl bg-slate-950/20">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-md font-bold text-white font-display">{t("soil_health.soil_health_parameters")}</h2>
                <p className="text-[11px] text-muted-foreground">{t("soil_health.values_from_physical_card")}</p>
              </div>
            </div>

            {/* Crop selection & Area */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crop-select" className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
                  Fasal / Crop <span className="text-teal-400">*</span>
                </Label>
                <select
                  id="crop-select"
                  value={form.crop}
                  onChange={(e) => upd("crop", e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950/40 px-3.5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all cursor-pointer"
                >
                  <option value="" className="bg-slate-900">-- Select crop --</option>
                  {CROPS.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area-input" className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold">
                  Farm Area (acres)
                </Label>
                <Input
                  id="area-input"
                  type="number"
                  min={0.25}
                  step={0.25}
                  value={form.area}
                  onChange={(e) => upd("area", e.target.value)}
                  className="h-[46px] rounded-xl border-white/[0.08] bg-slate-950/40 text-foreground px-4 text-sm font-semibold focus-visible:ring-teal-500/30 focus-visible:border-teal-500/50"
                />
              </div>
            </div>

            {/* NPK Values */}
            <div className="space-y-4 pt-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground/90 font-black flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                <TestTube className="h-4 w-4 text-teal-400" /> NPK Level Readings
              </div>
              <div className="grid gap-4">
                <NutrientPicker label={t("soil_health.nitrogen_n")} symbol="N" value={form.nitrogen} onChange={(v) => upd("nitrogen", v)} unit="Kg/ha" />
                <NutrientPicker label={t("soil_health.phosphorus_p")} symbol="P" value={form.phosphorus} onChange={(v) => upd("phosphorus", v)} unit="Kg/ha" />
                <NutrientPicker label={t("soil_health.potassium_k")} symbol="K" value={form.potassium} onChange={(v) => upd("potassium", v)} unit="Kg/ha" />
              </div>
            </div>

            {/* pH Level & OC */}
            <div className="grid gap-6 sm:grid-cols-2 pt-2">
              {/* pH Level */}
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground/90 font-black flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                  <FlaskConical className="h-4 w-4 text-teal-400" /> pH Level
                </div>
                <div className="flex gap-2">
                  {PH_OPTIONS.map((opt) => {
                    const isActive = form.ph === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => upd("ph", isActive ? "" : opt.value)}
                        className={`flex-1 rounded-xl border p-2 flex flex-col items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? opt.activeColor 
                            : "border-border/40 bg-muted/5 hover:border-border text-muted-foreground"
                        }`}
                      >
                        <div className="text-[11px] font-bold">{opt.label}</div>
                        <div className="text-[9px] opacity-70 mt-0.5 font-mono">{opt.range}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Organic Carbon */}
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground/90 font-black flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                  <Leaf className="h-4 w-4 text-teal-400" /> Organic Carbon (OC)
                </div>
                <div className="flex gap-2">
                  {LEVEL_OPTIONS.map((opt) => {
                    const isActive = form.organicCarbon === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => upd("organicCarbon", isActive ? "" : opt.value)}
                        className={`flex-1 text-[11px] rounded-xl border py-2.5 font-bold transition-all duration-300 ${
                          isActive 
                            ? opt.activeColor 
                            : "border-border/40 bg-muted/5 hover:border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt.label.split(" / ")[0]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold block">Response Language / भाषा</Label>
              <div className="inline-flex rounded-xl border border-white/[0.08] bg-slate-950/40 p-1 gap-1">
                {(["hi", "en", "kn"] as Language[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => upd("language", l)}
                    className={`rounded-lg px-4 py-2 transition-all duration-300 text-xs font-semibold ${
                      form.language === l 
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l === "hi" ? "हिन्दी" : l === "kn" ? "ಕನ್ನಡ" : "English"}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={run}
                disabled={!isReady || streaming}
                className="flex-1 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold h-12 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/15"
              >
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {streaming ? t("analyzing") : "Generate Recommendations"}
              </Button>
              {(response || done) && (
                <Button 
                  onClick={reset} 
                  variant="outline"
                  className="rounded-xl border border-white/[0.08] hover:bg-white/[0.03] text-muted-foreground hover:text-foreground px-4 h-12"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Right Column — Response panel or interactive visual meters preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full"
        >
          <GlassCard className="border border-white/[0.08] backdrop-blur-md p-6 h-full min-h-[500px] flex flex-col justify-between shadow-xl bg-slate-950/20 relative overflow-hidden">
            {!response && !streaming ? (
              // Preview State showing active gauges
              <div className="flex-1 flex flex-col justify-between h-full space-y-8">
                <div>
                  <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06] mb-6">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-md font-bold text-white font-display">{t("soil_health.soil_diagnostic_preview")}</h2>
                      <p className="text-[11px] text-muted-foreground">{t("soil_health.interactive_analysis_meter_of")}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <GaugeRing value={form.nitrogen} label={t("soil_health.nitrogen_n")} symbol="N" />
                    <GaugeRing value={form.phosphorus} label={t("soil_health.phosphorus_p")} symbol="P" />
                    <GaugeRing value={form.potassium} label={t("soil_health.potassium_k")} symbol="K" />
                    <GaugeRing value={form.organicCarbon} label={t("soil_health.organic_carbon")} symbol="OC" />
                  </div>

                  {/* pH Status Indicator */}
                  <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-2">
                        <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
                        pH State
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        form.ph === "neutral" ? "bg-emerald-500/10 text-emerald-400" :
                        form.ph === "acidic" ? "bg-orange-500/10 text-orange-400" :
                        form.ph === "alkaline" ? "bg-sky-500/10 text-sky-400" : "bg-white/5 text-muted-foreground"
                      }`}>
                        {form.ph ? form.ph.toUpperCase() : "NOT SELECTED"}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.05] relative overflow-hidden mt-3">
                      <div 
                        className={`h-full absolute top-0 rounded-full transition-all duration-500 ${
                          form.ph === "acidic" ? "left-[15%] w-1/4 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" :
                          form.ph === "neutral" ? "left-[37.5%] w-1/4 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                          form.ph === "alkaline" ? "left-[60%] w-1/4 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "w-0"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-1.5 font-mono">
                      <span>Acidic (&lt;6.5)</span>
                      <span>{t("soil_health.neutral_6_5_7")}</span>
                      <span>Alkaline (&gt;7.5)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.04] text-center">
                  <div className="inline-flex items-center gap-2 text-xs text-teal-400 bg-teal-500/5 px-4 py-2.5 rounded-2xl border border-teal-500/10">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>{t("soil_health.please_enter_values_and")}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Active Response Panel
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06] mb-4">
                    <Sparkles className="h-5 w-5 text-teal-400" />
                    <span className="text-sm font-bold text-teal-400 font-display">
                      AI Recommendation Insights
                    </span>
                    {done && <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-auto" />}
                    {streaming && <Loader2 className="h-4 w-4 animate-spin text-teal-400 ml-auto" />}
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed overflow-y-auto max-h-[500px] pr-2 space-y-4 custom-scrollbar">
                    {response.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) {
                        return (
                          <h3 key={i} className="text-md font-bold mt-6 mb-2 text-white font-display flex items-center gap-2 border-b border-white/[0.06] pb-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                            {line.replace("## ", "")}
                          </h3>
                        )
                      }
                      if (line.startsWith("- ") || line.startsWith("* ")) {
                        return (
                          <p key={i} className="flex gap-2 my-1 text-muted-foreground text-[13px] leading-relaxed">
                            <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-teal-400" />
                            <span>{line.slice(2)}</span>
                          </p>
                        )
                      }
                      if (line.trim() === "") return <div key={i} className="h-1" />
                      
                      // Highlight potential safety warning blocks
                      if (line.toLowerCase().includes("precaution") || line.toLowerCase().includes("chetawani") || line.toLowerCase().includes("samasya")) {
                        return (
                          <p key={i} className="text-orange-300 font-medium my-1.5 bg-orange-500/5 border border-orange-500/10 p-2.5 rounded-xl">
                            {line}
                          </p>
                        )
                      }

                      return <p key={i} className="text-muted-foreground text-[13px] leading-relaxed my-1">{line}</p>
                    })}
                    {streaming && <span className="animate-pulse text-teal-400 font-bold">▌</span>}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.06] text-center text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1.5">
                  <RefreshCw className="h-3 w-3 animate-spin-slow" />
                  <span>{t("soil_health.recommendation_calculated_using_regional")}</span>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Educational Guide Section ── */}
      <section className="mt-12 border-t border-white/[0.08] pt-10 select-none">
        {lang === "hi" ? (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 मिट्टी का स्वास्थ्य क्या है और इसे कैसे सुधारें?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                मिट्टी का स्वास्थ्य (Soil Health) भूमि की वह जैविक और भौतिक क्षमता है जिससे वह फसलों को आवश्यक पोषक तत्व, हवा और पानी प्रदान कर सके। एक स्वस्थ मिट्टी न केवल अधिक पैदावार देती है बल्कि सूखे और बीमारियों के प्रभाव को भी कम करती है। मिट्टी की उर्वरता का सही आंकलन करने के लिए मुख्य तीन तत्वों <strong>N (नाइट्रोजन)</strong>, <strong>P (फास्फोरस)</strong>, और <strong>K (पोटेशियम)</strong> का संतुलन समझना आवश्यक है।
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-teal-400 font-display">🧪 NPK और मिट्टी का पीएच (pH) मान समझना</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>N (नाइट्रोजन):</strong> पत्तों की हरियाली और वानस्पतिक विकास बढ़ाता है। इसकी कमी से पत्ते पीले पड़ जाते हैं।<br />
                  <strong>P (फास्फोरस):</strong> जड़ों का मजबूत विकास और समय पर फूल-फल बनना सुनिश्चित करता है।<br />
                  <strong>K (पोटेशियम):</strong> फसलों को रोगों से लड़ने और सूखे को सहन करने की क्षमता प्रदान करता है। अनाज का दाना मजबूत बनता है।<br />
                  <strong>pH मान:</strong> मिट्टी का पीएच (6.5 से 7.5) उदासीन माना जाता है जो अधिकांश फसलों के लिए सर्वोत्तम है। अम्लीय मिट्टी (&lt; 6.0) को सुधारने के लिए चूना (Lime) डालें। क्षारीय मिट्टी (&gt; 8.0) को सुधारने के लिए जिप्सम (Gypsum) का प्रयोग करें।
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-teal-400 font-display">🌱 जैविक कार्बन (Organic Carbon) और खाद प्रबंधन</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  जैविक कार्बन मिट्टी की आत्मा है। एक आदर्श मिट्टी में जैविक कार्बन का स्तर 0.8% से अधिक होना चाहिए। इसे सुधारने के लिए रासायनिक उर्वरकों का उपयोग घटाएं और हरी खाद (जैसे ढैंचा या सनई), केंचुआ खाद (Vermicompost) और गोबर की सड़ी खाद (FYM) को खेत में मिलाएं। हरी खाद उगाने के बाद उसे फूल आने से पहले मिट्टी में पलट देने से नाइट्रोजन और जैविक कार्बन की मात्रा तेजी से बढ़ती है।
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-teal-500/10 bg-teal-500/[0.02] space-y-4">
              <h3 className="text-lg font-bold text-teal-400 font-display">📋 मिट्टी परीक्षण (Soil Testing) की सही प्रक्रिया</h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
                <div className="space-y-2 border-r border-white/[0.06] pr-4">
                  <h4 className="font-extrabold text-white">1. वी-आकार (V-Shape) का कट</h4>
                  <p>खेत में 8-10 अलग-अलग स्थानों से ऊपरी घास साफ कर 15 सेमी (6 इंच) गहरा 'V' आकार का गड्ढा बनाएं। गड्ढे के दोनों किनारों से एक-एक इंच मोटी मिट्टी की परत काट लें।</p>
                </div>
                <div className="space-y-2 border-r border-white/[0.06] px-4">
                  <h4 className="font-extrabold text-white">2. मिश्रण और सुखाना</h4>
                  <p>एकत्रित सभी स्थानों की मिट्टी को साफ प्लास्टिक शीट पर अच्छी तरह मिलाएं। फिर मिट्टी को गोल फैलाकर चार हिस्सों में बांटें, आमने-सामने के दो हिस्से फेंक दें। यह प्रक्रिया तब तक दोहराएं जब तक आधा किलो मिट्टी न बचे। इसे छांव में सुखाएं।</p>
                </div>
                <div className="space-y-2 pl-4">
                  <h4 className="font-extrabold text-white">3. लैब भेजना</h4>
                  <p>मिट्टी को सूती थैली में डालें। थैली पर अपना नाम, मोबाइल नंबर, खेत का खसरा नंबर और पहले बोई गई व आगे बोई जाने वाली फसल का नाम लिखकर नजदीकी मिट्टी जांच प्रयोगशाला में भेजें।</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ मिट्टी के स्वास्थ्य और परीक्षण के बारे में FAQs</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. मिट्टी की जांच कितने समय में करवानी चाहिए?</h4>
                  <p>हर दो से तीन साल में एक बार, फसल की कटाई के बाद और अगली बुवाई से पहले मिट्टी की जांच जरूर करवानी चाहिए।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. क्षारीय मिट्टी (Alkaline Soil) के क्या लक्षण हैं?</h4>
                  <p>क्षारीय मिट्टी का पीएच 8.5 से अधिक होता है। ऐसी मिट्टी में पानी सोखने की क्षमता कम हो जाती है और सूखने पर जमीन पर सफेद नमक की परत दिखने लगती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. जैविक कार्बन बढ़ाने का सबसे त्वरित तरीका क्या है?</h4>
                  <p>खेत में प्रति एकड़ 5-10 टन गोबर की सड़ी खाद डालना या खरीफ सीजन से पहले ढैंचा उगाकर उसे मिट्टी में रोटावेटर से मिलाना (हरी खाद) सबसे प्रभावी है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. मिट्टी का आदर्श पीएच (pH) मान क्या होना चाहिए?</h4>
                  <p>ज्यादातर फसलों (जैसे गेहूं, धान, मक्का) के लिए 6.5 से 7.2 का पीएच मान सर्वोत्तम माना जाता है क्योंकि इस रेंज में सभी पोषक तत्व आसानी से उपलब्ध होते हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. नाइट्रोजन (N) की कमी को यूरिया के बिना कैसे दूर करें?</h4>
                  <p>दलहनी फसलें (जैसे मूंग, उड़द, चना, सोयाबीन) लगाएं। इनकी जड़ों में राइजोबियम बैक्टीरिया होते हैं जो हवा से नाइट्रोजन लेकर मिट्टी में स्थिर करते हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. क्या खेत के पेड़ों के नीचे से मिट्टी का नमूना ले सकते हैं?</h4>
                  <p>नहीं, पेड़ों के नीचे, मेड़ों के पास, खाद के ढेर के नजदीक या सिंचाई नाली के पास से कभी भी मिट्टी का नमूना नहीं लेना चाहिए, इससे गलत रिपोर्ट आती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. एसएसपी (SSP) और डीएपी (DAP) खाद में क्या अंतर है?</h4>
                  <p>एसएसपी (सिंगल सुपर फास्फेट) में केवल फास्फोरस और सल्फर होता है, जबकि डीएपी (डाई अमोनियम फास्फेट) में फास्फोरस के साथ 18% नाइट्रोजन भी होता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. क्या लवणीय (Saline) मिट्टी में सामान्य पानी देना चाहिए?</h4>
                  <p>लवणीय मिट्टी में अच्छे निकास की व्यवस्था होनी चाहिए। पानी भरकर नमक को बहाने (Leaching) से और जैविक खादों के अधिक उपयोग से लाभ होता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. माइक्रोन्यूट्रिएंट्स (Micronutrients) क्या हैं?</h4>
                  <p>लोहा, जस्ता (Zinc), तांबा, बोरॉन और मैंगनीज सूक्ष्म पोषक तत्व हैं। ये मिट्टी में बहुत कम मात्रा में चाहिए होते हैं लेकिन फलों की चमक और वजन के लिए जरूरी हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. KisaanBuddy उर्वरक कैलकुलेटर कैसे काम करता है?</h4>
                  <p>KisaanBuddy आपके द्वारा दर्ज किए गए मिट्टी परीक्षण डेटा या लक्षित फसल के आधार पर वैज्ञानिक एनपीके संतुलन की गणना कर सटीक खाद की मात्रा बताता है।</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 What is Soil Health and How Can Farmers Improve It?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                Soil health refers to the continuous capacity of soil to function as a vital living ecosystem that sustains plants, animals, and humans. A healthy soil profile provides critical crop nutrition, resists compaction, and retains water. To correctly balance soil fertility, understanding the primary macro-nutrients—<strong>Nitrogen (N)</strong>, <strong>Phosphorus (P)</strong>, and <strong>Potassium (K)</strong>—is vital.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-teal-400 font-display">🧪 Deciphering NPK Ratios and Soil pH Levels</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Nitrogen (N):</strong> Promotes lush leaf growth and vegetative structure. Deficiencies lead to leaf chlorosis (yellowing).<br />
                  <strong>Phosphorus (P):</strong> Essential for robust root establishment, cell division, and early flower and seed setting.<br />
                  <strong>Potassium (K):</strong> Strengthens crop stems, improves drought tolerance, and activates enzyme systems to fight diseases.<br />
                  <strong>pH Level:</strong> A soil pH between 6.5 and 7.5 is neutral and optimal for plant nutrient uptake. Reclaim acidic soils (&lt; 6.0) using agricultural lime. Counteract alkaline soils (&gt; 8.0) using gypsum.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-teal-400 font-display">🌱 The Power of Organic Carbon (OC) and Fertilizer Schedules</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Organic Carbon is the foundation of biological soil fertility. Healthy arable land should sustain an organic carbon level above 0.8%. Farmers can raise OC by shifting from pure chemical fertilization to integrated systems incorporating Vermicompost, farmyard manure (FYM), and green manures (like Dhaincha or Sunn hemp). Sowing green manure and tilling it back during flowering cycles rapidly locks nitrogen into the topsoil.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-teal-500/10 bg-teal-500/[0.02] space-y-4">
              <h3 className="text-lg font-bold text-teal-400 font-display">📋 Scientific Soil Sampling Process</h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
                <div className="space-y-2 border-r border-white/[0.06] pr-4">
                  <h4 className="font-extrabold text-white">1. V-Shaped Digging</h4>
                  <p>Clear surface vegetation at 8-10 random grid points in your field. Dig a V-shaped hole exactly 15 cm (6 inches) deep. Slice a uniform 1-inch thick slice of soil along the inner face.</p>
                </div>
                <div className="space-y-2 border-r border-white/[0.06] px-4">
                  <h4 className="font-extrabold text-white">2. Quartering Technique</h4>
                  <p>Mix the collected soil inside a clean container. Place it on a clean sheet, form a circle, and divide it into four quadrants. Discard opposite quarters. Repeat this process until 500g of dry composite sample remains.</p>
                </div>
                <div className="space-y-2 pl-4">
                  <h4 className="font-extrabold text-white">3. Dispatching to Lab</h4>
                  <p>Pack the soil in a dry cotton bag. Label it with your name, village name, survey number, previous crop, and intended crop, then submit it to the nearest state soil testing laboratory.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ Soil Health & Testing FAQs</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. How often should soil analysis be conducted?</h4>
                  <p>Once every 2 to 3 years, preferably after harvesting a crop and before sowing the next cycle.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. What are the signs of saline/alkaline soils?</h4>
                  <p>Saline soils display white crusty salt patches on the dry surface, low water penetration rates, and stunted plant roots.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. What is the fastest method to increase Soil Organic Carbon?</h4>
                  <p>Incorporating green manure (like Dhaincha) before the monsoon season or applying 5-10 tons of well-composted farmyard manure per acre.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. What is the optimal pH range for arable crop fields?</h4>
                  <p>A pH range between 6.5 and 7.2 is perfect, as it maximizes the availability of both macronutrients and micronutrients.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. How can I correct nitrogen deficiency without synthetic urea?</h4>
                  <p>Cultivate leguminous crops like chickpeas, lentils, or mung beans, which host symbiotic Rhizobium bacteria that fix atmospheric nitrogen in root nodules.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. Can soil samples be collected from under trees?</h4>
                  <p>No. Avoid collecting soil near trees, fences, compost heaps, irrigation canals, or farm boundaries, as these yield unrepresentative results.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. What is the difference between SSP and DAP?</h4>
                  <p>Single Super Phosphate (SSP) supplies Phosphorus, Calcium, and Sulfur, whereas Di-Ammonium Phosphate (DAP) provides both Nitrogen (18%) and Phosphorus (46%).</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. How does organic carbon benefit sandy soils?</h4>
                  <p>It acts like a sponge, gluing sandy particles together to significantly improve water holding capacity and prevent nutrient leaching.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. What are micronutrients and why are they necessary?</h4>
                  <p>Zinc, Iron, Boron, Copper, and Manganese. While required in trace amounts, they are crucial for fruit set, grain filling, and crop disease resistance.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. How does the KisaanBuddy NPK advisor work?</h4>
                  <p>KisaanBuddy calculates optimal crop fertilizing ratios based on local soil test values compared to crop nutrition benchmarks.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
