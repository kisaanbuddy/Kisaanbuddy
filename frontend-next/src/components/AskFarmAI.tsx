"use client"
import { useLanguage } from '@/lib/language'

/**
 * AskFarmAI — "Crop Suitability AI" panel.
 *
 * Sits inside the Crop Predictor page. Takes the same farm parameters the
 * sliders already collect, plus a free-text question (any language), and
 * shows a structured suitability verdict from the /api/ml/crop-check
 * endpoint.
 */

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lightbulb,
  Repeat,
  MessageSquareText,
  ChevronRight,
  TrendingUp,
} from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type FarmParams = {
  N: number
  P: number
  K: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
}

type Suitability = "Suitable" | "Moderate" | "Not Suitable"

type CropCheckResponse = {
  crop: string | null
  suitability: Suitability
  confidence: number
  reason: string[]
  suggestions: string[]
  alternatives: string[]
}

type Props = {
  params: FarmParams
}

const EXAMPLES = [
  "Wheat ugana sahi rahega?",
  "Can I grow rice here?",
  "Best crop for my farm?",
  "क्या टमाटर लगा सकता हूँ?",
]

export function AskFarmAI({ params }: Props) {
  const { t } = useLanguage()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CropCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheck(e?: React.FormEvent) {
    e?.preventDefault()
    if (!query.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/ml/crop-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: params.N,
          P: params.P,
          K: params.K,
          temp: params.temperature,
          humidity: params.humidity,
          ph: params.ph,
          rainfall: params.rainfall,
          query: query.trim(),
        }),
      })
      if (!res.ok) {
        throw new Error(`Request failed (HTTP ${res.status})`)
      }
      const data: CropCheckResponse = await res.json()
      setResult(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="overflow-hidden border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20 rounded-3xl">
      <CardHeader className="border-b border-white/[0.06] bg-slate-950/40 px-6 py-4">
        <CardTitle className="text-lg font-bold font-display text-white flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-emerald-400" />
          <span>{t("ask_farm_ai.ask_your_farm_ai")}</span>
          <span className="ml-auto text-[9px] uppercase tracking-widest text-muted-foreground font-black px-2.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.05]">
            Crop Suitability AI
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ask_farm_ai.ask_about_your_farm")}
            className="flex-1 h-12 bg-slate-950/40 border-white/[0.08] focus:border-emerald-500/40 focus:ring-emerald-500/10 rounded-xl px-4 text-sm"
            disabled={loading}
          />
          <Button
            type="submit"
            className="h-12 px-6 gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition-all shrink-0"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>{t("ask_farm_ai.analyzing")}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" />
                <span>{t("ask_farm_ai.check_suitability")}</span>
              </>
            )}
          </Button>
        </form>

        {/* Example chips */}
        {!result && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuery(ex)}
                className="rounded-full border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] px-3.5 py-1.5 text-xs text-muted-foreground hover:text-white hover:border-emerald-500/20 transition-all font-medium"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {result && <ResultCard result={result} />}
        </AnimatePresence>
      </CardContent>
    </GlassCard>
  )
}

// ---------------------------------------------------------------------------
// Result card
// ---------------------------------------------------------------------------
function ResultCard({ result }: { result: CropCheckResponse }) {
  const suit = result.suitability
  const tone = TONE_FOR[suit] ?? TONE_FOR.Moderate

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 pt-2 border-t border-white/[0.04]"
    >
      {/* Verdict header */}
      <div className={`rounded-2xl border p-5 ${tone.headerCls} flex items-start gap-4 shadow-sm backdrop-blur-sm relative overflow-hidden`}>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone.iconBg}`}>
          {tone.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-white capitalize font-display">
              {result.crop || "Best Crops Recommendation"}
            </h3>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight ${tone.badgeCls}`}>
              {suit}
            </span>
          </div>
          <ConfidenceBar value={result.confidence} tone={tone} />
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Reasons */}
        {result.reason?.length > 0 && (
          <Section
            icon={<CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />}
            title={t("ask_farm_ai.analysis_verdict_basis")}
            items={result.reason}
          />
        )}

        {/* Suggestions */}
        {result.suggestions?.length > 0 && (
          <Section
            icon={<Lightbulb className="h-4.5 w-4.5 text-amber-400" />}
            title={t("ask_farm_ai.agronomist_suggestions")}
            items={result.suggestions}
          />
        )}
      </div>

      {/* Alternatives */}
      {result.alternatives?.length > 0 && (
        <div className="pt-2">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider font-extrabold text-muted-foreground/80">
            <Repeat className="h-4 w-4 text-teal-400" />
            <span>{t("ask_farm_ai.alternative_crop_matches")}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {result.alternatives.map((alt) => (
              <span
                key={alt}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] px-3.5 py-2 text-xs font-bold capitalize text-white hover:border-teal-500/20 transition-all cursor-default"
              >
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function Section({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
}) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-black text-white/90">
        {icon}
        <span>{title}</span>
      </div>
      <ul className="space-y-2 text-xs text-muted-foreground/90 font-medium">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 items-start leading-relaxed">
            <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400/80" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ConfidenceBar({
  value,
  tone,
}: {
  value: number
  tone: ToneSpec
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">{t("ask_farm_ai.suitability_score")}</span>
        <span className={`font-extrabold ${tone.confTextCls}`}>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-white/[0.04]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`h-full rounded-full ${tone.barCls}`}
        />
      </div>
    </div>
  )
}

type ToneSpec = {
  icon: React.ReactNode
  iconBg: string
  headerCls: string
  badgeCls: string
  barCls: string
  confTextCls: string
}

const TONE_FOR: Record<Suitability, ToneSpec> = {
  Suitable: {
    icon: <CheckCircle2 className="h-6 w-6 text-white" />,
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600 shadow-md shadow-emerald-500/20",
    headerCls: "border-emerald-500/20 bg-emerald-500/5",
    badgeCls: "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400",
    barCls: "bg-gradient-to-r from-emerald-500 to-green-500",
    confTextCls: "text-emerald-400",
  },
  Moderate: {
    icon: <AlertCircle className="h-6 w-6 text-white" />,
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/20",
    headerCls: "border-amber-500/20 bg-amber-500/5",
    badgeCls: "bg-amber-500/20 border border-amber-500/30 text-amber-400",
    barCls: "bg-gradient-to-r from-amber-400 to-orange-500",
    confTextCls: "text-amber-400",
  },
  "Not Suitable": {
    icon: <XCircle className="h-6 w-6 text-white" />,
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-rose-500/20",
    headerCls: "border-rose-500/20 bg-rose-500/5",
    badgeCls: "bg-rose-500/20 border border-rose-500/30 text-rose-400",
    barCls: "bg-gradient-to-r from-rose-500 to-red-500",
    confTextCls: "text-rose-400",
  },
}
