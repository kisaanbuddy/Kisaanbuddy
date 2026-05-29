"use client"
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

const LEVEL_OPTIONS: { value: NPKLevel; label: string; color: string }[] = [
  { value: "low",    label: "Low / Kam",      color: "border-red-400 bg-red-50/80 dark:bg-red-500/10 text-red-700 dark:text-red-300" },
  { value: "medium", label: "Medium / Madhyam", color: "border-yellow-400 bg-yellow-50/80 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300" },
  { value: "high",   label: "High / Zyada",   color: "border-green-400 bg-green-50/80 dark:bg-green-500/10 text-green-700 dark:text-green-300" },
]

const PH_OPTIONS: { value: PHLevel; label: string; range: string; color: string }[] = [
  { value: "acidic",   label: "Acidic / Khatla",   range: "< 6.5",      color: "border-orange-400 bg-orange-50/80 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300" },
  { value: "neutral",  label: "Neutral / Saaman",  range: "6.5 – 7.5", color: "border-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { value: "alkaline", label: "Alkaline / Khariya", range: "> 7.5",     color: "border-blue-400 bg-blue-50/80 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300" },
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

// ─── Nutrient gauge component ─────────────────────────────────────────────────

function NutrientPicker({
  label, symbol, value, onChange, unit,
}: { label: string; symbol: string; value: NPKLevel; onChange: (v: NPKLevel) => void; unit: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-bold rounded-full bg-card border border-border w-7 h-7 flex items-center justify-center text-foreground">
          {symbol}
        </span>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">({unit})</span>
      </div>
      <div className="flex gap-2">
        {LEVEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(value === opt.value ? "" : opt.value)}
            className={`flex-1 text-xs rounded-lg border-2 py-2 font-medium transition-all ${
              value === opt.value ? opt.color + " border-current" : "border-border/60 hover:border-border text-muted-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SoilHealthPage() {
  const [form, setForm] = useState<SoilForm>(INITIAL)
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <FlaskConical className="h-4 w-4 text-teal-500" />
          KrishiAI · Soil Health
        </div>
        <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-400">
          Mitti Jaanch 🧪
        </h1>
        <p className="text-muted-foreground mt-1">
          Soil Health Card ki values daalo — AI batayega sahi khad aur treatment.
        </p>
      </motion.div>

      {/* Soil card hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-teal-200/60 dark:border-teal-500/30 bg-teal-50/60 dark:bg-teal-500/10 px-4 py-3 flex items-start gap-2.5 text-sm"
      >
        <Info className="h-4 w-4 mt-0.5 text-teal-600 shrink-0" />
        <span className="text-teal-800 dark:text-teal-200">
          Soil Health Card app se ya lab test se values milti hain.
          Approximate values bhi theek hain — AI range ke basis pe recommend karega.
        </span>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        {/* Left — Input form */}
        <motion.section
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5 space-y-5"
        >
          {/* Crop selection */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Fasal / Crop *
            </label>
            <select
              value={form.crop}
              onChange={(e) => upd("crop", e.target.value)}
              className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm text-foreground"
            >
              <option value="">-- Select crop --</option>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Area (acres)
            </label>
            <input
              type="number"
              min={0.25}
              step={0.25}
              value={form.area}
              onChange={(e) => upd("area", e.target.value)}
              className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm text-foreground"
            />
          </div>

          {/* NPK */}
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <TestTube className="h-3.5 w-3.5" /> NPK Values
            </div>
            <NutrientPicker label="Nitrogen" symbol="N" value={form.nitrogen} onChange={(v) => upd("nitrogen", v)} unit="Kg/ha" />
            <NutrientPicker label="Phosphorus" symbol="P" value={form.phosphorus} onChange={(v) => upd("phosphorus", v)} unit="Kg/ha" />
            <NutrientPicker label="Potassium" symbol="K" value={form.potassium} onChange={(v) => upd("potassium", v)} unit="Kg/ha" />
          </div>

          {/* pH */}
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5" /> pH Level
            </div>
            <div className="flex gap-2">
              {PH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => upd("ph", form.ph === opt.value ? "" : opt.value)}
                  className={`flex-1 rounded-lg border-2 py-2 transition-all ${
                    form.ph === opt.value ? opt.color + " border-current" : "border-border/60 hover:border-border"
                  }`}
                >
                  <div className="text-xs font-medium">{opt.label}</div>
                  <div className="text-[10px] opacity-70">{opt.range}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Organic carbon */}
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-2">
              <Leaf className="h-3.5 w-3.5" /> Organic Carbon (OC)
            </div>
            <div className="flex gap-2">
              {LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => upd("organicCarbon", form.organicCarbon === opt.value ? "" : opt.value)}
                  className={`flex-1 text-xs rounded-lg border-2 py-2 font-medium transition-all ${
                    form.organicCarbon === opt.value ? opt.color + " border-current" : "border-border/60 hover:border-border text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Response Language</label>
            <div className="inline-flex rounded-lg border border-border bg-card/40 p-0.5 text-xs gap-0.5">
              {(["hi", "en", "kn"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => upd("language", l)}
                  className={`rounded-md px-3 py-1.5 transition-colors font-medium ${
                    form.language === l ? "bg-teal-500 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l === "hi" ? "हिन्दी" : l === "kn" ? "ಕನ್ನಡ" : "English"}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-2">
            <button
              onClick={run}
              disabled={!isReady || streaming}
              className="flex-1 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-teal-500/20"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {streaming ? "Analyzing..." : "Recommendation Lo"}
            </button>
            {(response || done) && (
              <button onClick={reset} className="rounded-xl border border-border px-3 py-2.5 text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-300/60 bg-red-50/60 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </motion.section>

        {/* Right — Response */}
        <motion.section
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5 min-h-[300px] flex flex-col"
        >
          {!response && !streaming ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                <FlaskConical className="h-8 w-8 text-teal-500" />
              </div>
              <p className="text-muted-foreground text-sm">
                Fasal aur NPK values bharo — <br />
                AI fertilizer schedule tayyar karega.
              </p>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-teal-500" />
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                  AI Recommendation
                </span>
                {done && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
                {streaming && <Loader2 className="h-4 w-4 animate-spin text-teal-500 ml-auto" />}
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                {response.split("\n").map((line, i) => {
                  if (line.startsWith("## "))
                    return <h3 key={i} className="text-base font-bold mt-4 mb-1 text-foreground">{line.replace("## ", "")}</h3>
                  if (line.startsWith("- ") || line.startsWith("* "))
                    return <p key={i} className="flex gap-1.5 my-0.5 text-foreground/80"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-teal-500" />{line.slice(2)}</p>
                  if (line.trim() === "")
                    return <div key={i} className="h-2" />
                  return <p key={i} className="text-foreground/80 my-0.5">{line}</p>
                })}
                {streaming && <span className="animate-pulse text-teal-500">▌</span>}
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
