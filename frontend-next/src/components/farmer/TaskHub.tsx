"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CloudSun,
  Landmark,
  Settings2,
  Shovel,
  Sprout,
  Stethoscope,
  Tractor,
  Users,
  Wheat,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

interface TaskItem {
  href: string;
  title: Record<string, string>;
  description: Record<string, string>;
  badge?: Record<string, string>;
  icon: LucideIcon;
  color: string;
}

const HUBS_DATA: Record<
  "fasal" | "madad",
  {
    kicker: Record<string, string>;
    title: Record<string, string>;
    description: Record<string, string>;
    tasks: TaskItem[];
  }
> = {
  fasal: {
    kicker: {
      en: "FARM INTELLIGENCE",
      hi: "फसल सहायता",
      kn: "ಬೆಳೆ ಸೇವೆಗಳು",
    },
    title: {
      en: "Fasal (Crop Care)",
      hi: "फसल (देखभाल व सलाह)",
      kn: "ಬೆಳೆ (ಆರೈಕೆ & ಮಾಹಿತಿ)",
    },
    description: {
      en: "Simple, practical tools to diagnose crop problems, check rain alerts, and manage your farm.",
      hi: "फसल की बीमारी पहचानें, मौसम का अनुमान देखें और अपने खेत की सही देखभाल करें।",
      kn: "ಬೆಳೆ ರೋಗ ಪತ್ತೆ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ನಿಮ್ಮ ಜಮೀನಿನ ಮಾಹಿತಿ ಒಂದೇ ಕಡೆ.",
    },
    tasks: [
      {
        href: "/disease",
        title: {
          en: "Crop Doctor",
          hi: "फसल डॉक्टर",
          kn: "ಬೆಳೆ ವೈದ್ಯ",
        },
        description: {
          en: "Take a photo of diseased leaf or describe symptom for instant treatment advice.",
          hi: "खराब पत्ती की फोटो लें या लक्षण बताएं — तुरंत उपाय और दवा जानें।",
          kn: "ರೋಗಪೀಡಿತ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ, ಸೂಕ್ತ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಔಷಧಿ ತಿಳಿಯಿರಿ.",
        },
        badge: {
          en: "Photo screening",
          hi: "फोटो से पहचान",
          kn: "ಫೋಟೋ ಪತ್ತೆ",
        },
        icon: Stethoscope,
        color: "bg-rose-50 text-rose-800 border-rose-200",
      },
      {
        href: "/weather",
        title: {
          en: "Weather & Rain Alerts",
          hi: "मौसम व बारिश अलर्ट",
          kn: "ಹವಾಮಾನ & ಮಳೆ ಎಚ್ಚರಿಕೆ",
        },
        description: {
          en: "Today's forecast, next 3 days, rain timing, and pesticide spraying advice.",
          hi: "आज और अगले 3 दिनों का मौसम, बारिश की संभावना और कीटनाशक छिड़काव सलाह।",
          kn: "ಇಂದಿನ ಮತ್ತು ಮುಂದಿನ 3 ದಿನಗಳ ಮಳೆ ಮುನ್ಸೂಚನೆ, ಔಷಧ ಸಿಂಪಡಣೆ ಸಲಹೆ.",
        },
        badge: {
          en: "Hyper-local",
          hi: "स्थानीय मौसम",
          kn: "ಸ್ಥಳೀಯ",
        },
        icon: CloudSun,
        color: "bg-sky-50 text-sky-800 border-sky-200",
      },
      {
        href: "/crop-predictor",
        title: {
          en: "Crop Guidance",
          hi: "फसल सुझाव व मार्गदर्शन",
          kn: "ಬೆಳೆ ಮಾರ್ಗದರ್ಶನ",
        },
        description: {
          en: "Find which crop is most profitable and suitable for your soil and season.",
          hi: "अपनी मिट्टी, पानी और मौसम के अनुसार सबसे सही और लाभकारी फसल चुनें।",
          kn: "ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ಋತುವಿಗೆ ಸೂಕ್ತವಾದ ಲಾಭದಾಯಕ ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ.",
        },
        badge: {
          en: "Advisory",
          hi: "सुझाव",
          kn: "ಸಲಹೆ",
        },
        icon: Sprout,
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      },
      {
        href: "/farmer-profile",
        title: {
          en: "My Farm Information",
          hi: "मेरा खेत (खेत की जानकारी)",
          kn: "ನನ್ನ ಜಮೀನು ಮಾಹಿತಿ",
        },
        description: {
          en: "Save your village, farm size, crops, and irrigation for personalized tips.",
          hi: "अपना गांव, जमीन का रकबा, फसल और सिंचाई साधन सेव करें।",
          kn: "ನಿಮ್ಮ ಊರು, ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ನೀರಿನ ಸೌಲಭ್ಯ ದಾಖಲಿಸಿ.",
        },
        badge: {
          en: "Saved profile",
          hi: "प्रोफाइल",
          kn: "ಪ್ರೊಫೈಲ್",
        },
        icon: Wheat,
        color: "bg-amber-50 text-amber-900 border-amber-200",
      },
      {
        href: "/soil-health",
        title: {
          en: "Soil Health & Fertilizer",
          hi: "मिट्टी स्वास्थ्य व खाद सलाह",
          kn: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ & ಗೊಬ್ಬರ",
        },
        description: {
          en: "Understand soil test results and get balanced fertilizer dosage without waste.",
          hi: "मिट्टी की जांच समझें और यूरिया, डीएपी की सही संतुलित मात्रा जानें।",
          kn: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ವರದಿ ಮತ್ತು ರಸಗೊಬ್ಬರದ ಸರಿಯಾದ ಪ್ರಮಾಣ ತಿಳಿಯಿರಿ.",
        },
        icon: Shovel,
        color: "bg-stone-100 text-stone-800 border-stone-200",
      },
      {
        href: "/khet-diary",
        title: {
          en: "Farm Diary (Khet Diary)",
          hi: "खेत डायरी (बहीखाता)",
          kn: "ಕೃಷಿ ದಿನಚರಿ (ಖರ್ಚು-ವೆಚ್ಚ)",
        },
        description: {
          en: "Keep simple records of sowing, irrigation, fertilizer costs, and harvest profits.",
          hi: "बुवाई, सिंचाई, खाद-दवा के खर्चे और फसल बिक्री का आसान हिसाब रखें।",
          kn: "ಬಿತ್ತನೆ, ನೀರಾವರಿ, ಗೊಬ್ಬರದ ವೆಚ್ಚ ಮತ್ತು ಮಾರಾಟದ ಲೆಕ್ಕ ಇರಿಸಿ.",
        },
        icon: BookOpen,
        color: "bg-teal-50 text-teal-800 border-teal-200",
      },
    ],
  },
  madad: {
    kicker: {
      en: "FARM SUPPORT & SERVICES",
      hi: "कृषि सेवाएं व सहायता",
      kn: "ಕೃಷಿ ನೆರವು & ಸೇವೆಗಳು",
    },
    title: {
      en: "Madad (Help & Services)",
      hi: "मदद (मजदूर, मशीनरी व योजनाएं)",
      kn: "ಸಹಾಯ (ಕೆಲಸಗಾರರು, ಯಂತ್ರ & ಯೋಜನೆ)",
    },
    description: {
      en: "Find trusted local farm labour, rent tractors and harvesters, and apply for government schemes.",
      hi: "खेत के काम के लिए मजदूर बुलाएं, ट्रैक्टर-मशीनरी किराए पर लें और सरकारी योजनाओं का लाभ पाएं।",
      kn: "ಕೃಷಿ ಕೂಲಿ ಕಾರ್ಮಿಕರನ್ನು ಸಂಪರ್ಕಿಸಿ, ಟ್ರ್ಯಾಕ್ಟರ್ ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆ ಪಡೆಯಿರಿ.",
    },
    tasks: [
      {
        href: "/worker-connect",
        title: {
          en: "Hire AgriLabour",
          hi: "कृषि मजदूर खोजें",
          kn: "ಕೃಷಿ ಕೂಲಿ ಕಾರ್ಮಿಕರನ್ನು ಹುಡುಕಿ",
        },
        description: {
          en: "Find available AgriLabour for harvesting, sowing, spraying, and weeding with published wages.",
          hi: "कटाई, बुवाई, निराई और कीटनाशक छिड़काव के लिए आस-पास उपलब्ध मजदूर और दरें देखें।",
          kn: "ಕೊಯ್ಲು, ಬಿತ್ತನೆ ಮತ್ತು ಕಳೆ ಕೀಳಲು ಸ್ಥಳೀಯ ಕೂಲಿ ಕಾರ್ಮಿಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        },
        badge: {
          en: "Direct Call",
          hi: "सीधा फोन",
          kn: "ನೇರ ಕರೆ",
        },
        icon: Users,
        color: "bg-sky-50 text-sky-800 border-sky-200",
      },
      {
        href: "/marketplace",
        title: {
          en: "Tractor & Machinery",
          hi: "ट्रैक्टर व कृषि उपकरण",
          kn: "ಟ್ರಾಕ್ಟರ್ & ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ",
        },
        description: {
          en: "Rent or buy tractors, rotavators, seed drills, sprayers, and harvesting machines.",
          hi: "ट्रैक्टर, रोटावेटर, रीपर, कल्टीवेटर और स्प्रेयर किराए पर लें या खरीदें।",
          kn: "ಟ್ರ್ಯಾಕ್ಟರ್, ರೋಟಾವೇಟರ್, ಕಟಾವು ಯಂತ್ರ ಬಾಡಿಗೆಗೆ ಅಥವಾ ಖರೀದಿಗೆ ನೋಡಿ.",
        },
        badge: {
          en: "Machinery",
          hi: "किराया / बिक्री",
          kn: "ಬಾಡಿಗೆ",
        },
        icon: Tractor,
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      },
      {
        href: "/worker-connect",
        title: {
          en: "Agricultural Services",
          hi: "खेत की विशेष सेवाएं",
          kn: "ಕೃಷಿ ಸೇವೆಗಳು",
        },
        description: {
          en: "Tractor driving, borewell work, drone spraying, and custom agricultural operations.",
          hi: "ड्रोन छिड़काव, बोरवेल सर्विस, कस्टम हायरिंग और खेती के बड़े काम।",
          kn: "ಡ್ರೋನ್ ಸಿಂಪಡಣೆ, ಬೋರ್‌ವೆಲ್ ಮತ್ತು ಇತರೆ ಕೃಷಿ ಸೇವೆಗಳು.",
        },
        badge: {
          en: "Custom hiring",
          hi: "विशेष काम",
          kn: "ವಿಶೇಷ ಸೇವೆ",
        },
        icon: Settings2,
        color: "bg-amber-50 text-amber-900 border-amber-200",
      },
      {
        href: "/schemes",
        title: {
          en: "Government Schemes",
          hi: "सरकारी योजनाएं व सब्सिडी",
          kn: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು & ಸಹಾಯಧನ",
        },
        description: {
          en: "Check eligibility for PM-Kisan, PMFBY crop insurance, solar pumps, and KCC loan.",
          hi: "पीएम-किसान, फसल बीमा, सोलर पंप सब्सिडी और किसान क्रेडिट कार्ड (KCC) की जानकारी व लिंक।",
          kn: "ಪಿಎಂ ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ, ಸೋಲಾರ್ ಪಂಪ್ ಸಬ್ಸಿಡಿ ಮತ್ತು ಕೆಸಿಸಿ ಸಾಲದ ಮಾಹಿತಿ.",
        },
        badge: {
          en: "Official links",
          hi: "सरकारी पोर्टल",
          kn: "ಅಧಿಕೃತ ಲಿಂಕ್",
        },
        icon: Landmark,
        color: "bg-purple-50 text-purple-900 border-purple-200",
      },
    ],
  },
};

export function TaskHub({ kind }: { kind: "fasal" | "madad" }) {
  const { lang } = useLanguage();
  const hub = HUBS_DATA[kind];

  const lk = (obj: Record<string, string>) =>
    obj[lang as string] || obj.hi || obj.en;

  return (
    <div className="w-full pb-8 space-y-6">
      {/* Header */}
      <header className="mb-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900/90 p-5 md:p-6 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-wider text-primary dark:text-emerald-400">
          {lk(hub.kicker)}
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          {lk(hub.title)}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
          {lk(hub.description)}
        </p>
      </header>

      {/* Task Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hub.tasks.map(
          ({ href, title, description, badge, icon: Icon, color }) => (
            <Link
              key={`${href}-${lk(title)}`}
              href={href}
              className="group relative flex min-h-[108px] items-start gap-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/95 p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              {/* Icon Container */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${color} shadow-xs transition-transform group-hover:scale-105`}
              >
                <Icon className="h-6 w-6 stroke-[2.2]" aria-hidden="true" />
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="block text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors">
                    {lk(title)}
                  </span>
                  {badge && (
                    <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      {lk(badge)}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-snug">
                  {lk(description)}
                </p>
              </div>

              {/* Arrow */}
              <div className="self-center shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
