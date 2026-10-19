"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Cpu,
  Droplets,
  Leaf,
  Loader2,
  Radio,
  RefreshCw,
  Thermometer,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "@/context/LanguageContext";

type SensorReading = {
  device_id: string;
  temperature?: number | null;
  humidity?: number | null;
  soil_temperature?: number | null;
  soil_moisture?: number | null;
  raw_moisture?: number | null;
  received_at: number;
  age_seconds: number;
};

type DeviceStatus = {
  device_id: string;
  online: boolean;
  last_seen_seconds: number;
  readings_stored: number;
};

type MetricKey = "soil_moisture" | "soil_temperature" | "temperature" | "humidity";

type MetricConfig = {
  key: MetricKey;
  titleEn: string;
  titleHi: string;
  titleKn: string;
  unit: string;
  icon: typeof Droplets;
  colour: string;
  interpretation: (value: number, lang: string) => { label: string; note: string; tone: string };
};

const hasNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const formatAge = (seconds?: number, lang?: string) => {
  if (!hasNumber(seconds)) return "—";
  const isKn = lang === "kn";
  const isHi = lang === "hi";

  if (seconds < 10) return isKn ? "ಈಗಷ್ಟೇ" : isHi ? "अभी" : "Just now";
  if (seconds < 60) return isKn ? `${Math.round(seconds)} ಸೆಕೆಂಡ್ ಹಿಂದೆ` : isHi ? `${Math.round(seconds)} सेकंड पहले` : `${Math.round(seconds)} sec ago`;
  if (seconds < 3600) return isKn ? `${Math.round(seconds / 60)} ನಿಮಿಷ ಹಿಂದೆ` : isHi ? `${Math.round(seconds / 60)} मिनट पहले` : `${Math.round(seconds / 60)} min ago`;
  if (seconds < 86400) return isKn ? `${Math.round(seconds / 3600)} ಗಂಟೆ ಹಿಂದೆ` : isHi ? `${Math.round(seconds / 3600)} घंटे पहले` : `${Math.round(seconds / 3600)} hr ago`;
  return isKn ? `${Math.round(seconds / 86400)} ದಿನ ಹಿಂದೆ` : isHi ? `${Math.round(seconds / 86400)} दिन पहले` : `${Math.round(seconds / 86400)} days ago`;
};

const timeLabel = (timestamp?: number) =>
  hasNumber(timestamp)
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      }).format(new Date(timestamp * 1000))
    : "—";

const metricConfigs: MetricConfig[] = [
  {
    key: "soil_moisture",
    titleEn: "Soil moisture",
    titleHi: "मृदा नमी",
    titleKn: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    unit: "%",
    icon: Droplets,
    colour: "text-sky-600 bg-sky-500/10 border-sky-500/20",
    interpretation: (value, lang) => {
      const isKn = lang === "kn";
      const isHi = lang === "hi";
      if (value < 30) {
        return {
          label: isKn ? "ಕಡಿಮೆ" : isHi ? "कम" : "Low",
          note: isKn ? "ಸಾಮಾನ್ಯ 30% ಉಲ್ಲೇಖ ಶ್ರೇಣಿಗಿಂತ ಕಡಿಮೆ." : isHi ? "सामान्य 30% संदर्भ सीमा से नीचे।" : "Below the general 30% reference range.",
          tone: "bg-amber-500/10 text-amber-800 border-amber-500/20",
        };
      }
      if (value > 55) {
        return {
          label: isKn ? "ಹೆಚ್ಚು" : isHi ? "अधिक" : "High",
          note: isKn ? "ಸಾಮಾನ್ಯ 55% ಉಲ್ಲೇಖ ಶ್ರೇಣಿಗಿಂತ ಹೆಚ್ಚು." : isHi ? "सामान्य 55% संदर्भ सीमा से ऊपर।" : "Above the general 55% reference range.",
          tone: "bg-violet-500/10 text-violet-800 border-violet-500/20",
        };
      }
      return {
        label: isKn ? "ಸಾಮಾನ್ಯ" : isHi ? "सामान्य" : "In range",
        note: isKn ? "ಸಾಮಾನ್ಯ 30–55% ಉಲ್ಲೇಖ ಶ್ರೇಣಿಯಲ್ಲಿದೆ." : isHi ? "सामान्य 30-55% संदर्भ सीमा के भीतर।" : "Within the general 30–55% reference range.",
        tone: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      };
    },
  },
  {
    key: "soil_temperature",
    titleEn: "Soil temperature",
    titleHi: "मृदा तापमान",
    titleKn: "ಮಣ್ಣಿನ ತಾಪಮಾನ",
    unit: "°C",
    icon: Thermometer,
    colour: "text-orange-600 bg-orange-500/10 border-orange-500/20",
    interpretation: (value, lang) => {
      const isKn = lang === "kn";
      const isHi = lang === "hi";
      if (value < 15) {
        return {
          label: isKn ? "ಕಡಿಮೆ" : isHi ? "कम" : "Low",
          note: isKn ? "ಸಾಮಾನ್ಯ 15°C ಉಲ್ಲೇಖ ಶ್ರೇಣಿಗಿಂತ ಕಡಿಮೆ." : isHi ? "सामान्य 15°C संदर्भ सीमा से नीचे।" : "Below the general 15°C reference range.",
          tone: "bg-sky-500/10 text-sky-800 border-sky-500/20",
        };
      }
      if (value > 35) {
        return {
          label: isKn ? "ಹೆಚ್ಚು" : isHi ? "अधिक" : "High",
          note: isKn ? "ಸಾಮಾನ್ಯ 35°C ಉಲ್ಲೇಖ ಶ್ರೇಣಿಗಿಂತ ಹೆಚ್ಚು." : isHi ? "सामान्य 35°C संदर्भ सीमा से ऊपर।" : "Above the general 35°C reference range.",
          tone: "bg-orange-500/10 text-orange-800 border-orange-500/20",
        };
      }
      return {
        label: isKn ? "ಸಾಮಾನ್ಯ" : isHi ? "सामान्य" : "Normal",
        note: isKn ? "ಸಾಮಾನ್ಯ 15–35°C ಉಲ್ಲೇಖ ಶ್ರೇಣಿಯಲ್ಲಿದೆ." : isHi ? "सामान्य 15-35°C संदर्भ सीमा के भीतर।" : "Within the general 15–35°C reference range.",
        tone: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      };
    },
  },
  {
    key: "temperature",
    titleEn: "Air temperature",
    titleHi: "हवा का तापमान",
    titleKn: "ಗಾಳಿಯ ತಾಪಮಾನ",
    unit: "°C",
    icon: Thermometer,
    colour: "text-rose-600 bg-rose-500/10 border-rose-500/20",
    interpretation: (value, lang) => {
      const isKn = lang === "kn";
      const isHi = lang === "hi";
      if (value < 15) {
        return {
          label: isKn ? "ತಂಪು" : isHi ? "ठंडा" : "Cool",
          note: isKn ? "ಸಾಮಾನ್ಯ 15°C ಉಲ್ಲೇಖ ಶ್ರೇಣಿಗಿಂತ ಕಡಿಮೆ." : isHi ? "सामान्य 15°C संदर्भ सीमा से नीचे।" : "Below the general 15°C reference range.",
          tone: "bg-sky-500/10 text-sky-800 border-sky-500/20",
        };
      }
      if (value > 35) {
        return {
          label: isKn ? "ಬಿಸಿ" : isHi ? "गर्म" : "Warm",
          note: isKn ? "ಸಾಮಾನ್ಯ 35°C ಉಲ್ಲೇಖ ಶ್ರೇಣಿಗಿಂತ ಹೆಚ್ಚು." : isHi ? "सामान्य 35°C संदर्भ सीमा से ऊपर।" : "Above the general 35°C reference range.",
          tone: "bg-orange-500/10 text-orange-800 border-orange-500/20",
        };
      }
      return {
        label: isKn ? "ಸಾಮಾನ್ಯ" : isHi ? "सामान्य" : "Normal",
        note: isKn ? "ಸಾಮಾನ್ಯ 15–35°C ಉಲ್ಲೇಖ ಶ್ರೇಣಿಯಲ್ಲಿದೆ." : isHi ? "सामान्य 15-35°C संदर्भ सीमा के भीतर।" : "Within the general 15–35°C reference range.",
        tone: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      };
    },
  },
  {
    key: "humidity",
    titleEn: "Air humidity",
    titleHi: "हवा की आर्द्रता",
    titleKn: "ಗಾಳಿಯ ಆರ್ದ್ರತೆ",
    unit: "%",
    icon: Cloud,
    colour: "text-teal-600 bg-teal-500/10 border-teal-500/20",
    interpretation: (value, lang) => {
      const isKn = lang === "kn";
      const isHi = lang === "hi";
      if (value > 80) {
        return {
          label: isKn ? "ಹೆಚ್ಚು" : isHi ? "अधिक" : "High",
          note: isKn ? "ಸಾಮಾನ್ಯ 80% ಉಲ್ಲೇಖ ಶ್ರೇಣಿಗಿಂತ ಹೆಚ್ಚು." : isHi ? "सामान्य 80% संदर्भ सीमा से ऊपर।" : "Above the general 80% reference range.",
          tone: "bg-amber-500/10 text-amber-800 border-amber-500/20",
        };
      }
      return {
        label: isKn ? "ಸಾಮಾನ್ಯ" : isHi ? "सामान्य" : "Normal",
        note: isKn ? "ಸಾಮಾನ್ಯ 80% ಉಲ್ಲೇಖ ಶ್ರೇಣಿಯಲ್ಲಿದೆ." : isHi ? "सामान्य 80% संदर्भ सीमा के भीतर।" : "At or below the general 80% reference range.",
        tone: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      };
    },
  },
];

function getInsight(reading: SensorReading | null, lang: string) {
  const isKn = lang === "kn";
  const isHi = lang === "hi";

  if (!reading) {
    return {
      title: isKn ? "ಸಂವೇದಕ ರೀಡಿಂಗ್‌ಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ" : isHi ? "सेंसर रीडिंग की प्रतीक्षा है" : "Waiting for a sensor reading",
      body: isKn ? "ಕ್ಷೇತ್ರ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಮೊದಲು ಸಾಧನವನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಮುಂದಿನ ರೀಡಿಂಗ್‌ಗಾಗಿ ಕಾಯಿರಿ." : isHi ? "खेत का निर्णय लेने से पहले उपकरण कनेक्ट करें या अगली रीडिंग की प्रतीक्षा करें।" : "Connect a device or wait for the next transmitted reading before making a field decision.",
    };
  }
  if (hasNumber(reading.soil_moisture) && reading.soil_moisture < 30) {
    return {
      title: isKn ? "ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ" : isHi ? "मृदा नमी कम है" : "Soil moisture is low",
      body: isKn ? "ಸಂಪರ್ಕಿತ ಸಂವೇದಕವು ಸಾಮಾನ್ಯ ತೇವಾಂಶ ಶ್ರೇಣಿಗಿಂತ ಕಡಿಮೆಯಿದೆ. ನೀರುಣಿಸುವ ಮೊದಲು ಬೆಳೆ ಹಂತಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀರಾವರಿ ಅಗತ್ಯವನ್ನು ಪರಿಶೀಲಿಸಿ." : isHi ? "सेंसर सामान्य नमी सीमा से नीचे है। पानी देने से पहले फसल चरण के अनुसार आवश्यकता की जांच करें।" : "The connected sensor is below the general moisture reference range. Check irrigation need against your crop stage before watering.",
    };
  }
  if (hasNumber(reading.soil_moisture) && reading.soil_moisture > 55) {
    return {
      title: isKn ? "ಮಣ್ಣಿನ ತೇವಾಂಶ ಹೆಚ್ಚಾಗಿದೆ" : isHi ? "मृदा नमी अधिक है" : "Soil moisture is high",
      body: isKn ? "ಸಂಪರ್ಕಿತ ಸಂವೇದಕವು ಸಾಮಾನ್ಯ ತೇವಾಂಶ ಶ್ರೇಣಿಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ. ಹೆಚ್ಚಿನ ನೀರುಣಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ ಮತ್ತು ನೀರು ಹರಿದುಹೋಗುವಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ." : isHi ? "सेंसर सामान्य नमी सीमा से ऊपर है। अतिरिक्त पानी देने से बचें और जल निकासी की जांच करें।" : "The connected sensor is above the general moisture reference range. Avoid adding water and check drainage before the next irrigation.",
    };
  }
  if (hasNumber(reading.soil_temperature) && (reading.soil_temperature < 15 || reading.soil_temperature > 35)) {
    return {
      title: isKn ? "ಮಣ್ಣಿನ ತಾಪಮಾನ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ" : isHi ? "मृदा तापमान जांच की आवश्यकता है" : "Soil temperature needs a check",
      body: isKn ? "ಸಂಪರ್ಕಿತ ಸಂವೇದಕವು ಸಾಮಾನ್ಯ 15–35°C ಶ್ರೇಣಿಯಿಂದ ಹೊರಗಿದೆ. ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಬೆಳೆ ಹಂತದ ಅಗತ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ." : isHi ? "सेंसर सामान्य 15-35°C सीमा से बाहर है। कार्रवाई से पहले फसल चरण की आवश्यकता देखें।" : "The connected sensor is outside the general 15–35°C reference range. Review crop-stage needs before acting.",
    };
  }
  return {
    title: isKn ? "ಯಾವುದೇ ತಕ್ಷಣದ ತೇವಾಂಶ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ" : isHi ? "कोई तत्काल नमी चेतावनी नहीं" : "No immediate moisture warning",
    body: isKn ? "ಲಭ್ಯವಿರುವ ಸಂವೇದಕ ಮೌಲ್ಯಗಳು ಸಾಮಾನ್ಯ ಉಲ್ಲೇಖ ಶ್ರೇಣಿಯೊಳಗೆ ಇವೆ." : isHi ? "उपलब्ध सेंसर मान सामान्य संदर्भ सीमा के भीतर हैं।" : "The available sensor values are within general reference ranges.",
  };
}

export default function SoilMonitorClient() {
  const { language } = useLanguage();
  const isKn = language === "kn";
  const isHi = language === "hi";

  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [metric, setMetric] = useState<MetricKey>("soil_moisture");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    const response = await fetch("/api/sensor/health", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to reach the sensor service.");
    const payload = (await response.json()) as { devices?: DeviceStatus[] };
    const next = Array.isArray(payload.devices) ? payload.devices : [];
    setDevices(next);
    return next;
  }, []);

  const refreshReadings = useCallback(async (deviceId: string) => {
    if (!deviceId) {
      setReading(null);
      setHistory([]);
      return;
    }
    const id = encodeURIComponent(deviceId);
    const [latest, historic] = await Promise.all([
      fetch(`/api/sensor/latest?device_id=${id}`, { cache: "no-store" }),
      fetch(`/api/sensor/history?device_id=${id}&limit=50`, { cache: "no-store" }),
    ]);
    setReading(latest.ok ? ((await latest.json()) as SensorReading) : null);
    setHistory(historic.ok ? ((await historic.json()) as SensorReading[]) : []);
  }, []);

  const load = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      try {
        setError(null);
        const known = await refreshDevices();
        const current =
          selectedDevice && known.some((item) => item.device_id === selectedDevice)
            ? selectedDevice
            : known.find((item) => item.online)?.device_id ?? known[0]?.device_id ?? "";
        if (current !== selectedDevice) setSelectedDevice(current);
        await refreshReadings(current);
      } catch {
        setError(
          isKn
            ? "ಲೈವ್ ಸಂವೇದಕ ಡೇಟಾವನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ."
            : isHi
            ? "लाइव सेंसर डेटा से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।"
            : "Live sensor data could not be reached. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refreshDevices, refreshReadings, selectedDevice, isKn, isHi]
  );

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (selectedDevice) void refreshReadings(selectedDevice);
  }, [selectedDevice, refreshReadings]);

  const device = devices.find((item) => item.device_id === selectedDevice);
  const available = useMemo(
    () =>
      metricConfigs.filter(
        (item) =>
          hasNumber(reading?.[item.key]) ||
          history.some((entry) => hasNumber(entry[item.key]))
      ),
    [history, reading]
  );
  const activeMetric = metricConfigs.find((item) => item.key === metric) ?? metricConfigs[0];
  const chartRows = useMemo(
    () =>
      history
        .filter((entry) => hasNumber(entry[metric]))
        .map((entry) => ({
          timestamp: entry.received_at,
          value: Number(entry[metric]),
          label: new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(entry.received_at * 1000)),
        })),
    [history, metric]
  );
  const lastReceived = reading?.received_at ?? history.at(-1)?.received_at;
  const insight = getInsight(reading, language);

  useEffect(() => {
    if (available.length && !available.some((item) => item.key === metric)) {
      setMetric(available[0].key);
    }
  }, [available, metric]);

  const getMetricTitle = (m: MetricConfig) => {
    return isKn ? m.titleKn : isHi ? m.titleHi : m.titleEn;
  };

  const steps = [
    [Cpu, isKn ? "ಸಂವೇದಕ ಸಾಧನ" : isHi ? "सेंसर डिवाइस" : "Sensor device"],
    [Droplets, isKn ? "ಮಣ್ಣು / ಜಮೀನು" : isHi ? "मृदा / खेत" : "Soil / field"],
    [Wifi, isKn ? "ಡೇಟಾ ಪ್ರಸರಣ" : isHi ? "डेटा ट्रांसमिशन" : "Data transmission"],
    [Cloud, isKn ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಕ್ಲೌಡ್" : isHi ? "किसानबड्डी क्लाउड" : "KisaanBuddy cloud"],
    [Activity, isKn ? "ಡೇಟಾ ವಿಶ್ಲೇಷಣೆ" : isHi ? "डेटा विश्लेषण" : "Data interpretation"],
    [CheckCircle2, isKn ? "ರೈತರ ನಿರ್ಧಾರ" : isHi ? "किसान का निर्णय" : "Farmer decision"],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-900/15 bg-gradient-to-br from-[#113e31] via-[#15523e] to-[#0a2c24] p-6 text-white shadow-xl md:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              <Radio className="h-4 w-4" />
              <span>{isKn ? "ಸಂಪರ್ಕಿತ ಯಂತ್ರಾಂಶ" : isHi ? "कनेक्टेड हार्डवेयर" : "Connected hardware"}</span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {isKn ? "ಸ್ಮಾರ್ಟ್ ಮಣ್ಣಿನ ಮಾನಿಟರ್" : isHi ? "स्मार्ट मृदा मॉनिटर" : "Smart Soil Monitor"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-emerald-50/85 sm:text-base">
              {isKn
                ? "ನಿಮ್ಮ ಜಮೀನಿನ ಸಂವೇದಕದಿಂದ ನೈಜ ಅಳತೆಗಳು - ಹವಾಮಾನ ಡೇಟಾ, ಅಂದಾಜುಗಳು ಮತ್ತು AI ಮಾರ್ಗದರ್ಶನದಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿ."
                : isHi
                ? "आपके खेत के सेंसर से वास्तविक माप - मौसम डेटा, अनुमानों और एआई मार्गदर्शन से स्पष्ट रूप से अलग।"
                : "Real measurements from your field sensor—clearly separated from weather data, estimates, and AI guidance."}
            </p>
          </div>
          <button
            onClick={() => void load(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{isKn ? "ಲೈವ್ ಡೇಟಾ ನವೀಕರಿಸಿ" : isHi ? "लाइव डेटा रीफ्रेश करें" : "Refresh live data"}</span>
          </button>
        </div>
      </section>

      {/* Device Status & Selector */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                  device?.online
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700"
                    : "border-rose-500/25 bg-rose-500/10 text-rose-700"
                }`}
              >
                {device?.online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {isKn ? "ಸಾಧನದ ಸ್ಥಿತಿ" : isHi ? "उपकरण की स्थिति" : "Device status"}
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-foreground">
                  {device?.online
                    ? (isKn ? "ಯಂತ್ರಾಂಶ ಸಂಪರ್ಕಗೊಂಡಿದೆ" : isHi ? "हार्डवेयर कनेक्टेड" : "Hardware connected")
                    : devices.length
                    ? (isKn ? "ಸಾಧನ ಆಫ್‌ಲೈನ್ ಆಗಿದೆ" : isHi ? "डिवाइस ऑफ़लाइन" : "Device offline")
                    : (isKn ? "ಯಾವುದೇ ಸಾಧನ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ" : isHi ? "कोई डिवाइस कनेक्टेड नहीं" : "No device connected")}
                </h2>
              </div>
            </div>
            {device && (
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                  device.online
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800"
                    : "border-rose-500/25 bg-rose-500/10 text-rose-800"
                }`}
              >
                {device.online ? "LIVE" : "OFFLINE"}
              </span>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">
                {isKn ? "ಕೊನೆಯ ಬಾರಿ ಡೇಟಾ ಸ್ವೀಕರಿಸಿದ್ದು" : isHi ? "अंतिम डेटा प्राप्त" : "Last data received"}
              </p>
              <p className="mt-1 font-semibold text-foreground">{timeLabel(lastReceived)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isKn ? "ರೀಡಿಂಗ್ ಸಮಯ" : isHi ? "रीडिंग का समय" : "Reading age"}
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {device ? formatAge(device.last_seen_seconds, language) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <label htmlFor="device" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isKn ? "ಸಂಪರ್ಕಿತ ಸಾಧನ" : isHi ? "कनेक्टेड डिवाइस" : "Connected device"}
          </label>
          <select
            id="device"
            value={selectedDevice}
            onChange={(event) => setSelectedDevice(event.target.value)}
            disabled={!devices.length}
            className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!devices.length && (
              <option>{isKn ? "ಯಾವುದೇ ಸಂವೇದಕ ಸಾಧನಗಳು ಕಂಡುಬಂದಿಲ್ಲ" : isHi ? "कोई सेंसर डिवाइस नहीं मिला" : "No sensor devices found"}</option>
            )}
            {devices.map((item) => (
              <option key={item.device_id} value={item.device_id}>
                {item.device_id} — {item.online ? "Online" : "Offline"}
              </option>
            ))}
          </select>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {isKn
              ? "ಇದು ಸಂಪರ್ಕಿತ ಸಾಧನವನ್ನು ಆಯ್ಕೆ ಮಾಡುತ್ತದೆ. ಯಂತ್ರಾಂಶ ಫೀಡ್‌ನಲ್ಲಿ ಫಾರ್ಮ್ ಮತ್ತು ಜಮೀನು ಹಂಚಿಕೆ ಲಭ್ಯವಿಲ್ಲದ ಕಾರಣ ಊಹಿಸಲಾಗುವುದಿಲ್ಲ."
              : isHi
              ? "यह कनेक्टेड डिवाइस का चयन करता है। हार्डवेयर फीड में खेत का असाइनमेंट उपलब्ध नहीं है, इसलिए इसका अनुमान नहीं लगाया गया है।"
              : "This selects a connected device. Farm and field assignment is not present in the hardware feed yet, so it is not guessed."}
          </p>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <section aria-live="polite">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {isKn ? "ಲೈವ್ ಸಂವೇದಕ ಡೇಟಾ" : isHi ? "लाइव सेंसर डेटा" : "Live sensor data"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              {isKn ? "ನೈಜ ಜಮೀನು ರೀಡಿಂಗ್‌ಗಳು" : isHi ? "वास्तविक खेत की रीडिंग" : "Actual field readings"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {isKn ? "ಮೂಲ: ಸಂಪರ್ಕಿತ ಮಣ್ಣಿನ ಸಂವೇದಕ" : isHi ? "स्रोत: कनेक्टेड मृदा सेंसर" : "Source: connected soil sensor"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            <span>{isKn ? "ಸಂಪರ್ಕಿತ ಯಂತ್ರಾಂಶ ಲೋಡ್ ಆಗುತ್ತಿದೆ…" : isHi ? "कनेक्टेड हार्डवेयर लोड हो रहा है…" : "Loading connected hardware…"}</span>
          </div>
        ) : !available.length ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Cpu className="mx-auto h-9 w-9 text-muted-foreground" />
            <h3 className="mt-3 text-base font-bold">
              {isKn ? "ಇನ್ನೂ ಯಾವುದೇ ಸಂವೇದಕ ರೀಡಿಂಗ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ" : isHi ? "अभी तक कोई सेंसर रीडिंग उपलब्ध नहीं है" : "No sensor readings available yet"}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              {isKn
                ? "ಸಾಧನವು ಅಳತೆಯನ್ನು ಕಳುಹಿಸಿದಾಗ, ಅದು ಅದರ ಮೂಲ ಮತ್ತು ಸ್ವೀಕರಿಸಿದ ಸಮಯದೊಂದಿಗೆ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ. ಯಾವುದೇ ಮೌಲ್ಯಗಳನ್ನು ಅಂದಾಜಿಸಲಾಗುವುದಿಲ್ಲ."
                : isHi
                ? "जब यह उपकरण माप प्रेषित करेगा, तो यह अपने स्रोत और प्राप्त समय के साथ यहां दिखाई देगा। कोई मान अनुमानित नहीं किया जा रहा है।"
                : "When this device transmits a measurement, it will appear here with its source and received time. No values are being estimated."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {available.map((item) => {
              const value = reading?.[item.key];
              const detail = hasNumber(value) ? item.interpretation(value, language) : null;
              const Icon = item.icon;
              return (
                <article key={item.key} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.colour}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {detail && (
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${detail.tone}`}>
                        {detail.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {getMetricTitle(item)}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                    {hasNumber(value) ? value.toFixed(value % 1 ? 1 : 0) : "—"}
                    <span className="ml-1 text-base text-muted-foreground">{item.unit}</span>
                  </p>
                  <p className="mt-3 min-h-10 text-xs leading-5 text-muted-foreground">
                    {detail?.note ?? (isKn ? "ಯಾವುದೇ ಪ್ರಸ್ತುತ ಲೈವ್ ಮೌಲ್ಯವಿಲ್ಲ; ಇತಿಹಾಸ ಕೆಳಗೆ ಲಭ್ಯವಿದೆ." : isHi ? "कोई वर्तमान लाइव मान नहीं; इतिहास नीचे उपलब्ध है।" : "No current live value; history is available below.")}
                  </p>
                  <p className="mt-3 border-t border-border pt-3 text-[11px] font-medium text-muted-foreground">
                    {isKn ? "ಪರಿಶೀಲಿತ ಸಂವೇದಕ ರೀಡಿಂಗ್" : isHi ? "सत्यापित सेंसर रीडिंग" : "Verified sensor reading"}{" "}
                    {reading ? `• ${formatAge(reading.age_seconds, language)}` : ""}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Insights Section */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {isKn ? "ಕಿಸಾನ್‌ಬಡ್ಡಿ ಒಳನೋಟ" : isHi ? "किसानबड्डी अंतर्दृष्टि" : "KisaanBuddy insight"}
              </p>
              <h2 className="text-lg font-bold">
                {isKn ? "ನಿಮ್ಮ ಮಣ್ಣಿನ ಡೇಟಾದ ಅರ್ಥವೇನು" : isHi ? "आपके मृदा डेटा का क्या अर्थ है" : "What your soil data means"}
              </h2>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Cpu className="h-4 w-4" />
              <span>{isKn ? "ಸಂವೇದಕ ಡೇಟಾ → ನಿರ್ಧಾರ ಸೂಚನೆ" : isHi ? "सेंसर डेटा → निर्णय संकेत" : "Sensor data → decision prompt"}</span>
            </div>
            <h3 className="mt-3 font-bold text-foreground">{insight.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.body}</p>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            {isKn
              ? "ಇದು ಲಭ್ಯವಿರುವ ಸಂವೇದಕ ಮೌಲ್ಯಗಳ ನಿಯಮ-ಆಧಾರಿತ ಅರ್ಥೈಸುವಿಕೆಯಾಗಿದೆ. ಹವಾಮಾನ, ಬೆಳೆ ಮತ್ತು ಜಮೀನಿನ ಇತಿಹಾಸವನ್ನು ಸಾಧನದ ಫೀಡ್‌ಗೆ ಸಂಪರ್ಕಿಸದ ಕಾರಣ ಬಳಸಲಾಗಿಲ್ಲ."
              : isHi
              ? "यह उपलब्ध सेंसर मानों की नियम-आधारित व्याख्या है। मौसम, फसल और खेत का इतिहास डिवाइस फ़ीड से नहीं जुड़ा है।"
              : "This is a transparent rule-based interpretation of the available sensor values. Weather, crop, crop stage and farm history have not been used because they are not connected to this device feed."}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {isKn ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ" : isHi ? "मृदा स्वास्थ्य" : "Soil health"}
              </p>
              <h2 className="text-lg font-bold">
                {isKn ? "ಇನ್ನೂ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿಲ್ಲ" : isHi ? "अभी मूल्यांकन नहीं किया गया" : "Not assessed yet"}
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {isKn
              ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸ್ಕೋರ್‌ಗೆ ಹೆಚ್ಚಿನ ಪರಿಶೀಲಿತ ಮಾಹಿತಿಯ ಅಗತ್ಯವಿದೆ. ಈ ಸಂಪರ್ಕಿತ ಯಂತ್ರಾಂಶವು pH, EC, ಅಥವಾ NPK ನೀಡುವುದಿಲ್ಲವಾದ್ದರಿಂದ, ಕಿಸಾನ್‌ಬಡ್ಡಿ ಸ್ಕೋರ್ ಲೆಕ್ಕಹಾಕುವುದಿಲ್ಲ."
              : isHi
              ? "मृदा स्वास्थ्य स्कोर के लिए अधिक सत्यापित इनपुट की आवश्यकता है। यह कनेक्टेड हार्डवेयर वर्तमान में pH, EC, या NPK प्रदान नहीं करता है।"
              : "A soil-health score needs more verified inputs. This connected hardware does not currently provide pH, EC, or NPK, so KisaanBuddy does not calculate one."}
          </p>
          <Link
            href="/soil-health"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <span>{isKn ? "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ತೆರೆಯಿರಿ" : isHi ? "मृदा स्वास्थ्य कैलकुलेटर खोलें" : "Open soil-health calculator"}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* History Graph */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {isKn ? "ಹಿಂದಿನ ಸಂವೇದಕ ಡೇಟಾ" : isHi ? "ऐतिहासिक सेंसर डेटा" : "Historical sensor data"}
            </p>
            <h2 className="mt-1 text-xl font-bold">
              {isKn ? "ಸಾಧನದ ಇತಿಹಾಸ" : isHi ? "डिवाइस इतिहास" : "Device history"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isKn
                ? "ಸಂಪರ್ಕಿತ ಯಂತ್ರಾಂಶ ಸೇವೆಯು ಉಳಿಸಿಕೊಂಡಿರುವ ರೀಡಿಂಗ್‌ಗಳನ್ನು ಮಾತ್ರ ಚಾರ್ಟ್ ಮಾಡಲಾಗಿದೆ."
                : isHi
                ? "केवल कनेक्टेड हार्डवेयर सेवा द्वारा बनाए रखी गई रीडिंग को चार्ट किया गया है।"
                : "Only readings retained by the connected hardware service are charted."}
            </p>
          </div>
          {available.length > 0 && (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {available.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setMetric(item.key)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${
                    metric === item.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {getMetricTitle(item)}
                </button>
              ))}
            </div>
          )}
        </div>
        {chartRows.length ? (
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows} margin={{ top: 8, right: 8, bottom: 2, left: -18 }}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#718096" }}
                  minTickGap={26}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#718096" }}
                  width={38}
                />
                <Tooltip
                  labelFormatter={(_, rows) =>
                    rows?.[0]?.payload?.timestamp ? timeLabel(rows[0].payload.timestamp) : ""
                  }
                  formatter={(value) => [
                    `${value ?? "—"}${activeMetric.unit}`,
                    getMetricTitle(activeMetric),
                  ]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#15926a"
                  strokeWidth={3}
                  dot={chartRows.length < 12}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">
            {isKn
              ? `ಈ ಸಾಧನಕ್ಕಾಗಿ ಯಾವುದೇ ${getMetricTitle(activeMetric)} ಇತಿಹಾಸ ಲಭ್ಯವಿಲ್ಲ.`
              : isHi
              ? `इस डिवाइस के लिए कोई ${getMetricTitle(activeMetric)} इतिहास उपलब्ध नहीं है।`
              : `No recorded ${activeMetric.titleEn.toLowerCase()} history for this device yet.`}
          </div>
        )}
      </section>

      {/* Hardware Flow Pipeline */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          {isKn ? "ಸಿಗ್ನಲ್ ನಿಮ್ಮನ್ನು ಹೇಗೆ ತಲುಪುತ್ತದೆ" : isHi ? "सिग्नल आप तक कैसे पहुँचता है" : "How the signal reaches you"}
        </p>
        <h2 className="mt-1 text-xl font-bold">
          {isKn ? "ಜಮೀನು → ಕಿಸಾನ್‌ಬಡ್ಡಿ" : isHi ? "खेत → किसानबड्डी" : "Physical field → KisaanBuddy"}
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map(([Icon, label], index) => {
            const StepIcon = Icon;
            return (
              <div key={label} className="relative rounded-xl border border-border bg-muted/30 p-3 text-center">
                <StepIcon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 text-xs font-bold text-foreground">{label}</p>
                {index < 5 && (
                  <span
                    className="absolute -bottom-3 left-1/2 text-primary sm:-right-3 sm:bottom-auto sm:left-auto sm:top-1/2 sm:translate-y-[-50%]"
                    aria-hidden
                  >
                    ↓
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          {isKn
            ? "ಈ ಪುಟದಲ್ಲಿ ತೋರಿಸಲಾದ ಏಕೈಕ ಲೈವ್ ಮೂಲ ಸಂವೇದಕ ಡೇಟಾ ಆಗಿದೆ. ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ಮತ್ತು AI ಮೂಲಗಳನ್ನು ಸಂಪರ್ಕಿಸಿದಾಗ ಪ್ರತ್ಯೇಕವಾಗಿ ಗುರುತಿಸಲಾಗುತ್ತದೆ."
            : isHi
            ? "इस पृष्ठ पर दिखाया गया एकमात्र लाइव स्रोत सेंसर डेटा है। मौसम, बाजार और एआई स्रोतों को कनेक्ट होने पर अलग से लेबल किया जाएगा।"
            : "Sensor data is the only live source shown on this page. Weather, market and AI sources will be labelled separately when connected."}
        </p>
      </section>
    </div>
  );
}
