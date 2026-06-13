"use client"
import { useLanguage } from '@/lib/language'

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
  Sunrise,
  Sunset,
} from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { UnifiedWeather } from "@/lib/weather-api"
import { useUnit, pickTemp } from "./unit-context"
import { ConditionIcon } from "./weather-icons"
import { UnitToggle } from "./UnitToggle"
import { WEATHER_T, translateCondition, translateWindDir, type Lang } from "@/lib/weather-translations"

interface Props {
  data: UnifiedWeather | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  sunrise?: string | null
  sunset?: string | null
}

export function WeatherCard({ data, loading, error, onRetry, sunrise, sunset }: Props) {
  const { lang } = useLanguage()
  const activeLang = (lang as Lang) in WEATHER_T ? (lang as Lang) : "hi"
  const t = WEATHER_T[activeLang]
  const { unit } = useUnit()

  return (
    <GlassCard className="h-full overflow-hidden bg-gradient-to-br from-sky-500/5 via-indigo-500/2 to-transparent border-sky-500/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xs md:text-sm font-display text-foreground font-bold">
            <ConditionIcon
              condition={data?.current.condition}
              isDay={data?.current.is_day ?? true}
              className="h-5 w-5 text-sky-400 animate-float"
            />
            {t.current_weather}
          </CardTitle>
          <UnitToggle />
        </div>
      </CardHeader>

      <CardContent>
        {loading && !data && (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-center px-4 py-2">
            <AlertCircle className="h-8 w-8 text-red-400 animate-bounce" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground/90">
                {t.load_fail}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {error}
              </p>
              <HintForError error={error} />
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 text-xs h-8 border-border/60 hover:bg-emerald-500/5 hover:text-emerald-500">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> {t.retry}
              </Button>
            )}
          </div>
        )}

        {data && !error && (
          <motion.div
            key={`${data.location.lat},${data.location.lon}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2"
          >
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="text-center md:text-left space-y-2">
                <div className="flex items-baseline justify-center gap-0.5 md:justify-start">
                  <h2 className="bg-gradient-to-r from-sky-400 via-blue-400 to-teal-400 bg-clip-text text-6xl md:text-7xl font-display font-black leading-none text-transparent">
                    {Math.round(pickTemp(data.current.temp_c, data.current.temp_f, unit))}
                  </h2>
                  <span className="text-2xl font-light text-muted-foreground/80">°{unit}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold capitalize text-foreground">
                    {translateCondition(data.current.condition, activeLang)}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    {t.feels_like}{" "}
                    <strong className="text-foreground font-semibold">
                      {Math.round(
                        pickTemp(data.current.feels_like_c, data.current.feels_like_f, unit)
                      )}
                      °{unit}
                    </strong>
                  </p>
                </div>
                <div className="pt-1 flex items-center gap-1.5 justify-center md:justify-start text-xs font-semibold text-muted-foreground select-none">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span>
                    {data.location.name}
                    {data.location.country ? `, ${data.location.country}` : ""}
                  </span>
                </div>
              </div>

              {/* Grid of Weather Stats */}
              <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:w-auto md:grid-cols-2 lg:grid-cols-3">
                <Stat
                  icon={<Wind className="h-4.5 w-4.5 text-sky-400" />}
                  label={t.wind_speed}
                  value={`${data.current.wind_kph.toFixed(0)} km/h`}
                  hint={translateWindDir(data.current.wind_dir, activeLang) || undefined}
                />
                <Stat
                  icon={<Droplet className="h-4.5 w-4.5 text-teal-400" />}
                  label={t.humidity}
                  value={`${data.current.humidity}%`}
                />
                {data.current.pressure_mb != null && (
                  <Stat
                    icon={<Gauge className="h-4.5 w-4.5 text-indigo-400" />}
                    label={t.pressure}
                    value={`${Math.round(data.current.pressure_mb)} mb`}
                  />
                )}
                {data.current.visibility_km != null && (
                  <Stat
                    icon={<Eye className="h-4.5 w-4.5 text-emerald-400" />}
                    label={t.visibility}
                    value={`${data.current.visibility_km.toFixed(0)} km`}
                  />
                )}
                {data.current.uv_index != null && (
                  <Stat
                    icon={<SunIcon className="h-4.5 w-4.5 text-amber-400 animate-pulse rounded-full" />}
                    label={t.uv_index}
                    value={`${data.current.uv_index.toFixed(0)}`}
                  />
                )}
                {sunrise && (
                  <Stat
                    icon={<Sunrise className="h-4.5 w-4.5 text-amber-500" />}
                    label={t.sunrise}
                    value={sunrise}
                  />
                )}
                {sunset && (
                  <Stat
                    icon={<Sunset className="h-4.5 w-4.5 text-orange-500" />}
                    label={t.sunset}
                    value={sunset}
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground/60 select-none">
              <span className="rounded-lg bg-background/50 border border-border/30 px-2 py-1 font-semibold">
                {t.data_source}: <span className="text-foreground">{data.provider}</span>
              </span>
              {data.cached ? (
                <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-amber-500 font-bold">
                  {t.cached}
                </span>
              ) : (
                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-emerald-500 font-bold">
                  {t.live}
                </span>
              )}
              {data.current.observed_at && (
                <span className="font-semibold">{t.observed_at} {new Date(data.current.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
    <div className="flex flex-col items-center rounded-xl border border-border/40 bg-background/30 p-2.5 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-background/50 border border-border/20 shadow-inner">{icon}</div>
      <span className="text-xs font-semibold text-foreground tracking-tight">{value}</span>
      <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/85 mt-0.5 text-center leading-none">{label}</span>
      {hint && <span className="text-[9px] text-muted-foreground/60 mt-0.5 font-semibold">{hint}</span>}
    </div>
  )
}

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
    <p className="text-[11px] text-amber-500/90 max-w-sm mx-auto mt-1 italic">
      Hint: {hint}
    </p>
  )
}
