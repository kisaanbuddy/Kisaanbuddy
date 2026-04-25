"use client"

import { useState, useEffect, useMemo } from "react"
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
  Phone,
  MapPin,
  IndianRupee,
  Wheat,
  Loader2,
  X,
  Package,
  Users,
  ArrowUpDown,
  Filter,
} from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
/*  Motion Variants                                                    */
/* ------------------------------------------------------------------ */
const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const SCALE_IN = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
}

const SLIDE_RIGHT = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.25 } },
}

/* ------------------------------------------------------------------ */
/*  Category info map                                                  */
/* ------------------------------------------------------------------ */
const CATEGORY_COLORS: Record<string, string> = {
  Cereal: "from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400",
  Oilseed: "from-lime-500/20 to-green-500/20 text-lime-600 dark:text-lime-400",
  Pulse: "from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400",
  Fiber: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400",
  Vegetable: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
  "Cash Crop": "from-purple-500/20 to-fuchsia-500/20 text-purple-600 dark:text-purple-400",
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function MandiPage() {
  const [crops, setCrops] = useState<MandiCrop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<MandiCrop | null>(null)
  const [buySellMode, setBuySellMode] = useState<"buy" | "sell" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle")

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

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      {/* ---- Page Header ---- */}
      <motion.div initial="hidden" animate="visible" variants={FADE_UP}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-green-600 to-green-500 flex items-center gap-3">
              <Store className="text-orange-500 h-10 w-10 shrink-0" />
              Government Mandi
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Live crop prices from APMC mandis across India. Buy or sell directly.
            </p>
          </div>
          {/* Stats bar */}
          <div className="flex gap-3 flex-wrap">
            <div className="glass-panel px-4 py-2 flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-orange-500" />
              {crops.length} Crops
            </div>
            <div className="glass-panel px-4 py-2 flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-green-500" />
              {crops.reduce((a, c) => a + c.arrival_tonnes, 0).toLocaleString()} T arrivals
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/*  CROP LIST VIEW                                               */}
        {/* ============================================================ */}
        {!selectedCrop && (
          <motion.div
            key="crop-list"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={FADE_UP}
            className="flex flex-col gap-6"
          >
            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="mandi-search"
                  type="text"
                  placeholder="Search crops, mandis, states..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background/80 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      categoryFilter === cat
                        ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25"
                        : "border-input bg-background/60 hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <p className="text-muted-foreground">Loading mandi prices...</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <GlassCard className="bg-red-500/10 border-red-500/20 p-8 text-center">
                <p className="text-red-500 font-medium">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => location.reload()}>
                  Retry
                </Button>
              </GlassCard>
            )}

            {/* Crop cards grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCrops.map((crop, i) => (
                  <CropCard
                    key={crop.id}
                    crop={crop}
                    index={i}
                    onClick={() => setSelectedCrop(crop)}
                  />
                ))}
                {filteredCrops.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No crops found matching your search.</p>
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
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={SLIDE_RIGHT}
            className="flex flex-col gap-6"
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Crop List
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Crop detail card */}
              <GlassCard className="lg:col-span-3 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(selectedCrop.category)}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-gradient-to-r ${CATEGORY_COLORS[selectedCrop.category] || "from-gray-500/20 to-gray-500/20 text-gray-500"}`}>
                        {selectedCrop.category}
                      </span>
                      <CardTitle className="text-2xl mt-2">{selectedCrop.name}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">Variety: {selectedCrop.variety}</p>
                    </div>
                    <TrendBadge trend={selectedCrop.trend} change={selectedCrop.change_percent} size="lg" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price row */}
                  <div className="flex items-baseline gap-2">
                    <IndianRupee className="h-6 w-6 text-green-500" />
                    <span className="text-4xl font-black text-green-600 dark:text-green-400">
                      {selectedCrop.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm">/{selectedCrop.unit}</span>
                  </div>

                  {/* Price range bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Min: ₹{selectedCrop.min_price.toLocaleString()}</span>
                      <span>Modal: ₹{selectedCrop.modal_price.toLocaleString()}</span>
                      <span>Max: ₹{selectedCrop.max_price.toLocaleString()}</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 overflow-hidden">
                      <div
                        className="absolute top-0 h-full w-1.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                        style={{
                          left: `${((selectedCrop.modal_price - selectedCrop.min_price) / (selectedCrop.max_price - selectedCrop.min_price)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoTile icon={<MapPin className="h-4 w-4" />} label="Mandi" value={selectedCrop.mandi} />
                    <InfoTile icon={<MapPin className="h-4 w-4" />} label="State" value={selectedCrop.state} />
                    <InfoTile icon={<Package className="h-4 w-4" />} label="Arrivals" value={`${selectedCrop.arrival_tonnes.toLocaleString()} T`} />
                    <InfoTile icon={<Wheat className="h-4 w-4" />} label="Variety" value={selectedCrop.variety} />
                  </div>
                </CardContent>
              </GlassCard>

              {/* Buy/Sell Panel */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                <BuySellPanel
                  crop={selectedCrop}
                  mode={buySellMode}
                  connectionStatus={connectionStatus}
                  onConnect={handleConnect}
                  onReset={() => { setBuySellMode(null); setConnectionStatus("idle") }}
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
    <motion.div custom={index} initial="hidden" animate="visible" variants={SCALE_IN}>
      <GlassCard
        className="cursor-pointer group overflow-hidden relative"
        onClick={onClick}
      >
        {/* Top accent bar */}
        <div className={`h-1.5 bg-gradient-to-r ${getCategoryGradient(crop.category)}`} />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${CATEGORY_COLORS[crop.category] || "from-gray-500/20 to-gray-500/20 text-gray-500"}`}>
                {crop.category}
              </span>
              <CardTitle className="text-base mt-2 group-hover:text-green-500 transition-colors truncate">
                {crop.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{crop.variety}</p>
            </div>
            <TrendBadge trend={crop.trend} change={crop.change_percent} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-green-600 dark:text-green-400">
              ₹{crop.price.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">/{crop.unit}</span>
          </div>

          {/* Mandi + State */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{crop.mandi}, {crop.state}</span>
          </div>

          {/* Action hint */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-600 hover:to-emerald-700"
            >
              <ShoppingCart className="h-3 w-3 mr-1" /> Buy
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
            >
              <Tag className="h-3 w-3 mr-1" /> Sell
            </Button>
          </div>
        </CardContent>

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
}: {
  crop: MandiCrop
  mode: "buy" | "sell" | null
  connectionStatus: "idle" | "connecting" | "connected"
  onConnect: (m: "buy" | "sell") => void
  onReset: () => void
}) {
  return (
    <>
      {/* Choose action */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpDown className="h-5 w-5 text-orange-500" />
            Trade This Crop
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Choose an action to connect with a registered {mode === "buy" ? "seller" : mode === "sell" ? "buyer" : "buyer or seller"} on the mandi network.
          </p>
          <div className="flex gap-3">
            <Button
              className={`flex-1 text-sm font-bold transition-all ${
                mode === "buy"
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 hover:shadow-lg"
              }`}
              onClick={() => onConnect("buy")}
              disabled={connectionStatus === "connecting"}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy
            </Button>
            <Button
              variant="outline"
              className={`flex-1 text-sm font-bold transition-all ${
                mode === "sell"
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30"
                  : "border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
              }`}
              onClick={() => onConnect("sell")}
              disabled={connectionStatus === "connecting"}
            >
              <Tag className="h-4 w-4 mr-2" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard
              className={`border-2 ${
                connectionStatus === "connected"
                  ? "border-green-500/40 bg-green-500/5"
                  : connectionStatus === "connecting"
                  ? "border-yellow-500/40 bg-yellow-500/5"
                  : ""
              }`}
            >
              <CardContent className="pt-6 space-y-4">
                {connectionStatus === "connecting" && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
                    </div>
                    <p className="text-sm font-medium">
                      Connecting with {mode === "buy" ? "seller" : "buyer"}...
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Searching registered {mode === "buy" ? "sellers" : "buyers"} for{" "}
                      <span className="font-semibold">{crop.name}</span> at {crop.mandi}
                    </p>
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold text-sm">
                        {mode === "buy" ? "Seller" : "Buyer"} Found!
                      </span>
                    </div>

                    <div className="glass-panel p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                          {mode === "buy" ? "RS" : "AK"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {mode === "buy" ? "Ramesh Sharma" : "Amit Kumar"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Registered {mode === "buy" ? "Seller" : "Buyer"} • {crop.mandi}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        +91 98XXX XXXXX
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {crop.mandi}, {crop.state}
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Offered price for <span className="font-semibold">{crop.name}</span>
                        </p>
                        <p className="text-lg font-black text-green-600 dark:text-green-400">
                          ₹{crop.price.toLocaleString()}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            /{crop.unit}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold shadow-lg shadow-green-500/25"
                        onClick={() => {
                          alert(
                            `✅ Your ${mode === "buy" ? "purchase" : "sell"} request for ${crop.name} has been submitted to ${mode === "buy" ? "Ramesh Sharma" : "Amit Kumar"}!\n\nYou will receive an SMS confirmation shortly.`
                          )
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Confirm {mode === "buy" ? "Purchase" : "Sale"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={onReset}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---- Small helper components ---- */

function TrendBadge({ trend, change, size = "sm" }: { trend: string; change: number; size?: "sm" | "lg" }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const color =
    trend === "up"
      ? "text-green-600 dark:text-green-400 bg-green-500/15"
      : trend === "down"
      ? "text-red-500 dark:text-red-400 bg-red-500/15"
      : "text-muted-foreground bg-muted"
  const sizeClass = size === "lg" ? "px-3 py-1.5 text-sm gap-1.5" : "px-2 py-1 text-[10px] gap-1"

  return (
    <span className={`inline-flex items-center font-bold rounded-lg ${color} ${sizeClass}`}>
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
      {change > 0 ? "+" : ""}
      {change}%
    </span>
  )
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-panel p-3 rounded-xl">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon} {label}
      </div>
      <p className="text-sm font-semibold truncate">{value}</p>
    </div>
  )
}

/* ---- Utility ---- */
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
