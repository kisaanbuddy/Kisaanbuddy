with open('frontend-next/src/app/marketplace/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update lucide-react imports
old_lucide = '''  ArrowRight,
  RotateCcw,
} from "lucide-react";'''

new_lucide = '''  ArrowRight,
  RotateCcw,
  Scale,
  MessageSquare,
  Clock,
  Building2,
  Send,
} from "lucide-react";'''

text = text.replace(old_lucide, new_lucide, 1)

# 2. Update farmer-api imports
old_farmer_api = '''import {
  equipmentCatalogApi,
  equipmentListingsApi,
  produceListingsApi,
  EquipmentCatalogItem,
  EquipmentListingItem,
  ProduceListingItem,
} from "@/lib/farmer-api";'''

new_farmer_api = '''import {
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
} from "@/lib/farmer-api";'''

text = text.replace(old_farmer_api, new_farmer_api, 1)

# 3. Add URL and phone helper functions
helpers = '''// Clean telephone number for tel: protocol
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
'''

text = text.replace('// Comprehensive Indian States and Agricultural Districts Mapping', helpers + '\n// Comprehensive Indian States and Agricultural Districts Mapping', 1)

# 4. Update contactTarget state and add comparison / dealer state
old_modal_state = '''  // Modals
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProduct | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactTarget, setContactTarget] = useState<{
    name: string;
    phone?: string | null;
    title: string;
    location: string;
  } | null>(null);'''

new_modal_state = '''  // Modals
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
  const [dealersLoading, setDealersLoading] = useState(false);'''

text = text.replace(old_modal_state, new_modal_state, 1)

# 5. Update openContact function and add action handlers
old_open_contact = '''  const openContact = (name: string, phone: string | null | undefined, title: string, location: string) => {
    setContactTarget({ name, phone, title, location });
    setShowContactModal(true);
  };'''

new_open_contact = '''  const openContact = (product: UnifiedProduct) => {
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
  };'''

text = text.replace(old_open_contact, new_open_contact, 1)

# 6. Update Header Action CTAs: Add Nearby CHCs & Dealers button
old_header_cta = '''              {/* List Your Product CTA */}
              <button
                onClick={() => setShowListModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List Product</span>
              </button>'''

new_header_cta = '''              {/* Dealer Discovery CTA */}
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
              </button>'''

text = text.replace(old_header_cta, new_header_cta, 1)

# 7. Update Grid Card Actions (add Compare button, update openContact call)
old_grid_card_actions = '''                      {/* Card Actions */}
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
                      </div>'''

new_grid_card_actions = '''                      {/* Card Actions */}
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
                      </div>'''

text = text.replace(old_grid_card_actions, new_grid_card_actions, 1)

# 8. Update List Card Actions (add Compare button, update openContact call)
old_list_card_actions = '''                        <div className="flex items-center justify-end gap-1.5">
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
                        </div>'''

new_list_card_actions = '''                        <div className="flex items-center justify-end gap-1.5">
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
                        </div>'''

text = text.replace(old_list_card_actions, new_list_card_actions, 1)

# 9. Update Product Details Modal actions (add Compare Prices button and validate website URL)
old_details_actions = '''                {/* Actions */}
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
                </div>'''

new_details_actions = '''                {/* Actions */}
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
                </div>'''

text = text.replace(old_details_actions, new_details_actions, 1)

# 10. Replace Seller Contact Modal with authentic multi-channel workflow
old_contact_modal = '''      {/* ─── 6. CONTACT SELLER MODAL ────────────────────────────────────────── */}
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
              <p className="text-stone-500 font-medium">📍 {contactTarget.location}</p>
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
      )}'''

new_contact_modal = '''      {/* ─── 6. AUTHENTIC SELLER CONTACT & ENQUIRY MODAL ───────────────────────── */}
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
      )}'''

text = text.replace(old_contact_modal, new_contact_modal, 1)

with open('frontend-next/src/app/marketplace/page.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(text)

print("Updated frontend-next/src/app/marketplace/page.tsx successfully")
