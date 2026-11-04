"use client";

import React from "react";
import Link from "next/link";
import { CloudSun, Droplets, ShieldCheck, ArrowRight, MapPin, AlertTriangle } from "lucide-react";
import type { UnifiedWeather, ForecastBundle } from "@/lib/weather-api";
import { translateCondition } from "@/lib/weather-translations";
import type { Lang } from "@/lib/language";
import type { RedesignCopy } from "@/lib/homepage-redesign-i18n";

interface CompactWeatherSectionProps {
  weather: UnifiedWeather | null;
  forecast: ForecastBundle | null;
  loading: boolean;
  lang: Lang;
  copy: RedesignCopy["weather"];
  savedLocationName?: string;
}

export function CompactWeatherSection({
  weather,
  forecast,
  loading,
  lang,
  copy,
  savedLocationName,
}: CompactWeatherSectionProps) {
  const rainChance = forecast?.daily?.[0]?.chance_of_rain ?? 0;
  const isRainLikely = rainChance > 40;

  const locationDisplay =
    savedLocationName || weather?.location?.name || "India";

  return (
    <section aria-labelledby="weather-section-heading" className="w-full">
      <div className="rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Weather Icon & Live Info */}
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border ${
                isRainLikely
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  : "bg-emerald-50 text-[#174F34] border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              }`}
            >
              <CloudSun className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="weather-section-heading"
                  className="text-base sm:text-lg font-extrabold text-[#1E293B] dark:text-stone-100"
                >
                  {copy.heading}
                </h3>

                {weather && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    {locationDisplay}: {Math.round(weather.current.temp_c)}°C
                  </span>
                )}

                {weather && (
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    ({translateCondition(weather.current.condition, lang as any)})
                  </span>
                )}

                {isRainLikely ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    <Droplets className="h-3 w-3" />
                    {rainChance}% {copy.rainChance}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-[#174F34] dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    {copy.rainChance}: 0-10%
                  </span>
                )}
              </div>

              {/* Farmer Short Advisory */}
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 leading-snug">
                {isRainLikely ? copy.rainExpected : copy.clearWeather}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Link */}
          <Link
            href="/weather"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-[#174F34] hover:text-white hover:border-[#174F34] px-4 py-2.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 transition-colors shadow-2xs"
          >
            <span>{copy.viewForecast}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
