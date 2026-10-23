"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  Sprout,
  CheckSquare,
  CloudSun,
  CalendarDays,
  FlaskConical,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { FarmerField, SoilTest, FarmTaskSummary } from "@/lib/farmer-api";

interface FarmKpiRowProps {
  totalAcres: number;
  fields: FarmerField[];
  taskSummary?: FarmTaskSummary | null;
  latestSoilTest?: SoilTest | null;
  weatherTemp?: number;
  weatherCondition?: string;
}

export function FarmKpiRow({
  totalAcres,
  fields,
  taskSummary,
  latestSoilTest,
  weatherTemp = 28,
  weatherCondition = "Clear Sky",
}: FarmKpiRowProps) {
  // Count distinct active crops
  const activeCrops = React.useMemo(() => {
    const crops = new Set<string>();
    fields.forEach((f) => {
      if (f.current_crop) crops.add(f.current_crop);
    });
    return Array.from(crops);
  }, [fields]);

  // Next harvest calculation
  const nextHarvest = React.useMemo(() => {
    const upcoming = fields
      .filter((f) => f.expected_harvest)
      .map((f) => ({
        crop: f.current_crop || "Crop",
        field: f.field_name,
        date: new Date(f.expected_harvest!),
      }))
      .filter((item) => item.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    if (!upcoming) return null;
    const diffDays = Math.ceil((upcoming.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return { ...upcoming, daysLeft: diffDays };
  }, [fields]);

  // Soil health status
  const soilStatus = React.useMemo(() => {
    if (!latestSoilTest) {
      return { label: "Test Recommended", status: "needs_test", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" };
    }
    const ph = latestSoilTest.soil_ph;
    if (ph && ph >= 6.0 && ph <= 7.5) {
      return { label: `pH ${ph} (Optimal)`, status: "good", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" };
    }
    if (ph) {
      return { label: `pH ${ph} (Attention)`, status: "attention", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" };
    }
    return { label: "Recorded", status: "good", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" };
  }, [latestSoilTest]);

  const kpis = [
    {
      title: "Total Farm Holding",
      value: `${totalAcres > 0 ? totalAcres : fields.reduce((sum, f) => sum + (f.acreage || 0), 0) || "—"}`,
      unit: "Acres",
      sub: `${fields.length} ${fields.length === 1 ? "Plot Mapped" : "Plots Mapped"}`,
      icon: Layers,
      href: "/profile",
      accent: "text-emerald-600 dark:text-emerald-400",
      bgAccent: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Active Crops",
      value: `${activeCrops.length}`,
      unit: activeCrops.length === 1 ? "Crop" : "Crops",
      sub: activeCrops.length > 0 ? activeCrops.slice(0, 2).join(", ") : "No crop assigned",
      icon: Sprout,
      href: "/profile",
      accent: "text-teal-600 dark:text-teal-400",
      bgAccent: "bg-teal-50 dark:bg-teal-950/50",
    },
    {
      title: "Work Tasks Due",
      value: `${taskSummary?.due_today ?? 0}`,
      unit: "Today",
      sub: `${taskSummary?.total_pending ?? 0} Pending total${
        taskSummary?.overdue ? ` (${taskSummary.overdue} overdue)` : ""
      }`,
      icon: CheckSquare,
      href: "#tasks-planner",
      accent:
        (taskSummary?.overdue ?? 0) > 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-emerald-600 dark:text-emerald-400",
      bgAccent:
        (taskSummary?.overdue ?? 0) > 0
          ? "bg-rose-50 dark:bg-rose-950/50"
          : "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Field Microclimate",
      value: `${weatherTemp}°`,
      unit: "C",
      sub: weatherCondition,
      icon: CloudSun,
      href: "/weather",
      accent: "text-sky-600 dark:text-sky-400",
      bgAccent: "bg-sky-50 dark:bg-sky-950/50",
    },
    {
      title: "Next Harvest Window",
      value: nextHarvest ? `${nextHarvest.daysLeft}` : "—",
      unit: nextHarvest ? "Days Left" : "Not Set",
      sub: nextHarvest ? `${nextHarvest.crop} (${nextHarvest.field || "Field"})` : "Add expected harvest",
      icon: CalendarDays,
      href: "/profile",
      accent: "text-amber-600 dark:text-amber-400",
      bgAccent: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      title: "Soil Health Index",
      value: latestSoilTest?.organic_carbon_pct ? `${latestSoilTest.organic_carbon_pct}%` : "pH 6.8",
      unit: latestSoilTest?.organic_carbon_pct ? "Organic C" : "Est. Value",
      sub: latestSoilTest?.is_verified ? "Lab Verified" : soilStatus.label,
      icon: FlaskConical,
      href: "/profile",
      accent: "text-indigo-600 dark:text-indigo-400",
      bgAccent: "bg-indigo-50 dark:bg-indigo-950/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Link
            key={idx}
            href={kpi.href}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-emerald-500/50 transition duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.bgAccent} ${kpi.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {kpi.unit}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                {kpi.sub}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View details</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
