"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { useLanguage } from "@/lib/language";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ShieldCheck,
  Package,
  Mic,
  AlertCircle,
} from "lucide-react";

export default function OrdersPage() {
  const { cart, orders, updateQuantity, removeFromCart, clearCart, placeOrder, totalAmount, totalCount } = useCart();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"cart" | "orders">("orders");
  const [placedNotice, setPlacedNotice] = useState<string | null>(null);

  const isHindi = lang === "hi" || lang === "hi_en";
  const isKannada = lang === "kn";

  const handleManualOrder = () => {
    const res = placeOrder();
    if (res) {
      setPlacedNotice(
        isKannada
          ? `ಆರ್ಡರ್ ${res.orderNumber} ಯಶಸ್ವಿಯಾಗಿ ದೃಢಪಟ್ಟಿದೆ!`
          : isHindi
          ? `ऑर्डर ${res.orderNumber} सफलतापूर्वक दर्ज हो गया!`
          : `Order ${res.orderNumber} confirmed successfully!`
      );
      setActiveTab("orders");
      setTimeout(() => setPlacedNotice(null), 5000);
    }
  };

  return (
    <div className="w-full py-4 md:py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isKannada ? "ಪರಿಶೀಲಿಸಿದ ರೈತ ಆರ್ಡರ್‌ಗಳು" : isHindi ? "सत्यापित किसान ऑर्डर्स व कार्ट" : "Verified Farmer Orders & Cart"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {isKannada ? "ನನ್ನ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಕಾರ್ಟ್" : isHindi ? "मेरे ऑर्डर्स और कार्ट" : "My Orders & Cart"}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {isKannada
              ? "ವಾಯ್ಸ್ ಕಮಾಂಡ್ ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗೆ ನಿರ್ವಹಿಸಿ"
              : isHindi
              ? "माइक दबाकर बोलें: 'ऑर्डर कर दो' या 'कार्ट साफ़ करो'"
              : "Operate via natural voice commands or manage below"}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            {isKannada ? `ಆರ್ಡರ್‌ಗಳು (${orders.length})` : isHindi ? `ऑर्डर्स इतिहास (${orders.length})` : `Placed Orders (${orders.length})`}
          </button>
          <button
            onClick={() => setActiveTab("cart")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "cart"
                ? "bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isKannada ? `ಕಾರ್ಟ್ (${totalCount})` : isHindi ? `सक्रिय कार्ट (${totalCount})` : `Active Cart (${totalCount})`}</span>
          </button>
        </div>
      </div>

      {placedNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p className="font-semibold text-sm">{placedNotice}</p>
        </div>
      )}

      {/* Voice Instruction Hint */}
      <div className="mb-6 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-3 text-xs md:text-sm text-emerald-900 dark:text-emerald-300">
        <Mic className="w-4 h-4 text-emerald-600 animate-pulse flex-shrink-0" />
        <span>
          <strong>{isKannada ? "ವಾಯ್ಸ್ ಕಮಾಂಡ್ ಸಲಹೆ:" : isHindi ? "आवाज़ से आदेश दें:" : "Voice Command Tip:"}</strong>{" "}
          {isKannada
            ? "ಮೈಕ್ ಒತ್ತಿ 'ಆರ್ಡರ್ ಮಾಡಿ' ಅಥವಾ 'ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗಿ' ಎಂದು ಹೇಳಿ."
            : isHindi
            ? "माइक दबाकर बोलें: 'ऑर्डर कर दो', 'आइटम हटाओ', या 'मार्केटप्लेस खोलो'."
            : "Say 'Place order', 'Remove this item', or 'Open marketplace'."}
        </span>
      </div>

      {/* TAB 1: CART VIEW */}
      {activeTab === "cart" && (
        <div>
          {cart.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                {isKannada ? "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ" : isHindi ? "आपकी कार्ट अभी खाली है" : "Your cart is currently empty"}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
                {isKannada
                  ? "ಕೃಷಿ ಉಪಕರಣಗಳು ಅಥವಾ ಬೀಜಗಳನ್ನು ಸೇರಿಸಲು ಮಾರುಕಟ್ಟೆ ಬ್ರೌಸ್ ಮಾಡಿ."
                  : isHindi
                  ? "उपकरण या प्रमाणित बीज जोड़ने के लिए मार्केटप्लेस देखें या बोलें: 'मार्केटप्लेस खोलो'."
                  : "Explore certified agri machinery or seeds in the marketplace, or speak: 'Open marketplace'."}
              </p>
              <Link
                href="/marketplace"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all"
              >
                <span>{isKannada ? "ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗಿ" : isHindi ? "मार्केटप्लेस देखें" : "Explore Marketplace"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                          {item.category || "Agriculture"}
                        </span>
                        {item.brand && (
                          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{item.brand}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 mt-1">{item.name}</h4>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        ₹{item.price.toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-normal text-stone-500 dark:text-stone-400">/ unit</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                          title="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-sm font-bold text-stone-800 dark:text-stone-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={clearCart}
                    className="text-xs text-stone-500 hover:text-red-600 dark:text-stone-400 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isKannada ? "ಕಾರ್ಟ್ ತೆರವುಗೊಳಿಸಿ" : isHindi ? "पूरी कार्ट साफ़ करें" : "Clear entire cart"}</span>
                  </button>
                  <Link
                    href="/marketplace"
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    {isKannada ? "+ ಇನ್ನಷ್ಟು ಉತ್ಪನ್ನ ಸೇರಿಸಿ" : isHindi ? "+ और उत्पाद जोड़ें" : "+ Add more products"}
                  </Link>
                </div>
              </div>

              {/* Order Summary & Confirmation Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm h-fit">
                <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base mb-4">
                  {isKannada ? "ಆರ್ಡರ್ ವಿವರ" : isHindi ? "ऑर्डर सारांश" : "Order Summary"}
                </h3>
                <div className="space-y-2.5 text-sm pb-4 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>{isKannada ? "ಒಟ್ಟು ಉತ್ಪನ್ನಗಳು" : isHindi ? "कुल उत्पाद संख्या" : "Total items"}</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{totalCount}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>{isKannada ? "ಡೆಲಿವರಿ ಶುಲ್ಕ" : isHindi ? "डिलीवरी" : "Farm Delivery"}</span>
                    <span className="font-semibold text-emerald-600">
                      {isKannada ? "ಉಚಿತ (ರೈತ ಸೇವೆ)" : isHindi ? "निःशुल्क (किसान सेवा)" : "FREE (Farmer Service)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>{isKannada ? "ಪಾವತಿ ವಿಧಾನ" : isHindi ? "भुगतान विधि" : "Payment Mode"}</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {isKannada ? "ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ" : isHindi ? "डिलीवरी पर नकद (Kisan Pay)" : "Cash on Delivery"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 text-base font-extrabold text-stone-900 dark:text-stone-100">
                  <span>{isKannada ? "ಒಟ್ಟು ಮೊತ್ತ" : isHindi ? "कुल देय राशि" : "Grand Total"}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-lg">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={handleManualOrder}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isKannada ? "ಆರ್ಡರ್ ಖಚಿತಪಡಿಸಿ" : isHindi ? "ऑर्डर दर्ज करें (पुष्टि करें)" : "Confirm Order"}</span>
                </button>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center mt-3">
                  {isKannada
                    ? "ವಾಯ್ಸ್ ಮೂಲಕ: ಮೈಕ್ ಒತ್ತಿ 'ಆರ್ಡರ್ ಮಾಡು' ಎಂದು ಹೇಳಬಹುದು."
                    : isHindi
                    ? "सुरक्षा नियम: बिना स्पष्ट पुष्टि के कभी भी वित्तीय ऑर्डर नहीं होता।"
                    : "Safety rule: Financial orders are never placed without explicit confirmation."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLACED ORDERS VIEW */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <Package className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                {isKannada ? "ಯಾವುದೇ ಹಿಂದಿನ ಆರ್ಡರ್‌ಗಳು ಇಲ್ಲ" : isHindi ? "कोई पिछला ऑर्डर नहीं मिला" : "No previous orders found"}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                {isKannada
                  ? "ನೀವು ಮಾಡಿದ ಆರ್ಡರ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ."
                  : isHindi
                  ? "आपके द्वारा पुष्ट किए गए सभी ऑर्डर्स यहाँ दिखेंगे।"
                  : "All orders confirmed by voice or tap will appear here."}
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                        {ord.orderNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {isKannada ? `ದಿನಾಂಕ: ${ord.date}` : isHindi ? `दिनांक: ${ord.date}` : `Date: ${ord.date}`} •{" "}
                      {ord.paymentMethod}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-stone-500 dark:text-stone-400 block">
                      {isKannada ? "ಒಟ್ಟು ಮೊತ್ತ" : isHindi ? "कुल मूल्य" : "Total Amount"}
                    </span>
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                      ₹{ord.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span className="font-medium text-stone-800 dark:text-stone-200">{item.name}</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isKannada
                        ? `ರವಾನೆ ವಿಳಾಸ: ${ord.deliveryAddress}`
                        : isHindi
                        ? `वितरण पता: ${ord.deliveryAddress}`
                        : `Delivery: ${ord.deliveryAddress}`}
                    </span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {isKannada ? "ಪರಿಶೀಲಿಸಿದ ಟ್ರ್ಯಾಕಿಂಗ್" : isHindi ? "सत्यापित ट्रैकिंग" : "Verified Tracking"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
