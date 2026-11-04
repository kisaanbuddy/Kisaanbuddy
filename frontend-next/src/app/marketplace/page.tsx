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
  Heart,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Fuel,
  Share2,
  ChevronLeft,
  ChevronsUpDown,
  Star,
  BadgeCheck,
  Clock,
  User,
  Eye,
  Sliders,
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

type MainSectionMode = "machinery" | "produce" | "buyers" | "provenance";
type DealFilter = "all" | "rent" | "sale" | "catalog";
type SortOption = "relevance" | "price_asc" | "price_desc" | "hp_desc" | "newest";

// Canonical category definitions with rich metadata
const EQUIPMENT_CATEGORIES = [
  { key: "all", labelEn: "All Products", labelHi: "सभी उत्पाद", icon: "🌾", count: 284 },
  { key: "tractors", labelEn: "Tractors", labelHi: "ट्रैक्टर", icon: "🚜", count: 18 },
  { key: "harvesters", labelEn: "Harvesters", labelHi: "कंबाइन हार्वेस्टर", icon: "🌾", count: 17 },
  { key: "rotavators", labelEn: "Rotavators", labelHi: "रोटावेटर", icon: "⚙️", count: 12 },
  { key: "seed_drills", labelEn: "Seed Drills", labelHi: "सीड ड्रिल / बुवाई", icon: "🌱", count: 27 },
  { key: "cultivators", labelEn: "Cultivators", labelHi: "कल्टीवेटर", icon: "⛏️", count: 38 },
  { key: "ploughs", labelEn: "Ploughs", labelHi: "हल / प्लाउ", icon: "🗡️", count: 6 },
  { key: "sprayers", labelEn: "Sprayers", labelHi: "स्प्रेयर / छिड़काव", icon: "💦", count: 66 },
  { key: "threshers", labelEn: "Threshers", labelHi: "थ्रेशर", icon: "🌀", count: 21 },
  { key: "agricultural_trailers", labelEn: "Trailers & Trolleys", labelHi: "ट्रेलर व ट्रॉली", icon: "🚛", count: 11 },
  { key: "irrigation_equipment", labelEn: "Irrigation & Pumps", labelHi: "सिंचाई उपकरण", icon: "💧", count: 15 },
  { key: "other_implements", labelEn: "Other Equipment", labelHi: "अन्य कृषि उपकरण", icon: "🛠️", count: 58 },
];

// Verified fallback image mapping to authentic local image assets
const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  tractors: "/images/marketplace/tractors/mahindra-575.webp",
  harvesters: "/images/marketplace/harvesters/dasmesh-9100.png",
  rotavators: "/images/marketplace/implements/shaktiman-rotavator.png",
  seed_drills: "/images/marketplace/implements/roto-seed-drill.png",
  cultivators: "/images/marketplace/implements/cultivator.png",
  ploughs: "/images/marketplace/implements/lemken-plough.png",
  sprayers: "/images/marketplace/implements/boom-sprayer.png",
  threshers: "/images/marketplace/implements/thresher.png",
  agricultural_trailers: "/images/marketplace/implements/farm-trailer.png",
  irrigation_equipment: "/images/marketplace/implements/diesel-pump.jpg",
  other_implements: "/images/marketplace/implements/round-baler.png",
};

// Brand-specific verified images
const BRAND_IMAGE_MAP: Record<string, string> = {
  mahindra: "/images/marketplace/tractors/mahindra-575.webp",
  swaraj: "/images/marketplace/tractors/swaraj-744.png",
  sonalika: "/images/marketplace/tractors/sonalika-745.png",
  tafe: "/images/marketplace/tractors/tafe-241.jpg",
  "john deere": "/images/marketplace/tractors/john-deere-5310.png",
  dasmesh: "/images/marketplace/harvesters/dasmesh-9100.png",
  preet: "/images/marketplace/harvesters/preet-987.png",
  shaktiman: "/images/marketplace/implements/shaktiman-rotavator.png",
  fieldking: "/images/marketplace/implements/fieldking-rotavator.png",
  lemken: "/images/marketplace/implements/lemken-plough.png",
  maschio: "/images/marketplace/implements/maschio-virat.png",
};

// Unified product representation for e-commerce catalog
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
  imageUrl?: string | null;
  officialSourceUrl?: string | null;
  supplierName?: string | null;
  description?: string | null;
  provenanceSource?: string | null;
  provenanceLicense?: string | null;
}

// Resilient Product Image Component with Multi-Level Fallback & Zero Layout Shift
function ProductImage({
  src,
  alt,
  category,
  brand,
  className = "",
}: {
  src?: string | null;
  alt: string;
  category: string;
  brand: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (src && src.startsWith("http")) {
      return `/api/marketplace/image-proxy?url=${encodeURIComponent(src)}`;
    }
    if (src && src.trim()) return src;
    const brandKey = brand?.toLowerCase().trim() || "";
    if (BRAND_IMAGE_MAP[brandKey]) return BRAND_IMAGE_MAP[brandKey];
    return CATEGORY_IMAGE_FALLBACKS[category] || "/images/marketplace/implements/shaktiman-rotavator.png";
  });
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (src && src.startsWith("http")) {
      setCurrentSrc(`/api/marketplace/image-proxy?url=${encodeURIComponent(src)}`);
    } else if (src && src.trim()) {
      setCurrentSrc(src);
    } else {
      const brandKey = brand?.toLowerCase().trim() || "";
      setCurrentSrc(BRAND_IMAGE_MAP[brandKey] || CATEGORY_IMAGE_FALLBACKS[category] || "/images/marketplace/implements/shaktiman-rotavator.png");
    }
    setHasFailed(false);
  }, [src, category, brand]);

  const handleImageError = () => {
    if (currentSrc.startsWith("/api/marketplace/image-proxy") && src?.startsWith("http")) {
      // Try direct URL if proxy failed
      setCurrentSrc(src);
    } else {
      const fallback = BRAND_IMAGE_MAP[brand?.toLowerCase().trim()] || CATEGORY_IMAGE_FALLBACKS[category];
      if (fallback && currentSrc !== fallback) {
        setCurrentSrc(fallback);
      } else {
        setHasFailed(true);
      }
    }
  };

  if (hasFailed) {
    const icon = EQUIPMENT_CATEGORIES.find((c) => c.key === category)?.icon || "🌾";
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-muted/30 p-4 text-center ${className}`}>
        <span className="text-4xl mb-1 select-none filter drop-shadow-xs">{icon}</span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{brand}</span>
        <span className="text-[10px] text-slate-500 capitalize">{category.replace("_", " ")}</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105 ${className}`}
      loading="lazy"
      onError={handleImageError}
    />
  );
}

export default function MarketplacePage() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";
  const dict = MARKETPLACE_I18N[(lang as Lang) || "en"] || MARKETPLACE_I18N.en;

  // Primary Section Navigation (Machinery is primary default)
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
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadingLegacy, setLoadingLegacy] = useState(false);

  // E-Commerce Product Discovery & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [dealFilter, setDealFilter] = useState<DealFilter>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [minHp, setMinHp] = useState<string>("");
  const [maxHp, setMaxHp] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const pageSize = 24;

  // Wishlist persisted in localStorage
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Detailed Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null);

  // Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactTarget, setContactTarget] = useState<{
    name: string;
    phone?: string | null;
    title: string;
    location: string;
    type: "equipment" | "produce";
  } | null>(null);

  // Listing creation modals
  const [showEqModal, setShowEqModal] = useState(false);
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [showListChoiceModal, setShowListChoiceModal] = useState(false);

  // Produce Filters
  const [produceCropFilter, setProduceCropFilter] = useState("all");
  const [produceStateFilter, setProduceStateFilter] = useState("all");
  const [produceDistrictFilter, setProduceDistrictFilter] = useState("");
  const [produceMinQty, setProduceMinQty] = useState("");

  // Form states
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

  // Initialize wishlist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kisaanbuddy_marketplace_wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("kisaanbuddy_marketplace_wishlist", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // URL query parameter synchronization
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const cat = searchParams.get("category");
    const q = searchParams.get("q") || searchParams.get("search");
    const sec = searchParams.get("section") || searchParams.get("tab");
    const deal = searchParams.get("deal");

    if (cat) setSelectedCategory(cat.toLowerCase());
    if (q) setSearchQuery(q);
    if (deal === "rent" || deal === "sale") setDealFilter(deal);
    if (sec === "produce" || sec === "source_farms") setSectionMode("produce");
    if (sec === "buyers" || sec === "legacy_buyers") setSectionMode("buyers");
    if (sec === "provenance") setSectionMode("provenance");
  }, []);

  // ─── 1. Load All Marketplace Data ──────────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const [catRes, eqRes] = await Promise.all([
        equipmentCatalogApi.list({ limit: 250 }).catch(() => ({ items: [], total: 0 })),
        equipmentListingsApi.list({ limit: 100, status: "available" }).catch(() => ({ items: [], total: 0 })),
      ]);
      setCatalogItems(catRes.items || []);
      setEquipmentListings(eqRes.items || []);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load secondary sections lazily
  useEffect(() => {
    if (sectionMode === "produce" && produceListings.length === 0) {
      setLoadingProduce(true);
      produceListingsApi.list({ status: "available" })
        .then((res) => setProduceListings(res.items || []))
        .catch(console.error)
        .finally(() => setLoadingProduce(false));

      setLoadingPrices(true);
      marketPricesApi.list({ limit: 10 })
        .then((res) => setMarketPrices(res || []))
        .catch(console.error)
        .finally(() => setLoadingPrices(false));
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

    // First: Active farmer / CHC listings for Rent & Sale (Highest local relevance)
    for (const item of equipmentListings) {
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
        imageUrl: BRAND_IMAGE_MAP[item.brand?.toLowerCase()] || CATEGORY_IMAGE_FALLBACKS[item.category],
        description: item.notes,
      });
    }

    // Second: 242 Reference models from FMTTI and MachinePoint Catalog
    for (const item of catalogItems) {
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
        sellerName: item.supplier_name || "Official Equipment Manufacturer",
        sellerLocation: "Authorized Dealers / Pan-India",
        isVerified: item.is_verified ?? true,
        imageUrl: item.image_url,
        officialSourceUrl: item.official_source_url,
        supplierName: item.supplier_name,
        description: item.description,
        provenanceSource: item.provenance_source,
        provenanceLicense: item.provenance_license,
      });
    }

    return list;
  }, [equipmentListings, catalogItems]);

  // Extract unique brands for filter
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    unifiedProducts.forEach((p) => {
      if (p.brand && p.brand.trim()) brandsSet.add(p.brand.trim());
    });
    return Array.from(brandsSet).sort();
  }, [unifiedProducts]);

  // Extract unique states for filter
  const availableStates = useMemo(() => {
    const statesSet = new Set<string>();
    unifiedProducts.forEach((p) => {
      if (p.state && p.state.trim()) statesSet.add(p.state.trim());
    });
    return Array.from(statesSet).sort();
  }, [unifiedProducts]);

  // ─── 3. Filter and Sort Logic ──────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return unifiedProducts.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = product.title.toLowerCase().includes(q);
        const matchBrand = product.brand.toLowerCase().includes(q);
        const matchModel = product.modelName.toLowerCase().includes(q);
        const matchCat = product.category.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        const matchSeller = product.sellerName.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchModel && !matchCat && !matchDesc && !matchSeller) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== "all") {
        if (product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Brand
      if (selectedBrand !== "all") {
        if (product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      // 4. Deal Type (Rent vs Sale vs Catalog)
      if (dealFilter !== "all") {
        if (dealFilter === "rent" && product.dealType !== "rent") return false;
        if (dealFilter === "sale" && product.dealType !== "sale" && product.dealType !== "catalog") return false;
        if (dealFilter === "catalog" && product.sourceType !== "catalog") return false;
      }

      // 5. Condition
      if (conditionFilter !== "all") {
        if (conditionFilter === "new" && product.condition !== "new") return false;
        if (conditionFilter === "used" && product.condition === "new") return false;
      }

      // 6. State
      if (stateFilter !== "all") {
        if (product.state && product.state.toLowerCase() !== stateFilter.toLowerCase()) {
          return false;
        }
      }

      // 7. Horsepower (HP) Range
      if (minHp && product.hpRating != null && product.hpRating < parseFloat(minHp)) {
        return false;
      }
      if (maxHp && product.hpRating != null && product.hpRating > parseFloat(maxHp)) {
        return false;
      }

      // 8. Price Range
      if (minPrice && product.price != null && product.price < parseFloat(minPrice)) {
        return false;
      }
      if (maxPrice && product.price != null && product.price > parseFloat(maxPrice)) {
        return false;
      }

      return true;
    });
  }, [
    unifiedProducts,
    searchQuery,
    selectedCategory,
    selectedBrand,
    dealFilter,
    conditionFilter,
    stateFilter,
    minHp,
    maxHp,
    minPrice,
    maxPrice,
  ]);

  // Sorted Products
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
        // Listings with prices & photos first, then verified catalog items
        return list.sort((a, b) => {
          if (a.sourceType === "listing" && b.sourceType !== "listing") return -1;
          if (b.sourceType === "listing" && a.sourceType !== "listing") return 1;
          if (a.price && !b.price) return -1;
          if (b.price && !a.price) return 1;
          return a.title.localeCompare(b.title);
        });
    }
  }, [filteredProducts, sortBy]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    dealFilter,
    conditionFilter,
    stateFilter,
    minHp,
    maxHp,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setDealFilter("all");
    setConditionFilter("all");
    setStateFilter("all");
    setMinHp("");
    setMaxHp("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory !== "all" ||
    selectedBrand !== "all" ||
    dealFilter !== "all" ||
    conditionFilter !== "all" ||
    stateFilter !== "all" ||
    minHp ||
    maxHp ||
    minPrice ||
    maxPrice
  );

  // Contact Drawer / Modal Trigger
  const openContact = (
    name: string,
    phone: string | null | undefined,
    title: string,
    location: string,
    type: "equipment" | "produce"
  ) => {
    setContactTarget({ name, phone, title, location, type });
    setShowContactModal(true);
  };

  // Find similar products for modal
  const similarProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return unifiedProducts
      .filter((p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.brand === selectedProduct.brand))
      .slice(0, 4);
  }, [selectedProduct, unifiedProducts]);

  // Equipment Listing Submit Handler
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
      alert(isHi ? "आपकी मशीन लिस्टिंग सफलतापूर्वक पोस्ट हो गई है!" : "Equipment listing published successfully!");
      setShowEqModal(false);
      loadInitialData();
    } catch (err) {
      console.error(err);
      alert("Failed to publish listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Produce Listing Submit Handler
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
      alert("Failed to publish produce lot. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background text-foreground antialiased">
      {/* ─── 1. MODERN E-COMMERCE HEADER (Amazon / IndiaMART Inspired) ──────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-slate-200/80 dark:border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Logo & Section Identity */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">
                      {isHi ? "कृषि बाज़ार" : "Agricultural Marketplace"}
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{isHi ? "सत्यापित" : "Verified Hub"}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-none mt-0.5">
                    {isHi ? "ट्रैक्टर, कंबाइन, रोटावेटर, उपकरण एवं सीधी फसल खरीद" : "Tractors, implements, farm machinery & harvest trade"}
                  </p>
                </div>
              </div>

              {/* Mobile CTA Icon Buttons */}
              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  href="/mandi"
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold"
                  title="Mandi Live Rates"
                >
                  <TrendingUp className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setShowListChoiceModal(true)}
                  className="p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
                  title="List Product"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prominent Wide Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isHi
                      ? "ट्रैक्टर, रोटावेटर, हार्वेस्टर, स्प्रेयर या मॉडल खोजें (उदा. Mahindra 575)..."
                      : "Search tractors, harvesters, equipment, seeds, sprayers (e.g. Mahindra 575)..."
                  }
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-border bg-slate-50 dark:bg-background text-xs sm:text-sm text-foreground focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Top Action Buttons (Mandi, Post Listing, Wishlist) */}
            <div className="hidden lg:flex items-center gap-2.5 shrink-0">
              <Link
                href="/mandi"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white dark:bg-card hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-foreground transition shadow-2xs"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHi ? "मंडी भाव" : "Mandi Live Prices"}</span>
              </Link>

              {wishlist.length > 0 && (
                <button
                  onClick={() => {
                    // Quick filter to wishlist items
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{wishlist.length}</span>
                </button>
              )}

              <button
                onClick={() => setShowListChoiceModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isHi ? "उत्पाद जोड़ें" : "List Your Product"}</span>
              </button>
            </div>
          </div>

          {/* Section Switcher Tabs (Machinery, Direct Farm Sourcing, Mill Demands, Provenance) */}
          <div className="flex items-center justify-between overflow-x-auto gap-2 pt-2.5 mt-2 border-t border-slate-100 dark:border-border/60 scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSectionMode("machinery")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sectionMode === "machinery"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{isHi ? "🚜 कृषि मशीनरी व उपकरण" : "🚜 Farm Machinery & Equipment"}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${sectionMode === "machinery" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {unifiedProducts.length || 284}
                </span>
              </button>

              <button
                onClick={() => setSectionMode("produce")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sectionMode === "produce"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{isHi ? "🌾 किसान सीधी उपज" : "🌾 Direct Farm Sourcing"}</span>
              </button>

              <button
                onClick={() => setSectionMode("buyers")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sectionMode === "buyers"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isHi ? "🏢 थोक मांग एवं मिलर्स" : "🏢 Procurement & Mill Demands"}</span>
              </button>

              <button
                onClick={() => setSectionMode("provenance")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sectionMode === "provenance"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isHi ? "सत्यापित स्रोत" : "Data Provenance"}</span>
              </button>
            </div>

            {/* Quick Deal Switcher (Rent vs Sale) inside header bar */}
            {sectionMode === "machinery" && (
              <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-muted/60 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  onClick={() => setDealFilter("all")}
                  className={`px-2.5 py-1 rounded-md transition ${dealFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {isHi ? "सभी" : "All Deals"}
                </button>
                <button
                  onClick={() => setDealFilter("rent")}
                  className={`px-2.5 py-1 rounded-md transition ${dealFilter === "rent" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {isHi ? "किराये पर" : "Rent"}
                </button>
                <button
                  onClick={() => setDealFilter("sale")}
                  className={`px-2.5 py-1 rounded-md transition ${dealFilter === "sale" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {isHi ? "खरीदें" : "Buy / Sale"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 2. COMPACT HORIZONTAL CATEGORY NAVIGATION BAR ────────────────────── */}
      {sectionMode === "machinery" && (
        <nav aria-label="Product categories" className="bg-white dark:bg-card border-b border-slate-200/70 dark:border-border py-2 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            {EQUIPMENT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-emerald-700 text-white shadow-xs font-bold ring-2 ring-emerald-600/30"
                      : "bg-slate-100 dark:bg-muted/50 text-slate-700 dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-muted"
                  }`}
                >
                  <span className="text-sm select-none">{cat.icon}</span>
                  <span>{isHi ? cat.labelHi : cat.labelEn}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ─── 3. MAIN PRODUCT DISCOVERY VIEW ──────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {sectionMode === "machinery" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ─── Left Sidebar Filters (Desktop Sticky / Mobile Drawer) ──── */}
            <aside
              className={`lg:col-span-3 bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border p-4 shadow-2xs space-y-5 ${
                showMobileFilters
                  ? "fixed inset-0 z-50 overflow-y-auto m-0 rounded-none bg-white p-6"
                  : "hidden lg:block lg:sticky lg:top-36"
              }`}
            >
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-foreground">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>{isHi ? "फ़िल्टर विकल्प" : "Product Filters"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                    >
                      {isHi ? "हटाएं" : "Clear All"}
                    </button>
                  )}
                  {showMobileFilters && (
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter 1: Deal Type (Rent vs Sale) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-foreground uppercase tracking-wider block">
                  {isHi ? "सौदा प्रकार" : "Listing Type"}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setDealFilter("all")}
                    className={`py-1.5 px-2 rounded-lg text-center transition ${dealFilter === "all" ? "bg-emerald-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDealFilter("rent")}
                    className={`py-1.5 px-2 rounded-lg text-center transition ${dealFilter === "rent" ? "bg-emerald-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Rent
                  </button>
                  <button
                    onClick={() => setDealFilter("sale")}
                    className={`py-1.5 px-2 rounded-lg text-center transition ${dealFilter === "sale" ? "bg-emerald-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Buy / Sale
                  </button>
                </div>
              </div>

              {/* Filter 2: Brand */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-foreground uppercase tracking-wider block">
                  {isHi ? "ब्रांड / निर्माता" : "Brand & Maker"}
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-600/30"
                >
                  <option value="all">All Brands ({availableBrands.length})</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Horsepower (HP) Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-foreground uppercase tracking-wider block">
                    {isHi ? "हॉर्सपावर (HP)" : "Engine Power (HP)"}
                  </label>
                  {(minHp || maxHp) && (
                    <button
                      onClick={() => {
                        setMinHp("");
                        setMaxHp("");
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min HP (e.g. 25)"
                    value={minHp}
                    onChange={(e) => setMinHp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border text-xs bg-slate-50 dark:bg-background text-foreground"
                  />
                  <input
                    type="number"
                    placeholder="Max HP (e.g. 75)"
                    value={maxHp}
                    onChange={(e) => setMaxHp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border text-xs bg-slate-50 dark:bg-background text-foreground"
                  />
                </div>
                {/* Quick HP presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: "Under 40 HP", min: "", max: "40" },
                    { label: "40-55 HP", min: "40", max: "55" },
                    { label: "55+ HP", min: "55", max: "" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setMinHp(preset.min);
                        setMaxHp(preset.max);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-md border ${
                        minHp === preset.min && maxHp === preset.max
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 4: Condition */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-foreground uppercase tracking-wider block">
                  {isHi ? "स्थिति" : "Product Condition"}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setConditionFilter("all")}
                    className={`py-1.5 px-2 rounded-lg text-center transition ${conditionFilter === "all" ? "bg-emerald-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setConditionFilter("new")}
                    className={`py-1.5 px-2 rounded-lg text-center transition ${conditionFilter === "new" ? "bg-emerald-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => setConditionFilter("used")}
                    className={`py-1.5 px-2 rounded-lg text-center transition ${conditionFilter === "used" ? "bg-emerald-600 text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Used
                  </button>
                </div>
              </div>

              {/* Filter 5: State / Location */}
              {availableStates.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-foreground uppercase tracking-wider block">
                    {isHi ? "राज्य / क्षेत्र" : "Location / State"}
                  </label>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-background text-xs text-foreground focus:ring-2 focus:ring-emerald-600/30"
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

              {/* Mobile Drawer Close Button */}
              {showMobileFilters && (
                <div className="pt-4">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Show {filteredProducts.length} Results
                  </button>
                </div>
              )}
            </aside>

            {/* ─── Right Column: Products Grid & Controls ──────────────────── */}
            <div className="lg:col-span-9 space-y-4">
              {/* Product Controls Bar (Count, Active Chips, Sort, View Toggle) */}
              <div className="bg-white dark:bg-card p-3 rounded-2xl border border-slate-200 dark:border-border shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                    {isHi ? "दिखाए जा रहे:" : "Showing"}{" "}
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{sortedProducts.length}</span>{" "}
                    {isHi ? "उत्पाद" : "products"}
                  </span>

                  {/* Mobile Filter Toggle Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Filters</span>
                    {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </button>
                </div>

                {/* Sort and View Mode */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400 hidden sm:inline">{isHi ? "क्रम:" : "Sort by:"}</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-border bg-slate-50 dark:bg-background text-xs font-semibold text-slate-800 dark:text-foreground"
                    >
                      <option value="relevance">Relevance (Featured)</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="hp_desc">Horsepower (HP): High to Low</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>

                  {/* Grid / List View Toggle */}
                  <div className="flex items-center border border-slate-200 dark:border-border rounded-lg p-0.5 bg-slate-50 dark:bg-background">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white text-emerald-600 shadow-2xs" : "text-slate-400 hover:text-slate-600"}`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white text-emerald-600 shadow-2xs" : "text-slate-400 hover:text-slate-600"}`}
                      title="List View"
                    >
                      <ListIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Active:</span>
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      Category: {selectedCategory.replace("_", " ")}
                      <button onClick={() => setSelectedCategory("all")}>
                        <X className="w-3 h-3 hover:text-red-600" />
                      </button>
                    </span>
                  )}
                  {selectedBrand !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      Brand: {selectedBrand}
                      <button onClick={() => setSelectedBrand("all")}>
                        <X className="w-3 h-3 hover:text-red-600" />
                      </button>
                    </span>
                  )}
                  {dealFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      Deal: {dealFilter}
                      <button onClick={() => setDealFilter("all")}>
                        <X className="w-3 h-3 hover:text-red-600" />
                      </button>
                    </span>
                  )}
                  {(minHp || maxHp) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      HP: {minHp || 0} - {maxHp || "Any"}
                      <button
                        onClick={() => {
                          setMinHp("");
                          setMaxHp("");
                        }}
                      >
                        <X className="w-3 h-3 hover:text-red-600" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      &quot;{searchQuery}&quot;
                      <button onClick={() => setSearchQuery("")}>
                        <X className="w-3 h-3 hover:text-red-600" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* ─── Product Listing Grid ──────────────────────────────────── */}
              {loadingProducts ? (
                <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                  <RotateCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
                  <p className="text-xs font-bold">{isHi ? "मशीनरी उत्पाद लोड हो रहे हैं..." : "Loading products catalogue..."}</p>
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                    {isHi ? "कोई उत्पाद नहीं मिला" : "No agricultural products match your filters"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {isHi
                      ? "कृपया अपने फ़िल्टर बदलें या सर्च शब्द हटाकर पुनः प्रयास करें।"
                      : "Try resetting your brand, HP range, or search keyword to see all available machines."}
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                  >
                    {isHi ? "सभी फ़िल्टर हटाएं" : "Reset All Filters"}
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                /* GRID VIEW (3-4 cols desktop, 2 cols tablet/mobile) */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((product) => {
                    const isWishlisted = wishlist.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="group bg-white dark:bg-card rounded-2xl border border-slate-200/90 dark:border-border hover:border-emerald-500/60 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
                      >
                        <div>
                          {/* Image Frame (object-fit: contain, no cropping) */}
                          <div className="relative w-full h-48 bg-slate-50/80 dark:bg-muted/20 border-b border-slate-100 dark:border-border/60 flex items-center justify-center p-3 overflow-hidden">
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.title}
                              category={product.category}
                              brand={product.brand}
                            />

                            {/* Top Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                              {product.dealType === "rent" ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                                  {isHi ? "किराये पर" : "For Rent"}
                                </span>
                              ) : product.dealType === "sale" ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-600 text-white shadow-xs">
                                  {isHi ? "बिक्री के लिए" : "For Sale"}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-800 text-white shadow-xs">
                                  {isHi ? "ब्रांड मॉडल" : "Verified Model"}
                                </span>
                              )}
                            </div>

                            {/* Wishlist Button */}
                            <button
                              onClick={(e) => toggleWishlist(product.id, e)}
                              className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition ${
                                isWishlisted
                                  ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-xs"
                                  : "bg-white/80 text-slate-400 hover:text-rose-600 hover:bg-white"
                              }`}
                              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500" : ""}`} />
                            </button>

                            {/* Condition Tag */}
                            {product.condition && product.condition !== "new" && (
                              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                                {product.condition}
                              </span>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="p-3.5 space-y-2">
                            {/* Brand & Category line */}
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider line-clamp-1">
                                {product.brand}
                              </span>
                              <span className="capitalize text-[10px] text-slate-400 shrink-0">
                                {product.category.replace("_", " ")}
                              </span>
                            </div>

                            {/* Title / Model */}
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-foreground group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                              {product.title}
                            </h4>

                            {/* Key Specifications Row (HP, Width, Weight) */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                              {product.hpRating != null && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted font-bold text-slate-700 dark:text-slate-200">
                                  <Gauge className="w-3 h-3 text-emerald-600" />
                                  <span>{product.hpRating} HP</span>
                                </span>
                              )}
                              {product.workingWidthMm != null && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300">
                                  <span>{product.workingWidthMm} mm</span>
                                </span>
                              )}
                              {product.weightKg != null && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300">
                                  <span>{product.weightKg} kg</span>
                                </span>
                              )}
                            </div>

                            {/* Price / Rate Row */}
                            <div className="pt-2 border-t border-slate-100 dark:border-border/60">
                              {product.price != null ? (
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                    {product.dealType === "rent" ? "Rental Rate" : "Price"}
                                  </span>
                                  <span className="text-base font-black text-slate-900 dark:text-foreground">
                                    ₹{product.price.toLocaleString("en-IN")}
                                    {product.priceUnit && (
                                      <span className="text-xs font-normal text-slate-500 ml-1">
                                        /{product.priceUnit.replace("per ", "")}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Pricing</span>
                                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                    Contact for Price
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Seller & Location */}
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                              <span className="truncate max-w-[130px] font-medium" title={product.sellerName}>
                                {product.sellerName}
                              </span>
                              <span className="flex items-center gap-0.5 text-slate-400 shrink-0">
                                <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{product.district || "Pan-India"}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="p-3 border-t border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/10 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition text-center"
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
                                product.sellerLocation,
                                "equipment"
                              );
                            }}
                            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{isHi ? "संपर्क" : "Contact"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW (Amazon/IndiaMART Horizontal Card) */
                <div className="space-y-3">
                  {paginatedProducts.map((product) => {
                    const isWishlisted = wishlist.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="group bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border p-4 hover:border-emerald-500/60 hover:shadow-md transition flex flex-col sm:flex-row items-center gap-4 cursor-pointer"
                      >
                        {/* Left: Product Image */}
                        <div className="w-full sm:w-48 h-40 bg-slate-50 rounded-xl border border-slate-100 p-2 shrink-0 flex items-center justify-center relative">
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.title}
                            category={product.category}
                            brand={product.brand}
                          />
                          <button
                            onClick={(e) => toggleWishlist(product.id, e)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-slate-400 hover:text-rose-600"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>
                        </div>

                        {/* Center: Details */}
                        <div className="flex-1 space-y-1.5 w-full">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                              {product.brand}
                            </span>
                            <span className="text-xs text-slate-400 capitalize">
                              {product.category.replace("_", " ")}
                            </span>
                            {product.dealType === "rent" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                For Rent
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-extrabold text-slate-900 dark:text-foreground group-hover:text-emerald-600">
                            {product.title}
                          </h4>

                          {/* Specs */}
                          <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                            {product.hpRating && <span><strong>{product.hpRating} HP</strong></span>}
                            {product.workingWidthMm && <span>Width: <strong>{product.workingWidthMm} mm</strong></span>}
                            {product.weightKg && <span>Weight: <strong>{product.weightKg} kg</strong></span>}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                            <span className="font-semibold text-slate-800">{product.sellerName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              {product.sellerLocation}
                            </span>
                          </div>
                        </div>

                        {/* Right: Price & CTA */}
                        <div className="w-full sm:w-48 text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-border pl-0 sm:pl-4 pt-3 sm:pt-0 space-y-2">
                          <div>
                            {product.price != null ? (
                              <div className="text-lg font-black text-slate-900 dark:text-foreground">
                                ₹{product.price.toLocaleString("en-IN")}{" "}
                                {product.priceUnit && (
                                  <span className="text-xs font-normal text-slate-500">
                                    /{product.priceUnit.replace("per ", "")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm font-bold text-emerald-700">Contact for Price</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openContact(
                                  product.sellerName,
                                  product.sellerPhone,
                                  product.title,
                                  product.sellerLocation,
                                  "equipment"
                                );
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center justify-center gap-1 shadow-2xs"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Contact Seller</span>
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
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-border">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Previous
                  </button>

                  <span className="text-xs font-bold text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-border text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── SECTION 2: DIRECT FARM SOURCING (PRODUCE LOTS) ────────────────── */}
        {sectionMode === "produce" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-card p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-foreground">
                  {isHi ? "सीधे खेतों से फसल खरीद (Direct Farm Sourcing)" : "Direct Farm Sourcing & Standing Crops"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHi
                    ? "किसानों और एफपीओ द्वारा सीधे पोस्ट किए गए गेहूं, धान, सोयाबीन और सब्जियों के लॉट्स।"
                    : "Fresh harvest lots posted directly by verified growers with zero middleman margin."}
                </p>
              </div>
              <button
                onClick={() => setShowProduceModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
              >
                + {isHi ? "फसल उपज लिस्ट करें" : "List Harvest Produce"}
              </button>
            </div>

            {/* Produce Grid */}
            {loadingProduce ? (
              <div className="p-12 text-center text-slate-400">Loading harvest produce...</div>
            ) : produceListings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                No produce lots currently listed.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {produceListings.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-white dark:bg-card rounded-2xl border border-slate-200 p-5 hover:border-amber-500/50 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                          {lot.category}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">Verified Grower</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-foreground">
                        {lot.crop_name} {lot.variety && `(${lot.variety})`}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
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
                          <span className="text-base font-extrabold text-amber-700">
                            ₹{lot.asking_price} / Q
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{lot.farmer_name}</span>
                      <button
                        onClick={() =>
                          openContact(
                            lot.farmer_name,
                            lot.farmer_phone,
                            `${lot.crop_name} (${lot.quantity} ${lot.quantity_unit})`,
                            `${lot.district}, ${lot.state}`,
                            "produce"
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1"
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
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-foreground">
                Verified Millers, Aggregators & FPO Purchase Orders
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutional procurement requirements with transparent purchase quantities and target rates.
              </p>
            </div>

            {loadingLegacy ? (
              <div className="p-12 text-center text-slate-400">Loading procurement orders...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {legacyListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-card rounded-2xl border border-slate-200 p-5 hover:border-emerald-500/50 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold uppercase text-[10px]">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">VERIFIED BUYER</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">{item.crop_or_item}</h4>
                      <p className="text-xs text-slate-500">{item.organization_name}</p>

                      <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <p>Quantity Required: <strong>{item.quantity} {item.quantity_unit}</strong></p>
                        <p>Target Rate: <strong className="text-emerald-700">₹{item.price} {item.price_unit}</strong></p>
                        <p>Delivery: <strong>{item.district}, {item.state}</strong></p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{item.contact_person || "Procurement Desk"}</span>
                      <button
                        onClick={() =>
                          openContact(
                            item.organization_name,
                            item.contact_phone,
                            item.crop_or_item,
                            `${item.district}, ${item.state}`,
                            "produce"
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
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
            <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Authorized Public Agricultural Data Sources & Integrity
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                Under platform governance rules, KisaanBuddy integrates verified machinery data from Central Farm Machinery
                Training & Testing Institutes (CFMTTI Budni / NRFMTTI Hisar) and wholesale mandis via AGMARKNET under the Open
                Government Data (OGD) License - India. Speculative prices, synthetic buyer leads, and fake machinery images are
                strictly forbidden.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((src) => (
                <div key={src.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">{src.source_name}</h4>
                  <p className="text-xs text-slate-500">{src.commercial_reuse_terms}</p>
                  <a
                    href={src.base_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
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

      {/* ─── 4. PRODUCT DETAIL MODAL (Amazon / IndiaMART Quality Gallery & Specs) ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-card w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-border shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-card/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 dark:border-border flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                  {selectedProduct.brand}
                </span>
                <span className="text-xs text-slate-400 capitalize">
                  {selectedProduct.category.replace("_", " ")}
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Top Section: Gallery & Quick Purchase Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Large Image Gallery with thumbnails */}
                <div className="md:col-span-6 space-y-3">
                  <div className="w-full h-64 bg-slate-50 dark:bg-muted/20 rounded-2xl border border-slate-100 dark:border-border p-4 flex items-center justify-center overflow-hidden">
                    <ProductImage
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      category={selectedProduct.category}
                      brand={selectedProduct.brand}
                      className="max-h-56"
                    />
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-14 rounded-xl border-2 border-emerald-600 bg-white p-1 flex items-center justify-center overflow-hidden cursor-pointer shadow-2xs">
                      <ProductImage
                        src={selectedProduct.imageUrl}
                        alt="Thumbnail"
                        category={selectedProduct.category}
                        brand={selectedProduct.brand}
                      />
                    </div>
                    {CATEGORY_IMAGE_FALLBACKS[selectedProduct.category] && (
                      <div className="w-16 h-14 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden cursor-pointer opacity-70 hover:opacity-100">
                        <img
                          src={CATEGORY_IMAGE_FALLBACKS[selectedProduct.category]}
                          alt="Alternative View"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Pricing, Seller, Quick Actions */}
                <div className="md:col-span-6 space-y-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-foreground">
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
                        <div className="text-2xl font-black text-slate-900 dark:text-foreground">
                          ₹{selectedProduct.price.toLocaleString("en-IN")}{" "}
                          {selectedProduct.priceUnit && (
                            <span className="text-xs font-normal text-slate-500">
                              /{selectedProduct.priceUnit.replace("per ", "")}
                            </span>
                          )}
                        </div>
                        {selectedProduct.dealType === "rent" && (
                          <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-emerald-200/50 text-[11px] text-slate-600">
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

                  {/* Seller / Dealer Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/20 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Seller / Provider</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-800">{selectedProduct.sellerName}</div>
                    <div className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
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
                          selectedProduct.sellerLocation,
                          "equipment"
                        );
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{isHi ? "विक्रेता से संपर्क करें" : "Contact Seller"}</span>
                    </button>

                    {selectedProduct.officialSourceUrl && (
                      <a
                        href={selectedProduct.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                        title="View Official Product Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Complete Specifications Table */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Manufacturer</span>
                    <span className="font-bold text-slate-800">{selectedProduct.manufacturer}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Category</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedProduct.category.replace("_", " ")}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Horsepower (HP)</span>
                    <span className="font-bold text-slate-800">{selectedProduct.hpRating ? `${selectedProduct.hpRating} HP` : "Specifications unavailable"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Working Width</span>
                    <span className="font-bold text-slate-800">{selectedProduct.workingWidthMm ? `${selectedProduct.workingWidthMm} mm` : "Specifications unavailable"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">PTO Power</span>
                    <span className="font-bold text-slate-800">{selectedProduct.ptoHp ? `${selectedProduct.ptoHp} HP` : "Specifications unavailable"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Total Weight</span>
                    <span className="font-bold text-slate-800">{selectedProduct.weightKg ? `${selectedProduct.weightKg} kg` : "Specifications unavailable"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Lifting Capacity</span>
                    <span className="font-bold text-slate-800">{selectedProduct.liftingCapacityKg ? `${selectedProduct.liftingCapacityKg} kg` : "Specifications unavailable"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Condition</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedProduct.condition}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Year of Make</span>
                    <span className="font-bold text-slate-800">{selectedProduct.yearOfManufacture || "2023"}</span>
                  </div>
                </div>
              </div>

              {/* Description & Agronomic Suitability */}
              {selectedProduct.description && (
                <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-600 leading-relaxed space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Product Description</span>
                  <p>{selectedProduct.description}</p>
                </div>
              )}

              {/* Similar Products Recommendation Row */}
              {similarProducts.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Similar Agricultural Equipment
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {similarProducts.map((sim) => (
                      <div
                        key={sim.id}
                        onClick={() => setSelectedProduct(sim)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white cursor-pointer transition text-center space-y-1"
                      >
                        <div className="h-20 w-full bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden">
                          <ProductImage
                            src={sim.imageUrl}
                            alt={sim.title}
                            category={sim.category}
                            brand={sim.brand}
                            className="max-h-16"
                          />
                        </div>
                        <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">{sim.title}</h5>
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

      {/* ─── 5. MODAL: CONTACT SELLER DIALOG ─────────────────────────────────── */}
      {showContactModal && contactTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card w-full max-w-md rounded-3xl border border-slate-200 dark:border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHi ? "विक्रेता संपर्क जानकारी" : "Verified Seller Contact"}
                </h3>
              </div>
              <button onClick={() => setShowContactModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Inquiring for:</span>
              <p className="font-extrabold text-slate-900">{contactTarget.title}</p>
              <p className="text-slate-500">📍 {contactTarget.location}</p>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Contact Person</span>
                <span className="text-sm font-bold text-slate-800 block">{contactTarget.name}</span>
              </div>

              {contactTarget.phone ? (
                <a
                  href={`tel:${contactTarget.phone}`}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {contactTarget.phone}</span>
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-center">
                  Phone connection request logged. The seller will be notified.
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center pt-2">
              KisaanBuddy ensures fair trade and direct farmer negotiations.
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. MODAL: LIST CHOICE DIALOG (Machinery vs Produce) ─────────────── */}
      {showListChoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card w-full max-w-md rounded-3xl border border-slate-200 dark:border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {isHi ? "आप क्या लिस्ट करना चाहते हैं?" : "What would you like to list?"}
              </h3>
              <button onClick={() => setShowListChoiceModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
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
                  {isHi
                    ? "ट्रैक्टर, रोटावेटर, कंबाइन या स्प्रेयर को स्थानीय किसानों के लिए पोस्ट करें।"
                    : "Offer your tractor, harvester, or implements for local custom hiring or direct sale."}
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
                  {isHi
                    ? "अपनी तैयार फसल सीधे मिलर्स और सत्यापित थोक खरीदारों को बेचें।"
                    : "Sell grain, pulses, or vegetables directly to verified millers and bulk buyers."}
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. MODAL: POST EQUIPMENT LISTING FORM ────────────────────────────── */}
      {showEqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card w-full max-w-xl rounded-3xl border border-slate-200 dark:border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isHi ? "मशीन किराये या बिक्री हेतु लिस्ट करें" : "List Machinery for Rent or Sale"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHi ? "अपने ट्रैक्टर, रोटावेटर या कृषि उपकरण को सत्यापित किसानों तक पहुंचाएं।" : "List equipment with zero commission."}
                </p>
              </div>
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

              <div>
                <label className="block font-bold text-slate-800 mb-1">Notes / Terms</label>
                <textarea
                  placeholder="Mention operator availability, attachments included, or delivery conditions..."
                  value={newEqNotes}
                  onChange={(e) => setNewEqNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isSubmitting ? "Publishing..." : "Publish Equipment Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 8. MODAL: POST PRODUCE LISTING FORM ──────────────────────────────── */}
      {showProduceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card w-full max-w-xl rounded-3xl border border-slate-200 dark:border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {isHi ? "फसल उपज लिस्ट करें" : "List Harvest Produce for Sale"}
              </h3>
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
                  <label className="block font-bold text-slate-800 mb-1">Farmer / Collective Name *</label>
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {isSubmitting ? "Publishing..." : "Publish Produce Lot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
