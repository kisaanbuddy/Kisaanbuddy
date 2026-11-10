"use client"

import React, { useState, useEffect } from "react"
import {
  TestTube,
  Sparkles,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

export interface SoilParameters {
  N: number
  P: number
  K: number
  ph: number
  moisture: number
  electricalConductivity: number
  organicCarbon: number
  soilTemperature: number
}

interface ExtractedReportCard {
  soil_ph: number | null
  nitrogen_kg_ha: number | null
  phosphorus_kg_ha: number | null
  potassium_kg_ha: number | null
  organic_carbon_pct: number | null
  ec_ds_m: number | null
  soil_type: string | null
  lab_name: string | null
  test_date: string | null
  farmer_name: string | null
  source_file: string | null
}

interface Props {
  params: SoilParameters
  onChange: (updated: Partial<SoilParameters>) => void
  dict: any
}

type InputMethod = "manual" | "estimate" | "upload"

export function SmartSoilAnalysis({ params, onChange, dict }: Props) {
  const [method, setMethod] = useState<InputMethod>("manual")

  // Estimation wizard states
  const [estSoilType, setEstSoilType] = useState("loamy")
  const [estLastCrop, setEstLastCrop] = useState("none")
  const [estIrrigation, setEstIrrigation] = useState("canal")
  const [estDrainage, setEstDrainage] = useState("normal")

  // Soil card upload states
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedReportCard | null>(null)
  const [appliedReport, setAppliedReport] = useState(false)

  // Real-time estimation calculations when wizard is selected
  useEffect(() => {
    if (method !== "estimate") return

    let n = 80
    let p = 40
    let k = 45
    let ph = 6.5
    let ec = 0.4
    let oc = 0.55
    let moisture = 45

    if (estSoilType === "black") {
      n = 95
      p = 50
      k = 55
      ph = 7.4
      oc = 0.65
      moisture = 55
    } else if (estSoilType === "red") {
      n = 60
      p = 32
      k = 38
      ph = 5.9
      oc = 0.42
      moisture = 38
    } else if (estSoilType === "sandy") {
      n = 40
      p = 22
      k = 30
      ph = 6.3
      oc = 0.28
      moisture = 25
    } else if (estSoilType === "clay") {
      n = 85
      p = 45
      k = 50
      ph = 7.1
      oc = 0.6
      moisture = 60
    } else if (estSoilType === "alluvial") {
      n = 90
      p = 48
      k = 48
      ph = 6.8
      oc = 0.58
      moisture = 50
    }

    if (estLastCrop === "pulses") {
      n += 20
    } else if (estLastCrop === "sugarcane") {
      n = Math.max(20, n - 15)
      p = Math.max(15, p - 10)
      k = Math.max(20, k - 12)
    } else if (estLastCrop === "grains") {
      n = Math.max(20, n - 8)
    }

    if (estDrainage === "stagnant") {
      moisture = Math.min(85, moisture + 15)
      ph = Math.min(8.5, ph + 0.3)
      ec = parseFloat((ec + 0.2).toFixed(2))
    } else if (estDrainage === "fast") {
      moisture = Math.max(15, moisture - 15)
      n = Math.max(25, n - 10)
    }

    onChange({
      N: n,
      P: p,
      K: k,
      ph: parseFloat(ph.toFixed(1)),
      electricalConductivity: ec,
      organicCarbon: oc,
      moisture,
    })
  }, [method, estSoilType, estLastCrop, estIrrigation, estDrainage])

  // Handle Soil Report Upload & Extraction
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    setExtractedData(null)
    setAppliedReport(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/sarvam/extract-soil-report", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        let msg = `Extraction service failed (HTTP ${res.status})`
        try {
          const j = await res.json()
          if (j.detail) msg = j.detail
        } catch {}
        throw new Error(msg)
      }

      const data = await res.json()
      setExtractedData({
        ...data,
        source_file: file.name,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to extract data from soil report"
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  // Farmer confirms extracted values
  function handleApplyExtractedReport() {
    if (!extractedData) return

    const updates: Partial<SoilParameters> = {}
    if (extractedData.nitrogen_kg_ha != null) {
      // Convert kg/ha to mg/kg (~ divide by 2.24) or keep direct
      updates.N = Math.round(extractedData.nitrogen_kg_ha / 2.24) || Math.round(extractedData.nitrogen_kg_ha)
    }
    if (extractedData.phosphorus_kg_ha != null) {
      updates.P = Math.round(extractedData.phosphorus_kg_ha / 2.24) || Math.round(extractedData.phosphorus_kg_ha)
    }
    if (extractedData.potassium_kg_ha != null) {
      updates.K = Math.round(extractedData.potassium_kg_ha / 2.24) || Math.round(extractedData.potassium_kg_ha)
    }
    if (extractedData.soil_ph != null) {
      updates.ph = extractedData.soil_ph
    }
    if (extractedData.ec_ds_m != null) {
      updates.electricalConductivity = extractedData.ec_ds_m
    }
    if (extractedData.organic_carbon_pct != null) {
      updates.organicCarbon = extractedData.organic_carbon_pct
    }

    onChange(updates)
    setAppliedReport(true)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5 shadow-2xs">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
            <h2 className="text-sm font-bold text-foreground">
              {dict.parametersTitle || "Smart Soil Analysis"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Provide soil chemistry measurements to evaluate agronomic compatibility.
          </p>
        </div>

        {/* 3 Input Methods Pill Switcher */}
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setMethod("manual")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              method === "manual"
                ? "bg-background text-foreground shadow-2xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {dict.inputManual || "Manual Entry"}
          </button>
          <button
            type="button"
            onClick={() => setMethod("estimate")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              method === "estimate"
                ? "bg-background text-foreground shadow-2xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {dict.inputEstimate || "Soil Estimation"}
          </button>
          <button
            type="button"
            onClick={() => setMethod("upload")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              method === "upload"
                ? "bg-background text-foreground shadow-2xs border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {dict.inputUpload || "Upload Report"}
          </button>
        </div>
      </div>

      {/* METHOD B: SOIL ESTIMATION QUESTIONNAIRE */}
      {method === "estimate" && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice: Estimated Soil Benchmark</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5">
                {dict.estimateWarning ||
                  "Estimated values shown below are regional benchmarks based on soil texture and rotation, not laboratory measurements."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Soil Type */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{dict.soilTypeLabel || "Soil Texture & Type"}</Label>
              <select
                value={estSoilType}
                onChange={(e) => setEstSoilType(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="loamy">{dict.soilLoamy || "Loamy Soil (Fertile & balanced)"}</option>
                <option value="black">{dict.soilBlack || "Black Cotton Soil (Vertisol)"}</option>
                <option value="red">{dict.soilRed || "Red Sandy/Loam Soil"}</option>
                <option value="sandy">{dict.soilSandy || "Sandy Soil (High drainage)"}</option>
                <option value="clay">{dict.soilClay || "Clayey Soil (Heavy retention)"}</option>
                <option value="alluvial">{dict.soilAlluvial || "Alluvial Soil (River basin rich)"}</option>
              </select>
            </div>

            {/* Previous Crop */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{dict.lastCropLabel || "Previous Crop Harvested"}</Label>
              <select
                value={estLastCrop}
                onChange={(e) => setEstLastCrop(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="none">{dict.lastCropNone || "None / First Cultivation"}</option>
                <option value="pulses">{dict.lastCropPulses || "Pulses / Legumes (N-fixing)"}</option>
                <option value="grains">{dict.lastCropGrains || "Paddy or Wheat"}</option>
                <option value="sugarcane">{dict.lastCropCash || "Sugarcane or Cotton"}</option>
              </select>
            </div>

            {/* Water Source */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{dict.waterLabel || "Irrigation Facility"}</Label>
              <select
                value={estIrrigation}
                onChange={(e) => setEstIrrigation(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="canal">{dict.waterIrrigated || "Canal / Tube well"}</option>
                <option value="rainfed">{dict.waterRainfed || "Rainfed Only"}</option>
              </select>
            </div>

            {/* Drainage */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{dict.drainageLabel || "Water Drainage Rate"}</Label>
              <select
                value={estDrainage}
                onChange={(e) => setEstDrainage(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="normal">{dict.drainageNormal || "Normal / Good Drainage"}</option>
                <option value="stagnant">{dict.drainageStagnant || "Waterlogging Prone"}</option>
                <option value="fast">{dict.drainageFast || "Fast Drainage (Sandy)"}</option>
              </select>
            </div>
          </div>

          {/* Computed Estimate Display */}
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300">
              Estimated Benchmarks:
            </span>
            <div className="flex items-center gap-3 font-mono text-emerald-800 dark:text-emerald-300">
              <span>N: {params.N} mg/kg</span>
              <span>P: {params.P} mg/kg</span>
              <span>K: {params.K} mg/kg</span>
              <span>pH: {params.ph}</span>
              <span>OC: {params.organicCarbon}%</span>
            </div>
          </div>
        </div>
      )}

      {/* METHOD C: UPLOAD SOIL TEST REPORT */}
      {method === "upload" && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground flex items-start gap-2.5">
            <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <p>
              {dict.uploadNotice ||
                "Upload a photo or PDF of your official Government Soil Health Card (SHC) or laboratory test. Our document AI will parse the parameters for your review before updating the analysis."}
            </p>
          </div>

          {/* Upload Drop Zone */}
          <div className="rounded-lg border-2 border-dashed border-border hover:border-emerald-600 p-6 text-center space-y-3 transition-colors bg-background">
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>
            <div>
              <Label
                htmlFor="soil-report-input"
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {uploading ? "Extracting Soil Report Parameters..." : "Click to select Soil Health Card (PDF or Image)"}
              </Label>
              <input
                id="soil-report-input"
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={handleFileUpload}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Supports PDF, JPG, PNG up to 20MB
              </p>
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-md border border-rose-300 bg-rose-50 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-300">
              {uploadError}
            </div>
          )}

          {/* Extracted Values Review Card */}
          {extractedData && (
            <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Verified Scan: {extractedData.source_file}</span>
                </div>
                {extractedData.test_date && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Date: {extractedData.test_date}
                  </span>
                )}
              </div>

              {/* Extracted stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-background border border-border">
                  <div className="text-[10px] text-muted-foreground">Nitrogen (N)</div>
                  <div className="font-mono font-bold text-foreground">
                    {extractedData.nitrogen_kg_ha != null ? `${extractedData.nitrogen_kg_ha} kg/ha` : "N/A"}
                  </div>
                </div>
                <div className="p-2 rounded bg-background border border-border">
                  <div className="text-[10px] text-muted-foreground">Phosphorus (P)</div>
                  <div className="font-mono font-bold text-foreground">
                    {extractedData.phosphorus_kg_ha != null ? `${extractedData.phosphorus_kg_ha} kg/ha` : "N/A"}
                  </div>
                </div>
                <div className="p-2 rounded bg-background border border-border">
                  <div className="text-[10px] text-muted-foreground">Potassium (K)</div>
                  <div className="font-mono font-bold text-foreground">
                    {extractedData.potassium_kg_ha != null ? `${extractedData.potassium_kg_ha} kg/ha` : "N/A"}
                  </div>
                </div>
                <div className="p-2 rounded bg-background border border-border">
                  <div className="text-[10px] text-muted-foreground">Soil pH</div>
                  <div className="font-mono font-bold text-foreground">
                    {extractedData.soil_ph != null ? extractedData.soil_ph : "N/A"}
                  </div>
                </div>
              </div>

              {appliedReport ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Values reviewed and applied to your farm analysis!</span>
                </div>
              ) : (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyExtractedReport}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
                  >
                    <span>Apply Extracted Values to Analysis</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PARAMETERS INPUT GRID (Always visible or in Manual mode) */}
      <div className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {/* Nitrogen (N) */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-background/60">
            <div className="flex items-center justify-between text-xs">
              <div>
                <Label className="font-semibold text-foreground">Nitrogen (N)</Label>
                <span className="text-[10px] text-muted-foreground ml-1.5">Leaf canopy &amp; tillering</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={params.N}
                  onChange={(e) => onChange({ N: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-16 h-7 text-right font-mono text-xs px-1.5 rounded border border-border bg-background focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-muted-foreground">mg/kg</span>
              </div>
            </div>
            <Slider
              value={[params.N]}
              max={160}
              min={0}
              step={1}
              onValueChange={(v) => onChange({ N: v[0] })}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Low &lt;50</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Optimal: 50–120 mg/kg</span>
              <span>High &gt;120</span>
            </div>
          </div>

          {/* Phosphorus (P) */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-background/60">
            <div className="flex items-center justify-between text-xs">
              <div>
                <Label className="font-semibold text-foreground">Phosphorus (P)</Label>
                <span className="text-[10px] text-muted-foreground ml-1.5">Root elongation &amp; flowering</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={params.P}
                  onChange={(e) => onChange({ P: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-16 h-7 text-right font-mono text-xs px-1.5 rounded border border-border bg-background focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-muted-foreground">mg/kg</span>
              </div>
            </div>
            <Slider
              value={[params.P]}
              max={160}
              min={0}
              step={1}
              onValueChange={(v) => onChange({ P: v[0] })}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Low &lt;30</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Optimal: 30–65 mg/kg</span>
              <span>High &gt;75</span>
            </div>
          </div>

          {/* Potassium (K) */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-background/60">
            <div className="flex items-center justify-between text-xs">
              <div>
                <Label className="font-semibold text-foreground">Potassium (K)</Label>
                <span className="text-[10px] text-muted-foreground ml-1.5">Disease resistance &amp; grains</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={250}
                  value={params.K}
                  onChange={(e) => onChange({ K: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-16 h-7 text-right font-mono text-xs px-1.5 rounded border border-border bg-background focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-muted-foreground">mg/kg</span>
              </div>
            </div>
            <Slider
              value={[params.K]}
              max={200}
              min={0}
              step={1}
              onValueChange={(v) => onChange({ K: v[0] })}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Low &lt;35</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Optimal: 35–80 mg/kg</span>
              <span>High &gt;100</span>
            </div>
          </div>

          {/* Soil pH */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-background/60">
            <div className="flex items-center justify-between text-xs">
              <div>
                <Label className="font-semibold text-foreground">Soil pH</Label>
                <span className="text-[10px] text-muted-foreground ml-1.5">Acidity / Alkalinity level</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={14}
                  step={0.1}
                  value={params.ph}
                  onChange={(e) => onChange({ ph: parseFloat(e.target.value) || 7 })}
                  className="w-16 h-7 text-right font-mono text-xs px-1.5 rounded border border-border bg-background focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-muted-foreground">pH</span>
              </div>
            </div>
            <Slider
              value={[params.ph]}
              max={14}
              min={3}
              step={0.1}
              onValueChange={(v) => onChange({ ph: parseFloat(v[0].toFixed(1)) })}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Acidic &lt;6.0</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Optimal: 6.2–7.5</span>
              <span>Alkaline &gt;7.8</span>
            </div>
          </div>

          {/* Soil Moisture */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-background/60">
            <div className="flex items-center justify-between text-xs">
              <div>
                <Label className="font-semibold text-foreground">Soil Moisture</Label>
                <span className="text-[10px] text-muted-foreground ml-1.5">Root zone water capacity</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={params.moisture}
                  onChange={(e) => onChange({ moisture: parseInt(e.target.value) || 0 })}
                  className="w-16 h-7 text-right font-mono text-xs px-1.5 rounded border border-border bg-background focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[params.moisture]}
              max={100}
              min={5}
              step={1}
              onValueChange={(v) => onChange({ moisture: v[0] })}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Dry &lt;30%</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Field Capacity: 40–60%</span>
              <span>Saturated &gt;75%</span>
            </div>
          </div>

          {/* Organic Carbon (OC) */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-background/60">
            <div className="flex items-center justify-between text-xs">
              <div>
                <Label className="font-semibold text-foreground">Organic Carbon (OC)</Label>
                <span className="text-[10px] text-muted-foreground ml-1.5">Microbial health &amp; biology</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={2}
                  step={0.05}
                  value={params.organicCarbon}
                  onChange={(e) => onChange({ organicCarbon: parseFloat(e.target.value) || 0 })}
                  className="w-16 h-7 text-right font-mono text-xs px-1.5 rounded border border-border bg-background focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[params.organicCarbon]}
              max={1.5}
              min={0.1}
              step={0.05}
              onValueChange={(v) => onChange({ organicCarbon: parseFloat(v[0].toFixed(2)) })}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Low &lt;0.5%</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Medium: 0.5–0.75%</span>
              <span>High &gt;0.75%</span>
            </div>
          </div>

          {/* Electrical Conductivity (EC) */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-background/60">
            <div className="flex items-center justify-between text-xs">
              <div>
                <Label className="font-semibold text-foreground">Electrical Conductivity (EC)</Label>
                <span className="text-[10px] text-muted-foreground ml-1.5">Salinity hazard measurement</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={6}
                  step={0.1}
                  value={params.electricalConductivity}
                  onChange={(e) => onChange({ electricalConductivity: parseFloat(e.target.value) || 0 })}
                  className="w-16 h-7 text-right font-mono text-xs px-1.5 rounded border border-border bg-background focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-muted-foreground">dS/m</span>
              </div>
            </div>
            <Slider
              value={[params.electricalConductivity]}
              max={4}
              min={0.1}
              step={0.1}
              onValueChange={(v) => onChange({ electricalConductivity: parseFloat(v[0].toFixed(1)) })}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Normal &lt;1.0</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Critical Threshold: 2.0 dS/m</span>
              <span>Saline &gt;2.5</span>
            </div>
          </div>

          {/* Soil Temperature */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/80 bg-background/60">
            <div className="flex items-center justify-between text-xs">
              <div>
                <Label className="font-semibold text-foreground">Soil Temperature</Label>
                <span className="text-[10px] text-muted-foreground ml-1.5">Germination &amp; root activity</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={params.soilTemperature}
                  onChange={(e) => onChange({ soilTemperature: parseFloat(e.target.value) || 25 })}
                  className="w-16 h-7 text-right font-mono text-xs px-1.5 rounded border border-border bg-background focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-muted-foreground">°C</span>
              </div>
            </div>
            <Slider
              value={[params.soilTemperature]}
              max={45}
              min={10}
              step={1}
              onValueChange={(v) => onChange({ soilTemperature: v[0] })}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Cold &lt;15°C</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Active Zone: 20–32°C</span>
              <span>Warm &gt;35°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
