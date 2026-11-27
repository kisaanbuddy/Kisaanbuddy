"use client";

import React from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Info,
} from "lucide-react";
import type { ContextualWeatherAlert } from "@/lib/weather-api";

interface WeatherRiskPanelProps {
  available?: boolean;
  locationName?: string;
  temperature?: number | null;
  humidity?: number | null;
  windSpeedKmH?: number | null;
  rainChancePct?: number | null;
  condition?: string | null;
  soilMoisturePct?: number;
  provider?: string | null;
  fetchedAt?: string | null;
  alerts?: ContextualWeatherAlert[];
}

export function WeatherRiskPanel({
  available = false,
  locationName = "Your District",
  temperature,
  humidity,
  windSpeedKmH,
  rainChancePct,
  condition,
  soilMoisturePct,
  provider,
  fetchedAt,
  alerts = [],
}: WeatherRiskPanelProps) {
  const sprayingRisk = React.useMemo(() => {
    if (!available || rainChancePct == null || windSpeedKmH == null) {
      return null;
    }
    if (rainChancePct > 40) {
      return {
        status: "Unsafe to Spray",
        level: "danger",
        reason: "Rain expected within 24–48h may wash off agrochemicals.",
      };
    }
    if (windSpeedKmH > 15) {
      return {
        status: "High Drift Risk",
        level: "warning",
        reason: `Wind at ${Math.round(windSpeedKmH)} km/h causes chemical drift to neighbouring plots.`,
      };
    }
    return {
      status: "Favorable for Spraying",
      level: "safe",
      reason: "Calm winds and low rain probability provide a suitable spray window.",
    };
  }, [available, rainChancePct, windSpeedKmH]);

  const irrigationAdvice = React.useMemo(() => {
    if (soilMoisturePct !== undefined && soilMoisturePct < 30) {
      return {
        status: "Irrigation Critical",
        level: "danger",
        reason: "Measured soil moisture is under 30%. Root zone experiencing water stress.",
      };
    }
    if (!available || rainChancePct == null) {
      return null;
    }
    if (rainChancePct > 50) {
      return {
        status: "Postpone Irrigation",
        level: "info",
        reason: "Substantial rainfall predicted; save energy and avoid waterlogging.",
      };
    }
    return {
      status: "Normal Schedule",
      level: "safe",
      reason: "Moisture balance and weather conditions are within standard limits.",
    };
  }, [available, rainChancePct, soilMoisturePct]);

  const pestRisk = React.useMemo(() => {
    if (!available || humidity == null || temperature == null) {
      return null;
    }
    if (humidity >= 75 && temperature >= 20 && temperature <= 32) {
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
  }, [available, humidity, temperature]);

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

  if (!available && !irrigationAdvice) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Agro-Risk &amp; Field Operations Advisory
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Live meteorological telemetry is currently unavailable for {locationName}. Rely on local field observations before spraying or irrigation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Agro-Risk &amp; Smart Farming Alerts
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-medium">
              {locationName}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Contextual operational guidance for spraying, irrigation, and disease risk
          </p>
        </div>
      </div>

      {/* Significant Smart Farming Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.type}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                alert.severity === "high"
                  ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                  : "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  {alert.title}{" "}
                  <span className="font-normal opacity-75">({alert.forecast_window})</span>
                </div>
                <p className="mt-0.5 opacity-90 leading-relaxed">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compact Atmospheric Context Strip (only when real data is available) */}
      {available && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <CloudSun className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {temperature != null ? `${Math.round(temperature)}°C` : "—"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {condition || "Observed"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {humidity != null ? `${humidity}%` : "—"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Humidity</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {rainChancePct != null ? `${Math.round(rainChancePct)}%` : "—"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">48h Rain Prob</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {windSpeedKmH != null ? `${Math.round(windSpeedKmH)} km/h` : "—"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Wind</div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Decision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sprayingRisk && (
          <div className={`p-3.5 rounded-xl border ${getStatusBadge(sprayingRisk.level)}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Spraying</span>
              {getStatusIcon(sprayingRisk.level)}
            </div>
            <div className="text-sm font-bold mb-1">{sprayingRisk.status}</div>
            <p className="text-xs opacity-90 leading-relaxed">{sprayingRisk.reason}</p>
          </div>
        )}

        {irrigationAdvice && (
          <div className={`p-3.5 rounded-xl border ${getStatusBadge(irrigationAdvice.level)}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Irrigation</span>
              {getStatusIcon(irrigationAdvice.level)}
            </div>
            <div className="text-sm font-bold mb-1">{irrigationAdvice.status}</div>
            <p className="text-xs opacity-90 leading-relaxed">{irrigationAdvice.reason}</p>
          </div>
        )}

        {pestRisk && (
          <div className={`p-3.5 rounded-xl border ${getStatusBadge(pestRisk.level)}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Disease Risk</span>
              {getStatusIcon(pestRisk.level)}
            </div>
            <div className="text-sm font-bold mb-1">{pestRisk.status}</div>
            <p className="text-xs opacity-90 leading-relaxed">{pestRisk.reason}</p>
          </div>
        )}
      </div>

      {available && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Source: {provider || "Live Meteorological Feed"}
          {fetchedAt ? ` • Updated ${new Date(fetchedAt).toLocaleString()}` : ""} • Forecasts beyond 24h carry meteorological uncertainty.
        </p>
      )}
    </div>
  );
}
