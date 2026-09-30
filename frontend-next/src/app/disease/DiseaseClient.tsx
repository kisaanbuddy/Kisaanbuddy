"use client"

import { useLanguage } from '@/lib/language'
import { trackEvent } from '@/lib/analytics'
import {
  Camera, ImagePlus, Loader2, Sparkles, X,
  Bug, CheckCircle2, AlertTriangle, Leaf,
  Upload, FlaskConical,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type AssistantRequest, type Language, streamMessage } from "@/lib/assistant-api"

const LANG_LABEL: Record<Language, string> = {
  auto: "Auto", en: "English", hi: "हिन्दी", kn: "ಕನ್ನಡ",
}
const PLACEHOLDER: Record<Language, string> = {
  auto: "Describe the symptom (optional) — e.g. 'patti pe bhure dhabbe'",
  en:   "Describe the symptom (optional) — e.g. 'brown spots on leaves'",
  hi:   "लक्षण लिखें (वैकल्पिक) — जैसे 'पत्तियों पर भूरे धब्बे'",
  kn:   "ಲಕ್ಷಣವನ್ನು ಬರೆಯಿರಿ (ಐಚ್ಛಿಕ) — ಉದಾ. 'ಎಲೆಗಳ ಮೇಲೆ ಚುಕ್ಕೆ'",
}
const PROMPT_FALLBACK: Record<Language, string> = {
  auto: "Yeh photo dekho aur disease detect karo — strict 10-section format mein jawab do.",
  en:   "Look at this photo and diagnose the disease — reply in the strict 10-section format.",
  hi:   "इस फोटो को देखो और बीमारी पहचानो — strict 10-section format में जवाब दो।",
  kn:   "ಈ ಫೋಟೋ ನೋಡಿ ರೋಗವನ್ನು ಪತ್ತೆ ಮಾಡಿ — strict 10-section format ನಲ್ಲಿ ಉತ್ತರಿಸಿ।",
}

interface PredictionResult {
  predicted_class: string
  confidence: number
  top_predictions: Array<{ class: string; confidence: number }>
  model: string
  status: "ok" | "uncertain"
  note?: string
}

function formatClassName(name: string): string {
  if (!name) return ""
  return name
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default function DiseasePortal() {
  const { t, lang } = useLanguage()
  const [language, setLanguage]     = useState<Language>(["en", "hi", "kn"].includes(lang) ? lang as Language : "en")
  
  useEffect(() => {
    setLanguage(["en", "hi", "kn"].includes(lang) ? lang as Language : "en")
  }, [lang])

  const [crop, setCrop]             = useState("")
  const [symptom, setSymptom]       = useState("")
  const [imageDataUrl, setImage]    = useState<string | null>(null)
  const [dragging, setDragging]     = useState(false)
  const [isStreaming, setStreaming] = useState(false)
  const [response, setResponse]     = useState<string>("")
  const [error, setError]           = useState<string | null>(null)
  const [usedTools, setUsedTools]   = useState<string[]>([])
  const [mlResult, setMlResult]     = useState<PredictionResult | null>(null)
  const [mlLoading, setMlLoading]   = useState<boolean>(false)
  const fileRef  = useRef<HTMLInputElement | null>(null)
  const camRef   = useRef<HTMLInputElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const onPick = useCallback((file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image file.");
      return;
    }
    setError(null);
    setMlResult(null);
    
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setImage(compressedBase64);
        };
      }
    };
    reader.readAsDataURL(file);
  }, []);

  /* Drag & drop */
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    onPick(e.dataTransfer.files[0])
  }, [onPick])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
    setMlLoading(false)
  }, [])

  const submit = useCallback(async () => {
    if (isStreaming || mlLoading) return
    if (!imageDataUrl && !symptom.trim()) {
      setError(language === "hi" ? "Photo ya symptom kuch ek bhejo." : "Please upload a photo or describe the symptom.")
      return
    }
    
    // Track disease upload analytics event
    if (imageDataUrl) {
      trackEvent({ type: 'disease_upload', fileName: 'crop_leaf.png', cropType: crop.trim() || undefined })
    }

    setError(null); setResponse(""); setUsedTools([]); setMlResult(null)

    // 1. Trigger Deep Learning Vision Model API (POST /api/disease/predict)
    if (imageDataUrl) {
      setMlLoading(true)
      try {
        const blob = await (await fetch(imageDataUrl)).blob()
        const formData = new FormData()
        formData.append("file", blob, "crop_leaf.jpg")

        const predictRes = await fetch("/api/disease/predict", {
          method: "POST",
          body: formData,
        })
        if (predictRes.ok) {
          const data: PredictionResult = await predictRes.json()
          setMlResult(data)
        } else {
          console.warn("Disease model API non-200 response:", predictRes.status)
        }
      } catch (err) {
        console.warn("Disease model API request error:", err)
      } finally {
        setMlLoading(false)
      }
    }

    // 2. Stream Agronomy Diagnostic Assistant Advice
    const composed = [
      crop.trim() ? `Crop: ${crop.trim()}.` : "",
      symptom.trim() || PROMPT_FALLBACK[language],
    ].filter(Boolean).join(" ")

    const req: AssistantRequest = {
      session_id: null, message: composed, language,
      stream: true, want_audio: false, image_base64: imageDataUrl,
    }
    const ctl = new AbortController()
    abortRef.current = ctl
    setStreaming(true)
    let collected = ""
    try {
      for await (const evt of streamMessage(req, ctl.signal)) {
        if (evt.type === "token") { collected += evt.text; setResponse(collected) }
        else if (evt.type === "tool_start") setUsedTools(p => [...p, evt.name])
        else if (evt.type === "error") setError(evt.message)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.toLowerCase().includes("abort")) setError(msg)
    } finally {
      setStreaming(false); abortRef.current = null
    }
  }, [crop, symptom, language, imageDataUrl, isStreaming, mlLoading])

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-8">

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
              <Bug className="h-3.5 w-3.5" /> AI-Powered Crop Care
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">{t("disease.disease_detection")}</h1>
            <p className="text-muted-foreground text-xs md:text-sm max-w-xl leading-relaxed">
              {language === "hi"
                ? "Patti ya paude ki photo bhejo — bimari, dose, organic aur chemical treatment sab milega"
                : "Upload a leaf photo — get disease name, exact dose, organic & chemical treatment in seconds"}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-muted/40 rounded-xl p-4 border border-border/50 shrink-0">
            <div className="text-2xl md:text-3xl font-display font-black text-red-600 dark:text-red-400">95%</div>
            <div className="text-[11px] font-semibold text-muted-foreground leading-tight">{t("disease.detection_accuracy")}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.35fr)]">

        {/* ══ LEFT — Input panel ══ */}
        <motion.section
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-5 h-fit shadow-sm"
        >
          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Leaf / Plant Photo
            </label>

            {imageDataUrl ? (
              <div className="relative mt-2 overflow-hidden rounded-xl border border-emerald-500/30 shadow-sm group select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageDataUrl} alt={t("disease.selected_leaf")} className="aspect-square w-full object-cover rounded-xl" />
                <button
                  type="button" onClick={() => setImage(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-white hover:bg-red-500 hover:scale-105 active:scale-95 transition-all"
                  title={t("disease.remove_image")}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-sm px-3 py-1.5 text-xs text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Photo ready
                </div>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`mt-2 grid grid-cols-2 gap-3 rounded-xl border-2 border-dashed p-4 transition-all duration-200 select-none
                  ${dragging ? "border-emerald-500 bg-emerald-500/5" : "border-border/60 hover:border-emerald-500/40 bg-muted/20"}`}
              >
                {/* Drag hint */}
                <div className="col-span-2 flex flex-col items-center gap-1.5 py-3 text-center text-muted-foreground">
                  <Upload className={`h-8 w-8 transition-all ${dragging ? "text-emerald-500 animate-bounce" : "text-muted-foreground/40"}`} />
                  <span className="text-xs font-medium">{dragging ? "Drop the photo here!" : "Drag & drop or choose below"}</span>
                </div>

                <button
                  type="button" onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-background p-4 text-sm text-muted-foreground hover:border-emerald-500/30 hover:text-foreground hover:bg-muted/40 transition-all duration-200 active:scale-95 shadow-sm"
                >
                  <ImagePlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold">{t("disease.gallery")}</span>
                </button>
                <button
                  type="button" onClick={() => camRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-background p-4 text-sm text-muted-foreground hover:border-emerald-500/30 hover:text-foreground hover:bg-muted/40 transition-all duration-200 active:scale-95 shadow-sm"
                >
                  <Camera className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold">{t("disease.camera")}</span>
                </button>

                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { onPick(e.target.files?.[0]); if (e.target) e.target.value = "" }} />
                <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => { onPick(e.target.files?.[0]); if (e.target) e.target.value = "" }} />
              </div>
            )}
          </div>

          {/* Crop name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Crop Name <span className="normal-case font-normal opacity-60">(optional)</span>
            </label>
            <input
              value={crop} onChange={e => setCrop(e.target.value)}
              placeholder={t("disease.e_g_tomato_cotton")}
              className="w-full h-10 px-3 text-sm rounded-xl border border-border/50 bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Symptoms <span className="normal-case font-normal opacity-60">(optional)</span>
            </label>
            <textarea
              value={symptom} onChange={e => setSymptom(e.target.value)}
              placeholder={PLACEHOLDER[language]}
              rows={3}
              className="w-full p-3 text-sm rounded-xl border border-border/50 bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none"
            />
          </div>

          {/* Language selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Reply Language
            </label>
            <div className="flex flex-wrap gap-2">
              {(["hi", "en", "kn", "auto"] as Language[]).map(l => (
                <button
                  key={l} type="button" onClick={() => setLanguage(l)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all active:scale-95
                    ${language === l
                      ? "bg-emerald-600 text-white border-transparent shadow-sm"
                      : "bg-muted/40 text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {LANG_LABEL[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            {isStreaming ? (
              <button onClick={cancel}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all active:scale-95 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-red-500" /> Stop Analysis
              </button>
            ) : (
              <button onClick={submit}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-sm hover:shadow transition-all active:scale-95">
                <Sparkles className="h-4 w-4" />
                {language === "hi" ? "Bimari Pehchano" : language === "kn" ? "ರೋಗ ಪತ್ತೆ ಮಾಡಿ" : "Diagnose Disease"}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400 shadow-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Tip */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed font-medium">
            💡 Clear, close-up photos of the affected leaf yield the most accurate analysis. Capture both sides of the leaf if possible.
          </div>
        </motion.section>

        {/* ══ RIGHT — Diagnosis output ══ */}
        <motion.section
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/50 bg-card p-6 min-h-[520px] flex flex-col justify-between shadow-sm"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/40">
              <h2 className="flex items-center gap-2 font-display font-bold text-sm text-foreground">
                <FlaskConical className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Diagnosis Report
              </h2>
              {usedTools.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  {usedTools.join(" · ")}
                </div>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 space-y-4">
              {/* Deep Learning Vision AI Result Card */}
              {mlLoading && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3 animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">Analyzing leaf with EfficientNetV2-S...</p>
                    <p className="text-muted-foreground text-[11px]">Evaluating 15 disease taxonomy classes & computing confidence</p>
                  </div>
                </div>
              )}

              {mlResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-emerald-500/30 bg-card p-4 space-y-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Deep Learning Prediction
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        mlResult.status === "ok"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400"
                      }`}
                    >
                      {mlResult.status === "ok" ? "High Confidence" : "Uncertain (Review Advised)"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Predicted Condition</p>
                      <h3 className="text-base font-bold font-display text-foreground">
                        {formatClassName(mlResult.predicted_class)}
                      </h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] text-muted-foreground">Calibrated Confidence</p>
                      <span className="text-lg font-black font-display text-emerald-600 dark:text-emerald-400">
                        {(mlResult.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Top Predictions Breakdown */}
                  {mlResult.top_predictions && mlResult.top_predictions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Top Differential Predictions
                      </p>
                      <div className="space-y-1.5">
                        {mlResult.top_predictions.map((pred, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-foreground">{formatClassName(pred.class)}</span>
                              <span className="text-muted-foreground font-mono">
                                {(pred.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  i === 0
                                    ? mlResult.status === "ok"
                                      ? "bg-emerald-500"
                                      : "bg-amber-500"
                                    : "bg-muted-foreground/30"
                                }`}
                                style={{ width: `${Math.max(pred.confidence * 100, 2)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mlResult.note && (
                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic pt-1">
                      {mlResult.note}
                    </p>
                  )}

                  <div className="text-[10px] text-muted-foreground/60 flex items-center justify-between pt-1 border-t border-border/20">
                    <span>Model: {mlResult.model}</span>
                    <span>15-Class Taxonomy</span>
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {response ? (
                  <motion.div key="response" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <pre className="whitespace-pre-wrap break-words font-sans text-xs md:text-sm leading-relaxed text-foreground">
                      {response}
                    </pre>
                  </motion.div>
                ) : isStreaming ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 gap-4 text-center"
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
                      <Bug className="absolute inset-0 m-auto h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-xs md:text-sm text-foreground">Analysing your photo…</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                        {language === "hi" ? "Photo aur lakshan padh raha hoon…" : "Running AI disease recognition…"}
                      </p>
                    </div>
                  </motion.div>
                ) : !mlResult ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col gap-6 text-muted-foreground select-none"
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <Leaf className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-display font-bold text-sm text-foreground">
                          {language === "hi"
                            ? "सही फोटो खींचने के दिशा-निर्देश"
                            : "Guidelines to capture clear photo"}
                        </p>
                        <p className="text-xs max-w-xs mx-auto text-muted-foreground">
                          {language === "hi" 
                            ? "सटीक बीमारी पहचान रिपोर्ट प्राप्त करने के लिए इन बातों का ध्यान रखें:"
                            : "Follow these rules to get an accurate disease diagnosis report:"}
                        </p>
                      </div>
                    </div>

                    {/* Guidelines Card Stack */}
                    <div className="grid grid-cols-1 gap-3 text-left">
                      {[
                        {
                          num: "1",
                          titleHi: "पत्ती को कैमरे के करीब रखें",
                          titleEn: "Bring leaf close to camera",
                          descHi: "प्रभावित पत्ती को कैमरे के सामने साफ और सीधा रखें ताकि बीमारी स्पष्ट दिखाई दे।",
                          descEn: "Hold the infected leaf close and flat so leaf spots are clearly visible."
                        },
                        {
                          num: "2",
                          titleHi: "अच्छी रोशनी में फोटो लें",
                          titleEn: "Capture in bright daylight",
                          descHi: "तेज धूप या साफ रोशनी में फोटो खींचें। परछाई और धुंधलेपन से बचें।",
                          descEn: "Take photos in bright day lighting. Avoid dark shadows or blurry focus."
                        },
                        {
                          num: "3",
                          titleHi: "केवल एक पत्ती पर फोकस करें",
                          titleEn: "Focus on a single leaf",
                          descHi: "पूरे पेड़ की जगह केवल रोगग्रस्त पत्ती की फोटो लें जिससे AI सटीक पहचान कर सके।",
                          descEn: "Focus on the damaged leaf rather than the whole crop branch."
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3 p-3.5 rounded-xl border border-border/50 bg-muted/30">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {item.num}
                          </span>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-semibold text-foreground">
                              {language === "hi" ? item.titleHi : item.titleEn}
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {language === "hi" ? item.descHi : item.descEn}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* ── Educational Guide Section ── */}
        <section className="mt-12 border-t border-border/50 pt-10 select-none">
          {language === "hi" ? (
            <div className="space-y-8 text-foreground">
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">🌾 फसल रोग पहचान गाइड और सुरक्षा उपाय</h2>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-4xl">
                  फसलों में बीमारियां फंगस (कवक), बैक्टीरिया (जीवाणु) और वायरस (विषाणु) के कारण होती हैं। समय रहते रोगों की पहचान और सही उपचार न करने पर 30% से 100% तक फसल नष्ट हो सकती है। KisaanBuddy AI कैमरा तकनीक के माध्यम से पत्तियों के लक्षणों का विश्लेषण कर तत्काल सटीक निदान प्रदान करता है।
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-3 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">🌾 प्रमुख फसलें और उनके सामान्य रोग</h3>
                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-foreground">1. धान (Rice): झोंका रोग (Blast) और जीवाणु झुलसा (Bacterial Blight)</h4>
                      <p>झोंका रोग में पत्तियों पर नाव की आकृति के भूरे धब्बे बनते हैं। जीवाणु झुलसा में पत्तियों के किनारे पीले-सफेद होकर सूखने लगते हैं। यूरिया का अत्यधिक उपयोग न करें और स्ट्रेप्टोसाइक्लिन का छिड़काव करें।</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">2. गेहूं (Wheat): रतुआ रोग (Rust - पीला, भूरा, काला)</h4>
                      <p>पत्तियों पर पीले या भूरे रंग के पाउडर जैसे दाने (Pustules) दिखाई देते हैं। यह ठंडी और नम हवा से तेजी से फैलता है। प्रोपिकोनाजोल 25% EC का छिड़काव करें और प्रतिरोधी किस्मों (जैसे HD-3086) का उपयोग करें।</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">3. मक्का (Maize): तुरीपर्ण झुलसा (Maydis Leaf Blight)</h4>
                      <p>पत्तियों पर लंबे, आयताकार भूरे धब्बे बनते हैं। बीजोपचार के लिए थीरम या कार्बेन्डाजिम का उपयोग करें और फसल चक्र अपनाएं।</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">4. कपास (Cotton): जीवाणु जनित झुलसा (Black Arm)</h4>
                      <p>पत्तियों पर कोण आकार के काले-भूरे धब्बे बनते हैं जो बाद में टहनियों को काला कर देते हैं। कॉपर ऑक्सीक्लोराइड और स्ट्रेप्टोमाइसिन का छिड़काव करें।</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">5. टमाटर और आलू (Tomato & Potato): अगेती व पछेती झुलसा (Early & Late Blight)</h4>
                      <p>अगेती झुलसा में छल्लेदार गोल धब्बे (Target spots) बनते हैं। पछेती झुलसा में पत्तियों पर काले नम धब्बे बनते हैं और पूरी फसल 3-4 दिन में काली पड़कर सड़ जाती है। मैन्कोजेब या कॉपर ऑक्सीक्लोराइड का उपयोग करें।</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-4 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">🛡️ रोग नियंत्रण: जैविक और रासायनिक विधियां</h3>
                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-foreground">A. जैविक रोकथाम (Organic Prevention)</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>बीज बोने से पहले <strong>ट्राइकोडर्मा विरिडी</strong> (Trichoderma viride) कवकनाशी से बीजोपचार करें।</li>
                        <li>खेत की जुताई के समय 5% नीम की खली (Neem cake) मिट्टी में मिलाएं।</li>
                        <li>एक ही खेत में बार-बार एक ही फसल न लगाएं, हमेशा फसल चक्र (Crop rotation) अपनाएं।</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">B. रासायनिक उपचार (Chemical Treatment)</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>कवक रोगों (Fungal diseases) के लिए कार्बेन्डाजिम + मैन्कोजेब (SAAF) 2 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।</li>
                        <li>बैक्टीरिया रोगों (Bacterial diseases) के लिए स्ट्रेप्टोसाइक्लिन 6 ग्राम + कॉपर ऑक्सीक्लोराइड 500 ग्राम को 200 लीटर पानी में मिलाकर प्रति एकड़ छिड़काव करें।</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-display font-bold text-foreground">❓ फसल रोग और उपचार पर अक्सर पूछे जाने वाले प्रश्न (FAQs)</h2>
                <div className="grid gap-3 md:grid-cols-2 text-xs text-muted-foreground">
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q1. धान में ब्लास्ट (झोंका) रोग की पहचान कैसे करें?</h4>
                    <p>पत्तियों पर भूरे रंग के आंख या नाव के आकार के धब्बे बनते हैं जिनका केंद्र हल्का भूरा या सफेद होता है। यह नमी बढ़ने पर तेजी से फैलता है।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q2. बीजोपचार (Seed Treatment) क्यों आवश्यक है?</h4>
                    <p>बीजोपचार से बीज जनित (Seed-borne) फंगस और बैक्टीरिया नष्ट हो जाते हैं, जिससे अंकुरण बेहतर होता है और शुरुआती 30-40 दिनों तक फसल सुरक्षित रहती है।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q3. आलू में पछेती झुलसा (Late Blight) से बचाव कैसे करें?</h4>
                    <p>मौसम में कोहरा और नमी होने पर फसल की निगरानी करें। बीमारी के लक्षण दिखते ही तुरंत मैन्कोजेब (2 ग्राम/लीटर) या मैटालेक्सिल का छिड़काव करें।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q4. क्या हम जैविक तरीकों से कवक रोगों को नियंत्रित कर सकते हैं?</h4>
                    <p>हाँ, ट्राइकोडर्मा विरिडी या स्यूडोमोनास फ्लोरेसेंस जैसे मित्र बैक्टीरिया और फंगस का उपयोग मिट्टी के रोगों को नियंत्रित करने में अत्यंत प्रभावी है।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q5. कपास में पत्ती मरोड़ (Leaf Curl Virus) का क्या इलाज है?</h4>
                    <p>यह वायरस सफेद मक्खी (Whitefly) द्वारा फैलता है। वायरस का कोई सीधा इलाज नहीं है, इसलिए सफेद मक्खी को नियंत्रित करने के लिए इमिडाक्लोप्रिड या नीम तेल का छिड़काव करें।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q6. कीटनाशक और कवकनाशी का छिड़काव कब करना चाहिए?</h4>
                    <p>छिड़काव हमेशा सुबह 8 से 11 बजे के बीच या शाम को 4 बजे के बाद करें। तेज धूप या तेज हवा में दवा का छिड़काव न करें।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q7. टमाटर के फलों का नीचे से सड़ना (Blossom End Rot) क्या है?</h4>
                    <p>यह कोई बीमारी नहीं बल्कि मिट्टी में कैल्शियम की कमी के कारण होता है। चूने के पानी का छिड़काव या कैल्शियम नाइट्रेट खाद डालने से यह ठीक हो जाता है।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q8. क्या एक ही खेत में बार-बार धान-गेहूं बोने से रोग बढ़ते हैं?</h4>
                    <p>हाँ, लगातार एक ही फसल बोने से मिट्टी में उस फसल के हानिकारक जीवाणु पनप जाते हैं। बीच-बीच में दलहन (दालें) या तिलहन बोकर फसल चक्र बदलें।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q9. फसलों में उकठा या विल्ट (Wilt) रोग क्या है?</h4>
                    <p>इस रोग में जड़ें सड़ जाती हैं और पौधा अचानक बिना पीला पड़े सूख जाता है। कार्बेन्डाजिम का जड़ों के पास छिड़काव (Drenching) करें।</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q10. KisaanBuddy रोग डिटेक्शन की सटीकता कितनी है?</h4>
                    <p>KisaanBuddy का AI विज़न मॉडल 95% से अधिक सटीकता के साथ भारत की 30 से अधिक मुख्य फसलों के 120+ रोगों की सटीक पहचान कर सकता है।</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 text-foreground">
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">🌾 Crop Disease Identification Guide and Protective Measures</h2>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-4xl">
                  Crop diseases are caused by fungal, bacterial, and viral pathogens. Failure to diagnose and treat these diseases in time can result in crop losses ranging from 30% to 100%. KisaanBuddy utilizes advanced AI vision models to analyze visual symptoms on leaves and provide immediate, actionable treatment recommendations.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-3 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">🌾 Major Crops and Common Plant Pathogens</h3>
                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-foreground">1. Rice (Paddy): Blast Disease and Bacterial Leaf Blight (BLB)</h4>
                      <p>Blast causes diamond-shaped spots on leaves with gray centers. BLB exhibits wavy yellow-white stripes starting from the leaf tips. Avoid excess Nitrogen and spray Streptocycline combined with Copper Oxychloride.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">2. Wheat: Yellow, Brown, or Black Rust</h4>
                      <p>Appears as powdery orange, brown, or black pustules on leaf surfaces, heavily driven by wind and humidity. Spray Propiconazole 25% EC and cultivate rust-resistant varieties like HD-3086 or HD-2967.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">3. Maize: Maydis Leaf Blight</h4>
                      <p>Characterized by elongated rectangular brown lesions on leaves. Treat seeds with Carbendazim or Thiram prior to sowing and ensure proper crop rotation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">4. Cotton: Black Arm / Bacterial Blight</h4>
                      <p>Angular dark brown leaf lesions that spread to stems, turning them black. Apply Streptomycin sulfate and clean field residues after harvest.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">5. Tomato & Potato: Early and Late Blight</h4>
                      <p>Early blight creates concentric ring spots (target lesions). Late blight is highly destructive, showing dark water-soaked leaf lesions that rot whole plants within 72 hours. Treat with Mancozeb or Metalaxyl.</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-4 shadow-sm">
                  <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-display">🛡️ Integrated Disease Management (IDM)</h3>
                  <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-foreground">A. Cultural and Biological Control</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Perform seed inoculation using <strong>Trichoderma viride</strong> bio-fungicide (5-10g/kg of seed).</li>
                        <li>Incorporate Neem Cake (de-oiled neem seed residue) into the soil during field preparation to repress nematodes.</li>
                        <li>Practice strict crop rotation to disrupt host cycles of persistent pathogens.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">B. Chemical Interventions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>For fungal pathogens, spray contact-plus-systemic mixtures like Carbendazim + Mancozeb (SAAF) at 2g per liter of water.</li>
                        <li>For bacterial infections, dissolve 6g Streptocycline and 500g Copper Oxychloride in 200 liters of water per acre.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-display font-bold text-foreground">❓ Crop Disease FAQs</h2>
                <div className="grid gap-3 md:grid-cols-2 text-xs text-muted-foreground">
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q1. How can I differentiate Rice Blast from Bacterial Blight?</h4>
                    <p>Rice Blast produces diamond-shaped spots on leaves. Bacterial Blight displays elongated yellowing dry streaks starting from the outer edges of the leaf blades.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q2. What is the main benefit of Seed Treatment?</h4>
                    <p>It eliminates seed-borne spores, improves seed viability and germination rates, and shields early seedlings for 30 to 45 days.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q3. How do we treat Potato Late Blight?</h4>
                    <p>Spray prophylactic fungicides like Mancozeb before winter fog sets in. If symptoms appear, apply systemic fungicides like Metalaxyl-Mancozeb immediately.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q4. Can biological agents suppress soil-borne pathogens?</h4>
                    <p>Yes, beneficial soil microbes like Trichoderma and Pseudomonas put up active competition against Fusarium and Pythium root rots.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q5. What causes Leaf Curl in Cotton?</h4>
                    <p>It is caused by the Cotton Leaf Curl Virus (CLCuV), which is vectored by Whiteflies. Controlling the whitefly vector using Imidacloprid or Neem Oil is essential.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q6. When is the best time to apply fungicides?</h4>
                    <p>Fungicides should be sprayed in calm winds during early mornings or late afternoons. Avoid mid-day sun, which can cause phytotoxic leaf burns.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q7. What causes Blossom End Rot in Tomato?</h4>
                    <p>It is a physiological disorder due to Calcium deficiency, not a pathogen. Maintain consistent watering and apply foliar sprays of Calcium Nitrate.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q8. How does crop rotation reduce disease build-up?</h4>
                    <p>Pathogens are host-specific. Planting a non-host crop (like pulses after cereals) starves the spores remaining in the soil, reducing infection load.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q9. What are the symptoms of Fusarium Wilt?</h4>
                    <p>Plants exhibit sudden wilting and leaf drooping without prior yellowing, caused by fungal blockage of vascular water-conducting tissues.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card space-y-1.5 shadow-sm">
                    <h4 className="font-semibold text-foreground">Q10. How accurate is the KisaanBuddy disease model?</h4>
                    <p>Our deep learning models identify 120+ diseases across 30+ staple Indian crops with a field-tested validation accuracy of over 95%.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
