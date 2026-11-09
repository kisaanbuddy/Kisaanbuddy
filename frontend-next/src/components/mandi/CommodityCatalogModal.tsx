"use client"

import React, { useState, useMemo } from "react"
import {
  X,
  Search,
  CheckCircle2,
  Wheat,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  COMMODITY_CATALOG,
  COMMODITY_CATEGORIES,
  CommodityCategory,
  CommodityCatalogItem,
} from "@/lib/data/commodity-catalog"
import { MandiCrop } from "@/app/mandi/MandiClient"

interface CommodityCatalogModalProps {
  onClose: () => void
  onSelectCommodity: (commodity: CommodityCatalogItem) => void
  activeCrops: MandiCrop[]
}

export function CommodityCatalogModal({
  onClose,
  onSelectCommodity,
  activeCrops,
}: CommodityCatalogModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState("")

  // Set of commodities that have live quotes in activeCrops
  const liveCommodityNames = useMemo(() => {
    const set = new Set<string>()
    activeCrops.forEach((c) => {
      const clean = c.name.split("(")[0].trim().toLowerCase()
      set.add(clean)
    })
    return set
  }, [activeCrops])

  const filteredCatalog = useMemo(() => {
    let list = [...COMMODITY_CATALOG]

    if (selectedCategory !== "All") {
      list = list.filter((item) => item.category === selectedCategory)
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      list = list.filter((item) => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.hindiName.includes(q) ||
          item.searchKeywords.some((k) => k.toLowerCase().includes(q))
        )
      })
    }

    return list
  }, [selectedCategory, searchTerm])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-foreground font-display">
                Comprehensive Agricultural Commodity Catalog
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {COMMODITY_CATALOG.length} Commodities
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore officially tracked crops across Cereals, Pulses, Oilseeds, Vegetables, Fruits, Spices, and Commercial Crops with Hindi names & statutory MSP benchmarks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="py-4 space-y-3 border-b border-border/60">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search commodity in English or Hindi (e.g. Wheat, गेहूं, Tomato, टमाटर, Onion, प्याज)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 border transition-all ${
                selectedCategory === "All"
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-card hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              All ({COMMODITY_CATALOG.length})
            </button>
            {COMMODITY_CATEGORIES.map((cat) => {
              const count = COMMODITY_CATALOG.filter((c) => c.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 border transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-card hover:bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 [scrollbar-width:thin]">
          {filteredCatalog.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No agricultural commodity matches your query.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredCatalog.map((item) => {
                const hasLive =
                  liveCommodityNames.has(item.name.toLowerCase()) ||
                  liveCommodityNames.has(item.id.toLowerCase())

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectCommodity(item)
                      onClose()
                    }}
                    className="group rounded-xl border border-border bg-card p-3.5 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          <span className="text-xs font-bold text-muted-foreground">
                            {item.hindiName}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {item.category}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Standard Variety:</span> {item.defaultVariety}
                      </div>

                      {item.mspApplicable && item.mspBenchmarkPrice && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          <Building2 className="h-3 w-3" />
                          <span>Govt. MSP: ₹{item.mspBenchmarkPrice.toLocaleString()}/q</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                      {hasLive ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Live Quotes Active</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Off-season / Unreported
                        </span>
                      )}
                      <span className="font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Click any commodity to filter the live Mandi Price Index.</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs font-bold">
            Close Catalog
          </Button>
        </div>
      </div>
    </div>
  )
}
