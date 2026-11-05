with open('frontend-next/src/lib/farmer-api.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''export type TradeInquiryItem = {
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
};'''

replacement = '''export type TradeInquiryItem = {
  id: number;
  user_id?: number | null;
  listing_type?: string;
  target_type?: string;
  listing_id?: number;
  target_id?: number;
  inquiry_type?: string;
  preferred_callback_time?: string | null;
  offered_price?: number | null;
  proposed_price?: number | null;
  price_unit?: string | null;
  offered_quantity?: number | null;
  proposed_quantity?: number | null;
  quantity_unit?: string | null;
  message?: string | null;
  sender_name?: string;
  inquirer_name?: string;
  sender_phone?: string;
  inquirer_phone?: string;
  sender_type?: string;
  inquirer_type?: string;
  status?: string;
  contact_revealed?: boolean;
  counter_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PriceComparisonItem = {
  id: string;
  source_type: "listing" | "catalog";
  title: string;
  brand: string;
  model_name: string;
  category: string;
  hp_rating?: number | null;
  condition: string;
  price: number;
  price_unit: string;
  seller_name: string;
  seller_location: string;
  state?: string | null;
  district?: string | null;
  includes_operator: boolean;
  is_verified: boolean;
  match_type: "exact_model" | "spec_alternative";
  warranty_info: string;
  delivery_info: string;
  notes?: string | null;
};

export type PriceComparisonResponse = {
  target_id?: string | null;
  target_title?: string | null;
  target_price?: number | null;
  target_price_unit?: string | null;
  is_sufficient: boolean;
  summary_message: string;
  lowest_offer?: PriceComparisonItem | null;
  best_value_offer?: PriceComparisonItem | null;
  best_value_reason?: string | null;
  comparable_offers: PriceComparisonItem[];
};

export type DealerDiscoveryItem = {
  id: string;
  seller_name: string;
  seller_type: string;
  phone?: string | null;
  whatsapp?: string | null;
  state: string;
  district: string;
  village_or_tehsil?: string | null;
  listings_count: number;
  categories: string[];
  sample_equipment: string[];
  is_verified: boolean;
  contact_available: boolean;
};'''

text = text.replace(target, replacement, 1)

target2 = '''// ─── Listing Reports (Misleading / Fake content) API ──────────────────────────
export const listingReportsApi = {
  submit: (data: Omit<ListingReportItem, "id" | "user_id" | "status" | "admin_notes" | "created_at" | "updated_at">) =>
    apiPost<ListingReportItem>(`/api/marketplace/reports`, data),
};'''

replacement2 = '''// ─── Listing Reports (Misleading / Fake content) API ──────────────────────────
export const listingReportsApi = {
  submit: (data: Omit<ListingReportItem, "id" | "user_id" | "status" | "admin_notes" | "created_at" | "updated_at">) =>
    apiPost<ListingReportItem>(`/api/marketplace/reports`, data),
};

// ─── Smart Price Comparison API ───────────────────────────────────────────────
export const priceComparisonApi = {
  compare: (params: {
    category: string;
    deal_type?: string;
    price_unit?: string;
    hp_rating?: number;
    brand?: string;
    model_name?: string;
    target_id?: string;
  }) => {
    const q = new URLSearchParams();
    q.set("category", params.category);
    if (params.deal_type) q.set("deal_type", params.deal_type);
    if (params.price_unit) q.set("price_unit", params.price_unit);
    if (params.hp_rating) q.set("hp_rating", String(params.hp_rating));
    if (params.brand) q.set("brand", params.brand);
    if (params.model_name) q.set("model_name", params.model_name);
    if (params.target_id) q.set("target_id", params.target_id);
    return apiGet<PriceComparisonResponse>(`/api/marketplace/compare-prices?${q.toString()}`);
  },
};

// ─── Dealer & CHC Discovery API ──────────────────────────────────────────────
export const dealersApi = {
  list: (params?: { state?: string; district?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.state && params.state !== "all") q.set("state", params.state);
    if (params?.district && params.district !== "all") q.set("district", params.district);
    if (params?.category && params.category !== "all") q.set("category", params.category);
    const qs = q.toString();
    return apiGet<DealerDiscoveryItem[]>(`/api/marketplace/dealers${qs ? `?${qs}` : ""}`);
  },
};'''

text = text.replace(target2, replacement2, 1)

with open('frontend-next/src/lib/farmer-api.ts', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(text)

print("Updated farmer-api.ts successfully")
