"use client"
/**
 * KrishiAI — Disease Detection Portal
 *
 * Standalone page that lets a farmer:
 *   1. Upload (or capture) a leaf / plant photo.
 *   2. Optionally describe symptoms in their language.
 *   3. Optionally name the crop and pick the response language.
 *   4. Submit → backend runs GPT-4o vision + diagnosis prompt + RAG and
 *      returns a strict 10-section answer (Crop, Disease, Confidence,
 *      Problem, Causes, Organic, Chemical w/ dose, Prevention, Severity,
 *      Market Advice). Streamed token-by-token over SSE.
 *
 * Reuses the same /api/chat/stream endpoint as the floating widget.
 */
import { Camera, ImagePlus, Loader2, Sparkles, X } from "lucide-react"
import { useCallback, useRef, useState } from "react"

import {
  type AssistantRequest,
  type Language,
  streamMessage,
} from "@/lib/assistant-api"

const LANG_LABEL: Record<Language, string> = {
  auto: "Auto",
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
}

const PLACEHOLDER: Record<Language, string> = {
  auto: "Describe the symptom (optional) — e.g. 'patti pe bhure dhabbe'",
  en: "Describe the symptom (optional) — e.g. 'brown spots on leaves'",
  hi: "लक्षण लिखें (वैकल्पिक) — जैसे 'पत्तियों पर भूरे धब्बे'",
  kn: "ಲಕ್ಷಣವನ್ನು ಬರೆಯಿರಿ (ಐಚ್ಛಿಕ) — ಉದಾ. 'ಎಲೆಗಳ ಮೇಲೆ ಚುಕ್ಕೆ'",
}

const PROMPT_FALLBACK: Record<Language, string> = {
  auto: "Yeh photo dekho aur disease detect karo — strict 10-section format mein jawab do.",
  en: "Look at this photo and diagnose the disease — reply in the strict 10-section format.",
  hi: "इस फोटो को देखो और बीमारी पहचानो — strict 10-section format में जवाब दो।",
  kn: "ಈ ಫೋಟೋ ನೋಡಿ ರೋಗವನ್ನು ಪತ್ತೆ ಮಾಡಿ — strict 10-section format ನಲ್ಲಿ ಉತ್ತರಿಸಿ।",
}

export default function DiseasePortal() {
  const [language, setLanguage] = useState<Language>("hi")
  const [crop, setCrop] = useState("")
  const [symptom, setSymptom] = useState("")
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [response, setResponse] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [usedTools, setUsedTools] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)
  const camRef = useRef<HTMLInputElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const onPick = useCallback((file: File | null | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image file.")
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Image must be smaller than 6 MB.")
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const r = typeof reader.result === "string" ? reader.result : null
      if (r) setImageDataUrl(r)
    }
    reader.readAsDataURL(file)
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  const submit = useCallback(async () => {
    if (isStreaming) return
    if (!imageDataUrl && !symptom.trim()) {
      setError(
        language === "hi"
          ? "Photo ya symptom kuch ek bhejo."
          : "Please upload a photo or describe the symptom.",
      )
      return
    }
    setError(null)
    setResponse("")
    setUsedTools([])

    const composed = [
      crop.trim() ? `Crop: ${crop.trim()}.` : "",
      symptom.trim() || PROMPT_FALLBACK[language],
    ]
      .filter(Boolean)
      .join(" ")

    const req: AssistantRequest = {
      session_id: null,
      message: composed,
      language,
      stream: true,
      want_audio: false,
      image_base64: imageDataUrl,
    }

    const ctl = new AbortController()
    abortRef.current = ctl
    setIsStreaming(true)
    let collected = ""
    try {
      for await (const evt of streamMessage(req, ctl.signal)) {
        switch (evt.type) {
          case "token":
            collected += evt.text
            setResponse(collected)
            break
          case "tool_start":
            setUsedTools((prev) => [...prev, evt.name])
            break
          case "error":
            setError(evt.message)
            break
          case "session":
          case "tool_end":
          case "done":
          default:
            break
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.toLowerCase().includes("abort")) setError(msg)
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [crop, symptom, language, imageDataUrl, isStreaming])

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          KrishiAI · AI-powered crop care
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Disease Detection
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {language === "hi"
            ? "Patti ya paude ki photo bhejo. KrishiAI bimari pehchanega aur organic + chemical (with exact dose) + prevention bata dega — Hindi/Kannada/English mein."
            : language === "kn"
            ? "ಎಲೆ ಅಥವಾ ಸಸ್ಯದ ಫೋಟೋ ಕಳುಹಿಸಿ — KrishiAI ರೋಗ ಪತ್ತೆ ಮಾಡಿ ಔಷಧ + ಪ್ರಮಾಣ + ತಡೆ ಸೂಚಿಸುತ್ತದೆ."
            : "Upload a leaf or plant photo. KrishiAI identifies the disease and gives organic + chemical (with exact dose) + prevention advice — in Hindi, Kannada, or English."}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.3fr)]">
        {/* ===== Left column — input ===== */}
        <section className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5 space-y-4">
          {/* Image picker */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Leaf / plant photo
            </label>
            {imageDataUrl ? (
              <div className="relative mt-2 overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageDataUrl}
                  alt="Selected leaf"
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageDataUrl(null)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-sm text-muted-foreground hover:border-emerald-400 hover:text-emerald-500 transition"
                >
                  <ImagePlus className="h-6 w-6" />
                  Choose photo
                </button>
                <button
                  type="button"
                  onClick={() => camRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-sm text-muted-foreground hover:border-emerald-400 hover:text-emerald-500 transition"
                >
                  <Camera className="h-6 w-6" />
                  Use camera
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onPick(e.target.files?.[0])
                    if (e.target) e.target.value = ""
                  }}
                />
                <input
                  ref={camRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    onPick(e.target.files?.[0])
                    if (e.target) e.target.value = ""
                  }}
                />
              </div>
            )}
          </div>

          {/* Crop name */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Crop (optional)
            </label>
            <input
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Tomato, Cotton, Paddy, Wheat"
              className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>

          {/* Symptom text */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Symptoms (optional)
            </label>
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder={PLACEHOLDER[language]}
              rows={4}
              className="mt-1 w-full resize-y rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>

          {/* Language picker */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Reply language
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["hi", "en", "kn", "auto"] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`rounded-full px-3 py-1 text-xs ring-1 transition ${
                    language === l
                      ? "bg-emerald-500 text-white ring-emerald-400"
                      : "bg-background/40 text-muted-foreground ring-border hover:text-foreground"
                  }`}
                >
                  {LANG_LABEL[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-1">
            {isStreaming ? (
              <button
                type="button"
                onClick={cancel}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-medium hover:bg-muted/70"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-emerald-600 hover:to-green-700"
              >
                <Sparkles className="h-4 w-4" />
                {language === "hi" ? "Bimari pehchano" : language === "kn" ? "ರೋಗ ಪತ್ತೆ ಮಾಡಿ" : "Diagnose now"}
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-500">
              {error}
            </div>
          )}
        </section>

        {/* ===== Right column — diagnosis output ===== */}
        <section className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5 min-h-[520px]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Diagnosis
            </h2>
            {usedTools.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                tools: {usedTools.join(", ")}
              </span>
            )}
          </div>

          {response ? (
            <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
              {response}
            </pre>
          ) : isStreaming ? (
            <div className="mt-10 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="text-xs">
                {language === "hi"
                  ? "Photo aur lakshan padh raha hoon…"
                  : "Analysing the photo and symptoms…"}
              </p>
            </div>
          ) : (
            <div className="mt-10 grid place-items-center text-center text-muted-foreground">
              <div className="space-y-2 max-w-sm">
                <div className="text-4xl">🌿</div>
                <p className="text-sm">
                  {language === "hi"
                    ? "Photo upload karke 'Bimari pehchano' dabao — KrishiAI 10-section format mein jawab dega."
                    : language === "kn"
                    ? "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — 10-section format ನಲ್ಲಿ ರೋಗ ನಿರ್ಣಯ ಸಿಗುತ್ತದೆ."
                    : "Upload a photo and tap Diagnose — you'll get a strict 10-section diagnosis."}
                </p>
                <p className="text-[11px] opacity-70">
                  Crop · Disease · Confidence · Problem · Causes · Organic ·
                  Chemical (with dose) · Prevention · Severity · Market Advice
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Tip footer */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
        💡 Tip: clear, well-lit close-ups of the affected leaf give the best
        diagnosis. Include both top &amp; underside if possible. Mention recent
        weather or irrigation changes for sharper diagnosis.
      </div>
    </div>
  )
}
