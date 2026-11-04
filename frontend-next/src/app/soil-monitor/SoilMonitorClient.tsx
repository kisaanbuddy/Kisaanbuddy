"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lang, useLanguage } from "@/lib/language";
import { SOIL_MONITOR_I18N, SoilMonitorDict } from "@/lib/soil-monitor-i18n";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Database,
  Droplets,
  ExternalLink,
  FlaskConical,
  HelpCircle,
  Info,
  Leaf,
  Loader2,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sprout,
  Thermometer,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SensorReading = {
  device_id: string;
  temperature?: number | null;
  humidity?: number | null;
  soil_temperature?: number | null;
  soil_moisture?: number | null;
  raw_moisture?: number | null;
  soil_ph?: number | null;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  electrical_conductivity?: number | null;
  received_at: number;
  age_seconds: number;
};

export type DeviceStatus = {
  device_id: string;
  online: boolean;
  last_seen_seconds: number;
  readings_stored: number;
};

type MetricKey =
  | "soil_moisture"
  | "soil_temperature"
  | "soil_ph"
  | "nitrogen"
  | "phosphorus"
  | "potassium";

type AnalyticsTab = "soil_moisture" | "soil_temperature" | "npk" | "all";
type TimeRangeKey = "1h" | "24h" | "7d" | "30d";

const hasNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const formatAge = (seconds?: number, lang?: string) => {
  if (!hasNumber(seconds)) return "—";
  const d = SOIL_MONITOR_I18N[(lang as Lang) || "en"] || SOIL_MONITOR_I18N.en;
  if (seconds < 10) return d.justNow;
  if (seconds < 60) return d.secAgo(Math.round(seconds));
  if (seconds < 3600) return d.minAgo(Math.round(seconds / 60));
  if (seconds < 86400) return d.hrAgo(Math.round(seconds / 3600));
  return d.daysAgo(Math.round(seconds / 86400));
};

const formatTimeLabel = (timestamp?: number) => {
  if (!hasNumber(timestamp)) return "—";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp * 1000));
};

const formatFullDateTime = (timestamp?: number) => {
  if (!hasNumber(timestamp)) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
};

interface MetricDefinition {
  id: MetricKey;
  name: (dict: SoilMonitorDict) => string;
  chemicalSymbol?: string;
  unit: string;
  icon: typeof Droplets;
  minScale: number;
  maxScale: number;
  lowThreshold: number;
  highThreshold: number;
  getValue: (reading: SensorReading | null) => number | null;
  evaluate: (
    val: number | null,
    dict: SoilMonitorDict
  ) => {
    statusText: string;
    badgeStyle: string;
    statusType: "optimal" | "warning" | "alert" | "unavailable";
    scientificRange: string;
    interpretation: string;
  };
}

const SIX_METRIC_CONFIGS: MetricDefinition[] = [
  {
    id: "soil_moisture",
    name: (d) => d.metrics?.moisture || "Soil Moisture",
    chemicalSymbol: "VWC",
    unit: "%",
    icon: Droplets,
    minScale: 0,
    maxScale: 100,
    lowThreshold: 30,
    highThreshold: 60,
    getValue: (r) => (r && hasNumber(r.soil_moisture) ? r.soil_moisture : null),
    evaluate: (val, d) => {
      if (!hasNumber(val)) {
        return {
          statusText: "No Signal",
          badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
          statusType: "unavailable",
          scientificRange: "Optimal Range: 30–60%",
          interpretation:
            "Awaiting capacitive probe signal. Connect sensor to observe active root-zone hydration.",
        };
      }
      if (val < 30) {
        return {
          statusText: `${d.metrics?.low || "Low"} (<30%)`,
          badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 30–60%",
          interpretation:
            "Soil moisture is below root hydration threshold. Risk of moisture stress; prepare irrigation.",
        };
      }
      if (val > 60) {
        return {
          statusText: `${d.metrics?.high || "High"} (>60%)`,
          badgeStyle: "bg-blue-50 text-blue-800 border-blue-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 30–60%",
          interpretation:
            "Soil is near field saturation. Pause watering to prevent root hypoxia and fungal issues.",
        };
      }
      return {
        statusText: `${d.metrics?.inRange || "Optimal"} (30–60%)`,
        badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
        statusType: "optimal",
        scientificRange: "Optimal Range: 30–60%",
        interpretation:
          "Ideal volumetric moisture content. Transpiration and root nutrient mobility are optimal.",
      };
    },
  },
  {
    id: "soil_temperature",
    name: (d) => d.metrics?.temperature || "Soil Temperature",
    chemicalSymbol: "T_soil",
    unit: "°C",
    icon: Thermometer,
    minScale: 0,
    maxScale: 50,
    lowThreshold: 15,
    highThreshold: 32,
    getValue: (r) => {
      if (!r) return null;
      if (hasNumber(r.soil_temperature)) return r.soil_temperature;
      if (hasNumber(r.temperature)) return r.temperature;
      return null;
    },
    evaluate: (val, d) => {
      if (!hasNumber(val)) {
        return {
          statusText: "No Signal",
          badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
          statusType: "unavailable",
          scientificRange: "Optimal Range: 15–32°C",
          interpretation:
            "Awaiting temperature probe input (DS18B20 or integrated RS485 thermocouple).",
        };
      }
      if (val < 15) {
        return {
          statusText: `${d.metrics?.low || "Cool"} (<15°C)`,
          badgeStyle: "bg-sky-50 text-sky-800 border-sky-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 15–32°C",
          interpretation:
            "Sub-optimal thermal activity. Low soil temperatures slow root metabolism and phosphorus absorption.",
        };
      }
      if (val > 32) {
        return {
          statusText: `${d.metrics?.high || "Elevated"} (>32°C)`,
          badgeStyle: "bg-orange-50 text-orange-800 border-orange-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 15–32°C",
          interpretation:
            "High root-zone temperature accelerates evapotranspiration. Soil mulching recommended.",
        };
      }
      return {
        statusText: `${d.metrics?.inRange || "Optimal"} (15–32°C)`,
        badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
        statusType: "optimal",
        scientificRange: "Optimal Range: 15–32°C",
        interpretation:
          "Optimal temperature zone supporting beneficial soil microbiology and active nitrogen cycling.",
      };
    },
  },
  {
    id: "soil_ph",
    name: (d) => d.metrics?.ph || "Soil pH",
    chemicalSymbol: "pH",
    unit: "pH",
    icon: FlaskConical,
    minScale: 0,
    maxScale: 14,
    lowThreshold: 6.0,
    highThreshold: 7.5,
    getValue: (r) => {
      if (!r) return null;
      if (hasNumber(r.soil_ph)) return r.soil_ph;
      const anyR = r as Record<string, unknown>;
      if (hasNumber(anyR.ph)) return anyR.ph;
      return null;
    },
    evaluate: (val, d) => {
      if (!hasNumber(val)) {
        return {
          statusText: "Probe Not Detected",
          badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
          statusType: "unavailable",
          scientificRange: "Optimal Range: 6.0–7.5 pH",
          interpretation:
            "Awaiting RS485 pH glass electrode or lab soil test card. Essential for nutrient availability.",
        };
      }
      if (val < 6.0) {
        return {
          statusText: `${d.metrics?.low || "Acidic"} (<6.0)`,
          badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 6.0–7.5 pH",
          interpretation:
            "Acidic soil restricts phosphorus and magnesium uptake. Consider agricultural lime conditioning.",
        };
      }
      if (val > 7.5) {
        return {
          statusText: `${d.metrics?.high || "Alkaline"} (>7.5)`,
          badgeStyle: "bg-purple-50 text-purple-800 border-purple-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 6.0–7.5 pH",
          interpretation:
            "Alkaline soil causes micronutrient (iron, zinc) lock-up. Gypsum or organic matter may be needed.",
        };
      }
      return {
        statusText: `${d.metrics?.inRange || "Optimal"} (6.0–7.5)`,
        badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
        statusType: "optimal",
        scientificRange: "Optimal Range: 6.0–7.5 pH",
        interpretation:
          "Near-neutral balance maximizes primary macronutrient and micronutrient bioavailability.",
      };
    },
  },
  {
    id: "nitrogen",
    name: (d) => d.metrics?.nitrogen || "Nitrogen (N)",
    chemicalSymbol: "N",
    unit: "mg/kg",
    icon: Sprout,
    minScale: 0,
    maxScale: 350,
    lowThreshold: 140,
    highThreshold: 280,
    getValue: (r) => {
      if (!r) return null;
      if (hasNumber(r.nitrogen)) return r.nitrogen;
      const anyR = r as Record<string, unknown>;
      if (hasNumber(anyR.n)) return anyR.n;
      return null;
    },
    evaluate: (val, d) => {
      if (!hasNumber(val)) {
        return {
          statusText: "Probe Not Detected",
          badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
          statusType: "unavailable",
          scientificRange: "Optimal Range: 140–280 mg/kg",
          interpretation:
            "Connect 7-in-1 Modbus NPK probe or enter soil testing lab card values in the calculator.",
        };
      }
      if (val < 140) {
        return {
          statusText: `${d.metrics?.low || "Deficient"} (<140)`,
          badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 140–280 mg/kg",
          interpretation:
            "Low available nitrogen. May limit vegetative canopy vigor, tillering, and chlorophyll production.",
        };
      }
      if (val > 280) {
        return {
          statusText: `${d.metrics?.high || "Surplus"} (>280)`,
          badgeStyle: "bg-purple-50 text-purple-800 border-purple-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 140–280 mg/kg",
          interpretation:
            "Excess nitrogen risks delayed crop maturity, lodging, and increased vegetative pest vulnerability.",
        };
      }
      return {
        statusText: `${d.metrics?.inRange || "Optimal"} (140–280)`,
        badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
        statusType: "optimal",
        scientificRange: "Optimal Range: 140–280 mg/kg",
        interpretation:
          "Balanced available nitrogen promoting healthy vegetative leaf development without lush excess.",
      };
    },
  },
  {
    id: "phosphorus",
    name: (d) => d.metrics?.phosphorus || "Phosphorus (P)",
    chemicalSymbol: "P",
    unit: "mg/kg",
    icon: Leaf,
    minScale: 0,
    maxScale: 50,
    lowThreshold: 10,
    highThreshold: 25,
    getValue: (r) => {
      if (!r) return null;
      if (hasNumber(r.phosphorus)) return r.phosphorus;
      const anyR = r as Record<string, unknown>;
      if (hasNumber(anyR.p)) return anyR.p;
      return null;
    },
    evaluate: (val, d) => {
      if (!hasNumber(val)) {
        return {
          statusText: "Probe Not Detected",
          badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
          statusType: "unavailable",
          scientificRange: "Optimal Range: 10–25 mg/kg",
          interpretation:
            "Connect 7-in-1 Modbus NPK probe or enter soil testing lab card values in the calculator.",
        };
      }
      if (val < 10) {
        return {
          statusText: `${d.metrics?.low || "Deficient"} (<10)`,
          badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 10–25 mg/kg",
          interpretation:
            "Low available phosphorus. Root system expansion and early seedling establishment may be inhibited.",
        };
      }
      if (val > 25) {
        return {
          statusText: `${d.metrics?.high || "High Reserve"} (>25)`,
          badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
          statusType: "optimal",
          scientificRange: "Optimal Range: 10–25 mg/kg",
          interpretation:
            "Generous available phosphorus pool. Supports robust flowering and energetic ATP cellular transfer.",
        };
      }
      return {
        statusText: `${d.metrics?.inRange || "Optimal"} (10–25)`,
        badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
        statusType: "optimal",
        scientificRange: "Optimal Range: 10–25 mg/kg",
        interpretation:
          "Optimal phosphorus availability ensuring strong root anchoring, nodulation, and flower initiation.",
      };
    },
  },
  {
    id: "potassium",
    name: (d) => d.metrics?.potassium || "Potassium (K)",
    chemicalSymbol: "K",
    unit: "mg/kg",
    icon: ShieldCheck,
    minScale: 0,
    maxScale: 350,
    lowThreshold: 110,
    highThreshold: 280,
    getValue: (r) => {
      if (!r) return null;
      if (hasNumber(r.potassium)) return r.potassium;
      const anyR = r as Record<string, unknown>;
      if (hasNumber(anyR.k)) return anyR.k;
      return null;
    },
    evaluate: (val, d) => {
      if (!hasNumber(val)) {
        return {
          statusText: "Probe Not Detected",
          badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
          statusType: "unavailable",
          scientificRange: "Optimal Range: 110–280 mg/kg",
          interpretation:
            "Connect 7-in-1 Modbus NPK probe or enter soil testing lab card values in the calculator.",
        };
      }
      if (val < 110) {
        return {
          statusText: `${d.metrics?.low || "Deficient"} (<110)`,
          badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
          statusType: "warning",
          scientificRange: "Optimal Range: 110–280 mg/kg",
          interpretation:
            "Low potassium weakens crop stalk strength and degrades plant stomatal drought protection.",
        };
      }
      if (val > 280) {
        return {
          statusText: `${d.metrics?.high || "High Reserve"} (>280)`,
          badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
          statusType: "optimal",
          scientificRange: "Optimal Range: 110–280 mg/kg",
          interpretation:
            "Abundant potassium pool. Promotes disease tolerance, enzyme activation, and fruit/grain filling.",
        };
      }
      return {
        statusText: `${d.metrics?.inRange || "Optimal"} (110–280)`,
        badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
        statusType: "optimal",
        scientificRange: "Optimal Range: 110–280 mg/kg",
        interpretation:
          "Balanced potassium level providing cellular turgor, disease resilience, and strong crop stems.",
      };
    },
  },
];

export default function SoilMonitorClient() {
  const { lang } = useLanguage();
  const dict = useMemo(() => {
    return SOIL_MONITOR_I18N[(lang as Lang) || "en"] || SOIL_MONITOR_I18N.en;
  }, [lang]);

  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Analytics Filter States
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>("soil_moisture");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("24h");

  // IoT Setup Guide Modal
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [hasCopiedCode, setHasCopiedCode] = useState<boolean>(false);

  // Fetch registered devices
  const refreshDevices = useCallback(async () => {
    const response = await fetch("/api/sensor/health", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to reach the IoT sensor service.");
    }
    const payload = (await response.json()) as { devices?: DeviceStatus[] };
    const deviceList = Array.isArray(payload.devices) ? payload.devices : [];
    setDevices(deviceList);
    return deviceList;
  }, []);

  // Fetch latest reading and recent history for the selected device
  const refreshReadings = useCallback(async (deviceId: string) => {
    if (!deviceId) {
      setReading(null);
      setHistory([]);
      return;
    }
    const id = encodeURIComponent(deviceId);
    const [latestRes, historyRes] = await Promise.all([
      fetch(`/api/sensor/latest?device_id=${id}`, { cache: "no-store" }),
      fetch(`/api/sensor/history?device_id=${id}&limit=100`, { cache: "no-store" }),
    ]);

    let latestData: SensorReading | null = null;
    let historyData: SensorReading[] = [];

    if (historyRes.ok) {
      try {
        const histJson = (await historyRes.json()) as SensorReading[];
        if (Array.isArray(histJson)) {
          historyData = histJson;
        }
      } catch {
        historyData = [];
      }
    }

    if (latestRes.ok) {
      try {
        latestData = (await latestRes.json()) as SensorReading;
      } catch {
        latestData = null;
      }
    } else if (historyData.length > 0) {
      // Fallback: If device is offline but history exists, show the most recent packet
      latestData = historyData[historyData.length - 1];
    }

    setReading(latestData);
    setHistory(historyData);
  }, []);

  // Unified load trigger
  const load = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      try {
        setError(null);
        const knownDevices = await refreshDevices();
        const currentId =
          selectedDevice && knownDevices.some((d) => d.device_id === selectedDevice)
            ? selectedDevice
            : knownDevices.find((d) => d.online)?.device_id ?? knownDevices[0]?.device_id ?? "";

        if (currentId !== selectedDevice) {
          setSelectedDevice(currentId);
        }
        await refreshReadings(currentId);
      } catch {
        setError(dict.connectionError || "Could not connect to the sensor gateway.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refreshDevices, refreshReadings, selectedDevice, dict.connectionError]
  );

  // Initial load and periodic polling every 15s
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(false), 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  // When selected device manually changes
  useEffect(() => {
    if (selectedDevice) {
      void refreshReadings(selectedDevice);
    }
  }, [selectedDevice, refreshReadings]);

  const activeDevice = useMemo(
    () => devices.find((d) => d.device_id === selectedDevice),
    [devices, selectedDevice]
  );

  // Time calculations
  const lastReceivedTimestamp = reading?.received_at ?? history.at(-1)?.received_at;
  const isDeviceLive = Boolean(activeDevice?.online);

  // Filter history according to time-range selection
  const filteredHistory = useMemo(() => {
    if (!history.length) return [];
    const nowSec = Date.now() / 1000;
    const windowSeconds: Record<TimeRangeKey, number> = {
      "1h": 3600,
      "24h": 86400,
      "7d": 7 * 86400,
      "30d": 30 * 86400,
    };
    const cutoff = nowSec - windowSeconds[timeRange];
    // Filter records within the window; if server timestamps are relative, keep sorted list
    const inWindow = history.filter((r) => r.received_at >= cutoff);
    return inWindow.length > 0 ? inWindow : history; // fallback to available history if clock variance
  }, [history, timeRange]);

  // Prepare chart series data based on active tab
  const chartData = useMemo(() => {
    if (!filteredHistory.length) return [];

    return filteredHistory.map((entry) => {
      const timeStr = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        day: timeRange === "7d" || timeRange === "30d" ? "numeric" : undefined,
        month: timeRange === "7d" || timeRange === "30d" ? "short" : undefined,
      }).format(new Date(entry.received_at * 1000));

      const moistureVal = hasNumber(entry.soil_moisture) ? entry.soil_moisture : undefined;
      const tempVal = hasNumber(entry.soil_temperature)
        ? entry.soil_temperature
        : hasNumber(entry.temperature)
        ? entry.temperature
        : undefined;
      const phVal = hasNumber(entry.soil_ph) ? entry.soil_ph : undefined;
      const nVal = hasNumber(entry.nitrogen) ? entry.nitrogen : undefined;
      const pVal = hasNumber(entry.phosphorus) ? entry.phosphorus : undefined;
      const kVal = hasNumber(entry.potassium) ? entry.potassium : undefined;

      return {
        timestamp: entry.received_at,
        timeLabel: timeStr,
        soil_moisture: moistureVal,
        soil_temperature: tempVal,
        soil_ph: phVal,
        nitrogen: nVal,
        phosphorus: pVal,
        potassium: kVal,
      };
    });
  }, [filteredHistory, timeRange]);

  // Check if chart has any valid data points for the active tab
  const hasChartPoints = useMemo(() => {
    if (!chartData.length) return false;
    if (analyticsTab === "soil_moisture") {
      return chartData.some((d) => hasNumber(d.soil_moisture));
    }
    if (analyticsTab === "soil_temperature") {
      return chartData.some((d) => hasNumber(d.soil_temperature));
    }
    if (analyticsTab === "npk") {
      return chartData.some(
        (d) => hasNumber(d.nitrogen) || hasNumber(d.phosphorus) || hasNumber(d.potassium)
      );
    }
    if (analyticsTab === "all") {
      return chartData.some(
        (d) =>
          hasNumber(d.soil_moisture) ||
          hasNumber(d.soil_temperature) ||
          hasNumber(d.soil_ph) ||
          hasNumber(d.nitrogen)
      );
    }
    return false;
  }, [chartData, analyticsTab]);

  // Compute summary stats for the active metric
  const statsSummary = useMemo(() => {
    if (!hasChartPoints) return null;
    let values: number[] = [];

    if (analyticsTab === "soil_moisture") {
      values = chartData.map((d) => d.soil_moisture).filter(hasNumber);
    } else if (analyticsTab === "soil_temperature") {
      values = chartData.map((d) => d.soil_temperature).filter(hasNumber);
    } else if (analyticsTab === "npk") {
      values = chartData.map((d) => d.nitrogen).filter(hasNumber);
    }

    if (!values.length) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const latest = values[values.length - 1];

    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1),
      latest: latest.toFixed(1),
    };
  }, [chartData, analyticsTab, hasChartPoints]);

  const copySnippet = () => {
    const code = `// KrishiAI ESP32 Field Node Telemetry Ingestion
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_FARM_WIFI";
const char* password = "WIFI_PASSWORD";
const char* serverUrl = "https://krishiai-api.onrender.com/api/sensor/ingest";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Reading from capacitive sensor (GPIO34) & DS18B20
    float moisture = 42.5; 
    float soilTemp = 24.2;

    String json = "{\\"device_id\\":\\"krishiai-node-1\\",\\"soil_moisture\\":" + 
                  String(moisture) + ",\\"soil_temperature\\":" + String(soilTemp) + "}";

    int httpCode = http.POST(json);
    http.end();
  }
  delay(60000); // 1 minute interval
}`;
    void navigator.clipboard.writeText(code);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 antialiased">
      <main className="w-full py-6 space-y-6">
        {/* ================================================================= */}
        {/* 1. HERO SECTION                                                   */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#063326] via-[#094734] to-[#04241b] p-6 text-white shadow-lg md:p-8">
          {/* Subtle micro-grid background glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/3 -bottom-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-2">
              {/* Connected Hardware Status Indicator */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3 py-1 text-xs font-semibold text-emerald-200">
                <span className="relative flex h-2.5 w-2.5">
                  {isDeviceLive && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                      isDeviceLive
                        ? "bg-emerald-400"
                        : devices.length > 0
                        ? "bg-amber-400"
                        : "bg-slate-400"
                    }`}
                  />
                </span>
                <span>
                  {isDeviceLive
                    ? `Hardware Connected (Live Telemetry)`
                    : devices.length > 0
                    ? `Hardware Standby / Offline (${selectedDevice || "Node"})`
                    : `No Hardware Detected`}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {dict.title || "Smart Soil Monitor"}
              </h1>
              <p className="text-sm font-normal leading-relaxed text-emerald-100 sm:text-base">
                {dict.subtitle || "Monitor real-time soil conditions directly from your field."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void load(true)}
                disabled={refreshing}
                aria-label="Refresh live telemetry data"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#063326] shadow-sm transition hover:bg-emerald-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-75"
              >
                <RefreshCw
                  className={`h-4 w-4 text-[#063326] ${refreshing ? "animate-spin" : ""}`}
                />
                <span>{refreshing ? dict.refreshing : dict.refreshBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSetupModalOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-800/60 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-95"
              >
                <Cpu className="h-4 w-4 text-emerald-200" />
                <span>{dict.connectDeviceBtn || "Connect IoT Device"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Global Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-0.5">
              <p className="font-bold">Gateway Connection Notice</p>
              <p className="text-amber-800">{error}</p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. DEVICE CONNECTION SECTION                                      */}
        {/* ================================================================= */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition sm:p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                  isDeviceLive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : devices.length > 0
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-100 text-slate-500"
                }`}
              >
                {isDeviceLive ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    {isDeviceLive
                      ? "Hardware Connected & Active"
                      : devices.length > 0
                      ? "Device Standby / Offline"
                      : "No Device Connected"}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      isDeviceLive
                        ? "bg-emerald-100 text-emerald-800"
                        : devices.length > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isDeviceLive ? "LIVE STREAM" : devices.length > 0 ? "OFFLINE" : "UNCONNECTED"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isDeviceLive
                    ? `Physical ESP32 node continuously streaming microclimate and root-zone telemetry.`
                    : devices.length > 0
                    ? `Device registered but has not broadcast telemetry in the last 120 seconds.`
                    : `No IoT sensor hardware currently transmitting field data.`}
                </p>
              </div>
            </div>

            {/* Device Switcher / Connect Trigger */}
            <div className="flex items-center gap-2 sm:self-center">
              {devices.length > 0 ? (
                <div className="flex items-center gap-2">
                  <label htmlFor="device-selector" className="sr-only">
                    Select Device
                  </label>
                  <select
                    id="device-selector"
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    {devices.map((d) => (
                      <option key={d.device_id} value={d.device_id}>
                        {d.device_id} {d.online ? "● (Online)" : "○ (Offline)"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSetupModalOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800"
                >
                  <Cpu className="h-4 w-4" />
                  <span>Connect Device</span>
                </button>
              )}
            </div>
          </div>

          {/* Telemetry metadata grid */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Device Identifier</span>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900 truncate">
                {selectedDevice || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Connection Status</span>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isDeviceLive ? "bg-emerald-500" : devices.length ? "bg-amber-500" : "bg-slate-400"
                  }`}
                />
                {isDeviceLive ? "Online (15s Poll)" : devices.length ? "Offline / Stale" : "No Signal"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Last Data Received</span>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {hasNumber(lastReceivedTimestamp) ? formatTimeLabel(lastReceivedTimestamp) : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Reading Age</span>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {hasNumber(activeDevice?.last_seen_seconds)
                  ? formatAge(activeDevice?.last_seen_seconds, lang)
                  : reading?.age_seconds
                  ? formatAge(reading.age_seconds, lang)
                  : "—"}
              </p>
            </div>
          </div>

          {/* Fallback Setup Instructions Banner when NO device is connected */}
          {!devices.length && !loading && (
            <div className="mt-5 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center sm:text-left">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-start gap-4">
                  <div className="hidden rounded-xl bg-emerald-600 p-3 text-white sm:block">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">
                      How to connect your agricultural IoT sensor
                    </h3>
                    <p className="mt-1 max-w-xl text-xs leading-relaxed text-emerald-800">
                      Stream continuous moisture, temperature, and NPK readings from your field using an
                      ESP32 node with standard capacitive probes or RS485 Modbus sensors.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSetupModalOpen(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800"
                >
                  <Cpu className="h-4 w-4" />
                  <span>View Setup Guide & Code</span>
                </button>
              </div>

              {/* 4 Setup Steps Quick Cards */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-emerald-200/60 bg-white p-3.5 shadow-2xs">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    1
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">Hardware Node</h4>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Power ESP32 DevKit V1 with 5V Solar or battery pack.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200/60 bg-white p-3.5 shadow-2xs">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    2
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">Connectivity</h4>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Connect node to 2.4GHz Farm Wi-Fi or 4G GSM Micro-SIM.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200/60 bg-white p-3.5 shadow-2xs">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    3
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">Field Placement</h4>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Insert probe 10–15 cm into plant active root depth.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200/60 bg-white p-3.5 shadow-2xs">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    4
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">Telemetry Stream</h4>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Firmware POSTs JSON to <code>/api/sensor/ingest</code> every 60s.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* 3. SOIL PARAMETERS DASHBOARD (Six Individual Metric Cards)         */}
        {/* ================================================================= */}
        <section aria-label="Soil Parameters Dashboard" className="space-y-4">
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Radio className="h-3.5 w-3.5" />
                <span>{dict.liveSensorData || "Live Sensor Telemetry"}</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#063326] tracking-tight">
                Soil Parameters Dashboard
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {dict.sourceSensor || "Source: Connected IoT Sensor Node Probes"}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-xs">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
              <span>{dict.loadingHardware || "Querying IoT sensor gateway..."}</span>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SIX_METRIC_CONFIGS.map((config) => {
                const rawValue = config.getValue(reading);
                const evaluation = config.evaluate(rawValue, dict);
                const Icon = config.icon;
                const hasValue = hasNumber(rawValue);

                // Range position calculation for visual gauge
                const rangeWidth = config.maxScale - config.minScale;
                const percentPosition = hasValue
                  ? Math.min(
                      100,
                      Math.max(0, ((rawValue - config.minScale) / rangeWidth) * 100)
                    )
                  : 0;

                const lowPercent =
                  ((config.lowThreshold - config.minScale) / rangeWidth) * 100;
                const highPercent =
                  ((config.highThreshold - config.minScale) / rangeWidth) * 100;

                return (
                  <article
                    key={config.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              {config.chemicalSymbol}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 leading-tight">
                              {config.name(dict)}
                            </h3>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${evaluation.badgeStyle}`}
                        >
                          {evaluation.statusText}
                        </span>
                      </div>

                      {/* Large Reading Value Display */}
                      <div className="mt-4 flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold tracking-tight text-[#063326]">
                          {hasValue ? rawValue.toFixed(rawValue % 1 !== 0 ? 1 : 0) : "--"}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">
                          {config.unit}
                        </span>
                      </div>

                      {/* Scientific Range Bar Gauge */}
                      <div className="mt-3.5 space-y-1">
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          {/* Segment markers */}
                          <div
                            className="absolute top-0 bottom-0 bg-amber-200/70"
                            style={{ left: 0, width: `${lowPercent}%` }}
                            title="Low range"
                          />
                          <div
                            className="absolute top-0 bottom-0 bg-emerald-300"
                            style={{
                              left: `${lowPercent}%`,
                              width: `${highPercent - lowPercent}%`,
                            }}
                            title="Optimal range"
                          />
                          <div
                            className="absolute top-0 bottom-0 bg-amber-200/70"
                            style={{
                              left: `${highPercent}%`,
                              width: `${100 - highPercent}%`,
                            }}
                            title="High range"
                          />

                          {/* Current Value Pointer */}
                          {hasValue && (
                            <div
                              className="absolute top-0 bottom-0 w-1.5 -ml-0.75 bg-slate-900 shadow-sm rounded-full"
                              style={{ left: `${percentPosition}%` }}
                            />
                          )}
                        </div>

                        <div className="flex justify-between text-[10px] font-medium text-slate-400">
                          <span>
                            {config.minScale}
                            {config.unit}
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            {config.lowThreshold}–{config.highThreshold} {config.unit} (Optimal)
                          </span>
                          <span>
                            {config.maxScale}
                            {config.unit}
                          </span>
                        </div>
                      </div>

                      {/* Interpretation Note */}
                      <p className="mt-3 min-h-[2.5rem] text-xs leading-relaxed text-slate-600">
                        {evaluation.interpretation}
                      </p>
                    </div>

                    {/* Card Footer: Timestamp & Signal Status */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {hasValue && reading
                          ? `Updated ${formatAge(reading.age_seconds, lang)}`
                          : "Awaiting probe data"}
                      </span>

                      <span className="font-medium text-slate-500">
                        {hasValue
                          ? isDeviceLive
                            ? "Verified Live Telemetry"
                            : "Last Cached Record"
                          : "No Telemetry"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* 4. LIVE SENSOR ANALYTICS                                          */}
        {/* ================================================================= */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6 space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Activity className="h-3.5 w-3.5" />
                <span>Live Sensor Analytics</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Telemetry Trend & Historical Data
              </h2>
            </div>

            {/* Time-Range Filters */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
              {(
                [
                  { key: "1h", label: "1 Hour" },
                  { key: "24h", label: "24 Hours" },
                  { key: "7d", label: "7 Days" },
                  { key: "30d", label: "30 Days" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTimeRange(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    timeRange === tab.key
                      ? "bg-white text-emerald-950 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            {[
              { id: "soil_moisture", label: "Soil Moisture (%)", icon: Droplets },
              { id: "soil_temperature", label: "Temperature (°C)", icon: Thermometer },
              { id: "npk", label: "NPK Telemetry (mg/kg)", icon: Sprout },
              { id: "all", label: "All Parameters", icon: Sliders },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAnalyticsTab(tab.id as AnalyticsTab)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    analyticsTab === tab.id
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chart Header Stats (if data available) */}
          {statsSummary && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Latest Reading:</span>
                <p className="font-extrabold text-[#063326] text-sm mt-0.5">
                  {statsSummary.latest}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Window Minimum:</span>
                <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                  {statsSummary.min}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Window Maximum:</span>
                <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                  {statsSummary.max}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Window Average:</span>
                <p className="font-extrabold text-emerald-800 text-sm mt-0.5">
                  {statsSummary.avg}
                </p>
              </div>
            </div>
          )}

          {/* Chart Area */}
          {hasChartPoints ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="timeLabel"
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    minTickGap={32}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#063326",
                      color: "#ffffff",
                      borderRadius: 12,
                      border: "none",
                      fontSize: 12,
                      padding: "8px 12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "#a7f3d0", fontWeight: "bold", marginBottom: 4 }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                  />

                  {/* Lines based on active tab */}
                  {(analyticsTab === "soil_moisture" || analyticsTab === "all") && (
                    <Line
                      type="monotone"
                      name="Soil Moisture (%)"
                      dataKey="soil_moisture"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={chartData.length < 15}
                      activeDot={{ r: 6, fill: "#059669" }}
                    />
                  )}

                  {(analyticsTab === "soil_temperature" || analyticsTab === "all") && (
                    <Line
                      type="monotone"
                      name="Soil Temp (°C)"
                      dataKey="soil_temperature"
                      stroke="#ea580c"
                      strokeWidth={2.5}
                      dot={chartData.length < 15}
                      activeDot={{ r: 6, fill: "#ea580c" }}
                    />
                  )}

                  {(analyticsTab === "npk" || analyticsTab === "all") && (
                    <>
                      <Line
                        type="monotone"
                        name="Nitrogen (mg/kg)"
                        dataKey="nitrogen"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={chartData.length < 15}
                      />
                      <Line
                        type="monotone"
                        name="Phosphorus (mg/kg)"
                        dataKey="phosphorus"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={chartData.length < 15}
                      />
                      <Line
                        type="monotone"
                        name="Potassium (mg/kg)"
                        dataKey="potassium"
                        stroke="#9333ea"
                        strokeWidth={2}
                        dot={chartData.length < 15}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            /* Professional Empty State (Strictly NO Artificial Points) */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-2xs">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800">
                No Historical Telemetry In Selected Window
              </h3>
              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
                Continuous readings from your connected field hardware will automatically plot here
                over time. Select a broader time-range filter or verify that your IoT node is
                broadcasting telemetry packets.
              </p>
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <span>Verify node ingestion endpoint</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* 5. SOIL HEALTH INSIGHTS                                            */}
        {/* ================================================================= */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6 space-y-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Agronomic Telemetry Interpretation</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Soil Health Condition & Recommendations
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Generated strictly from active field telemetry
            </span>
          </div>

          {/* Condition Panels Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Condition 1: Soil Moisture */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-emerald-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Moisture Condition
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    <Cpu className="h-3 w-3 text-emerald-600" />
                    Hardware
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xl font-bold text-[#063326]">
                    {hasNumber(reading?.soil_moisture) ? `${reading.soil_moisture}%` : "—"}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {hasNumber(reading?.soil_moisture)
                      ? reading.soil_moisture < 30
                        ? "Dry / Moisture Deficit"
                        : reading.soil_moisture > 60
                        ? "Waterlogged / High Saturation"
                        : "Optimal Root Zone Hydration"
                      : "Awaiting Probe Telemetry"}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200/60 pt-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <Bot className="h-3 w-3" />
                  <span>AI Agronomy Recommendation</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {hasNumber(reading?.soil_moisture)
                    ? reading.soil_moisture < 30
                      ? "Initiate targeted drip or furrow irrigation to bring root-zone volumetric moisture back to the 35–45% threshold."
                      : reading.soil_moisture > 60
                      ? "Halt irrigation cycles immediately. Ensure drainage ditches are clear to avert root fungal pathogens."
                      : "Soil moisture is in the prime transpiration window. Defer watering for the next 24 hours."
                    : "Connect an active soil moisture probe to receive real-time irrigation advisories."}
                </p>
              </div>
            </div>

            {/* Condition 2: Temperature */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Temperature Condition
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    <Cpu className="h-3 w-3 text-emerald-600" />
                    Hardware
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xl font-bold text-[#063326]">
                    {hasNumber(reading?.soil_temperature)
                      ? `${reading.soil_temperature}°C`
                      : hasNumber(reading?.temperature)
                      ? `${reading.temperature}°C`
                      : "—"}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {hasNumber(reading?.soil_temperature ?? reading?.temperature)
                      ? (reading?.soil_temperature ?? reading?.temperature ?? 0) < 15
                        ? "Cold / Slow Metabolism"
                        : (reading?.soil_temperature ?? reading?.temperature ?? 0) > 32
                        ? "Thermal Stress Potential"
                        : "Optimal Microbial Range"
                      : "Awaiting Probe Telemetry"}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200/60 pt-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <Bot className="h-3 w-3" />
                  <span>AI Agronomy Recommendation</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {hasNumber(reading?.soil_temperature ?? reading?.temperature)
                    ? (reading?.soil_temperature ?? reading?.temperature ?? 0) < 15
                      ? "Low temperature retards phosphate uptake. Delay foliar fertilizer until daytime temperature exceeds 18°C."
                      : (reading?.soil_temperature ?? reading?.temperature ?? 0) > 32
                      ? "Soil heat increases evaporation. Apply crop straw mulching to shield upper root layer."
                      : "Soil biological nitrification and rhizobial activity are optimal. Favorable window for fertilizer uptake."
                    : "Connect a digital temperature probe (DS18B20) to track root zone thermal conditions."}
                </p>
              </div>
            </div>

            {/* Condition 3: Soil pH */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-purple-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      pH Condition
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    <Cpu className="h-3 w-3 text-emerald-600" />
                    Hardware
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xl font-bold text-[#063326]">
                    {hasNumber(reading?.soil_ph) ? `${reading.soil_ph}` : "—"}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {hasNumber(reading?.soil_ph)
                      ? reading.soil_ph < 6.0
                        ? "Acidic Field Soil"
                        : reading.soil_ph > 7.5
                        ? "Alkaline Field Soil"
                        : "Optimal Neutral Range"
                      : "Awaiting Probe Telemetry"}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200/60 pt-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <Bot className="h-3 w-3" />
                  <span>AI Agronomy Recommendation</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {hasNumber(reading?.soil_ph)
                    ? reading.soil_ph < 6.0
                      ? "Acidic conditions lock up phosphorus and molybdenum. Consider lime or dolomite application before sowing."
                      : reading.soil_ph > 7.5
                      ? "Alkaline profile may cause iron and zinc deficiency. Consider sulfur or gypsum application."
                      : "Balanced pH maximizes nutrient solubility and synthetic/organic fertilizer efficiency."
                    : "Connect an RS485 pH probe or run the Soil Health Lab Calculator for complete chemical profile."}
                </p>
              </div>
            </div>

            {/* Condition 4: Nutrient Availability (NPK) */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-emerald-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Nutrient Availability
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    <Cpu className="h-3 w-3 text-emerald-600" />
                    Hardware
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xl font-bold text-[#063326]">
                    {hasNumber(reading?.nitrogen)
                      ? `N: ${Math.round(reading.nitrogen)} mg/kg`
                      : "—"}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {hasNumber(reading?.nitrogen)
                      ? "NPK Telemetry Active"
                      : "Awaiting NPK Probe"}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200/60 pt-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <Bot className="h-3 w-3" />
                  <span>AI Agronomy Recommendation</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {hasNumber(reading?.nitrogen)
                    ? "Available nitrogen pool is detected. Match fertilizer split-dosages with specific crop tillering stages."
                    : "Deploy a 7-in-1 Modbus RS485 probe or import Soil Health Card lab results to calculate exact NPK deficits."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Link to Full Soil Health Lab Calculator */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-emerald-950">
                Need a comprehensive laboratory soil health audit?
              </h4>
              <p className="text-xs text-emerald-800">
                Our Soil Health Lab AI analyzes organic carbon, electrical conductivity, micronutrients,
                and crop-specific fertilizer plans.
              </p>
            </div>
            <Link
              href="/soil-health"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-800 active:scale-95"
            >
              <span>{dict.openCalculator || "Open Soil Health Calculator"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* ================================================================= */}
      {/* 6. IOT SETUP & HARDWARE CONNECTION MODAL                           */}
      {/* ================================================================= */}
      {isSetupModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Connect IoT Soil Sensor Node
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hardware integration guide for ESP32, Raspberry Pi Pico, and LoRaWAN gateways.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Instructions */}
            <div className="space-y-4 text-xs text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <h4 className="font-bold text-slate-900">1. Target Ingestion Endpoint</h4>
                <p>
                  Configure your ESP32 HTTP POST requests to broadcast to this server endpoint:
                </p>
                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-emerald-400 text-[11px] select-all">
                  POST /api/sensor/ingest
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <h4 className="font-bold text-slate-900">2. JSON Payload Schema</h4>
                <p>The sensor node should stream telemetry formatted as JSON:</p>
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-emerald-300 text-[11px]">
{`{
  "device_id": "krishiai-node-1",
  "soil_moisture": 42.5,
  "soil_temperature": 24.2,
  "soil_ph": 6.8,
  "nitrogen": 180.0,
  "phosphorus": 18.5,
  "potassium": 210.0
}`}
                </pre>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">3. ESP32 Arduino C++ Firmware Sample</h4>
                  <button
                    type="button"
                    onClick={copySnippet}
                    className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    {hasCopiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{hasCopiedCode ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ready-to-flash sketch for ESP32 with Wi-Fi & capacitive probe analog reading.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="h-10 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
