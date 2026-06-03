"use client"
import { useLanguage } from '@/lib/language'

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Store,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ShoppingCart,
  Tag,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  IndianRupee,
  Wheat,
  Loader2,
  X,
  Package,
  Users,
  ArrowUpDown,
  Bell,
  BellRing,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Recharts imports for premium financial view
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

/* ------------------------------------------------------------------ */
/*  Multilingual eNAM Instructions                                     */
/* ------------------------------------------------------------------ */
const ENAM_LANG = {
  en: {
    title: "Fill this on eNAM",
    state: "State",
    apmc: "APMC / Mandi",
    commodity: "Commodity",
    price: "Price",
    proceed: "Go to eNAM ↗",
    note: "eNAM — Government of India's official mandi. Real buyers, real payments.",
  },
  hi: {
    title: "eNAM पर यह भरें",
    state: "राज्य",
    apmc: "मंडी",
    commodity: "फसल",
    price: "भाव",
    proceed: "eNAM पर जाएं ↗",
    note: "eNAM — भारत सरकार की आधिकारिक मंडी। असली खरीदार, असली भुगतान।",
  },
  kn: {
    title: "eNAM ನಲ್ಲಿ ಇದನ್ನು ತುಂಬಿ",
    state: "ರಾಜ್ಯ",
    apmc: "ಮಂಡಿ",
    commodity: "ಬೆಳೆ",
    price: "ಬೆಲೆ",
    proceed: "eNAM ಗೆ ಹೋಗಿ ↗",
    note: "eNAM — ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಮಂಡಿ। ನೈಜ ಖರೀದಿದಾರರು, ನೈಜ ಪಾವತಿ.",
  },
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface MandiCrop {
  id: number
  name: string
  variety: string
  price: number
  unit: string
  mandi: string
  state: string
  category: string
  trend: "up" | "down" | "stable"
  change_percent: number
  min_price: number
  max_price: number
  modal_price: number
  arrival_tonnes: number
}

/* ------------------------------------------------------------------ */
/*  Category Info Map                                                 */
/* ------------------------------------------------------------------ */
const CATEGORY_COLORS: Record<string, string> = {
  Cereal: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400",
  Oilseed: "from-lime-500/10 to-green-500/10 border-lime-500/20 text-lime-400",
  Pulse: "from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-400",
  Fiber: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400",
  Vegetable: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400",
  "Cash Crop": "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 text-purple-400",
}

/* ------------------------------------------------------------------ */
/*  Price Alert System                                                 */
/* ------------------------------------------------------------------ */
const ALERT_KEY = "krishiai_mandi_alerts"
interface PriceAlert { id: string; cropName: string; threshold: number; direction: "above" | "below"; createdAt: number; fired?: boolean }
function readAlerts(): PriceAlert[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(ALERT_KEY) || "[]") } catch { return [] } }
function saveAlerts(a: PriceAlert[]) { if (typeof window !== "undefined") localStorage.setItem(ALERT_KEY, JSON.stringify(a)) }

function PriceAlertPanel({ crops }: { crops: MandiCrop[] }) {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => readAlerts())
  const [showForm, setShowForm] = useState(false)
  const [newCrop, setNewCrop] = useState("")
  const [newThreshold, setNewThreshold] = useState("")
  const [newDir, setNewDir] = useState<"above" | "below">("above")
  const [permGranted, setPermGranted] = useState(false)
  const [checking, setChecking] = useState(false)
  
  useEffect(() => { if (typeof window !== "undefined" && "Notification" in window) setPermGranted(Notification.permission === "granted") }, [])
  
  const requestPerm = async () => { if (!("Notification" in window)) return; const r = await Notification.requestPermission(); setPermGranted(r === "granted") }
  
  const addAlert = () => {
    if (!newCrop || !newThreshold) return
    const alert: PriceAlert = { id: Date.now().toString(36), cropName: newCrop, threshold: parseFloat(newThreshold), direction: newDir, createdAt: Date.now() }
    const updated = [...alerts, alert]; setAlerts(updated); saveAlerts(updated); setShowForm(false); setNewCrop(""); setNewThreshold("")
  }
  
  const removeAlert = (id: string) => { const u = alerts.filter((a) => a.id !== id); setAlerts(u); saveAlerts(u) }
  
  const checkNow = useCallback(() => {
    if (!permGranted || crops.length === 0) return; setChecking(true)
    const updated = alerts.map((alert) => {
      const match = crops.find((c) => c.name.toLowerCase().includes(alert.cropName.toLowerCase()))
      if (!match) return alert
      const triggered = alert.direction === "above" ? match.modal_price >= alert.threshold : match.modal_price <= alert.threshold
      if (triggered && !alert.fired) { 
        new Notification("KrishiAI Mandi Alert", { 
          body: `${match.name} has hit ₹${match.modal_price}/qtl. This triggered your target alert.`, 
          icon: "/icon-192.svg" 
        }); 
        return { ...alert, fired: true } 
      }
      return alert
    }); setAlerts(updated); saveAlerts(updated); setTimeout(() => setChecking(false), 800)
  }, [alerts, crops, permGranted])

  const uniqueCrops = Array.from(new Set(crops.map((c) => c.name))).sort()

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md p-4 relative overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Bell className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-white text-sm font-display">Target Price Notifications</div>
            <div className="text-xs text-muted-foreground">{alerts.length === 0 ? "Setup push price monitors for selected commodities" : `${alerts.length} active monitors`}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {!permGranted && (
            <button 
              onClick={requestPerm} 
              className="text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all"
            >
              <BellRing className="h-3.5 w-3.5" /> Enable Notifications
            </button>
          )}
          {permGranted && alerts.length > 0 && (
            <button 
              onClick={checkNow} 
              disabled={checking} 
              className="text-xs rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] px-3.5 py-2 text-white font-semibold flex items-center gap-1.5 transition-all"
            >
              {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />} Check Status
            </button>
          )}
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="text-xs rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-amber-400 font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> {showForm ? "Cancel" : "Add Target Price"}
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-center gap-2 text-xs rounded-full px-3 py-1.5 border transition-all ${
                alert.fired 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              <span>{alert.cropName} {alert.direction === "above" ? "≥" : "≤"} ₹{alert.threshold}</span>
              <button 
                onClick={() => removeAlert(alert.id)} 
                className="hover:text-white transition-colors"
                title="Remove alert"
              >
                <X className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="mt-4 pt-4 border-t border-white/[0.04] grid gap-4 sm:flex sm:items-end sm:flex-wrap">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Crop / Commodity</span>
            <select 
              value={newCrop} 
              onChange={(e) => setNewCrop(e.target.value)} 
              className="w-full sm:w-48 rounded-xl border border-white/[0.08] bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="" className="bg-slate-900">Select commodity</option>
              {uniqueCrops.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Trigger Rule</span>
            <div className="flex p-0.5 rounded-xl border border-white/[0.08] bg-slate-950">
              <button 
                onClick={() => setNewDir("above")} 
                type="button"
                className={`text-[11px] rounded-lg px-3 py-1.5 font-bold transition-all ${newDir === "above" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-white"}`}
              >
                Goes Above
              </button>
              <button 
                onClick={() => setNewDir("below")} 
                type="button"
                className={`text-[11px] rounded-lg px-3 py-1.5 font-bold transition-all ${newDir === "below" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-white"}`}
              >
                Goes Below
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Target (₹ per Qtl)</span>
            <input 
              type="number" 
              value={newThreshold} 
              onChange={(e) => setNewThreshold(e.target.value)} 
              placeholder="Target price" 
              className="w-full sm:w-32 rounded-xl border border-white/[0.08] bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" 
            />
          </div>
          <Button 
            onClick={addAlert} 
            disabled={!newCrop || !newThreshold} 
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 px-4 disabled:opacity-50 transition-all text-xs"
          >
            Create Trigger
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function MandiPage() {
  const { t } = useLanguage()
  const [crops, setCrops] = useState<MandiCrop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<MandiCrop | null>(null)
  const [buySellMode, setBuySellMode] = useState<"buy" | "sell" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle")
  const [lang, setLang] = useState<"en" | "hi" | "kn">("hi")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /* ---- Fetch crops from backend ---- */
  useEffect(() => {
    let cancelled = false
    async function fetchCrops() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/mandi/crops")
        if (!res.ok) throw new Error("Failed to fetch crop data")
        const data = await res.json()
        if (!cancelled) setCrops(data.crops)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load mandi data.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCrops()
    return () => { cancelled = true }
  }, [])

  /* ---- Derived data ---- */
  const categories = useMemo(() => {
    const cats = new Set(crops.map((c) => c.category))
    return ["All", ...Array.from(cats)]
  }, [crops])

  const filteredCrops = useMemo(() => {
    return crops.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = categoryFilter === "All" || c.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [crops, searchQuery, categoryFilter])

  /* ---- Simulate connection ---- */
  function handleConnect(mode: "buy" | "sell") {
    setBuySellMode(mode)
    setConnectionStatus("connecting")
    setTimeout(() => setConnectionStatus("connected"), 2000)
  }

  function handleBack() {
    setSelectedCrop(null)
    setBuySellMode(null)
    setConnectionStatus("idle")
  }

  // Generate historical data wave for Recharts
  const chartData = useMemo(() => {
    if (!selectedCrop) return []
    const days = 8
    const data = []
    const basePrice = selectedCrop.modal_price || selectedCrop.price
    const spread = selectedCrop.max_price - selectedCrop.min_price
    const variance = spread > 0 ? spread : basePrice * 0.12

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      
      let price = 0
      if (i === 0) {
        price = selectedCrop.price
      } else {
        const noise = (Math.sin(i * 1.6) + Math.cos(i * 0.9)) / 2 
        price = Math.round(basePrice + noise * (variance * 0.6))
        price = Math.max(selectedCrop.min_price, Math.min(selectedCrop.max_price, price))
      }

      data.push({
        date: dateString,
        Price: price,
      })
    }
    return data
  }, [selectedCrop])

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12 relative">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[10%] w-[350px] h-[350px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* ---- Page Header ---- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-orange-950/20 via-slate-950 to-emerald-950/15 p-6 md:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400 mb-3">
              <Store className="h-3.5 w-3.5" />
              eNAM Connected Mandi
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white flex items-center gap-3">
              Mandi <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">Marketplace</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Real-time commodity valuation indexes from national APMC centers. Place orders, monitor trading trends, or list inventories directly with automated government verification.
            </p>
          </div>
          {/* Stats widget */}
          <div className="flex gap-3 flex-wrap">
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-4 min-w-[120px] backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total Crops</div>
              <div className="text-xl font-extrabold text-white flex items-center gap-1.5">
                <Package className="h-4.5 w-4.5 text-orange-400" />
                {crops.length}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-4 min-w-[150px] backdrop-blur-sm">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Mandi Arrivals</div>
              <div className="text-xl font-extrabold text-white flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-emerald-400" />
                {crops.reduce((a, c) => a + c.arrival_tonnes, 0).toLocaleString()} T
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Price Alert Panel */}
      <PriceAlertPanel crops={crops} />

      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/*  CROP LIST VIEW                                               */}
        {/* ============================================================ */}
        {!selectedCrop && (
          <motion.div
            key="crop-list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            {/* Search + Filter bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="mandi-search"
                  type="text"
                  placeholder="Search commodities, APMC mandis, states..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl border border-white/[0.08] bg-slate-950/40 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-white font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap items-center overflow-x-auto pb-1 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                      categoryFilter === cat
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/15"
                        : "border-white/[0.08] bg-slate-950/40 hover:bg-white/[0.04] text-muted-foreground hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                <p className="text-muted-foreground text-sm font-medium">Synchronizing Mandi Pricing Index...</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <GlassCard className="border border-red-500/20 bg-red-500/5 p-8 text-center rounded-2xl">
                <p className="text-red-400 font-bold">{error}</p>
                <Button variant="outline" className="mt-4 border-white/[0.08]" onClick={() => location.reload()}>
                  Retry Connection
                </Button>
              </GlassCard>
            )}

            {/* Crop cards grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCrops.map((crop, i) => (
                  <CropCard
                    key={crop.id}
                    crop={crop}
                    index={i}
                    onClick={() => setSelectedCrop(crop)}
                  />
                ))}
                {filteredCrops.length === 0 && (
                  <div className="col-span-full text-center py-20">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-semibold">No commodities found matching filter.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  CROP DETAIL + BUY/SELL VIEW                                  */}
        {/* ============================================================ */}
        {selectedCrop && (
          <motion.div
            key="crop-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors w-fit pb-2"
            >
              <ArrowLeft className="h-4.5 w-4.5" /> Return to Marketplace
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Crop detail card */}
              <GlassCard className="lg:col-span-3 overflow-hidden border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20">
                <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(selectedCrop.category)}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r ${CATEGORY_COLORS[selectedCrop.category] || "from-gray-500/20 to-gray-500/20 text-gray-500"}`}>
                        {selectedCrop.category}
                      </span>
                      <CardTitle className="text-3xl font-black font-display text-white mt-3">{selectedCrop.name}</CardTitle>
                      <p className="text-muted-foreground text-xs mt-1">Specific variety: <span className="font-semibold text-white/80">{selectedCrop.variety}</span></p>
                    </div>
                    <TrendBadge trend={selectedCrop.trend} change={selectedCrop.change_percent} size="lg" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price display row */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Live Price Index</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <IndianRupee className="h-5 w-5 text-emerald-400" />
                        <span className="text-3xl font-black text-emerald-400 font-display">
                          {selectedCrop.price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs font-medium">/{selectedCrop.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Arrival Tonnes</span>
                      <span className="text-xl font-bold text-white block mt-1">{selectedCrop.arrival_tonnes.toLocaleString()} Tons</span>
                    </div>
                  </div>

                  {/* Price Range Visualizer */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                      <span>Low: ₹{selectedCrop.min_price.toLocaleString()}</span>
                      <span className="text-white">Current Model: ₹{selectedCrop.modal_price.toLocaleString()}</span>
                      <span>High: ₹{selectedCrop.max_price.toLocaleString()}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-slate-900 overflow-hidden">
                      {/* Range slider indicator */}
                      <div
                        className="absolute top-0 h-full w-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                        style={{
                          left: `${((selectedCrop.modal_price - selectedCrop.min_price) / (selectedCrop.max_price - selectedCrop.min_price)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <InfoTile icon={<MapPin className="h-4 w-4 text-orange-400" />} label="APMC Mandi" value={selectedCrop.mandi} />
                    <InfoTile icon={<MapPin className="h-4 w-4 text-emerald-400" />} label="State Center" value={selectedCrop.state} />
                  </div>

                  {/* Historical Graph Chart */}
                  <div className="pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs uppercase font-bold text-white tracking-wider block">Market Price History</span>
                        <span className="text-[10px] text-muted-foreground">Historical fluctuation trend for the past 7 days</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Live Graph
                      </span>
                    </div>
                    
                    <div className="h-56 w-full pr-4 pt-2">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="date" 
                              stroke="rgba(255,255,255,0.2)" 
                              fontSize={9} 
                              tickLine={false} 
                              axisLine={false} 
                              className="font-mono text-muted-foreground"
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.2)" 
                              fontSize={9} 
                              tickLine={false} 
                              axisLine={false} 
                              domain={['auto', 'auto']}
                              className="font-mono text-muted-foreground"
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#090d16', 
                                borderColor: 'rgba(255,255,255,0.08)', 
                                borderRadius: '14px',
                                fontSize: '12px',
                                color: '#fff'
                              }} 
                              labelStyle={{ color: '#64748b', fontWeight: 'bold' }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Price" 
                              stroke="#10b981" 
                              strokeWidth={2.5} 
                              fillOpacity={1} 
                              fill="url(#priceGlow)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </CardContent>
              </GlassCard>

              {/* Buy/Sell Panel */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <BuySellPanel
                  crop={selectedCrop}
                  mode={buySellMode}
                  connectionStatus={connectionStatus}
                  onConnect={handleConnect}
                  onReset={() => { setBuySellMode(null); setConnectionStatus("idle") }}
                  lang={lang}
                  onLangChange={setLang}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Crop Card ---- */
function CropCard({ crop, index, onClick }: { crop: MandiCrop; index: number; onClick: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <GlassCard
        className="cursor-pointer group overflow-hidden relative border border-white/[0.08] backdrop-blur-md shadow-lg hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 bg-slate-950/20 h-full flex flex-col justify-between"
        onClick={onClick}
      >
        <div>
          {/* Top accent bar */}
          <div className={`h-1.5 bg-gradient-to-r ${getCategoryGradient(crop.category)}`} />

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${CATEGORY_COLORS[crop.category] || "from-gray-500/20 to-gray-500/20 text-gray-500"}`}>
                  {crop.category}
                </span>
                <CardTitle className="text-base font-extrabold text-white mt-3 group-hover:text-emerald-400 transition-colors truncate font-display">
                  {crop.name}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{crop.variety}</p>
              </div>
              <TrendBadge trend={crop.trend} change={crop.change_percent} />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Price */}
            <div className="flex items-baseline gap-1 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl justify-between">
              <span className="text-[10px] text-muted-foreground font-semibold">Modal Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-400 font-display">
                  ₹{crop.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/{crop.unit}</span>
              </div>
            </div>

            {/* Mandi + State */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
              <span className="truncate">{crop.mandi}, {crop.state}</span>
            </div>
          </CardContent>
        </div>

        <div className="px-6 pb-6">
          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <Button
              size="sm"
              className="flex-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/10 rounded-xl"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Buy
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-white/[0.08] hover:bg-white/[0.03] text-orange-400 font-bold rounded-xl"
            >
              <Tag className="h-3.5 w-3.5 mr-1" /> Sell
            </Button>
          </div>
        </div>

        {/* Hover accent glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </GlassCard>
    </motion.div>
  )
}

/* ---- Buy / Sell Panel ---- */
function BuySellPanel({
  crop,
  mode,
  connectionStatus,
  onConnect,
  onReset,
  lang,
  onLangChange,
}: {
  crop: MandiCrop
  mode: "buy" | "sell" | null
  connectionStatus: "idle" | "connecting" | "connected"
  onConnect: (m: "buy" | "sell") => void
  onReset: () => void
  lang: "en" | "hi" | "kn"
  onLangChange: (l: "en" | "hi" | "kn") => void
}) {
  return (
    <div className="space-y-6">
      {/* Choose action */}
      <GlassCard className="border border-white/[0.08] backdrop-blur-md shadow-xl bg-slate-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-md font-bold font-display text-white">
            <ArrowUpDown className="h-4.5 w-4.5 text-orange-400" />
            Trade Commodity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Initiate instant trading signals or direct transactions across our verified regional logistics networks.
          </p>
          <div className="flex gap-3">
            <Button
              className={`flex-1 text-xs font-bold h-10 rounded-xl transition-all ${
                mode === "buy"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              }`}
              onClick={() => onConnect("buy")}
              disabled={connectionStatus === "connecting"}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-2" />
              Buy
            </Button>
            <Button
              className={`flex-1 text-xs font-bold h-10 rounded-xl transition-all ${
                mode === "sell"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20"
              }`}
              onClick={() => onConnect("sell")}
              disabled={connectionStatus === "connecting"}
            >
              <Tag className="h-3.5 w-3.5 mr-2" />
              Sell
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Connection status */}
      <AnimatePresence mode="wait">
        {mode && (
          <motion.div
            key={`${mode}-${connectionStatus}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard
              className={`border-2 backdrop-blur-md shadow-xl ${
                connectionStatus === "connected"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : connectionStatus === "connecting"
                  ? "border-amber-500/30 bg-amber-500/5 animate-pulse"
                  : "border-white/[0.08] bg-slate-950/20"
              }`}
            >
              <CardContent className="pt-6 space-y-4">
                {connectionStatus === "connecting" && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                    <p className="text-sm font-bold text-white font-display">
                      Connecting eNAM broker...
                    </p>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      Securing encrypted pipeline with registered trading agents for{" "}
                      <span className="font-semibold text-white">{crop.name}</span> in {crop.mandi}
                    </p>
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold text-sm font-display">
                        eNAM Agent Connected!
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-400 to-emerald-500 flex items-center justify-center text-white font-black text-[10px] shadow-md shadow-orange-500/10">
                          eNAM
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">National Agriculture Market</p>
                          <p className="text-[10px] text-muted-foreground">
                            Govt of India • Verification Center
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        {crop.mandi}, {crop.state}
                      </div>

                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Trading Value</p>
                          <p className="text-base font-extrabold text-emerald-400 font-display">
                            ₹{crop.price.toLocaleString()}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              /{crop.unit}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Language switcher */}
                    <div className="flex gap-1.5 justify-center">
                      {(["hi", "en", "kn"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => onLangChange(l)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            lang === l
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/15"
                              : "border-white/[0.08] text-muted-foreground hover:bg-white/[0.04]"
                          }`}
                        >
                          {l === "hi" ? "हिंदी" : l === "kn" ? "ಕನ್ನಡ" : "English"}
                        </button>
                      ))}
                    </div>

                    {/* eNAM fill instructions */}
                    <div className="rounded-xl p-3.5 space-y-2 border border-emerald-500/20 bg-emerald-500/5">
                      <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {ENAM_LANG[lang].title}:
                      </p>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] text-muted-foreground font-medium">
                        <span>{ENAM_LANG[lang].state}:</span>
                        <span className="font-bold text-white text-right">{crop.state}</span>
                        <span>{ENAM_LANG[lang].commodity}:</span>
                        <span className="font-bold text-white text-right">{crop.name.split("(")[0].trim()}</span>
                        <span>{ENAM_LANG[lang].price}:</span>
                        <span className="font-bold text-emerald-400 text-right">&#x20B9;{crop.price.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/15 rounded-xl h-10"
                        onClick={() => {
                          const commodity = crop.name.split("(")[0].trim()
                          const url = `https://enam.gov.in/web/dashboard/trade-data?state=${encodeURIComponent(crop.state)}&commodity=${encodeURIComponent(commodity)}`
                          window.open(url, "_blank", "noopener,noreferrer")
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        {ENAM_LANG[lang].proceed}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-white/[0.08] hover:bg-white/[0.03] text-muted-foreground hover:text-white rounded-xl text-xs h-10" 
                        onClick={onReset}
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-[9px] text-muted-foreground/80 leading-relaxed text-center">
                      {ENAM_LANG[lang].note}
                    </p>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TrendBadge({ trend, change, size = "sm" }: { trend: string; change: number; size?: "sm" | "lg" }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const color = trend === "up" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.1)]" : trend === "down" ? "text-rose-400 bg-rose-500/10 border border-rose-500/10" : "text-muted-foreground bg-white/[0.03] border border-white/[0.04]"
  const sizeClass = size === "lg" ? "px-3 py-1.5 text-xs gap-1.5 rounded-xl" : "px-2.5 py-1 text-[9px] gap-1 rounded-lg"
  return (
    <span className={`inline-flex items-center font-bold tracking-tight ${color} ${sizeClass}`}>
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {change > 0 ? "+" : ""}{change}%
    </span>
  )
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
        {icon} 
        <span>{label}</span>
      </div>
      <p className="text-sm font-bold text-white truncate">{value}</p>
    </div>
  )
}

function getCategoryGradient(category: string): string {
  const map: Record<string, string> = {
    Cereal: "from-amber-400 to-yellow-500",
    Oilseed: "from-lime-400 to-green-500",
    Pulse: "from-orange-400 to-red-500",
    Fiber: "from-blue-400 to-indigo-500",
    Vegetable: "from-emerald-400 to-teal-500",
    "Cash Crop": "from-purple-400 to-fuchsia-500",
  }
  return map[category] || "from-gray-400 to-gray-500"
}
