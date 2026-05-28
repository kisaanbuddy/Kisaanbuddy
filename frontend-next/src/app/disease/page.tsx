"use client"
/**
 * KrishiAI — Disease Detection Portal (Premium UI)
 */
import {
  Camera, ImagePlus, Loader2, Sparkles, X,
  Bug, CheckCircle2, AlertTriangle, Leaf,
  Upload, FlaskConical,
} from "lucide-react"
import { useCallback, useRef, useState } from "react"
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
  const [language, setLanguage]     = useState<Language>("hi")
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
    if (!file) return
    if (!file.type.startsWith("image/")) { setError("Please pick an image file."); return }
    if (file.size > 6 * 1024 * 1024)    { setError("Image must be smaller than 6 MB."); return }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === "string") setImage(reader.result) }
    reader.readAsDataURL(file)
  }, [])

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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-8">

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600/90 via-orange-600/80 to-amber-600/70 p-7 md:p-10 text-white shadow-2xl shadow-red-500/20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-black/10 blur-xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-200 text-xs font-semibold mb-2">
              <Bug className="h-4 w-4" /> AI-Powered Crop Care
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Disease Detection</h1>
            <p className="mt-2 text-red-100/75 text-sm max-w-xl leading-relaxed">
              {language === "hi"
                ? "Patti ya paude ki photo bhejo — bimari, dose, organic aur chemical treatment sab milega"
                : "Upload a leaf photo — get disease name, exact dose, organic & chemical treatment in seconds"}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
            <div className="text-4xl font-black">95%</div>
            <div className="text-xs text-red-100/70 mt-1">Detection Accuracy</div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.35fr)]">

        {/* ══ LEFT — Input panel ══ */}
        <motion.section
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 space-y-5 h-fit"
        >
          {/* Image upload */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Leaf / Plant Photo
            </label>

            {imageDataUrl ? (
              <div className="relative mt-2 overflow-hidden rounded-2xl border-2 border-green-500/30 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageDataUrl} alt="Selected leaf" className="aspect-square w-full object-cover" />
                <button
                  type="button" onClick={() => setImage(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500/90 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> Photo ready
                </div>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`mt-2 grid grid-cols-2 gap-3 rounded-2xl border-2 border-dashed p-4 transition-all duration-200
                  ${dragging ? "border-green-500 bg-green-500/5" : "border-border hover:border-green-400/50 bg-muted/20"}`}
              >
                {/* Drag hint */}
                <div className="col-span-2 flex flex-col items-center gap-1.5 py-2 text-center text-muted-foreground">
                  <Upload className={`h-8 w-8 transition-colors ${dragging ? "text-green-500" : "text-muted-foreground/40"}`} />
                  <span className="text-xs">{dragging ? "Drop the photo here!" : "Drag & drop or choose below"}</span>
                </div>

                <button
                  type="button" onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 p-5 text-sm text-muted-foreground hover:border-green-400 hover:text-green-500 hover:bg-green-500/5 transition-all"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs font-medium">Gallery</span>
                </button>
                <button
                  type="button" onClick={() => camRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 p-5 text-sm text-muted-foreground hover:border-green-400 hover:text-green-500 hover:bg-green-500/5 transition-all"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs font-medium">Camera</span>
                </button>

                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { onPick(e.target.files?.[0]); if (e.target) e.target.value = "" }} />
                <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => { onPick(e.target.files?.[0]); if (e.target) e.target.value = "" }} />
              </div>
            )}
          </div>

          {/* Crop name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Crop Name <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              value={crop} onChange={e => setCrop(e.target.value)}
              placeholder="e.g. Tomato, Cotton, Paddy, Wheat"
              className="mt-1.5 input-base"
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Symptoms <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={symptom} onChange={e => setSymptom(e.target.value)}
              placeholder={PLACEHOLDER[language]}
              rows={3}
              className="mt-1.5 input-base resize-none"
            />
          </div>

          {/* Language selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Reply Language
            </label>
            <div className="flex flex-wrap gap-2">
              {(["hi", "en", "kn", "auto"] as Language[]).map(l => (
                <button
                  key={l} type="button" onClick={() => setLanguage(l)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all
                    ${language === l
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-md shadow-green-500/25"
                      : "bg-background/60 text-muted-foreground border-border hover:text-foreground hover:border-green-400/50"
                    }`}
                >
                  {LANG_LABEL[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1">
            {isStreaming ? (
              <button onClick={cancel}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/20 transition-all">
                <Loader2 className="h-4 w-4 animate-spin" /> Stop Analysis
              </button>
            ) : (
              <button onClick={submit}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-amber-600 hover:shadow-xl active:scale-98 transition-all">
                <Sparkles className="h-4 w-4" />
                {language === "hi" ? "Bimari Pehchano" : language === "kn" ? "ರೋಗ ಪತ್ತೆ ಮಾಡಿ" : "Diagnose Disease"}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Tip */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-xs text-amber-700 dark:text-amber-300">
            💡 Clear, close-up photos of the affected leaf give the best results. Include both sides if possible.
          </div>
        </motion.section>

        {/* ══ RIGHT — Diagnosis output ══ */}
        <motion.section
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 min-h-[520px] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/50">
            <h2 className="flex items-center gap-2 font-bold text-sm">
              <FlaskConical className="h-4 w-4 text-red-500" />
              Diagnosis Report
            </h2>
            {usedTools.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-medium text-green-600 dark:text-green-400">
                <Sparkles className="h-3 w-3" />
                {usedTools.join(" · ")}
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {response ? (
                <motion.div key="response" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
                    {response}
                  </pre>
                </motion.div>
              ) : isStreaming ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 gap-4 text-center"
                >
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                    <Bug className="absolute inset-0 m-auto h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Analysing your photo…</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "hi" ? "Photo aur lakshan padh raha hoon…" : "Running AI disease recognition…"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 gap-4 text-center text-muted-foreground"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/15">
                    <Leaf className="h-9 w-9 text-green-500/50" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground/60">
                      {language === "hi"
                        ? "Photo upload karke 'Bimari Pehchano' dabao"
                        : "Upload a photo and click Diagnose"}
                    </p>
                    <p className="text-xs mt-2 opacity-50 max-w-xs">
                      Results will include: Crop · Disease · Confidence · Organic · Chemical (dose) · Prevention · Severity
                    </p>
                  </div>

                  {/* Section pills preview */}
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
                    {["Crop","Disease","Confidence","Problem","Organic","Chemical","Prevention","Severity","Market"].map(s => (
                      <span key={s} className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
