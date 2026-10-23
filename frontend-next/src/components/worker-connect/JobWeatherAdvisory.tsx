'use client';

import React, { useState } from 'react';
import { 
  CloudSun, CloudRain, Wind, AlertTriangle, CheckCircle2, 
  Info, Loader2, ChevronDown, ChevronUp, Droplets, Thermometer
} from 'lucide-react';
import { getCurrentByCity, type UnifiedWeather } from '@/lib/weather-api';

interface JobWeatherAdvisoryProps {
  district: string;
  state: string;
  workTypeOrCategory: string;
  startDate?: string;
  lang?: string;
}

export function JobWeatherAdvisory({
  district,
  state,
  workTypeOrCategory,
  startDate,
  lang = 'en'
}: JobWeatherAdvisoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (weather) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setError(null);
    setExpanded(true);

    try {
      const locationQuery = district.trim() ? district.trim() : state.trim();
      const data = await getCurrentByCity(locationQuery);
      setWeather(data);
    } catch (err: any) {
      console.warn('Job weather advisory fetch fallback:', err);
      setError('Weather feed unavailable for this location. Proceed with local ground observations.');
    } finally {
      setLoading(false);
    }
  };

  // Determine agriculture operational context based on work type and weather
  const getContextualAdvice = (w: UnifiedWeather) => {
    const wt = workTypeOrCategory.toLowerCase();
    const cond = (w.current.condition || '').toLowerCase();
    const wind = w.current.wind_kph;
    const humidity = w.current.humidity;

    const isRainCondition = cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower') || cond.includes('thunder');

    // Harvesting
    if (wt.includes('harvest') || wt.includes('katai') || wt.includes('thresh')) {
      if (isRainCondition) {
        return {
          status: 'Rain Warning for Harvest',
          level: 'warning',
          tip: 'Rain detected in forecast. Ensure tarpaulin covers and dry storage are ready to prevent grain moisture damage.'
        };
      }
      return {
        status: 'Favorable Harvest Window',
        level: 'safe',
        tip: 'Dry atmospheric conditions favor combine operations, threshing, and crop drying.'
      };
    }

    // Spraying
    if (wt.includes('spray') || wt.includes('chemical') || wt.includes('pesticide')) {
      if (wind > 15) {
        return {
          status: 'High Chemical Drift Risk',
          level: 'warning',
          tip: `Wind at ${wind} km/h exceeds safe spraying limits (15 km/h). Delay spraying to avoid drift to adjacent plots.`
        };
      }
      if (isRainCondition) {
        return {
          status: 'Washout Risk',
          level: 'danger',
          tip: 'Rain in forecast will wash away applied chemicals. Postpone foliar spraying.'
        };
      }
      return {
        status: 'Optimal Spray Window',
        level: 'safe',
        tip: `Calm wind (${wind} km/h) provides a safe window for pesticide or foliar application.`
      };
    }

    // Transplantation / Sowing (Ropai)
    if (wt.includes('transplant') || wt.includes('sow') || wt.includes('ropai') || wt.includes('bijayi')) {
      if (isRainCondition) {
        return {
          status: 'Natural Moisture for Transplantation',
          level: 'safe',
          tip: 'Light rain provides beneficial standing moisture for paddy transplantation (Ropai).'
        };
      }
      if (w.current.temp_c > 38) {
        return {
          status: 'High Temperature Advisory',
          level: 'warning',
          tip: `Heat stress (${Math.round(w.current.temp_c)}°C): Schedule transplantation in early morning or evening hours to avoid seedling wilting.`
        };
      }
      return {
        status: 'Favorable Sowing/Planting Conditions',
        level: 'safe',
        tip: 'Temperature and soil microclimate are suitable for transplanting and seedling establishment.'
      };
    }

    // Irrigation
    if (wt.includes('irrigation') || wt.includes('sinchai') || wt.includes('water')) {
      if (isRainCondition) {
        return {
          status: 'Rain Expected — Pause Irrigation',
          level: 'safe',
          tip: 'Rain is forecast; save electricity and fuel by pausing tube well or canal irrigation.'
        };
      }
      return {
        status: 'Standard Irrigation Window',
        level: 'safe',
        tip: 'Normal soil water application schedule suitable.'
      };
    }

    // General / Weeding / Other Field Labour
    if (isRainCondition) {
      return {
        status: 'Wet Soil Alert',
        level: 'info',
        tip: 'Rain predicted. Sticky field soil may slow weeding or tractor movement.'
      };
    }

    return {
      status: 'Favorable Field Labour Weather',
      level: 'safe',
      tip: `Clear skies (${Math.round(w.current.temp_c)}°C, ${wind} km/h wind). Favorable weather for scheduled agricultural work.`
    };
  };

  return (
    <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-800/60">
      <button
        type="button"
        onClick={fetchWeather}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
      >
        <CloudSun className="w-3.5 h-3.5" />
        <span>
          {expanded ? 'Hide Weather Context' : `Check Weather Context for ${district || state}`}
        </span>
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin ml-1" />
        ) : expanded ? (
          <ChevronUp className="w-3 h-3 ml-0.5" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </button>

      {expanded && (
        <div className="mt-2.5 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-2.5 text-xs animate-in fade-in duration-200">
          {loading && (
            <div className="flex items-center gap-2 text-stone-500 py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Fetching verified meteorological feed for {district || state}...</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 py-1">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {weather && !loading && (() => {
            const advice = getContextualAdvice(weather);
            const badgeColor = 
              advice.level === 'danger'
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                : advice.level === 'warning'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

            return (
              <div className="space-y-2.5">
                {/* Metric Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200/60 dark:border-stone-700/60 text-[11px] text-stone-600 dark:text-stone-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-stone-900 dark:text-white">
                      <Thermometer className="w-3 h-3 text-emerald-600" />
                      {Math.round(weather.current.temp_c)}°C ({weather.current.condition})
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-sky-600" />
                      {weather.current.wind_kph} km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-600" />
                      {weather.current.humidity}% humidity
                    </span>
                  </div>

                  <span className="text-[10px] text-stone-400">
                    Observation: {weather.current.observed_at ? new Date(weather.current.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(weather.fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Contextual Farming Advice */}
                <div className="flex items-start gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 uppercase tracking-wider ${badgeColor}`}>
                    {advice.status}
                  </span>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    {advice.tip}
                  </p>
                </div>

                {/* Reliability & Non-guarantee Disclaimer */}
                <p className="text-[10px] text-stone-400 dark:text-stone-500 italic pt-1 border-t border-stone-200/40 dark:border-stone-700/40">
                  * Weather advisory only. Forecasts are not guarantees and jobs are not automatically cancelled. Confirm final arrangements with the farm owner.
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
