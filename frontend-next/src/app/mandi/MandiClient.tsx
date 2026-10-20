"use client"
import { useLanguage } from '@/lib/language'
import { trackEvent } from '@/lib/analytics'
import { TermTooltip } from '@/components/ui/TermTooltip'

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
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
  BadgeCheck,
  Calculator,
  Truck,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Building2,
  FileText,
  Check,
  RefreshCw,
  Clock,
  Flag,
  Send,
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

import { Lang, LANG_NAMES } from "@/lib/language"
import {
  ENAM_LANG,
  ALERT_LANG,
  MANDI_PAGE_LANG,
  TRADE_LANG,
  CATEGORY_LANG,
  SPEECH_MANDI,
  translateMandiData as translateData,
  MANDI_TABS_LANG,
} from "@/lib/mandi-i18n"
import {
  buyerRequirementsApi,
  BuyerRequirementItem,
  governmentProcurementApi,
  GovernmentProcurementItem,
  produceListingsApi,
  ProduceListingItem,
  tradeInquiriesApi,
  TradeInquiryItem,
  listingReportsApi,
  ListingReportItem,
  mandiApi,
} from "@/lib/farmer-api"
import marketplaceData from "@/lib/data/marketplace-data.json"

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                 */
/* ------------------------------------------------------------------ */
type ActiveTab = "prices" | "buy" | "sell" | "gov"

interface MandiCrop {
  id: number
  name: string
  variety: string
  price: number
  unit: string
  mandi: string
  state: string
  district?: string
  category: string
  trend: "up" | "down" | "stable"
  change_percent: number
  min_price: number
  max_price: number
  modal_price: number
  arrival_tonnes: number
  arrival_date?: string
  is_stale?: boolean
  stale_warning?: string
  source_origin?: string
  source_url?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Cereal: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400",
  Oilseed: "from-lime-500/10 to-green-500/10 border-lime-500/20 text-lime-600 dark:text-lime-400",
  Pulse: "from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
  Fiber: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  Vegetable: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  "Cash Crop": "from-purple-500/10 to-fuchsia-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
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

/* ------------------------------------------------------------------ */
/*  Price Alert System                                                 */
/* ------------------------------------------------------------------ */
const ALERT_KEY = "KisaanBuddy_mandi_alerts"
interface PriceAlert { id: string; cropName: string; threshold: number; direction: "above" | "below"; createdAt: number; fired?: boolean }
function readAlerts(): PriceAlert[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(ALERT_KEY) || "[]") } catch { return [] } }
function saveAlerts(a: PriceAlert[]) { if (typeof window !== "undefined") localStorage.setItem(ALERT_KEY, JSON.stringify(a)) }

function PriceAlertPanel({ crops }: { crops: MandiCrop[] }) {
  const { t, lang } = useLanguage()
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => readAlerts())
  const [showForm, setShowForm] = useState(false)
  const [newCrop, setNewCrop] = useState("")
  const [newThreshold, setNewThreshold] = useState("")
  const [newDir, setNewDir] = useState<"above" | "below">("above")
  const [permGranted, setPermGranted] = useState(false)
  const [checking, setChecking] = useState(false)
  
  const activeAlertLang = (lang as Lang) || "en"
  const currentLang = ALERT_LANG[activeAlertLang] || ALERT_LANG.en

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
        const notifTitle = t("mandi.KisaanBuddy_mandi_alert") || "KisaanBuddy Price Alert";
        const cropTranslated = translateData(match.name, activeAlertLang);
        const notifBody = `${cropTranslated}: ₹${match.modal_price} reached!`;
        
        new Notification(notifTitle, { 
          body: notifBody, 
          icon: "/icon-192.svg" 
        }); 
        return { ...alert, fired: true } 
      }
      return alert
    }); setAlerts(updated); saveAlerts(updated); setTimeout(() => setChecking(false), 800)
  }, [alerts, crops, permGranted, lang, activeAlertLang, t])

  const uniqueCrops = Array.from(new Set(crops.map((c) => c.name))).sort()

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md p-4 relative overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Bell className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm font-display">{currentLang.panelTitle}</div>
            <div className="text-xs text-muted-foreground">{alerts.length === 0 ? currentLang.setupMonitors : currentLang.activeMonitors(alerts.length)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {!permGranted && (
            <button 
              onClick={requestPerm} 
              className="text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all"
            >
              <BellRing className="h-3.5 w-3.5" /> {currentLang.enableNotifications}
            </button>
          )}
          {permGranted && alerts.length > 0 && (
            <button 
              onClick={checkNow} 
              disabled={checking} 
              className="text-xs rounded-xl border border-border bg-card hover:bg-accent px-3.5 py-2 text-foreground font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />} {currentLang.checkStatus}
            </button>
          )}
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="text-xs rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> {showForm ? currentLang.cancel : currentLang.addTargetPrice}
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-border/50">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-center gap-2 text-xs rounded-full px-3 py-1.5 border transition-all ${
                alert.fired 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                  : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}
            >
              <span>{alert.cropName} {alert.direction === "above" ? "≥" : "≤"} ₹{alert.threshold}</span>
              <button onClick={() => removeAlert(alert.id)} className="hover:text-red-500 transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="mt-4 p-4 rounded-xl bg-card border border-border flex flex-wrap gap-3 items-center">
          <select 
            value={newCrop} 
            onChange={(e) => setNewCrop(e.target.value)} 
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">{currentLang.selectCommodity}</option>
            {uniqueCrops.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select 
            value={newDir} 
            onChange={(e) => setNewDir(e.target.value as "above" | "below")} 
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="above">{currentLang.goesAbove}</option>
            <option value="below">{currentLang.goesBelow}</option>
          </select>
          <input 
            type="number" 
            value={newThreshold} 
            onChange={(e) => setNewThreshold(e.target.value)} 
            placeholder={currentLang.targetPricePlaceholder} 
            className="w-full sm:w-32 rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500" 
          />
          <Button 
            onClick={addAlert} 
            disabled={!newCrop || !newThreshold} 
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 px-4 disabled:opacity-50 transition-all text-xs"
          >
            {currentLang.createTrigger}
          </Button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Origin Badge Component                                            */
/* ------------------------------------------------------------------ */
function OriginBadge({ origin, className = "" }: { origin: string; className?: string }) {
  if (origin === "Official market-price data") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}>
        <Building2 className="h-3 w-3" />
        Official market-price data
      </span>
    )
  }
  if (origin === "Government procurement information") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 ${className}`}>
        <ShieldCheck className="h-3 w-3" />
        Government procurement information
      </span>
    )
  }
  if (origin === "External partner offer") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}>
        <ExternalLink className="h-3 w-3" />
        External partner offer
      </span>
    )
  }
  if (origin === "KisaanBuddy verified buyer requirement") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 ${className}`}>
        <CheckCircle2 className="h-3 w-3" />
        KisaanBuddy verified buyer requirement
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}>
      <BadgeCheck className="h-3 w-3" />
      KisaanBuddy verified seller listing
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function MandiPage() {
  const searchParams = useSearchParams()
  const { t, lang, setLang } = useLanguage()
  const plang = (lang as Lang) || "en"
  const tabT = MANDI_TABS_LANG[plang] || MANDI_TABS_LANG.en

  // Tabs state
  const [activeTab, setActiveTab] = useState<ActiveTab>("prices")

  // Tab 1: Prices State
  const [crops, setCrops] = useState<MandiCrop[]>([])
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [errorPrices, setErrorPrices] = useState<string | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<MandiCrop | null>(null)
  const [buySellMode, setBuySellMode] = useState<"buy" | "sell" | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [stateFilter, setStateFilter] = useState<string>("All")
  const [priceSort, setPriceSort] = useState<"default" | "price_desc" | "price_asc" | "date">("default")
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Tab 2: Buy Requirements State
  const [buyerReqs, setBuyerReqs] = useState<BuyerRequirementItem[]>(
    () => ((marketplaceData as any).buyer_requirements || [])
  )
  const [loadingBuy, setLoadingBuy] = useState(false)
  const [buySearch, setBuySearch] = useState("")
  const [buyState, setBuyState] = useState("All")

  // Tab 3: Sell Offers State
  const [sellOffers, setSellOffers] = useState<ProduceListingItem[]>(
    () => ((marketplaceData as any).produce_listings || [])
  )
  const [loadingSell, setLoadingSell] = useState(false)
  const [sellSearch, setSellSearch] = useState("")
  const [sellState, setSellState] = useState("All")

  // Tab 4: Government Procurement State
  const [govItems, setGovItems] = useState<GovernmentProcurementItem[]>(
    () => ((marketplaceData as any).government_procurement || [])
  )
  const [loadingGov, setLoadingGov] = useState(false)
  const [govSearch, setGovSearch] = useState("")
  const [govState, setGovState] = useState("All")

  // Modals state
  const [showPostProduceModal, setShowPostProduceModal] = useState(false)
  const [showPostRequirementModal, setShowPostRequirementModal] = useState(false)
  const [inquiryTarget, setInquiryTarget] = useState<{
    type: "produce_listing" | "buyer_requirement"
    id: number
    title: string
    defaultPrice?: number
    defaultQty?: number
    unit?: string
  } | null>(null)
  const [reportTarget, setReportTarget] = useState<{
    type: "produce_listing" | "buyer_requirement"
    id: number
    title: string
  } | null>(null)

  const voiceRun = searchParams.get("voice") === "1"
  const requestedCrop = searchParams.get("crop") || ""
  const requestedState = searchParams.get("state") || ""
  const voiceSpokenRef = useRef(false)

  // Toast auto-clear
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  /* ---- Fetch Mandi Crops ---- */
  const fetchCrops = useCallback(async () => {
    try {
      setLoadingPrices(true)
      setErrorPrices(null)
      const qs = new URLSearchParams()
      if (requestedCrop) qs.set("commodity", requestedCrop)
      if (requestedState) qs.set("state", requestedState)
      const query = qs.toString()
      const res = await fetch(`/api/mandi/crops${query ? `?${query}` : ""}`)
      if (!res.ok) throw new Error("Failed to fetch mandi crops")
      const data = await res.json()
      setCrops(data.crops || [])
    } catch (err: any) {
      setErrorPrices(err?.message || "Unable to load mandi data.")
    } finally {
      setLoadingPrices(false)
    }
  }, [requestedCrop, requestedState])

  useEffect(() => {
    fetchCrops()
  }, [fetchCrops])

  useEffect(() => {
    if (requestedCrop) setSearchQuery(requestedCrop)
  }, [requestedCrop])

  /* ---- Fetch Buy Requirements ---- */
  const fetchBuyRequirements = useCallback(async () => {
    try {
      setLoadingBuy(true)
      const res: any = await buyerRequirementsApi.list()
      const items = Array.isArray(res) ? res : (res?.items || [])
      if (items.length > 0) {
        setBuyerReqs(items)
      }
    } catch {
      // silent fallback preserves initial data
    } finally {
      setLoadingBuy(false)
    }
  }, [])

  /* ---- Fetch Sell Offers ---- */
  const fetchSellOffers = useCallback(async () => {
    try {
      setLoadingSell(true)
      const res: any = await produceListingsApi.list()
      const items = Array.isArray(res) ? res : (res?.items || [])
      if (items.length > 0) {
        setSellOffers(items)
      }
    } catch {
      // silent fallback preserves initial data
    } finally {
      setLoadingSell(false)
    }
  }, [])

  /* ---- Fetch Government Procurement ---- */
  const fetchGovProcurement = useCallback(async () => {
    try {
      setLoadingGov(true)
      const res: any = await governmentProcurementApi.list()
      const items = Array.isArray(res) ? res : (res?.items || [])
      if (items.length > 0) {
        setGovItems(items)
      }
    } catch {
      // silent fallback preserves initial data
    } finally {
      setLoadingGov(false)
    }
  }, [])

  // Lazy load tab data when clicked
  useEffect(() => {
    if (activeTab === "buy" && buyerReqs.length === 0) fetchBuyRequirements()
    if (activeTab === "sell" && sellOffers.length === 0) fetchSellOffers()
    if (activeTab === "gov" && govItems.length === 0) fetchGovProcurement()
  }, [activeTab, buyerReqs.length, sellOffers.length, govItems.length, fetchBuyRequirements, fetchSellOffers, fetchGovProcurement])

  // Voice Run handler
  useEffect(() => {
    if (!voiceRun || loadingPrices || voiceSpokenRef.current || crops.length === 0) return
    voiceSpokenRef.current = true
    const first = crops[0]
    const speechCfg = SPEECH_MANDI[lang as Lang] || SPEECH_MANDI.en
    const message = `${translateData(first.name, lang as Lang)}: ₹${first.price} ${first.unit}. ${translateData(first.mandi, lang as Lang)}, ${translateData(first.state, lang as Lang)}.`
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = speechCfg.bcp
      window.speechSynthesis.speak(utterance)
    }
  }, [voiceRun, loadingPrices, crops, lang])

  /* ---- Handle Refresh Prices ---- */
  async function handleRefreshPrices() {
    try {
      setRefreshingPrices(true)
      const res = await mandiApi.refresh()
      setToastMessage(res.message || "Mandi price intelligence updated.")
      await fetchCrops()
    } catch (err: any) {
      setToastMessage("Failed to refresh prices. Using cached dataset.")
    } finally {
      setRefreshingPrices(false)
    }
  }

  /* ---- Handle Confirm Stock on a Sell Listing ---- */
  async function handleConfirmStock(listingId: number) {
    try {
      const res = await produceListingsApi.confirmStock(listingId)
      const confirmedDate = res.last_confirmation_date || new Date().toISOString()
      setSellOffers((prev) =>
        prev.map((item) =>
          item.id === listingId
            ? { ...item, last_confirmation_date: confirmedDate }
            : item
        )
      )
      setToastMessage(res.message || "Stock and price confirmed successfully!")
      fetchSellOffers()
    } catch (err: any) {
      setToastMessage("Error confirming stock. Please try again.")
    }
  }

  /* ---- Derived States for Filters ---- */
  const cropCategories = useMemo(() => {
    const cats = new Set(crops.map((c) => c.category))
    return ["All", ...Array.from(cats)]
  }, [crops])

  const priceStates = useMemo(() => {
    const s = new Set(crops.map((c) => c.state).filter(Boolean))
    return ["All", ...Array.from(s).sort()]
  }, [crops])

  const buyStates = useMemo(() => {
    const s = new Set(buyerReqs.map((b) => b.buyer_location_state || (b as any).state).filter(Boolean))
    return ["All", ...Array.from(s).sort()]
  }, [buyerReqs])

  const sellStates = useMemo(() => {
    const s = new Set(sellOffers.map((o) => o.state).filter(Boolean))
    return ["All", ...Array.from(s).sort()]
  }, [sellOffers])

  const govStates = useMemo(() => {
    const s = new Set(govItems.map((g) => g.state).filter(Boolean))
    return ["All", ...Array.from(s).sort()]
  }, [govItems])

  // Filtered crops
  const filteredCrops = useMemo(() => {
    return crops
      .filter((c) => {
        const matchSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.state.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCat = categoryFilter === "All" || c.category === categoryFilter
        const matchState = stateFilter === "All" || c.state.toLowerCase() === stateFilter.toLowerCase()
        return matchSearch && matchCat && matchState
      })
      .sort((a, b) => {
        if (priceSort === "price_desc") return b.price - a.price
        if (priceSort === "price_asc") return a.price - b.price
        if (priceSort === "date" && a.arrival_date && b.arrival_date) {
          return new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime()
        }
        return 0
      })
  }, [crops, searchQuery, categoryFilter, stateFilter, priceSort])

  // Filtered buy requirements
  const filteredBuy = useMemo(() => {
    return buyerReqs.filter((b) => {
      const q = (buySearch || "").trim().toLowerCase()
      const commodity = (b.commodity || "").toLowerCase()
      const variety = (b.variety || "").toLowerCase()
      const buyerName = (b.buyer_name || "").toLowerCase()
      const district = (b.buyer_location_district || (b as any).district || "").toLowerCase()
      const state = (b.buyer_location_state || (b as any).state || "").toLowerCase()

      const matchSearch =
        !q ||
        commodity.includes(q) ||
        variety.includes(q) ||
        buyerName.includes(q) ||
        district.includes(q)
      const matchState = buyState === "All" || state === buyState.toLowerCase()
      return matchSearch && matchState
    })
  }, [buyerReqs, buySearch, buyState])

  // Filtered sell offers
  const filteredSell = useMemo(() => {
    return sellOffers.filter((s) => {
      const q = sellSearch.toLowerCase()
      const matchSearch =
        !q ||
        s.crop_name.toLowerCase().includes(q) ||
        (s.variety && s.variety.toLowerCase().includes(q)) ||
        s.farmer_name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      const matchState = sellState === "All" || s.state.toLowerCase() === sellState.toLowerCase()
      return matchSearch && matchState
    })
  }, [sellOffers, sellSearch, sellState])

  // Filtered government procurement
  const filteredGov = useMemo(() => {
    return govItems.filter((g) => {
      const q = (govSearch || "").trim().toLowerCase()
      const cropName = (g.crop_name || "").toLowerCase()
      const variety = (g.variety || "").toLowerCase()
      const centre = (g.procurement_centre_name || (g as any).procurement_center || "").toLowerCase()
      const agency = (g.nodal_agency || "").toLowerCase()
      const district = (g.district || "").toLowerCase()
      const state = (g.state || "").toLowerCase()

      const matchSearch =
        !q ||
        cropName.includes(q) ||
        variety.includes(q) ||
        centre.includes(q) ||
        agency.includes(q) ||
        district.includes(q)
      const matchState = govState === "All" || state === govState.toLowerCase()
      return matchSearch && matchState
    })
  }, [govItems, govSearch, govState])

  // Historical data for Recharts
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
      data.push({ date: dateString, Price: price })
    }
    return data
  }, [selectedCrop])

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 relative">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Toast alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-400/30"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Page Header ---- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[1.75rem] border border-[#1b6248] bg-[#123f31] p-5 shadow-[0_22px_55px_-30px_rgba(11,57,40,.85)] sm:p-7 md:p-8"
      >
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src="/images/mandi/grain-market-mandi.jpg"
            alt="Mandi Market"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="pointer-events-none absolute -right-12 -top-14 h-52 w-52 rounded-full bg-[#e7ae42]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-emerald-100 backdrop-blur-sm">
              <Store className="h-3.5 w-3.5" />
              {MANDI_PAGE_LANG[plang].enamConnected}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-[-.045em] text-white sm:text-4xl md:text-5xl font-display">
              <>{MANDI_PAGE_LANG[plang].heroTitleLead}<span className="text-[#f4c96b]">{MANDI_PAGE_LANG[plang].heroTitleAccent}</span></>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-50/80 md:text-base">
              {MANDI_PAGE_LANG[plang].heroSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="min-w-[120px] rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <div className="text-[10px] font-bold uppercase tracking-[.1em] text-emerald-100/70">Mandi Crops</div>
              <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-white">
                <Package className="h-4 w-4 text-[#f4c96b]" />
                {crops.length}
              </div>
            </div>
            <div className="min-w-[120px] rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <div className="text-[10px] font-bold uppercase tracking-[.1em] text-emerald-100/70">Buyer Demands</div>
              <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-white">
                <ShoppingCart className="h-4 w-4 text-emerald-200" />
                {buyerReqs.length || 6}
              </div>
            </div>
            <div className="min-w-[120px] rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-[.1em] text-emerald-100/70">MSP Centres</div>
              <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-white">
                <Building2 className="h-4 w-4 text-purple-200" />
                {govItems.length || 6}
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-6 grid gap-2 border-t border-white/10 pt-4 text-[11px] text-emerald-50/80 sm:grid-cols-3">
          <span className="flex items-center gap-2"><BadgeCheck className="h-3.5 w-3.5 text-[#f4c96b]" />{tabT.badgeOfficialPrice}</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#f4c96b]" />{tabT.badgeVerifiedBuyer}</span>
          <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#f4c96b]" />{tabT.badgeGovProcurement}</span>
        </div>
      </motion.div>

      {/* ---- 4-TAB NAVIGATION BAR ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border backdrop-blur-md">
        <button
          onClick={() => { setActiveTab("prices"); setSelectedCrop(null) }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === "prices"
              ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-md border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <Store className="h-4 w-4 shrink-0" />
          <span>{tabT.tabPrices}</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {crops.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("buy"); setSelectedCrop(null) }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === "buy"
              ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-md border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          <span>{tabT.tabBuy}</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
            {buyerReqs.length || 6}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("sell"); setSelectedCrop(null) }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === "sell"
              ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-md border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <Wheat className="h-4 w-4 shrink-0" />
          <span>{tabT.tabSell}</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {sellOffers.length || 6}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("gov"); setSelectedCrop(null) }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === "gov"
              ? "bg-card text-purple-600 dark:text-purple-400 shadow-md border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span>{tabT.tabGov}</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
            {govItems.length || 6}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/*  TAB 1: MANDI PRICES                                         */}
      {/* ============================================================ */}
      {activeTab === "prices" && (
        <div className="flex flex-col gap-6">
          {/* Disclaimer Banner */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-foreground">AGMARKNET Reference Intelligence: </span>
              {tabT.referenceDisclaimer}
            </div>
            <button
              onClick={handleRefreshPrices}
              disabled={refreshingPrices}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-[11px] font-bold text-foreground hover:bg-accent transition-all shadow-xs"
            >
              <RefreshCw className={`h-3 w-3 ${refreshingPrices ? "animate-spin text-emerald-500" : ""}`} />
              <span>{tabT.refreshPrices}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!selectedCrop && (
              <motion.div
                key="crop-list"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* Search & Multi-Filters */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="mandi-search"
                        type="text"
                        placeholder={tabT.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="All">All States</option>
                        {priceStates.filter((s) => s !== "All").map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <select
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value as any)}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="default">Sort: Default</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="date">Reporting Date: Newest</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex gap-1.5 flex-wrap items-center pt-1 border-t border-border/50">
                    {cropCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          categoryFilter === cat
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {CATEGORY_LANG[lang]?.[cat] || cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading State */}
                {loadingPrices && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <p className="text-muted-foreground text-xs font-semibold">Syncing AGMARKNET Market Registry...</p>
                  </div>
                )}

                {/* Error State */}
                {errorPrices && !loadingPrices && (
                  <GlassCard className="border border-red-500/20 bg-red-500/5 p-6 text-center rounded-2xl">
                    <p className="text-red-500 font-bold text-sm">{errorPrices}</p>
                    <Button variant="outline" className="mt-3 text-xs" onClick={() => fetchCrops()}>
                      Retry
                    </Button>
                  </GlassCard>
                )}

                {/* Crop Cards Grid */}
                {!loadingPrices && !errorPrices && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCrops.map((crop, i) => (
                        <CropCard
                          key={crop.id}
                          crop={crop}
                          index={i}
                          onClick={() => {
                            trackEvent({ type: 'mandi_search', crop: crop.name, state: crop.state, lang: lang });
                            setSelectedCrop(crop);
                          }}
                          lang={plang}
                        />
                      ))}
                      {filteredCrops.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-card border border-border rounded-2xl">
                          <Search className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                          <p className="text-muted-foreground text-xs font-semibold">No commodities match the selected filters.</p>
                        </div>
                      )}
                    </div>
                    <PriceAlertPanel crops={crops} />
                  </>
                )}
              </motion.div>
            )}

            {/* Crop Detail View */}
            {selectedCrop && (
              <motion.div
                key="crop-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors w-fit pb-1"
                >
                  <ArrowLeft className="h-4 w-4" /> {MANDI_PAGE_LANG[plang].returnMarketplace}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                  <GlassCard className="lg:col-span-3 overflow-hidden border border-border bg-card">
                    <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(selectedCrop.category)}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <OriginBadge origin={selectedCrop.source_origin || "Official market-price data"} />
                          <CardTitle className="text-2xl font-black text-foreground mt-2 font-display">
                            {translateData(selectedCrop.name, lang)}
                          </CardTitle>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            Variety: <span className="font-semibold text-foreground">{translateData(selectedCrop.variety, lang)}</span>
                          </p>
                        </div>
                        <TrendBadge trend={selectedCrop.trend} change={selectedCrop.change_percent} size="lg" />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {selectedCrop.is_stale && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2 font-medium">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{tabT.staleWarning}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <InfoTile icon={<IndianRupee className="h-3.5 w-3.5 text-blue-500" />} label="Min Price" value={`₹${selectedCrop.min_price.toLocaleString()}`} />
                        <InfoTile icon={<IndianRupee className="h-3.5 w-3.5 text-emerald-500" />} label="Modal Price" value={`₹${selectedCrop.modal_price.toLocaleString()}`} />
                        <InfoTile icon={<IndianRupee className="h-3.5 w-3.5 text-rose-500" />} label="Max Price" value={`₹${selectedCrop.max_price.toLocaleString()}`} />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-muted/40 border border-border">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Market Center</span>
                          <p className="font-bold text-foreground mt-0.5">{selectedCrop.mandi}, {selectedCrop.state}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/40 border border-border">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Arrival Volume</span>
                          <p className="font-bold text-foreground mt-0.5">{selectedCrop.arrival_tonnes.toLocaleString()} {t("mandi.t") || "Tonnes"}</p>
                        </div>
                      </div>

                      {/* Area Chart */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-foreground">7-Day Modal Price Trend</span>
                          <span className="text-[10px] text-muted-foreground font-mono">₹/Quintal</span>
                        </div>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" stroke="rgba(150,150,150,0.4)" fontSize={9} tickLine={false} axisLine={false} />
                              <YAxis stroke="rgba(150,150,150,0.4)" fontSize={9} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                              />
                              <Area type="monotone" dataKey="Price" stroke="#10b981" strokeWidth={2} fill="url(#priceGlow)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </GlassCard>

                  {/* eNAM Direct Assistance Panel */}
                  <div className="lg:col-span-2">
                    <BuySellPanel
                      crop={selectedCrop}
                      mode={buySellMode}
                      connectionStatus={connectionStatus}
                      onConnect={(m) => {
                        setBuySellMode(m)
                        setConnectionStatus("connecting")
                        setTimeout(() => setConnectionStatus("connected"), 1200)
                      }}
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
      )}

      {/* ============================================================ */}
      {/*  TAB 2: BUY REQUIREMENTS                                     */}
      {/* ============================================================ */}
      {activeTab === "buy" && (
        <div className="flex flex-col gap-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div>
              <h2 className="text-base font-bold text-foreground">Verified Buyer Requirements</h2>
              <p className="text-xs text-muted-foreground">Aggregated from verified institutional buyers, FPOs, and traders.</p>
            </div>
            <Button
              onClick={() => setShowPostRequirementModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-600/10"
            >
              <Plus className="h-3.5 w-3.5" />
              {tabT.postRequirement}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search commodity, buyer, district..."
                value={buySearch}
                onChange={(e) => setBuySearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <select
              value={buyState}
              onChange={(e) => setBuyState(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Buyer States</option>
              {buyStates.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Offers expire automatically at expiry date. Submitting quotation initiates direct discussion; it does not constitute an automated debit or transaction.</span>
          </div>

          {/* Buy Requirements Grid */}
          {loadingBuy ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBuy.map((b) => (
                <div key={b.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:border-teal-500/30 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <OriginBadge origin={b.source || "KisaanBuddy verified buyer requirement"} />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (b.status as string) === "open" || (b.status as string) === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground"
                      }`}>
                        {(b.status || "OPEN").toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-foreground font-display">{b.commodity}</h3>
                      <p className="text-xs text-muted-foreground">Variety: <span className="font-semibold text-foreground">{b.variety || "Standard Grade"}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-muted/30 border border-border/60 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Required Volume</span>
                        <p className="font-bold text-foreground text-sm">{b.required_quantity.toLocaleString()} {b.quantity_unit}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Target Price</span>
                        <p className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                          {b.expected_price_min && b.expected_price_max
                            ? `₹${b.expected_price_min.toLocaleString()} - ₹${b.expected_price_max.toLocaleString()}`
                            : ((b as any).expected_price ? `₹${(b as any).expected_price.toLocaleString()}` : "Market Negotiable")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-bold text-foreground">{b.buyer_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted">({b.buyer_type})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Delivery to: {b.delivery_destination || `${b.buyer_location_district || (b as any).district}, ${b.buyer_location_state || (b as any).state}`}</span>
                      </div>
                      {(b.quality_specifications || (b as any).quality_requirements) && (
                        <div className="text-[11px] text-muted-foreground italic">
                          Specs: {b.quality_specifications || (b as any).quality_requirements}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Expires: {b.offer_expiry_date ? new Date(b.offer_expiry_date).toLocaleDateString() : "Active"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReportTarget({ type: "buyer_requirement", id: b.id, title: `${b.commodity} requirement` })}
                        className="text-xs text-muted-foreground hover:text-red-500 h-8 px-2"
                      >
                        <Flag className="h-3 w-3 mr-1" /> Report
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setInquiryTarget({
                          type: "buyer_requirement",
                          id: b.id,
                          title: `Supply Offer for ${b.commodity}`,
                          defaultQty: b.required_quantity,
                          defaultPrice: b.expected_price_min || undefined,
                          unit: b.quantity_unit,
                        })}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-8 px-3 rounded-lg"
                      >
                        <Send className="h-3 w-3 mr-1" /> {tabT.submitQuote}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredBuy.length === 0 && (
                <div className="col-span-full text-center py-12 bg-card border border-border rounded-2xl">
                  <p className="text-xs text-muted-foreground">No buyer requirements currently match your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB 3: SELL OFFERS                                          */}
      {/* ============================================================ */}
      {activeTab === "sell" && (
        <div className="flex flex-col gap-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div>
              <h2 className="text-base font-bold text-foreground">Verified Farmer & FPO Sell Listings</h2>
              <p className="text-xs text-muted-foreground">Source directly from genuine harvest lots with stock verification.</p>
            </div>
            <Button
              onClick={() => setShowPostProduceModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
            >
              <Plus className="h-3.5 w-3.5" />
              {tabT.postListing}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search crop, variety, farmer, district..."
                value={sellSearch}
                onChange={(e) => setSellSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <select
              value={sellState}
              onChange={(e) => setSellState(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Producer States</option>
              {sellStates.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Farmers maintain full control. Contacting a seller or expressing interest opens direct negotiation with mutual consent.</span>
          </div>

          {/* Sell Listings Grid */}
          {loadingSell ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSell.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:border-emerald-500/30 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <OriginBadge origin={s.source_origin || "KisaanBuddy verified seller listing"} />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.availability_status === "available" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground"
                      }`}>
                        {s.availability_status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-foreground font-display">{s.crop_name}</h3>
                      <p className="text-xs text-muted-foreground">Variety: <span className="font-semibold text-foreground">{s.variety || "Standard"}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-muted/30 border border-border/60 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Lot Size</span>
                        <p className="font-bold text-foreground text-sm">{s.quantity.toLocaleString()} {s.quantity_unit}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Asking Price</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{s.asking_price.toLocaleString()}/{s.price_unit}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-bold text-foreground">{s.farmer_name}</span>
                        <span className="text-[10px] font-mono bg-muted px-1.5 py-0.2 rounded">{s.farmer_phone_masked || "+91 98*** *****"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{s.village_or_tehsil ? `${s.village_or_tehsil}, ` : ""}{s.district}, {s.state}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] pt-1">
                        <span>Quality: <strong className="text-foreground">{s.grade_or_quality}</strong></span>
                        {s.moisture_pct !== null && s.moisture_pct !== undefined && (
                          <span>Moisture: <strong className="text-foreground">{s.moisture_pct}%</strong></span>
                        )}
                        <span>Delivery: <strong className="text-foreground">{s.delivery_option}</strong></span>
                      </div>
                    </div>

                    {s.last_confirmation_date && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="h-3 w-3" />
                        <span>Stock confirmed by seller on {new Date(s.last_confirmation_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConfirmStock(s.id)}
                      className="text-[11px] h-8 px-2.5 rounded-lg border-border hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                    >
                      <Check className="h-3 w-3 mr-1" /> {tabT.confirmStock}
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReportTarget({ type: "produce_listing", id: s.id, title: `${s.crop_name} lot` })}
                        className="text-xs text-muted-foreground hover:text-red-500 h-8 px-2"
                      >
                        <Flag className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setInquiryTarget({
                          type: "produce_listing",
                          id: s.id,
                          title: `Inquiry for ${s.crop_name} (${s.quantity} ${s.quantity_unit})`,
                          defaultQty: s.quantity,
                          defaultPrice: s.asking_price,
                          unit: s.quantity_unit,
                        })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-lg"
                      >
                        <Phone className="h-3 w-3 mr-1" /> {tabT.contactSeller}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSell.length === 0 && (
                <div className="col-span-full text-center py-12 bg-card border border-border rounded-2xl">
                  <p className="text-xs text-muted-foreground">No produce listings found matching the criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB 4: GOVERNMENT PROCUREMENT (MSP)                         */}
      {/* ============================================================ */}
      {activeTab === "gov" && (
        <div className="flex flex-col gap-6">
          {/* Official MSP Notice Banner */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-bold text-foreground">Official Government Procurement & Fair Average Quality (FAQ) MSP Centres</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tabT.mspDisclaimer}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search crop, procurement centre, agency..."
                value={govSearch}
                onChange={(e) => setGovSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <select
              value={govState}
              onChange={(e) => setGovState(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="All">All Procurement States</option>
              {govStates.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Procurement Centres Grid */}
          {loadingGov ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGov.map((g) => (
                <div key={g.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:border-purple-500/30 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <OriginBadge origin={g.source_provenance || "Government procurement information"} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {g.procurement_season}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-foreground font-display">{g.crop_name}</h3>
                      <p className="text-xs text-muted-foreground">Centre: <strong className="text-foreground">{g.procurement_centre_name || (g as any).procurement_center}</strong></p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-purple-500/5 border border-purple-500/20 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Base MSP Rate</span>
                        <p className="font-bold text-foreground text-sm">₹{(g.msp_rate_per_quintal || (g as any).msp_rate || 0).toLocaleString()}/qtl</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold">Effective Rate</span>
                        <p className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                          ₹{(g.effective_procurement_rate || g.msp_rate_per_quintal || (g as any).msp_rate || 0).toLocaleString()}/qtl
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Nodal Agency: <strong className="text-foreground">{g.nodal_agency}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Location: {g.district}, {g.state}</span>
                      </div>
                      {(g.faq_specs || (g as any).faq_specifications) && (
                        <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground">
                          <span className="font-bold text-foreground block mb-0.5">FAQ Specifications:</span>
                          {g.faq_specs || (g as any).faq_specifications}
                        </div>
                      )}
                      {(g.eligibility_criteria || (g as any).registration_requirements) && (
                        <div className="text-[11px] text-muted-foreground">
                          Requirements: {g.eligibility_criteria || (g as any).registration_requirements}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    {g.contact_helpline ? (
                      <a
                        href={`tel:${g.contact_helpline}`}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" /> {g.contact_helpline}
                      </a>
                    ) : <span />}

                    {g.registration_portal_url && (
                      <a
                        href={g.registration_portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/10 transition-all"
                      >
                        <span>{g.registration_portal_name || "Official Portal"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {filteredGov.length === 0 && (
                <div className="col-span-full text-center py-12 bg-card border border-border rounded-2xl">
                  <p className="text-xs text-muted-foreground">No government procurement centres found for this search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/*  MODALS                                                      */}
      {/* ============================================================ */}

      {/* Post Produce Listing Modal */}
      {showPostProduceModal && (
        <PostProduceListingModal
          onClose={() => setShowPostProduceModal(false)}
          onSuccess={() => {
            setShowPostProduceModal(false)
            setToastMessage("Produce listing created successfully!")
            fetchSellOffers()
          }}
        />
      )}

      {/* Post Buyer Requirement Modal */}
      {showPostRequirementModal && (
        <PostBuyerRequirementModal
          onClose={() => setShowPostRequirementModal(false)}
          onSuccess={() => {
            setShowPostRequirementModal(false)
            setToastMessage("Buyer requirement posted successfully!")
            fetchBuyRequirements()
          }}
        />
      )}

      {/* Trade Inquiry Modal */}
      {inquiryTarget && (
        <SubmitInquiryModal
          target={inquiryTarget}
          onClose={() => setInquiryTarget(null)}
          onSuccess={() => {
            setInquiryTarget(null)
            setToastMessage("Inquiry / Quotation sent to party successfully!")
          }}
        />
      )}

      {/* Report Listing Modal */}
      {reportTarget && (
        <ReportListingModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
          onSuccess={() => {
            setReportTarget(null)
            setToastMessage("Report submitted to review team. Thank you for keeping the marketplace safe.")
          }}
        />
      )}
    </div>
  )
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

/* ---- Crop Card ---- */
function CropCard({ crop, index, onClick, lang }: { crop: MandiCrop; index: number; onClick: () => void; lang: Lang }) {
  const { t } = useLanguage()
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      <GlassCard
        className="cursor-pointer group overflow-hidden relative border border-border backdrop-blur-md shadow-xs hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 bg-card h-full flex flex-col justify-between"
        onClick={onClick}
      >
        <div>
          <div className={`h-1.5 bg-gradient-to-r ${getCategoryGradient(crop.category)}`} />

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <OriginBadge origin={crop.source_origin || "Official market-price data"} className="mb-2" />
                <CardTitle className="text-base font-extrabold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate font-display">
                  {translateData(crop.name, lang)}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{translateData(crop.variety, lang)}</p>
              </div>
              <TrendBadge trend={crop.trend} change={crop.change_percent} />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-1 bg-muted/40 border border-border p-3 rounded-xl justify-between">
              <span className="text-[10px] text-muted-foreground font-semibold">{t("mandi.modal_price") || "Modal Price"}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                  ₹{crop.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/{translateData(crop.unit, lang)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400/80" />
              <span className="truncate">{translateData(crop.mandi, lang)}, {translateData(crop.state, lang)}</span>
            </div>

            {crop.is_stale && (
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Daily Reported (Historical)</span>
              </div>
            )}
          </CardContent>
        </div>

        <div className="px-5 pb-5">
          <Button
            size="sm"
            className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
          >
            <span>View Price Intelligence</span>
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function TrendBadge({ trend, change, size = "sm" }: { trend: string; change: number; size?: "sm" | "lg" }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const color = trend === "up" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : trend === "down" ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20" : "text-muted-foreground bg-muted border border-border"
  const sizeClass = size === "lg" ? "px-3 py-1.5 text-xs gap-1.5 rounded-xl" : "px-2 py-0.5 text-[9px] gap-1 rounded-lg"
  return (
    <span className={`inline-flex items-center font-bold ${color} ${sizeClass}`}>
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {change > 0 ? "+" : ""}{change}%
    </span>
  )
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/40 border border-border">
      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
        {icon} 
        <span>{label}</span>
      </div>
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
    </div>
  )
}

/* ---- Buy/Sell Drilldown Panel with eNAM ---- */
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
  lang: string
  onLangChange: (l: Lang) => void
}) {
  const enam = ENAM_LANG[lang as Lang] || ENAM_LANG.en
  return (
    <GlassCard className="border border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 font-display">
          <Store className="h-4 w-4 text-emerald-500" />
          Official e-NAM & Trading Desk
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === "idle" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect with APMC mandi desks or explore institutional procurement options for {crop.name}.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onConnect("buy")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-10"
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Buyer Guidance
              </Button>
              <Button
                variant="outline"
                onClick={() => onConnect("sell")}
                className="border-border text-foreground hover:bg-accent font-bold text-xs rounded-xl h-10"
              >
                <Wheat className="h-3.5 w-3.5 mr-1" /> Seller Guidance
              </Button>
            </div>
          </div>
        )}

        {connectionStatus === "connecting" && (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
            <p className="text-xs text-muted-foreground font-semibold">Connecting to APMC Directory...</p>
          </div>
        )}

        {connectionStatus === "connected" && (
          <div className="space-y-4 pt-1">
            <div className="rounded-xl p-3 space-y-2 border border-emerald-500/20 bg-emerald-500/5 text-xs">
              <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> {enam.title}
              </p>
              <div className="grid grid-cols-2 gap-y-1 text-muted-foreground">
                <span>{enam.state}:</span>
                <span className="font-bold text-foreground text-right">{crop.state}</span>
                <span>{enam.commodity}:</span>
                <span className="font-bold text-foreground text-right">{crop.name.split("(")[0].trim()}</span>
                <span>{enam.price}:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-right">₹{crop.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="tel:18002700224"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 flex items-center justify-center gap-2 text-xs shadow-xs transition-all"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{enam.callHelpdesk}</span>
              </a>
              <a
                href="mailto:enam.helpdesk@gmail.com"
                className="w-full border border-border bg-card hover:bg-accent text-foreground font-semibold rounded-xl h-10 flex items-center justify-center gap-2 text-xs transition-all"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-500" />
                <span>{enam.emailHelpdesk}</span>
              </a>
              <Button variant="ghost" onClick={onReset} className="w-full text-xs text-muted-foreground h-8">
                {enam.cancel}
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              {enam.helpdeskNote}
            </p>
          </div>
        )}
      </CardContent>
    </GlassCard>
  )
}

/* ================================================================== */
/*  MODAL COMPONENTS                                                  */
/* ================================================================== */

function PostProduceListingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [cropName, setCropName] = useState("")
  const [variety, setVariety] = useState("")
  const [quantity, setQuantity] = useState("")
  const [quantityUnit, setQuantityUnit] = useState("Quintal")
  const [askingPrice, setAskingPrice] = useState("")
  const [priceUnit, setPriceUnit] = useState("Quintal")
  const [state, setState] = useState("Madhya Pradesh")
  const [district, setDistrict] = useState("")
  const [village, setVillage] = useState("")
  const [grade, setGrade] = useState("FAQ")
  const [moisture, setMoisture] = useState("")
  const [delivery, setDelivery] = useState("Farmgate Pickup")
  const [farmerName, setFarmerName] = useState("")
  const [farmerPhone, setFarmerPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cropName || !quantity || !askingPrice || !farmerName || !farmerPhone) {
      setErr("Please fill all required fields.")
      return
    }
    try {
      setSubmitting(true)
      setErr(null)
      await produceListingsApi.create({
        crop_name: cropName,
        variety: variety || undefined,
        category: "Produce",
        quantity: parseFloat(quantity),
        quantity_unit: quantityUnit,
        asking_price: parseFloat(askingPrice),
        price_unit: priceUnit,
        is_negotiable: true,
        grade_or_quality: grade,
        moisture_pct: moisture ? parseFloat(moisture) : undefined,
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        contact_consent_verified: true,
        state,
        district: district || "Bhopal",
        village_or_tehsil: village || undefined,
        delivery_option: delivery,
        verification_status: "verified",
      } as any)
      onSuccess()
    } catch (error: any) {
      setErr(error?.message || "Failed to create listing.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-bold text-foreground font-display">List Your Produce for Sale</h3>
        <p className="text-xs text-muted-foreground mb-4">Reach verified buyers directly. Your contact number remains masked to prevent spam.</p>

        {err && <p className="text-xs text-red-500 font-semibold mb-3">{err}</p>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Crop Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Wheat, Soybean"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Variety</label>
              <input
                type="text"
                placeholder="e.g. Sharbati, Lokwan"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Available Quantity *</label>
              <div className="flex gap-1">
                <input
                  required
                  type="number"
                  placeholder="e.g. 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="rounded-xl border border-border bg-card px-2 text-foreground"
                >
                  <option value="Quintal">Qtl</option>
                  <option value="Tonnes">Ton</option>
                  <option value="Bags">Bags</option>
                </select>
              </div>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Asking Price (₹) *</label>
              <div className="flex gap-1">
                <input
                  required
                  type="number"
                  placeholder="e.g. 2400"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="rounded-xl border border-border bg-card px-2 text-foreground"
                >
                  <option value="Quintal">/Qtl</option>
                  <option value="Tonnes">/Ton</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              >
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">District *</label>
              <input
                required
                type="text"
                placeholder="District name"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Quality Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              >
                <option value="FAQ">FAQ (Fair Average Quality)</option>
                <option value="Grade A">Grade A</option>
                <option value="Organic">Certified Organic</option>
                <option value="Commercial">Commercial Standard</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Moisture % (Optional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 11.5"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Farmer / FPO Name *</label>
              <input
                required
                type="text"
                placeholder="Your full name"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Contact Phone *</label>
              <input
                required
                type="tel"
                placeholder="10-digit mobile"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground pt-1">
            By publishing, you confirm ownership of the stock and consent to receiving quotation inquiries from verified buyers.
          </p>

          <div className="flex gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Publish Produce Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PostBuyerRequirementModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [commodity, setCommodity] = useState("")
  const [variety, setVariety] = useState("")
  const [quantity, setQuantity] = useState("")
  const [quantityUnit, setQuantityUnit] = useState("Quintal")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [buyerType, setBuyerType] = useState("Wholesaler")
  const [phone, setPhone] = useState("")
  const [state, setState] = useState("Madhya Pradesh")
  const [district, setDistrict] = useState("")
  const [destination, setDestination] = useState("")
  const [specs, setSpecs] = useState("")
  const [expiryDays, setExpiryDays] = useState("14")
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!commodity || !quantity || !buyerName || !phone) {
      setErr("Please fill all required fields.")
      return
    }
    try {
      setSubmitting(true)
      setErr(null)
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + parseInt(expiryDays))

      await buyerRequirementsApi.create({
        commodity,
        variety: variety || undefined,
        required_quantity: parseFloat(quantity),
        quantity_unit: quantityUnit,
        expected_price_min: minPrice ? parseFloat(minPrice) : undefined,
        expected_price_max: maxPrice ? parseFloat(maxPrice) : undefined,
        price_unit: "Quintal",
        buyer_name: buyerName,
        buyer_type: buyerType,
        buyer_phone_masked: `+91 ${phone.slice(0, 2)}*** ${phone.slice(-4)}`,
        buyer_location_state: state,
        buyer_location_district: district || "Indore",
        delivery_destination: destination || undefined,
        quality_specifications: specs || undefined,
        offer_expiry_date: expiry.toISOString(),
        verification_status: "verified",
        source: "KisaanBuddy verified buyer requirement",
      })
      onSuccess()
    } catch (error: any) {
      setErr(error?.message || "Failed to post requirement.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-bold text-foreground font-display">Post Buyer Requirement</h3>
        <p className="text-xs text-muted-foreground mb-4">Publish your procurement demand to reach thousands of farmers and FPOs directly.</p>

        {err && <p className="text-xs text-red-500 font-semibold mb-3">{err}</p>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Commodity *</label>
              <input
                required
                type="text"
                placeholder="e.g. Chana, Mustard"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Variety</label>
              <input
                type="text"
                placeholder="e.g. Desi, Kabuli"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Required Quantity *</label>
              <div className="flex gap-1">
                <input
                  required
                  type="number"
                  placeholder="e.g. 200"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  className="rounded-xl border border-border bg-card px-2 text-foreground"
                >
                  <option value="Quintal">Qtl</option>
                  <option value="Tonnes">Ton</option>
                </select>
              </div>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Price Range (₹/Qtl)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-2 py-2 text-foreground"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-2 py-2 text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Buyer / Org Name *</label>
              <input
                required
                type="text"
                placeholder="Enterprise or trader name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Buyer Type</label>
              <select
                value={buyerType}
                onChange={(e) => setBuyerType(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              >
                <option value="Wholesaler">Wholesaler</option>
                <option value="Processor / Mill">Processor / Mill</option>
                <option value="FPO">FPO / Cooperative</option>
                <option value="Retail Chain">Retail Chain</option>
                <option value="Exporter">Exporter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">State *</label>
              <input
                required
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">District / Mandi</label>
              <input
                type="text"
                placeholder="District or delivery hub"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Contact Phone *</label>
              <input
                required
                type="tel"
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Validity (Days)</label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Quality Specifications</label>
            <textarea
              rows={2}
              placeholder="e.g. Max moisture 12%, clean sorted, sound grains only"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Post Requirement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SubmitInquiryModal({
  target,
  onClose,
  onSuccess,
}: {
  target: {
    type: "produce_listing" | "buyer_requirement"
    id: number
    title: string
    defaultPrice?: number
    defaultQty?: number
    unit?: string
  }
  onClose: () => void
  onSuccess: () => void
}) {
  const [offeredPrice, setOfferedPrice] = useState(target.defaultPrice ? String(target.defaultPrice) : "")
  const [offeredQty, setOfferedQty] = useState(target.defaultQty ? String(target.defaultQty) : "")
  const [inquirerName, setInquirerName] = useState("")
  const [inquirerPhone, setInquirerPhone] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inquirerName || !inquirerPhone) {
      setErr("Please provide your name and phone number.")
      return
    }
    try {
      setSubmitting(true)
      setErr(null)
      await tradeInquiriesApi.submit({
        target_type: target.type,
        target_id: target.id,
        inquiry_type: offeredPrice ? "quotation" : "inquiry",
        offered_price: offeredPrice ? parseFloat(offeredPrice) : undefined,
        price_unit: target.unit || "Quintal",
        offered_quantity: offeredQty ? parseFloat(offeredQty) : undefined,
        quantity_unit: target.unit || "Quintal",
        message: message || undefined,
        inquirer_name: inquirerName,
        inquirer_phone: inquirerPhone,
        inquirer_type: target.type === "produce_listing" ? "buyer" : "farmer",
      })
      onSuccess()
    } catch (error: any) {
      setErr(error?.message || "Failed to submit inquiry.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-base font-bold text-foreground font-display">Send Quotation / Express Interest</h3>
        <p className="text-xs text-muted-foreground mb-4">{target.title}</p>

        {err && <p className="text-xs text-red-500 font-semibold mb-3">{err}</p>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Your Offered Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 2350"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Lot Quantity ({target.unit || "Qtl"})</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={offeredQty}
                onChange={(e) => setOfferedQty(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Your Full Name *</label>
              <input
                required
                type="text"
                placeholder="Your name"
                value={inquirerName}
                onChange={(e) => setInquirerName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Your Contact Phone *</label>
              <input
                required
                type="tel"
                placeholder="10-digit number"
                value={inquirerPhone}
                onChange={(e) => setInquirerPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Message / Notes</label>
            <textarea
              rows={2}
              placeholder="Include pickup timing, payment terms or quality specifics..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <p className="text-[10px] text-muted-foreground pt-1">
            Note: Submitting an inquiry connects you directly with the other party. Transactions are completed upon inspection and mutual settlement.
          </p>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send Quotation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReportListingModal({
  target,
  onClose,
  onSuccess,
}: {
  target: { type: "produce_listing" | "buyer_requirement"; id: number; title: string }
  onClose: () => void
  onSuccess: () => void
}) {
  const [reason, setReason] = useState<string>("misleading_price")
  const [details, setDetails] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [reporterPhone, setReporterPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSubmitting(true)
      setErr(null)
      await listingReportsApi.submit({
        target_type: target.type,
        target_id: target.id,
        reason: reason as any,
        details: details || undefined,
        reporter_name: reporterName || undefined,
        reporter_phone: reporterPhone || undefined,
      })
      onSuccess()
    } catch (error: any) {
      setErr(error?.message || "Failed to submit report.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-base font-bold text-foreground font-display flex items-center gap-1.5 text-red-500">
          <Flag className="h-4 w-4" /> Report Listing
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Help us keep KisaanBuddy accurate and trustworthy.</p>

        {err && <p className="text-xs text-red-500 font-semibold mb-3">{err}</p>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Issue / Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
            >
              <option value="misleading_price">Misleading or false price</option>
              <option value="fake_listing">Fake listing / scam</option>
              <option value="out_of_stock">Out of stock / already sold</option>
              <option value="phone_unreachable">Phone number unreachable</option>
              <option value="wrong_location">Incorrect location or market</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Details (Optional)</label>
            <textarea
              rows={2}
              placeholder="Explain the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
