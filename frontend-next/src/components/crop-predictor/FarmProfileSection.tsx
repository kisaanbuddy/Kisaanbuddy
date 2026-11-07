"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  MapPin,
  Search,
  Loader2,
  Compass,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Droplets,
  Calendar,
  Sparkles,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  resolveUserLocation,
  searchLocations,
  type LocationHit,
  getCurrentByCoords,
} from "@/lib/weather-api"

export interface FarmProfileData {
  locationLabel: string
  lat: number | null
  lon: number | null
  state: string
  district: string
  village: string
  farmSizeAcres: number
  landType: string
  irrigationType: string
  currentCrop: string
  previousCrop: string
  sowingSeason: string
}

interface Props {
  profile: FarmProfileData
  onChange: (updated: Partial<FarmProfileData>) => void
  onWeatherResolved?: (weatherData: {
    temperature: number
    humidity: number
    rainfall: number
    condition: string
    locationName: string
    updatedAt: string
  }) => void
  dict: any
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

const LAND_TYPES = [
  { value: "loamy", label: "Loamy (Fertile & balanced)" },
  { value: "black", label: "Black Cotton Soil (Vertisol)" },
  { value: "red", label: "Red Sandy/Loam" },
  { value: "sandy", label: "Sandy (High drainage)" },
  { value: "clay", label: "Clayey (High water retention)" },
  { value: "alluvial", label: "Alluvial (River basin fertile)" },
]

const IRRIGATION_TYPES = [
  { value: "canal", label: "Canal / Tube well (Perennial)" },
  { value: "borewell", label: "Borewell / Ground water" },
  { value: "drip", label: "Drip / Sprinkler Micro-irrigation" },
  { value: "rainfed", label: "Rainfed Only (Monsoon dependent)" },
]

const SEASONS = [
  { value: "kharif", label: "Kharif (Monsoon: Jun - Oct)" },
  { value: "rabi", label: "Rabi (Winter: Oct - Mar)" },
  { value: "zaid", label: "Zaid (Summer: Mar - Jun)" },
  { value: "annual", label: "Perennial / Annual" },
]

export function FarmProfileSection({
  profile,
  onChange,
  onWeatherResolved,
  dict,
}: Props) {
  const [detecting, setDetecting] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<LocationHit[]>([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<number | null>(null)

  // Debounced location search
  useEffect(() => {
    if (!searchOpen || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchLocations(searchQuery.trim(), 5)
        setSearchResults(res.results || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [searchQuery, searchOpen])

  // Fetch actual monthly rainfall from Open-Meteo
  async function fetchMonthlyRainfall(lat: number, lon: number): Promise<number> {
    try {
      const today = new Date()
      const past = new Date()
      past.setDate(today.getDate() - 30)
      const fmt = (d: Date) => d.toISOString().slice(0, 10)
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fmt(
        past
      )}&end_date=${fmt(today)}&daily=precipitation_sum&timezone=auto`
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error("OpenMeteo unavailable")
      const data = await res.json()
      const arr = data?.daily?.precipitation_sum || []
      const sum = arr.reduce(
        (acc: number, v: number | null) => acc + (typeof v === "number" ? v : 0),
        0
      )
      return Math.max(0, Math.min(300, Math.round(sum / 5) * 5))
    } catch {
      // Sensible seasonal Indian average if Open-Meteo has connection timeout
      const m = new Date().getMonth()
      return m >= 5 && m <= 8 ? 180 : m >= 9 && m <= 10 ? 70 : 30
    }
  }

  async function resolveCoordinatesAndWeather(
    lat: number,
    lon: number,
    displayLabel: string,
    stateName?: string,
    districtName?: string
  ) {
    try {
      const wx = await getCurrentByCoords(lat, lon)
      const rainfall = await fetchMonthlyRainfall(lat, lon)
      const temp = Math.round(wx.current.temp_c)
      const humidity = Math.round(wx.current.humidity)
      const condition = wx.current.condition || "Clear"

      const guessedState =
        stateName ||
        wx.location.region ||
        (displayLabel.includes(",") ? displayLabel.split(",").slice(-2)[0]?.trim() : "")
      const guessedDistrict =
        districtName || wx.location.name || displayLabel.split(",")[0]?.trim()

      onChange({
        lat,
        lon,
        locationLabel: displayLabel,
        state: guessedState || profile.state,
        district: guessedDistrict || profile.district,
      })

      if (onWeatherResolved) {
        onWeatherResolved({
          temperature: temp,
          humidity,
          rainfall,
          condition,
          locationName: displayLabel,
          updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })
      }

      setMessage(`Resolved: ${displayLabel} (${temp}°C, ${humidity}% humidity)`)
      setError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load weather for this location"
      setError(msg)
    }
  }

  async function handleAutoDetect() {
    setDetecting(true)
    setMessage(null)
    setError(null)
    try {
      const loc = await resolveUserLocation()
      const label =
        loc.city && loc.country
          ? `${loc.city}, ${loc.country}`
          : loc.source === "browser"
          ? "GPS Detected Farm Location"
          : "IP Detected Farm Location"

      await resolveCoordinatesAndWeather(loc.lat, loc.lon, label)
    } catch (e) {
      setError("Could not detect GPS location. Please search your district.")
    } finally {
      setDetecting(false)
    }
  }

  function handleSelectSearchResult(hit: LocationHit) {
    setSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
    const label = hit.display_name || `${hit.name}, ${hit.region || ""}`
    void resolveCoordinatesAndWeather(hit.lat, hit.lon, label, hit.region || undefined, hit.name)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
            <h2 className="text-sm font-bold text-foreground">
              {dict.farmProfileTitle || "Farm Profile & Location"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dict.farmProfileSubtitle ||
              "Set your location and field traits to localize crop suitability."}
          </p>
        </div>

        {/* Location Detection Quick Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={detecting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors disabled:opacity-60"
          >
            {detecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            <span>{dict.autoDetectBtn || "Auto-Detect GPS"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => !v)
              setMessage(null)
              setError(null)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{searchOpen ? "Close Search" : dict.searchLocationBtn || "Search District"}</span>
          </button>
        </div>
      </div>

      {/* Location Search Dropdown */}
      {searchOpen && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type city or district (e.g. Ludhiana, Karnal, Nagpur)..."
              className="w-full text-xs rounded-md border border-border bg-background py-2 pl-9 pr-8 focus:border-emerald-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="rounded-md border border-border bg-card overflow-hidden">
              {searching ? (
                <div className="p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                  <span>Searching regional databases...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-2.5 text-xs text-muted-foreground">
                  No matching agricultural centers found.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-border">
                  {searchResults.map((hit, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(hit)}
                      className="w-full text-left p-2 hover:bg-muted text-xs text-foreground flex items-center justify-between"
                    >
                      <span className="font-medium truncate">{hit.display_name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono ml-2 shrink-0">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Location Pill */}
      {profile.locationLabel && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs">
          <MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <div className="flex-1 truncate">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300">
              Selected Farm Location:{" "}
            </span>
            <span className="text-emerald-800 dark:text-emerald-400 font-medium">
              {profile.locationLabel}
            </span>
            {profile.lat && profile.lon && (
              <span className="ml-2 font-mono text-[11px] text-emerald-700/80 dark:text-emerald-500">
                ({profile.lat.toFixed(2)}°N, {profile.lon.toFixed(2)}°E)
              </span>
            )}
          </div>
        </div>
      )}

      {message && !error && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Farm Profile Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
        {/* State */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.stateLabel || "State"}
          </Label>
          <select
            value={profile.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.districtLabel || "District"}
          </Label>
          <Input
            value={profile.district}
            onChange={(e) => onChange({ district: e.target.value })}
            placeholder="e.g. Ludhiana, Dharwad"
            className="h-9 text-xs"
          />
        </div>

        {/* Village / Tehsil */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.villageLabel || "Village / Tehsil"}
          </Label>
          <Input
            value={profile.village}
            onChange={(e) => onChange({ village: e.target.value })}
            placeholder="e.g. Rampur, Taluk"
            className="h-9 text-xs"
          />
        </div>

        {/* Farm Size */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.farmSizeLabel || "Farm Size (Acres)"}
          </Label>
          <Input
            type="number"
            min={0.1}
            step={0.5}
            value={profile.farmSizeAcres || ""}
            onChange={(e) => onChange({ farmSizeAcres: parseFloat(e.target.value) || 1 })}
            placeholder="e.g. 3.5"
            className="h-9 text-xs font-mono"
          />
        </div>

        {/* Land Topography / Soil Type */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.landTypeLabel || "Land Type"}
          </Label>
          <select
            value={profile.landType}
            onChange={(e) => onChange({ landType: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
          >
            {LAND_TYPES.map((lt) => (
              <option key={lt.value} value={lt.value}>
                {lt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Irrigation Facility */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.irrigationLabel || "Irrigation Availability"}
          </Label>
          <select
            value={profile.irrigationType}
            onChange={(e) => onChange({ irrigationType: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
          >
            {IRRIGATION_TYPES.map((it) => (
              <option key={it.value} value={it.value}>
                {it.label}
              </option>
            ))}
          </select>
        </div>

        {/* Previous Crop */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.previousCropLabel || "Previous Crop Grown"}
          </Label>
          <select
            value={profile.previousCrop}
            onChange={(e) => onChange({ previousCrop: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
          >
            <option value="none">{dict.lastCropNone || "None / First Cultivation"}</option>
            <option value="pulses">{dict.lastCropPulses || "Pulses / Legumes (N-fixing)"}</option>
            <option value="grains">{dict.lastCropGrains || "Paddy or Wheat"}</option>
            <option value="sugarcane">{dict.lastCropCash || "Sugarcane or Cotton"}</option>
          </select>
        </div>

        {/* Current Standing Crop */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.currentCropLabel || "Current Standing Crop"}
          </Label>
          <Input
            value={profile.currentCrop}
            onChange={(e) => onChange({ currentCrop: e.target.value })}
            placeholder="e.g. Fallow / Mustard / None"
            className="h-9 text-xs"
          />
        </div>

        {/* Sowing Season */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-foreground">
            {dict.seasonLabel || "Target Sowing Season"}
          </Label>
          <select
            value={profile.sowingSeason}
            onChange={(e) => onChange({ sowingSeason: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
          >
            {SEASONS.map((sn) => (
              <option key={sn.value} value={sn.value}>
                {sn.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
