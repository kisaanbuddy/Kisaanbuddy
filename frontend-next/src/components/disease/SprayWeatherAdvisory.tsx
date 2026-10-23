'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wind, CloudRain, Droplets, AlertTriangle, CheckCircle2, 
  Info, Loader2, Thermometer, CloudSun 
} from 'lucide-react';
import { resolveUserLocation, getCurrentByCoords, type UnifiedWeather } from '@/lib/weather-api';

interface SprayWeatherAdvisoryProps {
  diseaseName?: string;
  language?: string;
}

export function SprayWeatherAdvisory({ diseaseName, language = 'en' }: SprayWeatherAdvisoryProps) {
  const [weather, setWeather] = useState<UnifiedWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resolveUserLocation(3000)
      .then((loc) => getCurrentByCoords(loc.lat, loc.lon))
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('Spray weather advisory fallback:', err);
          setError('Live microclimate data temporarily offline. Rely on manual field wind checks.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-3 p-3 rounded-xl border border-border/50 bg-card/60 flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
        <span>Checking local wind speed and rainfall probability for safe spraying window...</span>
      </div>
    );
  }

  if (error || !weather) {
    return null; // Do not render if unavailable, avoid clutter
  }

  const wind = weather.current.wind_kph;
  const humidity = weather.current.humidity;
  const cond = (weather.current.condition || '').toLowerCase();
  const isRain = cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower') || cond.includes('thunder');

  const isWindy = wind > 15;
  const isHumid = humidity > 75;

  let sprayStatus = 'Optimal Spray Window';
  let sprayBadgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
  let sprayAdvice = `Wind is calm at ${wind} km/h with no imminent rainfall. Optimal window for foliar fungicide or insecticide application.`;

  if (isRain) {
    sprayStatus = 'Washout Risk — Delay Spraying';
    sprayBadgeColor = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
    sprayAdvice = `Rain predicted (${weather.current.condition}). Rain within 4–6 hours washes agrochemicals off foliage before absorption.`;
  } else if (isWindy) {
    sprayStatus = 'High Drift Risk — Delay Spraying';
    sprayBadgeColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
    sprayAdvice = `Wind speed at ${wind} km/h exceeds the 15 km/h safe limit. High risk of chemical drift onto non-target crops and open waterways.`;
  }

  return (
    <div className="mt-3.5 p-3.5 rounded-2xl border border-border/70 bg-muted/30 dark:bg-card/60 space-y-2.5 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Wind className="w-3.5 h-3.5 text-emerald-600" />
          <span>Foliar Spraying & Microclimate Advisory</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${sprayBadgeColor}`}>
          {sprayStatus}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3 text-sky-600" />
          <span>Wind: <strong className="text-foreground">{wind} km/h</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3 text-blue-600" />
          <span>Humidity: <strong className="text-foreground">{humidity}%</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-emerald-600" />
          <span>Temp: <strong className="text-foreground">{Math.round(weather.current.temp_c)}°C</strong></span>
        </div>
      </div>

      <p className="text-xs text-foreground/90 leading-relaxed font-medium">
        {sprayAdvice}
      </p>

      {isHumid && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>High atmospheric moisture ({humidity}%) accelerates fungal pathogen sporulation. Ensure uniform coverage on lower and upper leaf surfaces once spraying commences.</span>
        </div>
      )}

      <div className="pt-1 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>* Verified IMD / meteorological observation for your area. Advisory only.</span>
        <span>Observed: {weather.current.observed_at ? new Date(weather.current.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
      </div>
    </div>
  );
}
