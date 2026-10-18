"use client";

import React from "react";
import Link from "next/link";
import {
  Sprout,
  Plus,
  MapPin,
  Calendar,
  Droplets,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { FarmerField } from "@/lib/farmer-api";

interface MyFarmCropsSectionProps {
  fields: FarmerField[];
  onOpenAddField?: () => void;
}

export function MyFarmCropsSection({ fields, onOpenAddField }: MyFarmCropsSectionProps) {
  // Helper to estimate crop growth stage based on sowing date and harvest date
  const getGrowthProgress = (sowingDateStr?: string | null, harvestDateStr?: string | null) => {
    if (!sowingDateStr) return { stage: "Stage Not Tracked", percent: 0, daysPassed: 0 };
    const sowing = new Date(sowingDateStr).getTime();
    const now = Date.now();
    const harvest = harvestDateStr
      ? new Date(harvestDateStr).getTime()
      : sowing + 120 * 24 * 60 * 60 * 1000; // default ~120 days crop cycle

    const totalDuration = Math.max(harvest - sowing, 1);
    const elapsed = Math.max(now - sowing, 0);
    const percent = Math.min(Math.round((elapsed / totalDuration) * 100), 100);
    const daysPassed = Math.round(elapsed / (24 * 60 * 60 * 1000));

    let stage = "Early Vegetative";
    if (percent > 85) stage = "Maturity / Harvest";
    else if (percent > 65) stage = "Grain / Fruit Formation";
    else if (percent > 40) stage = "Flowering / Tillering";
    else if (percent > 20) stage = "Active Vegetative";

    return { stage, percent, daysPassed };
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              My Farm & Active Crops
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {fields.length} {fields.length === 1 ? "Plot" : "Plots"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor plot status, vegetative stages, and harvest progression
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/profile?tab=fields"
            className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>Manage All Plots</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/profile?tab=fields&action=new"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plot</span>
          </Link>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            No Farm Plots Registered Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Add your agricultural land plots to track sowing dates, receive crop-specific
            irrigation & fertilizer alerts, and get market buyer connections.
          </p>
          <Link
            href="/profile?tab=fields&action=new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Plot</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => {
            const cropName = field.current_crop || "Unspecified Crop";
            const variety = field.crop_variety ? `(${field.crop_variety})` : "";
            const { stage, percent, daysPassed } = getGrowthProgress(
              field.sowing_date,
              field.expected_harvest
            );

            return (
              <div
                key={field.id}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-colors group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{field.field_name || "Plot #" + field.id}</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {field.acreage ? `${field.acreage} ${field.area_unit || "Acres"}` : "Size not set"}
                        {field.season ? ` • ${field.season}` : ""}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                      {cropName}
                    </span>
                  </div>

                  {/* Growth Stage Progress */}
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200/70 dark:border-slate-700/60 my-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{stage}</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      <span>{daysPassed > 0 ? `Day ${daysPassed} since sowing` : "Sowing date not set"}</span>
                      {field.expected_harvest && (
                        <span>Harvest: {field.expected_harvest}</span>
                      )}
                    </div>
                  </div>

                  {/* Badges: Soil & Irrigation */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    {field.soil_type && (
                      <span className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Soil: {field.soil_type}
                      </span>
                    )}
                    {field.irrigation_type && (
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> {field.irrigation_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Plot Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <Link
                    href={`/chat?query=${encodeURIComponent(
                      `What should I do for my ${cropName} in ${field.field_name || "plot"} at stage ${stage}?`
                    )}`}
                    className="text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Crop Advice</span>
                  </Link>

                  <Link
                    href={`/profile?tab=fields&edit=${field.id}`}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-0.5"
                  >
                    <span>Edit</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
