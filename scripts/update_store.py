with open('frontend-next/src/lib/marketplace-store.ts', 'r', encoding='utf-8') as f:
    text = f.read()

additional_code = '''
// ─── Trade Inquiries, Callback & Quotations Store ───────────────────────────
const tradeInquiriesStore: any[] = [];

export function addTradeInquiry(data: any) {
  const listing_type = data.listing_type || data.target_type;
  const listing_id = Number(data.listing_id || data.target_id);
  const sender_name = data.sender_name || data.inquirer_name;
  const sender_phone = data.sender_phone || data.inquirer_phone;
  const inquiry_type = data.inquiry_type || "quotation";

  // Duplicate check: within current session
  const existing = tradeInquiriesStore.find(
    (x) =>
      x.listing_type === listing_type &&
      x.listing_id === listing_id &&
      x.sender_phone === sender_phone &&
      x.inquiry_type === inquiry_type &&
      (x.status === "submitted" || x.status === "in_discussion")
  );

  if (existing) {
    const error: any = new Error(
      `An active ${inquiry_type} request (#INQ-${existing.id}) is already registered for this phone number.`
    );
    error.status = 409;
    throw error;
  }

  const newId = tradeInquiriesStore.length > 0 ? Math.max(...tradeInquiriesStore.map((x) => x.id || 0)) + 1 : 101;
  const item = {
    id: newId,
    listing_type,
    listing_id,
    sender_name,
    sender_phone,
    sender_type: data.sender_type || data.inquirer_type || "farmer",
    inquiry_type,
    preferred_callback_time: data.preferred_callback_time || null,
    proposed_price: data.proposed_price || data.offered_price || null,
    price_unit: data.price_unit || "per hour",
    proposed_quantity: data.proposed_quantity || data.offered_quantity || null,
    quantity_unit: data.quantity_unit || "unit",
    message: data.message || null,
    status: "submitted",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  tradeInquiriesStore.unshift(item);
  return item;
}

export function getTradeInquiries(params?: { listing_type?: string; listing_id?: number; sender_phone?: string }) {
  let list = [...tradeInquiriesStore];
  if (params?.listing_type) list = list.filter((x) => x.listing_type === params.listing_type);
  if (params?.listing_id) list = list.filter((x) => x.listing_id === params.listing_id);
  if (params?.sender_phone) list = list.filter((x) => x.sender_phone === params.sender_phone);
  return list;
}

// ─── Smart Price Comparison Engine ──────────────────────────────────────────
export function compareMarketplacePrices(params: {
  category: string;
  deal_type?: string;
  price_unit?: string;
  hp_rating?: number;
  brand?: string;
  model_name?: string;
  target_id?: string;
}) {
  const category = params.category;
  const deal_type = params.deal_type || "rent";
  const price_unit = params.price_unit;
  const normalized_brand = params.brand?.trim().toLowerCase() || "";
  const normalized_model = params.model_name?.trim().toLowerCase() || "";

  // 1. Filter equipment listings
  let matchingListings = equipmentListings.filter(
    (l) => l.category === category && l.listing_type === deal_type && l.price > 0 && l.availability_status === "available"
  );
  if (price_unit) {
    matchingListings = matchingListings.filter((l) => l.price_unit === price_unit);
  }

  // 2. Filter catalog items if sale / purchase
  let matchingCatalog: EquipmentCatalogItem[] = [];
  if (deal_type === "sale" || price_unit === "total price") {
    matchingCatalog = equipmentCatalogStore.filter(
      (c) => c.category === category && c.indicative_price && c.indicative_price > 0 && c.is_active
    );
  }

  const comparable_offers: any[] = [];

  for (const l of matchingListings) {
    const is_exact =
      Boolean(normalized_brand && normalized_model) &&
      l.brand.trim().toLowerCase() === normalized_brand &&
      (l.model_name || l.title).trim().toLowerCase().includes(normalized_model);

    comparable_offers.push({
      id: `list-${l.id}`,
      source_type: "listing",
      title: l.title,
      brand: l.brand,
      model_name: l.model_name || l.title,
      category: l.category,
      hp_rating: l.hp_rating,
      condition: l.condition,
      price: l.price,
      price_unit: l.price_unit,
      seller_name: l.owner_name,
      seller_location: `${l.district}, ${l.state}`,
      state: l.state,
      district: l.district,
      includes_operator: Boolean(l.includes_operator),
      is_verified: true,
      match_type: is_exact ? "exact_model" : "spec_alternative",
      warranty_info: "Verified seller/CHC listing (terms negotiable with owner)",
      delivery_info: "Haulage / farm-gate delivery arranged upon agreement with owner",
      notes: l.notes,
    });
  }

  for (const c of matchingCatalog) {
    const is_exact =
      Boolean(normalized_brand && normalized_model) &&
      c.brand.trim().toLowerCase() === normalized_brand &&
      c.model_name.trim().toLowerCase().includes(normalized_model);

    comparable_offers.push({
      id: `cat-${c.id}`,
      source_type: "catalog",
      title: `${c.brand} ${c.model_name}`,
      brand: c.brand,
      model_name: c.model_name,
      category: c.category,
      hp_rating: c.hp_rating,
      condition: "new",
      price: c.indicative_price,
      price_unit: "total price",
      seller_name: c.supplier_name || "Official Supplier Network",
      seller_location: "Authorized Pan-India Dealers",
      state: null,
      district: null,
      includes_operator: false,
      is_verified: true,
      match_type: is_exact ? "exact_model" : "spec_alternative",
      warranty_info: "Standard OEM manufacturer warranty applies",
      delivery_info: "Supplier direct dispatch across India",
      notes: c.description,
    });
  }

  comparable_offers.sort((a, b) => a.price - b.price);
  const is_sufficient = comparable_offers.length >= 2;

  if (!is_sufficient) {
    return {
      target_id: params.target_id || null,
      target_title: `${params.brand || ""} ${params.model_name || ""}`.trim() || null,
      is_sufficient: false,
      summary_message:
        "Comparison data is currently insufficient for this product. No identical or directly comparable listings exist in our verified database.",
      lowest_offer: comparable_offers[0] || null,
      best_value_offer: comparable_offers[0] || null,
      best_value_reason: null,
      comparable_offers,
    };
  }

  const lowest_offer = comparable_offers[0];
  const operator_offers = comparable_offers.filter((o) => o.includes_operator);
  let best_value_offer = lowest_offer;
  let best_value_reason = `Lowest listed rate at ₹${Math.round(lowest_offer.price)}/${lowest_offer.price_unit.replace(
    "per ",
    ""
  )} from verified provider in ${lowest_offer.seller_location}.`;

  if (operator_offers.length > 0 && operator_offers[0].price <= lowest_offer.price * 1.25) {
    best_value_offer = operator_offers[0];
    best_value_reason = `Top value: Includes trained operator & implement at ₹${Math.round(
      best_value_offer.price
    )}/${best_value_offer.price_unit.replace("per ", "")} from verified CHC in ${best_value_offer.seller_location}.`;
  }

  return {
    target_id: params.target_id || null,
    target_title: `${params.brand || ""} ${params.model_name || ""}`.trim() || null,
    is_sufficient: true,
    summary_message: `Found ${comparable_offers.length} verified comparable offers in ${category.replace("_", " ")}.`,
    lowest_offer,
    best_value_offer,
    best_value_reason,
    comparable_offers,
  };
}

// ─── Dealer & CHC Discovery Engine ──────────────────────────────────────────
export function getDealersDirectory(params?: { state?: string; district?: string; category?: string }) {
  let filtered = [...equipmentListings];
  if (params?.state && params.state !== "all") {
    filtered = filtered.filter((l) => l.state.toLowerCase() === params.state!.toLowerCase());
  }
  if (params?.district && params.district !== "all") {
    filtered = filtered.filter((l) => l.district.toLowerCase() === params.district!.toLowerCase());
  }
  if (params?.category && params.category !== "all") {
    filtered = filtered.filter((l) => l.category === params.category);
  }

  const grouped: Record<string, typeof equipmentListings> = {};
  for (const l of filtered) {
    const key = `${l.owner_name}___${l.state}___${l.district}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  }

  const results: any[] = [];
  let idx = 1;
  const sortedKeys = Object.keys(grouped).sort((a, b) => grouped[b].length - grouped[a].length);

  for (const key of sortedKeys) {
    const items = grouped[key];
    const first = items[0];
    const phone = first.owner_phone;
    const has_phone = Boolean(phone && phone.trim());

    let seller_type = "Farmer Owner";
    const nameLower = first.owner_name.toLowerCase();
    if (
      nameLower.includes("custom hiring") ||
      nameLower.includes("chc") ||
      nameLower.includes("kisan seva") ||
      nameLower.includes("sahakari") ||
      nameLower.includes("bank") ||
      nameLower.includes("pool") ||
      nameLower.includes("federation") ||
      nameLower.includes("fpo")
    ) {
      seller_type = "Custom Hiring Center (CHC)";
    }

    const cats = Array.from(new Set(items.map((i) => i.category))).sort();
    const samples = items.slice(0, 3).map((i) => i.title);

    results.push({
      id: `dealer-${idx}`,
      seller_name: first.owner_name,
      seller_type,
      phone: has_phone ? phone : null,
      whatsapp: has_phone ? phone : null,
      state: first.state,
      district: first.district,
      village_or_tehsil: first.village || first.tehsil_or_block || null,
      listings_count: items.length,
      categories: cats,
      sample_equipment: samples,
      is_verified: true,
      contact_available: has_phone,
    });
    idx++;
  }

  return results;
}
'''

if 'compareMarketplacePrices' not in text:
    text += additional_code
    with open('frontend-next/src/lib/marketplace-store.ts', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(text)
    print("Added inquiry, compare, and dealer functions to marketplace-store.ts")
else:
    print("Already present in marketplace-store.ts")
