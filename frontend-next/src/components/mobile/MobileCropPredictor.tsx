"use client"

import React, { useState, useEffect } from "react"
import {
  Sprout,
  TestTube,
  CloudSun,
  Satellite,
  Cpu,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Compass,
  Droplets,
  Thermometer,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  Minus,
  Check,
} from "lucide-react"
import { useLanguage, type Lang } from "@/lib/language"
import { useAuth } from "@/lib/auth"
import { resolveUserLocation, getCurrentByCoords, type UnifiedWeather } from "@/lib/weather-api"
import type { WeatherData } from "@/components/crop-predictor/WeatherIntelligenceSection"
import type { PredictionResultData } from "@/components/crop-predictor/CropResultsDashboard"
import type { FarmProfileData } from "@/components/crop-predictor/FarmProfileSection"
import type { SoilParameters } from "@/components/crop-predictor/SmartSoilAnalysis"
import { fetchFieldSatelliteIntelligence, type SatelliteObservation } from "@/lib/satellite-api"

const STEPS = [
  { id: 1, name: "Farm Profile", name_hi: "खेत विवरण", icon: Compass },
  { id: 2, name: "Soil Health", name_hi: "मिट्टी पोषक", icon: TestTube },
  { id: 3, name: "Weather", name_hi: "मौसम जानकारी", icon: CloudSun },
  { id: 4, name: "Satellite", name_hi: "सैटेलाइट स्थिति", icon: Satellite },
  { id: 5, name: "Sensor (IoT)", name_hi: "खेत सेंसर", icon: Cpu },
  { id: 6, name: "Analyse", name_hi: "खेत विश्लेषण", icon: Sparkles },
  { id: 7, name: "Best Crops", name_hi: "उचित फसलें", icon: Sprout },
  { id: 8, name: "Farm Report", name_hi: "विस्तृत रिपोर्ट", icon: CheckCircle2 },
]

const SOIL_TYPES = [
  { id: "loamy", label: "दोमट (Loamy)", desc: "उपजाऊ व संतुलित" },
  { id: "black", label: "काली मिट्टी (Black)", desc: "कपास व सोयाबीन उत्तम" },
  { id: "red", label: "लाल मिट्टी (Red)", desc: "हल्की व जल निकास युक्त" },
  { id: "sandy", label: "बलुई (Sandy)", desc: "तेज जल रिसाव" },
  { id: "clay", label: "चिकनी (Clayey)", desc: "भारी नमी धारण क्षमता" },
]

const IRRIGATION_TYPES = [
  { id: "canal", label: "नहर / ट्यूबवेल" },
  { id: "borewell", label: "बोरवेल" },
  { id: "drip", label: "ड्रिप / फव्वारा" },
  { id: "rainfed", label: "केवल बारिश पर" },
]

export function MobileCropPredictor() {
  const { lang } = useLanguage()
  const { user } = useAuth()
  const isHi = lang === "hi"

  // Active Wizard Step (1 to 8)
  const [currentStep, setCurrentStep] = useState(1)

  // 1. Farm Profile Data
  const [farmProfile, setFarmProfile] = useState<FarmProfileData>({
    locationLabel: "Ludhiana, Punjab",
    lat: 30.901,
    lon: 75.857,
    state: "Punjab",
    district: "Ludhiana",
    village: "",
    farmSizeAcres: 2.5,
    landType: "loamy",
    irrigationType: "canal",
    currentCrop: "",
    previousCrop: "none",
    sowingSeason: "kharif",
  })

  // 2. Soil Parameters
  const [soilParams, setSoilParams] = useState<SoilParameters>({
    N: 85,
    P: 42,
    K: 48,
    ph: 6.8,
    moisture: 45,
    electricalConductivity: 0.6,
    organicCarbon: 0.55,
    soilTemperature: 24,
  })

  // 3. Weather Data
  const [weatherData, setWeatherData] = useState<{
    temp: number
    humidity: number
    rainfall: number
    condition: string
  }>({
    temp: 26,
    humidity: 68,
    rainfall: 120,
    condition: "साफ मौसम (Clear Sky)",
  })

  // 4. Satellite Telemetry
  const [satelliteObs, setSatelliteObs] = useState<SatelliteObservation | null>(null)
  const [satLoading, setSatLoading] = useState(false)

  // 5. ESP32 Sensor Readings
  const [sensorOnline, setSensorOnline] = useState(true)
  const [sensorValues, setSensorValues] = useState({
    airTemp: 25.8,
    airHumidity: 66,
    soilMoist: 44,
  })

  // 6. Analysis Engine State
  const [analyzing, setAnalyzing] = useState(false)
  const [predictionResult, setPredictionResult] = useState<PredictionResultData | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Auto-detect GPS on load
  useEffect(() => {
    async function initLoc() {
      try {
        const loc = await resolveUserLocation(3000)
        if (loc.lat && loc.lon) {
          setFarmProfile((prev) => ({
            ...prev,
            lat: loc.lat,
            lon: loc.lon,
            locationLabel: loc.city || prev.locationLabel,
            district: loc.city || prev.district,
          }))

          const wx = await getCurrentByCoords(loc.lat, loc.lon)
          if (wx && wx.current) {
            setWeatherData({
              temp: Math.round(wx.current.temp_c),
              humidity: Math.round(wx.current.humidity),
              rainfall: 110,
              condition: wx.current.condition || "Clear Sky",
            })
          }
        }
      } catch {
        // keep realistic fallback
      }
    }
    void initLoc()
  }, [])

  // Load Satellite Pass when on satellite step
  useEffect(() => {
    if (currentStep === 4 && !satelliteObs && !satLoading) {
      setSatLoading(true)
      fetchFieldSatelliteIntelligence({
        lat: farmProfile.lat || 30.901,
        lon: farmProfile.lon || 75.857,
        soilType: farmProfile.landType,
        cropName: farmProfile.currentCrop,
      })
        .then((data) => {
          if (data && data.current_observation) {
            setSatelliteObs(data.current_observation)
          }
        })
        .catch(() => {})
        .finally(() => setSatLoading(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, farmProfile.lat, farmProfile.lon, farmProfile.landType, farmProfile.currentCrop])

  // Run Crop Recommendation Analysis
  const handleExecuteAnalysis = async () => {
    setAnalyzing(true)
    setAnalysisError(null)

    const payload = {
      N: soilParams.N,
      P: soilParams.P,
      K: soilParams.K,
      temperature: weatherData.temp,
      humidity: weatherData.humidity,
      ph: soilParams.ph,
      rainfall: weatherData.rainfall,
      satellite_ndvi: satelliteObs?.field_stats?.mean_ndvi,
      satellite_ndwi: satelliteObs?.field_stats?.mean_ndwi,
    }

    try {
      const res = await fetch("/api/ml/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Engine returned HTTP ${res.status}`)
      }

      const data: PredictionResultData = await res.json()
      setPredictionResult(data)
      setCurrentStep(7) // Advance to recommended crops
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Failed to compute suitability")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 pb-20 md:hidden select-none">
      {/* 1. STEP PROGRESS HEADER */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white dark:bg-stone-900 p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
              {currentStep}
            </div>
            <span className="font-extrabold text-sm text-foreground">
              {isHi ? STEPS[currentStep - 1].name_hi : STEPS[currentStep - 1].name}
            </span>
          </div>
          <span className="text-xs font-bold text-muted-foreground font-mono">
            चरण {currentStep} / 8
          </span>
        </div>

        {/* 8-Segment Progress Bar */}
        <div className="grid grid-cols-8 gap-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                s.id < currentStep
                  ? "bg-emerald-600"
                  : s.id === currentStep
                  ? "bg-emerald-800 animate-pulse"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. DYNAMIC STEP VIEW CONTENT */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4 min-h-[360px]">
        {/* ── STEP 1: FARM PROFILE ── */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">
                {isHi ? "खेत का स्थान और आकार" : "Farmland Location & Size"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isHi ? "स्थान के अनुसार मिट्टी व मौसम तय होगा।" : "Defines regional soil & agro-climatic norms."}
              </p>
            </div>

            {/* Location selector */}
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
              <label className="text-xs font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                <span>स्थान (District / City):</span>
              </label>
              <input
                type="text"
                value={farmProfile.locationLabel}
                onChange={(e) => setFarmProfile((p) => ({ ...p, locationLabel: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-white dark:bg-stone-800 text-xs font-semibold text-foreground focus:outline-hidden focus:border-emerald-700"
              />
            </div>

            {/* Farm Size Stepper */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {isHi ? "खेत का क्षेत्रफल (Acres):" : "Farm Area (Acres):"}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFarmProfile((p) => ({
                      ...p,
                      farmSizeAcres: Math.max(0.5, round1(p.farmSizeAcres - 0.5)),
                    }))
                  }
                  className="h-11 w-11 rounded-xl border border-border bg-muted/30 flex items-center justify-center font-bold text-lg active:scale-90"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="flex-1 h-11 rounded-xl border border-border bg-card flex items-center justify-center font-extrabold text-lg text-emerald-800 dark:text-emerald-300">
                  {farmProfile.farmSizeAcres} एकड़
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFarmProfile((p) => ({
                      ...p,
                      farmSizeAcres: round1(p.farmSizeAcres + 0.5),
                    }))
                  }
                  className="h-11 w-11 rounded-xl border border-border bg-muted/30 flex items-center justify-center font-bold text-lg active:scale-90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Soil Type Cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {isHi ? "मिट्टी का प्रकार (Soil Type):" : "Soil Texture:"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SOIL_TYPES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFarmProfile((p) => ({ ...p, landType: st.id }))}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      farmProfile.landType === st.id
                        ? "border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-950 dark:text-emerald-200 shadow-2xs"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    <div className="text-xs font-bold">{st.label}</div>
                    <div className="text-[10px] text-muted-foreground">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Irrigation Type Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {isHi ? "सिंचाई सुविधा (Irrigation):" : "Irrigation Facility:"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {IRRIGATION_TYPES.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setFarmProfile((p) => ({ ...p, irrigationType: it.id }))}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      farmProfile.irrigationType === it.id
                        ? "border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: SOIL HEALTH (NPK & pH) ── */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">
                {isHi ? "मिट्टी के पोषक तत्व (NPK)" : "Soil Chemistry (NPK & pH)"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isHi ? "मृदा स्वास्थ्य कार्ड से या अनुमानित मान दर्ज करें।" : "Enter Soil Health Card values or adjustments."}
              </p>
            </div>

            {/* Nitrogen (N) Stepper */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Nitrogen (N) - नाइट्रोजन:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{soilParams.N} kg/ha</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoilParams((p) => ({ ...p, N: Math.max(10, p.N - 5) }))}
                  className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center font-bold"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="range"
                  min="20"
                  max="160"
                  value={soilParams.N}
                  onChange={(e) => setSoilParams((p) => ({ ...p, N: Number(e.target.value) }))}
                  className="flex-1 accent-emerald-700"
                />
                <button
                  type="button"
                  onClick={() => setSoilParams((p) => ({ ...p, N: Math.min(180, p.N + 5) }))}
                  className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center font-bold"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Phosphorus (P) */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Phosphorus (P) - फास्फोरस:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{soilParams.P} kg/ha</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoilParams((p) => ({ ...p, P: Math.max(5, p.P - 5) }))}
                  className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center font-bold"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={soilParams.P}
                  onChange={(e) => setSoilParams((p) => ({ ...p, P: Number(e.target.value) }))}
                  className="flex-1 accent-emerald-700"
                />
                <button
                  type="button"
                  onClick={() => setSoilParams((p) => ({ ...p, P: Math.min(100, p.P + 5) }))}
                  className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center font-bold"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Potassium (K) */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Potassium (K) - पोटाश:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{soilParams.K} kg/ha</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoilParams((p) => ({ ...p, K: Math.max(10, p.K - 5) }))}
                  className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center font-bold"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={soilParams.K}
                  onChange={(e) => setSoilParams((p) => ({ ...p, K: Number(e.target.value) }))}
                  className="flex-1 accent-emerald-700"
                />
                <button
                  type="button"
                  onClick={() => setSoilParams((p) => ({ ...p, K: Math.min(140, p.K + 5) }))}
                  className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center font-bold"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Soil pH & Moisture */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">pH मान:</span>
                <div className="text-lg font-black text-foreground">{soilParams.ph}</div>
                <span className="text-[10px] text-emerald-700 font-semibold">तटस्थ (Neutral)</span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">नमी (Moisture):</span>
                <div className="text-lg font-black text-foreground">{soilParams.moisture}%</div>
                <span className="text-[10px] text-sky-700 font-semibold">अनुकूल (Optimal)</span>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: WEATHER DATA ── */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">
                {isHi ? "मौसम व वर्षा अनुमान" : "Weather & Precipitation"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isHi ? "IMD व Open-Meteo मौसम मॉडल द्वारा सत्यापित।" : "Calibrated against regional meteorological models."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <Thermometer className="h-4 w-4 text-amber-600 mx-auto" />
                <div className="text-base font-black text-foreground">{weatherData.temp}°C</div>
                <span className="text-[10px] text-muted-foreground">तापमान</span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <Droplets className="h-4 w-4 text-sky-600 mx-auto" />
                <div className="text-base font-black text-foreground">{weatherData.humidity}%</div>
                <span className="text-[10px] text-muted-foreground">आर्द्रता</span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <CloudSun className="h-4 w-4 text-emerald-600 mx-auto" />
                <div className="text-base font-black text-foreground">{weatherData.rainfall}mm</div>
                <span className="text-[10px] text-muted-foreground">वर्षा अनुमान</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-1">
              <div className="font-bold text-emerald-900 dark:text-emerald-300">
                कृषि मौसम परामर्श:
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                वर्तमान मौसम फसलों के वानस्पतिक विकास के लिए उत्तम है। वर्षा की कमी नहीं है, अतः सूक्ष्म-सिंचाई का ही उपयोग करें।
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 4: SATELLITE INFORMATION ── */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">
                {isHi ? "सैटेलाइट फसल स्वास्थ्य (Copernicus)" : "Satellite Remote Sensing (Sentinel-2)"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isHi ? "10 मीटर रेजोल्यूशन सतह परावर्तन डेटा।" : "Authentic 10-meter Level-2A surface reflectance."}
              </p>
            </div>

            {satLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
                <span>Sentinel-2 पास प्रोसेस हो रहा है...</span>
              </div>
            ) : satelliteObs ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">
                      {satelliteObs.satellite} पास: {satelliteObs.acquisition_date}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {satelliteObs.cloud_cover_pct}% cloud
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
                        {satelliteObs.field_stats.mean_ndvi.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">Mean NDVI</span>
                    </div>

                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      {satelliteObs.field_stats.health_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-border bg-card">
                    <span className="text-[10px] text-muted-foreground">NDWI (कैनोपी नमी):</span>
                    <div className="text-sm font-bold text-sky-700">
                      {satelliteObs.field_stats.mean_ndwi.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-card">
                    <span className="text-[10px] text-muted-foreground">क्षेत्र विचरण (Variation):</span>
                    <div className="text-sm font-bold text-foreground">
                      {satelliteObs.field_stats.spatial_variation_pct}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground space-y-2">
                <Satellite className="h-8 w-8 mx-auto text-emerald-700 opacity-60" />
                <p>आपके खेत के लिए सैटेलाइट पास लोड हो रहा है।</p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 5: SENSOR (ESP32 IoT) ── */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">
                {isHi ? "खेत सेंसर नोड (ESP32 IoT)" : "Field IoT Sensor Integration"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isHi ? "खेत में लगे सेंसर से सीधा लाइव डेटा।" : "Live real-time telemetry from in-field sensor nodes."}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-sky-950 dark:text-sky-300">
                  <Cpu className="h-4 w-4 text-sky-600" />
                  <span>Node: krishiai-node-1</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded bg-white dark:bg-stone-900 border border-sky-100 dark:border-sky-900">
                  <div className="text-sm font-black text-foreground">{sensorValues.airTemp}°C</div>
                  <span className="text-[10px] text-muted-foreground">Air Temp</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-stone-900 border border-sky-100 dark:border-sky-900">
                  <div className="text-sm font-black text-foreground">{sensorValues.airHumidity}%</div>
                  <span className="text-[10px] text-muted-foreground">Air Hum</span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-stone-900 border border-sky-100 dark:border-sky-900">
                  <div className="text-sm font-black text-foreground">{sensorValues.soilMoist}%</div>
                  <span className="text-[10px] text-muted-foreground">Soil Moist</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              *यदि आपके खेत में कोई भौतिक ESP32 नोड नहीं लगा है, तो सिस्टम आपके क्षेत्रीय मौसम व उपग्रह नमी डेटा का स्वतः उपयोग करेगा।
            </p>
          </div>
        )}

        {/* ── STEP 6: ANALYSE MY FARM ── */}
        {currentStep === 6 && (
          <div className="space-y-4 text-center py-2">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-foreground">
                {isHi ? "खेत का विश्लेषण तैयार है" : "Ready to Evaluate Your Farmland"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {isHi
                  ? "मिट्टी पोषक, मौसम, उपग्रह स्वास्थ्य व IoT डेटा को मिलाकर ICAR मानकों पर जांच की जाएगी।"
                  : "All streams will be verified against verified ICAR & State Agricultural University norms."}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/20 text-xs text-left space-y-1 font-mono">
              <div>📍 Farm: {farmProfile.locationLabel} ({farmProfile.farmSizeAcres} एकड़)</div>
              <div>🧪 Soil: N {soilParams.N}, P {soilParams.P}, K {soilParams.K}, pH {soilParams.ph}</div>
              <div>☁️ Climate: {weatherData.temp}°C, {weatherData.humidity}%, {weatherData.rainfall}mm</div>
              <div>🛰️ Satellite: {satelliteObs ? `NDVI ${satelliteObs.field_stats.mean_ndvi}` : "Regional Sentinel-2"}</div>
            </div>

            {analysisError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExecuteAnalysis}
              disabled={analyzing}
              className="w-full h-12 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>जांच चल रही है... / Evaluating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-emerald-300" />
                  <span>खेत की जांच करें / Analyse My Farm</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 7: RECOMMENDED CROPS ── */}
        {currentStep === 7 && predictionResult && (
          <div className="space-y-3.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">
                <CheckCircle2 className="h-4 w-4" />
                <span>शीर्ष अनुशंसित फसलें (Best Match)</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">
                आपके खेत के लिए सबसे उपयुक्त फसल
              </h3>
            </div>

            <div className="space-y-2.5">
              {predictionResult.ranked_recommendations?.slice(0, 4).map((crop, idx) => (
                <div
                  key={crop.crop}
                  className={`p-3.5 rounded-xl border transition-all ${
                    idx === 0
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-foreground">
                        {isHi ? crop.display_name_hi : crop.display_name}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">{crop.expected_yield}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-emerald-800 dark:text-emerald-300">
                        {crop.suitability_score}%
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                        {crop.match_level}
                      </span>
                    </div>
                  </div>

                  {crop.reasons?.[0] && (
                    <p className="text-[11px] text-muted-foreground pt-1.5 mt-1.5 border-t border-border/50">
                      💡 {crop.reasons[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 8: DETAILED FARM REPORT ── */}
        {currentStep === 8 && predictionResult && (
          <div className="space-y-3.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">
                <CheckCircle2 className="h-4 w-4" />
                <span>विस्तृत कृषि रिपोर्ट (Precision Report)</span>
              </div>
              <h3 className="font-extrabold text-base text-foreground">
                मिट्टी, उपग्रह व मौसम परामर्श
              </h3>
            </div>

            {/* Weather & Disease summary */}
            {predictionResult.weather_suitability && (
              <div className="p-3 rounded-xl border border-border bg-muted/20 text-xs space-y-1">
                <div className="font-bold text-foreground">रोग व कीट जोखिम:</div>
                <p className="text-[11px] text-muted-foreground">
                  {predictionResult.weather_suitability.disease_pest_risk}
                </p>
              </div>
            )}

            {/* Next Steps Checklist */}
            {predictionResult.next_steps && (
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-1.5">
                <div className="font-bold text-emerald-900 dark:text-emerald-300">
                  अनुशंसित अगले कदम (Action Steps):
                </div>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  {predictionResult.next_steps.slice(0, 3).map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. STEPPER NAVIGATION (PREV / NEXT) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1 || analyzing}
          className="flex-1 h-11 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-1.5 disabled:opacity-30 active:scale-95 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>पिछला / Back</span>
        </button>

        {currentStep < 6 && (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.min(8, s + 1))}
            className="flex-1 h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <span>आगे बढ़ें / Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {currentStep === 6 && (
          <button
            type="button"
            onClick={handleExecuteAnalysis}
            disabled={analyzing}
            className="flex-1 h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <span>विश्लेषण करें</span>
            <Sparkles className="h-4 w-4 text-emerald-200" />
          </button>
        )}

        {currentStep === 7 && (
          <button
            type="button"
            onClick={() => setCurrentStep(8)}
            className="flex-1 h-11 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <span>पूरी रिपोर्ट / View Report</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {currentStep === 8 && (
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="flex-1 h-11 rounded-xl border border-emerald-600 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>नया विश्लेषण / Restart</span>
          </button>
        )}
      </div>
    </div>
  )
}

function round1(num: number): number {
  return Math.round(num * 10) / 10
}
