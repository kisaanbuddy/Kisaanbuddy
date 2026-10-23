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
    <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Column: Greeting, Farmer Name, Location */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
              <Calendar className="w-3.5 h-3.5" />
              {currentSeason.name} ({currentSeason.window})
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                sensorOnline
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              {sensorOnline ? "Live Sensor Online" : "Sensor Standby"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>{greeting},</span>
            <span className="text-emerald-300">{userName || "Kisaan Saathi"}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-emerald-100/80 text-sm">
            {locationText ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {locationText}
              </span>
            ) : (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 underline text-xs"
              >
                <MapPin className="w-3.5 h-3.5" /> Set farm location in profile
              </Link>
            )}

            {profile?.land_holding_acres ? (
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-800/40 text-emerald-200 border border-emerald-700/50">
                {profile.land_holding_acres} Acres Total Holding
              </span>
            ) : null}
          </div>
        </div>

        {/* Right Column: Profile Completeness & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Completeness Card */}
          <div className="bg-emerald-900/60 backdrop-blur-md rounded-xl p-3.5 border border-emerald-700/40 min-w-[210px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-emerald-200 font-medium">Profile Completeness</span>
              <span className="text-emerald-300 font-bold">{completeness}%</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-800/60">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            {completeness < 100 ? (
              <Link
                href="/profile"
                className="mt-2 text-[11px] text-emerald-300 hover:text-white flex items-center justify-between font-medium transition"
              >
                <span>Add more farm details</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            ) : (
              <div className="mt-2 text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Complete Profile
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2">
            <Link
              href="/chat"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm shadow-md transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>Ask AI Advisor</span>
            </Link>

            <div className="flex gap-2 flex-1 sm:flex-none">
              {onOpenNewTaskModal && (
                <button
                  onClick={onOpenNewTaskModal}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/15 transition active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
                  <span>New Task</span>
                </button>
              )}

              {onSpeakStatus && (
                <button
                  onClick={onSpeakStatus}
                  title="Listen to status aloud"
                  className="inline-flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-emerald-300" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
