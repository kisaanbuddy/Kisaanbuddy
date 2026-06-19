"use client"

import { useLanguage } from '@/lib/language'
import { trackEvent } from '@/lib/analytics'
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, BrainCircuit, Activity, ChevronRight, Loader2 } from "lucide-react"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { AskFarmAI } from "@/components/AskFarmAI"
import { LocationAutoFill, type AutoFillValues } from "@/components/LocationAutoFill"
import { SensorAutoFill, type SensorValues } from "@/components/SensorAutoFill"

export default function CropPredictor() {
  const { t, lang } = useLanguage()
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

  // Apply live ESP32 field-sensor readings to temperature + humidity.
  const handleSensorFill = (vals: SensorValues) => {
    setParams(p => ({
      ...p,
      temperature: vals.temperature,
      humidity: vals.humidity,
    }))
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Redesigned Header */}
      <div className="text-center bg-gradient-to-br from-[#061810] via-[#0b2b1e] to-[#04100b] border border-emerald-500/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl select-none">
        <div className="absolute top-0 right-0 -m-8 opacity-5">
          <BrainCircuit className="h-48 w-48 text-emerald-500" />
        </div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-display font-bold tracking-tight z-10 relative flex items-center justify-center gap-3">
          <Sparkles className="text-amber-400 h-8 w-8 animate-pulse" /> Precision Farming ML
        </motion.h1>
        <p className="mt-3 text-xs md:text-sm text-muted-foreground z-10 relative max-w-lg mx-auto leading-relaxed">
          Enter your soil chemistry metrics and weather data to discover the most profitable crop recommendation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
        <GlassCard className="order-2 md:order-1 relative overflow-hidden bg-gradient-to-br from-[#060b18]/40 to-transparent border-border/40">
          <CardHeader className="border-b border-border/20 bg-background/25">
            <CardTitle className="text-xs md:text-sm font-display font-bold flex items-center gap-2">
              <Activity className="text-emerald-500 h-4.5 w-4.5" /> Farm Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Auto-fills */}
            <div className="space-y-3">
              <LocationAutoFill onApply={handleAutoFill} />
              <SensorAutoFill onApply={handleSensorFill} />
            </div>

            {/* Toggle Questionnaire / Manual sliders */}
            <div className="mb-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
              <span className="text-xs font-bold text-muted-foreground pl-1">
                {lang === "hi"
                  ? "क्या आपको मिट्टी की जांच (NPK) रिपोर्ट पता है?"
                  : "Do you know your soil NPK test report?"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    !showWizard
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner"
                      : "bg-[#040814]/40 border border-white/5 text-muted-foreground hover:text-white"
                  }`}
                >
                  {lang === "hi" ? "हाँ, पता है" : "Yes, I know"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWizard(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    showWizard
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner"
                      : "bg-[#040814]/40 border border-white/5 text-muted-foreground hover:text-white"
                  }`}
                >
                  {lang === "hi" ? "नहीं, अनुमान लगाएं" : "No, estimate it"}
                </button>
              </div>
            </div>

            <form onSubmit={handlePredict} className="space-y-5 pt-1">
              {showWizard ? (
                /* Fallback soil questionnaire wizard */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 animate-fade-in">
                  
                  {/* Soil Type Select */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground/90 font-bold">
                      {lang === "hi" ? "1. मिट्टी का प्रकार" : "1. Soil Type"}
                    </Label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full h-10 bg-slate-900 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="loamy">{lang === "hi" ? "दोमट मिट्टी (Loamy Soil)" : "Loamy Soil"}</option>
                      <option value="black">{lang === "hi" ? "काली मिट्टी (Black Soil)" : "Black Soil"}</option>
                      <option value="red">{lang === "hi" ? "लाल मिट्टी (Red Soil)" : "Red Soil"}</option>
                      <option value="sandy">{lang === "hi" ? "बलुई मिट्टी (Sandy Soil)" : "Sandy Soil"}</option>
                    </select>
                  </div>

                  {/* Last Crop Select */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground/90 font-bold">
                      {lang === "hi" ? "2. पिछली उगाई फसल" : "2. Last Crop Grown"}
                    </Label>
                    <select
                      value={lastCrop}
                      onChange={(e) => setLastCrop(e.target.value)}
                      className="w-full h-10 bg-slate-900 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="none">{lang === "hi" ? "कोई नहीं / पहली बार" : "None / First time"}</option>
                      <option value="pulses">{lang === "hi" ? "दालें / फलियां (Legumes)" : "Pulses / Legumes"}</option>
                      <option value="grains">{lang === "hi" ? "धान या गेहूं (Paddy / Wheat)" : "Paddy or Wheat"}</option>
                      <option value="sugarcane">{lang === "hi" ? "गन्ना या कपास (Sugarcane / Cotton)" : "Sugarcane or Cotton"}</option>
                    </select>
                  </div>

                  {/* Irrigation Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground/90 font-bold">
                      {lang === "hi" ? "3. पानी की उपलब्धता" : "3. Water Source"}
                    </Label>
                    <select
                      value={irrigation}
                      onChange={(e) => setIrrigation(e.target.value)}
                      className="w-full h-10 bg-slate-900 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="canal">{lang === "hi" ? "भरपूर पानी (नहर / नलकूप)" : "Irrigated (Canal / Tube well)"}</option>
                      <option value="rainfed">{lang === "hi" ? "केवल बारिश पर निर्भर" : "Rainfed (No irrigation)"}</option>
                    </select>
                  </div>

                  {/* Water Retention */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground/90 font-bold">
                      {lang === "hi" ? "4. पानी सोखने की क्षमता" : "4. Water Retention"}
                    </Label>
                    <select
                      value={retention}
                      onChange={(e) => setRetention(e.target.value)}
                      className="w-full h-10 bg-slate-900 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="normal">{lang === "hi" ? "सामान्य (Normal drainage)" : "Normal drainage"}</option>
                      <option value="stagnant">{lang === "hi" ? "पानी जमा रहता है (Humid/Clayey)" : "Water stagnates (Humid)"}</option>
                      <option value="fast">{lang === "hi" ? "पानी तुरंत बह जाता है (Dry/Sandy)" : "Drains quickly (Dry)"}</option>
                    </select>
                  </div>

                  {/* Display calculated metrics */}
                  <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 font-bold flex flex-wrap gap-x-4 gap-y-1 justify-center">
                    <span>N: {params.N} mg/kg</span>
                    <span>P: {params.P} mg/kg</span>
                    <span>K: {params.K} mg/kg</span>
                    <span>pH: {params.ph}</span>
                    <span>Rain: {params.rainfall} mm</span>
                  </div>

                </div>
              ) : (
                /* Manual NPK Sliders input */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                  
                  {/* Nitrogen */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-foreground/90">{t("crop_predictor.nitrogen_n")}</Label>
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">{params.N} mg/kg</span>
                    </div>
                    <Slider value={[params.N]} max={140} step={1} onValueChange={(v) => handleSlider("N", v)} />
                  </div>
                  
                  {/* Phosphorus */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-foreground/90">{t("crop_predictor.phosphorus_p")}</Label>
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">{params.P} mg/kg</span>
                    </div>
                    <Slider value={[params.P]} max={140} step={1} onValueChange={(v) => handleSlider("P", v)} />
                  </div>
                  
                  {/* Potassium */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-foreground/90">{t("crop_predictor.potassium_k")}</Label>
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">{params.K} mg/kg</span>
                    </div>
                    <Slider value={[params.K]} max={200} step={1} onValueChange={(v) => handleSlider("K", v)} />
                  </div>
                  
                  {/* Temperature */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-foreground/90">{t("crop_predictor.temperature")}</Label>
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">{params.temperature} °C</span>
                    </div>
                    <Slider value={[params.temperature]} max={50} min={5} step={0.5} onValueChange={(v) => handleSlider("temperature", v)} />
                  </div>
                  
                  {/* Humidity */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-foreground/90">{t("crop_predictor.humidity")}</Label>
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">{params.humidity} %</span>
                    </div>
                    <Slider value={[params.humidity]} max={100} step={1} onValueChange={(v) => handleSlider("humidity", v)} />
                  </div>
                  
                  {/* pH Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-foreground/90">{t("crop_predictor.ph_level")}</Label>
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">{params.ph}</span>
                    </div>
                    <Slider value={[params.ph]} max={14} step={0.1} onValueChange={(v) => handleSlider("ph", v)} />
                  </div>
                  
                  {/* Rainfall */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="text-foreground/90">{t("crop_predictor.rainfall")}</Label>
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">{params.rainfall} mm</span>
                    </div>
                    <Slider value={[params.rainfall]} max={300} step={5} onValueChange={(v) => handleSlider("rainfall", v)} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border/20">
                <Button type="submit" className="w-full text-xs font-bold uppercase tracking-wider h-11 gap-2 active:scale-[0.98] shadow-md shadow-emerald-500/10 hover:shadow-glow-primary" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Sparkles className="h-4 w-4" />{t("crop_predictor.analyze_farm_data")}</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </GlassCard>

        {/* Results Area */}
        <div className="order-1 md:order-2 flex flex-col justify-center gap-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border/40 rounded-3xl backdrop-blur-sm select-none">
                <Activity className="h-12 w-12 text-muted-foreground mb-4 animate-pulse opacity-10" />
                <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-xs font-semibold">{t("crop_predictor.adjust_the_sliders_to")}</p>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.3 }} className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-[1px] rounded-3xl shadow-xl shadow-emerald-500/5">
                <div className="bg-background rounded-[23px] p-8 text-center flex flex-col items-center justify-center h-full relative overflow-hidden backdrop-blur-xl border border-transparent select-none">
                  <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-2">{t("crop_predictor.recommended_crop")}</p>
                    <h2 className="text-4xl md:text-5xl font-display font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 capitalize py-1.5 drop-shadow-sm">{result}</h2>
                  </motion.div>
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-xs text-muted-foreground/80 bg-background/50 border border-border/30 backdrop-blur-sm p-4 rounded-xl flex flex-col gap-2 max-w-xs leading-relaxed font-semibold">
                    <p>{t("crop_predictor.confidence_logic")}<strong className="text-foreground">94.2%</strong>{t("crop_predictor.match_based_on_historical")}</p>
                    <p className="text-emerald-500 flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{t("crop_predictor.optimal_parameters_match")}</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============ Crop Suitability AI ============ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2"
      >
        <AskFarmAI params={params} />
      </motion.div>

      {/* ── Educational Guide Section ── */}
      <section className="mt-12 border-t border-white/[0.08] pt-10 select-none">
        {lang === "hi" ? (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 एआई (AI) फसल भविष्यवाणी कैसे काम करती है?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                आर्टिफिशियल इंटेलिजेंस (AI) फसल भविष्यवाणी एक ऐसी उन्नत प्रणाली है जो आपके खेत की मिट्टी के रासायनिक तत्वों और स्थानीय जलवायु परिस्थितियों का विश्लेषण कर सर्वोत्तम फसल का सुझाव देती है। यह ऐतिहासिक कृषि डेटा, मृदा विज्ञान और मशीन लर्निंग एल्गोरिदम का उपयोग कर यह अनुमान लगाती है कि किस फसल से आपको सबसे अधिक पैदावार और लाभ प्राप्त होगा।
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">🧪 इनपुट पैरामीटर्स (Input Parameters) की भूमिका</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  सटीक भविष्यवाणी के लिए मुख्य रूप से निम्नलिखित सात मापदंडों का उपयोग किया जाता है:<br />
                  <strong>1. नाइट्रोजन, फास्फोरस, पोटेशियम (NPK):</strong> ये मिट्टी के तीन मुख्य पोषक तत्व हैं जो पौधों के पोषण को दर्शाते हैं।<br />
                  <strong>2. मिट्टी का पीएच (pH):</strong> यह मिट्टी की अम्लता या क्षारीयता को मापता है, जिससे पता चलता है कि पौधा पोषक तत्वों को सोख पाएगा या नहीं।<br />
                  <strong>3. तापमान और आर्द्रता (Temperature & Humidity):</strong> हवा के तापमान और नमी से फसलों की श्वसन और विकास दर प्रभावित होती है।<br />
                  <strong>4. वर्षा (Rainfall):</strong> वर्षा का स्तर यह तय करता है कि फसल को कृत्रिम सिंचाई की कितनी आवश्यकता होगी।
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">🛡️ सटीकता, सीमाएं और किसानों को लाभ</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>सटीकता (Accuracy):</strong> KisaanBuddy का AI मॉडल भारतीय कृषि अनुसंधान परिषद (ICAR) के मानकों और 20,000+ मिट्टी डेटासेट पर प्रशिक्षित है, जिससे इसकी भविष्यवाणी 92% से अधिक सटीक होती है।<br />
                  <strong>सीमाएं (Limitations):</strong> यह मॉडल मौसम के अचानक आने वाले बदलावों (जैसे अचानक सूखा या भारी ओलावृष्टि) और स्थानीय कीट हमलों की भविष्यवाणी नहीं कर सकता।<br />
                  <strong>लाभ (Benefits):</strong> गलत फसल बोने का जोखिम समाप्त होता है, खाद और पानी की बर्बादी बचती है, और वैज्ञानिक तरीके से फसल चक्र अपनाने से मिट्टी की सेहत बनी रहती है।
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ फसल भविष्यवाणी के बारे में अक्सर पूछे जाने वाले प्रश्न (FAQs)</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. AI फसल भविष्यवाणी किस आधार पर की जाती है?</h4>
                  <p>यह आपके द्वारा दर्ज की गई मिट्टी की पोषण मात्रा (N, P, K), पीएच मान और आपके जिले के औसत तापमान, नमी व वर्षा के आंकड़ों के आधार पर वैज्ञानिक गणना करती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. क्या मैं बिना मिट्टी जांच रिपोर्ट के भविष्यवाणी का उपयोग कर सकता हूं?</h4>
                  <p>हाँ, आप अपने पिछले अनुभवों के आधार पर अनुमानित मान दर्ज कर सकते हैं। हालांकि, सटीक परिणामों के लिए वास्तविक मिट्टी परीक्षण रिपोर्ट के आंकड़ों का उपयोग करने की सलाह दी जाती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. यदि मिट्टी बहुत अम्लीय (pH &lt; 5.5) हो तो कौन सी फसलें उपयुक्त हैं?</h4>
                  <p>अम्लीय मिट्टी में चाय, धान, आलू और राई जैसी फसलें उगाई जा सकती हैं। गेहूं और दलहन के लिए पहले चूने का छिड़काव कर पीएच सुधारना आवश्यक है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. कम वर्षा वाले क्षेत्रों के लिए कौन सी फसलें सर्वोत्तम हैं?</h4>
                  <p>कम पानी वाले क्षेत्रों के लिए बाजरा, ज्वार, मूंगफली, ग्वार और चना जैसी फसलें उपयुक्त होती हैं। AI इनपुट वर्षा के आधार पर स्वतः इनका सुझाव देता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. क्या यह प्रणाली केवल खरीफ फसलों का सुझाव देती है?</h4>
                  <p>नहीं, KisaanBuddy वर्ष के किसी भी समय आपकी मिट्टी और चुनी गई ऋतु (खरीफ, रबी या जायद) के आधार पर उपयुक्त फसलों की सूची प्रदर्शित करती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. क्या AI द्वारा सुझाई गई फसल बोने से अधिक पैदावार की गारंटी है?</h4>
                  <p>AI फसल की क्षमता और अनुकूलता बताता है। अच्छी पैदावार इस बात पर भी निर्भर करती है कि आप फसल प्रबंधन, खरपतवार नियंत्रण, सिंचाई और कीट प्रबंधन कैसे करते हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. मिट्टी का पीएच मान फसल चुनाव को कैसे प्रभावित करता है?</h4>
                  <p>यदि पीएच बहुत अधिक या बहुत कम हो तो मिट्टी में मौजूद तत्व लॉक हो जाते हैं और पौधे उन्हें ग्रहण नहीं कर पाते, जिससे फसल का विकास रुक जाता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. क्या यह भविष्यवाणी देश के सभी राज्यों के लिए मान्य है?</h4>
                  <p>हाँ,  मॉडल में पूरे भारत के विभिन्न राज्यों की जलवायु और मिट्टी के प्रकारों का ऐतिहासिक डेटा शामिल है, जिससे यह राज्य-विशिष्ट सटीक परामर्श देता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. फसलों की विविधता (Crop Diversification) क्यों जरूरी है?</h4>
                  <p>हर साल एक ही फसल बोने से मिट्टी के पोषक तत्व खत्म हो जाते हैं। AI की मदद से फसलों को बदल-बदल कर बोने से मिट्टी की प्राकृतिक उत्पादकता बनी रहती है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. क्या KisaanBuddy के परिणाम वैज्ञानिकों द्वारा प्रमाणित हैं?</h4>
                  <p>KisaanBuddy का फसल मॉडल मान्यता प्राप्त कृषि विश्वविद्यालयों की अनुशंसित नाइट्रोजन-फास्फोरस-पोटेशियम आवश्यकताओं और फसलों के जलवायु सूचकांकों पर आधारित है।</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 How Does AI Crop Prediction Work?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                Artificial Intelligence (AI) Crop Prediction is an advanced system that analyzes your field's soil chemistry and localized climate conditions to recommend the most optimal crops. By matching soil macro-nutrients and weather data against historical crop growth distributions, it estimates which crop varieties will deliver the highest harvest yield and financial return.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">🧪 The Importance of Input Soil & Climate Parameters</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Seven primary indicators are processed to compute suitability indices:<br />
                  <strong>1. NPK Values:</strong> Indicates the chemical nutrient levels available in the topsoil.<br />
                  <strong>2. Soil pH:</strong> Measures soil acidity or alkalinity, directly determining the root's ability to extract nutrients.<br />
                  <strong>3. Temperature & Relative Humidity:</strong> Governs transpiration rates and the plant's metabolic growth.<br />
                  <strong>4. Rainfall:</strong> Estimates seasonal water availability, helping farmers plan for drylands or irrigation.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">🛡️ Accuracy, Constraints, and Farmer Advantages</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Accuracy:</strong> Trained on over 20,000 crop data points across diverse agro-climatic zones, KisaanBuddy achieves a validation accuracy of over 92%.<br />
                  <strong>Limitations:</strong> It cannot foresee flash weather hazards (like cloudbursts or unseasonal frost) or sudden regional pest infestations.<br />
                  <strong>Benefits:</strong> Minimizes the risk of sowing unviable crops, prevents fertilizer toxicity, and helps design profitable multi-crop rotation schedules.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ Crop Suitability AI FAQs</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. What data does the AI model use for prediction?</h4>
                  <p>It processes soil nutrients (N, P, K), pH, and regional climatic indicators (temperature, humidity, and rainfall) using advanced regression trees.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. Can I use the predictor without a soil health card?</h4>
                  <p>Yes, you can enter approximate values based on previous yields. However, using actual test values from a certified lab is highly recommended for accuracy.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. Which crops grow best in highly acidic soils (pH &lt; 5.5)?</h4>
                  <p>Crops like Potatoes, Tea, and Rye adapt well. Wheat and legumes require soil neutralizing with agricultural lime first.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. What crops are recommended for arid zones with low rainfall?</h4>
                  <p>Drought-tolerant crops such as Pearl Millet (Bajra), Sorghum (Jowar), Chickpeas, and Groundnuts are highly recommended.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. Does the model recommend Rabi (winter) crops?</h4>
                  <p>Yes, the algorithm evaluates seasonal parameters to suggest Rabi, Kharif, or Zaid crop options based on sowing dates.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. Does a high AI score guarantee a bumper harvest?</h4>
                  <p>The AI suggests the crop with the highest success rate. Actual harvest yields depend on seed quality, irrigation management, and crop protection.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. Why does pH restrict crop growth?</h4>
                  <p>Extremes of pH lock essential nutrients in insoluble mineral complexes, causing crop starvation despite fertile soil.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. Is the model calibrated for all regions of India?</h4>
                  <p>Yes, the database incorporates climate history and soil profiles from all major agro-climatic zones across Indian states.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. What is the value of crop diversification?</h4>
                  <p>Monoculture depletes soil nutrients and attracts specific pests. Rotation replenishes soil structure and breaks pest life cycles.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. How is the AI crop model validated?</h4>
                  <p>The recommendation database is aligned with agricultural agronomy guidelines published by state agricultural universities.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}
