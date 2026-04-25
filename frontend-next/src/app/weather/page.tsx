"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CloudSun, Info } from "lucide-react"

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
        return "Using your precise location."
      case "ip":
        return `Using your approximate location${loc.label ? ` (${loc.label})` : ""} via IP.`
      case "manual":
        return `Showing weather for ${loc.label ?? "selected location"}.`
      case "default":
        return "Using a default location — browser geolocation is blocked."
      default:
        return null
    }
  })()

  return (
    <div className="flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl">
              <CloudSun className="h-8 w-8 text-blue-500" />
              Weather Intelligence
            </h1>
            <p className="mt-1 text-muted-foreground">
              Hyper-local conditions powered by a multi-provider engine with automatic
              fallback.
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
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
