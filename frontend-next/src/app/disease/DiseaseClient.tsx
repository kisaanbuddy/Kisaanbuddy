"use client"

import { useLanguage } from '@/lib/language'
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
  }, [])

  const submit = useCallback(async () => {
    if (isStreaming) return
    if (!imageDataUrl && !symptom.trim()) {
      setError(language === "hi" ? "Photo ya symptom kuch ek bhejo." : "Please upload a photo or describe the symptom.")
      return
    }
    setError(null); setResponse(""); setUsedTools([])
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
  }, [crop, symptom, language, imageDataUrl, isStreaming])

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-8">

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c0806] via-[#2c0f0a] to-[#1c0806] border border-red-500/10 p-7 md:p-10 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-red-500/5 blur-[80px]" />
          <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-amber-500/3 blur-[90px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Bug className="h-4.5 w-4.5" /> AI-Powered Crop Care
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">{t("disease.disease_detection")}</h1>
            <p className="text-muted-foreground/90 text-xs md:text-sm max-w-xl leading-relaxed">
              {language === "hi"
                ? "Patti ya paude ki photo bhejo — bimari, dose, organic aur chemical treatment sab milega"
                : "Upload a leaf photo — get disease name, exact dose, organic & chemical treatment in seconds"}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center bg-[#060b18]/45 backdrop-blur-sm rounded-2xl p-5 text-center border border-red-500/10 shrink-0 shadow-lg">
            <div className="text-3xl font-display font-black text-red-500">95%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{t("disease.detection_accuracy")}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.35fr)]">

        {/* ══ LEFT — Input panel ══ */}
        <motion.section
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md p-6 space-y-5 h-fit"
        >
          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
              Leaf / Plant Photo
            </label>

            {imageDataUrl ? (
              <div className="relative mt-2 overflow-hidden rounded-2xl border-2 border-emerald-500/20 shadow-lg group select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageDataUrl} alt={t("disease.selected_leaf")} className="aspect-square w-full object-cover rounded-2xl brightness-95" />
                <button
                  type="button" onClick={() => setImage(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-black/70 text-white hover:bg-red-500/90 hover:scale-105 active:scale-95 transition-all"
                  title={t("disease.remove_image")}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Photo ready
                </div>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`mt-2 grid grid-cols-2 gap-3 rounded-2xl border-2 border-dashed p-4 transition-all duration-300 select-none
                  ${dragging ? "border-emerald-500/40 bg-emerald-500/5 shadow-glow-primary" : "border-border/60 hover:border-emerald-500/30 bg-background/30"}`}
              >
                {/* Drag hint */}
                <div className="col-span-2 flex flex-col items-center gap-1.5 py-3 text-center text-muted-foreground">
                  <Upload className={`h-8 w-8 transition-all ${dragging ? "text-emerald-500 animate-bounce" : "text-muted-foreground/30"}`} />
                  <span className="text-[11px] font-semibold">{dragging ? "Drop the photo here!" : "Drag & drop or choose below"}</span>
                </div>

                <button
                  type="button" onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/50 p-4 text-sm text-muted-foreground hover:border-emerald-500/20 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all duration-200 active:scale-95 shadow-sm"
                >
                  <ImagePlus className="h-5 w-5 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("disease.gallery")}</span>
                </button>
                <button
                  type="button" onClick={() => camRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/50 p-4 text-sm text-muted-foreground hover:border-emerald-500/20 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all duration-200 active:scale-95 shadow-sm"
                >
                  <Camera className="h-5 w-5 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("disease.camera")}</span>
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
              Crop Name <span className="normal-case font-medium opacity-60">(optional)</span>
            </label>
            <input
              value={crop} onChange={e => setCrop(e.target.value)}
              placeholder={t("disease.e_g_tomato_cotton")}
              className="input-base"
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
              Symptoms <span className="normal-case font-medium opacity-60">(optional)</span>
            </label>
            <textarea
              value={symptom} onChange={e => setSymptom(e.target.value)}
              placeholder={PLACEHOLDER[language]}
              rows={3}
              className="input-base resize-none"
            />
          </div>

          {/* Language selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90 mb-1 block">
              Reply Language
            </label>
            <div className="flex flex-wrap gap-2">
              {(["hi", "en", "kn", "auto"] as Language[]).map(l => (
                <button
                  key={l} type="button" onClick={() => setLanguage(l)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all duration-200 active:scale-95
                    ${language === l
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow shadow-emerald-500/20"
                      : "bg-background/40 text-muted-foreground/80 border-border/40 hover:text-foreground hover:border-emerald-500/25 hover:bg-emerald-500/2"
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/20 hover:border-red-500/40 transition-all active:scale-95 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-red-500" /> Stop Analysis
              </button>
            ) : (
              <button onClick={submit}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg hover:shadow-red-500/10 hover:brightness-105 active:scale-95 transition-all">
                <Sparkles className="h-4 w-4" />
                {language === "hi" ? "Bimari Pehchano" : language === "kn" ? "ರೋಗ ಪತ್ತೆ ಮಾಡಿ" : "Diagnose Disease"}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-500 shadow-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Tip */}
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/3 p-3.5 text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed font-medium">
            💡 Clear, close-up photos of the affected leaf yield the most accurate analysis. Capture both sides of the leaf if possible.
          </div>
        </motion.section>

        {/* ══ RIGHT — Diagnosis output ══ */}
        <motion.section
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md p-6 min-h-[520px] flex flex-col justify-between"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/20">
              <h2 className="flex items-center gap-2 font-display font-bold text-sm text-foreground">
                <FlaskConical className="h-4 w-4 text-red-400" />
                Diagnosis Report
              </h2>
              {usedTools.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-500">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  {usedTools.join(" · ")}
                </div>
              )}
            </div>

            {/* Content area */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {response ? (
                  <motion.div key="response" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-fade-in">
                    <pre className="whitespace-pre-wrap break-words font-sans text-xs md:text-sm leading-relaxed text-foreground/90">
                      {response}
                    </pre>
                  </motion.div>
                ) : isStreaming ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 gap-4 text-center"
                  >
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full border-4 border-red-500/10 border-t-red-500 animate-spin" />
                      <Bug className="absolute inset-0 m-auto h-5.5 w-5.5 text-red-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-xs md:text-sm">Analysing your photo…</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-1 max-w-xs mx-auto leading-relaxed">
                        {language === "hi" ? "Photo aur lakshan padh raha hoon…" : "Running AI disease recognition…"}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col gap-6 text-muted-foreground/85 select-none"
                  >
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/2 border border-emerald-500/15 shadow-sm animate-float">
                        <Leaf className="h-7 w-7 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-display font-bold text-sm text-foreground">
                          {language === "hi"
                            ? "सही फोटो खींचने के दिशा-निर्देश"
                            : "Guidelines to capture clear photo"}
                        </p>
                        <p className="text-[11px] max-w-xs mx-auto text-muted-foreground/75 font-medium">
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
                        <div key={idx} className="flex gap-3 p-3.5 rounded-xl border border-white/[0.04] bg-background/25">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400 font-mono">
                            {item.num}
                          </span>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white leading-none">
                              {language === "hi" ? item.titleHi : item.titleEn}
                            </h4>
                            <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-semibold">
                              {language === "hi" ? item.descHi : item.descEn}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
