"use client";
import { MobileHomeScreen } from "@/components/mobile/MobileHomeScreen";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bug,
  TrendingUp,
  Sprout,
  Tractor,
  Users,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useLanguage, type Lang } from "@/lib/language";
import { SpeakHeroControlHub } from "@/components/voice/SpeakHeroControlHub";
import { HeroWhatsAppShowcase } from "@/components/home/HeroWhatsAppShowcase";
import { HOME_I18N, HERO_I18N } from "@/lib/homepage-i18n";
import {
  CinematicWordReveal,
  MotionSection,
  StaggerList,
  StaggerItem,
} from "@/components/motion/MotionComponents";
import { fadeUp, fadeIn, pressFeedback } from "@/lib/motion";

interface HomeEquipmentPreview {
  id: number;
  title: string;
  brand: string;
  model_name: string;
  listing_type: "rent" | "sale";
  price: number;
  price_unit: string;
  district: string;
  state: string;
  availability_status: string;
  image_url?: string | null;
}

export function WorldClassHomePage() {
  const { lang } = useLanguage();
  const [equipmentPreview, setEquipmentPreview] = useState<HomeEquipmentPreview[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/marketplace/equipment-listings?limit=4&status=available")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
        setEquipmentPreview(items.slice(0, 4));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Load language dictionary dynamically based on selected language
  const dict = HOME_I18N[lang as Lang] || HOME_I18N.hi;
  const heroDict = HERO_I18N[lang as Lang] || HERO_I18N.hi;

  const cropDoctorDescription =
    lang === "hi"
      ? "फसल की पत्ती की फोटो अपलोड करें और संभावित रोग की जांच करें।"
      : lang === "kn"
        ? "ಬೆಳೆ ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ರೋಗ ಪರಿಶೀಲಿಸಿ."
        : "Upload a leaf photo to check for crop diseases and treatment guidance.";

  const cropPredictorCard =
    lang === "hi"
      ? {
          badge: "फसल सलाह",
          title: "फसल चयन सलाहकार",
          desc: "मिट्टी, क्षेत्र और सीजन के आधार पर उपयुक्त फसल चुनें।",
          cta: "खेत विवरण दर्ज करें →",
        }
      : lang === "kn"
        ? {
            badge: "ಬೆಳೆ ಸಲಹೆ",
            title: "ಬೆಳೆ ಆಯ್ಕೆ ಸಲಹೆಗಾರ",
            desc: "ಮಣ್ಣು, ಪ್ರದೇಶ ಮತ್ತು ಋತುವಿನ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ.",
            cta: "ಜಮೀನಿನ ವಿವರ ನಮೂದಿಸಿ →",
          }
        : {
            badge: "Crop Advisor",
            title: "Crop Recommendation",
            desc: "Enter soil nutrients, season, and location to find suitable crops.",
            cta: "Enter Farm Details →",
          };

  const marketplaceCopy =
    lang === "hi"
      ? {
          heading: "उपलब्ध कृषि उपकरण और किराया",
          subheading: "सत्यापित मालिकों द्वारा सूचीबद्ध वास्तविक उपकरण",
          viewAll: "सभी उपकरण देखें →",
          rentLabel: "किराया",
          saleLabel: "बिक्री",
        }
      : lang === "kn"
        ? {
            heading: "ಲಭ್ಯವಿರುವ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳು",
            subheading: "ನೈಜ ಮಾಲೀಕರಿಂದ ಪಟ್ಟಿ ಮಾಡಲಾದ ಉಪಕರಣಗಳು",
            viewAll: "ಎಲ್ಲಾ ಯಂತ್ರಗಳನ್ನು ನೋಡಿ →",
            rentLabel: "ಬಾಡಿಗೆ",
            saleLabel: "ಮಾರಾಟ",
          }
        : {
            heading: "Equipment Rental & Listings",
            subheading: "Genuine machinery listed by verified owners",
            viewAll: "Explore Marketplace →",
            rentLabel: "Rent",
            saleLabel: "Sale",
          };

  return (
    <>
    <MobileHomeScreen />
    <div className="hidden md:block edge-to-edge w-full bg-[#FBFDF9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen" data-fullwidth="true">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-8 space-y-10 sm:space-y-16">
        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION (EXPANSIVE FULL SCREEN VIEWPORT)
            Left: Typography, Headline, 3 CTA Buttons (Explore, AI Advisor,
                  and Central Speak / बोलें Control Hub with 6 Floating Pills)
            Right: Interactive SaaS Feature Ecosystem Showcase
        ───────────────────────────────────────────────────────────── */}
        <section className="min-h-[calc(100vh-6rem)] flex flex-col justify-between py-2 sm:py-4 gap-6">
          {/* Top Live Badges Row - Spans Full Width */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-600/20 text-emerald-900 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{heroDict.badge}</span>
            </div>
          </div>

          {/* Hero Grid: Typography on Left, Visual Telemetry on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-16 items-center flex-1 my-auto py-4">
            {/* Left Content Column (7 cols) with Cinematic Apple-grade entrance */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="lg:col-span-7 space-y-6 lg:space-y-8 pt-1"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-6xl 2xl:text-[68px] font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.12]">
                <CinematicWordReveal
                  key={`t1-${lang}-${heroDict.title1}`}
                  text={heroDict.title1}
                  className="block"
                />{" "}
                <CinematicWordReveal
                  key={`t2-${lang}-${heroDict.title2}`}
                  text={heroDict.title2}
                  className="block mt-1"
                />
              </h1>

              <motion.p
                variants={fadeUp}
                className="text-base sm:text-lg md:text-xl text-stone-600 dark:text-stone-300 font-normal leading-relaxed max-w-2xl xl:max-w-3xl"
              >
                {heroDict.subtitle}
              </motion.p>

              {/* Call to Actions - Including Central Speak Control Hub Anchor */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-center gap-3.5 pt-1"
              >
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={pressFeedback}
                  href="#capabilities"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all cursor-pointer will-change-transform"
                >
                  <span>{heroDict.ctaExplore}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.a>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={pressFeedback}
                  className="will-change-transform"
                >
                  <Link
                    href="/chatbot"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-emerald-50/60 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-sm sm:text-base shadow-2xs hover:border-emerald-600/40 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{heroDict.ctaAdvisor}</span>
                  </Link>
                </motion.div>

                {/* THE CENTRAL SPEAK / बोलें CONTROL HUB WITH 6 FLOATING SERVICES */}
                <SpeakHeroControlHub />
              </motion.div>

              {/* Trust & Source Assurance Markers */}
              <motion.div
                variants={fadeUp}
                className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{heroDict.trustAgmarknet}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{heroDict.trustImd}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{heroDict.trustIcar}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{heroDict.trustFree}</span>
                </span>
              </motion.div>
            </motion.div>

            {/* Right Visual Showcase: KisaanBuddy on WhatsApp Phone Mockup Showcase (5 cols) */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
                <HeroWhatsAppShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. BIG, SIMPLE PRIMARY TASK CARDS WITH AUTHENTIC THUMBNAILS
        ───────────────────────────────────────────────────────────── */}
        <MotionSection id="capabilities" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
              {dict.cardsHeading}
            </h2>
            <span className="text-xs text-stone-500 font-semibold">
              {dict.cardsSubheading}
            </span>
          </div>

          {/* Core Product Tools Grid */}

          <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Crop Doctor (पत्ती की फोटो खींचें) */}
            <StaggerItem>
            <Link
              href="/disease"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-rose-200 dark:border-rose-950/60 hover:border-rose-500 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden active:scale-[0.99] h-full"
            >
              {/* Authentic Leaf Pathology Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src="/images/crop-doctor/powdery-mildew-leaf.webp"
                  alt="Crop Leaf Disease Detection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  <span>AI Crop Doctor</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.cropDoctor.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {dict.cards.cropDoctor.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {cropDoctorDescription}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                  {dict.cards.cropDoctor.cta}
                </span>
              </div>
            </Link>
            </StaggerItem>

            {/* Card 2: Mandi Rates (आज का मंडी भाव) */}
            <StaggerItem>
            <Link
              href="/mandi"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-amber-200 dark:border-amber-950/60 hover:border-amber-500 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden active:scale-[0.99] h-full"
            >
              {/* Authentic Mandi Grain Market Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src="/images/mandi/grain-market-mandi.webp"
                  alt="APMC Mandi Grain Market"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>AGMARKNET Feeds</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.mandi.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {dict.cards.mandi.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.mandi.desc}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400">
                  {dict.cards.mandi.cta}
                </span>
              </div>
            </Link>
            </StaggerItem>

            {/* Card 3: Crop Recommendation */}
            <StaggerItem>
            <Link
              href="/crop-predictor"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-200 dark:border-emerald-950/60 hover:border-emerald-500 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden active:scale-[0.99] h-full"
            >
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src="/images/crops/punjab-wheat-field.webp"
                  alt="Crop Recommendation Engine"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{cropPredictorCard.badge}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {cropPredictorCard.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {cropPredictorCard.desc}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {cropPredictorCard.cta}
                </span>
              </div>
            </Link>
            </StaggerItem>

            {/* Card 4: Tractor & Machinery (ट्रैक्टर व उपकरण) */}
            <StaggerItem>
            <Link
              href="/marketplace"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-200 dark:border-emerald-950/60 hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden active:scale-[0.99] h-full"
            >
              {/* Authentic Tractor Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center p-2">
                <img
                  src="/images/marketplace/tractors/mahindra-575.webp"
                  alt="Farm Tractor and Machinery Rental"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Tractor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Equipment Rental</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.machinery.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {dict.cards.machinery.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.machinery.desc}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  {dict.cards.machinery.cta}
                </span>
              </div>
            </Link>
            </StaggerItem>

            {/* Card 5: AgriLabour (खेत मजदूर) */}
            <StaggerItem>
            <Link
              href="/worker-connect"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-indigo-200 dark:border-indigo-950/60 hover:border-indigo-500 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden active:scale-[0.99] h-full"
            >
              {/* Authentic Farm Workers Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center p-2">
                <img
                  src="/images/agrilabour-hero-farmers.png"
                  alt="AgriLabour Farm Workers"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AgriLabour</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.agrilabour.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                    {dict.cards.agrilabour.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.agrilabour.desc}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-800 dark:text-indigo-400">
                  {dict.cards.agrilabour.cta}
                </span>
              </div>
            </Link>
            </StaggerItem>

            {/* Card 6: AI Chatbot (24x7 सलाह) */}
            <StaggerItem>
            <Link
              href="/chatbot"
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900 border-2 border-teal-200 dark:border-teal-950/60 hover:border-teal-500 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden active:scale-[0.99] h-full"
            >
              {/* Authentic Lush Green Crop Field Thumbnail */}
              <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src="/images/crops/punjab-wheat-field.webp"
                  alt="Agricultural Field Advisory"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>24x7 AI Advisor</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold shadow-md">
                  {dict.cards.aiAdvisor.badge}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {dict.cards.aiAdvisor.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-snug">
                    {dict.cards.aiAdvisor.desc}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-800 dark:text-teal-400">
                  {dict.cards.aiAdvisor.cta}
                </span>
              </div>
            </Link>
            </StaggerItem>
          </StaggerList>
        </MotionSection>

        {/* ─────────────────────────────────────────────────────────────
            4. GENUINE EQUIPMENT RENTAL & MARKETPLACE PREVIEW
        ───────────────────────────────────────────────────────────── */}
        {equipmentPreview.length > 0 && (
          <MotionSection className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
                  {marketplaceCopy.heading}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  {marketplaceCopy.subheading}
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {marketplaceCopy.viewAll}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {equipmentPreview.map((item) => (
                <Link
                  key={item.id}
                  href={`/marketplace?listing=${item.id}`}
                  className="group rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/60 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-36 bg-stone-100 dark:bg-stone-800 flex items-center justify-center p-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Tractor className="w-10 h-10 text-stone-400" />
                    )}
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white uppercase">
                      {item.listing_type === "rent" ? marketplaceCopy.rentLabel : marketplaceCopy.saleLabel}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                      {item.title || `${item.brand} ${item.model_name}`}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{[item.district, item.state].filter(Boolean).join(", ")}</span>
                    </p>
                    <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                      ₹{Number(item.price).toLocaleString("en-IN")}{" "}
                      <span className="text-[11px] font-medium text-stone-500">{item.price_unit}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </MotionSection>
        )}
      </div>
    </div>
    </>
  );
}
