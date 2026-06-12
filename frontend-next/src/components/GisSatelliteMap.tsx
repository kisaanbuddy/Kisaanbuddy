"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Map, Layers, RefreshCw, CheckCircle2, ShieldAlert, Droplets, CloudSun, Compass, Eye } from "lucide-react"
import { useLanguage } from "@/lib/language"

type FieldData = {
  id: string
  name: string
  crop: string
  area: string
  health: number
  moisture: number
  nitrogen: number
  phosphorus: number
  potassium: number
  status: "Excellent" | "Warning" | "Critical"
}

const INITIAL_FIELDS: FieldData[] = [
  { id: "A", name: "Field North-A", crop: "Wheat", area: "1.8 Hectares", health: 94, moisture: 48, nitrogen: 90, phosphorus: 45, potassium: 200, status: "Excellent" },
  { id: "B", name: "Field North-B", crop: "Cotton", area: "1.2 Hectares", health: 81, moisture: 38, nitrogen: 75, phosphorus: 40, potassium: 180, status: "Warning" },
  { id: "C", name: "Field South-C", crop: "Paddy", area: "2.4 Hectares", health: 96, moisture: 72, nitrogen: 105, phosphorus: 50, potassium: 220, status: "Excellent" },
  { id: "D", name: "Field West-D", crop: "Potato", area: "0.9 Hectares", health: 45, moisture: 22, nitrogen: 50, phosphorus: 30, potassium: 140, status: "Critical" },
]

export default function GisSatelliteMap() {
  const { t, lang } = useLanguage()
  const [activeLayer, setLayer] = useState<"satellite" | "ndvi" | "moisture" | "weather">("satellite")
  const [selectedField, setSelectedField] = useState<FieldData>(INITIAL_FIELDS[0])
  const [scanning, setScanning] = useState(false)
  const [fields, setFields] = useState<FieldData[]>(INITIAL_FIELDS)
  const [scanTimestamp, setScanTimestamp] = useState<string>("Active")

  function handleScan() {
    if (scanning) return
    setScanning(true)
    setTimeout(() => {
      // Slightly adjust values to simulate real-time telemetry changes
      const updated = fields.map(f => {
        const delta = Math.floor(Math.random() * 5) - 2 // -2 to +2
        const nextHealth = Math.max(10, Math.min(100, f.health + delta))
        const nextMoisture = Math.max(5, Math.min(100, f.moisture + (Math.floor(Math.random() * 7) - 3)))
        let status: FieldData["status"] = "Excellent"
        if (nextHealth < 60) status = "Critical"
        else if (nextHealth < 85) status = "Warning"
        return {
          ...f,
          health: nextHealth,
          moisture: nextMoisture,
          status,
        }
      })
      setFields(updated)
      setSelectedField(prev => updated.find(f => f.id === prev.id) || updated[0])
      setScanning(false)
      const now = new Date()
      setScanTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 4000)
  }

  // Get field SVG color based on selected layer
  function getFieldFill(field: FieldData) {
    const isSelected = selectedField.id === field.id
    
    if (activeLayer === "satellite") {
      return isSelected 
        ? "rgba(16, 185, 129, 0.25)" 
        : "rgba(16, 185, 129, 0.12)"
    }
    
    if (activeLayer === "ndvi") {
      // NDVI Color: Dark Green = Excellent, Yellow = Warning, Red = Critical
      if (field.status === "Excellent") return isSelected ? "rgba(34, 197, 94, 0.5)" : "rgba(34, 197, 94, 0.3)"
      if (field.status === "Warning") return isSelected ? "rgba(234, 179, 8, 0.5)" : "rgba(234, 179, 8, 0.3)"
      return isSelected ? "rgba(239, 68, 68, 0.5)" : "rgba(239, 68, 68, 0.3)"
    }
    
    if (activeLayer === "moisture") {
      // Soil moisture: Blue gradients
      if (field.moisture > 60) return isSelected ? "rgba(59, 130, 246, 0.5)" : "rgba(59, 130, 246, 0.3)"
      if (field.moisture > 35) return isSelected ? "rgba(96, 165, 250, 0.4)" : "rgba(96, 165, 250, 0.2)"
      return isSelected ? "rgba(147, 197, 253, 0.3)" : "rgba(147, 197, 253, 0.15)"
    }
    
    if (activeLayer === "weather") {
      // Weather: White clouds overlay
      return isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.12)"
    }
    
    return "rgba(255, 255, 255, 0.1)"
  }

  function getFieldStroke(field: FieldData) {
    if (selectedField.id === field.id) {
      return activeLayer === "ndvi" 
        ? (field.status === "Excellent" ? "#22c55e" : field.status === "Warning" ? "#eab308" : "#ef4444")
        : "#10b981"
    }
    return "rgba(255, 255, 255, 0.15)"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* SVG GIS Map Console (2 cols) */}
      <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 backdrop-blur-md flex flex-col justify-between relative overflow-hidden min-h-[400px]">
        {/* Layer background representation */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03]">
          <div className="w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Top Control Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-4 select-none">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400 animate-spin-slow" />
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-white">GIS Space-Telemetry</h3>
              <p className="text-[9px] text-muted-foreground font-semibold">Orbits: Sentinel-2A / Landsat-9</p>
            </div>
          </div>
          
          {/* Layer Selector */}
          <div className="flex rounded-xl border border-white/[0.08] bg-slate-950/60 p-1 gap-0.5">
            {[
              { id: "satellite", label: "RGB Satellite", icon: Map },
              { id: "ndvi", label: "NDVI Health", icon: Eye },
              { id: "moisture", label: "Soil Water", icon: Droplets },
              { id: "weather", label: "Cloud Radar", icon: CloudSun },
            ].map(l => {
              const Icon = l.icon
              const active = activeLayer === l.id
              return (
                <button
                  key={l.id}
                  onClick={() => setLayer(l.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                    active 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/15" 
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{l.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div className="relative flex-1 min-h-[280px] bg-slate-950/70 border border-white/[0.04] rounded-2xl overflow-hidden flex items-center justify-center">
          
          {/* Satellite Map Vector Drawing */}
          <svg className="w-full h-full max-w-[450px] max-h-[250px] relative z-10" viewBox="0 0 400 200">
            {/* Field A */}
            <path
              d="M 50 30 L 180 30 L 150 110 L 40 95 Z"
              fill={getFieldFill(fields[0])}
              stroke={getFieldStroke(fields[0])}
              strokeWidth={selectedField.id === "A" ? 2.5 : 1}
              className="cursor-pointer transition-all duration-300 hover:fill-emerald-500/30"
              onClick={() => setSelectedField(fields[0])}
            />
            {/* Field B */}
            <path
              d="M 190 30 L 320 40 L 290 100 L 160 110 Z"
              fill={getFieldFill(fields[1])}
              stroke={getFieldStroke(fields[1])}
              strokeWidth={selectedField.id === "B" ? 2.5 : 1}
              className="cursor-pointer transition-all duration-300 hover:fill-emerald-500/30"
              onClick={() => setSelectedField(fields[1])}
            />
            {/* Field C */}
            <path
              d="M 45 105 L 145 120 L 115 180 L 30 170 Z"
              fill={getFieldFill(fields[2])}
              stroke={getFieldStroke(fields[2])}
              strokeWidth={selectedField.id === "C" ? 2.5 : 1}
              className="cursor-pointer transition-all duration-300 hover:fill-emerald-500/30"
              onClick={() => setSelectedField(fields[2])}
            />
            {/* Field D */}
            <path
              d="M 155 120 L 285 110 L 265 180 L 125 180 Z"
              fill={getFieldFill(fields[3])}
              stroke={getFieldStroke(fields[3])}
              strokeWidth={selectedField.id === "D" ? 2.5 : 1}
              className="cursor-pointer transition-all duration-300 hover:fill-emerald-500/30"
              onClick={() => setSelectedField(fields[3])}
            />
            
            {/* Field Labels */}
            <text x="90" y="65" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">A: Wheat</text>
            <text x="230" y="75" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">B: Cotton</text>
            <text x="80" y="145" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">C: Paddy</text>
            <text x="195" y="150" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">D: Potato</text>
            
            {/* Wind Vector Arrows overlay (for cloud layer) */}
            {activeLayer === "weather" && (
              <g className="opacity-80 pointer-events-none">
                <line x1="80" y1="50" x2="110" y2="40" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 110 40 L 104 37 M 110 40 L 106 45" stroke="#fff" strokeWidth="1" />
                <line x1="240" y1="120" x2="270" y2="110" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 270 110 L 264 107 M 270 110 L 266 115" stroke="#fff" strokeWidth="1" />
              </g>
            )}
          </svg>
          
          {/* Animated Laser Scan line */}
          {scanning && <div className="sat-scan-line" />}
          
          {/* Legend indicator */}
          <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-slate-900/80 border border-white/[0.06] rounded-lg px-2.5 py-1 text-[8px] text-white font-bold select-none backdrop-blur-sm z-20">
            {activeLayer === "satellite" && <span>🟩 Normal Boundaries</span>}
            {activeLayer === "ndvi" && (
              <div className="flex gap-2.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy NDVI</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Dry/Stressed</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Fungal Risk</span>
              </div>
            )}
            {activeLayer === "moisture" && (
              <div className="flex gap-2.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Saturated</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-300" /> Optimal</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-100" /> Arid</span>
              </div>
            )}
            {activeLayer === "weather" && <span>⛅ Simulated Cloud Vector Scan</span>}
          </div>
        </div>

        {/* Bottom diagnostic row */}
        <div className="relative z-10 flex items-center justify-between gap-4 mt-4 select-none">
          <span className="text-[10px] text-muted-foreground font-semibold">Telemetry Feed: <strong className="text-white">{scanTimestamp}</strong></span>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider px-3.5 py-2 shadow-md disabled:opacity-60 transition-all active:scale-95"
          >
            <RefreshCw className={`h-3 w-3 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Calibrating Space Sensors..." : "Trigger Satellite Scan"}
          </button>
        </div>
      </div>

      {/* Field Telemetry ledger (1 col) */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 backdrop-blur-md flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-emerald-400">Telemetry Ledger</h4>
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">ID: {selectedField.id}</span>
          </div>

          {/* Details */}
          <div className="space-y-3 select-none">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-black">Field Label</span>
              <span className="font-bold text-sm text-white">{selectedField.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-black">Sown Crop</span>
                <span className="font-bold text-xs text-white capitalize">{selectedField.crop}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-black">Acres Area</span>
                <span className="font-bold text-xs text-white">{selectedField.area}</span>
              </div>
            </div>

            {/* Health stat bar */}
            <div className="pt-1">
              <div className="flex justify-between items-baseline mb-1 text-[10px]">
                <span className="uppercase tracking-wider text-muted-foreground font-black">NDVI Health Index</span>
                <span className={`font-black ${
                  selectedField.status === "Excellent" ? "text-emerald-400" : selectedField.status === "Warning" ? "text-yellow-400" : "text-rose-400"
                }`}>{selectedField.health}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 border border-white/[0.04] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedField.status === "Excellent" ? "bg-emerald-500" : selectedField.status === "Warning" ? "bg-yellow-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${selectedField.health}%` }}
                />
              </div>
            </div>

            {/* Moisture bar */}
            <div>
              <div className="flex justify-between items-baseline mb-1 text-[10px]">
                <span className="uppercase tracking-wider text-muted-foreground font-black">Soil Water Saturation</span>
                <span className="font-black text-sky-400">{selectedField.moisture}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 border border-white/[0.04] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${selectedField.moisture}%` }}
                />
              </div>
            </div>

            {/* NPK Details */}
            <div className="pt-2 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/[0.02] border border-white/[0.04] p-2 rounded-xl">
                <span className="text-[8px] text-muted-foreground block uppercase font-bold">Nitrogen</span>
                <span className="text-xs font-bold text-white">{selectedField.nitrogen}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-2 rounded-xl">
                <span className="text-[8px] text-muted-foreground block uppercase font-bold">Phosphorus</span>
                <span className="text-xs font-bold text-white">{selectedField.phosphorus}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] p-2 rounded-xl">
                <span className="text-[8px] text-muted-foreground block uppercase font-bold">Potassium</span>
                <span className="text-xs font-bold text-white">{selectedField.potassium}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verdict Badge */}
        <div className={`mt-5 rounded-xl border p-3.5 flex items-start gap-2.5 ${
          selectedField.status === "Excellent" 
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" 
            : selectedField.status === "Warning" 
            ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-300" 
            : "border-rose-500/20 bg-rose-500/5 text-rose-300"
        }`}>
          {selectedField.status === "Excellent" ? (
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          )}
          <div className="text-[10px]">
            <span className="font-bold block uppercase tracking-wider">Field Condition Verdict</span>
            <p className="opacity-90 leading-relaxed mt-0.5">
              {selectedField.status === "Excellent" && "Vegetation index is in prime state. Maintain standard moisture telemetry schedules."}
              {selectedField.status === "Warning" && "Stressed crop indices observed. Increase drip irrigation rate and inspect N-P-K ratios."}
              {selectedField.status === "Critical" && "Severe crop dehydration/chlorosis detected! Urgent manual field inspection recommended."}
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
