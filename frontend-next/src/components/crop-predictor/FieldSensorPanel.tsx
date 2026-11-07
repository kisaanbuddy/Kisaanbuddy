"use client"

import React, { useState, useEffect } from "react"
import {
  Cpu,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Droplets,
  Radio,
  Check,
} from "lucide-react"

export interface SensorTelemetry {
  deviceId: string
  temperature: number | null
  humidity: number | null
  soilMoisture: number | null
  soilTemperature: number | null
  soilPh: number | null
  nitrogen: number | null
  phosphorus: number | null
  potassium: number | null
  receivedAt: number | null
  ageSeconds: number | null
}

interface Props {
  onApplySensorValues: (values: {
    temperature: number
    humidity: number
    soilMoisture?: number | null
    soilTemperature?: number | null
  }) => void
  dict: any
}

type SensorState = "idle" | "connecting" | "connected" | "disconnected" | "unavailable" | "error"

export function FieldSensorPanel({ onApplySensorValues, dict }: Props) {
  const [status, setStatus] = useState<SensorState>("idle")
  const [telemetry, setTelemetry] = useState<SensorTelemetry | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [useSensorInPrediction, setUseSensorInPrediction] = useState(false)
  const [polling, setPolling] = useState(false)

  async function fetchSensorReading(isRetry = false) {
    setStatus("connecting")
    setErrorMessage(null)
    setPolling(true)

    try {
      // 1. Check health / online status
      const res = await fetch(`/api/sensor/latest?t=${Date.now()}`, { cache: "no-store" })

      if (res.status === 404) {
        setStatus("unavailable")
        setTelemetry(null)
        setErrorMessage("No active ESP32 node found broadcasting to this farm gateway.")
        return
      }

      if (!res.ok) {
        setStatus("error")
        setErrorMessage(`Sensor gateway returned error (HTTP ${res.status})`)
        return
      }

      const data = await res.json()

      const tel: SensorTelemetry = {
        deviceId: data.device_id || "krishiai-node-1",
        temperature: typeof data.temperature === "number" ? Math.round(data.temperature * 10) / 10 : null,
        humidity: typeof data.humidity === "number" ? Math.round(data.humidity * 10) / 10 : null,
        soilMoisture: typeof data.soil_moisture === "number" ? Math.round(data.soil_moisture) : null,
        soilTemperature: typeof data.soil_temperature === "number" ? Math.round(data.soil_temperature * 10) / 10 : null,
        soilPh: typeof data.soil_ph === "number" ? data.soil_ph : null,
        nitrogen: typeof data.nitrogen === "number" ? data.nitrogen : null,
        phosphorus: typeof data.phosphorus === "number" ? data.phosphorus : null,
        potassium: typeof data.potassium === "number" ? data.potassium : null,
        receivedAt: data.received_at || null,
        ageSeconds: typeof data.age_seconds === "number" ? Math.round(data.age_seconds) : null,
      }

      setTelemetry(tel)

      // If data is older than 180 seconds, mark disconnected/stale
      if (tel.ageSeconds !== null && tel.ageSeconds > 180) {
        setStatus("disconnected")
      } else {
        setStatus("connected")
        if (useSensorInPrediction && tel.temperature !== null && tel.humidity !== null) {
          onApplySensorValues({
            temperature: Math.round(tel.temperature),
            humidity: Math.round(tel.humidity),
            soilMoisture: tel.soilMoisture,
            soilTemperature: tel.soilTemperature,
          })
        }
      }
    } catch (err) {
      setStatus("error")
      setErrorMessage("Could not connect to sensor gateway. Verify local Wi-Fi or IoT bridge.")
    } finally {
      setPolling(false)
    }
  }

  // Handle toggling "Use sensor readings in analysis"
  function handleToggleSensorSync() {
    const nextVal = !useSensorInPrediction
    setUseSensorInPrediction(nextVal)
    if (nextVal && telemetry && telemetry.temperature !== null && telemetry.humidity !== null) {
      onApplySensorValues({
        temperature: Math.round(telemetry.temperature),
        humidity: Math.round(telemetry.humidity),
        soilMoisture: telemetry.soilMoisture,
        soilTemperature: telemetry.soilTemperature,
      })
    }
  }

  return (
    <div className="rounded-xl border border-sky-500/20 bg-sky-50/30 dark:bg-sky-950/20 p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-500/20 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold text-foreground">
              {dict.sensorTitle || "Field Sensor Integration (ESP32 IoT)"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {dict.sensorSubtitle ||
              "Real-time telemetry from on-farm microclimate nodes measuring soil and ambient parameters."}
          </p>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {status === "connected" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected &amp; Live
            </span>
          )}

          {status === "connecting" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
              Connecting...
            </span>
          )}

          {status === "disconnected" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
              <WifiOff className="h-3 w-3" />
              Node Disconnected (Stale)
            </span>
          )}

          {status === "unavailable" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <Radio className="h-3 w-3" />
              No Hardware Node
            </span>
          )}

          {status === "error" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              <AlertCircle className="h-3 w-3" />
              Communication Error
            </span>
          )}

          <button
            type="button"
            onClick={() => fetchSensorReading(false)}
            disabled={polling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors disabled:opacity-60"
          >
            {polling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span>{status === "error" || status === "disconnected" ? "Retry Connection" : "Read Sensor Data"}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      {status === "idle" ? (
        <div className="py-6 px-4 rounded-lg border border-dashed border-sky-300 dark:border-sky-800/40 text-center space-y-2">
          <Radio className="h-7 w-7 text-sky-500/70 mx-auto" />
          <p className="text-xs font-medium text-foreground">
            Connect your ESP32 soil &amp; weather node for live field measurements
          </p>
          <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
            Click &quot;Read Sensor Data&quot; to query your on-farm telemetry node.
            If you do not have hardware deployed, the system uses manual parameters or localized weather models.
          </p>
        </div>
      ) : status === "unavailable" ? (
        <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background/50 text-xs text-muted-foreground flex items-start gap-2.5">
          <Radio className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Sensor hardware not detected</p>
            <p className="text-[11px] mt-0.5">
              {errorMessage || "No ESP32 nodes are currently sending telemetry. You can continue using manual inputs or GPS-derived weather."}
            </p>
          </div>
        </div>
      ) : status === "error" ? (
        <div className="p-3.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Sensor reading failed</p>
            <p className="text-[11px] mt-0.5">
              {errorMessage}. Check if the ESP32 node is powered on and within range of Wi-Fi or LoRa gateway.
            </p>
          </div>
        </div>
      ) : telemetry ? (
        <div className="space-y-3">
          {/* Node Info bar */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-background/70 px-3 py-1.5 rounded-md border border-sky-200/50 dark:border-sky-900/30">
            <span className="font-mono">
              Device ID: <strong className="text-foreground">{telemetry.deviceId}</strong>
            </span>
            {telemetry.ageSeconds !== null && (
              <span className="font-mono">
                Last reading:{" "}
                <strong className="text-foreground">
                  {telemetry.ageSeconds < 60
                    ? `${telemetry.ageSeconds}s ago`
                    : `${Math.round(telemetry.ageSeconds / 60)}m ago`}
                </strong>
              </span>
            )}
          </div>

          {/* Telemetry Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Ambient Temperature */}
            <div className="p-3 rounded-lg border border-sky-200/60 dark:border-sky-900/40 bg-background/80 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Air Temp</span>
                <Thermometer className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="text-lg font-bold font-mono text-foreground">
                {telemetry.temperature !== null ? `${telemetry.temperature}°C` : "N/A"}
              </div>
              <div className="text-[10px] text-muted-foreground">DHT22 Ambient</div>
            </div>

            {/* Ambient Humidity */}
            <div className="p-3 rounded-lg border border-sky-200/60 dark:border-sky-900/40 bg-background/80 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Air Humidity</span>
                <Droplets className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div className="text-lg font-bold font-mono text-foreground">
                {telemetry.humidity !== null ? `${telemetry.humidity}%` : "N/A"}
              </div>
              <div className="text-[10px] text-muted-foreground">Relative Humidity</div>
            </div>

            {/* Soil Moisture */}
            <div className="p-3 rounded-lg border border-sky-200/60 dark:border-sky-900/40 bg-background/80 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Soil Moisture</span>
                <Droplets className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="text-lg font-bold font-mono text-foreground">
                {telemetry.soilMoisture !== null ? `${telemetry.soilMoisture}%` : "N/A"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {telemetry.soilMoisture !== null ? "Capacitive probe" : "Sensor not attached"}
              </div>
            </div>

            {/* Soil Temperature */}
            <div className="p-3 rounded-lg border border-sky-200/60 dark:border-sky-900/40 bg-background/80 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Soil Temp</span>
                <Thermometer className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <div className="text-lg font-bold font-mono text-foreground">
                {telemetry.soilTemperature !== null ? `${telemetry.soilTemperature}°C` : "N/A"}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {telemetry.soilTemperature !== null ? "DS18B20 probe" : "Sensor not attached"}
              </div>
            </div>
          </div>

          {/* Sync Option Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleToggleSensorSync}
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                useSensorInPrediction
                  ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <div
                className={`h-4 w-4 rounded flex items-center justify-center border ${
                  useSensorInPrediction
                    ? "bg-white text-sky-700 border-white"
                    : "border-muted-foreground/40 bg-transparent"
                }`}
              >
                {useSensorInPrediction && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>{dict.useSensorValuesToggle || "Use Verified Sensor Readings in Analysis"}</span>
            </button>

            {useSensorInPrediction && (
              <span className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">
                Analysis synced with live sensor
              </span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
