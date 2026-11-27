"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  PlusCircle,
  Volume2,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { FarmerProfile } from "@/lib/farmer-api";

interface DashboardHeaderProps {
  userName?: string | null;
  greeting: string;
  profile?: FarmerProfile | null;
  fieldsCount: number;
  sensorOnline: boolean;
  onSpeakStatus?: () => void;
  onOpenNewTaskModal?: () => void;
}

export function DashboardHeader({
  userName,
  greeting,
  profile,
  fieldsCount,
  sensorOnline,
  onSpeakStatus,
  onOpenNewTaskModal,
}: DashboardHeaderProps) {
  // Calculate completeness score
  const completeness = React.useMemo(() => {
    let score = 20; // user account created
    if (profile?.village_name || profile?.district_name) score += 20;
    if (profile?.land_holding_acres && profile.land_holding_acres > 0) score += 20;
    if (fieldsCount > 0) score += 20;
    if (profile?.primary_crop) score += 10;
    if (profile?.has_irrigation !== undefined) score += 10;
    return Math.min(score, 100);
  }, [profile, fieldsCount]);

  // Current Season calculation (Indian agricultural calendar)
  const currentSeason = React.useMemo(() => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 6 && month <= 10) return { name: "Kharif Season", window: "Jun - Oct" };
    if (month >= 11 || month <= 3) return { name: "Rabi Season", window: "Nov - Apr" };
    return { name: "Zaid Season", window: "Apr - Jun" };
  }, []);

  const locationText = [
    profile?.village_name,
    profile?.district_name,
    profile?.state_name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 md:p-6 shadow-sm border border-stone-200 dark:border-stone-800">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left Column: Workspace Title, Farmer Name, Location */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Calendar className="w-3.5 h-3.5" />
              {currentSeason.name} ({currentSeason.window})
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                sensorOnline
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              {sensorOnline ? "Sensor Online" : "Sensor Standby"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            {userName ? `${userName}'s Farm Workspace` : "Farm Workspace"}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
            {locationText ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {locationText}
              </span>
            ) : (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline text-xs"
              >
                <MapPin className="w-3.5 h-3.5" /> Set farm location
              </Link>
            )}

            {profile?.land_holding_acres ? (
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {profile.land_holding_acres} Acres
              </span>
            ) : null}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/disease"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 transition"
          >
            Crop Doctor
          </Link>
          <Link
            href="/mandi"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 transition"
          >
            Mandi Rates
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 transition"
          >
            Marketplace
          </Link>
          <Link
            href="/chatbot"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI
          </Link>
          {onOpenNewTaskModal && (
            <button
              type="button"
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Task
            </button>
          )}
          {onSpeakStatus && (
            <button
              type="button"
              onClick={onSpeakStatus}
              title="Listen to status aloud"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {completeness < 100 && (
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <span className="text-stone-500 dark:text-stone-400 shrink-0">Profile {completeness}%</span>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
          <Link
            href="/profile"
            className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1 shrink-0"
          >
            <span>Complete farm profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
