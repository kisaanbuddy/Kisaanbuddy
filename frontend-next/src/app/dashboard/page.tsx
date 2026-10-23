"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Wheat,
  Share2,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useLanguage, Lang } from "@/lib/language";
import {
  farmerProfileApi,
  fieldsApi,
  soilTestsApi,
  recommendationsApi,
  activitiesApi,
  tasksApi,
  marketplaceApi,
  FarmerProfile,
  FarmerField,
  SoilTest,
  Recommendation,
  FarmActivity,
  FarmTask,
  FarmTaskSummary,
  MarketplaceListing,
} from "@/lib/farmer-api";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FarmKpiRow } from "@/components/dashboard/FarmKpiRow";
import { MyFarmCropsSection } from "@/components/dashboard/MyFarmCropsSection";
import { WeatherRiskPanel } from "@/components/dashboard/WeatherRiskPanel";
import { AiInsightsCard } from "@/components/dashboard/AiInsightsCard";
import { FarmTasksPlanner } from "@/components/dashboard/FarmTasksPlanner";
import { SoilHealthSummary } from "@/components/dashboard/SoilHealthSummary";
import { MarketplaceWidget } from "@/components/dashboard/MarketplaceWidget";
import { LiveSensorWidget } from "@/components/dashboard/LiveSensorWidget";
import { RecentActivitiesTimeline } from "@/components/dashboard/RecentActivitiesTimeline";

export default function DashboardPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const { t, lang } = useLanguage();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core Farm Data states
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [fields, setFields] = useState<FarmerField[]>([]);
  const [soilTests, setSoilTests] = useState<SoilTest[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [taskSummary, setTaskSummary] = useState<FarmTaskSummary | null>(null);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);
  const [activities, setActivities] = useState<FarmActivity[]>([]);

  // Real-time ESP32 physical sensor telemetry
  const [sensorOnline, setSensorOnline] = useState(false);
  const [moisture, setMoisture] = useState(0);
  const [sensorTemp, setSensorTemp] = useState(0);
  const [sensorHumidity, setSensorHumidity] = useState(0);

  // Weather data
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    humidity: number;
    windSpeed: number;
    rainChance: number;
    condition: string;
  }>({
    temp: 28,
    humidity: 58,
    windSpeed: 9,
    rainChance: 12,
    condition: "Partly Cloudy",
  });

  // Dynamic time-based greeting
  const greeting = useMemo(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) return t("goodMorning") || "Good Morning";
    if (hrs < 17) return t("goodAfternoon") || "Good Afternoon";
    return t("goodEvening") || "Good Evening";
  }, [t]);

  // Real-time sensor polling from ESP32 database endpoint
  const fetchLatestSensor = useCallback(async () => {
    try {
      const res = await fetch("/api/sensor/latest");
      if (res.ok) {
        const data = await res.json();
        setMoisture(Math.round(data.soil_moisture ?? 0));
        setSensorTemp(Math.round(data.temperature ?? data.soil_temperature ?? 0));
        setSensorHumidity(Math.round(data.humidity ?? 0));
        setSensorOnline(true);
      } else {
        setSensorOnline(false);
      }
    } catch {
      setSensorOnline(false);
    }
  }, []);

  // Parallel fetch of all farm systems
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    setError(null);

    try {
      const [
        profileRes,
        fieldsRes,
        soilRes,
        recsRes,
        tasksRes,
        summaryRes,
        marketRes,
        activitiesRes,
      ] = await Promise.allSettled([
        farmerProfileApi.get(),
        fieldsApi.list(),
        soilTestsApi.list(),
        recommendationsApi.list({ status: "pending" }),
        tasksApi.list(),
        tasksApi.summary(),
        marketplaceApi.list(),
        activitiesApi.list(),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        setProfile(profileRes.value);
      }
      if (fieldsRes.status === "fulfilled" && Array.isArray(fieldsRes.value)) {
        setFields(fieldsRes.value);
      }
      if (soilRes.status === "fulfilled" && Array.isArray(soilRes.value)) {
        setSoilTests(soilRes.value);
      }
      if (recsRes.status === "fulfilled" && Array.isArray(recsRes.value)) {
        setRecommendations(recsRes.value);
      }
      if (tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value)) {
        setTasks(tasksRes.value);
      }
      if (summaryRes.status === "fulfilled" && summaryRes.value) {
        setTaskSummary(summaryRes.value);
      }
      if (marketRes.status === "fulfilled" && Array.isArray(marketRes.value)) {
        setMarketplaceListings(marketRes.value);
      }
      if (activitiesRes.status === "fulfilled" && Array.isArray(activitiesRes.value)) {
        setActivities(activitiesRes.value);
      }

      // Try fetching live weather if lat/lon available
      try {
        const lat = profileRes.status === "fulfilled" ? profileRes.value?.gps_lat : null;
        const lon = profileRes.status === "fulfilled" ? profileRes.value?.gps_lon : null;
        const weatherUrl =
          lat && lon
            ? `/api/weather?lat=${lat}&lon=${lon}`
            : `/api/weather`;
        const wRes = await fetch(weatherUrl);
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData.current) {
            setWeatherData({
              temp: Math.round(wData.current.temp ?? 28),
              humidity: Math.round(wData.current.humidity ?? 58),
              windSpeed: Math.round(wData.current.wind_speed ?? 9),
              rainChance: Math.round(wData.current.rain_chance ?? 15),
              condition: wData.current.condition || "Partly Cloudy",
            });
          }
        }
      } catch {
        // Fallback gracefully to default seasonal microclimate
      }
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
      setError("Some farm services are temporarily updating.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    fetchLatestSensor();

    const sensorInterval = setInterval(fetchLatestSensor, 5000);
    return () => clearInterval(sensorInterval);
  }, [loadDashboardData, fetchLatestSensor]);

  // Voice Speech Synthesis: reads field and farm status aloud
  const handleSpeakStatus = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const name = user?.name || "Kisaan Saathi";
    const pendingCount = taskSummary?.due_today ?? 0;
    const cropNames = fields
      .map((f) => f.current_crop)
      .filter(Boolean)
      .join(", ");

    let message = "";
    if (lang === "kn") {
      message = `ನಮಸ್ಕಾರ ${name}. ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರ: ನಿಮ್ಮ ಬಳಿ ${fields.length} ಜಮೀನುಗಳು ನೋಂದಾಯಿತವಾಗಿವೆ`;
      if (cropNames) message += `, ಮುಖ್ಯ ಬೆಳೆಗಳು ${cropNames}.`;
      message += ` ಇಂದಿಗೆ ${pendingCount} ಕೆಲಸಗಳು ಬಾಕಿ ಇವೆ.`;
      if (sensorOnline) {
        message += ` ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture} ಪ್ರತಿಶತ ಮತ್ತು ತಾಪಮಾನ ${sensorTemp} ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್ ಆಗಿದೆ.`;
      }
    } else if (lang === "te") {
      message = `నమస్కారం ${name}. మీ పొలం వివరాలు: మీ వద్ద ${fields.length} పొలాలు నమోదు చేయబడ్డాయి`;
      if (cropNames) message += `, ప్రధాన పంటలు ${cropNames}.`;
      message += ` ఈ రోజు కోసం ${pendingCount} పనులు పెండింగ్‌లో ఉన్నాయి.`;
      if (sensorOnline) {
        message += ` నేల తేమ ${moisture} శాతం మరియు ఉష్ణోగ్రత ${sensorTemp} డిగ్రీల సెల్సియస్.`;
      }
    } else if (lang === "ta") {
      message = `வணக்கம் ${name}. உங்கள் பண்ணை நிலவரம்: உங்களிடம் ${fields.length} நிலங்கள் பதிவு செய்யப்பட்டுள்ளன`;
      if (cropNames) message += `, முக்கிய பயிர்கள் ${cropNames}.`;
      message += ` இன்றைக்கு ${pendingCount} பணிகள் நிலுவையில் உள்ளன.`;
      if (sensorOnline) {
        message += ` மண் ஈரப்பதம் ${moisture} சதவீதம் மற்றும் வெப்பநிலை ${sensorTemp} டிகிரி செல்சியஸ்.`;
      }
    } else if (lang === "mr") {
      message = `नमस्कार ${name}. तुमच्या शेताचा तपशील: तुमच्याकडे ${fields.length} शेत नोंदणीकृत आहेत`;
      if (cropNames) message += `, मुख्य पिके ${cropNames} आहेत.`;
      message += ` आजसाठी ${pendingCount} कामे बाकी आहेत.`;
      if (sensorOnline) {
        message += ` मातीचा ओलावा ${moisture} टक्के आणि तापमान ${sensorTemp} अंश सेल्सिअस आहे.`;
      }
    } else if (lang === "gu") {
      message = `નમસ્તે ${name}. તમારા ખેતરનો સારાંશ: તમારી પાસે ${fields.length} ખેતર નોંધાયેલા છે`;
      if (cropNames) message += `, મુખ્ય પાક ${cropNames} છે.`;
      message += ` આજે ${pendingCount} કામ બાકી છે.`;
      if (sensorOnline) {
        message += ` જમીનમાં ભેજ ${moisture} ટકા અને તાપમાન ${sensorTemp} ડિગ્રી સેલ્સિયસ છે.`;
      }
    } else if (lang === "bn") {
      message = `নমস্কার ${name}। আপনার খামারের বিবরণ: আপনার ${fields.length}টি জমি নিবন্ধিত রয়েছে`;
      if (cropNames) message += `, প্রধান ফসল ${cropNames}।`;
      message += ` আজকের জন্য ${pendingCount}টি কাজ বাকি রয়েছে।`;
      if (sensorOnline) {
        message += ` মাটির আর্দ্রতা ${moisture} শতাংশ এবং তাপমাত্রা ${sensorTemp} ডিগ্রি সেলসিয়াস।`;
      }
    } else if (lang === "pa") {
      message = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name}। ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਵੇਰਵਾ: ਤੁਹਾਡੇ ਕੋਲ ${fields.length} ਖੇਤ ਦਰਜ ਹਨ`;
      if (cropNames) message += `, ਮੁੱਖ ਫ਼ਸਲਾਂ ${cropNames} ਹਨ।`;
      message += ` ਅੱਜ ਦੇ ਲਈ ${pendingCount} ਕੰਮ ਬਾਕੀ ਹਨ।`;
      if (sensorOnline) {
        message += ` ਮਿੱਟੀ ਦੀ ਨਮੀ ${moisture} ਫ਼ੀਸਦੀ ਅਤੇ ਤਾਪਮਾਨ ${sensorTemp} ਡਿਗਰੀ ਸੈਲਸੀਅਸ ਹੈ।`;
      }
    } else if (lang === "ml") {
      message = `നമസ്കാരം ${name}. നിങ്ങളുടെ ഫാം വിവരങ്ങൾ: നിങ്ങൾക്ക് ${fields.length} പ്ലോട്ടുകൾ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്`;
      if (cropNames) message += `, പ്രധാന വിളകൾ ${cropNames}.`;
      message += ` ഇന്നത്തേക്ക് ${pendingCount} ജോലികൾ ബാക്കിയുണ്ട്.`;
      if (sensorOnline) {
        message += ` മണ്ണിലെ ഈർപ്പം ${moisture} ശതമാനവും താപനില ${sensorTemp} ഡിഗ്രി സെൽഷ്യസും ആണ്.`;
      }
    } else if (lang === "hi" || lang === "hi_en") {
      message = `नमस्ते ${name}। आपके खेत का हाल: आपके पास ${fields.length} खेत दर्ज हैं`;
      if (cropNames) message += `, मुख्य फसलें ${cropNames} हैं।`;
      message += ` आज के लिए ${pendingCount} कार्य बाकी हैं।`;
      if (sensorOnline) {
        message += ` मिट्टी की नमी ${moisture} प्रतिशत और तापमान ${sensorTemp} डिग्री है।`;
      }
    } else {
      message = `Hello ${name}. Here is your farm summary: You have ${fields.length} plots registered`;
      if (cropNames) message += ` with active crops ${cropNames}.`;
      message += ` You have ${pendingCount} tasks due today.`;
      if (sensorOnline) {
        message += ` Soil moisture is ${moisture} percent, temperature is ${sensorTemp} degrees Celsius.`;
      }
    }

    const bcpMap: Record<string, string> = {
      kn: "kn-IN",
      hi: "hi-IN",
      te: "te-IN",
      ta: "ta-IN",
      mr: "mr-IN",
      gu: "gu-IN",
      bn: "bn-IN",
      pa: "pa-IN",
      ml: "ml-IN",
      hi_en: "hi-IN",
      en: "en-IN",
    };
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = bcpMap[lang] || "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  // WhatsApp Farm Report Share
  const handleShareWhatsApp = () => {
    const name = user?.name || "Kisaan";
    const crops = fields.map((f) => f.current_crop).filter(Boolean).join(", ") || "General Crop";
    const pendingCount = taskSummary?.due_today ?? 0;
    const txt = encodeURIComponent(
      `🌾 *KisaanBuddy Farm Intelligence Report*\nFarmer: ${name}\nActive Crops: ${crops}\nTasks Due Today: ${pendingCount}\nWeather: ${weatherData.temp}°C, ${weatherData.condition}\nMoisture: ${moisture}%\nGenerated via KisaanBuddy Farm AI.`
    );
    window.open(`https://wa.me/?text=${txt}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top sticky sub-bar with refresh action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wheat className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            KisaanBuddy Command Center
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDashboardData(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span>{refreshing ? "Updating..." : "Sync Farm"}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Error Notice if any */}
        {error && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Enterprise Dashboard Header */}
        <DashboardHeader
          userName={user?.name}
          greeting={greeting}
          profile={profile}
          fieldsCount={fields.length}
          sensorOnline={sensorOnline}
          onSpeakStatus={handleSpeakStatus}
          onOpenNewTaskModal={() => {
            const el = document.getElementById("tasks-planner");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* 2. Agricultural Command KPI Row */}
        <FarmKpiRow
          totalAcres={profile?.land_holding_acres ?? 0}
          fields={fields}
          taskSummary={taskSummary}
          latestSoilTest={soilTests[0] || null}
          weatherTemp={weatherData.temp}
          weatherCondition={weatherData.condition}
        />

        {/* 3. Main Dashboard Layout: Two Balanced Operational Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Span 7 on desktop): Crops, AI Recommendations, Tasks, Marketplace */}
          <div className="lg:col-span-7 space-y-6">
            {/* My Farm & Active Crop Plots */}
            <MyFarmCropsSection fields={fields} />

            {/* AI Farm Intelligence & Context Recommendations */}
            <AiInsightsCard
              recommendations={recommendations}
              onRecommendationUpdated={() => loadDashboardData(true)}
            />

            {/* Farm Work Planner & Daily Operations */}
            <FarmTasksPlanner
              tasks={tasks}
              onTasksChanged={() => loadDashboardData(true)}
            />

            {/* Marketplace: Direct Buyer Connection & Input Discovery */}
            <MarketplaceWidget listings={marketplaceListings} />
          </div>

          {/* Right Column (Span 5 on desktop): Weather Risks, Soil Health, IoT Sensors, Financials */}
          <div className="lg:col-span-5 space-y-6">
            {/* Weather & Agro-Risk Operational Advisory */}
            <WeatherRiskPanel
              locationName={
                [profile?.village_name, profile?.district_name].filter(Boolean).join(", ") ||
                "Local Farm"
              }
              temperature={weatherData.temp}
              humidity={weatherData.humidity}
              windSpeedKmH={weatherData.windSpeed}
              rainChancePct={weatherData.rainChance}
              condition={weatherData.condition}
              soilMoisturePct={sensorOnline ? moisture : undefined}
            />

            {/* Soil Health & Macronutrient Reserve */}
            <SoilHealthSummary latestTest={soilTests[0] || null} />

            {/* Physical IoT ESP32 Telemetry */}
            <LiveSensorWidget
              sensorOnline={sensorOnline}
              moisture={moisture}
              temp={sensorTemp}
              humidity={sensorHumidity}
              onSpeakStatus={handleSpeakStatus}
              onShareWhatsApp={handleShareWhatsApp}
            />

            {/* Recent Farm Activities & Financial Timeline */}
            <RecentActivitiesTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
