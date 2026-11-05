"use client"

import React, { useState } from "react"
import dynamic from "next/dynamic"
import { MobileSatelliteView } from "@/components/mobile/MobileSatelliteView"
import { Satellite, Layers, RefreshCw, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/lib/language"
import type { SatelliteObservation, RadarObservation, PolygonAreaResult } from "@/lib/satellite-api"

const SatelliteFarmMap = dynamic(
  () => import("@/components/crop-predictor/SatelliteFarmMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-2xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold">Loading Copernicus Satellite GIS Workspace...</span>
      </div>
    ),
  }
)

export default function SatelliteClient() {
  const { lang } = useLanguage()
  const [lat, setLat] = useState(28.6139)
  const [lon, setLon] = useState(77.2090)
  const [coords, setCoords] = useState<[number, number][]>([
    [77.2085, 28.6135],
    [77.2095, 28.6135],
    [77.2095, 28.6145],
    [77.2085, 28.6145],
  ])
  const [observation, setObservation] = useState<SatelliteObservation | null>(null)
  const [radar, setRadar] = useState<RadarObservation | null>(null)
  const [areaInfo, setAreaInfo] = useState<PolygonAreaResult | null>(null)

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Mobile Dedicated Experience */}
      <div className="block md:hidden">
        <MobileSatelliteView initialLat={lat} initialLon={lon} initialCoords={coords} />
      </div>

      {/* Desktop Experience (Unchanged full GIS workspace) */}
      <div className="hidden md:block space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              <Satellite className="h-4 w-4 text-emerald-600" />
              <span>Copernicus Sentinel-2 & Sentinel-1 GIS</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">
              Satellite Farm Intelligence & Vegetation Monitoring
            </h1>
            <p className="text-xs text-muted-foreground">
              Direct remote sensing observations. Monitor field-level NDVI vigor, NDWI moisture, and Sentinel-1 SAR radar backscatter.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Planetary Computer STAC</span>
          </div>
        </div>

        <div className="h-[560px] rounded-2xl overflow-hidden border border-border shadow-xs">
          <SatelliteFarmMap
            lat={lat}
            lon={lon}
            polygonCoordinates={coords}
            onPolygonChange={setCoords}
            onAreaCalculated={setAreaInfo}
            observation={observation}
            radarObservation={radar}
          />
        </div>
      </div>
    </div>
  )
}
