"use client";
import { useLanguage } from '@/lib/language'

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Thermometer, Droplet, Sprout, Wind, Calendar, Smartphone,
  CloudRain, Sun, Check, ArrowRight, Activity, Database, Sparkles,
  Shield, Star, MessageSquare, ChevronRight, Zap, RefreshCw, Layers
} from "lucide-react";

// Mock Data
const SENSOR_HOTSPOTS = [
  {
    id: "dht22",
    name: "DHT22 Air Sensor",
    type: "Air Temp & Humidity",
    description: "Measures ambient greenhouse or open-field temperature (-40°C to 80°C) and air humidity (0-100% RH) to calculate evaporation rate and frost alerts.",
    x: "25%",
    y: "30%",
    data: "T: 27.4°C, H: 61%"
  },
  {
    id: "ds18b20",
    name: "DS18B20 Soil Probe",
    type: "Waterproof Soil Temp",
    description: "Stainless steel waterproof thermal probe inserted directly at crop root-zone level (-10°C to 85°C) to monitor soil biological activity and germination conditions.",
    x: "75%",
    y: "85%",
    data: "Soil T: 24.8°C"
  },
  {
    id: "moisture",
    name: "Capacitive Moisture v2.0",
    type: "Soil Moisture Density",
    description: "Corrosion-resistant probe measuring dielectric permittivity of soil. Prevents sensor degradation over years in damp earth. Feeds water requirement prediction models.",
    x: "30%",
    y: "75%",
    data: "Moisture: 40% (Optimal)"
  },
  {
    id: "oled",
    name: "SSD1306 OLED Screen",
    type: "On-device LCD Display",
    description: "Sleek 0.96\" screen providing local diagnostics, current sensor values, Wi-Fi connectivity status, and direct database transmission feedback.",
    x: "50%",
    y: "45%",
    data: "Online / Sync OK"
  }
];

const FEATURES = [
  { icon: Droplet, title: "Soil Moisture Sensor", desc: "Corrosion-proof capacitive sensor tracking volume percentage of water in root-zones." },
  { icon: Thermometer, title: "Soil Temperature Sensor", desc: "Waterproof steel probe measuring ground thermal environment for microbial activity." },
  { icon: Wind, title: "Air Temp & Humidity", desc: "DHT22 high-accuracy module monitoring micro-climate dynamics around foliage." },
  { icon: CloudRain, title: "Rain Detection Array", desc: "Precipitation trigger that warns systems of sudden rain to adjust automated irrigation schedules." },
  { icon: Sun, title: "Light Intensity Sensor", desc: "Tracks solar radiation and lux levels to estimate plant transpiration and shade requirements." },
  { icon: Sprout, title: "pH & NPK Monitoring", desc: "Integrates with laboratory card profiles to provide precise chemical fertilizer optimization recommendations." },
  { icon: Calendar, title: "Water Tracking AI", desc: "Analyzes transpiration loss against soil logs to prescribe optimal irrigation volume per acre." },
  { icon: Shield, title: "Disease Risk Matrix", desc: "Matches humidity spikes and leaf wetness trends to predict fungus and rust risks." },
  { icon: Sparkles, title: "AI Crop Integration", desc: "Streams live temperature and humidity directly to KrishiAI's Precision Crop Recommendation models." },
  { icon: Activity, title: "Real-Time Telemetry", desc: "Ingests readings every 30 seconds to the cloud via MQTT/HTTP for hyper-granular farm charts." },
  { icon: Smartphone, title: "Mobile Connect", desc: "Bilingual Progressive Web App widgets showing current sensor metrics in English, Hindi, and Kannada." },
  { icon: Database, title: "Cloud Dashboard", desc: "Aggregates months of agronomy data to generate soil recovery trends and water budget ledgers." }
];

const BENEFITS = [
  { stat: "35%", label: "Water Savings", desc: "AI adjusts irrigation runtime by analyzing exact moisture gradients, preventing crop drowning." },
  { stat: "20%+", label: "Yield Increase", desc: "Hyper-local alerts for optimal planting, fertilizer dose inputs, and micro-climate frost warnings." },
  { stat: "30s", label: "Telemetry Sync", desc: "Immediate backend synchronization ensures live alerts when temperature or moisture crosses critical levels." },
  { stat: "₹1,200", label: "DIY Hardware", desc: "Open-source blueprint utilizes off-the-shelf ESP32 microchips, keeping implementation costs low." }
];

const SUCCESS_STORIES = [
  {
    name: "Suresh Patel",
    location: "Anand, Gujarat",
    crop: "Potato & Tomato",
    text: "KrishiAI hardware setup took me less than 30 minutes. The capacitive soil sensor helped me realize I was overwatering my potato beds. I saved 35% of electricity and water bills, and got 18% higher yield this harvest!",
    avatar: "SP",
    rating: 5
  },
  {
    name: "Mallesh Gowda",
    location: "Mandya, Karnataka",
    crop: "Sugarcane",
    text: "The soil temperature probe is fantastic. During early summer, the alerts warned me of heat shock risk in my nursery soil. The crop recommendation model synced perfectly with the live weather. Strongly recommended!",
    avatar: "MG",
    rating: 5
  }
];

const SPECIFICATIONS = [
  { category: "System Architecture", specs: [
    { name: "Microcontroller", value: "ESP32 DevKit V1 (32-bit dual-core, 240MHz)" },
    { name: "Connectivity", value: "Wi-Fi 802.11 b/g/n (2.4GHz), Serial UART" },
    { name: "Local Display", value: "0.96\" SSD1306 OLED (I2C, 128x64 pixels)" },
    { name: "Waterproofing", value: "IP65 Weatherproof capsule casing casing design" }
  ]},
  { category: "Sensors & Ranges", specs: [
    { name: "Capacitive Moisture v2.0", value: "Analog readout, 0% to 100% calibration" },
    { name: "DHT22 Climate Sensor", value: "Temp: -40°C to 80°C (±0.5°C), Humidity: 0-100%" },
    { name: "DS18B20 Soil Probe", value: "Temp: -55°C to 125°C, Waterproof stainless tube" },
    { name: "NPK & pH Ingestion", value: "Software-assisted auto-calculations & API support" }
  ]}
];

export function HardwareShowcase() {
  const { t } = useLanguage()
  const [activeHotspot, setActiveHotspot] = useState<string>("dht22");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovering3d, setHovering3d] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Chart states
  const [chartData, setChartData] = useState<number[]>([42, 45, 43, 40, 48, 52, 49, 43, 41, 40]);
  const [liveTemp, setLiveTemp] = useState(27.4);
  const [liveMoisture, setLiveMoisture] = useState(40);

  // Rotate simulated device on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePos({ x: x * 20, y: -y * 20 }); // Limit rotation to max 20 degrees
  };

  useEffect(() => {
    // Simulate real-time data ticks
    const interval = setInterval(() => {
      setLiveTemp(t => +(t + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setLiveMoisture(m => {
        const next = Math.max(25, Math.min(85, m + (Math.random() * 2 - 1)));
        setChartData(prev => [...prev.slice(1), +next.toFixed(0)]);
        return +next.toFixed(0);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeHotspotData = SENSOR_HOTSPOTS.find(h => h.id === activeHotspot) || SENSOR_HOTSPOTS[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#040814] via-[#060d21] to-[#040814] border-b border-border/10 py-24 px-6 md:px-12">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-teal-500/5 blur-[150px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-4"
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            KrishiAI IoT Hardware Ecosystem
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight"
          >
            Meet KrishiAI Smart Farm Hub
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-4 text-emerald-100/60 font-semibold text-sm max-w-2xl mx-auto leading-relaxed"
          >
            One Device. Complete Farm Intelligence. Monitor soil health, climate metrics, and disease risks via a smart hardware capsule linked directly with KrishiAI's prediction engines.
          </motion.p>
        </div>

        {/* ── Apple/Tesla 3D Showcase & Hotspots ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Interactive Mockup (Col 1-7) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setHovering3d(true)}
              onMouseLeave={() => {
                setHovering3d(false);
                setMousePos({ x: 0, y: 0 });
              }}
              style={{
                perspective: "1000px"
              }}
              className="relative w-full max-w-[500px] aspect-[4/3] flex items-center justify-center cursor-pointer select-none"
            >
              {/* Animated 3D Container */}
              <motion.div
                animate={{
                  rotateY: mousePos.x,
                  rotateX: mousePos.y,
                  scale: hovering3d ? 1.02 : 1
                }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                style={{
                  transformStyle: "preserve-3d",
                }}
                className="relative w-72 h-96 rounded-[40px] border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col items-center justify-between p-8"
              >
                {/* 3D Depth Elements */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60" />
                
                {/* Device Logo */}
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="h-5 w-5 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <Sprout className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">{t("hardware_showcase.krishiai_hub")}</span>
                </div>

                {/* OLED Display Interface */}
                <div className="w-full aspect-[2/1] rounded-2xl bg-black border border-white/5 p-3 flex flex-col justify-between font-mono shadow-inner text-emerald-400 relative">
                  {/* Subtle Screen Scanline Effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] rounded-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center text-[8px] opacity-75">
                    <span>{t("hardware_showcase.sys_ok")}</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      WIFI ON
                    </span>
                  </div>
                  
                  <div className="my-1.5 space-y-0.5">
                    <div className="text-xs font-black flex justify-between">
                      <span>{t("hardware_showcase.temp")}</span>
                      <span className="text-white">{liveTemp}°C</span>
                    </div>
                    <div className="text-xs font-black flex justify-between">
                      <span>{t("hardware_showcase.moist")}</span>
                      <span className="text-white">{liveMoisture}%</span>
                    </div>
                  </div>

                  <div className="text-[7px] text-center text-muted-foreground tracking-tighter uppercase">
                    Sync Status: Database 100%
                  </div>
                </div>

                {/* Status LED & Physical Probe Port Visuals */}
                <div className="flex justify-around w-full items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-glow-primary border border-emerald-400 animate-pulse" />
                    <span className="text-[6px] uppercase tracking-wider text-muted-foreground">{t("hardware_showcase.status")}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-blue-400" />
                    <span className="text-[6px] uppercase tracking-wider text-muted-foreground">{t("hardware_showcase.tx_link")}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-amber-500/50 border border-amber-400" />
                    <span className="text-[6px] uppercase tracking-wider text-muted-foreground">{t("hardware_showcase.power")}</span>
                  </div>
                </div>

                {/* Sub-cables extending downward */}
                <div className="flex gap-4 opacity-50 select-none">
                  <div className="w-1.5 h-8 bg-slate-700 rounded-b-md" />
                  <div className="w-1 h-12 bg-slate-800 rounded-b-md" />
                  <div className="w-1.5 h-8 bg-slate-700 rounded-b-md" />
                </div>
              </motion.div>

              {/* ── Floating Pulse Hotspots ── */}
              {SENSOR_HOTSPOTS.map((hotspot) => {
                const isActive = activeHotspot === hotspot.id;
                return (
                  <button
                    key={hotspot.id}
                    onClick={() => setActiveHotspot(hotspot.id)}
                    style={{
                      left: hotspot.x,
                      top: hotspot.y,
                    }}
                    className="absolute z-30 group -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  >
                    <span className="relative flex h-8 w-8 items-center justify-center">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping transition-all duration-300 ${isActive ? "bg-emerald-400" : "bg-white/20 group-hover:bg-emerald-400/50"}`} />
                      <span className={`relative inline-flex rounded-full h-3.5 w-3.5 shadow-md border border-white transition-all duration-300 ${isActive ? "bg-emerald-500 scale-125" : "bg-slate-900 group-hover:bg-emerald-400"}`} />
                    </span>
                    
                    {/* Floating Telemetry Tag */}
                    <div className={`absolute left-10 top-0 text-[10px] font-mono px-2 py-1 rounded bg-[#040814]/90 border text-emerald-400 border-white/10 shadow-lg pointer-events-none transition-all duration-300 ${isActive ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0"}`}>
                      {hotspot.data}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hotspot details (Col 8-12) */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHotspotData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel rounded-3xl p-6 md:p-8 border-emerald-500/10 shadow-xl relative"
              >
                <div className="absolute top-0 right-0 p-4 font-mono text-[9px] font-bold text-emerald-400 select-none">
                  {activeHotspotData.type}
                </div>
                
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t("hardware_showcase.sensor_details")}</span>
                <h3 className="text-2xl font-display font-black text-white mt-2 mb-4">{activeHotspotData.name}</h3>
                
                <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold mb-6">
                  {activeHotspotData.description}
                </p>

                <div className="bg-[#040814]/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center font-mono">
                  <div className="text-xs">
                    <span className="text-muted-foreground block text-[9px] uppercase tracking-wider mb-0.5">{t("hardware_showcase.live_diagnostic_stream")}</span>
                    <span className="text-emerald-400 font-bold">{activeHotspotData.data}</span>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2 text-[10px] text-muted-foreground font-mono">
                  {SENSOR_HOTSPOTS.map(h => (
                    <button
                      key={h.id}
                      onClick={() => setActiveHotspot(h.id)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${activeHotspot === h.id ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-[#040814]/30 border-white/5 hover:border-white/10 hover:text-white"}`}
                    >
                      {h.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Feature Cards Grid ── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{t("hardware_showcase.full_monitoring_suite")}</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
              Every critical agronomic parameter captured in a single integrated sensor node device.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="glass-panel hover:-translate-y-1 hover:shadow-2xl rounded-2xl p-6 border-white/[0.05] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold font-display text-white mb-1.5">{feat.title}</h4>
                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-semibold">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Benefits Section (Apple style cols) ── */}
        <div className="mb-24 rounded-3xl border border-white/[0.08] bg-slate-950/20 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center divide-y sm:divide-y-0 lg:divide-x divide-white/5">
            {BENEFITS.map((b, i) => (
              <div key={b.label} className={`pt-6 sm:pt-0 ${i > 0 ? "lg:pl-6" : ""}`}>
                <div className="text-4xl md:text-5xl font-black font-display bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">
                  {b.stat}
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">{b.label}</div>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-semibold max-w-[200px] mx-auto">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI + Hardware Ecosystem Flow Diagram ── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{t("hardware_showcase.edge_to_cloud_integration")}</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
              How the KrishiAI hardware interacts directly with our analytical layers.
            </p>
          </div>
          
          <div className="glass-panel rounded-3xl p-6 md:p-8 border-white/[0.06] shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center text-center relative z-10">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg text-white mb-3">
                  <Cpu className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{t("hardware_showcase.step_01")}</span>
                <h4 className="text-xs font-bold text-white mt-1">{t("hardware_showcase.esp32_node_reads")}</h4>
                <p className="text-[9px] text-muted-foreground mt-1 max-w-[150px] font-semibold leading-relaxed">{t("hardware_showcase.sensors_read_soil_moisture")}</p>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex justify-center text-emerald-500 animate-pulse">
                <ChevronRight className="h-6 w-6" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-[#040814] border border-white/10 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{t("hardware_showcase.step_02")}</span>
                <h4 className="text-xs font-bold text-white mt-1">{t("hardware_showcase.ingest_api_trigger")}</h4>
                <p className="text-[9px] text-muted-foreground mt-1 max-w-[150px] font-semibold leading-relaxed">WiFi transmits measurements to FastAPI `/api/sensor/ingest`.</p>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex justify-center text-emerald-500 animate-pulse">
                <ChevronRight className="h-6 w-6" />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#0ea5e9] flex items-center justify-center text-white mb-3 shadow-lg">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{t("hardware_showcase.step_03")}</span>
                <h4 className="text-xs font-bold text-white mt-1">{t("hardware_showcase.precision_analytics")}</h4>
                <p className="text-[9px] text-muted-foreground mt-1 max-w-[150px] font-semibold leading-relaxed">{t("hardware_showcase.krishiai_crop_soil_ml")}</p>
              </div>

            </div>
            
            {/* SVG Connector Line */}
            <div className="absolute inset-0 top-1/2 -translate-y-12 hidden md:block select-none opacity-20 pointer-events-none">
              <svg className="w-full h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 120 40 Q 220 10, 320 40 T 520 40" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Live Data Dashboard Preview ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-24">
          {/* Chart preview (Col 1-7) */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-6 border-white/[0.06] shadow-xl relative overflow-hidden bg-[#040814]/30">
              <div className="flex items-center justify-between mb-6 font-mono">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-white font-bold">{t("hardware_showcase.node_01_live_soil")}</span>
                </div>
                <span className="text-[9px] rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 animate-pulse">{t("hardware_showcase.live_stream")}</span>
              </div>
              
              {/* Pure SVG Line Chart */}
              <div className="relative w-full h-48 select-none">
                <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Chart Path logic */}
                  <path
                    d={`M ${chartData.map((d, i) => `${(i * 50) + 25} ${200 - (d * 2.5)}`).join(" L ")}`}
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`M 25 200 L ${chartData.map((d, i) => `${(i * 50) + 25} ${200 - (d * 2.5)}`).join(" L ")} L 475 200 Z`}
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Dynamic pulse points */}
                  {chartData.map((d, i) => (
                    <circle
                      key={i}
                      cx={(i * 50) + 25}
                      cy={200 - (d * 2.5)}
                      r="4"
                      className="fill-emerald-400 stroke-slate-950"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>
              </div>

              <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-4 border-t border-white/[0.04] pt-3">
                <span>{t("hardware_showcase.ticks_4s_intervals")}</span>
                <span>Moisture Level: {liveMoisture}%</span>
              </div>
            </div>
          </div>

          {/* Details (Col 8-12) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t("hardware_showcase.dashboard_sync")}</span>
            <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">{t("hardware_showcase.live_telemetry_hyper_local")}</h3>
            <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">
              The Smart Hub streams measurements straight into your KrishiAI cloud dashboard. Keep a continuous record of temperature spikes, frost limits, and dampness levels. Receive automated SMS recommendations whenever metrics shift.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/hardware">
                <button className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold hover:text-white transition-colors group">
                  Explore Hardware details
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Farmer Success Stories ── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{t("hardware_showcase.farmer_success_stories")}</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
              Read how Indian farming enterprises are achieving smarter yields using the Hub.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {SUCCESS_STORIES.map((story) => (
              <div
                key={story.name}
                className="glass-panel rounded-3xl p-6 md:p-8 border-white/[0.06] shadow-lg flex flex-col justify-between bg-card/15"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 stroke-transparent" />
                    ))}
                  </div>
                  <p className="text-xs italic text-muted-foreground/90 font-medium leading-relaxed mb-6">
                    "{story.text}"
                  </p>
                </div>
                
                <div className="flex items-center gap-3 border-t border-white/[0.04] pt-4">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow">
                    {story.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{story.name}</h4>
                    <span className="text-[9px] font-semibold text-emerald-400">{story.location} &middot; {story.crop}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Product Specifications ── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{t("hardware_showcase.technical_specifications")}</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
              Engineered using accessible, open-source industrial components.
            </p>
          </div>
          
          <div className="glass-panel rounded-3xl border-white/[0.06] shadow-xl overflow-hidden bg-card/5">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
              {SPECIFICATIONS.map((section) => (
                <div key={section.category} className="p-6 md:p-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">{section.category}</h4>
                  <div className="space-y-4">
                    {section.specs.map((spec) => (
                      <div key={spec.name} className="flex justify-between items-center text-xs border-b border-white/[0.02] pb-2 last:border-b-0">
                        <span className="text-muted-foreground font-semibold">{spec.name}</span>
                        <span className="text-white font-bold font-mono text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Buy & Request CTA Row ── */}
        <div className="rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 to-teal-500/2 p-8 md:p-14 text-center backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-emerald-400 select-none">
            IP65 Protected Capsule
          </div>
          
          <h3 className="text-2xl md:text-4xl font-display font-extrabold text-white leading-tight">{t("hardware_showcase.ready_to_upgrade_your")}</h3>
          <p className="mt-4 text-emerald-100/60 font-semibold text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Get the full blueprint to assemble your own hub for ₹1,200, or order a pre-assembled weatherproof capsule node directly from us.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/hardware#order">
              <button className="btn-primary flex items-center gap-2 group text-xs py-3">
                Buy Pre-Assembled Hub <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/hardware#inquiry">
              <button className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200">
                Request Field Demo
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
