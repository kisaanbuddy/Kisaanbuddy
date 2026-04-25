"use client"

import { motion } from "framer-motion"
import {
  Droplet,
  Wind,
  MapPin,
  Eye,
  Gauge,
  Sun as SunIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { UnifiedWeather } from "@/lib/weather-api"
import { useUnit, pickTemp } from "./unit-context"
import { ConditionIcon } from "./weather-icons"
import { UnitToggle } from "./UnitToggle"

interface Props {
  data: UnifiedWeather | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function WeatherCard({ data, loading, error, onRetry }: Props) {
  const { unit } = useUnit()

  return (
    <GlassCard className="h-full overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <ConditionIcon
              condition={data?.current.condition}
              isDay={data?.current.is_day ?? true}
              className="h-5 w-5 text-blue-500"
            />
            Current Weather
          </CardTitle>
          <UnitToggle />
        </div>
      </CardHeader>

      <CardContent>
        {loading && !data && (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div className="flex min-h-[10rem] flex-col items-center justify-center gap-3 text-center px-4 py-2">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground/90">
                Couldn&apos;t load weather
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {error}
              </p>
              <HintForError error={error} />
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            )}
          </div>
        )}

        {data && !error && (
          <motion.div
            key={`${data.location.lat},${data.location.lon}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2"
          >
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="text-center md:text-left">
                <div className="flex items-baseline justify-center gap-1 md:justify-start">
                  <h2 className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-7xl font-black leading-none text-transparent">
                    {Math.round(pickTemp(data.current.temp_c, data.current.temp_f, unit))}
                  </h2>
                  <span className="text-3xl font-light text-muted-foreground">°{unit}</span>
                </div>
                <p className="mt-2 text-xl capitalize text-muted-foreground">
                  {data.current.condition}
                </p>
                <p className="text-sm text-muted-foreground">
                  Feels like{" "}
                  {Math.round(
                    pickTemp(data.current.feels_like_c, data.current.feels_like_f, unit)
                  )}
                  °{unit}
                </p>
                <div className="mt-3 flex items-center gap-2 justify-center md:justify-start">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {data.location.name}
                    {data.location.country ? `, ${data.location.country}` : ""}
                  </span>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:grid-cols-2">
                <Stat
                  icon={<Wind className="h-5 w-5 text-blue-400" />}
                  label="Wind"
                  value={`${data.current.wind_kph.toFixed(1)} km/h`}
                  hint={data.current.wind_dir ?? undefined}
                />
                <Stat
                  icon={<Droplet className="h-5 w-5 text-cyan-400" />}
                  label="Humidity"
                  value={`${data.current.humidity}%`}
                />
                {data.current.pressure_mb != null && (
                  <Stat
                    icon={<Gauge className="h-5 w-5 text-purple-400" />}
                    label="Pressure"
                    value={`${Math.round(data.current.pressure_mb)} mb`}
                  />
                )}
                {data.current.visibility_km != null && (
                  <Stat
                    icon={<Eye className="h-5 w-5 text-emerald-400" />}
                    label="Visibility"
                    value={`${data.current.visibility_km.toFixed(1)} km`}
                  />
                )}
                {data.current.uv_index != null && (
                  <Stat
                    icon={<SunIcon className="h-5 w-5 text-amber-400" />}
                    label="UV Index"
                    value={`${data.current.uv_index.toFixed(1)}`}
                  />
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-white/10 px-2 py-0.5 dark:bg-black/20">
                Provider: <strong className="text-foreground">{data.provider}</strong>
              </span>
              {data.cached ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-500">
                  Cached
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-500">
                  Live
                </span>
              )}
              {data.current.observed_at && (
                <span>Updated {new Date(data.current.observed_at).toLocaleTimeString()}</span>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </GlassCard>
  )
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm dark:bg-black/20">
      <div className="mb-1.5">{icon}</div>
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

/**
 * Translates a raw API error string into a short, actionable hint.
 * Recognises: backend-down, auth-failed, rate-limit, no-providers.
 */
function HintForError({ error }: { error: string }) {
  const e = error.toLowerCase()

  let hint: string | null = null

  if (
    e.includes("failed to fetch") ||
    e.includes("networkerror") ||
    e.includes("request failed (500)") ||
    e.includes("request failed (502)") ||
    e.includes("request failed (503)") ||
    e.includes("request failed (504)")
  ) {
    hint = "Backend may be offline. Make sure run-backend.bat is running."
  } else if (e.includes("auth failed") || e.includes("401") || e.includes("403")) {
    hint = "API key rejected. Check OPENWEATHERMAP_API_KEY in backend/.env — new keys take ~10 min to activate."
  } else if (e.includes("rate limit") || e.includes("429")) {
    hint = "Too many requests. Wait a minute and retry."
  } else if (e.includes("no weather providers")) {
    hint = "No provider key configured. Set OPENWEATHERMAP_API_KEY in backend/.env."
  } else if (e.includes("all weather providers failed")) {
    hint = "All providers failed. The detail above has the specific cause."
  } else if (e.includes("location not found")) {
    hint = "Try a different city name or use your GPS location."
  }

  if (!hint) return null

  return (
    <p className="text-[11px] text-amber-500/90 max-w-md mx-auto mt-1 italic">
      Hint: {hint}
    </p>
  )
}
