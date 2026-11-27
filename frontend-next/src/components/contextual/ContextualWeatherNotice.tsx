"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Info,
  MapPin,
  Search,
  Wind,
  X,
} from "lucide-react";
import {
  getContextualWeather,
  resolveUserLocation,
  searchLocations,
  setManualWeatherLocation,
  type ContextualWeatherResponse,
  type LocationHit,
} from "@/lib/weather-api";

export type WeatherDomain =
  | "irrigation"
  | "fertilizer"
  | "spraying"
  | "disease"
  | "harvesting"
  | "equipment_booking";

interface ContextualWeatherNoticeProps {
  domain: WeatherDomain;
  crop?: string;
  activity?: string;
  cityQuery?: string;
  compact?: boolean;
  onlyWhenActionable?: boolean;
  className?: string;
}

export function ContextualWeatherNotice({
  domain,
  crop,
  activity,
  cityQuery,
  compact = false,
  onlyWhenActionable = false,
  className = "",
}: ContextualWeatherNoticeProps) {
  const [data, setData] = useState<ContextualWeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [hits, setHits] = useState<LocationHit[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (cityQuery && cityQuery.trim().length >= 2) {
        const res = await getContextualWeather({ q: cityQuery.trim(), crop, activity });
        setData(res);
      } else {
        const loc = await resolveUserLocation(3000);
        const res = await getContextualWeather({ lat: loc.lat, lon: loc.lon, crop, activity });
        setData(res);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [cityQuery, crop, activity]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = async (val: string) => {
    setSearchText(val);
    if (val.trim().length < 2) {
      setHits([]);
      return;
    }
    try {
      const res = await searchLocations(val.trim(), 4);
      setHits(res.results || []);
    } catch {
      setHits([]);
    }
  };

  const selectLocation = (hit: LocationHit) => {
    setManualWeatherLocation({
      lat: hit.lat,
      lon: hit.lon,
      city: hit.name,
      country: hit.country || undefined,
    });
    setEditingLocation(false);
    setSearchText("");
    setHits([]);
    void load();
  };

  if (loading) return null;
  if (!data || !data.available) return null;

  const advisory = data.advisories?.[domain];
  if (!advisory) return null;

  const isWarning =
    advisory.status === "warning" ||
    advisory.status === "unsafe" ||
    advisory.status === "postpone" ||
    advisory.status === "increase" ||
    advisory.status === "elevated";

  if (onlyWhenActionable && !isWarning && (!data.alerts || data.alerts.length === 0)) {
    return null;
  }

  const toneClasses = isWarning
    ? "border-amber-300/80 bg-amber-50/80 text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/35 dark:text-amber-100"
    : "border-emerald-200/80 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-100";

  const Icon =
    advisory.status === "unsafe" || advisory.status === "warning" || advisory.status === "elevated"
      ? AlertTriangle
      : advisory.status === "postpone"
      ? CloudRain
      : CheckCircle2;

  const timestampStr = data.observed_at || data.fetched_at;
  const formattedTime = timestampStr
    ? new Date(timestampStr).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={`rounded-xl border p-3 text-xs transition-all ${toneClasses} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <Icon
            className={`h-4 w-4 shrink-0 mt-0.5 ${
              isWarning ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 font-semibold">
              <span>{advisory.title}</span>
              {data.location?.name && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium">
                  <MapPin className="h-2.5 w-2.5" />
                  {data.location.name}
                </span>
              )}
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">{advisory.message}</p>

            {!compact && data.snapshot && (
              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[10px] opacity-80">
                {data.snapshot.temp_c != null && <span>Temp: {Math.round(data.snapshot.temp_c)}°C</span>}
                {data.snapshot.humidity != null && <span>Humidity: {data.snapshot.humidity}%</span>}
                {data.snapshot.wind_kph != null && (
                  <span className="inline-flex items-center gap-0.5">
                    <Wind className="h-2.5 w-2.5" /> {Math.round(data.snapshot.wind_kph)} km/h
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5 text-[10px] opacity-70">
              <span>Source: {data.provider || "Meteorological Feed"}</span>
              {formattedTime && <span>• Updated {formattedTime}</span>}
              {!compact && data.uncertainty_note && (
                <span className="inline-flex items-center gap-0.5">
                  • <Info className="h-2.5 w-2.5" /> Forecast uncertainty applies beyond 24h
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditingLocation((v) => !v)}
          className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium underline opacity-75 hover:opacity-100"
          title="Select manual location"
        >
          {editingLocation ? <X className="h-3.5 w-3.5" /> : "Change"}
        </button>
      </div>

      {editingLocation && (
        <div className="mt-2.5 border-t border-black/10 dark:border-white/10 pt-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 opacity-60" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => void handleSearch(e.target.value)}
              placeholder="Search village, district or city..."
              className="w-full rounded-lg border border-black/15 dark:border-white/15 bg-white/90 dark:bg-stone-900/90 pl-8 pr-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>
          {hits.length > 0 && (
            <div className="mt-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-stone-900 divide-y divide-black/5 dark:divide-white/5">
              {hits.map((h) => (
                <button
                  key={`${h.lat}-${h.lon}`}
                  type="button"
                  onClick={() => selectLocation(h)}
                  className="w-full px-2.5 py-1.5 text-left text-[11px] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-800 dark:text-stone-200"
                >
                  {h.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
