"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Leaf, ArrowRight, CloudSun } from "lucide-react"
import Link from "next/link"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  getCurrentByCoords,
  resolveUserLocation,
  type UnifiedWeather,
} from "@/lib/weather-api"
import { UnitProvider } from "@/components/weather/unit-context"
import { WeatherCard } from "@/components/weather/WeatherCard"

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function Dashboard() {
  return (
    <UnitProvider>
      <DashboardInner />
    </UnitProvider>
  )
}

function DashboardInner() {
  const [weather, setWeather] = useState<UnifiedWeather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const r = await resolveUserLocation()
        const data = await getCurrentByCoords(r.lat, r.lon)
        if (!cancelled) setWeather(data)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load weather.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const humidityAlert = weather && weather.current.humidity >= 75
  const heatAlert = weather && weather.current.temp_c >= 38

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={FADE_UP}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-bold tracking-tight">Farm Overview</h1>
        <p className="text-lg text-muted-foreground">
          Your AI-powered agricultural command center.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          transition={{ delay: 0.1 }}
          className="col-span-1 md:col-span-2"
        >
          <WeatherCard data={weather} loading={loading} error={error} onRetry={() => location.reload()} />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          transition={{ delay: 0.2 }}
          className="col-span-1 flex flex-col gap-6"
        >
          <GlassCard className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="text-sky-500" />
                Weather Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Hourly + 7-day forecast, location search, and multi-provider fallback.
              </p>
              <Link href="/weather" className="mt-auto">
                <Button
                  variant="outline"
                  className="w-full border-sky-500/30 hover:bg-sky-500/10"
                >
                  Open Weather Hub <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="text-green-500" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Ready to plant your next season? Use our ML model to pick the highest-yield crop.
              </p>
              <Link href="/crop-predictor" className="mt-auto">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-emerald-700">
                  Predict Crop Now
                </Button>
              </Link>
            </CardContent>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={FADE_UP}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <AlertTriangle className="text-amber-500" /> Smart Farm Alerts
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {humidityAlert && (
            <AlertTile
              title="High Humidity Warning"
              body={`Humidity is ${weather!.current.humidity}% in ${weather!.location.name}. Watch for fungal infections — consider adjusting irrigation.`}
            />
          )}
          {heatAlert && (
            <AlertTile
              title="Heat Stress Alert"
              body={`${Math.round(weather!.current.temp_c)}°C right now. Shade-sensitive crops may need extra water.`}
            />
          )}
          {!humidityAlert && !heatAlert && weather && (
            <AlertTile
              title="Conditions are stable"
              body="No unusual weather risks detected for your location right now."
              tone="neutral"
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}

function AlertTile({
  title,
  body,
  tone = "warn",
}: {
  title: string
  body: string
  tone?: "warn" | "neutral"
}) {
  const cls =
    tone === "warn"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  return (
    <div className={`glass-panel flex items-start gap-3 rounded-xl border p-4 ${cls}`}>
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-1 text-sm opacity-90">{body}</p>
      </div>
    </div>
  )
}
