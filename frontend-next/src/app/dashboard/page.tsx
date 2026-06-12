"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BrainCircuit, CloudSun, Sprout, Bug, Store, MessageSquare,
  Users, Landmark, AlertTriangle, ShieldCheck, Activity,
  Database, ShieldAlert, Cpu, Layers, DollarSign, Tractor,
  BookOpen, Mic, Send, Calendar, Play, Settings, CreditCard,
  Building, BarChart3, HelpCircle, UserCheck, Heart, RefreshCw, FileText,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { useLanguage } from "@/lib/language"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GisSatelliteMap from "@/components/GisSatelliteMap"

// Recharts components
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, Legend
} from "recharts"

/* ─── Motion Presets ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
})

/* ─── Mock Data for Dashboard Charts ─── */
const MODEL_PERF_DATA = [
  { time: "09:00", Gemini: 180, Claude: 320, OpenAI: 240, DeepSeek: 110 },
  { time: "10:00", Gemini: 195, Claude: 290, OpenAI: 230, DeepSeek: 95 },
  { time: "11:00", Gemini: 170, Claude: 340, OpenAI: 250, DeepSeek: 105 },
  { time: "12:00", Gemini: 185, Claude: 300, OpenAI: 220, DeepSeek: 90 },
  { time: "13:00", Gemini: 210, Claude: 310, OpenAI: 260, DeepSeek: 115 },
  { time: "14:00", Gemini: 160, Claude: 280, OpenAI: 210, DeepSeek: 85 },
]

const INVENTORY_DATA = [
  { name: "NPK Urea", stock: 85, threshold: 20 },
  { name: "Paddy Seeds", stock: 120, threshold: 30 },
  { name: "Cotton Seeds", stock: 45, threshold: 25 },
  { name: "Organic Compost", stock: 95, threshold: 15 },
  { name: "Bio-Pesticides", stock: 18, threshold: 20 },
]

const SALES_TREND_DATA = [
  { month: "Jan", sales: 120000 },
  { month: "Feb", sales: 150000 },
  { month: "Mar", sales: 190000 },
  { month: "Apr", sales: 240000 },
  { month: "May", sales: 310000 },
  { month: "Jun", sales: 420000 },
]

const REGIONAL_YIELD_DATA = [
  { region: "Patna", yield: 8.5 },
  { region: "Gaya", yield: 6.2 },
  { region: "Arrah", yield: 7.8 },
  { region: "Nalanda", yield: 9.4 },
  { region: "Muzaffarpur", yield: 5.9 },
]

const AUDIT_LOGS = [
  { id: 1, action: "User Login", role: "Farmer", ip: "192.168.1.42", time: "Just now" },
  { id: 2, action: "AI Disease Diagnosis", role: "Farmer", ip: "103.44.82.11", time: "4 mins ago" },
  { id: 3, action: "Credit Line Approved", role: "Dealer", ip: "182.25.101.4", time: "15 mins ago" },
  { id: 4, action: "Emergency Warning Broadcasted", role: "Gov Inspector", ip: "10.0.4.15", time: "1 hr ago" },
  { id: 5, action: "Database Index Synced", role: "System Admin", ip: "127.0.0.1", time: "3 hrs ago" },
]

export default function DashboardPage() {
  const { user, ready } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

  // Dynamic Dashboard States
  const [activeRole, setRole] = useState<"farmer" | "dealer" | "gov" | "admin">("farmer")
  const [farmerTab, setFarmerTab] = useState<"ai" | "precision" | "gis" | "market" | "finance">("ai")

  // AI Router State
  const [selectedModel, setSelectedModel] = useState<"gemini" | "claude" | "openai" | "deepseek">("deepseek")
  const [routingLog, setRoutingLog] = useState<string[]>([
    "System Initialized. Active model: DeepSeek-R1-671B",
    "Ready for voice query..."
  ])
  const [voiceQueryActive, setVoiceQueryActive] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [chatLog, setChatLog] = useState<{ sender: "user" | "bot"; text: string; model?: string }[]>([
    { sender: "bot", text: "Namaste! Main aapka KrishiAI sahayak hoon. Apni fasal ya mausam ke baare mein poohein." }
  ])

  // Precision Agriculture States
  const [N, setN] = useState(75)
  const [P, setP] = useState(45)
  const [K, setK] = useState(180)
  const [ph, setPh] = useState(6.5)
  const [moisture, setMoisture] = useState(40)
  const [diseaseProgress, setDiseaseProgress] = useState(0) // 0: Idle, 1: Reading, 2: Done
  const [diseaseOutput, setDiseaseOutput] = useState<{ label: string; conf: number; remedy: string } | null>(null)

  // Finance Expense States
  const [expenses, setExpenses] = useState<{ id: number; desc: string; amount: number; type: "debit" | "credit" }[]>([
    { id: 1, desc: "Sona-Kalyan Wheat Seeds (50Kg)", amount: -4200, type: "debit" },
    { id: 2, desc: "Urea Fertilizer bags x5", amount: -2800, type: "debit" },
    { id: 3, desc: "Micro-irrigation subsidy cash", amount: 15000, type: "credit" },
    { id: 4, desc: "Crop harvest sold in Gaya APMC", amount: 68000, type: "credit" },
  ])

  // Alert inputs
  const [alerts, setAlerts] = useState<{ id: number; title: string; desc: string; urgent: boolean }[]>([
    { id: 1, title: "IMD Weather Alert: Heavy Rain Expected", desc: "Patna district expected to receive 45mm rainfall in next 24 hours. Suspend watering.", urgent: true },
    { id: 2, title: "eNAM Market Alert: Paddy Rates High", desc: "Paddy prices spiked 8.5% at Nalanda mandi. Optimal time to harvest and sell.", urgent: false },
  ])

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login")
    }
  }, [ready, user, router])

  if (!ready || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground font-semibold text-sm">
          <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading farm console...
        </div>
      </div>
    )
  }

  // Calculate yield forecast based on NPK & moisture
  const yieldForecast = ((N * 0.4 + P * 0.3 + K * 0.1 + moisture * 0.2) / 20).toFixed(1)

  // Calculate total expense balance
  const balance = expenses.reduce((acc, curr) => acc + (curr.type === "credit" ? curr.amount : curr.amount), 0)

  // Trigger simulated voice transcript
  function handleVoiceInput() {
    if (voiceQueryActive) return
    setVoiceQueryActive(true)
    setRoutingLog(prev => ["Listening to voice feed...", ...prev])
    
    setTimeout(() => {
      const queries = [
        "Agle 3 din me barish hogi kya?",
        "Tamatar me patte peele pad rahe hain, kaunsi dawai dalein?",
        "Gehun ke liye sabse achha NPK ratio batao?",
        "PM Kisan Yojana ki kist kab aayegi?"
      ]
      const chosenQuery = queries[Math.floor(Math.random() * queries.length)]
      setChatInput(chosenQuery)
      setVoiceQueryActive(false)
      setRoutingLog(prev => [
        `Voice captured: "${chosenQuery}"`,
        `AI Router choosing best LLM model...`,
        `DeepSeek-R1 selected for agricultural query reasoning.`,
        ...prev
      ])
    }, 2500)
  }

  // Handle chat submission
  function handleChatSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!chatInput.trim()) return
    const text = chatInput
    setChatInput("")
    
    setChatLog(prev => [...prev, { sender: "user", text }])
    
    // Simulate AI Router decision based on query
    let routedModel = "DeepSeek-R1-671B"
    let responseText = ""
    
    if (text.toLowerCase().includes("barish") || text.toLowerCase().includes("weather") || text.toLowerCase().includes("mausam")) {
      routedModel = "Gemini-1.5-Pro (Weather Specialist)"
      responseText = "OpenWeather & IMD satellite feeds show 35% chance of light showers in Gaya on June 15th. Overall conditions remain stable."
    } else if (text.toLowerCase().includes("kisan") || text.toLowerCase().includes("yojana") || text.toLowerCase().includes("scheme")) {
      routedModel = "Claude-3.5-Sonnet (Govt Scheme Parser)"
      responseText = "PM-Kisan 17th installment of Rs 2,000 has been disbursed. Check your Aadhaar link status under the Schemes tab."
    } else {
      routedModel = "DeepSeek-R1-671B (Deep Reasoning Engine)"
      responseText = "If tomato leaves are yellowing with dark rings, it is likely Early Blight (Alternaria solani). Apply copper-based fungicide and prune lower leaves."
    }

    setRoutingLog(prev => [
      `User query: "${text}"`,
      `Router analyzed token weights...`,
      `Routed to model: ${routedModel} (Latency: ${Math.floor(Math.random() * 80) + 80}ms)`,
      ...prev
    ])

    setTimeout(() => {
      setChatLog(prev => [...prev, { sender: "bot", text: responseText, model: routedModel }])
    }, 1200)
  }

  // Simulate Disease Upload
  function triggerDiseaseScan() {
    setDiseaseProgress(1)
    setDiseaseOutput(null)
    setTimeout(() => {
      setDiseaseProgress(2)
      setDiseaseOutput({
        label: "Late Blight (Phytophthora infestans)",
        conf: 97.4,
        remedy: "Spray Metalaxyl-M (Acrobat) at 2g/L water. Prune affected branches to avoid spores spreading."
      })
      setRoutingLog(prev => [
        "Image uploads analyzed via Vision CNN model.",
        "Diagnosis: Late Blight (97.4% confidence)",
        ...prev
      ])
    }, 3000)
  }

  return (
    <div className="flex flex-col gap-6 pb-12 select-none">
      
      {/* ─── ROLE SELECTOR CONSOLE ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black font-display text-white flex items-center gap-2">
            KrishiAI Operating Console
            <span className="text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
              ENTERPRISE PRODUCTION
            </span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-semibold">
            India's unified operating system for agriculture & telemetry monitoring
          </p>
        </div>

        {/* Switcher tabs */}
        <div className="flex rounded-xl border border-white/[0.08] bg-slate-950/60 p-1 gap-1">
          {[
            { id: "farmer", label: "Farmer Super App", icon: Sprout },
            { id: "dealer", label: "Agri-Dealer", icon: Building },
            { id: "gov", label: "Govt Inspector", icon: Landmark },
            { id: "admin", label: "System Admin", icon: Cpu },
          ].map(r => {
            const Icon = r.icon
            const active = activeRole === r.id
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                  active 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── DYNAMIC CONSOLE VIEWS ─── */}
      <AnimatePresence mode="wait">
        
        {/* 1. FARMER CONSOLE */}
        {activeRole === "farmer" && (
          <motion.div key="farmer" {...fadeUp(0)} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar Modules navigation */}
            <div className="lg:col-span-1 flex flex-col gap-2 bg-slate-950/20 border border-white/[0.05] p-3 rounded-2xl h-fit">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-3 mb-2 block">
                20 Super App Modules
              </span>
              {[
                { id: "ai", label: "AI & Voice Assistant", icon: BrainCircuit, desc: "Model routing & audio" },
                { id: "precision", label: "Precision Farm Ops", icon: Activity, desc: "NPK & disease analysis" },
                { id: "gis", label: "GIS Satellite Maps", icon: Layers, desc: "NDVI vegetation & radar" },
                { id: "market", label: "Market & Labour", icon: Store, desc: "Mandi prices & workers" },
                { id: "finance", label: "Finance & Schemes", icon: DollarSign, desc: "Ledger, schemes & claims" },
              ].map(tab => {
                const Icon = tab.icon
                const active = farmerTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFarmerTab(tab.id as any)}
                    className={`flex items-start gap-3 w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      active 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                        : "border border-transparent text-muted-foreground hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block leading-none">{tab.label}</span>
                      <span className="text-[9px] opacity-75 font-semibold mt-0.5 block">{tab.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Sub-tab viewport */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* TAB A: AI & VOICE ASSISTANT */}
              {farmerTab === "ai" && (
                <motion.div key="ai" {...fadeUp(0)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left: AI Router config */}
                  <div className="md:col-span-1 flex flex-col gap-4">
                    <GlassCard className="bg-slate-950/20 border border-white/[0.08]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                          <BrainCircuit className="h-4.5 w-4.5 text-emerald-400" />
                          AI model Router
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4 text-xs">
                        <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-semibold">
                          Choose preferred model engine. The AI Router automatically allocates request payload weight to minimize query latency.
                        </p>
                        
                        {/* Selector */}
                        <div className="space-y-2 select-none">
                          {[
                            { id: "deepseek", name: "DeepSeek-R1-671B", rate: "Free", latency: "95ms" },
                            { id: "gemini", name: "Gemini-1.5-Pro", rate: "Free", latency: "185ms" },
                            { id: "claude", name: "Claude-3.5-Sonnet", rate: "Premium", latency: "310ms" },
                            { id: "openai", name: "GPT-4o-Omni", rate: "Premium", latency: "240ms" },
                          ].map(m => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setSelectedModel(m.id as any)
                                setRoutingLog(prev => [`Manually forced model context: ${m.name}`, ...prev])
                              }}
                              className={`flex items-center justify-between w-full p-2.5 rounded-xl border text-left transition-all ${
                                selectedModel === m.id
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-white font-bold"
                                  : "border-white/[0.04] bg-white/[0.01] text-muted-foreground hover:border-white/[0.08]"
                              }`}
                            >
                              <span>{m.name}</span>
                              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{m.latency}</span>
                            </button>
                          ))}
                        </div>
                      </GlassCard>

                      {/* Router logs */}
                      <GlassCard className="bg-slate-950/40 border border-white/[0.05]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                            Router Routing Logs
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-28 overflow-y-auto font-mono text-[9px] text-emerald-500/90 leading-relaxed space-y-1 custom-scrollbar">
                            {routingLog.map((log, i) => (
                              <div key={i} className="truncate">&gt; {log}</div>
                            ))}
                          </div>
                        </CardContent>
                      </GlassCard>
                    </div>
                  </div>

                  {/* Right: AI Chat UI */}
                  <div className="md:col-span-2 flex flex-col h-[480px]">
                    <GlassCard className="flex-1 overflow-hidden flex flex-col border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20 rounded-3xl">
                      {/* Top bar */}
                      <div className="px-5 py-4 border-b border-white/[0.05] bg-slate-950/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="text-xs font-bold text-white">Voice & Chat AI Assistant</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">
                          Routed Active: {selectedModel.toUpperCase()}
                        </span>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
                        {chatLog.map((msg, i) => {
                          const isBot = msg.sender === "bot"
                          return (
                            <div key={i} className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                isBot ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                              }`}>
                                {isBot ? "AI" : "U"}
                              </div>
                              <div className={`p-3.5 rounded-2xl leading-relaxed ${
                                isBot ? "bg-white/[0.02] border border-white/[0.04] text-white/90" : "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white"
                              }`}>
                                <p>{msg.text}</p>
                                {msg.model && (
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400/80 block mt-1.5">
                                    Model: {msg.model}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Micro-simulation status */}
                      {voiceQueryActive && (
                        <div className="px-5 py-2.5 bg-rose-500/5 border-t border-rose-500/15 flex items-center justify-center gap-2 text-[10px] text-rose-400 font-bold select-none animate-pulse">
                          Listening... say "barish forecast Gaya Bihar"
                        </div>
                      )}

                      {/* Input container */}
                      <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/[0.05] bg-slate-950/40 flex gap-2.5">
                        <button
                          type="button"
                          onClick={handleVoiceInput}
                          className="h-11 w-11 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/20 active:scale-95 transition-all shrink-0"
                        >
                          <Mic className="h-4.5 w-4.5" />
                        </button>
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask in Hindi, English, Kannada, Marathi..."
                          className="flex-1 h-11 bg-slate-950/60 border-white/[0.06] rounded-xl text-xs px-4"
                        />
                        <Button type="submit" className="h-11 px-4 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all shrink-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </GlassCard>
                  </div>

                </motion.div>
              )}

              {/* TAB B: PRECISION AGRICULTURE */}
              {farmerTab === "precision" && (
                <motion.div key="precision" {...fadeUp(0)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Soil parameter sliders */}
                  <div className="md:col-span-1 flex flex-col gap-4">
                    <GlassCard className="bg-slate-950/20 border border-white/[0.08]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                          <Activity className="h-4.5 w-4.5 text-emerald-400" />
                          NPK & soil sliders
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-xs select-none">
                        <div>
                          <div className="flex justify-between font-bold mb-1.5">
                            <span>Nitrogen (N)</span>
                            <span className="text-emerald-400">{N} kg/ha</span>
                          </div>
                          <input type="range" min="10" max="150" value={N} onChange={(e) => setN(parseInt(e.target.value))} className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        </div>
                        <div>
                          <div className="flex justify-between font-bold mb-1.5">
                            <span>Phosphorus (P)</span>
                            <span className="text-emerald-400">{P} kg/ha</span>
                          </div>
                          <input type="range" min="10" max="100" value={P} onChange={(e) => setP(parseInt(e.target.value))} className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        </div>
                        <div>
                          <div className="flex justify-between font-bold mb-1.5">
                            <span>Potassium (K)</span>
                            <span className="text-emerald-400">{K} kg/ha</span>
                          </div>
                          <input type="range" min="50" max="300" value={K} onChange={(e) => setK(parseInt(e.target.value))} className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        </div>
                        <div>
                          <div className="flex justify-between font-bold mb-1.5">
                            <span>Soil pH</span>
                            <span className="text-emerald-400">{ph}</span>
                          </div>
                          <input type="range" min="3" max="10" step="0.1" value={ph} onChange={(e) => setPh(parseFloat(e.target.value))} className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        </div>
                        <div>
                          <div className="flex justify-between font-bold mb-1.5">
                            <span>Moisture saturation</span>
                            <span className="text-sky-400">{moisture}%</span>
                          </div>
                          <input type="range" min="0" max="100" value={moisture} onChange={(e) => setMoisture(parseInt(e.target.value))} className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                        </div>
                      </CardContent>
                    </GlassCard>

                    {/* Yield Prediction output */}
                    <GlassCard className="bg-gradient-to-br from-emerald-500/10 via-teal-500/2 to-transparent border border-emerald-500/20 text-center">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          Estimated Yield Metric
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-4xl font-black font-display text-white">{yieldForecast}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">Tonnes/ha</span>
                        <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-semibold mt-2.5">
                          Cross-calculated utilizing local Gaya climate averages and soil NPK fertilizer coefficients.
                        </p>
                      </CardContent>
                    </GlassCard>
                  </div>

                  {/* Disease & Pest Scanner */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <GlassCard className="bg-slate-950/20 border border-white/[0.08] flex-1">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                          <Bug className="h-4.5 w-4.5 text-rose-500 animate-pulse-glow" />
                          Disease & Pest Scanner AI
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
                        {diseaseProgress === 0 && (
                          <div className="flex flex-col items-center gap-4 text-center select-none">
                            <div className="h-16 w-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-white hover:border-emerald-500/30 transition-all cursor-pointer shadow-inner" onClick={triggerDiseaseScan}>
                              <Bug className="h-8 w-8 text-muted-foreground/80" />
                            </div>
                            <div>
                              <span className="font-bold text-white text-xs block">Diagnose Leaf Crop Spot</span>
                              <span className="text-[10px] text-muted-foreground block mt-1 leading-relaxed max-w-xs font-semibold">
                                Simulate uploading a crop leaf image (Wheat, Rice, Cotton, Tomato) for deep CNN disease risk analysis.
                              </span>
                            </div>
                            <Button onClick={triggerDiseaseScan} className="bg-emerald-500 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-lg active:scale-95 transition-all">
                              Upload Crop Photo
                            </Button>
                          </div>
                        )}
                        
                        {diseaseProgress === 1 && (
                          <div className="flex flex-col items-center gap-4 py-6 text-center select-none">
                            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                            <div>
                              <span className="font-bold text-white text-xs block">Scanning Leaf Texture Metrics...</span>
                              <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">Running local TensorFlow segmentation mask...</span>
                            </div>
                          </div>
                        )}

                        {diseaseProgress === 2 && diseaseOutput && (
                          <div className="w-full flex flex-col gap-4 animate-fade-in">
                            <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400">
                              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                              <div className="text-xs">
                                <span className="font-black uppercase tracking-wider block">Verdict: {diseaseOutput.label}</span>
                                <span className="text-[10px] opacity-80 block mt-0.5 font-semibold">Confidence: {diseaseOutput.conf}% accuracy</span>
                                <p className="mt-2 text-white/90 leading-relaxed font-semibold bg-slate-950/40 p-2.5 rounded-lg border border-white/[0.04]">{diseaseOutput.remedy}</p>
                              </div>
                            </div>
                            <Button onClick={() => setDiseaseProgress(0)} variant="outline" className="w-fit text-xs px-4 h-8 rounded-lg self-center border-border/60 hover:bg-emerald-500/5">
                              Scan Another Photo
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </GlassCard>

                    {/* Irrigation automation panel */}
                    <GlassCard className="bg-slate-950/20 border border-white/[0.08]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center justify-between w-full">
                          <span>Irrigation Intelligence</span>
                          <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">AUTO</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5 select-none">
                          <span className="text-muted-foreground block text-[9px] font-black uppercase">Active Valve Status</span>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-slate-600" />
                            <span className="font-bold text-white">Zone 01 Valves Closed</span>
                          </div>
                        </div>
                        <div className="space-y-1.5 select-none">
                          <span className="text-muted-foreground block text-[9px] font-black uppercase">Next Irrigation Run</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">Automatic Trigger at 22:00</span>
                          </div>
                        </div>
                      </CardContent>
                    </GlassCard>
                  </div>

                </motion.div>
              )}

              {/* TAB C: GIS & SATELLITE MAPS */}
              {farmerTab === "gis" && (
                <motion.div key="gis" {...fadeUp(0)} className="flex flex-col gap-6">
                  <GisSatelliteMap />
                </motion.div>
              )}

              {/* TAB D: MARKET & LABOUR */}
              {farmerTab === "market" && (
                <motion.div key="market" {...fadeUp(0)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Mandi APMC rates */}
                  <GlassCard className="bg-slate-950/20 border border-white/[0.08] flex flex-col justify-between h-[360px]">
                    <div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center justify-between">
                          <span>APMC Mandi Rates</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-black">Region: Bihar</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="overflow-y-auto max-h-[260px] custom-scrollbar text-xs">
                        <div className="space-y-2 select-none">
                          {[
                            { crop: "Sona Wheat", price: "Rs 2,275 / Quintal", trend: "+2.5% Gaya", up: true },
                            { crop: "Basmati Paddy", price: "Rs 3,450 / Quintal", trend: "+4.1% Nalanda", up: true },
                            { crop: "Jyoti Potato", price: "Rs 1,120 / Quintal", trend: "-1.8% Patna", up: false },
                            { crop: "Deccan Maize", price: "Rs 1,890 / Quintal", trend: "+1.2% Gaya", up: true },
                            { crop: "Shankar Cotton", price: "Rs 6,800 / Quintal", trend: "-0.5% Arrah", up: false },
                          ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                              <div>
                                <span className="font-bold text-white block">{m.crop}</span>
                                <span className="text-[9px] text-muted-foreground font-semibold">{m.trend}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-white block">{m.price}</span>
                                <span className={`text-[9px] font-black uppercase ${m.up ? "text-emerald-400" : "text-rose-400"}`}>
                                  {m.up ? "▲ HIGH" : "▼ LOW"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </GlassCard>

                  {/* Worker hiring list */}
                  <GlassCard className="bg-slate-950/20 border border-white/[0.08] flex flex-col justify-between h-[360px]">
                    <div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                          Worker Connect Portal
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="overflow-y-auto max-h-[260px] custom-scrollbar text-xs">
                        <p className="text-[11px] text-muted-foreground/80 mb-3 leading-relaxed font-semibold">
                          Connect instantly with nearby skilled farm workers. Click details to initiate employer WhatsApp.
                        </p>
                        <div className="space-y-2 select-none">
                          {[
                            { name: "Rajesh Paswan", task: "Sowing / Transplantation", wage: "Rs 450/day", location: "3.5 km away" },
                            { name: "Kiran Devi", task: "Weeding & Cleaning", wage: "Rs 400/day", location: "2.1 km away" },
                            { name: "Manoj Yadav", task: "Harvester Operator", wage: "Rs 650/day", location: "5.8 km away" },
                            { name: "Lakhan Manjhi", task: "Tractor ploughing", wage: "Rs 500/day", location: "1.2 km away" },
                          ].map((w, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-emerald-500/20 transition-all cursor-pointer">
                              <div>
                                <span className="font-bold text-white block">{w.name}</span>
                                <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">{w.task}</span>
                                <span className="text-[9px] text-muted-foreground font-semibold">{w.location}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-white block">{w.wage}</span>
                                <button className="mt-1 bg-emerald-500 text-white font-bold text-[8px] uppercase tracking-wider px-2 py-1 rounded shadow-sm hover:scale-105 active:scale-95 transition-all">
                                  WhatsApp
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </GlassCard>

                </motion.div>
              )}

              {/* TAB E: FINANCE & SCHEMES */}
              {farmerTab === "finance" && (
                <motion.div key="finance" {...fadeUp(0)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Expense Ledger */}
                  <div className="md:col-span-1 flex flex-col gap-4">
                    <GlassCard className="bg-slate-950/20 border border-white/[0.08]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center justify-between">
                          <span>Expense Ledger</span>
                          <span className="text-[10px] font-black text-emerald-400">Balance: Rs {balance}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-[10px] select-none">
                        {expenses.map(exp => (
                          <div key={exp.id} className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/[0.04]">
                            <span className="text-white font-semibold truncate max-w-[120px]">{exp.desc}</span>
                            <span className={`font-extrabold ${exp.type === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                              {exp.type === "credit" ? "+" : ""}{exp.amount}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </GlassCard>
                  </div>

                  {/* Gov schemes list */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <GlassCard className="bg-slate-950/20 border border-white/[0.08]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                          Government Scheme Applications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-xs select-none">
                        {[
                          { scheme: "PM-Kisan Samman Nidhi", status: "Disbursed", amt: "Rs 2,000", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                          { scheme: "PM Crop Insurance (PMFBY)", status: "Under Review", amt: "Rs 45,000 Claimed", badge: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
                          { scheme: "Kisan Credit Card (KCC)", status: "Active Limit", amt: "Rs 1,50,000", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" }
                        ].map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                            <div>
                              <span className="font-bold text-white block">{s.scheme}</span>
                              <span className="text-[9px] text-muted-foreground font-semibold">Benefit Value: {s.amt}</span>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase border ${s.badge}`}>
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </GlassCard>
                  </div>

                </motion.div>
              )}

            </div>

          </motion.div>
        )}

        {/* 2. DEALER CONSOLE */}
        {activeRole === "dealer" && (
          <motion.div key="dealer" {...fadeUp(0)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Dealer Stats row */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "Dealer Inventory Items", value: "320 Tons", unit: "Stocked", color: "from-emerald-500/5 to-teal-500/2 border-emerald-500/10" },
                { title: "Outstanding Farmer Credit", value: "Rs 4.8L", unit: "Disbursed", color: "from-orange-500/5 to-amber-500/2 border-orange-500/10" },
                { title: "Active Trade Outlets", value: "12 Hubs", unit: "Bi-state", color: "from-indigo-500/5 to-purple-500/2 border-indigo-500/10" },
                { title: "Sales Revenue (Q2)", value: "Rs 12.4L", unit: "+18.2%", color: "from-teal-500/5 to-emerald-500/2 border-teal-500/10" },
              ].map((s, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl border border-border/30 p-5 bg-gradient-to-br ${s.color} backdrop-blur-md shadow-sm`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">{s.title}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black font-display text-white">{s.value}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold ml-0.5">{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dealer inventory chart (2 cols) */}
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 backdrop-blur-md min-h-[300px] flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-4">Inventory Stock levels vs. Thresholds</h4>
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={INVENTORY_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <Tooltip contentStyle={{ background: "#0b2b1e", border: "1px solid rgba(16,185,129,0.2)" }} />
                      <Bar dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]} name="Active Stock" />
                      <Bar dataKey="threshold" fill="#ef4444" radius={[4, 4, 0, 0]} name="Reorder Alert" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Farmer credit outstanding list (1 col) */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 backdrop-blur-md">
              <h4 className="font-bold text-xs uppercase tracking-widest text-emerald-400 mb-3">Farmer Credit Lines</h4>
              <div className="space-y-2.5 text-xs select-none">
                {[
                  { name: "Subhash Yadav", crop: "Wheat Seeds", credit: "Rs 12,000", status: "Overdue 14 days", bad: true },
                  { name: "Suresh Manjhi", crop: "Urea Fertilizer", credit: "Rs 8,500", status: "Active", bad: false },
                  { name: "Devi Sharan", crop: "Tractor Rent", credit: "Rs 24,000", status: "Active", bad: false },
                  { name: "Phoolchand Singh", crop: "Potato Seeds", credit: "Rs 4,200", status: "Overdue 5 days", bad: true },
                ].map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                    <div>
                      <span className="font-bold text-white block">{c.name}</span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">Loan Item: {c.crop}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-white block">{c.credit}</span>
                      <span className={`text-[9px] font-black uppercase ${c.bad ? "text-rose-400" : "text-emerald-400"}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* 3. GOVERNMENT INSPECTOR CONSOLE */}
        {activeRole === "gov" && (
          <motion.div key="gov" {...fadeUp(0)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gov Stats */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "Total Subsidy Allocation", value: "Rs 85.4Cr", unit: "Budget", color: "from-emerald-500/5 to-teal-500/2 border-emerald-500/10" },
                { title: "Pending Disaster Claims", value: "4,820", unit: "Auditing", color: "from-orange-500/5 to-amber-500/2 border-orange-500/10" },
                { title: "District Soil Cards", value: "1.2 Lakh", unit: "Generated", color: "from-indigo-500/5 to-purple-500/2 border-indigo-500/10" },
                { title: "Disbursed Relief Funds", value: "Rs 38.6Cr", unit: "e-Transfer", color: "from-teal-500/5 to-emerald-500/2 border-teal-500/10" },
              ].map((s, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl border border-border/30 p-5 bg-gradient-to-br ${s.color} backdrop-blur-md shadow-sm`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">{s.title}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black font-display text-white">{s.value}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold ml-0.5">{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* regional crop yield Rechartscomposed chart */}
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 backdrop-blur-md min-h-[300px] flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-4">Average Agricultural Yield Index by District</h4>
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REGIONAL_YIELD_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="region" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <Tooltip contentStyle={{ background: "#0b2b1e", border: "1px solid rgba(16,185,129,0.2)" }} />
                      <Area type="monotone" dataKey="yield" stroke="#10b981" fill="rgba(16, 185, 129, 0.15)" strokeWidth={2} name="Metric Tonnes / Acre" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* weather broadcaster panel */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-rose-400">Emergency Weather Broadcast</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                  Select warning criteria to push warning notification alerts directly to all active farmer dashboard consoles in target regions.
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <Label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">Target District</Label>
                    <select className="w-full bg-slate-900 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white">
                      <option>Patna District (Bihar)</option>
                      <option>Gaya District (Bihar)</option>
                      <option>Nalanda District (Bihar)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">Warning Payload</Label>
                    <Input placeholder="e.g. Heavy Hailstorm warning at 15:00..." className="bg-slate-900 border-white/[0.08] text-xs h-10 px-3" />
                  </div>
                </div>
              </div>
              <Button className="mt-5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs h-10 rounded-xl active:scale-95 shadow-md shadow-rose-500/10">
                Push Regional Warning Alert
              </Button>
            </div>

          </motion.div>
        )}

        {/* 4. SYSTEM ADMINISTRATOR CONSOLE */}
        {activeRole === "admin" && (
          <motion.div key="admin" {...fadeUp(0)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* System statistics */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "Router Token Latency", value: "95ms", unit: "DeepSeek", color: "from-emerald-500/5 to-teal-500/2 border-emerald-500/10" },
                { title: "API Gateway Load", value: "4.8K req", unit: "per/sec", color: "from-orange-500/5 to-amber-500/2 border-orange-500/10" },
                { title: "Vercel Build Status", value: "Success", unit: "Ready", color: "from-indigo-500/5 to-purple-500/2 border-indigo-500/10" },
                { title: "Daily API Provider Cost", value: "$4.12", unit: "Gemini/OpenAI", color: "from-teal-500/5 to-emerald-500/2 border-teal-500/10" },
              ].map((s, i) => (
                <div key={i} className={`relative overflow-hidden rounded-2xl border border-border/30 p-5 bg-gradient-to-br ${s.color} backdrop-blur-md shadow-sm`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">{s.title}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black font-display text-white">{s.value}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold ml-0.5">{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Router latency stats (2 cols) */}
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 backdrop-blur-md min-h-[300px] flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-4">AI Model Router Latency Trends (ms)</h4>
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MODEL_PERF_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <Tooltip contentStyle={{ background: "#0b2b1e", border: "1px solid rgba(16,185,129,0.2)" }} />
                      <Legend verticalAlign="top" height={36} fontSize={8} />
                      <Line type="monotone" dataKey="DeepSeek" stroke="#10b981" strokeWidth={2.5} name="DeepSeek-R1" />
                      <Line type="monotone" dataKey="Gemini" stroke="#38bdf8" strokeWidth={1.5} name="Gemini Pro" />
                      <Line type="monotone" dataKey="OpenAI" stroke="#fbbf24" strokeWidth={1.5} name="GPT-4o" />
                      <Line type="monotone" dataKey="Claude" stroke="#a855f7" strokeWidth={1.5} name="Claude Sonnet" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Audit log (1 col) */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-5 backdrop-blur-md">
              <h4 className="font-bold text-xs uppercase tracking-widest text-emerald-400 mb-3">Gateway Audit Logs</h4>
              <div className="space-y-2 text-[10px] font-mono select-none">
                {AUDIT_LOGS.map(log => (
                  <div key={log.id} className="p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                    <div className="flex justify-between font-bold text-white">
                      <span>{log.action}</span>
                      <span className="text-emerald-400">{log.time}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground mt-1 text-[8px] font-semibold uppercase">
                      <span>Role: {log.role}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* ─── ALERT EMERGENCY OVERLAY WIDGET ─── */}
      <div className="divider-gradient my-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map(a => (
          <div key={a.id} className={`flex items-start gap-3 border p-4 rounded-xl backdrop-blur-sm relative overflow-hidden select-none ${
            a.urgent 
              ? "border-rose-500/20 bg-gradient-to-r from-rose-500/5 to-red-500/2 text-rose-300"
              : "border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/2 text-amber-300"
          }`}>
            <AlertTriangle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${a.urgent ? "text-rose-500" : "text-amber-500"}`} />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider">{a.title}</h4>
              <p className="text-[10px] opacity-90 leading-relaxed mt-1 font-semibold">{a.desc}</p>
            </div>
            <span className="absolute top-2 right-2 text-[8px] font-black uppercase text-muted-foreground/60">{a.urgent ? "High Risk" : "Notice"}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
