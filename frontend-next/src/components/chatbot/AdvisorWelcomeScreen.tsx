"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bug,
  Camera,
  CloudSun,
  FlaskConical,
  Landmark,
  Mic,
  Stethoscope,
  Store,
  Volume2,
  ArrowUpRight,
  Droplets,
  TrendingUp,
} from "lucide-react";
import { FarmerProfileData } from "@/lib/farm-profile-store";
import { VoiceLanguage, voiceService } from "@/lib/voice-speech";

export type WelcomeTopicId =
  | "disease"
  | "weather"
  | "fertilizer"
  | "pest"
  | "mandi"
  | "schemes"
  | "irrigation"
  | "economics";

interface AdvisorWelcomeScreenProps {
  onSelectCard: (topic: WelcomeTopicId, prompt: string) => void;
  onStartVoice: () => void;
  onOpenLeafPhoto: () => void;
  onOpenProfile: () => void;
  farmProfile: FarmerProfileData;
  selectedLanguage: VoiceLanguage;
  userName?: string;
}

export function AdvisorWelcomeScreen({
  onSelectCard,
  onStartVoice,
  onOpenLeafPhoto,
  onOpenProfile,
  farmProfile,
  selectedLanguage,
  userName,
}: AdvisorWelcomeScreenProps) {
  const prefersReduced = useReducedMotion();
  const primaryCrop = farmProfile.mainCrops[0] || "wheat";
  const locationLabel = [farmProfile.district, farmProfile.state].filter(Boolean).join(", ");
  const isHindiPref = selectedLanguage === "hi" || selectedLanguage === "auto";
  const isHinglishPref = selectedLanguage === "hi_en";
  const isKannadaPref = selectedLanguage === "kn";

  const pickPrompt = (hi: string, hiEn: string, kn: string, en: string) =>
    isHindiPref ? hi : isHinglishPref ? hiEn : isKannadaPref ? kn : en;

  const cards: {
    id: WelcomeTopicId;
    title: string;
    subtitleHi: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    prompt: string;
    hasPhotoShortcut?: boolean;
  }[] = [
    {
      id: "disease",
      title: "Crop Disease Diagnosis",
      subtitleHi: isKannadaPref ? "ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ" : "फसल रोग पहचान व उपचार",
      description: `Identify leaf spots, yellowing, rust, or wilt in ${primaryCrop} with ICAR remedies.`,
      icon: Stethoscope,
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
      prompt: pickPrompt(
        `मेरी ${primaryCrop} की फसल की पत्तियों पर पीले या भूरे धब्बे दिख रहे हैं। संभावित रोग, कारण और जैविक व रासायनिक उपचार बताएं।`,
        `Meri ${primaryCrop} ki fasal ke patte peele ya bhure ho rahe hain. Sambhavit rog, kaaran aur jaivik/surakshit upchar batayein.`,
        `ನನ್ನ ${primaryCrop} ಬೆಳೆಯ ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಮತ್ತು ಕಂದು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತಿವೆ. ಸಂಭಾವ್ಯ ರೋಗ, ಕಾರಣಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ಪರಿಹಾರ ತಿಳಿಸಿ.`,
        `My ${primaryCrop} crop leaves show yellowing and brown spots. Identify the likely disease, possible causes, and recommended treatment.`
      ),
      hasPhotoShortcut: true,
    },
    {
      id: "weather",
      title: "Weather Information",
      subtitleHi: isKannadaPref ? "ಹವಾಮಾನ ಮತ್ತು ಸಿಂಪರಣೆ ಸಲಹೆ" : "मौसम और स्प्रे सलाह",
      description: `Check live weather, rain forecast, and safe spray window for ${locationLabel || "your farm"}.`,
      icon: CloudSun,
      iconBg: "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60",
      prompt: pickPrompt(
        `${locationLabel || "मेरे क्षेत्र"} का आज का मौसम और अगले 5 दिनों का पूर्वानुमान बताएं। क्या आज खेत में छिड़काव या सिंचाई करना सुरक्षित है?`,
        `${locationLabel || "Mere kshetra"} ka aaj ka mausam aur agle 5 din ka forecast batayein. Kya aaj spray ya sinchai karna theek hai?`,
        `${locationLabel || "ನಮ್ಮ ಭಾಗದ"} ಇಂದಿನ ಹವಾಮಾನ ಮತ್ತು ಮುಂದಿನ 5 ದಿನಗಳ ಮುನ್ಸೂಚನೆ ತಿಳಿಸಿ. ಇಂದು ಔಷಧಿ ಸಿಂಪಡಣೆ ಸುರಕ್ಷಿತವೇ?`,
        `What is today's weather and 5-day forecast for ${locationLabel || "my district"}, and is it safe for pesticide spraying today?`
      ),
    },
    {
      id: "fertilizer",
      title: "Fertilizer Recommendations",
      subtitleHi: isKannadaPref ? "ರಸಗೊಬ್ಬರ ಮತ್ತು ಪೋಷಕಾಂಶ" : "खाद और पोषक तत्व मात्रा",
      description: `Get balanced NPK, DAP, Urea & micronutrient doses per acre for ${primaryCrop}.`,
      icon: FlaskConical,
      iconBg: "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60",
      prompt: pickPrompt(
        `${primaryCrop} की फसल के लिए प्रति एकड़ संतुलित खाद और उर्वरक (DAP, यूरिया, पोटाश, जिंक) की सही मात्रा और समय बताएं।`,
        `${primaryCrop} ki fasal ke liye prati acre santulit khad (DAP, Urea, MOP, Zinc) ki sahi matra aur samay batayein.`,
        `${primaryCrop} ಬೆಳೆಗೆ ಎಕರೆಗೆ ಸಮತೋಲಿತ ಗೊಬ್ಬರ (DAP, ಯೂರಿಯಾ, ಪೊಟ್ಯಾಶ್, ಜಿಂಕ್) ಪ್ರಮಾಣ ಮತ್ತು ಸಮಯವನ್ನು ತಿಳಿಸಿ.`,
        `What is the ICAR-recommended fertilizer schedule (DAP, Urea, MOP, Zinc) per acre for ${primaryCrop} in ${farmProfile.soilType} soil?`
      ),
    },
    {
      id: "pest",
      title: "Pest Management",
      subtitleHi: isKannadaPref ? "ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ (IPM)" : "कीट नियंत्रण (IPM)",
      description: "Bio-first IPM guidance for stem borer, whitefly, aphids, and caterpillars.",
      icon: Bug,
      iconBg: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
      prompt: pickPrompt(
        `${primaryCrop} में कीट और इल्ली के नियंत्रण के लिए पहले जैविक (नीम तेल, फेरोमोन ट्रैप) और सुरक्षित कीटनाशक उपाय बताएं।`,
        `${primaryCrop} me keet aur illi rokne ke liye pehle jaivik (neem oil, pheromone trap) aur surakshit upay batayein.`,
        `${primaryCrop} ಬೆಳೆಯಲ್ಲಿ ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕೆ ಮೊದಲು ಜೈವಿಕ (ಬೇವಿನ ಎಣ್ಣೆ, ಫೆರೋಮೋನ್ ಬಲೆ) ಮತ್ತು ಸುರಕ್ಷಿತ ಕ್ರಮಗಳನ್ನು ತಿಳಿಸಿ.`,
        `Give me an Integrated Pest Management (IPM) plan for common pests in ${primaryCrop}, starting with organic/biological options and safety precautions.`
      ),
    },
    {
      id: "mandi",
      title: "Mandi Prices",
      subtitleHi: isKannadaPref ? "ಮಂಡಿ ದರಗಳು ಮತ್ತು MSP" : "ताज़ा मंडी भाव और MSP",
      description: "Live AGMARKNET modal prices, min-max range, and market trends.",
      icon: Store,
      iconBg: "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
      prompt: pickPrompt(
        `${farmProfile.state || "भारत"} की मंडियों में ${primaryCrop} और प्रमुख फसलों के ताज़ा मंडी भाव बताएं।`,
        `${farmProfile.state || "Bharat"} ki mandiyon me ${primaryCrop} aur mukhya fasalon ke taaza mandi bhav batayein.`,
        `${farmProfile.state || "ಭಾರತ"} ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ${primaryCrop} ಮತ್ತು ಪ್ರಮುಖ ಬೆಳೆಗಳ ಇಂದಿನ ಮಂಡಿ ದರ ತಿಳಿಸಿ.`,
        `Show me the latest AGMARKNET mandi prices for ${primaryCrop} and key crops in ${farmProfile.state || "India"}.`
      ),
    },
    {
      id: "schemes",
      title: "Government Schemes",
      subtitleHi: isKannadaPref ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿ" : "सरकारी योजनाएं व सब्सिडी",
      description: "PM-KISAN, crop insurance (PMFBY), KCC loans, and irrigation subsidies.",
      icon: Landmark,
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
      prompt: pickPrompt(
        `${farmProfile.state || "मेरे राज्य"} के किसानों के लिए PM-KISAN, फसल बीमा (PMFBY), KCC और सिंचाई सब्सिडी की पात्रता और आवेदन प्रक्रिया बताएं।`,
        `${farmProfile.state || "Mere rajya"} ke kisanon ke liye PM-KISAN, PMFBY fasal bima, KCC aur irrigation subsidy ki jankari dein.`,
        `${farmProfile.state || "ನಮ್ಮ ರಾಜ್ಯದ"} ರೈತರಿಗೆ PM-KISAN, ಬೆಳೆ ವಿಮೆ (PMFBY), KCC ಮತ್ತು ನೀರಾವರಿ ಸಬ್ಸಿಡಿ ಯೋಜನೆಗಳ ಅರ್ಹತೆ ತಿಳಿಸಿ.`,
        `Which government agricultural schemes, crop insurance (PMFBY), PM-KISAN, and subsidies are available for farmers in ${farmProfile.state || "India"}?`
      ),
    },
    {
      id: "irrigation",
      title: "Irrigation & Soil Health",
      subtitleHi: isKannadaPref ? "ನೀರಾವರಿ ಮತ್ತು ಮಣ್ಣಿನ ಆರೋಗ್ಯ" : "सिंचाई और मिट्टी स्वास्थ्य",
      description: `Watering schedules for critical stages and soil pH / carbon restoration in ${primaryCrop}.`,
      icon: Droplets,
      iconBg: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60",
      prompt: pickPrompt(
        `${primaryCrop} की फसल में क्रांतिक अवस्थाओं (CRI, फूल, दाना) पर सिंचाई कब करनी चाहिए? और ${farmProfile.soilType || "दोमट"} मिट्टी के लिए क्या सावधानी रखें?`,
        `${primaryCrop} ki fasal me critical stages par sinchai kab karein aur ${farmProfile.soilType || "domat"} mitti ke liye kya dhyan rakhein?`,
        `${primaryCrop} ಬೆಳೆಗೆ ಪ್ರಮುಖ ಹಂತಗಳಲ್ಲಿ ಯಾವಾಗ ನೀರಾವರಿ ಮಾಡಬೇಕು ಮತ್ತು ${farmProfile.soilType || "ಮಣ್ಣಿಗೆ"} ಸೂಕ್ತ ಸಲಹೆ ನೀಡಿ.`,
        `What are the critical irrigation stages for ${primaryCrop} and how should I manage watering in ${farmProfile.soilType || "loamy"} soil?`
      ),
    },
    {
      id: "economics",
      title: "Expense & Profit Analysis",
      subtitleHi: isKannadaPref ? "ಕೃಷಿ ವೆಚ್ಚ ಮತ್ತು ಲಾಭದ ಲೆಕ್ಕ" : "खेती खर्च और मुनाफे का विश्लेषण",
      description: "Estimate cultivation cost per acre vs expected yield and mandi net profit.",
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
      prompt: pickPrompt(
        `${primaryCrop} की खेती में प्रति एकड़ बीज, खाद, सिंचाई, दवा और कटाई का अनुमानित खर्च और संभावित शुद्ध मुनाफा (Profit) कितना होगा?`,
        `${primaryCrop} ki kheti me prati acre lagat aur sambhavit munafa (profit) ka hisab batayein.`,
        `${primaryCrop} ಕೃಷಿಯಲ್ಲಿ ಪ್ರತಿ ಎಕರೆಗೆ ಅಂದಾಜು ವೆಚ್ಚ ಮತ್ತು ನಿರೀಕ್ಷಿತ ಲಾಭದ ಲೆಕ್ಕಾಚಾರ ತಿಳಿಸಿ.`,
        `Provide an estimated per-acre cultivation cost breakdown and net profit analysis for ${primaryCrop} based on current mandi rates.`
      ),
    },
  ];

  const handleHearGreeting = () => {
    voiceService.speakText(
      "नमस्ते! मैं आपका KisaanBuddy AI कृषि सलाहकार हूँ। आपकी खेती से जुड़े हर सवाल का जवाब देने के लिए मैं यहाँ हूँ।",
      "hi"
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-5 sm:py-8 flex flex-col items-center min-h-full">
      <div className="w-full my-auto flex flex-col items-center">
        {/* Subtle Branded Animated Agricultural Visual */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-5 flex items-center justify-center"
      >
        {!prefersReduced && (
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.15, 0.35] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-24 h-24 rounded-full bg-emerald-400/20 blur-md pointer-events-none"
          />
        )}
        <div className="relative w-20 h-20 rounded-3xl bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-emerald-700/40 shadow-sm flex items-center justify-center">
          <svg
            viewBox="0 0 80 80"
            className="w-14 h-14"
            aria-hidden="true"
          >
            {/* Soft sun arc */}
            <circle cx="56" cy="22" r="9" className="fill-amber-300/70 dark:fill-amber-400/50" />
            {/* Soil ridge */}
            <path
              d="M14 62 Q40 54 66 62"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="text-emerald-800/30 dark:text-emerald-400/30"
            />
            {/* Main growing stem */}
            <motion.path
              d="M40 58 V27"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="text-emerald-700 dark:text-emerald-400"
              initial={prefersReduced ? false : { pathLength: 0.6 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            {/* Left leaf */}
            <motion.path
              d="M40 44 C26 44 21 33 23 24 C32 24 39 31 40 44 Z"
              className="fill-emerald-600/85 dark:fill-emerald-500/85"
              animate={prefersReduced ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "40px 44px" }}
            />
            {/* Right leaf */}
            <motion.path
              d="M40 37 C54 37 59 26 57 17 C48 17 41 24 40 37 Z"
              className="fill-emerald-500 dark:fill-emerald-400"
              animate={prefersReduced ? undefined : { rotate: [1.5, -1.5, 1.5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              style={{ transformOrigin: "40px 37px" }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Required Hindi Welcome Greeting */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-2 max-w-2xl mb-6"
      >
        {(userName || locationLabel) && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-stone-700 shadow-2xs text-[11px] font-medium text-emerald-900 dark:text-emerald-300 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              {userName ? `${userName} Ji` : "Kisan Mitra"}
              {locationLabel ? ` • ${locationLabel}` : ""}
            </span>
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline ml-1"
            >
              Edit Farm
            </button>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#143325] dark:text-emerald-50 font-display leading-snug">
          नमस्ते! मैं आपका KisaanBuddy AI कृषि सलाहकार हूँ।
        </h1>

        <p className="text-sm sm:text-base text-[#355343] dark:text-stone-300 font-medium leading-relaxed">
          आपकी खेती से जुड़े हर सवाल का जवाब देने के लिए मैं यहाँ हूँ।
        </p>

        {/* Primary Voice & Leaf Camera Quick Launchers */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onStartVoice}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>बोलकर पूछें (Voice)</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeafPhoto}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-stone-900 border border-emerald-900/15 dark:border-stone-700 hover:border-emerald-600/50 text-[#143325] dark:text-stone-100 text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-95"
          >
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>फोटो से रोग पहचानें</span>
          </button>

          <button
            type="button"
            onClick={handleHearGreeting}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-100/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors"
            title="Hear welcome greeting"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>सुनें</span>
          </button>
        </div>
      </motion.div>

      {/* 6 Suggested Question Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={prefersReduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: idx * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative flex flex-col justify-between rounded-2xl border border-emerald-900/10 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-4 shadow-2xs hover:shadow-md hover:border-emerald-600/40 transition-all text-left"
            >
              <button
                type="button"
                onClick={() => onSelectCard(card.id, card.prompt)}
                className="w-full text-left flex-1 flex flex-col gap-2.5 focus:outline-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${card.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-emerald-600/50 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#143325] dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {card.subtitleHi}
                  </p>
                  <p className="text-xs text-[#4B5D50] dark:text-stone-400 leading-relaxed mt-1.5 line-clamp-2">
                    {card.description}
                  </p>
                </div>
              </button>

              {card.hasPhotoShortcut && (
                <div className="mt-3 pt-2.5 border-t border-emerald-900/5 dark:border-stone-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onOpenLeafPhoto}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload or Snap Leaf Photo</span>
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
