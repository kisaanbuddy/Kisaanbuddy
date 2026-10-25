"use client"

import React, { useEffect, useState } from "react"
import { CheckCircle2, Clock, Sparkles, MessageSquareHeart } from "lucide-react"
import { useLanguage } from "@/lib/language"
import { getFeedbackDict } from "@/lib/feedback-i18n"
import { useFarmerFeedback } from "./FarmerFeedbackContext"

interface ImprovementItem {
  id: string
  feedback_ref: string
  category: string
  feedback_type: string
  guided_option?: string | null
  improvement_summary: string
  status: string
  created_at: string
  updated_at: string
}

export function PublicImprovementsSection() {
  const { lang } = useLanguage()
  const d = getFeedbackDict(lang)
  const { openFeedback } = useFarmerFeedback()

  const [items, setItems] = useState<ImprovementItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchImprovements = async () => {
      try {
        const res = await fetch("/api/feedback/public-improvements")
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setItems(data)
        }
      } catch (err) {
        console.warn("Could not load public improvements:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchImprovements()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-stone-50/50 dark:bg-stone-900/40 border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{d.publicTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
              {d.publicTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              {d.publicSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => openFeedback({ feedbackType: "idea" })}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs self-start sm:self-auto transition-colors"
          >
            + {d.entryPointLabel}
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">
            Loading improvements...
          </div>
        ) : items.length === 0 ? (
          /* Well-designed, genuine empty state */
          <div className="p-8 sm:p-10 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900/60 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Listening to Farmers
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {d.publicEmpty}
              </p>
            </div>
          </div>
        ) : (
          /* Real verified improvements list */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-stone-400">
                      {item.feedback_ref}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase flex items-center gap-1 ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {item.status === "completed" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{d.publicStatusCompleted}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{d.publicStatusPlanned}</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-stone-900 dark:text-white leading-relaxed">
                    {item.improvement_summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="capitalize">{item.category}</span>
                  <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
