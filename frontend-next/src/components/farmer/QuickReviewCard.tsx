"use client"

import React, { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown, Meh, X, Sparkles, Check } from "lucide-react"
import { useLanguage } from "@/lib/language"
import { getFeedbackDict } from "@/lib/feedback-i18n"
import { useFarmerFeedback } from "./FarmerFeedbackContext"

interface QuickReviewCardProps {
  category: "mandi" | "weather" | "disease" | "marketplace" | "workers" | "schemes" | "general"
  sourcePage?: string
  className?: string
}

export function QuickReviewCard({ category, sourcePage, className = "" }: QuickReviewCardProps) {
  const { lang } = useLanguage()
  const d = getFeedbackDict(lang)
  const { openFeedback } = useFarmerFeedback()

  const [isVisible, setIsVisible] = useState(false)
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const storageKey = `kb_quick_review_${category}`

  useEffect(() => {
    try {
      const lastSubmitted = localStorage.getItem(storageKey)
      if (lastSubmitted) {
        const diffDays = (Date.now() - parseInt(lastSubmitted, 10)) / (1000 * 60 * 60 * 24)
        if (diffDays < 7) {
          setIsVisible(false)
          return
        }
      }
      setIsVisible(true)
    } catch {
      setIsVisible(true)
    }
  }, [storageKey])

  const handleRating = async (rating: "helpful" | "neutral" | "unhelpful") => {
    setSelectedRating(rating)
    setHasSubmitted(true)

    try {
      localStorage.setItem(storageKey, Date.now().toString())
      await fetch("/api/feedback/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick_rating: rating,
          category,
          source_page: sourcePage || window.location.pathname,
          language: lang,
        }),
      })
    } catch (err) {
      console.warn("Could not save quick rating:", err)
    }

    // Auto-hide after 5 seconds if no further interaction
    setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, Date.now().toString())
    } catch {}
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      className={`my-4 p-3.5 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-xs shadow-xs transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {!hasSubmitted ? (
          <>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                {d.quickTitle}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => handleRating("helpful")}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center gap-1 transition-colors"
                title={d.quickHelpful}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{d.quickHelpful}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRating("neutral")}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center gap-1 transition-colors"
                title={d.quickCouldBeBetter}
              >
                <Meh className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{d.quickCouldBeBetter}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRating("unhelpful")}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-200 text-xs font-medium flex items-center gap-1 transition-colors"
                title={d.quickNotHelpful}
              >
                <ThumbsDown className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">{d.quickNotHelpful}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors ml-1"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4" />
              <span>{d.quickThanks}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                openFeedback({
                  category,
                  sourcePage,
                  feedbackType: selectedRating === "helpful" ? "positive" : "improvement",
                })
              }}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              {d.entryPointLabel} &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
