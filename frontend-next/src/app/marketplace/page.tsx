"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Wrench,
  ExternalLink,
  Calendar,
  Gauge,
  FileText,
  Layers,
  Info,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  equipmentCatalogApi,
  equipmentListingsApi,
  produceListingsApi,
  marketPricesApi,
  marketplaceSourcesApi,
  EquipmentCatalogItem,
  EquipmentListingItem,
  ProduceListingItem,
  MarketPriceItem,
  ImportSourceItem,
  MarketplaceListing,
  marketplaceApi,
} from "@/lib/farmer-api";
import { useLanguage, type Lang } from "@/lib/language";
import { MARKETPLACE_I18N } from "@/lib/marketplace-i18n";

type MainSectionMode = "sell_rent" | "source_farms" | "legacy_buyers" | "provenance";
type EquipmentSubTab = "catalog" | "rent" | "sale";

const EQUIPMENT_CATEGORIES = [
  { key: "all", labelEn: "All Implements", icon: "🌾" },
  { key: "tractors", labelEn: "Tractors", icon: "🚜" },
  { key: "harvesters", labelEn: "Harvesters", icon: "🌾" },
  { key: "rotavators", labelEn: "Rotavators", icon: "⚙️" },
  { key: "seed_drills", labelEn: "Seed Drills", icon: "🌱" },
  { key: "cultivators", labelEn: "Cultivators", icon: "⛏️" },
  { key: "ploughs", labelEn: "Ploughs", icon: "🗡️" },
  { key: "sprayers", labelEn: "Sprayers", icon: "💦" },
  { key: "threshers", labelEn: "Threshers", icon: "🌀" },
  { key: "agricultural_trailers", labelEn: "Trailers & Trolleys", icon: "🚛" },
  { key: "irrigation_equipment", labelEn: "Irrigation & Pumps", icon: "💧" },
  { key: "other_implements", labelEn: "Other Implements", icon: "🛠️" },
];

function CatalogProductImage({
  src,
  alt,
  category,
  brand,
}: {
  src: string;
  alt: string;
  category: string;
  brand: string;
}) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (src && src.startsWith("http")) {
      return `/api/marketplace/image-proxy?url=${encodeURIComponent(src)}`;
    }
    return src;
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && src.startsWith("http")) {
      setImgSrc(`/api/marketplace/image-proxy?url=${encodeURIComponent(src)}`);
    } else {
      setImgSrc(src);
    }
    setHasError(false);
  }, [src]);

  const categoryIcons: Record<string, string> = {
    tractors: "🚜",
    harvesters: "🌾",
    rotavators: "⚙️",
    seed_drills: "🌱",
    cultivators: "⛏️",
    ploughs: "🗡️",
    sprayers: "💦",
    threshers: "🌀",
    agricultural_trailers: "🚛",
    irrigation_equipment: "💧",
    other_implements: "🛠️",
  };

  const icon = categoryIcons[category] || "🌾";

  if (hasError || !imgSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/5 to-emerald-500/15 rounded-xl p-4 text-center">
        <span className="text-5xl mb-2 select-none filter drop-shadow-xs">{icon}</span>
        <span className="text-xs font-bold text-foreground/90 line-clamp-1">{brand}</span>
        <span className="text-[10px] text-muted-foreground capitalize mt-0.5">{category.replace("_", " ")}</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className="max-h-full max-w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
      onError={() => {
        // If image proxy failed, try the raw direct URL before giving up
        if (imgSrc.startsWith("/api/marketplace/image-proxy") && src.startsWith("http")) {
          setImgSrc(src);
        } else {
          setHasError(true);
        }
      }}
    />
  );
}

export default function MarketplacePage() {
  const { lang } = useLanguage();
  const dict = MARKETPLACE_I18N[(lang as Lang) || "en"] || MARKETPLACE_I18N.en;

  // Primary navigation: Sell Produce & Rent Equipment vs Source Directly from Farms
  const [sectionMode, setSectionMode] = useState<MainSectionMode>("sell_rent");
  const [equipmentTab, setEquipmentTab] = useState<EquipmentSubTab>("catalog");

  // Equipment Reference Catalogue State
  const [catalogItems, setCatalogItems] = useState<EquipmentCatalogItem[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogCategory, setCatalogCategory] = useState("all");
  const [catalogBrand, setCatalogBrand] = useState("all");
  const [catalogSupplier, setCatalogSupplier] = useState("all");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogHpMin, setCatalogHpMin] = useState<string>("");
  const [catalogHpMax, setCatalogHpMax] = useState<string>("");
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<EquipmentCatalogItem | null>(null);

  // Equipment Listings (Rent / Sale) State
  const [equipmentListings, setEquipmentListings] = useState<EquipmentListingItem[]>([]);
  const [loadingEqListings, setLoadingEqListings] = useState(false);
  const [eqStateFilter, setEqStateFilter] = useState("all");
  const [eqDistrictFilter, setEqDistrictFilter] = useState("");

  // Produce Listings (Direct from Farms) State
  const [produceListings, setProduceListings] = useState<ProduceListingItem[]>([]);
  const [loadingProduce, setLoadingProduce] = useState(false);
  const [produceCropFilter, setProduceCropFilter] = useState("all");
  const [produceStateFilter, setProduceStateFilter] = useState("all");
  const [produceDistrictFilter, setProduceDistrictFilter] = useState("");
  const [produceMinQty, setProduceMinQty] = useState<string>("");

  // AGMARKNET Benchmark Market Prices State
  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // External Sources & Provenance State
  const [sources, setSources] = useState<ImportSourceItem[]>([]);

  // Legacy Wholesale Listings State
  const [legacyListings, setLegacyListings] = useState<MarketplaceListing[]>([]);
  const [loadingLegacy, setLoadingLegacy] = useState(false);

  // Modals
  const [showEqModal, setShowEqModal] = useState(false);
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactTarget, setContactTarget] = useState<{
    name: string;
    phone?: string | null;
    title: string;
    location: string;
    type: "equipment" | "produce";
  } | null>(null);

  // Equipment Form State
  const [newEqType, setNewEqType] = useState<"rent" | "sale">("rent");
  const [newEqTitle, setNewEqTitle] = useState("");
  const [newEqBrand, setNewEqBrand] = useState("");
  const [newEqModel, setNewEqModel] = useState("");
  const [newEqCategory, setNewEqCategory] = useState("tractors");
  const [newEqHp, setNewEqHp] = useState("");
  const [newEqCondition, setNewEqCondition] = useState<"new" | "excellent" | "good" | "fair">("good");
  const [newEqYear, setNewEqYear] = useState("2022");
  const [newEqPrice, setNewEqPrice] = useState("");
  const [newEqPriceUnit, setNewEqPriceUnit] = useState("per hour");
  const [newEqOperator, setNewEqOperator] = useState(true);
  const [newEqOwnerName, setNewEqOwnerName] = useState("");
  const [newEqOwnerPhone, setNewEqOwnerPhone] = useState("");
  const [newEqState, setNewEqState] = useState("");
  const [newEqDistrict, setNewEqDistrict] = useState("");
  const [newEqNotes, setNewEqNotes] = useState("");

  // Produce Form State
  const [newProdCrop, setNewProdCrop] = useState("");
  const [newProdVariety, setNewProdVariety] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("cereal");
  const [newProdQty, setNewProdQty] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdFarmerName, setNewProdFarmerName] = useState("");
  const [newProdPhone, setNewProdPhone] = useState("");
  const [newProdState, setNewProdState] = useState("");
  const [newProdDistrict, setNewProdDistrict] = useState("");
  const [newProdGrade, setNewProdGrade] = useState("Grade A FAQ");
  const [newProdDelivery, setNewProdDelivery] = useState("Farm Gate Pickup");
  const [newProdNotes, setNewProdNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice navigation only opens or pre-fills existing UI. It never publishes a
  // listing or contacts a buyer: those consequential actions remain behind the
  // form and consent controls already used by this page.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const section = searchParams.get("section") || searchParams.get("tab");
    const action = searchParams.get("action");
    const crop = searchParams.get("crop")?.trim();
    const state = searchParams.get("state")?.trim();

    if (crop) {
      setProduceCropFilter(crop);
      if (action === "sell") setNewProdCrop(crop);
    }
    if (state) setProduceStateFilter(state);

    if (section === "buyers" || section === "legacy_buyers") setSectionMode("legacy_buyers");
    if (section === "provenance") setSectionMode("provenance");
    if (section === "equipment" || section === "catalog") {
      setSectionMode("sell_rent");
      setEquipmentTab("catalog");
    }
    if (action === "sell") {
      setSectionMode("sell_rent");
      setShowProduceModal(true);
    }
  }, []);

  // ─── 1. Load Equipment Reference Catalogue ──────────────────────────────────
  const loadCatalog = useCallback(async () => {
    try {
      setLoadingCatalog(true);
      const data = await equipmentCatalogApi.list({
        category: catalogCategory !== "all" ? catalogCategory : undefined,
        brand: catalogBrand !== "all" ? catalogBrand : undefined,
        supplier: catalogSupplier !== "all" ? catalogSupplier : undefined,
        search: catalogSearch.trim() || undefined,
        min_hp: catalogHpMin ? parseFloat(catalogHpMin) : undefined,
        max_hp: catalogHpMax ? parseFloat(catalogHpMax) : undefined,
        limit: 250,
      });
      setCatalogItems(data.items || []);
      setCatalogTotal(data.total || (data.items ? data.items.length : 0));
    } catch (err) {
      console.error("Failed to load equipment catalog:", err);
    } finally {
      setLoadingCatalog(false);
    }
  }, [catalogCategory, catalogBrand, catalogSupplier, catalogSearch, catalogHpMin, catalogHpMax]);

  const resetCatalogFilters = () => {
    setCatalogCategory("all");
    setCatalogBrand("all");
    setCatalogSupplier("all");
    setCatalogSearch("");
    setCatalogHpMin("");
    setCatalogHpMax("");
  };

  // ─── 2. Load Equipment Listings (Rent / Sale) ──────────────────────────────
  const loadEquipmentListings = useCallback(async () => {
    try {
      setLoadingEqListings(true);
      const data = await equipmentListingsApi.list({
        listing_type: equipmentTab === "rent" ? "rent" : equipmentTab === "sale" ? "sale" : undefined,
        state: eqStateFilter !== "all" ? eqStateFilter : undefined,
        district: eqDistrictFilter.trim() || undefined,
        status: "available",
      });
      setEquipmentListings(data.items || []);
    } catch (err) {
      console.error("Failed to load equipment listings:", err);
    } finally {
      setLoadingEqListings(false);
    }
  }, [equipmentTab, eqStateFilter, eqDistrictFilter]);

  // ─── 3. Load Produce Listings (Direct from Farms) ──────────────────────────
  const loadProduceListings = useCallback(async () => {
    try {
      setLoadingProduce(true);
      const data = await produceListingsApi.list({
        crop_name: produceCropFilter !== "all" ? produceCropFilter : undefined,
        state: produceStateFilter !== "all" ? produceStateFilter : undefined,
        district: produceDistrictFilter.trim() || undefined,
        min_quantity: produceMinQty ? parseFloat(produceMinQty) : undefined,
        status: "available",
      });
      setProduceListings(data.items || []);
    } catch (err) {
      console.error("Failed to load produce listings:", err);
    } finally {
      setLoadingProduce(false);
    }
  }, [produceCropFilter, produceStateFilter, produceDistrictFilter, produceMinQty]);

  // ─── 4. Load AGMARKNET Benchmark Prices ─────────────────────────────────────
  const loadMarketPrices = useCallback(async () => {
    try {
      setLoadingPrices(true);
      const data = await marketPricesApi.list({
        commodity: produceCropFilter !== "all" ? produceCropFilter : undefined,
        state: produceStateFilter !== "all" ? produceStateFilter : undefined,
        limit: 10,
      });
      setMarketPrices(data || []);
    } catch (err) {
      console.error("Failed to load market prices:", err);
    } finally {
      setLoadingPrices(false);
    }
  }, [produceCropFilter, produceStateFilter]);

  // ─── 5. Load Registered Data Sources ────────────────────────────────────────
  const loadSources = useCallback(async () => {
    try {
      const data = await marketplaceSourcesApi.list();
      setSources(data || []);
    } catch (err) {
      console.error("Failed to load marketplace sources:", err);
    }
  }, []);

  // ─── 6. Load Legacy Wholesale Listings ──────────────────────────────────────
  const loadLegacyListings = useCallback(async () => {
    try {
      setLoadingLegacy(true);
      const data = await marketplaceApi.list();
      setLegacyListings(data || []);
    } catch (err) {
      console.error("Failed to load legacy listings:", err);
    } finally {
      setLoadingLegacy(false);
    }
  }, []);

  useEffect(() => {
    if (sectionMode === "sell_rent") {
      if (equipmentTab === "catalog") {
        loadCatalog();
      } else {
        loadEquipmentListings();
      }
    } else if (sectionMode === "source_farms") {
      loadProduceListings();
      loadMarketPrices();
    } else if (sectionMode === "legacy_buyers") {
      loadLegacyListings();
    } else if (sectionMode === "provenance") {
      loadSources();
    }
  }, [
    sectionMode,
    equipmentTab,
    loadCatalog,
    loadEquipmentListings,
    loadProduceListings,
    loadMarketPrices,
    loadLegacyListings,
    loadSources,
  ]);

  // Initial load of sources for header badges
  useEffect(() => {
    loadSources();
  }, [loadSources]);

  // Handle Equipment Listing Creation
  const handleCreateEquipmentListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqTitle.trim() || !newEqBrand.trim() || !newEqPrice || !newEqOwnerName.trim() || !newEqState.trim() || !newEqDistrict.trim()) {
      alert("Please fill in the required fields (Title, Brand, Price, Owner Name, State, District).");
      return;
    }
    try {
      setIsSubmitting(true);
      await equipmentListingsApi.create({
        listing_type: newEqType,
        title: newEqTitle.trim(),
        brand: newEqBrand.trim(),
        model_name: newEqModel.trim() || newEqBrand.trim(),
        category: newEqCategory,
        hp_rating: newEqHp ? parseFloat(newEqHp) : undefined,
        condition: newEqCondition,
        year_of_manufacture: newEqYear ? parseInt(newEqYear, 10) : undefined,
        price: parseFloat(newEqPrice),
        price_unit: newEqPriceUnit,
        includes_operator: newEqOperator,
        owner_name: newEqOwnerName.trim(),
        owner_phone: newEqOwnerPhone.trim() || undefined,
        owner_consent_shared: true,
        state: newEqState.trim(),
        district: newEqDistrict.trim(),
        notes: newEqNotes.trim() || undefined,
      });
      setShowEqModal(false);
      // Reset form
      setNewEqTitle("");
      setNewEqBrand("");
      setNewEqModel("");
      setNewEqPrice("");
      setNewEqOwnerName("");
      setNewEqOwnerPhone("");
      setNewEqState("");
      setNewEqDistrict("");
      setNewEqNotes("");
      loadEquipmentListings();
      alert("Equipment listing created successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create equipment listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Produce Listing Creation
  const handleCreateProduceListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdCrop.trim() || !newProdQty || !newProdPrice || !newProdFarmerName.trim() || !newProdState.trim() || !newProdDistrict.trim()) {
      alert("Please fill in the required fields (Crop, Quantity, Price, Farmer Name, State, District).");
      return;
    }
    try {
      setIsSubmitting(true);
      await produceListingsApi.create({
        crop_name: newProdCrop.trim(),
        variety: newProdVariety.trim() || undefined,
        category: newProdCategory as any,
        quantity: parseFloat(newProdQty),
        quantity_unit: "Quintal",
        asking_price: parseFloat(newProdPrice),
        price_unit: "per Quintal",
        is_negotiable: true,
        grade_or_quality: newProdGrade,
        farmer_name: newProdFarmerName.trim(),
        farmer_phone: newProdPhone.trim() || undefined,
        contact_consent_verified: true,
        state: newProdState.trim(),
        district: newProdDistrict.trim(),
        delivery_option: newProdDelivery,
        verification_status: "verified",
        notes: newProdNotes.trim() || undefined,
      });
      setShowProduceModal(false);
      // Reset form
      setNewProdCrop("");
      setNewProdVariety("");
      setNewProdQty("");
      setNewProdPrice("");
      setNewProdFarmerName("");
      setNewProdPhone("");
      setNewProdState("");
      setNewProdDistrict("");
      setNewProdNotes("");
      loadProduceListings();
      alert("Produce harvest lot listed successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create produce listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open contact seller modal
  const openContact = (name: string, phone: string | null | undefined, title: string, location: string, type: "equipment" | "produce") => {
    setContactTarget({ name, phone, title, location, type });
    setShowContactModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* ─── Top Header & Mode Switcher ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 pb-6 pt-2">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Store className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                KisaanBuddy Agricultural Marketplace
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Public reference machinery catalogue, verified farmer listings & benchmark mandi prices.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/mandi"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Mandi Live Prices</span>
          </Link>

          {sectionMode === "sell_rent" && (
            <button
              onClick={() => setShowEqModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List Machine for Rent / Sale</span>
            </button>
          )}

          {sectionMode === "source_farms" && (
            <button
              onClick={() => setShowProduceModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post Harvest Produce</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Primary Navigation Tabs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-1.5 bg-muted/50 rounded-2xl border border-border/80">
        <button
          onClick={() => setSectionMode("sell_rent")}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            sectionMode === "sell_rent"
              ? "bg-card text-emerald-700 dark:text-emerald-400 shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span className="truncate">Sell Produce & Rent Equipment</span>
        </button>

        <button
          onClick={() => setSectionMode("source_farms")}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            sectionMode === "source_farms"
              ? "bg-card text-amber-700 dark:text-amber-400 shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span className="truncate">Source Directly from Farms</span>
        </button>

        <button
          onClick={() => setSectionMode("legacy_buyers")}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            sectionMode === "legacy_buyers"
              ? "bg-card text-emerald-700 dark:text-emerald-400 shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="truncate">Procurement & Mill Demands</span>
        </button>

        <button
          onClick={() => setSectionMode("provenance")}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            sectionMode === "provenance"
              ? "bg-card text-sky-700 dark:text-sky-400 shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="truncate">Data Sources & Provenance</span>
        </button>
      </div>

      {/* ─── SECTION 1: SELL PRODUCE & RENT EQUIPMENT ────────────────────────── */}
      {sectionMode === "sell_rent" && (
        <div className="space-y-6">
          {/* Sub-Tabs: Equipment Reference Catalogue vs Rent vs Sale */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEquipmentTab("catalog")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  equipmentTab === "catalog"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>🚜 Equipment Catalogue</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {catalogTotal || 28} Reference Models
                </span>
              </button>

              <button
                onClick={() => setEquipmentTab("rent")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  equipmentTab === "rent"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>🔑 Available for Rent</span>
              </button>

              <button
                onClick={() => setEquipmentTab("sale")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  equipmentTab === "sale"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>🏷️ Available for Sale</span>
              </button>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {equipmentTab === "catalog"
                  ? "Reference specifications from FMTTI Budni/Hisar test reports & manufacturer catalogues."
                  : "Active machines offered by local farmers, CHCs, and equipment owners."}
              </span>
            </div>
          </div>

          {/* ── Sub-view 1: Equipment Reference Catalogue ── */}
          {equipmentTab === "catalog" && (
            <div className="space-y-6">
              {/* Highlighted Provenance / Reference Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Public Equipment Reference Catalogue & MachinePoint Products
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl leading-relaxed">
                      Explore agricultural machinery specifications and commercial products directly from authorized suppliers (including{" "}
                      <strong className="text-foreground">MachinePoint Agriculture Machinery Collection</strong>) and Ministry of Agriculture test reports (CFMTTI Budni, NRFMTTI Hisar).
                      <span className="block mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        * Note: Product prices, availability, and delivery terms are linked directly to supplier product pages and may change on the supplier website.
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="https://machinepoint.in/collections/agriculture-farming-machinery"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-emerald-600/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>MachinePoint Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setShowEqModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    Offer Machine
                  </button>
                </div>
              </div>

              {/* Category Filter Pills (11 Categories) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCatalogCategory(cat.key)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      catalogCategory === cat.key
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "bg-card text-muted-foreground border border-border hover:bg-muted"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.labelEn}</span>
                  </button>
                ))}
              </div>

              {/* Filters Bar: Search, Source/Supplier, Brand, HP Range */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
                {/* Search */}
                <div className="relative sm:col-span-4">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search product, model, or implement (e.g. Chaff Cutter, 7HP Weeder)..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs focus:ring-2 focus:ring-emerald-500 text-foreground"
                  />
                </div>

                {/* Source / Supplier Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={catalogSupplier}
                    onChange={(e) => setCatalogSupplier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">All Machinery Sources ({catalogTotal || 242} Items)</option>
                    <option value="MachinePoint">MachinePoint Collection (214 Products)</option>
                    <option value="FMTTI">FMTTI & Government Standards (28 Models)</option>
                  </select>
                </div>

                {/* Brand Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={catalogBrand}
                    onChange={(e) => setCatalogBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">All Brands (GT Shakti, Mahindra, etc.)</option>
                    <option value="Machine Point">Machine Point</option>
                    <option value="GT SHAKTI">GT SHAKTI</option>
                    <option value="B-IMPEX">B-IMPEX</option>
                    <option value="Neptune">Neptune</option>
                    <option value="SUN">SUN</option>
                    <option value="Kamco">Kamco</option>
                    <option value="Mahindra">Mahindra</option>
                    <option value="Swaraj">Swaraj</option>
                    <option value="Sonalika">Sonalika</option>
                    <option value="TAFE">TAFE (Massey Ferguson)</option>
                    <option value="John Deere">John Deere</option>
                    <option value="Shaktiman">Shaktiman</option>
                    <option value="Maschio Gaspardo">Maschio Gaspardo</option>
                    <option value="Fieldking">Fieldking</option>
                    <option value="LEMKEN">LEMKEN</option>
                    <option value="Dasmesh">Dasmesh</option>
                    <option value="Preet">Preet</option>
                    <option value="ASPEE">ASPEE Sprayers</option>
                    <option value="Jain Drip">Jain Irrigation</option>
                    <option value="Kirloskar">Kirloskar</option>
                  </select>
                </div>

                {/* HP Range Filter */}
                <div className="sm:col-span-2 flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Min HP"
                    value={catalogHpMin}
                    onChange={(e) => setCatalogHpMin(e.target.value)}
                    className="w-1/2 px-2.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Max HP"
                    value={catalogHpMax}
                    onChange={(e) => setCatalogHpMax(e.target.value)}
                    className="w-1/2 px-2.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Equipment Catalogue Cards Grid */}
              {loadingCatalog ? (
                <div className="p-12 text-center text-muted-foreground">
                  <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  <p className="text-xs">Loading machinery catalogue...</p>
                </div>
              ) : catalogItems.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <h4 className="text-sm font-bold text-foreground">No machinery products found</h4>
                  <p className="text-xs mt-1">Try adjusting your brand, category or search query.</p>
                  <button
                    onClick={resetCatalogFilters}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catalogItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition-all group"
                    >
                      <div>
                        {/* 1. Product Image with direct clickable link */}
                        {item.supplier_name === "MachinePoint" && item.official_source_url ? (
                          <a
                            href={item.official_source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative w-full h-48 bg-white dark:bg-muted/15 rounded-xl overflow-hidden mb-3 border border-border/40 p-2.5 group-hover:border-emerald-500/40 transition flex items-center justify-center cursor-pointer"
                            title="Click to view product page on MachinePoint"
                          >
                            <CatalogProductImage
                              src={item.image_url || ""}
                              alt={item.model_name}
                              category={item.category}
                              brand={item.brand}
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                              <span>{item.supplier_name}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-card/90 text-foreground border border-border/60 capitalize">
                              {item.category.replace("_", " ")}
                            </span>
                          </a>
                        ) : (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedCatalogItem(item)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedCatalogItem(item); }}
                            className="block relative w-full h-48 bg-white dark:bg-muted/15 rounded-xl overflow-hidden mb-3 border border-border/40 p-2.5 group-hover:border-emerald-500/40 transition flex items-center justify-center cursor-pointer"
                            title="Click to view technical specifications"
                          >
                            <CatalogProductImage
                              src={item.image_url || ""}
                              alt={item.model_name}
                              category={item.category}
                              brand={item.brand}
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-foreground border border-border/60 flex items-center gap-1">
                              <span>Reference Model</span>
                              <Info className="w-2.5 h-2.5 text-emerald-600" />
                            </span>
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-card/90 text-foreground border border-border/60 capitalize">
                              {item.category.replace("_", " ")}
                            </span>
                          </div>
                        )}

                        {/* Brand & Subcategory Header */}
                        {item.image_url && (
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-foreground uppercase tracking-wider">
                              Brand: {item.brand}
                            </span>
                            <span className="text-[11px] text-muted-foreground capitalize font-medium">
                              {item.subcategory || item.category.replace("_", " ")}
                            </span>
                          </div>
                        )}

                        {/* 2. Product Name */}
                        <h4 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                          {item.supplier_name === "MachinePoint" && item.official_source_url ? (
                            <a
                              href={item.official_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              title="View on MachinePoint"
                            >
                              {item.model_name}
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedCatalogItem(item)}
                              className="hover:underline text-left cursor-pointer font-extrabold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                              title="Click to view specifications"
                            >
                              {item.model_name}
                            </button>
                          )}
                        </h4>

                        {/* 4. Product Price, when verified */}
                        {item.indicative_price ? (
                          <div className="my-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                                Verified Price
                              </span>
                              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                                ₹{item.indicative_price.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground text-right leading-tight max-w-[130px]">
                              Price & stock subject to supplier site
                            </span>
                          </div>
                        ) : item.hp_rating ? (
                          <div className="my-3 p-2 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Power Rating:</span>
                            <span className="font-bold text-foreground">{item.hp_rating} HP</span>
                          </div>
                        ) : null}

                        {/* Key Specs Pills for non-priced reference models */}
                        {!item.indicative_price && (
                          <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                            {item.hp_rating && (
                              <div className="p-2 rounded-xl bg-muted/50">
                                <span className="text-[10px] text-muted-foreground block">Power</span>
                                <span className="font-bold text-foreground">{item.hp_rating} HP</span>
                              </div>
                            )}
                            {item.working_width_mm && (
                              <div className="p-2 rounded-xl bg-muted/50">
                                <span className="text-[10px] text-muted-foreground block">Width</span>
                                <span className="font-bold text-foreground">{(item.working_width_mm / 1000).toFixed(2)} m</span>
                              </div>
                            )}
                            {item.lifting_capacity_kg && (
                              <div className="p-2 rounded-xl bg-muted/50">
                                <span className="text-[10px] text-muted-foreground block">Lift Capacity</span>
                                <span className="font-bold text-foreground">{item.lifting_capacity_kg} kg</span>
                              </div>
                            )}
                            {item.capacity && (
                              <div className="p-2 rounded-xl bg-muted/50">
                                <span className="text-[10px] text-muted-foreground block">Capacity</span>
                                <span className="font-bold text-foreground truncate">{item.capacity}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* 6. View Product Button & 7. Original Supplier Product URL */}
                      <div className="pt-3.5 mt-3.5 border-t border-border/60 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="truncate max-w-[180px]">
                            {item.supplier_name ? `Supplier: ${item.supplier_name}` : `Source: ${item.provenance_source}`}
                          </span>
                          {item.supplier_name === "MachinePoint" && item.official_source_url ? (
                            <a
                              href={item.official_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0 font-medium"
                            >
                              <span>machinepoint.in</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : item.official_source_url ? (
                            <a
                              href={item.official_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0 font-medium"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedCatalogItem(item)}
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0 font-medium cursor-pointer"
                            >
                              <span>View Specs</span>
                              <Info className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {item.supplier_name === "MachinePoint" && item.official_source_url ? (
                            <a
                              href={item.official_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs text-center cursor-pointer"
                            >
                              <span>View Product</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedCatalogItem(item)}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs text-center cursor-pointer"
                            >
                              <span>View Specifications</span>
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedCatalogItem(item)}
                            className="px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition text-center cursor-pointer"
                            title="View detailed specifications"
                          >
                            Specs
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewEqBrand(item.brand);
                              setNewEqModel(item.model_name);
                              setNewEqCategory(item.category);
                              setNewEqHp(item.hp_rating ? String(item.hp_rating) : "");
                              setNewEqTitle(`${item.brand} ${item.model_name} for Rent / Sale`);
                              setShowEqModal(true);
                            }}
                            className="px-2.5 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition shadow-xs cursor-pointer"
                            title="List your own machine of this model for rental or sale"
                          >
                            + List
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Sub-view 2 & 3: Active Equipment for Rent / Sale ── */}
          {(equipmentTab === "rent" || equipmentTab === "sale") && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
                <div>
                  <select
                    value={eqStateFilter}
                    onChange={(e) => setEqStateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">All States</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Filter by district (e.g. Sehore, Ludhiana)..."
                    value={eqDistrictFilter}
                    onChange={(e) => setEqDistrictFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      setNewEqType(equipmentTab === "rent" ? "rent" : "sale");
                      setShowEqModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    + Post {equipmentTab === "rent" ? "Rental" : "Sale"} Listing
                  </button>
                </div>
              </div>

              {loadingEqListings ? (
                <div className="p-12 text-center text-muted-foreground">
                  <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  <p className="text-xs">Loading equipment listings...</p>
                </div>
              ) : equipmentListings.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border text-muted-foreground">
                  <Wrench className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="text-sm font-bold text-foreground">
                    No active equipment currently listed for {equipmentTab}
                  </h4>
                  <p className="text-xs mt-1">
                    Be the first farmer or CHC to offer equipment in your region!
                  </p>
                  <button
                    onClick={() => {
                      setNewEqType(equipmentTab === "rent" ? "rent" : "sale");
                      setShowEqModal(true);
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
                  >
                    Post Listing Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {equipmentListings.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                            {item.listing_type === "rent" ? "For Rent" : "For Sale"}
                          </span>
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {item.condition.toUpperCase()} CONDITION
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-foreground">{item.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.district}, {item.state}</span>
                        </div>

                        {/* Price & Operator Details */}
                        <div className="my-4 p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">
                              {item.listing_type === "rent" ? "Rental Rate" : "Asking Price"}
                            </span>
                            <span className="text-base font-extrabold text-foreground">
                              ₹{item.price.toLocaleString("en-IN")}{" "}
                              <span className="text-xs font-normal text-muted-foreground">/{item.price_unit.replace("per ", "")}</span>
                            </span>
                          </div>
                          {item.includes_operator && (
                            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                              Operator Included
                            </span>
                          )}
                        </div>

                        <div className="text-xs space-y-1 text-muted-foreground">
                          {item.year_of_manufacture && (
                            <p>Year: <strong className="text-foreground">{item.year_of_manufacture}</strong></p>
                          )}
                          {item.operating_hours && (
                            <p>Hours Operated: <strong className="text-foreground">{item.operating_hours} hrs</strong></p>
                          )}
                          {item.notes && <p className="line-clamp-2 mt-2">{item.notes}</p>}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Owner / CHC</span>
                          <span className="text-xs font-bold text-foreground truncate max-w-[150px] block">
                            {item.owner_name}
                          </span>
                        </div>
                        <button
                          onClick={() => openContact(item.owner_name, item.owner_phone, item.title, `${item.district}, ${item.state}`, "equipment")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contact Owner</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 2: SOURCE DIRECTLY FROM FARMS ───────────────────────────── */}
      {sectionMode === "source_farms" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white mt-0.5">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Direct Farm Sourcing • No Intermediary Margins
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl leading-relaxed">
                  Connect directly with verified local growers, FPOs, and village cooperatives.
                  Mandi modal prices are displayed as reference market indicators alongside farm lots.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProduceModal(true)}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
            >
              + List Harvest Produce
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
            <div>
              <select
                value={produceCropFilter}
                onChange={(e) => setProduceCropFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Commodities (Wheat, Paddy, etc.)</option>
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Paddy">Paddy / Rice (धान / चावल)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Tomato">Tomato (टमाटर)</option>
                <option value="Mustard">Mustard (सरसों)</option>
                <option value="Gram">Gram / Chana (चना)</option>
                <option value="Potato">Potato (आलू)</option>
                <option value="Onion">Onion (प्याज)</option>
              </select>
            </div>

            <div>
              <select
                value={produceStateFilter}
                onChange={(e) => setProduceStateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All States</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Haryana">Haryana</option>
                <option value="Punjab">Punjab</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="District (e.g. Sehore, Karnal)..."
                value={produceDistrictFilter}
                onChange={(e) => setProduceDistrictFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <input
                type="number"
                placeholder="Min Qty (Quintals)"
                value={produceMinQty}
                onChange={(e) => setProduceMinQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Main Layout: 8-col Produce Lots + 4-col Benchmark Mandi Prices */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8-col: Produce Lots */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                  <span>Verified Farm Lots Available</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground font-semibold">
                    {produceListings.length}
                  </span>
                </h3>
              </div>

              {loadingProduce ? (
                <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
                  <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                  <p className="text-xs">Loading farm harvest lots...</p>
                </div>
              ) : produceListings.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border text-muted-foreground">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="text-sm font-bold text-foreground">No produce lots matching filter</h4>
                  <p className="text-xs mt-1">Try broadening your crop or location filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {produceListings.map((lot) => (
                    <div
                      key={lot.id}
                      className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-md transition-all"
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase">
                            {lot.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{lot.verification_status === "fpo_member" ? "FPO Member" : "Verified Grower"}</span>
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-foreground">
                          {lot.crop_name} {lot.variety ? `(${lot.variety})` : ""}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>{lot.district}, {lot.state}</span>
                        </div>

                        {/* Qty & Price Box */}
                        <div className="my-3.5 p-3 rounded-xl bg-muted/40 border border-border/50 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Available Batch</span>
                            <span className="font-extrabold text-foreground text-sm">
                              {lot.quantity} {lot.quantity_unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Asking Price</span>
                            <span className="font-extrabold text-foreground text-sm">
                              ₹{lot.asking_price.toLocaleString("en-IN")}{" "}
                              <span className="text-[10px] font-normal text-muted-foreground">/{lot.price_unit.replace("per ", "")}</span>
                            </span>
                          </div>
                        </div>

                        {/* Specifications */}
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <p>Grade / Assay: <strong className="text-foreground">{lot.grade_or_quality}</strong></p>
                          {lot.moisture_pct && (
                            <p>Moisture Level: <strong className="text-foreground">{lot.moisture_pct}%</strong></p>
                          )}
                          <p>Delivery: <strong className="text-foreground">{lot.delivery_option}</strong></p>
                          {lot.notes && <p className="line-clamp-2 mt-2 text-[11px]">{lot.notes}</p>}
                        </div>
                      </div>

                      {/* Footer: Farmer Info & Contact */}
                      <div className="pt-3.5 mt-3.5 border-t border-border flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Farmer / Collective</span>
                          <span className="text-xs font-bold text-foreground truncate max-w-[140px] block">
                            {lot.farmer_name}
                          </span>
                        </div>
                        <button
                          onClick={() => openContact(lot.farmer_name, lot.farmer_phone, `${lot.crop_name} (${lot.quantity} ${lot.quantity_unit})`, `${lot.district}, ${lot.state}`, "produce")}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contact Grower</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4-col: Benchmark Mandi Prices (AGMARKNET) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground">
                      Benchmark Mandi Prices
                    </h4>
                    <span className="text-[10px] text-muted-foreground block">
                      Source: AGMARKNET / data.gov.in
                    </span>
                  </div>
                </div>

                {/* Important Legal Disclaimer */}
                <div className="p-2.5 rounded-xl bg-muted/60 text-[10px] text-muted-foreground leading-relaxed border border-border/40">
                  ⚠️ <strong>Reference Only:</strong> Mandi prices reflect government APMC market arrivals.
                  Individual farmer asking prices are set independently by growers based on quality and grade.
                </div>

                {loadingPrices ? (
                  <div className="py-8 text-center text-muted-foreground text-xs">
                    Loading benchmark mandi rates...
                  </div>
                ) : marketPrices.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground text-xs">
                    No mandi observations for current filter.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {marketPrices.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-background border border-border/70 flex flex-col gap-1 hover:border-emerald-500/40 transition"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-foreground">
                          <span>{p.commodity}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            ₹{p.modal_price.toLocaleString("en-IN")}/Q
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{p.market_center} ({p.district})</span>
                          <span>Range: ₹{p.min_price} - ₹{p.max_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTION 3: PROCUREMENT & MILL DEMANDS (LEGACY) ──────────────────── */}
      {sectionMode === "legacy_buyers" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Institutional Buyers, FPOs & Food Processors
              </h3>
              <p className="text-xs text-muted-foreground">
                Verified procurement contracts and wholesale buying requirements.
              </p>
            </div>
          </div>

          {loadingLegacy ? (
            <div className="p-12 text-center text-muted-foreground">
              <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs">Loading procurement requirements...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {legacyListings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        VERIFIED BUYER
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-foreground">{item.crop_or_item}</h4>
                    <p className="text-xs text-muted-foreground">{item.organization_name}</p>

                    <div className="my-3 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1">
                      <p>Required: <strong className="text-foreground">{item.quantity} {item.quantity_unit}</strong></p>
                      <p>Target Rate: <strong className="text-foreground">₹{item.price} {item.price_unit}</strong></p>
                      <p>Location: <strong className="text-foreground">{item.district}, {item.state}</strong></p>
                    </div>

                    {item.notes && <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>}
                  </div>

                  <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{item.contact_person || "Procurement Officer"}</span>
                    <button
                      onClick={() => openContact(item.organization_name, item.contact_phone, item.crop_or_item, `${item.district}, ${item.state}`, "produce")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Contact Buyer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 4: DATA SOURCES & PROVENANCE ───────────────────────────── */}
      {sectionMode === "provenance" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
            <h3 className="text-base font-extrabold text-foreground">
              Authorized External Agricultural Data Sources
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
              In accordance with platform governance, all reference equipment models and market price observations
              originate from authorized public data sources under the National Data Sharing and Accessibility Policy (NDSAP)
              and Open Government Data (OGD) License - India. No copyrighted photos or speculative prices are fabricated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-5 rounded-2xl border border-border bg-card flex flex-col justify-between hover:border-sky-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-400 uppercase">
                      {src.source_type.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Frequency: {src.update_frequency}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground">{src.source_name}</h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {src.commercial_reuse_terms}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-muted/40 text-xs flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Records Ingested</span>
                    <span className="font-bold text-foreground">{src.records_count}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground">Auth: {src.auth_type}</span>
                  {src.base_url && (
                    <a
                      href={src.base_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: FULL SPECIFICATIONS VIEWER ──────────────────────────────── */}
      {selectedCatalogItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {selectedCatalogItem.brand} Reference Specifications
                </span>
                <h3 className="text-lg font-extrabold text-foreground">
                  {selectedCatalogItem.brand} {selectedCatalogItem.model_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCatalogItem(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image & Price if available */}
            {selectedCatalogItem.image_url && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-muted/20 border border-border/50">
                <a
                  href={selectedCatalogItem.official_source_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-48 h-40 bg-white dark:bg-muted/30 rounded-xl p-2 flex items-center justify-center shrink-0 border border-border/40 hover:opacity-90 transition"
                >
                  <CatalogProductImage
                    src={selectedCatalogItem.image_url}
                    alt={selectedCatalogItem.model_name}
                    category={selectedCatalogItem.category}
                    brand={selectedCatalogItem.brand}
                  />
                </a>
                <div className="flex-1 space-y-2 text-xs">
                  {selectedCatalogItem.indicative_price && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Verified Product Price</span>
                      <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        ₹{selectedCatalogItem.indicative_price.toLocaleString("en-IN")}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        * Real-time price and stock availability subject to change on supplier website.
                      </p>
                    </div>
                  )}
                  {selectedCatalogItem.official_source_url && (
                    <a
                      href={selectedCatalogItem.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <span>View on {selectedCatalogItem.supplier_name || "Supplier Site"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-muted/50 text-xs leading-relaxed text-muted-foreground">
              {selectedCatalogItem.description}
            </div>

            {/* Technical Parameters Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Manufacturer / Brand</span>
                <span className="font-bold text-foreground">{selectedCatalogItem.manufacturer || selectedCatalogItem.brand}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Category</span>
                <span className="font-bold text-foreground capitalize">{selectedCatalogItem.category.replace("_", " ")}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Power (HP)</span>
                <span className="font-bold text-foreground">{selectedCatalogItem.hp_rating ? `${selectedCatalogItem.hp_rating} HP` : "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Working Width</span>
                <span className="font-bold text-foreground">{selectedCatalogItem.working_width_mm ? `${selectedCatalogItem.working_width_mm} mm` : "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">PTO Power</span>
                <span className="font-bold text-foreground">{selectedCatalogItem.pto_hp ? `${selectedCatalogItem.pto_hp} HP` : "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Lifting Capacity</span>
                <span className="font-bold text-foreground">{selectedCatalogItem.lifting_capacity_kg ? `${selectedCatalogItem.lifting_capacity_kg} kg` : "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Total Weight</span>
                <span className="font-bold text-foreground">{selectedCatalogItem.weight_kg ? `${selectedCatalogItem.weight_kg} kg` : "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Fuel / Power Type</span>
                <span className="font-bold text-foreground">{selectedCatalogItem.fuel_type || "Standard"}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Supplier Attribution</span>
                <span className="font-bold text-foreground">{selectedCatalogItem.supplier_name || "Government / FMTTI"}</span>
              </div>
            </div>

            {/* Provenance Box */}
            <div className="p-3.5 rounded-2xl border border-border/80 bg-background text-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                Source Attribution & Verification
              </span>
              <p className="text-foreground"><strong>Source:</strong> {selectedCatalogItem.provenance_source}</p>
              <p className="text-muted-foreground"><strong>Terms & License:</strong> {selectedCatalogItem.provenance_license}</p>
              {selectedCatalogItem.official_source_url && (
                <a
                  href={selectedCatalogItem.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <span>Open Product Page ({selectedCatalogItem.supplier_name || "Official Spec"})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedCatalogItem(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: POST EQUIPMENT LISTING ─────────────────────────────────── */}
      {showEqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Post Farm Equipment for Rent or Sale
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  List your tractor, rotavator, or implement for local farmers.
                </p>
              </div>
              <button onClick={() => setShowEqModal(false)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipmentListing} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Listing Type *</label>
                  <select
                    value={newEqType}
                    onChange={(e) => setNewEqType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  >
                    <option value="rent">For Rent (Custom Hiring)</option>
                    <option value="sale">For Sale (Direct Sale)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Category *</label>
                  <select
                    value={newEqCategory}
                    onChange={(e) => setNewEqCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  >
                    <option value="tractors">Tractors</option>
                    <option value="harvesters">Harvesters</option>
                    <option value="rotavators">Rotavators</option>
                    <option value="seed_drills">Seed Drills</option>
                    <option value="cultivators">Cultivators</option>
                    <option value="ploughs">Ploughs</option>
                    <option value="sprayers">Sprayers</option>
                    <option value="threshers">Threshers</option>
                    <option value="agricultural_trailers">Agricultural Trailers</option>
                    <option value="irrigation_equipment">Irrigation & Pumps</option>
                    <option value="other_implements">Other Implements</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mahindra 575 DI with Rotavator for Custom Hiring"
                  value={newEqTitle}
                  onChange={(e) => setNewEqTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Brand *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mahindra, Swaraj, Fieldking"
                    value={newEqBrand}
                    onChange={(e) => setNewEqBrand(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Model Name / Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 575 DI XP Plus"
                    value={newEqModel}
                    onChange={(e) => setNewEqModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Rate / Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 850"
                    value={newEqPrice}
                    onChange={(e) => setNewEqPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Unit *</label>
                  <select
                    value={newEqPriceUnit}
                    onChange={(e) => setNewEqPriceUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  >
                    <option value="per hour">per hour</option>
                    <option value="per day">per day</option>
                    <option value="per acre">per acre</option>
                    <option value="total price">total price (for sale)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">HP (Horsepower)</label>
                  <input
                    type="number"
                    placeholder="e.g. 47"
                    value={newEqHp}
                    onChange={(e) => setNewEqHp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="e.g. Madhya Pradesh"
                    value={newEqState}
                    onChange={(e) => setNewEqState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">District *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sehore"
                    value={newEqDistrict}
                    onChange={(e) => setNewEqDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Owner / CHC Name *</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newEqOwnerName}
                    onChange={(e) => setNewEqOwnerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98261 XXXXX"
                    value={newEqOwnerPhone}
                    onChange={(e) => setNewEqOwnerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Notes / Terms</label>
                <textarea
                  placeholder="Mention operator availability, attachments included, or delivery conditions..."
                  value={newEqNotes}
                  onChange={(e) => setNewEqNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEqModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition"
                >
                  {isSubmitting ? "Publishing..." : "Publish Equipment Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: POST PRODUCE LISTING ───────────────────────────────────── */}
      {showProduceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  List Harvest Produce for Sale
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sell directly to verified buyers, millers, and aggregators with zero commission.
                </p>
              </div>
              <button onClick={() => setShowProduceModal(false)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduceListing} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Crop Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Wheat, Paddy, Soybean"
                    value={newProdCrop}
                    onChange={(e) => setNewProdCrop(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Variety</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharbati, Basmati 1121"
                    value={newProdVariety}
                    onChange={(e) => setNewProdVariety(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Available Quantity (Quintals) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Asking Rate (₹ per Quintal) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 2650"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Grade / Quality</label>
                  <input
                    type="text"
                    placeholder="e.g. Grade A FAQ, Sun-dried"
                    value={newProdGrade}
                    onChange={(e) => setNewProdGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Delivery Option</label>
                  <select
                    value={newProdDelivery}
                    onChange={(e) => setNewProdDelivery(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  >
                    <option value="Farm Gate Pickup">Farm Gate Pickup</option>
                    <option value="Mandi Delivery">Mandi Delivery</option>
                    <option value="Direct Dispatch">Direct Dispatch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="e.g. Madhya Pradesh"
                    value={newProdState}
                    onChange={(e) => setNewProdState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">District *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sehore"
                    value={newProdDistrict}
                    onChange={(e) => setNewProdDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Farmer / Collective Name *</label>
                  <input
                    type="text"
                    placeholder="Your Name / FPO"
                    value={newProdFarmerName}
                    onChange={(e) => setNewProdFarmerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98261 XXXXX"
                    value={newProdPhone}
                    onChange={(e) => setNewProdPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Batch Notes</label>
                <textarea
                  placeholder="Mention moisture content, bag packaging, or road access for trucks..."
                  value={newProdNotes}
                  onChange={(e) => setNewProdNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProduceModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition"
                >
                  {isSubmitting ? "Publishing..." : "Publish Produce Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: CONTACT / INQUIRY CONSENT DIALOGUE ─────────────────────── */}
      {showContactModal && contactTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Verified Contact Details</h3>
                  <span className="text-[10px] text-muted-foreground block">Direct Trade Protocol</span>
                </div>
              </div>
              <button onClick={() => setShowContactModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <p className="text-foreground font-bold">{contactTarget.title}</p>
              <p className="text-muted-foreground">Location: <strong className="text-foreground">{contactTarget.location}</strong></p>
              <p className="text-muted-foreground">Contact: <strong className="text-foreground">{contactTarget.name}</strong></p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
              ✓ Verified seller has authorized direct contact for genuine trade inquiries. Zero intermediary deductions apply.
            </div>

            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-2">
              <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                Phone Number
              </span>
              <a
                href={`tel:${contactTarget.phone || ""}`}
                className="text-base font-extrabold text-foreground hover:text-emerald-600 transition block"
              >
                {contactTarget.phone || "+91 Contact via KisaanBuddy Support"}
              </a>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`tel:${contactTarget.phone || ""}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center transition"
              >
                Call Directly
              </a>
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
