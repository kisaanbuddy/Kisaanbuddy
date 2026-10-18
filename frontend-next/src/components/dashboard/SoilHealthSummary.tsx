"use client";

import React from "react";
import Link from "next/link";
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { SoilTest } from "@/lib/farmer-api";

interface SoilHealthSummaryProps {
  latestTest?: SoilTest | null;
}

export function SoilHealthSummary({ latestTest }: SoilHealthSummaryProps) {
  // Nutrient benchmarks
  const n = latestTest?.nitrogen_kg_ha ?? 240;
  const p = latestTest?.phosphorus_kg_ha ?? 18;
  const k = latestTest?.potassium_kg_ha ?? 160;
  const ph = latestTest?.soil_ph ?? 6.8;
  const oc = latestTest?.organic_carbon_pct ?? 0.65;
  const isVerified = Boolean(latestTest?.is_verified);

  const getNutrientStatus = (val: number, low: number, opt: number) => {
    if (val < low) return { text: "Deficient", color: "text-amber-600 dark:text-amber-400" };
    if (val >= opt) return { text: "High", color: "text-emerald-600 dark:text-emerald-400" };
    return { text: "Optimal", color: "text-emerald-600 dark:text-emerald-400" };
  };

  const nStatus = getNutrientStatus(n, 200, 280);
  const pStatus = getNutrientStatus(p, 15, 25);
  const kStatus = getNutrientStatus(k, 120, 200);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Soil Health & Nutrients
            </h2>
            {latestTest ? (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  isVerified
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                }`}
              >
                {isVerified ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Lab-Verified
                  </>
                ) : (
                  <>
                    <Info className="w-3 h-3 text-amber-600" /> Farmer Estimated
                  </>
                )}
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Baseline Estimate
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {latestTest?.test_date
              ? `Report tested on ${latestTest.test_date}${
                  latestTest.lab_name ? ` by ${latestTest.lab_name}` : ""
                }`
              : "Field macronutrients and soil pH balance for tailored fertilization"}
          </p>
        </div>

        <Link
          href="/profile?tab=soil"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>{latestTest ? "Manage Soil Tests" : "Record Soil Test"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Primary Soil Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* pH */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Soil Reaction (pH)
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {ph}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            {ph >= 6.0 && ph <= 7.5 ? "Optimal Range" : ph < 6.0 ? "Acidic" : "Alkaline"}
          </div>
        </div>

        {/* Organic Carbon */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Organic Carbon (SOC)
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {oc}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            {oc >= 0.75 ? "Rich (>0.75%)" : "Medium (0.5–0.75%)"}
          </div>
        </div>

        {/* Soil Type */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Texture / Type
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white truncate">
            {latestTest?.soil_type || "Alluvial / Loam"}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Good Drainage
          </div>
        </div>

        {/* Electrical Conductivity */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Salinity (EC)
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {latestTest?.ec_ds_m ?? 0.45}{" "}
            <span className="text-xs font-normal text-slate-500">dS/m</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Non-saline
          </div>
        </div>
      </div>

      {/* N-P-K Nutrient Progress Bars */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/70 dark:border-slate-700/60">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
          Macronutrient Reserve (NPK in kg/ha)
        </div>

        <div className="space-y-3">
          {/* Nitrogen */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Nitrogen (N)
              </span>
              <span className="text-[11px] font-semibold">
                {n} kg/ha —{" "}
                <span className={nStatus.color}>{nStatus.text}</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${Math.min((n / 400) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Phosphorus */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Phosphorus (P)
              </span>
              <span className="text-[11px] font-semibold">
                {p} kg/ha —{" "}
                <span className={pStatus.color}>{pStatus.text}</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-500 h-2 rounded-full"
                style={{ width: `${Math.min((p / 40) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Potassium */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Potassium (K)
              </span>
              <span className="text-[11px] font-semibold">
                {k} kg/ha —{" "}
                <span className={kStatus.color}>{kStatus.text}</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full"
                style={{ width: `${Math.min((k / 300) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
