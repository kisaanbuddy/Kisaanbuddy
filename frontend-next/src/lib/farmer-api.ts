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
