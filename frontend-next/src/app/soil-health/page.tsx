"use client"
import { useLanguage } from '@/lib/language'
/**
 * KrishiAI — Soil Health & Fertilizer Recommendation
 *
 * Farmer inputs soil test card values (N, P, K, pH, OC) + crop selection.
 * AI gives precise fertilizer recommendations + organic amendments.
 * Results streamed from the KrishiAI assistant backend.
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
import { useCallback, useRef, useState } from "react"
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
  return `You are KrishiAI's expert agronomist. Based on the soil health card readings below, give a precise fertilizer recommendation.

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
  const [form, setForm] = useState<SoilForm>(() => ({ ...INITIAL, language: lang }))
  
  useEffect(() => {
    setForm((f) => ({ ...f, language: lang }))
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
    setForm(INITIAL)
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
              Soil Health <span className="bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">Diagnostics</span>
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
                <h2 className="text-md font-bold text-white font-display">Soil Health Parameters</h2>
                <p className="text-[11px] text-muted-foreground">Values from physical card or standard lab metrics</p>
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
                <NutrientPicker label="Nitrogen (N)" symbol="N" value={form.nitrogen} onChange={(v) => upd("nitrogen", v)} unit="Kg/ha" />
                <NutrientPicker label="Phosphorus (P)" symbol="P" value={form.phosphorus} onChange={(v) => upd("phosphorus", v)} unit="Kg/ha" />
                <NutrientPicker label="Potassium (K)" symbol="K" value={form.potassium} onChange={(v) => upd("potassium", v)} unit="Kg/ha" />
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
                      <h2 className="text-md font-bold text-white font-display">Soil Diagnostic Preview</h2>
                      <p className="text-[11px] text-muted-foreground">Interactive analysis meter of parameters</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <GaugeRing value={form.nitrogen} label="Nitrogen (N)" symbol="N" />
                    <GaugeRing value={form.phosphorus} label="Phosphorus (P)" symbol="P" />
                    <GaugeRing value={form.potassium} label="Potassium (K)" symbol="K" />
                    <GaugeRing value={form.organicCarbon} label="Organic Carbon" symbol="OC" />
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
                      <span>Neutral (6.5-7.5)</span>
                      <span>Alkaline (&gt;7.5)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.04] text-center">
                  <div className="inline-flex items-center gap-2 text-xs text-teal-400 bg-teal-500/5 px-4 py-2.5 rounded-2xl border border-teal-500/10">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Please enter values and click Generate for full recommendations.</span>
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
                  <span>Recommendation calculated using regional agrochemical algorithms</span>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
