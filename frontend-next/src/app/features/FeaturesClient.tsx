"use client";

import Link from "next/link";
import {
  Sparkles,
  Layers,
  Bug,
  CloudSun,
  FlaskConical,
  TrendingUp,
  Store,
  Landmark,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Languages,
  Cpu,
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { FEATURES_PAGE_I18N } from "@/lib/features-i18n";

export function FeaturesClient() {
  const { lang } = useLanguage();
  const curI18n = FEATURES_PAGE_I18N[lang] || FEATURES_PAGE_I18N.en;

  const features = [
    {
      icon: Sparkles,
      title: curI18n.feature1Title,
      category: curI18n.feature1Cat,
      image: "/images/farmers/farmer-field-tending.jpg",
      imageAlt: "Indian farmer working in field managing nutrient application",
      description: curI18n.feature1Desc,
      href: "/chatbot",
      cta: curI18n.feature1Cta,
      accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      icon: Layers,
      title: curI18n.feature2Title,
      category: curI18n.feature2Cat,
      image: "/images/crops/indian-paddy-field.jpg",
      imageAlt: "Lush green agricultural crop field in rural India",
      description: curI18n.feature2Desc,
      href: "/profile",
      cta: curI18n.feature2Cta,
      accent: "text-teal-700 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300",
    },
    {
      icon: Bug,
      title: curI18n.feature3Title,
      category: curI18n.feature3Cat,
      image: "/images/crop-doctor/powdery-mildew-leaf.jpg",
      imageAlt: "Close-up of crop leaf diagnosed with fungal mildew",
      description: curI18n.feature3Desc,
      href: "/disease",
      cta: curI18n.feature3Cta,
      accent: "text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300",
    },
    {
      icon: CloudSun,
      title: curI18n.feature4Title,
      category: curI18n.feature4Cat,
      image: "/images/weather/monsoon-farmland.jpg",
      imageAlt: "Indian agricultural landscape under monsoon clouds",
      description: curI18n.feature4Desc,
      href: "/weather",
      cta: curI18n.feature4Cta,
      accent: "text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300",
    },
    {
      icon: FlaskConical,
      title: curI18n.feature5Title,
      category: curI18n.feature5Cat,
      image: "/images/soil/soil-ph-testing.jpg",
      imageAlt: "Scientific field soil pH and nutrient test with color chart",
      description: curI18n.feature5Desc,
      href: "/soil-health",
      cta: curI18n.feature5Cta,
      accent: "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300",
    },
    {
      icon: TrendingUp,
      title: curI18n.feature6Title,
      category: curI18n.feature6Cat,
      image: "/images/mandi/grain-market-mandi.jpg",
      imageAlt: "Wholesale grain market with bags of harvested crops",
      description: curI18n.feature6Desc,
      href: "/mandi",
      cta: curI18n.feature6Cta,
      accent: "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      icon: Store,
      title: curI18n.feature7Title,
      category: curI18n.feature7Cat,
      image: "/images/marketplace/vegetable-mandi.jpg",
      imageAlt: "Vegetable mandi vendor with fresh crates of farm produce",
      description: curI18n.feature7Desc,
      href: "/marketplace",
      cta: curI18n.feature7Cta,
      accent: "text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300",
    },
    {
      icon: Landmark,
      title: curI18n.feature8Title,
      category: curI18n.feature8Cat,
      image: "/images/hero/hero-indian-farmer.jpg",
      imageAlt: "Indian farmer in field accessing agricultural subsidies",
      description: curI18n.feature8Desc,
      href: "/schemes",
      cta: curI18n.feature8Cta,
      accent: "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      icon: BookOpen,
      title: curI18n.feature9Title,
      category: curI18n.feature9Cat,
      image: "/images/crops/punjab-wheat-field.jpg",
      imageAlt: "Healthy wheat crop field in Phagwara Punjab",
      description: curI18n.feature9Desc,
      href: "/khet-diary",
      cta: curI18n.feature9Cta,
      accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: curI18n.step1Title,
      description: curI18n.step1Desc,
    },
    {
      step: "02",
      title: curI18n.step2Title,
      description: curI18n.step2Desc,
    },
    {
      step: "03",
      title: curI18n.step3Title,
      description: curI18n.step3Desc,
    },
    {
      step: "04",
      title: curI18n.step4Title,
      description: curI18n.step4Desc,
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto pt-4 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {curI18n.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {curI18n.heroTitle}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          {curI18n.heroDesc}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-500/50 transition duration-200"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur shadow-xs border border-white/20">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${item.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-800/40 relative overflow-hidden">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            {curI18n.stepBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">
            {curI18n.stepTitle}
          </h2>
          <p className="text-sm text-emerald-100/80 mt-2">
            {curI18n.stepDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((w) => (
            <div
              key={w.step}
              className="bg-emerald-900/50 backdrop-blur-sm border border-emerald-700/40 rounded-2xl p-5 space-y-2"
            >
              <div className="text-2xl font-black text-emerald-400">{w.step}</div>
              <h3 className="text-sm font-bold text-white">{w.title}</h3>
              <p className="text-xs text-emerald-100/70 leading-relaxed">{w.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Capabilities & Technology Integrity */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {curI18n.trustBadge}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {curI18n.trustTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                {curI18n.trustPillar1Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {curI18n.trustPillar1Desc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                {curI18n.trustPillar2Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {curI18n.trustPillar2Desc}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                {curI18n.trustPillar3Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {curI18n.trustPillar3Desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="text-center py-6">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-95"
        >
          <span>{curI18n.startCta}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
