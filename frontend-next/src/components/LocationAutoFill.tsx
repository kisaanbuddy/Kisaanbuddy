"use client"

/**
 * LocationAutoFill — auto-fills Temperature, Humidity, and Rainfall in the
 * Crop Predictor based on the user's current GPS location or a searched city.
 *
 * Sources:
 *   - Temperature & Humidity: KrishiAI weather backend (multi-provider).
 *   - Rainfall (mm, last 30 days): Open-Meteo historical API (free, no key).
 *
 * The component is purely additive — it calls back via `onApply(...)` which
 * the Crop Predictor uses to update its existing state. No layout changes.
 */

import { useState, useRef, useEffect } from "react"
import {
  MapPin,
  Search,
  Loader2,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react"

import {
  getCurrentByCoords,
  searchLocations,
  resolveUserLocation,
  type LocationHit,
} from "@/lib/weather-api"

export type AutoFillValues = {
  temperature: number
  humidity: number
  rainfall: number
  locationLabel: string
}

type Props = {
  /** Called with new param values when the user resolves a location. */
  onApply: (vals: AutoFillValues) => void
}

export function LocationAutoFill({ onApply }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<LocationHit[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<number | null>(null)

  // Debounced location search
  useEffect(() => {
    if (!searchOpen) return
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([])
      return
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true)
      try {
        const r = await searchLocations(searchQuery.trim(), 6)
        setResults(r.results || [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [searchQuery, searchOpen])

  async function applyForCoords(lat: number, lon: number, label: string) {
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      // 1. Current weather (temp + humidity)
      const wx = await getCurrentByCoords(lat, lon)
      const temperature = Math.round(wx.current.temp_c)
      const humidity = Math.round(wx.current.humidity)

      // 2. Past-30-day rainfall sum from Open-Meteo historical (free, no key)
      const rainfall = await fetchMonthlyRainfall(lat, lon)

      const finalLabel = label || `${wx.location.name}${wx.location.country ? ", " + wx.location.country : ""}`
      onApply({ temperature, humidity, rainfall, locationLabel: finalLabel })
      setInfo(`Updated from ${finalLabel}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not fetch weather data"
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  async function handleDetect() {
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      const loc = await resolveUserLocation()
      const label =
        loc.city && loc.country
          ? `${loc.city}, ${loc.country}`
          : loc.source === "browser"
          ? "your GPS location"
          : "your IP location"
      await applyForCoords(loc.lat, loc.lon, label)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not detect location"
      setError(msg)
      setBusy(false)
    }
  }

  function handlePickResult(hit: LocationHit) {
    setSearchOpen(false)
    setSearchQuery("")
    setResults([])
    const label = hit.display_name || `${hit.name}${hit.country ? ", " + hit.country : ""}`
    void applyForCoords(hit.lat, hit.lon, label)
  }

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-semibold">Auto-fill from your location</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          temp · humidity · rainfall
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleDetect}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700 transition-all disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Use my current location
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchOpen((v) => !v)
            setError(null)
            setInfo(null)
          }}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-transparent px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-500/10 transition-all disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {searchOpen ? "Hide search" : "Search a different city"}
        </button>
      </div>

      {/* Search dropdown */}
      {searchOpen && (
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type a city name (e.g. Pune, Bengaluru, Lucknow)..."
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-9 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setResults([])
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-2 overflow-hidden rounded-lg border bg-card">
              {searching ? (
                <div className="px-3 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted-foreground">
                  No matching cities found.
                </div>
              ) : (
                <ul className="max-h-60 overflow-auto">
                  {results.map((r, i) => (
                    <li key={`${r.lat}-${r.lon}-${i}`}>
                      <button
                        type="button"
                        onClick={() => handlePickResult(r)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-emerald-500/10 transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{r.display_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status row */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
          <RefreshCw className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
      {info && !error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {info}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Open-Meteo historical rainfall — free, no key, CORS-friendly
// ---------------------------------------------------------------------------
async function fetchMonthlyRainfall(lat: number, lon: number): Promise<number> {
  try {
    const today = new Date()
    const past = new Date()
    past.setDate(today.getDate() - 30)
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    const url =
      `https://archive-api.open-meteo.com/v1/archive` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&start_date=${fmt(past)}` +
      `&end_date=${fmt(today)}` +
      `&daily=precipitation_sum` +
      `&timezone=auto`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`OpenMeteo HTTP ${res.status}`)
    const data: { daily?: { precipitation_sum?: (number | null)[] } } = await res.json()
    const arr = data?.daily?.precipitation_sum || []
    const sum = arr.reduce((acc: number, v) => acc + (typeof v === "number" ? v : 0), 0)
    // Clamp to slider range (0 - 300 mm), round to nearest 5
    const rounded = Math.max(0, Math.min(300, Math.round(sum / 5) * 5))
    return rounded
  } catch {
    // Fallback: a sensible Indian-average monthly rainfall by season
    const m = new Date().getMonth() // 0..11
    if (m >= 5 && m <= 8) return 200 // monsoon Jun-Sep
    if (m >= 9 && m <= 10) return 80 // post-monsoon
    return 30 // dry season
  }
}
