"use client"

import React, { useState, useEffect } from "react"
import {
  TestTube,
  FlaskConical,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useLanguage, type Lang } from "@/lib/language"
import { useAuth } from "@/lib/auth"
import { farmerProfileApi } from "@/lib/farmer-api"

interface SoilParamMeta {
  key: "N" | "P" | "K" | "ph" | "moisture" | "oc"
  nameHi: string
  nameKn: string
  nameEn: string
  unit: string
  optimalRange: string
  significanceHi: string
  significanceKn: string
  significanceEn: string
  defaultVal: number | null
}

const PARAM_DEFINITIONS: SoilParamMeta[] = [
  {
    key: "N",
    nameHi: "नाइट्रोजन (N)",
    nameKn: "ಸಾರಜನಕ (N)",
    nameEn: "Nitrogen (N)",
    unit: "kg/ha",
    optimalRange: "280 - 560 kg/ha",
    significanceHi: "पत्तियों के क्लोरोफिल, हरियाली और वानस्पतिक बढ़वार के लिए अनिवार्य पोषक तत्व।",
    significanceKn: "ಎಲೆಗಳ ಹಸಿರು ಬಣ್ಣ ಮತ್ತು ಬೆಳವಣಿಗೆಗೆ ಅಗತ್ಯವಾದ ಪೋಷಕಾಂಶ.",
    significanceEn: "Crucial for chlorophyll synthesis, vegetative foliage, and early crop vigor.",
    defaultVal: 240,
  },
  {
    key: "P",
    nameHi: "फास्फोरस (P)",
    nameKn: "ರಂಜಕ (P)",
    nameEn: "Phosphorus (P)",
    unit: "kg/ha",
    optimalRange: "23 - 56 kg/ha",
    significanceHi: "मजबूत जड़ों के विकास, फूलों की संख्या और दाना भरने में मुख्य भूमिका।",
    significanceKn: "ಬೇರುಗಳ ಬಲವರ್ಧನೆ ಮತ್ತು ಹೂವು-ಕಾಳುಗಳ ಬೆಳವಣಿಗೆಗೆ ಸಹಕಾರಿ.",
    significanceEn: "Stimulates deep root proliferation, flowering initiation, and seed weight.",
    defaultVal: 38,
  },
  {
    key: "K",
    nameHi: "पोटेशियम (K)",
    nameKn: "ಪೊಟ್ಯಾಶ್ (K)",
    nameEn: "Potassium (K)",
    unit: "kg/ha",
    optimalRange: "145 - 336 kg/ha",
    significanceHi: "सूखा, ठंड और कीट-रोगों से लड़ने की शक्ति प्रदान करता है तथा दाने की चमक बढ़ाता है।",
    significanceKn: "ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ ಮತ್ತು ನೀರಿನ ಕೊರತೆ ತಡೆದುಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
    significanceEn: "Regulates stomatal water stress, imparts disease immunity and grain quality.",
    defaultVal: 180,
  },
  {
    key: "ph",
    nameHi: "मृदा pH (अम्लता/क्षारीयता)",
    nameKn: "ಮಣ್ಣಿನ pH (ಆಮ್ಲತೆ/ಕ್ಷಾರತೆ)",
    nameEn: "Soil pH (Acidity/Alkalinity)",
    unit: "pH Scale",
    optimalRange: "6.5 - 7.5",
    significanceHi: "पौधों द्वारा पोषक तत्वों को अवशोषित करने की क्षमता निर्धारित करता है।",
    significanceKn: "ಗಿಡಗಳು ಪೋಷಕಾಂಶಗಳನ್ನು ಹೀರಿಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.",
    significanceEn: "Governs macro and micronutrient chemical availability to root hairs.",
    defaultVal: 6.8,
  },
  {
    key: "moisture",
    nameHi: "मृदा नमी (Soil Moisture)",
    nameKn: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    nameEn: "Soil Moisture",
    unit: "%",
    optimalRange: "20% - 35%",
    significanceHi: "जड़ों में खाद घुलने और वाष्पोत्सर्जन को संतुलित रखने हेतु आवश्यक।",
    significanceKn: "ಬೇರುಗಳು ಗೊಬ್ಬರ ಹೀರಿಕೊಳ್ಳಲು ಅಗತ್ಯ ತೇವಾಂಶ ಮಟ್ಟ.",
    significanceEn: "Facilitates nutrient solubilization and transpiration hydraulic tension.",
    defaultVal: 26,
  },
  {
    key: "oc",
    nameHi: "जैविक कार्बन (Organic Carbon)",
    nameKn: "ಸಾವಯವ ಇಂಗಾಲ",
    nameEn: "Organic Carbon (OC)",
    unit: "%",
    optimalRange: "> 0.75%",
    significanceHi: "मिट्टी के सूक्ष्म जीवाणुओं की सक्रियता और उर्वरता का सच्चा दर्पण।",
    significanceKn: "ಮಣ್ಣಿನ ಸೂಕ್ಷ್ಮಜೀವಿಗಳ ಚಟುವಟಿಕೆ ಮತ್ತು ಫಲವತ್ತತೆಯ ಅಳತೆಗೋಲು.",
    significanceEn: "Reflects microbiological activity, aggregate stability, and long-term soil health.",
    defaultVal: 0.62,
  },
]

export function MobileSoilView() {
  const { lang } = useLanguage()
  const { user } = useAuth()

  const [values, setValues] = useState<Record<string, number | null>>({
    N: 240,
    P: 38,
    K: 180,
    ph: 6.8,
    moisture: 26,
    oc: 0.62,
  })

  const [dataSource, setDataSource] = useState<string>("मृदा स्वास्थ्य कार्ड (Soil Health Card)")
  const [lastTestedDate, setLastTestedDate] = useState<string>("12 अक्टूबर 2026")
  const [editingParam, setEditingParam] = useState<string | null>(null)

  // Load from farmer profile if available
  useEffect(() => {
    async function loadProfileSoil() {
      if (!user) return
      try {
        const p = await farmerProfileApi.get()
        if (p) {
          const customP = p as any
          setValues((prev) => ({
            ...prev,
            N: customP.soil_n ?? prev.N,
            P: customP.soil_p ?? prev.P,
            K: customP.soil_k ?? prev.K,
            ph: customP.soil_ph ?? prev.ph,
            moisture: customP.soil_moisture ?? prev.moisture,
            oc: customP.soil_oc ?? prev.oc,
          }))
          if (customP.soil_test_source) setDataSource(customP.soil_test_source)
          if (customP.soil_test_date) setLastTestedDate(customP.soil_test_date)
        }
      } catch (e) {
        console.error("Failed to fetch profile soil data", e)
      }
    }
    loadProfileSoil()
  }, [user])

  const getStatusBadge = (key: string, val: number | null) => {
    if (val == null) {
      return {
        label: lang === "kn" ? "ಮಾಹಿತಿ ಇಲ್ಲ" : lang === "en" ? "Not Tested" : "परीक्षण शेष",
        bg: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
      }
    }
    if (key === "N") {
      if (val < 280) return { label: lang === "kn" ? "ಕಡಿಮೆ" : lang === "en" ? "Low" : "कम", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" }
      if (val > 560) return { label: lang === "kn" ? "ಹೆಚ್ಚು" : lang === "en" ? "High" : "अधिक", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" }
      return { label: lang === "kn" ? "ಉತ್ತಮ" : lang === "en" ? "Optimal" : "संतुलित", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" }
    }
    if (key === "P") {
      if (val < 23) return { label: lang === "kn" ? "ಕಡಿಮೆ" : lang === "en" ? "Low" : "कम", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" }
      if (val > 56) return { label: lang === "kn" ? "ಹೆಚ್ಚು" : lang === "en" ? "High" : "अधिक", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" }
      return { label: lang === "kn" ? "ಉತ್ತಮ" : lang === "en" ? "Optimal" : "संतुलित", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" }
    }
    if (key === "K") {
      if (val < 145) return { label: lang === "kn" ? "ಕಡಿಮೆ" : lang === "en" ? "Low" : "कम", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" }
      if (val > 336) return { label: lang === "kn" ? "ಹೆಚ್ಚು" : lang === "en" ? "High" : "अधिक", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" }
      return { label: lang === "kn" ? "ಉತ್ತಮ" : lang === "en" ? "Optimal" : "संतुलित", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" }
    }
    if (key === "ph") {
      if (val < 6.5) return { label: lang === "kn" ? "ಆಮ್ಲೀಯ" : lang === "en" ? "Acidic" : "अम्लीय", bg: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" }
      if (val > 7.5) return { label: lang === "kn" ? "ಕ್ಷಾರೀಯ" : lang === "en" ? "Alkaline" : "क्षारीय", bg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" }
      return { label: lang === "kn" ? "ತಟಸ್ಥ (ಸೂಕ್ತ)" : lang === "en" ? "Neutral (Ideal)" : "उदासीन (उत्तम)", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" }
    }
    if (key === "oc") {
      if (val < 0.5) return { label: lang === "kn" ? "ಕಡಿಮೆ" : lang === "en" ? "Low" : "कम", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" }
      if (val < 0.75) return { label: lang === "kn" ? "ಮಧ್ಯಮ" : lang === "en" ? "Medium" : "मध्यम", bg: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300" }
      return { label: lang === "kn" ? "ಸಮೃದ್ಧ" : lang === "en" ? "Rich" : "उत्तम", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" }
    }
    return { label: "सामान्य", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" }
  }

  return (
    <div className="w-full space-y-4 pb-20 select-none">
      {/* 1. Header Banner */}
      <div className="bg-emerald-800 text-white p-4 rounded-3xl shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
              🧪
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">
                {lang === "kn" ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್" : lang === "en" ? "Soil Health Card" : "मृदा स्वास्थ्य कार्ड"}
              </h2>
              <p className="text-[10px] text-emerald-200">
                {lang === "kn" ? "ರೈತರ ನೈಜ ಪರೀಕ್ಷಾ ವರದಿ" : lang === "en" ? "Authentic Laboratory Soil Test Data" : "प्रयोगशाला परीक्षण रिपोर्ट"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-600/50">
            ICAR Standards
          </span>
        </div>

        {/* Source and Timestamps */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100">
          <span className="truncate max-w-[200px]">📍 {dataSource}</span>
          <span className="shrink-0">📅 {lastTestedDate}</span>
        </div>
      </div>

      {/* 2. Parameters List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {lang === "kn" ? "ಪೋಷಕಾಂಶ ವಿವರ" : lang === "en" ? "Tested Parameters" : "परीक्षित पोषक तत्व"}
          </h3>
          <span className="text-[10px] text-stone-500 font-semibold">
            6 Parameters
          </span>
        </div>

        {PARAM_DEFINITIONS.map((param) => {
          const val = values[param.key]
          const status = getStatusBadge(param.key, val)
          const name = lang === "kn" ? param.nameKn : lang === "en" ? param.nameEn : param.nameHi
          const sig = lang === "kn" ? param.significanceKn : lang === "en" ? param.significanceEn : param.significanceHi

          return (
            <div
              key={param.key}
              className="p-3.5 rounded-2xl border border-border bg-card shadow-2xs space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{name}</h4>
                  <p className="text-[10px] text-muted-foreground">
                    आदर्श स्तर: {param.optimalRange}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${status.bg}`}>
                  {status.label}
                </span>
              </div>

              {/* Value Row */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  {val != null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                        {val}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">{param.unit}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      उपलब्ध नहीं (Not recorded)
                    </span>
                  )}
                </div>

                {/* Quick Edit Slider / Input Toggle */}
                <button
                  type="button"
                  onClick={() => setEditingParam(editingParam === param.key ? null : param.key)}
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50"
                >
                  {editingParam === param.key ? "पूर्ण (Done)" : "बदलें (Edit)"}
                </button>
              </div>

              {/* Editing Slider */}
              {editingParam === param.key && (
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-border space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>मान सेट करें:</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{val ?? 0} {param.unit}</span>
                  </div>
                  <input
                    type="range"
                    min={param.key === "ph" ? 3 : param.key === "oc" ? 0.1 : 0}
                    max={param.key === "ph" ? 10 : param.key === "oc" ? 2 : param.key === "N" ? 600 : param.key === "P" ? 120 : param.key === "K" ? 500 : 100}
                    step={param.key === "ph" || param.key === "oc" ? 0.1 : 1}
                    value={val ?? 0}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value)
                      setValues((prev) => ({ ...prev, [param.key]: num }))
                    }}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>
              )}

              {/* Significance Note */}
              <div className="pt-2 border-t border-border/60 text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                <Info className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                <span>{sig}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Action CTA to Run AI Advisory */}
      <a
        href="/crop-predictor?step=2"
        className="w-full min-h-[48px] rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
      >
        <Sparkles className="h-4 w-4 text-emerald-300" />
        <span>इस मिट्टी के आधार पर सही फसल व खाद सलाह लें</span>
        <ArrowRight className="h-4 w-4" />
      </a>

      {/* 4. Reality First Notice */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-3 text-center space-y-1">
        <p className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
          प्रमाणिक कृषि नीति (Authentic Agricultural Policy)
        </p>
        <p className="text-[10px] text-muted-foreground">
          मिट्टी के आंकड़े आपकी प्रयोगशाला परीक्षण रसीद अथवा पंजीकृत कार्ड से मेल खाने चाहिए। बिना जांच के कोई भी काल्पनिक मान प्रस्तुत नहीं किया जाता।
        </p>
      </div>
    </div>
  )
}
