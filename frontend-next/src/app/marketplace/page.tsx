"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Heart,
  Phone,
  ShieldCheck,
  MapPin,
  Plus,
  ExternalLink,
  Gauge,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  User,
  Sliders,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  equipmentCatalogApi,
  equipmentListingsApi,
  produceListingsApi,
  EquipmentCatalogItem,
  EquipmentListingItem,
  ProduceListingItem,
} from "@/lib/farmer-api";
import { useLanguage } from "@/lib/language";

// Category definitions matching user specification
const CATEGORIES = [
  { key: "all", labelEn: "All Equipment", labelHi: "सभी उपकरण" },
  { key: "tractors", labelEn: "Tractors", labelHi: "ट्रैक्टर" },
  { key: "harvesters", labelEn: "Harvesters", labelHi: "हार्वेस्टर" },
  { key: "rotavators", labelEn: "Rotavators", labelHi: "रोटावेटर" },
  { key: "seed_drills", labelEn: "Seed Drills", labelHi: "सीड ड्रिल" },
  { key: "cultivators", labelEn: "Cultivators", labelHi: "कल्टीवेटर" },
  { key: "ploughs", labelEn: "Ploughs", labelHi: "हल / प्लाउ" },
  { key: "sprayers", labelEn: "Sprayers", labelHi: "स्प्रेयर" },
  { key: "threshers", labelEn: "Threshers", labelHi: "थ्रेशर" },
  { key: "trailers", labelEn: "Trailers", labelHi: "ट्रेलर व ट्रॉली" },
  { key: "irrigation", labelEn: "Irrigation & Pumps", labelHi: "सिंचाई उपकरण" },
  { key: "other", labelEn: "Other Equipment", labelHi: "अन्य उपकरण" },
];

// Popular search suggestions for fast discovery
const POPULAR_SEARCHES = [
  "Mahindra 575 DI",
  "Swaraj 744 FE",
  "Shaktiman Rotavator",
  "Dasmesh 9100 Combine",
  "Zero Till Seed Drill",
  "John Deere 5310",
  "ASPEE Sprayer",
  "Lemken Disc Plough",
];

// Top tractor & equipment brands for autocomplete
const TOP_BRANDS = [
  "Mahindra",
  "Swaraj",
  "Sonalika",
  "John Deere",
  "TAFE / Massey",
  "Shaktiman",
  "Dasmesh",
  "Fieldking",
  "ASPEE",
  "Lemken",
];

export interface UnifiedProduct {
  id: string;
  sourceType: "catalog" | "listing";
  catalogId?: number;
  listingId?: number;
  title: string;
  brand: string;
  manufacturer: string;
  modelName: string;
  category: string;
  subcategory?: string | null;
  hpRating?: number | null;
  workingWidthMm?: number | null;
  capacity?: string | null;
  weightKg?: number | null;
  liftingCapacityKg?: number | null;
  ptoHp?: number | null;
  fuelType?: string | null;
  price?: number | null;
  priceUnit?: string | null;
  dealType: "rent" | "sale" | "catalog";
  condition: "new" | "used" | "excellent" | "good" | "fair";
  yearOfManufacture?: number | null;
  operatingHours?: number | null;
  includesOperator?: boolean;
  sellerName: string;
  sellerPhone?: string | null;
  sellerLocation: string;
  state?: string;
  district?: string;
  isVerified: boolean;
  hasVerifiedPhoto: boolean;
  imageUrl?: string | null;
  officialSourceUrl?: string | null;
  supplierName?: string | null;
  description?: string | null;
  provenanceSource?: string | null;
  provenanceLicense?: string | null;
}

// Strict genuine machinery photograph resolver
function getVerifiedMachineryPhoto(
  brand?: string,
  modelName?: string,
  rawUrl?: string | null
): string | null {
  if (rawUrl && typeof rawUrl === "string" && rawUrl.trim()) {
    if (rawUrl.endsWith(".svg")) {
      return rawUrl
        .replace(".svg", ".png")
        .replace("mahindra-575.png", "mahindra-575.webp")
        .replace("tafe-241.png", "tafe-241.jpg")
        .replace("diesel-pump.png", "diesel-pump.jpg")
        .replace("drip-irrigation.png", "drip-irrigation.jpg");
    }
    return rawUrl;
  }
  return null;
}

// Clean Product Image with strict aspect ratio, contain fit and honest missing photo state
function ProductCardImage({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-stone-50 dark:bg-stone-900 rounded-lg border border-dashed border-stone-200 dark:border-stone-800">
        <AlertCircle className="w-6 h-6 text-amber-500 mb-1" />
        <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
          Photo Pending
        </span>
        <span className="text-[10px] text-stone-400">
          Awaiting verified photo
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
      onError={() => setImageError(true)}
    />
  );
}

export default function MarketplacePage() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  // Data states
  const [catalogItems, setCatalogItems] = useState<EquipmentCatalogItem[]>([]);
  const [equipmentListings, setEquipmentListings] = useState<EquipmentListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [dealFilter, setDealFilter] = useState<"all" | "rent" | "sale">("all");
  const [hpRange, setHpRange] = useState<"all" | "under_40" | "40_55" | "55_75" | "above_75">("all");
  const [conditionFilter, setConditionFilter] = useState<"all" | "new" | "used">("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Layout & Sorting
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "hp_desc" | "newest">("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Mobile drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Wishlist persisted in localStorage
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactTarget, setContactTarget] = useState<{
    name: string;
    phone?: string | null;
    title: string;
    location: string;
  } | null>(null);

  // List Product Form Modal
  const [showListModal, setShowListModal] = useState(false);
  const [newEqType, setNewEqType] = useState<"rent" | "sale">("rent");
  const [newEqTitle, setNewEqTitle] = useState("");
  const [newEqBrand, setNewEqBrand] = useState("");
  const [newEqModel, setNewEqModel] = useState("");
  const [newEqCategory, setNewEqCategory] = useState("tractors");
  const [newEqHp, setNewEqHp] = useState("");
  const [newEqPrice, setNewEqPrice] = useState("");
  const [newEqPriceUnit, setNewEqPriceUnit] = useState("per day");
  const [newEqOwnerName, setNewEqOwnerName] = useState("");
  const [newEqOwnerPhone, setNewEqOwnerPhone] = useState("");
  const [newEqState, setNewEqState] = useState("");
  const [newEqDistrict, setNewEqDistrict] = useState("");
  const [newEqNotes, setNewEqNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kisaanbuddy_wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("kisaanbuddy_wishlist", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch marketplace data from backend APIs
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, eqRes] = await Promise.all([
        equipmentCatalogApi.list({ limit: 250 }).catch(() => ({ items: [], total: 0 })),
        equipmentListingsApi.list({ limit: 100, status: "available" }).catch(() => ({ items: [], total: 0 })),
      ]);
      setCatalogItems(catRes.items || []);
      setEquipmentListings(eqRes.items || []);
    } catch (err) {
      console.error("Failed to load marketplace listings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Combine reference models and active farmer listings into unified products
  const unifiedProducts = useMemo<UnifiedProduct[]>(() => {
    const list: UnifiedProduct[] = [];

    // Real Farmer Listings (Rent / Sale)
    for (const item of equipmentListings) {
      const matchedCat = item.catalog_id ? catalogItems.find((c) => c.id === item.catalog_id) : null;
      const verifiedImg = item.image_url || matchedCat?.image_url || null;

      list.push({
        id: `list-${item.id}`,
        sourceType: "listing",
        listingId: item.id,
        catalogId: item.catalog_id || undefined,
        title: item.title,
        brand: item.brand,
        manufacturer: item.brand,
        modelName: item.model_name || item.title,
        category: item.category,
        hpRating: item.hp_rating,
        price: item.price,
        priceUnit: item.price_unit,
        dealType: item.listing_type,
        condition: item.condition,
        yearOfManufacture: item.year_of_manufacture,
        operatingHours: item.operating_hours,
        includesOperator: item.includes_operator,
        sellerName: item.owner_name,
        sellerPhone: item.owner_phone,
        sellerLocation: `${item.district}, ${item.state}`,
        state: item.state,
        district: item.district,
        isVerified: true,
        hasVerifiedPhoto: Boolean(verifiedImg),
        imageUrl: verifiedImg,
        description: item.notes,
      });
    }

    // Official Catalog Models
    for (const item of catalogItems) {
      const resolvedImg = getVerifiedMachineryPhoto(item.brand, item.model_name, item.image_url);

      list.push({
        id: `cat-${item.id}`,
        sourceType: "catalog",
        catalogId: item.id,
        title: `${item.brand} ${item.model_name}`,
        brand: item.brand,
        manufacturer: item.manufacturer || item.brand,
        modelName: item.model_name,
        category: item.category,
        subcategory: item.subcategory,
        hpRating: item.hp_rating,
        workingWidthMm: item.working_width_mm,
        capacity: item.capacity,
        weightKg: item.weight_kg,
        liftingCapacityKg: item.lifting_capacity_kg,
        ptoHp: item.pto_hp,
        fuelType: item.fuel_type,
        price: item.indicative_price,
        priceUnit: item.indicative_price ? "total price" : null,
        dealType: "catalog",
        condition: "new",
        sellerName: item.supplier_name || "Official Manufacturer Network",
        sellerLocation: "Authorized Pan-India Dealers",
        isVerified: item.is_verified ?? true,
        hasVerifiedPhoto: Boolean(resolvedImg),
        imageUrl: resolvedImg,
        officialSourceUrl: item.official_source_url,
        supplierName: item.supplier_name,
        description: item.description,
        provenanceSource: item.provenance_source,
        provenanceLicense: item.provenance_license,
      });
    }

    return list;
  }, [equipmentListings, catalogItems]);

  // Unique brands with counts
  const availableBrands = useMemo(() => {
    const map: Record<string, number> = {};
    unifiedProducts.forEach((p) => {
      const b = p.brand?.trim();
      if (b) map[b] = (map[b] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([brand, count]) => ({ brand, count }));
  }, [unifiedProducts]);

  // Unique states
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    unifiedProducts.forEach((p) => {
      if (p.state && p.state.trim()) states.add(p.state.trim());
    });
    return Array.from(states).sort();
  }, [unifiedProducts]);

  // Autocomplete suggestions based on query
  const autocompleteSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { brands: [], categories: [], products: [] };

    const matchingBrands = availableBrands
      .filter((b) => b.brand.toLowerCase().includes(q))
      .slice(0, 4);

    const matchingCategories = CATEGORIES
      .filter((c) => c.key !== "all" && (c.labelEn.toLowerCase().includes(q) || c.key.toLowerCase().includes(q)))
      .slice(0, 3);

    const matchingProducts = unifiedProducts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.modelName.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
      .slice(0, 5);

    return {
      brands: matchingBrands,
      categories: matchingCategories,
      products: matchingProducts,
    };
  }, [searchQuery, availableBrands, unifiedProducts]);

  // Category matching helper
  const matchesCategory = (productCat: string, selected: string) => {
    if (selected === "all") return true;
    const pc = productCat.toLowerCase();
    const sel = selected.toLowerCase();
    if (sel === "trailers") {
      return pc.includes("trailer") || pc.includes("trolley");
    }
    if (sel === "irrigation") {
      return pc.includes("irrigation") || pc.includes("pump");
    }
    if (sel === "other") {
      return pc.includes("other") || pc.includes("implement") || pc.includes("leveller");
    }
    return pc.includes(sel);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return unifiedProducts.filter((product) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          product.title.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          product.modelName.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.sellerName.toLowerCase().includes(q) ||
          (product.description && product.description.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== "all" && !matchesCategory(product.category, selectedCategory)) {
        return false;
      }

      // Brand
      if (selectedBrand !== "all" && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Deal type
      if (dealFilter === "rent" && product.dealType !== "rent") return false;
      if (dealFilter === "sale" && product.dealType !== "sale" && product.dealType !== "catalog") return false;

      // Engine HP
      if (hpRange !== "all") {
        const hp = product.hpRating ?? 0;
        if (hpRange === "under_40" && (hp === 0 || hp >= 40)) return false;
        if (hpRange === "40_55" && (hp < 40 || hp > 55)) return false;
        if (hpRange === "55_75" && (hp < 55 || hp > 75)) return false;
        if (hpRange === "above_75" && hp < 75) return false;
      }

      // Condition
      if (conditionFilter === "new" && product.condition !== "new") return false;
      if (conditionFilter === "used" && product.condition === "new") return false;

      // Location
      if (stateFilter !== "all" && product.state && product.state.toLowerCase() !== stateFilter.toLowerCase()) {
        return false;
      }

      // Price
      if (minPrice && product.price != null && product.price < parseFloat(minPrice)) return false;
      if (maxPrice && product.price != null && product.price > parseFloat(maxPrice)) return false;

      return true;
    });
  }, [
    unifiedProducts,
    searchQuery,
    selectedCategory,
    selectedBrand,
    dealFilter,
    hpRange,
    conditionFilter,
    stateFilter,
    minPrice,
    maxPrice,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "price_asc":
        return list.sort((a, b) => (a.price ?? 99999999) - (b.price ?? 99999999));
      case "price_desc":
        return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "hp_desc":
        return list.sort((a, b) => (b.hpRating ?? 0) - (a.hpRating ?? 0));
      case "newest":
        return list.sort((a, b) => (b.yearOfManufacture ?? 2020) - (a.yearOfManufacture ?? 2020));
      case "relevance":
      default:
        return list.sort((a, b) => {
          if (a.sourceType === "listing" && b.sourceType !== "listing") return -1;
          if (b.sourceType === "listing" && a.sourceType !== "listing") return 1;
          if (a.price && !b.price) return -1;
          if (b.price && !a.price) return 1;
          return a.title.localeCompare(b.title);
        });
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, dealFilter, hpRange, conditionFilter, stateFilter, minPrice, maxPrice, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setDealFilter("all");
    setHpRange("all");
    setConditionFilter("all");
    setStateFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedBrand !== "all") count++;
    if (dealFilter !== "all") count++;
    if (hpRange !== "all") count++;
    if (conditionFilter !== "all") count++;
    if (stateFilter !== "all") count++;
    if (minPrice || maxPrice) count++;
    if (searchQuery) count++;
    return count;
  }, [selectedCategory, selectedBrand, dealFilter, hpRange, conditionFilter, stateFilter, minPrice, maxPrice, searchQuery]);

  const openContact = (name: string, phone: string | null | undefined, title: string, location: string) => {
    setContactTarget({ name, phone, title, location });
    setShowContactModal(true);
  };

  // Create Listing
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqTitle || !newEqBrand || !newEqPrice || !newEqOwnerName || !newEqOwnerPhone) {
      alert("Please fill all required fields marked with *");
      return;
    }
    try {
      setIsSubmitting(true);
      await equipmentListingsApi.create({
        listing_type: newEqType,
        title: newEqTitle,
        brand: newEqBrand,
        model_name: newEqModel || newEqTitle,
        category: newEqCategory,
        hp_rating: newEqHp ? parseFloat(newEqHp) : null,
        condition: "good",
        year_of_manufacture: 2023,
        price: parseFloat(newEqPrice),
        price_unit: newEqPriceUnit,
        includes_operator: true,
        owner_name: newEqOwnerName,
        owner_phone: newEqOwnerPhone,
        owner_consent_shared: true,
        state: newEqState || "Madhya Pradesh",
        district: newEqDistrict || "Sehore",
        notes: newEqNotes || null,
      });
      alert(isHi ? "मशीन लिस्टिंग सफलतापूर्वक पोस्ट हो गई है!" : "Equipment listing published successfully!");
      setShowListModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to publish listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased">
      {/* ─── 1. HEADER: CLEAN SINGLE-ROW AMAZON-INSPIRED HEADER ─────────────── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between gap-4 h-16">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/marketplace" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-emerald-800 transition">
                  🌾
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-white">
                    Kisaan<span className="text-emerald-700">Buddy</span>
                  </span>
                  <p className="text-[11px] text-stone-500 font-normal leading-none hidden sm:block">
                    Machinery & Farm Commerce
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Large, Prominent Search Bar */}
            <div ref={searchContainerRef} className="flex-1 max-w-2xl relative hidden sm:block">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchFocused(false);
                }}
                className="relative flex items-center"
              >
                <div className="relative w-full flex items-center">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isHi
                        ? "ट्रैक्टर, कंबाइन, रोटावेटर या ब्रांड खोजें (उदा. Mahindra 575)..."
                        : "Search tractors, harvesters, equipment, brands..."
                    }
                    className="w-full pl-10 pr-24 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-stone-900 dark:text-white placeholder:text-stone-400 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold flex items-center justify-center transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Instant Search Suggestions Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xl p-3 z-50 space-y-3">
                  {/* Matching Brands */}
                  {autocompleteSuggestions.brands.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 mb-1">
                        Brands
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {autocompleteSuggestions.brands.map((b) => (
                          <button
                            key={b.brand}
                            onMouseDown={() => {
                              setSelectedBrand(b.brand);
                              setSearchFocused(false);
                            }}
                            className="text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 dark:text-stone-300 transition text-left"
                          >
                            {b.brand} <span className="text-[10px] text-stone-400">({b.count})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Categories */}
                  {autocompleteSuggestions.categories.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 mb-1">
                        Categories
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {autocompleteSuggestions.categories.map((c) => (
                          <button
                            key={c.key}
                            onMouseDown={() => {
                              setSelectedCategory(c.key);
                              setSearchFocused(false);
                            }}
                            className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium transition"
                          >
                            In {c.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Products with Genuine Thumbnails */}
                  {autocompleteSuggestions.products.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 mb-1.5">
                        Matching Listings
                      </div>
                      <div className="divide-y divide-stone-100 dark:divide-stone-800">
                        {autocompleteSuggestions.products.map((p) => (
                          <div
                            key={p.id}
                            onMouseDown={() => {
                              setSelectedProduct(p);
                              setSearchFocused(false);
                            }}
                            className="flex items-center gap-3 p-1.5 rounded-md hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition"
                          >
                            <div className="w-10 h-8 rounded bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-contain" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-stone-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                                {p.title}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                {p.brand} • {p.district || p.sellerLocation}
                              </p>
                            </div>
                            {p.price != null && (
                              <span className="text-xs font-bold text-emerald-700 shrink-0">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches Fallback when query is empty */}
                  {!searchQuery.trim() && (
                    <div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 mb-1.5">
                        Popular Searches
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_SEARCHES.map((term) => (
                          <button
                            key={term}
                            onMouseDown={() => {
                              setSearchQuery(term);
                              setSearchFocused(false);
                            }}
                            className="text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 dark:text-stone-300 transition"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Mandi Live */}
              <Link
                href="/mandi"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-emerald-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md transition"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mandi Live</span>
              </Link>

              {/* Wishlist */}
              <button
                onClick={() => {
                  // Toggle filter to wishlisted items or clear
                  if (wishlist.length > 0) {
                    // Filter down to wishlisted
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-rose-600 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md transition"
                title={`${wishlist.length} Saved in Wishlist`}
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : "text-stone-500"}`} />
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{wishlist.length}</span>
              </button>

              {/* List Your Product CTA */}
              <button
                onClick={() => setShowListModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List Product</span>
              </button>

              {/* Account icon */}
              <Link
                href="/dashboard"
                className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-emerald-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition"
                title="Your Farm Account"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="pb-3 sm:hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchFocused(false);
              }}
              className="relative flex items-center"
            >
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tractors, harvesters, brands..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 p-1 text-stone-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </header>

      {/* ─── 2. CATEGORY NAVIGATION: COMPACT SINGLE-ROW HORIZONTAL BAR ──────── */}
      <nav
        aria-label="Machinery Categories"
        className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 overflow-x-auto scrollbar-none"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap py-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    isSelected
                      ? "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {isHi ? cat.labelHi : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ─── 3. MAIN CONTENT: SIDEBAR + PRODUCT GRID ────────────────────────── */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ─── Left Sidebar: Amazon-inspired Clean Filters ─────────────────── */}
          <aside className="hidden lg:block lg:col-span-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-5 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Listing Type / Deal Type */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Listing Type
              </span>
              <div className="space-y-1.5 text-xs">
                {[
                  { key: "all", label: "All Equipment" },
                  { key: "rent", label: "Available for Rent" },
                  { key: "sale", label: "Buy / For Sale" },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                    <input
                      type="radio"
                      name="dealType"
                      checked={dealFilter === opt.key}
                      onChange={() => setDealFilter(opt.key as any)}
                      className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700 border-stone-300"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Brand & Manufacturer
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300 font-medium">
                  <input
                    type="radio"
                    name="brandFilter"
                    checked={selectedBrand === "all"}
                    onChange={() => setSelectedBrand("all")}
                    className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700"
                  />
                  <span>All Brands</span>
                </label>
                {availableBrands.map(({ brand, count }) => (
                  <label key={brand} className="flex items-center justify-between gap-2 cursor-pointer text-stone-600 dark:text-stone-400 hover:text-stone-900">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="brandFilter"
                        checked={selectedBrand === brand}
                        onChange={() => setSelectedBrand(brand)}
                        className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700"
                      />
                      <span>{brand}</span>
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">({count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Engine Power (HP) */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Engine Power (HP)
              </span>
              <div className="space-y-1.5 text-xs">
                {[
                  { key: "all", label: "Any Horsepower" },
                  { key: "under_40", label: "Under 40 HP" },
                  { key: "40_55", label: "40 – 55 HP" },
                  { key: "55_75", label: "55 – 75 HP" },
                  { key: "above_75", label: "75+ HP" },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                    <input
                      type="radio"
                      name="hpRange"
                      checked={hpRange === opt.key}
                      onChange={() => setHpRange(opt.key as any)}
                      className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Price (₹)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Condition
              </span>
              <div className="space-y-1.5 text-xs">
                {[
                  { key: "all", label: "All Conditions" },
                  { key: "new", label: "Brand New / Spec" },
                  { key: "used", label: "Used / Certified" },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                    <input
                      type="radio"
                      name="condition"
                      checked={conditionFilter === opt.key}
                      onChange={() => setConditionFilter(opt.key as any)}
                      className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location / State */}
            {availableStates.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Location
                </span>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white"
                >
                  <option value="all">All States</option>
                  {availableStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </aside>

          {/* ─── Right Column: Results & Product Cards ──────────────────────── */}
          <div className="lg:col-span-9 space-y-4">
            {/* Top Toolbar: Results count, sorting, view toggle, mobile filter trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
              {/* Results headline */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                  {searchQuery ? (
                    <>
                      Results for &quot;<span className="text-stone-900 dark:text-white font-bold">{searchQuery}</span>&quot;
                    </>
                  ) : (
                    <>
                      Showing {Math.min(sortedProducts.length, pageSize)} of {sortedProducts.length} results
                    </>
                  )}
                </span>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                </button>
              </div>

              {/* Sort & View Mode */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-stone-500 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200"
                  >
                    <option value="relevance">Featured / Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="hp_desc">Horsepower: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-md p-0.5 bg-stone-50 dark:bg-stone-800">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-white dark:bg-stone-900 text-emerald-700 shadow-2xs" : "text-stone-400"}`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-white dark:bg-stone-900 text-emerald-700 shadow-2xs" : "text-stone-400"}`}
                    title="List View"
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                {selectedBrand !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                    Brand: {selectedBrand}
                    <button onClick={() => setSelectedBrand("all")}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                {dealFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                    {dealFilter === "rent" ? "For Rent" : "For Sale"}
                    <button onClick={() => setDealFilter("all")}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery("")}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-emerald-700 hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* ─── Product Feed ──────────────────────────────────────────────── */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3 animate-pulse">
                    <div className="w-full aspect-[4/3] bg-stone-100 dark:bg-stone-800 rounded-lg" />
                    <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded w-1/3" />
                    <div className="h-5 bg-stone-100 dark:bg-stone-800 rounded w-4/5" />
                    <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded w-1/2" />
                    <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-12 text-center text-stone-500 space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  No matching agricultural products found
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting your search query, clearing specific filters, or checking different categories.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* Amazon-Style Grid Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {paginatedProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
                    >
                      <div>
                        {/* Image Container with 4:3 aspect ratio */}
                        <div className="relative w-full aspect-[4/3] bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 flex items-center justify-center p-3 select-none overflow-hidden">
                          <ProductCardImage src={product.imageUrl} alt={product.title} />

                          {/* Top Left: Deal Badge */}
                          <div className="absolute top-2.5 left-2.5 z-10">
                            {product.dealType === "rent" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                                For Rent
                              </span>
                            ) : product.dealType === "sale" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200/80">
                                For Sale
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                                Model Spec
                              </span>
                            )}
                          </div>

                          {/* Top Right: Wishlist Icon */}
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(product.id, e)}
                            className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 dark:bg-stone-800/90 hover:bg-white text-stone-400 hover:text-rose-600 shadow-2xs border border-stone-200/60 transition"
                            title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>
                        </div>

                        {/* Card Info */}
                        <div className="p-3.5 space-y-2">
                          {/* Brand & Category */}
                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span className="font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 truncate max-w-[140px]">
                              {product.brand}
                            </span>
                            <span className="capitalize text-stone-400 truncate max-w-[100px]">
                              {product.category.replace(/_/g, " ")}
                            </span>
                          </div>

                          {/* Product Title */}
                          <h4 className="text-sm font-semibold text-stone-900 dark:text-white group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                            {product.title}
                          </h4>

                          {/* Specs Row */}
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-stone-600 dark:text-stone-400">
                            {product.hpRating != null && product.hpRating > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300">
                                <Gauge className="w-3 h-3 text-emerald-700" />
                                {product.hpRating} HP
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] capitalize">
                              {product.condition === "new" ? "New" : `${product.condition} condition`}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="pt-1">
                            {product.price != null ? (
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-stone-900 dark:text-white tracking-tight">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                {product.priceUnit && (
                                  <span className="text-xs text-stone-500 font-normal">
                                    /{product.priceUnit.replace("per ", "")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-700">
                                Official Spec • Price on Request
                              </span>
                            )}
                          </div>

                          {/* Location & Seller */}
                          <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                            <span className="truncate max-w-[130px] font-medium text-stone-700 dark:text-stone-300">
                              {product.sellerName}
                            </span>
                            <span className="flex items-center gap-0.5 text-stone-400 shrink-0">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span className="truncate max-w-[80px]">{product.district || "Pan-India"}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-3 pt-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-800 dark:text-stone-200 font-medium text-xs transition text-center"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openContact(product.sellerName, product.sellerPhone, product.title, product.sellerLocation);
                          }}
                          className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Contact</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Amazon-Style List View */
              <div className="space-y-3">
                {paginatedProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3.5 hover:border-stone-300 hover:shadow-sm transition flex flex-col sm:flex-row items-center gap-4 cursor-pointer"
                    >
                      <div className="w-full sm:w-48 aspect-[4/3] bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 shrink-0 overflow-hidden relative flex items-center justify-center p-2">
                        <ProductCardImage src={product.imageUrl} alt={product.title} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5 w-full">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-stone-500 uppercase">{product.brand}</span>
                          <span className="text-stone-300">•</span>
                          <span className="capitalize text-stone-400">{product.category.replace(/_/g, " ")}</span>
                          {product.dealType === "rent" ? (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                              For Rent
                            </span>
                          ) : product.dealType === "sale" ? (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-sky-50 text-sky-800">
                              For Sale
                            </span>
                          ) : null}
                        </div>

                        <h4 className="text-sm font-semibold text-stone-900 dark:text-white group-hover:text-emerald-700">
                          {product.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-stone-500">
                          {product.hpRating && <span>{product.hpRating} HP Power</span>}
                          {product.workingWidthMm && <span>Width: {product.workingWidthMm} mm</span>}
                          <span>Condition: {product.condition}</span>
                        </div>

                        <div className="text-xs text-stone-500 flex items-center gap-2 pt-1">
                          <span className="font-medium text-stone-700 dark:text-stone-300">{product.sellerName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {product.sellerLocation}
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-44 text-right shrink-0 border-t sm:border-t-0 sm:border-l border-stone-100 dark:border-stone-800 pl-0 sm:pl-4 pt-2 sm:pt-0 space-y-2">
                        <div>
                          {product.price != null ? (
                            <div>
                              <div className="text-lg font-bold text-stone-900 dark:text-white">
                                ₹{product.price.toLocaleString("en-IN")}
                              </div>
                              {product.priceUnit && (
                                <div className="text-[11px] text-stone-500">
                                  /{product.priceUnit.replace("per ", "")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs font-semibold text-emerald-700">Price on Request</div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(product.id, e)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openContact(product.sellerName, product.sellerPhone, product.title, product.sellerLocation);
                            }}
                            className="py-1.5 px-3 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Contact</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-5 border-t border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium disabled:opacity-40 hover:bg-stone-50 transition"
                >
                  Previous
                </button>
                <span className="text-xs text-stone-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium disabled:opacity-40 hover:bg-stone-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── 4. MOBILE FILTER DRAWER ────────────────────────────────────────── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white dark:bg-stone-900 rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="font-bold text-sm text-stone-900 dark:text-white">Filter Machinery</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold block mb-1.5">Listing Type</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "rent", label: "For Rent" },
                    { key: "sale", label: "For Sale" },
                  ].map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setDealFilter(d.key as any)}
                      className={`py-1.5 rounded-lg border text-center font-medium ${
                        dealFilter === d.key
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-stone-50 border-stone-200 text-stone-700"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold block mb-1.5">Brand</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                >
                  <option value="all">All Brands</option>
                  {availableBrands.map((b) => (
                    <option key={b.brand} value={b.brand}>
                      {b.brand} ({b.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="font-bold block mb-1.5">Engine Power (HP)</span>
                <select
                  value={hpRange}
                  onChange={(e) => setHpRange(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                >
                  <option value="all">Any Horsepower</option>
                  <option value="under_40">Under 40 HP</option>
                  <option value="40_55">40 – 55 HP</option>
                  <option value="55_75">55 – 75 HP</option>
                  <option value="above_75">75+ HP</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-2 py-2.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. PRODUCT DETAIL MODAL ────────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-h-[90vh] overflow-y-auto my-auto p-5 sm:p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                  {selectedProduct.brand}
                </span>
                <span className="text-xs text-stone-400 capitalize">
                  {selectedProduct.category.replace("_", " ")}
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Image */}
              <div className="w-full aspect-[4/3] bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-center p-4">
                <ProductCardImage src={selectedProduct.imageUrl} alt={selectedProduct.title} />
              </div>

              {/* Info & Price */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug">
                  {selectedProduct.title}
                </h3>
                <p className="text-xs text-stone-400">
                  Model: {selectedProduct.modelName}
                </p>

                {/* Price block */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase block">
                    {selectedProduct.dealType === "rent" ? "Rental Rate" : "Price"}
                  </span>
                  {selectedProduct.price != null ? (
                    <div className="text-xl font-bold text-stone-900 dark:text-white mt-0.5">
                      ₹{selectedProduct.price.toLocaleString("en-IN")}{" "}
                      {selectedProduct.priceUnit && (
                        <span className="text-xs font-normal text-stone-500">
                          /{selectedProduct.priceUnit.replace("per ", "")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-emerald-700">
                      Official Reference Specification
                    </div>
                  )}
                </div>

                {/* Seller info */}
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs space-y-1">
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Seller / Provider</div>
                  <div className="font-semibold text-stone-900 dark:text-white">{selectedProduct.sellerName}</div>
                  <div className="text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{selectedProduct.sellerLocation}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      openContact(
                        selectedProduct.sellerName,
                        selectedProduct.sellerPhone,
                        selectedProduct.title,
                        selectedProduct.sellerLocation
                      );
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Seller</span>
                  </button>

                  {selectedProduct.officialSourceUrl && (
                    <a
                      href={selectedProduct.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs"
                      title="View Official Source"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications grid */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Specifications
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800">
                  <span className="text-[10px] text-stone-400 block">Horsepower</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {selectedProduct.hpRating ? `${selectedProduct.hpRating} HP` : "N/A"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800">
                  <span className="text-[10px] text-stone-400 block">Category</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
                    {selectedProduct.category.replace("_", " ")}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800">
                  <span className="text-[10px] text-stone-400 block">Condition</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
                    {selectedProduct.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. CONTACT SELLER MODAL ────────────────────────────────────────── */}
      {showContactModal && contactTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-sm rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <span className="text-sm font-bold text-stone-900 dark:text-white">Seller Contact</span>
              <button onClick={() => setShowContactModal(false)} className="p-1 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800 text-xs space-y-0.5">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Equipment</span>
              <p className="font-semibold text-stone-900 dark:text-white">{contactTarget.title}</p>
              <p className="text-stone-500">📍 {contactTarget.location}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-stone-200 bg-white dark:bg-stone-900">
                <span className="text-[10px] text-stone-400 uppercase block font-bold">Contact Name</span>
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{contactTarget.name}</span>
              </div>

              {contactTarget.phone ? (
                <a
                  href={`tel:${contactTarget.phone}`}
                  className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {contactTarget.phone}</span>
                </a>
              ) : (
                <div className="p-2.5 rounded-lg bg-stone-100 text-stone-600 text-center">
                  Phone number shared upon request. Request logged.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. LIST YOUR EQUIPMENT MODAL ───────────────────────────────────── */}
      {showListModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl border border-stone-200 p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">List Machinery for Rent or Sale</h3>
              <button onClick={() => setShowListModal(false)} className="p-1 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Listing Type *</label>
                  <select
                    value={newEqType}
                    onChange={(e) => setNewEqType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  >
                    <option value="rent">For Rent (Custom Hiring)</option>
                    <option value="sale">For Sale (Direct Sale)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <select
                    value={newEqCategory}
                    onChange={(e) => setNewEqCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  >
                    {CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Equipment Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mahindra 575 DI XP Plus with Rotavator"
                  value={newEqTitle}
                  onChange={(e) => setNewEqTitle(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mahindra, Swaraj"
                    value={newEqBrand}
                    onChange={(e) => setNewEqBrand(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 575 DI"
                    value={newEqModel}
                    onChange={(e) => setNewEqModel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    value={newEqPrice}
                    onChange={(e) => setNewEqPrice(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit *</label>
                  <select
                    value={newEqPriceUnit}
                    onChange={(e) => setNewEqPriceUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  >
                    <option value="per day">per day</option>
                    <option value="per hour">per hour</option>
                    <option value="per acre">per acre</option>
                    <option value="total price">total price</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">HP (Engine)</label>
                  <input
                    type="number"
                    placeholder="e.g. 47"
                    value={newEqHp}
                    onChange={(e) => setNewEqHp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newEqOwnerName}
                    onChange={(e) => setNewEqOwnerName(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98261 XXXXX"
                    value={newEqOwnerPhone}
                    onChange={(e) => setNewEqOwnerPhone(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="e.g. Madhya Pradesh"
                    value={newEqState}
                    onChange={(e) => setNewEqState(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">District *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sehore"
                    value={newEqDistrict}
                    onChange={(e) => setNewEqDistrict(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  {isSubmitting ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
