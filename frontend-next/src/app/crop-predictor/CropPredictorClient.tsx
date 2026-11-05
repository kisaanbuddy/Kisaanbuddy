"use client"

import React, { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Sprout,
  Activity,
  Layers,
  Thermometer,
  CloudSun,
  Cpu,
  TestTube,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Bookmark,
  Share2,
  Satellite,
  Compass,
} from "lucide-react"

import { useLanguage } from "@/lib/language"
import { CROP_PREDICTOR_I18N } from "@/lib/crop-predictor-i18n"
import { trackEvent } from "@/lib/analytics"
import { useAuth } from "@/lib/auth"
import { recommendationsApi } from "@/lib/farmer-api"

// Modular Sections
import { FarmProfileSection, type FarmProfileData } from "@/components/crop-predictor/FarmProfileSection"
import { WeatherIntelligenceSection, type WeatherData } from "@/components/crop-predictor/WeatherIntelligenceSection"
import { FieldSensorPanel } from "@/components/crop-predictor/FieldSensorPanel"
import { SmartSoilAnalysis, type SoilParameters } from "@/components/crop-predictor/SmartSoilAnalysis"
import {
  CropResultsDashboard,
  type PredictionResultData,
} from "@/components/crop-predictor/CropResultsDashboard"
import { PreviousAnalysesSection } from "@/components/crop-predictor/PreviousAnalysesSection"
import { MobileCropPredictor } from "@/components/mobile/MobileCropPredictor"
import { AskFarmAIInline } from "@/components/crop-predictor/AskFarmAIInline"
import { SatelliteCropHealthPanel } from "@/components/crop-predictor/SatelliteCropHealthPanel"
import {
  fetchFieldSatelliteIntelligence,
  type SatelliteObservation,
  type RadarObservation,
  type HistoricalTimelineItem,
  type PolygonAreaResult,
} from "@/lib/satellite-api"

// Dynamically import Leaflet Map (client-only)
const SatelliteFarmMap = dynamic(
  () => import("@/components/crop-predictor/SatelliteFarmMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-3">
        <div className="h-7 w-7 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Loading Copernicus Satellite Engine...</span>
      </div>
    ),
  }
)

export default function CropPredictorClient() {
  const searchParams = useSearchParams()
  const { lang, t } = useLanguage()
  const dict = CROP_PREDICTOR_I18N[lang] || CROP_PREDICTOR_I18N.en
  const { user, ready: authReady } = useAuth()

  // 1. Farm Profile & Location
  const [farmProfile, setFarmProfile] = useState<FarmProfileData>({
    locationLabel: "",
    lat: null,
    lon: null,
    state: "",
    district: "",
    village: "",
    farmSizeAcres: 2.5,
    landType: "loamy",
    irrigationType: "canal",
    currentCrop: "",
    previousCrop: "none",
    sowingSeason: "kharif",
  })

  // 2. Weather Data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)

  // 3. Satellite Intelligence State
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([])
  const [satelliteObservation, setSatelliteObservation] = useState<SatelliteObservation | null>(null)
  const [radarObservation, setRadarObservation] = useState<RadarObservation | null>(null)
  const [historicalTimeline, setHistoricalTimeline] = useState<HistoricalTimelineItem[]>([])
  const [agronomicInterpretation, setAgronomicInterpretation] = useState<string[]>([])
  const [calculatedArea, setCalculatedArea] = useState<PolygonAreaResult | null>(null)
  const [satelliteLoading, setSatelliteLoading] = useState(false)
  const [satelliteError, setSatelliteError] = useState<string | null>(null)

  // 4. Soil Parameters
  const [soilParams, setSoilParams] = useState<SoilParameters>({
    N: 85,
    P: 42,
    K: 48,
    ph: 6.8,
    moisture: 50,
    electricalConductivity: 0.6,
    organicCarbon: 0.58,
    soilTemperature: 24,
  })

  // 5. Climate values for the ML model (driven by weather / sensor / defaults)
  const [climateParams, setClimateParams] = useState({
    temperature: 26,
    humidity: 72,
    rainfall: 140,
  })

  // 6. Prediction Engine states
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<PredictionResultData | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // 7. Persistence & History states
  const [savingAnalysis, setSavingAnalysis] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  // Ref for auto-scrolling to results after analysis
  const resultsRef = useRef<HTMLDivElement>(null)

  // Load authentic satellite observation for coordinates & boundary
  const loadSatelliteData = async (lat: number, lon: number, polygon?: [number, number][]) => {
    setSatelliteLoading(true)
    setSatelliteError(null)
    try {
      const data = await fetchFieldSatelliteIntelligence({
        lat,
        lon,
        polygonCoordinates: polygon && polygon.length >= 3 ? polygon : undefined,
        soilType: farmProfile.landType || "loamy",
        cropName: farmProfile.currentCrop || undefined,
      })
      setSatelliteObservation(data.current_observation)
      setRadarObservation(data.radar_observation)
      setHistoricalTimeline(data.historical_timeline)
      setAgronomicInterpretation(data.agronomic_interpretation)
    } catch (err) {
      console.error("Satellite fetch error:", err)
      setSatelliteError(err instanceof Error ? err.message : "Failed to load satellite data")
    } finally {
      setSatelliteLoading(false)
    }
  }

  // Load satellite intelligence when location is set or updated
  useEffect(() => {
    const lat = farmProfile.lat || 30.9010 // Default Indian agricultural benchmark if unselected
    const lon = farmProfile.lon || 75.8573
    void loadSatelliteData(lat, lon, polygonCoords)
  }, [farmProfile.lat, farmProfile.lon, farmProfile.landType, farmProfile.currentCrop])

  // Sync weather resolved from Location section
  const handleWeatherResolved = (wx: WeatherData) => {
    setWeatherData(wx)
    setClimateParams((prev) => ({
      ...prev,
      temperature: wx.temperature,
      humidity: wx.humidity,
      rainfall: wx.rainfall,
    }))
  }

  // Sync polygon change from interactive map
  const handlePolygonChange = (newCoords: [number, number][]) => {
    setPolygonCoords(newCoords)
    const lat = farmProfile.lat || 30.9010
    const lon = farmProfile.lon || 75.8573
    void loadSatelliteData(lat, lon, newCoords)
  }

  // Sync calculated area into farmProfile
  const handleSyncCalculatedArea = (acres: number) => {
    setFarmProfile((prev) => ({
      ...prev,
      farmSizeAcres: acres,
    }))
  }

  // Sync live ESP32 sensor values
  const handleSensorValues = (vals: {
    temperature: number
    humidity: number
    soilMoisture?: number | null
    soilTemperature?: number | null
  }) => {
    setClimateParams((prev) => ({
      ...prev,
      temperature: vals.temperature,
      humidity: vals.humidity,
    }))
    setSoilParams((prev) => ({
      ...prev,
      ...(typeof vals.soilMoisture === "number" ? { moisture: vals.soilMoisture } : {}),
      ...(typeof vals.soilTemperature === "number" ? { soilTemperature: vals.soilTemperature } : {}),
    }))
  }

  // PRIMARY ACTION: "Analyze My Farm"
  const handleAnalyzeFarm = async () => {
    setAnalyzing(true)
    setAnalysisError(null)
    setSaveSuccess(false)

    // Build payload combining soil, climate, and satellite inputs
    const payload = {
      N: soilParams.N,
      P: soilParams.P,
      K: soilParams.K,
      temperature: climateParams.temperature,
      humidity: climateParams.humidity,
      ph: soilParams.ph,
      rainfall: climateParams.rainfall,
      satellite_ndvi: satelliteObservation?.field_stats?.mean_ndvi,
      satellite_ndwi: satelliteObservation?.field_stats?.mean_ndwi,
      satellite_evi: satelliteObservation?.field_stats?.mean_evi,
    }

    try {
      const res = await fetch("/api/ml/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Agricultural evaluation engine returned status ${res.status}`)
      }

      const data: PredictionResultData = await res.json()
      setResult(data)

      trackEvent({
        type: "crop_prediction",
        inputs: payload,
        result: data.recommended_crop,
      })

      // Smooth scroll down to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 150)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to compute crop suitability"
      setAnalysisError(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  // Voice navigation trigger
  useEffect(() => {
    if (searchParams.get("voice") !== "1") return
    void handleAnalyzeFarm()
  }, [])

  // Save Analysis to Farmer Recommendations in Database
  const handleSaveAnalysis = async () => {
    if (!result || !user) return
    setSavingAnalysis(true)
    try {
      const topCropItem = result.ranked_recommendations?.[0]
      await recommendationsApi.create({
        title: `Crop Match: ${topCropItem?.display_name || result.recommended_crop}`,
        crop_name: topCropItem?.display_name || result.recommended_crop,
        explanation: `Agronomic evaluation for ${farmProfile.locationLabel || "your farmland"} with suitability score of ${topCropItem?.suitability_score || Math.round(result.confidence * 100)}%.`,
        reason: topCropItem?.reasons?.[0] || "Optimal balance of soil NPK and regional temperature.",
        data_used: JSON.stringify({
          params: { ...soilParams, ...climateParams },
          farmProfile,
          satellite: satelliteObservation
            ? {
                date: satelliteObservation.acquisition_date,
                ndvi: satelliteObservation.field_stats.mean_ndvi,
                ndwi: satelliteObservation.field_stats.mean_ndwi,
              }
            : null,
          resultSummary: {
            crop: topCropItem?.display_name || result.recommended_crop,
            score: topCropItem?.suitability_score || Math.round(result.confidence * 100),
          },
        }),
        recommended_action: result.next_steps?.[0] || "Select certified seed variety and adjust basal fertilizer.",
        confidence: `${topCropItem?.suitability_score || Math.round(result.confidence * 100)}%`,
        source: "Copernicus Sentinel & ICAR Agronomic Norms",
        category: "next_season",
        status: "pending",
      })

      setSaveSuccess(true)
      setHistoryRefreshKey((k) => k + 1)
    } catch {
      // ignore
    } finally {
      setSavingAnalysis(false)
    }
  }

  // Reuse Saved Parameters from History
  const handleReuseParams = (saved: any) => {
    if (!saved) return
    if (saved.params) {
      setSoilParams((prev) => ({
        ...prev,
        N: saved.params.N ?? prev.N,
        P: saved.params.P ?? prev.P,
        K: saved.params.K ?? prev.K,
        ph: saved.params.ph ?? prev.ph,
        moisture: saved.params.moisture ?? prev.moisture,
        electricalConductivity: saved.params.electricalConductivity ?? prev.electricalConductivity,
        organicCarbon: saved.params.organicCarbon ?? prev.organicCarbon,
      }))
      setClimateParams((prev) => ({
        ...prev,
        temperature: saved.params.temperature ?? prev.temperature,
        humidity: saved.params.humidity ?? prev.humidity,
        rainfall: saved.params.rainfall ?? prev.rainfall,
      }))
    }
    if (saved.farmProfile) {
      setFarmProfile((prev) => ({
        ...prev,
        ...saved.farmProfile,
      }))
    }
  }

  return (
    <>
      <div className="block md:hidden">
        <MobileCropPredictor />
      </div>
      <div className="hidden md:block w-full max-w-7xl mx-auto space-y-6 pb-16 px-3 sm:px-6">
      {/* 1. COMPACT PROFESSIONAL HEADER */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span>{dict.tag || "Agricultural Decision Support"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {dict.title || "AI Crop Predictor & Satellite Farm Intelligence"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {dict.subtitle ||
              "Find suitable crops for your farm using soil conditions, weather intelligence, Copernicus satellite observations and remote sensing."}
          </p>
        </div>

        {/* 4 Compact Capability Badges */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs font-semibold text-foreground">
            <TestTube className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{dict.badgeSoil || "Soil Analysis"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs font-semibold text-foreground">
            <CloudSun className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{dict.badgeWeather || "Weather Intelligence"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs font-semibold text-foreground">
            <Satellite className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Sentinel-2 Satellite</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300/60 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300">
            <Cpu className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>{dict.badgeSensor || "Field Sensor (ESP32)"}</span>
          </div>
        </div>
      </div>

      {/* 2. TOP ROW: FARM PROFILE & WEATHER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Farm Profile & Location (7 cols) */}
        <div className="lg:col-span-7">
          <FarmProfileSection
            profile={farmProfile}
            onChange={(upd) => setFarmProfile((p) => ({ ...p, ...upd }))}
            onWeatherResolved={handleWeatherResolved}
            dict={dict}
          />
        </div>

        {/* Right: Weather Intelligence (5 cols) */}
        <div className="lg:col-span-5">
          <WeatherIntelligenceSection
            weather={weatherData}
            loading={weatherLoading}
            error={weatherError}
            dict={dict}
          />
        </div>
      </div>

      {/* 3. SATELLITE FARM INTELLIGENCE (Copernicus Sentinel-2 & Sentinel-1 SAR) */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Satellite className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-lg font-bold text-foreground">
                  Satellite Farm Intelligence &amp; Crop Health
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Authentic 10-meter multispectral observations from Copernicus Sentinel-2 and Sentinel-1 C-band SAR radar.
              </p>
            </div>
            {satelliteObservation && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Pass: {satelliteObservation.acquisition_date}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Satellite Map */}
          <SatelliteFarmMap
            lat={farmProfile.lat || 30.9010}
            lon={farmProfile.lon || 75.8573}
            polygonCoordinates={polygonCoords}
            onPolygonChange={handlePolygonChange}
            onAreaCalculated={(area) => setCalculatedArea(area)}
            observation={satelliteObservation}
            radarObservation={radarObservation}
            loading={satelliteLoading}
          />

          {/* Satellite Crop Health & Index Analytics Panel */}
          <SatelliteCropHealthPanel
            observation={satelliteObservation}
            radarObservation={radarObservation}
            historicalTimeline={historicalTimeline}
            agronomicInterpretation={agronomicInterpretation}
            calculatedArea={calculatedArea}
            hasCustomBoundary={polygonCoords.length >= 3}
            onApplyCalculatedArea={handleSyncCalculatedArea}
            onRefreshSatellite={() =>
              loadSatelliteData(farmProfile.lat || 30.9010, farmProfile.lon || 75.8573, polygonCoords)
            }
            loading={satelliteLoading}
          />
        </div>
      </div>

      {/* 4. FIELD SENSOR (ESP32 IoT) PANEL */}
      <FieldSensorPanel onApplySensorValues={handleSensorValues} dict={dict} />

      {/* 5. SMART SOIL ANALYSIS */}
      <SmartSoilAnalysis
        params={soilParams}
        onChange={(upd) => setSoilParams((p) => ({ ...p, ...upd }))}
        dict={dict}
      />

      {/* 6. PRIMARY ACTION BAR */}
      <div className="sticky top-4 z-20 rounded-xl border border-emerald-400/80 dark:border-emerald-700 bg-card/95 backdrop-blur-md p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <Sprout className="h-5 w-5 text-emerald-800 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              {dict.readyForAnalysis || "Ready for Farm & Crop Suitability Analysis"}
            </div>
            <div className="text-xs text-muted-foreground">
              Synthesizing soil nutrients, real weather, IoT field telemetry, and Copernicus satellite vigor.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeFarm}
          disabled={analyzing}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>{dict.analyzingProgress || "Evaluating Suitability..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>{dict.analyzeFarmBtn || "Analyze My Farm"}</span>
            </>
          )}
        </button>
      </div>

      {analysisError && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* 7. REDESIGNED RESULTS & OPTIMIZATION DASHBOARD */}
      <div ref={resultsRef}>
        <CropResultsDashboard
          result={result}
          loading={analyzing}
          onSaveAnalysis={user ? handleSaveAnalysis : undefined}
          saving={savingAnalysis}
          saveSuccess={saveSuccess}
          dict={dict}
          lang={lang}
        />
      </div>

      {/* 8. ASK YOUR FARM AI (CONTEXTUAL ASSISTANT) */}
      <AskFarmAIInline
        farmParams={{
          N: soilParams.N,
          P: soilParams.P,
          K: soilParams.K,
          temperature: climateParams.temperature,
          humidity: climateParams.humidity,
          ph: soilParams.ph,
          rainfall: climateParams.rainfall,
        }}
        satelliteNdvi={satelliteObservation?.field_stats?.mean_ndvi}
        satelliteNdwi={satelliteObservation?.field_stats?.mean_ndwi}
        farmLocation={farmProfile.locationLabel || farmProfile.district || undefined}
        topCrop={result?.ranked_recommendations?.[0]?.display_name || result?.recommended_crop}
        lang={lang}
      />

      {/* 9. RESULTS HISTORY (MY PREVIOUS ANALYSES) */}
      <PreviousAnalysesSection
        user={user}
        authReady={authReady}
        onReuseParams={handleReuseParams}
        refreshTrigger={historyRefreshKey}
        dict={dict}
      />
      </div>
    </>
  )
}
