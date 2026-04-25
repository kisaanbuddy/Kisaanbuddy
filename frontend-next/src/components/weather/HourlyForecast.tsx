"use client"

import { motion } from "framer-motion"
import { Droplet } from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HourPoint } from "@/lib/weather-api"
import { useUnit, pickTemp } from "./unit-context"
import { ConditionIcon } from "./weather-icons"

interface Props {
  hours: HourPoint[]
  loading?: boolean
  maxHours?: number
}

export function HourlyForecast({ hours, loading, maxHours = 24 }: Props) {
  const { unit } = useUnit()
  const slice = hours.slice(0, maxHours)

  return (
    <GlassCard>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Next {slice.length || maxHours} Hours</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && slice.length === 0 ? (
          <SkeletonRow count={8} />
        ) : slice.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hourly data available.
          </p>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2">
            <div className="flex gap-3 pb-2">
              {slice.map((h, i) => {
                const d = new Date(h.time)
                const hour = d.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  hour12: true,
                })
                return (
                  <motion.div
                    key={h.time}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.25 }}
                    className="flex min-w-[76px] flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center backdrop-blur-sm dark:bg-black/20"
                  >
                    <span className="text-[11px] font-medium uppercase text-muted-foreground">
                      {hour}
                    </span>
                    <ConditionIcon
                      condition={h.condition}
                      className="h-6 w-6 text-blue-400"
                    />
                    <span className="text-base font-bold">
                      {Math.round(pickTemp(h.temp_c, h.temp_f, unit))}°
                    </span>
                    {h.chance_of_rain != null && h.chance_of_rain > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-cyan-500">
                        <Droplet className="h-2.5 w-2.5" />
                        {h.chance_of_rain}%
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </GlassCard>
  )
}

function SkeletonRow({ count }: { count: number }) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[112px] min-w-[76px] animate-pulse rounded-xl bg-white/5 dark:bg-black/20"
        />
      ))}
    </div>
  )
}
