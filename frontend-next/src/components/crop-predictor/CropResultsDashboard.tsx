"use client"

import React, { useState } from "react"
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Droplets,
  Sprout,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Bookmark,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react"

export interface CropSuitabilityItem {
  crop: string
  display_name: string
  display_name_hi: string
  display_name_kn: string
  suitability_score: number
  match_level: string
  expected_yield: string
  water_requirement: string
  growing_conditions: string
  important_soil_params: string
  reasons: string[]
  precautions: string[]
}

export interface SoilHealthDiagnostic {
  parameter: string
  value: number
  unit: string
  status: string
  ideal_range: string
  impact: string
  action: string
}

export interface WeatherImpactSummary {
  temperature_evaluation: string
  humidity_evaluation: string
  rainfall_evaluation: string
  disease_pest_risk: string
  irrigation_advisory: string
}

export interface PredictionResultData {
  recommended_crop: string
  confidence: number
  ranked_recommendations?: CropSuitabilityItem[]
  soil_health_assessment?: SoilHealthDiagnostic[]
  weather_suitability?: WeatherImpactSummary
  next_steps?: string[]
}

interface Props {
  result: PredictionResultData | null
  loading: boolean
  onSaveAnalysis?: () => void
  saving?: boolean
  saveSuccess?: boolean
  dict: any
  lang?: string
}

export function CropResultsDashboard({
  result,
  loading,
  onSaveAnalysis,
  saving,
  saveSuccess,
  dict,
  lang = "en",
}: Props) {
  const [showComparison, setShowComparison] = useState(false)
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null)

  // Empty State (Before Analysis)
  if (!result && !loading) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center space-y-4 shadow-2xs">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Sprout className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-sm font-bold text-foreground">
            {dict.emptyStateTitle || "No Farm Analysis Run Yet"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {dict.emptyStateDesc ||
              "Configure your farm profile, verify your soil parameters, and click 'Analyze My Farm' to view ranked crop recommendations."}
          </p>
        </div>

        {/* 3 Step Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 max-w-lg mx-auto text-left">
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-400">
              STEP 1
            </span>
            <p className="text-xs font-semibold text-foreground">Set Farm Location</p>
            <p className="text-[10px] text-muted-foreground">Auto-detect GPS to load regional climate.</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-400">
              STEP 2
            </span>
            <p className="text-xs font-semibold text-foreground">Verify Soil Status</p>
            <p className="text-[10px] text-muted-foreground">Adjust NPK, pH or upload Soil Health Card.</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-400">
              STEP 3
            </span>
            <p className="text-xs font-semibold text-foreground">Analyze &amp; Plan</p>
            <p className="text-[10px] text-muted-foreground">Get ranked crops, diagnostics and advice.</p>
          </div>
        </div>
      </div>
    )
  }

  // Loading State
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4 shadow-2xs">
        <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-sm font-bold text-foreground">
            Evaluating Farm &amp; Agronomic Norms
          </h3>
          <p className="text-xs text-muted-foreground">
            {dict.analyzingProgress ||
              "Cross-referencing soil chemistry, regional temperature, and ICAR package of practices..."}
          </p>
        </div>
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-emerald-600 rounded-full animate-indeterminate" />
        </div>
      </div>
    )
  }

  if (!result) return null

  const topCrop = result.ranked_recommendations?.[0]
  const otherCrops = result.ranked_recommendations?.slice(1) || []

  return (
    <div className="space-y-6">
      {/* SECTION A: TOP RECOMMENDED CROP HERO BANNER */}
      <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-white dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-background p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-700 text-white shadow-2xs">
              <Trophy className="h-3 w-3" />
              <span>Highest Agronomic Match</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {topCrop?.display_name || result.recommended_crop}
            </h2>
            {topCrop && (lang === "hi" ? topCrop.display_name_hi : lang === "kn" ? topCrop.display_name_kn : null) && (
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {lang === "hi" ? topCrop.display_name_hi : topCrop.display_name_kn}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {onSaveAnalysis && (
              <button
                type="button"
                onClick={onSaveAnalysis}
                disabled={saving || saveSuccess}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-600 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 transition-colors disabled:opacity-60"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Saved to Profile</span>
                  </>
                ) : saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{dict.saveAnalysisBtn || "Save Analysis"}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowComparison((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{showComparison ? "Hide Comparison" : dict.compareCropsBtn || "Compare Crops"}</span>
            </button>
          </div>
        </div>

        {/* Key Benchmark Highlights */}
        {topCrop && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-background/80 border border-emerald-200 dark:border-emerald-900/60 space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Suitability Score
              </span>
              <div className="text-xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                {topCrop.suitability_score}%
              </div>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold">
                {topCrop.match_level} Match
              </span>
            </div>

            <div className="p-3 rounded-lg bg-background/80 border border-emerald-200 dark:border-emerald-900/60 space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Expected Yield
              </span>
              <div className="text-sm font-bold text-foreground">
                {topCrop.expected_yield}
              </div>
              <span className="text-[10px] text-muted-foreground">Standard good practice</span>
            </div>

            <div className="p-3 rounded-lg bg-background/80 border border-emerald-200 dark:border-emerald-900/60 space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Water Requirement
              </span>
              <div className="text-xs font-bold text-foreground">
                {topCrop.water_requirement}
              </div>
              <span className="text-[10px] text-muted-foreground">Total crop duration</span>
            </div>

            <div className="p-3 rounded-lg bg-background/80 border border-emerald-200 dark:border-emerald-900/60 space-y-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Soil Nutrition
              </span>
              <div className="text-xs font-medium text-foreground line-clamp-2">
                {topCrop.important_soil_params}
              </div>
            </div>
          </div>
        )}

        {/* Top Crop Reasons */}
        {topCrop && topCrop.reasons.length > 0 && (
          <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              Why this crop fits your farm:
            </span>
            <ul className="text-xs text-emerald-800 dark:text-emerald-300/90 space-y-1">
              {topCrop.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SECTION B: CROP COMPARISON MATRIX */}
      {showComparison && result.ranked_recommendations && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <BarChart3 className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">
              {dict.cropComparisonTitle || "Crop Comparison Matrix"}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold">
                  <th className="p-2.5">Crop Name</th>
                  <th className="p-2.5">Suitability</th>
                  <th className="p-2.5">Yield Potential</th>
                  <th className="p-2.5">Water Requirement</th>
                  <th className="p-2.5">Growing Conditions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.ranked_recommendations.map((c, i) => (
                  <tr key={c.crop} className={i === 0 ? "bg-emerald-50/40 dark:bg-emerald-950/20 font-semibold" : ""}>
                    <td className="p-2.5">
                      <div className="text-foreground">{c.display_name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.display_name_hi}</div>
                    </td>
                    <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">
                      {c.suitability_score}% ({c.match_level})
                    </td>
                    <td className="p-2.5 text-foreground">{c.expected_yield}</td>
                    <td className="p-2.5 text-muted-foreground">{c.water_requirement}</td>
                    <td className="p-2.5 text-muted-foreground max-w-xs truncate">{c.growing_conditions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION C: RANKED ALTERNATIVE CROPS */}
      {otherCrops.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">
                {dict.recommendedCropsTitle || "Other Suitable Crop Matches"}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">Ranked by agronomic score</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {otherCrops.map((c, idx) => {
              const isExpanded = expandedCrop === c.crop
              return (
                <div
                  key={c.crop}
                  className="p-4 rounded-lg border border-border hover:border-emerald-500/50 transition-colors bg-background/60 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          #{idx + 2}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">{c.display_name}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Yield: <strong className="text-foreground">{c.expected_yield}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                        {c.suitability_score}%
                      </span>
                      <div className="text-[10px] text-muted-foreground">{c.match_level}</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="line-clamp-2">{c.growing_conditions}</p>
                    <p className="text-[11px]">
                      Water: <span className="text-foreground">{c.water_requirement}</span>
                    </p>
                  </div>

                  {/* Toggle details */}
                  <button
                    type="button"
                    onClick={() => setExpandedCrop(isExpanded ? null : c.crop)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>{isExpanded ? "Hide Details" : "View Agronomic Factors"}</span>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {isExpanded && (
                    <div className="pt-2 border-t border-border space-y-2 text-[11px]">
                      <div className="space-y-1">
                        <strong className="text-foreground">Why it matches:</strong>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                          {c.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                      {c.precautions.length > 0 && (
                        <div className="space-y-1">
                          <strong className="text-foreground">Key Precaution:</strong>
                          <p className="text-muted-foreground">{c.precautions[0]}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SECTION D: SOIL HEALTH DIAGNOSTICS & CORRECTIVE ACTIONS */}
      {result.soil_health_assessment && result.soil_health_assessment.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">
              {dict.soilImprovementTitle || "Soil Diagnostics & Corrective Amendments"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {result.soil_health_assessment.map((diag) => {
              const isDeficient = diag.status.toLowerCase().includes("deficient") || diag.status.toLowerCase().includes("acidic") || diag.status.toLowerCase().includes("alkaline")
              return (
                <div
                  key={diag.parameter}
                  className={`p-3.5 rounded-lg border space-y-2 ${
                    isDeficient
                      ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20"
                      : "border-border bg-background/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{diag.parameter}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        isDeficient
                          ? "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200"
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {diag.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    Current: <strong className="font-mono text-foreground">{diag.value} {diag.unit}</strong>{" "}
                    (Ideal: {diag.ideal_range})
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{diag.impact}</p>

                  <div className="pt-1.5 border-t border-border/60">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-400">
                      Recommended Action:
                    </span>
                    <p className="text-xs font-medium text-foreground mt-0.5">{diag.action}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SECTION E: WEATHER SUITABILITY & CLIMATE ADVISORY */}
      {result.weather_suitability && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <Thermometer className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">
              {dict.weatherSuitabilityTitle || "Weather Suitability & Climate Risk Assessment"}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-background/60 space-y-1">
              <strong className="text-foreground">Temperature Evaluation:</strong>
              <p className="text-muted-foreground">{result.weather_suitability.temperature_evaluation}</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-background/60 space-y-1">
              <strong className="text-foreground">Humidity &amp; Precipitation Impact:</strong>
              <p className="text-muted-foreground">{result.weather_suitability.humidity_evaluation}</p>
              <p className="text-muted-foreground">{result.weather_suitability.rainfall_evaluation}</p>
            </div>

            <div className="p-3 rounded-lg border border-amber-300/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                <span>Disease &amp; Pest Pressure Forecast</span>
              </div>
              <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                {result.weather_suitability.disease_pest_risk}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-sky-300/60 dark:border-sky-900/40 bg-sky-50/30 dark:bg-sky-950/20 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-900 dark:text-sky-300 font-bold">
                <Droplets className="h-3.5 w-3.5 text-sky-600" />
                <span>Irrigation Scheduling Advisory</span>
              </div>
              <p className="text-sky-800 dark:text-sky-300/90 leading-relaxed">
                {result.weather_suitability.irrigation_advisory}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION F: ACTIONABLE NEXT STEPS */}
      {result.next_steps && result.next_steps.length > 0 && (
        <div className="rounded-xl border border-emerald-300/70 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-900 pb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-foreground">
              {dict.nextStepsTitle || "Actionable Agronomic Next Steps"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {result.next_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-background border border-border">
                <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                  {idx + 1}
                </span>
                <p className="text-foreground leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="pt-1 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
            <span>
              Predictions are decision-support benchmarks based on agricultural science and prevailing conditions; they do not represent guaranteed financial returns.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
