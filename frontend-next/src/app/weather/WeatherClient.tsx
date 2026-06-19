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

    let shareText = `*🌾 KisaanBuddy ${t.weather_title} 🌾*\n\n`
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
    
    shareText += `\n📲 _Shared from KisaanBuddy Farmers Portal_`
    
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

      {/* ── Educational Guide Section ── */}
      <section className="mt-12 border-t border-white/[0.08] pt-10 select-none">
        {activeLang === "hi" ? (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 मौसम पूर्वानुमान क्या है और यह खेती के लिए क्यों आवश्यक है?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                मौसम पूर्वानुमान (Weather Forecasting) विज्ञान की वह शाखा है जो वायुमंडल की भौतिकीय स्थितियों (जैसे तापमान, आर्द्रता, वायुदाब और पवन की गति) का अध्ययन कर आने वाले समय के मौसम का अनुमान लगाती है। भारतीय उपमहाद्वीप में, जहां अधिकांश किसान मानसून पर निर्भर रहते हैं, मौसम की सटीक जानकारी कृषि उत्पादन की सफलता और असफलता के बीच का मुख्य अंतर होती है।
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">🌧️ वर्षा और फसलों का संबंध: पानी का सही संतुलन</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  पानी फसलों का जीवन है, लेकिन इसकी अधिकता या कमी दोनों ही नुकसानदेह हैं। उदाहरण के लिए, धान (धान की खेती) को विकास के शुरुआती चरणों में अत्यधिक पानी की आवश्यकता होती है, लेकिन कटाई के समय सूखा मौसम आवश्यक होता है। यदि किसान को पहले से पता हो कि भारी वर्षा होने वाली है, तो वे सिंचाई को रोक सकते हैं, जिससे पानी और बिजली की बचत होती है और फसलें सड़ने से बचती हैं।
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">📅 मौसमी नियोजन मार्गदर्शिका: खरीफ बनाम रबी मौसम</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  भारत में दो मुख्य फसल चक्र होते हैं: <strong>खरीफ (Monsoon crops)</strong> और <strong>रबी (Winter crops)</strong>। खरीफ फसलों (जैसे कपास, मक्का) की बुवाई के लिए पहली मानसून बारिश का सटीक समय जानना जरूरी है। इसके विपरीत, रबी फसलों (जैसे गेहूं, सरसों) की बुवाई के लिए तापमान में हल्की गिरावट और कम आर्द्रता की आवश्यकता होती है। मौसम पूर्वानुमान इन दोनों चक्रों के बीच सुचारू संक्रमण सुनिश्चित करता है।
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-amber-500/10 bg-amber-500/[0.02] space-y-4">
              <h3 className="text-lg font-bold text-amber-400 font-display">⚠️ विपरीत मौसम परिस्थितियों में कृषि निर्णय</h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
                <div className="space-y-2 border-r border-white/[0.06] pr-4">
                  <h4 className="font-extrabold text-white">1. लू (Heatwaves)</h4>
                  <p>तापमान 40 डिग्री सेल्सियस से ऊपर जाने पर हल्की और बार-बार सिंचाई करें। दोपहर के समय छिड़काव सिंचाई (Sprinkler irrigation) से बचें। मल्चिंग का उपयोग कर मिट्टी की नमी को उड़ने से रोकें।</p>
                </div>
                <div className="space-y-2 border-r border-white/[0.06] px-4">
                  <h4 className="font-extrabold text-white">2. सूखा (Drought)</h4>
                  <p>सूखे की स्थिति में केवल जीवन रक्षक सिंचाई (Life-saving irrigation) का उपयोग करें। कम पानी चाहने वाली फसलों (जैसे बाजरा, ग्वार) को प्राथमिकता दें और खरपतवार नियंत्रण पर विशेष ध्यान दें ताकि पानी केवल फसल को मिले।</p>
                </div>
                <div className="space-y-2 pl-4">
                  <h4 className="font-extrabold text-white">3. अत्यधिक वर्षा (Heavy Rain)</h4>
                  <p>खेतों में जलभराव न होने दें। जल निकासी (Drainage channels) को तुरंत साफ करें। भारी बारिश के बाद नाइट्रोजन उर्वरकों (जैसे यूरिया) का छिड़काव न करें, क्योंकि वे पानी के साथ बह जाते हैं।</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ अक्सर पूछे जाने वाले प्रश्न (FAQs)</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. मौसम पूर्वानुमान खेती में कैसे मदद करता है?</h4>
                  <p>यह किसानों को बुवाई, सिंचाई, कीटनाशकों के छिड़काव और फसल की कटाई के समय का सही निर्णय लेने में मदद करता है ताकि नुकसान कम से कम हो।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. क्या बारिश के तुरंत बाद यूरिया डालना सही है?</h4>
                  <p>नहीं, भारी बारिश के दौरान या तुरंत बाद यूरिया डालने से वह पानी में बह जाता है या रिसकर जमीन के नीचे चला जाता है, जिससे फसल को पोषक तत्व नहीं मिल पाते।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. छिड़काव सिंचाई (Sprinkler) का सही समय क्या है?</h4>
                  <p>हवा की गति कम होने पर सुबह या शाम के समय छिड़काव सिंचाई सर्वोत्तम है। तेज धूप में पानी का वाष्पीकरण हो जाता है।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. ओलावृष्टि (Hailstorm) की चेतावनी मिलने पर क्या करें?</h4>
                  <p>यदि फसल पक चुकी है तो तुरंत कटाई कर लें और सुरक्षित स्थान पर रखें। यदि फसल खड़ी है तो यदि संभव हो तो एंटी-हेल नेट का उपयोग करें।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. हवा की गति और दिशा जानना क्यों जरूरी है?</h4>
                  <p>तेज हवाओं में कीटनाशक का छिड़काव नहीं करना चाहिए क्योंकि दवा उड़कर दूसरी जगह चली जाती है। छिड़काव हमेशा हवा की दिशा के अनुकूल करना चाहिए।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. पाला (Frost) पड़ने की संभावना होने पर फसलों को कैसे बचाएं?</h4>
                  <p>पाले की संभावना होने पर खेत के चारों ओर धुआं करें या हल्की सिंचाई करें। इससे खेत का तापमान सामान्य रहता है और फसलें ठिठुरती नहीं हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. सापेक्षिक आर्द्रता (Relative Humidity) का फसलों पर क्या प्रभाव पड़ता है?</h4>
                  <p>अधिक आर्द्रता के साथ गर्म मौसम कवक जनित बीमारियों (Fungal diseases) के फैलने के लिए अनुकूल होता है। ऐसे समय में रोग नियंत्रण के उपाय जरूरी हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. खरीफ सीजन की मुख्य फसलें कौन सी हैं?</h4>
                  <p>धान (चावल), मक्का, बाजरा, कपास, सोयाबीन, मूंगफली और दालें खरीफ सीजन की मुख्य फसलें हैं जो बरसात के मौसम में उगाई जाती हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. रबी सीजन की मुख्य फसलें कौन सी हैं?</h4>
                  <p>गेहूं, जौ, चना, मटर, सरसों, अलसी और आलू रबी सीजन की मुख्य फसलें हैं जो सर्दियों के मौसम में उगाई जाती हैं।</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. क्या KisaanBuddy का मौसम डेटा लाइव है?</h4>
                  <p>हाँ, KisaanBuddy लाइव मौसम डेटा उपग्रह इमेजरी और राष्ट्रीय ग्रिड स्टेशनों से संकलित कर सटीक कृषि परामर्श प्रदान करता है।</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-foreground">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white">🌾 What is Weather Forecasting and Why Do Farmers Need It?</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                Weather forecasting is the scientific process of predicting atmospheric conditions—such as temperature, precipitation, humidity, and wind speed—for a specific geographic location. In Indian agriculture, where a majority of farms rely on seasonal monsoons, accessing accurate weather information represents the critical boundary between a successful harvest and crop failure.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">🌧️ Rainfall and Crop Growth: The Delicate Balance</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Water is key to plant growth, but excess or deficit can destroy crop yields. For example, Paddy (rice cultivation) requires standing water during early growth stages, but dry, warm weather during harvesting. If farmers anticipate heavy rainfall through our forecast, they can delay irrigation, saving water, electricity, and preventing root rot.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3">
                <h3 className="text-lg font-bold text-emerald-400 font-display">📅 Seasonal Planning Guide: Kharif vs. Rabi Seasons</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  India relies on two major cropping cycles: <strong>Kharif (Monsoon)</strong> and <strong>Rabi (Winter)</strong>. Sowing Kharif crops (like Cotton, Maize) requires precise tracking of the monsoon arrival. Conversely, Rabi crops (like Wheat, Mustard) depend on mild temperature drops and lower humidity. Weather advisory guides ensure smooth transition planning between these cycles.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-amber-500/10 bg-amber-500/[0.02] space-y-4">
              <h3 className="text-lg font-bold text-amber-400 font-display">⚠️ Farming Decisions Under Extreme Weather Conditions</h3>
              <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed text-muted-foreground">
                <div className="space-y-2 border-r border-white/[0.06] pr-4">
                  <h4 className="font-extrabold text-white">1. Heatwaves</h4>
                  <p>When temperatures exceed 40°C, apply light and frequent irrigation. Avoid sprinkler irrigation during peak noon heat to minimize evaporation. Use organic mulching to protect soil moisture.</p>
                </div>
                <div className="space-y-2 border-r border-white/[0.06] px-4">
                  <h4 className="font-extrabold text-white">2. Drought</h4>
                  <p>Prioritize life-saving irrigation. Sow drought-resistant varieties like Pearl Millet (Bajra) or Cluster Beans (Guar), and strictly eliminate weeds to prevent them from stealing moisture.</p>
                </div>
                <div className="space-y-2 pl-4">
                  <h4 className="font-extrabold text-white">3. Heavy Rain</h4>
                  <p>Avoid waterlogging by maintaining functional drainage channels. Do not apply nitrogen fertilizers like urea during heavy rain as they will wash away into run-off channels.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-display font-extrabold text-white">❓ Frequently Asked Questions (FAQs)</h2>
              <div className="grid gap-4 md:grid-cols-2 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q1. How does weather forecasting assist farmers?</h4>
                  <p>It helps schedule sowing, fertilizing, spraying pesticides, and harvesting. This minimizes risk and reduces resource waste.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q2. Is it good to apply urea right after rain?</h4>
                  <p>No, heavy rain washes away urea or causes it to leach below root zones, leaving crops nutrient-deprived.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q3. When is the best time for sprinkler irrigation?</h4>
                  <p>Morning or evening hours when wind speeds are low and evaporation rates are minimal.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q4. What should be done on a hailstorm warning?</h4>
                  <p>If the crops are mature, harvest them immediately. If not, secure anti-hail netting if available.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q5. Why are wind speed and direction important?</h4>
                  <p>High winds cause pesticide sprays to drift away. Sprays should be executed in the direction of the wind and during calm hours.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q6. How do you prevent frost damage?</h4>
                  <p>Generate smoke rings around fields or apply light irrigation. This raises the microclimate temperature of the farm fields.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q7. What is the impact of high relative humidity?</h4>
                  <p>Warm and highly humid conditions encourage fungal pathogens. Monitor leaves closely for early blight or rust.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q8. What are the key Kharif crops?</h4>
                  <p>Paddy, Maize, Cotton, Soybeans, Groundnuts, and certain pulses grown during the rainy season.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q9. What are the key Rabi crops?</h4>
                  <p>Wheat, Mustard, Barley, Peas, Gram, and Potatoes grown during the cool winter season.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.005] space-y-2">
                  <h4 className="font-bold text-white">Q10. Is the weather data on KisaanBuddy live?</h4>
                  <p>Yes, weather indicators are fetched in real-time using local station data and satellite monitoring systems.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
