"use client"

/**
 * AskFarmAI — "Crop Suitability AI" panel.
 *
 * Sits inside the Crop Predictor page. Takes the same farm parameters the
 * sliders already collect, plus a free-text question (any language), and
 * shows a structured suitability verdict from the /api/ml/crop-check
 * endpoint.
 *
 * Designed to drop in next to existing components without changing the
 * surrounding layout. Uses the same GlassCard / Tailwind primitives as
 * the rest of the app for consistent dark-mode styling.
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
    <GlassCard className="overflow-hidden bg-background">
      <CardHeader className="border-b bg-card/50">
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-emerald-500" />
          Ask Your Farm AI
          <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground font-normal">
            Crop Suitability AI
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your farm... (e.g. 'Wheat ugana sahi rahega?')"
            className="flex-1 h-12 text-base"
            disabled={loading}
          />
          <Button
            type="submit"
            className="h-12 px-6 gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Check Suitability
              </>
            )}
          </Button>
        </form>

        {/* Example chips */}
        {!result && !loading && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuery(ex)}
                className="rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground hover:border-emerald-500/40 hover:text-foreground transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <AnimatePresence>
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
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Verdict header */}
      <div
        className={`rounded-2xl border p-5 ${tone.headerCls} flex items-start gap-4`}
      >
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone.iconBg}`}>
          {tone.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-xl font-bold capitalize">
              {result.crop || "Best crops for your farm"}
            </h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone.badgeCls}`}>
              {suit}
            </span>
          </div>
          <ConfidenceBar value={result.confidence} tone={tone} />
        </div>
      </div>

      {/* Reasons */}
      {result.reason?.length > 0 && (
        <Section
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          title="Why"
          items={result.reason}
        />
      )}

      {/* Suggestions */}
      {result.suggestions?.length > 0 && (
        <Section
          icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
          title="Suggestions"
          items={result.suggestions}
        />
      )}

      {/* Alternatives */}
      {result.alternatives?.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Repeat className="h-4 w-4 text-blue-500" />
            Alternative crops
          </div>
          <div className="flex flex-wrap gap-2">
            {result.alternatives.map((alt) => (
              <span
                key={alt}
                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium capitalize text-blue-600 dark:text-blue-300"
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
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
            <span className="leading-relaxed">{it}</span>
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
        <span className="font-medium text-muted-foreground">Confidence</span>
        <span className={`font-bold ${tone.confTextCls}`}>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${tone.barCls}`}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tone (suitability → colour scheme) lookup
// ---------------------------------------------------------------------------
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
    icon: <CheckCircle2 className="h-7 w-7 text-white" />,
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30",
    headerCls:
      "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/5",
    badgeCls: "bg-emerald-500 text-white",
    barCls: "bg-gradient-to-r from-emerald-500 to-green-500",
    confTextCls: "text-emerald-600 dark:text-emerald-400",
  },
  Moderate: {
    icon: <AlertCircle className="h-7 w-7 text-white" />,
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30",
    headerCls:
      "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5",
    badgeCls: "bg-amber-500 text-white",
    barCls: "bg-gradient-to-r from-amber-400 to-orange-500",
    confTextCls: "text-amber-600 dark:text-amber-400",
  },
  "Not Suitable": {
    icon: <XCircle className="h-7 w-7 text-white" />,
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30",
    headerCls:
      "border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-red-500/5",
    badgeCls: "bg-rose-500 text-white",
    barCls: "bg-gradient-to-r from-rose-500 to-red-500",
    confTextCls: "text-rose-600 dark:text-rose-400",
  },
}
