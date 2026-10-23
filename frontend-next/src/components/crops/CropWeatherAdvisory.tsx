'use client';

import React, { useState, useEffect } from 'react';
import { 
  CloudSun, CloudRain, Droplets, Wind, AlertTriangle, 
  CheckCircle2, Info, ChevronDown, ChevronUp, Loader2, Sparkles, Thermometer 
} from 'lucide-react';
import { resolveUserLocation, getCurrentByCoords, type UnifiedWeather } from '@/lib/weather-api';

interface CropWeatherAdvisoryProps {
  cropName: string;
  stageName: string;
  irrigationType?: string;
  expectedHarvest?: string;
  lang?: string;
}

export function CropWeatherAdvisory({
  cropName,
  stageName,
  irrigationType = 'Tube well',
  expectedHarvest,
  lang = 'en'
}: CropWeatherAdvisoryProps) {
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    if (weather) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    setError(null);
    setExpanded(true);
    try {
      const loc = await resolveUserLocation(3000);
      const data = await getCurrentByCoords(loc.lat, loc.lon);
      setWeather(data);
    } catch (err) {
      console.warn('Crop weather advisory fallback:', err);
      setError('Weather feed temporarily unavailable for this plot.');
    } finally {
      setLoading(false);
    }
  };

  const getAdvisory = (w: UnifiedWeather) => {
    const cond = (w.current.condition || '').toLowerCase();
    const isRain = cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower') || cond.includes('thunder');
    const isHarvestStage = stageName.toLowerCase().includes('harvest') || (expectedHarvest && new Date(expectedHarvest).getTime() - Date.now() < 7 * 86400000);
    const isSowingStage = stageName.toLowerCase().includes('sow') || stageName.toLowerCase().includes('seed') || stageName.toLowerCase().includes('germination');

    // 1. Irrigation Planning
    let irrigationNotice = {
      title: 'Normal Irrigation Schedule',
      desc: `Atmospheric moisture is balanced. Maintain standard ${irrigationType} schedule for ${cropName}.`,
      safe: true
    };
    if (isRain) {
      irrigationNotice = {
        title: 'Postpone Irrigation (Rain Forecast)',
        desc: `Rain detected (${w.current.condition}). Pause ${irrigationType} irrigation to prevent root rot and save electricity.`,
        safe: true
      };
    } else if (w.current.humidity < 40 && w.current.temp_c > 32) {
      irrigationNotice = {
        title: 'Moisture Stress Alert',
        desc: `High temperature (${Math.round(w.current.temp_c)}°C) and low humidity (${w.current.humidity}%). Prioritize early morning irrigation.`,
        safe: false
      };
    }

    // 2. Sowing & Harvest Planning
    let seasonalNotice: { title: string; desc: string; warning: boolean } | null = null;
    if (isHarvestStage) {
      if (isRain) {
        seasonalNotice = {
          title: 'Harvest Protection Alert',
          desc: 'Rain probability detected. Ensure harvested crops and grains are covered with waterproof tarpaulins.',
          warning: true
        };
      } else {
        seasonalNotice = {
          title: 'Optimal Dry Harvest Window',
          desc: 'Current dry conditions are ideal for cutting, threshing, and field transport.',
          warning: false
        };
      }
    } else if (isSowingStage) {
      seasonalNotice = {
        title: 'Sowing Microclimate',
        desc: `Ambient temperature (${Math.round(w.current.temp_c)}°C) is suitable for seed germination and seedling vigor.`,
        warning: false
      };
    }

    // 3. Spraying & Protection
    let sprayNotice = {
      title: 'Safe Spray Window',
      desc: `Wind is calm at ${w.current.wind_kph} km/h. Optimal conditions for foliar nutrient and pest sprays.`,
      warning: false
    };
    if (w.current.wind_kph > 15) {
      sprayNotice = {
        title: 'High Chemical Drift Risk',
        desc: `Wind at ${w.current.wind_kph} km/h exceeds safe spray limit (15 km/h). Postpone spraying to prevent drift.`,
        warning: true
      };
    } else if (isRain) {
      sprayNotice = {
        title: 'Washout Risk',
        desc: 'Rain will wash off applied pesticides or fungicides. Avoid spraying today.',
        warning: true
      };
    }

    return { irrigationNotice, seasonalNotice, sprayNotice };
  };

  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
      <button
        type="button"
        onClick={loadWeather}
        className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition cursor-pointer"
      >
        <CloudSun className="w-3.5 h-3.5 text-emerald-600" />
        <span>{expanded ? 'Hide Weather Advisory' : 'Show Weather & Irrigation Advisory'}</span>
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin ml-1" />
        ) : expanded ? (
          <ChevronUp className="w-3 h-3 ml-0.5" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 p-3 bg-emerald-50/60 dark:bg-slate-800/80 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 space-y-2.5 animate-in fade-in duration-150">
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Checking microclimate for this plot...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 py-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {weather && !loading && (() => {
            const adv = getAdvisory(weather);
            return (
              <div className="space-y-2">
                {/* Weather Data Strip */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pb-1.5 border-b border-emerald-200/50 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-emerald-600" />
                    {Math.round(weather.current.temp_c)}°C • {weather.current.condition}
                  </span>
                  <span className="flex items-center gap-2 text-slate-500">
                    <span>💨 {weather.current.wind_kph} km/h wind</span>
                    <span>💧 {weather.current.humidity}% humidity</span>
                  </span>
                </div>

                {/* Irrigation Planning (Requirement 2-B) */}
                <div className="flex items-start gap-2 text-[11px]">
                  <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sky-900 dark:text-sky-300">
                      Irrigation Planning: {adv.irrigationNotice.title}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-tight mt-0.5">
                      {adv.irrigationNotice.desc}
                    </p>
                  </div>
                </div>

                {/* Sowing / Harvesting Forecast (Requirement 2-D) */}
                {adv.seasonalNotice && (
                  <div className="flex items-start gap-2 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-bold ${adv.seasonalNotice.warning ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
                        {adv.seasonalNotice.title}
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-tight mt-0.5">
                        {adv.seasonalNotice.desc}
                      </p>
                    </div>
                  </div>
                )}

                {/* Spraying & Crop Protection (Requirement 2-C) */}
                <div className="flex items-start gap-2 text-[11px]">
                  <Wind className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className={`font-bold ${adv.sprayNotice.warning ? 'text-amber-800 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      Spraying & Protection: {adv.sprayNotice.title}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-tight mt-0.5">
                      {adv.sprayNotice.desc}
                    </p>
                  </div>
                </div>

                {/* Non-guarantee Disclaimer */}
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-emerald-200/40 dark:border-slate-700/40">
                  * Hyperlocal weather advisory calibrated from IMD & open feeds. Forecasts are advisory and not guaranteed.
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
