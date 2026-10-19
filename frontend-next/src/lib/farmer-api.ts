/**
 * Typed API client for the Farmer Profile system.
 * All requests are authenticated via the existing HttpOnly session cookie.
 */
import { fetchWithAuth } from "@/lib/auth";

const BASE = "/api/farmer";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AreaUnit = "acre" | "hectare" | "bigha" | "other";

export type FarmerProfile = {
  id: number;
  user_id: number;
  village_name?: string | null;
  block_name?: string | null;
  district_name?: string | null;
  state_name?: string | null;
  pin_code?: string | null;
  gps_lat?: number | null;
  gps_lon?: number | null;
  experience_years?: number;
  primary_crop?: string | null;
  land_holding_acres?: number;
  land_ownership?: string | null;
  has_irrigation?: boolean;
  has_tractor?: boolean;
  equipment_list?: string | null;
  preferred_language?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Farm = {
  id: number;
  user_id: number;
  name: string;
  location_text?: string | null;
  village_name?: string | null;
  district_name?: string | null;
  state_name?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type FarmerField = {
  id: number;
  user_id: number;
  field_name?: string | null;
  acreage?: number | null;
  area_unit?: AreaUnit | null;
  soil_type?: string | null;
  current_crop?: string | null;
  crop_variety?: string | null;
  sowing_date?: string | null;
  expected_harvest?: string | null;
  irrigation_type?: string | null;
  water_source?: string | null;
  season?: string | null;
  previous_crop?: string | null;
  location_text?: string | null;
  farm_id?: number | null;
  notes?: string | null;
  polygon_geojson?: string | null;
};

export type SoilTest = {
  id: number;
  user_id: number;
  field_id?: number | null;
  test_date: string;
  lab_name?: string | null;
  soil_type?: string | null;
  soil_ph?: number | null;
  nitrogen_kg_ha?: number | null;
  phosphorus_kg_ha?: number | null;
  potassium_kg_ha?: number | null;
  organic_carbon_pct?: number | null;
  ec_ds_m?: number | null;
  is_verified?: boolean;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RecommendationStatus = "pending" | "completed" | "not_applicable" | "postponed";
export type RecommendationCategory = "irrigation" | "fertilizer" | "pest" | "disease" | "harvest" | "next_season" | "general";

export type Recommendation = {
  id: number;
  user_id: number;
  field_id?: number | null;
  title: string;
  explanation: string;
  crop_name?: string | null;
  reason?: string | null;
  data_used?: string | null;
  recommended_action: string;
  date_window?: string | null;
  confidence?: string | null;
  source?: string | null;
  category: RecommendationCategory;
  status: RecommendationStatus;
  status_updated_at?: string | null;
  created_at?: string | null;
};

export type FarmActivity = {
  id: number;
  user_id: number;
  field_id?: number | null;
  crop_cycle_id?: number | null;
  activity_date: string;
  activity_type: string;
  title: string;
  category: "activity" | "expense" | "income";
  amount?: number | null;
  quantity?: number | null;
  unit?: string | null;
  labour_count?: number | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type FarmTaskPriority = "low" | "medium" | "high" | "urgent";
export type FarmTaskStatus = "pending" | "completed" | "skipped";
export type FarmTaskCategory =
  | "irrigation"
  | "fertilizer"
  | "pesticide"
  | "soil_test"
  | "harvest"
  | "scouting"
  | "buyer_followup"
  | "general";

export type FarmTask = {
  id: number;
  user_id: number;
  field_id?: number | null;
  title: string;
  description?: string | null;
  category: FarmTaskCategory;
  priority: FarmTaskPriority;
  status: FarmTaskStatus;
  due_date: string;
  completed_at?: string | null;
  is_ai_recommended?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type FarmTaskSummary = {
  total_pending: number;
  due_today: number;
  overdue: number;
  upcoming_7_days: number;
  completed_recent: number;
};

export type MarketplaceListing = {
  id: number;
  user_id?: number | null;
  listing_type: "buy" | "sell";
  category: string;
  crop_or_item: string;
  variety?: string | null;
  quantity?: number | null;
  quantity_unit?: string | null;
  price?: number | null;
  price_unit?: string | null;
  organization_name: string;
  contact_person?: string | null;
  contact_phone?: string | null;
  district: string;
  state: string;
  pincode?: string | null;
  verification_status: string;
  delivery_terms?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at?: string | null;
};

export type EquipmentCatalogItem = {
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
  indicative_price?: number | null;
  supplier_name?: string | null;
  provenance_source: string;
  provenance_license: string;
  is_verified: boolean;
  is_reference_only: boolean;
  is_active: boolean;
  created_at?: string | null;
};

export type EquipmentListingItem = {
  id: number;
  user_id?: number | null;
  catalog_id?: number | null;
  listing_type: "rent" | "sale";
  title: string;
  brand: string;
  model_name: string;
  category: string;
  hp_rating?: number | null;
  condition: "new" | "excellent" | "good" | "fair";
  year_of_manufacture?: number | null;
  operating_hours?: number | null;
  price: number;
  price_unit: string;
  security_deposit?: number | null;
  includes_operator: boolean;
  owner_name: string;
  owner_phone?: string | null;
  owner_consent_shared: boolean;
  state: string;
  district: string;
  tehsil_or_block?: string | null;
  village?: string | null;
  pincode?: string | null;
  availability_status: "available" | "booked" | "under_maintenance" | "sold" | "inactive";
  notes?: string | null;
  created_at?: string | null;
};

export type ProduceListingItem = {
  id: number;
  user_id?: number | null;
  crop_name: string;
  variety?: string | null;
  category: string;
  quantity: number;
  quantity_unit: string;
  asking_price: number;
  price_unit: string;
  is_negotiable: boolean;
  harvest_date?: string | null;
  expected_dispatch_date?: string | null;
  grade_or_quality: string;
  moisture_pct?: number | null;
  farmer_name: string;
  farmer_phone?: string | null;
  contact_consent_verified: boolean;
  state: string;
  district: string;
  mandi_nearby?: string | null;
  delivery_option: string;
  availability_status: "available" | "under_negotiation" | "sold_out" | "inactive";
  verification_status: string;
  notes?: string | null;
  farmer_phone_masked?: string | null;
  village_or_tehsil?: string | null;
  photo_urls?: string[] | null;
  last_confirmation_date?: string | null;
  source_origin?: string | null;
  created_at?: string | null;
};

export type BuyerRequirementItem = {
  id: number;
  user_id?: number | null;
  commodity: string;
  variety?: string | null;
  required_quantity: number;
  quantity_unit: string;
  expected_price_min?: number | null;
  expected_price_max?: number | null;
  price_unit: string;
  buyer_name: string;
  buyer_type: string;
  buyer_phone_masked?: string | null;
  buyer_location_state: string;
  buyer_location_district: string;
  delivery_destination?: string | null;
  quality_specifications?: string | null;
  max_moisture_pct?: number | null;
  target_procurement_date?: string | null;
  offer_expiry_date: string;
  verification_status: string;
  is_verified: boolean;
  source: string;
  original_offer_url?: string | null;
  notes?: string | null;
  is_active: boolean;
  status: "open" | "fulfilled" | "expired" | "cancelled";
  created_at?: string | null;
  updated_at?: string | null;
};

export type GovernmentProcurementItem = {
  id: number;
  crop_name: string;
  variety?: string | null;
  procurement_season: string;
  state: string;
  district: string;
  procurement_centre_name: string;
  nodal_agency: string;
  msp_rate_per_quintal: number;
  bonus_rate_per_quintal?: number | null;
  effective_procurement_rate: number;
  start_date?: string | null;
  end_date?: string | null;
  registration_portal_name?: string | null;
  registration_portal_url?: string | null;
  eligibility_criteria?: string | null;
  faq_specs?: string | null;
  official_guidelines_url?: string | null;
  contact_helpline?: string | null;
  source_provenance: string;
  last_updated_date?: string | null;
  is_active: boolean;
  created_at?: string | null;
};

export type TradeInquiryItem = {
  id: number;
  user_id?: number | null;
  target_type: "produce_listing" | "buyer_requirement";
  target_id: number;
  inquiry_type: "quotation" | "inquiry" | "contact_request";
  offered_price?: number | null;
  price_unit?: string | null;
  offered_quantity?: number | null;
  quantity_unit?: string | null;
  message?: string | null;
  inquirer_name: string;
  inquirer_phone: string;
  inquirer_type: string;
  status: "sent" | "accepted" | "declined" | "expired";
  contact_revealed: boolean;
  counter_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ListingReportItem = {
  id: number;
  user_id?: number | null;
  target_type: "produce_listing" | "buyer_requirement";
  target_id: number;
  reason: "misleading_price" | "fake_listing" | "out_of_stock" | "phone_unreachable" | "wrong_location" | "other";
  details?: string | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  status: "reported" | "reviewed" | "dismissed" | "action_taken";
  admin_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MarketPriceItem = {
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
  data_retrieval_timestamp?: string | null;
  is_stale?: boolean;
  stale_warning?: string | null;
};

export type ImportSourceItem = {
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
  is_active: boolean;
};

export type FarmContext = {
  farms: Farm[];
  fields: FarmerField[];
  has_farm_context: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const r = await fetchWithAuth(path);
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetchWithAuth(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const r = await fetchWithAuth(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const r = await fetchWithAuth(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

async function apiDelete(path: string): Promise<void> {
  const r = await fetchWithAuth(path, { method: "DELETE" });
  if (!r.ok && r.status !== 204) {
    const err = await r.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${r.status}`);
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export const farmerProfileApi = {
  get: () => apiGet<FarmerProfile>(`${BASE}/profile`),
  update: (data: Partial<FarmerProfile>) => apiPost<FarmerProfile>(`${BASE}/profile`, data),
};

// ─── Farms ────────────────────────────────────────────────────────────────────

export const farmsApi = {
  list: () => apiGet<Farm[]>(`${BASE}/farms`),
  create: (data: Omit<Farm, "id" | "user_id" | "created_at" | "updated_at">) =>
    apiPost<Farm>(`${BASE}/farms`, data),
  update: (id: number, data: Partial<Farm>) =>
    apiPut<Farm>(`${BASE}/farms/${id}`, data),
};

// ─── Fields ───────────────────────────────────────────────────────────────────

export const fieldsApi = {
  list: () => apiGet<FarmerField[]>(`${BASE}/fields`),
  create: (data: Omit<FarmerField, "id" | "user_id">) =>
    apiPost<FarmerField>(`${BASE}/fields`, data),
  update: (id: number, data: Partial<FarmerField>) =>
    apiPut<FarmerField>(`${BASE}/fields/${id}`, data),
  delete: (id: number) => apiDelete(`${BASE}/fields/${id}`),
};

// ─── Soil Tests ───────────────────────────────────────────────────────────────

export const soilTestsApi = {
  list: (fieldId?: number) =>
    apiGet<SoilTest[]>(`${BASE}/soil-tests${fieldId ? `?field_id=${fieldId}` : ""}`),
  create: (data: Omit<SoilTest, "id" | "user_id" | "created_at" | "updated_at">) =>
    apiPost<SoilTest>(`${BASE}/soil-tests`, data),
  update: (id: number, data: Partial<SoilTest>) =>
    apiPut<SoilTest>(`${BASE}/soil-tests/${id}`, data),
  delete: (id: number) => apiDelete(`${BASE}/soil-tests/${id}`),
};

// ─── Recommendations ──────────────────────────────────────────────────────────

export const recommendationsApi = {
  list: (params?: { status?: RecommendationStatus; category?: RecommendationCategory }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.category) q.set("category", params.category);
    const qs = q.toString();
    return apiGet<Recommendation[]>(`${BASE}/recommendations${qs ? `?${qs}` : ""}`);
  },
  create: (data: Omit<Recommendation, "id" | "user_id" | "status_updated_at" | "created_at">) =>
    apiPost<Recommendation>(`${BASE}/recommendations`, data),
  updateStatus: (id: number, status: RecommendationStatus) =>
    apiPatch<Recommendation>(`${BASE}/recommendations/${id}/status`, { status }),
  delete: (id: number) => apiDelete(`${BASE}/recommendations/${id}`),
};

// ─── Activities ───────────────────────────────────────────────────────────────

export const activitiesApi = {
  list: (params?: { field_id?: number; category?: string; from_date?: string; to_date?: string }) => {
    const q = new URLSearchParams();
    if (params?.field_id) q.set("field_id", String(params.field_id));
    if (params?.category) q.set("category", params.category);
    if (params?.from_date) q.set("from_date", params.from_date);
    if (params?.to_date) q.set("to_date", params.to_date);
    const qs = q.toString();
    return apiGet<FarmActivity[]>(`${BASE}/activities${qs ? `?${qs}` : ""}`);
  },
  create: (data: Omit<FarmActivity, "id" | "user_id" | "created_at" | "updated_at">) =>
    apiPost<FarmActivity>(`${BASE}/activities`, data),
  update: (id: number, data: Partial<FarmActivity>) =>
    apiPut<FarmActivity>(`${BASE}/activities/${id}`, data),
  delete: (id: number) => apiDelete(`${BASE}/activities/${id}`),
};

// ─── Context ──────────────────────────────────────────────────────────────────

export const farmContextApi = {
  get: () => apiGet<FarmContext>(`${BASE}/context`),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (params?: { status?: FarmTaskStatus; category?: FarmTaskCategory; field_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.category) q.set("category", params.category);
    if (params?.field_id) q.set("field_id", String(params.field_id));
    const qs = q.toString();
    return apiGet<FarmTask[]>(`${BASE}/tasks${qs ? `?${qs}` : ""}`);
  },
  summary: () => apiGet<FarmTaskSummary>(`${BASE}/tasks/summary`),
  create: (data: Omit<FarmTask, "id" | "user_id" | "completed_at" | "created_at" | "updated_at">) =>
    apiPost<FarmTask>(`${BASE}/tasks`, data),
  updateStatus: (id: number, status: FarmTaskStatus) =>
    apiPatch<FarmTask>(`${BASE}/tasks/${id}/status`, { status }),
  update: (id: number, data: Partial<FarmTask>) =>
    apiPut<FarmTask>(`${BASE}/tasks/${id}`, data),
  delete: (id: number) => apiDelete(`${BASE}/tasks/${id}`),
};

// ─── Marketplace ─────────────────────────────────────────────────────────────
export const marketplaceApi = {
  list: (params?: { listing_type?: "buy" | "sell"; category?: string; crop?: string; district?: string }) => {
    const q = new URLSearchParams();
    if (params?.listing_type) q.set("listing_type", params.listing_type);
    if (params?.category) q.set("category", params.category);
    if (params?.crop) q.set("crop", params.crop);
    if (params?.district) q.set("district", params.district);
    const qs = q.toString();
    return apiGet<MarketplaceListing[]>(`/api/marketplace/listings${qs ? `?${qs}` : ""}`);
  },
  create: (data: Omit<MarketplaceListing, "id" | "user_id" | "created_at">) =>
    apiPost<MarketplaceListing>(`/api/marketplace/listings`, data),
  delete: (id: number) => apiDelete(`/api/marketplace/listings/${id}`),
};

// ─── Equipment Reference Catalogue API ─────────────────────────────────────────
export const equipmentCatalogApi = {
  list: (params?: { category?: string; brand?: string; supplier?: string; min_hp?: number; max_hp?: number; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.brand) q.set("brand", params.brand);
    if (params?.supplier) q.set("supplier", params.supplier);
    if (params?.min_hp !== undefined && params.min_hp !== null) q.set("min_hp", String(params.min_hp));
    if (params?.max_hp !== undefined && params.max_hp !== null) q.set("max_hp", String(params.max_hp));
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiGet<{ total: number; page: number; limit: number; items: EquipmentCatalogItem[] }>(`/api/marketplace/catalog/equipment${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiGet<EquipmentCatalogItem>(`/api/marketplace/catalog/equipment/${id}`),
  categories: () => apiGet<{ category: string; count: number }[]>(`/api/marketplace/catalog/categories`),
  brands: () => apiGet<{ brand: string; count: number }[]>(`/api/marketplace/catalog/brands`),
};

// ─── Equipment Listings (Rent / Sale by Farmers & Dealers) API ─────────────────
export const equipmentListingsApi = {
  list: (params?: { listing_type?: "rent" | "sale"; category?: string; brand?: string; state?: string; district?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.listing_type) q.set("listing_type", params.listing_type);
    if (params?.category) q.set("category", params.category);
    if (params?.brand) q.set("brand", params.brand);
    if (params?.state) q.set("state", params.state);
    if (params?.district) q.set("district", params.district);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiGet<{ total: number; page: number; limit: number; items: EquipmentListingItem[] }>(`/api/marketplace/equipment-listings${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiGet<EquipmentListingItem>(`/api/marketplace/equipment-listings/${id}`),
  create: (data: Omit<EquipmentListingItem, "id" | "user_id" | "created_at" | "availability_status">) =>
    apiPost<EquipmentListingItem>(`/api/marketplace/equipment-listings`, data),
  updateStatus: (id: number, status: string) =>
    apiPatch<{ id: number; availability_status: string }>(`/api/marketplace/equipment-listings/${id}/status?status_value=${status}`, {}),
};

// ─── Produce Listings (Source Directly from Farms) API ────────────────────────
export const produceListingsApi = {
  list: (params?: { crop_name?: string; variety?: string; category?: string; state?: string; district?: string; min_quantity?: number; status?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.crop_name) q.set("crop_name", params.crop_name);
    if (params?.variety) q.set("variety", params.variety);
    if (params?.category) q.set("category", params.category);
    if (params?.state) q.set("state", params.state);
    if (params?.district) q.set("district", params.district);
    if (params?.min_quantity !== undefined && params.min_quantity !== null) q.set("min_quantity", String(params.min_quantity));
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiGet<{ total: number; page: number; limit: number; items: ProduceListingItem[] }>(`/api/marketplace/produce-listings${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiGet<ProduceListingItem>(`/api/marketplace/produce-listings/${id}`),
  create: (data: Omit<ProduceListingItem, "id" | "user_id" | "created_at" | "availability_status">) =>
    apiPost<ProduceListingItem>(`/api/marketplace/produce-listings`, data),
  updateStatus: (id: number, status: string) =>
    apiPatch<{ id: number; availability_status: string }>(`/api/marketplace/produce-listings/${id}/status?status_value=${status}`, {}),
  confirmStock: (id: number) =>
    apiPost<{ message: string; last_confirmation_date: string }>(`/api/marketplace/produce-listings/${id}/confirm`, {}),
};

// ─── Buyer Requirements API ───────────────────────────────────────────────────
export const buyerRequirementsApi = {
  list: (params?: { commodity?: string; variety?: string; state?: string; district?: string; min_quantity?: number; status?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.commodity) q.set("commodity", params.commodity);
    if (params?.variety) q.set("variety", params.variety);
    if (params?.state) q.set("state", params.state);
    if (params?.district) q.set("district", params.district);
    if (params?.min_quantity !== undefined && params.min_quantity !== null) q.set("min_quantity", String(params.min_quantity));
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiGet<{ total: number; page: number; limit: number; items: BuyerRequirementItem[] }>(`/api/marketplace/buyer-requirements${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiGet<BuyerRequirementItem>(`/api/marketplace/buyer-requirements/${id}`),
  create: (data: Partial<BuyerRequirementItem>) =>
    apiPost<BuyerRequirementItem>(`/api/marketplace/buyer-requirements`, data),
  updateStatus: (id: number, status: string) =>
    apiPatch<{ id: number; status: string }>(`/api/marketplace/buyer-requirements/${id}/status?status_value=${status}`, {}),
};

// ─── Government Procurement (MSP Centres) API ─────────────────────────────────
export const governmentProcurementApi = {
  list: (params?: { crop_name?: string; state?: string; district?: string; season?: string }) => {
    const q = new URLSearchParams();
    if (params?.crop_name) q.set("crop_name", params.crop_name);
    if (params?.state) q.set("state", params.state);
    if (params?.district) q.set("district", params.district);
    if (params?.season) q.set("season", params.season);
    const qs = q.toString();
    return apiGet<GovernmentProcurementItem[]>(`/api/marketplace/procurement${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiGet<GovernmentProcurementItem>(`/api/marketplace/procurement/${id}`),
};

// ─── Trade Inquiries & Quotations API ─────────────────────────────────────────
export const tradeInquiriesApi = {
  submit: (data: Omit<TradeInquiryItem, "id" | "user_id" | "status" | "contact_revealed" | "created_at" | "updated_at">) =>
    apiPost<TradeInquiryItem>(`/api/marketplace/inquiries`, data),
  list: (params?: { target_type?: string; target_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.target_type) q.set("target_type", params.target_type);
    if (params?.target_id) q.set("target_id", String(params.target_id));
    const qs = q.toString();
    return apiGet<TradeInquiryItem[]>(`/api/marketplace/inquiries${qs ? `?${qs}` : ""}`);
  },
  updateStatus: (id: number, status: string, notes?: string) =>
    apiPatch<TradeInquiryItem>(`/api/marketplace/inquiries/${id}/status?status_value=${status}${notes ? `&counter_notes=${encodeURIComponent(notes)}` : ""}`, {}),
};

// ─── Listing Reports (Misleading / Fake content) API ──────────────────────────
export const listingReportsApi = {
  submit: (data: Omit<ListingReportItem, "id" | "user_id" | "status" | "admin_notes" | "created_at" | "updated_at">) =>
    apiPost<ListingReportItem>(`/api/marketplace/reports`, data),
};

// ─── Mandi Crops Intelligence API ─────────────────────────────────────────────
export const mandiApi = {
  getCrops: (params?: { commodity?: string; variety?: string; state?: string; district?: string; market?: string; min_price?: number; max_price?: number; sort_by?: string; sort_order?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.commodity) q.set("commodity", params.commodity);
    if (params?.variety) q.set("variety", params.variety);
    if (params?.state) q.set("state", params.state);
    if (params?.district) q.set("district", params.district);
    if (params?.market) q.set("market", params.market);
    if (params?.min_price !== undefined) q.set("min_price", String(params.min_price));
    if (params?.max_price !== undefined) q.set("max_price", String(params.max_price));
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.sort_order) q.set("sort_order", params.sort_order);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiGet<{ crops: any[]; total: number; page: number; limit: number; source: string; retrieved_at: string; disclaimer: string }>(`/api/mandi/crops${qs ? `?${qs}` : ""}`);
  },
  refresh: () => apiPost<{ status: string; message: string; refreshed_at: string }>(`/api/mandi/refresh`, {}),
};

// ─── Market Prices (AGMARKNET Benchmark Context) API ─────────────────────────
export const marketPricesApi = {
  list: (params?: { commodity?: string; state?: string; district?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.commodity) q.set("commodity", params.commodity);
    if (params?.state) q.set("state", params.state);
    if (params?.district) q.set("district", params.district);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiGet<MarketPriceItem[]>(`/api/marketplace/market-prices${qs ? `?${qs}` : ""}`);
  },
};

// ─── Registered External Sources API ──────────────────────────────────────────
export const marketplaceSourcesApi = {
  list: () => apiGet<ImportSourceItem[]>(`/api/marketplace/sources`),
};

// ─── Unit conversion helpers ──────────────────────────────────────────────────

export function acresToHectares(acres: number): number {
  return Math.round(acres * 0.404686 * 100) / 100;
}

export function hectaresToAcres(ha: number): number {
  return Math.round(ha * 2.47105 * 100) / 100;
}

export function getSoilHealthScore(test: SoilTest): number {
  let score = 0;
  let factors = 0;

  // pH: ideal 6.0–7.5
  if (test.soil_ph !== null && test.soil_ph !== undefined) {
    const ph = test.soil_ph;
    if (ph >= 6.0 && ph <= 7.5) score += 100;
    else if (ph >= 5.5 && ph <= 8.0) score += 60;
    else score += 20;
    factors++;
  }

  // Organic carbon: >0.75% is good
  if (test.organic_carbon_pct !== null && test.organic_carbon_pct !== undefined) {
    const oc = test.organic_carbon_pct;
    if (oc >= 0.75) score += 100;
    else if (oc >= 0.5) score += 60;
    else score += 20;
    factors++;
  }

  // N: adequate is >280 kg/ha
  if (test.nitrogen_kg_ha !== null && test.nitrogen_kg_ha !== undefined) {
    score += test.nitrogen_kg_ha >= 280 ? 100 : test.nitrogen_kg_ha >= 140 ? 60 : 20;
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 0;
}
