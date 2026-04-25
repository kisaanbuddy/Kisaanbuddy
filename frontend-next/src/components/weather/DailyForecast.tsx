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
    <GlassCard>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{days.length || 5}-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && days.length === 0 ? (
          <SkeletonList count={5} />
        ) : days.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No forecast data available.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
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
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="grid grid-cols-[92px_40px_1fr_88px] items-center gap-3 py-3 text-sm md:grid-cols-[120px_48px_1fr_120px]"
                >
                  <span className="font-medium">{dayLabel(d.date, i)}</span>
                  <ConditionIcon
                    condition={d.condition}
                    className="h-6 w-6 text-blue-400"
                  />
                  <div
                    className="relative h-1.5 rounded-full bg-white/10 dark:bg-black/30"
                    aria-label={`Temperatures ${Math.round(tMin)} to ${Math.round(tMax)}`}
                  >
                    <div
                      className="absolute top-0 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 font-semibold">
                    <span className="text-muted-foreground">{Math.round(tMin)}°</span>
                    <span>{Math.round(tMax)}°</span>
                  </div>
                  {(d.chance_of_rain != null || d.wind_kph != null) && (
                    <div className="col-span-full flex items-center justify-end gap-3 pr-1 text-[11px] text-muted-foreground">
                      {d.chance_of_rain != null && (
                        <span className="flex items-center gap-1 text-cyan-500">
                          <Droplet className="h-3 w-3" />
                          {d.chance_of_rain}%
                        </span>
                      )}
                      {d.wind_kph != null && (
                        <span className="flex items-center gap-1">
                          <Wind className="h-3 w-3" />
                          {d.wind_kph.toFixed(0)} km/h
                        </span>
                      )}
                      <span className="capitalize">{d.condition}</span>
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
        <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5 dark:bg-black/20" />
      ))}
    </div>
  )
}
