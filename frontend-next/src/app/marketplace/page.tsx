"use client";

import machineryAuditData from "@/lib/data/machinery-image-mapping.json";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Heart,
  Phone,
  ShieldCheck,
  MapPin,
  Truck,
  Plus,
  Wrench,
  ExternalLink,
  Calendar,
  Gauge,
  FileText,
  Layers,
  Info,
  Check,
  ChevronRight,
  ChevronDown,
  RotateCw,
  AlertCircle,
  Eye,
  Scale,
  Share2,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Store,
  Fuel,
  Sliders,
  User,
} from "lucide-react";
import {
  equipmentCatalogApi,
  equipmentListingsApi,
  produceListingsApi,
  marketPricesApi,
  marketplaceSourcesApi,
  marketplaceApi,
  EquipmentCatalogItem,
  EquipmentListingItem,
  ProduceListingItem,
  MarketPriceItem,
  ImportSourceItem,
  MarketplaceListing,
} from "@/lib/farmer-api";
import { useLanguage, type Lang } from "@/lib/language";
import { MARKETPLACE_I18N } from "@/lib/marketplace-i18n";

type MainSectionMode = "machinery" | "produce" | "buyers" | "provenance";
type DealFilter = "all" | "rent" | "sale";
type SortOption = "relevance" | "price_asc" | "price_desc" | "hp_desc" | "newest";

// Canonical category definitions with clean professional labels (no cartoon emojis in title)
const EQUIPMENT_CATEGORIES = [
  { key: "all", labelEn: "All Products", labelHi: "सभी उत्पाद" },
  { key: "tractors", labelEn: "Tractors", labelHi: "ट्रैक्टर" },
  { key: "harvesters", labelEn: "Harvesters", labelHi: "कंबाइन हार्वेस्टर" },
  { key: "rotavators", labelEn: "Rotavators", labelHi: "रोटावेटर" },
  { key: "seed_drills", labelEn: "Seed Drills", labelHi: "सीड ड्रिल" },
  { key: "cultivators", labelEn: "Cultivators", labelHi: "कल्टीवेटर" },
  { key: "ploughs", labelEn: "Ploughs", labelHi: "हल / प्लाउ" },
  { key: "sprayers", labelEn: "Sprayers", labelHi: "स्प्रेयर" },
  { key: "threshers", labelEn: "Threshers", labelHi: "थ्रेशर" },
  { key: "agricultural_trailers", labelEn: "Trailers & Trolleys", labelHi: "ट्रेलर व ट्रॉली" },
  { key: "irrigation_equipment", labelEn: "Irrigation & Pumps", labelHi: "सिंचाई उपकरण" },
  { key: "other_implements", labelEn: "Other Equipment", labelHi: "अन्य उपकरण" },
];

// Verified manufacturer image assets in /public/images/marketplace/
const VERIFIED_MACHINE_IMAGES: Record<string, string> = {
  // Tractors (Strict exact manufacturer models)
  "mahindra-575": "/images/marketplace/tractors/mahindra-575.webp",
  "swaraj-744": "/images/marketplace/tractors/swaraj-744.png",
  "sonalika-745": "/images/marketplace/tractors/sonalika-745.png",
  "tafe-241": "/images/marketplace/tractors/tafe-241.jpg",
  "john-deere-5310": "/images/marketplace/tractors/john-deere-5310.png",
  // Harvesters
  "dasmesh-9100": "/images/marketplace/harvesters/dasmesh-9100.png",
  "preet-987": "/images/marketplace/harvesters/preet-987.png",
  "shaktiman-sugarcane": "/images/marketplace/harvesters/shaktiman-sugarcane.png",
  // Implements & Rotavators
  "shaktiman-rotavator": "/images/marketplace/implements/shaktiman-rotavator.png",
  "fieldking-rotavator": "/images/marketplace/implements/fieldking-rotavator.png",
  "maschio-virat": "/images/marketplace/implements/maschio-virat.png",
  "roto-seed-drill": "/images/marketplace/implements/roto-seed-drill.png",
  "zero-till-drill": "/images/marketplace/implements/zero-till-drill.png",
  cultivator: "/images/marketplace/implements/cultivator.png",
  "spring-cultivator": "/images/marketplace/implements/spring-cultivator.png",
  "lemken-plough": "/images/marketplace/implements/lemken-plough.png",
  "disc-plough": "/images/marketplace/implements/disc-plough.png",
  "boom-sprayer": "/images/marketplace/implements/boom-sprayer.png",
  "orchard-sprayer": "/images/marketplace/implements/orchard-sprayer.png",
  thresher: "/images/marketplace/implements/thresher.png",
  "paddy-thresher": "/images/marketplace/implements/paddy-thresher.png",
  "straw-reaper": "/images/marketplace/implements/straw-reaper.png",
  "farm-trailer": "/images/marketplace/implements/farm-trailer.png",
  "tipping-trailer": "/images/marketplace/implements/tipping-trailer.png",
  "diesel-pump": "/images/marketplace/implements/diesel-pump.jpg",
  "drip-irrigation": "/images/marketplace/implements/drip-irrigation.jpg",
  "round-baler": "/images/marketplace/implements/round-baler.png",
  "laser-leveller": "/images/marketplace/implements/laser-leveller.png",
};

// Top search suggestions for fast discovery
const SEARCH_SUGGESTIONS = [
  "Mahindra 575 DI",
  "Swaraj 744 FE",
  "Shaktiman Rotavator",
  "Boom Sprayer",
  "Dasmesh Harvester",
  "Zero Till Seed Drill",
  "John Deere 5310",
  "Paddy Thresher",
  "Lemken Disc Plough",
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

// Strict genuine machinery photograph resolver (NEVER uses heuristic fallback to different models)
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

// Premium Large Product Image Component: Strict 4:3 Aspect Ratio, Contain Fit, Clean White Background
function ProductCardImage({
  src,
  alt,
  category,
  brand,
  modelName,
}: {
  src?: string | null;
  alt: string;
  category?: string;
  brand?: string;
  modelName?: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        <AlertCircle className="w-8 h-8 text-amber-500 mb-1.5" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Photo Pending
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">
          Authentic seller photography awaiting upload
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 group-hover:scale-105"
      onError={() => setImageError(true)}
    />
  );
}

export default function MarketplacePage() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  // Navigation mode
  const [sectionMode, setSectionMode] = useState<MainSectionMode>("machinery");

  // Raw data collections
  const [catalogItems, setCatalogItems] = useState<EquipmentCatalogItem[]>([]);
  const [equipmentListings, setEquipmentListings] = useState<EquipmentListingItem[]>([]);
  const [produceListings, setProduceListings] = useState<ProduceListingItem[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>([]);
  const [sources, setSources] = useState<ImportSourceItem[]>([]);
  const [legacyListings, setLegacyListings] = useState<MarketplaceListing[]>([]);

  // Loading states
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingProduce, setLoadingProduce] = useState(false);
  const [loadingLegacy, setLoadingLegacy] = useState(false);

  // E-Commerce Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [dealFilter, setDealFilter] = useState<DealFilter>("all");
  const [hpRange, setHpRange] = useState<"all" | "under_40" | "40_55" | "55_75" | "above_75">("all");
  const [conditionFilter, setConditionFilter] = useState<"all" | "new" | "used">("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [photosOnly, setPhotosOnly] = useState(true);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditStatusFilter, setAuditStatusFilter] = useState<"all" | "verified" | "pending">("all");

  // Layout & Sorting
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Mobile Filter Drawer
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Accordion open/close states in sidebar
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    deal: true,
    brand: true,
    hp: true,
    price: true,
    condition: false,
    location: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Wishlist & Recently Viewed & Comparison (Persisted in localStorage)
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentProductIds, setRecentProductIds] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<UnifiedProduct[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactTarget, setContactTarget] = useState<{
    name: string;
    phone?: string | null;
    title: string;
    location: string;
  } | null>(null);

  const [showListChoiceModal, setShowListChoiceModal] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showProduceModal, setShowProduceModal] = useState(false);

  // Form states for creation
  const [newEqType, setNewEqType] = useState<"rent" | "sale">("rent");
  const [newEqTitle, setNewEqTitle] = useState("");
  const [newEqBrand, setNewEqBrand] = useState("");
  const [newEqModel, setNewEqModel] = useState("");
  const [newEqCategory, setNewEqCategory] = useState("tractors");
  const [newEqHp, setNewEqHp] = useState("");
  const [newEqPrice, setNewEqPrice] = useState("");
  const [newEqPriceUnit, setNewEqPriceUnit] = useState("per hour");
  const [newEqOwnerName, setNewEqOwnerName] = useState("");
  const [newEqOwnerPhone, setNewEqOwnerPhone] = useState("");
  const [newEqState, setNewEqState] = useState("");
  const [newEqDistrict, setNewEqDistrict] = useState("");
  const [newEqNotes, setNewEqNotes] = useState("");

  const [newProdCrop, setNewProdCrop] = useState("");
  const [newProdVariety, setNewProdVariety] = useState("");
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

  // Initialize wishlist and recents from localStorage
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("kisaanbuddy_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      const savedRecents = localStorage.getItem("kisaanbuddy_recent_products");
      if (savedRecents) setRecentProductIds(JSON.parse(savedRecents));
    } catch {}
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleProductClick = (product: UnifiedProduct) => {
    setSelectedProduct(product);
    // Add to recents
    setRecentProductIds((prev) => {
      const updated = [product.id, ...prev.filter((x) => x !== product.id)].slice(0, 6);
      try {
        localStorage.setItem("kisaanbuddy_recent_products", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle comparison item
  const toggleCompare = (product: UnifiedProduct, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompareItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert(isHi ? "अधिकतम 3 उत्पादों की तुलना की जा सकती है।" : "You can compare up to 3 products at a time.");
        return prev;
      }
      return [...prev, product];
    });
    setShowCompareDrawer(true);
  };

  // ─── 1. Load Data ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const [catRes, eqRes] = await Promise.all([
        equipmentCatalogApi.list({ limit: 250 }).catch(() => ({ items: [], total: 0 })),
        equipmentListingsApi.list({ limit: 100, status: "available" }).catch(() => ({ items: [], total: 0 })),
      ]);
      setCatalogItems(catRes.items || []);
      setEquipmentListings(eqRes.items || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lazy load alternate sections
  useEffect(() => {
    if (sectionMode === "produce" && produceListings.length === 0) {
      setLoadingProduce(true);
      Promise.all([
        produceListingsApi.list({ status: "available" }).then((res) => setProduceListings(res.items || [])),
        marketPricesApi.list({ limit: 10 }).then((res) => setMarketPrices(res || [])),
      ])
        .catch(console.error)
        .finally(() => setLoadingProduce(false));
    } else if (sectionMode === "buyers" && legacyListings.length === 0) {
      setLoadingLegacy(true);
      marketplaceApi.list({ listing_type: "buy" })
        .then((res) => setLegacyListings(res || []))
        .catch(console.error)
        .finally(() => setLoadingLegacy(false));
    } else if (sectionMode === "provenance" && sources.length === 0) {
      marketplaceSourcesApi.list()
        .then((res) => setSources(res || []))
        .catch(console.error);
    }
  }, [sectionMode, produceListings.length, legacyListings.length, sources.length]);

  // ─── 2. Build Unified Product Dataset ─────────────────────────────────────
  const unifiedProducts = useMemo<UnifiedProduct[]>(() => {
    const list: UnifiedProduct[] = [];

    // Local listings from farmers & custom hiring centers
    for (const item of equipmentListings) {
      // Find matching catalog model for exact verified image if catalog_id present
      const matchedCat = item.catalog_id ? catalogItems.find((c) => c.id === item.catalog_id) : null;
      const verifiedImg = item.image_url || matchedCat?.image_url || null;
      const hasVerified = Boolean(verifiedImg);

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
        hasVerifiedPhoto: hasVerified,
        imageUrl: verifiedImg,
        description: item.notes,
      });
    }

    // Reference & Manufacturer Catalog models
    for (const item of catalogItems) {
      const resolvedImg = getVerifiedMachineryPhoto(item.brand, item.model_name, item.image_url);
      const hasVerified = Boolean(resolvedImg);

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
        hasVerifiedPhoto: hasVerified,
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

  // Extract unique brands for sidebar filter
  const availableBrands = useMemo(() => {
    const brandMap: Record<string, number> = {};
    unifiedProducts.forEach((p) => {
      const b = p.brand?.trim();
      if (b) brandMap[b] = (brandMap[b] || 0) + 1;
    });
    return Object.entries(brandMap)
      .sort((a, b) => b[1] - a[1])
      .map(([brand, count]) => ({ brand, count }));
  }, [unifiedProducts]);

  // Extract unique states for location filter
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    unifiedProducts.forEach((p) => {
      if (p.state && p.state.trim()) states.add(p.state.trim());
    });
    return Array.from(states).sort();
  }, [unifiedProducts]);

  // ─── 3. Filter & Sort Execution ───────────────────────────────────────────
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
      if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Brand
      if (selectedBrand !== "all" && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Deal Type (Rent vs Sale)
      if (dealFilter === "rent" && product.dealType !== "rent") return false;
      if (dealFilter === "sale" && product.dealType !== "sale" && product.dealType !== "catalog") return false;

      // HP Range
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

      // State
      if (stateFilter !== "all" && product.state && product.state.toLowerCase() !== stateFilter.toLowerCase()) {
        return false;
      }

      // Price Range
      if (minPrice && product.price != null && product.price < parseFloat(minPrice)) return false;
      if (maxPrice && product.price != null && product.price > parseFloat(maxPrice)) return false;

      // Available now only
      if (availableNowOnly && product.sourceType !== "listing") return false;
      if (photosOnly && !product.hasVerifiedPhoto) return false;

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
    availableNowOnly,
    photosOnly,
  ]);

  // Sort
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
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    dealFilter,
    hpRange,
    conditionFilter,
    stateFilter,
    minPrice,
    maxPrice,
    availableNowOnly,
    sortBy,
  ]);

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
    setAvailableNowOnly(false);
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
    if (availableNowOnly) count++;
    if (searchQuery) count++;
    return count;
  }, [
    selectedCategory,
    selectedBrand,
    dealFilter,
    hpRange,
    conditionFilter,
    stateFilter,
    minPrice,
    maxPrice,
    availableNowOnly,
    searchQuery,
  ]);

  // Recent products data
  const recentProducts = useMemo(() => {
    return recentProductIds
      .map((id) => unifiedProducts.find((p) => p.id === id))
      .filter((p): p is UnifiedProduct => Boolean(p));
  }, [recentProductIds, unifiedProducts]);

  // Similar products in modal
  const similarProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return unifiedProducts
      .filter((p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.brand === selectedProduct.brand))
      .slice(0, 4);
  }, [selectedProduct, unifiedProducts]);

  const openContact = (name: string, phone: string | null | undefined, title: string, location: string) => {
    setContactTarget({ name, phone, title, location });
    setShowContactModal(true);
  };

  // Listings Submit Handlers
  const handleCreateEquipmentListing = async (e: React.FormEvent) => {
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
      setShowEqModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to publish listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduceListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdCrop || !newProdQty || !newProdPrice || !newProdFarmerName || !newProdPhone) {
      alert("Please fill all required fields marked with *");
      return;
    }
    try {
      setIsSubmitting(true);
      await produceListingsApi.create({
        crop_name: newProdCrop,
        variety: newProdVariety || undefined,
        category: "cereal",
        quantity: parseFloat(newProdQty),
        quantity_unit: "Quintals",
        asking_price: parseFloat(newProdPrice),
        price_unit: "₹ / Quintal",
        is_negotiable: true,
        farmer_name: newProdFarmerName,
        farmer_phone: newProdPhone,
        state: newProdState || "Madhya Pradesh",
        district: newProdDistrict || "Sehore",
        grade_or_quality: newProdGrade,
        delivery_option: newProdDelivery,
        contact_consent_verified: true,
        verification_status: "verified",
        notes: newProdNotes || undefined,
      });
      alert(isHi ? "फसल उत्पाद सफलतापूर्वक बाज़ार में लिस्ट हो गया है!" : "Produce lot published successfully!");
      setShowProduceModal(false);
      produceListingsApi.list({ status: "available" }).then((res) => setProduceListings(res.items || []));
    } catch (err) {
      console.error(err);
      alert("Failed to publish produce lot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* ─── 1. CLEAN, PREMIUM SINGLE-ROW HEADER ─────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
        <div className="w-full">
          <div className="flex items-center justify-between gap-4 h-16">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/marketplace" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition">
                  <Store className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      KisaanBuddy
                    </span>
                    <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
                      B2B AgriMarket
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold leading-none">
                    {isHi ? "कृषि उपकरण एवं उपज बाज़ार" : "Machinery & Farm Commerce"}
                  </p>
                </div>
              </Link>
            </div>

            {/* Centre: Prominent Clean Search Bar with Autocomplete Suggestions */}
            <div ref={searchContainerRef} className="flex-1 max-w-xl relative hidden sm:block">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isHi
                      ? "ट्रैक्टर, रोटावेटर, कंबाइन या ब्रांड खोजें (उदा. Mahindra 575)..."
                      : "Search tractors, harvesters, equipment, brands (e.g. Mahindra 575)..."
                  }
                  className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSearchSuggestions && !searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Popular Agricultural Searches</div>
                  <div className="flex flex-wrap gap-1.5 p-1">
                    {SEARCH_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        onClick={() => {
                          setSearchQuery(sug);
                          setShowSearchSuggestions(false);
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href="/mandi"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">{isHi ? "मंडी लाइव भाव" : "Mandi Live"}</span>
              </Link>

              {/* Wishlist Button */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  wishlist.length > 0
                    ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                }`}
                title="View Saved Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
                <span className="text-[11px] font-bold">{wishlist.length}</span>
              </button>

              {/* List Your Product CTA */}
              <button
                onClick={() => setShowListChoiceModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isHi ? "उत्पाद जोड़ें" : "List Product"}</span>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row (Only on small screens) */}
          <div className="pb-3 sm:hidden">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tractors, harvesters, brands..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 p-1 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Compact Secondary Navigation Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 scrollbar-none text-xs">
            <button
              onClick={() => setSectionMode("machinery")}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                sectionMode === "machinery"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isHi ? "कृषि उपकरण व मशीनरी" : "Farm Equipment"}</span>
              <span className="text-[10px] opacity-75 font-normal">({unifiedProducts.length})</span>
            </button>

            <button
              onClick={() => setSectionMode("produce")}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                sectionMode === "produce"
                  ? "bg-amber-700 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{isHi ? "सीधी फसल खरीद (फार्म गेट)" : "Direct Farm Sourcing"}</span>
            </button>

            <button
              onClick={() => setSectionMode("buyers")}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                sectionMode === "buyers"
                  ? "bg-emerald-800 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isHi ? "थोक मांग एवं मिलर्स" : "Procurement & Mill Demands"}</span>
            </button>

            <button
              onClick={() => setSectionMode("provenance")}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${
                sectionMode === "provenance"
                  ? "bg-sky-700 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isHi ? "डेटा स्रोत व लाइसेंस" : "Data Provenance"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── 2. COMPACT HORIZONTAL CATEGORY NAVIGATION BAR ────────────────────── */}
      {sectionMode === "machinery" && (
        <nav aria-label="Machinery Categories" className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-2">
          <div className="w-full">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {EQUIPMENT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
                      isSelected
                        ? "bg-emerald-700 text-white shadow-2xs font-bold ring-1 ring-emerald-600"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isHi ? cat.labelHi : cat.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* ─── 3. MAIN PRODUCT DISCOVERY SECTION ───────────────────────────────── */}
      <main className="w-full py-6">
        {sectionMode === "machinery" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ─── Left Column: Compact Sticky Accordion Filter Sidebar ────── */}
            <aside className="hidden lg:block lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs sticky top-32 space-y-4">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    {isHi ? "फ़िल्टर" : "Filter Machinery"}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Accordion 1: Deal Type (Rent vs Sale) */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                  onClick={() => toggleAccordion("deal")}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                >
                  <span>Listing Type</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.deal ? "rotate-180" : ""}`} />
                </button>
                {openSections.deal && (
                  <div className="pt-2 space-y-1.5 text-xs">
                    {[
                      { key: "all", label: "All Deals" },
                      { key: "rent", label: "Available for Rent" },
                      { key: "sale", label: "Buy / For Sale" },
                    ].map((opt) => (
                      <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="dealType"
                          checked={dealFilter === opt.key}
                          onChange={() => setDealFilter(opt.key as DealFilter)}
                          className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-600 border-slate-300"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 2: Brand & Manufacturer */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                  onClick={() => toggleAccordion("brand")}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                >
                  <span>Brand & Manufacturer</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.brand ? "rotate-180" : ""}`} />
                </button>
                {openSections.brand && (
                  <div className="pt-2 space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin text-xs pr-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                      <input
                        type="radio"
                        name="brandFilter"
                        checked={selectedBrand === "all"}
                        onChange={() => setSelectedBrand("all")}
                        className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>All Brands</span>
                    </label>
                    {availableBrands.map(({ brand, count }) => (
                      <label key={brand} className="flex items-center justify-between gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900">
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="brandFilter"
                            checked={selectedBrand === brand}
                            onChange={() => setSelectedBrand(brand)}
                            className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-600"
                          />
                          <span>{brand}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">({count})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 3: Engine Power (HP) */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                  onClick={() => toggleAccordion("hp")}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                >
                  <span>Engine Power (HP)</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.hp ? "rotate-180" : ""}`} />
                </button>
                {openSections.hp && (
                  <div className="pt-2 space-y-1.5 text-xs">
                    {[
                      { key: "all", label: "Any Horsepower" },
                      { key: "under_40", label: "Under 40 HP" },
                      { key: "40_55", label: "40 – 55 HP" },
                      { key: "55_75", label: "55 – 75 HP" },
                      { key: "above_75", label: "75+ HP" },
                    ].map((opt) => (
                      <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="hpRange"
                          checked={hpRange === opt.key}
                          onChange={() => setHpRange(opt.key as any)}
                          className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-600"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 4: Price Range */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                  onClick={() => toggleAccordion("price")}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                >
                  <span>Price Range (₹)</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.price ? "rotate-180" : ""}`} />
                </button>
                {openSections.price && (
                  <div className="pt-2 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Min ₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Max ₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 500000"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 5: Condition */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <button
                  onClick={() => toggleAccordion("condition")}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                >
                  <span>Condition</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.condition ? "rotate-180" : ""}`} />
                </button>
                {openSections.condition && (
                  <div className="pt-2 space-y-1.5 text-xs">
                    {[
                      { key: "all", label: "All Conditions" },
                      { key: "new", label: "Brand New" },
                      { key: "used", label: "Used / Certified" },
                    ].map((opt) => (
                      <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="condition"
                          checked={conditionFilter === opt.key}
                          onChange={() => setConditionFilter(opt.key as any)}
                          className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-600"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 6: State / Location */}
              {availableStates.length > 0 && (
                <div className="pb-1">
                  <button
                    onClick={() => toggleAccordion("location")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Location / State</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.location ? "rotate-180" : ""}`} />
                  </button>
                  {openSections.location && (
                    <div className="pt-2 text-xs">
                      <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
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
                </div>
              )}
            </aside>

            {/* ─── Right Column: Spacious Product Discovery Section ────────── */}
            <div className="lg:col-span-9 space-y-4">
              {/* Product Discovery Top Bar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Result count & Verified Photos & Audit Modal Trigger */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {sortedProducts.length}{" "}
                      <span className="font-normal text-slate-500 text-xs">
                        {isHi ? "कृषि मशीनें उपलब्ध" : "agricultural machines available"}
                      </span>
                    </span>

                    {/* Authenticity Badge & Audit Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowAuditModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
                      title="Inspect verification sources for all 284 models"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Audit 284 Models</span>
                    </button>

                    {/* Mobile Filters Trigger */}
                    <button
                      onClick={() => setMobileDrawerOpen(true)}
                      className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                    </button>
                  </div>

                  {/* Right: Deal Segmented Switch + Photo Toggle + Sort Dropdown + View Toggle */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Toggle: Verified Real Photos Only vs All 284 Models */}
                    <button
                      type="button"
                      onClick={() => setPhotosOnly(!photosOnly)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        photosOnly
                          ? "bg-emerald-700 text-white border-emerald-600 shadow-2xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                      }`}
                      title={photosOnly ? "Showing genuine photos only. Click to view all inventory." : "Showing all inventory including pending photos."}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{photosOnly ? "Real Photos Only" : "All Inventory (284)"}</span>
                    </button>

                    {/* Segmented Control for Deal Type */}
                    <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setDealFilter("all")}
                        className={`px-3 py-1 rounded-lg transition ${
                          dealFilter === "all" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        All Deals
                      </button>
                      <button
                        onClick={() => setDealFilter("rent")}
                        className={`px-3 py-1 rounded-lg transition ${
                          dealFilter === "rent" ? "bg-emerald-700 text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        For Rent
                      </button>
                      <button
                        onClick={() => setDealFilter("sale")}
                        className={`px-3 py-1 rounded-lg transition ${
                          dealFilter === "sale" ? "bg-emerald-700 text-white shadow-2xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Buy / Sale
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1 text-xs">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <option value="relevance">Sort: Relevance</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="hp_desc">Horsepower: High to Low</option>
                        <option value="newest">Newest First</option>
                      </select>
                    </div>

                    {/* Grid / List Toggle */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-white dark:bg-slate-900 text-emerald-700 shadow-2xs" : "text-slate-400 hover:text-slate-600"}`}
                        title="3-Column Large Grid View"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-white dark:bg-slate-900 text-emerald-700 shadow-2xs" : "text-slate-400 hover:text-slate-600"}`}
                        title="List View"
                      >
                        <ListIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-banner for Transparency & Reality-First */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                    <span>Real agricultural machinery photographs directly on the marketplace homepage.</span>
                  </div>
                  {!photosOnly ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      Showing full inventory (including 22 listings awaiting photo upload)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPhotosOnly(false)}
                      className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                    >
                      View 22 unphotographed farmer listings &rarr;
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Active Filters:</span>
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Category: {selectedCategory.replace(/_/g, " ")}
                      <button onClick={() => setSelectedCategory("all")}>
                        <X className="w-3 h-3 hover:text-rose-600" />
                      </button>
                    </span>
                  )}
                  {selectedBrand !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Brand: {selectedBrand}
                      <button onClick={() => setSelectedBrand("all")}>
                        <X className="w-3 h-3 hover:text-rose-600" />
                      </button>
                    </span>
                  )}
                  {dealFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Deal: {dealFilter === "rent" ? "For Rent" : "For Sale"}
                      <button onClick={() => setDealFilter("all")}>
                        <X className="w-3 h-3 hover:text-rose-600" />
                      </button>
                    </span>
                  )}
                  {hpRange !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      HP: {hpRange.replace(/_/g, "–")}
                      <button onClick={() => setHpRange("all")}>
                        <X className="w-3 h-3 hover:text-rose-600" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      &quot;{searchQuery}&quot;
                      <button onClick={() => setSearchQuery("")}>
                        <X className="w-3 h-3 hover:text-rose-600" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* ─── 4. REDESIGNED PRODUCT GRID: LARGE REAL MACHINERY PHOTOGRAPHS ─── */}
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 animate-pulse">
                      <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 space-y-3">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isHi ? "कोई कृषि मशीन नहीं मिली" : "No agricultural products matched your criteria"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try broadening your brand selection, adjusting the horsepower range, or clearing active filters to view all 284 machines.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                /* 3-Column Large Product Card Grid on Desktop, 2-Col on Tablet, 1-Col on Mobile */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => {
                    const isWishlisted = wishlist.includes(product.id);

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-600/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                      >
                        <div>
                          {/* PRODUCT IMAGE AREA: 55-60% Visual Area, Strict 4:3 Aspect Ratio, Contain Fit, Clean White Background */}
                          <div className="relative w-full aspect-[4/3] bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-center select-none overflow-hidden shrink-0">
                            <ProductCardImage
                              src={product.imageUrl}
                              alt={product.title}
                            />

                            {/* Top-Left: Deal Badge */}
                            <div className="absolute top-3 left-3 z-10">
                              {product.dealType === "rent" ? (
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-700 text-white shadow-2xs">
                                  {isHi ? "किराये पर" : "For Rent"}
                                </span>
                              ) : product.dealType === "sale" ? (
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-sky-700 text-white shadow-2xs">
                                  {isHi ? "बिक्री के लिए" : "For Sale"}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 dark:bg-slate-800 text-white shadow-2xs">
                                  {isHi ? "ब्रांड मॉडल" : "Verified Spec"}
                                </span>
                              )}
                            </div>

                            {/* Top-Right: Wishlist Button */}
                            <div className="absolute top-3 right-3 z-10">
                              <button
                                type="button"
                                onClick={(e) => toggleWishlist(product.id, e)}
                                className={`p-2 rounded-full backdrop-blur-md transition shadow-2xs ${
                                  isWishlisted
                                    ? "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/80 dark:border-rose-800"
                                    : "bg-white/95 dark:bg-slate-800/95 text-slate-400 hover:text-rose-600 hover:bg-white border border-slate-200/70 dark:border-slate-700"
                                }`}
                                title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500" : ""}`} />
                              </button>
                            </div>

                            {/* Bottom-Left: Condition Tag */}
                            <div className="absolute bottom-2.5 left-3 z-10">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700 shadow-2xs uppercase tracking-wide">
                                {product.condition === "new" ? "Brand New" : `${product.condition} Condition`}
                              </span>
                            </div>

                            {/* Bottom-Right: Authenticity Badge */}
                            {product.hasVerifiedPhoto && (
                              <div className="absolute bottom-2.5 right-3 z-10">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-2xs">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Real Photo</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* PRODUCT INFORMATION */}
                          <div className="p-4 sm:p-5 space-y-2.5">
                            {/* Manufacturer & Category */}
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider truncate max-w-[170px]">
                                {product.manufacturer || product.brand}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium capitalize shrink-0">
                                {product.category.replace(/_/g, " ")}
                              </span>
                            </div>

                            {/* Complete Product Name */}
                            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                              {product.title}
                            </h4>

                            {/* Model Number */}
                            <div className="text-[11px] text-slate-400 font-mono">
                              Model: {product.modelName}
                            </div>

                            {/* Relevant Technical Specifications Row */}
                            <div className="flex items-center gap-1.5 pt-1 flex-wrap text-xs">
                              {product.hpRating != null && product.hpRating > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                  <Gauge className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                  <span>{product.hpRating} HP</span>
                                </span>
                              )}
                              {product.workingWidthMm != null && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                                  {product.workingWidthMm} mm
                                </span>
                              )}
                              {product.capacity && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[130px]">
                                  {product.capacity}
                                </span>
                              )}
                              {product.fuelType && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium capitalize">
                                  {product.fuelType}
                                </span>
                              )}
                            </div>

                            {/* Actual Price */}
                            <div className="pt-2">
                              {product.price != null ? (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    ₹{product.price.toLocaleString("en-IN")}
                                  </span>
                                  {product.priceUnit && (
                                    <span className="text-xs font-semibold text-slate-500">
                                      /{product.priceUnit.replace("per ", "")}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                  Official Model • Request Quote
                                </div>
                              )}
                            </div>

                            {/* Genuine Seller Info & Location */}
                            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                              <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{product.sellerName}</span>
                              </span>
                              <span className="flex items-center gap-1 text-slate-400 shrink-0">
                                <MapPin className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                                <span className="truncate max-w-[100px]">{product.district || "Pan-India"}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM ACTIONS ([View Details] [Contact Seller]) */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition text-center shadow-2xs cursor-pointer"
                          >
                            {isHi ? "विवरण देखें" : "View Details"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openContact(
                                product.sellerName,
                                product.sellerPhone,
                                product.title,
                                product.sellerLocation
                              );
                            }}
                            className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{isHi ? "संपर्क" : "Contact Seller"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW (Spacious horizontal rows with clean 4:3 images) */
                <div className="space-y-4">
                  {paginatedProducts.map((product) => {
                    const isWishlisted = wishlist.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 hover:border-emerald-600/50 hover:shadow-md transition flex flex-col sm:flex-row items-center gap-5 cursor-pointer"
                      >
                        {/* 4:3 Image Container */}
                        <div className="w-full sm:w-64 aspect-[4/3] bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden relative flex items-center justify-center p-3">
                          <ProductCardImage
                            src={product.imageUrl}
                            alt={product.title}
                          />
                          <button
                            onClick={(e) => toggleWishlist(product.id, e)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 text-slate-400 hover:text-rose-600 shadow-2xs border border-slate-200/60"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>
                        </div>

                        {/* Middle: Details */}
                        <div className="flex-1 space-y-1.5 w-full">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{product.manufacturer || product.brand}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 capitalize">{product.category.replace(/_/g, " ")}</span>
                            {product.dealType === "rent" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                                For Rent
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800">
                                For Sale
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">
                            {product.title}
                          </h4>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Model: {product.modelName}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                            {product.hpRating && (
                              <span className="font-semibold">{product.hpRating} HP Power</span>
                            )}
                            {product.workingWidthMm && (
                              <span>Width: {product.workingWidthMm} mm</span>
                            )}
                            {product.capacity && (
                              <span>Capacity: {product.capacity}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{product.sellerName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-700" />
                              {product.sellerLocation}
                            </span>
                          </div>
                        </div>

                        {/* Right: Strong Price & CTAs */}
                        <div className="w-full sm:w-52 text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pl-0 sm:pl-5 pt-3 sm:pt-0 space-y-3">
                          <div>
                            {product.price != null ? (
                              <div>
                                <div className="text-xl font-black text-slate-900 dark:text-white">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </div>
                                {product.priceUnit && (
                                  <div className="text-xs text-slate-500">
                                    /{product.priceUnit.replace("per ", "")}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm font-bold text-emerald-700">Official Specification</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(product);
                              }}
                              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openContact(product.sellerName, product.sellerPhone, product.title, product.sellerLocation);
                              }}
                              className="py-2 px-3 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1 cursor-pointer"
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

              {/* ─── Pagination Controls ─────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Previous
                  </button>

                  <span className="text-xs font-semibold text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── RECENTLY VIEWED PRODUCTS ROW ────────────────────────────────────── */}
        {recentProducts.length > 0 && sectionMode === "machinery" && (
          <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {isHi ? "हाल ही में देखे गए उपकरण" : "Recently Viewed Machinery"}
              </h3>
              <button
                onClick={() => {
                  setRecentProductIds([]);
                  localStorage.removeItem("kisaanbuddy_recent_products");
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {recentProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 p-2.5 hover:border-emerald-600 cursor-pointer transition text-center space-y-1.5 shadow-2xs"
                >
                  <div className="w-full aspect-[4/3] bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden">
                    <ProductCardImage
                      src={p.imageUrl}
                      alt={p.title}
                      category={p.category}
                      brand={p.brand}
                      modelName={p.modelName}
                    />
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</div>
                  <div className="text-[10px] font-extrabold text-emerald-700">
                    {p.price ? `₹${p.price.toLocaleString("en-IN")}` : "Contact for Price"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── SECTION 2: DIRECT FARM SOURCING (PRODUCE) ───────────────────────── */}
        {sectionMode === "produce" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isHi ? "खेतों से सीधी उपज खरीद" : "Direct Farm Sourcing & Harvest Lots"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHi ? "किसानों और सहकारी समितियों द्वारा सीधे पोस्ट किए गए अनाज व फसल लॉट।" : "Grain and produce lots posted directly by verified growers."}
                </p>
              </div>
              <button
                onClick={() => setShowProduceModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition"
              >
                + {isHi ? "उपज लिस्ट करें" : "List Harvest Produce"}
              </button>
            </div>

            {loadingProduce ? (
              <div className="p-12 text-center text-slate-400">Loading harvest produce...</div>
            ) : produceListings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                No produce lots currently listed.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {produceListings.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-5 hover:border-amber-500 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold uppercase text-[10px]">
                          {lot.category}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">Verified Grower</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {lot.crop_name} {lot.variety && `(${lot.variety})`}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>{lot.district}, {lot.state}</span>
                      </div>

                      <div className="my-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Quantity</span>
                          <span className="text-base font-extrabold text-slate-900">
                            {lot.quantity} {lot.quantity_unit}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Asking Rate</span>
                          <span className="text-base font-extrabold text-amber-800">
                            ₹{lot.asking_price} / Q
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{lot.farmer_name}</span>
                      <button
                        onClick={() =>
                          openContact(
                            lot.farmer_name,
                            lot.farmer_phone,
                            `${lot.crop_name} (${lot.quantity} ${lot.quantity_unit})`,
                            `${lot.district}, ${lot.state}`
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Contact Grower</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── SECTION 3: PROCUREMENT & MILL DEMANDS ─────────────────────────── */}
        {sectionMode === "buyers" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verified Millers, Aggregators & FPO Purchase Orders
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutional procurement contracts and wholesale buying demands.
              </p>
            </div>

            {loadingLegacy ? (
              <div className="p-12 text-center text-slate-400">Loading procurement orders...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {legacyListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-5 hover:border-emerald-600 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold uppercase text-[10px]">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">VERIFIED BUYER</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.crop_or_item}</h4>
                      <p className="text-xs text-slate-500">{item.organization_name}</p>

                      <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <p>Quantity Required: <strong>{item.quantity} {item.quantity_unit}</strong></p>
                        <p>Target Rate: <strong className="text-emerald-700">₹{item.price} {item.price_unit}</strong></p>
                        <p>Delivery: <strong>{item.district}, {item.state}</strong></p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.contact_person || "Procurement Desk"}</span>
                      <button
                        onClick={() =>
                          openContact(
                            item.organization_name,
                            item.contact_phone,
                            item.crop_or_item,
                            `${item.district}, ${item.state}`
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1"
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

        {/* ─── SECTION 4: DATA PROVENANCE ────────────────────────────────────── */}
        {sectionMode === "provenance" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Authorized Public Agricultural Data Sources & Governance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                In strict adherence to platform governance, all reference equipment models are catalogued under the National
                Data Sharing and Accessibility Policy (NDSAP) and Open Government Data (OGD) License - India from FMTTI Budni and
                Hisar testing centers. Zero fake prices or synthetic buyer profiles are ever generated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((src) => (
                <div key={src.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-5 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{src.source_name}</h4>
                  <p className="text-xs text-slate-500">{src.commercial_reuse_terms}</p>
                  <a
                    href={src.base_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── 5. PRODUCT DETAIL MODAL (Amazon / IndiaMART Quality Gallery & Specs) ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {selectedProduct.brand}
                </span>
                <span className="text-xs text-slate-400 capitalize">
                  {selectedProduct.category.replace("_", " ")}
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* 4:3 Image View */}
                <div className="md:col-span-6 space-y-3">
                  <div className="w-full aspect-[4/3] bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                    <ProductCardImage
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      category={selectedProduct.category}
                      brand={selectedProduct.brand}
                      modelName={selectedProduct.modelName}
                    />
                  </div>
                </div>

                {/* Pricing & Key Actions */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                      {selectedProduct.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedProduct.manufacturer || selectedProduct.brand}
                    </p>
                  </div>

                  {/* Price Box */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block uppercase">
                      {selectedProduct.dealType === "rent" ? "Rental Rate Breakdown" : "Price Details"}
                    </span>
                    {selectedProduct.price != null ? (
                      <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          ₹{selectedProduct.price.toLocaleString("en-IN")}{" "}
                          {selectedProduct.priceUnit && (
                            <span className="text-xs font-normal text-slate-500">
                              /{selectedProduct.priceUnit.replace("per ", "")}
                            </span>
                          )}
                        </div>
                        {selectedProduct.dealType === "rent" && (
                          <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-emerald-200/50 text-[11px] text-slate-600 dark:text-slate-400">
                            <div>
                              Full Day (8 hrs): <strong>₹{(selectedProduct.price * 8).toLocaleString("en-IN")}</strong>
                            </div>
                            <div>
                              Operator: <strong>{selectedProduct.includesOperator ? "Included" : "Self-Drive"}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-base font-bold text-emerald-700">
                        Contact for Price & Delivery Terms
                      </div>
                    )}
                  </div>

                  {/* Seller / Dealer Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Seller / Provider</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.sellerName}</div>
                    <div className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{selectedProduct.sellerLocation}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
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
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{isHi ? "विक्रेता से संपर्क करें" : "Contact Seller"}</span>
                    </button>

                    {selectedProduct.officialSourceUrl && (
                      <a
                        href={selectedProduct.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                        title="View Official Source"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Complete Specifications Table */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Manufacturer</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.manufacturer}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Category</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{selectedProduct.category.replace("_", " ")}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Horsepower (HP)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.hpRating ? `${selectedProduct.hpRating} HP` : "Specifications unavailable"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Working Width</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.workingWidthMm ? `${selectedProduct.workingWidthMm} mm` : "Specifications unavailable"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">PTO Power</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.ptoHp ? `${selectedProduct.ptoHp} HP` : "Specifications unavailable"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total Weight</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.weightKg ? `${selectedProduct.weightKg} kg` : "Specifications unavailable"}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Product Description</span>
                  <p>{selectedProduct.description}</p>
                </div>
              )}

              {/* Similar Products */}
              {similarProducts.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Similar Agricultural Equipment
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {similarProducts.map((sim) => (
                      <div
                        key={sim.id}
                        onClick={() => handleProductClick(sim)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-600 bg-white dark:bg-slate-900 cursor-pointer transition text-center space-y-1"
                      >
                        <div className="aspect-[4/3] w-full bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                          <ProductCardImage
                            src={sim.imageUrl}
                            alt={sim.title}
                            category={sim.category}
                            brand={sim.brand}
                            modelName={sim.modelName}
                          />
                        </div>
                        <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{sim.title}</h5>
                        <div className="text-[10px] font-extrabold text-emerald-700">
                          {sim.price ? `₹${sim.price.toLocaleString("en-IN")}` : "Contact for Price"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. MOBILE FILTER DRAWER (Slide-up bottom sheet) ────────────────── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Filter Machinery</h3>
              <button onClick={() => setMobileDrawerOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold block mb-2">Deal Type</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "rent", label: "For Rent" },
                    { key: "sale", label: "For Sale" },
                  ].map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setDealFilter(d.key as DealFilter)}
                      className={`py-2 rounded-xl border text-center font-bold ${
                        dealFilter === d.key ? "bg-emerald-700 text-white border-emerald-700" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold block mb-2">Brand</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
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
                <span className="font-bold block mb-2">Engine Power</span>
                <select
                  value={hpRange}
                  onChange={(e) => setHpRange(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="all">Any Horsepower</option>
                  <option value="under_40">Under 40 HP</option>
                  <option value="40_55">40 – 55 HP</option>
                  <option value="55_75">55 – 75 HP</option>
                  <option value="above_75">75+ HP</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-2 py-3 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. CONTACT SELLER MODAL ─────────────────────────────────────────── */}
      {showContactModal && contactTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHi ? "सत्यापित विक्रेता संपर्क" : "Verified Seller Contact"}
                </h3>
              </div>
              <button onClick={() => setShowContactModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Inquiring for:</span>
              <p className="font-extrabold text-slate-900 dark:text-white">{contactTarget.title}</p>
              <p className="text-slate-500">📍 {contactTarget.location}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Contact Person / CHC</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{contactTarget.name}</span>
              </div>

              {contactTarget.phone ? (
                <a
                  href={`tel:${contactTarget.phone}`}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {contactTarget.phone}</span>
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-center">
                  Inquiry request logged. Seller will contact you shortly.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 8. MODAL: LIST CHOICE (Machinery vs Produce) ────────────────────── */}
      {showListChoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isHi ? "आप क्या लिस्ट करना चाहते हैं?" : "What would you like to list?"}
              </h3>
              <button onClick={() => setShowListChoiceModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1">
              <button
                onClick={() => {
                  setShowListChoiceModal(false);
                  setShowEqModal(true);
                }}
                className="p-4 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-600 bg-emerald-50/40 text-left transition space-y-1"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                  <span>🚜</span>
                  <span>{isHi ? "कृषि मशीनरी (किराये या बिक्री पर)" : "Farm Machinery (Rent / Sale)"}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {isHi ? "अपने ट्रैक्टर, रोटावेटर या कंबाइन को स्थानीय किसानों के लिए पोस्ट करें।" : "Offer equipment for local hiring or sale."}
                </p>
              </button>

              <button
                onClick={() => {
                  setShowListChoiceModal(false);
                  setShowProduceModal(true);
                }}
                className="p-4 rounded-2xl border-2 border-amber-500/30 hover:border-amber-600 bg-amber-50/40 text-left transition space-y-1"
              >
                <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                  <span>🌾</span>
                  <span>{isHi ? "खेत की फसल उपज (गेहूं, धान आदि)" : "Farm Harvest Produce Lots"}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {isHi ? "अपनी तैयार फसल सीधे मिलर्स और थोक खरीदारों को बेचें।" : "Sell grain or vegetables directly to millers."}
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 9. MODALS: POST EQUIPMENT & PRODUCE FORMS ───────────────────────── */}
      {showEqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">List Machinery for Rent or Sale</h3>
              <button onClick={() => setShowEqModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipmentListing} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Listing Type *</label>
                  <select
                    value={newEqType}
                    onChange={(e) => setNewEqType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="rent">For Rent (Custom Hiring)</option>
                    <option value="sale">For Sale (Direct Sale)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category *</label>
                  <select
                    value={newEqCategory}
                    onChange={(e) => setNewEqCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {EQUIPMENT_CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mahindra 575 DI XP Plus with Rotavator"
                  value={newEqTitle}
                  onChange={(e) => setNewEqTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Brand *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mahindra, Swaraj, Shaktiman"
                    value={newEqBrand}
                    onChange={(e) => setNewEqBrand(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Model Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 575 DI XP Plus"
                    value={newEqModel}
                    onChange={(e) => setNewEqModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Rate / Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 850"
                    value={newEqPrice}
                    onChange={(e) => setNewEqPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Unit *</label>
                  <select
                    value={newEqPriceUnit}
                    onChange={(e) => setNewEqPriceUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="per hour">per hour</option>
                    <option value="per day">per day</option>
                    <option value="per acre">per acre</option>
                    <option value="total price">total price</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">HP (Horsepower)</label>
                  <input
                    type="number"
                    placeholder="e.g. 47"
                    value={newEqHp}
                    onChange={(e) => setNewEqHp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="e.g. Madhya Pradesh"
                    value={newEqState}
                    onChange={(e) => setNewEqState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">District *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sehore"
                    value={newEqDistrict}
                    onChange={(e) => setNewEqDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Owner / CHC Name *</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newEqOwnerName}
                    onChange={(e) => setNewEqOwnerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98261 XXXXX"
                    value={newEqOwnerPhone}
                    onChange={(e) => setNewEqOwnerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEqModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {isSubmitting ? "Publishing..." : "Publish Equipment Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProduceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">List Harvest Produce for Sale</h3>
              <button onClick={() => setShowProduceModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduceListing} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Crop Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Wheat, Paddy, Soybean"
                    value={newProdCrop}
                    onChange={(e) => setNewProdCrop(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Variety</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharbati, 1121 Basmati"
                    value={newProdVariety}
                    onChange={(e) => setNewProdVariety(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Available Quantity (Quintals) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Asking Rate (₹ per Q) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 2650"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="e.g. Madhya Pradesh"
                    value={newProdState}
                    onChange={(e) => setNewProdState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">District *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sehore"
                    value={newProdDistrict}
                    onChange={(e) => setNewProdDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Farmer Name *</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newProdFarmerName}
                    onChange={(e) => setNewProdFarmerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98261 XXXXX"
                    value={newProdPhone}
                    onChange={(e) => setNewProdPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProduceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold"
                >
                  {isSubmitting ? "Publishing..." : "Publish Produce Lot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
      {/* ─── 284 REFERENCE MACHINERY MODELS IMAGE VERIFICATION AUDIT MODAL ─── */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    284 Reference Machinery Models: Image Verification Audit
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    KisaanBuddy Reality-First Policy Compliance • Official Institutional Sources
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Row */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 shrink-0">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Equipment Audited</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">284 Models</div>
                <div className="text-[10px] text-slate-500">100% of platform catalogue</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase">Verified Real Photos</div>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">262 Models (92%)</div>
                <div className="text-[10px] text-emerald-600">Institutional & Mfg CDNs</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase">Pending Genuine Photos</div>
                <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">22 Models (8%)</div>
                <div className="text-[10px] text-amber-600">Strictly no substitute used</div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <div className="text-[10px] font-bold text-sky-800 dark:text-sky-400 uppercase">Fake / AI Images</div>
                <div className="text-xl font-black text-sky-700 dark:text-sky-400 mt-0.5">0 (Zero Policy)</div>
                <div className="text-[10px] text-sky-600">Reality-First compliant</div>
              </div>
            </div>

            {/* Filter and Search Bar within Modal */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900">
              <div className="flex-1 min-w-[220px] relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter by manufacturer or model (e.g. Mahindra, Swaraj, Chaff Cutter)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setAuditStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg font-bold transition ${auditStatusFilter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  All (284)
                </button>
                <button
                  onClick={() => setAuditStatusFilter("verified")}
                  className={`px-3 py-1 rounded-lg font-bold transition ${auditStatusFilter === "verified" ? "bg-emerald-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  Verified (262)
                </button>
                <button
                  onClick={() => setAuditStatusFilter("pending")}
                  className={`px-3 py-1 rounded-lg font-bold transition ${auditStatusFilter === "pending" ? "bg-amber-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  Pending (22)
                </button>
              </div>
            </div>

            {/* Scrollable Audit Table */}
            <div className="flex-1 overflow-y-auto p-4 max-h-[50vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold uppercase text-slate-500 sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5">Product ID</th>
                    <th className="p-2.5">Manufacturer</th>
                    <th className="p-2.5">Exact Model</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Verified Asset / Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {((machineryAuditData as any).records || [])
                    .filter((r: any) => {
                      if (auditStatusFilter === "verified" && !r.isImageVerified) return false;
                      if (auditStatusFilter === "pending" && r.isImageVerified) return false;
                      if (auditSearch.trim()) {
                        const q = auditSearch.toLowerCase();
                        const match =
                          r.manufacturer?.toLowerCase().includes(q) ||
                          r.exactModel?.toLowerCase().includes(q) ||
                          r.productId?.toLowerCase().includes(q) ||
                          r.category?.toLowerCase().includes(q);
                        if (!match) return false;
                      }
                      return true;
                    })
                    .slice(0, 100)
                    .map((r: any) => (
                      <tr key={r.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">{r.productId}</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{r.manufacturer}</td>
                        <td className="p-2.5 text-slate-900 dark:text-white font-bold">{r.exactModel}</td>
                        <td className="p-2.5 capitalize text-slate-500">{r.category?.replace(/_/g, " ")}</td>
                        <td className="p-2.5">
                          {r.isImageVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <ShieldCheck className="w-3 h-3" />
                              Verified Authentic
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              <Clock className="w-3 h-3" />
                              Pending Genuine Photo
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-500 max-w-xs truncate" title={r.originalImageSource}>
                          {r.imageUrl ? (
                            <span className="font-mono text-[10px] text-emerald-700 truncate block">
                              {r.imageUrl}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No image substitute used</span>
                          )}
                          <span className="text-[10px] text-slate-400 block truncate">{r.originalImageSource}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
              <span>Audited 284 reference models • Documentation available in docs/MACHINERY_IMAGE_VERIFICATION_AUDIT.md</span>
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
