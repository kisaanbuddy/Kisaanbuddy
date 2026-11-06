"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  Store,
  Bug,
  Leaf,
  CheckCircle2,
} from "lucide-react";
import { useLanguage, type Lang } from "@/lib/language";

interface TreatmentPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: string;
  diseaseName: string;
  confidence?: number;
  growthStage?: string;
  recommendedCategory?: string;
  diagnosisId?: string;
}

const POPUP_I18N: Record<
  Lang,
  {
    heading: string;
    description: string;
    cta: string;
    secondaryCta: string;
    detectedLabel: string;
    confidenceLabel: string;
    categoryLabel: string;
    verifiedBadge: string;
  }
> = {
  en: {
    heading: "Need a Solution for Your Crop?",
    description:
      "Explore suitable fertilizers and verified treatment products for your crop problem at KisaanBuddy Farming Market.",
    cta: "Explore Treatment Products",
    secondaryCta: "Maybe Later",
    detectedLabel: "Diagnosed Condition",
    confidenceLabel: "Confidence",
    categoryLabel: "Recommended Input Category",
    verifiedBadge: "CIBRC / FCO Verified Products Only",
  },
  hi: {
    heading: "क्या आपको फसल के लिए समाधान चाहिए?",
    description:
      "किसानबड्डी फार्मिंग मार्केट पर अपनी फसल समस्या के लिए उपयुक्त खाद और प्रमाणित उपचार उत्पाद देखें।",
    cta: "उपचार उत्पाद देखें",
    secondaryCta: "बाद में देखें",
    detectedLabel: "पहचानी गई बीमारी",
    confidenceLabel: "सटीकता",
    categoryLabel: "सुझाया गया उत्पाद वर्ग",
    verifiedBadge: "केवल CIBRC / FCO प्रमाणित उत्पाद",
  },
  kn: {
    heading: "ನಿಮ್ಮ ಬೆಳೆಗೆ ಪರಿಹಾರ ಬೇಕೇ?",
    description:
      "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕೃಷಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆಯ ಸಮಸ್ಯೆಗೆ ಸೂಕ್ತ ರಸಗೊಬ್ಬರಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಚಿಕಿತ್ಸಾ ಉತ್ಪನ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
    cta: "ಚಿಕಿತ್ಸಾ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ",
    secondaryCta: "ನಂತರ ನೋಡುವೆ",
    detectedLabel: "ಪತ್ತೆಯಾದ ರೋಗ",
    confidenceLabel: "ನಿಖರತೆ",
    categoryLabel: "ಶಿಫಾರಸು ಮಾಡಿದ ವರ್ಗ",
    verifiedBadge: "CIBRC / FCO ಪರಿಶೀಲಿಸಿದ ಉತ್ಪನ್ನಗಳು ಮಾತ್ರ",
  },
  ta: {
    heading: "உங்கள் பயிருக்கு தீர்வு தேவையா?",
    description:
      "கிசான்பட்டி வேளாண் சந்தையில் உங்கள் பயிர் பிரச்சனைக்கான பொருத்தமான உரங்கள் மற்றும் சரிபார்க்கப்பட்ட சிகிச்சை தயாரிப்புகளை ஆராயுங்கள்.",
    cta: "சிகிச்சை தயாரிப்புகளை ஆராயுங்கள்",
    secondaryCta: "பிறகு பார்க்கிறேன்",
    detectedLabel: "கண்டறியப்பட்ட நோய்",
    confidenceLabel: "நம்பகத்தன்மை",
    categoryLabel: "பரிந்துரைக்கப்பட்ட பிரிவு",
    verifiedBadge: "CIBRC / FCO அங்கீகரிக்கப்பட்ட தயாரிப்புகள் மட்டும்",
  },
  te: {
    heading: "మీ పంటకు పరిష్కారం కావాలా?",
    description:
      "కిసాన్‌బడ్డీ వ్యవసాయ మార్కెట్‌లో మీ పంట సమస్యకు తగిన ఎరువులు మరియు ధృవీకరించబడిన చికిత్సా ఉత్పత్తులను అన్వేషించండి.",
    cta: "చికిత్సా ఉత్పత్తులను చూడండి",
    secondaryCta: "తరువాత చూస్తాను",
    detectedLabel: "గుర్తించిన వ్యాధి",
    confidenceLabel: "ఖచ్చితత్వం",
    categoryLabel: "సిఫార్సు చేయబడిన వర్గం",
    verifiedBadge: "CIBRC / FCO ధృవీకరించిన ఉత్పత్తులు మాత్రమే",
  },
  ml: {
    heading: "നിങ്ങളുടെ വിളയ്ക്ക് ഒരു പരിഹാരം ആവശ്യമുണ്ടോ?",
    description:
      "കിസാൻബഡ്ഡി ഫാമിംഗ് മാർക്കറ്റിൽ നിങ്ങളുടെ വിള പ്രശ്നത്തിന് അനുയോജ്യമായ വളങ്ങളും പരിശോധിച്ച ചികിത്സാ ഉൽപ്പന്നങ്ങളും കണ്ടെത്തുക.",
    cta: "ചികിത്സാ ഉൽപ്പന്നങ്ങൾ കാണുക",
    secondaryCta: "പിന്നീട് നോക്കാം",
    detectedLabel: "കണ്ടെത്തിയ രോഗം",
    confidenceLabel: "കൃത്യത",
    categoryLabel: "ശുപാർശ ചെയ്ത വിഭാഗം",
    verifiedBadge: "CIBRC / FCO അംഗീകൃത ഉൽപ്പന്നങ്ങൾ മാത്രം",
  },
  mr: {
    heading: "आपल्या पिकासाठी उपाय हवा आहे का?",
    description:
      "किसानबड्डी फार्मिंग मार्केटवर आपल्या पिकाच्या समस्येसाठी योग्य खते आणि प्रमाणित उपचार उत्पादने शोधा.",
    cta: "उपचार उत्पादने पहा",
    secondaryCta: "नंतर पाहा",
    detectedLabel: "निदान झालेला रोग",
    confidenceLabel: "अचूकता",
    categoryLabel: "शिफारस केलेला प्रवर्ग",
    verifiedBadge: "केवळ CIBRC / FCO प्रमाणित उत्पादने",
  },
  bn: {
    heading: "আপনার ফসলের জন্য সমাধান প্রয়োজন?",
    description:
      "কিসানবাডি ফার্মিং মার্কেটে আপনার ফসলের সমস্যার জন্য উপযুক্ত সার এবং যাচাইকৃত চিকিৎসা পণ্যগুলি ঘুরে দেখুন।",
    cta: "চিকিৎসা পণ্যগুলি দেখুন",
    secondaryCta: "পরে দেখব",
    detectedLabel: "শনাক্তকৃত রোগ",
    confidenceLabel: "নির্ভুলতা",
    categoryLabel: "সুপারিশকৃত বিভাগ",
    verifiedBadge: "শুধুমাত্র CIBRC / FCO যাচাইকৃত পণ্য",
  },
  pa: {
    heading: "ਕੀ ਤੁਹਾਨੂੰ ਫ਼ਸਲ ਲਈ ਹੱਲ ਚਾਹੀਦਾ ਹੈ?",
    description:
      "ਕਿਸਾਨਬੱਡੀ ਫਾਰਮਿੰਗ ਮਾਰਕੀਟ 'ਤੇ ਆਪਣੀ ਫ਼ਸਲ ਦੀ ਸਮੱਸਿਆ ਲਈ ਢੁਕਵੀਆਂ ਖਾਦਾਂ ਅਤੇ ਤਸਦੀਕਸ਼ੁਦਾ ਇਲਾਜ ਉਤਪਾਦਾਂ ਦੀ ਖੋਜ ਕਰੋ।",
    cta: "ਇਲਾਜ ਉਤਪਾਦ ਦੇਖੋ",
    secondaryCta: "ਬਾਅਦ ਵਿੱਚ",
    detectedLabel: "ਪਛਾਣੀ ਗਈ ਬਿਮਾਰੀ",
    confidenceLabel: "ਸਟੀਕਤਾ",
    categoryLabel: "ਸਿਫਾਰਸ਼ ਕੀਤੀ ਸ਼੍ਰੇਣੀ",
    verifiedBadge: "ਸਿਰਫ਼ CIBRC / FCO ਪ੍ਰਮਾਣਿਤ ਉਤਪਾਦ",
  },
  gu: {
    heading: "તમારા પાક માટે ઉકેલ જોઈએ છે?",
    description:
      "કિસાનબડી ફાર્મિંગ માર્કેટ પર તમારા પાકની સમસ્યા માટે યોગ્ય ખાતરો અને પ્રમાણિત સારવાર ઉત્પાદનો શોધો.",
    cta: "સારવાર ઉત્પાદનો જુઓ",
    secondaryCta: "પછી જોઈશ",
    detectedLabel: "શોધાયેલ રોગ",
    confidenceLabel: "ચોકસાઈ",
    categoryLabel: "ભલામણ કરેલ શ્રેણી",
    verifiedBadge: "માત્ર CIBRC / FCO ચકાસાયેલ ઉત્પાદનો",
  },
  hi_en: {
    heading: "Need a Solution for Your Crop?",
    description:
      "Explore suitable fertilizers and verified treatment products for your crop problem at KisaanBuddy Farming Market.",
    cta: "Explore Treatment Products",
    secondaryCta: "Maybe Later",
    detectedLabel: "Diagnosed Problem",
    confidenceLabel: "Confidence",
    categoryLabel: "Recommended Category",
    verifiedBadge: "CIBRC / FCO Verified Products Only",
  },
};

export function TreatmentPopupModal({
  isOpen,
  onClose,
  crop,
  diseaseName,
  confidence = 0.85,
  growthStage,
  recommendedCategory = "fungicides",
  diagnosisId,
}: TreatmentPopupModalProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = POPUP_I18N[lang] || POPUP_I18N.en;

  const handleExplore = () => {
    onClose();
    const q = new URLSearchParams();
    q.set("tab", "inputs");
    if (crop) q.set("crop", crop);
    if (diseaseName) q.set("disease", diseaseName);
    if (recommendedCategory) q.set("category", recommendedCategory);
    if (confidence) q.set("confidence", confidence.toFixed(2));
    if (diagnosisId) q.set("diagnosis_id", diagnosisId);
    router.push(`/marketplace?${q.toString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-500/30 bg-white dark:bg-stone-900 shadow-2xl z-10"
          >
            {/* Ambient Gradient Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              {/* Top Tag & Icon */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs">
                  <Sparkles className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{t.verifiedBadge}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-1">
                    {t.heading}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                {t.description}
              </p>

              {/* Diagnosis Match Pill Card */}
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold uppercase tracking-wider">{t.detectedLabel}</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {t.confidenceLabel}: {Math.round(confidence * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shrink-0">
                    <Bug className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                    {crop ? `${crop}: ` : ""}{diseaseName}
                  </span>
                </div>

                {growthStage && (
                  <p className="text-xs text-stone-500">
                    <span className="font-semibold">Plant Stage:</span> {growthStage}
                  </p>
                )}

                <div className="pt-2 border-t border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Store className="h-3.5 w-3.5 text-emerald-600" />
                    {t.categoryLabel}
                  </span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 capitalize">
                    {recommendedCategory.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExplore}
                  className="w-full sm:flex-1 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition"
                >
                  <span>{t.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto h-12 px-5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-[0.98] font-bold text-sm transition"
                >
                  {t.secondaryCta}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
