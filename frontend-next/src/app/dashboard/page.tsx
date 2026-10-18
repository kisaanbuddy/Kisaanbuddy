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
    if (lang === "hi") {
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

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
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
