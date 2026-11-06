"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  ImagePlus,
  Loader2,
  Sparkles,
  X,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Sprout,
  Upload,
  FlaskConical,
  Phone,
  Building2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  HelpCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useVoice } from "@/lib/voice/VoiceContext";
import { trackEvent } from "@/lib/analytics";
import { IDMTreatmentTabs } from "@/components/disease/IDMTreatmentTabs";
import { RequestExpertModal } from "@/components/disease/RequestExpertModal";
import { KVKDirectoryModal } from "@/components/disease/KVKDirectoryModal";
import { TrackCaseModal } from "@/components/disease/TrackCaseModal";
import { SprayWeatherAdvisory } from "@/components/disease/SprayWeatherAdvisory";
import { TreatmentPopupModal } from "@/components/disease/TreatmentPopupModal";
import {
  type AssistantRequest,
  type Language,
  streamMessage,
} from "@/lib/assistant-api";

const COMMON_CROPS = [
  { id: "Tomato", hi: "टमाटर", kn: "ಟೊಮೆಟೊ", icon: "🍅" },
  { id: "Potato", hi: "आलू", kn: "ಆಲೂಗಡ್ಡೆ", icon: "🥔" },
  { id: "Wheat", hi: "गेहूं", kn: "ಗೋಧಿ", icon: "🌾" },
  { id: "Rice", hi: "धान (चावल)", kn: "ಭತ್ತ (ಅಕ್ಕಿ)", icon: "🌾" },
  { id: "Cotton", hi: "कपास", kn: "ಹತ್ತಿ", icon: "🌱" },
  { id: "Mustard", hi: "सरसों", kn: "ಸಾಸಿವೆ", icon: "🌼" },
  { id: "Maize", hi: "मक्का", kn: "ಮೆಕ್ಕೆಜೋಳ", icon: "🌽" },
  { id: "Soybean", hi: "सोयाबीन", kn: "ಸೋಯಾಬೀನ್", icon: "🌿" },
  { id: "Chilli", hi: "मिर्च", kn: "ಮೆಣಸಿನಕಾಯಿ", icon: "🌶️" },
  { id: "Onion", hi: "प्याज", kn: "ಈರುಳ್ಳಿ", icon: "🧅" },
];

interface PredictionResult {
  predicted_class: string;
  confidence: number;
  top_predictions: Array<{ class: string; confidence: number }>;
  model: string;
  status: "ok" | "uncertain";
  note?: string;
  crop?: string;
  disease_name?: string;
  recommend_expert_review?: boolean;
  immediate_action?: string;
  cultural_control?: string;
  biological_control?: string;
  chemical_control?: string;
  cibrc_approved?: boolean;
  dosage_guidelines?: string;
  phi_days?: number;
  safety_instructions?: string;
  source_institution?: string;
  source_url?: string;
  last_verified_date?: string;
}

function getRecommendedCategory(result?: PredictionResult | null): string {
  const name = (result?.disease_name || result?.predicted_class || "").toLowerCase();
  if (
    name.includes("aphid") ||
    name.includes("whitefly") ||
    name.includes("borer") ||
    name.includes("pest") ||
    name.includes("worm") ||
    name.includes("thrips") ||
    name.includes("jassid") ||
    name.includes("hopper")
  ) {
    return "insecticides";
  }
  if (
    name.includes("rust") ||
    name.includes("blast") ||
    name.includes("blight") ||
    name.includes("mildew") ||
    name.includes("rot") ||
    name.includes("spot") ||
    name.includes("fungal")
  ) {
    return "fungicides";
  }
  if (name.includes("weed")) {
    return "herbicides";
  }
  if (
    name.includes("zinc") ||
    name.includes("deficiency") ||
    name.includes("chlorosis") ||
    name.includes("nitrogen")
  ) {
    return "micronutrients";
  }
  return "fungicides";
}

function formatClassName(name: string): string {
  if (!name) return "";
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DiseaseClient() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const activeLang: Language = ["en", "hi", "kn"].includes(lang)
    ? (lang as Language)
    : "hi";

  const isHindi = activeLang === "hi";
  const isKannada = activeLang === "kn";

  const [crop, setCrop] = useState("");
  const [symptom, setSymptom] = useState("");
  const [imageDataUrl, setImage] = useState<string | null>(null);
  const [isStreaming, setStreaming] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [mlResult, setMlResult] = useState<PredictionResult | null>(null);
  const [mlLoading, setMlLoading] = useState<boolean>(false);

  // Modals
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [kvkModalOpen, setKvkModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [treatmentPopupOpen, setTreatmentPopupOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const camRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Load crop from query / voice parameter
  useEffect(() => {
    const requestedCrop = searchParams.get("crop");
    if (requestedCrop) setCrop(requestedCrop);

    // Also check saved farm profile
    try {
      const saved = localStorage.getItem("kisaanbuddy_farmer_profile");
      if (saved && !requestedCrop) {
        const parsed = JSON.parse(saved);
        if (parsed.primaryCrop) setCrop(parsed.primaryCrop);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  const onPick = useCallback((file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(
        isHindi
          ? "कृपया एक फोटो फाइल चुनें।"
          : "Please pick an image file."
      );
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
          const MAX_WIDTH = 900;
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
          const compressed = canvas.toDataURL("image/jpeg", 0.72);
          setImage(compressed);
        };
      }
    };
    reader.readAsDataURL(file);
  }, [isHindi]);

  const submit = useCallback(async () => {
    if (isStreaming || mlLoading) return;
    if (!imageDataUrl && !symptom.trim()) {
      setError(
        isHindi
          ? "कृपया खराब पत्ती की फोटो लें या लक्षण लिखें।"
          : isKannada
          ? "ದಯವಿಟ್ಟು ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ರೋಗದ ಲಕ್ಷಣವನ್ನು ಬರೆಯಿರಿ."
          : "Please take a photo or describe the symptom."
      );
      return;
    }

    if (imageDataUrl) {
      trackEvent({
        type: "disease_upload",
        fileName: "leaf.jpg",
        cropType: crop.trim() || undefined,
      });
    }

    setError(null);
    setResponse("");
    setMlResult(null);

    // 1. Vision & ICAR Advisory API
    setMlLoading(true);
    try {
      const url = `/api/disease/predict?crop_hint=${encodeURIComponent(
        crop.trim()
      )}&symptom_notes=${encodeURIComponent(symptom.trim())}`;
      let predictRes: Response;
      if (imageDataUrl) {
        const blob = await (await fetch(imageDataUrl)).blob();
        const formData = new FormData();
        formData.append("file", blob, "crop_leaf.jpg");
        formData.append("crop_hint", crop.trim());
        formData.append("symptom_notes", symptom.trim());
        predictRes = await fetch(url, {
          method: "POST",
          body: formData,
        });
      } else {
        predictRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            crop_hint: crop.trim(),
            symptom_notes: symptom.trim(),
          }),
        });
      }

      if (predictRes.ok) {
        const data: PredictionResult = await predictRes.json();
        setMlResult(data);
        if ((data.confidence || 0) >= 0.60 && data.status !== "uncertain") {
          setTimeout(() => {
            setTreatmentPopupOpen(true);
          }, 900);
        }
      }
    } catch (err) {
      console.warn("Disease model API request error:", err);
    } finally {
      setMlLoading(false);
    }

    // 2. Stream Agronomy Diagnostic Assistant Advice
    const composed = [
      crop.trim() ? `Crop: ${crop.trim()}.` : "",
      symptom.trim()
        ? `Symptom: ${symptom.trim()}.`
        : "Diagnose disease from photo and provide practical farmer advice in 4 clear points: 1. Possible cause, 2. Immediate action, 3. Organic remedies, 4. Safe chemical spray.",
    ]
      .filter(Boolean)
      .join(" ");

    const req: AssistantRequest = {
      session_id: null,
      message: composed,
      language: activeLang,
      stream: true,
      want_audio: false,
      image_base64: imageDataUrl,
    };

    const ctl = new AbortController();
    abortRef.current = ctl;
    setStreaming(true);
    let collected = "";
    try {
      for await (const evt of streamMessage(req, ctl.signal)) {
        if (evt.type === "token") {
          collected += evt.text;
          setResponse(collected);
        } else if (evt.type === "error") {
          setError(evt.message);
        }
      }
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (!msg.toLowerCase().includes("abort")) setError(msg);
    } finally {
      setStreaming(false);
      abortRef.current = null;
      // Scroll smoothly to results
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isStreaming, mlLoading, imageDataUrl, symptom, crop, activeLang, isHindi, isKannada]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setMlLoading(false);
  }, []);

  return (
    <div className="w-full space-y-8 pb-12">
      {/* ── HEADER ── */}
      <header className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900/90 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              {isHindi ? "फसल सुरक्षा" : isKannada ? "ಬೆಳೆ ಸಂರಕ್ಷಣೆ" : "CROP PROTECTION"}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
              {isHindi ? "फसल डॉक्टर (Crop Doctor)" : isKannada ? "ಬೆಳೆ ವೈದ್ಯ" : "Crop Doctor"}
            </h1>
            <p className="mt-1.5 text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
              {isHindi
                ? "पत्ती की फोटो लें या लक्षण बताएं — तुरंत बीमारी की जांच, जैविक उपचार और दवा की मात्रा जानें।"
                : isKannada
                ? "ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ರೋಗದ ಲಕ್ಷಣ ತಿಳಿಸಿ — ಸೂಕ್ತ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಔಷಧಿ ತಿಳಿಯಿರಿ."
                : "Diagnose crop leaf disease with an image or symptom description, and get practical treatment steps."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setKvkModalOpen(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition flex items-center gap-1.5"
            >
              <Building2 className="h-4 w-4 text-primary" />
              <span>{isHindi ? "KVK केंद्र खोजें" : "Find KVK"}</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackModalOpen(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition flex items-center gap-1.5"
            >
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>{isHindi ? "केस ट्रैक करें" : "Track Case"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── STEP 1: SELECT CROP ── */}
      <section className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-extrabold">
              1
            </span>
            <span>{isHindi ? "फसल चुनें (Select Crop)" : "Step 1: Select Crop"}</span>
          </label>
          {crop && (
            <span className="text-xs font-semibold text-primary">
              {crop}
            </span>
          )}
        </div>

        {/* Quick Crop Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2.5">
          {COMMON_CROPS.map((c) => {
            const isSelected = crop.toLowerCase() === c.id.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCrop(c.id)}
                className={`min-h-[48px] px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary dark:text-emerald-300 ring-2 ring-primary/20"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200 hover:border-stone-300"
                }`}
              >
                <span>{c.icon}</span>
                <span>{isHindi ? c.hi : isKannada ? c.kn : c.id}</span>
              </button>
            );
          })}
        </div>

        <div>
          <input
            type="text"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            placeholder={
              isHindi
                ? "या अन्य फसल का नाम लिखें..."
                : "Or type other crop name..."
            }
            className="w-full min-h-[44px] px-3.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </section>

      {/* ── STEP 2: PHOTO / SYMPTOMS ── */}
      <section className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-4">
        <label className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-extrabold">
            2
          </span>
          <span>
            {isHindi
              ? "पत्ती की फोटो लें या लक्षण बताएं"
              : "Step 2: Take Photo or Describe Symptoms"}
          </span>
        </label>

        {imageDataUrl ? (
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-stone-900 shadow-sm max-w-md mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt="Crop leaf preview"
              className="aspect-video w-full object-contain"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-white hover:bg-rose-600 transition"
              title="Remove image"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{isHindi ? "फोटो तैयार है" : "Photo ready"}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => camRef.current?.click()}
              className="min-h-[100px] p-5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center gap-2 text-primary active:scale-95"
            >
              <Camera className="h-8 w-8 stroke-[2.2]" />
              <span className="text-base font-extrabold">
                {isHindi ? "कैमरा से फोटो लें" : isKannada ? "ಕ್ಯಾಮೆರಾ ಫೋಟೋ" : "Take Photo with Camera"}
              </span>
              <span className="text-xs text-stone-500">
                {isHindi ? "खेत में सीधी पत्ती की तस्वीर" : "Direct photo in natural light"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="min-h-[100px] p-5 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex flex-col items-center justify-center gap-2 text-stone-800 dark:text-stone-200 active:scale-95"
            >
              <ImagePlus className="h-8 w-8 text-stone-600 stroke-[2.2]" />
              <span className="text-base font-extrabold">
                {isHindi ? "गैलरी से फोटो चुनें" : isKannada ? "ಗ್ಯಾಲರಿ ಫೋಟೋ" : "Upload from Gallery"}
              </span>
              <span className="text-xs text-stone-500">
                {isHindi ? "पहले से ली गई फोटो" : "Select saved photo"}
              </span>
            </button>

            <input
              ref={camRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                onPick(e.target.files?.[0]);
                if (e.target) e.target.value = "";
              }}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onPick(e.target.files?.[0]);
                if (e.target) e.target.value = "";
              }}
            />
          </div>
        )}

        {/* Symptoms text */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
            {isHindi
              ? "या पत्ती के लक्षण लिखें (वैकल्पिक)"
              : "Or describe symptoms (Optional)"}
          </label>
          <textarea
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            rows={2}
            placeholder={
              isHindi
                ? "जैसे: 'पत्ती के किनारों पर काले धब्बे हैं', 'पत्तियां मुड़ रही हैं'"
                : "e.g. 'brown spots on lower leaves', 'yellowing margins'"
            }
            className="w-full p-3 text-base rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
      </section>

      {/* ── STEP 3: ANALYZE ACTION ── */}
      <section className="space-y-3">
        {isStreaming || mlLoading ? (
          <button
            type="button"
            onClick={cancel}
            className="w-full min-h-[52px] rounded-2xl bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 px-6 py-3 text-base font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-rose-100 transition-all active:scale-95"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              {isHindi
                ? "जांच रोकें (Stop Analysis)"
                : "Stop Analysis"}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="w-full min-h-[52px] rounded-2xl bg-primary hover:bg-primary/95 text-white px-6 py-3.5 text-base sm:text-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          >
            <Sparkles className="h-5 w-5" />
            <span>
              {isHindi
                ? "बीमारी की जांच करें (Diagnose Problem)"
                : isKannada
                ? "ರೋಗ ಪತ್ತೆ ಮಾಡಿ"
                : "Diagnose Crop Problem"}
            </span>
          </button>
        )}

        {error && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* ── STEP 4-7: RESULTS DISPLAY ── */}
      <div ref={resultsRef}>
        {(mlLoading || isStreaming) && (
          <div className="rounded-2xl border border-primary/30 bg-[#FAF8F5] dark:bg-stone-900 p-6 flex items-center gap-4 animate-pulse">
            <Loader2 className="h-7 w-7 animate-spin text-primary shrink-0" />
            <div>
              <p className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                {isHindi
                  ? "पत्ती की जांच हो रही है..."
                  : "Checking your crop leaf..."}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {isHindi
                  ? "ICAR और कृषि विज्ञान केंद्र डेटाबेस से बीमारी के लक्षण मिलाए जा रहे हैं।"
                  : "Matching visual symptoms with agricultural advisory guidelines."}
              </p>
            </div>
          </div>
        )}

        {(mlResult || response) && (
          <div className="space-y-6 pt-2">
            {/* Low Confidence Guidance Card */}
            {(mlResult?.status === "uncertain" || (mlResult?.confidence !== undefined && mlResult.confidence < 0.60)) && (
              <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/40 p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-100">
                      {isHindi
                        ? "निदान अनिश्चित है — कृपया एक और स्पष्ट फोटो लें"
                        : "Low Confidence Screening — Another Photo Recommended"}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 mt-0.5">
                      {isHindi
                        ? "पत्ती के लक्षण अस्पष्ट या मिश्रित दिखाई दे रहे हैं। बिना पुष्टि के कोई रासायनिक छिड़काव न करें।"
                        : "Visual symptoms are inconclusive. Do not apply chemical pesticides without expert confirmation."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      camRef.current?.click();
                    }}
                    className="h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Camera className="h-4 w-4" />
                    <span>{isHindi ? "नई फोटो खींचें" : "Take Clear Daytime Photo"}</span>
                  </button>

                  <a
                    href="tel:18001801551"
                    className="h-11 rounded-xl border border-amber-600 bg-white dark:bg-stone-900 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-950 transition"
                  >
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span>{isHindi ? "किसान हेल्पलाइन: 1800-180-1551" : "Kisan Helpline: 1800-180-1551"}</span>
                  </a>
                </div>
              </div>
            )}

            {/* 4. Display Possible Problem (No raw confidence scores) */}
            <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    <Bug className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    {isHindi ? "संभावित समस्या" : "Possible Crop Issue"}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    {isHindi
                      ? "प्रारंभिक जांच — पक्का निदान नहीं"
                      : "Preliminary Screening (Not Confirmed Diagnosis)"}
                  </span>
                </span>
              </div>

              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider">
                  {crop || "Crop"}
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
                  {mlResult?.disease_name ||
                    formatClassName(mlResult?.predicted_class || "") ||
                    (isHindi ? "पत्ती पर संक्रमण या कीट प्रभाव" : "Foliar Condition Detected")}
                </h3>
              </div>

              <div className="rounded-xl border border-stone-200 bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {isHindi
                  ? "यह फोटो आधारित प्रारंभिक जांच है। रासायनिक कीटनाशक डालने से पहले लक्षणों की पुष्टि कर लें या नजदीकी KVK विशेषज्ञ से बात करें।"
                  : "This is an automated preliminary image screening. Please verify symptoms before applying chemical sprays."}
              </div>

              {/* 5. Immediate practical steps */}
              {mlResult?.immediate_action && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {isHindi ? "तुरंत क्या करें (Immediate Actions)" : "Immediate Next Steps"}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                    {mlResult.immediate_action}
                  </p>
                </div>
              )}

              {/* Streaming AI detailed response if available */}
              {response && (
                <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    {isHindi ? "कृषि सलाह विवरण" : "Detailed Agronomy Advice"}
                  </h4>
                  <div className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                    {response}
                  </div>
                </div>
              )}

              {/* 6. Treatment Options & Safety Precautions (IDM) */}
              <IDMTreatmentTabs
                cultural={mlResult?.cultural_control}
                biological={mlResult?.biological_control}
                chemical={mlResult?.chemical_control}
                dosage={mlResult?.dosage_guidelines}
                phiDays={mlResult?.phi_days}
                safety={mlResult?.safety_instructions}
                sourceInstitution={mlResult?.source_institution}
                sourceUrl={mlResult?.source_url}
                lastVerifiedDate={mlResult?.last_verified_date}
                language={activeLang}
              />

              {/* Spray Weather Advisory component */}
              <SprayWeatherAdvisory />

              {/* 7. Expert Escalation Option */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {isHindi
                      ? "क्या लक्षण अस्पष्ट हैं या गंभीर बीमारी है?"
                      : "Unsure or severe damage?"}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    {isHindi
                      ? "कृषि वैज्ञानिक (KVK) से अपनी पत्ती की फोटो का निशुल्क सत्यापन कराएं।"
                      : "Get a verified review from agricultural scientists."}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(true)}
                    className="min-h-[48px] px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary/90 transition shadow-xs flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>
                      {isHindi ? "विशेषज्ञ सलाह मांगें" : "Request Expert Review"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS (Preserved backend functionality) ── */}
      <RequestExpertModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        cropName={crop || 'Crop'}
        state='Madhya Pradesh'
        district='Sehore'
        imageUrl={imageDataUrl}
        predictedDisease={mlResult?.disease_name || formatClassName(mlResult?.predicted_class || '')}
        onCaseCreated={(caseId: string) => {
          setActiveCaseId(caseId);
          setRequestModalOpen(false);
          setTrackModalOpen(true);
        }}
        language={activeLang}
      />

      <KVKDirectoryModal
        isOpen={kvkModalOpen}
        onClose={() => setKvkModalOpen(false)}
      />

      <TrackCaseModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialCaseId={activeCaseId || undefined}
      />

      <TreatmentPopupModal
        isOpen={treatmentPopupOpen}
        onClose={() => setTreatmentPopupOpen(false)}
        crop={crop || mlResult?.crop || "Crop"}
        diseaseName={mlResult?.disease_name || formatClassName(mlResult?.predicted_class || "")}
        confidence={mlResult?.confidence || 0.85}
        recommendedCategory={getRecommendedCategory(mlResult)}
        diagnosisId={activeCaseId || undefined}
      />
    </div>
  );
}
