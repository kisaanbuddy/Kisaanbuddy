"use client"

import { useLanguage, type Lang } from '@/lib/language'
import { CROP_PREDICTOR_I18N } from "@/lib/crop-predictor-i18n"
import { trackEvent } from '@/lib/analytics'
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, BrainCircuit, Activity, ChevronRight, Loader2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { AskFarmAI } from "@/components/AskFarmAI"
import { LocationAutoFill, type AutoFillValues } from "@/components/LocationAutoFill"
import { SensorAutoFill, type SensorValues } from "@/components/SensorAutoFill"

export default function CropPredictor() {
  const searchParams = useSearchParams()
  const { t, lang } = useLanguage()
  const dict = CROP_PREDICTOR_I18N[lang] || CROP_PREDICTOR_I18N.en
  const [params, setParams] = useState({ N: 90, P: 42, K: 43, temperature: 25, humidity: 82, ph: 6.5, rainfall: 200 })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // Fallback questionnaire states
  const [showWizard, setShowWizard] = useState(false)
  const [soilType, setSoilType] = useState("loamy")
  const [lastCrop, setLastCrop] = useState("none")
  const [irrigation, setIrrigation] = useState("canal")
  const [retention, setRetention] = useState("normal")

  // Real-time qualitative soil fallback mapping
  useEffect(() => {
    if (!showWizard) return

    let N = 80
    let P = 40
    let K = 45
    let ph = 6.5
    let rainfall = 150
    let humidity = 75

    // 1. Soil Type
    if (soilType === "black") {
      N = 95; P = 52; K = 50; ph = 7.2
    } else if (soilType === "red") {
      N = 62; P = 32; K = 38; ph = 5.8
    } else if (soilType === "sandy") {
      N = 38; P = 22; K = 28; ph = 6.2
    } else if (soilType === "loamy") {
      N = 82; P = 42; K = 44; ph = 6.5
    }

    // 2. Last Crop
    if (lastCrop === "pulses") {
      N += 18
    } else if (lastCrop === "sugarcane") {
      N -= 15; P -= 10; K -= 12
    } else if (lastCrop === "grains") {
      N -= 8
    }

    // 3. Irrigation
    if (irrigation === "rainfed") {
      rainfall = 90
      humidity = 60
    } else {
      rainfall = 210
      humidity = 80
    }

    // 4. Water retention
    if (retention === "stagnant") {
      humidity = Math.min(humidity + 10, 100)
      ph = Math.min(ph + 0.4, 14)
    } else if (retention === "fast") {
      humidity = Math.max(humidity - 12, 10)
      ph = Math.max(ph - 0.4, 0)
    }

    setParams(p => ({
      ...p,
      N,
      P,
      K,
      ph: parseFloat(ph.toFixed(1)),
      rainfall,
      humidity
    }))
  }, [showWizard, soilType, lastCrop, irrigation, retention])

  function getClientSideRecommendation(N: number, P: number, K: number, temp: number, hum: number, ph: number, rain: number): string {
    if (rain >= 180 && hum >= 70 && temp >= 20) {
      return "Rice (Basmati Paddy)"
    }
    if (temp >= 12 && temp <= 25 && rain <= 100 && N >= 60) {
      return "Wheat (Kalyan Sona)"
    }
    if (temp >= 20 && temp <= 32 && hum >= 50 && hum <= 80 && K >= 50) {
      return "Cotton (Hybrid Shankar)"
    }
    if (temp >= 18 && temp <= 30 && rain >= 80 && rain <= 160) {
      return "Maize (Deccan Double)"
    }
    if (temp >= 10 && temp <= 22 && ph <= 6.5 && K >= 70) {
      return "Potato (Jyoti Red)"
    }
    if (rain >= 130 && temp >= 24 && N >= 80) {
      return "Sugarcane (Coimbatore Premium)"
    }
    return ph < 6.5 ? "Paddy" : "Maize"
  }

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    let predicted = ""
    try {
      const res = await fetch('/api/ml/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      if (res.ok) {
        const data = await res.json()
        predicted = data.recommended_crop
      } else {
        predicted = getClientSideRecommendation(params.N, params.P, params.K, params.temperature, params.humidity, params.ph, params.rainfall)
      }
    } catch (err) {
      predicted = getClientSideRecommendation(params.N, params.P, params.K, params.temperature, params.humidity, params.ph, params.rainfall)
    } finally {
      setResult(predicted)
      setLoading(false)
      trackEvent({
        type: 'crop_prediction',
        inputs: params,
        result: predicted
      })
    }
  }

  // Voice navigation deliberately runs the same submit handler as the visible
  // form so the recommendation and loading/error states are identical.
  useEffect(() => {
    if (searchParams.get("voice") !== "1") return
    void handlePredict({ preventDefault: () => undefined } as React.FormEvent)
    // The command URL is immutable for this mounted page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSlider = (key: keyof typeof params, value: number[]) => setParams(p => ({ ...p, [key]: value[0] }))

  // Apply auto-detected weather to the 3 climate sliders only
  const handleAutoFill = (vals: AutoFillValues) => {
    setParams(p => ({
      ...p,
      temperature: vals.temperature,
      humidity: vals.humidity,
      rainfall: vals.rainfall,
    }))
  }

  // Apply live ESP32 field-sensor readings to temperature + humidity
  const handleSensorFill = (vals: SensorValues) => {
    setParams(p => ({
      ...p,
      temperature: vals.temperature,
      humidity: vals.humidity,
    }))
  }


  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{dict.tag}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-tight">
            {dict.title}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl">
            {dict.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
        {/* Left Column: Form & Inputs (7 cols) */}
        <Card className="md:col-span-7 p-5 sm:p-6 space-y-5">
          <CardHeader className="p-0 pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="text-primary h-4 w-4" />
              <span>{dict.parametersTitle}</span>
            </CardTitle>
          </CardHeader>

          {/* Quick Auto-fills */}
          <div className="space-y-2">
            <LocationAutoFill onApply={handleAutoFill} />
            <SensorAutoFill onApply={handleSensorFill} />
          </div>

          {/* Mode Switcher */}
          <div className="p-3 rounded-xl border border-border bg-muted/30 flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {dict.inputMethodLabel}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  !showWizard
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {dict.inputManual}
              </button>
              <button
                type="button"
                onClick={() => setShowWizard(true)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  showWizard
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {dict.inputEstimate}
              </button>
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-5">
            {showWizard ? (
              /* Fallback soil questionnaire wizard */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Soil Type Select */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {dict.soilTypeLabel}
                  </Label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="select-base"
                  >
                    <option value="loamy">{dict.soilLoamy}</option>
                    <option value="black">{dict.soilBlack}</option>
                    <option value="red">{dict.soilRed}</option>
                    <option value="sandy">{dict.soilSandy}</option>
                  </select>
                </div>

                {/* Last Crop Select */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {dict.lastCropLabel}
                  </Label>
                  <select
                    value={lastCrop}
                    onChange={(e) => setLastCrop(e.target.value)}
                    className="select-base"
                  >
                    <option value="none">{dict.lastCropNone}</option>
                    <option value="pulses">{dict.lastCropPulses}</option>
                    <option value="grains">{dict.lastCropGrains}</option>
                    <option value="sugarcane">{dict.lastCropCash}</option>
                  </select>
                </div>

                {/* Irrigation Method */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {dict.waterLabel}
                  </Label>
                  <select
                    value={irrigation}
                    onChange={(e) => setIrrigation(e.target.value)}
                    className="select-base"
                  >
                    <option value="canal">{dict.waterIrrigated}</option>
                    <option value="rainfed">{dict.waterRainfed}</option>
                  </select>
                </div>

                {/* Water Retention */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {dict.drainageLabel}
                  </Label>
                  <select
                    value={retention}
                    onChange={(e) => setRetention(e.target.value)}
                    className="select-base"
                  >
                    <option value="normal">{dict.drainageNormal}</option>
                    <option value="stagnant">{dict.drainageStagnant}</option>
                    <option value="fast">{dict.drainageFast}</option>
                  </select>
                </div>

                {/* Calculated metrics display */}
                <div className="col-span-1 sm:col-span-2 p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary font-medium flex flex-wrap gap-x-4 gap-y-1 justify-center">
                  <span>N: {params.N} mg/kg</span>
                  <span>P: {params.P} mg/kg</span>
                  <span>K: {params.K} mg/kg</span>
                  <span>pH: {params.ph}</span>
                  <span>{dict.rainLabel} {params.rainfall} mm</span>
                </div>
              </div>
            ) : (
              /* Manual NPK Sliders */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                {/* Nitrogen */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <Label>{t("crop_predictor.nitrogen_n")}</Label>
                    <span className="font-mono text-muted-foreground font-semibold">{params.N} mg/kg</span>
                  </div>
                  <Slider value={[params.N]} max={140} step={1} onValueChange={(v) => handleSlider("N", v)} />
                </div>

                {/* Phosphorus */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <Label>{t("crop_predictor.phosphorus_p")}</Label>
                    <span className="font-mono text-muted-foreground font-semibold">{params.P} mg/kg</span>
                  </div>
                  <Slider value={[params.P]} max={140} step={1} onValueChange={(v) => handleSlider("P", v)} />
                </div>

                {/* Potassium */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <Label>{t("crop_predictor.potassium_k")}</Label>
                    <span className="font-mono text-muted-foreground font-semibold">{params.K} mg/kg</span>
                  </div>
                  <Slider value={[params.K]} max={200} step={1} onValueChange={(v) => handleSlider("K", v)} />
                </div>

                {/* Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <Label>{t("crop_predictor.temperature")}</Label>
                    <span className="font-mono text-muted-foreground font-semibold">{params.temperature} °C</span>
                  </div>
                  <Slider value={[params.temperature]} max={50} min={5} step={0.5} onValueChange={(v) => handleSlider("temperature", v)} />
                </div>

                {/* Humidity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <Label>{t("crop_predictor.humidity")}</Label>
                    <span className="font-mono text-muted-foreground font-semibold">{params.humidity} %</span>
                  </div>
                  <Slider value={[params.humidity]} max={100} step={1} onValueChange={(v) => handleSlider("humidity", v)} />
                </div>

                {/* pH Level */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <Label>{t("crop_predictor.ph_level")}</Label>
                    <span className="font-mono text-muted-foreground font-semibold">{params.ph}</span>
                  </div>
                  <Slider value={[params.ph]} max={14} step={0.1} onValueChange={(v) => handleSlider("ph", v)} />
                </div>

                {/* Rainfall */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label>{t("crop_predictor.rainfall")}</Label>
                    <span className="font-mono text-muted-foreground font-semibold">{params.rainfall} mm</span>
                  </div>
                  <Slider value={[params.rainfall]} max={300} step={5} onValueChange={(v) => handleSlider("rainfall", v)} />
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" className="w-full h-11 gap-2 font-semibold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Sparkles className="h-4 w-4" />{t("crop_predictor.analyze_farm_data")}</>}
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Column: Prediction Results Area (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-start gap-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <Card className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 border-dashed">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {dict.readyForAnalysis}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                  {t("crop_predictor.adjust_the_sliders_to")}
                </p>
              </Card>
            ) : (
              <Card className="p-6 border-primary/40 bg-primary/5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {t("crop_predictor.recommended_crop")}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black font-display text-foreground capitalize mt-1">
                    {result}
                  </h2>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{dict.compatibilityScore}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {dict.compatibilityDesc}
                  </p>
                </div>
              </Card>
            )}
          </AnimatePresence>

          {/* AskFarmAI Integration */}
          <AskFarmAI params={params} />
        </div>
      </div>
    </div>
  )
}
