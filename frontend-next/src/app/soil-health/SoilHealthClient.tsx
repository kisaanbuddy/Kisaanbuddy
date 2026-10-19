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
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FlaskConical,
  Info,
  Leaf,
  Loader2,
  RefreshCw,
  Sparkles,
  TestTube,
  Upload,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { streamMessage, type Language } from "@/lib/assistant-api"
import { Card, GlassCard, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ─── Types ───────────────────────────────────────────────────────────────────

type NPKLevel = "low" | "medium" | "high" | ""
type PHLevel = "acidic" | "neutral" | "alkaline" | ""

export interface ExtractedSoilData {
  soil_ph: number | null
  nitrogen_kg_ha: number | null
  phosphorus_kg_ha: number | null
  potassium_kg_ha: number | null
  organic_carbon_pct: number | null
  ec_ds_m: number | null
  soil_type: string | null
  lab_name: string | null
  test_date: string | null
  farmer_name: string | null
  village_or_district: string | null
  health_summary: string | null
  source_file: string | null
}

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
  const langMap: Record<string, string> = {
    hi: "Hindi",
    kn: "Kannada",
    te: "Telugu",
    ta: "Tamil",
    mr: "Marathi",
    gu: "Gujarati",
    bn: "Bengali",
    pa: "Punjabi",
    ml: "Malayalam",
    hi_en: "Hinglish (Hindi written in Roman script)",
    en: "English",
  }
  const lang = langMap[f.language] || "English"
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
  const searchParams = useSearchParams()
  const { t, lang } = useLanguage()
  const [form, setForm] = useState<SoilForm>(() => ({ ...INITIAL, language: (lang as Language) || "hi" }))
  
  useEffect(() => {
    setForm((f) => ({ ...f, language: (lang as Language) || "en" }))
  }, [lang])

  useEffect(() => {
    const crop = searchParams.get("crop")
    if (searchParams.get("voice") === "1" && crop) setForm((f) => ({ ...f, crop }))
  }, [searchParams])

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

  const [scanningCard, setScanningCard] = useState(false)
  const [extractedCard, setExtractedCard] = useState<ExtractedSoilData | null>(null)
  const [savingToProfile, setSavingToProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [ttsPlaying, setTtsPlaying] = useState(false)
  const [ttsLoading, setTtsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cardFileInputRef = useRef<HTMLInputElement | null>(null)

  const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanningCard(true)
    setError(null)
    setSaveSuccess(false)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/sarvam/extract-soil-report", {
        method: "POST",
        body: fd,
      })
      if (!res.ok) {
        throw new Error("Failed to scan document with Sarvam AI.")
      }
      const data: ExtractedSoilData = await res.json()
      setExtractedCard(data)

      // Map numerical values to NPKLevel & PHLevel
      const newForm: Partial<SoilForm> = {}
      if (data.nitrogen_kg_ha != null) {
        newForm.nitrogen = data.nitrogen_kg_ha < 280 ? "low" : data.nitrogen_kg_ha > 560 ? "high" : "medium"
      }
      if (data.phosphorus_kg_ha != null) {
        newForm.phosphorus = data.phosphorus_kg_ha < 10 ? "low" : data.phosphorus_kg_ha > 25 ? "high" : "medium"
      }
      if (data.potassium_kg_ha != null) {
        newForm.potassium = data.potassium_kg_ha < 110 ? "low" : data.potassium_kg_ha > 280 ? "high" : "medium"
      }
      if (data.soil_ph != null) {
        newForm.ph = data.soil_ph < 6.5 ? "acidic" : data.soil_ph > 7.5 ? "alkaline" : "neutral"
      }
      if (data.organic_carbon_pct != null) {
        newForm.organicCarbon = data.organic_carbon_pct < 0.5 ? "low" : data.organic_carbon_pct > 0.75 ? "high" : "medium"
      }
      setForm((prev) => ({ ...prev, ...newForm }))
    } catch (err: any) {
      setError(err?.message || "Failed to scan soil card")
    } finally {
      setScanningCard(false)
      if (e.target) e.target.value = ""
    }
  }

  const handleSaveToProfile = async () => {
    if (!extractedCard) return
    setSavingToProfile(true)
    try {
      const payload = {
        test_date: extractedCard.test_date || new Date().toISOString().split("T")[0],
        lab_name: extractedCard.lab_name || "Soil Testing Lab (Sarvam Scan)",
        soil_type: extractedCard.soil_type || "Standard",
        soil_ph: extractedCard.soil_ph,
        nitrogen_kg_ha: extractedCard.nitrogen_kg_ha,
        phosphorus_kg_ha: extractedCard.phosphorus_kg_ha,
        potassium_kg_ha: extractedCard.potassium_kg_ha,
        organic_carbon_pct: extractedCard.organic_carbon_pct,
        ec_ds_m: extractedCard.ec_ds_m,
        is_verified: true,
        notes: extractedCard.health_summary || "Scanned via Sarvam AI Doc Intelligence",
      }
      const res = await fetch("/api/farmer/soil-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSaveSuccess(true)
      } else {
        throw new Error("Log in required to store test to your Farm Profile.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save record.")
    } finally {
      setSavingToProfile(false)
    }
  }

  const handleSpeakRecommendation = async () => {
    if (ttsPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setTtsPlaying(false)
      return
    }
    if (!response) return
    setTtsLoading(true)
    try {
      const plainText = response
        .replace(/[#*`_-]/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 1500)
      const bcpMap: Record<string, string> = {
        hi: "hi-IN",
        kn: "kn-IN",
        te: "te-IN",
        ta: "ta-IN",
        mr: "mr-IN",
        gu: "gu-IN",
        bn: "bn-IN",
        pa: "pa-IN",
        ml: "ml-IN",
        hi_en: "hi-IN",
        en: "en-IN",
      }
      const res = await fetch("/api/sarvam/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: plainText,
          language: bcpMap[form.language] || "en-IN",
          speaker: "priya",
        }),
      })
      if (!res.ok) throw new Error("TTS synthesis failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setTtsPlaying(false)
      audio.onerror = () => setTtsPlaying(false)
      await audio.play()
      setTtsPlaying(true)
    } catch (err) {
      console.warn("Sarvam audio playback failed:", err)
    } finally {
      setTtsLoading(false)
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setTtsPlaying(false)
    setExtractedCard(null)
    setSaveSuccess(false)
    setForm({ ...INITIAL, language: (lang as Language) || "en" })
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
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 md:p-8 shadow-sm"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <img
            src="/images/soil/soil-ph-testing.jpg"
            alt="Scientific field testing of soil pH and nutrients"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              <FlaskConical className="h-3.5 w-3.5" />
              Mitti Jaanch Center · Soil Diagnostics
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-foreground">
              Soil Health <span className="text-emerald-600 dark:text-emerald-400">{t("soil_health.diagnostics")}</span>
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Enter your soil health card parameters or test values. Our agronomist AI model computes exact nutrient ratios and generates custom fertilization schedules.
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <TestTube className="h-6 w-6" />
          </div>
        </div>
      </motion.div>

      {/* Main UI Layout */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        {/* Left Column — Interactive inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="border border-border/50 rounded-2xl p-6 space-y-6 shadow-sm bg-card">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border/40">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground font-display">{t("soil_health.soil_health_parameters")}</h2>
                <p className="text-xs text-muted-foreground">{t("soil_health.values_from_physical_card")}</p>
              </div>
            </div>

            {/* Sarvam AI Soil Card Scanner */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Sarvam AI Card Scanner
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a photo or PDF of your Soil Health Card (SHC) to autofill parameters automatically.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={cardFileInputRef}
                  accept="image/png,image/jpeg,application/pdf"
                  className="hidden"
                  onChange={handleCardUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => cardFileInputRef.current?.click()}
                  disabled={scanningCard}
                  className="rounded-lg border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold gap-1.5 shrink-0"
                >
                  {scanningCard ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Scanning with Sarvam...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload Soil Card
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Extracted Card Verification Banner */}
            {extractedCard && (
              <div className="rounded-xl border border-emerald-500/30 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold text-foreground">
                      Verified Scan: {extractedCard.source_file || "Soil Health Card"}
                    </span>
                  </div>
                  {extractedCard.test_date && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {extractedCard.test_date}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Nitrogen (N)</span>
                    <span className="font-bold text-foreground">{extractedCard.nitrogen_kg_ha != null ? `${extractedCard.nitrogen_kg_ha} kg/ha` : "N/A"}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Phosphorus (P)</span>
                    <span className="font-bold text-foreground">{extractedCard.phosphorus_kg_ha != null ? `${extractedCard.phosphorus_kg_ha} kg/ha` : "N/A"}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Potassium (K)</span>
                    <span className="font-bold text-foreground">{extractedCard.potassium_kg_ha != null ? `${extractedCard.potassium_kg_ha} kg/ha` : "N/A"}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] text-muted-foreground block">Soil pH</span>
                    <span className="font-bold text-foreground">{extractedCard.soil_ph != null ? extractedCard.soil_ph : "N/A"}</span>
                  </div>
                </div>

                {extractedCard.health_summary && (
                  <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-2">
                    "{extractedCard.health_summary}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Form autofilled with diagnostic ranges
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveToProfile}
                    disabled={savingToProfile || saveSuccess}
                    className="text-xs gap-1.5 h-8 font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    {savingToProfile ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : saveSuccess ? (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5 text-emerald-500" />
                        Saved to Profile
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5" />
                        Save to Farm Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

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
                  className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
                >
                  <option value="">-- Select crop --</option>
                  {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
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
                  className="h-10 rounded-xl border-border/50 bg-background text-foreground px-3.5 text-sm font-semibold focus-visible:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* NPK Values */}
            <div className="space-y-4 pt-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2 pb-2 border-b border-border/40">
                <TestTube className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> NPK Level Readings
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
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2 pb-2 border-b border-border/40">
                  <FlaskConical className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> pH Level
                </div>
                <div className="flex gap-2">
                  {PH_OPTIONS.map((opt) => {
                    const isActive = form.ph === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => upd("ph", isActive ? "" : opt.value)}
                        className={`flex-1 rounded-xl border p-2 flex flex-col items-center justify-center transition-all duration-200 ${
                          isActive 
                            ? opt.activeColor 
                            : "border-border/50 bg-muted/20 hover:border-border text-muted-foreground"
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
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2 pb-2 border-b border-border/40">
                  <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Organic Carbon (OC)
                </div>
                <div className="flex gap-2">
                  {LEVEL_OPTIONS.map((opt) => {
                    const isActive = form.organicCarbon === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => upd("organicCarbon", isActive ? "" : opt.value)}
                        className={`flex-1 text-[11px] rounded-xl border py-2.5 font-bold transition-all duration-200 ${
                          isActive 
                            ? opt.activeColor 
                            : "border-border/50 bg-muted/20 hover:border-border text-muted-foreground hover:text-foreground"
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
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
                {(SOIL_PAGE_I18N[lang] || SOIL_PAGE_I18N.en).responseLanguageLabel}
              </Label>
              <div className="inline-flex flex-wrap rounded-xl border border-border/50 bg-muted/30 p-1 gap-1">
                {ALL_LANG_OPTIONS.map(({ code: l, label }) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => upd("language", l)}
                    className={`rounded-lg px-2.5 py-1.5 transition-all text-xs font-semibold ${
                      form.language === l 
                        ? "bg-emerald-600 text-white shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={run}
                disabled={!isReady || streaming}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm"
              >
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {streaming ? t("analyzing") : (SOIL_PAGE_I18N[lang] || SOIL_PAGE_I18N.en).getRecommendationBtn}
              </Button>
              {(response || done) && (
                <Button 
                  onClick={reset} 
                  variant="outline"
                  className="rounded-xl border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground px-4 h-11"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column — Response panel or interactive visual meters preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="h-full"
        >
          <div className="border border-border/50 rounded-2xl p-6 h-full min-h-[500px] flex flex-col justify-between shadow-sm bg-card relative">
            {!response && !streaming ? (
              // Preview State showing active gauges
              <div className="flex-1 flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="flex items-center gap-2 pb-4 border-b border-border/40 mb-6">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground font-display">{t("soil_health.soil_diagnostic_preview")}</h2>
                      <p className="text-xs text-muted-foreground">{t("soil_health.interactive_analysis_meter_of")}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <GaugeRing value={form.nitrogen} label={t("soil_health.nitrogen_n")} symbol="N" />
                    <GaugeRing value={form.phosphorus} label={t("soil_health.phosphorus_p")} symbol="P" />
                    <GaugeRing value={form.potassium} label={t("soil_health.potassium_k")} symbol="K" />
                    <GaugeRing value={form.organicCarbon} label={t("soil_health.organic_carbon")} symbol="OC" />
                  </div>

                  {/* pH Status Indicator */}
                  <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-border/40">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-2">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        pH State
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        form.ph === "neutral" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        form.ph === "acidic" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                        form.ph === "alkaline" ? "bg-sky-500/10 text-sky-600 dark:text-sky-400" : "bg-muted text-muted-foreground"
                      }`}>
                        {form.ph ? form.ph.toUpperCase() : "NOT SELECTED"}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted relative overflow-hidden mt-3">
                      <div 
                        className={`h-full absolute top-0 rounded-full transition-all duration-300 ${
                          form.ph === "acidic" ? "left-[15%] w-1/4 bg-orange-500" :
                          form.ph === "neutral" ? "left-[37.5%] w-1/4 bg-emerald-500" :
                          form.ph === "alkaline" ? "left-[60%] w-1/4 bg-sky-500" : "w-0"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-mono">
                      <span>Acidic (&lt;6.5)</span>
                      <span>{t("soil_health.neutral_6_5_7")}</span>
                      <span>Alkaline (&gt;7.5)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/40 text-center">
                  <div className="inline-flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 font-medium">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>{t("soil_health.please_enter_values_and")}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Active Response Panel
              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 pb-4 border-b border-border/40 mb-4">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-bold text-foreground font-display">
                      AI Recommendation Insights
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      {response && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleSpeakRecommendation}
                          disabled={ttsLoading}
                          className="h-8 px-2.5 text-xs gap-1.5 rounded-lg border border-border/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                          title="Listen with Sarvam AI Voice"
                        >
                          {ttsLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : ttsPlaying ? (
                            <>
                              <VolumeX className="h-3.5 w-3.5 text-rose-500" />
                              <span className="text-[11px] text-rose-500">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5" />
                              <span className="text-[11px]">Listen (Sarvam Voice)</span>
                            </>
                          )}
                        </Button>
                      )}
                      {done && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                      {streaming && <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />}
                    </div>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed overflow-y-auto max-h-[500px] pr-2 space-y-4 custom-scrollbar">
                    {response.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) {
                        return (
                          <h3 key={i} className="text-sm font-bold mt-5 mb-2 text-foreground font-display flex items-center gap-2 border-b border-border/40 pb-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {line.replace("## ", "")}
                          </h3>
                        )
                      }
                      if (line.startsWith("- ") || line.startsWith("* ")) {
                        return (
                          <p key={i} className="flex gap-2 my-1 text-muted-foreground text-xs leading-relaxed">
                            <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>{line.slice(2)}</span>
                          </p>
                        )
                      }
                      if (line.trim() === "") return <div key={i} className="h-1" />
                      
                      // Highlight potential safety warning blocks
                      if (line.toLowerCase().includes("precaution") || line.toLowerCase().includes("chetawani") || line.toLowerCase().includes("samasya")) {
                        return (
                          <p key={i} className="text-amber-800 dark:text-amber-200 font-medium my-1.5 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-xs">
                            {line}
                          </p>
                        )
                      }

                      return <p key={i} className="text-foreground/90 text-xs leading-relaxed my-1">{line}</p>
                    })}
                    {streaming && <span className="animate-pulse text-emerald-600 dark:text-emerald-400 font-bold">▌</span>}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border/40 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{t("soil_health.recommendation_calculated_using_regional")}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Educational Guide Section ── */}
      <section className="mt-12 border-t border-border/50 pt-10 select-none">
        {(() => {
          const guide = SOIL_HEALTH_GUIDE_I18N[lang as keyof typeof SOIL_HEALTH_GUIDE_I18N] || SOIL_HEALTH_GUIDE_I18N.en
          return (
            <div className="space-y-8 text-foreground">
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                  {guide.title}
                </h2>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-4xl">
                  {guide.desc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-3 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">
                    {guide.card1_title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {guide.card1_desc}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-3 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">
                    {guide.card2_title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {guide.card2_desc}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">
                  {guide.steps_title}
                </h3>
                <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
                  <div className="space-y-2 border-r border-border/40 pr-4">
                    <h4 className="font-bold text-foreground">{guide.step1_title}</h4>
                    <p>{guide.step1_desc}</p>
                  </div>
                  <div className="space-y-2 border-r border-border/40 px-4">
                    <h4 className="font-bold text-foreground">{guide.step2_title}</h4>
                    <p>{guide.step2_desc}</p>
                  </div>
                  <div className="space-y-2 pl-4">
                    <h4 className="font-bold text-foreground">{guide.step3_title}</h4>
                    <p>{guide.step3_desc}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-display font-bold text-foreground">
                  {guide.faq_title}
                </h2>
                <div className="grid gap-3 md:grid-cols-2 text-xs text-muted-foreground">
                  {guide.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                      <h4 className="font-semibold text-foreground">{faq.q}</h4>
                      <p>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </section>
    </div>
  )
}
