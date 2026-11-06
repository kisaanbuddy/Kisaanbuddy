"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Plus, Briefcase, Users, Search, Sprout } from "lucide-react"
import { useLanguage } from "@/lib/language"

interface AgriculturalHeroBannerProps {
  activeTab: "find_workers" | "find_jobs" | "post_job"
  onTabChange: (tab: "find_workers" | "find_jobs" | "post_job") => void
}

const BREADCRUMB_HOME: Record<string, string> = {
  en: "Home",
  hi: "होम",
  kn: "ಮುಖಪುಟ",
  te: "హోమ్",
  ta: "முகப்பு",
  mr: "मुख्यपृष्ठ",
  gu: "હોમ",
  bn: "হোম",
  pa: "ਹੋਮ",
  ml: "ഹോം",
  hi_en: "Home",
}

const MODULE_TITLE: Record<string, string> = {
  en: "Agricultural Labour Hiring",
  hi: "कृषि मजदूर सेवा",
  kn: "ಕೃಷಿ ಕಾರ್ಮಿಕ ನೇಮಕಾತಿ",
  te: "వ్యవసాయ కూలీల నియామకం",
  ta: "விவசாய தொழிலாளர்கள் நியமனம்",
  mr: "कृषी मजूर सेवा",
  gu: "ખેતી મજૂર સેવા",
  bn: "কৃষি শ্রমিক নিয়োগ",
  pa: "ਖੇਤੀ ਮਜ਼ਦੂਰ ਸੇਵਾ",
  ml: "കാർഷിക തൊഴിലാളി നിയമനം",
  hi_en: "Agricultural Labour Hiring",
}

const HERO_TITLE: Record<string, string> = {
  en: "Find Agricultural Workers Near You",
  hi: "नजदीकी कृषि मजदूर खोजें",
  kn: "ನಿಮ್ಮ ಸಮೀಪದ ಕೃಷಿ ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ",
  te: "మీ సమీపంలోని వ్యవసాయ కూలీలను వెతకండి",
  ta: "உங்களுக்கு அருகிலுள்ள விவசாய தொழிலாளர்களை தேடுங்கள்",
  mr: "तुमच्या जवळील शेतमजूर शोधा",
  gu: "તમારી નજીકના ખેતી મજૂરો શોધો",
  bn: "আপনার কাছাকাছি কৃষি শ্রমিক খুঁজুন",
  pa: "ਆਪਣੇ ਨੇੜੇ ਖੇਤੀ ਮਜ਼ਦੂਰ ਲੱਭੋ",
  ml: "നിങ്ങളുടെ അടുത്തുള്ള കാർഷിക തൊഴിലാളികളെ കണ്ടെത്തുക",
  hi_en: "Find Agricultural Workers Near You",
}

const HERO_SUBTITLE: Record<string, string> = {
  en: "Find reliable farm workers, harvesting teams and agricultural equipment operators across India.",
  hi: "विश्वसनीय खेत मजदूर, कटाई दल और ट्रैक्टर ऑपरेटरों को पूरे भारत में आसानी से खोजें।",
  kn: "ಭಾರತದಾದ್ಯಂತ ವಿಶ್ವಾಸಾರ್ಹ ಕೃಷಿ ಕೆಲಸಗಾರರು, ಕೊಯ್ಲು ತಂಡಗಳು ಮತ್ತು ಉಪಕರಣ ಚಾಲಕರನ್ನು ಹುಡುಕಿ.",
  te: "భారతదేశవ్యాప్తంగా నమ్మకమైన వ్యవసాయ కూలీలు, కోత బృందాలు మరియు యంత్ర ఆపరేటర్లను కనుగొనండి.",
  ta: "இந்தியா முழுவதும் நம்பகமான பண்ணை தொழிலாளர்கள், அறுவடை குழுக்கள் மற்றும் இயந்திர ஆபரேட்டர்களை கண்டறியுங்கள்.",
  mr: "संपूर्ण भारतात खात्रीशीर शेतमजूर, कापणी पथके आणि कृषी यंत्र चालकांना शोधा.",
  gu: "સમગ્ર ભારતમાં વિશ્વસનીય ખેત મજૂરો, લણણી ટીમો અને ટ્રેક્ટર ઓપરેટરો શોધો.",
  bn: "ভারতজুড়ে নির্ভরযোগ্য কৃষি শ্রমিক, ফসল কাটার দল এবং ট্রাক্টর চালকদের খুঁজুন।",
  pa: "ਭਾਰਤ ਭਰ ਵਿੱਚ ਭਰੋਸੇਯੋਗ ਖੇਤੀ ਮਜ਼ਦੂਰ, ਵਾਢੀ ਟੀਮਾਂ ਅਤੇ ਟ੍ਰੈਕਟਰ ਆਪਰੇਟਰ ਲੱਭੋ।",
  ml: "ഇന്ത്യയിലുടനീളം വിശ്വസനീയമായ ഫാം തൊഴിലാളികളെയും വിളവെടുപ്പ് സംഘങ്ങളെയും കണ്ടെത്തുക.",
  hi_en: "Find reliable farm workers, harvesting teams and agricultural equipment operators across India.",
}

const POST_JOB_LABEL: Record<string, string> = {
  en: "+ Post a Farm Job",
  hi: "+ खेत का काम पोस्ट करें",
  kn: "+ ಕೃಷಿ ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ",
  te: "+ వ్యవసాయ పనిని పోస్ట్ చేయండి",
  ta: "+ பண்ணை வேலையை பதிவிடுங்கள்",
  mr: "+ शेतीचे काम पोस्ट करा",
  gu: "+ ખેતી કામ પોસ્ટ કરો",
  bn: "+ খামারের কাজ পোস্ট করুন",
  pa: "+ ਖੇਤੀ ਦਾ ਕੰਮ ਪੋਸਟ ਕਰੋ",
  ml: "+ ഫാം ജോലി പോസ്റ്റ് ചെയ്യുക",
  hi_en: "+ Post a Farm Job",
}

const BROWSE_JOBS_LABEL: Record<string, string> = {
  en: "Find Farming Jobs",
  hi: "खेती काम खोजें",
  kn: "ಕೃಷಿ ಕೆಲಸ ಹುಡುಕಿ",
  te: "వ్యవసాయ పనులు వెతకండి",
  ta: "பண்ணை வேலைகளை தேடுங்கள்",
  mr: "शेतीची कामे शोधा",
  gu: "ખેતી કામ શોધો",
  bn: "কৃষিকাজ খুঁজুন",
  pa: "ਖੇਤੀ ਕੰਮ ਲੱਭੋ",
  ml: "കൃഷി ജോലികൾ",
  hi_en: "Find Farming Jobs",
}

const TAB_FIND_WORKERS: Record<string, string> = {
  en: "Find Workers",
  hi: "मजदूर खोजें",
  kn: "ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಿ",
  te: "కూలీలను వెతకండి",
  ta: "தொழிலாளர்களை தேடுங்கள்",
  mr: "मजूर शोधा",
  gu: "મજૂર શોધો",
  bn: "শ্রমিক খুঁজুন",
  pa: "ਮਜ਼ਦੂਰ ਲੱਭੋ",
  ml: "തൊഴിലാളികളെ കണ്ടെത്തുക",
  hi_en: "Find Workers",
}

export function AgriculturalHeroBanner({ activeTab, onTabChange }: AgriculturalHeroBannerProps) {
  const { lang } = useLanguage()

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium px-1">
        <Link href="/" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
          {BREADCRUMB_HOME[lang] || "Home"}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-800 dark:text-stone-200 font-semibold">
          {MODULE_TITLE[lang] || "Agricultural Labour Hiring"}
        </span>
      </nav>

      {/* Hero Card with Indian Farm Landscape and Tractor Illustration */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white shadow-md border border-emerald-700/40 p-6 sm:p-8 lg:p-10">
        {/* Soft Ambient Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5 text-emerald-300" />
              <span>{MODULE_TITLE[lang] || "Agricultural Labour Hiring"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {HERO_TITLE[lang] || "Find Agricultural Workers Near You"}
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
              {HERO_SUBTITLE[lang] || "Find reliable farm workers, harvesting teams and agricultural equipment operators across India."}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onTabChange("post_job")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 font-extrabold text-sm shadow-md hover:bg-emerald-50 active:scale-98 transition-all duration-150 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-800 stroke-[3]" />
                <span>{POST_JOB_LABEL[lang] || "+ Post a Farm Job"}</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("find_jobs")}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 font-bold text-sm border border-emerald-600/50 backdrop-blur-sm active:scale-98 transition-all duration-150 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-emerald-300" />
                <span>{BROWSE_JOBS_LABEL[lang] || "Find Farming Jobs"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Layered Agricultural Illustration (Sunrise, Green Terraced Fields, Farmer & Modern Tractor) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md aspect-[16/10] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-inner border border-white/10 relative bg-gradient-to-b from-sky-400/20 via-emerald-600/30 to-emerald-950/60 p-2 flex items-center justify-center">
              <svg
                viewBox="0 0 500 320"
                className="w-full h-full object-contain filter drop-shadow-md select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sky & Sunrise Glow */}
                <rect width="500" height="320" rx="16" fill="url(#skyGrad)" />
                <circle cx="250" cy="110" r="45" fill="url(#sunGlow)" />
                <circle cx="250" cy="110" r="28" fill="#FDE047" opacity="0.95" />

                {/* Distant Rolling Hills */}
                <path d="M0 160 Q 120 120 250 145 T 500 150 L 500 320 L 0 320 Z" fill="#047857" opacity="0.5" />
                <path d="M0 185 Q 160 140 320 170 T 500 175 L 500 320 L 0 320 Z" fill="#065F46" opacity="0.8" />

                {/* Cultivated Crop Furrows / Field Rows */}
                <path d="M0 220 C 150 190 350 200 500 215 L 500 320 L 0 320 Z" fill="#064E3B" />
                
                {/* Furrow lines */}
                <path d="M20 320 L 140 215" stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
                <path d="M120 320 L 220 210" stroke="#059669" strokeWidth="3" strokeDasharray="7 5" opacity="0.6" />
                <path d="M230 320 L 300 210" stroke="#059669" strokeWidth="3" strokeDasharray="7 5" opacity="0.6" />
                <path d="M340 320 L 370 212" stroke="#059669" strokeWidth="3" strokeDasharray="7 5" opacity="0.6" />
                <path d="M440 320 L 430 215" stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />

                {/* Golden Wheat Stalks at Bottom Left */}
                <g opacity="0.9">
                  <path d="M15 320 Q 25 270 35 245" stroke="#FBBF24" strokeWidth="2" />
                  <ellipse cx="35" cy="242" rx="4" ry="7" fill="#F59E0B" transform="rotate(20 35 242)" />
                  <ellipse cx="30" cy="252" rx="3.5" ry="6" fill="#FBBF24" transform="rotate(-20 30 252)" />
                  <ellipse cx="38" cy="262" rx="3.5" ry="6" fill="#F59E0B" transform="rotate(25 38 262)" />

                  <path d="M35 320 Q 45 260 58 235" stroke="#FBBF24" strokeWidth="2" />
                  <ellipse cx="58" cy="232" rx="4.5" ry="8" fill="#F59E0B" transform="rotate(15 58 232)" />
                  <ellipse cx="52" cy="244" rx="4" ry="7" fill="#FBBF24" transform="rotate(-25 52 244)" />
                  <ellipse cx="62" cy="256" rx="4" ry="7" fill="#F59E0B" transform="rotate(20 62 256)" />

                  <path d="M55 320 Q 68 275 80 250" stroke="#FBBF24" strokeWidth="2" />
                  <ellipse cx="80" cy="247" rx="4" ry="7" fill="#F59E0B" transform="rotate(10 80 247)" />
                  <ellipse cx="74" cy="258" rx="3.5" ry="6" fill="#FBBF24" transform="rotate(-20 74 258)" />
                </g>

                {/* Indian Farmer Figure in Field (Left-Center) */}
                <g id="farmerFigure" transform="translate(110, 165)">
                  {/* Farmer Shadow */}
                  <ellipse cx="25" cy="78" rx="22" ry="5" fill="#022c22" opacity="0.6" />
                  {/* Traditional Red/Saffron Turban (Pagri) */}
                  <ellipse cx="25" cy="18" rx="9" ry="7" fill="#DC2626" />
                  <path d="M18 16 Q 25 11 32 16 Q 30 24 20 23 Z" fill="#EA580C" />
                  {/* Face */}
                  <circle cx="25" cy="23" r="5" fill="#FBBF24" />
                  {/* Kurta (White / Beige) */}
                  <path d="M17 28 L 33 28 L 36 54 L 14 54 Z" fill="#F8FAFC" />
                  <path d="M25 28 L 25 45" stroke="#CBD5E1" strokeWidth="1" />
                  {/* Raised Arm Greeting */}
                  <path d="M33 32 Q 44 26 48 18" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="48" cy="18" r="3" fill="#FBBF24" />
                  {/* Left Arm holding farming tool */}
                  <path d="M17 32 L 8 46" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
                  {/* Traditional Dhoti */}
                  <path d="M15 54 L 20 74 L 25 58 L 30 74 L 35 54 Z" fill="#E2E8F0" />
                  {/* Feet */}
                  <ellipse cx="20" cy="76" rx="4" ry="2" fill="#78350F" />
                  <ellipse cx="30" cy="76" rx="4" ry="2" fill="#78350F" />
                </g>

                {/* Modern Indian Tractor in Fields (Right Side) */}
                <g id="tractor" transform="translate(260, 155)">
                  {/* Tractor Shadow */}
                  <ellipse cx="90" cy="98" rx="85" ry="10" fill="#022c22" opacity="0.7" />

                  {/* Rear Big Treaded Wheel */}
                  <circle cx="45" cy="72" r="30" fill="#1E293B" />
                  <circle cx="45" cy="72" r="22" fill="#334155" />
                  <circle cx="45" cy="72" r="14" fill="#F8FAFC" />
                  <circle cx="45" cy="72" r="6" fill="#1E293B" />
                  {/* Wheel Lug Treads */}
                  <line x1="45" y1="44" x2="45" y2="52" stroke="#0F172A" strokeWidth="4" />
                  <line x1="45" y1="92" x2="45" y2="100" stroke="#0F172A" strokeWidth="4" />
                  <line x1="17" y1="72" x2="25" y2="72" stroke="#0F172A" strokeWidth="4" />
                  <line x1="65" y1="72" x2="73" y2="72" stroke="#0F172A" strokeWidth="4" />
                  <line x1="25" y1="52" x2="31" y2="58" stroke="#0F172A" strokeWidth="4" />
                  <line x1="59" y1="86" x2="65" y2="92" stroke="#0F172A" strokeWidth="4" />
                  <line x1="25" y1="92" x2="31" y2="86" stroke="#0F172A" strokeWidth="4" />
                  <line x1="59" y1="58" x2="65" y2="52" stroke="#0F172A" strokeWidth="4" />

                  {/* Front Small Wheel */}
                  <circle cx="145" cy="80" r="18" fill="#1E293B" />
                  <circle cx="145" cy="80" r="13" fill="#334155" />
                  <circle cx="145" cy="80" r="8" fill="#F8FAFC" />
                  <circle cx="145" cy="80" r="3" fill="#1E293B" />

                  {/* Engine Hood / Body (Vibrant Green & Gold) */}
                  <path d="M45 42 L 85 42 L 155 52 L 158 75 L 85 75 L 45 68 Z" fill="#16A34A" />
                  <path d="M85 45 L 148 53 L 148 59 L 85 53 Z" fill="#FACC15" />
                  
                  {/* Grille & Headlight */}
                  <rect x="150" y="54" width="7" height="15" rx="2" fill="#0F172A" />
                  <circle cx="152" cy="58" r="3" fill="#FEF08A" />

                  {/* Driver Seat & Steering Wheel */}
                  <path d="M58 35 L 68 35 L 68 50 L 58 50 Z" fill="#1E293B" />
                  <line x1="88" y1="38" x2="78" y2="48" stroke="#0F172A" strokeWidth="3" />
                  <ellipse cx="88" cy="38" rx="6" ry="2" fill="#334155" transform="rotate(-30 88 38)" />

                  {/* Vertical Exhaust Stack with slight smoke puff */}
                  <rect x="125" y="24" width="4" height="28" fill="#334155" rx="1" />
                  <path d="M125 24 L 129 20 L 132 21" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="134" cy="16" r="3" fill="#F1F5F9" opacity="0.5" />
                  <circle cx="138" cy="11" r="4.5" fill="#F1F5F9" opacity="0.3" />

                  {/* Roll-Over Protection Structure (ROPS Canopy) */}
                  <path d="M35 60 L 35 15 L 75 15 L 75 42" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
                  <rect x="25" y="10" width="60" height="6" rx="3" fill="#F8FAFC" />
                </g>

                {/* Flying Birds in Sky */}
                <path d="M190 70 Q 196 64 202 70 Q 208 64 214 70" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
                <path d="M220 85 Q 224 80 228 85 Q 232 80 236 85" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="skyGrad" x1="250" y1="0" x2="250" y2="250" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0284C7" stopOpacity="0.4" />
                    <stop offset="0.5" stopColor="#0D9488" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#065F46" stopOpacity="0.8" />
                  </linearGradient>
                  <radialGradient id="sunGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(250 110) rotate(90) scale(45)">
                    <stop stopColor="#FDE047" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3 Navigation Tabs (Only 3 Primary Sections) */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-1 gap-2 p-1.5 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-inner">
        <button
          type="button"
          onClick={() => onTabChange("find_workers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer shrink-0 ${
            activeTab === "find_workers"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{TAB_FIND_WORKERS[lang] || "Find Workers"}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("find_jobs")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer shrink-0 ${
            activeTab === "find_jobs"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{BROWSE_JOBS_LABEL[lang] || "Find Farming Jobs"}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("post_job")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer shrink-0 ${
            activeTab === "post_job"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{POST_JOB_LABEL[lang] || "+ Post a Farm Job"}</span>
        </button>
      </div>
    </div>
  )
}
