"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Calendar,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Tag,
} from "lucide-react";
import { FarmActivity } from "@/lib/farmer-api";

interface RecentActivitiesTimelineProps {
  activities: FarmActivity[];
}

export function RecentActivitiesTimeline({
  activities,
}: RecentActivitiesTimelineProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Field Log & Expenses
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical log of field inputs, sprays, harvests, and seasonal costs
          </p>
        </div>

        <Link
          href="/profile?tab=activities"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Log Activity</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
          <p className="mb-2">No farm activities recorded yet.</p>
          <Link
            href="/profile?tab=activities"
            className="text-emerald-600 dark:text-emerald-400 underline font-semibold"
          >
            Record your first field activity or expense
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {act.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="capitalize">{act.activity_type}</span>
                    {act.quantity ? (
                      <span>
                        • {act.quantity} {act.unit || ""}
                      </span>
                    ) : null}
                    <span>• {act.activity_date}</span>
                  </div>
                </div>
              </div>

              {act.amount !== null && act.amount !== undefined && (
                <div
                  className={`text-xs font-bold flex items-center gap-0.5 ${
                    act.category === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {act.category === "income" ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {act.category === "income" ? "+" : "-"}₹{act.amount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
