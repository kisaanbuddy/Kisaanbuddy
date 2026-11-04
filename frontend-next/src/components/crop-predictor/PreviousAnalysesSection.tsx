"use client"

import React, { useState, useEffect } from "react"
import {
  History,
  Trash2,
  Calendar,
  RotateCcw,
  Sparkles,
  Lock,
  Loader2,
  ChevronRight,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react"
import { recommendationsApi, type Recommendation } from "@/lib/farmer-api"
import { type AuthUser } from "@/lib/auth"
import Link from "next/link"

interface Props {
  user: AuthUser | null
  authReady: boolean
  onReuseParams: (savedParams: any) => void
  refreshTrigger?: number
  dict: any
}

export function PreviousAnalysesSection({
  user,
  authReady,
  onReuseParams,
  refreshTrigger = 0,
  dict,
}: Props) {
  const [history, setHistory] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [reappliedId, setReappliedId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setHistory([])
      return
    }

    let isMounted = true
    async function loadHistory() {
      setLoading(true)
      try {
        const data = await recommendationsApi.list({ category: "next_season" })
        if (isMounted) {
          setHistory(data || [])
        }
      } catch {
        if (isMounted) setHistory([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadHistory()
    return () => {
      isMounted = false
    }
  }, [user, refreshTrigger])

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await recommendationsApi.delete(id)
      setHistory((prev) => prev.filter((item) => item.id !== id))
    } catch {
      // ignore or alert
    } finally {
      setDeletingId(null)
    }
  }

  function handleApplyParams(rec: Recommendation) {
    if (!rec.data_used) return
    try {
      const parsed = JSON.parse(rec.data_used)
      onReuseParams(parsed)
      setReappliedId(rec.id)
      setTimeout(() => setReappliedId(null), 3000)
    } catch {}
  }

  if (authReady && !user) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center space-y-3 shadow-2xs">
        <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
          <History className="h-5 w-5" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm font-bold text-foreground">
            {dict.historyTitle || "My Previous Analyses"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {dict.loginToSaveNotice ||
              "Log in with your phone or farmer account to save and compare seasonal crop recommendations across years."}
          </p>
        </div>
        <div>
          <Link
            href="/login?redirect=/crop-predictor"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
          >
            <span>Log In to Access History</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">
            {dict.historyTitle || "My Previous Analyses"}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {history.length} {history.length === 1 ? "saved record" : "saved records"}
        </span>
      </div>

      {loading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          <span>Retrieving your past farm evaluations...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="py-6 px-4 rounded-lg border border-dashed border-border text-center space-y-1 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">No previous analyses saved yet</p>
          <p className="text-[11px]">
            {dict.noHistoryNotice || "When you run an analysis, click 'Save This Analysis' to keep track of seasonal evaluations."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {history.map((rec) => {
            const dateStr = rec.created_at
              ? new Date(rec.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Previous Record"

            let parsedData: any = null
            try {
              if (rec.data_used) parsedData = JSON.parse(rec.data_used)
            } catch {}

            return (
              <div
                key={rec.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">
                      {rec.crop_name || rec.title}
                    </span>
                    {rec.confidence && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {rec.confidence} Match
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dateStr}
                    </span>
                    {parsedData?.params && (
                      <span className="font-mono">
                        N: {parsedData.params.N} | P: {parsedData.params.P} | K: {parsedData.params.K} | pH: {parsedData.params.ph}
                      </span>
                    )}
                  </div>
                  {rec.explanation && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xl">
                      {rec.explanation}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {parsedData?.params && (
                    <button
                      type="button"
                      onClick={() => handleApplyParams(rec)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-colors"
                    >
                      {reappliedId === rec.id ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{dict.reuseParamsBtn || "Reuse Parameters"}</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(rec.id)}
                    disabled={deletingId === rec.id}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                    title={dict.deleteAnalysisBtn || "Delete Record"}
                  >
                    {deletingId === rec.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
