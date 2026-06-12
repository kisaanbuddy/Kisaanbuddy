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
import { useLanguage } from "@/lib/language";

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
  const { lang, t } = useLanguage();

  // Update document title for SEO
  useEffect(() => {
    document.title = t("hardware.krishiai_smart_farm_hub");
  }, [lang]);

  // Simulator State
  const [sensors, setSensors] = useState<Record<SensorKey, SensorSim>>({
    airTemp: { name: "Air Temperature", unit: "°C", min: 5, max: 48, step: 0.5, val: 27.5 },
    airHumidity: { name: "Air Humidity", unit: "%", min: 10, max: 100, step: 1, val: 62 },
    soilTemp: { name: "Soil Temperature", unit: "°C", min: 5, max: 40, step: 0.5, val: 24.5 },
    soilMoisture: { name: "Soil Moisture", unit: "%", min: 0, max: 100, step: 1, val: 42 }
  });

  const getSensorName = (key: SensorKey) => {
    if (key === "airTemp") return t("hardware.air_temperature");
    if (key === "airHumidity") return t("hardware.air_humidity");
    if (key === "soilTemp") return t("hardware.soil_temperature");
    return t("hardware.soil_moisture");
  }

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
      q: t("hardware.how_does_the_krishiai"),
      a: t("hardware.the_device_runs_on")},
    {
      q: t("hardware.does_it_work_without"),
      a: t("hardware.the_hardware_node_uses")},
    {
      q: t("hardware.how_long_will_the"),
      a: t("hardware.unlike_cheap_resistive_moisture")},
    {
      q: t("hardware.how_does_the_ai"),
      a: t("hardware.once_your_device_id")},
    {
      q: t("hardware.can_i_assemble_this"),
      a: t("hardware.yes_krishiai_supports_open")}
  ];

  const INSTALLATION_STEPS = [
    {
      step: "01",
      title: t("hardware.capsule_placement"),
      desc: t("hardware.mount_the_main_weatherproof")},
    {
      step: "02",
      title: t("hardware.embed_root_probes"),
      desc: t("hardware.insert_the_waterproof_stainless")},
    {
      step: "03",
      title: t("hardware.power_connection"),
      desc: t("hardware.connect_a_micro_usb")},
    {
      step: "04",
      title: t("hardware.wi_fi_config"),
      desc: t("hardware.on_first_launch_enter")}
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
      if (temp > 28) return t("hardware.rice_water_intensive");
      return t("hardware.cotton");
    } else if (moisture > 40) {
      if (temp > 26) return t("hardware.maize_corn");
      return t("hardware.wheat");
    } else {
      if (temp > 30) return t("hardware.millet_jowar_bajra");
      return t("hardware.chickpeas_gram");
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
            <span>{t("hardware.back_to_home")}</span>
          </Link>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-glow-primary">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              {t("hardware.krishiai_smart_farm_hub")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
            {t("hardware.tesla_grade_engineering")}<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
              {t("hardware.built_for_the_fields")}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            {t("hardware.the_krishiai_smart_farm")}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#order" className="btn-primary flex items-center gap-2 text-xs font-bold px-6 py-3 shadow-lg">
              {t("hardware.order_pre_assembled_node")} <Check className="h-4 w-4" />
            </a>
            <a href="#simulator" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all">
              {t("hardware.live_sensor_simulator")}
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t("hardware.industrial_waterproofing")}</span>
              <h2 className="text-3xl font-extrabold text-white font-display">{t("hardware.weather_sealed_ip65_casing")}</h2>
              <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed font-semibold">
                {t("hardware.designed_to_survive_extreme")}
              </p>
              
              <div className="space-y-4 pt-2">
                {[
                  t("hardware.built_in_2_4ghz"),
                  t("hardware.ssd1306_local_oled_screen"),
                  t("hardware.low_5v_power_requirement"),
                  t("hardware.corrosion_resistant_capacitive_moisture")].map((item) => (
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
                
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6 font-mono">{t("hardware.specifications_ledger")}</h4>
                
                <div className="space-y-4 text-xs">
                  {[
                    { label: t("hardware.form_factor"), val: t("hardware.ip65_weatherproof_sealed_capsule")},
                    { label: t("hardware.processor_unit"), val: "ESP32 dual-core 32-bit CPU, 240MHz" },
                    { label: t("hardware.voltage_power"), val: "5V DC Micro-USB / 150mA Draw" },
                    { label: t("hardware.climate_probe"), val: "DHT22 Sensor (Temp + Humidity Array)" },
                    { label: t("hardware.earth_probe"), val: "DS18B20 Stainless Temperature Rod" },
                    { label: t("hardware.soil_water_sensor"), val: "Capacitive Moisture v2.0 Insulated" },
                    { label: t("hardware.local_interface"), val: "0.96\" Blue/Yellow I2C OLED Screen" }
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
              {t("hardware.developer_sandbox")}
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white">
              {t("hardware.live_hardware_simulator")}
            </h2>
            <p className="mt-3 text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-semibold">
              {t("hardware.drag_the_sliders_below")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Sliders (Col 1-6) */}
            <div className="lg:col-span-6 glass-panel rounded-3xl p-6 md:p-8 border-white/[0.06] flex flex-col justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6 font-mono">{t("hardware.adjust_sensor_probes")}</h4>
              
              <div className="space-y-6">
                {(Object.keys(sensors) as SensorKey[]).map((key) => {
                  const s = sensors[key];
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-bold">{getSensorName(key)}</span>
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
                <span>{t("hardware.sliders_mimic_voltage_readouts")}</span>
              </div>
            </div>

            {/* Simulated Device Screen & AI prediction (Col 7-12) */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">
              
              {/* Device OLED Mock */}
              <div className="rounded-3xl bg-black border border-white/10 p-6 flex flex-col justify-between font-mono shadow-inner min-h-[160px] text-emerald-400 relative">
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] rounded-3xl pointer-events-none" />
                
                <div className="flex justify-between items-center text-[10px] opacity-75">
                  <span>{t("hardware.sync_continuous")}</span>
                  <span className="text-emerald-500 font-bold animate-pulse">{t("hardware.wifi_connected")}</span>
                </div>

                <div className="my-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>{t("hardware.air_temp")}<span className="text-white">{sensors.airTemp.val}°C</span></div>
                  <div>{t("hardware.air_hum")}<span className="text-white">{sensors.airHumidity.val}%</span></div>
                  <div>{t("hardware.soil_temp")}<span className="text-white">{sensors.soilTemp.val}°C</span></div>
                  <div>{t("hardware.soil_moist")}<span className="text-white">{sensors.soilMoisture.val}%</span></div>
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
                    <span>{t("hardware.real_time_crop_recommendation")}</span>
                  </div>
                  <h4 className="text-3xl font-black font-display text-white mt-1">
                    {getSimulatedRecommendation()}
                  </h4>
                  <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed font-semibold">
                    {t("hardware.precision_ml_matches_current")}
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/[0.04] mt-6">
                  <Link href="/crop-predictor" className="w-full">
                    <button className="w-full btn-primary py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md">
                      {t("hardware.go_to_crop_predictor")} <ArrowUpRight className="h-4 w-4" />
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t("hardware.precision_architecture")}</span>
          <h2 className="text-3xl font-extrabold text-white font-display mt-2 mb-16">{t("hardware.hardware_to_model_data")}</h2>
          
          <div className="grid gap-8 md:grid-cols-4 text-center relative">
            {[
              { icon: Cpu, title: t("hardware.01_esp32_reads"), desc: t("hardware.sensors_capture_grounding_and")},
              { icon: Database, title: t("hardware.02_ingests_api"), desc: t("hardware.built_in_wi_fi")},
              { icon: Activity, title: t("hardware.03_model_processing"), desc: t("hardware.precision_recommendation_logic_loads")},
              { icon: Smartphone, title: t("hardware.04_dashboard_view"), desc: t("hardware.farmer_views_results_and")}
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t("hardware.setup_guide")}</span>
            <h2 className="text-3xl font-extrabold text-white font-display mt-2">{t("hardware.installation_process")}</h2>
            <p className="mt-2 text-xs text-muted-foreground/80 font-semibold max-w-md mx-auto">
              {t("hardware.setting_up_the_hub")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {INSTALLATION_STEPS.map((s) => (
              <div key={s.step} className="glass-panel rounded-2xl p-6 border-white/[0.05] relative overflow-hidden bg-[#040814]/15">
                <div className="text-4xl font-display font-black text-emerald-500/10 absolute top-0 right-0 p-2 select-none">
                  {s.step}
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">{t("hardware.step_s_step")}</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t("hardware.common_questions")}</span>
            <h2 className="text-3xl font-extrabold text-white font-display mt-2">{t("hardware.frequently_asked_questions")}</h2>
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
                  {t("hardware.pre_order_form")}
                </div>
                
                <h3 className="text-2xl font-extrabold text-white font-display mb-2">{t("hardware.request_hardware_inquiry")}</h3>
                <p className="text-xs text-muted-foreground/85 font-semibold mb-6">
                  {t("hardware.fill_in_your_details")}
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
                      <h4 className="text-sm font-bold text-white">{t("hardware.inquiry_received_successfully")}</h4>
                      <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto leading-relaxed">
                        {t("hardware.thank_you_for_contacting")}
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="mt-2 text-xs text-emerald-400 hover:underline focus:outline-none"
                      >
                        {t("hardware.submit_another_request")}
                      </button>
                    </motion.div>
                  ) : (
                    <form key="form" onSubmit={handleFormSubmit} className="space-y-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("hardware.full_name")}</label>
                          <input
                            type="text"
                            required
                            placeholder={t("hardware.e_g_suresh_patel")}
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("hardware.whatsapp_mobile_no")}</label>
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
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("hardware.state_region")}</label>
                          <input
                            type="text"
                            required
                            placeholder={t("hardware.e_g_gujarat")}
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("hardware.farm_size_acres")}</label>
                          <input
                            type="number"
                            required
                            placeholder={t("hardware.e_g_5")}
                            value={formData.acres}
                            onChange={(e) => setFormData(prev => ({ ...prev, acres: e.target.value }))}
                            className="input-base text-xs bg-slate-950/40"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("hardware.type_of_request")}</label>
                        <select
                          value={formData.interest}
                          onChange={(e) => setFormData(prev => ({ ...prev, interest: e.target.value }))}
                          className="select-base text-xs bg-slate-950/40 text-foreground"
                        >
                          <option value="buy" className="bg-slate-950">{t("hardware.pre_order_pre_assembled")}</option>
                          <option value="demo" className="bg-slate-950">{t("hardware.request_field_demonstration_setup")}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("hardware.message")}</label>
                        <textarea
                          rows={3}
                          placeholder={t("hardware.tell_us_about_your")}
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
                        {formLoading 
                          ? t("hardware.sending_inquiry") 
                          : t("hardware.submit_inquiry_details")}
                      </button>

                    </form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* WhatsApp Inquiry Option (Col 8-12) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t("hardware.direct_chat_inquiry")}</span>
              <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight">{t("hardware.instant_inquiries_via_whatsapp")}</h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">
                {t("hardware.want_immediate_feedback_connect")}
              </p>
              
              <a
                href="https://wa.me/919999999999?text=Hi%20KrishiAI%20team,%20I%20am%20interested%20in%20the%20KrishiAI%20Smart%20Farm%20Hub.%20Please%20send%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-4 shadow-lg shadow-emerald-500/15 hover:shadow-glow-primary active:scale-95 transition-all text-xs w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5 fill-white stroke-transparent" />
                <span>{t("hardware.whatsapp_inquiry_chat")}</span>
              </a>
              
              <div className="pt-4 border-t border-white/[0.04] space-y-2">
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  {t("hardware.support_team_available_mon")}
                </div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  {t("hardware.blueprints_covered_by_the")}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
