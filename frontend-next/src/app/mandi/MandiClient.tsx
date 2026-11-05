"use client"
import { useLanguage } from '@/lib/language'
import { trackEvent } from '@/lib/analytics'
import { TermTooltip } from '@/components/ui/TermTooltip'
import { QuickReviewCard } from '@/components/farmer/QuickReviewCard'

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
  SlidersHorizontal,
} from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HistoricalPriceChart } from "@/components/mandi/HistoricalPriceChart"

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
    <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4" aria-label="Target price alerts">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
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
              className="min-h-9 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 flex items-center gap-1.5 transition-colors"
            >
              <BellRing className="h-3.5 w-3.5" /> {currentLang.enableNotifications}
            </button>
          )}
          {permGranted && alerts.length > 0 && (
            <button 
              onClick={checkNow} 
              disabled={checking} 
              className="min-h-9 text-xs rounded-lg border border-border bg-card hover:bg-muted px-3.5 text-foreground font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />} {currentLang.checkStatus}
            </button>
          )}
          <button 
            onClick={() => setShowForm(!showForm)}
            aria-expanded={showForm}
            className="min-h-9 text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5 transition-colors"
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
        <div className="mt-4 grid gap-3 rounded-lg bg-card border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <select 
            value={newCrop} 
            onChange={(e) => setNewCrop(e.target.value)} 
            aria-label="Commodity for price alert"
            className="h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/15"
          >
            <option value="">{currentLang.selectCommodity}</option>
            {uniqueCrops.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select 
            value={newDir} 
            onChange={(e) => setNewDir(e.target.value as "above" | "below")} 
            aria-label="Price alert direction"
            className="h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/15"
          >
            <option value="above">{currentLang.goesAbove}</option>
            <option value="below">{currentLang.goesBelow}</option>
          </select>
          <input 
            type="number" 
            value={newThreshold} 
            onChange={(e) => setNewThreshold(e.target.value)} 
            placeholder={currentLang.targetPricePlaceholder} 
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/15"
          />
          <Button 
            onClick={addAlert} 
            disabled={!newCrop || !newThreshold} 
            className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-4 disabled:opacity-50 transition-colors text-xs"
          >
            {currentLang.createTrigger}
          </Button>
        </div>
      )}
    </section>
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
  const tabParam = searchParams.get("tab")
  const initialTab: ActiveTab = (tabParam === "buy" || tabParam === "sell" || tabParam === "gov") ? tabParam : "prices"
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab)

  useEffect(() => {
    const currentTab = searchParams.get("tab")
    if (currentTab === "buy" || currentTab === "sell" || currentTab === "gov" || currentTab === "prices") {
      setActiveTab(currentTab)
    }
  }, [searchParams])

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
  const requestedDistrict = searchParams.get("district") || ""
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
      if (requestedDistrict) qs.set("district", requestedDistrict)
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
  }, [requestedCrop, requestedState, requestedDistrict])

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

  function clearPriceFilters() {
    setSearchQuery("")
    setCategoryFilter("All")
    setStateFilter("All")
    setPriceSort("default")
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

  const hasPriceFilters = Boolean(searchQuery) || categoryFilter !== "All" || stateFilter !== "All" || priceSort !== "default"

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

  return (
    <div className="flex flex-col gap-6 w-full pb-16">

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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-bold text-primary">
            <Store className="h-3.5 w-3.5" aria-hidden="true" />
            {MANDI_PAGE_LANG[plang].enamConnected}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-display">
            {MANDI_PAGE_LANG[plang].heroTitleLead}<span className="text-primary">{MANDI_PAGE_LANG[plang].heroTitleAccent}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {MANDI_PAGE_LANG[plang].heroSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 divide-x divide-border rounded-xl border border-border bg-muted/25 px-3 py-2 self-start sm:self-auto">
          <div className="px-2 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Crops</div>
            <div className="mt-0.5 text-sm font-extrabold text-foreground">{crops.length}</div>
          </div>
          <div className="pl-3 px-2 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Buyers</div>
            <div className="mt-0.5 text-sm font-extrabold text-foreground">{buyerReqs.length || 6}</div>
          </div>
          <div className="pl-3 px-2 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">MSP Centres</div>
            <div className="mt-0.5 text-sm font-extrabold text-foreground">{govItems.length || 6}</div>
          </div>
        </div>
      </motion.div>

      {/* ---- 4-TAB NAVIGATION BAR ---- */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-2xs" role="tablist" aria-label="Mandi services">
        <button
          onClick={() => { setActiveTab("prices") }}
          role="tab"
          aria-selected={activeTab === "prices"}
          className={`min-h-[42px] min-w-max flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === "prices"
              ? "bg-primary text-white shadow-xs font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Store className="h-4 w-4 shrink-0" />
          <span>{tabT.tabPrices}</span>
          <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === "prices" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {crops.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("buy") }}
          role="tab"
          aria-selected={activeTab === "buy"}
          className={`min-h-[42px] min-w-max flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === "buy"
              ? "bg-primary text-white shadow-xs font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          <span>{tabT.tabBuy}</span>
          <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === "buy" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {buyerReqs.length || 6}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("sell") }}
          role="tab"
          aria-selected={activeTab === "sell"}
          className={`min-h-[42px] min-w-max flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === "sell"
              ? "bg-primary text-white shadow-xs font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Wheat className="h-4 w-4 shrink-0" />
          <span>{tabT.tabSell}</span>
          <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === "sell" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {sellOffers.length || 6}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("gov") }}
          role="tab"
          aria-selected={activeTab === "gov"}
          className={`min-h-[42px] min-w-max flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === "gov"
              ? "bg-primary text-white shadow-xs font-extrabold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span>{tabT.tabGov}</span>
          <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === "gov" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {govItems.length || 6}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/*  TAB 1: MANDI PRICES                                         */}
      {/* ============================================================ */}
      {activeTab === "prices" && (
        <div className="flex flex-col gap-8">
          {/* Loading State */}
          {loadingPrices && crops.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 flex flex-col items-center justify-center py-24 gap-3" role="status" aria-live="polite">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-xs font-semibold">Syncing AGMARKNET Market Registry...</p>
            </div>
          )}

          {/* Error State */}
          {errorPrices && crops.length === 0 && (
            <GlassCard className="border border-amber-500/20 bg-amber-500/5 p-8 text-center rounded-2xl">
              <p className="text-amber-700 dark:text-amber-400 font-bold text-base">
                {lang === "hi" ? "आज मंडी का भाव उपलब्ध नहीं है। कृपया बाद में देखें।" : errorPrices}
              </p>
              <Button variant="outline" className="mt-4 text-xs font-bold rounded-xl" onClick={() => fetchCrops()}>
                {lang === "hi" ? "दोबारा कोशिश करें" : "Retry"}
              </Button>
            </GlassCard>
          )}

          {/* Active Mandi Price Hero & Analysis */}
          {crops.length > 0 && (() => {
            const activeCrop = selectedCrop || (filteredCrops.length > 0 ? filteredCrops[0] : crops[0])
            if (!activeCrop) return null

            return (
              <div id="crop-hero-section" className="flex flex-col gap-6">
                {/* 1. HERO SECTION: Price is the Hero of the Page */}
                <section
                  aria-label="Current Mandi Price Hero"
                  className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/70">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        <ShieldCheck className="h-4 w-4" />
                        AGMARKNET Verified Price
                      </span>
                      {activeCrop.arrival_date && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium px-2 py-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {activeCrop.arrival_date}
                        </span>
                      )}
                      {activeCrop.is_stale && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Reported Benchmark
                        </span>
                      )}
                    </div>

                    {/* Quick Commodity Switcher */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <label htmlFor="commodity-selector" className="text-xs font-bold text-muted-foreground hidden sm:inline">
                        Switch Crop:
                      </label>
                      <select
                        id="commodity-selector"
                        value={activeCrop.id}
                        onChange={(e) => {
                          const id = Number(e.target.value)
                          const target = crops.find(c => c.id === id)
                          if (target) {
                            setSelectedCrop(target)
                            trackEvent({ type: 'mandi_search', crop: target.name, state: target.state, lang: lang })
                          }
                        }}
                        className="text-xs font-bold text-foreground bg-muted/50 hover:bg-muted border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
                      >
                        {crops.map((c) => (
                          <option key={c.id} value={c.id}>
                            {translateData(c.name, lang)} ({translateData(c.mandi, lang)}) – ₹{(c.modal_price || c.price).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Main Hero Grid */}
                  <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left: Crop Name & Massive Modal Price */}
                    <div className="lg:col-span-8 space-y-5">
                      <div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground font-display">
                          {translateData(activeCrop.name, lang).toUpperCase()}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 text-sm sm:text-base text-muted-foreground font-medium">
                          <span className="text-foreground font-bold">
                            {translateData(activeCrop.variety, lang)} Variety
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            {translateData(activeCrop.mandi, lang)} Mandi, {translateData(activeCrop.state, lang)}
                          </span>
                        </div>
                      </div>

                      {/* Prominent Price Element */}
                      <div className="pt-2">
                        <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
                          <span className="text-5xl sm:text-6xl lg:text-[68px] font-black text-foreground font-display tracking-tight leading-none">
                            ₹{(activeCrop.modal_price || activeCrop.price).toLocaleString()}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-muted-foreground">
                              PER {activeCrop.unit ? translateData(activeCrop.unit, lang).toUpperCase() : "QUINTAL"}
                            </span>
                            <span className="text-xs font-bold text-primary">
                              Modal Mandi Price
                            </span>
                          </div>

                          {/* Price Movement Trend Pill */}
                          <div className="ml-auto sm:ml-4 self-center">
                            <span
                              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold ${
                                activeCrop.trend === "up"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                  : activeCrop.trend === "down"
                                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {activeCrop.trend === "up" && <TrendingUp className="h-4 w-4 shrink-0" />}
                              {activeCrop.trend === "down" && <TrendingDown className="h-4 w-4 shrink-0" />}
                              {activeCrop.trend === "stable" && <Minus className="h-4 w-4 shrink-0" />}
                              <span>
                                {activeCrop.change_percent > 0 ? `+${activeCrop.change_percent}%` : `${activeCrop.change_percent}%`}
                              </span>
                              <span className="font-semibold hidden sm:inline">
                                {activeCrop.trend === "up" ? "Price Increase" : activeCrop.trend === "down" ? "Price Decrease" : "Stable"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Three Clearly Separated Metrics */}
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-border/80">
                        <div className="rounded-2xl border border-border bg-muted/25 p-3.5 sm:p-4 transition-colors">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Minimum Price
                          </span>
                          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-foreground mt-1">
                            ₹{activeCrop.min_price.toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-3.5 sm:p-4 transition-colors">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">
                            Modal Price
                          </span>
                          <p className="text-base sm:text-xl lg:text-2xl font-black text-foreground mt-1">
                            ₹{(activeCrop.modal_price || activeCrop.price).toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/25 p-3.5 sm:p-4 transition-colors">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Maximum Price
                          </span>
                          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-foreground mt-1">
                            ₹{activeCrop.max_price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Hub for Selling & Buying */}
                    <div className="lg:col-span-4 flex flex-col justify-between gap-4 rounded-2xl bg-muted/20 border border-border p-5 lg:p-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Trading Actions
                          </h3>
                          <span className="text-[11px] font-semibold text-primary">Market Linkage</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Directly sell your harvest at benchmark rates or connect with verified institutional buyers demanding this commodity.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2.5 pt-2">
                        <Button
                          onClick={() => {
                            setActiveTab("sell")
                            setShowPostProduceModal(true)
                          }}
                          className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm rounded-xl h-11 flex items-center justify-center gap-2 shadow-xs transition-all"
                        >
                          <Wheat className="h-4 w-4" />
                          <span>Sell My {translateData(activeCrop.name, lang).split("(")[0].trim()}</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveTab("buy")
                            setBuySearch(activeCrop.name.split("(")[0].trim())
                          }}
                          className="w-full border-border bg-card hover:bg-muted text-foreground font-bold text-xs sm:text-sm rounded-xl h-11 flex items-center justify-center gap-2 transition-all"
                        >
                          <ShoppingCart className="h-4 w-4 text-primary" />
                          <span>View Buyer Demands</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. CHART & SECONDARY SECTIONS: Comfortable viewing area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Dominant Historical Price Chart */}
                  <div className="lg:col-span-8">
                    <HistoricalPriceChart crop={activeCrop} lang={lang} />
                  </div>

                  {/* Right Column: Market Details & e-NAM Support Desk */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Market Details Card */}
                    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-border/70 pb-3">
                        <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary" />
                          Market Details
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          AGMARKNET
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Market Centre</span>
                          <p className="text-sm font-bold text-foreground mt-0.5 truncate">{activeCrop.mandi}, {activeCrop.state}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Arrival Volume</span>
                          <p className="text-sm font-bold text-foreground mt-0.5">{activeCrop.arrival_tonnes.toLocaleString()} {t("mandi.t") || "Tonnes"}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Crop Variety</span>
                          <p className="text-sm font-bold text-foreground mt-0.5 truncate">{activeCrop.variety}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Market Date</span>
                          <p className="text-sm font-bold text-foreground mt-0.5">{activeCrop.arrival_date || "Today"}</p>
                        </div>
                      </div>
                    </div>

                    {/* e-NAM Support Desk (Secondary feature) */}
                    <BuySellPanel
                      crop={activeCrop}
                      mode={buySellMode}
                      connectionStatus={connectionStatus}
                      onConnect={(m) => {
                        setBuySellMode(m)
                        setConnectionStatus("connected")
                      }}
                      onReset={() => {
                        setBuySellMode(null)
                        setConnectionStatus("idle")
                      }}
                      lang={lang}
                      onLangChange={setLang}
                    />
                  </div>
                </div>

                {/* 3. EXPLORE ALL MANDI PRICES DIRECTORY */}
                <div id="all-mandi-directory" className="space-y-4 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-foreground font-display flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" />
                        Explore All Mandi Prices across India
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select any commodity to view its price benchmark, market details, and historical chart above.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg border border-border self-start sm:self-auto">
                      {filteredCrops.length} Commodities Available
                    </span>
                  </div>

                  {/* Search & Multi-Filters */}
                  <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4" aria-label="Mandi price filters">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search & Filters</h3>
                      <div className="flex items-center gap-2">
                        {hasPriceFilters && (
                          <button onClick={clearPriceFilters} className="shrink-0 text-xs font-semibold text-primary hover:underline">
                            Clear filters
                          </button>
                        )}
                        <button
                          onClick={handleRefreshPrices}
                          disabled={refreshingPrices}
                          className="shrink-0 inline-flex min-h-8 items-center justify-center gap-1.5 px-3 rounded-lg bg-card border border-border text-xs font-bold text-foreground hover:border-primary/30 hover:bg-muted transition-colors shadow-2xs"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${refreshingPrices ? "animate-spin text-primary" : ""}`} />
                          <span>{tabT.refreshPrices}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
                      <label className="relative block">
                        <span className="sr-only">Search mandi crops</span>
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="mandi-search"
                          type="text"
                          placeholder={tabT.searchPlaceholder}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-11 w-full rounded-xl border border-input bg-background pl-11 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </label>

                      <label className="block">
                        <span className="sr-only">Filter by State</span>
                        <select
                          value={stateFilter}
                          onChange={(e) => setStateFilter(e.target.value)}
                          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="All">All States</option>
                          {priceStates.filter((s) => s !== "All").map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="sr-only">Sort prices</span>
                        <select
                          value={priceSort}
                          onChange={(e) => setPriceSort(e.target.value as any)}
                          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="default">Sort: Default</option>
                          <option value="price_desc">Price: High to Low</option>
                          <option value="price_asc">Price: Low to High</option>
                          <option value="date">Reporting Date: Newest</option>
                        </select>
                      </label>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="border-t border-border pt-3">
                      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-muted-foreground">
                        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" /> Crop category
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {cropCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            aria-pressed={categoryFilter === cat}
                            className={`min-h-9 shrink-0 px-3.5 rounded-lg text-xs font-bold border transition-colors ${
                              categoryFilter === cat
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {CATEGORY_LANG[lang]?.[cat] || cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Crop Table & Grid */}
                  <div className="hidden lg:block overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
                    <MandiPriceTable
                      crops={filteredCrops}
                      lang={plang}
                      selectedId={activeCrop.id}
                      onSelect={(crop) => {
                        trackEvent({ type: 'mandi_search', crop: crop.name, state: crop.state, lang: lang })
                        setSelectedCrop(crop)
                        if (typeof window !== "undefined") {
                          const el = document.getElementById("crop-hero-section")
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
                    {filteredCrops.map((crop, i) => (
                      <CropCard
                        key={crop.id}
                        crop={crop}
                        index={i}
                        isSelected={crop.id === activeCrop.id}
                        onClick={() => {
                          trackEvent({ type: 'mandi_search', crop: crop.name, state: crop.state, lang: lang })
                          setSelectedCrop(crop)
                          if (typeof window !== "undefined") {
                            const el = document.getElementById("crop-hero-section")
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                          }
                        }}
                        lang={plang}
                      />
                    ))}
                  </div>

                  {filteredCrops.length === 0 && (
                    <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
                      <Search className="h-9 w-9 mx-auto mb-3 text-muted-foreground/40" />
                      <h3 className="text-sm font-bold text-foreground">No matching commodities</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Try a different crop, mandi or state.</p>
                      <Button variant="outline" size="sm" onClick={clearPriceFilters} className="mt-4">Clear filters</Button>
                    </div>
                  )}

                  <PriceAlertPanel crops={crops} />
                </div>
              </div>
            )
          })()}
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
                      <span className="text-xs font-semibold text-muted-foreground">{b.buyer_name}</span>
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
                      <span className="text-xs font-semibold text-muted-foreground">{s.farmer_name}</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm sm:text-base font-bold text-foreground">Government MSP Procurement Centres</h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Source: Official Portals</span>
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
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400">{g.nodal_agency || "MSP Centre"}</span>
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

      {/* Contextual Farmer Quick Review */}
      <QuickReviewCard category="mandi" sourcePage="/mandi" />

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

function MandiPriceTable({
  crops,
  lang,
  onSelect,
  selectedId,
}: {
  crops: MandiCrop[]
  lang: Lang
  onSelect: (crop: MandiCrop) => void
  selectedId?: number | string
}) {
  return (
    <table className="w-full min-w-[780px] text-left text-sm">
      <caption className="sr-only">Current mandi prices by crop and market</caption>
      <thead className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-[.08em] text-muted-foreground">
        <tr>
          <th scope="col" className="px-5 py-3.5">Commodity</th>
          <th scope="col" className="px-4 py-3.5">Market</th>
          <th scope="col" className="px-4 py-3.5 text-right">Modal Price</th>
          <th scope="col" className="px-4 py-3.5 text-right">Daily Range</th>
          <th scope="col" className="px-4 py-3.5 text-right">Movement</th>
          <th scope="col" className="px-5 py-3.5 text-right"><span className="sr-only">View details</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {crops.map((crop) => {
          const isSelected = selectedId === crop.id
          return (
            <tr
              key={crop.id}
              onClick={() => onSelect(crop)}
              className={`group transition-colors cursor-pointer ${
                isSelected ? "bg-primary/5 font-semibold" : "hover:bg-muted/40"
              }`}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-8 w-1.5 rounded-full transition-colors ${
                      isSelected ? "bg-primary" : "bg-primary/30 group-hover:bg-primary/70"
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className={`text-sm ${isSelected ? "font-black text-primary" : "font-bold text-foreground"}`}>
                      {translateData(crop.name, lang)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{translateData(crop.variety, lang)} · {crop.category}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{translateData(crop.mandi, lang)}<br />{translateData(crop.state, lang)}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                <p className="font-display text-base font-black text-foreground">₹{(crop.modal_price || crop.price).toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground font-normal">per {translateData(crop.unit, lang)}</p>
              </td>
              <td className="px-4 py-4 text-right text-xs text-muted-foreground font-medium">
                ₹{crop.min_price.toLocaleString()} – ₹{crop.max_price.toLocaleString()}
              </td>
              <td className="px-4 py-4 text-right"><TrendBadge trend={crop.trend} change={crop.change_percent} /></td>
              <td className="px-5 py-4 text-right">
                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(crop)
                  }}
                  className={`h-8 px-3 text-xs font-bold rounded-lg ${isSelected ? "bg-primary text-white" : ""}`}
                >
                  {isSelected ? "Viewing" : "View Price"}
                </Button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/* ---- Crop Card ---- */
function CropCard({
  crop,
  index,
  onClick,
  lang,
  isSelected,
}: {
  crop: MandiCrop
  index: number
  onClick: () => void
  lang: Lang
  isSelected?: boolean
}) {
  const { t } = useLanguage()
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.25 }}
      whileHover={{ y: -2 }}
    >
      <GlassCard
        className={`cursor-pointer group overflow-hidden relative border shadow-xs hover:shadow-md transition-all duration-200 bg-card h-full flex flex-col justify-between rounded-2xl ${
          isSelected ? "border-primary ring-1 ring-primary/40 bg-primary/5" : "border-border hover:border-primary/40"
        }`}
        onClick={onClick}
      >
        <div>
          <div className={`h-1.5 ${isSelected ? "bg-primary" : "bg-primary/50"}`} />

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className={`text-base font-extrabold truncate font-display ${isSelected ? "text-primary" : "text-foreground group-hover:text-primary"} transition-colors`}>
                  {translateData(crop.name, lang)}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{translateData(crop.variety, lang)}</p>
              </div>
              <TrendBadge trend={crop.trend} change={crop.change_percent} />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-1 bg-muted/30 border border-border/80 p-3 rounded-xl justify-between">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t("mandi.modal_price") || "Modal Price"}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-foreground font-display">
                  ₹{(crop.modal_price || crop.price).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/{translateData(crop.unit, lang)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
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
            variant={isSelected ? "default" : "outline"}
            className={`w-full text-xs font-bold rounded-lg shadow-xs ${isSelected ? "bg-primary text-white" : ""}`}
          >
            <span>{isSelected ? "Viewing Price" : (t("mandi.view_details") || "View Details")}</span>
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

/* ---- Buy/Sell Drilldown Panel with eNAM (Compact secondary feature) ---- */
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
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          e-NAM Support Desk
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Toll-Free 24x7
        </span>
      </div>

      {connectionStatus === "idle" && (
        <div className="space-y-3.5">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Assistance for trading <span className="font-bold text-foreground">{crop.name}</span> across registered APMC mandis.
          </p>

          {/* Quick contact details next to e-NAM actions */}
          <div className="rounded-xl border border-border bg-muted/25 p-3 space-y-1.5 text-xs">
            <a
              href="tel:18002700224"
              className="flex items-center justify-between font-bold text-primary hover:underline"
            >
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                1800-270-0224
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Toll-Free</span>
            </a>
            <a
              href="mailto:enam.helpdesk@gmail.com"
              className="flex items-center justify-between font-medium text-foreground hover:text-primary hover:underline text-[11px]"
            >
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-600" />
                enam.helpdesk@gmail.com
              </span>
              <span className="text-[10px] text-muted-foreground">Email Help</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              onClick={() => onConnect("buy")}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl h-10 shadow-xs"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Buying Help
            </Button>
            <Button
              variant="outline"
              onClick={() => onConnect("sell")}
              className="border-border text-foreground hover:bg-muted font-bold text-xs rounded-xl h-10"
            >
              <Wheat className="h-3.5 w-3.5 mr-1.5 text-amber-600" /> Selling Help
            </Button>
          </div>
        </div>
      )}

      {connectionStatus === "connecting" && (
        <div className="py-6 text-center space-y-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground font-semibold">Loading e-NAM support details...</p>
        </div>
      )}

      {connectionStatus === "connected" && (
        <div className="space-y-3 pt-1">
          <div className="rounded-xl p-3.5 space-y-2 border border-primary/20 bg-primary/5 text-xs">
            <p className="font-bold text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> {mode === "buy" ? "e-NAM Buying Support" : "e-NAM Selling Support"}
              </span>
              <span className="text-[10px] font-normal uppercase text-muted-foreground">{crop.mandi}</span>
            </p>
            <div className="grid grid-cols-2 gap-y-1 pt-1 text-muted-foreground border-t border-primary/10">
              <span>{enam.state}:</span>
              <span className="font-bold text-foreground text-right">{crop.state}</span>
              <span>{enam.commodity}:</span>
              <span className="font-bold text-foreground text-right">{crop.name.split("(")[0].trim()}</span>
              <span>{enam.price}:</span>
              <span className="font-bold text-primary text-right">₹{(crop.modal_price || crop.price).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href="tel:18002700224"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 flex items-center justify-center gap-2 text-xs shadow-xs transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call e-NAM Helpline (1800 270 0224)</span>
            </a>
            <a
              href="mailto:enam.helpdesk@gmail.com"
              className="w-full border border-border bg-card hover:bg-muted text-foreground font-semibold rounded-xl h-10 flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>Email Support (enam.helpdesk@gmail.com)</span>
            </a>
            <Button variant="ghost" onClick={onReset} className="w-full text-xs text-muted-foreground h-8 font-semibold">
              {enam.cancel || "Back"}
            </Button>
          </div>
        </div>
      )}
    </div>
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
        // Publishing a listing is not an identity or stock verification step.
        // The contact endpoint remains masked until the platform's consent flow
        // grants access.
        contact_consent_verified: false,
        state,
        district: district || "Bhopal",
        village_or_tehsil: village || undefined,
        delivery_option: delivery,
        verification_status: "self_declared",
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
        <p className="text-xs text-muted-foreground mb-4">Your listing is published as self-declared until it can be reviewed. Your contact number stays masked to reduce spam.</p>

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
            By publishing, you confirm that these details are accurate and consent to quotation inquiries. This does not verify your identity, stock, or price.
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
        verification_status: "self_declared",
        source: "KisaanBuddy self-declared buyer requirement",
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
