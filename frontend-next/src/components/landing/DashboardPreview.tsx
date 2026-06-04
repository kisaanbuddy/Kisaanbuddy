'use client';

import { useState } from 'react';
import { Sprout, Bug, TrendingUp, CloudSun, Check, Sparkles, Upload, AlertCircle, Play, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'predictor', label: 'Crop Predictor', icon: Sprout },
  { id: 'detector', label: 'Disease Detector', icon: Bug },
  { id: 'mandi', label: 'Market Analytics', icon: TrendingUp },
  { id: 'weather', label: 'Weather Dashboard', icon: CloudSun },
];

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('predictor');

  return (
    <section className="py-20 bg-background relative overflow-hidden border-b border-border/20">
      
      {/* Decorative Blob */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Interactive Showcase
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground">
            Explore the <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">KrishiAI Dashboard</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-semibold">
            Click through our active modules to preview our interface and simulated AI analysis features.
          </p>
        </div>

        {/* Dynamic Tab Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 bg-muted/20 border border-border/20 p-1.5 rounded-2xl w-fit mx-auto backdrop-blur-sm select-none">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
                  ${active 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Frame */}
        <div className="rounded-3xl border border-border/40 bg-card/30 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-between h-full"
            >
              
              {/* Tab 1: Crop Predictor */}
              {activeTab === 'predictor' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mx-auto lg:mx-0">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">Soil Chemistry Optimizer</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      Input your N-P-K chemical levels, pH balance, organic carbon content, and land coordinates. KrishiAI crosses these with climate projections to output optimal crop choices.
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Dynamic crop suggestions</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Fertilizer ratio reports</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 select-none">
                      <Sparkles className="h-3.5 w-3.5" /> Soil Predictor Engine
                    </h4>
                    
                    <div className="grid gap-3 grid-cols-3 text-[10px] font-bold text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span>Nitrogen (N)</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">92 mg/kg</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>Phosphorus (P)</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">48 mg/kg</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>Potassium (K)</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">205 mg/kg</div>
                      </div>
                    </div>

                    <div className="grid gap-3 grid-cols-2 text-[10px] font-bold text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span>Soil pH</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">6.4 (Slightly Acidic)</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>Organic Carbon (OC)</span>
                        <div className="bg-muted p-2 rounded-lg text-foreground font-mono">0.65% (Medium)</div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm">🌾</div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Top Suggestion</span>
                          <span className="text-xs font-extrabold text-foreground">Premium Basmati Rice</span>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold">98% Fit Score</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Disease Detector */}
              {activeTab === 'detector' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 mx-auto lg:mx-0">
                      <Bug className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">Crop Leaf Pathology AI</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      Identify plant sicknesses immediately. Upload leaf photos of potato, tomato, cotton, or wheat. Our model processes details to recognize pathogen spots and outline a targeted cure.
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Organic spray remedies</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Chemical dosage controls</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 select-none">
                      <AlertCircle className="h-3.5 w-3.5" /> leaf diagnosis console
                    </h4>

                    <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-muted/10 relative overflow-hidden select-none min-h-[120px]">
                      {/* Leaf scanning animation representation */}
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/40 animate-pulse" />
                      <Upload className="h-6 w-6 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground font-bold">leaf_tomato_spot.png uploaded</span>
                      <span className="text-[9px] text-emerald-500 font-extrabold uppercase">Analyzing features...</span>
                    </div>

                    <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-foreground">Tomato Early Blight</span>
                          <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/10 px-2 py-0.5 rounded-full font-black">HIGH CONCERN</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold">Accuracy: 94.7%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                        <strong>Remedy Suggestion:</strong> Spray Copper Oxychloride (2.5g/L water) or apply organic neem leaf extracts directly onto the stems to arrest fungal propagation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Market Analytics */}
              {activeTab === 'mandi' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mx-auto lg:mx-0">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">APMC Mandi Price Alerts</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      Never sell under value. Monitor active mandi quotes across Indian markets, analyze crop price surges, and configure SMS alerts when prices hit your goals.
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Target alerts configuration</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Price trend insights</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 select-none">
                      <TrendingUp className="h-3.5 w-3.5" /> Live APMC rates (Potato)
                    </h4>

                    {/* Mock mandi list */}
                    <div className="space-y-2 text-[10px] font-semibold text-muted-foreground">
                      {[
                        { mandi: "Agra Mandi, UP", current: "₹1,850/Quintal", change: "+₹50 today", trend: "up" },
                        { mandi: "Patna APMC, Bihar", current: "₹1,920/Quintal", change: "+₹80 today", trend: "up" },
                        { mandi: "Pune APMC, Maharashtra", current: "₹2,100/Quintal", change: "+₹120 today", trend: "up" },
                      ].map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-muted/40 p-2.5 rounded-xl border border-border/20">
                          <div>
                            <span className="text-foreground font-bold">{m.mandi}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-foreground font-extrabold">{m.current}</span>
                            <span className="block text-[8px] text-emerald-500 font-extrabold">{m.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                      <div className="flex items-center gap-2.5">
                        <Bell className="h-4 w-4 text-amber-500" />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase text-muted-foreground font-bold">Active target alert</span>
                          <span className="text-xs font-bold text-foreground">Alert when Potato exceeds ₹2,000/Q</span>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">ACTIVE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Weather Dashboard */}
              {activeTab === 'weather' && (
                <div className="grid gap-8 lg:grid-cols-5 items-center">
                  <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 mx-auto lg:mx-0">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-foreground">Hyperlocal Weather Advisories</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      Integrates weather API feeds directly with crop stages to alert you when severe wind, high heat, or sudden rain threatens pesticide cycles or harvesting timelines.
                    </p>
                    <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground text-left max-w-xs mx-auto lg:mx-0 pt-2">
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 7-day weather prediction</div>
                      <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Severe event warnings</div>
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="lg:col-span-3 rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5 select-none">
                      <CloudSun className="h-3.5 w-3.5" /> Weather Alert console
                    </h4>

                    <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/20">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">⛈️</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">Heavy Thunderstorms Expected</span>
                          <span className="text-[9px] text-muted-foreground font-semibold">Commencing in 14 hours (Estimated 45mm rain)</span>
                        </div>
                      </div>
                      <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-red-500/20 select-none animate-pulse">WARNING</span>
                    </div>

                    <div className="rounded-xl bg-sky-500/5 border border-sky-500/20 p-3.5">
                      <span className="text-[9px] font-extrabold uppercase text-sky-500 block mb-1">Crop specific advisory</span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                        <strong>Wheat:</strong> Do not apply liquid urea fertilizers or run irrigation channels within the next 24 hours. Storm water runoff will wash nutrients away and cause soil stagnation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
