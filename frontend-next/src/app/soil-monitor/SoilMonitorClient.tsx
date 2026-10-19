"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lang } from "@/lib/language";
import { SOIL_MONITOR_I18N, SoilMonitorDict } from "@/lib/soil-monitor-i18n";
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
import { useLanguage } from "@/lib/language";

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
  const d = SOIL_MONITOR_I18N[(lang as Lang) || "en"] || SOIL_MONITOR_I18N.en;
  if (seconds < 10) return d.justNow;
  if (seconds < 60) return d.secAgo(Math.round(seconds));
  if (seconds < 3600) return d.minAgo(Math.round(seconds / 60));
  if (seconds < 86400) return d.hrAgo(Math.round(seconds / 3600));
  return d.daysAgo(Math.round(seconds / 86400));
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
      const d = SOIL_MONITOR_I18N[(lang as Lang) || "en"] || SOIL_MONITOR_I18N.en;
      if (value < 30) {
        return {
          label: d.metrics.low,
          note: `${d.metrics.low}: < 30%`,
          tone: "bg-amber-500/10 text-amber-800 border-amber-500/20",
        };
      }
      if (value > 55) {
        return {
          label: d.metrics.high,
          note: `${d.metrics.high}: > 55%`,
          tone: "bg-violet-500/10 text-violet-800 border-violet-500/20",
        };
      }
      return {
        label: d.metrics.inRange,
        note: `${d.metrics.inRange}: 30–55%`,
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
      const d = SOIL_MONITOR_I18N[(lang as Lang) || "en"] || SOIL_MONITOR_I18N.en;
      if (value < 15) {
        return {
          label: d.metrics.low,
          note: `${d.metrics.low}: < 15°C`,
          tone: "bg-sky-500/10 text-sky-800 border-sky-500/20",
        };
      }
      if (value > 35) {
        return {
          label: d.metrics.high,
          note: `${d.metrics.high}: > 35°C`,
          tone: "bg-orange-500/10 text-orange-800 border-orange-500/20",
        };
      }
      return {
        label: d.metrics.inRange,
        note: `${d.metrics.inRange}: 15–35°C`,
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
      const d = SOIL_MONITOR_I18N[(lang as Lang) || "en"] || SOIL_MONITOR_I18N.en;
      if (value < 15) {
        return {
          label: d.metrics.low,
          note: `${d.metrics.low}: < 15°C`,
          tone: "bg-sky-500/10 text-sky-800 border-sky-500/20",
        };
      }
      if (value > 35) {
        return {
          label: d.metrics.high,
          note: `${d.metrics.high}: > 35°C`,
          tone: "bg-orange-500/10 text-orange-800 border-orange-500/20",
        };
      }
      return {
        label: d.metrics.inRange,
        note: `${d.metrics.inRange}: 15–35°C`,
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
      const d = SOIL_MONITOR_I18N[(lang as Lang) || "en"] || SOIL_MONITOR_I18N.en;
      if (value > 80) {
        return {
          label: d.metrics.high,
          note: `${d.metrics.high}: > 80%`,
          tone: "bg-amber-500/10 text-amber-800 border-amber-500/20",
        };
      }
      return {
        label: d.metrics.inRange,
        note: `${d.metrics.inRange}: ≤ 80%`,
        tone: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
      };
    },
  },
];

function getInsight(reading: SensorReading | null, lang: string) {
  const d = SOIL_MONITOR_I18N[(lang as Lang) || "en"] || SOIL_MONITOR_I18N.en;

  if (!reading) {
    return {
      title: d.alerts.noDeviceTitle,
      body: d.alerts.noDeviceBody,
    };
  }
  if (hasNumber(reading.soil_moisture) && reading.soil_moisture < 30) {
    return {
      title: d.alerts.lowMoistureTitle,
      body: d.alerts.lowMoistureBody,
    };
  }
  if (hasNumber(reading.soil_moisture) && reading.soil_moisture > 55) {
    return {
      title: d.alerts.highMoistureTitle,
      body: d.alerts.highMoistureBody,
    };
  }
  if (hasNumber(reading.soil_temperature) && (reading.soil_temperature < 15 || reading.soil_temperature > 35)) {
    return {
      title: d.alerts.tempCheckTitle,
      body: d.alerts.tempCheckBody,
    };
  }
  return {
    title: d.alerts.noAlertTitle,
    body: d.alerts.noAlertBody,
  };
}

export default function SoilMonitorClient() {
  const { lang } = useLanguage();
  const language = lang;
  const dict = SOIL_MONITOR_I18N[(language as Lang) || "en"] || SOIL_MONITOR_I18N.en;

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
        setError(dict.connectionError || "Could not connect to sensor service");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refreshDevices, refreshReadings, selectedDevice, language]
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
    const k = m.key as string;
    if (k === "soil_moisture") return dict.metrics.moisture;
    if (k === "soil_temperature") return dict.metrics.temperature;
    if (k === "electrical_conductivity") return dict.metrics.electricalConductivity;
    if (k === "nitrogen") return dict.metrics.nitrogen;
    if (k === "phosphorus") return dict.metrics.phosphorus;
    if (k === "potassium") return dict.metrics.potassium;
    if (k === "soil_ph") return dict.metrics.ph;
    return m.titleEn;
  };

  const steps = [
    [Cpu, dict.pipelineSteps.device],
    [Droplets, dict.pipelineSteps.soil],
    [Wifi, dict.pipelineSteps.data],
    [Cloud, dict.pipelineSteps.cloud],
    [Activity, dict.pipelineSteps.analysis],
    [CheckCircle2, dict.pipelineSteps.decision],
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
              <span>{dict.tag}</span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {dict.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-emerald-50/85 sm:text-base">
              {dict.subtitle}
            </p>
          </div>
          <button
            onClick={() => void load(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{dict.refreshBtn}</span>
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
                  {dict.deviceStatus}
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-foreground">
                  {device?.online
                    ? dict.statusConnected
                    : devices.length
                    ? dict.statusOffline
                    : dict.statusNone}
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
                {dict.lastReceived}
              </p>
              <p className="mt-1 font-semibold text-foreground">{timeLabel(lastReceived)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {dict.readingAge}
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {device ? formatAge(device.last_seen_seconds, language) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <label htmlFor="device" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {dict.connectedDevice}
          </label>
          <select
            id="device"
            value={selectedDevice}
            onChange={(event) => setSelectedDevice(event.target.value)}
            disabled={!devices.length}
            className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!devices.length && (
              <option>{dict.noDevicesFound}</option>
            )}
            {devices.map((item) => (
              <option key={item.device_id} value={item.device_id}>
                {item.device_id} — {item.online ? "Online" : "Offline"}
              </option>
            ))}
          </select>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {dict.connectPrompt}
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
              {dict.liveSensorData}
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              {dict.actualFieldReadings}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {dict.sourceSensor}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            <span>{dict.loadingHardware}</span>
          </div>
        ) : !available.length ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Cpu className="mx-auto h-9 w-9 text-muted-foreground" />
            <h3 className="mt-3 text-base font-bold">
              {dict.noReadingsYet}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              {dict.connectPrompt}
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
                    {detail?.note ?? dict.noReadingsYet}
                  </p>
                  <p className="mt-3 border-t border-border pt-3 text-[11px] font-medium text-muted-foreground">
                    {dict.verifiedReading}{" "}
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
                {dict.insightTag}
              </p>
              <h2 className="text-lg font-bold">
                {dict.insightTitle}
              </h2>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Cpu className="h-4 w-4" />
              <span>{dict.insightDesc}</span>
            </div>
            <h3 className="mt-3 font-bold text-foreground">{insight.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.body}</p>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            {dict.alerts.noAlertBody}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {dict.soilHealthTag}
              </p>
              <h2 className="text-lg font-bold">
                {dict.soilHealthNotAssessed}
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {dict.soilHealthDesc}
          </p>
          <Link
            href="/soil-health"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <span>{dict.openCalculator}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* History Graph */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {dict.historicalData}
            </p>
            <h2 className="mt-1 text-xl font-bold">
              {dict.deviceHistory}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.historicalDesc}
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
            {dict.noReadingsYet}
          </div>
        )}
      </section>

      {/* Hardware Flow Pipeline */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          {dict.pipelineTag}
        </p>
        <h2 className="mt-1 text-xl font-bold">
          {dict.pipelineTitle}
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
          {dict.pipelineTitle}
        </p>
      </section>
    </div>
  );
}
