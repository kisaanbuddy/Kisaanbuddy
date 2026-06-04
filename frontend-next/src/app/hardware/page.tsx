"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Cpu, Thermometer, Droplet, Sprout, Wind, Calendar,
  Smartphone, CloudRain, Sun, Check, Sparkles, Activity, Database,
  AlertTriangle, ShieldAlert, Mail, MessageCircle, HelpCircle,
  ChevronDown, ArrowUpRight, CheckCircle
} from "lucide-react";

// Types
type SensorKey = "airTemp" | "airHumidity" | "soilTemp" | "soilMoisture";

interface SensorSim {
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  val: number;
}

export default function HardwarePage() {
  // Update document title for SEO
  useEffect(() => {
    document.title = "KrishiAI Smart Farm Hub | Apple-Level Smart Farming Hardware";
  }, []);

  // Simulator State
  const [sensors, setSensors] = useState<Record<SensorKey, SensorSim>>({
    airTemp: { name: "Air Temperature", unit: "°C", min: 5, max: 48, step: 0.5, val: 27.5 },
    airHumidity: { name: "Air Humidity", unit: "%", min: 10, max: 100, step: 1, val: 62 },
    soilTemp: { name: "Soil Temperature", unit: "°C", min: 5, max: 40, step: 0.5, val: 24.5 },
    soilMoisture: { name: "Soil Moisture", unit: "%", min: 0, max: 100, step: 1, val: 42 }
  });

  const handleSimSlider = (key: SensorKey, val: number) => {
    setSensors(prev => ({
      ...prev,
      [key]: { ...prev[key], val }
    }));
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "",
    acres: "",
    message: "",
    interest: "buy" // buy | demo
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSubmitted(true);
      setFormData({ name: "", phone: "", state: "", acres: "", message: "", interest: "buy" });
    }, 1500);
  };

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const FAQS = [
    {
      q: "How does the KrishiAI Smart Farm Hub power itself?",
      a: "The device runs on a standard 5V micro-USB power input. In remote fields, it is commonly powered using a budget 10,000mAh USB power bank (which runs it for 4-5 days continuously) or connected to a small 5W solar-charging panel for perpetual off-grid operation."
    },
    {
      q: "Does it work without active internet or Wi-Fi?",
      a: "The hardware node uses a built-in Wi-Fi microchip (ESP32) to ingest readings directly to the KrishiAI cloud backend. If Wi-Fi is temporarily offline, the on-board OLED screen will still function to provide local, real-time diagnostic readings directly in the field."
    },
    {
      q: "How long will the capacitive moisture sensor last in wet soil?",
      a: "Unlike cheap resistive moisture probes (which use exposed metal that corrodes due to electrolysis within weeks), the KrishiAI Smart Farm Hub includes a Capacitive Moisture Sensor v2.0. This sensor is fully insulated, preventing chemical erosion and ensuring a lifespan of multiple years under wet soil."
    },
    {
      q: "How does the AI Crop Recommendation use this data?",
      a: "Once your device ID is registered, your Crop Predictor page gets a blue 'Read Live ESP32' button. Clicking it auto-fills the climate temperature and humidity sliders instantly from your physical field's live sensor database, guaranteeing highly localized agronomy recommendations."
    },
    {
      q: "Can I assemble this device myself?",
      a: "Yes! KrishiAI supports open-source IoT. We provide the complete Arduino wiring guide and firmware code for free (HARDWARE_SETUP.md). You can buy the off-the-shelf ESP32 board and sensors for around ₹1,200 total, program it, and link it with your account."
    }
  ];

  const INSTALLATION_STEPS = [
    {
      step: "01",
      title: "Capsule Placement",
      desc: "Mount the main weatherproof IP65 capsule above ground level on a simple wooden stake or fence post close to your focus crops."
    },
    {
      step: "02",
      title: "Embed Root Probes",
      desc: "Insert the waterproof stainless-steel temperature probe (DS18B20) and the insulated capacitive soil moisture sensor directly into the ground at the root zone (approx 4-6 inches deep)."
    },
    {
      step: "03",
      title: "Power Connection",
      desc: "Connect a micro-USB cable from the capsule bottom to your power source (a solar USB battery bank or phone charger adapter)."
    },
    {
      step: "04",
      title: "Wi-Fi Config",
      desc: "On first launch, enter your local router/hotspot credentials in the config, and watch the OLED screen connect and show 'Sync OK'!"
    }
  ];

  // NPK values calculated dynamically based on soil moisture and temp to show interactive ML simulation
  const mockNPK = {
    N: Math.max(10, Math.min(140, Math.round(sensors.soilMoisture.val * 1.8 + 10))),
    P: Math.max(10, Math.min(100, Math.round((100 - sensors.soilMoisture.val) * 0.9 + 15))),
    K: Math.max(10, Math.min(200, Math.round(sensors.soilTemp.val * 4 + 20)))
  };

  const getSimulatedRecommendation = () => {
    const moisture = sensors.soilMoisture.val;
    const temp = sensors.airTemp.val;
    if (moisture > 70) {
      if (temp > 28) return "Rice (Water Intensive)";
      return "Cotton";
    } else if (moisture > 40) {
      if (temp > 26) return "Maize / Corn";
      return "Wheat";
    } else {
      if (temp > 30) return "Millet (Jowar/Bajra)";
      return "Chickpeas / Gram";
    }
  };

  return (
    <div className="flex flex-col gap-0 -mt-10 md:-mt-14 -mx-4 md:-mx-8 overflow-x-hidden text-foreground bg-background">
      
      {/* ── IMMERSIVE HEADER HERO ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-b from-[#040814] via-[#060e22] to-[#040814] border-b border-white/[0.06] pt-20 pb-16">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] animate-blob-morph" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-12 w-full">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </Link>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-glow-primary">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              KrishiAI Smart Farm Hub
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
            Tesla-Grade Engineering.<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
              Built for the Fields.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            The KrishiAI Smart Farm Hub is an all-in-one weatherproof capsule integrating micro-climate sensors, grounding probes, and local diagnostics. It links seamlessly with cloud pipelines to feed real-time telemetry straight into crop recommenders and disease radars.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#order" className="btn-primary flex items-center gap-2 text-xs font-bold px-6 py-3 shadow-lg">
              Order Pre-Assembled Node <Check className="h-4 w-4" />
            </a>
            <a href="#simulator" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all">
              Live Sensor Simulator
            </a>
          </div>
        </div>
      </section>

      {/* ── PRODUCT OVERVIEW & SPECS ── */}
      <section className="py-24 px-6 md:px-12 bg-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            {/* Left description */}
            <div className="md:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Industrial Waterproofing</span>
              <h2 className="text-3xl font-extrabold text-white font-display">Weather-sealed IP65 Casing</h2>
              <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed font-semibold">
                Designed to survive extreme tropical weather, hot Indian summers, and heavy monsoon rains. The Smart Hub houses the ESP32 microchip inside an airtight capsule casing, routing cable ports through tight rubber seals pointing downwards to avoid any water accumulation.
              </p>
              
              <div className="space-y-4 pt-2">
                {[
                  "Built-in 2.4GHz Wi-Fi antenna with up to 100m open range",
                  "SSD1306 local OLED screen display for immediate telemetry checks",
                  "Low 5V power requirement — compatible with standard solar USB power banks",
                  "Corrosion-resistant capacitive moisture probe for multi-year earth embedding"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-muted-foreground/90 font-semibold">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right mock graphic */}
            <div className="md:col-span-6">
              <div className="glass-panel rounded-3xl p-8 border-white/[0.06] shadow-xl relative overflow-hidden bg-slate-900/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px]" />
                
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6 font-mono">SPECIFICATIONS LEDGER</h4>
                
                <div className="space-y-4 text-xs">
                  {[
                    { label: "Form Factor", val: "IP65 Weatherproof Sealed Capsule" },
                    { label: "Processor Unit", val: "ESP32 dual-core 32-bit CPU, 240MHz" },
                    { label: "Voltage/Power", val: "5V DC Micro-USB / 150mA Draw" },
                    { label: "Climate Probe", val: "DHT22 Sensor (Temp + Humidity Array)" },
                    { label: "Earth Probe", val: "DS18B20 Stainless Temperature Rod" },
                    { label: "Soil Water Sensor", val: "Capacitive Moisture v2.0 Insulated" },
                    { label: "Local Interface", val: "0.96\" Blue/Yellow I2C OLED Screen" }
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between border-b border-white/[0.04] pb-2 font-mono">
                      <span className="text-muted-foreground font-semibold">{s.label}</span>
                      <span className="text-white font-bold text-right">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── INTERACTIVE LIVE SENSOR SIMULATOR ── */}
      <section id="simulator" className="py-24 px-6 md:px-12 bg-gradient-to-b from-background via-slate-950/20 to-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl">
          
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-3">
              Developer Sandbox
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              Live Hardware Simulator
            </h2>
            <p className="mt-3 text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-semibold">
              Drag the sliders below to simulate different field environments and see how the Smart Hub telemetry adjusts the AI predictions in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Sliders (Col 1-6) */}
            <div className="lg:col-span-6 glass-panel rounded-3xl p-6 md:p-8 border-white/[0.06] flex flex-col justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6 font-mono">ADJUST SENSOR PROBES</h4>
              
              <div className="space-y-6">
                {(Object.keys(sensors) as SensorKey[]).map((key) => {
                  const s = sensors[key];
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-bold">{s.name}</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {s.val} {s.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={s.val}
                        onChange={(e) => handleSimSlider(key, parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.04] text-[10px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Sliders mimic voltage readouts converting to digital strings in ESP32 analog GPIO pins.</span>
              </div>
            </div>

            {/* Simulated Device Screen & AI prediction (Col 7-12) */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">
              
              {/* Device OLED Mock */}
              <div className="rounded-3xl bg-black border border-white/10 p-6 flex flex-col justify-between font-mono shadow-inner min-h-[160px] text-emerald-400 relative">
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] rounded-3xl pointer-events-none" />
                
                <div className="flex justify-between items-center text-[10px] opacity-75">
                  <span>SYNC: CONTINUOUS</span>
                  <span className="text-emerald-500 font-bold animate-pulse">● WIFI CONNECTED</span>
                </div>

                <div className="my-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>Air Temp: <span className="text-white">{sensors.airTemp.val}°C</span></div>
                  <div>Air Hum: <span className="text-white">{sensors.airHumidity.val}%</span></div>
                  <div>Soil Temp: <span className="text-white">{sensors.soilTemp.val}°C</span></div>
                  <div>Soil Moist: <span className="text-white">{sensors.soilMoisture.val}%</span></div>
                </div>

                <div className="text-[9px] text-center border-t border-emerald-500/10 pt-2 text-muted-foreground">
                  Ingesting: NPK [{mockNPK.N}, {mockNPK.P}, {mockNPK.K}] &middot; pH 6.5
                </div>
              </div>

              {/* AI Prediction result mock */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 border-emerald-500/15 shadow-xl flex-1 flex flex-col justify-between bg-emerald-500/[0.02]">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
                    <Sparkles className="h-4 w-4 animate-spin-slow" />
                    <span>Real-time Crop Recommendation</span>
                  </div>
                  <h4 className="text-3xl font-black font-display text-white mt-1">
                    {getSimulatedRecommendation()}
                  </h4>
                  <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed font-semibold">
                    Precision ML matches current climate moisture ({sensors.soilMoisture.val}%) and air temperature ({sensors.airTemp.val}°C) to historical dataset distributions to suggest this crop.
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/[0.04] mt-6">
                  <Link href="/crop-predictor" className="w-full">
                    <button className="w-full btn-primary py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md">
                      Go to Crop Predictor <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── AI PREDICTION WORKFLOW ── */}
      <section className="py-24 px-6 md:px-12 bg-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Precision Architecture</span>
          <h2 className="text-3xl font-extrabold text-white font-display mt-2 mb-16">Hardware-to-Model Data Pipeline</h2>
          
          <div className="grid gap-8 md:grid-cols-4 text-center relative">
            {[
              { icon: Cpu, title: "01. ESP32 Reads", desc: "Sensors capture grounding and atmospheric telemetry data blocks." },
              { icon: Database, title: "02. Ingests API", desc: "Built-in Wi-Fi client fires payload JSON to backend `/api/sensor/ingest`." },
              { icon: Activity, title: "03. Model Processing", desc: "Precision recommendation logic loads telemetry to calculate suitabilities." },
              { icon: Smartphone, title: "04. Dashboard View", desc: "Farmer views results and receives notifications instantly in their language." }
            ].map((step, i) => (
              <div key={step.title} className="flex flex-col items-center bg-slate-900/10 border border-white/[0.03] p-6 rounded-2xl relative z-10 backdrop-blur-sm">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow shadow-emerald-500/10 mb-4">
                  <step.icon className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-white">{step.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-2 font-semibold leading-relaxed max-w-[170px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEP-BY-STEP INSTALLATION GUIDE ── */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-background via-slate-950/20 to-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Setup Guide</span>
            <h2 className="text-3xl font-extrabold text-white font-display mt-2">Installation Process</h2>
            <p className="mt-2 text-xs text-muted-foreground/80 font-semibold max-w-md mx-auto">
              Setting up the hub takes less than 30 minutes. No specialized engineering skills required.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {INSTALLATION_STEPS.map((s) => (
              <div key={s.step} className="glass-panel rounded-2xl p-6 border-white/[0.05] relative overflow-hidden bg-[#040814]/15">
                <div className="text-4xl font-display font-black text-emerald-500/10 absolute top-0 right-0 p-2 select-none">
                  {s.step}
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">Step {s.step}</span>
                <h4 className="text-sm font-bold text-white font-display mb-2">{s.title}</h4>
                <p className="text-[11px] text-muted-foreground/85 leading-relaxed font-semibold">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE FAQ SECTION ── */}
      <section className="py-24 px-6 md:px-12 bg-background border-b border-white/[0.05]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Common Questions</span>
            <h2 className="text-3xl font-extrabold text-white font-display mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="glass-panel rounded-2xl border-white/[0.05] overflow-hidden bg-card/5"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                  >
                    <span className="text-xs md:text-sm font-bold text-white pr-4">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-emerald-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-xs text-muted-foreground/80 leading-relaxed font-semibold border-t border-white/[0.03] pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DUAL INQUIRY / ORDER FORM & WHATSAPP ── */}
      <section id="order" className="py-24 px-6 md:px-12 bg-gradient-to-t from-[#040814] to-background">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Inquiry Form (Col 1-7) */}
            <div id="inquiry" className="lg:col-span-7">
              <div className="glass-panel rounded-3xl p-6 md:p-8 border-emerald-500/10 shadow-2xl relative bg-[#040814]/40">
                <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-emerald-400 select-none">
                  Pre-Order Form
                </div>
                
                <h3 className="text-2xl font-extrabold text-white font-display mb-2">Request Hardware Inquiry</h3>
                <p className="text-xs text-muted-foreground/85 font-semibold mb-6">
                  Fill in your details, and our local operations team will contact you to help configure or dispatch a Hub.
                </p>

                <AnimatePresence mode="wait">
                  {formSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Inquiry Received Successfully</h4>
                      <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto leading-relaxed">
                        Thank you for contacting KrishiAI. Our support desk (PP) or operations lead (RS) will connect with you shortly via mobile.
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="mt-2 text-xs text-emerald-400 hover:underline focus:outline-none"
                      >
                        Submit another request
                      </button>
                    </motion.div>
                  ) : (
                    <form key="form" onSubmit={handleFormSubmit} className="space-y-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Suresh Patel"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">WhatsApp / Mobile No</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +91 99999 99999"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">State / Region</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Gujarat"
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">Farm Size (Acres)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 5"
                            value={formData.acres}
                            onChange={(e) => setFormData(prev => ({ ...prev, acres: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Type of Request</label>
                        <select
                          value={formData.interest}
                          onChange={(e) => setFormData(prev => ({ ...prev, interest: e.target.value }))}
                          className="select-base text-xs bg-slate-950/40 text-foreground"
                        >
                          <option value="buy" className="bg-slate-950">Pre-Order Pre-assembled Smart Hub (₹1,200 blueprint/casing)</option>
                          <option value="demo" className="bg-slate-950">Request Field Demonstration & Setup Assistance</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Message</label>
                        <textarea
                          rows={3}
                          placeholder="Tell us about your soil type, water source, or crop focus..."
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          className="input-base text-xs bg-slate-950/40"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full btn-primary py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 hover:shadow-glow-primary active:scale-[0.98]"
                      >
                        {formLoading ? "Sending Inquiry..." : "Submit Inquiry Details"}
                      </button>

                    </form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* WhatsApp Inquiry Option (Col 8-12) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Direct Chat Inquiry</span>
              <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">Instant Inquiries via WhatsApp</h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">
                Want immediate feedback? Connect directly with our operations desk on WhatsApp. We can assist with wiring setups, component queries, or ship a pre-built casing directly to your address.
              </p>
              
              <a
                href="https://wa.me/919999999999?text=Hi%20KrishiAI%20team,%20I%20am%20interested%20in%20the%20KrishiAI%20Smart%20Farm%20Hub.%20Please%20send%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-4 shadow-lg shadow-emerald-500/15 hover:shadow-glow-primary active:scale-95 transition-all text-xs w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5 fill-white stroke-transparent" />
                <span>WhatsApp Inquiry Chat</span>
              </a>
              
              <div className="pt-4 border-t border-white/[0.04] space-y-2">
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  Support Team Available: <strong className="text-white">Mon - Sat (9 AM - 6 PM)</strong>
                </div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  Blueprints covered by the GPL Open Source license.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
