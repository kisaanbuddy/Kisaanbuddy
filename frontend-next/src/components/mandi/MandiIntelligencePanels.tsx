"use client"

import React, { useMemo } from "react"
import {
  TrendingUp,
  Award,
  Truck,
  ArrowRight,
  BarChart3,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react"
import { MandiCrop } from "@/app/mandi/MandiClient"
import { HistoricalPriceChart } from "./HistoricalPriceChart"
import { Button } from "@/components/ui/button"

interface MandiIntelligencePanelsProps {
  crops: MandiCrop[]
  activeCrop: MandiCrop
  onSelectCrop: (crop: MandiCrop) => void
  onOpenCalculator: (crop: MandiCrop) => void
}

export function MandiIntelligencePanels({
  crops,
  activeCrop,
  onSelectCrop,
  onOpenCalculator,
}: MandiIntelligencePanelsProps) {
  // Normalize active crop name
  const activeCropClean = useMemo(() => {
    return activeCrop.name.split("(")[0].trim().toLowerCase()
  }, [activeCrop.name])

  // 1. Best Selling Markets for this commodity
  const bestMarketsForCrop = useMemo(() => {
    const matching = crops.filter((c) =>
      c.name.toLowerCase().includes(activeCropClean)
    )
    const list = matching.length > 0 ? matching : crops
    return [...list]
      .sort((a, b) => (b.modal_price || b.price) - (a.modal_price || a.price))
      .slice(0, 4)
  }, [crops, activeCropClean])

  // 2. High Arrival Liquidity Hubs across mandis
  const topArrivalHubs = useMemo(() => {
    return [...crops]
      .filter((c) => (c.arrival_tonnes || 0) > 0)
      .sort((a, b) => (b.arrival_tonnes || 0) - (a.arrival_tonnes || 0))
      .slice(0, 4)
  }, [crops])

  // 3. Nearby / Regional Mandi Comparison
  const regionalMandis = useMemo(() => {
    const sameState = crops.filter(
      (c) =>
        c.state.toLowerCase() === activeCrop.state.toLowerCase() &&
        c.id !== activeCrop.id
    )
    if (sameState.length > 0) {
      return sameState.slice(0, 4)
    }
    return crops.filter((c) => c.id !== activeCrop.id).slice(0, 4)
  }, [crops, activeCrop])

  return (
    <div className="space-y-6">
      {/* 3-Card Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Best Selling Markets (Top Realization) */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Best Selling Markets</h3>
                  <p className="text-[11px] text-muted-foreground">Highest verified APMC modal price</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Top Rates
              </span>
            </div>

            <div className="divide-y divide-border/60 pt-2">
              {bestMarketsForCrop.map((c, idx) => {
                const modal = c.modal_price || c.price
                const isSelected = c.id === activeCrop.id
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCrop(c)}
                    className={`py-2.5 px-2 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? "bg-emerald-500/10" : "hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {c.mandi}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{c.state}</span>
                        <span>•</span>
                        <span>{c.variety}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ₹{modal.toLocaleString()}/q
                      </span>
                      <div className="text-[10px] text-muted-foreground">
                        Min ₹{c.min_price || modal} - Max ₹{c.max_price || modal}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => onOpenCalculator(activeCrop)}
            variant="outline"
            className="w-full text-xs font-bold rounded-xl border-border h-9 text-foreground"
          >
            <span>Compare Net Realization</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        {/* Card 2: Market Arrival Intelligence (High Liquidity Hubs) */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">High Arrival Liquidity Hubs</h3>
                  <p className="text-[11px] text-muted-foreground">Markets handling largest daily supply</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                Liquidity
              </span>
            </div>

            <div className="divide-y divide-border/60 pt-2">
              {topArrivalHubs.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCrop(c)}
                  className="py-2.5 px-2 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {c.mandi}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <span>{c.name.split("(")[0].trim()}</span>
                      <span>•</span>
                      <span>{c.state}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-foreground">
                      {c.arrival_tonnes.toLocaleString()} MT
                    </span>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      ₹{(c.modal_price || c.price).toLocaleString()}/q
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>High arrival mandis usually offer faster auction settlement and higher buyer competition.</span>
          </div>
        </div>

        {/* Card 3: Regional Price Comparison */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Regional Price Comparison</h3>
                  <p className="text-[11px] text-muted-foreground">Alternative markets in {activeCrop.state}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                {activeCrop.state}
              </span>
            </div>

            <div className="divide-y divide-border/60 pt-2">
              {regionalMandis.map((c) => {
                const diff = (c.modal_price || c.price) - (activeCrop.modal_price || activeCrop.price)
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCrop(c)}
                    className="py-2.5 px-2 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        {c.mandi}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {c.name.split("(")[0].trim()} ({c.variety})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-foreground">
                        ₹{(c.modal_price || c.price).toLocaleString()}
                      </span>
                      <div
                        className={`text-[10px] font-bold ${
                          diff > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : diff < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {diff > 0 ? `+₹${diff}` : diff < 0 ? `-₹${Math.abs(diff)}` : "Equal"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted-foreground">
            Current active reference: <strong className="text-foreground">{activeCrop.mandi}</strong> (₹{(activeCrop.modal_price || activeCrop.price).toLocaleString()}/qtl).
          </div>
        </div>

      </div>

      {/* Historical Price Chart Integration */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-foreground font-display">
              Historical Price & Arrival Analytics
            </h3>
            <p className="text-xs text-muted-foreground">
              Official daily APMC market price trends for {activeCrop.name} ({activeCrop.variety}) at {activeCrop.mandi}.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>AGMARKNET Historical Records Only</span>
          </div>
        </div>
        <HistoricalPriceChart crop={activeCrop} />
      </div>
    </div>
  )
}
