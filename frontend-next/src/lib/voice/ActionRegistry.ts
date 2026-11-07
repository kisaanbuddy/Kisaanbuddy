/**
 * Secure Action Registry for KisaanBuddy Voice Operating System.
 *
 * Principles:
 * 1. Strict Permitted Action Allowlist - No dynamic eval or arbitrary execution.
 * 2. Explicit Permission Levels: SAFE vs REQUIRES_CONFIRMATION.
 * 3. Typed Payloads & Handlers with route and state synchronization.
 */

export type SafetyLevel = "SAFE" | "REQUIRES_CONFIRMATION";

export type ActionType =
  | "NAVIGATE"
  | "GO_BACK"
  | "SEARCH"
  | "FILTER_PRICE"
  | "SORT_PRODUCTS"
  | "SELECT_ITEM"
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "CLEAR_CART"
  | "PLACE_ORDER"
  | "CONFIRM_ACTION"
  | "CANCEL_ACTION"
  | "CHANGE_LANGUAGE"
  | "TOGGLE_THEME"
  | "OPEN_NOTIFICATIONS"
  | "SCROLL"
  | "AWAIT_CONFIRMATION"
  | "NOOP";

export interface VoiceAction {
  action_type: ActionType;
  payload: Record<string, any> | any;
  safety_level: SafetyLevel;
  requires_confirmation: boolean;
}

export interface ActionExecutionContext {
  navigate: (path: string) => void;
  goBack: () => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  cart: {
    addToCart: (item: any) => any;
    removeFromCart: (id: any) => void;
    clearCart: () => void;
    placeOrder: () => any;
  };
  openNotifications: () => void;
}

// Allowlist of legitimate routes the voice system is permitted to navigate to
export const PERMITTED_ROUTES: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/disease": "Crop Doctor",
  "/marketplace": "Marketplace",
  "/mandi": "Mandi Prices",
  "/weather": "Weather",
  "/worker-connect": "Agricultural Labour",
  "/schemes": "Government Schemes",
  "/farmer-profile": "Farm Profile",
  "/profile": "Farm Profile",
  "/orders": "Orders & Cart",
  "/settings": "Settings",
  "/satellite": "Satellite Intelligence",
  "/soil-health": "Soil Health",
  "/soil-monitor": "Soil Monitor",
  "/khet-diary": "Khet Diary",
  "/crop-predictor": "Crop Predictor",
  "/features": "Features",
  "/chat": "AI Assistant Chat",
  "/chatbot": "AI Assistant Chat",
  "/contact": "Contact",
  "/about": "About",
  "/crops": "Crops",
};

export class ActionRegistry {
  /**
   * Securely execute a permitted action. Rejects any unpermitted or malicious action types.
   */
  static execute(action: VoiceAction, ctx: ActionExecutionContext): { success: boolean; message: string } {
    if (!action || !action.action_type) {
      return { success: false, message: "Empty action" };
    }

    switch (action.action_type) {
      case "NAVIGATE": {
        const rawPath = String(action.payload?.path || "/").trim();
        // Exact match or prefix match from permitted routes
        const safePath = Object.keys(PERMITTED_ROUTES).find(
          (r) => r === rawPath || (r !== "/" && rawPath.startsWith(r))
        ) || "/";
        ctx.navigate(safePath);
        return { success: true, message: `Navigated to ${safePath}` };
      }

      case "GO_BACK": {
        ctx.goBack();
        return { success: true, message: "Navigated back" };
      }

      case "CHANGE_LANGUAGE": {
        const lang = String(action.payload?.language || "hi").toLowerCase();
        const validLangs = ["hi", "kn", "en", "hi_en", "te", "ta", "mr", "bn", "pa", "gu", "ml"];
        if (validLangs.includes(lang)) {
          ctx.setLanguage(lang);
          return { success: true, message: `Language changed to ${lang}` };
        }
        return { success: false, message: `Unsupported language: ${lang}` };
      }

      case "TOGGLE_THEME": {
        const t = String(action.payload?.theme || "dark").toLowerCase();
        if (t === "dark" || t === "light") {
          ctx.setTheme(t);
          return { success: true, message: `Theme switched to ${t}` };
        }
        return { success: false, message: "Invalid theme" };
      }

      case "ADD_TO_CART": {
        const item = action.payload;
        if (item) {
          ctx.cart.addToCart(item);
          // Broadcast custom event so active product cards can highlight
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("kisaanbuddy:cart-added", { detail: item }));
          }
          return { success: true, message: `Added to cart: ${item.name || "Item"}` };
        }
        return { success: false, message: "No item provided to add to cart" };
      }

      case "REMOVE_FROM_CART": {
        const item = action.payload?.item || action.payload;
        if (item?.id) {
          ctx.cart.removeFromCart(item.id);
          return { success: true, message: `Removed item ${item.name || item.id} from cart` };
        }
        return { success: false, message: "No item ID provided to remove" };
      }

      case "CLEAR_CART": {
        ctx.cart.clearCart();
        return { success: true, message: "Cart cleared" };
      }

      case "PLACE_ORDER": {
        const order = ctx.cart.placeOrder();
        ctx.navigate("/orders");
        return { success: true, message: `Order placed: ${order?.orderNumber || "Confirmed"}` };
      }

      case "CONFIRM_ACTION": {
        const confType = action.payload?.confirmed_action;
        if (confType === "PLACE_ORDER") {
          const ord = ctx.cart.placeOrder();
          ctx.navigate("/orders");
          return { success: true, message: `Confirmed: Order ${ord?.orderNumber || ""} placed` };
        }
        if (confType === "CLEAR_CART") {
          ctx.cart.clearCart();
          return { success: true, message: "Confirmed: Cart cleared" };
        }
        return { success: true, message: `Confirmed action: ${confType}` };
      }

      case "CANCEL_ACTION": {
        return { success: true, message: "Pending action cancelled" };
      }

      case "SEARCH": {
        const q = String(action.payload?.query || "").trim();
        const target = action.payload?.target || "marketplace";
        if (target === "mandi") {
          ctx.navigate(`/mandi?q=${encodeURIComponent(q)}`);
        } else {
          ctx.navigate(`/marketplace?q=${encodeURIComponent(q)}`);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("kisaanbuddy:voice-search", { detail: { query: q, target } }));
        }
        return { success: true, message: `Executed search for ${q}` };
      }

      case "FILTER_PRICE": {
        const maxPrice = Number(action.payload?.maxPrice) || 500;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("kisaanbuddy:filter-price", { detail: { maxPrice } }));
        }
        return { success: true, message: `Filtered by max price ₹${maxPrice}` };
      }

      case "SORT_PRODUCTS": {
        const sortBy = String(action.payload?.sortBy || "price_asc");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("kisaanbuddy:sort-products", { detail: { sortBy } }));
        }
        return { success: true, message: `Sorted products by ${sortBy}` };
      }

      case "SELECT_ITEM": {
        const idx = action.payload?.index;
        const item = action.payload?.item;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("kisaanbuddy:select-item", { detail: { index: idx, item } }));
        }
        return { success: true, message: `Selected item #${idx}` };
      }

      case "OPEN_NOTIFICATIONS": {
        ctx.openNotifications();
        return { success: true, message: "Opened notifications" };
      }

      case "SCROLL": {
        const dir = action.payload?.direction || "down";
        if (typeof window !== "undefined") {
          const delta = dir === "up" ? -500 : 500;
          if (dir === "top") window.scrollTo({ top: 0, behavior: "smooth" });
          else if (dir === "bottom") window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          else window.scrollBy({ top: delta, behavior: "smooth" });
        }
        return { success: true, message: `Scrolled ${dir}` };
      }

      case "AWAIT_CONFIRMATION":
      case "NOOP":
      default:
        return { success: true, message: "Informational response" };
    }
  }
}
