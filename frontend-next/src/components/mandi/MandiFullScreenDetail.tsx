"use client"

import React, { useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  X,
  MapPin,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calculator,
  Wheat,
  Bell,
  Scale,
  TrendingUp,
  Tag,
  Building2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MandiCrop } from "@/app/mandi/MandiClient"
import { BuyerRequirementItem } from "@/lib/farmer-api"
import { matchCatalogCommodity } from "@/lib/data/commodity-catalog"
import { Lang } from "@/lib/language"
import { translateMandiData as translateData } from "@/lib/mandi-i18n"

interface MandiFullScreenDetailProps {
  crop: MandiCrop | null
  onClose: () => void
  allBuyers?: BuyerRequirementItem[]
  onOpenCalculator?: (crop: MandiCrop) => void
  onOpenSell?: (crop: MandiCrop) => void
  onOpenAlert?: (crop: MandiCrop) => void
  lang?: Lang
}

export function MandiFullScreenDetail({
  crop,
  onClose,
  allBuyers = [],
  onOpenCalculator,
  onOpenSell,
  onOpenAlert,
  lang = "en",
}: MandiFullScreenDetailProps) {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!crop) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [crop, onClose])

  // Get commodity display names (English + Hindi)
  const commInfo = useMemo(() => {
    if (!crop) return { english: "", hindi: "", category: "" }
    const matched = matchCatalogCommodity(crop.name)
    if (matched) {
      return {
        english: matched.name,
        hindi: matched.hindiName,
        category: matched.category,
      }
    }
    const clean = crop.name.split("(")[0].trim()
    return {
      english: clean,
      hindi: "",
      category: crop.category || "",
    }
  }, [crop])

  // Price calculations
  const prices = useMemo(() => {
    if (!crop) {
      return {
        modal: 0,
        min: 0,
        max: 0,
        spread: 0,
        hasValidPrices: false,
      }
    }
    const modal = crop.modal_price || crop.price || 0
    const min = crop.min_price || modal
    const max = crop.max_price || modal
    const spread = max - min
    const hasValidPrices = modal > 0 || min > 0 || max > 0

    return {
      modal,
      min,
      max,
      spread: spread >= 0 ? spread : 0,
      hasValidPrices,
    }
  }, [crop])

  // Calculate spread percentage for visual bar
  const spreadPercent = useMemo(() => {
    if (!prices.hasValidPrices || prices.max <= prices.min) return { left: 0, width: 100 }
    const totalRange = prices.max - prices.min
    if (totalRange === 0) return { left: 50, width: 0 }
    const modalOffset = ((prices.modal - prices.min) / totalRange) * 100
    return {
      left: 0,
      width: 100,
      modalPos: Math.min(Math.max(modalOffset, 5), 95),
    }
  }, [prices])

  // Filter ONLY authentic, verified buyers for this specific commodity
  const verifiedBuyers = useMemo(() => {
    if (!crop || !allBuyers || allBuyers.length === 0) return []
    const cropKeyword = crop.name.split("(")[0].trim().toLowerCase().replace(/[^a-z]/g, "")

    return allBuyers.filter((b) => {
      // Must be verified (Strict Reality First policy)
      const isVerified = b.is_verified === true || b.verification_status === "verified"
      if (!isVerified) return false

      const comm = (b.commodity || "").toLowerCase().replace(/[^a-z]/g, "")
      return comm.includes(cropKeyword) || cropKeyword.includes(comm)
    })
  }, [crop, allBuyers])

  if (!crop) return null

  const locationString = [
    crop.mandi ? translateData(crop.mandi, lang) : null,
    crop.district ? translateData(crop.district, lang) : null,
    crop.state ? translateData(crop.state, lang) : null,
  ]
    .filter(Boolean)
    .join(", ")

  const officialSource =
    crop.source_origin || "AGMARKNET / Directorate of Marketing & Inspection (Govt. of India)"
  const officialSourceUrl = crop.source_url || "https://agmarknet.gov.in"

  return (
    <AnimatePresence>
      <motion.div
        key="mandi-fullscreen-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] w-screen h-screen bg-background overflow-y-auto flex flex-col focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-label={`${crop.name} Mandi Details`}
      >
        {/* ============================================================ */}
        {/*  TOP NAVIGATION BAR                                          */}
        {/* ============================================================ */}
        <header className="sticky top-0 z-20 w-full border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/70 transition-all shadow-xs"
              aria-label="Back to mandi listings"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Mandi Listings</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span>/</span>
              <span className="font-semibold text-foreground">{commInfo.english}</span>
              <span>/</span>
              <span className="truncate max-w-[200px]">{crop.mandi}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCalculator && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenCalculator(crop)}
                className="hidden md:inline-flex text-xs font-bold rounded-xl h-8 gap-1.5 border-border"
              >
                <Calculator className="h-3.5 w-3.5 text-amber-500" />
                <span>Calculate Net Profit</span>
              </Button>
            )}

            {onOpenSell && (
              <Button
                size="sm"
                onClick={() => onOpenSell(crop)}
                className="hidden md:inline-flex text-xs font-bold rounded-xl h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Wheat className="h-3.5 w-3.5" />
                <span>Sell In This Mandi</span>
              </Button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close full-screen view"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ============================================================ */}
        {/*  MAIN CONTENT BODY (100% Full-Screen Clean Layout)           */}
        {/* ============================================================ */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          
          {/* Header Card: Crop, Location, Variety & Date */}
          <section
            aria-label="Crop and Mandi Overview"
            className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-xs"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground font-display tracking-tight">
                    {commInfo.english}
                  </h1>
                  {commInfo.hindi && (
                    <span className="text-xl sm:text-2xl font-bold text-muted-foreground">
                      ({commInfo.hindi})
                    </span>
                  )}
                  {commInfo.category && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                      {commInfo.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{locationString || "Data unavailable"}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-muted-foreground">Variety:</span>
                    <span className="font-semibold text-foreground px-2 py-0.5 rounded-md bg-muted text-xs">
                      {crop.variety ? translateData(crop.variety, lang) : "Data unavailable"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      Observation Date:{" "}
                      <strong className="text-foreground font-bold">
                        {crop.arrival_date || "Data unavailable"}
                      </strong>
                    </span>
                    {crop.is_stale && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Historical Record
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="flex md:hidden items-center gap-2 pt-2 border-t border-border/60">
                {onOpenCalculator && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenCalculator(crop)}
                    className="flex-1 text-xs font-bold rounded-xl h-9"
                  >
                    <Calculator className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    Calculator
                  </Button>
                )}
                {onOpenSell && (
                  <Button
                    size="sm"
                    onClick={() => onOpenSell(crop)}
                    className="flex-1 text-xs font-bold rounded-xl h-9 bg-emerald-600 text-white"
                  >
                    <Wheat className="h-3.5 w-3.5 mr-1" />
                    Sell Crop
                  </Button>
                )}
                {onOpenAlert && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenAlert(crop)}
                    className="text-xs font-bold rounded-xl h-9 px-3"
                  >
                    <Bell className="h-3.5 w-3.5 text-amber-500" />
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Pricing Metrics Grid */}
          <section aria-label="Market Price Metrics" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Minimum Market Price */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Minimum Market Price
                </span>
                <div className="pt-1">
                  {prices.hasValidPrices ? (
                    <div className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                      ₹{prices.min.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/ quintal</span>
                    </div>
                  ) : (
                    <div className="text-base font-bold text-muted-foreground">Data unavailable</div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Lowest auction transaction of the session
                </p>
              </div>

              {/* Modal Benchmark Price (Hero Highlight) */}
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 shadow-xs space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Modal Benchmark Price
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Prevailing Rate
                  </span>
                </div>
                <div className="pt-1">
                  {prices.hasValidPrices ? (
                    <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
                      ₹{prices.modal.toLocaleString()}
                      <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-300/80 ml-1">/ quintal</span>
                    </div>
                  ) : (
                    <div className="text-base font-bold text-muted-foreground">Data unavailable</div>
                  )}
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  Most frequently transacted APMC wholesale rate
                </p>
              </div>

              {/* Maximum Market Price */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Maximum Market Price
                </span>
                <div className="pt-1">
                  {prices.hasValidPrices ? (
                    <div className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                      ₹{prices.max.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/ quintal</span>
                    </div>
                  ) : (
                    <div className="text-base font-bold text-muted-foreground">Data unavailable</div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Top bid accepted for prime grade lot
                </p>
              </div>

              {/* Daily Arrivals */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Daily Arrivals
                </span>
                <div className="pt-1">
                  {crop.arrival_tonnes > 0 ? (
                    <div className="text-2xl sm:text-3xl font-black font-mono text-foreground tabular-nums">
                      {crop.arrival_tonnes.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground ml-1.5">MT (Tonnes)</span>
                    </div>
                  ) : (
                    <div className="text-base font-bold text-muted-foreground">Data unavailable</div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Physical volume received at mandi gates today
                </p>
              </div>
            </div>

            {/* Daily Price Spread Visualizer */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Daily Price Spread
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Variance between lowest and highest bidding prices in this market
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  {prices.hasValidPrices ? (
                    <span className="font-mono font-black text-lg text-foreground tabular-nums">
                      ₹{prices.spread.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted-foreground">/ quintal</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">Data unavailable</span>
                  )}
                </div>
              </div>

              {/* Spread Horizontal Visual Bar */}
              {prices.hasValidPrices && prices.max >= prices.min && (
                <div className="space-y-2 pt-2">
                  <div className="relative w-full h-3 rounded-full bg-muted border border-border/80 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 right-0 bg-emerald-500/20" />
                    {spreadPercent.modalPos !== undefined && (
                      <div
                        className="absolute top-0 bottom-0 w-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full shadow-xs"
                        style={{ left: `${spreadPercent.modalPos}%` }}
                        title={`Modal: ₹${prices.modal}`}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Min: ₹{prices.min.toLocaleString()}</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      Modal: ₹{prices.modal.toLocaleString()}
                    </span>
                    <span>Max: ₹{prices.max.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ============================================================ */}
          {/*  VERIFIED BUYERS SECTION (Strict Reality First Policy)       */}
          {/* ============================================================ */}
          <section aria-label="Verified Buyers" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-foreground font-display flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Verified Buyers</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Institutional APMC traders and processors actively procuring {commInfo.english}.
                </p>
              </div>
              {verifiedBuyers.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {verifiedBuyers.length} Verified
                </span>
              )}
            </div>

            {verifiedBuyers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verifiedBuyers.map((buyer) => {
                  const hasVerifiedContact =
                    (buyer.is_verified || buyer.verification_status === "verified") &&
                    Boolean(buyer.contact_phone)
                  const cleanPhone = buyer.contact_phone ? buyer.contact_phone.replace(/[^0-9]/g, "") : ""
                  const buyerDestination =
                    buyer.delivery_destination ||
                    (buyer.buyer_location_district
                      ? `${buyer.buyer_location_district}, ${buyer.buyer_location_state}`
                      : null)

                  return (
                    <div
                      key={buyer.id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-extrabold text-foreground">
                              {buyer.buyer_name}
                            </h3>
                            {buyer.buyer_type && (
                              <p className="text-xs text-muted-foreground">
                                {buyer.buyer_type}
                              </p>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                              Target Price
                            </span>
                            <span className="font-mono font-bold text-foreground">
                              {buyer.expected_price_min && buyer.expected_price_max
                                ? `₹${buyer.expected_price_min.toLocaleString()} - ₹${buyer.expected_price_max.toLocaleString()}`
                                : "Data unavailable"}{" "}
                              <span className="text-[10px] text-muted-foreground">/qtl</span>
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                              Required Volume
                            </span>
                            <span className="font-mono font-bold text-foreground">
                              {buyer.required_quantity
                                ? `${buyer.required_quantity.toLocaleString()} ${buyer.quantity_unit || "Quintal"}`
                                : "Data unavailable"}
                            </span>
                          </div>
                        </div>

                        {buyerDestination && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>Destination: {buyerDestination}</span>
                          </div>
                        )}
                      </div>

                      {/* Buyer Contact Details (Strictly Only if Verified) */}
                      <div className="pt-2 border-t border-border/60">
                        {hasVerifiedContact ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={`tel:${buyer.contact_phone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Call {buyer.contact_phone}</span>
                            </a>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground/60" />
                            <span>Buyer contact details: Data unavailable (verification pending)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
                <p className="text-xs font-bold text-foreground">
                  Verified buyers: Data unavailable
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  No verified institutional buyer requirements are currently registered for {commInfo.english} in this market center.
                </p>
              </div>
            )}
          </section>

          {/* ============================================================ */}
          {/*  OFFICIAL DATA SOURCE & PROVENANCE                          */}
          {/* ============================================================ */}
          <section
            aria-label="Official Data Source & Verification"
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm sm:text-base font-extrabold text-foreground">
                Official Provenance & Verification
              </h2>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="font-bold text-foreground">Official Data Source:</span>{" "}
                {officialSource}
              </p>
              <p className="leading-relaxed">
                Wholesale prices and daily arrival volumes are published by Agricultural Produce Market Committees (APMC) and ingested from national market portals. Modal rates reflect prevailing spot trade auctions.
              </p>
            </div>

            <div className="pt-1">
              <a
                href={officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Verify on Official Government Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>

          {/* Bottom Back Button for long-page accessibility */}
          <div className="pt-4 pb-8 flex items-center justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="text-xs font-bold rounded-xl px-6 h-10 border-border"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to Mandi Listings</span>
            </Button>
          </div>
        </main>
      </motion.div>
    </AnimatePresence>
  )
}
