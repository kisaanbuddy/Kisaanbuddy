"use client"

import React from "react"
import {
  CloudSun,
  Thermometer,
  Droplets,
  CloudRain,
  Info,
  Clock,
  ExternalLink,
  ShieldAlert,
} from "lucide-react"

export interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  condition: string
  locationName: string
  updatedAt: string
}

interface Props {
  weather: WeatherData | null
  loading?: boolean
  error?: string | null
  dict: any
}

export function WeatherIntelligenceSection({ weather, loading, error, dict }: Props) {
  // Agronomic commentary based on actual temperature, humidity and rainfall
  function getAgroClimateImpact(temp: number, humidity: number, rain: number) {
    const notes: string[] = []
    if (temp >= 28) {
      notes.push("High heat increases crop water loss; best for heat-tolerant crops like cotton, millets, and maize.")
    } else if (temp <= 20) {
      notes.push("Cool climate supports winter rabi crops like wheat, mustard, gram, and potato.")
    } else {
      notes.push("Moderate temperature range (20–28°C) is ideal for most vegetables and grain crops.")
    }

    if (humidity >= 75) {
      notes.push("High humidity (>75%) increases foliar fungal and blast spore risks; ensure good crop spacing.")
    } else if (humidity <= 45) {
      notes.push("Dry ambient air accelerates surface soil evaporation; consider mulching or drip irrigation.")
    }

    if (rain >= 150) {
      notes.push("Substantial regional rainfall is well-suited for wetland rice/paddy and sugarcane.")
    } else if (rain <= 60) {
      notes.push("Low regional rainfall calls for drought-tolerant crops (pulses/millets) or scheduled irrigation.")
    }

    return notes
  }

  const climateImpact = weather
    ? getAgroClimateImpact(weather.temperature, weather.humidity, weather.rainfall)
    : []

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
          <h2 className="text-sm font-bold text-foreground">
            {dict.weatherTitle || "Weather & Climate Intelligence"}
          </h2>
        </div>
        {weather?.updatedAt && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Updated: {weather.updatedAt}</span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="text-xs">Fetching meteorological telemetry from regional station...</p>
        </div>
      ) : error ? (
        <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Weather service unavailable</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {error}. You can still set temperature and rainfall values manually below.
            </p>
          </div>
        </div>
      ) : !weather ? (
        <div className="py-6 px-4 rounded-lg border border-dashed border-border text-center space-y-1.5">
          <CloudSun className="h-7 w-7 text-muted-foreground/60 mx-auto" />
          <p className="text-xs font-semibold text-foreground">
            No live weather loaded
          </p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Click &quot;Auto-Detect GPS&quot; or search your district in the Farm Profile section to fetch real meteorological telemetry.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Temperature */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium">Temperature</span>
                <Thermometer className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="text-lg font-bold font-mono text-foreground">
                {weather.temperature}°C
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {weather.condition}
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium">Humidity</span>
                <Droplets className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div className="text-lg font-bold font-mono text-foreground">
                {weather.humidity}%
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                Relative moisture
              </div>
            </div>

            {/* Rainfall */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-medium">Rainfall</span>
                <CloudRain className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <div className="text-lg font-bold font-mono text-foreground">
                {weather.rainfall} mm
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                Past 30-day sum
              </div>
            </div>
          </div>

          {/* Agronomic Impact Summary */}
          {climateImpact.length > 0 && (
            <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                <Info className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Agronomic Climate Advisory</span>
              </div>
              <ul className="text-[11px] text-emerald-800 dark:text-emerald-300/90 space-y-1 list-disc list-inside">
                {climateImpact.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Provenance */}
          <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>{dict.weatherSource || "Source: KisaanBuddy Weather Service & Open-Meteo"}</span>
            <span className="font-mono">{weather.locationName}</span>
          </div>
        </div>
      )}
    </div>
  )
}
