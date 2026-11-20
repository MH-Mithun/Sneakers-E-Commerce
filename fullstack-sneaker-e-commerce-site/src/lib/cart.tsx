"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  size: string;
  quantity: number;
  maxStock: number;
};

type CartCtx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (productId: number, size: string, qty: number) => void;
  remove: (productId: number, size: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "solehouse-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback<CartCtx["add"]>((item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.productId === item.productId && p.size === item.size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = {
          ...next[i],
          maxStock: item.maxStock,
          quantity: Math.min(item.maxStock, 10, next[i].quantity + qty),
        };
        return next;
      }
      return [...prev, { ...item, quantity: Math.min(item.maxStock, 10, qty) }];
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback<CartCtx["setQuantity"]>((productId, size, qty) => {
    setItems((prev) =>
      prev
        .map((p) =>
          p.productId === productId && p.size === size
            ? { ...p, quantity: Math.max(0, Math.min(p.maxStock, 10, qty)) }
            : p,
        )
        .filter((p) => p.quantity > 0),
    );
  }, []);

  const remove = useCallback<CartCtx["remove"]>((productId, size) => {
    setItems((prev) => prev.filter((p) => !(p.productId === productId && p.size === size)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotalCents: items.reduce((n, i) => n + i.quantity * i.priceCents, 0),
      open,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, ready, open, add, setQuantity, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
