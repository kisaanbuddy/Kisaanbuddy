"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"
import { Lang } from "@/lib/language"
import { HistoricalPriceResponse, HistoricalObservation } from "@/lib/data/historical-mandi-data"

export type TimeRangeOption = "7D" | "30D" | "3M" | "6M" | "1Y"

interface HistoricalPriceChartProps {
  crop: {
    id: number | string
    name: string
    variety?: string
    mandi: string
    state: string
    unit?: string
    modal_price?: number
    price?: number
    min_price?: number
    max_price?: number
  }
  lang?: Lang
}

const RANGE_DAYS_MAP: Record<TimeRangeOption, number> = {
  "7D": 7,
  "30D": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
}

const I18N_STRINGS: Record<
  string,
  {
    title: string
    subtitle: string
    ranges: Record<TimeRangeOption, string>
    latestModal: string
    highestModal: string
    lowestModal: string
    averageModal: string
    periodChange: string
    modalLine: string
    minLine: string
    maxLine: string
    emptyTitle: string
    emptyDesc: string
    sourceAttribution: string
    disclaimer: string
    retry: string
    perQuintal: string
    arrivals: string
  }
> = {
  en: {
    title: "Historical Mandi Prices",
    subtitle: "Daily APMC market observations",
    ranges: {
      "7D": "7 Days",
      "30D": "30 Days",
      "3M": "3 Months",
      "6M": "6 Months",
      "1Y": "1 Year",
    },
    latestModal: "Latest Modal",
    highestModal: "Highest",
    lowestModal: "Lowest",
    averageModal: "Average",
    periodChange: "Period Change",
    modalLine: "Modal Price",
    minLine: "Min Price",
    maxLine: "Max Price",
    emptyTitle: "Historical data currently unavailable",
    emptyDesc:
      "Official price records are currently not available for this commodity in the selected timeframe.",
    sourceAttribution: "Source: AGMARKNET",
    disclaimer: "Indicative market rates",
    retry: "Retry",
    perQuintal: "₹/quintal",
    arrivals: "Arrivals",
  },
  hi: {
    title: "ऐतिहासिक मंडी भाव",
    subtitle: "दैनिक बाजार भाव रुझान",
    ranges: {
      "7D": "7 दिन",
      "30D": "30 दिन",
      "3M": "3 माह",
      "6M": "6 माह",
      "1Y": "1 वर्ष",
    },
    latestModal: "नवीनतम मोडल",
    highestModal: "अधिकतम",
    lowestModal: "न्यूनतम",
    averageModal: "औसत",
    periodChange: "अवधि बदलाव",
    modalLine: "मोडल भाव",
    minLine: "न्यूनतम भाव",
    maxLine: "अधिकतम भाव",
    emptyTitle: "ऐतिहासिक डेटा फिलहाल उपलब्ध नहीं है",
    emptyDesc:
      "चयनित समय अवधि के लिए इस फसल का रिकॉर्ड अभी दर्ज नहीं है।",
    sourceAttribution: "स्रोत: AGMARKNET",
    disclaimer: "संदर्भ मंडी भाव",
    retry: "पुनः प्रयास करें",
    perQuintal: "₹/क्विंटल",
    arrivals: "आवक",
  },
  kn: {
    title: "ಇತಿಹಾಸ ಮಂಡಿ ಬೆಲೆಗಳು",
    subtitle: "ದೈನಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು",
    ranges: {
      "7D": "7 ದಿನ",
      "30D": "30 ದಿನ",
      "3M": "3 ತಿಂಗಳು",
      "6M": "6 ತಿಂಗಳು",
      "1Y": "1 ವರ್ಷ",
    },
    latestModal: "ಇತ್ತೀಚಿನ ಮಾದರಿ",
    highestModal: "ಗರಿಷ್ಠ",
    lowestModal: "ಕನಿಷ್ಠ",
    averageModal: "ಸರಾಸರಿ",
    periodChange: "ಬದಲಾವಣೆ",
    modalLine: "ಮಾದರಿ ಬೆಲೆ",
    minLine: "ಕನಿಷ್ಠ ಬೆಲೆ",
    maxLine: "ಗರಿಷ್ಠ ಬೆಲೆ",
    emptyTitle: "ಐತಿಹಾಸಿಕ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
    emptyDesc:
      "ಆಯ್ದ ಅವಧಿಗೆ ಈ ಬೆಳೆಯ ದಾಖಲೆಗಳು ಸದ್ಯಕ್ಕೆ ಲಭ್ಯವಿಲ್ಲ.",
    sourceAttribution: "ಮೂಲ: AGMARKNET",
    disclaimer: "ಉಲ್ಲೇಖ ಮಾರುಕಟ್ಟೆ ದರಗಳು",
    retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    perQuintal: "₹/ಕ್ವಿಂಟಾಲ್",
    arrivals: "ಆವಕ",
  },
}

export function HistoricalPriceChart({ crop, lang = "en" }: HistoricalPriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>("30D")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HistoricalPriceResponse | null>(null)
  const [isMounted, setIsMounted] = useState<boolean>(false)

  const dict = useMemo(() => {
    return I18N_STRINGS[lang] || I18N_STRINGS.en
  }, [lang])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Clean crop name for query (e.g. "Wheat (गेहूं)" -> "Wheat")
  const queryCommodity = useMemo(() => {
    if (!crop.name) return ""
    return crop.name.split("(")[0].trim()
  }, [crop.name])

  const fetchHistoricalData = useCallback(async () => {
    if (!queryCommodity) return

    setLoading(true)
    setError(null)

    try {
      const days = RANGE_DAYS_MAP[selectedRange]
      const params = new URLSearchParams({
        commodity: queryCommodity,
        market: crop.mandi || "",
        state: crop.state || "",
        variety: crop.variety || "",
        days: days.toString(),
      })

      const res = await fetch(`/api/mandi/historical-prices?${params.toString()}`)
      if (!res.ok) {
        throw new Error(`Failed to load historical prices (${res.status})`)
      }

      const json: HistoricalPriceResponse = await res.json()
      setData(json)
    } catch (err: any) {
      console.error("[HistoricalPriceChart] Fetch error:", err)
      setError(err.message || "Failed to load historical data")
    } finally {
      setLoading(false)
    }
  }, [queryCommodity, crop.mandi, crop.state, crop.variety, selectedRange])

  useEffect(() => {
    fetchHistoricalData()
  }, [fetchHistoricalData])

  // Format date string for X-Axis (e.g. "2026-10-19" -> "19 Oct")
  const formatDateLabel = useCallback((dateStr: string) => {
    try {
      const d = new Date(`${dateStr}T00:00:00Z`)
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    } catch {
      return dateStr
    }
  }, [])

  // Format tooltip content
  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const row: HistoricalObservation = payload[0]?.payload
    if (!row) return null

    let formattedDate = label
    try {
      const d = new Date(`${row.date}T00:00:00Z`)
      formattedDate = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      // keep raw date
    }

    return (
      <div className="rounded-lg border border-border bg-card/95 p-3 shadow-md backdrop-blur-sm text-xs">
        <p className="font-bold text-foreground mb-1.5 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          {formattedDate}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              {dict.modalLine}:
            </span>
            <span className="font-bold text-foreground">₹{row.modal_price?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-blue-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
              {dict.minLine}:
            </span>
            <span className="font-semibold text-muted-foreground">₹{row.min_price?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-amber-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
              {dict.maxLine}:
            </span>
            <span className="font-semibold text-muted-foreground">₹{row.max_price?.toLocaleString()}</span>
          </div>
          {row.arrival_tonnes ? (
            <div className="pt-1 mt-1 border-t border-border flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
              <span>{dict.arrivals}:</span>
              <span className="font-medium text-foreground">{row.arrival_tonnes.toLocaleString()} Tonnes</span>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  const hasObservations = Boolean(data && data.available && data.observations.length >= 2)
  const summary = data?.summary

  return (
    <section
      aria-label={dict.title}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-colors"
    >
      {/* Header Row: Title & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {dict.title}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="h-3.5 w-3.5" /> AGMARKNET
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{dict.subtitle} ({crop.name})</p>
        </div>

        {/* Date Filter Pills */}
        <div
          role="group"
          aria-label="Filter historical time period"
          className="inline-flex items-center rounded-xl bg-muted/60 p-1 border border-border self-start sm:self-auto shadow-2xs"
        >
          {(["7D", "30D", "3M", "6M", "1Y"] as TimeRangeOption[]).map((r) => {
            const isActive = selectedRange === r
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRange(r)}
                aria-pressed={isActive}
                className={`min-h-[38px] px-3 sm:px-4 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                }`}
              >
                {dict.ranges[r]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary KPI Strip (Rendered when valid comparison observations exist) */}
      {hasObservations && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5 p-4 rounded-xl bg-muted/25 border border-border">
          <div className="p-1">
            <span className="text-[10px] uppercase font-bold tracking-[.08em] text-muted-foreground">
              {dict.latestModal}
            </span>
            <p className="text-base sm:text-lg font-extrabold text-foreground mt-1">
              ₹{summary.latest_modal.toLocaleString()}
            </p>
          </div>
          <div className="p-1">
            <span className="text-[10px] uppercase font-bold tracking-[.08em] text-muted-foreground">
              {dict.highestModal}
            </span>
            <p className="text-base sm:text-lg font-extrabold text-foreground mt-1">
              ₹{summary.highest_modal.toLocaleString()}
            </p>
          </div>
          <div className="p-1">
            <span className="text-[10px] uppercase font-bold tracking-[.08em] text-muted-foreground">
              {dict.lowestModal}
            </span>
            <p className="text-base sm:text-lg font-extrabold text-foreground mt-1">
              ₹{summary.lowest_modal.toLocaleString()}
            </p>
          </div>
          <div className="p-1">
            <span className="text-[10px] uppercase font-bold tracking-[.08em] text-muted-foreground">
              {dict.averageModal}
            </span>
            <p className="text-base sm:text-lg font-extrabold text-foreground mt-1">
              ₹{summary.average_modal.toLocaleString()}
            </p>
          </div>
          {summary.change_percent !== null && (
            <div className="p-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold tracking-[.08em] text-muted-foreground">
                {dict.periodChange}
              </span>
              <p
                className={`text-base sm:text-lg font-extrabold mt-1 flex items-center gap-1 ${
                  summary.change_direction === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : summary.change_direction === "down"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground"
                }`}
              >
                {summary.change_direction === "up" && <TrendingUp className="h-4 w-4" />}
                {summary.change_direction === "down" && <TrendingDown className="h-4 w-4" />}
                {summary.change_direction === "neutral" && <Minus className="h-4 w-4" />}
                {summary.change_percent > 0 ? `+${summary.change_percent}%` : `${summary.change_percent}%`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Content: Loading, Error, Empty State, or Interactive Chart */}
      {loading ? (
        <div className="h-[320px] sm:h-[370px] lg:h-[400px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs font-semibold">Fetching verified AGMARKNET records...</span>
        </div>
      ) : error ? (
        <div className="h-[320px] sm:h-[370px] lg:h-[400px] flex flex-col items-center justify-center gap-3 p-4 text-center rounded-xl bg-amber-500/5 border border-amber-500/20">
          <AlertCircle className="h-8 w-8 text-amber-500" />
          <p className="text-xs text-foreground font-semibold max-w-sm">{error}</p>
          <button
            type="button"
            onClick={fetchHistoricalData}
            className="min-h-10 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {dict.retry}
          </button>
        </div>
      ) : !hasObservations ? (
        /* Strict Data Integrity Empty State: Never display fabricated points */
        <div className="min-h-[280px] sm:min-h-[340px] flex flex-col items-center justify-center p-8 text-center rounded-xl bg-muted/20 border border-border/80">
          <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">{dict.emptyTitle}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground max-w-md">{dict.emptyDesc}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" />
            No synthetic or estimated prices are substituted.
          </div>
        </div>
      ) : isMounted ? (
        <div className="space-y-4">
          {/* Accessible Legend Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-2 font-bold text-foreground">
              <span className="h-2.5 w-4 rounded-xs bg-emerald-600 inline-block" />
              {dict.modalLine}
            </span>
            <span className="flex items-center gap-2 font-medium">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-blue-500 inline-block" />
              {dict.minLine}
            </span>
            <span className="flex items-center gap-2 font-medium">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-amber-500 inline-block" />
              {dict.maxLine}
            </span>
          </div>

          {/* Recharts Area - Height increased to 350-400px on desktop */}
          <div className="h-[320px] sm:h-[370px] lg:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data?.observations}
                margin={{ top: 12, right: 16, left: -10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.18)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateLabel}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(150,150,150,0.25)" }}
                  tick={{ fontSize: 11, fill: "#78716c", fontWeight: 500 }}
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#78716c", fontWeight: 500 }}
                  domain={["dataMin - 100", "dataMax + 100"]}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={customTooltip} />
                <Line
                  type="monotone"
                  dataKey="modal_price"
                  name={dict.modalLine}
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#16a34a" }}
                  activeDot={{ r: 7, fill: "#15803d" }}
                />
                <Line
                  type="monotone"
                  dataKey="min_price"
                  name={dict.minLine}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#3b82f6" }}
                />
                <Line
                  type="monotone"
                  dataKey="max_price"
                  name={dict.maxLine}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#f59e0b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Provenance & Disclaimer Footer */}
      <div className="mt-5 pt-3.5 border-t border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <a
          href="https://agmarknet.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors inline-flex items-center gap-1.5 underline underline-offset-2 font-medium"
        >
          {dict.sourceAttribution}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <span>{dict.disclaimer}</span>
      </div>
    </section>
  )
}
