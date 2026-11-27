/**
 * Typed client for the KisaanBuddy weather backend.
 *
 * All requests go through the Next.js rewrite (/api/weather/*  ->  :8000/api/weather/*).
 * Every function throws on non-2xx with a friendly message so callers can just
 * catch and surface `err.message` in the UI.
 */

// -------- Types (mirror backend/schemas/weather.py) --------

export interface Location {
  name: string
  region?: string | null
  country?: string | null
  lat: number
  lon: number
  timezone?: string | null
}

export interface LocationHit {
  name: string
  region?: string | null
  country?: string | null
  lat: number
  lon: number
  display_name: string
}

export interface CurrentWeather {
  temp_c: number
  temp_f: number
  feels_like_c: number
  feels_like_f: number
  humidity: number
  pressure_mb?: number | null
  wind_kph: number
  wind_mph: number
  wind_dir?: string | null
  wind_deg?: number | null
  condition: string
  condition_code?: string | null
  icon?: string | null
  visibility_km?: number | null
  uv_index?: number | null
  cloud_cover?: number | null
  is_day?: boolean | null
  observed_at?: string | null
}

export interface UnifiedWeather {
  location: Location
  current: CurrentWeather
  provider: string
  cached: boolean
  fetched_at: string
}

export interface HourPoint {
  time: string
  temp_c: number
  temp_f: number
  condition: string
  icon?: string | null
  humidity?: number | null
  wind_kph?: number | null
  chance_of_rain?: number | null
}

export interface DayPoint {
  date: string
  temp_min_c: number
  temp_max_c: number
  temp_min_f: number
  temp_max_f: number
  condition: string
  icon?: string | null
  humidity?: number | null
  wind_kph?: number | null
  chance_of_rain?: number | null
  sunrise?: string | null
  sunset?: string | null
}

export interface ForecastBundle {
  location: Location
  hourly: HourPoint[]
  daily: DayPoint[]
  provider: string
  cached: boolean
  fetched_at: string
}

export interface GeoIPResult {
  ip?: string
  lat: number
  lon: number
  city?: string
  region?: string
  country?: string
  country_code?: string
  timezone?: string
  fallback?: boolean
}

export interface ProviderHealth {
  name: string
  configured: boolean
  priority: number
}

export interface HealthResponse {
  providers: ProviderHealth[]
  cache_backend: string
  rate_limit: string
}

export interface ContextualWeatherAlert {
  type: string
  severity: "high" | "medium" | "low"
  title: string
  message: string
  forecast_window: string
}

export interface ContextualWeatherAdvisory {
  status: string
  title: string
  message: string
}

export interface ContextualWeatherResponse {
  available: boolean
  reason?: string
  location?: {
    name: string
    region?: string | null
    country?: string | null
    lat?: number | null
    lon?: number | null
  }
  snapshot?: {
    temp_c?: number | null
    humidity?: number | null
    wind_kph?: number | null
    condition?: string | null
    max_rain_prob_48h?: number | null
  }
  provider?: string | null
  observed_at?: string | null
  fetched_at: string
  cached: boolean
  uncertainty_note?: string
  alerts: ContextualWeatherAlert[]
  advisories: Record<string, ContextualWeatherAdvisory>
  activity_focus?: string | null
}

// -------- Client-side deduplication & TTL cache --------

const CLIENT_TTL_MS = 5 * 60 * 1000
const LOCATION_TTL_MS = 30 * 60 * 1000
const responseCache = new Map<string, { expiresAt: number; data: unknown }>()
const inflightRequests = new Map<string, Promise<unknown>>()

class WeatherAPIError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "WeatherAPIError"
    this.status = status
  }
}

async function apiGet<T>(path: string, signal?: AbortSignal, ttlMs = CLIENT_TTL_MS): Promise<T> {
  const now = Date.now()
  const cached = responseCache.get(path)
  if (cached && cached.expiresAt > now) {
    return cached.data as T
  }

  const inflight = inflightRequests.get(path)
  if (inflight) {
    return inflight as Promise<T>
  }

  const req = (async () => {
    const res = await fetch(path, { signal, cache: "no-store" })
    if (!res.ok) {
      let detail = `Request failed (${res.status})`
      try {
        const j = await res.json()
        if (j?.detail) detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail)
      } catch {
        /* ignore parse errors */
      }
      throw new WeatherAPIError(detail, res.status)
    }
    const data = (await res.json()) as T
    responseCache.set(path, { expiresAt: Date.now() + ttlMs, data })
    return data
  })()

  inflightRequests.set(path, req)
  try {
    return await req
  } finally {
    inflightRequests.delete(path)
  }
}

export function getContextualWeather(
  params: { lat?: number; lon?: number; q?: string; crop?: string; activity?: string },
  signal?: AbortSignal
): Promise<ContextualWeatherResponse> {
  const sp = new URLSearchParams()
  if (params.lat !== undefined && params.lon !== undefined) {
    sp.set("lat", params.lat.toFixed(2))
    sp.set("lon", params.lon.toFixed(2))
  }
  if (params.q) sp.set("q", params.q)
  if (params.crop) sp.set("crop", params.crop)
  if (params.activity) sp.set("activity", params.activity)
  return apiGet<ContextualWeatherResponse>(`/api/weather/contextual?${sp.toString()}`, signal)
}

// -------- Public API --------

export function getCurrentByCoords(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<UnifiedWeather> {
  return apiGet<UnifiedWeather>(`/api/weather/current?lat=${lat}&lon=${lon}`, signal)
}

export function getCurrentByCity(q: string, signal?: AbortSignal): Promise<UnifiedWeather> {
  return apiGet<UnifiedWeather>(`/api/weather/current?q=${encodeURIComponent(q)}`, signal)
}

export function getForecastByCoords(
  lat: number,
  lon: number,
  days = 5,
  signal?: AbortSignal
): Promise<ForecastBundle> {
  return apiGet<ForecastBundle>(
    `/api/weather/forecast?lat=${lat}&lon=${lon}&days=${days}`,
    signal
  )
}

export function searchLocations(
  q: string,
  limit = 5,
  signal?: AbortSignal
): Promise<{ results: LocationHit[]; query: string }> {
  return apiGet<{ results: LocationHit[]; query: string }>(
    `/api/weather/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    signal
  )
}

export function geoipLookup(signal?: AbortSignal): Promise<GeoIPResult> {
  return apiGet<GeoIPResult>(`/api/weather/geoip`, signal)
}

export function getWeatherHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiGet<HealthResponse>(`/api/weather/health`, signal)
}

// -------- Browser geolocation (with manual override & IP fallback) --------

export interface ResolvedLocation {
  lat: number
  lon: number
  source: "manual" | "browser" | "ip" | "default"
  city?: string
  country?: string
}

const MANUAL_LOC_KEY = "kb_manual_weather_location"
let cachedResolvedLoc: { expiresAt: number; loc: ResolvedLocation } | null = null

export function getManualWeatherLocation(): ResolvedLocation | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(MANUAL_LOC_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.lat === "number" && typeof parsed?.lon === "number") {
      return { ...parsed, source: "manual" }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function setManualWeatherLocation(loc: { lat: number; lon: number; city?: string; country?: string }): void {
  if (typeof window === "undefined") return
  const saved: ResolvedLocation = { ...loc, source: "manual" }
  window.localStorage.setItem(MANUAL_LOC_KEY, JSON.stringify(saved))
  cachedResolvedLoc = { expiresAt: Date.now() + LOCATION_TTL_MS, loc: saved }
}

export function clearManualWeatherLocation(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(MANUAL_LOC_KEY)
  cachedResolvedLoc = null
}

/**
 * Resolves the user's current location using this chain:
 *   1. Manual user selection (saved in localStorage)
 *   2. Cached session location
 *   3. navigator.geolocation (only if permission is not denied)
 *   4. /api/weather/geoip
 *   5. Delhi fallback
 */
export async function resolveUserLocation(timeoutMs = 4000): Promise<ResolvedLocation> {
  const manual = getManualWeatherLocation()
  if (manual) return manual

  if (cachedResolvedLoc && cachedResolvedLoc.expiresAt > Date.now()) {
    return cachedResolvedLoc.loc
  }

  let geoDenied = false
  if (typeof navigator !== "undefined" && navigator.permissions?.query) {
    try {
      const perm = await navigator.permissions.query({ name: "geolocation" as PermissionName })
      if (perm.state === "denied") geoDenied = true
    } catch {
      /* ignore */
    }
  }

  if (!geoDenied && typeof navigator !== "undefined" && navigator.geolocation) {
    const browserLoc = await new Promise<ResolvedLocation | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), timeoutMs)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer)
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            source: "browser",
          })
        },
        () => {
          clearTimeout(timer)
          resolve(null)
        },
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
      )
    })
    if (browserLoc) {
      cachedResolvedLoc = { expiresAt: Date.now() + LOCATION_TTL_MS, loc: browserLoc }
      return browserLoc
    }
  }

  try {
    const info = await geoipLookup()
    const loc: ResolvedLocation = {
      lat: info.lat,
      lon: info.lon,
      city: info.city,
      country: info.country,
      source: info.fallback ? "default" : "ip",
    }
    cachedResolvedLoc = { expiresAt: Date.now() + LOCATION_TTL_MS, loc }
    return loc
  } catch {
    return { lat: 28.6139, lon: 77.209, city: "Delhi", country: "India", source: "default" }
  }
}

export { WeatherAPIError }
