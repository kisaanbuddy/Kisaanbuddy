"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Droplets,
  Sprout,
  ShieldAlert,
  Calendar,
  Check,
  RotateCw,
} from "lucide-react";
import { Recommendation, recommendationsApi } from "@/lib/farmer-api";

interface AiInsightsCardProps {
  recommendations: Recommendation[];
  onRecommendationUpdated?: () => void;
}

export function AiInsightsCard({
  recommendations,
  onRecommendationUpdated,
}: AiInsightsCardProps) {
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);

  const pendingRecs = recommendations.filter((r) => r.status === "pending");

  const handleMarkComplete = async (id: number) => {
    try {
      setUpdatingId(id);
      await recommendationsApi.updateStatus(id, "completed");
      onRecommendationUpdated?.();
    } catch (err) {
      console.error("Failed to update recommendation status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "irrigation":
        return <Droplets className="w-3.5 h-3.5 text-sky-600" />;
      case "fertilizer":
        return <Sprout className="w-3.5 h-3.5 text-emerald-600" />;
      case "pest":
      case "disease":
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Farm Intelligence & Advisory
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time recommendations generated from your soil tests, crops, and local weather
          </p>
        </div>

        <Link
          href="/chat"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Open AI Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {pendingRecs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            All Farm Recommendations Completed
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Your farm activities are up to date! Ask the AI assistant anytime for customized crop schedules, disease diagnostics, or fertilizer formulas.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Doctor</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRecs.slice(0, 3).map((rec) => (
            <div
              key={rec.id}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-4 transition hover:border-emerald-500/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {getCategoryIcon(rec.category)}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rec.title}
                  </h4>
                  {rec.confidence && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {rec.confidence} Confidence
                    </span>
                  )}
                </div>

                {rec.date_window && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {rec.date_window}
                  </span>
                )}
              </div>

              {/* Action Instruction */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200/80 dark:border-slate-700/70 mb-2">
                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                  Recommended Action:
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {rec.recommended_action}
                </p>
              </div>

              {/* Rationale & Source Data */}
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Why it matters:{" "}
                </span>
                {rec.explanation}
              </p>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {rec.source && <span>Source: {rec.source}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/chat?query=${encodeURIComponent(
                      `Tell me more about recommendation: ${rec.title}. Action: ${rec.recommended_action}`
                    )}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Ask AI</span>
                  </Link>

                  <button
                    onClick={() => handleMarkComplete(rec.id)}
                    disabled={updatingId === rec.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
                  >
                    {updatingId === rec.id ? (
                      <RotateCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    <span>Mark Done</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
