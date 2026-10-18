"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Store,
  Phone,
  ShieldCheck,
  MapPin,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Tag,
  RotateCw,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  marketplaceApi,
  MarketplaceListing,
} from "@/lib/farmer-api";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"buyers" | "sellers">("buyers");
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [searchCrop, setSearchCrop] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newType, setNewType] = useState<"buy" | "sell">("buy");
  const [newCrop, setNewCrop] = useState("");
  const [newVariety, setNewVariety] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("Quintal");
  const [newPrice, setNewPrice] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newState, setNewState] = useState("");
  const [newDelivery, setNewDelivery] = useState("Farm Gate Pickup");

  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await marketplaceApi.list({
        listing_type: activeTab === "buyers" ? "buy" : "sell",
        crop: searchCrop.trim() || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      });
      setListings(data);
    } catch (err) {
      console.error("Failed to load marketplace listings:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchCrop, selectedCategory]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrop.trim() || !newOrgName.trim() || !newDistrict.trim() || !newState.trim()) {
      alert("Please fill in the required fields (Crop, Name, District, State).");
      return;
    }

    try {
      setIsSubmitting(true);
      await marketplaceApi.create({
        listing_type: newType,
        category: newType === "buy" ? "wholesale" : "produce",
        crop_or_item: newCrop.trim(),
        variety: newVariety.trim() || undefined,
        quantity: parseFloat(newQuantity) || undefined,
        quantity_unit: newUnit,
        price: parseFloat(newPrice) || undefined,
        price_unit: "per " + newUnit,
        organization_name: newOrgName.trim(),
        contact_person: newContactPerson.trim() || undefined,
        contact_phone: newPhone.trim() || undefined,
        district: newDistrict.trim(),
        state: newState.trim(),
        delivery_terms: newDelivery,
        verification_status: "verified",
        is_active: true,
      });
      setShowModal(false);
      // Reset form
      setNewCrop("");
      setNewVariety("");
      setNewQuantity("");
      setNewPrice("");
      setNewOrgName("");
      setNewContactPerson("");
      setNewPhone("");
      setNewDistrict("");
      setNewState("");
      loadListings();
    } catch (err: any) {
      alert(err.message || "Failed to create listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <Store className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Agricultural Marketplace & Direct Trade
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect directly with verified buyers for your harvest or purchase authentic farming inputs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/mandi"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mandi Live Prices</span>
          </Link>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post Listing</span>
          </button>
        </div>
      </div>

      {/* Authentic Visual Context Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="/images/marketplace/vegetable-mandi.jpg"
            alt="Authentic Indian vegetable mandi and grain trade"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            Transparent Agricultural Trade
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Zero-Commission Farm Gate & Wholesale Sourcing
          </h2>
          <p className="text-xs text-slate-200 mt-2 leading-relaxed">
            Eliminate intermediary deductions. Connect your standing harvest directly to verified buyers, institutional procurers, and certified input dealers across India.
          </p>
        </div>
        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-center">
            <span className="text-xs font-bold text-emerald-300 block">Verified Buyers</span>
            <span className="text-[10px] text-slate-300">FPOs & Mills</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-center">
            <span className="text-xs font-bold text-amber-300 block">Direct Mandi</span>
            <span className="text-[10px] text-slate-300">Fair APMC Pricing</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Buyer vs Seller Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("buyers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "buyers"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Find Harvest Buyers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              Procurement
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "sellers"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Find Input Sellers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              Seeds & Inputs
            </span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crop (e.g. Wheat, Potato)..."
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="wholesale">Wholesale / Mill</option>
            <option value="produce">Farm Produce</option>
            <option value="seeds">Certified Seeds</option>
            <option value="fertilizer">Fertilizers</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RotateCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading marketplace listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <Store className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Listings Found for This Filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Try searching for another commodity or post your own harvest requirement to connect with regional aggregators.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Listing</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-500/50 transition duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.crop_or_item}
                      {item.variety ? ` (${item.variety})` : ""}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                      {item.organization_name}
                    </p>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span className="capitalize">{item.verification_status}</span>
                  </span>
                </div>

                {/* Price & Quantity Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5 my-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.listing_type === "buy" ? "Target Buying Price:" : "Selling Price:"}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm text-emerald-700 dark:text-emerald-400">
                      {item.price ? `₹${item.price.toLocaleString()} ${item.price_unit || ""}` : "Market Negotiable"}
                    </span>
                  </div>

                  {item.quantity && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.listing_type === "buy" ? "Required Quantity:" : "Available Stock:"}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.quantity} {item.quantity_unit || "Quintal"}
                      </span>
                    </div>
                  )}

                  {item.delivery_terms && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.delivery_terms}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {item.district}, {item.state}
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {item.contact_person || "Trade Officer"}
                </span>

                {item.contact_phone ? (
                  <a
                    href={`tel:${item.contact_phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Direct</span>
                  </a>
                ) : (
                  <Link
                    href={`/chatbot?query=${encodeURIComponent(
                      `I want to connect with ${item.organization_name} for ${item.crop_or_item} in ${item.district}`
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 transition"
                  >
                    <span>Connect</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Post Agricultural Listing
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Connect with buyers looking to procure or list farming inputs for sale.
            </p>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setNewType("buy")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    newType === "buy"
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200"
                      : "border-slate-200 dark:border-slate-700 text-slate-600"
                  }`}
                >
                  Buying Requirement
                </button>
                <button
                  type="button"
                  onClick={() => setNewType("sell")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    newType === "sell"
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200"
                      : "border-slate-200 dark:border-slate-700 text-slate-600"
                  }`}
                >
                  Selling Produce / Inputs
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Commodity / Item *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wheat, Potato"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Variety (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shriram Super"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="w-2/3 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <select
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-1/3 px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Quintal">Quintal</option>
                      <option value="Ton">Ton</option>
                      <option value="Kg">Kg</option>
                      <option value="Bags">Bags</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2600"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Farm Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sehore Kisan FPO or Patel Krishi Farm"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sehore"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhya Pradesh"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Publish Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
