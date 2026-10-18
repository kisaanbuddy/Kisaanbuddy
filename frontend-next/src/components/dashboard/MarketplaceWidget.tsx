"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Phone,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Tag,
  CheckCircle2,
  ChevronRight,
  Truck,
  Plus,
} from "lucide-react";
import { MarketplaceListing } from "@/lib/farmer-api";

interface MarketplaceWidgetProps {
  listings: MarketplaceListing[];
}

export function MarketplaceWidget({ listings }: MarketplaceWidgetProps) {
  const [activeTab, setActiveTab] = useState<"buyers" | "sellers">("buyers");

  const buyers = listings.filter((l) => l.listing_type === "buy");
  const sellers = listings.filter((l) => l.listing_type === "sell");

  const currentListings = activeTab === "buyers" ? buyers : sellers;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Marketplace & Direct Trade
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Connect with verified buyers for your harvest or discover quality inputs
          </p>
        </div>

        <Link
          href="/mandi"
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Live Mandi Prices</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
        <button
          onClick={() => setActiveTab("buyers")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "buyers"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>Find Harvest Buyers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            {buyers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("sellers")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "sellers"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>Find Input Sellers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            {sellers.length}
          </span>
        </button>
      </div>

      {/* Listings Cards */}
      {currentListings.length === 0 ? (
        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
          No listings available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {currentListings.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.crop_or_item}
                      {item.variety ? ` (${item.variety})` : ""}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <span>{item.organization_name}</span>
                    </p>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span className="capitalize">{item.verification_status}</span>
                  </span>
                </div>

                <div className="my-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {activeTab === "buyers" ? "Target Buying Price:" : "Price:"}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-emerald-700 dark:text-emerald-400">
                      {item.price ? `₹${item.price} ${item.price_unit || ""}` : "Market Negotiable"}
                    </span>
                  </div>

                  {item.quantity && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Required Quantity:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.quantity} {item.quantity_unit || "Quintal"}
                      </span>
                    </div>
                  )}

                  {item.delivery_terms && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>{item.delivery_terms}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>
                    {item.district}, {item.state}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.contact_person || "Trade Representative"}
                </span>

                {item.contact_phone ? (
                  <a
                    href={`tel:${item.contact_phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Buyer</span>
                  </a>
                ) : (
                  <Link
                    href={`/chat?query=${encodeURIComponent(
                      `I want to connect with buyer ${item.organization_name} for ${item.crop_or_item}`
                    )}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <span>Connect</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
