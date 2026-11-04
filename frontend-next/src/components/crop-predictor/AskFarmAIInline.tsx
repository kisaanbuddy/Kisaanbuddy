"use client"

import React, { useState } from "react"
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Lightbulb,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface CropCheckResponse {
  crop: string | null
  suitability: "Suitable" | "Moderate" | "Not Suitable" | string
  confidence: number
  reason: string[]
  suggestions: string[]
  alternatives: string[]
}

interface Props {
  farmParams: {
    N: number
    P: number
    K: number
    temperature: number
    humidity: number
    ph: number
    rainfall: number
  }
  farmLocation?: string
  topCrop?: string | null
  lang?: string
}

const QUICK_PROMPTS = [
  { en: "Which crop is most suitable for my soil?", hi: "मेरी मिट्टी के लिए सबसे सही फसल कौन सी है?", kn: "ನನ್ನ ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ ಹೆಚ್ಚು ಸೂಕ್ತ?" },
  { en: "Is wheat suitable for my farm conditions?", hi: "क्या मेरे खेत में गेहूं उगाना सही रहेगा?", kn: "ನನ್ನ ಹೊಲದಲ್ಲಿ ಗೋಧಿ ಬೆಳೆಯಲು ಸಾಧ್ಯವೇ?" },
  { en: "How can I improve my soil fertility?", hi: "मैं अपने खेत की मिट्टी कैसे सुधारूं?", kn: "ನನ್ನ ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು ಹೇಗೆ ಹೆಚ್ಚಿಸುವುದು?" },
  { en: "Which nutrients are currently deficient?", hi: "मेरी मिट्टी में कौन से पोषक तत्वों की कमी है?", kn: "ನನ್ನ ಮಣ್ಣಿನಲ್ಲಿ ಯಾವ ಪೋಷಕಾಂಶಗಳ ಕೊರತೆಯಿದೆ?" },
]

export function AskFarmAIInline({
  farmParams,
  farmLocation,
  topCrop,
  lang = "en",
}: Props) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CropCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAsk(askText?: string) {
    const q = (askText || query).trim()
    if (!q || loading) return

    setQuery(q)
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/ml/crop-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: farmParams.N,
          P: farmParams.P,
          K: farmParams.K,
          temp: farmParams.temperature,
          humidity: farmParams.humidity,
          ph: farmParams.ph,
          rainfall: farmParams.rainfall,
          query: q,
        }),
      })

      if (!res.ok) {
        throw new Error(`AI Assistant error (HTTP ${res.status})`)
      }

      const data: CropCheckResponse = await res.json()
      setResult(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get AI evaluation"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-card p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">
            Ask Your Farm AI (Contextual Agronomist)
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Aware of your NPK, pH &amp; {farmLocation || "local climate"}
        </span>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground">Suggested questions:</span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p, i) => {
            const promptText = lang === "hi" ? p.hi : lang === "kn" ? p.kn : p.en
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleAsk(promptText)}
                disabled={loading}
                className="px-2.5 py-1 rounded-md text-xs border border-border bg-muted/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500/40 text-foreground transition-colors disabled:opacity-50 text-left"
              >
                {promptText}
              </button>
            )
          })}
        </div>
      </div>

      {/* Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleAsk()
        }}
        className="flex gap-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            lang === "hi"
              ? "अपनी फसल या मिट्टी के बारे में कोई भी प्रश्न पूछें..."
              : lang === "kn"
              ? "ನಿಮ್ಮ ಬೆಳೆ ಅಥವಾ ಮಣ್ಣಿನ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ..."
              : "Ask anything about crop suitability, fertilizer doses, water needs..."
          }
          className="text-xs h-10"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 h-10 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
          <span>Ask</span>
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Structured Verdict */}
      {result && (
        <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">
                {result.crop ? `Target: ${result.crop.toUpperCase()}` : "Agronomic Assessment"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  result.suitability === "Suitable"
                    ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200"
                    : result.suitability === "Moderate"
                    ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                    : "bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200"
                }`}
              >
                {result.suitability}
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
              {result.confidence}% Match
            </span>
          </div>

          {/* Reasons */}
          {result.reason.length > 0 && (
            <div className="space-y-1">
              <span className="font-semibold text-foreground">Evaluation:</span>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                {result.reason.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-emerald-200 dark:border-emerald-900/60">
              <span className="font-semibold text-foreground">Recommendations:</span>
              <ul className="list-disc list-inside text-emerald-800 dark:text-emerald-300 space-y-0.5 font-medium">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives.length > 0 && (
            <div className="pt-1 text-[11px] text-muted-foreground">
              <strong>Better-suited alternatives for your soil:</strong>{" "}
              {result.alternatives.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
