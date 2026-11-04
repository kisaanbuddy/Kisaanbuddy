"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage, type Lang } from "@/lib/language";
import { farmerProfileApi } from "@/lib/farmer-api";
import {
  resolveUserLocation,
  getCurrentByCoords,
  getForecastByCoords,
  type UnifiedWeather,
  type ForecastBundle,
} from "@/lib/weather-api";
import { REDESIGN_I18N, type RedesignCopy } from "@/lib/homepage-redesign-i18n";
import { FarmerVoiceAssistantCard } from "./FarmerVoiceAssistantCard";
import { EssentialServiceCards } from "./EssentialServiceCards";
import { CompactWeatherSection } from "./CompactWeatherSection";
import { MoreFarmingServicesSection } from "./MoreFarmingServicesSection";

export function FarmerHome() {
  const { user, ready } = useAuth();
  const { lang } = useLanguage();

  // Resolved copy according to current language
  const copy: RedesignCopy = REDESIGN_I18N[lang] || REDESIGN_I18N.hi;
  const firstName = user?.name?.trim().split(/\s+/)[0];

  // Saved farm details state
  const [savedVillage, setSavedVillage] = useState<string>("");
  const [savedDistrict, setSavedDistrict] = useState<string>("");
  const [savedCrop, setSavedCrop] = useState<string>("");

  // Weather state
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastBundle | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);

  // 1. Load saved farm profile (backend if logged in, or localStorage for guest)
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const local = localStorage.getItem("kisaanbuddy_farmer_profile");
        if (local) {
          const parsed = JSON.parse(local);
          if (isMounted) {
            if (parsed.village) setSavedVillage(parsed.village);
            if (parsed.district) setSavedDistrict(parsed.district);
            if (parsed.primaryCrop) setSavedCrop(parsed.primaryCrop);
          }
        }
      } catch {
        // ignore storage parse errors
      }

      if (user) {
        try {
          const prof = await farmerProfileApi.get();
          if (prof && isMounted) {
            if (prof.village_name) setSavedVillage(prof.village_name);
            if (prof.district_name) setSavedDistrict(prof.district_name);
            if (prof.primary_crop) setSavedCrop(prof.primary_crop);
          }
        } catch {
          // ignore network failures
        }
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Load hyper-local weather
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      try {
        setWeatherLoading(true);
        const resolved = await resolveUserLocation(3500);
        const [cur, fc] = await Promise.all([
          getCurrentByCoords(resolved.lat, resolved.lon).catch(() => null),
          getForecastByCoords(resolved.lat, resolved.lon, 3).catch(() => null),
        ]);
        if (isMounted) {
          if (cur) setWeather(cur);
          if (fc) setForecast(fc);
        }
      } catch (err) {
        console.warn("Home weather fetch non-critical error:", err);
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    }
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasFarmInfo = Boolean(savedVillage || savedDistrict || savedCrop);

  return (
    <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 md:-mt-8">
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SECTION 2: WELCOME HERO (Rich Agricultural Green Background)            */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <section
        aria-label="Welcome Hero"
        className="w-full bg-gradient-to-b from-[#174F34] via-[#1A5739] to-[#247A45] text-white px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:pb-20 shadow-sm"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-4">
          {/* Greeting Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-100 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {copy.hero.greeting}
              {ready && firstName ? `, ${firstName}` : ""} 👋
            </span>
          </div>

          {/* Hero Subtitle */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
            {copy.hero.subtitle}
          </h1>

          {/* Optional Farm Location Tag */}
          {hasFarmInfo && (
            <div className="pt-1">
              <Link
                href="/farmer-profile"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1 text-xs font-semibold text-emerald-100 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                <span>
                  {[savedVillage, savedDistrict].filter(Boolean).join(", ")}
                  {savedCrop ? ` • 🌾 ${savedCrop}` : ""}
                </span>
                <span className="ml-1 text-[11px] underline text-emerald-200">बदलें</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MAIN HOMEPAGE CONTENT CONTAINER (Centered, Max Width ~1100-1152px)       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 md:space-y-12 -mt-8 sm:-mt-12 pb-16">
        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* SECTION 3: MAIN VOICE ASSISTANT – MOST IMPORTANT ELEMENT             */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <section aria-label="Main Voice Assistant" className="w-full">
          <FarmerVoiceAssistantCard copy={copy.voice} />
        </section>

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* SECTION 4: FOUR ESSENTIAL FARMING SERVICES                           */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <EssentialServiceCards copy={copy.essential} />

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* SECTION 5: WEATHER INFORMATION                                       */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <CompactWeatherSection
          weather={weather}
          forecast={forecast}
          loading={weatherLoading}
          lang={lang}
          copy={copy.weather}
          savedLocationName={savedVillage || savedDistrict}
        />

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* SECTION 6: OTHER FARMING SERVICES (EXPLORE MORE)                    */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <MoreFarmingServicesSection lang={lang} copy={copy.moreServices} />

        {/* ──────────────────────────────────────────────────────────────────── */}
        {/* FOOTNOTE: OFFICIAL DATA TRANSPARENCY                                 */}
        {/* ──────────────────────────────────────────────────────────────────── */}
        <footer className="text-center text-xs text-stone-500 dark:text-stone-400 py-3 border-t border-stone-200/80 dark:border-stone-800">
          <p>{copy.footnote}</p>
        </footer>
      </div>
    </div>
  );
}

export default FarmerHome;
