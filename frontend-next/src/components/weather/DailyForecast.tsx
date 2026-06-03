"use client"

import { motion } from "framer-motion"
import { Droplet, Wind } from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DayPoint } from "@/lib/weather-api"
import { useUnit, pickTemp } from "./unit-context"
import { ConditionIcon } from "./weather-icons"

interface Props {
  days: DayPoint[]
  loading?: boolean
}

function dayLabel(date: string, index: number) {
  if (index === 0) return "Today"
  if (index === 1) return "Tomorrow"
  const d = new Date(date + "T12:00:00")
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
}

export function DailyForecast({ days, loading }: Props) {
  const { unit } = useUnit()

  // Range for the bar scaling.
  const temps = days.flatMap((d) =>
    unit === "C" ? [d.temp_min_c, d.temp_max_c] : [d.temp_min_f, d.temp_max_f]
  )
  const globalMin = temps.length ? Math.min(...temps) : 0
  const globalMax = temps.length ? Math.max(...temps) : 1
  const span = Math.max(globalMax - globalMin, 1)

  return (
    <GlassCard className="bg-gradient-to-br from-teal-500/5 via-sky-500/2 to-transparent border-teal-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs md:text-sm font-display text-foreground font-bold">{days.length || 5}-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && days.length === 0 ? (
          <SkeletonList count={5} />
        ) : days.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No forecast data available.
          </p>
        ) : (
          <ul className="divide-y divide-border/20">
            {days.map((d, i) => {
              const tMin = pickTemp(d.temp_min_c, d.temp_min_f, unit)
              const tMax = pickTemp(d.temp_max_c, d.temp_max_f, unit)
              const leftPct = ((tMin - globalMin) / span) * 100
              const widthPct = Math.max(((tMax - tMin) / span) * 100, 8)
              return (
                <motion.li
                  key={d.date}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-[92px_40px_1fr_88px] items-center gap-3 py-3.5 text-xs md:grid-cols-[120px_48px_1fr_120px] select-none"
                >
                  <span className="font-semibold text-foreground/90">{dayLabel(d.date, i)}</span>
                  <ConditionIcon
                    condition={d.condition}
                    className="h-5 w-5 text-sky-400 animate-float"
                  />
                  <div
                    className="relative h-1.5 rounded-full bg-secondary/50 border border-border/20 shadow-inner"
                    aria-label={`Temperatures ${Math.round(tMin)} to ${Math.round(tMax)}`}
                  >
                    <div
                      className="absolute top-0 h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-500 shadow-sm"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 font-bold text-xs">
                    <span className="text-muted-foreground">{Math.round(tMin)}°</span>
                    <span className="text-foreground">{Math.round(tMax)}°</span>
                  </div>
                  {(d.chance_of_rain != null || d.wind_kph != null) && (
                    <div className="col-span-full flex items-center justify-end gap-3.5 pr-1 text-[10px] font-medium text-muted-foreground/80">
                      {d.chance_of_rain != null && d.chance_of_rain > 0 && (
                        <span className="flex items-center gap-1 text-teal-400">
                          <Droplet className="h-3 w-3" />
                          {d.chance_of_rain}% chance of rain
                        </span>
                      )}
                      {d.wind_kph != null && (
                        <span className="flex items-center gap-1">
                          <Wind className="h-3 w-3 text-sky-400" />
                          {d.wind_kph.toFixed(0)} km/h wind
                        </span>
                      )}
                      <span className="capitalize font-semibold text-foreground/70">{d.condition}</span>
                    </div>
                  )}
                </motion.li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </GlassCard>
  )
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-xl bg-muted/30" />
      ))}
    </div>
  )
}
