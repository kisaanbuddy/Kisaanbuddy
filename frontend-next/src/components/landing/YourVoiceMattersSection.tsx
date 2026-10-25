"use client"

import React from "react"
import { Mic, HeartHandshake, Sparkles, MessageSquareHeart } from "lucide-react"
import { useLanguage } from "@/lib/language"
import { getFeedbackDict } from "@/lib/feedback-i18n"
import { useFarmerFeedback } from "@/components/farmer/FarmerFeedbackContext"

export function YourVoiceMattersSection() {
  const { lang } = useLanguage()
  const d = getFeedbackDict(lang)
  const { openFeedback } = useFarmerFeedback()

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/40">
          {/* Subtle background ambient lights */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-3 text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span>{d.entryPointTag}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {d.modalTitle}
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {d.entryPointSub} {d.modalSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openFeedback({ feedbackType: "improvement" })}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 active:scale-95 font-bold text-sm shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span>{d.entryPointLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
