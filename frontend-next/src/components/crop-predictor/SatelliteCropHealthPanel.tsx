"use client"

import React, { useState } from "react"
import {
  Satellite,
  Activity,
  Droplets,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Compass,
  Layers,
  Radio,
  Eye,
  Info,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  SatelliteObservation,
  RadarObservation,
  HistoricalTimelineItem,
  PolygonAreaResult,
} from "@/lib/satellite-api"

interface SatelliteCropHealthPanelProps {
  observation: SatelliteObservation | null
  radarObservation: RadarObservation | null
  historicalTimeline: HistoricalTimelineItem[]
  agronomicInterpretation: string[]
  calculatedArea?: PolygonAreaResult | null
  hasCustomBoundary: boolean
  onApplyCalculatedArea?: (acres: number) => void
  onRefreshSatellite?: () => void
  loading?: boolean
}

export function SatelliteCropHealthPanel({
  observation,
  radarObservation,
  historicalTimeline,
  agronomicInterpretation,
  calculatedArea,
  hasCustomBoundary,
  onApplyCalculatedArea,
  onRefreshSatellite,
  loading = false,
}: SatelliteCropHealthPanelProps) {
  const [activeTab, setActiveTab] = useState<"indices" | "timeline" | "radar" | "methodology">("indices")

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground">Querying Copernicus Sentinel Satellite Constellation...</div>
            <div className="text-xs text-muted-foreground">Searching Sentinel-2 L2A optical and Sentinel-1 SAR radar passes.</div>
          </div>
        </div>
      </div>
    )
  }

  if (!observation) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs text-center space-y-3">
        <Satellite className="h-10 w-10 text-muted-foreground/60 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">No Satellite Pass Loaded Yet</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Provide your farm location or mark your farm boundary to retrieve authentic 10-meter multispectral observations.
          </p>
        </div>
        {onRefreshSatellite && (
          <Button
            size="sm"
            onClick={onRefreshSatellite}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
          >
            Retrieve Satellite Passes
          </Button>
        )}
      </div>
    )
  }

  const { indices, field_stats } = observation
  const meanNdvi = field_stats.mean_ndvi
  const meanNdwi = field_stats.mean_ndwi
  const meanEvi = field_stats.mean_evi

  return (
    <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Sentinel-2 Vegetation & Canopy Health</span>
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded border border-border text-3xs bg-background text-foreground font-mono">10m Resolution</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Acquired: <b>{observation.acquisition_date}</b> ({observation.acquisition_datetime.slice(11, 16)} UTC) &bull; Cloud: <b>{observation.cloud_cover_pct}%</b>
          </p>
        </div>

        {/* Sync area CTA if custom boundary exists */}
        {hasCustomBoundary && calculatedArea && onApplyCalculatedArea && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApplyCalculatedArea(calculatedArea.acres)}
            className="text-xs h-7.5 px-3 border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Compass className="h-3 w-3 mr-1.5" />
            Sync {calculatedArea.acres} Acres to Profile
          </Button>
        )}
      </div>

      {/* Primary 3 Scientific Index Cards */}
      <div className="p-4 sm:p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. NDVI Card */}
          <div className="rounded-lg border border-border p-3.5 bg-background space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                NDVI (Vegetation Vigor)
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded border text-3xs font-semibold ${
                  meanNdvi >= 0.6
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : meanNdvi >= 0.4
                    ? "bg-lime-50 text-lime-800 border-lime-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}
              >
                {field_stats.stress_risk} Stress
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{meanNdvi}</span>
              <span className="text-2xs text-muted-foreground font-mono">
                [{field_stats.min_ndvi} &ndash; {field_stats.max_ndvi}]
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${Math.max(5, Math.min(100, meanNdvi * 100))}%` }}
                />
              </div>
              <p className="text-3xs text-muted-foreground leading-tight">{field_stats.health_status}</p>
            </div>
          </div>

          {/* 2. NDWI Card */}
          <div className="rounded-lg border border-border p-3.5 bg-background space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                NDWI (Canopy Water)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded border text-3xs font-semibold bg-sky-50 text-sky-800 border-sky-300">Gao (1996)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-sky-800 dark:text-sky-300">{meanNdwi}</span>
              <span className="text-2xs text-muted-foreground">Water Index</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full transition-all"
                  style={{ width: `${Math.max(5, Math.min(100, (meanNdwi + 0.3) * 100))}%` }}
                />
              </div>
              <p className="text-3xs text-muted-foreground leading-tight">
                {meanNdwi > 0.2
                  ? "Optimal root-zone leaf hydration"
                  : meanNdwi >= 0.05
                  ? "Moderate plant hydration"
                  : "Low plant liquid water content"}
              </p>
            </div>
          </div>

          {/* 3. EVI Card */}
          <div className="rounded-lg border border-border p-3.5 bg-background space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                EVI (Canopy Biomass)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded border text-3xs font-semibold bg-teal-50 text-teal-800 border-teal-300">Atm. Corrected</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-800 dark:text-teal-300">{meanEvi}</span>
              <span className="text-2xs text-muted-foreground">Biomass</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all"
                  style={{ width: `${Math.max(5, Math.min(100, meanEvi * 100))}%` }}
                />
              </div>
              <p className="text-3xs text-muted-foreground leading-tight">
                Resilient against dense canopy saturation
              </p>
            </div>
          </div>
        </div>

        {/* Spatial Variation & Field Uniformity Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-muted/20 text-xs">
          <Activity className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Field Canopy Variation: {field_stats.spatial_variation_pct}%</span>
              <span className="text-2xs text-muted-foreground">({field_stats.valid_pixels_pct}% clear pixel coverage)</span>
            </div>
            <p className="text-muted-foreground text-2xs leading-relaxed">
              {field_stats.spatial_variation_pct > 25
                ? "Noticeable variation detected across your field. Differences could stem from uneven micro-irrigation, soil texture transitions, or localized crop stand."
                : "Canopy growth across your field is uniform. Vigorous vegetative growth with minimal spatial anomaly."}
            </p>
          </div>
        </div>

        {/* Agronomic Interpretation Bullets */}
        {agronomicInterpretation.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-700" />
              Agronomic Insights & Guidance
            </div>
            <div className="space-y-1">
              {agronomicInterpretation.map((msg, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-md bg-muted/10 text-xs text-foreground/90 border border-border/40"
                >
                  <span className="text-emerald-700 font-bold shrink-0">&bull;</span>
                  <span className="leading-relaxed">{msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs for Historical Timeline, Sentinel-1 Radar, and Scientific Methodology */}
        <div className="space-y-3 pt-2">
          <div className="flex border-b border-border gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("indices")}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === "indices"
                  ? "border-emerald-700 text-emerald-800 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Formula Specs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === "timeline"
                  ? "border-emerald-700 text-emerald-800 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Temporal Passes ({historicalTimeline.length})
            </button>
            {radarObservation && (
              <button
                type="button"
                onClick={() => setActiveTab("radar")}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === "radar"
                    ? "border-emerald-700 text-emerald-800 dark:text-emerald-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Sentinel-1 SAR Radar
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("methodology")}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === "methodology"
                  ? "border-emerald-700 text-emerald-800 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Reality First Notice
            </button>
          </div>

          {/* Subtab: Formula Specs */}
          {activeTab === "indices" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-2xs">
              <div className="p-2.5 rounded-lg border border-border bg-background space-y-1">
                <div className="font-bold text-foreground">NDVI Spectral Formula</div>
                <div className="font-mono text-emerald-800 dark:text-emerald-300">
                  (B08 - B04) / (B08 + B04)
                </div>
                <div className="text-muted-foreground">NIR (842nm) vs Red (665nm)</div>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-background space-y-1">
                <div className="font-bold text-foreground">NDWI (Gao 1996)</div>
                <div className="font-mono text-sky-800 dark:text-sky-300">
                  (B08 - B11) / (B08 + B11)
                </div>
                <div className="text-muted-foreground">NIR (842nm) vs SWIR-1 (1610nm)</div>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-background space-y-1">
                <div className="font-bold text-foreground">EVI Formula</div>
                <div className="font-mono text-teal-800 dark:text-teal-300">
                  2.5*(B8-B4)/(B8+6*B4-7.5*B2+1)
                </div>
                <div className="text-muted-foreground">Compensates atmospheric aerosols</div>
              </div>
            </div>
          )}

          {/* Subtab: Historical Timeline */}
          {activeTab === "timeline" && (
            <div className="space-y-2">
              <div className="text-2xs text-muted-foreground">
                Copernicus Sentinel-2 5-day revisit sequence over your coordinates:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {historicalTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-border bg-background space-y-1 text-2xs"
                  >
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>{item.date}</span>
                      <span className="text-3xs text-muted-foreground">{item.cloud_cover_pct}% cloud</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">NDVI:</span>
                      <span className="font-bold text-emerald-700">{item.mean_ndvi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">NDWI:</span>
                      <span className="font-bold text-sky-700">{item.mean_ndwi}</span>
                    </div>
                    <div className="text-3xs text-muted-foreground pt-0.5 truncate">
                      {item.stage_estimate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab: Sentinel-1 Radar */}
          {activeTab === "radar" && radarObservation && (
            <div className="p-3 rounded-lg border border-border bg-purple-50/40 dark:bg-purple-950/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-purple-700" />
                  <span>Sentinel-1 SAR C-Band Radar Pass</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded border text-3xs bg-purple-100 text-purple-800 border-purple-300">{radarObservation.polarizations.join("/")} Polarization</span>
              </div>
              <p className="text-muted-foreground text-2xs leading-relaxed">
                {radarObservation.interpretation}
              </p>
              <div className="text-3xs text-muted-foreground font-mono">
                Observation Date: {radarObservation.acquisition_date} &bull; Sensor: {radarObservation.satellite} ({radarObservation.instrument})
              </div>
            </div>
          )}

          {/* Subtab: Reality First Policy */}
          {activeTab === "methodology" && (
            <div className="p-3 rounded-lg border border-border bg-muted/20 text-2xs space-y-1.5 text-muted-foreground leading-relaxed">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-emerald-700" />
                <span>KisaanBuddy Reality-First Agronomic Principle</span>
              </div>
              <p>
                1. <b>Zero Simulated Maps:</b> Satellite tiles are requested directly from Copernicus Sentinel via Microsoft Planetary Computer STAC.
              </p>
              <p>
                2. <b>No Single-Index Diagnosis:</b> We do not diagnose specific crop fungal/viral diseases solely from NDVI. An anomaly indicates reduced chlorophyll/biomass; physical in-field scouting is recommended to confirm cause.
              </p>
              <p>
                3. <b>Authentic Cloud Fallback:</b> When cloud cover exceeds 25%, the system transparently indicates cloud obstruction and serves the nearest clear optical pass.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
