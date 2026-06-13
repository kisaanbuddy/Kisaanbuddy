"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CloudSun, Info, MapPin, Volume2, VolumeX, Share2 } from "lucide-react"
import { useLanguage } from '@/lib/language'

import {
  getCurrentByCoords,
  getForecastByCoords,
  resolveUserLocation,
  WeatherAPIError,
  type ForecastBundle,
  type LocationHit,
  type ResolvedLocation,
  type UnifiedWeather,
} from "@/lib/weather-api"

import { UnitProvider, useUnit, pickTemp } from "@/components/weather/unit-context"
import { WeatherCard } from "@/components/weather/WeatherCard"
import { LocationSearch } from "@/components/weather/LocationSearch"
import { HourlyForecast } from "@/components/weather/HourlyForecast"
import { DailyForecast } from "@/components/weather/DailyForecast"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { WEATHER_T, type Lang, translateCondition, generateFarmingAdvice } from "@/lib/weather-translations"

interface ActiveLocation {
  lat: number
  lon: number
  label?: string
  source: ResolvedLocation["source"] | "manual"
}

export default function WeatherPage() {
  return (
    <UnitProvider>
      <WeatherPageInner />
    </UnitProvider>
  )
}

function WeatherPageInner() {
  const { lang } = useLanguage()
  const activeLang = (lang as Lang) in WEATHER_T ? (lang as Lang) : "hi"
  const t = WEATHER_T[activeLang]

  const { unit } = useUnit()

  const [loc, setLoc] = useState<ActiveLocation | null>(null)
  const [resolving, setResolving] = useState(true)

  const [current, setCurrent] = useState<UnifiedWeather | null>(null)
  const [forecast, setForecast] = useState<ForecastBundle | null>(null)

  const [loadingCurrent, setLoadingCurrent] = useState(false)
  const [loadingForecast, setLoadingForecast] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [speaking, setSpeaking] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  // Request precise GPS permission explicitly
  const requestPreciseLocation = () => {
    setResolving(true)
    setError(null)
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoc({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            source: "browser",
            label: activeLang === "hi" ? "सटीक जीपीएस स्थान" : "Precise GPS Location"
          })
          setResolving(false)
        },
        (err) => {
          console.error("GPS error:", err)
          setResolving(false)
          // Don't show hard block, just notify user
          setError(activeLang === "hi" 
            ? "लोकेशन की अनुमति नहीं मिली। कृपया जीपीएस ऑन करें या शहर चुनें।" 
            : "Location permission denied. Please enable GPS or select a city.")
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    } else {
      setResolving(false)
      setError(activeLang === "hi" ? "आपके डिवाइस में जीपीएस उपलब्ध नहीं है।" : "GPS is not supported on this device.")
    }
  }

  // Initial resolve on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const r = await resolveUserLocation()
      if (!mounted) return
      setLoc({
        lat: r.lat,
        lon: r.lon,
        label: r.city,
        source: r.source,
      })
      setResolving(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch weather data whenever location changes
  const fetchAll = useCallback(async (target: ActiveLocation) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setError(null)
    setLoadingCurrent(true)
    setLoadingForecast(true)

    try {
      const [cur, fc] = await Promise.all([
        getCurrentByCoords(target.lat, target.lon, ctrl.signal),
        getForecastByCoords(target.lat, target.lon, 7, ctrl.signal),
      ])
      setCurrent(cur)
      setForecast(fc)
    } catch (err: any) {
      if (err?.name === "AbortError") return
      const msg =
        err instanceof WeatherAPIError
          ? err.message
          : err?.message || t.load_fail
      setError(msg)
    } finally {
      setLoadingCurrent(false)
      setLoadingForecast(false)
    }
  }, [t.load_fail])

  useEffect(() => {
    if (loc) fetchAll(loc)
  }, [loc, fetchAll])

  // Cleanup speech synthesis on language changes or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [activeLang])

  const onSelectLocation = (hit: LocationHit) => {
    setLoc({
      lat: hit.lat,
      lon: hit.lon,
      label: hit.display_name,
      source: "manual",
    })
  }

  const onUseCurrentLocation = async () => {
    setResolving(true)
    const r = await resolveUserLocation()
    setLoc({ lat: r.lat, lon: r.lon, label: r.city, source: r.source })
    setResolving(false)
  }

  const sourceNote = (() => {
    if (resolving) return t.detecting_loc
    if (!loc) return null
    switch (loc.source) {
      case "browser":
        return t.gps_loc
      case "ip":
        return t.ip_loc + (loc.label ? ` (${loc.label})` : "")
      case "manual":
        return t.manual_loc.replace("{city}", loc.label ?? "चुना गया स्थान")
      case "default":
        return t.blocked_loc
      default:
        return null
    }
  })()

  // Dynamic Agricultural Advice calculation
  const adviceList = (() => {
    if (!current) return []
    const tempC = current.current.temp_c
    const humidity = current.current.humidity
    const windKph = current.current.wind_kph
    const chanceOfRain = forecast?.daily[0]?.chance_of_rain ?? 0
    return generateFarmingAdvice(tempC, humidity, windKph, chanceOfRain, activeLang)
  })()

  // Speech helper
  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    let speechText = ""
    if (current) {
      const temp = Math.round(pickTemp(current.current.temp_c, current.current.temp_f, unit))
      const cond = translateCondition(current.current.condition, activeLang)
      speechText += `${current.location.name} में तापमान ${temp} डिग्री है और आसमान में ${cond} है। `
    }

    if (adviceList.length > 0) {
      speechText += `${t.farmer_advice_title}: `
      adviceList.forEach((adv) => {
        // Strip out warning emojis from reading aloud
        const cleanMsg = adv.message.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        speechText += `${cleanMsg}. `
      })
    }

    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.lang = activeLang === "en" ? "en-IN" : `${activeLang}-IN`
    
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.cancel()
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Share on WhatsApp
  const handleWhatsAppShare = () => {
    if (!current) return
    const temp = Math.round(pickTemp(current.current.temp_c, current.current.temp_f, unit))
    const cond = translateCondition(current.current.condition, activeLang)

    let shareText = `*🌾 KrishiAI ${t.weather_title} 🌾*\n\n`
    shareText += `📍 *${current.location.name}*\n`
    shareText += `🌡️ *${t.feels_like}:* ${temp}°${unit}\n`
    shareText += `☁️ *${t.current_weather}:* ${cond}\n`
    shareText += `💧 *${t.humidity}:* ${current.current.humidity}%\n`
    shareText += `💨 *${t.wind_speed}:* ${current.current.wind_kph} km/h\n\n`

    if (adviceList.length > 0) {
      shareText += `*📢 ${t.farmer_advice_title}:*\n`
      adviceList.forEach((adv) => {
        shareText += `${adv.message}\n`
      })
    }
    
    shareText += `\n📲 _Shared from KrishiAI Farmers Portal_`
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(url, "_blank")
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-display font-bold tracking-tight text-foreground md:text-4xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 shadow-sm animate-float">
                <CloudSun className="h-6 w-6" />
              </div>
              {t.weather_title}
            </h1>
            <p className="mt-2 text-muted-foreground text-xs md:text-sm max-w-xl leading-relaxed">
              {t.weather_subtitle}
            </p>
          </div>
          <div className="w-full md:w-96">
            <LocationSearch
              onSelect={onSelectLocation}
              onUseCurrentLocation={onUseCurrentLocation}
              placeholder={activeLang === "hi" ? "शहर खोजें..." : "Search city..."}
            />
          </div>
        </div>

        {sourceNote && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-accent/15 border border-primary/5 rounded-2xl px-4 py-3 w-full backdrop-blur-sm shadow-sm select-none animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Info className="h-4 w-4 text-emerald-500 shrink-0 animate-pulse" />
              <span>{sourceNote}</span>
            </div>
            
            {(loc?.source === "default" || loc?.source === "ip") && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestPreciseLocation}
                className="text-xs h-8 px-4 rounded-full border-sky-500/30 hover:bg-sky-500/10 text-sky-500 font-bold flex items-center gap-1.5"
              >
                <MapPin className="h-3.5 w-3.5" />
                {t.gps_retry_btn}
              </Button>
            )}
          </div>
        )}
      </motion.header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <WeatherCard
            data={current}
            loading={loadingCurrent}
            error={error}
            onRetry={() => loc && fetchAll(loc)}
          />

          {/* Farmer Advisory Engine Card */}
          {current && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/2 to-transparent overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-base md:text-lg font-display text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-2">
                        🌾 {t.farmer_advice_title}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                        {activeLang === "hi" ? "सटीक मौसम के आधार पर दैनिक कृषि सुझाव" : "Daily farming actions matched to current forecast"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleSpeak}
                        className={`text-xs font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all duration-300 ${
                          speaking
                            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white"
                        }`}
                      >
                        {speaking ? (
                          <>
                            <VolumeX className="h-4 w-4" />
                            {t.stop_btn}
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4" />
                            {t.listen_btn}
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleWhatsAppShare}
                        className="text-xs font-bold border-green-500/30 text-green-600 hover:bg-green-500/10 rounded-full flex items-center gap-1.5"
                      >
                        <Share2 className="h-4 w-4" />
                        {t.whatsapp_btn}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {adviceList.map((adv, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 shadow-sm select-none ${
                          adv.type === "warning"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                        }`}
                      >
                        <div className="text-sm leading-relaxed font-bold">
                          {adv.message}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </GlassCard>
            </motion.div>
          )}
        </div>
        <div className="lg:col-span-1">
          <HourlyForecast
            hours={forecast?.hourly ?? []}
            loading={loadingForecast}
            maxHours={12}
          />
        </div>
      </div>

      <DailyForecast days={forecast?.daily ?? []} loading={loadingForecast} />
    </div>
  )
}
