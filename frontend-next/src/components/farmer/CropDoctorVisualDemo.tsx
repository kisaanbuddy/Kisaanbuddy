"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  ScanLine,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Play,
  RotateCcw,
  Bug,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

interface DemoI18n {
  sectionBadge: string;
  sectionTitle: string;
  sectionSubtitle: string;
  step1Tab: string;
  step2Tab: string;
  step3Tab: string;
  step1Heading: string;
  step1Desc: string;
  step2Heading: string;
  step2Desc: string;
  step3Heading: string;
  step3Desc: string;
  disclaimer: string;
  openCropDoctorCta: string;
  replayText: string;
  sampleDiagnosisLabel: string;
  sampleDiagnosisValue: string;
  sampleGuidance1: string;
  sampleGuidance2: string;
  sampleGuidance3: string;
}

const DEMO_COPY: Record<string, DemoI18n> = {
  hi: {
    sectionBadge: "सरल डेमो देखें",
    sectionTitle: "फसल डॉक्टर कैसे काम करता है?",
    sectionSubtitle: "3 आसान चरणों में समझें — खेत में किसी भी पौधे की बीमारी पहचानें और सही समाधान पाएं",
    step1Tab: "1. फोटो लें",
    step2Tab: "2. जांच",
    step3Tab: "3. समाधान",
    step1Heading: "कदम 1: प्रभावित पत्ती की तस्वीर लें",
    step1Desc: "खेत में बीमार पौधे की पत्ती या तने की नजदीकी फोटो अपने मोबाइल कैमरे से खींचें।",
    step2Heading: "कदम 2: लक्षण व रोग का विश्लेषण",
    step2Desc: "सिस्टम पत्ती के धब्बों, रंग और लक्षणों की जांच कृषि विशेषज्ञों के डेटाबेस से करता है।",
    step3Heading: "कदम 3: तुरंत सरल उपचार व सही खुराक",
    step3Desc: "जैविक उपचार (नीम तेल आदि) और अनुमोदित दवा की प्रति एकड़ सही मात्रा की जानकारी मिलती है।",
    disclaimer: "यह केवल समझाने के लिए एक उदाहरण डेमो है। अपने खेत की वास्तविक जांच के लिए नीचे 'फसल डॉक्टर' बटन दबाएं।",
    openCropDoctorCta: "असली फसल डॉक्टर खोलें",
    replayText: "डेमो फिर से देखें",
    sampleDiagnosisLabel: "पहचाने गए लक्षण (उदाहरण):",
    sampleDiagnosisValue: "सफेद चूर्णी फफूंद (Powdery Mildew)",
    sampleGuidance1: "प्रभावित पत्तियों को अलग करें",
    sampleGuidance2: "नीम तेल 5 मिली/लीटर पानी का छिड़काव",
    sampleGuidance3: "मौसम साफ होने पर अनुमोदित फफूंदनाशक",
  },
  en: {
    sectionBadge: "VISUAL DEMONSTRATION",
    sectionTitle: "How Crop Doctor Works",
    sectionSubtitle: "Understand in 3 simple steps — diagnose plant issues and protect your harvest",
    step1Tab: "1. Take Photo",
    step2Tab: "2. Analysis",
    step3Tab: "3. Guidance",
    step1Heading: "Step 1: Capture Affected Leaf Photo",
    step1Desc: "Take a clear, close-up photo of the affected plant leaf or stem using your phone camera in natural light.",
    step2Heading: "Step 2: Instant Symptom Scanning",
    step2Desc: "The system analyzes visual patterns, color changes, and spots against regional agronomy models.",
    step3Heading: "Step 3: Receive Actionable Treatment Steps",
    step3Desc: "Get clear instructions covering sanitation, organic remedies, and approved sprays with exact dosages.",
    disclaimer: "This is an educational demonstration only. To diagnose crops in your field, tap the button below to use the real Crop Doctor.",
    openCropDoctorCta: "Open Real Crop Doctor",
    replayText: "Replay Demo",
    sampleDiagnosisLabel: "Sample Detected Symptoms:",
    sampleDiagnosisValue: "Powdery Mildew (Fungal Infection)",
    sampleGuidance1: "Prune heavily infected lower leaves",
    sampleGuidance2: "Organic spray: Neem oil (5ml/L water)",
    sampleGuidance3: "Approved fungicide dosage during dry window",
  },
  kn: {
    sectionBadge: "ಸುಲಭ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ",
    sectionTitle: "ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?",
    sectionSubtitle: "3 ಸರಳ ಹಂತಗಳಲ್ಲಿ ತಿಳಿಯಿರಿ — ಬೆಳೆ ರೋಗ ಪತ್ತೆಹಚ್ಚಿ ಪರಿಹಾರ ಪಡೆಯಿರಿ",
    step1Tab: "1. ಫೋಟೋ",
    step2Tab: "2. ವಿಶ್ಲೇಷಣೆ",
    step3Tab: "3. ಪರಿಹಾರ",
    step1Heading: "ಹಂತ 1: ಬಾಧಿತ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ",
    step1Desc: "ರೋಗಪೀಡಿತ ಎಲೆ ಅಥವಾ ಕಾಂಡದ ಹತ್ತಿರದ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಮೊಬೈಲ್‌ನಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    step2Heading: "ಹಂತ 2: ರೋಗ ಲಕ್ಷಣಗಳ ತಪಾಸಣೆ",
    step2Desc: "ರೋಗದ ಕಲೆಗಳು ಮತ್ತು ಲಕ್ಷಣಗಳನ್ನು ಕೃಷಿ ಮಾಹಿತಿಯೊಂದಿಗೆ ಕ್ಷಿಪ್ರವಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ.",
    step3Heading: "ಹಂತ 3: ಸರಳ ಔಷಧೋಪಚಾರ ಮತ್ತು ಸಲಹೆ",
    step3Desc: "ಬೇವಿನ ಎಣ್ಣೆಯಂತಹ ನೈಸರ್ಗಿಕ ಪರಿಹಾರ ಮತ್ತು ಶಿಫಾರಸು ಔಷಧಗಳ ನಿಖರ ಪ್ರಮಾಣ ತಿಳಿಯುತ್ತದೆ.",
    disclaimer: "ಇದು ವಿವರಣೆಗಾಗಿ ಮಾತ್ರ ಇರುವ ಡೆಮೊ ಆಗಿದೆ. ನಿಮ್ಮ ಜಮೀನಿನ ಬೆಳೆ ಪರೀಕ್ಷಿಸಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ.",
    openCropDoctorCta: "ನೈಜ ಕ್ರಾಪ್ ಡಾಕ್ಟರ್ ತೆರೆಯಿರಿ",
    replayText: "ಮತ್ತೆ ವೀಕ್ಷಿಸಿ",
    sampleDiagnosisLabel: "ಮಾದರಿ ಪತ್ತೆಯಾದ ರೋಗ:",
    sampleDiagnosisValue: "ಬೂದಿ ರೋಗ (Powdery Mildew)",
    sampleGuidance1: "ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ",
    sampleGuidance2: "ಬೇವಿನ ಎಣ್ಣೆ 5ಮಿಲಿ/ಲೀ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ",
    sampleGuidance3: "ಹವಾಮಾನ ಒಣಗಿದಾಗ ಶಿಫಾರಸು ಶಿಲೀಂಧ್ರನಾಶಕ",
  },
};

export function CropDoctorVisualDemo() {
  const { lang } = useLanguage();
  const currentLang = lang === "kn" ? "kn" : lang === "en" ? "en" : "hi";
  const t = DEMO_COPY[currentLang] || DEMO_COPY.hi;

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto progression when playing
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setActiveStep((prev) => {
        if (prev === 1) return 2;
        if (prev === 2) return 3;
        setIsPlaying(false);
        return 3;
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, [isPlaying, activeStep]);

  const handleStartDemo = () => {
    setActiveStep(1);
    setIsPlaying(true);
  };

  return (
    <section
      aria-label="Crop Doctor Demo"
      className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-5 sm:p-6 md:p-8 shadow-xs overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            <Bug className="h-3.5 w-3.5 text-rose-600" />
            <span>{t.sectionBadge}</span>
          </div>
          <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            {t.sectionTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            {t.sectionSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStartDemo}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3.5 py-2 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-colors shadow-2xs"
          >
            {activeStep === 3 ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t.replayText}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
                <span>Play Demo</span>
              </>
            )}
          </button>

          <Link
            href="/disease"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <span>{t.openCropDoctorCta}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 3 Step Navigation Pills */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(1);
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition-all ${
            activeStep === 1
              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 shadow-2xs"
              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700/60"
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span className="truncate">{t.step1Tab}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(2);
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition-all ${
            activeStep === 2
              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs"
              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700/60"
          }`}
        >
          <ScanLine className="h-3.5 w-3.5" />
          <span className="truncate">{t.step2Tab}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setActiveStep(3);
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-bold transition-all ${
            activeStep === 3
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700/60"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="truncate">{t.step3Tab}</span>
        </button>
      </div>

      {/* Interactive Demonstration Area */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Visual Media Pane (Authentic leaf photo with stateful effects) */}
        <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900 aspect-4/3 flex items-center justify-center">
          <Image
            src="/images/crop-doctor/powdery-mildew-leaf.webp"
            alt="Authentic affected crop leaf"
            width={480}
            height={360}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              activeStep === 2 ? "scale-105" : "scale-100"
            }`}
          />

          {/* Viewfinder Overlay in Step 1 */}
          {activeStep === 1 && (
            <div className="absolute inset-4 rounded-xl border-2 border-dashed border-white/80 pointer-events-none flex flex-col justify-between p-3 animate-fade-in">
              <div className="flex justify-between text-white/90">
                <span className="h-4 w-4 border-t-2 border-l-2 border-white" />
                <span className="h-4 w-4 border-t-2 border-r-2 border-white" />
              </div>
              <div className="text-center">
                <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                  📸 Focus on Affected Leaf
                </span>
              </div>
              <div className="flex justify-between text-white/90">
                <span className="h-4 w-4 border-b-2 border-l-2 border-white" />
                <span className="h-4 w-4 border-b-2 border-r-2 border-white" />
              </div>
            </div>
          )}

          {/* Laser Scanning Effect in Step 2 */}
          {activeStep === 2 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scan-line" />
              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/70 backdrop-blur-xs p-2 text-center text-xs font-bold text-emerald-300">
                🔍 AI Feature Scanning & Analysis...
              </div>
            </div>
          )}

          {/* Result Tag in Step 3 */}
          {activeStep === 3 && (
            <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-emerald-500/40 shadow-xl max-w-xs text-center space-y-2">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {t.sampleDiagnosisLabel}
                </p>
                <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  {t.sampleDiagnosisValue}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Narrative & Explanation Pane */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              {activeStep === 1
                ? t.step1Heading
                : activeStep === 2
                ? t.step2Heading
                : t.step3Heading}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {activeStep === 1
                ? t.step1Desc
                : activeStep === 2
                ? t.step2Desc
                : t.step3Desc}
            </p>
          </div>

          {/* Step 3 Sample Guidance Checklist */}
          {activeStep === 3 ? (
            <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>अनुमोदित समाधान (Sample Guidance):</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-800 dark:text-stone-200">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{t.sampleGuidance1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{t.sampleGuidance2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{t.sampleGuidance3}</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 p-4 space-y-1">
              <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                {activeStep === 1
                  ? "💡 सुझाव: तेज धूप में या छाया में पत्ती को सीधा रखकर फोटो खींचें।"
                  : "💡 विश्लेषण: भारतीय कृषि विज्ञान केंद्र (KVK) के संदर्भों से मिलान।"}
              </div>
            </div>
          )}

          {/* Educational Disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
            <Info className="h-3.5 w-3.5 text-stone-400 shrink-0 mt-0.5" />
            <p>{t.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CropDoctorVisualDemo;
