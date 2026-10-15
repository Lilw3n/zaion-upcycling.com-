"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = { slug: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "zaion-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((slug: string, qty = 1) => {
    setItems((current) => {
      const found = current.find((item) => item.slug === slug);
      if (!found) return [...current, { slug, qty }];
      return current.map((item) => (item.slug === slug ? { ...item, qty: Math.min(99, item.qty + qty) } : item));
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((current) => current.map((item) => (item.slug === slug ? { ...item, qty: Math.max(1, Math.min(99, qty)) } : item)));
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((current) => current.filter((item) => item.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Panier indisponible");
  return value;
}
