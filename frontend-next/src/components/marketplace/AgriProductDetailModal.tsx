"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  Phone,
  MessageSquare,
  Building2,
  MapPin,
  Clock,
  AlertTriangle,
  Scale,
  ExternalLink,
  Truck,
  CheckCircle2,
  Calendar,
  FileCheck,
  Info,
} from "lucide-react";
import { AgriProductItem } from "@/lib/farmer-api";
import { useLanguage, type Lang } from "@/lib/language";

interface AgriProductDetailModalProps {
  product: AgriProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onComparePrices: (product: AgriProductItem) => void;
  onContactSeller: (product: AgriProductItem) => void;
}

export function AgriProductDetailModal({
  product,
  isOpen,
  onClose,
  onComparePrices,
  onContactSeller,
}: AgriProductDetailModalProps) {
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  if (!isOpen || !product) return null;

  const cleanPhone = (product.seller_phone || "").replace(/[^0-9+]/g, "");
  const waDigits = (product.seller_phone || "").replace(/[^0-9]/g, "");
  const waPhone =
    waDigits.length === 10
      ? `91${waDigits}`
      : waDigits.startsWith("91") && waDigits.length === 12
      ? waDigits
      : waDigits;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6">
        {/* Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {product.is_cibrc_approved
                    ? "CIBRC Registered"
                    : product.is_fco_approved
                    ? "FCO 1985 Approved"
                    : "Verified Agri Input"}
                </span>
              </span>
              <span className="text-xs font-semibold text-stone-500 capitalize">
                {product.category.replace(/_/g, " ")}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
              {product.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
              {isHi ? "निर्माता" : "Manufacturer"}: <span className="text-stone-900 dark:text-stone-200 font-bold">{product.manufacturer}</span> ({product.brand})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Price & Stock Overview Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-200">
                  ₹{product.selling_price.toFixed(2)}
                </span>
                {product.mrp > product.selling_price && (
                  <span className="text-sm line-through text-stone-400 font-medium">
                    MRP ₹{product.mrp.toFixed(2)}
                  </span>
                )}
                <span className="text-xs font-semibold text-stone-500">
                  / {product.pack_size}
                </span>
              </div>
              {product.mrp > product.selling_price && (
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {isHi ? "बचत" : "Save"}: ₹{(product.mrp - product.selling_price).toFixed(2)} ({Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)}% off MRP)
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  product.stock_status === "available_to_buy"
                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                    : product.stock_status === "contact_seller"
                    ? "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="capitalize">{product.stock_status.replace(/_/g, " ")}</span>
              </span>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isHi ? "तकनीकी विवरण व सक्रिय तत्व" : "Technical Specifications & Active Ingredients"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <span className="text-stone-500 block">{isHi ? "सक्रिय तत्व / रचना" : "Active Ingredient"}</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
                  {product.active_ingredient}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <span className="text-stone-500 block">{isHi ? "सूत्रीकरण प्रकार" : "Formulation"}</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
                  {product.formulation}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <span className="text-stone-500 block">{isHi ? "पंजीकरण संख्या" : "Registration No."}</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100 mt-0.5 block text-xs">
                  {product.registration_number}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
                <span className="text-stone-500 block">{isHi ? "सत्यापन स्रोत" : "Regulatory Authority"}</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 mt-0.5 block text-xs">
                  {product.provenance}
                </span>
              </div>
            </div>
          </div>

          {/* Suitable Crops & Target Pests */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isHi ? "स्वीकृत फसलें व लक्षित समस्याएं" : "Approved Crops & Target Conditions"}
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-stone-500 block mb-1.5">{isHi ? "उपयुक्त फसलें:" : "Suitable Crops:"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.target_crops.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {product.target_pests_diseases && product.target_pests_diseases.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-stone-500 block mb-1.5">
                    {isHi ? "नियंत्रित कीट व बीमारियां:" : "Controlled Pests & Diseases:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.target_pests_diseases.map((d, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.target_deficiencies && product.target_deficiencies.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-stone-500 block mb-1.5">
                    {isHi ? "सुधारे जाने वाले पोषक तत्व:" : "Nutrient Deficiencies Corrected:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.target_deficiencies.map((df, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold"
                      >
                        {df}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Dosage & Instructions */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              <FileCheck className="h-4 w-4 text-emerald-600" />
              <span>{isHi ? "अनुशंसित खुराक व प्रयोग विधि" : "Recommended Dosage & Usage Guidelines"}</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {product.recommended_dosage}
            </p>
            {product.pre_harvest_interval_days > 0 && (
              <div className="pt-2 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>
                  {isHi ? "तुड़ाई पूर्व प्रतीक्षा अवधि (PHI):" : "Pre-Harvest Interval (PHI):"}{" "}
                  <strong className="text-stone-900 dark:text-stone-100">{product.pre_harvest_interval_days} {isHi ? "दिन" : "days"}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Safety Precautions */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>{isHi ? "सुरक्षा निर्देश व सावधानियां" : "Safety Precautions & PPE"}</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
              {product.safety_precautions}
            </p>
          </div>

          {/* Verified Seller Card */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {isHi ? "सत्यापित विक्रेता विवरण" : "Verified Seller Information"}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isHi ? "सत्यापित आपूर्ति केंद्र" : "Verified Supply Point"}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  {product.seller_name}
                </p>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span>{product.seller_location} ({product.district}, {product.state})</span>
                </p>
                {product.seller_license_no && (
                  <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                    License: {product.seller_license_no}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-stone-400" />
                <span className="text-xs text-stone-600 dark:text-stone-300">
                  {product.delivery_options}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onComparePrices(product);
            }}
            className="h-11 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition"
          >
            <Scale className="h-4 w-4 text-emerald-600" />
            <span>{isHi ? "कीमत तुलना करें" : "Compare Prices"}</span>
          </button>

          <div className="flex items-center gap-2">
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="h-11 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-xs"
              >
                <Phone className="h-4 w-4" />
                <span>{isHi ? "कॉल करें" : "Call"}</span>
              </a>
            )}

            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                  `Namaste, I want to inquire about ${product.name} (${product.pack_size}) at Rs. ${product.selling_price} listed on KisaanBuddy.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-xs"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onContactSeller(product);
              }}
              className="h-11 px-4 rounded-xl border border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold text-xs sm:text-sm transition"
            >
              {isHi ? "कोटेशन / कॉलबैक" : "Callback Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
