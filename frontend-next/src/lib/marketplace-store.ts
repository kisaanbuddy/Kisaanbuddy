import marketplaceData from "./data/marketplace-data.json";

export interface EquipmentCatalogItem {
  id: number;
  manufacturer: string;
  brand: string;
  model_name: string;
  category: string;
  subcategory?: string | null;
  hp_rating?: number | null;
  working_width_mm?: number | null;
  capacity?: string | null;
  fuel_type?: string | null;
  pto_hp?: number | null;
  pto_rpm?: number | null;
  lifting_capacity_kg?: number | null;
  weight_kg?: number | null;
  compatible_tractor_hp?: string | null;
  specifications_json?: string | null;
  description?: string | null;
  official_source_url?: string | null;
  source_verification_date?: string | null;
  image_url?: string | null;
  provenance_source?: string | null;
  provenance_license?: string | null;
  is_verified?: number | boolean;
  is_reference_only?: number | boolean;
  is_active?: number | boolean;
  indicative_price?: number | null;
  supplier_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EquipmentListingItem {
  id: number;
  user_id?: number | null;
  catalog_id?: number | null;
  listing_type: "rent" | "sale";
  title: string;
  brand: string;
  model_name: string;
  category: string;
  hp_rating?: number | null;
  condition: string;
  year_of_manufacture?: number | null;
  operating_hours?: number | null;
  price: number;
  price_unit: string;
  security_deposit?: number | null;
  includes_operator: boolean | number;
  owner_name: string;
  owner_phone?: string | null;
  owner_consent_shared: boolean | number;
  state: string;
  district: string;
  tehsil_or_block?: string | null;
  village?: string | null;
  pincode?: string | null;
  availability_status: "available" | "under_rent" | "sold" | "inactive";
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProduceListingItem {
  id: number;
  user_id?: number | null;
  crop_name: string;
  variety?: string | null;
  category: string;
  quantity: number;
  quantity_unit: string;
  asking_price: number;
  price_unit: string;
  is_negotiable: boolean | number;
  harvest_date?: string | null;
  expected_dispatch_date?: string | null;
  grade_or_quality: string;
  moisture_pct?: number | null;
  farmer_name: string;
  farmer_phone?: string | null;
  contact_consent_verified: boolean | number;
  state: string;
  district: string;
  mandi_nearby?: string | null;
  delivery_option: string;
  farmer_phone_masked?: string | null;
  village_or_tehsil?: string | null;
  last_confirmation_date?: string | null;
  availability_status: "available" | "under_negotiation" | "sold_out" | "inactive";
  verification_status: string;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MarketPriceItem {
  id: number;
  commodity: string;
  variety?: string | null;
  state: string;
  district: string;
  market_center: string;
  arrival_date: string;
  arrival_quantity?: number | null;
  arrival_unit?: string | null;
  min_price: number;
  max_price: number;
  modal_price: number;
  source_name: string;
  source_url?: string | null;
}

export interface ImportSourceItem {
  id: number;
  source_name: string;
  source_slug: string;
  source_type: string;
  base_url?: string | null;
  auth_type: string;
  commercial_reuse_terms?: string | null;
  update_frequency: string;
  last_imported_at?: string | null;
  records_count: number;
  is_active: boolean | number;
}

// In-memory store initialized from exported data
const equipmentCatalog: EquipmentCatalogItem[] = (marketplaceData.equipment_catalog || []) as EquipmentCatalogItem[];
const equipmentListings: EquipmentListingItem[] = (marketplaceData.equipment_listings || []) as EquipmentListingItem[];
const produceListings: ProduceListingItem[] = (marketplaceData.produce_listings || []) as ProduceListingItem[];
const marketPrices: MarketPriceItem[] = (marketplaceData.market_prices || []) as MarketPriceItem[];
const importSources: ImportSourceItem[] = (marketplaceData.import_sources || []) as ImportSourceItem[];
const legacyListings = (marketplaceData.legacy_listings || []) as any[];

export function getEquipmentCatalog(params: {
  category?: string;
  brand?: string;
  supplier?: string;
  min_hp?: number;
  max_hp?: number;
  search?: string;
  page?: number;
  limit?: number;
}) {
  let list = [...equipmentCatalog];

  if (params.category && params.category !== "all") {
    list = list.filter((item) => item.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params.brand && params.brand !== "all") {
    list = list.filter((item) => item.brand.toLowerCase() === params.brand!.toLowerCase());
  }
  if (params.supplier && params.supplier !== "all") {
    list = list.filter((item) =>
      item.supplier_name?.toLowerCase().includes(params.supplier!.toLowerCase())
    );
  }
  if (params.min_hp !== undefined && params.min_hp !== null) {
    list = list.filter((item) => item.hp_rating != null && item.hp_rating >= params.min_hp!);
  }
  if (params.max_hp !== undefined && params.max_hp !== null) {
    list = list.filter((item) => item.hp_rating != null && item.hp_rating <= params.max_hp!);
  }
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.model_name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }

  // Sort: category asc, brand asc, model_name asc
  list.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
    return a.model_name.localeCompare(b.model_name);
  });

  const total = list.length;
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(250, params.limit || 24));
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);

  return { total, page, limit, items };
}

export function getEquipmentCatalogItem(id: number) {
  return equipmentCatalog.find((item) => item.id === id) || null;
}

export function getEquipmentCategories() {
  const counts: Record<string, number> = {};
  for (const item of equipmentCatalog) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }
  return Object.entries(counts).map(([category, count]) => ({ category, count }));
}

export function getEquipmentBrands() {
  const counts: Record<string, number> = {};
  for (const item of equipmentCatalog) {
    counts[item.brand] = (counts[item.brand] || 0) + 1;
  }
  return Object.entries(counts).map(([brand, count]) => ({ brand, count }));
}

export function getEquipmentListings(params: {
  listing_type?: string;
  category?: string;
  brand?: string;
  state?: string;
  district?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  let list = [...equipmentListings];

  if (params.listing_type && params.listing_type !== "all") {
    list = list.filter((item) => item.listing_type === params.listing_type);
  }
  if (params.category && params.category !== "all") {
    list = list.filter((item) => item.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params.brand && params.brand !== "all") {
    list = list.filter((item) => item.brand.toLowerCase() === params.brand!.toLowerCase());
  }
  if (params.state && params.state !== "all") {
    list = list.filter((item) => item.state.toLowerCase() === params.state!.toLowerCase());
  }
  if (params.district && params.district.trim()) {
    list = list.filter((item) => item.district.toLowerCase().includes(params.district!.toLowerCase().trim()));
  }
  if (params.status && params.status !== "all") {
    list = list.filter((item) => item.availability_status === params.status);
  }
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.model_name.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
    );
  }

  list.sort((a, b) => b.id - a.id);

  const total = list.length;
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(250, params.limit || 50));
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);

  return { total, page, limit, items };
}

export function addEquipmentListing(data: any): EquipmentListingItem {
  const newId = equipmentListings.length > 0 ? Math.max(...equipmentListings.map((x) => x.id)) + 1 : 1;
  const item: EquipmentListingItem = {
    id: newId,
    catalog_id: data.catalog_id || null,
    listing_type: data.listing_type || "rent",
    title: data.title || `${data.brand || ""} ${data.model_name || ""}`.trim(),
    brand: data.brand || "General",
    model_name: data.model_name || "Machine",
    category: data.category || "other_implements",
    hp_rating: data.hp_rating ? parseFloat(data.hp_rating) : null,
    condition: data.condition || "good",
    year_of_manufacture: data.year_of_manufacture ? parseInt(data.year_of_manufacture) : null,
    operating_hours: data.operating_hours ? parseInt(data.operating_hours) : null,
    price: parseFloat(data.price) || 0,
    price_unit: data.price_unit || "per hour",
    security_deposit: data.security_deposit ? parseFloat(data.security_deposit) : null,
    includes_operator: Boolean(data.includes_operator),
    owner_name: data.owner_name || "Owner",
    owner_phone: data.owner_phone || null,
    owner_consent_shared: true,
    state: data.state || "India",
    district: data.district || "Local",
    tehsil_or_block: data.tehsil_or_block || null,
    village: data.village || null,
    pincode: data.pincode || null,
    availability_status: "available",
    notes: data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  equipmentListings.unshift(item);
  return item;
}

export function getProduceListings(params: {
  crop_name?: string;
  state?: string;
  district?: string;
  min_quantity?: number;
  status?: string;
  page?: number;
  limit?: number;
}) {
  let list = [...produceListings];

  if (params.crop_name && params.crop_name !== "all") {
    list = list.filter((item) => item.crop_name.toLowerCase().includes(params.crop_name!.toLowerCase()));
  }
  if (params.state && params.state !== "all") {
    list = list.filter((item) => item.state.toLowerCase() === params.state!.toLowerCase());
  }
  if (params.district && params.district.trim()) {
    list = list.filter((item) => item.district.toLowerCase().includes(params.district!.toLowerCase().trim()));
  }
  if (params.min_quantity !== undefined && params.min_quantity !== null) {
    list = list.filter((item) => item.quantity >= params.min_quantity!);
  }
  if (params.status && params.status !== "all") {
    list = list.filter((item) => item.availability_status === params.status);
  }

  list.sort((a, b) => b.id - a.id);

  const total = list.length;
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(250, params.limit || 50));
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);

  return { total, page, limit, items };
}

export function addProduceListing(data: any): ProduceListingItem {
  const newId = produceListings.length > 0 ? Math.max(...produceListings.map((x) => x.id)) + 1 : 1;
  const item: ProduceListingItem = {
    id: newId,
    crop_name: data.crop_name || "Produce",
    variety: data.variety || null,
    category: data.category || "cereal",
    quantity: parseFloat(data.quantity) || 1,
    quantity_unit: data.quantity_unit || "quintal",
    asking_price: parseFloat(data.asking_price) || 0,
    price_unit: data.price_unit || "per quintal",
    is_negotiable: Boolean(data.is_negotiable),
    harvest_date: data.harvest_date || null,
    expected_dispatch_date: data.expected_dispatch_date || null,
    grade_or_quality: data.grade_or_quality || "FAQ",
    moisture_pct: data.moisture_pct ? parseFloat(data.moisture_pct) : null,
    farmer_name: data.farmer_name || "Farmer",
    farmer_phone: data.farmer_phone || null,
    contact_consent_verified: true,
    state: data.state || "India",
    district: data.district || "Local",
    mandi_nearby: data.mandi_nearby || null,
    delivery_option: data.delivery_option || "Farm Gate Pickup",
    availability_status: "available",
    verification_status: "self_declared",
    notes: data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  produceListings.unshift(item);
  return item;
}

export function getMarketPrices(params: { commodity?: string; state?: string; limit?: number }) {
  let list = [...marketPrices];
  if (params.commodity && params.commodity !== "all") {
    list = list.filter((item) => item.commodity.toLowerCase().includes(params.commodity!.toLowerCase()));
  }
  if (params.state && params.state !== "all") {
    list = list.filter((item) => item.state.toLowerCase() === params.state!.toLowerCase());
  }
  const limit = params.limit || 20;
  return list.slice(0, limit);
}

export function getImportSources() {
  return [...importSources];
}

export function getLegacyListings(params?: { listing_type?: string; category?: string; crop?: string; district?: string }) {
  let list = [...legacyListings];
  if (params?.listing_type) list = list.filter((item) => item.listing_type === params.listing_type);
  if (params?.category) list = list.filter((item) => item.category === params.category);
  if (params?.crop) list = list.filter((item) => item.crop?.toLowerCase().includes(params.crop!.toLowerCase()));
  if (params?.district) list = list.filter((item) => item.district?.toLowerCase().includes(params.district!.toLowerCase()));
  return list;
}

export function addLegacyListing(data: any) {
  const newId = legacyListings.length > 0 ? Math.max(...legacyListings.map((x: any) => x.id || 0)) + 1 : 1;
  const item = {
    id: newId,
    ...data,
    created_at: new Date().toISOString(),
  };
  legacyListings.unshift(item);
  return item;
}

let buyerRequirementsStore: any[] = ((marketplaceData as any).buyer_requirements || []);
let governmentProcurementStore: any[] = ((marketplaceData as any).government_procurement || []);

export function getBuyerRequirements(params?: {
  commodity?: string;
  state?: string;
  district?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  let list = [...buyerRequirementsStore];
  if (params?.commodity && params.commodity !== "all") {
    list = list.filter((i) => i.commodity.toLowerCase().includes(params.commodity!.toLowerCase()));
  }
  if (params?.state && params.state !== "all") {
    list = list.filter((i) => (i.buyer_location_state || i.state).toLowerCase() === params.state!.toLowerCase());
  }
  if (params?.district && params.district !== "all") {
    list = list.filter((i) => (i.buyer_location_district || i.district).toLowerCase().includes(params.district!.toLowerCase()));
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((i) =>
      i.commodity.toLowerCase().includes(q) ||
      (i.variety && i.variety.toLowerCase().includes(q)) ||
      i.buyer_name.toLowerCase().includes(q) ||
      (i.buyer_location_district || i.district).toLowerCase().includes(q)
    );
  }
  const total = list.length;
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);
  return { total, page, limit, items };
}

export function addBuyerRequirement(data: any) {
  const newId = buyerRequirementsStore.length > 0 ? Math.max(...buyerRequirementsStore.map((x: any) => x.id || 0)) + 1 : 1;
  const item = {
    id: newId,
    ...data,
    buyer_location_state: data.buyer_location_state || data.state,
    buyer_location_district: data.buyer_location_district || data.district,
    quality_specifications: data.quality_specifications || data.quality_requirements,
    status: data.status || "open",
    is_active: true,
    is_verified: true,
    source: "KisaanBuddy verified buyer requirement",
    created_at: new Date().toISOString(),
  };
  buyerRequirementsStore.unshift(item);
  return item;
}

export function getGovernmentProcurement(params?: {
  crop_name?: string;
  state?: string;
  district?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  let list = [...governmentProcurementStore];
  if (params?.crop_name && params.crop_name !== "all") {
    list = list.filter((i) => i.crop_name.toLowerCase().includes(params.crop_name!.toLowerCase()));
  }
  if (params?.state && params.state !== "all") {
    list = list.filter((i) => i.state.toLowerCase() === params.state!.toLowerCase());
  }
  if (params?.district && params.district !== "all") {
    list = list.filter((i) => i.district.toLowerCase().includes(params.district!.toLowerCase()));
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((i) =>
      i.crop_name.toLowerCase().includes(q) ||
      (i.procurement_centre_name || i.procurement_center).toLowerCase().includes(q) ||
      i.nodal_agency.toLowerCase().includes(q) ||
      i.district.toLowerCase().includes(q)
    );
  }
  const total = list.length;
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);
  return {
    total,
    page,
    limit,
    disclaimer: "Government procurement is conducted exclusively at designated state centers for registered farmers under statutory MSP rules. KisaanBuddy does not promise eligibility or procurement acceptance.",
    items,
  };
}

export function confirmProduceListingStock(id: number): { id: number; message: string; last_confirmation_date: string } | null {
  const item = produceListings.find((x) => x.id === id);
  if (!item) return null;
  const today = new Date().toISOString().split("T")[0];
  item.last_confirmation_date = today;
  item.updated_at = new Date().toISOString();
  return {
    id: item.id,
    message: "Stock and price confirmed successfully.",
    last_confirmation_date: today,
  };
}

export function updateProduceListingStatus(id: number, status: string): { id: number; availability_status: string } | null {
  const item = produceListings.find((x) => x.id === id);
  if (!item) return null;
  item.availability_status = status as any;
  item.updated_at = new Date().toISOString();
  return {
    id: item.id,
    availability_status: item.availability_status,
  };
}

export function getProduceListingById(id: number): ProduceListingItem | null {
  return produceListings.find((x) => x.id === id) || null;
}

