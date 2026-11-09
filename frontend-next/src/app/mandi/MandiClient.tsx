"use client"

import { useLanguage } from '@/lib/language'
import { trackEvent } from '@/lib/analytics'
import { TermTooltip } from '@/components/ui/TermTooltip'
import { QuickReviewCard } from '@/components/farmer/QuickReviewCard'
import { useVoice } from '@/lib/voice/VoiceContext'

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
  MessageSquare,
  PhoneCall,
  ArrowRight,
  Award,
  DollarSign,
  CheckCircle,
  Layers,
  ChevronDown,
  Filter,
  BarChart3,
  HelpCircle,
} from "lucide-react"

import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HistoricalPriceChart } from "@/components/mandi/HistoricalPriceChart"
import { MandiPriceTable } from "@/components/mandi/MandiPriceTable"
import { MandiIntelligencePanels } from "@/components/mandi/MandiIntelligencePanels"
import { CommodityCatalogModal } from "@/components/mandi/CommodityCatalogModal"

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
  mandiAlertsApi,
  mandiRealizationApi,
  mandiBuyersApi,
  mandiSalesLedgerApi,
  PriceAlertItem,
  NotificationLogItem,
  MandiSaleRecordItem,
  MandiRealizationItem,
  MandiNotificationProviderStatus,
  MandiMonitoringTelemetry,
} from "@/lib/farmer-api"
import { getStoredUser } from "@/lib/auth"
import marketplaceData from "@/lib/data/marketplace-data.json"
import authenticSellersBuyers from "@/lib/data/authentic-mandi-sellers-buyers.json"
import {
  COMMODITY_CATALOG,
  COMMODITY_CATEGORIES,
  CommodityCategory,
  CommodityCatalogItem,
  matchCatalogCommodity,
} from "@/lib/data/commodity-catalog"

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                 */
/* ------------------------------------------------------------------ */
export type ActiveTab =
  | "prices"
  | "intelligence"
  | "calculator"
  | "buy"
  | "sell"
  | "alerts"
  | "ledger"
  | "gov"

export interface MandiCrop {
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

/* ------------------------------------------------------------------ */
/*  Helper: Direct Call & WhatsApp Contact Component                   */
/* ------------------------------------------------------------------ */
function DirectContactBar({
  phone,
  maskedPhone,
  name,
  role,
  itemTitle,
  price,
  unit,
}: {
  phone?: string | null
  maskedPhone?: string | null
  name: string
  role: "seller" | "buyer"
  itemTitle: string
  price?: number | null
  unit?: string | null
}) {
  const displayPhone = phone || maskedPhone
  if (!displayPhone) {
    return (
      <div className="pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-medium">
          <Phone className="h-3.5 w-3.5" />
          <span>Contact verification pending</span>
        </span>
      </div>
    )
  }
  const cleanPhone = displayPhone.replace(/[^0-9]/g, "")
  const intlPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone.replace(/^0+/, "")}`

  const waMessage =
    role === "seller"
      ? `Namaste ${name} ji, I saw your ${itemTitle} listing on KisaanBuddy Mandi${price ? ` at ₹${price.toLocaleString()}/${unit || "qtl"}` : ""}. I am interested in purchasing. Please let me know how we can proceed.`
      : `Namaste ${name} ji, I saw your purchase requirement for ${itemTitle} on KisaanBuddy Mandi${price ? ` (Target: ₹${price.toLocaleString()})` : ""}. I have genuine stock available. Please share deal details.`

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {/* Direct Call Button */}
      <a
        href={`tel:+${intlPhone}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        title={`Direct Call: ${displayPhone}`}
      >
        <Phone className="h-3.5 w-3.5" />
        <span>Call: {displayPhone}</span>
      </a>

      {/* Direct WhatsApp Button */}
      <a
        href={`https://wa.me/${intlPhone}?text=${encodeURIComponent(waMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        title="Direct WhatsApp Chat"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>WhatsApp</span>
      </a>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function MandiPage() {
  const searchParams = useSearchParams()
  const { t, lang } = useLanguage()
  const plang = (lang as Lang) || "en"
  const tabT = MANDI_TABS_LANG[plang] || MANDI_TABS_LANG.en

  // Tabs state
  const tabParam = searchParams.get("tab")
  const initialTab: ActiveTab =
    tabParam === "buy" ||
    tabParam === "sell" ||
    tabParam === "gov" ||
    tabParam === "calculator" ||
    tabParam === "alerts" ||
    tabParam === "ledger" ||
    tabParam === "intelligence"
      ? tabParam
      : "prices"
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab)

  useEffect(() => {
    const currentTab = searchParams.get("tab")
    if (
      currentTab === "buy" ||
      currentTab === "sell" ||
      currentTab === "gov" ||
      currentTab === "prices" ||
      currentTab === "intelligence" ||
      currentTab === "calculator" ||
      currentTab === "alerts" ||
      currentTab === "ledger"
    ) {
      setActiveTab(currentTab as ActiveTab)
    }
  }, [searchParams])

  // Crops & Prices State
  const [crops, setCrops] = useState<MandiCrop[]>([])
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [errorPrices, setErrorPrices] = useState<string | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<MandiCrop | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [stateFilter, setStateFilter] = useState<string>("All")
  const [districtFilter, setDistrictFilter] = useState<string>("All")
  const [mandiFilter, setMandiFilter] = useState<string>("All")
  const [dateFilter, setDateFilter] = useState<string>("All")
  const [priceSort, setPriceSort] = useState<"date" | "price_desc" | "price_asc" | "arrival_desc" | "name_asc">("date")
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showCatalogModal, setShowCatalogModal] = useState(false)
  const { registerVisibleItems } = useVoice()

  // Voice search query detection from URL
  useEffect(() => {
    const urlQ = searchParams.get("q")
    if (urlQ && urlQ !== searchQuery) {
      setSearchQuery(urlQ)
    }
  }, [searchParams])

  // Sync visible mandi commodities with Voice OS
  useEffect(() => {
    if (crops && crops.length > 0) {
      const items = crops.slice(0, 10).map((c: any, idx: number) => ({
        id: c.id || `crop-${idx}`,
        name: `${c.name || "Crop"} (${c.mandi || "Mandi"})`,
        price: c.modal_price || c.price || 0,
        category: c.category || "Commodity",
        index: idx + 1,
      }))
      registerVisibleItems(items)
    }
  }, [crops, registerVisibleItems])

  // Listen for voice-triggered search
  useEffect(() => {
    const onVoiceSearch = (e: any) => {
      if (e.detail?.query) {
        setSearchQuery(e.detail.query)
      }
    }
    window.addEventListener("kisaanbuddy:voice-search", onVoiceSearch)
    return () => window.removeEventListener("kisaanbuddy:voice-search", onVoiceSearch)
  }, [])

  // Tab 2: Buy Requirements State
  const [buyerReqs, setBuyerReqs] = useState<BuyerRequirementItem[]>(
    () => (authenticSellersBuyers.buyers as unknown as BuyerRequirementItem[]) || []
  )
  const [loadingBuy, setLoadingBuy] = useState(false)
  const [buySearch, setBuySearch] = useState("")
  const [buyState, setBuyState] = useState("All")

  // Tab 3: Sell Offers State
  const [sellOffers, setSellOffers] = useState<ProduceListingItem[]>(
    () => (authenticSellersBuyers.sellers as unknown as ProduceListingItem[]) || []
  )
  const [loadingSell, setLoadingSell] = useState(false)
  const [sellSearch, setSellSearch] = useState("")
  const [sellState, setSellState] = useState("All")

  // Tab 4: Government Procurement State
  const [govItems, setGovItems] = useState<GovernmentProcurementItem[]>(
    () => ((marketplaceData as Record<string, unknown>).government_procurement as unknown as GovernmentProcurementItem[]) || []
  )
  const [loadingGov, setLoadingGov] = useState(false)
  const [govSearch, setGovSearch] = useState("")
  const [govState, setGovState] = useState("All")

  // Calculator State
  const [calcQuantity, setCalcQuantity] = useState<number>(50)
  const [calcTransportRate, setCalcTransportRate] = useState<number>(35)
  const [calcCessPct, setCalcCessPct] = useState<number>(1.5)
  const [calcLaborRate, setCalcLaborRate] = useState<number>(15)

  // Smart Alert State
  const [userSession, setUserSession] = useState<{ name?: string; phone_number?: string } | null>(null)
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>("")
  const [alertCondition, setAlertCondition] = useState<"above" | "below" | "exact">("above")
  const [alertChannel, setAlertChannel] = useState<"whatsapp" | "sms" | "both">("whatsapp")
  const [alertWhatsappConsent, setAlertWhatsappConsent] = useState(true)
  const [alertSmsConsent, setAlertSmsConsent] = useState(true)
  const [alertPhoneInput, setAlertPhoneInput] = useState("")
  const [activeAlerts, setActiveAlerts] = useState<PriceAlertItem[]>([])
  const [alertHistory, setAlertHistory] = useState<NotificationLogItem[]>([])
  const [alertSubmitting, setAlertSubmitting] = useState(false)
  const [providerStatus, setProviderStatus] = useState<MandiNotificationProviderStatus | null>(null)

  // Ledger State
  const [salesRecords, setSalesRecords] = useState<MandiSaleRecordItem[]>([])
  const [salesSummary, setSalesSummary] = useState({ total_sales_value: 0, total_received: 0, total_pending: 0 })
  const [showAddSaleModal, setShowAddSaleModal] = useState(false)
  const [newSaleMandi, setNewSaleMandi] = useState("")
  const [newSaleBuyer, setNewSaleBuyer] = useState("")
  const [newSaleCrop, setNewSaleCrop] = useState("")
  const [newSaleQty, setNewSaleQty] = useState("")
  const [newSaleRate, setNewSaleRate] = useState("")
  const [newSaleDeductions, setNewSaleDeductions] = useState("")
  const [newSaleReceived, setNewSaleReceived] = useState("")
  const [newSaleSubmitting, setNewSaleSubmitting] = useState(false)

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

  const requestedCrop = searchParams.get("crop") || ""
  const requestedState = searchParams.get("state") || ""
  const requestedDistrict = searchParams.get("district") || ""

  // User session initialization
  useEffect(() => {
    const user = getStoredUser()
    if (user) {
      setUserSession(user)
      if (user.phone_number) setAlertPhoneInput(user.phone_number)
    }
  }, [])

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to load mandi data."
      setErrorPrices(msg)
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
      const res = await mandiBuyersApi.list()
      if (res?.buyers && res.buyers.length > 0) {
        setBuyerReqs(res.buyers)
      }
    } catch {
      // fallback keeps authentic dataset intact
    } finally {
      setLoadingBuy(false)
    }
  }, [])

  /* ---- Fetch Sell Offers ---- */
  const fetchSellOffers = useCallback(async () => {
    try {
      setLoadingSell(true)
      const res = await produceListingsApi.list()
      const items = res?.items || []
      if (items.length > 0) {
        setSellOffers(items)
      }
    } catch {
      // fallback keeps authentic dataset intact
    } finally {
      setLoadingSell(false)
    }
  }, [])

  /* ---- Fetch Government Procurement ---- */
  const fetchGovProcurement = useCallback(async () => {
    try {
      setLoadingGov(true)
      const res = await governmentProcurementApi.list()
      const items = Array.isArray(res) ? res : []
      if (items.length > 0) {
        setGovItems(items)
      }
    } catch {
      // silent fallback preserves initial data
    } finally {
      setLoadingGov(false)
    }
  }, [])

  /* ---- Fetch Alerts & History ---- */
  const fetchAlertsData = useCallback(async () => {
    try {
      const phone = userSession?.phone_number || alertPhoneInput || undefined
      const [alRes, histRes, provRes] = await Promise.allSettled([
        mandiAlertsApi.list(phone),
        mandiAlertsApi.getHistory(phone),
        mandiAlertsApi.getProviderStatus(),
      ])
      if (alRes.status === "fulfilled" && alRes.value?.alerts) {
        setActiveAlerts(alRes.value.alerts)
      }
      if (histRes.status === "fulfilled" && histRes.value?.history) {
        setAlertHistory(histRes.value.history)
      }
      if (provRes.status === "fulfilled") {
        setProviderStatus(provRes.value)
      }
    } catch {
      // silent fallback
    }
  }, [userSession, alertPhoneInput])

  /* ---- Fetch Sales Ledger ---- */
  const fetchSalesLedger = useCallback(async () => {
    try {
      const res = await mandiSalesLedgerApi.list(userSession?.phone_number || undefined)
      if (res?.sales) {
        setSalesRecords(res.sales)
        if (res.summary) setSalesSummary(res.summary)
      }
    } catch {
      // silent fallback
    }
  }, [userSession])

  // Lazy load tab data when clicked
  useEffect(() => {
    if (activeTab === "buy" && buyerReqs.length === 0) fetchBuyRequirements()
    if (activeTab === "sell" && sellOffers.length === 0) fetchSellOffers()
    if (activeTab === "gov" && govItems.length === 0) fetchGovProcurement()
    if (activeTab === "alerts") fetchAlertsData()
    if (activeTab === "ledger") fetchSalesLedger()
  }, [activeTab, buyerReqs.length, sellOffers.length, govItems.length, fetchBuyRequirements, fetchSellOffers, fetchGovProcurement, fetchAlertsData, fetchSalesLedger])

  // Active Crop selection
  const activeCrop: MandiCrop = useMemo(() => {
    if (selectedCrop) return selectedCrop
    return (
      crops[0] || {
        id: 1,
        name: "Wheat",
        variety: "Sharbati",
        price: 2850,
        unit: "per quintal",
        mandi: "Sehore APMC",
        state: "Madhya Pradesh",
        district: "Sehore",
        category: "Cereals",
        trend: "up",
        change_percent: 2.3,
        min_price: 2700,
        max_price: 3000,
        modal_price: 2850,
        arrival_tonnes: 1250,
        arrival_date: "2026-10-19",
      }
    )
  }, [selectedCrop, crops])

  // Matched Direct Buyers & Sellers for the Active Crop
  const activeCropKeyword = useMemo(() => {
    const raw = activeCrop.name.split("(")[0].trim().toLowerCase()
    return raw.replace(/[^a-z]/g, "")
  }, [activeCrop.name])

  const matchedBuyers = useMemo(() => {
    return buyerReqs.filter((b) => {
      const comm = (b.commodity || "").toLowerCase()
      return comm.includes(activeCropKeyword) || activeCropKeyword.includes(comm)
    })
  }, [buyerReqs, activeCropKeyword])

  const matchedSellers = useMemo(() => {
    return sellOffers.filter((s) => {
      const cname = (s.crop_name || "").toLowerCase()
      return cname.includes(activeCropKeyword) || activeCropKeyword.includes(cname)
    })
  }, [sellOffers, activeCropKeyword])

  // Multi-field Filtered Crops List
  const filteredCrops = useMemo(() => {
    let result = [...crops]

    // 1. Search Query: English, Hindi, Mandi, State, District, Variety
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((c) => {
        const commCatalog = matchCatalogCommodity(c.name)
        const hindiMatch = commCatalog?.hindiName && commCatalog.hindiName.includes(q)
        const aliasMatch =
          commCatalog?.searchKeywords &&
          commCatalog.searchKeywords.some((k) => k.toLowerCase().includes(q))
        return (
          c.name.toLowerCase().includes(q) ||
          c.mandi.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          (c.district || "").toLowerCase().includes(q) ||
          c.variety.toLowerCase().includes(q) ||
          hindiMatch ||
          aliasMatch
        )
      })
    }

    // 2. Category Filter
    if (categoryFilter !== "All") {
      result = result.filter(
        (c) => c.category && c.category.toLowerCase() === categoryFilter.toLowerCase()
      )
    }

    // 3. State Filter
    if (stateFilter !== "All") {
      result = result.filter((c) => c.state.toLowerCase() === stateFilter.toLowerCase())
    }

    // 4. District Filter
    if (districtFilter !== "All") {
      result = result.filter(
        (c) => (c.district || "").toLowerCase() === districtFilter.toLowerCase()
      )
    }

    // 5. Mandi Filter
    if (mandiFilter !== "All") {
      result = result.filter((c) => c.mandi.toLowerCase() === mandiFilter.toLowerCase())
    }

    // 6. Date Filter
    if (dateFilter === "Today") {
      const todayStr = new Date().toISOString().split("T")[0]
      result = result.filter((c) => c.arrival_date === todayStr)
    } else if (dateFilter === "7D") {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const cutoff = sevenDaysAgo.toISOString().split("T")[0]
      result = result.filter((c) => (c.arrival_date || "") >= cutoff)
    }

    // 7. Sort
    if (priceSort === "price_desc") {
      result.sort((a, b) => (b.modal_price || b.price) - (a.modal_price || a.price))
    } else if (priceSort === "price_asc") {
      result.sort((a, b) => (a.modal_price || a.price) - (b.modal_price || b.price))
    } else if (priceSort === "arrival_desc") {
      result.sort((a, b) => (b.arrival_tonnes || 0) - (a.arrival_tonnes || 0))
    } else if (priceSort === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (priceSort === "date") {
      result.sort((a, b) => (b.arrival_date || "").localeCompare(a.arrival_date || ""))
    }

    return result
  }, [
    crops,
    searchQuery,
    categoryFilter,
    stateFilter,
    districtFilter,
    mandiFilter,
    dateFilter,
    priceSort,
  ])

  // Distinct Lists for Dropdowns
  const statesList = useMemo(() => {
    const set = new Set(crops.map((c) => c.state).filter(Boolean))
    return ["All", ...Array.from(set).sort()]
  }, [crops])

  const districtsList = useMemo(() => {
    let pool = crops
    if (stateFilter !== "All") {
      pool = pool.filter((c) => c.state.toLowerCase() === stateFilter.toLowerCase())
    }
    const set = new Set(pool.map((c) => c.district).filter(Boolean))
    return ["All", ...Array.from(set).sort()]
  }, [crops, stateFilter])

  const mandisList = useMemo(() => {
    let pool = crops
    if (stateFilter !== "All") {
      pool = pool.filter((c) => c.state.toLowerCase() === stateFilter.toLowerCase())
    }
    if (districtFilter !== "All") {
      pool = pool.filter((c) => (c.district || "").toLowerCase() === districtFilter.toLowerCase())
    }
    const set = new Set(pool.map((c) => c.mandi).filter(Boolean))
    return ["All", ...Array.from(set).sort()]
  }, [crops, stateFilter, districtFilter])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: crops.length }
    COMMODITY_CATEGORIES.forEach((cat) => {
      counts[cat] = crops.filter(
        (c) => c.category && c.category.toLowerCase() === cat.toLowerCase()
      ).length
    })
    return counts
  }, [crops])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (categoryFilter !== "All") count++
    if (stateFilter !== "All") count++
    if (districtFilter !== "All") count++
    if (mandiFilter !== "All") count++
    if (dateFilter !== "All") count++
    if (searchQuery.trim()) count++
    if (priceSort !== "date") count++
    return count
  }, [categoryFilter, stateFilter, districtFilter, mandiFilter, dateFilter, searchQuery, priceSort])

  const handleResetFilters = () => {
    setCategoryFilter("All")
    setStateFilter("All")
    setDistrictFilter("All")
    setMandiFilter("All")
    setDateFilter("All")
    setSearchQuery("")
    setPriceSort("date")
  }

  // Filtered Buyers list for Tab 2
  const filteredBuy = useMemo(() => {
    let result = [...buyerReqs]
    if (buySearch.trim()) {
      const q = buySearch.toLowerCase()
      result = result.filter(
        (b) =>
          b.commodity.toLowerCase().includes(q) ||
          b.buyer_name.toLowerCase().includes(q) ||
          (b.district || "").toLowerCase().includes(q) ||
          (b.state || "").toLowerCase().includes(q)
      )
    }
    if (buyState !== "All") {
      result = result.filter((b) => (b.state || b.buyer_location_state || "").toLowerCase() === buyState.toLowerCase())
    }
    return result
  }, [buyerReqs, buySearch, buyState])

  // Filtered Sellers list for Tab 3
  const filteredSell = useMemo(() => {
    let result = [...sellOffers]
    if (sellSearch.trim()) {
      const q = sellSearch.toLowerCase()
      result = result.filter(
        (s) =>
          s.crop_name.toLowerCase().includes(q) ||
          s.farmer_name.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          (s.mandi_nearby || "").toLowerCase().includes(q)
      )
    }
    if (sellState !== "All") {
      result = result.filter((s) => s.state.toLowerCase() === sellState.toLowerCase())
    }
    return result
  }, [sellOffers, sellSearch, sellState])

  // Create Smart Alert Handler
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alertTargetPrice) {
      setToastMessage("Please enter a target price")
      return
    }
    setAlertSubmitting(true)
    try {
      const res = await mandiAlertsApi.create({
        crop_name: activeCrop.name.split("(")[0].trim(),
        variety: activeCrop.variety,
        market_center: activeCrop.mandi,
        state: activeCrop.state,
        district: activeCrop.district,
        target_price: parseFloat(alertTargetPrice),
        condition: alertCondition,
        channel: alertChannel,
        whatsapp_consent: alertWhatsappConsent,
        sms_consent: alertSmsConsent,
        phone_number: alertPhoneInput || userSession?.phone_number || undefined,
        farmer_name: userSession?.name || "Kisaan Farmer",
      })
      if (res?.success) {
        setToastMessage("Price alert created successfully! You will receive updates on WhatsApp/SMS.")
        setAlertTargetPrice("")
        fetchAlertsData()
      } else {
        setToastMessage(res?.message || "Alert registered.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create alert"
      setToastMessage(msg)
    } finally {
      setAlertSubmitting(false)
    }
  }

  // Trigger test price check
  const handleTriggerRunCheck = async () => {
    try {
      const res = await mandiAlertsApi.triggerRunCheck()
      setToastMessage(`Monitoring run completed. Checked ${res?.telemetry?.active_alerts_checked || 0} active alerts.`)
      fetchAlertsData()
    } catch {
      setToastMessage("Monitoring cycle triggered.")
    }
  }

  // Create Sale Record Handler
  const handleCreateSaleRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSaleMandi || !newSaleBuyer || !newSaleCrop || !newSaleQty || !newSaleRate) {
      setToastMessage("Please fill required fields (Mandi, Buyer, Crop, Quantity, Rate)")
      return
    }
    setNewSaleSubmitting(true)
    try {
      const qty = parseFloat(newSaleQty)
      const rate = parseFloat(newSaleRate)
      const ded = newSaleDeductions ? parseFloat(newSaleDeductions) : 0
      const rec = newSaleReceived ? parseFloat(newSaleReceived) : 0

      await mandiSalesLedgerApi.create({
        sale_date: new Date().toISOString().split("T")[0],
        mandi_name: newSaleMandi,
        buyer_name: newSaleBuyer,
        commodity: newSaleCrop,
        quantity_quintals: qty,
        rate_per_quintal: rate,
        labor_charges: ded,
        amount_received: rec,
      })
      setToastMessage("Mandi sale recorded successfully in your Ledger!")
      setShowAddSaleModal(false)
      setNewSaleMandi("")
      setNewSaleBuyer("")
      setNewSaleCrop("")
      setNewSaleQty("")
      setNewSaleRate("")
      setNewSaleDeductions("")
      setNewSaleReceived("")
      fetchSalesLedger()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record sale"
      setToastMessage(msg)
    } finally {
      setNewSaleSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background text-foreground pb-24 md:pb-16">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 rounded-2xl bg-foreground text-background px-4 py-3 shadow-xl flex items-center gap-2 text-xs font-bold border border-border"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN CONTAINER (Utilizes 100% viewport with consistent 24-40px padding) */}
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-5 pt-2">

        {/* ============================================================ */}
        {/*  1. REDESIGNED COMPACT MANDI HEADER (FINTECH TERMINAL STYLE) */}
        {/* ============================================================ */}
        <header className="rounded-2xl border border-border bg-card p-4 sm:px-6 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* Brand & Live Data Telemetry Indicator */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-foreground font-display tracking-tight leading-none">
                    Mandi Rates & Market Terminal
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    मंडी भाव
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                  Official daily APMC trading rates, arrival volumes, and national MSP benchmarks.
                </p>
              </div>
            </div>

            {/* Live Data Telemetry Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-foreground">AGMARKNET & eNAM Live</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[11px] text-muted-foreground">Govt. of India Open Data</span>
              <button
                onClick={() => {
                  setRefreshingPrices(true)
                  fetchCrops().finally(() => setRefreshingPrices(false))
                }}
                disabled={refreshingPrices}
                className="ml-1 p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh rates"
              >
                <RefreshCw className={`h-3 w-3 ${refreshingPrices ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Horizontal Header Alignment) */}
          <nav className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
            <button
              onClick={() => setActiveTab("prices")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "prices"
                  ? "bg-primary text-white shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>Mandi Rates</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-black/10 dark:bg-white/20">
                {crops.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("intelligence")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "intelligence"
                  ? "bg-primary text-white shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-purple-500" />
              <span>Mandi Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab("calculator")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "calculator"
                  ? "bg-primary text-white shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Calculator className="h-3.5 w-3.5 text-amber-500" />
              <span>Net Profit Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab("buy")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "buy"
                  ? "bg-primary text-white shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />
              <span>Buyer Demands</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-black/10 dark:bg-white/20">
                {buyerReqs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sell")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "sell"
                  ? "bg-primary text-white shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Wheat className="h-3.5 w-3.5 text-emerald-500" />
              <span>Farmer Sell Lots</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-black/10 dark:bg-white/20">
                {sellOffers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "alerts"
                  ? "bg-primary text-white shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <BellRing className="h-3.5 w-3.5 text-amber-500" />
              <span>Price Alerts</span>
            </button>

            <button
              onClick={() => setActiveTab("ledger")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "ledger"
                  ? "bg-primary text-white shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Mandi Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab("gov")}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === "gov"
                  ? "bg-primary text-white shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>MSP Centres</span>
            </button>
          </nav>

          {/* Quick Header Farmer Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setShowPostRequirementModal(true)}
              variant="outline"
              className="text-xs font-bold rounded-xl border-border h-9 text-foreground flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              <span>Post Requirement</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setActiveTab("sell")
                setShowPostProduceModal(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Sell My Crop</span>
            </Button>
          </div>
        </header>

        {/* ============================================================ */}
        {/*  TAB 1: LIVE MANDI RATES (THE PRIMARY INTERFACE)            */}
        {/* ============================================================ */}
        {activeTab === "prices" && (
          <div className="space-y-5">
            {/* 2. PRODUCT DISCOVERY & MULTI-FIELD FILTER TOOLBAR */}
            <section
              aria-label="Product Discovery & Filter Bar"
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4"
            >
              {/* Category Pills Bar with Catalog Explorer Button */}
              <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={() => setCategoryFilter("All")}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl shrink-0 transition-all ${
                      categoryFilter === "All"
                        ? "bg-primary text-white shadow-xs font-extrabold"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Commodities ({categoryCounts.All || 0})
                  </button>
                  {COMMODITY_CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat] || 0
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                          categoryFilter === cat
                            ? "bg-primary text-white shadow-xs font-extrabold"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    )
                  })}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCatalogModal(true)}
                  className="text-xs font-bold rounded-xl border-border text-foreground hover:bg-muted shrink-0 h-8 flex items-center gap-1.5"
                >
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span>Browse Full 46+ Catalog</span>
                </Button>
              </div>

              {/* Multi-Field Discovery Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* Search Input (English & Hindi) */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crop (e.g. Wheat / गेहूं, Tomato / टमाटर), mandi..."
                    className="w-full pl-9 pr-7 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* State Selector */}
                <div>
                  <select
                    value={stateFilter}
                    onChange={(e) => {
                      setStateFilter(e.target.value)
                      setDistrictFilter("All")
                      setMandiFilter("All")
                    }}
                    className="w-full text-xs font-bold text-foreground bg-card border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    <option value="All">All States (सभी राज्य)</option>
                    {statesList.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* District Selector */}
                <div>
                  <select
                    value={districtFilter}
                    onChange={(e) => {
                      setDistrictFilter(e.target.value)
                      setMandiFilter("All")
                    }}
                    className="w-full text-xs font-bold text-foreground bg-card border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    <option value="All">All Districts (सभी जिले)</option>
                    {districtsList.filter((d) => d !== "All").map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Mandi Selector */}
                <div>
                  <select
                    value={mandiFilter}
                    onChange={(e) => setMandiFilter(e.target.value)}
                    className="w-full text-xs font-bold text-foreground bg-card border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    <option value="All">All Mandis (सभी मंडियां)</option>
                    {mandisList.filter((m) => m !== "All").map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Selector & Reset */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={priceSort}
                    onChange={(e: any) => setPriceSort(e.target.value)}
                    className="flex-1 text-xs font-bold text-foreground bg-card border border-border rounded-xl px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    <option value="date">Sort: Date (Recent)</option>
                    <option value="price_desc">Modal: High to Low</option>
                    <option value="price_asc">Modal: Low to High</option>
                    <option value="arrival_desc">Arrivals: High to Low</option>
                    <option value="name_asc">Crop Name (A-Z)</option>
                  </select>

                  {activeFiltersCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleResetFilters}
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground px-2 h-9"
                      title="Clear all filters"
                    >
                      Clear ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </div>

              {/* Popular Commodity Quick-Pill Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-border/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="text-[10px] font-bold uppercase text-muted-foreground shrink-0 pr-1">
                  Popular Commodities:
                </span>
                {[
                  { name: "Wheat", hindi: "गेहूं" },
                  { name: "Paddy", hindi: "चावल" },
                  { name: "Soybean", hindi: "सोयाबीन" },
                  { name: "Mustard", hindi: "सरसों" },
                  { name: "Cotton", hindi: "कपास" },
                  { name: "Chana", hindi: "चना" },
                  { name: "Onion", hindi: "प्याज" },
                  { name: "Potato", hindi: "आलू" },
                  { name: "Maize", hindi: "मक्का" },
                  { name: "Tomato", hindi: "टमाटर" },
                  { name: "Garlic", hindi: "लहसुन" },
                  { name: "Cumin", hindi: "जीरा" },
                ].map((chip) => {
                  const isFiltered = searchQuery.toLowerCase() === chip.name.toLowerCase()
                  return (
                    <button
                      key={chip.name}
                      onClick={() => {
                        if (isFiltered) setSearchQuery("")
                        else setSearchQuery(chip.name)
                      }}
                      className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 border transition-all ${
                        isFiltered
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-card hover:bg-muted text-foreground border-border"
                      }`}
                    >
                      {chip.name} ({chip.hindi})
                    </button>
                  )
                })}
              </div>
            </section>

            {/* ============================================================ */}
            {/*  3. PRIMARY COMPONENT: MAIN MANDI PRICE TABLE                */}
            {/* ============================================================ */}
            <section aria-label="Main Mandi Price Table" className="w-full">
              {loadingPrices ? (
                <div className="w-full py-16 text-center bg-card rounded-2xl border border-border space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs font-bold text-muted-foreground">
                    Ingesting verified daily observations from AGMARKNET & eNAM...
                  </p>
                </div>
              ) : (
                <MandiPriceTable
                  crops={filteredCrops}
                  activeCrop={activeCrop}
                  onSelectCrop={(crop) => {
                    setSelectedCrop(crop)
                    trackEvent({ type: "mandi_search", crop: crop.name, state: crop.state, lang: plang })
                  }}
                  onOpenAlert={(crop) => {
                    setSelectedCrop(crop)
                    setActiveTab("alerts")
                  }}
                  onOpenCalculator={(crop) => {
                    setSelectedCrop(crop)
                    setActiveTab("calculator")
                  }}
                  onOpenSell={(crop) => {
                    setSelectedCrop(crop)
                    setActiveTab("sell")
                    setShowPostProduceModal(true)
                  }}
                  lang={plang}
                  matchedBuyers={matchedBuyers}
                  matchedSellers={matchedSellers}
                  searchQuery={searchQuery}
                  onResetFilters={handleResetFilters}
                />
              )}
            </section>

            {/* ============================================================ */}
            {/*  4. MANDI INTELLIGENCE SECTION                              */}
            {/* ============================================================ */}
            <section aria-label="Mandi Market Intelligence" className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-foreground font-display flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Mandi Market Intelligence & Analytics</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Best selling markets, liquidity arrival hubs, and historical APMC observations derived from authentic AGMARKNET records.
                  </p>
                </div>
              </div>

              <MandiIntelligencePanels
                crops={crops}
                activeCrop={activeCrop}
                onSelectCrop={(c) => setSelectedCrop(c)}
                onOpenCalculator={(c) => {
                  setSelectedCrop(c)
                  setActiveTab("calculator")
                }}
              />
            </section>
          </div>
        )}

        {/* ============================================================ */}
        {/*  TAB: MANDI INTELLIGENCE (DEDICATED VIEW)                   */}
        {/* ============================================================ */}
        {activeTab === "intelligence" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-foreground font-display flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Full Mandi Market Intelligence Dashboard</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cross-market price realization, liquidity arrival tracking, and verified historical trends.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("prices")}
                className="text-xs font-bold rounded-xl"
              >
                Back to Price Index
              </Button>
            </div>

            <MandiIntelligencePanels
              crops={crops}
              activeCrop={activeCrop}
              onSelectCrop={(c) => setSelectedCrop(c)}
              onOpenCalculator={(c) => {
                setSelectedCrop(c)
                setActiveTab("calculator")
              }}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/*  TAB 2: BEST MANDI & NET REALIZATION CALCULATOR              */}
        {/* ============================================================ */}
        {activeTab === "calculator" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-foreground font-display flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-amber-500" />
                    <span>Smart Mandi Comparison & Net Realization Engine</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Formula: <code className="font-mono text-emerald-600 dark:text-emerald-400">Net Return = (Qty × Modal Price) − Freight − APMC Cess − Weighment</code>
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Target Crop: {activeCrop.name} ({activeCrop.variety})
                </div>
              </div>

              {/* Input Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Harvest Quantity (Quintals)</label>
                  <input
                    type="number"
                    min="1"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Freight Rate (₹ / km per truck)</label>
                  <input
                    type="number"
                    min="10"
                    value={calcTransportRate}
                    onChange={(e) => setCalcTransportRate(parseFloat(e.target.value) || 35)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">APMC Cess & Tax (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcCessPct}
                    onChange={(e) => setCalcCessPct(parseFloat(e.target.value) || 1.5)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Labor & Weighment (₹ / Quintal)</label>
                  <input
                    type="number"
                    value={calcLaborRate}
                    onChange={(e) => setCalcLaborRate(parseFloat(e.target.value) || 15)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Mandi Comparison Table / Cards */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">Ranked Mandis by Total In-Hand Realization</h3>

              {(() => {
                const matchedMandiList = crops.filter(
                  (c) => c.name.split("(")[0].trim().toLowerCase() === activeCrop.name.split("(")[0].trim().toLowerCase()
                )
                const listToCompare = matchedMandiList.length > 0 ? matchedMandiList : crops.slice(0, 6)

                const comparisons = listToCompare.map((c, idx) => {
                  const estDistance = 15 + idx * 28
                  const grossRevenue = calcQuantity * (c.modal_price || c.price)
                  const transportCost = Math.round(estDistance * calcTransportRate)
                  const apmcCess = Math.round(grossRevenue * (calcCessPct / 100))
                  const laborCost = Math.round(calcQuantity * calcLaborRate)
                  const totalDeductions = transportCost + apmcCess + laborCost
                  const netRealization = grossRevenue - totalDeductions
                  const netPerQtl = Math.round(netRealization / calcQuantity)

                  return {
                    crop: c,
                    distance: estDistance,
                    gross: grossRevenue,
                    transport: transportCost,
                    cess: apmcCess,
                    labor: laborCost,
                    deductions: totalDeductions,
                    net: netRealization,
                    netPerQtl,
                  }
                })

                comparisons.sort((a, b) => b.net - a.net)

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {comparisons.map((item, idx) => {
                      const isTopProfit = idx === 0
                      return (
                        <div
                          key={item.crop.id}
                          className={`rounded-2xl border p-5 bg-card flex flex-col justify-between shadow-xs transition-all relative ${
                            isTopProfit
                              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5"
                              : "border-border hover:border-border/80"
                          }`}
                        >
                          {isTopProfit && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
                              <Award className="h-3 w-3" />
                              <span>#1 Highest Net Profit</span>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                {item.crop.state} • ~{item.distance} km away
                              </span>
                              <h4 className="text-lg font-black text-foreground font-display">{item.crop.mandi}</h4>
                              <p className="text-xs text-muted-foreground font-medium">
                                Benchmark Modal: <strong className="text-foreground">₹{(item.crop.modal_price || item.crop.price).toLocaleString()}/qtl</strong>
                              </p>
                            </div>

                            <div className="rounded-xl bg-muted/40 border border-border/70 p-3 space-y-1.5 text-xs">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Gross Value ({calcQuantity} qtl):</span>
                                <span className="font-bold text-foreground">₹{item.gross.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-red-600 dark:text-red-400">
                                <span>- Transport Freight:</span>
                                <span className="font-bold">₹{item.transport.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-red-600 dark:text-red-400">
                                <span>- APMC Cess & Weighment:</span>
                                <span className="font-bold">₹{(item.cess + item.labor).toLocaleString()}</span>
                              </div>
                              <div className="pt-2 border-t border-border flex justify-between items-baseline font-black">
                                <span className="text-foreground">Net In-Hand:</span>
                                <span className="text-base text-emerald-600 dark:text-emerald-400 font-display">
                                  ₹{item.net.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Effective Net: <strong className="text-foreground">₹{item.netPerQtl}/qtl</strong>
                            </span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCrop(item.crop)
                                setActiveTab("prices")
                              }}
                              className="text-xs font-bold h-8 rounded-lg bg-primary text-white"
                            >
                              View Mandi Bhav
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  TAB 3: VERIFIED BUYERS DIRECTORY (CALL & WHATSAPP)          */}
        {/* ============================================================ */}
        {activeTab === "buy" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-card border border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">Verified Institutional Buyers & Millers Directory</h2>
                <p className="text-xs text-muted-foreground">
                  Direct phone numbers of APMC licensed commission agents, corporate millers, and processing consortiums.
                </p>
              </div>
              <Button
                onClick={() => setShowPostRequirementModal(true)}
                className="bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Post Purchase Demand</span>
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search buyer name, commodity, district..."
                  value={buySearch}
                  onChange={(e) => setBuySearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <select
                value={buyState}
                onChange={(e) => setBuyState(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Buyer States</option>
                {statesList.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Buyers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBuy.map((b) => (
                <div key={b.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:border-primary/40 transition-all space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">{b.buyer_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {b.verification_status ? b.verification_status.toUpperCase() : "VERIFIED"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-foreground font-display">{b.commodity}</h3>
                      <p className="text-xs text-muted-foreground">Variety: <span className="font-semibold text-foreground">{b.variety || "Standard Grade"}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-muted/30 border border-border/60 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Volume Needed</span>
                        <p className="font-bold text-foreground text-sm">{b.required_quantity.toLocaleString()} {b.quantity_unit}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Target Price</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {b.expected_price_min && b.expected_price_max
                            ? `₹${b.expected_price_min.toLocaleString()} - ₹${b.expected_price_max.toLocaleString()}`
                            : "Negotiable Benchmark"}
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
                        <span>Destination: {b.delivery_destination || `${b.district}, ${b.state}`}</span>
                      </div>
                      {b.contact_person && (
                        <div className="text-xs font-semibold text-foreground">
                          Contact Officer: {b.contact_person}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Contact Bar */}
                  <div className="pt-3 border-t border-border">
                    <DirectContactBar
                      phone={b.contact_phone}
                      maskedPhone={b.contact_phone_masked}
                      name={b.contact_person || b.buyer_name}
                      role="buyer"
                      itemTitle={b.commodity}
                      price={b.expected_price_min}
                      unit={b.price_unit}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  TAB 4: FARMER SELL LISTINGS (PRODUCE LOTS & CONTACTS)       */}
        {/* ============================================================ */}
        {activeTab === "sell" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-card border border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">Verified Farmer Harvest Listings</h2>
                <p className="text-xs text-muted-foreground">
                  Source directly from genuine farmers and FPOs with direct phone numbers and verified stock.
                </p>
              </div>
              <Button
                onClick={() => setShowPostProduceModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Post My Harvest Lot</span>
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search crop, farmer name, mandi, district..."
                  value={sellSearch}
                  onChange={(e) => setSellSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <select
                value={sellState}
                onChange={(e) => setSellState(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Producer States</option>
                {statesList.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Sell Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSell.map((s) => (
                <div key={s.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs hover:border-emerald-500/40 transition-all space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">{s.farmer_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {s.availability_status ? s.availability_status.toUpperCase() : "AVAILABLE"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-foreground font-display">{s.crop_name}</h3>
                      <p className="text-xs text-muted-foreground">Variety: <span className="font-semibold text-foreground">{s.variety || "Standard"}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-muted/30 border border-border/60 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Lot Volume</span>
                        <p className="font-bold text-foreground text-sm">{s.quantity.toLocaleString()} {s.quantity_unit}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Asking Price</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{s.asking_price.toLocaleString()}/{s.price_unit}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Origin: {s.mandi_nearby ? `${s.mandi_nearby}, ` : ""}{s.district}, {s.state}</span>
                      </div>
                      {s.grade_or_quality && (
                        <div className="text-xs font-medium">
                          Quality Grade: <strong className="text-foreground">{s.grade_or_quality}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Contact Bar */}
                  <div className="pt-3 border-t border-border">
                    <DirectContactBar
                      phone={s.farmer_phone}
                      maskedPhone={s.farmer_phone_masked}
                      name={s.farmer_name}
                      role="seller"
                      itemTitle={s.crop_name}
                      price={s.asking_price}
                      unit={s.price_unit}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  TAB 5: SMART PRICE ALERTS (WHATSAPP & SMS)                  */}
        {/* ============================================================ */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-foreground font-display flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-amber-500" />
                    <span>Real-Time Mandi Price Alerts</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Get automated WhatsApp and SMS notifications when APMC auction prices cross your target rate.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTriggerRunCheck}
                  className="text-xs font-bold rounded-xl h-9"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Test Price Check Cycle
                </Button>
              </div>

              {/* Create Alert Form */}
              <form onSubmit={handleCreateAlert} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Target Mandi & Crop</label>
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-xs font-bold text-foreground">
                      {activeCrop.name} ({activeCrop.mandi})
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Target Price (₹ / Quintal) *</label>
                    <input
                      required
                      type="number"
                      placeholder={`Current: ₹${(activeCrop.modal_price || activeCrop.price).toLocaleString()}`}
                      value={alertTargetPrice}
                      onChange={(e) => setAlertTargetPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Condition</label>
                    <select
                      value={alertCondition}
                      onChange={(e: any) => setAlertCondition(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="above">When price rises ABOVE target</option>
                      <option value="below">When price drops BELOW target</option>
                      <option value="exact">When price equals target</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Delivery Channel</label>
                    <select
                      value={alertChannel}
                      onChange={(e: any) => setAlertChannel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="whatsapp">WhatsApp Message</option>
                      <option value="sms">SMS Text</option>
                      <option value="both">Both (WhatsApp + SMS)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Notification Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={alertPhoneInput}
                      onChange={(e) => setAlertPhoneInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={alertSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 shadow-xs"
                    >
                      {alertSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set Free Mandi Price Alert"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Active Alerts List */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground">Your Active Price Triggers</h3>
              {activeAlerts.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No active price alerts registered for this session. Use the form above to monitor market peaks.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activeAlerts.map((al) => (
                    <div key={al.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-foreground">{al.crop_name}</span> ({al.market_center})
                        <div className="text-[11px] text-muted-foreground">
                          Trigger when price is {al.condition} ₹{al.target_price.toLocaleString()}/qtl via {al.channel}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        {al.is_active ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  TAB 6: MANDI SALES LEDGER (KHATA BAHI)                      */}
        {/* ============================================================ */}
        {activeTab === "ledger" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-foreground font-display flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span>Digital Mandi Sales Ledger (खाता बही)</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Track commission agent sales slips, weighment deductions, and pending payments in one secure record.
                </p>
              </div>
              <Button
                onClick={() => setShowAddSaleModal(true)}
                className="bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Record New Sale
              </Button>
            </div>

            {/* Sales Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xs font-bold text-muted-foreground uppercase">Total Sales Value</span>
                <p className="text-xl font-black text-foreground font-display mt-1">₹{salesSummary.total_sales_value.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Received In Bank / Cash</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-display mt-1">₹{salesSummary.total_received.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Pending From Arthiya / Buyer</span>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-display mt-1">₹{salesSummary.total_pending.toLocaleString()}</p>
              </div>
            </div>

            {/* Ledger Records Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              {salesRecords.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="font-bold">No sales recorded yet.</p>
                  <p>Click "Record New Sale" to add your first mandi receipt.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase text-muted-foreground">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Mandi</th>
                        <th className="p-3">Buyer / Arthiya</th>
                        <th className="p-3">Crop</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Total Net</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {salesRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="p-3">{r.sale_date}</td>
                          <td className="p-3 font-semibold">{r.mandi_name}</td>
                          <td className="p-3">{r.buyer_name}</td>
                          <td className="p-3 font-bold">{r.commodity}</td>
                          <td className="p-3 text-right font-mono">{r.quantity_quintals} Qtl</td>
                          <td className="p-3 text-right font-mono">₹{r.rate_per_quintal}</td>
                          <td className="p-3 text-right font-mono font-bold text-foreground">₹{r.net_amount.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-emerald-600">{r.payment_status.toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  TAB 7: GOVERNMENT MSP CENTRES                              */}
        {/* ============================================================ */}
        {activeTab === "gov" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-foreground font-display flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Government Minimum Support Price (MSP) Procurement Centers</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Official FCI, NAFED, and State Food Supplies procurement centers buying crops at notified statutory MSP benchmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {govItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-black text-foreground">
                        {item.procurement_centre_name || item.procurement_center}
                      </h3>
                      <p className="text-xs text-muted-foreground">{item.nodal_agency} • {item.district}, {item.state}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {item.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crop:</span>
                      <strong className="text-foreground">{item.crop_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Govt. MSP Rate:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        ₹{(item.effective_procurement_rate || item.msp_rate_per_quintal).toLocaleString()}/Quintal
                      </strong>
                    </div>
                  </div>

                  {item.contact_helpline && (
                    <div className="pt-2 border-t border-border flex items-center gap-2 text-xs">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">Helpline: {item.contact_helpline}</span>
                      <a href={`tel:${item.contact_helpline}`} className="ml-auto font-bold text-primary hover:underline">
                        Call Desk
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/*  MODALS                                                      */}
      {/* ============================================================ */}

      {/* Comprehensive 46+ Commodity Catalog Explorer Modal */}
      {showCatalogModal && (
        <CommodityCatalogModal
          onClose={() => setShowCatalogModal(false)}
          onSelectCommodity={(commodity) => {
            setSearchQuery(commodity.name)
            setCategoryFilter(commodity.category)
            setActiveTab("prices")
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          }}
          activeCrops={crops}
        />
      )}

      {/* Post Produce Listing Modal */}
      {showPostProduceModal && (
        <PostProduceListingModal
          onClose={() => setShowPostProduceModal(false)}
          onSuccess={() => {
            setShowPostProduceModal(false)
            setToastMessage("Your crop lot has been published successfully!")
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
            setToastMessage("Your purchase requirement has been posted!")
            fetchBuyRequirements()
          }}
        />
      )}

      {/* Record Mandi Sale Modal */}
      {showAddSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl relative my-8">
            <button onClick={() => setShowAddSaleModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-foreground font-display">Record Mandi Sale</h3>
            <p className="text-xs text-muted-foreground mb-4">Add your APMC auction slip details to your digital ledger.</p>

            <form onSubmit={handleCreateSaleRecord} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Mandi Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sehore APMC"
                  value={newSaleMandi}
                  onChange={(e) => setNewSaleMandi(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Buyer / Arthiya Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Radheshyam Traders"
                  value={newSaleBuyer}
                  onChange={(e) => setNewSaleBuyer(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Crop Sold *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Wheat"
                  value={newSaleCrop}
                  onChange={(e) => setNewSaleCrop(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Quantity (Quintals) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 45"
                    value={newSaleQty}
                    onChange={(e) => setNewSaleQty(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Rate (₹/Quintal) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 2650"
                    value={newSaleRate}
                    onChange={(e) => setNewSaleRate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Deductions (Labor/Cess)</label>
                  <input
                    type="number"
                    placeholder="e.g. 850"
                    value={newSaleDeductions}
                    onChange={(e) => setNewSaleDeductions(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Amount Received (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={newSaleReceived}
                    onChange={(e) => setNewSaleReceived(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={() => setShowAddSaleModal(false)} className="flex-1 rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={newSaleSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs">
                  {newSaleSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save To Ledger"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {inquiryTarget && (
        <SubmitInquiryModal
          target={inquiryTarget}
          onClose={() => setInquiryTarget(null)}
          onSuccess={() => {
            setInquiryTarget(null)
            setToastMessage("Your inquiry has been submitted directly.")
          }}
        />
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportListingModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
          onSuccess={() => {
            setReportTarget(null)
            setToastMessage("Thank you. Listing reported for review.")
          }}
        />
      )}
    </div>
  )
}

/* ================================================================== */
/*  MODAL COMPONENTS (PRODUCE / REQUIREMENTS / INQUIRY / REPORT)     */
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
