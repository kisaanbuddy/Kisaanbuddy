/**
 * Typed client for the KrishiAI weather backend.
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

// -------- Fetch helper --------

class WeatherAPIError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "WeatherAPIError"
    this.status = status
  }
}

async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
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
  return res.json() as Promise<T>
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

// -------- Browser geolocation (with IP fallback) --------

export interface ResolvedLocation {
  lat: number
  lon: number
  source: "browser" | "ip" | "default"
  city?: string
  country?: string
}

/**
 * Resolves the user's current location using this chain:
 *   1. navigator.geolocation (if granted within `timeoutMs`)
 *   2. /api/weather/geoip
 *   3. Hardcoded Delhi fallback
 *
 * Never throws — always returns a location.
 */
export async function resolveUserLocation(timeoutMs = 4000): Promise<ResolvedLocation> {
  // Try the browser first.
  if (typeof navigator !== "undefined" && navigator.geolocation) {
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
    if (browserLoc) return browserLoc
  }

  // IP-based fallback.
  try {
    const info = await geoipLookup()
    return {
      lat: info.lat,
      lon: info.lon,
      city: info.city,
      country: info.country,
      source: info.fallback ? "default" : "ip",
    }
  } catch {
    return { lat: 28.6139, lon: 77.209, city: "Delhi", country: "India", source: "default" }
  }
}

export { WeatherAPIError }
