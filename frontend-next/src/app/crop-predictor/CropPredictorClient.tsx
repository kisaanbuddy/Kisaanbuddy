"use client"

import React, { useState, useEffect, useRef } from "react"
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
} from "lucide-react"

import { useLanguage } from "@/lib/language"
import { CROP_PREDICTOR_I18N } from "@/lib/crop-predictor-i18n"
import { trackEvent } from "@/lib/analytics"
import { useAuth } from "@/lib/auth"
import { recommendationsApi } from "@/lib/farmer-api"

// Redesigned modular sections
import { FarmProfileSection, type FarmProfileData } from "@/components/crop-predictor/FarmProfileSection"
import { WeatherIntelligenceSection, type WeatherData } from "@/components/crop-predictor/WeatherIntelligenceSection"
import { FieldSensorPanel } from "@/components/crop-predictor/FieldSensorPanel"
import { SmartSoilAnalysis, type SoilParameters } from "@/components/crop-predictor/SmartSoilAnalysis"
import {
  CropResultsDashboard,
  type PredictionResultData,
} from "@/components/crop-predictor/CropResultsDashboard"
import { PreviousAnalysesSection } from "@/components/crop-predictor/PreviousAnalysesSection"
import { AskFarmAIInline } from "@/components/crop-predictor/AskFarmAIInline"

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

  // 3. Soil Parameters
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

  // 4. Climate values for the ML model (driven by weather / sensor / defaults)
  const [climateParams, setClimateParams] = useState({
    temperature: 26,
    humidity: 72,
    rainfall: 140,
  })

  // 5. Prediction Engine states
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<PredictionResultData | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // 6. Persistence & History states
  const [savingAnalysis, setSavingAnalysis] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  // Ref for auto-scrolling to results after analysis
  const resultsRef = useRef<HTMLDivElement>(null)

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

    // Build payload combining soil & climate inputs
    const payload = {
      N: soilParams.N,
      P: soilParams.P,
      K: soilParams.K,
      temperature: climateParams.temperature,
      humidity: climateParams.humidity,
      ph: soilParams.ph,
      rainfall: climateParams.rainfall,
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
          resultSummary: {
            crop: topCropItem?.display_name || result.recommended_crop,
            score: topCropItem?.suitability_score || Math.round(result.confidence * 100),
          },
        }),
        recommended_action: result.next_steps?.[0] || "Select certified seed variety and adjust basal fertilizer.",
        confidence: `${topCropItem?.suitability_score || Math.round(result.confidence * 100)}%`,
        source: "ICAR & SAU Agronomic Norms",
        category: "next_season",
        status: "pending",
      })

      setSaveSuccess(true)
      setHistoryRefreshKey((k) => k + 1)
    } catch {
      // ignore or feedback
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 px-3 sm:px-6">
      {/* 1. COMPACT PROFESSIONAL HEADER */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span>{dict.tag || "Agricultural Decision Support"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {dict.title || "AI Crop Predictor"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {dict.subtitle ||
              "Find suitable crops for your farm using soil conditions, weather information and agricultural intelligence."}
          </p>
        </div>

        {/* 3 Compact Capability Badges */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs font-semibold text-foreground">
            <TestTube className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{dict.badgeSoil || "Soil Analysis"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs font-semibold text-foreground">
            <CloudSun className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{dict.badgeWeather || "Weather Intelligence"}</span>
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

      {/* 3. FIELD SENSOR (ESP32 IoT) PANEL */}
      <FieldSensorPanel onApplySensorValues={handleSensorValues} dict={dict} />

      {/* 4. SMART SOIL ANALYSIS */}
      <SmartSoilAnalysis
        params={soilParams}
        onChange={(upd) => setSoilParams((p) => ({ ...p, ...upd }))}
        dict={dict}
      />

      {/* 5. PRIMARY ACTION BAR */}
      <div className="sticky top-4 z-20 rounded-xl border border-emerald-400/80 dark:border-emerald-700 bg-card/95 backdrop-blur-md p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {dict.readyForAnalysis || "Ready to Evaluate Your Farmland"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              All parameters will be verified against verified agronomic norms for 12+ major Indian crops.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeFarm}
          disabled={analyzing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{dict.analyzingProgress || "Analyzing Farm..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-200" />
              <span>{dict.analyzeFarmBtn || "Analyze My Farm"}</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {analysisError && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div>
            <strong>Evaluation failed:</strong> {analysisError}
          </div>
        </div>
      )}

      {/* 6. RESULTS DASHBOARD */}
      <div ref={resultsRef} className="space-y-6 pt-2">
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

      {/* 7. ASK YOUR FARM AI (CONTEXTUAL ASSISTANT) */}
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
        farmLocation={farmProfile.locationLabel || farmProfile.district || undefined}
        topCrop={result?.ranked_recommendations?.[0]?.display_name || result?.recommended_crop}
        lang={lang}
      />

      {/* 8. RESULTS HISTORY (MY PREVIOUS ANALYSES) */}
      <PreviousAnalysesSection
        user={user}
        authReady={authReady}
        onReuseParams={handleReuseParams}
        refreshTrigger={historyRefreshKey}
        dict={dict}
      />
    </div>
  )
}
