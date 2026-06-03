"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CloudSun, Info } from "lucide-react"
import { useLanguage } from '@/lib/language'

import {
  getCurrentByCoords,
  getForecastByCoords,
  resolveUserLocation,
  WeatherAPIError,
  type ForecastBundle,
  type LocationHit,
  type ResolvedLocation,
  type UnifiedWeather,
} from "@/lib/weather-api"

import { UnitProvider } from "@/components/weather/unit-context"
import { WeatherCard } from "@/components/weather/WeatherCard"
import { LocationSearch } from "@/components/weather/LocationSearch"
import { HourlyForecast } from "@/components/weather/HourlyForecast"
import { DailyForecast } from "@/components/weather/DailyForecast"

interface ActiveLocation {
  lat: number
  lon: number
  label?: string
  source: ResolvedLocation["source"] | "manual"
}

export default function WeatherPage() {
  const { t } = useLanguage()
  return (
    <UnitProvider>
      <WeatherPageInner />
    </UnitProvider>
  )
}

function WeatherPageInner() {
  const [loc, setLoc] = useState<ActiveLocation | null>(null)
  const [resolving, setResolving] = useState(true)

  const [current, setCurrent] = useState<UnifiedWeather | null>(null)
  const [forecast, setForecast] = useState<ForecastBundle | null>(null)

  const [loadingCurrent, setLoadingCurrent] = useState(false)
  const [loadingForecast, setLoadingForecast] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  // Initial resolve.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const r = await resolveUserLocation()
      if (!mounted) return
      setLoc({
        lat: r.lat,
        lon: r.lon,
        label: r.city,
        source: r.source,
      })
      setResolving(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch whenever location changes.
  const fetchAll = useCallback(async (target: ActiveLocation) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setError(null)
    setLoadingCurrent(true)
    setLoadingForecast(true)

    try {
      const [cur, fc] = await Promise.all([
        getCurrentByCoords(target.lat, target.lon, ctrl.signal),
        getForecastByCoords(target.lat, target.lon, 7, ctrl.signal),
      ])
      setCurrent(cur)
      setForecast(fc)
    } catch (err: any) {
      if (err?.name === "AbortError") return
      const msg =
        err instanceof WeatherAPIError
          ? err.message
          : err?.message || "Failed to load weather. Please try again."
      setError(msg)
    } finally {
      setLoadingCurrent(false)
      setLoadingForecast(false)
    }
  }, [])

  useEffect(() => {
    if (loc) fetchAll(loc)
  }, [loc, fetchAll])

  const onSelectLocation = (hit: LocationHit) => {
    setLoc({
      lat: hit.lat,
      lon: hit.lon,
      label: hit.display_name,
      source: "manual",
    })
  }

  const onUseCurrentLocation = async () => {
    setResolving(true)
    const r = await resolveUserLocation()
    setLoc({ lat: r.lat, lon: r.lon, label: r.city, source: r.source })
    setResolving(false)
  }

  const sourceNote = (() => {
    if (resolving) return "Detecting your location…"
    if (!loc) return null
    switch (loc.source) {
      case "browser":
        return "Using your precise browser geolocation."
      case "ip":
        return `Using your approximate location${loc.label ? ` (${loc.label})` : ""} via network IP.`
      case "manual":
        return `Showing weather details for ${loc.label ?? "selected location"}.`
      case "default":
        return "Using a default location — browser geolocation is blocked."
      default:
        return null
    }
  })()

  return (
    <div className="flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-display font-bold tracking-tight text-foreground md:text-4xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 shadow-sm animate-float">
                <CloudSun className="h-6 w-6" />
              </div>
              Weather Intelligence
            </h1>
            <p className="mt-2 text-muted-foreground text-xs md:text-sm max-w-xl leading-relaxed">
              Hyper-local conditions powered by a multi-provider agriculture weather engine with automatic failovers.
            </p>
          </div>
          <div className="w-full md:w-96">
            <LocationSearch
              onSelect={onSelectLocation}
              onUseCurrentLocation={onUseCurrentLocation}
            />
          </div>
        </div>

        {sourceNote && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/15 border border-primary/5 rounded-xl px-3.5 py-2 w-fit backdrop-blur-sm shadow-sm select-none animate-fade-in font-medium">
            <Info className="h-4 w-4 text-emerald-500 shrink-0" />
            {sourceNote}
          </div>
        )}
      </motion.header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeatherCard
            data={current}
            loading={loadingCurrent}
            error={error}
            onRetry={() => loc && fetchAll(loc)}
          />
        </div>
        <div className="lg:col-span-1">
          <HourlyForecast
            hours={forecast?.hourly ?? []}
            loading={loadingForecast}
            maxHours={12}
          />
        </div>
      </div>

      <DailyForecast days={forecast?.daily ?? []} loading={loadingForecast} />
    </div>
  )
}
