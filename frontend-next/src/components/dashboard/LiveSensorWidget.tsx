"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Droplets,
  Thermometer,
  CloudSun,
  Volume2,
  Share2,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { CircularGauge } from "@/components/dashboard/CircularGauge";

interface LiveSensorWidgetProps {
  sensorOnline: boolean;
  moisture: number;
  temp: number;
  humidity: number;
  onSpeakStatus?: () => void;
  onShareWhatsApp?: () => void;
}

export function LiveSensorWidget({
  sensorOnline,
  moisture,
  temp,
  humidity,
  onSpeakStatus,
  onShareWhatsApp,
}: LiveSensorWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${
              sensorOnline
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <Cpu className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                IoT Farm Telemetry & Sensors
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  sensorOnline
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                }`}
              >
                {sensorOnline ? "Live Connected" : "Device Standby"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Physical ESP32 microclimate & soil probes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSpeakStatus && (
            <button
              onClick={onSpeakStatus}
              title="Voice readout"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}

          {onShareWhatsApp && (
            <button
              onClick={onShareWhatsApp}
              title="Share on WhatsApp"
              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {sensorOnline ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Moisture Gauge */}
              <div className="flex flex-col items-center">
                <CircularGauge
                  value={moisture}
                  max={100}
                  label="Soil Moisture"
                  unit="%"
                  icon={Droplets}
                  iconColor="text-emerald-500"
                  strokeColor="stroke-emerald-500"
                  advice={moisture < 30 ? "Dry (Irrigation needed)" : moisture > 60 ? "High saturation" : "Optimal range"}
                  adviceClass={moisture < 30 ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}
                />
              </div>

              {/* Temperature Gauge */}
              <div className="flex flex-col items-center">
                <CircularGauge
                  value={temp}
                  max={50}
                  label="Probe Temp"
                  unit="°C"
                  icon={Thermometer}
                  iconColor="text-amber-500"
                  strokeColor="stroke-amber-500"
                  advice={temp > 35 ? "High heat stress" : "Normal temperature"}
                  adviceClass={temp > 35 ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}
                />
              </div>

              {/* Humidity Gauge */}
              <div className="flex flex-col items-center">
                <CircularGauge
                  value={humidity}
                  max={100}
                  label="Air Humidity"
                  unit="%"
                  icon={CloudSun}
                  iconColor="text-sky-500"
                  strokeColor="stroke-sky-500"
                  advice={humidity > 70 ? "Humid (Fungal watch)" : "Favorable"}
                  adviceClass={humidity > 70 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p>
                  No hardware sensor probe is broadcasting at this moment. You can connect an
                  ESP32 soil node in{" "}
                  <Link href="/iot" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">
                    Smart Soil Monitor
                  </Link>
                  .
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500">
                  All your farm profile features, satellite weather data, AI recommendations, and crop
                  work planners are fully operational and updated in real-time.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
