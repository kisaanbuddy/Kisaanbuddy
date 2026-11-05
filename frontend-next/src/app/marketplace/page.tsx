"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import machineryAuditData from "@/lib/data/machinery-image-mapping.json";
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
  Crosshair,
  Loader2,
  Plus,
  ExternalLink,
  Gauge,
  ChevronDown,
  AlertCircle,
  User,
  Sliders,
  Check,
  ArrowRight,
  RotateCcw,
  Scale,
  MessageSquare,
  Clock,
  Building2,
  Send,
} from "lucide-react";
import {
  equipmentCatalogApi,
  equipmentListingsApi,
  produceListingsApi,
  tradeInquiriesApi,
  priceComparisonApi,
  dealersApi,
  EquipmentCatalogItem,
  EquipmentListingItem,
  ProduceListingItem,
  TradeInquiryItem,
  PriceComparisonResponse,
  PriceComparisonItem,
  DealerDiscoveryItem,
} from "@/lib/farmer-api";
import { useLanguage } from "@/lib/language";

// Clean telephone number for tel: protocol
function cleanPhoneForTel(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/[^0-9+]/g, "");
}

// Clean WhatsApp number (removes + and non-digits, ensures India country code)
function cleanPhoneForWa(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

// Validate external URL safely
function isValidWebUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && parsed.hostname.includes("."));
  } catch {
    return false;
  }
}

// Comprehensive Indian States and Agricultural Districts Mapping
const INDIAN_LOCATIONS: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Guntur", "Krishna", "East Godavari", "West Godavari", "Kurnool", 
    "Anantapur", "Chittoor", "Visakhapatnam", "Prakasam", "SPSR Nellore", "Kadapa"
  ],
  "Assam": [
    "Kamrup (Guwahati)", "Nagaon", "Sonitpur", "Dibrugarh", "Cachar", 
    "Barpeta", "Dhubri", "Jorhat", "Golaghat", "Tinsukia", "Sivasagar"
  ],
  "Bihar": [
    "Samastipur", "Patna", "Muzaffarpur", "Gaya", "Bhagalpur", "Begusarai", 
    "Darbhanga", "Purnia", "Rohtas", "Nalanda", "Saran", "Vaishali", 
    "Madhubani", "Siwan", "East Champaran", "West Champaran", "Saharsa", 
    "Katihar", "Munger", "Bhojpur (Arrah)", "Buxar", "Sitamarhi"
  ],
  "Chhattisgarh": [
    "Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Janjgir-Champa", "Balod", "Bemetara", "Dhamtari"
  ],
  "Delhi": [
    "New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Central Delhi", "South West Delhi", "North West Delhi"
  ],
  "Gujarat": [
    "Rajkot", "Anand", "Ahmedabad", "Surat", "Vadodara", "Bhavnagar", 
    "Junagadh", "Jamnagar", "Mehsana", "Banaskantha", "Sabarkantha", 
    "Kheda", "Amreli", "Patan", "Surendranagar", "Bharuch"
  ],
  "Haryana": [
    "Karnal", "Sirsa", "Ambala", "Kurukshetra", "Kaithal", "Hisar", 
    "Fatehabad", "Jind", "Rohtak", "Sonipat", "Panipat", "Yamunanagar", 
    "Bhiwani", "Jhajjar", "Rewari", "Palwal", "Gurugram", "Faridabad"
  ],
  "Himachal Pradesh": [
    "Kangra", "Mandi", "Shimla", "Solan", "Sirmaur", "Una", "Kullu", "Hamirpur", "Bilaspur", "Chamba"
  ],
  "Jammu and Kashmir": [
    "Jammu", "Srinagar", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Pulwama"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih"
  ],
  "Karnataka": [
    "Bengaluru", "Belagavi", "Mysuru", "Hubballi-Dharwad", "Kalaburagi", 
    "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", 
    "Raichur", "Mandya", "Hassan", "Bagalkote", "Koppal", "Udupi", "Dakshina Kannada"
  ],
  "Kerala": [
    "Kochi (Ernakulam)", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Palakkad", 
    "Kollam", "Kannur", "Alappuzha", "Kottayam", "Malappuram", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Sehore", "Dewas", "Indore", "Ujjain", "Hoshangabad (Narmadapuram)", 
    "Vidisha", "Bhopal", "Gwalior", "Jabalpur", "Sagar", "Dhar", "Khargone", 
    "Ratlam", "Raisen", "Harda", "Shajapur", "Mandsaur", "Neemuch", 
    "Chhindwara", "Rewa", "Satna", "Morena"
  ],
  "Maharashtra": [
    "Nashik", "Kolhapur", "Ahmednagar", "Jalgaon", "Pune", "Solapur", 
    "Chhatrapati Sambhajinagar", "Sangli", "Satara", "Nagpur", 
    "Amravati", "Nanded", "Yavatmal", "Latur", "Beed", "Buldhana", "Akola"
  ],
  "Odisha": [
    "Cuttack", "Sambalpur", "Bargarh", "Balasore", "Ganjam", "Puri", "Bhadrak", "Mayurbhanj"
  ],
  "Punjab": [
    "Ludhiana", "Sangrur", "Patiala", "Bathinda", "Amritsar", "Jalandhar", 
    "Firozpur", "Moga", "Fazilka", "Sri Muktsar Sahib", "Barnala", "Mansa", 
    "Kapurthala", "Hoshiarpur", "Gurdaspur", "Fategarh Sahib", "Faridkot", 
    "Tarn Taran", "Rupnagar", "Pathankot"
  ],
  "Rajasthan": [
    "Kota", "Sri Ganganagar", "Jaipur", "Jodhpur", "Bikaner", "Alwar", 
    "Hanumangarh", "Udaipur", "Nagaur", "Sikar", "Ajmer", "Bharatpur", 
    "Chittorgarh", "Baran", "Bundi", "Pali", "Jhalawar"
  ],
  "Tamil Nadu": [
    "Coimbatore", "Thanjavur", "Madurai", "Salem", "Tiruchirappalli", "Erode", "Tirunelveli", "Vellore", "Chennai"
  ],
  "Telangana": [
    "Warangal", "Hyderabad", "Nizamabad", "Karimnagar", "Khammam", 
    "Nalgonda", "Mahbubnagar", "Medak", "Rangareddy", "Adilabad", "Suryapet"
  ],
  "Uttar Pradesh": [
    "Muzaffarnagar", "Aligarh", "Lakhimpur Kheri", "Meerut", "Bareilly", 
    "Agra", "Varanasi", "Lucknow", "Kanpur", "Prayagraj", "Gorakhpur", 
    "Moradabad", "Saharanpur", "Mathura", "Bijnor", "Bulandshahr", 
    "Hardoi", "Sitapur", "Budaun", "Barabanki", "Shahjahanpur", "Ayodhya"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital", "Pauri Garhwal", "Almora"
  ],
  "West Bengal": [
    "Purba Bardhaman", "Paschim Bardhaman", "Hooghly", "Murshidabad", 
    "Nadia", "Purba Medinipur", "Paschim Medinipur", "Birbhum", "Malda", "Jalpaiguri", "Kolkata"
  ]
};

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

interface UnifiedProduct {
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
  images?: string[];
  officialSourceUrl?: string | null;
  supplierName?: string | null;
  description?: string | null;
  provenanceSource?: string | null;
  provenanceLicense?: string | null;
}

interface UserLocation {
  state: string;
  district: string;
  city?: string;
  source: "gps" | "manual" | "default";
  detectedAt?: number;
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

// Clean Product Image with strict aspect ratio, contain fit, proxy fallback, and honest missing photo state
function ProductCardImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(src));

  // Reset state when src updates across sort/filter/pagination
  useEffect(() => {
    setImageError(false);
    setUseProxy(false);
    setIsLoading(Boolean(src));
  }, [src]);

  if (!src || imageError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-stone-50 dark:bg-stone-900 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 select-none">
        <AlertCircle className="w-5 h-5 text-amber-500 mb-1 shrink-0" />
        <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
          Photo Pending
        </span>
        <span className="text-[10px] text-stone-400">
          Awaiting verified photo
        </span>
      </div>
    );
  }

  // Automatic proxy fallback for remote cross-origin images (e.g. cdn.shopify.com)
  const effectiveSrc = useProxy && src.startsWith("http")
    ? `/api/marketplace/image-proxy?url=${encodeURIComponent(src)}`
    : src;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-50/60 dark:bg-stone-900/60 z-0">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={effectiveSrc}
        alt={alt}
        className={`w-full h-full object-contain p-2 transition-all duration-200 group-hover:scale-105 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className || ""}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!useProxy && src.startsWith("http")) {
            setUseProxy(true);
          } else {
            setImageError(true);
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}

// Reverse geocode latitude and longitude to State, District and City (India)
async function reverseGeocodeCoords(lat: number, lon: number): Promise<{ state: string; district: string; city: string }> {
  // 1. Primary: Server-side Next.js route (no CORS, no CSP limits, multi-provider fallback)
  try {
    const res = await fetch(`/api/marketplace/reverse-geocode?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.state) {
        return {
          state: data.state,
          district: data.district || data.city || "",
          city: data.city || data.district || "",
        };
      }
    }
  } catch (e) {
    console.warn("Internal reverse-geocode endpoint failed, attempting direct client fallback:", e);
  }

  // 2. Secondary client fallback: BigDataCloud
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const rawState = data.principalSubdivision || "";
      let district = "";
      if (Array.isArray(data.localityInfo?.administrative)) {
        const distObj = data.localityInfo.administrative.find((a: any) =>
          (a.description && a.description.toLowerCase().includes("district")) ||
          (a.name && a.name.toLowerCase().includes("district"))
        );
        if (distObj?.name) {
          district = distObj.name.replace(/\bdistrict\b/gi, "").trim();
        }
      }
      if (!district) {
        district = data.city || data.locality || "";
      }
      const city = data.city || data.locality || district;
      if (rawState || district) {
        return {
          state: rawState || district,
          district: district || city,
          city: city || district,
        };
      }
    }
  } catch (e) {
    console.warn("Client BigDataCloud geocode failed:", e);
  }

  // 3. Tertiary client fallback: Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const state = addr.state || addr.state_district || "";
      const district = (addr.state_district || addr.county || addr.city || "").replace(/\bdistrict\b/gi, "").trim();
      const city = addr.city || addr.town || addr.village || district;
      if (state || district) {
        return { state: state || district, district: district || city, city };
      }
    }
  } catch (e) {
    console.warn("Client Nominatim geocode failed:", e);
  }

  return { state: "", district: "", city: "" };
}

// Calculate location relevance score:
// Same City = 120, Same District = 100, Same State = 60, Pan-India Catalog = 20, Other = 0
function getLocationScore(
  product: UnifiedProduct,
  userLoc: UserLocation
): number {
  if (!userLoc.state || userLoc.state === "all") return 0;

  const uState = userLoc.state.toLowerCase().trim();
  const uDist = (userLoc.district || "").toLowerCase().trim();
  const uCity = (userLoc.city || "").toLowerCase().trim();

  const pState = (product.state || "").toLowerCase().trim();
  const pDist = (product.district || "").toLowerCase().trim();
  const pLoc = (product.sellerLocation || "").toLowerCase().trim();

  // Tier 1: Exact City / Taluk Match
  if (uCity && ((pDist && (pDist === uCity || pDist.includes(uCity) || uCity.includes(pDist))) || (pLoc && pLoc.includes(uCity)))) {
    return 120;
  }

  // Tier 2: Same District Match
  if (uDist && ((pDist && (pDist === uDist || pDist.includes(uDist) || uDist.includes(pDist))) || (pLoc && pLoc.includes(uDist)))) {
    return 100;
  }

  // Tier 3: Same State Match
  if (uState && ((pState && (pState === uState || pState.includes(uState) || uState.includes(pState))) || (pLoc && pLoc.includes(uState)))) {
    return 60;
  }

  // Tier 4: Pan-India Catalog Equipment
  if (product.sourceType === "catalog") {
    return 20;
  }

  return 0;
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

  // ─── 1. LOCATION STATE & GEOLOCATION ─────────────────────────────────────
  const [userLocation, setUserLocation] = useState<UserLocation>({
    state: "all",
    district: "",
    city: "",
    source: "default",
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<"granted" | "prompt" | "denied" | "unsupported">("prompt");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationPopover, setShowLocationPopover] = useState(false);
  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [selectedManualState, setSelectedManualState] = useState("");
  const [selectedManualDistrict, setSelectedManualDistrict] = useState("");
  const [selectedManualCity, setSelectedManualCity] = useState("");
  const [strictLocationOnly, setStrictLocationOnly] = useState(false);
  const locationPopoverRef = useRef<HTMLDivElement>(null);

  // ─── OTHER FILTER STATES (In specific order: Category, Brand, Deal, Price, Condition) ─
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [verifiedPhotoOnly, setVerifiedPhotoOnly] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [dealFilter, setDealFilter] = useState<"all" | "rent" | "sale">("all");
  const [hpRange, setHpRange] = useState<"all" | "under_40" | "40_55" | "55_75" | "above_75">("all");
  const [conditionFilter, setConditionFilter] = useState<"all" | "new" | "used">("all");
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
    sourceType: "listing" | "catalog";
    listingId?: number;
    catalogId?: number;
    brand?: string;
    modelName?: string;
    officialSourceUrl?: string | null;
  } | null>(null);

  // Seller Contact Modal Interactive State (Direct / Callback / Quotation)
  const [contactTab, setContactTab] = useState<"direct" | "callback" | "quote">("direct");
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("Morning (9:00 AM – 12:00 PM)");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteQuantity, setQuoteQuantity] = useState("");
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<{
    refId: number;
    status: string;
    type: string;
    message: string;
  } | null>(null);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  // Smart Price Comparison State
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareProduct, setCompareProduct] = useState<UnifiedProduct | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState<PriceComparisonResponse | null>(null);

  // Dealer & Custom Hiring Center (CHC) Discovery State
  const [showDealersModal, setShowDealersModal] = useState(false);
  const [dealersList, setDealersList] = useState<DealerDiscoveryItem[]>([]);
  const [dealersLoading, setDealersLoading] = useState(false);

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

  // Close search suggestions & location popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (locationPopoverRef.current && !locationPopoverRef.current.contains(e.target as Node)) {
        setShowLocationPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── GEOLOCATION DETECTION FUNCTION ──────────────────────────────────────
  const detectLocation = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Browser geolocation is not available on this device.");
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const loc = await reverseGeocodeCoords(latitude, longitude);

          if (loc.state && loc.state.toLowerCase() !== "all") {
            const detected: UserLocation = {
              state: loc.state,
              district: loc.district || loc.city || "",
              city: loc.city || loc.district || "",
              source: "gps",
              detectedAt: Date.now(),
            };
            setUserLocation(detected);
            setSelectedManualState(loc.state);
            setSelectedManualDistrict(loc.district || "");
            setSelectedManualCity(loc.city || "");
            setLocationPermissionStatus("granted");
            setLocationError(null);
            setShowLocationPopover(false);

            // Avoid storing precise coordinates unnecessarily (store city, district, state only)
            try {
              localStorage.setItem("kisaanbuddy_marketplace_location", JSON.stringify(detected));
            } catch {}
          } else {
            setLocationError("Could not resolve location address from coordinates. Please select manually.");
          }
        } catch (err: any) {
          console.error("Failed to reverse geocode GPS coordinates:", err);
          setLocationError("Could not determine address from GPS. Please select your location manually.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocationPermissionStatus("denied");
          setLocationError("Location permission denied. Please allow location access in browser settings or choose manually below.");
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setLocationError("GPS signal unavailable on your device. Please select your location manually.");
        } else if (err.code === 3) {
          // TIMEOUT
          setLocationError("GPS detection timed out. Please try again or select your location manually.");
        } else {
          setLocationError(err.message || "Failed to detect GPS location.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  // On page load: check saved location or automatically request geolocation if permission already granted
  useEffect(() => {
    let hasValidSaved = false;
    try {
      const savedLoc = localStorage.getItem("kisaanbuddy_marketplace_location");
      if (savedLoc) {
        const parsed: UserLocation = JSON.parse(savedLoc);
        // Strictly prevent contradictory state (state="all" with source="gps")
        if (parsed.state && parsed.state !== "all") {
          setUserLocation(parsed);
          setSelectedManualState(parsed.state);
          setSelectedManualDistrict(parsed.district || "");
          setSelectedManualCity(parsed.city || "");
          hasValidSaved = true;
        } else {
          localStorage.removeItem("kisaanbuddy_marketplace_location");
        }
      }
    } catch {}

    // Check if permission is already granted in the browser
    if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          setLocationPermissionStatus(permissionStatus.state as any);

          // If already granted, automatically retrieve real coordinates
          if (permissionStatus.state === "granted") {
            detectLocation();
          }

          // React when user grants or revokes permission in browser settings
          permissionStatus.onchange = () => {
            setLocationPermissionStatus(permissionStatus.state as any);
            if (permissionStatus.state === "granted") {
              detectLocation();
            }
          };
        })
        .catch(() => {
          if (!hasValidSaved) {
            setLocationPermissionStatus("prompt");
          }
        });
    }
  }, [detectLocation]);

  // Clear location (Reset to All India)
  const clearLocation = () => {
    const allIndia: UserLocation = { state: "all", district: "", city: "", source: "default" };
    setUserLocation(allIndia);
    setSelectedManualState("");
    setSelectedManualDistrict("");
    setSelectedManualCity("");
    setStrictLocationOnly(false);
    setShowLocationPopover(false);
    setLocationError(null);
    try {
      localStorage.removeItem("kisaanbuddy_marketplace_location");
    } catch {}
  };

  // Manual location select
  const setManualLocation = (state: string, district = "", city = "") => {
    if (!state || state === "all") {
      clearLocation();
      return;
    }
    const loc: UserLocation = {
      state,
      district,
      city: city || district,
      source: "manual",
      detectedAt: Date.now(),
    };
    setUserLocation(loc);
    setSelectedManualState(state);
    setSelectedManualDistrict(district);
    setSelectedManualCity(city || district);
    setShowLocationPopover(false);
    setLocationError(null);
    try {
      localStorage.setItem("kisaanbuddy_marketplace_location", JSON.stringify(loc));
    } catch {}
  };

  // Search locations matching query (states, districts, and major cities)
  const searchedLocations = useMemo(() => {
    const q = locationSearchInput.toLowerCase().trim();
    if (!q) return [];

    const matches: { state: string; district: string; city: string }[] = [];

    // Check states and districts
    for (const [st, dists] of Object.entries(INDIAN_LOCATIONS)) {
      if (st.toLowerCase().includes(q)) {
        matches.push({ state: st, district: "", city: "" });
      }
      for (const d of dists) {
        if (d.toLowerCase().includes(q)) {
          matches.push({ state: st, district: d, city: d });
        }
      }
    }

    return matches.slice(0, 10);
  }, [locationSearchInput]);

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

  // Image audit mapping lookup
  const auditImageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of (machineryAuditData as any).records || []) {
      if (r.imageUrl) {
        if (r.productId) map.set(r.productId, r.imageUrl);
        if (r.numericId && r.sourceType) map.set(`${r.sourceType}-${r.numericId}`, r.imageUrl);
        if (r.exactModel) {
          const key = `${(r.brand || "").toLowerCase()} ${(r.exactModel || "").toLowerCase()}`.trim();
          map.set(key, r.imageUrl);
        }
      }
    }
    return map;
  }, []);

  // Combine reference models and active farmer listings into unified products
  const unifiedProducts = useMemo<UnifiedProduct[]>(() => {
    const list: UnifiedProduct[] = [];

    // Real Farmer Listings (Rent / Sale)
    for (const item of equipmentListings) {
      const modelKey = `${(item.brand || "").toLowerCase()} ${(item.model_name || item.title || "").toLowerCase()}`.trim();
      const auditImg = auditImageMap.get(`list-${item.id}`) || auditImageMap.get(modelKey);
      const matchedCat = item.catalog_id ? catalogItems.find((c) => c.id === item.catalog_id) : null;
      const rawImg = auditImg || item.image_url || matchedCat?.image_url || null;
      const verifiedImg = getVerifiedMachineryPhoto(item.brand, item.model_name, rawImg);

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
        images: (item as any).images && (item as any).images.length > 0 ? (item as any).images : (verifiedImg ? [verifiedImg] : []),
        description: item.notes,
      });
    }

    // Official Catalog Models
    for (const item of catalogItems) {
      const modelKey = `${(item.brand || "").toLowerCase()} ${(item.model_name || "").toLowerCase()}`.trim();
      const auditImg = auditImageMap.get(`cat-${item.id}`) || auditImageMap.get(modelKey);
      const rawImg = auditImg || item.image_url;
      const resolvedImg = getVerifiedMachineryPhoto(item.brand, item.model_name, rawImg);

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
        images: resolvedImg ? [resolvedImg] : [],
        officialSourceUrl: item.official_source_url,
        supplierName: item.supplier_name,
        description: item.description,
        provenanceSource: item.provenance_source,
        provenanceLicense: item.provenance_license,
      });
    }

    return list;
  }, [equipmentListings, catalogItems, auditImageMap]);

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
      // 1. Search filter
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

      // 2. Strict Location Filter (if user toggled strict filter)
      if (strictLocationOnly && userLocation.state !== "all") {
        const uState = userLocation.state.toLowerCase().trim();
        const uDist = (userLocation.district || "").toLowerCase().trim();
        const pState = (product.state || "").toLowerCase().trim();
        const pDist = (product.district || "").toLowerCase().trim();

        const stateMatch = pState && (pState.includes(uState) || uState.includes(pState));
        const distMatch = uDist && pDist && (pDist.includes(uDist) || uDist.includes(pDist));

        if (userLocation.district) {
          if (!distMatch && !stateMatch) return false;
        } else if (!stateMatch) {
          return false;
        }
      }

      // 3. Category filter
      if (selectedCategory !== "all" && !matchesCategory(product.category, selectedCategory)) {
        return false;
      }

      // 4. Brand filter
      if (selectedBrand !== "all" && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // 5. Deal type filter
      if (dealFilter === "rent" && product.dealType !== "rent") return false;
      if (dealFilter === "sale" && product.dealType !== "sale" && product.dealType !== "catalog") return false;

      // 6. Engine HP filter
      if (hpRange !== "all") {
        const hp = product.hpRating ?? 0;
        if (hpRange === "under_40" && (hp === 0 || hp >= 40)) return false;
        if (hpRange === "40_55" && (hp < 40 || hp > 55)) return false;
        if (hpRange === "55_75" && (hp < 55 || hp > 75)) return false;
        if (hpRange === "above_75" && hp < 75) return false;
      }

      // 7. Condition filter
      if (conditionFilter === "new" && product.condition !== "new") return false;
      if (conditionFilter === "used" && product.condition === "new") return false;

      // 8. Price filter
      if (minPrice && product.price != null && product.price < parseFloat(minPrice)) return false;
      if (maxPrice && product.price != null && product.price > parseFloat(maxPrice)) return false;

      // 9. Photo availability filter (prioritized via sorting, verified badge shown)
      if (verifiedPhotoOnly && (!product.hasVerifiedPhoto || !product.imageUrl)) return false;

      return true;
    });
  }, [
    unifiedProducts,
    searchQuery,
    strictLocationOnly,
    userLocation,
    selectedCategory,
    selectedBrand,
    dealFilter,
    hpRange,
    conditionFilter,
    minPrice,
    maxPrice,
    verifiedPhotoOnly,
  ]);

  // Count nearby matches for banner
  const nearbyCounts = useMemo(() => {
    if (userLocation.state === "all") return { district: 0, state: 0 };
    const uState = userLocation.state.toLowerCase().trim();
    const uDist = (userLocation.district || "").toLowerCase().trim();

    let districtCount = 0;
    let stateCount = 0;

    for (const p of filteredProducts) {
      const pState = (p.state || "").toLowerCase().trim();
      const pDist = (p.district || "").toLowerCase().trim();
      if (uDist && pDist && (pDist.includes(uDist) || uDist.includes(pDist))) {
        districtCount++;
      }
      if (pState && (pState.includes(uState) || uState.includes(pState))) {
        stateCount++;
      }
    }
    return { district: districtCount, state: stateCount };
  }, [filteredProducts, userLocation]);

  // Sort products prioritizing location proximity
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
          // Priority 1: Geographic proximity (Same District > Same State > Pan-India > Others)
          const locScoreA = getLocationScore(a, userLocation);
          const locScoreB = getLocationScore(b, userLocation);
          if (locScoreA !== locScoreB) {
            return locScoreB - locScoreA;
          }

          if (a.hasVerifiedPhoto && !b.hasVerifiedPhoto) return -1;
          if (b.hasVerifiedPhoto && !a.hasVerifiedPhoto) return 1;
          if (a.price && !b.price) return -1;
          if (b.price && !a.price) return 1;
          if (a.sourceType === "listing" && b.sourceType !== "listing") return -1;
          if (b.sourceType === "listing" && a.sourceType !== "listing") return 1;
          return a.title.localeCompare(b.title);
        });
    }
  }, [filteredProducts, sortBy, userLocation]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, userLocation, strictLocationOnly, selectedCategory, selectedBrand, dealFilter, hpRange, conditionFilter, minPrice, maxPrice, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery("");
    clearLocation();
    setSelectedCategory("all");
    setSelectedBrand("all");
    setDealFilter("all");
    setHpRange("all");
    setConditionFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (userLocation.state !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedBrand !== "all") count++;
    if (dealFilter !== "all") count++;
    if (hpRange !== "all") count++;
    if (conditionFilter !== "all") count++;
    if (minPrice || maxPrice) count++;
    if (searchQuery) count++;
    return count;
  }, [userLocation, selectedCategory, selectedBrand, dealFilter, hpRange, conditionFilter, minPrice, maxPrice, searchQuery]);

  const openContact = (product: UnifiedProduct) => {
    setContactTarget({
      name: product.sellerName,
      phone: product.sellerPhone,
      title: product.title,
      location: product.sellerLocation,
      sourceType: product.sourceType,
      listingId: product.listingId,
      catalogId: product.catalogId,
      brand: product.brand,
      modelName: product.modelName,
      officialSourceUrl: product.officialSourceUrl,
    });
    setContactTab(product.sellerPhone ? "direct" : "callback");
    setInquirySuccess(null);
    setInquiryError(null);
    setShowContactModal(true);
  };

  // Submit Callback Request (Scenario B)
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactTarget) return;
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      setInquiryError("Please enter your name and valid phone number.");
      return;
    }
    const cleanDigits = inquiryPhone.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      setInquiryError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setInquirySubmitting(true);
      setInquiryError(null);
      const res = await tradeInquiriesApi.submit({
        listing_type: contactTarget.sourceType === "catalog" ? "equipment_catalog" : "equipment_listing",
        listing_id: (contactTarget.sourceType === "catalog" ? contactTarget.catalogId : contactTarget.listingId) || 1,
        sender_name: inquiryName.trim(),
        sender_phone: inquiryPhone.trim(),
        sender_type: "farmer",
        inquiry_type: "callback",
        preferred_callback_time: preferredTime,
        message: `Callback requested for "${contactTarget.title}". Preferred time: ${preferredTime}`,
      } as any);

      setInquirySuccess({
        refId: res.id,
        status: res.status || "submitted",
        type: "Callback Request",
        message: `Callback scheduled! Our verified team / seller will call you at ${inquiryPhone} during ${preferredTime}.`,
      });
    } catch (err: any) {
      console.error("Failed to submit callback request:", err);
      setInquiryError(err.message || "Unable to save callback request. Please try again.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  // Submit Quotation Request (Scenario B)
  const handleQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactTarget) return;
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      setInquiryError("Please enter your name and contact phone number.");
      return;
    }
    const cleanDigits = inquiryPhone.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      setInquiryError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setInquirySubmitting(true);
      setInquiryError(null);
      const res = await tradeInquiriesApi.submit({
        listing_type: contactTarget.sourceType === "catalog" ? "equipment_catalog" : "equipment_listing",
        listing_id: (contactTarget.sourceType === "catalog" ? contactTarget.catalogId : contactTarget.listingId) || 1,
        sender_name: inquiryName.trim(),
        sender_phone: inquiryPhone.trim(),
        sender_type: "farmer",
        inquiry_type: "quotation",
        proposed_price: quotePrice ? parseFloat(quotePrice) : undefined,
        proposed_quantity: quoteQuantity ? parseFloat(quoteQuantity) : undefined,
        message: quoteMessage.trim() || `Quotation requested for "${contactTarget.title}"`,
      } as any);

      setInquirySuccess({
        refId: res.id,
        status: res.status || "submitted",
        type: "Quotation Request",
        message: `Quotation request registered! Reference ID #${res.id}. The seller / authorized distributor has received your enquiry.`,
      });
    } catch (err: any) {
      console.error("Failed to submit quotation request:", err);
      setInquiryError(err.message || "Failed to submit quotation request. Please check details and try again.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  // Open Smart Price Comparison
  const openPriceComparison = async (product: UnifiedProduct) => {
    setCompareProduct(product);
    setShowCompareModal(true);
    setCompareLoading(true);
    setCompareData(null);
    try {
      const res = await priceComparisonApi.compare({
        category: product.category,
        deal_type: product.dealType === "catalog" ? "sale" : product.dealType,
        price_unit: product.priceUnit || (product.dealType === "rent" ? "per hour" : "total price"),
        hp_rating: product.hpRating || undefined,
        brand: product.brand,
        model_name: product.modelName,
        target_id: product.id,
      });
      setCompareData(res);
    } catch (err) {
      console.error("Failed to load price comparison:", err);
    } finally {
      setCompareLoading(false);
    }
  };

  // Open Dealer Discovery
  const openDealersModal = async () => {
    setShowDealersModal(true);
    setDealersLoading(true);
    try {
      const data = await dealersApi.list({
        state: userLocation.state !== "all" ? userLocation.state : undefined,
        district: userLocation.district || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      });
      setDealersList(data);
    } catch (err) {
      console.error("Failed to load dealers:", err);
    } finally {
      setDealersLoading(false);
    }
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
    <div className="marketplace-root min-h-screen w-full max-w-none bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased" data-marketplace="true">
      {/* ─── 1. HEADER: CLEAN SINGLE-ROW AMAZON-INSPIRED HEADER ─────────────── */}
      <header className="sticky top-0 z-40 w-full max-w-none bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="w-full max-w-none px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between gap-3 sm:gap-4 h-16">
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
            <div ref={searchContainerRef} className="flex-1 max-w-4xl mx-2 md:mx-4 lg:mx-6 relative hidden sm:block">
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
              {/* Wishlist */}
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-rose-600 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md transition"
                title={`${wishlist.length} Saved in Wishlist`}
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : "text-stone-500"}`} />
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{wishlist.length}</span>
              </button>

              {/* Dealer Discovery CTA */}
              <button
                onClick={openDealersModal}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition cursor-pointer"
                title="Discover Verified Custom Hiring Centers and Machinery Sellers"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Nearby CHCs & Dealers</span>
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
        className="w-full max-w-none bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 overflow-x-auto scrollbar-none"
      >
        <div className="w-full max-w-none px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap py-1.5">
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
      <div className="w-full max-w-none px-3 sm:px-4 lg:px-6 py-5 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start w-full max-w-none">
          {/* ─── Left Sidebar: STRICT NEW FILTER ORDER ──────────────────────── */}
          {/* 1. Location (TOP)                                                 */}
          {/* 2. Category                                                       */}
          {/* 3. Brand                                                          */}
          {/* 4. Listing Type (Buy / Rent)                                      */}
          {/* 5. Price Range                                                    */}
          {/* 6. Condition                                                      */}
          <aside className="hidden lg:block w-[290px] xl:w-[310px] 2xl:w-[320px] shrink-0 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-5 sticky top-20">
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

            {/* ─── FILTER 1: LOCATION (ABSOLUTE TOP) ────────────────────────── */}
            <div className="space-y-3 relative" ref={locationPopoverRef}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Location</span>
                </span>
                {userLocation.state !== "all" && (
                  <button
                    onClick={clearLocation}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline"
                  >
                    All India
                  </button>
                )}
              </div>

              {/* Detected / Selected Location Card */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 flex items-center gap-1 tracking-wider">
                    <span>📍 YOUR LOCATION</span>
                  </span>
                  <p className="text-sm font-bold text-stone-900 dark:text-white mt-1">
                    {userLocation.state !== "all"
                      ? (userLocation.city && userLocation.city !== userLocation.state
                          ? `${userLocation.city}, ${userLocation.state}`
                          : userLocation.district && userLocation.district !== userLocation.state
                          ? `${userLocation.district}, ${userLocation.state}`
                          : userLocation.state)
                      : "All India"}
                  </p>

                  {/* GPS Verified Status or Manual Indicator */}
                  {userLocation.source === "gps" && userLocation.state !== "all" ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1.5 rounded-md bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
                      <span>GPS Verified ✓</span>
                    </div>
                  ) : userLocation.source === "manual" && userLocation.state !== "all" ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded-md bg-stone-200/80 dark:bg-stone-700/70 text-stone-700 dark:text-stone-300 text-[11px] font-medium">
                      <span>Manual Selection</span>
                    </div>
                  ) : null}
                </div>

                {/* Useful Error Message */}
                {locationError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-200 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{locationError}</span>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-0.5">
                  {/* Enable Location (GPS) button */}
                  {userLocation.source !== "gps" && (
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={detectingLocation}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
                    >
                      {detectingLocation ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Detecting GPS Location...</span>
                        </>
                      ) : (
                        <>
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>Enable Location</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* If already GPS verified, allow updating with spinner */}
                  {userLocation.source === "gps" && detectingLocation && (
                    <div className="py-1 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Updating GPS location...</span>
                    </div>
                  )}

                  {/* Change Location Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedManualState(userLocation.state !== "all" ? userLocation.state : "");
                        setSelectedManualDistrict(userLocation.district || "");
                        setSelectedManualCity(userLocation.city || "");
                        setShowLocationPopover(!showLocationPopover);
                      }}
                      className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition text-center shadow-2xs"
                    >
                      Change Location
                    </button>
                    {userLocation.state !== "all" && (
                      <button
                        type="button"
                        onClick={clearLocation}
                        className="px-2 py-1.5 text-xs font-medium text-stone-500 hover:text-emerald-700 dark:text-stone-400 transition"
                        title="Reset to All India"
                      >
                        All India
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Search & Selection Popover */}
              {showLocationPopover && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xl p-3.5 space-y-3.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Select Location (Manual)</span>
                    </span>
                    <button onClick={() => setShowLocationPopover(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search input for State, District, City or PIN */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={locationSearchInput}
                      onChange={(e) => setLocationSearchInput(e.target.value)}
                      placeholder="Search State, District or City..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Autocomplete Search Results */}
                  {locationSearchInput.trim() && searchedLocations.length > 0 && (
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1 border rounded-md border-stone-100 dark:border-stone-800 p-1">
                      {searchedLocations.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setManualLocation(item.state, item.district, item.city);
                            setLocationSearchInput("");
                          }}
                          className="w-full text-left p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between transition"
                        >
                          <span className="font-medium truncate">
                            {item.district ? `${item.district}, ${item.state}` : item.state}
                          </span>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">
                            {item.district ? "District" : "State"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cascading State, District & City Selectors */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 block mb-1">State</label>
                      <select
                        value={selectedManualState}
                        onChange={(e) => {
                          const st = e.target.value;
                          setSelectedManualState(st);
                          setSelectedManualDistrict("");
                          setSelectedManualCity("");
                        }}
                        className="w-full px-2.5 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="">-- Choose State --</option>
                        {Object.keys(INDIAN_LOCATIONS).sort().map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedManualState && INDIAN_LOCATIONS[selectedManualState] && (
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 block mb-1">District</label>
                        <select
                          value={selectedManualDistrict}
                          onChange={(e) => {
                            const dist = e.target.value;
                            setSelectedManualDistrict(dist);
                            if (!selectedManualCity) {
                              setSelectedManualCity(dist);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        >
                          <option value="">All Districts in {selectedManualState}</option>
                          {INDIAN_LOCATIONS[selectedManualState].map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedManualState && (
                      <div>
                        <label className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 block mb-1">City / Town</label>
                        <input
                          type="text"
                          value={selectedManualCity}
                          onChange={(e) => setSelectedManualCity(e.target.value)}
                          placeholder={selectedManualDistrict || "Enter city or town"}
                          className="w-full px-2.5 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-white transition"
                    >
                      Reset to All India
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedManualState) {
                          setManualLocation(selectedManualState, selectedManualDistrict, selectedManualCity);
                        } else {
                          clearLocation();
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold transition"
                    >
                      Apply Location
                    </button>
                  </div>
                </div>
              )}

              {/* Strict Local Filter Option */}
              {userLocation.state !== "all" && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-stone-300 pt-0.5">
                  <input
                    type="checkbox"
                    checked={strictLocationOnly}
                    onChange={(e) => setStrictLocationOnly(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700 rounded border-stone-300"
                  />
                  <span>Only show listings in {userLocation.city || userLocation.district || userLocation.state}</span>
                </label>
              )}
            </div>

            {/* ─── FILTER 2: CATEGORY ──────────────────────────────────────── */}
            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Category
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {CATEGORIES.map((cat) => (
                  <label key={cat.key} className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                    <input
                      type="radio"
                      name="sidebarCategory"
                      checked={selectedCategory === cat.key}
                      onChange={() => setSelectedCategory(cat.key)}
                      className="w-3.5 h-3.5 text-emerald-700 focus:ring-emerald-700"
                    />
                    <span className={selectedCategory === cat.key ? "font-bold text-emerald-800 dark:text-emerald-400" : ""}>
                      {cat.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ─── FILTER 3: BRAND ─────────────────────────────────────────── */}
            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
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

            {/* ─── FILTER 4: LISTING TYPE (BUY / RENT) ──────────────────────── */}
            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Listing Type (Buy / Rent)
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

            {/* ─── FILTER 5: PRICE RANGE ───────────────────────────────────── */}
            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Price Range (₹)
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

            {/* ─── FILTER 6: CONDITION ─────────────────────────────────────── */}
            <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
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
          </aside>

          {/* ─── Right Column: Results & Product Cards ──────────────────────── */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Location Banner (When location is active) */}
            {userLocation.state !== "all" && (
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Showing equipment prioritizing{" "}
                    <strong className="text-emerald-900 dark:text-emerald-200 font-bold">
                      {userLocation.city && userLocation.city !== userLocation.state
                        ? `${userLocation.city}, ${userLocation.state}`
                        : userLocation.district
                        ? `${userLocation.district}, ${userLocation.state}`
                        : userLocation.state}
                    </strong>
                    {nearbyCounts.district > 0 && ` (${nearbyCounts.district} listings in your district)`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStrictLocationOnly(!strictLocationOnly)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition border ${
                      strictLocationOnly
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white dark:bg-stone-800 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {strictLocationOnly ? "Showing Local Only" : "Filter Local Only"}
                  </button>
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="text-stone-500 hover:text-stone-800 underline text-[11px]"
                  >
                    View All India
                  </button>
                </div>
              </div>
            )}

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
                    <option value="relevance">Featured (Nearby First)</option>
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
                {userLocation.state !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <MapPin className="w-3 h-3 text-emerald-700" />
                    Location: {userLocation.city && userLocation.city !== userLocation.state ? `${userLocation.city}, ${userLocation.state}` : userLocation.district ? `${userLocation.district}, ${userLocation.state}` : userLocation.state}
                    <button onClick={clearLocation}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                )}
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
              <div className="marketplace-product-grid">
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
                  No matching agricultural products found in this area
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try broadening your location to All India, adjusting your search query, or clearing active filters.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={clearLocation}
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition"
                  >
                    Search All India
                  </button>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* Amazon-Style Grid Cards */
              <div className="marketplace-product-grid">
                {paginatedProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  const isLocal = userLocation.state !== "all" && product.state && 
                    (product.state.toLowerCase() === userLocation.state.toLowerCase());

                  return (
                    <div
                      key={product.id}
                      onClick={() => { setSelectedProduct(product); setSelectedImageIndex(0); }}
                      className={`group bg-white dark:bg-stone-900 rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
                        isLocal
                          ? "border-emerald-300 dark:border-emerald-800/80 shadow-xs"
                          : "border-stone-200 dark:border-stone-800 hover:border-stone-300 hover:shadow-md"
                      }`}
                    >
                      <div>
                        {/* Image Container with 4:3 aspect ratio */}
                        <div className="relative w-full aspect-[4/3] bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 flex items-center justify-center p-3 select-none overflow-hidden">
                          <ProductCardImage key={product.imageUrl || product.id} src={product.imageUrl} alt={product.title} />

                          {/* Top Left: Deal Badge */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
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
                            <span className="flex items-center gap-0.5 text-stone-600 dark:text-stone-400 shrink-0 font-medium">
                              <MapPin className="w-3 h-3 text-emerald-700" />
                              <span className="truncate max-w-[110px]">{product.district || product.state || "Pan-India"}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-3 pt-0 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-800 dark:text-stone-200 font-medium text-xs transition text-center"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPriceComparison(product);
                          }}
                          className="py-1.5 px-2 rounded-lg border border-emerald-700/30 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium text-xs hover:bg-emerald-100 transition flex items-center gap-1"
                          title="Compare Prices against verified offers"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Compare</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openContact(product);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1"
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
                      onClick={() => { setSelectedProduct(product); setSelectedImageIndex(0); }}
                      className="group bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3.5 hover:border-stone-300 hover:shadow-sm transition flex flex-col sm:flex-row items-center gap-4 cursor-pointer"
                    >
                      <div className="w-full sm:w-48 aspect-[4/3] bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 shrink-0 overflow-hidden relative flex items-center justify-center p-2">
                        <ProductCardImage key={product.imageUrl || product.id} src={product.imageUrl} alt={product.title} />
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
                          <span className="flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300">
                            <MapPin className="w-3 h-3 text-emerald-700" />
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
                              openPriceComparison(product);
                            }}
                            className="py-1.5 px-2.5 rounded-lg border border-emerald-700/30 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium text-xs hover:bg-emerald-100 transition flex items-center gap-1"
                            title="Compare Prices"
                          >
                            <Scale className="w-3 h-3" />
                            <span>Compare</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openContact(product);
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
      </div>

      {/* ─── 4. MOBILE FILTER DRAWER (STRICT FILTER ORDER) ──────────────────── */}
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
              {/* 1. Location */}
              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-stone-900 dark:text-white">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>📍 YOUR LOCATION</span>
                  </span>
                  {userLocation.state !== "all" && (
                    <button onClick={clearLocation} className="text-emerald-700 text-[11px] font-semibold">
                      Clear (All India)
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900 dark:text-white">
                    {userLocation.state !== "all"
                      ? (userLocation.city && userLocation.city !== userLocation.state
                          ? `${userLocation.city}, ${userLocation.state}`
                          : userLocation.district && userLocation.district !== userLocation.state
                          ? `${userLocation.district}, ${userLocation.state}`
                          : userLocation.state)
                      : "All India"}
                  </p>
                  {userLocation.source === "gps" && userLocation.state !== "all" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>GPS Verified ✓</span>
                    </span>
                  ) : userLocation.source === "manual" && userLocation.state !== "all" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium mt-1">
                      <span>Manual Selection</span>
                    </span>
                  ) : null}
                </div>

                {locationError && (
                  <div className="p-2 rounded bg-rose-50 text-rose-800 text-[11px] flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{locationError}</span>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  {userLocation.source !== "gps" && (
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={detectingLocation}
                      className="w-full py-1.5 px-3 rounded-md bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {detectingLocation ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Detecting GPS Location...</span>
                        </>
                      ) : (
                        <>
                          <Crosshair className="w-3 h-3" />
                          <span>Enable Location (GPS)</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-stone-500 uppercase">Manual State & District</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={userLocation.state}
                        onChange={(e) => {
                          const st = e.target.value;
                          if (st === "all") clearLocation();
                          else setManualLocation(st, "");
                        }}
                        className="w-full px-2 py-1.5 rounded-md border border-stone-200 text-xs bg-white dark:bg-stone-900"
                      >
                        <option value="all">All India</option>
                        {Object.keys(INDIAN_LOCATIONS).sort().map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>

                      {userLocation.state !== "all" && INDIAN_LOCATIONS[userLocation.state] ? (
                        <select
                          value={userLocation.district}
                          onChange={(e) => setManualLocation(userLocation.state, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-md border border-stone-200 text-xs bg-white dark:bg-stone-900"
                        >
                          <option value="">All Districts</option>
                          {INDIAN_LOCATIONS[userLocation.state].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="City/Town"
                          value={userLocation.city || ""}
                          disabled={userLocation.state === "all"}
                          onChange={(e) => setManualLocation(userLocation.state, userLocation.district, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-md border border-stone-200 text-xs bg-white dark:bg-stone-900 disabled:opacity-50"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Category */}
              <div>
                <span className="font-bold block mb-1.5">Category</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.labelEn}</option>
                  ))}
                </select>
              </div>

              {/* 3. Brand */}
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

              {/* 4. Listing Type */}
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

              {/* 5. Price Range */}
              <div>
                <span className="font-bold block mb-1.5">Price Range (₹)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                  />
                </div>
              </div>

              {/* 6. Condition */}
              <div>
                <span className="font-bold block mb-1.5">Condition</span>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs"
                >
                  <option value="all">All Conditions</option>
                  <option value="new">Brand New</option>
                  <option value="used">Used / Certified</option>
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
              {/* Image & Gallery */}
              <div className="space-y-2">
                <div className="w-full aspect-[4/3] bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-center p-4 overflow-hidden">
                  <ProductCardImage
                    src={
                      selectedProduct.images && selectedProduct.images.length > selectedImageIndex
                        ? selectedProduct.images[selectedImageIndex]
                        : selectedProduct.imageUrl
                    }
                    alt={selectedProduct.title}
                  />
                </div>
                {/* Thumbnails if multiple images exist */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedProduct.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-14 h-14 rounded-lg border overflow-hidden p-1 bg-white dark:bg-stone-800 shrink-0 transition ${
                          selectedImageIndex === idx
                            ? "border-emerald-600 ring-2 ring-emerald-500/20"
                            : "border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt={`${selectedProduct.title} ${idx + 1}`} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
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
                  <div className="text-stone-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{selectedProduct.sellerLocation}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      openContact(selectedProduct);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedProduct.sellerPhone ? "Contact Seller" : "Enquire / Callback"}</span>
                  </button>

                  <button
                    onClick={() => openPriceComparison(selectedProduct)}
                    className="py-2.5 px-3 rounded-lg border border-emerald-700/40 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    title="Compare Prices against authentic marketplace offers"
                  >
                    <Scale className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Compare Prices</span>
                  </button>

                  {isValidWebUrl(selectedProduct.officialSourceUrl) ? (
                    <a
                      href={selectedProduct.officialSourceUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs flex items-center justify-center"
                      title="View Verified Official Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : selectedProduct.officialSourceUrl ? (
                    <button
                      onClick={() => alert("Verified official website is currently unavailable or unverified for this listing.")}
                      className="p-2.5 rounded-lg border border-dashed border-stone-300 text-stone-400 text-xs flex items-center justify-center"
                      title="Official website unavailable"
                    >
                      <ExternalLink className="w-4 h-4 opacity-40" />
                    </button>
                  ) : null}
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

      {/* ─── 6. AUTHENTIC SELLER CONTACT & ENQUIRY MODAL ───────────────────────── */}
      {showContactModal && contactTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900 dark:text-white">Seller Contact & Inquiry</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Verified Data
                </span>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Product Summary */}
            <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800 text-xs space-y-1 border border-stone-100 dark:border-stone-700">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Equipment</span>
              <p className="font-semibold text-stone-900 dark:text-white">{contactTarget.title}</p>
              <div className="flex items-center justify-between text-stone-500 font-medium text-[11px] pt-0.5">
                <span>👤 {contactTarget.name}</span>
                <span>📍 {contactTarget.location}</span>
              </div>
            </div>

            {/* Mode Navigation Tabs */}
            <div className="flex border-b border-stone-200 dark:border-stone-700 text-xs">
              {contactTarget.phone && (
                <button
                  type="button"
                  onClick={() => setContactTab("direct")}
                  className={`flex-1 py-2 font-semibold text-center border-b-2 transition ${
                    contactTab === "direct"
                      ? "border-emerald-700 text-emerald-700 dark:text-emerald-400"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Direct Contact
                </button>
              )}
              <button
                type="button"
                onClick={() => setContactTab("callback")}
                className={`flex-1 py-2 font-semibold text-center border-b-2 transition ${
                  contactTab === "callback"
                    ? "border-emerald-700 text-emerald-700 dark:text-emerald-400"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                Request Callback
              </button>
              <button
                type="button"
                onClick={() => setContactTab("quote")}
                className={`flex-1 py-2 font-semibold text-center border-b-2 transition ${
                  contactTab === "quote"
                    ? "border-emerald-700 text-emerald-700 dark:text-emerald-400"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                Request Quotation
              </button>
            </div>

            {/* Submission Status Alerts */}
            {inquirySuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{inquirySuccess.type} Registered Successfully!</span>
                </div>
                <p className="text-[11px] leading-relaxed">{inquirySuccess.message}</p>
                <div className="pt-1 text-[10px] text-emerald-700 font-mono">
                  Official Tracking Reference: #INQ-{inquirySuccess.refId} • Status: {inquirySuccess.status.toUpperCase()}
                </div>
              </div>
            )}

            {inquiryError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{inquiryError}</span>
              </div>
            )}

            {/* Scenario A: Direct Contact (When phone number exists) */}
            {contactTab === "direct" && contactTarget.phone && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase block font-bold">Verified Phone Number</span>
                  <p className="text-base font-bold text-stone-900 dark:text-white tracking-wide">
                    {contactTarget.phone}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    ✓ Preserved authentic owner / CHC contact
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={`tel:${cleanPhoneForTel(contactTarget.phone)}`}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Seller</span>
                  </a>

                  <a
                    href={`https://wa.me/${cleanPhoneForWa(contactTarget.phone)}?text=${encodeURIComponent(`Hello ${contactTarget.name}, I found your listing "${contactTarget.title}" on KisaanBuddy. Is this equipment currently available?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {isValidWebUrl(contactTarget.officialSourceUrl) && (
                  <a
                    href={contactTarget.officialSourceUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                    <span>Visit Verified Official Website</span>
                  </a>
                )}
              </div>
            )}

            {/* Scenario B: Request a Callback */}
            {contactTab === "callback" && (
              <form onSubmit={handleCallbackSubmit} className="space-y-3 text-xs">
                {!contactTarget.phone && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-[11px] leading-tight flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      Direct phone number is not publicly listed for this equipment. Submit a Callback Request and the seller / authorized team will call you back.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Your Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="e.g. 9826154321"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Preferred Callback Window *
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="Morning (9:00 AM – 12:00 PM)">Morning (9:00 AM – 12:00 PM)</option>
                    <option value="Afternoon (12:00 PM – 4:00 PM)">Afternoon (12:00 PM – 4:00 PM)</option>
                    <option value="Evening (4:00 PM – 7:00 PM)">Evening (4:00 PM – 7:00 PM)</option>
                    <option value="Anytime (Immediate when available)">Anytime (Immediate when available)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={inquirySubmitting}
                  className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  {inquirySubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Server...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Request Official Callback</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Scenario B: Request a Quotation */}
            {contactTab === "quote" && (
              <form onSubmit={handleQuotationSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Gurpreet Singh"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Your Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="e.g. 9872011990"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Target Budget (₹) (Optional)
                    </label>
                    <input
                      type="number"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      placeholder="e.g. 800"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Required Days / Hours
                    </label>
                    <input
                      type="number"
                      value={quoteQuantity}
                      onChange={(e) => setQuoteQuantity(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Requirements & Attachment Specifications
                  </label>
                  <textarea
                    rows={2}
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    placeholder="e.g. Need machine with rotavator attachment for 10 acres tillage in Sehore district."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={inquirySubmitting}
                  className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  {inquirySubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Quotation Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Official Quotation</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Official Website verification link */}
            {isValidWebUrl(contactTarget.officialSourceUrl) ? (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <a
                  href={contactTarget.officialSourceUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline flex items-center justify-center gap-1 font-medium"
                >
                  <span>Official Website: {new URL(contactTarget.officialSourceUrl!).hostname}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : contactTarget.officialSourceUrl ? (
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-500 text-center">
                Official manufacturer website link currently unavailable. Prioritizing direct callback / quotation.
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ─── 8. SMART PRICE COMPARISON MODAL ───────────────────────────────────── */}
      {showCompareModal && compareProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">Smart Price Comparison</h3>
              </div>
              <button onClick={() => setShowCompareModal(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Product Context */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 text-xs border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Current Selection</span>
                <span className="font-bold text-stone-900 dark:text-white text-sm">{compareProduct.title}</span>
                <span className="text-[11px] text-stone-500 block">
                  {compareProduct.brand} • {compareProduct.category.replace("_", " ")} {compareProduct.hpRating ? `• ${compareProduct.hpRating} HP` : ""}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-stone-400 block">Listed Rate</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                  {compareProduct.price != null
                    ? `₹${compareProduct.price.toLocaleString("en-IN")} /${(compareProduct.priceUnit || "day").replace("per ", "")}`
                    : "Indicative Spec"}
                </span>
              </div>
            </div>

            {compareLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                <span className="text-xs text-stone-500">Querying genuine marketplace comparison database...</span>
              </div>
            ) : compareData && !compareData.is_sufficient ? (
              /* Insufficient comparison data state */
              <div className="p-6 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-2.5">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-stone-900 dark:text-white">Comparison Data Insufficient</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Only 1 verified listing currently exists for this exact specification and pricing basis in our database. KisaanBuddy strictly uses genuine marketplace data and does not simulate artificial competitor prices.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowCompareModal(false);
                      openContact(compareProduct);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition"
                  >
                    Contact Current Seller Directly
                  </button>
                </div>
              </div>
            ) : compareData ? (
              <div className="space-y-4">
                {/* Highlight Cards: Lowest Price and Best Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {compareData.lowest_offer && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                        <span>🏷️ Lowest Listed Price</span>
                      </span>
                      <p className="text-lg font-bold text-stone-900 dark:text-white">
                        ₹{compareData.lowest_offer.price.toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-normal text-stone-500">
                          /{compareData.lowest_offer.price_unit.replace("per ", "")}
                        </span>
                      </p>
                      <p className="text-[11px] font-semibold text-stone-800 dark:text-stone-200">
                        {compareData.lowest_offer.title}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        📍 {compareData.lowest_offer.seller_location} • Seller: {compareData.lowest_offer.seller_name}
                      </p>
                    </div>
                  )}

                  {compareData.best_value_offer && (
                    <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
                      <span className="text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1">
                        <span>⭐ Best Value Analysis</span>
                      </span>
                      <p className="text-lg font-bold text-stone-900 dark:text-white">
                        ₹{compareData.best_value_offer.price.toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-normal text-stone-500">
                          /{compareData.best_value_offer.price_unit.replace("per ", "")}
                        </span>
                      </p>
                      <p className="text-[11px] font-semibold text-stone-800 dark:text-stone-200">
                        {compareData.best_value_offer.title}
                      </p>
                      <p className="text-[10px] text-blue-800 dark:text-blue-300 font-medium">
                        {compareData.best_value_reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Other Available Offers Table / List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                      Genuine Comparable Offers ({compareData.comparable_offers.length})
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Sorted by verified price
                    </span>
                  </div>

                  <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden text-xs">
                    {compareData.comparable_offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-3 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 dark:text-white">{offer.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                offer.match_type === "exact_model"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-stone-100 text-stone-600"
                              }`}
                            >
                              {offer.match_type === "exact_model" ? "Exact Model" : "Spec Alternative"}
                            </span>
                            {offer.includes_operator && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                                Operator Included
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500">
                            {offer.condition.toUpperCase()} • {offer.hp_rating ? `${offer.hp_rating} HP • ` : ""}
                            📍 {offer.seller_location} ({offer.seller_name})
                          </p>
                          <p className="text-[10px] text-stone-400">
                            Warranty: {offer.warranty_info} • Delivery: {offer.delivery_info}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-bold text-stone-900 dark:text-white">
                              ₹{offer.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-stone-500 block">
                              /{offer.price_unit.replace("per ", "")}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setShowCompareModal(false);
                              const matched = unifiedProducts.find((p) => p.id === offer.id);
                              if (matched) openContact(matched);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition"
                          >
                            Contact
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ─── 9. DEALER & CHC DISCOVERY MODAL ───────────────────────────────────── */}
      {showDealersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  Verified Custom Hiring Centers & Machinery Sellers
                </h3>
              </div>
              <button onClick={() => setShowDealersModal(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Directory of authentic Custom Hiring Centers (CHCs), farmer machinery cooperatives, and verified sellers across India.
            </p>

            {dealersLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                <span className="text-xs text-stone-500">Loading verified CHCs & dealers...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {dealersList.map((dealer) => (
                  <div
                    key={dealer.id}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 space-y-2 hover:border-emerald-600/50 transition"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white text-xs block">
                          {dealer.seller_name}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          {dealer.seller_type}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                        {dealer.listings_count} Listing{dealer.listings_count > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 space-y-0.5">
                      <p>📍 {dealer.district}, {dealer.state}</p>
                      {dealer.sample_equipment.length > 0 && (
                        <p className="truncate text-stone-400 text-[10px]">
                          Inventory: {dealer.sample_equipment.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      {dealer.phone ? (
                        <>
                          <a
                            href={`tel:${cleanPhoneForTel(dealer.phone)}`}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] text-center flex items-center justify-center gap-1 transition"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhoneForWa(dealer.phone)}?text=${encodeURIComponent(`Hello ${dealer.seller_name}, I am contacting you from KisaanBuddy regarding your machinery inventory.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] text-center flex items-center justify-center gap-1 transition"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setShowDealersModal(false);
                            // Find any item from this dealer to open enquiry
                            const matched = unifiedProducts.find((p) => p.sellerName === dealer.seller_name);
                            if (matched) openContact(matched);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-[11px] text-center transition"
                        >
                          Request Callback / Quote
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    placeholder="e.g. Bihar, Madhya Pradesh"
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
                    placeholder="e.g. Samastipur, Sehore"
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
