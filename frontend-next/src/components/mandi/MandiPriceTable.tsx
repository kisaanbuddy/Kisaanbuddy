"use client"

import React, { useState, useMemo } from "react"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bell,
  Calculator,
  Wheat,
  Phone,
  MessageSquare,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MandiCrop } from "@/app/mandi/MandiClient"
import { Lang } from "@/lib/language"
import { translateMandiData as translateData } from "@/lib/mandi-i18n"
import { BuyerRequirementItem, ProduceListingItem } from "@/lib/farmer-api"
import { matchCatalogCommodity, COMMODITY_CATALOG } from "@/lib/data/commodity-catalog"

export type TableSortField = "commodity" | "mandi" | "state" | "min_price" | "modal_price" | "max_price" | "arrivals" | "date"
export type TableSortOrder = "asc" | "desc"

interface MandiPriceTableProps {
  crops: MandiCrop[]
  activeCrop: MandiCrop | null
  onSelectCrop: (crop: MandiCrop) => void
  onOpenAlert: (crop: MandiCrop) => void
  onOpenCalculator: (crop: MandiCrop) => void
  onOpenSell: (crop: MandiCrop) => void
  lang?: Lang
  matchedBuyers?: BuyerRequirementItem[]
  matchedSellers?: ProduceListingItem[]
  searchQuery?: string
  onResetFilters?: () => void
}

export function MandiPriceTable({
  crops,
  activeCrop,
  onSelectCrop,
  onOpenAlert,
  onOpenCalculator,
  onOpenSell,
  lang = "en",
  matchedBuyers = [],
  matchedSellers = [],
  searchQuery = "",
  onResetFilters,
}: MandiPriceTableProps) {
  // Sorting state
  const [sortField, setSortField] = useState<TableSortField>("date")
  const [sortOrder, setSortOrder] = useState<TableSortOrder>("desc")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Expandable row state (store crop IDs)
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null)

  const handleSort = (field: TableSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
    setCurrentPage(1)
  }

  // Sorted records
  const sortedCrops = useMemo(() => {
    const list = [...crops]
    list.sort((a, b) => {
      let valA: any
      let valB: any

      switch (sortField) {
        case "commodity":
          valA = a.name.toLowerCase()
          valB = b.name.toLowerCase()
          break
        case "mandi":
          valA = a.mandi.toLowerCase()
          valB = b.mandi.toLowerCase()
          break
        case "state":
          valA = a.state.toLowerCase()
          valB = b.state.toLowerCase()
          break
        case "min_price":
          valA = a.min_price || a.modal_price
          valB = b.min_price || b.modal_price
          break
        case "modal_price":
          valA = a.modal_price || a.price
          valB = b.modal_price || b.price
          break
        case "max_price":
          valA = a.max_price || a.modal_price
          valB = b.max_price || b.modal_price
          break
        case "arrivals":
          valA = a.arrival_tonnes || 0
          valB = b.arrival_tonnes || 0
          break
        case "date":
        default:
          valA = a.arrival_date || ""
          valB = b.arrival_date || ""
          break
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })
    return list
  }, [crops, sortField, sortOrder])

  // Paginated records
  const totalRecords = sortedCrops.length
  const totalPages = Math.ceil(totalRecords / pageSize) || 1
  const paginatedCrops = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedCrops.slice(start, start + pageSize)
  }, [sortedCrops, currentPage, pageSize])

  const toggleExpand = (id: number, crop: MandiCrop) => {
    if (expandedRowId === id) {
      setExpandedRowId(null)
    } else {
      setExpandedRowId(id)
      onSelectCrop(crop)
    }
  }

  // Get Hindi name from catalog if available
  const getCommodityDisplay = (name: string) => {
    const matched = matchCatalogCommodity(name)
    if (matched) {
      return {
        english: matched.name,
        hindi: matched.hindiName,
        category: matched.category,
        msp: matched.mspBenchmarkPrice,
      }
    }
    const clean = name.split("(")[0].trim()
    return {
      english: clean,
      hindi: "",
      category: "",
      msp: undefined,
    }
  }

  const renderSortIndicator = (field: TableSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />
    )
  }

  return (
    <div className="w-full bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80 bg-muted/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight font-display">
              Official Mandi Price Index
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              {totalRecords} Active Mandi Quotes
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time daily modal trading prices per quintal sourced directly from AGMARKNET & eNAM APMC markets.
          </p>
        </div>

        {/* Page size & export */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground font-semibold">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="text-xs font-bold bg-card border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Main Table / Empty State */}
      {totalRecords === 0 ? (
        <div className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-foreground">
              No Verified Mandi Prices Found
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {searchQuery
                ? `No official APMC daily observations matched "${searchQuery}". This commodity may currently be off-season or unreported in today's AGMARKNET bulletin.`
                : "No APMC market observations match your current filter parameters. Try expanding your search or selecting another state."}
            </p>
          </div>
          {onResetFilters && (
            <Button
              onClick={onResetFilters}
              variant="outline"
              size="sm"
              className="text-xs font-bold rounded-xl"
            >
              Reset All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold text-[11px] uppercase tracking-wider select-none">
                <th
                  onClick={() => handleSort("commodity")}
                  className="py-3 px-4 cursor-pointer group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Commodity</span>
                    {renderSortIndicator("commodity")}
                  </div>
                </th>
                <th className="py-3 px-3">Variety</th>
                <th
                  onClick={() => handleSort("state")}
                  className="py-3 px-3 cursor-pointer group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>State & District</span>
                    {renderSortIndicator("state")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("mandi")}
                  className="py-3 px-3 cursor-pointer group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Mandi / APMC</span>
                    {renderSortIndicator("mandi")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("min_price")}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end">
                    <span>Min (₹/q)</span>
                    {renderSortIndicator("min_price")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("modal_price")}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-foreground transition-colors bg-emerald-500/5"
                >
                  <div className="flex items-center justify-end text-emerald-800 dark:text-emerald-400 font-extrabold">
                    <span>Modal Price (₹/q)</span>
                    {renderSortIndicator("modal_price")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("max_price")}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end">
                    <span>Max (₹/q)</span>
                    {renderSortIndicator("max_price")}
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Spread</th>
                <th
                  onClick={() => handleSort("arrivals")}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end">
                    <span>Arrivals (MT)</span>
                    {renderSortIndicator("arrivals")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("date")}
                  className="py-3 px-3 cursor-pointer group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    {renderSortIndicator("date")}
                  </div>
                </th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedCrops.map((crop) => {
                const isSelected = activeCrop?.id === crop.id
                const isExpanded = expandedRowId === crop.id
                const modal = crop.modal_price || crop.price
                const min = crop.min_price || modal
                const max = crop.max_price || modal
                const spread = max - min
                const commInfo = getCommodityDisplay(crop.name)

                return (
                  <React.Fragment key={crop.id}>
                    <tr
                      onClick={() => toggleExpand(crop.id, crop)}
                      className={`cursor-pointer transition-colors duration-150 group ${
                        isSelected
                          ? "bg-emerald-500/10 dark:bg-emerald-950/20"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      {/* Commodity */}
                      <td className="py-3 px-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-foreground text-sm">
                                {commInfo.english}
                              </span>
                              {commInfo.hindi && (
                                <span className="text-[11px] font-semibold text-muted-foreground">
                                  ({commInfo.hindi})
                                </span>
                              )}
                            </div>
                            {crop.category && (
                              <span className="inline-block mt-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {crop.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Variety */}
                      <td className="py-3 px-3 text-muted-foreground font-medium">
                        {translateData(crop.variety, lang)}
                      </td>

                      {/* State & District */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground">
                          {translateData(crop.state, lang)}
                        </div>
                        {crop.district && (
                          <div className="text-[11px] text-muted-foreground">
                            {crop.district}
                          </div>
                        )}
                      </td>

                      {/* Mandi */}
                      <td className="py-3 px-3 font-semibold text-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[140px] sm:max-w-none">
                            {translateData(crop.mandi, lang)}
                          </span>
                        </div>
                      </td>

                      {/* Min Price */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-muted-foreground tabular-nums">
                        ₹{min.toLocaleString()}
                      </td>

                      {/* Modal Price (Highlighted) */}
                      <td className="py-3 px-3 text-right bg-emerald-500/5">
                        <span className="inline-flex items-center justify-end px-2.5 py-1 rounded-lg font-mono font-black text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
                          ₹{modal.toLocaleString()}
                        </span>
                      </td>

                      {/* Max Price */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-muted-foreground tabular-nums">
                        ₹{max.toLocaleString()}
                      </td>

                      {/* Spread */}
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                        {spread > 0 ? `₹${spread}` : "—"}
                      </td>

                      {/* Arrivals */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-foreground tabular-nums">
                        {crop.arrival_tonnes > 0 ? (
                          <span>{crop.arrival_tonnes.toLocaleString()} MT</span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-muted-foreground text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground/60" />
                          <span>{crop.arrival_date || "Recent"}</span>
                        </div>
                        {crop.is_stale && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                            Historical Report
                          </span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 whitespace-nowrap">
                          <ShieldCheck className="h-3 w-3" />
                          AGMARKNET
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(crop.id, crop)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
                          title="Expand market drawer"
                        >
                          <span>{isExpanded ? "Close" : "Details"}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Market Drawer */}
                    {isExpanded && (
                      <tr className="bg-muted/20 border-b border-border">
                        <td colSpan={12} className="p-4 sm:p-6">
                          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                            {/* Drawer Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-extrabold text-foreground">
                                    {commInfo.english} ({commInfo.hindi || crop.name}) — {crop.mandi}
                                  </h3>
                                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    Variety: {crop.variety}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Market Location: {crop.mandi}, {crop.district ? `${crop.district}, ` : ""}{crop.state} • Observation Date: {crop.arrival_date || "Official Archive"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onOpenCalculator(crop)
                                  }}
                                  className="text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 h-9 flex items-center gap-1.5"
                                >
                                  <Calculator className="h-3.5 w-3.5" />
                                  <span>Calculate Net Profit</span>
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onOpenSell(crop)
                                  }}
                                  className="text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-9 flex items-center gap-1.5"
                                >
                                  <Wheat className="h-3.5 w-3.5" />
                                  <span>Sell In This Mandi</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onOpenAlert(crop)
                                  }}
                                  className="text-xs font-bold rounded-xl border-border h-9 flex items-center gap-1.5"
                                >
                                  <Bell className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Set Alert</span>
                                </Button>
                              </div>
                            </div>

                            {/* Spread Visualizer Bar */}
                            <div className="space-y-2 bg-muted/30 border border-border/80 p-4 rounded-xl">
                              <div className="flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Min Quote</span>
                                  <p className="font-mono font-bold text-foreground">₹{min.toLocaleString()}/qtl</p>
                                </div>
                                <div className="text-center">
                                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Modal Benchmark Rate</span>
                                  <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                                    ₹{modal.toLocaleString()}/qtl
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Max Quote</span>
                                  <p className="font-mono font-bold text-foreground">₹{max.toLocaleString()}/qtl</p>
                                </div>
                              </div>

                              {/* Progress bar visual */}
                              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden relative border border-border">
                                <div
                                  className="absolute top-0 bottom-0 bg-emerald-500 rounded-full"
                                  style={{
                                    left: "20%",
                                    width: "60%",
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                                <span>Day's Price Spread: ₹{spread}/quintal</span>
                                <span>Reported Daily Arrivals: {crop.arrival_tonnes > 0 ? `${crop.arrival_tonnes.toLocaleString()} MT` : "Standard daily volume"}</span>
                              </div>
                            </div>

                            {/* Direct Institutional Buyers & Farmer Listings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              {/* Direct Buyers */}
                              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-blue-500" />
                                    <span>Verified Mandi Buyers for {commInfo.english}</span>
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                                    APMC Traders
                                  </span>
                                </div>
                                {matchedBuyers && matchedBuyers.length > 0 ? (
                                  <div className="space-y-1 text-xs">
                                    <p className="font-bold text-foreground">{matchedBuyers[0].buyer_name}</p>
                                    <p className="text-muted-foreground text-[11px]">
                                      Target Rate: <strong className="text-emerald-600 dark:text-emerald-400">₹{matchedBuyers[0].expected_price_min?.toLocaleString()} - ₹{matchedBuyers[0].expected_price_max?.toLocaleString()}/qtl</strong> • Needed: {matchedBuyers[0].required_quantity} {matchedBuyers[0].quantity_unit}
                                    </p>
                                    {matchedBuyers[0].contact_phone && (
                                      <div className="pt-1 flex items-center gap-2">
                                        <a
                                          href={`tel:${matchedBuyers[0].contact_phone}`}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]"
                                        >
                                          <Phone className="h-3 w-3" /> Call: {matchedBuyers[0].contact_phone}
                                        </a>
                                        <a
                                          href={`https://wa.me/91${matchedBuyers[0].contact_phone.replace(/[^0-9]/g, "")}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                                        >
                                          <MessageSquare className="h-3 w-3" /> WhatsApp
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    No direct institutional buyer registered for this crop in this district today. You can post a sell lot or set a price alert.
                                  </p>
                                )}
                              </div>

                              {/* Source Attribution & Regulatory Note */}
                              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5 text-xs">
                                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Official Provenance & Verification</span>
                                </span>
                                <p className="text-muted-foreground text-[11px] leading-relaxed">
                                  Source: <strong className="text-foreground">{crop.source_origin || "AGMARKNET / Directorate of Marketing & Inspection (Govt. of India)"}</strong>.
                                  Reference daily APMC reported market data. Realization depends on moisture, grain quality, and spot auction settlement.
                                </p>
                                <a
                                  href={crop.source_url || "https://agmarknet.gov.in"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline pt-0.5"
                                >
                                  <span>Verify on Official AGMARKNET Portal</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalRecords > 0 && (
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-muted/10 text-xs">
          <div className="text-muted-foreground font-semibold">
            Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-foreground">
              {Math.min(currentPage * pageSize, totalRecords)}
            </strong>{" "}
            of <strong className="text-foreground">{totalRecords}</strong> APMC Mandi quotes
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="text-xs font-bold rounded-lg h-8"
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i)
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-lg font-bold text-xs transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs font-bold rounded-lg h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
