"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

export type CartItem = {
  id: string;
  photoSrc: string;
  title: string;
  location: string;
  categorySlug: string;
  photoSlug: string;
  size: string;
  dimensions: string;
  framing: string;
  frameColor?: string;
  paper: string;
  price: string;
  priceValue: number;
  qty: number;
};

const STORAGE_KEY = "nwi-cart";
const EMPTY_ITEMS: CartItem[] = [];

// Module-level store, synced with localStorage via useSyncExternalStore. A
// plain useState+useEffect pair would set state synchronously inside the
// effect (cascading renders) and risks a hydration mismatch between the
// server's empty cart and whatever was in the browser's localStorage.
let cartItems: CartItem[] = EMPTY_ITEMS;
let storeHydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    // Storage may be unavailable (private mode, quota) — cart still works in-memory.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!storeHydrated) {
    storeHydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) cartItems = JSON.parse(raw);
    } catch {
      // Ignore malformed/inaccessible storage — start from an empty cart.
    }
  }
  return cartItems;
}

function getServerSnapshot() {
  return EMPTY_ITEMS;
}

export function cartItemId(
  photoSrc: string,
  size: string,
  framing: string,
  color = "",
  paper = ""
): string {
  return `${photoSrc}__${size}__${framing}__${color}__${paper}`;
}

function addItemToStore(item: Omit<CartItem, "qty">, qty: number) {
  const existing = cartItems.find((i) => i.id === item.id);
  cartItems = existing
    ? cartItems.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i))
    : [...cartItems, { ...item, qty }];
  persist();
  notify();
}

function removeItemFromStore(id: string) {
  cartItems = cartItems.filter((i) => i.id !== id);
  persist();
  notify();
}

function setQtyInStore(id: string, qty: number) {
  cartItems =
    qty <= 0 ? cartItems.filter((i) => i.id !== id) : cartItems.map((i) => (i.id === id ? { ...i, qty } : i));
  persist();
  notify();
}

function clearCartStore() {
  cartItems = EMPTY_ITEMS;
  persist();
  notify();
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<CartContextValue>(() => {
    const totalCount = items.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.priceValue * i.qty, 0);
    return {
      items,
      addItem: (item, qty = 1) => addItemToStore(item, qty),
      removeItem: removeItemFromStore,
      setQty: setQtyInStore,
      clearCart: clearCartStore,
      totalCount,
      totalPrice,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
