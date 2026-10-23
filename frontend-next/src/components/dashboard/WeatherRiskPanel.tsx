"use client";

import React from "react";
import Link from "next/link";
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface WeatherRiskPanelProps {
  locationName?: string;
  temperature?: number;
  humidity?: number;
  windSpeedKmH?: number;
  rainChancePct?: number;
  condition?: string;
  soilMoisturePct?: number;
}

export function WeatherRiskPanel({
  locationName = "Your District",
  temperature = 28,
  humidity = 62,
  windSpeedKmH = 8,
  rainChancePct = 15,
  condition = "Partly Cloudy",
  soilMoisturePct,
}: WeatherRiskPanelProps) {
  // Agricultural operational risk calculations
  const sprayingRisk = React.useMemo(() => {
    if (rainChancePct > 40) {
      return {
        status: "Unsafe to Spray",
        level: "danger",
        reason: "Rain expected within 24h will wash off agrochemicals.",
      };
    }
    if (windSpeedKmH > 15) {
      return {
        status: "High Drift Risk",
        level: "warning",
        reason: `Wind at ${windSpeedKmH} km/h causes chemical drift to neighbouring plots.`,
      };
    }
    return {
      status: "Favorable for Spraying",
      level: "safe",
      reason: "Calm winds and low rain probability provide optimal spray window.",
    };
  }, [rainChancePct, windSpeedKmH]);

  const irrigationAdvice = React.useMemo(() => {
    if (rainChancePct > 50) {
      return {
        status: "Postpone Irrigation",
        level: "info",
        reason: "Substantial rainfall predicted; save energy and conserve water.",
      };
    }
    if (soilMoisturePct !== undefined && soilMoisturePct < 30) {
      return {
        status: "Irrigation Critical",
        level: "danger",
        reason: "Soil moisture is under 30%. Root zone experiencing water stress.",
      };
    }
    return {
      status: "Normal Schedule",
      level: "safe",
      reason: "Moisture balance and weather conditions are within standard limits.",
    };
  }, [rainChancePct, soilMoisturePct]);

  const pestRisk = React.useMemo(() => {
    if (humidity > 75 && temperature >= 22 && temperature <= 32) {
      return {
        status: "High Fungal Risk",
        level: "warning",
        reason: "Warm and humid microclimate accelerates rust, blight, and mildew spores.",
      };
    }
    return {
      status: "Low Pest Stress",
      level: "safe",
      reason: "Current atmospheric humidity does not favor rapid spore proliferation.",
    };
  }, [humidity, temperature]);

  const getStatusBadge = (level: string) => {
    switch (level) {
      case "safe":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "danger":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
    }
  };

  const getStatusIcon = (level: string) => {
    switch (level) {
      case "safe":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      case "danger":
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Weather & Agro-Risk Advisory
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-medium">
              {locationName}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational decisions for spraying, sowing, and irrigation suitability
          </p>
        </div>

        <Link
          href="/weather"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>7-Day Detailed</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Atmospheric Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {temperature}°C
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {condition}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {humidity}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Air Humidity
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {rainChancePct}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Rain Chance
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {windSpeedKmH} <span className="text-xs font-normal">km/h</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Wind Velocity
            </div>
          </div>
        </div>
      </div>

      {/* 3 Operational Decision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Spraying Suitability */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${getStatusBadge(
            sprayingRisk.level
          )}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">
                Pesticide / Foliar Spray
              </span>
              {getStatusIcon(sprayingRisk.level)}
            </div>
            <div className="text-sm font-bold mb-1">{sprayingRisk.status}</div>
            <p className="text-xs opacity-90 leading-relaxed">{sprayingRisk.reason}</p>
          </div>
        </div>

        {/* Irrigation Advice */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${getStatusBadge(
            irrigationAdvice.level
          )}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">
                Irrigation Suitability
              </span>
              {getStatusIcon(irrigationAdvice.level)}
            </div>
            <div className="text-sm font-bold mb-1">{irrigationAdvice.status}</div>
            <p className="text-xs opacity-90 leading-relaxed">
              {irrigationAdvice.reason}
            </p>
          </div>
        </div>

        {/* Pest & Disease Pressure */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between ${getStatusBadge(
            pestRisk.level
          )}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">
                Disease & Fungal Pressure
              </span>
              {getStatusIcon(pestRisk.level)}
            </div>
            <div className="text-sm font-bold mb-1">{pestRisk.status}</div>
            <p className="text-xs opacity-90 leading-relaxed">{pestRisk.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
