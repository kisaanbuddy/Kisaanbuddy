"use client"

/**
 * SensorAutoFill — auto-fills Temperature & Humidity in the Crop Predictor
 * from the live ESP32 field sensor node.
 *
 * Source: KrishiAI backend  GET /api/sensor/latest  (fed by the ESP32 via
 * POST /api/sensor/ingest). Requests go through the Next.js rewrite, so a
 * relative path works in dev and prod.
 *
 * Purely additive: it calls back via `onApply(...)` which the Crop Predictor
 * uses to update its existing slider state. No layout of the form changes.
 */

import { useState } from "react"
import { Cpu, RefreshCw, Loader2, CheckCircle2, Droplets, Thermometer } from "lucide-react"

export type SensorValues = {
  temperature: number
  humidity: number
}

// Mirrors backend StoredReading (api/sensor.py)
type LatestReading = {
  device_id: string
  temperature: number | null
  humidity: number | null
  soil_temperature: number | null
  soil_moisture: number | null
  raw_moisture: number | null
  received_at: number
  age_seconds: number
}

type Props = {
  /** Called with new climate values when a live reading is fetched. */
  onApply: (vals: SensorValues) => void
}

export function SensorAutoFill({ onApply }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reading, setReading] = useState<LatestReading | null>(null)

  async function handleFetch() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/sensor/latest?t=${Date.now()}`, { cache: "no-store" })
      if (res.status === 404) {
        throw new Error("No sensor data yet — make sure the ESP32 node is powered on and connected.")
      }
      if (!res.ok) throw new Error(`Sensor backend error (HTTP ${res.status})`)

      const data: LatestReading = await res.json()
      setReading(data)

      const next: Partial<SensorValues> = {}
      if (typeof data.temperature === "number") next.temperature = Math.round(data.temperature)
      if (typeof data.humidity === "number") next.humidity = Math.round(data.humidity)

      if (next.temperature === undefined && next.humidity === undefined) {
        throw new Error("Sensor connected but the DHT22 reading was invalid — check wiring.")
      }

      onApply({
        temperature: next.temperature ?? 25,
        humidity: next.humidity ?? 60,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not reach the sensor node"
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const stale = reading ? reading.age_seconds > 120 : false

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="h-4 w-4 text-sky-500" />
        <span className="text-sm font-semibold">Auto-fill from field sensor</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          temp · humidity (live)
        </span>
      </div>

      <button
        type="button"
        onClick={handleFetch}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-sky-700 transition-all disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Reading sensor...
          </>
        ) : (
          <>
            <Cpu className="h-4 w-4" /> Read live data from ESP32
          </>
        )}
      </button>

      {/* Reading detail (incl. soil values that have no slider) */}
      {reading && !error && (
        <div className="mt-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 mb-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Applied from <span className="font-mono">{reading.device_id}</span>
            <span className="ml-auto text-muted-foreground">
              {stale ? `last seen ${Math.round(reading.age_seconds)}s ago` : "live"}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
            {reading.temperature != null && (
              <span className="flex items-center gap-1">
                <Thermometer className="h-3 w-3" /> {reading.temperature.toFixed(1)}°C air
              </span>
            )}
            {reading.humidity != null && (
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" /> {reading.humidity.toFixed(0)}% humidity
              </span>
            )}
            {reading.soil_moisture != null && (
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-amber-500" /> {reading.soil_moisture.toFixed(0)}% soil
              </span>
            )}
            {reading.soil_temperature != null && (
              <span className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-amber-500" /> {reading.soil_temperature.toFixed(1)}°C soil
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
          <RefreshCw className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
