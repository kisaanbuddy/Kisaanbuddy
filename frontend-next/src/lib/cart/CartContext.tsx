"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  brand?: string;
  seller?: string;
  dealType?: "sale" | "rent";
  officialSourceUrl?: string | null;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  status: "Confirmed" | "Processing" | "Dispatched" | "Delivered";
  paymentMethod: "Cash on Delivery (Kisan Pay)" | "KCC Credit";
  deliveryAddress: string;
}

interface CartContextType {
  cart: CartItem[];
  orders: PlacedOrder[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Partial<CartItem> & { name: string; price?: number }) => CartItem;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, delta: number) => void;
  clearCart: () => void;
  placeOrder: () => PlacedOrder | null;
  totalCount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY_CART = "kisaanbuddy_cart_v1";
const STORAGE_KEY_ORDERS = "kisaanbuddy_orders_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY_CART);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        // Initial sample verified order history for farmer transparency
        const initialOrders: PlacedOrder[] = [
          {
            id: "kb-ord-001",
            orderNumber: "KB-2026-9042",
            date: "2026-11-04",
            items: [
              {
                id: "seed-wheat-hd3226",
                name: "HD-3226 Certified Wheat Seed (40 kg)",
                price: 1550,
                quantity: 2,
                category: "Certified Seeds",
                brand: "National Seeds Corporation",
                seller: "NSC Certified Agri Hub",
                dealType: "sale",
              },
            ],
            totalAmount: 3100,
            itemCount: 2,
            status: "Processing",
            paymentMethod: "Cash on Delivery (Kisan Pay)",
            deliveryAddress: "Village Farm, Plot 3",
          },
        ];
        setOrders(initialOrders);
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(initialOrders));
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, isLoaded]);

  // Save orders changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      /* ignore */
    }
  }, [orders, isLoaded]);

  const addToCart = useCallback((item: Partial<CartItem> & { name: string; price?: number }): CartItem => {
    const rawPrice = typeof item.price === "number" && !isNaN(item.price) ? item.price : 450;
    const cleanId = item.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    let addedItem: CartItem = {
      id: cleanId,
      name: item.name,
      price: rawPrice,
      quantity: item.quantity || 1,
      image: item.image,
      category: item.category || "Agricultural Supplies",
      brand: item.brand,
      seller: item.seller || "Verified Agricultural Seller",
      dealType: item.dealType || "sale",
      officialSourceUrl: item.officialSourceUrl,
    };

    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === cleanId || i.name.toLowerCase() === item.name.toLowerCase());
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + (item.quantity || 1),
        };
        addedItem = next[existingIdx];
        return next;
      }
      return [addedItem, ...prev];
    });

    return addedItem;
  }, []);

  const removeFromCart = useCallback((id: string | number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string | number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const placeOrder = useCallback((): PlacedOrder | null => {
    if (cart.length === 0) return null;

    const totalAmt = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const orderNum = `KB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: PlacedOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toISOString().split("T")[0],
      items: [...cart],
      totalAmount: totalAmt,
      itemCount: count,
      status: "Confirmed",
      paymentMethod: "Cash on Delivery (Kisan Pay)",
      deliveryAddress: "Farmer Registered Address, Village Farm",
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  }, [cart]);

  const totalCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
  const totalAmount = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        totalCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
