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
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MandiCrop } from "@/app/mandi/MandiClient"
import { Lang } from "@/lib/language"
import { translateMandiData as translateData } from "@/lib/mandi-i18n"
import { BuyerRequirementItem, ProduceListingItem } from "@/lib/farmer-api"
import { matchCatalogCommodity, COMMODITY_CATALOG } from "@/lib/data/commodity-catalog"
import { MandiFullScreenDetail } from "./MandiFullScreenDetail"

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
  onViewDetails?: (crop: MandiCrop) => void
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
  onViewDetails,
}: MandiPriceTableProps) {
  // Sorting state
  const [sortField, setSortField] = useState<TableSortField>("date")
  const [sortOrder, setSortOrder] = useState<TableSortOrder>("desc")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Internal full-screen detail state (fallback if parent doesn't provide onViewDetails)
  const [internalDetailCrop, setInternalDetailCrop] = useState<MandiCrop | null>(null)

  const handleOpenDetails = (crop: MandiCrop) => {
    onSelectCrop(crop)
    if (onViewDetails) {
      onViewDetails(crop)
    } else {
      setInternalDetailCrop(crop)
    }
  }

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
                const modal = crop.modal_price || crop.price
                const min = crop.min_price || modal
                const max = crop.max_price || modal
                const spread = max - min
                const commInfo = getCommodityDisplay(crop.name)

                return (
                  <tr
                    key={crop.id}
                    onClick={() => handleOpenDetails(crop)}
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
                      {crop.variety ? translateData(crop.variety, lang) : "Data unavailable"}
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
                      {min > 0 ? `₹${min.toLocaleString()}` : "Data unavailable"}
                    </td>

                    {/* Modal Price (Highlighted) */}
                    <td className="py-3 px-3 text-right bg-emerald-500/5">
                      <span className="inline-flex items-center justify-end px-2.5 py-1 rounded-lg font-mono font-black text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
                        {modal > 0 ? `₹${modal.toLocaleString()}` : "Data unavailable"}
                      </span>
                    </td>

                    {/* Max Price */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-muted-foreground tabular-nums">
                      {max > 0 ? `₹${max.toLocaleString()}` : "Data unavailable"}
                    </td>

                    {/* Spread */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                      {spread > 0 ? `₹${spread.toLocaleString()}` : "—"}
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
                        <span>{crop.arrival_date || "Data unavailable"}</span>
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
                          handleOpenDetails(crop)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary dark:text-emerald-400 transition-colors shadow-2xs"
                        title={`View full details for ${crop.name}`}
                      >
                        <span>Details</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
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

      {/* Internal Full-Screen Detail View fallback */}
      {internalDetailCrop && !onViewDetails && (
        <MandiFullScreenDetail
          crop={internalDetailCrop}
          onClose={() => setInternalDetailCrop(null)}
          allBuyers={matchedBuyers}
          onOpenCalculator={onOpenCalculator}
          onOpenSell={onOpenSell}
          onOpenAlert={onOpenAlert}
          lang={lang}
        />
      )}
    </div>
  )
}
