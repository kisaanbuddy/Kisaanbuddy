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
    <GlassCard className="h-full bg-gradient-to-br from-indigo-500/5 via-teal-500/2 to-transparent border-indigo-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs md:text-sm font-display text-foreground font-bold">Next {slice.length || maxHours} Hours</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && slice.length === 0 ? (
          <SkeletonRow count={8} />
        ) : slice.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No hourly data available.
          </p>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2 scrollbar-thin">
            <div className="flex gap-2.5 pb-2.5">
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
                    transition={{ delay: i * 0.02, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex min-w-[76px] flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-background/30 px-3 py-3.5 text-center backdrop-blur-sm hover:border-primary/20 hover:scale-[1.03] transition-all duration-300 select-none"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      {hour}
                    </span>
                    <ConditionIcon
                      condition={h.condition}
                      className="h-5.5 w-5.5 text-sky-400 animate-float"
                    />
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(pickTemp(h.temp_c, h.temp_f, unit))}°
                    </span>
                    {h.chance_of_rain != null && h.chance_of_rain > 0 ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-teal-400">
                        <Droplet className="h-2.5 w-2.5" />
                        {h.chance_of_rain}%
                      </span>
                    ) : (
                      <span className="h-3.5" />
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
          className="h-[112px] min-w-[76px] animate-pulse rounded-xl bg-muted/30"
        />
      ))}
    </div>
  )
}
